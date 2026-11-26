"""Shared helpers: repository metadata for Rocky Linux 9.6 and Ubuntu 22.04 (jammy)."""
import gzip, os, re, collections
import xml.etree.ElementTree as ET

CACHE = os.environ.get("LOM_CACHE", os.path.expanduser("~/.cache/linux-ops-manual"))
META = os.path.join(CACHE, "meta")
ROCKY_BASE = "https://dl.rockylinux.org/vault/rocky/9.6"
ROCKY_REPOS = ["BaseOS", "AppStream"]
EPEL_BASE = "https://dl.fedoraproject.org/pub/epel/9/Everything/x86_64"
UBUNTU_BASE = "http://archive.ubuntu.com/ubuntu"
UBUNTU_POCKETS = ["jammy", "jammy-updates", "jammy-security"]
MAN_RE = re.compile(r"^/?usr/share/man/man([18])/([^/]+?)\.([18][a-z]*)(?:\.(?:gz|bz2|xz|zst))?$")

NS = {"c": "http://linux.duke.edu/metadata/common", "f": "http://linux.duke.edu/metadata/filelists",
      "rpm": "http://linux.duke.edu/metadata/rpm"}


def _rpmvercmp_key(s):
    # good-enough ordering for picking the newest build of the same package
    return [(1, int(p)) if p.isdigit() else (0, p) for p in re.findall(r"\d+|[a-zA-Z]+", s)]


def _open(prefix):
    import lzma
    for ext, op in ((".gz", gzip.open), (".xz", lzma.open)):
        if os.path.exists(prefix + ext):
            return op(prefix + ext)
    raise FileNotFoundError(prefix)


def rocky_packages(repos=None, only=None):
    """-> {name: {repo, ver, rel, epoch, arch, href, size, summary, mans:[(sec,name,path)]}} (newest per name)"""
    pkgs = {}
    for repo in (repos or ROCKY_REPOS):
        by_id = {}
        stem = "epel" if repo == "EPEL" else f"rocky-{repo}"
        with _open(os.path.join(META, f"{stem}-primary.xml")) as fh:
            for _, el in ET.iterparse(fh):
                if el.tag != "{%s}package" % NS["c"]:
                    continue
                arch = el.findtext("c:arch", namespaces=NS)
                if arch in ("x86_64", "noarch"):
                    v = el.find("c:version", NS)
                    by_id[el.find("c:checksum", NS).text] = dict(
                        name=el.findtext("c:name", namespaces=NS), repo=repo, arch=arch,
                        epoch=v.get("epoch"), ver=v.get("ver"), rel=v.get("rel"),
                        sha256=el.find("c:checksum", NS).text,
                        href=el.find("c:location", NS).get("href"),
                        size=int(el.find("c:size", NS).get("package")),
                        summary=el.findtext("c:summary", namespaces=NS) or "",
                        srpm=el.findtext("c:format/rpm:sourcerpm", namespaces=NS) or "", mans=[])
                el.clear()
        with _open(os.path.join(META, f"{stem}-filelists.xml")) as fh:
            for _, el in ET.iterparse(fh):
                if el.tag != "{%s}package" % NS["f"]:
                    continue
                p = by_id.get(el.get("pkgid"))
                if p is not None:
                    for f in el.findall("f:file", NS):
                        m = MAN_RE.match(f.text or "")
                        if m:
                            p["mans"].append((m.group(1), m.group(2), f.text))
                el.clear()
        for p in by_id.values():
            if not p["mans"] or (only is not None and p["name"] not in only):
                continue
            key = (int(p["epoch"] or 0), _rpmvercmp_key(p["ver"]), _rpmvercmp_key(p["rel"]))
            cur = pkgs.get(p["name"])
            if cur is None or key > cur["_k"]:
                p["_k"] = key
                pkgs[p["name"]] = p
    for p in pkgs.values():
        p.pop("_k")
        p["url"] = (f"{EPEL_BASE}/{p['href']}" if p["repo"] == "EPEL"
                    else f"{ROCKY_BASE}/{p['repo']}/x86_64/os/{p['href']}")
        p["version"] = f"{p['ver']}-{p['rel']}"
    return pkgs


def _deb_stanzas(path):
    with gzip.open(path, "rt", encoding="utf-8", errors="replace") as fh:
        cur = {}
        key = None
        for line in fh:
            if line == "\n":
                if cur:
                    yield cur
                cur, key = {}, None
            elif line[0] in " \t":
                pass
            else:
                key, _, val = line.partition(":")
                if key in ("Package", "Version", "Filename", "Size", "Description", "Source", "Priority", "Task", "Section", "SHA256"):
                    cur[key] = val.strip()
        if cur:
            yield cur


def _debver_key(v):
    epoch, _, rest = v.rpartition(":") if ":" in v else ("0", "", v)
    return (int(epoch or 0), _rpmvercmp_key(rest.replace("~", " 0 ")))


def ubuntu_packages(components=("main", "universe")):
    """-> {name: {component, pocket, version, url, size, summary, mans:[...]}} using jammy Contents for
    file lists and the newest version across jammy/-updates/-security."""
    mans = collections.defaultdict(list)
    with gzip.open(os.path.join(META, "ubuntu-jammy-Contents.gz"), "rt", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            if not line.startswith("usr/share/man/man"):
                continue
            path, _, owners = line.rstrip("\n").rpartition(" ")
            path = path.rstrip()
            m = MAN_RE.match(path)
            if not m:
                continue
            for o in owners.split(","):
                mans[o.rsplit("/", 1)[-1]].append((m.group(1), m.group(2), "/" + path))
    pkgs = {}
    for comp in components:
        for pocket in UBUNTU_POCKETS:
            f = os.path.join(META, f"ubuntu-{pocket}-{comp}-Packages.gz")
            if not os.path.exists(f):
                continue
            for st in _deb_stanzas(f):
                n = st.get("Package")
                if n not in mans:
                    continue
                k = _debver_key(st["Version"])
                cur = pkgs.get(n)
                if cur is None or k > cur["_k"]:
                    pkgs[n] = dict(name=n, component=comp, pocket=pocket, version=st["Version"],
                                   url=f"{UBUNTU_BASE}/{st['Filename']}", size=int(st["Size"]),
                                   sha256=st.get("SHA256", ""),
                                   summary=st.get("Description", ""), priority=st.get("Priority", ""),
                                   section=st.get("Section", ""), task=st.get("Task", ""),
                                   mans=mans[n], _k=k)
    for p in pkgs.values():
        p.pop("_k")
    return pkgs
