"""What goes into the data pack.

Rocky Linux 9.6 : every package in BaseOS + AppStream that ships a section 1/8 man page.
Ubuntu 22.04    : every such package in `main`, plus the `universe` packages named below.
EPEL 9          : only the packages named below (EPEL is a rolling add-on repo, not part of 9.6).
Packages larger than MAX_PKG_BYTES are skipped (desktop apps / JDKs with 1-2 pages) and listed in the manifest.
"""
MAX_PKG_BYTES = 60_000_000

UBUNTU_UNIVERSE = """
iotop tree iperf3 podman docker.io docker-compose firewalld policycoreutils policycoreutils-python-utils
selinux-utils auditd bpftrace ncdu fping iftop atop pv nethogs fail2ban nload mosh moreutils rclone restic
lnav sshpass nvme-cli numactl nmap ncat net-tools ipmitool freeipmi-tools lm-sensors stress-ng stress fio sysbench
iptraf-ng dstat glances ansible ansible-core yq buildah skopeo crun runc cri-tools pigz pbzip2 lz4 p7zip-full
etckeeper silversearcher-ag ripgrep fd-find bat fzf socat tshark ngrep hping3 arping bridge-utils vlan
ifenslave keepalived haproxy cpufrequtils linux-tools-common trace-cmd ltrace valgrind aide rkhunter lynis
clamav quota sshfs s3cmd awscli traceroute mtr whois dnsutils knot-dnsutils ldap-utils sysstat hdparm sdparm
sg3-utils lsscsi multipath-tools open-iscsi targetcli-fb nfs-kernel-server cifs-utils smbclient autofs
zfsutils-linux mergerfs duperemove inotify-tools incron at cron-apt monit supervisor logwatch goaccess
multitail ccze lshw hwinfo inxi cpuid msr-tools edac-utils rasdaemon mcelog nvtop cgroup-tools systemd-container
debootstrap schroot qemu-utils libvirt-clients virtinst cloud-utils cloud-image-utils pssh clustershell parallel
expect dos2unix jq xmlstarlet miller datamash csvkit httpie wrk apache2-utils siege oathtool pwgen apg
makepasswd gnupg2 pass age minisign conntrack ipset ipvsadm nftables ebtables arptables wireguard-tools
openvpn strongswan stunnel4 sslscan testssl.sh certbot easy-rsa dnf yum rpm createrepo-c alien debsums
apt-file aptitude deborphan apt-show-versions needrestart checkrestart debian-goodies tcptraceroute
iputils-arping iputils-tracepath iputils-clockdiff bmon vnstat sysdig perf-tools-unstable bpfcc-tools
linux-perf htop tmux screen byobu mc ranger vim neovim nano git-lfs etcd-client redis-tools postgresql-client
mysql-client mariadb-client sqlite3 pgcli zip unzip unar cabextract genisoimage xorriso squashfs-tools
dump xfsdump partclone testdisk gddrescue ddrescue safecopy smartmontools nwipe hexedit xxd bsdmainutils
ipcalc sipcalc netcat-traditional netcat-openbsd nmon collectl sysfsutils kexec-tools kdump-tools crash
makedumpfile numad tuned irqbalance cpuset schedtool util-linux-extra
""".split()

EPEL = """
htop screen ncdu fping iftop atop pv nethogs fail2ban-server nload mosh moreutils rclone restic pwgen lnav
bpftrace sshpass iperf3 yq bat ripgrep fd-find fzf glances nmon inxi stress stress-ng sysbench hping3 ngrep
bmon vnstat multitail tcptraceroute whois ipcalc sipcalc pssh clustershell parallel dos2unix httpie siege wrk
monit supervisor goaccess logwatch incron inotify-tools etckeeper debootstrap apt dpkg p7zip p7zip-plugins
unar pigz pbzip2 testdisk ddrescue partclone xfsdump lshw hwinfo cpuid msr-tools ccze mc ranger neovim byobu
certbot easy-rsa openvpn wireguard-tools sslscan age minisign pass oathtool lynis rkhunter aide clamav
s3cmd awscli2 sshfs duperemove mergerfs zfs-fuse nvtop iptraf-ng dstat cri-tools
""".split()

# man page names that differ from the command people type (Debian alternatives etc.)
ALIASES = {
    "ubuntu": {"awk": "mawk", "nc": "nc_openbsd", "sar": "sar.sysstat", "iostat": "iostat", "editor": "nano",
               "vi": "vim", "pager": "less", "netcat": "nc_openbsd", "ex": "vim", "view": "vim",
               "nawk": "mawk", "rsh": "ssh", "which": "which.debianutils", "perf": "perf"},
    "rocky": {"awk": "gawk", "nc": "ncat", "vi": "vim", "netcat": "ncat", "docker": "podman-docker"},
}
