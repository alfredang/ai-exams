/**
 * Consul Associate (003) bundle seed — vendor, three practice-exam
 * variants, bundle, and 195 blueprint-aligned questions. Idempotent:
 * replaces rows tagged `generatedBy: 'manual:consul-seed'` and upserts
 * catalog rows.
 *
 * Exported as `seedConsul(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/consul.ts`) and the protected
 * admin API (`/api/admin/seed-consul`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public HashiCorp Consul
 * documentation and the HashiCorp Certified: Consul Associate (003)
 * exam objectives:
 *   - Explain Consul Architecture            — 16% (10)
 *   - Deploy Consul                          — 16% (10)
 *   - Service Discovery and Registration     — 18% (12)
 *   - Service Mesh                           — 20% (13)
 *   - Network Infrastructure Automation      — 15% (10)
 *   - Consul Security                        — 15% (10)
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

const ARCH = 'Explain Consul Architecture';
const DEPLOY = 'Deploy Consul';
const SD = 'Service Discovery and Registration';
const MESH = 'Service Mesh';
const NIA = 'Network Infrastructure Automation';
const SEC = 'Consul Security';

const REF_ARCH = { label: 'Consul Docs — Architecture', url: 'https://developer.hashicorp.com/consul/docs/architecture' };
const REF_GOSSIP = { label: 'Consul Docs — Gossip protocol', url: 'https://developer.hashicorp.com/consul/docs/architecture/gossip' };
const REF_CONSENSUS = { label: 'Consul Docs — Consensus protocol (Raft)', url: 'https://developer.hashicorp.com/consul/docs/architecture/consensus' };
const REF_AGENT = { label: 'Consul Docs — Agent overview', url: 'https://developer.hashicorp.com/consul/docs/agent' };
const REF_AGENT_CONFIG = { label: 'Consul Docs — Agent configuration', url: 'https://developer.hashicorp.com/consul/docs/agent/config' };
const REF_DATACENTER = { label: 'Consul Docs — Multiple datacenters', url: 'https://developer.hashicorp.com/consul/docs/architecture/datacenter' };
const REF_FEDERATION = { label: 'Consul Docs — WAN federation', url: 'https://developer.hashicorp.com/consul/docs/east-west/wan-federation' };
const REF_AUTOPILOT = { label: 'Consul Docs — Autopilot', url: 'https://developer.hashicorp.com/consul/docs/manage/scale/autopilot' };
const REF_DEPLOY = { label: 'Consul Docs — Deployment guide', url: 'https://developer.hashicorp.com/consul/tutorials/production-deploy/deployment-guide' };
const REF_JOIN = { label: 'Consul Docs — Cluster join', url: 'https://developer.hashicorp.com/consul/docs/deploy/server/cluster/bootstrap' };
const REF_BOOTSTRAP = { label: 'Consul Docs — Bootstrap a datacenter', url: 'https://developer.hashicorp.com/consul/docs/deploy/server/cluster/bootstrap' };
const REF_CLI = { label: 'Consul Docs — CLI commands', url: 'https://developer.hashicorp.com/consul/commands' };
const REF_OPERATOR = { label: 'Consul Docs — consul operator raft', url: 'https://developer.hashicorp.com/consul/commands/operator/raft' };
const REF_SNAPSHOT = { label: 'Consul Docs — consul snapshot', url: 'https://developer.hashicorp.com/consul/commands/snapshot' };
const REF_MEMBERS = { label: 'Consul Docs — consul members', url: 'https://developer.hashicorp.com/consul/commands/members' };
const REF_SERVICES = { label: 'Consul Docs — Define services', url: 'https://developer.hashicorp.com/consul/docs/services/usage/define-services' };
const REF_REGISTER = { label: 'Consul Docs — Register services', url: 'https://developer.hashicorp.com/consul/docs/services/usage/register-services-checks' };
const REF_HEALTH = { label: 'Consul Docs — Health checks', url: 'https://developer.hashicorp.com/consul/docs/services/usage/checks' };
const REF_DNS = { label: 'Consul Docs — DNS interface', url: 'https://developer.hashicorp.com/consul/docs/services/discovery/dns-overview' };
const REF_DNS_NODE = { label: 'Consul Docs — DNS node and service lookups', url: 'https://developer.hashicorp.com/consul/docs/services/discovery/dns-static-lookups' };
const REF_CATALOG = { label: 'Consul Docs — Catalog API', url: 'https://developer.hashicorp.com/consul/api-docs/catalog' };
const REF_QUERY = { label: 'Consul Docs — Prepared queries', url: 'https://developer.hashicorp.com/consul/docs/services/discovery/dns-dynamic-lookups' };
const REF_CONNECT = { label: 'Consul Docs — Service mesh overview', url: 'https://developer.hashicorp.com/consul/docs/connect' };
const REF_INTENTIONS = { label: 'Consul Docs — Service mesh intentions', url: 'https://developer.hashicorp.com/consul/docs/secure-mesh/intention' };
const REF_PROXY = { label: 'Consul Docs — Envoy proxy', url: 'https://developer.hashicorp.com/consul/docs/connect/proxy/envoy' };
const REF_SIDECAR = { label: 'Consul Docs — Sidecar service registration', url: 'https://developer.hashicorp.com/consul/docs/connect/proxies/deploy-sidecar-services' };
const REF_CONFIGENTRY = { label: 'Consul Docs — Configuration entries', url: 'https://developer.hashicorp.com/consul/docs/fundamentals/config-entry' };
const REF_SERVICEDEFAULTS = { label: 'Consul Docs — service-defaults config entry', url: 'https://developer.hashicorp.com/consul/docs/reference/config-entry/service-defaults' };
const REF_SERVICERESOLVER = { label: 'Consul Docs — service-resolver config entry', url: 'https://developer.hashicorp.com/consul/docs/reference/config-entry/service-resolver' };
const REF_SERVICESPLITTER = { label: 'Consul Docs — service-splitter config entry', url: 'https://developer.hashicorp.com/consul/docs/reference/config-entry/service-splitter' };
const REF_GATEWAY = { label: 'Consul Docs — Gateways', url: 'https://developer.hashicorp.com/consul/docs/east-west/mesh-gateway' };
const REF_INGRESS = { label: 'Consul Docs — Ingress gateways', url: 'https://developer.hashicorp.com/consul/docs/north-south/ingress-gateway' };
const REF_TERMINATING = { label: 'Consul Docs — Terminating gateways', url: 'https://developer.hashicorp.com/consul/docs/north-south/terminating-gateway' };
const REF_NIA = { label: 'Consul Docs — Network Infrastructure Automation', url: 'https://developer.hashicorp.com/consul/docs/automate/infrastructure' };
const REF_CTS = { label: 'Consul Docs — Consul-Terraform-Sync', url: 'https://developer.hashicorp.com/consul/docs/automate/infrastructure/configuration' };
const REF_CTS_TASK = { label: 'Consul Docs — CTS tasks', url: 'https://developer.hashicorp.com/consul/docs/automate/infrastructure/task' };
const REF_TEMPLATE = { label: 'Consul Docs — consul-template', url: 'https://developer.hashicorp.com/consul/docs/automate/consul-template' };
const REF_WATCHES = { label: 'Consul Docs — Watches', url: 'https://developer.hashicorp.com/consul/docs/automate/watch' };
const REF_KV = { label: 'Consul Docs — KV store', url: 'https://developer.hashicorp.com/consul/docs/automate/kv' };
const REF_ACL = { label: 'Consul Docs — ACL system', url: 'https://developer.hashicorp.com/consul/docs/secure/acl' };
const REF_ACL_TOKENS = { label: 'Consul Docs — ACL tokens', url: 'https://developer.hashicorp.com/consul/docs/secure/acl/token' };
const REF_ACL_POLICIES = { label: 'Consul Docs — ACL policies', url: 'https://developer.hashicorp.com/consul/docs/secure/acl/policy' };
const REF_ACL_BOOTSTRAP = { label: 'Consul Docs — Bootstrap ACL system', url: 'https://developer.hashicorp.com/consul/docs/secure/acl/bootstrap' };
const REF_TLS = { label: 'Consul Docs — Encryption / TLS', url: 'https://developer.hashicorp.com/consul/docs/secure/encryption' };
const REF_GOSSIP_ENC = { label: 'Consul Docs — Gossip encryption', url: 'https://developer.hashicorp.com/consul/docs/secure/encryption/gossip/enable' };
const REF_KEYGEN = { label: 'Consul Docs — consul keygen', url: 'https://developer.hashicorp.com/consul/commands/keygen' };
const REF_CA = { label: 'Consul Docs — Service mesh certificate authority', url: 'https://developer.hashicorp.com/consul/docs/connect/ca' };
const REF_NAMESPACE = { label: 'Consul Docs — Namespaces', url: 'https://developer.hashicorp.com/consul/docs/multi-tenant/namespace' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Explain Consul Architecture (10) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a Consul datacenter, which agent mode participates in the Raft consensus that maintains the cluster state and catalog?',
    options: opts4(
      'Client agents',
      'Server agents',
      'The Consul DNS resolver',
      'The Envoy sidecar proxy'
    ),
    correct: ['b'],
    explanation: 'Server agents store cluster state, the catalog, and KV data, and elect a leader through the Raft consensus protocol. Client agents are stateless: they forward RPCs to servers and run health checks but do not participate in Raft.',
    references: [REF_ARCH, REF_CONSENSUS]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'How many Consul server agents are recommended in a single production datacenter to balance fault tolerance and Raft performance?',
    options: opts4(
      '1 server',
      '2 servers',
      '3 or 5 servers',
      '10 or more servers'
    ),
    correct: ['c'],
    explanation: 'Raft requires a quorum (majority). HashiCorp recommends 3 or 5 server agents per datacenter: an odd count maximizes fault tolerance for a given size, and more than 5 voters increases consensus overhead without improving availability.',
    references: [REF_CONSENSUS, REF_DEPLOY]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A 5-server Consul datacenter loses 2 server nodes simultaneously. What happens to write operations?',
    options: opts4(
      'All writes fail because any node loss breaks Raft.',
      'Writes continue because 3 of 5 servers still form a quorum.',
      'Writes continue only after manually promoting a client agent.',
      'Writes are queued and replayed when the lost nodes return.'
    ),
    correct: ['b'],
    explanation: 'With 5 voting servers the quorum is 3. Losing 2 servers still leaves 3 healthy voters, so the cluster keeps a quorum and continues to elect a leader and accept writes. A 5-node cluster tolerates the loss of 2 servers.',
    references: [REF_CONSENSUS, REF_AUTOPILOT]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the gossip protocol (Serf) used by Consul.',
    options: opts4(
      'It is used for membership, failure detection, and event broadcast.',
      'There is a separate LAN gossip pool per datacenter and a WAN gossip pool across datacenters.',
      'Gossip replaces Raft for replicating the KV store.',
      'Gossip messages can be encrypted with a shared symmetric key.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Consul uses Serf gossip for membership, failure detection, and event broadcast, with a LAN pool per datacenter and a WAN pool joining server agents across datacenters. Gossip does not replicate the KV store — Raft does. Gossip traffic can be encrypted with a shared key.',
    references: [REF_GOSSIP, REF_GOSSIP_ENC]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which protocol does Consul use to join server agents across multiple datacenters into a single WAN pool?',
    options: opts4(
      'LAN gossip only',
      'WAN gossip (Serf WAN pool)',
      'Raft replication across all datacenters',
      'BGP peering between datacenters'
    ),
    correct: ['b'],
    explanation: 'Server agents join a WAN gossip pool so datacenters can discover each other and forward cross-DC requests. Raft state is not replicated across datacenters by default — each datacenter has its own Raft leader and catalog.',
    references: [REF_DATACENTER, REF_FEDERATION]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A client agent receives a service registration. Where is that registration ultimately stored so it survives the client agent restarting?',
    options: opts4(
      'Only in the client agent local memory',
      'In the server agents catalog, replicated via Raft',
      'In the Envoy proxy configuration cache',
      'In the operating system /etc/hosts file'
    ),
    correct: ['b'],
    explanation: 'A client agent forwards registrations to the servers, where they are written to the catalog and replicated by Raft. The authoritative copy lives on the servers, so the registration survives a client agent restart as long as the agent re-syncs.',
    references: [REF_ARCH, REF_CATALOG]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the role of the Consul Autopilot feature in a server cluster?',
    options: opts4(
      'It automatically encrypts gossip traffic.',
      'It provides automated cleanup of dead servers and safe operator-friendly server management.',
      'It load-balances client DNS queries across datacenters.',
      'It generates Envoy bootstrap configuration for sidecars.'
    ),
    correct: ['b'],
    explanation: 'Autopilot adds automated, operator-friendly cluster management: dead server cleanup, stable server introduction, and (Enterprise) redundancy zones and automated upgrades. It does not handle encryption, DNS load balancing, or Envoy config.',
    references: [REF_AUTOPILOT]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'A request arrives at a client agent that needs strongly consistent catalog data. By default, how does the client satisfy the read?',
    options: opts4(
      'It serves stale data directly from its local gossip cache.',
      'It forwards the request to a server, which serves it through the leader by default for consistency.',
      'It rejects the request because clients cannot read the catalog.',
      'It performs a Raft election to become a temporary leader.'
    ),
    correct: ['b'],
    explanation: 'Client agents have no catalog of their own; they forward RPCs to a server. By default reads use the "default" consistency mode routed through the leader. Operators can opt into "stale" reads for scalability, accepting potentially out-of-date data.',
    references: [REF_ARCH, REF_CONSENSUS]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Every node that runs a workload registered in Consul typically runs a Consul agent (client or server) locally.',
    options: opts4('True', 'False', 'Only server nodes run agents', 'Only when ACLs are enabled'),
    correct: ['a'],
    explanation: 'The Consul model places an agent on every node. Workload nodes usually run a client agent that handles local health checks and service registration and forwards RPCs to the servers, keeping the control plane decentralized.',
    references: [REF_AGENT, REF_ARCH]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'Why does HashiCorp recommend an odd number of server agents (e.g., 3 or 5) rather than an even number such as 4?',
    options: opts4(
      'Even counts are not supported by the Consul binary.',
      'An even count does not improve fault tolerance over the next lower odd count and adds quorum overhead.',
      'Even counts disable the gossip protocol.',
      'Even counts force every read through the leader.'
    ),
    correct: ['b'],
    explanation: 'Raft quorum is floor(N/2)+1. A 4-node cluster tolerates 1 failure, the same as a 3-node cluster, but needs an extra node and larger quorum. Odd sizes give the best fault tolerance per node, so 3 or 5 are recommended.',
    references: [REF_CONSENSUS, REF_DEPLOY]
  },

  // ── Deploy Consul (10) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which agent configuration setting tells a fresh server cluster how many servers to expect before electing the first leader?',
    options: opts4(
      'retry_join',
      'bootstrap_expect',
      'leave_on_terminate',
      'enable_script_checks'
    ),
    correct: ['b'],
    explanation: '`bootstrap_expect` sets the number of server agents expected in the datacenter. Consul waits until that many servers are available, then automatically bootstraps and elects a leader, avoiding a split-brain bootstrap.',
    references: [REF_BOOTSTRAP, REF_AGENT_CONFIG]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which agent configuration option lets a node automatically rejoin the cluster by contacting a known list of peers when it (re)starts?',
    options: opts4(
      'start_join_once',
      'retry_join',
      'rejoin_after_leave only',
      'advertise_addr'
    ),
    correct: ['b'],
    explanation: '`retry_join` provides addresses (or cloud auto-join tags) the agent keeps retrying until it successfully joins the cluster. Unlike a one-time join it survives restarts and transient network failures during boot.',
    references: [REF_JOIN, REF_AGENT_CONFIG]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You run `consul members` and a server shows status "left". What does that indicate?',
    options: opts4(
      'The node gracefully left the cluster and is no longer a member.',
      'The node crashed unexpectedly and Raft is still expecting it.',
      'The node is a client that has not registered any services.',
      'The node is the current Raft leader.'
    ),
    correct: ['a'],
    explanation: 'A "left" status means the agent performed a graceful leave (e.g., `consul leave`) and is intentionally out of the cluster. A node that crashes shows "failed" instead, which Autopilot can later reap.',
    references: [REF_MEMBERS, REF_AUTOPILOT]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Before a planned upgrade you want a point-in-time backup of the Consul server state (catalog, KV, ACLs). Which command do you use?',
    options: opts4(
      'consul kv export',
      'consul snapshot save backup.snap',
      'consul operator raft list-peers',
      'consul reload'
    ),
    correct: ['b'],
    explanation: '`consul snapshot save` captures a consistent point-in-time snapshot of server state including KV, the catalog, sessions, and ACLs. It can be restored with `consul snapshot restore`. `kv export` only dumps the KV tree.',
    references: [REF_SNAPSHOT]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists the current Raft peers and shows which server is the leader?',
    options: opts4(
      'consul operator raft list-peers',
      'consul info --raft',
      'consul members -wan',
      'consul catalog nodes -raft'
    ),
    correct: ['a'],
    explanation: '`consul operator raft list-peers` prints the Raft peer set, each peer node ID/address, and which one is the leader. It is the standard way to inspect quorum health during operations.',
    references: [REF_OPERATOR]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'A failed server cannot be recovered and is still listed as a Raft peer, blocking quorum recovery. Which command forcibly removes it from the peer set?',
    options: opts4(
      'consul leave <node>',
      'consul operator raft remove-peer -id=<node-id>',
      'consul force-leave <node>',
      'consul snapshot restore'
    ),
    correct: ['b'],
    explanation: '`consul operator raft remove-peer` (by address or `-id`) removes a dead server from the Raft configuration so the remaining servers can re-establish quorum. `force-leave` only affects gossip membership, not the Raft peer set.',
    references: [REF_OPERATOR]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'On a server agent, which configuration directive enables it to act as a Consul server rather than a client?',
    options: opts4(
      'mode = "server"',
      'server = true',
      'agent_type = "server"',
      'role = "server"'
    ),
    correct: ['b'],
    explanation: 'Setting `server = true` in the agent configuration makes the agent a server. Omitting it (or `server = false`) makes the agent a client. Server agents additionally need `bootstrap_expect` set when forming a new cluster.',
    references: [REF_AGENT_CONFIG]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You changed an agent configuration file and want Consul to pick up reloadable settings without restarting the process. What should you run?',
    options: opts4(
      'consul reload',
      'consul restart',
      'consul agent -refresh',
      'consul operator config reload'
    ),
    correct: ['a'],
    explanation: '`consul reload` (or sending SIGHUP) re-reads reloadable configuration such as service definitions, checks, and certain log settings. Non-reloadable items like the bind address still require a full restart.',
    references: [REF_CLI, REF_AGENT_CONFIG]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recommended practices when deploying Consul servers to production.',
    options: opts4(
      'Run 3 or 5 servers per datacenter for quorum.',
      'Persist the data directory on durable storage.',
      'Run server and heavy application workloads on the same nodes for density.',
      'Take periodic `consul snapshot save` backups.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Production guidance: 3 or 5 servers for quorum, a durable persisted data_dir, and periodic snapshots for disaster recovery. Servers should be isolated from heavy application workloads to protect Raft latency, not co-located with them.',
    references: [REF_DEPLOY, REF_SNAPSHOT]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command starts a single-node Consul agent suitable only for local development and testing?',
    options: opts4(
      'consul agent -dev',
      'consul agent -prod',
      'consul server start',
      'consul init -single'
    ),
    correct: ['a'],
    explanation: '`consul agent -dev` starts an in-memory, single-node agent with sane defaults for experimentation. It is explicitly not for production because it does not persist state and runs without typical hardening.',
    references: [REF_CLI, REF_AGENT]
  },

  // ── Service Discovery and Registration (12) ──
  {
    domain: SD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which DNS name format resolves healthy instances of a service named `web` in the default datacenter?',
    options: opts4(
      'web.node.consul',
      'web.service.consul',
      'web.consul.local',
      'consul.web.svc'
    ),
    correct: ['b'],
    explanation: 'The default service lookup format is `<service>.service.consul` (optionally `<tag>.<service>.service.consul`). Consul DNS returns only instances passing their health checks. `<node>.node.consul` resolves a specific node instead.',
    references: [REF_DNS, REF_DNS_NODE]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A service definition includes an HTTP health check that returns 503. How does Consul DNS treat that instance?',
    options: opts4(
      'It is still returned because DNS ignores checks.',
      'It is excluded from `<service>.service.consul` answers until the check passes.',
      'The entire service is deregistered immediately.',
      'The instance is returned but with a TTL of 0.'
    ),
    correct: ['b'],
    explanation: 'Consul DNS only returns instances whose checks are passing (warning is configurable). A failing check moves the instance to critical, so it is removed from healthy-only service DNS answers until it recovers. The registration itself is not deleted.',
    references: [REF_HEALTH, REF_DNS]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which file-based mechanism lets you register a long-lived service with the local agent so it re-registers automatically after the agent restarts?',
    options: opts4(
      'A one-time `consul services register` API call with no file',
      'A service definition file in the agent config directory',
      'An entry appended to /etc/hosts',
      'A Raft snapshot'
    ),
    correct: ['b'],
    explanation: 'Placing a service definition (HCL/JSON) in the agent configuration directory makes the agent re-register the service on every (re)start and reload. API-only registrations are not persisted in the agent config and are lost if not re-issued.',
    references: [REF_SERVICES, REF_REGISTER]
  },
  {
    domain: SD, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Consul health check types.',
    options: opts4(
      'HTTP check',
      'TCP check',
      'TTL check (application heartbeats)',
      'BGP route check'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Consul supports HTTP, TCP, gRPC, script, Docker, TTL, alias, and OS-level checks among others. A TTL check requires the application to periodically report it is healthy. "BGP route check" is not a Consul check type.',
    references: [REF_HEALTH]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command registers a service from a definition file using the local agent?',
    options: opts4(
      'consul services register web.hcl',
      'consul kv put service/web',
      'consul catalog add web.hcl',
      'consul agent register web'
    ),
    correct: ['a'],
    explanation: '`consul services register <file>` registers a service with the local agent from an HCL/JSON definition. `consul kv put` writes KV data, and there is no `consul catalog add` or `consul agent register` subcommand.',
    references: [REF_REGISTER, REF_CLI]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'You need DNS-based failover so that if `payments` has no healthy instances in the local datacenter, Consul answers with instances from another datacenter. Which feature provides this?',
    options: opts4(
      'A standard `<service>.service.consul` lookup',
      'A prepared query with failover configured',
      'A node lookup `<node>.node.consul`',
      'A KV watch'
    ),
    correct: ['b'],
    explanation: 'Prepared queries can define failover policies (datacenters or targets) so a single query name transparently falls back to another datacenter when the local one has no healthy instances. Plain service DNS does not do cross-DC failover.',
    references: [REF_QUERY, REF_DNS]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which HTTP API endpoint returns the healthy instances of a service for service discovery?',
    options: opts4(
      '/v1/health/service/<name>?passing',
      '/v1/kv/<name>',
      '/v1/agent/reload',
      '/v1/operator/raft/configuration'
    ),
    correct: ['a'],
    explanation: '`/v1/health/service/<name>` returns instances with their health status; adding `?passing` filters to only healthy instances. This is the canonical discovery endpoint that load balancers and consul-template consume.',
    references: [REF_HEALTH, REF_CATALOG]
  },
  {
    domain: SD, difficulty: 4, type: QType.SINGLE,
    stem: 'A service registers with tags ["v2","canary"]. Which DNS query returns only the v2-tagged healthy instances?',
    options: opts4(
      'v2.web.service.consul',
      'web.v2.service.consul',
      'web.service.v2.consul',
      'v2.service.web.consul'
    ),
    correct: ['a'],
    explanation: 'Tag-based DNS uses the form `<tag>.<service>.service.consul`, so `v2.web.service.consul` returns healthy instances of `web` carrying the `v2` tag. The other orderings are not valid Consul DNS names.',
    references: [REF_DNS_NODE, REF_DNS]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the effect of a service registration that omits the `port` field?',
    options: opts4(
      'Registration is rejected outright.',
      'The service is registered but has no port; mesh/SD consumers cannot route to it by port.',
      'Consul auto-assigns port 8500.',
      'The agent refuses to start.'
    ),
    correct: ['b'],
    explanation: 'Port is optional in a service definition, but a service registered without a port has limited usefulness for discovery and the service mesh, since consumers cannot determine where to connect. Registration itself still succeeds.',
    references: [REF_SERVICES, REF_REGISTER]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'A node-level health check that goes critical affects every service registered on that node.',
    options: opts4('True', 'False', 'Only HTTP services', 'Only if ACLs are disabled'),
    correct: ['a'],
    explanation: 'A check associated with the node (not a specific service ID) reflects node health. When it goes critical, all services on that node are considered unhealthy for discovery, because the node itself is unhealthy.',
    references: [REF_HEALTH]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lists all services known to the Consul catalog?',
    options: opts4(
      'consul catalog services',
      'consul members --services',
      'consul kv list services/',
      'consul info -services'
    ),
    correct: ['a'],
    explanation: '`consul catalog services` lists the services registered in the catalog (optionally with `-tags`). `consul members` lists gossip members, and KV listing only shows KV keys, not the service catalog.',
    references: [REF_CATALOG, REF_CLI]
  },
  {
    domain: SD, difficulty: 4, type: QType.SINGLE,
    stem: 'An operator wants Consul DNS to also resolve names under a custom domain `.internal` in addition to `.consul`. Which agent setting controls the primary Consul DNS domain?',
    options: opts4(
      'dns_config.allow_stale',
      'domain (e.g., domain = "internal")',
      'recursors only',
      'advertise_addr'
    ),
    correct: ['b'],
    explanation: 'The agent `domain` setting changes the top-level domain Consul serves (default `consul`), e.g. `domain = "internal"` serves `*.internal`. `recursors` forwards non-Consul lookups upstream; `allow_stale` only affects read consistency.',
    references: [REF_DNS, REF_AGENT_CONFIG]
  },

  // ── Service Mesh (13) ──
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Consul service mesh, what enforces whether service A is allowed to talk to service B?',
    options: opts4(
      'DNS recursors',
      'Intentions',
      'The bootstrap_expect setting',
      'Gossip encryption keys'
    ),
    correct: ['b'],
    explanation: 'Intentions define service-to-service authorization in the mesh by source and destination service identity (from mTLS certificates). They allow or deny communication independent of network IPs.',
    references: [REF_INTENTIONS, REF_CONNECT]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which proxy does Consul service mesh use by default as the data-plane sidecar?',
    options: opts4(
      'HAProxy',
      'Envoy',
      'NGINX',
      'The built-in Consul connect proxy for all production traffic'
    ),
    correct: ['b'],
    explanation: 'Consul service mesh uses Envoy as the recommended sidecar data plane. A built-in proxy exists for testing/development, but Envoy is the supported choice for production L4/L7 features.',
    references: [REF_PROXY, REF_CONNECT]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'How does Consul service mesh authenticate and encrypt traffic between two meshed services?',
    options: opts4(
      'Plaintext with IP allowlists',
      'Mutual TLS using identity-based certificates issued by the mesh CA',
      'SSH tunnels between sidecars',
      'Shared gossip symmetric key'
    ),
    correct: ['b'],
    explanation: 'Consul mesh issues each service a TLS certificate encoding its identity (SPIFFE-style URI). Sidecars perform mutual TLS, providing encryption and identity-based authentication that intentions then authorize.',
    references: [REF_CONNECT, REF_CA]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates an intention allowing `web` to call `api`?',
    options: opts4(
      'consul intention create web api',
      'consul connect allow web api',
      'consul acl intention add web api',
      'consul mesh permit web api'
    ),
    correct: ['a'],
    explanation: '`consul intention create <src> <dst>` creates an allow intention by default. Intentions can also be managed declaratively via `service-intentions` config entries. The other commands are not valid Consul subcommands.',
    references: [REF_INTENTIONS, REF_CLI]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to shift 10% of traffic for `checkout` to a new subset while sending 90% to the stable subset. Which configuration entry performs this weighted split?',
    options: opts4(
      'service-defaults',
      'service-splitter',
      'service-resolver only',
      'proxy-defaults'
    ),
    correct: ['b'],
    explanation: 'A `service-splitter` config entry distributes L7 traffic across subsets/services by weight (e.g., 90/10). It typically works with a `service-resolver` that defines the subsets and a `service-defaults` setting protocol to http.',
    references: [REF_SERVICESPLITTER, REF_SERVICERESOLVER]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which configuration entry must set the application protocol to `http` before L7 traffic management (splitters/routers) will work?',
    options: opts4(
      'service-defaults',
      'service-intentions',
      'mesh',
      'exported-services'
    ),
    correct: ['a'],
    explanation: 'L7 features require Consul to know the protocol. Setting `protocol = "http"` in a `service-defaults` (or `proxy-defaults`) config entry enables routers, splitters, and resolvers for that service.',
    references: [REF_SERVICEDEFAULTS, REF_CONFIGENTRY]
  },
  {
    domain: MESH, difficulty: 4, type: QType.SINGLE,
    stem: 'Two datacenters are federated and you want meshed services to communicate across them with mTLS preserved. Which component routes that cross-DC mesh traffic?',
    options: opts4(
      'Ingress gateway',
      'Mesh gateway',
      'Terminating gateway',
      'DNS recursor'
    ),
    correct: ['b'],
    explanation: 'Mesh gateways forward mesh (mTLS) traffic between datacenters or partitions without terminating TLS, so identity and encryption are preserved end to end. Ingress handles inbound external traffic; terminating gateways bridge to non-mesh services.',
    references: [REF_GATEWAY]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which gateway lets external (non-mesh) clients reach services inside the mesh?',
    options: opts4(
      'Terminating gateway',
      'Ingress gateway',
      'Mesh gateway',
      'API gateway is not supported in Consul'
    ),
    correct: ['b'],
    explanation: 'An ingress gateway accepts traffic from outside the mesh and forwards it to mesh services. A terminating gateway is the reverse — it lets mesh services reach external/non-mesh destinations.',
    references: [REF_INGRESS, REF_TERMINATING]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'A meshed service must call an external database that is NOT in the mesh. Which gateway should be used?',
    options: opts4(
      'Ingress gateway',
      'Terminating gateway',
      'Mesh gateway',
      'No gateway — disable mTLS for that service'
    ),
    correct: ['b'],
    explanation: 'A terminating gateway represents external/non-mesh services to the mesh. Mesh services connect via mTLS to the gateway, which then terminates and forwards to the external destination, preserving mesh policy at the boundary.',
    references: [REF_TERMINATING]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE,
    stem: 'What does a sidecar service registration (`connect { sidecar_service {} }`) cause Consul to do?',
    options: opts4(
      'Disable health checks for the service',
      'Register a managed sidecar proxy alongside the service for mesh traffic',
      'Promote the node to a server',
      'Encrypt the gossip pool'
    ),
    correct: ['b'],
    explanation: 'A `sidecar_service` stanza registers a companion proxy for the service so it can participate in the mesh, including inbound/outbound listeners and upstreams. It does not change agent roles or gossip.',
    references: [REF_SIDECAR, REF_CONNECT]
  },
  {
    domain: MESH, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Consul service mesh intentions.',
    options: opts4(
      'They authorize traffic based on service identity, not IP address.',
      'A default-deny posture can be set so only explicit allow intentions pass.',
      'They are evaluated only by the Consul DNS server.',
      'They can be expressed declaratively with a service-intentions config entry.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Intentions use mTLS service identity, support a global default-deny posture, and can be managed via `service-intentions` config entries or the CLI/API. They are enforced by the sidecar proxies, not by the DNS server.',
    references: [REF_INTENTIONS, REF_CONFIGENTRY]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which config entry defines how a service name resolves to instances, including subsets and redirects/failover for L7 routing?',
    options: opts4(
      'service-resolver',
      'service-splitter',
      'proxy-defaults',
      'exported-services'
    ),
    correct: ['a'],
    explanation: 'A `service-resolver` defines subsets (by filter), default subset, redirects, and failover targets. Splitters and routers build on the subsets a resolver defines for full L7 traffic management.',
    references: [REF_SERVICERESOLVER]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'With service mesh, application code generally connects to a local sidecar address and the proxies handle mTLS to the destination.',
    options: opts4('True', 'False', 'Only for HTTP services', 'Only with gateways'),
    correct: ['a'],
    explanation: 'In the mesh model the application talks to its local sidecar (an upstream listener). The sidecars establish mutual TLS and enforce intentions, so application code does not manage certificates or peer IPs directly.',
    references: [REF_CONNECT, REF_SIDECAR]
  },

  // ── Network Infrastructure Automation (10) ──
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which HashiCorp tool implements Network Infrastructure Automation by reacting to Consul catalog changes and running Terraform?',
    options: opts4(
      'consul-template',
      'Consul-Terraform-Sync (CTS)',
      'Vault Agent',
      'Nomad autoscaler'
    ),
    correct: ['b'],
    explanation: 'Consul-Terraform-Sync (CTS) watches the Consul catalog and triggers Terraform modules when services change, automating network appliance configuration (load balancers, firewalls) without manual updates.',
    references: [REF_NIA, REF_CTS]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'In CTS, what is a "task"?',
    options: opts4(
      'A Raft log entry',
      'A unit that maps watched Consul services to a Terraform module to run on changes',
      'A gossip heartbeat',
      'An ACL policy'
    ),
    correct: ['b'],
    explanation: 'A CTS task binds a set of Consul services (the condition/source) to a Terraform module. When the watched services change, CTS runs the module so downstream network infrastructure reflects the new service state.',
    references: [REF_CTS_TASK, REF_CTS]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which tool renders configuration files from templates using live Consul data and reloads the consuming application?',
    options: opts4(
      'consul-template',
      'consul snapshot',
      'consul connect',
      'consul keygen'
    ),
    correct: ['a'],
    explanation: '`consul-template` queries Consul (services, KV, health) and renders templates to files, then can execute a command (e.g., reload NGINX) when the rendered output changes — a classic dynamic-config automation pattern.',
    references: [REF_TEMPLATE]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'A consul-template renders an NGINX upstream block from healthy `web` instances. A web instance fails its health check. What does consul-template do?',
    options: opts4(
      'Nothing until manually re-run',
      'Re-renders the template without the failed instance and runs the reload command',
      'Deletes the NGINX configuration',
      'Promotes a Consul client to server'
    ),
    correct: ['b'],
    explanation: 'consul-template watches the health endpoint. When the set of healthy instances changes, it re-renders the file and triggers the configured reload command, so the load balancer stops sending traffic to the failed instance automatically.',
    references: [REF_TEMPLATE, REF_HEALTH]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command writes the value `blue` to the KV key `app/color`?',
    options: opts4(
      'consul kv put app/color blue',
      'consul kv set app/color=blue',
      'consul put kv app/color blue',
      'consul kv write app/color blue'
    ),
    correct: ['a'],
    explanation: '`consul kv put <key> <value>` writes a value into the KV store. `consul kv get` reads it back. The other forms are not valid Consul KV CLI syntax.',
    references: [REF_KV, REF_CLI]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Consul feature can run an external handler whenever a particular KV key or service set changes, without polling?',
    options: opts4(
      'A watch',
      'A prepared query',
      'An intention',
      'A snapshot'
    ),
    correct: ['a'],
    explanation: 'Consul watches monitor a view (key, keyprefix, services, checks, etc.) and invoke a handler or HTTP endpoint when it changes, enabling event-driven automation without the handler polling Consul itself.',
    references: [REF_WATCHES]
  },
  {
    domain: NIA, difficulty: 4, type: QType.SINGLE,
    stem: 'CTS supports two run modes. Which mode applies Terraform changes automatically as soon as a watched service changes?',
    options: opts4(
      'Inspect mode',
      'Once mode only',
      'Daemon mode (long-running, automatically applies on change)',
      'Snapshot mode'
    ),
    correct: ['c'],
    explanation: 'In daemon mode CTS runs continuously and automatically applies Terraform when watched services change. Inspect mode shows planned changes without applying, and `-once` runs a single pass and exits.',
    references: [REF_CTS, REF_NIA]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command reads the current value of the KV key `app/color`?',
    options: opts4(
      'consul kv get app/color',
      'consul kv read app/color',
      'consul get kv app/color',
      'consul kv show app/color'
    ),
    correct: ['a'],
    explanation: '`consul kv get <key>` returns the value of a KV key (add `-detailed` for metadata or `-recurse` for a subtree). `read`/`show` are not valid KV subcommands.',
    references: [REF_KV]
  },
  {
    domain: NIA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid use cases for consul-template.',
    options: opts4(
      'Rendering a load balancer config from healthy service instances',
      'Injecting KV values into an application config file',
      'Replacing the Raft consensus protocol',
      'Reloading an app when its upstream set changes'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'consul-template is for dynamic config generation: load balancer backends, KV-driven app config, and reload-on-change. It is a client of Consul data and does not participate in or replace Raft consensus.',
    references: [REF_TEMPLATE, REF_KV]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'Network Infrastructure Automation aims to eliminate manual ticket-driven updates to load balancers and firewalls when services scale.',
    options: opts4('True', 'False', 'Only for firewalls', 'Only in Enterprise'),
    correct: ['a'],
    explanation: 'NIA closes the gap between dynamic service changes and static network middleware by automatically driving Terraform (via CTS) so appliances stay in sync without manual change tickets each time services scale.',
    references: [REF_NIA]
  },

  // ── Consul Security (10) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command bootstraps the Consul ACL system and returns the initial management token?',
    options: opts4(
      'consul acl bootstrap',
      'consul acl init',
      'consul operator acl enable',
      'consul acl token create -management'
    ),
    correct: ['a'],
    explanation: '`consul acl bootstrap` creates the initial bootstrap token with global management privileges. It can only run once per cluster while no other tokens exist; afterward you create scoped tokens and policies.',
    references: [REF_ACL_BOOTSTRAP, REF_ACL]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command generates an encryption key used to secure Consul gossip traffic?',
    options: opts4(
      'consul keygen',
      'consul tls ca create',
      'consul acl bootstrap',
      'consul operator keyring -generate'
    ),
    correct: ['a'],
    explanation: '`consul keygen` produces a base64 symmetric key placed in the `encrypt` agent setting to encrypt LAN/WAN gossip. TLS certificates (a separate concern) secure RPC/HTTP, not gossip.',
    references: [REF_KEYGEN, REF_GOSSIP_ENC]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'With ACLs enabled and the default policy set to "deny", what happens to a request that presents no token?',
    options: opts4(
      'It is allowed because anonymous access is implicit.',
      'It is denied unless the anonymous token grants the needed permission.',
      'It is queued until a token is supplied.',
      'It bypasses ACLs and reads stale data.'
    ),
    correct: ['b'],
    explanation: 'Under default-deny, requests with no token use the anonymous token. Unless that token (or its policies) explicitly grants the operation, the request is denied. This is the recommended secure posture.',
    references: [REF_ACL, REF_ACL_TOKENS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which two layers does Consul use to encrypt different traffic types in a hardened cluster?',
    options: opts4(
      'Gossip encryption (symmetric key) and TLS (RPC/HTTP)',
      'IPsec and SSH',
      'Only a single shared password',
      'WPA2 and HTTPS only'
    ),
    correct: ['a'],
    explanation: 'A hardened Consul cluster uses a symmetric gossip encryption key for the Serf gossip pools and TLS certificates for agent RPC and HTTP API traffic. The two address different communication channels.',
    references: [REF_TLS, REF_GOSSIP_ENC]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'In the Consul ACL model, what is the relationship between tokens and policies?',
    options: opts4(
      'A token directly stores raw permission strings only.',
      'A token is linked to one or more policies (and/or roles) that define its permissions.',
      'Policies are clients and tokens are servers.',
      'Policies replace tokens entirely.'
    ),
    correct: ['b'],
    explanation: 'ACL tokens are bearer credentials linked to policies (and optionally roles, service identities, or node identities). The linked policies define the read/write rules the token is authorized for.',
    references: [REF_ACL_POLICIES, REF_ACL_TOKENS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command creates a new ACL policy from a rules file?',
    options: opts4(
      'consul acl policy create -name web -rules @web-policy.hcl',
      'consul policy add web web-policy.hcl',
      'consul acl create policy web-policy.hcl',
      'consul kv put acl/policy/web @web-policy.hcl'
    ),
    correct: ['a'],
    explanation: '`consul acl policy create -name <name> -rules @<file>` registers a policy from an HCL rules file. Tokens are then created and linked to that policy via `consul acl token create -policy-name`.',
    references: [REF_ACL_POLICIES, REF_CLI]
  },
  {
    domain: SEC, difficulty: 4, type: QType.SINGLE,
    stem: 'You enabled gossip encryption on new agents but existing agents started without it. What is the symptom and remedy?',
    options: opts4(
      'No issue; encryption is per-agent and independent.',
      'Encrypted and unencrypted agents cannot gossip together — use keyring rotation or restart all with the same key.',
      'Raft elections stop permanently and require a snapshot restore.',
      'The HTTP API is disabled until ACLs are bootstrapped.'
    ),
    correct: ['b'],
    explanation: 'All agents in a gossip pool must share the same encryption state/key to communicate. Mixed encrypted/unencrypted agents cannot form membership; you roll the `encrypt` key out to all agents (optionally via `consul keyring`) so they share it.',
    references: [REF_GOSSIP_ENC, REF_TLS]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates an ACL token linked to an existing policy named `dns`?',
    options: opts4(
      'consul acl token create -policy-name dns',
      'consul token new -policy dns',
      'consul acl create token --policy=dns',
      'consul kv put token/dns'
    ),
    correct: ['a'],
    explanation: '`consul acl token create -policy-name <name>` issues a new token bound to that policy. The returned SecretID is the bearer credential clients present in the X-Consul-Token header or CLI `-token`.',
    references: [REF_ACL_TOKENS, REF_CLI]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recommended hardening steps for a production Consul cluster.',
    options: opts4(
      'Enable ACLs with a default-deny policy.',
      'Enable gossip encryption with a shared key.',
      'Enable TLS for RPC and HTTP with verification.',
      'Run all agents as a single shared root token with no policies.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Hardening guidance: ACLs default-deny, gossip encryption, and verified TLS for RPC/HTTP. Using one shared root/management token everywhere violates least privilege and is explicitly discouraged.',
    references: [REF_ACL, REF_TLS]
  },
  {
    domain: SEC, difficulty: 4, type: QType.SINGLE,
    stem: 'How do Consul Enterprise namespaces contribute to security and multi-tenancy?',
    options: opts4(
      'They encrypt gossip per tenant.',
      'They isolate services, KV, and ACLs into separate administrative boundaries within a datacenter.',
      'They replace Raft with a per-tenant log.',
      'They disable intentions between tenants automatically.'
    ),
    correct: ['b'],
    explanation: 'Namespaces (Enterprise) partition the catalog, KV, and ACL resources so different teams/tenants are isolated within one datacenter, reducing blast radius and enabling delegated administration. They are not an encryption mechanism.',
    references: [REF_NAMESPACE, REF_ACL]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Explain Consul Architecture (10) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best describes a Consul client agent?',
    options: opts4(
      'It stores the catalog and participates in Raft.',
      'It is mostly stateless, runs local checks, and forwards RPCs to servers.',
      'It is the WAN gossip coordinator for all datacenters.',
      'It is only used in development mode.'
    ),
    correct: ['b'],
    explanation: 'Client agents are lightweight and stateless: they register local services, run health checks, take part in LAN gossip, and forward RPC requests to the server agents that hold the authoritative state.',
    references: [REF_AGENT, REF_ARCH]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does the Raft "leader" server do in a Consul datacenter?',
    options: opts4(
      'Serves only DNS queries',
      'Accepts writes and replicates the log to follower servers',
      'Encrypts gossip traffic',
      'Runs all Envoy sidecars'
    ),
    correct: ['b'],
    explanation: 'The Raft leader is the single server that accepts write operations and replicates the committed log to followers. If the leader fails, the remaining servers elect a new one, provided a quorum exists.',
    references: [REF_CONSENSUS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A 3-server datacenter loses 2 servers. What is the impact on writes?',
    options: opts4(
      'Writes continue normally.',
      'Writes stop because quorum (2 of 3) is lost.',
      'Only KV writes stop; catalog writes continue.',
      'A client agent is auto-promoted to restore quorum.'
    ),
    correct: ['b'],
    explanation: 'Quorum for 3 servers is 2. Losing 2 servers leaves only 1, below quorum, so no leader can be maintained and writes halt until quorum is restored (recovering a server or removing dead peers).',
    references: [REF_CONSENSUS, REF_OPERATOR]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is each Consul datacenter typically its own Raft/consensus domain rather than one global Raft group?',
    options: opts4(
      'Because Raft does not support encryption',
      'To keep consensus latency low and tolerate WAN partitions per datacenter',
      'Because gossip cannot cross datacenters',
      'To force all reads through clients'
    ),
    correct: ['b'],
    explanation: 'Stretching Raft across high-latency WAN links would slow every write and risk partitions. Consul keeps consensus local per datacenter and federates datacenters via WAN gossip, preserving low-latency writes and partition isolation.',
    references: [REF_DATACENTER, REF_FEDERATION]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Gossip in Consul is used for membership and failure detection.',
    options: opts4('True', 'False', 'Only for KV replication', 'Only across the WAN'),
    correct: ['a'],
    explanation: 'The Serf-based gossip layer handles cluster membership, fast failure detection, and event broadcast. It complements Raft, which handles consistent state replication; the two solve different problems.',
    references: [REF_GOSSIP]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which read consistency mode trades freshness for the lowest latency and best scalability on Consul reads?',
    options: opts4(
      'consistent',
      'default',
      'stale',
      'leader-only'
    ),
    correct: ['c'],
    explanation: '"stale" reads can be served by any server (including followers) without leader confirmation, lowering latency and increasing read scalability at the cost of possibly returning slightly out-of-date data.',
    references: [REF_CONSENSUS, REF_ARCH]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'Autopilot reports a server as unhealthy and eventually removes it. What problem does this automated cleanup primarily prevent?',
    options: opts4(
      'Gossip key rotation failures',
      'Dead servers lingering in the Raft peer set and impairing quorum math',
      'Envoy certificate expiry',
      'KV key collisions'
    ),
    correct: ['b'],
    explanation: 'Autopilot dead-server cleanup removes failed servers from the Raft configuration so the quorum size reflects only live servers, preventing a degraded cluster where stale peers make quorum harder to reach.',
    references: [REF_AUTOPILOT, REF_OPERATOR]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Where is the Consul KV store data ultimately persisted and replicated?',
    options: opts4(
      'In each client agent memory only',
      'On the server agents, replicated via Raft',
      'In the Envoy sidecar',
      'In DNS TXT records'
    ),
    correct: ['b'],
    explanation: 'The KV store is part of the server state machine replicated by Raft. Clients proxy KV requests to servers; durability and consistency come from the server Raft log, not client memory.',
    references: [REF_KV, REF_CONSENSUS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL responsibilities of Consul server agents.',
    options: opts4(
      'Maintain the catalog and KV store',
      'Participate in Raft consensus and leader election',
      'Answer cross-datacenter requests via WAN gossip',
      'Run application workloads by default'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Servers hold the catalog/KV, run Raft, and join the WAN pool for cross-DC requests. They are not intended to run application workloads — that responsibility belongs to nodes running client agents.',
    references: [REF_ARCH, REF_FEDERATION]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'A client agent is restarted. Which statement is correct about its state afterward?',
    options: opts4(
      'It permanently loses all knowledge of cluster services.',
      'It re-syncs from servers and re-registers its local services from its config.',
      'It becomes a server until the next election.',
      'It must be re-bootstrapped with bootstrap_expect.'
    ),
    correct: ['b'],
    explanation: 'On restart a client rejoins gossip, contacts servers, and re-registers services defined in its configuration directory. Servers hold the authoritative catalog, so the client simply re-syncs rather than losing cluster knowledge permanently.',
    references: [REF_AGENT, REF_ARCH]
  },

  // ── Deploy Consul (10) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'On a 3-server cluster, what value should `bootstrap_expect` be set to on the servers?',
    options: opts4('1', '2', '3', '5'),
    correct: ['c'],
    explanation: '`bootstrap_expect` should match the number of servers forming the initial cluster — 3 here. Consul waits for 3 servers before automatically bootstrapping and electing the first leader.',
    references: [REF_BOOTSTRAP]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command shows the LAN gossip members of the local datacenter?',
    options: opts4(
      'consul members',
      'consul catalog members',
      'consul kv members',
      'consul info members'
    ),
    correct: ['a'],
    explanation: '`consul members` lists agents in the LAN gossip pool with their status and type. Add `-wan` to view the WAN pool of servers across datacenters.',
    references: [REF_MEMBERS]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You restore a cluster from a snapshot. Which command performs the restore?',
    options: opts4(
      'consul snapshot restore backup.snap',
      'consul kv import backup.snap',
      'consul operator raft restore backup.snap',
      'consul agent -restore backup.snap'
    ),
    correct: ['a'],
    explanation: '`consul snapshot restore <file>` writes a previously saved snapshot back into the servers, restoring KV, catalog, sessions, and ACLs. It is the counterpart to `consul snapshot save`.',
    references: [REF_SNAPSHOT]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A node should leave the cluster gracefully when its service is stopped. Which CLI command performs a graceful leave?',
    options: opts4(
      'consul leave',
      'consul kill',
      'consul operator raft remove-peer',
      'consul force-leave'
    ),
    correct: ['a'],
    explanation: '`consul leave` triggers a graceful departure: the agent notifies the cluster and is marked "left". `force-leave` is for evicting a node that already failed; `remove-peer` edits the Raft peer set directly.',
    references: [REF_CLI, REF_MEMBERS]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agent setting specifies the address other agents should use to reach this agent?',
    options: opts4(
      'advertise_addr',
      'bootstrap_expect',
      'recursors',
      'datacenter'
    ),
    correct: ['a'],
    explanation: '`advertise_addr` is the address advertised to other agents for gossip/RPC. It matters when the bind address differs from the routable address (e.g., NAT or multiple interfaces).',
    references: [REF_AGENT_CONFIG]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'After a catastrophic loss of quorum with most servers gone, which approach lets you manually recover the cluster from the surviving server?',
    options: opts4(
      'Run `consul kv export`',
      'Create a raft/peers.json (peers recovery) file and restart, or use snapshot restore',
      'Delete the data_dir on the survivor',
      'Run `consul reload`'
    ),
    correct: ['b'],
    explanation: 'Outage recovery uses a manual peers recovery file (raft/peers.json) to reset the peer set on surviving servers, or restoring from a known-good snapshot. Deleting data_dir destroys state; reload does not fix quorum.',
    references: [REF_OPERATOR, REF_SNAPSHOT]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which directory setting must point to durable storage so server state survives restarts?',
    options: opts4(
      'log_dir',
      'data_dir',
      'pid_file',
      'config_dir'
    ),
    correct: ['b'],
    explanation: '`data_dir` holds the Raft log, snapshots, and other persistent state. It must be on durable storage; losing it loses the server contribution to the cluster state.',
    references: [REF_AGENT_CONFIG, REF_DEPLOY]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command joins a running agent to an existing cluster at runtime?',
    options: opts4(
      'consul join <addr>',
      'consul connect <addr>',
      'consul members add <addr>',
      'consul kv join <addr>'
    ),
    correct: ['a'],
    explanation: '`consul join <addr>` makes the local agent join a cluster by contacting an existing member. For automatic rejoin across restarts, configure `retry_join` instead of relying on a one-time manual join.',
    references: [REF_JOIN, REF_CLI]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Consul cluster bootstrapping.',
    options: opts4(
      '`bootstrap_expect` should be set on server agents only.',
      'The first leader is elected after the expected number of servers are present.',
      'Client agents need `bootstrap_expect` to join.',
      '`retry_join` helps servers find each other during bootstrap.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: '`bootstrap_expect` is a server-side setting; clients do not use it. Once the expected servers gossip together, a leader is elected. `retry_join` (or cloud auto-join) helps the servers discover each other reliably during bootstrap.',
    references: [REF_BOOTSTRAP, REF_JOIN]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command displays detailed runtime information about the local agent, including Raft and Serf stats?',
    options: opts4(
      'consul info',
      'consul status',
      'consul agent -stats',
      'consul debug -info'
    ),
    correct: ['a'],
    explanation: '`consul info` prints agent diagnostics: build, consul (leader, server), raft (term, applied index), serf LAN/WAN stats. It is a quick health/troubleshooting view for an agent.',
    references: [REF_CLI, REF_AGENT]
  },

  // ── Service Discovery and Registration (12) ──
  {
    domain: SD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which port does Consul serve DNS on by default?',
    options: opts4('53', '8500', '8600', '8300'),
    correct: ['c'],
    explanation: 'Consul DNS listens on port 8600 by default. 8500 is the HTTP API, 8300 is server RPC. To use standard port 53, you typically forward via the OS resolver or a DNS recursor.',
    references: [REF_DNS]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which DNS form resolves the address of a specific node named `db-1`?',
    options: opts4(
      'db-1.service.consul',
      'db-1.node.consul',
      'db-1.consul.node',
      'node.db-1.consul'
    ),
    correct: ['b'],
    explanation: 'Node lookups use `<node>.node.consul`. Service lookups use `<service>.service.consul`. Node lookups return the node address regardless of which services run on it.',
    references: [REF_DNS_NODE]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'A service has two checks: one passing, one critical. How does Consul classify the service instance overall?',
    options: opts4(
      'Passing, because at least one check passes',
      'Critical, because any critical check makes the instance critical',
      'Warning, always',
      'Unknown until both agree'
    ),
    correct: ['b'],
    explanation: 'Consul takes the worst status among an instance checks. If any associated check is critical, the instance is critical and excluded from healthy-only discovery, even if other checks pass.',
    references: [REF_HEALTH]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a script-based health check. Which agent setting must be enabled for script checks to run?',
    options: opts4(
      'enable_script_checks (or enable_local_script_checks)',
      'enable_dns_checks',
      'enable_raft_checks',
      'script_mode = "auto"'
    ),
    correct: ['a'],
    explanation: 'For security, script/exec checks are disabled by default. `enable_script_checks` (any source) or `enable_local_script_checks` (only agent-local config) must be set so the agent will execute script checks.',
    references: [REF_HEALTH, REF_AGENT_CONFIG]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command deregisters a service from the local agent by ID?',
    options: opts4(
      'consul services deregister -id web1',
      'consul kv delete service/web1',
      'consul catalog remove web1',
      'consul agent deregister web1'
    ),
    correct: ['a'],
    explanation: '`consul services deregister -id <id>` removes a service registration from the local agent. KV delete affects KV only, and there is no `consul catalog remove`/`consul agent deregister` subcommand.',
    references: [REF_REGISTER, REF_CLI]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'A TTL check is configured but the application stops sending heartbeats. What status does the check move to after the TTL expires?',
    options: opts4(
      'passing',
      'warning then back to passing automatically',
      'critical',
      'maintenance'
    ),
    correct: ['c'],
    explanation: 'A TTL check relies on the application periodically updating it (e.g., `/v1/agent/check/pass`). If no update arrives before the TTL elapses, Consul marks the check critical, removing the instance from healthy discovery.',
    references: [REF_HEALTH]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which API endpoint lists nodes registered for a given service in the catalog?',
    options: opts4(
      '/v1/catalog/service/<name>',
      '/v1/kv/<name>',
      '/v1/agent/self',
      '/v1/status/leader'
    ),
    correct: ['a'],
    explanation: '`/v1/catalog/service/<name>` returns the nodes providing that service from the catalog. `/v1/health/service/<name>` adds health info; `/v1/agent/self` is agent config; `/v1/status/leader` is the Raft leader.',
    references: [REF_CATALOG]
  },
  {
    domain: SD, difficulty: 4, type: QType.SINGLE,
    stem: 'You want a single query name that returns geographically nearest healthy instances and fails over to another datacenter. Which Consul feature fits best?',
    options: opts4(
      'A plain service DNS record',
      'A prepared query with nearest-n and failover',
      'A KV watch',
      'A node lookup'
    ),
    correct: ['b'],
    explanation: 'Prepared queries support sorting by network distance (e.g., `Near`) and failover policies across datacenters, all behind one stable query name — capabilities plain service DNS does not provide.',
    references: [REF_QUERY]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which field in a service definition lets you group/segment instances for discovery and L7 routing (e.g., "v1", "canary")?',
    options: opts4(
      'tags / meta',
      'data_dir',
      'bootstrap_expect',
      'recursors'
    ),
    correct: ['a'],
    explanation: 'Tags (and service `meta`) label instances so consumers can filter via tag DNS (`v1.web.service.consul`) or define subsets in a `service-resolver`. They are the standard segmentation mechanism for discovery and routing.',
    references: [REF_SERVICES, REF_DNS_NODE]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'By default, Consul service DNS only returns instances that are passing their health checks.',
    options: opts4('True', 'False', 'Only for TCP services', 'Only when ACLs are enabled'),
    correct: ['a'],
    explanation: 'Healthy-only is the default for service DNS, so failing instances are automatically excluded. Returning warning-state instances can be enabled with the `only_passing` DNS configuration toggle.',
    references: [REF_DNS, REF_HEALTH]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command lists the nodes in the catalog?',
    options: opts4(
      'consul catalog nodes',
      'consul members nodes',
      'consul kv list nodes/',
      'consul node list'
    ),
    correct: ['a'],
    explanation: '`consul catalog nodes` lists nodes known to the catalog (with `-service` to filter by service). `consul members` shows gossip membership, which is related but distinct from the catalog view.',
    references: [REF_CATALOG, REF_CLI]
  },
  {
    domain: SD, difficulty: 4, type: QType.SINGLE,
    stem: 'An application caches DNS answers too long and keeps hitting a failed instance. Which Consul DNS setting most directly controls how long answers may be cached?',
    options: opts4(
      'dns_config TTL settings (service/node TTL)',
      'bootstrap_expect',
      'gossip encrypt key',
      'enable_script_checks'
    ),
    correct: ['a'],
    explanation: 'The agent `dns_config` block controls DNS TTLs for service and node lookups. Lower TTLs make clients re-resolve sooner so they pick up health changes faster, mitigating stale cached answers.',
    references: [REF_DNS, REF_AGENT_CONFIG]
  },

  // ── Service Mesh (13) ──
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What identity does a Consul mesh service present to peers for authentication?',
    options: opts4(
      'Its node IP address',
      'A TLS certificate encoding its service identity',
      'A gossip key fingerprint',
      'Its DNS name only'
    ),
    correct: ['b'],
    explanation: 'Each meshed service receives a leaf TLS certificate (SPIFFE-style URI SAN) that encodes its service identity. Sidecars use it for mutual TLS so authorization decisions are identity-based, not IP-based.',
    references: [REF_CONNECT, REF_CA]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'If no intentions are defined and the default is "allow", what happens when service A calls service B in the mesh?',
    options: opts4(
      'The call is denied.',
      'The call is allowed by the default-allow posture.',
      'The call hangs until an intention is created.',
      'The sidecar is disabled.'
    ),
    correct: ['b'],
    explanation: 'With a default-allow intention posture, communication is permitted unless a specific deny intention matches. For zero-trust, operators switch the default to deny and add explicit allows.',
    references: [REF_INTENTIONS]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'You set the global intention default to "deny". You then create an allow intention from `web` to `api`. What is the result?',
    options: opts4(
      'All services can talk to each other.',
      'Only web→api is permitted; other unspecified pairs are denied.',
      'No services can talk, including web→api.',
      'Intentions are ignored under default-deny.'
    ),
    correct: ['b'],
    explanation: 'Under default-deny only explicitly allowed source/destination pairs may communicate. Creating an allow intention web→api permits exactly that path while all other unmatched pairs remain denied.',
    references: [REF_INTENTIONS]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which config entry would you use to apply default proxy settings (e.g., protocol, mesh gateway mode) to ALL services?',
    options: opts4(
      'proxy-defaults',
      'service-splitter',
      'service-intentions',
      'exported-services'
    ),
    correct: ['a'],
    explanation: 'A `proxy-defaults` config entry sets global, cluster-wide defaults for sidecar proxies, such as the default protocol and mesh gateway mode. Per-service overrides go in `service-defaults`.',
    references: [REF_CONFIGENTRY, REF_SERVICEDEFAULTS]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command writes a configuration entry from a file?',
    options: opts4(
      'consul config write entry.hcl',
      'consul kv put config entry.hcl',
      'consul connect config entry.hcl',
      'consul entry apply entry.hcl'
    ),
    correct: ['a'],
    explanation: '`consul config write <file>` creates/updates a configuration entry (service-defaults, service-resolver, etc.). `consul config read`/`list`/`delete` manage the rest of the lifecycle.',
    references: [REF_CONFIGENTRY, REF_CLI]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'You need L7 path-based routing so `/v2` requests go to a different service subset. Which config entry provides HTTP route matching?',
    options: opts4(
      'service-router',
      'service-splitter',
      'service-defaults',
      'proxy-defaults'
    ),
    correct: ['a'],
    explanation: 'A `service-router` matches L7 attributes (path, header, method) and routes to targets/subsets. Splitters do weighted distribution; resolvers define subsets. Routers require protocol http set via service-defaults.',
    references: [REF_SERVICERESOLVER, REF_SERVICESPLITTER]
  },
  {
    domain: MESH, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL correct statements about Consul mesh gateways.',
    options: opts4(
      'They forward mTLS traffic between datacenters or partitions without decrypting it.',
      'They are required for any single-datacenter mesh communication.',
      'They help connect meshes across networks that cannot route directly.',
      'They preserve end-to-end service identity.'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Mesh gateways relay encrypted mesh traffic across datacenters/partitions/networks while preserving end-to-end mTLS and identity. They are not required for ordinary same-datacenter sidecar-to-sidecar traffic.',
    references: [REF_GATEWAY]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'A meshed service declares an upstream. What does the application connect to in order to reach that upstream securely?',
    options: opts4(
      'The remote service public IP directly',
      'A local listener exposed by its own sidecar proxy',
      'The Consul server HTTP API',
      'A DNS recursor'
    ),
    correct: ['b'],
    explanation: 'Declared upstreams are exposed as local listeners on the service own sidecar. The app connects locally; the sidecar performs mTLS and enforces intentions to reach the destination service securely.',
    references: [REF_SIDECAR, REF_CONNECT]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the Consul service mesh certificate authority (CA) is correct?',
    options: opts4(
      'It only supports an external CA and cannot be built-in.',
      'It can use a built-in CA or be backed by Vault or an ACM PCA provider.',
      'It issues gossip encryption keys.',
      'It is the same as the ACL bootstrap token.'
    ),
    correct: ['b'],
    explanation: 'The mesh CA can use the built-in Consul CA or pluggable providers such as HashiCorp Vault or AWS ACM Private CA. It issues service leaf certificates for mTLS — separate from gossip keys and ACL tokens.',
    references: [REF_CA, REF_CONNECT]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists currently defined intentions?',
    options: opts4(
      'consul intention list',
      'consul connect intentions',
      'consul acl intention list',
      'consul mesh list'
    ),
    correct: ['a'],
    explanation: '`consul intention list` (and `consul intention check <src> <dst>`) inspects intentions. Intentions can also be read as `service-intentions` config entries via `consul config read`.',
    references: [REF_INTENTIONS, REF_CLI]
  },
  {
    domain: MESH, difficulty: 4, type: QType.SINGLE,
    stem: 'You want canary routing: 95% to `v1`, 5% to `v2`, where v1/v2 are defined by service tags. Which combination is required?',
    options: opts4(
      'service-router only',
      'service-resolver (subsets) + service-splitter (weights) + service-defaults http',
      'proxy-defaults only',
      'exported-services + intentions'
    ),
    correct: ['b'],
    explanation: 'You define subsets in a `service-resolver`, weighted distribution in a `service-splitter`, and enable L7 by setting protocol http in `service-defaults`. Together they implement weighted canary routing.',
    references: [REF_SERVICERESOLVER, REF_SERVICESPLITTER]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Intentions in Consul are enforced based on service identity rather than source IP address.',
    options: opts4('True', 'False', 'Only for HTTP', 'Only across datacenters'),
    correct: ['a'],
    explanation: 'Intentions evaluate the authenticated mTLS service identity of the caller, not its IP. This keeps authorization stable even when workloads move and IPs change in dynamic environments.',
    references: [REF_INTENTIONS, REF_CONNECT]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which gateway type is most appropriate to expose an internal mesh HTTP service to users on the corporate network?',
    options: opts4(
      'Terminating gateway',
      'Ingress gateway',
      'Mesh gateway',
      'No gateway is ever needed'
    ),
    correct: ['b'],
    explanation: 'An ingress gateway is the north-south entry point: it accepts traffic from outside the mesh and forwards it to mesh services, which is exactly the case for exposing an internal HTTP service to users.',
    references: [REF_INGRESS]
  },

  // ── Network Infrastructure Automation (10) ──
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does CTS run when a watched Consul service changes?',
    options: opts4(
      'A Raft election',
      'A configured Terraform module/task',
      'A gossip flush',
      'An ACL bootstrap'
    ),
    correct: ['b'],
    explanation: 'CTS maps watched services to Terraform tasks. When the service set changes, CTS executes the associated Terraform module so network infrastructure (LBs, firewalls) reflects the new state automatically.',
    references: [REF_CTS, REF_CTS_TASK]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which CTS mode lets you preview Terraform changes without applying them?',
    options: opts4(
      'inspect mode',
      'daemon mode',
      'apply mode',
      'snapshot mode'
    ),
    correct: ['a'],
    explanation: 'CTS inspect mode evaluates tasks and shows the Terraform plan/diff without applying, useful for validation. Daemon mode runs continuously and applies automatically on change.',
    references: [REF_CTS]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'consul-template can take what action after re-rendering a file?',
    options: opts4(
      'Promote a server',
      'Run a configured command such as reloading a service',
      'Rotate the gossip key',
      'Bootstrap ACLs'
    ),
    correct: ['b'],
    explanation: 'After the rendered output changes, consul-template can execute a command (its `exec`/command) — commonly reloading or restarting the consuming application so it picks up the new configuration.',
    references: [REF_TEMPLATE]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Consul KV command deletes all keys under the prefix `app/`?',
    options: opts4(
      'consul kv delete -recurse app/',
      'consul kv rm app/*',
      'consul kv purge app/',
      'consul delete kv app/'
    ),
    correct: ['a'],
    explanation: '`consul kv delete -recurse <prefix>` removes every key under the prefix. Without `-recurse`, only an exact key match is deleted. There is no `rm`/`purge` KV subcommand.',
    references: [REF_KV]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which watch type fires when the set of healthy instances for a service changes?',
    options: opts4(
      'service watch',
      'key watch',
      'event watch only',
      'raft watch'
    ),
    correct: ['a'],
    explanation: 'A `service` (or `checks`) watch monitors instances/health for a service and invokes the handler when they change, enabling automation that reacts to scaling or failures without polling.',
    references: [REF_WATCHES, REF_HEALTH]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is CTS preferred over hand-editing load balancer configs in a dynamic environment?',
    options: opts4(
      'It encrypts gossip automatically',
      'It keeps network infrastructure continuously in sync with the live service catalog via Terraform',
      'It replaces the need for Consul servers',
      'It disables health checks'
    ),
    correct: ['b'],
    explanation: 'CTS turns service catalog changes into Terraform runs, so appliances stay continuously aligned with reality. Manual edits lag behind scaling events and are error-prone; CTS removes that toil.',
    references: [REF_NIA, REF_CTS]
  },
  {
    domain: NIA, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Consul watches.',
    options: opts4(
      'They can watch keys, key prefixes, services, checks, nodes, or events.',
      'They invoke a handler script or HTTP endpoint on change.',
      'They replace Raft replication.',
      'They support an event-driven automation pattern.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Watches monitor several view types and call a handler/endpoint on change, enabling event-driven automation. They are a consumer of Consul state, not a replacement for Raft replication.',
    references: [REF_WATCHES]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command exports the entire KV tree to a JSON file for backup or migration?',
    options: opts4(
      'consul kv export > kv.json',
      'consul kv dump kv.json',
      'consul snapshot kv kv.json',
      'consul kv backup kv.json'
    ),
    correct: ['a'],
    explanation: '`consul kv export` prints the KV tree as JSON (commonly redirected to a file); `consul kv import` reloads it. For full cluster state including non-KV data, use `consul snapshot save` instead.',
    references: [REF_KV, REF_SNAPSHOT]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'A consul-template template references `{{ key "app/feature" }}`. What does changing that KV value cause?',
    options: opts4(
      'Nothing until the agent restarts',
      'consul-template re-renders the output and may run its reload command',
      'A Raft leader election',
      'Deletion of the service'
    ),
    correct: ['b'],
    explanation: 'consul-template watches the referenced KV key. When the value changes, it re-renders the templated file and, if configured, executes the command to reload the application with the new value.',
    references: [REF_TEMPLATE, REF_KV]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'CTS uses Terraform to automate downstream network infrastructure based on Consul service changes.',
    options: opts4('True', 'False', 'Only KV changes', 'Only in dev mode'),
    correct: ['a'],
    explanation: 'CTS (Consul-Terraform-Sync) is purpose-built to drive Terraform modules from Consul catalog/service changes, automating network middleware updates as services scale up and down.',
    references: [REF_CTS, REF_NIA]
  },

  // ── Consul Security (10) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'How many times can `consul acl bootstrap` succeed for a given cluster under normal conditions?',
    options: opts4(
      'Unlimited times',
      'Exactly once',
      'Once per datacenter per day',
      'Once per server agent'
    ),
    correct: ['b'],
    explanation: 'ACL bootstrap is a one-time operation: it succeeds only while no tokens exist and produces the initial management token. Subsequent calls fail unless the bootstrap is explicitly reset by an operator.',
    references: [REF_ACL_BOOTSTRAP]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Where is the gossip encryption key configured on an agent?',
    options: opts4(
      'The `encrypt` setting in agent configuration',
      'The `acl` block',
      'A service definition file',
      'The Envoy bootstrap config'
    ),
    correct: ['a'],
    explanation: 'The base64 key from `consul keygen` goes in the agent `encrypt` configuration so the agent encrypts/decrypts gossip. All agents in a pool must share the same key to communicate.',
    references: [REF_GOSSIP_ENC, REF_KEYGEN]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which TLS-related agent settings enforce that RPC peers must present and verify valid certificates?',
    options: opts4(
      'verify_incoming and verify_outgoing (and verify_server_hostname)',
      'bootstrap_expect and retry_join',
      'enable_script_checks',
      'recursors'
    ),
    correct: ['a'],
    explanation: '`verify_incoming`, `verify_outgoing`, and `verify_server_hostname` enforce mutual TLS verification for agent RPC, ensuring only trusted, properly-named peers participate. They are independent of gossip encryption.',
    references: [REF_TLS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A token should allow read-only access to all KV keys. Which policy rule expresses this?',
    options: opts4(
      'key_prefix "" { policy = "read" }',
      'key_prefix "" { policy = "write" }',
      'kv "*" { allow = "get" }',
      'acl = "read"'
    ),
    correct: ['a'],
    explanation: 'A rule `key_prefix "" { policy = "read" }` grants read on every KV key (empty prefix matches all). `write` would allow modification; the other syntaxes are not valid Consul ACL rule HCL.',
    references: [REF_ACL_POLICIES]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which header is used to pass an ACL token on Consul HTTP API requests?',
    options: opts4(
      'X-Consul-Token',
      'Authorization: Basic',
      'X-Vault-Token',
      'Consul-ACL'
    ),
    correct: ['a'],
    explanation: 'Clients present the token via the `X-Consul-Token` header (or `Authorization: Bearer <token>`). The CLI uses `-token` or the `CONSUL_HTTP_TOKEN` environment variable.',
    references: [REF_ACL_TOKENS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the security purpose of setting the ACL default policy to "deny"?',
    options: opts4(
      'It speeds up Raft elections.',
      'It enforces least privilege — requests are denied unless a policy explicitly allows them.',
      'It encrypts gossip.',
      'It disables the HTTP API.'
    ),
    correct: ['b'],
    explanation: 'Default-deny means any action not explicitly granted by a linked policy is rejected, implementing least privilege/zero-trust. Default-allow is permissive and only recommended for initial bring-up.',
    references: [REF_ACL]
  },
  {
    domain: SEC, difficulty: 4, type: QType.SINGLE,
    stem: 'You must rotate the gossip encryption key with zero downtime. Which tool/command supports installing and promoting a new key across the pool?',
    options: opts4(
      'consul keyring (install/use/remove)',
      'consul snapshot rotate',
      'consul acl bootstrap',
      'consul reload only'
    ),
    correct: ['a'],
    explanation: '`consul keyring` manages multiple gossip keys: install the new key everywhere, set it as primary with `-use`, then remove the old key. This rolls the key without disrupting gossip membership.',
    references: [REF_GOSSIP_ENC]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command lists existing ACL tokens (with a management token)?',
    options: opts4(
      'consul acl token list',
      'consul token ls',
      'consul acl list tokens',
      'consul kv list acl/tokens/'
    ),
    correct: ['a'],
    explanation: '`consul acl token list` enumerates tokens; `consul acl token read -id <id>` shows one. Listing requires sufficient ACL privileges (typically a management token).',
    references: [REF_ACL_TOKENS, REF_CLI]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly distinguish gossip encryption from TLS in Consul.',
    options: opts4(
      'Gossip encryption uses a shared symmetric key for the Serf pools.',
      'TLS secures agent RPC and the HTTP API.',
      'Gossip encryption secures the HTTP API.',
      'TLS can require mutual certificate verification between agents.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Gossip encryption (symmetric key) protects Serf gossip; TLS protects RPC and HTTP and can enforce mutual verification. Gossip encryption does not secure the HTTP API — that is the role of TLS.',
    references: [REF_TLS, REF_GOSSIP_ENC]
  },
  {
    domain: SEC, difficulty: 4, type: QType.SINGLE,
    stem: 'An auditor asks how a compromised application node is prevented from reading unrelated secrets in KV. Which Consul mechanism is the primary control?',
    options: opts4(
      'Gossip encryption',
      'Scoped ACL policies/tokens limiting KV access by prefix',
      'Autopilot dead-server cleanup',
      'WAN federation'
    ),
    correct: ['b'],
    explanation: 'Least-privilege ACL policies scoped to specific key prefixes ensure a node token can only read its own KV paths. Gossip encryption protects traffic confidentiality but does not authorize KV access.',
    references: [REF_ACL_POLICIES, REF_ACL]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Explain Consul Architecture (10) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component is responsible for fast failure detection of nodes in a Consul datacenter?',
    options: opts4(
      'Raft consensus',
      'The Serf gossip layer',
      'The Envoy sidecar',
      'The DNS interface'
    ),
    correct: ['b'],
    explanation: 'Serf gossip provides probabilistic, scalable failure detection: agents periodically probe peers and disseminate suspected failures. Raft handles consistent state, not membership/failure detection.',
    references: [REF_GOSSIP]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A datacenter has 5 servers. How many server failures can it tolerate while keeping quorum?',
    options: opts4('1', '2', '3', '4'),
    correct: ['b'],
    explanation: 'Quorum for 5 servers is 3 (floor(5/2)+1). The cluster keeps quorum as long as 3 remain, so it tolerates the loss of 2 servers before writes are blocked.',
    references: [REF_CONSENSUS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about WAN federation between two datacenters is correct?',
    options: opts4(
      'Both datacenters share a single Raft leader.',
      'Each datacenter keeps its own Raft/catalog; servers join a WAN gossip pool to forward cross-DC requests.',
      'Client agents form the WAN pool.',
      'Federation requires disabling ACLs.'
    ),
    correct: ['b'],
    explanation: 'Federation joins server agents into a WAN gossip pool so requests can be forwarded across datacenters, but each datacenter retains an independent Raft leader and catalog for low-latency local operations.',
    references: [REF_FEDERATION, REF_DATACENTER]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements comparing Raft and gossip in Consul.',
    options: opts4(
      'Raft provides strong consistency for the catalog/KV on servers.',
      'Gossip provides eventually-consistent membership and failure detection.',
      'Gossip is used to elect the Raft leader directly.',
      'Both can be encrypted, by different mechanisms.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Raft = strong consistency for server state; gossip = eventually-consistent membership/failure detection. Leader election is a Raft process, not a gossip one. Raft uses TLS while gossip uses a symmetric key.',
    references: [REF_CONSENSUS, REF_GOSSIP]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Consul client agents do not store the authoritative catalog; servers do.',
    options: opts4('True', 'False', 'Only with ACLs', 'Only in dev mode'),
    correct: ['a'],
    explanation: 'The authoritative catalog and KV state live on the server agents and are replicated by Raft. Clients are stateless proxies that forward requests and run local checks.',
    references: [REF_ARCH]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the practical effect of using the "consistent" read mode?',
    options: opts4(
      'Reads are served by any follower for speed',
      'The leader confirms it is still leader before answering, giving the freshest data at higher latency',
      'Reads bypass ACLs',
      'Reads are cached on clients indefinitely'
    ),
    correct: ['b'],
    explanation: '"consistent" forces the leader to verify its leadership (a round trip) before responding, returning the most up-to-date data at the cost of additional latency compared to default or stale reads.',
    references: [REF_CONSENSUS]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'Adding a 4th and 5th server to a 3-server cluster primarily improves what?',
    options: opts4(
      'Write throughput linearly',
      'Fault tolerance (5 servers tolerate 2 failures vs 1 for 3)',
      'Gossip key strength',
      'DNS TTL accuracy'
    ),
    correct: ['b'],
    explanation: 'Moving from 3 to 5 servers raises fault tolerance from 1 to 2 failures. It does not linearly increase write throughput — every write still needs quorum acknowledgment, which more voters can slightly slow.',
    references: [REF_CONSENSUS, REF_DEPLOY]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agent identifies the logical datacenter an agent belongs to?',
    options: opts4(
      'The `datacenter` configuration setting',
      'The `encrypt` setting',
      'The `bootstrap_expect` setting',
      'The `recursors` setting'
    ),
    correct: ['a'],
    explanation: 'The `datacenter` setting names the agent datacenter (default `dc1`). It must be consistent within a datacenter and is used for catalog scoping and cross-DC request routing.',
    references: [REF_AGENT_CONFIG, REF_DATACENTER]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'Why are client agents considered horizontally scalable while servers are not scaled the same way?',
    options: opts4(
      'Clients run Raft so adding them adds quorum',
      'Clients are stateless proxies, so you can add many; servers are bounded by Raft quorum performance',
      'Servers cannot exceed 2 nodes',
      'Clients store the catalog redundantly'
    ),
    correct: ['b'],
    explanation: 'You can run thousands of stateless client agents because they do not participate in consensus. Server count is deliberately small (3 or 5) because every additional voter increases Raft coordination cost.',
    references: [REF_ARCH, REF_CONSENSUS]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'During a network partition, the minority side of a Consul datacenter cannot elect a leader. What does this guarantee?',
    options: opts4(
      'Availability over consistency on the minority side',
      'Consistency: the minority side refuses writes rather than risk split-brain',
      'The minority side becomes a new datacenter',
      'Gossip stops globally'
    ),
    correct: ['b'],
    explanation: 'Raft favors consistency: only a partition with a quorum can elect a leader and accept writes. The minority side refuses writes to prevent divergent state (split-brain), trading availability for safety.',
    references: [REF_CONSENSUS]
  },

  // ── Deploy Consul (10) ──
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command checks the validity of a Consul configuration file before starting the agent?',
    options: opts4(
      'consul validate <config>',
      'consul check <config>',
      'consul agent -test',
      'consul lint <config>'
    ),
    correct: ['a'],
    explanation: '`consul validate <path>` parses and validates configuration files/directories and reports errors without starting the agent — useful in CI and before rolling out config changes.',
    references: [REF_CLI, REF_AGENT_CONFIG]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does `consul members -wan` display?',
    options: opts4(
      'LAN members of the local datacenter',
      'Server agents participating in the WAN gossip pool across datacenters',
      'Only failed nodes',
      'KV keys replicated over the WAN'
    ),
    correct: ['b'],
    explanation: '`consul members -wan` lists the server agents in the WAN gossip pool used for cross-datacenter communication. The default (LAN) view shows agents within the local datacenter.',
    references: [REF_MEMBERS, REF_FEDERATION]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'A new server is added but never becomes a voter. Which subsystem decides when a new server is promoted to a voting member?',
    options: opts4(
      'Gossip encryption',
      'Autopilot (server stabilization)',
      'The DNS interface',
      'consul-template'
    ),
    correct: ['b'],
    explanation: 'Autopilot governs safe server introduction: a new server must be stable/healthy for a configured period before being promoted to a voter, avoiding premature quorum changes during joins.',
    references: [REF_AUTOPILOT]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'You schedule daily backups of Consul. Which command belongs in the backup job?',
    options: opts4(
      'consul snapshot save /backups/consul-$(date).snap',
      'consul reload',
      'consul members',
      'consul info'
    ),
    correct: ['a'],
    explanation: '`consul snapshot save <file>` produces a consistent backup of server state for disaster recovery. The other commands are diagnostic/operational and do not capture recoverable state.',
    references: [REF_SNAPSHOT]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which option makes a server agent automatically attempt to rejoin known peers after a reboot?',
    options: opts4(
      'retry_join',
      'leave_on_terminate = true',
      'disable_update_check',
      'skip_leave_on_interrupt = false'
    ),
    correct: ['a'],
    explanation: '`retry_join` keeps retrying the configured peer addresses (or cloud auto-join) until membership is re-established, which is essential for unattended recovery after reboots.',
    references: [REF_JOIN, REF_AGENT_CONFIG]
  },
  {
    domain: DEPLOY, difficulty: 4, type: QType.SINGLE,
    stem: 'You must reduce a 5-server cluster to 3 servers safely. What is the correct general approach?',
    options: opts4(
      'Kill 2 servers at once and delete their data',
      'Gracefully `consul leave` one server at a time, letting quorum re-stabilize between removals',
      'Set bootstrap_expect = 3 and restart all',
      'Run consul reload on all servers'
    ),
    correct: ['b'],
    explanation: 'Scale down one server at a time using a graceful leave so the Raft peer set shrinks safely and quorum is maintained between steps. Removing multiple voters simultaneously risks losing quorum.',
    references: [REF_OPERATOR, REF_AUTOPILOT]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Where do service definition files belong so the agent loads them on start and reload?',
    options: opts4(
      'In the directory referenced by the agent config (e.g., -config-dir)',
      'In /tmp only',
      'Inside the Raft snapshot',
      'In the Envoy bootstrap file'
    ),
    correct: ['a'],
    explanation: 'Service and check definitions placed in the agent configuration directory are loaded on startup and `consul reload`, making registrations persistent and version-controllable alongside agent config.',
    references: [REF_REGISTER, REF_AGENT_CONFIG]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which `consul operator raft` subcommand shows the current Raft configuration including voter/non-voter status?',
    options: opts4(
      'list-peers',
      'remove-peer',
      'transfer-leader',
      'snapshot'
    ),
    correct: ['a'],
    explanation: '`consul operator raft list-peers` displays the peer set with node, address, and whether each is a voter and which is the leader. `remove-peer` mutates the set; it does not display it.',
    references: [REF_OPERATOR]
  },
  {
    domain: DEPLOY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid steps in a rolling Consul server upgrade.',
    options: opts4(
      'Take a snapshot before starting.',
      'Upgrade one server at a time, verifying quorum/health between each.',
      'Upgrade all servers simultaneously to minimize the window.',
      'Upgrade the leader last, after followers.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Safe upgrades: snapshot first, upgrade one server at a time checking health between steps, and upgrade the leader last (it will step down). Upgrading all servers at once risks total quorum loss.',
    references: [REF_DEPLOY, REF_SNAPSHOT]
  },
  {
    domain: DEPLOY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command forcibly removes a failed (not gracefully left) node from the gossip member list?',
    options: opts4(
      'consul force-leave <node>',
      'consul leave <node>',
      'consul kv delete node/<node>',
      'consul reload'
    ),
    correct: ['a'],
    explanation: '`consul force-leave <node>` evicts a node that is in the "failed" state from the gossip pool. For a healthy node, `consul leave` performs a graceful departure instead.',
    references: [REF_MEMBERS, REF_CLI]
  },

  // ── Service Discovery and Registration (12) ──
  {
    domain: SD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which DNS suffix does Consul use for service lookups by default?',
    options: opts4(
      '.service.consul',
      '.svc.cluster.local',
      '.consul.internal',
      '.discovery.consul'
    ),
    correct: ['a'],
    explanation: 'Service discovery DNS uses `<service>.service.consul` under the default `consul` domain. The Kubernetes-style `.svc.cluster.local` is unrelated to native Consul DNS.',
    references: [REF_DNS]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command registers a service and is run against the local agent from a JSON/HCL file?',
    options: opts4(
      'consul services register payments.json',
      'consul kv put services/payments payments.json',
      'consul catalog register payments.json',
      'consul connect register payments.json'
    ),
    correct: ['a'],
    explanation: '`consul services register <file>` registers the service with the local agent. Registrations placed in the config directory persist across restarts; an API/CLI-only registration does not unless re-issued.',
    references: [REF_REGISTER]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'A health check should warn (not fail) when latency is high but the service still responds. Which check status supports this intermediate state?',
    options: opts4(
      'warning',
      'maintenance',
      'pending',
      'draining'
    ),
    correct: ['a'],
    explanation: 'Consul checks have passing, warning, and critical states. A script/HTTP check can exit/return a warning status to flag degradation while still considered usable depending on `only_passing` configuration.',
    references: [REF_HEALTH]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which API call updates the status of a TTL check named `web-ttl` to passing?',
    options: opts4(
      'PUT /v1/agent/check/pass/web-ttl',
      'GET /v1/health/check/web-ttl',
      'PUT /v1/kv/check/web-ttl',
      'POST /v1/catalog/check/web-ttl'
    ),
    correct: ['a'],
    explanation: 'A TTL check is kept alive by the application calling `/v1/agent/check/pass/<checkid>` (or warn/fail) before the TTL elapses. Missing the deadline flips the check to critical automatically.',
    references: [REF_HEALTH]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command queries Consul DNS for the `web` service using dig against the agent DNS port?',
    options: opts4(
      'dig @127.0.0.1 -p 8600 web.service.consul',
      'dig @127.0.0.1 -p 8500 web.service.consul',
      'dig web.kv.consul',
      'consul dns web'
    ),
    correct: ['a'],
    explanation: 'Consul DNS listens on 8600 by default, so `dig @<agent> -p 8600 web.service.consul` returns healthy instances. 8500 is the HTTP API port, not DNS, and there is no `consul dns` subcommand.',
    references: [REF_DNS]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'You need the port numbers of service instances, not just IPs, from a single DNS query. Which record type does Consul return for that?',
    options: opts4(
      'SRV records',
      'TXT records',
      'CNAME records',
      'PTR records'
    ),
    correct: ['a'],
    explanation: 'Consul returns SRV records for service lookups, which include the target host and port. A and AAAA give addresses only; SRV is the way to get instance ports via DNS.',
    references: [REF_DNS_NODE, REF_DNS]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command creates/updates a prepared query from a definition?',
    options: opts4(
      'consul query (via API /v1/query) — prepared queries are managed through the query API/CLI',
      'consul kv put query/<name>',
      'consul catalog query',
      'consul dns query'
    ),
    correct: ['a'],
    explanation: 'Prepared queries are managed via the `/v1/query` HTTP API (and tooling around it). They support templates, failover, and Near sorting and are then resolved by name through DNS or the API.',
    references: [REF_QUERY]
  },
  {
    domain: SD, difficulty: 4, type: QType.SINGLE,
    stem: 'A service is healthy locally but the catalog still lists a stale failed instance after a node crash. Which mechanism eventually removes the dead node entry?',
    options: opts4(
      'Gossip failure detection plus reaping of failed nodes',
      'Manual KV deletion only',
      'Raft snapshot compaction',
      'consul-template re-render'
    ),
    correct: ['a'],
    explanation: 'Serf detects the node failure and, after the configured interval, Consul reaps the failed node, deregistering its services from the catalog. Operators can also force this with `consul force-leave`.',
    references: [REF_HEALTH, REF_MEMBERS]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which service definition field associates the service with a logical identifier when multiple instances share the same service name on one node?',
    options: opts4(
      'id (service ID, distinct from name)',
      'datacenter',
      'encrypt',
      'recursors'
    ),
    correct: ['a'],
    explanation: 'Multiple instances of the same service `name` on one node must each have a unique `id`. The name is the discoverable service; the id distinguishes individual registrations on the agent.',
    references: [REF_SERVICES, REF_REGISTER]
  },
  {
    domain: SD, difficulty: 2, type: QType.SINGLE,
    stem: 'Consul SRV DNS records include the port of each service instance.',
    options: opts4('True', 'False', 'Only for HTTP', 'Only with ACLs'),
    correct: ['a'],
    explanation: 'SRV records carry priority, weight, port, and target, so a single SRV query yields both the host and the port for each healthy instance — useful for clients that need the port from DNS.',
    references: [REF_DNS_NODE]
  },
  {
    domain: SD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command shows the health status of all instances of the `api` service?',
    options: opts4(
      'consul health service api (or API /v1/health/service/api)',
      'consul kv get health/api',
      'consul members api',
      'consul reload api'
    ),
    correct: ['a'],
    explanation: 'Health for a service is read via the `/v1/health/service/<name>` API (CLI helpers/`consul catalog` also surface it). It lists each instance with check status, which discovery and load balancers consume.',
    references: [REF_HEALTH, REF_CATALOG]
  },
  {
    domain: SD, difficulty: 4, type: QType.SINGLE,
    stem: 'You want service DNS to return only instances passing checks, never warning-state ones. Which DNS config toggle enforces this?',
    options: opts4(
      'only_passing = true in dns_config',
      'enable_script_checks = true',
      'allow_stale = false',
      'recursors = []'
    ),
    correct: ['a'],
    explanation: 'Setting `dns_config { only_passing = true }` makes service DNS exclude warning-state instances, returning strictly passing ones. By default warning instances may still be returned.',
    references: [REF_DNS, REF_AGENT_CONFIG]
  },

  // ── Service Mesh (13) ──
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Consul service mesh, what is the data plane composed of?',
    options: opts4(
      'The Raft leader',
      'Sidecar proxies (typically Envoy) attached to each service',
      'The DNS recursor',
      'The KV store'
    ),
    correct: ['b'],
    explanation: 'The mesh data plane is the set of sidecar proxies (Envoy) that carry service traffic, perform mTLS, and enforce policy. Consul servers act as the control plane configuring those proxies.',
    references: [REF_PROXY, REF_CONNECT]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command checks whether an intention currently allows `web` to talk to `db`?',
    options: opts4(
      'consul intention check web db',
      'consul connect test web db',
      'consul acl check web db',
      'consul mesh verify web db'
    ),
    correct: ['a'],
    explanation: '`consul intention check <src> <dst>` reports whether traffic is currently allowed or denied based on the effective intentions, useful for debugging mesh authorization issues.',
    references: [REF_INTENTIONS, REF_CLI]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which configuration entry would you use to set the default protocol for a single service to `http` so L7 features work for it?',
    options: opts4(
      'service-defaults',
      'service-intentions',
      'exported-services',
      'mesh'
    ),
    correct: ['a'],
    explanation: 'A `service-defaults` entry with `protocol = "http"` enables L7 capabilities (routers/splitters/resolvers) for that specific service. `proxy-defaults` would set it globally instead.',
    references: [REF_SERVICEDEFAULTS]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which gateway is used so two Consul datacenters with non-routable internal networks can still exchange mesh traffic?',
    options: opts4(
      'Ingress gateway',
      'Mesh gateway',
      'Terminating gateway',
      'API gateway only'
    ),
    correct: ['b'],
    explanation: 'Mesh gateways bridge mesh traffic between datacenters/partitions whose internal networks cannot route to each other directly, forwarding encrypted traffic while preserving mTLS identity end to end.',
    references: [REF_GATEWAY]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command reads back a configuration entry of kind `service-defaults` for service `web`?',
    options: opts4(
      'consul config read -kind service-defaults -name web',
      'consul kv get config/service-defaults/web',
      'consul connect read web',
      'consul mesh get web'
    ),
    correct: ['a'],
    explanation: '`consul config read -kind <kind> -name <name>` returns a configuration entry. The KV store does not hold config entries; they have a dedicated config subsystem and CLI.',
    references: [REF_CONFIGENTRY, REF_CLI]
  },
  {
    domain: MESH, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Consul L7 traffic management config entries.',
    options: opts4(
      'service-router matches HTTP attributes and routes accordingly.',
      'service-splitter distributes traffic by weight.',
      'service-resolver defines subsets and failover.',
      'All L7 entries work even when protocol is tcp.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Routers match L7 attributes, splitters do weighted distribution, resolvers define subsets/failover. L7 features require the protocol to be http (or http2/grpc), not tcp.',
    references: [REF_SERVICERESOLVER, REF_SERVICESPLITTER]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'A meshed service must reach an external SaaS API outside the mesh while still being subject to intentions. Which gateway is appropriate?',
    options: opts4(
      'Ingress gateway',
      'Terminating gateway',
      'Mesh gateway',
      'No gateway; call it directly'
    ),
    correct: ['b'],
    explanation: 'A terminating gateway represents the external service inside the mesh. Mesh services connect to it via mTLS (subject to intentions) and it forwards to the external endpoint, keeping policy enforcement at the edge.',
    references: [REF_TERMINATING]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'What happens to traffic between two services when a deny intention is created between them while connections are active?',
    options: opts4(
      'Existing and new connections continue forever',
      'New authorized connections are blocked per the updated intention',
      'The services are deregistered',
      'The Raft leader steps down'
    ),
    correct: ['b'],
    explanation: 'Intentions govern authorization at connection establishment. A new deny intention prevents new connections between the pair; the sidecars enforce the updated policy without deregistering services.',
    references: [REF_INTENTIONS]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which proxy registration stanza tells Consul to manage a sidecar for a service automatically?',
    options: opts4(
      'connect { sidecar_service {} }',
      'proxy { auto = true }',
      'mesh { enable = true }',
      'service { sidecar = "envoy" }'
    ),
    correct: ['a'],
    explanation: 'The `connect { sidecar_service {} }` stanza in a service definition registers a managed sidecar proxy with sensible defaults, including inbound listeners and any declared upstreams.',
    references: [REF_SIDECAR]
  },
  {
    domain: MESH, difficulty: 4, type: QType.SINGLE,
    stem: 'You enabled the mesh CA with the Vault provider. What is the primary benefit over the built-in CA?',
    options: opts4(
      'It removes the need for sidecars',
      'Centralized, auditable certificate issuance and key management in Vault',
      'It disables intentions',
      'It speeds up gossip'
    ),
    correct: ['b'],
    explanation: 'Using Vault as the mesh CA provider centralizes leaf/intermediate certificate issuance with Vault auditing, policy, and key protection, which is preferable for organizations standardizing PKI on Vault.',
    references: [REF_CA]
  },
  {
    domain: MESH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Envoy is the recommended sidecar proxy for production Consul service mesh.',
    options: opts4('True', 'False', 'Only for gRPC', 'Only in Enterprise'),
    correct: ['a'],
    explanation: 'Envoy is the supported, recommended data-plane proxy for Consul service mesh in production, providing robust L4/L7 features. The built-in proxy is intended for testing and development only.',
    references: [REF_PROXY, REF_CONNECT]
  },
  {
    domain: MESH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which config entry kind is used to expose mesh services to external clients at the network edge over defined listeners?',
    options: opts4(
      'ingress-gateway',
      'service-splitter',
      'proxy-defaults',
      'service-intentions'
    ),
    correct: ['a'],
    explanation: 'An `ingress-gateway` config entry defines listeners and which services are exposed to clients outside the mesh, serving as the configured north-south entry point.',
    references: [REF_INGRESS, REF_CONFIGENTRY]
  },
  {
    domain: MESH, difficulty: 4, type: QType.SINGLE,
    stem: 'A service-splitter sends 50/50 to subsets v1 and v2, but all traffic still goes to v1. What is the most likely cause?',
    options: opts4(
      'protocol is still tcp so L7 splitting is not applied',
      'gossip encryption is disabled',
      'bootstrap_expect is wrong',
      'the DNS TTL is too high'
    ),
    correct: ['a'],
    explanation: 'L7 traffic management requires an http-family protocol. If `service-defaults`/`proxy-defaults` still has protocol tcp, splitters are not applied and traffic uses default L4 behavior, ignoring the split.',
    references: [REF_SERVICEDEFAULTS, REF_SERVICESPLITTER]
  },

  // ── Network Infrastructure Automation (10) ──
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'CTS stands for what?',
    options: opts4(
      'Consul-Terraform-Sync',
      'Consul Transit Service',
      'Cluster Telemetry System',
      'Consul TLS Service'
    ),
    correct: ['a'],
    explanation: 'CTS is Consul-Terraform-Sync, the tool that watches Consul and runs Terraform to automate network infrastructure, the canonical NIA implementation in the HashiCorp stack.',
    references: [REF_CTS, REF_NIA]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which file does consul-template render and then optionally trigger a command for?',
    options: opts4(
      'A target output file (e.g., an nginx.conf) from a template',
      'The Raft log',
      'The gossip keyring',
      'The ACL bootstrap token file'
    ),
    correct: ['a'],
    explanation: 'consul-template renders a destination file from a template populated with Consul data, then can run a command (such as reloading the service) when the rendered content changes.',
    references: [REF_TEMPLATE]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'A CTS task watches services `web` and `api`. When does the task Terraform module execute?',
    options: opts4(
      'Only on CTS startup',
      'Whenever the instances/health of web or api change',
      'Every 24 hours regardless of changes',
      'Only when KV changes'
    ),
    correct: ['b'],
    explanation: 'A CTS task is triggered by changes to its source/condition (the watched services). When web or api instances change, CTS runs the associated Terraform to reconcile downstream infrastructure.',
    references: [REF_CTS_TASK]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command imports KV data from a previously exported JSON file?',
    options: opts4(
      'consul kv import @kv.json',
      'consul kv load kv.json',
      'consul snapshot import kv.json',
      'consul kv restore kv.json'
    ),
    correct: ['a'],
    explanation: '`consul kv import` reads the JSON produced by `consul kv export` and writes those keys back. For complete cluster state (catalog/ACLs/KV) use snapshot save/restore instead.',
    references: [REF_KV]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which watch type triggers a handler when a user-defined custom event is fired with `consul event`?',
    options: opts4(
      'event watch',
      'key watch',
      'service watch',
      'nodes watch'
    ),
    correct: ['a'],
    explanation: 'An `event` watch responds to custom events broadcast via `consul event`. Combined with a handler, it enables ad hoc cluster-wide automation triggered on demand by operators.',
    references: [REF_WATCHES]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'In a blue/green network update, why is CTS daemon mode useful?',
    options: opts4(
      'It manually edits firewall rules',
      'It continuously reconciles infrastructure as services shift, with no manual ticket',
      'It elects the Raft leader',
      'It rotates gossip keys'
    ),
    correct: ['b'],
    explanation: 'Daemon mode keeps CTS watching the catalog and applying Terraform as service membership changes during the cutover, so load balancer/firewall state tracks the live environment automatically.',
    references: [REF_CTS, REF_NIA]
  },
  {
    domain: NIA, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about consul-template.',
    options: opts4(
      'It can source values from Consul services, health, and KV.',
      'It can run a command after the rendered file changes.',
      'It is a Consul server and participates in Raft.',
      'It supports an exec mode to manage a child process.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'consul-template reads services/health/KV, renders files, runs commands on change, and has an exec mode to supervise a child process. It is a client/consumer of Consul, not a server in Raft.',
    references: [REF_TEMPLATE, REF_KV]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command writes a value to KV only if the current modify index matches (compare-and-set)?',
    options: opts4(
      'consul kv put -cas -modify-index=<n> <key> <value>',
      'consul kv put -atomic <key> <value>',
      'consul kv set -lock <key> <value>',
      'consul kv put -force <key> <value>'
    ),
    correct: ['a'],
    explanation: '`consul kv put -cas -modify-index=<n>` performs a check-and-set: the write succeeds only if the key current ModifyIndex equals the supplied value, enabling safe optimistic concurrency.',
    references: [REF_KV]
  },
  {
    domain: NIA, difficulty: 3, type: QType.SINGLE,
    stem: 'A consul-template rendered config is correct but the application is not reloading. Which template configuration is most likely missing or wrong?',
    options: opts4(
      'The command/exec to run after render',
      'bootstrap_expect',
      'The gossip encrypt key',
      'verify_incoming'
    ),
    correct: ['a'],
    explanation: 'If the file renders but the app does not pick it up, the post-render command (reload/exec) is missing or incorrect. The other settings are unrelated to triggering the application reload.',
    references: [REF_TEMPLATE]
  },
  {
    domain: NIA, difficulty: 2, type: QType.SINGLE,
    stem: 'Watches let Consul invoke an external handler on changes without that handler polling Consul.',
    options: opts4('True', 'False', 'Only for KV', 'Only in Enterprise'),
    correct: ['a'],
    explanation: 'A watch monitors a Consul view and calls the configured handler/HTTP endpoint when it changes, providing push-style, event-driven automation rather than the handler repeatedly polling Consul.',
    references: [REF_WATCHES]
  },

  // ── Consul Security (10) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which environment variable can the Consul CLI use to supply an ACL token?',
    options: opts4(
      'CONSUL_HTTP_TOKEN',
      'CONSUL_ACL',
      'VAULT_TOKEN',
      'CONSUL_KEY'
    ),
    correct: ['a'],
    explanation: 'The CLI reads `CONSUL_HTTP_TOKEN` (and `-token`) to authenticate API/CLI requests. `VAULT_TOKEN` is for Vault; the others are not Consul environment variables.',
    references: [REF_ACL_TOKENS]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does `consul keygen` output?',
    options: opts4(
      'A base64-encoded symmetric key for gossip encryption',
      'A TLS certificate and private key',
      'An ACL management token',
      'A Raft snapshot'
    ),
    correct: ['a'],
    explanation: '`consul keygen` prints a base64 symmetric key for use in the `encrypt` setting to secure gossip. TLS certs come from a separate CA workflow; ACL tokens come from `consul acl`.',
    references: [REF_KEYGEN]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ACL rule grants write access only to KV keys under `app/config/`?',
    options: opts4(
      'key_prefix "app/config/" { policy = "write" }',
      'key "app/*" { policy = "write" }',
      'kv_prefix "app/config" { allow = true }',
      'key_prefix "" { policy = "write" }'
    ),
    correct: ['a'],
    explanation: 'Scoping with `key_prefix "app/config/" { policy = "write" }` limits write to that subtree, following least privilege. An empty prefix would grant all keys; the other syntaxes are not valid Consul ACL HCL.',
    references: [REF_ACL_POLICIES]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which setting causes a Consul agent to reject inbound TLS connections that do not present a valid client certificate?',
    options: opts4(
      'verify_incoming = true',
      'verify_outgoing = true',
      'enable_script_checks = false',
      'allow_stale = false'
    ),
    correct: ['a'],
    explanation: '`verify_incoming = true` requires inbound connections to present a certificate signed by the configured CA, enforcing mutual authentication on the server side. `verify_outgoing` validates the peer when this agent connects out.',
    references: [REF_TLS]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'After `consul acl bootstrap`, what should you do with the returned SecretID?',
    options: opts4(
      'Store it securely as the initial management token; do not embed it in app code',
      'Publish it in the KV store for all agents',
      'Use it as the gossip encryption key',
      'Discard it; it is not needed again'
    ),
    correct: ['a'],
    explanation: 'The bootstrap token is a global-management credential. Store it securely (e.g., a secrets manager), use it to create scoped tokens/policies, and never embed it broadly — treat it like a root credential.',
    references: [REF_ACL_BOOTSTRAP, REF_ACL_TOKENS]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command rotates the primary gossip key after a new key has been installed cluster-wide?',
    options: opts4(
      'consul keyring -use <new-key>',
      'consul keygen -rotate',
      'consul acl token update',
      'consul reload'
    ),
    correct: ['a'],
    explanation: 'After `consul keyring -install <new-key>` on all agents, `consul keyring -use <new-key>` promotes it to primary; finally `-remove` retires the old key. This rotates gossip encryption with no downtime.',
    references: [REF_GOSSIP_ENC]
  },
  {
    domain: SEC, difficulty: 4, type: QType.SINGLE,
    stem: 'A new agent fails to join with a "decryption failed" gossip error. What is the most likely cause?',
    options: opts4(
      'It is using a different gossip encryption key than the rest of the pool',
      'Its bootstrap_expect is too high',
      'Its DNS port is wrong',
      'Its ACL token expired'
    ),
    correct: ['a'],
    explanation: 'Gossip decryption failures indicate a key mismatch: the agent `encrypt` key (or keyring) differs from the rest of the pool. All members must share the same gossip key to exchange messages.',
    references: [REF_GOSSIP_ENC]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command reads a single ACL token by its accessor ID?',
    options: opts4(
      'consul acl token read -id <accessor-id>',
      'consul acl token get <accessor-id>',
      'consul kv get token/<accessor-id>',
      'consul token show <accessor-id>'
    ),
    correct: ['a'],
    explanation: '`consul acl token read -id <accessor-id>` returns the token details and linked policies. Tokens have an AccessorID (for management/audit) and a SecretID (the bearer credential).',
    references: [REF_ACL_TOKENS, REF_CLI]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Consul ACL tokens.',
    options: opts4(
      'A token has an AccessorID and a SecretID.',
      'Tokens can be linked to policies and roles.',
      'The SecretID should be treated as a sensitive credential.',
      'Tokens are stored as plaintext in the gossip pool.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Tokens have an AccessorID (identifier) and a sensitive SecretID (bearer credential), and may link policies/roles/identities. They are stored in the Raft-backed ACL state, not broadcast over gossip.',
    references: [REF_ACL_TOKENS, REF_ACL_POLICIES]
  },
  {
    domain: SEC, difficulty: 4, type: QType.SINGLE,
    stem: 'For zero-trust between services in the mesh, which combination provides identity-based authn/authz plus encryption?',
    options: opts4(
      'Gossip key only',
      'mTLS service identity certificates plus default-deny intentions',
      'DNS-only with TTL tuning',
      'bootstrap_expect plus retry_join'
    ),
    correct: ['b'],
    explanation: 'Zero-trust in the mesh combines mTLS identity certificates (authentication + encryption) with default-deny intentions (authorization), so only explicitly allowed, authenticated services can communicate.',
    references: [REF_CONNECT, REF_INTENTIONS]
  }
];

const CONSUL_DOMAINS = [
  { name: ARCH, weight: 16 },
  { name: DEPLOY, weight: 16 },
  { name: SD, weight: 18 },
  { name: MESH, weight: 20 },
  { name: NIA, weight: 15 },
  { name: SEC, weight: 15 }
];

const CONSUL_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'hashicorp-consul-associate-p1',
    code: 'CA-003-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 60-minute, 65-question, blueprint-weighted set covering Consul architecture, deployment, service discovery & registration, service mesh, network infrastructure automation, and security.',
    questions: P1
  },
  {
    slug: 'hashicorp-consul-associate-p2',
    code: 'CA-003-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'hashicorp-consul-associate-p3',
    code: 'CA-003-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const CONSUL_BUNDLE = {
  slug: 'hashicorp-consul-associate',
  title: 'HashiCorp Certified: Consul Associate (003)',
  description: 'All 3 Consul Associate (003) practice exams in one bundle — covering Consul architecture, deployment, service discovery & registration, service mesh, network infrastructure automation, and security, aligned to the HashiCorp Certified: Consul Associate (003) exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 7050 // USD 70.50 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Consul Associate (003) bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:consul-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedConsul(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'hashicorp' } });
  await db.vendor.upsert({
    where: { slug: 'hashicorp' },
    update: { name: 'HashiCorp', description: 'HashiCorp certifications — infrastructure automation, secrets management, service networking, and the HashiCorp Certified credentials.' },
    create: { slug: 'hashicorp', name: 'HashiCorp', description: 'HashiCorp certifications — infrastructure automation, secrets management, service networking, and the HashiCorp Certified credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'hashicorp' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of CONSUL_EXAMS) {
    const title = `HashiCorp Certified: Consul Associate (003) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the HashiCorp Certified: Consul Associate (003) exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 60,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: CONSUL_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:consul-seed' } });
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
          generatedBy: 'manual:consul-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: CONSUL_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CONSUL_BUNDLE.slug },
    update: {
      title: CONSUL_BUNDLE.title,
      description: CONSUL_BUNDLE.description,
      price: CONSUL_BUNDLE.price,
      priceVoucher: CONSUL_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: CONSUL_BUNDLE.slug,
      title: CONSUL_BUNDLE.title,
      description: CONSUL_BUNDLE.description,
      price: CONSUL_BUNDLE.price,
      priceVoucher: CONSUL_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'hashicorp-consul-associate-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'hashicorp-consul-associate-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'hashicorp-consul-associate-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'hashicorp-consul-associate-p1', tier: 'VOUCHER' as const, position: 4 }
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
