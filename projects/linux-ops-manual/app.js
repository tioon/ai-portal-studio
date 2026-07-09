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
  { id: "system", label: "시스템" },
  { id: "filesystem", label: "파일/디렉토리" },
  { id: "permissions", label: "권한" },
  { id: "process", label: "프로세스" },
  { id: "logs", label: "로그" },
  { id: "services", label: "서비스" },
  { id: "network", label: "네트워크" },
  { id: "packages", label: "패키지" },
  { id: "backup", label: "압축/백업" },
  { id: "text", label: "텍스트 처리" },
  { id: "storage", label: "디스크/마운트" },
  { id: "users", label: "사용자/접근" },
  { id: "remote", label: "SSH/원격" },
  { id: "containers", label: "컨테이너" },
  { id: "gpu", label: "GPU/하드웨어" },
  { id: "security", label: "보안" },
  { id: "troubleshoot", label: "트러블슈팅" }
];

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
    summary: "실시간 CPU, 메모리, 프로세스 점검의 기본 조합입니다.",
    command: "top && htop",
    keywords: ["cpu", "memory", "process", "live", "interactive"],
    variants: {
      rocky: {
        options: [
          { flag: "top -o %MEM", desc: "메모리 순 정렬" },
          { flag: "top -o %CPU", desc: "CPU 순 정렬" },
          { flag: "htop F5", desc: "트리 보기" },
          { flag: "htop F9", desc: "프로세스 종료" }
        ],
        examples: [
          { label: "메모리 높은 프로세스", code: "top -o %MEM" },
          { label: "트리 형태 보기", code: "htop" }
        ],
        diff: "Rocky는 htop이 기본 설치가 아닐 수 있습니다.",
        warnings: ["배치형 점검은 `ps`와 함께 보는 편이 더 정확할 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "top -o %MEM", desc: "메모리 순 정렬" },
          { flag: "top -o %CPU", desc: "CPU 순 정렬" },
          { flag: "htop F5", desc: "트리 보기" },
          { flag: "htop F9", desc: "프로세스 종료" }
        ],
        examples: [
          { label: "메모리 높은 프로세스", code: "top -o %MEM" },
          { label: "트리 형태 보기", code: "htop" }
        ],
        diff: "Ubuntu는 htop 설치가 비교적 간단합니다.",
        warnings: ["배치형 점검은 `ps`와 함께 보는 편이 더 정확할 수 있습니다."]
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
    id: "filesystem-tools",
    category: "filesystem",
    title: "tree / locate / file / stat",
    summary: "디렉토리 구조와 파일 메타정보를 빠르게 확인합니다.",
    command: "tree -L 2 && locate nginx.conf && file item && stat item",
    keywords: ["tree", "locate", "file type", "metadata", "inode"],
    variants: {
      rocky: {
        options: [
          { flag: "tree -L 2", desc: "구조 확인" },
          { flag: "locate", desc: "인덱스 기반 빠른 검색" },
          { flag: "file", desc: "파일 타입 확인" },
          { flag: "stat", desc: "메타데이터 확인" }
        ],
        examples: [
          { label: "웹 디렉토리 구조", code: "tree -L 2 /var/www" },
          { label: "파일 타입/메타", code: "file /usr/bin/ssh && stat /usr/bin/ssh" }
        ],
        diff: "locate는 updatedb 이후 결과가 더 정확합니다.",
        warnings: ["큰 디렉토리는 tree가 느릴 수 있습니다."]
      },
      ubuntu: {
        options: [
          { flag: "tree -L 2", desc: "구조 확인" },
          { flag: "locate", desc: "인덱스 기반 빠른 검색" },
          { flag: "file", desc: "파일 타입 확인" },
          { flag: "stat", desc: "메타데이터 확인" }
        ],
        examples: [
          { label: "웹 디렉토리 구조", code: "tree -L 2 /var/www" },
          { label: "파일 타입/메타", code: "file /usr/bin/ssh && stat /usr/bin/ssh" }
        ],
        diff: "locate는 updatedb 이후 결과가 더 정확합니다.",
        warnings: ["큰 디렉토리는 tree가 느릴 수 있습니다."]
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
  }
];

function normalizeText(value) {
  return String(value).toLowerCase();
}

function getVisibleCommands() {
  const term = normalizeText(state.search).trim();
  return COMMANDS.filter((command) => {
    const categoryMatch = state.category === "all" || command.category === state.category;
    const variant = command.variants[state.distro];
    const haystack = [
      command.title,
      command.summary,
      command.command,
      command.category,
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
}

function groupVisibleCommands(commands) {
  const groups = new Map();
  commands.forEach((command) => {
    if (!groups.has(command.category)) {
      groups.set(command.category, []);
    }
    groups.get(command.category).push(command);
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
  listTitle.textContent = state.distro === "rocky" ? "Rocky Linux용 명령어" : "Ubuntu용 명령어";

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
      const node = commandTemplate.content.cloneNode(true);
      const card = node.querySelector(".command-card");
      const categoryLabel = categories.find((item) => item.id === command.category)?.label || command.category;
      node.querySelector(".pill-category").textContent = categoryLabel;
      node.querySelector(".pill-distro").textContent = state.distro === "rocky" ? "Rocky Linux" : "Ubuntu";
      node.querySelector("h3").textContent = command.title;
      node.querySelector(".summary").textContent = command.summary;
      node.querySelector(".command-line code").textContent = command.command;

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
        await navigator.clipboard.writeText(command.command);
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
