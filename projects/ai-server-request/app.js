const workloadSelect = document.querySelector("#workload");
const gpuTierSelect = document.querySelector("#gpuTier");
const gpuPlatformSelect = document.querySelector("#gpuPlatform");
const gpuCountInput = document.querySelector("#gpuCount");
const siteTypeSelect = document.querySelector("#siteType");
const serverSelect = document.querySelector("#serverSelect");
const extraServerSelect = document.querySelector("#extraServerSelect");

const cpuValue = document.querySelector("#cpuValue");
const memoryValue = document.querySelector("#memoryValue");
const storageValue = document.querySelector("#storageValue");
const networkValue = document.querySelector("#networkValue");
const powerValue = document.querySelector("#powerValue");
const psuValue = document.querySelector("#psuValue");
const supportValue = document.querySelector("#supportValue");
const requestTemplate = document.querySelector("#requestTemplate");
const livePreview = document.querySelector("#livePreview");
const gpuCountLabel = document.querySelector("#gpuCountLabel");
const vendorGrid = document.querySelector("#vendorGrid");
const selectedServerPanel = document.querySelector("#selectedServerPanel");
const copyButton = document.querySelector("#copyButton");
const gpuPowerValue = document.querySelector("#gpuPowerValue");
const gpuConnectorValue = document.querySelector("#gpuConnectorValue");
const gpuExactnessValue = document.querySelector("#gpuExactnessValue");
const gpuRequiredPartsValue = document.querySelector("#gpuRequiredPartsValue");
const clearExtraServersButton = document.querySelector("#clearExtraServers");
const STORAGE_KEY = "ai-server-request-state";
const DEFAULT_VENDOR_LIMIT = 6;
let extraVisibleServerIds = [];
const DEFAULT_PROJECTS = [
  {
    id: "ai-server-request",
    name: "AI Server Request",
    description: "워크로드와 GPU 기준으로 서버 사양, 전력, 냉각, 벤더 요청서를 생성하는 현재 앱.",
    url: "./#builder",
    status: "live",
    tags: ["current", "gpu", "request"]
  },
  {
    id: "future-project-1",
    name: "Future Project 01",
    description: "곧 추가될 다음 AI 웹페이지를 위한 자리입니다.",
    url: "./",
    status: "planned",
    tags: ["planned"]
  },
  {
    id: "future-project-2",
    name: "Future Project 02",
    description: "같은 도메인 안에서 계속 쌓아갈 예정인 두 번째 슬롯입니다.",
    url: "./",
    status: "planned",
    tags: ["planned"]
  },
  {
    id: "cka-lab",
    name: "CKA Lab Simulator",
    description: "쿠버네티스 구조, 장애 복구, GPU 노드 배치를 한눈에 배우는 CKA 실습 보드입니다.",
    url: "./cka-lab/",
    status: "live",
    tags: ["cka", "kubernetes", "gpu"]
  }
];

const WORKLOADS = {
  inference: {
    label: "추론",
    cpu: "2-socket, 16-32 cores",
    memory: "256GB-384GB",
    storage: "OS NVMe RAID1 1TB / Data RAID5 4TB+",
    network: "10/25GbE x1",
    os: "Rocky Linux 9",
    support: "3y NBD/4H",
    power: "1.0-1.2kW",
    cooling: "air cooling",
    note: "CPU와 메모리 효율이 우선"
  },
  "fine-tuning": {
    label: "파인튜닝",
    cpu: "2-socket, 32-48 cores",
    memory: "384GB-512GB",
    storage: "OS NVMe RAID1 1TB / Data RAID5 8TB+",
    network: "25GbE x1",
    os: "Rocky Linux 9",
    support: "3y onsite",
    power: "1.2-1.5kW",
    cooling: "strong air cooling",
    note: "메모리와 PCIe 확장성이 중요"
  },
  training: {
    label: "학습",
    cpu: "2-socket, 48-64+ cores",
    memory: "512GB-1TB",
    storage: "OS NVMe RAID1 1TB / Data RAID5 4TB+",
    network: "25/100GbE x1",
    os: "Rocky Linux 9",
    support: "3y 4H",
    power: "1.8-2.5kW",
    cooling: "high-airflow cooling",
    note: "전력, 냉각, 네트워크가 핵심"
  },
  mixed: {
    label: "혼합",
    cpu: "2-socket, 32-64 cores",
    memory: "384GB-512GB",
    storage: "OS NVMe RAID1 1TB / Data RAID5 8TB+",
    network: "10/25GbE x1",
    os: "Rocky Linux 9",
    support: "3y onsite",
    power: "1.3-2.0kW",
    cooling: "air cooling",
    note: "운영성과 확장성의 균형"
  }
};

const GPU_OPTIONS = [
  {
    value: "RTX6000Ada",
    label: "RTX 6000 Ada",
    cpu: "2-socket, 16-32 cores",
    memory: "128GB-256GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "300W",
        connector: "1x 16-pin (12VHPWR / 12V-2x6)",
        exactness: "official reference",
        serverNeed: "PCIe chassis with a 16-pin GPU lead",
        psu: "2 x 1200W",
        requiredParts: "16-pin GPU power cable",
        slotWidth: "dual-slot"
      }
    },
    fit: "dev/test, light inference",
    note: "워크스테이션 계열이지만 DC 추론에도 자주 사용"
  },
  {
    value: "L4",
    label: "L4",
    cpu: "1-socket, 8-16 cores",
    memory: "192GB-384GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "72W",
        connector: "slot-powered only",
        exactness: "official reference",
        serverNeed: "Any free x16 slot; no aux power lead",
        psu: "2 x 1200W",
        requiredParts: "No aux power lead",
        slotWidth: "single-slot"
      }
    },
    fit: "efficient inference",
    note: "비디오 AI, 저전력 추론"
  },
  {
    value: "L40S",
    label: "L40S",
    cpu: "1-socket, 16-24 cores",
    memory: "256GB-512GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "350W",
        connector: "1x 16-pin",
        exactness: "official reference",
        serverNeed: "Partner / NVIDIA-Certified chassis with a 16-pin GPU lead",
        psu: "2 x 1600W",
        requiredParts: "16-pin GPU power cable",
        slotWidth: "dual-slot"
      }
    },
    fit: "inference, light tuning",
    note: "현재 데이터센터에서 가장 많이 보는 축"
  },
  {
    value: "L40",
    label: "L40",
    cpu: "1-socket, 16-24 cores",
    memory: "256GB-512GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "300W",
        connector: "1x 16-pin",
        exactness: "official reference",
        serverNeed: "PCIe chassis with a 16-pin GPU lead",
        psu: "2 x 1600W",
        requiredParts: "16-pin GPU power cable",
        slotWidth: "dual-slot"
      }
    },
    fit: "graphics, visual AI, inference",
    note: "L40S보다 조금 덜 공격적인 범용 Ada 계열"
  },
  {
    value: "A2",
    label: "A2",
    cpu: "1-socket, 8-12 cores",
    memory: "128GB-256GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "70W",
        connector: "slot-powered only",
        exactness: "official reference",
        serverNeed: "Any free x16 slot; no aux power lead",
        psu: "2 x 800W",
        requiredParts: "No aux power lead",
        slotWidth: "single-slot"
      }
    },
    fit: "entry inference",
    note: "초경량 엣지/서비스용"
  },
  {
    value: "A10",
    label: "A10",
    cpu: "1-socket, 12-24 cores",
    memory: "128GB-256GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "150W class",
        connector: "1x 8-pin PCIe (reference add-in card)",
        exactness: "reference",
        serverNeed: "Server/workstation with one auxiliary 8-pin GPU lead",
        psu: "2 x 1200W",
        requiredParts: "8-pin GPU power cable",
        slotWidth: "single-slot"
      }
    },
    fit: "general inference",
    note: "비교적 오래 쓰인 범용 GPU"
  },
  {
    value: "T4",
    label: "T4",
    cpu: "1-socket, 8-12 cores",
    memory: "128GB-256GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "70W",
        connector: "slot-powered only",
        exactness: "official reference",
        serverNeed: "Any free x16 slot; no aux power lead",
        psu: "2 x 800W",
        requiredParts: "No aux power lead",
        slotWidth: "single-slot"
      }
    },
    fit: "legacy inference",
    note: "레거시 추론 / 인코딩"
  },
  {
    value: "A30",
    label: "A30",
    cpu: "1-socket, 16-24 cores",
    memory: "256GB-384GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "165W class",
        connector: "1x 8-pin PCIe (reference add-in card)",
        exactness: "reference",
        serverNeed: "Server/workstation with one auxiliary 8-pin GPU lead",
        psu: "2 x 1200W",
        requiredParts: "8-pin GPU power cable",
        slotWidth: "single-slot"
      }
    },
    fit: "balanced inference",
    note: "메모리 밸런스가 좋음"
  },
  {
    value: "A40",
    label: "A40",
    cpu: "1-socket or 2-socket, 16-32 cores",
    memory: "256GB-384GB",
    platforms: ["PCIe"],
    variants: {
      PCIe: {
        tdp: "300W",
        connector: "OEM/server-specific harness",
        exactness: "SKU-specific",
        serverNeed: "OEM-qualified platform with the matching GPU harness",
        psu: "2 x 1200W",
        requiredParts: "OEM GPU harness",
        slotWidth: "dual-slot"
      }
    },
    fit: "visual AI, inference",
    note: "비전/그래픽 작업에 자주 쓰임"
  },
  {
    value: "A100",
    label: "A100",
    cpu: "2-socket, 32-64 cores",
    memory: "512GB-1TB",
    platforms: ["PCIe", "SXM"],
    variants: {
      PCIe: {
        tdp: "SKU-specific",
        connector: "OEM/server-specific harness",
        exactness: "SKU-specific",
        serverNeed: "PCIe carrier and exact OEM harness for this A100 SKU",
        psu: "2 x 2000W",
        requiredParts: "Exact A100 PCIe harness",
        slotWidth: "dual-slot"
      },
      SXM: {
        tdp: "SKU-specific",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "HGX A100 baseboard and matching platform",
        psu: "HGX power budget",
        requiredParts: "HGX A100 baseboard",
        slotWidth: "sxm"
      }
    },
    fit: "training, high-end inference",
    note: "엔터프라이즈 학습의 기준점"
  },
  {
    value: "H100",
    label: "H100",
    cpu: "2-socket, 32-64 cores",
    memory: "512GB-1TB",
    platforms: ["PCIe", "SXM"],
    variants: {
      PCIe: {
        tdp: "350W",
        connector: "1x 16-pin",
        exactness: "official PCIe reference",
        serverNeed: "PCIe carrier with a 16-pin GPU lead",
        psu: "2 x 2000W",
        requiredParts: "16-pin GPU power cable",
        slotWidth: "dual-slot"
      },
      SXM: {
        tdp: "700W class",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "HGX H100 baseboard and matched cooling",
        psu: "HGX power budget",
        requiredParts: "HGX H100 baseboard",
        slotWidth: "sxm"
      }
    },
    fit: "heavy training",
    note: "현행 고성능 학습"
  },
  {
    value: "H200",
    label: "H200",
    cpu: "2-socket, 48-64+ cores",
    memory: "1TB-2TB",
    platforms: ["PCIe", "SXM"],
    variants: {
      PCIe: {
        tdp: "SKU-specific",
        connector: "OEM/server-specific harness",
        exactness: "SKU-specific",
        serverNeed: "PCIe carrier for the exact H200 SKU",
        psu: "2 x 3000W",
        requiredParts: "Exact H200 PCIe harness",
        slotWidth: "dual-slot"
      },
      SXM: {
        tdp: "SKU-specific",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "HGX H200 baseboard and matching platform",
        psu: "HGX power budget",
        requiredParts: "HGX H200 baseboard",
        slotWidth: "sxm"
      }
    },
    fit: "large-scale training",
    note: "큰 메모리 대역폭이 필요한 경우"
  },
  {
    value: "B200",
    label: "B200 / Blackwell",
    cpu: "2-socket, 48-96+ cores",
    memory: "1TB-2TB",
    platforms: ["SXM"],
    variants: {
      SXM: {
        tdp: "HGX platform-specific",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "NVIDIA HGX with 8 Blackwell SXMs",
        psu: "2 x 3000W",
        requiredParts: "HGX Blackwell baseboard",
        slotWidth: "sxm"
      }
    },
    fit: "next-gen training",
    note: "차세대 랙 전력 예산 필요"
  },
  {
    value: "B300",
    label: "B300 / Blackwell",
    cpu: "2-socket, 48-96+ cores",
    memory: "1TB-2TB",
    platforms: ["SXM"],
    variants: {
      SXM: {
        tdp: "platform-specific",
        connector: "HGX baseboard / SXM",
        exactness: "platform-specific",
        serverNeed: "HGX Blackwell platform with matching SXM baseboard",
        psu: "2 x 3000W",
        requiredParts: "HGX Blackwell baseboard",
        slotWidth: "sxm"
      }
    },
    fit: "next-gen training",
    note: "Blackwell 세대의 SXM 기준"
  }
];

const VENDORS = [
  {
    vendor: "HPE",
    model: "ProLiant DL20 Gen11",
    badge: "edge entry",
    summary: "1U 엣지/서비스 서버. 저전력 단일 GPU를 얹는 용도에 맞습니다.",
    fit: ["A2", "T4", "L4"],
    platforms: ["PCIe"],
    capacityLevel: 1,
    slotCapacity: 1,
    powerBudget: "2 x 800W",
    powerBudgetW: 1600,
    profileSupport: { lowProfile: true, fullHeight: false },
    accent: ["#7ac8ff", "#0c1f35"],
    specs: {
      formFactor: "1U compact server",
      pcie: "PCIe Gen5 minimal expansion",
      gpuClass: "low-profile / low-power GPU",
      power: "Works best with slot-powered or very low-power cards",
      serverNeed: "Low-profile PCIe GPU and conservative thermal budget"
    }
  },
  {
    vendor: "HPE",
    model: "ProLiant DL320 Gen11",
    badge: "dense 1U",
    summary: "작은 공간에 여러 요청을 처리하는 경량 1U 라인업입니다.",
    fit: ["A2", "T4", "L4", "RTX6000Ada"],
    platforms: ["PCIe"],
    capacityLevel: 1,
    slotCapacity: 2,
    powerBudget: "2 x 1200W",
    powerBudgetW: 2400,
    profileSupport: { lowProfile: true, fullHeight: false },
    accent: ["#61d8ff", "#10233c"],
    specs: {
      formFactor: "1U single-socket",
      pcie: "PCIe Gen5 compact expansion",
      gpuClass: "entry inference / low-profile GPU",
      power: "Good for efficient inference nodes",
      serverNeed: "Low-profile PCIe GPU with modest power and cooling"
    }
  },
  {
    vendor: "HPE",
    model: "ProLiant DL360 Gen11",
    badge: "compact inference",
    summary: "저전력 GPU와 단일 소켓 구성에 잘 맞는 1U 기준선.",
    fit: ["A2", "T4", "L4", "RTX6000Ada"],
    platforms: ["PCIe"],
    capacityLevel: 1,
    slotCapacity: 2,
    powerBudget: "2 x 1200W",
    powerBudgetW: 2400,
    profileSupport: { lowProfile: true, fullHeight: false },
    accent: ["#5cc9ff", "#0e2136"],
    specs: {
      formFactor: "1U single/dual-socket",
      pcie: "PCIe Gen5 compact expansion",
      gpuClass: "entry inference / low-profile GPU",
      power: "Best when you want density without oversized chassis",
      serverNeed: "Good fit for low-power or low-profile PCIe GPUs"
    }
  },
  {
    vendor: "HPE",
    model: "ProLiant DL380 Gen11",
    badge: "balanced enterprise",
    summary: "범용 AI 인프라와 추론형 서비스에 잘 맞는 2U 기준선.",
    fit: ["L4", "L40", "L40S", "A10", "A40"],
    platforms: ["PCIe"],
    capacityLevel: 2,
    slotCapacity: 4,
    powerBudget: "2 x 1600W",
    powerBudgetW: 3200,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#6ee7ff", "#10263b"],
    specs: {
      formFactor: "2U dual-socket",
      pcie: "PCIe Gen5 balanced expansion",
      gpuClass: "1-4 GPU inference / mixed",
      power: "Good default when you need balance",
      serverNeed: "Balanced 2U chassis for mixed CPU, storage, and GPU loads"
    }
  },
  {
    vendor: "HPE",
    model: "ProLiant DL385 Gen11",
    badge: "AMD GPU-friendly",
    summary: "PCIe 여유와 확장성이 좋아 GPU 수량이 늘어날수록 편함.",
    fit: ["L40", "L40S", "A100", "H100"],
    platforms: ["PCIe"],
    capacityLevel: 3,
    slotCapacity: 4,
    powerBudget: "2 x 1600W",
    powerBudgetW: 3200,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#8cffc1", "#0d2d23"],
    specs: {
      formFactor: "2U dual-socket",
      pcie: "PCIe Gen5 lane-heavy",
      gpuClass: "heavier PCIe GPU configs",
      power: "Best when PCIe lanes and capacity matter",
      serverNeed: "Better fit when you expect more PCIe cards or denser GPU builds"
    }
  },
  {
    vendor: "HPE",
    model: "ProLiant DL560 Gen11",
    badge: "high capacity",
    summary: "HPE 쪽에서 더 큰 전력과 확장성을 제공하는 4소켓 계열입니다.",
    fit: ["L40S", "A100", "H100"],
    platforms: ["PCIe"],
    capacityLevel: 3,
    slotCapacity: 6,
    powerBudget: "2 x 1600W",
    powerBudgetW: 3200,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#8fe0ff", "#12304c"],
    specs: {
      formFactor: "2U quad-socket",
      pcie: "PCIe Gen5 high-capacity expansion",
      gpuClass: "multi-GPU inference / mid training",
      power: "When CPU and PCIe capacity matter together",
      serverNeed: "Useful when you need more CPU sockets and GPU expansion"
    }
  },
  {
    vendor: "HPE",
    model: "ProLiant DL580 Gen11",
    badge: "maximum CPU",
    summary: "HPE 쪽에서 가장 큰 CPU/메모리 축에 가까운 대형 플랫폼입니다.",
    fit: ["A100", "H100", "H200"],
    platforms: ["PCIe"],
    capacityLevel: 4,
    slotCapacity: 8,
    powerBudget: "2 x 2000W",
    powerBudgetW: 4000,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#89a7ff", "#16203c"],
    specs: {
      formFactor: "4U quad-socket",
      pcie: "PCIe Gen5 maximum enterprise expansion",
      gpuClass: "large CPU + PCIe GPU deployments",
      power: "Large chassis and strong rack power margin",
      serverNeed: "Best when CPU sockets, memory, and PCIe GPU space all matter"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R660",
    badge: "efficient rack server",
    summary: "L4, A2, T4 같은 저전력 GPU에 맞는 효율적인 1U/2U 중간 지점.",
    fit: ["A2", "T4", "L4", "RTX6000Ada", "A10"],
    platforms: ["PCIe"],
    capacityLevel: 1,
    slotCapacity: 2,
    powerBudget: "2 x 1200W",
    powerBudgetW: 2400,
    profileSupport: { lowProfile: true, fullHeight: false },
    accent: ["#67f0c7", "#0b2a1d"],
    specs: {
      formFactor: "1U dual-socket",
      pcie: "PCIe Gen5 efficient expansion",
      gpuClass: "compact inference / service nodes",
      power: "Better when you do not need a large 2U GPU chassis",
      serverNeed: "Good for low-to-mid power PCIe GPU deployments"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R6615",
    badge: "AMD inference",
    summary: "AMD 기반 1U 서버로, 효율적인 단일/소수 GPU 구성에 잘 맞습니다.",
    fit: ["A2", "T4", "L4", "RTX6000Ada", "A10"],
    platforms: ["PCIe"],
    capacityLevel: 1,
    slotCapacity: 2,
    powerBudget: "2 x 1200W",
    powerBudgetW: 2400,
    profileSupport: { lowProfile: true, fullHeight: false },
    accent: ["#79ffd7", "#0d3026"],
    specs: {
      formFactor: "1U single-socket",
      pcie: "PCIe Gen5 compact expansion",
      gpuClass: "compact inference / edge service",
      power: "Strong choice for efficient GPU service nodes",
      serverNeed: "Low-profile PCIe GPU with restrained thermal budget"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R6625",
    badge: "AMD balanced",
    summary: "1U에서 조금 더 여유 있는 확장성을 노릴 때 보는 AMD 축입니다.",
    fit: ["L4", "RTX6000Ada", "A10", "L40"],
    platforms: ["PCIe"],
    capacityLevel: 2,
    slotCapacity: 3,
    powerBudget: "2 x 1600W",
    powerBudgetW: 3200,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#6ce8d0", "#0a2a24"],
    specs: {
      formFactor: "1U/2U efficient server",
      pcie: "PCIe Gen5 balanced expansion",
      gpuClass: "mixed inference / compact GPU",
      power: "Better if you want slightly more room than a bare minimum 1U",
      serverNeed: "Works well for a few PCIe GPUs with moderate power"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R760",
    badge: "general-purpose",
    summary: "추론, 혼합, 운영형 AI에서 가장 무난한 기준점.",
    fit: ["RTX6000Ada", "L4", "L40", "L40S", "A10"],
    platforms: ["PCIe"],
    capacityLevel: 2,
    slotCapacity: 4,
    powerBudget: "2 x 1600W",
    powerBudgetW: 3200,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#ffb86b", "#33210e"],
    specs: {
      formFactor: "2U dual-socket",
      pcie: "PCIe balanced expansion",
      gpuClass: "general-purpose inference",
      power: "Strong default for mixed CPU/GPU workloads",
      serverNeed: "Works well for 1-4 GPU deployments and day-to-day operations"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R750",
    badge: "proven baseline",
    summary: "Dell 2U 범용 서버의 대표격으로, 안정적인 PCIe GPU 구성을 보기 좋습니다.",
    fit: ["RTX6000Ada", "L4", "L40", "L40S", "A10", "A40", "A100"],
    platforms: ["PCIe"],
    capacityLevel: 2,
    slotCapacity: 4,
    powerBudget: "2 x 1600W",
    powerBudgetW: 3200,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#ffd27d", "#3a2610"],
    specs: {
      formFactor: "2U dual-socket",
      pcie: "PCIe Gen4/Gen5 balanced expansion",
      gpuClass: "general-purpose inference / mixed",
      power: "Stable baseline for classic enterprise deployments",
      serverNeed: "Good default 2U chassis for mainstream GPU builds"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R7615",
    badge: "AMD scale-out",
    summary: "GPU를 여러 대 붙이는 쪽으로 조금 더 확장성 있게 보는 AMD 2U 라인입니다.",
    fit: ["L40", "L40S", "A100", "H100"],
    platforms: ["PCIe"],
    capacityLevel: 3,
    slotCapacity: 4,
    powerBudget: "2 x 1600W",
    powerBudgetW: 3200,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#f8c08a", "#2f1d10"],
    specs: {
      formFactor: "2U single-socket",
      pcie: "PCIe Gen5 lane-heavy expansion",
      gpuClass: "heavier PCIe GPU configs",
      power: "Good when PCIe lanes and memory bandwidth matter",
      serverNeed: "Useful for GPU-heavy builds with room for expansion"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R7625",
    badge: "AMD heavy-duty",
    summary: "큰 메모리와 여러 GPU를 함께 볼 때 적합한 AMD 2U 플랫폼입니다.",
    fit: ["L40S", "A100", "H100", "H200"],
    platforms: ["PCIe"],
    capacityLevel: 3,
    slotCapacity: 6,
    powerBudget: "2 x 1600W",
    powerBudgetW: 3200,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#ffce95", "#321f10"],
    specs: {
      formFactor: "2U single-socket",
      pcie: "PCIe Gen5 high-density expansion",
      gpuClass: "multi-GPU training / mixed",
      power: "Best when you want a lot of PCIe room in 2U",
      serverNeed: "Useful for larger GPU builds that still stay on PCIe"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R860",
    badge: "dense compute",
    summary: "CPU와 메모리 용량을 더 크게 가져가면서 GPU도 보는 대형 4소켓 계열입니다.",
    fit: ["A100", "H100", "H200"],
    platforms: ["PCIe"],
    capacityLevel: 4,
    slotCapacity: 6,
    powerBudget: "2 x 2000W",
    powerBudgetW: 4000,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#ffcf77", "#311d0f"],
    specs: {
      formFactor: "4U quad-socket",
      pcie: "PCIe Gen5 dense expansion",
      gpuClass: "large CPU + GPU compute",
      power: "For dense compute with room for large CPUs",
      serverNeed: "Better when the server must handle heavy CPU and GPU workloads together"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge R960",
    badge: "maximum memory",
    summary: "Dell의 대형 CPU/메모리 축으로, 대규모 AI 지원 환경에 맞습니다.",
    fit: ["A100", "H100", "H200", "B200", "B300"],
    platforms: ["PCIe"],
    capacityLevel: 4,
    slotCapacity: 8,
    powerBudget: "2 x 2000W",
    powerBudgetW: 4000,
    profileSupport: { lowProfile: true, fullHeight: true },
    accent: ["#ffd38d", "#36210f"],
    specs: {
      formFactor: "4U quad-socket",
      pcie: "PCIe Gen5 maximum enterprise expansion",
      gpuClass: "large CPU + PCIe GPU deployments",
      power: "Strong rack power and airflow requirements",
      serverNeed: "Best when you want maximum CPU sockets and broad expansion"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge XE8640",
    badge: "AI dense",
    summary: "고밀도 AI 서버. 여러 GPU를 넣는 쪽으로 최적화된 모델입니다.",
    fit: ["A100", "H100", "H200"],
    platforms: ["PCIe"],
    capacityLevel: 4,
    slotCapacity: 4,
    powerBudget: "2 x 3000W",
    powerBudgetW: 6000,
    profileSupport: { lowProfile: false, fullHeight: true },
    accent: ["#ff9f9f", "#38151b"],
    specs: {
      formFactor: "4U GPU server",
      pcie: "Dense PCIe GPU layout",
      gpuClass: "dense training / max GPU count",
      power: "High thermal and power budget",
      serverNeed: "Best for dense GPU training where airflow and power budget are generous"
    }
  },
  {
    vendor: "Dell",
    model: "PowerEdge XE9680",
    badge: "training flagship",
    summary: "고밀도 GPU 학습과 큰 전력 예산에 맞는 플래그십.",
    fit: ["A100", "H100", "H200", "B200", "B300"],
    platforms: ["PCIe", "SXM"],
    capacityLevel: 4,
    slotCapacity: 8,
    powerBudget: "2 x 3000W",
    powerBudgetW: 6000,
    profileSupport: { lowProfile: false, fullHeight: true },
    accent: ["#ff8bb1", "#331127"],
    specs: {
      formFactor: "4U GPU server",
      pcie: "Dense PCIe / SXM layout",
      gpuClass: "Dense training / max GPU count",
      power: "High thermal and power budget",
      serverNeed: "Best for dense GPU training with generous airflow and rack power"
    }
  }
];

function getGpu(value) {
  return GPU_OPTIONS.find((item) => item.value === value) || GPU_OPTIONS[0];
}

const LEGACY_GPU_ALIASES = {
  "A100-40": { gpuTier: "A100", gpuPlatform: "PCIe" },
  "A100-80": { gpuTier: "A100", gpuPlatform: "PCIe" },
  "H100-PCIe": { gpuTier: "H100", gpuPlatform: "PCIe" }
};

function getGpuVariant(gpu, platform) {
  return gpu.variants?.[platform] || gpu.variants?.[gpu.platforms?.[0]] || {};
}

function getVendorId(vendor) {
  return `${vendor.vendor} ${vendor.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findVendorById(vendorId) {
  return VENDORS.find((vendor) => getVendorId(vendor) === vendorId) || null;
}

function getGpuSlotWidth(gpu, platform) {
  return getGpuVariant(gpu, platform).slotWidth || "check exact SKU";
}

function parseWattage(value) {
  if (!value || typeof value !== "string") return null;
  const normalized = value.toLowerCase();
  const pairedMatch = normalized.match(/(\d+)\s*x\s*([\d.]+)\s*(kw|w)/);
  if (pairedMatch) {
    const count = Number(pairedMatch[1]);
    const numeric = Number(pairedMatch[2]);
    if (!Number.isNaN(count) && !Number.isNaN(numeric)) {
      const unit = pairedMatch[3] === "kw" ? numeric * 1000 : numeric;
      return Math.round(count * unit);
    }
  }

  const match = normalized.match(/([\d.]+)\s*(kw|w)/);
  if (!match) return null;
  const numeric = Number(match[1]);
  if (Number.isNaN(numeric)) return null;
  return match[2] === "kw" ? Math.round(numeric * 1000) : Math.round(numeric);
}

function buildVendorChecks(vendor, state) {
  const gpuVariant = state.gpuVariant;
  const slotWidth = getGpuSlotWidth(state.gpu, state.gpuPlatform);
  const supportsPlatform = vendor.platforms?.includes(state.gpuPlatform) ?? true;
  const slotCapacity = vendor.slotCapacity ?? 0;
  const requiredSlots = state.gpuPlatform === "PCIe" ? state.gpuCount * (slotWidth === "dual-slot" ? 2 : 1) : null;
  const requiredPower = parseWattage(state.psuText);
  const vendorPower = vendor.powerBudgetW ?? null;
  const profileSupport = vendor.profileSupport ?? { lowProfile: false, fullHeight: false };

  const slotCheck =
    state.gpuPlatform !== "PCIe"
      ? {
          label: "확인 필요",
          tone: "warning",
          note: "SXM/HGX는 PCIe x16 슬롯 대신 전용 캐리어와 베이스보드를 함께 봐야 합니다."
        }
      : !supportsPlatform
        ? {
            label: "미지원",
            tone: "danger",
            note: "이 서버는 현재 선택한 PCIe GPU와 직접 맞지 않습니다."
          }
        : slotCapacity >= requiredSlots
          ? {
              label: "가능",
              tone: "ok",
              note: `추정 x16 슬롯 ${slotCapacity}개로 현재 선택한 ${state.gpuCount}장 구성을 수용할 수 있습니다.`
            }
          : {
              label: "경계",
              tone: "warn",
              note: `추정 x16 슬롯 ${slotCapacity}개보다 필요한 슬롯 ${requiredSlots}개가 더 많습니다.`
            };

  const formFactorCheck =
    profileSupport.lowProfile && profileSupport.fullHeight
      ? {
          label: "둘 다 가능",
          tone: "ok",
          note: "Low Profile과 Full Height를 모두 검토할 수 있는 서버입니다."
        }
      : profileSupport.lowProfile
        ? {
            label: "Low Profile",
            tone: "ok",
            note: "Low Profile 브래킷 위주로 보는 편이 안전합니다."
          }
        : profileSupport.fullHeight
          ? {
              label: "Full Height",
              tone: "ok",
              note: "Full Height GPU 기준으로 보는 편이 맞습니다."
            }
          : {
              label: "확인 필요",
              tone: "warning",
              note: "브래킷과 라이저 조합을 최종 SKU 기준으로 확인해야 합니다."
            };

  const occupancyCheck =
    slotWidth === "sxm"
      ? {
          label: "SXM / HGX",
          tone: "ok",
          note: "이 GPU는 PCIe 카드가 아니라 전용 HGX 플랫폼 기준입니다."
        }
      : {
          label: slotWidth === "dual-slot" ? "Dual Slot" : "Single Slot",
          tone: "ok",
          note: `GPU 점유 폭은 ${slotWidth === "dual-slot" ? "2슬롯" : "1슬롯"} 기준으로 보면 됩니다.`
        };

  const powerCheck =
    state.gpuPlatform !== "PCIe"
      ? {
          label: "플랫폼 확인",
          tone: "warning",
          note: "SXM/HGX 전원은 보드와 냉각까지 함께 확인해야 합니다."
        }
      : requiredPower && vendorPower
        ? vendorPower >= requiredPower
          ? {
              label: "공급 가능",
              tone: "ok",
              note: `추정 PSU ${vendor.powerBudget}가 요청 기준 ${state.psuText}보다 큽니다.`
            }
          : {
              label: "부족 가능",
              tone: "danger",
              note: `추정 PSU ${vendor.powerBudget}보다 요청 기준 ${state.psuText}가 더 큽니다.`
            }
        : {
            label: "SKU 확인",
            tone: "warning",
            note: "정확한 PSU 조합과 GPU SKU 전력은 최종 견적 전에 다시 확인해야 합니다."
          };

  return [
    {
      name: "PCIe x16 슬롯",
      value: state.gpuPlatform === "PCIe" ? `${slotCapacity || "?"}개 추정 · ${requiredSlots || "?"}개 필요` : "SXM / HGX",
      status: slotCheck.label,
      tone: slotCheck.tone,
      note: slotCheck.note
    },
    {
      name: "폼팩터",
      value: `${profileSupport.lowProfile ? "Low Profile" : "Low Profile 제한"} / ${profileSupport.fullHeight ? "Full Height" : "Full Height 제한"}`,
      status: formFactorCheck.label,
      tone: formFactorCheck.tone,
      note: formFactorCheck.note
    },
    {
      name: "슬롯 점유",
      value: occupancyCheck.label,
      status: occupancyCheck.label,
      tone: occupancyCheck.tone,
      note: occupancyCheck.note
    },
    {
      name: "전원",
      value: state.gpuPlatform === "PCIe" ? `${state.gpuPower} · ${vendor.powerBudget}` : vendor.powerBudget,
      status: powerCheck.label,
      tone: powerCheck.tone,
      note: powerCheck.note
    }
  ];
}

function formatOfficialGpuList(vendor) {
  return vendor.fit.join(" / ");
}

function renderServerOptions(selectedServerId) {
  const grouped = VENDORS.reduce((acc, vendor) => {
    const bucket = acc.get(vendor.vendor) || [];
    bucket.push(vendor);
    acc.set(vendor.vendor, bucket);
    return acc;
  }, new Map());

  const optionGroups = Array.from(grouped.entries())
    .map(
      ([vendorName, items]) => `
        <optgroup label="${vendorName === "HPE" ? "HP / HPE" : vendorName}">
          ${items
            .map((vendor) => {
              const id = getVendorId(vendor);
              const selected = id === selectedServerId ? " selected" : "";
              return `<option value="${id}"${selected}>${vendor.model}</option>`;
            })
            .join("")}
        </optgroup>
      `
    )
    .join("");

  serverSelect.innerHTML = `
    <option value=""${selectedServerId ? "" : " selected"}>추천 순으로 보기</option>
    ${optionGroups}
  `;
}

function renderExtraServerOptions(vendors) {
  if (!extraServerSelect) return;

  const grouped = vendors.reduce((acc, vendor) => {
    const bucket = acc.get(vendor.vendor) || [];
    bucket.push(vendor);
    acc.set(vendor.vendor, bucket);
    return acc;
  }, new Map());

  const optionGroups = Array.from(grouped.entries())
    .map(
      ([vendorName, items]) => `
        <optgroup label="${vendorName === "HPE" ? "HP / HPE" : vendorName}">
          ${items
            .map((vendor) => {
              const id = getVendorId(vendor);
              return `<option value="${id}">${vendor.model}</option>`;
            })
            .join("")}
        </optgroup>
      `
    )
    .join("");

  extraServerSelect.innerHTML = vendors.length
    ? `
      <option value="">추천 6대 외 서버 추가</option>
      ${optionGroups}
    `
    : `
      <option value="">추가할 서버가 없습니다</option>
    `;
  extraServerSelect.disabled = vendors.length === 0;
  extraServerSelect.value = "";
}

function renderSelectedVendorPanel(vendor, state) {
  if (!vendor) {
    selectedServerPanel.innerHTML = `
      <div class="selected-server-empty">
        <div>
          <span class="eyebrow-inline">선택 서버</span>
          <h3>특정 서버를 골라서 볼 수 있습니다</h3>
          <p>아래 추천 카드나 상단 드롭다운에서 HP / HPE / Dell 라인업을 선택하면, 그 서버를 고정해서 상세를 볼 수 있습니다. 추천 6대 외의 서버는 추가 드롭다운에서 펼쳐 볼 수 있습니다.</p>
        </div>
        <button type="button" class="button button-secondary small" data-clear-server>추천 순으로 보기</button>
      </div>
    `;
    selectedServerPanel.querySelectorAll("[data-clear-server]").forEach((button) => {
      button.addEventListener("click", () => selectServer(""));
    });
    return;
  }

  const checks = buildVendorChecks(vendor, state);
  selectedServerPanel.innerHTML = `
    <div class="selected-server-header">
      <div>
        <span class="eyebrow-inline">선택 서버</span>
        <h3>${vendor.vendor} ${vendor.model}</h3>
        <p>${vendor.summary}</p>
      </div>
      <div class="selected-server-actions">
        <span class="best-pill">고정 선택</span>
        <button type="button" class="button button-secondary small" data-clear-server>선택 해제</button>
      </div>
    </div>
    <div class="selected-server-grid">
      ${checks
        .map(
          (check) => `
            <div class="vendor-check selected">
              <div class="vendor-check-head">
                <span>${check.name}</span>
                <strong class="check-pill check-pill--${check.tone}">${check.status}</strong>
              </div>
              <strong class="vendor-check-value">${check.value}</strong>
              <p>${check.note}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
  selectedServerPanel.querySelectorAll("[data-clear-server]").forEach((button) => {
    button.addEventListener("click", () => selectServer(""));
  });
}

function addExtraServer(serverId) {
  if (!serverId) return;
  if (extraVisibleServerIds.includes(serverId)) return;
  extraVisibleServerIds = [...extraVisibleServerIds, serverId];
  render();
}

function removeExtraServer(serverId) {
  extraVisibleServerIds = extraVisibleServerIds.filter((id) => id !== serverId);
  render();
}

function clearExtraServers() {
  if (!extraVisibleServerIds.length) return;
  extraVisibleServerIds = [];
  render();
}

function getGpuDemandLevel(gpuValue) {
  return {
    A2: 1,
    T4: 1,
    L4: 1,
    RTX6000Ada: 2,
    A10: 2,
    A30: 2,
    L40: 2,
    L40S: 3,
    A40: 3,
    A100: 4,
    H100: 4,
    H200: 5,
    B200: 6,
    B300: 6
  }[gpuValue] || 2;
}

function resolveCpuSpec(gpu, gpuCount, workloadKey) {
  const profiles = {
    L4: {
      1: "1-socket, 8-12 cores",
      2: "1-socket, 12-16 cores",
      4: "1-socket or 2-socket, 16-24 cores",
      8: "2-socket, 24-32 cores"
    },
    L40: {
      1: "1-socket, 16-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    L40S: {
      1: "1-socket, 16-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    RTX6000Ada: {
      1: "1-socket, 16-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    A10: {
      1: "1-socket, 12-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    A30: {
      1: "1-socket, 16-24 cores",
      2: "1-socket or 2-socket, 16-24 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    A40: {
      1: "1-socket or 2-socket, 16-32 cores",
      2: "2-socket, 16-32 cores",
      4: "2-socket, 24-32 cores",
      8: "2-socket, 32-48 cores"
    },
    A100: {
      1: "2-socket, 32-48 cores",
      2: "2-socket, 32-64 cores",
      4: "2-socket, 48-64 cores",
      8: "2-socket, 64+ cores"
    },
    H100: {
      1: "2-socket, 32-48 cores",
      2: "2-socket, 32-64 cores",
      4: "2-socket, 48-64 cores",
      8: "2-socket, 64+ cores"
    },
    H200: {
      1: "2-socket, 48-64 cores",
      2: "2-socket, 48-64+ cores",
      4: "2-socket, 64+ cores",
      8: "2-socket, 64+ cores"
    },
    B200: {
      1: "2-socket, 48-96+ cores",
      2: "2-socket, 64+ cores",
      4: "2-socket, 64+ cores",
      8: "2-socket, 64+ cores"
    },
    B300: {
      1: "2-socket, 48-96+ cores",
      2: "2-socket, 64+ cores",
      4: "2-socket, 64+ cores",
      8: "2-socket, 64+ cores"
    }
  };

  const countBucket = gpuCount >= 8 ? 8 : gpuCount >= 4 ? 4 : gpuCount >= 2 ? 2 : 1;
  const baseProfile = profiles[gpu.value]?.[countBucket];
  if (baseProfile) {
    return workloadKey === "training" && (gpu.value === "A100" || gpu.value === "H100" || gpu.value === "H200" || gpu.value === "B200" || gpu.value === "B300")
      ? `${baseProfile} (train-friendly)`
      : baseProfile;
  }

  return gpu.cpu;
}

function getDefaultGpuValue(platform) {
  return platform === "SXM" ? "H100" : "L40S";
}

function getCompatibleGpuOptions(platform) {
  return GPU_OPTIONS.filter((item) => item.platforms.includes(platform));
}

function normalizeGpuSelection(rawGpu, rawPlatform) {
  if (rawGpu && LEGACY_GPU_ALIASES[rawGpu]) {
    return {
      ...LEGACY_GPU_ALIASES[rawGpu],
      gpuPlatform: rawPlatform || LEGACY_GPU_ALIASES[rawGpu].gpuPlatform
    };
  }

  if (!rawGpu) {
    return {
      gpuTier: getDefaultGpuValue(rawPlatform || "PCIe"),
      gpuPlatform: rawPlatform || "PCIe"
    };
  }

  if (rawGpu.endsWith("-PCIe") || rawGpu.endsWith("-SXM")) {
    const suffix = rawGpu.endsWith("-PCIe") ? "PCIe" : "SXM";
    const family = rawGpu.slice(0, -(suffix.length + 1));
    return {
      gpuTier: family,
      gpuPlatform: suffix || rawPlatform || "PCIe"
    };
  }

  return {
    gpuTier: rawGpu,
    gpuPlatform: rawPlatform || "PCIe"
  };
}

function getSelectedOptions() {
  const params = new URLSearchParams(window.location.search);
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  })();
  const normalized = normalizeGpuSelection(
    params.get("gpu") || stored?.gpuTier || "",
    params.get("platform") || params.get("gpuPlatform") || stored?.gpuPlatform || ""
  );

  return {
    workload: params.get("workload") || stored?.workload || "inference",
    gpuTier: normalized.gpuTier || getDefaultGpuValue(normalized.gpuPlatform),
    gpuPlatform: normalized.gpuPlatform || "PCIe",
    gpuCount: params.get("count") || stored?.gpuCount || "2",
    siteType: params.get("site") || stored?.siteType || "datacenter",
    selectedServerId: params.get("server") || stored?.selectedServerId || "",
    extraVisibleServerIds: Array.isArray(stored?.extraVisibleServerIds) ? stored.extraVisibleServerIds : []
  };
}

function persistState(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }

  const url = new URL(window.location.href);
  url.searchParams.set("workload", nextState.workload);
  url.searchParams.set("gpu", nextState.gpuTier);
  url.searchParams.set("platform", nextState.gpuPlatform);
  url.searchParams.set("count", String(nextState.gpuCount));
  url.searchParams.set("site", nextState.siteType);
  if (nextState.selectedServerId) {
    url.searchParams.set("server", nextState.selectedServerId);
  } else {
    url.searchParams.delete("server");
  }
  history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
}

function estimatedLoad(workloadKey, gpu, gpuCount, siteType, gpuPlatform) {
  const workloadLoad = {
    inference: [0.7, 1.2],
    "fine-tuning": [1.1, 1.5],
    training: [1.8, 2.5],
    mixed: [1.3, 2.0]
  }[workloadKey] || [1.0, 1.2];

  const gpuLoad = {
    RTX6000Ada: [0.7, 0.9],
    L4: [0.7, 1.0],
    L40S: [1.2, 1.4],
    A2: [0.4, 0.7],
    A10: [0.6, 0.9],
    T4: [0.35, 0.6],
    A30: [0.8, 1.1],
    A40: [0.9, 1.2],
    L40: [1.0, 1.3],
    A100: [1.6, 2.4],
    H100: [2.0, 3.0],
    H200: [2.4, 3.6],
    B200: [3.0, 4.2],
    B300: [3.0, 4.2]
  }[gpu.value] || [1.0, 1.2];

  const platformLoadAdj = gpuPlatform === "SXM" ? 0.45 : 0;
  const siteLoadAdj = siteType === "edge" ? -0.05 : siteType === "office" ? 0.1 : 0;
  const low = Math.max(workloadLoad[0], gpuLoad[0]) + Math.max(0, gpuCount - 1) * 0.22 + siteLoadAdj;
  const high = Math.max(workloadLoad[1], gpuLoad[1]) + Math.max(0, gpuCount - 1) * 0.32 + siteLoadAdj + platformLoadAdj;
  return [Math.max(0.3, low), Math.max(low + 0.1, high)];
}

function powerBand(loadHigh, gpu, gpuPlatform) {
  if (gpu.value === "B200" || (gpu.value === "H200" && gpuPlatform === "SXM")) return "2 x 3000W";
  if (gpu.value === "B300") return "HGX power shelf / 2 x 3000W";
  if (gpu.value === "H100" && gpuPlatform === "SXM") return "HGX power shelf / 2 x 3000W";
  if (gpu.value === "H100" && gpuPlatform === "PCIe") return "2 x 2000W";
  if (gpu.value === "H200" && gpuPlatform === "PCIe") return "2 x 3000W";
  if (gpu.value === "A100" && gpuPlatform === "SXM") return "HGX power shelf / 2 x 3000W";
  if (gpu.value === "A100" && gpuPlatform === "PCIe") return "2 x 2000W";
  if (gpu.value === "L40S") return "2 x 1600W";
  if (gpu.value === "L40") return "2 x 1600W";
  if (gpu.value === "L4" || gpu.value === "RTX6000Ada" || gpu.value === "A10" || gpu.value === "A40") return loadHigh <= 1.0 ? "2 x 1200W" : "2 x 1600W";
  if (gpu.value === "A2" || gpu.value === "T4") return "2 x 800W";
  return loadHigh <= 1.0 ? "2 x 1200W" : "2 x 1600W";
}

function formatRange([low, high]) {
  return `${low.toFixed(1)}-${high.toFixed(1)}kW`;
}

function buildRequestText(state) {
  return `AI 서버 구매 요청서

워크로드: ${state.workload.label}
GPU: ${state.gpu.label} / ${state.gpuPlatform} x${state.gpuCount}
설치 환경: ${state.siteLabel}

권장 기본값
- CPU: ${state.cpu}
- 메모리: ${state.memory}
- 저장장치: ${state.storage}
- 네트워크: ${state.network}
- OS: ${state.os}
- 지원: ${state.support}
- GPU 전력: ${state.gpuPower}
- GPU 커넥터: ${state.gpuConnector}
- GPU 필수 부품: ${state.gpuRequiredParts}
- GPU 전원 기준: ${state.gpuExactness}
- GPU 서버 요건: ${state.gpuServerNeed}
- GPU 슬롯 점유: ${state.gpuSlotWidth}
- 전력/냉각: ${state.powerText}
- PSU: ${state.psuText}

요청사항
- 하드웨어 / 유지보수 / 설치 / 전력냉각 / TCO를 분리해 견적
- 대안 모델 2개 제시
- GPU 총 전력과 PSU 정격을 함께 표기
- 데이터센터 또는 오피스 환경에 맞는 냉각 수치 제시
- 저장장치는 OS RAID1, Data RAID5 기준으로 제안`;
}

function fallbackSvg(vendor, model, accentA = "#1f3552", accentB = "#0d1726") {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg viewBox="0 0 960 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${vendor} ${model}">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${accentA}" />
          <stop offset="100%" stop-color="${accentB}" />
        </linearGradient>
      </defs>
      <rect width="960" height="440" rx="28" fill="#09111e" />
      <rect x="34" y="34" width="892" height="372" rx="24" fill="url(#g)" opacity="0.96" />
      <rect x="126" y="98" width="708" height="198" rx="18" fill="#07101c" stroke="rgba(255,255,255,0.16)" />
      <rect x="150" y="124" width="660" height="24" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="150" y="162" width="660" height="24" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="150" y="200" width="660" height="24" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="150" y="238" width="660" height="24" rx="12" fill="rgba(255,255,255,0.12)" />
      <rect x="126" y="316" width="708" height="34" rx="14" fill="rgba(255,255,255,0.12)" />
      <text x="68" y="74" font-family="Space Grotesk, sans-serif" font-size="28" font-weight="700" fill="#f5f8ff">${vendor}</text>
      <text x="68" y="392" font-family="Space Grotesk, sans-serif" font-size="24" font-weight="600" fill="#f5f8ff">${model}</text>
    </svg>
  `)}`;
}

function makeVendorCard(vendor, state, options = {}) {
  const { removable = false } = options;
  const card = document.createElement("article");
  const vendorId = getVendorId(vendor);
  const isSelected = vendorId === state.selectedServerId;
  card.className = `card vendor-card ${vendor.model === "PowerEdge XE9680" ? "vendor-card--dense" : ""} ${isSelected ? "is-selected" : ""} ${removable ? "vendor-card--extra" : ""}`;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-pressed", isSelected ? "true" : "false");
  const supportsPlatform = vendor.platforms?.includes(state.gpuPlatform) ?? true;
  const demandLevel = getGpuDemandLevel(state.gpu.value);
  const capacityLevel = vendor.capacityLevel || 2;
  const capacityScore = Math.max(0, 4 - Math.abs(capacityLevel - demandLevel));
  const score = (vendor.fit.includes(state.gpu.value) ? 4 : 0) + (supportsPlatform ? 2 : 0) + capacityScore;
  const fallback = fallbackSvg(vendor.vendor, vendor.model, vendor.accent[0], vendor.accent[1]);
  const checks = buildVendorChecks(vendor, state);
  const fitReason = vendor.fit.includes(state.gpu.value)
    ? `현재 선택한 ${state.gpu.label} / ${state.gpuPlatform}와 맞습니다.`
    : supportsPlatform
      ? `${state.gpuPlatform} 폼팩터는 받을 수 있지만 GPU 세부 모델은 다시 확인하는 편이 좋습니다.`
      : `${state.gpuPlatform} 폼팩터 기준으로는 직접 매칭이 약합니다.`;

  card.innerHTML = `
    <div class="server-art server-art--fallback">
      <img src="${fallback}" alt="${vendor.vendor} ${vendor.model} 서버 이미지" loading="lazy" />
    </div>
    <div class="vendor-copy">
      <div class="vendor-top">
        <div>
          <span class="vendor-badge">${vendor.badge}</span>
          <h3>${vendor.vendor} ${vendor.model}</h3>
        </div>
        <div class="vendor-top-badges">
          ${isSelected ? '<span class="best-pill">선택됨</span>' : ""}
          ${score > 0 ? '<span class="best-pill">추천</span>' : ""}
          ${removable ? '<button type="button" class="button button-secondary small vendor-card-remove" data-remove-extra>숨기기</button>' : ""}
        </div>
      </div>
      <p>${vendor.summary}</p>
      <div class="vendor-reason">
        <span>추천 이유</span>
        <strong>${fitReason}</strong>
      </div>
      <div class="vendor-checklist">
        ${checks
          .map(
            (check) => `
              <div class="vendor-check">
                <div class="vendor-check-head">
                  <span>${check.name}</span>
                  <strong class="check-pill check-pill--${check.tone}">${check.status}</strong>
                </div>
                <strong class="vendor-check-value">${check.value}</strong>
                <p>${check.note}</p>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="vendor-specs">
        <div class="vendor-spec">
          <span>폼팩터</span>
          <strong>${vendor.specs.formFactor}</strong>
        </div>
        <div class="vendor-spec">
          <span>PCIe / 확장</span>
          <strong>${vendor.specs.pcie}</strong>
        </div>
        <div class="vendor-spec">
          <span>GPU 적합도</span>
          <strong>${vendor.specs.gpuClass}</strong>
        </div>
        <div class="vendor-spec">
          <span>전원/열</span>
          <strong>${vendor.specs.power}</strong>
        </div>
        <div class="vendor-spec">
          <span>서버 요건</span>
          <strong>${vendor.specs.serverNeed}</strong>
        </div>
      </div>
      <div class="vendor-meta vendor-meta--split">
        <div class="vendor-meta-item">
          <span>공식 지원 GPU</span>
          <strong>${formatOfficialGpuList(vendor)}</strong>
        </div>
        <div class="vendor-meta-item">
          <span>지원 플랫폼</span>
          <strong>${vendor.platforms ? vendor.platforms.join(" / ") : "PCIe"}</strong>
        </div>
      </div>
    </div>
  `;

  if (score > 0) {
    card.classList.add("is-best");
  }

  card.addEventListener("click", () => {
    selectServer(vendorId);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectServer(vendorId);
    }
  });

  card.querySelectorAll("[data-remove-extra]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      removeExtraServer(vendorId);
    });
  });

  return card;
}

function renderGpuOptions(platform, selectedValue) {
  const compatible = getCompatibleGpuOptions(platform);
  const fallbackValue = selectedValue && compatible.some((gpu) => gpu.value === selectedValue)
    ? selectedValue
    : getDefaultGpuValue(platform);

  gpuTierSelect.innerHTML = compatible
    .map((gpu) => `<option value="${gpu.value}"${gpu.value === fallbackValue ? " selected" : ""}>${gpu.label}</option>`)
    .join("");

  gpuTierSelect.value = fallbackValue;
  return fallbackValue;
}

function selectServer(serverId) {
  if (!serverId) {
    serverSelect.value = "";
    render();
    return;
  }

  serverSelect.value = serverId;
  render();
}

function render() {
  const workloadKey = workloadSelect.value;
  const siteType = siteTypeSelect.value;
  const gpuPlatform = gpuPlatformSelect.value;
  const gpuValue = renderGpuOptions(gpuPlatform, gpuTierSelect.value);
  const gpu = getGpu(gpuValue);
  const gpuVariant = getGpuVariant(gpu, gpuPlatform);
  const gpuCount = Number(gpuCountInput.value);
  const workload = WORKLOADS[workloadKey];
  const load = estimatedLoad(workloadKey, gpu, gpuCount, siteType, gpuPlatform);
  const powerBandText = powerBand(load[1], gpu, gpuPlatform);
  const siteLabel = siteType === "datacenter" ? "데이터센터" : siteType === "office" ? "오피스/서버실" : "엣지/분산 설치";
  const cpuSpec = resolveCpuSpec(gpu, gpuCount, workloadKey);
  const selectedServerId = serverSelect.value || "";
  const selectedVendor = selectedServerId ? findVendorById(selectedServerId) : null;

  const state = {
    workload,
    gpu,
    gpuPlatform,
    gpuVariant,
    gpuCount,
    siteLabel,
    cpu: cpuSpec,
    memory: workloadKey === "training" && gpu.memory !== "1TB-2TB" ? "512GB-1TB" : gpu.memory,
    storage: workload.storage,
    network: siteType === "office" ? "10/25GbE x1" : siteType === "edge" ? "10GbE x1" : workload.network,
    os: workload.os,
    support: workload.support,
    gpuPower: gpuVariant.tdp || "SKU-specific",
    gpuConnector: gpuVariant.connector || "SKU-specific",
    gpuExactness: gpuVariant.exactness || "SKU-specific",
    gpuServerNeed: gpuVariant.serverNeed || "Check exact SKU before ordering",
    gpuRequiredParts: gpuVariant.requiredParts || "Check exact SKU before ordering",
    gpuSlotWidth: getGpuSlotWidth(gpu, gpuPlatform),
    powerText: `${formatRange(load)}, ${powerBandText}, ${siteType === "office" ? "office cooling margin" : siteType === "edge" ? "edge airflow margin" : workload.cooling}`,
    psuText: `${powerBandText}, 1+1 redundant`,
    selectedServerId
  };

  gpuCountLabel.textContent = String(gpuCount);
  cpuValue.textContent = state.cpu;
  memoryValue.textContent = state.memory;
  storageValue.textContent = state.storage;
  networkValue.textContent = state.network;
  powerValue.textContent = state.powerText;
  psuValue.textContent = state.psuText;
  gpuPowerValue.textContent = state.gpuPower;
  gpuConnectorValue.textContent = state.gpuConnector;
  gpuExactnessValue.textContent = state.gpuExactness;
  gpuRequiredPartsValue.textContent = state.gpuRequiredParts;
  supportValue.textContent = state.support;

  renderServerOptions(selectedServerId);
  renderSelectedVendorPanel(selectedVendor, state);

  livePreview.textContent = [
    `워크로드: ${state.workload.label}`,
    `GPU: ${state.gpu.label} / ${state.gpuPlatform} x${state.gpuCount}`,
    `CPU: ${state.cpu}`,
    `GPU 전력: ${state.gpuPower}`,
    `GPU 커넥터: ${state.gpuConnector}`,
    `필수 부품: ${state.gpuRequiredParts}`,
    `전원 기준: ${state.gpuExactness}`,
    `슬롯 점유: ${state.gpuSlotWidth}`,
    `서버 요건: ${state.gpuServerNeed}`,
    `전력: ${state.powerText}`,
    `냉각: ${siteType === "datacenter" ? "rack-optimized" : siteType === "office" ? "office-safe" : "edge-safe"}`,
    `포커스: ${state.workload.note}`
  ].join("\n");

  requestTemplate.textContent = buildRequestText(state);
  const ranked = VENDORS
    .map((vendor, index) => ({
      vendor,
      index,
      score:
        (vendor.fit.includes(state.gpu.value) ? 4 : 0) +
        ((vendor.platforms?.includes(state.gpuPlatform) ?? true) ? 2 : 0) +
        Math.max(0, 4 - Math.abs((vendor.capacityLevel || 2) - getGpuDemandLevel(state.gpu.value))) +
        (vendor.vendor === "Dell" && state.gpu.value === "H100" && state.gpuPlatform === "PCIe" ? 1 : 0)
    }))
    .sort((a, b) => {
      const aSelected = getVendorId(a.vendor) === selectedServerId;
      const bSelected = getVendorId(b.vendor) === selectedServerId;
      if (aSelected !== bSelected) return aSelected ? -1 : 1;
      return b.score - a.score || a.index - b.index;
    });

  const topScore = ranked[0]?.score || 0;
  const baseRanked = ranked.slice(0, DEFAULT_VENDOR_LIMIT);
  const baseIds = new Set(baseRanked.map(({ vendor }) => getVendorId(vendor)));
  extraVisibleServerIds = extraVisibleServerIds.filter(
    (id) => !baseIds.has(id) && ranked.some(({ vendor }) => getVendorId(vendor) === id)
  );
  const extraRanked = ranked.slice(DEFAULT_VENDOR_LIMIT);
  const visibleExtraRanked = extraVisibleServerIds
    .map((id) => ranked.find(({ vendor }) => getVendorId(vendor) === id))
    .filter(Boolean);
  const hiddenExtraRanked = extraRanked.filter(({ vendor }) => !extraVisibleServerIds.includes(getVendorId(vendor)));

  vendorGrid.replaceChildren(
    ...baseRanked.map(({ vendor, score }) => {
      const card = makeVendorCard(vendor, state);
      if (score === topScore && topScore > 0) {
        card.classList.add("is-best");
      }
      return card;
    }),
    ...visibleExtraRanked.map(({ vendor, score }) => {
      const card = makeVendorCard(vendor, state, { removable: true });
      if (score === topScore && topScore > 0) {
        card.classList.add("is-best");
      }
      return card;
    })
  );
  renderExtraServerOptions(hiddenExtraRanked.map(({ vendor }) => vendor));
  copyButton.dataset.copy = requestTemplate.textContent;
  persistState({
    workload: workloadKey,
    gpuTier: gpu.value,
    gpuPlatform,
    gpuCount,
    siteType,
    selectedServerId,
    extraVisibleServerIds
  });
}

async function copyRequest() {
  const text = copyButton.dataset.copy || "";
  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = "복사됨";
  } catch {
    copyButton.textContent = "복사 실패";
  }
  setTimeout(() => {
    copyButton.textContent = "복사";
  }, 1200);
}

const initial = getSelectedOptions();
extraVisibleServerIds = [...initial.extraVisibleServerIds];
workloadSelect.value = initial.workload;
gpuPlatformSelect.value = initial.gpuPlatform;
renderGpuOptions(initial.gpuPlatform, initial.gpuTier);
gpuCountInput.value = initial.gpuCount;
siteTypeSelect.value = initial.siteType;
serverSelect.value = initial.selectedServerId;

if (extraServerSelect) {
  extraServerSelect.addEventListener("change", () => {
    const serverId = extraServerSelect.value;
    if (!serverId) return;
    addExtraServer(serverId);
    extraServerSelect.value = "";
  });
}

if (clearExtraServersButton) {
  clearExtraServersButton.addEventListener("click", clearExtraServers);
}

workloadSelect.addEventListener("change", render);
gpuTierSelect.addEventListener("change", render);
gpuPlatformSelect.addEventListener("change", render);
gpuCountInput.addEventListener("input", render);
siteTypeSelect.addEventListener("change", render);
serverSelect.addEventListener("change", render);
copyButton.addEventListener("click", copyRequest);

render();
