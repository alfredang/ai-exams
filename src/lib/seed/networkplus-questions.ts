/**
 * CompTIA Network+ (N10-009) bundle seed — vendor, three practice-exam
 * variants, bundle, and 195 blueprint-aligned questions. Idempotent:
 * replaces rows tagged `generatedBy: 'manual:networkplus-seed'` and
 * upserts catalog rows.
 *
 * Exported as `seedNetworkPlus(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/networkplus.ts`) and the
 * protected admin API (`/api/admin/seed-networkplus`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the public CompTIA Network+
 * (N10-009) exam objectives and authoritative RFC / vendor docs:
 *   - 1.0 Networking Concepts      — 23% (15)
 *   - 2.0 Network Implementation   — 20% (13)
 *   - 3.0 Network Operations       — 19% (12)
 *   - 4.0 Network Security         — 14% ( 9)
 *   - 5.0 Network Troubleshooting  — 24% (16)
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

const CONCEPTS = 'Networking Concepts';
const IMPL = 'Network Implementation';
const OPS = 'Network Operations';
const SEC = 'Network Security';
const TROUBLE = 'Network Troubleshooting';

const REF_OBJ = { label: 'CompTIA — Network+ (N10-009) Certification', url: 'https://www.comptia.org/certifications/network' };
const REF_RFC1918 = { label: 'RFC 1918 — Address Allocation for Private Internets', url: 'https://www.rfc-editor.org/rfc/rfc1918' };
const REF_RFC4632 = { label: 'RFC 4632 — CIDR Address Strategy', url: 'https://www.rfc-editor.org/rfc/rfc4632' };
const REF_RFC791 = { label: 'RFC 791 — Internet Protocol', url: 'https://www.rfc-editor.org/rfc/rfc791' };
const REF_RFC793 = { label: 'RFC 9293 — Transmission Control Protocol', url: 'https://www.rfc-editor.org/rfc/rfc9293' };
const REF_RFC768 = { label: 'RFC 768 — User Datagram Protocol', url: 'https://www.rfc-editor.org/rfc/rfc768' };
const REF_RFC2131 = { label: 'RFC 2131 — Dynamic Host Configuration Protocol', url: 'https://www.rfc-editor.org/rfc/rfc2131' };
const REF_RFC1035 = { label: 'RFC 1035 — Domain Names: Implementation and Specification', url: 'https://www.rfc-editor.org/rfc/rfc1035' };
const REF_RFC5905 = { label: 'RFC 5905 — Network Time Protocol Version 4', url: 'https://www.rfc-editor.org/rfc/rfc5905' };
const REF_RFC4861 = { label: 'RFC 4861 — Neighbor Discovery for IPv6', url: 'https://www.rfc-editor.org/rfc/rfc4861' };
const REF_RFC4291 = { label: 'RFC 4291 — IPv6 Addressing Architecture', url: 'https://www.rfc-editor.org/rfc/rfc4291' };
const REF_RFC826 = { label: 'RFC 826 — Address Resolution Protocol', url: 'https://www.rfc-editor.org/rfc/rfc826' };
const REF_RFC2328 = { label: 'RFC 2328 — OSPF Version 2', url: 'https://www.rfc-editor.org/rfc/rfc2328' };
const REF_RFC4271 = { label: 'RFC 4271 — Border Gateway Protocol 4 (BGP-4)', url: 'https://www.rfc-editor.org/rfc/rfc4271' };
const REF_RFC3022 = { label: 'RFC 3022 — Traditional IP Network Address Translator (NAT)', url: 'https://www.rfc-editor.org/rfc/rfc3022' };
const REF_RFC1157 = { label: 'RFC 1157 — A Simple Network Management Protocol (SNMP)', url: 'https://www.rfc-editor.org/rfc/rfc1157' };
const REF_RFC5424 = { label: 'RFC 5424 — The Syslog Protocol', url: 'https://www.rfc-editor.org/rfc/rfc5424' };
const REF_RFC8200 = { label: 'RFC 8200 — Internet Protocol, Version 6 (IPv6)', url: 'https://www.rfc-editor.org/rfc/rfc8200' };
const REF_NIST_ZT = { label: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final' };
const REF_IEEE_8021Q = { label: 'IEEE 802.1Q — Bridges and Bridged Networks (VLAN tagging)', url: 'https://standards.ieee.org/ieee/802.1Q/10323/' };
const REF_IEEE_8021X = { label: 'IEEE 802.1X — Port-Based Network Access Control', url: 'https://standards.ieee.org/ieee/802.1X/7345/' };
const REF_IEEE_80211 = { label: 'IEEE 802.11 — Wireless LAN', url: 'https://standards.ieee.org/ieee/802.11/7028/' };
const REF_IEEE_8023 = { label: 'IEEE 802.3 — Ethernet', url: 'https://standards.ieee.org/ieee/802.3/10422/' };
const REF_IANA_PORTS = { label: 'IANA — Service Name and Transport Protocol Port Number Registry', url: 'https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml' };
const REF_CISCO_STP = { label: 'Cisco — Understanding Spanning Tree Protocol', url: 'https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/5234-5.html' };
const REF_CISCO_SDN = { label: 'Cisco — Software-Defined Networking (SDN)', url: 'https://www.cisco.com/c/en/us/solutions/software-defined-networking/overview.html' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Networking Concepts (15) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'At which layer of the OSI model do IP addresses operate and routing decisions occur?',
    options: opts4('Layer 2 — Data Link', 'Layer 3 — Network', 'Layer 4 — Transport', 'Layer 7 — Application'),
    correct: ['b'],
    explanation: 'Logical addressing (IPv4/IPv6) and path selection between networks happen at Layer 3, the Network layer. Layer 2 uses MAC addresses for local delivery, Layer 4 handles segmentation and ports, and Layer 7 is the application interface.',
    references: [REF_RFC791]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which transport-layer protocol provides connectionless, best-effort delivery with no retransmission of lost segments?',
    options: opts4('TCP', 'UDP', 'ICMP', 'SCTP'),
    correct: ['b'],
    explanation: 'UDP is connectionless and does not retransmit lost datagrams or guarantee ordering, which makes it suitable for latency-sensitive traffic like VoIP and DNS queries. TCP provides reliable, ordered, connection-oriented delivery.',
    references: [REF_RFC768]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A host has IP address 172.20.45.10/22. What is the network address for this host?',
    options: opts4('172.20.44.0', '172.20.45.0', '172.20.40.0', '172.20.32.0'),
    correct: ['a'],
    explanation: 'A /22 mask (255.255.252.0) groups the third octet in blocks of 4. 45 falls in the 44–47 block, so the network address is 172.20.44.0. The host range is 172.20.44.1–172.20.47.254.',
    references: [REF_RFC4632]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'Which of the following is a private IPv4 address range as defined by RFC 1918?',
    options: opts4('169.254.0.0/16', '10.0.0.0/8', '224.0.0.0/4', '198.51.100.0/24'),
    correct: ['b'],
    explanation: 'RFC 1918 reserves 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 for private use. 169.254.0.0/16 is APIPA/link-local, 224.0.0.0/4 is multicast, and 198.51.100.0/24 is TEST-NET documentation space.',
    references: [REF_RFC1918]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which port and protocol does HTTPS use by default?',
    options: opts4('TCP 80', 'TCP 443', 'UDP 443', 'TCP 8080'),
    correct: ['b'],
    explanation: 'HTTPS (HTTP over TLS) uses TCP port 443 by default. TCP 80 is plain HTTP, and 8080 is a common alternate HTTP proxy port. HTTP/3 can use UDP 443 via QUIC, but classic HTTPS is TCP 443.',
    references: [REF_IANA_PORTS]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL protocols that operate over UDP by default.',
    options: opts4('DNS queries (port 53)', 'SNMP (port 161)', 'SSH (port 22)', 'NTP (port 123)'),
    correct: ['a', 'b', 'd'],
    explanation: 'DNS queries (53), SNMP (161), and NTP (123) use UDP by default for low overhead. SSH uses TCP 22 because it needs a reliable, ordered session. DNS zone transfers fall back to TCP 53.',
    references: [REF_IANA_PORTS, REF_RFC5905]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'How many usable host addresses does a /29 IPv4 subnet provide?',
    options: opts4('8', '6', '4', '14'),
    correct: ['b'],
    explanation: 'A /29 has 3 host bits, giving 2^3 = 8 total addresses. Subtracting the network and broadcast addresses leaves 6 usable host addresses.',
    references: [REF_RFC4632]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which IPv6 address type is the equivalent of an IPv4 RFC 1918 private address, used only within a site?',
    options: opts4('Global unicast (2000::/3)', 'Unique local address (fc00::/7)', 'Link-local (fe80::/10)', 'Multicast (ff00::/8)'),
    correct: ['b'],
    explanation: 'Unique local addresses (fc00::/7, commonly fd00::/8) are routable within an organization but not on the global Internet, analogous to RFC 1918. Link-local (fe80::/10) is confined to a single link.',
    references: [REF_RFC4291]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which topology connects every node to a central device, so a single cable fault isolates only one host?',
    options: opts4('Bus', 'Ring', 'Star', 'Full mesh'),
    correct: ['c'],
    explanation: 'In a star topology each node has a dedicated link to a central switch or hub, so one failed cable affects only that node. A bus or ring fault can disrupt the entire segment.',
    references: [REF_OBJ]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which cloud service model delivers virtual machines, networking, and storage that the customer manages, while the provider manages the underlying hardware?',
    options: opts4('SaaS', 'PaaS', 'IaaS', 'FaaS'),
    correct: ['c'],
    explanation: 'IaaS (Infrastructure as a Service) provides compute, storage, and networking the customer configures. PaaS adds a managed runtime, and SaaS delivers a finished application.',
    references: [REF_OBJ]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'In a software-defined network (SDN), which plane is responsible for making forwarding decisions and is centralized in a controller?',
    options: opts4('Data plane', 'Control plane', 'Management plane', 'Forwarding plane'),
    correct: ['b'],
    explanation: 'SDN decouples the control plane (decision-making/path computation) from the data plane (packet forwarding) and centralizes control logic in a controller. The data plane still forwards traffic in hardware.',
    references: [REF_CISCO_SDN]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'A broadcast domain is bounded by a router; a router does not forward Layer 2 broadcast frames.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Routers separate broadcast domains because they operate at Layer 3 and do not forward Layer 2 broadcast frames. Switches forward broadcasts within a VLAN, extending the broadcast domain.',
    references: [REF_RFC791]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol resolves a known IPv4 address to a MAC address on a local Ethernet segment?',
    options: opts4('DNS', 'ARP', 'DHCP', 'ICMP'),
    correct: ['b'],
    explanation: 'ARP (Address Resolution Protocol) maps a known IPv4 address to its MAC address within a broadcast domain. DNS resolves names to IPs, and DHCP assigns addresses.',
    references: [REF_RFC826]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A datacenter design uses leaf-and-spine architecture instead of a traditional three-tier model primarily to achieve what?',
    options: opts4(
      'Lower port density per switch',
      'Predictable low latency and consistent east-west bandwidth',
      'Elimination of the need for any Layer 3 routing',
      'A single point of aggregation for all traffic'
    ),
    correct: ['b'],
    explanation: 'Leaf-and-spine gives every leaf an equal-cost path to every other leaf through the spine, yielding predictable latency and high east-west throughput for server-to-server traffic. Three-tier designs can bottleneck at aggregation.',
    references: [REF_OBJ]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which maximum cable length is specified for a 1000BASE-T (Gigabit Ethernet over copper) segment?',
    options: opts4('55 meters', '100 meters', '185 meters', '550 meters'),
    correct: ['b'],
    explanation: '1000BASE-T runs over Cat 5e/6 twisted pair up to 100 meters per segment, the same distance limit as 10/100BASE-T. Multimode fiber variants reach much farther.',
    references: [REF_IEEE_8023]
  },

  // ── Network Implementation (13) ──
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which IEEE standard defines VLAN tagging by inserting a 4-byte tag into the Ethernet frame?',
    options: opts4('802.1X', '802.1Q', '802.3af', '802.11ac'),
    correct: ['b'],
    explanation: '802.1Q inserts a 4-byte tag containing the VLAN ID into the Ethernet header for trunking between switches. 802.1X is port-based access control, 802.3af is PoE, and 802.11ac is Wi-Fi.',
    references: [REF_IEEE_8021Q]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A switch port is configured as a trunk. Which configuration carries untagged frames to a specific VLAN on that trunk?',
    options: opts4('Voice VLAN', 'Native VLAN', 'Management VLAN', 'Private VLAN'),
    correct: ['b'],
    explanation: 'On an 802.1Q trunk, untagged frames are placed on the native VLAN. Mismatched native VLANs between switches cause traffic to leak between VLANs and trigger CDP/STP warnings.',
    references: [REF_IEEE_8021Q]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol prevents Layer 2 switching loops by placing redundant links into a blocking state?',
    options: opts4('VRRP', 'STP', 'LACP', 'HSRP'),
    correct: ['b'],
    explanation: 'Spanning Tree Protocol (STP, IEEE 802.1D and successors) builds a loop-free logical topology by blocking redundant links until they are needed. LACP aggregates links; VRRP/HSRP provide gateway redundancy.',
    references: [REF_CISCO_STP]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid characteristics of OSPF.',
    options: opts4(
      'It is a link-state interior gateway protocol',
      'It uses cost (based on bandwidth) as its metric',
      'It is a distance-vector protocol that uses hop count',
      'Routers within an area share an identical link-state database'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'OSPF is a link-state IGP that calculates shortest paths using a cost metric derived from interface bandwidth, and all routers in an area maintain an identical LSDB. RIP—not OSPF—is the hop-count distance-vector protocol.',
    references: [REF_RFC2328]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which routing protocol is the path-vector protocol that exchanges routes between autonomous systems on the Internet?',
    options: opts4('OSPF', 'EIGRP', 'BGP', 'RIPv2'),
    correct: ['c'],
    explanation: 'BGP is the path-vector exterior gateway protocol used to route between autonomous systems across the Internet. OSPF and EIGRP are interior gateway protocols.',
    references: [REF_RFC4271]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which IEEE 802.11 standard introduced operation in the 6 GHz band (Wi-Fi 6E)?',
    options: opts4('802.11n', '802.11ac', '802.11ax', '802.11g'),
    correct: ['c'],
    explanation: '802.11ax (Wi-Fi 6) and its 6 GHz extension (Wi-Fi 6E) add the 6 GHz band along with OFDMA and improved efficiency. 802.11ac operates only in 5 GHz, and 802.11n in 2.4/5 GHz.',
    references: [REF_IEEE_80211]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A wireless deployment must minimize co-channel interference in the 2.4 GHz band. Which channel set should be used?',
    options: opts4('1, 6, 11', '1, 5, 9', '2, 7, 12', '1, 4, 7, 10'),
    correct: ['a'],
    explanation: 'Channels 1, 6, and 11 are the only non-overlapping 20 MHz channels in the 2.4 GHz band in most regulatory domains, so they minimize co-channel and adjacent-channel interference.',
    references: [REF_IEEE_80211]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technology bundles multiple physical Ethernet links into one logical link for bandwidth and redundancy?',
    options: opts4('VLAN trunking', 'Link aggregation (LACP / 802.3ad)', 'Port mirroring', 'Spanning tree'),
    correct: ['b'],
    explanation: 'Link aggregation (LACP, IEEE 802.3ad) bonds multiple physical links into one logical link, increasing throughput and providing failover if a member link fails.',
    references: [REF_IEEE_8023]
  },
  {
    domain: IMPL, difficulty: 1, type: QType.SINGLE,
    stem: 'Which device operates primarily at Layer 2 and forwards frames based on a MAC address table?',
    options: opts4('Router', 'Switch', 'Firewall', 'Load balancer'),
    correct: ['b'],
    explanation: 'A switch builds a MAC address table and forwards frames at Layer 2. A router forwards packets at Layer 3, and a firewall filters traffic, often at Layers 3–7.',
    references: [REF_IEEE_8023]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to extend a VLAN across two datacenters over an IP backbone without stretching Layer 2 directly. Which technology accomplishes this?',
    options: opts4('VXLAN', '802.1Q access port', 'NAT', 'Proxy ARP'),
    correct: ['a'],
    explanation: 'VXLAN encapsulates Layer 2 frames in UDP, allowing VLAN-like segments (VNIs) to be tunneled across a routed Layer 3 backbone between datacenters. A plain 802.1Q access port cannot span an IP core.',
    references: [REF_CISCO_SDN]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which addressing technology lets many internal hosts share one public IPv4 address by translating source ports?',
    options: opts4('Static NAT', 'PAT (NAT overload)', '1:1 NAT', 'DNS round robin'),
    correct: ['b'],
    explanation: 'Port Address Translation (PAT), also called NAT overload, multiplexes many private hosts behind a single public IP by tracking unique source port numbers. Static and 1:1 NAT map addresses one to one.',
    references: [REF_RFC3022]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which IEEE standard supplies Power over Ethernet up to about 25.5 W at the powered device (PoE+)?',
    options: opts4('802.3af', '802.3at', '802.3bt', '802.3ab'),
    correct: ['b'],
    explanation: '802.3at (PoE+) delivers up to ~25.5 W to the device. 802.3af (PoE) supplies ~12.95 W, and 802.3bt (PoE++/4PPoE) raises this to ~60–90 W. 802.3ab is 1000BASE-T.',
    references: [REF_IEEE_8023]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which DHCP component forwards client broadcast discovery messages to a DHCP server on a different subnet?',
    options: opts4('DHCP scope', 'DHCP relay agent (IP helper)', 'DHCP reservation', 'DHCP lease'),
    correct: ['b'],
    explanation: 'A DHCP relay agent (configured as an IP helper on the router/SVI) forwards broadcast DHCP messages as unicast to a server on another subnet, since routers do not forward broadcasts.',
    references: [REF_RFC2131]
  },

  // ── Network Operations (12) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which protocol and port does SNMP use to send unsolicited event notifications (traps) to a manager?',
    options: opts4('UDP 161', 'UDP 162', 'TCP 161', 'TCP 514'),
    correct: ['b'],
    explanation: 'SNMP agents send traps/notifications to the manager on UDP port 162. UDP 161 is used for manager-initiated get/set polling. TCP 514 is associated with rsh; syslog uses UDP 514.',
    references: [REF_RFC1157, REF_IANA_PORTS]
  },
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which protocol synchronizes the clocks of network devices?',
    options: opts4('SNMP', 'NTP', 'NetFlow', 'LLDP'),
    correct: ['b'],
    explanation: 'NTP (Network Time Protocol) keeps device clocks synchronized, which is critical for accurate logs, certificate validation, and correlation across systems. It uses UDP port 123.',
    references: [REF_RFC5905]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol and port is used by syslog to forward log messages to a collector by default?',
    options: opts4('UDP 514', 'TCP 22', 'UDP 161', 'TCP 443'),
    correct: ['a'],
    explanation: 'Syslog traditionally forwards messages over UDP port 514 to a central collector. Reliable transport (RFC 5424/RFC 6587) can use TCP and TLS, but UDP 514 is the classic default.',
    references: [REF_RFC5424]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A network team wants to baseline interface utilization so they can spot anomalies. Which approach BEST establishes a useful baseline?',
    options: opts4(
      'Capture a one-time snapshot during a maintenance window',
      'Collect metrics continuously over a representative period and characterize normal patterns',
      'Rely on user complaints to indicate utilization',
      'Only record peak values once per quarter'
    ),
    correct: ['b'],
    explanation: 'A baseline must reflect normal behavior across representative time periods (including daily and weekly cycles) so deviations can be detected. One-time or quarterly peak snapshots miss normal variation.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which discovery protocol is vendor-neutral and lets devices advertise identity and capabilities to directly connected neighbors?',
    options: opts4('CDP', 'LLDP', 'STP', 'VTP'),
    correct: ['b'],
    explanation: 'LLDP (Link Layer Discovery Protocol, IEEE 802.1AB) is the vendor-neutral neighbor discovery protocol. CDP is Cisco-proprietary and performs a similar function on Cisco gear.',
    references: [REF_IEEE_8023]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that belong in a disaster recovery plan for network services.',
    options: opts4(
      'Recovery time objective (RTO)',
      'Recovery point objective (RPO)',
      'A list of every employee\'s personal social media handles',
      'Documented failover and restoration procedures'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A DR plan defines RTO (how quickly service must be restored), RPO (acceptable data loss window), and documented failover/restore procedures. Employee social media handles are irrelevant to DR.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technology copies traffic from one or more switch ports to a monitoring port for analysis?',
    options: opts4('Port security', 'Port mirroring (SPAN)', 'Port aggregation', 'Port forwarding'),
    correct: ['b'],
    explanation: 'Port mirroring (SPAN) copies frames from source ports/VLANs to a destination port where an analyzer or IDS captures them, without disrupting production traffic.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'In high availability, what does an "active-passive" cluster mean?',
    options: opts4(
      'Both nodes process traffic simultaneously and share load',
      'One node handles traffic while the standby takes over only on failure',
      'Neither node processes traffic until manually started',
      'Traffic is randomly distributed each second'
    ),
    correct: ['b'],
    explanation: 'In active-passive HA, the active node serves traffic while the passive node remains on standby and assumes the role only if the active node fails. Active-active shares load across both.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE,
    stem: 'NetFlow/IPFIX records metadata about traffic flows (such as source/destination, ports, and byte counts) rather than capturing full packet payloads.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Flow records summarize conversations (5-tuple, counters, timestamps) for traffic accounting and anomaly detection. Full packet payload capture requires a separate tool such as a packet analyzer.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A change to a core router must be made. Which practice MOST reduces operational risk?',
    options: opts4(
      'Apply the change during peak hours for faster feedback',
      'Follow a documented change-management process with a rollback plan and maintenance window',
      'Make the change directly without a ticket to save time',
      'Disable logging during the change to reduce noise'
    ),
    correct: ['b'],
    explanation: 'Formal change management—approval, scheduled maintenance window, documented rollback, and post-change verification—reduces risk and provides an audit trail. Logging should stay enabled to capture issues.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which SNMP version adds authentication and encryption for management traffic?',
    options: opts4('SNMPv1', 'SNMPv2c', 'SNMPv3', 'SNMPv2'),
    correct: ['c'],
    explanation: 'SNMPv3 introduces the User-based Security Model with authentication (HMAC) and privacy (encryption). SNMPv1 and SNMPv2c rely on plaintext community strings.',
    references: [REF_RFC1157]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document defines the agreed level of service, uptime, and response targets between a provider and a customer?',
    options: opts4('MOU', 'SLA', 'NDA', 'AUP'),
    correct: ['b'],
    explanation: 'A Service Level Agreement (SLA) specifies measurable service commitments such as uptime percentage and response times. An MOU is a non-binding understanding, an NDA covers confidentiality, and an AUP governs acceptable use.',
    references: [REF_OBJ]
  },

  // ── Network Security (9) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which security model assumes no implicit trust and verifies every request regardless of network location?',
    options: opts4('Perimeter (castle-and-moat) model', 'Zero Trust', 'Open trust model', 'Transitive trust'),
    correct: ['b'],
    explanation: 'Zero Trust (NIST SP 800-207) removes implicit trust based on network location and continuously authenticates and authorizes every request. The traditional perimeter model trusts internal traffic by default.',
    references: [REF_NIST_ZT]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which IEEE standard provides port-based network access control, commonly used with RADIUS for wired/wireless authentication?',
    options: opts4('802.1Q', '802.1X', '802.3af', '802.11i'),
    correct: ['b'],
    explanation: '802.1X provides port-based network access control: a supplicant authenticates to an authenticator (switch/AP), which consults a RADIUS server before opening the port.',
    references: [REF_IEEE_8021X]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker floods a switch with bogus source MAC addresses to overflow the CAM table. Which mitigation directly counters this?',
    options: opts4('DHCP snooping', 'Port security with a MAC limit', 'Dynamic ARP inspection', 'BPDU guard'),
    correct: ['b'],
    explanation: 'Port security limits the number of MAC addresses learned per port and can shut down or restrict the port, directly stopping a CAM (MAC) table flooding attack. The other features address different attacks.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which switch feature prevents a rogue DHCP server by allowing DHCP replies only on trusted ports?',
    options: opts4('DHCP snooping', 'Port mirroring', 'Storm control', 'Root guard'),
    correct: ['a'],
    explanation: 'DHCP snooping builds a binding table and permits DHCP server replies (OFFER/ACK) only on trusted ports, blocking rogue DHCP servers on untrusted access ports.',
    references: [REF_RFC2131]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that help mitigate a man-in-the-middle ARP spoofing attack.',
    options: opts4(
      'Dynamic ARP Inspection (DAI)',
      'DHCP snooping (binding table)',
      'Disabling all logging',
      'Static ARP entries for critical hosts'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'DAI validates ARP packets against the DHCP snooping binding table, and static ARP entries pin critical mappings—both mitigate ARP spoofing. Disabling logging only reduces visibility and helps an attacker.',
    references: [REF_RFC826]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which firewall type tracks the state of connections and allows return traffic for established sessions?',
    options: opts4('Stateless packet filter', 'Stateful inspection firewall', 'Hub', 'Layer 2 switch'),
    correct: ['b'],
    explanation: 'A stateful firewall maintains a connection table and automatically permits return traffic that matches an established session, unlike a stateless filter that evaluates each packet in isolation.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE,
    stem: 'Which wireless security standard introduced Simultaneous Authentication of Equals (SAE) to replace the WPA2 pre-shared key handshake?',
    options: opts4('WEP', 'WPA', 'WPA2', 'WPA3'),
    correct: ['d'],
    explanation: 'WPA3-Personal uses SAE (Dragonfly) to resist offline dictionary attacks and provide forward secrecy, replacing the WPA2 4-way PSK handshake. WEP and WPA are deprecated.',
    references: [REF_IEEE_80211]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company isolates IoT cameras onto their own VLAN with an ACL allowing only the NVR. This BEST illustrates which principle?',
    options: opts4('Defense in depth via network segmentation', 'Security through obscurity', 'Single sign-on', 'Geofencing'),
    correct: ['a'],
    explanation: 'Placing IoT devices on a segmented VLAN with least-privilege ACLs limits lateral movement and the attack surface—an application of network segmentation within defense in depth.',
    references: [REF_NIST_ZT]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technology creates an encrypted tunnel so a remote user can securely access internal resources over the Internet?',
    options: opts4('VLAN', 'VPN', 'NAT', 'VRRP'),
    correct: ['b'],
    explanation: 'A VPN establishes an encrypted tunnel (e.g., IPsec or TLS) over an untrusted network, allowing remote users to securely reach internal resources. NAT, VLANs, and VRRP do not provide encryption.',
    references: [REF_OBJ]
  },

  // ── Network Troubleshooting (16) ──
  {
    domain: TROUBLE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'According to the structured troubleshooting methodology, what is the FIRST step?',
    options: opts4(
      'Establish a plan of action',
      'Identify the problem',
      'Implement the solution',
      'Document findings and outcomes'
    ),
    correct: ['b'],
    explanation: 'The CompTIA troubleshooting methodology begins with identifying the problem (gather information, question users, determine scope) before forming a theory, testing it, planning, implementing, verifying, and documenting.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command tests reachability to a host by sending ICMP echo requests?',
    options: opts4('ping', 'netstat', 'arp', 'nslookup'),
    correct: ['a'],
    explanation: 'ping sends ICMP echo requests and reports replies/round-trip time to test basic Layer 3 reachability. netstat shows connections, arp shows MAC mappings, and nslookup queries DNS.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the Layer 3 path and per-hop latency to a destination?',
    options: opts4('traceroute / tracert', 'ipconfig', 'route print', 'ping -t'),
    correct: ['a'],
    explanation: 'traceroute (tracert on Windows) reveals each Layer 3 hop and round-trip time by incrementing the TTL, helping isolate where latency or packet loss occurs along the path.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'A user can ping by IP address but not by hostname. Which subsystem is the MOST likely cause?',
    options: opts4('Default gateway', 'DNS resolution', 'Physical cabling', 'Switch CAM table'),
    correct: ['b'],
    explanation: 'Successful ping by IP confirms Layer 3 connectivity, so the failure to resolve names points to DNS (wrong resolver, unreachable server, or bad record). Cabling/gateway issues would also break IP connectivity.',
    references: [REF_RFC1035]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A workstation shows an IP address of 169.254.23.7. What does this indicate?',
    options: opts4(
      'A static public IP was assigned',
      'The host failed to obtain a DHCP lease and self-assigned an APIPA address',
      'The host is on the corporate VLAN successfully',
      'The DNS server is misconfigured'
    ),
    correct: ['b'],
    explanation: 'The 169.254.0.0/16 range is APIPA, auto-assigned when a client cannot reach a DHCP server. It indicates a DHCP failure (server down, no relay, or broken link), not a DNS problem.',
    references: [REF_RFC2131]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL plausible causes of intermittent packet loss on a copper Ethernet link.',
    options: opts4(
      'Duplex mismatch between switch and host',
      'Excessive cable length beyond 100 m / EMI',
      'A correctly configured loopback test on an unused port',
      'A failing/oversubscribed uplink causing congestion'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Duplex mismatches, runs exceeding 100 m or near EMI sources, and congested/oversubscribed uplinks all cause intermittent loss. A loopback on an unused port does not affect production traffic.',
    references: [REF_IEEE_8023]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command displays the local ARP cache mapping IP addresses to MAC addresses?',
    options: opts4('arp -a', 'nslookup', 'tracert', 'netstat -r'),
    correct: ['a'],
    explanation: '`arp -a` lists the local ARP cache (IP-to-MAC bindings). `netstat -r` shows the routing table, `nslookup` queries DNS, and `tracert` traces the path.',
    references: [REF_RFC826]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Two PCs in the same VLAN/subnet cannot reach each other, but each reaches the gateway. A switch port shows "err-disabled". What is the MOST likely cause?',
    options: opts4(
      'DNS misconfiguration',
      'Port security or BPDU guard disabled the port after a violation',
      'Incorrect default gateway on both PCs',
      'The Internet circuit is down'
    ),
    correct: ['b'],
    explanation: 'An err-disabled port is typically shut down by a security feature (port security violation, BPDU guard, or loop detection). Since the gateway is reachable, DNS and the WAN are not the issue.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool identifies the specific switch port and cable run a wall jack connects to?',
    options: opts4('Toner probe (tone generator/probe)', 'Spectrum analyzer', 'Loopback plug', 'Multimeter'),
    correct: ['a'],
    explanation: 'A tone generator and inductive probe place a signal on a cable so the technician can trace and identify the matching run/port in a wiring closet. A spectrum analyzer is for RF.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Wi-Fi clients near a microwave oven experience throughput drops on 2.4 GHz. Which tool BEST diagnoses the cause?',
    options: opts4('Cable certifier', 'Spectrum analyzer', 'Protocol analyzer for TCP', 'Multimeter'),
    correct: ['b'],
    explanation: 'A spectrum analyzer visualizes RF energy and non-Wi-Fi interference (e.g., a microwave oven on 2.4 GHz). A cable certifier and multimeter test copper; a TCP analyzer does not see RF.',
    references: [REF_IEEE_80211]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A fiber link is down and the optical power meter reads far below the receiver sensitivity. Which is the MOST likely cause?',
    options: opts4(
      'Duplex mismatch',
      'Excessive attenuation from a dirty/damaged connector or bend',
      'Incorrect VLAN assignment',
      'DHCP scope exhaustion'
    ),
    correct: ['b'],
    explanation: 'Very low received optical power indicates excessive attenuation—commonly a dirty or damaged connector, macrobend, or wrong fiber type. VLAN/DHCP issues do not change optical power.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command on Windows releases and renews a DHCP-assigned IPv4 address?',
    options: opts4('ipconfig /release then ipconfig /renew', 'arp -d', 'route delete', 'netsh winsock reset'),
    correct: ['a'],
    explanation: '`ipconfig /release` drops the current lease and `ipconfig /renew` requests a new one from the DHCP server—useful when a client is stuck on a stale or APIPA address.',
    references: [REF_RFC2131]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Users report a website is "slow" only for large downloads, while small requests are fast. Which metric is the MOST relevant to investigate first?',
    options: opts4('DNS TTL', 'Throughput/bandwidth and link congestion', 'MAC address aging timer', 'STP root bridge ID'),
    correct: ['b'],
    explanation: 'Small requests being fast but large transfers slow points to limited throughput or congestion (saturated uplink, QoS policing, or bandwidth shaping), not DNS or Layer 2 timers.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'After replacing a SOHO router, internal hosts get addresses but cannot reach the Internet, though the router itself can. What should you check FIRST?',
    options: opts4(
      'The host file on each PC',
      'NAT/PAT and the WAN/default route configuration on the new router',
      'The switch MAC aging timer',
      'The wireless channel width'
    ),
    correct: ['b'],
    explanation: 'If the router reaches the Internet but LAN hosts do not, outbound NAT/PAT or the LAN-to-WAN routing is the likely gap. Per-PC host files and Layer 2 timers would not selectively block all outbound traffic.',
    references: [REF_RFC3022]
  },
  {
    domain: TROUBLE, difficulty: 1, type: QType.SINGLE,
    stem: 'After resolving an incident, documenting the findings, actions, and outcomes is part of the troubleshooting methodology.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The final methodology step is to document findings, actions, and outcomes so future incidents can be resolved faster and trends can be analyzed.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'A captured packet trace shows many TCP retransmissions and duplicate ACKs between two hosts. What does this MOST likely indicate?',
    options: opts4(
      'Healthy traffic with no issues',
      'Packet loss or congestion somewhere along the path',
      'A DNS misconfiguration',
      'An incorrect subnet mask on the analyzer'
    ),
    correct: ['b'],
    explanation: 'TCP retransmissions and duplicate ACKs are classic indicators of packet loss or congestion on the path, prompting the sender to resend segments. DNS or analyzer masks do not produce this TCP behavior.',
    references: [REF_RFC793]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Networking Concepts (15) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'At which OSI layer does a TCP segment add source and destination port numbers?',
    options: opts4('Layer 2 — Data Link', 'Layer 3 — Network', 'Layer 4 — Transport', 'Layer 5 — Session'),
    correct: ['c'],
    explanation: 'Port numbers identify applications/services and are added by the Transport layer (Layer 4) in the TCP/UDP header. Layer 3 carries IP addresses; Layer 2 carries MAC addresses.',
    references: [REF_RFC793]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which port does DNS use for standard name-resolution queries?',
    options: opts4('TCP 25', 'UDP 53', 'UDP 67', 'TCP 110'),
    correct: ['b'],
    explanation: 'DNS uses UDP port 53 for typical queries; TCP 53 is used for zone transfers and large responses. UDP 67 is DHCP server, TCP 25 is SMTP, and TCP 110 is POP3.',
    references: [REF_RFC1035]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'You must divide 192.168.10.0/24 into subnets that each support at least 50 hosts with minimal waste. Which prefix length should you use?',
    options: opts4('/25', '/26', '/27', '/28'),
    correct: ['b'],
    explanation: 'A /26 provides 62 usable hosts (2^6 − 2), the smallest subnet that still supports 50 hosts while minimizing waste. A /27 yields only 30 usable hosts.',
    references: [REF_RFC4632]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'Which address is the IPv4 loopback address?',
    options: opts4('0.0.0.0', '127.0.0.1', '255.255.255.255', '169.254.0.1'),
    correct: ['b'],
    explanation: '127.0.0.1 (loopback, the 127.0.0.0/8 block) lets a host address itself for testing the TCP/IP stack. 0.0.0.0 is "this host/any", and 255.255.255.255 is the limited broadcast.',
    references: [REF_RFC791]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol is used by a client to retrieve email and synchronize folders across multiple devices?',
    options: opts4('SMTP (TCP 25)', 'IMAP (TCP 143/993)', 'SNMP (UDP 161)', 'TFTP (UDP 69)'),
    correct: ['b'],
    explanation: 'IMAP (TCP 143, or 993 with TLS) keeps mail on the server and synchronizes folder state across devices. SMTP sends mail; POP3 typically downloads and removes it.',
    references: [REF_IANA_PORTS]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL fields that are part of an IPv4 header.',
    options: opts4('Time to Live (TTL)', 'Source IP address', 'VLAN ID', 'Protocol number'),
    correct: ['a', 'b', 'd'],
    explanation: 'The IPv4 header includes TTL, source/destination addresses, and a Protocol field (e.g., 6=TCP, 17=UDP). The VLAN ID lives in the 802.1Q Ethernet (Layer 2) tag, not the IP header.',
    references: [REF_RFC791]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which IPv6 mechanism lets a host automatically generate an address from a router advertisement prefix without a DHCP server?',
    options: opts4('SLAAC', 'NAT64', 'APIPA', 'Anycast'),
    correct: ['a'],
    explanation: 'Stateless Address Autoconfiguration (SLAAC) uses Router Advertisements (RFC 4861) and the advertised prefix so a host can self-configure a global IPv6 address without DHCPv6.',
    references: [REF_RFC4861]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary purpose of the OSI Presentation layer (Layer 6)?',
    options: opts4(
      'Routing packets between networks',
      'Data translation, encryption, and compression formatting',
      'Physical signaling on the medium',
      'Establishing MAC addressing'
    ),
    correct: ['b'],
    explanation: 'The Presentation layer handles data representation—character encoding translation, encryption/decryption, and compression—so the Application layer receives data in a usable format.',
    references: [REF_OBJ]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A full-mesh topology with 6 nodes requires how many point-to-point links?',
    options: opts4('6', '12', '15', '30'),
    correct: ['c'],
    explanation: 'A full mesh needs n(n−1)/2 links. For 6 nodes that is 6×5/2 = 15 links. Full mesh maximizes redundancy at the cost of cabling and port count.',
    references: [REF_OBJ]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which cloud connectivity option provides a private, dedicated circuit between an on-premises datacenter and a cloud provider, bypassing the public Internet?',
    options: opts4('Site-to-site IPsec VPN over the Internet', 'Direct/private interconnect (e.g., Direct Connect/ExpressRoute)', 'Public NAT gateway', 'DNS delegation'),
    correct: ['b'],
    explanation: 'A direct/private interconnect (cloud provider direct connect or express route) is a dedicated physical circuit offering predictable latency and bandwidth without traversing the public Internet.',
    references: [REF_OBJ]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'In SDN, which interface is used by the controller to program flow entries into network devices?',
    options: opts4('Northbound API', 'Southbound interface (e.g., OpenFlow)', 'East-west link', 'Management VLAN'),
    correct: ['b'],
    explanation: 'The southbound interface (such as OpenFlow or NETCONF) lets the SDN controller push forwarding/flow rules down to switches and routers. Northbound APIs expose the controller to applications.',
    references: [REF_CISCO_SDN]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'A switch operating only at Layer 2 reduces the size of a collision domain but does not by itself reduce a broadcast domain.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Each switch port is its own collision domain, but a Layer 2 switch floods broadcasts to all ports in the same VLAN, so the broadcast domain is unchanged unless VLANs/routing are introduced.',
    references: [REF_IEEE_8023]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol number appears in the IPv4 header for encapsulated TCP traffic?',
    options: opts4('1', '6', '17', '47'),
    correct: ['b'],
    explanation: 'IP protocol number 6 indicates TCP. 1 is ICMP, 17 is UDP, and 47 is GRE. This field tells the receiving stack which transport handler to invoke.',
    references: [REF_RFC791]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which fiber type is typically used for long-distance runs (kilometers) with a small core and a laser source?',
    options: opts4('Multimode (OM3)', 'Single-mode (OS2)', 'Cat 6a copper', 'Twinax'),
    correct: ['b'],
    explanation: 'Single-mode fiber (e.g., OS2) has a ~9 µm core and uses laser sources for long-distance, low-dispersion transmission over many kilometers. Multimode is for shorter datacenter runs.',
    references: [REF_OBJ]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement BEST describes an anycast IPv6/IPv4 address?',
    options: opts4(
      'A single address delivered to all hosts in a subnet',
      'An address assigned to multiple nodes; traffic goes to the nearest one by routing',
      'An address used only for loopback testing',
      'An address that is never routable'
    ),
    correct: ['b'],
    explanation: 'Anycast assigns the same address to multiple nodes; routing delivers a packet to the topologically nearest instance. It is widely used for resilient DNS root and CDN services.',
    references: [REF_RFC4291]
  },

  // ── Network Implementation (13) ──
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A switch port should connect a single end device and immediately transition to forwarding without waiting through STP listening/learning. Which feature is appropriate?',
    options: opts4('PortFast (edge port)', 'Trunk mode', 'Root guard', 'BPDU flooding'),
    correct: ['a'],
    explanation: 'PortFast (edge port) skips the STP listening/learning delay for access ports connected to end hosts so they come up quickly. It should be paired with BPDU guard to prevent loops if a switch is plugged in.',
    references: [REF_CISCO_STP]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'Two switches connected by a single 802.1Q trunk have mismatched native VLANs (VLAN 1 vs VLAN 99). What is the MOST likely consequence?',
    options: opts4(
      'No impact; native VLAN is cosmetic',
      'Untagged traffic crosses between the two different VLANs (VLAN hopping risk)',
      'The trunk converts to an access port automatically',
      'All tagged VLANs stop working'
    ),
    correct: ['b'],
    explanation: 'A native VLAN mismatch causes untagged frames sent on one side to be received into a different VLAN on the other, leaking traffic between VLANs and creating a VLAN-hopping risk.',
    references: [REF_IEEE_8021Q]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which first-hop redundancy protocol is an open standard that provides a virtual default gateway IP shared by multiple routers?',
    options: opts4('HSRP', 'VRRP', 'GLBP', 'STP'),
    correct: ['b'],
    explanation: 'VRRP is the IETF open-standard first-hop redundancy protocol providing a shared virtual gateway. HSRP and GLBP are Cisco-proprietary; STP is a loop-prevention protocol.',
    references: [REF_OBJ]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about distance-vector vs link-state routing protocols.',
    options: opts4(
      'RIP is a distance-vector protocol that uses hop count',
      'OSPF builds a topology map and runs SPF (Dijkstra)',
      'Distance-vector protocols always converge faster than link-state',
      'BGP is a path-vector protocol used between autonomous systems'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'RIP is distance-vector (hop count), OSPF is link-state running SPF, and BGP is path-vector between ASes. Distance-vector protocols generally converge slower, not faster, than link-state.',
    references: [REF_RFC2328, REF_RFC4271]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which wireless frequency band generally offers higher throughput but shorter range and less wall penetration?',
    options: opts4('2.4 GHz', '5 GHz', '900 MHz', '433 MHz'),
    correct: ['b'],
    explanation: '5 GHz offers more non-overlapping channels and higher throughput but attenuates faster through walls and over distance than 2.4 GHz, which has better range but more interference and fewer channels.',
    references: [REF_IEEE_80211]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'A point-to-point connection between two buildings several hundred meters apart needs a copper-incompatible, EMI-immune medium. What is the BEST choice?',
    options: opts4('Cat 6 UTP', 'Fiber optic cable', 'Coaxial RG-6', 'Cat 5e UTP'),
    correct: ['b'],
    explanation: 'Fiber is immune to EMI and supports distances well beyond the 100 m copper limit, making it the right choice for inter-building runs of several hundred meters.',
    references: [REF_OBJ]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'You need inter-VLAN routing on a Layer 3 switch. Which interface type provides a routed gateway for each VLAN?',
    options: opts4('Switched Virtual Interface (SVI)', 'Trunk port', 'Access port', 'Loopback only'),
    correct: ['a'],
    explanation: 'An SVI (interface vlan X) gives each VLAN a Layer 3 gateway on a multilayer switch, enabling inter-VLAN routing without an external router-on-a-stick.',
    references: [REF_IEEE_8021Q]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which connector is commonly used to terminate single-mode/multimode fiber with a push-pull latching, 2.5 mm ferrule?',
    options: opts4('RJ45', 'LC', 'SC', 'BNC'),
    correct: ['c'],
    explanation: 'The SC connector uses a 2.5 mm ferrule with a push-pull latch. LC uses a smaller 1.25 mm ferrule (small form factor), RJ45 is for twisted pair, and BNC is for coax.',
    references: [REF_OBJ]
  },
  {
    domain: IMPL, difficulty: 1, type: QType.SINGLE,
    stem: 'Which device terminates an ISP circuit and converts the carrier signal to Ethernet the customer router can use (the demarcation device)?',
    options: opts4('Modem/ONT (demarc)', 'Layer 2 switch', 'Wireless access point', 'Patch panel'),
    correct: ['a'],
    explanation: 'A modem or optical network terminal (ONT) sits at the demarcation point and converts the provider signal to a customer-usable handoff. A patch panel is passive cabling termination.',
    references: [REF_OBJ]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A static route of last resort must send all unknown traffic to 203.0.113.1. Which route entry is correct?',
    options: opts4('192.168.0.0/16 via 203.0.113.1', '0.0.0.0/0 via 203.0.113.1', '127.0.0.0/8 via 203.0.113.1', '224.0.0.0/4 via 203.0.113.1'),
    correct: ['b'],
    explanation: 'A default route uses the prefix 0.0.0.0/0, matching any destination not covered by a more specific route, and forwards it to the specified next hop (here 203.0.113.1).',
    references: [REF_RFC4632]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technology assigns IP configuration automatically and can deliver options such as default gateway, DNS servers, and lease time?',
    options: opts4('DNS', 'DHCP', 'ARP', 'ICMP'),
    correct: ['b'],
    explanation: 'DHCP leases IP addresses and pushes options like default gateway (option 3), DNS servers (option 6), and lease duration to clients, reducing manual configuration.',
    references: [REF_RFC2131]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which wiring standard pinout is used on both ends of a straight-through Ethernet patch cable in a typical modern deployment?',
    options: opts4('T568A on one end, T568B on the other', 'T568B on both ends', 'RS-232 pinout', 'TIA crossover only'),
    correct: ['b'],
    explanation: 'A straight-through cable uses the same pinout (commonly T568B) on both ends. Using T568A on one end and T568B on the other creates a crossover cable.',
    references: [REF_OBJ]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A campus needs seamless client roaming between many access points on one SSID with centralized RF management. Which architecture BEST fits?',
    options: opts4(
      'Standalone (autonomous) APs each configured independently',
      'A wireless LAN controller (WLC) managing lightweight APs',
      'A single high-power AP for the whole campus',
      'Ad-hoc mode between clients'
    ),
    correct: ['b'],
    explanation: 'A WLC with lightweight APs centralizes configuration, RF/channel management, and fast roaming across many APs sharing one SSID—far more scalable than independently managed autonomous APs.',
    references: [REF_IEEE_80211]
  },

  // ── Network Operations (12) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which metric expresses the difference between the highest and lowest one-way delay of packets and is critical for VoIP quality?',
    options: opts4('Throughput', 'Jitter', 'MTU', 'TTL'),
    correct: ['b'],
    explanation: 'Jitter is the variation in packet delay. High jitter degrades real-time media like VoIP/video; jitter buffers and QoS prioritization mitigate it.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which QoS mechanism prioritizes latency-sensitive traffic (e.g., voice) over bulk data on a congested link?',
    options: opts4('Random MAC assignment', 'Traffic classification and queuing (e.g., DSCP marking)', 'Disabling the interface', 'Increasing TTL'),
    correct: ['b'],
    explanation: 'QoS classifies/marks traffic (e.g., DSCP EF for voice) and uses priority/weighted queuing so latency-sensitive flows are serviced first during congestion.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which document captures the physical and logical layout of network devices and connections for operational reference?',
    options: opts4('Network diagram/topology documentation', 'End-user license agreement', 'Privacy policy', 'Marketing brief'),
    correct: ['a'],
    explanation: 'Up-to-date physical and logical network diagrams are essential operational documentation for troubleshooting, change planning, and onboarding.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A monitoring system should alert when a WAN link exceeds 80% utilization for 10 minutes. Which configuration concept BEST implements this?',
    options: opts4(
      'A static threshold alert on the interface utilization metric',
      'Disabling SNMP polling',
      'Logging only at device boot',
      'Capturing full packets continuously'
    ),
    correct: ['a'],
    explanation: 'A threshold-based alert (sustained utilization > 80% for a defined duration) on a polled SNMP/flow metric is the standard way to notify operators of congestion before it impacts users.',
    references: [REF_RFC1157]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which backup strategy keeps three copies of data on two media types with one copy offsite?',
    options: opts4('1-1-1 rule', '3-2-1 rule', 'RAID 0 only', 'Full backup only, weekly'),
    correct: ['b'],
    explanation: 'The 3-2-1 rule (three copies, two different media, one offsite) is a widely recommended backup practice that improves resilience against hardware failure, corruption, and site loss.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid uses of SNMP in network operations.',
    options: opts4(
      'Polling interface counters for utilization graphs',
      'Receiving trap notifications for link-down events',
      'Encrypting all user web traffic',
      'Retrieving device CPU and memory via OIDs'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'SNMP polls OIDs for counters/CPU/memory and receives traps for events like link-down. It does not encrypt user web traffic; SNMPv3 only secures the management messages themselves.',
    references: [REF_RFC1157]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which term describes the maximum tolerable period of data loss after an outage, expressed as a point in time?',
    options: opts4('RTO', 'RPO', 'MTTR', 'MTBF'),
    correct: ['b'],
    explanation: 'RPO (Recovery Point Objective) defines how much data loss is acceptable—essentially how far back the last good backup/replication point may be. RTO is how fast service must return.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which configuration management practice ensures device configs can be restored quickly after a failure?',
    options: opts4('Never saving running configs', 'Regular automated configuration backups with version control', 'Editing devices only via console without records', 'Disabling NTP'),
    correct: ['b'],
    explanation: 'Automated, versioned configuration backups let operators audit changes and rapidly restore a known-good config after a failure or bad change.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE,
    stem: 'Accurate, synchronized time (e.g., via NTP) across devices is important for correlating log events during an investigation.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Without synchronized clocks, log timestamps across devices cannot be reliably correlated, making incident analysis and forensics far harder.',
    references: [REF_RFC5905]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An operations team wants per-conversation traffic accounting (top talkers) without storing full payloads. Which technology fits BEST?',
    options: opts4('Full packet capture on every link', 'Flow export (NetFlow/IPFIX/sFlow)', 'Syslog only', 'ICMP sweeps'),
    correct: ['b'],
    explanation: 'Flow export summarizes conversations (5-tuple, bytes, packets) so teams can identify top talkers and trends with far less storage than full packet capture.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agreement type is an internal, non-contractual statement of intent between departments of the same organization?',
    options: opts4('SLA', 'MOU', 'SOW', 'MSA'),
    correct: ['b'],
    explanation: 'An MOU (Memorandum of Understanding) records mutual intent and is typically non-binding, often used internally. An SLA defines measurable service commitments and is usually contractual.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice reduces the chance that an unplanned change causes an outage?',
    options: opts4('Skipping testing in staging', 'Peer review and a tested rollback plan before implementation', 'Making changes only in production with no backups', 'Removing change documentation'),
    correct: ['b'],
    explanation: 'Peer review, testing in staging, and a verified rollback plan are core change-management controls that lower the risk of an outage from a faulty change.',
    references: [REF_OBJ]
  },

  // ── Network Security (9) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which AAA protocol encrypts the entire packet payload and separates authentication, authorization, and accounting (commonly used for device administration)?',
    options: opts4('RADIUS', 'TACACS+', 'LDAP', 'Kerberos'),
    correct: ['b'],
    explanation: 'TACACS+ encrypts the full packet body and separates AAA functions, making it well suited to granular device administration. RADIUS encrypts only the password and combines authentication/authorization.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker connects an unauthorized switch and sends superior BPDUs to become the STP root, redirecting traffic. Which feature mitigates this?',
    options: opts4('Root guard', 'PortFast everywhere', 'Disabling STP', 'Increasing MTU'),
    correct: ['a'],
    explanation: 'Root guard prevents a port from accepting superior BPDUs that would make an unauthorized switch the root bridge, blocking an STP root-takeover attack. Disabling STP would invite loops.',
    references: [REF_CISCO_STP]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which network design element is a screened subnet that exposes public-facing services while shielding the internal LAN?',
    options: opts4('DMZ (screened subnet)', 'Management VLAN', 'Loopback interface', 'Broadcast domain'),
    correct: ['a'],
    explanation: 'A DMZ/screened subnet hosts Internet-facing services between two filtering boundaries so a compromise there does not directly expose the internal network.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control verifies a device\'s posture (patch level, AV) before granting full network access?',
    options: opts4('NAC (Network Access Control)', 'NAT', 'STP', 'QoS'),
    correct: ['a'],
    explanation: 'NAC evaluates endpoint posture and identity before authorizing access, often quarantining non-compliant devices to a remediation VLAN.',
    references: [REF_IEEE_8021X]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that support a Zero Trust approach.',
    options: opts4(
      'Least-privilege access enforced per request',
      'Continuous authentication and device posture checks',
      'Implicit trust for any device on the internal LAN',
      'Microsegmentation between workloads'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Zero Trust enforces least privilege per request, continuously verifies identity/posture, and microsegments workloads. Implicitly trusting internal devices is exactly what Zero Trust rejects.',
    references: [REF_NIST_ZT]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which attack floods a target with traffic from many compromised hosts to exhaust resources?',
    options: opts4('Phishing', 'DDoS', 'SQL injection', 'ARP poisoning'),
    correct: ['b'],
    explanation: 'A Distributed Denial of Service (DDoS) attack uses many sources (often a botnet) to overwhelm bandwidth or resources. Mitigations include scrubbing services, rate limiting, and anycast.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE,
    stem: 'Which protocol provides confidentiality and integrity for site-to-site VPN tunnels at Layer 3?',
    options: opts4('Telnet', 'IPsec', 'HTTP', 'SNMPv2c'),
    correct: ['b'],
    explanation: 'IPsec (ESP/AH with IKE) provides authentication, integrity, and encryption for Layer 3 tunnels, commonly used for site-to-site VPNs. Telnet/HTTP/SNMPv2c are not encrypted by themselves.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A guest Wi-Fi network should let visitors reach the Internet but never the internal corporate LAN. Which design BEST enforces this?',
    options: opts4(
      'Place guests on a separate VLAN/SSID with an ACL or firewall blocking RFC 1918 internal ranges',
      'Share the corporate SSID and rely on user honesty',
      'Use the same VLAN as employees but a different password',
      'Disable encryption to simplify access'
    ),
    correct: ['a'],
    explanation: 'Isolating guests on their own VLAN/SSID and applying an ACL/firewall rule that blocks access to internal subnets enforces separation regardless of user behavior.',
    references: [REF_RFC1918]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice hardens a managed switch against unauthorized administrative access?',
    options: opts4(
      'Leaving default credentials in place',
      'Using SSH instead of Telnet and disabling unused services',
      'Enabling Telnet on all VLANs',
      'Sharing one admin account with no logging'
    ),
    correct: ['b'],
    explanation: 'Replacing Telnet with SSH (encrypted management), changing default credentials, and disabling unused services/ports are core device-hardening steps that reduce attack surface.',
    references: [REF_OBJ]
  },

  // ── Network Troubleshooting (16) ──
  {
    domain: TROUBLE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In the troubleshooting methodology, what should you do immediately AFTER establishing a theory of probable cause?',
    options: opts4(
      'Document the outcome',
      'Test the theory to determine the cause',
      'Escalate to a vendor',
      'Replace all hardware'
    ),
    correct: ['b'],
    explanation: 'After forming a theory you test it to confirm or refute the probable cause. If confirmed you plan and implement; if not, you form a new theory or escalate.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which command displays a Windows host\'s IP address, subnet mask, and default gateway?',
    options: opts4('ipconfig', 'tracert', 'nslookup', 'pathping'),
    correct: ['a'],
    explanation: '`ipconfig` (`ifconfig`/`ip addr` on Linux) shows the interface IP, mask, and gateway, the first thing to check when a host has connectivity problems.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'A host has IP 10.1.1.50/24 and gateway 10.1.2.1. It can reach local hosts but not other subnets. What is the root cause?',
    options: opts4(
      'DNS server is down',
      'The default gateway is not in the host\'s subnet, so off-subnet traffic has no valid next hop',
      'The cable is faulty',
      'The switch port is in the wrong VLAN'
    ),
    correct: ['b'],
    explanation: 'With a /24, the host (10.1.1.50) and gateway (10.1.2.1) are in different subnets, so the host cannot ARP for the gateway and off-subnet traffic fails while local traffic still works.',
    references: [REF_RFC4632]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command queries DNS to resolve a hostname and can specify a particular DNS server?',
    options: opts4('nslookup / dig', 'arp -a', 'route print', 'ping -n'),
    correct: ['a'],
    explanation: '`nslookup` and `dig` query DNS and can target a specific server (e.g., `dig @8.8.8.8 example.com`), helping isolate resolver vs. record problems.',
    references: [REF_RFC1035]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL symptoms consistent with a duplex mismatch on a 100/1000 link.',
    options: opts4(
      'Late collisions and CRC/FCS errors on the half-duplex side',
      'Severely reduced throughput under load',
      'Link does not come up at all',
      'Increasing input/runt errors'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A duplex mismatch typically still establishes link but produces late collisions, CRC/FCS and runt errors, and poor throughput under load. A complete failure to link is usually a different fault.',
    references: [REF_IEEE_8023]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A new VoIP phone gets no power from the switch. Which check is MOST relevant first?',
    options: opts4(
      'DNS server reachability',
      'Whether the switch port/switch supports and has PoE enabled with sufficient budget',
      'The phone\'s ringtone settings',
      'The DHCP lease time'
    ),
    correct: ['b'],
    explanation: 'If a PoE device gets no power, verify the port supports PoE/PoE+, that PoE is enabled, and that the switch power budget is not exhausted before looking at higher-layer settings.',
    references: [REF_IEEE_8023]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool measures end-to-end cable length and locates a break or short by signal reflection (TDR)?',
    options: opts4('Cable tester / TDR', 'Spectrum analyzer', 'Protocol analyzer', 'Light meter'),
    correct: ['a'],
    explanation: 'A Time Domain Reflectometer (often built into a cable tester) sends a pulse and measures reflections to locate breaks, shorts, or the cable length on copper.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Half of a subnet\'s clients suddenly get wrong IPs and lose connectivity, while statically addressed hosts are fine. What is the MOST likely cause?',
    options: opts4(
      'A rogue DHCP server is handing out bad leases',
      'The DNS root servers are down',
      'STP recalculated the root bridge',
      'The cable certifier is plugged in'
    ),
    correct: ['a'],
    explanation: 'Dynamic clients receiving wrong addresses while static hosts work points to a rogue/misconfigured DHCP server. DHCP snooping with trusted ports prevents this.',
    references: [REF_RFC2131]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which utility combines ping and traceroute to show per-hop packet loss over time (Windows)?',
    options: opts4('pathping', 'arp', 'getmac', 'hostname'),
    correct: ['a'],
    explanation: '`pathping` (similar to `mtr` on Linux) traces the path and then measures per-hop latency and loss over time, helping pinpoint a lossy hop.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Two devices have the same IP address; one or both lose connectivity intermittently and the OS logs an address conflict. What is the FIRST corrective action?',
    options: opts4(
      'Replace both network cables',
      'Identify and remove the duplicate static assignment or fix the DHCP scope/reservation',
      'Reboot the core switch',
      'Disable DNS'
    ),
    correct: ['b'],
    explanation: 'An IP address conflict is resolved by finding the duplicate assignment—usually a static IP overlapping the DHCP pool—and correcting it, not by replacing hardware.',
    references: [REF_RFC2131]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A server\'s NIC shows link at 100 Mbps but is connected to a Gigabit switch with good Cat 6 cable. Which is the MOST likely cause?',
    options: opts4(
      'A damaged pair limiting the link to 100 Mbps, or a forced speed setting',
      'DNS misconfiguration',
      'Wrong default gateway',
      'Firewall ACL blocking traffic'
    ),
    correct: ['a'],
    explanation: 'A Gigabit link falling back to 100 Mbps often means a broken/miswired pair (only two pairs usable) or a hard-coded speed setting. DNS/gateway/ACL issues do not change negotiated link speed.',
    references: [REF_IEEE_8023]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'After a fiber patch is reseated, the link is up but error counters climb and throughput is poor. Which is the MOST likely cause?',
    options: opts4(
      'Dirty or improperly seated fiber connector causing high insertion loss',
      'DHCP exhaustion',
      'Wrong SNMP community string',
      'Spanning tree topology change'
    ),
    correct: ['a'],
    explanation: 'A contaminated or poorly seated fiber endface raises insertion loss and error rates even though link is established. Cleaning/reseating the connector with proper inspection resolves it.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command shows the active TCP/UDP connections and listening ports on a host?',
    options: opts4('netstat / ss', 'arp -a', 'tracert', 'ipconfig /all'),
    correct: ['a'],
    explanation: '`netstat` (or `ss` on Linux) lists active connections and listening sockets, useful for confirming whether a service is bound and which ports are open.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Clients on one VLAN cannot reach a server on another VLAN, but devices within each VLAN work fine. Pings to the inter-VLAN gateway fail from the client VLAN. What should you check FIRST?',
    options: opts4(
      'The SVI/router interface for that VLAN is down or missing an IP',
      'The server\'s antivirus signatures',
      'The client\'s browser cache',
      'The wireless channel plan'
    ),
    correct: ['a'],
    explanation: 'Intra-VLAN works but inter-VLAN fails and the gateway is unreachable—this points to the Layer 3 SVI/router interface for that VLAN being shut, missing an address, or not routing.',
    references: [REF_IEEE_8021Q]
  },
  {
    domain: TROUBLE, difficulty: 1, type: QType.SINGLE,
    stem: 'When troubleshooting, you should consider whether a recent change caused the problem as part of identifying the issue.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Determining whether anything changed (config, firmware, cabling, environment) is a key part of identifying the problem and often points straight to the root cause.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports "the Internet is down," but internal file shares and email work and the default gateway pings. What is the MOST likely scope?',
    options: opts4(
      'Total network outage',
      'A WAN/ISP or upstream DNS issue affecting external access only',
      'A failed switch in the access closet',
      'A bad NIC on the user PC'
    ),
    correct: ['b'],
    explanation: 'Internal services and the gateway working while external access fails narrows the scope to the WAN circuit, edge router, or external DNS rather than the local LAN or NIC.',
    references: [REF_OBJ]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Networking Concepts (15) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OSI layer is responsible for end-to-end segmentation, flow control, and reliable delivery?',
    options: opts4('Layer 2 — Data Link', 'Layer 3 — Network', 'Layer 4 — Transport', 'Layer 6 — Presentation'),
    correct: ['c'],
    explanation: 'The Transport layer (Layer 4) handles segmentation, flow/error control, and—via TCP—reliable, ordered delivery between end systems. Layer 3 handles addressing/routing.',
    references: [REF_RFC793]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which port does SSH use by default for secure remote administration?',
    options: opts4('TCP 22', 'TCP 23', 'UDP 69', 'TCP 3389'),
    correct: ['a'],
    explanation: 'SSH uses TCP port 22 and provides an encrypted session, replacing insecure Telnet (TCP 23). TCP 3389 is RDP and UDP 69 is TFTP.',
    references: [REF_IANA_PORTS]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Given 10.10.0.0/16, how many /24 subnets can be created from it?',
    options: opts4('128', '254', '256', '65,536'),
    correct: ['c'],
    explanation: 'Going from /16 to /24 borrows 8 bits, yielding 2^8 = 256 subnets (10.10.0.0/24 through 10.10.255.0/24), each with 254 usable hosts.',
    references: [REF_RFC4632]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'Which protocol provides connection-oriented, reliable transport with a three-way handshake?',
    options: opts4('UDP', 'TCP', 'ICMP', 'ARP'),
    correct: ['b'],
    explanation: 'TCP establishes a session with a SYN, SYN-ACK, ACK three-way handshake and provides reliable, ordered delivery via sequence numbers and acknowledgments.',
    references: [REF_RFC793]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which record type in DNS maps a hostname to an IPv6 address?',
    options: opts4('A', 'AAAA', 'MX', 'CNAME'),
    correct: ['b'],
    explanation: 'An AAAA ("quad-A") record maps a name to an IPv6 address. An A record maps to IPv4, MX designates mail servers, and CNAME is an alias.',
    references: [REF_RFC1035]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that are true about IPv6.',
    options: opts4(
      'Addresses are 128 bits long',
      'IPv6 uses broadcast addresses for local discovery',
      'Neighbor Discovery replaces ARP',
      'Link-local addresses use the fe80::/10 range'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'IPv6 addresses are 128 bits, use Neighbor Discovery (ICMPv6) instead of ARP, and reserve fe80::/10 for link-local. IPv6 has no broadcast; it uses multicast/anycast instead.',
    references: [REF_RFC8200, REF_RFC4861]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which value is the default MTU for a standard Ethernet (IEEE 802.3) frame payload?',
    options: opts4('576 bytes', '1500 bytes', '9000 bytes', '64 bytes'),
    correct: ['b'],
    explanation: 'Standard Ethernet uses a 1500-byte MTU. 9000 bytes is a jumbo frame (non-standard, must be enabled end to end); 64 bytes is the minimum Ethernet frame size.',
    references: [REF_IEEE_8023]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which deployment model combines on-premises infrastructure with public cloud, with orchestration between them?',
    options: opts4('Private cloud only', 'Hybrid cloud', 'Community cloud', 'Bare-metal only'),
    correct: ['b'],
    explanation: 'A hybrid cloud integrates on-premises/private infrastructure with public cloud and orchestrates workloads/data between them, enabling cloud bursting and gradual migration.',
    references: [REF_OBJ]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'In the TCP/IP model, the Internet layer corresponds roughly to the OSI Network layer.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The TCP/IP Internet layer (IP, ICMP) maps to the OSI Network layer (Layer 3); the TCP/IP Transport layer maps to OSI Layer 4.',
    references: [REF_RFC791]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A point-to-point WAN link between two routers needs the smallest subnet that still allows two host addresses. Which prefix is BEST?',
    options: opts4('/30', '/29', '/28', '/24'),
    correct: ['a'],
    explanation: 'A /30 provides exactly 2 usable host addresses (4 total minus network and broadcast), the classic choice for a router-to-router point-to-point link (or /31 per RFC 3021 where supported).',
    references: [REF_RFC4632]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technology virtualizes network functions (firewall, load balancer) as software running on commodity servers?',
    options: opts4('NFV (Network Functions Virtualization)', 'PoE', 'STP', 'CDP'),
    correct: ['a'],
    explanation: 'NFV runs network functions (firewalls, routers, load balancers) as software/VMs on standard hardware, decoupling them from purpose-built appliances and complementing SDN.',
    references: [REF_CISCO_SDN]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which address does a host use as the destination for a limited broadcast on the local subnet?',
    options: opts4('0.0.0.0', '255.255.255.255', '127.0.0.1', '224.0.0.1'),
    correct: ['b'],
    explanation: '255.255.255.255 is the limited broadcast address, delivered to all hosts on the local segment but not forwarded by routers. 224.0.0.1 is the all-hosts multicast group.',
    references: [REF_RFC791]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement BEST distinguishes a collision domain from a broadcast domain?',
    options: opts4(
      'They are always identical in size',
      'A switch port is its own collision domain, while a VLAN/router boundary defines a broadcast domain',
      'A hub separates broadcast domains',
      'Routers extend collision domains'
    ),
    correct: ['b'],
    explanation: 'Each switch port is a separate collision domain (full duplex effectively eliminates collisions), whereas a broadcast domain spans a VLAN and is bounded by a router (Layer 3).',
    references: [REF_IEEE_8023]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol allows a client to obtain the time from a server and is essential for log correlation and certificate validation?',
    options: opts4('SMTP', 'NTP', 'FTP', 'POP3'),
    correct: ['b'],
    explanation: 'NTP synchronizes clocks across the network. Accurate time is critical for correlating logs, validating certificates (notBefore/notAfter), and Kerberos authentication.',
    references: [REF_RFC5905]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which characteristic distinguishes a Type-1 (bare-metal) hypervisor used in virtualized network/datacenter designs?',
    options: opts4(
      'It runs as an application on top of a host operating system',
      'It runs directly on the physical hardware without a host OS',
      'It cannot host more than one virtual machine',
      'It requires no CPU virtualization support'
    ),
    correct: ['b'],
    explanation: 'A Type-1 hypervisor runs directly on hardware (e.g., ESXi, Hyper-V Server), offering better performance and isolation for datacenter virtualization. Type-2 hypervisors run atop a host OS.',
    references: [REF_OBJ]
  },

  // ── Network Implementation (13) ──
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which feature should be enabled on access ports together with PortFast to drop the port if it receives a BPDU (preventing accidental switch loops)?',
    options: opts4('BPDU guard', 'Trunk negotiation', 'Proxy ARP', 'Jumbo frames'),
    correct: ['a'],
    explanation: 'BPDU guard err-disables a PortFast access port if it ever receives a BPDU, protecting against an unauthorized switch creating a loop. PortFast alone does not provide that protection.',
    references: [REF_CISCO_STP]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A router-on-a-stick configuration uses one physical interface for multiple VLANs. What is required on that interface and the connected switch port?',
    options: opts4(
      'An access port and a single subnet',
      'Subinterfaces with 802.1Q tags on the router and a trunk port on the switch',
      'A crossover cable only',
      'Disabling all VLANs'
    ),
    correct: ['b'],
    explanation: 'Router-on-a-stick uses 802.1Q subinterfaces (one per VLAN, each with its own IP) on the router, connected to a switch trunk port carrying all those VLANs.',
    references: [REF_IEEE_8021Q]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which routing concept is used when a router has multiple routes and selects the one with the longest prefix match?',
    options: opts4('Administrative distance', 'Longest prefix match (most specific route)', 'Split horizon', 'Route summarization'),
    correct: ['b'],
    explanation: 'When multiple routes match a destination, the router forwards using the most specific (longest prefix) route. Administrative distance breaks ties only between routes of equal prefix length from different sources.',
    references: [REF_RFC4632]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about wireless deployment.',
    options: opts4(
      '5 GHz generally supports more non-overlapping channels than 2.4 GHz',
      'Channel bonding increases throughput but reduces the number of available channels',
      'Lowering AP transmit power always improves coverage',
      'Overlapping cells with the same channel cause co-channel interference'
    ),
    correct: ['a', 'b', 'd'],
    explanation: '5 GHz has many more non-overlapping channels; channel bonding raises throughput at the cost of channel count; and same-channel overlapping cells cause co-channel interference. Lowering power reduces, not improves, coverage.',
    references: [REF_IEEE_80211]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which copper cable category is the minimum recommended for reliable 1000BASE-T (Gigabit) operation?',
    options: opts4('Cat 3', 'Cat 5', 'Cat 5e', 'Cat 1'),
    correct: ['c'],
    explanation: 'Cat 5e is the minimum recommended category for reliable 1000BASE-T. Cat 6/6a improve headroom and support 10GBASE-T over shorter/standard distances.',
    references: [REF_IEEE_8023]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which device is BEST suited to distribute incoming client requests across a pool of backend servers?',
    options: opts4('Load balancer', 'Repeater', 'Media converter', 'Patch panel'),
    correct: ['a'],
    explanation: 'A load balancer distributes client connections across a server pool using algorithms (round robin, least connections) and health checks, improving scalability and availability.',
    references: [REF_OBJ]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'You must connect a 10 Gigabit switch uplink over 300 m within a datacenter. Which medium is the BEST fit?',
    options: opts4('Cat 6 UTP', 'Multimode fiber (OM4) with SFP+', 'Cat 3 UTP', 'RG-59 coax'),
    correct: ['b'],
    explanation: 'OM4 multimode fiber with 10G SFP+ optics supports 10 GbE well beyond the ~30–100 m copper limit for 10GBASE-T, making it appropriate for a 300 m datacenter uplink.',
    references: [REF_OBJ]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which DHCP message sequence correctly represents a client obtaining a new lease?',
    options: opts4(
      'Discover, Offer, Request, Acknowledge',
      'Request, Offer, Discover, Acknowledge',
      'Offer, Discover, Acknowledge, Request',
      'Acknowledge, Request, Offer, Discover'
    ),
    correct: ['a'],
    explanation: 'DHCP uses the DORA sequence: client broadcasts DISCOVER, server sends OFFER, client sends REQUEST, server replies ACK to confirm the lease.',
    references: [REF_RFC2131]
  },
  {
    domain: IMPL, difficulty: 1, type: QType.SINGLE,
    stem: 'Which connector type is used to terminate twisted-pair Ethernet on an end host?',
    options: opts4('RJ45 (8P8C)', 'LC', 'ST', 'F-type'),
    correct: ['a'],
    explanation: 'RJ45 (8P8C) is the standard modular connector for twisted-pair Ethernet. LC/ST are fiber connectors and F-type is used for coaxial cable.',
    references: [REF_OBJ]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A network must prefer an OSPF-learned route over a RIP-learned route to the same prefix. What determines the winner?',
    options: opts4(
      'The route with the higher metric value',
      'The protocol with the lower administrative distance (OSPF 110 vs RIP 120)',
      'Whichever route was installed first',
      'The route with the larger subnet mask only'
    ),
    correct: ['b'],
    explanation: 'For routes to the same prefix from different protocols, the router prefers the lower administrative distance. OSPF (110) is preferred over RIP (120) by default.',
    references: [REF_RFC2328]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technology aggregates two switches so they appear as one logical switch to downstream devices for active-active uplinks?',
    options: opts4('Switch stacking / MLAG', 'Port mirroring', 'Proxy ARP', 'DHCP relay'),
    correct: ['a'],
    explanation: 'Switch stacking or MLAG presents multiple physical switches as one logical device, allowing a downstream device to form a single LAG across both for active-active redundancy.',
    references: [REF_IEEE_8023]
  },
  {
    domain: IMPL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which addressing approach should be used for a server that must always be reachable at the same IP regardless of DHCP?',
    options: opts4('A DHCP reservation or static IP', 'APIPA', 'A dynamic lease with short TTL', 'Link-local only'),
    correct: ['a'],
    explanation: 'Servers should use a static IP or a DHCP reservation (MAC-bound) so the address never changes, ensuring DNS records and clients reliably reach the service.',
    references: [REF_RFC2131]
  },
  {
    domain: IMPL, difficulty: 3, type: QType.SINGLE,
    stem: 'A remote site needs encrypted connectivity to headquarters over the Internet with the tunnel always established between the two firewalls. Which solution fits BEST?',
    options: opts4(
      'Client-to-site SSL VPN per user',
      'Site-to-site IPsec VPN between the edge devices',
      'Open guest Wi-Fi bridging',
      'A plain GRE tunnel with no encryption'
    ),
    correct: ['b'],
    explanation: 'A site-to-site IPsec VPN between the two edge firewalls provides a persistent, encrypted tunnel for all inter-site traffic, unlike per-user client VPNs or an unencrypted GRE tunnel.',
    references: [REF_OBJ]
  },

  // ── Network Operations (12) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which metric expresses how long, on average, a repairable system takes to be restored after a failure?',
    options: opts4('MTBF', 'MTTR', 'RPO', 'SLA'),
    correct: ['b'],
    explanation: 'MTTR (Mean Time To Repair/Recovery) is the average time to restore a failed component to service. MTBF measures average uptime between failures.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which logging severity in the syslog scheme represents the most critical "system unusable" condition?',
    options: opts4('Emergency (0)', 'Warning (4)', 'Informational (6)', 'Debug (7)'),
    correct: ['a'],
    explanation: 'Syslog severities run 0 (Emergency, system unusable) to 7 (Debug). Lower numbers are more severe; operators typically alert on Emergency/Alert/Critical levels.',
    references: [REF_RFC5424]
  },
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the BEST reason to maintain an up-to-date IP address management (IPAM) record?',
    options: opts4(
      'It increases link bandwidth',
      'It prevents address conflicts and speeds troubleshooting/planning',
      'It encrypts traffic',
      'It replaces the need for DNS'
    ),
    correct: ['b'],
    explanation: 'IPAM tracks subnet and address assignments, preventing duplicate-IP conflicts and making capacity planning and troubleshooting faster and more accurate.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants proactive notification before a disk on a core router fills, not after an outage. Which monitoring approach is appropriate?',
    options: opts4(
      'Reactive: wait for the device to crash',
      'Threshold/predictive alerting on resource utilization trends',
      'Quarterly manual inspection only',
      'Disable monitoring to reduce load'
    ),
    correct: ['b'],
    explanation: 'Proactive monitoring sets thresholds (and uses trend/predictive analysis) on resources like storage and memory so operators are alerted before exhaustion causes an outage.',
    references: [REF_RFC1157]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice ensures a network change can be reverted quickly if it causes problems?',
    options: opts4('No documentation', 'A documented, tested rollback/back-out plan', 'Changing during peak hours', 'Disabling logging'),
    correct: ['b'],
    explanation: 'A documented and tested rollback (back-out) plan is part of change management and lets operators restore the prior state quickly if the change causes issues.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that improve network availability.',
    options: opts4(
      'Redundant power supplies and uplinks',
      'First-hop redundancy (VRRP/HSRP)',
      'A single non-redundant core switch',
      'Tested backups and a disaster recovery plan'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Redundant power/uplinks, first-hop redundancy, and tested backups/DR all raise availability. A single non-redundant core switch is a single point of failure that lowers availability.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which port-monitoring approach copies traffic to an analyzer connected to a different switch than the source ports?',
    options: opts4('Local SPAN', 'RSPAN/ERSPAN', 'Port security', 'Storm control'),
    correct: ['b'],
    explanation: 'RSPAN (and ERSPAN over IP) extends port mirroring across switches so the analyzer can be located remotely, unlike local SPAN which requires the monitor port on the same switch.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document defines acceptable use of organizational network resources by end users?',
    options: opts4('AUP', 'SLA', 'BCP', 'RFC'),
    correct: ['a'],
    explanation: 'An Acceptable Use Policy (AUP) defines how users may use organizational network and computing resources, helping enforce security and compliance expectations.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE,
    stem: 'A jump box/bastion host is a hardened, monitored system used to administer devices in a protected segment.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. A jump/bastion host is a controlled, audited entry point for administering systems in a sensitive zone, reducing direct exposure of management interfaces.',
    references: [REF_NIST_ZT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An operator needs historical bandwidth graphs to justify a circuit upgrade. Which data source is MOST appropriate?',
    options: opts4(
      'A single ping test today',
      'Time-series interface utilization collected via SNMP/flow over weeks',
      'The device boot log',
      'A one-time packet capture'
    ),
    correct: ['b'],
    explanation: 'Trend justification requires time-series utilization data (SNMP counters or flow records) gathered over a meaningful period to show sustained growth, not a single point measurement.',
    references: [REF_RFC1157]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which metric represents the average operational time between failures of a component?',
    options: opts4('MTTR', 'MTBF', 'RPO', 'RTO'),
    correct: ['b'],
    explanation: 'MTBF (Mean Time Between Failures) estimates average uptime between failures and is used for reliability planning and spare-parts strategy. MTTR measures repair time.',
    references: [REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach BEST protects device configurations against accidental loss during operations?',
    options: opts4('Manual edits only on the device with no copies', 'Scheduled automated config backups to a secure repository', 'Storing the only copy on the technician\'s laptop', 'Never changing the config'),
    correct: ['b'],
    explanation: 'Scheduled automated backups of device configurations to a secure, versioned repository ensure a known-good config can always be restored after a failure or erroneous change.',
    references: [REF_OBJ]
  },

  // ── Network Security (9) ──
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which AAA protocol is an IETF standard that commonly uses UDP and is widely deployed for Wi-Fi/802.1X authentication?',
    options: opts4('TACACS+', 'RADIUS', 'SNMPv3', 'Kerberos'),
    correct: ['b'],
    explanation: 'RADIUS (UDP-based, IETF standard) is the typical back end for 802.1X/Wi-Fi authentication. TACACS+ is Cisco-originated and more often used for device administration with full-packet encryption.',
    references: [REF_IEEE_8021X]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker double-tags an Ethernet frame to jump from VLAN 10 to VLAN 20. Which mitigation is MOST effective?',
    options: opts4(
      'Use a dedicated, unused native VLAN and explicitly tag the native VLAN',
      'Disable STP on all ports',
      'Increase the MTU',
      'Allow all VLANs on every trunk'
    ),
    correct: ['a'],
    explanation: 'Double-tagging (VLAN hopping) abuses the native VLAN. Assigning trunks an unused native VLAN and forcing native-VLAN tagging (and pruning unused VLANs) defeats the attack.',
    references: [REF_IEEE_8021Q]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which device inspects traffic and can actively block detected malicious flows inline?',
    options: opts4('IDS (passive)', 'IPS (inline)', 'Hub', 'Patch panel'),
    correct: ['b'],
    explanation: 'An IPS sits inline and can drop or block malicious traffic in real time, whereas an IDS only detects and alerts on a copy of the traffic.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control restricts switch access ports to a defined number of learned MAC addresses and can shut a port on violation?',
    options: opts4('Port security', 'Spanning tree', 'QoS', 'NAT'),
    correct: ['a'],
    explanation: 'Port security limits the MAC addresses allowed on an access port and can shut down, restrict, or protect the port on violation—mitigating MAC flooding and unauthorized devices.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that reduce the risk of unauthorized physical/edge access to the network.',
    options: opts4(
      'Disabling unused switch ports',
      '802.1X authentication on access ports',
      'Leaving console ports without passwords',
      'MAC-based port security'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Shutting unused ports, enforcing 802.1X, and applying MAC-based port security all limit unauthorized edge access. Leaving console ports unprotected does the opposite.',
    references: [REF_IEEE_8021X]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which attack intercepts traffic by sending forged ARP replies so a host\'s ARP cache points to the attacker\'s MAC?',
    options: opts4('ARP poisoning (spoofing)', 'DNS amplification', 'SYN flood', 'Smurf attack'),
    correct: ['a'],
    explanation: 'ARP poisoning sends forged ARP replies so victims map the gateway/host IP to the attacker\'s MAC, enabling a man-in-the-middle. Dynamic ARP Inspection mitigates it.',
    references: [REF_RFC826]
  },
  {
    domain: SEC, difficulty: 1, type: QType.SINGLE,
    stem: 'Which is the MOST secure protocol for managing a switch remotely?',
    options: opts4('Telnet', 'SSH', 'HTTP', 'TFTP'),
    correct: ['b'],
    explanation: 'SSH encrypts the management session (credentials and commands), whereas Telnet/HTTP/TFTP transmit data—including credentials—in cleartext and should be disabled.',
    references: [REF_OBJ]
  },
  {
    domain: SEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A security design places user, server, and IoT devices into separate VLANs with firewall rules between them. This BEST reduces which risk?',
    options: opts4(
      'Physical theft of devices',
      'Lateral movement of an attacker between device classes',
      'Electromagnetic interference',
      'DNS cache TTL expiry'
    ),
    correct: ['b'],
    explanation: 'Segmenting device classes into separate VLANs with inter-VLAN firewall rules limits lateral movement, containing a compromise to one segment instead of the whole network.',
    references: [REF_NIST_ZT]
  },
  {
    domain: SEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice follows the principle of least privilege for network device administration?',
    options: opts4(
      'Giving every technician full enable/admin rights',
      'Granting role-based accounts with only the permissions each role needs',
      'Sharing one root account across the team',
      'Disabling all authentication for speed'
    ),
    correct: ['b'],
    explanation: 'Least privilege grants each role only the access required for its tasks (role-based access control with individual accounts and logging), reducing blast radius and improving accountability.',
    references: [REF_NIST_ZT]
  },

  // ── Network Troubleshooting (16) ──
  {
    domain: TROUBLE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which troubleshooting step comes immediately BEFORE "verify full system functionality"?',
    options: opts4(
      'Identify the problem',
      'Implement the solution (or escalate)',
      'Establish a theory',
      'Document findings'
    ),
    correct: ['b'],
    explanation: 'The methodology order is: identify, theorize, test, plan, implement (or escalate), verify full functionality and implement preventive measures, then document. Verification follows implementation.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user cannot reach any website. ping 8.8.8.8 succeeds but ping google.com fails. What is the MOST likely cause?',
    options: opts4('Default gateway down', 'DNS resolution failure', 'Bad Ethernet cable', 'Switch loop'),
    correct: ['b'],
    explanation: 'Reaching 8.8.8.8 by IP proves Layer 3/Internet connectivity works, so a name-resolution failure (misconfigured or unreachable DNS server) is the most likely cause.',
    references: [REF_RFC1035]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'A subnet uses 192.168.1.0/26. A new host is configured with 192.168.1.70/26 and cannot reach the gateway 192.168.1.1. Why?',
    options: opts4(
      'The gateway is wrong for any subnet',
      '.70 is in the second /26 (192.168.1.64–127), a different subnet than the gateway at .1',
      'The cable is bad',
      'DNS is misconfigured'
    ),
    correct: ['b'],
    explanation: 'With /26 the first subnet is .0–.63 and the second is .64–.127. Host .70 is in the second subnet while the gateway .1 is in the first, so they cannot communicate directly.',
    references: [REF_RFC4632]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command would you use to test whether TCP port 443 on a remote server is reachable/open?',
    options: opts4(
      'A port-test tool such as `nc -zv host 443` or `Test-NetConnection host -Port 443`',
      'arp -a',
      'ipconfig /flushdns',
      'route print'
    ),
    correct: ['a'],
    explanation: 'Tools like netcat (`nc -zv`) or PowerShell `Test-NetConnection -Port` attempt a TCP connection to confirm a specific port is open and reachable, beyond what ICMP ping shows.',
    references: [REF_RFC793]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL plausible causes when wireless clients have a strong signal but very low throughput.',
    options: opts4(
      'Severe co-channel interference / high channel utilization',
      'A saturated or rate-limited backhaul/uplink',
      'The SSID being broadcast',
      'Too many clients associated to one AP (airtime contention)'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Strong RSSI but poor throughput points to RF contention/interference, an overloaded AP (too many clients), or a saturated backhaul. Broadcasting the SSID does not reduce throughput.',
    references: [REF_IEEE_80211]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command clears a stale DNS cache entry on a Windows host?',
    options: opts4('ipconfig /flushdns', 'arp -d', 'netstat -an', 'tracert -d'),
    correct: ['a'],
    explanation: '`ipconfig /flushdns` clears the local DNS resolver cache, useful when a record changed but the host still resolves to the old (cached) address.',
    references: [REF_RFC1035]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'After a power event, a switch comes up but several access ports stay in err-disabled. What is the MOST likely cause and FIRST action?',
    options: opts4(
      'Cosmetic state; ignore it',
      'A protection feature (port security/BPDU guard/loop) tripped — investigate the cause, then re-enable the ports',
      'DNS failure; restart DNS',
      'Replace the switch immediately'
    ),
    correct: ['b'],
    explanation: 'Err-disabled ports were shut by a protection mechanism. The correct approach is to identify why (security violation, BPDU, loop), remediate the cause, then recover the port (errdisable recovery or shut/no shut).',
    references: [REF_CISCO_STP]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A link negotiates at 10 Mbps half duplex on modern Gigabit gear. Which is the MOST likely physical cause?',
    options: opts4(
      'A damaged cable/pair or autonegotiation failure forcing the lowest common mode',
      'DNS misconfiguration',
      'Wrong SNMP community',
      'Spanning tree blocking'
    ),
    correct: ['a'],
    explanation: 'Falling back to 10 Mbps half duplex typically indicates cabling damage or failed autonegotiation, forcing the lowest common denominator. STP would block, not slow, a link.',
    references: [REF_IEEE_8023]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command on Linux shows the routing table and the default gateway?',
    options: opts4('ip route (or route -n)', 'cat /etc/hostname', 'uptime', 'whoami'),
    correct: ['a'],
    explanation: '`ip route` (or legacy `route -n`) displays the kernel routing table including the default route, useful for diagnosing why off-subnet traffic fails.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Intermittent connectivity affects only devices on one access switch. The uplink shows rising CRC and input errors. What is the MOST likely cause?',
    options: opts4(
      'A failing/marginal uplink cable or transceiver introducing errors',
      'Expired SSL certificate',
      'DNS server overload',
      'Incorrect time zone setting'
    ),
    correct: ['a'],
    explanation: 'Rising CRC/input errors on the uplink point to a Layer 1 problem—a marginal cable, dirty fiber, or failing transceiver—causing intermittent loss for everything behind that switch.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A captured trace shows a client sending repeated SYN packets with no SYN-ACK in return. What does this MOST likely indicate?',
    options: opts4(
      'A successful three-way handshake',
      'The server/port is unreachable or filtered by a firewall',
      'DNS is working correctly',
      'The MTU is too large'
    ),
    correct: ['b'],
    explanation: 'Repeated SYNs with no SYN-ACK mean the TCP handshake never completes—commonly the service is down, the port is closed, or a firewall is silently dropping the SYNs.',
    references: [REF_RFC793]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'VoIP calls have choppy audio and gaps, while web browsing is fine on the same link. Which metric should you investigate FIRST?',
    options: opts4('DNS TTL', 'Jitter and packet loss / QoS marking', 'MAC aging timer', 'STP root cost'),
    correct: ['b'],
    explanation: 'Choppy VoIP with healthy browsing is classic jitter/packet-loss or missing QoS prioritization, since real-time media is far more sensitive to delay variation than web traffic.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A device cannot obtain an IP via DHCP and the relay (IP helper) was recently changed. What should you verify FIRST?',
    options: opts4(
      'The IP helper address points to the correct, reachable DHCP server',
      'The user\'s browser homepage',
      'The switch firmware release notes',
      'The DNS MX record'
    ),
    correct: ['a'],
    explanation: 'After an IP helper change, confirm the helper points to the correct, reachable DHCP server (and the scope has free addresses) since broadcasts will not reach the server otherwise.',
    references: [REF_RFC2131]
  },
  {
    domain: TROUBLE, difficulty: 1, type: QType.SINGLE,
    stem: 'Verifying full system functionality and implementing preventive measures is a required step before closing a troubleshooting case.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. After implementing a fix you must verify full functionality and, where possible, implement preventive measures before documenting and closing the case.',
    references: [REF_OBJ]
  },
  {
    domain: TROUBLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A laptop on Wi-Fi has an IP of 169.254.10.5 while wired hosts get 10.0.5.x. What is the MOST likely cause?',
    options: opts4(
      'The wireless client failed to get a DHCP lease (no DHCP/relay on that SSID/VLAN)',
      'DNS is misconfigured',
      'The default gateway is too fast',
      'The laptop has a virus by definition'
    ),
    correct: ['a'],
    explanation: 'An APIPA (169.254.x.x) address on Wi-Fi while wired clients get valid leases indicates the wireless VLAN/SSID has no working DHCP server or relay reaching it.',
    references: [REF_RFC2131]
  },
  {
    domain: TROUBLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Users intermittently lose connectivity right after plugging a small unmanaged switch into a wall jack. The access port flaps and the network briefly degrades. What is the MOST likely cause?',
    options: opts4(
      'A switching loop introduced by the added switch (no STP protection on that port)',
      'DNS cache poisoning',
      'An expired DHCP scope',
      'A bad SNMP community string'
    ),
    correct: ['a'],
    explanation: 'Adding an unmanaged switch can create a Layer 2 loop, causing broadcast storms and port flapping. BPDU guard/loop protection on access ports prevents this; remove the loop to recover.',
    references: [REF_CISCO_STP]
  }
];

const NETWORKPLUS_DOMAINS = [
  { name: CONCEPTS, weight: 23 },
  { name: IMPL, weight: 20 },
  { name: OPS, weight: 19 },
  { name: SEC, weight: 14 },
  { name: TROUBLE, weight: 24 }
];

const NETWORKPLUS_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'comptia-network-plus-p1',
    code: 'N10-009-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 90-minute, 65-question, blueprint-weighted set covering networking concepts, network implementation, network operations, network security, and network troubleshooting.',
    questions: P1
  },
  {
    slug: 'comptia-network-plus-p2',
    code: 'N10-009-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 90-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'comptia-network-plus-p3',
    code: 'N10-009-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 90-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const NETWORKPLUS_BUNDLE = {
  slug: 'comptia-network-plus',
  title: 'CompTIA Network+ (N10-009)',
  description: 'All 3 CompTIA Network+ (N10-009) practice exams in one bundle — covering networking concepts, network implementation, network operations, network security, and network troubleshooting, aligned to the published N10-009 exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 36900 // USD 369 — PRACTICE + real-exam voucher tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CompTIA Network+ (N10-009) bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:networkplus-seed'` are deleted and
 * re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedNetworkPlus(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'comptia' } });
  await db.vendor.upsert({
    where: { slug: 'comptia' },
    update: { name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT credentials including A+, Network+, Security+, Linux+, and Server+.' },
    create: { slug: 'comptia', name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT credentials including A+, Network+, Security+, Linux+, and Server+.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'comptia' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of NETWORKPLUS_EXAMS) {
    const title = `CompTIA Network+ (N10-009) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the published CompTIA Network+ (N10-009) exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 90,
      passingScore: 72,
      questionCount: e.questions.length,
      domains: NETWORKPLUS_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:networkplus-seed' } });
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
          generatedBy: 'manual:networkplus-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: NETWORKPLUS_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: NETWORKPLUS_BUNDLE.slug },
    update: {
      title: NETWORKPLUS_BUNDLE.title,
      description: NETWORKPLUS_BUNDLE.description,
      price: NETWORKPLUS_BUNDLE.price,
      priceVoucher: NETWORKPLUS_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: NETWORKPLUS_BUNDLE.slug,
      title: NETWORKPLUS_BUNDLE.title,
      description: NETWORKPLUS_BUNDLE.description,
      price: NETWORKPLUS_BUNDLE.price,
      priceVoucher: NETWORKPLUS_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'comptia-network-plus-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'comptia-network-plus-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'comptia-network-plus-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'comptia-network-plus-p1', tier: 'VOUCHER' as const, position: 4 }
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
