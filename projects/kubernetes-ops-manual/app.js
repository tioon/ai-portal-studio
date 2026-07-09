const searchInput = document.querySelector("#searchInput");
const categoryRow = document.querySelector("#categoryRow");
const commandSections = document.querySelector("#commandSections");
const scenarioGrid = document.querySelector("#scenarioGrid");
const commandTemplate = document.querySelector("#commandTemplate");
const resultCount = document.querySelector("#resultCount");
const clearFilters = document.querySelector("#clearFilters");
const listTitle = document.querySelector("#listTitle");

const state = {
  category: "all",
  search: ""
};

const categories = [
  { id: "all", label: "전체" },
  { id: "cluster", label: "클러스터" },
  { id: "workload", label: "워크로드" },
  { id: "scheduling", label: "배치/노드" },
  { id: "network", label: "네트워크" },
  { id: "storage", label: "스토리지" },
  { id: "config", label: "설정" },
  { id: "security", label: "보안" },
  { id: "debug", label: "디버깅" },
  { id: "maintenance", label: "유지보수" },
  { id: "autoscaling", label: "오토스케일링" },
  { id: "helm", label: "Helm" },
  { id: "kustomize", label: "Kustomize" },
  { id: "runtime", label: "런타임" },
  { id: "etcd", label: "etcd" },
  { id: "local", label: "로컬 클러스터" }
];

const scenarios = [
  { id: "crashloop", label: "Pod 오류", note: "logs / describe / events", search: "CrashLoopBackOff logs describe events" },
  { id: "node", label: "Node 점검", note: "nodes / cordon / drain", search: "NotReady cordon drain describe node" },
  { id: "pvc", label: "PVC Pending", note: "pv / pvc / storageclass", search: "PVC Pending describe pvc storageclass pv" },
  { id: "ingress", label: "Ingress 404", note: "ingress / svc / endpoints", search: "Ingress 404 service endpoints ingress" },
  { id: "rbac", label: "권한 확인", note: "auth / role / binding", search: "auth can-i role rolebinding serviceaccount" },
  { id: "helm", label: "Helm 장애", note: "repo / install / rollback", search: "helm install upgrade rollback history" }
];

function C(command) {
  return {
    risk: "read",
    keywords: [],
    options: [],
    examples: [],
    warnings: [],
    related: [],
    ...command
  };
}

const COMMANDS = [
  C({
    id: "config-contexts",
    category: "cluster",
    title: "kubectl config get-contexts / use-context",
    command: "kubectl config get-contexts && kubectl config use-context <context>",
    summary: "현재 kubeconfig에 있는 컨텍스트를 보고, 작업 대상 클러스터로 전환합니다.",
    risk: "modify",
    keywords: ["context", "kubeconfig", "cluster switch"],
    options: [
      { flag: "get-contexts", desc: "등록된 컨텍스트와 현재 선택 상태를 확인" },
      { flag: "current-context", desc: "현재 사용 중인 컨텍스트 확인" },
      { flag: "use-context", desc: "작업 대상 컨텍스트로 전환" }
    ],
    examples: [
      { label: "컨텍스트 확인", code: "kubectl config get-contexts" },
      { label: "전환", code: "kubectl config use-context prod-cluster" }
    ],
    warnings: ["잘못된 컨텍스트에서 apply/delete 하면 다른 클러스터를 건드릴 수 있습니다."],
    related: ["config-view", "cluster-info", "cluster-version"]
  }),
  C({
    id: "config-view",
    category: "cluster",
    title: "kubectl config view",
    command: "kubectl config view --minify",
    summary: "현재 kubeconfig 내용과 인증 정보를 확인합니다.",
    risk: "read",
    keywords: ["kubeconfig", "user", "cluster", "endpoint"],
    options: [
      { flag: "--minify", desc: "현재 컨텍스트만 축약해 표시" },
      { flag: "--raw", desc: "base64 인코딩 없이 원본 표시" },
      { flag: "--flatten", desc: "참조된 설정을 하나로 병합" }
    ],
    examples: [
      { label: "현재 설정", code: "kubectl config view --minify" },
      { label: "원본 확인", code: "kubectl config view --raw" }
    ],
    warnings: ["민감한 인증 정보가 포함될 수 있으니 공유 시 주의하세요."],
    related: ["config-contexts", "rbac-can-i", "cluster-version"]
  }),
  C({
    id: "cluster-info",
    category: "cluster",
    title: "kubectl cluster-info",
    command: "kubectl cluster-info",
    summary: "API Server와 컨트롤플레인 엔드포인트를 빠르게 확인합니다.",
    risk: "read",
    keywords: ["control plane", "apiserver", "endpoint"],
    options: [
      { flag: "cluster-info dump", desc: "클러스터 관련 리소스와 설정을 덤프" }
    ],
    examples: [{ label: "클러스터 정보", code: "kubectl cluster-info" }],
    warnings: ["API Server 접근이 안 되면 kubeconfig나 네트워크부터 확인하세요."],
    related: ["config-view", "cluster-version", "api-resources"]
  }),
  C({
    id: "cluster-version",
    category: "cluster",
    title: "kubectl version",
    command: "kubectl version --short",
    summary: "클라이언트와 서버의 Kubernetes 버전을 확인합니다.",
    risk: "read",
    keywords: ["version", "server", "client"],
    options: [
      { flag: "--short", desc: "간단한 형태로 표시" },
      { flag: "--output yaml", desc: "YAML 형태로 출력" }
    ],
    examples: [
      { label: "버전 확인", code: "kubectl version --short" },
      { label: "상세 출력", code: "kubectl version -o yaml" }
    ],
    warnings: ["클라이언트와 서버 버전 차이가 크면 기능 차이를 먼저 의심하세요."],
    related: ["cluster-info", "config-view", "api-versions"]
  }),
  C({
    id: "api-resources",
    category: "cluster",
    title: "kubectl api-resources",
    command: "kubectl api-resources",
    summary: "현재 클러스터에서 사용할 수 있는 리소스 종류를 봅니다.",
    risk: "read",
    keywords: ["resource", "kind", "verbs", "group"],
    options: [
      { flag: "-o name", desc: "리소스 이름만 출력" },
      { flag: "--namespaced", desc: "네임스페이스 리소스만 필터" },
      { flag: "--verbs=list", desc: "지원 verb 기준 필터" }
    ],
    examples: [
      { label: "리소스 목록", code: "kubectl api-resources" },
      { label: "이름만", code: "kubectl api-resources -o name" }
    ],
    warnings: ["새 CRD가 안 보이면 아직 API 등록이 안 됐을 수 있습니다."],
    related: ["api-versions", "explain", "get-all"]
  }),
  C({
    id: "api-versions",
    category: "cluster",
    title: "kubectl api-versions",
    command: "kubectl api-versions",
    summary: "현재 클러스터가 노출하는 API 버전을 확인합니다.",
    risk: "read",
    keywords: ["api", "version", "group"],
    options: [{ flag: "api-versions", desc: "지원 버전 나열" }],
    examples: [{ label: "API 버전", code: "kubectl api-versions" }],
    warnings: ["리소스 종류와 버전은 api-resources와 함께 보는 편이 좋습니다."],
    related: ["api-resources", "explain", "cluster-version"]
  }),
  C({
    id: "namespace",
    category: "cluster",
    title: "kubectl get namespace / create namespace / delete namespace",
    command: "kubectl get ns -A",
    summary: "네임스페이스를 보고 만들고 지웁니다.",
    risk: "modify",
    keywords: ["namespace", "ns", "isolation", "delete"],
    options: [
      { flag: "get ns", desc: "네임스페이스 목록" },
      { flag: "create namespace", desc: "새 네임스페이스 생성" },
      { flag: "delete namespace", desc: "네임스페이스 삭제" }
    ],
    examples: [
      { label: "목록", code: "kubectl get ns" },
      { label: "생성", code: "kubectl create namespace prod" }
    ],
    warnings: ["namespace 삭제는 그 안의 리소스를 대부분 함께 없앱니다."],
    related: ["config-contexts", "get-all", "rbac-can-i"]
  }),
  C({
    id: "explain",
    category: "cluster",
    title: "kubectl explain",
    command: "kubectl explain deployment.spec.template.spec",
    summary: "리소스 필드 구조와 의미를 문서처럼 확인합니다.",
    risk: "read",
    keywords: ["schema", "field", "docs"],
    options: [
      { flag: "--recursive", desc: "하위 필드까지 재귀적으로 출력" },
      { flag: "-o yaml", desc: "YAML 스타일로 보여줌" }
    ],
    examples: [
      { label: "Deployment 스펙", code: "kubectl explain deployment.spec.template.spec" },
      { label: "Pod 스펙", code: "kubectl explain pod.spec --recursive" }
    ],
    warnings: ["리소스 버전에 따라 필드가 다를 수 있습니다."],
    related: ["api-resources", "api-versions", "apply"]
  }),
  C({
    id: "get-all",
    category: "debug",
    title: "kubectl get all",
    command: "kubectl get all -A",
    summary: "네임스페이스 전체의 핵심 리소스를 한 번에 봅니다.",
    risk: "read",
    keywords: ["overview", "resources", "namespace"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스 대상" },
      { flag: "-o wide", desc: "추가 열까지 표시" },
      { flag: "--show-labels", desc: "라벨까지 표시" }
    ],
    examples: [
      { label: "전체 보기", code: "kubectl get all -A" },
      { label: "넓게 보기", code: "kubectl get all -A -o wide" }
    ],
    warnings: ["all은 모든 리소스를 의미하지 않고 자주 쓰는 핵심 리소스 묶음입니다."],
    related: ["get-pods", "get-events", "cluster-info"]
  }),
  C({
    id: "get-events",
    category: "debug",
    title: "kubectl get events",
    command: "kubectl get events -A --sort-by=.metadata.creationTimestamp",
    summary: "이벤트를 시간순으로 정렬해 최근 문제를 확인합니다.",
    risk: "read",
    keywords: ["event", "timeline", "warning"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "--sort-by", desc: "정렬 기준 지정" },
      { flag: "--field-selector", desc: "이벤트 종류 필터" }
    ],
    examples: [
      { label: "최근 이벤트", code: "kubectl get events -A --sort-by=.metadata.creationTimestamp" },
      { label: "경고만", code: "kubectl get events -A --field-selector type=Warning" }
    ],
    warnings: ["이벤트는 빠르게 사라질 수 있으니 장애 직후 보는 것이 좋습니다."],
    related: ["describe", "logs", "get-all"]
  }),
  C({
    id: "get-pods",
    category: "workload",
    title: "kubectl get pods",
    command: "kubectl get pods -A -o wide",
    summary: "Pod 상태와 노드, IP, readiness를 빠르게 확인합니다.",
    risk: "read",
    keywords: ["pod", "status", "ip", "wide"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "-o wide", desc: "노드, IP 등 추가 정보" },
      { flag: "--show-labels", desc: "라벨 표시" },
      { flag: "--field-selector", desc: "상태 필터" }
    ],
    examples: [
      { label: "전체 Pod", code: "kubectl get pods -A -o wide" },
      { label: "실패 Pod", code: "kubectl get pods -A --field-selector status.phase=Failed" }
    ],
    warnings: ["CrashLoopBackOff는 get만으로는 부족하고 logs/describe가 필요합니다."],
    related: ["describe", "logs", "get-events", "top-pods"]
  }),
  C({
    id: "get-deployments",
    category: "workload",
    title: "kubectl get deployments",
    command: "kubectl get deploy -A -o wide",
    summary: "Deployment 목록과 replica 상태를 확인합니다.",
    risk: "read",
    keywords: ["deployment", "deploy", "replica", "rollout"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "-o wide", desc: "추가 열 표시" },
      { flag: "--show-labels", desc: "라벨 표시" },
      { flag: "--sort-by", desc: "정렬 기준 지정" }
    ],
    examples: [
      { label: "Deployment 목록", code: "kubectl get deploy -A -o wide" },
      { label: "특정 네임스페이스", code: "kubectl get deploy -n prod" }
    ],
    warnings: ["Deployment는 rollout과 함께 봐야 실제 배포 상태를 알 수 있습니다."],
    related: ["describe-deployment", "rollout-status", "scale", "set-image"]
  }),
  C({
    id: "get-statefulsets",
    category: "workload",
    title: "kubectl get statefulsets",
    command: "kubectl get sts -A -o wide",
    summary: "StatefulSet 목록과 순번, replica 상태를 확인합니다.",
    risk: "read",
    keywords: ["statefulset", "sts", "ordered", "persistent"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "-o wide", desc: "추가 열 표시" },
      { flag: "--show-labels", desc: "라벨 표시" },
      { flag: "--sort-by", desc: "정렬 기준 지정" }
    ],
    examples: [
      { label: "StatefulSet 목록", code: "kubectl get sts -A -o wide" },
      { label: "특정 네임스페이스", code: "kubectl get sts -n prod" }
    ],
    warnings: ["StatefulSet은 순서와 PVC가 중요해서 pod만 보지 말고 함께 확인해야 합니다."],
    related: ["describe-statefulset", "get-pods", "get-events", "storageclass"]
  }),
  C({
    id: "get-daemonsets",
    category: "workload",
    title: "kubectl get daemonsets",
    command: "kubectl get ds -A -o wide",
    summary: "DaemonSet이 각 노드에 정상적으로 붙었는지 확인합니다.",
    risk: "read",
    keywords: ["daemonset", "ds", "node", "agent"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "-o wide", desc: "추가 열 표시" },
      { flag: "--show-labels", desc: "라벨 표시" },
      { flag: "--sort-by", desc: "정렬 기준 지정" }
    ],
    examples: [
      { label: "DaemonSet 목록", code: "kubectl get ds -A -o wide" },
      { label: "특정 네임스페이스", code: "kubectl get ds -n kube-system" }
    ],
    warnings: ["DaemonSet은 노드별 에이전트 성격이라 Desired와 Current 수치 차이를 꼭 봐야 합니다."],
    related: ["describe-daemonset", "get-nodes", "get-pods", "get-events"]
  }),
  C({
    id: "get-replicasets",
    category: "workload",
    title: "kubectl get replicasets",
    command: "kubectl get rs -A -o wide",
    summary: "ReplicaSet 목록과 실제 파드 생성 상태를 확인합니다.",
    risk: "read",
    keywords: ["replicaset", "rs", "owner", "deployment"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "-o wide", desc: "추가 열 표시" },
      { flag: "--show-labels", desc: "라벨 표시" },
      { flag: "--sort-by", desc: "정렬 기준 지정" }
    ],
    examples: [
      { label: "ReplicaSet 목록", code: "kubectl get rs -A -o wide" },
      { label: "특정 네임스페이스", code: "kubectl get rs -n prod" }
    ],
    warnings: ["Deployment 문제를 볼 때 ReplicaSet도 같이 보면 롤아웃 히스토리가 보입니다."],
    related: ["describe-replicaset", "get-deployments", "get-pods", "rollout-history"]
  }),
  C({
    id: "get-jobs",
    category: "workload",
    title: "kubectl get jobs",
    command: "kubectl get jobs -A -o wide",
    summary: "Job 실행 완료 여부와 실패 횟수를 확인합니다.",
    risk: "read",
    keywords: ["job", "batch", "completion", "backoff"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "-o wide", desc: "추가 열 표시" },
      { flag: "--show-labels", desc: "라벨 표시" },
      { flag: "--sort-by", desc: "정렬 기준 지정" }
    ],
    examples: [
      { label: "Job 목록", code: "kubectl get jobs -A -o wide" },
      { label: "특정 네임스페이스", code: "kubectl get jobs -n prod" }
    ],
    warnings: ["완료되지 않는 Job은 Pod 로그와 backoff 횟수를 같이 봐야 합니다."],
    related: ["describe-job", "get-pods", "get-events"]
  }),
  C({
    id: "get-cronjobs",
    category: "workload",
    title: "kubectl get cronjobs",
    command: "kubectl get cronjobs -A -o wide",
    summary: "CronJob 스케줄과 다음 실행 시점을 확인합니다.",
    risk: "read",
    keywords: ["cronjob", "schedule", "batch", "job"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "-o wide", desc: "추가 열 표시" },
      { flag: "--show-labels", desc: "라벨 표시" },
      { flag: "--sort-by", desc: "정렬 기준 지정" }
    ],
    examples: [
      { label: "CronJob 목록", code: "kubectl get cronjobs -A -o wide" },
      { label: "특정 네임스페이스", code: "kubectl get cronjobs -n prod" }
    ],
    warnings: ["스케줄이 맞아도 Job이 실패하면 실제 작업은 수행되지 않습니다."],
    related: ["describe-cronjob", "get-jobs", "get-events"]
  }),
  C({
    id: "describe-deployment",
    category: "debug",
    title: "kubectl describe deployment",
    command: "kubectl describe deployment <name>",
    summary: "Deployment의 rollout 설정, 이벤트, replica 상태를 자세히 봅니다.",
    risk: "read",
    keywords: ["deployment", "describe", "rollout", "strategy"],
    options: [
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "Deployment 상세", code: "kubectl describe deployment myapp -n prod" }
    ],
    warnings: ["ReplicaSet 생성 실패나 이미지 pull 실패는 events에서 같이 확인해야 합니다."],
    related: ["get-deployments", "rollout-status", "get-events"]
  }),
  C({
    id: "describe-statefulset",
    category: "debug",
    title: "kubectl describe statefulset",
    command: "kubectl describe statefulset <name>",
    summary: "StatefulSet의 순서, volumeClaimTemplate, 이벤트를 자세히 봅니다.",
    risk: "read",
    keywords: ["statefulset", "describe", "pvc", "ordinal"],
    options: [
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "StatefulSet 상세", code: "kubectl describe statefulset mysql -n prod" }
    ],
    warnings: ["StatefulSet은 PVC 결합 상태를 같이 봐야 원인을 놓치지 않습니다."],
    related: ["get-statefulsets", "get-pods", "get-events", "pvc"]
  }),
  C({
    id: "describe-daemonset",
    category: "debug",
    title: "kubectl describe daemonset",
    command: "kubectl describe daemonset <name>",
    summary: "DaemonSet의 노드 배치, 업데이트 전략, 이벤트를 봅니다.",
    risk: "read",
    keywords: ["daemonset", "describe", "node", "agent"],
    options: [
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "DaemonSet 상세", code: "kubectl describe daemonset fluent-bit -n kube-system" }
    ],
    warnings: ["일부 노드에만 안 붙는 경우 노드 taint와 toleration을 같이 확인하세요."],
    related: ["get-daemonsets", "get-nodes", "get-events"]
  }),
  C({
    id: "describe-replicaset",
    category: "debug",
    title: "kubectl describe replicaset",
    command: "kubectl describe replicaset <name>",
    summary: "ReplicaSet이 어떤 Pod를 만들고 있는지 자세히 봅니다.",
    risk: "read",
    keywords: ["replicaset", "describe", "owner", "pod"],
    options: [
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "ReplicaSet 상세", code: "kubectl describe replicaset myapp-6d7f8d9b7b -n prod" }
    ],
    warnings: ["ReplicaSet은 보통 Deployment가 관리하므로 원인 분석 시 상위 리소스도 같이 봐야 합니다."],
    related: ["get-replicasets", "get-deployments", "get-pods"]
  }),
  C({
    id: "describe-job",
    category: "debug",
    title: "kubectl describe job",
    command: "kubectl describe job <name>",
    summary: "Job의 완료/실패 원인과 생성된 Pod 이벤트를 봅니다.",
    risk: "read",
    keywords: ["job", "describe", "batch", "backoff"],
    options: [
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "Job 상세", code: "kubectl describe job backup-daily -n prod" }
    ],
    warnings: ["Job 실패는 Pod 로그와 함께 봐야 정확합니다."],
    related: ["get-jobs", "get-pods", "get-events"]
  }),
  C({
    id: "describe-cronjob",
    category: "debug",
    title: "kubectl describe cronjob",
    command: "kubectl describe cronjob <name>",
    summary: "CronJob 스케줄, 마지막 실행, 생성 규칙을 자세히 봅니다.",
    risk: "read",
    keywords: ["cronjob", "describe", "schedule", "job"],
    options: [
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "CronJob 상세", code: "kubectl describe cronjob backup-daily -n prod" }
    ],
    warnings: ["시간대와 스케줄 표현식을 같이 확인해야 실제 실행 시점을 놓치지 않습니다."],
    related: ["get-cronjobs", "get-jobs", "get-events"]
  }),
  C({
    id: "describe",
    category: "debug",
    title: "kubectl describe",
    command: "kubectl describe pod <pod>",
    summary: "리소스 상태와 이벤트를 가장 자세하게 봅니다.",
    risk: "read",
    keywords: ["detail", "events", "status", "debug"],
    options: [
      { flag: "pod/node/svc", desc: "대상 리소스를 지정" },
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "Pod 상세", code: "kubectl describe pod my-pod -n prod" },
      { label: "Node 상세", code: "kubectl describe node worker-1" }
    ],
    warnings: ["이벤트가 길면 마지막 부분부터 원인을 찾는 편이 빠릅니다."],
    related: ["get-events", "logs", "get-pods"]
  }),
  C({
    id: "logs",
    category: "debug",
    title: "kubectl logs",
    command: "kubectl logs -f <pod> -c <container>",
    summary: "컨테이너 로그를 확인하고 실시간으로 추적합니다.",
    risk: "read",
    keywords: ["log", "follow", "container", "previous"],
    options: [
      { flag: "-f", desc: "실시간 추적" },
      { flag: "-c", desc: "컨테이너 지정" },
      { flag: "--previous", desc: "이전 컨테이너 로그" },
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "실시간 로그", code: "kubectl logs -f deploy/myapp -c app -n prod" },
      { label: "이전 로그", code: "kubectl logs pod/myapp --previous" }
    ],
    warnings: ["재시작 직후에는 --previous가 더 중요한 경우가 많습니다."],
    related: ["describe", "exec", "get-events", "debug-pod"]
  }),
  C({
    id: "exec",
    category: "debug",
    title: "kubectl exec",
    command: "kubectl exec -it <pod> -- /bin/sh",
    summary: "Pod 안으로 들어가서 내부 상태를 확인합니다.",
    risk: "modify",
    keywords: ["shell", "inspect", "container", "interactive"],
    options: [
      { flag: "-it", desc: "인터랙티브 셸" },
      { flag: "-c", desc: "컨테이너 지정" },
      { flag: "--", desc: "실행할 명령 구분" }
    ],
    examples: [
      { label: "셸 진입", code: "kubectl exec -it my-pod -- /bin/sh" },
      { label: "명령만 실행", code: "kubectl exec my-pod -- cat /etc/resolv.conf" }
    ],
    warnings: ["운영 Pod 안에서 수동 변경은 재현성과 추적성을 떨어뜨릴 수 있습니다."],
    related: ["logs", "cp", "debug-pod", "get-pods"]
  }),
  C({
    id: "cp",
    category: "debug",
    title: "kubectl cp",
    command: "kubectl cp <pod>:/path ./path",
    summary: "Pod와 로컬/원격 사이에서 파일을 복사합니다.",
    risk: "modify",
    keywords: ["copy", "file", "transfer"],
    options: [
      { flag: "-c", desc: "컨테이너 지정" },
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "Pod에서 로컬로", code: "kubectl cp my-pod:/tmp/app.log ./app.log" },
      { label: "로컬에서 Pod로", code: "kubectl cp ./config.yml my-pod:/tmp/config.yml" }
    ],
    warnings: ["대용량 파일은 느릴 수 있고, 권한 문제도 자주 발생합니다."],
    related: ["exec", "logs", "debug-pod"]
  }),
  C({
    id: "debug-pod",
    category: "debug",
    title: "kubectl debug",
    command: "kubectl debug node/<node> -it --image=nicolaka/netshoot",
    summary: "디버그용 ephemeral container나 node debug를 띄웁니다.",
    risk: "modify",
    keywords: ["ephemeral", "netshoot", "node debug"],
    options: [
      { flag: "node/<node>", desc: "노드 대상 디버그" },
      { flag: "-it", desc: "인터랙티브" },
      { flag: "--image", desc: "디버그 이미지 지정" },
      { flag: "--target", desc: "기존 컨테이너에 붙기" }
    ],
    examples: [
      { label: "노드 디버그", code: "kubectl debug node/worker-1 -it --image=nicolaka/netshoot" },
      { label: "Pod 타깃", code: "kubectl debug pod/my-pod -it --image=nicolaka/netshoot --target=app" }
    ],
    warnings: ["디버그 컨테이너는 환경에 따라 RBAC와 PSP/PSA 제약을 받습니다."],
    related: ["logs", "exec", "cp"]
  }),
  C({
    id: "apply",
    category: "workload",
    title: "kubectl apply",
    command: "kubectl apply -f .",
    summary: "매니페스트를 클러스터에 반영합니다.",
    risk: "modify",
    keywords: ["deploy", "manifest", "yaml", "server-side"],
    options: [
      { flag: "-f", desc: "파일 또는 디렉토리 적용" },
      { flag: "-k", desc: "Kustomize 적용" },
      { flag: "--server-side", desc: "서버 사이드 적용" },
      { flag: "--prune", desc: "관리 대상 외 리소스 정리" }
    ],
    examples: [
      { label: "파일 적용", code: "kubectl apply -f deployment.yaml" },
      { label: "디렉토리 적용", code: "kubectl apply -f ." }
    ],
    warnings: ["apply 전에 diff나 dry-run으로 변경 내용을 먼저 보는 습관이 좋습니다."],
    related: ["diff", "delete", "edit", "kustomize-apply"]
  }),
  C({
    id: "delete",
    category: "workload",
    title: "kubectl delete",
    command: "kubectl delete -f .",
    summary: "리소스를 삭제합니다.",
    risk: "danger",
    keywords: ["remove", "destroy", "cleanup"],
    options: [
      { flag: "-f", desc: "파일 또는 디렉토리 기준 삭제" },
      { flag: "-l", desc: "라벨 셀렉터로 삭제" },
      { flag: "--force", desc: "강제 삭제" },
      { flag: "--grace-period=0", desc: "즉시 종료" }
    ],
    examples: [
      { label: "매니페스트 삭제", code: "kubectl delete -f deployment.yaml" },
      { label: "라벨로 삭제", code: "kubectl delete pod -l app=myapp" }
    ],
    warnings: ["강제 삭제는 데이터 손실과 종료 지연 문제를 만들 수 있습니다."],
    related: ["apply", "patch", "edit", "rollout-undo"]
  }),
  C({
    id: "patch",
    category: "workload",
    title: "kubectl patch",
    command: "kubectl patch deployment <name> -p '{...}'",
    summary: "리소스의 일부 필드만 빠르게 수정합니다.",
    risk: "modify",
    keywords: ["json patch", "merge patch", "update"],
    options: [
      { flag: "--type merge", desc: "머지 패치" },
      { flag: "--type json", desc: "JSON patch" },
      { flag: "--subresource", desc: "서브리소스 수정" }
    ],
    examples: [
      { label: "레플리카 수정", code: "kubectl patch deployment myapp -p '{\"spec\":{\"replicas\":3}}'" },
      { label: "이미지 변경", code: "kubectl set image deployment/myapp app=myapp:v2" }
    ],
    warnings: ["패치 내용은 작지만 영향은 큽니다. 변경 후 rollout 상태를 확인하세요."],
    related: ["edit", "scale", "set-image", "apply"]
  }),
  C({
    id: "edit",
    category: "workload",
    title: "kubectl edit",
    command: "kubectl edit deployment/<name>",
    summary: "리소스를 직접 편집합니다.",
    risk: "danger",
    keywords: ["vim", "live edit", "manual change"],
    options: [
      { flag: "--record", desc: "변경 기록(구버전에서 사용)" },
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "Deployment 편집", code: "kubectl edit deployment/myapp" },
      { label: "ConfigMap 편집", code: "kubectl edit configmap myapp-config" }
    ],
    warnings: ["실수 방지를 위해 저장 전 diff를 먼저 확인하는 습관이 좋습니다."],
    related: ["apply", "patch", "diff", "rollout-status"]
  }),
  C({
    id: "rollout-status",
    category: "workload",
    title: "kubectl rollout status",
    command: "kubectl rollout status deployment/<name>",
    summary: "배포 롤아웃 진행 상태를 봅니다.",
    risk: "read",
    keywords: ["rollout", "status", "progress"],
    options: [
      { flag: "--watch", desc: "실시간 상태 추적" },
      { flag: "--timeout", desc: "대기 시간 지정" }
    ],
    examples: [
      { label: "배포 상태", code: "kubectl rollout status deployment/myapp" },
      { label: "타임아웃 지정", code: "kubectl rollout status deployment/myapp --timeout=120s" }
    ],
    warnings: ["배포가 멈추면 새 Replica가 Ready가 되는지, 이미지 pull이 되는지 같이 봐야 합니다."],
    related: ["rollout-history", "rollout-undo", "logs", "get-events"]
  }),
  C({
    id: "rollout-history",
    category: "workload",
    title: "kubectl rollout history",
    command: "kubectl rollout history deployment/<name>",
    summary: "Deployment 롤아웃 이력을 봅니다.",
    risk: "read",
    keywords: ["history", "revision", "deployment"],
    options: [
      { flag: "--revision", desc: "특정 리비전 상세" }
    ],
    examples: [
      { label: "이력", code: "kubectl rollout history deployment/myapp" },
      { label: "특정 리비전", code: "kubectl rollout history deployment/myapp --revision=3" }
    ],
    warnings: ["문제 버전으로 되돌릴 때 revision을 잘 확인하세요."],
    related: ["rollout-status", "rollout-undo", "set-image"]
  }),
  C({
    id: "rollout-undo",
    category: "workload",
    title: "kubectl rollout undo",
    command: "kubectl rollout undo deployment/<name>",
    summary: "이전 리비전으로 되돌립니다.",
    risk: "danger",
    keywords: ["rollback", "revert", "revision"],
    options: [
      { flag: "--to-revision", desc: "특정 리비전으로 롤백" }
    ],
    examples: [
      { label: "이전 버전으로", code: "kubectl rollout undo deployment/myapp" },
      { label: "특정 리비전", code: "kubectl rollout undo deployment/myapp --to-revision=3" }
    ],
    warnings: ["롤백 전에 현재 상태와 원인을 먼저 기록해두는 게 좋습니다."],
    related: ["rollout-history", "rollout-status", "set-image"]
  }),
  C({
    id: "rollout-restart",
    category: "workload",
    title: "kubectl rollout restart",
    command: "kubectl rollout restart deployment/<name>",
    summary: "Pod를 순차적으로 다시 띄워 설정 반영을 유도합니다.",
    risk: "modify",
    keywords: ["restart", "refresh", "deployment"],
    options: [
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "재시작", code: "kubectl rollout restart deployment/myapp" }
    ],
    warnings: ["실제 설정 반영이 안 될 때만 쓰지 말고, 원인 확인 후 사용하세요."],
    related: ["rollout-status", "edit", "apply"]
  }),
  C({
    id: "scale",
    category: "workload",
    title: "kubectl scale",
    command: "kubectl scale deployment/<name> --replicas=3",
    summary: "Replica 수를 늘리거나 줄입니다.",
    risk: "modify",
    keywords: ["replicas", "hpa", "capacity"],
    options: [
      { flag: "--replicas", desc: "원하는 개수 지정" },
      { flag: "-n", desc: "네임스페이스 지정" }
    ],
    examples: [
      { label: "3개로", code: "kubectl scale deployment/myapp --replicas=3" }
    ],
    warnings: ["트래픽이 늘었다고 무작정 늘리기 전에 자원과 HPA 설정을 봐야 합니다."],
    related: ["hpa", "top-pods", "set-image"]
  }),
  C({
    id: "set-image",
    category: "workload",
    title: "kubectl set image",
    command: "kubectl set image deployment/<name> app=image:tag",
    summary: "Deployment의 이미지를 빠르게 바꿉니다.",
    risk: "modify",
    keywords: ["image", "deploy", "update"],
    options: [
      { flag: "deployment/<name>", desc: "대상 리소스" },
      { flag: "<container>=<image>", desc: "컨테이너와 이미지 매핑" }
    ],
    examples: [
      { label: "이미지 교체", code: "kubectl set image deployment/myapp app=myapp:v2" }
    ],
    warnings: ["이미지 태그 전략이 없으면 롤백이 어려워집니다."],
    related: ["rollout-status", "rollout-history", "rollout-undo"]
  }),
  C({
    id: "set-env",
    category: "config",
    title: "kubectl set env",
    command: "kubectl set env deployment/<name> KEY=VALUE",
    summary: "환경 변수를 빠르게 추가하거나 수정합니다.",
    risk: "modify",
    keywords: ["env", "config", "deployment"],
    options: [
      { flag: "--from=configmap", desc: "ConfigMap에서 주입" },
      { flag: "--from=secret", desc: "Secret에서 주입" },
      { flag: "--keys", desc: "특정 키만 주입" }
    ],
    examples: [
      { label: "단일 변수", code: "kubectl set env deployment/myapp LOG_LEVEL=debug" },
      { label: "ConfigMap 주입", code: "kubectl set env deployment/myapp --from=configmap/app-config" }
    ],
    warnings: ["민감값은 env 직접 입력보다 Secret 사용이 안전합니다."],
    related: ["configmap", "secret", "edit", "apply"]
  }),
  C({
    id: "wait",
    category: "workload",
    title: "kubectl wait",
    command: "kubectl wait --for=condition=ready pod/<pod> --timeout=120s",
    summary: "리소스가 특정 조건을 만족할 때까지 기다립니다.",
    risk: "read",
    keywords: ["wait", "ready", "timeout", "condition"],
    options: [
      { flag: "--for", desc: "기다릴 조건" },
      { flag: "--timeout", desc: "대기 시간" },
      { flag: "--all", desc: "대상 전체" }
    ],
    examples: [
      { label: "Pod Ready 대기", code: "kubectl wait --for=condition=ready pod/myapp --timeout=120s" }
    ],
    warnings: ["CI/CD에서 유용하지만, 무한 대기는 원인 파악을 늦출 수 있습니다."],
    related: ["rollout-status", "get-pods", "get-events"]
  }),
  C({
    id: "get-nodes",
    category: "scheduling",
    title: "kubectl get nodes",
    command: "kubectl get nodes -o wide",
    summary: "노드 상태와 버전, 내부 IP를 확인합니다.",
    risk: "read",
    keywords: ["node", "ready", "version", "capacity"],
    options: [
      { flag: "-o wide", desc: "추가 열 표시" },
      { flag: "--show-labels", desc: "라벨 표시" }
    ],
    examples: [
      { label: "노드 목록", code: "kubectl get nodes -o wide" }
    ],
    warnings: ["NotReady가 보이면 kubelet, CNI, 디스크, 인증서를 함께 확인하세요."],
    related: ["describe-node", "cordon", "drain", "top-pods"]
  }),
  C({
    id: "describe-node",
    category: "scheduling",
    title: "kubectl describe node",
    command: "kubectl describe node <node>",
    summary: "노드 조건, taint, 할당량, 이벤트를 봅니다.",
    risk: "read",
    keywords: ["node", "condition", "taint", "event"],
    options: [
      { flag: "-o yaml", desc: "YAML로 출력" }
    ],
    examples: [
      { label: "노드 상세", code: "kubectl describe node worker-1" }
    ],
    warnings: ["경고 이벤트와 conditions를 함께 봐야 원인을 좁힐 수 있습니다."],
    related: ["get-nodes", "cordon", "drain", "taint"]
  }),
  C({
    id: "cordon",
    category: "scheduling",
    title: "kubectl cordon",
    command: "kubectl cordon <node>",
    summary: "노드에 새로운 Pod가 스케줄되지 않도록 막습니다.",
    risk: "modify",
    keywords: ["unschedulable", "maintenance"],
    options: [],
    examples: [{ label: "스케줄 금지", code: "kubectl cordon worker-1" }],
    warnings: ["기존 Pod는 그대로 남습니다. 신규 스케줄만 막습니다."],
    related: ["uncordon", "drain", "get-nodes"]
  }),
  C({
    id: "uncordon",
    category: "scheduling",
    title: "kubectl uncordon",
    command: "kubectl uncordon <node>",
    summary: "cordon 상태를 해제하고 다시 스케줄 가능하게 합니다.",
    risk: "modify",
    keywords: ["schedulable", "maintenance"],
    examples: [{ label: "스케줄 허용", code: "kubectl uncordon worker-1" }],
    warnings: ["드레인 후 바로 uncordon 하기 전에 노드 상태를 확인하세요."],
    related: ["cordon", "drain", "get-nodes"]
  }),
  C({
    id: "drain",
    category: "maintenance",
    title: "kubectl drain",
    command: "kubectl drain <node> --ignore-daemonsets --delete-emptydir-data",
    summary: "노드에서 Pod를 안전하게 비웁니다.",
    risk: "danger",
    keywords: ["maintenance", "evict", "node"],
    options: [
      { flag: "--ignore-daemonsets", desc: "DaemonSet Pod 제외" },
      { flag: "--delete-emptydir-data", desc: "emptyDir 데이터 삭제 허용" },
      { flag: "--force", desc: "제약을 무시하고 강제" }
    ],
    examples: [
      { label: "노드 비우기", code: "kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data" }
    ],
    warnings: ["운영 중 노드 비우기는 애플리케이션 가용성에 바로 영향을 줍니다."],
    related: ["cordon", "uncordon", "get-nodes", "taint"]
  }),
  C({
    id: "taint",
    category: "scheduling",
    title: "kubectl taint",
    command: "kubectl taint node <node> key=value:NoSchedule",
    summary: "특정 노드에 Pod가 올라오지 않도록 표식을 붙입니다.",
    risk: "modify",
    keywords: ["taint", "toleration", "schedule"],
    options: [
      { flag: "NoSchedule", desc: "새 Pod 스케줄 차단" },
      { flag: "PreferNoSchedule", desc: "가능하면 피함" },
      { flag: "NoExecute", desc: "이미 있는 Pod도 퇴거" }
    ],
    examples: [
      { label: "Taint 추가", code: "kubectl taint node worker-1 dedicated=infra:NoSchedule" },
      { label: "Taint 제거", code: "kubectl taint node worker-1 dedicated=infra:NoSchedule-" }
    ],
    warnings: ["Toleration이 있는 Pod는 계속 올라갈 수 있습니다."],
    related: ["cordon", "drain", "describe-node"]
  }),
  C({
    id: "label",
    category: "scheduling",
    title: "kubectl label",
    command: "kubectl label node <node> key=value",
    summary: "리소스에 라벨을 추가해 선택 기준으로 사용합니다.",
    risk: "modify",
    keywords: ["label", "selector", "metadata"],
    options: [
      { flag: "--overwrite", desc: "기존 라벨 덮어쓰기" }
    ],
    examples: [
      { label: "노드 라벨", code: "kubectl label node worker-1 zone=az-a" },
      { label: "Pod 라벨", code: "kubectl label pod mypod app=api --overwrite" }
    ],
    warnings: ["스케줄링 셀렉터를 바꾸면 배치가 달라질 수 있습니다."],
    related: ["annotate", "taint", "networkpolicy"]
  }),
  C({
    id: "annotate",
    category: "scheduling",
    title: "kubectl annotate",
    command: "kubectl annotate pod <pod> key=value",
    summary: "리소스에 메타데이터 주석을 추가합니다.",
    risk: "modify",
    keywords: ["annotation", "metadata", "note"],
    options: [
      { flag: "--overwrite", desc: "기존 주석 덮어쓰기" }
    ],
    examples: [
      { label: "주석 추가", code: "kubectl annotate pod mypod owner=platform" }
    ],
    warnings: ["주석은 운영 메모용에 가깝고, 셀렉터 용도로는 쓰지 않습니다."],
    related: ["label", "describe-node"]
  }),
  C({
    id: "get-pod-wide",
    category: "scheduling",
    title: "kubectl get pod -o wide",
    command: "kubectl get pod <pod> -o wide",
    summary: "Pod가 어느 노드에 있는지, IP는 무엇인지 봅니다.",
    risk: "read",
    keywords: ["pod", "node", "ip", "wide"],
    options: [{ flag: "-o wide", desc: "노드와 IP 열 추가" }],
    examples: [{ label: "상세 보기", code: "kubectl get pod mypod -o wide -n prod" }],
    warnings: ["노드 편중이나 특정 노드 문제를 볼 때 특히 유용합니다."],
    related: ["get-pods", "describe-node", "top-pods"]
  }),
  C({
    id: "get-node-jsonpath",
    category: "scheduling",
    title: "kubectl get node -o jsonpath",
    command: "kubectl get node <node> -o jsonpath='{.status.conditions[?(@.type==\"Ready\")].status}'",
    summary: "필요한 필드만 JSONPath로 추출합니다.",
    risk: "read",
    keywords: ["jsonpath", "automation", "field"],
    options: [
      { flag: "-o jsonpath", desc: "필드만 추출" },
      { flag: "-o jsonpath='{...}'", desc: "표현식 직접 작성" }
    ],
    examples: [
      { label: "Ready 상태", code: "kubectl get node worker-1 -o jsonpath='{.status.conditions[?(@.type==\"Ready\")].status}'" }
    ],
    warnings: ["JSONPath는 따옴표와 중괄호가 헷갈리기 쉬우니 조심하세요."],
    related: ["describe-node", "get-nodes", "get-pod-wide"]
  }),
  C({
    id: "svc",
    category: "network",
    title: "kubectl get svc / describe svc",
    command: "kubectl get svc -A && kubectl describe svc <svc>",
    summary: "Service 타입, ClusterIP, selector, endpoints 연결을 확인합니다.",
    risk: "read",
    keywords: ["service", "clusterip", "selector", "endpoint"],
    options: [
      { flag: "get svc -A", desc: "모든 Service 보기" },
      { flag: "describe svc", desc: "selector와 포트 상세" },
      { flag: "-o wide", desc: "추가 열 표시" }
    ],
    examples: [
      { label: "Service 목록", code: "kubectl get svc -A -o wide" },
      { label: "Service 상세", code: "kubectl describe svc my-svc -n prod" }
    ],
    warnings: ["selector가 비어 있으면 endpoints가 비어 있을 수 있습니다."],
    related: ["endpoints", "port-forward", "expose", "svc"]
  }),
  C({
    id: "endpoints",
    category: "network",
    title: "kubectl get endpoints / endpointslice",
    command: "kubectl get endpoints -A && kubectl get endpointslice -A",
    summary: "Service가 실제로 어떤 Pod에 연결되는지 봅니다.",
    risk: "read",
    keywords: ["endpoint", "slice", "backend", "service"],
    options: [
      { flag: "get endpoints", desc: "전통적인 Endpoint 확인" },
      { flag: "get endpointslice", desc: "EndpointSlice 확인" },
      { flag: "-A", desc: "모든 네임스페이스" }
    ],
    examples: [
      { label: "엔드포인트", code: "kubectl get endpoints my-svc -n prod" },
      { label: "슬라이스", code: "kubectl get endpointslice -A" }
    ],
    warnings: ["Service는 있는데 endpoints가 비면 selector, readiness, label을 봐야 합니다."],
    related: ["svc", "ingress", "networkpolicy"]
  }),
  C({
    id: "expose",
    category: "network",
    title: "kubectl expose",
    command: "kubectl expose deployment <name> --port=80 --target-port=8080",
    summary: "기존 리소스를 Service로 노출합니다.",
    risk: "modify",
    keywords: ["service", "expose", "port", "target-port"],
    options: [
      { flag: "--type", desc: "ClusterIP/NodePort/LoadBalancer 선택" },
      { flag: "--port", desc: "Service 포트" },
      { flag: "--target-port", desc: "컨테이너 포트" }
    ],
    examples: [
      { label: "Deployment 노출", code: "kubectl expose deployment myapp --port=80 --target-port=8080 --type=ClusterIP" }
    ],
    warnings: ["운영 환경에서는 Service 타입과 포트 매핑을 정확히 확인하세요."],
    related: ["svc", "port-forward", "ingress"]
  }),
  C({
    id: "port-forward",
    category: "network",
    title: "kubectl port-forward",
    command: "kubectl port-forward svc/<svc> 8080:80",
    summary: "로컬 포트를 Pod/Service로 임시 연결합니다.",
    risk: "read",
    keywords: ["forward", "local", "debug", "tunnel"],
    options: [
      { flag: "-n", desc: "네임스페이스 지정" },
      { flag: "--address", desc: "바인딩 주소 지정" }
    ],
    examples: [
      { label: "Service 포워딩", code: "kubectl port-forward svc/my-svc 8080:80" },
      { label: "Pod 포워딩", code: "kubectl port-forward pod/my-pod 8080:8080" }
    ],
    warnings: ["운영 문제 확인용으로는 유용하지만 장기 터널로 쓰지는 마세요."],
    related: ["svc", "ingress", "proxy"]
  }),
  C({
    id: "ingress",
    category: "network",
    title: "kubectl get ingress / describe ingress",
    command: "kubectl get ingress -A && kubectl describe ingress <ingress>",
    summary: "외부 진입점과 host/path 라우팅을 확인합니다.",
    risk: "read",
    keywords: ["ingress", "host", "path", "tls"],
    options: [
      { flag: "get ingress -A", desc: "전체 인그레스 목록" },
      { flag: "describe ingress", desc: "rules, backend, annotations 확인" }
    ],
    examples: [
      { label: "Ingress 목록", code: "kubectl get ingress -A -o wide" },
      { label: "Ingress 상세", code: "kubectl describe ingress web -n prod" }
    ],
    warnings: ["Ingress Controller가 실제로 설치되어 있는지 같이 확인해야 합니다."],
    related: ["svc", "endpoints", "networkpolicy", "get-events"]
  }),
  C({
    id: "networkpolicy",
    category: "network",
    title: "kubectl get networkpolicy / describe networkpolicy",
    command: "kubectl get networkpolicy -A",
    summary: "Pod 간 통신 규칙을 확인합니다.",
    risk: "read",
    keywords: ["policy", "deny", "allow", "cni"],
    options: [
      { flag: "-A", desc: "전체 네임스페이스" },
      { flag: "describe", desc: "허용/차단 규칙 상세" }
    ],
    examples: [
      { label: "정책 목록", code: "kubectl get networkpolicy -A" },
      { label: "정책 상세", code: "kubectl describe networkpolicy allow-web -n prod" }
    ],
    warnings: ["CNI가 NetworkPolicy를 지원해야 실제로 적용됩니다."],
    related: ["svc", "ingress", "get-pods", "label"]
  }),
  C({
    id: "proxy",
    category: "network",
    title: "kubectl proxy",
    command: "kubectl proxy --port=8001",
    summary: "쿠버네티스 API를 로컬 프록시로 노출합니다.",
    risk: "read",
    keywords: ["api", "proxy", "local", "debug"],
    options: [
      { flag: "--port", desc: "프록시 포트" },
      { flag: "--accept-hosts", desc: "허용 호스트" }
    ],
    examples: [{ label: "프록시 시작", code: "kubectl proxy --port=8001" }],
    warnings: ["외부에 노출되지 않도록 로컬에서만 쓰는 편이 안전합니다."],
    related: ["port-forward", "cluster-info", "api-resources"]
  }),
  C({
    id: "pv",
    category: "storage",
    title: "kubectl get pv / describe pv",
    command: "kubectl get pv && kubectl describe pv <pv>",
    summary: "클러스터의 실제 PersistentVolume을 확인합니다.",
    risk: "read",
    keywords: ["pv", "storage", "capacity", "reclaim"],
    options: [
      { flag: "-o wide", desc: "세부 열 표시" }
    ],
    examples: [
      { label: "PV 목록", code: "kubectl get pv -o wide" },
      { label: "PV 상세", code: "kubectl describe pv pv-data-01" }
    ],
    warnings: ["reclaim policy와 bound 상태를 같이 봐야 합니다."],
    related: ["pvc", "storageclass", "volumeattachment"]
  }),
  C({
    id: "pvc",
    category: "storage",
    title: "kubectl get pvc / describe pvc",
    command: "kubectl get pvc -A && kubectl describe pvc <pvc>",
    summary: "Pod가 요청한 저장 공간 상태를 봅니다.",
    risk: "read",
    keywords: ["pvc", "pending", "storage", "claim"],
    options: [
      { flag: "-A", desc: "전체 네임스페이스" },
      { flag: "-o wide", desc: "상세 열 표시" }
    ],
    examples: [
      { label: "PVC 목록", code: "kubectl get pvc -A -o wide" },
      { label: "PVC 상세", code: "kubectl describe pvc data-myapp -n prod" }
    ],
    warnings: ["Pending이면 StorageClass, accessModes, provisioner를 확인하세요."],
    related: ["pv", "storageclass", "volumeattachment", "get-events"]
  }),
  C({
    id: "storageclass",
    category: "storage",
    title: "kubectl get storageclass / describe storageclass",
    command: "kubectl get storageclass",
    summary: "동적 프로비저닝 정책을 확인합니다.",
    risk: "read",
    keywords: ["storageclass", "provisioner", "binding"],
    options: [
      { flag: "describe", desc: "기본값과 파라미터 상세" },
      { flag: "--show-labels", desc: "라벨 보기" }
    ],
    examples: [
      { label: "StorageClass 목록", code: "kubectl get storageclass" },
      { label: "상세", code: "kubectl describe storageclass fast" }
    ],
    warnings: ["기본 StorageClass가 없으면 PVC가 Pending일 수 있습니다."],
    related: ["pv", "pvc", "volumeattachment"]
  }),
  C({
    id: "volumeattachment",
    category: "storage",
    title: "kubectl get volumeattachment",
    command: "kubectl get volumeattachment",
    summary: "CSI 볼륨이 어떤 노드에 붙어 있는지 봅니다.",
    risk: "read",
    keywords: ["csi", "attach", "volume", "node"],
    options: [
      { flag: "-o wide", desc: "상세 정보 보기" }
    ],
    examples: [{ label: "볼륨 어태치", code: "kubectl get volumeattachment -o wide" }],
    warnings: ["볼륨이 다른 노드에 묶여 있으면 Pod 스케줄이 지연될 수 있습니다."],
    related: ["pv", "pvc", "storageclass"]
  }),
  C({
    id: "configmap",
    category: "config",
    title: "kubectl get configmap / create configmap / edit configmap",
    command: "kubectl get configmap -A",
    summary: "설정값을 Pod 이미지와 분리해서 다룹니다.",
    risk: "modify",
    keywords: ["config", "settings", "env", "file"],
    options: [
      { flag: "create configmap", desc: "새 ConfigMap 생성" },
      { flag: "edit configmap", desc: "직접 편집" },
      { flag: "--from-file", desc: "파일에서 생성" },
      { flag: "--from-literal", desc: "리터럴로 생성" }
    ],
    examples: [
      { label: "목록", code: "kubectl get configmap -A" },
      { label: "생성", code: "kubectl create configmap app-config --from-file=config.yaml" }
    ],
    warnings: ["민감한 값은 ConfigMap이 아니라 Secret을 써야 합니다."],
    related: ["secret", "set-env", "apply", "edit"]
  }),
  C({
    id: "secret",
    category: "config",
    title: "kubectl get secret / create secret",
    command: "kubectl get secret -A",
    summary: "민감값을 별도 리소스로 관리합니다.",
    risk: "modify",
    keywords: ["secret", "token", "password", "tls"],
    options: [
      { flag: "create secret generic", desc: "일반 Secret 생성" },
      { flag: "create secret tls", desc: "TLS 인증서 Secret 생성" },
      { flag: "create secret docker-registry", desc: "레지스트리 인증 Secret" },
      { flag: "--from-file", desc: "파일 기반 생성" }
    ],
    examples: [
      { label: "Secret 목록", code: "kubectl get secret -A" },
      { label: "일반 Secret", code: "kubectl create secret generic app-secret --from-literal=password=***" }
    ],
    warnings: ["base64는 암호화가 아닙니다. 진짜 민감정보는 관리 체계를 따로 두세요."],
    related: ["configmap", "sa", "rbac-can-i"]
  }),
  C({
    id: "sa",
    category: "security",
    title: "kubectl get serviceaccount / create serviceaccount",
    command: "kubectl get sa -A",
    summary: "Pod가 사용할 서비스 계정을 관리합니다.",
    risk: "modify",
    keywords: ["serviceaccount", "identity", "pod"],
    options: [
      { flag: "create sa", desc: "서비스 계정 생성" }
    ],
    examples: [
      { label: "서비스 계정 목록", code: "kubectl get sa -A" },
      { label: "생성", code: "kubectl create sa app-sa -n prod" }
    ],
    warnings: ["기본 서비스 계정만 쓰면 권한이 과도할 수 있습니다."],
    related: ["role", "rolebinding", "rbac-can-i", "secret"]
  }),
  C({
    id: "role",
    category: "security",
    title: "kubectl get role / create role",
    command: "kubectl get role -A",
    summary: "네임스페이스 범위의 권한 규칙을 관리합니다.",
    risk: "modify",
    keywords: ["rbac", "namespace", "permission"],
    options: [
      { flag: "create role", desc: "Role 생성" }
    ],
    examples: [
      { label: "Role 목록", code: "kubectl get role -A" },
      { label: "생성", code: "kubectl create role viewer --verb=get,list,watch --resource=pods -n prod" }
    ],
    warnings: ["Role은 namespace 범위입니다. cluster 범위와 구분해야 합니다."],
    related: ["rolebinding", "clusterrole", "rbac-can-i"]
  }),
  C({
    id: "rolebinding",
    category: "security",
    title: "kubectl get rolebinding / create rolebinding",
    command: "kubectl get rolebinding -A",
    summary: "Role과 Subject를 연결합니다.",
    risk: "modify",
    keywords: ["rbac", "binding", "subject"],
    options: [
      { flag: "create rolebinding", desc: "RoleBinding 생성" }
    ],
    examples: [
      { label: "RoleBinding 목록", code: "kubectl get rolebinding -A" },
      { label: "생성", code: "kubectl create rolebinding viewer-binding --role=viewer --serviceaccount=prod:app-sa -n prod" }
    ],
    warnings: ["serviceaccount namespace를 잘못 적으면 바인딩이 안 됩니다."],
    related: ["sa", "role", "rbac-can-i"]
  }),
  C({
    id: "clusterrole",
    category: "security",
    title: "kubectl get clusterrole / create clusterrole",
    command: "kubectl get clusterrole",
    summary: "클러스터 전체 범위의 권한 규칙을 관리합니다.",
    risk: "modify",
    keywords: ["rbac", "cluster scope", "permission"],
    options: [
      { flag: "create clusterrole", desc: "ClusterRole 생성" }
    ],
    examples: [
      { label: "ClusterRole 목록", code: "kubectl get clusterrole" }
    ],
    warnings: ["cluster 범위 권한은 영향 범위가 넓습니다."],
    related: ["clusterrolebinding", "role", "rbac-can-i"]
  }),
  C({
    id: "clusterrolebinding",
    category: "security",
    title: "kubectl get clusterrolebinding / create clusterrolebinding",
    command: "kubectl get clusterrolebinding",
    summary: "ClusterRole과 Subject를 연결합니다.",
    risk: "modify",
    keywords: ["rbac", "binding", "cluster"],
    options: [
      { flag: "create clusterrolebinding", desc: "ClusterRoleBinding 생성" }
    ],
    examples: [
      { label: "목록", code: "kubectl get clusterrolebinding" }
    ],
    warnings: ["잘못 만들면 클러스터 전체 권한이 열릴 수 있습니다."],
    related: ["clusterrole", "sa", "rbac-can-i"]
  }),
  C({
    id: "rbac-can-i",
    category: "security",
    title: "kubectl auth can-i / whoami",
    command: "kubectl auth can-i get pods -n prod",
    summary: "현재 주체가 무엇을 할 수 있는지 확인합니다.",
    risk: "read",
    keywords: ["rbac", "auth", "permission", "subject"],
    options: [
      { flag: "can-i", desc: "허용 여부 확인" },
      { flag: "whoami", desc: "현재 인증 주체 확인" }
    ],
    examples: [
      { label: "권한 확인", code: "kubectl auth can-i create deployments -n prod" },
      { label: "주체 확인", code: "kubectl auth whoami" }
    ],
    warnings: ["실제 문제는 Role/Binding/ServiceAccount를 같이 봐야 드러납니다."],
    related: ["sa", "role", "rolebinding", "clusterrolebinding"]
  }),
  C({
    id: "top-pods",
    category: "autoscaling",
    title: "kubectl top pods / nodes",
    command: "kubectl top pods -A && kubectl top nodes",
    summary: "실시간 CPU와 메모리 사용량을 확인합니다.",
    risk: "read",
    keywords: ["metrics", "cpu", "memory", "usage"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "--containers", desc: "컨테이너별 표시" }
    ],
    examples: [
      { label: "Pod 사용량", code: "kubectl top pods -A" },
      { label: "노드 사용량", code: "kubectl top nodes" }
    ],
    warnings: ["metrics-server가 없으면 동작하지 않습니다."],
    related: ["hpa", "scale", "get-pods"]
  }),
  C({
    id: "hpa",
    category: "autoscaling",
    title: "kubectl get hpa / describe hpa",
    command: "kubectl get hpa -A",
    summary: "HorizontalPodAutoscaler 상태를 확인합니다.",
    risk: "read",
    keywords: ["hpa", "autoscale", "metrics"],
    options: [{ flag: "describe", desc: "목표와 현재값 확인" }],
    examples: [
      { label: "HPA 목록", code: "kubectl get hpa -A" },
      { label: "HPA 상세", code: "kubectl describe hpa myapp -n prod" }
    ],
    warnings: ["metrics-server와 타겟 메트릭이 맞지 않으면 스케일이 안 될 수 있습니다."],
    related: ["top-pods", "scale", "autoscale"]
  }),
  C({
    id: "autoscale",
    category: "autoscaling",
    title: "kubectl autoscale",
    command: "kubectl autoscale deployment <name> --cpu-percent=80 --min=2 --max=10",
    summary: "간단한 HPA를 생성합니다.",
    risk: "modify",
    keywords: ["hpa", "autoscaler", "deployment"],
    options: [
      { flag: "--cpu-percent", desc: "CPU 목표치" },
      { flag: "--min", desc: "최소 Pod 수" },
      { flag: "--max", desc: "최대 Pod 수" }
    ],
    examples: [
      { label: "HPA 생성", code: "kubectl autoscale deployment myapp --cpu-percent=80 --min=2 --max=10" }
    ],
    warnings: ["현재 클러스터의 메트릭 수집 구성이 먼저 되어 있어야 합니다."],
    related: ["hpa", "top-pods", "scale"]
  }),
  C({
    id: "pdb",
    category: "maintenance",
    title: "kubectl get pdb / describe pdb",
    command: "kubectl get pdb -A",
    summary: "PodDisruptionBudget로 중단 허용 범위를 확인합니다.",
    risk: "read",
    keywords: ["pdb", "disruption", "availability", "maintenance"],
    options: [
      { flag: "-A", desc: "모든 네임스페이스" },
      { flag: "describe", desc: "허용되는 disruption 상세" }
    ],
    examples: [
      { label: "PDB 목록", code: "kubectl get pdb -A" },
      { label: "PDB 상세", code: "kubectl describe pdb myapp-pdb -n prod" }
    ],
    warnings: ["drain이 잘 안 되면 PDB가 막고 있는지 먼저 보세요."],
    related: ["drain", "get-nodes", "rollout-status"]
  }),
  C({
    id: "helm-repo",
    category: "helm",
    title: "helm repo add / update / search",
    command: "helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update",
    summary: "차트를 가져올 저장소를 등록하고 갱신합니다.",
    risk: "read",
    keywords: ["helm", "repo", "chart", "search"],
    options: [
      { flag: "repo add", desc: "레포 추가" },
      { flag: "repo update", desc: "인덱스 갱신" },
      { flag: "search repo", desc: "차트 검색" }
    ],
    examples: [
      { label: "레포 추가", code: "helm repo add bitnami https://charts.bitnami.com/bitnami" },
      { label: "검색", code: "helm search repo nginx" }
    ],
    warnings: ["신뢰할 수 없는 레포는 바로 설치하지 마세요."],
    related: ["helm-install", "helm-template", "kustomize-build"]
  }),
  C({
    id: "helm-install",
    category: "helm",
    title: "helm install / upgrade",
    command: "helm install myapp chart/ && helm upgrade myapp chart/",
    summary: "차트를 설치하거나 새 버전으로 업그레이드합니다.",
    risk: "modify",
    keywords: ["install", "upgrade", "release", "values"],
    options: [
      { flag: "-f values.yaml", desc: "values 파일 지정" },
      { flag: "--set", desc: "값을 직접 오버라이드" },
      { flag: "--namespace", desc: "설치 네임스페이스" },
      { flag: "--atomic", desc: "실패 시 자동 롤백" }
    ],
    examples: [
      { label: "설치", code: "helm install myapp bitnami/nginx -n prod --create-namespace" },
      { label: "업그레이드", code: "helm upgrade myapp bitnami/nginx -n prod -f values.yaml" }
    ],
    warnings: ["values 오버라이드는 눈에 잘 안 띄니 배포 전 확인이 중요합니다."],
    related: ["helm-history", "helm-rollback", "helm-template"]
  }),
  C({
    id: "helm-rollback",
    category: "helm",
    title: "helm rollback",
    command: "helm rollback <release> <revision>",
    summary: "Helm 릴리스를 이전 리비전으로 되돌립니다.",
    risk: "danger",
    keywords: ["rollback", "revision", "release"],
    options: [
      { flag: "--namespace", desc: "대상 네임스페이스" },
      { flag: "--wait", desc: "완료될 때까지 대기" }
    ],
    examples: [
      { label: "롤백", code: "helm rollback myapp 3 -n prod" }
    ],
    warnings: ["롤백이 곧 해결은 아니니 원인을 먼저 기록하세요."],
    related: ["helm-history", "helm-values", "rollout-status"]
  }),
  C({
    id: "helm-history",
    category: "helm",
    title: "helm history / list / status",
    command: "helm history myapp && helm status myapp",
    summary: "릴리스 이력과 현재 상태를 확인합니다.",
    risk: "read",
    keywords: ["history", "status", "release"],
    options: [
      { flag: "list", desc: "설치된 릴리스 목록" },
      { flag: "history", desc: "리비전 이력" },
      { flag: "status", desc: "현재 상태" }
    ],
    examples: [
      { label: "이력", code: "helm history myapp -n prod" },
      { label: "상태", code: "helm status myapp -n prod" }
    ],
    warnings: ["성공/실패 리비전의 차이를 꼭 확인하세요."],
    related: ["helm-install", "helm-rollback", "helm-values"]
  }),
  C({
    id: "helm-values",
    category: "helm",
    title: "helm get values / helm show values",
    command: "helm get values myapp && helm show values bitnami/nginx",
    summary: "실제 적용값과 차트 기본값을 비교합니다.",
    risk: "read",
    keywords: ["values", "override", "chart"],
    options: [
      { flag: "get values", desc: "릴리스 실제 값" },
      { flag: "show values", desc: "차트 기본값" }
    ],
    examples: [
      { label: "실제 값", code: "helm get values myapp -n prod" },
      { label: "기본값", code: "helm show values bitnami/nginx" }
    ],
    warnings: ["문제가 생기면 values diff부터 보는 습관이 좋습니다."],
    related: ["helm-install", "helm-history", "helm-template"]
  }),
  C({
    id: "helm-template",
    category: "helm",
    title: "helm template / lint",
    command: "helm template myapp chart/ && helm lint chart/",
    summary: "템플릿 렌더링과 기본 검사를 합니다.",
    risk: "read",
    keywords: ["template", "lint", "render"],
    options: [
      { flag: "--values", desc: "values 파일 지정" },
      { flag: "--set", desc: "값 오버라이드" }
    ],
    examples: [
      { label: "렌더링", code: "helm template myapp bitnami/nginx -f values.yaml" },
      { label: "검사", code: "helm lint ./chart" }
    ],
    warnings: ["템플릿이 맞아도 실제 클러스터와 값 충돌이 날 수 있습니다."],
    related: ["helm-install", "kustomize-build", "diff"]
  }),
  C({
    id: "helm-uninstall",
    category: "helm",
    title: "helm uninstall",
    command: "helm uninstall myapp -n prod",
    summary: "Helm 릴리스를 제거합니다.",
    risk: "danger",
    keywords: ["delete", "release", "cleanup"],
    options: [
      { flag: "--keep-history", desc: "히스토리 유지" }
    ],
    examples: [{ label: "제거", code: "helm uninstall myapp -n prod" }],
    warnings: ["릴리스 제거가 곧 백엔드 데이터 삭제는 아닙니다. PV/PVC는 별도 확인이 필요합니다."],
    related: ["helm-history", "pvc", "pv"]
  }),
  C({
    id: "kustomize-build",
    category: "kustomize",
    title: "kustomize build",
    command: "kustomize build overlays/prod",
    summary: "오버레이를 렌더링해 최종 매니페스트를 확인합니다.",
    risk: "read",
    keywords: ["overlay", "build", "render", "base"],
    options: [
      { flag: "-o", desc: "출력 파일 지정" }
    ],
    examples: [
      { label: "빌드", code: "kustomize build overlays/prod" }
    ],
    warnings: ["렌더 결과와 실제 apply 결과가 같은지 확인하는 습관이 좋습니다."],
    related: ["kustomize-apply", "kustomize-diff", "apply"]
  }),
  C({
    id: "kustomize-apply",
    category: "kustomize",
    title: "kubectl apply -k",
    command: "kubectl apply -k overlays/prod",
    summary: "Kustomize 오버레이를 직접 적용합니다.",
    risk: "modify",
    keywords: ["apply", "overlay", "kustomize"],
    options: [
      { flag: "-k", desc: "kustomize 디렉토리 적용" },
      { flag: "--server-side", desc: "서버 사이드 적용" }
    ],
    examples: [
      { label: "적용", code: "kubectl apply -k overlays/prod" }
    ],
    warnings: ["변경 전에는 build나 diff로 최종 결과를 먼저 확인하세요."],
    related: ["kustomize-build", "kustomize-diff", "apply"]
  }),
  C({
    id: "kustomize-diff",
    category: "kustomize",
    title: "kubectl diff -k",
    command: "kubectl diff -k overlays/prod",
    summary: "적용 전 현재 상태와의 차이를 봅니다.",
    risk: "read",
    keywords: ["diff", "preview", "change"],
    options: [
      { flag: "-k", desc: "Kustomize 경로 비교" }
    ],
    examples: [
      { label: "차이 비교", code: "kubectl diff -k overlays/prod" }
    ],
    warnings: ["diff 결과만으로는 컨트롤러 동작까지 알 수 없습니다."],
    related: ["kustomize-build", "kustomize-apply", "apply"]
  }),
  C({
    id: "crictl",
    category: "runtime",
    title: "crictl ps / images / logs / inspect",
    command: "crictl ps && crictl images",
    summary: "CRI 런타임에서 실제 컨테이너 상태를 봅니다.",
    risk: "read",
    keywords: ["containerd", "cri-o", "runtime", "container"],
    options: [
      { flag: "ps", desc: "컨테이너 목록" },
      { flag: "pods", desc: "Pod 목록" },
      { flag: "images", desc: "이미지 목록" },
      { flag: "logs", desc: "컨테이너 로그" },
      { flag: "inspect", desc: "컨테이너 상세" },
      { flag: "inspectp", desc: "Pod 상세" }
    ],
    examples: [
      { label: "컨테이너", code: "crictl ps -a" },
      { label: "이미지", code: "crictl images" }
    ],
    warnings: ["kubectl과 실제 런타임 상태가 다를 수 있습니다."],
    related: ["nerdctl", "crictl", "kubelet", "kubelet-journal"]
  }),
  C({
    id: "nerdctl",
    category: "runtime",
    title: "nerdctl / ctr",
    command: "nerdctl ps && ctr images ls",
    summary: "containerd 환경에서 컨테이너와 이미지를 직접 봅니다.",
    risk: "read",
    keywords: ["containerd", "namespace", "runtime"],
    options: [
      { flag: "ps", desc: "컨테이너 목록" },
      { flag: "images ls", desc: "이미지 목록" },
      { flag: "containers ls", desc: "컨테이너 목록" }
    ],
    examples: [
      { label: "컨테이너", code: "nerdctl ps" },
      { label: "이미지", code: "ctr images ls" }
    ],
    warnings: ["containerd namespace를 다르게 쓰는 환경에서는 결과가 다르게 보일 수 있습니다."],
    related: ["crictl", "kubelet", "kubelet-journal"]
  }),
  C({
    id: "kubelet",
    category: "runtime",
    title: "systemctl status kubelet / journalctl -u kubelet",
    command: "systemctl status kubelet && journalctl -u kubelet -f",
    summary: "노드에서 kubelet 상태와 로그를 확인합니다.",
    risk: "read",
    keywords: ["kubelet", "node", "service", "log"],
    options: [
      { flag: "systemctl status", desc: "서비스 상태" },
      { flag: "journalctl -u", desc: "서비스 로그" }
    ],
    examples: [
      { label: "상태", code: "systemctl status kubelet" },
      { label: "로그", code: "journalctl -u kubelet -f" }
    ],
    warnings: ["노드 NotReady일 때 가장 먼저 보는 축 중 하나입니다."],
    related: ["crictl", "get-nodes", "describe-node"]
  }),
  C({
    id: "etcd-health",
    category: "etcd",
    title: "etcdctl endpoint health / status",
    command: "etcdctl endpoint health && etcdctl endpoint status",
    summary: "etcd API와 멤버 상태를 빠르게 확인합니다.",
    risk: "read",
    keywords: ["etcd", "health", "status", "control-plane"],
    options: [
      { flag: "endpoint health", desc: "헬스 상태" },
      { flag: "endpoint status", desc: "멤버와 리비전 정보" }
    ],
    examples: [
      { label: "헬스", code: "etcdctl endpoint health" },
      { label: "상태", code: "etcdctl endpoint status --write-out=table" }
    ],
    warnings: ["인증서와 환경변수 설정이 맞아야 합니다."],
    related: ["etcd-member", "etcd-snapshot", "kubeadm"]
  }),
  C({
    id: "etcd-member",
    category: "etcd",
    title: "etcdctl member list",
    command: "etcdctl member list",
    summary: "etcd 멤버와 클러스터 구성을 봅니다.",
    risk: "read",
    keywords: ["member", "cluster", "etcd"],
    options: [
      { flag: "member list", desc: "멤버 목록" }
    ],
    examples: [{ label: "멤버 목록", code: "etcdctl member list" }],
    warnings: ["멤버가 하나라도 이상하면 컨트롤플레인에 영향이 큽니다."],
    related: ["etcd-health", "etcd-snapshot", "kubeadm"]
  }),
  C({
    id: "etcd-snapshot",
    category: "etcd",
    title: "etcdctl snapshot save / restore",
    command: "etcdctl snapshot save snapshot.db",
    summary: "etcd 데이터를 백업하고 복원합니다.",
    risk: "danger",
    keywords: ["snapshot", "backup", "restore", "disaster"],
    options: [
      { flag: "snapshot save", desc: "스냅샷 저장" },
      { flag: "snapshot restore", desc: "스냅샷 복원" }
    ],
    examples: [
      { label: "백업", code: "etcdctl snapshot save /backup/snapshot.db" },
      { label: "복원", code: "etcdctl snapshot restore snapshot.db" }
    ],
    warnings: ["복원은 새로운 데이터 디렉토리와 절차를 정확히 따라야 합니다."],
    related: ["etcd-health", "etcd-member", "kubeadm"]
  }),
  C({
    id: "kind",
    category: "local",
    title: "kind create cluster / get clusters",
    command: "kind create cluster && kind get clusters",
    summary: "로컬 쿠버네티스 클러스터를 빠르게 띄웁니다.",
    risk: "modify",
    keywords: ["kind", "local", "cluster"],
    options: [
      { flag: "create cluster", desc: "로컬 클러스터 생성" },
      { flag: "get clusters", desc: "클러스터 목록" },
      { flag: "delete cluster", desc: "클러스터 삭제" }
    ],
    examples: [
      { label: "생성", code: "kind create cluster" },
      { label: "목록", code: "kind get clusters" }
    ],
    warnings: ["로컬 테스트용과 운영용 kubeconfig를 구분해서 쓰세요."],
    related: ["minikube", "config-contexts", "config-view"]
  }),
  C({
    id: "minikube",
    category: "local",
    title: "minikube start / dashboard",
    command: "minikube start && minikube dashboard",
    summary: "로컬에서 Kubernetes 기능을 실습합니다.",
    risk: "modify",
    keywords: ["minikube", "local", "dashboard"],
    options: [
      { flag: "start", desc: "클러스터 시작" },
      { flag: "dashboard", desc: "대시보드 열기" },
      { flag: "addons", desc: "애드온 관리" }
    ],
    examples: [
      { label: "시작", code: "minikube start" },
      { label: "대시보드", code: "minikube dashboard" }
    ],
    warnings: ["실제 운영 클러스터와 다른 동작이 있을 수 있습니다."],
    related: ["kind", "config-contexts", "port-forward"]
  }),
  C({
    id: "kubeadm",
    category: "maintenance",
    title: "kubeadm certs check-expiration / upgrade plan",
    command: "kubeadm certs check-expiration && kubeadm upgrade plan",
    summary: "컨트롤플레인 인증서와 업그레이드 계획을 확인합니다.",
    risk: "read",
    keywords: ["kubeadm", "cert", "upgrade", "control-plane"],
    options: [
      { flag: "certs check-expiration", desc: "인증서 만료 확인" },
      { flag: "upgrade plan", desc: "업그레이드 계획 확인" }
    ],
    examples: [
      { label: "인증서", code: "kubeadm certs check-expiration" },
      { label: "업그레이드 계획", code: "kubeadm upgrade plan" }
    ],
    warnings: ["운영 컨트롤플레인에서 업그레이드 절차를 충분히 검증해야 합니다."],
    related: ["etcd-health", "etcd-snapshot", "kubelet"]
  }),
  C({
    id: "kubelet-journal",
    category: "maintenance",
    title: "journalctl -u kubelet",
    command: "journalctl -u kubelet -f",
    summary: "노드에서 kubelet 로그를 추적합니다.",
    risk: "read",
    keywords: ["journal", "kubelet", "node", "service"],
    options: [
      { flag: "-f", desc: "실시간 추적" },
      { flag: "-b", desc: "부팅 이후 로그" }
    ],
    examples: [
      { label: "실시간", code: "journalctl -u kubelet -f" },
      { label: "부팅 이후", code: "journalctl -u kubelet -b" }
    ],
    warnings: ["kubelet 에러는 노드 문제와 거의 항상 연결되어 있습니다."],
    related: ["kubelet", "crictl", "get-nodes"]
  }),
  C({
    id: "diff",
    category: "debug",
    title: "kubectl diff",
    command: "kubectl diff -f .",
    summary: "적용 전에 변경 차이를 봅니다.",
    risk: "read",
    keywords: ["diff", "preview", "change"],
    options: [
      { flag: "-f", desc: "파일/디렉토리" },
      { flag: "-k", desc: "Kustomize 경로" }
    ],
    examples: [
      { label: "차이 확인", code: "kubectl diff -f ." }
    ],
    warnings: ["클러스터 상태와 파일이 다를 때 적용 전 확인용으로 좋습니다."],
    related: ["apply", "kustomize-diff", "helm-template"]
  })
];

function normalizeText(value) {
  return String(value).toLowerCase();
}

function getVisibleCommands() {
  const term = normalizeText(state.search).trim();
  return COMMANDS.filter((command) => {
    const categoryMatch = state.category === "all" || command.category === state.category;
    const haystack = [
      command.title,
      command.summary,
      command.command,
      command.category,
      command.risk,
      ...(command.keywords || []),
      ...(command.options || []).map((item) => `${item.flag} ${item.desc}`),
      ...(command.examples || []).map((item) => `${item.label} ${item.code}`),
      ...(command.warnings || []),
      ...(command.related || [])
    ]
      .join(" ")
      .toLowerCase();

    return categoryMatch && (!term || haystack.includes(term));
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
  listTitle.textContent = "쿠버네티스 운영 명령어";

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
      const node = commandTemplate.content.cloneNode(true);
      node.querySelector(".pill-category").textContent = category.label;
      const riskPill = node.querySelector(".pill-risk");
      riskPill.dataset.risk = command.risk;
      riskPill.textContent = command.risk === "read" ? "READ" : command.risk === "modify" ? "WRITE" : "DANGER";
      node.querySelector("h3").textContent = command.title;
      node.querySelector(".summary").textContent = command.summary;
      node.querySelector(".command-line code").textContent = command.command;

      const optionList = node.querySelector(".option-list");
      command.options.forEach((option) => {
        const item = document.createElement("div");
        item.className = "option-item";
        item.innerHTML = `<strong>${option.flag}</strong><span>${option.desc}</span>`;
        optionList.append(item);
      });

      const exampleList = node.querySelector(".example-list");
      command.examples.forEach((example) => {
        const item = document.createElement("div");
        item.className = "example-item";
        item.innerHTML = `<strong>${example.label}</strong><code>${example.code}</code>`;
        exampleList.append(item);
      });

      const warningList = node.querySelector(".warning-list");
      command.warnings.forEach((warning) => {
        const li = document.createElement("li");
        li.textContent = warning;
        warningList.append(li);
      });

      const relatedRow = node.querySelector(".related-row");
      command.related.forEach((relatedId) => {
        const target = COMMANDS.find((item) => item.id === relatedId);
        if (!target) return;
        const btn = document.createElement("button");
        btn.className = "related-chip";
        btn.type = "button";
        btn.textContent = target.title;
        btn.addEventListener("click", () => {
          state.category = target.category;
          state.search = target.title.split(" / ")[0].toLowerCase();
          searchInput.value = target.title.split(" / ")[0].toLowerCase();
          renderAll();
        });
        relatedRow.append(btn);
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

function renderAll() {
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

document.querySelectorAll("[data-scenario]").forEach((button) => {
  button.addEventListener("click", () => {
    const scenario = scenarios.find((item) => item.id === button.dataset.scenario);
    if (!scenario) return;
    state.search = scenario.search;
    searchInput.value = scenario.search;
    renderCommands();
    searchInput.focus();
  });
});

renderScenarios();
renderAll();
