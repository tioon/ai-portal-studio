import sys, collections
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from common import rocky_packages, ubuntu_packages
r = rocky_packages(); u = ubuntu_packages()
def rep(tag, pk):
    names = {(s, n) for p in pk for (s, n, _) in p["mans"]}
    print(f"{tag:28} pkgs={len(pk):5} pages={len(names):6} size={sum(p['size'] for p in pk)/1e6:8.0f}MB")
    return {n for _, n in names}
rb = rep("rocky BaseOS", [p for p in r.values() if p["repo"] == "BaseOS"])
ra = rep("rocky AppStream", [p for p in r.values() if p["repo"] == "AppStream"])
um = rep("ubuntu main", [p for p in u.values() if p["component"] == "main"])
uu = rep("ubuntu universe", [p for p in u.values() if p["component"] == "universe"])
R = rb | ra
print("rocky all", len(R), "ubuntu main", len(um), "both(rocky & ubu main)", len(R & um), "rocky & ubu any", len(R & (um | uu)))
print("in rocky, only in ubuntu universe:", len((R & uu) - um))
for tag, pk in (("rocky", r), ("ubuntu-main", {k: v for k, v in u.items() if v["component"] == "main"})):
    big = sorted(pk.values(), key=lambda p: -p["size"])[:12]
    print(tag, "biggest:", ", ".join(f"{p['name']}({p['size']//1000000}MB,{len(p['mans'])}p)" for p in big))
want = "ls grep find tar rsync systemctl journalctl curl ss ps awk sed ssh df chmod ip lvcreate dnf apt htop iotop jq mtr tcpdump strace nmcli firewall-cmd ufw tmux screen podman docker kubectl nvidia-smi smartctl nvme iperf3 perf bpftrace sar iostat yq netplan resolvectl semanage auditctl chronyc vim nft iptables mdadm cryptsetup numactl lsof ethtool dmidecode tree wget nc zip".split()
print("missing rocky :", [w for w in want if w not in R])
print("missing ubuntu main:", [w for w in want if w not in um], "| also missing in universe:", [w for w in want if w not in um | uu])
