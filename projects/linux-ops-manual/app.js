const searchInput = document.querySelector("#searchInput");
const categoryRow = document.querySelector("#categoryRow");
const commandSections = document.querySelector("#commandSections");
const scenarioGrid = document.querySelector("#scenarioGrid");
const commandTemplate = document.querySelector("#commandTemplate");
const resultCount = document.querySelector("#resultCount");
const clearFilters = document.querySelector("#clearFilters");
const listTitle = document.querySelector("#listTitle");
const tabs = Array.from(document.querySelectorAll(".tab"));

const state = {
  distro: "rocky",
  category: "all",
  search: ""
};

const scenarios = [
  {
    id: "disk",
    label: "디스크 부족",
    note: "df / du / find / journalctl",
    search: "df du find journalctl"
  },
  {
    id: "service",
    label: "서비스 재시작",
    note: "systemctl / journalctl",
    search: "systemctl journalctl service"
  },
  {
    id: "network",
    label: "포트 확인",
    note: "ss / ip / curl / dig",
    search: "ss ip curl dig"
  },
  {
    id: "logs",
    label: "로그 추적",
    note: "tail / journalctl / grep",
    search: "tail journalctl grep"
  }
];

const categories = [
  { id: "all", label: "전체" },
  { id: "system", label: "시스템 정보" },
  { id: "filesystem", label: "파일/디렉토리" },
  { id: "search", label: "검색" },
  { id: "filesystem-advanced", label: "파일시스템 심화" },
  { id: "permissions", label: "권한" },
  { id: "process", label: "프로세스" },
  { id: "logs", label: "로그" },
  { id: "services", label: "서비스" },
  { id: "systemd", label: "systemd" },
  { id: "packages", label: "패키지 관리" },
  { id: "network", label: "네트워크" },
  { id: "network-firewall", label: "방화벽" },
  { id: "network-diagnostics", label: "네트워크 진단" },
  { id: "backup", label: "압축/백업" },
  { id: "text", label: "텍스트 처리" },
  { id: "storage", label: "스토리지" },
  { id: "lvm", label: "LVM/스왑" },
  { id: "hardware", label: "하드웨어" },
  { id: "session", label: "세션/터미널" },
  { id: "users", label: "사용자" },
  { id: "remote", label: "SSH/원격" },
  { id: "containers", label: "컨테이너" },
  { id: "gpu", label: "GPU" },
  { id: "security", label: "보안" },
  { id: "audit", label: "감사/SELinux" },
  { id: "diagnostics", label: "진단" },
  { id: "time", label: "시간" },
  { id: "performance", label: "성능" },
  { id: "troubleshoot", label: "트러블슈팅" }
];

const topicByCommandId = {
  uname: "system",
  ls: "filesystem",
  find: "search",
  "findmnt": "storage",
  disk: "storage",
  fdisk: "filesystem-advanced",
  parted: "filesystem-advanced",
  "mkfs-xfs": "filesystem-advanced",
  "mkfs-ext4": "filesystem-advanced",
  "xfs-growfs": "filesystem-advanced",
  "resize2fs": "filesystem-advanced",
  "xfs-repair": "filesystem-advanced",
  "mount-remount": "storage",
  lsattr: "filesystem-advanced",
  chattr: "filesystem-advanced",
  chmod: "permissions",
  ps: "process",
  free: "process",
  journalctl: "logs",
  tailgrep: "logs",
  "vi-vim": "text",
  systemctl: "services",
  packages: "packages",
  firewall: "network-firewall",
  ss: "network",
  scp: "remote",
  tar: "backup",
  text: "text",
  k8s: "containers",
  trouble: "troubleshoot",
  grep: "text",
  less: "logs",
  headtail: "logs",
  iproute: "network",
  nmcli: "network",
  lsblk: "storage",
  mount: "storage",
  crontab: "services",
  sudo: "users",
  "nvidia-smi": "gpu",
  "top-htop": "process",
  "proc-control": "process",
  "service-check": "services",
  tree: "filesystem",
  locate: "search",
  file: "filesystem",
  stat: "filesystem",
  "storage-advanced": "storage",
  "net-tools": "network-diagnostics",
  "package-tools": "packages",
  "users-acl": "users",
  "archive-tools": "backup",
  "text-pipe": "text",
  "ssh-transfer": "remote",
  "ssh-agent": "remote",
  "ssh-add": "remote",
  "ssh-keyscan": "remote",
  "security-tools": "security",
  "journalctl-advanced": "logs",
  lsof: "process",
  watch: "troubleshoot",
  "env-printenv": "system",
  "which-whereis": "system",
  dmesg: "diagnostics",
  sysctl: "diagnostics",
  logrotate: "diagnostics",
  nc: "network-diagnostics",
  tcpdump: "network-diagnostics",
  mtr: "network-diagnostics",
  curl: "network",
  wget: "network",
  "ss-advanced": "network-diagnostics",
  ethtool: "hardware",
  lscpu: "hardware",
  lspci: "hardware",
  lsusb: "hardware",
  dmidecode: "hardware",
  modinfo: "hardware",
  podman: "containers",
  screen: "session",
  tmux: "session",
  nohup: "session",
  jobs: "session",
  bg: "session",
  fg: "session",
  disown: "session",
  loginctl: "session",
  useradd: "users",
  usermod: "users",
  passwd: "users",
  groupadd: "users",
  userdel: "users",
  groupdel: "users",
  chage: "users",
  visudo: "users",
  restorecon: "security",
  semanage: "security",
  chcon: "security",
  setsebool: "security",
  ausearch: "audit",
  aureport: "audit",
  auditctl: "audit",
  audit2allow: "audit",
  sealert: "audit",
  timedatectl: "time",
  chronyc: "time",
  iostat: "performance",
  iotop: "performance",
  sar: "performance",
  "systemd-analyze": "systemd",
  "systemctl-edit": "systemd",
  "systemctl-cat": "systemd",
  "systemctl-list-dependencies": "systemd",
  "systemd-analyze-blame": "systemd",
  "systemd-analyze-critical-chain": "systemd",
  pvs: "lvm",
  vgs: "lvm",
  lvs: "lvm",
  pvcreate: "lvm",
  vgcreate: "lvm",
  lvcreate: "lvm",
  lvextend: "lvm",
  fsck: "lvm",
  mkswap: "lvm",
  swapon: "lvm",
  swapoff: "lvm"
};

const displayOverrides = {
  packages: {
    rocky: {
      title: "패키지 관리",
      command: "dnf update && dnf install nginx && rpm -qa | grep nginx"
    },
    ubuntu: {
      title: "패키지 관리",
      command: "apt update && apt install -y nginx && dpkg -l | grep nginx"
    }
  },
  firewall: {
    rocky: {
      title: "방화벽",
      command: "firewall-cmd --list-all"
    },
    ubuntu: {
      title: "방화벽",
      command: "ufw status verbose"
    }
  },
  uname: {
    rocky: { title: "시스템 정보", command: "uname -a && hostnamectl" },
    ubuntu: { title: "시스템 정보", command: "uname -a && hostnamectl" }
  },
  ls: {
    rocky: { title: "파일 목록", command: "ls -alh" },
    ubuntu: { title: "파일 목록", command: "ls -alh" }
  },
  find: {
    rocky: { title: "파일 검색", command: "find /var/log -type f -name '*.log'" },
    ubuntu: { title: "파일 검색", command: "find /var/log -type f -name '*.log'" }
  },
  disk: {
    rocky: { title: "디스크 사용량", command: "df -h && du -sh /var/log/*" },
    ubuntu: { title: "디스크 사용량", command: "df -h && du -sh /var/log/*" }
  },
  chmod: {
    rocky: { title: "권한 변경", command: "chmod 640 file && chown user:group file" },
    ubuntu: { title: "권한 변경", command: "chmod 640 file && chown user:group file" }
  },
  ps: {
    rocky: { title: "프로세스 관리", command: "ps aux | grep nginx && pgrep -af nginx && kill -TERM <pid>" },
    ubuntu: { title: "프로세스 관리", command: "ps aux | grep nginx && pgrep -af nginx && kill -TERM <pid>" }
  },
  free: {
    rocky: { title: "메모리 점검", command: "free -h && vmstat 1 5" },
    ubuntu: { title: "메모리 점검", command: "free -h && vmstat 1 5" }
  },
  journalctl: {
    rocky: { title: "로그 추적", command: "journalctl -u nginx -f" },
    ubuntu: { title: "로그 추적", command: "journalctl -u nginx -f" }
  },
  systemctl: {
    rocky: { title: "서비스 관리", command: "systemctl status nginx && systemctl restart nginx" },
    ubuntu: { title: "서비스 관리", command: "systemctl status nginx && systemctl restart nginx" }
  },
  firewall: {
    rocky: { title: "방화벽", command: "firewall-cmd --list-all" },
    ubuntu: { title: "방화벽", command: "ufw status verbose" }
  },
  ss: {
    rocky: { title: "네트워크 확인", command: "ss -tulnp && ip a && curl -I https://example.com" },
    ubuntu: { title: "네트워크 확인", command: "ss -tulnp && ip a && curl -I https://example.com" }
  },
  scp: {
    rocky: { title: "SSH 전송", command: "ssh user@host && scp file user@host:/tmp/" },
    ubuntu: { title: "SSH 전송", command: "ssh user@host && scp file user@host:/tmp/" }
  },
  tar: {
    rocky: { title: "압축/동기화", command: "tar -czf backup.tar.gz /data && rsync -avh /src/ user@host:/dst/" },
    ubuntu: { title: "압축/동기화", command: "tar -czf backup.tar.gz /data && rsync -avh /src/ user@host:/dst/" }
  },
  text: {
    rocky: { title: "텍스트 처리", command: "grep ERROR app.log | awk '{print $2}' | sort | uniq -c | sort -nr" },
    ubuntu: { title: "텍스트 처리", command: "grep ERROR app.log | awk '{print $2}' | sort | uniq -c | sort -nr" }
  },
  k8s: {
    rocky: { title: "컨테이너", command: "podman ps && kubectl get pods -A && crictl ps" },
    ubuntu: { title: "컨테이너", command: "docker ps && kubectl get pods -A && crictl ps" }
  },
  trouble: {
    rocky: { title: "트러블슈팅", command: "uptime && free -h && df -h && ss -tulnp" },
    ubuntu: { title: "트러블슈팅", command: "uptime && free -h && df -h && ss -tulnp" }
  },
  grep: {
    rocky: { title: "패턴 검색", command: "grep -Rni ERROR /var/log" },
    ubuntu: { title: "패턴 검색", command: "grep -Rni ERROR /var/log" }
  },
  less: {
    rocky: { title: "로그 뷰어", command: "less +F /var/log/messages" },
    ubuntu: { title: "로그 뷰어", command: "less +F /var/log/syslog" }
  },
  headtail: {
    rocky: { title: "파일 미리보기", command: "head -n 20 file && tail -n 50 file" },
    ubuntu: { title: "파일 미리보기", command: "head -n 20 file && tail -n 50 file" }
  },
  iproute: {
    rocky: { title: "라우팅/주소", command: "ip addr && ip route" },
    ubuntu: { title: "라우팅/주소", command: "ip addr && ip route" }
  },
  lsblk: {
    rocky: { title: "블록 장치", command: "lsblk -f && blkid" },
    ubuntu: { title: "블록 장치", command: "lsblk -f && blkid" }
  },
  mount: {
    rocky: { title: "마운트/해제", command: "mount /dev/nvme0n1p1 /data && umount /data" },
    ubuntu: { title: "마운트/해제", command: "mount /dev/nvme0n1p1 /data && umount /data" }
  },
  sudo: {
    rocky: { title: "권한 전환", command: "id && sudo -l && sudo -i" },
    ubuntu: { title: "권한 전환", command: "id && sudo -l && sudo -i" }
  },
  "top-htop": {
    rocky: { title: "실시간 프로세스", command: "top && htop" },
    ubuntu: { title: "실시간 프로세스", command: "top && htop" }
  },
  "proc-control": {
    rocky: { title: "프로세스 제어", command: "pkill nginx && nice -n 10 job && renice 5 -p <pid>" },
    ubuntu: { title: "프로세스 제어", command: "pkill nginx && nice -n 10 job && renice 5 -p <pid>" }
  },
  locate: {
    rocky: { title: "빠른 검색", command: "updatedb && locate nginx.conf" },
    ubuntu: { title: "빠른 검색", command: "updatedb && locate nginx.conf" }
  },
  "storage-advanced": {
    rocky: { title: "디스크/파티션", command: "du -xh --max-depth=1 /var && df -Th && lsblk -f && fdisk -l" },
    ubuntu: { title: "디스크/파티션", command: "du -xh --max-depth=1 /var && df -Th && lsblk -f && fdisk -l" }
  },
  "package-tools": {
    rocky: { title: "패키지 심화", command: "dnf history && dnf autoremove" },
    ubuntu: { title: "패키지 심화", command: "apt autoremove && apt-mark hold pkg" }
  },
  "users-acl": {
    rocky: { title: "사용자/ACL", command: "whoami && who && last && getfacl file" },
    ubuntu: { title: "사용자/ACL", command: "whoami && who && last && getfacl file" }
  },
  "archive-tools": {
    rocky: { title: "압축 도구", command: "tar -czf backup.tar.gz data/ && zip -r backup.zip data/" },
    ubuntu: { title: "압축 도구", command: "tar -czf backup.tar.gz data/ && zip -r backup.zip data/" }
  },
  "text-pipe": {
    rocky: { title: "텍스트 파이프라인", command: "cut -d: -f1 file | sort | uniq -c | xargs" },
    ubuntu: { title: "텍스트 파이프라인", command: "cut -d: -f1 file | sort | uniq -c | xargs" }
  },
  "ssh-transfer": {
    rocky: { title: "SSH 전송", command: "ssh-keygen -t ed25519 && ssh-copy-id user@host && scp -P 2222 file user@host:/tmp/" },
    ubuntu: { title: "SSH 전송", command: "ssh-keygen -t ed25519 && ssh-copy-id user@host && scp -P 2222 file user@host:/tmp/" }
  },
  "env-printenv": {
    rocky: { title: "환경 변수", command: "env | sort && printenv PATH" },
    ubuntu: { title: "환경 변수", command: "env | sort && printenv PATH" }
  },
  "which-whereis": {
    rocky: { title: "명령 위치", command: "which python3 && whereis nginx" },
    ubuntu: { title: "명령 위치", command: "which python3 && whereis nginx" }
  },
  "security-tools": {
    rocky: {
      title: "SELinux / firewalld",
      command: "getenforce && firewall-cmd --state"
    },
    ubuntu: {
      title: "AppArmor / ufw",
      command: "aa-status && ufw status verbose"
    }
  },
  k8s: {
    rocky: {
      title: "컨테이너",
      command: "podman ps && kubectl get pods -A && crictl ps"
    },
    ubuntu: {
      title: "컨테이너",
      command: "docker ps && kubectl get pods -A && crictl ps"
    }
  },
  tailgrep: {
    rocky: {
      title: "로그 추적",
      command: "tail -f /var/log/messages | grep --line-buffered ERROR"
    },
    ubuntu: {
      title: "로그 추적",
      command: "tail -f /var/log/syslog | grep --line-buffered ERROR"
    }
  },
  headtail: {
    rocky: {
      title: "파일 미리보기",
      command: "head -n 20 file && tail -n 50 file"
    },
    ubuntu: {
      title: "파일 미리보기",
      command: "head -n 20 file && tail -n 50 file"
    }
  },
  ss: {
    rocky: {
      title: "네트워크 점검",
      command: "ss -tulnp && ip a && curl -I https://example.com"
    },
    ubuntu: {
      title: "네트워크 점검",
      command: "ss -tulnp && ip a && curl -I https://example.com"
    }
  },
  iproute: {
    rocky: {
      title: "라우팅/주소",
      command: "ip addr && ip route"
    },
    ubuntu: {
      title: "라우팅/주소",
      command: "ip addr && ip route"
    }
  },
  nmcli: {
    rocky: {
      title: "NetworkManager",
      command: "nmcli dev status && nmcli con show"
    },
    ubuntu: {
      title: "NetworkManager",
      command: "nmcli dev status && nmcli con show"
    }
  },
  "net-tools": {
    rocky: {
      title: "네트워크 진단",
      command: "ping -c 4 host && traceroute host && nslookup host && ss -ltnp"
    },
    ubuntu: {
      title: "네트워크 진단",
      command: "ping -c 4 host && traceroute host && nslookup host && ss -ltnp"
    }
  },
  nc: {
    rocky: {
      title: "포트 테스트",
      command: "nc -vz host 443"
    },
    ubuntu: {
      title: "포트 테스트",
      command: "nc -vz host 443"
    }
  },
  tcpdump: {
    rocky: {
      title: "패킷 캡처",
      command: "tcpdump -i eth0 port 443"
    },
    ubuntu: {
      title: "패킷 캡처",
      command: "tcpdump -i eth0 port 443"
    }
  },
  mtr: {
    rocky: {
      title: "경로 진단",
      command: "mtr -rw 8.8.8.8"
    },
    ubuntu: {
      title: "경로 진단",
      command: "mtr -rw 8.8.8.8"
    }
  },
  "package-tools": {
    rocky: {
      title: "패키지 심화",
      command: "dnf history && dnf autoremove"
    },
    ubuntu: {
      title: "패키지 심화",
      command: "apt autoremove && apt-mark hold pkg"
    }
  },
  "env-printenv": {
    rocky: {
      title: "환경 변수",
      command: "env | sort && printenv PATH"
    },
    ubuntu: {
      title: "환경 변수",
      command: "env | sort && printenv PATH"
    }
  },
  "which-whereis": {
    rocky: {
      title: "명령 위치",
      command: "which python3 && whereis nginx"
    },
    ubuntu: {
      title: "명령 위치",
      command: "which python3 && whereis nginx"
    }
  },
  dmesg: {
    rocky: {
      title: "커널 로그",
      command: "dmesg -T | tail -n 50"
    },
    ubuntu: {
      title: "커널 로그",
      command: "dmesg -T | tail -n 50"
    }
  },
  sysctl: {
    rocky: {
      title: "커널 튜닝",
      command: "sysctl -a | grep vm.swappiness && sysctl -w net.ipv4.ip_forward=1"
    },
    ubuntu: {
      title: "커널 튜닝",
      command: "sysctl -a | grep vm.swappiness && sysctl -w net.ipv4.ip_forward=1"
    }
  },
  logrotate: {
    rocky: {
      title: "로그 회전",
      command: "logrotate -d /etc/logrotate.conf"
    },
    ubuntu: {
      title: "로그 회전",
      command: "logrotate -d /etc/logrotate.conf"
    }
  },
  podman: {
    rocky: {
      title: "컨테이너",
      command: "podman ps"
    },
    ubuntu: {
      title: "컨테이너",
      command: "podman ps"
    }
  }
};

const COMMANDS = [
  {
    id: "uname",
    category: "system",
    title: "uname / hostnamectl",
    summary: "커널, 호스트명, 배포판 정보를 빠르게 확인합니다.",
    command: "uname -a && hostnamectl",
    keywords: ["kernel", "host", "system", "version"],
    variants: {
      rocky: {
        options: [
          { flag: "uname -r", desc: "커널 버전만 확인" },
          { flag: "hostnamectl status", desc: "OS/호스트/가상화 정보까지 확인" },
          { flag: "cat /etc/redhat-release", desc: "Rocky 계열 배포판 문자열 확인" }
        ],
        examples: [
          { label: "운영 서버 버전 확인", code: "uname -r && hostnamectl | sed -n '1,5p'" },
          { label: "배포판 문자열 보기", code: "cat /etc/redhat-release" }
        ],
        diff: "Rocky는 RHEL 계열이므로 /etc/redhat-release 확인이 특히 유용합니다.",
        warnings: ["가상 머신과 물리 서버의 호스트명 변경은 작업 전후를 구분해서 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "uname -r", desc: "커널 버전만 확인" },
          { flag: "hostnamectl status", desc: "OS/호스트/가상화 정보까지 확인" },
          { flag: "cat /etc/os-release", desc: "Ubuntu 버전과 코드명 확인" }
        ],
        examples: [
          { label: "운영 서버 버전 확인", code: "uname -r && hostnamectl | sed -n '1,5p'" },
          { label: "배포판 문자열 보기", code: "cat /etc/os-release" }
        ],
        diff: "Ubuntu는 /etc/os-release와 hostnamectl 조합이 가장 무난합니다.",
        warnings: ["배포판 확인 없이 패키지 명령을 치면 dnf/apt가 엇갈릴 수 있습니다."]
      }
    }
  },
  {
    id: "ls",
    category: "filesystem",
    title: "ls",
    summary: "디렉토리 목록을 가장 자주 확인하는 기본 명령어입니다.",
    command: "ls -alh",
    keywords: ["list", "file", "directory", "folder"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "숨김 파일 포함" },
          { flag: "-l", desc: "상세 정보 표시" },
          { flag: "-h", desc: "사람이 읽기 쉬운 크기 표시" },
          { flag: "-t", desc: "수정 시간 순 정렬" }
        ],
        examples: [
          { label: "전체 목록", code: "ls -alh" },
          { label: "최근 수정 파일 우선", code: "ls -alth /var/log" }
        ],
        diff: "공통 명령어라 Rocky/Ubuntu 차이는 거의 없습니다.",
        warnings: ["색상 출력은 터미널 설정에 따라 달라질 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "숨김 파일 포함" },
          { flag: "-l", desc: "상세 정보 표시" },
          { flag: "-h", desc: "사람이 읽기 쉬운 크기 표시" },
          { flag: "-t", desc: "수정 시간 순 정렬" }
        ],
        examples: [
          { label: "전체 목록", code: "ls -alh" },
          { label: "최근 수정 파일 우선", code: "ls -alth /var/log" }
        ],
        diff: "공통 명령어라 Rocky/Ubuntu 차이는 거의 없습니다.",
        warnings: ["심볼릭 링크와 실제 파일을 헷갈리지 않도록 `-l` 결과를 확인하세요."]
      }
    }
  },
  {
    id: "find",
    category: "filesystem",
    title: "find",
    summary: "파일/디렉토리 위치를 정확하게 찾는 탐색 명령어입니다.",
    command: "find /var/log -type f -name '*.log'",
    keywords: ["search", "file search", "locate", "match"],
    variants: {
      rocky: {
        options: [
          { flag: "-type f", desc: "파일만 찾기" },
          { flag: "-name", desc: "이름 패턴 매칭" },
          { flag: "-mtime -1", desc: "24시간 이내 수정된 파일" },
          { flag: "-exec", desc: "찾은 파일에 후속 작업 실행" }
        ],
        examples: [
          { label: "최근 로그 파일", code: "find /var/log -type f -mtime -1" },
          { label: "용량 큰 파일", code: "find / -type f -size +1G 2>/dev/null" }
        ],
        diff: "Rocky에서는 SELinux 때문에 접근이 막히면 권한과 컨텍스트도 같이 확인해야 합니다.",
        warnings: ["루트 전체 탐색은 느립니다. 필요하면 경로를 좁혀서 사용하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-type f", desc: "파일만 찾기" },
          { flag: "-name", desc: "이름 패턴 매칭" },
          { flag: "-mtime -1", desc: "24시간 이내 수정된 파일" },
          { flag: "-exec", desc: "찾은 파일에 후속 작업 실행" }
        ],
        examples: [
          { label: "최근 로그 파일", code: "find /var/log -type f -mtime -1" },
          { label: "용량 큰 파일", code: "find / -type f -size +1G 2>/dev/null" }
        ],
        diff: "Ubuntu에서는 AppArmor 정책 때문에 일부 경로 접근이 제한될 수 있습니다.",
        warnings: ["루트 전체 탐색은 느립니다. 필요하면 경로를 좁혀서 사용하세요."]
      }
    }
  },
  {
    id: "disk",
    category: "storage",
    title: "df / du",
    summary: "디스크 전체 사용량과 폴더별 점유량을 함께 확인합니다.",
    command: "df -h && du -sh /var/log/*",
    keywords: ["disk", "usage", "space", "storage"],
    variants: {
      rocky: {
        options: [
          { flag: "df -h", desc: "전체 마운트 사용량 확인" },
          { flag: "df -i", desc: "inode 사용량 확인" },
          { flag: "du -sh", desc: "폴더 크기 요약" },
          { flag: "du -h --max-depth=1", desc: "하위 디렉토리별 크기 확인" }
        ],
        examples: [
          { label: "루트 파일시스템 점검", code: "df -hT /" },
          { label: "로그 디렉토리 용량 확인", code: "du -h --max-depth=1 /var/log | sort -h" }
        ],
        diff: "Rocky는 로그가 /var/log에 몰려 있는 경우가 많아 du 조합이 특히 유용합니다.",
        warnings: ["`du /`는 매우 무겁습니다. 먼저 범위를 좁히세요."]
      },
      ubuntu: {
        options: [
          { flag: "df -h", desc: "전체 마운트 사용량 확인" },
          { flag: "df -i", desc: "inode 사용량 확인" },
          { flag: "du -sh", desc: "폴더 크기 요약" },
          { flag: "du -h --max-depth=1", desc: "하위 디렉토리별 크기 확인" }
        ],
        examples: [
          { label: "루트 파일시스템 점검", code: "df -hT /" },
          { label: "로그 디렉토리 용량 확인", code: "du -h --max-depth=1 /var/log | sort -h" }
        ],
        diff: "Ubuntu도 방식은 같지만, snap이나 journal 저장소가 용량을 많이 차지할 수 있습니다.",
        warnings: ["시스템 로그와 애플리케이션 로그를 같이 지우기 전에 보존 정책을 확인하세요."]
      }
    }
  },
  {
    id: "chmod",
    category: "permissions",
    title: "chmod / chown",
    summary: "권한과 소유자를 조정할 때 가장 먼저 찾는 명령어입니다.",
    command: "chmod 640 file && chown user:group file",
    keywords: ["permission", "owner", "mode", "group"],
    variants: {
      rocky: {
        options: [
          { flag: "chmod 644", desc: "일반 파일 공개 읽기" },
          { flag: "chmod 755", desc: "실행 파일/디렉토리용" },
          { flag: "chmod -R", desc: "재귀 변경" },
          { flag: "chown -R", desc: "소유자/그룹 재귀 변경" }
        ],
        examples: [
          { label: "웹 디렉토리 권한 정리", code: "chown -R nginx:nginx /var/www && chmod -R 755 /var/www" },
          { label: "비공개 설정 파일", code: "chmod 600 /etc/app/secret.env" }
        ],
        diff: "Rocky에서는 SELinux 때문에 chmod/chown만으로 해결되지 않는 경우가 있습니다.",
        warnings: ["`chmod -R 777`는 거의 항상 잘못된 선택입니다."]
      },
      ubuntu: {
        options: [
          { flag: "chmod 644", desc: "일반 파일 공개 읽기" },
          { flag: "chmod 755", desc: "실행 파일/디렉토리용" },
          { flag: "chmod -R", desc: "재귀 변경" },
          { flag: "chown -R", desc: "소유자/그룹 재귀 변경" }
        ],
        examples: [
          { label: "웹 디렉토리 권한 정리", code: "chown -R www-data:www-data /var/www && chmod -R 755 /var/www" },
          { label: "비공개 설정 파일", code: "chmod 600 /etc/app/secret.env" }
        ],
        diff: "Ubuntu는 웹 계정이 `www-data`인 경우가 많아 소유자 예시가 다릅니다.",
        warnings: ["권한 문제를 덮으려고 `777`을 쓰기보다 서비스 계정부터 맞추는 편이 안전합니다."]
      }
    }
  },
  {
    id: "ps",
    category: "process",
    title: "ps / top / pgrep / kill",
    summary: "프로세스를 찾고 종료하거나 우선순위를 조절할 때 사용합니다.",
    command: "ps aux | grep nginx && pgrep -af nginx && kill -TERM <pid>",
    keywords: ["process", "cpu", "memory", "kill", "pid"],
    variants: {
      rocky: {
        options: [
          { flag: "ps aux", desc: "전체 프로세스 확인" },
          { flag: "pgrep -af", desc: "이름으로 PID와 명령줄 찾기" },
          { flag: "kill -TERM", desc: "정상 종료 신호" },
          { flag: "kill -KILL", desc: "강제 종료" }
        ],
        examples: [
          { label: "nginx 프로세스 찾기", code: "pgrep -af nginx" },
          { label: "메모리 많이 쓰는 순위", code: "ps aux --sort=-%mem | head" }
        ],
        diff: "Rocky에서도 동일하지만, systemd 서비스로 관리되는 프로세스는 systemctl과 같이 봐야 합니다.",
        warnings: ["`kill -9`는 최후 수단입니다. 먼저 `TERM`을 시도하세요."]
      },
      ubuntu: {
        options: [
          { flag: "ps aux", desc: "전체 프로세스 확인" },
          { flag: "pgrep -af", desc: "이름으로 PID와 명령줄 찾기" },
          { flag: "kill -TERM", desc: "정상 종료 신호" },
          { flag: "kill -KILL", desc: "강제 종료" }
        ],
        examples: [
          { label: "nginx 프로세스 찾기", code: "pgrep -af nginx" },
          { label: "메모리 많이 쓰는 순위", code: "ps aux --sort=-%mem | head" }
        ],
        diff: "Ubuntu도 동일하지만, 서비스명과 배포 스크립트가 다를 수 있습니다.",
        warnings: ["`kill -9`는 최후 수단입니다. 먼저 `TERM`을 시도하세요."]
      }
    }
  },
  {
    id: "free",
    category: "process",
    title: "free / vmstat",
    summary: "메모리, 스왑, 시스템 압박 상태를 빠르게 확인합니다.",
    command: "free -h && vmstat 1 5",
    keywords: ["memory", "swap", "load", "pressure"],
    variants: {
      rocky: {
        options: [
          { flag: "free -h", desc: "메모리와 스왑 사용량" },
          { flag: "vmstat 1 5", desc: "CPU, 메모리, I/O 흐름" },
          { flag: "top", desc: "실시간 프로세스 점검" }
        ],
        examples: [
          { label: "메모리 압박 보기", code: "free -h && vmstat 1 5" }
        ],
        diff: "Rocky는 시스템 서비스가 많아 cache와 slab 비중을 같이 보는 게 좋습니다.",
        warnings: ["available 메모리와 free 메모리를 혼동하지 마세요."]
      },
      ubuntu: {
        options: [
          { flag: "free -h", desc: "메모리와 스왑 사용량" },
          { flag: "vmstat 1 5", desc: "CPU, 메모리, I/O 흐름" },
          { flag: "top", desc: "실시간 프로세스 점검" }
        ],
        examples: [
          { label: "메모리 압박 보기", code: "free -h && vmstat 1 5" }
        ],
        diff: "Ubuntu는 snap, containerd, desktop 계열 프로세스가 메모리를 차지할 수 있습니다.",
        warnings: ["available 메모리와 free 메모리를 혼동하지 마세요."]
      }
    }
  },
  {
    id: "journalctl",
    category: "logs",
    title: "journalctl",
    summary: "systemd 기반 로그를 날짜/서비스/레벨 단위로 추적합니다.",
    command: "journalctl -u nginx -f",
    keywords: ["journal", "log", "systemd", "tail"],
    variants: {
      rocky: {
        options: [
          { flag: "-u nginx", desc: "특정 서비스 로그만 보기" },
          { flag: "-xe", desc: "에러 중심으로 보기" },
          { flag: "--since today", desc: "오늘 로그만 보기" },
          { flag: "-f", desc: "실시간 추적" }
        ],
        examples: [
          { label: "최근 서비스 에러", code: "journalctl -u nginx --since today -p err" },
          { label: "부팅 이후 전체", code: "journalctl -b" }
        ],
        diff: "Rocky는 systemd/journalctl 조합이 장애 분석의 시작점입니다.",
        warnings: ["로그가 없다면 service 이름이 맞는지부터 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-u nginx", desc: "특정 서비스 로그만 보기" },
          { flag: "-xe", desc: "에러 중심으로 보기" },
          { flag: "--since today", desc: "오늘 로그만 보기" },
          { flag: "-f", desc: "실시간 추적" }
        ],
        examples: [
          { label: "최근 서비스 에러", code: "journalctl -u nginx --since today -p err" },
          { label: "부팅 이후 전체", code: "journalctl -b" }
        ],
        diff: "Ubuntu도 동일하지만, 서비스가 snap/unit 이름으로 등록될 수 있습니다.",
        warnings: ["로그가 없다면 service 이름이 맞는지부터 확인하세요."]
      }
    }
  },
  {
    id: "tailgrep",
    category: "logs",
    title: "tail / grep / less",
    summary: "실시간 로그 추적과 키워드 필터링을 함께 사용합니다.",
    command: "tail -f /var/log/messages | grep --line-buffered ERROR",
    keywords: ["tail", "grep", "less", "follow", "filter"],
    variants: {
      rocky: {
        options: [
          { flag: "tail -f", desc: "파일 끝을 실시간 추적" },
          { flag: "grep -n", desc: "줄 번호 포함" },
          { flag: "--line-buffered", desc: "실시간 파이프 출력 보존" },
          { flag: "less +F", desc: "실시간 추적 후 인터랙티브 탐색" }
        ],
        examples: [
          { label: "오류만 실시간 추적", code: "tail -f /var/log/messages | grep --line-buffered ERROR" },
          { label: "긴 로그 검색", code: "less +F /var/log/messages" }
        ],
        diff: "Rocky는 /var/log/messages, /var/log/secure 같은 전통적인 위치를 자주 봅니다.",
        warnings: ["파이프에서 grep이 버퍼링되면 `--line-buffered`를 붙이세요."]
      },
      ubuntu: {
        options: [
          { flag: "tail -f", desc: "파일 끝을 실시간 추적" },
          { flag: "grep -n", desc: "줄 번호 포함" },
          { flag: "--line-buffered", desc: "실시간 파이프 출력 보존" },
          { flag: "less +F", desc: "실시간 추적 후 인터랙티브 탐색" }
        ],
        examples: [
          { label: "오류만 실시간 추적", code: "tail -f /var/log/syslog | grep --line-buffered ERROR" },
          { label: "긴 로그 검색", code: "less +F /var/log/syslog" }
        ],
        diff: "Ubuntu는 /var/log/syslog, /var/log/auth.log를 자주 봅니다.",
        warnings: ["파이프에서 grep이 버퍼링되면 `--line-buffered`를 붙이세요."]
      }
    }
  },
  {
    id: "vi-vim",
    category: "text",
    title: "vi / vim",
    summary: "운영 서버에서 가장 자주 여는 편집기. 저장, 검색, 치환, 복구까지 한 번에 익혀두면 편합니다.",
    command: "vi /etc/ssh/sshd_config",
    keywords: ["vi", "vim", "editor", "save", "quit", "search", "replace", "config"],
    variants: {
      rocky: {
        options: [
          { flag: "i / a / o", desc: "삽입 모드로 진입, 현재 위치 뒤/다음 줄에 입력" },
          { flag: "Esc", desc: "명령 모드로 복귀" },
          { flag: ":wq", desc: "저장 후 종료" },
          { flag: ":q!", desc: "저장하지 않고 종료" },
          { flag: "/pattern", desc: "문자열 검색" },
          { flag: ":%s/old/new/gc", desc: "전체 치환, 확인 후 적용" },
          { flag: ":set number", desc: "줄 번호 표시" },
          { flag: "u / Ctrl-r", desc: "되돌리기 / 다시 실행" }
        ],
        examples: [
          { label: "설정 파일 열기", code: "vi /etc/ssh/sshd_config" },
          { label: "특정 문자열 검색", code: "/PermitRootLogin" },
          { label: "전체 치환", code: ":%s/old_value/new_value/gc" },
          { label: "줄 번호 켜기", code: ":set number" }
        ],
        diff: "Rocky는 vim-minimal 또는 vim-enhanced 조합을 쓰는 경우가 많아, `vi`가 생각보다 심플할 수 있습니다.",
        warnings: [
          "명령 모드와 입력 모드를 헷갈리면 저장이 안 되거나 엉뚱한 문자가 들어갑니다.",
          "원격 서버에서 설정 파일을 바꿀 때는 `:q!`로 빠져나올 수 있는지 먼저 익혀두세요.",
          "대형 파일은 `vi`보다 `less`로 먼저 훑고 수정 범위를 좁히는 편이 안전합니다."
        ]
      },
      ubuntu: {
        options: [
          { flag: "i / a / o", desc: "삽입 모드로 진입, 현재 위치 뒤/다음 줄에 입력" },
          { flag: "Esc", desc: "명령 모드로 복귀" },
          { flag: ":wq", desc: "저장 후 종료" },
          { flag: ":q!", desc: "저장하지 않고 종료" },
          { flag: "/pattern", desc: "문자열 검색" },
          { flag: ":%s/old/new/gc", desc: "전체 치환, 확인 후 적용" },
          { flag: ":set number", desc: "줄 번호 표시" },
          { flag: "u / Ctrl-r", desc: "되돌리기 / 다시 실행" }
        ],
        examples: [
          { label: "설정 파일 열기", code: "vi /etc/ssh/sshd_config" },
          { label: "특정 문자열 검색", code: "/PasswordAuthentication" },
          { label: "전체 치환", code: ":%s/old_value/new_value/gc" },
          { label: "줄 번호 켜기", code: ":set number" }
        ],
        diff: "Ubuntu에서는 `vi`가 `vim-tiny` 또는 `vim` 링크인 경우가 많아, 배포판 기본 설정에 따라 기능 차이가 납니다.",
        warnings: [
          "명령 모드와 입력 모드를 헷갈리면 저장이 안 되거나 엉뚱한 문자가 들어갑니다.",
          "원격 서버에서 설정 파일을 바꿀 때는 `:q!`로 빠져나올 수 있는지 먼저 익혀두세요.",
          "대형 파일은 `vi`보다 `less`로 먼저 훑고 수정 범위를 좁히는 편이 안전합니다."
        ]
      }
    }
  },
  {
    id: "systemctl",
    category: "services",
    title: "systemctl",
    summary: "서비스 시작/중지/재시작/상태 확인의 표준입니다.",
    command: "systemctl status nginx && systemctl restart nginx",
    keywords: ["service", "daemon", "restart", "enable", "status"],
    variants: {
      rocky: {
        options: [
          { flag: "status", desc: "서비스 상태 확인" },
          { flag: "restart", desc: "서비스 재시작" },
          { flag: "enable", desc: "부팅 시 자동 시작" },
          { flag: "daemon-reload", desc: "유닛 변경 후 반영" }
        ],
        examples: [
          { label: "nginx 재시작", code: "systemctl restart nginx && systemctl status nginx --no-pager" },
          { label: "부팅 자동 시작", code: "systemctl enable nginx" }
        ],
        diff: "Rocky에서는 서비스 이름이 httpd, mariadb처럼 RHEL 계열 명칭인 경우가 많습니다.",
        warnings: ["유닛 파일을 수정했다면 `daemon-reload`를 잊지 마세요."]
      },
      ubuntu: {
        options: [
          { flag: "status", desc: "서비스 상태 확인" },
          { flag: "restart", desc: "서비스 재시작" },
          { flag: "enable", desc: "부팅 시 자동 시작" },
          { flag: "daemon-reload", desc: "유닛 변경 후 반영" }
        ],
        examples: [
          { label: "nginx 재시작", code: "systemctl restart nginx && systemctl status nginx --no-pager" },
          { label: "부팅 자동 시작", code: "systemctl enable nginx" }
        ],
        diff: "Ubuntu에서는 apache2, redis-server처럼 패키지명과 서비스명이 다를 수 있습니다.",
        warnings: ["유닛 파일을 수정했다면 `daemon-reload`를 잊지 마세요."]
      }
    }
  },
  {
    id: "packages",
    category: "packages",
    title: "dnf / apt / rpm / dpkg",
    summary: "배포판별로 가장 헷갈리는 패키지 관리 구간입니다.",
    command: "dnf install nginx || apt install nginx",
    keywords: ["install", "package", "update", "repo", "apt", "dnf"],
    variants: {
      rocky: {
        options: [
          { flag: "dnf install", desc: "패키지 설치" },
          { flag: "dnf update", desc: "업데이트" },
          { flag: "rpm -q", desc: "설치 여부 확인" },
          { flag: "dnf info", desc: "패키지 정보 확인" }
        ],
        examples: [
          { label: "nginx 설치", code: "dnf install -y nginx" },
          { label: "설치 여부 확인", code: "rpm -q nginx" }
        ],
        diff: "Rocky는 dnf가 표준이고, rpm은 개별 패키지 검사에 유용합니다.",
        warnings: ["리포지토리 구성 상태에 따라 패키지 이름이 달라질 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "apt install", desc: "패키지 설치" },
          { flag: "apt update", desc: "패키지 목록 갱신" },
          { flag: "dpkg -l", desc: "설치 여부 확인" },
          { flag: "apt show", desc: "패키지 정보 확인" }
        ],
        examples: [
          { label: "nginx 설치", code: "apt update && apt install -y nginx" },
          { label: "설치 여부 확인", code: "dpkg -l | grep nginx" }
        ],
        diff: "Ubuntu는 apt를 표준으로 쓰고, 개별 패키지 정보는 dpkg가 편합니다.",
        warnings: ["패키지 설치 전에 `apt update`를 습관화하세요."]
      }
    }
  },
  {
    id: "firewall",
    category: "network",
    title: "firewall / ufw",
    summary: "서비스 포트 열림 여부와 방화벽 예외를 관리합니다.",
    command: "firewall-cmd --list-all || ufw status verbose",
    keywords: ["firewall", "port", "allow", "rule", "ufw", "firewalld"],
    variants: {
      rocky: {
        options: [
          { flag: "firewall-cmd --list-all", desc: "현재 방화벽 설정 확인" },
          { flag: "--add-port", desc: "포트 추가" },
          { flag: "--reload", desc: "규칙 반영" },
          { flag: "--permanent", desc: "영구 저장" }
        ],
        examples: [
          { label: "80/tcp 열기", code: "firewall-cmd --permanent --add-port=80/tcp && firewall-cmd --reload" },
          { label: "규칙 확인", code: "firewall-cmd --list-all" }
        ],
        diff: "Rocky는 firewalld가 기본인 경우가 많습니다.",
        warnings: ["`--permanent` 후 `--reload`를 안 하면 반영이 안 된 것처럼 보일 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "ufw status verbose", desc: "현재 상태와 규칙 확인" },
          { flag: "ufw allow", desc: "포트 허용" },
          { flag: "ufw deny", desc: "포트 차단" },
          { flag: "ufw enable", desc: "방화벽 활성화" }
        ],
        examples: [
          { label: "80/tcp 열기", code: "ufw allow 80/tcp" },
          { label: "규칙 확인", code: "ufw status numbered" }
        ],
        diff: "Ubuntu는 ufw가 가장 간단하고, 실제 하부는 nftables/iptables를 거칩니다.",
        warnings: ["원격 접속 중 ufw를 켤 때는 SSH 허용 규칙부터 먼저 넣으세요."]
      }
    }
  },
  {
    id: "ss",
    category: "network",
    title: "ss / ip / curl / dig",
    summary: "포트, 인터페이스, HTTP 응답, DNS를 빠르게 확인합니다.",
    command: "ss -tulnp && ip a && curl -I https://example.com",
    keywords: ["socket", "port", "network", "dns", "curl", "ip"],
    variants: {
      rocky: {
        options: [
          { flag: "ss -tulnp", desc: "열린 포트와 프로세스 보기" },
          { flag: "ip a", desc: "인터페이스와 IP 확인" },
          { flag: "curl -I", desc: "헤더만 확인" },
          { flag: "dig +short", desc: "DNS 질의 결과만 간단히 보기" }
        ],
        examples: [
          { label: "포트 점검", code: "ss -tulnp | grep :443" },
          { label: "DNS 확인", code: "dig +short google.com" }
        ],
        diff: "Rocky는 네트워크 트러블슈팅 때 ss/ip/curl 조합이 가장 빠릅니다.",
        warnings: ["`netstat`보다 `ss`가 더 현대적이고 빠릅니다."]
      },
      ubuntu: {
        options: [
          { flag: "ss -tulnp", desc: "열린 포트와 프로세스 보기" },
          { flag: "ip a", desc: "인터페이스와 IP 확인" },
          { flag: "curl -I", desc: "헤더만 확인" },
          { flag: "dig +short", desc: "DNS 질의 결과만 간단히 보기" }
        ],
        examples: [
          { label: "포트 점검", code: "ss -tulnp | grep :443" },
          { label: "DNS 확인", code: "dig +short google.com" }
        ],
        diff: "Ubuntu도 동일하지만, 네트워크 설정은 netplan 상태까지 같이 보는 편이 좋습니다.",
        warnings: ["`netstat`보다 `ss`가 더 현대적이고 빠릅니다."]
      }
    }
  },
  {
    id: "scp",
    category: "remote",
    title: "ssh / scp / sftp",
    summary: "원격 접속, 파일 복사, 전송 디버깅을 위한 기본 도구입니다.",
    command: "ssh user@host && scp file user@host:/tmp/",
    keywords: ["ssh", "remote", "copy", "key", "sftp"],
    variants: {
      rocky: {
        options: [
          { flag: "ssh user@host", desc: "원격 접속" },
          { flag: "scp", desc: "파일 복사" },
          { flag: "-i key", desc: "개인키 지정" },
          { flag: "-v", desc: "디버그 로그" }
        ],
        examples: [
          { label: "포트 바꿔서 접속", code: "ssh -p 2222 -i ~/.ssh/id_ed25519 user@host" },
          { label: "원격으로 파일 전송", code: "scp ./app.tar.gz user@host:/tmp/" }
        ],
        diff: "Rocky는 SELinux와 함께 authorized_keys 권한 문제를 같이 살펴봐야 합니다.",
        warnings: ["개인키 권한이 느슨하면 SSH가 접속을 거부할 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "ssh user@host", desc: "원격 접속" },
          { flag: "scp", desc: "파일 복사" },
          { flag: "-i key", desc: "개인키 지정" },
          { flag: "-v", desc: "디버그 로그" }
        ],
        examples: [
          { label: "포트 바꿔서 접속", code: "ssh -p 2222 -i ~/.ssh/id_ed25519 user@host" },
          { label: "원격으로 파일 전송", code: "scp ./app.tar.gz user@host:/tmp/" }
        ],
        diff: "Ubuntu는 홈 디렉토리 권한과 authorized_keys 위치를 먼저 확인하면 대부분 해결됩니다.",
        warnings: ["개인키 권한이 느슨하면 SSH가 접속을 거부할 수 있습니다."]
      }
    }
  },
  {
    id: "tar",
    category: "backup",
    title: "tar / rsync",
    summary: "압축 백업과 증분 전송의 기본 조합입니다.",
    command: "tar -czf backup.tar.gz /data && rsync -avh /src/ user@host:/dst/",
    keywords: ["backup", "archive", "sync", "copy", "compress"],
    variants: {
      rocky: {
        options: [
          { flag: "-c", desc: "새 아카이브 생성" },
          { flag: "-z", desc: "gzip 압축" },
          { flag: "-f", desc: "파일명 지정" },
          { flag: "rsync -a", desc: "속성 유지 동기화" }
        ],
        examples: [
          { label: "설정 백업", code: "tar -czf /backup/app-$(date +%F).tgz /etc/app" },
          { label: "원격 동기화", code: "rsync -avh --delete /data/ user@host:/backup/data/" }
        ],
        diff: "Rocky에서는 백업 대상 경로에 SELinux 컨텍스트가 섞여 있으면 복원 후 확인이 필요합니다.",
        warnings: ["`--delete`는 대상에서 없는 파일을 지웁니다. 목적을 확실히 하고 사용하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-c", desc: "새 아카이브 생성" },
          { flag: "-z", desc: "gzip 압축" },
          { flag: "-f", desc: "파일명 지정" },
          { flag: "rsync -a", desc: "속성 유지 동기화" }
        ],
        examples: [
          { label: "설정 백업", code: "tar -czf /backup/app-$(date +%F).tgz /etc/app" },
          { label: "원격 동기화", code: "rsync -avh --delete /data/ user@host:/backup/data/" }
        ],
        diff: "Ubuntu도 동일하지만, snap 경로나 서비스별 데이터 디렉토리는 제외 목록을 별도로 두는 편이 좋습니다.",
        warnings: ["`--delete`는 대상에서 없는 파일을 지웁니다. 목적을 확실히 하고 사용하세요."]
      }
    }
  },
  {
    id: "text",
    category: "text",
    title: "grep / awk / sed / cut / sort / uniq",
    summary: "로그와 텍스트를 잘라내고 집계할 때 가장 많이 쓰는 도구들입니다.",
    command: "grep ERROR app.log | awk '{print $2}' | sort | uniq -c | sort -nr",
    keywords: ["text", "parse", "filter", "column", "sort", "uniq"],
    variants: {
      rocky: {
        options: [
          { flag: "grep -n", desc: "줄 번호 포함" },
          { flag: "awk '{print $2}'", desc: "컬럼 추출" },
          { flag: "sort | uniq -c", desc: "중복 집계" },
          { flag: "cut -d: -f1", desc: "구분자로 특정 필드 추출" }
        ],
        examples: [
          { label: "에러 타입 집계", code: "grep ERROR app.log | awk '{print $5}' | sort | uniq -c | sort -nr" },
          { label: "상위 IP 집계", code: "awk '{print $1}' access.log | sort | uniq -c | sort -nr | head" }
        ],
        diff: "Rocky/Ubuntu 차이보다 쉘 인용문자와 공백 처리 실수가 더 자주 문제를 일으킵니다.",
        warnings: ["awk/sed는 입력 포맷이 바뀌면 쉽게 깨지므로 로그 포맷을 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "grep -n", desc: "줄 번호 포함" },
          { flag: "awk '{print $2}'", desc: "컬럼 추출" },
          { flag: "sort | uniq -c", desc: "중복 집계" },
          { flag: "cut -d: -f1", desc: "구분자로 특정 필드 추출" }
        ],
        examples: [
          { label: "에러 타입 집계", code: "grep ERROR app.log | awk '{print $5}' | sort | uniq -c | sort -nr" },
          { label: "상위 IP 집계", code: "awk '{print $1}' access.log | sort | uniq -c | sort -nr | head" }
        ],
        diff: "Ubuntu도 동일합니다. 텍스트 처리 도구는 배포판보다 패턴 기억이 중요합니다.",
        warnings: ["awk/sed는 입력 포맷이 바뀌면 쉽게 깨지므로 로그 포맷을 확인하세요."]
      }
    }
  },
  {
    id: "k8s",
    category: "containers",
    title: "docker / kubectl / crictl",
    summary: "컨테이너와 쿠버네티스 상태를 볼 때 사용하는 표준 도구입니다.",
    command: "docker ps && kubectl get pods -A && crictl ps",
    keywords: ["container", "pod", "docker", "kubectl", "k8s"],
    variants: {
      rocky: {
        options: [
          { flag: "docker ps", desc: "컨테이너 목록" },
          { flag: "kubectl get pods -A", desc: "전체 네임스페이스 Pod 확인" },
          { flag: "crictl ps", desc: "CRI 런타임 기준 컨테이너 확인" },
          { flag: "kubectl describe", desc: "상세 이벤트 확인" }
        ],
        examples: [
          { label: "문제 Pod 확인", code: "kubectl get pods -A | grep CrashLoop" },
          { label: "노드 런타임 확인", code: "crictl ps -a" }
        ],
        diff: "Rocky는 서버 운영 환경에서 containerd/cri-o를 많이 보며, crictl이 유용합니다.",
        warnings: ["Docker만 보고 끝내지 말고 실제 런타임이 무엇인지 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "docker ps", desc: "컨테이너 목록" },
          { flag: "kubectl get pods -A", desc: "전체 네임스페이스 Pod 확인" },
          { flag: "crictl ps", desc: "CRI 런타임 기준 컨테이너 확인" },
          { flag: "kubectl describe", desc: "상세 이벤트 확인" }
        ],
        examples: [
          { label: "문제 Pod 확인", code: "kubectl get pods -A | grep CrashLoop" },
          { label: "노드 런타임 확인", code: "crictl ps -a" }
        ],
        diff: "Ubuntu는 개발용 Docker 환경이 더 흔하고, 운영은 containerd를 함께 보는 경우가 많습니다.",
        warnings: ["Docker만 보고 끝내지 말고 실제 런타임이 무엇인지 확인하세요."]
      }
    }
  },
  {
    id: "trouble",
    category: "troubleshoot",
    title: "one-liner triage",
    summary: "장애 초기에 바로 보는 점검 순서입니다.",
    command: "uptime && free -h && df -h && ss -tulnp",
    keywords: ["triage", "incident", "health", "quick check"],
    variants: {
      rocky: {
        options: [
          { flag: "uptime", desc: "로드 평균과 가동 시간" },
          { flag: "free -h", desc: "메모리 압박" },
          { flag: "df -h", desc: "디스크 용량" },
          { flag: "ss -tulnp", desc: "포트와 프로세스" }
        ],
        examples: [
          { label: "장애 첫 1분", code: "uptime && free -h && df -h && ss -tulnp" }
        ],
        diff: "Rocky에서는 여기에 journalctl까지 붙이면 대부분의 1차 점검이 끝납니다.",
        warnings: ["한 번에 너무 많은 명령을 넣기보다 상태부터 빠르게 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "uptime", desc: "로드 평균과 가동 시간" },
          { flag: "free -h", desc: "메모리 압박" },
          { flag: "df -h", desc: "디스크 용량" },
          { flag: "ss -tulnp", desc: "포트와 프로세스" }
        ],
        examples: [
          { label: "장애 첫 1분", code: "uptime && free -h && df -h && ss -tulnp" }
        ],
        diff: "Ubuntu에서는 여기에 journalctl과 syslog 확인을 함께 넣는 편이 좋습니다.",
        warnings: ["한 번에 너무 많은 명령을 넣기보다 상태부터 빠르게 확인하세요."]
      }
    }
  },
  {
    id: "grep",
    category: "text",
    title: "grep",
    summary: "로그와 텍스트에서 원하는 패턴만 빠르게 걸러냅니다.",
    command: "grep -Rni ERROR /var/log/app",
    keywords: ["filter", "search", "pattern", "match"],
    variants: {
      rocky: {
        options: [
          { flag: "-n", desc: "줄 번호 포함" },
          { flag: "-i", desc: "대소문자 무시" },
          { flag: "-R", desc: "하위 디렉토리 재귀 검색" },
          { flag: "--color=auto", desc: "매칭 부분 강조" }
        ],
        examples: [
          { label: "에러 키워드 찾기", code: "grep -Rni ERROR /var/log" },
          { label: "접속 로그에서 특정 IP 찾기", code: "grep -n '10.10.10.10' access.log" }
        ],
        diff: "Rocky와 Ubuntu 모두 동일합니다. grep은 가장 먼저 익혀두면 좋은 텍스트 필터입니다.",
        warnings: ["큰 디렉토리를 재귀 검색할 때는 제외 경로를 같이 생각하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-n", desc: "줄 번호 포함" },
          { flag: "-i", desc: "대소문자 무시" },
          { flag: "-R", desc: "하위 디렉토리 재귀 검색" },
          { flag: "--color=auto", desc: "매칭 부분 강조" }
        ],
        examples: [
          { label: "에러 키워드 찾기", code: "grep -Rni ERROR /var/log" },
          { label: "접속 로그에서 특정 IP 찾기", code: "grep -n '10.10.10.10' access.log" }
        ],
        diff: "Ubuntu도 동일합니다. 재귀 검색은 권한 오류가 섞이니 stderr를 분리해 보는 습관이 좋습니다.",
        warnings: ["큰 디렉토리를 재귀 검색할 때는 제외 경로를 같이 생각하세요."]
      }
    }
  },
  {
    id: "less",
    category: "text",
    title: "less",
    summary: "긴 로그를 스크롤하면서 찾기 좋은 뷰어입니다.",
    command: "less +F /var/log/messages",
    keywords: ["viewer", "pager", "log viewer", "scroll"],
    variants: {
      rocky: {
        options: [
          { flag: "+F", desc: "실시간 추적 후 보기" },
          { flag: "/pattern", desc: "문자열 검색" },
          { flag: "n / N", desc: "다음/이전 검색 결과 이동" },
          { flag: "Shift+G", desc: "맨 아래로 이동" }
        ],
        examples: [
          { label: "실시간 로그 추적", code: "less +F /var/log/messages" },
          { label: "검색 후 위아래 이동", code: "less /var/log/messages" }
        ],
        diff: "Rocky에서는 journalctl과 less를 같이 쓰면 긴 로그 분석이 편합니다.",
        warnings: ["실시간 추적 중에는 `Ctrl+C` 대신 `q`로 종료하는 습관이 편합니다."]
      },
      ubuntu: {
        options: [
          { flag: "+F", desc: "실시간 추적 후 보기" },
          { flag: "/pattern", desc: "문자열 검색" },
          { flag: "n / N", desc: "다음/이전 검색 결과 이동" },
          { flag: "Shift+G", desc: "맨 아래로 이동" }
        ],
        examples: [
          { label: "실시간 로그 추적", code: "less +F /var/log/syslog" },
          { label: "검색 후 위아래 이동", code: "less /var/log/syslog" }
        ],
        diff: "Ubuntu는 syslog, auth.log 같은 파일을 less로 보는 경우가 많습니다.",
        warnings: ["실시간 추적 중에는 `Ctrl+C` 대신 `q`로 종료하는 습관이 편합니다."]
      }
    }
  },
  {
    id: "headtail",
    category: "text",
    title: "head / tail",
    summary: "파일 앞부분이나 끝부분을 빠르게 확인합니다.",
    command: "head -n 20 file && tail -n 50 file",
    keywords: ["first lines", "last lines", "preview", "follow"],
    variants: {
      rocky: {
        options: [
          { flag: "head -n", desc: "앞에서 N줄 확인" },
          { flag: "tail -n", desc: "뒤에서 N줄 확인" },
          { flag: "tail -f", desc: "실시간 추적" },
          { flag: "tail -F", desc: "파일 교체에도 추적 유지" }
        ],
        examples: [
          { label: "설정 파일 상단 확인", code: "head -n 30 /etc/nginx/nginx.conf" },
          { label: "에러 로그 끝부분 보기", code: "tail -n 100 /var/log/messages" }
        ],
        diff: "Rocky와 Ubuntu 모두 동일합니다.",
        warnings: ["로그 회전이 있는 파일은 `tail -F`가 더 안전합니다."]
      },
      ubuntu: {
        options: [
          { flag: "head -n", desc: "앞에서 N줄 확인" },
          { flag: "tail -n", desc: "뒤에서 N줄 확인" },
          { flag: "tail -f", desc: "실시간 추적" },
          { flag: "tail -F", desc: "파일 교체에도 추적 유지" }
        ],
        examples: [
          { label: "설정 파일 상단 확인", code: "head -n 30 /etc/nginx/nginx.conf" },
          { label: "에러 로그 끝부분 보기", code: "tail -n 100 /var/log/syslog" }
        ],
        diff: "Ubuntu도 동일합니다.",
        warnings: ["로그 회전이 있는 파일은 `tail -F`가 더 안전합니다."]
      }
    }
  },
  {
    id: "iproute",
    category: "network",
    title: "ip route / ip addr",
    summary: "라우팅과 네트워크 인터페이스를 빠르게 봅니다.",
    command: "ip addr && ip route",
    keywords: ["route", "address", "gateway", "network interface"],
    variants: {
      rocky: {
        options: [
          { flag: "ip addr", desc: "주소와 인터페이스 확인" },
          { flag: "ip route", desc: "기본 게이트웨이와 라우팅 테이블" },
          { flag: "ip neigh", desc: "ARP/Neighbor 상태" },
          { flag: "ip link", desc: "링크 상태" }
        ],
        examples: [
          { label: "게이트웨이 확인", code: "ip route | grep default" },
          { label: "인터페이스 상태", code: "ip -br a" }
        ],
        diff: "Rocky에서는 NetworkManager 기반 설정과 함께 보는 것이 좋습니다.",
        warnings: ["서버 원격 작업 중 네트워크 명령은 연결 끊김을 유발할 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "ip addr", desc: "주소와 인터페이스 확인" },
          { flag: "ip route", desc: "기본 게이트웨이와 라우팅 테이블" },
          { flag: "ip neigh", desc: "ARP/Neighbor 상태" },
          { flag: "ip link", desc: "링크 상태" }
        ],
        examples: [
          { label: "게이트웨이 확인", code: "ip route | grep default" },
          { label: "인터페이스 상태", code: "ip -br a" }
        ],
        diff: "Ubuntu에서는 netplan 설정과 실제 ip route 결과를 같이 보는 편이 좋습니다.",
        warnings: ["서버 원격 작업 중 네트워크 명령은 연결 끊김을 유발할 수 있습니다."]
      }
    }
  },
  {
    id: "nmcli",
    category: "network",
    title: "nmcli",
    summary: "NetworkManager 설정과 활성 연결을 다룰 때 유용합니다.",
    command: "nmcli dev status && nmcli con show",
    keywords: ["networkmanager", "connection", "device", "wifi", "ethernet"],
    variants: {
      rocky: {
        options: [
          { flag: "nmcli dev status", desc: "장치 상태 확인" },
          { flag: "nmcli con show", desc: "연결 프로필 확인" },
          { flag: "nmcli con up/down", desc: "연결 활성/비활성" },
          { flag: "nmcli con mod", desc: "프로필 수정" }
        ],
        examples: [
          { label: "활성 연결 보기", code: "nmcli -p con show --active" },
          { label: "장치 상태 보기", code: "nmcli dev status" }
        ],
        diff: "Rocky는 서버에서도 nmcli를 자주 사용하고, GUI보다 이쪽이 더 실용적입니다.",
        warnings: ["정적 IP나 DNS 수정은 원격 접속 유지 상태를 먼저 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "nmcli dev status", desc: "장치 상태 확인" },
          { flag: "nmcli con show", desc: "연결 프로필 확인" },
          { flag: "nmcli con up/down", desc: "연결 활성/비활성" },
          { flag: "nmcli con mod", desc: "프로필 수정" }
        ],
        examples: [
          { label: "활성 연결 보기", code: "nmcli -p con show --active" },
          { label: "장치 상태 보기", code: "nmcli dev status" }
        ],
        diff: "Ubuntu 서버는 netplan이 상위 설정이지만 실제 링크 상태는 nmcli로 보는 경우가 많습니다.",
        warnings: ["정적 IP나 DNS 수정은 원격 접속 유지 상태를 먼저 확인하세요."]
      }
    }
  },
  {
    id: "lsblk",
    category: "storage",
    title: "lsblk / blkid",
    summary: "디스크, 파티션, UUID를 빠르게 확인합니다.",
    command: "lsblk -f && blkid",
    keywords: ["block", "disk", "partition", "uuid", "filesystem"],
    variants: {
      rocky: {
        options: [
          { flag: "lsblk -f", desc: "파일시스템과 UUID 확인" },
          { flag: "lsblk -o", desc: "출력 열 지정" },
          { flag: "blkid", desc: "UUID와 타입 확인" },
          { flag: "parted -l", desc: "파티션 테이블 요약" }
        ],
        examples: [
          { label: "마운트 전 디스크 확인", code: "lsblk -f" },
          { label: "UUID 찾기", code: "blkid /dev/nvme0n1p1" }
        ],
        diff: "Rocky는 신규 볼륨 마운트 전 UUID 기반 설정을 자주 씁니다.",
        warnings: ["장치명을 잘못 보면 데이터가 날아갈 수 있으니 읽기 전용 확인부터 하세요."]
      },
      ubuntu: {
        options: [
          { flag: "lsblk -f", desc: "파일시스템과 UUID 확인" },
          { flag: "lsblk -o", desc: "출력 열 지정" },
          { flag: "blkid", desc: "UUID와 타입 확인" },
          { flag: "parted -l", desc: "파티션 테이블 요약" }
        ],
        examples: [
          { label: "마운트 전 디스크 확인", code: "lsblk -f" },
          { label: "UUID 찾기", code: "blkid /dev/sda1" }
        ],
        diff: "Ubuntu에서도 동일하지만, 클라우드 환경에서는 `/dev/nvme*` 계열 장치명이 자주 보입니다.",
        warnings: ["장치명을 잘못 보면 데이터가 날아갈 수 있으니 읽기 전용 확인부터 하세요."]
      }
    }
  },
  {
    id: "mount",
    category: "storage",
    title: "mount / umount",
    summary: "파일시스템을 연결하거나 해제합니다.",
    command: "mount /dev/nvme0n1p1 /data && umount /data",
    keywords: ["filesystem", "attach", "detach", "fstab"],
    variants: {
      rocky: {
        options: [
          { flag: "mount", desc: "현재 마운트 확인" },
          { flag: "mount -a", desc: "fstab 전체 반영" },
          { flag: "umount", desc: "마운트 해제" },
          { flag: "findmnt", desc: "마운트 트리 확인" }
        ],
        examples: [
          { label: "임시 마운트", code: "mount /dev/nvme0n1p1 /data" },
          { label: "fstab 반영", code: "mount -a" }
        ],
        diff: "Rocky는 fstab과 SELinux 컨텍스트까지 같이 보는 편이 좋습니다.",
        warnings: ["사용 중인 디바이스를 `umount`하면 서비스가 바로 영향을 받습니다."]
      },
      ubuntu: {
        options: [
          { flag: "mount", desc: "현재 마운트 확인" },
          { flag: "mount -a", desc: "fstab 전체 반영" },
          { flag: "umount", desc: "마운트 해제" },
          { flag: "findmnt", desc: "마운트 트리 확인" }
        ],
        examples: [
          { label: "임시 마운트", code: "mount /dev/sdb1 /data" },
          { label: "fstab 반영", code: "mount -a" }
        ],
        diff: "Ubuntu도 동일하지만, cloud-init로 만들어진 디스크는 fstab 관리 방식을 확인하는 게 좋습니다.",
        warnings: ["사용 중인 디바이스를 `umount`하면 서비스가 바로 영향을 받습니다."]
      }
    }
  },
  {
    id: "crontab",
    category: "services",
    title: "crontab",
    summary: "반복 작업을 예약할 때 쓰는 기본 도구입니다.",
    command: "crontab -e",
    keywords: ["schedule", "cron", "timer", "job"],
    variants: {
      rocky: {
        options: [
          { flag: "-e", desc: "크론 편집" },
          { flag: "-l", desc: "현재 작업 목록" },
          { flag: "-r", desc: "전체 삭제" },
          { flag: "systemctl list-timers", desc: "systemd 타이머 확인" }
        ],
        examples: [
          { label: "매일 새벽 3시", code: "0 3 * * * /usr/local/bin/backup.sh" },
          { label: "타이머 확인", code: "systemctl list-timers --all" }
        ],
        diff: "Rocky에서는 crontab보다 systemd timer로 바꾸는 경우도 많습니다.",
        warnings: ["`crontab -r`는 즉시 삭제되니 실수하지 않도록 주의하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-e", desc: "크론 편집" },
          { flag: "-l", desc: "현재 작업 목록" },
          { flag: "-r", desc: "전체 삭제" },
          { flag: "systemctl list-timers", desc: "systemd 타이머 확인" }
        ],
        examples: [
          { label: "매일 새벽 3시", code: "0 3 * * * /usr/local/bin/backup.sh" },
          { label: "타이머 확인", code: "systemctl list-timers --all" }
        ],
        diff: "Ubuntu도 동일하지만, 주기 작업은 cron보다 systemd timer가 더 관리하기 쉬울 수 있습니다.",
        warnings: ["`crontab -r`는 즉시 삭제되니 실수하지 않도록 주의하세요."]
      }
    }
  },
  {
    id: "sudo",
    category: "users",
    title: "sudo / su / id",
    summary: "권한 전환과 사용자 확인의 기본 명령어입니다.",
    command: "id && sudo -l && sudo -i",
    keywords: ["root", "privilege", "user", "group", "admin"],
    variants: {
      rocky: {
        options: [
          { flag: "id", desc: "현재 사용자와 그룹 확인" },
          { flag: "sudo -l", desc: "허용된 sudo 권한 확인" },
          { flag: "sudo -i", desc: "루트 셸 진입" },
          { flag: "su -", desc: "루트 또는 다른 사용자 전환" }
        ],
        examples: [
          { label: "내 권한 확인", code: "id && groups" },
          { label: "루트 셸 진입", code: "sudo -i" }
        ],
        diff: "Rocky에서는 wheel 그룹이 sudo 권한의 중심입니다.",
        warnings: ["무분별한 `sudo` 사용보다 현재 권한과 그룹을 먼저 보는 습관이 좋습니다."]
      },
      ubuntu: {
        options: [
          { flag: "id", desc: "현재 사용자와 그룹 확인" },
          { flag: "sudo -l", desc: "허용된 sudo 권한 확인" },
          { flag: "sudo -i", desc: "루트 셸 진입" },
          { flag: "su -", desc: "루트 또는 다른 사용자 전환" }
        ],
        examples: [
          { label: "내 권한 확인", code: "id && groups" },
          { label: "루트 셸 진입", code: "sudo -i" }
        ],
        diff: "Ubuntu는 sudo 그룹이 기본적으로 많이 보입니다.",
        warnings: ["무분별한 `sudo` 사용보다 현재 권한과 그룹을 먼저 보는 습관이 좋습니다."]
      }
    }
  },
  {
    id: "nvidia-smi",
    category: "gpu",
    title: "nvidia-smi",
    summary: "NVIDIA GPU의 상태, 전력, 온도, 메모리, 클럭, MIG, 토폴로지를 확인합니다.",
    command: "watch -n 1 nvidia-smi",
    keywords: ["gpu", "cuda", "driver", "power", "mig", "topology"],
    variants: {
      rocky: {
        options: [
          { flag: "nvidia-smi -L", desc: "GPU 목록과 UUID 확인" },
          { flag: "nvidia-smi -q", desc: "상세 상태/드라이버/전력/온도 정보" },
          { flag: "--query-gpu=...", desc: "필드별 CSV 조회" },
          { flag: "nvidia-smi dmon", desc: "실시간 사용량/전력/클럭 모니터링" },
          { flag: "nvidia-smi pmon", desc: "프로세스별 GPU 사용률 모니터링" },
          { flag: "nvidia-smi topo -m", desc: "GPU 간 PCIe/NVLink 토폴로지" },
          { flag: "nvidia-smi mig -lgi", desc: "MIG 인스턴스 확인" },
          { flag: "nvidia-smi -pm 1", desc: "Persistence Mode 활성화" },
          { flag: "nvidia-smi -pl 350", desc: "전력 제한 설정" }
        ],
        examples: [
          {
            label: "1초마다 상태 보기",
            code: "watch -n 1 nvidia-smi"
          },
          {
            label: "운영용 주요 지표만 CSV로 보기",
            code:
              "nvidia-smi --query-gpu=index,name,uuid,driver_version,pstate,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw,power.limit --format=csv,noheader,nounits"
          },
          {
            label: "전력/클럭/사용량 실시간 확인",
            code: "nvidia-smi dmon -s pucvmet"
          },
          {
            label: "토폴로지 확인",
            code: "nvidia-smi topo -m"
          }
        ],
        diff: "Rocky와 Ubuntu에서 nvidia-smi 명령 자체는 거의 같고, 차이는 드라이버 설치 방식과 서비스 관리 쪽에 있습니다.",
        warnings: [
          "전력 제한이나 persistence mode 변경은 관리자 권한이 필요합니다.",
          "MIG 관련 변경은 실행 중인 워크로드에 영향을 줄 수 있습니다.",
          "드라이버 버전에 따라 일부 필드나 옵션이 보이지 않을 수 있습니다."
        ]
      },
      ubuntu: {
        options: [
          { flag: "nvidia-smi -L", desc: "GPU 목록과 UUID 확인" },
          { flag: "nvidia-smi -q", desc: "상세 상태/드라이버/전력/온도 정보" },
          { flag: "--query-gpu=...", desc: "필드별 CSV 조회" },
          { flag: "nvidia-smi dmon", desc: "실시간 사용량/전력/클럭 모니터링" },
          { flag: "nvidia-smi pmon", desc: "프로세스별 GPU 사용률 모니터링" },
          { flag: "nvidia-smi topo -m", desc: "GPU 간 PCIe/NVLink 토폴로지" },
          { flag: "nvidia-smi mig -lgi", desc: "MIG 인스턴스 확인" },
          { flag: "nvidia-smi -pm 1", desc: "Persistence Mode 활성화" },
          { flag: "nvidia-smi -pl 350", desc: "전력 제한 설정" }
        ],
        examples: [
          {
            label: "1초마다 상태 보기",
            code: "watch -n 1 nvidia-smi"
          },
          {
            label: "운영용 주요 지표만 CSV로 보기",
            code:
              "nvidia-smi --query-gpu=index,name,uuid,driver_version,pstate,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw,power.limit --format=csv,noheader,nounits"
          },
          {
            label: "전력/클럭/사용량 실시간 확인",
            code: "nvidia-smi dmon -s pucvmet"
          },
          {
            label: "토폴로지 확인",
            code: "nvidia-smi topo -m"
          }
        ],
        diff: "Ubuntu와 Rocky 모두 명령은 거의 같고, 드라이버 배포판 패키지와 커널 모듈 관리 방식이 다릅니다.",
        warnings: [
          "전력 제한이나 persistence mode 변경은 관리자 권한이 필요합니다.",
          "MIG 관련 변경은 실행 중인 워크로드에 영향을 줄 수 있습니다.",
          "드라이버 버전에 따라 일부 필드나 옵션이 보이지 않을 수 있습니다."
        ]
      }
    }
  },
  {
    id: "top-htop",
    category: "process",
    title: "top / htop",
    summary: "실시간 CPU, 메모리, 스레드, 프로세스 정렬을 빠르게 바꾸는 모니터링 조합입니다.",
    command: "top && htop",
    keywords: ["cpu", "memory", "process", "live", "interactive"],
    variants: {
      rocky: {
        options: [
          { flag: "top", desc: "실시간 보기" },
          { flag: "top -o %MEM", desc: "메모리 순 정렬" },
          { flag: "top -o %CPU", desc: "CPU 순 정렬" },
          { flag: "top -u nginx", desc: "특정 사용자 프로세스만 보기" },
          { flag: "top -p <pid>", desc: "지정 PID만 추적" },
          { flag: "top -b -n 1", desc: "배치 모드로 한 번만 출력" },
          { flag: "htop F5", desc: "트리 보기" },
          { flag: "htop F6", desc: "정렬 기준 변경" },
          { flag: "htop F9", desc: "프로세스 종료" }
        ],
        examples: [
          { label: "메모리 높은 프로세스", code: "top -o %MEM" },
          { label: "CPU 높은 프로세스", code: "top -o %CPU" },
          { label: "특정 프로세스만 보기", code: "top -p 1234" },
          { label: "트리 형태 보기", code: "htop" }
        ],
        diff: "Rocky는 htop이 기본 설치가 아닐 수 있어서 `dnf install htop` 또는 EPEL 추가가 필요할 수 있습니다.",
        warnings: [
          "`top` 화면에서는 `P`로 CPU 정렬, `M`으로 메모리 정렬, `H`로 스레드 표시를 즉시 바꿀 수 있습니다.",
          "배치형 점검은 `top -b -n 1 | head -n 30`처럼 잘라서 보는 편이 로그 스크립트에 더 적합합니다.",
          "프로세스 종료는 `k`를 누르면 되지만, 운영 중에는 `systemctl`로 서비스 단위부터 확인하는 게 안전합니다."
        ]
      },
      ubuntu: {
        options: [
          { flag: "top", desc: "실시간 보기" },
          { flag: "top -o %MEM", desc: "메모리 순 정렬" },
          { flag: "top -o %CPU", desc: "CPU 순 정렬" },
          { flag: "top -u nginx", desc: "특정 사용자 프로세스만 보기" },
          { flag: "top -p <pid>", desc: "지정 PID만 추적" },
          { flag: "top -b -n 1", desc: "배치 모드로 한 번만 출력" },
          { flag: "htop F5", desc: "트리 보기" },
          { flag: "htop F6", desc: "정렬 기준 변경" },
          { flag: "htop F9", desc: "프로세스 종료" }
        ],
        examples: [
          { label: "메모리 높은 프로세스", code: "top -o %MEM" },
          { label: "CPU 높은 프로세스", code: "top -o %CPU" },
          { label: "특정 프로세스만 보기", code: "top -p 1234" },
          { label: "트리 형태 보기", code: "htop" }
        ],
        diff: "Ubuntu는 htop 설치가 비교적 간단하고, 서버 에디션에서도 인터랙티브 진단에 많이 씁니다.",
        warnings: [
          "`top` 화면에서는 `P`로 CPU 정렬, `M`으로 메모리 정렬, `H`로 스레드 표시를 즉시 바꿀 수 있습니다.",
          "배치형 점검은 `top -b -n 1 | head -n 30`처럼 잘라서 보는 편이 로그 스크립트에 더 적합합니다.",
          "프로세스 종료는 `k`를 누르면 되지만, 운영 중에는 `systemctl`로 서비스 단위부터 확인하는 게 안전합니다."
        ]
      }
    }
  },
  {
    id: "proc-control",
    category: "process",
    title: "pkill / killall / nice / renice",
    summary: "이름으로 종료하고 우선순위까지 조정합니다.",
    command: "pkill nginx && nice -n 10 job && renice 5 -p <pid>",
    keywords: ["terminate", "priority", "signal", "schedule"],
    variants: {
      rocky: {
        options: [
          { flag: "pkill -f", desc: "커맨드라인 기준 종료" },
          { flag: "killall", desc: "이름이 같은 프로세스 종료" },
          { flag: "nice -n", desc: "새 프로세스 우선순위 지정" },
          { flag: "renice", desc: "실행 중 프로세스 우선순위 변경" }
        ],
        examples: [
          { label: "nginx 종료", code: "pkill -TERM nginx" },
          { label: "배치 우선순위 낮추기", code: "nice -n 10 backup.sh" }
        ],
        diff: "공통입니다.",
        warnings: ["강제 종료보다 정상 종료를 먼저 시도하세요."]
      },
      ubuntu: {
        options: [
          { flag: "pkill -f", desc: "커맨드라인 기준 종료" },
          { flag: "killall", desc: "이름이 같은 프로세스 종료" },
          { flag: "nice -n", desc: "새 프로세스 우선순위 지정" },
          { flag: "renice", desc: "실행 중 프로세스 우선순위 변경" }
        ],
        examples: [
          { label: "nginx 종료", code: "pkill -TERM nginx" },
          { label: "배치 우선순위 낮추기", code: "nice -n 10 backup.sh" }
        ],
        diff: "공통입니다.",
        warnings: ["강제 종료보다 정상 종료를 먼저 시도하세요."]
      }
    }
  },
  {
    id: "service-check",
    category: "services",
    title: "systemctl 상태 점검",
    summary: "서비스 활성화, 자동 시작, 상세 상태를 한 번에 확인합니다.",
    command: "systemctl status nginx && systemctl is-active nginx && systemctl is-enabled nginx",
    keywords: ["service", "active", "enabled", "restart"],
    variants: {
      rocky: {
        options: [
          { flag: "status", desc: "상세 상태" },
          { flag: "is-active", desc: "실행 여부" },
          { flag: "is-enabled", desc: "부팅 자동 시작 여부" },
          { flag: "daemon-reload", desc: "유닛 변경 후 재로드" }
        ],
        examples: [
          { label: "서비스 점검", code: "systemctl status nginx --no-pager" },
          { label: "자동 시작 확인", code: "systemctl is-enabled nginx" }
        ],
        diff: "서비스명은 httpd, mariadb처럼 패키지명과 다를 수 있습니다.",
        warnings: ["서비스 수정 후에는 `daemon-reload`를 잊지 마세요."]
      },
      ubuntu: {
        options: [
          { flag: "status", desc: "상세 상태" },
          { flag: "is-active", desc: "실행 여부" },
          { flag: "is-enabled", desc: "부팅 자동 시작 여부" },
          { flag: "daemon-reload", desc: "유닛 변경 후 재로드" }
        ],
        examples: [
          { label: "서비스 점검", code: "systemctl status nginx --no-pager" },
          { label: "자동 시작 확인", code: "systemctl is-enabled nginx" }
        ],
        diff: "서비스명은 apache2, redis-server처럼 패키지명과 다를 수 있습니다.",
        warnings: ["서비스 수정 후에는 `daemon-reload`를 잊지 마세요."]
      }
    }
  },
  {
    id: "tree",
    category: "filesystem",
    title: "tree",
    summary: "디렉토리 구조를 트리 형태로 한눈에 봅니다.",
    command: "tree -L 2 /var/www",
    keywords: ["directory tree", "structure", "folder view", "hierarchy"],
    variants: {
      rocky: {
        options: [
          { flag: "-L 2", desc: "깊이를 2단계로 제한해서 구조를 압축해 봄" },
          { flag: "-a", desc: "숨김 파일과 디렉토리까지 함께 표시" },
          { flag: "-d", desc: "파일은 숨기고 디렉토리만 표시" },
          { flag: "-f", desc: "상대 경로가 아닌 전체 경로까지 표시" },
          { flag: "-h", desc: "사람이 읽기 쉬운 크기 단위 표시" },
          { flag: "--dirsfirst", desc: "디렉토리를 파일보다 먼저 출력" }
        ],
        examples: [
          { label: "웹 디렉토리 구조", code: "tree -L 2 /var/www" },
          { label: "숨김 파일 포함", code: "tree -a -L 2 ." },
          { label: "디렉토리만 보기", code: "tree -d /etc" }
        ],
        diff: "Rocky/Ubuntu 차이는 거의 없습니다.",
        warnings: ["큰 디렉토리는 출력이 길어지고 느려질 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-L 2", desc: "깊이를 2단계로 제한해서 구조를 압축해 봄" },
          { flag: "-a", desc: "숨김 파일과 디렉토리까지 함께 표시" },
          { flag: "-d", desc: "파일은 숨기고 디렉토리만 표시" },
          { flag: "-f", desc: "상대 경로가 아닌 전체 경로까지 표시" },
          { flag: "-h", desc: "사람이 읽기 쉬운 크기 단위 표시" },
          { flag: "--dirsfirst", desc: "디렉토리를 파일보다 먼저 출력" }
        ],
        examples: [
          { label: "웹 디렉토리 구조", code: "tree -L 2 /var/www" },
          { label: "숨김 파일 포함", code: "tree -a -L 2 ." },
          { label: "디렉토리만 보기", code: "tree -d /etc" }
        ],
        diff: "Rocky/Ubuntu 차이는 거의 없습니다.",
        warnings: ["큰 디렉토리는 출력이 길어지고 느려질 수 있습니다."]
      }
    }
  },
  {
    id: "locate",
    category: "filesystem",
    title: "locate / updatedb",
    summary: "인덱스 기반으로 파일 이름을 매우 빠르게 찾습니다.",
    command: "updatedb && locate nginx.conf",
    keywords: ["search", "fast search", "index", "database", "file find"],
    variants: {
      rocky: {
        options: [
          { flag: "locate nginx.conf", desc: "이름이 포함된 파일을 즉시 검색" },
          { flag: "locate -i", desc: "대소문자를 무시하고 검색" },
          { flag: "locate -c", desc: "매칭 개수만 출력" },
          { flag: "locate -n 10", desc: "최대 10개 결과만 표시" },
          { flag: "locate -r", desc: "정규식으로 검색" },
          { flag: "updatedb", desc: "locate 인덱스 데이터베이스 갱신" }
        ],
        examples: [
          { label: "설정 파일 찾기", code: "locate nginx.conf" },
          { label: "인덱스 갱신", code: "sudo updatedb" },
          { label: "결과 개수만 확인", code: "locate -c ssl.conf" }
        ],
        diff: "locate는 updatedb가 오래됐으면 결과가 누락될 수 있습니다.",
        warnings: ["권한이 제한된 경로는 locate 결과에 안 나올 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "locate nginx.conf", desc: "이름이 포함된 파일을 즉시 검색" },
          { flag: "locate -i", desc: "대소문자를 무시하고 검색" },
          { flag: "locate -c", desc: "매칭 개수만 출력" },
          { flag: "locate -n 10", desc: "최대 10개 결과만 표시" },
          { flag: "locate -r", desc: "정규식으로 검색" },
          { flag: "updatedb", desc: "locate 인덱스 데이터베이스 갱신" }
        ],
        examples: [
          { label: "설정 파일 찾기", code: "locate nginx.conf" },
          { label: "인덱스 갱신", code: "sudo updatedb" },
          { label: "결과 개수만 확인", code: "locate -c ssl.conf" }
        ],
        diff: "locate는 updatedb가 오래됐으면 결과가 누락될 수 있습니다.",
        warnings: ["권한이 제한된 경로는 locate 결과에 안 나올 수 있습니다."]
      }
    }
  },
  {
    id: "file",
    category: "filesystem",
    title: "file",
    summary: "파일이 텍스트인지 바이너리인지, 어떤 타입인지 확인합니다.",
    command: "file /path/to/item",
    keywords: ["type", "mime", "binary", "text", "magic"],
    variants: {
      rocky: {
        options: [
          { flag: "-i", desc: "MIME 타입과 문자셋까지 함께 표시" },
          { flag: "-b", desc: "파일명 없이 결과만 깔끔하게 출력" },
          { flag: "-L", desc: "심볼릭 링크를 따라 실제 대상 파일을 확인" },
          { flag: "-s", desc: "특수 파일이나 블록 디바이스도 검사" }
        ],
        examples: [
          { label: "파일 타입 확인", code: "file /usr/bin/ssh" },
          { label: "MIME 정보 확인", code: "file -i app.log" },
          { label: "링크 대상 확인", code: "file -L /usr/bin/python3" }
        ],
        diff: "Rocky/Ubuntu 차이는 거의 없습니다.",
        warnings: ["확장자만 믿지 말고 file 결과를 먼저 보는 습관이 좋습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-i", desc: "MIME 타입과 문자셋까지 함께 표시" },
          { flag: "-b", desc: "파일명 없이 결과만 깔끔하게 출력" },
          { flag: "-L", desc: "심볼릭 링크를 따라 실제 대상 파일을 확인" },
          { flag: "-s", desc: "특수 파일이나 블록 디바이스도 검사" }
        ],
        examples: [
          { label: "파일 타입 확인", code: "file /usr/bin/ssh" },
          { label: "MIME 정보 확인", code: "file -i app.log" },
          { label: "링크 대상 확인", code: "file -L /usr/bin/python3" }
        ],
        diff: "Rocky/Ubuntu 차이는 거의 없습니다.",
        warnings: ["확장자만 믿지 말고 file 결과를 먼저 보는 습관이 좋습니다."]
      }
    }
  },
  {
    id: "stat",
    category: "filesystem",
    title: "stat",
    summary: "파일의 타임스탬프, 권한, inode, 소유자를 자세히 봅니다.",
    command: "stat file",
    keywords: ["inode", "mtime", "ctime", "atime", "metadata", "owner"],
    variants: {
      rocky: {
        options: [
          { flag: "-c", desc: "출력 형식을 직접 지정해서 필요한 항목만 뽑음" },
          { flag: "-f", desc: "파일시스템 전체 정보 확인" },
          { flag: "-t", desc: "짧은 형식으로 한 줄 출력" },
          { flag: "-L", desc: "심볼릭 링크가 가리키는 실제 파일을 확인" }
        ],
        examples: [
          { label: "메타데이터 확인", code: "stat /etc/hosts" },
          { label: "수정시간만 출력", code: "stat -c '%y %n' /var/log/messages" },
          { label: "파일시스템 정보", code: "stat -f /var" }
        ],
        diff: "Rocky/Ubuntu 차이는 거의 없습니다.",
        warnings: ["mtime, ctime, atime의 의미를 헷갈리지 않도록 주의하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-c", desc: "출력 형식을 직접 지정해서 필요한 항목만 뽑음" },
          { flag: "-f", desc: "파일시스템 전체 정보 확인" },
          { flag: "-t", desc: "짧은 형식으로 한 줄 출력" },
          { flag: "-L", desc: "심볼릭 링크가 가리키는 실제 파일을 확인" }
        ],
        examples: [
          { label: "메타데이터 확인", code: "stat /etc/hosts" },
          { label: "수정시간만 출력", code: "stat -c '%y %n' /var/log/syslog" },
          { label: "파일시스템 정보", code: "stat -f /var" }
        ],
        diff: "Rocky/Ubuntu 차이는 거의 없습니다.",
        warnings: ["mtime, ctime, atime의 의미를 헷갈리지 않도록 주의하세요."]
      }
    }
  },
  {
    id: "storage-advanced",
    category: "storage",
    title: "du / df / lsblk / fdisk / mount",
    summary: "디스크 점유, 파티션, 마운트 상태를 함께 확인합니다.",
    command: "du -xh --max-depth=1 /var && df -Th && lsblk -f && fdisk -l",
    keywords: ["disk", "partition", "mount", "filesystem", "capacity"],
    variants: {
      rocky: {
        options: [
          { flag: "du -x", desc: "다른 파일시스템 제외" },
          { flag: "df -T", desc: "파일시스템 타입 표시" },
          { flag: "lsblk -f", desc: "UUID/타입 확인" },
          { flag: "fdisk -l", desc: "파티션 목록" },
          { flag: "mount | column -t", desc: "마운트 보기 좋게 정렬" }
        ],
        examples: [
          { label: "용량 큰 디렉토리", code: "du -xh --max-depth=1 /var | sort -h" },
          { label: "마운트 확인", code: "mount | column -t" }
        ],
        diff: "공통입니다.",
        warnings: ["파티션 변경은 실제 쓰기 전 꼭 장치를 두 번 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "du -x", desc: "다른 파일시스템 제외" },
          { flag: "df -T", desc: "파일시스템 타입 표시" },
          { flag: "lsblk -f", desc: "UUID/타입 확인" },
          { flag: "fdisk -l", desc: "파티션 목록" },
          { flag: "mount | column -t", desc: "마운트 보기 좋게 정렬" }
        ],
        examples: [
          { label: "용량 큰 디렉토리", code: "du -xh --max-depth=1 /var | sort -h" },
          { label: "마운트 확인", code: "mount | column -t" }
        ],
        diff: "공통입니다.",
        warnings: ["파티션 변경은 실제 쓰기 전 꼭 장치를 두 번 확인하세요."]
      }
    }
  },
  {
    id: "net-tools",
    category: "network",
    title: "ping / traceroute / nslookup / ss",
    summary: "연결, 경로, DNS, 리스닝 포트를 한 번에 점검합니다.",
    command: "ping -c 4 host && traceroute host && nslookup host && ss -ltnp",
    keywords: ["dns", "latency", "route", "listen", "socket"],
    variants: {
      rocky: {
        options: [
          { flag: "ping -c", desc: "정해진 횟수만 확인" },
          { flag: "traceroute", desc: "경로 추적" },
          { flag: "nslookup / dig", desc: "DNS 확인" },
          { flag: "ss -ltnp", desc: "리스닝 포트 확인" }
        ],
        examples: [
          { label: "연결 확인", code: "ping -c 4 8.8.8.8" },
          { label: "포트 확인", code: "ss -ltnp | grep :443" }
        ],
        diff: "Rocky는 traceroute 패키지가 별도일 수 있습니다.",
        warnings: ["ICMP가 막혀 있으면 ping만으로 서비스 상태를 단정하면 안 됩니다."]
      },
      ubuntu: {
        options: [
          { flag: "ping -c", desc: "정해진 횟수만 확인" },
          { flag: "traceroute", desc: "경로 추적" },
          { flag: "nslookup / dig", desc: "DNS 확인" },
          { flag: "ss -ltnp", desc: "리스닝 포트 확인" }
        ],
        examples: [
          { label: "연결 확인", code: "ping -c 4 8.8.8.8" },
          { label: "포트 확인", code: "ss -ltnp | grep :443" }
        ],
        diff: "Ubuntu는 tracepath를 대안으로 쓰기도 합니다.",
        warnings: ["ICMP가 막혀 있으면 ping만으로 서비스 상태를 단정하면 안 됩니다."]
      }
    }
  },
  {
    id: "package-tools",
    category: "packages",
    title: "dnf / apt / rpm / dpkg / apt-cache",
    summary: "설치, 갱신, 조회, 버전 확인까지 패키지 작업 전반을 다룹니다.",
    command: "dnf update && apt update && rpm -qa && dpkg -l && apt-cache policy pkg",
    keywords: ["install", "update", "policy", "version", "package"],
    variants: {
      rocky: {
        options: [
          { flag: "dnf update", desc: "업데이트" },
          { flag: "dnf list installed", desc: "설치 목록" },
          { flag: "rpm -qa", desc: "설치 패키지 목록" },
          { flag: "rpm -qf", desc: "파일 소유 패키지" }
        ],
        examples: [
          { label: "설치 확인", code: "rpm -q nginx" },
          { label: "파일 소유자", code: "rpm -qf /usr/bin/ssh" }
        ],
        diff: "Rocky는 dnf/rpm 조합이 기본입니다.",
        warnings: ["업데이트 후 서비스 재시작이 필요한지 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "apt update", desc: "패키지 인덱스 갱신" },
          { flag: "apt upgrade", desc: "업그레이드" },
          { flag: "dpkg -l", desc: "설치 목록" },
          { flag: "dpkg -S", desc: "파일 소유 패키지" },
          { flag: "apt-cache policy", desc: "후보 버전 확인" }
        ],
        examples: [
          { label: "설치 확인", code: "dpkg -l | grep nginx" },
          { label: "버전 확인", code: "apt-cache policy nginx" }
        ],
        diff: "Ubuntu는 apt/dpkg 조합이 기본입니다.",
        warnings: ["업데이트 후 서비스 재시작이 필요한지 확인하세요."]
      }
    }
  },
  {
    id: "users-acl",
    category: "users",
    title: "whoami / who / last / getfacl / setfacl",
    summary: "현재 세션과 ACL 권한을 함께 점검합니다.",
    command: "whoami && who && last && getfacl file",
    keywords: ["user", "session", "acl", "permission", "login"],
    variants: {
      rocky: {
        options: [
          { flag: "whoami", desc: "현재 사용자" },
          { flag: "who", desc: "로그인 사용자" },
          { flag: "last", desc: "로그인 이력" },
          { flag: "getfacl/setfacl", desc: "ACL 확인/조정" }
        ],
        examples: [
          { label: "세션 확인", code: "whoami && who" },
          { label: "ACL 확인", code: "getfacl /var/www/html" }
        ],
        diff: "Rocky는 SELinux와 같이 봐야 할 때가 많습니다.",
        warnings: ["권한과 소유권, ACL을 따로 구분해서 보세요."]
      },
      ubuntu: {
        options: [
          { flag: "whoami", desc: "현재 사용자" },
          { flag: "who", desc: "로그인 사용자" },
          { flag: "last", desc: "로그인 이력" },
          { flag: "getfacl/setfacl", desc: "ACL 확인/조정" }
        ],
        examples: [
          { label: "세션 확인", code: "whoami && who" },
          { label: "ACL 확인", code: "getfacl /var/www/html" }
        ],
        diff: "Ubuntu는 AppArmor와 같이 보는 경우가 많습니다.",
        warnings: ["권한과 소유권, ACL을 따로 구분해서 보세요."]
      }
    }
  },
  {
    id: "archive-tools",
    category: "backup",
    title: "tar / gzip / xz / zip / unzip",
    summary: "압축 백업과 복원을 위한 기본 도구들입니다.",
    command: "tar -czf backup.tar.gz data/ && zip -r backup.zip data/",
    keywords: ["archive", "compress", "extract", "backup"],
    variants: {
      rocky: {
        options: [
          { flag: "tar -czf", desc: "tar.gz 생성" },
          { flag: "tar -xzf", desc: "tar.gz 해제" },
          { flag: "gzip / gunzip", desc: "단일 파일 압축/해제" },
          { flag: "xz / xzcat", desc: "고압축 포맷" },
          { flag: "zip / unzip", desc: "호환성 좋은 압축" }
        ],
        examples: [
          { label: "디렉토리 백업", code: "tar -czf backup.tar.gz data/" },
          { label: "압축 해제", code: "tar -xzf backup.tar.gz" }
        ],
        diff: "공통입니다.",
        warnings: ["백업은 압축보다 복구 절차가 더 중요합니다."]
      },
      ubuntu: {
        options: [
          { flag: "tar -czf", desc: "tar.gz 생성" },
          { flag: "tar -xzf", desc: "tar.gz 해제" },
          { flag: "gzip / gunzip", desc: "단일 파일 압축/해제" },
          { flag: "xz / xzcat", desc: "고압축 포맷" },
          { flag: "zip / unzip", desc: "호환성 좋은 압축" }
        ],
        examples: [
          { label: "디렉토리 백업", code: "tar -czf backup.tar.gz data/" },
          { label: "압축 해제", code: "tar -xzf backup.tar.gz" }
        ],
        diff: "공통입니다.",
        warnings: ["백업은 압축보다 복구 절차가 더 중요합니다."]
      }
    }
  },
  {
    id: "text-pipe",
    category: "text",
    title: "cut / sort / uniq / xargs",
    summary: "텍스트 파이프라인 처리의 핵심 조합입니다.",
    command: "cut -d: -f1 file | sort | uniq -c | xargs",
    keywords: ["pipeline", "count", "column", "aggregate"],
    variants: {
      rocky: {
        options: [
          { flag: "cut -d", desc: "필드 추출" },
          { flag: "sort", desc: "정렬" },
          { flag: "uniq -c", desc: "집계" },
          { flag: "xargs", desc: "다음 명령으로 전달" }
        ],
        examples: [
          { label: "IP 집계", code: "cut -d' ' -f1 access.log | sort | uniq -c | sort -nr" },
          { label: "파일 일괄 압축", code: "find . -name '*.log' | xargs gzip" }
        ],
        diff: "공통입니다.",
        warnings: ["공백이 포함된 경로는 `find -print0 | xargs -0`를 고려하세요."]
      },
      ubuntu: {
        options: [
          { flag: "cut -d", desc: "필드 추출" },
          { flag: "sort", desc: "정렬" },
          { flag: "uniq -c", desc: "집계" },
          { flag: "xargs", desc: "다음 명령으로 전달" }
        ],
        examples: [
          { label: "IP 집계", code: "cut -d' ' -f1 access.log | sort | uniq -c | sort -nr" },
          { label: "파일 일괄 압축", code: "find . -name '*.log' | xargs gzip" }
        ],
        diff: "공통입니다.",
        warnings: ["공백이 포함된 경로는 `find -print0 | xargs -0`를 고려하세요."]
      }
    }
  },
  {
    id: "ssh-transfer",
    category: "remote",
    title: "ssh-keygen / ssh-copy-id / scp / rsync",
    summary: "SSH 키 생성, 배포, 파일 전송과 동기화까지 다룹니다.",
    command: "ssh-keygen -t ed25519 && ssh-copy-id user@host && scp -P 2222 file user@host:/tmp/",
    keywords: ["ssh", "keygen", "transfer", "sync", "copy"],
    variants: {
      rocky: {
        options: [
          { flag: "ssh-keygen -t ed25519", desc: "키 생성" },
          { flag: "ssh-copy-id", desc: "공개키 복사" },
          { flag: "scp -P", desc: "포트 지정 복사" },
          { flag: "rsync -av --exclude", desc: "제외 동기화" }
        ],
        examples: [
          { label: "키 생성", code: "ssh-keygen -t ed25519 -C 'ops'" },
          { label: "원격 동기화", code: "rsync -av --exclude node_modules src/ host:/dst/" }
        ],
        diff: "공통입니다.",
        warnings: ["키 권한과 원격 authorized_keys 권한을 함께 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "ssh-keygen -t ed25519", desc: "키 생성" },
          { flag: "ssh-copy-id", desc: "공개키 복사" },
          { flag: "scp -P", desc: "포트 지정 복사" },
          { flag: "rsync -av --exclude", desc: "제외 동기화" }
        ],
        examples: [
          { label: "키 생성", code: "ssh-keygen -t ed25519 -C 'ops'" },
          { label: "원격 동기화", code: "rsync -av --exclude node_modules src/ host:/dst/" }
        ],
        diff: "공통입니다.",
        warnings: ["키 권한과 원격 authorized_keys 권한을 함께 확인하세요."]
      }
    }
  },
  {
    id: "security-tools",
    category: "security",
    title: "SELinux / AppArmor / firewall",
    summary: "배포판별 보안 제어와 방화벽 상태를 확인합니다.",
    command: "getenforce && aa-status && firewall-cmd --state && ufw status verbose",
    keywords: ["selinux", "apparmor", "firewall", "policy", "state"],
    variants: {
      rocky: {
        options: [
          { flag: "getenforce", desc: "SELinux 모드" },
          { flag: "setenforce 0", desc: "임시 완화" },
          { flag: "firewall-cmd --state", desc: "방화벽 상태" },
          { flag: "firewall-cmd --list-all", desc: "규칙 전체" }
        ],
        examples: [
          { label: "보안 상태", code: "getenforce && firewall-cmd --state" },
          { label: "임시 완화", code: "setenforce 0" }
        ],
        diff: "Rocky는 SELinux와 firewalld가 핵심입니다.",
        warnings: ["완화 설정은 장애 해결 후 반드시 원복하세요."]
      },
      ubuntu: {
        options: [
          { flag: "aa-status", desc: "AppArmor 상태" },
          { flag: "firewall-cmd --state", desc: "firewalld 사용 시 상태" },
          { flag: "ufw status verbose", desc: "ufw 상세 상태" },
          { flag: "ufw app list", desc: "앱 프로필" }
        ],
        examples: [
          { label: "보안 상태", code: "aa-status && ufw status verbose" },
          { label: "앱 프로필", code: "ufw app list" }
        ],
        diff: "Ubuntu는 AppArmor와 ufw가 핵심입니다.",
        warnings: ["완화 설정은 장애 해결 후 반드시 원복하세요."]
      }
    }
  },
  {
    id: "lsof",
    category: "process",
    title: "lsof",
    summary: "열린 파일, 점유 포트, 프로세스가 잡고 있는 리소스를 확인합니다.",
    command: "lsof -i :8080 && lsof /var/log/messages",
    keywords: ["open file", "port owner", "file descriptor", "socket"],
    variants: {
      rocky: {
        options: [
          { flag: "-i", desc: "네트워크 소켓 확인" },
          { flag: "-p", desc: "특정 PID 확인" },
          { flag: "-u", desc: "사용자 기준 확인" },
          { flag: "+D", desc: "디렉토리 하위 모두 확인" }
        ],
        examples: [
          { label: "포트 점유 확인", code: "lsof -i :8080" },
          { label: "로그 파일 점유", code: "lsof /var/log/messages" }
        ],
        diff: "포트가 열리지 않을 때 `ss`와 함께 가장 먼저 보는 도구입니다.",
        warnings: ["출력이 많아질 수 있으니 범위를 좁혀서 사용하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-i", desc: "네트워크 소켓 확인" },
          { flag: "-p", desc: "특정 PID 확인" },
          { flag: "-u", desc: "사용자 기준 확인" },
          { flag: "+D", desc: "디렉토리 하위 모두 확인" }
        ],
        examples: [
          { label: "포트 점유 확인", code: "lsof -i :8080" },
          { label: "로그 파일 점유", code: "lsof /var/log/syslog" }
        ],
        diff: "포트가 열리지 않을 때 `ss`와 함께 가장 먼저 보는 도구입니다.",
        warnings: ["출력이 많아질 수 있으니 범위를 좁혀서 사용하세요."]
      }
    }
  },
  {
    id: "watch",
    category: "troubleshoot",
    title: "watch",
    summary: "명령을 주기적으로 반복 실행해 변화를 관찰합니다.",
    command: "watch -n 1 nvidia-smi",
    keywords: ["repeat", "refresh", "monitor", "interval"],
    variants: {
      rocky: {
        options: [
          { flag: "-n", desc: "초 단위 반복 간격" },
          { flag: "-d", desc: "변경 부분 강조" },
          { flag: "-t", desc: "헤더 숨김" }
        ],
        examples: [
          { label: "GPU 감시", code: "watch -n 1 nvidia-smi" },
          { label: "디스크 감시", code: "watch -n 2 df -h" }
        ],
        diff: "공통입니다.",
        warnings: ["반복 명령은 시스템 부하가 큰 명령과 함께 쓰지 마세요."]
      },
      ubuntu: {
        options: [
          { flag: "-n", desc: "초 단위 반복 간격" },
          { flag: "-d", desc: "변경 부분 강조" },
          { flag: "-t", desc: "헤더 숨김" }
        ],
        examples: [
          { label: "GPU 감시", code: "watch -n 1 nvidia-smi" },
          { label: "디스크 감시", code: "watch -n 2 df -h" }
        ],
        diff: "공통입니다.",
        warnings: ["반복 명령은 시스템 부하가 큰 명령과 함께 쓰지 마세요."]
      }
    }
  },
  {
    id: "env-printenv",
    category: "system",
    title: "env / printenv",
    summary: "환경 변수를 확인하고 정렬해서 봅니다.",
    command: "env | sort && printenv PATH",
    keywords: ["environment", "variables", "shell", "path"],
    variants: {
      rocky: {
        options: [
          { flag: "env", desc: "환경 변수 전체" },
          { flag: "printenv", desc: "특정 변수 확인" },
          { flag: "sort", desc: "정렬해서 보기" }
        ],
        examples: [
          { label: "전체 환경", code: "env | sort" },
          { label: "PATH 확인", code: "printenv PATH" }
        ],
        diff: "공통입니다.",
        warnings: ["서비스 환경과 로그인 셸 환경이 다를 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "env", desc: "환경 변수 전체" },
          { flag: "printenv", desc: "특정 변수 확인" },
          { flag: "sort", desc: "정렬해서 보기" }
        ],
        examples: [
          { label: "전체 환경", code: "env | sort" },
          { label: "PATH 확인", code: "printenv PATH" }
        ],
        diff: "공통입니다.",
        warnings: ["서비스 환경과 로그인 셸 환경이 다를 수 있습니다."]
      }
    }
  },
  {
    id: "which-whereis",
    category: "system",
    title: "which / whereis",
    summary: "명령어 바이너리 위치를 빠르게 찾습니다.",
    command: "which python3 && whereis nginx",
    keywords: ["binary", "path", "command lookup"],
    variants: {
      rocky: {
        options: [
          { flag: "which", desc: "PATH에서 실행 파일 찾기" },
          { flag: "whereis", desc: "바이너리/소스/매뉴얼 위치" }
        ],
        examples: [
          { label: "python 위치", code: "which python3" },
          { label: "nginx 위치", code: "whereis nginx" }
        ],
        diff: "공통입니다.",
        warnings: ["alias가 있으면 which와 실제 실행 파일이 다를 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "which", desc: "PATH에서 실행 파일 찾기" },
          { flag: "whereis", desc: "바이너리/소스/매뉴얼 위치" }
        ],
        examples: [
          { label: "python 위치", code: "which python3" },
          { label: "nginx 위치", code: "whereis nginx" }
        ],
        diff: "공통입니다.",
        warnings: ["alias가 있으면 which와 실제 실행 파일이 다를 수 있습니다."]
      }
    }
  },
  {
    id: "dmesg",
    category: "diagnostics",
    title: "dmesg",
    summary: "커널 로그와 부팅 직후 하드웨어 메시지를 확인합니다.",
    command: "dmesg -T | tail -n 50",
    keywords: ["kernel", "boot", "hardware", "ring buffer", "driver"],
    variants: {
      rocky: {
        options: [
          { flag: "-T", desc: "커널 타임스탬프를 사람이 읽기 쉬운 시간으로 변환" },
          { flag: "-w", desc: "실시간 커널 로그 추적" },
          { flag: "--level err,warn", desc: "오류/경고 레벨만 필터" },
          { flag: "-c", desc: "출력 후 버퍼 비우기" }
        ],
        examples: [
          { label: "최근 메시지", code: "dmesg -T | tail -n 50" },
          { label: "실시간 추적", code: "dmesg -w" }
        ],
        diff: "Rocky에서는 드라이버, SELinux, 스토리지 이슈 확인의 시작점입니다.",
        warnings: ["커널 로그는 빠르게 쌓이므로 문제 직후 바로 확인하는 게 좋습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-T", desc: "커널 타임스탬프를 사람이 읽기 쉬운 시간으로 변환" },
          { flag: "-w", desc: "실시간 커널 로그 추적" },
          { flag: "--level err,warn", desc: "오류/경고 레벨만 필터" },
          { flag: "-c", desc: "출력 후 버퍼 비우기" }
        ],
        examples: [
          { label: "최근 메시지", code: "dmesg -T | tail -n 50" },
          { label: "실시간 추적", code: "dmesg -w" }
        ],
        diff: "Ubuntu에서도 부팅, 디스크, 네트워크 드라이버 문제 확인에 유용합니다.",
        warnings: ["커널 로그는 빠르게 쌓이므로 문제 직후 바로 확인하는 게 좋습니다."]
      }
    }
  },
  {
    id: "sysctl",
    category: "diagnostics",
    title: "sysctl",
    summary: "커널 파라미터를 조회하고 런타임에 조정합니다.",
    command: "sysctl -a | grep vm.swappiness && sysctl -w net.ipv4.ip_forward=1",
    keywords: ["kernel parameter", "tuning", "vm", "net.ipv4"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "전체 커널 파라미터 출력" },
          { flag: "-n", desc: "값만 출력" },
          { flag: "-w", desc: "런타임 값 변경" },
          { flag: "-p", desc: "sysctl.conf 또는 지정 파일 재적용" }
        ],
        examples: [
          { label: "스왑 성향 확인", code: "sysctl vm.swappiness" },
          { label: "포워딩 활성화", code: "sysctl -w net.ipv4.ip_forward=1" }
        ],
        diff: "Rocky는 방화벽/라우팅 튜닝과 같이 보는 경우가 많습니다.",
        warnings: ["재부팅 후에도 유지하려면 /etc/sysctl.conf 또는 /etc/sysctl.d/에 반영해야 합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "전체 커널 파라미터 출력" },
          { flag: "-n", desc: "값만 출력" },
          { flag: "-w", desc: "런타임 값 변경" },
          { flag: "-p", desc: "sysctl.conf 또는 지정 파일 재적용" }
        ],
        examples: [
          { label: "스왑 성향 확인", code: "sysctl vm.swappiness" },
          { label: "포워딩 활성화", code: "sysctl -w net.ipv4.ip_forward=1" }
        ],
        diff: "Ubuntu도 동일하지만 netplan/ufw와 같이 보는 경우가 많습니다.",
        warnings: ["재부팅 후에도 유지하려면 /etc/sysctl.conf 또는 /etc/sysctl.d/에 반영해야 합니다."]
      }
    }
  },
  {
    id: "logrotate",
    category: "diagnostics",
    title: "logrotate",
    summary: "로그 회전 정책을 테스트하고 강제 실행합니다.",
    command: "logrotate -d /etc/logrotate.conf",
    keywords: ["logs", "rotation", "disk", "policy", "compress"],
    variants: {
      rocky: {
        options: [
          { flag: "-d", desc: "드라이런으로 정책 점검" },
          { flag: "-f", desc: "강제 회전" },
          { flag: "-v", desc: "자세한 로그 출력" },
          { flag: "-s", desc: "상태 파일 지정" }
        ],
        examples: [
          { label: "정책 테스트", code: "logrotate -d /etc/logrotate.conf" },
          { label: "강제 회전", code: "logrotate -f /etc/logrotate.conf" }
        ],
        diff: "Rocky에서는 디스크 부족 원인 분석에 매우 중요합니다.",
        warnings: ["강제 회전은 실제 로그 운영에 영향을 줄 수 있으니 테스트 후 사용하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-d", desc: "드라이런으로 정책 점검" },
          { flag: "-f", desc: "강제 회전" },
          { flag: "-v", desc: "자세한 로그 출력" },
          { flag: "-s", desc: "상태 파일 지정" }
        ],
        examples: [
          { label: "정책 테스트", code: "logrotate -d /etc/logrotate.conf" },
          { label: "강제 회전", code: "logrotate -f /etc/logrotate.conf" }
        ],
        diff: "Ubuntu에서도 디스크 부족과 로그 누적 문제를 볼 때 자주 씁니다.",
        warnings: ["강제 회전은 실제 로그 운영에 영향을 줄 수 있으니 테스트 후 사용하세요."]
      }
    }
  },
  {
    id: "nc",
    category: "network",
    title: "nc",
    summary: "포트 연결 테스트, 간단한 리스너, 데이터 전송에 씁니다.",
    command: "nc -vz host 443",
    keywords: ["netcat", "port test", "listener", "socket"],
    variants: {
      rocky: {
        options: [
          { flag: "-z", desc: "데이터 전송 없이 포트 스캔처럼 연결만 확인" },
          { flag: "-v", desc: "상세 출력" },
          { flag: "-w", desc: "타임아웃 지정" },
          { flag: "-l", desc: "리스닝 모드" },
          { flag: "-u", desc: "UDP 사용" }
        ],
        examples: [
          { label: "포트 확인", code: "nc -vz host 443" },
          { label: "간단한 리스너", code: "nc -l 8080" }
        ],
        diff: "Rocky는 패키지에 따라 `nmap-ncat`로 제공될 수 있습니다.",
        warnings: ["운영 환경에서는 허가된 대상만 테스트하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-z", desc: "데이터 전송 없이 포트 스캔처럼 연결만 확인" },
          { flag: "-v", desc: "상세 출력" },
          { flag: "-w", desc: "타임아웃 지정" },
          { flag: "-l", desc: "리스닝 모드" },
          { flag: "-u", desc: "UDP 사용" }
        ],
        examples: [
          { label: "포트 확인", code: "nc -vz host 443" },
          { label: "간단한 리스너", code: "nc -l 8080" }
        ],
        diff: "Ubuntu도 `netcat-openbsd` 또는 `netcat-traditional` 패키지 차이가 있을 수 있습니다.",
        warnings: ["운영 환경에서는 허가된 대상만 테스트하세요."]
      }
    }
  },
  {
    id: "tcpdump",
    category: "network",
    title: "tcpdump",
    summary: "패킷을 캡처해서 네트워크 문제를 분석합니다.",
    command: "tcpdump -i eth0 port 443",
    keywords: ["packet", "capture", "pcap", "traffic", "sniff"],
    variants: {
      rocky: {
        options: [
          { flag: "-i", desc: "캡처할 인터페이스 지정" },
          { flag: "-nn", desc: "호스트명/포트명 해석 없이 숫자로 표시" },
          { flag: "-s 0", desc: "패킷 전체 길이 캡처" },
          { flag: "-w", desc: "pcap 파일로 저장" },
          { flag: "-A", desc: "ASCII로 payload 출력" }
        ],
        examples: [
          { label: "HTTPS 트래픽 캡처", code: "tcpdump -i eth0 port 443" },
          { label: "파일로 저장", code: "tcpdump -i eth0 -w /tmp/capture.pcap" }
        ],
        diff: "Rocky는 방화벽/SELinux와 함께 보며, root 권한이 필요합니다.",
        warnings: ["민감한 데이터가 노출될 수 있으니 캡처 파일 관리를 조심하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-i", desc: "캡처할 인터페이스 지정" },
          { flag: "-nn", desc: "호스트명/포트명 해석 없이 숫자로 표시" },
          { flag: "-s 0", desc: "패킷 전체 길이 캡처" },
          { flag: "-w", desc: "pcap 파일로 저장" },
          { flag: "-A", desc: "ASCII로 payload 출력" }
        ],
        examples: [
          { label: "HTTPS 트래픽 캡처", code: "tcpdump -i eth0 port 443" },
          { label: "파일로 저장", code: "tcpdump -i eth0 -w /tmp/capture.pcap" }
        ],
        diff: "Ubuntu도 동일하지만 AppArmor/권한을 같이 고려해야 합니다.",
        warnings: ["민감한 데이터가 노출될 수 있으니 캡처 파일 관리를 조심하세요."]
      }
    }
  },
  {
    id: "mtr",
    category: "network",
    title: "mtr",
    summary: "ping과 traceroute를 합친 경로/지연 진단 도구입니다.",
    command: "mtr -rw host",
    keywords: ["network path", "latency", "route", "diagnostic"],
    variants: {
      rocky: {
        options: [
          { flag: "-r", desc: "리포트 모드" },
          { flag: "-w", desc: "넓은 출력" },
          { flag: "-c", desc: "샘플 수 지정" },
          { flag: "-n", desc: "DNS 해석 없이 숫자로 출력" }
        ],
        examples: [
          { label: "리포트 확인", code: "mtr -rw 8.8.8.8" },
          { label: "샘플 수 늘리기", code: "mtr -rwc 100 host" }
        ],
        diff: "Rocky는 네트워크 경로 지연 문제를 볼 때 유용합니다.",
        warnings: ["ICMP가 차단되면 결과가 제한될 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-r", desc: "리포트 모드" },
          { flag: "-w", desc: "넓은 출력" },
          { flag: "-c", desc: "샘플 수 지정" },
          { flag: "-n", desc: "DNS 해석 없이 숫자로 출력" }
        ],
        examples: [
          { label: "리포트 확인", code: "mtr -rw 8.8.8.8" },
          { label: "샘플 수 늘리기", code: "mtr -rwc 100 host" }
        ],
        diff: "Ubuntu도 동일합니다.",
        warnings: ["ICMP가 차단되면 결과가 제한될 수 있습니다."]
      }
    }
  },
  {
    id: "podman",
    category: "containers",
    title: "podman",
    summary: "Rocky/RHEL 계열에서 자주 쓰는 rootless 컨테이너 도구입니다.",
    command: "podman ps",
    keywords: ["container", "rootless", "oci", "docker alternative"],
    variants: {
      rocky: {
        options: [
          { flag: "ps", desc: "컨테이너 목록" },
          { flag: "images", desc: "이미지 목록" },
          { flag: "run", desc: "컨테이너 실행" },
          { flag: "logs", desc: "로그 확인" },
          { flag: "exec", desc: "실행 중 컨테이너 내부 진입" }
        ],
        examples: [
          { label: "컨테이너 목록", code: "podman ps" },
          { label: "이미지 목록", code: "podman images" }
        ],
        diff: "Rocky는 Docker 대신 Podman이 더 자연스러운 선택일 수 있습니다.",
        warnings: ["rootless 모드에서는 권한/포트 바인딩 차이를 주의하세요."]
      },
      ubuntu: {
        options: [
          { flag: "ps", desc: "컨테이너 목록" },
          { flag: "images", desc: "이미지 목록" },
          { flag: "run", desc: "컨테이너 실행" },
          { flag: "logs", desc: "로그 확인" },
          { flag: "exec", desc: "실행 중 컨테이너 내부 진입" }
        ],
        examples: [
          { label: "컨테이너 목록", code: "podman ps" },
          { label: "이미지 목록", code: "podman images" }
        ],
        diff: "Ubuntu에서도 Podman을 쓸 수 있고, Docker 대안으로 유용합니다.",
        warnings: ["rootless 모드에서는 권한/포트 바인딩 차이를 주의하세요."]
      }
    }
  },
  {
    id: "useradd",
    category: "users",
    title: "useradd",
    summary: "새 사용자 계정을 생성합니다.",
    command: "useradd -m -s /bin/bash user",
    keywords: ["create user", "account", "home", "shell"],
    variants: {
      rocky: {
        options: [
          { flag: "-m", desc: "홈 디렉토리 생성" },
          { flag: "-s", desc: "로그인 셸 지정" },
          { flag: "-u", desc: "UID 직접 지정" },
          { flag: "-G", desc: "보조 그룹 지정" }
        ],
        examples: [
          { label: "기본 사용자 생성", code: "useradd -m -s /bin/bash deploy" },
          { label: "보조 그룹 포함", code: "useradd -m -G wheel,docker ops" }
        ],
        diff: "Rocky는 `wheel` 그룹이 sudo 권한의 핵심입니다.",
        warnings: ["계정 생성 후 비밀번호 설정과 그룹 확인을 잊지 마세요."]
      },
      ubuntu: {
        options: [
          { flag: "-m", desc: "홈 디렉토리 생성" },
          { flag: "-s", desc: "로그인 셸 지정" },
          { flag: "-u", desc: "UID 직접 지정" },
          { flag: "-G", desc: "보조 그룹 지정" }
        ],
        examples: [
          { label: "기본 사용자 생성", code: "useradd -m -s /bin/bash deploy" },
          { label: "보조 그룹 포함", code: "useradd -m -G sudo,docker ops" }
        ],
        diff: "Ubuntu는 보통 `sudo` 그룹을 함께 사용합니다.",
        warnings: ["계정 생성 후 비밀번호 설정과 그룹 확인을 잊지 마세요."]
      }
    }
  },
  {
    id: "usermod",
    category: "users",
    title: "usermod",
    summary: "기존 사용자 계정의 그룹, 셸, 홈 디렉토리를 수정합니다.",
    command: "usermod -aG wheel user",
    keywords: ["modify user", "group", "shell", "home"],
    variants: {
      rocky: {
        options: [
          { flag: "-aG", desc: "기존 그룹을 유지하면서 보조 그룹 추가" },
          { flag: "-s", desc: "로그인 셸 변경" },
          { flag: "-d", desc: "홈 디렉토리 변경" },
          { flag: "-l", desc: "로그인 이름 변경" }
        ],
        examples: [
          { label: "sudo 권한 부여", code: "usermod -aG wheel user" },
          { label: "셸 변경", code: "usermod -s /bin/zsh user" }
        ],
        diff: "Rocky에서는 wheel 그룹을 자주 추가합니다.",
        warnings: ["`-aG` 없이 `-G`만 쓰면 기존 그룹이 덮일 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-aG", desc: "기존 그룹을 유지하면서 보조 그룹 추가" },
          { flag: "-s", desc: "로그인 셸 변경" },
          { flag: "-d", desc: "홈 디렉토리 변경" },
          { flag: "-l", desc: "로그인 이름 변경" }
        ],
        examples: [
          { label: "sudo 권한 부여", code: "usermod -aG sudo user" },
          { label: "셸 변경", code: "usermod -s /bin/zsh user" }
        ],
        diff: "Ubuntu에서는 sudo 그룹을 자주 추가합니다.",
        warnings: ["`-aG` 없이 `-G`만 쓰면 기존 그룹이 덮일 수 있습니다."]
      }
    }
  },
  {
    id: "passwd",
    category: "users",
    title: "passwd",
    summary: "계정 비밀번호를 설정하거나 잠금 상태를 관리합니다.",
    command: "passwd user",
    keywords: ["password", "lock", "unlock", "account"],
    variants: {
      rocky: {
        options: [
          { flag: "passwd user", desc: "지정 사용자 비밀번호 변경" },
          { flag: "-l", desc: "계정 잠금" },
          { flag: "-u", desc: "계정 잠금 해제" },
          { flag: "-S", desc: "상태 확인" }
        ],
        examples: [
          { label: "비밀번호 변경", code: "passwd deploy" },
          { label: "계정 상태", code: "passwd -S deploy" }
        ],
        diff: "공통입니다.",
        warnings: ["보안 정책에 따라 일반 사용자는 다른 계정 비밀번호를 바꿀 수 없을 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "passwd user", desc: "지정 사용자 비밀번호 변경" },
          { flag: "-l", desc: "계정 잠금" },
          { flag: "-u", desc: "계정 잠금 해제" },
          { flag: "-S", desc: "상태 확인" }
        ],
        examples: [
          { label: "비밀번호 변경", code: "passwd deploy" },
          { label: "계정 상태", code: "passwd -S deploy" }
        ],
        diff: "공통입니다.",
        warnings: ["보안 정책에 따라 일반 사용자는 다른 계정 비밀번호를 바꿀 수 없을 수 있습니다."]
      }
    }
  },
  {
    id: "groupadd",
    category: "users",
    title: "groupadd",
    summary: "새 그룹을 만들고 사용자 권한의 기준을 분리합니다.",
    command: "groupadd docker",
    keywords: ["group", "access", "permission", "team"],
    variants: {
      rocky: {
        options: [
          { flag: "-g", desc: "GID 직접 지정" },
          { flag: "-r", desc: "시스템 그룹 생성" },
          { flag: "groupdel", desc: "그룹 삭제" },
          { flag: "gpasswd", desc: "그룹 멤버 관리" }
        ],
        examples: [
          { label: "그룹 생성", code: "groupadd deploy" },
          { label: "사용자 그룹 추가", code: "usermod -aG deploy user" }
        ],
        diff: "Rocky는 wheel/group 조합을 자주 씁니다.",
        warnings: ["그룹 생성만으로 권한이 생기는 것은 아니고 파일/서비스 권한과 함께 봐야 합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-g", desc: "GID 직접 지정" },
          { flag: "-r", desc: "시스템 그룹 생성" },
          { flag: "groupdel", desc: "그룹 삭제" },
          { flag: "gpasswd", desc: "그룹 멤버 관리" }
        ],
        examples: [
          { label: "그룹 생성", code: "groupadd deploy" },
          { label: "사용자 그룹 추가", code: "usermod -aG deploy user" }
        ],
        diff: "Ubuntu는 sudo 그룹과 함께 관리하는 경우가 많습니다.",
        warnings: ["그룹 생성만으로 권한이 생기는 것은 아니고 파일/서비스 권한과 함께 봐야 합니다."]
      }
    }
  },
  {
    id: "visudo",
    category: "users",
    title: "visudo",
    summary: "sudoers 파일을 안전하게 편집하고 문법 검사를 같이 합니다.",
    command: "visudo",
    keywords: ["sudoers", "privilege", "edit safely", "admin"],
    variants: {
      rocky: {
        options: [
          { flag: "-c", desc: "sudoers 문법 검사" },
          { flag: "-f", desc: "다른 sudoers 파일 지정" },
          { flag: "-s", desc: "셸 모드 편집" }
        ],
        examples: [
          { label: "sudoers 편집", code: "visudo" },
          { label: "문법 검사", code: "visudo -c" }
        ],
        diff: "Rocky는 wheel 그룹 기반 sudo 설정을 자주 다룹니다.",
        warnings: ["sudoers 오타는 접근 불가로 이어질 수 있으니 visudo만 사용하는 게 안전합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-c", desc: "sudoers 문법 검사" },
          { flag: "-f", desc: "다른 sudoers 파일 지정" },
          { flag: "-s", desc: "셸 모드 편집" }
        ],
        examples: [
          { label: "sudoers 편집", code: "visudo" },
          { label: "문법 검사", code: "visudo -c" }
        ],
        diff: "Ubuntu는 sudo 그룹 기반 권한 관리가 일반적입니다.",
        warnings: ["sudoers 오타는 접근 불가로 이어질 수 있으니 visudo만 사용하는 게 안전합니다."]
      }
    }
  },
  {
    id: "restorecon",
    category: "security",
    title: "restorecon",
    summary: "SELinux 파일 컨텍스트를 기본값으로 복구합니다.",
    command: "restorecon -Rv /var/www",
    keywords: ["selinux", "context", "label", "relabel"],
    variants: {
      rocky: {
        options: [
          { flag: "-R", desc: "재귀 적용" },
          { flag: "-v", desc: "변경 내용 표시" },
          { flag: "-n", desc: "실제 변경 없이 미리보기" },
          { flag: "-F", desc: "강제 재라벨" }
        ],
        examples: [
          { label: "웹 컨텍스트 복구", code: "restorecon -Rv /var/www" },
          { label: "미리보기", code: "restorecon -nRv /var/www" }
        ],
        diff: "Rocky에서는 SELinux deny 이후 가장 먼저 보는 도구 중 하나입니다.",
        warnings: ["임의의 chcon보다 restorecon이 더 안전한 경우가 많습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-R", desc: "재귀 적용" },
          { flag: "-v", desc: "변경 내용 표시" },
          { flag: "-n", desc: "실제 변경 없이 미리보기" },
          { flag: "-F", desc: "강제 재라벨" }
        ],
        examples: [
          { label: "웹 컨텍스트 복구", code: "restorecon -Rv /var/www" },
          { label: "미리보기", code: "restorecon -nRv /var/www" }
        ],
        diff: "Ubuntu에서는 보통 AppArmor를 쓰지만 SELinux 활성화 환경에서도 필요합니다.",
        warnings: ["임의의 chcon보다 restorecon이 더 안전한 경우가 많습니다."]
      }
    }
  },
  {
    id: "semanage",
    category: "security",
    title: "semanage",
    summary: "SELinux 정책과 포트/컨텍스트를 영구적으로 조정합니다.",
    command: "semanage port -a -t http_port_t -p tcp 8080",
    keywords: ["selinux", "policy", "port", "context", "permanent"],
    variants: {
      rocky: {
        options: [
          { flag: "port -a", desc: "포트 타입 영구 추가" },
          { flag: "fcontext -a", desc: "파일 컨텍스트 영구 추가" },
          { flag: "-l", desc: "정책 목록 보기" },
          { flag: "-n", desc: "오프라인 처럼 미리 확인" }
        ],
        examples: [
          { label: "8080 포트 허용", code: "semanage port -a -t http_port_t -p tcp 8080" },
          { label: "컨텍스트 추가", code: "semanage fcontext -a -t httpd_sys_content_t '/srv/web(/.*)?'" }
        ],
        diff: "Rocky에서 SELinux 정책 수정의 핵심 도구입니다.",
        warnings: ["패키지 `policycoreutils-python-utils`가 필요할 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "port -a", desc: "포트 타입 영구 추가" },
          { flag: "fcontext -a", desc: "파일 컨텍스트 영구 추가" },
          { flag: "-l", desc: "정책 목록 보기" },
          { flag: "-n", desc: "오프라인 처럼 미리 확인" }
        ],
        examples: [
          { label: "8080 포트 허용", code: "semanage port -a -t http_port_t -p tcp 8080" },
          { label: "컨텍스트 추가", code: "semanage fcontext -a -t httpd_sys_content_t '/srv/web(/.*)?'" }
        ],
        diff: "Ubuntu에서는 SELinux 사용 환경에서만 의미가 큽니다.",
        warnings: ["패키지 `policycoreutils-python-utils`가 필요할 수 있습니다."]
      }
    }
  },
  {
    id: "chcon",
    category: "security",
    title: "chcon",
    summary: "파일의 SELinux 컨텍스트를 즉시 바꿉니다.",
    command: "chcon -t httpd_sys_content_t /srv/web/index.html",
    keywords: ["selinux", "context", "label", "temporary"],
    variants: {
      rocky: {
        options: [
          { flag: "-t", desc: "타입 지정" },
          { flag: "-R", desc: "재귀 적용" },
          { flag: "-v", desc: "변경 내용 표시" },
          { flag: "--reference", desc: "기준 파일과 동일한 컨텍스트 적용" }
        ],
        examples: [
          { label: "컨텍스트 즉시 변경", code: "chcon -t httpd_sys_content_t /srv/web/index.html" },
          { label: "기준 파일 따라가기", code: "chcon --reference=/var/www/html/index.html /srv/web/index.html" }
        ],
        diff: "Rocky에서 임시 복구용으로 자주 씁니다.",
        warnings: ["영구 반영이 아니라서 재부팅/재라벨 시 원복될 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-t", desc: "타입 지정" },
          { flag: "-R", desc: "재귀 적용" },
          { flag: "-v", desc: "변경 내용 표시" },
          { flag: "--reference", desc: "기준 파일과 동일한 컨텍스트 적용" }
        ],
        examples: [
          { label: "컨텍스트 즉시 변경", code: "chcon -t httpd_sys_content_t /srv/web/index.html" },
          { label: "기준 파일 따라가기", code: "chcon --reference=/var/www/html/index.html /srv/web/index.html" }
        ],
        diff: "Ubuntu에서는 SELinux 사용 환경에서만 의미가 큽니다.",
        warnings: ["영구 반영이 아니라서 재부팅/재라벨 시 원복될 수 있습니다."]
      }
    }
  },
  {
    id: "timedatectl",
    category: "time",
    title: "timedatectl",
    summary: "시간, 타임존, NTP 동기화 상태를 확인합니다.",
    command: "timedatectl status",
    keywords: ["time", "timezone", "ntp", "clock"],
    variants: {
      rocky: {
        options: [
          { flag: "status", desc: "시간/타임존/NTP 상태 확인" },
          { flag: "set-timezone", desc: "타임존 설정" },
          { flag: "set-ntp", desc: "NTP 활성화/비활성화" }
        ],
        examples: [
          { label: "상태 확인", code: "timedatectl status" },
          { label: "타임존 변경", code: "timedatectl set-timezone Asia/Seoul" }
        ],
        diff: "Rocky에서도 systemd 기반으로 동일하게 사용합니다.",
        warnings: ["서버 시간은 인증서와 로그 정합성에 직접 영향을 줍니다."]
      },
      ubuntu: {
        options: [
          { flag: "status", desc: "시간/타임존/NTP 상태 확인" },
          { flag: "set-timezone", desc: "타임존 설정" },
          { flag: "set-ntp", desc: "NTP 활성화/비활성화" }
        ],
        examples: [
          { label: "상태 확인", code: "timedatectl status" },
          { label: "타임존 변경", code: "timedatectl set-timezone Asia/Seoul" }
        ],
        diff: "Ubuntu도 동일합니다.",
        warnings: ["서버 시간은 인증서와 로그 정합성에 직접 영향을 줍니다."]
      }
    }
  },
  {
    id: "chronyc",
    category: "time",
    title: "chronyc",
    summary: "chrony NTP 동기화 상태와 소스를 확인합니다.",
    command: "chronyc tracking && chronyc sources -v",
    keywords: ["ntp", "chrony", "clock", "sync"],
    variants: {
      rocky: {
        options: [
          { flag: "tracking", desc: "동기화 상태 요약" },
          { flag: "sources -v", desc: "시간 소스 목록 상세" },
          { flag: "burst", desc: "즉시 동기화 시도" },
          { flag: "makestep", desc: "큰 시간 차이를 즉시 보정" }
        ],
        examples: [
          { label: "동기화 상태", code: "chronyc tracking" },
          { label: "소스 확인", code: "chronyc sources -v" }
        ],
        diff: "Rocky는 chrony가 표준인 경우가 많습니다.",
        warnings: ["시간이 크게 틀어지면 인증/로그/클러스터에 영향이 큽니다."]
      },
      ubuntu: {
        options: [
          { flag: "tracking", desc: "동기화 상태 요약" },
          { flag: "sources -v", desc: "시간 소스 목록 상세" },
          { flag: "burst", desc: "즉시 동기화 시도" },
          { flag: "makestep", desc: "큰 시간 차이를 즉시 보정" }
        ],
        examples: [
          { label: "동기화 상태", code: "chronyc tracking" },
          { label: "소스 확인", code: "chronyc sources -v" }
        ],
        diff: "Ubuntu 서버에서도 chrony 사용 시 그대로 동일합니다.",
        warnings: ["시간이 크게 틀어지면 인증/로그/클러스터에 영향이 큽니다."]
      }
    }
  },
  {
    id: "iostat",
    category: "performance",
    title: "iostat",
    summary: "디스크 I/O와 CPU 사용률을 확인합니다.",
    command: "iostat -xz 1",
    keywords: ["io", "disk", "cpu", "sysstat"],
    variants: {
      rocky: {
        options: [
          { flag: "-x", desc: "확장 통계" },
          { flag: "-z", desc: "0인 항목 숨김" },
          { flag: "1", desc: "1초 간격 반복" }
        ],
        examples: [
          { label: "I/O 점검", code: "iostat -xz 1" },
          { label: "디스크별 상세", code: "iostat -xz /dev/nvme0n1 1" }
        ],
        diff: "Rocky에서는 디스크 병목을 볼 때 필수입니다.",
        warnings: ["`sysstat` 패키지가 필요할 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-x", desc: "확장 통계" },
          { flag: "-z", desc: "0인 항목 숨김" },
          { flag: "1", desc: "1초 간격 반복" }
        ],
        examples: [
          { label: "I/O 점검", code: "iostat -xz 1" },
          { label: "디스크별 상세", code: "iostat -xz /dev/sda 1" }
        ],
        diff: "Ubuntu도 `sysstat` 패키지가 있어야 합니다.",
        warnings: ["`sysstat` 패키지가 필요할 수 있습니다."]
      }
    }
  },
  {
    id: "iotop",
    category: "performance",
    title: "iotop",
    summary: "프로세스별 디스크 I/O 사용량을 확인합니다.",
    command: "iotop -oPa",
    keywords: ["io", "process", "disk", "bottleneck"],
    variants: {
      rocky: {
        options: [
          { flag: "-o", desc: "실제 I/O가 있는 프로세스만 표시" },
          { flag: "-P", desc: "스레드 대신 프로세스 단위 표시" },
          { flag: "-a", desc: "누적 사용량 표시" }
        ],
        examples: [
          { label: "I/O 많은 프로세스", code: "iotop -oPa" },
          { label: "실시간 보기", code: "iotop" }
        ],
        diff: "루트 권한이 필요할 수 있습니다.",
        warnings: ["I/O 문제는 disk, fs, DB, 로그 로테이션과 함께 봐야 합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-o", desc: "실제 I/O가 있는 프로세스만 표시" },
          { flag: "-P", desc: "스레드 대신 프로세스 단위 표시" },
          { flag: "-a", desc: "누적 사용량 표시" }
        ],
        examples: [
          { label: "I/O 많은 프로세스", code: "iotop -oPa" },
          { label: "실시간 보기", code: "iotop" }
        ],
        diff: "루트 권한이 필요할 수 있습니다.",
        warnings: ["I/O 문제는 disk, fs, DB, 로그 로테이션과 함께 봐야 합니다."]
      }
    }
  },
  {
    id: "sar",
    category: "performance",
    title: "sar",
    summary: "시스템 성능 히스토리를 확인합니다.",
    command: "sar -u 1 5",
    keywords: ["sysstat", "history", "cpu", "memory", "io"],
    variants: {
      rocky: {
        options: [
          { flag: "-u", desc: "CPU 사용률" },
          { flag: "-r", desc: "메모리 사용량" },
          { flag: "-b", desc: "블록 I/O" },
          { flag: "-n DEV", desc: "네트워크 인터페이스" }
        ],
        examples: [
          { label: "CPU 히스토리", code: "sar -u 1 5" },
          { label: "디스크 I/O", code: "sar -b 1 5" }
        ],
        diff: "Rocky에서는 sysstat 히스토리가 쌓여 있으면 사후 분석에 유용합니다.",
        warnings: ["기록이 꺼져 있으면 과거 데이터를 못 볼 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-u", desc: "CPU 사용률" },
          { flag: "-r", desc: "메모리 사용량" },
          { flag: "-b", desc: "블록 I/O" },
          { flag: "-n DEV", desc: "네트워크 인터페이스" }
        ],
        examples: [
          { label: "CPU 히스토리", code: "sar -u 1 5" },
          { label: "디스크 I/O", code: "sar -b 1 5" }
        ],
        diff: "Ubuntu에서도 sysstat 히스토리가 있으면 유용합니다.",
        warnings: ["기록이 꺼져 있으면 과거 데이터를 못 볼 수 있습니다."]
      }
    }
  },
  {
    id: "dnf-history",
    category: "packages",
    title: "dnf history",
    summary: "DNF로 수행한 설치/업데이트 기록을 확인합니다.",
    command: "dnf history",
    keywords: ["package history", "rollback", "update", "audit"],
    variants: {
      rocky: {
        options: [
          { flag: "history", desc: "패키지 작업 이력 표시" },
          { flag: "history info", desc: "특정 트랜잭션 상세 확인" },
          { flag: "history undo", desc: "트랜잭션 되돌리기" }
        ],
        examples: [
          { label: "이력 보기", code: "dnf history" },
          { label: "트랜잭션 상세", code: "dnf history info 42" }
        ],
        diff: "Rocky는 롤백 검토에 유용합니다.",
        warnings: ["되돌리기 전 현재 상태와 의존성을 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "apt history", desc: "apt 로그 파일을 기반으로 이력 확인" },
          { flag: "history.log", desc: "로그 경로 참고" }
        ],
        examples: [
          { label: "이력 비슷하게 확인", code: "grep 'Commandline' /var/log/apt/history.log" }
        ],
        diff: "Ubuntu는 apt 로그를 직접 보는 방식이 더 일반적입니다.",
        warnings: ["로그 기반이라 DNF처럼 트랜잭션 단위 되돌리기는 제한적입니다."]
      }
    }
  },
  {
    id: "dnf-autoremove",
    category: "packages",
    title: "dnf autoremove",
    summary: "더 이상 필요 없는 의존 패키지를 제거합니다.",
    command: "dnf autoremove",
    keywords: ["cleanup", "dependencies", "unused", "package"],
    variants: {
      rocky: {
        options: [
          { flag: "autoremove", desc: "불필요 의존성 제거" },
          { flag: "--assumeno", desc: "실행 전 미리보기" },
          { flag: "-y", desc: "자동 확인" }
        ],
        examples: [
          { label: "정리", code: "dnf autoremove" },
          { label: "미리보기", code: "dnf autoremove --assumeno" }
        ],
        diff: "Rocky에서는 커널/라이브러리 잔여물을 정리할 때 유용합니다.",
        warnings: ["의존성 자동 제거가 필요한 패키지까지 지우지 않는지 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "autoremove", desc: "불필요 의존성 제거" },
          { flag: "--purge", desc: "설정 파일까지 제거" },
          { flag: "-y", desc: "자동 확인" }
        ],
        examples: [
          { label: "정리", code: "apt autoremove" },
          { label: "설정까지 제거", code: "apt autoremove --purge" }
        ],
        diff: "Ubuntu는 apt autoremove가 대응 명령입니다.",
        warnings: ["운영 서버에서는 제거 목록을 꼭 먼저 검토하세요."]
      }
    }
  },
  {
    id: "dnf-config-manager",
    category: "packages",
    title: "dnf config-manager",
    summary: "리포지토리 추가와 저장소 설정을 관리합니다.",
    command: "dnf config-manager --add-repo URL",
    keywords: ["repo", "repository", "config", "enable", "disable"],
    variants: {
      rocky: {
        options: [
          { flag: "--add-repo", desc: "새 저장소 추가" },
          { flag: "--set-enabled", desc: "저장소 활성화" },
          { flag: "--set-disabled", desc: "저장소 비활성화" },
          { flag: "--dump", desc: "저장소 설정 출력" }
        ],
        examples: [
          { label: "저장소 추가", code: "dnf config-manager --add-repo https://example/repo.repo" },
          { label: "저장소 목록", code: "dnf repolist" }
        ],
        diff: "Rocky는 저장소를 신중하게 관리해야 합니다.",
        warnings: ["외부 저장소는 보안과 유지보수성을 확인한 뒤 추가하세요."]
      },
      ubuntu: {
        options: [
          { flag: "add-apt-repository", desc: "저장소 추가" },
          { flag: "sources.list", desc: "소스 파일 관리" },
          { flag: "apt update", desc: "목록 갱신" }
        ],
        examples: [
          { label: "PPA 추가", code: "add-apt-repository ppa:some/ppa" },
          { label: "목록 갱신", code: "apt update" }
        ],
        diff: "Ubuntu는 add-apt-repository가 대응합니다.",
        warnings: ["불필요한 PPA는 추후 업그레이드 충돌을 만들 수 있습니다."]
      }
    }
  },
  {
    id: "apt-autoremove",
    category: "packages",
    title: "apt autoremove",
    summary: "Ubuntu에서 더 이상 필요 없는 의존 패키지를 제거합니다.",
    command: "apt autoremove",
    keywords: ["cleanup", "dependencies", "unused", "package"],
    variants: {
      rocky: {
        options: [
          { flag: "n/a", desc: "Ubuntu 전용 대응 명령" }
        ],
        examples: [
          { label: "동등 기능", code: "dnf autoremove" }
        ],
        diff: "Rocky에서는 dnf autoremove를 사용합니다.",
        warnings: ["이 카드는 Ubuntu 전용입니다."]
      },
      ubuntu: {
        options: [
          { flag: "autoremove", desc: "불필요 의존성 제거" },
          { flag: "--purge", desc: "설정 파일까지 제거" },
          { flag: "-y", desc: "자동 확인" }
        ],
        examples: [
          { label: "정리", code: "apt autoremove" },
          { label: "설정까지 제거", code: "apt autoremove --purge" }
        ],
        diff: "Ubuntu에서 불필요 의존성을 정리하는 기본 명령입니다.",
        warnings: ["운영 서버에서는 제거 목록을 꼭 먼저 검토하세요."]
      }
    }
  },
  {
    id: "apt-mark-hold",
    category: "packages",
    title: "apt-mark hold",
    summary: "특정 패키지의 자동 업그레이드를 고정합니다.",
    command: "apt-mark hold package",
    keywords: ["pin", "freeze", "upgrade", "package"],
    variants: {
      rocky: {
        options: [
          { flag: "dnf versionlock", desc: "Rocky 쪽 대응 기능" }
        ],
        examples: [
          { label: "대응 기능", code: "dnf versionlock add package" }
        ],
        diff: "Rocky는 versionlock 플러그인을 씁니다.",
        warnings: ["이 카드는 Ubuntu 중심입니다."]
      },
      ubuntu: {
        options: [
          { flag: "hold", desc: "업그레이드 고정" },
          { flag: "unhold", desc: "고정 해제" },
          { flag: "showhold", desc: "고정 목록 확인" }
        ],
        examples: [
          { label: "고정", code: "apt-mark hold nginx" },
          { label: "해제", code: "apt-mark unhold nginx" }
        ],
        diff: "Ubuntu에서 특정 버전을 유지할 때 자주 씁니다.",
        warnings: ["핵심 패키지 고정은 보안 업데이트를 막을 수 있습니다."]
      }
    }
  },
  {
    id: "add-apt-repository",
    category: "packages",
    title: "add-apt-repository",
    summary: "Ubuntu에서 저장소나 PPA를 추가합니다.",
    command: "add-apt-repository ppa:example/ppa",
    keywords: ["ppa", "repo", "source", "apt"],
    variants: {
      rocky: {
        options: [
          { flag: "dnf config-manager", desc: "Rocky 쪽 저장소 추가 대응" }
        ],
        examples: [
          { label: "대응 기능", code: "dnf config-manager --add-repo URL" }
        ],
        diff: "Rocky는 dnf config-manager가 대응 기능입니다.",
        warnings: ["이 카드는 Ubuntu 전용에 가깝습니다."]
      },
      ubuntu: {
        options: [
          { flag: "PPA", desc: "개인 패키지 저장소 추가" },
          { flag: "--remove", desc: "저장소 제거" }
        ],
        examples: [
          { label: "PPA 추가", code: "add-apt-repository ppa:example/ppa" },
          { label: "저장소 제거", code: "add-apt-repository --remove ppa:example/ppa" }
        ],
        diff: "Ubuntu에서 외부 저장소를 추가하는 대표 명령입니다.",
        warnings: ["출처가 불분명한 PPA는 운영 서버에 넣지 마세요."]
      }
    }
  },
  {
    id: "md5sum",
    category: "diagnostics",
    title: "md5sum",
    summary: "파일 체크섬을 확인합니다.",
    command: "md5sum file",
    keywords: ["checksum", "integrity", "hash", "verify"],
    variants: {
      rocky: {
        options: [
          { flag: "--check", desc: "체크섬 파일로 검증" },
          { flag: "-b", desc: "바이너리 모드" },
          { flag: "-c", desc: "검증" }
        ],
        examples: [
          { label: "무결성 확인", code: "md5sum file.iso" },
          { label: "검증", code: "md5sum -c MD5SUMS" }
        ],
        diff: "공통입니다.",
        warnings: ["보안 목적보다는 무결성 확인용으로 쓰는 편이 적절합니다."]
      },
      ubuntu: {
        options: [
          { flag: "--check", desc: "체크섬 파일로 검증" },
          { flag: "-b", desc: "바이너리 모드" },
          { flag: "-c", desc: "검증" }
        ],
        examples: [
          { label: "무결성 확인", code: "md5sum file.iso" },
          { label: "검증", code: "md5sum -c MD5SUMS" }
        ],
        diff: "공통입니다.",
        warnings: ["보안 목적보다는 무결성 확인용으로 쓰는 편이 적절합니다."]
      }
    }
  },
  {
    id: "sha256sum",
    category: "diagnostics",
    title: "sha256sum",
    summary: "더 강한 해시로 파일 무결성을 확인합니다.",
    command: "sha256sum file",
    keywords: ["checksum", "integrity", "hash", "verify"],
    variants: {
      rocky: {
        options: [
          { flag: "--check", desc: "체크섬 파일로 검증" },
          { flag: "-b", desc: "바이너리 모드" },
          { flag: "-c", desc: "검증" }
        ],
        examples: [
          { label: "무결성 확인", code: "sha256sum file.iso" },
          { label: "검증", code: "sha256sum -c SHA256SUMS" }
        ],
        diff: "공통입니다.",
        warnings: ["배포 파일 검증에는 md5보다 sha256이 더 일반적입니다."]
      },
      ubuntu: {
        options: [
          { flag: "--check", desc: "체크섬 파일로 검증" },
          { flag: "-b", desc: "바이너리 모드" },
          { flag: "-c", desc: "검증" }
        ],
        examples: [
          { label: "무결성 확인", code: "sha256sum file.iso" },
          { label: "검증", code: "sha256sum -c SHA256SUMS" }
        ],
        diff: "공통입니다.",
        warnings: ["배포 파일 검증에는 md5보다 sha256이 더 일반적입니다."]
      }
    }
  },
  {
    id: "strace",
    category: "diagnostics",
    title: "strace",
    summary: "프로세스가 무슨 시스템 호출을 하는지 추적합니다.",
    command: "strace -f -p PID",
    keywords: ["syscall", "debug", "process", "troubleshoot"],
    variants: {
      rocky: {
        options: [
          { flag: "-p", desc: "실행 중 프로세스에 붙기" },
          { flag: "-f", desc: "자식 프로세스까지 추적" },
          { flag: "-o", desc: "출력을 파일로 저장" },
          { flag: "-e", desc: "시스템 콜 필터" }
        ],
        examples: [
          { label: "프로세스 추적", code: "strace -f -p 1234" },
          { label: "파일 열기만 보기", code: "strace -e trace=openat -p 1234" }
        ],
        diff: "Rocky에서 장애 원인 파악용으로 자주 씁니다.",
        warnings: ["부하가 커질 수 있어 짧게 필요한 부분만 추적하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-p", desc: "실행 중 프로세스에 붙기" },
          { flag: "-f", desc: "자식 프로세스까지 추적" },
          { flag: "-o", desc: "출력을 파일로 저장" },
          { flag: "-e", desc: "시스템 콜 필터" }
        ],
        examples: [
          { label: "프로세스 추적", code: "strace -f -p 1234" },
          { label: "파일 열기만 보기", code: "strace -e trace=openat -p 1234" }
        ],
        diff: "Ubuntu에서도 동일하게 유용합니다.",
        warnings: ["부하가 커질 수 있어 짧게 필요한 부분만 추적하세요."]
      }
    }
  },
  {
    id: "at",
    category: "services",
    title: "at",
    summary: "한 번만 실행할 예약 작업을 등록합니다.",
    command: "echo 'backup.sh' | at 23:00",
    keywords: ["one-time", "schedule", "job", "batch"],
    variants: {
      rocky: {
        options: [
          { flag: "at", desc: "한 번 실행할 작업 예약" },
          { flag: "atq", desc: "예약 목록" },
          { flag: "atrm", desc: "예약 삭제" }
        ],
        examples: [
          { label: "한 번 예약", code: "echo 'backup.sh' | at 23:00" },
          { label: "목록 확인", code: "atq" }
        ],
        diff: "크론보다 단발성 작업에 적합합니다.",
        warnings: ["atd 서비스가 활성화되어 있어야 합니다."]
      },
      ubuntu: {
        options: [
          { flag: "at", desc: "한 번 실행할 작업 예약" },
          { flag: "atq", desc: "예약 목록" },
          { flag: "atrm", desc: "예약 삭제" }
        ],
        examples: [
          { label: "한 번 예약", code: "echo 'backup.sh' | at 23:00" },
          { label: "목록 확인", code: "atq" }
        ],
        diff: "크론보다 단발성 작업에 적합합니다.",
        warnings: ["atd 서비스가 활성화되어 있어야 합니다."]
      }
    }
  },
  {
    id: "systemd-analyze",
    category: "systemd",
    title: "systemd-analyze",
    summary: "부팅 시간과 systemd 유닛 병목을 분석합니다.",
    command: "systemd-analyze blame",
    keywords: ["boot", "startup", "units", "performance"],
    variants: {
      rocky: {
        options: [
          { flag: "blame", desc: "부팅에 오래 걸린 유닛 순서" },
          { flag: "critical-chain", desc: "부팅 병목 체인" },
          { flag: "time", desc: "전체 부팅 시간 요약" },
          { flag: "plot", desc: "SVG 타임라인 생성" }
        ],
        examples: [
          { label: "부팅 느린 유닛", code: "systemd-analyze blame" },
          { label: "병목 체인", code: "systemd-analyze critical-chain" }
        ],
        diff: "Rocky에서 부팅 지연 분석에 유용합니다.",
        warnings: ["유닛 비활성화 전에 의존성을 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "blame", desc: "부팅에 오래 걸린 유닛 순서" },
          { flag: "critical-chain", desc: "부팅 병목 체인" },
          { flag: "time", desc: "전체 부팅 시간 요약" },
          { flag: "plot", desc: "SVG 타임라인 생성" }
        ],
        examples: [
          { label: "부팅 느린 유닛", code: "systemd-analyze blame" },
          { label: "병목 체인", code: "systemd-analyze critical-chain" }
        ],
        diff: "Ubuntu에서도 부팅 지연 분석에 유용합니다.",
        warnings: ["유닛 비활성화 전에 의존성을 확인하세요."]
      }
    }
  },
  {
    id: "systemctl-edit",
    category: "systemd",
    title: "systemctl edit",
    summary: "유닛 오버라이드를 안전하게 추가합니다.",
    command: "systemctl edit nginx",
    keywords: ["override", "unit", "daemon", "service"],
    variants: {
      rocky: {
        options: [
          { flag: "edit", desc: "오버라이드 파일 편집" },
          { flag: "--full", desc: "유닛 전체 복사 편집" },
          { flag: "daemon-reload", desc: "변경 후 재로드" }
        ],
        examples: [
          { label: "오버라이드", code: "systemctl edit nginx" },
          { label: "전체 편집", code: "systemctl edit --full nginx" }
        ],
        diff: "Rocky에서 서비스 튜닝 시 자주 씁니다.",
        warnings: ["직접 원본을 고치지 말고 오버라이드 방식이 더 안전합니다."]
      },
      ubuntu: {
        options: [
          { flag: "edit", desc: "오버라이드 파일 편집" },
          { flag: "--full", desc: "유닛 전체 복사 편집" },
          { flag: "daemon-reload", desc: "변경 후 재로드" }
        ],
        examples: [
          { label: "오버라이드", code: "systemctl edit nginx" },
          { label: "전체 편집", code: "systemctl edit --full nginx" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["직접 원본을 고치지 말고 오버라이드 방식이 더 안전합니다."]
      }
    }
  },
  {
    id: "pvs",
    category: "lvm",
    title: "pvs",
    summary: "LVM 물리 볼륨 상태를 확인합니다.",
    command: "pvs",
    keywords: ["lvm", "pv", "storage", "disk expansion"],
    variants: {
      rocky: {
        options: [
          { flag: "-o", desc: "출력 컬럼 지정" },
          { flag: "--segments", desc: "세그먼트 정보 포함" }
        ],
        examples: [
          { label: "물리 볼륨 확인", code: "pvs" },
          { label: "세부 보기", code: "pvs -o pv_name,pv_size,pv_free" }
        ],
        diff: "LVM 디스크 증설의 출발점입니다.",
        warnings: ["새 디스크가 보이지 않으면 먼저 `lsblk`와 `fdisk -l`을 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-o", desc: "출력 컬럼 지정" },
          { flag: "--segments", desc: "세그먼트 정보 포함" }
        ],
        examples: [
          { label: "물리 볼륨 확인", code: "pvs" },
          { label: "세부 보기", code: "pvs -o pv_name,pv_size,pv_free" }
        ],
        diff: "Ubuntu에서도 LVM 디스크 증설의 출발점입니다.",
        warnings: ["새 디스크가 보이지 않으면 먼저 `lsblk`와 `fdisk -l`을 확인하세요."]
      }
    }
  },
  {
    id: "vgs",
    category: "lvm",
    title: "vgs",
    summary: "LVM 볼륨 그룹의 여유 공간을 확인합니다.",
    command: "vgs",
    keywords: ["lvm", "vg", "free space", "storage"],
    variants: {
      rocky: {
        options: [
          { flag: "-o", desc: "출력 컬럼 지정" },
          { flag: "--units g", desc: "기본 단위를 GiB로 표시" }
        ],
        examples: [
          { label: "볼륨 그룹 확인", code: "vgs" },
          { label: "여유 공간 확인", code: "vgs -o vg_name,vg_size,vg_free" }
        ],
        diff: "LV 확장 가능 여부를 판단할 때 먼저 봅니다.",
        warnings: ["VG 여유 공간이 없으면 PV 추가나 디스크 확장이 필요합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-o", desc: "출력 컬럼 지정" },
          { flag: "--units g", desc: "기본 단위를 GiB로 표시" }
        ],
        examples: [
          { label: "볼륨 그룹 확인", code: "vgs" },
          { label: "여유 공간 확인", code: "vgs -o vg_name,vg_size,vg_free" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["VG 여유 공간이 없으면 PV 추가나 디스크 확장이 필요합니다."]
      }
    }
  },
  {
    id: "lvs",
    category: "lvm",
    title: "lvs",
    summary: "LVM 논리 볼륨과 크기, 마운트 대상을 확인합니다.",
    command: "lvs",
    keywords: ["lvm", "lv", "logical volume", "storage"],
    variants: {
      rocky: {
        options: [
          { flag: "-o", desc: "출력 컬럼 지정" },
          { flag: "--segments", desc: "세그먼트 정보 포함" },
          { flag: "--units g", desc: "GiB 단위로 보기" }
        ],
        examples: [
          { label: "논리 볼륨 확인", code: "lvs" },
          { label: "세부 확인", code: "lvs -o lv_name,lv_size,lv_path" }
        ],
        diff: "실제 서비스 데이터가 올라간 볼륨을 볼 때 중요합니다.",
        warnings: ["확장 전후 파일시스템 크기도 함께 봐야 합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-o", desc: "출력 컬럼 지정" },
          { flag: "--segments", desc: "세그먼트 정보 포함" },
          { flag: "--units g", desc: "GiB 단위로 보기" }
        ],
        examples: [
          { label: "논리 볼륨 확인", code: "lvs" },
          { label: "세부 확인", code: "lvs -o lv_name,lv_size,lv_path" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["확장 전후 파일시스템 크기도 함께 봐야 합니다."]
      }
    }
  },
  {
    id: "pvcreate",
    category: "lvm",
    title: "pvcreate",
    summary: "새 디스크 또는 파티션을 LVM 물리 볼륨으로 초기화합니다.",
    command: "pvcreate /dev/sdb1",
    keywords: ["lvm", "physical volume", "initialize", "disk expansion"],
    variants: {
      rocky: {
        options: [
          { flag: "-ff", desc: "강제 초기화" },
          { flag: "-y", desc: "확인 자동 승인" },
          { flag: "-t", desc: "테스트 모드" }
        ],
        examples: [
          { label: "물리 볼륨 생성", code: "pvcreate /dev/sdb1" },
          { label: "테스트", code: "pvcreate -t /dev/sdb1" }
        ],
        diff: "LVM 디스크 증설의 시작 단계입니다.",
        warnings: ["장치명을 잘못 지정하면 데이터가 사라질 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-ff", desc: "강제 초기화" },
          { flag: "-y", desc: "확인 자동 승인" },
          { flag: "-t", desc: "테스트 모드" }
        ],
        examples: [
          { label: "물리 볼륨 생성", code: "pvcreate /dev/sdb1" },
          { label: "테스트", code: "pvcreate -t /dev/sdb1" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["장치명을 잘못 지정하면 데이터가 사라질 수 있습니다."]
      }
    }
  },
  {
    id: "vgcreate",
    category: "lvm",
    title: "vgcreate",
    summary: "물리 볼륨을 묶어서 볼륨 그룹을 만듭니다.",
    command: "vgcreate vg_data /dev/sdb1",
    keywords: ["lvm", "volume group", "storage", "pool"],
    variants: {
      rocky: {
        options: [
          { flag: "-s", desc: "PE 크기 지정" },
          { flag: "-f", desc: "강제 생성" },
          { flag: "-t", desc: "테스트 모드" }
        ],
        examples: [
          { label: "볼륨 그룹 생성", code: "vgcreate vg_data /dev/sdb1" },
          { label: "PE 크기 지정", code: "vgcreate -s 16M vg_data /dev/sdb1" }
        ],
        diff: "VG는 나중에 LV를 만들기 위한 저장소 풀입니다.",
        warnings: ["VG 이름은 나중에 서비스 스크립트에 들어가므로 규칙적으로 짓는 게 좋습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-s", desc: "PE 크기 지정" },
          { flag: "-f", desc: "강제 생성" },
          { flag: "-t", desc: "테스트 모드" }
        ],
        examples: [
          { label: "볼륨 그룹 생성", code: "vgcreate vg_data /dev/sdb1" },
          { label: "PE 크기 지정", code: "vgcreate -s 16M vg_data /dev/sdb1" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["VG 이름은 나중에 서비스 스크립트에 들어가므로 규칙적으로 짓는 게 좋습니다."]
      }
    }
  },
  {
    id: "lvcreate",
    category: "lvm",
    title: "lvcreate",
    summary: "볼륨 그룹 안에 논리 볼륨을 생성합니다.",
    command: "lvcreate -n lv_data -L 100G vg_data",
    keywords: ["lvm", "logical volume", "storage", "filesystem"],
    variants: {
      rocky: {
        options: [
          { flag: "-n", desc: "LV 이름 지정" },
          { flag: "-L", desc: "크기 지정" },
          { flag: "-l", desc: "PE 개수로 크기 지정" },
          { flag: "-t", desc: "테스트 모드" }
        ],
        examples: [
          { label: "LV 생성", code: "lvcreate -n lv_data -L 100G vg_data" },
          { label: "전체 공간 사용", code: "lvcreate -n lv_data -l 100%FREE vg_data" }
        ],
        diff: "실제 마운트할 공간을 만드는 단계입니다.",
        warnings: ["LV 생성 후 파일시스템 생성 단계가 따로 필요합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-n", desc: "LV 이름 지정" },
          { flag: "-L", desc: "크기 지정" },
          { flag: "-l", desc: "PE 개수로 크기 지정" },
          { flag: "-t", desc: "테스트 모드" }
        ],
        examples: [
          { label: "LV 생성", code: "lvcreate -n lv_data -L 100G vg_data" },
          { label: "전체 공간 사용", code: "lvcreate -n lv_data -l 100%FREE vg_data" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["LV 생성 후 파일시스템 생성 단계가 따로 필요합니다."]
      }
    }
  },
  {
    id: "lvextend",
    category: "lvm",
    title: "lvextend",
    summary: "논리 볼륨 크기를 늘립니다.",
    command: "lvextend -r -L +50G /dev/vg_data/lv_data",
    keywords: ["expand", "grow", "lvm", "filesystem"],
    variants: {
      rocky: {
        options: [
          { flag: "-r", desc: "파일시스템까지 자동 확장" },
          { flag: "-L +", desc: "지정 크기만큼 증가" },
          { flag: "-l +", desc: "PE 단위로 증가" }
        ],
        examples: [
          { label: "50G 확장", code: "lvextend -r -L +50G /dev/vg_data/lv_data" },
          { label: "남은 공간 모두", code: "lvextend -r -l +100%FREE /dev/vg_data/lv_data" }
        ],
        diff: "Rocky에서는 디스크 증설의 핵심 명령입니다.",
        warnings: ["`-r`가 없으면 파일시스템 확장은 별도 작업입니다."]
      },
      ubuntu: {
        options: [
          { flag: "-r", desc: "파일시스템까지 자동 확장" },
          { flag: "-L +", desc: "지정 크기만큼 증가" },
          { flag: "-l +", desc: "PE 단위로 증가" }
        ],
        examples: [
          { label: "50G 확장", code: "lvextend -r -L +50G /dev/vg_data/lv_data" },
          { label: "남은 공간 모두", code: "lvextend -r -l +100%FREE /dev/vg_data/lv_data" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["`-r`가 없으면 파일시스템 확장은 별도 작업입니다."]
      }
    }
  },
  {
    id: "fsck",
    category: "lvm",
    title: "fsck",
    summary: "파일시스템 무결성을 검사하고 복구합니다.",
    command: "fsck -f /dev/sdb1",
    keywords: ["filesystem check", "repair", "disk", "integrity"],
    variants: {
      rocky: {
        options: [
          { flag: "-f", desc: "강제로 검사" },
          { flag: "-y", desc: "수정 제안을 자동 승인" },
          { flag: "-n", desc: "수정 없이 검사" }
        ],
        examples: [
          { label: "강제 검사", code: "fsck -f /dev/sdb1" },
          { label: "자동 복구", code: "fsck -fy /dev/sdb1" }
        ],
        diff: "디스크 오류 복구 시 매우 중요합니다.",
        warnings: ["마운트된 파일시스템에 실행하면 위험할 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-f", desc: "강제로 검사" },
          { flag: "-y", desc: "수정 제안을 자동 승인" },
          { flag: "-n", desc: "수정 없이 검사" }
        ],
        examples: [
          { label: "강제 검사", code: "fsck -f /dev/sdb1" },
          { label: "자동 복구", code: "fsck -fy /dev/sdb1" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["마운트된 파일시스템에 실행하면 위험할 수 있습니다."]
      }
    }
  },
  {
    id: "mkswap",
    category: "lvm",
    title: "mkswap",
    summary: "스왑 영역을 초기화합니다.",
    command: "mkswap /dev/sdb2",
    keywords: ["swap", "memory", "page", "initialize"],
    variants: {
      rocky: {
        options: [
          { flag: "-L", desc: "레이블 지정" },
          { flag: "-U", desc: "UUID 지정" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "스왑 초기화", code: "mkswap /dev/sdb2" },
          { label: "레이블 포함", code: "mkswap -L swap1 /dev/sdb2" }
        ],
        diff: "스왑 파티션 생성 시 사용합니다.",
        warnings: ["데이터가 있던 파티션에 쓰면 내용이 사라집니다."]
      },
      ubuntu: {
        options: [
          { flag: "-L", desc: "레이블 지정" },
          { flag: "-U", desc: "UUID 지정" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "스왑 초기화", code: "mkswap /dev/sdb2" },
          { label: "레이블 포함", code: "mkswap -L swap1 /dev/sdb2" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["데이터가 있던 파티션에 쓰면 내용이 사라집니다."]
      }
    }
  },
  {
    id: "swapon",
    category: "lvm",
    title: "swapon",
    summary: "스왑을 활성화합니다.",
    command: "swapon /dev/sdb2",
    keywords: ["swap", "memory", "activate", "paging"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "fstab 기반 모든 스왑 활성화" },
          { flag: "-s", desc: "현재 스왑 상태 표시" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "스왑 활성화", code: "swapon /dev/sdb2" },
          { label: "상태 확인", code: "swapon -s" }
        ],
        diff: "스왑 활성화 후 free -h로 확인하는 습관이 좋습니다.",
        warnings: ["스왑 사용량이 높다면 메모리 압박 원인도 같이 봐야 합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "fstab 기반 모든 스왑 활성화" },
          { flag: "-s", desc: "현재 스왑 상태 표시" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "스왑 활성화", code: "swapon /dev/sdb2" },
          { label: "상태 확인", code: "swapon -s" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["스왑 사용량이 높다면 메모리 압박 원인도 같이 봐야 합니다."]
      }
    }
  },
  {
    id: "swapoff",
    category: "lvm",
    title: "swapoff",
    summary: "스왑을 비활성화합니다.",
    command: "swapoff /dev/sdb2",
    keywords: ["swap", "memory", "deactivate", "paging"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "모든 스왑 비활성화" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "스왑 비활성화", code: "swapoff /dev/sdb2" },
          { label: "모두 끄기", code: "swapoff -a" }
        ],
        diff: "스왑 제거 전 데이터 이동 상태를 확인해야 합니다.",
        warnings: ["메모리가 부족하면 swapoff가 실패할 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "모든 스왑 비활성화" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "스왑 비활성화", code: "swapoff /dev/sdb2" },
          { label: "모두 끄기", code: "swapoff -a" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["메모리가 부족하면 swapoff가 실패할 수 있습니다."]
      }
    }
  },
  {
    id: "fdisk",
    category: "filesystem-advanced",
    title: "fdisk",
    summary: "디스크 파티션 테이블을 조회하고 새 파티션을 만들거나 수정합니다.",
    command: "fdisk -l /dev/sdb",
    keywords: ["partition", "disk", "mbr", "gpt", "layout"],
    variants: {
      rocky: {
        options: [
          { flag: "-l", desc: "파티션 테이블 목록 출력" },
          { flag: "-x", desc: "추가 상세 정보" },
          { flag: "-t", desc: "테이블 타입 지정" },
          { flag: "n / d / p / w", desc: "생성/삭제/출력/저장" }
        ],
        examples: [
          { label: "디스크 목록", code: "fdisk -l" },
          { label: "GPT 디스크 확인", code: "fdisk -l /dev/nvme0n1" }
        ],
        diff: "Rocky에서 디스크 증설 전 가장 먼저 보는 명령 중 하나입니다.",
        warnings: ["쓰기 명령은 즉시 반영되므로 장치명을 반드시 재확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-l", desc: "파티션 테이블 목록 출력" },
          { flag: "-x", desc: "추가 상세 정보" },
          { flag: "-t", desc: "테이블 타입 지정" },
          { flag: "n / d / p / w", desc: "생성/삭제/출력/저장" }
        ],
        examples: [
          { label: "디스크 목록", code: "fdisk -l" },
          { label: "GPT 디스크 확인", code: "fdisk -l /dev/sda" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["쓰기 명령은 즉시 반영되므로 장치명을 반드시 재확인하세요."]
      }
    }
  },
  {
    id: "parted",
    category: "filesystem-advanced",
    title: "parted",
    summary: "GPT/대용량 디스크 파티션을 다룰 때 쓰는 도구입니다.",
    command: "parted -l",
    keywords: ["partition", "gpt", "align", "disk"],
    variants: {
      rocky: {
        options: [
          { flag: "-l", desc: "디스크와 파티션 목록" },
          { flag: "print", desc: "현재 파티션 테이블 출력" },
          { flag: "mkpart", desc: "새 파티션 생성" },
          { flag: "resizepart", desc: "파티션 크기 변경" }
        ],
        examples: [
          { label: "파티션 목록", code: "parted -l" },
          { label: "한 디스크 확인", code: "parted /dev/sdb print" }
        ],
        diff: "Rocky에서는 GPT 디스크 관리에 유용합니다.",
        warnings: ["파티션 변경은 운영 서비스와 직결되니 가상/테스트부터 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-l", desc: "디스크와 파티션 목록" },
          { flag: "print", desc: "현재 파티션 테이블 출력" },
          { flag: "mkpart", desc: "새 파티션 생성" },
          { flag: "resizepart", desc: "파티션 크기 변경" }
        ],
        examples: [
          { label: "파티션 목록", code: "parted -l" },
          { label: "한 디스크 확인", code: "parted /dev/sda print" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["파티션 변경은 운영 서비스와 직결되니 가상/테스트부터 확인하세요."]
      }
    }
  },
  {
    id: "mkfs-xfs",
    category: "filesystem-advanced",
    title: "mkfs.xfs",
    summary: "XFS 파일시스템을 새로 생성합니다.",
    command: "mkfs.xfs /dev/vg_data/lv_data",
    keywords: ["xfs", "format", "filesystem", "init"],
    variants: {
      rocky: {
        options: [
          { flag: "-f", desc: "기존 서명을 덮어쓰고 강제 생성" },
          { flag: "-L", desc: "레이블 지정" },
          { flag: "-m reflink=1", desc: "XFS 메타데이터 옵션" },
          { flag: "-d agcount=", desc: "allocation group 조정" }
        ],
        examples: [
          { label: "XFS 생성", code: "mkfs.xfs /dev/vg_data/lv_data" },
          { label: "강제 생성", code: "mkfs.xfs -f /dev/vg_data/lv_data" }
        ],
        diff: "Rocky는 기본 파일시스템이 XFS인 경우가 많습니다.",
        warnings: ["기존 데이터는 즉시 사라집니다."]
      },
      ubuntu: {
        options: [
          { flag: "-f", desc: "기존 서명을 덮어쓰고 강제 생성" },
          { flag: "-L", desc: "레이블 지정" },
          { flag: "-m reflink=1", desc: "XFS 메타데이터 옵션" },
          { flag: "-d agcount=", desc: "allocation group 조정" }
        ],
        examples: [
          { label: "XFS 생성", code: "mkfs.xfs /dev/vg_data/lv_data" },
          { label: "강제 생성", code: "mkfs.xfs -f /dev/vg_data/lv_data" }
        ],
        diff: "Ubuntu에서도 XFS를 사용한다면 동일합니다.",
        warnings: ["기존 데이터는 즉시 사라집니다."]
      }
    }
  },
  {
    id: "mkfs-ext4",
    category: "filesystem-advanced",
    title: "mkfs.ext4",
    summary: "ext4 파일시스템을 생성합니다.",
    command: "mkfs.ext4 /dev/sdb1",
    keywords: ["ext4", "format", "filesystem", "init"],
    variants: {
      rocky: {
        options: [
          { flag: "-L", desc: "레이블 지정" },
          { flag: "-m", desc: "reserved block 비율 지정" },
          { flag: "-b", desc: "블록 크기 지정" },
          { flag: "-F", desc: "강제 실행" }
        ],
        examples: [
          { label: "ext4 생성", code: "mkfs.ext4 /dev/sdb1" },
          { label: "레이블 포함", code: "mkfs.ext4 -L data /dev/sdb1" }
        ],
        diff: "Ubuntu에서 자주 보이고, Rocky도 필요 시 사용할 수 있습니다.",
        warnings: ["포맷은 되돌리기 어렵습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-L", desc: "레이블 지정" },
          { flag: "-m", desc: "reserved block 비율 지정" },
          { flag: "-b", desc: "블록 크기 지정" },
          { flag: "-F", desc: "강제 실행" }
        ],
        examples: [
          { label: "ext4 생성", code: "mkfs.ext4 /dev/sdb1" },
          { label: "레이블 포함", code: "mkfs.ext4 -L data /dev/sdb1" }
        ],
        diff: "Ubuntu에서 가장 흔한 파일시스템 생성 명령 중 하나입니다.",
        warnings: ["포맷은 되돌리기 어렵습니다."]
      }
    }
  },
  {
    id: "xfs-growfs",
    category: "filesystem-advanced",
    title: "xfs_growfs",
    summary: "마운트된 XFS 파일시스템을 확장합니다.",
    command: "xfs_growfs /data",
    keywords: ["xfs", "expand", "grow", "filesystem"],
    variants: {
      rocky: {
        options: [
          { flag: "-d", desc: "데이터 영역 확장" },
          { flag: "-D", desc: "블록 수 직접 지정" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "마운트 확장", code: "xfs_growfs /data" },
          { label: "전체 확장", code: "xfs_growfs -d /data" }
        ],
        diff: "Rocky의 기본 파일시스템이 XFS라 디스크 증설 때 자주 씁니다.",
        warnings: ["마운트된 XFS에서만 의미가 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-d", desc: "데이터 영역 확장" },
          { flag: "-D", desc: "블록 수 직접 지정" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "마운트 확장", code: "xfs_growfs /data" },
          { label: "전체 확장", code: "xfs_growfs -d /data" }
        ],
        diff: "Ubuntu에서도 XFS를 쓸 때 동일합니다.",
        warnings: ["마운트된 XFS에서만 의미가 있습니다."]
      }
    }
  },
  {
    id: "resize2fs",
    category: "filesystem-advanced",
    title: "resize2fs",
    summary: "ext2/ext3/ext4 파일시스템 크기를 조정합니다.",
    command: "resize2fs /dev/sdb1",
    keywords: ["ext4", "grow", "filesystem", "resize"],
    variants: {
      rocky: {
        options: [
          { flag: "-M", desc: "가능한 최소 크기로 축소" },
          { flag: "-P", desc: "필요 최소 블록 수 계산" },
          { flag: "size", desc: "목표 크기 지정" }
        ],
        examples: [
          { label: "ext4 확장", code: "resize2fs /dev/sdb1" },
          { label: "최소 크기 계산", code: "resize2fs -P /dev/sdb1" }
        ],
        diff: "Rocky에서도 ext4를 쓸 때 동일합니다.",
        warnings: ["축소는 특히 위험하므로 백업이 먼저입니다."]
      },
      ubuntu: {
        options: [
          { flag: "-M", desc: "가능한 최소 크기로 축소" },
          { flag: "-P", desc: "필요 최소 블록 수 계산" },
          { flag: "size", desc: "목표 크기 지정" }
        ],
        examples: [
          { label: "ext4 확장", code: "resize2fs /dev/sdb1" },
          { label: "최소 크기 계산", code: "resize2fs -P /dev/sdb1" }
        ],
        diff: "Ubuntu에서는 ext4 볼륨 확장에 자주 쓰입니다.",
        warnings: ["축소는 특히 위험하므로 백업이 먼저입니다."]
      }
    }
  },
  {
    id: "xfs-repair",
    category: "filesystem-advanced",
    title: "xfs_repair",
    summary: "XFS 파일시스템 오류를 점검하고 복구합니다.",
    command: "xfs_repair /dev/sdb1",
    keywords: ["xfs", "repair", "filesystem", "corruption"],
    variants: {
      rocky: {
        options: [
          { flag: "-n", desc: "실제 수정 없이 검사" },
          { flag: "-L", desc: "로그를 초기화하고 복구" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "복구 검사", code: "xfs_repair -n /dev/sdb1" },
          { label: "실제 복구", code: "xfs_repair /dev/sdb1" }
        ],
        diff: "Rocky에서 XFS 문제를 다룰 때 가장 중요한 도구 중 하나입니다.",
        warnings: ["마운트된 상태에서는 실행하지 마세요."]
      },
      ubuntu: {
        options: [
          { flag: "-n", desc: "실제 수정 없이 검사" },
          { flag: "-L", desc: "로그를 초기화하고 복구" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "복구 검사", code: "xfs_repair -n /dev/sdb1" },
          { label: "실제 복구", code: "xfs_repair /dev/sdb1" }
        ],
        diff: "Ubuntu에서도 XFS 오류 복구에 동일합니다.",
        warnings: ["마운트된 상태에서는 실행하지 마세요."]
      }
    }
  },
  {
    id: "findmnt",
    category: "storage",
    title: "findmnt",
    summary: "마운트 트리를 구조적으로 확인합니다.",
    command: "findmnt -a",
    keywords: ["mount", "tree", "filesystem", "fstab"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "모든 파일시스템 표시" },
          { flag: "-t", desc: "파일시스템 타입 필터" },
          { flag: "-S", desc: "장치 기준 검색" },
          { flag: "-T", desc: "경로 기준 검색" }
        ],
        examples: [
          { label: "경로 기준", code: "findmnt -T /var/log" },
          { label: "장치 기준", code: "findmnt -S /dev/nvme0n1p1" }
        ],
        diff: "마운트 구조를 볼 때 mount보다 읽기 쉽습니다.",
        warnings: ["마운트 상태 확인용으로 쓰고, 변경은 mount/umount로 하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "모든 파일시스템 표시" },
          { flag: "-t", desc: "파일시스템 타입 필터" },
          { flag: "-S", desc: "장치 기준 검색" },
          { flag: "-T", desc: "경로 기준 검색" }
        ],
        examples: [
          { label: "경로 기준", code: "findmnt -T /var/log" },
          { label: "장치 기준", code: "findmnt -S /dev/sda1" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["마운트 상태 확인용으로 쓰고, 변경은 mount/umount로 하세요."]
      }
    }
  },
  {
    id: "mount-remount",
    category: "storage",
    title: "mount -o remount",
    summary: "마운트된 파일시스템의 옵션을 다시 적용합니다.",
    command: "mount -o remount,rw /",
    keywords: ["remount", "rw", "ro", "fstab"],
    variants: {
      rocky: {
        options: [
          { flag: "remount", desc: "기존 마운트에 옵션 재적용" },
          { flag: "rw", desc: "읽기/쓰기 모드" },
          { flag: "ro", desc: "읽기 전용 모드" }
        ],
        examples: [
          { label: "루트 RW 전환", code: "mount -o remount,rw /" },
          { label: "읽기 전용 전환", code: "mount -o remount,ro /data" }
        ],
        diff: "설정 변경을 즉시 반영할 때 유용합니다.",
        warnings: ["운영 중인 파일시스템 옵션을 바꿀 때 서비스 영향이 없는지 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "remount", desc: "기존 마운트에 옵션 재적용" },
          { flag: "rw", desc: "읽기/쓰기 모드" },
          { flag: "ro", desc: "읽기 전용 모드" }
        ],
        examples: [
          { label: "루트 RW 전환", code: "mount -o remount,rw /" },
          { label: "읽기 전용 전환", code: "mount -o remount,ro /data" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["운영 중인 파일시스템 옵션을 바꿀 때 서비스 영향이 없는지 확인하세요."]
      }
    }
  },
  {
    id: "lsattr",
    category: "filesystem-advanced",
    title: "lsattr",
    summary: "파일 속성을 확인합니다.",
    command: "lsattr file",
    keywords: ["attributes", "immutable", "filesystem", "lock"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "숨김 파일 포함" },
          { flag: "-d", desc: "디렉토리 자체 속성 표시" },
          { flag: "-R", desc: "재귀 출력" }
        ],
        examples: [
          { label: "속성 확인", code: "lsattr /etc/hosts" },
          { label: "디렉토리 속성", code: "lsattr -d /var/www" }
        ],
        diff: "SELinux와 별개로 파일 속성을 볼 때 유용합니다.",
        warnings: ["속성만 보고 실제 권한과 혼동하지 마세요."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "숨김 파일 포함" },
          { flag: "-d", desc: "디렉토리 자체 속성 표시" },
          { flag: "-R", desc: "재귀 출력" }
        ],
        examples: [
          { label: "속성 확인", code: "lsattr /etc/hosts" },
          { label: "디렉토리 속성", code: "lsattr -d /var/www" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["속성만 보고 실제 권한과 혼동하지 마세요."]
      }
    }
  },
  {
    id: "chattr",
    category: "filesystem-advanced",
    title: "chattr",
    summary: "파일 속성을 변경합니다.",
    command: "chattr +i file",
    keywords: ["attributes", "immutable", "filesystem", "lock"],
    variants: {
      rocky: {
        options: [
          { flag: "+i", desc: "수정 불가" },
          { flag: "-i", desc: "수정 불가 해제" },
          { flag: "+a", desc: "append only" },
          { flag: "-R", desc: "재귀 적용" }
        ],
        examples: [
          { label: "변경 금지", code: "chattr +i /etc/hosts" },
          { label: "해제", code: "chattr -i /etc/hosts" }
        ],
        diff: "실수로 중요한 파일을 보호할 때 쓸 수 있지만 주의가 필요합니다.",
        warnings: ["immutable을 걸면 수정/삭제가 막히므로 잊지 말고 해제하세요."]
      },
      ubuntu: {
        options: [
          { flag: "+i", desc: "수정 불가" },
          { flag: "-i", desc: "수정 불가 해제" },
          { flag: "+a", desc: "append only" },
          { flag: "-R", desc: "재귀 적용" }
        ],
        examples: [
          { label: "변경 금지", code: "chattr +i /etc/hosts" },
          { label: "해제", code: "chattr -i /etc/hosts" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["immutable을 걸면 수정/삭제가 막히므로 잊지 말고 해제하세요."]
      }
    }
  },
  {
    id: "lscpu",
    category: "hardware",
    title: "lscpu",
    summary: "CPU 소켓, 코어, 스레드, 아키텍처 정보를 확인합니다.",
    command: "lscpu",
    keywords: ["cpu", "core", "socket", "threads", "architecture"],
    variants: {
      rocky: {
        options: [
          { flag: "-e", desc: "CPU별 상세 목록" },
          { flag: "-p", desc: "파싱하기 쉬운 형식" },
          { flag: "-J", desc: "JSON 형태 출력" }
        ],
        examples: [
          { label: "CPU 정보", code: "lscpu" },
          { label: "파싱용 출력", code: "lscpu -p" }
        ],
        diff: "CPU 구성 확인의 기본입니다.",
        warnings: ["가상화 환경에서는 실제 코어 수와 다르게 보일 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-e", desc: "CPU별 상세 목록" },
          { flag: "-p", desc: "파싱하기 쉬운 형식" },
          { flag: "-J", desc: "JSON 형태 출력" }
        ],
        examples: [
          { label: "CPU 정보", code: "lscpu" },
          { label: "파싱용 출력", code: "lscpu -p" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["가상화 환경에서는 실제 코어 수와 다르게 보일 수 있습니다."]
      }
    }
  },
  {
    id: "lspci",
    category: "hardware",
    title: "lspci",
    summary: "PCI 장치와 컨트롤러 정보를 확인합니다.",
    command: "lspci -nnk",
    keywords: ["pci", "device", "driver", "bus", "hardware"],
    variants: {
      rocky: {
        options: [
          { flag: "-nn", desc: "숫자 ID까지 표시" },
          { flag: "-k", desc: "드라이버 정보까지 표시" },
          { flag: "-vv", desc: "상세 출력" }
        ],
        examples: [
          { label: "PCI 목록", code: "lspci -nnk" },
          { label: "GPU 확인", code: "lspci | grep -i nvidia" }
        ],
        diff: "드라이버 문제 확인에 자주 씁니다.",
        warnings: ["추가 정보가 필요하면 root가 아닌 경우 일부가 빠질 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-nn", desc: "숫자 ID까지 표시" },
          { flag: "-k", desc: "드라이버 정보까지 표시" },
          { flag: "-vv", desc: "상세 출력" }
        ],
        examples: [
          { label: "PCI 목록", code: "lspci -nnk" },
          { label: "GPU 확인", code: "lspci | grep -i nvidia" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["추가 정보가 필요하면 root가 아닌 경우 일부가 빠질 수 있습니다."]
      }
    }
  },
  {
    id: "lsusb",
    category: "hardware",
    title: "lsusb",
    summary: "USB 장치와 컨트롤러를 확인합니다.",
    command: "lsusb",
    keywords: ["usb", "device", "controller", "hardware"],
    variants: {
      rocky: {
        options: [
          { flag: "-t", desc: "트리 형태 보기" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "USB 목록", code: "lsusb" },
          { label: "트리 보기", code: "lsusb -t" }
        ],
        diff: "USB 저장장치나 동글 인식 확인에 유용합니다.",
        warnings: ["일반 서버에서는 필요한 경우에만 쓰는 편입니다."]
      },
      ubuntu: {
        options: [
          { flag: "-t", desc: "트리 형태 보기" },
          { flag: "-v", desc: "상세 출력" }
        ],
        examples: [
          { label: "USB 목록", code: "lsusb" },
          { label: "트리 보기", code: "lsusb -t" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["일반 서버에서는 필요한 경우에만 쓰는 편입니다."]
      }
    }
  },
  {
    id: "dmidecode",
    category: "hardware",
    title: "dmidecode",
    summary: "BIOS, 메인보드, 메모리, 시스템 제조사 정보를 봅니다.",
    command: "dmidecode -t system",
    keywords: ["bios", "hardware", "memory", "board", "serial"],
    variants: {
      rocky: {
        options: [
          { flag: "-t system", desc: "시스템 정보" },
          { flag: "-t memory", desc: "메모리 슬롯 정보" },
          { flag: "-t processor", desc: "CPU 정보" },
          { flag: "-s", desc: "특정 필드만 출력" }
        ],
        examples: [
          { label: "시스템 정보", code: "dmidecode -t system" },
          { label: "메모리 정보", code: "dmidecode -t memory" }
        ],
        diff: "장비 식별과 랙/벤더 이슈 확인에 유용합니다.",
        warnings: ["대부분 root 권한이 필요합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-t system", desc: "시스템 정보" },
          { flag: "-t memory", desc: "메모리 슬롯 정보" },
          { flag: "-t processor", desc: "CPU 정보" },
          { flag: "-s", desc: "특정 필드만 출력" }
        ],
        examples: [
          { label: "시스템 정보", code: "dmidecode -t system" },
          { label: "메모리 정보", code: "dmidecode -t memory" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["대부분 root 권한이 필요합니다."]
      }
    }
  },
  {
    id: "ethtool",
    category: "hardware",
    title: "ethtool",
    summary: "NIC 링크, 속도, 오프로드, 드라이버 상태를 확인합니다.",
    command: "ethtool eth0",
    keywords: ["nic", "link", "speed", "duplex", "driver"],
    variants: {
      rocky: {
        options: [
          { flag: "eth0", desc: "인터페이스 링크 상태" },
          { flag: "-i", desc: "드라이버 정보" },
          { flag: "-S", desc: "통계 확인" },
          { flag: "-k", desc: "오프로드 기능 확인" }
        ],
        examples: [
          { label: "링크 상태", code: "ethtool eth0" },
          { label: "드라이버 정보", code: "ethtool -i eth0" }
        ],
        diff: "네트워크 속도 저하나 duplex mismatch 확인에 좋습니다.",
        warnings: ["링크 변경 옵션은 원격 접속에 영향을 줄 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "eth0", desc: "인터페이스 링크 상태" },
          { flag: "-i", desc: "드라이버 정보" },
          { flag: "-S", desc: "통계 확인" },
          { flag: "-k", desc: "오프로드 기능 확인" }
        ],
        examples: [
          { label: "링크 상태", code: "ethtool eth0" },
          { label: "드라이버 정보", code: "ethtool -i eth0" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["링크 변경 옵션은 원격 접속에 영향을 줄 수 있습니다."]
      }
    }
  },
  {
    id: "modinfo",
    category: "hardware",
    title: "modinfo",
    summary: "커널 모듈의 버전, 파라미터, 설명을 확인합니다.",
    command: "modinfo nvidia",
    keywords: ["module", "kernel", "driver", "param", "version"],
    variants: {
      rocky: {
        options: [
          { flag: "-F", desc: "특정 필드만 출력" },
          { flag: "-n", desc: "모듈 파일 경로만 출력" }
        ],
        examples: [
          { label: "모듈 정보", code: "modinfo nvidia" },
          { label: "파일 경로", code: "modinfo -n nvidia" }
        ],
        diff: "드라이버와 커널 모듈 문제를 볼 때 유용합니다.",
        warnings: ["모듈이 로드되지 않았다면 정보가 제한될 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-F", desc: "특정 필드만 출력" },
          { flag: "-n", desc: "모듈 파일 경로만 출력" }
        ],
        examples: [
          { label: "모듈 정보", code: "modinfo nvidia" },
          { label: "파일 경로", code: "modinfo -n nvidia" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["모듈이 로드되지 않았다면 정보가 제한될 수 있습니다."]
      }
    }
  },
  {
    id: "screen",
    category: "session",
    title: "screen",
    summary: "세션을 분리해서 원격 작업을 유지합니다.",
    command: "screen -S ops",
    keywords: ["terminal", "session", "detach", "resume"],
    variants: {
      rocky: {
        options: [
          { flag: "-S", desc: "세션 이름 지정" },
          { flag: "-ls", desc: "세션 목록" },
          { flag: "-r", desc: "재접속" },
          { flag: "Ctrl+a d", desc: "분리(detach)" }
        ],
        examples: [
          { label: "새 세션", code: "screen -S ops" },
          { label: "재접속", code: "screen -r ops" }
        ],
        diff: "tmux보다 오래된 도구지만 여전히 서버에서 많이 씁니다.",
        warnings: ["세션 분리/재접속 키 조합을 익혀두면 원격 작업에 편합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-S", desc: "세션 이름 지정" },
          { flag: "-ls", desc: "세션 목록" },
          { flag: "-r", desc: "재접속" },
          { flag: "Ctrl+a d", desc: "분리(detach)" }
        ],
        examples: [
          { label: "새 세션", code: "screen -S ops" },
          { label: "재접속", code: "screen -r ops" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["세션 분리/재접속 키 조합을 익혀두면 원격 작업에 편합니다."]
      }
    }
  },
  {
    id: "tmux",
    category: "session",
    title: "tmux",
    summary: "세션, 창, 패널을 나눠 원격 작업을 관리합니다.",
    command: "tmux new -s ops",
    keywords: ["terminal", "session", "split", "detach", "pane"],
    variants: {
      rocky: {
        options: [
          { flag: "new -s", desc: "새 세션 생성" },
          { flag: "ls", desc: "세션 목록" },
          { flag: "attach -t", desc: "세션 재접속" },
          { flag: "split-window", desc: "창 분할" }
        ],
        examples: [
          { label: "새 세션", code: "tmux new -s ops" },
          { label: "재접속", code: "tmux attach -t ops" }
        ],
        diff: "screen보다 더 세분화된 작업 분할에 좋습니다.",
        warnings: ["tmux 기본 키 바인딩을 한 번 익혀두면 생산성이 확 올라갑니다."]
      },
      ubuntu: {
        options: [
          { flag: "new -s", desc: "새 세션 생성" },
          { flag: "ls", desc: "세션 목록" },
          { flag: "attach -t", desc: "세션 재접속" },
          { flag: "split-window", desc: "창 분할" }
        ],
        examples: [
          { label: "새 세션", code: "tmux new -s ops" },
          { label: "재접속", code: "tmux attach -t ops" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["tmux 기본 키 바인딩을 한 번 익혀두면 생산성이 확 올라갑니다."]
      }
    }
  },
  {
    id: "loginctl",
    category: "session",
    title: "loginctl",
    summary: "systemd 로그인 세션과 사용자 상태를 확인합니다.",
    command: "loginctl list-sessions",
    keywords: ["session", "user", "seat", "logind"],
    variants: {
      rocky: {
        options: [
          { flag: "list-sessions", desc: "세션 목록" },
          { flag: "show-user", desc: "사용자 상세" },
          { flag: "terminate-session", desc: "세션 종료" },
          { flag: "enable-linger", desc: "로그아웃 후에도 사용자 서비스 유지" }
        ],
        examples: [
          { label: "세션 목록", code: "loginctl list-sessions" },
          { label: "사용자 상태", code: "loginctl show-user $USER" }
        ],
        diff: "원격 접속과 사용자 서비스 유지 문제를 볼 때 유용합니다.",
        warnings: ["세션 종료는 현재 접속에 직접 영향을 줄 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "list-sessions", desc: "세션 목록" },
          { flag: "show-user", desc: "사용자 상세" },
          { flag: "terminate-session", desc: "세션 종료" },
          { flag: "enable-linger", desc: "로그아웃 후에도 사용자 서비스 유지" }
        ],
        examples: [
          { label: "세션 목록", code: "loginctl list-sessions" },
          { label: "사용자 상태", code: "loginctl show-user $USER" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["세션 종료는 현재 접속에 직접 영향을 줄 수 있습니다."]
      }
    }
  },
  {
    id: "curl",
    category: "network",
    title: "curl",
    summary: "HTTP 요청과 API 응답, 헤더를 확인합니다.",
    command: "curl -fL https://example.com",
    keywords: ["http", "api", "request", "download", "header"],
    variants: {
      rocky: {
        options: [
          { flag: "-f", desc: "HTTP 오류 시 실패 처리" },
          { flag: "-L", desc: "리다이렉션 따라가기" },
          { flag: "-I", desc: "헤더만 확인" },
          { flag: "-sS", desc: "조용하지만 오류는 표시" },
          { flag: "-o", desc: "파일로 저장" }
        ],
        examples: [
          { label: "헤더 확인", code: "curl -I https://example.com" },
          { label: "다운로드", code: "curl -fL -o app.tar.gz https://example.com/app.tar.gz" }
        ],
        diff: "운영 점검에서 가장 자주 쓰는 HTTP 도구입니다.",
        warnings: ["인증 토큰이 들어간 요청은 기록과 공유를 조심하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-f", desc: "HTTP 오류 시 실패 처리" },
          { flag: "-L", desc: "리다이렉션 따라가기" },
          { flag: "-I", desc: "헤더만 확인" },
          { flag: "-sS", desc: "조용하지만 오류는 표시" },
          { flag: "-o", desc: "파일로 저장" }
        ],
        examples: [
          { label: "헤더 확인", code: "curl -I https://example.com" },
          { label: "다운로드", code: "curl -fL -o app.tar.gz https://example.com/app.tar.gz" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["인증 토큰이 들어간 요청은 기록과 공유를 조심하세요."]
      }
    }
  },
  {
    id: "wget",
    category: "network",
    title: "wget",
    summary: "HTTP/HTTPS 파일 다운로드와 재시도에 유용합니다.",
    command: "wget https://example.com/file.tar.gz",
    keywords: ["download", "http", "retry", "mirror"],
    variants: {
      rocky: {
        options: [
          { flag: "-O", desc: "출력 파일명 지정" },
          { flag: "-c", desc: "중단된 다운로드 이어받기" },
          { flag: "-q", desc: "조용한 출력" },
          { flag: "--spider", desc: "실제 다운로드 없이 존재 확인" }
        ],
        examples: [
          { label: "이어받기", code: "wget -c https://example.com/file.tar.gz" },
          { label: "존재만 확인", code: "wget --spider https://example.com/file.tar.gz" }
        ],
        diff: "파일 배포나 아티팩트 수집에 편합니다.",
        warnings: ["대형 파일은 재시도 옵션과 함께 쓰는 것이 좋습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-O", desc: "출력 파일명 지정" },
          { flag: "-c", desc: "중단된 다운로드 이어받기" },
          { flag: "-q", desc: "조용한 출력" },
          { flag: "--spider", desc: "실제 다운로드 없이 존재 확인" }
        ],
        examples: [
          { label: "이어받기", code: "wget -c https://example.com/file.tar.gz" },
          { label: "존재만 확인", code: "wget --spider https://example.com/file.tar.gz" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["대형 파일은 재시도 옵션과 함께 쓰는 것이 좋습니다."]
      }
    }
  },
  {
    id: "ss-advanced",
    category: "network-diagnostics",
    title: "ss advanced",
    summary: "소켓 요약, 연결 상태, 타임아웃, 네트워크 큐를 더 자세히 봅니다.",
    command: "ss -s && ss -tan state established",
    keywords: ["socket summary", "connections", "tcp", "udp", "state"],
    variants: {
      rocky: {
        options: [
          { flag: "-s", desc: "전체 소켓 요약" },
          { flag: "-tan", desc: "TCP 연결 숫자 형식" },
          { flag: "state established", desc: "활성 연결만 필터" },
          { flag: "-p", desc: "프로세스 표시" }
        ],
        examples: [
          { label: "소켓 요약", code: "ss -s" },
          { label: "현재 연결", code: "ss -tan state established" }
        ],
        diff: "포트 오픈이 아니라 연결량 자체를 볼 때 좋습니다.",
        warnings: ["고부하 서버에서는 출력이 길어질 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-s", desc: "전체 소켓 요약" },
          { flag: "-tan", desc: "TCP 연결 숫자 형식" },
          { flag: "state established", desc: "활성 연결만 필터" },
          { flag: "-p", desc: "프로세스 표시" }
        ],
        examples: [
          { label: "소켓 요약", code: "ss -s" },
          { label: "현재 연결", code: "ss -tan state established" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["고부하 서버에서는 출력이 길어질 수 있습니다."]
      }
    }
  },
  {
    id: "systemctl-cat",
    category: "systemd",
    title: "systemctl cat",
    summary: "서비스 유닛 파일과 오버라이드를 함께 봅니다.",
    command: "systemctl cat nginx",
    keywords: ["unit", "override", "service file", "systemd"],
    variants: {
      rocky: {
        options: [
          { flag: "cat", desc: "유닛 파일 내용 출력" },
          { flag: "--no-pager", desc: "페이지 없이 출력" }
        ],
        examples: [
          { label: "유닛 보기", code: "systemctl cat nginx" },
          { label: "페이지 없이", code: "systemctl cat nginx --no-pager" }
        ],
        diff: "서비스가 어디서 설정되는지 확인할 때 좋습니다.",
        warnings: ["drop-in override가 있는지 함께 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "cat", desc: "유닛 파일 내용 출력" },
          { flag: "--no-pager", desc: "페이지 없이 출력" }
        ],
        examples: [
          { label: "유닛 보기", code: "systemctl cat nginx" },
          { label: "페이지 없이", code: "systemctl cat nginx --no-pager" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["drop-in override가 있는지 함께 확인하세요."]
      }
    }
  },
  {
    id: "systemctl-list-dependencies",
    category: "systemd",
    title: "systemctl list-dependencies",
    summary: "서비스가 의존하는 유닛 관계를 확인합니다.",
    command: "systemctl list-dependencies nginx",
    keywords: ["dependency", "tree", "unit", "systemd"],
    variants: {
      rocky: {
        options: [
          { flag: "--reverse", desc: "역방향 의존성" },
          { flag: "--before", desc: "시작 전에 필요한 유닛" },
          { flag: "--after", desc: "시작 후 필요한 유닛" }
        ],
        examples: [
          { label: "의존성 확인", code: "systemctl list-dependencies nginx" },
          { label: "역방향", code: "systemctl list-dependencies --reverse nginx" }
        ],
        diff: "서비스 시작 순서 문제를 볼 때 좋습니다.",
        warnings: ["의존성 트리가 길 수 있으니 필요한 서비스만 대상으로 보세요."]
      },
      ubuntu: {
        options: [
          { flag: "--reverse", desc: "역방향 의존성" },
          { flag: "--before", desc: "시작 전에 필요한 유닛" },
          { flag: "--after", desc: "시작 후 필요한 유닛" }
        ],
        examples: [
          { label: "의존성 확인", code: "systemctl list-dependencies nginx" },
          { label: "역방향", code: "systemctl list-dependencies --reverse nginx" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["의존성 트리가 길 수 있으니 필요한 서비스만 대상으로 보세요."]
      }
    }
  },
  {
    id: "systemd-analyze-blame",
    category: "systemd",
    title: "systemd-analyze blame",
    summary: "부팅 시 오래 걸린 유닛을 확인합니다.",
    command: "systemd-analyze blame",
    keywords: ["boot", "startup", "delay", "slow", "unit"],
    variants: {
      rocky: {
        options: [
          { flag: "blame", desc: "부팅 지연 유닛 목록" },
          { flag: "time", desc: "전체 부팅 시간" },
          { flag: "critical-chain", desc: "핵심 체인 확인" }
        ],
        examples: [
          { label: "지연 확인", code: "systemd-analyze blame" },
          { label: "부팅 시간", code: "systemd-analyze time" }
        ],
        diff: "부팅이 느릴 때 가장 먼저 보는 진단 도구입니다.",
        warnings: ["서비스가 늦는 원인이 곧바로 원인 서비스라는 뜻은 아닙니다."]
      },
      ubuntu: {
        options: [
          { flag: "blame", desc: "부팅 지연 유닛 목록" },
          { flag: "time", desc: "전체 부팅 시간" },
          { flag: "critical-chain", desc: "핵심 체인 확인" }
        ],
        examples: [
          { label: "지연 확인", code: "systemd-analyze blame" },
          { label: "부팅 시간", code: "systemd-analyze time" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["서비스가 늦는 원인이 곧바로 원인 서비스라는 뜻은 아닙니다."]
      }
    }
  },
  {
    id: "systemd-analyze-critical-chain",
    category: "systemd",
    title: "systemd-analyze critical-chain",
    summary: "부팅 시 어떤 유닛이 순서를 막았는지 확인합니다.",
    command: "systemd-analyze critical-chain",
    keywords: ["boot", "chain", "dependency", "delay", "startup"],
    variants: {
      rocky: {
        options: [
          { flag: "critical-chain", desc: "핵심 의존성 체인" },
          { flag: "time", desc: "전체 부팅 시간" }
        ],
        examples: [
          { label: "핵심 체인", code: "systemd-analyze critical-chain" },
          { label: "특정 서비스", code: "systemd-analyze critical-chain nginx" }
        ],
        diff: "부팅 경로 병목을 볼 때 더 해석하기 쉽습니다.",
        warnings: ["시간이 오래 걸린다고 항상 문제인 것은 아닙니다."]
      },
      ubuntu: {
        options: [
          { flag: "critical-chain", desc: "핵심 의존성 체인" },
          { flag: "time", desc: "전체 부팅 시간" }
        ],
        examples: [
          { label: "핵심 체인", code: "systemd-analyze critical-chain" },
          { label: "특정 서비스", code: "systemd-analyze critical-chain nginx" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["시간이 오래 걸린다고 항상 문제인 것은 아닙니다."]
      }
    }
  },
  {
    id: "journalctl-advanced",
    category: "logs",
    title: "journalctl advanced",
    summary: "에러 필터, 부팅 범위, 디스크 사용량, 로그 정리를 다룹니다.",
    command: "journalctl -b -p err && journalctl --disk-usage",
    keywords: ["boot log", "priority", "vacuum", "disk usage", "journal"],
    variants: {
      rocky: {
        options: [
          { flag: "-b", desc: "부팅 이후 로그" },
          { flag: "-p err", desc: "에러 우선순위만 보기" },
          { flag: "--disk-usage", desc: "저장소 사용량 확인" },
          { flag: "--vacuum-time", desc: "오래된 로그 삭제" }
        ],
        examples: [
          { label: "에러만 보기", code: "journalctl -b -p err" },
          { label: "디스크 사용량", code: "journalctl --disk-usage" }
        ],
        diff: "디스크 부족이나 부팅 직후 문제 추적에 매우 유용합니다.",
        warnings: ["vacuum은 로그를 지우므로 보존 정책을 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-b", desc: "부팅 이후 로그" },
          { flag: "-p err", desc: "에러 우선순위만 보기" },
          { flag: "--disk-usage", desc: "저장소 사용량 확인" },
          { flag: "--vacuum-time", desc: "오래된 로그 삭제" }
        ],
        examples: [
          { label: "에러만 보기", code: "journalctl -b -p err" },
          { label: "디스크 사용량", code: "journalctl --disk-usage" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["vacuum은 로그를 지우므로 보존 정책을 확인하세요."]
      }
    }
  },
  {
    id: "auditctl",
    category: "audit",
    title: "auditctl",
    summary: "Linux audit 규칙을 조회하고 임시로 추가합니다.",
    command: "auditctl -l",
    keywords: ["audit", "rule", "security", "selinux", "logging"],
    variants: {
      rocky: {
        options: [
          { flag: "-l", desc: "현재 규칙 목록" },
          { flag: "-w", desc: "파일 감시" },
          { flag: "-a", desc: "규칙 추가" },
          { flag: "-D", desc: "모든 규칙 삭제" }
        ],
        examples: [
          { label: "규칙 목록", code: "auditctl -l" },
          { label: "파일 감시", code: "auditctl -w /etc/passwd -p wa -k passwdwatch" }
        ],
        diff: "SELinux deny 원인 추적과 함께 쓰기 좋습니다.",
        warnings: ["규칙 변경은 운영 로그에 영향을 줄 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-l", desc: "현재 규칙 목록" },
          { flag: "-w", desc: "파일 감시" },
          { flag: "-a", desc: "규칙 추가" },
          { flag: "-D", desc: "모든 규칙 삭제" }
        ],
        examples: [
          { label: "규칙 목록", code: "auditctl -l" },
          { label: "파일 감시", code: "auditctl -w /etc/passwd -p wa -k passwdwatch" }
        ],
        diff: "Ubuntu에서도 auditd를 쓸 때 동일합니다.",
        warnings: ["규칙 변경은 운영 로그에 영향을 줄 수 있습니다."]
      }
    }
  },
  {
    id: "ausearch",
    category: "audit",
    title: "ausearch",
    summary: "audit 로그에서 키워드와 이벤트를 검색합니다.",
    command: "ausearch -k passwdwatch",
    keywords: ["audit", "search", "selinux", "denial", "events"],
    variants: {
      rocky: {
        options: [
          { flag: "-k", desc: "키워드로 검색" },
          { flag: "-m", desc: "메시지 타입 필터" },
          { flag: "-ts", desc: "시간 범위 시작" },
          { flag: "-te", desc: "시간 범위 종료" }
        ],
        examples: [
          { label: "키워드 검색", code: "ausearch -k passwdwatch" },
          { label: "최근 SELinux 이벤트", code: "ausearch -m avc -ts today" }
        ],
        diff: "SELinux 거부 탐색의 핵심 도구입니다.",
        warnings: ["audit 로그가 꺼져 있으면 결과가 제한됩니다."]
      },
      ubuntu: {
        options: [
          { flag: "-k", desc: "키워드로 검색" },
          { flag: "-m", desc: "메시지 타입 필터" },
          { flag: "-ts", desc: "시간 범위 시작" },
          { flag: "-te", desc: "시간 범위 종료" }
        ],
        examples: [
          { label: "키워드 검색", code: "ausearch -k passwdwatch" },
          { label: "최근 SELinux 이벤트", code: "ausearch -m avc -ts today" }
        ],
        diff: "Ubuntu에서도 auditd 사용 시 동일합니다.",
        warnings: ["audit 로그가 꺼져 있으면 결과가 제한됩니다."]
      }
    }
  },
  {
    id: "aureport",
    category: "audit",
    title: "aureport",
    summary: "audit 이벤트를 요약 리포트로 봅니다.",
    command: "aureport -au",
    keywords: ["audit", "report", "summary", "security"],
    variants: {
      rocky: {
        options: [
          { flag: "-au", desc: "인증 관련 보고서" },
          { flag: "-f", desc: "파일 이벤트" },
          { flag: "-x", desc: "실행 이벤트" },
          { flag: "-l", desc: "로그인 이벤트" }
        ],
        examples: [
          { label: "인증 요약", code: "aureport -au" },
          { label: "실행 요약", code: "aureport -x" }
        ],
        diff: "감사 로그를 사람이 읽기 쉽게 정리할 때 좋습니다.",
        warnings: ["원본 이벤트는 ausearch로 다시 확인하는 편이 좋습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-au", desc: "인증 관련 보고서" },
          { flag: "-f", desc: "파일 이벤트" },
          { flag: "-x", desc: "실행 이벤트" },
          { flag: "-l", desc: "로그인 이벤트" }
        ],
        examples: [
          { label: "인증 요약", code: "aureport -au" },
          { label: "실행 요약", code: "aureport -x" }
        ],
        diff: "Ubuntu에서도 auditd 사용 시 동일합니다.",
        warnings: ["원본 이벤트는 ausearch로 다시 확인하는 편이 좋습니다."]
      }
    }
  },
  {
    id: "audit2allow",
    category: "audit",
    title: "audit2allow",
    summary: "SELinux 거부 로그로 정책 허용안을 생성합니다.",
    command: "audit2allow -a",
    keywords: ["selinux", "policy", "allow", "denial", "module"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "전체 AVC 메시지 사용" },
          { flag: "-M", desc: "모듈 생성" },
          { flag: "-w", desc: "왜 거부됐는지 설명" },
          { flag: "-i", desc: "입력 파일 지정" }
        ],
        examples: [
          { label: "허용안 보기", code: "audit2allow -a" },
          { label: "모듈 생성", code: "audit2allow -M mypolicy -i avc.log" }
        ],
        diff: "SELinux 문제를 우회가 아니라 정책으로 해결할 때 쓰입니다.",
        warnings: ["생성된 정책을 무조건 적용하지 말고 의미를 검토하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "전체 AVC 메시지 사용" },
          { flag: "-M", desc: "모듈 생성" },
          { flag: "-w", desc: "왜 거부됐는지 설명" },
          { flag: "-i", desc: "입력 파일 지정" }
        ],
        examples: [
          { label: "허용안 보기", code: "audit2allow -a" },
          { label: "모듈 생성", code: "audit2allow -M mypolicy -i avc.log" }
        ],
        diff: "Ubuntu의 SELinux 활성 환경에서 동일합니다.",
        warnings: ["생성된 정책을 무조건 적용하지 말고 의미를 검토하세요."]
      }
    }
  },
  {
    id: "sealert",
    category: "audit",
    title: "sealert",
    summary: "SELinux 경고를 사람이 읽기 쉬운 형태로 풉니다.",
    command: "sealert -a /var/log/audit/audit.log",
    keywords: ["selinux", "alert", "denial", "analysis"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "audit 로그 분석" },
          { flag: "-l", desc: "로컬 리포트 목록" },
          { flag: "-P", desc: "플러그인 사용" }
        ],
        examples: [
          { label: "로그 분석", code: "sealert -a /var/log/audit/audit.log" },
          { label: "로컬 리포트", code: "sealert -l" }
        ],
        diff: "SELinux 문제 설명을 사람이 읽기 쉽게 바꿔줍니다.",
        warnings: ["플러그인 출력만 믿지 말고 원본 AVC도 같이 보세요."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "audit 로그 분석" },
          { flag: "-l", desc: "로컬 리포트 목록" },
          { flag: "-P", desc: "플러그인 사용" }
        ],
        examples: [
          { label: "로그 분석", code: "sealert -a /var/log/audit/audit.log" },
          { label: "로컬 리포트", code: "sealert -l" }
        ],
        diff: "Ubuntu에서 SELinux를 활성화한 환경이라면 동일합니다.",
        warnings: ["플러그인 출력만 믿지 말고 원본 AVC도 같이 보세요."]
      }
    }
  },
  {
    id: "setsebool",
    category: "security",
    title: "setsebool",
    summary: "SELinux boolean 값을 조정합니다.",
    command: "setsebool -P httpd_can_network_connect on",
    keywords: ["selinux", "boolean", "policy", "network"],
    variants: {
      rocky: {
        options: [
          { flag: "-P", desc: "재부팅 후에도 유지" },
          { flag: "on/off", desc: "값 설정" },
          { flag: "-l", desc: "boolean 목록" }
        ],
        examples: [
          { label: "네트워크 허용", code: "setsebool -P httpd_can_network_connect on" },
          { label: "목록 확인", code: "getsebool -a | grep httpd" }
        ],
        diff: "서비스가 외부 통신을 해야 할 때 매우 자주 사용합니다.",
        warnings: ["boolean 변경은 보안 정책을 완화할 수 있으니 이유를 남겨두세요."]
      },
      ubuntu: {
        options: [
          { flag: "-P", desc: "재부팅 후에도 유지" },
          { flag: "on/off", desc: "값 설정" },
          { flag: "-l", desc: "boolean 목록" }
        ],
        examples: [
          { label: "네트워크 허용", code: "setsebool -P httpd_can_network_connect on" },
          { label: "목록 확인", code: "getsebool -a | grep httpd" }
        ],
        diff: "Ubuntu에서 SELinux를 사용하는 경우 동일합니다.",
        warnings: ["boolean 변경은 보안 정책을 완화할 수 있으니 이유를 남겨두세요."]
      }
    }
  },
  {
    id: "userdel",
    category: "users",
    title: "userdel",
    summary: "사용자 계정을 삭제합니다.",
    command: "userdel -r user",
    keywords: ["delete user", "account", "remove home"],
    variants: {
      rocky: {
        options: [
          { flag: "-r", desc: "홈 디렉토리와 메일 스풀 삭제" },
          { flag: "-f", desc: "강제 삭제" },
          { flag: "-Z", desc: "SELinux 사용자 매핑 관련" }
        ],
        examples: [
          { label: "계정 삭제", code: "userdel user" },
          { label: "홈 포함 삭제", code: "userdel -r user" }
        ],
        diff: "운영 계정 삭제 전 파일 소유권을 먼저 정리하세요.",
        warnings: ["삭제 전 해당 계정의 프로세스와 크론이 없는지 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-r", desc: "홈 디렉토리와 메일 스풀 삭제" },
          { flag: "-f", desc: "강제 삭제" },
          { flag: "-Z", desc: "SELinux 사용자 매핑 관련" }
        ],
        examples: [
          { label: "계정 삭제", code: "userdel user" },
          { label: "홈 포함 삭제", code: "userdel -r user" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["삭제 전 해당 계정의 프로세스와 크론이 없는지 확인하세요."]
      }
    }
  },
  {
    id: "groupdel",
    category: "users",
    title: "groupdel",
    summary: "그룹을 삭제합니다.",
    command: "groupdel groupname",
    keywords: ["delete group", "account", "permission"],
    variants: {
      rocky: {
        options: [
          { flag: "groupdel name", desc: "지정 그룹 삭제" }
        ],
        examples: [
          { label: "그룹 삭제", code: "groupdel oldgroup" }
        ],
        diff: "그룹에 소속된 사용자가 없는지 먼저 확인하세요.",
        warnings: ["파일 소유 그룹이면 정리 후 삭제해야 합니다."]
      },
      ubuntu: {
        options: [
          { flag: "groupdel name", desc: "지정 그룹 삭제" }
        ],
        examples: [
          { label: "그룹 삭제", code: "groupdel oldgroup" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["파일 소유 그룹이면 정리 후 삭제해야 합니다."]
      }
    }
  },
  {
    id: "chage",
    category: "users",
    title: "chage",
    summary: "계정 비밀번호 만료 정책을 관리합니다.",
    command: "chage -l user",
    keywords: ["password aging", "expiry", "account policy"],
    variants: {
      rocky: {
        options: [
          { flag: "-l", desc: "만료 정책 조회" },
          { flag: "-M", desc: "최대 사용 일수" },
          { flag: "-m", desc: "최소 사용 일수" },
          { flag: "-W", desc: "만료 경고 일수" }
        ],
        examples: [
          { label: "정책 확인", code: "chage -l user" },
          { label: "만료 설정", code: "chage -M 90 user" }
        ],
        diff: "계정 보안 정책을 운영할 때 중요합니다.",
        warnings: ["운영 계정에 바로 적용하기 전에 만료 정책을 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-l", desc: "만료 정책 조회" },
          { flag: "-M", desc: "최대 사용 일수" },
          { flag: "-m", desc: "최소 사용 일수" },
          { flag: "-W", desc: "만료 경고 일수" }
        ],
        examples: [
          { label: "정책 확인", code: "chage -l user" },
          { label: "만료 설정", code: "chage -M 90 user" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["운영 계정에 바로 적용하기 전에 만료 정책을 확인하세요."]
      }
    }
  },
  {
    id: "ssh-agent",
    category: "remote",
    title: "ssh-agent",
    summary: "SSH 키 에이전트를 시작하고 키 관리를 돕습니다.",
    command: "ssh-agent bash",
    keywords: ["ssh", "key", "agent", "session"],
    variants: {
      rocky: {
        options: [
          { flag: "-a", desc: "소켓 경로 지정" },
          { flag: "-s", desc: "셸 호환 출력" },
          { flag: "-k", desc: "에이전트 종료용 환경변수 출력" }
        ],
        examples: [
          { label: "에이전트 시작", code: "ssh-agent bash" },
          { label: "세션 상태", code: "ssh-agent -s" }
        ],
        diff: "SSH 키를 여러 번 입력하지 않도록 도와줍니다.",
        warnings: ["에이전트를 켜둔 터미널은 잠그는 습관이 좋습니다."]
      },
      ubuntu: {
        options: [
          { flag: "-a", desc: "소켓 경로 지정" },
          { flag: "-s", desc: "셸 호환 출력" },
          { flag: "-k", desc: "에이전트 종료용 환경변수 출력" }
        ],
        examples: [
          { label: "에이전트 시작", code: "ssh-agent bash" },
          { label: "세션 상태", code: "ssh-agent -s" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["에이전트를 켜둔 터미널은 잠그는 습관이 좋습니다."]
      }
    }
  },
  {
    id: "ssh-add",
    category: "remote",
    title: "ssh-add",
    summary: "SSH 에이전트에 개인키를 등록합니다.",
    command: "ssh-add ~/.ssh/id_ed25519",
    keywords: ["ssh", "key", "agent", "add"],
    variants: {
      rocky: {
        options: [
          { flag: "-l", desc: "등록된 키 목록" },
          { flag: "-D", desc: "모든 키 삭제" },
          { flag: "-t", desc: "키 유효 시간 지정" }
        ],
        examples: [
          { label: "키 등록", code: "ssh-add ~/.ssh/id_ed25519" },
          { label: "등록 키 확인", code: "ssh-add -l" }
        ],
        diff: "에이전트에 올려둔 키를 재사용할 때 편합니다.",
        warnings: ["에이전트에 등록된 키가 예상과 다를 수 있으니 목록을 확인하세요."]
      },
      ubuntu: {
        options: [
          { flag: "-l", desc: "등록된 키 목록" },
          { flag: "-D", desc: "모든 키 삭제" },
          { flag: "-t", desc: "키 유효 시간 지정" }
        ],
        examples: [
          { label: "키 등록", code: "ssh-add ~/.ssh/id_ed25519" },
          { label: "등록 키 확인", code: "ssh-add -l" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["에이전트에 등록된 키가 예상과 다를 수 있으니 목록을 확인하세요."]
      }
    }
  },
  {
    id: "ssh-keyscan",
    category: "remote",
    title: "ssh-keyscan",
    summary: "원격 호스트의 공개 호스트 키를 수집합니다.",
    command: "ssh-keyscan host",
    keywords: ["ssh", "known_hosts", "host key", "scan"],
    variants: {
      rocky: {
        options: [
          { flag: "-p", desc: "포트 지정" },
          { flag: "-H", desc: "해시된 형식으로 출력" },
          { flag: "-t", desc: "키 타입 지정" }
        ],
        examples: [
          { label: "호스트 키 수집", code: "ssh-keyscan host >> ~/.ssh/known_hosts" },
          { label: "포트 지정", code: "ssh-keyscan -p 2222 host" }
        ],
        diff: "known_hosts를 미리 채울 때 유용합니다.",
        warnings: ["출력은 검증되지 않으므로 신뢰할 수 있는 채널로 비교해야 합니다."]
      },
      ubuntu: {
        options: [
          { flag: "-p", desc: "포트 지정" },
          { flag: "-H", desc: "해시된 형식으로 출력" },
          { flag: "-t", desc: "키 타입 지정" }
        ],
        examples: [
          { label: "호스트 키 수집", code: "ssh-keyscan host >> ~/.ssh/known_hosts" },
          { label: "포트 지정", code: "ssh-keyscan -p 2222 host" }
        ],
        diff: "Ubuntu에서도 동일합니다.",
        warnings: ["출력은 검증되지 않으므로 신뢰할 수 있는 채널로 비교해야 합니다."]
      }
    }
  }
];

function normalizeText(value) {
  return String(value).toLowerCase();
}

function getCommandTopic(command) {
  return topicByCommandId[command.id] || command.category;
}

function getCommandDisplay(command, distro) {
  const override = displayOverrides[command.id]?.[distro];
  return {
    title: override?.title || command.title,
    command: override?.command || command.command
  };
}

function getVisibleCommands() {
  const term = normalizeText(state.search).trim();
  const matched = COMMANDS.filter((command) => {
    const categoryMatch = state.category === "all" || getCommandTopic(command) === state.category;
    const variant = command.variants[state.distro];
    const display = getCommandDisplay(command, state.distro);
    const haystack = [
      display.title,
      command.summary,
      display.command,
      command.category,
      getCommandTopic(command),
      ...(command.keywords || []),
      variant.diff,
      ...(variant.options || []).map((item) => `${item.flag} ${item.desc}`),
      ...(variant.examples || []).map((item) => `${item.label} ${item.code}`),
      ...(variant.warnings || [])
    ]
      .join(" ")
      .toLowerCase();

    const searchMatch = !term || haystack.includes(term);
    return categoryMatch && searchMatch;
  });

  return matched;
}

function groupVisibleCommands(commands) {
  const groups = new Map();
  commands.forEach((command) => {
    const topic = getCommandTopic(command);
    if (!groups.has(topic)) {
      groups.set(topic, []);
    }
    groups.get(topic).push(command);
  });
  return groups;
}

function renderCategories() {
  categoryRow.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `category-pill ${state.category === category.id ? "is-active" : ""}`;
    button.type = "button";
    button.textContent = category.label;
    button.addEventListener("click", () => {
      state.category = category.id;
      renderAll();
    });
    categoryRow.append(button);
  });
}

function renderScenarios() {
  scenarioGrid.innerHTML = "";
  scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.className = "scenario-card";
    button.type = "button";
    button.innerHTML = `<strong>${scenario.label}</strong><span>${scenario.note}</span>`;
    button.addEventListener("click", () => {
      searchInput.value = scenario.search;
      state.search = scenario.search;
      renderAll();
      searchInput.focus();
    });
    scenarioGrid.append(button);
  });
}

function renderCommands() {
  const visible = getVisibleCommands();
  commandSections.innerHTML = "";
  resultCount.textContent = `${visible.length}개`;
  listTitle.textContent = state.distro === "rocky" ? "Rocky Linux 전용 보기" : "Ubuntu 전용 보기";

  if (!visible.length) {
    commandSections.innerHTML = `
      <div class="card command-card" style="grid-column: 1 / -1;">
        <h3>검색 결과가 없습니다</h3>
        <p class="summary">다른 표현으로 검색해 보거나 필터를 초기화해 보세요.</p>
      </div>
    `;
    return;
  }

  const grouped = groupVisibleCommands(visible);

  categories.forEach((category) => {
    const items = grouped.get(category.id);
    if (!items?.length) {
      return;
    }

    const section = document.createElement("section");
    section.className = "command-section card";

    const sectionHead = document.createElement("div");
    sectionHead.className = "command-section-head";
    sectionHead.innerHTML = `
      <div class="section-title">
        <h3>${category.label}</h3>
        <span class="section-meta">${items.length}개 명령어</span>
      </div>
      <span class="result-count">${items.length}개</span>
    `;
    section.append(sectionHead);

    const grid = document.createElement("div");
    grid.className = "command-section-grid";

    items.forEach((command) => {
      const variant = command.variants[state.distro];
      const display = getCommandDisplay(command, state.distro);
      const node = commandTemplate.content.cloneNode(true);
      const card = node.querySelector(".command-card");
      const categoryLabel = categories.find((item) => item.id === getCommandTopic(command))?.label || command.category;
      node.querySelector(".pill-category").textContent = categoryLabel;
      node.querySelector(".pill-distro").textContent = state.distro === "rocky" ? "Rocky Linux only" : "Ubuntu only";
      node.querySelector("h3").textContent = display.title;
      node.querySelector(".summary").textContent = command.summary;
      node.querySelector(".command-line code").textContent = display.command;

      const optionList = node.querySelector(".option-list");
      variant.options.forEach((option) => {
        const item = document.createElement("div");
        item.className = "option-item";
        item.innerHTML = `<strong>${option.flag}</strong><span>${option.desc}</span>`;
        optionList.append(item);
      });

      const exampleList = node.querySelector(".example-list");
      variant.examples.forEach((example) => {
        const item = document.createElement("div");
        item.className = "example-item";
        item.innerHTML = `<strong>${example.label}</strong><code>${example.code}</code>`;
        exampleList.append(item);
      });

      const diffRow = node.querySelector(".diff-row");
      const diffItem = document.createElement("div");
      diffItem.className = "diff-item";
      diffItem.textContent = variant.diff;
      diffRow.append(diffItem);

      const warningList = node.querySelector(".warning-list");
      variant.warnings.forEach((warning) => {
        const li = document.createElement("li");
        li.textContent = warning;
        warningList.append(li);
      });

      const copyButton = node.querySelector(".copy-button");
      copyButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(display.command);
        copyButton.textContent = "Copied";
        window.setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1200);
      });

      grid.append(node);
    });

    section.append(grid);
    commandSections.append(section);
  });
}

function renderTabs() {
  tabs.forEach((tab) => {
    const active = tab.dataset.distro === state.distro;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function renderAll() {
  renderTabs();
  renderCategories();
  renderCommands();
}

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderCommands();
});

clearFilters.addEventListener("click", () => {
  state.search = "";
  state.category = "all";
  searchInput.value = "";
  renderAll();
  searchInput.focus();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.distro = tab.dataset.distro;
    renderAll();
  });
});

document.querySelectorAll("[data-scenario]").forEach((button) => {
  button.addEventListener("click", () => {
    const scenario = scenarios.find((item) => item.id === button.dataset.scenario);
    if (!scenario) return;
    searchInput.value = scenario.search;
    state.search = scenario.search;
    renderCommands();
    searchInput.focus();
  });
});

renderScenarios();
renderAll();
