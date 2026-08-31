/**
 * SC-100 bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:sc100-seed'` and upserts catalog rows.
 *
 * Exported as `seedSc100(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/sc100.ts`) and the protected
 * admin API (`/api/admin/seed-sc100`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn
 * SC-100 study guide, the Microsoft Cybersecurity Reference
 * Architectures (MCRA), and the Zero Trust guidance. Each variant has
 * 65 questions blueprint-weighted to the official SC-100 domains:
 *   - Design Solutions That Align with Security Best Practices
 *     and Priorities                                            — 24% (16)
 *   - Design Security Operations, Identity, and Compliance
 *     Capabilities                                              — 27% (17)
 *   - Design Security Solutions for Infrastructure              — 23% (15)
 *   - Design Security Solutions for Applications and Data       — 26% (17)
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

const BEST = 'Design Solutions That Align with Security Best Practices and Priorities';
const OPS = 'Design Security Operations, Identity, and Compliance Capabilities';
const INFRA = 'Design Security Solutions for Infrastructure';
const APPDATA = 'Design Security Solutions for Applications and Data';

const REF_MCRA = { label: 'Microsoft Learn — Microsoft Cybersecurity Reference Architectures (MCRA)', url: 'https://learn.microsoft.com/en-us/security/adoption/mcra' };
const REF_ZT = { label: 'Microsoft Learn — Zero Trust overview', url: 'https://learn.microsoft.com/en-us/security/zero-trust/zero-trust-overview' };
const REF_ZT_RAMP = { label: 'Microsoft Learn — Zero Trust rapid modernization plan', url: 'https://learn.microsoft.com/en-us/security/zero-trust/zero-trust-ramp-overview' };
const REF_CAF = { label: 'Microsoft Learn — Cloud Adoption Framework: Secure methodology', url: 'https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/secure/' };
const REF_WAF_SEC = { label: 'Microsoft Learn — Azure Well-Architected Framework: Security pillar', url: 'https://learn.microsoft.com/en-us/azure/well-architected/security/' };
const REF_BENCHMARK = { label: 'Microsoft Learn — Microsoft cloud security benchmark', url: 'https://learn.microsoft.com/en-us/security/benchmark/azure/' };
const REF_DEFENDER_CLOUD = { label: 'Microsoft Learn — Microsoft Defender for Cloud', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction' };
const REF_SENTINEL = { label: 'Microsoft Learn — Microsoft Sentinel overview', url: 'https://learn.microsoft.com/en-us/azure/sentinel/overview' };
const REF_XDR = { label: 'Microsoft Learn — Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender' };
const REF_CA = { label: 'Microsoft Learn — Conditional Access overview', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview' };
const REF_PIM = { label: 'Microsoft Learn — Privileged Identity Management (PIM)', url: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure' };
const REF_IDGOV = { label: 'Microsoft Learn — Microsoft Entra ID Governance', url: 'https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview' };
const REF_PURVIEW = { label: 'Microsoft Learn — Microsoft Purview', url: 'https://learn.microsoft.com/en-us/purview/purview' };
const REF_DLP = { label: 'Microsoft Learn — Microsoft Purview Data Loss Prevention', url: 'https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp' };
const REF_MIP = { label: 'Microsoft Learn — Microsoft Purview Information Protection', url: 'https://learn.microsoft.com/en-us/purview/information-protection' };
const REF_INSIDER = { label: 'Microsoft Learn — Microsoft Purview Insider Risk Management', url: 'https://learn.microsoft.com/en-us/purview/insider-risk-management' };
const REF_KEYVAULT = { label: 'Microsoft Learn — Azure Key Vault overview', url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/overview' };
const REF_PRIVLINK = { label: 'Microsoft Learn — Azure Private Link', url: 'https://learn.microsoft.com/en-us/azure/private-link/private-link-overview' };
const REF_FIREWALL = { label: 'Microsoft Learn — Azure Firewall', url: 'https://learn.microsoft.com/en-us/azure/firewall/overview' };
const REF_DDOS = { label: 'Microsoft Learn — Azure DDoS Protection', url: 'https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview' };
const REF_BASTION = { label: 'Microsoft Learn — Azure Bastion', url: 'https://learn.microsoft.com/en-us/azure/bastion/bastion-overview' };
const REF_NSG = { label: 'Microsoft Learn — Network security groups', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview' };
const REF_POLICY = { label: 'Microsoft Learn — Azure Policy overview', url: 'https://learn.microsoft.com/en-us/azure/governance/policy/overview' };
const REF_LZ = { label: 'Microsoft Learn — Azure landing zones', url: 'https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/' };
const REF_RBAC = { label: 'Microsoft Learn — Azure RBAC', url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/overview' };
const REF_DEFENDER_SERVERS = { label: 'Microsoft Learn — Microsoft Defender for Servers', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/plan-defender-for-servers' };
const REF_DEFENDER_DEVOPS = { label: 'Microsoft Learn — Microsoft Defender for DevOps / DevOps security', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-devops-introduction' };
const REF_APIM = { label: 'Microsoft Learn — Azure API Management', url: 'https://learn.microsoft.com/en-us/azure/api-management/api-management-key-concepts' };
const REF_WAF_APP = { label: 'Microsoft Learn — Azure Web Application Firewall', url: 'https://learn.microsoft.com/en-us/azure/web-application-firewall/overview' };
const REF_SDL = { label: 'Microsoft Learn — Microsoft Security Development Lifecycle', url: 'https://learn.microsoft.com/en-us/security/sdl/' };
const REF_SECURE_SCORE = { label: 'Microsoft Learn — Secure score in Defender for Cloud', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls' };
const REF_DEFENDER_DB = { label: 'Microsoft Learn — Microsoft Defender for SQL', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-sql-introduction' };
const REF_ENCRYPTION = { label: 'Microsoft Learn — Azure data encryption at rest', url: 'https://learn.microsoft.com/en-us/azure/security/fundamentals/encryption-atrest' };
const REF_DEFENDER_IOT = { label: 'Microsoft Learn — Microsoft Defender for IoT', url: 'https://learn.microsoft.com/en-us/azure/defender-for-iot/organizations/overview' };
const REF_SECOPS = { label: 'Microsoft Learn — Security operations (SecOps) functions', url: 'https://learn.microsoft.com/en-us/security/operations/security-operations-functions' };
const REF_INCIDENT = { label: 'Microsoft Learn — Incident response overview', url: 'https://learn.microsoft.com/en-us/security/operations/incident-response-overview' };
const REF_SOAR = { label: 'Microsoft Learn — Automation rules and playbooks in Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/automation' };
const REF_COMPLIANCE = { label: 'Microsoft Learn — Microsoft Purview Compliance Manager', url: 'https://learn.microsoft.com/en-us/purview/compliance-manager' };
const REF_RANSOMWARE = { label: 'Microsoft Learn — Protect your organization against ransomware', url: 'https://learn.microsoft.com/en-us/security/ransomware/' };
const REF_BCDR = { label: 'Microsoft Learn — Backup and disaster recovery for ransomware', url: 'https://learn.microsoft.com/en-us/security/ransomware/backup-plan-to-protect-against-ransomware' };
const REF_HYBRID_ID = { label: 'Microsoft Learn — Hybrid identity', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/whatis-hybrid-identity' };
const REF_CAE = { label: 'Microsoft Learn — Continuous access evaluation', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-continuous-access-evaluation' };
const REF_ENTITLEMENT = { label: 'Microsoft Learn — Entitlement management', url: 'https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-overview' };
const REF_ACCESS_REVIEW = { label: 'Microsoft Learn — Access reviews', url: 'https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview' };
const REF_GDAP = { label: 'Microsoft Learn — Microsoft Entra Permissions Management', url: 'https://learn.microsoft.com/en-us/entra/permissions-management/overview' };
const REF_PRIV_ACCESS = { label: 'Microsoft Learn — Privileged access strategy', url: 'https://learn.microsoft.com/en-us/security/privileged-access-workstations/privileged-access-strategy' };
const REF_PAW = { label: 'Microsoft Learn — Privileged access devices (PAW)', url: 'https://learn.microsoft.com/en-us/security/privileged-access-workstations/privileged-access-devices' };
const REF_AKS_SEC = { label: 'Microsoft Learn — Azure Kubernetes Service security concepts', url: 'https://learn.microsoft.com/en-us/azure/aks/concepts-security' };
const REF_DEFENDER_CONTAINERS = { label: 'Microsoft Learn — Microsoft Defender for Containers', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-introduction' };
const REF_DEFENDER_STORAGE = { label: 'Microsoft Learn — Microsoft Defender for Storage', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-storage-introduction' };
const REF_GAP = { label: 'Microsoft Learn — Global Secure Access (Microsoft Entra)', url: 'https://learn.microsoft.com/en-us/entra/global-secure-access/overview-what-is-global-secure-access' };
const REF_DEFENDER_APPS = { label: 'Microsoft Learn — Microsoft Defender for Cloud Apps', url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/what-is-defender-for-cloud-apps' };

const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Design Solutions That Align with Security Best Practices and Priorities (16) ──
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization wants its cloud security program to follow Microsoft\'s authoritative end-to-end architecture guidance covering capabilities such as SOC, Zero Trust, and identity. Which Microsoft resource is the primary reference a cybersecurity architect should anchor the design to?',
    options: opts4(
      'The Microsoft Cybersecurity Reference Architectures (MCRA)',
      'The Azure pricing calculator',
      'The Microsoft 365 roadmap',
      'The Azure status page'
    ),
    correct: ['a'],
    explanation: 'The MCRA is Microsoft\'s set of technical reference architectures that show how Microsoft security capabilities integrate across identity, SOC, OT/IoT, and multicloud. It is the canonical design reference an architect anchors a program to. Pricing, roadmap, and status pages are operational, not architectural references.',
    references: [REF_MCRA]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best captures the guiding principles of the Zero Trust model that an SC-100 architect must design toward?',
    options: opts4(
      'Trust the corporate network perimeter and treat all internal traffic as safe',
      'Verify explicitly, use least-privilege access, and assume breach',
      'Rely on a single strong perimeter firewall as the primary control',
      'Grant standing administrative access to reduce operational friction'
    ),
    correct: ['b'],
    explanation: 'Zero Trust is built on three principles: verify explicitly (authenticate and authorize on all available signals), use least-privilege access (JIT/JEA, risk-based adaptive policies), and assume breach (segment, encrypt, use analytics). Perimeter-only trust and standing admin access contradict the model.',
    references: [REF_ZT]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A CISO asks the architect to prioritize the first wave of a Zero Trust modernization program for the fastest reduction in risk. According to the Microsoft Zero Trust rapid modernization plan (RaMP), which workstream should generally be prioritized first?',
    options: opts4(
      'Securing identity and access (e.g., MFA, Conditional Access, privileged access)',
      'Migrating all on-premises file servers to the cloud',
      'Replacing every endpoint operating system',
      'Rebuilding all line-of-business applications as microservices'
    ),
    correct: ['a'],
    explanation: 'RaMP guidance prioritizes user and admin identity and access protections (MFA, Conditional Access, privileged access) because identity is the primary control plane and yields the fastest, highest-impact risk reduction. Wholesale app rebuilds or OS replacement are not the recommended starting point.',
    references: [REF_ZT_RAMP]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect needs a prescriptive baseline of security recommendations mapped to industry frameworks (CIS, NIST, PCI) to assess Azure workloads. Which Microsoft resource provides this baseline and is reflected in Defender for Cloud assessments?',
    options: opts4(
      'The Microsoft cloud security benchmark (MCSB)',
      'The Azure Advisor cost recommendations',
      'The Microsoft 365 message center',
      'The Azure Resource Graph schema'
    ),
    correct: ['a'],
    explanation: 'The Microsoft cloud security benchmark is the prescriptive set of security controls and recommendations, mapped to CIS/NIST/PCI, that Defender for Cloud uses as its default regulatory/standard baseline. Advisor cost, message center, and Resource Graph are not security baselines.',
    references: [REF_BENCHMARK]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'During a design review the architect must recommend how to integrate security requirements into the broader cloud strategy and operating model rather than as a bolt-on. Which Microsoft framework provides the Secure methodology and guidance for embedding security across strategy, plan, ready, and govern?',
    options: opts4(
      'The Cloud Adoption Framework (CAF) Secure methodology',
      'The Azure DevOps Boards backlog',
      'The Microsoft Sentinel content hub',
      'The Azure SDK for .NET'
    ),
    correct: ['a'],
    explanation: 'The Cloud Adoption Framework Secure methodology gives architects guidance to embed security across the cloud lifecycle (strategy, plan, ready, adopt, govern, manage), aligning security with the operating model rather than treating it as an afterthought.',
    references: [REF_CAF]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload team asks the architect for a structured set of design principles and tradeoffs (e.g., security vs. operational excellence) to evaluate a new Azure solution. Which framework should the architect use to drive the workload-level security design review?',
    options: opts4(
      'The Azure Well-Architected Framework Security pillar',
      'The Azure naming and tagging cheat sheet',
      'The Azure free account FAQ',
      'The Power Platform admin guide'
    ),
    correct: ['a'],
    explanation: 'The Well-Architected Framework Security pillar provides workload-level design principles, checklists, and tradeoffs the architect uses to review a specific solution. CAF is portfolio/program scope; WAF is workload scope. The other options are not design frameworks.',
    references: [REF_WAF_SEC]
  },
  {
    domain: BEST, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL elements that should be part of a Zero Trust end-to-end strategy an SC-100 architect designs across the estate.',
    options: opts4(
      'Strong identity verification with adaptive, risk-based access policies',
      'Micro-segmentation and least-privilege access to networks and resources',
      'Telemetry, analytics, and threat intelligence to detect and respond to threats',
      'A flat, fully trusted internal network to simplify connectivity'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A Zero Trust strategy spans identities, devices, apps, data, infrastructure, and networks with explicit verification, least privilege, micro-segmentation, and pervasive telemetry/analytics. A flat fully trusted network is the opposite of the assume-breach principle.',
    references: [REF_ZT]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Leadership wants a single, quantitative posture indicator to track Azure security improvement over time and to prioritize remediation. Which capability should the architect recommend as the primary posture metric?',
    options: opts4(
      'Secure Score in Microsoft Defender for Cloud',
      'Azure Monitor metrics for CPU utilization',
      'The Azure consumption (billing) report',
      'The Service Health planned-maintenance feed'
    ),
    correct: ['a'],
    explanation: 'Secure Score in Defender for Cloud gives a quantitative, control-mapped posture measurement that lets leadership track improvement and prioritize the highest-impact remediations. CPU metrics, billing, and service health are not posture indicators.',
    references: [REF_SECURE_SCORE]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization is concerned about ransomware. Following Microsoft\'s ransomware protection guidance, which outcome should the architect prioritize as the highest-value preparatory control?',
    options: opts4(
      'A tested, isolated, immutable backup and recovery capability',
      'A faster public DNS resolver for all clients',
      'A larger Log Analytics workspace retention quota only',
      'Disabling all multifactor authentication to speed up recovery'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s ransomware guidance emphasizes a tested, isolated/immutable backup so the business can recover without paying. It pairs with identity hardening (MFA, privileged access). Disabling MFA or merely enlarging log retention does not protect recovery.',
    references: [REF_RANSOMWARE, REF_BCDR]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect must explain which plane Microsoft positions as the primary security control plane in modern cloud architectures, shaping the prioritization of investments.',
    options: opts4(
      'Identity',
      'Physical datacenter access',
      'The corporate VPN concentrator',
      'The on-premises Active Directory forest trust'
    ),
    correct: ['a'],
    explanation: 'In MCRA and Zero Trust guidance, identity is the primary control plane in cloud and hybrid environments. Investment prioritization (MFA, Conditional Access, PIM) follows from this. Physical access and VPN concentrators are not the modern primary control plane.',
    references: [REF_MCRA]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A multicloud enterprise (Azure + AWS + GCP) wants one consistent posture-management and recommendation framework. What should the architect recommend to deliver consistent best-practice enforcement across all three clouds?',
    options: opts4(
      'Microsoft Defender for Cloud connected to AWS and GCP with the Microsoft cloud security benchmark',
      'A separate, unrelated native tool per cloud with no shared standard',
      'Manual quarterly spreadsheet reviews only',
      'Disabling cloud workloads outside Azure'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud is multicloud — connecting AWS and GCP accounts gives a unified CSPM/posture view assessed against the Microsoft cloud security benchmark, delivering consistent best-practice enforcement. Per-cloud disconnected tools or spreadsheets do not provide consistency.',
    references: [REF_DEFENDER_CLOUD, REF_BENCHMARK]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'When designing a security strategy, the architect needs a structured way to map controls and evidence to a regulatory framework and produce an improvement plan. Which Microsoft capability supports this?',
    options: opts4(
      'Microsoft Purview Compliance Manager',
      'Azure Cost Management',
      'Azure Resource Mover',
      'Azure Migrate'
    ),
    correct: ['a'],
    explanation: 'Compliance Manager provides assessments mapped to regulations/standards, improvement actions, and a quantitative compliance score, supporting the architect\'s compliance strategy. Cost Management, Resource Mover, and Migrate serve unrelated purposes.',
    references: [REF_COMPLIANCE]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'The board asks the architect to recommend a resiliency design assumption for the security architecture. Which principle from Microsoft\'s guidance should anchor the design?',
    options: opts4(
      'Assume breach: design controls, segmentation, and detection as if attackers are already inside',
      'Assume the network perimeter is impenetrable',
      'Assume insiders are always trustworthy',
      'Assume cloud providers fully secure customer data and configuration'
    ),
    correct: ['a'],
    explanation: '"Assume breach" is a core Zero Trust principle: design segmentation, least privilege, encryption, and detection so an intrusion is contained and detected quickly. The other assumptions contradict Zero Trust and the shared-responsibility model.',
    references: [REF_ZT]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect is asked to translate high-level security requirements into governance guardrails enforced automatically across all subscriptions. Which Azure capability provides preventive and detective guardrails at scale?',
    options: opts4(
      'Azure Policy (with initiatives applied at management-group scope)',
      'Azure Notification Hubs',
      'Azure Traffic Manager',
      'Azure Container Registry'
    ),
    correct: ['a'],
    explanation: 'Azure Policy initiatives applied at management-group scope provide automated preventive (deny/deployIfNotExists) and detective guardrails across all subscriptions, the standard mechanism to enforce governance requirements at scale.',
    references: [REF_POLICY]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'During strategy design, leadership wants security investments sequenced to "modernize fast where it matters most." Which approach aligns with Microsoft\'s recommended modernization sequencing?',
    options: opts4(
      'Use the Zero Trust RaMP to prioritize initiatives by risk reduction and quick wins',
      'Implement controls alphabetically by product name',
      'Buy every available security product immediately regardless of risk',
      'Defer all security work until after a full cloud migration'
    ),
    correct: ['a'],
    explanation: 'The Zero Trust rapid modernization plan sequences initiatives by risk-reduction value and feasibility (quick wins first). Alphabetical ordering, blanket purchasing, or deferring security all ignore risk-based prioritization.',
    references: [REF_ZT_RAMP]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'The Cloud Adoption Framework operates at portfolio/organizational scope while the Well-Architected Framework operates at the individual workload scope, and an SC-100 architect uses both at the appropriate level.',
    options: opts4('True', 'False', 'Only CAF is used by architects', 'Only WAF is used by architects'),
    correct: ['a'],
    explanation: 'CAF guides organization- and portfolio-level cloud and security strategy; WAF guides workload-level design tradeoffs. A cybersecurity architect applies CAF for program scope and WAF for solution scope.',
    references: [REF_CAF, REF_WAF_SEC]
  },

  // ── Design Security Operations, Identity, and Compliance Capabilities (17) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The architect must design a SIEM that ingests signals from Azure, Microsoft 365, AWS, and on-premises sources with built-in analytics and SOAR. Which Microsoft service should be the centerpiece?',
    options: opts4(
      'Microsoft Sentinel',
      'Azure Backup',
      'Azure DevTest Labs',
      'Azure Data Box'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel is the cloud-native SIEM/SOAR that ingests multicloud and hybrid signals, provides analytics rules, UEBA, and playbook automation. Backup, DevTest Labs, and Data Box are not SIEM platforms.',
    references: [REF_SENTINEL]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The SOC wants correlated incidents across endpoints, identities, email, and SaaS apps with automated investigation before anything reaches the SIEM. Which Microsoft capability should the architect place as the XDR layer?',
    options: opts4(
      'Microsoft Defender XDR',
      'Azure Application Insights',
      'Azure Front Door',
      'Azure Service Bus'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender XDR correlates signals across endpoints, identities, email/collaboration, and cloud apps into unified incidents with automated investigation and response, then can feed Sentinel. The others are not XDR platforms.',
    references: [REF_XDR]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'To enforce least-privilege administration, the architect must ensure privileged Azure AD/Entra roles are activated only when needed, time-bound, and approved. Which capability satisfies this?',
    options: opts4(
      'Microsoft Entra Privileged Identity Management (PIM)',
      'Azure Blueprints',
      'Azure Lighthouse',
      'Azure Automation runbooks'
    ),
    correct: ['a'],
    explanation: 'PIM provides just-in-time, time-bound, approval-gated, and audited activation of privileged Entra and Azure roles — the core least-privilege admin control. The others do not deliver JIT privileged role activation.',
    references: [REF_PIM]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect needs adaptive access decisions evaluated on every sign-in using signals such as user/sign-in risk, device compliance, and location. Which Entra capability should be the policy enforcement point?',
    options: opts4(
      'Conditional Access',
      'Azure Front Door rules engine',
      'Network security groups',
      'Azure Firewall application rules'
    ),
    correct: ['a'],
    explanation: 'Conditional Access is the Entra policy engine that evaluates identity, device, location, and risk signals to grant, block, or require additional controls (MFA, compliant device). NSGs and Azure Firewall operate on network flows, not identity sign-in policy.',
    references: [REF_CA]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A compromised session can remain valid until token expiry. The architect wants near-real-time revocation when risk changes (e.g., user disabled, risky sign-in). Which capability addresses this?',
    options: opts4(
      'Continuous access evaluation (CAE)',
      'A longer token lifetime policy',
      'Disabling Conditional Access',
      'Increasing the access token cache size'
    ),
    correct: ['a'],
    explanation: 'Continuous access evaluation enables near-real-time enforcement: critical events (account disabled, risk detected, policy change) revoke or challenge active sessions instead of waiting for token expiry. Longer tokens or disabling CA worsen the risk.',
    references: [REF_CAE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The organization needs periodic certification that users still require their access to privileged groups and packages. Which Entra ID Governance capability should the architect design in?',
    options: opts4(
      'Access reviews',
      'Azure Cost alerts',
      'Azure Advisor',
      'Service Health alerts'
    ),
    correct: ['a'],
    explanation: 'Access reviews provide recurring attestation/recertification of group, role, and access package membership, enforcing least privilege over time. The other options are operational/cost tools, not governance recertification.',
    references: [REF_ACCESS_REVIEW, REF_IDGOV]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'B2B partners need scoped, time-limited access to a set of apps and resources with built-in approval and automatic expiration. Which Entra ID Governance feature should the architect use?',
    options: opts4(
      'Entitlement management access packages',
      'A shared break-glass account',
      'A single guest account reused by all partners',
      'Disabling external collaboration entirely'
    ),
    correct: ['a'],
    explanation: 'Entitlement management access packages bundle resources with policies for approval, time limits, and access reviews — ideal for governed external/partner access. Shared or reused accounts violate accountability and least privilege.',
    references: [REF_ENTITLEMENT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that align with designing a privileged access strategy per Microsoft guidance.',
    options: opts4(
      'Use privileged access workstations (PAW) for sensitive admin tasks',
      'Enforce just-in-time, time-bound role activation with PIM',
      'Require phishing-resistant MFA for administrators',
      'Give all admins permanent Global Administrator for convenience'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Microsoft\'s privileged access strategy combines secured devices (PAW), JIT/JEA via PIM, and strong (phishing-resistant) authentication. Permanent Global Admin for everyone is the anti-pattern the strategy explicitly avoids.',
    references: [REF_PRIV_ACCESS, REF_PAW]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A multicloud enterprise wants to discover and right-size excessive permissions (permission creep) across Azure, AWS, and GCP identities. Which Microsoft solution should the architect recommend?',
    options: opts4(
      'Microsoft Entra Permissions Management (CIEM)',
      'Azure Bastion',
      'Azure Monitor Workbooks only',
      'Azure ExpressRoute'
    ),
    correct: ['a'],
    explanation: 'Entra Permissions Management is a Cloud Infrastructure Entitlement Management (CIEM) solution that discovers, analyzes, and right-sizes permissions across Azure, AWS, and GCP. Bastion, Workbooks, and ExpressRoute do not address permission creep.',
    references: [REF_GDAP]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect must design SOC processes mapped to clear functions (triage, investigation, hunting, threat intelligence). Which Microsoft guidance describes these security operations functions?',
    options: opts4(
      'Microsoft security operations (SecOps) function guidance',
      'The Azure ARM template specification',
      'The Azure pricing calculator',
      'The Microsoft 365 licensing datasheet'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s SecOps function guidance defines SOC roles and functions (triage/Tier 1, investigation/Tier 2, hunting, threat intelligence, automation) that the architect uses to design operations. ARM specs and pricing are unrelated.',
    references: [REF_SECOPS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect wants to reduce mean time to respond by auto-containing common incidents (e.g., disable user, isolate device) directly from the SIEM. Which Sentinel capability should be designed in?',
    options: opts4(
      'Automation rules and playbooks (SOAR)',
      'Log Analytics data export only',
      'Azure Monitor autoscale',
      'Azure DNS private zones'
    ),
    correct: ['a'],
    explanation: 'Sentinel automation rules and Logic Apps playbooks provide SOAR — automatically enriching, assigning, and remediating incidents (disable user, isolate device) to lower MTTR. Data export, autoscale, and DNS zones do not orchestrate response.',
    references: [REF_SOAR]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect is asked to design a structured incident response capability aligned to industry phases. Which Microsoft resource should guide the process design?',
    options: opts4(
      'Microsoft incident response guidance (prepare, detect, contain, eradicate, recover, post-incident)',
      'The Azure SLA summary',
      'The Azure Marketplace listing policy',
      'The Power BI deployment guide'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s incident response guidance maps the lifecycle (preparation, detection/analysis, containment/eradication/recovery, post-incident) that the architect uses to design IR processes and playbooks. SLAs and marketplace policy are unrelated.',
    references: [REF_INCIDENT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid org with on-premises Active Directory wants cloud authentication while keeping passwords on-premises and avoiding a separate cloud auth endpoint. Which hybrid identity option should the architect evaluate first for resilience and simplicity?',
    options: opts4(
      'Password hash synchronization with Entra Connect',
      'Storing AD passwords in a public storage account',
      'Disabling on-premises AD entirely on day one',
      'A standalone unmanaged LDAP server in the cloud'
    ),
    correct: ['a'],
    explanation: 'Password hash synchronization is the recommended default hybrid auth: resilient (no extra on-prem auth dependency), supports leaked-credential detection, and simplifies the design versus pass-through or federation. The other options are insecure or impractical.',
    references: [REF_HYBRID_ID]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must ensure that detection content, hunting queries, and analytics keep pace with evolving threats with minimal manual effort. Which Sentinel approach is recommended?',
    options: opts4(
      'Deploy and maintain solutions from the Sentinel content hub and tune analytics rules',
      'Write a single static rule and never update it',
      'Disable analytics rules to reduce alert volume',
      'Forward all logs to email with no analytics'
    ),
    correct: ['a'],
    explanation: 'The Sentinel content hub provides packaged, maintained analytics, hunting queries, workbooks, and playbooks per data source; the architect deploys and tunes these to keep detections current. Static or disabled rules degrade detection.',
    references: [REF_SENTINEL]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Compliance requires monitoring for risky internal activity (data theft before resignation, policy violations) while protecting employee privacy with pseudonymization. Which Purview solution fits?',
    options: opts4(
      'Microsoft Purview Insider Risk Management',
      'Azure DDoS Protection',
      'Microsoft Defender for Endpoint only',
      'Azure Firewall Premium'
    ),
    correct: ['a'],
    explanation: 'Insider Risk Management detects and manages risky insider activities (data exfiltration, departing-employee risk) with privacy controls such as pseudonymization and role-based access. DDoS/firewall/endpoint tools do not address insider risk programs.',
    references: [REF_INSIDER]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Auditors require evidence that privileged role assignments are time-limited and approved. Which combination should the architect cite as the control and its audit evidence?',
    options: opts4(
      'PIM eligible assignments with activation approval and the PIM audit/activation logs',
      'Permanent owner assignments documented in a wiki page',
      'A shared admin password rotated yearly',
      'NSG flow logs for the management subnet'
    ),
    correct: ['a'],
    explanation: 'PIM eligible (not permanent) assignments with approval workflows enforce the control; the PIM audit history and activation logs provide the auditable evidence. Permanent assignments, shared passwords, and NSG logs do not evidence time-limited approved privilege.',
    references: [REF_PIM]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'In Microsoft\'s architecture, Microsoft Defender XDR provides cross-domain detection and response and can integrate with Microsoft Sentinel to combine XDR with broader SIEM correlation and SOAR.',
    options: opts4('True', 'False', 'Only when on-premises AD is removed', 'Only for email signals'),
    correct: ['a'],
    explanation: 'Defender XDR delivers correlated detection/response across endpoints, identities, email, and apps, and integrates with Sentinel so the SOC gets XDR depth plus SIEM-wide correlation and automation. The integration is not limited to email or contingent on removing AD.',
    references: [REF_XDR, REF_SENTINEL]
  },

  // ── Design Security Solutions for Infrastructure (15) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The architect must protect Azure VMs, on-premises servers, and AWS EC2 with vulnerability assessment, JIT VM access, and EDR integration. Which Defender for Cloud plan should be designed in?',
    options: opts4(
      'Microsoft Defender for Servers',
      'Azure Site Recovery',
      'Azure Update Manager only',
      'Azure Image Builder'
    ),
    correct: ['a'],
    explanation: 'Defender for Servers provides vulnerability assessment, just-in-time VM access, file integrity monitoring, and Defender for Endpoint integration for Azure, on-prem (via Arc), and other clouds. Site Recovery and Image Builder are not server threat-protection plans.',
    references: [REF_DEFENDER_SERVERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Administrators need secure RDP/SSH to VMs without exposing public IPs or a jump box on the internet. Which Azure service should the architect specify?',
    options: opts4(
      'Azure Bastion',
      'A public IP with RDP open to 0.0.0.0/0',
      'Azure Content Delivery Network',
      'Azure Traffic Manager'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion provides browser-based RDP/SSH over TLS directly from the portal to VMs via private IP, eliminating public RDP/SSH exposure and internet-facing jump boxes. An open public RDP port is the insecure anti-pattern.',
    references: [REF_BASTION]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must remove public endpoints from PaaS services (Storage, SQL, Key Vault) so traffic stays on the Microsoft backbone and is reachable only from approved VNets. Which capability accomplishes this?',
    options: opts4(
      'Azure Private Link / private endpoints',
      'Service tags on a public NSG rule only',
      'Azure DNS public zones',
      'A larger VM SKU'
    ),
    correct: ['a'],
    explanation: 'Private Link assigns a private endpoint (private IP in your VNet) to PaaS resources and disables public network access, keeping traffic on the Microsoft backbone and reachable only from approved networks. Service tags alone still permit public access.',
    references: [REF_PRIVLINK]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A hub-and-spoke topology needs centralized, stateful filtering with FQDN-based egress control, threat intelligence-based filtering, and TLS inspection. Which service should the architect place in the hub?',
    options: opts4(
      'Azure Firewall (Premium)',
      'A basic NSG only',
      'Azure Load Balancer',
      'Azure Application Insights'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall Premium offers stateful filtering, FQDN/application rules, threat-intelligence-based filtering, IDPS, and TLS inspection — the centralized hub egress/ingress control. NSGs are basic L3/L4 ACLs without these features.',
    references: [REF_FIREWALL]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'The organization needs micro-segmentation between application tiers within a VNet to limit east-west movement. Which control is the foundational mechanism the architect should use?',
    options: opts4(
      'Network security groups with subnet/tier-scoped rules (least-privilege flows)',
      'A single allow-all rule for the entire VNet',
      'Disabling VNet peering',
      'Public IPs on every VM for direct reachability'
    ),
    correct: ['a'],
    explanation: 'Tier-scoped NSGs (and application security groups) enforce least-privilege east-west flows between subnets/tiers, the foundational micro-segmentation control limiting lateral movement. Allow-all rules or public IPs increase the attack surface.',
    references: [REF_NSG]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A public-facing workload needs protection against volumetric and protocol DDoS attacks with attack telemetry and rapid-response support. Which service should the architect recommend?',
    options: opts4(
      'Azure DDoS Protection (Network/IP Protection)',
      'Azure Backup',
      'Azure Key Vault',
      'Azure Policy'
    ),
    correct: ['a'],
    explanation: 'Azure DDoS Protection provides adaptive tuning, volumetric/protocol attack mitigation, telemetry, and DDoS Rapid Response. Backup, Key Vault, and Policy do not mitigate DDoS attacks.',
    references: [REF_DDOS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recommended controls for securing an Azure Kubernetes Service (AKS) cluster per Microsoft guidance.',
    options: opts4(
      'Use Entra integration and Kubernetes RBAC for cluster authorization',
      'Restrict the API server with authorized IP ranges or a private cluster',
      'Enable Microsoft Defender for Containers for runtime threat detection',
      'Expose the Kubernetes dashboard publicly with no authentication'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'AKS security combines Entra + Kubernetes RBAC, API server restriction (authorized ranges/private cluster), and Defender for Containers for posture and runtime detection. A publicly exposed unauthenticated dashboard is a critical misconfiguration.',
    references: [REF_AKS_SEC, REF_DEFENDER_CONTAINERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must protect container images and Kubernetes runtime across Azure and AWS with vulnerability scanning and threat detection. Which Defender plan should be designed in?',
    options: opts4(
      'Microsoft Defender for Containers',
      'Azure Container Instances autoscale',
      'Azure Front Door WAF only',
      'Azure Batch'
    ),
    correct: ['a'],
    explanation: 'Defender for Containers provides registry image vulnerability scanning, Kubernetes posture, and runtime threat detection across Azure and connected AWS/GCP. The other options are not container threat-protection plans.',
    references: [REF_DEFENDER_CONTAINERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A manufacturer needs visibility and threat detection for OT/ICS and IoT devices on the plant network, integrated with the SOC. Which Microsoft solution should the architect specify?',
    options: opts4(
      'Microsoft Defender for IoT',
      'Azure IoT Hub device twins only',
      'Azure Maps',
      'Azure Time Series Insights'
    ),
    correct: ['a'],
    explanation: 'Defender for IoT provides agentless OT/ICS asset discovery and threat detection, integrating with Sentinel/Defender XDR for SOC visibility. IoT Hub twins, Maps, and Time Series Insights are not OT security monitoring solutions.',
    references: [REF_DEFENDER_IOT]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect needs a consistent, governed foundation (networking, identity, policy guardrails, management groups) before workloads land. Which Microsoft construct provides this?',
    options: opts4(
      'Azure landing zones (Cloud Adoption Framework)',
      'A single flat subscription with no policy',
      'Manual per-team resource creation with no standards',
      'A spreadsheet of intended resources'
    ),
    correct: ['a'],
    explanation: 'CAF Azure landing zones provide an opinionated, policy-governed foundation (management group hierarchy, identity, network topology, guardrails) so workloads inherit security and governance by default. Flat or ungoverned approaches do not.',
    references: [REF_LZ]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must ensure VM disk encryption with keys the customer controls and can revoke. Which design should be recommended?',
    options: opts4(
      'Server-side encryption with customer-managed keys in Azure Key Vault',
      'No encryption, relying on physical datacenter security',
      'Hard-coding a key in the VM image',
      'Emailing the encryption key to administrators'
    ),
    correct: ['a'],
    explanation: 'Server-side encryption with customer-managed keys (CMK) backed by Key Vault gives the customer key lifecycle control, rotation, and revocation while protecting data at rest. Hard-coded or emailed keys and no encryption are insecure.',
    references: [REF_ENCRYPTION, REF_KEYVAULT]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership wants on-premises and multicloud servers managed and secured with the same Azure controls (Policy, Defender, Update). Which technology enables this?',
    options: opts4(
      'Azure Arc (extends Azure management to non-Azure servers)',
      'Azure Dedicated Host only',
      'Azure Spot VMs',
      'Azure Reserved Instances'
    ),
    correct: ['a'],
    explanation: 'Azure Arc projects on-premises and other-cloud servers into Azure so Policy, Defender for Servers, and update management apply consistently. Dedicated Host, Spot, and Reserved Instances are Azure-only capacity/pricing constructs.',
    references: [REF_DEFENDER_SERVERS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect wants storage accounts protected against malware uploads, suspicious access, and exfiltration patterns. Which Defender plan applies?',
    options: opts4(
      'Microsoft Defender for Storage',
      'Azure Storage lifecycle management only',
      'Azure CDN',
      'Azure Data Factory'
    ),
    correct: ['a'],
    explanation: 'Defender for Storage detects malicious uploads (malware scanning), unusual access, and exfiltration patterns on Azure Storage. Lifecycle management, CDN, and Data Factory do not provide threat protection for storage.',
    references: [REF_DEFENDER_STORAGE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A Zero Trust network design must avoid implicit trust based on network location for remote users accessing internal resources. Which Microsoft capability supports identity-centric secure access replacing legacy VPN trust?',
    options: opts4(
      'Microsoft Entra Global Secure Access (Private/Internet Access)',
      'A flat site-to-site VPN granting full network access',
      'Opening RDP to the internet for remote staff',
      'A single shared VPN credential for all users'
    ),
    correct: ['a'],
    explanation: 'Global Secure Access (Entra Private/Internet Access) delivers identity-centric, Conditional-Access-aware access to specific apps/resources without granting broad network trust, aligning with Zero Trust. Flat VPNs and shared credentials grant excessive implicit trust.',
    references: [REF_GAP]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Disabling public network access and using private endpoints for PaaS data services is consistent with the Zero Trust "assume breach" principle for infrastructure design.',
    options: opts4('True', 'False', 'Only for non-production', 'Only when there is no firewall'),
    correct: ['a'],
    explanation: 'Removing public exposure and forcing private connectivity reduces the attack surface and limits lateral reachability, directly supporting "assume breach" and least-privilege network design for any environment, not just non-production.',
    references: [REF_PRIVLINK, REF_ZT]
  },

  // ── Design Security Solutions for Applications and Data (17) ──
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Applications must never store secrets, certificates, or keys in code or config files. Which Azure service should the architect mandate, accessed via managed identity?',
    options: opts4(
      'Azure Key Vault accessed with a managed identity',
      'A plaintext appsettings.json checked into source control',
      'Environment variables printed to application logs',
      'A shared spreadsheet of credentials'
    ),
    correct: ['a'],
    explanation: 'Key Vault centrally stores secrets/keys/certificates with access controlled via RBAC and managed identities, removing credentials from code/config. Plaintext config, logged secrets, and shared spreadsheets are insecure anti-patterns.',
    references: [REF_KEYVAULT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload calls Azure SQL and Storage. The architect wants to eliminate stored connection-string secrets entirely. Which approach should be designed?',
    options: opts4(
      'Use a managed identity for the app to authenticate to SQL and Storage via Entra ID',
      'Embed a SQL admin password in the application binary',
      'Use the storage account key in client-side JavaScript',
      'Disable authentication on the database'
    ),
    correct: ['a'],
    explanation: 'Managed identities let the app obtain Entra tokens to access SQL and Storage with no stored secrets, supporting least privilege via RBAC. Embedded passwords, client-side keys, and disabled auth are critical vulnerabilities.',
    references: [REF_KEYVAULT, REF_RBAC]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must classify and label sensitive data (PII, financial) across Microsoft 365 and apply protection that persists with the document. Which solution provides classification and persistent encryption labels?',
    options: opts4(
      'Microsoft Purview Information Protection (sensitivity labels)',
      'Azure Blob soft delete',
      'Azure Resource locks',
      'Azure Monitor alerts'
    ),
    correct: ['a'],
    explanation: 'Purview Information Protection applies sensitivity labels that classify and can encrypt/restrict documents and emails, with protection traveling with the file. Soft delete, resource locks, and monitor alerts do not classify or protect content.',
    references: [REF_MIP]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'The organization must prevent exfiltration of labeled sensitive data via email, endpoints, and SaaS apps. Which Purview capability should the architect design in?',
    options: opts4(
      'Microsoft Purview Data Loss Prevention (DLP)',
      'Azure Traffic Manager',
      'Azure Application Gateway routing rules',
      'Azure Container Registry replication'
    ),
    correct: ['a'],
    explanation: 'Purview DLP enforces policies that detect and block sharing of sensitive/labeled data across Exchange, SharePoint/OneDrive, Teams, endpoints, and cloud apps. The networking/registry options do not perform content-aware DLP.',
    references: [REF_DLP]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A public API gateway must centralize authentication, rate limiting, and policy enforcement for backend microservices. Which Azure service should the architect place in front of the APIs?',
    options: opts4(
      'Azure API Management',
      'Azure Service Bus queues',
      'Azure Event Grid topics',
      'Azure Storage static website'
    ),
    correct: ['a'],
    explanation: 'API Management provides a managed gateway with authentication (OAuth/JWT validation, subscription keys), rate limiting/throttling, and policy enforcement in front of backend services. Service Bus, Event Grid, and static sites are not API gateways.',
    references: [REF_APIM]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A web app is exposed to OWASP Top 10 attacks (SQL injection, XSS). Which Azure capability should the architect deploy to inspect and filter HTTP(S) traffic with managed rule sets?',
    options: opts4(
      'Azure Web Application Firewall (WAF) on Application Gateway or Front Door',
      'A network security group on the web subnet',
      'Azure Key Vault firewall',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Azure WAF (on Application Gateway or Front Door) applies OWASP Core Rule Set protections against SQLi, XSS, and other L7 attacks. NSGs are L3/L4, Key Vault firewall protects the vault, and Bastion provides admin access — none inspect HTTP payloads.',
    references: [REF_WAF_APP]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect must embed security into the application development process (threat modeling, secure code, security testing). Which Microsoft framework should be referenced?',
    options: opts4(
      'The Microsoft Security Development Lifecycle (SDL)',
      'The Azure naming conventions guide',
      'The Microsoft 365 adoption guide',
      'The Azure Quotas documentation'
    ),
    correct: ['a'],
    explanation: 'The Microsoft SDL prescribes security practices across the development lifecycle — training, requirements, threat modeling, secure design/coding, security testing, and response. The other documents are not secure-development frameworks.',
    references: [REF_SDL]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that align with designing a secure DevOps (DevSecOps) pipeline using Microsoft guidance.',
    options: opts4(
      'Scan code and IaC for vulnerabilities and misconfigurations in CI',
      'Manage pipeline secrets in Key Vault, not in YAML or variables in clear text',
      'Use Microsoft Defender for DevOps to surface findings in Defender for Cloud',
      'Grant the build service principal Owner on the production subscription'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DevSecOps shifts security left: scan code/IaC, secure pipeline secrets in Key Vault, and aggregate DevOps posture via Defender for DevOps. Granting the build identity Owner on production violates least privilege.',
    references: [REF_DEFENDER_DEVOPS, REF_SDL]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect needs threat detection for Azure SQL databases (anomalous access, SQL injection attempts) integrated with Defender for Cloud. Which plan should be enabled?',
    options: opts4(
      'Microsoft Defender for SQL',
      'Azure SQL automatic tuning only',
      'Azure SQL geo-replication only',
      'Azure SQL elastic pools'
    ),
    correct: ['a'],
    explanation: 'Defender for SQL provides vulnerability assessment and advanced threat protection (anomalous access, potential SQL injection) surfaced in Defender for Cloud. Tuning, geo-replication, and elastic pools are performance/availability features, not threat protection.',
    references: [REF_DEFENDER_DB]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Sensitive data at rest in Azure Storage and SQL must use keys the security team controls and can rotate independently of the platform. Which design should the architect choose?',
    options: opts4(
      'Customer-managed keys (CMK) in Azure Key Vault for encryption at rest',
      'Disable encryption to simplify key management',
      'Store the key in a public GitHub repository',
      'Use the same static key forever with no rotation policy'
    ),
    correct: ['a'],
    explanation: 'CMK in Key Vault lets the security team own key lifecycle, rotation, and revocation for data at rest while platform-managed keys handle the default. Disabling encryption, public key storage, or no rotation are insecure.',
    references: [REF_ENCRYPTION, REF_KEYVAULT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'The CISO wants visibility and control over sanctioned and shadow-IT SaaS apps, including session controls and data protection for cloud apps. Which Microsoft solution should the architect specify?',
    options: opts4(
      'Microsoft Defender for Cloud Apps (CASB)',
      'Azure Front Door caching rules',
      'Azure Logic Apps connectors only',
      'Azure DNS analytics'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud Apps is the CASB that discovers shadow IT, assesses SaaS app risk, and applies session/access controls and DLP for cloud apps (with Conditional Access App Control). Front Door, Logic Apps, and DNS analytics do not provide CASB capabilities.',
    references: [REF_DEFENDER_APPS]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'An app registered in Entra ID must access Microsoft Graph with only the minimum permissions required. Which design principle should the architect enforce?',
    options: opts4(
      'Request least-privilege, scoped Graph permissions and prefer delegated over broad application permissions where possible',
      'Request Directory.ReadWrite.All for all apps to avoid future changes',
      'Use a single highly privileged app registration shared by every workload',
      'Grant tenant-wide admin consent to all permissions by default'
    ),
    correct: ['a'],
    explanation: 'Application access design must follow least privilege: request only the specific Graph scopes needed and avoid blanket high-privilege permissions or shared over-privileged registrations. Broad consent increases blast radius if the app is compromised.',
    references: [REF_RBAC, REF_ZT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated workload requires data to remain encrypted even while in use (processing) to reduce exposure to the cloud operator. Which Azure capability should the architect evaluate?',
    options: opts4(
      'Azure confidential computing (encryption-in-use with trusted execution environments)',
      'Storage account soft delete',
      'Azure Backup vault',
      'Azure CDN edge caching'
    ),
    correct: ['a'],
    explanation: 'Azure confidential computing uses hardware-based trusted execution environments to keep data encrypted in use, complementing encryption at rest and in transit for highly regulated workloads. Soft delete, backup, and CDN do not protect data in use.',
    references: [REF_ENCRYPTION]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must protect access to a sensitive internal web app so that only compliant devices and low-risk sessions can reach it. Which combination should be designed?',
    options: opts4(
      'Publish the app via Entra and enforce Conditional Access requiring compliant device and acceptable risk',
      'Expose the app directly to the internet with no authentication',
      'Rely on an obscure URL as the only protection',
      'Allow access from any device as long as a password is known'
    ),
    correct: ['a'],
    explanation: 'Publishing the app through Entra (App Proxy / Global Secure Access) with Conditional Access requiring device compliance and risk evaluation enforces Zero Trust application access. Obscurity, no auth, or password-only access do not meet the requirement.',
    references: [REF_CA, REF_GAP]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect needs a discovery and governance solution to catalog and label data across Azure data stores, on-premises, and multicloud for a data security program. Which solution applies?',
    options: opts4(
      'Microsoft Purview (Data Map / Data Catalog and Information Protection)',
      'Azure Resource Graph Explorer only',
      'Azure Cost Management',
      'Azure Advisor'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview discovers, catalogs, classifies, and labels data across Azure, on-premises, and multicloud sources, underpinning a data security and governance program. Resource Graph, Cost Management, and Advisor are not data governance/classification tools.',
    references: [REF_PURVIEW]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A microservices app on AKS must retrieve database credentials securely at runtime without baking secrets into images. Which design should the architect recommend?',
    options: opts4(
      'Use workload identity / managed identity with Key Vault (e.g., Secrets Store CSI driver)',
      'Bake the password into the container image layer',
      'Pass the password as a plaintext Kubernetes ConfigMap',
      'Hard-code the connection string in the Helm chart values committed to Git'
    ),
    correct: ['a'],
    explanation: 'AKS workload identity (Entra) with Key Vault, surfaced via the Secrets Store CSI driver, lets pods obtain secrets at runtime without embedding them in images or config. Images, ConfigMaps, and committed Helm values all leak secrets.',
    references: [REF_KEYVAULT, REF_AKS_SEC]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Combining sensitivity labels (Purview Information Protection) with DLP policies provides classification plus enforcement, which is the Microsoft-recommended pattern for protecting sensitive data across its lifecycle.',
    options: opts4('True', 'False', 'Only for email', 'Only for on-premises file shares'),
    correct: ['a'],
    explanation: 'Microsoft recommends classifying data with sensitivity labels and enforcing handling with DLP so protection follows the data across email, endpoints, SharePoint/OneDrive, Teams, and cloud apps throughout its lifecycle — not limited to email or on-prem shares.',
    references: [REF_MIP, REF_DLP]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Design Solutions That Align with Security Best Practices and Priorities (16) ──
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new CISO wants the security team to adopt a single mental model that treats every access request as potentially hostile regardless of origin. Which model should the architect formalize as the program\'s foundation?',
    options: opts4(
      'Zero Trust',
      'Castle-and-moat perimeter security',
      'Implicit trust for managed devices',
      'Network-location-based trust zones'
    ),
    correct: ['a'],
    explanation: 'Zero Trust treats every request as untrusted until verified, regardless of network origin. Castle-and-moat and location-based trust are the legacy models Zero Trust replaces.',
    references: [REF_ZT]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must show executives how Microsoft security capabilities map to attacker techniques and defender functions across the estate to justify a roadmap. Which artifact is purpose-built for that conversation?',
    options: opts4(
      'The Microsoft Cybersecurity Reference Architectures (MCRA)',
      'A Bicep module library',
      'The Azure regions list',
      'A Log Analytics KQL cheat sheet'
    ),
    correct: ['a'],
    explanation: 'The MCRA visually maps Microsoft capabilities across identity, SOC, infrastructure, data, and OT, and is intended to drive strategy and roadmap discussions with leadership. Bicep modules, regions lists, and KQL cheat sheets are implementation artifacts.',
    references: [REF_MCRA]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants to know whether its Azure configuration aligns with industry standards without building its own control catalog. Which Defender for Cloud feature should the architect rely on?',
    options: opts4(
      'Regulatory compliance dashboard backed by the Microsoft cloud security benchmark and added standards',
      'Azure Advisor reliability tab',
      'The Azure portal dashboard tiles',
      'Azure Monitor pinned charts'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud\'s regulatory compliance dashboard maps resource assessments to the Microsoft cloud security benchmark and additional standards (CIS, NIST, PCI, ISO), giving a ready control catalog. Advisor reliability and portal tiles do not provide compliance mapping.',
    references: [REF_BENCHMARK, REF_DEFENDER_CLOUD]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect is asked which framework guides organization-wide cloud security strategy, governance, and operating model decisions (not a single workload). Which should be cited?',
    options: opts4(
      'The Cloud Adoption Framework (Secure methodology)',
      'The Well-Architected Framework Reliability pillar',
      'The Azure SDK design guidelines',
      'The Microsoft Sentinel KQL reference'
    ),
    correct: ['a'],
    explanation: 'CAF guides organization-wide cloud strategy, governance, and operating model, including the Secure methodology. The WAF pillars are workload-scoped; SDK and KQL references are implementation docs.',
    references: [REF_CAF]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload team must choose between adding cost or adding a security control that slightly reduces performance. The architect wants a structured way to reason about the tradeoff. Which resource provides workload security tradeoff guidance?',
    options: opts4(
      'The Well-Architected Framework Security pillar (tradeoffs guidance)',
      'The Azure free tier limits page',
      'The Azure CLI installation guide',
      'The Microsoft 365 service descriptions'
    ),
    correct: ['a'],
    explanation: 'The WAF Security pillar explicitly documents tradeoffs (e.g., security vs. cost/performance/operations) to help architects make principled workload-level decisions. The other documents are not design-tradeoff guidance.',
    references: [REF_WAF_SEC]
  },
  {
    domain: BEST, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that belong in a prioritized security initiative roadmap built with the Zero Trust rapid modernization plan.',
    options: opts4(
      'Enforce MFA and Conditional Access for users and admins',
      'Implement privileged access protections (PIM, secure admin workstations)',
      'Establish data classification and protection for sensitive information',
      'Postpone all identity work until network segmentation is 100% complete'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'RaMP sequences identity/access protections, privileged access, and data protection as high-value early initiatives. Postponing all identity work until segmentation is fully done contradicts the prioritize-by-risk approach.',
    references: [REF_ZT_RAMP]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Leadership requires a quantitative compliance posture score and a prioritized list of improvement actions mapped to a regulation. Which Microsoft tool should the architect recommend?',
    options: opts4(
      'Microsoft Purview Compliance Manager',
      'Azure Advisor',
      'Azure Cost Management budgets',
      'Azure Service Health'
    ),
    correct: ['a'],
    explanation: 'Compliance Manager provides a compliance score and prioritized improvement actions mapped to selected regulations/standards. Advisor, Cost Management, and Service Health do not provide compliance scoring.',
    references: [REF_COMPLIANCE]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must recommend the single most effective preventive control to reduce the risk of credential-based compromise across the enterprise. Which should be prioritized?',
    options: opts4(
      'Enforce phishing-resistant multifactor authentication',
      'Increase password length to 64 characters only',
      'Rotate passwords every 7 days only',
      'Disable account lockout to reduce help-desk tickets'
    ),
    correct: ['a'],
    explanation: 'Microsoft guidance consistently identifies MFA (ideally phishing-resistant) as the highest-impact preventive control against credential attacks. Aggressive password rotation and disabling lockout do not meaningfully reduce credential compromise.',
    references: [REF_ZT_RAMP]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect designs a defense against ransomware. Which layered priority order matches Microsoft\'s guidance?',
    options: opts4(
      'Prepare recovery (immutable backups), then limit scope (privileged access, segmentation), then make it hard to get in (MFA, patching)',
      'Only buy antivirus and consider the problem solved',
      'Focus exclusively on perimeter firewalls',
      'Pay attackers proactively to deter attacks'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s ransomware guidance follows prepare (tested immutable backups/recovery), limit scope (privileged access, segmentation, least privilege), and make entry hard (MFA, patching, attack surface reduction). Single-control or pay-the-attacker approaches are not the strategy.',
    references: [REF_RANSOMWARE, REF_BCDR]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes the scope of CAF versus WAF for a cybersecurity architect?',
    options: opts4(
      'CAF addresses portfolio/organization cloud and security strategy; WAF addresses individual workload design quality',
      'CAF and WAF are identical and interchangeable',
      'WAF defines the organization operating model; CAF reviews single workloads',
      'Both are pricing tools only'
    ),
    correct: ['a'],
    explanation: 'CAF is organization/portfolio scope (strategy, governance, operating model); WAF is workload scope (design pillars and tradeoffs). They are complementary, not interchangeable, and neither is a pricing tool.',
    references: [REF_CAF, REF_WAF_SEC]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A multicloud board wants one consistent security baseline used to grade Azure, AWS, and GCP. Which Microsoft standard should the architect adopt as that baseline?',
    options: opts4(
      'The Microsoft cloud security benchmark applied through Defender for Cloud across all connected clouds',
      'A different ad-hoc internal checklist for each cloud',
      'No baseline; rely on each team\'s judgment',
      'The Azure VM sizing guide'
    ),
    correct: ['a'],
    explanation: 'The Microsoft cloud security benchmark, applied via multicloud Defender for Cloud, gives one consistent control baseline across Azure/AWS/GCP. Ad-hoc per-cloud checklists or no baseline undermine consistency; VM sizing is irrelevant.',
    references: [REF_BENCHMARK, REF_DEFENDER_CLOUD]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect wants the security strategy to assume identities, devices, and networks may already be compromised and design accordingly. Which Zero Trust principle is this?',
    options: opts4(
      'Assume breach',
      'Trust but do not verify',
      'Perimeter is sufficient',
      'Implicit trust for internal traffic'
    ),
    correct: ['a'],
    explanation: '"Assume breach" drives segmentation, least privilege, encryption, and detection design as if attackers are already present. The other options contradict Zero Trust.',
    references: [REF_ZT]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect needs governance guardrails that block non-compliant deployments (e.g., public storage, unencrypted disks) automatically across all subscriptions. Which mechanism scales this best?',
    options: opts4(
      'Azure Policy initiatives assigned at the management-group root',
      'Manual peer review of every deployment',
      'A wiki page describing the rules',
      'Per-resource tags only'
    ),
    correct: ['a'],
    explanation: 'Azure Policy initiatives at management-group scope enforce preventive guardrails automatically across the tenant hierarchy. Manual reviews, wikis, and tags do not enforce compliance at scale.',
    references: [REF_POLICY]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'Executives ask for a single quantitative number that trends Azure security posture improvement quarter over quarter. Which metric should the architect report?',
    options: opts4(
      'Defender for Cloud Secure Score',
      'Number of VMs deployed',
      'Total Azure monthly spend',
      'Count of open support tickets'
    ),
    correct: ['a'],
    explanation: 'Secure Score is the control-mapped posture metric designed to trend improvement over time. VM count, spend, and ticket count are not security posture measurements.',
    references: [REF_SECURE_SCORE]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must recommend how to embed security requirements into every cloud landing zone from day one. Which approach aligns with Microsoft guidance?',
    options: opts4(
      'Bake guardrails (Policy, RBAC, baseline networking, logging) into the landing zone design before workloads deploy',
      'Add security only after the first incident',
      'Let each team define its own controls with no baseline',
      'Apply controls only to production after go-live'
    ),
    correct: ['a'],
    explanation: 'CAF landing zones embed security guardrails (Policy, RBAC, networking, logging) so workloads inherit security by default. Reactive or inconsistent approaches contradict the secure-by-design principle.',
    references: [REF_LZ, REF_CAF]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'The Microsoft cloud security benchmark is the default standard that Microsoft Defender for Cloud assesses Azure resources against, and additional regulatory standards can be added to the compliance dashboard.',
    options: opts4('True', 'False', 'Only ISO 27001 is supported', 'Only for AWS workloads'),
    correct: ['a'],
    explanation: 'The Microsoft cloud security benchmark is Defender for Cloud\'s default applied standard, and architects can add other regulatory standards (CIS, NIST, PCI, ISO) to the regulatory compliance dashboard for Azure and connected clouds.',
    references: [REF_BENCHMARK, REF_DEFENDER_CLOUD]
  },

  // ── Design Security Operations, Identity, and Compliance Capabilities (17) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The architect must centralize log collection, detection, and automated response across hybrid and multicloud sources for the SOC. Which service is the cloud-native SIEM/SOAR to design around?',
    options: opts4(
      'Microsoft Sentinel',
      'Azure Bastion',
      'Azure Front Door',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel is the cloud-native SIEM and SOAR that aggregates and analyzes signals across hybrid and multicloud sources and automates response. Bastion, Front Door, and Key Vault serve other purposes.',
    references: [REF_SENTINEL]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The SOC needs a unified incident view that automatically correlates an endpoint alert, a risky sign-in, and a malicious email into one incident. Which capability provides this cross-domain correlation?',
    options: opts4(
      'Microsoft Defender XDR',
      'Azure Monitor metric alerts',
      'Azure Network Watcher',
      'Azure Cost alerts'
    ),
    correct: ['a'],
    explanation: 'Defender XDR automatically correlates signals across endpoints, identities, email, and apps into a single incident with automated investigation. Azure Monitor, Network Watcher, and cost alerts do not perform XDR correlation.',
    references: [REF_XDR]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Highly privileged roles must require approval and be time-limited each time they are used. Which control should the architect mandate?',
    options: opts4(
      'PIM eligible role assignments with approval and activation expiry',
      'Permanent role assignments for speed',
      'A shared admin account with a long password',
      'Email-based approval tracked in a spreadsheet'
    ),
    correct: ['a'],
    explanation: 'PIM eligible assignments enforce just-in-time, approval-gated, time-bound, audited privileged access. Permanent or shared admin access and informal email approvals do not meet least-privilege requirements.',
    references: [REF_PIM]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Access decisions must continuously incorporate user risk, sign-in risk, device compliance, and location for every application sign-in. Which Entra capability is the enforcement engine?',
    options: opts4(
      'Conditional Access',
      'Azure Firewall DNAT rules',
      'Route tables (UDR)',
      'Azure Load Balancer health probes'
    ),
    correct: ['a'],
    explanation: 'Conditional Access evaluates identity/device/location/risk signals to grant or block access and require controls such as MFA or compliant device. Firewall NAT, route tables, and load balancer probes are network constructs.',
    references: [REF_CA]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A user is disabled in HR, but their existing tokens remain valid for up to an hour. The architect needs near-real-time enforcement of the disablement. Which feature should be enabled?',
    options: opts4(
      'Continuous access evaluation (CAE)',
      'Longer refresh token lifetime',
      'Disable sign-in logs',
      'Increase the token cache duration'
    ),
    correct: ['a'],
    explanation: 'Continuous access evaluation enables near-real-time revocation/challenge when critical events (account disabled, risk, policy change) occur, rather than waiting for token expiry. Longer tokens or disabled logs make the gap worse.',
    references: [REF_CAE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The organization must periodically attest that members of privileged groups still need that access, with automatic removal if not approved. Which governance feature should the architect design?',
    options: opts4(
      'Access reviews',
      'Azure Backup policies',
      'Resource locks',
      'Service Health alerts'
    ),
    correct: ['a'],
    explanation: 'Access reviews recertify membership of groups, roles, and access packages, removing access that is no longer approved. Backup policies, resource locks, and service health are unrelated to access recertification.',
    references: [REF_ACCESS_REVIEW]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'External vendors need self-service request, approval workflow, time-bound access, and automatic expiry to a defined bundle of resources. Which Entra ID Governance capability fits best?',
    options: opts4(
      'Entitlement management access packages',
      'A permanent guest account with Owner role',
      'A shared service account for all vendors',
      'Disabling B2B collaboration'
    ),
    correct: ['a'],
    explanation: 'Entitlement management access packages provide governed, time-bound, approval-driven access bundles with reviews — ideal for external vendor access. Permanent privileged guests or shared accounts violate least privilege and accountability.',
    references: [REF_ENTITLEMENT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL elements of a Microsoft-aligned privileged access strategy.',
    options: opts4(
      'Secured/privileged access workstations for admin tasks',
      'Just-in-time, time-bound elevation via PIM',
      'Phishing-resistant authentication for privileged accounts',
      'Shared local administrator passwords reused across servers'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A privileged access strategy combines secured admin devices, JIT elevation (PIM), and strong phishing-resistant authentication. Reused shared local admin passwords are a classic lateral-movement weakness to eliminate.',
    references: [REF_PRIV_ACCESS, REF_PAW]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The security team needs to identify and remediate unused and excessive permissions across Azure, AWS, and GCP identities to shrink the identity attack surface. Which solution should the architect choose?',
    options: opts4(
      'Microsoft Entra Permissions Management',
      'Azure Monitor Logs only',
      'Azure Policy guest configuration only',
      'Azure DNS analytics'
    ),
    correct: ['a'],
    explanation: 'Entra Permissions Management (CIEM) discovers and right-sizes permissions across multicloud identities, reducing the identity attack surface. The other options do not provide permission analytics across clouds.',
    references: [REF_GDAP]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect must define SOC functions and responsibilities (triage, deeper investigation, hunting, threat intel). Which Microsoft guidance should be used?',
    options: opts4(
      'Microsoft security operations function model',
      'The Azure ARM API versions list',
      'The Azure compliance offerings index only',
      'The Azure CLI command reference'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s SecOps function model defines SOC tiers and functions the architect uses to design the operating model. ARM API lists and CLI references are implementation references, not SOC design guidance.',
    references: [REF_SECOPS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'To reduce analyst toil, common containment actions should be automated from Sentinel when a high-confidence detection fires. Which capability enables this orchestration?',
    options: opts4(
      'Sentinel automation rules with Logic Apps playbooks',
      'Log Analytics retention settings',
      'Azure Monitor diagnostic settings only',
      'Azure Advisor recommendations'
    ),
    correct: ['a'],
    explanation: 'Sentinel automation rules and Logic Apps playbooks provide SOAR to automate enrichment and containment (disable user, isolate device, block IP). Retention, diagnostic settings, and Advisor do not orchestrate response.',
    references: [REF_SOAR]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect designs incident response runbooks. Which lifecycle should the runbooks follow per Microsoft guidance?',
    options: opts4(
      'Preparation, detection and analysis, containment/eradication/recovery, post-incident activity',
      'Buy, deploy, ignore, repeat',
      'Detect only, with no recovery phase',
      'Recover first, then prepare'
    ),
    correct: ['a'],
    explanation: 'Microsoft incident response guidance follows preparation, detection/analysis, containment/eradication/recovery, and post-incident lessons learned. The other sequences omit critical phases or are nonsensical.',
    references: [REF_INCIDENT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid org wants cloud sign-in to remain available even if on-premises connectivity fails, and wants leaked-credential detection. Which hybrid identity method best meets both?',
    options: opts4(
      'Password hash synchronization',
      'Federation with a single on-premises AD FS server and no redundancy',
      'Pass-through authentication with one agent only',
      'No synchronization; manual account creation in the cloud'
    ),
    correct: ['a'],
    explanation: 'Password hash synchronization keeps cloud authentication available independent of on-prem connectivity and feeds Entra ID Protection leaked-credential detection. Single-instance federation/PTA introduce on-prem dependency and outage risk.',
    references: [REF_HYBRID_ID]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must keep Sentinel detections current for new data sources without writing everything from scratch. Which approach is recommended?',
    options: opts4(
      'Deploy and tune content hub solutions (analytics, hunting, workbooks, playbooks) per data connector',
      'Disable all built-in rules and rely on manual log reading',
      'Use one generic rule for every source',
      'Never update detection content'
    ),
    correct: ['a'],
    explanation: 'The Sentinel content hub ships maintained, source-specific detection content the architect deploys and tunes, keeping coverage current. Disabling rules or never updating degrades detection effectiveness.',
    references: [REF_SENTINEL]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Compliance wants to detect potential data theft by departing employees while protecting privacy through pseudonymization and scoped access. Which solution should the architect specify?',
    options: opts4(
      'Microsoft Purview Insider Risk Management',
      'Azure Firewall Premium IDPS',
      'Defender for Storage only',
      'Azure DDoS Protection'
    ),
    correct: ['a'],
    explanation: 'Insider Risk Management identifies risky insider behavior (e.g., departing-employee data theft) with privacy controls such as pseudonymization and role-based access. Firewall, storage, and DDoS tools do not address insider risk.',
    references: [REF_INSIDER]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Auditors want proof that standing Global Administrator access has been minimized. Which design and evidence should the architect present?',
    options: opts4(
      'Convert standing Global Admins to PIM-eligible with approval; present PIM assignment configuration and audit logs',
      'A list of permanent Global Admins documented in a runbook',
      'A claim that no admin accounts exist',
      'NSG flow logs for the admin subnet'
    ),
    correct: ['a'],
    explanation: 'Minimizing standing privilege means PIM-eligible (not permanent) Global Admin with approval; the PIM configuration and audit/activation history are the evidence. Documented permanent admins or NSG logs do not demonstrate minimized standing privilege.',
    references: [REF_PIM]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Conditional Access and Privileged Identity Management together support a Zero Trust identity design by enforcing adaptive access and just-in-time privileged elevation.',
    options: opts4('True', 'False', 'Only Conditional Access is needed', 'Only PIM is needed'),
    correct: ['a'],
    explanation: 'Conditional Access enforces adaptive, risk-aware access for all users, while PIM enforces JIT, approval-gated privileged elevation. Together they implement the verify-explicitly and least-privilege principles for identity.',
    references: [REF_CA, REF_PIM]
  },

  // ── Design Security Solutions for Infrastructure (15) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The architect must add vulnerability assessment and EDR for Windows/Linux VMs across Azure and on-premises (via Arc). Which Defender for Cloud plan covers this?',
    options: opts4(
      'Microsoft Defender for Servers',
      'Azure Bastion',
      'Azure Monitor Agent only',
      'Azure Automanage baseline only'
    ),
    correct: ['a'],
    explanation: 'Defender for Servers adds vulnerability assessment, Defender for Endpoint EDR, JIT VM access, and FIM for Azure and Arc-connected servers. Bastion and the agent/baseline tools do not provide server threat protection.',
    references: [REF_DEFENDER_SERVERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'The security policy forbids public IPs on management interfaces. Admins still need RDP/SSH to VMs. Which service satisfies both?',
    options: opts4(
      'Azure Bastion',
      'Public IP with NSG allowing RDP from the internet',
      'Azure CDN endpoint',
      'Azure Front Door route'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion provides RDP/SSH over TLS via the portal to private IPs, eliminating public management exposure. An internet-facing RDP port—even behind an NSG—violates the no-public-management-IP requirement.',
    references: [REF_BASTION]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance requirement states PaaS storage and databases must not be reachable from the public internet. Which design enforces this while keeping app connectivity?',
    options: opts4(
      'Private endpoints (Azure Private Link) with public network access disabled',
      'A firewall rule allowing only the office public IP',
      'Relying on strong account keys alone',
      'A read-only resource lock'
    ),
    correct: ['a'],
    explanation: 'Private endpoints plus disabling public network access make the service reachable only via private IP on approved VNets, satisfying the no-public-internet requirement. IP allowlists still expose a public endpoint; keys/locks do not restrict network reachability.',
    references: [REF_PRIVLINK]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'The hub network needs centralized egress control with FQDN filtering, IDPS, and TLS inspection for spoke workloads. Which service should be designed into the hub?',
    options: opts4(
      'Azure Firewall Premium',
      'A user-defined route only',
      'Azure Application Insights',
      'A public load balancer'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall Premium delivers FQDN/application filtering, IDPS, and TLS inspection as the centralized hub control. UDRs steer traffic but do not inspect it; App Insights and load balancers are not firewalls.',
    references: [REF_FIREWALL]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'East-west traffic between a web tier and a data tier must be restricted to only required ports from only the web subnet. Which control implements this micro-segmentation?',
    options: opts4(
      'NSGs (with application security groups) scoped to the tiers',
      'A single allow-any rule on the VNet',
      'Disabling DNS for the data subnet',
      'A public IP on the database VM'
    ),
    correct: ['a'],
    explanation: 'NSGs combined with application security groups enforce least-privilege, tier-scoped flows, the foundational micro-segmentation control. Allow-any rules or public IPs expand the attack surface; disabling DNS does not segment traffic.',
    references: [REF_NSG]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A high-profile public web front end needs protection against volumetric DDoS with cost protection and rapid-response engagement. Which service should the architect specify?',
    options: opts4(
      'Azure DDoS Protection',
      'Azure Backup',
      'Azure Policy',
      'Azure Resource Graph'
    ),
    correct: ['a'],
    explanation: 'Azure DDoS Protection provides always-on volumetric/protocol mitigation, cost protection, and DDoS Rapid Response. Backup, Policy, and Resource Graph do not mitigate DDoS.',
    references: [REF_DDOS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL hardening controls the architect should design for an AKS cluster.',
    options: opts4(
      'Private cluster or API server authorized IP ranges',
      'Entra integration with Kubernetes RBAC',
      'Microsoft Defender for Containers enabled',
      'A cluster admin kubeconfig shared in a public chat channel'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'AKS hardening uses API server restriction, Entra + Kubernetes RBAC, and Defender for Containers. Sharing a cluster-admin kubeconfig publicly is a severe credential exposure to avoid.',
    references: [REF_AKS_SEC, REF_DEFENDER_CONTAINERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Container images in ACR and running workloads in AKS need vulnerability scanning and runtime threat detection. Which Defender plan provides this?',
    options: opts4(
      'Microsoft Defender for Containers',
      'Azure Container Apps scaling rules',
      'Azure Front Door only',
      'Azure Batch pools'
    ),
    correct: ['a'],
    explanation: 'Defender for Containers scans registry images for vulnerabilities and provides Kubernetes posture and runtime detection. Container Apps scaling, Front Door, and Batch do not provide container threat protection.',
    references: [REF_DEFENDER_CONTAINERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A utility needs passive monitoring and threat detection for SCADA/OT networks with SOC integration and minimal disruption. Which solution should the architect specify?',
    options: opts4(
      'Microsoft Defender for IoT',
      'Azure Sphere only',
      'Azure Digital Twins',
      'Azure Stream Analytics'
    ),
    correct: ['a'],
    explanation: 'Defender for IoT provides agentless, passive OT/ICS monitoring and threat detection with Sentinel/Defender XDR integration. Azure Sphere is a device platform; Digital Twins and Stream Analytics are not OT security monitors.',
    references: [REF_DEFENDER_IOT]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Before any workloads deploy, the architect wants a governed foundation with management groups, policy guardrails, identity, and network topology. Which Microsoft construct provides it?',
    options: opts4(
      'Azure landing zones',
      'A single subscription with no governance',
      'Ad-hoc resource groups per developer',
      'A manual deployment checklist'
    ),
    correct: ['a'],
    explanation: 'Azure landing zones (CAF) provide a governed, policy-driven foundation so workloads inherit security and governance. Ungoverned subscriptions or ad-hoc resource groups do not provide consistent guardrails.',
    references: [REF_LZ]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Regulatory requirements mandate that the customer control and rotate encryption keys for VM and storage data at rest. Which design meets this?',
    options: opts4(
      'Customer-managed keys in Azure Key Vault for encryption at rest',
      'Disable encryption to simplify operations',
      'Store keys in a public container',
      'Use a single hard-coded key with no rotation'
    ),
    correct: ['a'],
    explanation: 'Customer-managed keys in Key Vault give the customer key ownership, rotation, and revocation for data at rest. Disabling encryption or insecure key storage fails the regulatory requirement.',
    references: [REF_ENCRYPTION, REF_KEYVAULT]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'On-premises and AWS Linux servers must be governed by the same Azure Policy and protected by Defender for Servers. Which technology makes this possible?',
    options: opts4(
      'Azure Arc-enabled servers',
      'Azure Dedicated Host',
      'Azure VMware Solution only',
      'Azure Spot instances'
    ),
    correct: ['a'],
    explanation: 'Azure Arc-enabled servers project non-Azure machines into Azure for consistent Policy, Defender for Servers, and update management. Dedicated Host, AVS, and Spot are Azure-resident capacity options, not hybrid management bridges.',
    references: [REF_DEFENDER_SERVERS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect needs threat protection for blob storage including malware scanning of uploads and detection of unusual access. Which Defender plan applies?',
    options: opts4(
      'Microsoft Defender for Storage',
      'Azure Storage lifecycle policies',
      'Azure CDN',
      'Azure Import/Export'
    ),
    correct: ['a'],
    explanation: 'Defender for Storage provides malware scanning of uploaded blobs and detection of anomalous access and exfiltration. Lifecycle policies, CDN, and Import/Export do not provide threat detection.',
    references: [REF_DEFENDER_STORAGE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Remote employees need access to specific internal apps without joining a flat VPN that grants broad network reach. Which Microsoft capability provides identity-centric, policy-aware access aligned to Zero Trust?',
    options: opts4(
      'Microsoft Entra Global Secure Access',
      'A full-tunnel VPN to the entire datacenter',
      'Internet-exposed RDP gateway',
      'Shared VPN credentials distributed by email'
    ),
    correct: ['a'],
    explanation: 'Global Secure Access provides per-app, Conditional-Access-aware connectivity without granting broad network trust, aligning with Zero Trust network access. Flat VPNs and shared credentials grant excessive implicit trust.',
    references: [REF_GAP]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Using Azure Bastion plus private endpoints and NSG micro-segmentation reduces the externally reachable attack surface and aligns infrastructure design with Zero Trust.',
    options: opts4('True', 'False', 'Only Bastion matters', 'Only NSGs matter'),
    correct: ['a'],
    explanation: 'Bastion removes public management exposure, private endpoints remove public PaaS exposure, and NSG segmentation limits lateral movement — collectively shrinking the attack surface in line with Zero Trust assume-breach design.',
    references: [REF_BASTION, REF_PRIVLINK, REF_NSG]
  },

  // ── Design Security Solutions for Applications and Data (17) ──
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Applications must obtain database and API credentials without storing any secret in code, config, or pipeline variables. Which design should the architect mandate?',
    options: opts4(
      'Managed identities with Azure Key Vault for any remaining secrets',
      'Connection strings embedded in the app binary',
      'Storage keys in client-side code',
      'Credentials in plaintext pipeline variables'
    ),
    correct: ['a'],
    explanation: 'Managed identities eliminate stored credentials for Entra-aware services; Key Vault secures any residual secrets accessed via that identity. Embedded, client-side, or plaintext-variable secrets are insecure anti-patterns.',
    references: [REF_KEYVAULT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Sensitive documents must carry classification and encryption that persists even when shared externally. Which Purview capability provides this?',
    options: opts4(
      'Sensitivity labels (Microsoft Purview Information Protection)',
      'Blob immutability policies',
      'Azure resource tags',
      'Azure Monitor log alerts'
    ),
    correct: ['a'],
    explanation: 'Purview Information Protection sensitivity labels classify and can encrypt and restrict documents/emails, with protection persisting outside the organization. Blob immutability, tags, and log alerts do not protect document content.',
    references: [REF_MIP]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'The organization needs to block sharing of credit-card and PII data through email, Teams, and endpoints. Which Purview capability should the architect design in?',
    options: opts4(
      'Data Loss Prevention (DLP) policies',
      'Azure Application Gateway path rules',
      'Azure Service Bus topics',
      'Azure Front Door caching'
    ),
    correct: ['a'],
    explanation: 'Purview DLP detects sensitive information types and labels and blocks or restricts sharing across email, Teams, SharePoint/OneDrive, and endpoints. The networking/messaging options do not perform content-aware DLP.',
    references: [REF_DLP]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A set of backend APIs must be exposed through a single managed gateway providing OAuth token validation, throttling, and consistent policies. Which Azure service should the architect place in front?',
    options: opts4(
      'Azure API Management',
      'Azure Event Hubs',
      'Azure Storage queues',
      'Azure Cache for Redis'
    ),
    correct: ['a'],
    explanation: 'API Management provides a managed API gateway with JWT/OAuth validation, rate limiting/quotas, and reusable policies. Event Hubs, queues, and Redis are not API gateways.',
    references: [REF_APIM]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'An internet-facing app must be protected from OWASP Top 10 attacks at the application layer with managed rule sets. Which capability should the architect deploy?',
    options: opts4(
      'Azure Web Application Firewall on Front Door or Application Gateway',
      'A network security group',
      'Azure Bastion',
      'Azure Private DNS zone'
    ),
    correct: ['a'],
    explanation: 'Azure WAF applies OWASP Core Rule Set protections (SQLi, XSS, etc.) at L7. NSGs operate at L3/L4, Bastion is for admin access, and private DNS does not inspect HTTP traffic.',
    references: [REF_WAF_APP]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect must ensure development teams perform threat modeling and security testing as part of the SDLC. Which Microsoft framework should be adopted?',
    options: opts4(
      'Microsoft Security Development Lifecycle (SDL)',
      'The Azure Architecture icons set',
      'The Microsoft 365 roadmap',
      'The Azure subscription limits page'
    ),
    correct: ['a'],
    explanation: 'The Microsoft SDL prescribes threat modeling, secure design and coding, and security testing throughout development. Icon sets, roadmaps, and limits pages are not secure-development frameworks.',
    references: [REF_SDL]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL DevSecOps controls aligned with Microsoft guidance for CI/CD pipelines.',
    options: opts4(
      'Static analysis and dependency/IaC scanning in the pipeline',
      'Pipeline secrets stored in Key Vault and injected at runtime',
      'Defender for DevOps aggregating findings into Defender for Cloud',
      'A single shared PAT with full org scope committed to the repo'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Shift-left DevSecOps includes pipeline scanning, Key Vault-managed secrets, and centralized findings via Defender for DevOps. A full-scope PAT committed to the repo is a critical secret-exposure anti-pattern.',
    references: [REF_DEFENDER_DEVOPS, REF_SDL]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Azure SQL must be monitored for anomalous logins and potential SQL injection, with findings in Defender for Cloud. Which plan should the architect enable?',
    options: opts4(
      'Microsoft Defender for SQL',
      'SQL automatic backups only',
      'SQL read scale-out',
      'SQL hyperscale only'
    ),
    correct: ['a'],
    explanation: 'Defender for SQL provides vulnerability assessment plus advanced threat protection (anomalous access, SQLi indicators) integrated with Defender for Cloud. Backups, read scale-out, and hyperscale are not threat-protection features.',
    references: [REF_DEFENDER_DB]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulator requires the customer to control encryption keys for data at rest across SQL and Storage with independent rotation. Which design should the architect choose?',
    options: opts4(
      'Customer-managed keys (CMK) in Azure Key Vault',
      'Platform-managed keys with no customer control where CMK is required',
      'No encryption to ease audits',
      'A static key checked into the repository'
    ),
    correct: ['a'],
    explanation: 'CMK in Key Vault satisfies regulatory requirements for customer-controlled key lifecycle and rotation for data at rest. Platform-only keys do not meet a CMK mandate, and no encryption or committed keys are insecure.',
    references: [REF_ENCRYPTION, REF_KEYVAULT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Security wants discovery of shadow-IT SaaS usage plus real-time session controls (e.g., block download of sensitive files) for sanctioned cloud apps. Which solution should the architect specify?',
    options: opts4(
      'Microsoft Defender for Cloud Apps with Conditional Access App Control',
      'Azure Traffic Manager',
      'Azure DNS private resolver',
      'Azure Logic Apps only'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud Apps (CASB) discovers shadow IT and, via Conditional Access App Control, applies real-time session controls such as blocking downloads. Traffic Manager, DNS resolver, and Logic Apps do not provide CASB session control.',
    references: [REF_DEFENDER_APPS, REF_CA]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'An Entra-registered application requests Microsoft Graph permissions. Which design principle should the architect enforce to limit blast radius?',
    options: opts4(
      'Request only the minimum required scopes and avoid broad write-all application permissions',
      'Always request the broadest permissions to avoid rework',
      'Share one privileged app registration across all services',
      'Grant admin consent to every requested permission by default'
    ),
    correct: ['a'],
    explanation: 'Least-privilege application access means requesting only the specific Graph scopes needed and avoiding broad write-all permissions or shared over-privileged registrations, limiting damage if the app is compromised.',
    references: [REF_RBAC, REF_ZT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A confidential analytics workload must keep data encrypted even during processing to limit exposure to the cloud platform operator. Which Azure capability addresses this?',
    options: opts4(
      'Azure confidential computing (trusted execution environments)',
      'Storage soft delete',
      'Azure Backup',
      'Azure CDN'
    ),
    correct: ['a'],
    explanation: 'Azure confidential computing protects data in use via hardware-based TEEs, complementing at-rest and in-transit encryption for highly sensitive workloads. Soft delete, backup, and CDN do not protect data during processing.',
    references: [REF_ENCRYPTION]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Access to a sensitive internal HR app must be limited to managed, compliant devices with acceptable session risk. Which design enforces this?',
    options: opts4(
      'Publish via Entra and require Conditional Access with compliant device and risk conditions',
      'Allow access from any device with only a username and password',
      'Hide the app behind an unlisted URL only',
      'Disable logging to reduce overhead'
    ),
    correct: ['a'],
    explanation: 'Conditional Access requiring device compliance and acceptable risk, applied to the Entra-published app, enforces Zero Trust application access. Password-only access, obscurity, or disabling logging do not meet the requirement.',
    references: [REF_CA, REF_GAP]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect needs to discover, classify, and govern data across Azure data services, on-premises, and other clouds for a unified data security program. Which solution applies?',
    options: opts4(
      'Microsoft Purview',
      'Azure Cost Management',
      'Azure Resource Mover',
      'Azure Advisor'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview discovers, classifies, and governs data across multicloud and on-premises sources, underpinning a unified data security program. Cost Management, Resource Mover, and Advisor are unrelated.',
    references: [REF_PURVIEW]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A containerized app on AKS must fetch secrets from Key Vault at runtime with no secret stored in the image or manifests. Which design should the architect recommend?',
    options: opts4(
      'AKS workload identity with the Key Vault Secrets Store CSI driver',
      'Secrets baked into the Docker image',
      'Secrets in a plaintext ConfigMap committed to Git',
      'A static service account token hard-coded in the chart'
    ),
    correct: ['a'],
    explanation: 'AKS workload identity (Entra) plus the Secrets Store CSI driver lets pods retrieve Key Vault secrets at runtime without embedding them in images or manifests. Baked-in or committed secrets are critical exposures.',
    references: [REF_KEYVAULT, REF_AKS_SEC]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must design defense in depth for a public web application handling sensitive data. Which layered combination best aligns with Microsoft guidance?',
    options: opts4(
      'WAF (Front Door/App Gateway) + managed identity to data + Key Vault secrets + Purview labels/DLP + Defender for SQL',
      'A single WAF rule and nothing else',
      'Only network ACLs at the subnet level',
      'Obscurity of the application URL'
    ),
    correct: ['a'],
    explanation: 'Defense in depth layers L7 WAF, identity-based data access via managed identity, Key Vault secret management, Purview classification/DLP, and Defender for SQL threat detection. Single controls or obscurity do not provide layered protection.',
    references: [REF_WAF_APP, REF_KEYVAULT, REF_DLP]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Using managed identities for application-to-service authentication removes the need to store and rotate connection-string secrets, supporting least-privilege and reducing secret-sprawl risk.',
    options: opts4('True', 'False', 'Only for storage accounts', 'Only in non-production'),
    correct: ['a'],
    explanation: 'Managed identities let apps authenticate to Entra-aware services (SQL, Storage, Key Vault, Service Bus) without stored secrets, eliminating secret rotation burden and reducing secret sprawl across all environments.',
    references: [REF_KEYVAULT, REF_RBAC]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Design Solutions That Align with Security Best Practices and Priorities (16) ──
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new architect must brief the security team on the canonical Microsoft technical reference that diagrams how Microsoft security capabilities span identity, SOC, infrastructure, data, and OT. Which document is that reference?',
    options: opts4(
      'The Microsoft Cybersecurity Reference Architectures (MCRA)',
      'The Azure release notes',
      'The Microsoft Teams admin guide',
      'The Azure SLA page'
    ),
    correct: ['a'],
    explanation: 'The MCRA is the authoritative diagram set mapping Microsoft security capabilities across the estate, used to align strategy and roadmap. Release notes, Teams admin, and SLA pages are not architecture references.',
    references: [REF_MCRA]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization with a legacy "trusted internal network" wants the architect to articulate the target operating model. Which model should replace network-location trust?',
    options: opts4(
      'Zero Trust (verify explicitly, least privilege, assume breach)',
      'Expanded VPN trust for all internal subnets',
      'A bigger perimeter firewall as the sole control',
      'Implicit trust for domain-joined devices'
    ),
    correct: ['a'],
    explanation: 'Zero Trust replaces network-location trust with explicit verification, least privilege, and assume-breach design. Expanded VPN trust, perimeter-only controls, and implicit device trust are the legacy patterns being replaced.',
    references: [REF_ZT]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership wants to know if Azure resources meet CIS and NIST controls without authoring a custom catalog. Which capability should the architect use?',
    options: opts4(
      'Defender for Cloud regulatory compliance (Microsoft cloud security benchmark + added standards)',
      'Azure Advisor performance recommendations',
      'Azure Monitor workbook gallery',
      'Azure Resource Graph queries only'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud\'s regulatory compliance dashboard, backed by the Microsoft cloud security benchmark plus added standards (CIS, NIST), reports control alignment without a custom catalog. Advisor performance, workbooks, and Resource Graph are not compliance frameworks.',
    references: [REF_BENCHMARK, REF_DEFENDER_CLOUD]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which framework should the architect cite for organization-wide secure cloud strategy, governance, and operating model decisions?',
    options: opts4(
      'Cloud Adoption Framework — Secure methodology',
      'Well-Architected Framework — Cost Optimization pillar',
      'Azure CLI reference',
      'Azure Quickstart templates'
    ),
    correct: ['a'],
    explanation: 'The CAF Secure methodology guides organization-wide secure cloud strategy and governance. The WAF cost pillar is workload-scoped and cost-focused; CLI and quickstarts are implementation aids.',
    references: [REF_CAF]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A workload team must justify accepting a small performance cost for a stronger security control. Which Microsoft resource provides structured workload tradeoff guidance?',
    options: opts4(
      'Well-Architected Framework — Security pillar',
      'The Azure status history',
      'The Microsoft 365 service plan list',
      'The Azure portal keyboard shortcuts'
    ),
    correct: ['a'],
    explanation: 'The WAF Security pillar documents tradeoffs (security vs. performance/cost/operations) to support principled workload decisions. The other resources are not design-tradeoff guidance.',
    references: [REF_WAF_SEC]
  },
  {
    domain: BEST, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL initiatives appropriate for the first phase of a Zero Trust rapid modernization plan.',
    options: opts4(
      'Roll out MFA and risk-based Conditional Access',
      'Implement privileged access protections (PIM, secure admin devices)',
      'Begin data classification for the most sensitive information',
      'Defer all identity controls until every app is rewritten'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'RaMP front-loads identity/access, privileged access, and data protection as high-value quick wins. Deferring all identity work pending app rewrites contradicts risk-based prioritization.',
    references: [REF_ZT_RAMP]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool gives leadership a compliance score and prioritized improvement actions mapped to a chosen regulation?',
    options: opts4(
      'Microsoft Purview Compliance Manager',
      'Azure Cost Management',
      'Azure Network Watcher',
      'Azure Site Recovery'
    ),
    correct: ['a'],
    explanation: 'Compliance Manager provides a compliance score and prioritized improvement actions per regulation/standard. Cost Management, Network Watcher, and Site Recovery do not measure compliance posture.',
    references: [REF_COMPLIANCE]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must recommend the highest-impact preventive identity control against credential attacks across the enterprise. Which is it?',
    options: opts4(
      'Phishing-resistant multifactor authentication',
      'Mandatory weekly password changes only',
      'Disabling account lockout',
      'Allowing legacy authentication protocols'
    ),
    correct: ['a'],
    explanation: 'Microsoft guidance prioritizes MFA (ideally phishing-resistant) as the top preventive control; allowing legacy auth or disabling lockout increases credential risk, and frequent rotation alone is low value.',
    references: [REF_ZT_RAMP]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'Designing ransomware resilience, which control does Microsoft position as ensuring the business can recover without paying attackers?',
    options: opts4(
      'Tested, isolated, immutable backups with a validated recovery plan',
      'A faster antivirus signature update schedule only',
      'A larger SIEM ingestion quota only',
      'Disabling MFA during incidents to speed recovery'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s ransomware guidance centers recovery on tested, isolated/immutable backups with a validated recovery plan so the business can recover without paying. AV cadence, SIEM quota, and disabling MFA do not ensure recoverability.',
    references: [REF_RANSOMWARE, REF_BCDR]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly contrasts CAF and WAF for an SC-100 architect?',
    options: opts4(
      'CAF guides organization/portfolio cloud and security strategy; WAF guides workload-level design quality and tradeoffs',
      'Both are identical organization-wide pricing frameworks',
      'WAF defines the operating model; CAF only reviews single workloads',
      'Neither is relevant to security architecture'
    ),
    correct: ['a'],
    explanation: 'CAF is organization/portfolio scope (strategy, governance), WAF is workload scope (design pillars/tradeoffs). They are complementary and both relevant to security architecture; neither is a pricing framework.',
    references: [REF_CAF, REF_WAF_SEC]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'A board wants one consistent baseline used to grade security across Azure, AWS, and GCP via a single tool. Which combination should the architect propose?',
    options: opts4(
      'Microsoft cloud security benchmark assessed by multicloud Defender for Cloud',
      'Separate disconnected native tools with no shared standard',
      'Quarterly manual spreadsheet audits only',
      'A baseline for Azure only, ignoring AWS and GCP'
    ),
    correct: ['a'],
    explanation: 'Multicloud Defender for Cloud assessing against the Microsoft cloud security benchmark yields one consistent baseline across Azure/AWS/GCP. Disconnected tools, manual spreadsheets, or Azure-only scope do not provide consistency.',
    references: [REF_BENCHMARK, REF_DEFENDER_CLOUD]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Zero Trust principle drives the architect to design segmentation, encryption, and analytics as if attackers are already present?',
    options: opts4(
      'Assume breach',
      'Trust the internal network',
      'Perimeter is sufficient',
      'Implicit trust for managed devices'
    ),
    correct: ['a'],
    explanation: '"Assume breach" drives containment-oriented design (segmentation, encryption, least privilege, detection). The other options contradict Zero Trust.',
    references: [REF_ZT]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must enforce that no subscription can deploy unencrypted disks or publicly exposed storage, automatically and at scale. Which mechanism is appropriate?',
    options: opts4(
      'Azure Policy initiatives with deny/auditIfNotExists at management-group scope',
      'A monthly manual configuration audit',
      'A documented standard with no enforcement',
      'Resource tags as the only control'
    ),
    correct: ['a'],
    explanation: 'Azure Policy initiatives at management-group scope enforce preventive/detective guardrails automatically across all subscriptions. Manual audits, undocumented enforcement, or tags do not enforce compliance at scale.',
    references: [REF_POLICY]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership wants a single quantitative posture indicator to prioritize remediation and trend improvement in Azure. Which should the architect report?',
    options: opts4(
      'Defender for Cloud Secure Score',
      'Number of resource groups',
      'Total egress bandwidth',
      'Count of deployed Logic Apps'
    ),
    correct: ['a'],
    explanation: 'Secure Score is the control-mapped posture indicator used to prioritize remediation and trend improvement. Resource-group counts, bandwidth, and Logic App counts are not posture measurements.',
    references: [REF_SECURE_SCORE]
  },
  {
    domain: BEST, difficulty: 3, type: QType.SINGLE,
    stem: 'To ensure new workloads inherit security by default, which Microsoft approach should the architect adopt for the cloud foundation?',
    options: opts4(
      'Build CAF Azure landing zones with embedded Policy, RBAC, networking, and logging guardrails',
      'Create subscriptions on demand with no guardrails',
      'Apply security only to production after launch',
      'Let each team invent its own foundation'
    ),
    correct: ['a'],
    explanation: 'CAF Azure landing zones embed guardrails so workloads inherit security and governance by default. Ungoverned, reactive, or inconsistent foundations contradict secure-by-design.',
    references: [REF_LZ, REF_CAF]
  },
  {
    domain: BEST, difficulty: 2, type: QType.SINGLE,
    stem: 'An SC-100 architect uses the Cloud Adoption Framework for program/portfolio-level security strategy and the Well-Architected Framework for workload-level security design, applying each at its intended scope.',
    options: opts4('True', 'False', 'CAF and WAF have identical scope', 'Only one framework should ever be used'),
    correct: ['a'],
    explanation: 'CAF (portfolio/program) and WAF (workload) are complementary; the architect applies each at its intended scope rather than treating them as identical or mutually exclusive.',
    references: [REF_CAF, REF_WAF_SEC]
  },

  // ── Design Security Operations, Identity, and Compliance Capabilities (17) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The SOC needs one cloud-native platform to ingest, detect, and automate response across Azure, M365, AWS, and on-premises. Which service is the centerpiece?',
    options: opts4(
      'Microsoft Sentinel',
      'Azure Cost Management',
      'Azure Migrate',
      'Azure Resource Mover'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel is the cloud-native SIEM/SOAR that ingests multicloud and hybrid signals and automates response. Cost Management, Migrate, and Resource Mover are unrelated.',
    references: [REF_SENTINEL]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect wants endpoint, identity, email, and SaaS alerts auto-correlated into a single investigated incident before SIEM correlation. Which capability provides this?',
    options: opts4(
      'Microsoft Defender XDR',
      'Azure Monitor alerts',
      'Azure Traffic Manager',
      'Azure Event Grid'
    ),
    correct: ['a'],
    explanation: 'Defender XDR correlates cross-domain signals into unified incidents with automated investigation/response and can feed Sentinel. Azure Monitor alerts, Traffic Manager, and Event Grid do not perform XDR correlation.',
    references: [REF_XDR]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Privileged Azure role usage must be just-in-time, approved, time-bound, and audited. Which capability should the architect mandate?',
    options: opts4(
      'Microsoft Entra Privileged Identity Management (PIM)',
      'Azure Lighthouse delegation only',
      'A standing Owner assignment',
      'A shared admin credential'
    ),
    correct: ['a'],
    explanation: 'PIM delivers JIT, approval-gated, time-bound, audited activation of privileged roles. Lighthouse is for cross-tenant management delegation; standing/shared admin access violates least privilege.',
    references: [REF_PIM]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect needs every application sign-in evaluated against device compliance, location, and risk signals to grant or block. Which Entra component is the enforcement engine?',
    options: opts4(
      'Conditional Access',
      'Azure Firewall network rules',
      'Azure Front Door WAF',
      'User-defined routes'
    ),
    correct: ['a'],
    explanation: 'Conditional Access evaluates identity/device/location/risk to enforce access decisions and controls (MFA, compliant device). Firewall rules, Front Door WAF, and UDRs operate on network/HTTP traffic, not identity policy.',
    references: [REF_CA]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'When a user becomes high-risk mid-session, the architect needs the session revoked or challenged in near real time rather than at token expiry. Which feature provides this?',
    options: opts4(
      'Continuous access evaluation (CAE)',
      'Extending refresh token lifetime',
      'Disabling Identity Protection',
      'Caching tokens for longer'
    ),
    correct: ['a'],
    explanation: 'CAE enforces critical events (risk change, account disable, policy change) in near real time, revoking or challenging active sessions. Longer tokens or disabling Identity Protection widen the exposure window.',
    references: [REF_CAE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The organization must recertify privileged group membership periodically with automatic removal of unapproved access. Which governance feature applies?',
    options: opts4(
      'Access reviews',
      'Azure Monitor metrics',
      'Resource locks',
      'Azure Advisor'
    ),
    correct: ['a'],
    explanation: 'Access reviews recertify group/role/access-package membership and can auto-remove unapproved access. Monitor metrics, resource locks, and Advisor do not perform recertification.',
    references: [REF_ACCESS_REVIEW]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Contractors need governed, time-bound access bundles with approval and automatic expiry to specific apps and groups. Which Entra ID Governance capability fits?',
    options: opts4(
      'Entitlement management access packages',
      'A permanent guest with Global Reader',
      'A single shared contractor login',
      'Turning off external sharing'
    ),
    correct: ['a'],
    explanation: 'Entitlement management access packages provide governed, time-bound, approval-driven access with reviews for external users. Permanent privileged guests or shared logins violate least privilege and accountability.',
    references: [REF_ENTITLEMENT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL components of a Microsoft-aligned privileged access strategy.',
    options: opts4(
      'Privileged access workstations isolated from general productivity tasks',
      'JIT, time-bound elevation through PIM',
      'Phishing-resistant MFA for privileged identities',
      'Permanent Global Administrator for all IT staff'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A privileged access strategy combines isolated admin workstations, JIT elevation via PIM, and phishing-resistant MFA. Blanket permanent Global Admin is the anti-pattern to eliminate.',
    references: [REF_PRIV_ACCESS, REF_PAW]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The security team must continuously discover and reduce excessive multicloud permissions (Azure, AWS, GCP). Which Microsoft solution provides CIEM?',
    options: opts4(
      'Microsoft Entra Permissions Management',
      'Azure Bastion',
      'Azure Monitor only',
      'Azure Front Door'
    ),
    correct: ['a'],
    explanation: 'Entra Permissions Management is the CIEM solution that discovers and right-sizes permissions across Azure, AWS, and GCP. Bastion, Monitor, and Front Door do not address multicloud permission creep.',
    references: [REF_GDAP]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect must define SOC roles and functions (triage, investigation, threat hunting, threat intelligence). Which Microsoft guidance is the basis?',
    options: opts4(
      'Microsoft security operations function model',
      'Azure pricing calculator',
      'Azure region pairs list',
      'Microsoft 365 licensing guide'
    ),
    correct: ['a'],
    explanation: 'The SecOps function model defines SOC tiers and functions for the operating model. Pricing calculators, region lists, and licensing guides are not SOC design guidance.',
    references: [REF_SECOPS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'To reduce MTTR, the architect wants automatic containment (disable account, isolate device) triggered by high-confidence Sentinel detections. Which capability enables this?',
    options: opts4(
      'Sentinel automation rules and playbooks (SOAR)',
      'Log Analytics workspace retention',
      'Azure Monitor autoscale',
      'Azure DNS analytics'
    ),
    correct: ['a'],
    explanation: 'Sentinel SOAR (automation rules + Logic Apps playbooks) automates enrichment and containment to lower MTTR. Retention, autoscale, and DNS analytics do not orchestrate response.',
    references: [REF_SOAR]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect designs IR runbooks. Which phased lifecycle should they follow per Microsoft guidance?',
    options: opts4(
      'Preparation; detection and analysis; containment, eradication, recovery; post-incident activity',
      'Containment only',
      'Recovery before preparation',
      'No defined phases'
    ),
    correct: ['a'],
    explanation: 'Microsoft IR guidance follows preparation; detection/analysis; containment/eradication/recovery; and post-incident lessons learned. The other options omit critical phases or are unstructured.',
    references: [REF_INCIDENT]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid org wants resilient cloud authentication independent of on-premises availability plus leaked-credential detection. Which hybrid identity method should the architect recommend first?',
    options: opts4(
      'Password hash synchronization',
      'AD FS federation with a single server',
      'Pass-through authentication with one agent',
      'No directory sync at all'
    ),
    correct: ['a'],
    explanation: 'Password hash synchronization provides resilient cloud auth independent of on-prem availability and enables leaked-credential detection. Single-instance federation/PTA add on-prem dependency; no sync removes SSO and central control.',
    references: [REF_HYBRID_ID]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect needs detection content to stay current as new connectors are added, with minimal hand-authoring. Which Sentinel approach is recommended?',
    options: opts4(
      'Deploy and tune Sentinel content hub solutions per data source',
      'Disable all analytics rules',
      'Use one static rule for all sources permanently',
      'Forward logs to email without analytics'
    ),
    correct: ['a'],
    explanation: 'The Sentinel content hub provides maintained, source-specific detection content the architect deploys and tunes. Disabling or never updating detection content degrades coverage.',
    references: [REF_SENTINEL]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Compliance must monitor for risky insider behavior (e.g., mass data download before departure) while preserving employee privacy with pseudonymized investigations. Which solution applies?',
    options: opts4(
      'Microsoft Purview Insider Risk Management',
      'Azure Firewall Premium',
      'Defender for Storage only',
      'Azure DDoS Protection'
    ),
    correct: ['a'],
    explanation: 'Insider Risk Management detects risky insider activity with privacy-by-design (pseudonymization, scoped access). Firewall, storage, and DDoS tools do not address insider risk programs.',
    references: [REF_INSIDER]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Auditors require evidence that privileged role activations are approved and time-bound. Which control plus evidence should the architect present?',
    options: opts4(
      'PIM eligible assignments with approval workflow, evidenced by PIM activation and audit logs',
      'Permanent role assignments listed in a document',
      'A shared admin password with annual rotation',
      'VNet flow logs for the management subnet'
    ),
    correct: ['a'],
    explanation: 'PIM eligible assignments with approval enforce time-bound, approved privilege, and the PIM activation/audit history is the audit evidence. Permanent assignments, shared passwords, or flow logs do not evidence the control.',
    references: [REF_PIM]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Continuous access evaluation strengthens a Zero Trust identity design by enabling near-real-time enforcement of critical events such as account disablement or detected risk, instead of waiting for token expiry.',
    options: opts4('True', 'False', 'Only for guest users', 'Only when MFA is disabled'),
    correct: ['a'],
    explanation: 'CAE enforces critical security events in near real time, closing the gap between a risk/identity change and token expiry, which strengthens the verify-explicitly principle for all applicable users.',
    references: [REF_CAE, REF_ZT]
  },

  // ── Design Security Solutions for Infrastructure (15) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The architect must add EDR, vulnerability assessment, and JIT VM access for Azure and Arc-connected servers. Which Defender for Cloud plan provides this?',
    options: opts4(
      'Microsoft Defender for Servers',
      'Azure Update Manager only',
      'Azure Automanage only',
      'Azure Monitor Agent only'
    ),
    correct: ['a'],
    explanation: 'Defender for Servers adds Defender for Endpoint EDR, vulnerability assessment, JIT VM access, and FIM for Azure and Arc machines. Update Manager, Automanage, and the agent alone do not provide server threat protection.',
    references: [REF_DEFENDER_SERVERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Policy forbids public IPs on VMs, but admins need RDP/SSH. Which Azure service satisfies this securely?',
    options: opts4(
      'Azure Bastion',
      'A public jump box with RDP open to the internet',
      'Azure Front Door',
      'Azure CDN'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion provides RDP/SSH over TLS to private IPs from the portal, removing public management exposure. An internet-exposed jump box violates the no-public-IP policy; Front Door/CDN are content delivery, not admin access.',
    references: [REF_BASTION]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Storage, SQL, and Key Vault must not be reachable over the public internet while remaining accessible to approved VNets. Which design enforces this?',
    options: opts4(
      'Private endpoints (Private Link) with public network access disabled',
      'An IP allowlist on the public endpoint',
      'Account keys with long rotation periods',
      'A delete lock on the resource'
    ),
    correct: ['a'],
    explanation: 'Private endpoints with public access disabled make the services reachable only privately from approved VNets. IP allowlists still expose a public endpoint; keys and resource locks do not control network reachability.',
    references: [REF_PRIVLINK]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A hub-spoke design needs centralized FQDN egress filtering, IDPS, and TLS inspection. Which service belongs in the hub?',
    options: opts4(
      'Azure Firewall Premium',
      'A network security group only',
      'Azure Application Insights',
      'Azure Traffic Manager'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall Premium provides FQDN filtering, IDPS, and TLS inspection as the hub control. NSGs are L3/L4 ACLs; App Insights and Traffic Manager are not firewalls.',
    references: [REF_FIREWALL]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must limit lateral movement by restricting traffic between application tiers to only required flows. Which control is foundational?',
    options: opts4(
      'NSGs with application security groups scoped per tier',
      'A single allow-all VNet rule',
      'Public IPs on each tier for direct access',
      'Disabling NSGs to simplify connectivity'
    ),
    correct: ['a'],
    explanation: 'Tier-scoped NSGs with application security groups enforce least-privilege east-west flows, the foundational micro-segmentation control. Allow-all rules, public IPs, or disabled NSGs increase lateral-movement risk.',
    references: [REF_NSG]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A public-facing service requires always-on volumetric DDoS mitigation with cost protection and rapid-response support. Which service should the architect specify?',
    options: opts4(
      'Azure DDoS Protection',
      'Azure Key Vault',
      'Azure Policy',
      'Azure Backup'
    ),
    correct: ['a'],
    explanation: 'Azure DDoS Protection delivers always-on volumetric/protocol mitigation, cost protection, and DDoS Rapid Response. Key Vault, Policy, and Backup do not mitigate DDoS.',
    references: [REF_DDOS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls the architect should design to harden an AKS cluster.',
    options: opts4(
      'API server restriction (private cluster or authorized IP ranges)',
      'Entra integration with Kubernetes RBAC',
      'Microsoft Defender for Containers for posture and runtime detection',
      'A publicly exposed unauthenticated Kubernetes API server'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'AKS hardening uses API server restriction, Entra + Kubernetes RBAC, and Defender for Containers. A publicly exposed unauthenticated API server is a critical misconfiguration to avoid.',
    references: [REF_AKS_SEC, REF_DEFENDER_CONTAINERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'The architect must scan ACR images for vulnerabilities and detect malicious activity in running AKS workloads. Which Defender plan provides this?',
    options: opts4(
      'Microsoft Defender for Containers',
      'Azure Container Apps only',
      'Azure Front Door WAF only',
      'Azure Batch only'
    ),
    correct: ['a'],
    explanation: 'Defender for Containers scans registry images and provides Kubernetes posture and runtime threat detection. Container Apps, Front Door, and Batch do not provide container threat protection.',
    references: [REF_DEFENDER_CONTAINERS]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An industrial operator needs passive OT/ICS network monitoring and threat detection integrated with the SOC. Which solution should the architect specify?',
    options: opts4(
      'Microsoft Defender for IoT',
      'Azure Sphere only',
      'Azure Digital Twins',
      'Azure Stream Analytics'
    ),
    correct: ['a'],
    explanation: 'Defender for IoT provides agentless OT/ICS visibility and threat detection integrated with Sentinel/Defender XDR. Azure Sphere is a secured device platform; Digital Twins and Stream Analytics are not OT security monitors.',
    references: [REF_DEFENDER_IOT]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect wants a governed cloud foundation (management groups, policy, identity, networking) established before workloads land. Which construct provides it?',
    options: opts4(
      'Azure landing zones (Cloud Adoption Framework)',
      'A single ungoverned subscription',
      'Ad-hoc per-team resource creation',
      'A manual checklist with no enforcement'
    ),
    correct: ['a'],
    explanation: 'CAF Azure landing zones provide a governed foundation so workloads inherit security and governance. Ungoverned subscriptions, ad-hoc creation, or unenforced checklists do not.',
    references: [REF_LZ]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Regulators require the customer to own and rotate encryption keys for VM and storage data at rest. Which design satisfies this?',
    options: opts4(
      'Customer-managed keys in Azure Key Vault',
      'Disable encryption to ease audits',
      'Store keys in a public blob',
      'A single static key, never rotated'
    ),
    correct: ['a'],
    explanation: 'Customer-managed keys in Key Vault provide customer-owned, rotatable, revocable keys for data at rest. Disabling encryption or insecure key storage fails the regulatory mandate.',
    references: [REF_ENCRYPTION, REF_KEYVAULT]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'On-premises and GCP servers must be governed by the same Azure Policy and Defender for Servers protections as Azure VMs. Which technology enables this?',
    options: opts4(
      'Azure Arc-enabled servers',
      'Azure Dedicated Host',
      'Azure Spot VMs',
      'Azure Reserved Instances'
    ),
    correct: ['a'],
    explanation: 'Azure Arc projects on-premises and other-cloud servers into Azure for consistent Policy and Defender for Servers coverage. Dedicated Host, Spot, and Reserved Instances are Azure-only capacity/pricing options.',
    references: [REF_DEFENDER_SERVERS]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect needs blob storage protected against malicious uploads and anomalous access. Which Defender plan applies?',
    options: opts4(
      'Microsoft Defender for Storage',
      'Azure Storage lifecycle management',
      'Azure CDN',
      'Azure Data Box'
    ),
    correct: ['a'],
    explanation: 'Defender for Storage scans uploads for malware and detects anomalous access and exfiltration patterns. Lifecycle management, CDN, and Data Box do not provide threat protection.',
    references: [REF_DEFENDER_STORAGE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Remote staff must reach only specific internal apps with identity-centric, Conditional-Access-aware policy instead of broad VPN trust. Which Microsoft capability fits Zero Trust network access?',
    options: opts4(
      'Microsoft Entra Global Secure Access',
      'A full-tunnel VPN to the whole network',
      'Internet-exposed RDP gateway',
      'Shared VPN credentials emailed to staff'
    ),
    correct: ['a'],
    explanation: 'Global Secure Access provides per-app, policy-aware access without broad network trust, aligning with Zero Trust network access. Flat VPNs and shared credentials grant excessive implicit trust.',
    references: [REF_GAP]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Combining Azure Firewall in the hub, NSG micro-segmentation in spokes, and private endpoints for PaaS implements defense in depth consistent with Zero Trust infrastructure design.',
    options: opts4('True', 'False', 'Only the firewall is required', 'Only private endpoints matter'),
    correct: ['a'],
    explanation: 'A hub firewall (centralized inspection), spoke NSG segmentation (least-privilege east-west), and private endpoints (no public PaaS exposure) layer complementary controls, implementing defense in depth aligned with Zero Trust.',
    references: [REF_FIREWALL, REF_NSG, REF_PRIVLINK]
  },

  // ── Design Security Solutions for Applications and Data (17) ──
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Applications must not store secrets in code or config. Which Azure service should hold secrets, accessed via a managed identity?',
    options: opts4(
      'Azure Key Vault',
      'A plaintext .env committed to Git',
      'Secrets printed to stdout logs',
      'A shared notes document'
    ),
    correct: ['a'],
    explanation: 'Key Vault centrally stores secrets/keys/certificates accessed via managed identity and RBAC, removing secrets from code/config. Committed .env files, logged secrets, and shared docs are insecure.',
    references: [REF_KEYVAULT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'To eliminate stored connection strings for SQL and Storage, which approach should the architect mandate for the application?',
    options: opts4(
      'Authenticate with a managed identity to SQL and Storage via Entra ID',
      'Embed the SQL admin password in the app config',
      'Use the storage key in browser JavaScript',
      'Disable database authentication'
    ),
    correct: ['a'],
    explanation: 'Managed identity authentication to SQL and Storage via Entra removes stored connection-string secrets and supports RBAC least privilege. Embedded passwords, client-side keys, and disabled auth are critical vulnerabilities.',
    references: [REF_KEYVAULT, REF_RBAC]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Sensitive content must be classified and protected so encryption travels with the file even when shared externally. Which Purview capability provides this?',
    options: opts4(
      'Sensitivity labels (Microsoft Purview Information Protection)',
      'Azure resource tags',
      'Blob versioning',
      'Azure Monitor alert rules'
    ),
    correct: ['a'],
    explanation: 'Purview Information Protection sensitivity labels classify and can encrypt/restrict files and email, with protection persisting outside the organization. Tags, versioning, and alerts do not protect content.',
    references: [REF_MIP]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'The organization must prevent exfiltration of labeled sensitive data across email, Teams, SharePoint, and endpoints. Which Purview capability should the architect design in?',
    options: opts4(
      'Data Loss Prevention (DLP)',
      'Azure Front Door rules',
      'Azure Service Bus',
      'Azure Application Gateway'
    ),
    correct: ['a'],
    explanation: 'Purview DLP detects sensitive info types/labels and restricts sharing across email, Teams, SharePoint/OneDrive, and endpoints. Front Door, Service Bus, and Application Gateway do not perform content-aware DLP.',
    references: [REF_DLP]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Backend microservice APIs must be fronted by a managed gateway providing OAuth/JWT validation, quotas, and consistent policy. Which Azure service should the architect choose?',
    options: opts4(
      'Azure API Management',
      'Azure Event Grid',
      'Azure Storage queues',
      'Azure Cache for Redis'
    ),
    correct: ['a'],
    explanation: 'API Management is the managed API gateway providing JWT/OAuth validation, throttling/quotas, and reusable policies. Event Grid, queues, and Redis are not API gateways.',
    references: [REF_APIM]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A public web app must be protected from OWASP Top 10 attacks at L7 with managed rule sets. Which capability should the architect deploy?',
    options: opts4(
      'Azure Web Application Firewall on Front Door or Application Gateway',
      'A subnet NSG',
      'Azure Bastion',
      'Azure Private DNS'
    ),
    correct: ['a'],
    explanation: 'Azure WAF applies OWASP Core Rule Set protections at L7 (SQLi, XSS). NSGs are L3/L4, Bastion is admin access, and private DNS does not inspect HTTP payloads.',
    references: [REF_WAF_APP]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Development teams must perform threat modeling and security testing within the SDLC. Which Microsoft framework should the architect adopt?',
    options: opts4(
      'Microsoft Security Development Lifecycle (SDL)',
      'Azure naming conventions guide',
      'Microsoft 365 roadmap',
      'Azure subscription limits documentation'
    ),
    correct: ['a'],
    explanation: 'The Microsoft SDL prescribes threat modeling, secure design/coding, and security testing throughout development. The other documents are not secure-development frameworks.',
    references: [REF_SDL]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL DevSecOps controls aligned with Microsoft guidance.',
    options: opts4(
      'Scan code, dependencies, and IaC in CI',
      'Store pipeline secrets in Key Vault, injected at runtime',
      'Use Microsoft Defender for DevOps to centralize findings',
      'Commit a full-scope personal access token to the repository'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DevSecOps shifts security left with pipeline scanning, Key Vault-managed secrets, and centralized findings via Defender for DevOps. Committing a full-scope PAT is a critical secret-exposure anti-pattern.',
    references: [REF_DEFENDER_DEVOPS, REF_SDL]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Azure SQL must be monitored for anomalous access and SQL injection indicators surfaced in Defender for Cloud. Which plan should the architect enable?',
    options: opts4(
      'Microsoft Defender for SQL',
      'SQL automatic tuning',
      'SQL geo-replication',
      'SQL elastic pools'
    ),
    correct: ['a'],
    explanation: 'Defender for SQL provides vulnerability assessment and advanced threat protection (anomalous access, SQLi indicators) integrated with Defender for Cloud. Tuning, geo-replication, and elastic pools are not threat protection.',
    references: [REF_DEFENDER_DB]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulator mandates customer-controlled, independently rotated encryption keys for SQL and Storage data at rest. Which design should the architect choose?',
    options: opts4(
      'Customer-managed keys (CMK) in Azure Key Vault',
      'Platform-managed keys only where CMK is mandated',
      'No encryption to simplify audits',
      'A static key stored in source control'
    ),
    correct: ['a'],
    explanation: 'CMK in Key Vault satisfies the customer-controlled, rotatable key mandate for data at rest. Platform-only keys do not satisfy a CMK requirement; no encryption or committed keys are insecure.',
    references: [REF_ENCRYPTION, REF_KEYVAULT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Security needs shadow-IT discovery plus session controls (e.g., block downloads of sensitive files) for sanctioned SaaS. Which solution should the architect specify?',
    options: opts4(
      'Microsoft Defender for Cloud Apps with Conditional Access App Control',
      'Azure DNS private resolver',
      'Azure Traffic Manager',
      'Azure Logic Apps only'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud Apps (CASB) discovers shadow IT and applies real-time session controls via Conditional Access App Control. DNS resolver, Traffic Manager, and Logic Apps do not provide CASB session control.',
    references: [REF_DEFENDER_APPS, REF_CA]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'An Entra-registered app requests Microsoft Graph permissions. Which least-privilege principle should the architect enforce?',
    options: opts4(
      'Request only minimum required scopes; avoid broad write-all application permissions and shared over-privileged registrations',
      'Always request the broadest scopes to avoid future changes',
      'Reuse one privileged registration for all services',
      'Grant admin consent to all requested permissions by default'
    ),
    correct: ['a'],
    explanation: 'Least-privilege application access requests only required Graph scopes and avoids broad write-all permissions and shared over-privileged registrations, limiting blast radius if the app is compromised.',
    references: [REF_RBAC, REF_ZT]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A confidential workload must keep data encrypted during processing to limit cloud-operator exposure. Which Azure capability addresses this?',
    options: opts4(
      'Azure confidential computing (trusted execution environments)',
      'Storage soft delete',
      'Azure Backup vault',
      'Azure CDN edge cache'
    ),
    correct: ['a'],
    explanation: 'Azure confidential computing keeps data encrypted in use via hardware-based TEEs, complementing encryption at rest and in transit. Soft delete, backup, and CDN do not protect data during processing.',
    references: [REF_ENCRYPTION]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Access to a sensitive internal finance app must be restricted to compliant, managed devices with acceptable session risk. Which design enforces this?',
    options: opts4(
      'Publish via Entra and require Conditional Access with compliant device and risk conditions',
      'Allow any device with username and password only',
      'Protect the app solely with an unlisted URL',
      'Turn off sign-in logging to reduce overhead'
    ),
    correct: ['a'],
    explanation: 'Conditional Access requiring device compliance and acceptable risk on the Entra-published app enforces Zero Trust application access. Password-only access, obscurity, or disabled logging do not meet the requirement.',
    references: [REF_CA, REF_GAP]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'The architect needs unified discovery, classification, and governance of data across Azure, on-premises, and other clouds. Which Microsoft solution applies?',
    options: opts4(
      'Microsoft Purview',
      'Azure Advisor',
      'Azure Cost Management',
      'Azure Resource Mover'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview discovers, classifies, and governs data across multicloud and on-premises sources for a unified data security program. Advisor, Cost Management, and Resource Mover are unrelated.',
    references: [REF_PURVIEW]
  },
  {
    domain: APPDATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A pod on AKS must retrieve Key Vault secrets at runtime with no secret in the image or manifests. Which design should the architect recommend?',
    options: opts4(
      'AKS workload identity with the Key Vault Secrets Store CSI driver',
      'Secrets embedded in the container image',
      'Secrets in a plaintext ConfigMap in Git',
      'A hard-coded token in Helm values committed to source control'
    ),
    correct: ['a'],
    explanation: 'AKS workload identity (Entra) with the Secrets Store CSI driver lets pods fetch Key Vault secrets at runtime without embedding them in images or manifests. Embedded or committed secrets are critical exposures.',
    references: [REF_KEYVAULT, REF_AKS_SEC]
  },
  {
    domain: APPDATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Layering an L7 WAF, managed-identity-based data access, Key Vault for secrets, and Purview labeling/DLP provides defense in depth for a sensitive public web application per Microsoft guidance.',
    options: opts4('True', 'False', 'Only the WAF is needed', 'Only Key Vault is needed'),
    correct: ['a'],
    explanation: 'Defense in depth layers complementary controls: L7 WAF at the edge, identity-based data access, Key Vault secret management, and Purview classification/DLP. No single control alone provides equivalent protection.',
    references: [REF_WAF_APP, REF_KEYVAULT, REF_DLP]
  }
];

const SC100_DOMAINS = [
  { name: BEST, weight: 24 },
  { name: OPS, weight: 27 },
  { name: INFRA, weight: 23 },
  { name: APPDATA, weight: 26 }
];

const SC100_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-sc-100-p1',
    code: 'SC-100-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering security best practices and priorities, security operations/identity/compliance, infrastructure security, and application & data security.',
    questions: P1
  },
  {
    slug: 'microsoft-sc-100-p2',
    code: 'SC-100-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-sc-100-p3',
    code: 'SC-100-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const SC100_BUNDLE = {
  slug: 'microsoft-sc-100',
  title: 'Microsoft Cybersecurity Architect Expert (SC-100)',
  description: 'All 3 SC-100 practice exams in one bundle — covering security best practices and priorities, security operations/identity/compliance, infrastructure security, and application & data security, aligned to the Microsoft Cybersecurity Architect Expert (SC-100) exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the SC-100 bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:sc100-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedSc100(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure, security, identity, and the Microsoft Cybersecurity Architect Expert credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure, security, identity, and the Microsoft Cybersecurity Architect Expert credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SC100_EXAMS) {
    const title = `Microsoft Cybersecurity Architect Expert (SC-100) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Microsoft Cybersecurity Architect Expert (SC-100) exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Expert',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: SC100_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:sc100-seed' } });
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
          generatedBy: 'manual:sc100-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SC100_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SC100_BUNDLE.slug },
    update: {
      title: SC100_BUNDLE.title,
      description: SC100_BUNDLE.description,
      price: SC100_BUNDLE.price,
      priceVoucher: SC100_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SC100_BUNDLE.slug,
      title: SC100_BUNDLE.title,
      description: SC100_BUNDLE.description,
      price: SC100_BUNDLE.price,
      priceVoucher: SC100_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-sc-100-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-sc-100-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-sc-100-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-sc-100-p1', tier: 'VOUCHER' as const, position: 4 }
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
