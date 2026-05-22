/**
 * AZ-700 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:az700-seed'` and upserts catalog rows.
 *
 * Exported as `seedAz700(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/az700.ts`) and the protected
 * admin API (`/api/admin/seed-az700`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Designing and Implementing Microsoft Azure Networking
 * Solutions (AZ-700) study guide (skills measured as of April 24, 2026):
 *
 *   - Design and implement core networking infrastructure   — 28% (18/variant)
 *   - Design, implement, and manage connectivity services   — 22% (14/variant)
 *   - Design and implement application delivery services     — 18% (12/variant)
 *   - Design and implement private access to Azure services  — 12% ( 8/variant)
 *   - Design and implement Azure network security services   — 20% (13/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual AZ-700 questions.
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

const CORE = 'Design and implement core networking infrastructure';
const CONNECTIVITY = 'Design, implement, and manage connectivity services';
const APPDELIVERY = 'Design and implement application delivery services';
const PRIVATE = 'Design and implement private access to Azure services';
const SECURITY = 'Design and implement Azure network security services';

// ── Core: VNet / IP / subnets ──
const REF_VNET = { label: 'Microsoft Learn — Azure Virtual Network overview', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview' };
const REF_VNET_PLAN = { label: 'Microsoft Learn — Plan virtual networks', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-vnet-plan-design-arm' };
const REF_SUBNET = { label: 'Microsoft Learn — Add, change, or delete a virtual network subnet', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-manage-subnet' };
const REF_SUBNET_DELEGATION = { label: 'Microsoft Learn — Add or remove a subnet delegation', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/manage-subnet-delegation' };
const REF_PUBLIC_IP = { label: 'Microsoft Learn — Public IP addresses in Azure', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-addresses' };
const REF_PUBLIC_IP_PREFIX = { label: 'Microsoft Learn — Public IP address prefix', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-address-prefix' };
const REF_BYOIP = { label: 'Microsoft Learn — Custom IP address prefix (BYOIP)', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/custom-ip-address-prefix' };
const REF_PRIVATE_IP = { label: 'Microsoft Learn — Private IP addresses in Azure', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses' };

// ── Core: DNS ──
const REF_DNS = { label: 'Microsoft Learn — What is Azure DNS?', url: 'https://learn.microsoft.com/en-us/azure/dns/dns-overview' };
const REF_DNS_ZONES = { label: 'Microsoft Learn — DNS zones and records overview', url: 'https://learn.microsoft.com/en-us/azure/dns/dns-zones-records' };
const REF_PRIVATE_DNS = { label: 'Microsoft Learn — What is an Azure private DNS zone?', url: 'https://learn.microsoft.com/en-us/azure/dns/private-dns-overview' };
const REF_VNET_DNS = { label: 'Microsoft Learn — Name resolution for resources in Azure virtual networks', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-name-resolution-for-vms-and-role-instances' };
const REF_DNS_RESOLVER = { label: 'Microsoft Learn — What is Azure DNS Private Resolver?', url: 'https://learn.microsoft.com/en-us/azure/dns/dns-private-resolver-overview' };

// ── Core: connectivity / routing ──
const REF_PEERING = { label: 'Microsoft Learn — Virtual network peering', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview' };
const REF_AVNM = { label: 'Microsoft Learn — What is Azure Virtual Network Manager?', url: 'https://learn.microsoft.com/en-us/azure/virtual-network-manager/overview' };
const REF_UDR = { label: 'Microsoft Learn — Virtual network traffic routing (user-defined routes)', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview' };
const REF_ROUTE_TABLE = { label: 'Microsoft Learn — Create, change, or delete a route table', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/manage-route-table' };
const REF_FORCED_TUNNEL = { label: 'Microsoft Learn — Configure forced tunneling', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-forced-tunneling-rm' };
const REF_ROUTE_SERVER = { label: 'Microsoft Learn — What is Azure Route Server?', url: 'https://learn.microsoft.com/en-us/azure/route-server/overview' };
const REF_NAT_GATEWAY = { label: 'Microsoft Learn — What is Azure NAT Gateway?', url: 'https://learn.microsoft.com/en-us/azure/nat-gateway/nat-overview' };
const REF_GATEWAY_TRANSIT = { label: 'Microsoft Learn — Configure VPN gateway transit for virtual network peering', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-peering-gateway-transit' };

// ── Core: monitoring ──
const REF_NETWORK_WATCHER = { label: 'Microsoft Learn — What is Azure Network Watcher?', url: 'https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-overview' };
const REF_CONN_MONITOR = { label: 'Microsoft Learn — Connection monitor overview', url: 'https://learn.microsoft.com/en-us/azure/network-watcher/connection-monitor-overview' };
const REF_DDOS = { label: 'Microsoft Learn — What is Azure DDoS Protection?', url: 'https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview' };
const REF_MONITOR_NETWORKS = { label: 'Microsoft Learn — Azure Monitor Network Insights', url: 'https://learn.microsoft.com/en-us/azure/network-watcher/network-insights-overview' };

// ── Connectivity: VPN ──
const REF_VPN_GATEWAY = { label: 'Microsoft Learn — What is Azure VPN Gateway?', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways' };
const REF_VPN_SKU = { label: 'Microsoft Learn — About VPN Gateway SKUs', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/about-gateway-skus' };
const REF_S2S_VPN = { label: 'Microsoft Learn — Create a site-to-site VPN connection', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/tutorial-site-to-site-portal' };
const REF_VPN_HA = { label: 'Microsoft Learn — Highly available cross-premises connectivity', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable' };
const REF_VPN_POLICY = { label: 'Microsoft Learn — About policy-based and route-based VPN gateways', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-connect-multiple-policybased-rm-ps' };
const REF_IPSEC = { label: 'Microsoft Learn — About cryptographic requirements and Azure VPN gateways', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-compliance-crypto' };
const REF_LOCAL_GW = { label: 'Microsoft Learn — Create a local network gateway', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/tutorial-site-to-site-portal' };
const REF_P2S_VPN = { label: 'Microsoft Learn — About point-to-site VPN', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/point-to-site-about' };
const REF_P2S_AUTH = { label: 'Microsoft Learn — Configure a point-to-site VPN connection — Microsoft Entra ID authentication', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/point-to-site-entra-gateway' };
const REF_EXTENDED_NETWORK = { label: 'Microsoft Learn — Azure Extended Network', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/subnet-extension' };

// ── Connectivity: ExpressRoute ──
const REF_EXPRESSROUTE = { label: 'Microsoft Learn — Azure ExpressRoute overview', url: 'https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction' };
const REF_ER_MODELS = { label: 'Microsoft Learn — ExpressRoute connectivity models', url: 'https://learn.microsoft.com/en-us/azure/expressroute/expressroute-connectivity-models' };
const REF_ER_PEERING = { label: 'Microsoft Learn — ExpressRoute routing requirements (peering)', url: 'https://learn.microsoft.com/en-us/azure/expressroute/expressroute-routing' };
const REF_ER_GLOBAL_REACH = { label: 'Microsoft Learn — ExpressRoute Global Reach', url: 'https://learn.microsoft.com/en-us/azure/expressroute/expressroute-global-reach' };
const REF_ER_FASTPATH = { label: 'Microsoft Learn — About ExpressRoute FastPath', url: 'https://learn.microsoft.com/en-us/azure/expressroute/about-fastpath' };
const REF_ER_DIRECT = { label: 'Microsoft Learn — About ExpressRoute Direct', url: 'https://learn.microsoft.com/en-us/azure/expressroute/expressroute-erdirect-about' };
const REF_ER_GATEWAY = { label: 'Microsoft Learn — About ExpressRoute virtual network gateways', url: 'https://learn.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways' };

// ── Connectivity: Virtual WAN ──
const REF_VWAN = { label: 'Microsoft Learn — What is Azure Virtual WAN?', url: 'https://learn.microsoft.com/en-us/azure/virtual-wan/virtual-wan-about' };
const REF_VWAN_HUB_ROUTING = { label: 'Microsoft Learn — About virtual hub routing', url: 'https://learn.microsoft.com/en-us/azure/virtual-wan/about-virtual-hub-routing' };
const REF_VWAN_NVA = { label: 'Microsoft Learn — About NVAs in a Virtual WAN hub', url: 'https://learn.microsoft.com/en-us/azure/virtual-wan/about-nva-hub' };

// ── Application delivery ──
const REF_LB = { label: 'Microsoft Learn — What is Azure Load Balancer?', url: 'https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview' };
const REF_LB_SKU = { label: 'Microsoft Learn — Azure Load Balancer SKUs', url: 'https://learn.microsoft.com/en-us/azure/load-balancer/skus' };
const REF_LB_RULES = { label: 'Microsoft Learn — Load-balancing rules', url: 'https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-multivip-overview' };
const REF_LB_OUTBOUND = { label: 'Microsoft Learn — Outbound connections and SNAT in Azure', url: 'https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-outbound-connections' };
const REF_LB_CROSSREGION = { label: 'Microsoft Learn — Cross-region load balancer', url: 'https://learn.microsoft.com/en-us/azure/load-balancer/cross-region-overview' };
const REF_GATEWAY_LB = { label: 'Microsoft Learn — Gateway Load Balancer', url: 'https://learn.microsoft.com/en-us/azure/load-balancer/gateway-overview' };
const REF_TRAFFIC_MANAGER = { label: 'Microsoft Learn — What is Traffic Manager?', url: 'https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-overview' };
const REF_TM_ROUTING = { label: 'Microsoft Learn — Traffic Manager routing methods', url: 'https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-routing-methods' };
const REF_APP_GW = { label: 'Microsoft Learn — What is Azure Application Gateway?', url: 'https://learn.microsoft.com/en-us/azure/application-gateway/overview' };
const REF_APP_GW_COMPONENTS = { label: 'Microsoft Learn — Application Gateway components', url: 'https://learn.microsoft.com/en-us/azure/application-gateway/application-gateway-components' };
const REF_APP_GW_PROBES = { label: 'Microsoft Learn — Application Gateway health monitoring overview', url: 'https://learn.microsoft.com/en-us/azure/application-gateway/application-gateway-probe-overview' };
const REF_APP_GW_REWRITE = { label: 'Microsoft Learn — Rewrite HTTP headers and URL with Application Gateway', url: 'https://learn.microsoft.com/en-us/azure/application-gateway/rewrite-http-headers-url' };
const REF_FRONT_DOOR = { label: 'Microsoft Learn — What is Azure Front Door?', url: 'https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview' };
const REF_FD_TIERS = { label: 'Microsoft Learn — Azure Front Door tier comparison', url: 'https://learn.microsoft.com/en-us/azure/frontdoor/standard-premium/tier-comparison' };
const REF_FD_ROUTING = { label: 'Microsoft Learn — Azure Front Door routing architecture', url: 'https://learn.microsoft.com/en-us/azure/frontdoor/front-door-routing-architecture' };
const REF_FD_CACHING = { label: 'Microsoft Learn — Caching with Azure Front Door', url: 'https://learn.microsoft.com/en-us/azure/frontdoor/front-door-caching' };
const REF_FD_PRIVATE_LINK = { label: 'Microsoft Learn — Secure your origin with Private Link in Azure Front Door', url: 'https://learn.microsoft.com/en-us/azure/frontdoor/private-link' };

// ── Private access ──
const REF_PRIVATE_LINK = { label: 'Microsoft Learn — What is Azure Private Link?', url: 'https://learn.microsoft.com/en-us/azure/private-link/private-link-overview' };
const REF_PRIVATE_ENDPOINT = { label: 'Microsoft Learn — What is a private endpoint?', url: 'https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview' };
const REF_PE_DNS = { label: 'Microsoft Learn — Private endpoint DNS integration', url: 'https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-dns' };
const REF_PRIVATE_LINK_SERVICE = { label: 'Microsoft Learn — What is Azure Private Link service?', url: 'https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview' };
const REF_SERVICE_ENDPOINT = { label: 'Microsoft Learn — Virtual Network service endpoints', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-service-endpoints-overview' };
const REF_SERVICE_ENDPOINT_POLICY = { label: 'Microsoft Learn — Virtual network service endpoint policies', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-service-endpoint-policies-overview' };

// ── Network security ──
const REF_NSG = { label: 'Microsoft Learn — Network security groups overview', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview' };
const REF_NSG_HOWTO = { label: 'Microsoft Learn — Create, change, or delete a network security group', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/manage-network-security-group' };
const REF_ASG = { label: 'Microsoft Learn — Application security groups', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/application-security-groups' };
const REF_FLOW_LOGS = { label: 'Microsoft Learn — Virtual network flow logs', url: 'https://learn.microsoft.com/en-us/azure/network-watcher/vnet-flow-logs-overview' };
const REF_IP_FLOW = { label: 'Microsoft Learn — Diagnose a virtual machine network traffic filter problem (IP flow verify)', url: 'https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-ip-flow-verify-overview' };
const REF_BASTION = { label: 'Microsoft Learn — What is Azure Bastion?', url: 'https://learn.microsoft.com/en-us/azure/bastion/bastion-overview' };
const REF_AZURE_FIREWALL = { label: 'Microsoft Learn — What is Azure Firewall?', url: 'https://learn.microsoft.com/en-us/azure/firewall/overview' };
const REF_FIREWALL_SKU = { label: 'Microsoft Learn — Choose the right Azure Firewall SKU', url: 'https://learn.microsoft.com/en-us/azure/firewall/choose-firewall-sku' };
const REF_FIREWALL_RULES = { label: 'Microsoft Learn — Azure Firewall rule processing logic', url: 'https://learn.microsoft.com/en-us/azure/firewall/rule-processing' };
const REF_FIREWALL_MANAGER = { label: 'Microsoft Learn — What is Azure Firewall Manager?', url: 'https://learn.microsoft.com/en-us/azure/firewall-manager/overview' };
const REF_FIREWALL_POLICY = { label: 'Microsoft Learn — Azure Firewall policy overview', url: 'https://learn.microsoft.com/en-us/azure/firewall/policy-rule-sets' };
const REF_WAF = { label: 'Microsoft Learn — What is Azure Web Application Firewall?', url: 'https://learn.microsoft.com/en-us/azure/web-application-firewall/overview' };
const REF_WAF_APPGW = { label: 'Microsoft Learn — Azure Web Application Firewall on Application Gateway', url: 'https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/ag-overview' };
const REF_WAF_FD = { label: 'Microsoft Learn — Azure Web Application Firewall on Azure Front Door', url: 'https://learn.microsoft.com/en-us/azure/web-application-firewall/afds/afds-overview' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Design and implement core networking infrastructure (18) ──
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You are planning the address space for a new Azure virtual network that must peer with an on-premises network using the 10.10.0.0/16 range. Which VNet address space avoids an overlap that would break routing?',
    options: opts4(
      '10.10.0.0/24',
      '10.20.0.0/16',
      '10.10.128.0/17',
      '10.0.0.0/8'
    ),
    correct: ['b'],
    explanation: 'VNet and on-premises address spaces must not overlap, or routing becomes ambiguous. 10.20.0.0/16 does not overlap 10.10.0.0/16. The /24 and /17 options are subsets of 10.10.0.0/16, and 10.0.0.0/8 is a superset that contains it — all overlap.',
    references: [REF_VNET_PLAN, REF_VNET]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to deploy Azure Bastion into an existing virtual network. What is the subnet requirement?',
    options: opts4(
      'A subnet named AzureBastionSubnet of at least /26',
      'A subnet named GatewaySubnet of at least /29',
      'A delegated subnet for Microsoft.Network/bastionHosts of any size',
      'Bastion can be deployed into any existing subnet'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion requires a dedicated subnet specifically named AzureBastionSubnet, sized /26 or larger. GatewaySubnet is for VPN/ExpressRoute gateways. Bastion does not use subnet delegation and cannot share a subnet with other resources.',
    references: [REF_BASTION, REF_SUBNET]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'An Azure SQL Managed Instance must be deployed into a virtual network. The subnet must be dedicated to the managed instance service. Which feature provides this?',
    options: opts4(
      'Subnet delegation to Microsoft.Sql/managedInstances',
      'A service endpoint for Microsoft.Sql',
      'A network security group on the subnet',
      'A user-defined route on the subnet'
    ),
    correct: ['a'],
    explanation: 'Subnet delegation designates a subnet for a specific Azure platform service (here SQL Managed Instance), letting the service create service-specific resources in it. Service endpoints, NSGs, and UDRs do not dedicate a subnet to a service.',
    references: [REF_SUBNET_DELEGATION, REF_SUBNET]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a set of contiguous, reservable static public IP addresses so future public IPs come from a known CIDR your firewall partners can allowlist. What should you create?',
    options: opts4(
      'A public IP address prefix',
      'A NAT gateway',
      'A custom route table',
      'A private DNS zone'
    ),
    correct: ['a'],
    explanation: 'A public IP address prefix reserves a contiguous block of standard public IPs from a known range, so individual public IPs allocated from it are predictable. NAT gateway provides outbound SNAT; route tables and DNS zones are unrelated.',
    references: [REF_PUBLIC_IP_PREFIX, REF_PUBLIC_IP]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Two virtual networks in different Azure regions must communicate privately over the Microsoft backbone with low latency. What should you configure?',
    options: opts4(
      'Global virtual network peering',
      'A site-to-site VPN between the VNets',
      'A service endpoint in each VNet',
      'A public IP on each VM and NSG allow rules'
    ),
    correct: ['a'],
    explanation: 'Global VNet peering connects VNets across regions over the Microsoft backbone with low latency and no gateway. S2S VPN adds gateway overhead and encryption latency. Service endpoints and public IPs do not provide VNet-to-VNet private connectivity.',
    references: [REF_PEERING, REF_VNET]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'VNet-A is peered with hub VNet-H, and VNet-H has a VPN gateway. VNet-A must reach on-premises networks through VNet-H\'s gateway. Which peering setting on the VNet-A↔VNet-H peering must be enabled?',
    options: opts4(
      'Use remote gateways on the VNet-A side and Allow gateway transit on the VNet-H side',
      'Allow gateway transit on the VNet-A side only',
      'Use remote gateways on both sides',
      'Allow forwarded traffic on the VNet-A side only'
    ),
    correct: ['a'],
    explanation: 'For gateway transit, the VNet with the gateway (hub) enables "Allow gateway transit", and the spoke enables "Use remote gateways". Setting Use remote gateways on the hub or both sides is invalid; Allow forwarded traffic alone does not provide gateway transit.',
    references: [REF_GATEWAY_TRANSIT, REF_PEERING]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You manage dozens of virtual networks and need to apply a consistent connectivity topology (hub-and-spoke) and security rules centrally at scale. Which service should you use?',
    options: opts4(
      'Azure Virtual Network Manager',
      'Azure Route Server',
      'Azure Network Watcher',
      'Azure Firewall Manager'
    ),
    correct: ['a'],
    explanation: 'Azure Virtual Network Manager centrally manages connectivity (hub-and-spoke or mesh) and security admin rules across many VNets via network groups. Route Server exchanges routes with NVAs; Network Watcher monitors; Firewall Manager manages firewall policies, not VNet topology.',
    references: [REF_AVNM, REF_PEERING]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You deploy a network virtual appliance (NVA) and want it to dynamically exchange BGP routes with the Azure SDN without manually maintaining user-defined routes. What should you deploy?',
    options: opts4(
      'Azure Route Server',
      'A route table with BGP route propagation disabled',
      'A NAT gateway',
      'A second VPN gateway'
    ),
    correct: ['a'],
    explanation: 'Azure Route Server enables an NVA to exchange routes with the Azure SDN over BGP, eliminating manual UDR upkeep. A route table disables/enables propagation but does not peer BGP with an NVA. NAT gateway and VPN gateway serve different purposes.',
    references: [REF_ROUTE_SERVER, REF_UDR]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'VMs in a subnet make many outbound connections to the internet and you are hitting SNAT port exhaustion. Which service provides scalable, predictable outbound connectivity?',
    options: opts4(
      'Azure NAT Gateway associated with the subnet',
      'A basic public IP on each VM',
      'A network security group outbound rule',
      'A private endpoint'
    ),
    correct: ['a'],
    explanation: 'NAT Gateway provides large-scale outbound SNAT with many SNAT ports, eliminating exhaustion, and is the recommended outbound method. Per-VM public IPs don\'t scale well; NSG rules filter traffic; private endpoints are for inbound private access.',
    references: [REF_NAT_GATEWAY, REF_LB_OUTBOUND]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need name resolution for private endpoints so that the FQDN of a storage account resolves to its private IP from within the VNet. Which DNS resource should you use?',
    options: opts4(
      'A private DNS zone linked to the VNet',
      'A public DNS zone',
      'An Azure DNS Private Resolver inbound endpoint only',
      'The Azure-provided default DNS (168.63.129.16) with no extra config'
    ),
    correct: ['a'],
    explanation: 'Private endpoints rely on a private DNS zone (e.g. privatelink.blob.core.windows.net) linked to the VNet so the resource FQDN resolves to the private IP. Public DNS zones resolve public records. DNS Private Resolver forwards queries but the zone is still required.',
    references: [REF_PRIVATE_DNS, REF_PE_DNS]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'On-premises clients must resolve Azure private DNS zone records, and Azure VMs must conditionally forward certain domains to on-premises DNS — without running DNS-server VMs. Which Azure service should you deploy?',
    options: opts4(
      'Azure DNS Private Resolver',
      'Azure DNS public zone',
      'Azure Traffic Manager',
      'Azure Private Link service'
    ),
    correct: ['a'],
    explanation: 'Azure DNS Private Resolver provides inbound endpoints (on-prem → Azure resolution) and outbound endpoints with forwarding rulesets (Azure → on-prem) without managing DNS-server VMs. The other services do not perform recursive/conditional DNS resolution.',
    references: [REF_DNS_RESOLVER, REF_PRIVATE_DNS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You must force all internet-bound traffic from a subnet through a firewall NVA at 10.0.1.4. Which user-defined route achieves this?',
    options: opts4(
      'Address prefix 0.0.0.0/0, next hop type Virtual appliance, next hop 10.0.1.4',
      'Address prefix 0.0.0.0/0, next hop type Internet',
      'Address prefix 10.0.1.4/32, next hop type Virtual network',
      'Address prefix 0.0.0.0/0, next hop type None'
    ),
    correct: ['a'],
    explanation: 'A UDR with prefix 0.0.0.0/0 and next hop type "Virtual appliance" pointing at the NVA\'s IP forces all internet-bound traffic through the NVA. Next hop Internet bypasses the NVA; None drops traffic; the /32 route to the NVA itself doesn\'t redirect default traffic.',
    references: [REF_UDR, REF_ROUTE_TABLE]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to verify whether a VM can reach a destination IP/port and see every hop and any blocking NSG or firewall along the path. Which Network Watcher tool should you use?',
    options: opts4(
      'Connection troubleshoot',
      'NSG diagnostic only',
      'Topology',
      'Effective routes export only'
    ),
    correct: ['a'],
    explanation: 'Connection troubleshoot tests reachability between a source and destination and reports hops plus any NSG/route blocking the path. Topology only draws the resource map; effective routes shows routing but not live reachability or NSG blocks.',
    references: [REF_NETWORK_WATCHER, REF_CONN_MONITOR]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Your public-facing application must be protected against volumetric (L3/L4) DDoS attacks with tuned mitigation and cost protection. What should you enable?',
    options: opts4(
      'Azure DDoS Protection (Network Protection / IP Protection)',
      'A Web Application Firewall policy only',
      'A network security group with deny rules',
      'Azure Firewall in alert mode'
    ),
    correct: ['a'],
    explanation: 'Azure DDoS Protection provides adaptive L3/L4 volumetric attack mitigation, telemetry, and cost protection. WAF protects L7 (HTTP) only. NSGs and Azure Firewall filter traffic but do not provide dedicated volumetric DDoS mitigation.',
    references: [REF_DDOS, REF_NETWORK_WATCHER]
  },
  {
    domain: CORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure virtual network peering.',
    options: opts4(
      'Peered VNets communicate over the Microsoft backbone without a gateway.',
      'Peering is non-transitive — traffic does not automatically flow A→B→C.',
      'Overlapping address spaces between the two VNets are allowed.',
      'Gateway transit lets a spoke use the hub\'s VPN/ExpressRoute gateway.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Peering uses the backbone, is non-transitive (a hub NVA/route is needed for spoke-to-spoke), and supports gateway transit. Overlapping address spaces are NOT allowed — peering fails if the two VNets overlap.',
    references: [REF_PEERING, REF_GATEWAY_TRANSIT]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need an Azure VM to keep the same private IP across restarts and reallocation. How should the private IP be configured?',
    options: opts4(
      'Set the NIC IP configuration allocation method to Static',
      'Assign a standard public IP to the VM',
      'Enable accelerated networking on the NIC',
      'Place the VM in a dedicated subnet'
    ),
    correct: ['a'],
    explanation: 'Setting the NIC\'s private IP allocation to Static pins the private IP. Dynamic allocation can change on deallocation. Public IPs, accelerated networking, and dedicated subnets do not control private IP persistence.',
    references: [REF_PRIVATE_IP, REF_VNET]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A subnet hosts an Application Gateway v2. Which statement about that subnet is correct?',
    options: opts4(
      'The Application Gateway should be in its own dedicated subnet; other resource types should not share it',
      'The Application Gateway must share the GatewaySubnet with the VPN gateway',
      'The subnet must be delegated to Microsoft.Web/serverFarms',
      'The subnet must be named AzureFirewallSubnet'
    ),
    correct: ['a'],
    explanation: 'Application Gateway should occupy its own dedicated subnet; mixing other resource types is unsupported/limited. GatewaySubnet is for VPN/ER gateways, AzureFirewallSubnet for Azure Firewall, and App Gateway does not use Microsoft.Web delegation.',
    references: [REF_APP_GW, REF_SUBNET]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a virtual network\'s VMs to register their host records automatically into an Azure private DNS zone. What must you configure on the private DNS zone\'s VNet link?',
    options: opts4(
      'Enable auto-registration on the virtual network link',
      'Add an inbound endpoint to the zone',
      'Set the zone as a public DNS zone',
      'Create a CNAME record for each VM'
    ),
    correct: ['a'],
    explanation: 'Enabling auto-registration on a private DNS zone\'s VNet link makes Azure create/update A records for VMs in that VNet automatically. Inbound endpoints belong to DNS Private Resolver; public zones and manual CNAMEs do not auto-register VMs.',
    references: [REF_PRIVATE_DNS, REF_VNET_DNS]
  },

  // ── Design, implement, and manage connectivity services (14) ──
  {
    domain: CONNECTIVITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You are creating a site-to-site VPN between Azure and an on-premises datacenter. Which Azure resource represents the on-premises VPN device and its public IP / address space?',
    options: opts4(
      'Local network gateway',
      'Virtual network gateway',
      'Connection',
      'Public IP address prefix'
    ),
    correct: ['a'],
    explanation: 'The local network gateway represents the on-premises side — its public IP and the on-prem address space(s). The virtual network gateway is the Azure side; a Connection links the two; a public IP prefix is unrelated.',
    references: [REF_S2S_VPN, REF_LOCAL_GW]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Your on-premises VPN device only supports static routing (no BGP) and a single, fixed traffic selector. Which Azure VPN connection type is required?',
    options: opts4(
      'Policy-based VPN',
      'Route-based VPN',
      'ExpressRoute',
      'Point-to-site VPN'
    ),
    correct: ['a'],
    explanation: 'Policy-based VPN uses static, policy-defined traffic selectors and suits legacy devices without BGP. Route-based VPN uses route tables/tunnel interfaces and supports BGP and multiple selectors. ExpressRoute and P2S are different connectivity types.',
    references: [REF_VPN_POLICY, REF_VPN_GATEWAY]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a site-to-site VPN gateway that supports BGP and active-active mode for higher availability. Which gateway SKU family should you avoid?',
    options: opts4(
      'The Basic SKU',
      'VpnGw1',
      'VpnGw2AZ',
      'VpnGw3'
    ),
    correct: ['a'],
    explanation: 'The Basic VPN gateway SKU does not support BGP or active-active configurations and is legacy. VpnGw1–5 (and zone-redundant *AZ variants) support BGP and active-active.',
    references: [REF_VPN_SKU, REF_VPN_HA]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Remote employees on managed laptops must connect to Azure over a point-to-site VPN authenticated with their corporate identity and Conditional Access. Which authentication method should you choose?',
    options: opts4(
      'Microsoft Entra ID authentication (OpenVPN tunnel type)',
      'Azure certificate authentication',
      'RADIUS with a shared secret only',
      'Pre-shared key authentication'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra ID authentication for P2S (OpenVPN protocol) supports corporate identity, MFA, and Conditional Access. Certificate authentication doesn\'t use identity-based controls; RADIUS is identity-capable but doesn\'t natively give Conditional Access; pre-shared keys are for S2S.',
    references: [REF_P2S_AUTH, REF_P2S_VPN]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A point-to-site VPN must support clients on Windows, macOS, and Linux and integrate with Microsoft Entra ID authentication. Which tunnel type should you configure?',
    options: opts4(
      'OpenVPN',
      'IKEv2 only',
      'SSTP only',
      'PPTP'
    ),
    correct: ['a'],
    explanation: 'OpenVPN works across Windows/macOS/Linux and is required for Microsoft Entra ID authentication. SSTP is Windows-only; IKEv2 is cross-platform but not used for Entra ID auth; PPTP is not supported by Azure VPN Gateway.',
    references: [REF_P2S_VPN, REF_P2S_AUTH]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need private, high-bandwidth connectivity from on-premises to Azure that does NOT traverse the public internet. Which service should you use?',
    options: opts4(
      'Azure ExpressRoute',
      'Site-to-site VPN over the internet',
      'Point-to-site VPN',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'ExpressRoute provides a private, dedicated connection through a connectivity provider that bypasses the public internet, with high bandwidth and predictable latency. S2S and P2S VPNs traverse the public internet; Bastion is for VM RDP/SSH access.',
    references: [REF_EXPRESSROUTE, REF_ER_MODELS]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Two on-premises sites are each connected to Azure with ExpressRoute circuits in different peering locations. They must route to each other through Microsoft\'s network. Which ExpressRoute feature enables this?',
    options: opts4(
      'ExpressRoute Global Reach',
      'ExpressRoute FastPath',
      'ExpressRoute Direct',
      'Microsoft peering'
    ),
    correct: ['a'],
    explanation: 'ExpressRoute Global Reach links two ExpressRoute circuits so on-premises sites route to each other over the Microsoft backbone. FastPath bypasses the gateway for VNet traffic; ExpressRoute Direct provides dedicated ports; Microsoft peering reaches Microsoft 365/PaaS public endpoints.',
    references: [REF_ER_GLOBAL_REACH, REF_ER_PEERING]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'ExpressRoute traffic to VMs in a VNet must bypass the ExpressRoute gateway to reduce latency and increase throughput. Which feature should you enable?',
    options: opts4(
      'FastPath',
      'Global Reach',
      'Active-active gateway',
      'Forced tunneling'
    ),
    correct: ['a'],
    explanation: 'FastPath sends data-plane traffic directly between the on-premises network and VMs, bypassing the ExpressRoute gateway, lowering latency and raising throughput. Global Reach links circuits; active-active is for VPN/ER gateway redundancy; forced tunneling redirects traffic.',
    references: [REF_ER_FASTPATH, REF_ER_GATEWAY]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which ExpressRoute peering type should you configure to reach Azure PaaS services over public IP addresses (e.g. Azure Storage public endpoints) across the private circuit?',
    options: opts4(
      'Microsoft peering',
      'Azure private peering',
      'Public peering (legacy)',
      'BGP peering with a local network gateway'
    ),
    correct: ['a'],
    explanation: 'Microsoft peering carries traffic to Microsoft 365 and Azure PaaS public endpoints. Azure private peering reaches VNet private IPs. Public peering is the deprecated predecessor of Microsoft peering. Local network gateways belong to VPN, not ExpressRoute.',
    references: [REF_ER_PEERING, REF_EXPRESSROUTE]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You are designing connectivity for 60 branch offices that each need VPN connectivity to Azure with automated, transit routing between branches. Which architecture is most appropriate?',
    options: opts4(
      'Azure Virtual WAN with VPN gateways in virtual hubs',
      'A separate site-to-site VPN gateway per branch in one VNet',
      'A single point-to-site VPN gateway',
      'ExpressRoute Direct only'
    ),
    correct: ['a'],
    explanation: 'Virtual WAN provides a managed hub-and-spoke with built-in any-to-any (branch, VNet, user) transit routing — ideal for many branches. Per-branch S2S gateways in one VNet do not scale or auto-transit. P2S is for individual clients; ER Direct alone doesn\'t solve branch VPN.',
    references: [REF_VWAN, REF_VWAN_HUB_ROUTING]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In an Azure Virtual WAN, you must control which spoke VNets and branches can route to each other by grouping connections and associating route tables. Which Virtual WAN capability provides this?',
    options: opts4(
      'Virtual hub routing (route tables, labels, associations, and propagations)',
      'VNet peering between every spoke',
      'A user-defined route on each spoke subnet',
      'A single AzureFirewallSubnet in each spoke'
    ),
    correct: ['a'],
    explanation: 'Virtual hub routing uses hub route tables with associations and propagations (and labels) to control which connections can reach which — the native Virtual WAN segmentation mechanism. Manual mesh peering and per-subnet UDRs defeat the purpose of Virtual WAN.',
    references: [REF_VWAN_HUB_ROUTING, REF_VWAN]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to secure traffic between branches and VNets in a Virtual WAN hub by inspecting it with Azure Firewall. What should you create?',
    options: opts4(
      'A secured virtual hub (deploy Azure Firewall into the hub)',
      'A standalone Azure Firewall in a spoke VNet only',
      'An NSG on the hub',
      'A WAF policy on the hub'
    ),
    correct: ['a'],
    explanation: 'Deploying Azure Firewall into a Virtual WAN hub creates a "secured virtual hub", letting hub routing send traffic through the firewall for inspection. A spoke-only firewall, NSGs, or WAF do not provide hub-level inspection in Virtual WAN.',
    references: [REF_VWAN_NVA, REF_AZURE_FIREWALL]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A site-to-site VPN connection between Azure and on-premises keeps dropping. You want to confirm the negotiated IPsec/IKE parameters match on both ends. Where in Azure do you define a matching custom policy?',
    options: opts4(
      'On the VPN Connection resource, configure a custom IPsec/IKE policy',
      'On the local network gateway, set the IKE version',
      'On the public IP of the gateway',
      'On the route table associated with GatewaySubnet'
    ),
    correct: ['a'],
    explanation: 'A custom IPsec/IKE policy is defined on the VPN Connection resource so the encryption/integrity/DH parameters match the on-premises device. The local network gateway holds address/IP info, not crypto policy; public IPs and route tables are unrelated.',
    references: [REF_IPSEC, REF_S2S_VPN]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure ExpressRoute.',
    options: opts4(
      'Traffic over an ExpressRoute circuit does not flow over the public internet.',
      'Azure private peering provides connectivity to VNet private IP addresses.',
      'ExpressRoute by default encrypts all traffic with IPsec.',
      'A circuit can be linked to multiple VNets via connections to the ExpressRoute gateway.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'ExpressRoute bypasses the public internet, private peering reaches VNet IPs, and one circuit can connect to multiple VNets. ExpressRoute is NOT encrypted by default — encryption (e.g. MACsec on ExpressRoute Direct, or IPsec over ExpressRoute) must be added explicitly.',
    references: [REF_EXPRESSROUTE, REF_ER_PEERING]
  },

  // ── Design and implement application delivery services (12) ──
  {
    domain: APPDELIVERY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to distribute inbound TCP traffic across a set of backend VMs within a single region at Layer 4. Which service is the best fit?',
    options: opts4(
      'Azure Load Balancer',
      'Azure Front Door',
      'Azure Traffic Manager',
      'Azure Application Gateway'
    ),
    correct: ['a'],
    explanation: 'Azure Load Balancer is a Layer 4 (TCP/UDP) regional load balancer for backend VMs. Front Door and Application Gateway are Layer 7 (HTTP/S); Traffic Manager is DNS-based global routing, not inline L4 distribution.',
    references: [REF_LB, REF_LB_SKU]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a global HTTP load balancer with a CDN, TLS offload, path-based routing, and a built-in Web Application Firewall. Which service should you choose?',
    options: opts4(
      'Azure Front Door (Premium)',
      'Azure Load Balancer (Standard)',
      'Azure Traffic Manager',
      'An internal Application Gateway'
    ),
    correct: ['a'],
    explanation: 'Azure Front Door is the global Layer 7 entry point with CDN/caching, TLS offload, path-based routing, and integrated WAF (managed rules in Premium). Load Balancer is L4; Traffic Manager is DNS-only; Application Gateway is regional, not global.',
    references: [REF_FRONT_DOOR, REF_FD_TIERS]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'A regional web application needs Layer 7 load balancing with URL path-based routing, cookie-based session affinity, and SSL termination. Which service should you deploy?',
    options: opts4(
      'Azure Application Gateway',
      'Azure Load Balancer',
      'Azure Traffic Manager',
      'Azure NAT Gateway'
    ),
    correct: ['a'],
    explanation: 'Application Gateway is the regional Layer 7 load balancer with URL path-based routing, cookie-based affinity, and SSL/TLS termination. Load Balancer is L4; Traffic Manager is DNS-based; NAT Gateway provides outbound SNAT.',
    references: [REF_APP_GW, REF_APP_GW_COMPONENTS]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want clients to be directed to the Azure region with the lowest network latency for your app, using DNS. Which Traffic Manager routing method should you select?',
    options: opts4(
      'Performance',
      'Priority',
      'Weighted',
      'Geographic'
    ),
    correct: ['a'],
    explanation: 'The Performance routing method directs each client to the endpoint with the lowest latency. Priority is for failover; Weighted splits traffic by ratio; Geographic routes by the user\'s geographic location, not latency.',
    references: [REF_TM_ROUTING, REF_TRAFFIC_MANAGER]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'An Azure Load Balancer must distribute traffic to VMs in two different regions for a single global frontend IP. Which Load Balancer option is required?',
    options: opts4(
      'A cross-region (global) Standard Load Balancer',
      'A Basic Load Balancer',
      'An internal Load Balancer',
      'A Gateway Load Balancer'
    ),
    correct: ['a'],
    explanation: 'The cross-region (global tier) Standard Load Balancer provides a single static anycast frontend distributing to regional load balancers. Basic and internal load balancers are regional; Gateway Load Balancer is for inserting NVAs into the traffic path.',
    references: [REF_LB_CROSSREGION, REF_LB_SKU]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to insert a third-party firewall NVA transparently into the inbound path of a Standard Load Balancer without changing the application\'s frontend. Which service should you use?',
    options: opts4(
      'Gateway Load Balancer',
      'Cross-region Load Balancer',
      'Application Gateway',
      'Traffic Manager'
    ),
    correct: ['a'],
    explanation: 'Gateway Load Balancer chains a third-party NVA transparently into the traffic path of a standard public load balancer or VM, with no frontend changes. Cross-region LB is for global distribution; App Gateway and Traffic Manager don\'t do transparent NVA insertion.',
    references: [REF_GATEWAY_LB, REF_LB]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Azure Application Gateway, which component determines whether a backend server is healthy enough to receive traffic?',
    options: opts4(
      'A health probe',
      'A listener',
      'A rewrite rule set',
      'A frontend IP configuration'
    ),
    correct: ['a'],
    explanation: 'Health probes test backend servers and remove unhealthy ones from rotation. Listeners accept incoming connections; rewrite rule sets modify headers/URLs; frontend IP configurations define the entry IP.',
    references: [REF_APP_GW_PROBES, REF_APP_GW_COMPONENTS]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Front Door must serve static assets from its edge to reduce origin load. Which feature should you configure on the route?',
    options: opts4(
      'Caching',
      'Session affinity',
      'A health probe',
      'TLS termination'
    ),
    correct: ['a'],
    explanation: 'Enabling caching on a Front Door route stores responses at the edge POPs, reducing origin load and latency. Session affinity pins a client to an origin; health probes check origin health; TLS termination decrypts traffic — none of these cache content.',
    references: [REF_FD_CACHING, REF_FD_ROUTING]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want Azure Front Door to reach an origin web app privately, so the origin has no public exposure. Which capability should you use?',
    options: opts4(
      'Private Link origin in Azure Front Door Premium',
      'A service endpoint on the origin subnet',
      'A NAT gateway on the origin subnet',
      'Microsoft peering on an ExpressRoute circuit'
    ),
    correct: ['a'],
    explanation: 'Azure Front Door Premium can connect to an origin over Azure Private Link, so the origin is not publicly exposed. Service endpoints secure subnet egress to PaaS, not Front Door ingress; NAT gateway is outbound; Microsoft peering is ExpressRoute.',
    references: [REF_FD_PRIVATE_LINK, REF_FRONT_DOOR]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'An Application Gateway must add a custom HTTP response header and strip a sensitive header before responses reach clients. Which Application Gateway feature provides this?',
    options: opts4(
      'A rewrite rule set',
      'A health probe',
      'A backend HTTP setting timeout',
      'A WAF custom rule'
    ),
    correct: ['a'],
    explanation: 'Rewrite rule sets add, modify, or remove HTTP request/response headers (and URLs). Health probes check backend health; HTTP setting timeouts affect connection behavior; WAF custom rules filter/allow requests but do not rewrite headers.',
    references: [REF_APP_GW_REWRITE, REF_APP_GW_COMPONENTS]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'Outbound connections from backend VMs behind a Standard public Load Balancer are failing intermittently due to SNAT port exhaustion. Which is the recommended fix?',
    options: opts4(
      'Use a NAT gateway for outbound connectivity instead of relying on load balancer outbound rules',
      'Switch the load balancer to the Basic SKU',
      'Remove all health probes',
      'Assign a Basic public IP to each VM'
    ),
    correct: ['a'],
    explanation: 'Microsoft recommends NAT gateway as the outbound method — it provides far more SNAT ports and eliminates exhaustion. Basic SKU and Basic public IPs scale worse; removing probes does not address SNAT ports.',
    references: [REF_LB_OUTBOUND, REF_NAT_GATEWAY]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about choosing between Azure application-delivery services.',
    options: opts4(
      'Azure Front Door is global; Application Gateway is regional.',
      'Application Gateway operates at Layer 7; Azure Load Balancer operates at Layer 4.',
      'Traffic Manager routes by DNS and does not see the data path.',
      'Azure Load Balancer provides URL path-based routing and TLS offload.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Front Door is global, App Gateway regional; App Gateway is L7 and Load Balancer L4; Traffic Manager is DNS-based and out of the data path. Azure Load Balancer does NOT do URL path-based routing or TLS offload — those are L7 (App Gateway / Front Door) features.',
    references: [REF_LB, REF_APP_GW, REF_FRONT_DOOR]
  },

  // ── Design and implement private access to Azure services (8) ──
  {
    domain: PRIVATE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want VMs in a VNet to reach an Azure Storage account over a private IP from inside the VNet, with the storage account not exposed publicly. What should you create?',
    options: opts4(
      'A private endpoint for the storage account',
      'A service endpoint for Microsoft.Storage',
      'A public IP on the storage account',
      'A NAT gateway on the subnet'
    ),
    correct: ['a'],
    explanation: 'A private endpoint creates a NIC with a private IP in the VNet mapped to the storage account via Azure Private Link, so access is private and the public endpoint can be disabled. Service endpoints still use the service\'s public IP; public IPs and NAT gateway don\'t provide private access.',
    references: [REF_PRIVATE_ENDPOINT, REF_PRIVATE_LINK]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the key difference between an Azure service endpoint and an Azure private endpoint for accessing a PaaS service?',
    options: opts4(
      'A private endpoint assigns a private IP in your VNet; a service endpoint keeps traffic on the Azure backbone but still uses the service\'s public IP',
      'A service endpoint assigns a private IP; a private endpoint uses a public IP',
      'Both assign private IPs in the VNet',
      'Neither keeps traffic off the public internet'
    ),
    correct: ['a'],
    explanation: 'A private endpoint maps the PaaS service to a private IP (NIC) in your VNet via Private Link. A service endpoint extends the VNet identity to the service over the Azure backbone but the service is still reached at its public IP. Only the private endpoint gives a VNet private IP.',
    references: [REF_PRIVATE_ENDPOINT, REF_SERVICE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You created a private endpoint for an Azure SQL database. Clients still resolve the SQL FQDN to the public IP. What is the most likely missing configuration?',
    options: opts4(
      'The privatelink DNS zone is not linked to the VNet (DNS integration is missing)',
      'The private endpoint needs a public IP attached',
      'A service endpoint for Microsoft.Sql must also be enabled',
      'The SQL database must be moved to another region'
    ),
    correct: ['a'],
    explanation: 'Private endpoints require DNS integration: the privatelink.database.windows.net zone must be linked to the VNet (and contain the A record) so the FQDN resolves to the private IP. Without it, the public DNS answer (public IP) is returned.',
    references: [REF_PE_DNS, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 3, type: QType.SINGLE,
    stem: 'Your company offers a SaaS application hosted behind a Standard internal Load Balancer and wants customers in other Azure tenants to consume it privately via their own private endpoints. What should you create on your side?',
    options: opts4(
      'An Azure Private Link service in front of the internal load balancer',
      'A private endpoint in your VNet',
      'A service endpoint policy',
      'A public Application Gateway'
    ),
    correct: ['a'],
    explanation: 'A Private Link service exposes your service (fronted by a Standard internal Load Balancer) so consumers in other VNets/tenants connect via their own private endpoints. A private endpoint is the consumer side; service endpoint policies and a public App Gateway don\'t provide this.',
    references: [REF_PRIVATE_LINK_SERVICE, REF_PRIVATE_LINK]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to restrict a subnet\'s service-endpoint access to ONLY a specific named Azure Storage account, blocking exfiltration to other storage accounts. What should you configure?',
    options: opts4(
      'A service endpoint policy',
      'A network security group rule',
      'A private DNS zone',
      'A user-defined route'
    ),
    correct: ['a'],
    explanation: 'Service endpoint policies restrict VNet service-endpoint traffic to a specified list of Azure resources (e.g. only certain storage accounts), preventing data exfiltration to other accounts. NSGs filter by IP/port, not by specific PaaS resource; DNS and UDRs don\'t scope service access.',
    references: [REF_SERVICE_ENDPOINT_POLICY, REF_SERVICE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'On-premises clients connected via ExpressRoute private peering must reach an Azure PaaS service through a private endpoint. What makes this work?',
    options: opts4(
      'The private endpoint\'s private IP is reachable over the ExpressRoute private peering, with on-premises DNS forwarding the privatelink FQDN to Azure',
      'The PaaS service must be given a public IP',
      'A service endpoint must be enabled on the on-premises router',
      'Microsoft peering must be used instead of private peering'
    ),
    correct: ['a'],
    explanation: 'A private endpoint\'s private IP is reachable from on-premises over ExpressRoute private peering; on-premises DNS must conditionally forward the privatelink zone so the FQDN resolves to the private IP. Public IPs, on-prem service endpoints, and Microsoft peering are not the mechanism.',
    references: [REF_PRIVATE_ENDPOINT, REF_PE_DNS]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'When should you choose a service endpoint instead of a private endpoint?',
    options: opts4(
      'When you simply need to secure a PaaS resource to a VNet/subnet at no extra cost and don\'t require a private IP or on-premises access',
      'When you need the PaaS service reachable by a private IP from on-premises',
      'When you must expose your own service to other tenants',
      'When you need DNS to resolve the service to a private address'
    ),
    correct: ['a'],
    explanation: 'Service endpoints are free and lock a PaaS resource\'s firewall to specific VNets/subnets, suitable when you don\'t need a private IP or on-prem reachability. Private endpoints are required when you need a private IP, on-premises access, or DNS resolving to a private address.',
    references: [REF_SERVICE_ENDPOINT, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Private Link / private endpoints.',
    options: opts4(
      'A private endpoint is a NIC with a private IP from your VNet\'s address space.',
      'Private endpoints require DNS integration to resolve the resource FQDN to the private IP.',
      'A private endpoint can be reached from on-premises over VPN or ExpressRoute.',
      'Private endpoints expose your VNet resources publicly to the internet.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Private endpoints are private-IP NICs, need DNS integration, and are reachable from on-premises over VPN/ExpressRoute. They do the OPPOSITE of public exposure — they make a service privately reachable and let you disable its public endpoint.',
    references: [REF_PRIVATE_ENDPOINT, REF_PE_DNS, REF_PRIVATE_LINK]
  },

  // ── Design and implement Azure network security services (13) ──
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to allow inbound HTTPS (TCP 443) to a subnet of web servers while blocking all other inbound internet traffic. Which resource should you use?',
    options: opts4(
      'A network security group with an allow rule for TCP 443 and the default deny',
      'A route table with a UDR',
      'A private DNS zone',
      'A NAT gateway'
    ),
    correct: ['a'],
    explanation: 'A network security group filters inbound/outbound traffic by 5-tuple; an allow rule for TCP 443 plus NSG default deny rules achieves this. Route tables direct traffic but don\'t filter; DNS and NAT gateway don\'t filter inbound access.',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want NSG rules that reference groups of VMs by role (e.g. "web", "db") instead of hardcoding IP addresses, so rules stay correct as VMs scale. What should you use?',
    options: opts4(
      'Application security groups referenced in the NSG rules',
      'Service tags for each VM',
      'A separate NSG per VM',
      'User-defined routes per role'
    ),
    correct: ['a'],
    explanation: 'Application security groups (ASGs) let you group VM NICs by role and reference those groups as source/destination in NSG rules, so rules adapt as VMs are added/removed. Service tags represent Azure services, not your VMs; per-VM NSGs and UDRs don\'t solve this cleanly.',
    references: [REF_ASG, REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'In an NSG rule you want to allow outbound traffic to Azure Storage without listing storage IP ranges. Which rule source/destination value should you use?',
    options: opts4(
      'The Storage service tag',
      'The VirtualNetwork service tag',
      'An application security group',
      'The 0.0.0.0/0 wildcard'
    ),
    correct: ['a'],
    explanation: 'The Storage service tag represents the IP ranges of Azure Storage and is maintained by Microsoft, so you don\'t list IPs. VirtualNetwork represents VNet space; ASGs group your VMs; 0.0.0.0/0 allows the whole internet, not just Storage.',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A VM cannot receive RDP traffic. NSG rules look correct on the NIC but not the subnet. Which Network Watcher tool quickly tells you whether traffic is allowed or denied and which NSG rule is responsible?',
    options: opts4(
      'IP flow verify',
      'Connection monitor',
      'Topology',
      'NSG flow logs export only'
    ),
    correct: ['a'],
    explanation: 'IP flow verify checks whether a packet (source/dest IP, port, protocol, direction) is allowed or denied and names the NSG rule responsible — exactly this diagnosis. Connection monitor measures ongoing reachability; topology draws the map; flow logs require analysis.',
    references: [REF_IP_FLOW, REF_NETWORK_WATCHER]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a record of all IP traffic flowing through your virtual networks for security analytics, independent of any specific NSG. Which feature should you enable?',
    options: opts4(
      'Virtual network flow logs',
      'A single NSG with logging disabled',
      'Azure DNS query logging',
      'Application Gateway access logs'
    ),
    correct: ['a'],
    explanation: 'Virtual network flow logs capture IP traffic at the VNet level (the successor to NSG flow logs) for security analytics, e.g. with Traffic Analytics. DNS query logs and Application Gateway access logs capture only their own service\'s traffic.',
    references: [REF_FLOW_LOGS, REF_NETWORK_WATCHER]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need a managed, stateful, cloud-native firewall with FQDN filtering, threat intelligence-based filtering, and centrally managed rules for an entire hub-and-spoke network. Which service should you deploy?',
    options: opts4(
      'Azure Firewall',
      'A network security group',
      'Azure Bastion',
      'A Web Application Firewall policy'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall is the managed, stateful, cloud-native network firewall with FQDN/application rules, threat-intelligence filtering, and central rule management. NSGs are basic stateful 5-tuple filters; Bastion is for VM access; WAF protects L7 web apps only.',
    references: [REF_AZURE_FIREWALL, REF_FIREWALL_SKU]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In Azure Firewall, a request matches both a network rule and an application rule. Which rule type is evaluated first?',
    options: opts4(
      'Network rules are processed before application rules',
      'Application rules are processed before network rules',
      'DNAT rules are processed last',
      'Rules are processed in random order'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall processes rules in priority order by type: DNAT rules first, then network rules, then application rules. So network rules are evaluated before application rules; if a network rule allows the traffic, application rules are not evaluated for it.',
    references: [REF_FIREWALL_RULES, REF_AZURE_FIREWALL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to centrally create and assign Azure Firewall rule collections (as policies) across multiple firewalls in different regions. Which service should you use?',
    options: opts4(
      'Azure Firewall Manager with Firewall Policy',
      'A single NSG shared across regions',
      'Azure Virtual Network Manager security admin rules',
      'A route table'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall Manager with Firewall Policy centrally creates and assigns firewall rule collections to multiple Azure Firewalls, including across regions, with hierarchy/inheritance. NSGs can\'t be "shared"; AVNM security admin rules are NSG-level; route tables route, not filter.',
    references: [REF_FIREWALL_MANAGER, REF_FIREWALL_POLICY]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A public web application behind Application Gateway must be protected from SQL injection and cross-site scripting using managed OWASP rule sets. What should you configure?',
    options: opts4(
      'A Web Application Firewall (WAF) policy associated with the Application Gateway',
      'A network security group on the App Gateway subnet',
      'Azure Firewall in front of the App Gateway',
      'A service endpoint policy'
    ),
    correct: ['a'],
    explanation: 'A WAF policy on Application Gateway applies managed OWASP rule sets to block SQLi/XSS and other L7 attacks. NSGs filter L3/L4; Azure Firewall is a network firewall (not OWASP L7 web protection); service endpoint policies scope PaaS access.',
    references: [REF_WAF_APPGW, REF_WAF]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You are testing a new WAF rule set and want it to log requests that would be blocked, without actually blocking them yet. Which WAF mode should you use?',
    options: opts4(
      'Detection mode',
      'Prevention mode',
      'Bypass mode',
      'Disabled mode'
    ),
    correct: ['a'],
    explanation: 'Detection mode logs (monitors) requests that match rules without blocking them — ideal for tuning before enforcement. Prevention mode actively blocks. There is no "bypass" mode, and disabling the WAF removes protection and logging entirely.',
    references: [REF_WAF, REF_WAF_APPGW]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to provide secure RDP/SSH access to Azure VMs without exposing public IPs or opening inbound 3389/22 from the internet. Which service should you use?',
    options: opts4(
      'Azure Bastion',
      'A public IP plus an NSG allow rule for 3389',
      'A point-to-site VPN for every admin',
      'Azure Firewall DNAT to each VM'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion provides browser-based RDP/SSH to VMs over TLS without public IPs on the VMs or inbound 3389/22 from the internet. A public IP + NSG allow rule exposes the VM; P2S per admin is heavyweight; Firewall DNAT still publishes the ports.',
    references: [REF_BASTION, REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You must apply baseline "deny" security rules across many VNets that subscription owners cannot override with their own NSGs. Which capability enforces this?',
    options: opts4(
      'Azure Virtual Network Manager security admin rules',
      'A standard NSG applied per subnet',
      'A route table with a blackhole route',
      'A WAF policy in prevention mode'
    ),
    correct: ['a'],
    explanation: 'Azure Virtual Network Manager security admin rules are evaluated before NSG rules and cannot be overridden by individual NSGs — ideal for org-wide enforced baselines. Per-subnet NSGs can be changed by owners; blackhole routes drop traffic but aren\'t security policy; WAF is L7 web only.',
    references: [REF_AVNM, REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about network security groups (NSGs).',
    options: opts4(
      'An NSG can be associated with a subnet and/or a network interface.',
      'NSGs are stateful — a permitted inbound flow allows the return traffic automatically.',
      'NSG rules are evaluated in priority order, lowest number first.',
      'NSGs can filter traffic based on OWASP managed rule sets.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'NSGs attach to subnets and/or NICs, are stateful, and process rules by priority (lowest number first). OWASP managed rule sets are a Web Application Firewall (L7) feature — NSGs filter on the 5-tuple, not application-layer attack signatures.',
    references: [REF_NSG, REF_NSG_HOWTO]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Design and implement core networking infrastructure (18) ──
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A virtual network is created with address space 10.1.0.0/16. What is the largest subnet you can create within it, and how many IP addresses does Azure reserve in each subnet?',
    options: opts4(
      'Up to 10.1.0.0/16 itself; Azure reserves 5 IP addresses per subnet',
      'Up to /24 only; Azure reserves 2 addresses per subnet',
      'Up to /16; Azure reserves 0 addresses',
      'Up to /27; Azure reserves 8 addresses'
    ),
    correct: ['a'],
    explanation: 'A subnet can be as large as the VNet address space. Azure reserves 5 addresses in every subnet: the first (network), the next three (default gateway + 2 for DNS mapping), and the last (broadcast).',
    references: [REF_SUBNET, REF_VNET_PLAN]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want VMs in a subnet to use a third-party DNS server at 10.5.0.10 for name resolution instead of Azure-provided DNS. Where do you configure this?',
    options: opts4(
      'Custom DNS servers on the virtual network (or NIC) settings',
      'A private DNS zone linked to the VNet',
      'An NSG outbound rule for port 53',
      'A user-defined route for 10.5.0.10'
    ),
    correct: ['a'],
    explanation: 'Custom DNS server IPs are set at the VNet level (or overridden per-NIC). Private DNS zones serve Azure-managed zones, not arbitrary forwarding; NSG rules and UDRs control traffic flow, not which resolver VMs use.',
    references: [REF_VNET_DNS, REF_DNS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a public IP address whose value will never change for the lifetime of the resource it is associated with. Which allocation method should you choose?',
    options: opts4(
      'Static allocation on a Standard SKU public IP',
      'Dynamic allocation on a Basic SKU public IP',
      'Dynamic allocation on a Standard SKU public IP',
      'No allocation — use a private IP'
    ),
    correct: ['a'],
    explanation: 'Standard SKU public IPs are always static. Dynamic public IPs (Basic) can change when the resource is deallocated. Standard SKU does not support dynamic allocation. A private IP is not a public IP.',
    references: [REF_PUBLIC_IP, REF_PUBLIC_IP_PREFIX]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Spoke VNet-1 and spoke VNet-2 are both peered to a hub VNet but cannot reach each other. Why, and what is the standard fix?',
    options: opts4(
      'Peering is non-transitive; deploy an NVA or Azure Firewall in the hub with UDRs so spokes route through it',
      'Peering is transitive; just wait for routes to propagate',
      'Add a public IP to each spoke VM',
      'Enable a service endpoint on each spoke'
    ),
    correct: ['a'],
    explanation: 'VNet peering is non-transitive — spoke-to-spoke traffic does not flow through the hub automatically. The standard fix is a routing appliance (Azure Firewall or an NVA) in the hub plus UDRs on the spokes pointing spoke-to-spoke traffic at it.',
    references: [REF_PEERING, REF_UDR]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You associate a route table containing a 0.0.0.0/0 → Virtual appliance route with the GatewaySubnet to force on-premises-bound traffic through a firewall. What is this configuration called?',
    options: opts4(
      'Forced tunneling',
      'Service chaining',
      'Gateway transit',
      'Split tunneling'
    ),
    correct: ['a'],
    explanation: 'Forced tunneling redirects internet-bound (or all) traffic back through an on-premises site or an NVA for inspection rather than letting it egress directly. Service chaining links NVAs via UDRs; gateway transit shares a gateway; split tunneling is a VPN client concept.',
    references: [REF_FORCED_TUNNEL, REF_UDR]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must connect 200 spoke VNets to a hub with full any-to-any connectivity managed centrally, applied automatically to new spokes as they are added. Which Azure Virtual Network Manager feature should you use?',
    options: opts4(
      'A connectivity configuration with a mesh (or hub-and-spoke) topology on a dynamic network group',
      'Manual VNet peering between every pair',
      'A security admin rule configuration',
      'A route table shared by all spokes'
    ),
    correct: ['a'],
    explanation: 'Virtual Network Manager connectivity configurations apply hub-and-spoke or mesh topologies to network groups; with a dynamic (Azure Policy-based) group, new VNets are added automatically. Manual peering doesn\'t scale; security admin rules are for NSG-style filtering, not topology.',
    references: [REF_AVNM, REF_PEERING]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to bring your own publicly owned IP range into Azure so Azure advertises it and you can allocate public IPs from it. Which feature provides this?',
    options: opts4(
      'Custom IP address prefix (BYOIP)',
      'Public IP address prefix',
      'Azure NAT Gateway',
      'A local network gateway'
    ),
    correct: ['a'],
    explanation: 'A custom IP address prefix (bring your own IP / BYOIP) onboards a public range you own into Azure; Azure then advertises it and you create public IP prefixes/addresses from it. A standard public IP prefix uses Microsoft-owned ranges. NAT gateway and local network gateways are unrelated.',
    references: [REF_BYOIP, REF_PUBLIC_IP_PREFIX]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need continuous, alertable monitoring of round-trip latency and packet loss between an Azure VM and an on-premises endpoint. Which Network Watcher capability fits best?',
    options: opts4(
      'Connection monitor',
      'IP flow verify',
      'Topology',
      'Packet capture'
    ),
    correct: ['a'],
    explanation: 'Connection monitor provides continuous reachability/latency/packet-loss monitoring with alerting across Azure and hybrid endpoints. IP flow verify is a one-shot allow/deny check; topology draws a map; packet capture records traffic for a window.',
    references: [REF_CONN_MONITOR, REF_NETWORK_WATCHER]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A private DNS zone for an Azure region must be usable by VMs in three different VNets. What must you create?',
    options: opts4(
      'A virtual network link from the private DNS zone to each of the three VNets',
      'A peering between the three VNets only',
      'A public DNS zone delegation',
      'A separate private DNS zone per VNet'
    ),
    correct: ['a'],
    explanation: 'A private DNS zone is used by a VNet only when a virtual network link connects them; link the zone to all three VNets. Peering alone does not share private DNS zones; public delegation is for public zones; duplicating the zone is unnecessary and error-prone.',
    references: [REF_PRIVATE_DNS, REF_VNET_DNS]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A subnet has both a route table and the default system routes. A UDR for 10.0.0.0/24 → Virtual appliance and a system route for 10.0.0.0/16 → Virtual network both exist. Which route wins for a packet to 10.0.0.5?',
    options: opts4(
      'The UDR 10.0.0.0/24 — Azure picks the longest prefix match, and UDRs win ties over system routes',
      'The system route 10.0.0.0/16 — system routes always win',
      'Neither — the packet is dropped',
      'Both are applied and the packet is duplicated'
    ),
    correct: ['a'],
    explanation: 'Azure selects the route with the longest prefix match (/24 over /16). When prefixes tie, user-defined routes take precedence over BGP and system routes. So the /24 UDR to the appliance is used.',
    references: [REF_UDR, REF_ROUTE_TABLE]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to capture packets on a running Azure VM for a defined time window to troubleshoot an application issue. Which Network Watcher feature should you use?',
    options: opts4(
      'Packet capture',
      'Connection troubleshoot',
      'NSG diagnostics',
      'Topology'
    ),
    correct: ['a'],
    explanation: 'Network Watcher packet capture records traffic to/from a VM for a configured duration or size, storing it for analysis. Connection troubleshoot tests reachability; NSG diagnostics evaluates rules; topology draws the resource map.',
    references: [REF_NETWORK_WATCHER, REF_CONN_MONITOR]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a NAT gateway to provide outbound connectivity for two subnets in the same VNet. What is the correct association model?',
    options: opts4(
      'Associate the single NAT gateway with each of the two subnets',
      'Deploy one NAT gateway per VM',
      'Associate the NAT gateway with the VNet as a whole',
      'NAT gateway cannot serve more than one subnet'
    ),
    correct: ['a'],
    explanation: 'A NAT gateway is associated at the subnet level and can be associated with multiple subnets in the same VNet and zone. It is not associated with the VNet as a whole or with individual VMs.',
    references: [REF_NAT_GATEWAY, REF_SUBNET]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which subnet must exist (with that exact name) before you can deploy a VPN or ExpressRoute virtual network gateway?',
    options: opts4(
      'GatewaySubnet',
      'AzureBastionSubnet',
      'AzureFirewallSubnet',
      'RouteServerSubnet'
    ),
    correct: ['a'],
    explanation: 'Virtual network gateways (VPN and ExpressRoute) require a subnet named exactly GatewaySubnet. AzureBastionSubnet is for Bastion, AzureFirewallSubnet for Azure Firewall, and RouteServerSubnet for Azure Route Server.',
    references: [REF_VPN_GATEWAY, REF_SUBNET]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A subnet hosts Azure SQL Managed Instance and you must apply route control without breaking the managed instance\'s required service routes. Which approach is correct?',
    options: opts4(
      'Apply a route table that keeps the SQL Managed Instance required routes/management traffic intact',
      'Remove all routes from the subnet',
      'Disable the subnet delegation',
      'Apply a 0.0.0.0/0 → None route to the subnet'
    ),
    correct: ['a'],
    explanation: 'A delegated SQL Managed Instance subnet requires certain routes/management connectivity; any custom route table must preserve those. Removing routes, dropping delegation, or blackholing default traffic breaks the managed instance.',
    references: [REF_ROUTE_TABLE, REF_SUBNET_DELEGATION]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to associate one public IP address with an Azure VM\'s network interface so the VM is directly reachable from the internet. Where is the public IP attached?',
    options: opts4(
      'To an IP configuration on the VM\'s network interface (NIC)',
      'To the virtual network',
      'To the subnet',
      'To the resource group'
    ),
    correct: ['a'],
    explanation: 'A public IP is associated with an IP configuration of the NIC (or with a load balancer / gateway). It is not attached to a VNet, subnet, or resource group.',
    references: [REF_PUBLIC_IP, REF_PRIVATE_IP]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Microsoft Defender for Cloud reports a network security recommendation for one of your subnets. Where would you review the attack surface that led to the recommendation?',
    options: opts4(
      'Microsoft Defender for Cloud Secure Score and attack path analysis',
      'Azure Network Watcher topology',
      'The VNet\'s peering blade',
      'The route table\'s effective routes'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud Secure Score and attack path analysis surface network security recommendations and the exploitable paths behind them. Network Watcher topology, peering, and effective routes show connectivity/routing but not security posture findings.',
    references: [REF_DDOS, REF_NETWORK_WATCHER]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need name resolution between VMs in two peered VNets using their host names without configuring custom DNS. Which option works?',
    options: opts4(
      'A private DNS zone linked to both VNets with auto-registration enabled',
      'Azure-provided default DNS, which resolves names across peered VNets automatically',
      'A public DNS zone',
      'An NSG rule allowing port 53'
    ),
    correct: ['a'],
    explanation: 'Azure-provided default DNS only resolves names within a single VNet, not across peered VNets. A private DNS zone linked to both VNets (with auto-registration) provides cross-VNet host name resolution. Public zones and NSG rules don\'t solve this.',
    references: [REF_PRIVATE_DNS, REF_VNET_DNS]
  },
  {
    domain: CORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure user-defined routes (UDRs) and routing.',
    options: opts4(
      'Azure selects routes using longest-prefix match.',
      'When prefixes are equal, UDRs take precedence over BGP and system routes.',
      'A route with next hop type "None" drops traffic matching its prefix.',
      'A route table can be associated with a VNet directly (not a subnet).'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Azure uses longest-prefix match; UDRs win ties over BGP/system routes; next hop "None" blackholes traffic. Route tables are associated with SUBNETS, not with a VNet as a whole.',
    references: [REF_UDR, REF_ROUTE_TABLE]
  },

  // ── Design, implement, and manage connectivity services (14) ──
  {
    domain: CONNECTIVITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You are designing a site-to-site VPN and need to support BGP for dynamic route exchange with on-premises. Which VPN connection type must you use?',
    options: opts4(
      'Route-based VPN',
      'Policy-based VPN',
      'Point-to-site VPN',
      'ExpressRoute Microsoft peering'
    ),
    correct: ['a'],
    explanation: 'Route-based VPNs support BGP and dynamic routing. Policy-based VPNs use static traffic selectors and do not support BGP. Point-to-site connects individual clients; Microsoft peering is an ExpressRoute concept.',
    references: [REF_VPN_POLICY, REF_VPN_GATEWAY]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a site-to-site VPN gateway design that remains available if a single gateway instance fails, with two on-premises VPN devices. Which design provides the highest availability?',
    options: opts4(
      'Active-active Azure VPN gateway connected to two on-premises VPN devices',
      'Active-standby Azure VPN gateway to a single device',
      'A Basic SKU gateway',
      'A policy-based gateway with one tunnel'
    ),
    correct: ['a'],
    explanation: 'An active-active VPN gateway uses two gateway instances each with its own public IP, and connecting to dual on-premises devices maximizes resilience. Active-standby has a brief failover; Basic SKU lacks active-active; a single policy-based tunnel is least resilient.',
    references: [REF_VPN_HA, REF_VPN_SKU]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A point-to-site VPN must scale to 500 simultaneous client connections. What primarily determines whether this is supported?',
    options: opts4(
      'The virtual network gateway SKU (higher SKUs support more P2S connections)',
      'The number of subnets in the VNet',
      'The local network gateway configuration',
      'The number of public IP prefixes'
    ),
    correct: ['a'],
    explanation: 'The maximum number of concurrent point-to-site connections is determined by the VPN gateway SKU — higher SKUs support more P2S clients. Subnets, local network gateways (S2S only), and public IP prefixes do not govern P2S scale.',
    references: [REF_VPN_SKU, REF_P2S_VPN]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure point-to-site VPN with Azure certificate authentication. What must each client device have to connect?',
    options: opts4(
      'A client certificate issued from the root certificate uploaded to the gateway',
      'A pre-shared key matching the local network gateway',
      'A RADIUS server IP address',
      'The on-premises VPN device public IP'
    ),
    correct: ['a'],
    explanation: 'With P2S certificate authentication, the gateway holds the root (public) certificate and each client must have a client certificate issued from that root. Pre-shared keys and on-prem device IPs are S2S concepts; RADIUS is a different P2S auth method.',
    references: [REF_P2S_VPN, REF_P2S_AUTH]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'On-premises users need an always-connected, device-tunnel VPN to Azure that authenticates with Microsoft Entra ID. Which combination should you specify?',
    options: opts4(
      'Always On VPN with an Azure VPN gateway using the OpenVPN protocol and Microsoft Entra ID authentication',
      'A policy-based S2S VPN',
      'ExpressRoute Direct',
      'A Basic SKU gateway with SSTP'
    ),
    correct: ['a'],
    explanation: 'Always On VPN to Azure requires a route-based gateway, the OpenVPN protocol, and (for identity) Microsoft Entra ID authentication. Policy-based S2S is site-level, ExpressRoute is private circuit connectivity, and Basic SKU lacks the needed P2S capabilities.',
    references: [REF_P2S_AUTH, REF_P2S_VPN]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which ExpressRoute connectivity model connects your on-premises network to Azure by co-locating equipment in a facility where Microsoft has a presence?',
    options: opts4(
      'CloudExchange co-location',
      'Any-to-any (IPVPN)',
      'Point-to-point Ethernet',
      'Site-to-site VPN'
    ),
    correct: ['a'],
    explanation: 'The CloudExchange co-location model connects when you are co-located in a facility with a cloud exchange. Any-to-any (IPVPN) integrates your WAN; point-to-point Ethernet is a direct link. Site-to-site VPN is not an ExpressRoute model.',
    references: [REF_ER_MODELS, REF_EXPRESSROUTE]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You need dedicated 10-Gbps or 100-Gbps physical ExpressRoute ports provisioned directly into Microsoft\'s network, supporting MACsec encryption. Which option should you choose?',
    options: opts4(
      'ExpressRoute Direct',
      'ExpressRoute Global Reach',
      'ExpressRoute FastPath',
      'A standard ExpressRoute circuit via a provider'
    ),
    correct: ['a'],
    explanation: 'ExpressRoute Direct provisions dedicated physical ports (10/100 Gbps) into Microsoft\'s network and supports MACsec on the ports. Global Reach links circuits; FastPath bypasses the gateway; a provider circuit shares provider infrastructure.',
    references: [REF_ER_DIRECT, REF_EXPRESSROUTE]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'An ExpressRoute circuit must connect to a virtual network. Which resource is required in the VNet?',
    options: opts4(
      'An ExpressRoute virtual network gateway in the GatewaySubnet',
      'A VPN virtual network gateway only',
      'A NAT gateway',
      'A local network gateway'
    ),
    correct: ['a'],
    explanation: 'Connecting an ExpressRoute circuit to a VNet requires an ExpressRoute-type virtual network gateway deployed in the GatewaySubnet. A VPN-type gateway is for VPN connections; NAT and local network gateways serve other roles.',
    references: [REF_ER_GATEWAY, REF_EXPRESSROUTE]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want sub-second detection of an ExpressRoute link failure so routing fails over quickly. Which feature should you enable?',
    options: opts4(
      'Bidirectional Forwarding Detection (BFD)',
      'FastPath',
      'Global Reach',
      'Forced tunneling'
    ),
    correct: ['a'],
    explanation: 'BFD provides fast (sub-second) detection of link failures over ExpressRoute so BGP can reconverge quickly. FastPath optimizes the data path, Global Reach links circuits, and forced tunneling redirects traffic — none accelerate failure detection.',
    references: [REF_ER_GATEWAY, REF_EXPRESSROUTE]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'In an Azure Virtual WAN, what is the role of a virtual hub?',
    options: opts4(
      'A Microsoft-managed central network hub that contains gateways and routing for connected VNets and branches',
      'A customer-managed VM that routes traffic',
      'A DNS zone for the Virtual WAN',
      'A storage account for VPN logs'
    ),
    correct: ['a'],
    explanation: 'A virtual hub is a Microsoft-managed hub VNet within Virtual WAN that hosts the VPN/ExpressRoute/P2S gateways and routing, connecting spokes and branches. It is not a customer VM, a DNS zone, or a storage account.',
    references: [REF_VWAN, REF_VWAN_HUB_ROUTING]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'When deploying a VPN gateway into a Virtual WAN virtual hub, what determines its throughput capacity?',
    options: opts4(
      'The number of scale units configured for the gateway',
      'The size of the GatewaySubnet',
      'The Virtual WAN SKU only',
      'The number of route tables in the hub'
    ),
    correct: ['a'],
    explanation: 'Each Virtual WAN hub gateway (VPN, ExpressRoute, P2S) is sized by scale units, which determine aggregate throughput. Virtual WAN hubs do not use a GatewaySubnet; route table count and the WAN type don\'t set gateway throughput.',
    references: [REF_VWAN, REF_VWAN_HUB_ROUTING]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to choose a Virtual WAN type that supports both VPN/ExpressRoute connectivity and full virtual hub routing/security features. Which Virtual WAN SKU should you select?',
    options: opts4(
      'Standard Virtual WAN',
      'Basic Virtual WAN',
      'Premium Virtual WAN',
      'Free Virtual WAN'
    ),
    correct: ['a'],
    explanation: 'Standard Virtual WAN supports ExpressRoute, VPN (S2S and P2S), inter-hub/VNet-to-VNet transit, and hub routing. Basic Virtual WAN supports only site-to-site VPN. There is no "Premium" or "Free" Virtual WAN SKU.',
    references: [REF_VWAN, REF_VWAN_HUB_ROUTING]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A site-to-site VPN connection shows status "Connecting" and never reaches "Connected". Which is the most likely cause to check first?',
    options: opts4(
      'Mismatched IPsec/IKE settings or shared key between Azure and the on-premises device',
      'The GatewaySubnet is too large',
      'The VNet has too many subnets',
      'A private DNS zone is missing'
    ),
    correct: ['a'],
    explanation: 'A tunnel stuck in "Connecting" is most often caused by mismatched IPsec/IKE parameters or a wrong pre-shared key between the two ends. GatewaySubnet size, subnet count, and DNS zones do not prevent tunnel establishment.',
    references: [REF_IPSEC, REF_S2S_VPN]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure VPN Gateway.',
    options: opts4(
      'A route-based VPN gateway supports BGP and multiple site-to-site connections.',
      'The Basic SKU does not support BGP or active-active mode.',
      'A VPN gateway is deployed into a subnet named GatewaySubnet.',
      'A policy-based VPN gateway supports point-to-site connections.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Route-based gateways support BGP and multiple S2S connections; Basic SKU lacks BGP/active-active; gateways live in GatewaySubnet. Point-to-site connections require a route-based gateway — policy-based gateways do NOT support P2S.',
    references: [REF_VPN_GATEWAY, REF_VPN_SKU]
  },

  // ── Design and implement application delivery services (12) ──
  {
    domain: APPDELIVERY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure service uses DNS responses (not an inline data path) to direct clients to different endpoints?',
    options: opts4(
      'Azure Traffic Manager',
      'Azure Load Balancer',
      'Azure Application Gateway',
      'Azure Front Door'
    ),
    correct: ['a'],
    explanation: 'Traffic Manager is a DNS-based traffic director — it returns the DNS name of the chosen endpoint and is not in the data path. Load Balancer, Application Gateway, and Front Door all sit inline in the traffic path.',
    references: [REF_TRAFFIC_MANAGER, REF_TM_ROUTING]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need an internal Layer 4 load balancer to distribute traffic among backend VMs that should only be reachable from within the VNet. Which configuration should you use?',
    options: opts4(
      'A Standard internal Load Balancer with a private frontend IP',
      'A Standard public Load Balancer',
      'An Application Gateway with a public frontend',
      'Azure Front Door'
    ),
    correct: ['a'],
    explanation: 'An internal (private) Standard Load Balancer has a frontend IP from the VNet and is reachable only within the VNet/connected networks. A public Load Balancer or public App Gateway exposes the app; Front Door is a global public service.',
    references: [REF_LB, REF_LB_SKU]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'For an active/passive disaster-recovery design, Traffic Manager should send all traffic to the primary region and only use the secondary region if the primary is unhealthy. Which routing method achieves this?',
    options: opts4(
      'Priority routing',
      'Weighted routing',
      'Performance routing',
      'Multivalue routing'
    ),
    correct: ['a'],
    explanation: 'Priority routing sends all traffic to the highest-priority (primary) endpoint and fails over to the next only when the primary is unhealthy — the classic active/passive pattern. Weighted splits by ratio, Performance picks lowest latency, Multivalue returns multiple healthy endpoints.',
    references: [REF_TM_ROUTING, REF_TRAFFIC_MANAGER]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'An Application Gateway must host two different websites (contoso.com and fabrikam.com) on the same public IP, each routed to its own backend pool. Which feature enables this?',
    options: opts4(
      'Multi-site listeners (host-based routing)',
      'A single basic listener',
      'A health probe per backend',
      'A NAT rule'
    ),
    correct: ['a'],
    explanation: 'Multi-site listeners let one Application Gateway host multiple sites on the same IP/port, routing by host header to different backend pools. A basic listener handles one site; health probes check health; NAT rules are a Load Balancer concept.',
    references: [REF_APP_GW_COMPONENTS, REF_APP_GW]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.SINGLE,
    stem: 'You need end-to-end TLS encryption through Azure Front Door — encrypted from client to Front Door and re-encrypted from Front Door to the origin. How should you configure this?',
    options: opts4(
      'Enable HTTPS on the Front Door endpoint and configure the origin to use HTTPS so Front Door re-encrypts to the origin',
      'Use HTTP between Front Door and the origin to reduce latency',
      'Disable TLS at the endpoint and rely on the origin only',
      'Use a NAT gateway between Front Door and the origin'
    ),
    correct: ['a'],
    explanation: 'End-to-end TLS means TLS client→Front Door AND TLS Front Door→origin. Configure HTTPS on the endpoint and set the origin/route to forward over HTTPS so Front Door re-encrypts. HTTP to the origin breaks end-to-end encryption.',
    references: [REF_FRONT_DOOR, REF_FD_ROUTING]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'An Application Gateway backend pool keeps showing all servers as unhealthy even though the app responds on the VMs. Which configuration should you check first?',
    options: opts4(
      'The custom health probe path, host, and expected status codes',
      'The frontend IP SKU',
      'The number of listeners',
      'The public IP allocation method'
    ),
    correct: ['a'],
    explanation: 'When backends show unhealthy, the health probe is the first thing to verify — the probe path, host header, port, and expected status code range must match what the backend actually returns. Frontend IP SKU, listener count, and IP allocation don\'t cause backend health failures.',
    references: [REF_APP_GW_PROBES, REF_APP_GW_COMPONENTS]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need inbound RDP to three specific VMs behind a Standard public Load Balancer, each VM reachable on a different external port. What should you configure?',
    options: opts4(
      'Inbound NAT rules mapping distinct frontend ports to each VM\'s port 3389',
      'A single load-balancing rule for port 3389',
      'A health probe on port 3389',
      'An outbound rule for port 3389'
    ),
    correct: ['a'],
    explanation: 'Inbound NAT rules map a specific frontend IP:port to a specific backend VM:port (e.g. 50001→VM1:3389), giving per-VM reachability. A load-balancing rule distributes across the pool; probes check health; outbound rules govern egress SNAT.',
    references: [REF_LB_RULES, REF_LB]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Azure Front Door to redirect all HTTP requests to HTTPS and rewrite a legacy URL path to a new one. Which Front Door capability provides this?',
    options: opts4(
      'The Rules engine (URL redirect and URL rewrite rules)',
      'Caching configuration',
      'Health probes',
      'Origin groups'
    ),
    correct: ['a'],
    explanation: 'The Front Door Rules engine implements URL redirect (e.g. HTTP→HTTPS) and URL rewrite actions, plus header and routing manipulation. Caching stores responses; health probes check origins; origin groups define backends — none perform redirect/rewrite.',
    references: [REF_FD_ROUTING, REF_FRONT_DOOR]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Application Gateway must automatically add or remove instances based on traffic load. Which setting should you choose?',
    options: opts4(
      'Autoscaling (with the v2 SKU)',
      'Manual instance count on the v1 SKU',
      'A larger GatewaySubnet',
      'A weighted Traffic Manager profile'
    ),
    correct: ['a'],
    explanation: 'Application Gateway v2 supports autoscaling, adjusting capacity automatically with load. The v1 SKU uses a fixed manual instance count. Subnet size and Traffic Manager profiles don\'t scale the gateway.',
    references: [REF_APP_GW, REF_APP_GW_COMPONENTS]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.SINGLE,
    stem: 'A global application needs both global HTTP acceleration with WAF AND, behind it in one region, Layer 7 path-based routing to multiple microservice backends. Which combination is appropriate?',
    options: opts4(
      'Azure Front Door as the global entry point, with Application Gateway as the regional Layer 7 router',
      'Two Traffic Manager profiles chained together',
      'Azure Load Balancer in front of Front Door',
      'Application Gateway as the global entry point with Front Door regional'
    ),
    correct: ['a'],
    explanation: 'Front Door is the global L7 entry (acceleration, CDN, WAF); Application Gateway is the regional L7 router for path-based routing to microservices. Front Door cannot sit "behind" App Gateway as a regional component; chained Traffic Manager and L4 Load Balancer don\'t provide L7 routing.',
    references: [REF_FRONT_DOOR, REF_APP_GW]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to load balance UDP traffic for backend VMs. Which Azure service supports this?',
    options: opts4(
      'Azure Load Balancer',
      'Azure Application Gateway',
      'Azure Front Door',
      'Azure Traffic Manager (inline)'
    ),
    correct: ['a'],
    explanation: 'Azure Load Balancer is a Layer 4 service that supports both TCP and UDP. Application Gateway and Front Door are HTTP/HTTPS (Layer 7) only. Traffic Manager is DNS-based and not an inline UDP balancer.',
    references: [REF_LB, REF_LB_RULES]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Front Door.',
    options: opts4(
      'It is a global service with points of presence at the network edge.',
      'It can cache content to offload origins.',
      'It can connect to an origin privately using Azure Private Link (Premium tier).',
      'It performs Layer 4 UDP load balancing.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Front Door is a global edge service, can cache content, and (Premium) can reach origins via Private Link. It is a Layer 7 HTTP/HTTPS service — it does NOT do Layer 4 UDP load balancing (that is Azure Load Balancer).',
    references: [REF_FRONT_DOOR, REF_FD_CACHING, REF_FD_PRIVATE_LINK]
  },

  // ── Design and implement private access to Azure services (8) ──
  {
    domain: PRIVATE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A private endpoint consumes how many IP addresses, and from where?',
    options: opts4(
      'One private IP address from the subnet where the private endpoint is created',
      'One public IP address from a public IP prefix',
      'No IP address — it uses the service\'s public IP',
      'A full /28 subnet of private IP addresses'
    ),
    correct: ['a'],
    explanation: 'A private endpoint is a NIC that takes a single private IP from the subnet it is deployed into. It does not use a public IP or consume a whole subnet.',
    references: [REF_PRIVATE_ENDPOINT, REF_PRIVATE_LINK]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable a service endpoint for Microsoft.Storage on a subnet and configure the storage account firewall to allow that subnet. What is the effect on traffic to the storage account?',
    options: opts4(
      'Traffic from that subnet reaches the storage account over the Azure backbone and the account can deny all other networks',
      'A private IP for the storage account is created in the subnet',
      'The storage account becomes globally public',
      'The subnet can no longer reach the internet'
    ),
    correct: ['a'],
    explanation: 'A service endpoint routes the subnet\'s traffic to the storage account over the Azure backbone and, with the account firewall set to allow that subnet, other networks can be denied. No private IP is created (that is a private endpoint); internet access is unaffected.',
    references: [REF_SERVICE_ENDPOINT, REF_SERVICE_ENDPOINT_POLICY]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You created a Private Link service for your internal application. How do consumers connect to it?',
    options: opts4(
      'They create a private endpoint in their own VNet that targets your Private Link service',
      'They peer their VNet directly to yours',
      'They add your service to their route table',
      'They use a service endpoint for your service'
    ),
    correct: ['a'],
    explanation: 'Consumers connect to a Private Link service by creating a private endpoint in their VNet that references the service — no VNet peering or shared routing needed, even across tenants. Service endpoints apply only to Azure first-party PaaS services.',
    references: [REF_PRIVATE_LINK_SERVICE, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 3, type: QType.SINGLE,
    stem: 'After creating a private endpoint for a storage account, you must ensure the privatelink DNS record exists and stays current automatically. What is the recommended approach?',
    options: opts4(
      'Integrate the private endpoint with an Azure private DNS zone (privatelink.blob.core.windows.net) so the A record is created and managed automatically',
      'Manually create an A record in a public DNS zone',
      'Disable DNS and use IP addresses directly',
      'Create a CNAME on the storage account'
    ),
    correct: ['a'],
    explanation: 'Integrating the private endpoint with the matching Azure private DNS zone causes the A record (resource → private IP) to be created and kept current automatically. Manual public-zone records are error-prone; using raw IPs and CNAMEs is not the supported pattern.',
    references: [REF_PE_DNS, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly describes a limitation of service endpoints compared with private endpoints?',
    options: opts4(
      'Service endpoints do not extend access to on-premises networks; private endpoints can be reached from on-premises',
      'Service endpoints assign a private IP; private endpoints do not',
      'Service endpoints work across Azure tenants; private endpoints do not',
      'Service endpoints require Azure Private Link; private endpoints do not'
    ),
    correct: ['a'],
    explanation: 'Service endpoints only apply to traffic originating in the Azure VNet — they cannot extend to on-premises clients. Private endpoints (private IP in the VNet) are reachable from on-premises over VPN/ExpressRoute. Private endpoints, not service endpoints, are built on Private Link.',
    references: [REF_SERVICE_ENDPOINT, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to prevent users in a subnet from using a service endpoint to reach storage accounts outside your organization. Which feature should you apply?',
    options: opts4(
      'A service endpoint policy listing only the approved storage accounts',
      'A network security group rule for port 443',
      'A private DNS zone',
      'A user-defined route to the internet'
    ),
    correct: ['a'],
    explanation: 'Service endpoint policies restrict service-endpoint traffic to an explicit allowlist of Azure resources (e.g. only your storage accounts), preventing exfiltration to external accounts. NSGs filter by IP/port, not by specific storage account identity.',
    references: [REF_SERVICE_ENDPOINT_POLICY, REF_SERVICE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You disabled public network access on an Azure Key Vault and created a private endpoint. Applications in the VNet now fail to resolve the vault. What is the fix?',
    options: opts4(
      'Link the privatelink.vaultcore.azure.net private DNS zone to the VNet and ensure the A record points to the private endpoint IP',
      'Re-enable public network access on the Key Vault',
      'Add a service endpoint for Microsoft.KeyVault',
      'Assign a public IP to the private endpoint'
    ),
    correct: ['a'],
    explanation: 'With public access disabled, clients must resolve the vault FQDN to the private endpoint IP via the privatelink.vaultcore.azure.net private DNS zone linked to the VNet. Re-enabling public access defeats the purpose; service endpoints/public IPs are not the fix.',
    references: [REF_PE_DNS, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements comparing service endpoints and private endpoints.',
    options: opts4(
      'A private endpoint gives the PaaS service a private IP inside your VNet.',
      'A service endpoint has no additional cost; private endpoints are billed.',
      'A private endpoint can be reached from on-premises over VPN/ExpressRoute.',
      'A service endpoint can expose your own custom service to other tenants.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Private endpoints assign a VNet private IP and are reachable from on-premises; service endpoints are free, private endpoints are billed. Exposing your OWN service to other tenants requires a Private Link service — service endpoints only apply to Azure first-party PaaS.',
    references: [REF_PRIVATE_ENDPOINT, REF_SERVICE_ENDPOINT, REF_PRIVATE_LINK_SERVICE]
  },

  // ── Design and implement Azure network security services (13) ──
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'At what two scopes can a network security group be associated?',
    options: opts4(
      'A subnet and/or a network interface',
      'A virtual network and/or a resource group',
      'A subscription and/or a management group',
      'A public IP and/or a route table'
    ),
    correct: ['a'],
    explanation: 'An NSG can be associated with a subnet and/or a NIC. It cannot be associated with a VNet, resource group, subscription, management group, public IP, or route table.',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'An NSG has a custom rule with priority 200 that denies TCP 443 and a custom rule with priority 100 that allows TCP 443. What happens to a TCP 443 packet?',
    options: opts4(
      'It is allowed — the lower priority number (100) is evaluated first and matches',
      'It is denied — deny rules always override allow rules',
      'It is denied — the higher priority number wins',
      'It is dropped — conflicting rules cancel out'
    ),
    correct: ['a'],
    explanation: 'NSG rules are processed in priority order, lowest number first. The allow rule at priority 100 is evaluated before the deny at 200; once a rule matches, processing stops. So the packet is allowed.',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to group several VM NICs as "database servers" so a single NSG rule can allow only "web servers" to reach them on TCP 1433. What should you create?',
    options: opts4(
      'Two application security groups (web and database) referenced in the NSG rule',
      'Two route tables',
      'Two private DNS zones',
      'Two service endpoint policies'
    ),
    correct: ['a'],
    explanation: 'Application security groups let you label NICs (web, database) and write an NSG rule with source = web ASG, destination = database ASG, port 1433. Route tables, DNS zones, and service endpoint policies cannot express this VM-group-to-VM-group intent.',
    references: [REF_ASG, REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Both a subnet NSG and the NIC NSG are present on a VM. For inbound traffic, in what order are they evaluated?',
    options: opts4(
      'The subnet NSG is evaluated first, then the NIC NSG; traffic must be allowed by both',
      'The NIC NSG first, then the subnet NSG; either one allowing is enough',
      'Only the NIC NSG is evaluated',
      'Only the subnet NSG is evaluated'
    ),
    correct: ['a'],
    explanation: 'For inbound traffic Azure evaluates the subnet NSG first, then the NIC NSG; the traffic must be allowed by both to reach the VM. (For outbound, the order is reversed: NIC then subnet.)',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to analyze allowed and denied IP traffic across your VNets in Azure Monitor with rich visualizations and insights. Which combination should you use?',
    options: opts4(
      'Virtual network flow logs with Traffic Analytics',
      'IP flow verify run on a schedule',
      'Azure DNS analytics',
      'A WAF policy log'
    ),
    correct: ['a'],
    explanation: 'Virtual network flow logs capture the traffic, and Traffic Analytics processes them into dashboards and insights in a Log Analytics workspace. IP flow verify is a single-packet check; DNS analytics and WAF logs cover different layers.',
    references: [REF_FLOW_LOGS, REF_NETWORK_WATCHER]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Azure Firewall needs to be deployed into a VNet. What is the subnet requirement?',
    options: opts4(
      'A subnet named AzureFirewallSubnet of at least /26',
      'A subnet named GatewaySubnet of at least /27',
      'Any delegated subnet',
      'The AzureBastionSubnet'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall requires a dedicated subnet named exactly AzureFirewallSubnet, sized /26 or larger. GatewaySubnet is for VPN/ER gateways; AzureBastionSubnet is for Bastion; Azure Firewall does not use subnet delegation.',
    references: [REF_AZURE_FIREWALL, REF_FIREWALL_SKU]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You need Azure Firewall to allow outbound access only to *.windowsupdate.com and *.microsoft.com by FQDN. Which Azure Firewall rule type should you use?',
    options: opts4(
      'Application rules',
      'Network rules',
      'DNAT rules',
      'NSG rules'
    ),
    correct: ['a'],
    explanation: 'Application rules filter outbound HTTP/HTTPS (and other protocols) by FQDN and FQDN tags. Network rules filter by IP/port/protocol; DNAT rules translate inbound traffic; NSGs are not part of Azure Firewall.',
    references: [REF_FIREWALL_RULES, REF_AZURE_FIREWALL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need Azure Firewall to publish an on-premises-inaccessible internal web server to the internet by translating an inbound public IP:port to the server\'s private IP. Which rule type should you use?',
    options: opts4(
      'A DNAT rule',
      'A network rule',
      'An application rule',
      'A service endpoint policy'
    ),
    correct: ['a'],
    explanation: 'DNAT (destination network address translation) rules translate an inbound public IP:port on the firewall to a private destination, publishing internal services. Network and application rules filter traffic; service endpoint policies scope PaaS access.',
    references: [REF_FIREWALL_RULES, REF_AZURE_FIREWALL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Firewall SKU should you choose when you require IDPS (intrusion detection and prevention) and TLS inspection?',
    options: opts4(
      'Premium',
      'Standard',
      'Basic',
      'Free'
    ),
    correct: ['a'],
    explanation: 'The Azure Firewall Premium SKU adds IDPS, TLS inspection, URL filtering, and web categories. Standard provides core L3-L7 filtering and threat intelligence; Basic is for SMB/low throughput; there is no Free SKU.',
    references: [REF_FIREWALL_SKU, REF_AZURE_FIREWALL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You manage 6 Azure Firewalls and want all of them to inherit a common base set of rules, while each can add local rules. Which Firewall Policy capability supports this?',
    options: opts4(
      'Policy inheritance — a child policy inherits from a parent policy',
      'A single NSG shared by all firewalls',
      'Copying rules manually into each firewall',
      'A route table associated with AzureFirewallSubnet'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall Policy supports a parent-child hierarchy: child policies inherit the parent\'s rule collections and add their own. NSGs are not firewall policies; manual copying is error-prone; route tables route traffic, they don\'t define firewall rules.',
    references: [REF_FIREWALL_POLICY, REF_FIREWALL_MANAGER]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A WAF policy on Azure Front Door must block requests originating from a specific set of countries. Which WAF rule type should you create?',
    options: opts4(
      'A custom rule with a geo-match (GeoMatch) condition',
      'A managed OWASP rule',
      'A rate-limit rule with no conditions',
      'A bot protection rule set only'
    ),
    correct: ['a'],
    explanation: 'A WAF custom rule with a GeoMatch condition on the source country/region blocks or allows traffic by geography. Managed OWASP rules target injection/XSS; rate limiting throttles by volume; bot rules target bots — none filter by country.',
    references: [REF_WAF_FD, REF_WAF]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to confirm whether a specific inbound packet to a VM would be allowed or denied by the effective NSG rules, before users report a problem. Which Network Watcher tool gives an immediate allow/deny verdict?',
    options: opts4(
      'IP flow verify',
      'Connection monitor',
      'Packet capture',
      'Topology'
    ),
    correct: ['a'],
    explanation: 'IP flow verify takes a 5-tuple and direction and returns an immediate Allow/Deny verdict naming the NSG rule. Connection monitor is continuous reachability; packet capture records traffic; topology draws the resource map.',
    references: [REF_IP_FLOW, REF_NETWORK_WATCHER]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Firewall.',
    options: opts4(
      'It is a stateful, managed firewall service with built-in high availability.',
      'It processes DNAT rules, then network rules, then application rules.',
      'The Premium SKU supports IDPS and TLS inspection.',
      'It must be deployed into a subnet named GatewaySubnet.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Azure Firewall is stateful, managed, and highly available; rule processing order is DNAT → network → application; Premium adds IDPS and TLS inspection. It deploys into AzureFirewallSubnet, NOT GatewaySubnet (which is for VPN/ExpressRoute gateways).',
    references: [REF_AZURE_FIREWALL, REF_FIREWALL_RULES, REF_FIREWALL_SKU]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Design and implement core networking infrastructure (18) ──
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to segment a virtual network so that web, application, and database tiers are isolated and can have different NSGs and route tables. What should you create?',
    options: opts4(
      'Separate subnets for each tier within the VNet',
      'Three separate virtual networks with no peering',
      'One subnet with three NSGs',
      'A public IP prefix per tier'
    ),
    correct: ['a'],
    explanation: 'Subnets are the unit of segmentation within a VNet — each can have its own NSG and route table. Three unpeered VNets over-complicates connectivity; a subnet can have only one NSG; public IP prefixes don\'t segment.',
    references: [REF_SUBNET, REF_VNET_PLAN]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Two VNets must be peered, but VNet-A should be able to use VNet-B\'s NVA as a next hop for some traffic. Which peering setting must be enabled?',
    options: opts4(
      'Allow forwarded traffic on the peering',
      'Allow gateway transit on VNet-A',
      'Use remote gateways on VNet-B',
      'Disable the default outbound access'
    ),
    correct: ['a'],
    explanation: '"Allow forwarded traffic" permits traffic that did not originate in the peered VNet (e.g. forwarded by an NVA) to be accepted. Gateway transit / use remote gateways relate to sharing a VPN/ER gateway, not NVA forwarding.',
    references: [REF_PEERING, REF_UDR]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want predictable, zone-resilient outbound connectivity for a subnet of VMs that also resists SNAT exhaustion. How should you deploy NAT Gateway?',
    options: opts4(
      'Deploy a zonal NAT gateway and associate a standard public IP (or prefix), then associate it with the subnet',
      'Use a Basic public IP with NAT gateway',
      'Associate the NAT gateway with the VNet directly',
      'Use NAT gateway with a dynamic Basic SKU IP only'
    ),
    correct: ['a'],
    explanation: 'NAT gateway uses Standard SKU public IPs (or prefixes), is deployed to a zone, and is associated with subnets. It does not support Basic SKU IPs and is not associated with a VNet as a whole.',
    references: [REF_NAT_GATEWAY, REF_PUBLIC_IP]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You deploy Azure Route Server to enable an NVA to inject routes. Which subnet must exist for Route Server?',
    options: opts4(
      'A subnet named RouteServerSubnet of at least /27',
      'A subnet named GatewaySubnet of /29',
      'AzureFirewallSubnet',
      'A delegated subnet for Microsoft.Network/routeServers of any size'
    ),
    correct: ['a'],
    explanation: 'Azure Route Server requires a dedicated subnet named exactly RouteServerSubnet, /27 or larger. GatewaySubnet and AzureFirewallSubnet are for other services; Route Server uses a named subnet, not delegation.',
    references: [REF_ROUTE_SERVER, REF_SUBNET]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a hub-and-spoke network where spokes reach the internet only through an Azure Firewall in the hub. Which routing element forces spoke egress through the firewall?',
    options: opts4(
      'A user-defined route on each spoke subnet: 0.0.0.0/0 → Virtual appliance → firewall private IP',
      'A service endpoint on each spoke subnet',
      'A private DNS zone',
      'Global VNet peering'
    ),
    correct: ['a'],
    explanation: 'A UDR with 0.0.0.0/0 → Virtual appliance pointing to the hub firewall\'s private IP forces all spoke internet egress through the firewall. Service endpoints, DNS zones, and peering do not redirect default routes.',
    references: [REF_UDR, REF_AZURE_FIREWALL]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A VM in subnet A must resolve records in an Azure private DNS zone, but the zone is not linked to subnet A\'s VNet. What is the result?',
    options: opts4(
      'The VM cannot resolve the private zone records until a virtual network link is created',
      'The VM resolves them automatically because they share a region',
      'The VM resolves them via the public DNS root',
      'The zone is global and needs no link'
    ),
    correct: ['a'],
    explanation: 'A private DNS zone is only resolvable from VNets that have a virtual network link to it. Without the link, the VM cannot resolve those records — region, public DNS, and "global zone" assumptions do not apply.',
    references: [REF_PRIVATE_DNS, REF_VNET_DNS]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must apply an organization-wide rule that all VNets in a subscription are connected in a hub-and-spoke topology, including VNets created in the future, with no manual peering. Which solution should you use?',
    options: opts4(
      'Azure Virtual Network Manager with a hub-and-spoke connectivity configuration on a dynamic network group',
      'A single large flat VNet for the whole subscription',
      'A route table applied to every subnet',
      'ExpressRoute Global Reach'
    ),
    correct: ['a'],
    explanation: 'Virtual Network Manager applies a hub-and-spoke connectivity configuration to a dynamic network group (membership driven by Azure Policy), so future VNets join automatically without manual peering. A flat VNet, route tables, and Global Reach do not provide auto-applied topology.',
    references: [REF_AVNM, REF_PEERING]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to know the actual routes currently applied to a VM\'s network interface, including system, BGP, and user-defined routes. Where do you look?',
    options: opts4(
      'The effective routes view on the NIC (via Network Watcher or the NIC blade)',
      'The VNet address space',
      'The NSG inbound rules',
      'The public IP configuration'
    ),
    correct: ['a'],
    explanation: 'Effective routes on the NIC show the consolidated routing table actually in effect — system, BGP, and UDR. VNet address space, NSG rules, and public IPs do not show routing.',
    references: [REF_UDR, REF_NETWORK_WATCHER]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need on-premises DNS servers to resolve names in an Azure private DNS zone. Which Azure DNS Private Resolver component should on-premises servers forward queries to?',
    options: opts4(
      'An inbound endpoint of the Azure DNS Private Resolver',
      'An outbound endpoint of the Azure DNS Private Resolver',
      'A public DNS zone',
      'The Azure Firewall DNS proxy only'
    ),
    correct: ['a'],
    explanation: 'On-premises DNS forwards queries for Azure private zones to the Private Resolver\'s inbound endpoint. The outbound endpoint is for Azure→on-prem forwarding via rulesets. Public zones are unrelated; Firewall DNS proxy is a different feature.',
    references: [REF_DNS_RESOLVER, REF_PRIVATE_DNS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A subnet hosts an Azure resource that requires the subnet be reserved for that service\'s use. The portal shows the subnet as "delegated". What does delegation do?',
    options: opts4(
      'It designates the subnet for a specific Azure service so the service can deploy and manage its instances there',
      'It deletes all other resources in the subnet',
      'It makes the subnet publicly routable',
      'It applies an NSG automatically'
    ),
    correct: ['a'],
    explanation: 'Subnet delegation designates a subnet for a particular PaaS service, granting it permission to create service-specific resources and apply required policies. It does not delete resources, make the subnet public, or auto-apply an NSG.',
    references: [REF_SUBNET_DELEGATION, REF_SUBNET]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A spoke VNet has a UDR sending 0.0.0.0/0 to a hub firewall. A VM in that spoke must still receive inbound traffic from an Azure Load Balancer health probe. Why does the probe still work?',
    options: opts4(
      'Azure has a system route for the AzureLoadBalancer source (168.63.129.16) that ensures probe traffic is not blackholed by the default UDR',
      'The UDR is ignored for all inbound traffic',
      'Health probes use the public internet path',
      'The Load Balancer bypasses all routing'
    ),
    correct: ['a'],
    explanation: 'Azure platform traffic such as the load balancer health probe originates from 168.63.129.16 and is handled so it is not blackholed; NSGs must still allow the AzureLoadBalancer service tag. The UDR is not globally ignored, and probes do not use the internet path.',
    references: [REF_UDR, REF_LB]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to monitor the overall health and topology of all networking resources in a subscription from a single Azure Monitor experience. Which feature should you use?',
    options: opts4(
      'Azure Monitor Network Insights',
      'IP flow verify',
      'A single packet capture',
      'A route table export'
    ),
    correct: ['a'],
    explanation: 'Azure Monitor Network Insights provides a consolidated health, metrics, and topology view across networking resources. IP flow verify and packet capture are point diagnostics; a route table export shows only routing.',
    references: [REF_MONITOR_NETWORKS, REF_NETWORK_WATCHER]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about a public IP address prefix is correct?',
    options: opts4(
      'Public IP addresses created from a prefix come from a contiguous, known range that you can share with partners for allowlisting',
      'A prefix can only contain one IP address',
      'Prefixes are dynamic and the range changes daily',
      'A prefix is associated directly with a VM NIC'
    ),
    correct: ['a'],
    explanation: 'A public IP prefix reserves a contiguous block; IPs allocated from it are from that known, static range — useful for partner allowlisting. Prefixes hold multiple IPs, are static, and individual IPs (not the prefix) attach to resources.',
    references: [REF_PUBLIC_IP_PREFIX, REF_PUBLIC_IP]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want VMs in a VNet to register and resolve each other by hostname with zero configuration. What provides this within a single VNet?',
    options: opts4(
      'Azure-provided (default) DNS',
      'A public DNS zone',
      'A custom DNS server requirement',
      'A service endpoint for Microsoft.Network'
    ),
    correct: ['a'],
    explanation: 'Azure-provided default DNS automatically resolves VM hostnames within a single VNet with no configuration. Public zones, custom DNS servers, and service endpoints are not required for intra-VNet name resolution.',
    references: [REF_VNET_DNS, REF_DNS]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'You peer VNet-Hub (with a VPN gateway) to VNet-Spoke. The spoke must reach on-premises through the hub gateway. After enabling gateway transit on the hub and use-remote-gateways on the spoke, on-prem still cannot reach the spoke. What is the most likely missing piece?',
    options: opts4(
      'The on-premises VPN device / local network gateway must advertise/include the spoke address space, and routes for the spoke must be propagated',
      'The spoke needs its own VPN gateway',
      'The hub needs a NAT gateway',
      'The spoke needs a public IP'
    ),
    correct: ['a'],
    explanation: 'For two-way reachability, the on-premises side (and BGP/local network gateway address spaces) must include the spoke\'s address range so return routes exist. The spoke does not need its own gateway (that conflicts with transit); NAT gateway and public IPs are unrelated.',
    references: [REF_GATEWAY_TRANSIT, REF_S2S_VPN]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Network Watcher capability visualizes the resources in a virtual network and their relationships?',
    options: opts4(
      'Topology',
      'Connection monitor',
      'IP flow verify',
      'NSG diagnostics'
    ),
    correct: ['a'],
    explanation: 'The Topology tool draws a diagram of the resources in a VNet (subnets, NICs, NSGs, etc.) and their relationships. Connection monitor measures reachability; IP flow verify checks allow/deny; NSG diagnostics evaluates rules.',
    references: [REF_NETWORK_WATCHER, REF_MONITOR_NETWORKS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'You must enable Azure DDoS Network Protection for resources across a virtual network. At what scope is a DDoS protection plan applied?',
    options: opts4(
      'A DDoS protection plan is associated with a virtual network (protecting public IPs of resources in it)',
      'A DDoS protection plan is applied to a single VM',
      'A DDoS protection plan is applied to a subnet only',
      'A DDoS protection plan is applied to a resource group'
    ),
    correct: ['a'],
    explanation: 'A DDoS Network Protection plan is associated with virtual networks; it protects the public IP resources within those VNets. It is not scoped to a single VM, a subnet, or a resource group. (IP Protection is the alternative, per-public-IP tier.)',
    references: [REF_DDOS, REF_VNET]
  },
  {
    domain: CORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure virtual network name resolution.',
    options: opts4(
      'Azure-provided default DNS resolves hostnames within a single VNet automatically.',
      'A private DNS zone must be linked to a VNet to be resolvable from it.',
      'Azure DNS Private Resolver can forward queries between Azure and on-premises without DNS-server VMs.',
      'Azure-provided default DNS resolves hostnames across peered VNets automatically.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Default DNS works within a single VNet; private DNS zones need a VNet link; DNS Private Resolver bridges Azure/on-prem without VMs. Default DNS does NOT resolve hostnames across peered VNets — that requires a private DNS zone linked to both.',
    references: [REF_VNET_DNS, REF_PRIVATE_DNS, REF_DNS_RESOLVER]
  },

  // ── Design, implement, and manage connectivity services (14) ──
  {
    domain: CONNECTIVITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In a site-to-site VPN, which Azure resource links the virtual network gateway and the local network gateway together with the shared key?',
    options: opts4(
      'A Connection resource',
      'A route table',
      'A public IP prefix',
      'A network security group'
    ),
    correct: ['a'],
    explanation: 'A Connection resource ties the virtual network gateway (Azure side) to the local network gateway (on-prem side) and holds the shared key and connection settings. Route tables, IP prefixes, and NSGs do not establish the VPN connection.',
    references: [REF_S2S_VPN, REF_LOCAL_GW]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A policy-based VPN gateway is limited in what way compared to a route-based gateway?',
    options: opts4(
      'It supports only a single site-to-site tunnel and no BGP or point-to-site',
      'It supports more tunnels than route-based',
      'It supports BGP but not IPsec',
      'It supports point-to-site but not site-to-site'
    ),
    correct: ['a'],
    explanation: 'Policy-based VPN gateways support a single S2S tunnel, use static traffic selectors, and do not support BGP or point-to-site. Route-based gateways support many tunnels, BGP, and P2S.',
    references: [REF_VPN_POLICY, REF_VPN_GATEWAY]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to provide a single on-premises user with ad-hoc VPN access to one Azure VNet from their laptop without configuring a site-wide tunnel. Which solution fits?',
    options: opts4(
      'Point-to-site VPN',
      'Site-to-site VPN',
      'ExpressRoute',
      'Virtual WAN VPN site'
    ),
    correct: ['a'],
    explanation: 'Point-to-site VPN connects an individual client device directly to a VNet — ideal for ad-hoc remote access. Site-to-site and Virtual WAN VPN sites connect whole networks; ExpressRoute is a dedicated circuit.',
    references: [REF_P2S_VPN, REF_VPN_GATEWAY]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Point-to-site clients must authenticate against an existing on-premises RADIUS server. What must the Azure VPN gateway be able to reach, and how?',
    options: opts4(
      'The RADIUS server, reachable from the VNet (e.g. over a site-to-site VPN or ExpressRoute connection)',
      'A public DNS zone for the RADIUS server',
      'The RADIUS server over the public internet only',
      'A private endpoint for RADIUS'
    ),
    correct: ['a'],
    explanation: 'For P2S RADIUS authentication, the VPN gateway must reach the on-premises RADIUS server through the VNet — typically via an existing S2S VPN or ExpressRoute connection to on-premises. Public DNS, public-internet-only access, and private endpoints are not the mechanism.',
    references: [REF_P2S_AUTH, REF_P2S_VPN]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You must extend an on-premises subnet into Azure so VMs keep their original on-premises IP addresses. Which feature supports this?',
    options: opts4(
      'Azure Extended Network',
      'Global VNet peering',
      'A standard site-to-site VPN with NAT',
      'A public IP prefix'
    ),
    correct: ['a'],
    explanation: 'Azure Extended Network stretches an on-premises subnet into an Azure VNet so migrated VMs retain their original IP addresses. Peering and S2S VPN connect distinct address spaces; a public IP prefix is unrelated.',
    references: [REF_EXTENDED_NETWORK, REF_S2S_VPN]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An ExpressRoute circuit must provide redundant connectivity for disaster recovery across two Azure regions. Which design approach is recommended?',
    options: opts4(
      'Connect the ExpressRoute circuit (or a second circuit in a second peering location) to ExpressRoute gateways in VNets in two regions',
      'Use a single circuit to a single region and rely on VPN as the only DR path',
      'Use a Basic SKU gateway in one region',
      'Use Microsoft peering only'
    ),
    correct: ['a'],
    explanation: 'For cross-region redundancy, connect ExpressRoute to gateways in VNets in multiple regions (and ideally use circuits in two peering locations). A single circuit/region with VPN-only DR, Basic SKU gateways, and Microsoft-peering-only do not provide resilient private DR.',
    references: [REF_EXPRESSROUTE, REF_ER_GATEWAY]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to encrypt traffic that flows over an ExpressRoute private peering between on-premises and Azure. Which option achieves this?',
    options: opts4(
      'Run an IPsec (site-to-site VPN) tunnel over the ExpressRoute private peering',
      'ExpressRoute private peering is encrypted by default, so no action is needed',
      'Enable Microsoft peering instead',
      'Use a public IP prefix'
    ),
    correct: ['a'],
    explanation: 'ExpressRoute is not encrypted by default. Running an IPsec/site-to-site VPN tunnel over ExpressRoute private peering (or MACsec on ExpressRoute Direct) adds encryption. Switching to Microsoft peering and public IP prefixes do not encrypt traffic.',
    references: [REF_EXPRESSROUTE, REF_IPSEC]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which ExpressRoute peering must be configured to connect a virtual network\'s private IP space to on-premises?',
    options: opts4(
      'Azure private peering',
      'Microsoft peering',
      'Public peering',
      'Transit peering'
    ),
    correct: ['a'],
    explanation: 'Azure private peering carries traffic to VNet private IP space. Microsoft peering reaches Microsoft 365/Azure PaaS public endpoints. Public peering is the deprecated predecessor of Microsoft peering; "transit peering" is not an ExpressRoute term.',
    references: [REF_ER_PEERING, REF_EXPRESSROUTE]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'In Azure Virtual WAN, you must connect branch offices via VPN. Which Virtual WAN resource represents a branch office and its VPN parameters?',
    options: opts4(
      'A VPN site',
      'A virtual hub route table',
      'A local network gateway',
      'A connection monitor'
    ),
    correct: ['a'],
    explanation: 'In Virtual WAN, a VPN site represents a branch office (its public IP, address space, BGP, link details). Hub route tables control routing; local network gateways are a classic (non-Virtual-WAN) VPN concept; connection monitor is diagnostics.',
    references: [REF_VWAN, REF_VWAN_HUB_ROUTING]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Virtual WAN with multiple virtual hubs, what enables a VNet connected to hub 1 to reach a VNet connected to hub 2?',
    options: opts4(
      'Inter-hub connectivity, which is automatic in a Standard Virtual WAN (hub-to-hub routing)',
      'Manual VNet peering between the two VNets',
      'A site-to-site VPN between the hubs',
      'A NAT gateway in each hub'
    ),
    correct: ['a'],
    explanation: 'In a Standard Virtual WAN, hubs are interconnected automatically (hub-to-hub), so VNets on different hubs can communicate via Virtual WAN routing. Manual peering, S2S VPN between hubs, and NAT gateways are not how Virtual WAN inter-hub transit works.',
    references: [REF_VWAN, REF_VWAN_HUB_ROUTING]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to choose a VPN gateway SKU for a site-to-site VPN that must sustain higher aggregate throughput and many tunnels. What is the primary factor in your choice?',
    options: opts4(
      'Higher VpnGw SKUs (VpnGw2–5) provide greater aggregate throughput and support more tunnels',
      'All SKUs provide identical throughput',
      'The GatewaySubnet prefix length sets throughput',
      'The number of public IP prefixes sets throughput'
    ),
    correct: ['a'],
    explanation: 'VPN gateway throughput and tunnel limits scale with the SKU — VpnGw1 through VpnGw5 (and *AZ variants) offer increasing capacity. Subnet size and public IP prefixes do not determine gateway throughput.',
    references: [REF_VPN_SKU, REF_VPN_GATEWAY]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want quick, lightweight VPN access for individual administrators to a single VNet, provisioned per-machine and tightly integrated with Windows. Which Azure feature is designed for this?',
    options: opts4(
      'Azure Network Adapter (point-to-site VPN provisioned via Windows Admin Center)',
      'ExpressRoute Direct',
      'A Basic SKU site-to-site VPN',
      'Global VNet peering'
    ),
    correct: ['a'],
    explanation: 'Azure Network Adapter provisions a point-to-site VPN connection to a VNet directly from Windows Admin Center, giving an individual machine quick connectivity. ExpressRoute Direct, S2S VPN, and peering connect whole networks, not single admin machines.',
    references: [REF_P2S_VPN, REF_VPN_GATEWAY]
  },
  {
    domain: CONNECTIVITY, difficulty: 2, type: QType.SINGLE,
    stem: 'An on-premises router supports BGP. To exchange routes dynamically with an Azure route-based VPN gateway, what must be configured on the Azure side?',
    options: opts4(
      'Enable BGP on the virtual network gateway and assign it an ASN and BGP peer IP',
      'Create a policy-based connection',
      'Disable the local network gateway',
      'Use a Basic SKU gateway'
    ),
    correct: ['a'],
    explanation: 'BGP must be enabled on the route-based virtual network gateway, with an ASN and BGP peering address configured, to exchange routes with the on-premises BGP router. Policy-based connections don\'t support BGP; the local network gateway is still required; Basic SKU lacks BGP.',
    references: [REF_VPN_GATEWAY, REF_S2S_VPN]
  },
  {
    domain: CONNECTIVITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Virtual WAN.',
    options: opts4(
      'A Standard Virtual WAN supports VNet-to-VNet transit through virtual hubs.',
      'A virtual hub is Microsoft-managed.',
      'Deploying Azure Firewall into a hub creates a secured virtual hub.',
      'A Basic Virtual WAN supports ExpressRoute and point-to-site VPN.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Standard Virtual WAN supports VNet-to-VNet transit; hubs are Microsoft-managed; Azure Firewall in a hub makes a secured hub. Basic Virtual WAN supports ONLY site-to-site VPN — ExpressRoute and P2S require the Standard SKU.',
    references: [REF_VWAN, REF_VWAN_NVA]
  },

  // ── Design and implement application delivery services (12) ──
  {
    domain: APPDELIVERY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure load-balancing service operates at Layer 7 and is regional, suited to routing HTTP traffic to backends within one region?',
    options: opts4(
      'Azure Application Gateway',
      'Azure Load Balancer',
      'Azure Traffic Manager',
      'Azure Front Door'
    ),
    correct: ['a'],
    explanation: 'Application Gateway is the regional Layer 7 (HTTP/HTTPS) load balancer. Azure Load Balancer is L4; Traffic Manager is DNS-based; Front Door is a global L7 service.',
    references: [REF_APP_GW, REF_LB]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'A Standard public Load Balancer\'s backend VMs must make outbound internet calls. What is the recommended way to define their outbound connectivity explicitly?',
    options: opts4(
      'A NAT gateway on the subnet, or explicit outbound rules on the load balancer',
      'Rely on default outbound access (which is being retired)',
      'A public IP on the load balancer frontend only',
      'A health probe on port 80'
    ),
    correct: ['a'],
    explanation: 'Outbound connectivity should be explicit — a NAT gateway (recommended) or load balancer outbound rules. Default outbound access is being retired and should not be relied on. A frontend public IP serves inbound; probes check health.',
    references: [REF_LB_OUTBOUND, REF_NAT_GATEWAY]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need Traffic Manager to split traffic 80/20 between two endpoints for a staged rollout. Which routing method should you select?',
    options: opts4(
      'Weighted',
      'Priority',
      'Performance',
      'Subnet'
    ),
    correct: ['a'],
    explanation: 'Weighted routing distributes traffic across endpoints according to assigned weights (e.g. 80 and 20). Priority is failover; Performance picks lowest latency; Subnet maps client IP ranges to endpoints.',
    references: [REF_TM_ROUTING, REF_TRAFFIC_MANAGER]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'An Application Gateway must terminate TLS so it can inspect and route HTTP requests by URL path. What must you configure on the listener?',
    options: opts4(
      'An HTTPS listener with an SSL/TLS certificate',
      'A TCP listener with no certificate',
      'A UDP listener',
      'An outbound NAT rule'
    ),
    correct: ['a'],
    explanation: 'To terminate TLS, the listener must be HTTPS with an associated SSL/TLS certificate; the gateway then decrypts and can route by path. TCP/UDP listeners don\'t terminate HTTPS for L7 routing; NAT rules are unrelated.',
    references: [REF_APP_GW_COMPONENTS, REF_APP_GW]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.SINGLE,
    stem: 'Azure Front Door must serve a single global hostname while routing /api/* to one origin group and all other paths to another. Which configuration achieves this?',
    options: opts4(
      'Two routes on the endpoint with different path patterns mapped to different origin groups',
      'Two separate Front Door profiles',
      'A Traffic Manager profile in front of Front Door',
      'A Load Balancer rule per path'
    ),
    correct: ['a'],
    explanation: 'Front Door routes match path patterns (e.g. /api/* vs /*) and forward to different origin groups under one endpoint/hostname. Two profiles or a fronting Traffic Manager is unnecessary; Load Balancer is L4 and cannot do path routing.',
    references: [REF_FD_ROUTING, REF_FRONT_DOOR]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want session affinity so a client is consistently routed to the same backend server through an Application Gateway. Which feature provides this?',
    options: opts4(
      'Cookie-based session affinity',
      'A health probe',
      'An outbound rule',
      'A NAT gateway'
    ),
    correct: ['a'],
    explanation: 'Application Gateway uses cookie-based session affinity to pin a client\'s requests to the same backend server. Health probes check backend health; outbound rules and NAT gateway govern egress, not affinity.',
    references: [REF_APP_GW_COMPONENTS, REF_APP_GW]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure Front Door tier is required to use managed WAF rule sets and Private Link origins?',
    options: opts4(
      'Front Door Premium',
      'Front Door Standard',
      'Front Door Classic only',
      'Any tier supports them'
    ),
    correct: ['a'],
    explanation: 'Front Door Premium adds managed WAF rule sets (and bot protection) and Private Link connectivity to origins. Standard supports custom WAF rules and caching/routing but not managed rule sets or Private Link origins.',
    references: [REF_FD_TIERS, REF_FD_PRIVATE_LINK]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a load-balancing rule on a Standard Load Balancer to distribute inbound TCP 443 across all healthy backend pool VMs. Which component decides which VMs are "healthy"?',
    options: opts4(
      'A health probe associated with the rule',
      'An inbound NAT rule',
      'An outbound rule',
      'A frontend IP configuration'
    ),
    correct: ['a'],
    explanation: 'A health probe determines which backend pool members are healthy; the load-balancing rule only sends traffic to healthy members. Inbound NAT rules map specific ports to specific VMs; outbound rules and frontend IPs don\'t assess health.',
    references: [REF_LB_RULES, REF_LB]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.SINGLE,
    stem: 'A web app behind Application Gateway must reject requests larger than a size limit and block common attacks while still doing L7 routing. What should you add to the Application Gateway?',
    options: opts4(
      'A WAF policy (use the WAF_v2 SKU) associated with the gateway',
      'A larger GatewaySubnet',
      'An outbound rule',
      'A NAT gateway'
    ),
    correct: ['a'],
    explanation: 'A WAF policy on a WAF_v2 Application Gateway enforces request size limits and managed attack rules while the gateway still does L7 routing. Subnet size, outbound rules, and NAT gateway do not provide web application firewalling.',
    references: [REF_WAF_APPGW, REF_APP_GW]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Front Door should accelerate dynamic (non-cacheable) content for global users. Which Front Door capability addresses this?',
    options: opts4(
      'Traffic acceleration over the Microsoft global network from the nearest edge POP',
      'Caching of dynamic responses',
      'A health probe',
      'A NAT gateway at the origin'
    ),
    correct: ['a'],
    explanation: 'Front Door accelerates dynamic content by terminating connections at the nearest edge POP and routing over the optimized Microsoft global backbone to the origin. Dynamic content is not cacheable; probes and NAT gateways don\'t accelerate traffic.',
    references: [REF_FD_ROUTING, REF_FRONT_DOOR]
  },
  {
    domain: APPDELIVERY, difficulty: 2, type: QType.SINGLE,
    stem: 'You must choose between Azure Load Balancer SKUs. Which statement about the Standard SKU versus Basic is correct?',
    options: opts4(
      'Standard supports availability zones, larger backend pools, and is secure by default (closed unless an NSG allows traffic)',
      'Basic supports availability zones; Standard does not',
      'Standard does not support health probes',
      'Basic is recommended for all production workloads'
    ),
    correct: ['a'],
    explanation: 'Standard Load Balancer supports availability zones, large backend pools, and is closed to inbound traffic unless explicitly allowed by an NSG. Basic lacks zone support and is being retired; Standard is recommended for production. Both support health probes.',
    references: [REF_LB_SKU, REF_LB]
  },
  {
    domain: APPDELIVERY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure application-delivery services.',
    options: opts4(
      'Traffic Manager works at the DNS layer and is not in the data path.',
      'Application Gateway supports cookie-based session affinity and URL path routing.',
      'Azure Front Door is a global service with edge POPs and optional caching.',
      'Azure Load Balancer terminates TLS and inspects HTTP headers.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Traffic Manager is DNS-based; Application Gateway does affinity + path routing; Front Door is global with edge POPs/caching. Azure Load Balancer is Layer 4 — it does NOT terminate TLS or inspect HTTP headers (that is App Gateway / Front Door).',
    references: [REF_TRAFFIC_MANAGER, REF_APP_GW, REF_FRONT_DOOR]
  },

  // ── Design and implement private access to Azure services (8) ──
  {
    domain: PRIVATE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Azure Private Link is the underlying technology for which capability?',
    options: opts4(
      'Private endpoints that map a PaaS service to a private IP in your VNet',
      'Public IP address prefixes',
      'User-defined routes',
      'Network security groups'
    ),
    correct: ['a'],
    explanation: 'Azure Private Link underpins private endpoints (and Private Link service), mapping Azure PaaS or your own services to private IPs inside a VNet. Public IP prefixes, UDRs, and NSGs are unrelated to Private Link.',
    references: [REF_PRIVATE_LINK, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You created a private endpoint for an Azure Storage account in subnet A. VMs in peered subnet B must also use it. What is required?',
    options: opts4(
      'Subnet B\'s VNet must be able to route to the private endpoint IP and resolve the privatelink DNS zone',
      'A separate private endpoint must be created in subnet B',
      'The storage account must be given a public IP',
      'Subnet B must use a service endpoint instead'
    ),
    correct: ['a'],
    explanation: 'A private endpoint\'s private IP is reachable from peered/connected networks as long as routing and DNS (the privatelink zone) are in place. You generally do not need a second private endpoint per subnet; public IPs and service endpoints are not the solution.',
    references: [REF_PRIVATE_ENDPOINT, REF_PE_DNS]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'For a Private Link service you publish, you must control which consumers can connect. Which mechanism provides this?',
    options: opts4(
      'The Private Link service visibility/auto-approval settings (restrict by subscription, and approve connection requests)',
      'An NSG on the consumer\'s subnet',
      'A public DNS zone',
      'A route table on the provider VNet'
    ),
    correct: ['a'],
    explanation: 'A Private Link service controls access via its visibility settings (which subscriptions can find it) and a connection approval workflow (auto-approve list or manual approval). NSGs, DNS zones, and route tables do not gate Private Link service consumer access.',
    references: [REF_PRIVATE_LINK_SERVICE, REF_PRIVATE_LINK]
  },
  {
    domain: PRIVATE, difficulty: 3, type: QType.SINGLE,
    stem: 'After creating private endpoints for multiple PaaS services, you want one place to manage all the privatelink DNS zones and link them to many VNets at scale. What is the recommended pattern?',
    options: opts4(
      'Centralize the privatelink private DNS zones (often in a hub) and link them to spoke VNets, optionally automated with Azure Policy',
      'Create the privatelink zones separately in every spoke VNet',
      'Use a public DNS zone for all privatelink records',
      'Disable DNS and hardcode IP addresses'
    ),
    correct: ['a'],
    explanation: 'The recommended enterprise pattern is centralized privatelink private DNS zones (typically in the hub), linked to spoke VNets, with Azure Policy automating zone creation/association for new private endpoints. Per-spoke duplication, public zones, and hardcoded IPs are anti-patterns.',
    references: [REF_PE_DNS, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'A subnet uses a service endpoint for Microsoft.Storage. A VM in that subnet accesses a storage account in a DIFFERENT Azure region. What happens by default?',
    options: opts4(
      'Service endpoints support cross-region access to Azure Storage, so it works (subject to the account firewall)',
      'Service endpoints only ever work within the same region',
      'A private endpoint is automatically created',
      'The traffic is dropped'
    ),
    correct: ['a'],
    explanation: 'Service endpoints for Azure Storage support access to accounts in any region (the account firewall must still allow the subnet). Some services are region-restricted, but Storage is not. No private endpoint is auto-created.',
    references: [REF_SERVICE_ENDPOINT, REF_SERVICE_ENDPOINT_POLICY]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to grant a subnet access to an Azure SQL database without giving the database a private IP, and you do not need on-premises access. Which option is the simplest and lowest-cost?',
    options: opts4(
      'A service endpoint for Microsoft.Sql plus the SQL server firewall allowing that subnet',
      'A private endpoint for the SQL database',
      'A Private Link service',
      'Microsoft peering on ExpressRoute'
    ),
    correct: ['a'],
    explanation: 'When you do not need a private IP or on-premises reachability, a service endpoint (free) combined with the SQL server VNet firewall rule is the simplest, lowest-cost option. Private endpoints add a private IP (and cost); Private Link service is for publishing your own service.',
    references: [REF_SERVICE_ENDPOINT, REF_PRIVATE_ENDPOINT]
  },
  {
    domain: PRIVATE, difficulty: 2, type: QType.SINGLE,
    stem: 'You created a private endpoint for an Azure web app. What should you do to the web app\'s public access setting to ensure traffic only flows privately?',
    options: opts4(
      'Disable public network access on the web app so it is reachable only via the private endpoint',
      'Leave public access enabled — the private endpoint blocks it automatically',
      'Add a public IP to the private endpoint',
      'Delete the app service plan'
    ),
    correct: ['a'],
    explanation: 'Creating a private endpoint does not by itself close the public endpoint — you must disable public network access on the resource so it is reachable only privately. Private endpoints have no public IP; deleting the plan removes the app.',
    references: [REF_PRIVATE_ENDPOINT, REF_PRIVATE_LINK]
  },
  {
    domain: PRIVATE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure private endpoints and Private Link service.',
    options: opts4(
      'A private endpoint can target an Azure first-party PaaS service or a customer Private Link service.',
      'A Private Link service must be fronted by a Standard internal Load Balancer.',
      'Private endpoint connections to a Private Link service can require manual approval.',
      'A private endpoint automatically makes the target service publicly accessible.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Private endpoints can target first-party PaaS or a customer Private Link service; a Private Link service is fronted by a Standard internal Load Balancer; connection requests can require approval. A private endpoint does the OPPOSITE of public exposure — it enables private-only access.',
    references: [REF_PRIVATE_ENDPOINT, REF_PRIVATE_LINK_SERVICE]
  },

  // ── Design and implement Azure network security services (13) ──
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A network security group rule is defined by which set of properties?',
    options: opts4(
      'Priority, direction, source, destination, port, protocol, and action (Allow/Deny)',
      'Only a source IP and a destination IP',
      'Only an FQDN and an action',
      'A routing prefix and a next hop'
    ),
    correct: ['a'],
    explanation: 'An NSG rule has priority, direction, source, destination, port range, protocol, and an Allow/Deny action — a 5-tuple-plus-priority filter. FQDN-based rules are an Azure Firewall application-rule feature; prefix/next hop describes a route, not an NSG rule.',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You must allow inbound management traffic to VMs only from Azure Bastion, not from the internet. Which NSG configuration is appropriate on the VM subnet?',
    options: opts4(
      'Allow inbound 3389/22 only from the AzureBastionSubnet (or VirtualNetwork), and deny inbound 3389/22 from the internet',
      'Allow inbound 3389/22 from any source',
      'Allow inbound 3389/22 from the Internet service tag',
      'Deny all inbound, including from Bastion'
    ),
    correct: ['a'],
    explanation: 'With Bastion, VM NSGs should allow inbound RDP/SSH only from the Bastion subnet (or VirtualNetwork) and block the internet — Bastion brokers the session. Allowing the internet defeats Bastion\'s purpose; denying Bastion entirely blocks legitimate access.',
    references: [REF_BASTION, REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'In an NSG rule, which value lets you allow traffic to "Azure Cloud" or "Sql" address ranges without listing IPs, and is maintained by Microsoft?',
    options: opts4(
      'A service tag',
      'An application security group',
      'A route prefix',
      'A custom IP group you maintain manually'
    ),
    correct: ['a'],
    explanation: 'Service tags (e.g. AzureCloud, Sql, Storage, AzureBastion) represent groups of Microsoft-maintained IP ranges usable in NSG and Azure Firewall rules. ASGs group your own VM NICs; route prefixes are routing; manually maintained IP lists defeat the purpose.',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Two NSG rules could match a packet: a custom Allow at priority 300 and the default rule DenyAllInbound at priority 65500. Which applies?',
    options: opts4(
      'The custom Allow at priority 300 — it has a lower number and is evaluated first',
      'The default DenyAllInbound — defaults always win',
      'Neither — the packet is logged only',
      'Both — the packet is allowed then denied'
    ),
    correct: ['a'],
    explanation: 'NSG rules are evaluated lowest priority number first; the custom Allow at 300 is evaluated before the default Deny at 65500 and, on match, processing stops. Default rules are simply the lowest-priority (highest-number) fallbacks.',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to retain virtual network flow logs for long-term security investigation and feed them into analytics. Where are flow logs stored?',
    options: opts4(
      'In an Azure Storage account, and optionally processed by Traffic Analytics into a Log Analytics workspace',
      'Only in the NSG resource itself',
      'In a private DNS zone',
      'In the route table'
    ),
    correct: ['a'],
    explanation: 'Virtual network flow logs are written to an Azure Storage account; Traffic Analytics can then process them into a Log Analytics workspace for visualization. NSGs, DNS zones, and route tables do not store flow logs.',
    references: [REF_FLOW_LOGS, REF_NETWORK_WATCHER]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to deploy Azure Firewall to inspect traffic for a hub VNet. Besides the AzureFirewallSubnet, what does Azure Firewall require?',
    options: opts4(
      'At least one public IP address and a firewall policy (or classic rules)',
      'A GatewaySubnet',
      'A private DNS zone',
      'A NAT gateway'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall needs the AzureFirewallSubnet, at least one public IP, and rules (best via a Firewall Policy). It does not require a GatewaySubnet, a private DNS zone, or a NAT gateway.',
    references: [REF_AZURE_FIREWALL, REF_FIREWALL_POLICY]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In Azure Firewall, you create a network rule allowing TCP 443 to 10.0.0.0/8 and an application rule allowing https://contoso.com. A request to contoso.com on 443 arrives. What happens?',
    options: opts4(
      'If the network rule matches the destination, it is allowed by the network rule before application rules are evaluated',
      'The application rule is always evaluated first',
      'The request is denied because two rules match',
      'The request is duplicated to both rule engines'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall evaluates DNAT, then network rules, then application rules. If a network rule allows the traffic, the request is permitted and application rules are not evaluated for it. Matching multiple rule types does not cause a deny or duplication.',
    references: [REF_FIREWALL_RULES, REF_AZURE_FIREWALL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to centrally view and manage security across multiple Azure Firewalls and also associate firewall policies with secured virtual hubs. Which service do you use?',
    options: opts4(
      'Azure Firewall Manager',
      'Azure Network Watcher',
      'Azure Virtual Network Manager',
      'Azure Monitor'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall Manager centrally manages Azure Firewall deployments and policies, including for secured virtual hubs and hub VNets. Network Watcher is diagnostics; Virtual Network Manager handles VNet connectivity/NSG-style admin rules; Azure Monitor is observability.',
    references: [REF_FIREWALL_MANAGER, REF_AZURE_FIREWALL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A WAF policy must throttle clients that send an excessive number of requests in a short time. Which WAF rule type should you create?',
    options: opts4(
      'A rate-limit (rate-based) custom rule',
      'A geo-match custom rule',
      'A managed OWASP rule',
      'A DNAT rule'
    ),
    correct: ['a'],
    explanation: 'A rate-limit custom rule counts requests from a client within a window and blocks once a threshold is exceeded. Geo-match filters by country; managed OWASP rules target injection/XSS; DNAT is an Azure Firewall concept, not WAF.',
    references: [REF_WAF, REF_WAF_FD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You associate a WAF policy with an Application Gateway. At which scopes can a WAF policy be applied on Application Gateway?',
    options: opts4(
      'Globally to the gateway, per-listener (site), or per-routing-rule (path)',
      'Only to a single VM',
      'Only to a subnet',
      'Only to a public IP'
    ),
    correct: ['a'],
    explanation: 'On Application Gateway, a WAF policy can be applied at the gateway level, per-listener, or per-URI/path (routing rule), with more specific scopes overriding broader ones. WAF policies are not applied to VMs, subnets, or public IPs.',
    references: [REF_WAF_APPGW, REF_WAF]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to block all inbound traffic to a subnet except from within the virtual network. Which NSG source value should the allow rule use?',
    options: opts4(
      'The VirtualNetwork service tag',
      'The Internet service tag',
      'The AzureLoadBalancer service tag',
      '0.0.0.0/0'
    ),
    correct: ['a'],
    explanation: 'The VirtualNetwork service tag represents the VNet address space (and connected on-prem/peered ranges). An allow rule with source VirtualNetwork plus default denies restricts inbound to intra-VNet traffic. Internet and 0.0.0.0/0 allow the public internet.',
    references: [REF_NSG, REF_NSG_HOWTO]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Subscription owners keep creating permissive NSG rules. You must enforce a non-overridable rule that blocks inbound SSH from the internet across all current and future VNets in the organization. Which feature should you use?',
    options: opts4(
      'Azure Virtual Network Manager security admin rules applied to a dynamic network group',
      'A standard NSG copied into each subnet',
      'An Azure Firewall network rule',
      'A WAF policy in prevention mode'
    ),
    correct: ['a'],
    explanation: 'Virtual Network Manager security admin rules are enforced before NSG rules and cannot be overridden by subscription owners\' NSGs; a dynamic network group applies them to current and future VNets. Per-subnet NSGs can be changed; Azure Firewall and WAF are different enforcement points.',
    references: [REF_AVNM, REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Web Application Firewall (WAF).',
    options: opts4(
      'WAF can run on Azure Application Gateway and on Azure Front Door.',
      'WAF supports managed rule sets (e.g. OWASP) and custom rules.',
      'Detection mode logs matches without blocking; prevention mode blocks.',
      'WAF inspects Layer 4 TCP/UDP traffic for backend VMs.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'WAF runs on Application Gateway and Front Door, supports managed + custom rules, and has detection (log-only) and prevention (block) modes. WAF protects Layer 7 HTTP/HTTPS applications — it does NOT inspect raw Layer 4 TCP/UDP for backend VMs.',
    references: [REF_WAF, REF_WAF_APPGW, REF_WAF_FD]
  }
];

const AZ700_DOMAINS = [
  { name: CORE, weight: 28 },
  { name: CONNECTIVITY, weight: 22 },
  { name: APPDELIVERY, weight: 18 },
  { name: PRIVATE, weight: 12 },
  { name: SECURITY, weight: 20 }
];

const AZ700_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-az-700-p1',
    code: 'AZ-700-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 100-minute, 65-question, blueprint-weighted set covering core networking infrastructure (VNets, IP addressing, DNS, routing, monitoring), connectivity services (VPN, ExpressRoute, Virtual WAN), application delivery (Load Balancer, Application Gateway, Front Door, Traffic Manager), private access (Private Link, service endpoints), and Azure network security (NSGs, Azure Firewall, WAF).',
    questions: P1
  },
  {
    slug: 'microsoft-az-700-p2',
    code: 'AZ-700-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 100-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-az-700-p3',
    code: 'AZ-700-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 100-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const AZ700_BUNDLE = {
  slug: 'microsoft-az-700',
  title: 'Microsoft Azure Network Engineer Associate (AZ-700)',
  description: 'All 3 AZ-700 practice exams in one bundle — 195 curated questions covering designing and implementing core networking infrastructure (virtual networks, IP addressing, name resolution, routing, network monitoring), connectivity services (site-to-site and point-to-site VPN, ExpressRoute, Azure Virtual WAN), application delivery services (Azure Load Balancer, Application Gateway, Front Door, Traffic Manager), private access to Azure services (Azure Private Link, private endpoints, service endpoints), and Azure network security services (network security groups, Azure Firewall, Web Application Firewall). Aligned to the official Microsoft Azure Network Engineer Associate (AZ-700) study guide (skills measured as of April 24, 2026).',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the AZ-700 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:az700-seed'` are deleted and re-created.
 */
export async function seedAz700(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security operations, identity, and the role-based certification track including the Azure Network Engineer Associate (AZ-700) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security operations, identity, and the role-based certification track including the Azure Network Engineer Associate (AZ-700) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of AZ700_EXAMS) {
    const title = `Microsoft Azure Network Engineer Associate (AZ-700) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Microsoft AZ-700 study guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 100,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: AZ700_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:az700-seed' } });
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
          generatedBy: 'manual:az700-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: AZ700_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: AZ700_BUNDLE.slug },
    update: {
      title: AZ700_BUNDLE.title,
      description: AZ700_BUNDLE.description,
      price: AZ700_BUNDLE.price,
      priceVoucher: AZ700_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: AZ700_BUNDLE.slug,
      title: AZ700_BUNDLE.title,
      description: AZ700_BUNDLE.description,
      price: AZ700_BUNDLE.price,
      priceVoucher: AZ700_BUNDLE.priceVoucher,
      published: true
    }
  });

  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-az-700-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-az-700-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-az-700-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-az-700-p1', tier: 'VOUCHER' as const, position: 4 }
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
