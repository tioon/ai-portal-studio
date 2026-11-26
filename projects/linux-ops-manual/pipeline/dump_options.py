#!/usr/bin/env python3
"""Print the option list of a command exactly as extracted from the official manual.

  python3 dump_options.py tar.1            # JSON: [{"label", "flags", "group", "text", "distros"}]
Used to write Korean notes (content/ko/*.json) from the real text instead of from memory.
"""
import html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build import OUT, safe_name, bucket
from manparse import flags_of


def sections(doc, d):
    if doc.get("doc"):
        return doc["doc"] if d in doc["src"] else None
    if d not in doc:
        return None
    if d == "u" and doc.get("same") is False:
        return [[t, doc["r"][h][1]] if isinstance(h, int) else [t, h] for t, h in doc["u"]]
    return doc[d]


def strip(s):
    s = re.sub(r"</?(?:b|i|a)(?: [^>]*)?>", "", s)          # inline markup carries no spacing
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def options(cid):
    doc = json.load(open(os.path.join(OUT, "cmd", bucket(cid), safe_name(cid) + ".json"), encoding="utf-8"))
    out, seen = [], {}
    for d in "ru":
        for title, h in sections(doc, d) or []:
            for m in re.finditer(r'<dt data-o=""(?: data-g="([^"]*)")?>(.*?)</dt>\s*((?:<dt>.*?</dt>\s*)*)<dd>(.*?)(?=</dd>\s*(?:</dl>|<dt))', h, re.S):
                label = ", ".join([strip(m.group(2))] + [strip(x) for x in re.findall(r"<dt>(.*?)</dt>", m.group(3), re.S)])
                if label in seen:
                    if d not in seen[label]["distros"]:
                        seen[label]["distros"] += d
                    continue
                raw = m.group(2) + " , " + " , ".join(re.findall(r"<dt>(.*?)</dt>", m.group(3), re.S))
                e = dict(label=label, flags=flags_of(strip(re.sub(r"</?i>", " ", raw))), group=html.unescape(m.group(1) or title), text=strip(m.group(4))[:700], distros=d)
                seen[label] = e; out.append(e)
    return out


if __name__ == "__main__":
    json.dump(options(sys.argv[1]), sys.stdout, ensure_ascii=False, indent=1)
