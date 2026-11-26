#!/usr/bin/env python3
"""Attach community examples from tldr-pages (CC BY 4.0) to commands that exist in the data pack.

Reads $LOM_CACHE/tldr/x (the unpacked release zip, see fetch_meta.py), writes data/tldr/<b>/<id>.json and
marks the command in data/index.json (column 9: 0 none, 1 English, 2 Korean). These are NOT official
documentation and are labelled as such in the UI.
"""
import json, os, re, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from common import CACHE
from build import OUT, safe_name, bucket

SRC = os.path.join(CACHE, "tldr", "x")
VERSION = open(os.path.join(CACHE, "tldr", "VERSION")).read().strip() if os.path.exists(os.path.join(CACHE, "tldr", "VERSION")) else ""


def parse(path):
    desc, items, cur = [], [], None
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if line.startswith("> "):
            if not re.match(r"^> (More information|더 많은 정보|See also|같이 보기)", line):
                desc.append(line[2:])
        elif line.startswith("- "):
            cur = line[2:].rstrip(":").strip()
        elif line.startswith("`") and line.endswith("`") and cur is not None:
            items.append([cur, line[1:-1]]); cur = None
    return " ".join(desc), items


def page(lang, name):
    for plat in ("linux", "common"):
        p = os.path.join(SRC, "pages" if lang == "en" else f"pages.{lang}", plat, name + ".md")
        if os.path.exists(p):
            return p
    return None


idx_p = os.path.join(OUT, "index.json")
idx = json.load(open(idx_p, encoding="utf-8"))
shutil.rmtree(os.path.join(OUT, "tldr"), ignore_errors=True)
names = {f[:-3] for plat in ("linux", "common") for f in os.listdir(os.path.join(SRC, "pages", plat)) if f.endswith(".md")}
n = {0: 0, 1: 0, 2: 0}
total = 0
for row in idx["cmds"]:
    del row[9:]
    name, sec = row[0], row[1]
    flag = 0
    # one page per command name; the section-1 manual wins when both 1 and 8 exist
    if name in names and not (sec == "8" and any(r[0] == name and r[1] == "1" for r in idx["cmds"] if r[0] == name)):
        ko, en = page("ko", name), page("en", name)
        lang, p = ("ko", ko) if ko else ("en", en)
        desc, items = parse(p)
        if lang == "ko" and not items and en:
            lang, (desc, items) = "en", parse(en)
        if items:
            cid = f"{name}.{sec}"
            out = os.path.join(OUT, "tldr", bucket(cid), safe_name(cid) + ".json")
            os.makedirs(os.path.dirname(out), exist_ok=True)
            json.dump(dict(id=cid, lang=lang, desc=desc, items=items, version=VERSION,
                           source=f"https://github.com/tldr-pages/tldr/blob/main/{os.path.relpath(p, SRC)}"),
                      open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
            flag = 2 if lang == "ko" else 1
            total += len(items)
    row.append(flag); n[flag] += 1
idx["meta"]["tldr"] = dict(version=VERSION, license="CC BY 4.0", commands=n[1] + n[2], korean=n[2], examples=total)
json.dump(idx, open(idx_p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"tldr {VERSION}: commands with examples={n[1]+n[2]} (korean={n[2]}) examples={total}")
