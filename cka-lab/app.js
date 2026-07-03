const SCENARIOS = [
  { id: "pod-basics", chapter: "워크로드", title: "Pod 수명 주기", objective: "한 Pod가 readiness 실패로 흔들린다.", hint: "describe, logs, delete 순서로 살펴보면 self-healing이 보인다." },
  { id: "service-routing", chapter: "서비스", title: "Service 셀렉터 문제", objective: "Service는 있는데 트래픽이 Pod까지 가지 않는다.", hint: "Endpoint가 비어 있으면 selector와 label을 먼저 본다." },
  { id: "scheduling", chapter: "스케줄링", title: "Pending Pod", objective: "nodeSelector가 너무 빡빡해 Pod가 배치되지 않는다.", hint: "노드 라벨과 스케줄 조건을 함께 확인한다." },
  { id: "storage", chapter: "스토리지", title: "PVC 바인딩 실패", objective: "적절한 StorageClass가 없어 PVC가 Pending이다.", hint: "PVC 상태와 StorageClass 이름을 비교한다." },
  { id: "rbac", chapter: "보안", title: "RBAC 거부", objective: "ServiceAccount가 ConfigMap을 list하지 못한다.", hint: "RoleBinding이 빠졌는지 먼저 확인한다." },
  { id: "gpu-training", chapter: "GPU", title: "GPU 워크로드", objective: "GPU가 있는 노드에만 학습 Pod를 배치해야 한다.", hint: "nvidia.com/gpu 요청과 GPU 노드 표시를 같이 본다." },
];

function buildScenarioState(id) {
  switch (id) {
    case "service-routing":
      return {
        title: "Service 셀렉터 문제",
        notes: "Service selector가 잘못되어 Endpoint가 비어 있다.",
        mission: "selector를 `app=frontend`로 고치면 라우팅이 복구된다.",
        nodes: [
          { name: "control-plane", role: "control plane", status: "정상", cpu: 24, memory: 31 },
          { name: "worker-1", role: "worker", status: "정상", cpu: 58, memory: 44 },
          { name: "worker-2", role: "worker", status: "정상", cpu: 37, memory: 29 },
        ],
        deployments: [{ name: "frontend", replicas: 3, ready: 3, image: "ghcr.io/demo/frontend:v1" }],
        pods: [
          { name: "frontend-7d8c9", owner: "frontend", node: "worker-1", status: "Running", ready: true, restarts: 0, labels: { app: "frontend", tier: "web" }, ip: "10.42.0.21", image: "ghcr.io/demo/frontend:v1", logs: "Serving requests on :8080" },
          { name: "frontend-7d8ca", owner: "frontend", node: "worker-2", status: "Running", ready: true, restarts: 0, labels: { app: "frontend", tier: "web" }, ip: "10.42.1.18", image: "ghcr.io/demo/frontend:v1", logs: "Serving requests on :8080" },
          { name: "frontend-7d8cb", owner: "frontend", node: "worker-2", status: "Running", ready: true, restarts: 0, labels: { app: "frontend", tier: "web" }, ip: "10.42.1.19", image: "ghcr.io/demo/frontend:v1", logs: "Serving requests on :8080" },
        ],
        services: [{ name: "frontend", type: "ClusterIP", selector: { app: "ui" }, port: "80:8080", endpoints: [] }],
        pvcs: [],
        roles: [],
        gpuNodes: [],
        gpuPods: [],
        selectedHint: "Endpoint가 0개라면 Service는 정상이어도 트래픽이 가지 않는다.",
      };
    case "scheduling":
      return {
        title: "Pending Pod",
        notes: "노드 라벨이 맞지 않아 Pod가 대기 중이다.",
        mission: "노드 셀렉터를 수정해 worker-a에 배치한다.",
        nodes: [
          { name: "control-plane", role: "control plane", status: "정상", cpu: 26, memory: 28 },
          { name: "worker-a", role: "worker", status: "정상", cpu: 44, memory: 35, labels: { disk: "ssd" } },
          { name: "worker-b", role: "worker", status: "정상", cpu: 51, memory: 49, labels: { disk: "hdd" } },
        ],
        deployments: [{ name: "api", replicas: 1, ready: 0, image: "ghcr.io/demo/api:v2" }],
        pods: [{ name: "api-5d9ff", owner: "api", node: null, status: "Pending", ready: false, restarts: 0, labels: { app: "api" }, ip: null, image: "ghcr.io/demo/api:v2", logs: "FailedScheduling: 0/2 nodes are available" }],
        services: [],
        pvcs: [],
        roles: [],
        gpuNodes: [],
        gpuPods: [],
        selectedHint: "Pending은 대개 리소스 부족, 라벨 불일치, taint 문제다.",
      };
    case "storage":
      return {
        title: "PVC 바인딩 실패",
        notes: "StorageClass가 맞지 않아 PVC가 Pending이다.",
        mission: "PVC를 standard StorageClass에 맞춘다.",
        nodes: [
          { name: "control-plane", role: "control plane", status: "정상", cpu: 23, memory: 22 },
          { name: "worker-1", role: "worker", status: "정상", cpu: 33, memory: 31 },
        ],
        deployments: [{ name: "database", replicas: 1, ready: 1, image: "postgres:16" }],
        pods: [{ name: "database-0", owner: "database", node: "worker-1", status: "Running", ready: true, restarts: 0, labels: { app: "database" }, ip: "10.42.0.55", image: "postgres:16", logs: "waiting for WAL replay" }],
        services: [],
        pvcs: [{ name: "db-data", status: "Pending", storageClass: "fast-ssd", request: "10Gi", volume: null }],
        roles: [],
        gpuNodes: [],
        gpuPods: [],
        selectedHint: "PVC가 Bound되지 않으면 Pod는 볼륨을 못 붙이고 멈춘다.",
      };
    case "rbac":
      return {
        title: "RBAC 거부",
        notes: "Role은 있지만 RoleBinding이 없다.",
        mission: "권한 바인딩을 복구해서 list 권한을 되살린다.",
        nodes: [
          { name: "control-plane", role: "control plane", status: "정상", cpu: 20, memory: 25 },
          { name: "worker-1", role: "worker", status: "정상", cpu: 39, memory: 27 },
        ],
        deployments: [],
        pods: [{ name: "debug-shell", owner: "none", node: "worker-1", status: "Running", ready: true, restarts: 0, labels: { app: "debug" }, ip: "10.42.0.77", image: "busybox", logs: "Forbidden: serviceaccount cannot list configmaps" }],
        services: [],
        pvcs: [],
        roles: [{ name: "configmap-reader", kind: "Role", namespace: "demo", rules: ["get configmaps", "list configmaps"] }],
        gpuNodes: [],
        gpuPods: [],
        selectedHint: "권한 문제는 can-i와 RoleBinding 확인이 빠르다.",
      };
    case "gpu-training":
      return {
        title: "GPU 워크로드",
        notes: "GPU가 있는 노드에만 학습 Pod를 배치해야 한다.",
        mission: "GPU 요청과 노드 셀렉터를 맞추면 학습 Pod가 올라간다.",
        nodes: [
          { name: "control-plane", role: "control plane", status: "정상", cpu: 18, memory: 24 },
          { name: "worker-1", role: "worker", status: "정상", cpu: 36, memory: 38, labels: { gpu: "false" } },
          { name: "worker-2", role: "worker", status: "정상", cpu: 52, memory: 49, labels: { gpu: "false" } },
        ],
        deployments: [{ name: "trainer", replicas: 1, ready: 0, image: "ghcr.io/demo/trainer:v1" }],
        pods: [{ name: "trainer-8f4a1", owner: "trainer", node: null, status: "Pending", ready: false, restarts: 0, labels: { app: "trainer", workload: "ml" }, ip: null, image: "ghcr.io/demo/trainer:v1", logs: "0/2 nodes are available: 2 Insufficient nvidia.com/gpu" }],
        services: [],
        pvcs: [],
        roles: [],
        gpuNodes: [
          { name: "gpu-worker-1", role: "gpu worker", status: "정상", cpu: 47, memory: 41, labels: { gpu: "true" }, gpuModel: "NVIDIA T4", gpuTotal: 2, gpuUsed: 1 },
          { name: "gpu-worker-2", role: "gpu worker", status: "정상", cpu: 29, memory: 35, labels: { gpu: "true" }, gpuModel: "NVIDIA A10", gpuTotal: 4, gpuUsed: 2 },
        ],
        gpuPods: [
          { name: "trainer-8f4a1", requestGpu: 1, status: "Pending", image: "ghcr.io/demo/trainer:v1", note: "GPU 노드로 이동해야 한다." },
          { name: "inference-2c9b", requestGpu: 1, status: "Running", image: "ghcr.io/demo/inference:v4", note: "gpu-worker-1에 배치됨." },
        ],
        selectedHint: "GPU는 별도 자원처럼 보이게 만들어야 배치 원리가 눈에 들어온다.",
      };
    case "pod-basics":
    default:
      return {
        title: "Pod 수명 주기",
        notes: "하나의 Pod가 readiness 실패로 흔들리고 있다.",
        mission: "문제 Pod를 삭제하면 Deployment가 다시 채운다.",
        nodes: [
          { name: "control-plane", role: "control plane", status: "정상", cpu: 18, memory: 24 },
          { name: "worker-1", role: "worker", status: "정상", cpu: 41, memory: 38 },
          { name: "worker-2", role: "worker", status: "정상", cpu: 56, memory: 46 },
        ],
        deployments: [{ name: "web", replicas: 2, ready: 1, image: "ghcr.io/demo/web:v2" }],
        pods: [
          { name: "web-6f7f8", owner: "web", node: "worker-1", status: "Running", ready: true, restarts: 0, labels: { app: "web" }, ip: "10.42.0.11", image: "ghcr.io/demo/web:v2", logs: "Started server on port 8080" },
          { name: "web-6f7f9", owner: "web", node: "worker-2", status: "CrashLoopBackOff", ready: false, restarts: 5, labels: { app: "web" }, ip: "10.42.1.12", image: "ghcr.io/demo/web:v2", logs: "Readiness probe failed: connection refused" },
        ],
        services: [{ name: "web", type: "ClusterIP", selector: { app: "web" }, port: "80:8080", endpoints: ["10.42.0.11", "10.42.1.12"] }],
        pvcs: [],
        roles: [],
        gpuNodes: [],
        gpuPods: [],
        selectedHint: "CrashLoopBackOff는 로그와 재시작 횟수가 핵심 신호다.",
      };
  }
}

const commandHints = [
  "kubectl get pods",
  "kubectl describe pod web-6f7f9",
  "kubectl logs web-6f7f9",
  "kubectl delete pod web-6f7f9",
  "kubectl get svc",
  "kubectl auth can-i list configmaps",
];

const state = {
  scenarioId: SCENARIOS[0].id,
  scenarioState: buildScenarioState(SCENARIOS[0].id),
  selected: { type: "pod", name: buildScenarioState(SCENARIOS[0].id).pods[0]?.name ?? "" },
  manifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: lab-app
  namespace: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: lab-app
  template:
    metadata:
      labels:
        app: lab-app
    spec:
      containers:
        - name: app
          image: ghcr.io/demo/lab-app:v1
          ports:
            - containerPort: 8080
`,
  command: "kubectl get pods",
  output: "명령어를 입력하거나, 아래 시나리오를 눌러 시작하세요.",
  events: [{ time: "00:00", text: "학습 보드가 준비되었습니다." }],
  guided: true,
  showHint: true,
  tick: 0,
};

const app = document.querySelector("#app");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nowStamp() {
  return new Date().toTimeString().slice(0, 5);
}

function addEvent(text) {
  state.events = [{ time: nowStamp(), text }, ...state.events].slice(0, 12);
}

function selectScenario(id) {
  state.scenarioId = id;
  state.scenarioState = buildScenarioState(id);
  const next = state.scenarioState;
  state.selected = {
    type: next.pods[0] ? "pod" : next.services[0] ? "service" : next.pvcs[0] ? "pvc" : next.roles[0] ? "role" : next.gpuNodes[0] ? "gpu-node" : "deployment",
    name: next.pods[0]?.name ?? next.services[0]?.name ?? next.pvcs[0]?.name ?? next.roles[0]?.name ?? next.gpuNodes[0]?.name ?? next.deployments[0]?.name ?? "",
  };
  state.output = `시나리오가 변경되었습니다. ${next.notes}`;
  addEvent(`시나리오 전환: ${next.title}`);
  addEvent(next.selectedHint);
  render();
}

function resolveSelected() {
  const { selected, scenarioState } = state;
  if (selected.type === "pod") return scenarioState.pods.find((item) => item.name === selected.name) ?? scenarioState.pods[0];
  if (selected.type === "service") return scenarioState.services.find((item) => item.name === selected.name) ?? scenarioState.services[0];
  if (selected.type === "pvc") return scenarioState.pvcs.find((item) => item.name === selected.name) ?? scenarioState.pvcs[0];
  if (selected.type === "role") return scenarioState.roles.find((item) => item.name === selected.name) ?? scenarioState.roles[0];
  if (selected.type === "gpu-node") return scenarioState.gpuNodes.find((item) => item.name === selected.name) ?? scenarioState.gpuNodes[0];
  if (selected.type === "gpu-pod") return scenarioState.gpuPods.find((item) => item.name === selected.name) ?? scenarioState.gpuPods[0];
  if (selected.type === "node") return scenarioState.nodes.find((item) => item.name === selected.name) ?? scenarioState.nodes[0];
  return scenarioState.deployments.find((item) => item.name === selected.name) ?? scenarioState.deployments[0];
}

function describe(item) {
  if (!item) return "왼쪽 보드에서 Pod, Node, Service, PVC, GPU를 눌러 보세요.";
  if ("gpuModel" in item) return "GPU 노드는 학습 워크로드를 받는 전용 대상입니다.";
  if ("requestGpu" in item) return item.status === "Running" ? "GPU 워크로드가 실행 중입니다." : "GPU 요청이 맞는 노드를 기다리고 있습니다.";
  if ("status" in item && "restarts" in item) return item.status === "Running" && item.ready ? "정상 Pod입니다." : "문제가 있는 Pod입니다. 로그와 상태를 함께 보세요.";
  if ("selector" in item) return item.endpoints.length > 0 ? "Service가 Pod를 정상적으로 찾고 있습니다." : "selector가 잘못되어 Endpoint가 비었습니다.";
  if ("request" in item) return item.status === "Bound" ? "PVC가 정상 바인딩되었습니다." : "PVC가 아직 바인딩되지 않았습니다.";
  if ("kind" in item) return item.binding ? "권한이 바인딩되어 있습니다." : "Role은 있지만 Binding이 없습니다.";
  if ("replicas" in item) return "Deployment는 원하는 Pod 수를 유지합니다.";
  if ("role" in item && "cpu" in item) return "Node는 Pod가 올라가는 대상이며 자원과 라벨이 중요합니다.";
  return "이 항목의 세부 정보를 확인하세요.";
}

function formatSelector(selector) {
  return Object.entries(selector).map(([key, value]) => `${key}=${value}`).join(", ");
}

function issueCards() {
  const s = state.scenarioState;
  const cards = [
    {
      label: "Pod 상태",
      value: s.pods.find((pod) => pod.status !== "Running" || !pod.ready)?.status ?? "정상",
      note: "readiness / logs / 재시작 수를 확인한다.",
      active: Boolean(s.pods.find((pod) => pod.status !== "Running" || !pod.ready)),
    },
    {
      label: "Service Endpoint",
      value: s.services.find((service) => service.endpoints.length === 0) ? "없음" : "연결됨",
      note: "selector와 label이 맞는지 본다.",
      active: Boolean(s.services.find((service) => service.endpoints.length === 0)),
    },
    {
      label: "PVC 상태",
      value: s.pvcs.find((pvc) => pvc.status !== "Bound")?.status ?? "Bound",
      note: "StorageClass를 확인한다.",
      active: Boolean(s.pvcs.find((pvc) => pvc.status !== "Bound")),
    },
    {
      label: "RBAC",
      value: s.roles.find((role) => !role.binding) ? "거부" : "허용",
      note: "RoleBinding 유무를 확인한다.",
      active: Boolean(s.roles.find((role) => !role.binding)),
    },
  ];
  if (s.gpuNodes.length) {
    cards.push({
      label: "GPU Pod",
      value: s.gpuPods.find((pod) => pod.status !== "Running")?.status ?? "Running",
      note: "GPU 노드가 필요한 상태다.",
      active: Boolean(s.gpuPods.find((pod) => pod.status !== "Running")),
    });
  }
  return cards;
}

function metrics() {
  const s = state.scenarioState;
  const readyPods = s.pods.filter((pod) => pod.ready).length;
  const issues = [
    ...s.pods.filter((pod) => pod.status !== "Running" || !pod.ready),
    ...s.services.filter((service) => service.endpoints.length === 0),
    ...s.pvcs.filter((pvc) => pvc.status !== "Bound"),
    ...s.roles.filter((role) => !role.binding),
    ...s.deployments.filter((deployment) => deployment.ready !== deployment.replicas),
    ...s.gpuPods.filter((pod) => pod.status !== "Running"),
  ].length;
  const gpuTotal = s.gpuNodes.reduce((sum, node) => sum + node.gpuTotal, 0);
  const gpuUsed = s.gpuNodes.reduce((sum, node) => sum + node.gpuUsed, 0);
  return [
    { label: "정상 Pod", value: `${readyPods}/${s.pods.length}` },
    { label: "문제 수", value: String(issues) },
    { label: "GPU 노드", value: String(s.gpuNodes.length || 0) },
    { label: "GPU 사용량", value: gpuTotal ? `${gpuUsed}/${gpuTotal}` : "0/0" },
  ];
}

function renderSidebar() {
  return SCENARIOS.map(
    (item) => `
      <button class="scenario-card ${item.id === state.scenarioId ? "active" : ""}" data-action="select-scenario" data-id="${item.id}">
        <div class="scenario-card-top">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.chapter)}</span>
        </div>
        <p>${escapeHtml(item.objective)}</p>
      </button>
    `
  ).join("");
}

function renderNodeGrid() {
  return state.scenarioState.nodes
    .map((node) => {
      const pods = state.scenarioState.pods.filter((pod) => pod.node === node.name);
      return `
        <button class="node-card big-card" data-action="select-node" data-id="${node.name}">
          <div class="card-head">
            <strong>${escapeHtml(node.name)}</strong>
            <span>${escapeHtml(node.role)}</span>
          </div>
          <div class="resource-bars">
            <div class="resource-line"><label>CPU</label><div class="bar"><i style="width:${node.cpu}%"></i></div><span>${node.cpu}%</span></div>
            <div class="resource-line"><label>Memory</label><div class="bar"><i style="width:${node.memory}%"></i></div><span>${node.memory}%</span></div>
          </div>
          <div class="chip-row">
            <span class="status green">${escapeHtml(node.status)}</span>
            ${node.labels ? Object.entries(node.labels).map(([k, v]) => `<span>${escapeHtml(k)}=${escapeHtml(v)}</span>`).join("") : ""}
          </div>
          <div class="pod-stack">
            ${
              pods.length
                ? pods
                    .map((pod) => `<span class="pod-pill ${pod.status === "Running" && pod.ready ? "green" : pod.status === "Pending" ? "amber" : "red"}" data-action="select-pod" data-id="${pod.name}">${escapeHtml(pod.name)}</span>`)
                    .join("")
                : '<span class="pod-pill">Pod 없음</span>'
            }
          </div>
        </button>
      `;
    })
    .join("");
}

function renderGpuGrid() {
  if (!state.scenarioState.gpuNodes.length) return "";
  return `
    <div class="gpu-zone big-card">
      <div class="card-head">
        <strong>GPU 영역</strong>
        <span>nvidia.com/gpu 가시화</span>
      </div>
      <div class="gpu-grid">
        ${state.scenarioState.gpuNodes
          .map(
            (node) => `
            <button class="gpu-card" data-action="select-gpu-node" data-id="${node.name}">
              <div class="gpu-top">
                <strong>${escapeHtml(node.name)}</strong>
                <span>${escapeHtml(node.gpuModel)}</span>
              </div>
              <div class="gpu-meter">
                <div class="bar gpu"><i style="width:${(node.gpuUsed / node.gpuTotal) * 100}%"></i></div>
                <span>${node.gpuUsed}/${node.gpuTotal}</span>
              </div>
              <div class="chip-row">
                <span class="status green">${escapeHtml(node.status)}</span>
                <span>GPU 할당</span>
                <span>${escapeHtml(node.labels.gpu)}</span>
              </div>
            </button>`
          )
          .join("")}
        <div class="gpu-card">
          <div class="gpu-top">
            <strong>GPU 워크로드</strong>
            <span>학습 / 추론</span>
          </div>
          <div class="gpu-workloads">
            ${state.scenarioState.gpuPods
              .map(
                (pod) => `
                  <button class="workload-pill ${pod.status === "Running" ? "green" : "amber"}" data-action="select-gpu-pod" data-id="${pod.name}">
                    <strong>${escapeHtml(pod.name)}</strong>
                    <span>${pod.requestGpu} GPU 요청</span>
                    <small>${escapeHtml(pod.note)}</small>
                  </button>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderServiceRow() {
  return state.scenarioState.services.length
    ? state.scenarioState.services
        .map(
          (service) => `
            <button class="service-card" data-action="select-service" data-id="${service.name}">
              <div class="service-top">
                <strong>${escapeHtml(service.name)}</strong>
                <span>${escapeHtml(service.type)}</span>
              </div>
              <div class="service-selector">${escapeHtml(formatSelector(service.selector))}</div>
              <div class="service-endpoint ${service.endpoints.length ? "active" : "empty"}">
                Endpoint ${service.endpoints.length ? `${service.endpoints.length}개 연결` : "없음"}
              </div>
            </button>`
        )
        .join("")
    : '<div class="muted">이 시나리오에는 Service가 없다.</div>';
}

function renderIssueRow() {
  return issueCards()
    .map(
      (item) => `
        <button class="issue-card ${item.active ? "active" : ""}" data-action="noop">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.value)}</span>
          <p>${escapeHtml(item.note)}</p>
        </button>`
    )
    .join("");
}

function renderDetailRows() {
  const item = resolveSelected();
  if (!item) return '<div class="muted">항목을 선택해 주세요.</div>';
  return Object.entries(item)
    .filter(([, value]) => typeof value !== "object" || value === null)
    .map(
      ([key, value]) => `
        <div class="detail-row">
          <span>${escapeHtml(key)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>`
    )
    .join("");
}

function renderTimeline() {
  return state.events
    .map(
      (event) => `
        <div class="timeline-item">
          <span>${escapeHtml(event.time)}</span>
          <p>${escapeHtml(event.text)}</p>
        </div>`
    )
    .join("");
}

function render() {
  const scenario = SCENARIOS.find((item) => item.id === state.scenarioId) ?? SCENARIOS[0];
  const selected = resolveSelected();
  const s = state.scenarioState;
  const gpuSection = renderGpuGrid();

  app.innerHTML = `
    <div class="app">
      <div class="shell">
        <aside class="sidebar glass">
          <div class="brand">
            <div class="brand-badge">CKA</div>
            <div>
              <h1>쿠버네티스 학습 보드</h1>
              <p>한눈에 구조를 보고, 바로 고치고, 결과를 확인하는 실전형 시뮬레이터</p>
            </div>
          </div>

          <div class="scenario-list">${renderSidebar()}</div>

          <div class="sidebar-footer">
            <div class="section-head">
              <h3>오늘의 핵심</h3>
              <span>${escapeHtml(scenario.chapter)}</span>
            </div>
            <p>${escapeHtml(scenario.hint)}</p>
            <div class="hint-box">${escapeHtml(s.selectedHint)}</div>
            <div class="hero-actions" style="margin-top: 12px;">
              <button class="button ${state.showHint ? "active" : ""}" data-action="toggle-hint">${state.showHint ? "힌트 숨기기" : "힌트 보기"}</button>
              <button class="button ${state.guided ? "active" : ""}" data-action="toggle-mode">${state.guided ? "가이드 모드" : "실전 모드"}</button>
            </div>
          </div>
        </aside>

        <main class="workspace">
          <header class="hero glass">
            <div>
              <div class="eyebrow">CKA / GPU 시뮬레이션</div>
              <h2>${escapeHtml(s.title)}</h2>
              <p>${escapeHtml(s.notes)}</p>
            </div>
            <div class="hero-actions">
              <button class="button ${state.guided ? "active" : ""}" data-action="toggle-mode">가이드 모드</button>
              <button class="button" data-action="reset-scenario">초기화</button>
            </div>
          </header>

          <section class="metrics">${metrics()
            .map(
              (item) => `
                <article class="metric glass">
                  <span>${escapeHtml(item.label)}</span>
                  <strong>${escapeHtml(item.value)}</strong>
                </article>`
            )
            .join("")}</section>

          <section class="board">
            <div class="cluster glass">
              <div class="section-head">
                <h3>클러스터 구조</h3>
                <span>${escapeHtml(s.mission)}</span>
              </div>

              <div class="cluster-canvas">
                <div class="flow-row">
                  <span class="flow-node">Control Plane</span>
                  <span class="flow-arrow">→</span>
                  <span class="flow-node">Node</span>
                  <span class="flow-arrow">→</span>
                  <span class="flow-node">Pod</span>
                  <span class="flow-arrow">→</span>
                  <span class="flow-node">Service</span>
                </div>

                <div class="big-card">
                  <div class="card-head">
                    <strong>Control Plane</strong>
                    <span>apiserver · scheduler · controller-manager · etcd</span>
                  </div>
                  <div class="flow-row">
                    <span class="flow-node">API 요청</span>
                    <span class="flow-node">상태 조정</span>
                    <span class="flow-node">스케줄링</span>
                    <span class="flow-node">클러스터 저장소</span>
                  </div>
                </div>

                <div class="node-grid">${renderNodeGrid()}</div>

                <div class="resource-row">
                  <div class="big-card">
                    <div class="card-head">
                      <strong>Service 흐름</strong>
                      <span>label → endpoint → Pod</span>
                    </div>
                    ${renderServiceRow()}
                  </div>

                  <div class="big-card">
                    <div class="card-head">
                      <strong>문제 지점</strong>
                      <span>지금 집중해야 할 부분</span>
                    </div>
                    <div class="issue-list">${renderIssueRow()}</div>
                  </div>
                </div>

                ${gpuSection}
              </div>
            </div>

            <aside class="inspector glass">
              <div class="section-head">
                <h3>상세 보기</h3>
                <span>선택한 리소스</span>
              </div>

              <div class="detail-hero">
                <div class="type-tag">${escapeHtml(state.selected.type)}</div>
                <h4>${escapeHtml(selected?.name ?? "선택된 항목 없음")}</h4>
                <p>${escapeHtml(describe(selected))}</p>
              </div>

              <div class="detail-list">${renderDetailRows()}</div>

              <div class="quick-actions">
                <button class="button" data-action="fix-pod">문제 Pod 복구</button>
                <button class="button" data-action="fix-service">Service 수정</button>
                <button class="button" data-action="fix-scheduling">스케줄링 수정</button>
                <button class="button" data-action="fix-storage">스토리지 수정</button>
                <button class="button" data-action="fix-rbac">RBAC 복구</button>
                <button class="button" data-action="fix-gpu">GPU 배치</button>
              </div>

              <div class="console-card">
                <div class="section-head">
                  <h3>kubectl</h3>
                  <span>시험형 입력</span>
                </div>
                <textarea id="command" placeholder="kubectl get pods">${escapeHtml(state.command)}</textarea>
                <div class="console-actions">
                  <button class="button primary" data-action="run-command">실행</button>
                  <button class="button" data-action="suggest-command">예시 불러오기</button>
                </div>
                <div class="output-box">${escapeHtml(state.output)}</div>
              </div>
            </aside>
          </section>

          <section class="bottom-grid">
            <div class="editor glass">
              <div class="section-head">
                <h3>YAML 편집기</h3>
                <span>Apply를 누르면 시뮬레이터에 반영</span>
              </div>
              <textarea id="manifest">${escapeHtml(state.manifest)}</textarea>
              <div class="console-actions">
                <button class="button primary" data-action="apply-manifest">적용</button>
                <button class="button" data-action="load-sample">샘플 불러오기</button>
              </div>
            </div>

            <div class="timeline glass">
              <div class="section-head">
                <h3>이벤트 로그</h3>
                <span>${state.events.length}개 기록</span>
              </div>
              <div class="timeline-list">${renderTimeline()}</div>
            </div>
          </section>
        </main>
      </div>
    </div>
  `;
}

function runCommand() {
  const input = state.command.trim();
  if (!input) {
    state.output = "명령어를 입력해 주세요.";
    render();
    return;
  }
  const tokens = input.split(/\s+/);
  if (tokens[0] !== "kubectl") {
    state.output = "이 시뮬레이터는 kubectl 명령만 처리합니다.";
    render();
    return;
  }
  const s = state.scenarioState;
  if (tokens[1] === "get") {
    if (tokens[2] === "pods" || tokens[2] === "po") {
      state.output = s.pods.map((pod) => `${pod.name}\t${pod.status}\t${pod.ready ? "1/1" : "0/1"}\t${pod.node ?? "<none>"}`).join("\n") || "Pod가 없습니다.";
      addEvent("Pod 목록을 확인했습니다.");
    } else if (tokens[2] === "svc" || tokens[2] === "services") {
      state.output = s.services.map((svc) => `${svc.name}\t${svc.type}\t${svc.port}\t${svc.endpoints.length}`).join("\n") || "Service가 없습니다.";
      addEvent("Service 목록을 확인했습니다.");
    } else if (tokens[2] === "nodes") {
      state.output = s.nodes.map((node) => `${node.name}\t${node.status}\tCPU ${node.cpu}%\tMEM ${node.memory}%`).concat(s.gpuNodes.map((node) => `${node.name}\tGPU ${node.gpuModel}\t${node.gpuUsed}/${node.gpuTotal}`)).join("\n");
      addEvent("Node 목록을 확인했습니다.");
    } else if (tokens[2] === "pvc" || tokens[2] === "pvcs" || tokens[2] === "persistentvolumeclaims") {
      state.output = s.pvcs.map((pvc) => `${pvc.name}\t${pvc.status}\t${pvc.storageClass}\t${pvc.request}`).join("\n") || "PVC가 없습니다.";
      addEvent("PVC 목록을 확인했습니다.");
    } else {
      state.output = `지원하지 않는 리소스입니다: ${tokens[2]}`;
    }
  } else if (tokens[1] === "describe" && tokens[2] === "pod") {
    const pod = s.pods.find((item) => item.name === tokens[3]) || s.gpuPods.find((item) => item.name === tokens[3]);
    if (!pod) {
      state.output = `Pod ${tokens[3]}을 찾을 수 없습니다.`;
    } else {
      state.selected = { type: "pod", name: pod.name };
      state.output = [`이름: ${pod.name}`, `상태: ${pod.status}`, `노드: ${pod.node ?? "Pending"}`, `이미지: ${pod.image}`, `로그: ${pod.logs}`].join("\n");
      addEvent(`Pod ${pod.name}의 상세를 확인했습니다.`);
    }
  } else if (tokens[1] === "describe" && tokens[2] === "svc") {
    const service = s.services.find((item) => item.name === tokens[3]);
    if (!service) {
      state.output = `Service ${tokens[3]}을 찾을 수 없습니다.`;
    } else {
      state.selected = { type: "service", name: service.name };
      state.output = [`이름: ${service.name}`, `셀렉터: ${formatSelector(service.selector)}`, `Endpoint: ${service.endpoints.join(", ") || "<없음>"}`].join("\n");
      addEvent(`Service ${service.name}의 상세를 확인했습니다.`);
    }
  } else if (tokens[1] === "logs") {
    const pod = s.pods.find((item) => item.name === tokens[2]) || s.gpuPods.find((item) => item.name === tokens[2]);
    state.output = pod ? pod.logs : `Pod ${tokens[2]}을 찾을 수 없습니다.`;
    if (pod) addEvent(`Pod ${pod.name}의 로그를 확인했습니다.`);
  } else if (tokens[1] === "delete" && tokens[2] === "pod") {
    const name = tokens[3];
    const pod = s.pods.find((item) => item.name === name);
    if (!pod) {
      state.output = `Pod ${name}을 찾을 수 없습니다.`;
    } else {
      const pods = s.pods.filter((item) => item.name !== name);
      const replacement = { ...pod, name: `${pod.owner}-${Math.floor(Math.random() * 9000 + 1000)}`, status: "Running", ready: true, restarts: 0, logs: "Deployment controller가 재생성했습니다." };
      state.scenarioState = { ...s, pods: [...pods, replacement] };
      state.output = `pod "${name}" deleted`;
      addEvent(`Pod ${name}을 삭제했고, Deployment가 다시 생성했습니다.`);
    }
  } else if (tokens[1] === "auth" && tokens[2] === "can-i") {
    state.output = s.roles.some((role) => role.binding) ? "yes" : "no";
    addEvent("RBAC 권한을 점검했습니다.");
  } else {
    state.output = `지원하지 않는 명령입니다: ${input}`;
  }
  state.command = "";
  render();
}

function applyManifest() {
  try {
    const lines = state.manifest.split("\n");
    const nameLine = lines.find((line) => line.trim().startsWith("name:"));
    const replicasLine = lines.find((line) => line.trim().startsWith("replicas:"));
    const imageLine = lines.find((line) => line.trim().startsWith("image:"));
    const name = nameLine ? nameLine.split(":").slice(1).join(":").trim() : "manifest-app";
    const replicas = replicasLine ? Number(replicasLine.split(":").slice(1).join(":").trim()) : 1;
    const image = imageLine ? imageLine.split(":").slice(1).join(":").trim() : "unknown";
    state.scenarioState = {
      ...state.scenarioState,
      deployments: [{ name, replicas, ready: replicas, image }],
      pods: Array.from({ length: replicas }, (_, index) => ({
        name: `${name}-${index + 1}`,
        owner: name,
        node: state.scenarioState.nodes[(index % Math.max(state.scenarioState.nodes.length - 1, 1)) + 1]?.name ?? state.scenarioState.nodes[0]?.name ?? null,
        status: "Running",
        ready: true,
        restarts: 0,
        labels: { app: name },
        ip: `10.42.${index}.${20 + index}`,
        image,
        logs: "매니페스트 적용으로 생성된 Pod입니다.",
      })),
    };
    state.output = `deployment/${name}을(를) 적용했습니다. replicas=${replicas}`;
    addEvent(`${name} Deployment를 적용했습니다.`);
  } catch (error) {
    state.output = `YAML 오류: ${error.message}`;
  }
  render();
}

function fix(kind) {
  const s = state.scenarioState;
  if (kind === "pod") {
    state.scenarioState = { ...s, pods: s.pods.map((pod) => (pod.status === "CrashLoopBackOff" ? { ...pod, status: "Running", ready: true, restarts: pod.restarts + 1, logs: "컨테이너가 다시 올라왔습니다." } : pod)) };
    state.output = "문제 Pod를 복구했습니다.";
    addEvent("문제 Pod를 정상 상태로 복구했습니다.");
  }
  if (kind === "service") {
    state.scenarioState = { ...s, services: s.services.map((service) => (service.name === "frontend" ? { ...service, selector: { app: "frontend" } } : service)) };
    state.output = "Service가 다시 Pod를 찾을 수 있습니다.";
    addEvent("Service selector를 수정했습니다.");
  }
  if (kind === "scheduling") {
    state.scenarioState = { ...s, pods: s.pods.map((pod) => (pod.status === "Pending" ? { ...pod, node: "worker-a", status: "Running", ready: true, logs: "worker-a에 스케줄되었습니다." } : pod)) };
    state.output = "Pod가 worker-a에 배치되었습니다.";
    addEvent("스케줄링 조건을 맞춰 Pod를 배치했습니다.");
  }
  if (kind === "storage") {
    state.scenarioState = { ...s, pvcs: s.pvcs.map((pvc) => (pvc.status === "Pending" ? { ...pvc, status: "Bound", storageClass: "standard", volume: "pv-001" } : pvc)) };
    state.output = "PVC가 Bound 되었습니다.";
    addEvent("PVC를 standard StorageClass에 바인딩했습니다.");
  }
  if (kind === "rbac") {
    state.scenarioState = { ...s, roles: s.roles.map((role) => ({ ...role, binding: true })) };
    state.output = "RBAC 권한이 복구되었습니다.";
    addEvent("RoleBinding을 복구했습니다.");
  }
  if (kind === "gpu") {
    state.scenarioState = {
      ...s,
      pods: s.pods.map((pod) => (pod.status === "Pending" ? { ...pod, status: "Running", ready: true, node: "gpu-worker-1", logs: "GPU 노드에서 실행 중입니다." } : pod)),
      gpuPods: s.gpuPods.map((pod, index) => (index === 0 ? { ...pod, status: "Running", note: "gpu-worker-1에 배치됨." } : pod)),
    };
    state.output = "GPU 워크로드가 실행 중입니다.";
    addEvent("GPU 워크로드를 GPU 노드에 배치했습니다.");
  }
  render();
}

function renderDuplicate() {
  const scenario = SCENARIOS.find((item) => item.id === state.scenarioId) ?? SCENARIOS[0];
  const s = state.scenarioState;
  const selected = resolveSelected();
  app.innerHTML = `
    <div class="app">
      <div class="shell">
        <aside class="sidebar glass">
          <div class="brand">
            <div class="brand-badge">CKA</div>
            <div>
              <h1>쿠버네티스 학습 보드</h1>
              <p>한눈에 구조를 보고, 바로 고치고, 결과를 확인하는 실전형 시뮬레이터</p>
            </div>
          </div>
          <div class="scenario-list">
            ${SCENARIOS.map(
              (item) => `
                <button class="scenario-card ${item.id === state.scenarioId ? "active" : ""}" data-action="select-scenario" data-id="${item.id}">
                  <div class="scenario-card-top">
                    <strong>${escapeHtml(item.title)}</strong>
                    <span>${escapeHtml(item.chapter)}</span>
                  </div>
                  <p>${escapeHtml(item.objective)}</p>
                </button>`
            ).join("")}
          </div>
          <div class="sidebar-footer">
            <div class="section-head">
              <h3>오늘의 핵심</h3>
              <span>${escapeHtml(scenario.chapter)}</span>
            </div>
            <p>${escapeHtml(scenario.hint)}</p>
            ${state.showHint ? `<div class="hint-box">${escapeHtml(s.selectedHint)}</div>` : ""}
            <div class="hero-actions" style="margin-top: 12px;">
              <button class="button ${state.showHint ? "active" : ""}" data-action="toggle-hint">${state.showHint ? "힌트 숨기기" : "힌트 보기"}</button>
              <button class="button ${state.guided ? "active" : ""}" data-action="toggle-mode">${state.guided ? "가이드 모드" : "실전 모드"}</button>
            </div>
          </div>
        </aside>

        <main class="workspace">
          <header class="hero glass">
            <div>
              <div class="eyebrow">CKA / GPU 시뮬레이션</div>
              <h2>${escapeHtml(s.title)}</h2>
              <p>${escapeHtml(s.notes)}</p>
            </div>
            <div class="hero-actions">
              <button class="button ${state.guided ? "active" : ""}" data-action="toggle-mode">가이드 모드</button>
              <button class="button" data-action="reset-scenario">초기화</button>
            </div>
          </header>

          <section class="metrics">
            ${metrics()
              .map(
                (item) => `
                  <article class="metric glass">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(item.value)}</strong>
                  </article>`
              )
              .join("")}
          </section>

          <section class="board">
            <div class="cluster glass">
              <div class="section-head">
                <h3>클러스터 구조</h3>
                <span>${escapeHtml(s.mission)}</span>
              </div>

              <div class="cluster-canvas">
                <div class="flow-row">
                  <span class="flow-node">Control Plane</span>
                  <span class="flow-arrow">→</span>
                  <span class="flow-node">Node</span>
                  <span class="flow-arrow">→</span>
                  <span class="flow-node">Pod</span>
                  <span class="flow-arrow">→</span>
                  <span class="flow-node">Service</span>
                </div>

                <div class="big-card">
                  <div class="card-head">
                    <strong>Control Plane</strong>
                    <span>apiserver · scheduler · controller-manager · etcd</span>
                  </div>
                  <div class="flow-row">
                    <span class="flow-node">API 요청</span>
                    <span class="flow-node">상태 조정</span>
                    <span class="flow-node">스케줄링</span>
                    <span class="flow-node">클러스터 저장소</span>
                  </div>
                </div>

                <div class="node-grid">
                  ${s.nodes
                    .map(
                      (node) => `
                        <button class="node-card big-card" data-action="select-node" data-id="${node.name}">
                          <div class="card-head">
                            <strong>${escapeHtml(node.name)}</strong>
                            <span>${escapeHtml(node.role)}</span>
                          </div>
                          <div class="resource-bars">
                            <div class="resource-line"><label>CPU</label><div class="bar"><i style="width:${node.cpu}%"></i></div><span>${node.cpu}%</span></div>
                            <div class="resource-line"><label>Memory</label><div class="bar"><i style="width:${node.memory}%"></i></div><span>${node.memory}%</span></div>
                          </div>
                          <div class="chip-row">
                            <span class="status green">${escapeHtml(node.status)}</span>
                            ${node.labels ? Object.entries(node.labels).map(([k, v]) => `<span>${escapeHtml(k)}=${escapeHtml(v)}</span>`).join("") : ""}
                          </div>
                          <div class="pod-stack">
                            ${
                              s.pods.filter((pod) => pod.node === node.name).length
                                ? s.pods
                                    .filter((pod) => pod.node === node.name)
                                    .map((pod) => `<span class="pod-pill ${pod.status === "Running" && pod.ready ? "green" : pod.status === "Pending" ? "amber" : "red"}" data-action="select-pod" data-id="${pod.name}">${escapeHtml(pod.name)}</span>`)
                                    .join("")
                                : '<span class="pod-pill">Pod 없음</span>'
                            }
                          </div>
                        </button>`
                    )
                    .join("")}
                </div>

                <div class="resource-row">
                  <div class="big-card">
                    <div class="card-head">
                      <strong>Service 흐름</strong>
                      <span>label → endpoint → Pod</span>
                    </div>
                    ${
                      s.services.length
                        ? s.services
                            .map(
                              (service) => `
                                <button class="service-card" data-action="select-service" data-id="${service.name}">
                                  <div class="service-top">
                                    <strong>${escapeHtml(service.name)}</strong>
                                    <span>${escapeHtml(service.type)}</span>
                                  </div>
                                  <div class="service-selector">${escapeHtml(formatSelector(service.selector))}</div>
                                  <div class="service-endpoint ${service.endpoints.length ? "active" : "empty"}">
                                    Endpoint ${service.endpoints.length ? `${service.endpoints.length}개 연결` : "없음"}
                                  </div>
                                </button>`
                            )
                            .join("")
                        : '<div class="muted">이 시나리오에는 Service가 없다.</div>'
                    }
                  </div>

                  <div class="big-card">
                    <div class="card-head">
                      <strong>문제 지점</strong>
                      <span>지금 집중해야 할 부분</span>
                    </div>
                    <div class="issue-list">
                      ${issueCards()
                        .map(
                          (item) => `
                            <button class="issue-card ${item.active ? "active" : ""}">
                              <strong>${escapeHtml(item.label)}</strong>
                              <span>${escapeHtml(item.value)}</span>
                              <p>${escapeHtml(item.note)}</p>
                            </button>`
                        )
                        .join("")}
                    </div>
                  </div>
                </div>

                ${s.gpuNodes.length ? `
                  <div class="gpu-zone big-card">
                    <div class="card-head">
                      <strong>GPU 영역</strong>
                      <span>nvidia.com/gpu 가시화</span>
                    </div>
                    <div class="gpu-grid">
                      ${s.gpuNodes
                        .map(
                          (node) => `
                            <button class="gpu-card" data-action="select-gpu-node" data-id="${node.name}">
                              <div class="gpu-top">
                                <strong>${escapeHtml(node.name)}</strong>
                                <span>${escapeHtml(node.gpuModel)}</span>
                              </div>
                              <div class="gpu-meter">
                                <div class="bar gpu"><i style="width:${(node.gpuUsed / node.gpuTotal) * 100}%"></i></div>
                                <span>${node.gpuUsed}/${node.gpuTotal}</span>
                              </div>
                              <div class="chip-row">
                                <span class="status green">${escapeHtml(node.status)}</span>
                                <span>GPU 할당</span>
                                <span>${escapeHtml(node.labels.gpu)}</span>
                              </div>
                            </button>`
                        )
                        .join("")}
                      <div class="gpu-card">
                        <div class="gpu-top">
                          <strong>GPU 워크로드</strong>
                          <span>학습 / 추론</span>
                        </div>
                        <div class="gpu-workloads">
                          ${s.gpuPods
                            .map(
                              (pod) => `
                                <button class="workload-pill ${pod.status === "Running" ? "green" : "amber"}" data-action="select-gpu-pod" data-id="${pod.name}">
                                  <strong>${escapeHtml(pod.name)}</strong>
                                  <span>${pod.requestGpu} GPU 요청</span>
                                  <small>${escapeHtml(pod.note)}</small>
                                </button>`
                            )
                            .join("")}
                        </div>
                      </div>
                    </div>
                  </div>` : ""}
              </div>
            </div>

            <aside class="inspector glass">
              <div class="section-head">
                <h3>상세 보기</h3>
                <span>선택한 리소스</span>
              </div>
              <div class="detail-hero">
                <div class="type-tag">${escapeHtml(state.selected.type)}</div>
                <h4>${escapeHtml(selected?.name ?? "선택된 항목 없음")}</h4>
                <p>${escapeHtml(describe(selected))}</p>
              </div>
              <div class="detail-list">
                ${selected
                  ? Object.entries(selected)
                      .filter(([, value]) => typeof value !== "object" || value === null)
                      .map(
                        ([key, value]) => `
                          <div class="detail-row">
                            <span>${escapeHtml(key)}</span>
                            <strong>${escapeHtml(value)}</strong>
                          </div>`
                      )
                      .join("")
                  : '<div class="muted">항목을 선택해 주세요.</div>'}
              </div>

              <div class="quick-actions">
                <button class="button" data-action="fix-pod">문제 Pod 복구</button>
                <button class="button" data-action="fix-service">Service 수정</button>
                <button class="button" data-action="fix-scheduling">스케줄링 수정</button>
                <button class="button" data-action="fix-storage">스토리지 수정</button>
                <button class="button" data-action="fix-rbac">RBAC 복구</button>
                <button class="button" data-action="fix-gpu">GPU 배치</button>
              </div>

              <div class="console-card">
                <div class="section-head">
                  <h3>kubectl</h3>
                  <span>시험형 입력</span>
                </div>
                <textarea id="command" placeholder="kubectl get pods">${escapeHtml(state.command)}</textarea>
                <div class="console-actions">
                  <button class="button primary" data-action="run-command">실행</button>
                  <button class="button" data-action="suggest-command">예시 불러오기</button>
                </div>
                <div class="output-box">${escapeHtml(state.output)}</div>
              </div>
            </aside>
          </section>

          <section class="bottom-grid">
            <div class="editor glass">
              <div class="section-head">
                <h3>YAML 편집기</h3>
                <span>Apply를 누르면 시뮬레이터에 반영</span>
              </div>
              <textarea id="manifest">${escapeHtml(state.manifest)}</textarea>
              <div class="console-actions">
                <button class="button primary" data-action="apply-manifest">적용</button>
                <button class="button" data-action="load-sample">샘플 불러오기</button>
              </div>
            </div>

            <div class="timeline glass">
              <div class="section-head">
                <h3>이벤트 로그</h3>
                <span>${state.events.length}개 기록</span>
              </div>
              <div class="timeline-list">
                ${state.events.map((event) => `<div class="timeline-item"><span>${escapeHtml(event.time)}</span><p>${escapeHtml(event.text)}</p></div>`).join("")}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  `;

  const command = document.querySelector("#command");
  const manifest = document.querySelector("#manifest");
  if (command) command.addEventListener("input", (event) => (state.command = event.target.value));
  if (manifest) manifest.addEventListener("input", (event) => (state.manifest = event.target.value));
}

app.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const { action, id } = actionButton.dataset;
  if (action === "select-scenario") return selectScenario(id);
  if (action === "select-node") {
    state.selected = { type: "node", name: id };
    render();
    return;
  }
  if (action === "select-pod") {
    state.selected = { type: "pod", name: id };
    render();
    return;
  }
  if (action === "select-service") {
    state.selected = { type: "service", name: id };
    render();
    return;
  }
  if (action === "select-gpu-node") {
    state.selected = { type: "gpu-node", name: id };
    render();
    return;
  }
  if (action === "select-gpu-pod") {
    state.selected = { type: "gpu-pod", name: id };
    render();
    return;
  }
  if (action === "toggle-hint") {
    state.showHint = !state.showHint;
    render();
    return;
  }
  if (action === "toggle-mode") {
    state.guided = !state.guided;
    render();
    return;
  }
  if (action === "reset-scenario") return selectScenario(state.scenarioId);
  if (action === "fix-pod") return fix("pod");
  if (action === "fix-service") return fix("service");
  if (action === "fix-scheduling") return fix("scheduling");
  if (action === "fix-storage") return fix("storage");
  if (action === "fix-rbac") return fix("rbac");
  if (action === "fix-gpu") return fix("gpu");
  if (action === "run-command") return runCommand();
  if (action === "suggest-command") {
    state.command = commandHints[(state.tick + 1) % commandHints.length];
    state.tick += 1;
    render();
    return;
  }
  if (action === "apply-manifest") return applyManifest();
  if (action === "load-sample") {
    state.manifest = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: lab-app
  namespace: demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: lab-app
  template:
    metadata:
      labels:
        app: lab-app
    spec:
      containers:
        - name: app
          image: ghcr.io/demo/lab-app:v1
          ports:
            - containerPort: 8080
`;
    render();
  }
});

render();
