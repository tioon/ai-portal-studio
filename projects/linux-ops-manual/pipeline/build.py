#!/usr/bin/env python3
"""Build the data pack (../data) from the man sources collected by fetch.py.

  data/index.json          every command: name, section, one-line description, packages, option counts
  data/cmd/<b>/<id>.json   one file per command: full manual (both distros), provenance, option diff
  data/manifest.json       every package used: version, URL, SHA-256 (verified against the repo index)
  data/coverage.json       what could not be parsed / has no detectable option list
"""
import collections, glob, hashlib, json, multiprocessing as mp, os, re, shutil, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from common import CACHE
import manparse, scope_config as SC

MAN = os.path.join(CACHE, "man")
OUT = os.path.join(HERE, "..", "data")
PATH_RE = re.compile(r"/man([18])/(.+?)\.([18][a-zA-Z]*)(?:\.(?:gz|bz2|xz|zst))?$")
DISTROS = {"r": dict(key="rocky", label="Rocky Linux 9.6", dirs=["rocky", "epel"]),
           "u": dict(key="ubuntu", label="Ubuntu 22.04 LTS", dirs=["ubuntu"])}


def file_id(name, sec):
    return f"{name}.{sec}"


def safe_name(cid):
    out = []
    for ch in cid:
        if ch.islower() or ch.isdigit() or ch in ".+-_":
            out.append(ch)
        elif ch.isupper():
            out.append("^" + ch.lower())
        else:
            out.append("~%02x" % ord(ch) if ord(ch) < 256 else "~u%04x" % ord(ch))
    return "".join(out)


def bucket(cid):
    c = cid[0].lower()
    return c if c.isalnum() and c.isascii() else "_"


def pkg_rank(p, name):
    return (p["repo"] == "EPEL", p["package"] != name, "minimal" in p["package"], len(p["package"]), p["package"])


def collect(d):
    """-> pages {(name,sec): [(pkgmanifest, filepath, manpath)]}, links {(name,sec): (targetname, targetsec)}, pkgs"""
    pages, links, pkgs = collections.defaultdict(list), {}, []
    for sub in DISTROS[d]["dirs"]:
        for mf in sorted(glob.glob(os.path.join(MAN, sub, "*", "manifest.json"))):
            m = json.load(open(mf))
            m["repo"] = "EPEL" if sub == "epel" else m["repo"]
            pkgs.append(m)
            for f in m["files"]:
                pm = PATH_RE.search(f["path"])
                if not pm:
                    continue
                key = (pm.group(2), pm.group(1))
                if "link" in f:
                    tm = PATH_RE.search("/" + f["link"].lstrip("./")) or PATH_RE.search("/man%s/%s" % (pm.group(1), os.path.basename(f["link"])))
                    if tm:
                        links.setdefault(key, (tm.group(2), tm.group(1)))
                    continue
                full = os.path.join(os.path.dirname(mf), f["file"])
                if os.path.exists(full):
                    pages[key].append((m, full, f["path"]))
    return pages, links, pkgs


BOLD_FLAG = re.compile(r"<b>(-{1,2}[A-Za-z0-9][\w-]*)</b>")


def unlisted(doc):
    """Flags printed in bold somewhere in the manual that have no entry in the extracted option table
    (aliases shown only in SYNOPSIS, options described in running text, example values...)."""
    have = {f for o in doc["opts"] for f in o[1]}
    bold = {m.group(1) for _, h in doc["secs"] for m in BOLD_FLAG.finditer(h)}
    return sorted(x for x in bold - have
                  if not (re.fullmatch(r"-[A-Za-z0-9]{2,}", x) and all("-" + c in have for c in x[1:])))


def parse_job(args):
    d, key, full = args
    try:
        raw = open(full, "rb").read()
        so = manparse.so_target(raw)
        if so:
            return d, key, {"so": so}
        doc = manparse.render(full)
        return d, key, doc or {"fail": "mandoc produced no manual text"}
    except Exception as e:  # noqa
        return d, key, {"fail": repr(e)[:200]}


def main():
    t0 = time.time()
    chosen, links, allpkgs, alts = {}, {}, {}, {}
    for d in DISTROS:
        pages, lk, pkgs = collect(d)
        allpkgs[d], links[d] = pkgs, lk
        for key, cands in pages.items():
            cands.sort(key=lambda c: pkg_rank(c[0], key[0]))
            chosen[(d, key)] = cands[0]
            if len(cands) > 1:
                alts[(d, key)] = [c[0]["package"] for c in cands[1:]]
    print(f"pages: rocky={sum(1 for k in chosen if k[0]=='r')} ubuntu={sum(1 for k in chosen if k[0]=='u')}", flush=True)

    with mp.Pool() as pool:
        res = pool.map(parse_job, [(d, key, c[1]) for (d, key), c in chosen.items()], chunksize=20)
    docs, fails = {}, []
    dup = collections.Counter()
    for d, key, doc in res:
        if "so" in doc:
            links[d].setdefault(key, tuple(doc["so"]))
        elif "fail" in doc:
            fails.append(dict(distro=DISTROS[d]["key"], name=key[0], sec=key[1], package=chosen[(d, key)][0]["package"], why=doc["fail"]))
        else:
            docs[(d, key)] = doc
    # the same manual shipped under several names (gcc cross-compilers, g++ = gcc, ...) is stored once
    for d in DISTROS:
        seen = {}
        for key in sorted((k for (dd, k) in docs if dd == d), key=lambda k: (len(k[0]), k[0], k[1])):
            hsh = hashlib.sha1(json.dumps(docs[(d, key)]["secs"], ensure_ascii=False).encode()).hexdigest()
            if hsh in seen and len(json.dumps(docs[(d, key)]["secs"])) > 3000:
                links[d][key] = seen[hsh]; del docs[(d, key)]; dup[d] += 1
            else:
                seen.setdefault(hsh, key)
    for d in DISTROS:  # configured aliases (Debian alternatives etc.)
        for a, t in SC.ALIASES[DISTROS[d]["key"]].items():
            for sec in "18":
                if (d, (t, sec)) in docs and (d, (a, sec)) not in docs:
                    links[d].setdefault((a, sec), (t, sec))
                    break

    def resolve(d, key, depth=0):
        if (d, key) in docs:
            return key
        t = links[d].get(key)
        if t and depth < 5 and t != key:
            return resolve(d, t, depth + 1)
        return None

    shutil.rmtree(os.path.join(OUT, "cmd"), ignore_errors=True)
    pkg_idx = {d: {} for d in DISTROS}
    pkg_rows = {d: [] for d in DISTROS}

    def pidx(d, m):
        if m["package"] not in pkg_idx[d]:
            pkg_idx[d][m["package"]] = len(pkg_rows[d])
            pkg_rows[d].append([m["package"], m["version"], m["repo"], re.sub(r"\s+", " ", m.get("summary", ""))[:120], 0])
        i = pkg_idx[d][m["package"]]
        pkg_rows[d][i][4] += 1
        return i

    keys = sorted({k for (_, k) in docs} | {k for d in DISTROS for k in links[d]}, key=lambda k: (k[0].lower(), k[0], k[1]))
    rows, noopt, total_bytes, nfiles = [], [], 0, 0
    stats = collections.Counter()
    audit = collections.Counter()
    for key in keys:
        name, sec = key
        have = {d: (d, key) in docs for d in DISTROS}
        if any(have.values()):
            cid = file_id(name, sec)
            out = dict(id=cid, n=name, s=sec, src={}, nopt={})
            per = {}
            for d in DISTROS:
                if not have[d]:
                    # the other distro may reach this page through an alias
                    t = resolve(d, key)
                    if t:
                        out.setdefault("alias", {})[d] = file_id(*t)
                    continue
                doc = docs[(d, key)]; m, _full, mpath = chosen[(d, key)]
                out["src"][d] = dict(pkg=m["package"], ver=m["version"], repo=m["repo"], url=m["url"], path=mpath,
                                     sha256=m.get("sha256", ""), date=doc["date"], origin=doc["source"])
                if (d, key) in alts:
                    out["src"][d]["also"] = alts[(d, key)]
                out["nopt"][d] = len(doc["opts"])
                ms = unlisted(doc)
                if ms:
                    out.setdefault("miss", {})[d] = ms[:60]
                    audit["with_unlisted"] += 1
                elif doc["opts"]:
                    audit["table_covers_all_bold_flags"] += 1
                per[d] = doc
            ds = list(per)
            out["desc"] = per[ds[0]]["desc"] or (per[ds[-1]]["desc"] if len(ds) > 1 else "")
            if len(ds) == 2 and per["r"]["secs"] == per["u"]["secs"]:
                out["same"] = True; out["doc"] = per["r"]["secs"]; stats["identical"] += 1
            elif len(ds) == 2:
                out["same"] = False; out["r"] = per["r"]["secs"]
                ridx = {}
                for i, (t, h) in enumerate(per["r"]["secs"]):
                    ridx.setdefault((t, h), i)
                # a section identical to Rocky's is stored once: [title, <index into r>]
                out["u"] = [[t, ridx[(t, h)]] if (t, h) in ridx else [t, h] for t, h in per["u"]["secs"]]
                fr = {f for o in per["r"]["opts"] for f in o[1]}; fu = {f for o in per["u"]["opts"] for f in o[1]}
                out["diff"] = dict(r=sorted(fr - fu), u=sorted(fu - fr)); stats["differs"] += 1
                if fr != fu:
                    stats["option_set_differs"] += 1
            else:
                out[ds[0]] = per[ds[0]]["secs"]; stats["only_" + DISTROS[ds[0]]["key"]] += 1
            path = os.path.join(OUT, "cmd", bucket(cid), safe_name(cid) + ".json")
            os.makedirs(os.path.dirname(path), exist_ok=True)
            blob = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
            with open(path, "w", encoding="utf-8") as f:
                f.write(blob)
            total_bytes += len(blob.encode()); nfiles += 1
            if not any(out["nopt"].values()):
                noopt.append(cid)
            rows.append([name, sec, out["desc"][:160],
                         pidx("r", chosen[("r", key)][0]) if have["r"] else -1,
                         pidx("u", chosen[("u", key)][0]) if have["u"] else -1,
                         out["nopt"].get("r", 0), out["nopt"].get("u", 0),
                         out.get("alias", {}).get("r", 0), out.get("alias", {}).get("u", 0)])
        else:
            tr, tu = resolve("r", key), resolve("u", key)
            if not (tr or tu):
                continue
            t = tr or tu
            desc = docs[("r" if tr else "u", t)]["desc"]
            rows.append([name, sec, desc[:160], -1, -1, 0, 0, file_id(*tr) if tr else 0, file_id(*tu) if tu else 0])
            stats["alias_rows"] += 1

    gen = time.strftime("%Y-%m-%d")
    meta = dict(generated=gen, schema=1,
                distros={d: dict(key=v["key"], label=v["label"], packages=len(pkg_rows[d]),
                                 pages=sum(1 for r in rows if r[3 if d == "r" else 4] >= 0)) for d, v in DISTROS.items()},
                sources=dict(r="https://dl.rockylinux.org/vault/rocky/9.6/ (BaseOS, AppStream) + EPEL 9 (선별)",
                             u="http://archive.ubuntu.com/ubuntu/ jammy, jammy-updates, jammy-security (main + universe 선별)"),
                counts=dict(commands=len(rows), files=nfiles, **stats), audit=dict(audit))
    json.dump(dict(meta=meta, pkgs=pkg_rows, cmds=rows), open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    man = []
    for d in DISTROS:
        for m in allpkgs[d]:
            man.append(dict(distro=DISTROS[d]["key"], package=m["package"], version=m["version"], repo=m["repo"], url=m["url"],
                            sha256=m.get("sha256", ""), verified=m.get("verified", False), skipped=m.get("skipped", ""),
                            pages=sum(1 for f in m["files"] if "file" in f), fetched=m.get("fetched", "")))
    json.dump(dict(generated=gen, packages=man), open(os.path.join(OUT, "manifest.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(dict(generated=gen, parse_failures=fails, no_option_list=noopt, counts=dict(stats),
                   skipped_packages=[m for m in man if m["skipped"]]),
              open(os.path.join(OUT, "coverage.json"), "w"), ensure_ascii=False, indent=0)
    print(json.dumps(meta, ensure_ascii=False, indent=1))
    print(f"files={nfiles} cmd_bytes={total_bytes/1e6:.1f}MB index={os.path.getsize(os.path.join(OUT,'index.json'))/1e6:.2f}MB "
          f"fails={len(fails)} no_option_list={len(noopt)} time={time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
