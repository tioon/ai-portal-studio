#!/usr/bin/env python3
"""Link the hand-written Korean cards (content/cards.json, content/ko/*.json) to the official manuals.

Every flag a card mentions is checked against the option list extracted from the real man page of that
distro. Confirmed flags become Korean hints on the option table; unconfirmed ones are reported in
data/coverage.json (they are still shown on the card, but without the "매뉴얼 확인" mark).
"""
import glob, html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build import OUT, safe_name, bucket
import dump_options

idx = json.load(open(os.path.join(OUT, "index.json"), encoding="utf-8"))
COL = {"r": (3, 7), "u": (4, 8)}
rows = {f"{r[0]}.{r[1]}": r for r in idx["cmds"]}


def resolve(name, d):
    """command name -> id of the page that documents it on distro d (follows aliases)"""
    for sec in "18":
        r = rows.get(f"{name}.{sec}")
        if not r:
            continue
        if r[COL[d][0]] >= 0:
            return f"{name}.{sec}"
        if r[COL[d][1]]:
            return r[COL[d][1]]
    return None


_flag_cache = {}


def flagset(cid, d):
    if cid not in _flag_cache:
        _flag_cache[cid] = dump_options.options(cid)
    return {f for o in _flag_cache[cid] if d in o["distros"] for f in o["flags"]}


def lead_tokens(code):
    out = []
    for seg in re.split(r"&&|\|\||[|;]|\$\(|`", code):
        toks = seg.strip().split()
        while toks and (toks[0] in ("sudo", "time", "nohup", "watch", "xargs", "exec", "env") or re.match(r"^\w+=", toks[0]) or toks[0].startswith("-")):
            toks.pop(0)
        if toks and re.match(r"^[A-Za-z0-9_.+\-]+$", toks[0]):
            out.append(toks[0])
    return out


def pick(v, d):
    return v[d] if isinstance(v, dict) else v


src = json.load(open(os.path.join(HERE, "..", "content", "cards.json"), encoding="utf-8"))
ko, by_cmd, unconfirmed, confirmed = {}, {}, [], 0
for ci, card in enumerate(src["cards"]):
    card["cmds"] = {}
    for d in "ru":
        title = pick(card["title"], d)
        prim = []
        for part in re.split(r"[/,&]", title):
            w = part.strip().split()
            for cand in ([" ".join(w[:2]).replace(" ", "-"), w[0]] if len(w) > 1 else w[:1]):
                t = resolve(cand, d) if re.match(r"^[A-Za-z0-9_.+\-]+$", cand or "") else None
                if t:
                    if t not in prim:
                        prim.append(t)
                    break
        rel = []
        for code in [pick(card["command"], d)] + [e["code"] for e in card[d]["examples"]] + [o["flag"] for o in card[d]["options"]]:
            for tok in lead_tokens(code):
                t = resolve(tok, d)
                if t and t not in prim and t not in rel:
                    rel.append(t)
        card["cmds"][d] = dict(primary=prim, related=rel)
        for cid in prim:
            by_cmd.setdefault(cid, {}).setdefault(d, [])
            if ci not in by_cmd[cid][d]:
                by_cmd[cid][d].append(ci)
        for o in card[d]["options"]:
            toks = o["flag"].split()
            target, flag = None, None
            if toks and toks[0].startswith("-") and len(prim) == 1:
                target, flag = prim[0], toks[0]
            elif toks and resolve(toks[0], d):
                fl = [t for t in toks[1:] if t.startswith("-")]
                if len(fl) == 1:
                    target, flag = resolve(toks[0], d), fl[0]
            if not target:
                continue
            flag = flag.split("=")[0].rstrip(",")
            fs = flagset(target, d)
            if flag in fs:
                ko.setdefault(target, {}).setdefault(flag, o["desc"]); o["ok"] = target; confirmed += 1
            elif re.match(r"^-[A-Za-z0-9]{2,}$", flag) and all("-" + ch in fs for ch in flag[1:]):
                o["ok"] = target; confirmed += 1   # combined short flags, each one exists
            else:
                unconfirmed.append(dict(card=card["id"], distro=d, command=target, flag=o["flag"]))

# extra Korean option notes: content/ko/<command>.json  {"<id>": {"-x": "설명", ...}}
bad_ko = []
for f in sorted(glob.glob(os.path.join(HERE, "..", "content", "ko", "*.json"))):
    for cid, m in json.load(open(f, encoding="utf-8")).items():
        if cid not in rows:
            bad_ko.append(dict(file=os.path.basename(f), command=cid, flag="*")); continue
        name = cid.rsplit(".", 1)[0]
        fs = set()
        for d in "ru":
            t = resolve(name, d)
            if t:
                fs |= flagset(t, d)
        for flag, desc in m.items():
            if flag in fs:
                ko.setdefault(cid, {})[flag] = desc
            else:
                bad_ko.append(dict(file=os.path.basename(f), command=cid, flag=flag))

json.dump(dict(categories=src["categories"], scenarios=src["scenarios"], cards=src["cards"], ko=ko, byCmd=by_cmd),
          open(os.path.join(OUT, "curated.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
cov_p = os.path.join(OUT, "coverage.json")
cov = json.load(open(cov_p, encoding="utf-8"))
cov["curated"] = dict(cards=len(src["cards"]), flags_confirmed=confirmed, flags_unconfirmed=unconfirmed,
                      ko_notes=sum(len(v) for v in ko.values()), ko_rejected=bad_ko)
json.dump(cov, open(cov_p, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"cards={len(src['cards'])} commands_with_cards={len(by_cmd)} flags confirmed={confirmed} unconfirmed={len(unconfirmed)} "
      f"ko_notes={sum(len(v) for v in ko.values())} ko_rejected={len(bad_ko)}")
for u in unconfirmed[:400]:
    print("  ?", u["card"], u["distro"], u["command"], "|", u["flag"])
nop = [c["id"] for c in src["cards"] if not c["cmds"]["r"]["primary"] and not c["cmds"]["u"]["primary"]]
print("cards without a primary command:", nop)
