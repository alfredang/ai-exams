/**
 * CKAD bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:ckad-seed'` and upserts catalog rows.
 *
 * Exported as `seedCkad(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/ckad.ts`) and the protected
 * admin API (`/api/admin/seed-ckad`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public ckad-prep-master
 * labs and the CNCF CKAD v1.35 blueprint:
 *   - Application Design and Build                       — 20% (4)
 *   - Application Deployment                             — 20% (4)
 *   - Application Observability and Maintenance          — 15% (3)
 *   - Application Environment, Configuration and Security— 25% (5)
 *   - Services and Networking                            — 20% (4)
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

const DESIGN = 'Application Design and Build';
const DEPLOY = 'Application Deployment';
const OBSERV = 'Application Observability and Maintenance';
const CONFIG = 'Application Environment, Configuration and Security';
const NET = 'Services and Networking';

const REF_PODS = { label: 'Kubernetes Docs — Pods', url: 'https://kubernetes.io/docs/concepts/workloads/pods/' };
const REF_DEPLOY = { label: 'Kubernetes Docs — Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' };
const REF_JOBS = { label: 'Kubernetes Docs — Jobs', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/' };
const REF_CRON = { label: 'Kubernetes Docs — CronJobs', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/' };
const REF_INIT = { label: 'Kubernetes Docs — Init Containers', url: 'https://kubernetes.io/docs/concepts/workloads/pods/init-containers/' };
const REF_MULTI = { label: 'Kubernetes Docs — Pod Design Patterns', url: 'https://kubernetes.io/docs/concepts/workloads/pods/#workload-resources-for-managing-pods' };
const REF_PROBES = { label: 'Kubernetes Docs — Liveness/Readiness/Startup Probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/' };
const REF_LOGS = { label: 'Kubernetes Docs — Logging Architecture', url: 'https://kubernetes.io/docs/concepts/cluster-administration/logging/' };
const REF_CM = { label: 'Kubernetes Docs — ConfigMaps', url: 'https://kubernetes.io/docs/concepts/configuration/configmap/' };
const REF_SEC = { label: 'Kubernetes Docs — Secrets', url: 'https://kubernetes.io/docs/concepts/configuration/secret/' };
const REF_SCTX = { label: 'Kubernetes Docs — SecurityContext', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/' };
const REF_SA = { label: 'Kubernetes Docs — ServiceAccounts', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/' };
const REF_RES = { label: 'Kubernetes Docs — Resource Management', url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/' };
const REF_PV = { label: 'Kubernetes Docs — Persistent Volumes', url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/' };
const REF_SVC = { label: 'Kubernetes Docs — Services', url: 'https://kubernetes.io/docs/concepts/services-networking/service/' };
const REF_ING = { label: 'Kubernetes Docs — Ingress', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/' };
const REF_NP = { label: 'Kubernetes Docs — Network Policies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/' };
const REF_HELM = { label: 'Helm Docs — Charts', url: 'https://helm.sh/docs/topics/charts/' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Design and Build (4) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `kubectl` command imperatively creates a Pod named `mypod` running the `nginx:1.25` image and exposes container port 80, without creating a Deployment?',
    options: opts4(
      'kubectl create pod mypod --image=nginx:1.25 --port=80',
      'kubectl run mypod --image=nginx:1.25 --restart=Never --port=80',
      'kubectl apply pod mypod --image=nginx:1.25 --port=80',
      'kubectl deploy mypod --image=nginx:1.25 --port=80'
    ),
    correct: ['b'],
    explanation: '`kubectl run` with `--restart=Never` creates a bare Pod (not a Deployment or Job). `--port` records the containerPort. `kubectl create pod` is not a valid subcommand, and `kubectl apply` requires a manifest.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod must run a one-off database migration to completion before the main application container starts and serves traffic. Which Pod construct is the correct fit?',
    options: opts4(
      'A sidecar container in the same Pod',
      'An initContainer that runs the migration',
      'A separate Deployment running the migration script',
      'A liveness probe that triggers the migration'
    ),
    correct: ['b'],
    explanation: 'Init containers run to completion sequentially before any app containers start. Sidecars run alongside app containers (not before), and probes do not run workloads.',
    references: [REF_INIT]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'You need a workload that runs to completion on a schedule every night at 02:00. Select ALL true statements about Kubernetes CronJobs.',
    options: opts4(
      'CronJob.spec.schedule uses standard cron syntax (e.g. "0 2 * * *").',
      'A CronJob creates a Job object for each scheduled run.',
      'CronJobs run forever; like Deployments they restart Pods on completion.',
      'spec.concurrencyPolicy can be Allow, Forbid, or Replace.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'CronJobs spawn a Job per schedule fire. Jobs run to completion — CronJobs do NOT restart finished Pods like Deployments. `concurrencyPolicy` controls overlapping runs.',
    references: [REF_CRON, REF_JOBS]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'You build a container image and the running container exits immediately. The Dockerfile ends with `CMD ["./app"]` but a `kubectl logs` shows "exec: ./app: not found". The most likely cause is:',
    options: opts4(
      'The image uses a scratch base and the binary is dynamically linked against glibc that is not present.',
      'The Pod has no readiness probe configured.',
      'The Service selector does not match the Pod labels.',
      'A NetworkPolicy is blocking the container from starting.'
    ),
    correct: ['a'],
    explanation: 'A dynamically linked binary placed in a scratch image fails to exec because the dynamic loader/glibc is absent. Probes, Services, and NetworkPolicies are unrelated to container startup exec failures.',
    references: [REF_PODS]
  },

  // ── Deployment (4) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to update the image of Deployment `web` to `nginx:1.27` while preserving rollout history. Which command does this idiomatically?',
    options: opts4(
      'kubectl edit deployment web (and save the file)',
      'kubectl set image deployment/web nginx=nginx:1.27',
      'kubectl replace deployment/web --image=nginx:1.27',
      'kubectl patch pod web --image=nginx:1.27'
    ),
    correct: ['b'],
    explanation: '`kubectl set image` is the canonical, recorded way to update a container image on a Deployment and triggers a rolling update with a revision recorded in the rollout history.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A bad image was rolled out to Deployment `api`. Which command rolls back to the previous revision?',
    options: opts4(
      'kubectl undo deployment api',
      'kubectl rollout undo deployment/api',
      'kubectl rollback deployment api --to-revision=previous',
      'kubectl rollout revert deployment/api'
    ),
    correct: ['b'],
    explanation: '`kubectl rollout undo deployment/<name>` reverts to the prior revision. Use `--to-revision=N` to target a specific one.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Deployment\'s RollingUpdate strategy, `maxSurge: 25%` and `maxUnavailable: 0` for a 4-replica Deployment means:',
    options: opts4(
      'At most 1 extra Pod above 4 may exist during rollout; never fewer than 4 ready.',
      'Up to 25% of Pods may be unavailable at any time.',
      'Pods are upgraded one at a time, terminating the old first.',
      'The Deployment is paused until all Pods are ready.'
    ),
    correct: ['a'],
    explanation: '`maxSurge` is how many Pods above desired may be created during rollout. `maxUnavailable: 0` means the ready count never drops below desired — useful for zero-downtime updates.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which tool packages Kubernetes manifests as versioned, templatable units called "charts" with values overrides?',
    options: opts4(
      'Kustomize',
      'Helm',
      'Skaffold',
      'kubectl apply -k'
    ),
    correct: ['b'],
    explanation: 'Helm uses charts and a `values.yaml` template system. Kustomize composes overlays from base manifests without templating.',
    references: [REF_HELM]
  },

  // ── Observability and Maintenance (3) ──
  {
    domain: OBSERV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Your app boots in 45 seconds before its `/healthz` endpoint becomes responsive. The kubelet keeps killing the Pod with "Liveness probe failed". The MOST appropriate fix is:',
    options: opts4(
      'Remove the liveness probe entirely.',
      'Add a startupProbe so the liveness probe is suppressed until the container has finished starting.',
      'Replace the liveness probe with a readiness probe.',
      'Increase the Pod\'s memory limit.'
    ),
    correct: ['b'],
    explanation: 'startupProbe lets slow-starting containers boot without being killed by liveness. Replacing liveness with readiness leaves the Pod running but never marked ready, hurting traffic. Removing liveness entirely is not recommended for long-lived processes.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'Pod `web-7d8` is in a `CrashLoopBackOff`. Which sequence is the BEST first-step diagnosis?',
    options: opts4(
      'kubectl delete pod web-7d8 and let it be recreated.',
      'kubectl logs web-7d8 --previous; kubectl describe pod web-7d8',
      'kubectl exec -it web-7d8 -- /bin/sh',
      'kubectl scale deployment web --replicas=0 then back up.'
    ),
    correct: ['b'],
    explanation: '`logs --previous` shows stdout of the crashed container before restart; `describe` shows Events and exit codes. Exec only works on a running container.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about probes in Kubernetes.',
    options: opts4(
      'A failing readinessProbe removes the Pod\'s IP from Service endpoints but does NOT restart the container.',
      'A failing livenessProbe causes the kubelet to restart the container.',
      'A startupProbe runs continuously throughout the Pod\'s lifetime.',
      'Probes can be httpGet, exec, tcpSocket, or grpc actions.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'startupProbe runs ONLY during startup, then liveness/readiness take over. Readiness gates traffic without restart; liveness triggers restart. Probe actions are httpGet/exec/tcpSocket/grpc.',
    references: [REF_PROBES]
  },

  // ── Environment, Configuration and Security (5) ──
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a ConfigMap named `app-config` containing a single key `LOG_LEVEL=debug` imperatively?',
    options: opts4(
      'kubectl create configmap app-config --from-literal=LOG_LEVEL=debug',
      'kubectl set configmap app-config LOG_LEVEL=debug',
      'kubectl run configmap app-config --env=LOG_LEVEL=debug',
      'kubectl apply configmap app-config --data=LOG_LEVEL=debug'
    ),
    correct: ['a'],
    explanation: '`--from-literal=KEY=VALUE` is the standard way to inject literal key/value pairs into a ConfigMap. `--from-file=` loads file contents instead.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a Pod that runs as a NON-root user with UID 1000 and rejects privilege escalation. Which `securityContext` fragment achieves this?',
    options: opts4(
      'spec.securityContext: { runAsUser: 1000, allowPrivilegeEscalation: false }',
      'spec.securityContext: { runAsUser: 1000 } and spec.containers[].securityContext: { allowPrivilegeEscalation: false }',
      'spec.containers[].env: { USER: "1000", PRIV_ESCAL: "false" }',
      'spec.serviceAccountName: non-root'
    ),
    correct: ['b'],
    explanation: '`runAsUser` is valid at Pod or container level. `allowPrivilegeEscalation` is a CONTAINER-level field only and must be set in the container\'s securityContext.',
    references: [REF_SCTX]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'How are Secret values stored in etcd by default in a managed Kubernetes cluster with default settings?',
    options: opts4(
      'AES-256 encrypted at rest with a customer-managed key.',
      'Base64-encoded (NOT encrypted) unless an EncryptionConfiguration is configured.',
      'Hashed with bcrypt.',
      'Stored only on the kubelet node, never in etcd.'
    ),
    correct: ['b'],
    explanation: 'By default, Kubernetes Secrets are base64-encoded in etcd — encoding, NOT encryption. Encryption-at-rest requires `EncryptionConfiguration` on the API server.',
    references: [REF_SEC]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod needs to call the Kubernetes API to list Pods in its namespace. Which is the correct approach?',
    options: opts4(
      'Hard-code an admin kubeconfig as a Secret in the Pod.',
      'Create a ServiceAccount with a Role granting `get,list pods`, bind it via RoleBinding, and set `spec.serviceAccountName` on the Pod.',
      'Set `spec.privileged: true` on the container.',
      'Disable RBAC for the namespace.'
    ),
    correct: ['b'],
    explanation: 'The correct pattern is a dedicated ServiceAccount bound to a least-privilege Role via a RoleBinding. The Pod uses that SA via `spec.serviceAccountName`.',
    references: [REF_SA]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.SINGLE,
    stem: 'A container requests 100m CPU and limits 500m CPU. The node has free capacity. During traffic spikes the container is throttled at ~500m even though there is idle CPU. Why?',
    options: opts4(
      'The request, not the limit, caps usage.',
      'The CPU LIMIT enforces a hard cap via CFS quota — usage above 500m is throttled regardless of node capacity.',
      'The kubelet evicts the Pod above 500m CPU.',
      'Throttling occurs only when memory pressure exists.'
    ),
    correct: ['b'],
    explanation: 'CPU `limits` are enforced as hard CFS quotas — a container is throttled at the limit even when the node is idle. `requests` only affect scheduling.',
    references: [REF_RES]
  },

  // ── Services and Networking (4) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Service type exposes a Pod set on a stable cluster-internal IP only?',
    options: opts4(
      'NodePort',
      'LoadBalancer',
      'ClusterIP',
      'ExternalName'
    ),
    correct: ['c'],
    explanation: 'ClusterIP (the default) is internal-only. NodePort opens a port on every node; LoadBalancer provisions an external LB; ExternalName is a DNS alias.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A Service `db.production` is reached from a Pod in the `production` namespace via which fully qualified DNS name?',
    options: opts4(
      'db',
      'db.svc.production',
      'db.production.svc.cluster.local',
      'production.db.cluster.local'
    ),
    correct: ['c'],
    explanation: 'Service DNS is `<svc>.<ns>.svc.cluster.local`. Within the same namespace `db` alone resolves; the FQDN is `db.production.svc.cluster.local`.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'About Kubernetes NetworkPolicies, select ALL true statements.',
    options: opts4(
      'A NetworkPolicy needs a CNI plugin that implements policy enforcement (e.g. Calico, Cilium) to take effect.',
      'In a namespace with NO NetworkPolicy, all Pod-to-Pod traffic is allowed by default.',
      'A NetworkPolicy selecting Pods with no `ingress` rules denies ALL ingress to those Pods.',
      'NetworkPolicies can filter by destination port AND by source Pod labels.'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'All four are true. The default cluster posture is allow-all until a NetworkPolicy targets a Pod; once targeted, traffic must match an explicit allow rule.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to expose HTTP path `/api/*` of Service `api` and `/web/*` of Service `web` on the same external hostname. The correct resource is:',
    options: opts4(
      'Two LoadBalancer Services on the same external IP',
      'An Ingress with two path rules pointing to the two Services',
      'A NodePort Service with multiple ports',
      'A NetworkPolicy with two egress rules'
    ),
    correct: ['b'],
    explanation: 'Ingress provides HTTP host- and path-based routing to multiple backend Services through a single ingress controller.',
    references: [REF_ING]
  },

  // ── Design and Build (+9 → 13) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command generates a Pod manifest to stdout WITHOUT creating the Pod, useful for editing before applying?',
    options: opts4(
      'kubectl run nginx --image=nginx --dry-run=client -o yaml',
      'kubectl create pod nginx --image=nginx --no-apply',
      'kubectl generate pod nginx --image=nginx',
      'kubectl run nginx --image=nginx --export'
    ),
    correct: ['a'],
    explanation: '`--dry-run=client -o yaml` renders the manifest locally without contacting the server, the standard recipe for scaffolding a YAML to edit. `--export` was removed and `kubectl generate` does not exist.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod uses the ambassador pattern. What does the ambassador container do?',
    options: opts4(
      'Runs the migration before the app starts.',
      'Proxies outbound network connections (e.g. to a sharded database) so the main container talks only to localhost.',
      'Transforms the app\'s log format for an external monitoring system.',
      'Holds the Pod\'s shared volume open.'
    ),
    correct: ['b'],
    explanation: 'The ambassador pattern places a proxy sidecar that brokers connections to external services, letting the main container use a simple localhost endpoint while the ambassador handles discovery/sharding/TLS.',
    references: [REF_MULTI]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A Job with `restartPolicy: Always` is valid in its Pod template.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'Job Pod templates must use `restartPolicy: OnFailure` or `Never`. `Always` is rejected because a Job must be able to reach a terminal completed state.',
    references: [REF_JOBS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a Job whose Pods are cleaned up automatically 100 seconds after the Job finishes. Which field do you set?',
    options: opts4(
      'spec.ttlSecondsAfterFinished: 100',
      'spec.activeDeadlineSeconds: 100',
      'spec.backoffLimit: 100',
      'spec.completions: 100'
    ),
    correct: ['a'],
    explanation: '`ttlSecondsAfterFinished` lets the TTL controller delete a finished Job (and its Pods) after the given seconds. `activeDeadlineSeconds` caps runtime, not cleanup.',
    references: [REF_JOBS]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE, isTeaser: true,
    stem: 'A multi-stage Dockerfile copies a compiled binary from a `builder` stage into a minimal final image. The primary benefit is:',
    options: opts4(
      'Faster CPU at runtime.',
      'A smaller final image with no build toolchain, reducing attack surface and pull time.',
      'Automatic horizontal scaling.',
      'Built-in liveness probing.'
    ),
    correct: ['b'],
    explanation: 'Multi-stage builds discard compilers and intermediate artifacts, shipping only the runtime artifact. This shrinks the image and removes unneeded tools from the attack surface.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Pod field guarantees an init container completes before a sidecar (native sidecar) and the main app start?',
    options: opts4(
      'A regular initContainer entry (without restartPolicy) listed before the native sidecar.',
      'A container in spec.containers with a higher priority.',
      'spec.terminationGracePeriodSeconds.',
      'An emptyDir volume.'
    ),
    correct: ['a'],
    explanation: 'Ordinary init containers (no `restartPolicy: Always`) run to completion sequentially before any sidecar or app container starts. Native sidecars are init containers WITH `restartPolicy: Always` and stay running.',
    references: [REF_INIT]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to put two containers in the SAME Pod rather than two Pods.',
    options: opts4(
      'They must share the same network namespace (localhost) and lifecycle.',
      'They need to share an emptyDir volume tightly coupled to the app.',
      'They should scale independently of each other.',
      'One adapts/proxies for the other (sidecar/adapter/ambassador).'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Co-locating is right for tightly coupled helpers sharing network/volumes/lifecycle. If two components must scale independently, they belong in separate Pods/Deployments.',
    references: [REF_MULTI]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates a CronJob that runs `date` every 5 minutes using the busybox image?',
    options: opts4(
      'kubectl create cronjob now --image=busybox --schedule="*/5 * * * *" -- date',
      'kubectl run cronjob now --image=busybox --every=5m -- date',
      'kubectl create job now --cron="*/5 * * * *" --image=busybox -- date',
      'kubectl schedule cronjob now --image=busybox -- date'
    ),
    correct: ['a'],
    explanation: '`kubectl create cronjob <name> --image= --schedule="<cron>" -- <cmd>` is the imperative form. The command after `--` becomes the container args.',
    references: [REF_CRON]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A container should declare it listens on TCP 8080. Which Pod spec field documents this (and is used by some tooling/probes)?',
    options: opts4(
      'spec.containers[].ports: [{ containerPort: 8080 }]',
      'spec.ports: [{ port: 8080 }]',
      'spec.containers[].expose: 8080',
      'metadata.annotations.port: "8080"'
    ),
    correct: ['a'],
    explanation: '`containers[].ports[].containerPort` declares the port the container listens on. It is informational/used by tooling; it does not by itself publish the port externally.',
    references: [REF_PODS]
  },

  // ── Deployment (+9 → 13) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a Deployment named `web` with 3 replicas of `nginx` imperatively?',
    options: opts4(
      'kubectl create deployment web --image=nginx --replicas=3',
      'kubectl run web --image=nginx --replicas=3 --restart=Always',
      'kubectl deploy web --image=nginx --count=3',
      'kubectl create deploy web nginx 3'
    ),
    correct: ['a'],
    explanation: '`kubectl create deployment <name> --image= --replicas=` is the imperative form. `kubectl run` no longer creates Deployments.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows the status of an ongoing rollout and blocks until it completes or fails?',
    options: opts4(
      'kubectl rollout status deployment/web',
      'kubectl get rollout web --wait',
      'kubectl rollout watch deployment/web',
      'kubectl describe rollout web'
    ),
    correct: ['a'],
    explanation: '`kubectl rollout status deployment/<name>` watches the rollout and exits non-zero if it fails, making it useful in CI gates.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command displays the revision history of Deployment `web`?',
    options: opts4(
      'kubectl rollout history deployment/web',
      'kubectl get revisions deployment/web',
      'kubectl history deployment web',
      'kubectl describe deployment web --history'
    ),
    correct: ['a'],
    explanation: '`kubectl rollout history deployment/<name>` lists revisions; add `--revision=N` to see the template of a specific revision.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A Deployment with `progressDeadlineSeconds: 600` will report a `ProgressDeadlineExceeded` condition if the rollout makes no progress within 600 seconds.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: '`progressDeadlineSeconds` bounds how long a rollout may stall; exceeding it sets the Deployment\'s `Progressing` condition to `False` with reason `ProgressDeadlineExceeded`.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You change a Deployment\'s `spec.template` annotation only (no image change). What happens?',
    options: opts4(
      'Nothing — only image changes trigger rollouts.',
      'A new ReplicaSet is created and a rolling update occurs because the Pod template hash changed.',
      'The Deployment is rejected.',
      'Existing Pods are patched in place without restart.'
    ),
    correct: ['b'],
    explanation: 'Any change to `spec.template` (including labels/annotations on the Pod template) changes the template hash, creating a new ReplicaSet and triggering a rolling update.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command applies all YAML manifests in a directory recursively?',
    options: opts4(
      'kubectl apply -f ./manifests/ -R',
      'kubectl apply --dir ./manifests/',
      'kubectl create -r ./manifests/',
      'kubectl apply -f ./manifests/ --all'
    ),
    correct: ['a'],
    explanation: '`kubectl apply -f <dir> -R` (or `--recursive`) walks subdirectories applying every manifest found.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'A Deployment has `minReadySeconds: 20`. During a rolling update, a new Pod becomes Ready. When is it counted as available?',
    options: opts4(
      'Immediately when Ready.',
      'Only after it has been Ready for 20 continuous seconds.',
      'After 20 seconds regardless of Ready state.',
      'Never — minReadySeconds blocks the rollout.'
    ),
    correct: ['b'],
    explanation: '`minReadySeconds` requires a Pod to stay Ready for that duration before it is considered available, slowing rollouts so flapping Pods are not counted as healthy.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Helm: which command upgrades a release `myapp` with a new chart version and overridden value `replicaCount=4`?',
    options: opts4(
      'helm upgrade myapp ./chart --set replicaCount=4',
      'helm update myapp --replicas=4',
      'helm install myapp ./chart --upgrade --replicaCount 4',
      'helm patch myapp replicaCount=4'
    ),
    correct: ['a'],
    explanation: '`helm upgrade <release> <chart> --set key=value` upgrades an existing release with overrides. `--set` overrides values inline; `-f` supplies a values file.',
    references: [REF_HELM]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Kustomize: which kubectl command applies a kustomization in the current directory?',
    options: opts4(
      'kubectl apply -k .',
      'kubectl kustomize apply .',
      'kubectl apply --kustomize-build .',
      'kubectl apply -f kustomization.yaml'
    ),
    correct: ['a'],
    explanation: '`kubectl apply -k <dir>` builds the kustomization (base + overlays/patches) and applies the result. `kubectl kustomize <dir>` only renders to stdout.',
    references: [REF_DEPLOY]
  },

  // ── Observability and Maintenance (+7 → 10) ──
  {
    domain: OBSERV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which probe should you use to delay traffic to a Pod until it has loaded its cache, WITHOUT restarting the container if loading is slow?',
    options: opts4(
      'livenessProbe',
      'readinessProbe',
      'startupProbe',
      'A preStop hook'
    ),
    correct: ['b'],
    explanation: 'Readiness gates Service traffic without restarting the container. Liveness restarts on failure; startupProbe protects slow boots from liveness but does not itself gate Service endpoints the way readiness does.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'A probe has `initialDelaySeconds: 10`. What does this configure?',
    options: opts4(
      'How long the kubelet waits after container start before the FIRST probe.',
      'The interval between probes.',
      'How long to wait for a probe response before timing out.',
      'Number of failures before action.'
    ),
    correct: ['a'],
    explanation: '`initialDelaySeconds` delays the first probe after the container starts. `periodSeconds` is the interval, `timeoutSeconds` the per-probe timeout, `failureThreshold` the failure count.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A container is OOMKilled. Where is this most directly visible?',
    options: opts4(
      'kubectl describe pod — the last state shows Terminated with reason OOMKilled.',
      'kubectl get svc',
      'kubectl top nodes only',
      'It is never reported anywhere.'
    ),
    correct: ['a'],
    explanation: '`kubectl describe pod` shows the container\'s Last State as `Terminated` with reason `OOMKilled` and exit code 137 when the kernel OOM killer reaped it for exceeding its memory limit.',
    references: [REF_RES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command opens an interactive shell in a running Pod\'s `app` container?',
    options: opts4(
      'kubectl exec -it <pod> -c app -- /bin/sh',
      'kubectl shell <pod>/app',
      'kubectl run -it <pod> -c app -- sh',
      'kubectl attach <pod> -c app --tty'
    ),
    correct: ['a'],
    explanation: '`kubectl exec -it <pod> -c <container> -- <shell>` runs a command in an existing container. `kubectl attach` attaches to the main process\'s stdio, not a new shell.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 4, type: QType.SINGLE,
    stem: 'A distroless container has no shell, so `kubectl exec -- sh` fails. Which feature lets you attach a debugging container to the running Pod?',
    options: opts4(
      'kubectl debug <pod> --image=busybox --target=app (ephemeral container)',
      'kubectl exec --force <pod>',
      'kubectl cp a shell into the Pod',
      'kubectl logs --debug <pod>'
    ),
    correct: ['a'],
    explanation: '`kubectl debug` injects an ephemeral container sharing the target container\'s namespaces, letting you troubleshoot images that lack a shell or tools.',
    references: [REF_PODS]
  },
  {
    domain: OBSERV, difficulty: 2, type: QType.SINGLE,
    stem: '`kubectl logs --previous <pod>` retrieves logs from the previous terminated instance of a container that has restarted.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: '`--previous` (`-p`) returns the logs of the prior container instance, essential for diagnosing a container that crashed and was restarted.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows per-Pod CPU/memory for Pods in ALL namespaces (metrics-server installed)?',
    options: opts4(
      'kubectl top pods -A',
      'kubectl top pods --all',
      'kubectl get pods -o wide --metrics',
      'kubectl metrics pods --all-namespaces'
    ),
    correct: ['a'],
    explanation: '`kubectl top pods -A` (or `--all-namespaces`) lists resource usage across every namespace from the Metrics API.',
    references: [REF_LOGS]
  },

  // ── Environment, Configuration and Security (+11 → 16) ──
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to inject only the `DB_HOST` key of ConfigMap `db-cfg` as env var `DATABASE_HOST`. Which snippet is correct?',
    options: opts4(
      'env: [{ name: DATABASE_HOST, valueFrom: { configMapKeyRef: { name: db-cfg, key: DB_HOST } } }]',
      'envFrom: [{ configMapRef: { name: db-cfg, key: DB_HOST } }]',
      'env: [{ name: DATABASE_HOST, value: db-cfg/DB_HOST }]',
      'env: [{ configMap: { db-cfg: DB_HOST } }]'
    ),
    correct: ['a'],
    explanation: '`env[].valueFrom.configMapKeyRef` selects a single key and lets you rename it via the env var `name`. `envFrom` imports ALL keys and cannot select one key.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command creates a ConfigMap from an existing file `app.properties` keeping the filename as the key?',
    options: opts4(
      'kubectl create configmap app --from-file=app.properties',
      'kubectl create configmap app --from-literal=app.properties',
      'kubectl create configmap app --file app.properties',
      'kubectl set configmap app app.properties'
    ),
    correct: ['a'],
    explanation: '`--from-file=<file>` stores the file content under a key named after the file. `--from-file=key=path` lets you choose a different key name.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Secret should be mounted so each key becomes a file under `/etc/creds`. Which volume mount is correct?',
    options: opts4(
      'A volume of type `secret` referencing the Secret, mounted at /etc/creds.',
      'envFrom.secretRef pointed at /etc/creds.',
      'A configMap volume.',
      'hostPath: /etc/creds.'
    ),
    correct: ['a'],
    explanation: 'A `secret` volume projects each Secret key as a file under the mountPath. `envFrom`/`secretKeyRef` inject env vars, not files.',
    references: [REF_SEC]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.SINGLE,
    stem: 'A container sets `securityContext.readOnlyRootFilesystem: true` and the app needs to write temp files. The correct fix is:',
    options: opts4(
      'Set readOnlyRootFilesystem: false (defeats the hardening).',
      'Mount an emptyDir volume at the app\'s temp/writable path.',
      'Run the container as root.',
      'Add a livenessProbe.'
    ),
    correct: ['b'],
    explanation: 'Keep the root filesystem read-only for hardening and provide writable scratch space by mounting a writable volume (e.g. emptyDir) at the path the app writes to.',
    references: [REF_SCTX]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `securityContext` setting drops all Linux capabilities and adds back only `NET_BIND_SERVICE`?',
    options: opts4(
      'capabilities: { drop: ["ALL"], add: ["NET_BIND_SERVICE"] }',
      'privileged: false, netBind: true',
      'capabilities: { remove: "*", grant: "NET_BIND_SERVICE" }',
      'runAsUser: 0, capAdd: NET_BIND_SERVICE'
    ),
    correct: ['a'],
    explanation: 'Container `securityContext.capabilities` uses `drop` and `add` lists. Dropping `ALL` then adding only what is needed follows least-privilege.',
    references: [REF_SCTX]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Setting `automountServiceAccountToken: false` on a Pod or ServiceAccount prevents the API token from being mounted into the Pod.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Disabling automount stops the default ServiceAccount token projection, reducing the blast radius for Pods that never call the Kubernetes API.',
    references: [REF_SA]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A container needs the Pod\'s own name available as an env var. Which mechanism provides this?',
    options: opts4(
      'The Downward API via fieldRef: metadata.name',
      'A ConfigMap auto-created per Pod',
      'A Secret named after the Pod',
      'spec.hostname only'
    ),
    correct: ['a'],
    explanation: 'The Downward API exposes Pod metadata (name, namespace, labels, resource limits) to containers via `env[].valueFrom.fieldRef` or a downwardAPI volume.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a TLS Secret from cert and key files?',
    options: opts4(
      'kubectl create secret tls my-tls --cert=tls.crt --key=tls.key',
      'kubectl create secret generic my-tls --tls --cert tls.crt',
      'kubectl create tls my-tls tls.crt tls.key',
      'kubectl create secret my-tls --type=tls'
    ),
    correct: ['a'],
    explanation: '`kubectl create secret tls <name> --cert= --key=` produces a `kubernetes.io/tls` Secret containing `tls.crt` and `tls.key`, suitable for Ingress TLS.',
    references: [REF_SEC]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about resource requests and limits.',
    options: opts4(
      'Scheduling decisions are based on requests, not limits.',
      'A container exceeding its memory limit is OOMKilled.',
      'A container exceeding its CPU limit is OOMKilled.',
      'If requests == limits for all resources, the Pod gets the Guaranteed QoS class.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'CPU is compressible: exceeding the CPU limit causes throttling, NOT OOMKill. Memory is incompressible: exceeding the memory limit triggers OOMKill. Requests drive scheduling and QoS classification.',
    references: [REF_RES]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod needs an emptyDir that lives in RAM (tmpfs) for fast scratch I/O. Which spec achieves this?',
    options: opts4(
      'volumes: [{ name: cache, emptyDir: { medium: Memory } }]',
      'volumes: [{ name: cache, emptyDir: { type: tmpfs } }]',
      'volumes: [{ name: cache, ramDisk: {} }]',
      'volumes: [{ name: cache, hostPath: { path: /dev/shm } }]'
    ),
    correct: ['a'],
    explanation: '`emptyDir.medium: Memory` backs the volume with tmpfs (RAM). It counts against the container\'s memory limit and is cleared when the Pod is removed.',
    references: [REF_PV]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a PVC of 5Gi that is dynamically provisioned by the `fast-ssd` StorageClass. Which fields are required on the PVC?',
    options: opts4(
      'spec.storageClassName: fast-ssd, spec.accessModes, spec.resources.requests.storage: 5Gi',
      'spec.volumeName: fast-ssd only',
      'spec.capacity.storage: 5Gi only',
      'spec.provisioner: fast-ssd'
    ),
    correct: ['a'],
    explanation: 'A dynamically provisioned PVC needs a `storageClassName`, `accessModes`, and a storage request. `provisioner` is a StorageClass field, and `capacity` is a PV field.',
    references: [REF_PV]
  },

  // ── Services and Networking (+9 → 13) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command exposes Deployment `web` as a ClusterIP Service on port 80 targeting container port 8080?',
    options: opts4(
      'kubectl expose deployment web --port=80 --target-port=8080',
      'kubectl service create web --port=80 --container=8080',
      'kubectl expose deployment web --listen=80 --forward=8080',
      'kubectl create svc web 80:8080'
    ),
    correct: ['a'],
    explanation: '`kubectl expose deployment <name> --port= --target-port=` creates a Service (ClusterIP by default) whose `port` is the Service port and `targetPort` the container port.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A headless Service has `clusterIP: None`. What is its effect for a backing StatefulSet?',
    options: opts4(
      'It load-balances over a single virtual IP.',
      'DNS returns the individual Pod IPs (and per-Pod DNS names) instead of one virtual IP.',
      'It blocks all traffic.',
      'It exposes the Service on every node.'
    ),
    correct: ['b'],
    explanation: 'A headless Service (`clusterIP: None`) skips the virtual IP; DNS returns the Pod A records directly, enabling per-Pod addressing for StatefulSets.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A Service maps `port: 80` to `targetPort: http`. What must the Pod define for this to resolve?',
    options: opts4(
      'A named container port `http` in containers[].ports.',
      'An env var named http.',
      'A label http=true.',
      'An annotation port/http.'
    ),
    correct: ['a'],
    explanation: 'A string `targetPort` references a container port by its `name`. The Pod must declare `ports: [{ name: http, containerPort: <n> }]` so the Service can resolve it.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy that specifies an `egress` rule restricts only outbound traffic from the selected Pods and does not by itself affect inbound traffic.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Ingress and egress are independent in a NetworkPolicy. Declaring `policyTypes: [Egress]` with egress rules constrains outbound traffic only; ingress remains governed by other policies (or default-allow).',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'Two NetworkPolicies select the same Pod: one allows ingress from `app=a`, another from `app=b`. The effective ingress allow set is:',
    options: opts4(
      'Only app=a (first policy wins).',
      'The UNION — traffic from app=a OR app=b is allowed.',
      'The intersection — only Pods that are both app=a and app=b.',
      'Nothing — conflicting policies deny all.'
    ),
    correct: ['b'],
    explanation: 'NetworkPolicies are additive. When multiple policies select a Pod, the allowed traffic is the union of all their rules; there is no deny rule and no precedence.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress needs path `/v2` to route to `api-v2:80`. Which `pathType` matches `/v2` and `/v2/users` but NOT `/v20`?',
    options: opts4(
      'Exact',
      'Prefix',
      'ImplementationSpecific',
      'Regex'
    ),
    correct: ['b'],
    explanation: '`pathType: Prefix` matches by URL path SEGMENTS, so `/v2` matches `/v2` and `/v2/users` but not `/v20`. `Exact` matches only `/v2` literally.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A client Pod cannot resolve `web.default.svc.cluster.local`. Which component is responsible for in-cluster Service DNS?',
    options: opts4(
      'CoreDNS (the cluster DNS add-on)',
      'kube-proxy',
      'The Ingress controller',
      'etcd'
    ),
    correct: ['a'],
    explanation: 'CoreDNS serves cluster DNS, resolving Service and Pod names. kube-proxy programs the data path (iptables/IPVS) but does not answer DNS queries.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A Service of type LoadBalancer in a cloud cluster also implicitly allocates which other Service primitives?',
    options: opts4(
      'A ClusterIP and a NodePort, in addition to the external LB.',
      'Only an ExternalName.',
      'Nothing else; just the LB.',
      'An Ingress object.'
    ),
    correct: ['a'],
    explanation: 'A LoadBalancer Service is layered on top of NodePort and ClusterIP: it gets a ClusterIP, a NodePort on each node, and the cloud LB forwards to the NodePort.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Services and selectors.',
    options: opts4(
      'A Service with no selector will not auto-populate Endpoints; you can manage Endpoints/EndpointSlices manually.',
      'sessionAffinity: ClientIP pins a client to the same backend Pod.',
      'A Service selector must match the Deployment\'s name.',
      'Removing the only Ready Pod leaves the Service with zero endpoints, so connections fail.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Selectors match Pod LABELS, not Deployment names. Selector-less Services support manual Endpoints. `sessionAffinity: ClientIP` provides client stickiness. No Ready Pods means no endpoints and failed connections.',
    references: [REF_SVC]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Design and Build (4) ──
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod has one main container plus a small companion container that ships its stdout logs to an external aggregator. This is which multi-container pattern?',
    options: opts4(
      'Init container',
      'Sidecar',
      'Ambassador',
      'Adapter'
    ),
    correct: ['b'],
    explanation: 'A sidecar augments the main container (logging, metrics, sync) sharing the same Pod\'s lifecycle and volumes. Ambassador proxies network calls; adapter normalizes output for external consumption.',
    references: [REF_MULTI]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a Job that runs 5 Pods in parallel until 10 successful completions are reached. Which Job fields achieve this?',
    options: opts4(
      'completions: 10, parallelism: 5',
      'replicas: 10, parallelism: 5',
      'completions: 5, parallelism: 10',
      'backoffLimit: 10, parallelism: 5'
    ),
    correct: ['a'],
    explanation: '`completions` is total successes needed; `parallelism` caps concurrent Pods. `backoffLimit` only governs retry attempts on failure.',
    references: [REF_JOBS]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A CronJob has `concurrencyPolicy: Forbid` and `startingDeadlineSeconds: 30`. The previous run is still active when the next schedule fires 30s late. What happens to that fire?',
    options: opts4(
      'A second Job is started in parallel.',
      'The fire is skipped because the previous run is active AND the deadline has passed.',
      'The previous Job is killed and replaced.',
      'The CronJob is suspended automatically.'
    ),
    correct: ['b'],
    explanation: '`Forbid` prevents concurrency, and missing the startingDeadline marks the fire as missed/skipped (recorded in status).',
    references: [REF_CRON]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Dockerfile, which instruction sets the working directory for subsequent RUN/CMD/ENTRYPOINT and is preferred over `RUN cd /app`?',
    options: opts4(
      'CHDIR /app',
      'WORKDIR /app',
      'PWD /app',
      'CD /app'
    ),
    correct: ['b'],
    explanation: '`WORKDIR` is the only Dockerfile instruction that persists the working directory across layers. `RUN cd` only affects the single layer.',
    references: [REF_PODS]
  },

  // ── Deployment (4) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command scales Deployment `api` to 6 replicas?',
    options: opts4(
      'kubectl scale deployment/api --replicas=6',
      'kubectl resize deployment api 6',
      'kubectl set replicas deployment/api 6',
      'kubectl deploy api --scale=6'
    ),
    correct: ['a'],
    explanation: '`kubectl scale` is the canonical command for adjusting replicas on Deployments, ReplicaSets, ReplicationControllers, and StatefulSets.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You apply a Deployment with `strategy.type: Recreate`. What is the practical effect during an update?',
    options: opts4(
      'New Pods are gradually scaled up while old ones scale down.',
      'All old Pods are terminated FIRST; then new Pods are created — service downtime is expected.',
      'Only one Pod is updated at a time.',
      'The rollout is paused until manual approval.'
    ),
    correct: ['b'],
    explanation: 'Recreate fully drains the old Pods before launching the new ones. It is appropriate for workloads incompatible with running two versions simultaneously (e.g. some PVC-bound singletons).',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A canary release strategy on Kubernetes typically:',
    options: opts4(
      'Replaces all Pods with the new version at once.',
      'Routes a small share of traffic to a small subset of new-version Pods, expanding as confidence grows.',
      'Requires the kube-apiserver to be restarted.',
      'Is only possible with a service mesh.'
    ),
    correct: ['b'],
    explanation: 'Canary = gradual exposure of the new version to a subset of users. Achievable natively via two Deployments behind one Service or with finer-grained traffic split via Ingress/Service mesh.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Kustomize\'s primary value proposition relative to Helm is:',
    options: opts4(
      'Built-in template language with conditionals and loops.',
      'Pure-YAML overlays that patch a common "base" — no templating language needed.',
      'A chart registry for versioned releases.',
      'It replaces kubectl entirely.'
    ),
    correct: ['b'],
    explanation: 'Kustomize composes overlays over a base via strategic-merge or JSON patches — there is no template language. Helm offers templating + a chart registry; the two tools are complementary.',
    references: [REF_DEPLOY]
  },

  // ── Observability and Maintenance (3) ──
  {
    domain: OBSERV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command tails (streams) logs of all Pods of Deployment `web`?',
    options: opts4(
      'kubectl logs -f -l app=web',
      'kubectl tail deployment/web',
      'kubectl logs deployment/web --stream',
      'kubectl stream deployment web'
    ),
    correct: ['a'],
    explanation: '`-l` filters by label and `-f` follows logs. `kubectl logs deployment/web -f` works too but only streams from one Pod selected by the controller.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 4, type: QType.SINGLE,
    stem: 'An exec liveness probe `cat /tmp/healthy` runs every 10s with failureThreshold 3. The file disappears at t=0. Approximately when will the kubelet restart the container?',
    options: opts4(
      'Immediately at t=0',
      'Around t=10s (1 failure)',
      'Around t=30s (3 consecutive failures × 10s period)',
      'Never — exec probes do not trigger restarts'
    ),
    correct: ['c'],
    explanation: 'Liveness probes mark a container failed only after `failureThreshold` consecutive failures. With period 10s × 3 failures ≈ 30s before restart.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows recent cluster events, ordered by timestamp, namespace-scoped?',
    options: opts4(
      'kubectl get events --sort-by=.lastTimestamp',
      'kubectl describe events',
      'kubectl event log',
      'kubectl logs events'
    ),
    correct: ['a'],
    explanation: '`kubectl get events --sort-by=.lastTimestamp` is the standard debugging recipe. `describe pod` also surfaces the events for a specific Pod.',
    references: [REF_LOGS]
  },

  // ── Environment, Configuration and Security (5) ──
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'You mount a ConfigMap `app-cfg` as a volume at `/etc/app`. The ConfigMap is then updated with `kubectl apply`. What does the running Pod see?',
    options: opts4(
      'The file in /etc/app is updated automatically after the kubelet sync (eventually consistent; typically within ~1 minute).',
      'The Pod is restarted automatically on the next sync.',
      'Nothing changes until the Pod is manually deleted/recreated.',
      'The Pod immediately enters CrashLoopBackOff.'
    ),
    correct: ['a'],
    explanation: 'ConfigMaps and Secrets mounted as volumes propagate updates to the in-Pod filesystem on the next kubelet sync (period configurable, default ~60s). Env-var injections, by contrast, are baked in at Pod start.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'A Secret of type `kubernetes.io/dockerconfigjson` is referenced by a Pod via `spec.imagePullSecrets`. Its purpose is:',
    options: opts4(
      'Encrypting traffic between Pods.',
      'Providing credentials to pull images from a private registry.',
      'Encrypting volumes at rest.',
      'Authenticating the Pod to the API server.'
    ),
    correct: ['b'],
    explanation: '`dockerconfigjson` secrets carry registry credentials; referenced via `imagePullSecrets`, they let the kubelet pull from private registries.',
    references: [REF_SEC]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A namespace has a `ResourceQuota` of `requests.cpu: 1` and `limits.cpu: 2`. You apply a Pod requesting 600m CPU and limiting 1500m. The cluster has free capacity. What happens?',
    options: opts4(
      'The Pod is accepted because the cluster has free CPU.',
      'The Pod is REJECTED at admission because limits.cpu (1500m) added to existing usage may exceed 2 (depends on existing usage); but the request also pushes near the 1 CPU ceiling — admission rejects when the quota is exceeded.',
      'The Pod is accepted but throttled to 100m.',
      'The kubelet evicts an existing Pod to make room.'
    ),
    correct: ['b'],
    explanation: 'ResourceQuotas are enforced at admission. New Pods are rejected if their request/limit pushes the namespace totals above the quota.',
    references: [REF_RES]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.SINGLE,
    stem: 'A Pod with no resource requests is scheduled. Then memory pressure builds on the node and the kubelet must evict Pods. Which Pod is evicted FIRST under standard QoS rules?',
    options: opts4(
      'Guaranteed Pods (requests == limits)',
      'Burstable Pods (requests < limits)',
      'BestEffort Pods (no requests or limits)',
      'Pods marked critical via priorityClass'
    ),
    correct: ['c'],
    explanation: 'Eviction order under node pressure is BestEffort → Burstable → Guaranteed. BestEffort Pods (no requests/limits) are sacrificed first.',
    references: [REF_RES]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A PersistentVolumeClaim with `accessModes: [ReadWriteOnce]` can be:',
    options: opts4(
      'Mounted read-write by exactly one node at a time.',
      'Mounted read-write by every Pod in the namespace concurrently.',
      'Mounted read-only by many nodes but not read-write.',
      'Mounted read-write only by Pods in the same Pod.'
    ),
    correct: ['a'],
    explanation: 'RWO permits read-write by ONE node (not Pod). Multiple Pods on that same node can mount it. RWX permits multi-node read-write.',
    references: [REF_PV]
  },

  // ── Services and Networking (4) ──
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A Service `api` of type ClusterIP selects Pods with label `app=api`. You scale the Deployment up by 2 Pods. What must you do for the new Pods to receive traffic?',
    options: opts4(
      'Update the Service\'s `targetPort` to the new Pod count.',
      'Nothing — the EndpointSlice controller updates endpoints automatically as Pods become Ready.',
      'Delete and recreate the Service.',
      'Restart kube-proxy on every node.'
    ),
    correct: ['b'],
    explanation: 'The EndpointSlice / Endpoints controller continuously reconciles Service backends to match Ready Pods of the selector. No manual action is needed.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy in namespace `prod` has `podSelector: {}` and `policyTypes: [Ingress]` with no `ingress` rules. The effect is:',
    options: opts4(
      'Allow all ingress to all Pods in prod.',
      'Deny all ingress to all Pods in prod.',
      'Deny all egress from all Pods in prod.',
      'No effect (empty policy is ignored).'
    ),
    correct: ['b'],
    explanation: 'An empty `podSelector: {}` matches every Pod in the namespace; declaring `policyTypes: [Ingress]` with no `ingress` rules denies all ingress to those Pods.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'A NodePort Service has `spec.ports[0].nodePort: 31000`. From OUTSIDE the cluster, the Service is reachable via:',
    options: opts4(
      'http://<any-node-ip>:31000',
      'http://<service-cluster-ip>:31000',
      'http://<pod-ip>:31000',
      'http://<kube-apiserver>:31000'
    ),
    correct: ['a'],
    explanation: 'NodePort opens the same port on every node. Reach the Service at any node\'s IP on that port; kube-proxy forwards into the cluster.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a stable DNS-based alias for the external hostname `db.example.com` inside the cluster. Which Service type fits?',
    options: opts4(
      'ClusterIP',
      'NodePort',
      'LoadBalancer',
      'ExternalName'
    ),
    correct: ['d'],
    explanation: 'ExternalName Services return a CNAME to an external host in cluster DNS — no proxying, no IP allocation.',
    references: [REF_SVC]
  },

  // ── Design and Build (+9 → 13) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command runs a one-off Pod that prints text and is removed automatically when it exits?',
    options: opts4(
      'kubectl run tmp --image=busybox --restart=Never --rm -it -- echo hi',
      'kubectl create pod tmp --image=busybox --once',
      'kubectl run tmp --image=busybox --ephemeral -- echo hi',
      'kubectl exec tmp --image=busybox -- echo hi'
    ),
    correct: ['a'],
    explanation: '`kubectl run ... --restart=Never --rm -it -- <cmd>` runs a throwaway Pod attached to your terminal and deletes it on exit, ideal for quick checks.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'The adapter multi-container pattern is best described as:',
    options: opts4(
      'A container that runs before the app to set up state.',
      'A sidecar that transforms the main container\'s output into a standardized format for external consumers (e.g. metrics).',
      'A proxy for outbound connections.',
      'A container that holds a shared volume.'
    ),
    correct: ['b'],
    explanation: 'The adapter normalizes/translates the main container\'s output (logs, metrics) into a format an external system expects, without modifying the app.',
    references: [REF_MULTI]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A native sidecar is defined as an init container with `restartPolicy: Always` and keeps running alongside the main app containers.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Native sidecars (stable since Kubernetes 1.29) are init containers with `restartPolicy: Always`; they start before app containers and continue running for the Pod\'s lifetime.',
    references: [REF_INIT]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Job must abort if it runs longer than 5 minutes regardless of retries. Which field enforces this?',
    options: opts4(
      'spec.activeDeadlineSeconds: 300',
      'spec.backoffLimit: 300',
      'spec.ttlSecondsAfterFinished: 300',
      'spec.completions: 300'
    ),
    correct: ['a'],
    explanation: '`activeDeadlineSeconds` is a hard wall-clock cap on the Job; once exceeded the Job is terminated and marked failed, overriding remaining retries.',
    references: [REF_JOBS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'In a Pod spec, which field sets the command run by the container, overriding the image\'s ENTRYPOINT?',
    options: opts4(
      'spec.containers[].command',
      'spec.containers[].entrypoint',
      'spec.command',
      'spec.containers[].run'
    ),
    correct: ['a'],
    explanation: 'In Kubernetes, `containers[].command` overrides the image ENTRYPOINT and `containers[].args` overrides CMD.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An indexed Job (`completionMode: Indexed`) with `completions: 3` gives each Pod:',
    options: opts4(
      'A unique completion index (0,1,2) via the JOB_COMPLETION_INDEX env var.',
      'The same index 0.',
      'A random UUID only.',
      'No way to distinguish Pods.'
    ),
    correct: ['a'],
    explanation: 'Indexed Jobs assign each Pod a unique index 0..completions-1, exposed via `JOB_COMPLETION_INDEX`, enabling static work partitioning.',
    references: [REF_JOBS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about init containers vs sidecars.',
    options: opts4(
      'A plain init container must finish before the next container starts.',
      'A native sidecar starts before app containers but does not block them by needing to complete.',
      'Init containers and app containers always start at the same time.',
      'Init containers can use a different image than the app container.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Plain init containers run to completion sequentially; native sidecars (restartPolicy Always) start early but stay running. App containers do NOT start simultaneously with init containers. Each container can use any image.',
    references: [REF_INIT]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Dockerfile instruction declares a default command that is easily overridden by `docker run <img> <args>`?',
    options: opts4(
      'CMD',
      'ENTRYPOINT (exec form)',
      'RUN',
      'LABEL'
    ),
    correct: ['a'],
    explanation: '`CMD` provides default arguments that are replaced entirely when the user passes a command to `docker run`. `ENTRYPOINT` is harder to override (requires `--entrypoint`).',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A Pod\'s init container writes a config file to a shared emptyDir; the app container reads it. If the init container fails repeatedly, the app container:',
    options: opts4(
      'Starts anyway and reads a stale file.',
      'Never starts — the Pod stays in Init:Error/CrashLoopBackOff until the init container succeeds.',
      'Is scheduled to another node.',
      'Is converted into a Job.'
    ),
    correct: ['b'],
    explanation: 'App containers do not start until ALL init containers succeed. A persistently failing init container keeps the Pod in an Init phase and the app never runs.',
    references: [REF_INIT]
  },

  // ── Deployment (+9 → 13) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command records the previous and current config for a Deployment so you can diff before applying?',
    options: opts4(
      'kubectl diff -f deployment.yaml',
      'kubectl apply --preview -f deployment.yaml',
      'kubectl compare deployment.yaml',
      'kubectl rollout diff deployment/web'
    ),
    correct: ['a'],
    explanation: '`kubectl diff -f <file>` shows what `kubectl apply` would change by comparing the manifest against the live cluster state.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A Deployment selector is `matchLabels: {app: web}` but the Pod template labels are `{app: api}`. What happens on apply?',
    options: opts4(
      'It works; labels are advisory.',
      'The Deployment is rejected/invalid because the selector must match the template labels.',
      'A Service is auto-created.',
      'It silently scales to zero.'
    ),
    correct: ['b'],
    explanation: 'A Deployment\'s `spec.selector` must match the Pod template labels; a mismatch is a validation error and the object is rejected.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You ran `kubectl rollout undo deployment/web` but need to go to revision 2 specifically. Which command?',
    options: opts4(
      'kubectl rollout undo deployment/web --to-revision=2',
      'kubectl rollout undo deployment/web -r 2',
      'kubectl rollback deployment/web 2',
      'kubectl set revision deployment/web 2'
    ),
    correct: ['a'],
    explanation: '`kubectl rollout undo deployment/<name> --to-revision=N` rolls back to a specific revision listed by `kubectl rollout history`.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Scaling a Deployment with `kubectl scale` creates a new ReplicaSet revision.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'Scaling only changes the replica count on the existing ReplicaSet; it does NOT alter the Pod template, so no new revision is created. Only `spec.template` changes create revisions.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A Deployment is stuck: new Pods are `Pending` due to insufficient memory and old Pods still serve traffic. With `maxUnavailable: 0`, the rollout:',
    options: opts4(
      'Forces old Pods down to make room.',
      'Stalls — old Pods stay up (no downtime) until new Pods can be scheduled or the progress deadline triggers.',
      'Deletes the Deployment.',
      'Switches to Recreate automatically.'
    ),
    correct: ['b'],
    explanation: 'With `maxUnavailable: 0`, the controller will not remove old Pods until replacements are Ready. If new Pods cannot schedule, the rollout stalls safely and may report ProgressDeadlineExceeded.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command edits a live Deployment in your default editor and applies on save?',
    options: opts4(
      'kubectl edit deployment/web',
      'kubectl modify deployment web',
      'kubectl patch deployment web --editor',
      'kubectl update deployment web'
    ),
    correct: ['a'],
    explanation: '`kubectl edit <resource>/<name>` opens the live object in `$EDITOR`; saving applies the change via a patch.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'A Deployment owns ReplicaSet `web-abc` (current) and `web-def` (old, 0 replicas). You delete ReplicaSet `web-abc` directly. What happens?',
    options: opts4(
      'The Deployment recreates a matching ReplicaSet and its Pods to reconcile desired state.',
      'The Deployment is deleted too.',
      'Nothing — the Pods keep running orphaned.',
      'The old ReplicaSet web-def is promoted with the new image.'
    ),
    correct: ['a'],
    explanation: 'The Deployment controller continuously reconciles; deleting its active ReplicaSet causes it to create a new ReplicaSet from the current template and restore the desired Pods.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Helm: which command lists the currently installed releases in a namespace?',
    options: opts4(
      'helm list -n <namespace>',
      'helm get releases',
      'helm ps -n <namespace>',
      'helm show releases'
    ),
    correct: ['a'],
    explanation: '`helm list` (alias `helm ls`) shows installed releases; `-n` scopes to a namespace, `-A` lists across all namespaces.',
    references: [REF_HELM]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Helm: which command renders a chart\'s templates locally without installing, to inspect the resulting manifests?',
    options: opts4(
      'helm template ./mychart',
      'helm render ./mychart',
      'helm install ./mychart --dry-only',
      'helm build ./mychart'
    ),
    correct: ['a'],
    explanation: '`helm template <chart>` renders manifests to stdout with values substituted, without touching the cluster. `helm install --dry-run` requires a cluster connection.',
    references: [REF_HELM]
  },

  // ── Observability and Maintenance (+7 → 10) ──
  {
    domain: OBSERV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows a Pod\'s recent Events plus container statuses for troubleshooting?',
    options: opts4(
      'kubectl describe pod <pod>',
      'kubectl logs <pod> --events',
      'kubectl get pod <pod> -o events',
      'kubectl inspect pod <pod>'
    ),
    correct: ['a'],
    explanation: '`kubectl describe pod` shows container state, restart counts, conditions, and the Events section — the first stop for diagnosing scheduling/start failures.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'A readiness probe uses `periodSeconds: 5`, `successThreshold: 1`, `failureThreshold: 3`. After the Pod becomes unready, how many consecutive successful probes return it to Ready?',
    options: opts4(
      '1',
      '3',
      '5',
      'It never returns automatically.'
    ),
    correct: ['a'],
    explanation: '`successThreshold` for readiness defaults to 1; a single success flips the Pod back to Ready. `failureThreshold` (3) is how many failures mark it unready.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An exec probe command returns exit code 0. The probe is considered:',
    options: opts4(
      'Successful',
      'Failed',
      'Unknown',
      'Timed out'
    ),
    correct: ['a'],
    explanation: 'An exec probe succeeds when the command exits 0; any non-zero exit is a failure. httpGet succeeds on 2xx/3xx; tcpSocket succeeds if the connection opens.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 4, type: QType.SINGLE,
    stem: 'A container restarts every ~40s. `kubectl describe pod` shows Last State Terminated, Reason Error, Exit Code 1, and a livenessProbe with periodSeconds 10 failureThreshold 3. The MOST likely root cause to investigate first is:',
    options: opts4(
      'The Service selector.',
      'The application itself exiting/crashing (exit code 1) or failing its liveness endpoint — check kubectl logs --previous.',
      'A NetworkPolicy.',
      'The node\'s disk pressure.'
    ),
    correct: ['b'],
    explanation: 'Reason `Error` with exit code 1 plus a ~30s liveness window points to the app crashing or failing its health endpoint. `kubectl logs --previous` reveals the crash output.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A failing readiness probe causes the kubelet to restart the container.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'Readiness only removes the Pod from Service endpoints; it never restarts the container. Liveness probe failures are what trigger restarts.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command streams logs from the last 1 hour for a Pod and keeps following new lines?',
    options: opts4(
      'kubectl logs <pod> --since=1h -f',
      'kubectl logs <pod> --last=1h --stream',
      'kubectl logs <pod> -t 1h',
      'kubectl logs <pod> --range=1h --watch'
    ),
    correct: ['a'],
    explanation: '`--since=1h` limits to the last hour and `-f` follows. `--tail=N` instead limits to the last N lines.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod is stuck `Pending`. `kubectl describe pod` shows a FailedScheduling event "0/3 nodes available: insufficient cpu". The fix that does NOT require new nodes is:',
    options: opts4(
      'Lower the Pod\'s CPU request so it fits an existing node.',
      'Add a livenessProbe.',
      'Change the Service type.',
      'Increase replicas.'
    ),
    correct: ['a'],
    explanation: 'Insufficient CPU at scheduling means the Pod\'s CPU REQUEST exceeds any node\'s allocatable. Reducing the request (or freeing capacity) lets the scheduler place it without adding nodes.',
    references: [REF_RES]
  },

  // ── Environment, Configuration and Security (+11 → 16) ──
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Secret\'s value should be consumed as an env var WITHOUT the value appearing in the Pod manifest. Which is correct?',
    options: opts4(
      'env: [{ name: PW, valueFrom: { secretKeyRef: { name: db, key: password } } }]',
      'env: [{ name: PW, value: "{{secret:db.password}}" }]',
      'env: [{ name: PW, configMapKeyRef: { name: db, key: password } }]',
      'envFrom: [{ value: db/password }]'
    ),
    correct: ['a'],
    explanation: '`env[].valueFrom.secretKeyRef` references a Secret key by name; the literal value stays in the Secret, not the Pod spec.',
    references: [REF_SEC]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod must run with supplemental group 3000 added to its processes for shared-volume access. Which field?',
    options: opts4(
      'spec.securityContext.fsGroup or supplementalGroups',
      'spec.containers[].user',
      'spec.serviceAccountName',
      'metadata.labels.group'
    ),
    correct: ['a'],
    explanation: 'Pod-level `securityContext.fsGroup` sets a supplemental group that owns mounted volumes; `supplementalGroups` adds extra GIDs to the container processes.',
    references: [REF_SCTX]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a docker-registry pull Secret?',
    options: opts4(
      'kubectl create secret docker-registry regcred --docker-server=... --docker-username=... --docker-password=...',
      'kubectl create secret generic regcred --type=docker',
      'kubectl create registry-secret regcred',
      'kubectl create secret tls regcred --registry'
    ),
    correct: ['a'],
    explanation: '`kubectl create secret docker-registry` produces a `kubernetes.io/dockerconfigjson` Secret for pulling from private registries via `imagePullSecrets`.',
    references: [REF_SEC]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.SINGLE,
    stem: 'A Pod sets `runAsNonRoot: true` but the image\'s default user is root (UID 0) and no `runAsUser` is set. What happens at start?',
    options: opts4(
      'The container starts as root anyway.',
      'The kubelet refuses to start the container (CreateContainerConfigError) because it would run as root.',
      'Kubernetes auto-assigns UID 1000.',
      'The Pod is OOMKilled.'
    ),
    correct: ['b'],
    explanation: '`runAsNonRoot: true` makes the kubelet validate the effective user is non-root at start. If the image would run as UID 0, container creation fails rather than running privileged.',
    references: [REF_SCTX]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command attaches an existing ConfigMap\'s keys to a Deployment\'s Pods as env vars via imperative patch is impractical; instead the recommended approach is:',
    options: opts4(
      'Add `envFrom: [{ configMapRef: { name: <cm> } }]` to the Deployment\'s container spec and apply.',
      'Set the keys as Pod annotations.',
      'Create a Service pointing at the ConfigMap.',
      'Mount the ConfigMap as a Secret.'
    ),
    correct: ['a'],
    explanation: 'Declaratively adding `envFrom.configMapRef` to the container projects every ConfigMap key as an env var; editing the Deployment template triggers a rollout so Pods pick it up.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'Environment variables injected from a ConfigMap update automatically in a running container when the ConfigMap changes.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'Env vars are evaluated only at container start. ConfigMap/Secret changes reflect live ONLY for volume mounts; env-var consumers need a Pod restart.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod needs its memory limit exposed to the app as an env var. Which Downward API ref is correct?',
    options: opts4(
      'valueFrom: { resourceFieldRef: { containerName: app, resource: limits.memory } }',
      'valueFrom: { fieldRef: { fieldPath: spec.memory } }',
      'valueFrom: { configMapKeyRef: { name: limits } }',
      'value: $(MEMORY_LIMIT)'
    ),
    correct: ['a'],
    explanation: 'The Downward API exposes resource requests/limits via `resourceFieldRef` (e.g. `limits.memory`, `requests.cpu`), letting apps self-tune (e.g. JVM heap).',
    references: [REF_RES]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A ServiceAccount `reader` needs read access to ConfigMaps in namespace `app`. Minimal RBAC is:',
    options: opts4(
      'A Role with rules [verbs: get,list,watch; resources: configmaps] plus a RoleBinding to the SA.',
      'A ClusterRoleBinding granting cluster-admin.',
      'Add the SA to the system:masters group.',
      'Set the Pod privileged.'
    ),
    correct: ['a'],
    explanation: 'Least privilege: a namespaced Role limited to `get/list/watch` on `configmaps`, bound to the SA via a RoleBinding in that namespace.',
    references: [REF_SA]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about ConfigMaps and Secrets.',
    options: opts4(
      'Both can be mounted as volumes or injected as env vars.',
      'A Secret\'s data values are base64-encoded in the manifest.',
      'A ConfigMap can store binary data via the binaryData field.',
      'Secrets are encrypted at rest by default without any extra configuration.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'ConfigMaps/Secrets both support volume and env consumption; Secret `data` is base64; ConfigMaps support `binaryData`. Encryption at rest requires explicit EncryptionConfiguration — it is NOT on by default.',
    references: [REF_SEC, REF_CM]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A PVC is `Pending` with event "no persistent volumes available for this claim and no storage class is set". The fix is:',
    options: opts4(
      'Set a valid storageClassName (or create a matching PV) so the claim can bind/provision.',
      'Increase the Pod\'s CPU limit.',
      'Add a readiness probe.',
      'Recreate the Service.'
    ),
    correct: ['a'],
    explanation: 'A PVC with no StorageClass and no matching static PV cannot bind. Specifying a StorageClass enables dynamic provisioning, or an admin must create a matching PV.',
    references: [REF_PV]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A container should NOT be able to gain more privileges than its parent process. Which setting enforces this?',
    options: opts4(
      'securityContext.allowPrivilegeEscalation: false',
      'securityContext.privileged: true',
      'securityContext.runAsUser: 0',
      'hostPID: true'
    ),
    correct: ['a'],
    explanation: '`allowPrivilegeEscalation: false` sets the no_new_privs flag so setuid binaries cannot elevate privileges beyond the container process.',
    references: [REF_SCTX]
  },

  // ── Services and Networking (+9 → 13) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'From a Pod in namespace `team-a`, what is the shortest name that resolves Service `cache` in the SAME namespace?',
    options: opts4(
      'cache',
      'cache.team-a',
      'cache.svc',
      'cache.cluster.local'
    ),
    correct: ['a'],
    explanation: 'Within the same namespace the bare Service name `cache` resolves via the search domain. The FQDN is `cache.team-a.svc.cluster.local`.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A Service uses `externalTrafficPolicy: Local` on a NodePort. The effect is:',
    options: opts4(
      'Traffic is only routed to Pods on the node that received it, preserving the client source IP.',
      'All traffic is dropped.',
      'Traffic is duplicated to every Pod.',
      'The Service becomes ClusterIP.'
    ),
    correct: ['a'],
    explanation: '`externalTrafficPolicy: Local` avoids the extra SNAT hop, preserving the client source IP but only forwarding to local Pods (nodes without a Pod return no endpoints).',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A NetworkPolicy allows DNS egress. Which rule typically permits Pods to resolve names?',
    options: opts4(
      'egress to kube-system namespace / kube-dns Pods on UDP and TCP port 53',
      'egress to 0.0.0.0/0 port 443',
      'ingress from port 53',
      'egress to the API server on 6443'
    ),
    correct: ['a'],
    explanation: 'When a default-deny egress policy is in place, you must explicitly allow egress to the cluster DNS (CoreDNS/kube-dns) on port 53 (UDP and TCP) or name resolution breaks.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress resource requires a running Ingress controller to actually route traffic.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'The Ingress object only declares routing intent; an Ingress controller (e.g. ingress-nginx) must be deployed to watch Ingress objects and implement the routing.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'A Service\'s `targetPort` is omitted entirely. What value does Kubernetes use?',
    options: opts4(
      'It defaults to the same value as `port`.',
      'It defaults to 0 and the Service fails.',
      'It defaults to 80.',
      'The Service is rejected.'
    ),
    correct: ['a'],
    explanation: 'When `targetPort` is not specified it defaults to the value of `port`; the Service forwards Service-port traffic to the same numeric container port.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need pod-to-pod traffic blocked by default in namespace `secure`, allowing only explicitly permitted flows. The baseline policy is:',
    options: opts4(
      'A NetworkPolicy with podSelector: {} and policyTypes: [Ingress, Egress] with no rules (default-deny), then add allow policies.',
      'A LoadBalancer Service.',
      'Set hostNetwork: true on all Pods.',
      'Delete CoreDNS.'
    ),
    correct: ['a'],
    explanation: 'A default-deny policy selecting all Pods with empty Ingress/Egress rule sets establishes a deny baseline; additive allow policies then open required paths (including DNS).',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress has `spec.ingressClassName: nginx`. Its purpose is:',
    options: opts4(
      'To select which Ingress controller handles this Ingress.',
      'To set the TLS cipher suite.',
      'To name the backend Service.',
      'To define the URL path.'
    ),
    correct: ['a'],
    explanation: '`ingressClassName` binds the Ingress to a specific IngressClass/controller, important in clusters running multiple Ingress controllers.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Service `web` has endpoints but `curl web` from another Pod times out, while `curl <podIP>` works. The MOST likely cause is:',
    options: opts4(
      'A NetworkPolicy or DNS issue (the Service name/IP path is blocked or unresolved), not the Pods themselves.',
      'The Pods are down.',
      'The image is wrong.',
      'The Deployment has zero replicas.'
    ),
    correct: ['a'],
    explanation: 'Direct Pod IP working but Service name failing isolates the problem to DNS resolution or a NetworkPolicy blocking the ClusterIP/DNS path — the Pods are healthy.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Ingress.',
    options: opts4(
      'A single Ingress can fan out multiple hostnames to different Services.',
      'TLS termination can be configured via spec.tls with a kubernetes.io/tls Secret.',
      'Ingress natively load-balances raw TCP/UDP for arbitrary protocols.',
      'pathType Prefix matches by path segments.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Ingress is HTTP/HTTPS layer-7 routing — it does not natively handle arbitrary TCP/UDP (use a Service of type LoadBalancer/NodePort for that). It supports host fan-out, TLS termination, and prefix path matching.',
    references: [REF_ING]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Design and Build (4) ──
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Docker layer is rebuilt FIRST when only the application source code (added last in the Dockerfile) changes?',
    options: opts4(
      'The base image FROM layer.',
      'The layer added immediately after the changed source line, and everything below.',
      'The COPY/ADD layer containing the changed source and every layer AFTER it.',
      'The entire image is rebuilt from scratch every time.'
    ),
    correct: ['c'],
    explanation: 'Docker cache is invalidated at the first changed layer and every subsequent layer. Placing rarely-changing instructions early (e.g. dependency install) maximises cache reuse.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'Two containers in one Pod need to share a directory. Which volume type is appropriate?',
    options: opts4(
      'emptyDir',
      'hostPath',
      'persistentVolumeClaim',
      'configMap'
    ),
    correct: ['a'],
    explanation: '`emptyDir` is created when the Pod is assigned to a node and shared among the Pod\'s containers. It is removed when the Pod terminates. hostPath ties to a specific node; PVC is typically for cross-Pod persistence.',
    references: [REF_PV]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about init containers.',
    options: opts4(
      'Init containers run to completion BEFORE app containers start.',
      'Init containers can have their own resource requests/limits and securityContext.',
      'Init containers run in parallel with app containers.',
      'If an init container fails, the Pod is restarted (by default).'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Init containers run sequentially before app containers — not in parallel. They have their own resources/securityContext. Default restartPolicy is Always, so an init failure triggers Pod restart.',
    references: [REF_INIT]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A Job has `backoffLimit: 4`. What does this mean?',
    options: opts4(
      'The Job retries up to 4 times before being marked failed.',
      'The Job runs at most 4 Pods in parallel.',
      'The Job times out after 4 minutes.',
      'The Job retains 4 completed Pods after success.'
    ),
    correct: ['a'],
    explanation: '`backoffLimit` caps the number of retries on failure. After that many attempts, the Job reports Failed status.',
    references: [REF_JOBS]
  },

  // ── Deployment (4) ──
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command pauses an in-progress rollout of Deployment `api`?',
    options: opts4(
      'kubectl rollout pause deployment/api',
      'kubectl rollout halt deployment/api',
      'kubectl scale deployment/api --pause',
      'kubectl deploy api --pause'
    ),
    correct: ['a'],
    explanation: '`kubectl rollout pause/resume deployment/<name>` pauses and resumes a rollout. Useful for canary-style staged updates.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which kubectl subcommand creates resources from a manifest in a declarative, idempotent way?',
    options: opts4(
      'kubectl create -f manifest.yaml',
      'kubectl apply -f manifest.yaml',
      'kubectl run -f manifest.yaml',
      'kubectl replace -f manifest.yaml'
    ),
    correct: ['b'],
    explanation: '`kubectl apply` is the declarative command — it creates resources that do not exist and patches existing ones based on the manifest, tracking changes via the last-applied annotation.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'A Deployment\'s revisionHistoryLimit defaults to 10. What does it control?',
    options: opts4(
      'Maximum simultaneous rolling Pods.',
      'Maximum number of OLD ReplicaSets retained for rollback.',
      'Maximum age in days before a ReplicaSet is pruned.',
      'Maximum number of replicas.'
    ),
    correct: ['b'],
    explanation: '`revisionHistoryLimit` keeps the last N old ReplicaSets so `kubectl rollout undo --to-revision=N` can target them. Older ones are garbage-collected.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A blue/green deployment strategy on Kubernetes is typically implemented by:',
    options: opts4(
      'Running two Deployments (blue, green) behind one Service, switching the Service selector between them at cutover.',
      'Using `strategy.type: Recreate` on a single Deployment.',
      'Setting `maxUnavailable: 50%`.',
      'Disabling the readiness probe during cutover.'
    ),
    correct: ['a'],
    explanation: 'Blue/green keeps two complete environments and flips the selector (or Ingress backend) atomically. Recreate is single-Deployment downtime updates, not blue/green.',
    references: [REF_DEPLOY]
  },

  // ── Observability and Maintenance (3) ──
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod has two containers `app` and `proxy`. How do you retrieve only the `app` container\'s logs?',
    options: opts4(
      'kubectl logs <pod> --container=app',
      'kubectl logs <pod>/app',
      'kubectl logs --filter=app <pod>',
      'kubectl exec <pod> -- logs app'
    ),
    correct: ['a'],
    explanation: 'Use `-c`/`--container` to disambiguate containers when a Pod has more than one.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 4, type: QType.SINGLE,
    stem: 'You add a readinessProbe to a fronting Pod. During slow startup the Pod reports Ready=False. What is the user-visible effect?',
    options: opts4(
      'The Pod is killed and restarted by the kubelet.',
      'The Pod\'s IP is REMOVED from any backing Service\'s endpoints, so traffic is not routed to it.',
      'The Pod is moved to another node.',
      'The Deployment fails the rollout immediately.'
    ),
    correct: ['b'],
    explanation: 'Readiness gates Service endpoint membership but does NOT restart Pods. A rollout pauses if too few Pods become Ready (per maxUnavailable).',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command prints CPU and memory usage of every Pod in the current namespace (requires metrics-server)?',
    options: opts4(
      'kubectl top pods',
      'kubectl get pods --metrics',
      'kubectl resources pods',
      'kubectl describe metrics'
    ),
    correct: ['a'],
    explanation: '`kubectl top` reads from the Metrics API served by metrics-server (or equivalent). `kubectl top nodes` shows node-level metrics.',
    references: [REF_LOGS]
  },

  // ── Environment, Configuration and Security (5) ──
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates a generic Secret named `db-cred` with key `password=s3cret!`?',
    options: opts4(
      'kubectl create secret generic db-cred --from-literal=password=s3cret!',
      'kubectl create secret db-cred --password=s3cret!',
      'kubectl set secret db-cred password=s3cret!',
      'kubectl secret generic db-cred password=s3cret!'
    ),
    correct: ['a'],
    explanation: '`kubectl create secret generic ... --from-literal` is the imperative form. There are also `tls` and `docker-registry` subtypes.',
    references: [REF_SEC]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A container needs the entire ConfigMap `app-cfg` exposed as environment variables. Which spec snippet does this?',
    options: opts4(
      'envFrom: [{ configMapRef: { name: app-cfg } }]',
      'env: [{ valueFrom: { configMap: app-cfg } }]',
      'volumeMounts: [{ name: app-cfg, mountPath: /env }]',
      'configMap: app-cfg'
    ),
    correct: ['a'],
    explanation: '`envFrom.configMapRef` projects every key in the ConfigMap as an env var. `env[].valueFrom.configMapKeyRef` is for one key at a time.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.SINGLE,
    stem: 'A namespace has a `LimitRange` with default container CPU request 200m / limit 500m. You apply a Pod with NO resources specified. What happens?',
    options: opts4(
      'The Pod is rejected at admission.',
      'The Pod is created with request 200m / limit 500m applied by the LimitRange admission controller.',
      'The Pod runs with no requests/limits (LimitRange is advisory).',
      'The Pod runs but is marked Failed.'
    ),
    correct: ['b'],
    explanation: 'LimitRange admission injects the namespace defaults into Pods that omit them. It can also enforce min/max bounds, rejecting Pods that violate them.',
    references: [REF_RES]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a Pod to use a non-default ServiceAccount `ci-bot`. Which Pod spec field sets this?',
    options: opts4(
      'spec.serviceAccount: ci-bot',
      'spec.serviceAccountName: ci-bot',
      'spec.containers[].serviceAccount: ci-bot',
      'metadata.serviceAccount: ci-bot'
    ),
    correct: ['b'],
    explanation: '`spec.serviceAccountName` is the correct field. `spec.serviceAccount` is deprecated and `containers[].serviceAccount` does not exist.',
    references: [REF_SA]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about PersistentVolumes and PersistentVolumeClaims.',
    options: opts4(
      'A PVC binds to one PV at a time; the binding is exclusive.',
      'StorageClasses enable dynamic provisioning — a matching PV is created on demand when the PVC is created.',
      'A PVC can be expanded online if the StorageClass has `allowVolumeExpansion: true`.',
      'Deleting a PVC always deletes the underlying PV regardless of reclaim policy.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'PV reclaim policy controls deletion: `Delete` removes the PV; `Retain` keeps it. So deletion of a PVC does NOT always delete the PV — depends on policy.',
    references: [REF_PV]
  },

  // ── Services and Networking (4) ──
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A Service `web` selects Pods with `app=web`. Two Pods have that label — one Ready, one NotReady. Endpoints for the Service contain:',
    options: opts4(
      'Both Pod IPs.',
      'Only the Ready Pod\'s IP; the NotReady Pod is in `notReadyAddresses`.',
      'Only the NotReady Pod\'s IP.',
      'No endpoints until both are Ready.'
    ),
    correct: ['b'],
    explanation: 'EndpointSlices place Ready Pods in `addresses` and not-Ready Pods in `notReadyAddresses`. Only Ready endpoints receive traffic.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Service field selects which Pods back the Service?',
    options: opts4(
      'spec.selector',
      'spec.podSelector',
      'spec.targetSelector',
      'metadata.labels'
    ),
    correct: ['a'],
    explanation: '`spec.selector` on a Service matches Pods by label and populates Endpoints. `podSelector` is a NetworkPolicy field; `metadata.labels` are the Service\'s own labels.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'An Ingress routes `host: shop.example.com` to Service `shop:80`. TLS is enabled via `spec.tls[0].secretName: shop-tls`. The Secret type must be:',
    options: opts4(
      'Opaque',
      'kubernetes.io/tls',
      'kubernetes.io/dockerconfigjson',
      'bootstrap.kubernetes.io/token'
    ),
    correct: ['b'],
    explanation: 'Ingress TLS requires a `kubernetes.io/tls` Secret carrying `tls.crt` and `tls.key`.',
    references: [REF_ING, REF_SEC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy in namespace `prod` allows ingress from Pods labelled `role=frontend` in namespace `web`. Which selector pair is correct?',
    options: opts4(
      'ingress.from: [{ podSelector: { matchLabels: { role: frontend } } }]',
      'ingress.from: [{ namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: web } }, podSelector: { matchLabels: { role: frontend } } }]',
      'ingress.from: [{ namespaceSelector: { matchLabels: { role: frontend } } }]',
      'ingress.from: [{ ipBlock: { cidr: 0.0.0.0/0 } }]'
    ),
    correct: ['b'],
    explanation: 'Cross-namespace selection requires BOTH a namespaceSelector (to match the source namespace) AND a podSelector (to match the source Pods). Option A would match only Pods in the same namespace.',
    references: [REF_NP]
  },

  // ── Design and Build (+9 → 13) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command adds a label `tier=backend` to an existing Pod `api`?',
    options: opts4(
      'kubectl label pod api tier=backend',
      'kubectl set label pod/api tier=backend',
      'kubectl annotate pod api tier=backend',
      'kubectl edit pod api --label tier=backend'
    ),
    correct: ['a'],
    explanation: '`kubectl label <resource> <name> key=value` adds/updates a label. Use `key-` to remove a label and `--overwrite` to change an existing one.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A workload needs exactly one Pod per node for a node-local agent. Which controller is designed for this?',
    options: opts4(
      'Deployment',
      'DaemonSet',
      'Job',
      'StatefulSet'
    ),
    correct: ['b'],
    explanation: 'A DaemonSet ensures one Pod per (matching) node — used for log shippers, node exporters, and CNI agents. Deployments do not pin one Pod per node.',
    references: [REF_DEPLOY]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'Containers in the same Pod can communicate over localhost because they share the Pod\'s network namespace.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'All containers in a Pod share one network namespace and IP, so they reach each other via `localhost`/127.0.0.1 and must not bind the same port.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A CronJob keeps too many old Jobs around. Which fields cap retained finished Jobs?',
    options: opts4(
      'spec.successfulJobsHistoryLimit and spec.failedJobsHistoryLimit',
      'spec.backoffLimit and spec.completions',
      'spec.ttlSeconds and spec.maxJobs',
      'spec.concurrencyPolicy only'
    ),
    correct: ['a'],
    explanation: 'CronJob `successfulJobsHistoryLimit` (default 3) and `failedJobsHistoryLimit` (default 1) bound how many finished Jobs are retained for inspection.',
    references: [REF_CRON]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Pod spec field passes ARGS to the container, overriding the image CMD but not the ENTRYPOINT?',
    options: opts4(
      'spec.containers[].args',
      'spec.containers[].command',
      'spec.args',
      'spec.containers[].cmd'
    ),
    correct: ['a'],
    explanation: '`containers[].args` overrides the image CMD (the default arguments) while leaving the ENTRYPOINT intact. `containers[].command` overrides ENTRYPOINT.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A Pod has containers A and B sharing an emptyDir. A writes a ready file then exits 0; B waits for it. With `restartPolicy: Always`, what happens to A?',
    options: opts4(
      'A is restarted repeatedly even though it succeeded, because Always restarts on any exit.',
      'A is never restarted.',
      'The whole Pod is deleted.',
      'A is converted to an init container.'
    ),
    correct: ['a'],
    explanation: 'With `restartPolicy: Always`, the kubelet restarts a container that exits regardless of exit code. A short-lived setup step belongs in an init container, not a sidecar with Always.',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Jobs.',
    options: opts4(
      'parallelism controls how many Pods may run at once.',
      'completions sets how many successful Pods are required.',
      'A Job Pod template may use restartPolicy: Always.',
      'backoffLimit caps failed retries before the Job is marked Failed.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Job Pod templates must use `OnFailure` or `Never` (never `Always`). `parallelism`/`completions` shape concurrency and required successes; `backoffLimit` bounds retries.',
    references: [REF_JOBS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Dockerfile instruction is best for declaring a writable data location decoupled from the image layers?',
    options: opts4(
      'VOLUME /data',
      'MOUNT /data',
      'STORAGE /data',
      'PERSIST /data'
    ),
    correct: ['a'],
    explanation: '`VOLUME` declares a mount point whose contents live outside the image\'s union filesystem. In Kubernetes you typically supply that path via a Pod volume (emptyDir/PVC).',
    references: [REF_PODS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod must be scheduled only onto nodes labelled `disktype=ssd`. The simplest mechanism is:',
    options: opts4(
      'spec.nodeSelector: { disktype: ssd }',
      'A NetworkPolicy',
      'A readinessProbe',
      'spec.serviceAccountName'
    ),
    correct: ['a'],
    explanation: '`nodeSelector` is the simplest node-constraint: the Pod schedules only on nodes carrying all the specified labels. Affinity offers richer expressions.',
    references: [REF_PODS]
  },

  // ── Deployment (+9 → 13) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command outputs a Deployment manifest without creating it, to save to a file?',
    options: opts4(
      'kubectl create deployment web --image=nginx --dry-run=client -o yaml',
      'kubectl create deployment web --image=nginx --no-create',
      'kubectl get deployment web -o yaml --template',
      'kubectl deploy web --image=nginx --export'
    ),
    correct: ['a'],
    explanation: '`--dry-run=client -o yaml` renders the manifest client-side without contacting the API server, the standard scaffold-then-edit workflow.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A Deployment\'s old ReplicaSets are piling up consuming etcd. The field to reduce retention is:',
    options: opts4(
      'spec.revisionHistoryLimit',
      'spec.replicas',
      'spec.minReadySeconds',
      'spec.progressDeadlineSeconds'
    ),
    correct: ['a'],
    explanation: 'Lowering `revisionHistoryLimit` reduces how many old ReplicaSets are kept (default 10). Fewer revisions means less clutter but fewer rollback targets.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command annotates a Deployment with a change-cause so it appears in rollout history?',
    options: opts4(
      'kubectl annotate deployment/web kubernetes.io/change-cause="bump to 1.27"',
      'kubectl set cause deployment/web "bump to 1.27"',
      'kubectl rollout cause deployment/web --msg="bump"',
      'kubectl label deployment/web change-cause=bump'
    ),
    correct: ['a'],
    explanation: 'The `kubernetes.io/change-cause` annotation populates the CHANGE-CAUSE column in `kubectl rollout history`, documenting why each revision was created.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'With RollingUpdate, `maxSurge` and `maxUnavailable` cannot both be 0.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'If both are 0 the rollout can neither create an extra Pod nor drop an existing one, so it could never make progress; Kubernetes rejects that combination.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'You set `kubectl rollout pause deployment/web`, then change the image twice, then `kubectl rollout resume`. How many new ReplicaSets/rollouts occur?',
    options: opts4(
      'One — the paused state batches the changes; resuming rolls out the final template once.',
      'Two — one rollout per image change.',
      'Zero — pause cancels changes.',
      'Three.'
    ),
    correct: ['a'],
    explanation: 'While paused, the Deployment accumulates spec changes without rolling out. Resuming performs a single rollout to the latest template, enabling staged multi-edit canaries.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command deletes all resources defined in a manifest file?',
    options: opts4(
      'kubectl delete -f app.yaml',
      'kubectl remove -f app.yaml',
      'kubectl destroy -f app.yaml',
      'kubectl apply -f app.yaml --delete'
    ),
    correct: ['a'],
    explanation: '`kubectl delete -f <file>` removes every object the manifest declares, useful for tearing down a declaratively created app.',
    references: [REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Helm: which command rolls a release back to a previous revision?',
    options: opts4(
      'helm rollback <release> <revision>',
      'helm undo <release>',
      'helm revert <release> --to <revision>',
      'helm upgrade <release> --rollback'
    ),
    correct: ['a'],
    explanation: '`helm rollback <release> <revision>` reverts a release to a prior revision recorded in its history (`helm history <release>` lists them).',
    references: [REF_HELM]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'In a Helm chart, where do default configurable parameters live?',
    options: opts4(
      'values.yaml',
      'Chart.yaml',
      'templates/_helpers.tpl',
      'requirements.lock'
    ),
    correct: ['a'],
    explanation: '`values.yaml` holds default values referenced by templates via `.Values`; users override them with `--set` or `-f`. `Chart.yaml` holds chart metadata.',
    references: [REF_HELM]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A Kustomize overlay needs to change the image tag of the base for the prod environment. Which kustomization field does this cleanly?',
    options: opts4(
      'images: [{ name: myapp, newTag: v2 }]',
      'patchesJson6902 only',
      'configMapGenerator',
      'namePrefix'
    ),
    correct: ['a'],
    explanation: 'Kustomize\'s `images` transformer overrides image name/tag/digest without a manual patch, a common base-vs-overlay pattern.',
    references: [REF_DEPLOY]
  },

  // ── Observability and Maintenance (+7 → 10) ──
  {
    domain: OBSERV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows which node a Pod is running on and its Pod IP?',
    options: opts4(
      'kubectl get pod <pod> -o wide',
      'kubectl describe node <pod>',
      'kubectl get pod <pod> --node',
      'kubectl top pod <pod>'
    ),
    correct: ['a'],
    explanation: '`kubectl get pod -o wide` adds NODE, IP, NOMINATED NODE columns — quick context for scheduling/networking diagnosis.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'A liveness httpGet probe returns HTTP 500. The kubelet treats this as:',
    options: opts4(
      'A failure (only 2xx/3xx are success).',
      'A success (any response means alive).',
      'Unknown until timeout.',
      'A readiness signal only.'
    ),
    correct: ['a'],
    explanation: 'httpGet probes succeed only on status codes 200–399. A 4xx/5xx counts as a failure toward `failureThreshold`.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to copy a log file out of a running Pod\'s container to your machine. Which command?',
    options: opts4(
      'kubectl cp <namespace>/<pod>:/var/log/app.log ./app.log',
      'kubectl scp <pod>:/var/log/app.log .',
      'kubectl logs <pod> > app.log only works for stdout',
      'kubectl get file <pod>:/var/log/app.log'
    ),
    correct: ['a'],
    explanation: '`kubectl cp` copies files between a container and the local filesystem (it requires `tar` in the container). It is the way to retrieve files not written to stdout.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL correct probe-tuning statements for a slow-starting app.',
    options: opts4(
      'A startupProbe with a generous failureThreshold × periodSeconds protects boot from liveness kills.',
      'Once the startupProbe succeeds, liveness and readiness probes begin.',
      'initialDelaySeconds on liveness can also mitigate slow starts but is less precise than a startupProbe.',
      'A startupProbe runs for the entire Pod lifetime.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'startupProbe runs only until it first succeeds, then hands off to liveness/readiness. A long startup budget is its purpose; `initialDelaySeconds` is a coarser alternative.',
    references: [REF_PROBES]
  },
  {
    domain: OBSERV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: '`kubectl top` requires a metrics provider (e.g. metrics-server) to be installed in the cluster.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: '`kubectl top` reads the Metrics API; without metrics-server (or an equivalent) it errors with "Metrics API not available".',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod shows STATUS `ImagePullBackOff`. The first command to confirm the cause is:',
    options: opts4(
      'kubectl describe pod <pod> (read the Events for the pull error/auth failure)',
      'kubectl logs <pod>',
      'kubectl top pod <pod>',
      'kubectl exec <pod> -- sh'
    ),
    correct: ['a'],
    explanation: 'There are no logs for a container that never started. `kubectl describe pod` Events show the exact pull error: wrong tag, missing image, or registry auth failure.',
    references: [REF_LOGS]
  },
  {
    domain: OBSERV, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod terminated with exit code 137. This typically indicates:',
    options: opts4(
      'The process was killed by SIGKILL (often the OOM killer or a failed graceful shutdown).',
      'A successful completion.',
      'A configuration parse error.',
      'A DNS failure.'
    ),
    correct: ['a'],
    explanation: 'Exit code 137 = 128 + 9 (SIGKILL). Common causes are an OOMKill (memory limit exceeded) or termination after the grace period elapsed.',
    references: [REF_RES]
  },

  // ── Environment, Configuration and Security (+11 → 16) ──
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A specific Secret key `tls.key` should be projected to file path `keys/server.key` with mode 0400. Which volume config?',
    options: opts4(
      'secret: { secretName: s, items: [{ key: tls.key, path: keys/server.key, mode: 0400 }] }',
      'secret: { secretName: s, file: keys/server.key }',
      'configMap: { name: s, key: tls.key }',
      'secret: { secretName: s, env: tls.key }'
    ),
    correct: ['a'],
    explanation: 'A secret volume\'s `items` lets you select specific keys, set the in-Pod relative `path`, and per-file `mode` permissions.',
    references: [REF_SEC]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod must run with seccomp profile RuntimeDefault. Which field sets this?',
    options: opts4(
      'spec.securityContext.seccompProfile.type: RuntimeDefault',
      'spec.containers[].seccomp: default',
      'metadata.annotations.seccomp: runtime/default',
      'spec.runtimeClassName: seccomp'
    ),
    correct: ['a'],
    explanation: 'The modern field is `securityContext.seccompProfile.type` (RuntimeDefault or Localhost). The old annotation form is deprecated/removed.',
    references: [REF_SCTX]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command updates an existing ConfigMap key idempotently from a manifest?',
    options: opts4(
      'kubectl apply -f configmap.yaml',
      'kubectl create configmap --update',
      'kubectl set configmap -f configmap.yaml',
      'kubectl patch configmap --from-file'
    ),
    correct: ['a'],
    explanation: '`kubectl apply -f` is the declarative, idempotent path: it creates the ConfigMap if absent and patches changed keys if present.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.SINGLE,
    stem: 'A container needs the NET_ADMIN capability but the cluster enforces the Baseline Pod Security Standard. The likely outcome is:',
    options: opts4(
      'The Pod is rejected/denied by the namespace\'s Pod Security admission because NET_ADMIN is disallowed under Baseline/Restricted.',
      'It works with no restriction.',
      'Kubernetes silently drops only that capability and continues.',
      'It forces privileged mode automatically.'
    ),
    correct: ['a'],
    explanation: 'Pod Security admission Baseline/Restricted profiles forbid adding most capabilities (only a small set is allowed). A Pod requesting NET_ADMIN is rejected in an enforcing namespace.',
    references: [REF_SCTX]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod should disable mounting the default ServiceAccount token. Which Pod field?',
    options: opts4(
      'spec.automountServiceAccountToken: false',
      'spec.serviceAccountName: none',
      'spec.containers[].mountToken: false',
      'metadata.annotations.token: disabled'
    ),
    correct: ['a'],
    explanation: 'Setting `automountServiceAccountToken: false` at the Pod (or ServiceAccount) level stops projecting the API token, reducing exposure for Pods that never call the API.',
    references: [REF_SA]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A ConfigMap mounted as a volume reflects updates in the container\'s filesystem after the kubelet sync, but subPath mounts do NOT receive updates.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Whole-volume ConfigMap mounts update on sync, but a `subPath` mount is resolved once at start and is NOT updated when the ConfigMap changes.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod requests `memory: 256Mi` and limits `memory: 256Mi`, and CPU request==limit. Its QoS class is:',
    options: opts4(
      'Guaranteed',
      'Burstable',
      'BestEffort',
      'Critical'
    ),
    correct: ['a'],
    explanation: 'When every container has requests equal to limits for both CPU and memory, the Pod is `Guaranteed` — the last to be evicted under node pressure.',
    references: [REF_RES]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'An app reads its config from `/config/app.yaml`. You want this sourced from ConfigMap key `app.yaml`. Which mount is correct?',
    options: opts4(
      'A configMap volume with items mapping key app.yaml → path app.yaml, mounted at /config',
      'envFrom configMapRef',
      'A secret volume',
      'hostPath /config'
    ),
    correct: ['a'],
    explanation: 'Mounting the ConfigMap as a volume (optionally using `items` to control filenames) places `app.yaml` at `/config/app.yaml` for file-based config consumption.',
    references: [REF_CM]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about SecurityContext.',
    options: opts4(
      'runAsUser can be set at Pod or container level; the container value wins for that container.',
      'allowPrivilegeEscalation is a container-level field.',
      'fsGroup is a Pod-level field affecting volume ownership.',
      'privileged: true is required to run as a non-root user.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Running as non-root needs `runAsNonRoot`/`runAsUser`, NOT privileged (privileged grants near-host access). Pod vs container precedence, container-only `allowPrivilegeEscalation`, and Pod-level `fsGroup` are all correct.',
    references: [REF_SCTX]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A PVC with StorageClass `standard` and `allowVolumeExpansion: true` needs more space. The supported way to grow it is:',
    options: opts4(
      'Edit the PVC\'s spec.resources.requests.storage to a larger value and apply.',
      'Delete and recreate the PVC (data loss).',
      'Edit the PV capacity directly only.',
      'Scale the Deployment.'
    ),
    correct: ['a'],
    explanation: 'When the StorageClass allows expansion, increasing the PVC\'s requested storage triggers an online (or after-restart) volume resize without recreating the claim.',
    references: [REF_PV]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod must NOT share the host\'s PID namespace. Which is the safe default to keep?',
    options: opts4(
      'spec.hostPID: false (the default)',
      'spec.hostPID: true',
      'spec.shareProcessNamespace: true with hostPID',
      'spec.hostNetwork: true'
    ),
    correct: ['a'],
    explanation: 'Leaving `hostPID` false (default) isolates the Pod from host processes. Setting it true exposes/inspects host PIDs and is a security concern best avoided.',
    references: [REF_SCTX]
  },

  // ── Services and Networking (+9 → 13) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a ClusterIP Service for an existing Pod labelled `app=cache` on port 6379?',
    options: opts4(
      'kubectl expose pod <pod> --port=6379 --name=cache',
      'kubectl create svc <pod> --port=6379',
      'kubectl service expose pod <pod> 6379',
      'kubectl run cache --expose --port=6379'
    ),
    correct: ['a'],
    explanation: '`kubectl expose pod <pod> --port=` creates a Service selecting that Pod\'s labels (ClusterIP by default). For Deployments use `kubectl expose deployment`.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy `ingress.from` uses only `ipBlock: { cidr: 10.0.0.0/24 }`. This allows ingress from:',
    options: opts4(
      'Any source whose IP falls in 10.0.0.0/24 (subject to CNI handling of pod source IPs).',
      'Only Pods with a specific label.',
      'All namespaces.',
      'Nothing — ipBlock is invalid for ingress.'
    ),
    correct: ['a'],
    explanation: '`ipBlock` matches by CIDR. It is typically used for off-cluster sources; pod-to-pod source IPs may be obscured by SNAT depending on the CNI.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Service should distribute connections so a given client always hits the same Pod. Which setting?',
    options: opts4(
      'spec.sessionAffinity: ClientIP',
      'spec.type: LoadBalancer',
      'spec.externalTrafficPolicy: Local',
      'spec.publishNotReadyAddresses: true'
    ),
    correct: ['a'],
    explanation: '`sessionAffinity: ClientIP` makes kube-proxy route a client IP to the same backend for the affinity timeout window.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A ClusterIP Service is reachable from outside the cluster by default.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'ClusterIP is internal-only. External exposure needs NodePort, LoadBalancer, an Ingress, or port-forwarding.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'A NetworkPolicy permits egress to `podSelector: {role: db}` on TCP 5432, but app Pods also fail DNS lookups. The cause is:',
    options: opts4(
      'A default-deny egress is in effect and DNS (UDP/TCP 53 to CoreDNS) was not explicitly allowed.',
      'The db Pods are down.',
      'ClusterIP is disabled.',
      'The Service selector is wrong.'
    ),
    correct: ['a'],
    explanation: 'Once an egress policy selects the Pods, all egress not explicitly allowed is denied — including DNS. You must add an egress rule for port 53 to the cluster DNS.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to test a Service from your laptop without exposing it externally. Which command?',
    options: opts4(
      'kubectl port-forward service/web 8080:80',
      'kubectl expose service/web --external',
      'kubectl proxy service/web',
      'kubectl tunnel web 8080:80'
    ),
    correct: ['a'],
    explanation: '`kubectl port-forward service/<svc> <local>:<svcPort>` tunnels a local port to the Service through the API server — handy for ad-hoc testing without changing Service type.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress with no `host` field on a rule matches:',
    options: opts4(
      'All inbound HTTP hosts (the rule is a default/catch-all for its paths).',
      'No traffic.',
      'Only localhost.',
      'Only HTTPS traffic.'
    ),
    correct: ['a'],
    explanation: 'A rule without `host` applies to requests for any hostname, acting as a default backend rule for the listed paths.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod needs to reach a Service in another namespace `data`. From namespace `app`, the correct DNS name for Service `pg` is:',
    options: opts4(
      'pg.data.svc.cluster.local (or short form pg.data)',
      'pg (resolves only same-namespace)',
      'data.pg.cluster.local',
      'pg.app.svc.cluster.local'
    ),
    correct: ['a'],
    explanation: 'Cross-namespace access uses `<svc>.<ns>` or the FQDN `<svc>.<ns>.svc.cluster.local`. The bare name only resolves within the caller\'s own namespace.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about NetworkPolicies.',
    options: opts4(
      'They are namespaced resources.',
      'Without a policy selecting a Pod, the Pod allows all traffic by default.',
      'Selecting a Pod with policyTypes Ingress and no ingress rules denies all ingress to it.',
      'NetworkPolicies are enforced even when the CNI plugin does not support them.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'NetworkPolicies are namespaced and additive; an unselected Pod defaults to allow-all; a selected Pod with empty ingress rules is default-deny ingress. Enforcement REQUIRES a policy-capable CNI (Calico, Cilium, etc.).',
    references: [REF_NP]
  }
];


// P4 CKAD 2026 Sample - 2 per domain, domain tag + suggested answer
const P4: Q[] = [
  { domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An application needs a sidecar container that starts AFTER the main app container. Which pod field controls start ordering?',
    options: [{ id: 'a', text: 'initContainers with a RestartPolicy: Always' }, { id: 'b', text: 'spec.containers in reverse order' }, { id: 'c', text: 'postStart lifecycle hook on the sidecar' }, { id: 'd', text: 'spec.initContainers; sidecar listed first with restartPolicy: Always (Kubernetes 1.29+)' }],
    correct: ['d'],
    explanation: 'Correct option: initContainers with restartPolicy: Always\nKubernetes 1.29 added native sidecar support via initContainers with restartPolicy: Always. The init container runs first and stays running alongside the main container.\n\nIncorrect options:\nReverse container order - containers start concurrently, order is not guaranteed.\npostStart hook - runs in the same container, not for cross-container ordering.\nspec.containers order - no ordering guarantee.',
    references: [{ label: 'Kubernetes Docs - Init Containers', url: 'https://kubernetes.io/docs/concepts/workloads/pods/init-containers/' }, { label: 'Kubernetes Docs - Pod Design Patterns', url: 'https://kubernetes.io/docs/concepts/workloads/pods/#workload-resources-for-managing-pods' }] },
  { domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'A batch pipeline needs to run 6 tasks in parallel, retrying each failed task up to 3 times. Which TWO Job spec fields configure this?',
    options: [{ id: 'a', text: 'spec.parallelism: 6' }, { id: 'b', text: 'spec.backoffLimit: 3' }, { id: 'c', text: 'spec.completions: 6' }, { id: 'd', text: 'spec.ttlSecondsAfterFinished: 3' }, { id: 'e', text: 'spec.activeDeadlineSeconds: 6' }],
    correct: ['a', 'b'],
    explanation: 'Correct options:\nparallelism: 6 - runs up to 6 pods simultaneously.\nbackoffLimit: 3 - retries each failed pod up to 3 times before marking it failed.\n\nIncorrect options:\ncompletions - total number of successful completions required, not parallel slots.\nttlSecondsAfterFinished - deletes the job after it finishes, not retry logic.\nactiveDeadlineSeconds - overall timeout for the Job.',
    references: [{ label: 'Kubernetes Docs - Jobs', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/' }] },
  { domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'You run: kubectl set image deployment/api app=myapp:2.0. The rollout hangs. Which command shows rollout progress?',
    options: [{ id: 'a', text: 'kubectl describe pod -l app=api' }, { id: 'b', text: 'kubectl rollout status deployment/api' }, { id: 'c', text: 'kubectl get replicasets -o wide' }, { id: 'd', text: 'kubectl top pod -l app=api' }],
    correct: ['b'],
    explanation: 'Correct option: kubectl rollout status deployment/api\nThis command streams rollout events and exits 0 when complete or non-zero when stuck, making it the standard check.\n\nIncorrect options:\nkubectl describe pod - shows individual pod events, not overall rollout state.\nkubectl get replicasets - shows replicas counts but not rollout readiness.\nkubectl top pod - shows CPU/memory, not rollout state.',
    references: [{ label: 'Kubernetes Docs - Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' }] },
  { domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A Helm release upgrade fails and rolls back automatically. Where do you look to find the exact manifests from the previous successful release?',
    options: [{ id: 'a', text: 'kubectl get configmap -n kube-system -l owner=helm' }, { id: 'b', text: 'helm history <release> and helm get manifest <release> --revision <N>' }, { id: 'c', text: 'kubectl describe helmrelease <release>' }, { id: 'd', text: 'cat ~/.helm/releases/<release>.yaml' }],
    correct: ['b'],
    explanation: 'Correct option: helm history and helm get manifest\nHelm stores each revision in a Secret. helm history lists them; helm get manifest --revision N retrieves the exact rendered manifests.\n\nIncorrect options:\nConfigMap with owner=helm - Helm 3 uses Secrets not ConfigMaps.\nkubectl describe helmrelease - only valid when Flux HelmRelease CRD is present.\n~/.helm/releases - no such standard path exists.',
    references: [{ label: 'Helm Docs - Charts', url: 'https://helm.sh/docs/topics/charts/' }] },
  { domain: OBSERV, difficulty: 2, type: QType.SINGLE,
    stem: 'A pod restarts every few minutes. Which probe, when failing, causes Kubernetes to restart the container?',
    options: [{ id: 'a', text: 'readinessProbe' }, { id: 'b', text: 'startupProbe' }, { id: 'c', text: 'livenessProbe' }, { id: 'd', text: 'healthProbe' }],
    correct: ['c'],
    explanation: 'Correct option: livenessProbe\nA failing liveness probe triggers a container restart by the kubelet.\n\nIncorrect options:\nreadinessProbe - failing removes pod from Service endpoints but does NOT restart container.\nstartupProbe - only active during startup; failure restarts container but only once during init.\nhealthProbe - not a real Kubernetes probe type.',
    references: [{ label: 'Kubernetes Docs - Probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/' }] },
  { domain: OBSERV, difficulty: 3, type: QType.MULTI,
    stem: 'You need container logs to be shipped to a central log aggregator without modifying the application image. Which TWO approaches are standard CKAD patterns?',
    options: [{ id: 'a', text: 'A logging sidecar container that tails /var/log and forwards' }, { id: 'b', text: 'A node-level DaemonSet log agent reading /var/log/containers' }, { id: 'c', text: 'Mounting the application log file into a shared emptyDir and reading from main container' }, { id: 'd', text: 'Setting LOG_LEVEL=DEBUG environment variable in the container spec' }, { id: 'e', text: 'Changing the container CMD to pipe stdout through a log forwarder' }],
    correct: ['a', 'b'],
    explanation: 'Correct options:\nLogging sidecar - co-located container in same pod tailing log files via shared volume; standard multi-container pattern.\nDaemonSet log agent - node-level agent (Fluentd, Fluent Bit) reads all container logs without pod changes.\n\nIncorrect options:\nShared emptyDir read from main container - that is the same container not a separate shipper.\nLOG_LEVEL env var - changes verbosity, not destination.\nPipe stdout - modifies the image CMD which the question disallows.',
    references: [{ label: 'Kubernetes Docs - Logging', url: 'https://kubernetes.io/docs/concepts/cluster-administration/logging/' }, { label: 'Kubernetes Docs - Pod Design Patterns', url: 'https://kubernetes.io/docs/concepts/workloads/pods/#workload-resources-for-managing-pods' }] },
  { domain: CONFIG, difficulty: 2, type: QType.SINGLE,
    stem: 'A Secret named db-creds contains key password. How do you expose it as env var DB_PASSWORD in a pod spec?',
    options: [{ id: 'a', text: 'env: [{name: DB_PASSWORD, value: $(db-creds.password)}]' }, { id: 'b', text: 'env: [{name: DB_PASSWORD, valueFrom: {secretKeyRef: {name: db-creds, key: password}}}]' }, { id: 'c', text: 'envFrom: [{secretRef: {name: password}}]' }, { id: 'd', text: 'volumes: [{secret: {secretName: db-creds}}] and mount it' }],
    correct: ['b'],
    explanation: 'Correct option: secretKeyRef\nInjects a single key from the Secret as an environment variable with the specified name.\n\nIncorrect options:\n$(db-creds.password) - not valid substitution syntax for Secrets.\nenvFrom with secretRef name: password - name must be the Secret name db-creds, not the key name.\nVolume mount - exposes Secret as files, not env vars.',
    references: [{ label: 'Kubernetes Docs - Secrets', url: 'https://kubernetes.io/docs/concepts/configuration/secret/' }, { label: 'Kubernetes Docs - ConfigMaps', url: 'https://kubernetes.io/docs/concepts/configuration/configmap/' }] },
  { domain: CONFIG, difficulty: 3, type: QType.MULTI,
    stem: 'A container must run as UID 1000 and be prevented from escalating privileges. Which TWO securityContext fields achieve this?',
    options: [{ id: 'a', text: 'runAsUser: 1000' }, { id: 'b', text: 'allowPrivilegeEscalation: false' }, { id: 'c', text: 'privileged: false' }, { id: 'd', text: 'runAsNonRoot: true' }, { id: 'e', text: 'capabilities: {drop: [ALL]}' }],
    correct: ['a', 'b'],
    explanation: 'Correct options:\nrunAsUser: 1000 - sets the UID the container process runs as.\nallowPrivilegeEscalation: false - prevents the process gaining more privileges than its parent (blocks setuid binaries).\n\nIncorrect options:\nprivileged: false - default value; does not actively restrict escalation.\nrunAsNonRoot: true - only validates UID != 0, does not set a specific UID.\ncapabilities drop ALL - good hardening but not specifically required for UID or escalation prevention.',
    references: [{ label: 'Kubernetes Docs - SecurityContext', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/' }, { label: 'Kubernetes Docs - ServiceAccounts', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/' }] },
  { domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A Deployment serves HTTP on port 8080. What is the minimum Service spec to expose it cluster-internally as port 80?',
    options: [{ id: 'a', text: 'type: NodePort, port: 80, targetPort: 8080' }, { id: 'b', text: 'type: ClusterIP, port: 80, targetPort: 8080, selector matching the pods' }, { id: 'c', text: 'type: LoadBalancer, port: 80' }, { id: 'd', text: 'type: ExternalName, externalName: myapp.default.svc' }],
    correct: ['b'],
    explanation: 'Correct option: ClusterIP port 80 targetPort 8080\nClusterIP is the default type and provides cluster-internal DNS. port: 80 is what clients call; targetPort: 8080 is what pods listen on.\n\nIncorrect options:\nNodePort - also works but exposes on every node IP which is not minimal for cluster-internal access.\nLoadBalancer - provisions external cloud LB, not needed for internal-only access.\nExternalName - maps to an external DNS name, not to local pods.',
    references: [{ label: 'Kubernetes Docs - Services', url: 'https://kubernetes.io/docs/concepts/services-networking/service/' }] },
  { domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy in namespace payments allows ingress only from pods with label role=frontend. A pod labelled role=backend tries to connect. What happens?',
    options: [{ id: 'a', text: 'Connection allowed because both pods are in the same namespace' }, { id: 'b', text: 'Connection denied because the backend pod does not match the ingress podSelector' }, { id: 'c', text: 'Connection allowed because NetworkPolicy only applies to egress by default' }, { id: 'd', text: 'Connection denied because namespace isolation is always enabled' }],
    correct: ['b'],
    explanation: 'Correct option: Connection denied - podSelector mismatch\nThe NetworkPolicy whitelists only pods with role=frontend in ingress. The role=backend pod does not match so its traffic is dropped.\n\nIncorrect options:\nSame namespace - namespace membership does not grant access when a NetworkPolicy is present.\nEgress-only default - NetworkPolicy with policyTypes Ingress (or inferred) restricts inbound traffic.\nNamespace isolation always on - without any NetworkPolicy all traffic is allowed.',
    references: [{ label: 'Kubernetes Docs - NetworkPolicies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/' }] },
];

const CKAD_DOMAINS = [
  { name: DESIGN, weight: 20 },
  { name: DEPLOY, weight: 20 },
  { name: OBSERV, weight: 15 },
  { name: CONFIG, weight: 25 },
  { name: NET, weight: 20 }
];

const CKAD_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'linuxfoundation-ckad-p1',
    code: 'CKAD-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering Pods, Deployments, Jobs, ConfigMaps/Secrets, SecurityContexts, ServiceAccounts, probes, multi-container patterns, Services, NetworkPolicies, and Ingress.',
    questions: P1
  },
  {
    slug: 'linuxfoundation-ckad-p2',
    code: 'CKAD-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'linuxfoundation-ckad-p4',
    code: 'CKAD-P4',
    titleSuffix: 'Practice Exam 4 - 2026 Sample (2 per domain)',
    descriptionSuffix: 'Two questions per domain tagged with the CKAD blueprint. Each has a full suggested answer. CKAD v1.35 / 2026 aligned.',
    questions: P4
  },
  {
    slug: 'linuxfoundation-ckad-p3',
    code: 'CKAD-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const CKAD_BUNDLE = {
  slug: 'linuxfoundation-ckad',
  title: 'Certified Kubernetes Application Developer (CKAD)',
  description: 'All 3 CKAD practice exams in one bundle — covering application design & build, deployment, observability & maintenance, environment/configuration/security, and services & networking, aligned to CNCF CKAD v1.35.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 39500 // USD 395 — VOUCHER tier (matches CKAD real-exam fee)
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CKAD bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:ckad-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedCkad(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'linuxfoundation' } });
  await db.vendor.upsert({
    where: { slug: 'linuxfoundation' },
    update: { name: 'Linux Foundation', description: 'CNCF / Linux Foundation certifications — CKAD, CKA, CKS, and other open-source ecosystem credentials.' },
    create: { slug: 'linuxfoundation', name: 'Linux Foundation', description: 'CNCF / Linux Foundation certifications — CKAD, CKA, CKS, and other open-source ecosystem credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'linuxfoundation' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of CKAD_EXAMS) {
    const title = `Certified Kubernetes Application Developer (CKAD) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to CNCF CKAD v1.35.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 120,
      passingScore: 66,
      questionCount: e.questions.length,
      domains: CKAD_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:ckad-seed' } });
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
          generatedBy: 'manual:ckad-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: CKAD_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CKAD_BUNDLE.slug },
    update: {
      title: CKAD_BUNDLE.title,
      description: CKAD_BUNDLE.description,
      price: CKAD_BUNDLE.price,
      priceVoucher: CKAD_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: CKAD_BUNDLE.slug,
      title: CKAD_BUNDLE.title,
      description: CKAD_BUNDLE.description,
      price: CKAD_BUNDLE.price,
      priceVoucher: CKAD_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'linuxfoundation-ckad-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'linuxfoundation-ckad-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'linuxfoundation-ckad-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'linuxfoundation-ckad-p4', tier: 'PRACTICE' as const, position: 4 },
    { examSlug: 'linuxfoundation-ckad-p1', tier: 'VOUCHER' as const, position: 5 }
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
