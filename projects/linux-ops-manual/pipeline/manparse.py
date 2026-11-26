"""roff man page -> compact, sanitized HTML sections with option entries marked.

mandoc renders the roff source; this module rebuilds its HTML into a small whitelist of tags and tags
every option definition (`<dt data-o>`), so the web app can list all options of a command without any
hand-written data. Nothing is paraphrased: text is the manual's own.
"""
import html, re, subprocess
from html.parser import HTMLParser

VOID = {"br", "hr", "col", "img", "wbr"}
OPT_RE = re.compile(r"^\s*(?:\[!\]\s*)?[\[({<]?\s*(?:\+\|)?(?:-{1,2}[A-Za-z0-9?@#%:!]|\+[A-Za-z]|-\s*$|--\s*$)")
FLAG_RE = re.compile(r"(?<![\w\-])(-{1,2}[A-Za-z0-9?@#%!][\w\-.+:]*|-)(?![\w])")


class Node:
    __slots__ = ("tag", "attrs", "kids")

    def __init__(self, tag, attrs=None):
        self.tag, self.attrs, self.kids = tag, dict(attrs or {}), []

    @property
    def cls(self):
        return (self.attrs.get("class") or "").split()


class _Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root"); self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs); self.stack[-1].kids.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].kids.append(Node(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].kids.append(data)


def text(n, skip=()):
    if isinstance(n, str):
        return n
    if n.tag in skip:
        return ""
    return "".join(text(k, skip) for k in n.kids)


def flag_text(n):
    """Like text(), but italic runs (option arguments such as `-b<i>n</i>`) are set apart by spaces
    so that the flag is read as `-b`, not `-bn`."""
    if isinstance(n, str):
        return n
    inner = "".join(flag_text(k) for k in n.kids)
    return f" {inner} " if n.tag in ("i", "em", "var", "u", "cite") else inner


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def find(n, pred):
    if isinstance(n, str):
        return
    if pred(n):
        yield n
        return
    for k in n.kids:
        yield from find(k, pred)


INLINE = {"b": "b", "strong": "b", "i": "i", "em": "i", "u": "i", "var": "i", "cite": "i", "code": "b",
          "kbd": "b", "samp": "b", "tt": "b"}
BLOCK = {"p": "p", "dl": "dl", "dt": "dt", "dd": "dd", "pre": "pre", "ul": "ul", "ol": "ol", "li": "li",
         "table": "table", "tr": "tr", "td": "td", "th": "th", "br": "br"}


def is_opt_text(s):
    return bool(OPT_RE.match(s)) and len(s) < 400


def flags_of(s):
    return [m.group(1).rstrip(".:") for m in FLAG_RE.finditer(s) if m.group(1) != "-"]


class Section:
    def __init__(self, title):
        self.title = title; self.out = []; self.opts = []; self.group = ""; self.pre = 0

    # --- serialisation of a sanitized subset -------------------------------------------------
    def emit(self, n):
        if isinstance(n, str):
            self.out.append(html.escape(n if self.pre else re.sub(r"\s+", " ", n), quote=False))
            return
        t = n.tag
        if t in ("h1", "script", "style"):
            return
        if t == "h2":
            self.group = norm(text(n))
            self.out.append("<h3>%s</h3>" % html.escape(self.group, quote=False))
            return
        if t == "section" and "Ss" in n.cls:
            h2 = next((k for k in n.kids if not isinstance(k, str) and k.tag == "h2"), None)
            if h2 is not None and is_opt_text(norm(text(h2))) and len(norm(text(h2))) < 200:
                dt, dd = Node("dt"), Node("dd")
                dt.kids = h2.kids
                dd.kids = [k for k in n.kids if k is not h2]
                self.out.append("<dl>"); self.term([dt], dd); self.out.append("</dl>")
                return
        if t == "dl":
            self.emit_dl(n)
            return
        if t == "a":
            href = n.attrs.get("href", "")
            if re.match(r"^(https?://|mailto:)", href) and "permalink" not in n.cls:
                self.out.append('<a href="%s">' % html.escape(href, quote=True))
                self.kids(n); self.out.append("</a>")
            else:
                self.kids(n)
            return
        if t == "div" and ("Bd-indent" in n.cls or "Bl-tag" in n.cls):
            self.out.append('<div class="in">'); self.kids(n); self.out.append("</div>")
            return
        if t in INLINE:
            m = INLINE[t]
            self.out.append(f"<{m}>"); self.kids(n); self.out.append(f"</{m}>")
            return
        if t in BLOCK:
            if t == "br":
                self.out.append("<br>")
                return
            if t == "pre":
                self.pre += 1
            self.out.append(f"<{t}>"); self.kids(n); self.out.append(f"</{t}>")
            if t == "pre":
                self.pre -= 1
            return
        self.kids(n)  # unwrap anything else (section, span, div, ...)

    def kids(self, n):
        ks = n.kids
        i = 0
        while i < len(ks):
            k = ks[i]
            # docbook style:  <p><b>--flag</b></p><div class="Bd-indent">description</div>
            if (not isinstance(k, str) and k.tag == "p" and i + 1 < len(ks)):
                j = i + 1
                while j < len(ks) and isinstance(ks[j], str) and not ks[j].strip():
                    j += 1
                nxt = ks[j] if j < len(ks) else None
                label = norm(text(k))
                if (nxt is not None and not isinstance(nxt, str) and nxt.tag == "div" and "Bd-indent" in nxt.cls
                        and 0 < len(label) < 300 and (is_opt_text(label) or self.defs_section())):
                    self.out.append("<dl>"); self.term([k], nxt); self.out.append("</dl>")
                    i = j + 1
                    continue
            if not isinstance(k, str) and k.tag == "p" and i + 1 < len(ks):
                j = i + 1
                while j < len(ks) and isinstance(ks[j], str) and not ks[j].strip():
                    j += 1
                nxt = ks[j] if j < len(ks) else None
                label = norm(text(k))
                if nxt is not None and not isinstance(nxt, str) and nxt.tag == "dl" and is_opt_text(label) and len(label) < 200:
                    parts = [c for c in nxt.kids if not isinstance(c, str)]
                    if len(parts) >= 2 and parts[0].tag == "dt" and not norm(text(parts[0])) and parts[1].tag == "dd":
                        dt = Node("dt"); dt.kids = k.kids
                        self.out.append("<dl>"); self.term([dt], parts[1]); self.out.append("</dl>")
                        rest = Node("dl", nxt.attrs); rest.kids = parts[2:]
                        if rest.kids:
                            self.emit_dl(rest)
                        i = j + 1
                        continue
            if not isinstance(k, str) and k.tag == "p" and self.split_para(k):
                i += 1
                continue
            self.emit(k)
            i += 1

    def split_para(self, p):
        """Old-style pages write `<b>-x</b><br>description` or, inside OPTIONS, `<b>-x</b> description`."""
        ks = [c for c in p.kids]
        while ks and isinstance(ks[0], str) and not ks[0].strip():
            ks.pop(0)
        if not ks or isinstance(ks[0], str) or ks[0].tag not in ("b", "strong", "code"):
            return False
        br = next((j for j, c in enumerate(ks) if not isinstance(c, str) and c.tag == "br"), None)
        if br is not None:
            head, tail = ks[:br], ks[br + 1:]
        elif "OPTION" in self.title.upper():
            j = 0
            while j < len(ks) and ((not isinstance(ks[j], str) and ks[j].tag in ("b", "strong", "code", "i", "em", "var"))
                                   or (isinstance(ks[j], str) and len(ks[j].strip()) <= 3)):
                j += 1
            head, tail = ks[:j], ks[j:]
        else:
            return False
        label = norm("".join(text(c) for c in head))
        body = norm("".join(text(c) for c in tail))
        if not (is_opt_text(label) and len(label) < 160 and body):
            return False
        dt, dd = Node("dt"), Node("dd")
        dt.kids, dd.kids = head, tail
        self.out.append("<dl>"); self.term([dt], dd); self.out.append("</dl>")
        return True

    def defs_section(self):
        return bool(re.search(r"COMMAND|OPTION", self.title.upper()))

    def emit_dl(self, n):
        self.out.append("<dl>")
        dts, pairs = [], []
        for k in n.kids:
            if isinstance(k, str):
                continue
            if k.tag == "dt":
                dts.append(k)
            elif k.tag == "dd":
                pairs.append((dts, k)); dts = []
        # `.IP "-V"` / `.IP "--version"` / text: the short form gets an empty body and the
        # description sits on the next term -> they are one option with two spellings
        merged, carry = [], []
        for i, (ds, dd) in enumerate(pairs):
            if (not norm(text(dd)) and i + 1 < len(pairs) and ds and len(carry) < 6
                    and is_opt_text(norm(text(ds[0]))) and pairs[i + 1][0]
                    and is_opt_text(norm(text(pairs[i + 1][0][0])))):
                carry += ds
                continue
            merged.append((carry + ds, dd)); carry = []
        for ds, dd in merged:
            self.term(ds, dd)
        for d in dts:  # dt without dd
            self.term([d], None)
        self.out.append("</dl>")

    def term(self, dts, dd):
        label = norm(" , ".join(norm(text(d)) for d in dts)) if len(dts) > 1 else norm(text(dts[0])) if dts else ""
        kind = None
        if dts and is_opt_text(label):
            kind = "o"
        elif dts and re.search(r"COMMAND", self.title.upper()) and 0 < len(label) < 200:
            kind = "c"
        for idx, d in enumerate(dts):
            attr = ""
            if kind and idx == 0:
                attr = ' data-%s=""' % kind
                if self.group:
                    attr += ' data-g="%s"' % html.escape(self.group, quote=True)
            self.out.append(f"<dt{attr}>"); self.kids(d); self.out.append("</dt>")
        if kind == "o":
            self.opts.append((label, flags_of(norm(" , ".join(flag_text(d) for d in dts))), self.group))
        self.out.append("<dd>")
        if dd is not None:
            self.kids(dd)
        self.out.append("</dd>")

    def html(self):
        s = "".join(self.out)
        s = re.sub(r"<(p|b|i|dd|div class=\"in\")>\s*</(p|b|i|dd|div)>", lambda m: "<dd></dd>" if m.group(1) == "dd" else "", s)
        s = re.sub(r"\s+(</(?:p|dd|dt|li|td)>)", r"\1", s)
        s = re.sub(r"(<(?:p|dd|dt|li|td)>)\s+", r"\1", s)
        return s.strip()


def so_target(raw: bytes):
    for line in raw.splitlines()[:8]:
        line = line.strip()
        if line.startswith(b".so "):
            t = line[4:].decode("utf-8", "replace").strip()
            m = re.search(r"([^/]+?)\.([18][a-z]*)(?:\.gz)?$", t)
            if m:
                return m.group(1), m.group(2)[0]
        if line and not line.startswith((b'.\\"', b"'\\\"", b".\\\"")):
            break
    return None


def render(path):
    """-> dict(desc, names, date, source, secs=[[title, html]], opts=[(label, flags, group)]) or None"""
    r = subprocess.run(["mandoc", "-T", "html", "-O", "fragment", "-K", "utf-8", path], capture_output=True, timeout=120)
    doc = r.stdout.decode("utf-8", "replace")
    if "manual-text" not in doc:
        r = subprocess.run(["mandoc", "-T", "html", "-O", "fragment", "-K", "iso-8859-1", path], capture_output=True, timeout=120)
        doc = r.stdout.decode("utf-8", "replace")
        if "manual-text" not in doc:
            return None
    tr = _Tree(); tr.feed(doc); tr.close()
    foot = {c: norm(text(n)) for n in find(tr.root, lambda n: n.tag == "td") for c in n.cls}
    body = next(find(tr.root, lambda n: n.tag == "div" and "manual-text" in n.cls), None)
    if body is None:
        return None
    secs, opts, desc, names = [], [], "", []
    loose = Section("")
    for k in body.kids:
        if isinstance(k, str) or not (k.tag == "section" and "Sh" in k.cls):
            loose.emit(k)
            continue
        h1 = next(find(k, lambda n: n.tag == "h1"), None)
        title = norm(text(h1)) if h1 is not None else ""
        s = Section(title)
        s.kids(k)
        h = s.html()
        if title.upper() == "NAME":
            t = norm(text(k, skip=("h1",)))
            m = re.split(r"\s+[-–—]+\s+", t, maxsplit=1)
            names = [x.strip() for x in m[0].split(",") if x.strip()]
            desc = m[1] if len(m) > 1 else ""
        if h:
            secs.append([title, h])
        opts += s.opts
    lh = loose.html()
    if lh and len(norm(re.sub(r"<[^>]+>", "", lh))) > 0:
        secs.insert(0, ["", lh]); opts = loose.opts + opts
    if not secs:
        return None
    return dict(desc=desc, names=names, date=foot.get("foot-date", ""), source=foot.get("foot-os", ""),
                vol=foot.get("head-vol", ""), secs=secs, opts=opts)
