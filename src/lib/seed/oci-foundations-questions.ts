/**
 * OCI Foundations bundle seed — vendor, three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:oci-foundations-seed'` and upserts catalog
 * rows.
 *
 * Exported as `seedOciFoundations(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/oci-foundations.ts`) and the
 * protected admin API (`/api/admin/seed-oci-foundations`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the public Oracle Cloud
 * Infrastructure documentation (docs.oracle.com) and the official
 * Oracle Cloud Infrastructure Foundations Associate (1Z0-1085) exam
 * objectives:
 *   - OCI Introduction                  — 15% (10/variant)
 *   - OCI Identity and Access Management — 20% (13/variant)
 *   - Networking                        — 20% (13/variant)
 *   - Compute                           — 15% (10/variant)
 *   - Storage                           — 15% (10/variant)
 *   - Security and Observability        — 15% (9/variant)
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

const INTRO = 'OCI Introduction';
const IAM = 'OCI Identity and Access Management';
const NET = 'Networking';
const COMPUTE = 'Compute';
const STORAGE = 'Storage';
const SECOBS = 'Security and Observability';

const REF_REGIONS = { label: 'Oracle Docs — Regions and Availability Domains', url: 'https://docs.oracle.com/en-us/iaas/Content/General/Concepts/regions.htm' };
const REF_FREE = { label: 'Oracle Docs — Oracle Cloud Free Tier', url: 'https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm' };
const REF_SLA = { label: 'Oracle — Cloud Service Level Agreements', url: 'https://www.oracle.com/cloud/sla/' };
const REF_OVERVIEW = { label: 'Oracle Docs — OCI Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/GSG/Concepts/baremetalintro.htm' };
const REF_SUPPORT = { label: 'Oracle Docs — Oracle Support and Service Limits', url: 'https://docs.oracle.com/en-us/iaas/Content/General/Concepts/servicelimits.htm' };
const REF_PRICING = { label: 'Oracle — OCI Pricing', url: 'https://www.oracle.com/cloud/pricing/' };
const REF_IAM = { label: 'Oracle Docs — IAM Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Identity/Concepts/overview.htm' };
const REF_POLICY = { label: 'Oracle Docs — How Policies Work', url: 'https://docs.oracle.com/en-us/iaas/Content/Identity/Concepts/policies.htm' };
const REF_COMPART = { label: 'Oracle Docs — Managing Compartments', url: 'https://docs.oracle.com/en-us/iaas/Content/Identity/compartments/managingcompartments.htm' };
const REF_GROUPS = { label: 'Oracle Docs — Managing Groups', url: 'https://docs.oracle.com/en-us/iaas/Content/Identity/groups/managinggroups.htm' };
const REF_FEDERATION = { label: 'Oracle Docs — Federating with Identity Providers', url: 'https://docs.oracle.com/en-us/iaas/Content/Identity/Concepts/federation.htm' };
const REF_MFA = { label: 'Oracle Docs — Managing Multifactor Authentication', url: 'https://docs.oracle.com/en-us/iaas/Content/Identity/Tasks/usingmfa.htm' };
const REF_DYNGROUP = { label: 'Oracle Docs — Managing Dynamic Groups', url: 'https://docs.oracle.com/en-us/iaas/Content/Identity/dynamicgroups/managingdynamicgroups.htm' };
const REF_VCN = { label: 'Oracle Docs — VCNs and Subnets', url: 'https://docs.oracle.com/en-us/iaas/Content/Network/Tasks/managingVCNs_topic-Overview_of_VCNs_and_Subnets.htm' };
const REF_GATEWAYS = { label: 'Oracle Docs — Connectivity Gateways', url: 'https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm' };
const REF_SECLIST = { label: 'Oracle Docs — Security Lists', url: 'https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm' };
const REF_NSG = { label: 'Oracle Docs — Network Security Groups', url: 'https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/networksecuritygroups.htm' };
const REF_LB = { label: 'Oracle Docs — Load Balancer Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Balance/Concepts/balanceoverview.htm' };
const REF_FASTCONNECT = { label: 'Oracle Docs — FastConnect Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/fastconnect.htm' };
const REF_VPN = { label: 'Oracle Docs — Site-to-Site VPN', url: 'https://docs.oracle.com/en-us/iaas/Content/Network/Tasks/managingIPsec.htm' };
const REF_DRG = { label: 'Oracle Docs — Dynamic Routing Gateways', url: 'https://docs.oracle.com/en-us/iaas/Content/Network/Tasks/managingDRGs.htm' };
const REF_COMPUTE = { label: 'Oracle Docs — Compute Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Compute/Concepts/computeoverview.htm' };
const REF_SHAPES = { label: 'Oracle Docs — Compute Shapes', url: 'https://docs.oracle.com/en-us/iaas/Content/Compute/References/computeshapes.htm' };
const REF_IMAGES = { label: 'Oracle Docs — Managing Custom Images', url: 'https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/managingcustomimages.htm' };
const REF_AUTOSCALE = { label: 'Oracle Docs — Autoscaling', url: 'https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/autoscalinginstancepools.htm' };
const REF_OKE = { label: 'Oracle Docs — Container Engine for Kubernetes', url: 'https://docs.oracle.com/en-us/iaas/Content/ContEng/Concepts/contengoverview.htm' };
const REF_FUNCTIONS = { label: 'Oracle Docs — OCI Functions Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Functions/Concepts/functionsoverview.htm' };
const REF_BLOCK = { label: 'Oracle Docs — Block Volume Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Block/Concepts/overview.htm' };
const REF_OBJECT = { label: 'Oracle Docs — Object Storage Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Object/Concepts/objectstorageoverview.htm' };
const REF_FSS = { label: 'Oracle Docs — File Storage Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/File/Concepts/filestorageoverview.htm' };
const REF_ARCHIVE = { label: 'Oracle Docs — Archive Storage', url: 'https://docs.oracle.com/en-us/iaas/Content/Archive/Concepts/archivestorageoverview.htm' };
const REF_BACKUP = { label: 'Oracle Docs — Backing Up a Volume', url: 'https://docs.oracle.com/en-us/iaas/Content/Block/Concepts/blockvolumebackups.htm' };
const REF_TIERS = { label: 'Oracle Docs — Object Storage Tiers', url: 'https://docs.oracle.com/en-us/iaas/Content/Object/Concepts/understandingstoragetiers.htm' };
const REF_VAULT = { label: 'Oracle Docs — Vault / Key Management', url: 'https://docs.oracle.com/en-us/iaas/Content/KeyManagement/Concepts/keyoverview.htm' };
const REF_CLOUDGUARD = { label: 'Oracle Docs — Cloud Guard Overview', url: 'https://docs.oracle.com/en-us/iaas/cloud-guard/using/index.htm' };
const REF_MONITORING = { label: 'Oracle Docs — Monitoring Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Monitoring/Concepts/monitoringoverview.htm' };
const REF_LOGGING = { label: 'Oracle Docs — Logging Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Logging/Concepts/loggingoverview.htm' };
const REF_AUDIT = { label: 'Oracle Docs — Audit Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Audit/Concepts/auditoverview.htm' };
const REF_NOTIF = { label: 'Oracle Docs — Notifications Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Notification/Concepts/notificationoverview.htm' };
const REF_SHARED = { label: 'Oracle Docs — Security Shared Responsibility', url: 'https://docs.oracle.com/en-us/iaas/Content/Security/Concepts/security_features.htm' };
const REF_BASTION = { label: 'Oracle Docs — Bastion Overview', url: 'https://docs.oracle.com/en-us/iaas/Content/Bastion/Concepts/bastionoverview.htm' };
const REF_WAF = { label: 'Oracle Docs — Web Application Firewall', url: 'https://docs.oracle.com/en-us/iaas/Content/WAF/Concepts/overview.htm' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── OCI Introduction (10) ──
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the largest, isolated geographic unit in the Oracle Cloud Infrastructure (OCI) physical hierarchy that contains one or more availability domains?',
    options: opts4(
      'A fault domain',
      'A region',
      'A compartment',
      'A tenancy'
    ),
    correct: ['b'],
    explanation: 'An OCI region is a localized geographic area containing one or more availability domains. Fault domains are groupings inside an availability domain; compartments and tenancies are logical (not physical) constructs.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A customer wants every component of an application to survive the failure of a single data center within a region. Which OCI construct provides physically separate data centers within a single region?',
    options: opts4(
      'Fault domains',
      'Availability domains',
      'Compartments',
      'Tenancies'
    ),
    correct: ['b'],
    explanation: 'Availability domains are isolated, fault-tolerant data centers within a region that do not share power, cooling, or network. Fault domains protect against failures within a single availability domain.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Within a single availability domain, what does a fault domain protect against?',
    options: opts4(
      'A full region outage',
      'Hardware and maintenance failures localized to a grouping of infrastructure inside the availability domain',
      'Loss of an entire availability domain',
      'A DNS resolution failure'
    ),
    correct: ['b'],
    explanation: 'A fault domain is a logical grouping of hardware within an availability domain. Distributing instances across fault domains protects against simultaneous hardware failure and against impact from planned AD-internal maintenance.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI offering provides a set of resources that remain free of charge for as long as the tenancy exists, with no time limit?',
    options: opts4(
      '30-day Free Trial credits',
      'Always Free resources',
      'Pay As You Go',
      'Universal Credits'
    ),
    correct: ['b'],
    explanation: 'Always Free resources (e.g. limited Autonomous Database, small compute instances, object storage) have no time limit. Free Trial credits expire after 30 days; PAYG and Universal Credits are paid models.',
    references: [REF_FREE]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'A company needs predictable, committed cloud spend with the flexibility to consume any eligible OCI service. Which purchasing model best fits?',
    options: opts4(
      'Pay As You Go only',
      'Universal Credits with an Annual or Monthly commitment',
      'Always Free resources',
      'Bring Your Own License only'
    ),
    correct: ['b'],
    explanation: 'Universal Credits let customers commit to an amount of spend and consume any eligible OCI service against it, offering predictability with flexibility. PAYG bills purely on usage with no commitment.',
    references: [REF_PRICING]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document defines Oracle\'s commitments for availability, manageability, and performance of OCI services, and is unique in covering all three?',
    options: opts4(
      'The Service Limits page',
      'The OCI Service Level Agreement (SLA)',
      'The Shared Responsibility Model',
      'The Universal Credits agreement'
    ),
    correct: ['b'],
    explanation: 'OCI SLAs are notable for covering availability, manageability, and performance — most cloud SLAs cover only availability. Service limits and the shared responsibility model are separate concepts.',
    references: [REF_SLA]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'A new tenancy hits a soft limit on the number of compute instances it can launch. What is the correct first action?',
    options: opts4(
      'Open a new tenancy',
      'Request a service limit increase through a support request',
      'Switch to a different region permanently',
      'Delete the existing instances and re-create them'
    ),
    correct: ['b'],
    explanation: 'Service limits are set per tenancy and can be raised by submitting a service limit increase request. Creating a new tenancy or deleting resources does not address the limit.',
    references: [REF_SUPPORT]
  },
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE,
    stem: 'An OCI region can contain only one availability domain.',
    options: opts4('True', 'False', 'Only in Always Free tenancies', 'Only for government regions'),
    correct: ['b'],
    explanation: 'False. A region contains one OR more availability domains. Some regions have a single AD while others have three; the model supports more than one.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect is choosing where to deploy a latency-sensitive workload serving European users while meeting EU data residency rules. Which factor is the PRIMARY driver for selecting a specific OCI region?',
    options: opts4(
      'The number of fault domains per availability domain',
      'Data residency/compliance requirements and proximity to users',
      'The color of the region in the console',
      'The number of compartments allowed'
    ),
    correct: ['b'],
    explanation: 'Region selection is primarily driven by data residency/regulatory requirements, latency/proximity to users, and service availability in that region. Fault domain count is fixed and not a selection driver.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes OCI\'s core value proposition compared with traditional on-premises infrastructure?',
    options: opts4(
      'It removes the need for any security configuration by the customer',
      'It provides on-demand, elastic, pay-for-use infrastructure that scales without large upfront capital expenditure',
      'It guarantees zero cost for all services',
      'It eliminates the need to choose a region'
    ),
    correct: ['b'],
    explanation: 'Cloud computing converts capital expense to operating expense, providing elastic, on-demand, metered resources. Customers still share security responsibility and must select regions.',
    references: [REF_OVERVIEW]
  },

  // ── OCI Identity and Access Management (13) ──
  {
    domain: IAM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In OCI IAM, what is a compartment primarily used for?',
    options: opts4(
      'Encrypting data at rest',
      'Logically organizing and isolating cloud resources for access control and billing',
      'Providing network connectivity between VCNs',
      'Storing audit logs'
    ),
    correct: ['b'],
    explanation: 'Compartments are logical containers used to organize and isolate resources, apply IAM policies, and track cost. They are not encryption, networking, or logging constructs.',
    references: [REF_COMPART]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which IAM construct grants permissions, and to which entities are permissions assigned in OCI?',
    options: opts4(
      'Policies grant permissions directly to individual users',
      'Policies grant permissions to groups (and dynamic groups), not directly to users',
      'Policies grant permissions to compartments only',
      'Policies grant permissions to regions'
    ),
    correct: ['b'],
    explanation: 'OCI policies grant permissions to groups or dynamic groups, never directly to individual users. Users obtain access by membership in a group referenced by a policy.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A policy statement reads: "Allow group NetAdmins to manage virtual-network-family in compartment Networking". What does the verb "manage" indicate?',
    options: opts4(
      'Read-only access to the resource',
      'The broadest set of permissions including create, update, and delete',
      'Permission to inspect resource metadata only',
      'Permission to use but not create resources'
    ),
    correct: ['b'],
    explanation: 'OCI policy verbs in increasing power are inspect, read, use, and manage. "manage" grants the full set of permissions for that resource family, including create/update/delete.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the OCI tenancy?',
    options: opts4(
      'A single compute instance',
      'The root compartment and secure, isolated partition where all OCI cloud resources for an organization are created',
      'A network gateway',
      'A billing invoice'
    ),
    correct: ['b'],
    explanation: 'The tenancy is the root compartment — the secure, isolated partition that Oracle provisions for an organization where all resources reside.',
    references: [REF_IAM]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'A security team wants instances to call OCI APIs (e.g. read Object Storage) without storing user credentials on the instance. Which IAM feature should they use?',
    options: opts4(
      'A static API key embedded in user data',
      'A dynamic group plus a policy granting that dynamic group permissions (instance principals)',
      'A shared password vault file',
      'A federated SAML user per instance'
    ),
    correct: ['b'],
    explanation: 'Instance principals let compute instances authenticate to OCI services. You define a dynamic group matching the instances and write a policy granting that dynamic group the needed permissions — no stored credentials.',
    references: [REF_DYNGROUP]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'A company already manages employee identities in Microsoft Entra ID and wants those users to sign in to the OCI Console without separate IAM users. Which capability enables this?',
    options: opts4(
      'Network Security Groups',
      'Identity federation with an external identity provider',
      'A dynamic group',
      'A service gateway'
    ),
    correct: ['b'],
    explanation: 'Federation establishes trust between OCI and an external IdP (e.g. Entra ID/Okta), letting existing enterprise users authenticate to OCI without duplicate IAM users.',
    references: [REF_FEDERATION]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control adds a second verification factor (such as a mobile authenticator) when a user signs in to the OCI Console?',
    options: opts4(
      'Compartment quotas',
      'Multifactor authentication (MFA)',
      'A security list',
      'A route table'
    ),
    correct: ['b'],
    explanation: 'MFA requires a second factor (e.g. an authenticator app) in addition to the password, significantly reducing the risk of compromised credentials.',
    references: [REF_MFA]
  },
  {
    domain: IAM, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants a billing rollup for the Finance department\'s resources while keeping them isolated from Engineering. What is the recommended IAM design?',
    options: opts4(
      'Place all resources in the root tenancy and tag them',
      'Create separate compartments per department and write policies scoped to each compartment',
      'Create one group per resource',
      'Use a single shared admin user for both teams'
    ),
    correct: ['b'],
    explanation: 'Compartments provide isolation plus per-compartment cost tracking and scoped policies. A compartment-per-department design supports both billing rollup and least-privilege access.',
    references: [REF_COMPART]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'In OCI, a group is a collection of users who all need the same type of access to a set of resources.',
    options: opts4('True', 'False', 'Only for federated users', 'Only in the root compartment'),
    correct: ['a'],
    explanation: 'True. A group is a collection of users with the same access needs; policies reference groups to grant that access.',
    references: [REF_GROUPS]
  },
  {
    domain: IAM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the location where an IAM policy is attached is correct?',
    options: opts4(
      'A policy attached at the tenancy (root) can grant access to resources in any compartment beneath it',
      'A policy can only ever be attached to the tenancy root',
      'A policy attached to a child compartment automatically grants access to the parent',
      'Policies cannot be attached to compartments at all'
    ),
    correct: ['a'],
    explanation: 'Policies can be attached to the tenancy or to a compartment. A tenancy-level policy can grant access across all compartments; a compartment-level policy is scoped to that compartment and its children, never the parent.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the principle of least privilege as applied to OCI IAM policy design?',
    options: opts4(
      'Grant every user manage on all resources to avoid blocking work',
      'Grant only the minimum permissions required for a group to perform its function',
      'Disable all policies and rely on network controls',
      'Use only the default Administrators group'
    ),
    correct: ['b'],
    explanation: 'Least privilege means granting only the permissions a group needs (e.g. inspect/read instead of manage when sufficient), reducing the blast radius of compromised accounts.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'A dynamic group is defined with the matching rule based on which attribute of OCI resources?',
    options: opts4(
      'The resource\'s public IP address',
      'Matching rules on resource attributes such as instance OCID, compartment OCID, or tags',
      'The resource\'s DNS name only',
      'The user\'s email domain'
    ),
    correct: ['b'],
    explanation: 'Dynamic groups use matching rules over resource attributes (e.g. instance.compartment.id, tag values) so that resources like compute instances or functions become principals for policy.',
    references: [REF_DYNGROUP]
  },
  {
    domain: IAM, difficulty: 1, type: QType.SINGLE,
    stem: 'Which default IAM group is created with full administrative privileges across the tenancy?',
    options: opts4(
      'NetworkAdmins',
      'Administrators',
      'Auditors',
      'Everyone'
    ),
    correct: ['b'],
    explanation: 'The Administrators group is created by default and has full access to all resources in the tenancy. Membership should be tightly controlled.',
    references: [REF_IAM]
  },

  // ── Networking (13) ──
  {
    domain: NET, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a Virtual Cloud Network (VCN) in OCI?',
    options: opts4(
      'A managed Kubernetes cluster',
      'A customizable, private, software-defined network you set up in an OCI region',
      'A block storage volume',
      'An IAM policy container'
    ),
    correct: ['b'],
    explanation: 'A VCN is a software-defined private network within a region, with configurable CIDR blocks, subnets, route tables, and gateways. It is the networking foundation for OCI resources.',
    references: [REF_VCN]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which gateway allows resources in a public subnet to initiate connections to and receive connections from the public internet?',
    options: opts4(
      'NAT gateway',
      'Internet gateway',
      'Service gateway',
      'Dynamic routing gateway'
    ),
    correct: ['b'],
    explanation: 'An internet gateway provides bidirectional public internet connectivity for resources with public IPs in public subnets. A NAT gateway allows only outbound-initiated connections.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Instances in a private subnet need to download OS patches from the internet but must NOT be reachable from the internet. Which gateway should be used?',
    options: opts4(
      'Internet gateway',
      'NAT gateway',
      'Local peering gateway',
      'Service gateway'
    ),
    correct: ['b'],
    explanation: 'A NAT gateway enables outbound-only internet access for private subnet resources; inbound connections from the internet cannot be initiated, satisfying the requirement.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which gateway lets resources privately access Oracle services (such as Object Storage) without traversing the public internet?',
    options: opts4(
      'Internet gateway',
      'Service gateway',
      'NAT gateway',
      'Local peering gateway'
    ),
    correct: ['b'],
    explanation: 'A service gateway provides private connectivity from a VCN to supported Oracle services (e.g. Object Storage) so traffic stays on the Oracle network rather than the public internet.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A company needs a dedicated, private, high-bandwidth connection between its on-premises data center and OCI that does not traverse the public internet. Which option should they choose?',
    options: opts4(
      'Site-to-Site VPN',
      'FastConnect',
      'Internet gateway',
      'NAT gateway'
    ),
    correct: ['b'],
    explanation: 'FastConnect provides a dedicated, private, consistent, high-bandwidth connection to OCI. Site-to-Site VPN is encrypted but rides over the public internet with variable performance.',
    references: [REF_FASTCONNECT]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI feature provides an encrypted IPSec connection between an on-premises network and a VCN over the public internet?',
    options: opts4(
      'FastConnect',
      'Site-to-Site VPN',
      'Service gateway',
      'Internet gateway'
    ),
    correct: ['b'],
    explanation: 'Site-to-Site VPN creates encrypted IPSec tunnels between on-premises CPE and the VCN (via a DRG) over the public internet — a cost-effective hybrid connectivity option.',
    references: [REF_VPN]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the role of a Dynamic Routing Gateway (DRG) in OCI?',
    options: opts4(
      'It encrypts block volumes',
      'It is a virtual router providing a path for private traffic between a VCN and on-premises networks or other VCNs',
      'It distributes incoming web traffic across backends',
      'It stores DNS records'
    ),
    correct: ['b'],
    explanation: 'A DRG is a virtual router used to connect a VCN to on-premises networks (via VPN or FastConnect) and to other VCNs, enabling private routing.',
    references: [REF_DRG]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to apply firewall rules to a specific set of VNICs regardless of their subnet, and update those rules in one place. Which OCI feature is the best fit?',
    options: opts4(
      'Security lists',
      'Network Security Groups (NSGs)',
      'Route tables',
      'DHCP options'
    ),
    correct: ['b'],
    explanation: 'NSGs are applied to individual VNICs and group them logically, independent of subnet, providing centrally managed, fine-grained virtual firewall rules. Security lists are applied at the subnet level.',
    references: [REF_NSG]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A security list rule controls traffic at which level by default?',
    options: opts4(
      'Per individual VNIC',
      'At the subnet level — applied to all VNICs in the subnet',
      'At the region level',
      'At the tenancy level'
    ),
    correct: ['b'],
    explanation: 'Security lists act as a virtual firewall at the subnet level; their ingress/egress rules apply to all VNICs in the associated subnet. NSGs operate at the VNIC level.',
    references: [REF_SECLIST]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service distributes incoming application traffic across multiple backend compute instances to improve availability and scale?',
    options: opts4(
      'Dynamic Routing Gateway',
      'Load Balancer',
      'Service gateway',
      'NAT gateway'
    ),
    correct: ['b'],
    explanation: 'The OCI Load Balancer distributes traffic across a backend set, performs health checks, and improves availability and horizontal scale of applications.',
    references: [REF_LB]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A public subnet and a private subnet can coexist within the same VCN.',
    options: opts4('True', 'False', 'Only across two VCNs', 'Only in multi-AD regions'),
    correct: ['a'],
    explanation: 'True. A VCN can contain both public and private subnets. Whether instances get public IPs depends on subnet type and routing/gateway configuration.',
    references: [REF_VCN]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'When designing a 3-tier web application, where should database servers typically be placed for security?',
    options: opts4(
      'In a public subnet with an internet gateway route',
      'In a private subnet with no direct internet ingress',
      'Outside any VCN',
      'In the tenancy root compartment only'
    ),
    correct: ['b'],
    explanation: 'Backend/database tiers belong in private subnets with no inbound internet path, accessed only by the application tier. Public exposure of databases is a common security anti-pattern.',
    references: [REF_VCN]
  },
  {
    domain: NET, difficulty: 1, type: QType.SINGLE,
    stem: 'What does a route table in a VCN determine?',
    options: opts4(
      'Which users can log in',
      'How traffic leaving a subnet is directed to gateways or other targets',
      'How block volumes are encrypted',
      'The compute shape of an instance'
    ),
    correct: ['b'],
    explanation: 'A route table contains rules that direct egress traffic from a subnet to targets such as an internet gateway, NAT gateway, DRG, or service gateway.',
    references: [REF_VCN]
  },

  // ── Compute (10) ──
  {
    domain: COMPUTE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI Compute option provides a dedicated, single-tenant physical server with no virtualization layer managed by Oracle?',
    options: opts4(
      'Virtual machine (VM) instance',
      'Bare metal instance',
      'Container instance',
      'Function'
    ),
    correct: ['b'],
    explanation: 'Bare metal instances give the customer an entire dedicated physical server with no Oracle hypervisor, ideal for performance-sensitive or licensing-sensitive workloads. VMs share physical hosts.',
    references: [REF_COMPUTE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does a compute "shape" define for an instance?',
    options: opts4(
      'The instance\'s subnet and route table',
      'The number of OCPUs/CPUs, amount of memory, and other resources allocated to the instance',
      'The IAM policies applied to the instance',
      'The object storage bucket used by the instance'
    ),
    correct: ['b'],
    explanation: 'A shape determines the compute resources — OCPU/CPU count, memory, and (for some) network bandwidth — allocated to an instance. Networking and IAM are configured separately.',
    references: [REF_SHAPES]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which compute shape type lets you independently select the number of OCPUs and the amount of memory to match a workload precisely?',
    options: opts4(
      'Fixed shapes',
      'Flexible shapes',
      'Dedicated shapes',
      'Preemptible shapes'
    ),
    correct: ['b'],
    explanation: 'Flexible shapes (e.g. the Ampere A1 Flex / Standard Flex families) let you customize OCPU and memory independently, optimizing cost and fit. Fixed shapes have preset resources.',
    references: [REF_SHAPES]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'A workload\'s demand varies through the day and the team wants instance count to grow and shrink automatically based on CPU utilization. Which feature should they configure?',
    options: opts4(
      'Custom images',
      'Autoscaling on an instance pool',
      'Bare metal instances',
      'A service gateway'
    ),
    correct: ['b'],
    explanation: 'Autoscaling on an instance pool adds or removes instances based on metrics (e.g. CPU) or schedules, matching capacity to demand and controlling cost.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'A team has hardened a Linux instance and wants to launch many identical copies. Which OCI Compute feature should they create?',
    options: opts4(
      'A custom image captured from the configured instance',
      'A new tenancy',
      'A security list',
      'An object storage bucket'
    ),
    correct: ['a'],
    explanation: 'A custom image captures the OS, configuration, and installed software of an instance so identical instances can be launched repeatedly and consistently.',
    references: [REF_IMAGES]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service provides a managed Kubernetes control plane for deploying and operating containerized applications?',
    options: opts4(
      'OCI Functions',
      'Container Engine for Kubernetes (OKE)',
      'Block Volume',
      'Resource Manager'
    ),
    correct: ['b'],
    explanation: 'OKE is OCI\'s managed Kubernetes service; Oracle manages the control plane while customers run containerized workloads on managed or self-managed nodes.',
    references: [REF_OKE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service runs code in response to events without the customer provisioning or managing servers (serverless)?',
    options: opts4(
      'OCI Functions',
      'Bare metal instances',
      'Instance pools',
      'Block Volume'
    ),
    correct: ['a'],
    explanation: 'OCI Functions is a serverless, event-driven platform (based on the Fn project) where you deploy functions and pay only for execution — no server management.',
    references: [REF_FUNCTIONS]
  },
  {
    domain: COMPUTE, difficulty: 1, type: QType.SINGLE,
    stem: 'An OCPU on Oracle Cloud Infrastructure provides the equivalent compute capacity of one physical core.',
    options: opts4('True', 'False', 'Only for bare metal', 'Only for Always Free'),
    correct: ['a'],
    explanation: 'True. An OCPU (Oracle CPU) corresponds to physical core capacity. This differs from vendors that count hyper-threaded vCPUs as full CPUs.',
    references: [REF_SHAPES]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'To make a stateless web application resilient to a single data-center failure within a region, how should compute instances be distributed?',
    options: opts4(
      'All instances in one fault domain',
      'Across multiple availability domains (or fault domains in single-AD regions) behind a load balancer',
      'All instances in the tenancy root compartment',
      'In a single private subnet with no load balancer'
    ),
    correct: ['b'],
    explanation: 'Spreading instances across availability domains (or fault domains when only one AD exists) behind a load balancer removes single points of failure and keeps the app available during a localized outage.',
    references: [REF_COMPUTE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is an instance pool in OCI Compute?',
    options: opts4(
      'A billing report grouping',
      'A group of instances created and managed as a unit from an instance configuration',
      'A storage replication set',
      'A collection of IAM users'
    ),
    correct: ['b'],
    explanation: 'An instance pool manages a number of instances based on an instance configuration as a single entity, enabling consistent provisioning and autoscaling.',
    references: [REF_AUTOSCALE]
  },

  // ── Storage (10) ──
  {
    domain: STORAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI storage service provides durable, network-attached block-level volumes that can be attached to compute instances?',
    options: opts4(
      'Object Storage',
      'Block Volume',
      'File Storage',
      'Archive Storage'
    ),
    correct: ['b'],
    explanation: 'The Block Volume service provides persistent, durable block storage that attaches to instances like a virtual disk, independent of the instance lifecycle.',
    references: [REF_BLOCK]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team needs to store and serve large amounts of unstructured data (images, backups, logs) accessible over HTTP APIs. Which service is most appropriate?',
    options: opts4(
      'Block Volume',
      'Object Storage',
      'File Storage',
      'Local NVMe'
    ),
    correct: ['b'],
    explanation: 'Object Storage is designed for unstructured data at scale, accessed via REST APIs, with high durability — ideal for backups, media, and data lakes.',
    references: [REF_OBJECT]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Multiple Linux compute instances need concurrent shared file access using the NFS protocol. Which OCI service should be used?',
    options: opts4(
      'Block Volume',
      'File Storage service',
      'Object Storage',
      'Archive Storage'
    ),
    correct: ['b'],
    explanation: 'The File Storage service provides a fully managed, shared NFS file system that many instances can mount concurrently — suited to shared application data.',
    references: [REF_FSS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Object Storage tier is designed for data that is rarely accessed and tolerates retrieval latency, at the lowest storage cost?',
    options: opts4(
      'Standard tier',
      'Archive tier',
      'Block tier',
      'Express tier'
    ),
    correct: ['b'],
    explanation: 'Archive Storage offers the lowest cost for long-term, rarely accessed data; objects must be restored before download, introducing retrieval latency. Standard is for frequent access.',
    references: [REF_ARCHIVE]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A customer wants point-in-time copies of a block volume that can be used to restore or create new volumes. Which feature provides this?',
    options: opts4(
      'Object lifecycle policies',
      'Block volume backups (and clones)',
      'A service gateway',
      'A NAT gateway'
    ),
    correct: ['b'],
    explanation: 'Block Volume backups create point-in-time snapshots stored in Object Storage; you can restore them or create new volumes. Clones create an immediate copy of a volume.',
    references: [REF_BACKUP]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'An application stores objects that are accessed frequently for 30 days and then rarely. Which Object Storage capability automatically reduces cost over time?',
    options: opts4(
      'Manually deleting objects each month',
      'Object Storage lifecycle policy rules that transition objects to Archive or delete them after a defined period',
      'Increasing the block volume size',
      'Adding a load balancer'
    ),
    correct: ['b'],
    explanation: 'Object lifecycle management rules automatically transition objects to Archive or delete them after a set number of days, optimizing storage cost without manual effort.',
    references: [REF_TIERS]
  },
  {
    domain: STORAGE, difficulty: 1, type: QType.SINGLE,
    stem: 'Block volumes can persist independently of the compute instance they were attached to.',
    options: opts4('True', 'False', 'Only for bare metal', 'Only in Always Free'),
    correct: ['a'],
    explanation: 'True. A block volume has a lifecycle independent of any instance — it can be detached and reattached to another instance, and data persists after instance termination.',
    references: [REF_BLOCK]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'By default, how does OCI protect data at rest in Block Volume, Object Storage, and File Storage?',
    options: opts4(
      'It does not encrypt data at rest by default',
      'Data is encrypted at rest by default using Oracle-managed keys (with the option to use customer-managed keys in Vault)',
      'Only Object Storage is encrypted',
      'Encryption requires a paid add-on'
    ),
    correct: ['b'],
    explanation: 'OCI encrypts data at rest by default for Block, Object, and File storage using Oracle-managed keys; customers may instead supply their own keys via the Vault service.',
    references: [REF_BLOCK]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Object Storage feature lets you grant time-limited access to a specific object without requiring the requester to have IAM credentials?',
    options: opts4(
      'A pre-authenticated request (PAR)',
      'A security list',
      'A dynamic group',
      'A route rule'
    ),
    correct: ['a'],
    explanation: 'A pre-authenticated request (PAR) provides time-limited URL-based access to a bucket or object without the recipient needing IAM credentials — useful for sharing uploads/downloads.',
    references: [REF_OBJECT]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which storage option is best for a high-performance database that needs low-latency, consistent block I/O with the ability to back up the data?',
    options: opts4(
      'Archive Storage',
      'Block Volume with the higher-performance (Balanced/High) performance level and backups enabled',
      'Object Storage Standard tier',
      'A NAT gateway'
    ),
    correct: ['b'],
    explanation: 'Block Volume offers selectable performance levels for consistent low-latency I/O and supports backups/clones — appropriate for database storage. Object/Archive are not block devices.',
    references: [REF_BLOCK]
  },

  // ── Security and Observability (9) ──
  {
    domain: SECOBS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In the OCI shared responsibility model, which party is responsible for the security OF the cloud (physical data centers, hardware, hypervisor)?',
    options: opts4(
      'The customer',
      'Oracle',
      'A third-party auditor',
      'The end users'
    ),
    correct: ['b'],
    explanation: 'Oracle is responsible for security OF the cloud (physical infrastructure, hardware, virtualization). Customers are responsible for security IN the cloud (their data, IAM, network config).',
    references: [REF_SHARED]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI service stores and centrally manages encryption keys and secrets, including the option for hardware security module (HSM) protection?',
    options: opts4(
      'Cloud Guard',
      'OCI Vault (Key Management)',
      'Audit',
      'Notifications'
    ),
    correct: ['b'],
    explanation: 'OCI Vault manages encryption keys and secrets, with HSM-backed protection available, enabling customer-managed keys for services like Block and Object Storage.',
    references: [REF_VAULT]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI service continuously monitors a tenancy for risky configurations and suspicious activity and can recommend or take corrective actions?',
    options: opts4(
      'Cloud Guard',
      'Object Storage',
      'Resource Manager',
      'FastConnect'
    ),
    correct: ['a'],
    explanation: 'Cloud Guard detects misconfigurations and threats across the tenancy using detector recipes and can apply responder actions to remediate problems.',
    references: [REF_CLOUDGUARD]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service automatically records API calls and management operations for audit and compliance, including who did what and when?',
    options: opts4(
      'Monitoring',
      'Audit',
      'Notifications',
      'Load Balancer'
    ),
    correct: ['b'],
    explanation: 'The Audit service records all API calls/management events in a tenancy (actor, action, time, resource), supporting security analysis and compliance.',
    references: [REF_AUDIT]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to collect CPU and memory metrics for compute instances and trigger an alarm when CPU exceeds a threshold. Which service provides this?',
    options: opts4(
      'Audit',
      'Monitoring (metrics and alarms)',
      'Vault',
      'Object Storage'
    ),
    correct: ['b'],
    explanation: 'The Monitoring service collects metrics and lets you define alarms that fire when thresholds are crossed, typically routed to Notifications for alerting.',
    references: [REF_MONITORING]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service publishes messages from alarms or events to subscriptions such as email, PagerDuty, or functions?',
    options: opts4(
      'Notifications',
      'Logging',
      'Vault',
      'Bastion'
    ),
    correct: ['a'],
    explanation: 'The Notifications service delivers messages to subscriptions (email, HTTPS, PagerDuty, Functions) and is commonly the target of Monitoring alarms and Events rules.',
    references: [REF_NOTIF]
  },
  {
    domain: SECOBS, difficulty: 3, type: QType.SINGLE,
    stem: 'A security policy forbids assigning public IPs to administrative hosts, but admins still need secure SSH access to private instances. Which OCI service provides time-bound, audited access without a public IP?',
    options: opts4(
      'Internet gateway',
      'OCI Bastion service',
      'Service gateway',
      'NAT gateway'
    ),
    correct: ['b'],
    explanation: 'The OCI Bastion service provides restricted, time-bound SSH sessions to private resources without exposing them via public IPs, improving security posture.',
    references: [REF_BASTION]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service helps protect web applications from common exploits such as SQL injection and cross-site scripting at the edge?',
    options: opts4(
      'Web Application Firewall (WAF)',
      'Block Volume',
      'Service gateway',
      'File Storage'
    ),
    correct: ['a'],
    explanation: 'OCI WAF inspects HTTP/S traffic and applies rules (including OWASP protections) to block malicious requests before they reach the application.',
    references: [REF_WAF]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'In the shared responsibility model, configuring IAM policies and securing customer data are the customer\'s responsibility.',
    options: opts4('True', 'False', 'Only for paid tenancies', 'Only in commercial regions'),
    correct: ['a'],
    explanation: 'True. Customers are responsible for security IN the cloud — IAM configuration, data classification/protection, network security rules, and OS patching.',
    references: [REF_SHARED]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── OCI Introduction (10) ──
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A workload must remain available even if one entire availability domain in a multi-AD region fails. What is the recommended design principle?',
    options: opts4(
      'Deploy everything in a single AD for lower latency',
      'Distribute redundant resources across multiple availability domains',
      'Use only fault domains within one AD',
      'Rely on a single bare metal instance'
    ),
    correct: ['b'],
    explanation: 'High availability across an AD failure requires distributing redundant components across multiple availability domains so the loss of one AD does not take down the workload.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'How many fault domains does each OCI availability domain contain?',
    options: opts4('One', 'Two', 'Three', 'Five'),
    correct: ['c'],
    explanation: 'Each availability domain has three fault domains. Distributing instances across the three fault domains protects against hardware failure and AD-internal maintenance.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A startup wants to experiment with OCI at no cost and keep a small always-on instance after the trial ends. Which combination should they expect?',
    options: opts4(
      'Free Trial credits only, with no lasting free resources',
      'Free Trial credits for 30 days plus Always Free eligible resources that continue after the trial',
      'Unlimited free use of all services forever',
      'Paid Universal Credits only'
    ),
    correct: ['b'],
    explanation: 'A new account gets 30-day Free Trial credits and access to Always Free eligible resources that continue indefinitely (within limits) after the trial credits expire.',
    references: [REF_FREE]
  },
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which characteristic best describes cloud computing elasticity in OCI?',
    options: opts4(
      'Resources are fixed at provisioning and cannot change',
      'Resources can be scaled up or down on demand to match workload needs',
      'Resources are only available in one region',
      'Resources require a multi-year contract'
    ),
    correct: ['b'],
    explanation: 'Elasticity means provisioning and releasing resources on demand so capacity matches need, avoiding over-provisioning and reducing cost.',
    references: [REF_OVERVIEW]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI pricing characteristic is consistent globally and not varied by region?',
    options: opts4(
      'Compute pricing differs widely per region by design',
      'OCI offers consistent, predictable pricing across regions',
      'Pricing is only available with annual commitment',
      'Always Free resources are billed hourly'
    ),
    correct: ['b'],
    explanation: 'A stated OCI value is consistent, predictable pricing globally across regions, simplifying cost planning. Always Free resources are not billed.',
    references: [REF_PRICING]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'What does an OCI service limit (quota) represent?',
    options: opts4(
      'A hard cap that can never be changed',
      'The maximum amount of a resource you can create, often raisable via a support request',
      'The encryption key length for a service',
      'The number of regions in the world'
    ),
    correct: ['b'],
    explanation: 'Service limits cap how many of a resource a tenancy can provision; many are soft limits that can be increased through a service limit increase request.',
    references: [REF_SUPPORT]
  },
  {
    domain: INTRO, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization must keep all data physically within one country to satisfy regulatory requirements. Which OCI capability primarily addresses this?',
    options: opts4(
      'Choosing a region located in that country (data residency)',
      'Adding more fault domains',
      'Using a larger compute shape',
      'Enabling autoscaling'
    ),
    correct: ['a'],
    explanation: 'Selecting an OCI region within the required country addresses data residency/sovereignty obligations. Fault domains, shapes, and autoscaling do not affect data location.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE,
    stem: 'OCI Service Level Agreements can cover not only availability but also manageability and performance.',
    options: opts4('True', 'False', 'Only availability is ever covered', 'Only performance is covered'),
    correct: ['a'],
    explanation: 'True. OCI is distinctive in offering SLAs that can cover availability, manageability, and performance, whereas many providers cover availability only.',
    references: [REF_SLA]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes a region from an availability domain?',
    options: opts4(
      'A region is inside an availability domain',
      'A region is a geographic area that contains one or more availability domains (isolated data centers)',
      'They are synonyms',
      'An availability domain spans multiple regions'
    ),
    correct: ['b'],
    explanation: 'A region is a geographic area containing one or more availability domains. ADs are isolated data centers within a region and never span regions.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'A customer with steady, long-term usage wants the lowest effective rate and predictable budgeting. Which model is generally most cost-effective?',
    options: opts4(
      'Pure Pay As You Go with no commitment',
      'An Annual Universal Credits commitment sized to expected usage',
      'Only Always Free resources',
      'Creating multiple separate trial accounts'
    ),
    correct: ['b'],
    explanation: 'A committed Universal Credits (annual) model typically yields better effective rates and predictable budgeting for steady long-term usage compared with pure PAYG.',
    references: [REF_PRICING]
  },

  // ── OCI Identity and Access Management (13) ──
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI identifier is a globally unique ID assigned to every resource, user, and compartment?',
    options: opts4(
      'A CIDR block',
      'An OCID (Oracle Cloud Identifier)',
      'A MAC address',
      'A bucket name'
    ),
    correct: ['b'],
    explanation: 'Every OCI resource has an OCID — a unique Oracle Cloud Identifier used to reference it in policies, APIs, and dynamic group rules.',
    references: [REF_IAM]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A policy must let a group create and delete only object storage buckets and objects in one compartment. Which resource and verb scope is most appropriate?',
    options: opts4(
      'manage all-resources in tenancy',
      'manage object-family in that compartment',
      'inspect all-resources in tenancy',
      'read instance-family in that compartment'
    ),
    correct: ['b'],
    explanation: 'Least privilege: grant manage on object-family scoped to the single compartment so the group can create/delete buckets/objects there only, not all resources tenancy-wide.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which IAM verb provides the LEAST access in an OCI policy statement?',
    options: opts4('manage', 'use', 'read', 'inspect'),
    correct: ['d'],
    explanation: 'The verb hierarchy from least to most access is inspect, read, use, manage. "inspect" allows listing resources with the least detail.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the relationship between compartments and the tenancy?',
    options: opts4(
      'Compartments exist outside the tenancy',
      'The tenancy is the root compartment; other compartments are nested within it (hierarchically)',
      'Each compartment is a separate tenancy',
      'Compartments are network subnets'
    ),
    correct: ['b'],
    explanation: 'The tenancy is the root compartment. Additional compartments form a hierarchy nested under the root, enabling isolation and delegated administration.',
    references: [REF_COMPART]
  },
  {
    domain: IAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A function needs to read secrets from OCI Vault. The team must avoid embedding credentials in the function. What is the correct approach?',
    options: opts4(
      'Hardcode an API key in the function code',
      'Add the function to a dynamic group and write a policy granting that dynamic group read access to the vault secrets (resource principals)',
      'Make the Vault public',
      'Disable IAM for the function'
    ),
    correct: ['b'],
    explanation: 'Resource principals: a dynamic group matches the function, and a policy grants that dynamic group read on secret-family. No credentials are stored in code.',
    references: [REF_DYNGROUP]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants single sign-on so its existing corporate users sign in to OCI using their corporate credentials. Which step is required?',
    options: opts4(
      'Create a separate local IAM user for every employee',
      'Set up federation between OCI and the corporate identity provider and map IdP groups to OCI groups',
      'Open an internet gateway',
      'Create a NAT gateway'
    ),
    correct: ['b'],
    explanation: 'Federation with the corporate IdP and group mappings enables SSO without maintaining duplicate local IAM users for each employee.',
    references: [REF_FEDERATION]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control most directly mitigates the risk of a stolen Console password for an administrator?',
    options: opts4(
      'A bigger compute shape',
      'Requiring multifactor authentication (MFA) for the administrator',
      'A larger block volume',
      'A service gateway'
    ),
    correct: ['b'],
    explanation: 'MFA requires an additional factor beyond the password, so a stolen password alone is insufficient to gain access — directly mitigating credential theft.',
    references: [REF_MFA]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'An OCI policy can be written to grant a group access to resources only within a specific compartment.',
    options: opts4('True', 'False', 'Only at the tenancy root', 'Only for federated groups'),
    correct: ['a'],
    explanation: 'True. Policy statements scope access to a compartment (e.g. "in compartment X"), enabling least-privilege, compartment-scoped permissions.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the benefit of organizing resources into compartments rather than placing everything in the tenancy root?',
    options: opts4(
      'It increases network throughput',
      'It enables isolation, scoped access control, cost tracking, and delegated administration',
      'It encrypts data automatically',
      'It removes the need for IAM policies'
    ),
    correct: ['b'],
    explanation: 'Compartments give logical isolation, scoped policies (least privilege), per-compartment cost visibility, and the ability to delegate administration — better governance than a flat root.',
    references: [REF_COMPART]
  },
  {
    domain: IAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A group has a policy "Allow group Devs to read all-resources in compartment Dev". A developer cannot terminate an instance in compartment Dev. Why?',
    options: opts4(
      'The policy is attached to the wrong region',
      'The "read" verb does not include the permissions to delete/terminate resources; "manage" would be required',
      'Compartments cannot contain instances',
      'The user is not in any group'
    ),
    correct: ['b'],
    explanation: 'read grants viewing access but not create/update/delete. Terminating an instance requires manage on instance-family (use/manage level), not read.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 1, type: QType.SINGLE,
    stem: 'In OCI IAM, to what is a user typically added so that policies apply to them?',
    options: opts4(
      'A subnet',
      'One or more groups',
      'A route table',
      'A block volume'
    ),
    correct: ['b'],
    explanation: 'Users are placed into groups; policies grant permissions to groups. A user inherits access through group membership.',
    references: [REF_GROUPS]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which IAM element is required to allow a compute instance itself (not a human user) to be authorized to call OCI services?',
    options: opts4(
      'A user password',
      'A dynamic group with a matching rule, referenced by a policy',
      'A NAT gateway',
      'A security list'
    ),
    correct: ['b'],
    explanation: 'Dynamic groups make resources like instances principals. A matching rule selects the instances and a policy grants the dynamic group the needed permissions.',
    references: [REF_DYNGROUP]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about IAM policy inheritance in the compartment hierarchy is correct?',
    options: opts4(
      'A policy on a parent compartment can apply to resources in its child compartments',
      'Child compartments override parent permissions automatically',
      'Policies never apply below the compartment they are attached to',
      'Policies apply upward to the parent compartment'
    ),
    correct: ['a'],
    explanation: 'A policy attached to a compartment applies to that compartment and the compartments nested beneath it; it does not grant access to the parent.',
    references: [REF_POLICY]
  },

  // ── Networking (13) ──
  {
    domain: NET, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'When creating a VCN, what must you define that determines the private IP address space available to its subnets?',
    options: opts4(
      'A compute shape',
      'One or more CIDR blocks',
      'A storage tier',
      'An IAM group'
    ),
    correct: ['b'],
    explanation: 'A VCN is defined with one or more CIDR blocks; subnets carve non-overlapping ranges from the VCN CIDR for private IP allocation.',
    references: [REF_VCN]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which gateway should connect a VCN to another VCN in the SAME region using private IPs?',
    options: opts4(
      'Internet gateway',
      'Local Peering Gateway (LPG) or DRG-based local peering',
      'NAT gateway',
      'Service gateway'
    ),
    correct: ['b'],
    explanation: 'Local VCN peering (via LPG or a DRG) connects two VCNs in the same region for private routing. Internet/NAT/service gateways do not peer VCNs.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A private instance must reach Oracle Object Storage without sending traffic over the public internet. Which gateway enables this?',
    options: opts4(
      'Internet gateway',
      'Service gateway',
      'Local peering gateway',
      'Dynamic routing gateway'
    ),
    correct: ['b'],
    explanation: 'A service gateway provides private access from the VCN to supported Oracle services such as Object Storage, keeping traffic off the public internet.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What primarily determines whether a subnet is "public" or "private" in OCI?',
    options: opts4(
      'The block volume attached to instances',
      'Whether instances in the subnet can be assigned public IP addresses (and routing to an internet gateway)',
      'The compartment it belongs to',
      'The compute shape used'
    ),
    correct: ['b'],
    explanation: 'A public subnet allows public IP assignment and typically routes to an internet gateway; a private subnet does not allow public IPs. The distinction is about public IP/Internet reachability.',
    references: [REF_VCN]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An enterprise needs consistent low-latency connectivity to OCI with a private circuit and predictable bandwidth for a data-migration project. Which is the best choice?',
    options: opts4(
      'Site-to-Site VPN over the internet',
      'FastConnect',
      'A public internet gateway',
      'A NAT gateway'
    ),
    correct: ['b'],
    explanation: 'FastConnect offers a private, dedicated connection with consistent latency and predictable bandwidth — preferable for large migrations versus internet-based VPN.',
    references: [REF_FASTCONNECT]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which two OCI options can connect an on-premises network to a VCN? (Choose the answer listing both.)',
    options: opts4(
      'Internet gateway and NAT gateway',
      'Site-to-Site VPN and FastConnect (via a DRG)',
      'Service gateway and local peering gateway',
      'Security list and route table'
    ),
    correct: ['b'],
    explanation: 'Hybrid connectivity to on-premises uses Site-to-Site VPN (IPSec over the internet) or FastConnect (private circuit), both attached to the VCN through a DRG.',
    references: [REF_DRG]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the function of an OCI Load Balancer health check?',
    options: opts4(
      'It encrypts data at rest',
      'It monitors backend servers and stops routing traffic to unhealthy ones',
      'It assigns OCIDs to resources',
      'It manages IAM policies'
    ),
    correct: ['b'],
    explanation: 'Load balancer health checks probe backends and remove unhealthy ones from rotation, sending traffic only to healthy instances for better availability.',
    references: [REF_LB]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload requires firewall rules that follow specific instances even when they are moved between subnets. Which feature satisfies this?',
    options: opts4(
      'Security lists (subnet-scoped)',
      'Network Security Groups (VNIC-scoped membership)',
      'Route tables',
      'DHCP options'
    ),
    correct: ['b'],
    explanation: 'NSGs group VNICs and apply rules to those members regardless of subnet, so the rules follow the instances. Security lists are tied to the subnet, not the instance.',
    references: [REF_NSG]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about security lists and NSGs is correct?',
    options: opts4(
      'They are identical and cannot be used together',
      'Security lists apply to all VNICs in a subnet; NSGs apply to a defined set of VNICs, and both can be used together',
      'Only one of them can exist per VCN',
      'NSGs apply to entire regions'
    ),
    correct: ['b'],
    explanation: 'Security lists are subnet-level virtual firewalls; NSGs are VNIC-level. They can be combined, and a packet is allowed if permitted by the applicable rules of both.',
    references: [REF_SECLIST]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A NAT gateway allows instances in a private subnet to receive unsolicited inbound connections from the internet.',
    options: opts4('True', 'False', 'Only with a public IP', 'Only in single-AD regions'),
    correct: ['b'],
    explanation: 'False. A NAT gateway permits outbound-initiated connections only; it does not allow unsolicited inbound connections from the internet to private instances.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of a Dynamic Routing Gateway (DRG) attachment to a VCN?',
    options: opts4(
      'To attach block storage',
      'To provide the VCN a path for private traffic to on-premises networks or other VCNs/regions',
      'To create IAM users',
      'To define object storage lifecycle rules'
    ),
    correct: ['b'],
    explanation: 'A DRG is a virtual router; attaching it to a VCN enables private routing to on-premises (via VPN/FastConnect) and to other VCNs, including remote peering across regions.',
    references: [REF_DRG]
  },
  {
    domain: NET, difficulty: 1, type: QType.SINGLE,
    stem: 'Which OCI Load Balancer type provides a public entry point for internet-facing web traffic?',
    options: opts4(
      'A private load balancer with no public IP',
      'A public load balancer with a public IP address',
      'A NAT gateway',
      'A service gateway'
    ),
    correct: ['b'],
    explanation: 'A public load balancer has a public IP and accepts internet traffic, distributing it to backends. A private load balancer is reachable only within the VCN.',
    references: [REF_LB]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An application tier in a public subnet must talk to a database tier in a private subnet within the same VCN. What enables this communication by default?',
    options: opts4(
      'It is impossible without an internet gateway',
      'Instances in different subnets of the same VCN can route to each other via the VCN\'s local routing, subject to security rules',
      'A FastConnect circuit is required',
      'They must be in separate VCNs'
    ),
    correct: ['b'],
    explanation: 'Subnets within the same VCN have local routing between them; communication is permitted as long as security lists/NSGs allow it. No internet gateway is needed for intra-VCN traffic.',
    references: [REF_VCN]
  },

  // ── Compute (10) ──
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A licensing model requires running on a non-virtualized, fully isolated physical machine. Which OCI Compute option meets this?',
    options: opts4(
      'A burstable VM',
      'A bare metal instance',
      'A function',
      'A container instance'
    ),
    correct: ['b'],
    explanation: 'Bare metal instances provide a dedicated physical server with no Oracle hypervisor — appropriate for licensing or performance requirements that prohibit virtualization.',
    references: [REF_COMPUTE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team wants to right-size cost by allocating exactly 2 OCPUs and 32 GB of memory. Which shape category supports this independent selection?',
    options: opts4(
      'Fixed standard shapes',
      'Flexible shapes',
      'Dense I/O fixed shapes',
      'GPU fixed shapes'
    ),
    correct: ['b'],
    explanation: 'Flexible shapes let you choose OCPU and memory independently within allowed ranges, so you can request exactly the resources needed.',
    references: [REF_SHAPES]
  },
  {
    domain: COMPUTE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary benefit of creating a custom image in OCI Compute?',
    options: opts4(
      'It reduces object storage cost',
      'It lets you launch new instances pre-configured with your OS, software, and settings consistently',
      'It assigns public IPs automatically',
      'It encrypts the VCN'
    ),
    correct: ['b'],
    explanation: 'A custom image captures a configured instance so you can launch consistent, repeatable instances with the same OS and software baseline.',
    references: [REF_IMAGES]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI service is best suited to run short-lived, event-triggered code without managing any servers?',
    options: opts4(
      'OCI Functions',
      'Bare metal compute',
      'Block Volume',
      'A custom image'
    ),
    correct: ['a'],
    explanation: 'OCI Functions is serverless and event-driven; you deploy code and Oracle runs it on demand, billing per execution with no server management.',
    references: [REF_FUNCTIONS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'An e-commerce site sees predictable traffic spikes every evening. Which approach scales capacity automatically and cost-effectively?',
    options: opts4(
      'Manually launching instances each evening',
      'Schedule-based autoscaling on an instance pool',
      'Using a single large bare metal server permanently',
      'Disabling the load balancer at night'
    ),
    correct: ['b'],
    explanation: 'Schedule-based autoscaling adds capacity ahead of predictable peaks and reduces it afterward, automating scale and minimizing cost versus permanent over-provisioning.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service manages the Kubernetes control plane so customers focus on deploying containerized workloads?',
    options: opts4(
      'OCI Functions',
      'Container Engine for Kubernetes (OKE)',
      'Resource Manager',
      'Object Storage'
    ),
    correct: ['b'],
    explanation: 'OKE is the managed Kubernetes service; Oracle operates the control plane and customers run their containers on worker nodes.',
    references: [REF_OKE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'What does an instance configuration define when used with an instance pool?',
    options: opts4(
      'The IAM administrators of the tenancy',
      'A template (shape, image, networking, metadata) used to create instances in the pool',
      'The object storage lifecycle rules',
      'The VCN CIDR block'
    ),
    correct: ['b'],
    explanation: 'An instance configuration is a reusable template specifying shape, image, network, and metadata; an instance pool uses it to create and manage identical instances.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: COMPUTE, difficulty: 1, type: QType.SINGLE,
    stem: 'Virtual machine instances on OCI share underlying physical hardware with other tenants\' VMs.',
    options: opts4('True', 'False', 'Only bare metal does', 'Only in Always Free'),
    correct: ['a'],
    explanation: 'True. VM instances run on shared physical hosts via the hypervisor (multi-tenant). Bare metal provides a dedicated, single-tenant physical server.',
    references: [REF_COMPUTE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Compute capability lets you place instances in different fault domains to reduce the impact of localized hardware failure?',
    options: opts4(
      'Object lifecycle policies',
      'Choosing fault domain placement when launching instances',
      'A NAT gateway',
      'A pre-authenticated request'
    ),
    correct: ['b'],
    explanation: 'You can select a fault domain when launching an instance; distributing instances across the three fault domains reduces the chance that one hardware failure affects all of them.',
    references: [REF_SHAPES]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about OCI Functions billing best reflects the serverless model?',
    options: opts4(
      'You pay a flat monthly fee regardless of usage',
      'You are billed based on the number of invocations and the resources consumed during execution',
      'You must reserve a bare metal server first',
      'Billing requires an annual commitment'
    ),
    correct: ['b'],
    explanation: 'Serverless Functions bill per invocation and for resources consumed during execution, so idle code incurs no compute charge.',
    references: [REF_FUNCTIONS]
  },

  // ── Storage (10) ──
  {
    domain: STORAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which storage service is most appropriate as the boot disk and additional persistent disks for a compute instance?',
    options: opts4(
      'Object Storage',
      'Block Volume',
      'Archive Storage',
      'File Storage'
    ),
    correct: ['b'],
    explanation: 'Block Volume provides boot volumes and additional block-level disks that attach to instances, behaving like virtual hard disks.',
    references: [REF_BLOCK]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A media company needs internet-accessible, highly durable storage for millions of video files served via REST APIs. Which service fits best?',
    options: opts4(
      'Block Volume',
      'Object Storage',
      'File Storage',
      'Local NVMe'
    ),
    correct: ['b'],
    explanation: 'Object Storage stores virtually unlimited unstructured objects with high durability, accessible via REST/HTTP — ideal for large media libraries.',
    references: [REF_OBJECT]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI storage service offers a managed, shared NFS file system mountable by many instances simultaneously?',
    options: opts4(
      'Object Storage',
      'File Storage service',
      'Block Volume',
      'Archive Storage'
    ),
    correct: ['b'],
    explanation: 'The File Storage service provides a fully managed shared file system using NFS, supporting concurrent access from multiple compute instances.',
    references: [REF_FSS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Long-term compliance archives are accessed once or twice a year and retrieval delay is acceptable. Which is the most cost-effective choice?',
    options: opts4(
      'Block Volume',
      'Object Storage Archive tier',
      'File Storage',
      'Local NVMe'
    ),
    correct: ['b'],
    explanation: 'The Archive tier is the lowest-cost option for rarely accessed data; objects must be restored before download, which is acceptable for infrequent compliance access.',
    references: [REF_ARCHIVE]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature creates a near-instant, independent copy of a block volume that is usable immediately?',
    options: opts4(
      'A volume clone',
      'A NAT gateway',
      'A security list',
      'A route rule'
    ),
    correct: ['a'],
    explanation: 'A volume clone makes an immediately usable, point-in-time copy of a block volume. Backups, by contrast, are stored in Object Storage and used for restore.',
    references: [REF_BACKUP]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'To automate cost reduction, an admin wants objects deleted 365 days after creation. Which Object Storage capability accomplishes this without code?',
    options: opts4(
      'Pre-authenticated requests',
      'Object lifecycle policy rules',
      'A dynamic group',
      'A DRG attachment'
    ),
    correct: ['b'],
    explanation: 'Object lifecycle management rules can automatically delete or archive objects after a defined age, automating retention and cost control.',
    references: [REF_TIERS]
  },
  {
    domain: STORAGE, difficulty: 1, type: QType.SINGLE,
    stem: 'Object Storage is designed for very high durability of stored objects.',
    options: opts4('True', 'False', 'Only the Archive tier is durable', 'Only with a paid add-on'),
    correct: ['a'],
    explanation: 'True. Object Storage is engineered for high durability, storing redundant copies of data so objects are protected against hardware failure.',
    references: [REF_OBJECT]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A customer wants to control the encryption keys used to encrypt their Object Storage and Block Volume data. Which OCI service should they use?',
    options: opts4(
      'OCI Vault (customer-managed keys)',
      'Cloud Guard',
      'Notifications',
      'Audit'
    ),
    correct: ['a'],
    explanation: 'OCI Vault lets customers create and manage their own encryption keys and assign them to services like Object Storage and Block Volume instead of using Oracle-managed keys.',
    references: [REF_VAULT]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a pre-authenticated request (PAR) in Object Storage primarily used for?',
    options: opts4(
      'Encrypting block volumes',
      'Granting temporary, credential-free access to a bucket or object via a URL',
      'Routing VCN traffic',
      'Creating IAM groups'
    ),
    correct: ['b'],
    explanation: 'A PAR generates a time-limited URL allowing a recipient to upload or download without IAM credentials — useful for sharing data externally.',
    references: [REF_OBJECT]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A relational database server requires consistent, low-latency, persistent disk performance that survives instance termination. Which storage choice is best?',
    options: opts4(
      'Object Storage Standard tier',
      'Block Volume attached to the instance with backups enabled',
      'Archive Storage',
      'A pre-authenticated request'
    ),
    correct: ['b'],
    explanation: 'Block Volume delivers consistent low-latency block I/O and persists independently of the instance, with backup/clone for protection — appropriate for databases.',
    references: [REF_BLOCK]
  },

  // ── Security and Observability (9) ──
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Under the shared responsibility model, who is responsible for configuring security lists, IAM policies, and patching the guest OS?',
    options: opts4(
      'Oracle',
      'The customer',
      'A managed service provider only',
      'No one — it is automatic'
    ),
    correct: ['b'],
    explanation: 'Security IN the cloud — IAM policy, network rules, guest OS patching, and data protection — is the customer\'s responsibility; Oracle secures the underlying infrastructure.',
    references: [REF_SHARED]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service centrally detects misconfigurations and threats across an OCI tenancy and can automatically remediate them?',
    options: opts4(
      'Cloud Guard',
      'Block Volume',
      'Notifications',
      'Resource Manager'
    ),
    correct: ['a'],
    explanation: 'Cloud Guard uses detectors and responders to identify risky configurations/activities tenancy-wide and can automatically take corrective actions.',
    references: [REF_CLOUDGUARD]
  },
  {
    domain: SECOBS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI service records who performed which API operations and when, for auditing and compliance?',
    options: opts4(
      'Audit',
      'Object Storage',
      'Load Balancer',
      'Service gateway'
    ),
    correct: ['a'],
    explanation: 'The Audit service automatically logs API/management events (actor, action, timestamp, resource) for the tenancy, supporting compliance and investigation.',
    references: [REF_AUDIT]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs to collect, search, and analyze application and audit logs in one place. Which OCI service is designed for this?',
    options: opts4(
      'Logging service',
      'Block Volume',
      'NAT gateway',
      'Vault'
    ),
    correct: ['a'],
    explanation: 'The Logging service centralizes logs (custom application logs, service logs, audit logs) for ingestion, search, and analysis across the tenancy.',
    references: [REF_LOGGING]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which combination is commonly used to alert an on-call engineer when an instance\'s CPU stays above 90%?',
    options: opts4(
      'Object Storage and a PAR',
      'A Monitoring alarm that publishes to a Notifications topic with an email/PagerDuty subscription',
      'A DRG and a service gateway',
      'A custom image and an instance pool'
    ),
    correct: ['b'],
    explanation: 'Monitoring evaluates the metric against an alarm; when triggered it publishes to a Notifications topic, which delivers to email/PagerDuty/Functions subscriptions.',
    references: [REF_MONITORING]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service provides secure, time-bound SSH/RDP access to private instances without assigning them public IPs?',
    options: opts4(
      'OCI Bastion',
      'Internet gateway',
      'Service gateway',
      'Load Balancer'
    ),
    correct: ['a'],
    explanation: 'The OCI Bastion service brokers restricted, time-limited sessions to private resources, removing the need for public IPs or jump hosts you manage yourself.',
    references: [REF_BASTION]
  },
  {
    domain: SECOBS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization must protect a public web application from OWASP Top 10 attacks before requests reach the backend. Which OCI service should be deployed?',
    options: opts4(
      'OCI Vault',
      'Web Application Firewall (WAF)',
      'Block Volume',
      'Audit'
    ),
    correct: ['b'],
    explanation: 'OCI WAF filters and inspects HTTP/S traffic, applying managed and custom rules (including OWASP protections) to block attacks before they hit the application.',
    references: [REF_WAF]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'OCI Vault can be used to manage customer-controlled encryption keys for OCI services.',
    options: opts4('True', 'False', 'Only Oracle can manage keys', 'Only for Object Storage'),
    correct: ['a'],
    explanation: 'True. OCI Vault manages encryption keys and secrets; customers can create and control keys (optionally HSM-backed) and assign them to services such as Block and Object Storage.',
    references: [REF_VAULT]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'In the shared responsibility model, which is an example of a responsibility that belongs to Oracle?',
    options: opts4(
      'Configuring IAM policies for users',
      'Physical security of the data centers and the underlying hardware/virtualization',
      'Patching the customer\'s application code',
      'Defining security list rules'
    ),
    correct: ['b'],
    explanation: 'Oracle secures the physical facilities, hardware, and virtualization layer (security OF the cloud). IAM configuration, app patching, and security lists are customer responsibilities.',
    references: [REF_SHARED]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── OCI Introduction (10) ──
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI physical construct is described as one or more isolated, fault-tolerant data centers within a single region?',
    options: opts4(
      'Fault domain',
      'Availability domain',
      'Compartment',
      'Subnet'
    ),
    correct: ['b'],
    explanation: 'Availability domains are isolated data centers within a region that do not share single points of failure such as power and cooling. Fault domains are subdivisions within an AD.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a region that has only a single availability domain, what should be used to achieve hardware fault isolation for an application?',
    options: opts4(
      'Multiple regions only',
      'Distributing instances across the three fault domains in that AD',
      'A single fault domain',
      'A larger compute shape'
    ),
    correct: ['b'],
    explanation: 'When a region has one AD, spreading instances across its three fault domains provides hardware fault isolation and protection from AD-internal maintenance.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'How long do Oracle Cloud Free Trial credits typically remain available to a new account?',
    options: opts4(
      'For 7 days',
      'For 30 days',
      'Forever',
      'For 365 days'
    ),
    correct: ['b'],
    explanation: 'Free Trial credits are typically available for 30 days. Always Free resources, by contrast, remain available with no time limit (within usage limits).',
    references: [REF_FREE]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a key economic benefit of cloud computing relevant to OCI adoption?',
    options: opts4(
      'Mandatory large upfront capital expenditure',
      'Converting capital expenditure to operating expenditure with pay-for-use consumption',
      'Fixed capacity that cannot change',
      'No need to choose any region'
    ),
    correct: ['b'],
    explanation: 'Cloud shifts spending from CapEx to OpEx with metered, pay-for-use consumption and elasticity, avoiding large upfront hardware purchases.',
    references: [REF_OVERVIEW]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about OCI Always Free resources is accurate?',
    options: opts4(
      'They expire after the 30-day trial',
      'They remain available with no time limit, subject to defined resource limits',
      'They include unlimited bare metal servers',
      'They are only available in one region worldwide'
    ),
    correct: ['b'],
    explanation: 'Always Free resources persist beyond the trial with no time limit, but only within specific quantity/size limits (e.g. small instances, limited storage).',
    references: [REF_FREE]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'A finance team wants to consume any OCI service flexibly while drawing down a pre-purchased balance. Which model supports this?',
    options: opts4(
      'Always Free',
      'Universal Credits',
      'A single 30-day trial',
      'Per-service fixed contracts'
    ),
    correct: ['b'],
    explanation: 'Universal Credits provide a pre-purchased balance that can be applied to any eligible OCI service, combining flexibility with predictable budgeting.',
    references: [REF_PRICING]
  },
  {
    domain: INTRO, difficulty: 3, type: QType.SINGLE,
    stem: 'An application has users in both North America and Europe and must minimize latency for each group while honoring EU data residency for European user data. What is the best approach?',
    options: opts4(
      'Deploy only in one US region for everyone',
      'Deploy in regions close to each user base, keeping EU user data in an EU region to meet residency',
      'Use more fault domains in one region',
      'Use a larger shape in one region'
    ),
    correct: ['b'],
    explanation: 'Multi-region deployment near each user base reduces latency, while placing EU data in an EU region satisfies data residency. Fault domains/shapes do not address geography or residency.',
    references: [REF_REGIONS]
  },
  {
    domain: INTRO, difficulty: 1, type: QType.SINGLE,
    stem: 'A service limit increase in OCI is typically requested through a support/service request.',
    options: opts4('True', 'False', 'Limits can never be increased', 'Only by creating a new tenancy'),
    correct: ['a'],
    explanation: 'True. Many OCI service limits are soft and can be raised by submitting a service limit increase (support) request rather than creating a new tenancy.',
    references: [REF_SUPPORT]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI characteristic helps customers avoid surprise costs when comparing deployments in different regions?',
    options: opts4(
      'Region-specific pricing that changes frequently',
      'Consistent, predictable global pricing for services',
      'Hidden per-region surcharges',
      'Mandatory annual prepayment for all services'
    ),
    correct: ['b'],
    explanation: 'OCI promotes consistent, predictable pricing across regions, simplifying cost comparison and budgeting regardless of where workloads are deployed.',
    references: [REF_PRICING]
  },
  {
    domain: INTRO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI SLA dimension is unusual compared with most cloud providers, which typically guarantee only availability?',
    options: opts4(
      'Performance and manageability guarantees in addition to availability',
      'A guarantee of zero cost',
      'A guarantee that no region will ever exist',
      'A guarantee of unlimited service limits'
    ),
    correct: ['a'],
    explanation: 'OCI is notable for SLAs that can include performance and manageability commitments in addition to availability, going beyond the typical availability-only SLA.',
    references: [REF_SLA]
  },

  // ── OCI Identity and Access Management (13) ──
  {
    domain: IAM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What does IAM stand for in OCI, and what is its core purpose?',
    options: opts4(
      'Internet Access Management — controls VCN routing',
      'Identity and Access Management — controls who can access which resources and what actions they can perform',
      'Image and Application Manager — manages compute images',
      'Infrastructure Audit Module — records logs'
    ),
    correct: ['b'],
    explanation: 'IAM (Identity and Access Management) governs authentication and authorization — which identities can access which OCI resources and what they may do.',
    references: [REF_IAM]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A policy reads "Allow group Auditors to inspect all-resources in tenancy". What can the Auditors group do?',
    options: opts4(
      'Create and delete any resource',
      'List/view resources with limited detail, but not modify them',
      'Only manage networking resources',
      'Nothing — inspect is not a valid verb'
    ),
    correct: ['b'],
    explanation: 'The inspect verb permits listing/viewing resources (limited detail) without the ability to create, update, or delete them — suitable for an auditor role.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which best describes the purpose of a dynamic group in OCI?',
    options: opts4(
      'To group human users for billing',
      'To group OCI resources (like instances or functions) so they can be granted permissions as principals',
      'To define VCN subnets',
      'To store encryption keys'
    ),
    correct: ['b'],
    explanation: 'Dynamic groups define matching rules over resources so those resources (e.g. compute instances, functions) become principals that policies can authorize.',
    references: [REF_DYNGROUP]
  },
  {
    domain: IAM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the correct order of IAM policy verbs from MOST to LEAST permissive?',
    options: opts4(
      'inspect, read, use, manage',
      'manage, use, read, inspect',
      'read, manage, inspect, use',
      'use, inspect, manage, read'
    ),
    correct: ['b'],
    explanation: 'From most to least permissive: manage, use, read, inspect. "manage" includes full create/update/delete; "inspect" is the most limited.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs developers to deploy resources only in a "Dev" compartment and have no access elsewhere. What is the recommended design?',
    options: opts4(
      'Add developers to the Administrators group',
      'Create a Developers group and a policy granting manage on the needed resource families scoped to compartment Dev',
      'Give each developer a tenancy-wide manage policy',
      'Disable IAM policies entirely'
    ),
    correct: ['b'],
    explanation: 'A dedicated group plus a compartment-scoped policy (manage only the needed families in Dev) enforces least privilege without granting broader tenancy access.',
    references: [REF_COMPART]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which capability lets an organization reuse its existing corporate identities (e.g. from an external IdP) to access OCI?',
    options: opts4(
      'Dynamic groups',
      'Identity federation',
      'Network security groups',
      'Service limits'
    ),
    correct: ['b'],
    explanation: 'Identity federation trusts an external identity provider so corporate users authenticate with existing credentials, mapped to OCI groups for authorization.',
    references: [REF_FEDERATION]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is enabling MFA for privileged OCI users considered a best practice?',
    options: opts4(
      'It increases compute performance',
      'It adds a second authentication factor, reducing the risk from compromised passwords',
      'It removes the need for IAM policies',
      'It encrypts block volumes'
    ),
    correct: ['b'],
    explanation: 'MFA requires an additional factor beyond the password, so even a compromised password cannot by itself grant access — especially important for privileged accounts.',
    references: [REF_MFA]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'In OCI, permissions are granted directly to individual users rather than to groups.',
    options: opts4('True', 'False', 'Only for federated users', 'Only in the root compartment'),
    correct: ['b'],
    explanation: 'False. OCI policies grant permissions to groups (or dynamic groups). Individual users gain access through group membership, not direct grants.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A policy is attached to compartment "Prod". Which resources does it govern?',
    options: opts4(
      'Resources in Prod and any compartments nested under Prod',
      'All resources in the entire tenancy including the parent',
      'Only resources in the tenancy root',
      'No resources, because policies cannot attach to compartments'
    ),
    correct: ['a'],
    explanation: 'A policy attached to a compartment applies to that compartment and its descendants. It does not extend up to the parent or unrelated compartments.',
    references: [REF_POLICY]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the main governance benefit of placing each environment (Dev, Test, Prod) in its own compartment?',
    options: opts4(
      'Faster network throughput between environments',
      'Isolation, environment-scoped access policies, and separate cost visibility per environment',
      'Automatic encryption of all data',
      'Elimination of the need for groups'
    ),
    correct: ['b'],
    explanation: 'Per-environment compartments isolate resources, allow least-privilege scoped policies, and give per-environment cost tracking — strong governance and security.',
    references: [REF_COMPART]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which IAM object is referenced by a policy statement to receive a set of permissions?',
    options: opts4(
      'A subnet',
      'A group or dynamic group',
      'A block volume',
      'A route table'
    ),
    correct: ['b'],
    explanation: 'Policy statements reference a group or dynamic group as the subject that is granted the specified verb and resource scope.',
    references: [REF_GROUPS]
  },
  {
    domain: IAM, difficulty: 2, type: QType.SINGLE,
    stem: 'An instance needs to write objects to an Object Storage bucket without stored credentials. Which two IAM constructs are combined to enable this?',
    options: opts4(
      'A security list and a route table',
      'A dynamic group (matching the instance) and a policy granting that dynamic group manage on object-family',
      'A NAT gateway and a service gateway',
      'A user password and an API key file'
    ),
    correct: ['b'],
    explanation: 'Instance principals: a dynamic group matches the instance, and a policy grants that dynamic group the required object-family permission — no credentials stored on the instance.',
    references: [REF_DYNGROUP]
  },
  {
    domain: IAM, difficulty: 1, type: QType.SINGLE,
    stem: 'What is the tenancy in relation to compartments?',
    options: opts4(
      'A leaf compartment with no children',
      'The root compartment that contains all other compartments and resources',
      'A networking gateway',
      'A storage bucket'
    ),
    correct: ['b'],
    explanation: 'The tenancy is the root compartment of the hierarchy; all other compartments and resources are created within it.',
    references: [REF_IAM]
  },

  // ── Networking (13) ──
  {
    domain: NET, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which networking object carves a contiguous range of a VCN\'s address space and is where instances\' VNICs are placed?',
    options: opts4(
      'A route table',
      'A subnet',
      'A security list',
      'A DRG'
    ),
    correct: ['b'],
    explanation: 'A subnet is a subdivision of a VCN\'s CIDR; compute VNICs are attached to subnets. Route tables and security lists are associated with subnets but are not the address range itself.',
    references: [REF_VCN]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which gateway provides bidirectional connectivity between public-subnet resources and the public internet?',
    options: opts4(
      'NAT gateway',
      'Internet gateway',
      'Service gateway',
      'Local peering gateway'
    ),
    correct: ['b'],
    explanation: 'An internet gateway enables inbound and outbound public internet traffic for resources with public IPs in a public subnet.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A private-subnet instance must perform outbound software updates but must never accept inbound internet connections. Which gateway is appropriate?',
    options: opts4(
      'Internet gateway',
      'NAT gateway',
      'Service gateway',
      'Local peering gateway'
    ),
    correct: ['b'],
    explanation: 'A NAT gateway permits outbound-initiated internet access for private instances while blocking unsolicited inbound connections.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'A service gateway keeps traffic between a VCN and supported Oracle services off the public internet.',
    options: opts4('True', 'False', 'Only for Object Storage', 'Only in single-AD regions'),
    correct: ['a'],
    explanation: 'True. A service gateway provides a private path from the VCN to supported Oracle services (like Object Storage), so the traffic does not traverse the public internet.',
    references: [REF_GATEWAYS]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A bank needs a private, dedicated, high-throughput link to OCI with predictable performance and no internet exposure. Which option is best?',
    options: opts4(
      'Site-to-Site VPN',
      'FastConnect',
      'Internet gateway',
      'Pre-authenticated request'
    ),
    correct: ['b'],
    explanation: 'FastConnect provides a private, dedicated connection with predictable bandwidth and latency and no public internet exposure — ideal for sensitive, high-throughput links.',
    references: [REF_FASTCONNECT]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which option provides encrypted connectivity between on-premises and OCI over the public internet at lower cost than a dedicated circuit?',
    options: opts4(
      'FastConnect',
      'Site-to-Site VPN (IPSec)',
      'Service gateway',
      'Local peering gateway'
    ),
    correct: ['b'],
    explanation: 'Site-to-Site VPN establishes encrypted IPSec tunnels over the internet to the VCN via a DRG — a cost-effective hybrid option compared with FastConnect.',
    references: [REF_VPN]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which virtual router is attached to a VCN to enable private routing to on-premises networks and other VCNs?',
    options: opts4(
      'Internet gateway',
      'Dynamic Routing Gateway (DRG)',
      'NAT gateway',
      'Load balancer'
    ),
    correct: ['b'],
    explanation: 'A DRG is the virtual router used for private connectivity from a VCN to on-premises (via VPN/FastConnect) and to other VCNs, including across regions.',
    references: [REF_DRG]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'You need different firewall rules for web servers and database servers that share one subnet. Which feature lets you apply distinct rule sets per server group?',
    options: opts4(
      'A single security list for the subnet',
      'Network Security Groups, with each group containing the relevant VNICs',
      'A route table',
      'A DHCP options set'
    ),
    correct: ['b'],
    explanation: 'NSGs let you place web VNICs and DB VNICs into separate groups with their own rules even though they share a subnet — security lists alone apply uniformly to the whole subnet.',
    references: [REF_NSG]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'At which scope does a security list apply its ingress and egress rules?',
    options: opts4(
      'Per VNIC',
      'To all VNICs within the associated subnet',
      'To the entire region',
      'To the whole tenancy'
    ),
    correct: ['b'],
    explanation: 'A security list is associated with a subnet and its rules apply to every VNIC in that subnet. NSGs, in contrast, apply at the VNIC level.',
    references: [REF_SECLIST]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service improves application availability by spreading client requests across a backend set and removing unhealthy backends?',
    options: opts4(
      'Service gateway',
      'Load Balancer',
      'DRG',
      'NAT gateway'
    ),
    correct: ['b'],
    explanation: 'The Load Balancer distributes requests across healthy backends using health checks, improving availability and enabling horizontal scaling.',
    references: [REF_LB]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about a private load balancer is correct?',
    options: opts4(
      'It is reachable from the public internet by default',
      'It has only a private IP and serves traffic within the VCN/private network',
      'It replaces the need for a DRG',
      'It can only be used with bare metal'
    ),
    correct: ['b'],
    explanation: 'A private load balancer is assigned only a private IP and balances traffic for clients within the VCN or connected private networks, not the public internet.',
    references: [REF_LB]
  },
  {
    domain: NET, difficulty: 1, type: QType.SINGLE,
    stem: 'What does a VCN route table control?',
    options: opts4(
      'Which IAM groups exist',
      'Where traffic leaving a subnet is sent (e.g. to an internet gateway, NAT gateway, DRG, or service gateway)',
      'Block volume performance levels',
      'Object storage tiers'
    ),
    correct: ['b'],
    explanation: 'A route table directs egress traffic from a subnet to the appropriate target gateway based on destination, controlling how the subnet reaches external networks.',
    references: [REF_VCN]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Two VCNs in different OCI regions must communicate privately. Which capability supports this?',
    options: opts4(
      'A local peering gateway only',
      'Remote VCN peering using DRGs (remote peering)',
      'An internet gateway in each VCN',
      'A NAT gateway in each VCN'
    ),
    correct: ['b'],
    explanation: 'Remote peering connects VCNs in different regions privately through DRGs. Local peering gateways are limited to VCNs in the same region.',
    references: [REF_DRG]
  },

  // ── Compute (10) ──
  {
    domain: COMPUTE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI Compute option runs on shared physical hardware managed by an Oracle hypervisor?',
    options: opts4(
      'Bare metal instance',
      'Virtual machine (VM) instance',
      'Dedicated physical host with no hypervisor',
      'On-premises server'
    ),
    correct: ['b'],
    explanation: 'VM instances run on shared physical hosts via the Oracle hypervisor (multi-tenant). Bare metal gives a dedicated single-tenant physical server with no hypervisor.',
    references: [REF_COMPUTE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which shape family lets you independently tune OCPU and memory to avoid paying for unused resources?',
    options: opts4(
      'Fixed shapes',
      'Flexible shapes',
      'GPU-only shapes',
      'HPC-only shapes'
    ),
    correct: ['b'],
    explanation: 'Flexible shapes allow independent selection of OCPU and memory within ranges, optimizing cost and matching the workload precisely.',
    references: [REF_SHAPES]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A DevOps team wants every new server to start from a hardened, pre-configured baseline. Which Compute feature delivers this?',
    options: opts4(
      'A custom image',
      'A NAT gateway',
      'A security list',
      'A pre-authenticated request'
    ),
    correct: ['a'],
    explanation: 'A custom image captures a configured, hardened instance so new instances launch from that consistent baseline.',
    references: [REF_IMAGES]
  },
  {
    domain: COMPUTE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI service lets developers run code without provisioning or managing servers, billed per execution?',
    options: opts4(
      'OCI Functions',
      'Bare metal instances',
      'Block Volume',
      'Instance pools'
    ),
    correct: ['a'],
    explanation: 'OCI Functions is a serverless platform: deploy a function and Oracle runs it on demand, billing per invocation and resources used, with no server management.',
    references: [REF_FUNCTIONS]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A batch workload runs nightly for two hours and is idle otherwise. Which approach minimizes cost while meeting the schedule?',
    options: opts4(
      'Keep a large bare metal server running 24/7',
      'Use an instance pool with schedule-based autoscaling to run instances only during the batch window',
      'Use Object Storage to run the batch job',
      'Disable IAM during the batch window'
    ),
    correct: ['b'],
    explanation: 'Schedule-based autoscaling on an instance pool brings capacity up for the nightly window and scales to zero/minimum afterward, minimizing cost for periodic workloads.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which managed OCI service provides a Kubernetes control plane so teams can run containerized microservices?',
    options: opts4(
      'OCI Functions',
      'Container Engine for Kubernetes (OKE)',
      'Block Volume',
      'Vault'
    ),
    correct: ['b'],
    explanation: 'OKE is OCI\'s managed Kubernetes; Oracle runs the control plane while the customer deploys containerized workloads on worker nodes.',
    references: [REF_OKE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the role of an instance pool in OCI Compute?',
    options: opts4(
      'It encrypts data at rest',
      'It provisions and manages a group of identical instances from an instance configuration as one unit',
      'It defines IAM policies',
      'It stores backups'
    ),
    correct: ['b'],
    explanation: 'An instance pool creates and manages a set of identical instances based on an instance configuration, enabling consistent scaling and lifecycle management.',
    references: [REF_AUTOSCALE]
  },
  {
    domain: COMPUTE, difficulty: 1, type: QType.SINGLE,
    stem: 'A bare metal instance gives the customer a dedicated physical server without an Oracle-managed hypervisor.',
    options: opts4('True', 'False', 'Only in Always Free', 'Only for Windows'),
    correct: ['a'],
    explanation: 'True. Bare metal provides an entire dedicated physical server with no Oracle hypervisor — useful for performance or licensing constraints. VMs are virtualized.',
    references: [REF_COMPUTE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why might you place instances of the same tier in different fault domains?',
    options: opts4(
      'To increase object storage durability',
      'To reduce the chance that a single hardware failure or AD-internal maintenance affects all instances simultaneously',
      'To avoid using IAM policies',
      'To bypass security lists'
    ),
    correct: ['b'],
    explanation: 'Spreading instances across the three fault domains lowers the risk that one hardware failure or maintenance event takes down the whole tier within an AD.',
    references: [REF_SHAPES]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best characterizes the serverless model offered by OCI Functions?',
    options: opts4(
      'Customers must patch and scale the underlying servers',
      'The platform automatically runs and scales the code on demand; you focus only on the function logic',
      'It requires a permanent bare metal reservation',
      'It cannot be triggered by events'
    ),
    correct: ['b'],
    explanation: 'With OCI Functions, the platform handles server provisioning, scaling, and availability; developers provide only the code, which runs on demand (often event-triggered).',
    references: [REF_FUNCTIONS]
  },

  // ── Storage (10) ──
  {
    domain: STORAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI storage service is used as the persistent virtual disk attached to a compute instance?',
    options: opts4(
      'Object Storage',
      'Block Volume',
      'Archive Storage',
      'File Storage'
    ),
    correct: ['b'],
    explanation: 'Block Volume provides persistent block-level disks (boot and data volumes) attached to instances, with a lifecycle independent of the instance.',
    references: [REF_BLOCK]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A data lake stores petabytes of unstructured files accessed via REST APIs. Which service is the best fit?',
    options: opts4(
      'Block Volume',
      'Object Storage',
      'File Storage',
      'Archive Storage for all active data'
    ),
    correct: ['b'],
    explanation: 'Object Storage scales to massive amounts of unstructured data accessed over REST/HTTP with high durability — well suited to data lakes and analytics.',
    references: [REF_OBJECT]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Several application servers need a common, concurrently mounted file system over NFS. Which OCI service provides it?',
    options: opts4(
      'Object Storage',
      'File Storage service',
      'Block Volume',
      'Archive Storage'
    ),
    correct: ['b'],
    explanation: 'The File Storage service is a managed shared NFS file system that multiple instances can mount concurrently for shared application data.',
    references: [REF_FSS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Object Storage tier minimizes storage cost for data accessed very rarely, accepting that objects must be restored before download?',
    options: opts4(
      'Standard tier',
      'Archive tier',
      'High-performance block tier',
      'File tier'
    ),
    correct: ['b'],
    explanation: 'The Archive tier offers the lowest storage cost for rarely accessed data; a restore step (with retrieval time) is required before objects can be downloaded.',
    references: [REF_ARCHIVE]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the difference between a block volume backup and a block volume clone?',
    options: opts4(
      'They are identical operations',
      'A backup is a point-in-time copy stored in Object Storage for restore; a clone is an immediately usable copy of the volume',
      'A clone deletes the source volume',
      'A backup attaches directly as a new boot volume instantly'
    ),
    correct: ['b'],
    explanation: 'Backups are point-in-time copies kept in Object Storage and used to restore/create volumes; clones create an immediately usable independent copy of the volume.',
    references: [REF_BACKUP]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants logs automatically moved to Archive after 90 days and deleted after 7 years to control cost. Which Object Storage feature should be configured?',
    options: opts4(
      'Pre-authenticated requests',
      'Object lifecycle policy rules (transition then delete)',
      'A NAT gateway',
      'A dynamic group'
    ),
    correct: ['b'],
    explanation: 'Object lifecycle management lets you define rules to transition objects to Archive and later delete them after defined ages, automating retention and cost control.',
    references: [REF_TIERS]
  },
  {
    domain: STORAGE, difficulty: 1, type: QType.SINGLE,
    stem: 'By default, OCI encrypts data at rest in Block Volume, Object Storage, and File Storage.',
    options: opts4('True', 'False', 'Only Object Storage is encrypted', 'Encryption is a paid add-on'),
    correct: ['a'],
    explanation: 'True. OCI encrypts data at rest by default across Block, Object, and File storage using Oracle-managed keys, with the option for customer-managed keys via Vault.',
    references: [REF_BLOCK]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A compliance requirement mandates that the customer fully controls the encryption keys protecting stored data. Which OCI service enables this?',
    options: opts4(
      'OCI Vault with customer-managed keys',
      'Cloud Guard',
      'Audit',
      'Notifications'
    ),
    correct: ['a'],
    explanation: 'OCI Vault lets customers create and manage their own encryption keys (optionally HSM-protected) and assign them to storage services instead of Oracle-managed keys.',
    references: [REF_VAULT]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A partner needs to upload a file to a bucket for 24 hours but should not be given IAM credentials. Which feature is appropriate?',
    options: opts4(
      'A pre-authenticated request (PAR) scoped to the bucket/object with an expiry',
      'Adding the partner to the Administrators group',
      'A service gateway',
      'A route rule'
    ),
    correct: ['a'],
    explanation: 'A PAR provides time-limited, credential-free access to a specific bucket or object, ideal for letting an external party upload/download without IAM credentials.',
    references: [REF_OBJECT]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which storage choice best supports a transactional database needing consistent low-latency block I/O with the ability to recover from a point in time?',
    options: opts4(
      'Object Storage Standard tier',
      'Block Volume with an appropriate performance level and scheduled backups',
      'Archive Storage',
      'A pre-authenticated request'
    ),
    correct: ['b'],
    explanation: 'Block Volume provides consistent low-latency block storage with selectable performance and supports scheduled backups/clones for point-in-time recovery — appropriate for databases.',
    references: [REF_BLOCK]
  },

  // ── Security and Observability (9) ──
  {
    domain: SECOBS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In the OCI shared responsibility model, which is always the customer\'s responsibility?',
    options: opts4(
      'Physical security of the data center',
      'Securing their data, IAM configuration, and network security rules',
      'Maintaining the hypervisor',
      'Replacing failed physical disks'
    ),
    correct: ['b'],
    explanation: 'Customers are responsible for security IN the cloud: their data, IAM policies, network configuration, and OS/application patching. Oracle handles the physical/virtualization layer.',
    references: [REF_SHARED]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI service provides centralized key and secret management, optionally backed by HSMs?',
    options: opts4(
      'OCI Vault',
      'Cloud Guard',
      'Monitoring',
      'Notifications'
    ),
    correct: ['a'],
    explanation: 'OCI Vault centrally manages encryption keys and secrets with optional HSM protection, enabling customer-managed encryption for OCI services.',
    references: [REF_VAULT]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which OCI service continuously assesses the tenancy for security misconfigurations and threats and can trigger automated responses?',
    options: opts4(
      'Cloud Guard',
      'Block Volume',
      'File Storage',
      'Service gateway'
    ),
    correct: ['a'],
    explanation: 'Cloud Guard uses detectors to find risky configurations/activities across the tenancy and responders to automatically remediate them.',
    references: [REF_CLOUDGUARD]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service should you consult to determine which user deleted a particular resource and when?',
    options: opts4(
      'Monitoring',
      'Audit',
      'Notifications',
      'Vault'
    ),
    correct: ['b'],
    explanation: 'The Audit service logs API/management operations including the actor, action, time, and target resource — the right place to investigate who deleted a resource.',
    references: [REF_AUDIT]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service collects metrics like CPU and memory and evaluates alarm conditions against them?',
    options: opts4(
      'Logging',
      'Monitoring',
      'Vault',
      'Bastion'
    ),
    correct: ['b'],
    explanation: 'The Monitoring service ingests metrics and evaluates alarms; when thresholds are breached it can notify via the Notifications service.',
    references: [REF_MONITORING]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service centralizes application, service, and audit logs for search and analysis?',
    options: opts4(
      'Logging',
      'Block Volume',
      'NAT gateway',
      'Object lifecycle policies'
    ),
    correct: ['a'],
    explanation: 'The Logging service provides a single place to ingest and analyze custom application logs, service logs, and audit logs across the tenancy.',
    references: [REF_LOGGING]
  },
  {
    domain: SECOBS, difficulty: 3, type: QType.SINGLE,
    stem: 'Administrators must reach private database hosts for maintenance, but security policy forbids public IPs and self-managed jump hosts. Which OCI service meets this need?',
    options: opts4(
      'Internet gateway',
      'OCI Bastion service',
      'NAT gateway',
      'Pre-authenticated request'
    ),
    correct: ['b'],
    explanation: 'OCI Bastion provides managed, time-limited, audited SSH access to private resources without public IPs or a self-managed bastion host.',
    references: [REF_BASTION]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OCI service protects internet-facing web applications by filtering malicious HTTP/S requests at the edge?',
    options: opts4(
      'Web Application Firewall (WAF)',
      'Block Volume',
      'Vault',
      'File Storage'
    ),
    correct: ['a'],
    explanation: 'OCI WAF inspects web traffic and applies protection rules (including OWASP rule sets) to block attacks like SQL injection and XSS before they reach the application.',
    references: [REF_WAF]
  },
  {
    domain: SECOBS, difficulty: 2, type: QType.SINGLE,
    stem: 'Delivering alarm notifications to email or PagerDuty subscriptions is a function of the OCI Notifications service.',
    options: opts4('True', 'False', 'Only the Audit service can notify', 'Only Cloud Guard can notify'),
    correct: ['a'],
    explanation: 'True. The Notifications service publishes messages to subscriptions (email, HTTPS, PagerDuty, Functions) and is commonly the delivery target for Monitoring alarms.',
    references: [REF_NOTIF]
  }
];

const OCI_FOUNDATIONS_DOMAINS = [
  { name: INTRO, weight: 15 },
  { name: IAM, weight: 20 },
  { name: NET, weight: 20 },
  { name: COMPUTE, weight: 15 },
  { name: STORAGE, weight: 15 },
  { name: SECOBS, weight: 15 }
];

const OCI_FOUNDATIONS_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'oracle-oci-foundations-1z0-1085-p1',
    code: '1Z0-1085-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 60-minute, 65-question, blueprint-weighted set covering OCI introduction, identity & access management, networking, compute, storage, and security & observability.',
    questions: P1
  },
  {
    slug: 'oracle-oci-foundations-1z0-1085-p2',
    code: '1Z0-1085-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'oracle-oci-foundations-1z0-1085-p3',
    code: '1Z0-1085-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const OCI_FOUNDATIONS_BUNDLE = {
  slug: 'oracle-oci-foundations',
  title: 'Oracle Cloud Infrastructure Foundations Associate (1Z0-1085)',
  description: 'All 3 OCI Foundations Associate (1Z0-1085) practice exams in one bundle — covering OCI introduction, identity & access management, networking, compute, storage, and security & observability, aligned to the official Oracle 1Z0-1085 exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 12500 // USD 125 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the OCI Foundations bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:oci-foundations-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedOciFoundations(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'oracle' } });
  await db.vendor.upsert({
    where: { slug: 'oracle' },
    update: { name: 'Oracle', description: 'Oracle Cloud Infrastructure, database, and AI certifications.' },
    create: { slug: 'oracle', name: 'Oracle', description: 'Oracle Cloud Infrastructure, database, and AI certifications.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'oracle' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of OCI_FOUNDATIONS_EXAMS) {
    const title = `Oracle Cloud Infrastructure Foundations Associate (1Z0-1085) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Oracle 1Z0-1085 exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 60,
      passingScore: 65,
      questionCount: e.questions.length,
      domains: OCI_FOUNDATIONS_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:oci-foundations-seed' } });
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
          generatedBy: 'manual:oci-foundations-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: OCI_FOUNDATIONS_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: OCI_FOUNDATIONS_BUNDLE.slug },
    update: {
      title: OCI_FOUNDATIONS_BUNDLE.title,
      description: OCI_FOUNDATIONS_BUNDLE.description,
      price: OCI_FOUNDATIONS_BUNDLE.price,
      priceVoucher: OCI_FOUNDATIONS_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: OCI_FOUNDATIONS_BUNDLE.slug,
      title: OCI_FOUNDATIONS_BUNDLE.title,
      description: OCI_FOUNDATIONS_BUNDLE.description,
      price: OCI_FOUNDATIONS_BUNDLE.price,
      priceVoucher: OCI_FOUNDATIONS_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'oracle-oci-foundations-1z0-1085-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'oracle-oci-foundations-1z0-1085-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'oracle-oci-foundations-1z0-1085-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'oracle-oci-foundations-1z0-1085-p1', tier: 'VOUCHER' as const, position: 4 }
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
