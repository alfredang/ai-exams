/**
 * KCSA bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:kcsa-seed'` and upserts catalog rows.
 *
 * Exported as `seedKcsa(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/kcsa.ts`) and the protected
 * admin API (`/api/admin/seed-kcsa`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is original and authored against the public CNCF
 * Kubernetes and Cloud Native Security Associate (KCSA) curriculum,
 * the Kubernetes security documentation, the 4Cs of Cloud Native
 * Security, and the Kubernetes threat model. It is NOT derived from
 * any real exam and makes no claim of being the real exam.
 *
 * KCSA domain blueprint (sums to 100):
 *   - Overview of Cloud Native Security            — 14% (9 / 65)
 *   - Kubernetes Cluster Component Security         — 22% (14 / 65)
 *   - Kubernetes Security Fundamentals              — 22% (14 / 65)
 *   - Kubernetes Threat Model                       — 16% (11 / 65)
 *   - Platform Security                             — 16% (11 / 65)
 *   - Compliance and Security Frameworks            — 10% (6 / 65)
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

const OVERVIEW = 'Overview of Cloud Native Security';
const CLUSTER = 'Kubernetes Cluster Component Security';
const FUND = 'Kubernetes Security Fundamentals';
const THREAT = 'Kubernetes Threat Model';
const PLATFORM = 'Platform Security';
const COMPLIANCE = 'Compliance and Security Frameworks';

const REF_SECURITY = { label: 'Kubernetes Docs — Cloud Native Security & Kubernetes (4Cs)', url: 'https://kubernetes.io/docs/concepts/security/cloud-native-security/' };
const REF_4C = { label: 'Kubernetes Docs — The 4C’s of Cloud Native Security', url: 'https://kubernetes.io/docs/concepts/security/cloud-native-security/#the-4c-s-of-cloud-native-security' };
const REF_SUPPLY = { label: 'Kubernetes Docs — Software Supply Chain Security', url: 'https://kubernetes.io/docs/concepts/security/supply-chain-security/' };
const REF_CHECKLIST = { label: 'Kubernetes Docs — Security Checklist', url: 'https://kubernetes.io/docs/concepts/security/security-checklist/' };
const REF_HARDEN = { label: 'Kubernetes Docs — Securing a Cluster', url: 'https://kubernetes.io/docs/tasks/administer-cluster/securing-a-cluster/' };
const REF_APISRV = { label: 'Kubernetes Docs — kube-apiserver Reference', url: 'https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/' };
const REF_ETCD = { label: 'Kubernetes Docs — Operating etcd clusters for Kubernetes', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/' };
const REF_KUBELET = { label: 'Kubernetes Docs — Kubelet authentication/authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/kubelet-authn-authz/' };
const REF_CONTROLLER = { label: 'Kubernetes Docs — kube-controller-manager Reference', url: 'https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/' };
const REF_SCHED = { label: 'Kubernetes Docs — kube-scheduler Reference', url: 'https://kubernetes.io/docs/reference/command-line-tools-reference/kube-scheduler/' };
const REF_KUBECONFIG = { label: 'Kubernetes Docs — PKI certificates and requirements', url: 'https://kubernetes.io/docs/setup/best-practices/certificates/' };
const REF_PROXY = { label: 'Kubernetes Docs — kube-proxy Reference', url: 'https://kubernetes.io/docs/reference/command-line-tools-reference/kube-proxy/' };
const REF_PORTS = { label: 'Kubernetes Docs — Ports and Protocols', url: 'https://kubernetes.io/docs/reference/networking/ports-and-protocols/' };
const REF_AUTHN = { label: 'Kubernetes Docs — Authenticating', url: 'https://kubernetes.io/docs/reference/access-authn-authz/authentication/' };
const REF_RBAC = { label: 'Kubernetes Docs — RBAC Authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/' };
const REF_ADMISSION = { label: 'Kubernetes Docs — Admission Controllers Reference', url: 'https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/' };
const REF_SA = { label: 'Kubernetes Docs — Configure Service Accounts for Pods', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/' };
const REF_SECRET = { label: 'Kubernetes Docs — Secrets', url: 'https://kubernetes.io/docs/concepts/configuration/secret/' };
const REF_ENCRYPT = { label: 'Kubernetes Docs — Encrypting Secret Data at Rest', url: 'https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/' };
const REF_NP = { label: 'Kubernetes Docs — Network Policies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/' };
const REF_SCTX = { label: 'Kubernetes Docs — Configure a Security Context for a Pod or Container', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/' };
const REF_PSA = { label: 'Kubernetes Docs — Pod Security Admission', url: 'https://kubernetes.io/docs/concepts/security/pod-security-admission/' };
const REF_PSS = { label: 'Kubernetes Docs — Pod Security Standards', url: 'https://kubernetes.io/docs/concepts/security/pod-security-standards/' };
const REF_AUDIT = { label: 'Kubernetes Docs — Auditing', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/' };
const REF_THREAT = { label: 'Kubernetes Docs — Security concepts and threat overview', url: 'https://kubernetes.io/docs/concepts/security/' };
const REF_SEAM = { label: 'Kubernetes Docs — Cloud Native Security (trust boundaries)', url: 'https://kubernetes.io/docs/concepts/security/cloud-native-security/' };
const REF_MULTITENANCY = { label: 'Kubernetes Docs — Multi-tenancy', url: 'https://kubernetes.io/docs/concepts/security/multi-tenancy/' };
const REF_RUNTIME = { label: 'Kubernetes Docs — Runtime Class', url: 'https://kubernetes.io/docs/concepts/containers/runtime-class/' };
const REF_SECCOMP = { label: 'Kubernetes Docs — Restrict a Container’s Syscalls with seccomp', url: 'https://kubernetes.io/docs/tutorials/security/seccomp/' };
const REF_APPARMOR = { label: 'Kubernetes Docs — Restrict a Container’s Access with AppArmor', url: 'https://kubernetes.io/docs/tutorials/security/apparmor/' };
const REF_NODE = { label: 'Kubernetes Docs — Node', url: 'https://kubernetes.io/docs/concepts/architecture/nodes/' };
const REF_LIMITS = { label: 'Kubernetes Docs — Resource Management for Pods and Containers', url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/' };
const REF_QUOTA = { label: 'Kubernetes Docs — Resource Quotas', url: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/' };
const REF_TLSBOOT = { label: 'Kubernetes Docs — TLS bootstrapping', url: 'https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/' };
const REF_NETPOLICY = { label: 'Kubernetes Docs — Network Policies (default deny)', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/#default-deny-all-ingress-traffic' };
const REF_CONTROLS = { label: 'Kubernetes Docs — Controlling Access to the Kubernetes API', url: 'https://kubernetes.io/docs/concepts/security/controlling-access/' };
const REF_RBAC_GP = { label: 'Kubernetes Docs — RBAC good practices', url: 'https://kubernetes.io/docs/concepts/security/rbac-good-practices/' };
const REF_SA_TOKEN = { label: 'Kubernetes Docs — ServiceAccount token volume projection', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#serviceaccount-token-volume-projection' };
const REF_CIS = { label: 'CIS — Kubernetes Benchmark', url: 'https://www.cisecurity.org/benchmark/kubernetes' };
const REF_NSA = { label: 'CNCF / NSA-CISA — Kubernetes Hardening Guidance (Security Checklist)', url: 'https://kubernetes.io/docs/concepts/security/security-checklist/' };
const REF_MITRE = { label: 'Kubernetes Docs — Security (threat modeling references)', url: 'https://kubernetes.io/docs/concepts/security/' };
const REF_SLSA = { label: 'Kubernetes Docs — Ensure SLSA-style supply chain security', url: 'https://kubernetes.io/docs/concepts/security/supply-chain-security/' };
const REF_SIGSTORE = { label: 'CNCF — Software Supply Chain Best Practices', url: 'https://kubernetes.io/docs/concepts/security/supply-chain-security/' };
const REF_NIST = { label: 'CNCF Cloud Native Security Whitepaper', url: 'https://www.cncf.io/reports/cloud-native-security-whitepaper/' };
const REF_OBSERV = { label: 'Kubernetes Docs — Logging Architecture', url: 'https://kubernetes.io/docs/concepts/cluster-administration/logging/' };
const REF_CONTAINERD = { label: 'Kubernetes Docs — Container Runtimes', url: 'https://kubernetes.io/docs/setup/production-environment/container-runtimes/' };
const REF_DASHBOARD = { label: 'Kubernetes Docs — Web UI (Dashboard) security', url: 'https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/' };
const REF_ANON = { label: 'Kubernetes Docs — Anonymous requests', url: 'https://kubernetes.io/docs/reference/access-authn-authz/authentication/#anonymous-requests' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Overview of Cloud Native Security (9) ──
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The "4Cs of Cloud Native Security" describe defence in depth across nested layers. Which ordering lists them from the OUTERMOST to the INNERMOST layer?',
    options: opts4(
      'Code → Container → Cluster → Cloud',
      'Cloud → Cluster → Container → Code',
      'Cluster → Cloud → Code → Container',
      'Container → Code → Cloud → Cluster'
    ),
    correct: ['b'],
    explanation: 'The 4Cs are layered as Cloud (or corporate datacenter) on the outside, then Cluster, then Container, then Code at the core. Each inner layer is protected by the security of the layers around it; weak outer layers cannot be fully compensated by inner controls.',
    references: [REF_4C]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best describes the purpose of "defence in depth" in cloud native security?',
    options: opts4(
      'Relying on a single strong perimeter firewall to block all attacks',
      'Applying multiple independent, layered controls so a failure of one does not compromise the whole system',
      'Encrypting only the data that regulators explicitly require',
      'Granting administrators broad access so they can respond quickly to incidents'
    ),
    correct: ['b'],
    explanation: 'Defence in depth layers independent controls (network, identity, runtime, code) so the compromise of any one control does not by itself lead to full compromise. It explicitly rejects single-point reliance and broad standing access.',
    references: [REF_SECURITY]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'In the 4Cs model, why can strong Code-layer practices NOT fully compensate for a weak Cloud layer?',
    options: opts4(
      'Code runs faster than infrastructure, so timing attacks are unavoidable',
      'A compromised Cloud/infrastructure layer can undermine every layer running on top of it, regardless of code quality',
      'The Code layer has no security responsibilities in cloud native systems',
      'Cloud providers contractually forbid application-level security controls'
    ),
    correct: ['b'],
    explanation: 'The 4Cs are nested: each layer depends on the trustworthiness of the layer beneath it. If the Cloud/infrastructure (hosts, network, IAM) is compromised, the attacker can subvert the cluster, containers, and code above it, so strong code alone is insufficient.',
    references: [REF_4C]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are properly considered part of the "Cloud" layer in the 4Cs model.',
    options: opts4(
      'The security of the underlying hosts/VMs and their operating systems',
      'Network access controls (firewalls, security groups) around the cluster',
      'The application source code’s input validation logic',
      'Cloud provider IAM and infrastructure API access'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'The Cloud (or corporate datacenter) layer covers infrastructure: host/VM hardening, network access controls around the cluster, and the provider IAM/infrastructure APIs. Application input validation belongs to the Code layer.',
    references: [REF_4C, REF_SECURITY]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A "shared responsibility model" with a managed Kubernetes provider typically means which of the following?',
    options: opts4(
      'The provider secures everything, including your workloads and RBAC',
      'The customer secures everything, including the control plane internals',
      'The provider secures the managed control plane/infrastructure, while the customer secures workloads, RBAC, and configuration',
      'Responsibility rotates monthly between provider and customer'
    ),
    correct: ['c'],
    explanation: 'In a managed offering the provider typically operates and secures the control plane and underlying infrastructure, while the customer remains responsible for workload security, RBAC, network policy, secrets handling, and cluster configuration.',
    references: [REF_SECURITY]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which goal is the primary focus of software supply chain security in a cloud native context?',
    options: opts4(
      'Maximising container image size for caching efficiency',
      'Ensuring the integrity and provenance of artifacts from source code through build to deployment',
      'Eliminating the need for any runtime security controls',
      'Replacing all open-source dependencies with proprietary ones'
    ),
    correct: ['b'],
    explanation: 'Supply chain security focuses on integrity and provenance: trusted source, reproducible/verified builds, signed artifacts, and verified deployment, so that what runs in production is what was intended and unmodified.',
    references: [REF_SUPPLY]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In cloud native security, "least privilege" means each component and identity should have only the permissions required to perform its function, and no more.',
    options: tf(),
    correct: ['a'],
    explanation: 'Least privilege is a foundational principle: components, service accounts, and users should receive only the minimum permissions needed for their function, reducing blast radius if any one identity is compromised.',
    references: [REF_RBAC_GP]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which description best captures the cloud native security concept of a "trust boundary"?',
    options: opts4(
      'A point in the system where data or control crosses between zones of differing trust, requiring validation or authentication',
      'The maximum number of nodes a cluster can have before it becomes insecure',
      'A configurable timeout after which all tokens automatically expire',
      'The physical perimeter fence of a datacenter only'
    ),
    correct: ['a'],
    explanation: 'A trust boundary is where control or data passes between components/zones with different trust levels (e.g., user → API server, pod → pod across tenants). Crossing one should trigger authentication, authorization, and/or validation.',
    references: [REF_SEAM]
  },
  {
    domain: OVERVIEW, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization wants to "shift security left." In cloud native terms, what does this primarily involve?',
    options: opts4(
      'Moving all security responsibility onto the production on-call team',
      'Integrating security checks (scanning, policy, IaC review) early in development and CI rather than only at runtime',
      'Disabling runtime controls because earlier checks make them redundant',
      'Performing manual penetration tests only after release'
    ),
    correct: ['b'],
    explanation: 'Shifting left means embedding security activities (dependency/image scanning, IaC and manifest policy checks, secure coding) early in development and CI/CD, catching issues before deployment. It complements, not replaces, runtime controls.',
    references: [REF_SUPPLY, REF_SECURITY]
  },

  // ── Kubernetes Cluster Component Security (14) ──
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which control plane component is the single front-end for the Kubernetes control plane and the primary target that must enforce authentication and authorization?',
    options: opts4('kube-scheduler', 'etcd', 'kube-apiserver', 'kubelet'),
    correct: ['c'],
    explanation: 'The kube-apiserver is the front-end of the control plane; all reads/writes to cluster state go through it, so it must enforce authentication, authorization, and admission control. etcd is the datastore behind it.',
    references: [REF_APISRV, REF_CONTROLS]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is unauthenticated or unencrypted access to etcd considered equivalent to full cluster compromise?',
    options: opts4(
      'etcd stores only metrics, so exposure leaks just performance data',
      'etcd holds all cluster state including Secrets; read/write access lets an attacker exfiltrate secrets and alter any object',
      'etcd is only reachable from the internet by design',
      'etcd automatically re-encrypts itself if accessed by an unknown client'
    ),
    correct: ['b'],
    explanation: 'etcd is the source of truth for all Kubernetes objects, including Secrets and RBAC. Direct read access exposes every secret; write access lets an attacker mutate any resource, bypassing the API server’s authz, hence full compromise.',
    references: [REF_ETCD, REF_ENCRYPT]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which kube-apiserver setting should be avoided because it allows requests with no credentials to be treated as a specific subject?',
    options: opts4(
      '--anonymous-auth=false',
      '--anonymous-auth=true (combined with permissive RBAC)',
      '--authorization-mode=RBAC',
      '--audit-policy-file set to a restrictive policy'
    ),
    correct: ['b'],
    explanation: 'With `--anonymous-auth=true`, unauthenticated requests are assigned the `system:anonymous` user / `system:unauthenticated` group. If RBAC then grants those subjects anything beyond trivial endpoints, attackers gain access without credentials. Disabling anonymous auth (or tightly scoping it) is recommended.',
    references: [REF_ANON, REF_APISRV]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recommendations for securing the kubelet API.',
    options: opts4(
      'Disable anonymous authentication to the kubelet',
      'Set the kubelet authorization mode to Webhook (delegate to the API server) instead of AlwaysAllow',
      'Expose the read-only port (10255) publicly for easier monitoring',
      'Restrict and rotate kubelet client certificates'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Harden the kubelet by disabling anonymous auth, using Webhook authorization (not AlwaysAllow), and managing/rotating its certificates. The unauthenticated read-only port should be disabled, not exposed publicly.',
    references: [REF_KUBELET, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Communication between the Kubernetes control plane components and etcd should be protected primarily with which mechanism?',
    options: opts4(
      'Plaintext on a private subnet only',
      'Mutual TLS (client and server certificates)',
      'HTTP basic authentication',
      'A shared static API token in a query string'
    ),
    correct: ['b'],
    explanation: 'etcd and the API server should communicate over mutual TLS with peer/client certificates so traffic is encrypted and both ends are authenticated. Relying on network privacy alone or weak auth is insufficient for this critical datastore.',
    references: [REF_ETCD, REF_KUBECONFIG]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which component watches the API server for unscheduled Pods and assigns them to nodes, and therefore should not be exposed to untrusted input on its serving endpoints?',
    options: opts4('kube-proxy', 'kube-scheduler', 'etcd', 'cloud-controller-manager'),
    correct: ['b'],
    explanation: 'The kube-scheduler binds unscheduled Pods to nodes based on constraints and policies. Like other control plane components, its serving/metrics endpoints should bind to localhost or be authenticated, not exposed broadly.',
    references: [REF_SCHED]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'The kube-controller-manager runs many controllers and holds powerful credentials. Which practice reduces risk if a single controller is exploited?',
    options: opts4(
      'Run all controllers under the cluster-admin user',
      'Use `--use-service-account-credentials=true` so controllers use separate, scoped service accounts',
      'Disable RBAC for the controller manager',
      'Expose the controller manager’s insecure port for debugging'
    ),
    correct: ['b'],
    explanation: 'Setting `--use-service-account-credentials=true` makes individual controllers use distinct, least-privileged service accounts instead of one shared powerful identity, limiting blast radius if one controller is compromised.',
    references: [REF_CONTROLLER, REF_RBAC_GP]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Binding control plane component metrics/health ports to 0.0.0.0 without authentication is a recommended hardening practice.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Component endpoints (metrics, health, debug) should bind to localhost or require authentication. Exposing them on all interfaces without auth can leak sensitive information or enable abuse, contrary to hardening guidance.',
    references: [REF_HARDEN, REF_PORTS]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the kube-apiserver admission control phase is correct?',
    options: opts4(
      'Admission controllers run before authentication',
      'Admission controllers run after authentication and authorization and can validate or mutate requests before persistence',
      'Admission controllers only run for read (GET) requests',
      'Admission controllers replace RBAC entirely'
    ),
    correct: ['b'],
    explanation: 'The request flow is authentication → authorization → admission. Admission controllers (mutating then validating) act on create/update/delete requests before objects are persisted to etcd, enforcing policy beyond RBAC.',
    references: [REF_ADMISSION, REF_CONTROLS]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker obtains a kubelet client certificate from a worker node. Without further controls, what is the most direct risk?',
    options: opts4(
      'They can only view that node’s CPU temperature',
      'They may read Secrets and exec into Pods scheduled on that node and, with the Node authorizer plus a forged identity, potentially affect other objects',
      'They gain read access to the cloud provider billing console',
      'Nothing — kubelet certificates have no privileges'
    ),
    correct: ['b'],
    explanation: 'A node’s kubelet credentials can access Pods and their Secrets on that node and interact with the API as a node identity. This is why kubelet credentials must be protected/rotated and the Node authorizer + NodeRestriction admission plugin are used to constrain them.',
    references: [REF_KUBELET, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is enabling encryption at rest for Secrets in etcd important even when etcd disk access is "restricted"?',
    options: opts4(
      'It improves API server throughput',
      'It protects Secret values if etcd data files, snapshots, or backups are exposed',
      'It is required to use NetworkPolicies',
      'It disables the need for RBAC on Secrets'
    ),
    correct: ['b'],
    explanation: 'By default Secrets are stored only base64-encoded in etcd. Encryption at rest protects their plaintext if etcd files, disk images, or backups leak — a defence-in-depth control beyond filesystem permissions.',
    references: [REF_ENCRYPT, REF_SECRET]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which port range/component is the unauthenticated kubelet "read-only port" that hardening guidance recommends disabling?',
    options: opts4('10250 (authenticated kubelet API)', '10255 (read-only kubelet port)', '6443 (API server)', '2379 (etcd client)'),
    correct: ['b'],
    explanation: 'Port 10255 historically served unauthenticated read-only kubelet data. It should be disabled (set the read-only port to 0); the authenticated kubelet API is on 10250.',
    references: [REF_PORTS, REF_KUBELET]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'kube-proxy programs node networking rules for Services. From a security standpoint, which concern is most relevant to kube-proxy and the data plane?',
    options: opts4(
      'It stores all Secrets in plaintext on disk',
      'Misconfiguration or a compromised node can manipulate Service routing/iptables-ipvs rules affecting traffic',
      'It is the only component that performs admission control',
      'It directly authenticates external users to the cluster'
    ),
    correct: ['b'],
    explanation: 'kube-proxy maintains node-level Service routing (iptables/IPVS). A compromised node or misconfiguration can redirect or intercept Service traffic, so node integrity and least-privilege node access matter for the data plane.',
    references: [REF_PROXY, REF_NODE]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Kubelet TLS bootstrapping is used so that new nodes can obtain client certificates. Which security property must the bootstrap process preserve?',
    options: opts4(
      'Any pod can request a signed kubelet certificate for any node',
      'Certificate Signing Requests are authorized and approved (manually or by a trusted controller) before certs are issued',
      'Bootstrap tokens should never expire so nodes can rejoin anytime',
      'The CA private key is distributed to every node for self-signing'
    ),
    correct: ['b'],
    explanation: 'TLS bootstrapping must ensure CSRs from bootstrapping kubelets are properly authorized and approved before signing, and bootstrap tokens are scoped and short-lived. The CA key is never distributed to nodes.',
    references: [REF_TLSBOOT, REF_KUBECONFIG]
  },

  // ── Kubernetes Security Fundamentals (14) ──
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Kubernetes, which mechanism is the primary way to enforce least-privilege access to the API for users and service accounts?',
    options: opts4(
      'NetworkPolicy',
      'Role-Based Access Control (RBAC)',
      'PodDisruptionBudget',
      'HorizontalPodAutoscaler'
    ),
    correct: ['b'],
    explanation: 'RBAC (Roles/ClusterRoles bound via RoleBindings/ClusterRoleBindings) governs which subjects can perform which verbs on which API resources, and is the principal least-privilege control for the Kubernetes API.',
    references: [REF_RBAC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which RBAC design choice most directly violates least privilege?',
    options: opts4(
      'A namespaced Role granting get/list on ConfigMaps in one namespace',
      'Binding the built-in cluster-admin ClusterRole to a workload service account',
      'A Role allowing create on Jobs in a CI namespace',
      'A ClusterRole granting get on Nodes for a monitoring agent'
    ),
    correct: ['b'],
    explanation: 'Binding cluster-admin to a workload service account grants unrestricted control of the entire cluster to a pod identity — a severe least-privilege violation. The other examples are narrowly scoped.',
    references: [REF_RBAC_GP, REF_RBAC]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'By default, what does a NetworkPolicy-less namespace allow for pod-to-pod traffic in a cluster with a policy-enforcing CNI?',
    options: opts4(
      'All traffic is denied by default',
      'All ingress and egress traffic is allowed (non-isolated) until a policy selects the pod',
      'Only traffic to the API server is allowed',
      'Only DNS traffic is allowed'
    ),
    correct: ['b'],
    explanation: 'Pods are non-isolated by default: all traffic is allowed until a NetworkPolicy selects them. Once selected for a direction, only explicitly allowed connections are permitted; achieving default-deny requires an explicit policy.',
    references: [REF_NP, REF_NETPOLICY]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which NetworkPolicy specification implements a "default deny all ingress" for pods in a namespace?',
    options: opts4(
      'A policy with podSelector: {} and policyTypes: [Ingress] and no ingress rules',
      'A policy with podSelector matching app=web and an allow-all ingress rule',
      'Deleting all NetworkPolicies in the namespace',
      'A policy with policyTypes: [Egress] only'
    ),
    correct: ['a'],
    explanation: 'An empty podSelector ({}) selects all pods; specifying policyTypes: [Ingress] with no ingress rules denies all inbound traffic to those pods, the canonical default-deny-ingress policy.',
    references: [REF_NETPOLICY, REF_NP]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL securityContext settings that help harden a container against privilege escalation.',
    options: opts4(
      'runAsNonRoot: true',
      'allowPrivilegeEscalation: false',
      'privileged: true',
      'readOnlyRootFilesystem: true'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'runAsNonRoot, allowPrivilegeEscalation: false, and readOnlyRootFilesystem all reduce attack surface and escalation potential. `privileged: true` does the opposite — it grants the container broad host access.',
    references: [REF_SCTX]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Pod Security Admission enforces the Pod Security Standards at three levels. Which set lists those levels correctly?',
    options: opts4(
      'Privileged, Baseline, Restricted',
      'Low, Medium, High',
      'Open, Closed, Locked',
      'Audit, Warn, Enforce'
    ),
    correct: ['a'],
    explanation: 'The Pod Security Standards define three policy levels: Privileged (unrestricted), Baseline (minimally restrictive, blocks known escalations), and Restricted (heavily hardened). Audit/Warn/Enforce are the modes, not the levels.',
    references: [REF_PSS, REF_PSA]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Pod Security Admission can apply a level in three modes. Which mode blocks the creation of non-conforming Pods?',
    options: opts4('audit', 'warn', 'enforce', 'dry-run'),
    correct: ['c'],
    explanation: 'The `enforce` mode rejects Pods that violate the configured level. `audit` records violations in the audit log and `warn` returns a user-facing warning, but neither blocks creation.',
    references: [REF_PSA]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is mounting the default ServiceAccount token into every Pod a security concern, and how is it mitigated?',
    options: opts4(
      'It speeds up scheduling; mitigate by adding more nodes',
      'A compromised pod can use the token to call the API; mitigate with automountServiceAccountToken: false and scoped RBAC',
      'It encrypts pod logs; mitigate by disabling logging',
      'It is required for DNS; no mitigation is possible'
    ),
    correct: ['b'],
    explanation: 'A mounted SA token lets a compromised pod authenticate to the API as that service account. Setting automountServiceAccountToken: false where not needed and binding minimal RBAC to the SA limits what a stolen token can do.',
    references: [REF_SA, REF_SA_TOKEN]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Kubernetes Secrets are encrypted by default in etcd and therefore need no additional protection.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. By default Secret data is only base64-encoded in etcd, not encrypted. Encryption at rest must be explicitly configured, and RBAC plus least-privilege access to Secrets are still required.',
    references: [REF_SECRET, REF_ENCRYPT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best limits which subjects can read Secrets in a namespace?',
    options: opts4(
      'Grant get/list on secrets in a broad ClusterRole bound to all authenticated users',
      'Use namespaced Roles granting get on specific Secrets only to the service accounts that need them',
      'Store Secrets as plaintext ConfigMaps to simplify auditing',
      'Disable RBAC so the API server handles it automatically'
    ),
    correct: ['b'],
    explanation: 'Least privilege for Secrets means narrowly scoped, namespaced Roles granting access only to the specific service accounts/users that require it. Broad cluster-wide read grants or moving secrets to ConfigMaps both increase exposure.',
    references: [REF_RBAC_GP, REF_SECRET]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to drop all Linux capabilities and add back only NET_BIND_SERVICE. Where is this configured?',
    options: opts4(
      'In the NetworkPolicy spec',
      'In the container securityContext.capabilities (drop: ["ALL"], add: ["NET_BIND_SERVICE"])',
      'In the Service spec',
      'In the kube-scheduler configuration'
    ),
    correct: ['b'],
    explanation: 'Linux capabilities are managed per-container via securityContext.capabilities. Dropping ALL and adding back only the minimal capability needed (e.g., NET_BIND_SERVICE) follows least privilege.',
    references: [REF_SCTX]
  },
  {
    domain: FUND, difficulty: 4, type: QType.SINGLE,
    stem: 'Which combination most strongly reduces the impact of a remote code execution inside a single container?',
    options: opts4(
      'privileged: true plus hostPID: true for visibility',
      'runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities, and a restrictive seccomp profile',
      'Mounting the host root filesystem read-write for debugging',
      'Disabling NetworkPolicies so traffic is unrestricted'
    ),
    correct: ['b'],
    explanation: 'Running as non-root with a read-only root filesystem, dropped capabilities, and a restrictive seccomp profile sharply limits what an attacker can do after RCE. The other options expand, not reduce, the blast radius.',
    references: [REF_SCTX, REF_SECCOMP]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the main purpose of a Kubernetes audit policy/log?',
    options: opts4(
      'To autoscale workloads based on request volume',
      'To record who did what to the API (requests, responses, identities) for detection and forensics',
      'To encrypt pod-to-pod traffic',
      'To schedule Pods closer to their data'
    ),
    correct: ['b'],
    explanation: 'API auditing records the chronological sequence of requests — subject, verb, resource, and outcome — supporting threat detection, incident response, and compliance evidence. It does not perform autoscaling or encryption.',
    references: [REF_AUDIT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A ServiceAccount needs to be used by an external CI system to deploy. Which is the most secure token strategy?',
    options: opts4(
      'Create a long-lived, never-expiring token Secret and email it to the team',
      'Use short-lived, audience-bound projected/TokenRequest tokens with tightly scoped RBAC',
      'Reuse the default namespace ServiceAccount token',
      'Grant the CI ServiceAccount cluster-admin for flexibility'
    ),
    correct: ['b'],
    explanation: 'Short-lived, audience-scoped tokens (via the TokenRequest API / projected volumes) with minimal RBAC reduce the value of a leaked token. Long-lived static tokens and cluster-admin grants are high-risk anti-patterns.',
    references: [REF_SA_TOKEN, REF_RBAC_GP]
  },

  // ── Kubernetes Threat Model (11) ──
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'In Kubernetes threat modeling, which is a classic example of "privilege escalation" from a container to the node?',
    options: opts4(
      'Listing Pods in your own namespace via RBAC',
      'A privileged container or hostPath mount used to access the host filesystem or kubelet credentials and gain node-level control',
      'Reading a ConfigMap your Role permits',
      'Scaling your own Deployment'
    ),
    correct: ['b'],
    explanation: 'A common escalation path is abusing a privileged container, hostPath, or host namespaces to reach the node filesystem/kubelet credentials, then pivoting to node or cluster control. Normal authorized actions are not escalation.',
    references: [REF_THREAT, REF_SCTX]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which scenario best illustrates a "lateral movement" threat in a Kubernetes cluster?',
    options: opts4(
      'A pod is rescheduled to another node by the scheduler',
      'After compromising one pod, an attacker uses its network access and a stolen token to reach and compromise other pods/services',
      'A Deployment rollout updates pods one at a time',
      'An admin lists namespaces with kubectl'
    ),
    correct: ['b'],
    explanation: 'Lateral movement is an attacker expanding from an initial foothold (one pod) to other workloads/services, often via unrestricted east-west networking or reusable credentials. NetworkPolicies and scoped tokens mitigate it.',
    references: [REF_THREAT, REF_NP]
  },
  {
    domain: THREAT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which threat does enabling NetworkPolicies primarily mitigate?',
    options: opts4(
      'Supply chain tampering of base images',
      'Unrestricted east-west (pod-to-pod) traffic enabling lateral movement',
      'Weak password hashing in the application',
      'Lack of CPU resource limits'
    ),
    correct: ['b'],
    explanation: 'NetworkPolicies restrict which pods/namespaces can communicate, directly limiting lateral movement across the cluster. They do not address image supply chain, application crypto, or resource limits.',
    references: [REF_NP]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items commonly identified as trust boundaries in the Kubernetes threat model.',
    options: opts4(
      'External user/client to the kube-apiserver',
      'Pod/container to the host node',
      'Pixel color values in a container’s log output',
      'One tenant’s workloads to another tenant’s workloads'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Recognised trust boundaries include client→API server, container→node, and tenant→tenant (and node→control plane). Log pixel/color values are not a security boundary.',
    references: [REF_SEAM, REF_MULTITENANCY]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker exposes a workload’s metrics endpoint that leaks tokens. Which STRIDE-style category best fits this?',
    options: opts4(
      'Denial of Service',
      'Information Disclosure',
      'Spoofing',
      'Repudiation'
    ),
    correct: ['b'],
    explanation: 'Leaking credentials/tokens through an exposed endpoint is Information Disclosure: sensitive data is revealed to unauthorized parties, potentially enabling further compromise.',
    references: [REF_THREAT, REF_MITRE]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is a realistic "denial of service" threat against a Kubernetes cluster from a hostile workload?',
    options: opts4(
      'A pod with no resource limits consuming all node CPU/memory and starving neighbors',
      'A pod reading its own ConfigMap',
      'A Deployment with three replicas',
      'A Service of type ClusterIP'
    ),
    correct: ['a'],
    explanation: 'A workload without resource limits can exhaust node CPU/memory, causing noisy-neighbor DoS. ResourceQuotas and LimitRanges plus requests/limits mitigate this. The other options are normal benign operations.',
    references: [REF_LIMITS, REF_QUOTA]
  },
  {
    domain: THREAT, difficulty: 4, type: QType.SINGLE,
    stem: 'An adversary compromises the CI pipeline and injects a backdoor into a base image. Which threat-model category is this, and what control most directly addresses it?',
    options: opts4(
      'Lateral movement; addressed only by NetworkPolicy',
      'Supply chain compromise; addressed by image signing/verification and provenance attestations',
      'Denial of service; addressed by resource quotas',
      'Repudiation; addressed by larger node pools'
    ),
    correct: ['b'],
    explanation: 'Tampering with build artifacts is a supply chain compromise. Signing images and verifying signatures/provenance (and admission policies that require them) directly counter unauthorized image modification.',
    references: [REF_SUPPLY, REF_SLSA]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is an exposed, unauthenticated Kubernetes Dashboard with a privileged service account a significant threat?',
    options: opts4(
      'It only displays static documentation',
      'It can grant an unauthenticated attacker the Dashboard’s API privileges, potentially full cluster control',
      'It disables etcd automatically',
      'It is sandboxed from the API server by default'
    ),
    correct: ['b'],
    explanation: 'A publicly reachable Dashboard backed by a powerful service account effectively hands its API permissions to anyone who can reach it — historically a path to full cluster takeover. Restrict access and minimize its RBAC.',
    references: [REF_DASHBOARD, REF_RBAC_GP]
  },
  {
    domain: THREAT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Threat modeling in Kubernetes should consider both external attackers and malicious or compromised internal workloads.',
    options: tf(),
    correct: ['a'],
    explanation: 'A complete threat model accounts for external attackers and internal threats — a compromised pod, malicious tenant, or insider — since insiders/workloads already sit inside many perimeter controls.',
    references: [REF_THREAT, REF_MULTITENANCY]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which configuration most increases the risk of a container "escape" to the host?',
    options: opts4(
      'runAsNonRoot: true with dropped capabilities',
      'privileged: true with hostPID and a writable hostPath mount of /',
      'A read-only root filesystem',
      'A restrictive seccomp profile'
    ),
    correct: ['b'],
    explanation: 'A privileged container with host namespaces and a writable host root mount removes most isolation, providing a direct path to host/node compromise. The other settings reduce escape risk.',
    references: [REF_SCTX, REF_THREAT]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'In the persistence phase of an attack on a cluster, which action would an attacker most plausibly take?',
    options: opts4(
      'Create a hidden privileged DaemonSet or a malicious mutating webhook to regain access',
      'Run kubectl version to check the client',
      'Scale a Deployment down to zero replicas and stop',
      'List the cluster’s namespaces once and disconnect'
    ),
    correct: ['a'],
    explanation: 'For persistence an attacker plants durable footholds — a privileged DaemonSet on all nodes, a malicious admission/mutating webhook, or a backdoor RBAC binding — so access survives remediation of the initial entry point.',
    references: [REF_THREAT, REF_ADMISSION]
  },

  // ── Platform Security (11) ──
  {
    domain: PLATFORM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which container runtime/sandbox technology provides stronger workload isolation by running pods inside lightweight VMs or a user-space kernel?',
    options: opts4(
      'A standard runc container',
      'gVisor or Kata Containers selected via RuntimeClass',
      'A hostNetwork: true pod',
      'An init container'
    ),
    correct: ['b'],
    explanation: 'Sandboxed runtimes like gVisor (user-space kernel) and Kata Containers (lightweight VMs) provide stronger isolation than the default runc and are selected per workload with RuntimeClass for sensitive or untrusted code.',
    references: [REF_RUNTIME, REF_CONTAINERD]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the primary security purpose of a seccomp profile applied to a container?',
    options: opts4(
      'Encrypting the container’s network traffic',
      'Restricting the set of Linux syscalls the container process can make, reducing kernel attack surface',
      'Limiting the container’s CPU shares',
      'Signing the container image'
    ),
    correct: ['b'],
    explanation: 'seccomp filters the syscalls a process may invoke. A restrictive profile (e.g., RuntimeDefault or a tailored one) shrinks the kernel attack surface available to a compromised container.',
    references: [REF_SECCOMP]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'AppArmor and SELinux are examples of which kind of platform control?',
    options: opts4(
      'API authentication plugins',
      'Mandatory Access Control (MAC) systems that confine what a process can do on the host',
      'Container image registries',
      'Cluster autoscalers'
    ),
    correct: ['b'],
    explanation: 'AppArmor and SELinux are Linux Mandatory Access Control systems that confine processes (including containers) to defined file/capability/network behaviour, adding host-level defence in depth.',
    references: [REF_APPARMOR]
  },
  {
    domain: PLATFORM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why is keeping the node operating system and container runtime patched a platform security priority?',
    options: opts4(
      'Patches always improve CPU performance',
      'Unpatched kernels/runtimes contain vulnerabilities that can enable container escape or privilege escalation',
      'It is only needed for the control plane, not workers',
      'Patching disables the need for RBAC'
    ),
    correct: ['b'],
    explanation: 'Container isolation ultimately relies on the host kernel and runtime. Known kernel/runtime CVEs are frequent escape and escalation vectors, so timely patching of all nodes is essential platform hygiene.',
    references: [REF_NODE, REF_CONTAINERD]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that strengthen node/host-level security for a Kubernetes cluster.',
    options: opts4(
      'Minimize installed packages and disable unused services on nodes',
      'Restrict SSH and use audited, least-privilege node access',
      'Run every workload as privileged for convenience',
      'Apply OS and kernel security updates promptly'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Hardening nodes means minimal footprint, controlled/audited administrative access, and timely patching. Running workloads privileged by default is the opposite of good platform security.',
    references: [REF_HARDEN, REF_NODE]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'A cluster runs untrusted multi-tenant workloads. Which platform measure best reduces the risk of one tenant escaping to affect others?',
    options: opts4(
      'Place all tenants in one shared namespace with no policies',
      'Use sandboxed runtimes (RuntimeClass), per-tenant namespaces, NetworkPolicies, and resource quotas',
      'Give every tenant cluster-admin to self-manage',
      'Disable Pod Security Admission'
    ),
    correct: ['b'],
    explanation: 'Hard multi-tenancy combines stronger isolation (sandboxed runtimes), namespace separation, network segmentation, quotas, and strict pod security. Shared namespaces, broad admin, or disabling PSA all weaken isolation.',
    references: [REF_MULTITENANCY, REF_RUNTIME]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about container image scanning in the platform/supply chain pipeline is correct?',
    options: opts4(
      'Scanning images for known CVEs before deployment helps prevent running vulnerable software',
      'Image scanning replaces the need for runtime monitoring entirely',
      'Only the latest tag needs scanning, never pinned digests',
      'Scanning is only meaningful for the control plane images'
    ),
    correct: ['a'],
    explanation: 'Vulnerability scanning of images (in CI and registries) catches known CVEs before deployment, a key supply chain/platform control. It complements — not replaces — runtime detection and applies to all images.',
    references: [REF_SUPPLY, REF_CHECKLIST]
  },
  {
    domain: PLATFORM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Admission controllers (e.g., validating webhooks/policy engines) can enforce platform policies such as "no privileged containers" cluster-wide.',
    options: tf(),
    correct: ['a'],
    explanation: 'Validating admission webhooks and policy engines (e.g., Pod Security Admission or external policy controllers) can reject non-compliant Pods cluster-wide, enforcing platform guardrails like disallowing privileged containers.',
    references: [REF_ADMISSION, REF_PSA]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the security benefit of signing container images and verifying signatures at admission time?',
    options: opts4(
      'It compresses images to save storage',
      'It ensures only images from trusted publishers/builders run, defeating tampered or unknown images',
      'It removes the need for vulnerability scanning',
      'It encrypts data in transit between pods'
    ),
    correct: ['b'],
    explanation: 'Signature verification at admission ensures only images whose provenance/integrity is cryptographically verified are deployed, blocking tampered or unauthorized images. It does not replace scanning or network encryption.',
    references: [REF_SIGSTORE, REF_SUPPLY]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is centralized observability (logs, metrics, runtime events) considered part of platform security?',
    options: opts4(
      'It guarantees attackers cannot enter the cluster',
      'It enables timely detection of and response to anomalous or malicious activity across the platform',
      'It replaces the need for RBAC and NetworkPolicy',
      'It is only useful for billing'
    ),
    correct: ['b'],
    explanation: 'Aggregated logging, metrics, and runtime security events provide the visibility needed to detect, investigate, and respond to threats. Detection complements preventive controls; it does not replace them.',
    references: [REF_OBSERV, REF_AUDIT]
  },
  {
    domain: PLATFORM, difficulty: 4, type: QType.SINGLE,
    stem: 'A workload must run untrusted user-submitted code. Which combination provides the strongest platform isolation?',
    options: opts4(
      'Default runc + privileged + hostPID',
      'A sandboxed RuntimeClass (gVisor/Kata) + restricted Pod Security + dropped capabilities + dedicated node pool',
      'hostNetwork + cluster-admin service account',
      'No resource limits so it never gets OOM-killed'
    ),
    correct: ['b'],
    explanation: 'Untrusted code warrants the strongest isolation: a sandboxed runtime, the Restricted pod security level, minimal capabilities, and node-pool segregation. The other options remove isolation and increase blast radius.',
    references: [REF_RUNTIME, REF_PSS]
  },

  // ── Compliance and Security Frameworks (6) ──
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which artifact provides consensus, configuration-level security recommendations specifically for hardening Kubernetes?',
    options: opts4(
      'The CIS Kubernetes Benchmark',
      'The OSI networking model',
      'The Kubernetes API conventions document',
      'The semantic versioning specification'
    ),
    correct: ['a'],
    explanation: 'The CIS Kubernetes Benchmark is a widely used set of consensus-based, prescriptive configuration recommendations for hardening Kubernetes components, often automated with tools like kube-bench.',
    references: [REF_CIS, REF_CHECKLIST]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the primary value of mapping cluster controls to a recognized framework (e.g., CIS Benchmark or NSA/CISA hardening guidance)?',
    options: opts4(
      'It guarantees zero vulnerabilities forever',
      'It provides a structured, auditable baseline for assessing and demonstrating security posture',
      'It removes the need to patch nodes',
      'It automatically encrypts etcd'
    ),
    correct: ['b'],
    explanation: 'Frameworks give an objective, repeatable baseline against which a cluster can be assessed and audited, supporting gap analysis and compliance evidence. They do not by themselves remediate or guarantee anything.',
    references: [REF_NSA, REF_CHECKLIST]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which describes the role of the CNCF Cloud Native Security whitepaper?',
    options: opts4(
      'A binding legal regulation enforced by CNCF',
      'A community guidance document outlining cloud native security concepts across the lifecycle (develop, distribute, deploy, runtime)',
      'A list of certified container images',
      'A replacement for Kubernetes RBAC'
    ),
    correct: ['b'],
    explanation: 'The CNCF Cloud Native Security whitepaper is community guidance describing security considerations across the cloud native lifecycle. It is informational best-practice material, not law or a technical control.',
    references: [REF_NIST]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Automated benchmark tools (such as kube-bench) can help continuously verify a cluster against the CIS Kubernetes Benchmark.',
    options: tf(),
    correct: ['a'],
    explanation: 'Tools like kube-bench automate checks against the CIS Kubernetes Benchmark, enabling repeatable, continuous assessment of configuration compliance rather than one-off manual review.',
    references: [REF_CIS, REF_CHECKLIST]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'In supply chain security, what does an SBOM (Software Bill of Materials) primarily enable for compliance?',
    options: opts4(
      'Faster image pulls from the registry',
      'An inventory of components/dependencies so vulnerable or non-compliant elements can be identified and tracked',
      'Automatic encryption of all Secrets',
      'Replacement of RBAC policies'
    ),
    correct: ['b'],
    explanation: 'An SBOM enumerates the components and dependencies in software/images, enabling vulnerability tracking, license compliance, and rapid impact assessment when a new CVE is disclosed.',
    references: [REF_SLSA, REF_SUPPLY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best reflects how compliance frameworks relate to actual cluster security?',
    options: opts4(
      'Passing a benchmark means the cluster is provably unbreakable',
      'Frameworks set a measurable baseline; real security still requires correct implementation, monitoring, and response',
      'Compliance and security are unrelated concerns',
      'Only the control plane needs to be compliant'
    ),
    correct: ['b'],
    explanation: 'Compliance frameworks define a measurable baseline and aid audits, but genuine security depends on correctly implementing controls and maintaining detection and response. Compliance is necessary, not sufficient.',
    references: [REF_NSA, REF_CHECKLIST]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Overview of Cloud Native Security (9) ──
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In the 4Cs model, which layer is responsible for the security of the Kubernetes components themselves (API server, etcd, kubelet) and cluster configuration?',
    options: opts4('Code', 'Container', 'Cluster', 'Cloud'),
    correct: ['c'],
    explanation: 'The Cluster layer covers securing Kubernetes itself — control plane components, RBAC, network policy, and overall cluster configuration. Cloud covers the underlying infrastructure; Container and Code are the inner layers.',
    references: [REF_4C]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which lifecycle phases are commonly used to frame cloud native software supply chain security?',
    options: opts4(
      'Develop, Distribute, Deploy, Runtime',
      'Plan, Bill, Archive, Delete',
      'Compile, Cache, Compress, Cleanup',
      'Login, Browse, Logout, Repeat'
    ),
    correct: ['a'],
    explanation: 'Cloud native supply chain guidance commonly spans Develop (source), Distribute (build/sign/store artifacts), Deploy (admission/verification), and Runtime, applying controls at each phase.',
    references: [REF_SUPPLY]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the relationship between the 4C layers is most accurate?',
    options: opts4(
      'Each outer layer can fully remediate weaknesses in the inner layers',
      'Each inner layer builds on and is constrained by the security of the outer layers',
      'The layers are independent and order does not matter',
      'Only the Code layer matters in cloud native systems'
    ),
    correct: ['b'],
    explanation: 'The 4Cs are nested and dependent: inner layers (Code, Container) rely on the security of the outer layers (Cluster, Cloud). A weak outer layer undermines everything inside it.',
    references: [REF_4C]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best example of applying "least privilege" at the Cloud layer of the 4Cs?',
    options: opts4(
      'Granting the node IAM role only the specific cloud permissions the kubelet/CSI needs',
      'Giving every node administrator access to the cloud account',
      'Sharing one root cloud credential across all clusters',
      'Disabling cloud audit logging to reduce noise'
    ),
    correct: ['a'],
    explanation: 'At the Cloud layer, least privilege means scoping infrastructure/IAM permissions (e.g., node instance roles) to only what is required. Broad admin or shared root credentials violate the principle.',
    references: [REF_4C, REF_RBAC_GP]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In cloud native security, runtime controls alone are sufficient and build/supply-chain controls add little value.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Effective cloud native security spans the whole lifecycle. Build and supply chain controls (scanning, signing, provenance) prevent compromised artifacts from ever reaching runtime and are complementary to runtime defences.',
    references: [REF_SUPPLY, REF_SECURITY]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'What does "blast radius" refer to in cloud native security discussions?',
    options: opts4(
      'The network bandwidth of a cluster',
      'The scope of damage/access an attacker gains if a particular component or credential is compromised',
      'The time it takes a pod to start',
      'The number of container layers in an image'
    ),
    correct: ['b'],
    explanation: 'Blast radius is how far a compromise can spread — what an attacker can reach if one identity, pod, or node is breached. Segmentation and least privilege are used to minimize it.',
    references: [REF_SECURITY, REF_RBAC_GP]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that primarily address the Code layer of the 4Cs.',
    options: opts4(
      'Static application security testing (SAST) and dependency scanning',
      'Secure coding practices and input validation',
      'Hardening the host operating system kernel',
      'Removing unused application dependencies to shrink attack surface'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Code-layer controls include SAST/dependency scanning, secure coding/input validation, and minimizing dependencies. Host kernel hardening belongs to the Cloud (infrastructure) layer.',
    references: [REF_4C, REF_SUPPLY]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes "zero trust" as applied to cloud native architectures?',
    options: opts4(
      'Trust the internal network implicitly but verify external traffic',
      'Never trust, always verify — authenticate and authorize every request regardless of network location',
      'Disable all authentication for internal services to reduce latency',
      'Trust any workload that runs inside the cluster'
    ),
    correct: ['b'],
    explanation: 'Zero trust assumes no implicit trust based on network position; every request is authenticated, authorized, and ideally encrypted, including internal east-west traffic.',
    references: [REF_SECURITY, REF_CONTROLS]
  },
  {
    domain: OVERVIEW, difficulty: 4, type: QType.SINGLE,
    stem: 'A security team must prioritize improvements with limited budget. Following defence-in-depth and the 4Cs, which reasoning is soundest?',
    options: opts4(
      'Only invest in the Code layer because that is where bugs are',
      'Address foundational outer-layer weaknesses (exposed API/etcd, weak IAM) first, then layer additional controls inward',
      'Buy a single product that claims to solve all four layers and ignore the rest',
      'Invest only in runtime detection and skip prevention entirely'
    ),
    correct: ['b'],
    explanation: 'Because inner layers depend on outer ones, fixing foundational exposures (open API server/etcd, weak cloud IAM) yields the largest risk reduction, after which additional layered controls compound. No single product replaces layered design.',
    references: [REF_4C, REF_CHECKLIST]
  },

  // ── Kubernetes Cluster Component Security (14) ──
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which datastore must be protected because it contains the entire desired state of the cluster, including Secrets?',
    options: opts4('kube-proxy', 'etcd', 'CoreDNS', 'the kubelet cache'),
    correct: ['b'],
    explanation: 'etcd is the consistent key-value store holding all cluster state, including Secrets and RBAC objects. Protecting it (TLS, auth, encryption at rest, restricted access) is critical.',
    references: [REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'The kube-apiserver request pipeline processes a request in which order?',
    options: opts4(
      'Authorization → Authentication → Admission',
      'Authentication → Authorization → Admission',
      'Admission → Authentication → Authorization',
      'Authentication → Admission → Authorization'
    ),
    correct: ['b'],
    explanation: 'The API server first authenticates the caller, then authorizes the action (RBAC/etc.), then runs admission controllers (mutating then validating) before persisting to etcd.',
    references: [REF_CONTROLS, REF_ADMISSION]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which kubelet authorization mode should be avoided in production because it permits all requests?',
    options: opts4('Webhook', 'RBAC delegation', 'AlwaysAllow', 'Node'),
    correct: ['c'],
    explanation: 'Setting the kubelet authorization mode to AlwaysAllow permits every request reaching the kubelet API. Production should use Webhook (delegating to the API server) so requests are properly authorized.',
    references: [REF_KUBELET, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL measures that protect etcd in a Kubernetes cluster.',
    options: opts4(
      'Enable TLS for client and peer communication',
      'Restrict etcd network access to the control plane only',
      'Enable encryption at rest for Kubernetes Secrets',
      'Allow anonymous etcd clients for easier backups'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'etcd should use TLS (client/peer), be network-restricted to the control plane, and back encryption at rest for Secrets. Allowing anonymous clients would expose all cluster state.',
    references: [REF_ETCD, REF_ENCRYPT]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'On which default port does the kube-apiserver serve its secure HTTPS endpoint?',
    options: opts4('8080', '6443', '10250', '2379'),
    correct: ['b'],
    explanation: 'The API server’s secure port is 6443 by default. 10250 is the kubelet API, 2379 is etcd client, and 8080 was the legacy insecure port that must not be used.',
    references: [REF_PORTS, REF_APISRV]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Why must the legacy kube-apiserver insecure port (historically 8080) never be enabled?',
    options: opts4(
      'It is slower than the secure port',
      'It bypasses authentication and authorization, granting full API access to anyone who can reach it',
      'It only serves metrics',
      'It is required for etcd to function'
    ),
    correct: ['b'],
    explanation: 'The insecure port served the API without authentication or authorization. Anyone able to reach it effectively had cluster-admin, so it must remain disabled (modern versions remove it).',
    references: [REF_APISRV, REF_CONTROLS]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control plane component is responsible for running core controllers (e.g., Node, ServiceAccount, replication) and should use scoped service-account credentials?',
    options: opts4('kube-scheduler', 'kube-controller-manager', 'kube-proxy', 'CoreDNS'),
    correct: ['b'],
    explanation: 'The kube-controller-manager runs the built-in controllers. Using per-controller service accounts (`--use-service-account-credentials=true`) limits the privileges any single controller exploit yields.',
    references: [REF_CONTROLLER]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The NodeRestriction admission plugin limits what a kubelet can modify, helping prevent a compromised node from tampering with other nodes’ or pods’ objects.',
    options: tf(),
    correct: ['a'],
    explanation: 'NodeRestriction (with the Node authorizer) limits each kubelet to modifying only its own Node object and Pods bound to it, reducing the damage a compromised node credential can do.',
    references: [REF_KUBELET, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Component certificates (API server, kubelet, etcd) should be managed how, from a security standpoint?',
    options: opts4(
      'Issued once with a 50-year validity and never rotated',
      'Issued from a controlled CA, scoped, and rotated regularly with secure key storage',
      'Stored in a public Git repository for transparency',
      'Shared across all components to simplify trust'
    ),
    correct: ['b'],
    explanation: 'PKI for cluster components must use a controlled CA, appropriately scoped certificates, regular rotation, and protected private keys. Long-lived, shared, or public keys greatly increase risk.',
    references: [REF_KUBECONFIG, REF_TLSBOOT]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker can reach etcd directly on the network with valid client certs that were leaked. What is the most accurate impact assessment?',
    options: opts4(
      'Limited to read-only metrics',
      'Full cluster compromise — they can read every Secret and write arbitrary objects, bypassing API server authz/admission',
      'They can only restart the scheduler',
      'No impact because RBAC still applies at the etcd layer'
    ),
    correct: ['b'],
    explanation: 'etcd has no Kubernetes RBAC; valid etcd access yields the entire cluster state and the ability to mutate any object, bypassing the API server’s authentication, authorization, and admission — effectively total compromise.',
    references: [REF_ETCD, REF_ENCRYPT]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is a recommended way to limit exposure of the kube-apiserver?',
    options: opts4(
      'Expose it on a public IP with anonymous auth enabled',
      'Restrict network access (firewalls/security groups), require strong authentication, and disable anonymous access',
      'Disable TLS to simplify client configuration',
      'Bind it only to 0.0.0.0 with no authorization mode set'
    ),
    correct: ['b'],
    explanation: 'The API server should be network-restricted, require strong authentication, enforce RBAC, and have anonymous auth disabled or tightly scoped. Public exposure with weak auth is a primary attack vector.',
    references: [REF_HARDEN, REF_ANON]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the security risk of exposing the kubelet’s authenticated API (10250) without proper authorization?',
    options: opts4(
      'It only affects log rotation',
      'Callers may exec into containers, read logs, and access node/pod data, enabling escalation',
      'It disables the scheduler',
      'It has no security impact since it is HTTPS'
    ),
    correct: ['b'],
    explanation: 'The kubelet API can run/exec in containers and expose pod/node data. Without authentication and Webhook authorization, reaching 10250 enables data theft and escalation, even though it is over TLS.',
    references: [REF_KUBELET, REF_PORTS]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the cloud-controller-manager from a security view is correct?',
    options: opts4(
      'It needs no cloud credentials',
      'It holds cloud provider credentials to manage infrastructure, so its identity should be least-privileged and protected',
      'It stores all Kubernetes Secrets',
      'It replaces the API server'
    ),
    correct: ['b'],
    explanation: 'The cloud-controller-manager integrates with the cloud provider and therefore carries powerful infrastructure credentials. Those should be scoped to least privilege and tightly protected to limit cloud-layer blast radius.',
    references: [REF_CONTROLLER, REF_4C]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should control plane component debug/profiling endpoints (e.g., pprof) be disabled or protected in production?',
    options: opts4(
      'They increase image size',
      'They can leak sensitive runtime data and provide attackers with internal information or DoS vectors',
      'They are required for RBAC to function',
      'They automatically rotate certificates'
    ),
    correct: ['b'],
    explanation: 'Profiling/debug endpoints can disclose memory contents, internal state, and enable resource-exhaustion abuse. Hardening guidance recommends disabling them or restricting access in production.',
    references: [REF_HARDEN, REF_APISRV]
  },

  // ── Kubernetes Security Fundamentals (14) ──
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which RBAC objects bind a Role or ClusterRole to subjects (users, groups, service accounts)?',
    options: opts4(
      'NetworkPolicy and Ingress',
      'RoleBinding and ClusterRoleBinding',
      'ConfigMap and Secret',
      'Deployment and ReplicaSet'
    ),
    correct: ['b'],
    explanation: 'RoleBinding (namespaced) and ClusterRoleBinding (cluster-wide) associate subjects with the permissions defined in a Role or ClusterRole. Roles/ClusterRoles only define permissions; bindings grant them.',
    references: [REF_RBAC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A ClusterRoleBinding grants a ClusterRole to a single namespace’s service account. What is the effect?',
    options: opts4(
      'The permissions apply only within that namespace automatically',
      'The ClusterRole’s permissions apply cluster-wide for that subject, often more access than intended',
      'It has no effect because service accounts cannot be cluster subjects',
      'It only grants read access regardless of the ClusterRole'
    ),
    correct: ['b'],
    explanation: 'A ClusterRoleBinding grants the ClusterRole cluster-wide, not just in the SA’s namespace. To scope a ClusterRole to one namespace, use a RoleBinding referencing the ClusterRole instead.',
    references: [REF_RBAC, REF_RBAC_GP]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which field disables automatic mounting of the ServiceAccount API token into a Pod?',
    options: opts4(
      'spec.automountServiceAccountToken: false',
      'spec.hostNetwork: false',
      'spec.dnsPolicy: None',
      'spec.restartPolicy: Never'
    ),
    correct: ['a'],
    explanation: 'Setting automountServiceAccountToken: false (on the Pod or the ServiceAccount) prevents the API token from being mounted, reducing the credential exposure of workloads that do not call the API.',
    references: [REF_SA, REF_SA_TOKEN]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which NetworkPolicy concept is required to allow DNS resolution after applying a default-deny-egress policy?',
    options: opts4(
      'No action needed; DNS is always exempt',
      'An explicit egress rule allowing UDP/TCP 53 to the cluster DNS pods/namespace',
      'Disabling the CNI plugin',
      'Setting hostNetwork: true on every pod'
    ),
    correct: ['b'],
    explanation: 'Default-deny egress also blocks DNS. An explicit egress allow rule for port 53 (UDP/TCP) to the kube-dns/CoreDNS service or namespace is needed so pods can still resolve names.',
    references: [REF_NP, REF_NETPOLICY]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL settings that are restricted/forbidden by the "Restricted" Pod Security Standard.',
    options: opts4(
      'Running as root (must run as non-root)',
      'Privilege escalation (allowPrivilegeEscalation must be false)',
      'Adding the NET_BIND_SERVICE capability while dropping ALL (allowed under Restricted)',
      'Privileged containers'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Restricted requires running as non-root, forbids privilege escalation and privileged containers, and requires dropping ALL capabilities (NET_BIND_SERVICE is the only add permitted). So the privileged/root/escalation items are restricted; the limited NET_BIND_SERVICE add is allowed.',
    references: [REF_PSS, REF_PSA]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Pod Security Standard level is the least restrictive, effectively allowing all configurations?',
    options: opts4('Restricted', 'Baseline', 'Privileged', 'Hardened'),
    correct: ['c'],
    explanation: 'Privileged is the unrestricted/open level intended for trusted system workloads. Baseline blocks known escalations; Restricted is the most hardened. "Hardened" is not a defined level.',
    references: [REF_PSS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'How is the Pod Security Standard level applied to workloads via Pod Security Admission?',
    options: opts4(
      'By a per-pod annotation only',
      'By labels on the Namespace (e.g., pod-security.kubernetes.io/enforce: restricted)',
      'By editing the kube-scheduler config',
      'By a field in the Service spec'
    ),
    correct: ['b'],
    explanation: 'Pod Security Admission is configured with namespace labels such as pod-security.kubernetes.io/enforce, /audit, and /warn set to a level (privileged|baseline|restricted).',
    references: [REF_PSA]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is `readOnlyRootFilesystem: true` a useful container hardening setting?',
    options: opts4(
      'It encrypts the container image',
      'It prevents an attacker from writing to or modifying the container filesystem at runtime (e.g., dropping tools/persistence)',
      'It speeds up image pulls',
      'It disables the network'
    ),
    correct: ['b'],
    explanation: 'A read-only root filesystem stops attackers from writing malware, modifying binaries, or persisting in the container filesystem; writable scratch space can be provided via explicit emptyDir/tmpfs volumes.',
    references: [REF_SCTX]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: RBAC permissions are additive — there are no "deny" rules, so a subject’s access is the union of all roles bound to it.',
    options: tf(),
    correct: ['a'],
    explanation: 'Kubernetes RBAC is purely additive; there are no deny rules. A subject’s effective permissions are the union of all bound Roles/ClusterRoles, which is why over-broad bindings are dangerous.',
    references: [REF_RBAC, REF_RBAC_GP]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best practice for granting a workload access only to the Secret it needs?',
    options: opts4(
      'Bind a ClusterRole with get on all secrets cluster-wide',
      'Create a namespaced Role limited to get on the named Secret and bind it to that workload’s ServiceAccount',
      'Give the workload the cluster-admin role',
      'Mount the Secret into every pod in the cluster'
    ),
    correct: ['b'],
    explanation: 'Least privilege means a tightly scoped namespaced Role (get on the specific Secret name where possible) bound only to that workload’s ServiceAccount, not cluster-wide secret access.',
    references: [REF_RBAC_GP, REF_SECRET]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'What does enabling encryption at rest with a KMS provider add beyond a local aescbc key?',
    options: opts4(
      'Nothing; they are identical',
      'Key management/rotation and protection of the encryption key by an external KMS rather than a key file on disk',
      'It removes the need to restrict Secret RBAC',
      'It encrypts pod-to-pod network traffic'
    ),
    correct: ['b'],
    explanation: 'A KMS provider externalizes and protects the data-encryption key (envelope encryption), enabling centralized key management and rotation rather than relying on a static key stored on the control plane disk.',
    references: [REF_ENCRYPT, REF_SECRET]
  },
  {
    domain: FUND, difficulty: 4, type: QType.SINGLE,
    stem: 'A namespace must isolate tenant traffic. Which combination most effectively enforces this?',
    options: opts4(
      'Only resource quotas',
      'A default-deny NetworkPolicy plus explicit allow rules for required flows, scoped per namespace',
      'Disabling the CNI',
      'A single allow-all NetworkPolicy'
    ),
    correct: ['b'],
    explanation: 'Effective network isolation starts from default-deny and then explicitly allows only the required ingress/egress flows. Quotas address resource fairness, not traffic; an allow-all policy provides no isolation.',
    references: [REF_NETPOLICY, REF_NP]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which audit log level records request and response bodies and therefore must be handled carefully to avoid storing sensitive data?',
    options: opts4('None', 'Metadata', 'Request', 'RequestResponse'),
    correct: ['d'],
    explanation: 'The RequestResponse level logs metadata plus the request and response bodies. It is the most verbose and can capture sensitive content, so policies usually limit it to specific, non-sensitive resources.',
    references: [REF_AUDIT]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the most appropriate way for an application pod to consume a database password?',
    options: opts4(
      'Hard-code it in the container image',
      'Reference a Kubernetes Secret via env var or mounted volume, with RBAC restricting who can read the Secret',
      'Pass it as a plaintext command-line flag in the Deployment YAML committed to Git',
      'Store it in a public ConfigMap'
    ),
    correct: ['b'],
    explanation: 'Sensitive values should live in Secrets (ideally encrypted at rest, access-restricted via RBAC) and be consumed via env/volume. Baking into images, plaintext YAML in Git, or ConfigMaps exposes the credential.',
    references: [REF_SECRET, REF_RBAC_GP]
  },

  // ── Kubernetes Threat Model (11) ──
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which scenario is the clearest example of "spoofing" in a Kubernetes threat model?',
    options: opts4(
      'A pod consuming more CPU than requested',
      'An attacker presenting a forged or stolen identity/token to impersonate a legitimate service account',
      'A node running out of disk space',
      'A Deployment scaling automatically'
    ),
    correct: ['b'],
    explanation: 'Spoofing is illegitimately assuming another identity — e.g., using a stolen ServiceAccount token to act as that account. Strong authentication and short-lived tokens mitigate it.',
    references: [REF_THREAT, REF_AUTHN]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control most directly mitigates the threat of a compromised pod reaching the cloud metadata service to steal node IAM credentials?',
    options: opts4(
      'Allowing all egress traffic',
      'A NetworkPolicy/host firewall blocking pod egress to the metadata IP, plus least-privilege node IAM',
      'Increasing pod CPU limits',
      'Disabling the audit log'
    ),
    correct: ['b'],
    explanation: 'Blocking egress to the cloud metadata endpoint (e.g., 169.254.169.254) via NetworkPolicy/host firewall, and minimizing the node’s IAM permissions, prevents pods from harvesting powerful cloud credentials.',
    references: [REF_NP, REF_4C]
  },
  {
    domain: THREAT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In threat-model terms, what is the main risk of running containers as UID 0 (root) inside the container?',
    options: opts4(
      'Slower image pulls',
      'A container breakout becomes more damaging because root in the container is closer to root on the host',
      'It prevents the pod from being scheduled',
      'It disables logging'
    ),
    correct: ['b'],
    explanation: 'Running as root increases breakout impact: combined with a kernel/runtime flaw or misconfiguration, container root can translate to broader host access. Running as non-root reduces this risk.',
    references: [REF_SCTX, REF_THREAT]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are recognized attacker objectives/phases relevant to Kubernetes threat modeling.',
    options: opts4(
      'Initial access (e.g., exposed API or vulnerable app)',
      'Privilege escalation (container/pod to node/cluster)',
      'Choosing a container base image color scheme',
      'Persistence (durable footholds like malicious webhooks)'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Initial access, privilege escalation, lateral movement, persistence, and impact are standard adversary phases considered in Kubernetes threat modeling. Image color schemes are not a security concept.',
    references: [REF_THREAT, REF_MITRE]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A malicious mutating admission webhook is installed by an attacker. Why is this a severe threat?',
    options: opts4(
      'It only changes pod labels cosmetically',
      'It can silently alter every admitted object (inject sidecars, credentials, or backdoors) cluster-wide',
      'It disables the scheduler permanently',
      'It has no privileges over workloads'
    ),
    correct: ['b'],
    explanation: 'A mutating webhook intercepts and can modify all matching create/update requests. An attacker-controlled one can inject backdoors or escalate privileges across the cluster and provides persistence.',
    references: [REF_ADMISSION, REF_THREAT]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best "impact" example in a Kubernetes attack lifecycle?',
    options: opts4(
      'Listing one’s own pods',
      'Deploying cryptominers cluster-wide or exfiltrating data from compromised workloads',
      'Reading a permitted ConfigMap',
      'Viewing the cluster version'
    ),
    correct: ['b'],
    explanation: 'Impact is the attacker achieving their goal — resource abuse (cryptomining), data theft, or destruction. Routine authorized reads are normal operations, not impact.',
    references: [REF_THREAT, REF_MITRE]
  },
  {
    domain: THREAT, difficulty: 4, type: QType.SINGLE,
    stem: 'A pod has hostPath mounting /var/run/docker.sock or the container runtime socket. Why is this dangerous?',
    options: opts4(
      'It increases logging volume only',
      'Access to the runtime socket lets the pod create privileged containers/control the node, effectively a host takeover',
      'It is required for DNS resolution',
      'It only affects that pod’s metrics'
    ),
    correct: ['b'],
    explanation: 'The container runtime socket is effectively root on the node: a pod with it can launch privileged containers, mount the host, and take over the node. Such mounts should be blocked by policy.',
    references: [REF_THREAT, REF_PSS]
  },
  {
    domain: THREAT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Reducing the number of pods that mount ServiceAccount tokens decreases the credentials available to an attacker after a pod compromise.',
    options: tf(),
    correct: ['a'],
    explanation: 'Fewer mounted tokens mean fewer usable API credentials for an attacker who compromises a pod, shrinking lateral movement and escalation opportunities — a least-privilege/threat-reduction measure.',
    references: [REF_SA_TOKEN, REF_THREAT]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which threat does requiring signed images at admission specifically reduce?',
    options: opts4(
      'Noisy-neighbor CPU exhaustion',
      'Deployment of tampered or untrusted images (supply chain integrity threat)',
      'DNS spoofing within the cluster',
      'Excessive audit log size'
    ),
    correct: ['b'],
    explanation: 'Verifying image signatures at admission ensures only images of known provenance/integrity run, directly countering the supply chain threat of tampered or unauthorized images. It does not address CPU, DNS, or logs.',
    references: [REF_SUPPLY, REF_SIGSTORE]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is an over-permissive ServiceAccount a key escalation vector in the threat model?',
    options: opts4(
      'It changes pod scheduling order',
      'A compromised pod can use the SA token to perform powerful API actions (create pods, read secrets, modify RBAC)',
      'It only affects metrics scraping',
      'It disables NetworkPolicies automatically'
    ),
    correct: ['b'],
    explanation: 'If a pod’s ServiceAccount has broad RBAC, a single pod compromise yields those API powers — potentially creating privileged pods, reading all secrets, or editing RBAC to escalate further.',
    references: [REF_RBAC_GP, REF_THREAT]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best example of a "repudiation" concern in a Kubernetes threat model, and the control that addresses it?',
    options: opts4(
      'A pod using more memory than requested; fixed by quotas',
      'An actor performing destructive API actions without a reliable record of who did it; addressed by enabling and protecting audit logs',
      'A Service exposing a NodePort; fixed by ClusterIP',
      'A container running as root; fixed by namespaces'
    ),
    correct: ['b'],
    explanation: 'Repudiation is the inability to attribute actions to an actor. Enabling tamper-resistant API audit logging provides accountable, non-repudiable evidence of who performed which API operations.',
    references: [REF_AUDIT, REF_THREAT]
  },

  // ── Platform Security (11) ──
  {
    domain: PLATFORM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Kubernetes object selects an alternative (possibly sandboxed) container runtime for a Pod?',
    options: opts4('PriorityClass', 'RuntimeClass', 'StorageClass', 'IngressClass'),
    correct: ['b'],
    explanation: 'RuntimeClass lets you select a configured runtime handler (e.g., gVisor or Kata) per Pod, enabling stronger isolation for sensitive or untrusted workloads.',
    references: [REF_RUNTIME]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'What does the RuntimeDefault seccomp profile provide compared to Unconfined?',
    options: opts4(
      'It disables all syscalls, breaking the container',
      'It applies the container runtime’s default, sensible syscall allowlist, reducing kernel attack surface vs. no filtering',
      'It encrypts container memory',
      'It is identical to privileged mode'
    ),
    correct: ['b'],
    explanation: 'RuntimeDefault applies the runtime’s curated seccomp profile, blocking dangerous/unneeded syscalls while keeping common ones. Unconfined applies no filter, leaving the full syscall surface exposed.',
    references: [REF_SECCOMP]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is a sound node-isolation strategy for sensitive workloads?',
    options: opts4(
      'Schedule them on a dedicated, hardened node pool with taints/tolerations and sandboxed runtime',
      'Mix them freely with untrusted workloads on the same nodes',
      'Disable seccomp and AppArmor for performance',
      'Give those pods hostPID and hostNetwork'
    ),
    correct: ['a'],
    explanation: 'Isolating sensitive workloads onto dedicated, hardened nodes (using taints/tolerations and a sandboxed runtime) limits exposure to co-located untrusted code. The other options reduce isolation.',
    references: [REF_MULTITENANCY, REF_RUNTIME]
  },
  {
    domain: PLATFORM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why are minimal/distroless base images recommended for platform/container security?',
    options: opts4(
      'They render faster in dashboards',
      'Fewer packages and no shell/tools reduce the attack surface and limit what an attacker can do post-compromise',
      'They cannot be scanned for vulnerabilities',
      'They disable RBAC'
    ),
    correct: ['b'],
    explanation: 'Minimal/distroless images remove shells and unnecessary packages, shrinking vulnerability exposure and limiting an attacker’s toolset inside a compromised container. They remain scannable.',
    references: [REF_SUPPLY, REF_CHECKLIST]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are valid platform-layer runtime security controls.',
    options: opts4(
      'seccomp profiles restricting syscalls',
      'AppArmor/SELinux confinement',
      'Runtime threat detection (e.g., monitoring for unexpected process/exec)',
      'Storing application source code in the container'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'seccomp, AppArmor/SELinux, and runtime detection are platform/runtime security controls. Embedding source code in the image is not a security control and may add risk.',
    references: [REF_SECCOMP, REF_APPARMOR]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the security purpose of admission policy that blocks images from untrusted registries?',
    options: opts4(
      'To speed up image pulls',
      'To ensure workloads only run images from approved, controlled sources, reducing supply chain risk',
      'To disable image scanning',
      'To increase replica counts'
    ),
    correct: ['b'],
    explanation: 'Restricting allowed registries via admission policy ensures only vetted, controlled image sources run, reducing the chance of pulling malicious or unverified images.',
    references: [REF_ADMISSION, REF_SUPPLY]
  },
  {
    domain: PLATFORM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Keeping Kubernetes itself updated/patched is a platform security responsibility because older versions accumulate known vulnerabilities.',
    options: tf(),
    correct: ['a'],
    explanation: 'Running supported, patched Kubernetes versions is essential platform hygiene; unpatched releases carry disclosed CVEs and miss security fixes, increasing exploitable surface.',
    references: [REF_CHECKLIST, REF_HARDEN]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes the platform security value of an immutable, content-addressed image reference (digest pin)?',
    options: opts4(
      'It makes images smaller',
      'It guarantees the exact image content deployed cannot silently change under a mutable tag',
      'It encrypts the container at runtime',
      'It removes the need for RBAC'
    ),
    correct: ['b'],
    explanation: 'Pinning to an image digest (sha256) ensures the deployed content is exactly what was verified; mutable tags like :latest can be repointed to malicious content without any manifest change.',
    references: [REF_SUPPLY, REF_SIGSTORE]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should the host kernel be considered a shared, security-critical resource for all containers on a node?',
    options: opts4(
      'Containers each ship their own kernel, so it does not matter',
      'Containers share the host kernel; a kernel vulnerability can break isolation between all containers on that node',
      'The kernel only affects networking',
      'Kernel security is handled entirely by RBAC'
    ),
    correct: ['b'],
    explanation: 'Unlike VMs, containers on a node share the host kernel. A kernel-level flaw can undermine isolation across every container, which is why patching and sandboxed runtimes matter for high-risk workloads.',
    references: [REF_NODE, REF_RUNTIME]
  },
  {
    domain: PLATFORM, difficulty: 4, type: QType.SINGLE,
    stem: 'A platform team wants to guarantee that no Pod can run privileged anywhere in the cluster. Which approach is most robust?',
    options: opts4(
      'Ask developers politely in a wiki page',
      'Enforce the Restricted/Baseline level via Pod Security Admission and/or a validating policy webhook cluster-wide',
      'Rely on each namespace owner to self-police',
      'Disable the API server audit log'
    ),
    correct: ['b'],
    explanation: 'Cluster-wide enforcement through Pod Security Admission (enforce mode) and/or a validating policy engine reliably rejects privileged Pods. Voluntary or per-owner approaches are not guarantees.',
    references: [REF_PSA, REF_ADMISSION]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is limiting node-level administrative (SSH) access an important platform-security control?',
    options: opts4(
      'SSH access speeds up container image pulls',
      'Direct node access can bypass Kubernetes controls to read credentials, inspect containers, or tamper with the runtime, so it must be minimized and audited',
      'SSH is required for NetworkPolicy to function',
      'Node access has no security relevance once RBAC is enabled'
    ),
    correct: ['b'],
    explanation: 'Anyone with node shell access can read kubelet credentials, inspect or modify running containers, and alter the runtime — bypassing API-level controls entirely. Such access should be least-privilege, justified, and audited.',
    references: [REF_NODE, REF_HARDEN]
  },

  // ── Compliance and Security Frameworks (6) ──
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which open-source tool is commonly used to assess a cluster against the CIS Kubernetes Benchmark?',
    options: opts4('kube-bench', 'kubectl top', 'etcdctl', 'coredns'),
    correct: ['a'],
    explanation: 'kube-bench runs the checks defined by the CIS Kubernetes Benchmark against a cluster’s configuration, producing pass/fail results to support hardening and audit.',
    references: [REF_CIS, REF_CHECKLIST]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'How does the Kubernetes "Security Checklist" in the documentation relate to formal frameworks?',
    options: opts4(
      'It is a legally binding standard',
      'It is a practical, non-exhaustive baseline of security recommendations that complements formal benchmarks',
      'It replaces the need for RBAC',
      'It only applies to managed clusters'
    ),
    correct: ['b'],
    explanation: 'The official Security Checklist is a pragmatic, non-exhaustive starting baseline of recommendations. It complements—rather than replaces—formal frameworks like the CIS Benchmark and organizational compliance requirements.',
    references: [REF_CHECKLIST, REF_NSA]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the most accurate statement about achieving "compliance" for a Kubernetes platform?',
    options: opts4(
      'A one-time audit permanently certifies the cluster as secure',
      'Compliance is continuous: configuration drift, new CVEs, and changes require ongoing assessment and remediation',
      'Compliance only concerns documentation, not configuration',
      'Compliance is irrelevant once RBAC is enabled'
    ),
    correct: ['b'],
    explanation: 'Clusters change constantly; compliance must be continuous, with drift detection, periodic benchmark runs, and remediation. A single point-in-time audit does not guarantee ongoing posture.',
    references: [REF_CHECKLIST, REF_CIS]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Generating and reviewing API audit logs supports compliance by providing evidence of who accessed or changed cluster resources.',
    options: tf(),
    correct: ['a'],
    explanation: 'Audit logs provide an accountable record of API activity (subject, action, resource, outcome), which is commonly required as compliance evidence and for incident investigation.',
    references: [REF_AUDIT, REF_CHECKLIST]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'In the context of supply chain frameworks, what does "provenance" attestation establish?',
    options: opts4(
      'The marketing name of an image',
      'A verifiable record of how and from what sources an artifact was built (build platform, inputs)',
      'The compression algorithm used for layers',
      'The number of replicas to deploy'
    ),
    correct: ['b'],
    explanation: 'Provenance attestations record how an artifact was produced (builder, source, materials), enabling verification that an image came from a trusted, expected build process — central to SLSA-style supply chain assurance.',
    references: [REF_SLSA, REF_SUPPLY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why might an organization map Kubernetes controls to both an internal policy and an external framework (e.g., CIS)?',
    options: opts4(
      'To make audits longer for no reason',
      'To demonstrate due diligence, satisfy auditors/regulators, and ensure controls cover recognized best practices',
      'Because RBAC cannot work without it',
      'To avoid having to patch the cluster'
    ),
    correct: ['b'],
    explanation: 'Mapping to recognized frameworks demonstrates due diligence, supports regulatory/audit requirements, and ensures internal controls align with accepted best practices and gap-analysis baselines.',
    references: [REF_NSA, REF_CHECKLIST]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Overview of Cloud Native Security (9) ──
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which 4Cs layer is concerned with image building, container configuration, and isolation settings of the running container?',
    options: opts4('Cloud', 'Cluster', 'Container', 'Code'),
    correct: ['c'],
    explanation: 'The Container layer addresses image security (scanning, minimal base, signing) and container runtime configuration (capabilities, user, seccomp). Code is the application logic; Cluster and Cloud are outer layers.',
    references: [REF_4C]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which principle states that a system should fail into a secure state rather than an open one?',
    options: opts4(
      'Fail-open by default',
      'Fail-secure / fail-closed',
      'Eventual consistency',
      'Best-effort delivery'
    ),
    correct: ['b'],
    explanation: 'Fail-secure (fail-closed) means that when a control errors or is unavailable, access is denied rather than granted, preventing failures from becoming security bypasses.',
    references: [REF_SECURITY]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is "minimizing attack surface" a recurring theme across all 4Cs layers?',
    options: opts4(
      'Smaller surfaces are cheaper to license',
      'Fewer exposed components, packages, permissions, and endpoints mean fewer opportunities for an attacker to exploit',
      'It is only relevant to the Code layer',
      'It eliminates the need for monitoring'
    ),
    correct: ['b'],
    explanation: 'Reducing exposed endpoints, packages, privileges, and features at every layer lowers the number of potential entry/exploitation points, a core defensive principle applied across Cloud, Cluster, Container, and Code.',
    references: [REF_4C, REF_CHECKLIST]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly describe cloud native security principles.',
    options: opts4(
      'Apply least privilege to identities and components',
      'Use defence in depth across the 4Cs',
      'Trust internal traffic implicitly to improve performance',
      'Secure the software supply chain end to end'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Least privilege, defence in depth, and supply chain security are core principles. Implicitly trusting internal traffic contradicts zero-trust thinking and is not a recommended principle.',
    references: [REF_SECURITY, REF_SUPPLY]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: The Code layer of the 4Cs is the only layer your organization is ever responsible for when using Kubernetes.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Even with managed services, organizations remain responsible for multiple layers — workload/cluster configuration, RBAC, and container settings — not just application code.',
    references: [REF_4C, REF_SECURITY]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the most accurate description of "security as a continuous process" in cloud native systems?',
    options: opts4(
      'Security is achieved once and never needs revisiting',
      'Security requires ongoing assessment, patching, monitoring, and improvement as systems and threats evolve',
      'Security is only a deployment-time concern',
      'Security is solely the responsibility of the cloud provider'
    ),
    correct: ['b'],
    explanation: 'Cloud native environments and threats change constantly, so security is continuous: ongoing patching, scanning, monitoring, and iterative hardening rather than a one-time milestone.',
    references: [REF_SECURITY, REF_CHECKLIST]
  },
  {
    domain: OVERVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'How does "immutability" of containers/infrastructure improve security posture?',
    options: opts4(
      'It prevents any logging',
      'Replacing rather than mutating running instances reduces drift and limits persistent attacker modifications',
      'It removes the need for authentication',
      'It makes images impossible to scan'
    ),
    correct: ['b'],
    explanation: 'Immutable infrastructure replaces instances/images instead of patching them in place, reducing configuration drift and making attacker-installed persistence less durable across redeploys.',
    references: [REF_SECURITY, REF_SUPPLY]
  },
  {
    domain: OVERVIEW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is primarily a Cluster-layer security control in the 4Cs model?',
    options: opts4(
      'Hardening the underlying VM operating system',
      'Configuring RBAC and admission control on the API server',
      'Refactoring application code to fix a SQL injection',
      'Choosing a smaller base image'
    ),
    correct: ['b'],
    explanation: 'RBAC and admission control configuration secure Kubernetes itself — the Cluster layer. OS hardening is Cloud, code fixes are Code, and base image choice is Container.',
    references: [REF_4C, REF_RBAC]
  },
  {
    domain: OVERVIEW, difficulty: 4, type: QType.SINGLE,
    stem: 'An auditor asks how the organization ensures a compromised application cannot trivially become a cluster compromise. Which answer best reflects 4Cs/defence-in-depth thinking?',
    options: opts4(
      'We trust the application not to be compromised',
      'Layered controls — minimal container privileges, scoped RBAC/tokens, NetworkPolicies, and node hardening — contain a compromise at each boundary',
      'We rely solely on a perimeter firewall',
      'We disable logging to avoid alert fatigue'
    ),
    correct: ['b'],
    explanation: 'Defence in depth across the 4Cs means a single app compromise meets successive barriers: limited container privileges, narrowly scoped credentials, network segmentation, and hardened nodes — each containing blast radius.',
    references: [REF_4C, REF_CHECKLIST]
  },

  // ── Kubernetes Cluster Component Security (14) ──
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component on each node runs and manages containers and reports node/pod status to the control plane?',
    options: opts4('kube-apiserver', 'kubelet', 'etcd', 'kube-scheduler'),
    correct: ['b'],
    explanation: 'The kubelet runs on every node, manages container lifecycle for assigned Pods, and reports status. Because it can exec into containers, securing its API and credentials is critical.',
    references: [REF_KUBELET, REF_NODE]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which authorization mode does Kubernetes use, combined with NodeRestriction, to limit what each kubelet can access via the API?',
    options: opts4('ABAC only', 'The Node authorizer', 'AlwaysAllow', 'Webhook against a billing system'),
    correct: ['b'],
    explanation: 'The Node authorization mode restricts kubelets to API objects related to their own node/pods; the NodeRestriction admission plugin further limits what a kubelet can modify, containing a compromised node.',
    references: [REF_KUBELET, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct security rationale for restricting direct network access to etcd to only the control plane nodes?',
    options: opts4(
      'etcd performs better on a private subnet',
      'Any client able to reach and authenticate to etcd can read/modify all cluster state, so exposure must be minimized',
      'etcd needs internet access to function',
      'It is required for pod DNS'
    ),
    correct: ['b'],
    explanation: 'Because etcd holds and can mutate the entire cluster state (including Secrets), its network reachability must be tightly limited to the control plane to reduce the chance of unauthorized access.',
    references: [REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are appropriate kube-apiserver hardening measures.',
    options: opts4(
      'Disable anonymous authentication (or tightly scope it)',
      'Enable an audit policy and ship logs to durable storage',
      'Use RBAC as the authorization mode with least-privilege bindings',
      'Enable the legacy insecure port for convenience'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Hardening the API server includes disabling/scoping anonymous auth, enabling auditing, and using RBAC with least privilege. Enabling the legacy insecure port removes auth/authz entirely and must not be done.',
    references: [REF_APISRV, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which default port does etcd use for client communication and must be protected with TLS and access restrictions?',
    options: opts4('2379', '6443', '10250', '443'),
    correct: ['a'],
    explanation: 'etcd serves client traffic on 2379 (peer traffic on 2380). These must use TLS and be restricted to the control plane because etcd holds all cluster state.',
    references: [REF_PORTS, REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'A kubeconfig file for a cluster-admin user is committed to a public repository. What is the correct risk assessment and response?',
    options: opts4(
      'Low risk; kubeconfig files contain no secrets',
      'Critical: it may grant full cluster control — revoke/rotate the credentials and invalidate the certificate/token immediately',
      'No action needed if the repo is later made private',
      'Only the username matters, not the credential'
    ),
    correct: ['b'],
    explanation: 'A cluster-admin kubeconfig contains usable credentials (client cert/key or token). Public exposure is critical; the credentials must be revoked/rotated and any CA/cert invalidated, plus audit for misuse.',
    references: [REF_KUBECONFIG, REF_RBAC_GP]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should the kube-scheduler and kube-controller-manager bind their secure serving ports to localhost where possible?',
    options: opts4(
      'To improve scheduling latency',
      'To avoid exposing their metrics/health/profiling endpoints to the network where they could leak data or be abused',
      'Because RBAC requires it',
      'To enable anonymous access'
    ),
    correct: ['b'],
    explanation: 'Binding these components’ endpoints to localhost limits exposure of potentially sensitive metrics/profiling data and reduces the network attack surface of the control plane.',
    references: [REF_HARDEN, REF_SCHED]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Encryption at rest for Secrets is configured on the kube-apiserver via an EncryptionConfiguration, not on individual pods.',
    options: tf(),
    correct: ['a'],
    explanation: 'Encryption at rest is configured at the API server with an EncryptionConfiguration that defines providers (e.g., KMS, aescbc) for resources like Secrets before they are written to etcd; it is not a per-pod setting.',
    references: [REF_ENCRYPT, REF_APISRV]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the main security reason to keep control plane components patched to supported versions?',
    options: opts4(
      'Newer versions always use less memory',
      'They include fixes for disclosed vulnerabilities that attackers can otherwise exploit',
      'Patching disables RBAC requirements',
      'Old versions cannot run containers at all'
    ),
    correct: ['b'],
    explanation: 'Control plane CVEs (API server, etcd, kubelet) are patched in supported releases. Running unpatched/unsupported versions leaves known, exploitable vulnerabilities in the most security-critical components.',
    references: [REF_CHECKLIST, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker gains the ability to create Pods in kube-system with hostPath and privileged settings. Why is this effectively cluster takeover?',
    options: opts4(
      'It only affects one namespace cosmetically',
      'They can mount the host, read control plane credentials/etcd data, and run privileged code on control plane or any node',
      'kube-system pods have fewer privileges than default',
      'Pods cannot use hostPath in kube-system'
    ),
    correct: ['b'],
    explanation: 'Creating privileged, hostPath Pods (especially schedulable on control plane nodes) lets an attacker access node filesystems, kubelet/etcd credentials, and run arbitrary privileged code — equivalent to full cluster control.',
    references: [REF_THREAT, REF_PSS]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about API server authentication methods is correct from a security standpoint?',
    options: opts4(
      'Static token files are the most secure and recommended method',
      'Short-lived, verifiable credentials (e.g., OIDC, client certs with rotation) are preferred over long-lived static tokens',
      'Anonymous access should be broadly enabled',
      'Basic auth with a password file is recommended for production'
    ),
    correct: ['b'],
    explanation: 'Modern, rotatable, short-lived authentication (OIDC, properly managed client certs, structured authn) is preferred. Long-lived static token files and basic auth files are discouraged/removed due to leak risk.',
    references: [REF_AUTHN, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is regular etcd backup also a security-relevant practice (not just availability)?',
    options: opts4(
      'Backups make the cluster faster',
      'Recoverable, integrity-protected backups support resilience and recovery after destructive attacks, but must themselves be encrypted/access-controlled',
      'Backups disable the need for RBAC',
      'Backups remove all Secrets automatically'
    ),
    correct: ['b'],
    explanation: 'Backups aid recovery from ransomware/destructive incidents (resilience). Because they contain all cluster state including Secrets, the backups themselves must be encrypted and access-controlled or they become a leak vector.',
    references: [REF_ETCD, REF_ENCRYPT]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct relationship between the Node authorizer and the kubelet credential?',
    options: opts4(
      'The Node authorizer grants kubelets cluster-admin',
      'It scopes a kubelet’s API access to objects relevant to its node and bound pods, limiting a stolen kubelet credential',
      'It disables kubelet authentication',
      'It applies only to the scheduler'
    ),
    correct: ['b'],
    explanation: 'The Node authorizer constrains what a kubelet identity can read/modify to its own node and the pods/secrets/configmaps it hosts, so a stolen kubelet credential cannot freely act across the whole cluster.',
    references: [REF_KUBELET, REF_HARDEN]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about admission webhooks (validating/mutating) as control plane extensions is correct from a security standpoint?',
    options: opts4(
      'They run before authentication, so they need no protection',
      'They are powerful trusted components — their endpoints must be secured (TLS, authn) because a compromised or malicious webhook can subvert cluster policy',
      'They can only read, never modify, requests',
      'They are unrelated to cluster security'
    ),
    correct: ['b'],
    explanation: 'Admission webhooks sit in the critical request path after authn/authz; a compromised or attacker-installed webhook can mutate or approve malicious objects cluster-wide, so their endpoints and configuration must be tightly secured.',
    references: [REF_ADMISSION, REF_HARDEN]
  },

  // ── Kubernetes Security Fundamentals (14) ──
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the difference between a Role and a ClusterRole in Kubernetes RBAC?',
    options: opts4(
      'Role is namespaced; ClusterRole is cluster-scoped (and can also be reused across namespaces via RoleBindings)',
      'They are identical',
      'Role grants more power than ClusterRole always',
      'ClusterRole only works for the default namespace'
    ),
    correct: ['a'],
    explanation: 'A Role defines permissions within a single namespace. A ClusterRole is cluster-scoped (cluster resources, non-resource URLs) and can also be bound per-namespace via a RoleBinding for reuse.',
    references: [REF_RBAC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which RBAC verb combination would let a subject escalate privileges by editing role bindings?',
    options: opts4(
      'get/list on pods',
      'create/update on rolebindings/clusterrolebindings (or bind on roles)',
      'watch on configmaps',
      'delete on jobs'
    ),
    correct: ['b'],
    explanation: 'The ability to create/modify RoleBindings/ClusterRoleBindings (or use the `bind`/`escalate` verbs) lets a subject grant itself more permissions — a classic privilege-escalation path that must be tightly controlled.',
    references: [REF_RBAC_GP, REF_RBAC]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Pod-level securityContext field forces all containers to run as a non-root user?',
    options: opts4(
      'runAsNonRoot: true',
      'privileged: true',
      'hostNetwork: true',
      'allowPrivilegeEscalation: true'
    ),
    correct: ['a'],
    explanation: 'runAsNonRoot: true makes the kubelet refuse to start a container that would run as UID 0, enforcing non-root execution and reducing breakout impact.',
    references: [REF_SCTX]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which NetworkPolicy selector targets traffic based on the namespace of the peer?',
    options: opts4(
      'podSelector only',
      'namespaceSelector (optionally combined with podSelector)',
      'serviceSelector',
      'nodeSelector'
    ),
    correct: ['b'],
    explanation: 'namespaceSelector matches peers by namespace labels and can be combined with podSelector to narrow to specific pods within selected namespaces, enabling cross-namespace allow rules.',
    references: [REF_NP]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Kubernetes Secrets.',
    options: opts4(
      'By default they are only base64-encoded in etcd, not encrypted',
      'RBAC should restrict which subjects can read them',
      'Encryption at rest can be enabled via the API server EncryptionConfiguration',
      'They are automatically safe to commit to Git'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Secrets are base64-encoded (not encrypted) by default, should be RBAC-restricted, and can be encrypted at rest via EncryptionConfiguration. Committing them to Git (even base64) exposes the plaintext and is unsafe.',
    references: [REF_SECRET, REF_ENCRYPT]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Pod Security Standard level blocks known privilege escalations while remaining reasonably permissive for common workloads?',
    options: opts4('Privileged', 'Baseline', 'Restricted', 'Unrestricted'),
    correct: ['b'],
    explanation: 'Baseline is minimally restrictive: it blocks known privilege escalations (e.g., privileged, hostNetwork) while allowing typical workloads. Restricted is the hardened level; Privileged is unrestricted.',
    references: [REF_PSS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload does not call the Kubernetes API at all. Which is the most appropriate security configuration?',
    options: opts4(
      'Bind it to cluster-admin just in case',
      'Set automountServiceAccountToken: false so no API token is mounted',
      'Mount the default token and grant broad RBAC',
      'Run it as privileged'
    ),
    correct: ['b'],
    explanation: 'If a workload never talks to the API, disabling token automount removes an unnecessary credential entirely, eliminating a potential lateral-movement vector with no functional cost.',
    references: [REF_SA_TOKEN, REF_SA]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is a correct statement about combining NetworkPolicies?',
    options: opts4(
      'If any policy denies traffic, the traffic is blocked even if another allows it',
      'Policies are additive for allow; traffic is permitted if any selecting policy allows it (no explicit deny rules)',
      'Only one NetworkPolicy can exist per namespace',
      'NetworkPolicies override RBAC'
    ),
    correct: ['b'],
    explanation: 'NetworkPolicies have no deny rules; for a selected pod, a connection is allowed if any applicable policy permits it. Isolation comes from selecting a pod and not allowing the traffic.',
    references: [REF_NP, REF_NETPOLICY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Pod Security Admission is a built-in admission controller that enforces the Pod Security Standards using namespace labels.',
    options: tf(),
    correct: ['a'],
    explanation: 'Pod Security Admission is the built-in (beta/GA) admission controller that applies the Pod Security Standards levels (privileged/baseline/restricted) per namespace via labels in enforce/audit/warn modes.',
    references: [REF_PSA, REF_PSS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is binding a Role (rather than a ClusterRole via ClusterRoleBinding) preferred for namespace-scoped workloads?',
    options: opts4(
      'It is faster to evaluate',
      'It confines the granted permissions to a single namespace, limiting blast radius',
      'ClusterRoleBindings are deprecated',
      'Roles cannot be misused'
    ),
    correct: ['b'],
    explanation: 'Namespace-scoped RoleBindings keep permissions confined to one namespace, so a compromised subject cannot act cluster-wide — a least-privilege/blast-radius reduction over a ClusterRoleBinding.',
    references: [REF_RBAC_GP, REF_RBAC]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which describes a secure handling pattern for an external secret (e.g., from a cloud secrets manager)?',
    options: opts4(
      'Echo it into the Deployment YAML in plaintext',
      'Sync it into a Kubernetes Secret (or use a CSI secrets driver) with RBAC restricting access and encryption at rest enabled',
      'Print it to stdout so it appears in logs for auditing',
      'Store it as a label on the pod'
    ),
    correct: ['b'],
    explanation: 'External secrets should be delivered via a Secret or a secrets-store CSI driver, with RBAC limiting readers and encryption at rest enabled. Plaintext YAML, logs, or labels expose the credential.',
    references: [REF_SECRET, REF_RBAC_GP]
  },
  {
    domain: FUND, difficulty: 4, type: QType.SINGLE,
    stem: 'A compromised pod has a ServiceAccount that can `create pods`. Why is this potentially as bad as cluster-admin?',
    options: opts4(
      'It cannot do anything because creating pods is harmless',
      'It can create a privileged pod with hostPath to read node/control-plane credentials and escalate to full control',
      'It only affects that pod’s logs',
      'It disables the audit log'
    ),
    correct: ['b'],
    explanation: 'Create-pod permission can be abused to launch a privileged, hostPath/host-namespace pod, then read kubelet/etcd credentials or run code on sensitive nodes — escalating to effective cluster-admin. Pod Security Admission mitigates this.',
    references: [REF_RBAC_GP, REF_PSS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which audit log level records only metadata (who, what, when) but not request/response bodies?',
    options: opts4('None', 'Metadata', 'Request', 'RequestResponse'),
    correct: ['b'],
    explanation: 'The Metadata level logs request metadata (user, verb, resource, timestamp, response status) without bodies — a common balance between visibility and avoiding sensitive payload storage.',
    references: [REF_AUDIT]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the most appropriate use of a dedicated, minimally-privileged ServiceAccount per workload?',
    options: opts4(
      'It lets every workload share the same powerful identity for simplicity',
      'It scopes each workload’s API permissions independently, so compromising one workload does not grant another’s access',
      'It disables authentication for that workload',
      'It is only needed for system components, never applications'
    ),
    correct: ['b'],
    explanation: 'A distinct, least-privileged ServiceAccount per workload isolates credentials and RBAC scope, so a single workload compromise does not expose other workloads’ API access — a core least-privilege fundamental.',
    references: [REF_SA, REF_RBAC_GP]
  },

  // ── Kubernetes Threat Model (11) ──
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the best example of "tampering" in a Kubernetes threat model?',
    options: opts4(
      'A user listing their own pods',
      'An attacker modifying a Deployment or admission webhook to inject a malicious sidecar',
      'A pod logging to stdout',
      'The scheduler placing a pod on a node'
    ),
    correct: ['b'],
    explanation: 'Tampering is unauthorized modification of data or configuration — e.g., altering workloads or webhooks to inject malicious behaviour. Integrity controls (RBAC, admission, signing) defend against it.',
    references: [REF_THREAT, REF_ADMISSION]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is the cloud instance metadata endpoint a notable threat target for compromised pods?',
    options: opts4(
      'It serves the Kubernetes dashboard',
      'It can expose node IAM credentials, which a pod could use to access cloud resources beyond the cluster',
      'It stores all container logs',
      'It is the etcd backup location'
    ),
    correct: ['b'],
    explanation: 'The metadata service can hand out the node’s cloud IAM credentials. A compromised pod that reaches it may pivot into the cloud account, so egress to it is commonly blocked and node IAM minimized.',
    references: [REF_NP, REF_4C]
  },
  {
    domain: THREAT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a primary mitigation against the threat of a single compromised pod reading every Secret in the cluster?',
    options: opts4(
      'Granting all pods get on secrets cluster-wide',
      'Scoping each ServiceAccount’s RBAC to only the Secrets it needs in its own namespace',
      'Disabling encryption at rest',
      'Running all pods as root'
    ),
    correct: ['b'],
    explanation: 'Least-privilege RBAC on Secrets ensures a compromised pod can only read the few Secrets its ServiceAccount is authorized for, not all cluster Secrets — sharply limiting the impact.',
    references: [REF_RBAC_GP, REF_SECRET]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that help contain an attacker who has achieved code execution in one pod.',
    options: opts4(
      'A default-deny NetworkPolicy limiting east-west traffic',
      'Minimal ServiceAccount RBAC (or no token mounted)',
      'Restricted Pod Security (no privileged, non-root, dropped caps)',
      'Granting the pod hostPID and hostNetwork'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Network segmentation, minimal credentials, and restricted pod security all contain a compromised pod. hostPID/hostNetwork do the opposite — they widen access to the node and other processes.',
    references: [REF_NP, REF_PSS]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker schedules a pod that tolerates the control-plane taint and mounts hostPath. What is the principal danger?',
    options: opts4(
      'The pod will simply be evicted',
      'Running on a control-plane node with host access can expose certificates, kubeconfigs, and etcd data',
      'It only increases metrics cardinality',
      'Control-plane nodes have no sensitive data'
    ),
    correct: ['b'],
    explanation: 'Control-plane nodes hold the most sensitive material (CA keys, kubeconfigs, etcd data). A hostPath pod tolerating the control-plane taint can read these and achieve full cluster compromise; scheduling controls and PSA mitigate this.',
    references: [REF_THREAT, REF_KUBECONFIG]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which threat-model concept describes an attacker abusing legitimate, granted permissions rather than exploiting a software bug?',
    options: opts4(
      'Buffer overflow',
      'Abuse of functionality / over-permissioned access (privilege misuse)',
      'Cross-site scripting',
      'TLS downgrade'
    ),
    correct: ['b'],
    explanation: 'Over-permissioned identities let attackers achieve goals using legitimately granted (but excessive) permissions — abuse of functionality. Least-privilege RBAC and scoped tokens are the primary defences.',
    references: [REF_RBAC_GP, REF_THREAT]
  },
  {
    domain: THREAT, difficulty: 4, type: QType.SINGLE,
    stem: 'Why does disabling the kubelet read-only port and anonymous kubelet auth reduce reconnaissance and attack opportunities?',
    options: opts4(
      'It speeds up image pulls',
      'Those interfaces can expose pod/node information and accept unauthenticated requests, aiding attacker discovery and exec',
      'It is required to enable RBAC',
      'It disables the scheduler'
    ),
    correct: ['b'],
    explanation: 'The unauthenticated read-only port and anonymous kubelet auth can leak pod/node details and even allow actions, aiding reconnaissance and lateral movement. Disabling them removes that low-effort attacker capability.',
    references: [REF_KUBELET, REF_PORTS]
  },
  {
    domain: THREAT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A misconfigured, internet-exposed kube-apiserver with anonymous access enabled is a high-severity threat.',
    options: tf(),
    correct: ['a'],
    explanation: 'An internet-reachable API server with anonymous access (and any meaningful RBAC for anonymous/unauthenticated subjects) can lead to information disclosure or cluster compromise — a high-severity exposure.',
    references: [REF_ANON, REF_HARDEN]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes the threat addressed by image vulnerability scanning in CI?',
    options: opts4(
      'Noisy-neighbor resource exhaustion',
      'Deploying containers with known-exploitable software vulnerabilities (initial access/escalation surface)',
      'DNS cache poisoning between pods',
      'Excessive audit log retention'
    ),
    correct: ['b'],
    explanation: 'Scanning catches images carrying known CVEs before they run, reducing the chance an attacker exploits a known vulnerability for initial access or escalation. It does not address noisy-neighbor, DNS, or log retention.',
    references: [REF_SUPPLY, REF_CHECKLIST]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A pod can be reached from the internet through a misconfigured Service/Ingress and runs vulnerable software. In attack terms, this is primarily a path for what?',
    options: opts4(
      'Repudiation only',
      'Initial access — the attacker’s entry point into the cluster',
      'Backup corruption',
      'Certificate rotation'
    ),
    correct: ['b'],
    explanation: 'An exposed, vulnerable workload is a classic initial access vector: exploiting it gives the attacker their first foothold, from which lateral movement and escalation may follow.',
    references: [REF_THREAT, REF_MITRE]
  },
  {
    domain: THREAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is unrestricted pod egress considered a meaningful threat even when ingress is tightly controlled?',
    options: opts4(
      'Egress has no security impact',
      'A compromised pod can use open egress to exfiltrate data, reach the metadata service, or contact attacker command-and-control',
      'Egress only affects DNS performance',
      'Ingress controls automatically block all egress'
    ),
    correct: ['b'],
    explanation: 'Even with locked-down ingress, a compromised workload with open egress can exfiltrate secrets/data, reach the cloud metadata endpoint, or call out to command-and-control. Egress NetworkPolicies mitigate this.',
    references: [REF_NP, REF_THREAT]
  },

  // ── Platform Security (11) ──
  {
    domain: PLATFORM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which provides stronger workload isolation by not sharing the host kernel directly with the container?',
    options: opts4(
      'Standard runc containers',
      'Kata Containers (lightweight VM-based isolation)',
      'A hostNetwork pod',
      'An emptyDir volume'
    ),
    correct: ['b'],
    explanation: 'Kata Containers run each pod/container in a lightweight VM with its own kernel, providing stronger isolation than runc, which shares the host kernel. It is selected via RuntimeClass.',
    references: [REF_RUNTIME, REF_CONTAINERD]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the security benefit of running the container process as a specific non-root UID with no write access to system paths?',
    options: opts4(
      'It guarantees the application has no bugs',
      'It limits what a compromised process can read/modify and reduces the impact of a container breakout',
      'It encrypts the image layers',
      'It removes the need for network policy'
    ),
    correct: ['b'],
    explanation: 'A least-privileged, non-root, read-only process constrains attacker actions inside the container and reduces breakout severity. It is a containment control, not a guarantee of bug-free code.',
    references: [REF_SCTX]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is restricting hostPath volumes via policy an important platform control?',
    options: opts4(
      'hostPath improves pod startup time',
      'hostPath can expose or modify sensitive node files (e.g., runtime sockets, credentials), enabling node compromise',
      'hostPath is required for all pods',
      'hostPath only affects logging'
    ),
    correct: ['b'],
    explanation: 'hostPath mounts give pods access to the node filesystem; broad use can expose runtime sockets, kubelet credentials, or system files, enabling escape/escalation. Policy should restrict or forbid it.',
    references: [REF_PSS, REF_THREAT]
  },
  {
    domain: PLATFORM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a key platform-layer practice for the container supply chain?',
    options: opts4(
      'Always use the :latest tag for flexibility',
      'Build from trusted, minimal base images and scan/sign artifacts before deployment',
      'Skip scanning for internal images',
      'Disable admission control to speed deploys'
    ),
    correct: ['b'],
    explanation: 'Using trusted minimal base images plus scanning and signing artifacts ensures only vetted, integrity-verified images reach production. Mutable :latest tags and skipping scans/admission undermine this.',
    references: [REF_SUPPLY, REF_SIGSTORE]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that improve isolation for an untrusted multi-tenant workload.',
    options: opts4(
      'A sandboxed RuntimeClass (e.g., gVisor/Kata)',
      'Per-tenant namespaces with NetworkPolicies and quotas',
      'The Restricted Pod Security level',
      'Sharing one privileged ServiceAccount across all tenants'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Sandboxed runtimes, namespace+network+quota separation, and Restricted pod security all strengthen tenant isolation. Sharing a privileged ServiceAccount collapses isolation and is an anti-pattern.',
    references: [REF_MULTITENANCY, REF_RUNTIME]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the platform security value of runtime threat detection (e.g., detecting an unexpected shell spawned in a container)?',
    options: opts4(
      'It prevents all attacks from ever occurring',
      'It provides detection of and alerting on suspicious in-cluster behaviour that bypassed preventive controls',
      'It replaces RBAC',
      'It is only for performance tuning'
    ),
    correct: ['b'],
    explanation: 'Runtime detection observes behaviour (unexpected exec, file/network anomalies) and alerts when something evades preventive controls, enabling response. It complements, not replaces, prevention.',
    references: [REF_OBSERV, REF_CHECKLIST]
  },
  {
    domain: PLATFORM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Applying the RuntimeDefault seccomp profile to workloads is generally safer than running them Unconfined.',
    options: tf(),
    correct: ['a'],
    explanation: 'RuntimeDefault applies a sensible syscall allowlist, reducing kernel attack surface compared to Unconfined (no filtering). It is a recommended baseline hardening for most workloads.',
    references: [REF_SECCOMP, REF_PSS]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should the container runtime (e.g., containerd/CRI-O) be kept patched as a platform priority?',
    options: opts4(
      'It changes pod IP addresses',
      'Runtime vulnerabilities can allow container escape or privilege escalation affecting all pods on the node',
      'It only affects image pull speed',
      'Patching disables seccomp'
    ),
    correct: ['b'],
    explanation: 'The container runtime is part of the isolation boundary; CVEs in it can enable escapes/escalation impacting every pod on the node, making timely patching a platform-security necessity.',
    references: [REF_CONTAINERD, REF_NODE]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which describes a defense provided by AppArmor/SELinux profiles for containers?',
    options: opts4(
      'They encrypt the cluster network',
      'They confine a container’s access to files, capabilities, and resources at the host level, limiting damage if compromised',
      'They sign container images',
      'They schedule pods to nodes'
    ),
    correct: ['b'],
    explanation: 'MAC profiles (AppArmor/SELinux) restrict a container process’s host-level actions (file paths, capabilities), containing a compromise even if the application is exploited.',
    references: [REF_APPARMOR, REF_SCTX]
  },
  {
    domain: PLATFORM, difficulty: 4, type: QType.SINGLE,
    stem: 'A high-risk workload processes untrusted input. Which layered platform configuration is strongest?',
    options: opts4(
      'runc + privileged + Unconfined seccomp',
      'Sandboxed RuntimeClass + Restricted PSS + RuntimeDefault/locked seccomp + dedicated hardened nodes + minimal image',
      'hostNetwork + cluster-admin SA + :latest image',
      'No limits and no policies for maximum performance'
    ),
    correct: ['b'],
    explanation: 'Defence in depth for a high-risk workload combines a sandboxed runtime, Restricted pod security, strict seccomp, node isolation, and a minimal image — each layer containing a potential compromise. The others remove isolation.',
    references: [REF_RUNTIME, REF_PSS]
  },
  {
    domain: PLATFORM, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the platform-security purpose of an admission policy that rejects containers requesting the SYS_ADMIN capability?',
    options: opts4(
      'It reduces image size',
      'SYS_ADMIN grants broad, near-root kernel powers that ease container escape, so blocking it cluster-wide enforces least privilege',
      'It speeds up scheduling',
      'It encrypts the container filesystem'
    ),
    correct: ['b'],
    explanation: 'The SYS_ADMIN capability is extremely powerful and a common escape enabler. An admission policy that forbids it (and other dangerous capabilities) enforces least-privilege containers across the whole platform.',
    references: [REF_SCTX, REF_PSS]
  },

  // ── Compliance and Security Frameworks (6) ──
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which framework is specifically a consensus benchmark for hardening Kubernetes configuration?',
    options: opts4(
      'CIS Kubernetes Benchmark',
      'TCP/IP RFC 793',
      'The Twelve-Factor App methodology',
      'Semantic Versioning 2.0'
    ),
    correct: ['a'],
    explanation: 'The CIS Kubernetes Benchmark is the consensus configuration-hardening standard for Kubernetes. The other items concern networking, app design, and versioning, not Kubernetes security baselines.',
    references: [REF_CIS]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is a key reason to integrate benchmark/compliance scanning into CI/CD rather than running it only annually?',
    options: opts4(
      'CI/CD scans are decorative',
      'It catches configuration drift and regressions early, keeping the cluster continuously aligned with the baseline',
      'It removes the need for RBAC',
      'It guarantees zero CVEs'
    ),
    correct: ['b'],
    explanation: 'Continuous scanning in CI/CD detects drift and insecure changes as they are introduced, maintaining ongoing alignment with the security baseline instead of discovering issues only at an annual audit.',
    references: [REF_CHECKLIST, REF_CIS]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the CNCF Cloud Native Security whitepaper and lifecycle framing is correct?',
    options: opts4(
      'It mandates a specific commercial scanner',
      'It frames security across develop, distribute, deploy, and runtime, encouraging controls at each stage',
      'It only addresses the Code layer',
      'It forbids the use of admission controllers'
    ),
    correct: ['b'],
    explanation: 'The CNCF whitepaper organizes guidance across the cloud native lifecycle (develop → distribute → deploy → runtime), promoting layered controls at each phase rather than mandating specific products.',
    references: [REF_NIST, REF_SUPPLY]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Demonstrating least-privilege RBAC and enabled audit logging can serve as evidence toward security compliance objectives.',
    options: tf(),
    correct: ['a'],
    explanation: 'Least-privilege RBAC plus audit logging are commonly mapped to access-control and accountability requirements in security frameworks, serving as concrete compliance evidence.',
    references: [REF_RBAC_GP, REF_AUDIT]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best explains how SLSA-style levels relate to supply chain compliance?',
    options: opts4(
      'They rank container image sizes',
      'They define progressively stronger build integrity/provenance requirements that organizations can target and attest to',
      'They are Kubernetes API versions',
      'They replace RBAC'
    ),
    correct: ['b'],
    explanation: 'SLSA defines increasing levels of build integrity and provenance assurance. Organizations target a level and produce attestations, which supports supply chain compliance and risk reduction.',
    references: [REF_SLSA, REF_SUPPLY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization must show auditors that only approved images run in production. Which combination is the strongest evidence-backed control?',
    options: opts4(
      'A verbal policy and trust',
      'Admission policy enforcing signed images from approved registries, plus signature/provenance attestations and audit logs',
      'Disabling the audit log to reduce noise',
      'Allowing any image but documenting it later'
    ),
    correct: ['b'],
    explanation: 'Enforced admission of signed images from approved registries, with retained attestations and audit logs, provides both prevention and verifiable evidence — exactly what auditors expect for image provenance compliance.',
    references: [REF_SIGSTORE, REF_AUDIT]
  }
];

const KCSA_DOMAINS = [
  { name: OVERVIEW, weight: 14 },
  { name: CLUSTER, weight: 22 },
  { name: FUND, weight: 22 },
  { name: THREAT, weight: 16 },
  { name: PLATFORM, weight: 16 },
  { name: COMPLIANCE, weight: 10 }
];

const KCSA_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'linuxfoundation-kcsa-p1',
    code: 'KCSA-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 90-minute, 65-question, blueprint-weighted set covering cloud native security overview, cluster component security, Kubernetes security fundamentals, the Kubernetes threat model, platform security, and compliance & security frameworks.',
    questions: P1
  },
  {
    slug: 'linuxfoundation-kcsa-p2',
    code: 'KCSA-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 90-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'linuxfoundation-kcsa-p3',
    code: 'KCSA-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 90-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const KCSA_BUNDLE = {
  slug: 'linuxfoundation-kcsa',
  title: 'Kubernetes and Cloud Native Security Associate (KCSA)',
  description: 'All 3 KCSA practice exams in one bundle — covering the cloud native security overview and 4Cs, Kubernetes cluster component security, security fundamentals, the Kubernetes threat model, platform security, and compliance & security frameworks, aligned to the CNCF KCSA exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 25000 // USD 250 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the KCSA bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:kcsa-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedKcsa(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'linuxfoundation' } });
  await db.vendor.upsert({
    where: { slug: 'linuxfoundation' },
    update: { name: 'Linux Foundation', description: 'Linux Foundation / CNCF certifications — Kubernetes and cloud native, including the Kubernetes and Cloud Native Security Associate (KCSA) credential.' },
    create: { slug: 'linuxfoundation', name: 'Linux Foundation', description: 'Linux Foundation / CNCF certifications — Kubernetes and cloud native, including the Kubernetes and Cloud Native Security Associate (KCSA) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'linuxfoundation' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of KCSA_EXAMS) {
    const title = `Kubernetes and Cloud Native Security Associate (KCSA) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the CNCF KCSA exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 90,
      passingScore: 75,
      questionCount: e.questions.length,
      domains: KCSA_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:kcsa-seed' } });
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
          generatedBy: 'manual:kcsa-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: KCSA_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: KCSA_BUNDLE.slug },
    update: {
      title: KCSA_BUNDLE.title,
      description: KCSA_BUNDLE.description,
      price: KCSA_BUNDLE.price,
      priceVoucher: KCSA_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: KCSA_BUNDLE.slug,
      title: KCSA_BUNDLE.title,
      description: KCSA_BUNDLE.description,
      price: KCSA_BUNDLE.price,
      priceVoucher: KCSA_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'linuxfoundation-kcsa-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'linuxfoundation-kcsa-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'linuxfoundation-kcsa-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'linuxfoundation-kcsa-p1', tier: 'VOUCHER' as const, position: 4 }
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
