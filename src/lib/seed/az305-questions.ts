/**
 * AZ-305 bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:az305-seed'` and upserts catalog rows.
 *
 * Exported as `seedAz305(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/az305.ts`) and the protected
 * admin API (`/api/admin/seed-az305`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the AZ-305 (Designing Microsoft Azure Infrastructure Solutions)
 * domain blueprint:
 *   - Design identity, governance, and monitoring solutions — 28% (18)
 *   - Design data storage solutions                          — 24% (16)
 *   - Design business continuity solutions                   — 18% (12)
 *   - Design infrastructure solutions                        — 30% (19)
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

const IDGM = 'Design identity, governance, and monitoring solutions';
const DATA = 'Design data storage solutions';
const BCDR = 'Design business continuity solutions';
const INFRA = 'Design infrastructure solutions';

const REF_ARCH = { label: 'Microsoft Learn — Azure Architecture Center', url: 'https://learn.microsoft.com/azure/architecture/' };
const REF_WAF = { label: 'Microsoft Learn — Azure Well-Architected Framework', url: 'https://learn.microsoft.com/azure/well-architected/' };
const REF_ENTRA = { label: 'Microsoft Learn — Microsoft Entra ID', url: 'https://learn.microsoft.com/entra/fundamentals/whatis' };
const REF_CA = { label: 'Microsoft Learn — Conditional Access overview', url: 'https://learn.microsoft.com/entra/identity/conditional-access/overview' };
const REF_PIM = { label: 'Microsoft Learn — Privileged Identity Management', url: 'https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-configure' };
const REF_MI = { label: 'Microsoft Learn — Managed identities for Azure resources', url: 'https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview' };
const REF_RBAC = { label: 'Microsoft Learn — Azure RBAC', url: 'https://learn.microsoft.com/azure/role-based-access-control/overview' };
const REF_POLICY = { label: 'Microsoft Learn — Azure Policy overview', url: 'https://learn.microsoft.com/azure/governance/policy/overview' };
const REF_MG = { label: 'Microsoft Learn — Management groups', url: 'https://learn.microsoft.com/azure/governance/management-groups/overview' };
const REF_BLUEPRINT = { label: 'Microsoft Learn — Azure landing zones', url: 'https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/' };
const REF_MONITOR = { label: 'Microsoft Learn — Azure Monitor overview', url: 'https://learn.microsoft.com/azure/azure-monitor/overview' };
const REF_LAW = { label: 'Microsoft Learn — Log Analytics workspace', url: 'https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-workspace-overview' };
const REF_DEFENDER = { label: 'Microsoft Learn — Microsoft Defender for Cloud', url: 'https://learn.microsoft.com/azure/defender-for-cloud/defender-for-cloud-introduction' };
const REF_COST = { label: 'Microsoft Learn — Microsoft Cost Management', url: 'https://learn.microsoft.com/azure/cost-management-billing/cost-management-billing-overview' };
const REF_STORAGE = { label: 'Microsoft Learn — Azure Storage account overview', url: 'https://learn.microsoft.com/azure/storage/common/storage-account-overview' };
const REF_BLOB = { label: 'Microsoft Learn — Azure Blob Storage', url: 'https://learn.microsoft.com/azure/storage/blobs/storage-blobs-introduction' };
const REF_REDUNDANCY = { label: 'Microsoft Learn — Azure Storage redundancy', url: 'https://learn.microsoft.com/azure/storage/common/storage-redundancy' };
const REF_LIFECYCLE = { label: 'Microsoft Learn — Blob lifecycle management', url: 'https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-overview' };
const REF_COSMOS = { label: 'Microsoft Learn — Azure Cosmos DB overview', url: 'https://learn.microsoft.com/azure/cosmos-db/introduction' };
const REF_COSMOS_CONSISTENCY = { label: 'Microsoft Learn — Cosmos DB consistency levels', url: 'https://learn.microsoft.com/azure/cosmos-db/consistency-levels' };
const REF_SQL = { label: 'Microsoft Learn — Azure SQL Database', url: 'https://learn.microsoft.com/azure/azure-sql/database/sql-database-paas-overview' };
const REF_SQLMI = { label: 'Microsoft Learn — Azure SQL Managed Instance', url: 'https://learn.microsoft.com/azure/azure-sql/managed-instance/sql-managed-instance-paas-overview' };
const REF_DATALAKE = { label: 'Microsoft Learn — Azure Data Lake Storage', url: 'https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction' };
const REF_SYNAPSE = { label: 'Microsoft Learn — Azure Synapse Analytics', url: 'https://learn.microsoft.com/azure/synapse-analytics/overview-what-is' };
const REF_PRIVATELINK = { label: 'Microsoft Learn — Azure Private Link', url: 'https://learn.microsoft.com/azure/private-link/private-link-overview' };
const REF_BACKUP = { label: 'Microsoft Learn — Azure Backup overview', url: 'https://learn.microsoft.com/azure/backup/backup-overview' };
const REF_ASR = { label: 'Microsoft Learn — Azure Site Recovery overview', url: 'https://learn.microsoft.com/azure/site-recovery/site-recovery-overview' };
const REF_AZREGIONS = { label: 'Microsoft Learn — Azure regions and availability zones', url: 'https://learn.microsoft.com/azure/reliability/availability-zones-overview' };
const REF_VMSLA = { label: 'Microsoft Learn — Reliability for Azure Virtual Machines', url: 'https://learn.microsoft.com/azure/reliability/reliability-virtual-machines' };
const REF_TM = { label: 'Microsoft Learn — Azure Traffic Manager', url: 'https://learn.microsoft.com/azure/traffic-manager/traffic-manager-overview' };
const REF_FRONTDOOR = { label: 'Microsoft Learn — Azure Front Door', url: 'https://learn.microsoft.com/azure/frontdoor/front-door-overview' };
const REF_LB = { label: 'Microsoft Learn — Azure Load Balancer', url: 'https://learn.microsoft.com/azure/load-balancer/load-balancer-overview' };
const REF_APPGW = { label: 'Microsoft Learn — Azure Application Gateway', url: 'https://learn.microsoft.com/azure/application-gateway/overview' };
const REF_VNET = { label: 'Microsoft Learn — Azure Virtual Network', url: 'https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview' };
const REF_VWAN = { label: 'Microsoft Learn — Azure Virtual WAN', url: 'https://learn.microsoft.com/azure/virtual-wan/virtual-wan-about' };
const REF_AKS = { label: 'Microsoft Learn — Azure Kubernetes Service', url: 'https://learn.microsoft.com/azure/aks/what-is-aks' };
const REF_APPSVC = { label: 'Microsoft Learn — Azure App Service overview', url: 'https://learn.microsoft.com/azure/app-service/overview' };
const REF_FUNCTIONS = { label: 'Microsoft Learn — Azure Functions overview', url: 'https://learn.microsoft.com/azure/azure-functions/functions-overview' };
const REF_CONTAINERAPPS = { label: 'Microsoft Learn — Azure Container Apps', url: 'https://learn.microsoft.com/azure/container-apps/overview' };
const REF_SERVICEBUS = { label: 'Microsoft Learn — Azure Service Bus', url: 'https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview' };
const REF_EVENTGRID = { label: 'Microsoft Learn — Azure Event Grid', url: 'https://learn.microsoft.com/azure/event-grid/overview' };
const REF_EVENTHUBS = { label: 'Microsoft Learn — Azure Event Hubs', url: 'https://learn.microsoft.com/azure/event-hubs/event-hubs-about' };
const REF_MIGRATE = { label: 'Microsoft Learn — Azure Migrate overview', url: 'https://learn.microsoft.com/azure/migrate/migrate-services-overview' };
const REF_KEYVAULT = { label: 'Microsoft Learn — Azure Key Vault overview', url: 'https://learn.microsoft.com/azure/key-vault/general/overview' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Design identity, governance, and monitoring (18) ──
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A solution must allow an Azure VM to read secrets from Azure Key Vault without storing any credentials in code or configuration. Which identity design should you recommend?',
    options: opts4(
      'A service principal with a client secret stored in the app settings',
      'A system-assigned managed identity on the VM granted access to the Key Vault',
      'A shared Microsoft Entra user account whose password is in Key Vault',
      'A SAS token embedded in the application'
    ),
    correct: ['b'],
    explanation: 'A system-assigned managed identity gives the VM an Entra ID identity whose lifecycle is tied to the VM and requires no stored credentials. A service principal with a secret still requires storing and rotating the secret; shared accounts and SAS tokens are anti-patterns for resource-to-resource auth.',
    references: [REF_MI, REF_KEYVAULT]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'You must enforce that all global administrators activate their role only when needed, with approval and time limits. Which Microsoft Entra capability should the design use?',
    options: opts4(
      'Conditional Access with sign-in risk policy',
      'Privileged Identity Management (PIM) with eligible assignments',
      'Entra ID self-service password reset',
      'Azure RBAC custom roles'
    ),
    correct: ['b'],
    explanation: 'PIM provides just-in-time, time-bound, approval-gated activation of privileged roles, satisfying least-privilege for global admins. Conditional Access controls sign-in conditions but not role activation lifecycle; SSPR and custom RBAC roles do not provide JIT activation.',
    references: [REF_PIM]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL controls that belong in a Conditional Access design that blocks access to the Azure portal from outside trusted locations while still allowing emergency access.',
    options: opts4(
      'A named-location-based Conditional Access policy targeting the Microsoft Azure Management cloud app',
      'A break-glass (emergency access) account excluded from the policy',
      'Disabling Microsoft Entra ID entirely for the tenant',
      'Requiring multifactor authentication for non-trusted-location sign-ins'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A location-scoped policy on the Azure Management app enforces the network restriction, an excluded break-glass account prevents lockout, and MFA strengthens any allowed sign-ins. Disabling Entra ID is not a valid control and would break all authentication.',
    references: [REF_CA]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants policy guardrails applied consistently to every current and future subscription in the organization. Where should the Azure Policy assignments be scoped?',
    options: opts4(
      'On each subscription individually',
      'At the root/management group level so they inherit to all subscriptions',
      'On individual resource groups only',
      'On a single reference resource'
    ),
    correct: ['b'],
    explanation: 'Assigning policy at a management group propagates the assignment to all child subscriptions, including ones created later, ensuring consistent, future-proof guardrails. Per-subscription or per-resource-group assignment does not automatically cover new subscriptions.',
    references: [REF_POLICY, REF_MG]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An Azure Policy with the "deny" effect can prevent the creation of resources in non-approved regions.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The "allowed locations" built-in policy with a deny effect blocks resource creation in regions outside the approved list, a common governance guardrail. Audit-only effects would log but not block.',
    references: [REF_POLICY]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a centralized, queryable store for platform logs and metrics from VMs, App Service, and Azure activity, retained for 1 year for security investigations. Which design element is central?',
    options: opts4(
      'A storage account configured only for diagnostic settings',
      'A Log Analytics workspace as the destination for diagnostic settings, with retention configured',
      'Application Insights only',
      'Network Watcher packet capture'
    ),
    correct: ['b'],
    explanation: 'A Log Analytics workspace is the central KQL-queryable store; diagnostic settings route resource and activity logs there and retention can be set per table. A storage account alone is archive-only and not queryable; App Insights covers app telemetry, not platform logs broadly.',
    references: [REF_LAW, REF_MONITOR]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must restrict which resource SKUs teams can deploy and automatically tag resources with a cost center. Which combination is appropriate?',
    options: opts4(
      'Azure Blueprints only',
      'Azure Policy with allowed-SKU deny rules plus a "modify"/"append" policy for tags',
      'Azure RBAC role assignments at resource scope',
      'Resource locks on every resource group'
    ),
    correct: ['b'],
    explanation: 'Azure Policy can deny disallowed SKUs and use modify/append effects to enforce or add required tags such as a cost center. RBAC controls who can act but not which SKUs or tag values; resource locks prevent deletion/modification, not SKU governance.',
    references: [REF_POLICY, REF_COST]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service should the monitoring design use to receive automated security posture recommendations and regulatory compliance scoring for Azure resources?',
    options: opts4(
      'Azure Advisor only',
      'Microsoft Defender for Cloud',
      'Azure Service Health',
      'Azure Network Watcher'
    ),
    correct: ['b'],
    explanation: 'Microsoft Defender for Cloud provides Secure Score, security recommendations, and a regulatory compliance dashboard. Advisor gives general best-practice advice, Service Health reports platform incidents, and Network Watcher diagnoses networking.',
    references: [REF_DEFENDER]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'An external partner organization needs scoped access to a single resource group. The design should avoid creating accounts in your tenant. What do you recommend?',
    options: opts4(
      'Create internal user accounts and share passwords',
      'Use Microsoft Entra B2B guest invitations and assign RBAC at the resource group scope',
      'Add the partner to the Global Administrator role',
      'Disable Conditional Access for the partner'
    ),
    correct: ['b'],
    explanation: 'Entra B2B lets partners use their own identities as guests; assigning RBAC at the resource group scope grants least-privilege access. Creating internal accounts, granting Global Admin, or disabling Conditional Access all violate security principles.',
    references: [REF_ENTRA, REF_RBAC]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'A design requires that no user can delete a production storage account even if they have Owner rights, while still allowing data operations. Which mechanism fits?',
    options: opts4(
      'A CanNotDelete resource lock on the storage account',
      'Removing all RBAC assignments',
      'An Azure Policy audit rule',
      'A network security group'
    ),
    correct: ['a'],
    explanation: 'A CanNotDelete lock blocks deletion regardless of RBAC while still permitting read and data-plane operations. Removing RBAC would block legitimate work; an audit policy only logs; an NSG controls network traffic, not deletion.',
    references: [REF_POLICY]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Entra ID managed identities.',
    options: opts4(
      'System-assigned identities are deleted automatically when the resource is deleted.',
      'A user-assigned identity can be shared across multiple resources.',
      'Managed identities require you to store and rotate a client secret.',
      'Managed identities can be granted Azure RBAC roles.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'System-assigned identities share the resource lifecycle; user-assigned identities are standalone and reusable; both can hold RBAC roles. The platform manages credential rotation, so no secret storage/rotation is needed by the developer.',
    references: [REF_MI, REF_RBAC]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The design must alert on-call engineers within minutes when CPU on a critical VM scale set exceeds 90% for 5 minutes. Which Azure Monitor feature should be used?',
    options: opts4(
      'A metric alert rule with an action group',
      'A workbook',
      'A diagnostic setting only',
      'A pinned dashboard tile'
    ),
    correct: ['a'],
    explanation: 'A metric alert rule evaluates the CPU metric against a threshold and triggers an action group (email/SMS/webhook/ITSM) for fast notification. Workbooks and dashboards visualize but do not alert; diagnostic settings only route data.',
    references: [REF_MONITOR]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'An enterprise wants a standardized, repeatable deployment that combines policy assignments, RBAC, and ARM resources for new subscriptions. Which approach best matches the AZ-305 governance recommendation?',
    options: opts4(
      'Manual portal configuration documented in a wiki',
      'An Azure landing zone implementation (e.g., via Bicep/Terraform and Azure Policy)',
      'A single large resource group',
      'Per-team subscriptions with no shared controls'
    ),
    correct: ['b'],
    explanation: 'Landing zones from the Cloud Adoption Framework provide repeatable, governed environment scaffolding combining management groups, policy, RBAC, and networking. Manual processes are not repeatable and ungoverned subscriptions break consistency.',
    references: [REF_BLUEPRINT, REF_MG]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which identity solution should be recommended so an Azure Functions app can authenticate to Azure SQL Database without a connection string password?',
    options: opts4(
      'Store the SQL password in app settings',
      'Use a managed identity for the Function app with an Entra-authenticated SQL contained user',
      'Use the SQL sa account',
      'Embed credentials in the function code'
    ),
    correct: ['b'],
    explanation: 'A managed identity plus an Entra-based contained database user lets the Function authenticate to Azure SQL with no stored password. Storing passwords in settings/code or using the sa account are insecure anti-patterns.',
    references: [REF_MI, REF_SQL]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'You must give a support team the ability to restart VMs in one resource group but not change networking or delete resources. Which design is least-privilege?',
    options: opts4(
      'Assign the Owner role at subscription scope',
      'Assign the built-in Virtual Machine Contributor role at the resource group scope',
      'Assign the Contributor role at subscription scope',
      'Add the team to Global Administrator'
    ),
    correct: ['b'],
    explanation: 'Virtual Machine Contributor at the resource group scope allows VM management (including restart) without networking or broad delete rights, satisfying least privilege. Owner/Contributor at subscription scope and Global Admin grant far too much.',
    references: [REF_RBAC]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A finance team needs proactive notification when monthly Azure spend approaches the allocated budget. Which design element should you include?',
    options: opts4(
      'A Cost Management budget with alert thresholds and an action group',
      'A resource lock on the subscription',
      'An NSG flow log',
      'A Log Analytics query only'
    ),
    correct: ['a'],
    explanation: 'Cost Management budgets define spend limits with percentage thresholds that trigger alerts/actions, enabling proactive cost governance. Locks, NSG flow logs, and standalone queries do not track or alert on spend.',
    references: [REF_COST]
  },
  {
    domain: IDGM, difficulty: 4, type: QType.SINGLE,
    stem: 'A multinational requires that data engineers see audit logs only for their own subscription, while a central security team sees all subscriptions, using one logging platform. Which design balances isolation and central visibility?',
    options: opts4(
      'One Log Analytics workspace per subscription and no central access',
      'A centralized Log Analytics workspace with Azure RBAC and resource-context/table-level access for scoped visibility',
      'No logging to reduce complexity',
      'Export everything to local files'
    ),
    correct: ['b'],
    explanation: 'A central workspace with RBAC plus resource-context or table-level access lets the security team see all data while engineers see only their resources, balancing isolation and central oversight. Fully siloed workspaces remove central visibility; no logging fails compliance.',
    references: [REF_LAW, REF_RBAC]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Azure Policy effect should be used to automatically remediate existing non-compliant resources by deploying a missing diagnostic setting?',
    options: opts4(
      'audit',
      'deny',
      'deployIfNotExists',
      'disabled'
    ),
    correct: ['c'],
    explanation: 'deployIfNotExists triggers a remediation deployment (e.g., adding a diagnostic setting) for resources lacking it. audit only reports, deny blocks new non-compliant resources but cannot fix existing ones, and disabled turns the rule off.',
    references: [REF_POLICY, REF_MONITOR]
  },

  // ── Design data storage solutions (16) ──
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An application stores large, infrequently accessed archive files that must be retained for 7 years at the lowest cost. Which storage design should you recommend?',
    options: opts4(
      'Premium block blob storage',
      'Blob storage in the Archive access tier with a lifecycle policy',
      'Azure SQL Database',
      'Azure Files Premium'
    ),
    correct: ['b'],
    explanation: 'The Archive tier offers the lowest storage cost for rarely accessed data; a lifecycle management policy can auto-move and retain blobs for the required period. SQL, Premium files, and premium blob are far more expensive for cold archival data.',
    references: [REF_BLOB, REF_LIFECYCLE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A globally distributed app needs single-digit-millisecond reads and writes in multiple regions with multi-region writes and a flexible schema. Which database should the design use?',
    options: opts4(
      'Azure SQL Database (single instance)',
      'Azure Cosmos DB with multi-region writes',
      'Azure Database for MySQL single server',
      'Azure Table storage in one region'
    ),
    correct: ['b'],
    explanation: 'Cosmos DB provides turnkey global distribution, multi-region writes, low-latency SLAs, and a schema-flexible model. A single-region SQL or MySQL instance cannot offer multi-region writes; single-region Table storage lacks global low-latency writes.',
    references: [REF_COSMOS]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid statements about Azure Cosmos DB consistency levels.',
    options: opts4(
      'Strong consistency offers the most up-to-date reads but higher latency and cost.',
      'Eventual consistency offers the lowest latency and highest availability.',
      'Session is the default and provides consistency within a client session.',
      'Bounded staleness guarantees zero lag at all times.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Strong gives linearizable reads at higher cost/latency; eventual gives best performance/availability; session is the default. Bounded staleness allows a configured lag window (K versions or T time), so it does not guarantee zero lag.',
    references: [REF_COSMOS_CONSISTENCY]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team is migrating an on-premises SQL Server with cross-database queries, SQL Agent jobs, and CLR. Which Azure data service minimizes refactoring?',
    options: opts4(
      'Azure SQL Database single database',
      'Azure SQL Managed Instance',
      'Azure Cosmos DB',
      'Azure Table storage'
    ),
    correct: ['b'],
    explanation: 'Azure SQL Managed Instance offers near-100% SQL Server engine compatibility including SQL Agent, cross-database queries, and CLR, minimizing refactoring. Single-database SQL lacks instance-level features; Cosmos DB/Table are NoSQL.',
    references: [REF_SQLMI, REF_SQL]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A data platform requires hierarchical namespace, fine-grained POSIX ACLs, and analytics integration for a data lake. Which storage configuration should you recommend?',
    options: opts4(
      'A general-purpose v2 storage account with Azure Data Lake Storage Gen2 (hierarchical namespace enabled)',
      'A classic (v1) storage account',
      'Azure Files standard tier',
      'Azure Queue storage'
    ),
    correct: ['a'],
    explanation: 'ADLS Gen2 on a GPv2 account with hierarchical namespace provides directory semantics, POSIX ACLs, and tight analytics engine integration. v1 accounts, Files, and Queues do not provide a hierarchical analytics-optimized namespace.',
    references: [REF_DATALAKE, REF_STORAGE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Read-access geo-redundant storage (RA-GRS) lets applications read from the secondary region even when the primary is available.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. RA-GRS exposes a read-only secondary endpoint that applications can read from at any time, useful for read-scaling and resilience. Plain GRS replicates but does not expose the secondary for reads unless a failover occurs.',
    references: [REF_REDUNDANCY]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A reporting workload performs heavy analytical queries over terabytes of structured data with massively parallel processing. Which Azure service should the design recommend?',
    options: opts4(
      'Azure SQL Database Basic tier',
      'Azure Synapse Analytics dedicated SQL pool',
      'Azure Cache for Redis',
      'Azure Table storage'
    ),
    correct: ['b'],
    explanation: 'A Synapse dedicated SQL pool provides MPP for large-scale analytical/data-warehouse queries. Basic-tier SQL is for small OLTP, Redis is an in-memory cache, and Table storage is a key-value store not suited to complex analytics.',
    references: [REF_SYNAPSE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A storage account must be reachable only from a specific virtual network with no exposure to the public internet. Which design element should you include?',
    options: opts4(
      'A public endpoint with a strong access key',
      'A private endpoint for the storage account plus disabling public network access',
      'A shared access signature with a short expiry',
      'A CDN profile'
    ),
    correct: ['b'],
    explanation: 'A private endpoint maps the storage account to a private IP in the VNet; disabling public network access removes internet exposure entirely. Access keys/SAS still permit public-network access; a CDN increases exposure.',
    references: [REF_PRIVATELINK, REF_STORAGE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which redundancy option protects storage data against a complete Azure region failure with the data also durable across zones in the primary region?',
    options: opts4(
      'Locally redundant storage (LRS)',
      'Zone-redundant storage (ZRS)',
      'Geo-zone-redundant storage (GZRS)',
      'Premium page blobs'
    ),
    correct: ['c'],
    explanation: 'GZRS combines zone redundancy in the primary region with geo-replication to a secondary region, protecting against both zone and regional failures. LRS is single-datacenter, ZRS is single-region zones only, and premium page blobs are a blob type, not a redundancy mode.',
    references: [REF_REDUNDANCY]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-tenant SaaS needs per-tenant SQL databases with pooled, predictable cost and the ability to share compute across databases with varying load. Which design fits?',
    options: opts4(
      'A single shared database for all tenants',
      'Azure SQL Database elastic pool with one database per tenant',
      'One SQL Managed Instance per tenant',
      'Cosmos DB serverless for everything'
    ),
    correct: ['b'],
    explanation: 'An elastic pool shares a pool of DTUs/vCores across many single-tenant databases with bursty, uncorrelated load, giving isolation plus cost efficiency. A single shared DB loses isolation; one MI per tenant is costly; Cosmos DB is a different data model.',
    references: [REF_SQL]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'A design must automatically transition blobs to Cool after 30 days and delete them after 365 days. Which feature should you specify?',
    options: opts4(
      'Object replication',
      'A blob lifecycle management policy',
      'Storage account failover',
      'Immutable blob legal hold'
    ),
    correct: ['b'],
    explanation: 'Lifecycle management rules automate tier transitions and deletion based on age conditions. Object replication copies blobs across accounts, account failover is for DR, and legal hold prevents (not enables) deletion.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL design choices that reduce data-at-rest exposure for an Azure SQL Database holding regulated data.',
    options: opts4(
      'Transparent Data Encryption (enabled by default)',
      'Always Encrypted for sensitive columns',
      'Storing the database backup keys in the application code',
      'Customer-managed keys (BYOK) in Azure Key Vault'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'TDE encrypts data at rest, Always Encrypted protects sensitive columns from the DB engine/admins, and CMK/BYOK in Key Vault gives the customer key control. Storing keys in application code defeats encryption and is an anti-pattern.',
    references: [REF_SQL, REF_KEYVAULT]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'An IoT solution ingests millions of small JSON telemetry events per second for later analytical processing. Which storage/ingestion design is most appropriate?',
    options: opts4(
      'Write each event directly to Azure SQL Database',
      'Stream events through Event Hubs and capture to ADLS Gen2 for batch analytics',
      'Insert each event into a single Cosmos DB document',
      'Email each event to a mailbox'
    ),
    correct: ['b'],
    explanation: 'Event Hubs handles high-throughput ingestion and Capture writes batched data to ADLS Gen2 for downstream analytics. Per-event SQL inserts will not scale, a single Cosmos document cannot hold a stream, and email is not a data pipeline.',
    references: [REF_EVENTHUBS, REF_DATALAKE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'A lift-and-shift app uses an SMB file share accessed by multiple VMs. Which Azure storage service should the design recommend?',
    options: opts4(
      'Azure Blob containers',
      'Azure Files (SMB)',
      'Azure Queue storage',
      'Azure Table storage'
    ),
    correct: ['b'],
    explanation: 'Azure Files provides fully managed SMB shares that multiple VMs can mount, ideal for lift-and-shift of shared-file workloads. Blob/Queue/Table do not offer SMB file-share semantics.',
    references: [REF_STORAGE]
  },
  {
    domain: DATA, difficulty: 4, type: QType.SINGLE,
    stem: 'A workload requires a relational store with read scale-out, automatic failover groups across regions, and minimal management overhead. Which design best meets this?',
    options: opts4(
      'SQL Server on an Azure VM with manual log shipping',
      'Azure SQL Database with auto-failover groups and read-scale replicas',
      'Azure Table storage with manual copies',
      'A single Cosmos DB region'
    ),
    correct: ['b'],
    explanation: 'Azure SQL Database with auto-failover groups provides cross-region failover and readable secondaries with minimal management. IaaS SQL with manual log shipping is high-overhead; Table storage and single-region Cosmos do not provide relational read-scale failover groups.',
    references: [REF_SQL]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must guarantee that financial records cannot be modified or deleted for a regulated retention period (WORM). Which storage capability should you specify?',
    options: opts4(
      'Soft delete only',
      'Immutable blob storage with a time-based retention policy',
      'A read-only RBAC role',
      'A CanNotDelete lock'
    ),
    correct: ['b'],
    explanation: 'Immutable (WORM) blob storage with a time-based retention policy enforces that data cannot be altered or deleted until the retention period elapses, meeting regulatory requirements. Soft delete, RBAC, and locks can be changed by privileged users and are not WORM.',
    references: [REF_BLOB]
  },

  // ── Design business continuity solutions (12) ──
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A business requires that Azure VMs can be recovered in a secondary region within an RTO of one hour after a regional outage. Which service should the BCDR design use?',
    options: opts4(
      'Azure Backup only',
      'Azure Site Recovery with replication to a secondary region',
      'A manually copied VHD once a month',
      'Availability sets'
    ),
    correct: ['b'],
    explanation: 'Azure Site Recovery continuously replicates VMs to a secondary region and enables orchestrated failover meeting low RTO objectives. Backup is for point-in-time restore (longer RTO), manual VHD copies are slow/stale, and availability sets only protect within a region.',
    references: [REF_ASR]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A database can tolerate at most 5 minutes of data loss after a failure. Which metric does this define and how should it drive the design?',
    options: opts4(
      'RTO; choose the fastest restart procedure',
      'RPO; choose a replication/backup frequency that bounds data loss to 5 minutes',
      'SLA; negotiate with the cloud provider',
      'MTBF; replace hardware sooner'
    ),
    correct: ['b'],
    explanation: 'The maximum acceptable data loss is the Recovery Point Objective. A 5-minute RPO requires continuous or near-continuous replication (e.g., geo-replication) rather than infrequent backups. RTO is about downtime duration, not data loss.',
    references: [REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL true statements about availability zones for high availability within a region.',
    options: opts4(
      'Availability zones are physically separate datacenters within a region.',
      'Distributing VM instances across zones protects against a single datacenter failure.',
      'Zone-redundant services replicate across zones automatically.',
      'Availability zones protect against a full region outage.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Zones are physically isolated facilities; spreading instances across zones and using zone-redundant services tolerates a datacenter/zone failure. They do NOT protect against a full regional outage — that requires multi-region (geo) design.',
    references: [REF_AZREGIONS]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A design needs centralized backup of Azure VMs and Azure Files with long-term retention and cross-region restore. Which service should be used?',
    options: opts4(
      'Azure Site Recovery',
      'Azure Backup with a Recovery Services vault (GRS, cross-region restore enabled)',
      'Storage account soft delete only',
      'Manual snapshots in a script'
    ),
    correct: ['b'],
    explanation: 'Azure Backup with a GRS Recovery Services vault and cross-region restore provides managed, retained backups and the ability to restore in the paired region. ASR is for replication/failover, soft delete is not full backup, and ad-hoc snapshots lack policy and retention management.',
    references: [REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A web tier must remain available if an entire Azure region fails, with automatic client redirection. Which combination should the BCDR design include?',
    options: opts4(
      'A single-region VM scale set behind a regional load balancer',
      'Deploy the app to two regions and use Azure Front Door (or Traffic Manager) for global failover',
      'Increase the VM size in one region',
      'A single zone deployment'
    ),
    correct: ['b'],
    explanation: 'Active-active or active-passive multi-region deployment with Front Door/Traffic Manager provides automatic global failover when a region fails. Larger VMs, single-region, or single-zone designs cannot survive a regional outage.',
    references: [REF_FRONTDOOR, REF_TM]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Backup soft delete retains deleted backup data for an additional period to protect against accidental or malicious deletion.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Azure Backup soft delete keeps recovery points for a retention window after deletion so they can be recovered, mitigating ransomware/insider deletion. This is a recommended resilience control.',
    references: [REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'An Azure SQL Database must survive a regional disaster with an RPO measured in seconds and a quick failover. Which design element is most appropriate?',
    options: opts4(
      'Weekly full backups to a storage account',
      'An auto-failover group with a geo-secondary in a paired region',
      'Exporting a BACPAC nightly',
      'Local-only point-in-time restore'
    ),
    correct: ['b'],
    explanation: 'Auto-failover groups asynchronously replicate to a geo-secondary with very low RPO and provide automatic/quick failover with a stable listener endpoint. Weekly backups and nightly BACPACs have RPO in hours/days; PITR is single-region.',
    references: [REF_SQL]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A stateless microservice on AKS must keep serving traffic if one datacenter in the region fails. Which design choice helps most?',
    options: opts4(
      'A single-node AKS cluster',
      'An AKS cluster with node pools spread across availability zones',
      'Disabling the cluster autoscaler',
      'Running all pods on one node'
    ),
    correct: ['b'],
    explanation: 'Spreading AKS node pools across availability zones keeps the workload running if one zone/datacenter fails. A single node, no autoscaling, or single-node placement create single points of failure.',
    references: [REF_AKS, REF_AZREGIONS]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which capability should the design use to validate disaster recovery without impacting the production workload?',
    options: opts4(
      'Delete the primary region to test',
      'Azure Site Recovery test failover into an isolated network',
      'Stop all backups during the test',
      'Switch DNS permanently to a test site'
    ),
    correct: ['b'],
    explanation: 'ASR test failover spins up replicated VMs in an isolated network for non-disruptive DR drills. Deleting the primary, stopping backups, or permanently repointing DNS would harm production or data protection.',
    references: [REF_ASR]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A stateful VM-based application has both an RPO of 15 minutes and an RTO of 2 hours for a regional failure. Which single design best meets both objectives cost-effectively?',
    options: opts4(
      'Daily Azure Backup only',
      'Azure Site Recovery replication to the paired region with a documented recovery plan',
      'Availability zones only',
      'A read replica of the OS disk'
    ),
    correct: ['b'],
    explanation: 'ASR provides continuous replication (low RPO) and an orchestrated recovery plan enabling failover within the RTO. Daily Backup gives ~24h RPO, availability zones do not cover regional outages, and an OS disk replica alone is not an application DR solution.',
    references: [REF_ASR, REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'A globally available Cosmos DB account must survive a region outage with automatic failover and no application changes. Which configuration should the design specify?',
    options: opts4(
      'Single region, manual restore from backup',
      'Multiple read regions with automatic failover (and optionally multi-region writes) enabled',
      'A nightly export to blob storage only',
      'Disable replication to save cost'
    ),
    correct: ['b'],
    explanation: 'Configuring Cosmos DB with multiple regions and automatic failover lets the service promote a secondary region transparently. Single-region with manual restore, exports only, or disabled replication cannot meet automatic regional resilience.',
    references: [REF_COSMOS]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.SINGLE,
    stem: 'An enterprise needs an organization-wide BCDR strategy that classifies workloads by criticality and assigns differentiated RPO/RTO targets. Which approach aligns with AZ-305 guidance?',
    options: opts4(
      'Apply the same DR tier to every workload regardless of importance',
      'Tier workloads (e.g., mission-critical vs. low priority) and select DR services/redundancy per tier’s RPO/RTO and cost',
      'Skip DR for everything except databases',
      'Rely solely on the platform SLA with no DR design'
    ),
    correct: ['b'],
    explanation: 'Sound BCDR design tiers workloads by business impact and applies appropriate redundancy (zones, geo-replication, ASR, backup) per tier to balance resilience and cost. One-size-fits-all over- or under-protects; SLA alone is not a recovery strategy.',
    references: [REF_WAF, REF_ASR]
  },

  // ── Design infrastructure solutions (19) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A containerized microservice needs autoscaling, scale-to-zero, and managed HTTPS ingress without managing Kubernetes infrastructure. Which compute service should you recommend?',
    options: opts4(
      'Azure Kubernetes Service (self-managed node pools)',
      'Azure Container Apps',
      'A single Azure VM running Docker',
      'Azure Batch'
    ),
    correct: ['b'],
    explanation: 'Azure Container Apps is a serverless container platform offering autoscaling (including scale-to-zero), managed ingress, and no Kubernetes management. AKS still requires cluster operations, a single VM lacks elasticity, and Batch targets large-scale parallel jobs.',
    references: [REF_CONTAINERAPPS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A web app needs Layer-7 load balancing with URL path-based routing, TLS termination, and a Web Application Firewall. Which service should the design use?',
    options: opts4(
      'Azure Load Balancer (Standard)',
      'Azure Application Gateway with WAF',
      'Azure Traffic Manager',
      'A network security group'
    ),
    correct: ['b'],
    explanation: 'Application Gateway is a Layer-7 load balancer supporting path-based routing and TLS termination, and its WAF SKU protects against common web exploits. Load Balancer is Layer-4, Traffic Manager is DNS-based global routing, and an NSG is a packet filter.',
    references: [REF_APPGW]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL valid Azure services for global, low-latency distribution of an internet-facing application.',
    options: opts4(
      'Azure Front Door',
      'Azure Traffic Manager',
      'A single regional internal load balancer',
      'Azure CDN'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Front Door (global L7 with acceleration), Traffic Manager (DNS-based global routing), and Azure CDN (edge caching) all support global delivery. A single regional internal load balancer is not internet-facing and has no global reach.',
    references: [REF_FRONTDOOR, REF_TM]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Two virtual networks in different regions must communicate privately over the Microsoft backbone with low latency. Which design element should you recommend?',
    options: opts4(
      'Global VNet peering',
      'Public IP addresses with NSG rules',
      'A site-to-site VPN over the public internet only',
      'Service endpoints'
    ),
    correct: ['a'],
    explanation: 'Global VNet peering connects VNets across regions privately over the Microsoft backbone with low latency and no gateway. Public IPs traverse the internet, an internet-only VPN adds latency/overhead, and service endpoints secure PaaS access, not VNet-to-VNet.',
    references: [REF_VNET]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An enterprise with dozens of branch offices and many VNets needs a managed hub-and-spoke topology with centralized routing and connectivity. Which service should the design use?',
    options: opts4(
      'Manually configured individual VPN gateways per VNet',
      'Azure Virtual WAN',
      'A single large flat VNet for everything',
      'Public IPs on every server'
    ),
    correct: ['b'],
    explanation: 'Azure Virtual WAN provides a managed global transit hub-and-spoke for branch, VNet, and remote-user connectivity with centralized routing. Manual per-VNet gateways do not scale, a single flat VNet harms segmentation, and public IPs are insecure.',
    references: [REF_VWAN]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Functions on the Consumption plan is well suited for short-lived, event-driven workloads that scale automatically to zero when idle.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. The Consumption plan scales out per demand and to zero when idle, billing per execution — ideal for sporadic, event-driven code. Long-running or always-warm needs may instead use Premium or Dedicated plans.',
    references: [REF_FUNCTIONS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A line-of-business web app must run managed code with deployment slots, easy scaling, and no OS management. Which compute platform should be recommended?',
    options: opts4(
      'Azure Virtual Machines',
      'Azure App Service',
      'Azure Batch',
      'Azure Dedicated Host'
    ),
    correct: ['b'],
    explanation: 'Azure App Service is a managed PaaS for web apps offering deployment slots, autoscale, and no OS maintenance. VMs and Dedicated Host require OS management; Batch is for large-scale parallel compute jobs.',
    references: [REF_APPSVC]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A decoupled order-processing system must guarantee ordered, transactional, at-least-once delivery with dead-lettering between services. Which messaging service fits?',
    options: opts4(
      'Azure Event Grid',
      'Azure Service Bus queues/topics with sessions and dead-letter queues',
      'Azure Event Hubs',
      'A storage account blob trigger'
    ),
    correct: ['b'],
    explanation: 'Service Bus provides enterprise messaging with FIFO via sessions, transactions, and dead-letter queues for reliable command/order processing. Event Grid is for reactive event distribution, Event Hubs is high-throughput streaming, and blob triggers are not a message broker.',
    references: [REF_SERVICEBUS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A system needs to broadcast resource state-change events to many subscribers with a publish-subscribe, near-real-time, serverless model. Which service should the design use?',
    options: opts4(
      'Azure Event Grid',
      'Azure Service Bus queue',
      'Azure Files',
      'Azure SQL Database'
    ),
    correct: ['a'],
    explanation: 'Event Grid is a serverless pub/sub event-routing service ideal for reactive, event-driven notifications to many subscribers. A Service Bus queue is point-to-point command messaging; Files and SQL are not event distribution services.',
    references: [REF_EVENTGRID]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A migration assessment must discover on-premises VMware servers, map dependencies, and right-size Azure targets before migration. Which service should you recommend?',
    options: opts4(
      'Azure Migrate',
      'Azure Site Recovery only',
      'Azure Advisor',
      'Azure Resource Mover'
    ),
    correct: ['a'],
    explanation: 'Azure Migrate provides discovery, dependency analysis, right-sizing, and cost estimates for planning migrations. ASR handles replication/cutover, Advisor gives best-practice recommendations, and Resource Mover relocates existing Azure resources between regions.',
    references: [REF_MIGRATE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about designing for high availability of Azure Virtual Machines.',
    options: opts4(
      'Spreading VMs across availability zones improves resilience to a datacenter failure.',
      'A single VM with Premium SSD qualifies for the highest single-instance availability SLA.',
      'A VM scale set can distribute instances across zones and autoscale.',
      'Putting all VMs in one availability set across two regions is a supported pattern.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Zone distribution and zone-aware scale sets improve availability; a single VM using only Premium/Ultra managed disks qualifies for the single-instance SLA. Availability sets are a single-region construct and cannot span regions, so the last statement is false.',
    references: [REF_VMSLA, REF_AZREGIONS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A stateless web tier must automatically add or remove identical VM instances based on CPU load. Which compute construct should the design use?',
    options: opts4(
      'A single large VM',
      'A Virtual Machine Scale Set with autoscale rules',
      'Azure Batch',
      'A Dedicated Host'
    ),
    correct: ['b'],
    explanation: 'A VM Scale Set deploys identical VMs and autoscales in/out based on metrics like CPU, matching elastic stateless tiers. A single large VM cannot scale horizontally, Batch is for batch jobs, and Dedicated Host is for isolation, not autoscaling.',
    references: [REF_VMSLA]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An application needs equal-cost distribution of inbound TCP traffic across backend VMs in a single region at high throughput and low latency. Which service should be recommended?',
    options: opts4(
      'Azure Standard Load Balancer',
      'Azure Traffic Manager',
      'Azure Application Gateway',
      'Azure Front Door'
    ),
    correct: ['a'],
    explanation: 'Standard Load Balancer is a high-performance Layer-4 distributor for regional TCP/UDP traffic. Traffic Manager and Front Door are global, and Application Gateway is Layer-7 (HTTP/S) — overkill for pure L4 distribution.',
    references: [REF_LB]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which design isolates backend subnets so only the web subnet can reach the database subnet on the SQL port?',
    options: opts4(
      'Assign public IPs to database VMs',
      'Network Security Groups with subnet-scoped rules restricting source to the web subnet and the SQL port',
      'Remove the virtual network',
      'A Traffic Manager profile'
    ),
    correct: ['b'],
    explanation: 'Subnet-scoped NSG rules can permit only the web subnet to reach the DB subnet on the SQL port and deny the rest, implementing tiered segmentation. Public IPs increase exposure, removing the VNet breaks connectivity, and Traffic Manager is DNS routing.',
    references: [REF_VNET]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A batch image-processing workload runs for ~30 minutes per job, triggered hourly, and must be cost-efficient. Which compute design is most appropriate?',
    options: opts4(
      'An always-on D-series VM running 24/7',
      'Azure Functions (Premium) or Container Apps job triggered on schedule that scales out then to zero',
      'A dedicated Kubernetes cluster running idle',
      'Azure Front Door'
    ),
    correct: ['b'],
    explanation: 'A scheduled serverless option (Functions Premium for longer runs or a Container Apps job) scales out for the job and back to zero, paying only for active time. An always-on VM or idle cluster wastes cost; Front Door is not compute.',
    references: [REF_FUNCTIONS, REF_CONTAINERAPPS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid design requires private, high-bandwidth, predictable connectivity between on-premises and Azure that does not traverse the public internet. Which option should you recommend?',
    options: opts4(
      'Site-to-site VPN over the internet',
      'Azure ExpressRoute',
      'Point-to-site VPN',
      'Public peering only'
    ),
    correct: ['b'],
    explanation: 'ExpressRoute provides a private, dedicated, high-bandwidth circuit that bypasses the public internet with predictable latency. Site-to-site and point-to-site VPNs run over the internet; "public peering only" does not provide private connectivity to VNets.',
    references: [REF_VWAN, REF_VNET]
  },
  {
    domain: INFRA, difficulty: 4, type: QType.SINGLE,
    stem: 'A microservices platform needs fine-grained orchestration, custom networking/CNI, and the ability to run a service mesh, with the team accepting cluster operational responsibility. Which compute platform should the design recommend?',
    options: opts4(
      'Azure App Service',
      'Azure Kubernetes Service (AKS)',
      'Azure Functions Consumption',
      'A single VM with Docker Compose'
    ),
    correct: ['b'],
    explanation: 'AKS gives full Kubernetes orchestration, advanced CNI networking, and service mesh support when the team can manage clusters. App Service and Functions abstract orchestration away, and a single VM cannot provide resilient, scalable orchestration.',
    references: [REF_AKS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An e-commerce site experiences large, brief traffic spikes during flash sales and must absorb bursts without overloading the order database. Which architectural element should the design add?',
    options: opts4(
      'Scale the database vertically only',
      'Introduce a queue (Service Bus) between the front end and order processing to level the load',
      'Remove all caching',
      'Move everything to a single VM'
    ),
    correct: ['b'],
    explanation: 'A queue applies the queue-based load leveling pattern, buffering bursts so order processing/database consume at a steady rate. Vertical-only scaling has limits and cost, removing caching worsens load, and a single VM reduces capacity and resilience.',
    references: [REF_SERVICEBUS, REF_ARCH]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which design provides a globally accelerated, secured HTTP entry point with caching, WAF, and path-based routing for a multi-region web application?',
    options: opts4(
      'Azure Front Door (Premium) with WAF',
      'A regional Standard Load Balancer',
      'An internal Application Gateway only',
      'Direct public IPs on each VM'
    ),
    correct: ['a'],
    explanation: 'Azure Front Door Premium provides global HTTP acceleration, edge caching, integrated WAF, and path-based routing across regions. A regional LB has no global reach, an internal App Gateway is not internet-facing, and per-VM public IPs lack acceleration/security.',
    references: [REF_FRONTDOOR]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Design identity, governance, and monitoring (18) ──
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An application running on Azure App Service must call Microsoft Graph without managing secrets. Which design should you recommend?',
    options: opts4(
      'Store a client secret in app settings',
      'Enable a managed identity on the App Service and grant it the required Graph permissions',
      'Use a global admin account interactively',
      'Embed a certificate password in source control'
    ),
    correct: ['b'],
    explanation: 'A managed identity removes secret handling; the identity is granted least-privilege Graph permissions. Storing secrets in settings or source control and reusing a global admin account are insecure anti-patterns.',
    references: [REF_MI, REF_ENTRA]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must require multifactor authentication only when users sign in from unfamiliar locations or with elevated sign-in risk. Which capability should be used?',
    options: opts4(
      'Per-user MFA enabled for everyone always',
      'Conditional Access with sign-in risk and location conditions requiring MFA',
      'Disabling legacy authentication only',
      'Security defaults with no customization'
    ),
    correct: ['b'],
    explanation: 'Risk- and location-based Conditional Access applies MFA adaptively, balancing security and usability. Blanket per-user MFA is not risk-aware, blocking legacy auth alone does not add adaptive MFA, and security defaults are not granular.',
    references: [REF_CA]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL elements that belong in a least-privilege RBAC design for an Azure environment.',
    options: opts4(
      'Assign roles at the narrowest effective scope (resource/resource group) where possible',
      'Use Privileged Identity Management for just-in-time elevation of privileged roles',
      'Grant Owner broadly to simplify operations',
      'Use built-in roles before creating custom roles'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Narrow scope, JIT elevation via PIM, and preferring built-in roles all support least privilege. Broadly granting Owner violates least privilege and increases blast radius.',
    references: [REF_RBAC, REF_PIM]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company must ensure every new resource group is tagged with an "Environment" value. Which Azure Policy effect enforces or adds the tag automatically?',
    options: opts4(
      'audit',
      'modify (or append) effect for the required tag',
      'disabled',
      'exists'
    ),
    correct: ['b'],
    explanation: 'The modify/append effect adds or sets the required tag during deployment, enforcing tagging governance. audit only reports non-compliance, disabled turns the policy off, and "exists" is a condition keyword, not a remediating effect.',
    references: [REF_POLICY]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-team organization needs distinct policy and access boundaries for "Production" and "Sandbox" while sharing one billing account. What governance structure should the design use?',
    options: opts4(
      'A single subscription with resource groups only',
      'A management group hierarchy with separate Production and Sandbox groups and scoped policies/RBAC',
      'One subscription per resource',
      'No structure; rely on naming conventions'
    ),
    correct: ['b'],
    explanation: 'A management group hierarchy lets you apply differentiated policy and RBAC to Production vs. Sandbox while consolidating billing. Resource-group-only or naming-convention approaches do not provide enforceable governance boundaries.',
    references: [REF_MG, REF_POLICY]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Azure Monitor can collect both metrics and logs and trigger alerts with action groups for notification and automation.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. Azure Monitor ingests platform/custom metrics and logs, and alert rules invoke action groups for email/SMS/webhook/automation responses, central to an observability design.',
    references: [REF_MONITOR]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design needs application performance monitoring including distributed tracing and dependency maps for a .NET web app. Which service should be used?',
    options: opts4(
      'Application Insights',
      'Network Watcher',
      'Azure Advisor',
      'Storage analytics logs'
    ),
    correct: ['a'],
    explanation: 'Application Insights provides APM with distributed tracing, the application map, and dependency tracking. Network Watcher diagnoses networking, Advisor gives recommendations, and storage analytics logs cover storage requests only.',
    references: [REF_MONITOR]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A regulated workload must keep all administrative role assignments reviewed periodically with attestation. Which Entra ID governance feature should be recommended?',
    options: opts4(
      'Access reviews',
      'Self-service password reset',
      'Conditional Access only',
      'A static spreadsheet review'
    ),
    correct: ['a'],
    explanation: 'Entra ID access reviews provide recurring, attested certification of role/group memberships, satisfying periodic review requirements. SSPR and Conditional Access address other concerns, and spreadsheets are not auditable governance controls.',
    references: [REF_PIM, REF_ENTRA]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Defender for Cloud capability should the design rely on to quantify and improve overall security posture across subscriptions?',
    options: opts4(
      'Secure Score',
      'Service Health',
      'Cost analysis',
      'Resource locks'
    ),
    correct: ['a'],
    explanation: 'Secure Score in Microsoft Defender for Cloud measures security posture and prioritizes remediations across subscriptions. Service Health is platform status, cost analysis is financial, and locks prevent deletion — none measure security posture.',
    references: [REF_DEFENDER]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A subscription must prevent accidental deletion of an entire resource group while still allowing resource updates. What should the design apply?',
    options: opts4(
      'A ReadOnly lock on the resource group',
      'A CanNotDelete lock on the resource group',
      'Removing Contributor from everyone',
      'An NSG on the resource group'
    ),
    correct: ['b'],
    explanation: 'A CanNotDelete lock blocks deletion of the resource group and its resources while still permitting modifications. A ReadOnly lock would also block updates, removing Contributor blocks legitimate work, and NSGs do not apply to resource groups.',
    references: [REF_POLICY]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ensure VMs are only deployed from an approved set of OS images and only certain VM sizes are allowed. Which approach should be used?',
    options: opts4(
      'Manual review of every deployment',
      'Azure Policy definitions denying disallowed images and SKUs, assigned at a management group',
      'RBAC custom roles only',
      'Tagging the VMs after creation'
    ),
    correct: ['b'],
    explanation: 'Azure Policy deny rules for allowed images/SKUs assigned at a management group enforce the standard at scale. Manual review is error-prone, RBAC controls who not what is deployed, and post-creation tagging does not prevent non-compliant deployments.',
    references: [REF_POLICY, REF_MG]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which design element provides recommendations to optimize cost, including identifying idle or underutilized resources?',
    options: opts4(
      'Azure Advisor cost recommendations',
      'Network Watcher',
      'Azure Policy deny',
      'A Recovery Services vault'
    ),
    correct: ['a'],
    explanation: 'Azure Advisor surfaces cost optimization recommendations such as right-sizing or shutting down idle resources. Network Watcher is for networking diagnostics, Policy deny is governance enforcement, and a Recovery Services vault is for backup.',
    references: [REF_COST]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'An application’s diagnostic logs must be retained 30 days for operations but exported long-term for compliance at lowest cost. Which design meets both?',
    options: opts4(
      'Only a Log Analytics workspace with 30-day retention',
      'Diagnostic settings sending to a Log Analytics workspace (30-day analysis) and to a storage account for long-term archival',
      'Only a storage account',
      'No retention configuration'
    ),
    correct: ['b'],
    explanation: 'Routing diagnostics to both a workspace (for short-term query/analysis) and a storage account (cheap long-term archive) satisfies operational and compliance needs cost-effectively. Workspace-only loses cheap long-term archive; storage-only loses queryability.',
    references: [REF_LAW, REF_MONITOR]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Entra Conditional Access.',
    options: opts4(
      'Policies can require compliant or hybrid-joined devices.',
      'Policies can grant or block based on user/group, app, location, and risk.',
      'Conditional Access replaces the need for any RBAC.',
      'A break-glass account should be excluded to avoid lockout.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Conditional Access enforces device, identity, app, location, and risk conditions and break-glass accounts should be excluded. It governs access conditions, not Azure resource authorization, so it does not replace RBAC.',
    references: [REF_CA, REF_RBAC]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which identity construct should two applications share when they both need the same Azure RBAC permissions and lifecycle independence from any single resource?',
    options: opts4(
      'A user-assigned managed identity',
      'A system-assigned managed identity per app',
      'A shared user account',
      'An access key'
    ),
    correct: ['a'],
    explanation: 'A user-assigned managed identity is a standalone identity that multiple resources can share with consistent RBAC and an independent lifecycle. System-assigned identities are per-resource; shared user accounts/access keys are insecure.',
    references: [REF_MI]
  },
  {
    domain: IDGM, difficulty: 4, type: QType.SINGLE,
    stem: 'An enterprise wants every subscription to automatically have a baseline of security policy, a Log Analytics workspace connection, and Defender plans enabled on creation. Which design approach aligns with AZ-305 guidance?',
    options: opts4(
      'Manually configure each new subscription',
      'Use a landing zone approach with policy initiatives (including deployIfNotExists) assigned at the management group',
      'Email teams a checklist',
      'Disable governance to reduce friction'
    ),
    correct: ['b'],
    explanation: 'Landing zones with policy initiatives (including deployIfNotExists for workspace/Defender onboarding) at the management group automatically baseline new subscriptions. Manual steps and checklists are not enforced; disabling governance fails compliance.',
    references: [REF_BLUEPRINT, REF_POLICY]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs read-only visibility into all resources in a subscription for auditing, with no ability to make changes. Which role should the design assign?',
    options: opts4(
      'Owner',
      'Reader',
      'Contributor',
      'User Access Administrator'
    ),
    correct: ['b'],
    explanation: 'The Reader role grants view-only access to all resources in the assigned scope, perfect for auditors. Owner/Contributor allow changes and User Access Administrator can modify access assignments.',
    references: [REF_RBAC]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must alert when the Azure activity log records a "Delete Network Security Group" operation in production. Which approach should be used?',
    options: opts4(
      'A metric alert on CPU',
      'An activity log alert rule scoped to the NSG delete operation with an action group',
      'A workbook only',
      'A storage lifecycle rule'
    ),
    correct: ['b'],
    explanation: 'Activity log alert rules fire on specific control-plane operations (like deleting an NSG) and notify via action groups. Metric alerts track metrics, workbooks visualize, and lifecycle rules manage blob tiers.',
    references: [REF_MONITOR]
  },

  // ── Design data storage solutions (16) ──
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A media app stores user-uploaded videos that are accessed heavily for 30 days, then rarely. Which storage design minimizes cost over the object lifetime?',
    options: opts4(
      'Keep everything in the Hot tier forever',
      'Use Hot tier with a lifecycle policy that moves blobs to Cool then Archive based on age',
      'Use Azure SQL Database for the videos',
      'Use Azure Files Premium'
    ),
    correct: ['b'],
    explanation: 'A lifecycle policy moving aging blobs Hot→Cool→Archive matches the access pattern and minimizes cost. Hot forever overpays for cold data, and SQL/Premium Files are unsuitable/expensive for large binary objects.',
    references: [REF_LIFECYCLE, REF_BLOB]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A globally used catalog API needs guaranteed low-latency reads in every region and can tolerate slightly stale data for performance. Which Cosmos DB consistency level is the best fit?',
    options: opts4(
      'Strong',
      'Session or Eventual',
      'Bounded staleness with a 0 lag',
      'Consistent prefix is impossible to configure'
    ),
    correct: ['b'],
    explanation: 'Session or Eventual consistency provides the lowest latency and highest availability with acceptable staleness for a read-heavy catalog. Strong adds latency/cost, a 0-lag bounded staleness is not valid, and consistent prefix is a real, configurable level.',
    references: [REF_COSMOS_CONSISTENCY]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization migrating a SQL Server database wants PaaS with minimal management and only needs single-database features. Which target should the design recommend?',
    options: opts4(
      'Azure SQL Database (single database)',
      'SQL Server on an Azure VM',
      'Azure Cosmos DB',
      'Azure Files'
    ),
    correct: ['a'],
    explanation: 'Azure SQL Database single database is the lowest-management PaaS option when instance-level features are not required. IaaS SQL adds OS/patching overhead, Cosmos DB is NoSQL, and Files is not a relational database.',
    references: [REF_SQL]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Zone-redundant storage (ZRS) keeps copies of data across multiple availability zones within a single region.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. ZRS synchronously replicates data across three availability zones in the primary region, protecting against a single-zone failure. It does not protect against a full regional outage (use GZRS for that).',
    references: [REF_REDUNDANCY]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid design choices for a large analytics data lake on Azure.',
    options: opts4(
      'Enable hierarchical namespace (ADLS Gen2) on a GPv2 account',
      'Use folder/POSIX ACLs for fine-grained access control',
      'Store all data in a single Azure SQL Basic database',
      'Integrate with Synapse or Databricks for processing'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'ADLS Gen2 with hierarchical namespace, POSIX ACLs, and analytics-engine integration are core data-lake design choices. A single Basic SQL database cannot store/process big-data lake volumes.',
    references: [REF_DATALAKE, REF_SYNAPSE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A data warehouse must run complex aggregations over many billions of rows with massively parallel processing and predictable performance. Which service fits?',
    options: opts4(
      'Azure Synapse Analytics dedicated SQL pool',
      'Azure Cache for Redis',
      'Azure Table storage',
      'Azure Queue storage'
    ),
    correct: ['a'],
    explanation: 'A Synapse dedicated SQL pool uses MPP for large-scale data-warehouse workloads. Redis is an in-memory cache, and Table/Queue storage are not analytical query engines.',
    references: [REF_SYNAPSE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A PaaS database must be accessible only through the corporate virtual network with no public endpoint. Which design element should be specified?',
    options: opts4(
      'Allow all Azure services in the firewall',
      'A private endpoint and disabling public network access',
      'A SAS token',
      'A CDN endpoint'
    ),
    correct: ['b'],
    explanation: 'A private endpoint plus disabling public network access confines connectivity to the VNet. Allowing all Azure services widens exposure, SAS tokens apply to storage data, and a CDN increases public reach.',
    references: [REF_PRIVATELINK, REF_SQL]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which redundancy option provides the lowest-cost durability but no protection if the single datacenter fails?',
    options: opts4(
      'LRS (locally redundant storage)',
      'GRS (geo-redundant storage)',
      'ZRS (zone-redundant storage)',
      'GZRS'
    ),
    correct: ['a'],
    explanation: 'LRS keeps three copies within one datacenter — cheapest but vulnerable to a datacenter-level failure. ZRS, GRS, and GZRS add zone and/or regional protection at higher cost.',
    references: [REF_REDUNDANCY]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A SaaS provider needs hundreds of small tenant databases with consolidated, cost-efficient compute and per-database isolation. Which design should be recommended?',
    options: opts4(
      'One database per tenant in an Azure SQL Database elastic pool',
      'A single shared database with a TenantId column only',
      'One SQL Managed Instance per tenant',
      'Cosmos DB for everything regardless of model'
    ),
    correct: ['a'],
    explanation: 'An elastic pool shares compute across many isolated single-tenant databases with bursty load, balancing isolation and cost. A single shared DB sacrifices isolation, per-tenant MI is costly, and forcing Cosmos DB ignores the relational requirement.',
    references: [REF_SQL]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A storage account holding sensitive data must use customer-managed encryption keys with the ability to rotate and revoke keys. Which design element should be included?',
    options: opts4(
      'Microsoft-managed keys only',
      'Customer-managed keys stored in Azure Key Vault for storage encryption',
      'Disable encryption to simplify rotation',
      'Embed the key in the connection string'
    ),
    correct: ['b'],
    explanation: 'Customer-managed keys in Key Vault give control over rotation and revocation for storage encryption. Microsoft-managed keys remove customer control, disabling encryption is non-compliant, and embedding keys in connection strings is insecure.',
    references: [REF_KEYVAULT, REF_STORAGE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL valid statements about Azure Cosmos DB partitioning and throughput.',
    options: opts4(
      'A good partition key distributes requests and storage evenly.',
      'Autoscale throughput adjusts RU/s automatically within a range.',
      'A poor partition key can create hot partitions.',
      'Partition key choice does not affect performance.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A well-chosen partition key spreads load and avoids hot partitions; autoscale adjusts RU/s within a configured maximum. Partition key choice strongly affects scalability and performance, so the last statement is false.',
    references: [REF_COSMOS]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Several Linux VMs need a shared, POSIX-compliant network file system mounted concurrently. Which Azure storage service should the design use?',
    options: opts4(
      'Azure Files with the NFS protocol (or Azure NetApp Files)',
      'Azure Blob Archive tier',
      'Azure Queue storage',
      'Azure Table storage'
    ),
    correct: ['a'],
    explanation: 'Azure Files (NFS) or Azure NetApp Files provide POSIX-compliant shared file systems for concurrent Linux mounts. Archive blob, Queue, and Table storage do not provide a mountable shared POSIX file system.',
    references: [REF_STORAGE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A read-heavy application repeatedly queries the same reference data, causing high database load. Which design element best reduces latency and database pressure?',
    options: opts4(
      'Add Azure Cache for Redis in front of the database',
      'Switch the database to the Basic tier',
      'Remove indexes',
      'Disable connection pooling'
    ),
    correct: ['a'],
    explanation: 'Azure Cache for Redis serves frequently read reference data from memory, cutting latency and offloading the database. Lowering the tier, removing indexes, or disabling pooling would worsen performance.',
    references: [REF_ARCH]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature should the design specify to automatically delete log blobs older than 180 days to control storage cost?',
    options: opts4(
      'A blob lifecycle management rule with a delete action after 180 days',
      'Object replication',
      'A CanNotDelete lock',
      'Soft delete with infinite retention'
    ),
    correct: ['a'],
    explanation: 'A lifecycle rule with a delete action based on blob age automates cleanup at 180 days. Object replication copies data, a delete lock prevents deletion, and infinite soft delete would increase, not control, cost.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: DATA, difficulty: 4, type: QType.SINGLE,
    stem: 'An application requires a relational database with built-in geo-replication, a stable failover endpoint, and read-scale offload for reporting, with minimal admin overhead. Which design best meets all three?',
    options: opts4(
      'SQL Server on a VM with manual mirroring',
      'Azure SQL Database with an auto-failover group and read-scale-out secondaries',
      'A single-region Cosmos DB account',
      'Azure Table storage with manual copies'
    ),
    correct: ['b'],
    explanation: 'Azure SQL Database auto-failover groups provide geo-replication, a stable listener endpoint, and readable secondaries for reporting, all PaaS-managed. IaaS mirroring is high-overhead, single-region Cosmos lacks geo failover, and Table storage is not relational.',
    references: [REF_SQL]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance rule requires that audit blobs cannot be deleted or overwritten for exactly 5 years. Which storage capability should the design specify?',
    options: opts4(
      'Immutable storage with a 5-year time-based retention policy (WORM)',
      'Soft delete for 30 days',
      'A ReadOnly RBAC role',
      'Versioning only'
    ),
    correct: ['a'],
    explanation: 'Immutable blob storage with a 5-year time-based retention policy enforces true WORM, preventing deletion/overwrite for the period. Soft delete, RBAC, and versioning alone can be bypassed by privileged users and are not WORM-compliant.',
    references: [REF_BLOB]
  },

  // ── Design business continuity solutions (12) ──
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A line-of-business app on Azure VMs needs orchestrated recovery to a secondary region with a recovery plan and minimal data loss. Which service should the design recommend?',
    options: opts4(
      'Azure Backup only',
      'Azure Site Recovery with a recovery plan',
      'A weekly VHD export',
      'Availability zones only'
    ),
    correct: ['b'],
    explanation: 'Azure Site Recovery continuously replicates VMs and uses recovery plans to orchestrate ordered failover with low RPO. Backup-only has higher RPO/RTO, VHD exports are stale, and zones do not cover a regional outage.',
    references: [REF_ASR]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload tolerates up to 4 hours of downtime but no more than 15 minutes of data loss. Which two metrics are specified and which drives replication frequency?',
    options: opts4(
      'RTO 15 min / RPO 4 h; backups drive RTO',
      'RTO 4 h and RPO 15 min; RPO drives how frequently data must be replicated',
      'Only an SLA is specified',
      'MTTR 4 h drives RPO'
    ),
    correct: ['b'],
    explanation: 'Maximum downtime is RTO (4 h) and maximum data loss is RPO (15 min). The 15-minute RPO drives near-continuous replication; RTO drives recovery procedure speed. The values are not interchangeable.',
    references: [REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL valid statements about designing for regional resilience in Azure.',
    options: opts4(
      'Deploying to two regions with a global load balancer protects against a regional outage.',
      'Region pairs offer prioritized recovery and sequential platform updates.',
      'Availability zones alone protect against a full region failure.',
      'Geo-redundant data replication helps meet cross-region recovery objectives.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Multi-region deployment with global routing and geo-redundant data supports regional DR, and region pairs provide recovery prioritization. Availability zones protect against datacenter/zone failure only, not a full regional outage.',
    references: [REF_AZREGIONS, REF_FRONTDOOR]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service should the design use to centrally back up Azure VMs, SQL in Azure VMs, and Azure Files with policy-based retention?',
    options: opts4(
      'Azure Site Recovery',
      'Azure Backup with a Recovery Services vault and backup policies',
      'Storage soft delete only',
      'A manual snapshot script'
    ),
    correct: ['b'],
    explanation: 'Azure Backup with a Recovery Services vault provides centralized, policy-driven backup and retention for VMs, in-VM SQL, and Azure Files. ASR is replication/failover, soft delete is not a full backup solution, and ad-hoc scripts lack policy management.',
    references: [REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-tier app must continue serving users during a full regional outage with automatic client redirection and pre-provisioned standby capacity. Which design pattern fits?',
    options: opts4(
      'Single-region with bigger VMs',
      'Active-passive multi-region deployment with Front Door/Traffic Manager health-based failover',
      'Single availability zone',
      'No DR; rely on the platform SLA'
    ),
    correct: ['b'],
    explanation: 'Active-passive multi-region with global health-probe-based failover (Front Door/Traffic Manager) automatically redirects users on a regional outage. Single-region/zone and SLA-only approaches cannot survive a regional failure.',
    references: [REF_FRONTDOOR, REF_TM]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'Enabling cross-region restore on a GRS Recovery Services vault lets you restore VM backups in the paired secondary region.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. With a GRS vault and cross-region restore enabled, you can restore supported backups in the Azure paired region during a primary-region disruption, improving recovery flexibility.',
    references: [REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A mission-critical Azure SQL Database needs the lowest practical RPO and an automatic failover endpoint across regions. Which design element should be specified?',
    options: opts4(
      'Long-term retention backups only',
      'An auto-failover group with a geo-secondary',
      'A nightly BACPAC export',
      'Zone-redundant configuration only'
    ),
    correct: ['b'],
    explanation: 'An auto-failover group asynchronously replicates to a geo-secondary with very low RPO and provides an automatic, stable failover listener. Backup/BACPAC RPO is hours/days; zone redundancy alone does not protect against a regional outage.',
    references: [REF_SQL]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A web app on App Service must remain available if a single datacenter in the region fails. Which design choice helps most without going multi-region?',
    options: opts4(
      'Use a single small instance',
      'Use a zone-redundant App Service plan (multiple instances spread across availability zones)',
      'Disable autoscale',
      'Run only one worker'
    ),
    correct: ['b'],
    explanation: 'A zone-redundant App Service plan distributes instances across availability zones so the app survives a single zone/datacenter failure. A single instance, disabled autoscale, or one worker create single points of failure.',
    references: [REF_APPSVC, REF_AZREGIONS]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'How should the design validate the DR plan for a critical workload without disrupting production?',
    options: opts4(
      'Fail over production permanently',
      'Run an Azure Site Recovery test failover into an isolated VNet',
      'Disable replication during business hours',
      'Delete the primary site to test recovery'
    ),
    correct: ['b'],
    explanation: 'An ASR test failover creates replicated VMs in an isolated network so DR can be validated without affecting production. Permanent failover, disabling replication, or deleting the primary would harm availability or data protection.',
    references: [REF_ASR]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A VM-based ERP system requires RPO of 10 minutes and RTO of 1 hour after a regional disaster, with a documented runbook. Which single design best meets both objectives?',
    options: opts4(
      'Daily Azure Backup only',
      'Azure Site Recovery replication to the paired region with a tested recovery plan/runbook',
      'Availability zones only',
      'A single managed-disk snapshot per week'
    ),
    correct: ['b'],
    explanation: 'ASR provides continuous replication (low RPO) plus orchestrated recovery plans/runbooks enabling failover within a 1-hour RTO. Daily backups give ~24h RPO, zones do not cover regional outages, and weekly snapshots are far too infrequent.',
    references: [REF_ASR, REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'A globally distributed Cosmos DB application must continue operating if its write region fails, with minimal manual intervention. Which configuration should be designed?',
    options: opts4(
      'Single write region with manual restore',
      'Multiple regions with automatic failover (and optionally multi-region writes)',
      'A nightly export only',
      'Disable geo-replication'
    ),
    correct: ['b'],
    explanation: 'Multiple regions with automatic failover let Cosmos DB promote a healthy region with minimal intervention; multi-region writes can keep writes available continuously. Single-region, export-only, or disabled geo-replication cannot meet automatic resilience.',
    references: [REF_COSMOS]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.SINGLE,
    stem: 'An enterprise wants a BCDR program where each application’s redundancy investment matches its business impact and recovery objectives. Which approach best reflects AZ-305 guidance?',
    options: opts4(
      'Give every workload geo-redundant active-active regardless of need',
      'Classify workloads by criticality and assign tiered DR (backup, zones, geo-replication, ASR) per their RPO/RTO and cost tolerance',
      'Protect nothing and accept outages',
      'Rely only on the provider SLA'
    ),
    correct: ['b'],
    explanation: 'Tiering workloads by business impact and matching DR mechanisms to each tier’s RPO/RTO optimizes resilience versus cost. Blanket active-active over-spends, no protection fails the business, and an SLA is not a recovery design.',
    references: [REF_WAF, REF_ASR]
  },

  // ── Design infrastructure solutions (19) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team wants to run containers with autoscaling and revision-based deployments without managing a Kubernetes control plane. Which service should be recommended?',
    options: opts4(
      'Azure Container Apps',
      'Self-managed Kubernetes on VMs',
      'A single Docker VM',
      'Azure Batch'
    ),
    correct: ['a'],
    explanation: 'Azure Container Apps provides serverless containers with autoscaling and revisions, abstracting the Kubernetes control plane. Self-managed Kubernetes or a single VM add operational burden, and Batch targets large parallel jobs.',
    references: [REF_CONTAINERAPPS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An internet-facing web app needs URL path-based routing, TLS offload, and protection against OWASP Top 10 attacks within one region. Which service should the design use?',
    options: opts4(
      'Azure Load Balancer (Standard)',
      'Azure Application Gateway with WAF',
      'Azure Traffic Manager',
      'Azure Bastion'
    ),
    correct: ['b'],
    explanation: 'Application Gateway (Layer 7) supports path-based routing and TLS offload, and the WAF SKU mitigates OWASP Top 10 threats. Load Balancer is Layer 4, Traffic Manager is DNS routing, and Bastion is for secure VM management access.',
    references: [REF_APPGW]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL appropriate uses of Azure Service Bus in a solution design.',
    options: opts4(
      'Reliable command messaging between decoupled services',
      'FIFO ordering using sessions',
      'High-volume telemetry stream ingestion for analytics',
      'Transactional message processing with dead-lettering'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Service Bus excels at reliable command messaging, FIFO via sessions, and transactional processing with dead-letter queues. High-volume telemetry streaming for analytics is better served by Event Hubs.',
    references: [REF_SERVICEBUS, REF_EVENTHUBS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Two VNets in the same region must communicate privately with low latency and no gateway. Which design element should be used?',
    options: opts4(
      'Regional VNet peering',
      'Public IPs with NSGs',
      'A VPN gateway over the internet',
      'A Traffic Manager profile'
    ),
    correct: ['a'],
    explanation: 'Regional VNet peering connects two VNets privately over the Microsoft backbone with low latency and no gateway. Public IPs traverse the internet, a VPN gateway adds latency/cost, and Traffic Manager is DNS-based routing.',
    references: [REF_VNET]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A global enterprise needs centralized connectivity for many branches, VNets, and remote users with managed routing. Which service should the design recommend?',
    options: opts4(
      'Azure Virtual WAN',
      'A single flat VNet',
      'Per-VNet manual VPN gateways',
      'Public IP exposure for all servers'
    ),
    correct: ['a'],
    explanation: 'Azure Virtual WAN provides a managed global transit network for branch/VNet/remote-user connectivity with centralized routing. A flat VNet harms segmentation, manual per-VNet gateways do not scale, and public IP exposure is insecure.',
    references: [REF_VWAN]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A Virtual Machine Scale Set can automatically increase and decrease the number of identical VM instances based on a metric such as CPU.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. VM Scale Sets support autoscale rules that add or remove identical instances based on metrics, ideal for elastic stateless workloads. Single VMs cannot scale horizontally automatically.',
    references: [REF_VMSLA]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A REST API has unpredictable, spiky traffic and must minimize idle cost while scaling instantly per request. Which compute option should be designed?',
    options: opts4(
      'An always-on VM',
      'Azure Functions on the Consumption plan',
      'A reserved-instance VM scale set kept warm',
      'Azure Batch'
    ),
    correct: ['b'],
    explanation: 'Functions on the Consumption plan scale per request and to zero when idle, billing per execution — optimal for spiky APIs. Always-on VMs and warm scale sets pay for idle capacity, and Batch is for parallel batch jobs.',
    references: [REF_FUNCTIONS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A microservices app must publish domain events that many independent subscribers react to in near real time using a serverless model. Which service should the design use?',
    options: opts4(
      'Azure Event Grid',
      'Azure Service Bus session queue',
      'Azure SQL Database',
      'Azure Files'
    ),
    correct: ['a'],
    explanation: 'Event Grid is a serverless pub/sub event router for reactive, near-real-time event distribution to many subscribers. A Service Bus session queue is point-to-point ordered messaging; SQL and Files are not event distribution services.',
    references: [REF_EVENTGRID]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A telemetry pipeline must ingest millions of events per second for stream analytics with replay capability. Which service should be recommended?',
    options: opts4(
      'Azure Event Hubs',
      'Azure Service Bus queue',
      'Azure Queue storage',
      'Azure Files'
    ),
    correct: ['a'],
    explanation: 'Event Hubs is a high-throughput streaming ingestion service with partitioned retention enabling replay for analytics. Service Bus/Queue storage target lower-throughput messaging, and Files is not an ingestion pipeline.',
    references: [REF_EVENTHUBS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Before migrating on-premises servers, the design must assess readiness, dependencies, and right-sized Azure SKUs. Which service should be used?',
    options: opts4(
      'Azure Migrate',
      'Azure Site Recovery only',
      'Azure Monitor only',
      'Azure Resource Mover'
    ),
    correct: ['a'],
    explanation: 'Azure Migrate performs discovery, dependency mapping, right-sizing, and cost estimation for migration planning. ASR executes the replication/cutover, Monitor observes running resources, and Resource Mover relocates existing Azure resources.',
    references: [REF_MIGRATE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid high-availability design choices for stateless VM-based web tiers.',
    options: opts4(
      'A VM scale set with instances spread across availability zones',
      'A load balancer distributing traffic across healthy instances',
      'A single VM with frequent reboots',
      'Autoscale rules tied to load metrics'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A zone-spread scale set, a load balancer over healthy instances, and metric-based autoscale all improve availability and elasticity. A single rebooting VM is a single point of failure.',
    references: [REF_VMSLA, REF_LB]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A managed web app needs blue-green deployments with a quick swap and rollback. Which App Service feature should the design specify?',
    options: opts4(
      'Deployment slots with slot swap',
      'A second subscription',
      'Manual file copy via FTP',
      'A new VM per release'
    ),
    correct: ['a'],
    explanation: 'App Service deployment slots enable staging plus an instant swap (and easy swap-back) for blue-green releases with minimal downtime. A second subscription, FTP copies, or new VMs do not provide near-zero-downtime swaps.',
    references: [REF_APPSVC]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An application needs high-performance Layer-4 distribution of inbound traffic to backend VMs within one region with availability-zone resilience. Which service should be used?',
    options: opts4(
      'Azure Standard Load Balancer (zone-redundant frontend)',
      'Azure Traffic Manager',
      'Azure Front Door',
      'Azure Application Gateway'
    ),
    correct: ['a'],
    explanation: 'A zone-redundant Standard Load Balancer provides high-performance Layer-4 distribution that survives a zone failure. Traffic Manager/Front Door are global services, and Application Gateway is Layer 7.',
    references: [REF_LB, REF_AZREGIONS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which design restricts inbound access to a management VM so only an on-premises IP range can reach RDP, without exposing RDP to the internet broadly?',
    options: opts4(
      'Open RDP to the internet with a strong password',
      'An NSG rule allowing RDP only from the on-premises CIDR (or use Azure Bastion/JIT)',
      'Assign a public IP and remove the NSG',
      'A Traffic Manager profile'
    ),
    correct: ['b'],
    explanation: 'A scoped NSG rule (or Azure Bastion / Defender for Cloud just-in-time access) restricts RDP to the on-premises range, minimizing exposure. Opening RDP broadly or removing the NSG dramatically increases attack surface.',
    references: [REF_VNET]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A nightly data-processing job runs for 90 minutes and is triggered on a schedule. The design must avoid paying for idle compute. Which option is most appropriate?',
    options: opts4(
      'An always-on VM running 24/7',
      'A scheduled Container Apps job (or Functions Premium) that scales out for the run and back to zero',
      'A permanently running AKS cluster doing nothing most of the day',
      'Azure Front Door'
    ),
    correct: ['b'],
    explanation: 'A scheduled Container Apps job (or Functions Premium for longer durations) executes for the 90-minute run and scales back to zero, paying only for active time. An always-on VM or idle cluster wastes money; Front Door is not compute.',
    references: [REF_CONTAINERAPPS, REF_FUNCTIONS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid solution needs predictable, private, high-throughput connectivity from a corporate datacenter to Azure that avoids the public internet. Which option should the design recommend?',
    options: opts4(
      'Point-to-site VPN',
      'Azure ExpressRoute',
      'Site-to-site VPN over the internet',
      'Public endpoints with firewall rules'
    ),
    correct: ['b'],
    explanation: 'ExpressRoute delivers a private, dedicated circuit with predictable, high bandwidth that bypasses the public internet. VPN options run over the internet, and public endpoints do not provide private datacenter connectivity.',
    references: [REF_VNET, REF_VWAN]
  },
  {
    domain: INFRA, difficulty: 4, type: QType.SINGLE,
    stem: 'A complex microservices platform requires advanced pod networking, custom ingress controllers, and a service mesh, and the team will manage cluster upgrades. Which compute platform should be designed?',
    options: opts4(
      'Azure App Service',
      'Azure Kubernetes Service (AKS)',
      'Azure Functions Consumption',
      'A single VM with Docker'
    ),
    correct: ['b'],
    explanation: 'AKS supports advanced CNI networking, custom ingress, and service meshes when the team can own cluster operations. App Service/Functions abstract orchestration away, and a single VM cannot deliver resilient orchestration.',
    references: [REF_AKS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A checkout service occasionally receives huge request spikes that overwhelm downstream payment processing. Which architectural element should the design add to smooth load?',
    options: opts4(
      'A message queue (Service Bus) to buffer requests for steady consumption',
      'Remove retries entirely',
      'Scale the payment database down',
      'Process all requests synchronously on one thread'
    ),
    correct: ['a'],
    explanation: 'Inserting a queue applies queue-based load leveling so payment processing consumes at a sustainable rate during spikes. Removing retries, downsizing the database, or single-threaded synchronous processing reduce resilience and throughput.',
    references: [REF_SERVICEBUS, REF_ARCH]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service provides a globally accelerated, WAF-protected HTTP front end with edge caching for a multi-region web application?',
    options: opts4(
      'Azure Front Door (with WAF)',
      'A regional internal load balancer',
      'Azure Bastion',
      'A single VM public IP'
    ),
    correct: ['a'],
    explanation: 'Azure Front Door offers global HTTP acceleration, edge caching, and integrated WAF across regions. A regional internal LB has no global reach, Bastion is for VM management, and a single VM public IP lacks acceleration/security.',
    references: [REF_FRONTDOOR]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Design identity, governance, and monitoring (18) ──
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A container running in Azure Container Apps must read a secret from Key Vault with no credentials in the image. Which design should be recommended?',
    options: opts4(
      'Bake the secret into the container image',
      'Use a managed identity for the Container App with Key Vault access',
      'Use a shared admin account',
      'Pass the secret as a plaintext environment variable in source control'
    ),
    correct: ['b'],
    explanation: 'A managed identity lets the container app retrieve the secret from Key Vault without storing credentials. Baking secrets into images, shared admin accounts, and plaintext secrets in source control are insecure anti-patterns.',
    references: [REF_MI, REF_KEYVAULT]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must require phishing-resistant MFA for administrators accessing the Azure portal. Which capability enforces this condition?',
    options: opts4(
      'Conditional Access requiring an authentication strength (phishing-resistant MFA) for admin roles on the Azure Management app',
      'Per-user MFA with SMS only',
      'Security defaults',
      'A resource lock'
    ),
    correct: ['a'],
    explanation: 'Conditional Access with an authentication-strength policy can mandate phishing-resistant methods (e.g., FIDO2/certificate) for admins on the management app. SMS per-user MFA is not phishing-resistant, security defaults are not granular, and locks are unrelated.',
    references: [REF_CA]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL valid components of an Azure governance design at scale.',
    options: opts4(
      'Management group hierarchy for organizing subscriptions',
      'Azure Policy initiatives assigned at management group scope',
      'Granting every developer Owner at the tenant root',
      'Azure RBAC assignments at the narrowest effective scope'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Management groups, policy initiatives at scale, and least-privilege RBAC are core governance building blocks. Granting all developers tenant-root Owner is the opposite of least privilege and a severe risk.',
    references: [REF_MG, REF_POLICY]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'A company must prevent any resource from being created outside two approved regions across all subscriptions. Which design should be used?',
    options: opts4(
      'An email policy to developers',
      'An "allowed locations" Azure Policy with deny effect assigned at the management group',
      'A ReadOnly lock on each subscription',
      'NSGs restricting regions'
    ),
    correct: ['b'],
    explanation: 'The built-in allowed-locations policy with a deny effect at the management group blocks deployments outside approved regions for all child subscriptions. Emails are not enforced, ReadOnly locks block all changes, and NSGs do not control regions.',
    references: [REF_POLICY, REF_MG]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Privileged Identity Management can require approval and impose a time limit before a user can use the Global Administrator role.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. PIM supports eligible assignments with approval workflows and time-bound activation for privileged roles such as Global Administrator, enforcing just-in-time least privilege.',
    references: [REF_PIM]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must centralize logs from multiple subscriptions for cross-subscription KQL queries and security analytics. Which element is central?',
    options: opts4(
      'A separate storage account per resource with no central store',
      'A centralized Log Analytics workspace receiving diagnostic settings from all subscriptions',
      'Only local VM event logs',
      'Application Insights for one app only'
    ),
    correct: ['b'],
    explanation: 'A centralized Log Analytics workspace ingesting diagnostic data from all subscriptions enables cross-subscription KQL analytics and security correlation. Per-resource storage, local logs, or one-app App Insights cannot provide centralized analytics.',
    references: [REF_LAW, REF_MONITOR]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ensure that storage accounts always have secure transfer (HTTPS) enforced organization-wide, automatically remediating non-compliant accounts. Which Azure Policy effect should be used?',
    options: opts4(
      'audit',
      'deny only',
      'modify (with remediation) to enforce secure transfer',
      'disabled'
    ),
    correct: ['c'],
    explanation: 'A modify-effect policy with remediation can set "secure transfer required" on existing and new accounts, enforcing HTTPS at scale. audit only reports, deny blocks new non-compliant accounts but cannot fix existing ones, and disabled turns it off.',
    references: [REF_POLICY, REF_STORAGE]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service should the monitoring design use to get a regulatory compliance dashboard mapped to standards like ISO 27001 and PCI DSS for Azure resources?',
    options: opts4(
      'Microsoft Defender for Cloud regulatory compliance',
      'Azure Advisor',
      'Network Watcher',
      'Azure Service Health'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud’s regulatory compliance dashboard maps resource state to standards such as ISO 27001 and PCI DSS. Advisor is best-practice guidance, Network Watcher diagnoses networking, and Service Health reports platform incidents.',
    references: [REF_DEFENDER]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'External auditors need temporary, read-only access to one subscription for two weeks without permanent accounts. Which design is most appropriate?',
    options: opts4(
      'Create permanent internal admin accounts',
      'Entra B2B guest invites with the Reader role scoped to the subscription, plus an access review/expiry',
      'Share the global admin password',
      'Disable Conditional Access for auditors'
    ),
    correct: ['b'],
    explanation: 'B2B guests with the Reader role and an access review/expiration provide temporary least-privilege auditor access without permanent accounts. Permanent admin accounts, sharing global admin, or disabling Conditional Access are insecure.',
    references: [REF_ENTRA, REF_RBAC]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must alert operations when available memory on a production VM stays below 10% for 10 minutes and automatically open an ITSM ticket. Which Azure Monitor design fits?',
    options: opts4(
      'A pinned dashboard tile',
      'A metric alert rule with an action group integrated to the ITSM connector',
      'A diagnostic setting only',
      'A storage lifecycle policy'
    ),
    correct: ['b'],
    explanation: 'A metric alert on available memory with an action group that includes an ITSM connector notifies and opens tickets automatically. Dashboards visualize but do not alert, diagnostic settings only route data, and lifecycle policies manage blobs.',
    references: [REF_MONITOR]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Azure RBAC role assignment design.',
    options: opts4(
      'Assignments are inherited from parent scopes (management group → subscription → resource group → resource).',
      'Built-in roles should be preferred over custom roles when they meet the requirement.',
      'Deny assignments and RBAC role assignments are the same thing.',
      'Scope should be as narrow as possible for least privilege.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'RBAC inherits down the hierarchy, built-in roles are preferred when sufficient, and narrow scope supports least privilege. Deny assignments are a distinct mechanism (e.g., used by Blueprints/managed apps), not the same as role assignments.',
    references: [REF_RBAC, REF_MG]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A design must notify finance when a department’s monthly spend reaches 80% and 100% of its budget. Which element should be specified?',
    options: opts4(
      'A Cost Management budget with 80% and 100% alert thresholds and an action group',
      'An NSG flow log',
      'A resource lock',
      'A Log Analytics retention policy'
    ),
    correct: ['a'],
    explanation: 'Cost Management budgets support multiple percentage thresholds (e.g., 80% and 100%) that trigger alerts/actions for proactive financial governance. NSG flow logs, locks, and retention policies do not track spend.',
    references: [REF_COST]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design needs application-level distributed tracing and end-to-end transaction diagnostics across microservices. Which service should be used?',
    options: opts4(
      'Application Insights (distributed tracing / application map)',
      'Azure Policy',
      'Azure Advisor',
      'Network Watcher connection monitor'
    ),
    correct: ['a'],
    explanation: 'Application Insights provides distributed tracing and an application map for end-to-end transaction diagnostics across services. Policy governs configuration, Advisor gives recommendations, and Network Watcher diagnoses network paths.',
    references: [REF_MONITOR]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which role should a design assign to let an automation team manage access (role assignments) but not other resources in a subscription?',
    options: opts4(
      'Owner',
      'User Access Administrator',
      'Reader',
      'Contributor'
    ),
    correct: ['b'],
    explanation: 'User Access Administrator allows managing user access/role assignments without broad resource management. Owner adds full resource control, Reader cannot change access, and Contributor manages resources but not role assignments.',
    references: [REF_RBAC]
  },
  {
    domain: IDGM, difficulty: 4, type: QType.SINGLE,
    stem: 'An enterprise wants new subscriptions to automatically inherit security baseline policies, a centralized logging connection, and tag enforcement, applied consistently and at scale. Which design approach should be recommended?',
    options: opts4(
      'Manually configure each subscription as needed',
      'Implement a landing zone with policy initiatives (audit/deny/deployIfNotExists) assigned at the management group hierarchy',
      'Use a wiki checklist and trust teams to comply',
      'Disable governance to speed delivery'
    ),
    correct: ['b'],
    explanation: 'A landing zone with policy initiatives at the management group hierarchy automatically and consistently baselines every current and future subscription. Manual steps and checklists are not enforced; disabling governance fails compliance.',
    references: [REF_BLUEPRINT, REF_POLICY]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ensure privileged role activations are logged and reviewed, and that activation requires justification. Which Entra ID capability should be used?',
    options: opts4(
      'Privileged Identity Management with activation justification and audit logs',
      'Self-service password reset',
      'Conditional Access location policy only',
      'Resource locks'
    ),
    correct: ['a'],
    explanation: 'PIM logs privileged activations, can require justification (and approval), and supports access reviews. SSPR and a location-only Conditional Access policy do not govern privileged-role activation, and locks are unrelated.',
    references: [REF_PIM]
  },
  {
    domain: IDGM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which design element should be used to receive recommendations to right-size or shut down underutilized VMs to reduce cost?',
    options: opts4(
      'Azure Advisor cost recommendations',
      'Azure Policy deny',
      'A Recovery Services vault',
      'Network Watcher'
    ),
    correct: ['a'],
    explanation: 'Azure Advisor analyzes utilization and recommends right-sizing or shutting down idle VMs to cut cost. Policy deny enforces governance, a Recovery Services vault is for backup, and Network Watcher diagnoses networking.',
    references: [REF_COST]
  },
  {
    domain: IDGM, difficulty: 3, type: QType.SINGLE,
    stem: 'A subscription must block deletion of a production resource group while still allowing teams to deploy and update resources within it. Which design should be applied?',
    options: opts4(
      'A ReadOnly lock on the resource group',
      'A CanNotDelete lock on the resource group',
      'Removing all RBAC',
      'An Azure Policy audit assignment'
    ),
    correct: ['b'],
    explanation: 'A CanNotDelete lock prevents deletion of the resource group and its resources while still permitting create/update operations. A ReadOnly lock would block updates, removing RBAC blocks legitimate work, and an audit policy only reports.',
    references: [REF_POLICY]
  },

  // ── Design data storage solutions (16) ──
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Compliance logs are written daily, read often for 14 days, then almost never. They must be kept 10 years. Which storage design minimizes cost across the lifetime?',
    options: opts4(
      'Hot tier indefinitely',
      'Hot tier with a lifecycle policy moving blobs to Cool after 14 days and Archive after 90 days, retained 10 years',
      'Azure SQL Database',
      'Azure Files Premium'
    ),
    correct: ['b'],
    explanation: 'A lifecycle policy that tiers aging blobs Hot→Cool→Archive matches the access pattern and minimizes 10-year retention cost. Hot indefinitely overpays, and SQL/Premium Files are unsuitable/expensive for cold log archival.',
    references: [REF_LIFECYCLE, REF_BLOB]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A globally distributed shopping cart needs writes accepted in multiple regions with low latency and high availability, tolerating eventual reconciliation. Which database and configuration fits?',
    options: opts4(
      'Single-region Azure SQL Database',
      'Azure Cosmos DB with multi-region writes and session/eventual consistency',
      'Azure Table storage in one region',
      'A single Redis cache'
    ),
    correct: ['b'],
    explanation: 'Cosmos DB with multi-region writes and session/eventual consistency gives low-latency multi-region writes with high availability for a cart. Single-region SQL/Table cannot accept multi-region writes, and Redis is a cache, not a primary multi-region datastore.',
    references: [REF_COSMOS, REF_COSMOS_CONSISTENCY]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about choosing an Azure relational database service.',
    options: opts4(
      'Azure SQL Managed Instance offers high SQL Server engine compatibility including SQL Agent.',
      'Azure SQL Database single database is the lowest-management option when instance features are not needed.',
      'SQL Server on a VM removes all OS patching responsibility.',
      'Elastic pools share compute across many databases with uncorrelated load.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Managed Instance maximizes engine compatibility, single-database SQL minimizes management for simple needs, and elastic pools share compute efficiently. SQL on a VM is IaaS — you still patch the OS and SQL, so that statement is false.',
    references: [REF_SQLMI, REF_SQL]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Geo-redundant storage (GRS) asynchronously replicates data to a secondary region hundreds of miles away to protect against a regional outage.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. GRS asynchronously copies data to a paired secondary region, protecting against a primary-region outage. RA-GRS additionally exposes the secondary for read access.',
    references: [REF_REDUNDANCY]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A big-data platform needs a storage layer with directory hierarchy, POSIX ACLs, and native integration with Spark/Synapse. Which configuration should be designed?',
    options: opts4(
      'ADLS Gen2 (GPv2 account with hierarchical namespace enabled)',
      'A classic v1 storage account',
      'Azure Queue storage',
      'Azure SQL Database Basic'
    ),
    correct: ['a'],
    explanation: 'ADLS Gen2 (hierarchical namespace on a GPv2 account) provides directory semantics, POSIX ACLs, and analytics-engine integration. v1 accounts, Queue storage, and Basic SQL are not analytics-optimized data lakes.',
    references: [REF_DATALAKE, REF_SYNAPSE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'An enterprise data warehouse must serve thousands of concurrent analytical queries over petabytes with predictable, provisioned performance. Which service should be designed?',
    options: opts4(
      'Azure Synapse Analytics dedicated SQL pool',
      'Azure Cache for Redis',
      'Azure Table storage',
      'A single Basic Azure SQL Database'
    ),
    correct: ['a'],
    explanation: 'A Synapse dedicated SQL pool provides provisioned MPP for large-scale, concurrent data-warehouse queries. Redis is an in-memory cache, Table storage is key-value, and a Basic SQL database cannot handle petabyte-scale analytics.',
    references: [REF_SYNAPSE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Cosmos DB account must be reachable only from a specific subnet with no public access. Which design element should be specified?',
    options: opts4(
      'Allow all networks with a strong key',
      'A private endpoint for the Cosmos DB account and disabling public network access',
      'A SAS token',
      'A CDN endpoint'
    ),
    correct: ['b'],
    explanation: 'A private endpoint maps Cosmos DB into the subnet and disabling public access removes internet exposure. Allowing all networks (even with a key) keeps it public, SAS tokens are a storage concept, and a CDN increases public exposure.',
    references: [REF_PRIVATELINK, REF_COSMOS]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which redundancy option protects against both an availability-zone failure and a full regional outage?',
    options: opts4(
      'LRS',
      'ZRS',
      'GZRS (geo-zone-redundant storage)',
      'Premium block blob (LRS)'
    ),
    correct: ['c'],
    explanation: 'GZRS combines zone redundancy in the primary region with geo-replication to a secondary region, covering both zone and regional failures. LRS is single-datacenter, ZRS is single-region zonal, and premium block blob LRS is single-datacenter.',
    references: [REF_REDUNDANCY]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A SaaS with thousands of tenants needs isolated relational databases with shared, cost-efficient compute and bursty, uncorrelated load. Which design is best?',
    options: opts4(
      'One database per tenant in an Azure SQL Database elastic pool',
      'A single shared database for all tenants',
      'One SQL Managed Instance per tenant',
      'Cosmos DB for all tenants regardless of relational needs'
    ),
    correct: ['a'],
    explanation: 'An elastic pool shares compute across many isolated single-tenant databases with bursty, uncorrelated load — cost-efficient with isolation. A shared DB loses isolation, per-tenant MI is too costly, and Cosmos ignores the relational requirement.',
    references: [REF_SQL]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated database requires the customer to control, rotate, and revoke the encryption keys used for data at rest. Which design element should be specified?',
    options: opts4(
      'Service-managed keys only',
      'Customer-managed keys (BYOK) in Azure Key Vault with key rotation',
      'No encryption to ease key handling',
      'A key embedded in the application config'
    ),
    correct: ['b'],
    explanation: 'Customer-managed keys in Key Vault give the customer control to rotate and revoke keys for data-at-rest encryption. Service-managed keys remove control, disabling encryption is non-compliant, and embedding keys in config is insecure.',
    references: [REF_KEYVAULT, REF_SQL]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL valid design statements for Azure Storage security.',
    options: opts4(
      'Private endpoints can remove public internet exposure for a storage account.',
      'Customer-managed keys in Key Vault enable BYOK encryption.',
      'Storing account keys in client-side code is a recommended practice.',
      'Microsoft Entra ID authorization can replace shared keys for data access.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Private endpoints, CMK/BYOK, and Entra ID-based data authorization are all sound storage-security choices. Embedding account keys in client code is a serious anti-pattern that exposes full account access.',
    references: [REF_PRIVATELINK, REF_KEYVAULT]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Multiple Windows VMs need a shared file share mounted over SMB with managed durability. Which service should the design use?',
    options: opts4(
      'Azure Files (SMB)',
      'Azure Blob Archive tier',
      'Azure Queue storage',
      'Azure Event Hubs'
    ),
    correct: ['a'],
    explanation: 'Azure Files provides managed SMB shares multiple Windows VMs can mount concurrently. Archive blob is for cold objects (not a mountable share), Queue storage is messaging, and Event Hubs is streaming ingestion.',
    references: [REF_STORAGE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A read-heavy product API repeatedly fetches the same catalog rows, overloading the database during peaks. Which design element best reduces load and latency?',
    options: opts4(
      'Introduce Azure Cache for Redis as a read cache in front of the database',
      'Remove all indexes from the database',
      'Lower the database to the Basic tier',
      'Disable connection pooling'
    ),
    correct: ['a'],
    explanation: 'Azure Cache for Redis serves hot catalog data from memory, cutting latency and offloading the database during peaks. Removing indexes, lowering the tier, or disabling pooling all degrade performance.',
    references: [REF_ARCH]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature should the design specify to automatically move blobs to the Cool tier after 30 days of no access and delete them after 2 years?',
    options: opts4(
      'A blob lifecycle management policy with tier-to-Cool and delete actions',
      'Object replication',
      'A CanNotDelete lock',
      'Account failover'
    ),
    correct: ['a'],
    explanation: 'A lifecycle policy can move blobs to Cool based on last-access/age and delete them after the retention period, automating cost optimization. Object replication copies data, a delete lock prevents deletion, and account failover is for DR.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: DATA, difficulty: 4, type: QType.SINGLE,
    stem: 'A relational workload needs minimal admin overhead, cross-region geo-replication with a stable failover endpoint, and readable secondaries for reporting. Which design best meets all requirements?',
    options: opts4(
      'SQL Server on a VM with manual replication',
      'Azure SQL Database with an auto-failover group plus read-scale-out',
      'Single-region Cosmos DB',
      'Azure Table storage with manual copies'
    ),
    correct: ['b'],
    explanation: 'Azure SQL Database auto-failover groups provide geo-replication and a stable listener; read-scale-out offloads reporting — all PaaS-managed with low overhead. IaaS manual replication is high-overhead; single-region Cosmos and Table storage do not meet the relational geo-failover need.',
    references: [REF_SQL]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A legal requirement states evidence files must be immutable and undeletable for exactly 7 years. Which storage capability should be specified?',
    options: opts4(
      'Immutable blob storage with a 7-year time-based retention policy (WORM)',
      'Soft delete for 90 days',
      'A ReadOnly RBAC role',
      'Blob versioning only'
    ),
    correct: ['a'],
    explanation: 'Immutable blob storage with a 7-year time-based retention policy enforces true WORM, blocking modification/deletion for the period. Soft delete, RBAC, and versioning alone can be overridden by privileged users and are not WORM.',
    references: [REF_BLOB]
  },

  // ── Design business continuity solutions (12) ──
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Critical Azure VMs must be recoverable in a secondary region within an RTO of about 30 minutes after a regional disaster. Which service should the design use?',
    options: opts4(
      'Azure Backup only',
      'Azure Site Recovery replicating to the secondary region with a recovery plan',
      'A monthly manual VHD copy',
      'Availability sets only'
    ),
    correct: ['b'],
    explanation: 'Azure Site Recovery continuously replicates VMs and orchestrates failover, meeting a ~30-minute RTO. Backup-only has higher RTO, monthly VHD copies are stale, and availability sets do not cover regional failures.',
    references: [REF_ASR]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload may lose no more than 1 minute of committed transactions. Which metric is this and which design choice best satisfies it for a relational database?',
    options: opts4(
      'RTO; choose a faster restart',
      'RPO ≈ 1 minute; use synchronous/near-synchronous geo-replication (auto-failover group), not periodic backups',
      'SLA; negotiate credits',
      'MTTR; add monitoring'
    ),
    correct: ['b'],
    explanation: 'Maximum tolerable data loss is the RPO. A ~1-minute RPO requires continuous replication (e.g., auto-failover groups), since periodic backups would lose far more than a minute. RTO concerns downtime duration, not data loss.',
    references: [REF_SQL, REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL true statements about Azure availability zones and regional resilience.',
    options: opts4(
      'Zones are physically isolated datacenters within a region.',
      'Zone-redundant deployments survive a single zone/datacenter failure.',
      'Zones by themselves protect against an entire region failing.',
      'Surviving a full regional outage requires a multi-region design.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Zones are isolated datacenters; zone-redundant deployments survive a zone failure; full regional resilience requires multi-region design. Zones alone do not protect against a complete regional outage.',
    references: [REF_AZREGIONS]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service centralizes policy-based backup and long-term retention for Azure VMs and Azure Files with cross-region restore?',
    options: opts4(
      'Azure Site Recovery',
      'Azure Backup with a GRS Recovery Services vault and cross-region restore',
      'Storage soft delete only',
      'A scheduled snapshot script'
    ),
    correct: ['b'],
    explanation: 'Azure Backup with a GRS Recovery Services vault provides centralized policy-based backup, long-term retention, and cross-region restore. ASR is replication/failover, soft delete is not full backup, and ad-hoc scripts lack policy/retention management.',
    references: [REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A customer-facing web platform must keep serving traffic during a complete regional outage with automatic client redirection. Which design pattern should be recommended?',
    options: opts4(
      'Single-region with autoscale only',
      'Multi-region active-active (or active-passive) behind Azure Front Door with health-based failover',
      'A larger single VM',
      'Single availability zone'
    ),
    correct: ['b'],
    explanation: 'Multi-region deployment behind Azure Front Door with health-probe-based failover automatically redirects users when a region fails. Single-region/zone or bigger VMs cannot survive a regional outage.',
    references: [REF_FRONTDOOR, REF_TM]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Site Recovery test failover lets you validate disaster recovery in an isolated network without affecting the production workload.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. ASR test failover spins up replicated VMs in an isolated network for non-disruptive DR drills, a recommended practice to validate recovery plans.',
    references: [REF_ASR]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A mission-critical Azure SQL Database needs near-zero RPO and an automatic cross-region failover endpoint with minimal admin effort. Which design element fits?',
    options: opts4(
      'Weekly long-term retention backups',
      'An auto-failover group with a geo-secondary',
      'A nightly BACPAC export only',
      'Zone redundancy only'
    ),
    correct: ['b'],
    explanation: 'An auto-failover group provides continuous geo-replication (near-zero RPO) and an automatic, stable failover listener with minimal admin effort. Backups/BACPAC have hours/days RPO; zone redundancy alone does not cover a regional outage.',
    references: [REF_SQL]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A stateless API on AKS must keep serving requests if a single datacenter in the region fails. Which design choice helps most?',
    options: opts4(
      'A single-node cluster',
      'Node pools and pod replicas spread across multiple availability zones',
      'Pinning all pods to one node',
      'Disabling the cluster autoscaler'
    ),
    correct: ['b'],
    explanation: 'Spreading AKS node pools and pod replicas across availability zones keeps the service running if one zone/datacenter fails. A single node, single-node pinning, or disabled autoscaling create single points of failure.',
    references: [REF_AKS, REF_AZREGIONS]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'How should a design protect Azure Backup recovery points against malicious deletion (e.g., ransomware)?',
    options: opts4(
      'Disable backups during incidents',
      'Enable soft delete (and immutable vault / multi-user authorization) on the Recovery Services vault',
      'Store backups only on the source VM',
      'Delete old recovery points immediately'
    ),
    correct: ['b'],
    explanation: 'Soft delete plus immutable vault and multi-user authorization protect recovery points from malicious or accidental deletion. Disabling backups, co-locating backups on the source, or immediately deleting points removes recoverability.',
    references: [REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'A VM-based application requires RPO of 5 minutes and RTO of 45 minutes for a regional disaster, with an orchestrated, tested recovery. Which single design best meets both?',
    options: opts4(
      'Daily Azure Backup only',
      'Azure Site Recovery continuous replication to the paired region with a tested recovery plan',
      'Availability zones only',
      'A weekly disk snapshot'
    ),
    correct: ['b'],
    explanation: 'ASR continuous replication achieves a low RPO and its orchestrated, testable recovery plan enables failover within the 45-minute RTO. Daily backups give ~24h RPO, zones do not cover regional outages, and weekly snapshots are far too infrequent.',
    references: [REF_ASR, REF_BACKUP]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'A globally distributed Cosmos DB application must continue to operate if a single region becomes unavailable, with minimal manual steps. Which configuration should be designed?',
    options: opts4(
      'A single region with manual restore from backup',
      'Multiple regions with automatic failover enabled (optionally multi-region writes)',
      'A nightly export to blob only',
      'Geo-replication disabled to cut cost'
    ),
    correct: ['b'],
    explanation: 'Multiple regions with automatic failover let Cosmos DB transparently promote a healthy region; multi-region writes keep writes available. Single-region with manual restore, export-only, or disabled geo-replication cannot meet automatic resilience.',
    references: [REF_COSMOS]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization wants a BCDR strategy where investment in redundancy is proportional to each workload’s business criticality and recovery objectives. Which approach aligns with AZ-305 guidance?',
    options: opts4(
      'Apply identical geo-redundant active-active to all workloads regardless of need',
      'Classify workloads by criticality and assign tiered DR (backup, zones, geo-replication, ASR) matched to each tier’s RPO/RTO and budget',
      'Protect only the website and ignore data tiers',
      'Depend solely on the platform SLA'
    ),
    correct: ['b'],
    explanation: 'Tiering workloads by business impact and matching DR mechanisms to each tier’s RPO/RTO balances resilience against cost. Uniform active-active over-spends, ignoring data tiers is unsafe, and an SLA is not a recovery design.',
    references: [REF_WAF, REF_ASR]
  },

  // ── Design infrastructure solutions (19) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A web API container must autoscale on HTTP load and scale to zero when idle, without operating a Kubernetes control plane. Which service should the design recommend?',
    options: opts4(
      'Azure Container Apps',
      'Self-managed Kubernetes on VMs',
      'A single VM running Docker',
      'Azure Batch'
    ),
    correct: ['a'],
    explanation: 'Azure Container Apps provides serverless containers with HTTP-based autoscaling (including scale-to-zero) and managed ingress, without Kubernetes control-plane operations. Self-managed Kubernetes or a single VM add operational burden, and Batch is for parallel jobs.',
    references: [REF_CONTAINERAPPS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A public web app needs path-based routing, TLS termination, autoscaling, and WAF protection within one region. Which service should be designed?',
    options: opts4(
      'Azure Application Gateway (v2) with WAF',
      'Azure Load Balancer (Standard)',
      'Azure Traffic Manager',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Application Gateway v2 supports path-based routing, TLS termination, autoscaling, and an integrated WAF. Load Balancer is Layer 4, Traffic Manager is DNS-based global routing, and Bastion provides secure VM management access.',
    references: [REF_APPGW]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL appropriate uses of Azure Event Hubs in a solution design.',
    options: opts4(
      'High-throughput ingestion of millions of telemetry events per second',
      'Event streaming with partitioned retention enabling replay',
      'Reliable transactional command messaging with dead-lettering',
      'Feeding a stream-processing/analytics pipeline'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Event Hubs is built for high-throughput streaming ingestion, partitioned retention/replay, and feeding analytics pipelines. Reliable transactional command messaging with dead-lettering is a Service Bus scenario.',
    references: [REF_EVENTHUBS, REF_SERVICEBUS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A hub VNet must connect to many spoke VNets in the same region privately with low latency. Which design element should be used?',
    options: opts4(
      'Regional VNet peering between hub and each spoke',
      'Public IPs and NSGs',
      'Internet-only VPN tunnels',
      'A Traffic Manager profile'
    ),
    correct: ['a'],
    explanation: 'Regional VNet peering connects the hub to each spoke privately over the Microsoft backbone with low latency, the basis of hub-and-spoke. Public IPs and internet VPNs add exposure/latency, and Traffic Manager is DNS routing.',
    references: [REF_VNET]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A multinational needs managed any-to-any connectivity for hundreds of branches and VNets with optimized routing and minimal manual gateway management. Which service should be designed?',
    options: opts4(
      'Azure Virtual WAN',
      'A single flat global VNet',
      'Manually meshed per-VNet VPN gateways',
      'Public IP exposure for all servers'
    ),
    correct: ['a'],
    explanation: 'Azure Virtual WAN provides a managed global transit network with optimized routing for large-scale branch/VNet connectivity. A flat VNet harms segmentation, manual mesh does not scale, and public IP exposure is insecure.',
    references: [REF_VWAN]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure App Service abstracts the underlying OS so the team does not patch or manage the host operating system.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'True. App Service is a managed PaaS; Microsoft manages the host OS and patching, letting teams focus on the application. IaaS VMs, by contrast, require OS management.',
    references: [REF_APPSVC]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An event-driven function processes blob-upload events with highly variable, spiky volume and must minimize idle cost. Which compute option should be designed?',
    options: opts4(
      'An always-on VM scale set kept warm',
      'Azure Functions on the Consumption plan triggered by the blob/event',
      'A dedicated AKS cluster running continuously',
      'Azure Batch'
    ),
    correct: ['b'],
    explanation: 'Functions on the Consumption plan scale per event and to zero when idle, billing per execution — ideal for spiky event-driven processing. Warm scale sets and always-on clusters waste idle cost, and Batch targets large parallel jobs.',
    references: [REF_FUNCTIONS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An order workflow must process commands reliably, in order, with transactional handling and a dead-letter path for poison messages. Which service should the design use?',
    options: opts4(
      'Azure Event Grid',
      'Azure Service Bus queues with sessions and dead-letter queues',
      'Azure Event Hubs',
      'Azure Blob storage events'
    ),
    correct: ['b'],
    explanation: 'Service Bus provides reliable, ordered (sessions), transactional command processing with dead-letter queues for poison messages. Event Grid is reactive pub/sub, Event Hubs is high-throughput streaming, and blob events are notifications, not a broker.',
    references: [REF_SERVICEBUS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A solution must notify many independent subscribers immediately when a resource changes, using a serverless publish-subscribe model. Which service should be designed?',
    options: opts4(
      'Azure Event Grid',
      'Azure Service Bus queue',
      'Azure Files',
      'Azure SQL Database'
    ),
    correct: ['a'],
    explanation: 'Event Grid is a serverless pub/sub router that pushes change events to many subscribers in near real time. A Service Bus queue is point-to-point, and Files/SQL are not event distribution services.',
    references: [REF_EVENTGRID]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A migration project must inventory on-premises Hyper-V servers, analyze dependencies, and recommend right-sized Azure VM SKUs before moving. Which service should be used?',
    options: opts4(
      'Azure Migrate',
      'Azure Site Recovery only',
      'Azure Cost Management',
      'Azure Resource Mover'
    ),
    correct: ['a'],
    explanation: 'Azure Migrate discovers servers, maps dependencies, and recommends right-sized SKUs and costs for migration planning. ASR performs replication/cutover, Cost Management is financial, and Resource Mover relocates existing Azure resources between regions.',
    references: [REF_MIGRATE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid statements about choosing Azure compute services.',
    options: opts4(
      'Azure Functions suits short, event-driven, bursty workloads with scale-to-zero.',
      'AKS suits complex orchestration when the team can manage clusters.',
      'App Service suits managed web apps needing slots and autoscale.',
      'A single VM is the best choice for elastic, highly available web tiers.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Functions fit bursty event-driven code, AKS fits complex orchestration with cluster ownership, and App Service fits managed web apps with slots/autoscale. A single VM is a single point of failure and not elastic, so the last statement is false.',
    references: [REF_FUNCTIONS, REF_AKS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A stateless web tier must scale identical instances out and in based on CPU and queue depth. Which compute construct should be designed?',
    options: opts4(
      'A single large VM',
      'A Virtual Machine Scale Set with autoscale rules',
      'Azure Batch',
      'A Dedicated Host'
    ),
    correct: ['b'],
    explanation: 'A VM Scale Set deploys identical VMs and autoscales based on metrics like CPU or queue length, fitting an elastic stateless tier. A single VM cannot scale horizontally, Batch is for parallel jobs, and Dedicated Host provides isolation, not autoscaling.',
    references: [REF_VMSLA]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An application needs zone-resilient Layer-4 distribution of inbound TCP traffic to backend VMs in one region. Which service should be designed?',
    options: opts4(
      'Azure Standard Load Balancer with a zone-redundant frontend',
      'Azure Traffic Manager',
      'Azure Front Door',
      'Azure Application Gateway'
    ),
    correct: ['a'],
    explanation: 'A zone-redundant Standard Load Balancer provides high-performance Layer-4 distribution that survives a single zone failure. Traffic Manager and Front Door are global, and Application Gateway operates at Layer 7.',
    references: [REF_LB, REF_AZREGIONS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which design provides secure administrative access to VMs without exposing RDP/SSH public ports to the internet?',
    options: opts4(
      'Open RDP/SSH to the internet with strong passwords',
      'Azure Bastion for browser-based RDP/SSH over the Azure backbone',
      'Assign public IPs to every VM',
      'Disable all NSGs'
    ),
    correct: ['b'],
    explanation: 'Azure Bastion provides secure RDP/SSH connectivity through the portal over the Azure backbone, with no public IP on the VMs and no exposed management ports. Opening RDP/SSH publicly or disabling NSGs greatly increases attack surface.',
    references: [REF_VNET]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A scheduled job runs for ~45 minutes a few times per day and must avoid paying for idle compute between runs. Which option is most appropriate?',
    options: opts4(
      'An always-on D-series VM',
      'A scheduled Container Apps job (or Functions Premium) that scales out for the run and to zero afterward',
      'A continuously running AKS cluster doing nothing between runs',
      'Azure Traffic Manager'
    ),
    correct: ['b'],
    explanation: 'A scheduled Container Apps job (or Functions Premium for longer runs) executes for the ~45-minute run and scales to zero between runs, paying only for active time. An always-on VM or idle cluster wastes cost; Traffic Manager is not compute.',
    references: [REF_CONTAINERAPPS, REF_FUNCTIONS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid workload requires private, predictable, high-bandwidth connectivity from on-premises to Azure that does not use the public internet. Which option should the design recommend?',
    options: opts4(
      'Point-to-site VPN',
      'Azure ExpressRoute',
      'Site-to-site VPN over the internet',
      'Public endpoints with IP allow-lists'
    ),
    correct: ['b'],
    explanation: 'ExpressRoute provides a private, dedicated, high-bandwidth circuit with predictable performance that bypasses the public internet. VPN options run over the internet, and public endpoints do not provide private datacenter connectivity.',
    references: [REF_VNET, REF_VWAN]
  },
  {
    domain: INFRA, difficulty: 4, type: QType.SINGLE,
    stem: 'A platform team needs advanced container orchestration with custom CNI networking, autoscaling node pools across zones, and a service mesh, accepting cluster operational ownership. Which compute platform should be designed?',
    options: opts4(
      'Azure App Service',
      'Azure Kubernetes Service (AKS) with zone-spanning node pools',
      'Azure Functions Consumption',
      'A single VM with Docker Compose'
    ),
    correct: ['b'],
    explanation: 'AKS with zone-spanning node pools delivers advanced orchestration, custom CNI, autoscaling, and service-mesh support when the team owns cluster operations. App Service/Functions abstract orchestration, and a single VM cannot provide resilient orchestration.',
    references: [REF_AKS, REF_AZREGIONS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A flash-sale system experiences sudden enormous request bursts that overwhelm inventory processing. Which architectural element should the design add to absorb the bursts?',
    options: opts4(
      'A message queue (Service Bus) between intake and inventory processing to level the load',
      'Remove all autoscaling',
      'Process every request synchronously on a single instance',
      'Downsize the inventory database'
    ),
    correct: ['a'],
    explanation: 'Adding a queue applies queue-based load leveling, buffering bursts so inventory processing consumes at a sustainable rate. Removing autoscaling, single-instance synchronous processing, or downsizing the database reduce capacity and resilience.',
    references: [REF_SERVICEBUS, REF_ARCH]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service provides a globally accelerated, WAF-protected, cached HTTP entry point with path-based routing for a multi-region web application?',
    options: opts4(
      'Azure Front Door (Premium) with WAF',
      'A single regional load balancer',
      'Azure Bastion',
      'A public IP per VM'
    ),
    correct: ['a'],
    explanation: 'Azure Front Door Premium offers global HTTP acceleration, edge caching, integrated WAF, and path-based routing across regions. A regional LB lacks global reach, Bastion is for VM management, and per-VM public IPs lack acceleration/security.',
    references: [REF_FRONTDOOR]
  }
];

const AZ305_DOMAINS = [
  { name: IDGM, weight: 28 },
  { name: DATA, weight: 24 },
  { name: BCDR, weight: 18 },
  { name: INFRA, weight: 30 }
];

const AZ305_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-az-305-p1',
    code: 'AZ-305-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering identity/governance/monitoring design, data storage design, business continuity design, and infrastructure solution design.',
    questions: P1
  },
  {
    slug: 'microsoft-az-305-p2',
    code: 'AZ-305-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-az-305-p3',
    code: 'AZ-305-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const AZ305_BUNDLE = {
  slug: 'microsoft-az-305',
  title: 'Microsoft Azure Solutions Architect Expert (AZ-305)',
  description: 'Unlimited AZ-305 practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering identity, governance, and monitoring design; data storage design; business continuity design; and infrastructure solution design, aligned to the Designing Microsoft Azure Infrastructure Solutions (AZ-305) exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the AZ-305 bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:az305-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedAz305(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft Azure certifications — fundamentals, administration, and the Azure Solutions Architect Expert credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft Azure certifications — fundamentals, administration, and the Azure Solutions Architect Expert credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of AZ305_EXAMS) {
    const title = `Microsoft Azure Solutions Architect Expert (AZ-305) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Designing Microsoft Azure Infrastructure Solutions (AZ-305) exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Expert',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: AZ305_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:az305-seed' } });
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
          generatedBy: 'manual:az305-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: AZ305_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: AZ305_BUNDLE.slug },
    update: {
      title: AZ305_BUNDLE.title,
      description: AZ305_BUNDLE.description,
      price: AZ305_BUNDLE.price,
      priceVoucher: AZ305_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: AZ305_BUNDLE.slug,
      title: AZ305_BUNDLE.title,
      description: AZ305_BUNDLE.description,
      price: AZ305_BUNDLE.price,
      priceVoucher: AZ305_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-az-305-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-az-305-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-az-305-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-az-305-p1', tier: 'VOUCHER' as const, position: 4 }
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
