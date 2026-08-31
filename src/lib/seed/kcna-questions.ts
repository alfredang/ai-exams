/**
 * KCNA bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:kcna-seed'` and upserts catalog rows.
 *
 * Exported as `seedKcna(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/kcna.ts`) and the protected
 * admin API (`/api/admin/seed-kcna`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against public Kubernetes / CNCF
 * documentation and the CNCF KCNA exam curriculum:
 *   - Kubernetes Fundamentals                        — 46% (30)
 *   - Container Orchestration                         — 22% (14)
 *   - Cloud Native Architecture                       — 16% (11)
 *   - Cloud Native Observability                      — 8%  (5)
 *   - Cloud Native Application Delivery               — 8%  (5)
 *
 * This is original, conceptual study material — NOT a copy of any real
 * exam and not affiliated with or endorsed by the CNCF / Linux Foundation.
 */
import { PrismaClient, QStatus, QType } from '@prisma/client';

type Opt = { id: string; text: string };
type Q = {
  domain: string;
  difficulty: number;
  type: QType;
  stem: string;
  options: Opt[];
  correct: string[];
  explanation: string;
  references: { label: string; url: string }[];
  isTeaser?: boolean;
};

const FUND = 'Kubernetes Fundamentals';
const ORCH = 'Container Orchestration';
const ARCH = 'Cloud Native Architecture';
const OBS = 'Cloud Native Observability';
const DELIV = 'Cloud Native Application Delivery';

const REF_OVERVIEW = { label: 'Kubernetes Docs — Overview', url: 'https://kubernetes.io/docs/concepts/overview/' };
const REF_COMPONENTS = { label: 'Kubernetes Docs — Cluster Components', url: 'https://kubernetes.io/docs/concepts/overview/components/' };
const REF_PODS = { label: 'Kubernetes Docs — Pods', url: 'https://kubernetes.io/docs/concepts/workloads/pods/' };
const REF_DEPLOY = { label: 'Kubernetes Docs — Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' };
const REF_RS = { label: 'Kubernetes Docs — ReplicaSet', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/' };
const REF_DS = { label: 'Kubernetes Docs — DaemonSet', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/' };
const REF_STS = { label: 'Kubernetes Docs — StatefulSets', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/' };
const REF_JOB = { label: 'Kubernetes Docs — Jobs', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/' };
const REF_CRONJOB = { label: 'Kubernetes Docs — CronJob', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/' };
const REF_SVC = { label: 'Kubernetes Docs — Service', url: 'https://kubernetes.io/docs/concepts/services-networking/service/' };
const REF_ING = { label: 'Kubernetes Docs — Ingress', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/' };
const REF_NS = { label: 'Kubernetes Docs — Namespaces', url: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/' };
const REF_LABELS = { label: 'Kubernetes Docs — Labels and Selectors', url: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/' };
const REF_CM = { label: 'Kubernetes Docs — ConfigMaps', url: 'https://kubernetes.io/docs/concepts/configuration/configmap/' };
const REF_SECRET = { label: 'Kubernetes Docs — Secrets', url: 'https://kubernetes.io/docs/concepts/configuration/secret/' };
const REF_KUBECTL = { label: 'Kubernetes Docs — kubectl Overview', url: 'https://kubernetes.io/docs/reference/kubectl/' };
const REF_API = { label: 'Kubernetes Docs — Kubernetes API', url: 'https://kubernetes.io/docs/concepts/overview/kubernetes-api/' };
const REF_ETCD = { label: 'Kubernetes Docs — Operating etcd clusters', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/' };
const REF_SCHED = { label: 'Kubernetes Docs — Kubernetes Scheduler', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/' };
const REF_KUBELET = { label: 'Kubernetes Docs — kubelet', url: 'https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/' };
const REF_CONTROLLER = { label: 'Kubernetes Docs — Controllers', url: 'https://kubernetes.io/docs/concepts/architecture/controller/' };
const REF_NODES = { label: 'Kubernetes Docs — Nodes', url: 'https://kubernetes.io/docs/concepts/architecture/nodes/' };
const REF_RES = { label: 'Kubernetes Docs — Managing Resources for Containers', url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/' };
const REF_PROBE = { label: 'Kubernetes Docs — Liveness, Readiness and Startup Probes', url: 'https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/' };
const REF_STORAGE = { label: 'Kubernetes Docs — Persistent Volumes', url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/' };
const REF_NETWORK = { label: 'Kubernetes Docs — Cluster Networking', url: 'https://kubernetes.io/docs/concepts/cluster-administration/networking/' };
const REF_RBAC = { label: 'Kubernetes Docs — RBAC Authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/' };
const REF_CONTAINERS = { label: 'Kubernetes Docs — Containers', url: 'https://kubernetes.io/docs/concepts/containers/' };
const REF_RUNTIME = { label: 'Kubernetes Docs — Container Runtimes', url: 'https://kubernetes.io/docs/setup/production-environment/container-runtimes/' };
const REF_CRI = { label: 'Kubernetes Docs — Container Runtime Interface (CRI)', url: 'https://kubernetes.io/docs/concepts/architecture/cri/' };
const REF_HPA = { label: 'Kubernetes Docs — Horizontal Pod Autoscaling', url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/' };
const REF_OCI = { label: 'Open Container Initiative — About', url: 'https://opencontainers.org/about/overview/' };
const REF_CNCF = { label: 'CNCF — About', url: 'https://www.cncf.io/about/who-we-are/' };
const REF_LANDSCAPE = { label: 'CNCF — Cloud Native Landscape', url: 'https://landscape.cncf.io/' };
const REF_CN_DEF = { label: 'CNCF — Cloud Native Definition', url: 'https://github.com/cncf/toc/blob/main/DEFINITION.md' };
const REF_PROM = { label: 'Prometheus — Overview', url: 'https://prometheus.io/docs/introduction/overview/' };
const REF_OTEL = { label: 'OpenTelemetry — Documentation', url: 'https://opentelemetry.io/docs/' };
const REF_FLUENTD = { label: 'Fluentd — What is Fluentd', url: 'https://www.fluentd.org/architecture' };
const REF_TRACING = { label: 'OpenTelemetry — Traces', url: 'https://opentelemetry.io/docs/concepts/signals/traces/' };
const REF_METRICS = { label: 'OpenTelemetry — Metrics', url: 'https://opentelemetry.io/docs/concepts/signals/metrics/' };
const REF_LOGGING = { label: 'Kubernetes Docs — Logging Architecture', url: 'https://kubernetes.io/docs/concepts/cluster-administration/logging/' };
const REF_SLO = { label: 'Google SRE — Service Level Objectives', url: 'https://sre.google/sre-book/service-level-objectives/' };
const REF_HELM = { label: 'Helm — Documentation', url: 'https://helm.sh/docs/' };
const REF_ARGO = { label: 'Argo CD — Declarative GitOps CD', url: 'https://argo-cd.readthedocs.io/en/stable/' };
const REF_GITOPS = { label: 'OpenGitOps — Principles', url: 'https://opengitops.dev/' };
const REF_CICD = { label: 'CNCF — CI/CD landscape', url: 'https://landscape.cncf.io/' };
const REF_KUSTOMIZE = { label: 'Kubernetes Docs — Declarative Management with Kustomize', url: 'https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/' };
const REF_SERVICEMESH = { label: 'CNCF — Service Mesh landscape', url: 'https://landscape.cncf.io/' };
const REF_SERVERLESS = { label: 'CNCF — Serverless Whitepaper', url: 'https://github.com/cncf/wg-serverless' };
const REF_AUTOSCALE = { label: 'Kubernetes Docs — Autoscaling Workloads', url: 'https://kubernetes.io/docs/concepts/workloads/autoscaling/' };
const REF_DEPLOY_STRAT = { label: 'Kubernetes Docs — Deployment strategies', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const TF: Opt[] = [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Kubernetes Fundamentals (30) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the smallest deployable unit you can create and manage in Kubernetes?',
    options: opts4('A container', 'A Pod', 'A node', 'A Deployment'),
    correct: ['b'],
    explanation: 'A Pod is the smallest deployable unit in Kubernetes. It wraps one or more containers that share storage, network, and a specification for how to run them.',
    references: [REF_PODS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which control plane component is the consistent and highly available key-value store that holds all cluster state?',
    options: opts4('kube-scheduler', 'etcd', 'kubelet', 'kube-proxy'),
    correct: ['b'],
    explanation: 'etcd is the consistent, distributed key-value store Kubernetes uses as the backing store for all cluster data. The scheduler, kubelet, and kube-proxy do not persist cluster state.',
    references: [REF_ETCD, REF_COMPONENTS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control plane component watches for newly created Pods that have no node assigned and selects a node for them to run on?',
    options: opts4('kube-controller-manager', 'kube-scheduler', 'kube-apiserver', 'cloud-controller-manager'),
    correct: ['b'],
    explanation: 'The kube-scheduler watches for unscheduled Pods and assigns each one to a node based on resource requirements, constraints, and policies.',
    references: [REF_SCHED, REF_COMPONENTS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component is the front end of the Kubernetes control plane and the only component clients talk to directly?',
    options: opts4('etcd', 'kube-apiserver', 'kube-scheduler', 'kubelet'),
    correct: ['b'],
    explanation: 'The kube-apiserver exposes the Kubernetes API and is the front end for the control plane. All other components and clients interact with the cluster through it.',
    references: [REF_API, REF_COMPONENTS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agent runs on every node and ensures that containers described in PodSpecs are running and healthy?',
    options: opts4('kube-proxy', 'kubelet', 'containerd', 'kube-scheduler'),
    correct: ['b'],
    explanation: 'The kubelet is the primary node agent. It registers the node, receives PodSpecs, and ensures the described containers are running and healthy.',
    references: [REF_KUBELET, REF_NODES]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Deployment with `replicas: 3` is created. Which object does the Deployment actually manage to maintain the desired number of Pods?',
    options: opts4('A DaemonSet', 'A ReplicaSet', 'A StatefulSet', 'A Job'),
    correct: ['b'],
    explanation: 'A Deployment manages a ReplicaSet, and the ReplicaSet ensures the specified number of identical Pod replicas are running. Rolling updates create new ReplicaSets.',
    references: [REF_DEPLOY, REF_RS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a copy of a logging agent Pod to run on every node in the cluster, including nodes added later. Which workload object fits best?',
    options: opts4('Deployment', 'DaemonSet', 'StatefulSet', 'CronJob'),
    correct: ['b'],
    explanation: 'A DaemonSet ensures that a copy of a Pod runs on all (or selected) nodes, and automatically schedules the Pod onto any node that joins the cluster later.',
    references: [REF_DS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which workload object provides stable network identities and stable persistent storage for each replica, suited to databases?',
    options: opts4('Deployment', 'StatefulSet', 'ReplicaSet', 'DaemonSet'),
    correct: ['b'],
    explanation: 'A StatefulSet gives each Pod a stable, ordered identity (name and network hostname) and stable per-replica storage, which is what stateful applications such as databases need.',
    references: [REF_STS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which object runs a Pod to completion on a schedule, like a recurring backup at midnight?',
    options: opts4('Job', 'CronJob', 'DaemonSet', 'Deployment'),
    correct: ['b'],
    explanation: 'A CronJob creates Jobs on a repeating, time-based schedule (cron syntax). A plain Job runs once to completion; it does not schedule recurring runs.',
    references: [REF_CRONJOB, REF_JOB]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the default Service type in Kubernetes, exposing the Service only on an internal cluster IP?',
    options: opts4('NodePort', 'LoadBalancer', 'ClusterIP', 'ExternalName'),
    correct: ['c'],
    explanation: 'ClusterIP is the default Service type. It exposes the Service on an internal cluster-only IP, reachable from inside the cluster but not externally by default.',
    references: [REF_SVC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Service type allocates a port on every node so external traffic can reach the Service via `<NodeIP>:<NodePort>`?',
    options: opts4('ClusterIP', 'NodePort', 'ExternalName', 'Headless'),
    correct: ['b'],
    explanation: 'A NodePort Service reserves a port on each node; traffic to any node IP on that port is forwarded to the Service. It builds on top of ClusterIP.',
    references: [REF_SVC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress resource has no effect in a cluster. What is the most likely reason?',
    options: opts4(
      'Ingress requires a StatefulSet backend',
      'No Ingress controller is running to fulfill the Ingress rules',
      'Ingress only works with NodePort Services',
      'Ingress objects must be created in the kube-system namespace'
    ),
    correct: ['b'],
    explanation: 'An Ingress resource is just configuration. It does nothing unless an Ingress controller (such as ingress-nginx) is deployed to read the rules and route traffic.',
    references: [REF_ING]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'How do Services know which Pods to send traffic to?',
    options: opts4(
      'By the Pod IP hardcoded in the Service spec',
      'By matching the Service label selector against Pod labels',
      'By the order Pods were created',
      'By the node a Pod is scheduled on'
    ),
    correct: ['b'],
    explanation: 'A Service uses a label selector. Endpoints are continuously updated to include the IPs of Pods whose labels match the selector, so membership is dynamic.',
    references: [REF_SVC, REF_LABELS]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'What is the primary purpose of a Namespace in Kubernetes?',
    options: opts4(
      'To encrypt Pod-to-Pod traffic',
      'To divide cluster resources between multiple users or teams',
      'To pin Pods to specific nodes',
      'To store container images'
    ),
    correct: ['b'],
    explanation: 'Namespaces provide a mechanism for isolating groups of resources within a single cluster, often used to divide resources among multiple teams or environments.',
    references: [REF_NS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which object stores non-confidential configuration data as key-value pairs that Pods can consume as env vars or files?',
    options: opts4('Secret', 'ConfigMap', 'PersistentVolume', 'ServiceAccount'),
    correct: ['b'],
    explanation: 'A ConfigMap holds non-confidential configuration in key-value pairs. Pods can consume it as environment variables, command-line args, or mounted files. Secrets are for sensitive data.',
    references: [REF_CM]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about Kubernetes Secrets is accurate by default?',
    options: opts4(
      'Secret values are encrypted with a per-cluster password automatically',
      'Secret data is only base64-encoded at rest unless encryption at rest is configured',
      'Secrets cannot be mounted into Pods',
      'Secrets are stored outside etcd for safety'
    ),
    correct: ['b'],
    explanation: 'By default Secret data is stored base64-encoded in etcd, which is encoding, not encryption. Encryption at rest must be explicitly configured for the API server.',
    references: [REF_SECRET]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which kubectl command shows the Pods running in the current namespace?',
    options: opts4('kubectl get pods', 'kubectl list pods', 'kubectl show pods', 'kubectl pods --all'),
    correct: ['a'],
    explanation: '`kubectl get pods` lists Pods in the active namespace. `list`, `show`, and `pods` are not valid kubectl subcommands in that form.',
    references: [REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Kubernetes operates on which core principle for managing workloads?',
    options: opts4(
      'Imperative scripting executed once at deploy time',
      'Declarative desired state continuously reconciled by controllers',
      'Manual operator intervention for every change',
      'Static configuration that never changes after apply'
    ),
    correct: ['b'],
    explanation: 'Kubernetes is declarative: you specify desired state and controllers continuously reconcile actual state toward it, recovering from failures automatically.',
    references: [REF_CONTROLLER, REF_OVERVIEW]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A container keeps running but stops serving traffic correctly. Which probe should you configure so Kubernetes restarts the container?',
    options: opts4('Readiness probe', 'Liveness probe', 'Startup probe', 'Health label'),
    correct: ['b'],
    explanation: 'A failing liveness probe causes Kubernetes to restart the container. A readiness probe only removes the Pod from Service endpoints; it does not restart the container.',
    references: [REF_PROBE]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'What does a readiness probe control?',
    options: opts4(
      'Whether the container is restarted',
      'Whether the Pod receives traffic from Services',
      'Whether the node is marked NotReady',
      'Whether the image is re-pulled'
    ),
    correct: ['b'],
    explanation: 'A readiness probe determines whether a Pod should receive traffic. When it fails, the Pod is removed from Service endpoints but is not restarted.',
    references: [REF_PROBE]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'You set `resources.requests.cpu: 250m` on a container. What does the scheduler use this value for?',
    options: opts4(
      'To cap the container CPU at 250 millicores',
      'To find a node with at least 250 millicores of allocatable CPU',
      'To throttle the container after it starts',
      'To set the container restart policy'
    ),
    correct: ['b'],
    explanation: 'Requests are used by the scheduler for placement: it picks a node with enough allocatable CPU/memory to satisfy the request. Limits, not requests, cap usage.',
    references: [REF_RES, REF_SCHED]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A container exceeds its memory `limit`. What is the typical outcome?',
    options: opts4(
      'The container is throttled but keeps running',
      'The container is terminated (OOMKilled) and may be restarted',
      'The node is cordoned',
      'The limit is automatically raised'
    ),
    correct: ['b'],
    explanation: 'Exceeding a memory limit results in the container being OOMKilled. CPU limits cause throttling, but memory cannot be throttled, so the container is terminated.',
    references: [REF_RES]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which object requests durable storage that outlives the Pod that uses it?',
    options: opts4('emptyDir volume', 'PersistentVolumeClaim', 'ConfigMap', 'hostPath only'),
    correct: ['b'],
    explanation: 'A PersistentVolumeClaim requests storage from a PersistentVolume, which exists independently of any Pod, so data persists across Pod restarts and rescheduling.',
    references: [REF_STORAGE]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about labels and selectors in Kubernetes.',
    options: opts4(
      'Labels are key-value pairs attached to objects',
      'Services use selectors to dynamically choose which Pods receive traffic',
      'Labels must be globally unique across the cluster',
      'Selectors let you group and operate on sets of objects'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Labels are non-unique key-value pairs used to organize objects; selectors group objects (e.g., a Service selecting Pods). Labels do not need to be unique.',
    references: [REF_LABELS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Containers in the same Pod share the same network namespace and can reach each other on localhost.',
    options: TF,
    correct: ['true'],
    explanation: 'True. Containers in a Pod share the network namespace (same IP and port space), so they communicate over localhost. They also can share volumes.',
    references: [REF_PODS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command applies a manifest file declaratively, creating or updating resources to match it?',
    options: opts4('kubectl run -f app.yaml', 'kubectl apply -f app.yaml', 'kubectl exec -f app.yaml', 'kubectl patch app.yaml'),
    correct: ['b'],
    explanation: '`kubectl apply -f` applies a declarative configuration, creating resources or updating them to match the manifest while tracking applied configuration.',
    references: [REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control plane component runs core controllers such as the Node and ReplicaSet controllers?',
    options: opts4('kube-scheduler', 'kube-controller-manager', 'kube-proxy', 'etcd'),
    correct: ['b'],
    explanation: 'The kube-controller-manager runs the built-in controllers (Node, ReplicaSet, Job, Endpoints, etc.) that drive the cluster toward desired state.',
    references: [REF_COMPONENTS, REF_CONTROLLER]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the role of kube-proxy on each node?',
    options: opts4(
      'It schedules Pods onto the node',
      'It maintains network rules implementing the Service abstraction',
      'It stores cluster state',
      'It pulls container images'
    ),
    correct: ['b'],
    explanation: 'kube-proxy maintains network rules on nodes that allow network communication to Pods, implementing part of the Kubernetes Service concept (virtual IP routing/load balancing).',
    references: [REF_COMPONENTS, REF_SVC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'RBAC in Kubernetes authorizes actions based on what?',
    options: opts4(
      'The Pod\'s node assignment',
      'Roles/ClusterRoles bound to users, groups, or service accounts',
      'The container image registry',
      'The order of resource creation'
    ),
    correct: ['b'],
    explanation: 'RBAC grants permissions via Roles/ClusterRoles bound through RoleBindings/ClusterRoleBindings to subjects (users, groups, service accounts). It defines who can do what on which resources.',
    references: [REF_RBAC]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the relationship between nodes and Pods?',
    options: opts4(
      'A Pod can span multiple nodes for high availability',
      'A Pod runs on exactly one node; a node can run many Pods',
      'A node runs exactly one Pod',
      'Pods and nodes are the same concept'
    ),
    correct: ['b'],
    explanation: 'A Pod is always scheduled to and runs on a single node, while a node can host many Pods subject to its resources. Pods do not span nodes.',
    references: [REF_NODES, REF_PODS]
  },

  // ── Container Orchestration (14) ──
  {
    domain: ORCH, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What problem does container orchestration primarily solve?',
    options: opts4(
      'Compiling source code into containers',
      'Automating deployment, scaling, networking, and lifecycle of many containers',
      'Encrypting container images at rest',
      'Replacing the host operating system'
    ),
    correct: ['b'],
    explanation: 'Container orchestration automates deploying, scaling, networking, healing, and managing the lifecycle of containerized workloads across a cluster of machines.',
    references: [REF_OVERVIEW]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the Container Runtime Interface (CRI)?',
    options: opts4(
      'A storage plugin API',
      'The API the kubelet uses to talk to container runtimes',
      'A network policy specification',
      'A logging format'
    ),
    correct: ['b'],
    explanation: 'CRI is the plugin interface that lets the kubelet use different container runtimes (containerd, CRI-O, etc.) without recompiling, decoupling Kubernetes from any single runtime.',
    references: [REF_CRI, REF_RUNTIME]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a CRI-compatible container runtime commonly used with Kubernetes?',
    options: opts4('containerd', 'systemd', 'etcd', 'kube-proxy'),
    correct: ['a'],
    explanation: 'containerd is a widely used CRI-compatible container runtime. CRI-O is another. systemd, etcd, and kube-proxy are not container runtimes.',
    references: [REF_RUNTIME, REF_CONTAINERS]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'The Open Container Initiative (OCI) primarily standardizes what?',
    options: opts4(
      'Kubernetes API resources',
      'Container image and runtime formats',
      'Service mesh sidecars',
      'Cloud billing models'
    ),
    correct: ['b'],
    explanation: 'The OCI defines open standards for container image format and runtime, ensuring images and runtimes from different vendors interoperate.',
    references: [REF_OCI]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'During a Deployment rolling update with default strategy, what does Kubernetes do?',
    options: opts4(
      'Deletes all old Pods, then creates new ones',
      'Gradually replaces old Pods with new ones while keeping the app available',
      'Creates a second cluster',
      'Pauses all traffic until the update completes'
    ),
    correct: ['b'],
    explanation: 'The default RollingUpdate strategy incrementally creates new Pods and removes old ones (respecting maxSurge/maxUnavailable), keeping the application available throughout.',
    references: [REF_DEPLOY_STRAT, REF_DEPLOY]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command rolls a Deployment back to its previous revision?',
    options: opts4(
      'kubectl rollout undo deployment/web',
      'kubectl delete deployment/web --previous',
      'kubectl rollback web',
      'kubectl apply --revert deployment/web'
    ),
    correct: ['a'],
    explanation: '`kubectl rollout undo deployment/web` reverts the Deployment to the previous ReplicaSet revision. The other forms are not valid kubectl syntax.',
    references: [REF_DEPLOY, REF_KUBECTL]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'The Horizontal Pod Autoscaler (HPA) scales a workload based on what?',
    options: opts4(
      'Number of nodes in the cluster',
      'Observed metrics such as CPU utilization or custom metrics',
      'The size of container images',
      'The number of namespaces'
    ),
    correct: ['b'],
    explanation: 'The HPA automatically adjusts the replica count of a workload based on observed metrics (e.g., average CPU, memory, or custom/external metrics) against target values.',
    references: [REF_HPA, REF_AUTOSCALE]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'How does Kubernetes self-heal when a Pod managed by a Deployment crashes?',
    options: opts4(
      'It emails an administrator to recreate it',
      'The controller observes the mismatch and creates a replacement Pod',
      'It reboots the node',
      'Nothing happens until the next apply'
    ),
    correct: ['b'],
    explanation: 'Controllers continuously compare desired vs. actual state. If a Pod dies, the ReplicaSet controller notices the deficit and schedules a replacement automatically.',
    references: [REF_CONTROLLER, REF_RS]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `kubectl scale deployment web --replicas=5` do?',
    options: opts4(
      'Creates 5 new Deployments',
      'Sets the desired Pod count of the web Deployment to 5',
      'Limits the Deployment to 5 nodes',
      'Adds 5 containers to each Pod'
    ),
    correct: ['b'],
    explanation: 'The command updates the Deployment\'s desired replica count to 5; the ReplicaSet controller then reconciles toward 5 running Pods.',
    references: [REF_DEPLOY, REF_KUBECTL]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A node becomes unreachable. What does Kubernetes eventually do with the Pods that were running there (managed by a Deployment)?',
    options: opts4(
      'Leaves them down permanently',
      'Marks them for eviction and reschedules replacements on healthy nodes',
      'Migrates the running processes live to another node',
      'Converts them into a DaemonSet'
    ),
    correct: ['b'],
    explanation: 'After the node is deemed unhealthy, its Pods are eventually evicted and the controllers create replacement Pods on healthy nodes to restore desired state. There is no live process migration.',
    references: [REF_NODES, REF_CONTROLLER]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A Job is suitable for a run-to-completion batch task, whereas a Deployment is for long-running services.',
    options: TF,
    correct: ['true'],
    explanation: 'True. Jobs run Pods until a specified number complete successfully, ideal for batch work. Deployments manage continuously running, replicated services.',
    references: [REF_JOB, REF_DEPLOY]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Kubernetes mechanisms that influence where a Pod is scheduled.',
    options: opts4(
      'nodeSelector',
      'Taints and tolerations',
      'Affinity and anti-affinity rules',
      'The Pod restart policy'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'nodeSelector, taints/tolerations, and affinity/anti-affinity all affect scheduling placement. restartPolicy controls container restart behavior, not scheduling.',
    references: [REF_SCHED]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does it mean that Kubernetes is "portable" across infrastructure?',
    options: opts4(
      'Pods can be paused and resumed on a laptop',
      'The same workloads can run on-prem, in clouds, or hybrid without rewriting them',
      'Container images shrink automatically',
      'It only runs on a single cloud provider'
    ),
    correct: ['b'],
    explanation: 'Kubernetes abstracts the underlying infrastructure, so the same declarative workloads run consistently across on-premises, public cloud, and hybrid environments.',
    references: [REF_OVERVIEW]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the effect of applying a taint to a node without any matching toleration on Pods?',
    options: opts4(
      'Pods without a matching toleration will not be scheduled onto that node',
      'All Pods are evicted from the cluster',
      'The node is deleted',
      'Pods run but with reduced resources'
    ),
    correct: ['a'],
    explanation: 'A taint repels Pods that do not tolerate it. The scheduler will not place Pods lacking a matching toleration onto the tainted node (and may evict existing ones with NoExecute).',
    references: [REF_SCHED]
  },

  // ── Cloud Native Architecture (11) ──
  {
    domain: ARCH, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'According to the CNCF, cloud native technologies empower organizations to build and run scalable applications in which kind of environments?',
    options: opts4(
      'Only on-premises bare metal',
      'Modern, dynamic environments such as public, private, and hybrid clouds',
      'Single-server monoliths only',
      'Air-gapped mainframes exclusively'
    ),
    correct: ['b'],
    explanation: 'The CNCF cloud native definition describes building and running scalable applications in modern, dynamic environments — public, private, and hybrid clouds.',
    references: [REF_CN_DEF, REF_CNCF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which set of techniques does the CNCF cite as exemplifying the cloud native approach?',
    options: opts4(
      'Containers, service meshes, microservices, immutable infrastructure, declarative APIs',
      'Virtual machines, monoliths, manual patching',
      'Bare-metal servers and shell scripts only',
      'Proprietary single-vendor stacks'
    ),
    correct: ['a'],
    explanation: 'The CNCF definition lists containers, service meshes, microservices, immutable infrastructure, and declarative APIs as representative cloud native techniques.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a defining characteristic of a microservices architecture?',
    options: opts4(
      'A single large codebase deployed as one unit',
      'An application composed of small, independently deployable services',
      'No network communication between components',
      'One database shared by tightly-coupled modules only'
    ),
    correct: ['b'],
    explanation: 'Microservices decompose an application into small services that are independently developed, deployed, and scaled, typically communicating over the network via APIs.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does "immutable infrastructure" mean in cloud native practice?',
    options: opts4(
      'Servers are patched in place repeatedly',
      'Components are replaced rather than modified after deployment',
      'Infrastructure can never be changed once provisioned',
      'Only databases are immutable'
    ),
    correct: ['b'],
    explanation: 'Immutable infrastructure means you replace components (e.g., container images, VMs) with new versions instead of mutating them in place, improving reproducibility and reliability.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A service mesh primarily provides which capability for microservices?',
    options: opts4(
      'Compiling application source code',
      'A dedicated infrastructure layer for service-to-service traffic management, security, and observability',
      'Persistent block storage',
      'Container image building'
    ),
    correct: ['b'],
    explanation: 'A service mesh adds a dedicated infrastructure layer (often sidecar proxies) handling traffic routing, mTLS, retries, and telemetry between services, decoupled from app code.',
    references: [REF_SERVICEMESH, REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the role of the CNCF in the cloud native ecosystem?',
    options: opts4(
      'It sells a proprietary Kubernetes distribution',
      'It is a vendor-neutral home that hosts and fosters open source cloud native projects',
      'It certifies hardware vendors only',
      'It writes the Linux kernel'
    ),
    correct: ['b'],
    explanation: 'The Cloud Native Computing Foundation is a vendor-neutral foundation (part of the Linux Foundation) that hosts projects like Kubernetes, Prometheus, and Envoy and builds sustainable ecosystems.',
    references: [REF_CNCF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'CNCF projects progress through which maturity levels?',
    options: opts4(
      'Alpha, Beta, GA',
      'Sandbox, Incubating, Graduated',
      'Bronze, Silver, Gold',
      'Draft, Published, Archived'
    ),
    correct: ['b'],
    explanation: 'CNCF hosted projects move through Sandbox, then Incubating, then Graduated maturity levels based on adoption, governance, and sustainability criteria.',
    references: [REF_CNCF, REF_LANDSCAPE]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'What is a key benefit of "declarative APIs" in cloud native systems?',
    options: opts4(
      'You specify step-by-step imperative commands for every change',
      'You declare the desired state and the system continuously converges to it',
      'They eliminate the need for any controllers',
      'They require manual reconciliation by operators'
    ),
    correct: ['b'],
    explanation: 'Declarative APIs let you state the desired outcome; controllers reconcile reality toward it automatically, improving resilience and reducing manual, error-prone steps.',
    references: [REF_CN_DEF, REF_CONTROLLER]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Serverless / FaaS platforms in the cloud native landscape are characterized by what?',
    options: opts4(
      'Developers manage and patch the underlying servers',
      'Code runs in response to events and scales (including to zero) without managing servers',
      'They cannot scale automatically',
      'They require a permanent dedicated VM per function'
    ),
    correct: ['b'],
    explanation: 'Serverless/FaaS abstracts server management; functions execute on demand in response to events and can scale automatically, often down to zero when idle.',
    references: [REF_SERVERLESS, REF_LANDSCAPE]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The CNCF Cloud Native Landscape catalogs projects and products across categories such as orchestration, observability, and storage.',
    options: TF,
    correct: ['true'],
    explanation: 'True. The CNCF Landscape is an interactive map organizing the ecosystem into categories (orchestration, runtime, observability, storage, CI/CD, etc.).',
    references: [REF_LANDSCAPE]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which trade-off is commonly associated with adopting microservices over a monolith?',
    options: opts4(
      'Less network communication overall',
      'Greater operational and distributed-systems complexity in exchange for independent scaling and deployment',
      'No need for observability tooling',
      'Guaranteed lower latency in all cases'
    ),
    correct: ['b'],
    explanation: 'Microservices enable independent scaling and deployment but introduce distributed-system complexity (networking, observability, data consistency), a key architectural trade-off.',
    references: [REF_CN_DEF]
  },

  // ── Cloud Native Observability (5) ──
  {
    domain: OBS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which three signals are commonly referred to as the pillars of observability?',
    options: opts4(
      'Metrics, logs, and traces',
      'CPU, memory, and disk',
      'Pods, nodes, and services',
      'Build, test, and deploy'
    ),
    correct: ['a'],
    explanation: 'Metrics, logs, and traces are the three core telemetry signals (pillars) of observability, used together to understand system behavior.',
    references: [REF_OTEL, REF_METRICS]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Prometheus is primarily used for what in a cloud native stack?',
    options: opts4(
      'Distributed tracing storage',
      'Metrics collection and time-series monitoring with a query language (PromQL)',
      'Container image scanning',
      'Service mesh data plane'
    ),
    correct: ['b'],
    explanation: 'Prometheus is a CNCF monitoring system that scrapes and stores time-series metrics and provides PromQL for querying and alerting.',
    references: [REF_PROM]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'What does distributed tracing primarily help engineers understand?',
    options: opts4(
      'Disk partition layouts',
      'The path and latency of a request as it flows across multiple services',
      'Container image layer sizes',
      'Node kernel versions'
    ),
    correct: ['b'],
    explanation: 'Distributed tracing follows a request across service boundaries, recording spans and timing so engineers can pinpoint latency and failures in a microservices call chain.',
    references: [REF_TRACING, REF_OTEL]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'OpenTelemetry is best described as what?',
    options: opts4(
      'A managed cloud database',
      'A vendor-neutral set of APIs, SDKs, and tools for generating and collecting telemetry (metrics, logs, traces)',
      'A Kubernetes scheduler plugin',
      'A container runtime'
    ),
    correct: ['b'],
    explanation: 'OpenTelemetry is a CNCF observability framework providing vendor-neutral APIs/SDKs and a collector to generate and export metrics, logs, and traces.',
    references: [REF_OTEL]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'In the context of SRE, what does a Service Level Objective (SLO) represent?',
    options: opts4(
      'The maximum number of Pods allowed per node',
      'A target value or range for a service level indicator, like 99.9% availability',
      'The container image pull policy',
      'The cluster\'s total CPU capacity'
    ),
    correct: ['b'],
    explanation: 'An SLO is a target for a service level indicator (SLI) — for example, a latency or availability goal such as 99.9% — used to define and measure reliability.',
    references: [REF_SLO]
  },

  // ── Cloud Native Application Delivery (5) ──
  {
    domain: DELIV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the core idea of GitOps?',
    options: opts4(
      'Manually SSHing into servers to apply changes',
      'Using a Git repository as the single source of truth for declarative infrastructure and apps, reconciled automatically',
      'Storing container images in Git',
      'Disabling version control for faster deploys'
    ),
    correct: ['b'],
    explanation: 'GitOps uses Git as the single source of truth; an agent continuously reconciles cluster state to match the declared state in the repository.',
    references: [REF_GITOPS]
  },
  {
    domain: DELIV, difficulty: 2, type: QType.SINGLE,
    stem: 'Helm is best described as what?',
    options: opts4(
      'A package manager for Kubernetes that templates and manages releases via charts',
      'A container runtime',
      'A monitoring agent',
      'A network CNI plugin'
    ),
    correct: ['a'],
    explanation: 'Helm is the Kubernetes package manager. Charts bundle templated manifests, and Helm manages installs, upgrades, and rollbacks as releases.',
    references: [REF_HELM]
  },
  {
    domain: DELIV, difficulty: 2, type: QType.SINGLE,
    stem: 'Argo CD is a tool for which purpose?',
    options: opts4(
      'Distributed tracing',
      'Declarative, GitOps continuous delivery for Kubernetes',
      'Container image building',
      'Cluster autoscaling'
    ),
    correct: ['b'],
    explanation: 'Argo CD is a declarative GitOps continuous delivery tool that syncs Kubernetes application state to the desired state defined in Git repositories.',
    references: [REF_ARGO, REF_GITOPS]
  },
  {
    domain: DELIV, difficulty: 3, type: QType.SINGLE,
    stem: 'What does a CI/CD pipeline automate?',
    options: opts4(
      'Only writing application code',
      'Building, testing, and delivering/deploying software changes in an automated, repeatable way',
      'Manual approval emails only',
      'Physical server racking'
    ),
    correct: ['b'],
    explanation: 'Continuous Integration/Continuous Delivery pipelines automate building, testing, and delivering or deploying changes, enabling fast, reliable, repeatable releases.',
    references: [REF_CICD]
  },
  {
    domain: DELIV, difficulty: 3, type: QType.SINGLE,
    stem: 'Kustomize provides which capability for Kubernetes manifests?',
    options: opts4(
      'Template-free, declarative customization and overlays of base manifests',
      'Distributed tracing of requests',
      'Image vulnerability scanning',
      'Node autoscaling'
    ),
    correct: ['a'],
    explanation: 'Kustomize lets you customize raw, template-free YAML via bases and overlays (e.g., per-environment patches) and is built into kubectl with `-k`.',
    references: [REF_KUSTOMIZE]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Kubernetes Fundamentals (30) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod can contain how many containers?',
    options: opts4('Exactly one always', 'One or more containers that share network and storage', 'Only system containers', 'Zero containers'),
    correct: ['b'],
    explanation: 'A Pod hosts one or more containers that share the same network namespace and can share storage volumes, scheduled and managed together as a unit.',
    references: [REF_PODS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component exposes the Kubernetes API that all other components communicate through?',
    options: opts4('kube-apiserver', 'kubelet', 'kube-proxy', 'etcd'),
    correct: ['a'],
    explanation: 'The kube-apiserver is the API front end of the control plane; clients and all components interact with cluster state exclusively through it.',
    references: [REF_API, REF_COMPONENTS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A "sidecar" container in a Pod typically does what?',
    options: opts4(
      'Replaces the main application container',
      'Runs alongside the main container to provide supporting functionality like logging or proxying',
      'Schedules other Pods',
      'Stores cluster state'
    ),
    correct: ['b'],
    explanation: 'A sidecar is a helper container in the same Pod that augments the main container (e.g., log shipping, proxy, sync) while sharing the Pod\'s network and volumes.',
    references: [REF_PODS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which object would you use to expose a stateless web app to other Pods with a stable virtual IP and DNS name?',
    options: opts4('A Service', 'A ConfigMap', 'A Secret', 'A Namespace'),
    correct: ['a'],
    explanation: 'A Service provides a stable virtual IP and DNS name and load-balances traffic across the matching Pods, decoupling clients from individual Pod IPs.',
    references: [REF_SVC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'You want external HTTP traffic routed to different Services based on URL path. Which resource is designed for that?',
    options: opts4('NodePort Service', 'Ingress', 'ConfigMap', 'PersistentVolume'),
    correct: ['b'],
    explanation: 'An Ingress provides HTTP/HTTPS routing rules (host- and path-based) to backend Services, fulfilled by an Ingress controller.',
    references: [REF_ING]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `kubectl describe pod web-1` primarily provide?',
    options: opts4(
      'Only the Pod YAML',
      'Detailed status, events, and configuration useful for troubleshooting',
      'A shell inside the container',
      'The container image source code'
    ),
    correct: ['b'],
    explanation: '`kubectl describe pod` shows a human-readable summary including status, conditions, recent events, and configuration, which is helpful for debugging.',
    references: [REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command opens an interactive shell in a running container of Pod `web`?',
    options: opts4(
      'kubectl exec -it web -- /bin/sh',
      'kubectl shell web',
      'kubectl run web -- bash',
      'kubectl attach web --shell'
    ),
    correct: ['a'],
    explanation: '`kubectl exec -it <pod> -- /bin/sh` runs a command (here a shell) interactively inside an existing container. The others are not valid for this.',
    references: [REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A StatefulSet Pod is named `db-0`, `db-1`, `db-2`. What property does this naming reflect?',
    options: opts4(
      'Random Pod identity',
      'Stable, ordered, and unique network identities per replica',
      'That they share one volume',
      'That they are ephemeral and interchangeable'
    ),
    correct: ['b'],
    explanation: 'StatefulSets assign stable, ordinal, unique identities (and matching DNS hostnames) to each Pod, enabling stateful workloads to rely on identity and ordering.',
    references: [REF_STS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which workload is most appropriate for a node-level monitoring agent that must run on every node?',
    options: opts4('Deployment', 'DaemonSet', 'Job', 'CronJob'),
    correct: ['b'],
    explanation: 'A DaemonSet schedules exactly one Pod per (selected) node and adds Pods to new nodes automatically — ideal for per-node agents like monitoring or log collectors.',
    references: [REF_DS]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Service type requests an external load balancer from the cloud provider?',
    options: opts4('ClusterIP', 'NodePort', 'LoadBalancer', 'Headless'),
    correct: ['c'],
    explanation: 'A LoadBalancer Service asks the cloud provider to provision an external load balancer that routes to the Service (built on NodePort/ClusterIP).',
    references: [REF_SVC]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'How can a Pod consume values from a ConfigMap?',
    options: opts4(
      'Only by rebuilding the container image',
      'As environment variables or mounted files',
      'Only via the Kubernetes API server logs',
      'It cannot; ConfigMaps are admin-only'
    ),
    correct: ['b'],
    explanation: 'ConfigMap data can be injected into Pods as environment variables or projected as files in a mounted volume, decoupling configuration from images.',
    references: [REF_CM]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is a startup probe useful for slow-starting applications?',
    options: opts4(
      'It permanently disables the liveness probe',
      'It gives the app time to initialize before liveness/readiness checks are enforced',
      'It restarts the node',
      'It scales the Deployment up'
    ),
    correct: ['b'],
    explanation: 'A startup probe protects slow-starting containers by delaying liveness/readiness checks until startup succeeds, preventing premature restarts.',
    references: [REF_PROBE]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the desired state vs. actual state reconciliation loop describe?',
    options: opts4(
      'A one-time deployment script',
      'Controllers continuously acting to make cluster state match the declared spec',
      'A manual audit process',
      'The container build process'
    ),
    correct: ['b'],
    explanation: 'Kubernetes controllers run reconciliation loops that observe actual state and take action to converge it toward the declared desired state.',
    references: [REF_CONTROLLER]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which resource isolates names so two teams can both have a "Service named api" without conflict?',
    options: opts4('Label', 'Namespace', 'Annotation', 'Node'),
    correct: ['b'],
    explanation: 'Namespaces scope resource names; two namespaces can each contain a Service named "api" because names only need to be unique within a namespace.',
    references: [REF_NS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which object should hold a database password used by a Pod?',
    options: opts4('ConfigMap', 'Secret', 'Annotation', 'Label'),
    correct: ['b'],
    explanation: 'Secrets are intended for sensitive data such as passwords and tokens. ConfigMaps are for non-confidential configuration.',
    references: [REF_SECRET, REF_CM]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod shows status `CrashLoopBackOff`. What does this indicate?',
    options: opts4(
      'The Pod is healthy and serving traffic',
      'The container repeatedly starts and crashes, so Kubernetes backs off before restarting again',
      'The node is out of disk',
      'The image is being pulled'
    ),
    correct: ['b'],
    explanation: 'CrashLoopBackOff means the container keeps crashing after starting; the kubelet increases the delay between restart attempts (back-off).',
    references: [REF_PODS, REF_KUBELET]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does a CPU limit do to a container that tries to use more CPU?',
    options: opts4(
      'Terminates the container immediately',
      'Throttles the container to the limit',
      'Schedules it to another node',
      'Increases the limit automatically'
    ),
    correct: ['b'],
    explanation: 'CPU is a compressible resource: exceeding a CPU limit results in throttling rather than termination. Memory overuse, by contrast, causes OOMKill.',
    references: [REF_RES]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about an emptyDir volume is correct?',
    options: opts4(
      'It persists data after the Pod is deleted',
      'It exists only for the Pod\'s lifetime and is deleted with the Pod',
      'It is shared across all Pods in the cluster',
      'It requires a StorageClass'
    ),
    correct: ['b'],
    explanation: 'An emptyDir volume is created when a Pod is assigned to a node and deleted when the Pod is removed; it is ephemeral, not durable storage.',
    references: [REF_STORAGE, REF_PODS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL components that run on the Kubernetes control plane.',
    options: opts4(
      'kube-apiserver',
      'etcd',
      'kube-scheduler',
      'kube-proxy'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'kube-apiserver, etcd, kube-scheduler, and kube-controller-manager are control-plane components. kube-proxy runs on every node, not the control plane.',
    references: [REF_COMPONENTS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Each Pod gets its own unique IP address within the cluster network.',
    options: TF,
    correct: ['true'],
    explanation: 'True. The Kubernetes networking model assigns each Pod its own cluster-routable IP; containers in the Pod share that IP.',
    references: [REF_NETWORK, REF_PODS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `kubectl apply -f .` do when given a directory of manifests?',
    options: opts4(
      'Deletes all matching resources',
      'Creates or updates resources defined by all manifest files in the directory',
      'Only validates the files',
      'Restarts the cluster'
    ),
    correct: ['b'],
    explanation: '`kubectl apply -f <dir>` applies every manifest in the directory, creating or updating resources to match the declared configuration.',
    references: [REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control-plane controller is responsible for noticing a node has failed and updating its status?',
    options: opts4(
      'The Node controller (in kube-controller-manager)',
      'kube-proxy',
      'The container runtime',
      'etcd compactor'
    ),
    correct: ['a'],
    explanation: 'The Node controller within kube-controller-manager monitors node health and updates node status / triggers eviction logic when nodes become unreachable.',
    references: [REF_CONTROLLER, REF_NODES]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the function of a ServiceAccount?',
    options: opts4(
      'It is a human user login',
      'It provides an identity for processes running in Pods to authenticate to the API server',
      'It stores persistent volumes',
      'It schedules Pods'
    ),
    correct: ['b'],
    explanation: 'A ServiceAccount gives in-cluster workloads an identity to authenticate to the Kubernetes API, distinct from human user accounts.',
    references: [REF_RBAC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which kubectl command shows logs from a Pod\'s container?',
    options: opts4('kubectl logs web', 'kubectl get logs web', 'kubectl describe logs web', 'kubectl exec logs web'),
    correct: ['a'],
    explanation: '`kubectl logs <pod>` streams the container\'s stdout/stderr logs. The other forms are not valid for retrieving logs.',
    references: [REF_KUBECTL, REF_LOGGING]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Deployment is best suited for which kind of workload?',
    options: opts4(
      'A run-once batch task',
      'A stateless, long-running, replicated application',
      'A per-node daemon',
      'A scheduled cron task'
    ),
    correct: ['b'],
    explanation: 'Deployments manage stateless, long-running, replicated applications and provide rolling updates and rollbacks via ReplicaSets.',
    references: [REF_DEPLOY]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'How does Kubernetes DNS typically let a Pod reach a Service named `api` in namespace `prod`?',
    options: opts4(
      'By the Service node port only',
      'Via a DNS name like api.prod.svc.cluster.local',
      'By hardcoding the Pod IP',
      'It cannot; DNS is unsupported'
    ),
    correct: ['b'],
    explanation: 'Cluster DNS creates records for Services; a Service `api` in `prod` is reachable at `api.prod.svc.cluster.local` (or just `api` from within the same namespace).',
    references: [REF_SVC, REF_NETWORK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the effect of deleting a Deployment?',
    options: opts4(
      'Only the Deployment object is removed; Pods keep running',
      'The Deployment and its managed ReplicaSets and Pods are removed',
      'The namespace is deleted',
      'The node is drained'
    ),
    correct: ['b'],
    explanation: 'Deleting a Deployment cascades by default, removing its ReplicaSets and the Pods they manage, because of owner references.',
    references: [REF_DEPLOY, REF_RS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'What does `kubectl get pods -o wide` add compared to `kubectl get pods`?',
    options: opts4(
      'Nothing, it is identical',
      'Extra columns such as node name and Pod IP',
      'It deletes finished Pods',
      'It outputs JSON only'
    ),
    correct: ['b'],
    explanation: 'The `-o wide` output adds columns like the assigned node and Pod IP, useful for troubleshooting scheduling and networking.',
    references: [REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about controllers is correct?',
    options: opts4(
      'They run once at cluster start and stop',
      'They are control loops that watch state and drive it toward the desired spec',
      'They only run on worker nodes',
      'They replace the API server'
    ),
    correct: ['b'],
    explanation: 'Controllers are non-terminating control loops that watch the shared state through the API server and make changes to move current state toward desired state.',
    references: [REF_CONTROLLER]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'What does a PersistentVolumeClaim being in `Pending` state most commonly mean?',
    options: opts4(
      'The data is corrupted',
      'No suitable PersistentVolume / dynamic provisioner satisfied the claim yet',
      'The Pod was deleted',
      'The claim is bound and ready'
    ),
    correct: ['b'],
    explanation: 'A Pending PVC means it has not been bound — typically no matching PV exists and no StorageClass/provisioner has dynamically created one yet.',
    references: [REF_STORAGE]
  },

  // ── Container Orchestration (14) ──
  {
    domain: ORCH, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best captures why orchestration is needed at scale?',
    options: opts4(
      'Running one container by hand is hard',
      'Manually placing, scaling, healing, and networking many containers across many hosts is impractical',
      'Containers cannot run without orchestration',
      'Orchestration compiles application code'
    ),
    correct: ['b'],
    explanation: 'At scale, manual scheduling, scaling, self-healing, and networking of many containers across many machines is error-prone; orchestration automates it.',
    references: [REF_OVERVIEW]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which interface decouples the kubelet from a specific container runtime?',
    options: opts4('CNI', 'CRI', 'CSI', 'OCI'),
    correct: ['b'],
    explanation: 'The Container Runtime Interface (CRI) lets the kubelet work with any compliant runtime. CNI is for networking, CSI for storage, OCI for image/runtime formats.',
    references: [REF_CRI]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the Container Network Interface (CNI) standardize?',
    options: opts4(
      'How container runtimes pull images',
      'How network plugins configure Pod networking',
      'How volumes are attached',
      'How the API server authenticates'
    ),
    correct: ['b'],
    explanation: 'CNI is the standard for configuring network interfaces for containers/Pods, implemented by plugins like Calico, Cilium, and Flannel.',
    references: [REF_NETWORK]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'With a RollingUpdate strategy, `maxUnavailable` controls what?',
    options: opts4(
      'How many extra Pods can exist above desired count during the update',
      'How many Pods can be unavailable during the update',
      'The total cluster CPU',
      'The image pull timeout'
    ),
    correct: ['b'],
    explanation: '`maxUnavailable` caps how many Pods may be unavailable during a rolling update; `maxSurge` controls how many extra Pods can be created above desired count.',
    references: [REF_DEPLOY_STRAT]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A canary deployment strategy is characterized by what?',
    options: opts4(
      'Replacing all instances at once',
      'Releasing the new version to a small subset of traffic/users before full rollout',
      'Never updating production',
      'Running two clusters permanently'
    ),
    correct: ['b'],
    explanation: 'A canary release routes a small portion of traffic to the new version to validate it before progressively shifting all traffic, limiting blast radius.',
    references: [REF_DEPLOY_STRAT]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `kubectl rollout status deployment/web` report?',
    options: opts4(
      'The cluster version',
      'The progress/completion of the Deployment rollout',
      'Node CPU usage',
      'The Pod logs'
    ),
    correct: ['b'],
    explanation: '`kubectl rollout status` watches and reports whether a Deployment\'s rollout has completed successfully or is still progressing.',
    references: [REF_DEPLOY, REF_KUBECTL]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'The Cluster Autoscaler differs from the Horizontal Pod Autoscaler because it scales what?',
    options: opts4(
      'The number of Pod replicas',
      'The number of nodes in the cluster based on pending/unschedulable Pods',
      'Container memory limits',
      'The API server replicas'
    ),
    correct: ['b'],
    explanation: 'The Cluster Autoscaler adds or removes nodes when Pods cannot be scheduled or nodes are underutilized; the HPA changes Pod replica counts.',
    references: [REF_AUTOSCALE, REF_HPA]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command safely prepares a node for maintenance by evicting its Pods?',
    options: opts4(
      'kubectl drain <node>',
      'kubectl delete node <node>',
      'kubectl stop <node>',
      'kubectl scale node <node>'
    ),
    correct: ['a'],
    explanation: '`kubectl drain` cordons the node and evicts its Pods (respecting PodDisruptionBudgets) so it can be maintained without abrupt disruption.',
    references: [REF_NODES, REF_KUBECTL]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `kubectl cordon <node>` do?',
    options: opts4(
      'Deletes the node',
      'Marks the node unschedulable so no new Pods are placed there',
      'Evicts all Pods immediately',
      'Reboots the node'
    ),
    correct: ['b'],
    explanation: 'Cordoning marks a node unschedulable; existing Pods keep running, but the scheduler will not place new Pods until the node is uncordoned.',
    references: [REF_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'How does Kubernetes ensure a Deployment with `replicas: 4` keeps four Pods running if one Pod is deleted manually?',
    options: opts4(
      'It ignores manual deletions',
      'The ReplicaSet controller observes the deficit and creates a replacement Pod',
      'It alerts an operator to act',
      'It scales the Deployment to zero'
    ),
    correct: ['b'],
    explanation: 'The ReplicaSet controller continuously reconciles; when actual replicas drop below desired, it creates new Pods to restore the count.',
    references: [REF_RS, REF_CONTROLLER]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A DaemonSet automatically schedules a Pod onto a newly added node that matches its node selector.',
    options: TF,
    correct: ['true'],
    explanation: 'True. As nodes join the cluster (and match any selectors/tolerations), the DaemonSet controller adds the daemon Pod to them automatically.',
    references: [REF_DS]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL benefits orchestration platforms like Kubernetes typically provide.',
    options: opts4(
      'Automated scheduling and bin-packing of workloads',
      'Self-healing via reconciliation',
      'Horizontal scaling of workloads',
      'Automatically writing application business logic'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Kubernetes automates scheduling, self-healing, and scaling, but it does not write your application code; that remains the developer\'s responsibility.',
    references: [REF_OVERVIEW]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of a PodDisruptionBudget during voluntary disruptions like draining?',
    options: opts4(
      'It increases Pod CPU',
      'It limits how many Pods of an application can be down simultaneously',
      'It schedules Pods faster',
      'It encrypts Pod traffic'
    ),
    correct: ['b'],
    explanation: 'A PodDisruptionBudget ensures a minimum number/percentage of Pods remain available during voluntary disruptions (e.g., node drains), protecting availability.',
    references: [REF_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Why are container images important for orchestration portability?',
    options: opts4(
      'They contain the host kernel',
      'They package the application and its dependencies into an immutable, portable artifact',
      'They store cluster state',
      'They define RBAC roles'
    ),
    correct: ['b'],
    explanation: 'Container images bundle the app and dependencies into an immutable artifact that runs consistently across environments, which underpins portable orchestration.',
    references: [REF_CONTAINERS, REF_OCI]
  },

  // ── Cloud Native Architecture (11) ──
  {
    domain: ARCH, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Cloud native systems aim to be resilient, manageable, and observable, combined with robust automation. What does this enable?',
    options: opts4(
      'Slower, manual release cycles',
      'Frequent and predictable high-impact changes with minimal toil',
      'Elimination of all monitoring',
      'Single-server deployments only'
    ),
    correct: ['b'],
    explanation: 'The CNCF definition states these properties, combined with automation, let engineers make high-impact changes frequently and predictably with minimal toil.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A monolithic architecture is best described as what?',
    options: opts4(
      'Many independently deployed services',
      'A single, tightly coupled unit where components are deployed together',
      'A serverless function set',
      'A service mesh'
    ),
    correct: ['b'],
    explanation: 'A monolith packages all functionality into a single deployable unit; components are tightly coupled and released together, unlike microservices.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'In a service mesh, what is the typical role of a "sidecar proxy"?',
    options: opts4(
      'It builds container images',
      'It intercepts and manages network traffic to/from the service for routing, security, and telemetry',
      'It stores persistent data',
      'It schedules Pods'
    ),
    correct: ['b'],
    explanation: 'A service mesh deploys a sidecar proxy beside each service to transparently handle traffic routing, mTLS, retries, and metrics without changing app code.',
    references: [REF_SERVICEMESH]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is autoscaling considered a cloud native pattern?',
    options: opts4(
      'It removes the need for containers',
      'It dynamically matches capacity to demand, improving efficiency and resilience',
      'It disables observability',
      'It only applies to databases'
    ),
    correct: ['b'],
    explanation: 'Autoscaling adjusts resources to current demand automatically, improving cost efficiency and resilience — a core cloud native operational pattern.',
    references: [REF_AUTOSCALE, REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'The "12-factor app" methodology is associated with what goal?',
    options: opts4(
      'Building monoliths',
      'Building software-as-a-service apps that are portable and scalable in cloud environments',
      'Disabling configuration management',
      'Avoiding stateless design'
    ),
    correct: ['b'],
    explanation: 'The 12-factor methodology offers practices (config in env, stateless processes, etc.) for building portable, scalable cloud apps, aligning with cloud native principles.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which describes "loose coupling" between microservices?',
    options: opts4(
      'Services share one in-process memory space',
      'Services interact through well-defined APIs and can evolve independently',
      'Services must be deployed together',
      'Services share a single binary'
    ),
    correct: ['b'],
    explanation: 'Loose coupling means services communicate via stable APIs/contracts, so each can be developed, deployed, and scaled independently.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a primary motivation for using containers in cloud native architecture?',
    options: opts4(
      'They include a full guest OS for isolation',
      'They provide lightweight, consistent, portable packaging of apps and dependencies',
      'They eliminate the need for orchestration',
      'They store persistent data by default'
    ),
    correct: ['b'],
    explanation: 'Containers package an app with its dependencies into a lightweight, portable, consistent artifact that runs the same across environments, unlike heavier VMs.',
    references: [REF_CONTAINERS, REF_OCI]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is an example of a CNCF graduated project widely used for container orchestration?',
    options: opts4('Kubernetes', 'A proprietary scheduler', 'systemd', 'GNU Make'),
    correct: ['a'],
    explanation: 'Kubernetes was the first CNCF graduated project and is the de facto standard for container orchestration in the cloud native landscape.',
    references: [REF_CNCF, REF_LANDSCAPE]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Vendor neutrality is a core principle of the CNCF, helping avoid lock-in.',
    options: TF,
    correct: ['true'],
    explanation: 'True. The CNCF promotes vendor-neutral, open governance projects to foster interoperability and reduce vendor lock-in.',
    references: [REF_CNCF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Event-driven architecture in cloud native systems primarily promotes what?',
    options: opts4(
      'Tightly synchronized blocking calls only',
      'Asynchronous, decoupled communication where components react to events',
      'A single shared database for all services',
      'Disabling messaging entirely'
    ),
    correct: ['b'],
    explanation: 'Event-driven architectures use asynchronous events/messages so producers and consumers are decoupled and can scale and evolve independently.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a common downside of a monolithic application as it grows?',
    options: opts4(
      'It is always faster to deploy',
      'A small change can require redeploying the entire application, slowing delivery',
      'It scales individual features independently',
      'It has no shared failure domain'
    ),
    correct: ['b'],
    explanation: 'In a large monolith, changes to one part typically require rebuilding and redeploying the whole app, increasing risk and slowing delivery — a key reason teams adopt microservices.',
    references: [REF_CN_DEF]
  },

  // ── Cloud Native Observability (5) ──
  {
    domain: OBS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What distinguishes "observability" from basic "monitoring"?',
    options: opts4(
      'Observability only uses ping checks',
      'Observability lets you ask new questions about unknown failure modes from telemetry, not just predefined dashboards',
      'They are identical concepts',
      'Monitoring requires no metrics'
    ),
    correct: ['b'],
    explanation: 'Monitoring tracks known/expected conditions; observability uses rich telemetry (metrics, logs, traces) to investigate unanticipated issues and ask new questions.',
    references: [REF_OTEL]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'In Prometheus, what does "scraping" refer to?',
    options: opts4(
      'Deleting old metrics',
      'Periodically pulling metrics from instrumented targets\' HTTP endpoints',
      'Encrypting logs',
      'Compiling code'
    ),
    correct: ['b'],
    explanation: 'Prometheus uses a pull model: it scrapes (HTTP-fetches) metrics from configured targets at intervals and stores them as time series.',
    references: [REF_PROM]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'A "span" in distributed tracing represents what?',
    options: opts4(
      'A whole microservice',
      'A single named, timed operation within a trace',
      'A container image layer',
      'A node in the cluster'
    ),
    correct: ['b'],
    explanation: 'A span is a single timed unit of work (operation) within a trace; spans link together (parent/child) to represent a request\'s full path.',
    references: [REF_TRACING]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Fluentd / Fluent Bit are commonly used for what in Kubernetes?',
    options: opts4(
      'Scheduling Pods',
      'Collecting, processing, and forwarding logs',
      'Storing metrics time series',
      'Building images'
    ),
    correct: ['b'],
    explanation: 'Fluentd and Fluent Bit are CNCF log collectors/forwarders that aggregate logs from containers and ship them to backends for storage and analysis.',
    references: [REF_FLUENTD, REF_LOGGING]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is structured logging (e.g., JSON) preferred in cloud native environments?',
    options: opts4(
      'It uses less disk than all other formats always',
      'It is machine-parseable, enabling reliable filtering, querying, and correlation at scale',
      'It cannot be aggregated',
      'It disables log levels'
    ),
    correct: ['b'],
    explanation: 'Structured logs (key-value/JSON) are easily parsed and indexed by log pipelines, enabling consistent querying, filtering, and correlation across distributed services.',
    references: [REF_LOGGING, REF_FLUENTD]
  },

  // ── Cloud Native Application Delivery (5) ──
  {
    domain: DELIV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A Helm "chart" is best described as what?',
    options: opts4(
      'A monitoring dashboard',
      'A packaged collection of templated Kubernetes manifests and metadata',
      'A container runtime',
      'A network policy'
    ),
    correct: ['b'],
    explanation: 'A Helm chart bundles templated Kubernetes manifests plus metadata and default values, enabling repeatable, parameterized application installs.',
    references: [REF_HELM]
  },
  {
    domain: DELIV, difficulty: 2, type: QType.SINGLE,
    stem: 'In GitOps, how is a change to production typically made?',
    options: opts4(
      'By manually editing the cluster with kubectl',
      'By committing a change to the Git repository, which an agent reconciles into the cluster',
      'By SSHing into nodes',
      'By rebuilding the cluster from scratch'
    ),
    correct: ['b'],
    explanation: 'GitOps drives changes through Git: a commit/merge updates desired state, and a reconciler (e.g., Argo CD, Flux) applies it to the cluster automatically.',
    references: [REF_GITOPS, REF_ARGO]
  },
  {
    domain: DELIV, difficulty: 2, type: QType.SINGLE,
    stem: 'What is "Continuous Integration" (CI)?',
    options: opts4(
      'Deploying directly to production without tests',
      'Frequently merging code changes into a shared branch with automated build and test',
      'Manually integrating code once per release',
      'Storing images in Git'
    ),
    correct: ['b'],
    explanation: 'CI is the practice of frequently integrating code into a shared repository, with automated builds and tests catching issues early.',
    references: [REF_CICD]
  },
  {
    domain: DELIV, difficulty: 3, type: QType.SINGLE,
    stem: 'What is a key advantage of declarative application delivery?',
    options: opts4(
      'It requires manual step-by-step deployment scripts',
      'Desired state is version-controlled and the system reconciles drift automatically',
      'It prevents rollbacks',
      'It removes the need for testing'
    ),
    correct: ['b'],
    explanation: 'Declarative delivery stores desired state (e.g., in Git) and lets controllers reconcile and correct drift, improving auditability and reliability.',
    references: [REF_GITOPS, REF_KUSTOMIZE]
  },
  {
    domain: DELIV, difficulty: 3, type: QType.SINGLE,
    stem: 'How does Kustomize differ from Helm at a high level?',
    options: opts4(
      'Kustomize uses template-free overlays; Helm uses templated charts with values',
      'They are the same tool',
      'Kustomize builds container images; Helm does not',
      'Helm cannot manage Kubernetes resources'
    ),
    correct: ['a'],
    explanation: 'Kustomize customizes plain YAML via bases/overlays without templating, while Helm packages and renders templated charts parameterized by values; both deploy to Kubernetes.',
    references: [REF_KUSTOMIZE, REF_HELM]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Kubernetes Fundamentals (30) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which object is the recommended way to run a stateless web application with multiple replicas?',
    options: opts4('Pod', 'Deployment', 'Job', 'CronJob'),
    correct: ['b'],
    explanation: 'A Deployment manages a replicated set of stateless Pods and supports rolling updates and rollbacks, which is recommended over creating bare Pods.',
    references: [REF_DEPLOY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which control-plane store would you back up to be able to restore an entire cluster\'s state?',
    options: opts4('kubelet cache', 'etcd', 'kube-proxy rules', 'container image registry'),
    correct: ['b'],
    explanation: 'etcd holds all cluster state, so backing up etcd is essential for disaster recovery of the cluster\'s desired and observed state.',
    references: [REF_ETCD]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the relationship between a Deployment and a ReplicaSet?',
    options: opts4(
      'They are unrelated',
      'A Deployment manages ReplicaSets, which manage Pods',
      'A ReplicaSet manages Deployments',
      'Both directly schedule onto nodes themselves'
    ),
    correct: ['b'],
    explanation: 'A Deployment creates and manages ReplicaSets (one per revision); each ReplicaSet ensures its desired number of Pods are running.',
    references: [REF_DEPLOY, REF_RS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which kubectl command creates resources from a manifest without tracking applied configuration annotations?',
    options: opts4('kubectl create -f app.yaml', 'kubectl apply -f app.yaml', 'kubectl get -f app.yaml', 'kubectl edit -f app.yaml'),
    correct: ['a'],
    explanation: '`kubectl create -f` imperatively creates resources and errors if they exist. `kubectl apply` is declarative and records last-applied configuration.',
    references: [REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A headless Service is created by setting which field?',
    options: opts4(
      'type: NodePort',
      'clusterIP: None',
      'externalName: example.com',
      'sessionAffinity: ClientIP'
    ),
    correct: ['b'],
    explanation: 'Setting `clusterIP: None` makes a headless Service: no virtual IP/load balancing; DNS returns the Pod IPs directly, useful for StatefulSets.',
    references: [REF_SVC]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which object defines a desired number of identical Pod replicas but is usually managed by a Deployment rather than created directly?',
    options: opts4('ReplicaSet', 'DaemonSet', 'StatefulSet', 'Job'),
    correct: ['a'],
    explanation: 'A ReplicaSet maintains a stable set of replica Pods. You normally manage it via a Deployment, which adds rollout/rollback features.',
    references: [REF_RS, REF_DEPLOY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the `kubectl get nodes` command show?',
    options: opts4(
      'All Pods in the cluster',
      'The cluster\'s nodes and their status',
      'The container images on a node',
      'The Service endpoints'
    ),
    correct: ['b'],
    explanation: '`kubectl get nodes` lists the worker/control-plane nodes registered in the cluster along with status, roles, age, and version.',
    references: [REF_NODES, REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod stays in `Pending` and events show it cannot be scheduled. Which is a plausible cause?',
    options: opts4(
      'The container exited successfully',
      'No node has enough allocatable resources or matches the Pod\'s constraints',
      'The Service selector is wrong',
      'The image pulled successfully'
    ),
    correct: ['b'],
    explanation: 'A Pending unscheduled Pod often means the scheduler cannot find a node meeting resource requests, taints/tolerations, affinity, or other constraints.',
    references: [REF_SCHED, REF_RES]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which workload type is appropriate for a one-off database migration that must run to completion once?',
    options: opts4('Deployment', 'Job', 'DaemonSet', 'Service'),
    correct: ['b'],
    explanation: 'A Job runs Pods until a specified number complete successfully, which fits a one-off migration task. Deployments are for long-running services.',
    references: [REF_JOB]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which Kubernetes object maps a friendly DNS name to an external service via CNAME-like behavior?',
    options: opts4('ClusterIP Service', 'NodePort Service', 'ExternalName Service', 'Ingress'),
    correct: ['c'],
    explanation: 'An ExternalName Service maps the Service name to an external DNS name (returned as a CNAME), with no proxying or cluster IP.',
    references: [REF_SVC]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Why are liveness and readiness probes both useful together?',
    options: opts4(
      'They do the same thing',
      'Liveness restarts unhealthy containers; readiness gates traffic until the app is ready',
      'They replace Services',
      'They schedule Pods'
    ),
    correct: ['b'],
    explanation: 'Liveness detects a hung/broken container and triggers a restart; readiness keeps a starting or temporarily busy Pod out of Service endpoints until it can serve.',
    references: [REF_PROBE]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the difference between resource `requests` and `limits`?',
    options: opts4(
      'They are identical',
      'Requests guide scheduling/guaranteed resources; limits cap maximum usage',
      'Limits guide scheduling; requests cap usage',
      'Both only affect logging'
    ),
    correct: ['b'],
    explanation: 'Requests are used for scheduling and represent guaranteed minimums; limits cap the maximum a container may use (CPU throttled, memory OOMKilled if exceeded).',
    references: [REF_RES]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows resource usage (CPU/memory) of Pods, given metrics-server is installed?',
    options: opts4('kubectl top pods', 'kubectl usage pods', 'kubectl stat pods', 'kubectl metrics pods'),
    correct: ['a'],
    explanation: '`kubectl top pods` displays current CPU/memory usage for Pods, sourced from the metrics API (requires metrics-server).',
    references: [REF_KUBECTL, REF_RES]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does a Namespace NOT do by itself?',
    options: opts4(
      'Scope resource names',
      'Provide a boundary for things like ResourceQuotas',
      'Enforce network isolation between namespaces automatically',
      'Organize resources for multi-tenancy'
    ),
    correct: ['c'],
    explanation: 'Namespaces scope names and policies but do NOT automatically isolate network traffic; you need NetworkPolicies (and a capable CNI) for that.',
    references: [REF_NS, REF_NETWORK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'How can a Secret be exposed to a container?',
    options: opts4(
      'Only by hardcoding it into the image',
      'As environment variables or as files in a mounted volume',
      'Only via kubectl logs',
      'It cannot be exposed to containers'
    ),
    correct: ['b'],
    explanation: 'Secrets can be consumed as environment variables or mounted as files into the container filesystem, keeping sensitive values out of images.',
    references: [REF_SECRET]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What happens to a Pod\'s containers if the Pod is rescheduled to a different node?',
    options: opts4(
      'The same container instances move with running state preserved',
      'New containers are created on the new node; the old Pod instance is replaced',
      'Nothing changes; Pods never move',
      'The node is deleted'
    ),
    correct: ['b'],
    explanation: 'Pods are not migrated live. A controller creates a new Pod (new containers) on another node; the original Pod is terminated. Ephemeral data is lost unless on persistent storage.',
    references: [REF_PODS, REF_CONTROLLER]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Kubernetes Services.',
    options: opts4(
      'A Service provides a stable virtual IP for a set of Pods',
      'Services use selectors to find backend Pods',
      'ClusterIP is the default Service type',
      'Services store persistent data for Pods'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Services give a stable VIP, select Pods via labels, and default to ClusterIP. They do not provide persistent storage; that is PersistentVolumes.',
    references: [REF_SVC]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A ConfigMap is appropriate for storing TLS private keys and passwords.',
    options: TF,
    correct: ['false'],
    explanation: 'False. Sensitive data such as private keys and passwords belongs in a Secret, not a ConfigMap, which is for non-confidential configuration.',
    references: [REF_SECRET, REF_CM]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command edits a live resource in your default editor?',
    options: opts4('kubectl edit deployment web', 'kubectl modify deployment web', 'kubectl change deployment web', 'kubectl set deployment web'),
    correct: ['a'],
    explanation: '`kubectl edit <resource>` opens the live object in an editor and applies changes on save. The other subcommands are not valid for this purpose.',
    references: [REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the role of the cloud-controller-manager?',
    options: opts4(
      'It runs application containers',
      'It runs controllers that integrate with the underlying cloud provider (e.g., load balancers, nodes)',
      'It stores cluster state',
      'It schedules Pods'
    ),
    correct: ['b'],
    explanation: 'The cloud-controller-manager runs cloud-specific control loops (node, route, service/load-balancer) so cloud integration is decoupled from core Kubernetes.',
    references: [REF_COMPONENTS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which object grants a set of permissions within a single namespace?',
    options: opts4('ClusterRole', 'Role', 'PodSecurityPolicy', 'Namespace'),
    correct: ['b'],
    explanation: 'A Role defines permissions scoped to one namespace; a ClusterRole defines cluster-wide (or cross-namespace) permissions.',
    references: [REF_RBAC]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does binding a Role to a subject require?',
    options: opts4(
      'A NetworkPolicy',
      'A RoleBinding',
      'A Service',
      'An Ingress'
    ),
    correct: ['b'],
    explanation: 'A RoleBinding grants the permissions in a Role to subjects (users, groups, service accounts) within a namespace. ClusterRoleBinding does the cluster-wide equivalent.',
    references: [REF_RBAC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Why might you use an initContainer?',
    options: opts4(
      'To run the main application',
      'To run setup steps that must complete before the app containers start',
      'To schedule the Pod',
      'To expose the Pod as a Service'
    ),
    correct: ['b'],
    explanation: 'initContainers run to completion in order before the Pod\'s app containers start, useful for setup like waiting on dependencies or preparing data.',
    references: [REF_PODS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `kubectl delete pod web` do when the Pod is managed by a Deployment?',
    options: opts4(
      'Permanently removes it; nothing recreates it',
      'Deletes the Pod, and the controller creates a replacement to maintain desired replicas',
      'Deletes the entire Deployment',
      'Drains the node'
    ),
    correct: ['b'],
    explanation: 'Deleting a managed Pod creates a deficit; the ReplicaSet controller reconciles by creating a replacement Pod to keep the desired replica count.',
    references: [REF_RS, REF_CONTROLLER]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which field controls how a Pod\'s containers are restarted (Always, OnFailure, Never)?',
    options: opts4('restartPolicy', 'updateStrategy', 'imagePullPolicy', 'dnsPolicy'),
    correct: ['a'],
    explanation: 'The Pod `restartPolicy` (Always, OnFailure, Never) governs container restart behavior. Deployments require Always; Jobs typically use OnFailure or Never.',
    references: [REF_PODS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the Kubernetes networking model is correct?',
    options: opts4(
      'Pods cannot communicate across nodes',
      'Every Pod can communicate with every other Pod without NAT, by default model',
      'Each container in a Pod has a unique IP',
      'Services are required for any Pod-to-Pod traffic'
    ),
    correct: ['b'],
    explanation: 'The Kubernetes model requires that all Pods can reach all other Pods without NAT. Containers in a Pod share one IP; Services are not required for direct Pod-to-Pod traffic.',
    references: [REF_NETWORK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `kubectl rollout history deployment/web` show?',
    options: opts4(
      'Live Pod logs',
      'The revision history of the Deployment for rollback decisions',
      'Cluster events',
      'Node capacity'
    ),
    correct: ['b'],
    explanation: '`kubectl rollout history` lists the Deployment\'s revisions, which you can inspect and roll back to with `kubectl rollout undo`.',
    references: [REF_DEPLOY, REF_KUBECTL]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A PersistentVolume\'s reclaim policy is `Retain`. What happens when its bound PVC is deleted?',
    options: opts4(
      'The PV and its data are deleted immediately',
      'The PV is kept (Released) and its data preserved for manual handling',
      'The PV is automatically rebound to a new PVC',
      'The node is drained'
    ),
    correct: ['b'],
    explanation: 'With `Retain`, deleting the PVC leaves the PV in a Released state and preserves the data; an admin must manually reclaim or clean it up.',
    references: [REF_STORAGE]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes a "manifest" in Kubernetes?',
    options: opts4(
      'A running container',
      'A YAML/JSON file declaring the desired state of one or more API objects',
      'A node label',
      'A container registry'
    ),
    correct: ['b'],
    explanation: 'A manifest is a YAML or JSON file specifying desired API object state (kind, metadata, spec); applying it instructs Kubernetes to reconcile to that state.',
    references: [REF_KUBECTL, REF_API]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is `kubectl port-forward` typically used for?',
    options: opts4(
      'Permanently exposing a Service to the internet',
      'Temporarily accessing a Pod/Service locally for debugging',
      'Scaling a Deployment',
      'Draining a node'
    ),
    correct: ['b'],
    explanation: '`kubectl port-forward` tunnels a local port to a Pod/Service for ad-hoc local debugging or testing; it is not a production exposure mechanism.',
    references: [REF_KUBECTL]
  },

  // ── Container Orchestration (14) ──
  {
    domain: ORCH, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a container image?',
    options: opts4(
      'A running process on a node',
      'An immutable, layered package containing an application and its dependencies',
      'A virtual machine disk with a full OS kernel',
      'A Kubernetes Service'
    ),
    correct: ['b'],
    explanation: 'A container image is an immutable, layered artifact bundling the application and its dependencies (but not the OS kernel), from which containers are instantiated.',
    references: [REF_CONTAINERS, REF_OCI]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which standard ensures images built by one tool can run on any compliant runtime?',
    options: opts4('CNI', 'CSI', 'OCI image specification', 'RBAC'),
    correct: ['c'],
    explanation: 'The OCI Image Specification standardizes the image format so images are portable across compliant build tools and runtimes.',
    references: [REF_OCI]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the kubelet use the CRI for?',
    options: opts4(
      'To talk to the underlying container runtime to manage Pods and containers',
      'To attach storage volumes',
      'To configure Pod networking',
      'To authenticate users'
    ),
    correct: ['a'],
    explanation: 'The kubelet uses the Container Runtime Interface (CRI) gRPC API to instruct the container runtime (e.g., containerd) to pull images and run/stop containers.',
    references: [REF_CRI, REF_KUBELET]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A blue-green deployment is characterized by what?',
    options: opts4(
      'Gradually replacing Pods one at a time',
      'Running two complete environments and switching traffic from old (blue) to new (green) at once',
      'Never deploying new versions',
      'Serving traffic to a tiny canary subset'
    ),
    correct: ['b'],
    explanation: 'Blue-green keeps two full environments; you deploy to the idle one and switch all traffic over at once, enabling fast rollback by switching back.',
    references: [REF_DEPLOY_STRAT]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which autoscaler adjusts CPU/memory requests of containers based on usage?',
    options: opts4(
      'Horizontal Pod Autoscaler',
      'Vertical Pod Autoscaler',
      'Cluster Autoscaler',
      'kube-proxy'
    ),
    correct: ['b'],
    explanation: 'The Vertical Pod Autoscaler recommends/sets container resource requests based on observed usage. HPA scales replica count; Cluster Autoscaler scales nodes.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does `kubectl uncordon <node>` do?',
    options: opts4(
      'Deletes the node',
      'Marks the node schedulable again so new Pods can be placed there',
      'Evicts all Pods',
      'Reboots the node'
    ),
    correct: ['b'],
    explanation: 'Uncordoning reverses a cordon: the node becomes schedulable again and the scheduler may place new Pods on it.',
    references: [REF_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'When the Cluster Autoscaler removes a node, what does it consider first?',
    options: opts4(
      'It deletes nodes randomly',
      'Whether the node is underutilized and its Pods can be rescheduled elsewhere',
      'The node\'s hostname alphabetically',
      'The container image sizes'
    ),
    correct: ['b'],
    explanation: 'The Cluster Autoscaler scales down by removing underutilized nodes only when their Pods can be safely rescheduled onto other nodes (respecting constraints/PDBs).',
    references: [REF_AUTOSCALE, REF_NODES]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes "desired state" in an orchestrator?',
    options: opts4(
      'The current observed state of the cluster',
      'The declared target the user wants, which controllers continually work toward',
      'A snapshot of node hardware',
      'The container image digest'
    ),
    correct: ['b'],
    explanation: 'Desired state is the user-declared target (e.g., 3 replicas of an image); controllers continuously reconcile actual state to match it.',
    references: [REF_CONTROLLER, REF_OVERVIEW]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Why might a rolling update use `maxSurge: 1`?',
    options: opts4(
      'To allow one extra Pod above desired count during the update for zero-downtime',
      'To delete one Pod permanently',
      'To cap the cluster at one node',
      'To disable readiness probes'
    ),
    correct: ['a'],
    explanation: '`maxSurge: 1` lets the Deployment create one additional Pod beyond the desired count during a rolling update, helping maintain capacity and zero downtime.',
    references: [REF_DEPLOY_STRAT]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a key reason container images use layers?',
    options: opts4(
      'To encrypt the application',
      'To enable caching and reuse of unchanged layers, reducing build/transfer time',
      'To run multiple kernels',
      'To store cluster secrets'
    ),
    correct: ['b'],
    explanation: 'Layered images allow shared, cacheable layers; unchanged layers are reused across builds and pulls, improving efficiency and storage use.',
    references: [REF_CONTAINERS, REF_OCI]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: kube-proxy implements Service load balancing rules on each node.',
    options: TF,
    correct: ['true'],
    explanation: 'True. kube-proxy programs node networking (iptables/IPVS) so traffic to a Service VIP is distributed to backing Pod endpoints.',
    references: [REF_SVC, REF_NETWORK]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL standards/interfaces that promote pluggability in the Kubernetes ecosystem.',
    options: opts4(
      'CRI (Container Runtime Interface)',
      'CNI (Container Network Interface)',
      'CSI (Container Storage Interface)',
      'HTTP/2 only'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'CRI, CNI, and CSI are pluggable interfaces for runtimes, networking, and storage respectively, enabling vendor-neutral extensibility. HTTP/2 is a transport protocol, not a pluggability interface.',
    references: [REF_CRI, REF_NETWORK, REF_STORAGE]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does an orchestrator do when actual replicas exceed the desired count (e.g., after a scale-down)?',
    options: opts4(
      'It keeps all Pods running',
      'It terminates surplus Pods to converge to the desired count',
      'It creates more nodes',
      'It ignores the difference'
    ),
    correct: ['b'],
    explanation: 'Reconciliation works both ways: if there are too many Pods, the controller deletes surplus Pods to match the desired replica count.',
    references: [REF_RS, REF_CONTROLLER]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is an advantage of immutable container images for orchestration?',
    options: opts4(
      'Containers can be patched live in production safely',
      'The same image runs identically across dev, test, and prod, improving reproducibility',
      'Images change at runtime to adapt',
      'Images store per-node state'
    ),
    correct: ['b'],
    explanation: 'Immutable images guarantee the same artifact runs everywhere, eliminating environment drift and making deployments reproducible and rollbacks reliable.',
    references: [REF_CONTAINERS, REF_OCI]
  },

  // ── Cloud Native Architecture (11) ──
  {
    domain: ARCH, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is a core cloud native technique per the CNCF definition?',
    options: opts4(
      'Manual server patching',
      'Microservices',
      'Single shared monolithic binary',
      'Disabling automation'
    ),
    correct: ['b'],
    explanation: 'Microservices are explicitly cited (alongside containers, service meshes, immutable infrastructure, and declarative APIs) in the CNCF cloud native definition.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a primary benefit of decomposing an app into microservices?',
    options: opts4(
      'Eliminating the network entirely',
      'Independent development, deployment, and scaling of each service',
      'Guaranteeing lower complexity than a monolith',
      'Removing the need for observability'
    ),
    correct: ['b'],
    explanation: 'Microservices let teams build, deploy, and scale services independently; the trade-off is increased distributed-system complexity, which observability addresses.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability is typically NOT provided by a service mesh?',
    options: opts4(
      'mTLS between services',
      'Traffic routing and retries',
      'Compiling and building container images',
      'Telemetry/observability of service traffic'
    ),
    correct: ['c'],
    explanation: 'Service meshes handle traffic management, mTLS, and telemetry between services. Building/compiling container images is the job of build tooling, not a mesh.',
    references: [REF_SERVICEMESH]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does "infrastructure as code" contribute to cloud native operations?',
    options: opts4(
      'Manual, undocumented changes',
      'Version-controlled, repeatable, automated provisioning of infrastructure',
      'Disabling automation',
      'Per-server snowflake configuration'
    ),
    correct: ['b'],
    explanation: 'Infrastructure as code defines infrastructure declaratively in version control, enabling repeatable, auditable, automated provisioning aligned with cloud native automation goals.',
    references: [REF_CN_DEF, REF_GITOPS]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which CNCF project is widely used as a service proxy / data plane in service meshes?',
    options: opts4('Envoy', 'etcd', 'Helm', 'Fluentd'),
    correct: ['a'],
    explanation: 'Envoy is a CNCF graduated high-performance proxy commonly used as the data plane (sidecar) in service meshes like Istio.',
    references: [REF_LANDSCAPE, REF_SERVICEMESH]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is statelessness valued for cloud native application components?',
    options: opts4(
      'Stateless components cannot scale',
      'Stateless components are easier to scale horizontally and replace because no instance holds unique session state',
      'It removes the need for any storage anywhere',
      'It forces vertical scaling only'
    ),
    correct: ['b'],
    explanation: 'Stateless components can be freely added, removed, or replaced since no instance holds unique state, making horizontal scaling and resilience simpler. State is pushed to dedicated stores.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the CNCF "Graduated" maturity level signal?',
    options: opts4(
      'An experimental, early project',
      'A project with significant adoption, maturity, and sustainable governance',
      'A deprecated project',
      'A closed-source product'
    ),
    correct: ['b'],
    explanation: 'Graduated is the highest CNCF maturity level, indicating broad adoption, robust governance, security practices, and sustainability (e.g., Kubernetes, Prometheus).',
    references: [REF_CNCF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which describes the API gateway pattern in microservices?',
    options: opts4(
      'A single entry point that routes/aggregates requests to backend services',
      'A database for all services',
      'A container runtime',
      'A node-level log collector'
    ),
    correct: ['a'],
    explanation: 'An API gateway is a single entry point handling routing, aggregation, authentication, and rate limiting in front of backend microservices.',
    references: [REF_CN_DEF, REF_SERVICEMESH]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Adopting microservices universally reduces overall system complexity compared to a monolith.',
    options: TF,
    correct: ['false'],
    explanation: 'False. Microservices shift complexity into the distributed system (networking, data consistency, observability). They offer agility benefits but are not universally simpler.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is an example of "robust automation" in cloud native systems?',
    options: opts4(
      'Manually applying every change with no tooling',
      'Automated CI/CD pipelines and self-healing controllers',
      'Disabling rollbacks',
      'One-off shell scripts run by hand'
    ),
    correct: ['b'],
    explanation: 'Robust automation includes automated build/test/deploy pipelines and self-healing reconciliation, enabling frequent, predictable, low-toil changes per the CNCF definition.',
    references: [REF_CN_DEF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'What is "horizontal scaling" of a cloud native service?',
    options: opts4(
      'Adding more CPU/memory to a single instance',
      'Adding more instances/replicas to handle increased load',
      'Reducing the number of services',
      'Disabling autoscaling'
    ),
    correct: ['b'],
    explanation: 'Horizontal scaling adds more instances (replicas) to share load, the preferred cloud native approach for stateless services. Vertical scaling grows a single instance.',
    references: [REF_AUTOSCALE, REF_CN_DEF]
  },

  // ── Cloud Native Observability (5) ──
  {
    domain: OBS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which CNCF project is the de facto standard for metrics-based monitoring?',
    options: opts4('Prometheus', 'Helm', 'Argo CD', 'containerd'),
    correct: ['a'],
    explanation: 'Prometheus is the CNCF graduated, widely adopted standard for collecting and querying time-series metrics in cloud native systems.',
    references: [REF_PROM]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'What is an "alerting rule" in a monitoring system like Prometheus?',
    options: opts4(
      'A rule that builds container images',
      'A condition over metrics that, when met, fires an alert/notification',
      'A network policy',
      'A storage class'
    ),
    correct: ['b'],
    explanation: 'An alerting rule evaluates a metric expression; when the condition holds for a period, an alert fires and is routed (e.g., via Alertmanager) to notify operators.',
    references: [REF_PROM]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'What problem does distributed tracing specifically address in microservices?',
    options: opts4(
      'Storing container images',
      'Understanding latency and failures across service-to-service calls for a single request',
      'Scheduling Pods',
      'Encrypting volumes'
    ),
    correct: ['b'],
    explanation: 'Distributed tracing correlates spans across services for one request, exposing where latency or errors occur in a complex call graph that metrics/logs alone may miss.',
    references: [REF_TRACING]
  },
  {
    domain: OBS, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the OpenTelemetry Collector?',
    options: opts4(
      'A Kubernetes scheduler',
      'A vendor-agnostic component to receive, process, and export telemetry data',
      'A container runtime',
      'A package manager'
    ),
    correct: ['b'],
    explanation: 'The OpenTelemetry Collector is a vendor-agnostic service that receives, processes, and exports metrics, logs, and traces to various backends.',
    references: [REF_OTEL]
  },
  {
    domain: OBS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is correlating logs, metrics, and traces valuable?',
    options: opts4(
      'It is not; each should be used in isolation',
      'It lets engineers move from a high-level symptom (metric) to root cause (trace/log) quickly',
      'It removes the need for dashboards',
      'It prevents collecting telemetry'
    ),
    correct: ['b'],
    explanation: 'Correlating the three signals enables drilling from an anomaly in a metric to the specific trace and logs causing it, accelerating root-cause analysis.',
    references: [REF_OTEL, REF_LOGGING]
  },

  // ── Cloud Native Application Delivery (5) ──
  {
    domain: DELIV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which tool is commonly used for declarative GitOps continuous delivery to Kubernetes?',
    options: opts4('Argo CD', 'Prometheus', 'containerd', 'etcd'),
    correct: ['a'],
    explanation: 'Argo CD is a popular declarative GitOps continuous delivery tool that keeps cluster state in sync with a Git repository (Flux is another).',
    references: [REF_ARGO, REF_GITOPS]
  },
  {
    domain: DELIV, difficulty: 2, type: QType.SINGLE,
    stem: 'What does "Continuous Delivery" (CD) add on top of Continuous Integration?',
    options: opts4(
      'It removes automated testing',
      'It automates releasing validated changes so deployment is a low-risk, repeatable step',
      'It only compiles code',
      'It disables version control'
    ),
    correct: ['b'],
    explanation: 'Continuous Delivery extends CI by automating the release process so any validated build can be deployed reliably and frequently with minimal manual effort.',
    references: [REF_CICD]
  },
  {
    domain: DELIV, difficulty: 2, type: QType.SINGLE,
    stem: 'In Helm, what does a `values.yaml` file provide?',
    options: opts4(
      'The cluster\'s node list',
      'Configurable parameters that customize a chart\'s templated manifests',
      'Container image binaries',
      'RBAC audit logs'
    ),
    correct: ['b'],
    explanation: 'A Helm chart\'s `values.yaml` supplies default, overridable parameters that the chart\'s templates use to render environment-specific Kubernetes manifests.',
    references: [REF_HELM]
  },
  {
    domain: DELIV, difficulty: 3, type: QType.SINGLE,
    stem: 'A core GitOps principle is that the system state is what?',
    options: opts4(
      'Manually configured per environment',
      'Declaratively described and versioned, with continuous reconciliation toward it',
      'Never stored anywhere',
      'Only known to operators'
    ),
    correct: ['b'],
    explanation: 'GitOps principles state the desired system is declaratively expressed, versioned/immutable in Git, pulled automatically, and continuously reconciled.',
    references: [REF_GITOPS]
  },
  {
    domain: DELIV, difficulty: 3, type: QType.SINGLE,
    stem: 'What is a benefit of using a CI/CD pipeline with automated tests before deployment?',
    options: opts4(
      'It guarantees zero bugs forever',
      'It catches regressions early and makes releases faster and more reliable',
      'It eliminates the need for version control',
      'It prevents any rollbacks'
    ),
    correct: ['b'],
    explanation: 'Automated testing in the pipeline surfaces regressions before release, increasing confidence and enabling faster, safer, repeatable deployments.',
    references: [REF_CICD]
  }
];

const KCNA_DOMAINS = [
  { name: FUND, weight: 46 },
  { name: ORCH, weight: 22 },
  { name: ARCH, weight: 16 },
  { name: OBS, weight: 8 },
  { name: DELIV, weight: 8 }
];

const KCNA_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'linuxfoundation-kcna-p1',
    code: 'KCNA-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 90-minute, 65-question, blueprint-weighted set covering Kubernetes fundamentals, container orchestration, cloud native architecture, observability, and application delivery.',
    questions: P1
  },
  {
    slug: 'linuxfoundation-kcna-p2',
    code: 'KCNA-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 90-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'linuxfoundation-kcna-p3',
    code: 'KCNA-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 90-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const KCNA_BUNDLE = {
  slug: 'linuxfoundation-kcna',
  title: 'Kubernetes and Cloud Native Associate (KCNA)',
  description: 'All 3 KCNA practice exams in one bundle — covering Kubernetes fundamentals, container orchestration, cloud native architecture, observability, and application delivery, aligned to the CNCF KCNA exam curriculum.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 25000 // USD 250 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the KCNA bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:kcna-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedKcna(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'linuxfoundation' } });
  await db.vendor.upsert({
    where: { slug: 'linuxfoundation' },
    update: { name: 'Linux Foundation', description: 'Linux Foundation / CNCF certifications — Kubernetes, cloud native technologies, and the Kubernetes and Cloud Native Associate (KCNA) credential.' },
    create: { slug: 'linuxfoundation', name: 'Linux Foundation', description: 'Linux Foundation / CNCF certifications — Kubernetes, cloud native technologies, and the Kubernetes and Cloud Native Associate (KCNA) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'linuxfoundation' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of KCNA_EXAMS) {
    const title = `Kubernetes and Cloud Native Associate (KCNA) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the CNCF KCNA exam curriculum.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 90,
      passingScore: 75,
      questionCount: e.questions.length,
      domains: KCNA_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:kcna-seed' } });
    let teaserCount = 0;
    for (const q of e.questions) {
      await db.question.create({
        data: {
          examId: exam.id,
          domain: q.domain,
          difficulty: q.difficulty,
          type: q.type,
          stem: q.stem,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          references: q.references,
          status: QStatus.PUBLISHED,
          generatedBy: 'manual:kcna-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: KCNA_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: KCNA_BUNDLE.slug },
    update: {
      title: KCNA_BUNDLE.title,
      description: KCNA_BUNDLE.description,
      price: KCNA_BUNDLE.price,
      priceVoucher: KCNA_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: KCNA_BUNDLE.slug,
      title: KCNA_BUNDLE.title,
      description: KCNA_BUNDLE.description,
      price: KCNA_BUNDLE.price,
      priceVoucher: KCNA_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'linuxfoundation-kcna-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'linuxfoundation-kcna-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'linuxfoundation-kcna-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'linuxfoundation-kcna-p1', tier: 'VOUCHER' as const, position: 4 }
  ];
  for (const it of items) {
    await db.bundleItem.create({
      data: { bundleId: bundle.id, examId: examIds[it.examSlug], tier: it.tier, position: it.position }
    });
  }

  return {
    vendor: existingVendor ? 'updated' : 'created',
    exams: examResults,
    bundle: existingBundle ? 'updated' : 'created'
  };
}
