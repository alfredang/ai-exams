/**
 * CKS bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:cks-seed'` and upserts catalog rows.
 *
 * Exported as `seedCks(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/cks.ts`) and the protected
 * admin API (`/api/admin/seed-cks`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against public Kubernetes / Falco /
 * Trivy documentation and the CNCF CKS v1.32 blueprint:
 *   - Cluster Setup                                  — 15% (10)
 *   - Cluster Hardening                              — 15% (10)
 *   - System Hardening                               — 10% (6)
 *   - Minimize Microservice Vulnerabilities          — 20% (13)
 *   - Supply Chain Security                          — 20% (13)
 *   - Monitoring, Logging and Runtime Security       — 20% (13)
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

const SETUP = 'Cluster Setup';
const CHARD = 'Cluster Hardening';
const SHARD = 'System Hardening';
const MICRO = 'Minimize Microservice Vulnerabilities';
const SUPPLY = 'Supply Chain Security';
const MONITOR = 'Monitoring, Logging and Runtime Security';

const REF_NP = { label: 'Kubernetes Docs — Network Policies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/' };
const REF_ING = { label: 'Kubernetes Docs — Ingress', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/' };
const REF_TLS = { label: 'Kubernetes Docs — Ingress TLS', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/#tls' };
const REF_KUBEBENCH = { label: 'Kubernetes Docs — Securing a Cluster', url: 'https://kubernetes.io/docs/tasks/administer-cluster/securing-a-cluster/' };
const REF_RBAC = { label: 'Kubernetes Docs — RBAC Authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/' };
const REF_SA = { label: 'Kubernetes Docs — Configure Service Accounts', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/' };
const REF_SATOKEN = { label: 'Kubernetes Docs — ServiceAccount Token Volume Projection', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#serviceaccount-token-volume-projection' };
const REF_APISRV = { label: 'Kubernetes Docs — kube-apiserver Reference', url: 'https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/' };
const REF_KUBELET = { label: 'Kubernetes Docs — Kubelet Authentication/Authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/kubelet-authn-authz/' };
const REF_ADMISSION = { label: 'Kubernetes Docs — Admission Controllers Reference', url: 'https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/' };
const REF_UPGRADE = { label: 'Kubernetes Docs — Upgrade a kubeadm Cluster', url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/' };
const REF_APPARMOR = { label: 'Kubernetes Docs — Restrict a Container with AppArmor', url: 'https://kubernetes.io/docs/tutorials/security/apparmor/' };
const REF_SECCOMP = { label: 'Kubernetes Docs — Restrict syscalls with seccomp', url: 'https://kubernetes.io/docs/tutorials/security/seccomp/' };
const REF_SCTX = { label: 'Kubernetes Docs — Configure a Security Context', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/' };
const REF_PSA = { label: 'Kubernetes Docs — Pod Security Admission', url: 'https://kubernetes.io/docs/concepts/security/pod-security-admission/' };
const REF_PSS = { label: 'Kubernetes Docs — Pod Security Standards', url: 'https://kubernetes.io/docs/concepts/security/pod-security-standards/' };
const REF_RUNTIME = { label: 'Kubernetes Docs — Runtime Class', url: 'https://kubernetes.io/docs/concepts/containers/runtime-class/' };
const REF_SANDBOX = { label: 'Kubernetes Docs — Pod Security & Sandboxing', url: 'https://kubernetes.io/docs/concepts/security/' };
const REF_SECRET = { label: 'Kubernetes Docs — Secrets', url: 'https://kubernetes.io/docs/concepts/configuration/secret/' };
const REF_ENCRYPT = { label: 'Kubernetes Docs — Encrypting Secret Data at Rest', url: 'https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/' };
const REF_AUDIT = { label: 'Kubernetes Docs — Auditing', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/' };
const REF_IMGPOLICY = { label: 'Kubernetes Docs — ImagePolicyWebhook', url: 'https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#imagepolicywebhook' };
const REF_OPA = { label: 'OPA Gatekeeper — Documentation', url: 'https://kubernetes.io/docs/concepts/policy/' };
const REF_FALCO = { label: 'Falco — Documentation', url: 'https://falco.org/docs/' };
const REF_FALCO_RULES = { label: 'Falco — Rules', url: 'https://falco.org/docs/rules/' };
const REF_TRIVY = { label: 'Trivy — Documentation', url: 'https://aquasecurity.github.io/trivy/latest/' };
const REF_SECURITY = { label: 'Kubernetes Docs — Security Overview', url: 'https://kubernetes.io/docs/concepts/security/' };
const REF_HARDEN = { label: 'Kubernetes Docs — Security Checklist', url: 'https://kubernetes.io/docs/concepts/security/security-checklist/' };
const REF_PROBES = { label: 'Kubernetes Docs — Configure Liveness/Readiness Probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const TF: Opt[] = [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Cluster Setup (10) ──
  {
    domain: SETUP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You apply a NetworkPolicy that selects all Pods in the `prod` namespace with `podSelector: {}` and `policyTypes: [Ingress]` but lists no ingress rules. What is the effect?',
    options: opts4(
      'All ingress traffic to every Pod in `prod` is denied.',
      'All ingress traffic to every Pod in `prod` is allowed.',
      'Only egress traffic from `prod` Pods is denied.',
      'The policy is rejected because it has no rules.'
    ),
    correct: ['a'],
    explanation: 'An empty `podSelector` selects every Pod in the namespace; declaring `policyTypes: [Ingress]` with no `ingress` rules creates a default-deny-ingress posture. Egress is unaffected because it is not in policyTypes.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to allow Pods labelled `app=api` in namespace `prod` to receive traffic ONLY from Pods labelled `app=web` in the same namespace. Which NetworkPolicy ingress selector is correct?',
    options: opts4(
      'A `from` block with `namespaceSelector` matching `prod` only',
      'A `from` block with `podSelector: { matchLabels: { app: web } }`',
      'An empty `ingress: [{}]` rule',
      'A `from` block with `ipBlock.cidr: 0.0.0.0/0`'
    ),
    correct: ['b'],
    explanation: 'A `podSelector` inside `from` (without a `namespaceSelector`) matches Pods in the policy\'s own namespace. Selecting `app=web` restricts ingress to only those source Pods.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Kubernetes NetworkPolicies.',
    options: opts4(
      'They are namespaced resources.',
      'Enforcement requires a CNI plugin that implements NetworkPolicy.',
      'Combining ingress rules across multiple policies is additive (union of allowed traffic).',
      'A Pod not selected by any policy defaults to deny-all.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'NetworkPolicies are namespaced and additive; enforcement needs a policy-capable CNI (Calico, Cilium, etc.). A Pod selected by NO policy defaults to allow-all, not deny-all.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You run `kube-bench` against a control-plane node and a check on `--anonymous-auth` for the API server FAILs. Which remediation aligns with the CIS Kubernetes Benchmark?',
    options: opts4(
      'Set `--anonymous-auth=true` on the kube-apiserver',
      'Set `--anonymous-auth=false` on the kube-apiserver',
      'Remove the `--authorization-mode` flag entirely',
      'Set `--insecure-port=8080` on the kube-apiserver'
    ),
    correct: ['b'],
    explanation: 'The CIS Benchmark requires `--anonymous-auth=false` so unauthenticated requests are rejected. kube-bench reports the CIS item and remediation; the insecure port has been removed in modern Kubernetes and must never be re-enabled.',
    references: [REF_KUBEBENCH, REF_APISRV]
  },
  {
    domain: SETUP, difficulty: 2, type: QType.SINGLE,
    stem: 'An Ingress must terminate TLS for host `shop.example.com`. Where does the Ingress get the certificate and key?',
    options: opts4(
      'From a `kubernetes.io/tls` Secret referenced in `spec.tls[].secretName`',
      'From a ConfigMap mounted into the Ingress controller',
      'From the `tls.crt` annotation on the Ingress object',
      'From the API server\'s serving certificate automatically'
    ),
    correct: ['a'],
    explanation: 'Ingress TLS termination uses a Secret of type `kubernetes.io/tls` (keys `tls.crt`/`tls.key`) referenced by `spec.tls[].secretName`, with `hosts` matching the served host.',
    references: [REF_TLS, REF_ING]
  },
  {
    domain: SETUP, difficulty: 4, type: QType.SINGLE, isTeaser: true,
    stem: 'After applying a default-deny-all NetworkPolicy in `prod`, application Pods can no longer resolve Service names. What additional rule restores functionality with least privilege?',
    options: opts4(
      'Allow all egress to 0.0.0.0/0',
      'Allow egress on UDP/TCP port 53 to the kube-system DNS Pods/namespace',
      'Disable the NetworkPolicy entirely',
      'Add `hostNetwork: true` to every Pod'
    ),
    correct: ['b'],
    explanation: 'Default-deny egress also blocks DNS. The least-privilege fix is an egress rule allowing port 53 (UDP and TCP) to the CoreDNS Pods in kube-system, not opening all egress.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which kube-apiserver flag should point at a file that limits which TLS cipher suites are accepted, reducing exposure to weak ciphers?',
    options: opts4(
      '--tls-cipher-suites',
      '--enable-bootstrap-token-auth',
      '--profiling',
      '--service-account-lookup'
    ),
    correct: ['a'],
    explanation: '`--tls-cipher-suites` restricts the API server to a hardened list of strong cipher suites. CIS benchmarks recommend disabling weak ciphers; `--profiling=false` is a separate hardening item.',
    references: [REF_APISRV, REF_KUBEBENCH]
  },
  {
    domain: SETUP, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Disabling the kube-apiserver profiling endpoint with `--profiling=false` is a CIS-recommended hardening measure because the endpoint can leak system/program details.',
    options: TF,
    correct: ['true'],
    explanation: 'The CIS Benchmark recommends `--profiling=false` on the API server, controller-manager, and scheduler to avoid exposing profiling data unless actively debugging.',
    references: [REF_KUBEBENCH, REF_APISRV]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE,
    stem: 'You must restrict egress so `prod` Pods can reach only an external payment API at 203.0.113.10/32 plus cluster DNS. Which NetworkPolicy egress construct targets the external IP?',
    options: opts4(
      'A `to` block with `ipBlock: { cidr: 203.0.113.10/32 }`',
      'A `to` block with `podSelector` matching the API',
      'A `to` block with `namespaceSelector: {}`',
      'An annotation `egress.kubernetes.io/allow: 203.0.113.10`'
    ),
    correct: ['a'],
    explanation: 'External (off-cluster) destinations are matched with `ipBlock.cidr`. Pod/namespace selectors only match in-cluster endpoints, so a /32 ipBlock plus a DNS rule is the least-privilege egress.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 4, type: QType.MULTI,
    stem: 'You are hardening Ingress for a public web app. Select ALL measures that improve transport security.',
    options: opts4(
      'Reference a valid `kubernetes.io/tls` Secret and set `spec.tls[].hosts`',
      'Configure the Ingress controller / annotation to redirect HTTP to HTTPS',
      'Store the private key in a plaintext ConfigMap for easy rotation',
      'Disable TLS and rely on a NetworkPolicy instead'
    ),
    correct: ['a', 'b'],
    explanation: 'TLS termination via a tls Secret plus an HTTP→HTTPS redirect hardens transport. Private keys must live in Secrets, never ConfigMaps, and NetworkPolicies do not provide encryption.',
    references: [REF_TLS, REF_ING]
  },

  // ── Cluster Hardening (10) ──
  {
    domain: CHARD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod\'s ServiceAccount does not need to call the Kubernetes API. Which field disables the automatic mounting of its API token?',
    options: opts4(
      'spec.automountServiceAccountToken: false',
      'spec.serviceAccountToken.enabled: false',
      'metadata.annotations: token=disabled',
      'spec.securityContext.runAsNonRoot: true'
    ),
    correct: ['a'],
    explanation: 'Setting `automountServiceAccountToken: false` on the Pod (or the ServiceAccount) prevents the projected API token from being mounted, reducing token-theft blast radius.',
    references: [REF_SA, REF_SATOKEN]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must grant a CI ServiceAccount permission to only `get` and `list` Pods in namespace `build`. Which RBAC objects implement least privilege?',
    options: opts4(
      'A ClusterRole with `*` verbs bound via ClusterRoleBinding',
      'A namespaced Role with verbs [get,list] on pods, bound by a RoleBinding',
      'Add the SA to the `system:masters` group',
      'A RoleBinding to the built-in `cluster-admin` ClusterRole'
    ),
    correct: ['b'],
    explanation: 'A namespaced Role limited to the exact verbs/resources, bound with a RoleBinding in `build`, is least privilege. `system:masters` and `cluster-admin` grant full access.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Kubernetes RBAC.',
    options: opts4(
      'A Role is namespaced; a ClusterRole is cluster-scoped.',
      'A RoleBinding can reference a ClusterRole to reuse it within one namespace.',
      'RBAC permissions are deny-by-default and purely additive (no deny rules).',
      'ClusterRoleBindings can be scoped to a single namespace.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Roles are namespaced, ClusterRoles cluster-wide; a RoleBinding may bind a ClusterRole into one namespace. RBAC has no deny rules — it is additive and deny-by-default. ClusterRoleBindings are always cluster-wide.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which kube-apiserver authorization mode setting follows the principle of least privilege for a production cluster?',
    options: opts4(
      '--authorization-mode=AlwaysAllow',
      '--authorization-mode=Node,RBAC',
      '--authorization-mode=ABAC only with a permissive policy',
      '--authorization-mode=AlwaysDeny'
    ),
    correct: ['b'],
    explanation: '`Node,RBAC` is the recommended production setting: the Node authorizer scopes kubelet access and RBAC governs everything else. `AlwaysAllow` disables authorization entirely.',
    references: [REF_APISRV, REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 4, type: QType.SINGLE,
    stem: 'You want kubelet to reject anonymous requests and authorize via the API server. Which kubelet settings achieve this?',
    options: opts4(
      'anonymous.enabled=false and authorization.mode=Webhook',
      'anonymous.enabled=true and authorization.mode=AlwaysAllow',
      'readOnlyPort=10255 and authentication.webhook.enabled=false',
      'authentication.x509.clientCAFile unset and anonymous.enabled=true'
    ),
    correct: ['a'],
    explanation: 'Setting kubelet `authentication.anonymous.enabled=false` and `authorization.mode=Webhook` (delegating to the API server SubjectAccessReview) is the CIS-recommended hardening; the read-only port should be disabled (0).',
    references: [REF_KUBELET, REF_KUBEBENCH]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'A token leaked from a Pod is still valid after the Pod was deleted. Which mechanism issues short-lived, audience-bound, auto-rotated tokens to mitigate this?',
    options: opts4(
      'Legacy ServiceAccount Secret tokens',
      'Bound ServiceAccount token volume projection',
      'Basic auth tokens in a static token file',
      'A ConfigMap containing the token'
    ),
    correct: ['b'],
    explanation: 'Projected bound ServiceAccount tokens are short-lived, audience-scoped, and tied to the Pod lifetime, so a leaked token expires quickly — unlike legacy long-lived Secret tokens.',
    references: [REF_SATOKEN, REF_SA]
  },
  {
    domain: CHARD, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Binding a workload ServiceAccount to the built-in `cluster-admin` ClusterRole is acceptable as long as the namespace has a NetworkPolicy.',
    options: TF,
    correct: ['false'],
    explanation: 'NetworkPolicy controls network reachability, not API authorization. Granting `cluster-admin` to a workload SA violates least privilege regardless of network rules.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lets you verify whether ServiceAccount `ci` in namespace `build` can delete deployments — useful for auditing over-broad RBAC?',
    options: opts4(
      'kubectl auth can-i delete deployments --as=system:serviceaccount:build:ci -n build',
      'kubectl describe sa ci -n build',
      'kubectl get rolebindings --all-namespaces',
      'kubectl auth reconcile -f role.yaml'
    ),
    correct: ['a'],
    explanation: '`kubectl auth can-i ... --as=system:serviceaccount:<ns>:<name>` impersonates the SA to test an effective permission, the fastest way to audit least privilege.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 4, type: QType.SINGLE,
    stem: 'To minimize attack surface, which kube-apiserver flag enables a hardened admission plugin chain via configuration file?',
    options: opts4(
      '--admission-control-config-file pointing to an AdmissionConfiguration',
      '--allow-privileged=true',
      '--disable-admission-plugins=NodeRestriction',
      '--enable-aggregator-routing=false'
    ),
    correct: ['a'],
    explanation: '`--admission-control-config-file` references an AdmissionConfiguration that configures plugins (e.g. PodSecurity, ImagePolicyWebhook). Disabling NodeRestriction or allowing privileged would weaken security.',
    references: [REF_ADMISSION, REF_APISRV]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to upgrade a kubeadm cluster to patch a recently disclosed CVE in the control plane. Which is the correct first step on the primary control-plane node?',
    options: opts4(
      'Run `kubeadm upgrade apply <version>` after upgrading the kubeadm binary',
      'Delete and recreate the cluster with the new version',
      'Run `kubectl set image` on the apiserver Deployment',
      'Edit /etc/kubernetes/manifests by hand and reboot'
    ),
    correct: ['a'],
    explanation: 'kubeadm clusters are upgraded by upgrading the `kubeadm` binary, then running `kubeadm upgrade plan`/`apply <version>` on the first control-plane node, then upgrading kubelet/kubectl and other nodes.',
    references: [REF_UPGRADE]
  },

  // ── System Hardening (6) ──
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You loaded an AppArmor profile `k8s-deny-write` on every node. How is it applied to a container in modern Kubernetes (>=1.30)?',
    options: opts4(
      'Via `securityContext.appArmorProfile` with type `Localhost` and the profile name',
      'By setting `privileged: true`',
      'Through a NetworkPolicy annotation',
      'By mounting the profile as a ConfigMap'
    ),
    correct: ['a'],
    explanation: 'Modern Kubernetes sets AppArmor via `securityContext.appArmorProfile` (type `Localhost` + `localhostProfile`), replacing the old `container.apparmor.security.beta.kubernetes.io/<container>` annotation. The profile must be loaded on the node.',
    references: [REF_APPARMOR, REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Pod securityContext setting applies the container runtime\'s default seccomp filter to block dangerous syscalls?',
    options: opts4(
      'seccompProfile.type: RuntimeDefault',
      'seccompProfile.type: Unconfined',
      'capabilities.add: ["SYS_ADMIN"]',
      'allowPrivilegeEscalation: true'
    ),
    correct: ['a'],
    explanation: '`seccompProfile.type: RuntimeDefault` applies the container runtime\'s curated default seccomp profile. `Unconfined` disables seccomp; adding SYS_ADMIN or allowing privilege escalation weakens security.',
    references: [REF_SECCOMP, REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 2, type: QType.SINGLE,
    stem: 'To reduce node attack surface, which is the BEST practice for the kubelet read-only port (10255)?',
    options: opts4(
      'Leave it enabled for monitoring convenience',
      'Set the kubelet read-only port to 0 (disabled)',
      'Expose it through a LoadBalancer Service',
      'Allow it but firewall it to 0.0.0.0/0'
    ),
    correct: ['b'],
    explanation: 'The kubelet read-only port serves unauthenticated data and should be disabled by setting it to 0; metrics should use the authenticated port instead.',
    references: [REF_KUBELET, REF_KUBEBENCH]
  },
  {
    domain: SHARD, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL host/OS hardening measures that reduce a Kubernetes node\'s attack surface.',
    options: opts4(
      'Remove or disable unused kernel modules and unnecessary OS packages/services',
      'Apply restrictive seccomp/AppArmor profiles to workloads',
      'Run all workloads as UID 0 for simplicity',
      'Restrict SSH and use a minimal/hardened host OS image'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Minimizing packages/modules, enforcing seccomp/AppArmor, and locking down host access all shrink attack surface. Running everything as root expands it and violates least privilege.',
    references: [REF_HARDEN, REF_SECCOMP]
  },
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'A container only needs to bind to port 80. Which securityContext approach grants the minimum privilege to do so without running as root?',
    options: opts4(
      'Run as root (UID 0)',
      'runAsNonRoot: true with capabilities.drop: ["ALL"] and add ["NET_BIND_SERVICE"]',
      'privileged: true',
      'allowPrivilegeEscalation: true with all capabilities'
    ),
    correct: ['b'],
    explanation: 'Dropping ALL capabilities then adding only `NET_BIND_SERVICE` lets a non-root process bind to a low port with minimal privilege. Privileged/root or all-caps grossly over-grant.',
    references: [REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: `seccompProfile.type: Unconfined` disables seccomp filtering for the container and increases the syscall attack surface.',
    options: TF,
    correct: ['true'],
    explanation: '`Unconfined` runs the container with no seccomp filter, allowing all syscalls — the opposite of hardening. Prefer `RuntimeDefault` or a `Localhost` profile.',
    references: [REF_SECCOMP]
  },

  // ── Minimize Microservice Vulnerabilities (13) ──
  {
    domain: MICRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Pod Security Standards level prevents privileged containers, host namespaces, and most privilege escalations while remaining broadly compatible?',
    options: opts4(
      'privileged',
      'baseline',
      'restricted',
      'unconfined'
    ),
    correct: ['c'],
    explanation: 'The `restricted` profile enforces strong hardening (non-root, drop ALL caps, seccomp RuntimeDefault, no privilege escalation). `baseline` only blocks known dangerous settings; `privileged` is unrestricted.',
    references: [REF_PSS, REF_PSA]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'How do you enforce the `restricted` Pod Security Standard for all Pods created in namespace `payments`?',
    options: opts4(
      'Label the namespace `pod-security.kubernetes.io/enforce=restricted`',
      'Add an annotation `psp=restricted` to each Pod',
      'Create a NetworkPolicy named restricted',
      'Set `--allow-privileged=false` on the kubelet'
    ),
    correct: ['a'],
    explanation: 'Pod Security Admission is configured by namespace labels: `pod-security.kubernetes.io/enforce=restricted` (plus optional warn/audit) rejects non-conforming Pods at admission.',
    references: [REF_PSA, REF_PSS]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL securityContext settings required by the `restricted` Pod Security Standard.',
    options: opts4(
      'runAsNonRoot: true',
      'allowPrivilegeEscalation: false',
      'capabilities.drop: ["ALL"]',
      'privileged: true'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The restricted profile requires non-root, no privilege escalation, dropping ALL capabilities, and a RuntimeDefault/Localhost seccomp profile. `privileged: true` is explicitly forbidden.',
    references: [REF_PSS, REF_SCTX]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must run an untrusted multi-tenant workload with stronger kernel isolation than a normal container. Which Kubernetes feature selects a gVisor/Kata sandboxed runtime?',
    options: opts4(
      'A RuntimeClass referenced via `spec.runtimeClassName`',
      'A PriorityClass on the Pod',
      'An annotation `sandbox: true`',
      'Setting `hostPID: true`'
    ),
    correct: ['a'],
    explanation: 'A RuntimeClass maps to a sandboxed handler (e.g. gVisor `runsc` or Kata Containers). Pods opt in via `spec.runtimeClassName`, gaining a stronger isolation boundary.',
    references: [REF_RUNTIME, REF_SANDBOX]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.SINGLE,
    stem: 'A policy must reject any Pod that sets `hostPID: true`. Which admission tools can enforce this cluster-wide using policy-as-code?',
    options: opts4(
      'OPA Gatekeeper or Kyverno admission policies',
      'A LimitRange in each namespace',
      'A ResourceQuota object',
      'A liveness probe on every Pod'
    ),
    correct: ['a'],
    explanation: 'OPA Gatekeeper (Rego ConstraintTemplates) and Kyverno (declarative policies) are validating admission controllers that can deny Pods with `hostPID: true`. Quotas/LimitRanges/probes do not gate security fields.',
    references: [REF_OPA, REF_ADMISSION]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'Application config contains an API key. What is the most secure built-in way to provide it and limit disk/log exposure?',
    options: opts4(
      'Hard-code it in the container image',
      'Put it in a Secret and mount it as a tmpfs (in-memory) volume or env from Secret',
      'Store it in a ConfigMap',
      'Pass it as a command-line flag in the Pod spec'
    ),
    correct: ['b'],
    explanation: 'Secrets keep sensitive data out of the image/ConfigMap; mounted Secret volumes are backed by tmpfs (memory), and access can be RBAC-restricted. CLI flags/ConfigMaps leak via process listings and are not designed for secrets.',
    references: [REF_SECRET]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.SINGLE,
    stem: 'To protect Secret data if etcd storage is compromised, which cluster configuration should you enable?',
    options: opts4(
      'Encryption at rest via an EncryptionConfiguration (e.g. aescbc/KMS provider)',
      'Base64-encode the Secret twice',
      'Store Secrets in ConfigMaps instead',
      'Disable the API server audit log'
    ),
    correct: ['a'],
    explanation: 'Kubernetes Secrets are only base64-encoded in etcd by default. Enabling encryption at rest with an `EncryptionConfiguration` (aescbc or a KMS provider) protects data if etcd is exfiltrated.',
    references: [REF_ENCRYPT, REF_SECRET]
  },
  {
    domain: MICRO, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Mounting a Secret as a volume is generally preferable to using a hostPath volume to share credentials between Pods.',
    options: TF,
    correct: ['true'],
    explanation: 'Secret volumes are namespaced, RBAC-controlled, and memory-backed. hostPath exposes the node filesystem, breaks isolation, and is a common privilege-escalation vector.',
    references: [REF_SECRET, REF_SCTX]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which RuntimeClass-based handler provides a user-space kernel that intercepts syscalls to isolate containers?',
    options: opts4(
      'gVisor (runsc)',
      'runc (default OCI runtime)',
      'containerd shim v2 without a sandbox',
      'CRI-O default runtime'
    ),
    correct: ['a'],
    explanation: 'gVisor\'s `runsc` implements a user-space kernel that intercepts and handles syscalls, giving stronger isolation than the default `runc`. Kata uses lightweight VMs for a similar goal.',
    references: [REF_RUNTIME, REF_SANDBOX]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod should not be able to write to its container root filesystem at runtime. Which securityContext field enforces this?',
    options: opts4(
      'readOnlyRootFilesystem: true',
      'runAsUser: 0',
      'allowPrivilegeEscalation: true',
      'privileged: true'
    ),
    correct: ['a'],
    explanation: '`readOnlyRootFilesystem: true` makes the container root FS immutable, blocking tampering and many persistence techniques; writable paths must be explicit emptyDir/volumes.',
    references: [REF_SCTX, REF_PSS]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid approaches to minimize microservice vulnerabilities at admission time.',
    options: opts4(
      'Enforce Pod Security Admission `restricted` on namespaces',
      'Use Kyverno/OPA Gatekeeper to require dropped capabilities',
      'Use a RuntimeClass for sandboxed runtimes on untrusted workloads',
      'Disable all admission webhooks to speed up scheduling'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'PSA, policy engines, and sandboxed runtimes all reduce microservice risk at/after admission. Disabling admission webhooks removes a primary security control.',
    references: [REF_PSA, REF_OPA, REF_RUNTIME]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'mTLS between microservices ensures which property that a plain NetworkPolicy alone does not provide?',
    options: opts4(
      'Mutual cryptographic authentication and encryption of pod-to-pod traffic',
      'L3/L4 packet filtering only',
      'Automatic image vulnerability scanning',
      'Node kernel hardening'
    ),
    correct: ['a'],
    explanation: 'A NetworkPolicy filters by selectors/ports but does not encrypt or mutually authenticate. mTLS (e.g. via a service mesh) adds identity-based authentication and in-transit encryption.',
    references: [REF_SECURITY, REF_NP]
  },
  {
    domain: MICRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which setting prevents a process in a container from gaining more privileges than its parent (e.g. via setuid binaries)?',
    options: opts4(
      'securityContext.allowPrivilegeEscalation: false',
      'securityContext.privileged: true',
      'hostNetwork: true',
      'automountServiceAccountToken: true'
    ),
    correct: ['a'],
    explanation: '`allowPrivilegeEscalation: false` sets `no_new_privs`, stopping setuid/file-capability escalation inside the container — required by the restricted PSS profile.',
    references: [REF_SCTX, REF_PSS]
  },

  // ── Supply Chain Security (13) ──
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which tool scans a container image for known OS and language-dependency CVEs and can fail a CI pipeline above a severity threshold?',
    options: opts4(
      'Trivy',
      'kubectl top',
      'etcdctl',
      'kube-proxy'
    ),
    correct: ['a'],
    explanation: 'Trivy scans images (and filesystems/IaC) for known vulnerabilities and can exit non-zero on configurable severities (e.g. `--severity HIGH,CRITICAL --exit-code 1`) to gate CI.',
    references: [REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'To reduce image attack surface and CVE count, which base image strategy is best?',
    options: opts4(
      'Use a full general-purpose OS image with build tools included',
      'Use a minimal/distroless base and multi-stage builds that exclude build tooling',
      'Always run `latest` tags',
      'Add `curl | bash` installers at runtime'
    ),
    correct: ['b'],
    explanation: 'Minimal/distroless bases plus multi-stage builds remove shells, package managers, and compilers from the final image, shrinking attack surface and CVE exposure. `latest` tags break reproducibility.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that strengthen container image supply chain security.',
    options: opts4(
      'Pin images by immutable digest (sha256) rather than mutable tags',
      'Sign images and verify signatures at admission',
      'Generate and review an SBOM for each image',
      'Pull images from any public registry without restriction'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Digest pinning, signing/verification, and SBOM review all harden the supply chain. Allowing arbitrary registries enables typosquatting and untrusted-image attacks; restrict to approved registries.',
    references: [REF_IMGPOLICY, REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which kube-apiserver admission controller can call an external service to allow/deny Pods based on image policy (e.g. only signed images from an approved registry)?',
    options: opts4(
      'ImagePolicyWebhook',
      'LimitRanger',
      'DefaultStorageClass',
      'ServiceAccount'
    ),
    correct: ['a'],
    explanation: 'The `ImagePolicyWebhook` admission controller delegates image admission decisions to an external backend, enabling signature/registry policy enforcement at the API server.',
    references: [REF_IMGPOLICY, REF_ADMISSION]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does an SBOM (Software Bill of Materials) provide for supply chain security?',
    options: opts4(
      'An inventory of components/dependencies in an artifact for vulnerability and license tracking',
      'A network firewall ruleset',
      'A Kubernetes RBAC policy',
      'A node kernel seccomp profile'
    ),
    correct: ['a'],
    explanation: 'An SBOM lists the packages and dependencies inside an artifact, enabling rapid impact analysis when a new CVE is disclosed and supporting license/compliance checks.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 4, type: QType.SINGLE,
    stem: 'You want admission to reject any image not pulled from `registry.internal.example.com`. Which approach is most appropriate?',
    options: opts4(
      'A Kyverno/Gatekeeper policy validating `image` prefixes (with ImagePolicyWebhook as an alternative)',
      'A ResourceQuota limiting image count',
      'A NetworkPolicy denying egress to Docker Hub',
      'A LimitRange on container memory'
    ),
    correct: ['a'],
    explanation: 'Policy engines (Kyverno/Gatekeeper) or the ImagePolicyWebhook can validate the registry prefix of each container image at admission. A NetworkPolicy may block pulls but does not enforce provenance for cached images.',
    references: [REF_OPA, REF_IMGPOLICY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which static analysis tool checks Kubernetes manifests/Pod specs for insecure security settings (e.g. running as root, missing limits)?',
    options: opts4(
      'kubesec',
      'kube-proxy',
      'coredns',
      'kubelet'
    ),
    correct: ['a'],
    explanation: 'kubesec performs static risk analysis of Kubernetes resources, scoring manifests on securityContext and other hardening attributes. kube-bench instead audits the cluster against CIS.',
    references: [REF_KUBEBENCH, REF_SCTX]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Referencing an image by tag like `app:1.0` guarantees the exact same bytes are deployed every time, so digest pinning is unnecessary.',
    options: TF,
    correct: ['false'],
    explanation: 'Tags are mutable and can be overwritten. Only an immutable digest (`app@sha256:...`) guarantees content integrity, which is why supply chain hardening recommends digest pinning.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'Where should image vulnerability scanning ideally occur to "shift left" in the supply chain?',
    options: opts4(
      'Only in production at runtime',
      'In CI on every build/push, plus periodic registry rescans',
      'Never — rely on the base image vendor',
      'Only when an incident is reported'
    ),
    correct: ['b'],
    explanation: 'Scanning in CI blocks vulnerable images before deploy; periodic registry rescans catch newly disclosed CVEs in already-built images. Runtime-only scanning is too late.',
    references: [REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 4, type: QType.SINGLE,
    stem: 'A multi-stage Dockerfile copies the compiled binary into a `gcr.io/distroless/static` final stage. What primary supply chain benefit does this provide?',
    options: opts4(
      'It removes the shell and package manager, drastically reducing CVEs and exploitation tooling in the image',
      'It automatically signs the image',
      'It enforces NetworkPolicies',
      'It rotates ServiceAccount tokens'
    ),
    correct: ['a'],
    explanation: 'Distroless images contain only the app and its runtime deps — no shell, apt, or coreutils — which both lowers the CVE surface and removes tools an attacker would use post-compromise. Signing is a separate step.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'kube-bench is primarily used to:',
    options: opts4(
      'Audit a cluster\'s configuration against the CIS Kubernetes Benchmark',
      'Scan container images for CVEs',
      'Generate an SBOM',
      'Enforce admission policies at runtime'
    ),
    correct: ['a'],
    explanation: 'kube-bench checks node/control-plane configuration against the CIS Kubernetes Benchmark and reports PASS/FAIL with remediation. Image CVE scanning is Trivy\'s job; SBOMs come from tools like Trivy/Syft.',
    references: [REF_KUBEBENCH]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE,
    stem: 'Why should `imagePullPolicy: Always` (or digest pinning) be considered for security-sensitive deployments?',
    options: opts4(
      'It ensures the intended image content is fetched/verified rather than a stale or tampered cached layer',
      'It disables the kubelet',
      'It encrypts etcd',
      'It grants cluster-admin to the workload'
    ),
    correct: ['a'],
    explanation: 'With mutable tags, `imagePullPolicy: Always` re-pulls and revalidates the image instead of trusting a possibly stale/poisoned node cache; digest pinning provides the strongest integrity guarantee.',
    references: [REF_SECURITY, REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about static analysis in the CKS supply chain context.',
    options: opts4(
      'kubesec scores Kubernetes manifests for risky security settings',
      'Trivy can scan IaC/Dockerfiles for misconfigurations, not just image CVEs',
      'kube-bench validates the live cluster against CIS controls',
      'Static analysis fully replaces runtime detection tools like Falco'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'kubesec (manifests), Trivy (images + IaC/config), and kube-bench (CIS audit) are complementary static checks. They do not replace runtime detection — Falco still observes behavior at execution time.',
    references: [REF_TRIVY, REF_KUBEBENCH, REF_FALCO]
  },

  // ── Monitoring, Logging and Runtime Security (13) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which tool uses kernel/syscall events (eBPF or a kernel module) to detect abnormal runtime behavior such as a shell spawned in a container?',
    options: opts4(
      'Falco',
      'kube-bench',
      'Trivy',
      'kubectl describe'
    ),
    correct: ['a'],
    explanation: 'Falco taps syscalls (via eBPF or a kernel module) and evaluates rules to alert on suspicious runtime behavior (shell in container, sensitive file reads, unexpected outbound connections).',
    references: [REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must capture who did what on the API server, including request and response metadata, for security forensics. Which feature do you configure?',
    options: opts4(
      'API server auditing via an audit policy and `--audit-log-path`/`--audit-policy-file`',
      'kubelet read-only port',
      'A LimitRange',
      'A readiness probe'
    ),
    correct: ['a'],
    explanation: 'Kubernetes auditing records API requests at configurable stages/levels (Metadata, Request, RequestResponse) via an audit policy file, written to a log/webhook for forensic analysis.',
    references: [REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Kubernetes audit policy levels.',
    options: opts4(
      'None',
      'Metadata',
      'Request',
      'RequestResponse'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'Audit policy rule levels are `None`, `Metadata`, `Request`, and `RequestResponse`, in increasing verbosity. Choosing the right level per resource balances forensic value against log volume and secret exposure.',
    references: [REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A Falco rule should alert when a process executes `bash` inside any container. Which Falco concept matches the syscall pattern?',
    options: opts4(
      'A Falco rule with a condition and macros/lists evaluated against syscall events',
      'A Kubernetes LimitRange',
      'An OPA Gatekeeper ConstraintTemplate',
      'A readiness probe'
    ),
    correct: ['a'],
    explanation: 'Falco rules define a `condition` (often reusing macros/lists) over syscall fields plus an `output`, `priority`, and tags. Gatekeeper/probes operate at admission/health, not runtime syscalls.',
    references: [REF_FALCO_RULES, REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'To make a container "immutable" at runtime so an attacker cannot install tools or modify binaries, which combination is most effective?',
    options: opts4(
      'readOnlyRootFilesystem: true plus dropping write capabilities and no package manager in the image',
      'privileged: true with hostPID',
      'allowPrivilegeEscalation: true',
      'Mounting a hostPath at /usr/bin'
    ),
    correct: ['a'],
    explanation: 'A read-only root filesystem, minimal image (no shell/pkg manager), and dropped capabilities enforce runtime immutability so attackers cannot persist or tamper. The other options weaken isolation.',
    references: [REF_SCTX, REF_PSS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Behavioral runtime detection (e.g. Falco) primarily complements admission-time controls because it:',
    options: opts4(
      'Detects malicious activity that occurs AFTER a Pod is admitted and running',
      'Replaces the need for RBAC',
      'Encrypts etcd at rest',
      'Builds container images'
    ),
    correct: ['a'],
    explanation: 'Admission controls gate what can be created; runtime detection observes actual behavior post-admission (exploits, lateral movement) that policy alone cannot foresee, enabling defense in depth.',
    references: [REF_FALCO, REF_SECURITY]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Setting an API server audit policy level of `RequestResponse` for Secret writes is recommended because it logs the full secret body for forensics.',
    options: TF,
    correct: ['false'],
    explanation: 'Logging full request/response bodies for Secrets would write sensitive data into audit logs. Best practice is to use `Metadata` for Secrets/ConfigMaps to avoid leaking secret contents.',
    references: [REF_AUDIT, REF_SECRET]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which kube-apiserver flags are required to enable file-based audit logging?',
    options: opts4(
      '--audit-policy-file and --audit-log-path',
      '--profiling and --anonymous-auth',
      '--allow-privileged and --insecure-port',
      '--feature-gates and --runtime-config only'
    ),
    correct: ['a'],
    explanation: 'Auditing needs `--audit-policy-file` (which events at which level) and a backend such as `--audit-log-path` (log file) or `--audit-webhook-config-file`. The others are unrelated or insecure.',
    references: [REF_AUDIT, REF_APISRV]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A Falco alert fires: "Write below /etc by process in container". The fastest containment that preserves evidence is to:',
    options: opts4(
      'Cordon/isolate the node and quarantine the Pod (e.g. scale down / network-isolate) while collecting logs',
      'Immediately delete the namespace and all its history',
      'Ignore it; Falco has false positives',
      'Grant cluster-admin to investigate faster'
    ),
    correct: ['a'],
    explanation: 'Incident response favors isolating the affected workload/node and preserving forensic data over destructive actions; deleting everything destroys evidence and granting cluster-admin worsens exposure.',
    references: [REF_FALCO, REF_SECURITY]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL signals useful for detecting a compromised container at runtime.',
    options: opts4(
      'Unexpected shell/process execution inside the container (Falco)',
      'Outbound connections to unknown IPs from a workload that should not egress',
      'Writes to read-only or sensitive host paths',
      'A Pod successfully passing its readiness probe'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Anomalous process exec, unexpected egress, and writes to sensitive paths are classic compromise indicators Falco/audit logs surface. A passing readiness probe is normal health, not a security signal.',
    references: [REF_FALCO, REF_AUDIT, REF_PROBES]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Where are Kubernetes API audit logs typically sent for durable, centralized analysis?',
    options: opts4(
      'A log file collected by an agent and/or a webhook backend (SIEM)',
      'The Pod\'s stdout only',
      'A ConfigMap',
      'The kubelet read-only port'
    ),
    correct: ['a'],
    explanation: 'Audit events go to a log file (shipped by a node agent) or a webhook to a SIEM for retention, correlation, and alerting — not a ConfigMap or the kubelet read-only port.',
    references: [REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best distinguishes Falco from kube-bench?',
    options: opts4(
      'Falco does runtime behavioral detection; kube-bench does point-in-time CIS configuration auditing',
      'Both scan container images for CVEs',
      'Both are admission controllers',
      'Falco encrypts Secrets; kube-bench signs images'
    ),
    correct: ['a'],
    explanation: 'Falco continuously watches syscalls for abnormal behavior; kube-bench performs a static CIS Benchmark audit. They address different layers of the defense-in-depth model.',
    references: [REF_FALCO, REF_KUBEBENCH]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'To reduce noise and keep audit logs forensically useful, a good audit policy practice is to:',
    options: opts4(
      'Log Secrets/ConfigMaps at Metadata level and higher-risk verbs at Request/RequestResponse',
      'Log every request at RequestResponse including all Secret bodies',
      'Disable auditing in production',
      'Only audit successful requests'
    ),
    correct: ['a'],
    explanation: 'A tiered policy — Metadata for sensitive resources, richer levels for high-risk actions, and capturing failures — balances forensic value, log volume, and avoiding secret leakage.',
    references: [REF_AUDIT]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Cluster Setup (10) ──
  {
    domain: SETUP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A NetworkPolicy in `web` has `policyTypes: [Egress]` and an empty `egress` list, selecting all Pods. What happens to those Pods?',
    options: opts4(
      'All egress traffic is denied (including DNS)',
      'All ingress is denied',
      'Nothing changes; egress remains allowed',
      'The API server rejects the manifest'
    ),
    correct: ['a'],
    explanation: 'Declaring `policyTypes: [Egress]` with no egress rules is default-deny-egress for the selected Pods — DNS will also break unless a port-53 egress rule is added.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Pods in `frontend` must reach Pods in `backend` (different namespace). Which ingress `from` selector on the backend policy is correct and least privilege?',
    options: opts4(
      '`namespaceSelector` matching the `frontend` namespace label (optionally combined with a podSelector)',
      '`ipBlock: 0.0.0.0/0`',
      'An empty `from: []`',
      'A `podSelector` only (matches same namespace, so it would not match frontend)'
    ),
    correct: ['a'],
    explanation: 'Cross-namespace ingress requires a `namespaceSelector` (optionally AND-combined with a podSelector in the same `from` element). A bare podSelector only matches the policy\'s own namespace.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE,
    stem: 'kube-bench reports the API server `--kubelet-certificate-authority` is not set. Why does the CIS Benchmark want this configured?',
    options: opts4(
      'So the API server verifies the kubelet\'s serving certificate, preventing MITM on apiserver→kubelet calls',
      'So the kubelet can run as root',
      'To disable RBAC',
      'To allow anonymous kubelet access'
    ),
    correct: ['a'],
    explanation: 'Setting `--kubelet-certificate-authority` lets the API server validate kubelet serving certs, preventing man-in-the-middle attacks on the apiserver-to-kubelet connection (logs/exec/port-forward).',
    references: [REF_KUBEBENCH, REF_APISRV]
  },
  {
    domain: SETUP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Secret type must an Ingress reference for TLS termination, and which keys must it contain?',
    options: opts4(
      'Type `kubernetes.io/tls` with keys `tls.crt` and `tls.key`',
      'Type `Opaque` with key `cert`',
      'Type `kubernetes.io/dockerconfigjson`',
      'Type `bootstrap.kubernetes.io/token`'
    ),
    correct: ['a'],
    explanation: 'Ingress TLS uses a `kubernetes.io/tls` Secret containing `tls.crt` and `tls.key`, referenced via `spec.tls[].secretName` with matching `hosts`.',
    references: [REF_TLS, REF_ING]
  },
  {
    domain: SETUP, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL CIS-aligned hardening flags/settings for the kube-apiserver.',
    options: opts4(
      '--anonymous-auth=false',
      '--profiling=false',
      '--authorization-mode=Node,RBAC',
      '--insecure-port=8080'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Disabling anonymous auth and profiling and using Node,RBAC are CIS-recommended. Re-enabling an insecure port serves unauthenticated API traffic and must never be done.',
    references: [REF_KUBEBENCH, REF_APISRV]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You created a deny-all ingress+egress policy in `data`. To still permit Prometheus in `monitoring` to scrape metrics on port 9090, the least-privilege addition is:',
    options: opts4(
      'An ingress rule allowing port 9090 from a `namespaceSelector` matching `monitoring`',
      'Allow all ingress from 0.0.0.0/0',
      'Delete the deny-all policy',
      'Set hostNetwork: true on data Pods'
    ),
    correct: ['a'],
    explanation: 'Add a narrow ingress rule: port 9090 from the monitoring namespace (and ideally the Prometheus podSelector). Broad allow-all or removing the policy defeats the purpose.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: NetworkPolicies are enforced by the Kubernetes API server itself regardless of which CNI plugin is installed.',
    options: TF,
    correct: ['false'],
    explanation: 'The API server stores NetworkPolicy objects, but enforcement is done by a policy-capable CNI (Calico, Cilium, etc.). With a non-enforcing CNI, policies have no effect.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which kube-apiserver flag should be set to `false` to prevent exposing Go pprof profiling data?',
    options: opts4(
      '--profiling',
      '--enable-admission-plugins',
      '--service-account-issuer',
      '--tls-min-version'
    ),
    correct: ['a'],
    explanation: 'CIS recommends `--profiling=false` on the API server (and controller-manager/scheduler) to avoid leaking detailed runtime information via the pprof endpoint.',
    references: [REF_KUBEBENCH, REF_APISRV]
  },
  {
    domain: SETUP, difficulty: 2, type: QType.SINGLE,
    stem: 'To enforce HTTPS only on an Ingress, you typically:',
    options: opts4(
      'Configure the controller (annotation/config) to redirect HTTP to HTTPS and define `spec.tls`',
      'Delete the Service behind the Ingress',
      'Set the Pod to privileged',
      'Remove the tls Secret'
    ),
    correct: ['a'],
    explanation: 'Defining `spec.tls` plus a controller-specific HTTP→HTTPS redirect (e.g. an annotation) forces encrypted transport. Removing the Secret or Service breaks the app instead.',
    references: [REF_ING, REF_TLS]
  },
  {
    domain: SETUP, difficulty: 4, type: QType.SINGLE,
    stem: 'A default-deny policy is in `prod`. Application Pods must talk to a Service `db` in the same namespace on 5432 and to DNS. The minimal egress rules are:',
    options: opts4(
      'Egress to the `db` podSelector on TCP 5432, plus egress to kube-dns on UDP/TCP 53',
      'Egress to 0.0.0.0/0 on all ports',
      'Ingress allow-all',
      'No rules needed; Services bypass NetworkPolicy'
    ),
    correct: ['a'],
    explanation: 'NetworkPolicy applies to Pod IPs behind Services too. Two narrow egress rules — to the db Pods on 5432 and to CoreDNS on 53 — satisfy the requirement with least privilege.',
    references: [REF_NP]
  },

  // ── Cluster Hardening (10) ──
  {
    domain: CHARD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the safest default for a workload that never calls the Kubernetes API?',
    options: opts4(
      'Use the `default` ServiceAccount with admin rights',
      'Set `automountServiceAccountToken: false` and use a dedicated minimal SA',
      'Mount the token but firewall the API server',
      'Disable RBAC for that namespace'
    ),
    correct: ['b'],
    explanation: 'Workloads that do not use the API should not mount a token at all; pair `automountServiceAccountToken: false` with a dedicated SA so any future grant is explicit and minimal.',
    references: [REF_SA, REF_SATOKEN]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A developer needs to read logs of Pods in `team-a` only. Which binding is least privilege?',
    options: opts4(
      'ClusterRoleBinding to a ClusterRole with pods/log get',
      'RoleBinding in `team-a` to a Role granting `get` on `pods/log` (and `get/list` pods)',
      'Add the user to system:masters',
      'RoleBinding to cluster-admin in team-a'
    ),
    correct: ['b'],
    explanation: 'A namespaced RoleBinding to a Role limited to `pods` and the `pods/log` subresource in `team-a` grants exactly what is needed. ClusterRoleBinding or cluster-admin over-grant.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about ServiceAccount tokens in modern Kubernetes.',
    options: opts4(
      'Projected tokens are short-lived and audience-bound',
      'Projected tokens are tied to the Pod and invalidated when the Pod is deleted',
      'Legacy auto-generated Secret tokens are long-lived',
      'A token is required even if the Pod never contacts the API'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Bound projected tokens are short-lived, audience-scoped, and Pod-bound; legacy Secret tokens are long-lived. Workloads that never call the API should disable token automounting entirely.',
    references: [REF_SATOKEN, REF_SA]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'The NodeRestriction admission plugin primarily:',
    options: opts4(
      'Limits what a kubelet can modify to its own Node and Pods bound to it',
      'Encrypts Secrets at rest',
      'Scans images for CVEs',
      'Redirects HTTP to HTTPS'
    ),
    correct: ['a'],
    explanation: 'NodeRestriction (with the Node authorizer) prevents a compromised kubelet from modifying other Nodes/Pods, limiting lateral movement. It should remain enabled.',
    references: [REF_ADMISSION, REF_APISRV]
  },
  {
    domain: CHARD, difficulty: 4, type: QType.SINGLE,
    stem: 'You discover a RoleBinding granting `secrets` `*` to a deployment SA that only needs to read one ConfigMap. The correct remediation is:',
    options: opts4(
      'Replace it with a Role granting `get` on the specific ConfigMap and rebind',
      'Leave it; Secrets are encrypted anyway',
      'Add the SA to cluster-admin to standardize',
      'Delete the namespace'
    ),
    correct: ['a'],
    explanation: 'Least privilege means scoping to the exact resource/verb (get on one ConfigMap). Encryption at rest does not justify excess API permissions; broadening or deleting is wrong.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command audits all RBAC bindings that grant the powerful `cluster-admin` ClusterRole?',
    options: opts4(
      'kubectl get clusterrolebindings -o wide and inspect those referencing cluster-admin',
      'kubectl top nodes',
      'kubectl get pods -A',
      'kubectl drain node'
    ),
    correct: ['a'],
    explanation: 'Listing ClusterRoleBindings (and RoleBindings) and filtering for `roleRef.name: cluster-admin` reveals over-privileged subjects — a routine cluster-hardening audit.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Setting `automountServiceAccountToken: false` on a ServiceAccount affects all Pods using that SA unless a Pod explicitly overrides it.',
    options: TF,
    correct: ['true'],
    explanation: 'The ServiceAccount-level setting is the default for Pods using it; a Pod can still override with its own `automountServiceAccountToken` field.',
    references: [REF_SA, REF_SATOKEN]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'For kubelet hardening, which setting forces clients to present a certificate signed by a trusted CA?',
    options: opts4(
      'authentication.x509.clientCAFile set to the cluster CA',
      'authentication.anonymous.enabled=true',
      'readOnlyPort=10255',
      'authorization.mode=AlwaysAllow'
    ),
    correct: ['a'],
    explanation: 'Configuring the kubelet `authentication.x509.clientCAFile` enables certificate-based client authentication; combined with `authorization.mode=Webhook` and disabled anonymous access, it hardens the kubelet API.',
    references: [REF_KUBELET, REF_KUBEBENCH]
  },
  {
    domain: CHARD, difficulty: 4, type: QType.SINGLE,
    stem: 'Which authorization configuration would dangerously bypass RBAC and should never be used in production?',
    options: opts4(
      '--authorization-mode=AlwaysAllow',
      '--authorization-mode=Node,RBAC',
      '--authorization-mode=RBAC',
      '--authorization-mode=Webhook,RBAC'
    ),
    correct: ['a'],
    explanation: '`AlwaysAllow` authorizes every authenticated (or anonymous) request, completely bypassing RBAC/Node authorizers — a critical misconfiguration.',
    references: [REF_APISRV, REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'After a CVE in kube-apiserver, you must patch a kubeadm cluster. Which sequence is correct?',
    options: opts4(
      'Upgrade kubeadm → `kubeadm upgrade apply` on first control plane → upgrade other control planes → drain & upgrade kubelet on workers',
      'Upgrade kubelet on workers first, then never touch the control plane',
      'kubectl edit the static pod manifests only',
      'Recreate the cluster from scratch'
    ),
    correct: ['a'],
    explanation: 'kubeadm upgrades follow: upgrade the kubeadm binary, `kubeadm upgrade apply` on the first control-plane node, upgrade remaining control planes, then drain/upgrade kubelet/kubeproxy on workers.',
    references: [REF_UPGRADE]
  },

  // ── System Hardening (6) ──
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An AppArmor profile must be active before a Pod uses it. What is the prerequisite?',
    options: opts4(
      'The profile must be loaded into the kernel on the node where the Pod runs',
      'The profile must be stored in etcd',
      'The profile must be a ConfigMap in kube-system',
      'AppArmor requires privileged: true'
    ),
    correct: ['a'],
    explanation: 'AppArmor profiles are enforced by the node kernel, so the profile must be loaded on that node (e.g. via apparmor_parser) before a Pod references it through `securityContext.appArmorProfile`.',
    references: [REF_APPARMOR, REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which seccomp configuration provides a tailored allow-list of syscalls specific to one application?',
    options: opts4(
      'seccompProfile.type: Localhost with localhostProfile pointing to a profile under the kubelet seccomp dir',
      'seccompProfile.type: Unconfined',
      'No seccompProfile (cluster has none by default)',
      'capabilities.add: ALL'
    ),
    correct: ['a'],
    explanation: 'A `Localhost` seccomp profile references a custom JSON filter stored on the node, allowing a least-privilege, app-specific syscall allow-list. `Unconfined`/no profile disable filtering.',
    references: [REF_SECCOMP, REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 2, type: QType.SINGLE,
    stem: 'To minimize a node\'s kernel attack surface, you should:',
    options: opts4(
      'Disable/blacklist unused kernel modules and remove unneeded packages',
      'Load every available kernel module preemptively',
      'Run all containers privileged',
      'Disable the firewall'
    ),
    correct: ['a'],
    explanation: 'Reducing loaded kernel modules and installed packages shrinks the exploitable surface. Loading all modules, privileged containers, or disabling the firewall expands risk.',
    references: [REF_HARDEN]
  },
  {
    domain: SHARD, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL securityContext settings that harden a container at the OS/kernel level.',
    options: opts4(
      'capabilities.drop: ["ALL"]',
      'seccompProfile.type: RuntimeDefault',
      'readOnlyRootFilesystem: true',
      'privileged: true'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dropping capabilities, applying a seccomp profile, and a read-only root FS all constrain kernel/OS access. `privileged: true` removes nearly all isolation and is the opposite of hardening.',
    references: [REF_SCTX, REF_SECCOMP]
  },
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which capability should typically be dropped because it allows broad kernel-level operations and is rarely needed?',
    options: opts4(
      'CAP_SYS_ADMIN',
      'CAP_NET_BIND_SERVICE for a web server on :80',
      'CAP_CHOWN for an init that fixes file ownership (when justified)',
      'No capabilities should ever be dropped'
    ),
    correct: ['a'],
    explanation: '`CAP_SYS_ADMIN` is extremely powerful (often called "the new root") and should be dropped unless absolutely required. Narrow caps like NET_BIND_SERVICE may be justified case by case.',
    references: [REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A minimal/hardened host OS with only the packages required to run the kubelet and container runtime reduces the node attack surface.',
    options: TF,
    correct: ['true'],
    explanation: 'Fewer installed packages and services mean fewer vulnerabilities and exploitation tools on the node — a core system-hardening principle.',
    references: [REF_HARDEN]
  },

  // ── Minimize Microservice Vulnerabilities (13) ──
  {
    domain: MICRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Pod Security Admission mode rejects non-conforming Pods at creation time (rather than only warning)?',
    options: opts4(
      'enforce',
      'warn',
      'audit',
      'dry-run'
    ),
    correct: ['a'],
    explanation: 'PSA supports `enforce` (reject), `warn` (user-facing warning), and `audit` (audit annotation). Only `enforce` blocks creation of non-conforming Pods.',
    references: [REF_PSA, REF_PSS]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A workload is multi-tenant and runs untrusted code. Which is the strongest isolation choice available via Kubernetes RuntimeClass?',
    options: opts4(
      'A sandboxed runtime such as Kata Containers (microVM) or gVisor',
      'Increasing the Pod\'s CPU limit',
      'Adding more replicas',
      'Setting terminationGracePeriodSeconds: 0'
    ),
    correct: ['a'],
    explanation: 'Kata (lightweight VM per Pod) or gVisor (user-space kernel) provide stronger isolation boundaries than shared-kernel containers, selected via `runtimeClassName`. Resource tuning does not isolate.',
    references: [REF_RUNTIME, REF_SANDBOX]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that help minimize microservice vulnerabilities.',
    options: opts4(
      'mTLS between services for authn + encryption',
      'Pod Security Admission `restricted`',
      'Secrets via Secret objects (not images/ConfigMaps)',
      'Granting every SA cluster-admin to avoid RBAC errors'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'mTLS, PSA restricted, and proper Secret handling all reduce microservice risk. Broad cluster-admin grants are a severe least-privilege violation.',
    references: [REF_PSA, REF_SECRET, REF_SECURITY]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which configuration prevents a container process from acquiring new privileges via setuid binaries?',
    options: opts4(
      'allowPrivilegeEscalation: false',
      'privileged: true',
      'hostIPC: true',
      'shareProcessNamespace: true'
    ),
    correct: ['a'],
    explanation: '`allowPrivilegeEscalation: false` applies `no_new_privs`, blocking setuid-based escalation. The other settings broaden access or share namespaces, increasing risk.',
    references: [REF_SCTX, REF_PSS]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.SINGLE,
    stem: 'You must guarantee no Pod in `prod` runs as root. Besides PSA `restricted`, which extra control gives defense in depth?',
    options: opts4(
      'A Kyverno/Gatekeeper policy that rejects Pods without runAsNonRoot: true',
      'A larger node pool',
      'A higher Pod priority class',
      'Disabling the scheduler'
    ),
    correct: ['a'],
    explanation: 'A dedicated policy-engine rule enforcing `runAsNonRoot: true` adds a second, explicit gate alongside PSA — useful for custom requirements PSA does not express granularly.',
    references: [REF_OPA, REF_PSA]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Secret should only be readable by one Deployment\'s ServiceAccount. The correct mechanism is:',
    options: opts4(
      'An RBAC Role granting `get` on that specific Secret, bound to that SA only',
      'Marking the Secret `public: true`',
      'Putting the Secret in a ConfigMap',
      'Disabling RBAC'
    ),
    correct: ['a'],
    explanation: 'Restricting Secret access is an RBAC concern: grant `get` on the named Secret to only the intended SA via a namespaced Role/RoleBinding. ConfigMaps and disabling RBAC are insecure.',
    references: [REF_RBAC, REF_SECRET]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.SINGLE,
    stem: 'Encryption at rest for Secrets is configured via:',
    options: opts4(
      'An EncryptionConfiguration referenced by `--encryption-provider-config` on the kube-apiserver',
      'A NetworkPolicy',
      'A Pod annotation',
      'kubelet --read-only-port=0'
    ),
    correct: ['a'],
    explanation: 'The API server applies `--encryption-provider-config` pointing to an `EncryptionConfiguration` (e.g. aescbc, secretbox, or KMS) so Secrets are encrypted before being written to etcd.',
    references: [REF_ENCRYPT, REF_SECRET]
  },
  {
    domain: MICRO, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The `baseline` Pod Security Standard is as strict as `restricted` and also requires runAsNonRoot.',
    options: TF,
    correct: ['false'],
    explanation: '`baseline` only blocks known dangerous settings (e.g. privileged, hostNetwork). `restricted` adds runAsNonRoot, drop-ALL caps, seccomp, and no privilege escalation.',
    references: [REF_PSS, REF_PSA]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which RuntimeClass-backed isolation runs each Pod in a lightweight virtual machine?',
    options: opts4(
      'Kata Containers',
      'runc',
      'gVisor in passthrough mode',
      'containerd without a handler'
    ),
    correct: ['a'],
    explanation: 'Kata Containers wraps Pods in lightweight VMs for hardware-assisted isolation. gVisor instead uses a user-space kernel; runc is the default shared-kernel runtime.',
    references: [REF_RUNTIME, REF_SANDBOX]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'To stop a compromised container from reading other Secrets via the API, you should:',
    options: opts4(
      'Scope the SA\'s RBAC to only the Secrets it needs and disable token automount if unused',
      'Mount all Secrets into every Pod for convenience',
      'Grant list on all secrets cluster-wide',
      'Use hostPath for Secrets'
    ),
    correct: ['a'],
    explanation: 'Minimizing the SA\'s Secret RBAC (and not mounting an API token when unneeded) limits what a compromised container can exfiltrate. The other options widen exposure.',
    references: [REF_RBAC, REF_SA]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about OPA Gatekeeper / Kyverno.',
    options: opts4(
      'They run as validating (and optionally mutating) admission webhooks',
      'They can reject Pods that violate security policy (e.g. privileged, hostPath)',
      'Kyverno can also mutate resources to add secure defaults',
      'They scan running container images for CVEs'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Gatekeeper/Kyverno are admission controllers that validate (and Kyverno can mutate) resources against policy. Image CVE scanning is a separate concern handled by tools like Trivy.',
    references: [REF_OPA, REF_ADMISSION]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which securityContext combination best matches the `restricted` Pod Security Standard?',
    options: opts4(
      'runAsNonRoot: true, allowPrivilegeEscalation: false, capabilities.drop ALL, seccompProfile RuntimeDefault',
      'privileged: true, hostPID: true',
      'runAsUser: 0, capabilities.add: SYS_ADMIN',
      'allowPrivilegeEscalation: true, readOnlyRootFilesystem: false'
    ),
    correct: ['a'],
    explanation: 'Restricted requires non-root, no privilege escalation, dropping all capabilities, and a RuntimeDefault/Localhost seccomp profile — exactly the first option.',
    references: [REF_PSS, REF_SCTX]
  },
  {
    domain: MICRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Why prefer a Secret over baking credentials into a container image?',
    options: opts4(
      'Image layers are widely distributed/cached and credentials in them are hard to rotate or revoke',
      'Secrets are slower so attackers give up',
      'Images cannot store text',
      'Secrets disable RBAC'
    ),
    correct: ['a'],
    explanation: 'Credentials embedded in image layers spread to every registry/cache, are difficult to rotate, and may leak via image inspection. Secrets keep them out of the artifact and RBAC-controlled.',
    references: [REF_SECRET]
  },

  // ── Supply Chain Security (13) ──
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You add `trivy image --severity HIGH,CRITICAL --exit-code 1 myapp:1.2` to CI. What is the effect?',
    options: opts4(
      'The pipeline fails if any HIGH or CRITICAL vulnerability is found in the image',
      'It signs the image',
      'It deploys the image to the cluster',
      'It generates RBAC roles'
    ),
    correct: ['a'],
    explanation: 'Trivy exits non-zero (1) when vulnerabilities of the listed severities are present, failing the CI job and preventing a vulnerable image from progressing.',
    references: [REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which reference form gives the strongest guarantee that the deployed image content has not changed?',
    options: opts4(
      'myrepo/app@sha256:<digest>',
      'myrepo/app:latest',
      'myrepo/app:1',
      'myrepo/app:stable'
    ),
    correct: ['a'],
    explanation: 'Pinning by `@sha256:` digest is immutable — the content cannot change under you. All tag forms are mutable and can be repointed to different (possibly malicious) content.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL ways to enforce that only approved images run in the cluster.',
    options: opts4(
      'ImagePolicyWebhook admission controller calling an external decision service',
      'Kyverno/Gatekeeper policies validating registry/digest/signature',
      'Restrict nodes to pull only from an internal registry mirror',
      'Allow `latest` from any public registry'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'ImagePolicyWebhook, policy engines, and registry restriction all constrain which images can run. Allowing `latest` from anywhere is the opposite of supply chain control.',
    references: [REF_IMGPOLICY, REF_OPA]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-stage build produces a final image FROM `scratch` with just a static binary. The main supply chain advantage is:',
    options: opts4(
      'Essentially zero OS packages, so almost no OS CVEs and no shell/tools for attackers',
      'It automatically enables PSA restricted',
      'It encrypts etcd',
      'It signs itself'
    ),
    correct: ['a'],
    explanation: 'A `scratch`-based static binary image has no OS layer, so OS-level CVEs and post-exploitation tooling are absent. Signing/PSA/encryption are independent controls.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which best describes the role of image signing and signature verification?',
    options: opts4(
      'It proves an image came from a trusted publisher and was not tampered with, and admission can require it',
      'It compresses image layers',
      'It scans for CVEs',
      'It rotates ServiceAccount tokens'
    ),
    correct: ['a'],
    explanation: 'Signing establishes provenance and integrity; verifying signatures at admission (e.g. via a policy/webhook) ensures only trusted images run. It is distinct from CVE scanning.',
    references: [REF_IMGPOLICY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 4, type: QType.SINGLE,
    stem: 'A newly disclosed CVE affects `libxyz`. You need to know which running images include it quickly. The artifact that makes this fast is:',
    options: opts4(
      'The SBOM generated for each image',
      'The NetworkPolicy list',
      'The audit log policy',
      'The kubelet config'
    ),
    correct: ['a'],
    explanation: 'An SBOM enumerates each image\'s components/versions, so you can immediately query which images contain the affected `libxyz` version and prioritize patching.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which tool is best suited to statically analyze a Pod manifest and flag `privileged: true` before it is applied?',
    options: opts4(
      'kubesec (or Trivy config/misconfig scanning)',
      'etcdctl',
      'kube-proxy',
      'coredns'
    ),
    correct: ['a'],
    explanation: 'kubesec scores manifests for risky settings; Trivy can also scan config/IaC for misconfigurations. Both catch `privileged: true` pre-deploy as part of shift-left.',
    references: [REF_KUBEBENCH, REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Scanning images only once at build time is sufficient because vulnerabilities never appear in already-built images.',
    options: TF,
    correct: ['false'],
    explanation: 'New CVEs are disclosed continuously against existing packages, so already-built/published images can become vulnerable. Periodic registry rescans are required.',
    references: [REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'To reduce supply chain risk from third-party base images, a strong practice is to:',
    options: opts4(
      'Maintain a curated set of approved, scanned, minimal base images and pull only from an internal mirror',
      'Always use the largest base image available',
      'Pull base images directly from random forks',
      'Disable image scanning to speed builds'
    ),
    correct: ['a'],
    explanation: 'Curated, scanned, minimal base images served from a controlled internal registry limit untrusted code and provenance risk. The other options increase exposure.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 4, type: QType.SINGLE,
    stem: 'ImagePolicyWebhook returns a deny for an unsigned image. What does the API server do?',
    options: opts4(
      'Rejects the Pod creation request at admission',
      'Creates the Pod but marks it Failed later',
      'Ignores the webhook',
      'Schedules the Pod with a warning only'
    ),
    correct: ['a'],
    explanation: 'A validating admission webhook denial (ImagePolicyWebhook) causes the API server to reject the create/update request outright, so the non-compliant Pod is never admitted.',
    references: [REF_IMGPOLICY, REF_ADMISSION]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Trivy.',
    options: opts4(
      'It can scan container images for OS and language package CVEs',
      'It can scan IaC/Dockerfiles/Kubernetes manifests for misconfigurations',
      'It can generate an SBOM',
      'It enforces NetworkPolicies at runtime'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Trivy scans images, filesystems, IaC/config, and can output SBOMs. It is a scanner, not a network enforcement tool — NetworkPolicy enforcement is the CNI\'s job.',
    references: [REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'Why pin dependencies (and base images) to specific versions/digests in the build?',
    options: opts4(
      'Reproducible, auditable builds that resist dependency-substitution/typosquatting attacks',
      'It makes builds slower for security',
      'It disables RBAC',
      'It signs the cluster'
    ),
    correct: ['a'],
    explanation: 'Pinning exact versions/digests yields reproducible builds and prevents an attacker from silently substituting a malicious newer artifact (a key supply chain attack vector).',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE,
    stem: 'kube-bench and Trivy differ in that:',
    options: opts4(
      'kube-bench audits cluster config vs the CIS Benchmark; Trivy scans images/IaC for vulnerabilities/misconfigs',
      'Both only scan images',
      'Both are CNIs',
      'kube-bench signs images and Trivy enforces RBAC'
    ),
    correct: ['a'],
    explanation: 'kube-bench = CIS configuration audit of the cluster/nodes. Trivy = vulnerability and misconfiguration scanner for images, filesystems, and IaC. They cover different supply chain/hardening layers.',
    references: [REF_KUBEBENCH, REF_TRIVY]
  },

  // ── Monitoring, Logging and Runtime Security (13) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Falco detects "a shell was spawned in a container with an attached terminal". This is an example of:',
    options: opts4(
      'Runtime behavioral detection via syscall monitoring',
      'Image vulnerability scanning',
      'A CIS configuration audit',
      'An admission webhook decision'
    ),
    correct: ['a'],
    explanation: 'Falco evaluates syscall streams against rules at runtime; an interactive shell in a container is a classic behavioral indicator of compromise, not a static scan or admission check.',
    references: [REF_FALCO, REF_FALCO_RULES]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must record all `delete` operations on `secrets` cluster-wide for forensics without logging secret bodies. The audit policy rule should:',
    options: opts4(
      'Match the `secrets` resource and `delete` verb at level `Metadata`',
      'Match all resources at level `RequestResponse`',
      'Set level `None` for secrets',
      'Disable auditing'
    ),
    correct: ['a'],
    explanation: 'A rule scoped to `secrets`/`delete` at `Metadata` captures who/when/what without recording secret contents. `RequestResponse` would leak the body; `None`/disabled records nothing.',
    references: [REF_AUDIT, REF_SECRET]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL components of a typical Falco rule.',
    options: opts4(
      'condition (a boolean expression over event fields)',
      'output (the alert message/template)',
      'priority (severity)',
      'imagePullPolicy'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A Falco rule has `rule`, `desc`, `condition`, `output`, `priority`, and `tags`. `imagePullPolicy` is a Kubernetes Pod field, unrelated to Falco rules.',
    references: [REF_FALCO_RULES]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach enforces container immutability so Falco "write below binary dir" alerts become rare/true-positive?',
    options: opts4(
      'readOnlyRootFilesystem: true with required writable paths as explicit volumes',
      'privileged: true',
      'Mount the whole node filesystem',
      'allowPrivilegeEscalation: true'
    ),
    correct: ['a'],
    explanation: 'A read-only root filesystem (with narrow writable volumes) means legitimate apps do not write to binary dirs, so such Falco alerts strongly indicate real tampering attempts.',
    references: [REF_SCTX, REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'API server auditing is enabled but logs are only on the node\'s local disk. The main security gap is:',
    options: opts4(
      'An attacker with node access could tamper with or delete local audit logs; ship them off-node (webhook/SIEM)',
      'Audit logs cannot be written to disk',
      'Metadata level is invalid',
      'Auditing requires privileged Pods'
    ),
    correct: ['a'],
    explanation: 'Local-only audit logs can be altered or wiped by an attacker who compromises the node. Forwarding to a remote, append-only SIEM/webhook preserves forensic integrity.',
    references: [REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Defense in depth means combining which two complementary controls for runtime security?',
    options: opts4(
      'Admission-time policy (PSA/Kyverno) AND runtime detection (Falco) + audit logging',
      'Only RBAC',
      'Only image scanning',
      'Only NetworkPolicies'
    ),
    correct: ['a'],
    explanation: 'Admission policies prevent risky workloads; runtime detection and audit logs catch malicious behavior that slips past or emerges later. Together they form layered defense.',
    references: [REF_FALCO, REF_PSA, REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Falco can use either an eBPF probe or a kernel module to source syscall events.',
    options: TF,
    correct: ['true'],
    explanation: 'Falco supports a kernel module driver and a (modern) eBPF probe driver to capture syscalls; the eBPF probe is often preferred for portability and lower kernel risk.',
    references: [REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which audit policy level records the request body but NOT the response body?',
    options: opts4(
      'Request',
      'Metadata',
      'RequestResponse',
      'None'
    ),
    correct: ['a'],
    explanation: '`Request` logs metadata plus the request body; `RequestResponse` adds the response body; `Metadata` logs neither body; `None` logs nothing for matched events.',
    references: [REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A Falco alert indicates outbound traffic to a known-bad IP from a Pod that should have no egress. The best immediate, evidence-preserving action is:',
    options: opts4(
      'Apply a deny-egress NetworkPolicy / isolate the Pod and capture logs before remediation',
      'Delete the cluster',
      'Disable Falco to stop the alerts',
      'Give the Pod cluster-admin to investigate'
    ),
    correct: ['a'],
    explanation: 'Network-isolating the suspicious Pod contains exfiltration while preserving forensic data. Disabling detection or escalating privileges worsens the incident.',
    references: [REF_FALCO, REF_NP]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Kubernetes auditing.',
    options: opts4(
      'An audit policy maps requests to levels (None/Metadata/Request/RequestResponse)',
      'Backends include log file and webhook',
      'Secrets are best logged at Metadata to avoid leaking contents',
      'Auditing replaces the need for runtime detection like Falco'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Audit policies tier events by level; backends are log/webhook; sensitive resources should use Metadata. Auditing records API activity but does not observe in-container syscalls — Falco still adds value.',
    references: [REF_AUDIT, REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is a read-only root filesystem considered a runtime security measure (not just hardening)?',
    options: opts4(
      'It blocks malware/attacker persistence and tool installation while the container runs',
      'It speeds up image pulls',
      'It encrypts etcd',
      'It rotates tokens'
    ),
    correct: ['a'],
    explanation: 'A read-only root FS denies attackers the ability to drop binaries or modify the app at runtime, frustrating persistence and lateral tooling — a runtime defense complementing detection.',
    references: [REF_SCTX, REF_PSS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool would you use to continuously alert on a container reading `/etc/shadow`?',
    options: opts4(
      'Falco with a rule on sensitive file access',
      'kube-bench',
      'Trivy',
      'kubectl get events'
    ),
    correct: ['a'],
    explanation: 'Falco rules can match opens/reads of sensitive files like `/etc/shadow` at runtime. kube-bench/Trivy are static; `kubectl get events` does not see syscalls.',
    references: [REF_FALCO_RULES, REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'To keep audit log volume manageable while retaining forensic value, you should:',
    options: opts4(
      'Use a tiered audit policy: higher levels for sensitive/mutating verbs, lower for noisy read-only calls',
      'Log everything at RequestResponse',
      'Disable auditing on the busiest cluster',
      'Only audit GET requests'
    ),
    correct: ['a'],
    explanation: 'A tiered policy concentrates detail where it matters (mutations, sensitive resources, failures) and reduces verbosity for high-volume read traffic, balancing signal and storage.',
    references: [REF_AUDIT]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Cluster Setup (10) ──
  {
    domain: SETUP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A NetworkPolicy selecting all Pods in `ns1` lists `policyTypes: [Ingress, Egress]` with one ingress rule and no egress rules. Egress behavior is:',
    options: opts4(
      'All egress is denied for the selected Pods',
      'All egress is allowed',
      'Only DNS egress is allowed',
      'Egress is unaffected because Ingress is also listed'
    ),
    correct: ['a'],
    explanation: 'Once `Egress` is in `policyTypes`, having no egress rules means default-deny-egress for the selected Pods, independent of the ingress configuration.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a NetworkPolicy that allows ingress to `app=cache` only from Pods carrying label `tier=api` in any namespace labeled `env=prod`. The correct `from` element combines:',
    options: opts4(
      'namespaceSelector (env=prod) AND podSelector (tier=api) in the same `from` entry',
      'Two separate `from` entries (OR semantics)',
      'ipBlock 0.0.0.0/0',
      'An empty selector'
    ),
    correct: ['a'],
    explanation: 'Within one `from` element, a namespaceSelector AND a podSelector are ANDed (source must match both). Separate list entries would be ORed and broaden access.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE,
    stem: 'kube-bench flags that the scheduler\'s `--bind-address` is 0.0.0.0. The CIS-aligned remediation is:',
    options: opts4(
      'Bind the scheduler/controller-manager metrics to 127.0.0.1 so they are not exposed on all interfaces',
      'Expose it on a NodePort',
      'Set --bind-address to the public IP',
      'Disable RBAC'
    ),
    correct: ['a'],
    explanation: 'CIS recommends binding scheduler/controller-manager to localhost (127.0.0.1) to avoid exposing their endpoints on all network interfaces.',
    references: [REF_KUBEBENCH, REF_APISRV]
  },
  {
    domain: SETUP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which field in an Ingress object links it to the TLS Secret?',
    options: opts4(
      'spec.tls[].secretName',
      'spec.backend.secret',
      'metadata.annotations.tlsSecret',
      'spec.rules[].http.tls'
    ),
    correct: ['a'],
    explanation: 'Ingress TLS is configured under `spec.tls[]` with `hosts` and `secretName` pointing at a `kubernetes.io/tls` Secret. There is no `spec.backend.secret` for TLS.',
    references: [REF_TLS, REF_ING]
  },
  {
    domain: SETUP, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL accurate statements about default-deny NetworkPolicies.',
    options: opts4(
      'A policy with empty podSelector and policyTypes Ingress denies all ingress to the namespace\'s Pods',
      'You usually must add an explicit allow for DNS (port 53) when denying egress',
      'Default-deny policies require a policy-enforcing CNI to take effect',
      'Default-deny automatically encrypts traffic'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Empty-selector deny policies apply namespace-wide; egress deny breaks DNS unless port 53 is allowed; enforcement needs a capable CNI. NetworkPolicy never provides encryption.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which kube-apiserver flag enforces a minimum TLS version to disable legacy protocol versions?',
    options: opts4(
      '--tls-min-version (e.g. VersionTLS12)',
      '--anonymous-auth',
      '--allow-privileged',
      '--enable-swagger-ui'
    ),
    correct: ['a'],
    explanation: '`--tls-min-version=VersionTLS12` (or higher) blocks downgrade to weak TLS 1.0/1.1, complementing `--tls-cipher-suites` for transport hardening.',
    references: [REF_APISRV, REF_KUBEBENCH]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Two NetworkPolicies selecting the same Pod combine such that traffic allowed by EITHER policy is permitted (allow rules are unioned).',
    options: TF,
    correct: ['true'],
    explanation: 'NetworkPolicies are additive: if any policy selecting a Pod allows a connection, it is allowed. There are no deny rules, only the implicit deny when at least one policy selects the Pod for that direction.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 3, type: QType.SINGLE,
    stem: 'A CIS check fails on `--audit-log-maxage`/`--audit-log-maxbackup` not being set. Why does CIS care?',
    options: opts4(
      'Rotation/retention settings ensure audit logs are kept long enough for forensics without unbounded disk use',
      'They speed up the scheduler',
      'They disable anonymous auth',
      'They encrypt etcd'
    ),
    correct: ['a'],
    explanation: 'Audit log rotation/retention flags ensure sufficient forensic history is retained while preventing disk exhaustion — a CIS audit-logging hardening item.',
    references: [REF_KUBEBENCH, REF_AUDIT]
  },
  {
    domain: SETUP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The simplest least-privilege baseline for a new namespace\'s network posture is:',
    options: opts4(
      'Apply a default-deny ingress+egress policy, then add narrow allow rules (incl. DNS)',
      'Allow all traffic and audit later',
      'Use hostNetwork for all Pods',
      'Disable the CNI'
    ),
    correct: ['a'],
    explanation: 'Start from default-deny and explicitly allow only required flows (including DNS). Allow-all or hostNetwork removes the isolation NetworkPolicies provide.',
    references: [REF_NP]
  },
  {
    domain: SETUP, difficulty: 4, type: QType.SINGLE,
    stem: 'After enabling default-deny egress in `app`, a Pod cannot reach the Kubernetes API (in-cluster). The least-privilege fix is:',
    options: opts4(
      'Add an egress rule to the API server endpoint/CIDR (and DNS) only',
      'Allow egress to 0.0.0.0/0',
      'Run the Pod with hostNetwork: true',
      'Delete the policy'
    ),
    correct: ['a'],
    explanation: 'Only Pods that need the API should get a narrow egress rule to the apiserver service/endpoint IP plus DNS. Opening all egress or using hostNetwork defeats the policy.',
    references: [REF_NP]
  },

  // ── Cluster Hardening (10) ──
  {
    domain: CHARD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the recommended way to give a Pod a dedicated identity with no API permissions by default?',
    options: opts4(
      'Create a dedicated ServiceAccount and bind no roles to it (and disable token automount if unused)',
      'Reuse the namespace `default` SA which has admin',
      'Use the kube-system controller SA',
      'Bind it to view + edit + admin to be safe'
    ),
    correct: ['a'],
    explanation: 'A purpose-specific SA with no RoleBindings starts at zero permissions (deny-by-default RBAC); grants are then added explicitly and minimally. Reusing privileged SAs violates least privilege.',
    references: [REF_SA, REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A ClusterRole grants `get,list,watch` on `pods`. To let user `dev` use it ONLY in namespace `qa`, you create:',
    options: opts4(
      'A RoleBinding in `qa` referencing that ClusterRole and subject `dev`',
      'A ClusterRoleBinding referencing the ClusterRole',
      'A new ClusterRole copy',
      'A NetworkPolicy'
    ),
    correct: ['a'],
    explanation: 'A RoleBinding can reference a ClusterRole to apply its rules within a single namespace only — ideal for reusing common roles with namespace scoping.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL effective cluster-hardening measures.',
    options: opts4(
      'Use Node,RBAC authorization and keep NodeRestriction enabled',
      'Disable anonymous auth on apiserver and kubelet',
      'Use short-lived projected ServiceAccount tokens / disable unused automount',
      'Grant cluster-admin broadly to reduce ticket volume'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Node,RBAC + NodeRestriction, disabling anonymous auth, and minimizing token exposure all harden the cluster. Broad cluster-admin grants are a major least-privilege failure.',
    references: [REF_RBAC, REF_APISRV, REF_SATOKEN]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Why disable the kubelet read-only port (set to 0)?',
    options: opts4(
      'It exposes node/pod information without authentication or authorization',
      'It speeds up scheduling',
      'It is required for RBAC',
      'It encrypts kubelet traffic'
    ),
    correct: ['a'],
    explanation: 'The kubelet read-only port (10255) serves unauthenticated metadata about nodes/pods. CIS hardening sets it to 0 and uses the authenticated port instead.',
    references: [REF_KUBELET, REF_KUBEBENCH]
  },
  {
    domain: CHARD, difficulty: 4, type: QType.SINGLE,
    stem: 'You must ensure a compromised kubelet cannot read Secrets of Pods on other nodes. Which mechanism most directly limits this?',
    options: opts4(
      'The Node authorizer + NodeRestriction admission plugin',
      'A LimitRange',
      'A readiness probe',
      'imagePullPolicy: Always'
    ),
    correct: ['a'],
    explanation: 'The Node authorizer restricts each kubelet to objects related to Pods scheduled on its node, and NodeRestriction stops it editing other Nodes/Pods — containing a compromised kubelet.',
    references: [REF_APISRV, REF_ADMISSION]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which audit/verification command shows what a specific user can do, useful before granting/after hardening RBAC?',
    options: opts4(
      'kubectl auth can-i --list --as=jane -n prod',
      'kubectl cluster-info dump',
      'kubectl get nodes -o yaml',
      'kubectl proxy'
    ),
    correct: ['a'],
    explanation: '`kubectl auth can-i --list --as=<user> -n <ns>` enumerates the effective permissions of a subject — a quick RBAC least-privilege audit.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: RBAC has explicit deny rules you can use to subtract permissions from a broad ClusterRole.',
    options: TF,
    correct: ['false'],
    explanation: 'Kubernetes RBAC is purely additive with no deny rules. To reduce access you must grant narrower roles, not add denies.',
    references: [REF_RBAC]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Projected ServiceAccount tokens improve security mainly because they:',
    options: opts4(
      'Are time-limited and audience-bound, so a leaked token has a short, scoped validity',
      'Never expire, simplifying ops',
      'Are stored in ConfigMaps',
      'Grant cluster-admin automatically'
    ),
    correct: ['a'],
    explanation: 'Bound projected tokens expire quickly and are restricted to specific audiences, drastically reducing the value of a stolen token compared to legacy never-expiring Secret tokens.',
    references: [REF_SATOKEN, REF_SA]
  },
  {
    domain: CHARD, difficulty: 4, type: QType.SINGLE,
    stem: 'A namespace\'s `default` ServiceAccount has a RoleBinding to `edit`. Pods that do not set a serviceAccountName inherit this. The hardening fix is:',
    options: opts4(
      'Remove the binding from `default` and assign explicit minimal SAs per workload',
      'Add more permissions to make it consistent',
      'Bind `default` to cluster-admin',
      'Ignore it; default SA is safe'
    ),
    correct: ['a'],
    explanation: 'Pods without an explicit SA use `default`; binding it to `edit` silently over-privileges them. Remove that binding and give each workload a least-privilege SA.',
    references: [REF_RBAC, REF_SA]
  },
  {
    domain: CHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'During a kubeadm control-plane upgrade to fix a CVE, which command previews the upgrade plan?',
    options: opts4(
      'kubeadm upgrade plan',
      'kubeadm reset',
      'kubectl rollout status',
      'kubeadm init phase'
    ),
    correct: ['a'],
    explanation: '`kubeadm upgrade plan` shows available versions and component upgrade actions before you run `kubeadm upgrade apply <version>`.',
    references: [REF_UPGRADE]
  },

  // ── System Hardening (6) ──
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod references an AppArmor profile that is NOT loaded on the node it schedules to. What happens?',
    options: opts4(
      'The Pod fails to start (the kubelet rejects it because the profile is unavailable)',
      'It runs unconfined silently',
      'AppArmor is ignored cluster-wide',
      'The API server loads the profile automatically'
    ),
    correct: ['a'],
    explanation: 'AppArmor profiles must be pre-loaded on the node. If a referenced `Localhost` profile is missing, the Pod will not run on that node — Kubernetes does not distribute profiles.',
    references: [REF_APPARMOR, REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the most restrictive yet functional seccomp choice for a typical app needing only common syscalls?',
    options: opts4(
      'RuntimeDefault (or a tailored Localhost profile)',
      'Unconfined',
      'No seccomp at all',
      'A profile that allows ptrace and SYS_ADMIN'
    ),
    correct: ['a'],
    explanation: '`RuntimeDefault` blocks dangerous syscalls while keeping common ones working; a tailored `Localhost` profile is even tighter. `Unconfined`/none allow everything; allowing ptrace/SYS_ADMIN weakens it.',
    references: [REF_SECCOMP, REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Disabling unused services and removing build tools from worker nodes primarily:',
    options: opts4(
      'Reduces the node attack surface and removes attacker tooling',
      'Improves Pod scheduling latency',
      'Encrypts etcd',
      'Enables RBAC'
    ),
    correct: ['a'],
    explanation: 'Minimizing installed software on nodes lowers the number of exploitable components and deprives an attacker of post-exploitation tools — a core system-hardening goal.',
    references: [REF_HARDEN]
  },
  {
    domain: SHARD, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about AppArmor and seccomp in Kubernetes.',
    options: opts4(
      'AppArmor confines file/capability access via kernel-enforced profiles loaded on the node',
      'seccomp filters which syscalls a process may invoke',
      'Both are configured under the Pod/container securityContext in modern Kubernetes',
      'Both are enforced by the API server, not the node kernel'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'AppArmor (MAC over files/caps) and seccomp (syscall filter) are kernel-enforced on the node and configured via securityContext (`appArmorProfile`, `seccompProfile`). The API server does not enforce them.',
    references: [REF_APPARMOR, REF_SECCOMP, REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 3, type: QType.SINGLE,
    stem: 'A container needs to change file ownership at startup but nothing else privileged. Least-privilege approach:',
    options: opts4(
      'drop ALL capabilities, add only CAP_CHOWN, run as non-root where possible',
      'set privileged: true',
      'add SYS_ADMIN',
      'run as UID 0 with all caps'
    ),
    correct: ['a'],
    explanation: 'Granting just `CAP_CHOWN` after dropping ALL gives the minimal privilege for a chown operation. Privileged/SYS_ADMIN/all-caps vastly over-grant.',
    references: [REF_SCTX]
  },
  {
    domain: SHARD, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Running a container as a non-root user is a system-hardening best practice even when seccomp/AppArmor are also applied.',
    options: TF,
    correct: ['true'],
    explanation: 'Defense in depth: non-root execution limits damage from a container escape even when seccomp/AppArmor are present. Layered controls reinforce each other.',
    references: [REF_SCTX, REF_HARDEN]
  },

  // ── Minimize Microservice Vulnerabilities (13) ──
  {
    domain: MICRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which namespace label key configures Pod Security Admission enforcement?',
    options: opts4(
      'pod-security.kubernetes.io/enforce',
      'security.kubernetes.io/psp',
      'admission.kubernetes.io/level',
      'kubernetes.io/restricted'
    ),
    correct: ['a'],
    explanation: 'PSA reads `pod-security.kubernetes.io/enforce` (and `/warn`, `/audit`) labels with values `privileged|baseline|restricted` (optionally a version label).',
    references: [REF_PSA, REF_PSS]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'For an untrusted tenant workload that must not share the host kernel, the correct Pod field plus infra is:',
    options: opts4(
      'spec.runtimeClassName referencing a sandboxed handler (gVisor/Kata) installed on nodes',
      'spec.nodeName pinned to one node',
      'spec.priorityClassName: high',
      'spec.hostPID: true'
    ),
    correct: ['a'],
    explanation: 'Sandboxed isolation requires a RuntimeClass mapped to a gVisor/Kata handler on the nodes, selected via `runtimeClassName`. Node pinning/priority do not isolate; hostPID weakens isolation.',
    references: [REF_RUNTIME, REF_SANDBOX]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL fields the `restricted` PSS profile constrains.',
    options: opts4(
      'Privilege escalation (must be false)',
      'Running as non-root',
      'Capabilities (must drop ALL, may add NET_BIND_SERVICE)',
      'The Pod\'s CPU request value'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Restricted constrains privilege escalation, runAsNonRoot, capabilities, seccomp, volume types, etc. It does not dictate CPU requests (a scheduling/quota concern).',
    references: [REF_PSS, REF_SCTX]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'OPA Gatekeeper enforces policy in Kubernetes by:',
    options: opts4(
      'Acting as a validating admission webhook evaluating Rego ConstraintTemplates/Constraints',
      'Scanning images for CVEs at runtime',
      'Replacing the kube-scheduler',
      'Encrypting Secrets in etcd'
    ),
    correct: ['a'],
    explanation: 'Gatekeeper registers as a validating (and optional mutating) admission webhook and evaluates resources against Rego policies (ConstraintTemplates + Constraints), denying violations.',
    references: [REF_OPA, REF_ADMISSION]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.SINGLE,
    stem: 'A Secret holds a DB password used by one Deployment. To minimize exposure you should NOT:',
    options: opts4(
      'Grant `list secrets` cluster-wide to the workload\'s ServiceAccount',
      'Mount the Secret as a tmpfs volume',
      'Restrict the SA RBAC to `get` that one Secret',
      'Enable encryption at rest'
    ),
    correct: ['a'],
    explanation: 'Granting `list secrets` cluster-wide lets a compromised workload enumerate every Secret — the opposite of least privilege. The other measures all reduce exposure.',
    references: [REF_RBAC, REF_SECRET]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about Kyverno is correct?',
    options: opts4(
      'It is a Kubernetes-native policy engine that can validate, mutate, and generate resources via admission',
      'It is a CNI plugin',
      'It is an image registry',
      'It replaces the kubelet'
    ),
    correct: ['a'],
    explanation: 'Kyverno is a policy engine using Kubernetes-native YAML policies for validate/mutate/generate actions at admission — e.g. rejecting privileged Pods or injecting secure defaults.',
    references: [REF_OPA, REF_ADMISSION]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.SINGLE,
    stem: 'Encryption at rest with a KMS provider differs from the `aescbc` provider mainly because:',
    options: opts4(
      'The data-encryption key is wrapped by an external KMS, so the key is not stored in plaintext in the config on disk',
      'It does not actually encrypt anything',
      'It disables RBAC',
      'It is slower so attackers give up'
    ),
    correct: ['a'],
    explanation: 'With a KMS provider the key encryption key lives in an external KMS; `aescbc` keeps the key material in the EncryptionConfiguration on the control-plane disk, a weaker posture.',
    references: [REF_ENCRYPT, REF_SECRET]
  },
  {
    domain: MICRO, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Selecting a sandboxed RuntimeClass (gVisor/Kata) for every workload, including trusted system components, is always the best practice.',
    options: TF,
    correct: ['false'],
    explanation: 'Sandboxing adds overhead and some compatibility constraints; it is targeted at untrusted/multi-tenant workloads. Blanket use for all components is not recommended.',
    references: [REF_RUNTIME, REF_SANDBOX]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod must not mount the default API token because it never calls the API. Best practice:',
    options: opts4(
      'Set automountServiceAccountToken: false on the Pod (and use a dedicated SA)',
      'Delete the kube-system namespace',
      'Set privileged: true',
      'Use hostNetwork: true'
    ),
    correct: ['a'],
    explanation: 'Disabling token automounting removes an unnecessary, stealable credential from the Pod, reducing blast radius if the container is compromised.',
    references: [REF_SA, REF_SATOKEN]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'PSA `enforce=restricted` on a namespace rejects a Pod with `privileged: true`. Where is the error surfaced?',
    options: opts4(
      'At admission, as a rejection of the create/apply request',
      'In the Pod\'s liveness probe',
      'In the audit log only, Pod still runs',
      'In the CNI logs'
    ),
    correct: ['a'],
    explanation: 'PSA `enforce` mode rejects non-conforming Pods synchronously at admission, so `kubectl apply` returns an error and the Pod is never created.',
    references: [REF_PSA, REF_PSS]
  },
  {
    domain: MICRO, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid defense-in-depth controls for microservice security.',
    options: opts4(
      'PSA restricted + a Kyverno backup policy',
      'mTLS for service-to-service authn/encryption',
      'Per-workload least-privilege ServiceAccounts',
      'A single shared cluster-admin SA for all microservices'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Layering PSA + policy engine, mTLS, and minimal per-workload SAs builds defense in depth. A shared cluster-admin SA collapses all isolation and is a critical anti-pattern.',
    references: [REF_PSA, REF_RBAC, REF_SECURITY]
  },
  {
    domain: MICRO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which securityContext setting most directly mitigates exploitation of a setuid binary inside a container?',
    options: opts4(
      'allowPrivilegeEscalation: false',
      'terminationGracePeriodSeconds: 0',
      'dnsPolicy: None',
      'restartPolicy: Never'
    ),
    correct: ['a'],
    explanation: '`allowPrivilegeEscalation: false` (no_new_privs) prevents a setuid binary from raising the process\'s privileges, blocking a common in-container escalation path.',
    references: [REF_SCTX, REF_PSS]
  },
  {
    domain: MICRO, difficulty: 2, type: QType.SINGLE,
    stem: 'The primary purpose of a service mesh\'s mTLS for CKS is to:',
    options: opts4(
      'Authenticate and encrypt traffic between microservices using workload identities',
      'Scan images for CVEs',
      'Audit the API server',
      'Schedule Pods faster'
    ),
    correct: ['a'],
    explanation: 'mTLS provides mutual workload authentication and in-transit encryption between services, complementing NetworkPolicy (which only filters connectivity, not identity/encryption).',
    references: [REF_SECURITY, REF_NP]
  },

  // ── Supply Chain Security (13) ──
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Running `trivy fs --severity CRITICAL .` in a repo pipeline does what?',
    options: opts4(
      'Scans the project filesystem/dependencies for CRITICAL vulnerabilities',
      'Signs the repository',
      'Deploys to production',
      'Creates a NetworkPolicy'
    ),
    correct: ['a'],
    explanation: 'Trivy\'s `fs` mode scans a filesystem/project (including lock files) for vulnerabilities of the given severity — a shift-left dependency check.',
    references: [REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the single best image-reference practice for immutability and provenance combined with verification?',
    options: opts4(
      'Pin by digest AND verify a signature for that digest at admission',
      'Use the :latest tag and trust the registry',
      'Use a random tag per build but never verify',
      'Pull from any mirror without policy'
    ),
    correct: ['a'],
    explanation: 'Digest pinning guarantees content immutability; signature verification at admission proves provenance. Together they strongly defend the deploy step of the supply chain.',
    references: [REF_IMGPOLICY, REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL static analysis / scanning practices appropriate for CKS supply chain hardening.',
    options: opts4(
      'Scan images for CVEs in CI (e.g. Trivy) and fail on HIGH/CRITICAL',
      'Statically analyze manifests (kubesec / Trivy config) for insecure settings',
      'Audit the cluster with kube-bench against CIS',
      'Skip scanning to keep pipelines fast'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'CI image scanning, manifest static analysis, and CIS auditing are complementary supply chain/hardening checks. Skipping scanning removes a primary control.',
    references: [REF_TRIVY, REF_KUBEBENCH]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'A whitelist admission policy should ensure images come from `registry.corp/`. If an image is `docker.io/lib/app`, the policy must:',
    options: opts4(
      'Deny the Pod because the image does not match the approved registry prefix',
      'Allow it but log a warning',
      'Mutate it to add cluster-admin',
      'Schedule it on a tainted node'
    ),
    correct: ['a'],
    explanation: 'A registry-allowlist validating policy denies any Pod whose container image prefix is not in the approved set, preventing untrusted-registry images from running.',
    references: [REF_OPA, REF_IMGPOLICY]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why generate an SBOM during the build rather than after deployment?',
    options: opts4(
      'It captures the exact components shipped, enabling fast CVE impact analysis and provenance tracking',
      'It encrypts the image',
      'It enforces NetworkPolicy',
      'It rotates tokens'
    ),
    correct: ['a'],
    explanation: 'A build-time SBOM is an accurate, signed-able record of what the artifact contains, which makes later vulnerability triage and provenance auditing fast and reliable.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 4, type: QType.SINGLE,
    stem: 'Trivy reports a CRITICAL CVE in a transitive npm dependency. The most appropriate supply chain response is:',
    options: opts4(
      'Update/patch the dependency (or base) and rebuild, then rescan before promoting the image',
      'Suppress the finding and deploy',
      'Disable Trivy in CI',
      'Grant the Pod more capabilities'
    ),
    correct: ['a'],
    explanation: 'Remediate by upgrading the affected dependency (or base image), rebuild, and rescan to confirm before promotion. Suppressing/disabling scanning ships known-vulnerable code.',
    references: [REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which tool audits whether the API server, kubelet, and etcd configs follow CIS hardening — part of validating the platform supply chain?',
    options: opts4(
      'kube-bench',
      'Trivy image',
      'Falco',
      'kubectl top'
    ),
    correct: ['a'],
    explanation: 'kube-bench runs the CIS Kubernetes Benchmark checks against control-plane/node configs and reports remediation, validating the platform\'s hardened baseline.',
    references: [REF_KUBEBENCH]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Allowing Pods to pull images from any public registry is acceptable as long as the images are scanned once before first use.',
    options: TF,
    correct: ['false'],
    explanation: 'Unrestricted registries enable typosquatting and untrusted-publisher attacks, and a single early scan misses later-disclosed CVEs. Restrict registries and rescan periodically.',
    references: [REF_TRIVY, REF_IMGPOLICY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'A "shift-left" supply chain control is best described as:',
    options: opts4(
      'Catching vulnerabilities/misconfigurations early in build/CI rather than only in production',
      'Moving Pods to the left node',
      'Disabling admission control',
      'Granting broad RBAC to developers'
    ),
    correct: ['a'],
    explanation: 'Shift-left means integrating scanning/static analysis early (commit/build/CI) so issues are fixed before deployment, reducing cost and risk.',
    references: [REF_TRIVY]
  },
  {
    domain: SUPPLY, difficulty: 4, type: QType.SINGLE,
    stem: 'You must guarantee that only images built by your trusted pipeline run. The strongest combination is:',
    options: opts4(
      'Sign images in the pipeline and require signature verification + approved registry at admission',
      'Only set imagePullPolicy: Always',
      'Only run Trivy once a month',
      'Only rely on NetworkPolicy egress to the registry'
    ),
    correct: ['a'],
    explanation: 'Pipeline signing plus admission-time signature verification (and registry allowlisting) cryptographically ties running images to your trusted build process. Pull policy/NetworkPolicy alone do not prove provenance.',
    references: [REF_IMGPOLICY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which reduces the supply chain risk of a poisoned transitive dependency the most?',
    options: opts4(
      'Lockfiles + pinned versions/digests + dependency scanning in CI',
      'Always using `latest` of everything',
      'Disabling SBOM generation',
      'Allowing builds to fetch unpinned packages at runtime'
    ),
    correct: ['a'],
    explanation: 'Lockfiles and pinned versions/digests plus CI dependency scanning give reproducible, vetted builds, blocking silent substitution of a malicious transitive dependency.',
    references: [REF_TRIVY, REF_SECURITY]
  },
  {
    domain: SUPPLY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accurate statements about admission-based image controls.',
    options: opts4(
      'ImagePolicyWebhook delegates allow/deny to an external service',
      'Kyverno/Gatekeeper can require a digest and an approved registry',
      'A denied image request is rejected before the Pod is created',
      'Admission controls scan the running container\'s memory for malware'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Admission controls (ImagePolicyWebhook, Kyverno/Gatekeeper) gate image provenance/format and reject violations pre-creation. They do not perform live memory malware scanning (a runtime/EDR concern).',
    references: [REF_IMGPOLICY, REF_OPA]
  },
  {
    domain: SUPPLY, difficulty: 2, type: QType.SINGLE,
    stem: 'The benefit of a minimal base image to supply chain security is primarily:',
    options: opts4(
      'Fewer packages → fewer CVEs and less attacker tooling in the image',
      'Faster RBAC checks',
      'Automatic etcd encryption',
      'Built-in Falco rules'
    ),
    correct: ['a'],
    explanation: 'A minimal/distroless base reduces the package count (and thus CVE surface) and removes shells/tools an attacker could leverage post-compromise.',
    references: [REF_TRIVY, REF_SECURITY]
  },

  // ── Monitoring, Logging and Runtime Security (13) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which tool would alert in real time that a container unexpectedly executed `nc` (netcat) to an external host?',
    options: opts4(
      'Falco (syscall/behavioral rule)',
      'kube-bench',
      'Trivy image scan',
      'kubectl describe pod'
    ),
    correct: ['a'],
    explanation: 'Falco watches syscalls at runtime and can alert on unexpected process execution / outbound connections (e.g. netcat to an external host) — a behavioral detection, not a static scan.',
    references: [REF_FALCO, REF_FALCO_RULES]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need an audit trail of every RBAC change (rolebindings) including the submitted object. The audit policy rule should use level:',
    options: opts4(
      'Request (or RequestResponse) for rolebindings create/update/delete',
      'None',
      'Metadata only (insufficient to see the object)',
      'Disable auditing for RBAC'
    ),
    correct: ['a'],
    explanation: 'To capture the changed RBAC object you need at least `Request` (request body) — `RequestResponse` also captures the stored result. `Metadata` would not show what changed.',
    references: [REF_AUDIT, REF_RBAC]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about runtime security monitoring.',
    options: opts4(
      'Falco can source events via eBPF or a kernel module',
      'API auditing records who did what on the API server',
      'A read-only root filesystem helps make tampering detectable/preventable',
      'Runtime monitoring makes admission control unnecessary'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Falco (eBPF/module), API auditing, and immutable filesystems all contribute to runtime security. They complement — not replace — admission controls (defense in depth).',
    references: [REF_FALCO, REF_AUDIT, REF_SCTX]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A Falco rule has priority WARNING and a condition matching `open` of `/etc/shadow` in a container. This is best categorized as:',
    options: opts4(
      'Behavioral detection of sensitive file access at runtime',
      'A CIS configuration audit finding',
      'An image vulnerability',
      'An admission denial'
    ),
    correct: ['a'],
    explanation: 'Matching a syscall (open of a sensitive file) at runtime is behavioral detection. CIS audits/admission/image scanning operate at different layers.',
    references: [REF_FALCO_RULES, REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'For tamper-resistant forensics, Kubernetes audit logs should be:',
    options: opts4(
      'Forwarded via the webhook backend to an external append-only SIEM',
      'Kept only on the compromised node',
      'Stored in a writable ConfigMap',
      'Printed to Pod stdout only'
    ),
    correct: ['a'],
    explanation: 'Shipping audit events to an external, append-only SIEM (via the audit webhook) prevents an attacker who compromises a node from erasing the trail.',
    references: [REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Immutable containers aid runtime security because:',
    options: opts4(
      'Attackers cannot install tools or persist changes, and any write is a strong anomaly signal',
      'They start faster',
      'They disable the API server',
      'They sign images automatically'
    ),
    correct: ['a'],
    explanation: 'With a read-only filesystem and minimal image, legitimate apps do not modify the root FS, so attempted writes are both blocked and highly indicative of malicious activity.',
    references: [REF_SCTX, REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Logging Secret request/response bodies at RequestResponse level is recommended for stronger forensics.',
    options: TF,
    correct: ['false'],
    explanation: 'It would write secret material into audit logs. Best practice is `Metadata` level for Secrets/ConfigMaps to avoid leaking sensitive data into logs.',
    references: [REF_AUDIT, REF_SECRET]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which audit level logs ONLY the metadata of matched requests (user, verb, resource, timestamp) with no bodies?',
    options: opts4(
      'Metadata',
      'Request',
      'RequestResponse',
      'None'
    ),
    correct: ['a'],
    explanation: '`Metadata` records request metadata only — ideal for sensitive resources where bodies must not be logged. `Request`/`RequestResponse` include bodies; `None` logs nothing.',
    references: [REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A Falco alert shows a privileged container spawned a reverse shell. The first incident-response priority is:',
    options: opts4(
      'Contain (isolate/cordon, network-deny) while preserving logs/forensics, then eradicate',
      'Rebuild every node immediately, discarding evidence',
      'Disable Falco',
      'Promote the Pod to cluster-admin'
    ),
    correct: ['a'],
    explanation: 'IR best practice: contain the threat (isolate the Pod/node, cut network) while preserving forensic data, then eradicate and recover. Destroying evidence or escalating privilege is wrong.',
    references: [REF_FALCO, REF_SECURITY]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL practices that improve runtime detection fidelity.',
    options: opts4(
      'Run containers with read-only root FS so writes are clear anomalies',
      'Tune Falco rules to reduce false positives while keeping high-signal detections',
      'Forward audit + Falco events to a central SIEM for correlation',
      'Grant all workloads privileged to simplify monitoring'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Immutability, rule tuning, and central correlation sharpen detection. Running everything privileged destroys the security baseline and floods detection with ambiguous activity.',
    references: [REF_FALCO, REF_AUDIT, REF_SCTX]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Which combination provides both prevention and detection for a container that should never write to disk?',
    options: opts4(
      'readOnlyRootFilesystem: true (prevention) + a Falco rule alerting on write attempts (detection)',
      'Two liveness probes',
      'Higher CPU limits',
      'A second replica'
    ),
    correct: ['a'],
    explanation: 'The read-only root FS prevents writes; a Falco rule turns blocked/attempted writes into a detection signal — prevention plus detection, the essence of defense in depth.',
    references: [REF_SCTX, REF_FALCO]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'API server auditing primarily answers which question?',
    options: opts4(
      'Who performed which API action, when, and on what resource',
      'Which CVEs are in an image',
      'Which kernel modules are loaded',
      'Which Pods passed their probes'
    ),
    correct: ['a'],
    explanation: 'Auditing produces a chronological record of API requests (subject, verb, resource, outcome) for accountability and forensics — not image CVEs or kernel/probe state.',
    references: [REF_AUDIT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Behavioral detection differs from signature-based image scanning because it:',
    options: opts4(
      'Observes what a workload actually does at runtime, catching novel/zero-day misuse',
      'Only inspects static image layers',
      'Runs solely at admission time',
      'Requires no monitoring agent'
    ),
    correct: ['a'],
    explanation: 'Behavioral/runtime detection (Falco) watches actual execution and can flag anomalous activity even with no known signature, complementing static image scanning.',
    references: [REF_FALCO, REF_TRIVY]
  }
];

const CKS_DOMAINS = [
  { name: SETUP, weight: 15 },
  { name: CHARD, weight: 15 },
  { name: SHARD, weight: 10 },
  { name: MICRO, weight: 20 },
  { name: SUPPLY, weight: 20 },
  { name: MONITOR, weight: 20 }
];

const CKS_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'linuxfoundation-cks-p1',
    code: 'CKS-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering NetworkPolicies/CIS/Ingress TLS, RBAC & ServiceAccount token hygiene, kube-apiserver/kubelet hardening, AppArmor/seccomp/kernel hardening, securityContext/Pod Security Admission/OPA Gatekeeper/Kyverno, sandboxed runtimes (gVisor/Kata), image scanning/signing/SBOM/admission control, and Falco/audit logging/runtime detection.',
    questions: P1
  },
  {
    slug: 'linuxfoundation-cks-p2',
    code: 'CKS-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'linuxfoundation-cks-p3',
    code: 'CKS-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const CKS_BUNDLE = {
  slug: 'linuxfoundation-cks',
  title: 'Certified Kubernetes Security Specialist (CKS)',
  description: 'All 3 CKS practice exams in one bundle — cluster setup, cluster hardening, system hardening, minimizing microservice vulnerabilities, supply chain security, and monitoring/logging/runtime security. Aligned to CNCF CKS v1.32.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 44500 // USD 445 — VOUCHER tier (matches CKS real-exam fee)
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CKS bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:cks-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedCks(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'linuxfoundation' } });
  await db.vendor.upsert({
    where: { slug: 'linuxfoundation' },
    update: { name: 'Linux Foundation', description: 'CNCF / Linux Foundation certifications — CKAD, CKA, CKS, and other open-source ecosystem credentials.' },
    create: { slug: 'linuxfoundation', name: 'Linux Foundation', description: 'CNCF / Linux Foundation certifications — CKAD, CKA, CKS, and other open-source ecosystem credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'linuxfoundation' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of CKS_EXAMS) {
    const title = `Certified Kubernetes Security Specialist (CKS) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to CNCF CKS v1.32.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Specialty',
      durationMinutes: 120,
      passingScore: 67,
      questionCount: e.questions.length,
      domains: CKS_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:cks-seed' } });
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
          generatedBy: 'manual:cks-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: CKS_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CKS_BUNDLE.slug },
    update: {
      title: CKS_BUNDLE.title,
      description: CKS_BUNDLE.description,
      price: CKS_BUNDLE.price,
      priceVoucher: CKS_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: CKS_BUNDLE.slug,
      title: CKS_BUNDLE.title,
      description: CKS_BUNDLE.description,
      price: CKS_BUNDLE.price,
      priceVoucher: CKS_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'linuxfoundation-cks-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'linuxfoundation-cks-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'linuxfoundation-cks-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'linuxfoundation-cks-p1', tier: 'VOUCHER' as const, position: 4 }
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
