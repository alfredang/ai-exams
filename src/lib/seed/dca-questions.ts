/**
 * DCA bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:dca-seed'` and upserts catalog rows.
 *
 * Exported as `seedDca(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/dca.ts`) and the protected
 * admin API (`/api/admin/seed-dca`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Docker docs and the
 * Docker Certified Associate (DCA) domain blueprint:
 *   - Orchestration                                — 25% (5)
 *   - Image Creation, Management, and Registry     — 20% (4)
 *   - Installation and Configuration               — 15% (3)
 *   - Networking                                   — 15% (3)
 *   - Security                                     — 15% (3)
 *   - Storage and Volumes                          — 10% (2)
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

const ORCH = 'Orchestration';
const IMAGE = 'Image Creation, Management, and Registry';
const INSTALL = 'Installation and Configuration';
const NET = 'Networking';
const SEC = 'Security';
const STORAGE = 'Storage and Volumes';

const REF_SWARM = { label: 'Docker Docs — Swarm mode overview', url: 'https://docs.docker.com/engine/swarm/' };
const REF_SWARM_SVC = { label: 'Docker Docs — Deploy services to a swarm', url: 'https://docs.docker.com/engine/swarm/services/' };
const REF_SWARM_NODES = { label: 'Docker Docs — Manage nodes in a swarm', url: 'https://docs.docker.com/engine/swarm/manage-nodes/' };
const REF_SWARM_ADMIN = { label: 'Docker Docs — Administer and maintain a swarm', url: 'https://docs.docker.com/engine/swarm/admin_guide/' };
const REF_SWARM_RAFT = { label: 'Docker Docs — Raft consensus in swarm mode', url: 'https://docs.docker.com/engine/swarm/raft/' };
const REF_SWARM_INGRESS = { label: 'Docker Docs — Use swarm mode routing mesh', url: 'https://docs.docker.com/engine/swarm/ingress/' };
const REF_STACK = { label: 'Docker Docs — Deploy a stack to a swarm', url: 'https://docs.docker.com/engine/swarm/stack-deploy/' };
const REF_SECRETS = { label: 'Docker Docs — Manage sensitive data with secrets', url: 'https://docs.docker.com/engine/swarm/secrets/' };
const REF_CONFIGS = { label: 'Docker Docs — Store configuration data using configs', url: 'https://docs.docker.com/engine/swarm/configs/' };
const REF_K8S = { label: 'Docker Docs — Deploy on Kubernetes', url: 'https://docs.docker.com/desktop/features/kubernetes/' };
const REF_BUILD = { label: 'Docker Docs — Building images', url: 'https://docs.docker.com/build/building/packaging/' };
const REF_DOCKERFILE = { label: 'Docker Docs — Dockerfile reference', url: 'https://docs.docker.com/reference/dockerfile/' };
const REF_MULTISTAGE = { label: 'Docker Docs — Multi-stage builds', url: 'https://docs.docker.com/build/building/multi-stage/' };
const REF_LAYERS = { label: 'Docker Docs — Image layers and best practices', url: 'https://docs.docker.com/build/building/best-practices/' };
const REF_REGISTRY = { label: 'Docker Docs — Docker registry', url: 'https://docs.docker.com/registry/' };
const REF_TAG = { label: 'Docker Docs — docker image tag', url: 'https://docs.docker.com/reference/cli/docker/image/tag/' };
const REF_PUSH = { label: 'Docker Docs — docker push', url: 'https://docs.docker.com/reference/cli/docker/image/push/' };
const REF_INSTALL = { label: 'Docker Docs — Install Docker Engine', url: 'https://docs.docker.com/engine/install/' };
const REF_DAEMON = { label: 'Docker Docs — Docker daemon configuration file', url: 'https://docs.docker.com/engine/daemon/' };
const REF_LOGGING = { label: 'Docker Docs — Configure logging drivers', url: 'https://docs.docker.com/engine/logging/configure/' };
const REF_CLI = { label: 'Docker Docs — Docker CLI reference', url: 'https://docs.docker.com/reference/cli/docker/' };
const REF_NETWORK = { label: 'Docker Docs — Networking overview', url: 'https://docs.docker.com/engine/network/' };
const REF_BRIDGE = { label: 'Docker Docs — Bridge network driver', url: 'https://docs.docker.com/engine/network/drivers/bridge/' };
const REF_OVERLAY = { label: 'Docker Docs — Overlay network driver', url: 'https://docs.docker.com/engine/network/drivers/overlay/' };
const REF_MACVLAN = { label: 'Docker Docs — Macvlan network driver', url: 'https://docs.docker.com/engine/network/drivers/macvlan/' };
const REF_HOST = { label: 'Docker Docs — Host network driver', url: 'https://docs.docker.com/engine/network/drivers/host/' };
const REF_SECURITY = { label: 'Docker Docs — Docker engine security', url: 'https://docs.docker.com/engine/security/' };
const REF_TRUST = { label: 'Docker Docs — Content trust', url: 'https://docs.docker.com/engine/security/trust/' };
const REF_USERNS = { label: 'Docker Docs — Isolate containers with a user namespace', url: 'https://docs.docker.com/engine/security/userns-remap/' };
const REF_SECCOMP = { label: 'Docker Docs — Seccomp security profiles', url: 'https://docs.docker.com/engine/security/seccomp/' };
const REF_CAPS = { label: 'Docker Docs — Runtime privilege and Linux capabilities', url: 'https://docs.docker.com/reference/cli/docker/container/run/#privileged' };
const REF_VOLUMES = { label: 'Docker Docs — Volumes', url: 'https://docs.docker.com/engine/storage/volumes/' };
const REF_BINDMOUNT = { label: 'Docker Docs — Bind mounts', url: 'https://docs.docker.com/engine/storage/bind-mounts/' };
const REF_TMPFS = { label: 'Docker Docs — tmpfs mounts', url: 'https://docs.docker.com/engine/storage/tmpfs/' };
const REF_STORAGEDRIVER = { label: 'Docker Docs — Storage drivers', url: 'https://docs.docker.com/engine/storage/drivers/' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Orchestration (5) ──
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command initializes a new swarm and turns the current node into the first manager?',
    options: opts4(
      'docker swarm create',
      'docker swarm init',
      'docker node promote --init',
      'docker service create --swarm'
    ),
    correct: ['b'],
    explanation: '`docker swarm init` bootstraps a swarm and makes the current node a manager (leader). `docker swarm create` is not a valid subcommand; `docker node promote` operates on an existing swarm; `docker service create` deploys a service into an existing swarm.',
    references: [REF_SWARM]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'In a swarm, you scale the `web` service to 5 replicas with `docker service scale web=5`. One worker node then goes down. What does the swarm do?',
    options: opts4(
      'It marks the service as failed until the node returns.',
      'The orchestrator reschedules the lost replicas onto remaining healthy nodes to restore the desired count.',
      'It permanently reduces the replica count to match available nodes.',
      'Nothing — replicas are pinned to their original node.'
    ),
    correct: ['b'],
    explanation: 'Swarm continuously reconciles actual state to the declared desired state. Lost replicas on a downed node are rescheduled onto healthy nodes. Replicas are not pinned unless constraints force them.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about swarm manager nodes and Raft.',
    options: opts4(
      'Manager nodes use the Raft consensus algorithm to maintain a consistent cluster state.',
      'A swarm with 5 managers tolerates the loss of up to 2 managers while remaining functional.',
      'Adding more managers always increases write throughput linearly.',
      'An even number of managers does not improve fault tolerance over the next lower odd number.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Raft requires a quorum (majority). With N managers, fault tolerance is floor((N-1)/2) — 5 managers tolerate 2 failures. More managers increase consensus overhead, not write throughput. An even count gives no tolerance benefit over the lower odd count, so odd numbers are recommended.',
    references: [REF_SWARM_RAFT, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command deploys a multi-service application defined in `stack.yml` to a swarm as a stack named `app`?',
    options: opts4(
      'docker compose up -d stack.yml',
      'docker stack deploy -c stack.yml app',
      'docker service deploy --stack app stack.yml',
      'docker swarm deploy app stack.yml'
    ),
    correct: ['b'],
    explanation: '`docker stack deploy -c <compose-file> <stack-name>` deploys a Compose-format file to a swarm as a stack. `docker compose up` runs locally, not on a swarm; the other options are not valid commands.',
    references: [REF_STACK]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.SINGLE,
    stem: 'You want a service to run exactly one task on every node in the swarm, including new nodes added later. Which service mode achieves this?',
    options: opts4(
      'Replicated mode with replicas equal to the current node count',
      'Global mode (--mode global)',
      'Replicated-job mode',
      'Constraint mode with node.role==worker'
    ),
    correct: ['b'],
    explanation: 'A global service runs exactly one task per node and automatically schedules a task onto any node that joins later. A fixed replica count does not adjust when nodes are added; replicated-job runs to completion; constraints only filter placement.',
    references: [REF_SWARM_SVC]
  },

  // ── Image Creation, Management, and Registry (4) ──
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Dockerfile instruction defines the default command run by the container, while still allowing it to be overridden on `docker run`?',
    options: opts4(
      'ENTRYPOINT in exec form only',
      'CMD',
      'RUN',
      'EXEC'
    ),
    correct: ['b'],
    explanation: '`CMD` sets the default command/arguments and is fully overridden by arguments passed to `docker run`. `RUN` executes at build time; `EXEC` is not a Dockerfile instruction; `ENTRYPOINT` defines the executable and is not replaced by run-time args (they are appended).',
    references: [REF_DOCKERFILE]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-stage Dockerfile has a `build` stage with the Go toolchain and a final stage `FROM alpine`. What is the primary benefit?',
    options: opts4(
      'It builds faster because stages run in parallel by default.',
      'The final image excludes build tooling and intermediate artifacts, drastically reducing image size and attack surface.',
      'It allows the container to run as root automatically.',
      'It removes the need for a .dockerignore file.'
    ),
    correct: ['b'],
    explanation: 'Multi-stage builds copy only the needed artifacts into a lean final stage, so compilers/SDKs never ship in the runtime image. Stages are not parallel by default, and multi-stage has nothing to do with the run user or .dockerignore.',
    references: [REF_MULTISTAGE]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker image layers and tags.',
    options: opts4(
      'Each Dockerfile instruction such as RUN, COPY, or ADD creates a new image layer.',
      'A tag is an immutable, content-addressable identifier that can never be moved.',
      'Image layers are cached and reused across builds when the instruction and its inputs are unchanged.',
      'A digest (sha256:...) uniquely and immutably identifies a specific image content.'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'RUN/COPY/ADD create layers; the build cache reuses unchanged layers. A digest is the immutable content-addressable identifier — a tag is a mutable human-readable label that can be re-pointed to a different image.',
    references: [REF_LAYERS, REF_TAG]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You built `myapp:1.0` locally and want to push it to a private registry at `registry.example.com:5000`. Which sequence is correct?',
    options: opts4(
      'docker push myapp:1.0 registry.example.com:5000',
      'docker tag myapp:1.0 registry.example.com:5000/myapp:1.0 ; docker push registry.example.com:5000/myapp:1.0',
      'docker image export myapp:1.0 | docker registry import',
      'docker registry add myapp:1.0 ; docker push myapp:1.0'
    ),
    correct: ['b'],
    explanation: 'An image must be tagged with the registry host/repository before pushing; `docker push` then targets that fully qualified reference. The other forms are not valid Docker CLI usage.',
    references: [REF_PUSH, REF_REGISTRY]
  },

  // ── Installation and Configuration (3) ──
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which file is the canonical location for persistent Docker daemon configuration on Linux?',
    options: opts4(
      '/etc/docker/daemon.json',
      '/var/lib/docker/config.yml',
      '~/.docker/config.json',
      '/etc/default/docker-cli'
    ),
    correct: ['a'],
    explanation: '`/etc/docker/daemon.json` configures the daemon (`dockerd`). `~/.docker/config.json` is the *client* config (registry auth, etc.); `/var/lib/docker` is the data root, not config.',
    references: [REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'You set `"log-driver": "json-file"` and `"log-opts": {"max-size": "10m", "max-file": "3"}` in daemon.json. What is the effect?',
    options: opts4(
      'All containers fail to start until logging is disabled.',
      'New containers default to the json-file driver with log rotation capped at 3 files of 10 MB each.',
      'Existing containers immediately switch drivers without restart.',
      'Logs are forwarded to a remote syslog server.'
    ),
    correct: ['b'],
    explanation: 'Daemon-level `log-driver`/`log-opts` set the default for newly created containers, with rotation here limited to three 10 MB files. Existing containers keep their original driver until recreated; syslog would require the `syslog` driver.',
    references: [REF_LOGGING]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After editing /etc/docker/daemon.json on a systemd Linux host, which command applies the new daemon configuration?',
    options: opts4(
      'docker reload',
      'systemctl restart docker',
      'docker daemon --refresh',
      'kill -1 dockerd && docker start'
    ),
    correct: ['b'],
    explanation: 'Restarting the service with `systemctl restart docker` reloads daemon.json. Some options can be reloaded with `SIGHUP` to dockerd, but there is no `docker reload`/`docker daemon --refresh` command.',
    references: [REF_DAEMON]
  },

  // ── Networking (3) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the default network driver used when you run a container without specifying `--network`?',
    options: opts4(
      'host',
      'bridge',
      'overlay',
      'none'
    ),
    correct: ['b'],
    explanation: 'On a standalone Docker host, containers attach to the default `bridge` network unless `--network` specifies otherwise. `overlay` is for multi-host swarm networking; `host` shares the host stack; `none` disables networking.',
    references: [REF_NETWORK, REF_BRIDGE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Two containers on a user-defined bridge network need to reach each other by name. What enables this?',
    options: opts4(
      'You must publish ports with -p for them to communicate.',
      'Docker provides automatic DNS-based service discovery between containers on the same user-defined network.',
      'They can only communicate via their IP addresses; no name resolution exists.',
      'You must link them with the deprecated --link flag.'
    ),
    correct: ['b'],
    explanation: 'User-defined bridge networks include an embedded DNS server so containers resolve each other by name/alias automatically. Port publishing is for host-to-container access; the legacy `--link` is not required on user-defined networks.',
    references: [REF_BRIDGE]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker network drivers.',
    options: opts4(
      'The overlay driver connects multiple Docker daemons and is used for swarm service networking.',
      'The macvlan driver assigns containers a MAC address making them appear as physical devices on the network.',
      'The host driver gives a container its own isolated network namespace separate from the host.',
      'Publishing a port with -p 8080:80 maps host port 8080 to container port 80.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Overlay spans hosts (swarm); macvlan exposes containers as first-class L2 devices; `-p host:container` maps ports. The host driver does the opposite of option C — it removes network isolation by sharing the host network namespace.',
    references: [REF_OVERLAY, REF_MACVLAN, REF_HOST]
  },

  // ── Security (3) ──
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Enabling Docker Content Trust (DOCKER_CONTENT_TRUST=1) provides what guarantee?',
    options: opts4(
      'It encrypts all container filesystem layers at rest.',
      'It ensures images are signed and verifies their integrity and publisher before pull/run.',
      'It scans images for CVEs and blocks vulnerable ones.',
      'It forces all containers to run as a non-root user.'
    ),
    correct: ['b'],
    explanation: 'Content trust uses digital signatures (Notary/TUF) so the engine only pulls/runs signed, verified images. It does not encrypt layers, scan for CVEs, or change the container user.',
    references: [REF_TRUST]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `docker run` flag drops all Linux capabilities and then adds back only NET_BIND_SERVICE?',
    options: opts4(
      '--privileged --cap NET_BIND_SERVICE',
      '--cap-drop ALL --cap-add NET_BIND_SERVICE',
      '--security-opt cap=NET_BIND_SERVICE',
      '--no-caps --add-cap NET_BIND_SERVICE'
    ),
    correct: ['b'],
    explanation: '`--cap-drop ALL` removes every capability and `--cap-add NET_BIND_SERVICE` re-grants only that one — a least-privilege pattern. `--privileged` does the opposite (grants everything); the other flags are not valid.',
    references: [REF_CAPS, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 4, type: QType.SINGLE,
    stem: 'You enable user namespace remapping (userns-remap) on the daemon. What is the security benefit?',
    options: opts4(
      'Containers can no longer use any volumes.',
      'A process running as root (UID 0) inside a container is mapped to an unprivileged UID on the host.',
      'It encrypts inter-container traffic automatically.',
      'It disables the Docker API socket.'
    ),
    correct: ['b'],
    explanation: 'userns-remap maps in-container UIDs (including root) to a non-privileged range on the host, so a container breakout does not yield host root. It does not disable volumes, encrypt traffic, or disable the API.',
    references: [REF_USERNS]
  },

  // ── Storage and Volumes (2) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best distinguishes a named volume from a bind mount?',
    options: opts4(
      'Named volumes are managed by Docker under its data root; bind mounts map an arbitrary host path you control directly.',
      'Bind mounts are stored inside the container writable layer; volumes are not.',
      'Named volumes can only be used in swarm mode.',
      'Bind mounts are automatically backed up by Docker; volumes are not.'
    ),
    correct: ['a'],
    explanation: 'Volumes live in a Docker-managed area (e.g. /var/lib/docker/volumes) and are the preferred mechanism; bind mounts attach a specific host directory/file. Neither is stored in the container writable layer, and Docker does not auto-backup either.',
    references: [REF_VOLUMES, REF_BINDMOUNT]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want sensitive scratch data to exist only in memory and never be written to the container or host disk. Which mount type fits?',
    options: opts4(
      'A named volume',
      'A bind mount',
      'A tmpfs mount',
      'The container writable layer'
    ),
    correct: ['c'],
    explanation: 'A tmpfs mount stores data in host RAM only and is removed when the container stops — ideal for transient secrets. Volumes and bind mounts persist on disk; the writable layer also persists for the container lifetime and can be committed.',
    references: [REF_TMPFS]
  },

  // ── Orchestration (+11 → 16 total) ──
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command promotes an existing worker node named `node-3` to a manager?',
    options: opts4(
      'docker node promote node-3',
      'docker swarm promote node-3',
      'docker node update --role manager node-3 --force',
      'docker manager add node-3'
    ),
    correct: ['a'],
    explanation: '`docker node promote <node>` (a shortcut for `docker node update --role manager`) elevates a worker to manager. `docker swarm promote` and `docker manager add` are not valid subcommands.',
    references: [REF_SWARM_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A swarm service is created with `--replicas 3`. You run `docker service ps web` and see one task in state `Shutdown` and a replacement `Running`. What happened?',
    options: opts4(
      'The service was scaled down to 2 replicas.',
      'A task failed or its node became unavailable, so the orchestrator created a replacement to maintain the desired 3 running tasks.',
      'The whole service crashed and must be redeployed.',
      'Docker keeps every task ever created in the Running state.'
    ),
    correct: ['b'],
    explanation: 'Swarm keeps a task history; a Shutdown task plus a new Running task means the original task ended and was rescheduled to keep the declared replica count. The service itself is healthy and was not scaled down.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `docker service create` flag publishes container port 80 on swarm port 8080 using the routing mesh?',
    options: opts4(
      '--expose 8080:80',
      '--publish published=8080,target=80',
      '--port 8080:80 --mesh',
      '--ingress 8080:80'
    ),
    correct: ['b'],
    explanation: '`--publish published=8080,target=80` (or `-p 8080:80`) publishes the port through the swarm routing mesh by default (ingress mode). `--expose` only documents a port; the other flags are not valid.',
    references: [REF_SWARM_INGRESS, REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a swarm service to publish a port but bypass the routing mesh so each node only answers when it runs a task locally. Which publish mode achieves this?',
    options: opts4(
      'mode=ingress',
      'mode=host',
      'mode=global',
      'mode=direct'
    ),
    correct: ['b'],
    explanation: '`--publish mode=host` binds the port directly on the node running the task, skipping the routing mesh. `mode=ingress` is the default mesh behavior; `global`/`direct` are not publish modes.',
    references: [REF_SWARM_INGRESS]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command removes a stack named `app` and all of its services, networks, and configs from the swarm?',
    options: opts4(
      'docker stack rm app',
      'docker stack down app',
      'docker swarm rm app',
      'docker service rm app'
    ),
    correct: ['a'],
    explanation: '`docker stack rm app` deletes every resource that stack created. There is no `docker stack down`; `docker service rm` only removes a single service, not the whole stack.',
    references: [REF_STACK]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about swarm service rollbacks and health.',
    options: opts4(
      'docker service rollback reverts a service to its previous specification.',
      'A --update-failure-action rollback can automatically roll back an update when too many tasks fail.',
      'A container HEALTHCHECK status of unhealthy can cause swarm to replace the task during an update.',
      'Rollbacks are impossible once an update completes.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Swarm stores the prior service spec so `docker service rollback` and `--update-failure-action rollback` work; healthchecks feed update decisions. Rollback to the previous spec remains available after an update completes, so D is false.',
    references: [REF_SWARM_SVC, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A node shows `Availability: Active` but `Status: Down` in `docker node ls`. What does this indicate?',
    options: opts4(
      'The node is intentionally drained.',
      'The manager has lost contact with the node (it is unreachable/offline) even though it is configured to accept tasks.',
      'The node has been removed from the swarm.',
      'The node is paused for maintenance.'
    ),
    correct: ['b'],
    explanation: '`Availability=Active` means it should accept tasks, but `Status=Down` means the manager cannot reach it, so its tasks are rescheduled elsewhere. Drain/pause are availability values, not the Down status.',
    references: [REF_SWARM_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command scales the swarm service `api` to 10 replicas?',
    options: opts4(
      'docker service scale api=10',
      'docker scale api 10',
      'docker service replicas api 10',
      'docker swarm scale api=10'
    ),
    correct: ['a'],
    explanation: '`docker service scale api=10` (or `docker service update --replicas 10 api`) sets the desired replica count. The other commands are not valid Docker CLI syntax.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Swarm mode is a separate product you must install in addition to the Docker Engine.',
    options: opts4('True', 'False', 'Only on Windows', 'Only with Docker Desktop'),
    correct: ['b'],
    explanation: 'False. Swarm mode is built into the Docker Engine; you simply run `docker swarm init` to enable it — no separate package or installation is required.',
    references: [REF_SWARM]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.SINGLE,
    stem: 'You want to back up the swarm so the cluster can be recovered if managers are lost. What should you back up on a manager?',
    options: opts4(
      'Only /var/lib/docker/volumes',
      'The /var/lib/docker/swarm directory (the Raft state/store), ideally with the daemon stopped',
      'The image cache under /var/lib/docker/overlay2',
      'The /etc/docker/daemon.json file alone'
    ),
    correct: ['b'],
    explanation: 'The swarm Raft state and TLS material live under `/var/lib/docker/swarm`; backing it up (engine stopped for consistency) lets you restore the cluster. Volumes and image cache do not contain swarm cluster state.',
    references: [REF_SWARM_ADMIN, REF_SWARM_RAFT]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A `docker stack deploy` Compose file uses the `deploy:` key with `replicas`, `placement`, and `resources`. Where are these honored?',
    options: opts4(
      'Only by docker compose up locally.',
      'Only by swarm (docker stack deploy) — the deploy key is ignored by plain docker compose up.',
      'By both, identically.',
      'By the registry when pushing.'
    ),
    correct: ['b'],
    explanation: 'The `deploy:` section is a swarm-specific directive applied by `docker stack deploy`; standalone `docker compose up` ignores it. It has nothing to do with registries.',
    references: [REF_STACK, REF_SWARM_SVC]
  },

  // ── Image Creation, Management, and Registry (+9 → 13 total) ──
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Dockerfile instruction sets environment variables that persist in the running container?',
    options: opts4(
      'ARG',
      'ENV',
      'SET',
      'EXPORT'
    ),
    correct: ['b'],
    explanation: '`ENV` defines variables available at build time and in the running container. `ARG` values are build-time only and not present at runtime; `SET`/`EXPORT` are not Dockerfile instructions.',
    references: [REF_DOCKERFILE]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the difference between `ARG` and `ENV` in a Dockerfile?',
    options: opts4(
      'They are identical aliases.',
      'ARG defines build-time variables (passed via --build-arg) not present at runtime; ENV sets variables available both at build time and in the running container.',
      'ENV is build-time only; ARG is runtime only.',
      'ARG can only be used in multi-stage builds.'
    ),
    correct: ['b'],
    explanation: 'ARG values are supplied with `--build-arg` and only exist during the build; ENV values persist into the image and container environment. Both can be used in any build, single- or multi-stage.',
    references: [REF_DOCKERFILE, REF_BUILD]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command authenticates the Docker CLI to a registry so subsequent pushes/pulls are authorized?',
    options: opts4(
      'docker auth registry.example.com',
      'docker login registry.example.com',
      'docker registry login',
      'docker connect registry.example.com'
    ),
    correct: ['b'],
    explanation: '`docker login <registry>` stores credentials (in `~/.docker/config.json` or a credential helper) for that registry. `docker auth`/`docker connect`/`docker registry login` are not valid commands.',
    references: [REF_REGISTRY, REF_CLI]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to inspect the build history and layer commands of an image `myapp:1.0`. Which command shows this?',
    options: opts4(
      'docker image history myapp:1.0',
      'docker image layers myapp:1.0',
      'docker inspect --layers myapp:1.0',
      'docker build --show-history myapp:1.0'
    ),
    correct: ['a'],
    explanation: '`docker image history` (or `docker history`) lists the layers and the instruction that created each. `docker inspect` shows config/metadata but not the per-layer build commands the way history does; the others are not valid.',
    references: [REF_LAYERS, REF_CLI]
  },
  {
    domain: IMAGE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker registries and image references.',
    options: opts4(
      'An image reference has the form [registry[:port]/]repository[:tag|@digest].',
      'If no registry is specified, the Docker CLI defaults to Docker Hub (docker.io).',
      'docker push always pushes to the local daemon only.',
      'An insecure (HTTP) registry must be allowed via the insecure-registries daemon setting.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'References include an optional registry and a tag or digest; an omitted registry defaults to docker.io; HTTP registries require the `insecure-registries` allowlist. `docker push` sends the image to a remote registry, not the local daemon, so C is false.',
    references: [REF_REGISTRY, REF_PUSH, REF_DAEMON]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command saves the image `myapp:1.0` to a portable tar archive that can be loaded on an air-gapped host?',
    options: opts4(
      'docker export myapp:1.0 > myapp.tar',
      'docker save -o myapp.tar myapp:1.0',
      'docker commit myapp:1.0 myapp.tar',
      'docker image archive myapp:1.0'
    ),
    correct: ['b'],
    explanation: '`docker save` writes one or more images (with all layers/metadata) to a tar that `docker load` can import. `docker export` dumps a container filesystem (not an image with history); `docker commit` creates an image from a container.',
    references: [REF_CLI, REF_LAYERS]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A HEALTHCHECK instruction in a Dockerfile primarily lets Docker:',
    options: opts4(
      'Sign the image so only trusted versions run.',
      'Periodically run a command inside the container to report its health (healthy/unhealthy) so orchestrators can act on it.',
      'Scan the image for CVEs at build time.',
      'Reduce the number of layers in the image.'
    ),
    correct: ['b'],
    explanation: 'HEALTHCHECK defines a probe whose exit status sets the container health state, which swarm and tooling use for replacement/routing. It does not sign, scan, or change layering.',
    references: [REF_DOCKERFILE, REF_SWARM_SVC]
  },
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Running `docker image prune` (without -a) removes all unused images, including tagged ones not used by any container.',
    options: opts4('True', 'False', 'Only with --volumes', 'Only in swarm mode'),
    correct: ['b'],
    explanation: 'False. `docker image prune` removes only dangling images (untagged, no repository). You must add `-a`/`--all` to also remove unused but tagged images.',
    references: [REF_CLI, REF_LAYERS]
  },
  {
    domain: IMAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'You build for both linux/amd64 and linux/arm64 and want a single tag clients can pull on either architecture. What Docker feature provides this?',
    options: opts4(
      'A manifest list / multi-architecture image built with docker buildx',
      'A multi-stage build',
      'The .dockerignore file',
      'Docker Content Trust'
    ),
    correct: ['a'],
    explanation: 'A manifest list (multi-arch image), typically produced with `docker buildx build --platform`, lets one tag resolve to the right per-architecture image automatically. Multi-stage builds, .dockerignore, and content trust solve unrelated problems.',
    references: [REF_BUILD, REF_MULTISTAGE]
  },

  // ── Installation and Configuration (+7 → 10 total) ──
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which daemon.json key sets the default cgroup/OCI runtime, and what is the conventional default runtime name?',
    options: opts4(
      '"default-runtime": "runc"',
      '"oci-runtime": "containerd"',
      '"runtime": "docker"',
      '"exec-runtime": "runc"'
    ),
    correct: ['a'],
    explanation: 'The `default-runtime` key chooses which OCI runtime new containers use; the conventional default is `runc`. The other keys are not valid daemon configuration options.',
    references: [REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command displays disk usage by images, containers, volumes, and build cache?',
    options: opts4(
      'docker system df',
      'docker disk usage',
      'docker info --disk',
      'docker volume df'
    ),
    correct: ['a'],
    explanation: '`docker system df` summarizes space used (and reclaimable) by images, containers, local volumes, and build cache. The other commands are not valid.',
    references: [REF_CLI, REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'A container exits immediately and you want it to restart automatically unless you explicitly stop it, surviving daemon restarts. Which restart policy fits?',
    options: opts4(
      '--restart no',
      '--restart on-failure:3',
      '--restart unless-stopped',
      '--restart=once'
    ),
    correct: ['c'],
    explanation: '`unless-stopped` restarts the container automatically (including after daemon/host reboot) unless it was explicitly stopped. `on-failure:3` caps retries and only on non-zero exit; `--restart=once` is not a valid policy.',
    references: [REF_CLI, REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'After adding your user to the `docker` group, why can that user run Docker without sudo, and what is the security caveat?',
    options: opts4(
      'It does not work; sudo is always required.',
      'The docker group grants access to the Docker daemon socket, which is root-equivalent — group membership effectively grants root on the host.',
      'It only allows read-only Docker commands.',
      'It encrypts the Docker socket for that user.'
    ),
    correct: ['b'],
    explanation: 'Members of the `docker` group can talk to the daemon socket, and the Docker API is root-equivalent (mount host paths, run privileged containers). Treat docker-group membership as granting root.',
    references: [REF_SECURITY, REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command streams real-time resource usage (CPU, memory, network, block I/O) for running containers?',
    options: opts4(
      'docker stats',
      'docker top',
      'docker metrics',
      'docker monitor'
    ),
    correct: ['a'],
    explanation: '`docker stats` shows a live stream of per-container CPU/memory/network/IO usage. `docker top` lists processes inside one container; `docker metrics`/`docker monitor` are not commands.',
    references: [REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid daemon.json configuration keys.',
    options: opts4(
      '"insecure-registries"',
      '"registry-mirrors"',
      '"default-address-pools"',
      '"auto-prune-everything"'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`insecure-registries`, `registry-mirrors`, and `default-address-pools` are real daemon options (HTTP registries, pull-through mirrors, and the address ranges for new bridge/overlay networks). `auto-prune-everything` is not a Docker daemon key.',
    references: [REF_DAEMON, REF_NETWORK]
  },
  {
    domain: INSTALL, difficulty: 4, type: QType.SINGLE,
    stem: 'You add `"registry-mirrors": ["https://mirror.example.com"]` to daemon.json. What is the effect?',
    options: opts4(
      'All pushes go to mirror.example.com.',
      'Docker Hub pulls are first attempted through the configured pull-through mirror, reducing rate limits and latency.',
      'It disables Docker Hub entirely.',
      'It signs images automatically.'
    ),
    correct: ['b'],
    explanation: 'A registry mirror is a pull-through cache for Docker Hub: pulls try the mirror first. It does not affect pushes, does not disable Hub, and does not sign images.',
    references: [REF_DAEMON, REF_REGISTRY]
  },

  // ── Networking (+7 → 10 total) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all networks the Docker daemon manages?',
    options: opts4(
      'docker network ls',
      'docker net list',
      'docker network show',
      'docker ls networks'
    ),
    correct: ['a'],
    explanation: '`docker network ls` lists networks with their ID, name, driver, and scope. The other forms are not valid Docker CLI syntax.',
    references: [REF_NETWORK]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You attach a running container to an additional user-defined network after it started. Which command does this?',
    options: opts4(
      'docker network connect mynet mycontainer',
      'docker network add mycontainer mynet',
      'docker container network mycontainer mynet',
      'docker attach --network mynet mycontainer'
    ),
    correct: ['a'],
    explanation: '`docker network connect <network> <container>` attaches a running container to another network (and `docker network disconnect` removes it). The other commands are not valid.',
    references: [REF_NETWORK, REF_BRIDGE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A container run with `--network none` has what connectivity?',
    options: opts4(
      'Full access to the host network.',
      'Only a loopback interface — no external network connectivity at all.',
      'Access to the default bridge only.',
      'Access to overlay networks only.'
    ),
    correct: ['b'],
    explanation: 'The `none` driver gives the container its own network namespace with only loopback and no external interfaces — useful for fully isolated, network-free workloads.',
    references: [REF_NETWORK]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Two containers must communicate, but you do NOT want them reachable from any other container on the host. The best approach is to:',
    options: opts4(
      'Put them both on the default bridge network.',
      'Create a dedicated user-defined bridge network and attach only those two containers to it.',
      'Use --network host for both.',
      'Publish all their ports with -p.'
    ),
    correct: ['b'],
    explanation: 'A dedicated user-defined network isolates the two containers (with DNS by name) from containers on other networks. The shared default bridge mixes all containers; host networking removes isolation; publishing ports exposes them more widely.',
    references: [REF_BRIDGE, REF_NETWORK]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about swarm overlay networking.',
    options: opts4(
      'Overlay networks let services on different swarm nodes communicate as if on one L2 network.',
      'Swarm overlay control plane traffic can be encrypted with the --opt encrypted flag on the network.',
      'Containers not part of a service cannot ever join a swarm overlay network.',
      'The overlay driver uses VXLAN encapsulation under the hood.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Overlay spans nodes via VXLAN and supports optional data-plane encryption (`--opt encrypted`). Standalone containers CAN join an overlay if it is created `--attachable`, so C is false.',
    references: [REF_OVERLAY, REF_SWARM]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows the IP address and network attachments of a running container `web`?',
    options: opts4(
      'docker inspect web (look at NetworkSettings)',
      'docker network ip web',
      'docker container ip web',
      'docker ps --ip web'
    ),
    correct: ['a'],
    explanation: '`docker inspect web` exposes `NetworkSettings`/`Networks` with the container IP, gateway, and attached networks (you can also use a `--format` template). The other commands are not valid.',
    references: [REF_NETWORK, REF_CLI]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'You publish `-p 80:80` for two different containers on the same host at the same time. What happens to the second one?',
    options: opts4(
      'Both share port 80 transparently via the routing mesh.',
      'The second container fails to start (or the run fails) because host port 80 is already bound.',
      'Docker automatically remaps the second to a random port.',
      'The first container is stopped to free the port.'
    ),
    correct: ['b'],
    explanation: 'A published host port is exclusive on a standalone host, so binding the same port twice fails with a port-already-allocated error. Docker does not auto-remap or stop the existing container; the routing mesh applies to swarm services, not standalone `-p`.',
    references: [REF_NETWORK, REF_BRIDGE]
  },

  // ── Security (+7 → 10 total) ──
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `docker run` flag makes the container root filesystem read-only, forcing writable data into explicit volumes/tmpfs?',
    options: opts4(
      '--read-only',
      '--immutable',
      '--no-write',
      '--ro-rootfs'
    ),
    correct: ['a'],
    explanation: '`--read-only` mounts the container filesystem read-only; you then add `--tmpfs` or volumes for paths that must be writable. The other flags do not exist.',
    references: [REF_SECURITY, REF_CAPS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'How are Docker swarm secrets exposed inside a container that the service is granted?',
    options: opts4(
      'As environment variables.',
      'As in-memory files mounted under /run/secrets/<secret_name>.',
      'Written to the image during build.',
      'In the container labels.'
    ),
    correct: ['b'],
    explanation: 'A granted secret is mounted as a tmpfs-backed file at `/run/secrets/<name>`, never persisted to disk or the image and not placed in env vars (which can leak via inspect/logs).',
    references: [REF_SECRETS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `docker run` flag prevents a process inside the container from gaining new privileges (e.g. via setuid binaries)?',
    options: opts4(
      '--security-opt no-new-privileges',
      '--cap-drop SETUID',
      '--privileged=false',
      '--no-setuid'
    ),
    correct: ['a'],
    explanation: '`--security-opt no-new-privileges` sets the kernel `no_new_privs` bit so setuid/setgid binaries cannot escalate privileges. Dropping SETUID alone is narrower; `--privileged=false` is just the default; `--no-setuid` is not a flag.',
    references: [REF_SECURITY, REF_CAPS]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'By default, the root user inside a container (without userns-remap) is the same root (UID 0) as on the host.',
    options: opts4('True', 'False', 'Only on Windows', 'Only with --privileged'),
    correct: ['a'],
    explanation: 'True. Without user-namespace remapping, container UID 0 maps to host UID 0; that is exactly why running as non-root and/or enabling userns-remap is recommended to limit breakout impact.',
    references: [REF_USERNS, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to apply a custom AppArmor profile to a container. Which flag is used?',
    options: opts4(
      '--security-opt apparmor=my-profile',
      '--apparmor my-profile',
      '--lsm apparmor=my-profile',
      '--profile apparmor:my-profile'
    ),
    correct: ['a'],
    explanation: '`--security-opt apparmor=<profile>` selects the AppArmor profile for the container (Docker also loads a default `docker-default` profile). The other flag forms are not valid.',
    references: [REF_SECURITY, REF_SECCOMP]
  },
  {
    domain: SEC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker Content Trust (DCT).',
    options: opts4(
      'Setting DOCKER_CONTENT_TRUST=1 makes docker pull only retrieve signed images.',
      'DCT uses The Update Framework (TUF) / Notary for signing and verification.',
      'With DCT enabled, docker push signs the pushed image.',
      'DCT scans images for vulnerabilities before allowing them to run.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DCT (Notary/TUF) signs on push and verifies signatures on pull/run when enabled. It is an integrity/publisher control, not a vulnerability scanner — that is a separate tool like Docker Scout.',
    references: [REF_TRUST, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is mounting the host Docker socket (`-v /var/run/docker.sock:/var/run/docker.sock`) into a container a serious risk?',
    options: opts4(
      'It only slows the container down.',
      'The container can then control the Docker daemon, which is root-equivalent, allowing full host compromise.',
      'It disables container DNS.',
      'It prevents the container from using volumes.'
    ),
    correct: ['b'],
    explanation: 'A container with the daemon socket can create privileged containers and mount host paths, effectively gaining root on the host. Grant it only to trusted tooling and prefer scoped/proxied access.',
    references: [REF_SECURITY, REF_DAEMON]
  },

  // ── Storage and Volumes (+4 → 6 total) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command removes all unused (dangling) local volumes to reclaim space?',
    options: opts4(
      'docker volume prune',
      'docker volume clean',
      'docker prune volumes',
      'docker volume rm --unused'
    ),
    correct: ['a'],
    explanation: '`docker volume prune` deletes local volumes not referenced by any container. The other commands are not valid Docker CLI syntax.',
    references: [REF_VOLUMES, REF_CLI]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `docker run` flag mounts a host directory `/data` into the container at `/app/data` as a bind mount using the --mount syntax?',
    options: opts4(
      '--mount type=bind,source=/data,target=/app/data',
      '--mount type=volume,source=/data,target=/app/data',
      '-v bind:/data:/app/data',
      '--bind /data:/app/data'
    ),
    correct: ['a'],
    explanation: '`--mount type=bind,source=/data,target=/app/data` is the explicit bind-mount form. `type=volume` would treat `/data` as a named volume; `-v bind:...` and `--bind` are not valid.',
    references: [REF_BINDMOUNT, REF_VOLUMES]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A volume driver/plugin (e.g. for NFS or cloud block storage) lets you:',
    options: opts4(
      'Only create volumes on the local disk.',
      'Provision and attach volumes backed by external/remote storage systems so data survives node loss and can move between hosts.',
      'Encrypt the image registry.',
      'Replace the need for a Dockerfile.'
    ),
    correct: ['b'],
    explanation: 'Volume plugins integrate external storage backends (NFS, cloud block/file storage), enabling portable, durable data across hosts — important for stateful services in a cluster. They are unrelated to registries or Dockerfiles.',
    references: [REF_VOLUMES, REF_STORAGEDRIVER]
  },
  {
    domain: STORAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'You mount a named volume into a fresh container at a path that already contains files in the image. What happens on first use of an empty named volume?',
    options: opts4(
      'The image files at that path are deleted.',
      'Docker copies the existing image content at the mount path into the new empty named volume (volume pre-population).',
      'The container fails to start.',
      'The volume is ignored and the image files are used.'
    ),
    correct: ['b'],
    explanation: 'For an empty named volume, Docker pre-populates it with the content already present at the mount target in the image. (This copy behavior does not apply to bind mounts or to non-empty volumes.)',
    references: [REF_VOLUMES, REF_BINDMOUNT]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Orchestration (5) ──
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all nodes participating in a swarm (run from a manager)?',
    options: opts4(
      'docker swarm ls',
      'docker node ls',
      'docker service ps',
      'docker stack nodes'
    ),
    correct: ['b'],
    explanation: '`docker node ls` lists swarm nodes with their availability, manager status, and leader. `docker swarm ls` is not valid; `docker service ps` lists tasks of a service; there is no `docker stack nodes`.',
    references: [REF_SWARM_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A swarm manager node is being decommissioned for maintenance. Which is the correct first step to safely move work off it without losing manager quorum?',
    options: opts4(
      'docker node rm <node> immediately',
      'docker node update --availability drain <node>',
      'docker swarm leave on that node while it is still the leader',
      'docker service scale all=0'
    ),
    correct: ['b'],
    explanation: 'Setting availability to `drain` reschedules tasks off the node while keeping it in the swarm. Removing or leaving abruptly can break quorum; you demote and then remove managers carefully.',
    references: [REF_SWARM_NODES, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'How does the swarm routing mesh make a published service port reachable?',
    options: opts4(
      'Only the node currently running a task answers on the published port.',
      'Every node in the swarm listens on the published port and routes the request to an active task, even if no task runs locally.',
      'You must configure an external load balancer manually for any access.',
      'The published port is reachable only from inside containers.'
    ),
    correct: ['b'],
    explanation: 'The routing mesh makes the published port available on every swarm node; incoming traffic is load-balanced to a healthy task wherever it runs. An external LB is optional, not required.',
    references: [REF_SWARM_INGRESS]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'You create a swarm service that needs a database password. What is the recommended way to deliver it?',
    options: opts4(
      'Bake it into the image with ENV in the Dockerfile',
      'Pass it via --env on docker service create',
      'Create a Docker secret and attach it with --secret so it is mounted at /run/secrets',
      'Store it in a world-readable bind mount'
    ),
    correct: ['c'],
    explanation: 'Docker secrets are encrypted in the Raft log, transmitted only to nodes running the service, and exposed in-memory at /run/secrets. ENV/--env and bind mounts leak the value in image history, inspect output, or the filesystem.',
    references: [REF_SECRETS]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker swarm services and stacks.',
    options: opts4(
      'docker service update --image newimage:tag triggers a rolling update of the service tasks.',
      'Swarm configs (docker config) are intended for non-sensitive configuration files.',
      'A stack deployed with docker stack deploy can include services, networks, and volumes from a single Compose file.',
      'Worker nodes can run docker service create to schedule new services.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Service updates roll out per the update config; configs hold non-secret data; stacks bundle services/networks/volumes. Only manager nodes accept orchestration commands like `service create` — workers cannot.',
    references: [REF_SWARM_SVC, REF_CONFIGS, REF_STACK]
  },

  // ── Image Creation, Management, and Registry (4) ──
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Dockerfile instruction copies files from the build context and also supports remote URLs and automatic tar extraction?',
    options: opts4(
      'COPY',
      'ADD',
      'GET',
      'IMPORT'
    ),
    correct: ['b'],
    explanation: '`ADD` can fetch remote URLs and auto-extract local tar archives; `COPY` is the simpler, preferred instruction for plain file copies. `GET`/`IMPORT` are not Dockerfile instructions.',
    references: [REF_DOCKERFILE, REF_LAYERS]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A teammate reports your image is huge because each RUN apt-get installs and then a later RUN deletes the cache. Why is the image still large?',
    options: opts4(
      'apt-get does not actually download anything.',
      'Each RUN is a separate layer; files added in one layer still occupy space even if deleted in a later layer.',
      'Docker compresses only the final layer.',
      'The .dockerignore file overrides layer sizes.'
    ),
    correct: ['b'],
    explanation: 'Layers are additive and immutable; deleting a file in a later layer hides it but its bytes remain in the earlier layer. Combine install + cleanup in a single RUN (or use multi-stage) to keep it out of the image.',
    references: [REF_LAYERS]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'What does `docker pull nginx@sha256:abc123...` guarantee compared to `docker pull nginx:latest`?',
    options: opts4(
      'It always pulls the newest build of nginx.',
      'It pulls the exact, immutable image content identified by that digest regardless of tag movement.',
      'It runs a vulnerability scan before pulling.',
      'It pulls from Docker Hub only and never a private registry.'
    ),
    correct: ['b'],
    explanation: 'Pinning by digest fetches the precise image content (reproducible/immutable). A tag like `latest` can be re-pointed at any time. Digest pinning does not scan images or restrict the registry.',
    references: [REF_PUSH, REF_TAG]
  },
  {
    domain: IMAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'You run a local Docker registry with `docker run -d -p 5000:5000 registry:2`. To push `myapp` to it you should tag the image as:',
    options: opts4(
      'myapp:5000',
      'localhost:5000/myapp',
      'registry:2/myapp',
      'docker.io/library/myapp'
    ),
    correct: ['b'],
    explanation: 'The registry host:port must prefix the repository, e.g. `localhost:5000/myapp`, before `docker push localhost:5000/myapp`. The other forms either lack the registry host or point at Docker Hub.',
    references: [REF_REGISTRY, REF_PUSH]
  },

  // ── Installation and Configuration (3) ──
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which daemon.json setting changes where Docker stores images, containers, and volumes on disk?',
    options: opts4(
      '"data-root": "/mnt/docker"',
      '"graph-path": "/mnt/docker"',
      '"storage-path": "/mnt/docker"',
      '"root-dir": "/mnt/docker"'
    ),
    correct: ['a'],
    explanation: '`data-root` (formerly the deprecated `graph`) sets the Docker data directory. The other keys are not valid daemon configuration options.',
    references: [REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows system-wide Docker information including the storage driver, logging driver, and number of containers/images?',
    options: opts4(
      'docker version',
      'docker info',
      'docker inspect docker',
      'docker system version'
    ),
    correct: ['b'],
    explanation: '`docker info` reports daemon-level details: storage/logging drivers, container and image counts, swarm status, etc. `docker version` shows client/server versions only.',
    references: [REF_CLI, REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'On Linux, which storage driver does Docker recommend and use by default on modern kernels with overlay filesystem support?',
    options: opts4(
      'aufs',
      'devicemapper',
      'overlay2',
      'vfs'
    ),
    correct: ['c'],
    explanation: '`overlay2` is the recommended, default storage driver on supported Linux kernels. `aufs`/`devicemapper` are legacy; `vfs` has no copy-on-write and is used only for testing.',
    references: [REF_STORAGEDRIVER, REF_DAEMON]
  },

  // ── Networking (3) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a user-defined overlay network named `appnet` for use by swarm services?',
    options: opts4(
      'docker network create -d overlay appnet',
      'docker network add overlay appnet',
      'docker swarm network create appnet',
      'docker overlay create appnet'
    ),
    correct: ['a'],
    explanation: '`docker network create -d overlay appnet` creates an attachable swarm-scoped overlay network. The other commands are not valid Docker CLI syntax.',
    references: [REF_OVERLAY, REF_NETWORK]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A container started with `--network host` behaves how with respect to port publishing?',
    options: opts4(
      'It still requires -p to expose ports.',
      'It shares the host network namespace; the service binds directly to host ports and -p is ignored.',
      'It cannot reach the network at all.',
      'It gets its own IP on the default bridge.'
    ),
    correct: ['b'],
    explanation: 'With the host driver the container uses the host network stack directly, so processes bind host ports without `-p` (which is ignored). There is no separate container IP or bridge attachment.',
    references: [REF_HOST]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'You want containers to appear as distinct physical hosts on the existing 192.168.10.0/24 LAN, each with its own LAN IP. Which network driver is designed for this?',
    options: opts4(
      'bridge',
      'overlay',
      'macvlan',
      'none'
    ),
    correct: ['c'],
    explanation: 'The macvlan driver attaches containers directly to the physical network with their own MAC/IP, making them appear as separate devices on the LAN. bridge NATs behind the host; overlay is multi-host swarm; none disables networking.',
    references: [REF_MACVLAN]
  },

  // ── Security (3) ──
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'What does running a container with `--privileged` do?',
    options: opts4(
      'It drops all Linux capabilities for maximum isolation.',
      'It grants the container nearly all host capabilities and device access, largely disabling isolation safeguards.',
      'It forces the container to run as a non-root user.',
      'It enables Docker Content Trust for that container.'
    ),
    correct: ['b'],
    explanation: '`--privileged` gives the container almost full host access (all capabilities, devices, relaxed seccomp/AppArmor). It is the opposite of least privilege and should be avoided unless strictly required.',
    references: [REF_CAPS, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'By default Docker applies a seccomp profile to containers. What does this profile do?',
    options: opts4(
      'It encrypts the container root filesystem.',
      'It restricts the set of Linux syscalls a container process may invoke, blocking dangerous ones by default.',
      'It signs images on push.',
      'It rotates container logs.'
    ),
    correct: ['b'],
    explanation: 'Seccomp filters syscalls; Docker ships a default profile that blocks a large set of dangerous calls while allowing those most apps need. It is unrelated to encryption, signing, or logging.',
    references: [REF_SECCOMP]
  },
  {
    domain: SEC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL recommended Docker security hardening practices.',
    options: opts4(
      'Run containers as a non-root user where possible (USER instruction or --user).',
      'Use --cap-drop ALL and add back only required capabilities.',
      'Run every container with --privileged for convenience.',
      'Enable Docker Content Trust to only run signed images.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Non-root users, dropping capabilities, and content trust all reduce risk. Running everything `--privileged` does the opposite — it removes isolation and is explicitly discouraged.',
    references: [REF_SECURITY, REF_CAPS, REF_TRUST]
  },

  // ── Storage and Volumes (2) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command creates a named volume called `dbdata`?',
    options: opts4(
      'docker volume create dbdata',
      'docker volume add dbdata',
      'docker create volume dbdata',
      'docker storage new dbdata'
    ),
    correct: ['a'],
    explanation: '`docker volume create <name>` creates a managed named volume. The other forms are not valid Docker CLI commands.',
    references: [REF_VOLUMES]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A container is removed with `docker rm`. What happens to data written into a named volume it used?',
    options: opts4(
      'The volume and its data are deleted along with the container.',
      'The named volume and its data persist and can be reused by another container.',
      'The data is moved into the image.',
      'The volume becomes read-only permanently.'
    ),
    correct: ['b'],
    explanation: 'Named volumes have a lifecycle independent of containers; removing the container leaves the volume and its data intact (unless `docker rm -v` or `docker volume rm` is used). Anonymous volumes can be pruned, but named ones persist.',
    references: [REF_VOLUMES]
  },

  // ── Orchestration (+11 → 16 total) ──
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command makes the current manager node leave the swarm and dismantle it (last manager)?',
    options: opts4(
      'docker swarm leave --force',
      'docker swarm destroy',
      'docker node rm self',
      'docker swarm down'
    ),
    correct: ['a'],
    explanation: '`docker swarm leave --force` is required for a manager (especially the last one) to leave; without `--force` the engine refuses to avoid breaking quorum. `docker swarm destroy/down` are not valid.',
    references: [REF_SWARM_NODES, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You run `docker service logs web`. What does this show?',
    options: opts4(
      'Only the logs of the manager node.',
      'Aggregated logs from all tasks (replicas) of the service across the swarm.',
      'The swarm Raft log.',
      'Only build logs of the image.'
    ),
    correct: ['b'],
    explanation: '`docker service logs` aggregates stdout/stderr from every task of the service across nodes. It is not the Raft log or build output.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `docker service create` option reserves 512 MB of memory and limits the service to 1 CPU per task?',
    options: opts4(
      '--reserve-mem 512m --max-cpu 1',
      '--reserve-memory 512m --limit-cpu 1',
      '--memory 512m --cpus 1',
      '--mem-reservation 512m --cpu-quota 1'
    ),
    correct: ['b'],
    explanation: 'Swarm services use `--reserve-memory`/`--reserve-cpu` for scheduling reservations and `--limit-memory`/`--limit-cpu` for hard limits. `--memory`/`--cpus` are `docker run` (standalone) flags, not service flags; the others are invalid.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.SINGLE,
    stem: 'A swarm has 4 manager nodes. How many manager failures can it tolerate while keeping quorum?',
    options: opts4(
      '2',
      '1',
      '3',
      '0'
    ),
    correct: ['b'],
    explanation: 'Quorum needs a majority: with 4 managers a majority is 3, so only 1 failure is tolerated — the same as 3 managers. This is why odd numbers of managers are recommended.',
    references: [REF_SWARM_RAFT, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists the running tasks (and their nodes) for the service `api`?',
    options: opts4(
      'docker service ps api',
      'docker service tasks api',
      'docker ps --service api',
      'docker node ps api'
    ),
    correct: ['a'],
    explanation: '`docker service ps api` lists the service tasks, their desired/current state, and the node each runs on. `docker node ps` lists tasks on a *node*, not a service; the other forms are invalid.',
    references: [REF_SWARM_SVC, REF_SWARM_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about swarm node availability states.',
    options: opts4(
      'active means the node can receive new tasks.',
      'pause means existing tasks keep running but no new tasks are scheduled to the node.',
      'drain means existing tasks are stopped and rescheduled elsewhere and no new tasks are placed.',
      'active means the node is removed from the swarm.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'active accepts new tasks; pause keeps current tasks but blocks new ones; drain evacuates and blocks scheduling. active does not remove the node from the swarm, so D is false.',
    references: [REF_SWARM_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A service deployed with `--mode replicated-job --replicas 5` behaves how?',
    options: opts4(
      'It keeps 5 tasks running forever.',
      'It runs 5 tasks to completion (one-shot batch job) and does not restart them once they exit successfully.',
      'It runs one task per node forever.',
      'It is rejected — jobs are not supported in swarm.'
    ),
    correct: ['b'],
    explanation: 'A replicated job runs the requested number of tasks until they complete successfully (batch semantics), unlike a long-running replicated service. Global-job is the per-node variant; jobs are supported in swarm.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You can run `docker service create` from a swarm worker node.',
    options: opts4('True', 'False', 'Only with --force', 'Only for global services'),
    correct: ['b'],
    explanation: 'False. Orchestration commands such as `docker service create/scale/update` must be issued against a manager node; workers only execute tasks and cannot accept these commands.',
    references: [REF_SWARM_SVC, REF_SWARM_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command rotates the swarm join tokens (e.g. after a suspected leak of a worker token)?',
    options: opts4(
      'docker swarm join-token --rotate worker',
      'docker swarm token reset worker',
      'docker node rotate-token worker',
      'docker swarm regenerate worker'
    ),
    correct: ['a'],
    explanation: '`docker swarm join-token --rotate worker` (or `manager`) invalidates the old token and issues a new one. The other commands are not valid Docker CLI syntax.',
    references: [REF_SWARM_NODES, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.SINGLE,
    stem: 'In a Compose/stack file, what is the effect of `deploy.placement.constraints: [node.role == manager]`?',
    options: opts4(
      'The service tasks may run on any node.',
      'The service tasks are scheduled only onto manager nodes.',
      'It promotes workers to managers.',
      'It is ignored by docker stack deploy.'
    ),
    correct: ['b'],
    explanation: 'A placement constraint of `node.role == manager` restricts the service to manager nodes (a common pattern for cluster-aware tooling). It does not change node roles and is honored by `docker stack deploy`.',
    references: [REF_STACK, REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command demotes a manager node `node-2` back to a worker?',
    options: opts4(
      'docker node demote node-2',
      'docker swarm demote node-2',
      'docker node update --worker node-2',
      'docker manager rm node-2'
    ),
    correct: ['a'],
    explanation: '`docker node demote <node>` (shortcut for `docker node update --role worker`) returns a manager to worker status. The other forms are not valid.',
    references: [REF_SWARM_NODES, REF_SWARM_ADMIN]
  },

  // ── Image Creation, Management, and Registry (+9 → 13 total) ──
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Dockerfile instruction documents that the container listens on a given port at runtime (without actually publishing it)?',
    options: opts4(
      'PORT',
      'EXPOSE',
      'LISTEN',
      'PUBLISH'
    ),
    correct: ['b'],
    explanation: '`EXPOSE` documents the intended listening port (used by tooling and `-P`), but does not publish it to the host — you still need `-p`/`-P` at run time. `PORT`/`LISTEN`/`PUBLISH` are not Dockerfile instructions.',
    references: [REF_DOCKERFILE]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You build with `docker build --target builder -t app:dev .` on a multi-stage Dockerfile. What does `--target` do?',
    options: opts4(
      'It signs the image.',
      'It stops the build at the named stage, producing an image of just that stage (useful for debugging or test images).',
      'It selects the registry to push to.',
      'It sets the default CMD.'
    ),
    correct: ['b'],
    explanation: '`--target <stage>` builds only up to the named stage, so you can produce an intermediate (e.g. build/test) image without the final runtime stage. It has nothing to do with signing, registries, or CMD.',
    references: [REF_MULTISTAGE, REF_BUILD]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all images present in the local Docker image store?',
    options: opts4(
      'docker images (or docker image ls)',
      'docker image list --remote',
      'docker registry ls',
      'docker ps -a --images'
    ),
    correct: ['a'],
    explanation: '`docker images` / `docker image ls` lists locally stored images with repository, tag, ID, and size. `docker ps` lists containers; the others are not valid.',
    references: [REF_CLI, REF_LAYERS]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to retag an existing image `app:1.0` as `app:latest` without rebuilding. Which command?',
    options: opts4(
      'docker image tag app:1.0 app:latest',
      'docker image rename app:1.0 app:latest',
      'docker image alias app:1.0 app:latest',
      'docker tag --new app:latest app:1.0'
    ),
    correct: ['a'],
    explanation: '`docker image tag <source> <target>` adds an additional tag pointing at the same image ID (no rebuild). The other commands are not valid Docker CLI syntax.',
    references: [REF_TAG]
  },
  {
    domain: IMAGE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL effective ways to reduce final Docker image size.',
    options: opts4(
      'Use a minimal base image (e.g. alpine or distroless).',
      'Use multi-stage builds to discard build tooling.',
      'Combine related RUN steps and clean package caches in the same layer.',
      'Add every debugging tool you might ever need to the runtime image.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Minimal bases, multi-stage builds, and cleaning caches within the same RUN all shrink images. Bundling many debug tools into the runtime image does the opposite and enlarges the attack surface.',
    references: [REF_LAYERS, REF_MULTISTAGE]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the difference between `docker save` and `docker export`?',
    options: opts4(
      'They are identical.',
      '`docker save` archives one or more images with all layers and metadata; `docker export` flattens a single container\'s filesystem into a tar (no image history).',
      '`docker export` archives images; `docker save` archives containers.',
      'Both only work on running containers.'
    ),
    correct: ['b'],
    explanation: '`docker save`/`docker load` preserve full image layer history; `docker export`/`docker import` produce a flattened single-layer filesystem from a container. They are not interchangeable and save works on images regardless of run state.',
    references: [REF_LAYERS, REF_CLI]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Dockerfile instruction sets the working directory for subsequent RUN/CMD/ENTRYPOINT/COPY instructions?',
    options: opts4(
      'CD',
      'WORKDIR',
      'CHDIR',
      'PWD'
    ),
    correct: ['b'],
    explanation: '`WORKDIR` sets (and creates if needed) the directory used by following instructions and as the default at runtime. Using shell `cd` in a RUN does not persist across instructions; `CD`/`CHDIR`/`PWD` are not instructions.',
    references: [REF_DOCKERFILE]
  },
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Dockerfile may contain multiple FROM instructions, each starting a new build stage.',
    options: opts4('True', 'False', 'Only with buildx', 'Only one FROM is ever allowed'),
    correct: ['a'],
    explanation: 'True. Multiple `FROM` lines define multi-stage builds; each `FROM` begins a new stage that can be named with `AS <name>` and selectively copied from.',
    references: [REF_MULTISTAGE, REF_DOCKERFILE]
  },
  {
    domain: IMAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'You see a build step show `---> Using cache`. What does that mean, and how can you force a clean rebuild?',
    options: opts4(
      'It means the build failed; rerun with sudo.',
      'The layer was reused from the build cache because the instruction and inputs were unchanged; use `docker build --no-cache` to rebuild everything.',
      'It means the image is signed; disable content trust.',
      'It means the registry served the layer; log out to fix it.'
    ),
    correct: ['b'],
    explanation: 'Docker reuses a cached layer when the instruction and its inputs are unchanged; `--no-cache` disables the build cache so all steps re-execute. It is unrelated to signing or registry auth.',
    references: [REF_LAYERS, REF_BUILD]
  },

  // ── Installation and Configuration (+7 → 10 total) ──
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which daemon.json key enables IPv6 networking for containers?',
    options: opts4(
      '"ipv6": true',
      '"enable-ipv6": true',
      '"net6": true',
      '"v6": "on"'
    ),
    correct: ['b'],
    explanation: 'The `"ipv6": true` key (paired with a `fixed-cidr-v6` range) enables IPv6 for the default bridge in daemon.json; older docs reference `enable-ipv6` per-network, but as a daemon option the canonical key is `ipv6`. Of the listed options only the IPv6-enabling boolean is meaningful — `net6`/`v6` are not valid keys.',
    references: [REF_DAEMON, REF_NETWORK]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the Docker client and daemon (server) version and API version?',
    options: opts4(
      'docker version',
      'docker info',
      'docker --release',
      'docker system version'
    ),
    correct: ['a'],
    explanation: '`docker version` prints client and server versions, the Go version, and the API version. `docker info` shows daemon configuration/stats but not the version layout; `docker --release`/`docker system version` are not valid.',
    references: [REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'You want the Docker daemon to start automatically on boot of a systemd Linux host. Which command sets that up?',
    options: opts4(
      'systemctl enable docker',
      'docker daemon --boot',
      'systemctl autostart docker',
      'docker config startup on'
    ),
    correct: ['a'],
    explanation: '`systemctl enable docker` creates the boot-time start link (add `--now` to also start it immediately). The other commands are not valid.',
    references: [REF_INSTALL, REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command tails and follows the logs of a single container `web` started without swarm?',
    options: opts4(
      'docker logs -f web',
      'docker service logs -f web',
      'docker tail web',
      'docker container output web'
    ),
    correct: ['a'],
    explanation: '`docker logs -f web` follows the stdout/stderr captured by the container logging driver. `docker service logs` is for swarm services; `docker tail`/`docker container output` do not exist.',
    references: [REF_LOGGING, REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which logging driver should you configure to ship container logs to a centralized syslog server?',
    options: opts4(
      'json-file',
      'syslog',
      'none',
      'local'
    ),
    correct: ['b'],
    explanation: 'The `syslog` driver forwards container logs to a syslog endpoint. `json-file`/`local` store logs on the host; `none` disables collection (and `docker logs`).',
    references: [REF_LOGGING]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker logging.',
    options: opts4(
      'With the json-file driver, docker logs can read container output.',
      'With certain remote drivers (e.g. syslog/gelf), docker logs may not return output unless dual logging is enabled.',
      'log-opts max-size and max-file configure json-file log rotation.',
      'The none driver still allows docker logs to work normally.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'json-file (and local) support `docker logs`; some remote drivers do not unless dual logging is on; max-size/max-file rotate json-file logs. The `none` driver disables `docker logs`, so D is false.',
    references: [REF_LOGGING, REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 4, type: QType.SINGLE,
    stem: 'A daemon fails to start after editing daemon.json. The most likely cause and first thing to check is:',
    options: opts4(
      'The host has no internet.',
      'Invalid JSON syntax or an unknown/duplicate key in /etc/docker/daemon.json — validate the file and check the daemon journal/logs.',
      'Docker requires a reboot for every change.',
      'The image cache is corrupt.'
    ),
    correct: ['b'],
    explanation: 'dockerd refuses to start on malformed JSON or unrecognized options; check `journalctl -u docker` (or the daemon log) and validate `daemon.json`. Connectivity and the image cache are unrelated to a config-parse failure.',
    references: [REF_DAEMON, REF_INSTALL]
  },

  // ── Networking (+7 → 10 total) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command deletes a user-defined network named `appnet` (when no containers are attached)?',
    options: opts4(
      'docker network rm appnet',
      'docker network delete appnet',
      'docker rm network appnet',
      'docker network destroy appnet'
    ),
    correct: ['a'],
    explanation: '`docker network rm appnet` removes the network (it must have no attached containers). The other forms are not valid Docker CLI syntax.',
    references: [REF_NETWORK]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'On a user-defined bridge network, container A wants to reach container B by a custom hostname `db`. How do you set that alias?',
    options: opts4(
      'It is impossible; only container names resolve.',
      'Use --network-alias db when running container B (or networks.<net>.aliases in Compose).',
      'Edit /etc/hosts on the host.',
      'Publish a port with -p db:5432.'
    ),
    correct: ['b'],
    explanation: 'A network alias (`--network-alias db`) registers an extra DNS name on that user-defined network so other containers resolve `db`. Editing host `/etc/hosts` or publishing a port does not create container DNS aliases.',
    references: [REF_BRIDGE, REF_NETWORK]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'What does the `-P` (capital) flag do on `docker run`?',
    options: opts4(
      'Publishes a specific host:container port pair.',
      'Publishes all ports declared with EXPOSE to random high host ports.',
      'Disables port publishing.',
      'Runs the container in privileged mode.'
    ),
    correct: ['b'],
    explanation: '`-P` publishes every EXPOSEd port to ephemeral host ports (see them via `docker port`). `-p` (lowercase) maps specific ports; `-P` is unrelated to privilege.',
    references: [REF_NETWORK, REF_BRIDGE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Which daemon.json setting lets you change the default subnet pools Docker uses when creating bridge/overlay networks (e.g. to avoid clashing with corporate IP ranges)?',
    options: opts4(
      '"default-address-pools"',
      '"bip-range"',
      '"subnet-pool"',
      '"network-cidr"'
    ),
    correct: ['a'],
    explanation: '`default-address-pools` defines the base CIDR ranges and sizes from which Docker carves new network subnets, useful to avoid overlap with existing infrastructure. The other keys are not valid.',
    references: [REF_DAEMON, REF_NETWORK]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker DNS and service discovery.',
    options: opts4(
      'Containers on a user-defined network resolve each other by container name via Docker\'s embedded DNS.',
      'In swarm, a service is reachable by its service name, which resolves to a virtual IP (VIP) load-balancing across tasks by default.',
      'You can switch a swarm service to DNS round-robin (dnsrr) endpoint mode instead of VIP.',
      'The legacy default bridge provides automatic name-based DNS resolution.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'User-defined networks and swarm services provide embedded DNS; swarm defaults to a VIP and supports `dnsrr` mode. The legacy default bridge does NOT provide automatic name resolution, so D is false.',
    references: [REF_BRIDGE, REF_OVERLAY, REF_SWARM_SVC]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows detailed configuration of a network, including connected containers and subnet?',
    options: opts4(
      'docker network inspect appnet',
      'docker network show appnet',
      'docker inspect --net appnet',
      'docker network detail appnet'
    ),
    correct: ['a'],
    explanation: '`docker network inspect appnet` returns the driver, subnet/gateway, options, and attached containers. The other forms are not valid Docker CLI syntax.',
    references: [REF_NETWORK]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'A macvlan network is configured with `--subnet 192.168.10.0/24 --gateway 192.168.10.1 -o parent=eth0`. A common limitation to be aware of is:',
    options: opts4(
      'Containers cannot get IP addresses at all.',
      'By default the Docker host itself cannot communicate with the macvlan containers over that interface (macvlan host/container isolation).',
      'Macvlan only works in swarm mode.',
      'Macvlan disables DNS for all containers on the host.'
    ),
    correct: ['b'],
    explanation: 'With macvlan, the parent host interface generally cannot talk to its own macvlan child containers without an extra macvlan sub-interface workaround. It does work outside swarm and does not globally disable DNS.',
    references: [REF_MACVLAN, REF_NETWORK]
  },

  // ── Security (+7 → 10 total) ──
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `docker run` flag runs the container process as UID 1000 instead of root, overriding the image USER?',
    options: opts4(
      '--user 1000',
      '--uid 1000',
      '--as-user 1000',
      '--run-as 1000'
    ),
    correct: ['a'],
    explanation: '`--user 1000` (or `--user 1000:1000`) sets the runtime UID/GID, overriding the Dockerfile `USER`. `--uid`/`--as-user`/`--run-as` are not valid flags.',
    references: [REF_SECURITY, REF_CAPS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'When securing the Docker daemon TCP socket, which port and protection are conventional?',
    options: opts4(
      'Port 2375 with no TLS.',
      'Port 2376 protected with TLS mutual authentication (client and server certificates).',
      'Port 22 over SSH only.',
      'Port 80 with basic auth.'
    ),
    correct: ['b'],
    explanation: 'The convention is TLS-protected daemon access on port 2376 with mutual cert auth; port 2375 is the unencrypted (dangerous) port and should not be exposed. SSH/HTTP basic auth are not the Docker API transport.',
    references: [REF_SECURITY, REF_DAEMON]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command updates a swarm secret\'s usage by removing it from a service and adding a new version (since secret contents are immutable)?',
    options: opts4(
      'docker secret edit',
      'docker service update --secret-rm old --secret-add new',
      'docker secret rotate',
      'docker secret update --value'
    ),
    correct: ['b'],
    explanation: 'Swarm secrets are immutable, so rotation is done by creating a new secret and using `docker service update --secret-rm <old> --secret-add <new>`. There is no `docker secret edit`/`rotate`/`update --value`.',
    references: [REF_SECRETS, REF_SWARM_SVC]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Anyone with access to the Docker daemon (Unix socket or unauthenticated TCP) can effectively obtain root on the host.',
    options: opts4('True', 'False', 'Only on Windows', 'Only with --privileged'),
    correct: ['a'],
    explanation: 'True. The Docker API is root-equivalent: a caller can run privileged containers and bind-mount the host filesystem, so daemon access must be tightly controlled (TLS, socket permissions).',
    references: [REF_SECURITY, REF_DAEMON]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `docker run` option disables the default seccomp profile entirely (generally NOT recommended)?',
    options: opts4(
      '--security-opt seccomp=unconfined',
      '--no-seccomp',
      '--cap-drop seccomp',
      '--seccomp off'
    ),
    correct: ['a'],
    explanation: '`--security-opt seccomp=unconfined` runs the container without syscall filtering; you can also point it at a custom JSON profile. It widens the attack surface and is discouraged. The other forms are not valid.',
    references: [REF_SECCOMP, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL controls that help limit the blast radius of a container compromise.',
    options: opts4(
      'Running the container as a non-root user.',
      'Dropping unneeded Linux capabilities (--cap-drop).',
      'Enabling user-namespace remapping on the daemon.',
      'Mounting the host Docker socket into the container.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Non-root users, dropped capabilities, and userns-remap all shrink what a compromised container can do. Mounting the Docker socket does the opposite — it grants root-equivalent host control.',
    references: [REF_SECURITY, REF_CAPS, REF_USERNS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should images be pinned by digest (image@sha256:...) in security-sensitive deployments?',
    options: opts4(
      'Digests download faster than tags.',
      'A digest is immutable content-addressable, so you always run exactly the verified bytes even if a tag is later re-pushed/poisoned.',
      'Digests automatically scan for CVEs.',
      'Digests bypass the registry login.'
    ),
    correct: ['b'],
    explanation: 'Tags are mutable and can be re-pointed; a digest guarantees the exact image content you reviewed/approved is what runs. It does not change download speed, scan for CVEs, or skip authentication.',
    references: [REF_TRUST, REF_PUSH]
  },

  // ── Storage and Volumes (+4 → 6 total) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command lists all Docker-managed volumes on the host?',
    options: opts4(
      'docker volume ls',
      'docker volume list --all',
      'docker ls volumes',
      'docker storage ls'
    ),
    correct: ['a'],
    explanation: '`docker volume ls` lists volumes with their driver and name. The other forms are not valid Docker CLI syntax.',
    references: [REF_VOLUMES, REF_CLI]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You append `:ro` to a volume mount, e.g. `-v data:/app/data:ro`. What does this do?',
    options: opts4(
      'Deletes the volume after the container stops.',
      'Mounts the volume read-only inside the container so the process cannot modify it.',
      'Makes the volume reside only in RAM.',
      'Replicates the volume to other hosts.'
    ),
    correct: ['b'],
    explanation: 'The `:ro` option mounts the volume read-only for that container (the default is `rw`). It does not delete, move to RAM, or replicate the volume.',
    references: [REF_VOLUMES, REF_BINDMOUNT]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A bind mount can shadow (hide) files that exist at the same path inside the image.',
    options: opts4('True', 'False', 'Only for named volumes', 'Only in swarm mode'),
    correct: ['a'],
    explanation: 'True. A bind mount overlays the host path onto the target, hiding any image content previously at that path; unlike an empty named volume, a bind mount is never pre-populated from the image.',
    references: [REF_BINDMOUNT, REF_VOLUMES]
  },
  {
    domain: STORAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'A stateful database service in swarm uses a local named volume. When the task reschedules to a different node, the data is missing. What is the correct explanation/fix?',
    options: opts4(
      'Local volumes are automatically replicated; the issue must be a bug.',
      'Local volumes are node-local and do not follow a rescheduled task; use a shared/clustered volume plugin (or pin the task to its node) for persistent stateful data.',
      'Swarm never reschedules database tasks.',
      'You must run docker volume prune to fix it.'
    ),
    correct: ['b'],
    explanation: 'A `local` volume only exists on the node it was created on, so a rescheduled task on another node sees an empty/new volume. Use a volume plugin backed by shared storage, or constrain the task to its node, for durable stateful workloads.',
    references: [REF_VOLUMES, REF_STORAGEDRIVER]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Orchestration (5) ──
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command retrieves the worker join token needed to add a new worker node to an existing swarm?',
    options: opts4(
      'docker swarm join-token worker',
      'docker node token worker',
      'docker swarm token --worker',
      'docker swarm worker-token'
    ),
    correct: ['a'],
    explanation: '`docker swarm join-token worker` (run on a manager) prints the full `docker swarm join` command with the worker token. The other forms are not valid CLI syntax.',
    references: [REF_SWARM_NODES]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A 3-manager swarm loses 2 managers simultaneously. What is the cluster state?',
    options: opts4(
      'The swarm continues normally; 1 manager is enough.',
      'The swarm loses quorum: existing tasks keep running but no new orchestration/scheduling decisions can be made until quorum is restored.',
      'All running containers are immediately killed.',
      'Worker nodes are automatically promoted to managers to restore quorum.'
    ),
    correct: ['b'],
    explanation: 'Quorum needs a majority (2 of 3). With only 1 manager left, the control plane is read-only for orchestration — running tasks continue, but scheduling/updates are blocked until quorum is recovered. Workers are not auto-promoted.',
    references: [REF_SWARM_RAFT, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `docker service create` option restricts a service\'s tasks to run only on nodes labeled `region=eu`?',
    options: opts4(
      '--placement-pref region=eu',
      '--constraint node.labels.region==eu',
      '--filter region=eu',
      '--node-label region=eu'
    ),
    correct: ['b'],
    explanation: '`--constraint node.labels.region==eu` is a hard placement constraint. `--placement-pref` only biases spread; the other flags are not valid.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'You update a swarm service image and want only one task replaced at a time, waiting 10s between batches. Which options configure this?',
    options: opts4(
      '--update-parallelism 1 --update-delay 10s',
      '--rolling 1 --pause 10s',
      '--batch-size 1 --batch-wait 10s',
      '--replicas 1 --delay 10s'
    ),
    correct: ['a'],
    explanation: '`--update-parallelism` sets how many tasks update at once and `--update-delay` the wait between batches. The other flag names are not part of the Docker service update configuration.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker on Kubernetes and orchestration choices.',
    options: opts4(
      'Docker Desktop can run a single-node Kubernetes cluster for local development.',
      'A Docker Compose file can target either swarm (docker stack deploy) or be translated for other orchestrators.',
      'Swarm mode is built into the Docker Engine and requires no separate installation.',
      'Kubernetes and swarm cannot both be concepts you prepare for; only swarm exists in Docker.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Docker Desktop bundles an optional single-node Kubernetes; Compose files drive swarm stacks; swarm mode ships in the Engine. Option D is false — both Kubernetes and swarm orchestration are relevant.',
    references: [REF_K8S, REF_SWARM, REF_STACK]
  },

  // ── Image Creation, Management, and Registry (4) ──
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command builds an image from the current directory and tags it `myapp:2.0`?',
    options: opts4(
      'docker build -t myapp:2.0 .',
      'docker image new myapp:2.0 .',
      'docker create -t myapp:2.0 .',
      'docker compile myapp:2.0 .'
    ),
    correct: ['a'],
    explanation: '`docker build -t name:tag <context>` builds and tags an image. `docker create` makes a container from an existing image; the other commands do not exist.',
    references: [REF_BUILD]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the purpose of a `.dockerignore` file?',
    options: opts4(
      'It lists Dockerfile instructions to skip.',
      'It excludes files/directories from the build context sent to the daemon, speeding builds and avoiding leaking secrets.',
      'It marks layers as cacheable.',
      'It tells the registry which tags to ignore.'
    ),
    correct: ['b'],
    explanation: '`.dockerignore` prunes the build context (e.g. .git, node_modules, secrets) before it is sent to the daemon. It has nothing to do with skipping instructions, caching, or registry tags.',
    references: [REF_BUILD, REF_LAYERS]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Dockerfile best practices.',
    options: opts4(
      'Order instructions so that frequently changing layers (e.g. app source) come after stable ones (e.g. dependency install) to maximize cache reuse.',
      'Prefer a minimal base image to reduce size and attack surface.',
      'Use multi-stage builds to keep build-only tooling out of the final image.',
      'Always run the application as root for compatibility.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Layer ordering for cache, minimal bases, and multi-stage builds are recommended. Running as root is discouraged — prefer a dedicated non-root USER.',
    references: [REF_LAYERS, REF_MULTISTAGE]
  },
  {
    domain: IMAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'Difference between `ENTRYPOINT ["app"]` and `CMD ["app"]` when the user runs `docker run image arg1`?',
    options: opts4(
      'Both are completely replaced by arg1.',
      'With ENTRYPOINT, arg1 is appended as an argument to app; with CMD, arg1 replaces the command entirely.',
      'CMD runs at build time; ENTRYPOINT at run time.',
      'There is no functional difference.'
    ),
    correct: ['b'],
    explanation: 'Run-time arguments are appended to an exec-form ENTRYPOINT but override CMD. A common pattern is ENTRYPOINT for the binary and CMD for default args. Neither runs at build time (that is RUN).',
    references: [REF_DOCKERFILE]
  },

  // ── Installation and Configuration (3) ──
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which daemon.json key configures the daemon to listen on a TCP socket in addition to the default Unix socket?',
    options: opts4(
      '"hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2376"]',
      '"listen": "tcp://0.0.0.0:2376"',
      '"bind": "0.0.0.0:2376"',
      '"api-port": 2376'
    ),
    correct: ['a'],
    explanation: 'The `hosts` array sets the sockets dockerd listens on. Exposing TCP should be paired with TLS (port 2376). The other keys are not valid daemon options.',
    references: [REF_DAEMON, REF_SECURITY]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command would you use to reclaim disk by removing stopped containers, unused networks, dangling images, and build cache?',
    options: opts4(
      'docker system prune',
      'docker clean --all',
      'docker gc',
      'docker rmi --unused'
    ),
    correct: ['a'],
    explanation: '`docker system prune` removes stopped containers, unused networks, dangling images, and build cache (add `-a`/`--volumes` for more). The other commands are not valid.',
    references: [REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'You set `"live-restore": true` in daemon.json. What does this enable?',
    options: opts4(
      'Containers keep running while the Docker daemon is down (e.g. during a daemon upgrade/restart).',
      'Automatic restart of the daemon if it crashes.',
      'Live migration of containers between hosts.',
      'Real-time replication of volumes.'
    ),
    correct: ['a'],
    explanation: 'live-restore keeps containers running during daemon downtime/upgrades. It is not crash auto-restart, container live migration, or volume replication.',
    references: [REF_DAEMON]
  },

  // ── Networking (3) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Containers attached to the default (legacy) bridge network get automatic DNS-based name resolution between each other just like on user-defined bridge networks.',
    options: opts4('True', 'False', 'Only with --link', 'Only in swarm mode'),
    correct: ['b'],
    explanation: 'False. The default `bridge` network does NOT provide automatic container name resolution; only user-defined networks include the embedded DNS server. The legacy `--link` flag was the old workaround on the default bridge.',
    references: [REF_BRIDGE, REF_NETWORK]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You run `docker run -d -p 127.0.0.1:8080:80 nginx`. Who can reach the web server?',
    options: opts4(
      'Anyone on the network via the host\'s external IP on port 8080.',
      'Only clients on the host itself (loopback), since the publish is bound to 127.0.0.1.',
      'Only other containers on the bridge network.',
      'No one — binding to 127.0.0.1 disables the port.'
    ),
    correct: ['b'],
    explanation: 'Specifying `127.0.0.1:8080:80` binds the published port to the host loopback only, so remote hosts cannot reach it — useful for restricting exposure. Containers on the bridge reach nginx by its container IP regardless.',
    references: [REF_NETWORK, REF_BRIDGE]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'In swarm mode, what is the `ingress` network used for?',
    options: opts4(
      'It is a user-defined overlay you must create before deploying any service.',
      'It is a special built-in overlay network that carries the routing-mesh traffic for services that publish ports.',
      'It connects manager nodes\' Raft traffic.',
      'It is the default bridge each swarm node uses for local containers.'
    ),
    correct: ['b'],
    explanation: 'The `ingress` overlay is created automatically with the swarm and handles routing-mesh load-balanced traffic for published service ports. Raft control traffic and the local default bridge are separate.',
    references: [REF_SWARM_INGRESS, REF_OVERLAY]
  },

  // ── Security (3) ──
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Why is exposing the Docker daemon on an unauthenticated TCP socket (e.g. tcp://0.0.0.0:2375) dangerous?',
    options: opts4(
      'It only slows down image pulls.',
      'Anyone who can reach the socket can run containers and effectively gain root on the host.',
      'It disables container logging.',
      'It prevents the use of volumes.'
    ),
    correct: ['b'],
    explanation: 'The Docker API is root-equivalent: full access to the daemon allows running privileged containers and mounting the host filesystem. Always require TLS/mutual auth (port 2376) or keep it on the Unix socket.',
    references: [REF_SECURITY, REF_DAEMON]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Dockerfile instruction helps reduce risk by ensuring the container process does not run as root?',
    options: opts4(
      'PRIVILEGE none',
      'USER appuser',
      'ROOT off',
      'SECURITY nonroot'
    ),
    correct: ['b'],
    explanation: 'The `USER` instruction sets the UID/username the container runs as, enabling least-privilege non-root execution. The other instructions do not exist.',
    references: [REF_SECURITY, REF_DOCKERFILE]
  },
  {
    domain: SEC, difficulty: 4, type: QType.SINGLE,
    stem: 'Image vulnerability scanning (e.g. docker scout) primarily helps you to:',
    options: opts4(
      'Sign images so only trusted ones run.',
      'Identify known CVEs in the packages and base layers of an image so you can remediate them.',
      'Restrict syscalls available to the container.',
      'Remap container UIDs to the host.'
    ),
    correct: ['b'],
    explanation: 'Scanning surfaces known vulnerabilities (CVEs) in image contents so you can patch/upgrade. Signing is content trust, syscall restriction is seccomp, and UID remap is userns — different controls.',
    references: [REF_SECURITY, REF_TRUST]
  },

  // ── Storage and Volumes (2) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which docker run syntax mounts the named volume `data` at `/var/lib/app` inside the container?',
    options: opts4(
      'docker run -v data:/var/lib/app myimg',
      'docker run --mount /var/lib/app=data myimg',
      'docker run --volume=/data myimg',
      'docker run -p data:/var/lib/app myimg'
    ),
    correct: ['a'],
    explanation: '`-v <volumename>:<container-path>` mounts a named volume (equivalently `--mount type=volume,source=data,target=/var/lib/app`). `-p` publishes ports, not volumes; the other forms are malformed.',
    references: [REF_VOLUMES]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A copy-on-write storage driver like overlay2 affects container write performance how?',
    options: opts4(
      'All writes are blocked unless a volume is attached.',
      'The first modification of a file from a lower image layer triggers a copy-up into the container layer, adding overhead for write-heavy workloads.',
      'Writes are faster than a bind mount in every case.',
      'It stores writes directly back into the image layers.'
    ),
    correct: ['b'],
    explanation: 'Copy-on-write copies a file up from the image layers to the writable layer on first modification, which is costly for write-heavy or large-file workloads — hence using volumes/bind mounts for such data. Image layers themselves remain read-only.',
    references: [REF_STORAGEDRIVER, REF_VOLUMES]
  },

  // ── Orchestration (+11 → 16 total) ──
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command retrieves the manager join token for adding another manager to an existing swarm?',
    options: opts4(
      'docker swarm join-token manager',
      'docker node token manager',
      'docker swarm manager-token',
      'docker swarm token --manager'
    ),
    correct: ['a'],
    explanation: '`docker swarm join-token manager` (run on a manager) prints the full join command with the manager token. The other forms are not valid Docker CLI syntax.',
    references: [REF_SWARM_NODES, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'What does `docker service inspect --pretty web` provide?',
    options: opts4(
      'Only the container logs.',
      'A human-readable summary of the service spec: image, mode, replicas, networks, update config, etc.',
      'The Raft store contents.',
      'The Dockerfile used to build the image.'
    ),
    correct: ['b'],
    explanation: '`docker service inspect --pretty` formats the service definition (image, replicas/mode, ports, update policy) for humans; without `--pretty` it returns JSON. It does not expose logs, the Raft store, or the Dockerfile.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which option on `docker service update` adds a published port to an existing service?',
    options: opts4(
      '--port-add 8080:80',
      '--publish-add 8080:80',
      '--expose-add 8080:80',
      '--add-port 8080:80'
    ),
    correct: ['b'],
    explanation: 'Service updates use `--publish-add`/`--publish-rm` to change published ports (mirrored by `--env-add`, `--mount-add`, etc.). `--port-add`/`--expose-add`/`--add-port` are not valid options.',
    references: [REF_SWARM_SVC, REF_SWARM_INGRESS]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.SINGLE,
    stem: 'You want at most one replica of a service per node (spread it out) without forcing global mode. Which placement option helps?',
    options: opts4(
      '--replicas-max-per-node 1',
      '--placement-pref spread=node.id',
      '--constraint node.role==worker',
      '--mode global only'
    ),
    correct: ['a'],
    explanation: '`--replicas-max-per-node 1` caps how many tasks of the service may run on a single node, spreading replicas without using global mode. `--placement-pref spread` biases distribution but does not hard-cap per node; a role constraint just filters nodes.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists the stacks currently deployed to the swarm?',
    options: opts4(
      'docker stack ls',
      'docker stack list --all',
      'docker swarm stacks',
      'docker service stacks'
    ),
    correct: ['a'],
    explanation: '`docker stack ls` lists deployed stacks and their service counts. The other forms are not valid Docker CLI syntax.',
    references: [REF_STACK]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about swarm certificates and security.',
    options: opts4(
      'Swarm uses mutual TLS between nodes for control-plane communication.',
      'Manager and worker join tokens differ and can be rotated independently.',
      'The CA certificate expiry/rotation interval can be configured with docker swarm update --cert-expiry.',
      'Swarm sends all node traffic in plaintext by default.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Swarm auto-provisions a CA and uses mutual TLS; tokens are role-specific and rotatable; `--cert-expiry` tunes certificate rotation. Control-plane traffic is encrypted by default, so D is false.',
    references: [REF_SWARM_ADMIN, REF_SWARM]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A swarm service uses `--restart-condition on-failure`. What does this mean for its tasks?',
    options: opts4(
      'Tasks are restarted only when they exit with a non-zero status.',
      'Tasks never restart.',
      'Tasks restart even on a clean (zero) exit.',
      'Tasks restart only when the node reboots.'
    ),
    correct: ['a'],
    explanation: '`on-failure` restarts a task only on non-zero exit; `any` (the default) restarts regardless of exit code, and `none` never restarts. It is independent of node reboots.',
    references: [REF_SWARM_SVC]
  },
  {
    domain: ORCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a swarm, manager nodes can also run service tasks (act as workers) by default.',
    options: opts4('True', 'False', 'Only if drained', 'Only single-node swarms'),
    correct: ['a'],
    explanation: 'True. By default managers also schedule and run tasks; you can set a manager to `Drain` availability if you want it to handle orchestration only and not run workloads.',
    references: [REF_SWARM_NODES, REF_SWARM_ADMIN]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'How do swarm configs differ from swarm secrets?',
    options: opts4(
      'Configs are encrypted at rest in Raft and mounted at /run/secrets; secrets are plaintext.',
      'Configs are for non-sensitive data and are not encrypted at rest the way secrets are; secrets are encrypted in the Raft log and intended for sensitive values.',
      'They are identical features with different names.',
      'Configs can only hold binary data; secrets only text.'
    ),
    correct: ['b'],
    explanation: 'Secrets are encrypted in the Raft store and mounted at `/run/secrets` for sensitive data; configs deliver non-sensitive configuration files and are not given the same at-rest encryption guarantees. Both can hold text or binary.',
    references: [REF_CONFIGS, REF_SECRETS]
  },
  {
    domain: ORCH, difficulty: 4, type: QType.SINGLE,
    stem: 'After losing quorum (most managers gone) and being unable to recover them, which command can force a single surviving manager to form a new single-manager cluster from the existing Raft state?',
    options: opts4(
      'docker swarm init --force-new-cluster',
      'docker swarm recover',
      'docker node promote --force',
      'docker swarm join --rebuild'
    ),
    correct: ['a'],
    explanation: '`docker swarm init --force-new-cluster` (run on a surviving manager) reinitializes the swarm from the local Raft data with a single manager, after which you re-add managers/workers. The other commands are not valid recovery operations.',
    references: [REF_SWARM_ADMIN, REF_SWARM_RAFT]
  },
  {
    domain: ORCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command removes the swarm service `web` and stops all of its tasks?',
    options: opts4(
      'docker service rm web',
      'docker service stop web',
      'docker service delete web',
      'docker swarm rm web'
    ),
    correct: ['a'],
    explanation: '`docker service rm web` removes the service and terminates its tasks (there is no `docker service stop`/`delete`). `docker swarm rm` is not a valid subcommand.',
    references: [REF_SWARM_SVC]
  },

  // ── Image Creation, Management, and Registry (+9 → 13 total) ──
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Dockerfile instruction adds key/value metadata (e.g. maintainer, version) to the image?',
    options: opts4(
      'META',
      'LABEL',
      'TAG',
      'ANNOTATE'
    ),
    correct: ['b'],
    explanation: '`LABEL key=value` attaches metadata visible via `docker inspect`/`docker image inspect`. `MAINTAINER` is deprecated in favor of LABEL; `META`/`TAG`/`ANNOTATE` are not Dockerfile instructions.',
    references: [REF_DOCKERFILE]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a build to fail if a required build argument is not provided. Which Dockerfile pattern enforces this?',
    options: opts4(
      'Declare ARG REQUIRED and reference ${REQUIRED:?error message} in a RUN step.',
      'Use CMD to validate it.',
      'Add VALIDATE ARG to the Dockerfile.',
      'It is impossible; args are always optional.'
    ),
    correct: ['a'],
    explanation: 'Declaring the `ARG` and using a shell parameter expansion like `${REQUIRED:?msg}` in a RUN causes the build to error if it is empty/unset. CMD runs at container start, not build; `VALIDATE ARG` is not an instruction.',
    references: [REF_DOCKERFILE, REF_BUILD]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command removes the local image `myapp:1.0`?',
    options: opts4(
      'docker rmi myapp:1.0 (or docker image rm myapp:1.0)',
      'docker image delete myapp:1.0',
      'docker rm -i myapp:1.0',
      'docker prune myapp:1.0'
    ),
    correct: ['a'],
    explanation: '`docker rmi` / `docker image rm` deletes an image (use `-f` if it is tagged multiple times or in use). `docker rm` removes containers; the other forms are not valid.',
    references: [REF_CLI, REF_LAYERS]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'In `COPY --from=builder /app/bin /usr/local/bin/`, what does `--from=builder` reference?',
    options: opts4(
      'A remote registry named builder.',
      'A previous build stage named builder, so artifacts are copied from that stage into the current one.',
      'A volume called builder.',
      'The host filesystem path /builder.'
    ),
    correct: ['b'],
    explanation: '`--from=<stage>` (or `--from=<image>`) copies files from an earlier multi-stage build stage (here `builder`) into the current stage — the core mechanism of multi-stage builds. It is not a registry, volume, or host path.',
    references: [REF_MULTISTAGE, REF_DOCKERFILE]
  },
  {
    domain: IMAGE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about image tags and the `latest` tag.',
    options: opts4(
      'latest is just a conventional default tag, not automatically the newest build.',
      'Pulling an image without a tag defaults to the latest tag.',
      'A tag can be re-pointed to a different image by tagging/pushing again.',
      'latest always guarantees the most recently built version of an image.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: '`latest` is only the default tag name with no recency guarantee; an untagged pull uses `:latest`; tags are mutable pointers. Therefore D is false — `latest` does not guarantee the newest build.',
    references: [REF_TAG, REF_PUSH]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A private registry returns "no basic auth credentials" on push. What is the most likely fix?',
    options: opts4(
      'Rebuild the image with --no-cache.',
      'Run docker login <registry> to authenticate before pushing.',
      'Add the image to .dockerignore.',
      'Enable Docker Content Trust.'
    ),
    correct: ['b'],
    explanation: 'That error means the CLI has no stored credentials for the registry; `docker login <registry>` authenticates and stores them so the push is authorized. Rebuilding, .dockerignore, and content trust are unrelated to the auth failure.',
    references: [REF_REGISTRY, REF_PUSH]
  },
  {
    domain: IMAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is the order of Dockerfile instructions important for build speed?',
    options: opts4(
      'Docker runs later instructions first.',
      'A change to an instruction invalidates the cache for it and all subsequent layers, so put rarely changing steps (e.g. dependency install) before frequently changing ones (e.g. COPY source).',
      'Order has no effect on caching.',
      'Only the FROM line affects caching.'
    ),
    correct: ['b'],
    explanation: 'The build cache is sequential: once a layer changes, every following layer is rebuilt. Placing stable steps early (and volatile COPY of source late) maximizes cache hits and speeds rebuilds.',
    references: [REF_LAYERS, REF_BUILD]
  },
  {
    domain: IMAGE, difficulty: 2, type: QType.SINGLE,
    stem: '`docker commit` creates a new image from the current state of a running or stopped container.',
    options: opts4('True', 'False', 'Only for paused containers', 'Only in swarm mode'),
    correct: ['a'],
    explanation: 'True. `docker commit <container> <image>` snapshots a container\'s filesystem into a new image, though building from a Dockerfile is preferred for reproducibility.',
    references: [REF_CLI, REF_LAYERS]
  },
  {
    domain: IMAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'You want to keep the build cache reusable across CI runners that do not share local storage. Which BuildKit feature helps?',
    options: opts4(
      'Registry-backed build cache via --cache-to/--cache-from with buildx.',
      'The .dockerignore file.',
      'Docker Content Trust.',
      'The HEALTHCHECK instruction.'
    ),
    correct: ['a'],
    explanation: 'BuildKit/buildx can export and import the build cache to/from a registry (`--cache-to`, `--cache-from`), letting ephemeral CI runners share cache. .dockerignore, content trust, and HEALTHCHECK do not address cache portability.',
    references: [REF_BUILD, REF_MULTISTAGE]
  },

  // ── Installation and Configuration (+7 → 10 total) ──
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which daemon.json key configures a list of DNS servers given to containers by default?',
    options: opts4(
      '"dns": ["8.8.8.8", "1.1.1.1"]',
      '"resolvers": ["8.8.8.8"]',
      '"nameservers": ["8.8.8.8"]',
      '"dns-config": "8.8.8.8"'
    ),
    correct: ['a'],
    explanation: 'The `dns` array sets the default DNS servers placed in containers\' resolv.conf (overridable per-container with `--dns`). The other keys are not valid daemon options.',
    references: [REF_DAEMON, REF_NETWORK]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command removes ALL stopped containers in one step?',
    options: opts4(
      'docker container prune',
      'docker rm --all-stopped',
      'docker clean containers',
      'docker container gc'
    ),
    correct: ['a'],
    explanation: '`docker container prune` deletes all stopped containers (with a confirmation prompt unless `-f`). The other commands are not valid Docker CLI syntax.',
    references: [REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to limit a single container to 512 MB of memory and 50% of one CPU. Which docker run flags apply?',
    options: opts4(
      '--memory 512m --cpus 0.5',
      '--mem 512 --cpu 50',
      '--ram 512m --cpu-limit 0.5',
      '--limit-mem 512m --limit-cpu 0.5'
    ),
    correct: ['a'],
    explanation: '`--memory 512m` sets the hard memory limit and `--cpus 0.5` caps CPU to half a core for a standalone container. The other flag names are not valid Docker run options.',
    references: [REF_CLI, REF_DAEMON]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command opens an interactive shell inside an already-running container `web`?',
    options: opts4(
      'docker exec -it web /bin/sh',
      'docker run -it web /bin/sh',
      'docker attach web sh',
      'docker shell web'
    ),
    correct: ['a'],
    explanation: '`docker exec -it web /bin/sh` starts a new interactive process in the running container. `docker run` would start a *new* container; `docker attach` connects to the main process stdio, not a new shell; `docker shell` is not a command.',
    references: [REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the low-level JSON configuration and state of a container `web`?',
    options: opts4(
      'docker inspect web',
      'docker container info web',
      'docker show web',
      'docker describe web'
    ),
    correct: ['a'],
    explanation: '`docker inspect web` returns detailed JSON (config, mounts, networks, state). The other commands are not valid Docker CLI syntax.',
    references: [REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker installation and the daemon on Linux.',
    options: opts4(
      'dockerd is the daemon and the docker CLI is a separate client that talks to it over a socket.',
      'On systemd hosts the service is typically managed via systemctl (start/stop/enable docker).',
      'daemon.json changes generally require a daemon restart (or reload) to take effect.',
      'The docker CLI must run on the same host as dockerd and cannot be remote.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The CLI is a client to `dockerd` over a socket, managed by systemd, and config changes need a restart/reload. The CLI can target a remote daemon (e.g. via TLS TCP or contexts), so D is false.',
    references: [REF_DAEMON, REF_INSTALL, REF_CLI]
  },
  {
    domain: INSTALL, difficulty: 4, type: QType.SINGLE,
    stem: 'You want to switch the docker CLI between multiple daemons (local, remote TLS) without changing env vars each time. Which feature is intended for this?',
    options: opts4(
      'docker context (docker context create/use)',
      'docker profile',
      'daemon.json aliases',
      'docker daemon switch'
    ),
    correct: ['a'],
    explanation: 'Docker contexts store endpoint/TLS settings per environment so `docker context use <name>` switches the active daemon target. `docker profile`/`docker daemon switch` and daemon.json aliases do not exist.',
    references: [REF_CLI, REF_DAEMON]
  },

  // ── Networking (+7 → 10 total) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows the public-facing host port mappings of a running container `web`?',
    options: opts4(
      'docker port web',
      'docker network port web',
      'docker inspect --ports web',
      'docker ps --ports web'
    ),
    correct: ['a'],
    explanation: '`docker port web` lists the container-to-host port mappings. `docker ps` shows ports in a column but `docker port` is the dedicated command; the other forms are not valid.',
    references: [REF_NETWORK, REF_CLI]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is the default `bridge` network generally discouraged for multi-container apps in favor of a user-defined bridge?',
    options: opts4(
      'The default bridge is slower hardware.',
      'User-defined bridges add automatic DNS-based service discovery and better isolation; the default bridge requires legacy --link and shares all containers.',
      'The default bridge cannot reach the internet.',
      'User-defined bridges are required for single containers.'
    ),
    correct: ['b'],
    explanation: 'User-defined bridges provide embedded DNS (resolve by container name) and segment containers; the legacy default bridge lacks automatic name resolution and groups every container together. Both have internet access via NAT.',
    references: [REF_BRIDGE, REF_NETWORK]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `docker run` option disconnects a container from networking entirely?',
    options: opts4(
      '--network none',
      '--no-net',
      '--network disabled',
      '--isolate-net'
    ),
    correct: ['a'],
    explanation: '`--network none` attaches the container to the `none` network so it has only loopback. `--no-net`/`--network disabled`/`--isolate-net` are not valid options.',
    references: [REF_NETWORK]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You created an overlay network but a standalone (non-service) container cannot attach to it. What likely needs to change?',
    options: opts4(
      'Overlay networks never allow containers.',
      'Recreate the overlay network with the --attachable flag so standalone containers may join it.',
      'Switch the container to host networking.',
      'Disable the routing mesh.'
    ),
    correct: ['b'],
    explanation: 'By default swarm overlay networks only accept service tasks; creating them with `--attachable` lets standalone containers connect too. Host networking and disabling the mesh do not address attachability.',
    references: [REF_OVERLAY, REF_NETWORK]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about publishing ports.',
    options: opts4(
      '-p 8080:80 maps host 8080 to container 80 on all host interfaces by default.',
      '-p 127.0.0.1:8080:80 restricts the published port to the host loopback only.',
      '-p 80 (single value) lets Docker pick a random host port for container port 80.',
      'EXPOSE in a Dockerfile publishes the port to the host automatically.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Port publishing supports all-interface, loopback-bound, and ephemeral host-port forms. `EXPOSE` only documents the port — it does not publish it; you still need `-p`/`-P`, so D is false.',
    references: [REF_NETWORK, REF_BRIDGE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'In swarm, a service\'s default endpoint mode is `vip`. What does that mean for clients resolving the service name?',
    options: opts4(
      'Each task IP is returned directly in round-robin.',
      'The service name resolves to a single stable virtual IP; the swarm load-balances connections across healthy tasks behind it.',
      'Clients must use the node IPs directly.',
      'The service is unreachable until you set dnsrr.'
    ),
    correct: ['b'],
    explanation: 'In `vip` mode the service name resolves to one virtual IP and swarm internally load-balances to tasks. `dnsrr` mode instead returns the individual task IPs for client-side balancing.',
    references: [REF_SWARM_SVC, REF_OVERLAY]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'Containers on different user-defined bridge networks on the same host cannot reach each other by default. How can you let a specific container reach both?',
    options: opts4(
      'It is impossible without host networking.',
      'Attach that container to both networks with docker network connect (multi-homing).',
      'Delete one of the networks.',
      'Publish every container port with -p.'
    ),
    correct: ['b'],
    explanation: 'User-defined bridge networks are isolated from each other; connecting a container to multiple networks (`docker network connect`) lets it communicate on both. Host networking or publishing ports are broader/less precise and not required.',
    references: [REF_BRIDGE, REF_NETWORK]
  },

  // ── Security (+7 → 10 total) ──
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which `docker run` flag adds a single Linux capability (e.g. NET_ADMIN) without granting all of them?',
    options: opts4(
      '--cap-add NET_ADMIN',
      '--privileged NET_ADMIN',
      '--add-capability NET_ADMIN',
      '--cap NET_ADMIN=on'
    ),
    correct: ['a'],
    explanation: '`--cap-add NET_ADMIN` grants just that capability on top of the default set (often paired with `--cap-drop ALL`). `--privileged` grants everything; the other flags are not valid.',
    references: [REF_CAPS, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the default Docker seccomp profile is correct?',
    options: opts4(
      'It blocks all syscalls, breaking most containers.',
      'It allows the common syscalls applications need while blocking a set of dangerous ones (e.g. certain kernel/keyring/clock operations).',
      'It only applies to privileged containers.',
      'It encrypts syscall arguments.'
    ),
    correct: ['b'],
    explanation: 'Docker\'s default seccomp profile is a permissive allowlist that still blocks roughly several dozen dangerous syscalls. It applies to normal containers (a `--privileged` container effectively runs unconfined) and does not encrypt anything.',
    references: [REF_SECCOMP, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A container only needs to read configuration from a host directory. Which mount option follows least privilege?',
    options: opts4(
      'Mount it read-write so the app can also update it.',
      'Mount it read-only, e.g. -v /etc/app:/etc/app:ro, so a compromised container cannot modify host config.',
      'Use --privileged so it has full access.',
      'Bake the config into the image instead of mounting.'
    ),
    correct: ['b'],
    explanation: 'A read-only bind mount (`:ro`) grants exactly the needed read access and prevents tampering with host files — a least-privilege choice. Read-write or `--privileged` grants more than required.',
    references: [REF_BINDMOUNT, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Running a container with --privileged is recommended as a default for convenience.',
    options: opts4('True', 'False', 'Only for databases', 'Only on managers'),
    correct: ['b'],
    explanation: 'False. `--privileged` disables most isolation (all capabilities, device access, relaxed seccomp/AppArmor) and should be avoided unless a specific workload truly requires it.',
    references: [REF_CAPS, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'How does enabling userns-remap interact with bind mounts/volumes you previously created as host root?',
    options: opts4(
      'Nothing changes; permissions are irrelevant.',
      'Because container UIDs are remapped to a high host UID range, existing root-owned host files may become inaccessible until ownership is adjusted for the remapped range.',
      'It deletes the existing data.',
      'It automatically chowns all host paths to the container user.'
    ),
    correct: ['b'],
    explanation: 'userns-remap shifts in-container UIDs to a subordinate host UID range, so files owned by host root may no longer be writable/readable by the remapped container user — a known operational caveat to plan for. Docker does not auto-chown or delete data.',
    references: [REF_USERNS, REF_SECURITY]
  },
  {
    domain: SEC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Docker daemon attack surface.',
    options: opts4(
      'Exposing the daemon on tcp://0.0.0.0:2375 with no TLS allows remote root-equivalent control.',
      'TLS mutual authentication should protect any TCP-exposed daemon (port 2376).',
      'Unix socket access (or docker group membership) is effectively root on the host.',
      'The Docker API enforces per-command Linux user permissions automatically.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'An unauthenticated TCP daemon, socket access, and docker-group membership are all root-equivalent; TCP exposure must use mutual TLS on 2376. The API does not apply OS-user-level authorization per command, so D is false.',
    references: [REF_SECURITY, REF_DAEMON]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'What does `docker scout cves <image>` (or an equivalent scanner) report?',
    options: opts4(
      'Whether the image is digitally signed.',
      'Known CVE vulnerabilities found in the image\'s OS packages and language dependencies, so you can remediate them.',
      'The container\'s live syscall activity.',
      'The swarm Raft health.'
    ),
    correct: ['b'],
    explanation: 'Image scanning enumerates known CVEs in the image contents to drive patching/upgrades. Signing is content trust, syscall monitoring is runtime tooling/seccomp, and Raft health is a swarm concern — all distinct.',
    references: [REF_SECURITY, REF_TRUST]
  },

  // ── Storage and Volumes (+4 → 6 total) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows detailed information about the volume `dbdata`, including its mountpoint on the host?',
    options: opts4(
      'docker volume inspect dbdata',
      'docker volume show dbdata',
      'docker inspect volume dbdata',
      'docker volume detail dbdata'
    ),
    correct: ['a'],
    explanation: '`docker volume inspect dbdata` returns the driver, labels, and host `Mountpoint`. The other forms are not valid Docker CLI syntax.',
    references: [REF_VOLUMES]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach reliably backs up the data in a named volume `dbdata`?',
    options: opts4(
      'Copy /var/lib/docker directly while the daemon runs.',
      'Run a helper container that mounts the volume and tars its contents to a bind-mounted host path (docker run --rm -v dbdata:/data -v $PWD:/backup ... tar ...).',
      'Use docker commit on the volume.',
      'docker volume export dbdata > backup.tar'
    ),
    correct: ['b'],
    explanation: 'The supported pattern is a throwaway container that mounts the volume and the backup destination and archives the data; this works across drivers. Touching `/var/lib/docker` live is unsafe, `docker commit` snapshots containers not volumes, and `docker volume export` is not a command.',
    references: [REF_VOLUMES, REF_BINDMOUNT]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Anonymous volumes (created when no name is given, e.g. -v /data) can be removed by docker volume prune once no container references them.',
    options: opts4('True', 'False', 'Only named volumes can be pruned', 'Volumes can never be pruned'),
    correct: ['a'],
    explanation: 'True. Anonymous (and unused named) volumes not referenced by any container are removed by `docker volume prune`; this is why important data should use clearly named volumes and be backed up.',
    references: [REF_VOLUMES, REF_CLI]
  },
  {
    domain: STORAGE, difficulty: 4, type: QType.SINGLE,
    stem: 'Which statement best describes the relationship between storage drivers (overlay2) and volumes?',
    options: opts4(
      'Volumes use the storage driver\'s copy-on-write for all writes.',
      'The storage driver manages the image/container layered filesystem (copy-on-write), while volumes bypass it to give better, persistent I/O for application data.',
      'They are the same subsystem.',
      'Volumes only work with the vfs driver.'
    ),
    correct: ['b'],
    explanation: 'The storage driver (e.g. overlay2) handles the layered, copy-on-write container filesystem; volumes write outside that layer for persistence and to avoid copy-up overhead — recommended for databases and write-heavy data. Volumes work regardless of the storage driver.',
    references: [REF_STORAGEDRIVER, REF_VOLUMES]
  }
];

const DCA_DOMAINS = [
  { name: ORCH, weight: 25 },
  { name: IMAGE, weight: 20 },
  { name: INSTALL, weight: 15 },
  { name: NET, weight: 15 },
  { name: SEC, weight: 15 },
  { name: STORAGE, weight: 10 }
];

const DCA_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'docker-dca-p1',
    code: 'DCA-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 90-minute, 65-question, blueprint-weighted set covering swarm orchestration, image creation & registry, installation & daemon configuration, networking, security, and storage & volumes.',
    questions: P1
  },
  {
    slug: 'docker-dca-p2',
    code: 'DCA-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 90-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'docker-dca-p3',
    code: 'DCA-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 90-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const DCA_BUNDLE = {
  slug: 'docker-dca',
  title: 'Docker Certified Associate (DCA)',
  description: 'Unlimited DCA practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering orchestration, image creation/management/registry, installation & configuration, networking, security, and storage & volumes, aligned to the Docker Certified Associate exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 19500 // USD 195 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the DCA bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:dca-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedDca(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'docker' } });
  await db.vendor.upsert({
    where: { slug: 'docker' },
    update: { name: 'Docker', description: 'Docker certifications — containerization, image management, orchestration, and the Docker Certified Associate credential.' },
    create: { slug: 'docker', name: 'Docker', description: 'Docker certifications — containerization, image management, orchestration, and the Docker Certified Associate credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'docker' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of DCA_EXAMS) {
    const title = `Docker Certified Associate (DCA) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Docker Certified Associate exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 90,
      passingScore: 65,
      questionCount: e.questions.length,
      domains: DCA_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:dca-seed' } });
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
          generatedBy: 'manual:dca-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: DCA_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: DCA_BUNDLE.slug },
    update: {
      title: DCA_BUNDLE.title,
      description: DCA_BUNDLE.description,
      price: DCA_BUNDLE.price,
      priceVoucher: DCA_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: DCA_BUNDLE.slug,
      title: DCA_BUNDLE.title,
      description: DCA_BUNDLE.description,
      price: DCA_BUNDLE.price,
      priceVoucher: DCA_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'docker-dca-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'docker-dca-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'docker-dca-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'docker-dca-p1', tier: 'VOUCHER' as const, position: 4 }
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
