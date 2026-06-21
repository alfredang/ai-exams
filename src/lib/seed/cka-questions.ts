/**
 * CKA bundle seed — vendor, three practice-exam variants, bundle, and 60
 * blueprint-aligned questions. Idempotent: replaces rows tagged
 * `generatedBy: 'manual:cka-seed'` and upserts catalog rows.
 *
 * Exported as `seedCka(db)` so the same code path is reachable from the
 * standalone CLI shim (`prisma/seeds/cka.ts`) and the protected admin API
 * (`/api/admin/seed-cka`) — letting us bootstrap the production database
 * without redeploying.
 *
 * Content references the public TGS-2025054612-CKA prep labs and the
 * CNCF CKA v1.32 blueprint:
 *   - Cluster Architecture, Installation and Configuration — 25% (5)
 *   - Workloads and Scheduling                             — 15% (3)
 *   - Services and Networking                              — 20% (4)
 *   - Storage                                              — 10% (2)
 *   - Troubleshooting                                      — 30% (6)
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

const CLUSTER = 'Cluster Architecture, Installation and Configuration';
const WORK = 'Workloads and Scheduling';
const NET = 'Services and Networking';
const STORE = 'Storage';
const TS = 'Troubleshooting';

const REF_KUBEADM = { label: 'Kubernetes Docs — kubeadm', url: 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/' };
const REF_RBAC = { label: 'Kubernetes Docs — RBAC', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/' };
const REF_HELM = { label: 'Helm Docs — Charts', url: 'https://helm.sh/docs/topics/charts/' };
const REF_CRD = { label: 'Kubernetes Docs — Custom Resources', url: 'https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/' };
const REF_ETCD = { label: 'Kubernetes Docs — Operating etcd', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/' };
const REF_UPGRADE = { label: 'Kubernetes Docs — Upgrading kubeadm clusters', url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/' };
const REF_CNI = { label: 'Kubernetes Docs — Network Plugins (CNI)', url: 'https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/' };
const REF_CRI = { label: 'Kubernetes Docs — Container Runtimes', url: 'https://kubernetes.io/docs/setup/production-environment/container-runtimes/' };
const REF_TAINT = { label: 'Kubernetes Docs — Taints and Tolerations', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/' };
const REF_AFFIN = { label: 'Kubernetes Docs — Assigning Pods to Nodes', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/' };
const REF_DEPLOY = { label: 'Kubernetes Docs — Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' };
const REF_DS = { label: 'Kubernetes Docs — DaemonSet', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/' };
const REF_HPA = { label: 'Kubernetes Docs — Horizontal Pod Autoscaling', url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/' };
const REF_PRIO = { label: 'Kubernetes Docs — Pod Priority and Preemption', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/' };
const REF_RES = { label: 'Kubernetes Docs — Resource Management', url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/' };
const REF_SVC = { label: 'Kubernetes Docs — Services', url: 'https://kubernetes.io/docs/concepts/services-networking/service/' };
const REF_ING = { label: 'Kubernetes Docs — Ingress', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/' };
const REF_GW = { label: 'Kubernetes Docs — Gateway API', url: 'https://gateway-api.sigs.k8s.io/' };
const REF_NP = { label: 'Kubernetes Docs — Network Policies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/' };
const REF_DNS = { label: 'Kubernetes Docs — DNS for Services and Pods', url: 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/' };
const REF_PV = { label: 'Kubernetes Docs — Persistent Volumes', url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/' };
const REF_SC = { label: 'Kubernetes Docs — Storage Classes', url: 'https://kubernetes.io/docs/concepts/storage/storage-classes/' };
const REF_VOL = { label: 'Kubernetes Docs — Volumes', url: 'https://kubernetes.io/docs/concepts/storage/volumes/' };
const REF_LOGS = { label: 'Kubernetes Docs — Logging Architecture', url: 'https://kubernetes.io/docs/concepts/cluster-administration/logging/' };
const REF_DEBUG = { label: 'Kubernetes Docs — Troubleshooting Clusters', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/' };
const REF_KCTL = { label: 'Kubernetes Docs — kubectl Reference', url: 'https://kubernetes.io/docs/reference/kubectl/' };
const REF_APISVR = { label: 'Kubernetes Docs — kube-apiserver Static Pods', url: 'https://kubernetes.io/docs/tasks/administer-cluster/control-plane-flags/' };

const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Cluster Architecture, Installation & Configuration (5) ──
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Helm command renders a chart locally to YAML (without installing it) so you can inspect or commit the manifests?',
    options: opts4(
      'helm install --dry-run --debug',
      'helm template <release> <chart>',
      'helm render <release> <chart>',
      'helm get manifest <release>'
    ),
    correct: ['b'],
    explanation: '`helm template` renders the chart to stdout without contacting a cluster. `helm install --dry-run` simulates an install but still requires a kubeconfig and release name; `helm get manifest` reads back an installed release.',
    references: [REF_HELM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'To install argo-cd 7.7.3 with the CRDs already managed separately, which value should be passed?',
    options: opts4(
      '--set crds.install=false',
      '--skip-crds',
      '--no-hooks',
      '--set createNamespace=false'
    ),
    correct: ['a'],
    explanation: 'The argo-cd chart exposes `crds.install` to decouple CRD lifecycle from the release. `--skip-crds` is a Helm-level flag that does not exist on `template`/`install` for arbitrary charts in the same way; the chart-specific value is the documented path.',
    references: [REF_HELM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to extract every CustomResourceDefinition installed by cert-manager into a single YAML file. Which command works?',
    options: opts4(
      'kubectl get crd cert-manager -o yaml > resources.yaml',
      'kubectl get crd | grep cert-manager | awk \'{print $1}\' | xargs -I{} kubectl get crd {} -o yaml >> resources.yaml',
      'kubectl explain crd --recursive > resources.yaml',
      'kubectl describe crd > resources.yaml'
    ),
    correct: ['b'],
    explanation: 'The filter-and-xargs pipeline lists every CRD whose name contains `cert-manager` and exports each as YAML. `kubectl describe` is human-formatted, not re-applicable; `kubectl explain` documents schema, not instances.',
    references: [REF_CRD]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.SINGLE,
    stem: 'You are migrating worker nodes from containerd to cri-dockerd (Mirantis). After installing the `cri-dockerd` package, which command persists the kernel-module/sysctl prerequisites across reboots?',
    options: opts4(
      'echo \'net.ipv4.ip_forward=1\' > /etc/sysctl.conf',
      'Create /etc/sysctl.d/cka.conf with the needed entries and run `sudo sysctl --system`',
      'kubeadm config images pull',
      'systemctl edit kubelet to add `--ip-forward=1`'
    ),
    correct: ['b'],
    explanation: 'Drop-in files under `/etc/sysctl.d/` are reloaded by `sysctl --system`, persisting `net.bridge.bridge-nf-call-iptables`, `net.ipv4.ip_forward`, etc. Editing `/etc/sysctl.conf` works but is discouraged; the others are unrelated.',
    references: [REF_CRI]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Kubernetes control plane.',
    options: opts4(
      'kube-apiserver is the only component that talks directly to etcd in a default kubeadm install.',
      'kube-scheduler watches for unscheduled Pods and assigns them to nodes via the apiserver.',
      'kube-controller-manager runs as a Deployment in kube-system.',
      'etcd is the cluster\'s single source of truth for object state.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'On kubeadm clusters, control-plane components run as **static Pods** managed by the kubelet from `/etc/kubernetes/manifests/`, NOT as Deployments. The other three statements are correct.',
    references: [REF_KUBEADM, REF_ETCD]
  },

  // ── Workloads and Scheduling (3) ──
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Deployment must have a sidecar that tails a log file the main container writes. Which volume type lets both containers share the file inside the Pod?',
    options: opts4(
      'hostPath',
      'emptyDir',
      'configMap',
      'persistentVolumeClaim (RWO)'
    ),
    correct: ['b'],
    explanation: '`emptyDir` is created when the Pod is bound to a node and is shared by every container in the Pod — the standard pattern for sidecar log tailing. hostPath ties to the node filesystem; PVC RWO is unnecessary overhead for ephemeral logs.',
    references: [REF_VOL]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You taint `node01` with `IT=Kiddie:NoSchedule`. Which toleration on a Pod is necessary and sufficient for it to schedule there?',
    options: opts4(
      '`{ key: "IT", operator: "Exists", effect: "NoExecute" }`',
      '`{ key: "IT", operator: "Equal", value: "Kiddie", effect: "NoSchedule" }`',
      '`{ key: "Kiddie", operator: "Equal", value: "IT", effect: "NoSchedule" }`',
      'No toleration is needed; taints affect only existing Pods.'
    ),
    correct: ['b'],
    explanation: 'A toleration must match the taint exactly on key/value/effect (or use the Exists operator with matching key + effect). NoSchedule blocks new scheduling; NoExecute additionally evicts running Pods.',
    references: [REF_TAINT]
  },
  {
    domain: WORK, difficulty: 4, type: QType.SINGLE,
    stem: 'You create a PriorityClass `high-priority` with value 9_999_999 and patch Deployment `busybox-logger` to use it. The Pods are not preempting lower-priority Pods. What is the MOST likely cause?',
    options: opts4(
      'You need to set `preemptionPolicy: Never`.',
      'The Deployment\'s existing ReplicaSet still references the old template — restart the rollout (e.g. `kubectl rollout restart deploy busybox-logger`).',
      'PriorityClasses below 1_000_000_000 are ignored.',
      'PriorityClass only affects DaemonSets.'
    ),
    correct: ['b'],
    explanation: 'Patching the Deployment spec updates the template but the running Pods belong to the previous ReplicaSet; a `rollout restart` (or any change that creates a new RS) is needed to roll the Pods over with the new priority. Priority is honored on scheduling/preemption.',
    references: [REF_PRIO]
  },

  // ── Services and Networking (4) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command exposes Deployment `frontend` on a port reachable on every node\'s IP at a high (30000–32767) port?',
    options: opts4(
      'kubectl expose deploy frontend --type=ClusterIP --port=80',
      'kubectl expose deploy frontend --type=NodePort --port=80',
      'kubectl expose deploy frontend --type=ExternalName --port=80',
      'kubectl expose deploy frontend --type=Headless --port=80'
    ),
    correct: ['b'],
    explanation: 'NodePort allocates a port from `--service-node-port-range` (default 30000–32767) on every node. ClusterIP is internal-only; ExternalName is a CNAME alias; "Headless" is `clusterIP: None`, not a type.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress for the nginx-ingress controller routes `/echo` on host `example.org` to Service `echoserver-service:8080`. From outside the cluster on a NodePort install, the correct test command is:',
    options: opts4(
      'curl http://example.org:80/echo',
      'curl -H "Host: example.org" http://<node-ip>:<ingress-nodeport>/echo',
      'curl http://<service-cluster-ip>:8080/echo',
      'curl --resolve example.org:80:127.0.0.1 http://example.org/echo'
    ),
    correct: ['b'],
    explanation: 'Without DNS, you must hit the ingress-nginx controller\'s NodePort on any node IP and pass `Host: example.org` so the Ingress host rule matches. Hitting the backend Service cluster IP bypasses the Ingress and ignores the path rule.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to terminate TLS at the cluster edge using the Gateway API and the nginx-gateway-fabric controller. Which Gateway listener config is correct?',
    options: opts4(
      'protocol: HTTPS, port: 443, tls.mode: Passthrough, certificateRefs omitted',
      'protocol: HTTPS, port: 443, tls.mode: Terminate, certificateRefs: [{ kind: Secret, name: web-tls }]',
      'protocol: TLS, port: 443, tls.mode: Terminate, certificateRefs omitted',
      'protocol: HTTP, port: 443, tls.mode: Terminate'
    ),
    correct: ['b'],
    explanation: 'TLS termination requires `tls.mode: Terminate` plus a Secret of type `kubernetes.io/tls` via `certificateRefs`. Passthrough forwards the TLS connection unmodified. Listener protocol must be HTTPS for HTTPRoute attachment.',
    references: [REF_GW]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'A NetworkPolicy in namespace `backend` selects pods labelled `app=backend` and allows ingress from pods labelled `app=frontend` in namespace `frontend`. Select ALL true statements.',
    options: opts4(
      'The `from` list must combine a namespaceSelector and a podSelector inside a single peer object (AND), not as separate items (OR).',
      'Two separate peer items {namespaceSelector}, {podSelector} mean "any pod from that namespace OR any pod in this namespace with that label".',
      'A CNI implementing NetworkPolicy (e.g. Calico, Cilium) must be installed.',
      'The policy implicitly allows all egress from the backend pods.'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'All four are true. Combining selectors inside one `from` peer object is AND; separate items are OR. Egress is only restricted if the policy lists `policyTypes: [Egress]`.',
    references: [REF_NP]
  },

  // ── Storage (2) ──
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which annotation marks a StorageClass as the cluster default?',
    options: opts4(
      'storageclass.kubernetes.io/is-default-class: "true"',
      'storage.k8s.io/default: "yes"',
      'kubernetes.io/default-sc: "true"',
      'volume.beta.kubernetes.io/default: "true"'
    ),
    correct: ['a'],
    explanation: 'The default StorageClass is identified by the annotation `storageclass.kubernetes.io/is-default-class: "true"`. At most one default should be set at a time; PVCs without `storageClassName` use it.',
    references: [REF_SC]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A PersistentVolume is `Released` with reclaimPolicy `Retain` and a stale `claimRef`. A new PVC matches it on size and storageClassName but binding fails. What MUST you do to allow rebind?',
    options: opts4(
      'Delete the PV.',
      'Edit the PV and remove the `spec.claimRef` block.',
      'Change reclaim policy to `Delete`.',
      'Scale the workload to zero and back.'
    ),
    correct: ['b'],
    explanation: 'A Retained PV keeps its `claimRef` even after the original PVC is gone, blocking new bindings. Remove `claimRef` (and any obsolete `pv.kubernetes.io/bind-completed` annotation) so the PV returns to `Available`.',
    references: [REF_PV]
  },

  // ── Troubleshooting (6) ──
  {
    domain: TS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'On a kubeadm control-plane node, the apiserver static Pod manifest lives at:',
    options: opts4(
      '/etc/kubernetes/manifests/kube-apiserver.yaml',
      '/etc/kubernetes/static/kube-apiserver.yaml',
      '/var/lib/kubelet/config/kube-apiserver.yaml',
      '/etc/systemd/system/kube-apiserver.service'
    ),
    correct: ['a'],
    explanation: 'kubeadm places control-plane static Pod manifests in `/etc/kubernetes/manifests/`. The kubelet watches this directory and (re)starts the corresponding Pods as files change.',
    references: [REF_APISVR]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'The apiserver is down because `--etcd-servers=https://127.0.0.1:2380` was set in the static Pod manifest. Which is the correct fix?',
    options: opts4(
      'Set `--etcd-servers=https://127.0.0.1:2379` (etcd client port) in /etc/kubernetes/manifests/kube-apiserver.yaml',
      'Restart docker',
      'Run `kubeadm reset`',
      'Add `--insecure-port=8080` to the manifest'
    ),
    correct: ['a'],
    explanation: 'etcd serves clients on **2379** and peer traffic on **2380**. The apiserver must connect to the client port. After saving the manifest the kubelet recreates the static Pod automatically.',
    references: [REF_ETCD, REF_APISVR]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A pod is in `Pending` with the event "0/3 nodes are available: 3 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }". The fix that is MOST appropriate for a normal workload is:',
    options: opts4(
      'Add a toleration for the control-plane taint to the Pod.',
      'Schedule the Pod on a worker node by removing the nodeSelector or adding a worker label.',
      'Remove the control-plane taint from all nodes.',
      'Set `spec.hostNetwork: true`.'
    ),
    correct: ['b'],
    explanation: 'The control-plane taint exists to keep general workloads off the control plane. Either add a worker to the cluster or remove the targeting constraint that forces it onto control plane. Removing the taint cluster-wide is bad practice for production.',
    references: [REF_TAINT]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: '`kubectl logs <pod>` returns "Error from server (BadRequest): previous terminated container ... not found". The container has only ever started once and is currently Running. Which flag explains the error?',
    options: opts4(
      '--follow',
      '--previous',
      '--tail=0',
      '--all-containers'
    ),
    correct: ['b'],
    explanation: '`--previous` asks the kubelet for the prior instance\'s logs, which only exist after at least one restart. The fix is to drop `--previous` (or wait for a restart).',
    references: [REF_LOGS]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: 'A node is `NotReady`. You SSH in and check `systemctl status kubelet` — it is failing to start with "open /var/lib/kubelet/config.yaml: no such file". The MOST likely root cause is:',
    options: opts4(
      'The container runtime is not installed.',
      'The node was never bootstrapped via `kubeadm join` (or its config was deleted).',
      'kube-proxy is crashing.',
      'CoreDNS is misconfigured.'
    ),
    correct: ['b'],
    explanation: '`kubeadm join` writes `/var/lib/kubelet/config.yaml` from the cluster\'s kubelet-config ConfigMap. If absent, the node has not been joined or its files were removed.',
    references: [REF_KUBEADM, REF_DEBUG]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: 'A pod has `requests.memory: 200Mi, limits.memory: 256Mi`. It restarts with `OOMKilled` under load. Which is the safest first remediation?',
    options: opts4(
      'Increase the memory LIMIT after profiling.',
      'Increase the memory REQUEST only.',
      'Add `--oom-score-adj=-1000` to the kubelet.',
      'Disable the liveness probe.'
    ),
    correct: ['a'],
    explanation: 'OOMKilled means the container exceeded its `limits.memory`. Profile actual usage and raise the limit. Increasing only the request changes scheduling but not the cgroup memory cap.',
    references: [REF_RES]
  },

  // ── Cluster Architecture, Installation & Configuration (+11) ──
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'Before running `kubeadm init`, swap must be disabled. Which command disables it for the current boot?',
    options: opts4(
      'swapoff -a',
      'systemctl disable swap',
      'kubeadm config swap off',
      'sysctl -w vm.swappiness=0'
    ),
    correct: ['a'],
    explanation: '`swapoff -a` disables all swap immediately. To persist across reboots you also comment the swap entry in `/etc/fstab`. `vm.swappiness=0` only discourages swapping; it does not disable it.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command prints the join command (with token and CA hash) for adding a new worker to an existing kubeadm cluster?',
    options: opts4(
      'kubeadm token create --print-join-command',
      'kubeadm join --generate',
      'kubectl get token -n kube-system',
      'kubeadm init phase bootstrap-token'
    ),
    correct: ['a'],
    explanation: '`kubeadm token create --print-join-command` mints a fresh bootstrap token and prints the full `kubeadm join` line including `--discovery-token-ca-cert-hash`. Tokens default to a 24h TTL.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'You must give ServiceAccount `ci` in namespace `build` permission to create Jobs in that namespace only. The correct binding subject is:',
    options: opts4(
      'kind: User, name: ci',
      'kind: ServiceAccount, name: ci, namespace: build',
      'kind: Group, name: system:serviceaccounts',
      'kind: ServiceAccount, name: system:ci'
    ),
    correct: ['b'],
    explanation: 'A RoleBinding subject for a ServiceAccount uses `kind: ServiceAccount` with the `name` and `namespace`. Binding to the broad `system:serviceaccounts` group would over-grant to every SA.',
    references: [REF_RBAC]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'After editing `/etc/kubernetes/manifests/kube-apiserver.yaml`, how does the change take effect?',
    options: opts4(
      'Run `systemctl restart kube-apiserver`.',
      'The kubelet detects the file change and recreates the static Pod automatically.',
      'Run `kubectl rollout restart -n kube-system deploy/kube-apiserver`.',
      'Run `kubeadm upgrade apply`.'
    ),
    correct: ['b'],
    explanation: 'The kubelet watches `/etc/kubernetes/manifests/` and restarts the corresponding static Pod whenever the manifest changes. There is no systemd unit or Deployment for control-plane components on kubeadm clusters.',
    references: [REF_APISVR]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which etcdctl invocation correctly takes a snapshot when etcd uses client TLS certificates?',
    options: opts4(
      'ETCDCTL_API=3 etcdctl snapshot save /backup/snap.db --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key',
      'etcdctl backup --data-dir /var/lib/etcd',
      'kubectl exec etcd -- snapshot save',
      'ETCDCTL_API=2 etcdctl snapshot save /backup/snap.db'
    ),
    correct: ['a'],
    explanation: 'API v3 snapshots require `--endpoints` plus the CA, client cert, and key. The legacy `etcdctl backup` and API v2 do not produce a v3 snapshot usable by `snapshot restore`.',
    references: [REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to cordon `node01` so the scheduler stops placing NEW Pods there but existing Pods keep running. The command is:',
    options: opts4(
      'kubectl drain node01',
      'kubectl cordon node01',
      'kubectl taint node node01 key=val:NoExecute',
      'kubectl delete node node01'
    ),
    correct: ['b'],
    explanation: '`kubectl cordon` marks the node `SchedulingDisabled` without evicting Pods. `drain` additionally evicts Pods; a NoExecute taint would evict non-tolerating Pods.',
    references: [REF_KCTL]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.SINGLE,
    stem: 'You must restore an etcd snapshot to recover a cluster. Before pointing the etcd static Pod at the restored data directory, you should:',
    options: opts4(
      'Leave the apiserver running so it can replay the WAL.',
      'Stop the kube-apiserver (move its manifest out of /etc/kubernetes/manifests) so it does not write during the restore.',
      'Delete /var/lib/kubelet.',
      'Run `kubeadm reset` first.'
    ),
    correct: ['b'],
    explanation: 'During an etcd restore the apiserver must not be writing to etcd. Moving the apiserver (and etcd) static-Pod manifests out, performing the restore, then restoring the manifests is the safe sequence.',
    references: [REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'On the first control-plane node you run `kubeadm upgrade apply v1.32.1`. To upgrade an additional control-plane node you then run:',
    options: opts4(
      'kubeadm upgrade apply v1.32.1 again',
      'kubeadm upgrade node',
      'kubeadm init --upgrade',
      'kubeadm join --upgrade'
    ),
    correct: ['b'],
    explanation: 'Only the first control-plane node runs `kubeadm upgrade apply`. Every other control-plane and worker node runs `kubeadm upgrade node`, then upgrades the kubelet/kubectl packages.',
    references: [REF_UPGRADE]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows whether control-plane component certificates managed by kubeadm are close to expiring?',
    options: opts4(
      'kubeadm certs check-expiration',
      'kubectl get certificates -A',
      'openssl verify /etc/kubernetes/admin.conf',
      'kubeadm config view'
    ),
    correct: ['a'],
    explanation: '`kubeadm certs check-expiration` lists every kubeadm-managed certificate and its expiry. `kubeadm certs renew` renews them. `kubectl get certificates` lists cert-manager CRs, not control-plane PKI.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about kubeconfig files.',
    options: opts4(
      'A context binds a cluster, a user, and an optional namespace.',
      '`kubectl config use-context <name>` switches the active context.',
      'Client certificate data can be embedded base64 or referenced by file path.',
      'The KUBECONFIG env var can merge multiple kubeconfig files.'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'All four are correct. A context ties cluster+user(+namespace); `use-context` switches; credentials may be inline (`*-data`) or file paths; `KUBECONFIG=a:b:c` merges files at load time.',
    references: [REF_KCTL]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'On a default kubeadm cluster, kube-scheduler and kube-controller-manager run as Deployments in the kube-system namespace.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'False. They run as static Pods managed by the kubelet from `/etc/kubernetes/manifests/`, not as Deployments. Only add-ons like CoreDNS run as Deployments.',
    references: [REF_APISVR]
  },

  // ── Workloads and Scheduling (+7) ──
  {
    domain: WORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command scales Deployment `web` to 5 replicas imperatively?',
    options: opts4(
      'kubectl scale deploy web --replicas=5',
      'kubectl edit deploy web --replicas=5',
      'kubectl set replicas deploy/web 5',
      'kubectl patch deploy web --replicas 5'
    ),
    correct: ['a'],
    explanation: '`kubectl scale deploy web --replicas=5` directly updates the replica count. `kubectl set` has no `replicas` subcommand and `patch` needs a JSON/strategic merge body.',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod must only schedule on nodes labelled `disktype=ssd`. The simplest spec field is:',
    options: opts4(
      'spec.nodeName: ssd',
      'spec.nodeSelector: { disktype: ssd }',
      'spec.tolerations',
      'spec.priorityClassName: ssd'
    ),
    correct: ['b'],
    explanation: '`nodeSelector` is the simplest hard node-constraint, matching node labels exactly. `nodeName` pins to one specific node by name; tolerations relate to taints, not labels.',
    references: [REF_AFFIN]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A CronJob should run every 5 minutes. The correct `schedule` value is:',
    options: opts4(
      '"*/5 * * * *"',
      '"5 * * * *"',
      '"@every5m"',
      '"0/5 0 0 0 0"'
    ),
    correct: ['a'],
    explanation: 'CronJob uses standard cron syntax: `*/5 * * * *` means "every 5th minute". `5 * * * *` runs once per hour at minute 5.',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to roll back Deployment `api` to its previous revision after a bad image. The command is:',
    options: opts4(
      'kubectl rollout undo deploy/api',
      'kubectl rollout pause deploy/api',
      'kubectl delete deploy api && kubectl apply -f api.yaml',
      'kubectl set image deploy/api api=previous'
    ),
    correct: ['a'],
    explanation: '`kubectl rollout undo deploy/api` reverts to the prior ReplicaSet revision. Add `--to-revision=N` for a specific revision (see `kubectl rollout history`).',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about static Pods.',
    options: opts4(
      'They are defined by manifest files in the kubelet `staticPodPath` (default /etc/kubernetes/manifests).',
      'The apiserver creates a read-only mirror Pod so they appear in `kubectl get pods`.',
      'You can delete a static Pod with `kubectl delete pod` permanently.',
      'They are managed directly by the kubelet, not by a controller.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Deleting the mirror Pod via kubectl does NOT remove a static Pod — the kubelet recreates it; you must remove the manifest file. The other statements are correct.',
    references: [REF_APISVR]
  },
  {
    domain: WORK, difficulty: 4, type: QType.SINGLE,
    stem: 'A Deployment uses `strategy.type: Recreate`. During an image update, the rollout behavior is:',
    options: opts4(
      'New Pods come up before old Pods are terminated.',
      'All old Pods are terminated first, then new Pods are created (brief downtime).',
      'One Pod at a time is replaced.',
      'The update is rejected — Recreate is invalid for Deployments.'
    ),
    correct: ['b'],
    explanation: 'The `Recreate` strategy kills all existing Pods before creating new ones, causing a short outage. `RollingUpdate` is the default that avoids downtime via surge/unavailable controls.',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 2, type: QType.SINGLE,
    stem: 'A Job with `completions: 5` and `parallelism: 2` runs at most 2 Pods at a time until 5 succeed.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. `parallelism` caps concurrent Pods; `completions` is the total number of successful Pod runs required before the Job is complete.',
    references: [REF_DEPLOY]
  },

  // ── Services and Networking (+9) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Service of type ClusterIP is reachable:',
    options: opts4(
      'only from within the cluster',
      'from any external client on the node IP',
      'only from the control-plane nodes',
      'from the internet via the cloud load balancer'
    ),
    correct: ['a'],
    explanation: 'ClusterIP is the default type and is reachable only from inside the cluster (Pods/Nodes). External exposure requires NodePort, LoadBalancer, or an Ingress/Gateway.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'CoreDNS runs in kube-system. To verify in-cluster DNS, you exec a debug Pod and run:',
    options: opts4(
      'nslookup kubernetes.default.svc.cluster.local',
      'ping coredns',
      'curl http://kube-dns:53',
      'kubectl dns test'
    ),
    correct: ['a'],
    explanation: 'Resolving `kubernetes.default.svc.cluster.local` from a Pod confirms CoreDNS and the kube-dns Service work. ICMP/HTTP against DNS does not validate name resolution.',
    references: [REF_DNS]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A ClusterIP Service has a selector `app=web` but no endpoints appear. The MOST likely cause is:',
    options: opts4(
      'No running Pods carry the label `app=web` (or they are not Ready).',
      'kube-proxy is not installed.',
      'The Service needs a NodePort.',
      'CoreDNS is down.'
    ),
    correct: ['a'],
    explanation: 'Endpoints (EndpointSlices) are populated from Ready Pods matching the selector. A label mismatch or unready Pods yields an empty endpoint list and connection failures.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress resource exists but returns nothing. `kubectl get ingress` shows an empty ADDRESS column. The MOST likely cause is:',
    options: opts4(
      'No Ingress controller is installed/running to satisfy the Ingress.',
      'The Service is ClusterIP.',
      'TLS is not configured.',
      'The path type is Prefix.'
    ),
    correct: ['a'],
    explanation: 'An Ingress object is inert without a controller (ingress-nginx, etc.) watching and programming it. No controller means no ADDRESS and no routing.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You need an Ingress path that matches `/app` and any sub-path like `/app/x`. The pathType should be:',
    options: opts4(
      'Exact',
      'Prefix',
      'ImplementationSpecific only',
      'Regex'
    ),
    correct: ['b'],
    explanation: '`Prefix` matches the path element prefix, so `/app` also matches `/app/x`. `Exact` requires an exact string match; `Regex` is not a valid pathType value.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy should allow ingress to `app=db` Pods ONLY on TCP 5432. The rule includes:',
    options: opts4(
      'ports: [{ protocol: TCP, port: 5432 }] under an ingress rule',
      'egress: [{ ports: [{ port: 5432 }] }]',
      'policyTypes: [Egress] only',
      'a Service annotation `allow-port: 5432`'
    ),
    correct: ['a'],
    explanation: 'Port restrictions are declared in the `ports` list of an ingress (or egress) rule. Combined with a `from` peer this allows only matching sources on TCP 5432.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Service type creates a DNS CNAME to an external hostname with no proxying?',
    options: opts4(
      'ClusterIP',
      'NodePort',
      'ExternalName',
      'LoadBalancer'
    ),
    correct: ['c'],
    explanation: '`ExternalName` returns a CNAME record to the configured `externalName` hostname; kube-proxy does not proxy traffic and no cluster IP is allocated.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about kube-proxy.',
    options: opts4(
      'It programs iptables (or IPVS) rules to implement Service virtual IPs.',
      'It typically runs as a DaemonSet on every node.',
      'It resolves Service DNS names.',
      'In IPVS mode it provides additional load-balancing algorithms.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'DNS resolution is CoreDNS, not kube-proxy. kube-proxy implements Service VIP routing via iptables/IPVS and runs as a per-node DaemonSet; IPVS adds algorithms like rr/lc.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A headless Service is created by setting `spec.clusterIP: None`.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. With `clusterIP: None` and a selector, DNS returns the individual Pod A records instead of a single virtual IP — the basis for StatefulSet stable Pod DNS.',
    references: [REF_DNS]
  },

  // ── Storage (+5) ──
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A PVC stays `Pending` and `kubectl describe pvc` shows "no persistent volumes available for this claim and no storage class is set". The MOST likely cause is:',
    options: opts4(
      'No matching PV exists and no (default) StorageClass can dynamically provision one.',
      'The Pod is not scheduled.',
      'reclaimPolicy is Retain.',
      'The PVC requested ReadWriteMany.'
    ),
    correct: ['a'],
    explanation: 'Without a matching pre-provisioned PV and with no StorageClass (or default) for dynamic provisioning, the PVC cannot bind and stays Pending.',
    references: [REF_PV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A PV has `persistentVolumeReclaimPolicy: Delete`. When its bound PVC is deleted:',
    options: opts4(
      'The PV becomes Available for reuse.',
      'The PV and the underlying storage asset are deleted.',
      'The PV becomes Released and is retained.',
      'Nothing happens until the node reboots.'
    ),
    correct: ['b'],
    explanation: 'With `Delete`, removing the PVC also deletes the PV object and the backing volume (for dynamically provisioned volumes). `Retain` keeps both for manual reclamation.',
    references: [REF_PV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Multiple Pods across different nodes must write to the same volume simultaneously. The PVC accessMode must be:',
    options: opts4(
      'ReadWriteOnce',
      'ReadWriteMany',
      'ReadOnlyMany',
      'ReadWriteOncePod'
    ),
    correct: ['b'],
    explanation: 'ReadWriteMany allows multiple nodes to mount the volume read-write (e.g. NFS/CephFS). ReadWriteOnce is single-node; ReadWriteOncePod restricts to a single Pod.',
    references: [REF_PV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'To mount a ConfigMap key `app.conf` as a file at `/etc/app/app.conf`, you use:',
    options: opts4(
      'a configMap volume with an items[] mapping plus a volumeMount',
      'an emptyDir volume',
      'env.valueFrom.configMapKeyRef',
      'a hostPath volume'
    ),
    correct: ['a'],
    explanation: 'A `configMap` volume (optionally with `items` to map specific keys to paths) mounted via `volumeMounts` projects the data as files. `configMapKeyRef` injects it as an env var, not a file.',
    references: [REF_VOL]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A PVC with accessMode ReadWriteOnce can be mounted read-write by Pods on only one node at a time.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. ReadWriteOnce permits read-write mounting by one node; multiple Pods on that same node may share it. Cross-node concurrent write needs ReadWriteMany.',
    references: [REF_PV]
  },

  // ── Troubleshooting (+13) ──
  {
    domain: TS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows recent cluster events sorted by time to triage a failing Pod?',
    options: opts4(
      'kubectl get events --sort-by=.metadata.creationTimestamp',
      'kubectl logs events',
      'kubectl top events',
      'journalctl -u events'
    ),
    correct: ['a'],
    explanation: '`kubectl get events --sort-by=.metadata.creationTimestamp` lists events chronologically. `kubectl describe pod` shows events scoped to one object.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod is `CrashLoopBackOff`. The single most useful command to see why the container exits is:',
    options: opts4(
      'kubectl logs <pod> --previous',
      'kubectl get pod <pod> -o wide',
      'kubectl top pod <pod>',
      'kubectl edit pod <pod>'
    ),
    correct: ['a'],
    explanation: 'CrashLoopBackOff means the container repeatedly exits; `kubectl logs --previous` shows the last terminated container\'s output (the actual error), since the current instance may not be running.',
    references: [REF_LOGS]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A node shows `MemoryPressure=True` and Pods are being evicted. The first investigative command on the node is:',
    options: opts4(
      'kubectl describe node <node> (review conditions and allocatable)',
      'kubectl delete node <node>',
      'systemctl restart docker',
      'kubeadm reset'
    ),
    correct: ['a'],
    explanation: '`kubectl describe node` reveals the conditions, allocatable resources, and eviction events so you can identify memory exhaustion before taking action.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod is stuck `Terminating` for a long time after deletion. A common safe cause to check first is:',
    options: opts4(
      'A finalizer on the Pod (or the node is unreachable so the kubelet cannot confirm deletion).',
      'The apiserver is down.',
      'etcd is corrupted.',
      'kube-proxy crashed.'
    ),
    correct: ['a'],
    explanation: 'Pods stuck Terminating are usually waiting on a finalizer or a NotReady/unreachable node where the kubelet cannot confirm container shutdown. `--force --grace-period=0` is the last-resort removal.',
    references: [REF_KCTL]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to run an interactive shell in a running Pod\'s container to debug. The command is:',
    options: opts4(
      'kubectl exec -it <pod> -- /bin/sh',
      'kubectl attach <pod>',
      'kubectl run <pod> -- sh',
      'kubectl debug <pod> --shell'
    ),
    correct: ['a'],
    explanation: '`kubectl exec -it <pod> -- /bin/sh` opens an interactive TTY in the container. `attach` connects to the existing process stdio; `kubectl debug` creates an ephemeral debug container (different use).',
    references: [REF_KCTL]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod stays `Pending` and describe shows "Insufficient cpu". The remediation is:',
    options: opts4(
      'Lower the Pod CPU requests or add a node with more allocatable CPU.',
      'Increase the Pod CPU limit.',
      'Restart kube-scheduler.',
      'Add a toleration.'
    ),
    correct: ['a'],
    explanation: '"Insufficient cpu" means no node has enough allocatable CPU to satisfy the Pod\'s requests. Reduce requests or add capacity. Limits do not affect scheduling feasibility.',
    references: [REF_RES]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'After `kubectl apply`, a container is `RunContainerError` with "exec: \\"./start.sh\\": permission denied". The MOST likely cause is:',
    options: opts4(
      'The entrypoint script is not executable / wrong command in the image or spec.',
      'NetworkPolicy blocks startup.',
      'The node is NotReady.',
      'The Service selector is wrong.'
    ),
    correct: ['a'],
    explanation: 'RunContainerError with a permission/exec message points to a bad command, missing executable bit, or wrong path in the image or `command`/`args`. Fix the image or the Pod command.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'kubelet on a worker is healthy but the node is `NotReady` and `kubectl describe node` shows `NetworkUnavailable=True`. The likely cause is:',
    options: opts4(
      'The CNI plugin is not installed or its Pods are failing on that node.',
      'The apiserver cert expired.',
      'Swap is enabled.',
      'kubectl is the wrong version.'
    ),
    correct: ['a'],
    explanation: '`NetworkUnavailable=True` indicates the node network (CNI) is not set up. Check the CNI DaemonSet Pods (Calico/Flannel/etc.) on that node and their logs.',
    references: [REF_CNI]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: 'The kube-apiserver static Pod keeps restarting. Which log source should you check directly on the control-plane node?',
    options: opts4(
      'crictl logs of the apiserver container (or /var/log/pods/...)',
      'kubectl logs -n kube-system deploy/kube-apiserver',
      'systemctl status kube-apiserver',
      'kubectl get events only'
    ),
    correct: ['a'],
    explanation: 'When the apiserver is down, kubectl cannot reach it, so inspect the container directly via `crictl ps -a` / `crictl logs` or `/var/log/pods`. There is no apiserver Deployment or systemd unit.',
    references: [REF_APISVR]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A liveness probe is restarting a healthy container repeatedly. The MOST likely misconfiguration is:',
    options: opts4(
      'initialDelaySeconds is too small / probe path or port is wrong.',
      'The container has no readiness probe.',
      'The Service is ClusterIP.',
      'The image is too large.'
    ),
    correct: ['a'],
    explanation: 'A liveness probe firing before the app is ready (low initialDelaySeconds) or pointed at the wrong path/port causes endless restarts. Tune the delay/threshold or fix the probe target.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must collect metrics with `kubectl top nodes` but it returns "Metrics API not available". The fix is:',
    options: opts4(
      'Install/repair the metrics-server in the cluster.',
      'Restart kube-proxy.',
      'Enable the dashboard.',
      'Set --enable-metrics on kubectl.'
    ),
    correct: ['a'],
    explanation: '`kubectl top` depends on the metrics-server serving the metrics.k8s.io API. If it is not installed or unhealthy, `top` fails. Deploy/fix metrics-server.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 4, type: QType.MULTI,
    stem: 'A worker node is NotReady. Select ALL valid first-step checks.',
    options: opts4(
      '`systemctl status kubelet` and `journalctl -u kubelet` on the node.',
      '`kubectl describe node <node>` for conditions and events.',
      'Verify the container runtime (`crictl info` / `systemctl status containerd`).',
      'Immediately run `kubeadm reset` on the node.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Inspect the kubelet, node conditions, and the runtime first. `kubeadm reset` destroys node state and is never an appropriate first diagnostic step.',
    references: [REF_DEBUG, REF_KUBEADM]
  },
  {
    domain: TS, difficulty: 2, type: QType.SINGLE,
    stem: 'When the kube-apiserver is unreachable, `kubectl logs` can still retrieve container logs.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'False. `kubectl logs` proxies through the apiserver to the kubelet. If the apiserver is down you must read logs on the node via `crictl logs` or `/var/log/pods`.',
    references: [REF_LOGS]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Cluster Architecture (5) ──
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'On a kubeadm cluster, what is the recommended order to upgrade the control plane minor version?',
    options: opts4(
      'kubelet → kubeadm → kubectl → apply',
      'kubeadm upgrade plan → kubeadm upgrade apply <ver> → upgrade kubelet & kubectl',
      'kubectl drain → kubeadm reset → kubeadm init',
      'helm upgrade kubernetes'
    ),
    correct: ['b'],
    explanation: 'Always run `kubeadm upgrade plan` first to confirm the target version, then `kubeadm upgrade apply` on the first control-plane node, then upgrade kubelet/kubectl. Workers follow afterwards with `kubeadm upgrade node`.',
    references: [REF_UPGRADE]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'You back up etcd with `ETCDCTL_API=3 etcdctl snapshot save /backup/snap.db`. To restore on a new control plane you should:',
    options: opts4(
      'Copy snap.db into /var/lib/etcd and restart etcd.',
      'Run `etcdctl snapshot restore /backup/snap.db --data-dir=/var/lib/etcd-from-backup` then point the etcd static pod at the new data-dir.',
      'kubectl apply -f snap.db',
      'systemctl restart etcd — it auto-detects snapshots'
    ),
    correct: ['b'],
    explanation: 'Restore writes a brand-new data directory; you then update the etcd static Pod\'s `--data-dir` (and hostPath volume) to that directory. Simply copying the snapshot file is not a valid restore.',
    references: [REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Role permits read-only access to ConfigMaps in one namespace?',
    options: opts4(
      'apiGroups: [""], resources: ["configmaps"], verbs: ["get","list","watch"]',
      'apiGroups: ["*"], resources: ["*"], verbs: ["*"]',
      'apiGroups: ["rbac.authorization.k8s.io"], resources: ["configmaps"], verbs: ["read"]',
      'apiGroups: ["core/v1"], resources: ["configmap"], verbs: ["view"]'
    ),
    correct: ['a'],
    explanation: 'ConfigMaps are in the core API group (the empty string). Read-only verbs are `get`, `list`, `watch`. Roles vs ClusterRoles differ in scope; this would be a Role for one namespace.',
    references: [REF_RBAC]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command installs Calico via its tigera-operator manifest?',
    options: opts4(
      'kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/tigera-operator.yaml',
      'kubeadm init --pod-network-cni=calico',
      'helm install calico stable/calico',
      'kubectl plugin install calico'
    ),
    correct: ['a'],
    explanation: 'Modern Calico installs in two steps: apply `tigera-operator.yaml`, then `custom-resources.yaml` for the operator to roll out the dataplane. There is no `kubectl plugin install calico` command.',
    references: [REF_CNI]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.SINGLE,
    stem: 'Across a cluster the kubelet must be configured to set `--cluster-dns=10.96.0.10`. On a kubeadm cluster the canonical place to change this is:',
    options: opts4(
      'Edit /var/lib/kubelet/config.yaml on each node manually.',
      'Edit the `kubelet-config` ConfigMap in kube-system; nodes pick it up after a kubelet restart (or `kubeadm upgrade node`).',
      'Edit /etc/systemd/system/kubelet.service.d/10-kubeadm.conf',
      'Run `kubectl set cluster-dns 10.96.0.10`'
    ),
    correct: ['b'],
    explanation: 'kubeadm centralizes kubelet config in the `kubelet-config` ConfigMap; `kubeadm upgrade node` regenerates the on-node config from it. Hand-editing per-node config drifts and is overwritten on the next upgrade.',
    references: [REF_KUBEADM]
  },

  // ── Workloads & Scheduling (3) ──
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A wordpress Deployment in namespace `relative-fawn` must request 247m CPU and 5417Mi memory per container. The cleanest way to add resource requests to a running Deployment is:',
    options: opts4(
      'kubectl scale deploy wordpress --replicas=0; edit the Deployment to add `resources.requests`; scale back up.',
      'kubectl patch pod ...',
      'Delete the namespace and re-apply.',
      'Use a LimitRange — Deployment spec does not support resources.'
    ),
    correct: ['a'],
    explanation: 'Editing `spec.template.spec.containers[].resources.requests` on the Deployment is the right pattern; scaling to 0 first avoids partial rollout churn. Patching individual Pods is ignored — they belong to a ReplicaSet.',
    references: [REF_RES]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'An HPA targets a Deployment with `minReplicas: 1, maxReplicas: 4, averageUtilization: 50% CPU` and `behavior.scaleDown.stabilizationWindowSeconds: 30`. What does the stabilization window do?',
    options: opts4(
      'Waits 30s of sustained low load before each scale-down to dampen flapping.',
      'Caps scale-down to 30s total.',
      'Disables scaling for the first 30s.',
      'Waits 30s between Pod terminations.'
    ),
    correct: ['a'],
    explanation: 'The stabilization window is the look-back used to pick the highest recommended replicas — for scale-down a longer window dampens reactions to brief utilization dips.',
    references: [REF_HPA]
  },
  {
    domain: WORK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about DaemonSets.',
    options: opts4(
      'A DaemonSet ensures one (or some) Pod runs on every matching node.',
      'DaemonSet Pods bypass the default scheduler; the kubelet binds them directly.',
      'Adding a node automatically creates a Pod from the DaemonSet on that node.',
      'A DaemonSet works well for node-level agents (CNI, log collectors, monitoring).'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Since k8s 1.17 the default scheduler IS used for DaemonSet Pods (controller adds NodeAffinity); they are no longer scheduled directly by the kubelet. The other three are textbook DaemonSet properties.',
    references: [REF_DS]
  },

  // ── Services & Networking (4) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Service `db` in namespace `production` is addressed by Pods in namespace `web` as:',
    options: opts4(
      'db',
      'db.web.svc.cluster.local',
      'db.production.svc.cluster.local',
      'production.db.cluster.local'
    ),
    correct: ['c'],
    explanation: 'Cross-namespace DNS uses `<svc>.<ns>.svc.cluster.local`. Same-namespace short names (`db`) resolve via the DNS search list.',
    references: [REF_DNS]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You replace an Ingress with a Gateway+HTTPRoute. The HTTPRoute must select an existing Gateway. Which field links them?',
    options: opts4(
      'spec.gatewayName',
      'spec.parentRefs',
      'metadata.ownerReferences',
      'spec.controller'
    ),
    correct: ['b'],
    explanation: 'HTTPRoute uses `spec.parentRefs` (a list of objects) to attach to one or more Gateways/listeners. There is no `gatewayName` field on HTTPRoute.',
    references: [REF_GW]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A LoadBalancer Service stays `Pending`. The cluster is bare-metal. The MOST appropriate fix is:',
    options: opts4(
      'Wait — kube-controller-manager will create the load balancer eventually.',
      'Install a bare-metal LB provider such as MetalLB or kube-vip.',
      'Switch the Service to ExternalName.',
      'Set `externalTrafficPolicy: Local`.'
    ),
    correct: ['b'],
    explanation: 'Cloud LoadBalancers are reconciled by a cloud-controller. On bare metal you need MetalLB / kube-vip / similar to allocate external IPs. `externalTrafficPolicy` only affects packet routing, not allocation.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'CoreDNS pods are CrashLoopBackOff with "Loop (127.0.0.1:53 -> :53) detected for zone .". The fix is:',
    options: opts4(
      'Delete CoreDNS Pods — the issue is transient.',
      'In the CoreDNS Corefile, replace the upstream `forward . /etc/resolv.conf` with explicit upstream resolvers (e.g. 8.8.8.8) so it does not forward to itself.',
      'Disable kube-proxy.',
      'Set Pod DNS policy to `None`.'
    ),
    correct: ['b'],
    explanation: 'A loop occurs when the node\'s /etc/resolv.conf points to a local resolver that itself forwards to CoreDNS. Replace the forward target with the actual upstream DNS or fix the host resolv.conf.',
    references: [REF_DNS]
  },

  // ── Storage (2) ──
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'Create a new StorageClass `low-latency` using the local-path provisioner that defers binding until a Pod needs the volume. Which `volumeBindingMode` is correct?',
    options: opts4(
      'Immediate',
      'WaitForFirstConsumer',
      'OnDemand',
      'Deferred'
    ),
    correct: ['b'],
    explanation: '`WaitForFirstConsumer` postpones PV provisioning and binding until a Pod using the PVC is scheduled — essential for topology-aware (e.g. local) volumes. `OnDemand`/`Deferred` are not valid values.',
    references: [REF_SC]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A PVC requests 250Mi but the matching pre-provisioned PV is 1Gi. The binding behavior is:',
    options: opts4(
      'Fails — sizes must match exactly.',
      'Succeeds — the PVC binds to a PV whose capacity is ≥ requested.',
      'Succeeds — but the Pod sees only 250Mi.',
      'Fails — capacity downscaling is not allowed.'
    ),
    correct: ['b'],
    explanation: 'PV binding requires capacity ≥ requested. The Pod sees the full PV capacity; the PVC field is a *minimum* request, not a quota.',
    references: [REF_PV]
  },

  // ── Troubleshooting (6) ──
  {
    domain: TS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists running containers on a node using the CRI directly (independent of kubectl)?',
    options: opts4(
      'docker ps',
      'crictl ps',
      'kubeadm ps',
      'systemctl list-containers'
    ),
    correct: ['b'],
    explanation: '`crictl` is the standard CLI for CRI-compatible runtimes (containerd, cri-o, cri-dockerd) and is what the CKA exam expects on modern clusters. `docker ps` only works if a Docker runtime is installed.',
    references: [REF_CRI]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod has `ImagePullBackOff` and `kubectl describe pod` shows "pull access denied for private/repo:v1". The fix is:',
    options: opts4(
      'Create a `kubernetes.io/dockerconfigjson` Secret and reference it via `spec.imagePullSecrets`.',
      'Restart the kubelet.',
      'Set `imagePullPolicy: Never`.',
      'Use a NodePort Service for the registry.'
    ),
    correct: ['a'],
    explanation: 'Authenticated pulls require an `imagePullSecrets` reference on the Pod (or ServiceAccount) containing a `dockerconfigjson` Secret with the registry credentials.',
    references: [REF_KCTL]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'Two containers in a Pod must communicate over a NEW TLS-1.3-only nginx config exposed via a ConfigMap. After editing the ConfigMap, the new TLS settings are not active. The MOST likely cause is:',
    options: opts4(
      'ConfigMaps mounted as a volume update lazily — restart the Deployment so the new file is read at startup, or use a sidecar that watches for changes.',
      'TLS 1.3 is not supported in Kubernetes.',
      'The kube-proxy must be restarted.',
      'NetworkPolicy is dropping the connection.'
    ),
    correct: ['a'],
    explanation: 'ConfigMap volume mounts are eventually consistent, but the consuming process (nginx) only re-reads on reload. `kubectl rollout restart deploy` or sending a SIGHUP via a sidecar applies the new config.',
    references: [REF_KCTL]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'Inspecting `journalctl -u kubelet -f` reveals "Failed to start ContainerManager: failed to initialise top-level QOS containers: ... cgroupfs vs systemd". The fix is:',
    options: opts4(
      'Set the kubelet `cgroupDriver` to match the container runtime (typically `systemd` on modern installs).',
      'Disable swap.',
      'Reinstall the OS.',
      'Upgrade kubectl.'
    ),
    correct: ['a'],
    explanation: 'kubelet and CRI must agree on the cgroup driver. On systemd-based hosts both should use `systemd`. Mismatched drivers prevent the kubelet from starting.',
    references: [REF_CRI]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: '`kubectl get nodes` returns "Unable to connect to the server: x509: certificate signed by unknown authority". The MOST likely root cause for a working operator is:',
    options: opts4(
      'The cluster is down.',
      'Your kubeconfig points to a stale CA — refresh the kubeconfig (e.g. `kubeadm kubeconfig user --client-name=admin` or pull a fresh one).',
      'CoreDNS is broken.',
      'kube-proxy is in iptables mode.'
    ),
    correct: ['b'],
    explanation: 'TLS verification failure against the API server\'s cert almost always means the kubeconfig CA does not match — rotate or regenerate the kubeconfig.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: 'A control-plane Pod (e.g. kube-scheduler) is missing from `kubectl get pods -n kube-system`. The kubelet logs show it is "not running". The first place to look is:',
    options: opts4(
      '/var/log/syslog',
      '/etc/kubernetes/manifests/kube-scheduler.yaml — confirm the static-Pod file exists and is syntactically valid.',
      'systemctl status kube-scheduler',
      'kubectl describe deploy kube-scheduler -n kube-system'
    ),
    correct: ['b'],
    explanation: 'On kubeadm clusters scheduler/controller-manager/apiserver run as static Pods from `/etc/kubernetes/manifests/`. A missing or broken manifest is the typical cause. There is no Deployment or systemd unit for them.',
    references: [REF_APISVR]
  },

  // ── Cluster Architecture, Installation & Configuration (+11) ──
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which kernel module and sysctl are required for kube-proxy/CNI iptables traffic to work on a kubeadm node?',
    options: opts4(
      'br_netfilter module + net.bridge.bridge-nf-call-iptables=1',
      'overlay module only',
      'ip_vs module + net.ipv4.tcp_syncookies=0',
      'nf_conntrack module + vm.max_map_count=262144'
    ),
    correct: ['a'],
    explanation: 'Loading `br_netfilter` and setting `net.bridge.bridge-nf-call-iptables=1` (plus `net.ipv4.ip_forward=1`) lets bridged traffic traverse iptables so Service/Pod networking functions.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'To create a ClusterRole that allows reading Pods and a ClusterRoleBinding to group `developers` imperatively, you run:',
    options: opts4(
      'kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods && kubectl create clusterrolebinding dev-read --clusterrole=pod-reader --group=developers',
      'kubectl create role pod-reader --verb=* --resource=pods',
      'kubectl create rolebinding dev-read --role=pod-reader --user=developers',
      'kubectl auth grant developers pods'
    ),
    correct: ['a'],
    explanation: 'A cluster-wide read needs a ClusterRole bound by a ClusterRoleBinding; binding to a `--group` grants every member. A Role/RoleBinding would only scope to one namespace.',
    references: [REF_RBAC]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command verifies whether ServiceAccount `build:ci` may create deployments in namespace `build`?',
    options: opts4(
      'kubectl auth can-i create deployments --as=system:serviceaccount:build:ci -n build',
      'kubectl get rolebinding ci -n build',
      'kubectl describe sa ci -n build',
      'kubectl auth whoami --sa ci'
    ),
    correct: ['a'],
    explanation: '`kubectl auth can-i ... --as=system:serviceaccount:<ns>:<name>` impersonates the SA and reports whether RBAC permits the action — the canonical RBAC verification command.',
    references: [REF_RBAC]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'During `kubeadm upgrade`, before draining a control-plane node you should verify the plan with:',
    options: opts4(
      'kubeadm upgrade plan',
      'kubeadm config images list',
      'kubeadm token list',
      'kubeadm certs check-expiration'
    ),
    correct: ['a'],
    explanation: '`kubeadm upgrade plan` shows the current versions, the available target versions, and component upgrade actions — always run before `kubeadm upgrade apply`.',
    references: [REF_UPGRADE]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'After restoring etcd to `/var/lib/etcd-restore`, what must be updated in the etcd static Pod manifest?',
    options: opts4(
      'The `--data-dir` flag and the corresponding hostPath volume must point to /var/lib/etcd-restore.',
      'Only the container image tag.',
      'The `--listen-peer-urls` to 2379.',
      'Nothing — etcd auto-discovers the restored data.'
    ),
    correct: ['a'],
    explanation: 'A restore creates a new data directory; the etcd static Pod must reference it via `--data-dir` and its hostPath volume so the kubelet starts etcd from the restored data.',
    references: [REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which file does `kubeadm init` write that you copy to `$HOME/.kube/config` for cluster-admin access?',
    options: opts4(
      '/etc/kubernetes/admin.conf',
      '/etc/kubernetes/kubelet.conf',
      '/etc/kubernetes/scheduler.conf',
      '/var/lib/kubelet/config.yaml'
    ),
    correct: ['a'],
    explanation: '`/etc/kubernetes/admin.conf` is the cluster-admin kubeconfig generated by kubeadm. `kubelet.conf`/`scheduler.conf` are component kubeconfigs with scoped identities.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.SINGLE,
    stem: 'You add a second control-plane node. The join command must include which extra flag beyond a worker join?',
    options: opts4(
      '--control-plane (with an uploaded certificate key)',
      '--node-role=master',
      '--etcd-only',
      '--skip-phases=addon'
    ),
    correct: ['a'],
    explanation: 'Joining a control-plane node uses `kubeadm join --control-plane` plus `--certificate-key` (from `kubeadm init phase upload-certs` / `--upload-certs`) so the new node receives the control-plane PKI.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'kubeadm-managed certificates are expiring. The command to renew all of them is:',
    options: opts4(
      'kubeadm certs renew all',
      'kubeadm init --renew-certs',
      'kubectl certificate approve --all',
      'openssl req -renew -in admin.conf'
    ),
    correct: ['a'],
    explanation: '`kubeadm certs renew all` renews every kubeadm-managed control-plane certificate. The control-plane static Pods then need a restart to pick up the new certs.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command sets the default namespace for the current kubeconfig context?',
    options: opts4(
      'kubectl config set-context --current --namespace=dev',
      'kubectl set namespace dev',
      'kubectl config use-namespace dev',
      'kubectl namespace dev --default'
    ),
    correct: ['a'],
    explanation: '`kubectl config set-context --current --namespace=dev` patches the active context so subsequent commands default to namespace `dev`.',
    references: [REF_KCTL]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid steps when upgrading a kubeadm WORKER node.',
    options: opts4(
      '`kubectl drain <node> --ignore-daemonsets` from a control plane.',
      '`kubeadm upgrade node` on the worker.',
      'Upgrade the kubelet/kubectl packages and restart the kubelet.',
      '`kubectl uncordon <node>` afterwards.'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'All four are part of the documented worker upgrade: drain, `kubeadm upgrade node`, upgrade kubelet/kubectl + restart, then uncordon to resume scheduling.',
    references: [REF_UPGRADE]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'A bootstrap token created by `kubeadm token create` expires after 24 hours by default.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Bootstrap tokens default to a 24h TTL; use `--ttl 0` for a non-expiring token (not recommended) or create a new one with `--print-join-command` when needed.',
    references: [REF_KUBEADM]
  },

  // ── Workloads and Scheduling (+7) ──
  {
    domain: WORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command generates Pod YAML without creating the object?',
    options: opts4(
      'kubectl run nginx --image=nginx --dry-run=client -o yaml',
      'kubectl create pod nginx --yaml',
      'kubectl get pod nginx -o template',
      'kubectl apply --preview'
    ),
    correct: ['a'],
    explanation: '`--dry-run=client -o yaml` renders the manifest locally without contacting the apiserver — the standard exam shortcut to scaffold and then edit YAML.',
    references: [REF_KCTL]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod must tolerate a node tainted `gpu=true:NoSchedule` AND only land on GPU nodes labelled `gpu=true`. You need:',
    options: opts4(
      'a matching toleration plus a nodeSelector/affinity for the label',
      'only a toleration',
      'only a nodeSelector',
      'a PriorityClass'
    ),
    correct: ['a'],
    explanation: 'A toleration only permits scheduling onto the tainted node; it does not attract the Pod there. Add a nodeSelector or nodeAffinity on `gpu=true` to also require placement on GPU nodes.',
    references: [REF_TAINT]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Deployment should keep at most 5 old ReplicaSets for rollback history. The field is:',
    options: opts4(
      'spec.revisionHistoryLimit: 5',
      'spec.strategy.maxHistory: 5',
      'spec.rollback.limit: 5',
      'metadata.annotations.history: 5'
    ),
    correct: ['a'],
    explanation: '`spec.revisionHistoryLimit` controls how many old ReplicaSets are retained for `kubectl rollout undo`. The default is 10; setting 0 disables rollback history.',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'An initContainer must complete before the app container starts. If the initContainer exits non-zero, the Pod:',
    options: opts4(
      'restarts the initContainer per the Pod restartPolicy until it succeeds',
      'starts the app container anyway',
      'is deleted immediately',
      'skips the failed initContainer'
    ),
    correct: ['a'],
    explanation: 'Init containers run sequentially and must succeed; on failure the kubelet restarts the Pod (subject to restartPolicy) until the init container exits 0. The app container never starts until all init containers succeed.',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about node affinity.',
    options: opts4(
      'requiredDuringSchedulingIgnoredDuringExecution is a hard rule.',
      'preferredDuringScheduling... is a soft (weighted) preference.',
      'Affinity rules are re-evaluated and Pods evicted if labels change later.',
      'It can express richer set-based label matching than nodeSelector.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: '`IgnoredDuringExecution` means running Pods are NOT evicted when node labels change. Required is hard, preferred is soft/weighted, and affinity supports operators like In/NotIn/Exists.',
    references: [REF_AFFIN]
  },
  {
    domain: WORK, difficulty: 4, type: QType.SINGLE,
    stem: 'Topology spread constraints with `maxSkew: 1` and `topologyKey: zone` aim to:',
    options: opts4(
      'distribute Pods so the count difference between zones is at most 1',
      'allow at most 1 Pod per zone',
      'place all Pods in one zone',
      'evict Pods when zones become unbalanced'
    ),
    correct: ['a'],
    explanation: '`maxSkew` bounds the permitted imbalance of matching Pods across topology domains (zones), spreading them evenly. It is a scheduling constraint, not a runtime eviction mechanism.',
    references: [REF_AFFIN]
  },
  {
    domain: WORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Setting `spec.nodeName` directly on a Pod bypasses the scheduler and binds the Pod to that node.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. A Pod with `nodeName` set is assigned to that node without scheduler involvement; it will fail if that node lacks capacity or does not exist.',
    references: [REF_AFFIN]
  },

  // ── Services and Networking (+9) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command imperatively creates a ClusterIP Service for Deployment `api` on port 80?',
    options: opts4(
      'kubectl expose deploy api --port=80',
      'kubectl create svc api --port 80',
      'kubectl run svc api --port=80',
      'kubectl service create api 80'
    ),
    correct: ['a'],
    explanation: '`kubectl expose deploy api --port=80` creates a Service (ClusterIP by default) selecting the Deployment\'s Pods. `--target-port` sets the container port if it differs.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A NodePort Service is created. Which port range will Kubernetes allocate by default?',
    options: opts4(
      '30000–32767',
      '1–1024',
      '8080–8443',
      '40000–49999'
    ),
    correct: ['a'],
    explanation: 'The default `--service-node-port-range` is 30000–32767. A specific `nodePort` can be requested within that range; conflicts are rejected.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Two Pods in different namespaces cannot communicate after you add a default-deny NetworkPolicy. To allow cross-namespace traffic you must:',
    options: opts4(
      'add an ingress rule with a namespaceSelector matching the source namespace labels',
      'delete kube-proxy',
      'switch the Service to NodePort',
      'set hostNetwork: true'
    ),
    correct: ['a'],
    explanation: 'With a default-deny policy in place you must explicitly allow the source via a `from` peer using a `namespaceSelector` (and optionally `podSelector`) matching the other namespace.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress with TLS needs a certificate. The secret it references must be of type:',
    options: opts4(
      'kubernetes.io/tls',
      'Opaque',
      'kubernetes.io/dockerconfigjson',
      'bootstrap.kubernetes.io/token'
    ),
    correct: ['a'],
    explanation: 'Ingress `spec.tls[].secretName` must reference a `kubernetes.io/tls` Secret containing `tls.crt` and `tls.key`. Opaque secrets are not recognized for TLS termination.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You want client source IP preserved at the backend for a NodePort/LoadBalancer Service. Set:',
    options: opts4(
      'externalTrafficPolicy: Local',
      'internalTrafficPolicy: Cluster',
      'sessionAffinity: ClientIP',
      'publishNotReadyAddresses: true'
    ),
    correct: ['a'],
    explanation: '`externalTrafficPolicy: Local` stops the second hop SNAT so the original client IP reaches the Pod, at the cost of only routing to nodes that host a backend Pod.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A Gateway API HTTPRoute splits 80/20 between two backend Services. The weights are configured under:',
    options: opts4(
      'spec.rules[].backendRefs[].weight',
      'spec.rules[].split',
      'spec.parentRefs[].weight',
      'metadata.annotations.traffic-split'
    ),
    correct: ['a'],
    explanation: 'HTTPRoute supports weighted traffic splitting by assigning `weight` to each entry in `backendRefs` within a rule. There is no `split` or `parentRefs.weight` field.',
    references: [REF_GW]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'CoreDNS configuration is stored in which Kubernetes object?',
    options: opts4(
      'a ConfigMap named coredns in kube-system',
      'a Secret named coredns',
      'a CRD named Corefile',
      'the kube-dns Service annotations'
    ),
    correct: ['a'],
    explanation: 'CoreDNS reads its `Corefile` from the `coredns` ConfigMap in `kube-system`. Editing that ConfigMap (then restarting CoreDNS) changes DNS behavior.',
    references: [REF_DNS]
  },
  {
    domain: NET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about NetworkPolicy default behavior.',
    options: opts4(
      'With no policies, all Pod traffic is allowed.',
      'A policy selecting a Pod for Ingress makes that Pod default-deny for non-matching ingress.',
      'NetworkPolicy requires a CNI that implements it.',
      'Egress is restricted only if policyTypes includes Egress.'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'All four are correct. Pods are non-isolated until a policy selects them; once selected for a direction, only explicitly allowed traffic in that direction is permitted, and enforcement depends on the CNI.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Service named `web` in namespace `prod` is resolvable from another namespace as `web.prod.svc.cluster.local`.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The fully qualified Service DNS name is `<service>.<namespace>.svc.cluster.local`, which resolves from any namespace.',
    references: [REF_DNS]
  },

  // ── Storage (+5) ──
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all PersistentVolumes and their bound claims/status?',
    options: opts4(
      'kubectl get pv',
      'kubectl get volumes',
      'kubectl describe storage',
      'kubectl get pvc -A --show-pv'
    ),
    correct: ['a'],
    explanation: '`kubectl get pv` shows each PV with capacity, access modes, reclaim policy, status, and the bound claim. `kubectl get pvc` shows the claim side.',
    references: [REF_PV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A StatefulSet `db` has 3 replicas with a volumeClaimTemplate. The PVCs created are named:',
    options: opts4(
      'data-db-0, data-db-1, data-db-2',
      'db-pvc-1, db-pvc-2, db-pvc-3',
      'db-data (one shared PVC)',
      'pvc-<uuid> randomly'
    ),
    correct: ['a'],
    explanation: 'StatefulSet PVCs from a volumeClaimTemplate are named `<template-name>-<statefulset-name>-<ordinal>`, giving each Pod its own stable PVC.',
    references: [REF_PV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You expand a PVC by editing `spec.resources.requests.storage` but the new size is not reflected. The MOST likely reason is:',
    options: opts4(
      'allowVolumeExpansion is not true on the StorageClass.',
      'The PVC is ReadWriteOnce.',
      'The Pod is not labelled.',
      'reclaimPolicy is Retain.'
    ),
    correct: ['a'],
    explanation: 'Online expansion requires `allowVolumeExpansion: true` on the StorageClass; without it the larger request is rejected/ignored by the provisioner.',
    references: [REF_SC]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod must read a Secret as files at `/etc/creds`. The correct volume type is:',
    options: opts4(
      'a secret volume mounted at /etc/creds',
      'an emptyDir volume',
      'a hostPath volume',
      'a downwardAPI volume'
    ),
    correct: ['a'],
    explanation: 'A `secret` volume projects each Secret key as a file under the mount path. `downwardAPI` exposes Pod metadata, not Secret data; emptyDir/hostPath do not source Secret contents.',
    references: [REF_VOL]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A PVC can bind to a PV only if the PV capacity is greater than or equal to the requested size and the access modes are compatible.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Binding requires the PV capacity ≥ the PVC request and the requested access mode to be among the PV access modes (StorageClass must also match if specified).',
    references: [REF_PV]
  },

  // ── Troubleshooting (+13) ──
  {
    domain: TS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows the node a Pod is scheduled on plus its Pod IP?',
    options: opts4(
      'kubectl get pod <pod> -o wide',
      'kubectl logs <pod>',
      'kubectl top pod <pod>',
      'kubectl get pod <pod> --short'
    ),
    correct: ['a'],
    explanation: '`kubectl get pod -o wide` adds NODE, IP, and NOMINATED NODE columns — the quickest way to see placement during triage.',
    references: [REF_KCTL]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod is `Pending` and describe shows "node(s) didn\'t match Pod\'s node affinity/selector". The fix is:',
    options: opts4(
      'Correct the nodeSelector/affinity or label a node to match.',
      'Increase Pod CPU limits.',
      'Restart the scheduler.',
      'Add an imagePullSecret.'
    ),
    correct: ['a'],
    explanation: 'No node satisfies the Pod\'s node affinity/selector. Either relax/fix the constraint or add the required label to a suitable node so the scheduler can place the Pod.',
    references: [REF_AFFIN]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A container is `CreateContainerConfigError`. `kubectl describe pod` shows "secret \\"db-cred\\" not found". The remediation is:',
    options: opts4(
      'Create the missing Secret `db-cred` in the Pod namespace.',
      'Restart the kubelet.',
      'Recreate the node.',
      'Add a liveness probe.'
    ),
    correct: ['a'],
    explanation: 'CreateContainerConfigError commonly means a referenced ConfigMap/Secret is missing. Create `db-cred` in the same namespace; the kubelet then starts the container.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to test connectivity from inside the cluster to a Service. The quickest approach is:',
    options: opts4(
      'kubectl run tmp --rm -it --image=busybox -- wget -qO- http://<svc>:<port>',
      'curl from your laptop directly to the ClusterIP',
      'kubectl get svc -o yaml',
      'ping the Service DNS from the control-plane host'
    ),
    correct: ['a'],
    explanation: 'A throwaway Pod (`kubectl run --rm -it`) tests Service reachability from within the cluster network — ClusterIPs are not routable from outside or from the host.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'The scheduler Pod is healthy but no Pods are being scheduled cluster-wide. A likely cause to check is:',
    options: opts4(
      'All nodes are cordoned/NotReady or tainted so no node is feasible.',
      'CoreDNS is down.',
      'kubectl is outdated.',
      'The dashboard is disabled.'
    ),
    correct: ['a'],
    explanation: 'If every node is cordoned, NotReady, or carries a NoSchedule taint, the scheduler has no feasible node. Check `kubectl get nodes` and node taints/conditions.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A node\'s kubelet logs show "failed to run Kubelet: misconfiguration: kubelet cgroup driver: cgroupfs is different from runtime cgroup driver: systemd". The fix is:',
    options: opts4(
      'Align kubelet and runtime cgroup drivers (set both to systemd).',
      'Disable the firewall.',
      'Reinstall kubectl.',
      'Delete /var/lib/etcd.'
    ),
    correct: ['a'],
    explanation: 'The kubelet and container runtime must use the same cgroup driver. Set `cgroupDriver: systemd` in the kubelet config and ensure containerd uses `SystemdCgroup = true`, then restart both.',
    references: [REF_CRI]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Deployment shows the desired replicas but 0 available, and Pods are `0/1 Running`. The MOST likely cause is:',
    options: opts4(
      'The readiness probe is failing so Pods are Running but not Ready.',
      'The image cannot be pulled.',
      'etcd is down.',
      'The Service has no selector.'
    ),
    correct: ['a'],
    explanation: '`0/1 Running` means the container runs but the readiness probe fails, so the Pod is not Ready and not counted as available. Inspect/fix the readiness probe or the app.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'After a node reboot, its Pods are not rescheduled and the node stays `NotReady`. The first thing to check is:',
    options: opts4(
      'Whether the kubelet and container runtime services started on boot (systemctl is-enabled).',
      'Whether CoreDNS scaled down.',
      'Whether the Service is ClusterIP.',
      'Whether kubectl is configured.'
    ),
    correct: ['a'],
    explanation: 'After reboot a NotReady node usually means kubelet/containerd did not start. Verify they are enabled and running (`systemctl status/enable kubelet containerd`).',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: 'kube-controller-manager is CrashLoopBackOff after editing its static Pod manifest. The fastest way to see the parse/flag error is:',
    options: opts4(
      'crictl logs of the controller-manager container on the control-plane node',
      'kubectl logs -n kube-system deploy/kube-controller-manager',
      'systemctl status kube-controller-manager',
      'kubectl rollout status'
    ),
    correct: ['a'],
    explanation: 'It is a static Pod, so use `crictl ps -a` + `crictl logs` (or `/var/log/pods`) on the node. A bad flag/YAML in the manifest is the usual culprit; fix the manifest and the kubelet restarts it.',
    references: [REF_APISVR]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod cannot resolve external domains but resolves cluster Services fine. The likely cause is:',
    options: opts4(
      'CoreDNS upstream forwarders (or node /etc/resolv.conf) are misconfigured.',
      'The Pod has no Service.',
      'kube-proxy is in IPVS mode.',
      'The image lacks curl.'
    ),
    correct: ['a'],
    explanation: 'Cluster names resolving but external names failing points to CoreDNS upstream forwarding (the `forward` plugin / node resolv.conf) being broken. Fix the upstream resolver configuration.',
    references: [REF_DNS]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'You must capture a failing Pod\'s describe output and recent events for a ticket. The single best command is:',
    options: opts4(
      'kubectl describe pod <pod> -n <ns>',
      'kubectl get pod <pod> -o name',
      'kubectl logs <pod> --tail=1',
      'kubectl top pod <pod>'
    ),
    correct: ['a'],
    explanation: '`kubectl describe pod` consolidates spec status, container states, conditions, and the associated events — the primary first-look troubleshooting command.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 4, type: QType.MULTI,
    stem: 'A Pod is stuck in `ImagePullBackOff`. Select ALL valid causes.',
    options: opts4(
      'The image name or tag is wrong / does not exist.',
      'The registry requires auth and no imagePullSecret is set.',
      'The node cannot reach the registry network.',
      'The Service selector does not match the Pod.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'ImagePullBackOff is purely about pulling the image: wrong name/tag, missing registry credentials, or no network path to the registry. A Service selector mismatch is unrelated to image pulls.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 2, type: QType.SINGLE,
    stem: '`kubectl get events -n <ns>` is useful for diagnosing why a Pod failed to schedule or pull its image.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Scheduling failures, image pull errors, and probe failures are recorded as Events; listing them (sorted by time) is a core triage step alongside `kubectl describe`.',
    references: [REF_DEBUG]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Cluster Architecture (5) ──
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'A user `dev1` must be able to list and get Pods cluster-wide but mutate nothing. The MINIMUM RBAC binding required is:',
    options: opts4(
      'A Role + RoleBinding in every namespace.',
      'A ClusterRole with `verbs: [get,list,watch]` on `pods` + a ClusterRoleBinding to user `dev1`.',
      'A ClusterRole with `verbs: ["*"]` + ClusterRoleBinding.',
      'A Role with `verbs: ["*"]` + RoleBinding to the default namespace.'
    ),
    correct: ['b'],
    explanation: 'Cluster-wide read of a core resource is a ClusterRole bound via ClusterRoleBinding. A Role is namespace-scoped; wildcard verbs over-privilege.',
    references: [REF_RBAC]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command renders the spec of an installed CRD field so you can author a CR against it?',
    options: opts4(
      'kubectl describe crd <name>',
      'kubectl explain <kind>.<path> (e.g. certificates.spec.subject)',
      'kubectl api-versions',
      'kubectl proxy --crd'
    ),
    correct: ['b'],
    explanation: '`kubectl explain` reads the openAPI schema from the apiserver, including CRD schemas. It supports dotted paths for nested fields.',
    references: [REF_CRD]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'After `kubeadm init`, the message instructs you to run `kubectl ... --kubeconfig=/etc/kubernetes/admin.conf` or copy that file to `$HOME/.kube/config`. Which is INCORRECT about that file?',
    options: opts4(
      'It contains an admin client cert/key.',
      'It is safe to share with developers as-is.',
      'Its CA cert matches the apiserver\'s cert.',
      'Its server URL is the apiserver advertise address.'
    ),
    correct: ['b'],
    explanation: '`admin.conf` is cluster-admin; never hand it to developers. Generate per-user kubeconfigs (e.g. via `kubeadm kubeconfig user`) with scoped RBAC.',
    references: [REF_KUBEADM, REF_RBAC]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'On a fresh single-node cluster, after `kubeadm init` the apiserver is healthy but `kubectl get nodes` shows the node `NotReady`. The MOST likely remaining step is:',
    options: opts4(
      'Apply a CNI manifest (e.g. Calico / Flannel) so the node Ready condition can transition.',
      'Restart the kubelet.',
      'Set `--allow-privileged=true` on the apiserver.',
      'Disable swap (kubeadm already does this).'
    ),
    correct: ['a'],
    explanation: 'Node Ready requires a working network plugin. Without a CNI the kubelet reports `NetworkUnavailable` and the node stays NotReady.',
    references: [REF_CNI]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid placements for cri-dockerd in a CKA exam context.',
    options: opts4(
      'cri-dockerd is required if you keep Docker as the runtime past k8s 1.24.',
      'cri-dockerd is a CRI shim that lets the kubelet talk to dockerd.',
      'cri-dockerd is a CNI plugin.',
      'Default kubeadm clusters typically use containerd, not cri-dockerd.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'cri-dockerd is a runtime shim, not a CNI plugin. It exists because the in-tree dockershim was removed in 1.24. Modern kubeadm clusters default to containerd.',
    references: [REF_CRI]
  },

  // ── Workloads & Scheduling (3) ──
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'Two Pods MUST run on different nodes. Which scheduling primitive expresses this?',
    options: opts4(
      'podAffinity with `topologyKey: kubernetes.io/hostname`',
      'podAntiAffinity with `topologyKey: kubernetes.io/hostname`',
      'nodeSelector: { distinct: "true" }',
      'PriorityClass preemption'
    ),
    correct: ['b'],
    explanation: 'PodAntiAffinity with hostname topology rejects nodes that already run a matching Pod, achieving spread-by-host.',
    references: [REF_AFFIN]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a sidecar that runs FOR THE LIFETIME of the main container and shares a log volume. In recent Kubernetes versions, the recommended way is:',
    options: opts4(
      'Add it as a second container under `spec.containers[]` sharing an emptyDir volume.',
      'Add it as an initContainer.',
      'Run it as a separate Deployment.',
      'Use a Job.'
    ),
    correct: ['a'],
    explanation: 'Classic sidecars are simply additional containers in the Pod sharing volumes. The native "sidecar initContainer" (`restartPolicy: Always` on an initContainer) is a newer beta pattern for sidecars whose startup must precede the main container.',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 4, type: QType.SINGLE,
    stem: 'A Deployment has 3 replicas and `maxSurge: 1, maxUnavailable: 0`. During rollout, how many Pods total can exist simultaneously?',
    options: opts4(
      '3',
      '4',
      '5',
      '6'
    ),
    correct: ['b'],
    explanation: '`maxSurge: 1` allows one extra Pod above desired (3 → up to 4). `maxUnavailable: 0` blocks dropping below desired Ready count.',
    references: [REF_DEPLOY]
  },

  // ── Services & Networking (4) ──
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You want headless DNS so clients can resolve INDIVIDUAL Pod IPs of a StatefulSet. The Service config is:',
    options: opts4(
      'type: ClusterIP, clusterIP: None, selector: { app: db }',
      'type: NodePort, headless: true',
      'type: ExternalName, externalName: db',
      'type: ClusterIP with externalTrafficPolicy: Local'
    ),
    correct: ['a'],
    explanation: 'Setting `clusterIP: None` (with a selector) makes the Service headless. CoreDNS returns A records for each backing Pod\'s IP — required for StatefulSet stable per-Pod DNS.',
    references: [REF_SVC, REF_DNS]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy applied to `podSelector: {}` with `policyTypes: [Ingress, Egress]` and no `ingress`/`egress` rules has what effect on Pods in that namespace?',
    options: opts4(
      'Allow all ingress and egress.',
      'Default-deny all ingress AND all egress.',
      'No effect.',
      'Default-deny only intra-namespace traffic.'
    ),
    correct: ['b'],
    explanation: 'An empty selector matches every Pod; declaring both policyTypes with empty rule lists denies all traffic of those types. This is the classic "default deny" pattern.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'In the `gateway.networking.k8s.io/v1` API, which resource declares the controller implementation (e.g. nginx) that processes Gateways?',
    options: opts4(
      'GatewayClass',
      'Gateway',
      'HTTPRoute',
      'ReferenceGrant'
    ),
    correct: ['a'],
    explanation: '`GatewayClass` is the cluster-scoped resource that names the controller (e.g. `nginx`). A Gateway selects a GatewayClass; HTTPRoute attaches to a Gateway.',
    references: [REF_GW]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'An Ingress route 80→8080 stops working after migrating from ingress-nginx Ingress to a Gateway+HTTPRoute. Both resources exist temporarily. The CORRECT cleanup is:',
    options: opts4(
      'Delete the old Ingress with `kubectl delete ingress <name> -n <ns>`.',
      'Leave both — they coexist.',
      'Delete the GatewayClass.',
      'Set the Ingress annotation `disabled: true`.'
    ),
    correct: ['a'],
    explanation: 'Once HTTPRoute is verified working, delete the Ingress to avoid double-routing and resource churn. There is no `disabled: true` annotation in the Ingress API.',
    references: [REF_GW, REF_ING]
  },

  // ── Storage (2) ──
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a StatefulSet whose Pods each get their own PVC sized 1Gi. The mechanism is:',
    options: opts4(
      'spec.volumeClaimTemplates on the StatefulSet',
      'spec.template.spec.volumes (one PVC reused)',
      'A Deployment with `replicas: N` and a shared PVC',
      'PriorityClass with `volumeQuota`'
    ),
    correct: ['a'],
    explanation: '`volumeClaimTemplates` materializes a fresh PVC per ordinal Pod, satisfying per-Pod persistence in StatefulSets. A single PVC referenced via `volumes` would be shared — not what you want.',
    references: [REF_PV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A PVC of size 1Gi must be expanded to 5Gi online. The PRE-REQUISITE on the StorageClass is:',
    options: opts4(
      'reclaimPolicy: Retain',
      'allowVolumeExpansion: true',
      'volumeBindingMode: Immediate',
      'parameters.fsType: ext4'
    ),
    correct: ['b'],
    explanation: '`allowVolumeExpansion: true` on the StorageClass is required; then editing the PVC `resources.requests.storage` triggers an online resize (provisioner-dependent).',
    references: [REF_SC]
  },

  // ── Troubleshooting (6) ──
  {
    domain: TS, difficulty: 2, type: QType.SINGLE,
    stem: 'A Pod\'s containerPort `80` is declared but the Service\'s `targetPort` is `8080`. Symptom?',
    options: opts4(
      '503 / connection refused — Service forwards to a port the Pod is not listening on.',
      'Pods crash on startup.',
      'NetworkPolicy blocks the traffic.',
      'Ingress returns 404.'
    ),
    correct: ['a'],
    explanation: 'Service `targetPort` is the Pod port the kube-proxy DNATs to. A mismatch with the actually-listening port produces refused/timeout — not a Pod crash.',
    references: [REF_SVC]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'You suspect the scheduler is wedged. Which command surfaces "FailedScheduling" reasons for a specific Pod?',
    options: opts4(
      'kubectl get events --field-selector involvedObject.name=<pod>',
      'kubectl logs deploy/kube-scheduler -n kube-system',
      'kubectl describe deploy <pod>',
      'kubectl proxy --debug'
    ),
    correct: ['a'],
    explanation: '`kubectl describe pod <pod>` also surfaces the same events. Filtering via field-selector is a more programmatic equivalent. Scheduler logs help too but require deeper access.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'kube-proxy is logging "can\'t open iptables lock". The fix is:',
    options: opts4(
      'Run kube-proxy with hostNetwork (it already does).',
      'Add the privileged securityContext or required capabilities; ensure xtables-lock is mounted from /run/xtables.lock.',
      'Disable iptables and use ipvs without configuration.',
      'Restart the apiserver.'
    ),
    correct: ['b'],
    explanation: 'kube-proxy manipulates iptables on the host and needs the host\'s xtables lock and capabilities (NET_ADMIN, SYS_MODULE). The canonical DaemonSet manifest mounts `/run/xtables.lock`.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'Pods on `node02` are stuck in `ContainerCreating`. `kubectl describe pod` shows "NetworkPlugin cni failed to set up pod ... no IP addresses available in range set". The MOST likely root cause is:',
    options: opts4(
      'PodCIDR allocated to the node is exhausted — investigate via the CNI and free / expand the range.',
      'kube-proxy is down.',
      'CoreDNS is broken.',
      'NodePort range is full.'
    ),
    correct: ['a'],
    explanation: 'Each node gets a slice of the cluster Pod CIDR. When that range is exhausted, the CNI IPAM returns "no IP available". Solutions: increase per-node range or scale out nodes.',
    references: [REF_CNI]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: '`kubectl drain node01 --ignore-daemonsets --delete-emptydir-data` hangs on a PodDisruptionBudget. The CORRECT next step is:',
    options: opts4(
      'Wait for capacity to free up so the eviction can complete.',
      'Use --force --grace-period=0 to delete the Pods (last resort — bypasses graceful termination).',
      'Delete the PDB without consideration.',
      'kubeadm reset node01'
    ),
    correct: ['a'],
    explanation: 'A PDB respecting eviction will block until enough replicas can be moved while satisfying minAvailable. Scaling out (or rescheduling other Pods) typically unblocks the drain. `--force` is the destructive escape hatch.',
    references: [REF_KCTL]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: '`kubectl exec` returns "error: unable to upgrade connection: container not found ("XYZ")" yet the Pod is Running. The MOST likely cause is:',
    options: opts4(
      'Pod has multiple containers and you must pass `-c <name>` for the right one.',
      'apiserver is down.',
      'kubelet TLS cert has expired.',
      'NetworkPolicy blocks exec.'
    ),
    correct: ['a'],
    explanation: 'When the pod has multiple containers, omitting `-c` selects the default, which may not exist by the name kubectl is logging in the error. Specify the container explicitly.',
    references: [REF_KCTL]
  },

  // ── Cluster Architecture, Installation & Configuration (+11) ──
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which kubeadm phase command pre-pulls the container images required for the control plane?',
    options: opts4(
      'kubeadm config images pull',
      'kubeadm init --pull-images',
      'crictl pull kubeadm',
      'kubectl get images -A'
    ),
    correct: ['a'],
    explanation: '`kubeadm config images pull` downloads the apiserver, controller-manager, scheduler, etcd, and pause images ahead of `kubeadm init` to speed up and de-risk the bootstrap.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A ClusterRole aggregation should automatically include rules from labelled ClusterRoles. The mechanism is:',
    options: opts4(
      'spec.aggregationRule.clusterRoleSelectors on the aggregate ClusterRole',
      'metadata.ownerReferences',
      'a RoleBinding with `aggregate: true`',
      'the `rbac.authorization.k8s.io/aggregate` Service annotation'
    ),
    correct: ['a'],
    explanation: 'An aggregated ClusterRole uses `aggregationRule.clusterRoleSelectors`; the controller merges rules from any ClusterRole whose labels match. The aggregate role\'s own `rules` are managed by the controller.',
    references: [REF_RBAC]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'To rotate a leaked bootstrap token, you should:',
    options: opts4(
      'kubeadm token delete <token-id> and create a new one when needed',
      'restart the apiserver',
      'rotate the etcd snapshot',
      'kubectl delete secret kube-proxy'
    ),
    correct: ['a'],
    explanation: 'Bootstrap tokens live as Secrets in kube-system; `kubeadm token delete` revokes a leaked token immediately. Generate a fresh one with `kubeadm token create --print-join-command` only when joining nodes.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'You must change the cluster\'s API server `--audit-log-path`. On a kubeadm cluster you edit:',
    options: opts4(
      '/etc/kubernetes/manifests/kube-apiserver.yaml (static Pod manifest)',
      '/etc/systemd/system/kube-apiserver.service',
      'the kube-apiserver ConfigMap in kube-system',
      'kubectl edit deploy kube-apiserver'
    ),
    correct: ['a'],
    explanation: 'apiserver flags are set as container args in its static Pod manifest. After saving, the kubelet recreates the Pod with the new flag. No systemd unit/Deployment/ConfigMap drives it.',
    references: [REF_APISVR]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which etcdctl command verifies the integrity/metadata of a saved snapshot file?',
    options: opts4(
      'ETCDCTL_API=3 etcdctl snapshot status /backup/snap.db',
      'etcdctl verify snapshot /backup/snap.db',
      'etcdctl snapshot check',
      'kubectl get etcd snapshot'
    ),
    correct: ['a'],
    explanation: '`etcdctl snapshot status <file>` prints the snapshot\'s hash, revision, and total keys, confirming it is a valid v3 snapshot before relying on it for restore.',
    references: [REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command removes a node cleanly from the cluster after draining it?',
    options: opts4(
      'kubectl delete node <node> (then `kubeadm reset` on the node)',
      'kubectl cordon <node>',
      'kubeadm token delete <node>',
      'systemctl stop kubelet only'
    ),
    correct: ['a'],
    explanation: 'After `kubectl drain`, remove the node object with `kubectl delete node`, then run `kubeadm reset` on the host to clean its cluster state and config files.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 4, type: QType.SINGLE,
    stem: 'A kubeadm `kubeadm join` fails with "couldn\'t validate the identity of the API Server: cluster CA hash ... does not match". The cause is:',
    options: opts4(
      'A stale/incorrect --discovery-token-ca-cert-hash on the join command.',
      'The worker has swap enabled.',
      'CoreDNS is down.',
      'The worker kubelet is too new.'
    ),
    correct: ['a'],
    explanation: 'The CA cert hash pins the API server identity during discovery. A mismatched/old hash (e.g. CA rotated) fails validation. Regenerate the join command with `kubeadm token create --print-join-command`.',
    references: [REF_KUBEADM]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a Role that allows only `get` and `list` on Secrets in namespace `app`. The apiGroup for Secrets is:',
    options: opts4(
      '"" (core/v1, the empty string)',
      'rbac.authorization.k8s.io',
      'apps',
      'policy'
    ),
    correct: ['a'],
    explanation: 'Secrets, ConfigMaps, Pods, and Services are in the core API group, denoted by the empty string `""` in RBAC `apiGroups`.',
    references: [REF_RBAC]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command displays the cluster API server endpoint kubectl is currently configured to use?',
    options: opts4(
      'kubectl cluster-info',
      'kubectl get apiserver',
      'kubectl config endpoint',
      'kubectl version --server-url'
    ),
    correct: ['a'],
    explanation: '`kubectl cluster-info` prints the control-plane (API server) URL and core add-on endpoints, useful for confirming the active context targets the right cluster.',
    references: [REF_KCTL]
  },
  {
    domain: CLUSTER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL files/dirs kubeadm uses for control-plane state on a control-plane node.',
    options: opts4(
      '/etc/kubernetes/manifests (static Pod manifests)',
      '/etc/kubernetes/pki (cluster certificates)',
      '/var/lib/etcd (etcd data dir)',
      '/etc/kubernetes/admin.conf (admin kubeconfig)'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'All four are kubeadm-managed: static Pod manifests, the PKI directory, the etcd data directory, and the admin kubeconfig. Knowing these paths is essential for backup/restore and troubleshooting.',
    references: [REF_KUBEADM, REF_ETCD]
  },
  {
    domain: CLUSTER, difficulty: 2, type: QType.SINGLE,
    stem: 'On a kubeadm cluster, etcd serves client requests on port 2379 and peer (replication) traffic on port 2380.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. 2379 is the etcd client port (used by the apiserver); 2380 is the peer port for inter-member replication. The apiserver must point at 2379.',
    references: [REF_ETCD]
  },

  // ── Workloads and Scheduling (+7) ──
  {
    domain: WORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command updates the image of container `app` in Deployment `web` imperatively?',
    options: opts4(
      'kubectl set image deploy/web app=nginx:1.27',
      'kubectl update deploy web --image=nginx:1.27',
      'kubectl patch image deploy web',
      'kubectl rollout image web nginx:1.27'
    ),
    correct: ['a'],
    explanation: '`kubectl set image deploy/web app=nginx:1.27` triggers a rolling update by changing the container image; `kubectl rollout undo` can revert it.',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A node is tainted `node.kubernetes.io/unschedulable:NoSchedule` after `kubectl cordon`. To resume scheduling you run:',
    options: opts4(
      'kubectl uncordon <node>',
      'kubectl taint node <node> node.kubernetes.io/unschedulable-',
      'kubectl drain <node>',
      'systemctl restart kubelet'
    ),
    correct: ['a'],
    explanation: '`kubectl uncordon` clears the `Unschedulable` mark so the scheduler can place new Pods again. It is the inverse of `cordon`.',
    references: [REF_KCTL]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod with `restartPolicy: OnFailure` in a Job exits with code 1. The behavior is:',
    options: opts4(
      'The container is restarted in place until it succeeds or backoffLimit is reached.',
      'The Pod is deleted immediately.',
      'The Job is marked Complete.',
      'A new node is provisioned.'
    ),
    correct: ['a'],
    explanation: 'With `OnFailure`, the kubelet restarts the failing container in the same Pod. The Job\'s `backoffLimit` caps total retries before the Job is marked Failed.',
    references: [REF_DEPLOY]
  },
  {
    domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a DaemonSet Pod to also run on control-plane nodes. You must add:',
    options: opts4(
      'a toleration for the node-role.kubernetes.io/control-plane:NoSchedule taint',
      'a nodeSelector for control-plane',
      'hostNetwork: true',
      'a PriorityClass'
    ),
    correct: ['a'],
    explanation: 'Control-plane nodes carry a NoSchedule taint. A DaemonSet that must cover them needs a matching toleration; the controller still places one Pod per matching node.',
    references: [REF_DS]
  },
  {
    domain: WORK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about resource requests and limits.',
    options: opts4(
      'Requests influence scheduling (node must have enough allocatable).',
      'Exceeding a memory limit causes an OOMKill.',
      'Exceeding a CPU limit throttles the container (not killed).',
      'A Pod with no requests is rejected by the apiserver.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A Pod without requests/limits is allowed (it becomes BestEffort QoS). Requests drive scheduling, memory-over-limit is OOMKilled, and CPU-over-limit is throttled rather than killed.',
    references: [REF_RES]
  },
  {
    domain: WORK, difficulty: 4, type: QType.SINGLE,
    stem: 'A higher-priority Pod cannot schedule due to capacity. With default preemption, the scheduler will:',
    options: opts4(
      'evict (preempt) lower-priority Pods on a node to make room',
      'wait indefinitely',
      'scale the node group automatically',
      'reject the Pod permanently'
    ),
    correct: ['a'],
    explanation: 'Preemption lets the scheduler evict lower-priority Pods so a pending higher-priority Pod can be scheduled. Setting `preemptionPolicy: Never` disables this for that PriorityClass.',
    references: [REF_PRIO]
  },
  {
    domain: WORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A DaemonSet automatically schedules a Pod on every node added to the cluster that matches its selector.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The DaemonSet controller ensures one matching Pod per eligible node and creates a Pod automatically when a new matching node joins.',
    references: [REF_DS]
  },

  // ── Services and Networking (+9) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which object backs a Service\'s list of ready Pod IPs in modern Kubernetes?',
    options: opts4(
      'EndpointSlice',
      'NetworkPolicy',
      'IngressClass',
      'ConfigMap'
    ),
    correct: ['a'],
    explanation: 'EndpointSlices (the scalable successor to Endpoints) hold the ready backend addresses for a Service; kube-proxy programs routing from them.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need pods to reach a Service by short name `redis` within the same namespace. This works because:',
    options: opts4(
      'the Pod\'s DNS search list includes <namespace>.svc.cluster.local',
      'kube-proxy resolves names',
      'the Service has an ExternalName',
      'CoreDNS rewrites all queries to localhost'
    ),
    correct: ['a'],
    explanation: 'Pods get a `search` list (e.g. `ns.svc.cluster.local svc.cluster.local cluster.local`) so the unqualified name `redis` resolves to the same-namespace Service.',
    references: [REF_DNS]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy must allow DNS so Pods can still resolve names under a default-deny egress policy. You should allow egress to:',
    options: opts4(
      'kube-system CoreDNS Pods on UDP/TCP 53',
      'the apiserver on 6443',
      'all egress on port 80',
      'the node IP on 10250'
    ),
    correct: ['a'],
    explanation: 'Under default-deny egress you must explicitly permit egress to the CoreDNS Pods (kube-dns) on port 53 UDP/TCP, otherwise name resolution breaks for selected Pods.',
    references: [REF_NP]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An Ingress uses host `shop.example.com`. Two Services must be reached at `/` and `/api`. The correct Ingress structure is:',
    options: opts4(
      'one rule with host shop.example.com and two paths (/ and /api) each with its backend',
      'two Ingress objects with the same host but different IngressClass',
      'a Service of type ExternalName',
      'a Gateway with no listeners'
    ),
    correct: ['a'],
    explanation: 'A single Ingress rule can host multiple `paths`, each mapping a path to a backend Service/port — the standard fan-out (path-based) routing pattern.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which field selects which Ingress controller implements a given Ingress object?',
    options: opts4(
      'spec.ingressClassName',
      'metadata.namespace',
      'spec.rules[].host',
      'spec.backend.service.name'
    ),
    correct: ['a'],
    explanation: '`spec.ingressClassName` (referencing an IngressClass) tells which controller should program the Ingress. A default IngressClass is used if the field is omitted and one is marked default.',
    references: [REF_ING]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A Gateway listener uses `allowedRoutes.namespaces.from: Selector`. This means:',
    options: opts4(
      'only Routes in namespaces matching the label selector may attach',
      'all namespaces may attach',
      'only the Gateway\'s own namespace may attach',
      'no Routes may attach'
    ),
    correct: ['a'],
    explanation: '`from: Selector` restricts route attachment to namespaces whose labels match the listener\'s `namespaces.selector`. `Same` limits to the Gateway namespace; `All` allows any.',
    references: [REF_GW]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the EndpointSlices (backends) for Service `web`?',
    options: opts4(
      'kubectl get endpointslices -l kubernetes.io/service-name=web',
      'kubectl get pods --svc web',
      'kubectl describe networkpolicy web',
      'kubectl get ingress web -o endpoints'
    ),
    correct: ['a'],
    explanation: 'EndpointSlices are labelled with `kubernetes.io/service-name`. Filtering by that label lists the slices (and thus the backend IPs) for a Service — handy when a Service has no working endpoints.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about ClusterIP vs NodePort vs LoadBalancer Services.',
    options: opts4(
      'NodePort builds on ClusterIP and additionally opens a port on every node.',
      'LoadBalancer builds on NodePort and provisions an external LB (cloud) or needs MetalLB on bare metal.',
      'ClusterIP is the default and is internal-only.',
      'LoadBalancer works out of the box on bare metal with no extra components.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'LoadBalancer requires a cloud controller or a bare-metal implementation (MetalLB/kube-vip); it is not automatic on bare metal. The layered ClusterIP→NodePort→LoadBalancer model is otherwise correct.',
    references: [REF_SVC]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An Ingress resource has no effect unless an Ingress controller is deployed and running in the cluster.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The Ingress API only declares routing intent; an Ingress controller (ingress-nginx, etc.) must watch and program it for traffic to flow.',
    references: [REF_ING]
  },

  // ── Storage (+5) ──
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows why a PVC is stuck Pending?',
    options: opts4(
      'kubectl describe pvc <name>',
      'kubectl logs pvc <name>',
      'kubectl top pvc <name>',
      'kubectl get sc --pvc <name>'
    ),
    correct: ['a'],
    explanation: '`kubectl describe pvc` surfaces events such as "no persistent volumes available" or provisioning failures — the first step in diagnosing a Pending claim.',
    references: [REF_PV]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pod must use a volume whose lifecycle is tied to the Pod (deleted when the Pod is removed). Use:',
    options: opts4(
      'an emptyDir volume',
      'a PVC with reclaimPolicy Retain',
      'a hostPath volume',
      'a static PV'
    ),
    correct: ['a'],
    explanation: '`emptyDir` is created when the Pod is assigned to a node and deleted when the Pod is removed — ephemeral, Pod-scoped storage (e.g. scratch space, sidecar log sharing).',
    references: [REF_VOL]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You set a StorageClass as cluster default but PVCs still fail to provision dynamically. A likely cause is:',
    options: opts4(
      'No provisioner/CSI driver is installed for that StorageClass.',
      'The PVC requested ReadOnlyMany.',
      'The Pod has no nodeSelector.',
      'reclaimPolicy is Delete.'
    ),
    correct: ['a'],
    explanation: 'Dynamic provisioning needs a working provisioner (CSI driver/controller) matching the StorageClass `provisioner`. Without it, even a default StorageClass cannot create PVs.',
    references: [REF_SC]
  },
  {
    domain: STORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A PV is `Released` (Retain) and you want to reuse the underlying disk for a fresh PVC. The cleanest approach is:',
    options: opts4(
      'Delete the PV object and recreate a new PV pointing at the same disk, then bind a new PVC.',
      'Change the StorageClass.',
      'Reboot the node.',
      'Set the PVC to ReadOnlyMany.'
    ),
    correct: ['a'],
    explanation: 'A Retain PV stays Released with a stale claimRef. Either clear the claimRef to make it Available, or delete and recreate the PV referencing the same backing storage, then bind a new PVC.',
    references: [REF_PV]
  },
  {
    domain: STORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A StorageClass with `volumeBindingMode: WaitForFirstConsumer` delays PV provisioning until a Pod using the PVC is scheduled.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. WaitForFirstConsumer defers binding/provisioning until a consuming Pod is scheduled, enabling topology-aware placement (e.g. for local or zonal volumes).',
    references: [REF_SC]
  },

  // ── Troubleshooting (+13) ──
  {
    domain: TS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all Pods across all namespaces with their status?',
    options: opts4(
      'kubectl get pods -A',
      'kubectl get pods --cluster',
      'kubectl describe pods --all',
      'kubectl pods list'
    ),
    correct: ['a'],
    explanation: '`kubectl get pods -A` (or `--all-namespaces`) lists every Pod and its phase, the quickest cluster-wide health snapshot during triage.',
    references: [REF_KCTL]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod is `Evicted` with reason "The node was low on resource: ephemeral-storage". The remediation is:',
    options: opts4(
      'Reduce the Pod\'s disk usage / add ephemeral-storage limits, or free node disk.',
      'Increase the memory request.',
      'Restart kube-proxy.',
      'Add a toleration.'
    ),
    correct: ['a'],
    explanation: 'Ephemeral-storage eviction means node disk pressure. Clean node disk, set sensible ephemeral-storage requests/limits, or move logs/scratch to a volume.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'kube-apiserver logs show "etcdserver: request timed out". The MOST likely root cause is:',
    options: opts4(
      'etcd is unhealthy/slow or unreachable from the apiserver.',
      'kubectl is misconfigured.',
      'A NetworkPolicy blocks Pods.',
      'The Service has no endpoints.'
    ),
    correct: ['a'],
    explanation: 'The apiserver depends on etcd; request timeouts point to etcd being down, slow (disk I/O), or network-unreachable. Check the etcd static Pod, disk latency, and `etcdctl endpoint health`.',
    references: [REF_ETCD]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A Pod cannot reach a Service although endpoints exist. Curling the Pod IP directly works. The likely cause is:',
    options: opts4(
      'kube-proxy is not programming Service rules on that node (check its DaemonSet).',
      'The image is wrong.',
      'The PVC is Pending.',
      'CoreDNS scaled to zero.'
    ),
    correct: ['a'],
    explanation: 'Direct Pod IP works but the Service VIP does not → Service routing (iptables/IPVS) is not programmed, typically a kube-proxy failure on that node. Inspect the kube-proxy DaemonSet/logs.',
    references: [REF_SVC]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need the last 50 log lines for container `app` in a multi-container Pod. The command is:',
    options: opts4(
      'kubectl logs <pod> -c app --tail=50',
      'kubectl logs <pod> --all-containers --head=50',
      'kubectl logs <pod> --previous',
      'kubectl describe pod <pod> | tail -50'
    ),
    correct: ['a'],
    explanation: 'In a multi-container Pod you must select the container with `-c`; `--tail=50` limits the output to the most recent 50 lines.',
    references: [REF_LOGS]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A new Pod stays `Pending` and `kubectl describe` shows "untolerated taint" for a DEDICATED workload node. The intended fix is:',
    options: opts4(
      'Add a matching toleration to the Pod so it can land on the dedicated node.',
      'Remove all taints cluster-wide.',
      'Restart the scheduler.',
      'Use hostNetwork.'
    ),
    correct: ['a'],
    explanation: 'For a deliberately tainted dedicated node, the correct fix is to add the matching toleration to Pods that should run there — not to strip the taint, which would defeat node isolation.',
    references: [REF_TAINT]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A worker shows `Ready` but Pods scheduled there never start (stuck ContainerCreating). `crictl ps` is empty. Check first:',
    options: opts4(
      'The container runtime and CNI on that node (crictl info, CNI Pod logs).',
      'The apiserver audit log.',
      'kubectl version skew.',
      'The Ingress controller.'
    ),
    correct: ['a'],
    explanation: 'ContainerCreating with no containers usually means the runtime or CNI cannot set up the sandbox. Inspect `crictl info`, containerd status, and the CNI plugin logs on that node.',
    references: [REF_CNI]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'After `kubectl apply`, a Deployment is unchanged and kubectl prints "unchanged". You expected a rollout. The likely reason is:',
    options: opts4(
      'The applied manifest is identical to the live spec (no diff to trigger a rollout).',
      'The apiserver is down.',
      'RBAC denied the apply.',
      'The namespace is terminating.'
    ),
    correct: ['a'],
    explanation: 'A rollout only happens when the Pod template changes. If `apply` reports "unchanged", the manifest matched the live object; use `kubectl rollout restart` to force a new rollout.',
    references: [REF_DEPLOY]
  },
  {
    domain: TS, difficulty: 4, type: QType.SINGLE,
    stem: 'etcd is up but `kubectl` commands are very slow cluster-wide. A common root cause to investigate is:',
    options: opts4(
      'etcd disk latency / fsync performance (slow storage backing /var/lib/etcd).',
      'kubectl binary version.',
      'A missing Service selector.',
      'The Ingress class.'
    ),
    correct: ['a'],
    explanation: 'etcd is highly sensitive to disk fsync latency. Slow disks cause apiserver/etcd latency that manifests as cluster-wide kubectl slowness. Check etcd metrics and move it to faster storage.',
    references: [REF_ETCD]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'A Job never completes and its Pod is stuck `Pending` with "0/3 nodes are available: insufficient memory". The fix is:',
    options: opts4(
      'Lower the Job Pod memory request or add node capacity.',
      'Increase backoffLimit.',
      'Set restartPolicy: Always.',
      'Delete CoreDNS.'
    ),
    correct: ['a'],
    explanation: '"insufficient memory" is a scheduling feasibility problem driven by the Pod\'s memory request vs node allocatable. Reduce the request or add memory capacity.',
    references: [REF_RES]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You suspect a control-plane node\'s kubelet client cert expired. The symptom that fits is:',
    options: opts4(
      'The node goes NotReady and kubelet logs show TLS/certificate errors talking to the apiserver.',
      'Pods get more CPU.',
      'Services lose their cluster IP.',
      'CoreDNS returns NXDOMAIN for everything.'
    ),
    correct: ['a'],
    explanation: 'An expired kubelet client cert breaks the kubelet→apiserver mTLS, so the node stops heartbeating and goes NotReady with cert errors. Rotate the kubelet cert / re-issue its kubeconfig.',
    references: [REF_KUBEADM]
  },
  {
    domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'To create an ephemeral debug container in a running Pod (e.g. to get a shell with tools), use:',
    options: opts4(
      'kubectl debug -it <pod> --image=busybox --target=<container>',
      'kubectl exec -it <pod> --add-tools',
      'kubectl run debug --attach',
      'kubectl cp tools <pod>:/'
    ),
    correct: ['a'],
    explanation: '`kubectl debug` injects an ephemeral container sharing the target Pod\'s namespaces, useful when the app image lacks a shell or debugging tools. It does not restart the Pod.',
    references: [REF_DEBUG]
  },
  {
    domain: TS, difficulty: 2, type: QType.SINGLE,
    stem: 'A Pod in `CrashLoopBackOff` is repeatedly starting and exiting; the back-off delay between restarts grows over time.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The kubelet applies an exponential back-off (capped) between restarts of a repeatedly failing container, which is why the state is named CrashLoopBackOff.',
    references: [REF_DEBUG]
  }
];


// P4 — CKA 2026 Sample (2 per domain, with domain tag + suggested answer)
const P4: Q[] = [
  { domain: CLUSTER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A kubeadm control-plane node runs v1.29. After updating the kubeadm binary to v1.30, which command runs FIRST?',
    options: [{ id: 'a', text: 'kubectl drain <node> --ignore-daemonsets' }, { id: 'b', text: 'kubeadm upgrade apply v1.30.0' }, { id: 'c', text: 'kubeadm upgrade plan' }, { id: 'd', text: 'apt-get install -y kubelet=1.30.0-00' }],
    correct: ['c'],
    explanation: 'Correct option: kubeadm upgrade plan\nRun plan first to validate pre-flight checks without modifying the cluster.\n\nIncorrect options:\nkubectl drain - happens after plan and apply.\nkubeadm upgrade apply - must review plan first.\napt-get install - happens after planning.',
    references: [REF_UPGRADE] },
  { domain: CLUSTER, difficulty: 3, type: QType.MULTI,
    stem: 'Bootstrapping a new cluster with kubeadm. Which TWO items are required for TLS and RBAC?',
    options: [{ id: 'a', text: 'InitConfiguration with authorization-modes: [RBAC]' }, { id: 'b', text: '/etc/kubernetes/pki/ca.crt and ca.key' }, { id: 'c', text: 'A pre-existing etcd snapshot' }, { id: 'd', text: 'A kubelet kubeconfig with client certs' }, { id: 'e', text: 'A pre-pulled kube-apiserver image' }],
    correct: ['a', 'b'],
    explanation: 'Correct options:\nInitConfiguration - sets RBAC as the authorisation mode.\nCA key pair - kubeadm signs all component TLS certs from this.\n\nIncorrect options:\netcd snapshot - only needed for restore.\nkubelet kubeconfig - auto-generated by kubeadm.\nPre-pulled image - kubeadm pulls if missing.',
    references: [REF_KUBEADM, REF_RBAC] },
  { domain: WORK, difficulty: 2, type: QType.SINGLE,
    stem: 'After a bad rollout you run: kubectl rollout undo deployment/api. What happens?',
    options: [{ id: 'a', text: 'Scales to 0 then back to original replicas' }, { id: 'b', text: 'Rolls back to the previous ReplicaSet revision' }, { id: 'c', text: 'Deletes and recreates the Deployment' }, { id: 'd', text: 'Pauses the rollout and waits for approval' }],
    correct: ['b'],
    explanation: 'Correct option: Previous ReplicaSet revision\nThe Deployment controller scales up the old ReplicaSet and scales down the current one.\n\nIncorrect options:\nScale 0 - that is a restart not a rollback.\nDelete and recreate - rollout undo does not delete the Deployment.\nPause - pausing uses kubectl rollout pause.',
    references: [REF_DEPLOY] },
  { domain: WORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A DaemonSet must NOT run on nodes labelled node-role.kubernetes.io/control-plane. Which pod spec field achieves this correctly?',
    options: [{ id: 'a', text: 'nodeSelector: { kubernetes.io/os: linux }' }, { id: 'b', text: 'affinity.nodeAffinity with requiredDuringScheduling NotIn rule on the control-plane label' }, { id: 'c', text: 'tolerations: [] to remove all tolerations' }, { id: 'd', text: 'updateStrategy.type: OnDelete' }],
    correct: ['b'],
    explanation: 'Correct option: nodeAffinity NotIn exclusion\nExplicitly excludes control-plane nodes without affecting other constraints.\n\nIncorrect options:\nnodeSelector: linux - selects by OS not role.\ntolerations: [] - side-effect not an explicit exclusion.\nupdateStrategy - controls updates not placement.',
    references: [REF_DS, REF_AFFIN] },
  { domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Pod A in namespace frontend must reach Service backend in namespace backend. Which hostname resolves correctly from Pod A?',
    options: [{ id: 'a', text: 'backend' }, { id: 'b', text: 'backend.backend.svc.cluster.local' }, { id: 'c', text: 'backend.svc.cluster.local' }, { id: 'd', text: 'backend.cluster.local' }],
    correct: ['b'],
    explanation: 'Correct option: backend.backend.svc.cluster.local\nFormat is service.namespace.svc.cluster-domain. Pod A is in frontend so its search domains exclude backend namespace.\n\nIncorrect options:\nbackend alone - resolves only within same namespace.\nbackend.svc.cluster.local - missing namespace.\nbackend.cluster.local - missing namespace and svc.',
    references: [REF_DNS] },
  { domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A NetworkPolicy selects pods with label app=checkout and sets ingress: []. What is the effect?',
    options: [{ id: 'a', text: 'All ingress is allowed from any source' }, { id: 'b', text: 'All ingress is denied; egress is unaffected' }, { id: 'c', text: 'All ingress and egress is denied' }, { id: 'd', text: 'The policy is invalid and rejected' }],
    correct: ['b'],
    explanation: 'Correct option: All ingress denied egress unaffected\nEmpty ingress array blocks all ingress. Egress not in policyTypes so unaffected.\n\nIncorrect options:\nAll ingress allowed - empty ingress is NOT the same as no policy.\nEgress also denied - only if Egress is in policyTypes.\nInvalid - empty ingress array is valid.',
    references: [REF_NP] },
  { domain: STORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A PVC is deleted and the bound PV has reclaimPolicy Retain. What happens to the PV?',
    options: [{ id: 'a', text: 'PV is automatically deleted with the PVC' }, { id: 'b', text: 'PV moves to Released; data preserved and admin must manually reclaim it' }, { id: 'c', text: 'PV transitions to Available and can be bound immediately' }, { id: 'd', text: 'Data is scrubbed and PV transitions to Available' }],
    correct: ['b'],
    explanation: 'Correct option: PV moves to Released data preserved\nRetain policy means Kubernetes does not touch the storage. Admin must manually delete or patch the PV.\n\nIncorrect options:\nAuto-deleted - that is the Delete reclaim policy.\nImmediately Available - Released PVs retain claimRef.\nData scrubbed - that is the deprecated Recycle policy.',
    references: [REF_PV] },
  { domain: STORE, difficulty: 3, type: QType.MULTI,
    stem: 'For dynamic provisioning of a PVC referencing StorageClass fast-ssd, which TWO must already exist?',
    options: [{ id: 'a', text: 'StorageClass fast-ssd with provisioner matching a running CSI driver' }, { id: 'b', text: 'Running CSI driver (controller + node pods) matching the provisioner' }, { id: 'c', text: 'A pre-created PV with storageClassName: fast-ssd' }, { id: 'd', text: 'A VolumeSnapshotClass for the same provisioner' }, { id: 'e', text: 'Resource quotas permitting PVC creation' }],
    correct: ['a', 'b'],
    explanation: 'Correct options:\nStorageClass fast-ssd - must exist with valid provisioner.\nRunning CSI driver - calls CreateVolume; without it provisioning stalls.\n\nIncorrect options:\nPre-created PV - dynamic provisioning creates it on demand.\nVolumeSnapshotClass - only for snapshots.\nResource quotas - may constrain but not required.',
    references: [REF_SC, REF_PV] },
  { domain: TS, difficulty: 2, type: QType.SINGLE,
    stem: 'A Pod is stuck in Pending. describe shows: 0/3 nodes available: 3 Insufficient memory. What is the correct first action?',
    options: [{ id: 'a', text: 'Image pull failure - delete and recreate the pod' }, { id: 'b', text: 'Pod requests more memory than any node has - reduce requests.memory or add capacity' }, { id: 'c', text: 'NetworkPolicy blocking the scheduler - remove the policy' }, { id: 'd', text: 'Kubelet is down - run systemctl restart kubelet' }],
    correct: ['b'],
    explanation: 'Correct option: Insufficient memory request\nReduce resources.requests.memory or add node capacity.\n\nIncorrect options:\nImage pull failure - produces ErrImagePull not Insufficient memory.\nNetworkPolicy - applies to pod traffic not scheduling.\nKubelet down - produces NodeNotReady events.',
    references: [REF_RES, REF_DEBUG] },
  { domain: TS, difficulty: 3, type: QType.SINGLE,
    stem: 'The kube-apiserver static pod is crash-looping. Where do you look FIRST?',
    options: [{ id: 'a', text: 'kubectl logs -n kube-system kube-apiserver-<node>' }, { id: 'b', text: '/var/log/pods/kube-system_kube-apiserver-*/kube-apiserver/*.log on the node' }, { id: 'c', text: 'journalctl -u kube-scheduler' }, { id: 'd', text: 'etcdctl member list' }],
    correct: ['b'],
    explanation: 'Correct option: CRI log files on the node\nWhen the API server is crash-looping kubectl may be unavailable. CRI log files at /var/log/pods are always readable.\n\nIncorrect options:\nkubectl logs - requires API server to be reachable.\njournalctl kube-scheduler - only relevant after API server is healthy.\netcdctl - check API server logs first.',
    references: [REF_APISVR, REF_DEBUG, REF_LOGS] },
];

const CKA_DOMAINS = [
  { name: CLUSTER, weight: 25 },
  { name: WORK, weight: 15 },
  { name: NET, weight: 20 },
  { name: STORE, weight: 10 },
  { name: TS, weight: 30 }
];

const CKA_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'linuxfoundation-cka-p1',
    code: 'CKA-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering kubeadm install, etcd, RBAC, scheduling (taints/affinity/priority), Services & Ingress/Gateway API, NetworkPolicies, PV/PVC/StorageClasses, and the troubleshooting workflows tested by the TGS-2025054612-CKA labs.',
    questions: P1
  },
  {
    slug: 'linuxfoundation-cka-p2',
    code: 'CKA-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'linuxfoundation-cka-p4',
    code: 'CKA-P4',
    titleSuffix: 'Practice Exam 4 - 2026 Sample (2 per domain)',
    descriptionSuffix: 'Two questions per domain, each tagged with the CKA blueprint domain and a full suggested answer. CKA v1.32 / 2026 aligned.',
    questions: P4
  },
  {
    slug: 'linuxfoundation-cka-p3',
    code: 'CKA-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const CKA_BUNDLE = {
  slug: 'linuxfoundation-cka',
  title: 'Certified Kubernetes Administrator (CKA)',
  description: 'All 3 CKA practice exams in one bundle — covering cluster architecture & install (kubeadm, etcd, RBAC, CRDs, CNI), workloads & scheduling, services & networking (Ingress + Gateway API), storage, and troubleshooting. Aligned to the CNCF CKA v1.32 blueprint.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 39500 // USD 395 — VOUCHER tier (matches CKA real-exam fee)
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CKA bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:cka-seed'` are deleted and re-created.
 */
export async function seedCka(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'linuxfoundation' } });
  await db.vendor.upsert({
    where: { slug: 'linuxfoundation' },
    update: { name: 'Linux Foundation', description: 'CNCF / Linux Foundation certifications — CKAD, CKA, CKS, and other open-source ecosystem credentials.' },
    create: { slug: 'linuxfoundation', name: 'Linux Foundation', description: 'CNCF / Linux Foundation certifications — CKAD, CKA, CKS, and other open-source ecosystem credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'linuxfoundation' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of CKA_EXAMS) {
    const title = `Certified Kubernetes Administrator (CKA) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to CNCF CKA v1.32.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 120,
      passingScore: 66,
      questionCount: e.questions.length,
      domains: CKA_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:cka-seed' } });
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
          generatedBy: 'manual:cka-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: CKA_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CKA_BUNDLE.slug },
    update: {
      title: CKA_BUNDLE.title,
      description: CKA_BUNDLE.description,
      price: CKA_BUNDLE.price,
      priceVoucher: CKA_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: CKA_BUNDLE.slug,
      title: CKA_BUNDLE.title,
      description: CKA_BUNDLE.description,
      price: CKA_BUNDLE.price,
      priceVoucher: CKA_BUNDLE.priceVoucher,
      published: true
    }
  });

  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'linuxfoundation-cka-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'linuxfoundation-cka-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'linuxfoundation-cka-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'linuxfoundation-cka-p4', tier: 'PRACTICE' as const, position: 4 },
    { examSlug: 'linuxfoundation-cka-p1', tier: 'VOUCHER' as const, position: 5 }
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
