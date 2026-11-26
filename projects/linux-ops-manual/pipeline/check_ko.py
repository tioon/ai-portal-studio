#!/usr/bin/env python3
"""Validate Korean option notes: every key must be a flag that really exists in the official manual.

  python3 check_ko.py content/ko/tar.1.json [...]      (no args = all files)
"""
import glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import dump_options as D

files = sys.argv[1:] or sorted(glob.glob(os.path.join(HERE, "..", "content", "ko", "*.json")))
bad = 0
for f in files:
    try:
        data = json.load(open(f, encoding="utf-8"))
    except Exception as e:
        print(f"INVALID JSON {f}: {e}"); bad += 1; continue
    for cid, notes in data.items():
        if os.path.basename(f) != cid + ".json":
            print(f"{f}: top-level key {cid!r} does not match the file name"); bad += 1
        try:
            opts = D.options(cid)
        except FileNotFoundError:
            print(f"{f}: no such manual {cid}"); bad += 1; continue
        firsts = [o["flags"][0] for o in opts if o["flags"]]
        allflags = {x for o in opts for x in o["flags"]}
        unknown = [k for k in notes if k not in allflags]
        missing = [x for x in dict.fromkeys(firsts) if x not in notes]
        empty = [k for k, v in notes.items() if not isinstance(v, str) or not v.strip() or len(v) > 140]
        for k in unknown:
            print(f"{f}: {k!r} is not an option in the manual"); bad += 1
        for k in empty:
            print(f"{f}: {k!r} has an empty or over-long (>140 chars) note"); bad += 1
        if missing:
            print(f"{f}: {len(missing)} options without a note: {missing[:12]}"); bad += 1
        print(f"{cid}: {len(notes)} notes / {len(dict.fromkeys(firsts))} options")
sys.exit(1 if bad else 0)
