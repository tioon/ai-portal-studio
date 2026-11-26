#!/usr/bin/env python3
"""Download every in-scope package from the official repositories, verify its SHA-256 against the
repository index, and keep only the section 1/8 man pages (raw roff) plus a provenance manifest.

  python3 fetch.py [rocky|ubuntu|epel ...]     (resumable; safe to re-run)
"""
import concurrent.futures as cf, gzip, hashlib, json, os, subprocess, sys, tempfile, time, urllib.request, bz2, lzma
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import CACHE, MAN_RE, rocky_packages, ubuntu_packages
import scope_config as SC

MAN_DIR = os.path.join(CACHE, "man")
UA = {"User-Agent": "linux-ops-manual-datapack/1.0"}


def plan(which):
    out = []
    if "rocky" in which:
        out += [("rocky", p) for p in rocky_packages().values()]
    if "epel" in which:
        out += [("epel", p) for p in rocky_packages(["EPEL"], only=set(SC.EPEL)).values()]
    if "ubuntu" in which:
        uni = set(SC.UBUNTU_UNIVERSE)
        out += [("ubuntu", p) for p in ubuntu_packages().values() if p["component"] == "main" or p["name"] in uni]
    return out


def download(url, dest, tries=5):
    for i in range(tries):
        try:
            h = hashlib.sha256()
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r, open(dest, "wb") as f:
                while True:
                    b = r.read(1 << 16)
                    if not b:
                        break
                    h.update(b); f.write(b)
            return h.hexdigest()
        except Exception as e:  # noqa
            err = e
            time.sleep(2 + 3 * i)
    raise RuntimeError(f"download failed: {url}: {err}")


def list_and_extract(pkgfile, kind, outdir):
    """Extract man1/man8 members. Returns [{path, type, link?}]"""
    if kind == "deb":
        cmd = f"bsdtar -xOf '{pkgfile}' 'data.tar*' | bsdtar -xf - -C '{outdir}' './usr/share/man/man[18]/*' 'usr/share/man/man[18]/*'"
    else:
        cmd = f"bsdtar -xf '{pkgfile}' -C '{outdir}' './usr/share/man/man[18]/*'"
    subprocess.run(cmd, shell=True, stderr=subprocess.DEVNULL)
    files = []
    for sec in ("man1", "man8"):
        d = os.path.join(outdir, "usr/share/man", sec)
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            full = os.path.join(d, fn)
            rel = f"/usr/share/man/{sec}/{fn}"
            if os.path.islink(full):
                files.append({"path": rel, "link": os.readlink(full)})
                os.unlink(full)
                continue
            raw = open(full, "rb").read()
            try:
                if fn.endswith(".gz"): raw = gzip.decompress(raw)
                elif fn.endswith(".bz2"): raw = bz2.decompress(raw)
                elif fn.endswith(".xz"): raw = lzma.decompress(raw)
                elif fn.endswith(".zst"): raw = subprocess.run(["zstd", "-dc", full], capture_output=True).stdout
            except Exception:
                continue
            os.unlink(full)
            base = fn
            for ext in (".gz", ".bz2", ".xz", ".zst"):
                if base.endswith(ext): base = base[: -len(ext)]
            with open(os.path.join(d, base), "wb") as f:
                f.write(raw)
            files.append({"path": rel, "file": f"{sec}/{base}", "bytes": len(raw)})
    return files


def do_one(distro, p):
    pdir = os.path.join(MAN_DIR, distro, p["name"])
    mf = os.path.join(pdir, "manifest.json")
    if os.path.exists(mf):
        return "cached"
    base = dict(distro=distro, package=p["name"], version=p["version"], url=p["url"], size=p["size"],
                repo=p.get("repo") or f"{p.get('pocket')}/{p.get('component')}", summary=p.get("summary", ""),
                source=p.get("srpm", ""), sha256_expected=p.get("sha256", ""))
    os.makedirs(pdir, exist_ok=True)
    if p["size"] > SC.MAX_PKG_BYTES:
        json.dump(dict(base, skipped="too-large", files=[]), open(mf, "w"))
        return "skipped"
    with tempfile.TemporaryDirectory(dir=CACHE) as td:
        pk = os.path.join(td, "pkg")
        got = download(p["url"], pk)
        if base["sha256_expected"] and got != base["sha256_expected"]:
            raise RuntimeError(f"sha256 mismatch for {p['url']}")
        ex = os.path.join(td, "x"); os.makedirs(ex)
        files = list_and_extract(pk, "deb" if p["url"].endswith(".deb") else "rpm", ex)
        root = os.path.join(ex, "usr/share/man")
        for f in files:
            if "file" in f:
                dst = os.path.join(pdir, f["file"])
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                os.replace(os.path.join(root, f["file"]), dst)
    json.dump(dict(base, sha256=got, verified=bool(base["sha256_expected"]), files=files,
                   fetched=time.strftime("%Y-%m-%d")), open(mf, "w"))
    return "ok"


def main():
    which = sys.argv[1:] or ["rocky", "epel", "ubuntu"]
    jobs = plan(which)
    jobs.sort(key=lambda j: j[1]["size"])
    print(f"{len(jobs)} packages, {sum(j[1]['size'] for j in jobs)/1e6:.0f} MB", flush=True)
    stats = {}; fails = []; t0 = time.time()
    with cf.ThreadPoolExecutor(int(os.environ.get("LOM_JOBS", "24"))) as ex:
        futs = {ex.submit(do_one, d, p): (d, p["name"]) for d, p in jobs}
        for i, fu in enumerate(cf.as_completed(futs), 1):
            try:
                r = fu.result()
            except Exception as e:
                r = "fail"; fails.append((futs[fu], str(e)[:200]))
            stats[r] = stats.get(r, 0) + 1
            if i % 100 == 0 or i == len(jobs):
                print(f"[{time.time()-t0:6.0f}s] {i}/{len(jobs)} {stats}", flush=True)
    for f in fails:
        print("FAIL", f)
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
