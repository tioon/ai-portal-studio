#!/usr/bin/env python3
"""Download the repository indexes that fetch.py / build.py read (into $LOM_CACHE/meta)."""
import os, re, sys, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import META, ROCKY_BASE, ROCKY_REPOS, EPEL_BASE, UBUNTU_BASE, UBUNTU_POCKETS

UA = {"User-Agent": "linux-ops-manual-datapack/1.0"}


def get(url, dest):
    print("GET", url, flush=True)
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r, open(dest + ".part", "wb") as f:
        while True:
            b = r.read(1 << 16)
            if not b:
                break
            f.write(b)
    os.replace(dest + ".part", dest)


def rpm_repo(base, stem):
    md = os.path.join(META, f"{stem}-repomd.xml")
    get(f"{base}/repodata/repomd.xml", md)
    xml = open(md, encoding="utf-8").read()
    for kind in ("primary", "filelists"):
        href = re.search(r'href="([^"]*-%s\.xml\.(gz|xz))"' % kind, xml)
        get(f"{base}/{href.group(1)}", os.path.join(META, f"{stem}-{kind}.xml.{href.group(2)}"))


os.makedirs(META, exist_ok=True)
for repo in ROCKY_REPOS:
    rpm_repo(f"{ROCKY_BASE}/{repo}/x86_64/os", f"rocky-{repo}")
rpm_repo(EPEL_BASE, "epel")
get(f"{UBUNTU_BASE}/dists/jammy/Contents-amd64.gz", os.path.join(META, "ubuntu-jammy-Contents.gz"))
for pocket in UBUNTU_POCKETS:
    for comp in ("main", "universe"):
        get(f"{UBUNTU_BASE}/dists/{pocket}/{comp}/binary-amd64/Packages.gz", os.path.join(META, f"ubuntu-{pocket}-{comp}-Packages.gz"))

# community examples (tldr-pages, CC BY 4.0) - optional layer used by build_examples.py
import zipfile
TLDR = os.path.join(os.path.dirname(META), "tldr")
os.makedirs(TLDR, exist_ok=True)
req = urllib.request.Request("https://github.com/tldr-pages/tldr/releases/latest", headers=UA)
tag = urllib.request.urlopen(req, timeout=60).geturl().rsplit("/", 1)[-1]
get(f"https://github.com/tldr-pages/tldr/releases/download/{tag}/tldr.zip", os.path.join(TLDR, "tldr.zip"))
zipfile.ZipFile(os.path.join(TLDR, "tldr.zip")).extractall(os.path.join(TLDR, "x"))
open(os.path.join(TLDR, "VERSION"), "w").write(tag + "\n")
