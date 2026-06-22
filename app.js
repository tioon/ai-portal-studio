const workloadSelect = document.querySelector("#workload");
const gpuTierSelect = document.querySelector("#gpuTier");
const gpuCountInput = document.querySelector("#gpuCount");
const siteTypeSelect = document.querySelector("#siteType");

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
const copyButton = document.querySelector("#copyButton");
const gpuPowerValue = document.querySelector("#gpuPowerValue");
const gpuConnectorValue = document.querySelector("#gpuConnectorValue");
const STORAGE_KEY = "ai-server-request-state";

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
    power: {
      tdp: "300W",
      connector: "1x 16-pin (12VHPWR / 12V-2x6)",
      exactness: "official reference"
    },
    platform: "PCIe dual-slot",
    serverNeed: "Workstation or server chassis with a 16-pin GPU lead",
    psu: "2 x 1200W",
    fit: "dev/test, light inference",
    note: "워크스테이션 계열이지만 DC 추론에도 자주 사용"
  },
  {
    value: "L4",
    label: "L4",
    cpu: "2-socket, 16-32 cores",
    memory: "192GB-384GB",
    power: {
      tdp: "72W",
      connector: "slot-powered only",
      exactness: "official reference"
    },
    platform: "PCIe low-profile",
    serverNeed: "Any free x16 slot; no aux power lead",
    psu: "2 x 1200W",
    fit: "efficient inference",
    note: "비디오 AI, 저전력 추론"
  },
  {
    value: "L40S",
    label: "L40S",
    cpu: "2-socket, 32-48 cores",
    memory: "256GB-512GB",
    power: {
      tdp: "350W",
      connector: "1x 16-pin",
      exactness: "official reference"
    },
    platform: "PCIe dual-slot air-cooled or single-slot liquid-cooled",
    serverNeed: "Partner / NVIDIA-Certified chassis with a 16-pin GPU lead",
    psu: "2 x 1600W",
    fit: "inference, light tuning",
    note: "현재 데이터센터에서 가장 많이 보는 축"
  },
  {
    value: "A2",
    label: "A2",
    cpu: "2-socket, 16-24 cores",
    memory: "128GB-256GB",
    power: {
      tdp: "70W",
      connector: "slot-powered only",
      exactness: "official reference"
    },
    platform: "PCIe low-profile",
    serverNeed: "Any free x16 slot; no aux power lead",
    psu: "2 x 800W",
    fit: "entry inference",
    note: "초경량 엣지/서비스용"
  },
  {
    value: "A10",
    label: "A10",
    cpu: "2-socket, 16-32 cores",
    memory: "128GB-256GB",
    power: {
      tdp: "150W class",
      connector: "1x 8-pin PCIe (reference add-in card)",
      exactness: "reference"
    },
    platform: "PCIe dual-slot",
    serverNeed: "Server/workstation with one auxiliary 8-pin GPU lead",
    psu: "2 x 1200W",
    fit: "general inference",
    note: "비교적 오래 쓰인 범용 GPU"
  },
  {
    value: "T4",
    label: "T4",
    cpu: "2-socket, 16-24 cores",
    memory: "128GB-256GB",
    power: {
      tdp: "70W",
      connector: "slot-powered only",
      exactness: "official reference"
    },
    platform: "PCIe low-profile",
    serverNeed: "Any free x16 slot; no aux power lead",
    psu: "2 x 800W",
    fit: "legacy inference",
    note: "레거시 추론 / 인코딩"
  },
  {
    value: "A30",
    label: "A30",
    cpu: "2-socket, 24-32 cores",
    memory: "256GB-384GB",
    power: {
      tdp: "165W class",
      connector: "1x 8-pin PCIe (reference add-in card)",
      exactness: "reference"
    },
    platform: "PCIe dual-slot",
    serverNeed: "Server/workstation with one auxiliary 8-pin GPU lead",
    psu: "2 x 1200W",
    fit: "balanced inference",
    note: "메모리 밸런스가 좋음"
  },
  {
    value: "A40",
    label: "A40",
    cpu: "2-socket, 24-32 cores",
    memory: "256GB-384GB",
    power: {
      tdp: "300W",
      connector: "OEM/server-specific harness",
      exactness: "SKU-specific"
    },
    platform: "PCIe dual-slot, active",
    serverNeed: "OEM-qualified platform with the matching GPU harness",
    psu: "2 x 1200W",
    fit: "visual AI, inference",
    note: "비전/그래픽 작업에 자주 쓰임"
  },
  {
    value: "A100-40",
    label: "A100 40GB",
    cpu: "2-socket, 48-64 cores",
    memory: "512GB-1TB",
    power: {
      tdp: "SKU-specific",
      connector: "OEM/server-specific harness",
      exactness: "SKU-specific"
    },
    platform: "PCIe or SXM depending SKU",
    serverNeed: "NVIDIA-Certified / OEM-qualified platform for the exact A100 SKU",
    psu: "2 x 2000W",
    fit: "training, high-end inference",
    note: "엔터프라이즈 학습의 기준점"
  },
  {
    value: "A100-80",
    label: "A100 80GB",
    cpu: "2-socket, 48-64 cores",
    memory: "512GB-1TB",
    power: {
      tdp: "SKU-specific",
      connector: "OEM/server-specific harness",
      exactness: "SKU-specific"
    },
    platform: "PCIe or SXM depending SKU",
    serverNeed: "NVIDIA-Certified / OEM-qualified platform for the exact A100 SKU",
    psu: "2 x 2000W",
    fit: "training",
    note: "메모리 큰 학습/추론"
  },
  {
    value: "H100-PCIe",
    label: "H100 PCIe",
    cpu: "2-socket, 48-64 cores",
    memory: "512GB-1TB",
    power: {
      tdp: "400W",
      connector: "OEM/server-specific harness",
      exactness: "SKU-specific"
    },
    platform: "PCIe dual-slot air-cooled",
    serverNeed: "Partner / NVIDIA-Certified system with 1-8 GPUs",
    psu: "2 x 2000W",
    fit: "heavy training",
    note: "현행 고성능 학습"
  },
  {
    value: "H200",
    label: "H200",
    cpu: "high-core 2-socket+",
    memory: "1TB-2TB",
    power: {
      tdp: "SXM or PCIe SKU-specific",
      connector: "OEM/server-specific harness",
      exactness: "SKU-specific"
    },
    platform: "SXM | PCIe depending SKU",
    serverNeed: "HGX H200 or NVIDIA-Certified platform for the exact SKU",
    psu: "2 x 3000W",
    fit: "large-scale training",
    note: "큰 메모리 대역폭이 필요한 경우"
  },
  {
    value: "B200",
    label: "B200 / Blackwell",
    cpu: "high-core 2-socket+",
    memory: "1TB-2TB",
    power: {
      tdp: "HGX platform-specific",
      connector: "HGX baseboard / SXM",
      exactness: "platform-specific"
    },
    platform: "HGX / 8x SXM",
    serverNeed: "NVIDIA HGX with 8 Blackwell SXMs",
    psu: "2 x 3000W",
    fit: "next-gen training",
    note: "차세대 랙 전력 예산 필요"
  }
];

const VENDORS = [
  {
    vendor: "HPE",
    model: "ProLiant DL380 Gen11",
    badge: "balanced enterprise",
    summary: "범용 AI 인프라와 추론형 서비스에 잘 맞는 2U 기준선.",
    fit: ["L4", "L40S", "A10", "A40"],
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
    fit: ["L40S", "A100-40", "A100-80", "H100-PCIe"],
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
    vendor: "Dell",
    model: "PowerEdge R760",
    badge: "general-purpose",
    summary: "추론, 혼합, 운영형 AI에서 가장 무난한 기준점.",
    fit: ["RTX6000Ada", "L4", "L40S", "A10"],
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
    model: "PowerEdge XE9680",
    badge: "training flagship",
    summary: "고밀도 GPU 학습과 큰 전력 예산에 맞는 플래그십.",
    fit: ["A100-80", "H100-PCIe", "H200", "B200"],
    accent: ["#ff8bb1", "#331127"],
    specs: {
      formFactor: "4U GPU server",
      pcie: "high-density GPU platform",
      gpuClass: "dense training / max GPU count",
      power: "Use when thermal and power budget are high",
      serverNeed: "Best for dense GPU training where airflow and power budget are generous"
    }
  }
];

function getGpu(value) {
  return GPU_OPTIONS.find((item) => item.value === value) || GPU_OPTIONS[0];
}

function getDefaultGpuIndex() {
  return 2;
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

  return {
    workload: params.get("workload") || stored?.workload || "inference",
    gpuTier: params.get("gpu") || stored?.gpuTier || GPU_OPTIONS[getDefaultGpuIndex()]?.value || GPU_OPTIONS[0].value,
    gpuCount: params.get("count") || stored?.gpuCount || "2",
    siteType: params.get("site") || stored?.siteType || "datacenter"
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
  url.searchParams.set("count", String(nextState.gpuCount));
  url.searchParams.set("site", nextState.siteType);
  history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
}

function estimatedLoad(workloadKey, gpu, gpuCount, siteType) {
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
    "A100-40": [1.6, 2.2],
    "A100-80": [1.8, 2.4],
    "H100-PCIe": [2.0, 2.6],
    H200: [2.4, 3.2],
    B200: [3.0, 4.0]
  }[gpu.value] || [1.0, 1.2];

  const siteLoadAdj = siteType === "edge" ? -0.05 : siteType === "office" ? 0.1 : 0;
  const low = Math.max(workloadLoad[0], gpuLoad[0]) + Math.max(0, gpuCount - 1) * 0.22 + siteLoadAdj;
  const high = Math.max(workloadLoad[1], gpuLoad[1]) + Math.max(0, gpuCount - 1) * 0.32 + siteLoadAdj;
  return [Math.max(0.3, low), Math.max(low + 0.1, high)];
}

function powerBand(loadHigh, gpu) {
  if (gpu.value === "B200") return "2 x 3000W";
  if (gpu.value === "H200") return "2 x 3000W";
  if (gpu.value === "H100-PCIe") return "2 x 2000W";
  if (gpu.value === "A100-80" || gpu.value === "A100-40") return "2 x 2000W";
  if (gpu.value === "L40S") return "2 x 1600W";
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
GPU: ${state.gpu.label} x${state.gpuCount}
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
- GPU 전원 기준: ${state.gpuExactness}
- GPU 서버 요건: ${state.gpuServerNeed}
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

function makeVendorCard(vendor, state) {
  const card = document.createElement("article");
  card.className = "card vendor-card";
  const score = vendor.fit.includes(state.gpu.label) ? 2 : vendor.fit.includes(state.gpu.value) ? 3 : 0;
  const fallback = fallbackSvg(vendor.vendor, vendor.model, vendor.accent[0], vendor.accent[1]);
  const fitReason = vendor.fit.includes(state.gpu.value)
    ? `현재 선택한 ${state.gpu.label}와 맞습니다.`
    : vendor.fit.includes(state.gpu.label)
      ? `${state.gpu.label} 계열을 받을 수 있습니다.`
      : "현재 선택값과는 직접 매칭이 약합니다.";

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
        ${score > 0 ? '<span class="best-pill">추천</span>' : ""}
      </div>
      <p>${vendor.summary}</p>
      <div class="vendor-reason">
        <span>추천 이유</span>
        <strong>${fitReason}</strong>
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
      <div class="vendor-meta">
        <span>적합 GPU</span>
        <strong>${vendor.fit.join(" / ")}</strong>
      </div>
    </div>
  `;

  if (score > 0) {
    card.classList.add("is-best");
  }

  return card;
}

function renderGpuOptions() {
  gpuTierSelect.innerHTML = GPU_OPTIONS.map(
    (gpu, index) => `<option value="${gpu.value}"${index === getDefaultGpuIndex() ? " selected" : ""}>${gpu.label}</option>`
  ).join("");
}

function render() {
  const workloadKey = workloadSelect.value;
  const siteType = siteTypeSelect.value;
  const gpu = getGpu(gpuTierSelect.value);
  const gpuCount = Number(gpuCountInput.value);
  const workload = WORKLOADS[workloadKey];
  const load = estimatedLoad(workloadKey, gpu, gpuCount, siteType);
  const powerBandText = powerBand(load[1], gpu);
  const siteLabel = siteType === "datacenter" ? "데이터센터" : siteType === "office" ? "오피스/서버실" : "엣지/분산 설치";

  const state = {
    workload,
    gpu,
    gpuCount,
    siteLabel,
    cpu: gpu.cpu,
    memory: workloadKey === "training" && gpu.memory !== "1TB-2TB" ? "512GB-1TB" : gpu.memory,
    storage: workload.storage,
    network: siteType === "office" ? "10/25GbE x1" : siteType === "edge" ? "10GbE x1" : workload.network,
    os: workload.os,
    support: workload.support,
    gpuPower: gpu.power.tdp,
    gpuConnector: gpu.power.connector,
    gpuExactness: gpu.power.exactness,
    gpuServerNeed: gpu.serverNeed,
    powerText: `${formatRange(load)}, ${powerBandText}, ${siteType === "office" ? "office cooling margin" : siteType === "edge" ? "edge airflow margin" : workload.cooling}`,
    psuText: `${powerBandText}, 1+1 redundant`
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
  supportValue.textContent = state.support;

  livePreview.textContent = [
    `워크로드: ${state.workload.label}`,
    `GPU: ${state.gpu.label} x${state.gpuCount}`,
    `GPU 전력: ${state.gpuPower}`,
    `GPU 커넥터: ${state.gpuConnector}`,
    `전원 기준: ${state.gpuExactness}`,
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
        (vendor.fit.includes(state.gpu.label) ? 2 : 0) +
        (vendor.fit.includes(state.gpu.value) ? 3 : 0) +
        (vendor.vendor === "Dell" && state.gpu.value === "H100-PCIe" ? 1 : 0)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const topScore = ranked[0]?.score || 0;
  vendorGrid.replaceChildren(
    ...ranked.map(({ vendor, score }) => {
      const card = makeVendorCard(vendor, state);
      if (score === topScore && topScore > 0) {
        card.classList.add("is-best");
      }
      return card;
    })
  );
  copyButton.dataset.copy = requestTemplate.textContent;
  persistState({
    workload: workloadKey,
    gpuTier: gpu.value,
    gpuCount,
    siteType
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

renderGpuOptions();
const initial = getSelectedOptions();
workloadSelect.value = initial.workload;
gpuTierSelect.value = initial.gpuTier;
gpuCountInput.value = initial.gpuCount;
siteTypeSelect.value = initial.siteType;

workloadSelect.addEventListener("change", render);
gpuTierSelect.addEventListener("change", render);
gpuCountInput.addEventListener("input", render);
siteTypeSelect.addEventListener("change", render);
copyButton.addEventListener("click", copyRequest);

render();
