/**
 * AZ-104 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:az104-seed'` and upserts catalog rows.
 *
 * Exported as `seedAz104(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/az104.ts`) and the protected
 * admin API (`/api/admin/seed-az104`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Microsoft Azure Administrator (AZ-104) study guide:
 *   - Manage Azure identities and governance       — 22% (14/variant)
 *   - Implement and manage storage                 — 18% (12/variant)
 *   - Deploy and manage Azure compute resources    — 23% (15/variant)
 *   - Implement and manage virtual networking      — 22% (14/variant)
 *   - Monitor and maintain Azure resources         — 15% (10/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual AZ-104 questions.
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

const IDENTITY = 'Manage Azure identities and governance';
const STORAGE = 'Implement and manage storage';
const COMPUTE = 'Deploy and manage Azure compute resources';
const NETWORK = 'Implement and manage virtual networking';
const MONITOR = 'Monitor and maintain Azure resources';

// ── Identity & governance references ──
const REF_AAD = { label: 'Microsoft Learn — What is Microsoft Entra ID?', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/whatis' };
const REF_USERS = { label: 'Microsoft Learn — How to add or delete users in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/how-to-create-delete-users' };
const REF_GROUPS = { label: 'Microsoft Learn — Manage groups in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-groups' };
const REF_DYNGROUP = { label: 'Microsoft Learn — Dynamic membership rules for groups', url: 'https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership' };
const REF_GUESTS = { label: 'Microsoft Learn — B2B collaboration overview', url: 'https://learn.microsoft.com/en-us/entra/external-id/what-is-b2b' };
const REF_SSPR = { label: 'Microsoft Learn — Self-service password reset', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sspr-howitworks' };
const REF_MFA = { label: 'Microsoft Learn — Microsoft Entra multifactor authentication', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks' };
const REF_CA = { label: 'Microsoft Learn — Conditional Access overview', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview' };
const REF_RBAC = { label: 'Microsoft Learn — What is Azure RBAC?', url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/overview' };
const REF_RBAC_ROLES = { label: 'Microsoft Learn — Azure built-in roles', url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles' };
const REF_RBAC_CUSTOM = { label: 'Microsoft Learn — Azure custom roles', url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles' };
const REF_MGMTGROUP = { label: 'Microsoft Learn — Organize your resources with management groups', url: 'https://learn.microsoft.com/en-us/azure/governance/management-groups/overview' };
const REF_SUBS = { label: 'Microsoft Learn — Azure subscriptions', url: 'https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription' };
const REF_POLICY = { label: 'Microsoft Learn — What is Azure Policy?', url: 'https://learn.microsoft.com/en-us/azure/governance/policy/overview' };
const REF_POLICY_INIT = { label: 'Microsoft Learn — Azure Policy initiative definitions', url: 'https://learn.microsoft.com/en-us/azure/governance/policy/concepts/initiative-definition-structure' };
const REF_POLICY_EFFECTS = { label: 'Microsoft Learn — Understand Azure Policy effects', url: 'https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics' };
const REF_LOCKS = { label: 'Microsoft Learn — Lock resources to prevent unexpected changes', url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources' };
const REF_TAGS = { label: 'Microsoft Learn — Use tags to organize your Azure resources', url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources' };

// ── Storage references ──
const REF_STG_ACC = { label: 'Microsoft Learn — Storage account overview', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview' };
const REF_STG_REDUND = { label: 'Microsoft Learn — Azure Storage redundancy', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy' };
const REF_STG_KIND = { label: 'Microsoft Learn — Types of storage accounts', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview#types-of-storage-accounts' };
const REF_BLOB = { label: 'Microsoft Learn — Introduction to Azure Blob Storage', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction' };
const REF_BLOB_TIERS = { label: 'Microsoft Learn — Access tiers for blob data', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview' };
const REF_BLOB_LIFECYCLE = { label: 'Microsoft Learn — Optimize costs with lifecycle management', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/lifecycle-management-overview' };
const REF_BLOB_VERSION = { label: 'Microsoft Learn — Blob versioning', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/versioning-overview' };
const REF_BLOB_SOFTDEL = { label: 'Microsoft Learn — Soft delete for blobs', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/soft-delete-blob-overview' };
const REF_FILES = { label: 'Microsoft Learn — What is Azure Files?', url: 'https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction' };
const REF_FILES_SYNC = { label: 'Microsoft Learn — Planning for an Azure File Sync deployment', url: 'https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning' };
const REF_SAS = { label: 'Microsoft Learn — Grant limited access with shared access signatures', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview' };
const REF_STG_KEYS = { label: 'Microsoft Learn — Manage storage account access keys', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage' };
const REF_STG_FW = { label: 'Microsoft Learn — Configure Azure Storage firewalls and virtual networks', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security' };
const REF_PRIVATE_EP = { label: 'Microsoft Learn — Use private endpoints for Azure Storage', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints' };
const REF_AZCOPY = { label: 'Microsoft Learn — Get started with AzCopy', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10' };
const REF_IMPORT_EXPORT = { label: 'Microsoft Learn — What is Azure Import/Export service?', url: 'https://learn.microsoft.com/en-us/azure/import-export/storage-import-export-service' };
const REF_STG_BROWSER = { label: 'Microsoft Learn — Storage Explorer overview', url: 'https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer' };

// ── Compute references ──
const REF_VM = { label: 'Microsoft Learn — Virtual machines in Azure', url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/overview' };
const REF_VM_SIZE = { label: 'Microsoft Learn — Sizes for virtual machines in Azure', url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/sizes' };
const REF_VM_DISK = { label: 'Microsoft Learn — Azure managed disks overview', url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview' };
const REF_VM_AVSET = { label: 'Microsoft Learn — Availability sets overview', url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/availability-set-overview' };
const REF_VM_AZ = { label: 'Microsoft Learn — Availability zones', url: 'https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview' };
const REF_VMSS = { label: 'Microsoft Learn — Virtual Machine Scale Sets overview', url: 'https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview' };
const REF_VMSS_AUTO = { label: 'Microsoft Learn — Autoscale a VM scale set', url: 'https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-autoscale-overview' };
const REF_VM_EXT = { label: 'Microsoft Learn — Virtual machine extensions and features', url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/overview' };
const REF_VM_BACKUP = { label: 'Microsoft Learn — Azure VM backup overview', url: 'https://learn.microsoft.com/en-us/azure/backup/backup-azure-vms-introduction' };
const REF_ASR = { label: 'Microsoft Learn — About Azure Site Recovery', url: 'https://learn.microsoft.com/en-us/azure/site-recovery/site-recovery-overview' };
const REF_ARM = { label: 'Microsoft Learn — What is Azure Resource Manager?', url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview' };
const REF_ARM_TEMPLATE = { label: 'Microsoft Learn — ARM template overview', url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/overview' };
const REF_BICEP = { label: 'Microsoft Learn — What is Bicep?', url: 'https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview' };
const REF_ACR = { label: 'Microsoft Learn — Azure Container Registry introduction', url: 'https://learn.microsoft.com/en-us/azure/container-registry/container-registry-intro' };
const REF_ACI = { label: 'Microsoft Learn — Azure Container Instances overview', url: 'https://learn.microsoft.com/en-us/azure/container-instances/container-instances-overview' };
const REF_AKS = { label: 'Microsoft Learn — Azure Kubernetes Service overview', url: 'https://learn.microsoft.com/en-us/azure/aks/what-is-aks' };
const REF_APPSVC = { label: 'Microsoft Learn — Azure App Service overview', url: 'https://learn.microsoft.com/en-us/azure/app-service/overview' };
const REF_APPSVC_PLAN = { label: 'Microsoft Learn — Azure App Service plan overview', url: 'https://learn.microsoft.com/en-us/azure/app-service/overview-hosting-plans' };

// ── Networking references ──
const REF_VNET = { label: 'Microsoft Learn — What is Azure Virtual Network?', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview' };
const REF_SUBNET = { label: 'Microsoft Learn — Add, change, or delete a virtual network subnet', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-manage-subnet' };
const REF_NSG = { label: 'Microsoft Learn — Network security groups', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview' };
const REF_ASG = { label: 'Microsoft Learn — Application security groups', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/application-security-groups' };
const REF_PEERING = { label: 'Microsoft Learn — Virtual network peering', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview' };
const REF_VPN = { label: 'Microsoft Learn — What is VPN Gateway?', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways' };
const REF_EXPRESSROUTE = { label: 'Microsoft Learn — What is Azure ExpressRoute?', url: 'https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction' };
const REF_DNS = { label: 'Microsoft Learn — What is Azure DNS?', url: 'https://learn.microsoft.com/en-us/azure/dns/dns-overview' };
const REF_PRIVATE_DNS = { label: 'Microsoft Learn — What is Azure Private DNS?', url: 'https://learn.microsoft.com/en-us/azure/dns/private-dns-overview' };
const REF_LB = { label: 'Microsoft Learn — What is Azure Load Balancer?', url: 'https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview' };
const REF_APPGW = { label: 'Microsoft Learn — What is Azure Application Gateway?', url: 'https://learn.microsoft.com/en-us/azure/application-gateway/overview' };
const REF_FRONTDOOR = { label: 'Microsoft Learn — What is Azure Front Door?', url: 'https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview' };
const REF_ROUTE = { label: 'Microsoft Learn — Virtual network traffic routing', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview' };
const REF_BASTION = { label: 'Microsoft Learn — What is Azure Bastion?', url: 'https://learn.microsoft.com/en-us/azure/bastion/bastion-overview' };
const REF_PUBLIC_IP = { label: 'Microsoft Learn — Public IP addresses', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-addresses' };
const REF_NAT = { label: 'Microsoft Learn — What is Virtual Network NAT?', url: 'https://learn.microsoft.com/en-us/azure/nat-gateway/nat-overview' };

// ── Monitor references ──
const REF_MONITOR = { label: 'Microsoft Learn — Azure Monitor overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/overview' };
const REF_METRICS = { label: 'Microsoft Learn — Azure Monitor Metrics overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-platform-metrics' };
const REF_LOGS = { label: 'Microsoft Learn — Azure Monitor Logs overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-platform-logs' };
const REF_LAW = { label: 'Microsoft Learn — Log Analytics workspace overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview' };
const REF_ALERTS = { label: 'Microsoft Learn — Overview of Azure Monitor alerts', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-overview' };
const REF_ACTION_GROUPS = { label: 'Microsoft Learn — Action groups', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/action-groups' };
const REF_DIAG = { label: 'Microsoft Learn — Diagnostic settings in Azure Monitor', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/diagnostic-settings' };
const REF_NW_WATCH = { label: 'Microsoft Learn — What is Azure Network Watcher?', url: 'https://learn.microsoft.com/en-us/azure/network-watcher/network-watcher-overview' };
const REF_BACKUP_VAULT = { label: 'Microsoft Learn — Overview of Azure Backup', url: 'https://learn.microsoft.com/en-us/azure/backup/backup-overview' };
const REF_RECOVERY_SVC = { label: 'Microsoft Learn — Recovery Services vault overview', url: 'https://learn.microsoft.com/en-us/azure/backup/backup-azure-recovery-services-vault-overview' };
const REF_RESOURCE_HEALTH = { label: 'Microsoft Learn — Resource Health overview', url: 'https://learn.microsoft.com/en-us/azure/service-health/resource-health-overview' };
const REF_SVC_HEALTH = { label: 'Microsoft Learn — Azure Service Health overview', url: 'https://learn.microsoft.com/en-us/azure/service-health/overview' };
const REF_UPDATE_MGR = { label: 'Microsoft Learn — Azure Update Manager overview', url: 'https://learn.microsoft.com/en-us/azure/update-manager/overview' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Identity & governance (14) ──
  {
    domain: IDENTITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to create a new cloud-only user in Microsoft Entra ID who can sign in to the Azure portal with the UPN ada@contoso.onmicrosoft.com. Which portal blade should you use?',
    options: opts4(
      'Microsoft Entra ID > Users > New user > Create new user',
      'Subscriptions > Access control (IAM) > Add role assignment',
      'Azure Active Directory B2C > Identity providers',
      'Resource groups > Add > Identity'
    ),
    correct: ['a'],
    explanation: 'Cloud-only Entra ID users are created from Microsoft Entra ID > Users > New user > Create new user. Access control (IAM) only assigns RBAC to existing identities; B2C is for external consumer identities; resource groups cannot create users.',
    references: [REF_AAD, REF_USERS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want the membership of a security group to automatically include every user whose department attribute equals "Finance". Which group configuration is required?',
    options: opts4(
      'Assigned membership with the department filter',
      'Dynamic user membership with rule (user.department -eq "Finance")',
      'Mail-enabled distribution group',
      'Microsoft 365 group with a department label'
    ),
    correct: ['b'],
    explanation: 'Dynamic membership uses an attribute-based rule to automatically add or remove members. Assigned groups require manual changes; mail-enabled DLs and M365 group labels do not auto-evaluate the department property for security access.',
    references: [REF_GROUPS, REF_DYNGROUP]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A partner organization needs to access a SharePoint site in your tenant without you provisioning a full account for each partner user. Which feature should you use?',
    options: opts4(
      'Microsoft Entra B2B guest invitations',
      'Pass-through authentication',
      'Azure AD Domain Services',
      'Service principal credentials'
    ),
    correct: ['a'],
    explanation: 'B2B collaboration lets you invite external users as guests; they sign in with their own identity and you assign access to resources in your tenant. Pass-through auth is for on-prem AD password validation; Azure AD DS provides managed domain services; service principals are for apps.',
    references: [REF_GUESTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure RBAC role grants full management of an Azure resource, including the ability to assign roles to others?',
    options: opts4(
      'Contributor',
      'Reader',
      'Owner',
      'User Access Administrator'
    ),
    correct: ['c'],
    explanation: 'Owner grants full access to manage all resources, including assigning roles. Contributor can manage resources but cannot grant access. Reader is read-only. User Access Administrator can manage user access but not the resources themselves.',
    references: [REF_RBAC, REF_RBAC_ROLES]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure RBAC scope inheritance.',
    options: opts4(
      'A role assignment at the management-group scope is inherited by all child subscriptions, resource groups, and resources.',
      'Role assignments at a child scope override and remove inherited permissions from the parent.',
      'A resource group-scoped role applies to every resource in that resource group.',
      'Permissions from multiple inherited assignments are additive (union of allow rules).'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'RBAC is additive and inherits downward from management group > subscription > resource group > resource. Child assignments grant additional rights but do not remove inherited rights (deny assignments are a separate, restricted mechanism).',
    references: [REF_RBAC, REF_MGMTGROUP]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to enforce that all new virtual machines in a subscription are deployed only in the eastus and westus regions. Which Azure governance feature should you use?',
    options: opts4(
      'A resource lock of type CanNotDelete on the subscription',
      'An Azure Policy with the "Allowed locations" built-in definition assigned at the subscription scope',
      'A Conditional Access policy filtered by IP',
      'A management group permission boundary'
    ),
    correct: ['b'],
    explanation: 'Azure Policy with the "Allowed locations" definition uses the deny effect to block resource creation in disallowed regions. Resource locks prevent delete/modify, not placement. Conditional Access governs user sign-ins. Management groups organize subscriptions but do not enforce location.',
    references: [REF_POLICY, REF_POLICY_EFFECTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which resource lock type allows reads and updates but prevents deletion?',
    options: opts4(
      'ReadOnly',
      'CanNotDelete',
      'NoDelete',
      'Restricted'
    ),
    correct: ['b'],
    explanation: 'CanNotDelete permits authorized users to read and modify a resource but blocks deletion. ReadOnly blocks both delete and modify. NoDelete and Restricted are not valid Azure lock levels.',
    references: [REF_LOCKS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You must apply the tag costCenter=1001 to every resource in a resource group and ensure new resources inherit it. Which approach is best?',
    options: opts4(
      'Manually tag each resource',
      'Use an Azure Policy with the "Inherit a tag from the resource group if missing" modify effect',
      'Apply a CanNotDelete lock',
      'Create a custom RBAC role that includes tag values'
    ),
    correct: ['b'],
    explanation: 'Azure Policy includes built-in "Inherit a tag" definitions using the modify effect to add or update tags. RBAC roles do not set tag values, locks do not tag, and manual tagging does not scale or self-heal.',
    references: [REF_TAGS, REF_POLICY_EFFECTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports being prompted for a second factor on every sign-in. Which Entra ID feature is most likely causing this and is the correct place to refine the requirement?',
    options: opts4(
      'Self-service password reset',
      'Conditional Access policies with MFA grant control',
      'Azure RBAC built-in roles',
      'Resource locks'
    ),
    correct: ['b'],
    explanation: 'Conditional Access policies evaluate sign-in conditions and can require MFA. Refining the conditions (trusted locations, sign-in risk, device compliance) reduces unnecessary prompts. SSPR is for password recovery; RBAC and locks are unrelated to authentication.',
    references: [REF_CA, REF_MFA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a custom RBAC role that lets a team start and restart VMs but not delete them. Which property of the role definition lists the allowed operations?',
    options: opts4(
      'NotActions',
      'AssignableScopes',
      'Actions',
      'DataActions'
    ),
    correct: ['c'],
    explanation: 'The Actions array enumerates allowed control-plane operations (e.g., Microsoft.Compute/virtualMachines/start/action). NotActions subtracts from Actions, AssignableScopes lists where the role can be assigned, and DataActions covers data-plane operations.',
    references: [REF_RBAC_CUSTOM]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A subscription is moved under a new management group that has a Policy assignment with the deny effect for public IPs. Which statement is correct?',
    options: opts4(
      'Existing public IPs in the subscription are deleted automatically.',
      'New deployments that violate the policy are blocked, while existing non-compliant resources are reported as non-compliant.',
      'The policy has no effect until reassigned at the subscription scope.',
      'Only resource groups created after the move are evaluated.'
    ),
    correct: ['b'],
    explanation: 'Inherited deny policies block new non-compliant deployments; existing resources are not deleted but show as non-compliant in the Policy compliance view. Inheritance is automatic from management group through child subscriptions.',
    references: [REF_POLICY, REF_POLICY_EFFECTS, REF_MGMTGROUP]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'An Azure Policy initiative is a collection of policy definitions grouped together to achieve a single overall compliance goal.',
    options: opts4('True', 'False', 'Only for tagging policies', 'Only for management groups'),
    correct: ['a'],
    explanation: 'True. An initiative (policy set) groups multiple policy definitions so they can be assigned and tracked as a unit — for example, the Azure Security Benchmark initiative bundles dozens of definitions.',
    references: [REF_POLICY_INIT]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A user must be able to assign Reader access to a resource group but should not be able to delete or modify resources in it. Which role assignment is most appropriate?',
    options: opts4(
      'Owner on the resource group',
      'Contributor on the resource group',
      'User Access Administrator on the resource group',
      'Reader on the resource group'
    ),
    correct: ['c'],
    explanation: 'User Access Administrator grants the ability to manage user access (role assignments) without granting permissions on the resources themselves. Owner gives full control; Contributor cannot manage access; Reader cannot assign roles.',
    references: [REF_RBAC_ROLES]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want users to register their own authentication methods (phone, Authenticator app) without contacting IT to unlock their accounts after a password forget. Which feature should you enable?',
    options: opts4(
      'Conditional Access',
      'Self-service password reset (SSPR)',
      'Azure AD Connect',
      'Privileged Identity Management'
    ),
    correct: ['b'],
    explanation: 'SSPR lets users reset their own passwords after verifying their identity with registered methods, eliminating helpdesk tickets. CA enforces policies, AD Connect syncs from on-prem AD, and PIM is for privileged-role activation.',
    references: [REF_SSPR]
  },

  // ── Storage (12) ──
  {
    domain: STORAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which storage redundancy option synchronously replicates data three times across availability zones in a single Azure region?',
    options: opts4(
      'Locally redundant storage (LRS)',
      'Zone-redundant storage (ZRS)',
      'Geo-redundant storage (GRS)',
      'Geo-zone-redundant storage (GZRS)'
    ),
    correct: ['b'],
    explanation: 'ZRS synchronously replicates three copies across three availability zones in the primary region. LRS uses three replicas within a single datacenter; GRS adds an async secondary region copy of LRS; GZRS combines ZRS in primary plus async LRS in secondary.',
    references: [REF_STG_REDUND]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to give a partner application read access to a single blob for 48 hours without sharing the storage account key. Which mechanism is most appropriate?',
    options: opts4(
      'Storage account access key',
      'A user-delegation SAS with read permission and 48-hour expiry',
      'Anonymous public read access on the container',
      'A Microsoft Entra service principal with Storage Account Contributor'
    ),
    correct: ['b'],
    explanation: 'A SAS (preferably user-delegation, signed with Entra credentials) gives time- and scope-limited access. Sharing the account key gives full control. Public read exposes the data to everyone. Storage Account Contributor grants management-plane rights, not scoped blob read.',
    references: [REF_SAS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A storage account contains rarely accessed audit logs. Which blob access tier minimizes storage cost for data accessed less than once a year?',
    options: opts4(
      'Hot',
      'Cool',
      'Cold',
      'Archive'
    ),
    correct: ['d'],
    explanation: 'Archive is the lowest-cost tier and is intended for data rarely (or never) accessed, with rehydration latency of hours. Hot is for frequent access, Cool for at-least-30-day storage with occasional access, Cold for at-least-90-day storage with rarer access.',
    references: [REF_BLOB_TIERS]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You configure a blob lifecycle management policy to move blobs from Hot to Cool after 30 days of no modification and to Archive after 180 days. Which evaluation cadence does the platform use?',
    options: opts4(
      'Real-time on each write',
      'Every minute',
      'Once per day at the storage-account level',
      'Only when manually invoked'
    ),
    correct: ['c'],
    explanation: 'Lifecycle management policies run at most once per day on each storage account; that is why rules are based on age in days, not minutes. The cadence is documented and not user-configurable.',
    references: [REF_BLOB_LIFECYCLE]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature lets you recover blobs that were deleted in the last 14 days without restoring from backup?',
    options: opts4(
      'Soft delete for blobs',
      'Cool tier rehydrate',
      'Storage account replication',
      'Storage Explorer undo'
    ),
    correct: ['a'],
    explanation: 'Soft delete retains deleted blobs for a configurable retention period (default 7, up to 365 days) so they can be undeleted in place. Rehydrate changes a tier, replication is for redundancy, and Storage Explorer has no built-in undo.',
    references: [REF_BLOB_SOFTDEL]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to extend an on-prem Windows file share into Azure Files while keeping a local cache for fast access at the branch office. Which solution should you deploy?',
    options: opts4(
      'Azure File Sync with a server endpoint on the Windows Server',
      'AzCopy nightly upload',
      'Storage Explorer mounts',
      'Azure Import/Export'
    ),
    correct: ['a'],
    explanation: 'Azure File Sync turns Windows Server into a fast cache of an Azure file share with cloud tiering for cold files. AzCopy is a one-way transfer tool, Storage Explorer is a desktop GUI, Import/Export ships physical disks.',
    references: [REF_FILES_SYNC]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL services natively supported by an Azure Standard general-purpose v2 storage account.',
    options: opts4(
      'Blob storage',
      'File shares (SMB / NFS)',
      'Queue storage',
      'Azure SQL Database'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'General-purpose v2 accounts host blobs, files, queues, and tables in one account. Azure SQL Database is a separate PaaS service and is not a storage account service.',
    references: [REF_STG_ACC, REF_STG_KIND]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A security review requires that no internet client can reach your storage account by default, but a specific VNet subnet must still be able to. Which configuration achieves this?',
    options: opts4(
      'Enable the firewall with "Allow access from selected virtual networks", and add the subnet via a service endpoint or private endpoint',
      'Rotate the storage account keys daily',
      'Set the storage account to Cool tier',
      'Disable HTTPS and allow only HTTP'
    ),
    correct: ['a'],
    explanation: 'Storage firewalls deny by default when configured; you then permit specific VNets/subnets via service endpoints or private endpoints. Key rotation, tiering and disabling HTTPS do not restrict network reachability.',
    references: [REF_STG_FW, REF_PRIVATE_EP]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to copy a 500 GB folder from an on-prem file server to Azure Blob Storage as efficiently as possible. Which tool is best suited?',
    options: opts4(
      'azcopy with the appropriate SAS or Entra credential',
      'Drag and drop in the Azure portal',
      'Cloud Shell tar',
      'Storage Account Keys Manage CLI'
    ),
    correct: ['a'],
    explanation: 'AzCopy is the high-throughput, multi-threaded data transfer tool optimized for large amounts of blob/file data. Portal upload is not suitable for hundreds of gigabytes; Cloud Shell tar is unrelated; the keys-manage CLI rotates keys.',
    references: [REF_AZCOPY]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A storage account access key was leaked. Which remediation invalidates the compromised key immediately?',
    options: opts4(
      'Rotate (regenerate) the affected key (key1 or key2) in the storage account',
      'Delete the storage account',
      'Set the storage account to read-only',
      'Disable Geo replication'
    ),
    correct: ['a'],
    explanation: 'Regenerating the affected key immediately invalidates it. You typically keep two keys so apps can be migrated to the unrotated one before regenerating the compromised key. Deleting the account is destructive; read-only/replication settings do not invalidate keys.',
    references: [REF_STG_KEYS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature retains and protects every change to a blob by automatically maintaining previous versions when a write or delete occurs?',
    options: opts4(
      'Blob versioning',
      'Soft delete for containers',
      'Static website hosting',
      'Object replication'
    ),
    correct: ['a'],
    explanation: 'Blob versioning automatically creates an immutable previous version on every write/delete so you can restore any prior state. Soft delete recovers deleted items; static websites serve content; object replication copies blobs across accounts.',
    references: [REF_BLOB_VERSION]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to ship 80 TB into Azure Blob Storage from an air-gapped datacenter with no fast WAN. Which option is purpose-built for this?',
    options: opts4(
      'Azure Import/Export with customer-supplied disks (or Azure Data Box)',
      'AzCopy over a 10 Mbps public internet link',
      'Azure Files SMB upload',
      'Storage Explorer drag and drop'
    ),
    correct: ['a'],
    explanation: 'For multi-TB offline transfer, Azure Import/Export (or Azure Data Box) ships physical media. Online tools (AzCopy, Storage Explorer, Files SMB) require sufficient bandwidth, which a 10 Mbps link cannot deliver in reasonable time.',
    references: [REF_IMPORT_EXPORT]
  },

  // ── Compute (15) ──
  {
    domain: COMPUTE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure VM SLA is provided when two or more VMs are deployed across availability zones in the same region?',
    options: opts4(
      '99.9% single instance',
      '99.95% with availability set',
      '99.99% across availability zones',
      '100% always'
    ),
    correct: ['c'],
    explanation: 'Two or more VMs across Availability Zones in the same region deliver a 99.99% connectivity SLA. Single Premium SSD VMs are 99.9%; availability sets give 99.95%; no Azure SLA is 100%.',
    references: [REF_VM_AZ]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which managed disk type provides the highest IOPS and lowest latency for an I/O-intensive transactional workload?',
    options: opts4(
      'Standard HDD',
      'Standard SSD',
      'Premium SSD v2 (or Ultra Disk)',
      'Archive Disk'
    ),
    correct: ['c'],
    explanation: 'Premium SSD v2 and Ultra Disks deliver the highest sustained IOPS and lowest latency for I/O-intensive workloads (databases, SAP HANA). Standard HDD/SSD are lower-tier; "Archive Disk" is not a managed disk SKU.',
    references: [REF_VM_DISK]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to deploy 10 identical front-end VMs that can scale out to 50 based on CPU load and scale back in during quiet periods. Which Azure compute construct is purpose-built for this?',
    options: opts4(
      'A Virtual Machine Scale Set with autoscale rules',
      'An availability set with manual scaling',
      'Azure Functions Consumption plan',
      'Azure Batch pool'
    ),
    correct: ['a'],
    explanation: 'VM Scale Sets manage a pool of identical VMs with autoscale rules. Availability sets do not autoscale; Functions is serverless code, not generic VMs; Batch is for HPC job scheduling.',
    references: [REF_VMSS, REF_VMSS_AUTO]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure feature installs an agent into a VM after deployment to perform actions such as configuring antivirus, joining a domain, or running custom scripts?',
    options: opts4(
      'VM extensions (e.g., Custom Script Extension, DSC)',
      'Boot diagnostics',
      'Update Manager',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'VM extensions are small management agents (CustomScriptExtension, DSC, MDE/AV, MSAV) that run post-deployment customizations. Boot diagnostics streams console output, Update Manager patches OS, Bastion provides RDP/SSH access.',
    references: [REF_VM_EXT]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure availability sets.',
    options: opts4(
      'They distribute VMs across fault domains (separate racks/power) and update domains (rolling maintenance).',
      'They span multiple Azure regions for disaster recovery.',
      'VMs in an availability set get a 99.95% connectivity SLA when at least two are deployed.',
      'A single VM can be added to an availability set after deployment.'
    ),
    correct: ['a', 'c'],
    explanation: 'Availability sets group VMs into FDs and UDs within a single datacenter/region for higher availability (99.95% with two or more VMs). They do not span regions, and an availability set must be specified at VM creation time — you cannot add an existing VM later.',
    references: [REF_VM_AVSET]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service backs up Azure VMs to a Recovery Services vault with application-consistent snapshots?',
    options: opts4(
      'Azure Backup (VM backup)',
      'Azure Site Recovery (ASR)',
      'Storage account snapshots',
      'Azure Migrate'
    ),
    correct: ['a'],
    explanation: 'Azure Backup performs scheduled, application-consistent VM backups to a Recovery Services vault. ASR replicates VMs for DR/failover. Storage snapshots are raw disk snapshots without VSS. Azure Migrate assesses on-prem servers for migration.',
    references: [REF_VM_BACKUP, REF_RECOVERY_SVC]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to replicate Azure VMs from East US to West US so that you can fail them over during a regional outage. Which service should you use?',
    options: opts4(
      'Azure Backup',
      'Azure Site Recovery',
      'Azure Migrate',
      'Storage account GRS'
    ),
    correct: ['b'],
    explanation: 'Azure Site Recovery replicates VMs to a secondary region and orchestrates failover/failback for DR. Backup restores from snapshots (recovery, not failover). Migrate is for one-way migrations. GRS replicates blobs, not VMs.',
    references: [REF_ASR]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Resource Manager artifact is the declarative JSON file used to deploy infrastructure as code?',
    options: opts4(
      'ARM template',
      'Azure Policy initiative',
      'RBAC role definition',
      'Cosmos DB throughput definition'
    ),
    correct: ['a'],
    explanation: 'ARM templates are JSON files describing the resources to deploy and their properties; Bicep is a higher-level DSL that compiles to ARM JSON. Policies, RBAC roles and Cosmos throughput are different artifacts.',
    references: [REF_ARM, REF_ARM_TEMPLATE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a cleaner, more concise DSL than ARM JSON for declarative deployments, with full ARM-feature parity. Which tool should you adopt?',
    options: opts4(
      'Bicep',
      'Azure PowerShell modules',
      'Azure CLI',
      'Terraform Cloud (third-party)'
    ),
    correct: ['a'],
    explanation: 'Bicep is Microsoft\'s native DSL for ARM with first-class ARM parity and simpler syntax. PowerShell and CLI are imperative scripting tools. Terraform is third-party (and a valid option but not Microsoft\'s built-in DSL).',
    references: [REF_BICEP]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to run a single container with a public IP for a short-lived batch job, without managing any cluster. Which service is the simplest fit?',
    options: opts4(
      'Azure Kubernetes Service',
      'Azure Container Instances',
      'Azure Functions Premium',
      'Azure App Service'
    ),
    correct: ['b'],
    explanation: 'Azure Container Instances runs a container in seconds with a public IP and per-second billing, ideal for short-lived workloads. AKS adds Kubernetes complexity; Functions runs code, not arbitrary containers as a job; App Service is for web apps.',
    references: [REF_ACI]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service hosts private Docker container images with geo-replication and Microsoft Entra-integrated authentication?',
    options: opts4(
      'Azure Container Registry',
      'Azure Container Apps',
      'Azure DevOps Artifacts',
      'Azure Storage container'
    ),
    correct: ['a'],
    explanation: 'Azure Container Registry (ACR) stores OCI/Docker images privately, supports geo-replication in Premium tier, and authenticates via Entra ID. Container Apps runs containers; DevOps Artifacts is for packages; Storage containers hold blobs, not images.',
    references: [REF_ACR]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'In an App Service plan, which scaling action increases the SKU from S1 to P1v3 to provide more CPU and memory per instance?',
    options: opts4(
      'Scale out',
      'Scale up',
      'Autoscale by request count',
      'Always On'
    ),
    correct: ['b'],
    explanation: 'Scale up changes the pricing tier (SKU) for more powerful instances. Scale out adds more instances of the current SKU. Autoscale rules trigger scale out. Always On keeps the app warm but does not change capacity.',
    references: [REF_APPSVC_PLAN, REF_APPSVC]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You deploy a Windows VM and need to RDP into it. Which inbound port must be allowed in the network security group on the VM\'s NIC or subnet?',
    options: opts4(
      'TCP 22',
      'TCP 3389',
      'TCP 443',
      'UDP 161'
    ),
    correct: ['b'],
    explanation: 'RDP uses TCP 3389. TCP 22 is SSH (for Linux), TCP 443 is HTTPS, UDP 161 is SNMP. For security, prefer Bastion or Just-In-Time access rather than opening 3389 to the internet.',
    references: [REF_NSG, REF_BASTION]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'A new VM size shows "B2s". What does the "B" series indicate?',
    options: opts4(
      'Burstable VM with bankable CPU credits',
      'Bare-metal hardware',
      'Basic SKU with no SLA',
      'Big-data optimized'
    ),
    correct: ['a'],
    explanation: 'B-series are burstable VMs that earn CPU credits when idle and burst above baseline when needed; ideal for low-utilization workloads with occasional spikes. They are general-purpose, not bare-metal or big-data SKUs.',
    references: [REF_VM_SIZE]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to deploy a managed Kubernetes cluster where Microsoft manages the control plane and you pay only for worker nodes. Which Azure service is that?',
    options: opts4(
      'Azure Kubernetes Service',
      'Azure Container Instances',
      'Azure Service Fabric',
      'Azure Container Apps'
    ),
    correct: ['a'],
    explanation: 'AKS provides a managed Kubernetes control plane (free) and you pay only for the agent nodes. ACI is single-container, not Kubernetes. Service Fabric is a different microservices platform. Container Apps runs containers with KEDA-based scaling.',
    references: [REF_AKS]
  },

  // ── Networking (14) ──
  {
    domain: NETWORK, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the smallest subnet size you can create in an Azure virtual network?',
    options: opts4(
      '/24 (256 addresses)',
      '/29 (8 addresses, 3 usable)',
      '/30 (4 addresses, 1 usable)',
      '/32 (1 address)'
    ),
    correct: ['b'],
    explanation: 'Azure reserves 5 addresses per subnet (network, gateway, two DNS, broadcast). The smallest supported subnet is /29 (8 addresses, 3 usable for resources). /30 and /32 are not supported.',
    references: [REF_SUBNET]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure construct lets two virtual networks in different regions communicate over the Microsoft backbone without a VPN gateway?',
    options: opts4(
      'Global VNet peering',
      'Local subnet peering',
      'ExpressRoute Direct',
      'Service endpoint'
    ),
    correct: ['a'],
    explanation: 'Global VNet peering connects VNets across regions over the Microsoft backbone with low latency and high throughput, no gateway required. ExpressRoute is for on-prem connectivity, service endpoints are for PaaS access, "local subnet peering" is not a term.',
    references: [REF_PEERING]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You apply an NSG to both a subnet and a VM NIC in that subnet. How are the rules evaluated for inbound traffic?',
    options: opts4(
      'Only the NIC NSG is evaluated; the subnet NSG is ignored.',
      'Inbound traffic must be allowed by both the subnet NSG and the NIC NSG.',
      'Only the subnet NSG is evaluated; the NIC NSG is ignored.',
      'The most permissive of the two NSGs is applied.'
    ),
    correct: ['b'],
    explanation: 'When both NSGs are attached, inbound traffic is evaluated against the subnet NSG first, then the NIC NSG; both must allow the traffic. Outbound is evaluated NIC then subnet. Either NSG can deny the flow.',
    references: [REF_NSG]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature lets you reference a logical grouping like "WebServers" or "DbServers" inside NSG rules instead of explicit IP ranges?',
    options: opts4(
      'Application security groups',
      'Service tags',
      'Route tables',
      'Network virtual appliances'
    ),
    correct: ['a'],
    explanation: 'Application Security Groups let you group VM NICs and reference the group in NSG rules so rules stay stable as IPs change. Service tags are Microsoft-managed (e.g., AzureCloud, Sql). Route tables direct traffic; NVAs are appliances.',
    references: [REF_ASG, REF_NSG]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'You need site-to-site connectivity from your on-prem datacenter to Azure with predictable bandwidth and private peering that does not traverse the public internet. Which option fits?',
    options: opts4(
      'Point-to-Site VPN',
      'Site-to-Site VPN over the public internet',
      'ExpressRoute',
      'VNet peering'
    ),
    correct: ['c'],
    explanation: 'ExpressRoute provides a dedicated, private connection through a connectivity provider with SLA-backed bandwidth. P2S VPN is for individual clients, S2S VPN traverses the public internet, and peering is between Azure VNets.',
    references: [REF_EXPRESSROUTE, REF_VPN]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure DNS feature provides name resolution for resources inside virtual networks using a private DNS zone like contoso.internal?',
    options: opts4(
      'Public Azure DNS zones',
      'Azure Private DNS zones',
      'Azure-provided DNS only',
      'Azure DNS Resolver outbound only'
    ),
    correct: ['b'],
    explanation: 'Azure Private DNS hosts custom domain zones (e.g., contoso.internal) resolvable only within linked VNets. Public DNS is for internet zones. Azure-provided DNS gives default Azure-suffixed names. Private Resolver provides cross-tenant resolution.',
    references: [REF_PRIVATE_DNS, REF_DNS]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a Layer 7 load balancer that performs URL-based routing, SSL termination, and Web Application Firewall (WAF) for a regional app. Which service should you use?',
    options: opts4(
      'Azure Load Balancer (Standard)',
      'Azure Application Gateway with WAF',
      'Azure Front Door',
      'Traffic Manager'
    ),
    correct: ['b'],
    explanation: 'Application Gateway is a regional Layer 7 load balancer with URL-based routing, SSL offload, and optional WAF. Azure Load Balancer is Layer 4. Front Door is global Layer 7 at the edge. Traffic Manager is DNS-based.',
    references: [REF_APPGW]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a globally distributed Layer 7 entry point with edge caching, WAF, and acceleration that routes to multiple regional backends. Which service?',
    options: opts4(
      'Application Gateway',
      'Azure Front Door',
      'VPN Gateway',
      'NAT Gateway'
    ),
    correct: ['b'],
    explanation: 'Azure Front Door is the global, anycast-based Layer 7 entry point with edge caching, WAF, and acceleration. App Gateway is regional. VPN Gateway is for VPN connectivity. NAT Gateway provides outbound SNAT.',
    references: [REF_FRONTDOOR]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'A user-defined route (UDR) sends 0.0.0.0/0 to a firewall NVA. Where do you attach the route table to take effect?',
    options: opts4(
      'On the virtual network resource',
      'On the subnet that contains the VMs',
      'On the public IP address',
      'On the NSG'
    ),
    correct: ['b'],
    explanation: 'Route tables are associated with subnets; traffic from any NIC in that subnet then uses the routes. They are not attached to VNets, public IPs, or NSGs.',
    references: [REF_ROUTE]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'You want admins to RDP/SSH to Azure VMs without exposing 3389/22 to the internet and without managing jump boxes. Which service should you use?',
    options: opts4(
      'Azure Bastion (deployed in the VNet)',
      'Azure Front Door',
      'NAT Gateway',
      'ExpressRoute'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion provides browser-based RDP/SSH over TLS without a public IP on the VM. Front Door is for HTTP(S) apps, NAT Gateway is for outbound SNAT, and ExpressRoute is private connectivity from on-prem.',
    references: [REF_BASTION]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL valid SKUs of Azure Public IP addresses.',
    options: opts4(
      'Basic',
      'Standard',
      'Global',
      'Premium'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Public IP SKUs are Basic, Standard, and Global (Standard zone-redundant). There is no "Premium" Public IP SKU. (Note: Basic is being retired but is still a valid SKU.)',
    references: [REF_PUBLIC_IP]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A VM in a subnet without a public IP needs reliable outbound connectivity to the internet for OS updates. Which service is recommended over default outbound SNAT?',
    options: opts4(
      'Azure NAT Gateway associated with the subnet',
      'Azure Bastion',
      'Application Gateway',
      'Service endpoint to Microsoft.Storage'
    ),
    correct: ['a'],
    explanation: 'NAT Gateway provides scalable, low-maintenance, dedicated outbound SNAT and is Microsoft\'s recommended outbound path. Bastion handles inbound RDP/SSH. App Gateway is inbound L7. Service endpoints are for PaaS connectivity, not generic internet egress.',
    references: [REF_NAT]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Load Balancer SKU is required to load-balance across availability zones?',
    options: opts4(
      'Basic Load Balancer',
      'Standard Load Balancer',
      'Gateway Load Balancer only',
      'Internal Load Balancer cannot use zones'
    ),
    correct: ['b'],
    explanation: 'Only the Standard Load Balancer SKU supports availability zones (zone-redundant or zonal frontends). Basic does not. Gateway LB is a different scenario (NVA chaining). Internal LB can also be zonal.',
    references: [REF_LB]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You configure a VNet-to-VNet peering between hub-vnet and spoke-vnet. By default, can VMs in spoke-vnet route through a firewall NVA in hub-vnet to reach the internet?',
    options: opts4(
      'Yes, peering automatically chains traffic through hub-vnet.',
      'No — you must enable "Allow forwarded traffic" on the peering and add a UDR in spoke-vnet pointing 0.0.0.0/0 to the NVA.',
      'Only when both VNets are in the same region.',
      'Only with ExpressRoute.'
    ),
    correct: ['b'],
    explanation: 'Peering does not automatically forward traffic between peers; you must enable "Allow forwarded traffic" (or "Allow gateway transit" for gateways) and define UDRs so traffic flows via the NVA. This is fundamental hub-spoke design.',
    references: [REF_PEERING, REF_ROUTE]
  },

  // ── Monitor (10) ──
  {
    domain: MONITOR, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure Monitor data store holds rich, queryable log telemetry collected from resources, agents, and diagnostic settings?',
    options: opts4(
      'Log Analytics workspace',
      'Storage account blob container',
      'Azure SQL Database',
      'Cosmos DB account'
    ),
    correct: ['a'],
    explanation: 'Log Analytics workspaces are the analytics store for Azure Monitor Logs, queryable with KQL. Storage accounts can archive logs but are not directly queryable. SQL and Cosmos are general databases, not native log stores.',
    references: [REF_LAW, REF_LOGS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Monitor feature sends platform metrics, resource logs, and activity logs from an Azure resource to a destination such as a Log Analytics workspace or storage account?',
    options: opts4(
      'Diagnostic settings',
      'Service Health',
      'Action groups',
      'Resource locks'
    ),
    correct: ['a'],
    explanation: 'Diagnostic settings route metrics and logs from individual resources to Log Analytics, Storage, or Event Hubs. Service Health reports Azure outages. Action groups send alert notifications. Locks prevent change/delete.',
    references: [REF_DIAG]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to receive an email and a webhook when the average CPU of a VM exceeds 80% for 5 minutes. Which two Azure Monitor concepts must you configure?',
    options: opts4(
      'A metric alert rule and an action group',
      'A diagnostic setting and a backup policy',
      'A Service Health alert and a recovery vault',
      'A Conditional Access policy and an RBAC role'
    ),
    correct: ['a'],
    explanation: 'A metric alert rule defines the condition; an action group defines the notifications/automation to fire when the alert triggers. Diagnostic settings route logs, Service Health alerts cover Azure outages, and CA/RBAC are unrelated.',
    references: [REF_ALERTS, REF_ACTION_GROUPS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Network Watcher tool verifies that a packet from a given source IP and port to a destination IP and port would be allowed or denied by current NSGs, UDRs, and other configurations?',
    options: opts4(
      'Connection Monitor',
      'IP flow verify',
      'Topology',
      'NSG flow logs'
    ),
    correct: ['b'],
    explanation: 'IP flow verify simulates a packet and reports allow/deny plus the NSG rule that matched. Connection Monitor is continuous reachability testing. Topology renders the VNet diagram. NSG flow logs record traffic over time.',
    references: [REF_NW_WATCH]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Where do you check whether an outage is affecting a specific Azure service and region right now?',
    options: opts4(
      'Resource Health for the resource and Azure Service Health for the platform',
      'Activity log only',
      'Azure Policy compliance view',
      'Diagnostic settings of the resource'
    ),
    correct: ['a'],
    explanation: 'Resource Health reports the personalized status of a specific resource, while Azure Service Health tracks ongoing platform-wide incidents and planned maintenance. Activity log records management actions, not outages.',
    references: [REF_RESOURCE_HEALTH, REF_SVC_HEALTH]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to back up a set of Azure VMs on a daily schedule with 30-day retention. Where do you create the backup policy?',
    options: opts4(
      'In a Recovery Services vault using Azure Backup',
      'In a Log Analytics workspace',
      'In Azure Policy',
      'In Application Insights'
    ),
    correct: ['a'],
    explanation: 'Recovery Services vaults hold backup policies for Azure VMs (and other Azure Backup workloads). Log Analytics is for logs; Policy is for compliance; App Insights is APM, not backup.',
    references: [REF_BACKUP_VAULT, REF_RECOVERY_SVC]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Log Analytics workspaces.',
    options: opts4(
      'They are queried with the Kusto Query Language (KQL).',
      'Each workspace is associated with exactly one Azure region.',
      'Data ingestion is free unless a daily cap is exceeded.',
      'Workspaces support pricing tiers like Pay-As-You-Go and Commitment Tiers.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Workspaces are regional, queried with KQL, and priced via Pay-As-You-Go or commitment tiers (per-GB ingestion). Data ingestion is NOT free; a daily cap stops ingestion only after the cap is hit.',
    references: [REF_LAW, REF_LOGS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service centrally manages and applies OS updates across Azure (and Arc-enabled) VMs at scale, with maintenance windows and assessment?',
    options: opts4(
      'Azure Update Manager',
      'Azure Backup',
      'Application Insights',
      'Azure Migrate'
    ),
    correct: ['a'],
    explanation: 'Azure Update Manager (formerly Update Management) centrally assesses and patches Windows/Linux VMs in Azure and via Arc. Backup is for restore points, App Insights is APM, Migrate is for inventory and migration.',
    references: [REF_UPDATE_MGR]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Azure Monitor data type is best suited for near-real-time, numeric, low-latency analytics (e.g., CPU% per minute over the last hour)?',
    options: opts4(
      'Logs',
      'Metrics',
      'Activity log',
      'Traces'
    ),
    correct: ['b'],
    explanation: 'Metrics are lightweight, time-series numeric data optimized for near-real-time charting and alerting. Logs are richer but higher-latency. Activity log records control-plane operations. Traces are App Insights distributed traces.',
    references: [REF_METRICS, REF_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A VM has been deleted. Where can you confirm WHO deleted it and WHEN?',
    options: opts4(
      'Azure Activity log for the subscription',
      'NSG flow logs',
      'Diagnostic settings logs on the VM',
      'Resource Health'
    ),
    correct: ['a'],
    explanation: 'The Activity log records control-plane operations like resource deletions, including the caller identity, timestamp, and status. Flow logs record network traffic; diagnostic logs are emitted by the resource; Resource Health shows availability.',
    references: [REF_MONITOR, REF_DIAG]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Identity & governance (14) ──
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft Entra ID license tier is required to enable Conditional Access policies?',
    options: opts4(
      'Microsoft Entra ID Free',
      'Microsoft Entra ID P1 or higher',
      'Microsoft Entra ID Premium for Office 365 only',
      'No license is required; Conditional Access is in Free'
    ),
    correct: ['b'],
    explanation: 'Conditional Access requires Microsoft Entra ID P1 (or P2). The Free tier does not include policy-based access controls. Security defaults (a coarse all-on baseline) are available without a paid tier.',
    references: [REF_CA, REF_AAD]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You delete a user from Microsoft Entra ID by mistake. Within what default window can you restore it from the Deleted users blade?',
    options: opts4(
      '24 hours',
      '7 days',
      '30 days',
      'Forever'
    ),
    correct: ['c'],
    explanation: 'Deleted Entra ID users remain in a soft-deleted state for 30 days, during which they can be restored. After 30 days they are permanently purged.',
    references: [REF_USERS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a script that runs on a VM to access Azure Key Vault without storing any secret in code. Which Entra ID feature solves this?',
    options: opts4(
      'System-assigned managed identity on the VM',
      'A shared service-principal certificate in the script',
      'Embedding a SAS token',
      'Storage account key in an environment variable'
    ),
    correct: ['a'],
    explanation: 'A system-assigned managed identity gives the VM an Entra ID identity that can be granted RBAC on Key Vault, so the SDK retrieves a token automatically — no secret in code. The other options embed secrets you must rotate manually.',
    references: [REF_RBAC, REF_AAD]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A management group "Prod" has a deny-public-IP policy. A Contributor on a child subscription tries to create a VM with a public IP. What happens?',
    options: opts4(
      'The deployment succeeds because Contributor outranks Policy.',
      'The deployment is denied at submission time by Azure Policy.',
      'The deployment succeeds and the resource is marked non-compliant.',
      'A Conditional Access prompt appears.'
    ),
    correct: ['b'],
    explanation: 'Deny effect is enforced at request time, regardless of the requester\'s RBAC role. Azure Policy and RBAC operate on different axes: RBAC says "can you do this action?" while Policy enforces "what configurations are allowed?".',
    references: [REF_POLICY_EFFECTS, REF_POLICY]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL valid hierarchy levels at which an Azure Policy can be assigned.',
    options: opts4(
      'Management group',
      'Subscription',
      'Resource group',
      'Individual disk SKU'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Policies assign at management group, subscription, or resource group scope, and inherit downward. Resource-level assignments are not supported; instead, policy effects apply when resources are created/modified within the assigned scope.',
    references: [REF_POLICY, REF_MGMTGROUP]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A junior admin needs to view VM properties but not modify them or sign-in to the VMs. Which built-in RBAC role is least-privilege?',
    options: opts4(
      'Reader',
      'Virtual Machine Contributor',
      'Owner',
      'Network Contributor'
    ),
    correct: ['a'],
    explanation: 'Reader grants read-only access to resource properties without any modify or login permissions. VM Contributor manages VMs; Owner has full control; Network Contributor manages network resources.',
    references: [REF_RBAC_ROLES]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Entra ID feature lets you require Just-In-Time activation, approval, and time-bound elevation for the Global Administrator role?',
    options: opts4(
      'Privileged Identity Management (PIM)',
      'Self-service password reset',
      'Conditional Access location filter',
      'Privileged Access Workstation policy'
    ),
    correct: ['a'],
    explanation: 'PIM requires P2 and lets you make admin roles eligible (vs. permanently active), with optional approval, MFA, justification, and time-bound activation. The other options are different features.',
    references: [REF_AAD, REF_CA]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to enforce MFA for all admins signing in from outside the corporate office IP ranges. Which Conditional Access components do you combine?',
    options: opts4(
      'Users: directory roles. Conditions: locations (exclude corporate IPs). Grant: Require MFA.',
      'Users: All users. Conditions: device platforms. Grant: Block.',
      'Users: Guests. Conditions: client apps. Session: Use app-enforced restrictions.',
      'Users: All workloads. Conditions: sign-in risk = None. Grant: Require terms of use.'
    ),
    correct: ['a'],
    explanation: 'Target the privileged roles, scope by named location (excluding trusted IPs), and grant only when MFA is satisfied. The other combinations do not match the stated requirement.',
    references: [REF_CA, REF_MFA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You attempt to delete a resource group but receive an error: "The resource has a delete lock". What must you do first?',
    options: opts4(
      'Add a Reader role assignment',
      'Remove the CanNotDelete lock from the resource group',
      'Disable Azure Policy for the subscription',
      'Change the subscription offer ID'
    ),
    correct: ['b'],
    explanation: 'A CanNotDelete lock prevents deletion until removed. The lock must be removed first (by a user with Microsoft.Authorization/locks/delete permission, e.g., Owner or User Access Administrator).',
    references: [REF_LOCKS]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A policy initiative reports an existing storage account as "non-compliant" because secure transfer is disabled. Which policy effect can both flag and automatically fix the misconfiguration on existing resources?',
    options: opts4(
      'audit',
      'deny',
      'deployIfNotExists or modify (with a remediation task)',
      'append-only'
    ),
    correct: ['c'],
    explanation: 'deployIfNotExists/modify can remediate existing resources via a remediation task using a managed identity. audit only flags non-compliance; deny only blocks future actions; "append-only" is not an effect.',
    references: [REF_POLICY_EFFECTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A guest user invited via B2B keeps getting redirected to their home tenant for authentication. Where do they actually authenticate?',
    options: opts4(
      'Always in the resource (inviting) tenant',
      'In their home tenant; the resource tenant receives the issued token',
      'Only on Microsoft 365 portal',
      'They cannot authenticate without a synced password'
    ),
    correct: ['b'],
    explanation: 'B2B guests authenticate against their home tenant. The resource tenant trusts the issued token and applies its own access controls (RBAC, Conditional Access).',
    references: [REF_GUESTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool can you use from your laptop to manage Azure resources from a command line in a cross-platform way?',
    options: opts4(
      'Azure CLI (az)',
      'Microsoft Edge only',
      'Visual Studio for Mac only',
      'Robocopy'
    ),
    correct: ['a'],
    explanation: 'Azure CLI (az) runs on Windows, macOS, and Linux and authenticates against Entra ID. Microsoft Edge is a browser. Visual Studio for Mac is a Windows IDE replacement, not a CLI. Robocopy is a file copy tool.',
    references: [REF_AAD]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure tags applied at a resource group are NOT automatically inherited by child resources.',
    options: opts4('True', 'False', 'Only when initiated via portal', 'Only on management groups'),
    correct: ['a'],
    explanation: 'True. Tags are not inherited automatically — child resources do not get parent tags. To enforce inheritance, use Azure Policy with the "Inherit a tag" modify effect.',
    references: [REF_TAGS, REF_POLICY_EFFECTS]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a single billing boundary that can hold multiple subscriptions for cost reporting and policy assignment. Which two structures help most?',
    options: opts4(
      'Management groups for policy + a Billing account/Enterprise enrollment for cost',
      'Resource groups for both billing and policy',
      'Tags for billing and resource locks for policy',
      'Public IPs and route tables'
    ),
    correct: ['a'],
    explanation: 'Management groups organize subscriptions for governance/policy inheritance. Billing accounts (EA/MCA) aggregate spend across subscriptions for invoicing. Resource groups don\'t cross subscriptions; tags help allocate cost but don\'t enforce policy.',
    references: [REF_MGMTGROUP, REF_SUBS]
  },

  // ── Storage (12) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which storage account redundancy option provides the highest durability by combining zone redundancy in the primary region with asynchronous replication to a second region?',
    options: opts4(
      'LRS',
      'ZRS',
      'GRS',
      'GZRS'
    ),
    correct: ['d'],
    explanation: 'GZRS = ZRS in primary + async LRS in secondary, the highest durability and zone resilience. LRS is single-DC, ZRS is intra-region across zones, GRS is LRS + async secondary.',
    references: [REF_STG_REDUND]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A storage account has read-access geo-redundant storage (RA-GRS). Which endpoint do you read from to access the secondary region?',
    options: opts4(
      'https://<account>.blob.core.windows.net',
      'https://<account>-secondary.blob.core.windows.net',
      'https://<account>.secondary.blob.core.windows.net',
      'https://secondary.<account>.blob.core.windows.net'
    ),
    correct: ['b'],
    explanation: 'RA-GRS exposes a secondary read-only endpoint at <account>-secondary.<service>.core.windows.net. The primary endpoint is read/write.',
    references: [REF_STG_REDUND, REF_STG_ACC]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure Files tier offers the lowest latency and is backed by SSD for transaction-heavy workloads?',
    options: opts4(
      'Standard (HDD)',
      'Premium (SSD)',
      'Archive (offline)',
      'Cool (object only)'
    ),
    correct: ['b'],
    explanation: 'Azure Files Premium uses SSD on FileStorage accounts for low-latency, high-IOPS workloads. Standard runs on HDD. Archive and Cool are blob tiers, not file-share tiers.',
    references: [REF_FILES, REF_STG_KIND]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which SAS type can be revoked without rotating storage account keys because revocation is achieved by deleting an associated server-side policy?',
    options: opts4(
      'Account SAS',
      'Service SAS without a stored access policy',
      'Service SAS with a stored access policy',
      'User-delegation SAS only'
    ),
    correct: ['c'],
    explanation: 'A Service SAS bound to a stored access policy can be revoked by deleting/modifying the policy without rotating account keys. Account SAS and ad-hoc Service SAS require key rotation to invalidate.',
    references: [REF_SAS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A blob is set to the Archive tier. What is required to read its contents?',
    options: opts4(
      'Nothing — Archive blobs are readable directly.',
      'Rehydrate the blob to Hot or Cool first (can take hours).',
      'Move the blob to a different storage account.',
      'Enable RA-GRS on the storage account.'
    ),
    correct: ['b'],
    explanation: 'Archive blobs are offline and must be rehydrated to Hot or Cool tier (standard or high priority) before read. Rehydration can take hours. Cross-account moves do not bypass the offline state.',
    references: [REF_BLOB_TIERS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a hostname inside your VNet (e.g., contosobackups.privatelink.blob.core.windows.net) to resolve to a private IP for your storage account. Which feature should you configure?',
    options: opts4(
      'Service endpoint',
      'Private endpoint with a private DNS zone',
      'NSG with a service tag',
      'Public IP allow list'
    ),
    correct: ['b'],
    explanation: 'A private endpoint gives the storage account a NIC and private IP in your VNet, and the privatelink.blob.core.windows.net private DNS zone resolves the alias to that IP. Service endpoints keep traffic on the Azure backbone but still use the public endpoint name.',
    references: [REF_PRIVATE_EP, REF_PRIVATE_DNS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL valid storage account performance/kind options.',
    options: opts4(
      'StorageV2 (general-purpose v2)',
      'BlobStorage (legacy)',
      'FileStorage (Premium files)',
      'TableStorage (dedicated tables)'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Valid kinds include StorageV2, legacy BlobStorage, BlockBlobStorage (Premium blocks), FileStorage (Premium files), and legacy Storage (v1). "TableStorage" is not a dedicated kind.',
    references: [REF_STG_KIND]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Azure Files identity option lets domain-joined Windows clients use Kerberos to authenticate to an SMB file share without storing storage account keys on the client?',
    options: opts4(
      'Anonymous access',
      'Storage account key prompt',
      'On-premises Active Directory Domain Services (AD DS) authentication for Azure Files',
      'SAS in the connection string'
    ),
    correct: ['c'],
    explanation: 'On-prem AD DS or Microsoft Entra Kerberos identity-based auth for Azure Files lets users sign in transparently with their AD credentials. Other options either expose secrets or skip auth entirely.',
    references: [REF_FILES]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A scheduled job needs to upload 5 GB nightly to a blob container from an Azure VM. Which authentication is most secure and key-free?',
    options: opts4(
      'Hard-coded storage account key',
      'Azure CLI azcopy login using the VM\'s managed identity, plus Storage Blob Data Contributor role',
      'SAS token in a config file checked into source',
      'Anonymous container'
    ),
    correct: ['b'],
    explanation: 'Managed identity + RBAC role (Storage Blob Data Contributor) lets AzCopy authenticate without secrets. Hard-coded keys and committed SAS tokens are insecure; anonymous containers leak data.',
    references: [REF_AZCOPY, REF_RBAC]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure feature gives a single namespace across multiple Azure Files shares and Windows Server endpoints, with cloud tiering of cold files?',
    options: opts4(
      'Azure File Sync',
      'AzCopy sync',
      'Storage account replication',
      'Cool blob tier'
    ),
    correct: ['a'],
    explanation: 'Azure File Sync turns Windows Server into a fast local cache of an Azure file share, with cloud tiering to keep only hot files on disk. The others do not provide a unified namespace.',
    references: [REF_FILES_SYNC]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A user can read public blobs without authenticating, but you want to disable anonymous public access account-wide. Where do you set this?',
    options: opts4(
      'Storage account > Configuration > "Allow Blob anonymous access" toggle (set to Disabled)',
      'Each container individually only',
      'NSG attached to the storage account',
      'Conditional Access policy targeting the storage account'
    ),
    correct: ['a'],
    explanation: 'The account-level toggle "Allow Blob anonymous access" overrides container-level public access settings. Disabling it blocks all anonymous reads regardless of container settings.',
    references: [REF_STG_ACC, REF_BLOB]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure tool gives a GUI to upload, download, and inspect blobs/files/queues/tables from a desktop?',
    options: opts4(
      'Azure Storage Explorer',
      'Azure Monitor',
      'Cosmos DB Emulator',
      'Network Watcher'
    ),
    correct: ['a'],
    explanation: 'Azure Storage Explorer is a free cross-platform desktop GUI for storage management. The others are unrelated services.',
    references: [REF_STG_BROWSER]
  },

  // ── Compute (15) ──
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A VM is sized D4s_v5. What does the "s" suffix indicate?',
    options: opts4(
      'Spot-eligible pricing',
      'Premium Storage capable (supports premium SSD disks)',
      'Smaller memory footprint',
      'Single-tenant hardware'
    ),
    correct: ['b'],
    explanation: 'The "s" suffix indicates Premium Storage capability (can attach premium SSD disks). Spot pricing is a separate purchase option set at deployment. Memory and tenancy are not encoded by "s".',
    references: [REF_VM_SIZE, REF_VM_DISK]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to deploy a stateless workload on cheap, preemptable VMs that can be reclaimed by Azure. Which purchasing option fits?',
    options: opts4(
      'Reserved instances',
      'Azure Hybrid Benefit',
      'Spot VMs',
      'Dedicated host'
    ),
    correct: ['c'],
    explanation: 'Spot VMs use spare Azure capacity at deep discounts but can be evicted on 30-second notice. Reserved instances commit to long-term capacity for discount. Azure Hybrid Benefit is licensing. Dedicated host is single-tenant hardware.',
    references: [REF_VM_SIZE, REF_VM]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You build a Bicep template with parameters for SKU and region. Which command deploys it to a resource group?',
    options: opts4(
      'az deployment group create --resource-group rg --template-file main.bicep --parameters ...',
      'az vm bicep deploy',
      'bicep build && az run',
      'docker compose up'
    ),
    correct: ['a'],
    explanation: '`az deployment group create` deploys an ARM/Bicep template at resource group scope. There is no `az vm bicep deploy`; `bicep build` only compiles; `docker compose` is for local containers.',
    references: [REF_BICEP, REF_ARM]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A VM Scale Set has an autoscale rule "scale out by 2 when average CPU > 70% for 5 minutes". Which Azure Monitor concept evaluates the metric and triggers the action?',
    options: opts4(
      'Autoscale settings backed by Azure Monitor metrics',
      'Action group',
      'Log Analytics alert',
      'Diagnostic settings'
    ),
    correct: ['a'],
    explanation: 'VMSS autoscale uses Azure Monitor autoscale settings against metric thresholds. Action groups deliver alert notifications. Logs alerts query KQL. Diagnostic settings only route telemetry.',
    references: [REF_VMSS_AUTO, REF_METRICS]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature reduces VM cost when you commit to 1- or 3-year usage of a particular VM size and region?',
    options: opts4(
      'Reserved Instances',
      'Spot pricing',
      'Hybrid Benefit',
      'Pay-as-you-go'
    ),
    correct: ['a'],
    explanation: 'Reserved Instances offer up to ~72% off vs. PAYG by committing for 1 or 3 years in a specific region/size family. Spot is preemptable, Hybrid Benefit reuses on-prem licenses, PAYG is the default.',
    references: [REF_VM_SIZE]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure VM disk encryption.',
    options: opts4(
      'Azure Disk Encryption (ADE) encrypts OS and data disks using BitLocker (Windows) or DM-Crypt (Linux) with keys in Key Vault.',
      'Managed disks are encrypted at rest by default with platform-managed keys.',
      'Customer-managed keys (CMK) can be used in place of platform-managed keys for managed disks.',
      'Encryption requires the VM to be a P-series GPU SKU.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Managed disks are encrypted at rest by default; CMK is supported; ADE adds in-guest encryption. Encryption is not gated on any specific GPU/CPU SKU.',
    references: [REF_VM_DISK, REF_VM]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a containerized web app that auto-scales to zero when idle and supports KEDA event-driven scaling. Which Azure service is purpose-built for this?',
    options: opts4(
      'Azure Container Apps',
      'Azure Kubernetes Service',
      'Azure Container Instances',
      'Azure App Service Free tier'
    ),
    correct: ['a'],
    explanation: 'Azure Container Apps offers serverless containers with KEDA-based event scaling, including scale-to-zero. AKS is full Kubernetes you manage; ACI runs a single container without elastic scale; App Service is for code-based web apps.',
    references: [REF_AKS, REF_APPSVC]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature allows multiple App Service apps to share compute and is the unit of scale/pricing?',
    options: opts4(
      'App Service plan',
      'App Service slot',
      'App Service Environment v3 only',
      'Functions Premium plan only'
    ),
    correct: ['a'],
    explanation: 'An App Service plan defines the SKU, instance count, and OS that hosts one or more apps. Slots are deployment targets within an app; ASE v3 is a dedicated isolated plan flavor. The plan is the unit of scale and pricing.',
    references: [REF_APPSVC_PLAN]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to swap a staging deployment slot into production with zero-downtime. Which App Service feature gives you this?',
    options: opts4(
      'Deployment slot swap (with preview if needed)',
      'A blue-green script using Storage queues',
      'Manual scale-out',
      'WebJobs'
    ),
    correct: ['a'],
    explanation: 'App Service deployment slots support zero-downtime swap, including a preview to validate the warmed-up slot before completing the swap. The other options do not provide that capability.',
    references: [REF_APPSVC]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You\'ve published a Docker image to ACR and want App Service to pull and run it. Which feature/configuration is needed?',
    options: opts4(
      'Configure the App Service for a custom container and grant it AcrPull on the registry (managed identity recommended)',
      'Copy the image into the App Service runtime ZIP',
      'Use Azure Functions instead — App Service cannot run containers',
      'Mount the registry as a file share'
    ),
    correct: ['a'],
    explanation: 'App Service for containers pulls images from ACR using credentials or, preferably, the app\'s managed identity granted AcrPull. Functions can also run containers but is not required.',
    references: [REF_APPSVC, REF_ACR]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Backup tier setting determines whether VM backups can survive accidental deletion by ransomware actors?',
    options: opts4(
      'Soft delete / immutable vault settings on the Recovery Services vault',
      'GRS replication for blobs only',
      'NSG allow-list to the vault',
      'Spot eviction policy'
    ),
    correct: ['a'],
    explanation: 'Soft delete (and immutable vault settings) protect backup recovery points from accidental or malicious deletion by retaining them in a soft-deleted state for a configurable period.',
    references: [REF_VM_BACKUP, REF_RECOVERY_SVC]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to extend an on-prem Hyper-V VM into Azure for DR with replication and orchestrated failover. Which service?',
    options: opts4(
      'Azure Site Recovery (ASR)',
      'Azure Backup (VM workload)',
      'Azure Migrate (Server Assessment only)',
      'Azure File Sync'
    ),
    correct: ['a'],
    explanation: 'Azure Site Recovery replicates on-prem VMs (Hyper-V, VMware, physical) to Azure and orchestrates failover and failback. Backup restores files/VMs; Migrate is one-way migration; File Sync is for file shares.',
    references: [REF_ASR]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Windows VM needs to join an Azure-hosted Microsoft Entra Domain Services managed domain. Which subnet placement is required?',
    options: opts4(
      'Same VNet as the Entra Domain Services managed domain, or a peered VNet with DNS pointing to the domain controllers',
      'A subnet without an NSG',
      'A subnet with a public IP gateway',
      'The default GatewaySubnet'
    ),
    correct: ['a'],
    explanation: 'VMs must reach the managed domain DCs via a connected VNet (same VNet or peered) and use the AAD DS DCs as DNS. NSG and gateway are not the determining factors.',
    references: [REF_VNET, REF_VM]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which option lets a VM Scale Set automatically replace unhealthy instances based on Application Gateway health probes?',
    options: opts4(
      'Automatic instance repair',
      'Manual scale-out only',
      'Static placement groups',
      'Spot eviction policy'
    ),
    correct: ['a'],
    explanation: 'Automatic instance repair on VMSS uses the load balancer or App Gateway health probe state to delete and reprovision unhealthy instances. Static placement and scale-out alone do not heal instances.',
    references: [REF_VMSS, REF_APPGW]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A VM is running but you cannot connect via RDP. Which Azure tool views the VM\'s console output to diagnose boot or OS issues?',
    options: opts4(
      'Boot diagnostics (serial console + screenshot)',
      'Update Manager',
      'Application Insights',
      'Cloud Shell only'
    ),
    correct: ['a'],
    explanation: 'Boot diagnostics streams the VM console and shows a screenshot to diagnose boot/network/login failures. Update Manager and App Insights do not show OS console; Cloud Shell is an in-portal terminal.',
    references: [REF_VM_EXT, REF_VM]
  },

  // ── Networking (14) ──
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Two VNets in the same region are peered. Which statement is true about latency and bandwidth between them?',
    options: opts4(
      'Traffic transits the public internet by default.',
      'Traffic stays on the Microsoft backbone with low latency and high bandwidth.',
      'It requires a VPN gateway in each VNet.',
      'It requires ExpressRoute.'
    ),
    correct: ['b'],
    explanation: 'VNet peering uses the Microsoft backbone — no gateway, no public internet, low latency, and high bandwidth. Gateways or ExpressRoute are not required for peering.',
    references: [REF_PEERING]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to allow inbound TCP 443 to a single VM only from the Azure Front Door service. Which service tag should you reference in your NSG rule?',
    options: opts4(
      'AzureFrontDoor.Backend',
      'AzureCloud',
      'Internet',
      'VirtualNetwork'
    ),
    correct: ['a'],
    explanation: 'AzureFrontDoor.Backend is the service tag for Front Door\'s backend IPs. AzureCloud covers all Azure IPs (too broad), Internet is global, VirtualNetwork is internal.',
    references: [REF_FRONTDOOR, REF_NSG]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure Load Balancer type provides public frontend IPs to distribute internet traffic to VMs in a VNet?',
    options: opts4(
      'Public Load Balancer',
      'Internal Load Balancer',
      'Gateway Load Balancer',
      'Cross-region Load Balancer only'
    ),
    correct: ['a'],
    explanation: 'A Public Load Balancer has a public frontend IP and distributes inbound internet traffic. Internal LBs use private frontends within a VNet. Gateway LB chains traffic to NVAs.',
    references: [REF_LB]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a VPN connection from a remote engineer\'s laptop to an Azure VNet. Which type of VPN should you configure?',
    options: opts4(
      'Site-to-Site (S2S) VPN',
      'Point-to-Site (P2S) VPN',
      'ExpressRoute Direct',
      'VNet peering'
    ),
    correct: ['b'],
    explanation: 'Point-to-Site VPN connects a single client to Azure over an SSTP, OpenVPN, or IKEv2 tunnel. S2S connects whole networks. ExpressRoute is private connectivity for sites, not individual laptops. Peering is between Azure VNets.',
    references: [REF_VPN]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'A subnet must use a network virtual appliance (NVA) for inspection of egress traffic. Which two configurations are required?',
    options: opts4(
      'Enable IP forwarding on the NVA NIC and a UDR on the subnet pointing 0.0.0.0/0 to the NVA',
      'A delete lock on the resource group',
      'Sites-to-Sites VPN between the NVA and the subnet',
      'Tags on the NVA equal to "firewall"'
    ),
    correct: ['a'],
    explanation: 'The NVA NIC must allow IP forwarding so it can forward packets, and the subnet must have a UDR sending traffic to the NVA\'s IP. Locks and tags do not affect routing.',
    references: [REF_ROUTE, REF_NSG]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure DNS feature lets external clients on the internet resolve a public domain like contoso.com hosted in Azure?',
    options: opts4(
      'Azure Public DNS zone',
      'Azure Private DNS zone',
      'Azure DNS Private Resolver',
      'Reverse DNS only'
    ),
    correct: ['a'],
    explanation: 'Azure Public DNS hosts publicly resolvable zones. Private DNS is for VNet-only resolution. Private Resolver bridges on-prem to private zones.',
    references: [REF_DNS]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A VM\'s NIC is in a subnet that is associated with a route table where 0.0.0.0/0 routes to a firewall. The VM also has a public IP. Which traffic uses the public IP?',
    options: opts4(
      'All outbound and inbound traffic uses the public IP unconditionally.',
      'Inbound to the public IP still arrives directly, but outbound traffic follows the UDR through the firewall, not the public IP.',
      'No traffic uses the public IP because the UDR overrides it.',
      'Only ICMP traffic uses the public IP.'
    ),
    correct: ['b'],
    explanation: 'The UDR controls outbound paths only; outbound traffic now goes via the firewall. Inbound to a public IP still reaches the VM directly (subject to NSGs). Public IPs are not "overridden".',
    references: [REF_ROUTE, REF_PUBLIC_IP]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to allow only members of a specific Microsoft Entra group to authenticate to a P2S VPN connection. Which authentication type should you select?',
    options: opts4(
      'Microsoft Entra ID authentication for VPN',
      'Pre-shared key (PSK) only',
      'Certificate-based with self-signed cert',
      'Anonymous'
    ),
    correct: ['a'],
    explanation: 'Entra ID authentication for VPN supports Conditional Access and group-based access. PSKs and self-signed certs are not group-aware; anonymous defeats the purpose.',
    references: [REF_VPN, REF_CA]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which port and protocol does the Standard Azure Load Balancer use for HTTP health probes?',
    options: opts4(
      'TCP 22',
      'TCP 80 (configurable) for HTTP probes; HTTPS probe also supported',
      'UDP 53',
      'ICMP only'
    ),
    correct: ['b'],
    explanation: 'Health probes can be configured for HTTP/HTTPS/TCP on any port; HTTP probe defaults are configurable. ICMP is not supported by Standard LB probes.',
    references: [REF_LB]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a hub-and-spoke topology with centralized firewall and on-prem connectivity. Which Azure service is purpose-built to host the hub with managed routing and SD-WAN integrations?',
    options: opts4(
      'Azure Virtual WAN',
      'Azure App Gateway',
      'Azure Front Door',
      'Traffic Manager'
    ),
    correct: ['a'],
    explanation: 'Azure Virtual WAN provides a managed hub-and-spoke fabric with VPN, ExpressRoute, SD-WAN, and firewall integration. App Gateway is L7 in-region; Front Door is global L7; Traffic Manager is DNS-based.',
    references: [REF_VNET]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about NSG rules.',
    options: opts4(
      'Rules are processed by priority, lowest number first; the first matching rule wins.',
      'NSG rules support stateful connection tracking for return traffic.',
      'You can use service tags like Sql or Storage as source or destination instead of explicit IPs.',
      'NSGs perform deep packet inspection of HTTPS payloads.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'NSG rules are evaluated by priority, are stateful, and accept service tags. They do NOT do deep packet inspection — they are 5-tuple stateful filters. DPI is a feature of Azure Firewall/WAF/NVAs.',
    references: [REF_NSG]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'A web app needs WAF protection for OWASP Top 10. The team chose Application Gateway. Which SKU and tier include WAF?',
    options: opts4(
      'Application Gateway WAF_v2',
      'Application Gateway Standard_v2 only',
      'Standard Load Balancer',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'WAF_v2 is the App Gateway SKU that includes Web Application Firewall capabilities (Core Rule Set, custom rules, geo-filter). Standard_v2 omits WAF. LB and Bastion do not provide WAF.',
    references: [REF_APPGW]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You enable virtual network peering between VNetA and VNetB. Can VMs in VNetA reach VMs in VNetC, which is peered only to VNetB?',
    options: opts4(
      'Yes, peering is transitive by default.',
      'No, VNet peering is non-transitive; you must enable forwarded traffic and route via an NVA/gateway, or directly peer VNetA and VNetC.',
      'Only if all three VNets are in the same region.',
      'Only with ExpressRoute on each.'
    ),
    correct: ['b'],
    explanation: 'VNet peering is non-transitive. To enable VNetA-VNetC traffic via VNetB, you must enable "Allow forwarded traffic", route traffic through an NVA/gateway in VNetB, or add a direct peering.',
    references: [REF_PEERING, REF_ROUTE]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service blocks DDoS attacks on public IPs with adaptive tuning and tied to Azure Monitor alerting?',
    options: opts4(
      'Azure DDoS Protection (Network/IP Protection plans)',
      'Network Watcher',
      'Azure Firewall only',
      'Front Door rate limiting only'
    ),
    correct: ['a'],
    explanation: 'Azure DDoS Protection (Network or IP Protection plans) extends the always-on infrastructure baseline with adaptive tuning, telemetry, and alerts. Network Watcher is diagnostics; Firewall/Front Door provide separate L4-L7 protections.',
    references: [REF_PUBLIC_IP, REF_VNET]
  },

  // ── Monitor (10) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which agent collects logs and performance counters from Azure and Arc-enabled VMs into a Log Analytics workspace using data collection rules (DCRs)?',
    options: opts4(
      'Azure Monitor Agent (AMA)',
      'Legacy Microsoft Monitoring Agent (MMA) only',
      'Azure Diagnostics Extension (WAD)',
      'Application Insights SDK'
    ),
    correct: ['a'],
    explanation: 'Azure Monitor Agent (AMA) is the modern unified agent driven by DCRs. MMA/OMS are legacy and retiring; WAD streams from VMs to storage/Event Hubs (different scope); App Insights SDK is for in-app telemetry.',
    references: [REF_MONITOR, REF_DIAG]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to receive a notification when a specific Azure region experiences a major incident affecting Azure Storage. Where should you configure this alert?',
    options: opts4(
      'Service Health alert with category "Service issues" and impacted service "Storage"',
      'Resource Health alert per storage account',
      'NSG flow log',
      'Azure Backup policy'
    ),
    correct: ['a'],
    explanation: 'Service Health alerts subscribe to platform incidents, planned maintenance, and health advisories for selected services and regions. Resource Health is per-resource; NSG flow logs and Backup policies are unrelated.',
    references: [REF_SVC_HEALTH]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'You write a KQL query that counts failed sign-ins per user in the last 24 hours. Where do you save and parameterize this query for reuse?',
    options: opts4(
      'A Log Analytics saved query or workbook',
      'A storage account text file',
      'A Bicep parameter file',
      'An Azure Policy parameter'
    ),
    correct: ['a'],
    explanation: 'Saved queries and workbooks store reusable KQL with parameters and visualizations. Storage files, Bicep parameters, and Policy parameters are different artifacts.',
    references: [REF_LOGS, REF_LAW]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A VM\'s disk fills up and the app crashes. Which metric source would have given you advance warning?',
    options: opts4(
      'Guest OS performance counters (collected by AMA into Log Analytics or Metrics)',
      'Activity log entries',
      'Service Health',
      'NSG flow logs'
    ),
    correct: ['a'],
    explanation: 'Guest OS counters (e.g., LogicalDisk Free%) require an in-guest agent (AMA) because the platform cannot see inside the OS. Activity log and Service Health are control-plane; NSG flow logs are network.',
    references: [REF_MONITOR, REF_METRICS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single dashboard that combines metrics, log queries, and parameters for ops review. Which Azure feature should you use?',
    options: opts4(
      'Azure Monitor workbook',
      'Application Insights live metrics only',
      'Microsoft Sentinel hunting query',
      'Azure Service Health'
    ),
    correct: ['a'],
    explanation: 'Workbooks combine metrics, KQL logs, parameters, and visualizations in a single interactive document. Live metrics is a real-time stream; Sentinel hunting is for SecOps; Service Health is platform incidents.',
    references: [REF_MONITOR, REF_LOGS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to monitor whether a website is responding from multiple regions every 5 minutes. Which Application Insights feature is purpose-built for this?',
    options: opts4(
      'Availability tests (URL ping or standard tests)',
      'Snapshot debugger',
      'Live metrics stream',
      'Smart detection'
    ),
    correct: ['a'],
    explanation: 'App Insights availability tests run synthetic probes from multiple Azure regions and raise alerts on failures. Snapshot debugger captures stack traces; Live metrics shows real-time stats; Smart detection finds anomalies.',
    references: [REF_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Backup for VMs.',
    options: opts4(
      'Backups are stored in a Recovery Services vault outside the VM\'s storage account.',
      'Application-consistent backup uses VSS (Windows) or pre/post scripts (Linux).',
      'You can restore a VM-level recovery point, individual disks, or individual files.',
      'A backup policy can be defined separately for each VM but not shared across many VMs.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Backups live in the vault; consistency uses VSS or scripts; restores can be at VM, disk, or file level. A single policy can be assigned to many VMs (the same policy is shared, not per-VM only).',
    references: [REF_VM_BACKUP, REF_RECOVERY_SVC]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs to track which engineer modified a VM\'s NSG and when. Which log source is the system of record?',
    options: opts4(
      'Activity log for the subscription/resource group',
      'NSG flow logs only',
      'Boot diagnostics',
      'Service Health'
    ),
    correct: ['a'],
    explanation: 'The Activity log records all control-plane operations including NSG rule changes, with caller identity and timestamp. Flow logs record packet metadata, not change events; boot diagnostics show OS console; Service Health shows platform events.',
    references: [REF_DIAG, REF_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'You want alerts to call an Azure Function for custom remediation when CPU > 90% for 10 minutes. Which Azure Monitor concept routes the alert to the function?',
    options: opts4(
      'An action group that includes a webhook or Function action',
      'A Recovery Services vault policy',
      'A diagnostic setting to storage',
      'An RBAC role assignment to the function'
    ),
    correct: ['a'],
    explanation: 'Action groups define notification/automation actions (email, SMS, webhook, Function, Logic App, ITSM) fired by alert rules. The other options are unrelated to alert routing.',
    references: [REF_ACTION_GROUPS, REF_ALERTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Network Watcher feature continuously measures reachability and latency between two endpoints (e.g., a VM in spoke-vnet and a VM in hub-vnet)?',
    options: opts4(
      'Connection Monitor',
      'IP flow verify',
      'NSG diagnostic logs',
      'Effective Routes'
    ),
    correct: ['a'],
    explanation: 'Connection Monitor runs ongoing reachability and latency tests between specified endpoints with alerting. IP flow verify is a one-shot check. NSG diagnostic logs and effective routes are configuration views.',
    references: [REF_NW_WATCH]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Identity & governance (14) ──
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to invite an external accountant to access reports in your tenant once a month. Which identity model is most appropriate?',
    options: opts4(
      'Create a full member account in your tenant for the accountant',
      'Invite the accountant as a B2B guest using their existing email identity',
      'Share the global administrator credentials',
      'Disable Conditional Access temporarily'
    ),
    correct: ['b'],
    explanation: 'B2B guest invitations allow external users to authenticate with their existing identity and be granted scoped access. Full member accounts are heavier than needed; sharing admin credentials is forbidden; disabling CA is a security regression.',
    references: [REF_GUESTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which built-in RBAC role is intended for users who need to manage all aspects of virtual networks but should NOT manage role assignments or access?',
    options: opts4(
      'Network Contributor',
      'Owner',
      'User Access Administrator',
      'Storage Account Contributor'
    ),
    correct: ['a'],
    explanation: 'Network Contributor can manage networking resources but cannot assign roles. Owner can do everything including role assignment. User Access Administrator manages access. Storage Account Contributor manages storage accounts only.',
    references: [REF_RBAC_ROLES]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You assign a Policy initiative at a management group with parameters specifying allowed VM SKUs. New subscriptions are added under the management group. What happens?',
    options: opts4(
      'New subscriptions inherit the assignment automatically; non-compliant deployments are denied.',
      'You must reassign the initiative on every new subscription.',
      'The initiative converts to advisory only.',
      'Existing compliant resources become non-compliant.'
    ),
    correct: ['a'],
    explanation: 'Management group-scoped policy assignments are inherited by all current and future child subscriptions and resource groups. There is nothing to redo per subscription. Compliance state of existing resources is independent of new assignments.',
    references: [REF_MGMTGROUP, REF_POLICY]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to authenticate to Azure with a hardware security key instead of a password. Which Entra ID feature supports passwordless sign-in with FIDO2 keys?',
    options: opts4(
      'Microsoft Entra passwordless authentication with FIDO2 security keys',
      'Network Policy Server with RADIUS',
      'Storage account access keys',
      'SAS token-based sign-in'
    ),
    correct: ['a'],
    explanation: 'Entra ID supports FIDO2 security keys as a passwordless authentication method. The other options have nothing to do with user authentication.',
    references: [REF_MFA, REF_AAD]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL ways to define an Azure custom RBAC role.',
    options: opts4(
      'Azure portal Roles + administrators UI',
      'PowerShell (New-AzRoleDefinition with JSON)',
      'Azure CLI (az role definition create --role)',
      'Microsoft 365 admin center only'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Custom roles can be authored in the portal, via PowerShell, or via the CLI. M365 admin center manages M365 roles, not Azure RBAC.',
    references: [REF_RBAC_CUSTOM]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A finance team wants a chargeback report broken down by department. Which Azure tagging strategy enables this?',
    options: opts4(
      'Apply a department tag on every resource and group cost views by that tag in Cost Management',
      'Use Resource locks for billing isolation',
      'Use NSGs to separate finance traffic',
      'Move resources to different regions for billing'
    ),
    correct: ['a'],
    explanation: 'Cost Management can filter and group costs by tag, which is the standard chargeback pattern. Locks and NSGs are unrelated to billing; region does not equal department.',
    references: [REF_TAGS]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Conditional Access "Block legacy authentication" affects which protocols?',
    options: opts4(
      'Modern authentication (OAuth) for browser sign-ins',
      'Basic authentication protocols like POP, IMAP, SMTP, and older Exchange Web Services without modern auth',
      'Microsoft Authenticator MFA',
      'FIDO2 security keys'
    ),
    correct: ['b'],
    explanation: 'Legacy auth refers to protocols that don\'t support modern auth (e.g., POP/IMAP, older SMTP, older EWS). Blocking them removes a major attack surface for password spraying. Modern OAuth, MFA and FIDO2 are unaffected.',
    references: [REF_CA, REF_AAD]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Policy effect blocks a non-compliant request from being submitted to Azure Resource Manager?',
    options: opts4(
      'audit',
      'deny',
      'disabled',
      'append'
    ),
    correct: ['b'],
    explanation: 'Deny evaluates the request and blocks it before it reaches the resource provider. Audit only logs non-compliance. Disabled turns the policy off. Append adds fields/tags but does not block.',
    references: [REF_POLICY_EFFECTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to assign a single Reader role at the root management group so all 50 subscriptions inherit read access for an auditor. Which prerequisite is required?',
    options: opts4(
      'You must elevate access to manage Azure resources at the root management group (one-time elevation as Global Administrator)',
      'A Conditional Access policy granting Reader',
      'A SAS token for the auditor',
      'A Recovery Services vault'
    ),
    correct: ['a'],
    explanation: 'A Global Administrator must first elevate access ("Access management for Azure resources" toggle) to gain User Access Administrator at the root scope. From there, role assignments can be made at the root management group.',
    references: [REF_MGMTGROUP, REF_RBAC]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Entra ID feature is required for sign-in risk-based Conditional Access policies?',
    options: opts4(
      'Microsoft Entra ID P2',
      'Free tier',
      'Azure AD B2C standard tier only',
      'No license needed'
    ),
    correct: ['a'],
    explanation: 'Risk-based policies (Identity Protection signals) require Microsoft Entra ID P2. P1 supports Conditional Access without risk; Free does not. B2C is a separate product for consumer identities.',
    references: [REF_CA, REF_AAD]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A team must be denied access to a specific virtual machine even though they have Contributor on the resource group. Which mechanism supports this?',
    options: opts4(
      'Resource lock',
      'Deny assignment (typically created by Azure-managed services like managed apps or Blueprints) or use Azure Policy deny',
      'NSG inbound deny rule',
      'Tag policy'
    ),
    correct: ['b'],
    explanation: 'Deny assignments explicitly block specific actions on a resource and override allow assignments. They are typically created by managed services. Policy deny can also stop new deployments matching certain criteria. NSGs do network filtering, not RBAC.',
    references: [REF_RBAC, REF_POLICY_EFFECTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A management group in Azure can be nested up to six levels of depth below the root management group.',
    options: opts4('True', 'False', 'Only 2 levels', 'Only 4 levels'),
    correct: ['a'],
    explanation: 'True. Microsoft documents a maximum of six levels of management group depth (excluding the root and subscription level).',
    references: [REF_MGMTGROUP]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You enforce a policy that requires "secure transfer" (HTTPS) on all storage accounts. The audit shows several existing accounts non-compliant. What is the safest way to remediate at scale?',
    options: opts4(
      'Manually toggle each account',
      'Create a remediation task (deployIfNotExists or modify effect) that uses a managed identity with proper scope to fix non-compliant accounts',
      'Delete all non-compliant accounts',
      'Set the subscription to read-only'
    ),
    correct: ['b'],
    explanation: 'Remediation tasks invoke the policy\'s deployIfNotExists/modify template using a managed identity, fixing existing non-compliant resources at scale safely and auditably. Manual fixes don\'t scale; deletion is destructive.',
    references: [REF_POLICY_EFFECTS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You can grant a user permissions to a subset of users (e.g., only those in their department) in Microsoft Entra ID using which feature?',
    options: opts4(
      'Administrative units',
      'Resource groups',
      'Network Security Groups',
      'Recovery Services vault'
    ),
    correct: ['a'],
    explanation: 'Administrative Units let you scope Entra ID admin roles to a subset of users, groups, or devices — useful for delegated administration in large tenants. RGs are for Azure resources, NSGs are network, RSV is for backups.',
    references: [REF_AAD]
  },

  // ── Storage (12) ──
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to set up an immutable, WORM-style policy on a blob container so audit logs cannot be modified or deleted before a retention date. Which feature is purpose-built?',
    options: opts4(
      'Immutable storage policies (time-based retention or legal hold)',
      'Soft delete only',
      'Lifecycle management Archive transition',
      'Storage account read-only key'
    ),
    correct: ['a'],
    explanation: 'Immutable storage for Blob applies time-based retention or legal hold to ensure WORM (write-once, read-many) compliance. Soft delete recovers items; lifecycle changes tiers; key state does not enforce immutability.',
    references: [REF_BLOB, REF_BLOB_SOFTDEL]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure object replication on a source storage account to a destination account in another region. What is replicated?',
    options: opts4(
      'All blob types including page and append blobs',
      'Block blobs only (with versioning and change feed enabled on source)',
      'Queues and tables',
      'File shares'
    ),
    correct: ['b'],
    explanation: 'Object replication copies block blobs asynchronously between accounts, with versioning + change feed required on source. Page/append blobs, queues, tables, and file shares are not replicated by this feature.',
    references: [REF_BLOB, REF_STG_ACC]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure Storage redundancy option keeps three copies in a single datacenter and is the cheapest, with the lowest durability?',
    options: opts4(
      'LRS',
      'ZRS',
      'GRS',
      'GZRS'
    ),
    correct: ['a'],
    explanation: 'LRS replicates three copies in one datacenter. ZRS spreads across zones; GRS adds an async secondary region; GZRS combines both. LRS is the cheapest and least durable.',
    references: [REF_STG_REDUND]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A SAS issued from a user-delegation key uses what to sign requests instead of a storage account key?',
    options: opts4(
      'The storage account access key',
      'A Microsoft Entra ID-based user delegation key obtained from the storage service',
      'A static certificate stored in Key Vault',
      'No signing is required'
    ),
    correct: ['b'],
    explanation: 'A user-delegation SAS is signed with a user-delegation key obtained from the storage service after the user authenticates with Entra ID. This avoids exposing the account key.',
    references: [REF_SAS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which storage feature exposes blob data to Azure Data Lake Storage Gen2 APIs (hierarchical namespace, ACLs, POSIX-like operations)?',
    options: opts4(
      'Enable hierarchical namespace on the storage account at creation',
      'Use Azure Files SMB',
      'Mount the blob as a managed disk',
      'Use Cosmos DB instead'
    ),
    correct: ['a'],
    explanation: 'Hierarchical namespace (HNS), enabled at account creation, turns a storage account into Azure Data Lake Storage Gen2 with directory semantics and POSIX-like ACLs. Files SMB, disks, and Cosmos are different services.',
    references: [REF_STG_ACC]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A storage account has a private endpoint and the firewall set to "Selected networks" with no VNets. Public clients fail to read blobs. What is required to allow on-prem clients via VPN to read blobs?',
    options: opts4(
      'Route the on-prem subnet to the VNet (S2S VPN/ExpressRoute) and ensure DNS resolves the privatelink alias to the private IP',
      'Re-enable public access',
      'Set the storage account to LRS',
      'Use Storage Explorer with account keys only'
    ),
    correct: ['a'],
    explanation: 'Private endpoints are reachable from networks routed to the VNet (e.g., on-prem via VPN/ExpressRoute) provided DNS resolves the privatelink alias to the private IP. Disabling private access defeats the purpose.',
    references: [REF_PRIVATE_EP, REF_PRIVATE_DNS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Files share snapshots.',
    options: opts4(
      'Snapshots are read-only point-in-time copies of the share.',
      'Snapshots can be taken manually or by Azure Backup policies.',
      'Snapshots replace daily backups for compliance retention beyond 30 days.',
      'Restoring from a snapshot can be done by copy or by promoting the snapshot to the share.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Snapshots are read-only, can be manual or backup-scheduled, and support file/path restores. They are good for short-term restore but Azure Backup with Recovery Services vault is the recommended long-retention backup mechanism.',
    references: [REF_FILES, REF_BACKUP_VAULT]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'A blob storage account uses customer-managed keys (CMK) for encryption. The key in Key Vault is accidentally disabled. What happens to blob reads?',
    options: opts4(
      'Reads succeed using a cached key for a few hours.',
      'Reads start failing because the storage service cannot wrap/unwrap data using the disabled key.',
      'Blobs auto-decrypt with the default platform key.',
      'Nothing — only writes fail.'
    ),
    correct: ['b'],
    explanation: 'When the CMK is disabled or revoked, the storage service cannot access the key encryption key, so both reads and writes that require key access begin to fail. This is by design for revocation semantics.',
    references: [REF_STG_ACC, REF_STG_KEYS]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command-line tool offers a parallelized sync mode similar to rsync between a local directory and a blob container?',
    options: opts4(
      'azcopy sync',
      'Robocopy /MIR',
      'rsync --azure',
      'Storage Explorer sync wizard'
    ),
    correct: ['a'],
    explanation: '`azcopy sync` mirrors a local directory with a blob container, copying only changes. Robocopy is Windows-local, rsync has no native Azure backend, and Storage Explorer does not have a CLI sync command.',
    references: [REF_AZCOPY]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want infrequently accessed data older than 90 days moved to Cool tier and then to Archive after 365 days. Which feature automates this?',
    options: opts4(
      'Lifecycle management rules on the storage account',
      'A daily PowerShell script',
      'Azure Backup retention policy',
      'Storage account replication'
    ),
    correct: ['a'],
    explanation: 'Lifecycle management rules use age-based filters to transition blobs between tiers (Cool, Cold, Archive) automatically. A custom script is unnecessary; Backup retention and replication are unrelated.',
    references: [REF_BLOB_LIFECYCLE]
  },
  {
    domain: STORAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Your application reads many small files from an Azure Files share and complains about latency. Which change yields the largest improvement?',
    options: opts4(
      'Switch the share from Standard (HDD) to Premium (SSD) FileStorage account',
      'Add more storage account access keys',
      'Enable geo-redundant storage (GRS)',
      'Increase the storage account access tier'
    ),
    correct: ['a'],
    explanation: 'Premium Azure Files (SSD) drastically reduces latency for small-file workloads. Adding keys, enabling GRS, or changing tiers does not improve file-share latency.',
    references: [REF_FILES, REF_STG_KIND]
  },
  {
    domain: STORAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which storage account property controls whether you can authorize requests using Microsoft Entra ID (in addition to or instead of account keys)?',
    options: opts4(
      'Default to Entra authorization (in the Configuration blade) and assign appropriate data-plane RBAC roles like "Storage Blob Data Contributor"',
      'Disable HTTPS',
      'Set redundancy to GRS',
      'Enable static website hosting'
    ),
    correct: ['a'],
    explanation: 'Entra ID-based data-plane access uses RBAC roles on the storage account or container; you can also set "default to Entra" in Configuration to prefer it in the portal. HTTPS, GRS and static websites are unrelated to authorization.',
    references: [REF_STG_ACC, REF_RBAC]
  },

  // ── Compute (15) ──
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure compute service runs short, event-driven code without provisioning servers and bills per execution?',
    options: opts4(
      'Azure Virtual Machines',
      'Azure Functions (Consumption plan)',
      'Azure Kubernetes Service',
      'Azure Container Registry'
    ),
    correct: ['b'],
    explanation: 'Azure Functions Consumption plan is the serverless execution model with per-execution billing. VMs are always running, AKS hosts clusters, ACR stores images.',
    references: [REF_APPSVC]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure VM feature ensures Microsoft will not co-locate your VMs with another customer\'s VMs on the same physical host?',
    options: opts4(
      'Azure Dedicated Host',
      'Availability set',
      'VM Scale Set',
      'Standard SSD'
    ),
    correct: ['a'],
    explanation: 'Azure Dedicated Host gives you a single-tenant physical server for your VMs, useful for compliance or licensing. Availability sets and scale sets are about availability/scale, not tenancy. Disk SKU is unrelated.',
    references: [REF_VM, REF_VM_SIZE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In an App Service plan, slot swaps fail to keep environment-specific app settings tied to the slot. Which feature solves this?',
    options: opts4(
      'Mark specific app settings and connection strings as "slot setting" (deployment slot setting) so they remain with the slot during swap',
      'Use Storage queues to pass settings',
      'Always restart after swap',
      'Disable Continuous Deployment'
    ),
    correct: ['a'],
    explanation: 'Marking a setting as a "deployment slot setting" pins it to the slot during swap, so production-only secrets stay in production after a swap. Restarts and CD toggles do not solve this.',
    references: [REF_APPSVC]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure VM scale sets in Flexible orchestration mode.',
    options: opts4(
      'Each VM is created as a standard VM and gets its own resource ID.',
      'Flexible mode supports fault domains and zones for high availability.',
      'Flexible mode is the recommended orchestration mode for most new scale sets.',
      'Flexible mode cannot use VM extensions.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Flexible orchestration treats VMs as standard resources, supports FDs/zones, and is the recommended default. VM extensions work in flexible mode. Uniform mode still exists but is legacy for many scenarios.',
    references: [REF_VMSS, REF_VM]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to redeploy a VM whose OS disk became corrupted, preserving the original IP and NIC. Which option in the portal is correct?',
    options: opts4(
      'Redeploy (which moves the VM to a new host and reboots)',
      'Stop deallocate then change region',
      'Delete and recreate the entire VM',
      'Convert to Spot'
    ),
    correct: ['a'],
    explanation: 'Redeploy moves the VM to a new Azure host while keeping its disks, NIC, and IP, often resolving host-side issues. The other options are too disruptive or unrelated.',
    references: [REF_VM]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure storage option for a VM is required to use Azure Site Recovery replication?',
    options: opts4(
      'Managed disks (or unmanaged supported via legacy)',
      'Cool tier blobs only',
      'Premium files only',
      'Archive tier blobs'
    ),
    correct: ['a'],
    explanation: 'ASR replicates VMs using managed disks (recommended); some legacy unmanaged configurations exist but are deprecated. Cool tier blobs, premium files, and archive tier are not VM disk types.',
    references: [REF_ASR, REF_VM_DISK]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to ensure that all VMs in a subscription have endpoint protection (e.g., Microsoft Defender for Cloud agent) installed automatically when they are created. Which mechanism best fits?',
    options: opts4(
      'An Azure Policy with the deployIfNotExists effect that installs the extension if missing',
      'A manual playbook for each new VM',
      'Conditional Access',
      'A Recovery Services vault'
    ),
    correct: ['a'],
    explanation: 'deployIfNotExists policies use a managed identity to ensure desired-state — installing a missing extension on creation. Manual playbooks are error-prone; CA and RSV are unrelated.',
    references: [REF_POLICY_EFFECTS, REF_VM_EXT]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You\'re moving a VM from one region to another for compliance. Which Azure tool orchestrates VM replication and cutover between regions?',
    options: opts4(
      'Azure Site Recovery (or Azure Resource Mover)',
      'Azure Backup',
      'Storage Explorer',
      'Cosmos DB Migration Tool'
    ),
    correct: ['a'],
    explanation: 'ASR (or Azure Resource Mover) replicates and cuts over VMs between regions. Backup restores within a region. Storage Explorer is a file GUI. Cosmos Migration Tool is for documents.',
    references: [REF_ASR]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'A new VM template uses a Bicep parameter for adminPassword. Which option avoids storing the password in source control?',
    options: opts4(
      'Use a Key Vault reference (parameters file references a secret URI) so the value is fetched at deploy time',
      'Hardcode it in the Bicep file',
      'Email the password between team members',
      'Disable the password requirement'
    ),
    correct: ['a'],
    explanation: 'Key Vault references in parameter files let ARM/Bicep deployments fetch secrets at deployment time without checking them into source. Hardcoding/emailing secrets is insecure; disabling auth is not acceptable.',
    references: [REF_BICEP, REF_ARM_TEMPLATE]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to scale containers based on RabbitMQ queue length. Which Azure container service has first-class KEDA support?',
    options: opts4(
      'Azure Container Apps',
      'Azure Container Instances',
      'Azure App Service free tier',
      'Azure Functions Dedicated plan'
    ),
    correct: ['a'],
    explanation: 'Azure Container Apps embeds KEDA for event-driven scale rules (queues, HTTP, custom). ACI is a single container without KEDA. App Service free and Functions Dedicated plans are unrelated.',
    references: [REF_AKS, REF_APPSVC]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'You can\'t pull an image from ACR to your AKS cluster. Which authorization is typically missing for the cluster\'s kubelet identity?',
    options: opts4(
      'AcrPull role on the registry, granted to the cluster\'s kubelet managed identity (or use az aks update --attach-acr)',
      'Owner role on the subscription',
      'Storage Blob Data Reader on the AKS cluster',
      'Reader on Resource Manager only'
    ),
    correct: ['a'],
    explanation: 'AKS uses its kubelet managed identity (or service principal) to pull images; that identity must hold AcrPull on the ACR. `az aks update --attach-acr` automates the role assignment.',
    references: [REF_AKS, REF_ACR, REF_RBAC]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure feature lets you reuse Windows Server and SQL Server licenses with Software Assurance on Azure VMs to reduce cost?',
    options: opts4(
      'Azure Hybrid Benefit',
      'Spot pricing',
      'Reserved capacity for blobs',
      'Dev/Test offer for storage accounts only'
    ),
    correct: ['a'],
    explanation: 'Azure Hybrid Benefit applies on-prem Windows/SQL licenses with SA to reduce Azure compute cost. Spot, reserved blob capacity, and Dev/Test storage offers do not provide license discounts.',
    references: [REF_VM]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to ensure all VMs are patched monthly on a specific maintenance window. Which Azure service centralizes this?',
    options: opts4(
      'Azure Update Manager with maintenance configurations',
      'Recovery Services vault',
      'Application Gateway',
      'Storage Explorer'
    ),
    correct: ['a'],
    explanation: 'Azure Update Manager schedules patch deployments with maintenance configurations across Azure and Arc-enabled VMs. The other services do not patch.',
    references: [REF_UPDATE_MGR]
  },
  {
    domain: COMPUTE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which option creates a snapshot of a managed disk to a new managed disk for backup or test/dev cloning?',
    options: opts4(
      'Disk snapshot (Microsoft.Compute/snapshots) then create a managed disk from it',
      'Storage account soft delete',
      'Activity log export',
      'Bicep template parameter rotation'
    ),
    correct: ['a'],
    explanation: 'A managed disk snapshot is a point-in-time copy stored as a Compute snapshot resource; you can then create a new managed disk from it. The other options are unrelated.',
    references: [REF_VM_DISK]
  },
  {
    domain: COMPUTE, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload spreads VMs across two Availability Zones in the same region. The region experiences a single-zone power event. What is expected?',
    options: opts4(
      'Both zones are affected; the workload fails entirely.',
      'Only the affected zone\'s VMs are impacted; VMs in the other zone continue to serve traffic.',
      'Microsoft automatically restores all VMs across the public internet.',
      'The VMs are migrated to another region.'
    ),
    correct: ['b'],
    explanation: 'Availability Zones provide physical isolation (power, cooling, network). A single-zone failure should not affect VMs in other zones in the region. Cross-region failover requires ASR.',
    references: [REF_VM_AZ, REF_ASR]
  },

  // ── Networking (14) ──
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which load balancing service is best for DNS-based routing across globally distributed regions (e.g., direct users to the closest healthy region)?',
    options: opts4(
      'Traffic Manager',
      'Internal Load Balancer',
      'Application Gateway',
      'NAT Gateway'
    ),
    correct: ['a'],
    explanation: 'Traffic Manager is a DNS-based load balancer with routing methods (Performance, Geographic, Priority, Weighted). Internal LB is regional L4. App Gateway is regional L7. NAT Gateway is outbound SNAT.',
    references: [REF_LB, REF_FRONTDOOR]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single global IP that load balances HTTPS to backends in three regions with edge TLS termination and acceleration. Which service?',
    options: opts4(
      'Azure Front Door',
      'Traffic Manager',
      'Cross-region Standard Load Balancer (regional only)',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Front Door is the global L7 service with a single anycast IP, edge TLS, WAF, and intelligent routing. Traffic Manager is DNS-only. LB is regional. Bastion is for RDP/SSH.',
    references: [REF_FRONTDOOR]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Two VMs in the same subnet cannot ping each other. NSG rules show ICMP Inbound denied by default. Which two changes will allow ICMP between them?',
    options: opts4(
      'Add an NSG rule allowing ICMP from VirtualNetwork to VirtualNetwork at high priority',
      'Disable Windows Firewall on both VMs if Windows; ensure no NSG denies ICMP between them (default rule "AllowVnetInBound" should allow it)',
      'Change region',
      'Convert the subnet to /29'
    ),
    correct: ['b'],
    explanation: 'Default NSG rules allow VirtualNetwork-to-VirtualNetwork traffic. ICMP failures within a subnet are typically guest OS firewalls (Windows Firewall blocks ICMP by default). Region/CIDR are not relevant.',
    references: [REF_NSG, REF_VNET]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service provides DNS resolution that conditionally forwards to on-prem DNS servers from within an Azure VNet?',
    options: opts4(
      'Azure DNS Private Resolver with outbound endpoints',
      'Azure Public DNS only',
      'Custom DNS on every VM',
      'Service tags'
    ),
    correct: ['a'],
    explanation: 'Azure DNS Private Resolver provides inbound/outbound endpoints and conditional forwarders to bridge on-prem and Azure DNS without managing custom DNS VMs. Public DNS doesn\'t do conditional forwarding; per-VM DNS doesn\'t scale.',
    references: [REF_DNS, REF_PRIVATE_DNS]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'A NSG rule allows TCP 443 from a specific public IP range to a VM, but traffic is dropped. Which Network Watcher tool helps verify which rule matched and the effective rules applied?',
    options: opts4(
      'IP flow verify and Effective security rules on the NIC',
      'Connection Monitor only',
      'Activity log',
      'NSG flow logs only'
    ),
    correct: ['a'],
    explanation: 'IP flow verify simulates a packet and tells you which NSG rule allowed/denied it. Effective security rules show the merged rule set applied to the NIC. Connection Monitor measures reachability over time; flow logs are bulk telemetry.',
    references: [REF_NW_WATCH, REF_NSG]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure feature lets you deploy a regional next-generation firewall as a managed service with FQDN filtering and threat intelligence?',
    options: opts4(
      'Azure Firewall (Standard/Premium)',
      'NSG only',
      'Network Watcher',
      'NAT Gateway'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall is a stateful, managed next-gen firewall with FQDN filtering, threat intel, and TLS inspection (Premium). NSGs are 5-tuple filters; Network Watcher is diagnostics; NAT Gateway is for outbound SNAT only.',
    references: [REF_VNET]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to ensure outbound traffic from a subnet uses a predictable public IP for partner allow-listing. Which approach is recommended?',
    options: opts4(
      'Associate a NAT Gateway with the subnet and attach static public IP(s)',
      'Assign a public IP to every VM',
      'Use default outbound access (random SNAT)',
      'Disable internet access entirely'
    ),
    correct: ['a'],
    explanation: 'NAT Gateway provides scalable, predictable outbound SNAT with the public IPs you assign. Per-VM public IPs do not scale and complicate firewall allow-lists. Default outbound access is being deprecated and uses random IPs.',
    references: [REF_NAT, REF_PUBLIC_IP]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure ExpressRoute.',
    options: opts4(
      'ExpressRoute connections do not traverse the public internet.',
      'ExpressRoute supports private peering (to VNets) and Microsoft peering (to Microsoft 365/Azure PaaS services).',
      'ExpressRoute requires a connectivity provider or ExpressRoute Direct port.',
      'ExpressRoute is encrypted end-to-end by default at L3.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'ExpressRoute is private (not public), supports private and Microsoft peering, and requires a provider or Direct port. It is NOT encrypted at L3 by default; customers can add IPSec over ExpressRoute if needed.',
    references: [REF_EXPRESSROUTE]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a load balancer for internal apps inside a VNet (private frontend IP). Which Azure Load Balancer type fits?',
    options: opts4(
      'Internal Load Balancer (Standard)',
      'Public Load Balancer (Basic)',
      'Gateway Load Balancer',
      'Cross-region Load Balancer only'
    ),
    correct: ['a'],
    explanation: 'Internal LB has a private frontend IP for VNet-local distribution. Public LB has a public frontend. Gateway LB is for NVA chaining. Cross-region is global.',
    references: [REF_LB]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A web app behind Front Door is hitting the origin too often. Which feature reduces backend load?',
    options: opts4(
      'Edge caching policies on Front Door',
      'NSG egress rate limits',
      'Application Gateway WAF Core Rule Set',
      'NAT Gateway capacity'
    ),
    correct: ['a'],
    explanation: 'Front Door supports caching at the edge POPs for cacheable responses, reducing origin load. NSGs, App Gateway WAF, and NAT Gateway do not provide caching.',
    references: [REF_FRONTDOOR]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature lets you peer two VNets in different Microsoft Entra tenants?',
    options: opts4(
      'Cross-tenant VNet peering (configure with resource IDs and authorize via role assignments in both directions)',
      'Service endpoint sharing',
      'ExpressRoute Direct only',
      'Tenant-level NSG'
    ),
    correct: ['a'],
    explanation: 'VNet peering supports cross-tenant configurations using resource IDs and explicit role assignments in both tenants (e.g., Network Contributor). Service endpoints, ExpressRoute, and "tenant-level NSG" are not peering mechanisms.',
    references: [REF_PEERING]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'A web app at https://app.contoso.com behind App Gateway WAF must reject requests with SQL injection patterns. Which WAF mode should be used for protection rather than just logging?',
    options: opts4(
      'Prevention (Block) mode',
      'Detection (Log only) mode',
      'Off',
      'Audit-only'
    ),
    correct: ['a'],
    explanation: 'Prevention mode blocks requests matching WAF rules. Detection mode only logs them. "Off" disables WAF, and "Audit-only" is not a separate WAF mode.',
    references: [REF_APPGW]
  },
  {
    domain: NETWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'Two on-prem sites need redundant connectivity to a single Azure VNet. Which configuration meets this?',
    options: opts4(
      'Two ExpressRoute circuits in different peering locations to the same VNet, with BGP for failover (or active/active VPN gateways with multiple S2S connections)',
      'A single ExpressRoute circuit only',
      'A single S2S VPN connection',
      'NSG with priority 65000'
    ),
    correct: ['a'],
    explanation: 'Two ExpressRoute circuits (or active/active VPN with multiple S2S connections) using BGP provide redundancy. A single circuit/connection has no redundancy. NSG priorities do not provide WAN redundancy.',
    references: [REF_EXPRESSROUTE, REF_VPN]
  },
  {
    domain: NETWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a private, scalable outbound static IP set for a subnet of VMs that must reach a partner API allow-listed by source IP. Which Azure resource provides this with a deterministic SNAT pool?',
    options: opts4(
      'A NAT Gateway with one or more Standard SKU public IPs (or a public IP prefix) attached to the subnet',
      'Per-VM public IPs assigned dynamically',
      'Service endpoint to Microsoft.Storage',
      'Application Gateway frontend'
    ),
    correct: ['a'],
    explanation: 'NAT Gateway gives a subnet a deterministic SNAT pool from the attached Standard public IPs/prefix, so partners can allow-list those IPs. Per-VM dynamic IPs change; service endpoints only reach Microsoft PaaS; App Gateway is inbound L7.',
    references: [REF_NAT, REF_PUBLIC_IP]
  },

  // ── Monitor (10) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure Monitor metric alert signal type is best for "average CPU > 80% for 5 minutes" on multiple VMs at once?',
    options: opts4(
      'A metric alert with multi-resource scope and dynamic or static threshold',
      'A log alert query that re-runs every minute',
      'A Service Health alert',
      'An NSG flow log alert'
    ),
    correct: ['a'],
    explanation: 'Metric alerts support multi-resource scope (multiple VMs in one rule) with static or dynamic thresholds and lower cost than log alerts. Log alerts work but cost more for simple metric-based scenarios. Service Health and flow logs are unrelated.',
    references: [REF_ALERTS, REF_METRICS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable diagnostic settings on a storage account to send logs to a Log Analytics workspace. Which kind of logs can be sent?',
    options: opts4(
      'Resource logs (e.g., StorageRead, StorageWrite, StorageDelete) and metrics',
      'Only Activity log entries',
      'Only NSG flow logs',
      'Only Sign-in logs'
    ),
    correct: ['a'],
    explanation: 'Diagnostic settings export per-resource diagnostic logs (resource logs) and platform metrics. Activity log is subscription-level; flow logs are NSG/Network Watcher; sign-in logs are Entra ID.',
    references: [REF_DIAG, REF_LOGS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure Monitor alerts.',
    options: opts4(
      'Alert rules consist of a target/scope, a signal/condition, and one or more action groups.',
      'Alerts have severity levels Sev 0 (critical) through Sev 4 (verbose).',
      'A single alert rule can trigger multiple action groups simultaneously.',
      'An alert can only send email and cannot call a webhook.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Alerts are composed of scope + condition + action groups; severities range Sev 0-4; multiple action groups are allowed. Action groups support webhooks, Functions, Logic Apps, ITSM, voice, SMS, and email.',
    references: [REF_ALERTS, REF_ACTION_GROUPS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A storage account in westeurope has degraded performance reported in Azure Service Health. Where do affected customers see personalized impact in their resource view?',
    options: opts4(
      'Resource Health for the storage account',
      'NSG flow logs',
      'Activity log only',
      'App Insights live metrics'
    ),
    correct: ['a'],
    explanation: 'Resource Health surfaces the personalized impact of platform issues on individual resources. Service Health is the platform-wide view; Activity log records change events; App Insights is for app telemetry.',
    references: [REF_RESOURCE_HEALTH, REF_SVC_HEALTH]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure Backup option for VMs allows you to retain weekly recovery points beyond the daily retention horizon?',
    options: opts4(
      'A backup policy that includes weekly, monthly, and yearly retention rules',
      'Soft delete on the storage account',
      'NSG flow log retention',
      'Activity log diagnostic settings retention'
    ),
    correct: ['a'],
    explanation: 'Azure Backup policies define daily/weekly/monthly/yearly retention windows for recovery points. Soft delete, flow log retention, and Activity log diagnostic retention are different concepts.',
    references: [REF_VM_BACKUP, REF_RECOVERY_SVC]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to track unusual sign-in patterns and risky users in Microsoft Entra ID for SecOps. Which feature surfaces this?',
    options: opts4(
      'Microsoft Entra ID Protection (with risk detections) feeding into Sentinel or alerts',
      'Resource Health',
      'NSG flow logs',
      'Storage diagnostic logs'
    ),
    correct: ['a'],
    explanation: 'Entra ID Protection detects risky sign-ins and risky users with machine-learning signals and can feed Conditional Access and Sentinel. The other options are resource/network/storage-centric.',
    references: [REF_CA, REF_AAD]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command-line tool can run KQL queries against a Log Analytics workspace from a CI/CD pipeline?',
    options: opts4(
      'az monitor log-analytics query',
      'docker run kql',
      'kubectl logs',
      'Storage Explorer CLI'
    ),
    correct: ['a'],
    explanation: '`az monitor log-analytics query` runs KQL from the Azure CLI. The other commands are unrelated (Kubernetes, Docker, storage GUI).',
    references: [REF_LOGS, REF_LAW]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to archive Activity log entries for 7 years for compliance. Which destination is appropriate?',
    options: opts4(
      'Diagnostic setting from the subscription Activity log to a storage account with retention or Log Analytics with long-term retention/archive',
      'A custom VM running ELK',
      'Microsoft Teams channel only',
      'Email distribution group'
    ),
    correct: ['a'],
    explanation: 'Diagnostic settings can route Activity log to storage with multi-year retention or Log Analytics with archive tiering for cost-effective long-term retention. Self-hosted ELK, Teams, or email are not compliance-grade.',
    references: [REF_DIAG, REF_MONITOR]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A VM Backup repeatedly fails with an extension error. Which step is typically the first remediation?',
    options: opts4(
      'Reinstall or update the VMSnapshot/IaaSVMExtension on the VM',
      'Recreate the entire VM',
      'Move the VM to another region',
      'Switch the storage account to GRS'
    ),
    correct: ['a'],
    explanation: 'Backup uses an in-guest extension. Reinstalling/updating the extension (sometimes via the portal "Retry" or removing and re-adding) typically resolves backup failures. Recreate/move/replication are heavy-handed and unrelated.',
    references: [REF_VM_BACKUP, REF_VM_EXT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to monitor the SSL certificate expiry of a public website. Which Azure feature is purpose-built?',
    options: opts4(
      'Application Insights availability test with SSL expiry validation',
      'NSG flow logs',
      'Activity log',
      'Backup policy'
    ),
    correct: ['a'],
    explanation: 'App Insights availability tests (standard tests) can validate SSL certificate validity/expiry and alert on it. Flow logs/Activity log/Backup policy do not check certificates.',
    references: [REF_MONITOR]
  }
];

const AZ104_DOMAINS = [
  { name: IDENTITY, weight: 22 },
  { name: STORAGE, weight: 18 },
  { name: COMPUTE, weight: 23 },
  { name: NETWORK, weight: 22 },
  { name: MONITOR, weight: 15 }
];

const AZ104_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-az-104-p1',
    code: 'AZ-104-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 100-minute, 65-question, blueprint-weighted set covering Azure identities & governance, storage, compute, virtual networking, and monitoring & maintenance.',
    questions: P1
  },
  {
    slug: 'microsoft-az-104-p2',
    code: 'AZ-104-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 100-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-az-104-p3',
    code: 'AZ-104-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 100-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const AZ104_BUNDLE = {
  slug: 'microsoft-az-104',
  title: 'Microsoft Azure Administrator (AZ-104)',
  description: 'All 3 AZ-104 practice exams in one bundle — covering Azure identities & governance, storage, compute, virtual networking, and monitoring & maintenance, aligned to the official Microsoft Azure Administrator (AZ-104) study guide.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the AZ-104 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:az104-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedAz104(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure cloud development, infrastructure, security, and the role-based Azure certification track including the Azure Administrator (AZ-104) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure cloud development, infrastructure, security, and the role-based Azure certification track including the Azure Administrator (AZ-104) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of AZ104_EXAMS) {
    const title = `Microsoft Azure Administrator (AZ-104) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Microsoft AZ-104 study guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 100,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: AZ104_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:az104-seed' } });
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
          generatedBy: 'manual:az104-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: AZ104_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: AZ104_BUNDLE.slug },
    update: {
      title: AZ104_BUNDLE.title,
      description: AZ104_BUNDLE.description,
      price: AZ104_BUNDLE.price,
      priceVoucher: AZ104_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: AZ104_BUNDLE.slug,
      title: AZ104_BUNDLE.title,
      description: AZ104_BUNDLE.description,
      price: AZ104_BUNDLE.price,
      priceVoucher: AZ104_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-az-104-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-az-104-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-az-104-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-az-104-p1', tier: 'VOUCHER' as const, position: 4 }
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




