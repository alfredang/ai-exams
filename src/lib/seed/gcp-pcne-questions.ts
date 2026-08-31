/**
 * Google Professional Cloud Network Engineer (GCP-PCNE) bundle seed —
 * vendor, three practice-exam variants, bundle, and 195 blueprint-aligned
 * questions. Idempotent: replaces rows tagged
 * `generatedBy: 'manual:gcp-pcne-seed'` and upserts catalog rows.
 *
 * Exported as `seedGcpPcne(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/gcp-pcne.ts`) and the protected
 * admin API (`/api/admin/seed-gcp-pcne`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Google Cloud
 * Professional Cloud Network Engineer exam guide and the VPC, Cloud
 * Interconnect, Cloud Load Balancing, and Cloud DNS documentation. The
 * blueprint domains and their official weights:
 *   - Designing, Planning, and Prototyping a Google Cloud Network   — 26% (17/variant)
 *   - Implementing Virtual Private Cloud Instances                  — 21% (14/variant)
 *   - Configuring Network Services                                  — 23% (15/variant)
 *   - Implementing Hybrid Interconnectivity                         — 14% (9/variant)
 *   - Managing, Monitoring, and Optimizing Network Operations       — 16% (10/variant)
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

const DESIGN = 'Designing, Planning, and Prototyping a Google Cloud Network';
const VPC = 'Implementing Virtual Private Cloud Instances';
const SERVICES = 'Configuring Network Services';
const HYBRID = 'Implementing Hybrid Interconnectivity';
const OPS = 'Managing, Monitoring, and Optimizing Network Operations';

const REF_VPC = { label: 'Google Cloud — VPC network overview', url: 'https://cloud.google.com/vpc/docs/vpc' };
const REF_SUBNETS = { label: 'Google Cloud — Subnets', url: 'https://cloud.google.com/vpc/docs/subnets' };
const REF_SHARED_VPC = { label: 'Google Cloud — Shared VPC overview', url: 'https://cloud.google.com/vpc/docs/shared-vpc' };
const REF_PEERING = { label: 'Google Cloud — VPC Network Peering', url: 'https://cloud.google.com/vpc/docs/vpc-peering' };
const REF_ROUTES = { label: 'Google Cloud — Routes overview', url: 'https://cloud.google.com/vpc/docs/routes' };
const REF_FIREWALL = { label: 'Google Cloud — VPC firewall rules', url: 'https://cloud.google.com/firewall/docs/firewalls' };
const REF_FW_POLICY = { label: 'Google Cloud — Firewall policies', url: 'https://cloud.google.com/firewall/docs/firewall-policies' };
const REF_PSC = { label: 'Google Cloud — Private Service Connect', url: 'https://cloud.google.com/vpc/docs/private-service-connect' };
const REF_PSA = { label: 'Google Cloud — Private services access', url: 'https://cloud.google.com/vpc/docs/private-services-access' };
const REF_PGA = { label: 'Google Cloud — Private Google Access', url: 'https://cloud.google.com/vpc/docs/private-google-access' };
const REF_NAT = { label: 'Google Cloud — Cloud NAT overview', url: 'https://cloud.google.com/nat/docs/overview' };
const REF_ROUTER = { label: 'Google Cloud — Cloud Router overview', url: 'https://cloud.google.com/network-connectivity/docs/router/concepts/overview' };
const REF_ALIAS = { label: 'Google Cloud — Alias IP ranges', url: 'https://cloud.google.com/vpc/docs/alias-ip' };
const REF_MULTI_NIC = { label: 'Google Cloud — Multiple network interfaces', url: 'https://cloud.google.com/vpc/docs/multiple-interfaces-concepts' };
const REF_IPV6 = { label: 'Google Cloud — IPv6 subnet ranges', url: 'https://cloud.google.com/vpc/docs/ipv6' };
const REF_MTU = { label: 'Google Cloud — Maximum transmission unit', url: 'https://cloud.google.com/vpc/docs/mtu' };
const REF_LB_CHOOSE = { label: 'Google Cloud — Choose a load balancer', url: 'https://cloud.google.com/load-balancing/docs/choosing-load-balancer' };
const REF_HTTPS_LB = { label: 'Google Cloud — External Application Load Balancer overview', url: 'https://cloud.google.com/load-balancing/docs/https' };
const REF_NLB = { label: 'Google Cloud — External passthrough Network Load Balancer overview', url: 'https://cloud.google.com/load-balancing/docs/network' };
const REF_ILB = { label: 'Google Cloud — Internal passthrough Network Load Balancer overview', url: 'https://cloud.google.com/load-balancing/docs/internal' };
const REF_BACKEND = { label: 'Google Cloud — Backend services overview', url: 'https://cloud.google.com/load-balancing/docs/backend-service' };
const REF_HEALTHCHECK = { label: 'Google Cloud — Health checks overview', url: 'https://cloud.google.com/load-balancing/docs/health-check-concepts' };
const REF_CDN = { label: 'Google Cloud — Cloud CDN overview', url: 'https://cloud.google.com/cdn/docs/overview' };
const REF_ARMOR = { label: 'Google Cloud — Google Cloud Armor overview', url: 'https://cloud.google.com/armor/docs/cloud-armor-overview' };
const REF_DNS = { label: 'Google Cloud — Cloud DNS overview', url: 'https://cloud.google.com/dns/docs/overview' };
const REF_DNS_PRIVATE = { label: 'Google Cloud — Private DNS zones', url: 'https://cloud.google.com/dns/docs/zones/zones-overview' };
const REF_DNS_POLICY = { label: 'Google Cloud — DNS policies', url: 'https://cloud.google.com/dns/docs/policies' };
const REF_DNS_PEERING = { label: 'Google Cloud — DNS peering', url: 'https://cloud.google.com/dns/docs/zones/zones-overview#peering_zones' };
const REF_INTERCONNECT = { label: 'Google Cloud — Cloud Interconnect overview', url: 'https://cloud.google.com/network-connectivity/docs/interconnect/concepts/overview' };
const REF_DEDICATED = { label: 'Google Cloud — Dedicated Interconnect overview', url: 'https://cloud.google.com/network-connectivity/docs/interconnect/concepts/dedicated-overview' };
const REF_PARTNER = { label: 'Google Cloud — Partner Interconnect overview', url: 'https://cloud.google.com/network-connectivity/docs/interconnect/concepts/partner-overview' };
const REF_VPN = { label: 'Google Cloud — Cloud VPN overview', url: 'https://cloud.google.com/network-connectivity/docs/vpn/concepts/overview' };
const REF_HA_VPN = { label: 'Google Cloud — HA VPN topologies', url: 'https://cloud.google.com/network-connectivity/docs/vpn/concepts/topologies' };
const REF_BGP = { label: 'Google Cloud — Cloud Router BGP best practices', url: 'https://cloud.google.com/network-connectivity/docs/router/concepts/overview' };
const REF_NCC = { label: 'Google Cloud — Network Connectivity Center overview', url: 'https://cloud.google.com/network-connectivity/docs/network-connectivity-center/concepts/overview' };
const REF_CROSS_CLOUD = { label: 'Google Cloud — Cross-Cloud Interconnect overview', url: 'https://cloud.google.com/network-connectivity/docs/interconnect/concepts/cci-overview' };
const REF_MONITORING = { label: 'Google Cloud — Cloud Monitoring documentation', url: 'https://cloud.google.com/monitoring/docs' };
const REF_FLOWLOGS = { label: 'Google Cloud — VPC Flow Logs', url: 'https://cloud.google.com/vpc/docs/flow-logs' };
const REF_FW_LOGS = { label: 'Google Cloud — Firewall Rules Logging', url: 'https://cloud.google.com/firewall/docs/firewall-rules-logging' };
const REF_CONN_TESTS = { label: 'Google Cloud — Connectivity Tests overview', url: 'https://cloud.google.com/network-intelligence-center/docs/connectivity-tests/concepts/overview' };
const REF_NIC = { label: 'Google Cloud — Network Intelligence Center', url: 'https://cloud.google.com/network-intelligence-center/docs' };
const REF_NET_TIERS = { label: 'Google Cloud — Network Service Tiers overview', url: 'https://cloud.google.com/network-tiers/docs/overview' };
const REF_QUOTAS = { label: 'Google Cloud — VPC resource quotas and limits', url: 'https://cloud.google.com/vpc/docs/quota' };
const REF_PACKET_MIRROR = { label: 'Google Cloud — Packet Mirroring overview', url: 'https://cloud.google.com/vpc/docs/packet-mirroring' };
const REF_PERIMETER = { label: 'Google Cloud — VPC Service Controls overview', url: 'https://cloud.google.com/vpc-service-controls/docs/overview' };
const REF_LB_LOGS = { label: 'Google Cloud — Load balancer logging and monitoring', url: 'https://cloud.google.com/load-balancing/docs/https/https-logging-monitoring' };
const REF_IAM = { label: 'Google Cloud — IAM roles for networking', url: 'https://cloud.google.com/iam/docs/understanding-roles#networking-roles' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Designing, Planning, and Prototyping a Google Cloud Network (17) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company wants centralized network administration where one team owns the VPC, subnets, and firewall rules while application teams deploy VMs into their own projects. Which design meets this requirement?',
    options: opts4(
      'Create a separate VPC per application project and connect them with VPC Network Peering',
      'Use a Shared VPC with a host project owning the network and service projects attaching to it',
      'Place every resource in a single project with multiple VPCs',
      'Use VPC Network Peering between the network team project and each app project'
    ),
    correct: ['b'],
    explanation: 'Shared VPC lets a host project own the network (subnets, routes, firewall rules) while service projects attach and deploy resources, giving centralized control with decentralized resource deployment. Peering does not centralize firewall/subnet administration and per-project VPCs fragment control.',
    references: [REF_SHARED_VPC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must connect 25 VPCs in a hub-and-spoke topology with transitive connectivity and centralized routing across regions, minimizing manual route management. Which Google Cloud product is designed for this?',
    options: opts4(
      'A full mesh of VPC Network Peering connections',
      'Network Connectivity Center with VPC spokes',
      'A single Shared VPC spanning all teams',
      'Static routes between every pair of VPCs'
    ),
    correct: ['b'],
    explanation: 'Network Connectivity Center provides a hub for transitive connectivity between many VPC and hybrid spokes with centralized route exchange. VPC Peering is non-transitive, and a peering mesh of 25 VPCs is unmanageable.',
    references: [REF_NCC, REF_PEERING]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about choosing between auto mode and custom mode VPC networks for an enterprise design.',
    options: opts4(
      'Custom mode lets you choose subnet ranges and regions explicitly, which is recommended for production',
      'Auto mode creates one subnet per region from a predefined 10.128.0.0/9 block',
      'You can convert an auto mode network to custom mode, but not the reverse',
      'Auto mode subnet ranges never overlap with on-premises ranges'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Custom mode gives explicit control over ranges/regions and is recommended for production. Auto mode allocates subnets from 10.128.0.0/9 and a one-way conversion to custom mode is supported. Auto mode ranges can collide with on-premises RFC 1918 space.',
    references: [REF_VPC, REF_SUBNETS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A design requires that VMs without external IP addresses can still reach Google APIs such as Cloud Storage. Which feature should be enabled on the subnet?',
    options: opts4(
      'Cloud NAT',
      'Private Google Access',
      'Private Service Connect for Google APIs only',
      'External IP forwarding'
    ),
    correct: ['b'],
    explanation: 'Private Google Access lets instances with only internal IPs reach Google API and service default domains. Cloud NAT provides general internet egress, not the specific API-access design intent here.',
    references: [REF_PGA]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization plans a global web application and wants a single anycast IP, TLS termination at the edge, and content-based routing. Which load balancer should the design specify?',
    options: opts4(
      'Internal passthrough Network Load Balancer',
      'Global external Application Load Balancer',
      'Regional external passthrough Network Load Balancer',
      'Internal Application Load Balancer'
    ),
    correct: ['b'],
    explanation: 'The global external Application Load Balancer provides a single global anycast IP, edge TLS termination, and HTTP(S) content-based (URL map) routing. Passthrough and internal options do not meet the global L7 requirement.',
    references: [REF_LB_CHOOSE, REF_HTTPS_LB]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'During prototyping, the team must validate that a planned firewall design will allow a path from a frontend subnet to a backend subnet before any VMs exist. Which tool supports this analysis?',
    options: opts4(
      'VPC Flow Logs',
      'Connectivity Tests in Network Intelligence Center',
      'Cloud Trace',
      'Firewall Rules Logging'
    ),
    correct: ['b'],
    explanation: 'Connectivity Tests statically analyze the configuration (routes, firewall rules, forwarding) to predict reachability and can run without live traffic. Flow logs and firewall logging only record actual traffic that already happened.',
    references: [REF_CONN_TESTS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company needs to plan IP address space for 12 regional subnets that must not overlap with its on-premises 10.0.0.0/8 network. What is the best planning practice?',
    options: opts4(
      'Use auto mode VPC so Google assigns ranges automatically',
      'Use a custom mode VPC with non-overlapping RFC 1918 ranges documented in an IP plan',
      'Use the same ranges as on-premises and rely on NAT',
      'Use public IP ranges for all subnets'
    ),
    correct: ['b'],
    explanation: 'Custom mode VPC with a documented IP address plan avoids overlap with on-premises and supports future hybrid connectivity. Reusing on-premises ranges breaks routing over Interconnect/VPN.',
    references: [REF_SUBNETS, REF_VPC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to choose Dedicated Interconnect over Partner Interconnect in a network design.',
    options: opts4(
      'You need 10 Gbps or higher dedicated capacity and have a presence in a colocation facility',
      'You require a physical connection directly to Google with no service provider in the path',
      'You only need 50 Mbps to 50 Gbps and cannot reach a colocation facility',
      'You want predictable high-throughput capacity for large data transfer'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Dedicated Interconnect needs a colocation presence and provides 10/100 Gbps direct links with high predictable throughput. Small-bandwidth needs without colocation presence point to Partner Interconnect instead.',
    references: [REF_DEDICATED, REF_PARTNER]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect must decide network connectivity for a low-traffic dev environment that needs encrypted connectivity to on-premises within an hour and at minimal cost. Which option fits best?',
    options: opts4(
      'Dedicated Interconnect',
      'HA VPN over the internet',
      'Cross-Cloud Interconnect',
      'Direct Peering'
    ),
    correct: ['b'],
    explanation: 'HA VPN provides encrypted IPsec connectivity that can be provisioned quickly at low cost, suitable for low-traffic dev. Interconnect requires weeks of provisioning and colocation.',
    references: [REF_HA_VPN, REF_VPN]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-tier application needs the database tier reachable only from the application tier and never from the internet. Which network design element enforces this?',
    options: opts4(
      'Assign external IPs only to the app tier',
      'Place tiers in separate subnets and use firewall rules keyed on service account or network tags',
      'Use a single subnet and rely on OS-level firewalls',
      'Use Cloud NAT for the database tier'
    ),
    correct: ['b'],
    explanation: 'Segmenting tiers into subnets and writing firewall rules scoped by service accounts or tags enforces least-privilege east-west access. OS firewalls alone are not a VPC-level control and NAT is irrelevant to ingress restriction.',
    references: [REF_FIREWALL, REF_SUBNETS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'During design review, the team needs the same internal DNS names resolvable from two peered VPCs without duplicating zones. Which capability should the design use?',
    options: opts4(
      'A public Cloud DNS zone',
      'Cloud DNS private zone with cross-project binding / DNS peering',
      'Host file entries on every VM',
      'A DNS forwarding policy to 8.8.8.8'
    ),
    correct: ['b'],
    explanation: 'Cloud DNS private zones can be shared across VPCs (via binding or DNS peering) so records resolve consistently without duplication. Public zones and host files do not meet private cross-VPC resolution cleanly.',
    references: [REF_DNS_PRIVATE, REF_DNS_PEERING]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated workload must keep all traffic to Cloud Storage on Google\'s backbone and block exfiltration to buckets outside the organization. Which two-part design is most appropriate?',
    options: opts4(
      'Cloud NAT plus public bucket ACLs',
      'Private Google Access plus VPC Service Controls perimeter',
      'External Application Load Balancer plus Cloud Armor',
      'Partner Interconnect plus Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'Private Google Access keeps API traffic off the public internet while a VPC Service Controls perimeter prevents data egress to resources outside the perimeter. Cloud Armor/CDN protect inbound web traffic, not storage exfiltration.',
    references: [REF_PGA, REF_PERIMETER]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A design must allow producer-published services in a service-provider VPC to be consumed privately by many consumer VPCs without IP overlap concerns or peering. Which feature is the right choice?',
    options: opts4(
      'VPC Network Peering',
      'Private Service Connect',
      'Cloud VPN',
      'Shared VPC'
    ),
    correct: ['b'],
    explanation: 'Private Service Connect exposes a producer service through a consumer-side endpoint IP, avoiding peering and IP overlap concerns and scaling to many consumers. Peering would require non-overlapping ranges and is non-transitive.',
    references: [REF_PSC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'For a latency-sensitive global service, the team wants cost-optimized regional egress while still using Google\'s premium backbone for the primary user-facing endpoint. Which Network Service Tiers approach fits?',
    options: opts4(
      'Use Standard Tier for everything to save cost',
      'Use Premium Tier for the global user-facing load balancer and Standard Tier for non-critical regional egress',
      'Use Premium Tier only for internal traffic',
      'Network Service Tiers do not affect this decision'
    ),
    correct: ['b'],
    explanation: 'Premium Tier uses Google\'s global backbone for the lowest-latency user-facing path while Standard Tier reduces cost for regional, non-critical egress — a common mixed-tier design.',
    references: [REF_NET_TIERS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A new VPC design needs jumbo frames between VMs for a high-throughput analytics cluster. Which planning decision is required?',
    options: opts4(
      'Set the VPC network MTU to 8896 before creating instances and configure guest OS MTU to match',
      'Enable Cloud CDN on the subnet',
      'Use external IPs to raise MTU automatically',
      'MTU cannot be changed on Google Cloud VPCs'
    ),
    correct: ['a'],
    explanation: 'VPC network MTU is configurable (up to 8896) and must be planned at network creation with matching guest OS MTU; it cannot be transparently auto-negotiated per VM.',
    references: [REF_MTU]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'During prototyping the team wants to test a routing change in isolation before applying it to production traffic. Which approach best supports a safe prototype?',
    options: opts4(
      'Edit the production default route directly during business hours',
      'Build a separate prototype VPC/subnet, validate with Connectivity Tests, then promote the change',
      'Disable all firewall rules to test routing',
      'Delete and recreate the production VPC'
    ),
    correct: ['b'],
    explanation: 'A separate prototype environment validated with Connectivity Tests isolates risk before promoting changes — the recommended prototyping practice. Editing or deleting production directly is unsafe.',
    references: [REF_CONN_TESTS, REF_ROUTES]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'VPC Network Peering is transitive, so if VPC-A peers with VPC-B and VPC-B peers with VPC-C, then VPC-A can reach VPC-C automatically.',
    options: opts4('True', 'False', 'Only with custom routes exported', 'Only in the same region'),
    correct: ['b'],
    explanation: 'VPC Network Peering is non-transitive. VPC-A cannot reach VPC-C through VPC-B; each pair must peer directly or use Network Connectivity Center for transitive connectivity.',
    references: [REF_PEERING]
  },

  // ── Implementing Virtual Private Cloud Instances (14) ──
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which gcloud command creates a custom mode VPC network named "prod-vpc"?',
    options: opts4(
      'gcloud compute networks create prod-vpc --subnet-mode=custom',
      'gcloud compute networks create prod-vpc --auto-create-subnetworks',
      'gcloud compute vpc create prod-vpc --custom',
      'gcloud networks create prod-vpc --mode custom'
    ),
    correct: ['a'],
    explanation: '`gcloud compute networks create prod-vpc --subnet-mode=custom` creates a custom mode VPC. The other forms use invalid subcommands or would create an auto mode network.',
    references: [REF_VPC]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'A subnet 10.10.0.0/24 is nearly full. You must add capacity without recreating VMs or the subnet. What is the supported action?',
    options: opts4(
      'Delete and recreate the subnet with a larger range',
      'Expand the subnet primary range to a larger non-overlapping CIDR (e.g., /23)',
      'Add a second VPC and migrate VMs',
      'Subnet primary ranges cannot be changed'
    ),
    correct: ['b'],
    explanation: 'A subnet\'s primary IPv4 range can be expanded in place to a larger prefix without recreating it or VMs, as long as it does not overlap other ranges. Shrinking is not supported.',
    references: [REF_SUBNETS]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A GKE cluster needs separate IP ranges for Pods and Services in the same subnet. Which VPC feature provides this?',
    options: opts4(
      'Multiple network interfaces',
      'Secondary (alias) IP ranges on the subnet',
      'Additional VPCs per range',
      'Cloud NAT pooled addresses'
    ),
    correct: ['b'],
    explanation: 'Secondary ranges on a subnet provide alias IP ranges used by VPC-native GKE for Pods and Services. Multiple NICs and extra VPCs are unrelated to this requirement.',
    references: [REF_ALIAS, REF_SUBNETS]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'You must allow inbound TCP 443 from the internet to web VMs tagged "web" but deny all other inbound traffic. Which firewall configuration is correct?',
    options: opts4(
      'A single egress allow rule for TCP 443',
      'An ingress allow rule (priority high) for tcp:443 with target tag "web" and source 0.0.0.0/0, relying on the implied deny ingress',
      'An ingress deny rule for all ports only',
      'Disable the implied deny rule'
    ),
    correct: ['b'],
    explanation: 'VPC networks have an implied deny-all ingress; you add a higher-priority ingress allow for tcp:443 scoped to target tag "web" from 0.0.0.0/0. The implied deny then blocks everything else without an explicit deny rule.',
    references: [REF_FIREWALL]
  },
  {
    domain: VPC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about VPC firewall rule evaluation.',
    options: opts4(
      'Rules are evaluated by priority, with lower numbers evaluated first',
      'There is an implied allow egress and implied deny ingress rule',
      'A deny rule always overrides any allow rule regardless of priority',
      'Target tags or service accounts scope which instances a rule applies to'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Lower priority numbers win and the first match applies; implied rules are allow-egress and deny-ingress; rules are scoped by tags or service accounts. A deny does not unconditionally override — the highest-priority matching rule wins.',
    references: [REF_FIREWALL]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'A VM with no external IP must download OS package updates from the internet. Which VPC service enables this egress?',
    options: opts4(
      'Private Google Access',
      'Cloud NAT attached to a Cloud Router in the VM\'s region',
      'VPC Network Peering',
      'A static external route'
    ),
    correct: ['b'],
    explanation: 'Cloud NAT (with a Cloud Router in the region) provides outbound internet connectivity for instances without external IPs. Private Google Access only reaches Google APIs, not arbitrary internet hosts.',
    references: [REF_NAT, REF_ROUTER]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'You created a custom static route 0.0.0.0/0 with next hop an internal load balancer for inspection, but VMs still reach the internet directly. What is the most likely cause?',
    options: opts4(
      'Static routes are not supported',
      'The default 0.0.0.0/0 route to the internet gateway has equal or higher priority and is still being used',
      'Cloud NAT overrides all routes',
      'Firewall rules block the route'
    ),
    correct: ['b'],
    explanation: 'Routes are chosen by longest prefix then priority. If the default internet route has equal/better priority, traffic still uses it; the custom route must have a better (lower-number) priority or the default route must be removed.',
    references: [REF_ROUTES]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'A VM needs interfaces in two different VPCs (e.g., a management network and a data network). What must be true when you create it?',
    options: opts4(
      'Add NICs after creation at any time',
      'Define all network interfaces at instance creation time; they cannot be added or removed later',
      'Use alias IPs instead of multiple NICs',
      'Multiple NICs require Shared VPC'
    ),
    correct: ['b'],
    explanation: 'Multiple network interfaces must be specified when the instance is created and cannot be added or removed afterward; each NIC connects to a different VPC.',
    references: [REF_MULTI_NIC]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Shared VPC, a service project admin cannot create a VM in a subnet. What is the most likely missing permission?',
    options: opts4(
      'The service project must own the subnet',
      'The user needs the Compute Network User role on the specific subnet (or host project)',
      'Shared VPC requires the same billing account',
      'The subnet must be auto mode'
    ),
    correct: ['b'],
    explanation: 'Service project users need roles/compute.networkUser on the shared subnet (or host project) to deploy resources into it. Ownership stays with the host project by design.',
    references: [REF_SHARED_VPC, REF_IAM]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about VPC Network Peering route exchange is correct?',
    options: opts4(
      'Subnet routes are exchanged automatically by default once peering is active',
      'No routes are exchanged unless static routes are created',
      'Peering exchanges internet routes by default',
      'Peering requires BGP configuration'
    ),
    correct: ['a'],
    explanation: 'Active VPC Network Peering automatically exchanges subnet routes between the two networks; custom/static route exchange is optional and configurable. No BGP is involved.',
    references: [REF_PEERING]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a managed service (Cloud SQL) to be reachable over private IP from your VPC. Which configuration is required?',
    options: opts4(
      'Cloud NAT for the database',
      'Configure private services access by allocating an IP range and creating a private connection (VPC peering to the service producer)',
      'A public IP with authorized networks only',
      'Private Google Access on the subnet'
    ),
    correct: ['b'],
    explanation: 'Private services access reserves an internal range and establishes a private connection (a managed peering) to the Google-managed producer network so the service is reachable via private IP.',
    references: [REF_PSA]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'A firewall policy must apply consistently across many VPCs in a folder without duplicating rules per network. Which construct supports this?',
    options: opts4(
      'Per-VPC firewall rules copied to each network',
      'Hierarchical firewall policies attached at the organization or folder level',
      'OS-level iptables on each VM',
      'Routes with deny next hop'
    ),
    correct: ['b'],
    explanation: 'Hierarchical firewall policies attach at organization/folder scope and are inherited by all VPCs beneath, avoiding per-network rule duplication.',
    references: [REF_FW_POLICY]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'An instance must use IPv6 for an external dual-stack service. What is required on the subnet?',
    options: opts4(
      'IPv6 is enabled automatically on all subnets',
      'Configure the subnet stack type to dual-stack with an external (or internal) IPv6 access type, then create the VM with an IPv6 NIC',
      'Use alias ranges for IPv6',
      'IPv6 requires a separate VPC'
    ),
    correct: ['b'],
    explanation: 'IPv6 requires the subnet to be configured as dual-stack with an IPv6 access type; the instance NIC is then assigned an IPv6 range. It is not enabled by default.',
    references: [REF_IPV6]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'A VPC network in Google Cloud is a global resource, while its subnets are regional resources.',
    options: opts4('True', 'False', 'Both are zonal', 'Both are regional'),
    correct: ['a'],
    explanation: 'A VPC network is a global resource that spans all regions; subnets are regional resources, each tied to one region and spanning its zones.',
    references: [REF_VPC, REF_SUBNETS]
  },

  // ── Configuring Network Services (15) ──
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to load balance internal TCP traffic across backend VMs in one region with client source IP preserved. Which load balancer should you configure?',
    options: opts4(
      'Global external Application Load Balancer',
      'Internal passthrough Network Load Balancer',
      'External proxy Network Load Balancer',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'The internal passthrough Network Load Balancer distributes regional internal TCP/UDP traffic while preserving the client source IP (no proxy). Application/proxy LBs terminate or rewrite connections.',
    references: [REF_ILB, REF_LB_CHOOSE]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'An external Application Load Balancer returns 502 for one backend group while others are healthy. Health checks fail only for that group. What should you check first?',
    options: opts4(
      'Delete the URL map',
      'Whether firewall rules allow the health check probe ranges (35.191.0.0/16 and 130.211.0.0/22) to the backends',
      'Switch to a passthrough load balancer',
      'Disable the backend service'
    ),
    correct: ['b'],
    explanation: 'Health check probes originate from Google ranges 35.191.0.0/16 and 130.211.0.0/22; a missing ingress allow rule for those ranges causes health check failures and 502s for that group.',
    references: [REF_HEALTHCHECK, REF_FIREWALL]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to cache static content at Google\'s edge for an external Application Load Balancer. Which configuration enables this?',
    options: opts4(
      'Enable Cloud CDN on the backend service',
      'Attach Cloud Armor to the backend',
      'Enable Private Google Access',
      'Switch to a Network Load Balancer'
    ),
    correct: ['a'],
    explanation: 'Cloud CDN is enabled per backend service of an external Application Load Balancer to cache cacheable content at Google\'s edge points of presence.',
    references: [REF_CDN]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Google Cloud Armor security policies.',
    options: opts4(
      'They attach to backend services of external Application Load Balancers',
      'They support IP allow/deny lists and preconfigured WAF rules (e.g., OWASP)',
      'They can rate-limit requests with throttle/ban actions',
      'They terminate TLS for internal passthrough load balancers'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Cloud Armor attaches to external Application Load Balancer backend services and supports IP lists, preconfigured WAF rules, and rate limiting. It does not operate on internal passthrough (L4) load balancers.',
    references: [REF_ARMOR]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'You must create an internal DNS zone resolvable only inside a specific VPC for "corp.internal". Which Cloud DNS configuration is correct?',
    options: opts4(
      'A public managed zone for corp.internal',
      'A private managed zone for corp.internal with the target VPC network listed',
      'A DNS forwarding policy to public resolvers',
      'Reverse lookup zone only'
    ),
    correct: ['b'],
    explanation: 'A Cloud DNS private managed zone scoped to the VPC(s) you list resolves records only for clients in those networks. Public zones are internet-resolvable.',
    references: [REF_DNS_PRIVATE]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'On-premises clients must resolve Cloud DNS private zone records over a VPN. Which Cloud DNS feature enables on-premises-to-Google resolution?',
    options: opts4(
      'A public zone',
      'An inbound server policy (DNS server policy with inbound forwarding) exposing an internal forwarding entry point',
      'Cloud NAT',
      'DNSSEC only'
    ),
    correct: ['b'],
    explanation: 'An inbound DNS server policy creates internal forwarding IP addresses that on-premises resolvers can query to resolve Google private zones across hybrid connectivity.',
    references: [REF_DNS_POLICY]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'A global external Application Load Balancer must route /api/* to one backend and everything else to another. Which component expresses this?',
    options: opts4(
      'A firewall rule',
      'A URL map with path matchers and path rules',
      'A health check',
      'A Cloud NAT mapping'
    ),
    correct: ['b'],
    explanation: 'The URL map\'s path matchers/path rules perform content-based routing (e.g., /api/* to a specific backend service). Firewall rules and health checks do not route by path.',
    references: [REF_HTTPS_LB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'You need session affinity so requests from the same client reach the same backend instance on an internal passthrough Network Load Balancer. Which setting controls this?',
    options: opts4(
      'URL map host rules',
      'The backend service session affinity (e.g., CLIENT_IP) setting',
      'Cloud CDN cache mode',
      'Health check interval'
    ),
    correct: ['b'],
    explanation: 'Session affinity is configured on the backend service (e.g., CLIENT_IP or CLIENT_IP_PROTO) to direct a client consistently to the same backend. URL maps do not exist for passthrough LBs.',
    references: [REF_BACKEND, REF_ILB]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which load balancer should you use to expose a single regional internal HTTP service to clients within the VPC with path-based routing?',
    options: opts4(
      'Internal Application Load Balancer',
      'External proxy Network Load Balancer',
      'Global external Application Load Balancer',
      'Internal passthrough Network Load Balancer'
    ),
    correct: ['a'],
    explanation: 'The internal Application Load Balancer provides regional internal L7 (HTTP) load balancing with URL-map path routing for clients inside the VPC. The internal passthrough LB is L4 only.',
    references: [REF_LB_CHOOSE, REF_ILB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'A backend service shows 50% of traffic going to one of two equally weighted regional backends and the rest dropped. Which configuration most likely causes uneven/dropped distribution?',
    options: opts4(
      'Health check is failing on one backend so it is removed from rotation',
      'URL map misconfiguration',
      'Cloud CDN is enabled',
      'Session affinity disabled'
    ),
    correct: ['a'],
    explanation: 'If one backend\'s health check fails it is removed from the load-balancing pool, sending all traffic to the healthy backend and dropping connections to the unhealthy one until it recovers.',
    references: [REF_HEALTHCHECK, REF_BACKEND]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'You must serve the same global service on a single anycast IPv4 and IPv6 address with TLS. Which front-end configuration is required on the external Application Load Balancer?',
    options: opts4(
      'Two regional forwarding rules',
      'Global forwarding rules with a target HTTPS proxy and SSL certificates (for IPv4 and IPv6)',
      'Internal forwarding rule only',
      'A Cloud NAT gateway'
    ),
    correct: ['b'],
    explanation: 'Global forwarding rules (IPv4 and IPv6) point at a target HTTPS proxy referencing SSL certificates and a URL map, providing global anycast TLS termination.',
    references: [REF_HTTPS_LB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'A Cloud DNS public zone must be protected against DNS spoofing/cache poisoning of its records. Which feature should you enable?',
    options: opts4(
      'DNS forwarding',
      'DNSSEC on the managed zone',
      'A private zone',
      'Cloud Armor'
    ),
    correct: ['b'],
    explanation: 'Enabling DNSSEC on the public managed zone signs records so resolvers can validate authenticity, mitigating spoofing and cache poisoning.',
    references: [REF_DNS]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a regional external service that load balances raw TCP with very high performance and source IP preservation (no proxying). Which option is correct?',
    options: opts4(
      'External proxy Network Load Balancer',
      'External passthrough Network Load Balancer',
      'External Application Load Balancer',
      'Internal Application Load Balancer'
    ),
    correct: ['b'],
    explanation: 'The external passthrough Network Load Balancer forwards packets without proxying, preserving client source IP at high performance for regional TCP/UDP traffic.',
    references: [REF_NLB, REF_LB_CHOOSE]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to gradually shift 5% of production traffic to a new backend version behind an external Application Load Balancer. Which capability supports this?',
    options: opts4(
      'Cloud NAT port allocation',
      'URL map weighted traffic splitting across backend services (route actions)',
      'Firewall priority tuning',
      'Health check thresholds'
    ),
    correct: ['b'],
    explanation: 'The URL map supports weighted backend service splitting (route actions) to send a percentage of traffic to a new version for canary/blue-green rollouts.',
    references: [REF_HTTPS_LB, REF_BACKEND]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'Cloud CDN can be used with an internal passthrough Network Load Balancer to cache content for internal clients.',
    options: opts4('True', 'False', 'Only with Premium Tier', 'Only for static buckets'),
    correct: ['b'],
    explanation: 'Cloud CDN is only available with the external Application Load Balancer (and certain external proxy configurations). It cannot be attached to an internal passthrough Network Load Balancer.',
    references: [REF_CDN, REF_LB_CHOOSE]
  },

  // ── Implementing Hybrid Interconnectivity (9) ──
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component must you configure to exchange routes dynamically between Google Cloud and your on-premises router over an Interconnect or HA VPN?',
    options: opts4(
      'A static route only',
      'Cloud Router with a BGP session',
      'Cloud NAT',
      'A firewall policy'
    ),
    correct: ['b'],
    explanation: 'Cloud Router runs BGP to dynamically exchange routes between your VPC and on-premises over Cloud Interconnect or HA VPN; static routes alone do not adapt to topology changes.',
    references: [REF_ROUTER, REF_BGP]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a 99.99% SLA for HA VPN to a single on-premises peer. What topology is required?',
    options: opts4(
      'One HA VPN gateway interface and one tunnel',
      'An HA VPN gateway with two interfaces, two tunnels, and two on-premises peer devices (or two peer IPs) with BGP',
      'Classic VPN with one tunnel',
      'A single Dedicated Interconnect link'
    ),
    correct: ['b'],
    explanation: 'The 99.99% HA VPN SLA requires two gateway interfaces with two tunnels to two peer devices/IP addresses and dynamic (BGP) routing for redundancy.',
    references: [REF_HA_VPN]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements comparing Dedicated and Partner Interconnect.',
    options: opts4(
      'Dedicated Interconnect requires you to have equipment in a Google colocation facility',
      'Partner Interconnect uses a supported service provider to reach Google',
      'Both can use Cloud Router with BGP for dynamic routing',
      'Partner Interconnect always provides higher bandwidth than Dedicated'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dedicated needs colocation presence; Partner uses a service provider; both use Cloud Router/BGP. Partner does not exceed Dedicated bandwidth — Dedicated offers 10/100 Gbps links.',
    references: [REF_DEDICATED, REF_PARTNER]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'After establishing an Interconnect attachment, on-premises cannot reach a VPC subnet though the BGP session is up. Which is the most likely cause?',
    options: opts4(
      'The Cloud Router is not advertising that subnet (custom advertised routes not configured)',
      'Cloud NAT is disabled',
      'The subnet is global',
      'DNS is misconfigured'
    ),
    correct: ['a'],
    explanation: 'If the Cloud Router advertisement mode/custom ranges do not include the subnet, on-premises never learns the route despite an established BGP session. Adjust advertised routes.',
    references: [REF_ROUTER, REF_BGP]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You need redundant Dedicated Interconnect for a production SLA. What is the recommended minimum configuration?',
    options: opts4(
      'A single 10 Gbps link in one metro',
      'Interconnect connections in two different edge availability domains (and metros for the highest SLA) with redundant attachments',
      'Two attachments on the same physical link',
      'Partner Interconnect only'
    ),
    correct: ['b'],
    explanation: 'Production-grade Dedicated Interconnect uses connections across separate edge availability domains (and separate metros for 99.99%) so a single failure does not sever connectivity.',
    references: [REF_DEDICATED, REF_INTERCONNECT]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'A company already on AWS wants a private high-bandwidth link between its AWS VPC and Google Cloud without traversing the public internet. Which product fits?',
    options: opts4(
      'HA VPN over the internet',
      'Cross-Cloud Interconnect',
      'VPC Network Peering',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Cross-Cloud Interconnect provides a dedicated physical connection between Google Cloud and another cloud provider for private, high-bandwidth connectivity.',
    references: [REF_CROSS_CLOUD]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'On-premises learns Google routes but Google does not learn on-premises routes over BGP. Which Cloud Router setting most likely needs attention?',
    options: opts4(
      'Advertised routes on the Cloud Router',
      'The on-premises router\'s BGP advertisements / accepted received routes and peer ASN configuration',
      'Cloud NAT mappings',
      'The VPC MTU'
    ),
    correct: ['b'],
    explanation: 'Cloud Router learns whatever the BGP peer advertises. If on-premises is not advertising its prefixes (or ASN/session config is wrong), Google will not receive them even though Google\'s own advertisements work.',
    references: [REF_BGP, REF_ROUTER]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'Which connectivity option provides an encrypted tunnel over the public internet rather than a private physical circuit?',
    options: opts4(
      'Dedicated Interconnect',
      'HA VPN (Cloud VPN)',
      'Partner Interconnect',
      'Cross-Cloud Interconnect'
    ),
    correct: ['b'],
    explanation: 'Cloud VPN (HA VPN) creates encrypted IPsec tunnels over the public internet. The Interconnect products provide private physical/managed circuits, not encrypted internet tunnels.',
    references: [REF_VPN, REF_HA_VPN]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You must connect multiple on-premises sites and several VPCs through a central hub with transitive routing over hybrid links. Which Google product is designed for this?',
    options: opts4(
      'A peering mesh',
      'Network Connectivity Center with hybrid (VPN/Interconnect) and VPC spokes',
      'Cloud NAT',
      'Multiple independent Cloud Routers with no hub'
    ),
    correct: ['b'],
    explanation: 'Network Connectivity Center acts as a hub connecting hybrid spokes (HA VPN, Interconnect) and VPC spokes with transitive route exchange — purpose-built for multi-site hub topologies.',
    references: [REF_NCC, REF_INTERCONNECT]
  },

  // ── Managing, Monitoring, and Optimizing Network Operations (10) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must capture sampled metadata about traffic between subnets for security forensics and capacity planning. Which feature should you enable?',
    options: opts4(
      'Firewall Rules Logging',
      'VPC Flow Logs on the subnet',
      'Cloud Trace',
      'Packet Mirroring only'
    ),
    correct: ['b'],
    explanation: 'VPC Flow Logs record sampled metadata about VM-to-VM and external traffic per subnet, useful for forensics, monitoring, and capacity planning. Firewall logging only logs rule hits.',
    references: [REF_FLOWLOGS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'You must mirror full packet payloads from selected instances to an IDS appliance for deep inspection. Which feature is appropriate?',
    options: opts4(
      'VPC Flow Logs',
      'Packet Mirroring',
      'Firewall Rules Logging',
      'Cloud Monitoring uptime checks'
    ),
    correct: ['b'],
    explanation: 'Packet Mirroring copies full packets (headers and payloads) from mirrored sources to a collector for IDS/forensic inspection. Flow logs are sampled metadata only.',
    references: [REF_PACKET_MIRROR]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to verify whether a firewall rule is being matched and whether traffic was allowed or denied between two VMs. Which log should you inspect?',
    options: opts4(
      'VPC Flow Logs',
      'Firewall Rules Logging',
      'Cloud Audit Logs',
      'Cloud CDN logs'
    ),
    correct: ['b'],
    explanation: 'Firewall Rules Logging records connections matched by a rule (with logging enabled) including allow/deny disposition, which is exactly what is needed to confirm rule hits.',
    references: [REF_FW_LOGS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Network Intelligence Center.',
    options: opts4(
      'Connectivity Tests can diagnose reachability based on configuration',
      'Network Topology visualizes traffic and infrastructure',
      'Performance Dashboard shows packet loss and latency between zones',
      'It replaces the need for any firewall rules'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Network Intelligence Center includes Connectivity Tests, Network Topology, and Performance Dashboard for diagnostics and visibility. It is observability tooling and does not replace firewall configuration.',
    references: [REF_NIC, REF_CONN_TESTS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A Cloud NAT gateway is dropping connections under load with allocation errors. Which optimization should you apply first?',
    options: opts4(
      'Disable Cloud NAT logging',
      'Increase the minimum ports per VM or enable dynamic port allocation, and add more NAT IP addresses',
      'Switch all VMs to external IPs',
      'Reduce the subnet size'
    ),
    correct: ['b'],
    explanation: 'NAT port exhaustion is resolved by raising ports-per-VM or enabling dynamic port allocation and adding NAT IPs to expand the available port pool.',
    references: [REF_NAT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'You are approaching a per-project quota for in-use external IP addresses and need to scale. What is the correct operational response?',
    options: opts4(
      'Ignore it; quotas are advisory',
      'Request a quota increase and/or reduce external IP usage (e.g., use Cloud NAT, internal LBs)',
      'Create a new organization',
      'Disable billing'
    ),
    correct: ['b'],
    explanation: 'Network resources have quotas/limits; the operational fix is to request an increase and/or reduce consumption (Cloud NAT instead of external IPs, internal load balancing) to stay within limits.',
    references: [REF_QUOTAS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool gives latency and request metrics for an external Application Load Balancer to troubleshoot user-facing slowness?',
    options: opts4(
      'VPC Flow Logs only',
      'Cloud Monitoring metrics plus load balancer logging',
      'Packet Mirroring',
      'Cloud DNS query logs'
    ),
    correct: ['b'],
    explanation: 'Load balancer monitoring/logging surfaced through Cloud Monitoring (latency, request count, backend latency, response codes) is the primary way to troubleshoot LB performance.',
    references: [REF_LB_LOGS, REF_MONITORING]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Connectivity between two VMs intermittently fails. Connectivity Tests show "reachable" by configuration. What is the best next operational step?',
    options: opts4(
      'Conclude the network is fine and stop',
      'Enable VPC Flow Logs and inspect actual traffic, latency, and drops for the affected flows',
      'Delete the VPC',
      'Disable firewall logging'
    ),
    correct: ['b'],
    explanation: 'Connectivity Tests validate configuration but not live behavior; enabling VPC Flow Logs lets you observe the real flows, drops, and latency to find the intermittent fault.',
    references: [REF_FLOWLOGS, REF_CONN_TESTS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'To reduce inter-region egress cost while keeping global low latency for users, which network optimization should you evaluate?',
    options: opts4(
      'Move everything to Standard Tier regardless of latency',
      'Right-size Network Service Tiers (Premium for user-facing latency, Standard for non-critical egress) and use Cloud CDN to offload origin traffic',
      'Disable load balancing',
      'Use only external IPs'
    ),
    correct: ['b'],
    explanation: 'Cost optimization combines appropriate Network Service Tier selection with Cloud CDN offload to reduce egress and origin load while preserving user-facing latency.',
    references: [REF_NET_TIERS, REF_CDN]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'VPC Flow Logs capture the full packet payload of every connection in the subnet.',
    options: opts4('True', 'False', 'Only for TCP', 'Only when Packet Mirroring is off'),
    correct: ['b'],
    explanation: 'VPC Flow Logs capture sampled connection metadata (5-tuple, bytes, packets, timing), not full payloads. Full payload capture requires Packet Mirroring.',
    references: [REF_FLOWLOGS, REF_PACKET_MIRROR]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Designing, Planning, and Prototyping a Google Cloud Network (17) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A startup wants the simplest network where one subnet per region is created automatically and is acceptable for non-production experimentation. Which VPC mode should the prototype use?',
    options: opts4(
      'Custom mode with manual subnets',
      'Auto mode VPC',
      'Legacy network',
      'No VPC (default only)'
    ),
    correct: ['b'],
    explanation: 'Auto mode VPC automatically creates one subnet per region, which is acceptable for quick non-production prototyping. Custom mode is recommended for production where range control matters.',
    references: [REF_VPC, REF_SUBNETS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'An enterprise wants separate environments (prod, staging, dev) with strong isolation but shared central egress inspection. Which design pattern is most appropriate?',
    options: opts4(
      'One flat VPC for everything',
      'Separate VPCs per environment connected to a hub (NCC) with a centralized egress/inspection VPC',
      'Auto mode VPC with no segmentation',
      'Public IPs for all instances'
    ),
    correct: ['b'],
    explanation: 'Per-environment VPCs joined via a Network Connectivity Center hub with a centralized inspection/egress VPC provides isolation plus shared security inspection — a standard enterprise landing-zone pattern.',
    references: [REF_NCC, REF_VPC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to choose Shared VPC over standalone VPCs in a design.',
    options: opts4(
      'Centralized control of subnets, routes, and firewall by a network team',
      'Service projects can deploy resources while not owning the network',
      'It provides transitive routing across all peered networks automatically',
      'Consistent IP address management across many projects'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Shared VPC centralizes network control, lets service projects deploy without owning the network, and supports consistent IP management. Transitivity across arbitrary peerings is not a Shared VPC property.',
    references: [REF_SHARED_VPC]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A design requires a single global IP for an HTTP service with automatic failover across regions. Which load balancer type should be specified?',
    options: opts4(
      'Regional internal passthrough Network Load Balancer',
      'Global external Application Load Balancer',
      'Regional external passthrough Network Load Balancer',
      'Classic VPN'
    ),
    correct: ['b'],
    explanation: 'The global external Application Load Balancer offers a single global anycast IP and automatically directs users to the nearest healthy regional backend, failing over across regions.',
    references: [REF_HTTPS_LB, REF_LB_CHOOSE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'During design, you must ensure the database service published by a partner can be consumed by 30 customer VPCs without exposing internal IP ranges or building 30 peerings. Which approach is best?',
    options: opts4(
      'Public IP with firewall allowlists',
      'Private Service Connect published service with per-consumer endpoints',
      'A peering mesh',
      'Shared VPC for all 30 customers'
    ),
    correct: ['b'],
    explanation: 'Private Service Connect lets a producer publish a service consumed via consumer-side endpoints, scaling to many consumers without peering or IP overlap concerns.',
    references: [REF_PSC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must validate, before launch, that a planned route and firewall change will not break access from a load balancer to backends. Which capability validates this without sending real traffic?',
    options: opts4(
      'Cloud Logging',
      'Connectivity Tests',
      'Cloud Profiler',
      'Cloud Trace'
    ),
    correct: ['b'],
    explanation: 'Connectivity Tests evaluate the effective configuration (routes, firewall, forwarding rules) to predict reachability before changes go live, supporting safe prototyping.',
    references: [REF_CONN_TESTS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A planning team must avoid IP overlap between Google Cloud and three on-premises data centers. What is the recommended first step?',
    options: opts4(
      'Pick random ranges and fix conflicts later',
      'Create and maintain an organization-wide IP address management (IPAM) plan with non-overlapping CIDRs',
      'Use auto mode VPC everywhere',
      'Use the same /16 in every site'
    ),
    correct: ['b'],
    explanation: 'A documented IPAM plan with non-overlapping CIDR allocations across cloud and on-premises is the recommended foundation for hybrid network design.',
    references: [REF_SUBNETS, REF_VPC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about choosing HA VPN vs Cloud Interconnect in a design.',
    options: opts4(
      'HA VPN is encrypted over the internet and faster to provision',
      'Dedicated Interconnect offers higher, more predictable bandwidth and lower latency to Google',
      'HA VPN with proper topology can reach a 99.99% SLA',
      'Cloud Interconnect traffic is encrypted by default by Google'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'HA VPN is quick and encrypted over the internet and can reach 99.99% with the right topology; Dedicated Interconnect gives higher predictable bandwidth. Interconnect is not encrypted by default — add MACsec or app-layer encryption if required.',
    references: [REF_HA_VPN, REF_DEDICATED]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A design needs DNS names from on-premises and Google Cloud to resolve from both sides. Which two-part design supports bidirectional resolution?',
    options: opts4(
      'Public zones only',
      'Cloud DNS inbound server policy (for on-prem to resolve Google) plus outbound forwarding/forwarding zones (for Google to resolve on-prem)',
      'Host files everywhere',
      'Cloud NAT plus DNSSEC'
    ),
    correct: ['b'],
    explanation: 'Bidirectional hybrid DNS uses an inbound server policy so on-premises can query Google, and forwarding zones/outbound forwarding so Google can resolve on-premises names.',
    references: [REF_DNS_POLICY, REF_DNS_PRIVATE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated workload must not allow data egress to Google services outside the defined organization boundary. Which design control enforces this at the API boundary?',
    options: opts4(
      'Firewall rules only',
      'A VPC Service Controls service perimeter around the projects and restricted services',
      'Cloud Armor policy',
      'A custom static route'
    ),
    correct: ['b'],
    explanation: 'VPC Service Controls create a service perimeter that prevents data movement to Google-managed services/projects outside the perimeter, mitigating exfiltration at the API layer.',
    references: [REF_PERIMETER]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'For lowest user-facing latency on a global website while controlling cost on bulk backups uploaded from VMs, which tiering design is appropriate?',
    options: opts4(
      'Standard Tier for the website, Premium for backups',
      'Premium Tier for the global website, Standard Tier for bulk backup egress',
      'Premium Tier for everything',
      'Standard Tier for everything'
    ),
    correct: ['b'],
    explanation: 'Premium Tier optimizes user-facing latency over Google\'s backbone; Standard Tier reduces cost for non-latency-sensitive bulk egress like backups.',
    references: [REF_NET_TIERS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must give a network team org-wide control to enforce a baseline allow/deny security posture across all current and future VPCs. Which construct should be planned?',
    options: opts4(
      'Per-VPC firewall rules maintained manually',
      'Hierarchical firewall policies at the organization/folder level',
      'OS firewalls on every VM',
      'Routes with deny next hop'
    ),
    correct: ['b'],
    explanation: 'Hierarchical firewall policies enforce an inherited baseline across all VPCs in the org/folder, including future ones, without per-network duplication.',
    references: [REF_FW_POLICY]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A prototype must reach Google APIs privately from VMs with no external IP. Which subnet-level setting is the simplest correct choice?',
    options: opts4(
      'Cloud NAT',
      'Private Google Access enabled on the subnet',
      'External IP per VM',
      'Private Service Connect endpoint for every API'
    ),
    correct: ['b'],
    explanation: 'Enabling Private Google Access on the subnet is the simplest way for internal-only VMs to reach Google APIs; PSC endpoints are for finer-grained private connectivity and more setup.',
    references: [REF_PGA]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must connect 18 VPCs so any VPC can reach any other through a central point with minimal route administration. Which is the best design?',
    options: opts4(
      'A full peering mesh (153 peerings)',
      'Network Connectivity Center hub with each VPC as a spoke',
      'Static routes between every pair',
      'One giant Shared VPC for all teams'
    ),
    correct: ['b'],
    explanation: 'NCC provides a hub-and-spoke model with transitive connectivity and centralized route exchange, far simpler than an O(n^2) peering mesh.',
    references: [REF_NCC, REF_PEERING]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A high-throughput HPC design needs larger-than-default frames between VMs. What must be decided during VPC design?',
    options: opts4(
      'Nothing; MTU is fixed at 1460',
      'Set the VPC MTU (up to 8896) at network creation and align guest OS MTU',
      'Use Cloud CDN',
      'Use external IPs to enable jumbo frames'
    ),
    correct: ['b'],
    explanation: 'Jumbo-frame support requires planning the VPC MTU (up to 8896) at network creation and matching guest OS MTU; it is not the default and cannot be auto-negotiated.',
    references: [REF_MTU]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'During prototyping you want to test a new firewall policy without affecting production VMs. What is the safest approach?',
    options: opts4(
      'Apply the policy to production and watch logs',
      'Create an isolated test VPC/project, apply and validate the policy there, then promote',
      'Disable the implied deny rule globally',
      'Delete existing firewall rules to test'
    ),
    correct: ['b'],
    explanation: 'Validating firewall changes in an isolated environment before promotion avoids production risk and is the recommended prototyping workflow.',
    references: [REF_FW_POLICY, REF_CONN_TESTS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Shared VPC, the host project owns the network resources and service projects deploy resources into shared subnets.',
    options: opts4('True', 'False', 'Only in auto mode', 'Only with peering'),
    correct: ['a'],
    explanation: 'That is exactly the Shared VPC model: a host project owns subnets/routes/firewalls and attached service projects deploy resources into the shared subnets.',
    references: [REF_SHARED_VPC]
  },

  // ── Implementing Virtual Private Cloud Instances (14) ──
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which gcloud command creates a subnet "web" with range 10.20.0.0/24 in region us-central1 within VPC "prod-vpc"?',
    options: opts4(
      'gcloud compute networks subnets create web --network=prod-vpc --range=10.20.0.0/24 --region=us-central1',
      'gcloud compute subnets add web --cidr=10.20.0.0/24',
      'gcloud compute networks create web --range=10.20.0.0/24',
      'gcloud subnets create web --vpc prod-vpc'
    ),
    correct: ['a'],
    explanation: '`gcloud compute networks subnets create` with --network, --range, and --region is the correct command. The other forms use invalid subcommands or flags.',
    references: [REF_SUBNETS]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'You need an additional non-overlapping range on an existing subnet for GKE Services. What do you configure?',
    options: opts4(
      'A new VPC',
      'A secondary IP range on the subnet',
      'A new primary range replacing the old one',
      'Cloud NAT addresses'
    ),
    correct: ['b'],
    explanation: 'Secondary IP ranges add additional non-overlapping ranges to an existing subnet, used by VPC-native GKE for Pods/Services without recreating the subnet.',
    references: [REF_ALIAS, REF_SUBNETS]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to permit SSH (TCP 22) only from a corporate CIDR 203.0.113.0/24 to instances with tag "bastion". Which rule is correct?',
    options: opts4(
      'Egress allow tcp:22 to 0.0.0.0/0',
      'Ingress allow tcp:22, source-ranges 203.0.113.0/24, target-tags bastion',
      'Ingress allow all from 203.0.113.0/24',
      'Ingress deny tcp:22 from 0.0.0.0/0 only'
    ),
    correct: ['b'],
    explanation: 'An ingress allow rule for tcp:22 scoped by source-ranges 203.0.113.0/24 and target-tags bastion grants least-privilege SSH; the implied deny blocks all other SSH.',
    references: [REF_FIREWALL]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'Two custom mode VPCs with non-overlapping ranges must communicate privately without an internet path and without BGP. Which is the simplest option?',
    options: opts4(
      'Cloud VPN between them',
      'VPC Network Peering',
      'External IPs and firewall rules',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'VPC Network Peering connects two VPCs privately with automatic subnet route exchange, no BGP, and no internet path — the simplest fit when ranges do not overlap.',
    references: [REF_PEERING]
  },
  {
    domain: VPC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Cloud NAT.',
    options: opts4(
      'It requires a Cloud Router in the region',
      'It provides outbound internet access for VMs without external IPs',
      'It does not allow unsolicited inbound connections',
      'It is a single VM appliance you must scale manually'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Cloud NAT is a managed, regional, software-defined service tied to a Cloud Router; it gives egress-only internet access (no unsolicited inbound) and scales automatically — it is not a managed-by-you VM appliance.',
    references: [REF_NAT, REF_ROUTER]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'A subnet needs instances to reach Cloud Storage privately without external IPs. Which setting on the subnet enables this?',
    options: opts4(
      'Enable Private Google Access',
      'Enable Cloud NAT',
      'Add a secondary range',
      'Enable flow logs'
    ),
    correct: ['a'],
    explanation: 'Private Google Access on the subnet lets internal-only VMs reach Google APIs and services such as Cloud Storage over Google\'s network.',
    references: [REF_PGA]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'A custom route 10.50.0.0/16 with next hop a VPN tunnel exists, plus a more specific 10.50.10.0/24 route to a different next hop. Which route is used for 10.50.10.5?',
    options: opts4(
      'The 10.50.0.0/16 route, because it was created first',
      'The 10.50.10.0/24 route, because routes are chosen by longest prefix match',
      'Neither; the packet is dropped',
      'Both, traffic is duplicated'
    ),
    correct: ['b'],
    explanation: 'Google Cloud routing selects the most specific (longest prefix) matching route, so 10.50.10.0/24 wins for 10.50.10.5 over the broader /16.',
    references: [REF_ROUTES]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about adding network interfaces to a running VM is correct?',
    options: opts4(
      'You can hot-add NICs anytime',
      'All NICs must be defined at instance creation and cannot be changed afterward',
      'NICs require Shared VPC',
      'Only one NIC per VM is ever allowed'
    ),
    correct: ['b'],
    explanation: 'Network interfaces are fixed at instance creation — they cannot be added or removed later. Plan multi-NIC topology before creating the VM.',
    references: [REF_MULTI_NIC]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'In Shared VPC, the network team wants service-project users to deploy only into a specific subnet, not all subnets. Which IAM grant achieves least privilege?',
    options: opts4(
      'Grant Compute Network User at the host project level',
      'Grant Compute Network User on the specific subnet only',
      'Grant Owner on the host project',
      'Grant no roles; it works by default'
    ),
    correct: ['b'],
    explanation: 'Granting roles/compute.networkUser at the subnet scope (rather than project-wide) limits service-project users to that subnet, following least privilege.',
    references: [REF_SHARED_VPC, REF_IAM]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed connectivity from your VPC to Cloud SQL using private IP. Which configuration is required first?',
    options: opts4(
      'Private Google Access only',
      'Allocate an internal IP range and create a private connection (private services access)',
      'Cloud NAT',
      'A public IP allowlist'
    ),
    correct: ['b'],
    explanation: 'Private services access requires allocating an internal range and establishing a private connection to the Google-managed producer so Cloud SQL is reachable by private IP.',
    references: [REF_PSA]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'You must block egress to a malicious CIDR for all VMs in a VPC while keeping other egress working. What is the correct firewall approach?',
    options: opts4(
      'Add a low-priority allow-all egress rule',
      'Add a high-priority egress deny rule for the malicious destination range; the implied allow-egress still permits other traffic',
      'Disable the implied allow egress',
      'Use an ingress deny rule'
    ),
    correct: ['b'],
    explanation: 'A high-priority egress deny scoped to the malicious destination range blocks that traffic while the implied allow-egress continues to permit all other outbound traffic.',
    references: [REF_FIREWALL]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is true about VPC Network Peering and overlapping IP ranges?',
    options: opts4(
      'Peering works even if subnet ranges overlap',
      'Peering cannot be established if the networks have overlapping subnet ranges',
      'Overlap is resolved automatically by NAT',
      'Overlap only matters for IPv6'
    ),
    correct: ['b'],
    explanation: 'VPC Network Peering requires non-overlapping subnet ranges; overlapping ranges prevent the peering from working because routing would be ambiguous.',
    references: [REF_PEERING]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'A dual-stack service must accept IPv6 from the internet on a VM. What configuration is needed on the subnet and instance?',
    options: opts4(
      'IPv6 is automatic for all VMs',
      'Configure the subnet as dual-stack with external IPv6 access and create the VM NIC with an IPv6 address',
      'Add an alias range for IPv6',
      'Use Cloud NAT for IPv6'
    ),
    correct: ['b'],
    explanation: 'External IPv6 connectivity requires a dual-stack subnet with external IPv6 access type and an instance NIC configured for IPv6; it is not enabled by default.',
    references: [REF_IPV6]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Every VPC network includes an implied rule that allows all egress and an implied rule that denies all ingress.',
    options: opts4('True', 'False', 'Only egress is implied', 'Only ingress is implied'),
    correct: ['a'],
    explanation: 'Every VPC has two implied rules: allow all egress and deny all ingress. You add higher-priority rules to override these defaults.',
    references: [REF_FIREWALL]
  },

  // ── Configuring Network Services (15) ──
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to publish a global HTTPS website with TLS termination and WAF protection. Which combination should you configure?',
    options: opts4(
      'Internal passthrough Network Load Balancer + Cloud NAT',
      'Global external Application Load Balancer + Google Cloud Armor',
      'External passthrough Network Load Balancer + Cloud CDN only',
      'Internal Application Load Balancer + DNSSEC'
    ),
    correct: ['b'],
    explanation: 'A global external Application Load Balancer terminates TLS and routes HTTP(S); attaching a Google Cloud Armor policy to its backend service adds WAF protection.',
    references: [REF_HTTPS_LB, REF_ARMOR]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'After enabling an external Application Load Balancer, all backends report unhealthy though the app works when tested directly. What is the most common root cause?',
    options: opts4(
      'The app is down',
      'Firewall does not allow Google health check ranges 35.191.0.0/16 and 130.211.0.0/22 to the backend port',
      'DNS is misconfigured',
      'Cloud CDN is disabled'
    ),
    correct: ['b'],
    explanation: 'Health checks come from 35.191.0.0/16 and 130.211.0.0/22; without an ingress allow rule for these ranges to the backend port, all backends appear unhealthy even though the app works.',
    references: [REF_HEALTHCHECK, REF_FIREWALL]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to offload cacheable static assets to Google\'s edge for a global website. Which feature do you enable on the backend service?',
    options: opts4(
      'Cloud Armor',
      'Cloud CDN',
      'Session affinity',
      'Private Google Access'
    ),
    correct: ['b'],
    explanation: 'Enabling Cloud CDN on the external Application Load Balancer backend service caches eligible content at Google\'s edge to reduce latency and origin load.',
    references: [REF_CDN]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL correct statements about Cloud DNS.',
    options: opts4(
      'Public managed zones are resolvable on the internet',
      'Private managed zones resolve only for authorized VPC networks',
      'DNSSEC can be enabled on public zones to protect integrity',
      'Private zones automatically resolve on-premises names'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Public zones are internet-resolvable, private zones are scoped to listed VPCs, and DNSSEC protects public zone integrity. Resolving on-premises names requires forwarding zones, not automatic behavior.',
    references: [REF_DNS, REF_DNS_PRIVATE]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'You must route requests to different backend services based on the Host header for a global site. Which load balancer component handles this?',
    options: opts4(
      'Backend service health check',
      'URL map host rules and path matchers',
      'Cloud NAT mapping',
      'A firewall rule'
    ),
    correct: ['b'],
    explanation: 'The URL map\'s host rules (and path matchers) route by Host header and path on an external/internal Application Load Balancer.',
    references: [REF_HTTPS_LB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'On-premises resolvers must resolve names in a Cloud DNS private zone. Which configuration exposes a resolution entry point to on-premises?',
    options: opts4(
      'Outbound forwarding only',
      'An inbound DNS server policy',
      'A public zone',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'An inbound DNS server policy creates internal IP addresses that on-premises resolvers forward queries to, enabling resolution of Google private zones over hybrid links.',
    references: [REF_DNS_POLICY]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'You need an internal regional L7 load balancer for microservices accessed only from within the VPC. Which option is correct?',
    options: opts4(
      'Global external Application Load Balancer',
      'Internal Application Load Balancer',
      'External passthrough Network Load Balancer',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'The internal Application Load Balancer provides regional internal HTTP(S) load balancing with URL-based routing for clients inside the VPC.',
    references: [REF_LB_CHOOSE, REF_ILB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'You need clients to stick to the same backend across requests on an internal passthrough Network Load Balancer. Where do you configure this?',
    options: opts4(
      'URL map',
      'Backend service session affinity (e.g., CLIENT_IP)',
      'Health check',
      'Forwarding rule protocol'
    ),
    correct: ['b'],
    explanation: 'Session affinity is set on the backend service (CLIENT_IP, CLIENT_IP_PROTO, etc.). Passthrough load balancers have no URL map.',
    references: [REF_BACKEND, REF_ILB]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which load balancer preserves the original client source IP to the backend without proxying for a regional external TCP service?',
    options: opts4(
      'External Application Load Balancer',
      'External passthrough Network Load Balancer',
      'External proxy Network Load Balancer',
      'Internal Application Load Balancer'
    ),
    correct: ['b'],
    explanation: 'The external passthrough Network Load Balancer forwards packets without proxying, preserving the client source IP for regional external TCP/UDP traffic.',
    references: [REF_NLB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'You must mitigate an L7 DDoS and block known bad IPs at the edge for a public web app. Which feature is appropriate?',
    options: opts4(
      'VPC firewall rules only',
      'Google Cloud Armor security policy with IP deny lists and rate limiting on the LB backend',
      'Cloud NAT',
      'DNSSEC'
    ),
    correct: ['b'],
    explanation: 'Google Cloud Armor (attached to the external Application Load Balancer backend) provides edge IP allow/deny, WAF, and rate limiting to mitigate L7 attacks.',
    references: [REF_ARMOR]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cloud DNS feature protects a public zone\'s records from tampering by enabling cryptographic validation?',
    options: opts4(
      'Private zone',
      'DNSSEC',
      'DNS forwarding',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'DNSSEC signs zone records so resolvers can cryptographically validate authenticity, protecting public zones from spoofing/tampering.',
    references: [REF_DNS]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'Traffic must be split 90/10 between a stable and canary backend behind an external Application Load Balancer. Which capability provides this?',
    options: opts4(
      'Cloud NAT port mapping',
      'Weighted backend traffic splitting in the URL map route action',
      'Health check tuning',
      'Firewall priorities'
    ),
    correct: ['b'],
    explanation: 'The URL map route action supports weighted splitting across backend services (e.g., 90/10) for canary or blue-green rollouts.',
    references: [REF_HTTPS_LB, REF_BACKEND]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'A global external Application Load Balancer must serve both IPv4 and IPv6 clients on the same hostname. What is required?',
    options: opts4(
      'Two separate load balancers',
      'IPv4 and IPv6 global forwarding rules pointing to the same target proxy/URL map',
      'Cloud NAT for IPv6',
      'Private Google Access'
    ),
    correct: ['b'],
    explanation: 'Creating both IPv4 and IPv6 global forwarding rules that reference the same target proxy and URL map serves dual-stack clients on one logical service.',
    references: [REF_HTTPS_LB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'A backend behind the LB is healthy but receives no traffic while another identical backend gets all of it. Which configuration most likely explains it?',
    options: opts4(
      'Balancing mode/capacity settings or a misconfigured backend (e.g., zero capacity or wrong instance group) on the idle backend',
      'DNSSEC is disabled',
      'Cloud CDN is enabled',
      'The VPC MTU is too small'
    ),
    correct: ['a'],
    explanation: 'Backend balancing mode and capacity (max rate/utilization) or attaching the wrong instance group can cause one backend to receive no traffic even though it is healthy.',
    references: [REF_BACKEND, REF_HEALTHCHECK]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'Google Cloud Armor security policies can be attached to internal passthrough Network Load Balancers.',
    options: opts4('True', 'False', 'Only in Premium Tier', 'Only with Cloud CDN'),
    correct: ['b'],
    explanation: 'Cloud Armor protects backend services of external Application Load Balancers (and certain proxy load balancers). It is not applicable to internal passthrough (L4) load balancers.',
    references: [REF_ARMOR, REF_LB_CHOOSE]
  },

  // ── Implementing Hybrid Interconnectivity (9) ──
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Google Cloud resource provides dynamic BGP routing for hybrid connections such as HA VPN and Cloud Interconnect?',
    options: opts4(
      'Cloud NAT',
      'Cloud Router',
      'Cloud DNS',
      'Cloud Armor'
    ),
    correct: ['b'],
    explanation: 'Cloud Router establishes BGP sessions to dynamically advertise and learn routes for HA VPN and Cloud Interconnect connections.',
    references: [REF_ROUTER, REF_BGP]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'For a 99.99% Dedicated Interconnect SLA, what redundancy is required?',
    options: opts4(
      'One connection in one edge availability domain',
      'Connections in at least two edge availability domains in two metros, with redundant attachments and BGP',
      'Two attachments on the same circuit',
      'A single 100 Gbps link'
    ),
    correct: ['b'],
    explanation: 'The 99.99% SLA requires redundant Dedicated Interconnect connections across at least two edge availability domains (and two metros) with redundant VLAN attachments and BGP.',
    references: [REF_DEDICATED, REF_INTERCONNECT]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about HA VPN.',
    options: opts4(
      'It uses an HA VPN gateway with two interfaces for redundancy',
      'It supports dynamic routing via BGP with Cloud Router',
      'A proper topology can achieve a 99.99% SLA',
      'It provides an unencrypted private circuit to Google'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'HA VPN uses a two-interface gateway, supports BGP via Cloud Router, and can reach 99.99% with the right topology. It is encrypted IPsec over the internet, not an unencrypted private circuit.',
    references: [REF_HA_VPN, REF_VPN]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'BGP is established over Interconnect, but on-premises does not receive a particular VPC subnet route. What should you change?',
    options: opts4(
      'Disable Cloud NAT',
      'Configure the Cloud Router to advertise that subnet (custom route advertisement)',
      'Change the VPC MTU',
      'Recreate the VPC'
    ),
    correct: ['b'],
    explanation: 'If the Cloud Router is not advertising the subnet (default vs custom advertised routes), on-premises will not learn it despite an up BGP session — adjust advertised routes.',
    references: [REF_ROUTER, REF_BGP]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You need 5 Gbps to Google but cannot place equipment in a Google colocation facility. Which option is appropriate?',
    options: opts4(
      'Dedicated Interconnect',
      'Partner Interconnect through a supported service provider',
      'Cross-Cloud Interconnect',
      'Direct Peering'
    ),
    correct: ['b'],
    explanation: 'Partner Interconnect provides 50 Mbps–50 Gbps connectivity via a supported service provider when you cannot meet Dedicated Interconnect colocation requirements.',
    references: [REF_PARTNER, REF_INTERCONNECT]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'Which option creates an encrypted connection to on-premises that can be provisioned in minutes for a small workload?',
    options: opts4(
      'Dedicated Interconnect',
      'HA VPN',
      'Partner Interconnect',
      'Cross-Cloud Interconnect'
    ),
    correct: ['b'],
    explanation: 'HA VPN sets up encrypted IPsec tunnels over the internet quickly and is suitable for small workloads, unlike Interconnect which needs lengthy provisioning.',
    references: [REF_HA_VPN, REF_VPN]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a redundant private link to a second cloud provider without using the public internet. Which Google product fits?',
    options: opts4(
      'HA VPN',
      'Cross-Cloud Interconnect',
      'VPC Network Peering',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'Cross-Cloud Interconnect provides dedicated, redundant physical connectivity between Google Cloud and another cloud, avoiding the public internet.',
    references: [REF_CROSS_CLOUD]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'A Cloud Router BGP session is down after an Interconnect change. Which is a likely cause to verify first?',
    options: opts4(
      'The VPC has too many subnets',
      'Mismatched BGP peer IP/ASN or VLAN attachment configuration between Google and the on-premises router',
      'Cloud CDN is disabled',
      'DNSSEC is off'
    ),
    correct: ['b'],
    explanation: 'A down BGP session commonly results from mismatched peer IP addresses, ASNs, or VLAN attachment settings between the Cloud Router and on-premises router.',
    references: [REF_BGP, REF_ROUTER]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You must connect three on-premises sites and four VPCs with centralized, transitive routing over Interconnect/VPN. Which product is purpose-built?',
    options: opts4(
      'A peering mesh',
      'Network Connectivity Center with hybrid and VPC spokes',
      'Independent Cloud Routers with no hub',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Network Connectivity Center provides a hub for hybrid (VPN/Interconnect) and VPC spokes with transitive routing — ideal for multi-site, multi-VPC topologies.',
    references: [REF_NCC, REF_INTERCONNECT]
  },

  // ── Managing, Monitoring, and Optimizing Network Operations (10) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need sampled traffic metadata per subnet for security analysis and capacity planning. Which feature provides this?',
    options: opts4(
      'Packet Mirroring',
      'VPC Flow Logs',
      'Cloud Trace',
      'Cloud Profiler'
    ),
    correct: ['b'],
    explanation: 'VPC Flow Logs record sampled connection metadata per subnet for monitoring, forensics, and capacity planning. Packet Mirroring is for full-payload deep inspection.',
    references: [REF_FLOWLOGS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A security team needs full packet capture from specific VMs sent to an analysis appliance. Which feature should be configured?',
    options: opts4(
      'VPC Flow Logs',
      'Packet Mirroring',
      'Firewall Rules Logging',
      'Cloud Monitoring'
    ),
    correct: ['b'],
    explanation: 'Packet Mirroring clones full packets from selected sources to a collector instance group for IDS/forensics; flow logs only sample metadata.',
    references: [REF_PACKET_MIRROR]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to confirm which firewall rule allowed or denied a specific connection. Which feature do you enable?',
    options: opts4(
      'VPC Flow Logs',
      'Firewall Rules Logging on the relevant rules',
      'Cloud CDN logs',
      'Cloud DNS logging'
    ),
    correct: ['b'],
    explanation: 'Firewall Rules Logging (enabled per rule) records connections matched by the rule and the allow/deny disposition, confirming which rule acted.',
    references: [REF_FW_LOGS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL components of Network Intelligence Center used for operations.',
    options: opts4(
      'Connectivity Tests',
      'Network Topology',
      'Performance Dashboard',
      'Cloud Armor WAF rules'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Network Intelligence Center includes Connectivity Tests, Network Topology, and Performance Dashboard. Cloud Armor is a separate web-security product, not part of NIC.',
    references: [REF_NIC, REF_CONN_TESTS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Cloud NAT logs show "dropped due to no available ports". Which is the correct remediation?',
    options: opts4(
      'Remove the Cloud Router',
      'Enable dynamic port allocation and/or add NAT IP addresses and raise minimum ports per VM',
      'Switch to external IPs',
      'Disable VPC Flow Logs'
    ),
    correct: ['b'],
    explanation: 'Port exhaustion is fixed by enabling dynamic port allocation, adding NAT IPs, and/or raising ports-per-VM to expand the NAT port pool.',
    references: [REF_NAT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'You are nearing the subnet/route quota in a project that keeps growing. What is the right operational action?',
    options: opts4(
      'Delete production subnets',
      'Review usage, consolidate where possible, and request a quota increase before hitting the limit',
      'Ignore the warning',
      'Move to auto mode VPC'
    ),
    correct: ['b'],
    explanation: 'Network resources have quotas; proactively reviewing usage and requesting increases (and consolidating) avoids hitting hard limits that block deployments.',
    references: [REF_QUOTAS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach best troubleshoots high latency reported by users of a global external Application Load Balancer?',
    options: opts4(
      'Only check VM CPU',
      'Inspect load balancer latency/backend metrics in Cloud Monitoring and LB request logs',
      'Disable the load balancer',
      'Switch to a passthrough LB blindly'
    ),
    correct: ['b'],
    explanation: 'Cloud Monitoring LB metrics (total/backend latency, response codes) and LB request logs are the primary tools to localize whether slowness is at the edge, backend, or app.',
    references: [REF_LB_LOGS, REF_MONITORING]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Connectivity Tests report "reachable" but users still see failures intermittently. What is the recommended next step?',
    options: opts4(
      'Trust the test and close the issue',
      'Enable VPC Flow Logs and analyze real flows/drops/latency for the affected paths',
      'Delete firewall rules',
      'Recreate the subnet'
    ),
    correct: ['b'],
    explanation: 'Connectivity Tests validate static config; intermittent runtime failures require observing live traffic with VPC Flow Logs to find drops or latency spikes.',
    references: [REF_FLOWLOGS, REF_CONN_TESTS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'To optimize cost for non-latency-sensitive bulk egress while keeping user traffic fast, which lever should you tune?',
    options: opts4(
      'Use Premium Tier for everything',
      'Apply Standard Tier to bulk/non-critical egress and keep Premium Tier for user-facing traffic',
      'Disable monitoring',
      'Remove all load balancers'
    ),
    correct: ['b'],
    explanation: 'Selectively applying Standard Tier to bulk egress while keeping Premium Tier for user-facing traffic optimizes cost without harming user latency.',
    references: [REF_NET_TIERS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Firewall Rules Logging records every connection in the VPC regardless of whether logging is enabled on individual rules.',
    options: opts4('True', 'False', 'Only for deny rules', 'Only for egress'),
    correct: ['b'],
    explanation: 'Firewall Rules Logging is configured per rule; only connections matching rules that have logging enabled are recorded — it is not global by default.',
    references: [REF_FW_LOGS]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Designing, Planning, and Prototyping a Google Cloud Network (17) ──
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A platform team must own networking centrally while many app teams deploy workloads. Which Google Cloud construct is the canonical fit?',
    options: opts4(
      'A peering mesh between all app projects',
      'Shared VPC with a host project and attached service projects',
      'One VPC per app team with no connectivity',
      'Auto mode VPC in every project'
    ),
    correct: ['b'],
    explanation: 'Shared VPC is the canonical pattern for centralized network ownership (host project) with decentralized workload deployment (service projects).',
    references: [REF_SHARED_VPC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must design transitive connectivity among many VPCs and hybrid sites with centralized route management. Which product should the design specify?',
    options: opts4(
      'VPC Network Peering only',
      'Network Connectivity Center',
      'Independent static routes',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Network Connectivity Center provides a hub for transitive connectivity across VPC and hybrid spokes with centralized routing — the right design choice for many-to-many topologies.',
    references: [REF_NCC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accurate statements when planning subnet IP ranges for a hybrid environment.',
    options: opts4(
      'Subnet ranges must not overlap with on-premises ranges to allow Interconnect/VPN routing',
      'Custom mode VPC is recommended so ranges/regions are explicitly controlled',
      'Subnet primary ranges can be expanded but not shrunk',
      'Auto mode guarantees no overlap with any on-premises network'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Non-overlapping ranges are required for hybrid routing, custom mode gives explicit control, and primary ranges expand but do not shrink. Auto mode does NOT guarantee no overlap with on-premises.',
    references: [REF_SUBNETS, REF_VPC]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A design needs a single global anycast IP with TLS termination and HTTP path routing. Which load balancer fits?',
    options: opts4(
      'Internal passthrough Network Load Balancer',
      'Global external Application Load Balancer',
      'Regional external passthrough Network Load Balancer',
      'Cloud VPN'
    ),
    correct: ['b'],
    explanation: 'The global external Application Load Balancer provides a single global anycast IP, edge TLS termination, and URL-map HTTP routing.',
    references: [REF_HTTPS_LB, REF_LB_CHOOSE]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A producer wants to offer a managed database to many isolated consumer VPCs with potentially overlapping ranges. Which design avoids IP and peering constraints?',
    options: opts4(
      'VPC Network Peering to each consumer',
      'Private Service Connect published service with consumer endpoints',
      'A single Shared VPC for all consumers',
      'Public endpoint with allowlists'
    ),
    correct: ['b'],
    explanation: 'Private Service Connect decouples producer and consumer addressing via consumer endpoints, working even with overlapping ranges and avoiding a peering mesh.',
    references: [REF_PSC]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'Before deploying a new firewall and route change, you must predict whether a frontend can reach a backend. Which Google Cloud feature does this without live traffic?',
    options: opts4(
      'VPC Flow Logs',
      'Connectivity Tests',
      'Cloud Trace',
      'Packet Mirroring'
    ),
    correct: ['b'],
    explanation: 'Connectivity Tests analyze the effective configuration to predict reachability before changes are applied, supporting safe prototyping.',
    references: [REF_CONN_TESTS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the recommended first deliverable when planning IP space across multiple regions and on-premises sites?',
    options: opts4(
      'Random CIDR assignment',
      'A documented IP address management plan with non-overlapping allocations',
      'Auto mode VPC',
      'Reusing on-premises ranges in the cloud'
    ),
    correct: ['b'],
    explanation: 'A documented, non-overlapping IPAM plan is the recommended foundation for multi-region and hybrid network design.',
    references: [REF_SUBNETS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid considerations when choosing Premium vs Standard Network Service Tier.',
    options: opts4(
      'Premium Tier routes egress over Google\'s global backbone for lower latency',
      'Standard Tier can reduce cost for regional, non-latency-sensitive traffic',
      'Premium Tier supports global load balancing with a single anycast IP',
      'Standard Tier provides the same global anycast load balancing as Premium'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Premium uses Google\'s backbone and supports global anycast load balancing; Standard reduces cost regionally. Standard Tier does not provide the same global anycast load balancing as Premium.',
    references: [REF_NET_TIERS, REF_LB_CHOOSE]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Which connectivity choice is best for a temporary proof-of-concept needing encrypted on-premises access provisioned quickly at low cost?',
    options: opts4(
      'Dedicated Interconnect',
      'HA VPN',
      'Cross-Cloud Interconnect',
      'Partner Interconnect with a 1-year term'
    ),
    correct: ['b'],
    explanation: 'HA VPN provides encrypted connectivity that can be set up quickly and cheaply — appropriate for a temporary PoC.',
    references: [REF_HA_VPN, REF_VPN]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ensure backend tiers are never reachable from the internet and only from the frontend tier. Which controls express this?',
    options: opts4(
      'External IPs on all tiers',
      'Subnet segmentation with firewall rules scoped by tags/service accounts and no external IPs on backends',
      'A single subnet with OS firewalls',
      'Cloud NAT on the backend tier'
    ),
    correct: ['b'],
    explanation: 'Segmenting tiers, scoping firewall rules by tags/service accounts, and omitting external IPs on backends enforces least-privilege, internet-isolated backends.',
    references: [REF_FIREWALL, REF_SUBNETS]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'Two teams need to resolve the same internal hostnames across their separate VPCs without duplicating Cloud DNS records. Which approach should the design use?',
    options: opts4(
      'A public zone',
      'A Cloud DNS private zone shared/bound to both VPCs (or DNS peering)',
      'Static host files',
      'A forwarding policy to public DNS'
    ),
    correct: ['b'],
    explanation: 'A private zone bound to multiple VPCs (or DNS peering) provides consistent internal resolution across networks without duplicating records.',
    references: [REF_DNS_PRIVATE, REF_DNS_PEERING]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance requirement mandates that sensitive project data cannot be copied to Google services outside an approved boundary. Which design control addresses this?',
    options: opts4(
      'Firewall egress rules only',
      'A VPC Service Controls perimeter restricting Google services to the approved projects',
      'Cloud Armor',
      'A custom route to the internet gateway'
    ),
    correct: ['b'],
    explanation: 'VPC Service Controls perimeters block data egress to Google-managed services/projects outside the perimeter, addressing the exfiltration compliance requirement.',
    references: [REF_PERIMETER]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A design requires internal-only VMs to fetch container images from Artifact Registry without internet access. Which subnet feature is the simplest correct choice?',
    options: opts4(
      'Cloud NAT for all traffic',
      'Private Google Access on the subnet',
      'External IP per VM',
      'A public Cloud DNS zone'
    ),
    correct: ['b'],
    explanation: 'Private Google Access lets internal-only instances reach Google services like Artifact Registry over Google\'s network without internet access.',
    references: [REF_PGA]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'You must connect 20 VPCs with any-to-any reachability and minimal route maintenance. Which design avoids an unmanageable peering mesh?',
    options: opts4(
      'Full mesh peering (190 connections)',
      'Network Connectivity Center hub with VPC spokes',
      'Static routes between all pairs',
      'One Shared VPC forcing all teams together'
    ),
    correct: ['b'],
    explanation: 'NCC provides transitive any-to-any connectivity with centralized routing, replacing an O(n^2) peering mesh that is operationally unmanageable.',
    references: [REF_NCC, REF_PEERING]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE,
    stem: 'A latency-sensitive analytics cluster needs jumbo frames between VMs. What must the network design account for?',
    options: opts4(
      'MTU is fixed and cannot change',
      'Configure VPC MTU (up to 8896) at network creation and align guest OS MTU',
      'Enable Cloud CDN',
      'Use external IPs for jumbo frames'
    ),
    correct: ['b'],
    explanation: 'Jumbo frames require planning the VPC MTU (up to 8896) at creation time and matching guest OS MTU; it is not the default.',
    references: [REF_MTU]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A design review must validate a planned change in isolation before production rollout. Which is the recommended prototyping practice?',
    options: opts4(
      'Change production directly and monitor',
      'Use an isolated prototype environment and validate with Connectivity Tests before promoting',
      'Disable firewall rules to test routing',
      'Delete and recreate the VPC'
    ),
    correct: ['b'],
    explanation: 'Prototyping in an isolated environment validated by Connectivity Tests minimizes production risk before promoting the change.',
    references: [REF_CONN_TESTS, REF_ROUTES]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A VPC network spans all Google Cloud regions globally, while each subnet is scoped to a single region.',
    options: opts4('True', 'False', 'Both are global', 'Both are zonal'),
    correct: ['a'],
    explanation: 'A VPC is a global resource spanning all regions; each subnet is a regional resource bound to one region (and its zones).',
    references: [REF_VPC, REF_SUBNETS]
  },

  // ── Implementing Virtual Private Cloud Instances (14) ──
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which gcloud flag, when creating a network, produces an auto mode VPC?',
    options: opts4(
      '--subnet-mode=custom',
      '--subnet-mode=auto',
      '--legacy',
      '--no-subnetworks'
    ),
    correct: ['b'],
    explanation: '`--subnet-mode=auto` creates an auto mode VPC (one subnet per region from 10.128.0.0/9). `--subnet-mode=custom` creates a custom mode network with no subnets.',
    references: [REF_VPC]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'A subnet is running low on addresses. What is the supported, non-disruptive remediation?',
    options: opts4(
      'Recreate the subnet larger and migrate VMs',
      'Expand the subnet primary range to a larger non-overlapping prefix in place',
      'Shrink another subnet to free space',
      'Subnet ranges cannot change'
    ),
    correct: ['b'],
    explanation: 'You can expand a subnet\'s primary range in place to a larger, non-overlapping prefix without recreating it or affecting running VMs. Shrinking is unsupported.',
    references: [REF_SUBNETS]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'VPC-native GKE needs separate ranges for Pods and Services on a subnet. Which feature provides them?',
    options: opts4(
      'Multiple NICs',
      'Subnet secondary (alias) IP ranges',
      'A new VPC per range',
      'Cloud NAT pools'
    ),
    correct: ['b'],
    explanation: 'Secondary/alias IP ranges on the subnet supply the Pod and Service ranges used by VPC-native GKE clusters.',
    references: [REF_ALIAS, REF_SUBNETS]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to deny all ingress except HTTPS from a load balancer\'s health check and proxy ranges to "web" VMs. Which firewall design is correct?',
    options: opts4(
      'One egress allow rule for 443',
      'Ingress allow tcp:443 from the proxy/health-check ranges with target tag "web"; rely on implied deny ingress for the rest',
      'Disable the implied deny ingress',
      'A single ingress deny-all rule only'
    ),
    correct: ['b'],
    explanation: 'Add a higher-priority ingress allow for tcp:443 from the load balancer proxy and health check ranges scoped to tag "web"; the implied deny-ingress blocks everything else.',
    references: [REF_FIREWALL, REF_HEALTHCHECK]
  },
  {
    domain: VPC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about routes in a VPC.',
    options: opts4(
      'Routes are matched by longest prefix, then priority',
      'A default route 0.0.0.0/0 to the internet gateway is created by default',
      'Custom static routes can use a next hop of an internal load balancer',
      'Subnet routes can be deleted to block intra-VPC traffic'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Routes use longest-prefix then priority; a default internet route exists; static routes can point at an internal LB. Subnet routes are system-generated and cannot simply be deleted to block intra-VPC traffic (use firewall rules).',
    references: [REF_ROUTES]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'Instances without external IPs must reach Google APIs. Which subnet setting is required?',
    options: opts4(
      'Cloud NAT',
      'Private Google Access',
      'Alias IP ranges',
      'Flow logs'
    ),
    correct: ['b'],
    explanation: 'Private Google Access enables internal-only instances to reach Google APIs and services over Google\'s network.',
    references: [REF_PGA]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'Two VPCs must communicate privately, ranges do not overlap, and you want automatic subnet route exchange with no BGP. Which is simplest?',
    options: opts4(
      'HA VPN',
      'VPC Network Peering',
      'External IPs',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'VPC Network Peering connects non-overlapping VPCs privately with automatic subnet route exchange and no BGP — the simplest fit.',
    references: [REF_PEERING]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about Cloud NAT inbound connections is correct?',
    options: opts4(
      'Cloud NAT allows unsolicited inbound connections from the internet',
      'Cloud NAT only allows outbound-initiated connections and their return traffic',
      'Cloud NAT requires external IPs on each VM',
      'Cloud NAT replaces firewall rules'
    ),
    correct: ['b'],
    explanation: 'Cloud NAT is egress-only: it permits outbound-initiated flows and their responses but not unsolicited inbound connections, and it does not replace firewall rules.',
    references: [REF_NAT]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'In Shared VPC, a service-project deployment fails with a subnet permission error. Which role on which scope fixes it with least privilege?',
    options: opts4(
      'Owner on the host project',
      'Compute Network User on the specific shared subnet',
      'Editor on the organization',
      'No role; it should work by default'
    ),
    correct: ['b'],
    explanation: 'Granting roles/compute.networkUser at the specific subnet scope grants only the access needed for service-project users to deploy into that subnet.',
    references: [REF_SHARED_VPC, REF_IAM]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'You must reach a Google-managed service (e.g., Cloud SQL) by private IP from your VPC. What must be configured?',
    options: opts4(
      'Private Google Access only',
      'Private services access: allocate an internal range and create the private connection',
      'Cloud NAT',
      'A public IP allowlist'
    ),
    correct: ['b'],
    explanation: 'Private services access reserves an internal range and establishes a managed private connection so the service is reachable by private IP from the VPC.',
    references: [REF_PSA]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'A NIC must be on two VPCs (management and data). What is the constraint when launching the VM?',
    options: opts4(
      'Add the second NIC after boot',
      'Define all NICs at creation; they cannot be added/removed later',
      'Use alias IPs instead',
      'Multiple NICs require auto mode VPC'
    ),
    correct: ['b'],
    explanation: 'All network interfaces must be defined at instance creation and cannot be changed afterward; each NIC attaches to a different VPC.',
    references: [REF_MULTI_NIC]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a baseline security posture inherited by all VPCs in a folder without per-network rules. Which feature provides this?',
    options: opts4(
      'Per-VPC firewall rules',
      'Hierarchical firewall policies at folder/org level',
      'OS firewalls',
      'Routes with deny next hop'
    ),
    correct: ['b'],
    explanation: 'Hierarchical firewall policies attach at org/folder scope and are inherited by all underlying VPCs, providing a consistent baseline without duplication.',
    references: [REF_FW_POLICY]
  },
  {
    domain: VPC, difficulty: 3, type: QType.SINGLE,
    stem: 'An IPv6 service must be reachable from the internet on a VM. What must be configured?',
    options: opts4(
      'IPv6 is automatic',
      'A dual-stack subnet with external IPv6 access and an IPv6-enabled instance NIC',
      'An alias range for IPv6',
      'Cloud NAT for IPv6'
    ),
    correct: ['b'],
    explanation: 'External IPv6 requires the subnet to be dual-stack with external IPv6 access and the instance NIC configured for IPv6; it is not enabled by default.',
    references: [REF_IPV6]
  },
  {
    domain: VPC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'VPC firewall rules are stateful, so return traffic for an allowed connection is automatically permitted.',
    options: opts4('True', 'False', 'Only for egress', 'Only for TCP'),
    correct: ['a'],
    explanation: 'VPC firewall rules are stateful: if a connection is allowed, the return traffic is automatically permitted without a separate rule.',
    references: [REF_FIREWALL]
  },

  // ── Configuring Network Services (15) ──
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must load balance internal UDP traffic regionally while preserving the client source IP. Which load balancer applies?',
    options: opts4(
      'Global external Application Load Balancer',
      'Internal passthrough Network Load Balancer',
      'External proxy Network Load Balancer',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'The internal passthrough Network Load Balancer handles regional internal TCP/UDP with source IP preservation (no proxy).',
    references: [REF_ILB, REF_LB_CHOOSE]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'All backends behind a new external Application Load Balancer are unhealthy though the app responds when curled from a VM in the same subnet. What is the most likely cause?',
    options: opts4(
      'The app crashed',
      'Missing ingress firewall allow for health check ranges 35.191.0.0/16 and 130.211.0.0/22',
      'DNSSEC disabled',
      'Wrong region for the subnet'
    ),
    correct: ['b'],
    explanation: 'Health check probes originate from 35.191.0.0/16 and 130.211.0.0/22; without a firewall allow for these to the backend port, all backends are marked unhealthy even though the app works locally.',
    references: [REF_HEALTHCHECK, REF_FIREWALL]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which feature caches eligible content at Google\'s edge for an external Application Load Balancer?',
    options: opts4(
      'Cloud Armor',
      'Cloud CDN',
      'Private Google Access',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Cloud CDN, enabled on the LB backend service, caches cacheable responses at Google\'s edge points of presence.',
    references: [REF_CDN]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about external Application Load Balancer backend services.',
    options: opts4(
      'They reference a health check used to determine backend availability',
      'They can have Cloud CDN enabled',
      'They support balancing mode and capacity settings per backend',
      'They preserve client source IP to the backend without proxying'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Backend services reference health checks, can enable Cloud CDN, and support per-backend balancing mode/capacity. Application Load Balancers proxy connections, so the client source IP is NOT preserved (use X-Forwarded-For).',
    references: [REF_BACKEND, REF_HTTPS_LB]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'You need an internal regional HTTP load balancer with path-based routing for services consumed inside the VPC. Which is correct?',
    options: opts4(
      'Internal Application Load Balancer',
      'External passthrough Network Load Balancer',
      'Global external Application Load Balancer',
      'Cloud CDN'
    ),
    correct: ['a'],
    explanation: 'The internal Application Load Balancer provides regional internal L7 routing (URL maps/path rules) for VPC-internal clients.',
    references: [REF_ILB, REF_LB_CHOOSE]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'On-premises must resolve Cloud DNS private zone names over a VPN. Which Cloud DNS configuration is required?',
    options: opts4(
      'A public managed zone',
      'An inbound DNS server policy exposing internal forwarding addresses',
      'DNSSEC only',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'An inbound DNS server policy creates internal forwarding IPs that on-premises resolvers query to resolve Google private zones across hybrid links.',
    references: [REF_DNS_POLICY]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component on an external Application Load Balancer routes /static/* to a CDN-enabled backend and /api/* to an API backend?',
    options: opts4(
      'Health check',
      'URL map path matchers/path rules',
      'Firewall rule',
      'Forwarding rule protocol'
    ),
    correct: ['b'],
    explanation: 'URL map path matchers/path rules route by path to different backend services (e.g., /static/* vs /api/*).',
    references: [REF_HTTPS_LB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'You need client requests from the same source to consistently reach the same backend on a passthrough Network Load Balancer. Which setting controls this?',
    options: opts4(
      'URL map host rules',
      'Backend service session affinity (CLIENT_IP or CLIENT_IP_PROTO)',
      'Cloud CDN cache key',
      'Health check timeout'
    ),
    correct: ['b'],
    explanation: 'Session affinity (CLIENT_IP / CLIENT_IP_PROTO) on the backend service provides client-to-backend stickiness; passthrough LBs have no URL map.',
    references: [REF_BACKEND, REF_NLB]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'A regional external TCP service must preserve client source IP at high throughput without proxying. Which load balancer is correct?',
    options: opts4(
      'External proxy Network Load Balancer',
      'External passthrough Network Load Balancer',
      'External Application Load Balancer',
      'Internal Application Load Balancer'
    ),
    correct: ['b'],
    explanation: 'The external passthrough Network Load Balancer forwards packets without proxying, preserving the client source IP at high throughput.',
    references: [REF_NLB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'You must enforce OWASP-style WAF rules and rate limiting on a public web app. Which Google Cloud service provides this at the edge?',
    options: opts4(
      'Cloud NAT',
      'Google Cloud Armor security policy on the LB backend',
      'Cloud DNS DNSSEC',
      'VPC Flow Logs'
    ),
    correct: ['b'],
    explanation: 'Google Cloud Armor offers preconfigured WAF (OWASP) rules and rate limiting, applied to the external Application Load Balancer backend service.',
    references: [REF_ARMOR]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature signs Cloud DNS public zone records so resolvers can validate authenticity?',
    options: opts4(
      'A private zone',
      'DNSSEC',
      'DNS forwarding',
      'Cloud Armor'
    ),
    correct: ['b'],
    explanation: 'DNSSEC cryptographically signs public zone records, allowing resolvers to validate authenticity and detect tampering.',
    references: [REF_DNS]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'You must roll out a new backend version to 1% of traffic behind a global external Application Load Balancer. Which capability supports this?',
    options: opts4(
      'Health check thresholds',
      'URL map weighted backend traffic splitting',
      'Cloud NAT mappings',
      'Firewall priority'
    ),
    correct: ['b'],
    explanation: 'Weighted backend splitting in the URL map route action sends a small percentage of traffic to the new version for a canary rollout.',
    references: [REF_HTTPS_LB, REF_BACKEND]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'A global Application Load Balancer must serve IPv4 and IPv6 on the same DNS name. What is required?',
    options: opts4(
      'Two distinct load balancers',
      'Both IPv4 and IPv6 global forwarding rules referencing the same target proxy/URL map',
      'Cloud NAT for IPv6',
      'A private zone'
    ),
    correct: ['b'],
    explanation: 'Configuring IPv4 and IPv6 global forwarding rules that point at the same target proxy and URL map serves dual-stack clients under one service.',
    references: [REF_HTTPS_LB]
  },
  {
    domain: SERVICES, difficulty: 3, type: QType.SINGLE,
    stem: 'A healthy backend receives zero traffic while its peer is overloaded. Which configuration most likely causes this?',
    options: opts4(
      'Misconfigured balancing mode/capacity or the wrong instance group attached to the idle backend',
      'DNSSEC disabled',
      'Cloud CDN enabled',
      'Subnet MTU too small'
    ),
    correct: ['a'],
    explanation: 'Backend balancing mode/capacity misconfiguration (e.g., zero capacity) or attaching the wrong instance group can leave a healthy backend idle while another is overloaded.',
    references: [REF_BACKEND, REF_HEALTHCHECK]
  },
  {
    domain: SERVICES, difficulty: 2, type: QType.SINGLE,
    stem: 'Cloud CDN can be enabled on a backend service of a global external Application Load Balancer.',
    options: opts4('True', 'False', 'Only with HA VPN', 'Only for internal LBs'),
    correct: ['a'],
    explanation: 'Cloud CDN is enabled per backend service of an external Application Load Balancer to cache content at Google\'s edge.',
    references: [REF_CDN, REF_HTTPS_LB]
  },

  // ── Implementing Hybrid Interconnectivity (9) ──
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which resource is required to run BGP for HA VPN or Cloud Interconnect?',
    options: opts4(
      'Cloud DNS',
      'Cloud Router',
      'Cloud NAT',
      'Cloud CDN'
    ),
    correct: ['b'],
    explanation: 'Cloud Router runs BGP sessions to dynamically exchange routes for HA VPN and Cloud Interconnect connections.',
    references: [REF_ROUTER, REF_BGP]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'What HA VPN topology is required to achieve a 99.99% availability SLA?',
    options: opts4(
      'Single tunnel, single interface',
      'Two gateway interfaces, two tunnels to two peer devices/IPs, dynamic BGP routing',
      'Classic VPN with two tunnels',
      'One Dedicated Interconnect circuit'
    ),
    correct: ['b'],
    explanation: 'The 99.99% HA VPN SLA needs two interfaces, two tunnels to two peer devices/IPs, and BGP-based dynamic routing for redundancy.',
    references: [REF_HA_VPN]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Cloud Interconnect.',
    options: opts4(
      'Dedicated Interconnect provides a direct physical connection to Google',
      'Partner Interconnect connects through a supported service provider',
      'Both use Cloud Router with BGP for dynamic routing',
      'Cloud Interconnect traffic is encrypted by Google by default'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dedicated is a direct physical link, Partner uses a service provider, and both use Cloud Router/BGP. Interconnect is not encrypted by default — add MACsec or application-layer encryption if needed.',
    references: [REF_DEDICATED, REF_PARTNER]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'On-premises does not learn a VPC subnet over an established Interconnect BGP session. What should you fix?',
    options: opts4(
      'Disable Cloud NAT',
      'Update Cloud Router advertised routes to include the subnet',
      'Increase VPC MTU',
      'Recreate the subnet'
    ),
    correct: ['b'],
    explanation: 'If the Cloud Router is not advertising the subnet (default vs custom advertisements), on-premises will not learn it despite an up BGP session.',
    references: [REF_ROUTER, REF_BGP]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You need ~3 Gbps connectivity to Google but lack a presence in a Google colocation facility. Which is appropriate?',
    options: opts4(
      'Dedicated Interconnect',
      'Partner Interconnect via a supported provider',
      'Cross-Cloud Interconnect',
      'Direct Peering'
    ),
    correct: ['b'],
    explanation: 'Partner Interconnect (50 Mbps–50 Gbps via a supported service provider) fits when Dedicated Interconnect colocation requirements cannot be met.',
    references: [REF_PARTNER, REF_INTERCONNECT]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'Which connectivity option is encrypted over the public internet and fastest to provision for a small workload?',
    options: opts4(
      'Dedicated Interconnect',
      'HA VPN',
      'Partner Interconnect',
      'Cross-Cloud Interconnect'
    ),
    correct: ['b'],
    explanation: 'HA VPN provides quick-to-provision encrypted IPsec tunnels over the internet, ideal for small workloads.',
    references: [REF_HA_VPN, REF_VPN]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a dedicated private link between Google Cloud and AWS without traversing the public internet. Which product fits?',
    options: opts4(
      'HA VPN',
      'Cross-Cloud Interconnect',
      'VPC Network Peering',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Cross-Cloud Interconnect provides a dedicated physical connection between Google Cloud and another cloud provider, avoiding the public internet.',
    references: [REF_CROSS_CLOUD]
  },
  {
    domain: HYBRID, difficulty: 2, type: QType.SINGLE,
    stem: 'A BGP session over Interconnect is down. Which mismatch is the most common cause to check first?',
    options: opts4(
      'Subnet count',
      'Mismatched BGP peer IP/ASN or VLAN attachment configuration',
      'Cloud CDN disabled',
      'DNSSEC off'
    ),
    correct: ['b'],
    explanation: 'A down BGP session usually stems from mismatched peer IPs, ASNs, or VLAN attachment configuration between Cloud Router and the on-premises router.',
    references: [REF_BGP, REF_ROUTER]
  },
  {
    domain: HYBRID, difficulty: 3, type: QType.SINGLE,
    stem: 'You must centrally connect several hybrid sites and multiple VPCs with transitive routing. Which Google product is purpose-built?',
    options: opts4(
      'A peering mesh',
      'Network Connectivity Center with hybrid and VPC spokes',
      'Separate Cloud Routers with no hub',
      'Cloud NAT'
    ),
    correct: ['b'],
    explanation: 'Network Connectivity Center connects hybrid (VPN/Interconnect) and VPC spokes to a hub with transitive routing — designed for multi-site, multi-VPC connectivity.',
    references: [REF_NCC, REF_INTERCONNECT]
  },

  // ── Managing, Monitoring, and Optimizing Network Operations (10) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which feature provides sampled connection metadata per subnet for security and capacity analysis?',
    options: opts4(
      'Packet Mirroring',
      'VPC Flow Logs',
      'Cloud Trace',
      'Cloud DNS logging'
    ),
    correct: ['b'],
    explanation: 'VPC Flow Logs capture sampled connection metadata per subnet, used for security forensics and capacity planning.',
    references: [REF_FLOWLOGS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An IDS appliance must receive full packet copies from selected VMs. Which feature should you configure?',
    options: opts4(
      'VPC Flow Logs',
      'Packet Mirroring',
      'Firewall Rules Logging',
      'Cloud Monitoring uptime checks'
    ),
    correct: ['b'],
    explanation: 'Packet Mirroring copies full packets from mirrored sources to a collector for deep inspection; flow logs are sampled metadata only.',
    references: [REF_PACKET_MIRROR]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must determine which firewall rule allowed or denied a connection between two VMs. Which log do you enable?',
    options: opts4(
      'VPC Flow Logs',
      'Firewall Rules Logging on the rule',
      'Cloud Audit Logs',
      'Cloud CDN logs'
    ),
    correct: ['b'],
    explanation: 'Firewall Rules Logging records connections matched by a rule (with logging enabled) including the allow/deny disposition.',
    references: [REF_FW_LOGS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid uses of Network Intelligence Center.',
    options: opts4(
      'Diagnose reachability with Connectivity Tests',
      'Visualize traffic and infrastructure with Network Topology',
      'View packet loss/latency with Performance Dashboard',
      'Terminate TLS for load balancers'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Network Intelligence Center provides Connectivity Tests, Network Topology, and Performance Dashboard. TLS termination is a load balancer function, not part of NIC.',
    references: [REF_NIC, REF_CONN_TESTS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Cloud NAT reports port allocation failures during peak load. What should you do first?',
    options: opts4(
      'Delete the Cloud Router',
      'Enable dynamic port allocation and/or add NAT IPs and raise minimum ports per VM',
      'Give every VM an external IP',
      'Disable firewall logging'
    ),
    correct: ['b'],
    explanation: 'NAT port exhaustion is mitigated by enabling dynamic port allocation, adding NAT IPs, and raising ports-per-VM to expand the port pool.',
    references: [REF_NAT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'You repeatedly hit a networking quota in a growing project. What is the recommended operational approach?',
    options: opts4(
      'Ignore quota warnings',
      'Monitor usage, consolidate resources, and request quota increases proactively',
      'Delete production resources',
      'Switch all VMs to external IPs'
    ),
    correct: ['b'],
    explanation: 'Proactively monitoring usage, consolidating, and requesting quota increases prevents hard-limit blocks on deployments.',
    references: [REF_QUOTAS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Users report slowness on a global external Application Load Balancer. Which is the best first diagnostic?',
    options: opts4(
      'Check only VM disk usage',
      'Review LB latency/backend metrics in Cloud Monitoring and LB request logs',
      'Disable the load balancer',
      'Recreate the VPC'
    ),
    correct: ['b'],
    explanation: 'Cloud Monitoring load balancer metrics and request logs (latency, backend latency, response codes) localize whether slowness is at the edge, backend, or application.',
    references: [REF_LB_LOGS, REF_MONITORING]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Connectivity Tests pass but a path intermittently fails in production. What should you do next?',
    options: opts4(
      'Close the issue as resolved',
      'Enable VPC Flow Logs and analyze real flows, drops, and latency for the affected path',
      'Delete firewall rules',
      'Disable monitoring'
    ),
    correct: ['b'],
    explanation: 'Connectivity Tests validate static configuration; intermittent runtime failures require VPC Flow Logs to observe live traffic, drops, and latency.',
    references: [REF_FLOWLOGS, REF_CONN_TESTS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'To reduce egress cost for bulk backups while preserving low latency for users, which optimization is appropriate?',
    options: opts4(
      'Premium Tier for all traffic',
      'Standard Tier for bulk/non-critical egress and Premium Tier for user-facing traffic, plus Cloud CDN offload',
      'Disable load balancing',
      'Use external IPs everywhere'
    ),
    correct: ['b'],
    explanation: 'Applying Standard Tier to bulk egress, keeping Premium Tier for users, and offloading with Cloud CDN reduces cost without degrading user latency.',
    references: [REF_NET_TIERS, REF_CDN]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Packet Mirroring captures full packet contents, whereas VPC Flow Logs capture only sampled metadata.',
    options: opts4('True', 'False', 'Both capture full packets', 'Both capture only metadata'),
    correct: ['a'],
    explanation: 'Packet Mirroring clones full packets (headers and payloads) to a collector, while VPC Flow Logs record only sampled connection metadata.',
    references: [REF_PACKET_MIRROR, REF_FLOWLOGS]
  }
];

const GCP_PCNE_DOMAINS = [
  { name: DESIGN, weight: 26 },
  { name: VPC, weight: 21 },
  { name: SERVICES, weight: 23 },
  { name: HYBRID, weight: 14 },
  { name: OPS, weight: 16 }
];

const GCP_PCNE_BUNDLE = {
  slug: 'google-professional-cloud-network-engineer',
  title: 'Google Professional Cloud Network Engineer',
  description: 'All 3 Google Professional Cloud Network Engineer practice exams in one bundle — covering network design and prototyping, VPC implementation, network services, hybrid interconnectivity, and network operations, aligned to the Google Cloud Professional Cloud Network Engineer exam guide.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 20000 // USD 200 — VOUCHER tier
};

const GCP_PCNE_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'google-professional-cloud-network-engineer-p1',
    code: 'GCP-PCNE-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering network design and prototyping, VPC implementation, network services, hybrid interconnectivity, and network operations.',
    questions: P1
  },
  {
    slug: 'google-professional-cloud-network-engineer-p2',
    code: 'GCP-PCNE-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'google-professional-cloud-network-engineer-p3',
    code: 'GCP-PCNE-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the Google Professional Cloud Network Engineer
 * bundle. Safe to call repeatedly — vendor / exam / bundle rows are
 * upserted, and questions tagged `generatedBy: 'manual:gcp-pcne-seed'`
 * are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedGcpPcne(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'google' } });
  await db.vendor.upsert({
    where: { slug: 'google' },
    update: { name: 'Google', description: 'Google Cloud certifications — infrastructure, networking, data, security, and the Professional Cloud Network Engineer credential.' },
    create: { slug: 'google', name: 'Google', description: 'Google Cloud certifications — infrastructure, networking, data, security, and the Professional Cloud Network Engineer credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'google' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of GCP_PCNE_EXAMS) {
    const title = `Google Professional Cloud Network Engineer — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Google Cloud Professional Cloud Network Engineer exam guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: GCP_PCNE_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:gcp-pcne-seed' } });
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
          generatedBy: 'manual:gcp-pcne-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: GCP_PCNE_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: GCP_PCNE_BUNDLE.slug },
    update: {
      title: GCP_PCNE_BUNDLE.title,
      description: GCP_PCNE_BUNDLE.description,
      price: GCP_PCNE_BUNDLE.price,
      priceVoucher: GCP_PCNE_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: GCP_PCNE_BUNDLE.slug,
      title: GCP_PCNE_BUNDLE.title,
      description: GCP_PCNE_BUNDLE.description,
      price: GCP_PCNE_BUNDLE.price,
      priceVoucher: GCP_PCNE_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'google-professional-cloud-network-engineer-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'google-professional-cloud-network-engineer-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'google-professional-cloud-network-engineer-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'google-professional-cloud-network-engineer-p1', tier: 'VOUCHER' as const, position: 4 }
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
