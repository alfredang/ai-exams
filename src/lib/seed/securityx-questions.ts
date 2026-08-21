/**
 * CompTIA SecurityX (CASP+, CAS-005) bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:securityx-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedSecurityX(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/securityx.ts`) and the
 * protected admin API (`/api/admin/seed-securityx`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the public CompTIA SecurityX
 * (CAS-005) exam objectives and enterprise security architecture /
 * engineering practice:
 *   - Governance, Risk, and Compliance  — 20% (13 / 65)
 *   - Security Architecture             — 27% (18 / 65)
 *   - Security Engineering              — 31% (20 / 65)
 *   - Security Operations               — 22% (14 / 65)
 *
 * These are original advanced scenario items written to the objective
 * domains; they are NOT real exam questions and make no such claim.
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

const GRC = 'Governance, Risk, and Compliance';
const ARCH = 'Security Architecture';
const ENG = 'Security Engineering';
const OPS = 'Security Operations';

const REF_OBJ = { label: 'CompTIA — SecurityX (CAS-005) certification', url: 'https://www.comptia.org/certifications/securityx' };
const REF_NIST_RMF = { label: 'NIST SP 800-37 Rev. 2 — Risk Management Framework', url: 'https://csrc.nist.gov/pubs/sp/800/37/r2/final' };
const REF_NIST_CSF = { label: 'NIST Cybersecurity Framework 2.0', url: 'https://www.nist.gov/cyberframework' };
const REF_NIST_53 = { label: 'NIST SP 800-53 Rev. 5 — Security and Privacy Controls', url: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final' };
const REF_NIST_61 = { label: 'NIST SP 800-61 — Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' };
const REF_NIST_207 = { label: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final' };
const REF_NIST_63B = { label: 'NIST SP 800-63B — Digital Identity Guidelines (Authentication)', url: 'https://pages.nist.gov/800-63-3/sp800-63b.html' };
const REF_NIST_57 = { label: 'NIST SP 800-57 — Recommendation for Key Management', url: 'https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final' };
const REF_NIST_FIPS140 = { label: 'NIST FIPS 140-3 — Security Requirements for Cryptographic Modules', url: 'https://csrc.nist.gov/pubs/fips/140-3/final' };
const REF_NIST_PQC = { label: 'NIST — Post-Quantum Cryptography standardization', url: 'https://csrc.nist.gov/projects/post-quantum-cryptography' };
const REF_NIST_PRIVACY = { label: 'NIST Privacy Framework 1.0', url: 'https://www.nist.gov/privacy-framework' };
const REF_NIST_SSDF = { label: 'NIST SP 800-218 — Secure Software Development Framework', url: 'https://csrc.nist.gov/pubs/sp/800/218/final' };
const REF_NIST_115 = { label: 'NIST SP 800-115 — Technical Guide to Information Security Testing', url: 'https://csrc.nist.gov/pubs/sp/800/115/final' };
const REF_NIST_160 = { label: 'NIST SP 800-160 Vol. 1 — Systems Security Engineering', url: 'https://csrc.nist.gov/pubs/sp/800/160/v1/r1/final' };
const REF_OWASP_ASVS = { label: 'OWASP Application Security Verification Standard', url: 'https://owasp.org/www-project-application-security-verification-standard/' };
const REF_OWASP_TOP10 = { label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' };
const REF_MITRE_ATTACK = { label: 'MITRE ATT&CK', url: 'https://attack.mitre.org/' };
const REF_MITRE_DEFEND = { label: 'MITRE D3FEND', url: 'https://d3fend.mitre.org/' };
const REF_CISA_ZT = { label: 'CISA — Zero Trust Maturity Model', url: 'https://www.cisa.gov/zero-trust-maturity-model' };
const REF_CIS = { label: 'CIS Critical Security Controls', url: 'https://www.cisecurity.org/controls' };
const REF_ISO27001 = { label: 'ISO/IEC 27001 — Information security management', url: 'https://www.iso.org/standard/27001' };
const REF_PCI = { label: 'PCI Security Standards Council — PCI DSS', url: 'https://www.pcisecuritystandards.org/' };
const REF_GDPR = { label: 'GDPR — General Data Protection Regulation', url: 'https://gdpr.eu/' };
const REF_FAIR = { label: 'FAIR Institute — Factor Analysis of Information Risk', url: 'https://www.fairinstitute.org/what-is-fair' };
const REF_CLOUD_SEC = { label: 'Cloud Security Alliance — Security Guidance', url: 'https://cloudsecurityalliance.org/research/guidance/' };
const REF_AWS_WAF = { label: 'AWS Well-Architected Framework — Security Pillar', url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html' };
const REF_SAMM = { label: 'OWASP SAMM — Software Assurance Maturity Model', url: 'https://owaspsamm.org/' };
const REF_STRIDE = { label: 'Microsoft — Threat modeling (STRIDE)', url: 'https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats' };
const REF_SLSA = { label: 'SLSA — Supply-chain Levels for Software Artifacts', url: 'https://slsa.dev/' };
const REF_TLS = { label: 'IETF RFC 8446 — TLS 1.3', url: 'https://www.rfc-editor.org/rfc/rfc8446' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// Per-variant blueprint distribution (sums to 65):
//   GRC 13, Architecture 18, Engineering 20, Operations 14

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Governance, Risk, and Compliance (13) ──
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An enterprise must select a structured process to authorize information systems to operate by categorizing systems, selecting and implementing controls, and continuously monitoring them. Which framework defines this seven-step lifecycle?',
    options: opts4(
      'NIST Risk Management Framework (SP 800-37)',
      'NIST Cybersecurity Framework 2.0 core functions',
      'ISO/IEC 27001 Annex A control selection',
      'NIST SP 800-53 control families and baselines'
    ),
    correct: ['a'],
    explanation: 'The NIST RMF (SP 800-37 Rev. 2) defines the Prepare, Categorize, Select, Implement, Assess, Authorize, and Monitor steps used to authorize systems to operate. ASVS verifies app security, ATT&CK is an adversary knowledge base, and PCI DSS is a payment-card standard.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk analyst quantifies cyber risk for the board using the formula ALE = SLE × ARO. A database breach has an asset value of $2,000,000, an exposure factor of 30%, and is expected once every four years. What is the annualized loss expectancy?',
    options: opts4(
      '$150,000',
      '$600,000',
      '$2,400,000',
      '$500,000'
    ),
    correct: ['a'],
    explanation: 'SLE = asset value × exposure factor = $2,000,000 × 0.30 = $600,000. ARO = 1/4 = 0.25. ALE = $600,000 × 0.25 = $150,000. This quantitative result supports cost-justified control selection.',
    references: [REF_FAIR, REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid risk response strategies an enterprise can choose after assessing a residual risk that exceeds appetite.',
    options: opts4(
      'Mitigate by adding compensating controls to reduce likelihood or impact',
      'Transfer the financial exposure via cyber insurance or a contractual indemnity',
      'Avoid by discontinuing the activity that creates the exposure',
      'Eliminate all residual risk so the asset has zero remaining risk'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Mitigate, transfer, avoid, and accept are the recognized risk responses. Residual risk can never be reduced to absolute zero — there is always some remaining risk, so "eliminate all residual risk" is not achievable.',
    references: [REF_NIST_RMF, REF_FAIR]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A SaaS provider stores EU residents\' personal data. Which GDPR role applies to a customer that determines the purposes and means of processing that data?',
    options: opts4(
      'Data controller',
      'Data processor',
      'Data subject',
      'Supervisory authority'
    ),
    correct: ['a'],
    explanation: 'Under GDPR the data controller determines the purposes and means of processing. The processor acts on the controller\'s instructions, the data subject is the individual, and the supervisory authority is the regulator.',
    references: [REF_GDPR]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'During vendor due diligence a security architect is given a third party\'s SOC 2 Type II report. What does Type II additionally attest compared to Type I?',
    options: opts4(
      'The operating effectiveness of controls over a defined period',
      'Only the suitability of control design at a point in time',
      'Independent verification of the financial statements of the vendor',
      'Continuous real-time monitoring of the control environment year round'
    ),
    correct: ['a'],
    explanation: 'A SOC 2 Type I report covers control design at a point in time; a Type II report adds an opinion on operating effectiveness over a review period (commonly 6–12 months), giving stronger assurance for supply-chain risk decisions.',
    references: [REF_ISO27001, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A business continuity plan specifies that the order-processing system must be restored within 4 hours of an outage. Which metric does this 4-hour target represent?',
    options: opts4(
      'Recovery Time Objective (RTO)',
      'Recovery Point Objective (RPO)',
      'Mean Time To Repair (MTTR)',
      'Maximum Tolerable Downtime (MTD) for the entire enterprise'
    ),
    correct: ['a'],
    explanation: 'The RTO is the targeted duration within which a process must be restored after disruption. RPO measures tolerable data loss (time), MTTR is an average repair statistic, and MTD bounds total tolerable outage but is not the 4-hour restore target itself.',
    references: [REF_NIST_CSF, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'A privacy program is mapping obligations. Select ALL that are data-subject rights granted under the GDPR.',
    options: opts4(
      'Right of access to personal data held about them',
      'Right to erasure ("right to be forgotten")',
      'Right to data portability in a structured machine-readable format',
      'Right to demand the controller never log security events'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Access, erasure, and portability are explicit GDPR data-subject rights, along with rectification and objection. There is no right that prevents a controller from maintaining security logs needed for legitimate interests and legal obligations.',
    references: [REF_GDPR, REF_NIST_PRIVACY]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants a control catalog and tailoring process that maps to system impact levels (low/moderate/high) for U.S. federal-aligned systems. Which reference should it adopt for control selection?',
    options: opts4(
      'NIST SP 800-53 control families with FIPS 199 categorization',
      'ISO/IEC 27001 Annex A controls with a statement of applicability',
      'CIS Critical Security Controls with implementation groups',
      'NIST SP 800-37 authorization steps applied to each system'
    ),
    correct: ['a'],
    explanation: 'NIST SP 800-53 provides the control catalog and baselines that are tailored to low/moderate/high impact levels derived from FIPS 199 categorization. The other options are application-, defense-technique-, or payment-scoped.',
    references: [REF_NIST_53, REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A CISO needs an enterprise-wide governance outcome model with Govern, Identify, Protect, Detect, Respond, and Recover functions to communicate posture to executives. Which framework provides these functions?',
    options: opts4(
      'NIST Cybersecurity Framework 2.0',
      'NIST Risk Management Framework',
      'ISO/IEC 27001 Annex A',
      'CIS Critical Security Controls v8'
    ),
    correct: ['a'],
    explanation: 'NIST CSF 2.0 organizes outcomes into Govern, Identify, Protect, Detect, Respond, and Recover — designed for executive communication. The Risk Management Framework is an authorization process rather than an outcome model, ISO/IEC 27001 Annex A is a control set, and the CIS Controls are a prioritized safeguard list.',
    references: [REF_NIST_CSF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A contract with a managed-security provider must define measurable uptime and response commitments with financial penalties for breach. Which document codifies these commitments?',
    options: opts4(
      'Service Level Agreement (SLA)',
      'Memorandum of Understanding (MOU)',
      'Interconnection Security Agreement (ISA)',
      'Non-Disclosure Agreement (NDA)'
    ),
    correct: ['a'],
    explanation: 'An SLA defines measurable, enforceable service commitments (e.g., uptime, response time) and remedies. An MOU expresses intent without strict enforceability, an ISA governs system interconnection security, and an NDA covers confidentiality.',
    references: [REF_OBJ, REF_ISO27001]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An auditor flags that privileged database changes can be made by a single DBA who also approves the change. Which governance principle most directly addresses this finding?',
    options: opts4(
      'Separation of duties',
      'Least privilege only',
      'Defense in depth',
      'Security through obscurity'
    ),
    correct: ['a'],
    explanation: 'Separation of duties splits a sensitive action across multiple people so no single individual can both perform and approve it, reducing fraud and error. Least privilege limits scope but does not by itself split the request/approval roles.',
    references: [REF_NIST_53, REF_CIS]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A merchant that stores cardholder data must demonstrate ongoing compliance. Which standard\'s requirements (e.g., network segmentation, key management, quarterly scans) apply?',
    options: opts4(
      'PCI DSS',
      'HIPAA Security Rule',
      'SOX Section 404',
      'FedRAMP Moderate'
    ),
    correct: ['a'],
    explanation: 'PCI DSS governs entities that store, process, or transmit cardholder data, mandating segmentation, key management, and quarterly vulnerability scans (ASV). HIPAA covers PHI, SOX covers financial reporting controls, and FedRAMP covers cloud for U.S. federal agencies.',
    references: [REF_PCI]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership asks the security team to express how much loss exposure the organization is willing to accept in pursuit of objectives, to guide control investment. Which term captures this?',
    options: opts4(
      'Risk appetite',
      'Risk register',
      'Residual risk',
      'Inherent risk'
    ),
    correct: ['a'],
    explanation: 'Risk appetite is the amount and type of risk leadership is willing to accept to meet objectives; it drives investment thresholds. The register tracks risks, residual risk is what remains after controls, and inherent risk is pre-control exposure.',
    references: [REF_FAIR, REF_NIST_RMF]
  },

  // ── Security Architecture (18) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A security architect is redesigning the network around the assumption that no implicit trust is granted based on network location, and every request is authenticated and authorized. Which model is being adopted?',
    options: opts4(
      'Zero Trust Architecture',
      'Flat trusted LAN with perimeter firewall only',
      'Air-gapped network',
      'Classic DMZ with implicit internal trust'
    ),
    correct: ['a'],
    explanation: 'Zero Trust (NIST SP 800-207) removes implicit trust based on network location and enforces per-request authentication and authorization via a policy decision/enforcement point. The other models still rely on perimeter or location-based trust.',
    references: [REF_NIST_207, REF_CISA_ZT]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Zero Trust deployment, where is the access decision computed before traffic is allowed to a protected resource?',
    options: opts4(
      'At the Policy Decision Point, enforced by the Policy Enforcement Point',
      'At the identity provider during authentication, before authorization is evaluated',
      'At the enforcement point itself, which evaluates policy and applies the verdict',
      'At the resource, which validates the token and decides access independently'
    ),
    correct: ['a'],
    explanation: 'In NIST SP 800-207 the Policy Decision Point evaluates identity, device posture, and context to make an access decision; the Policy Enforcement Point grants or denies and brokers the session. Static ACLs and DNS filtering are not the ZT decision plane.',
    references: [REF_NIST_207]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'A multi-cloud landing zone must enforce consistent guardrails. Select ALL controls that belong in the architecture to limit blast radius.',
    options: opts4(
      'Account/subscription segmentation per environment with separate billing and IAM boundaries',
      'Service control policies / organization policies that deny disallowed regions and services',
      'A single shared admin account used across prod and dev for convenience',
      'Centralized logging to an immutable, separate security account'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Per-environment account segmentation, org-level deny guardrails, and centralized immutable logging in a separate account all reduce blast radius. A single shared admin account across prod and dev violates segregation and dramatically increases blast radius.',
    references: [REF_AWS_WAF, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must let microservices authenticate to each other with short-lived, automatically rotated cryptographic identities instead of static API keys. Which approach best fits?',
    options: opts4(
      'Workload identity with mTLS using a service mesh issuing SPIFFE-style certificates',
      'Long-lived client certificates issued per service at deployment and renewed annually',
      'OAuth client credentials with a shared secret rotated manually each quarter',
      'Service account tokens mounted into each pod with no expiry configured'
    ),
    correct: ['a'],
    explanation: 'A service mesh issuing short-lived SPIFFE/SPIRE-style workload identities with mutual TLS gives strong, automatically rotated service-to-service authentication. Static tokens, hard-coded credentials, and IP allow-lists are weak and unrotated.',
    references: [REF_NIST_207, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A design places web servers in a screened subnet reachable from the internet, while databases sit in an internal subnet that cannot be reached directly from the internet. What architectural pattern is this?',
    options: opts4(
      'Demilitarized zone (DMZ) segmentation',
      'Zero Trust per-request access brokering',
      'East-west micro-segmentation',
      'Software-defined perimeter overlay'
    ),
    correct: ['a'],
    explanation: 'Placing internet-facing services in a screened subnet (DMZ) and keeping sensitive data tiers in an internal-only subnet is classic DMZ segmentation that limits exposure of back-end systems. The other terms describe unrelated networking concepts.',
    references: [REF_NIST_53, REF_OBJ]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC needs east-west visibility inside a virtualized data center where traffic never leaves the hypervisor. Which design provides this without hair-pinning all traffic to a physical appliance?',
    options: opts4(
      'Micro-segmentation with virtual firewalling enforced at the hypervisor',
      'A perimeter firewall pair at the edge with every internal VLAN trunked to it',
      'Port mirroring every virtual switch to a central packet broker appliance',
      'Host-based intrusion detection agents reporting to a central console'
    ),
    correct: ['a'],
    explanation: 'Distributed micro-segmentation enforces policy and inspection at the hypervisor/virtual NIC, giving east-west visibility and containment without forcing all intra-data-center traffic through a physical appliance. A single edge firewall sees no internal east-west flows.',
    references: [REF_NIST_207, REF_CIS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'An enterprise is designing resilient architecture. Select ALL patterns that improve availability and fault tolerance.',
    options: opts4(
      'Active-active deployment across multiple availability zones with health-checked load balancing',
      'Stateless services with externalized session/state stores',
      'A single monolithic instance with no redundancy to simplify operations',
      'Graceful degradation and circuit breakers between dependent services'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Multi-AZ active-active with health checks, stateless services with external state, and circuit breakers/graceful degradation all increase resilience. A single non-redundant monolith is a single point of failure that reduces availability.',
    references: [REF_AWS_WAF, REF_NIST_160]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A platform team wants developers to consume infrastructure only through reviewed, version-controlled templates that bake in hardened defaults. Which approach enforces secure-by-default architecture at scale?',
    options: opts4(
      'Infrastructure as Code with policy-as-code guardrails in the pipeline',
      'A hardened golden image rebuilt and published by the platform team monthly',
      'A peer-reviewed architecture decision record for each new environment',
      'Post-deployment configuration scanning with findings raised as tickets'
    ),
    correct: ['a'],
    explanation: 'IaC with policy-as-code (e.g., OPA/Conftest, cloud org policies) evaluated in the pipeline enforces hardened, reviewed, and version-controlled defaults consistently. Manual and ad-hoc processes drift and do not scale securely.',
    references: [REF_AWS_WAF, REF_NIST_SSDF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect must ensure that if the TLS-terminating load balancer is compromised, traffic between it and back-end services is still confidential and integrity-protected. What should the design require?',
    options: opts4(
      'End-to-end TLS (re-encryption to back ends), not just edge termination',
      'Mutual TLS terminated only at the load balancer for client authentication',
      'IPsec tunnels between the load balancer and the internet-facing clients',
      'Application-layer field encryption applied to password fields only'
    ),
    correct: ['a'],
    explanation: 'Re-encrypting from the load balancer to back ends (end-to-end TLS) protects internal segments even if the edge is compromised. Plaintext internal traffic, shared static keys, and disabled validation all undermine confidentiality and integrity.',
    references: [REF_TLS, REF_NIST_207]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A data-classification-driven design must guarantee that "restricted" data is only stored in systems that enforce encryption at rest and field-level tokenization. Which architectural construct best enforces this end to end?',
    options: opts4(
      'Classification tags driving policy at the storage and application tiers',
      'Full-disk encryption on every server that stores the restricted datasets',
      'A data loss prevention policy scanning outbound email and web uploads',
      'Database transparent data encryption enabled across all instances'
    ),
    correct: ['a'],
    explanation: 'Data-centric security attaches classification metadata to data and enforces handling policy (encryption at rest, tokenization, access) consistently across storage and application tiers. Perimeter rules and administrative artifacts do not enforce data-level controls.',
    references: [REF_NIST_53, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An enterprise integrates partner identities. The design must let partners authenticate at their own IdP while the enterprise app trusts a signed assertion. Which protocol/pattern fits a browser-based federation?',
    options: opts4(
      'SAML 2.0 or OIDC federation with the enterprise as relying party / SP',
      'SCIM provisioning of partner user records into the enterprise directory',
      'Mutual TLS between the partner network and the enterprise application',
      'LDAP replication of the partner directory into the enterprise forest'
    ),
    correct: ['a'],
    explanation: 'Federated SSO with SAML 2.0 or OpenID Connect lets each partner authenticate at its own IdP and pass a signed assertion/token the enterprise (SP/relying party) trusts. The other options are insecure anti-patterns.',
    references: [REF_NIST_63B, REF_NIST_207]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A design review asks how to limit lateral movement if one workload is compromised in a Kubernetes cluster. Which architectural control most directly addresses this?',
    options: opts4(
      'Default-deny network policies with explicit allow between required pods',
      'Pod security admission set to the baseline profile across every namespace',
      'Resource quotas and limit ranges applied to each application namespace',
      'Image signature verification enforced at admission for all workloads'
    ),
    correct: ['a'],
    explanation: 'Default-deny Kubernetes NetworkPolicies with explicit allows constrain pod-to-pod traffic and limit lateral movement. Pod security admission limits what a container may do rather than where it may connect, resource quotas govern capacity, and image signature verification addresses supply chain — none of them restrict east-west traffic.',
    references: [REF_NIST_207, REF_CIS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'An architect is selecting controls for a high-availability secrets architecture. Select ALL appropriate design choices.',
    options: opts4(
      'A centralized secrets manager with automatic rotation and fine-grained access policies',
      'Dynamic, short-lived database credentials issued per workload',
      'Hard-coding secrets into container images for portability',
      'Audit logging of every secret access with alerting on anomalies'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A centralized secrets manager, dynamic short-lived credentials, and full access audit/alerting are sound. Hard-coding secrets into images leaks them into registries and version history and prevents rotation.',
    references: [REF_NIST_57, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated workload must keep cryptographic key material in hardware that is validated and from which keys cannot be exported in plaintext. Which component should the architecture mandate?',
    options: opts4(
      'A FIPS 140-3 validated Hardware Security Module (HSM)',
      'A cloud key management service with software-backed keys',
      'An encrypted secrets manager with automatic rotation enabled',
      'A password-protected PKCS#12 keystore on each host'
    ),
    correct: ['a'],
    explanation: 'A FIPS 140-3 validated HSM stores and uses keys in tamper-resistant hardware and prevents plaintext export, satisfying regulated key-protection requirements. The other options expose key material and lack validation.',
    references: [REF_NIST_FIPS140, REF_NIST_57]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'To reduce the attack surface of a public API, the architecture introduces a single managed entry point that handles authentication, rate limiting, and schema validation before requests reach microservices. What is this component called?',
    options: opts4(
      'API gateway',
      'Reverse DNS server',
      'Jump host',
      'SIEM collector'
    ),
    correct: ['a'],
    explanation: 'An API gateway centralizes authentication, throttling/rate limiting, and request validation in front of microservices, shrinking and standardizing the exposed surface. The other components serve unrelated functions.',
    references: [REF_OWASP_ASVS, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid design must ensure on-prem and cloud workloads share one identity source of truth with conditional access based on device and risk. Which architecture best meets this?',
    options: opts4(
      'A centralized IdP with federation and risk-based conditional access',
      'Directory synchronization with password hash sync and no policy engine',
      'A VPN concentrator enforcing device posture checks at connection time',
      'Separate cloud and on-premises identity stores kept in manual alignment'
    ),
    correct: ['a'],
    explanation: 'A centralized IdP that federates to on-prem and cloud, applying risk- and device-based conditional access, gives a single identity source of truth with adaptive enforcement. Local-only accounts, shared accounts, and static keys fragment and weaken identity.',
    references: [REF_NIST_63B, REF_NIST_207]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must allow the security team to inspect TLS traffic for malware while preserving certificate trust. Which approach is architecturally sound for managed corporate endpoints?',
    options: opts4(
      'A forward TLS-inspection proxy with an enterprise CA on managed endpoints',
      'Passive TLS metadata analysis using only the certificate and SNI fields',
      'Installing the inspection CA on every device including unmanaged BYOD',
      'Requiring all internal services to share a single wildcard certificate and key'
    ),
    correct: ['a'],
    explanation: 'A forward proxy performing TLS inspection using an enterprise CA distributed only to managed endpoints enables malware inspection while maintaining trust on those devices. Disabling TLS or trusting any cert destroys confidentiality/integrity, and untargeted full-plaintext capture is disproportionate.',
    references: [REF_TLS, REF_NIST_53]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect documents trust boundaries, data flows, and assets to systematically derive threats during design. Which activity is being performed?',
    options: opts4(
      'Threat modeling',
      'Penetration testing',
      'Disaster recovery testing',
      'Patch management'
    ),
    correct: ['a'],
    explanation: 'Threat modeling analyzes data flows, trust boundaries, and assets (e.g., via STRIDE) to derive and prioritize threats during design. Penetration testing, DR testing, and patching are operational activities performed later in the lifecycle.',
    references: [REF_STRIDE, REF_NIST_160]
  },

  // ── Security Engineering (20) ──
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An engineer must choose an encryption mode for protecting bulk data at rest that provides both confidentiality and built-in integrity/authentication. Which choice is most appropriate?',
    options: opts4(
      'AES-256 in GCM (an AEAD mode)',
      'AES-256 in CBC mode with a random IV',
      'AES-256 in CTR mode with a nonce',
      'ChaCha20 without Poly1305'
    ),
    correct: ['a'],
    explanation: 'AES-256-GCM is an authenticated encryption with associated data (AEAD) mode providing confidentiality and integrity in one construct. CBC with a random IV and CTR with a nonce both provide confidentiality only, and ChaCha20 without Poly1305 is the raw stream cipher — each needs a separate MAC before tampering can be detected.',
    references: [REF_NIST_57, REF_NIST_FIPS140]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'A team must store user passwords. Which approach follows current secure engineering guidance?',
    options: opts4(
      'A memory-hard hashing function such as Argon2id with a per-user salt',
      'PBKDF2-HMAC-SHA1 with one thousand iterations and a unique per-user salt',
      'Reversible AES-GCM encryption of the password with a managed key',
      'SHA-256 with a unique per-user salt and a single iteration'
    ),
    correct: ['a'],
    explanation: 'Passwords should be stored using a slow, memory-hard hash such as Argon2id (or scrypt/bcrypt) with a unique per-user salt. PBKDF2 at a thousand iterations is orders of magnitude below current guidance, reversible encryption means one key compromise exposes every password, and a single-iteration SHA-256 is far too fast to resist offline cracking.',
    references: [REF_NIST_63B, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'A platform is hardening TLS. Select ALL configuration choices that strengthen the deployment.',
    options: opts4(
      'Enable TLS 1.3 and disable TLS 1.0/1.1 and SSLv3',
      'Use cipher suites that provide forward secrecy (ECDHE)',
      'Enable HSTS with an appropriate max-age',
      'Allow RSA key-exchange-only suites with no forward secrecy as the default'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Enabling TLS 1.3, requiring forward secrecy (ECDHE), and enabling HSTS are hardening best practices. Defaulting to static RSA key exchange without forward secrecy lets recorded traffic be decrypted later if the key leaks.',
    references: [REF_TLS, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer needs to protect data in use while it is processed in an untrusted cloud host. Which technology is designed for this?',
    options: opts4(
      'Confidential computing using hardware trusted execution environments',
      'Full-disk encryption applied to every volume on the untrusted cloud host',
      'Transparent database encryption applied to every column',
      'TLS 1.3 between the client and the processing service'
    ),
    correct: ['a'],
    explanation: 'Confidential computing protects data in use by processing it inside hardware-backed trusted execution environments (enclaves), isolating it from the host OS/hypervisor. Disk, network, and column encryption protect data at rest or in transit, not while in use.',
    references: [REF_NIST_160, REF_CLOUD_SEC]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'A security engineer is preparing for "harvest now, decrypt later" attacks against long-lived confidential data. Which forward-looking control should be planned?',
    options: opts4(
      'Migrate key establishment to NIST post-quantum or hybrid algorithms',
      'Increase RSA key sizes to 8192 bits across the entire estate',
      'Rotate symmetric session keys more frequently on long-lived data flows',
      'Move long-lived secrets into a hardware security module'
    ),
    correct: ['a'],
    explanation: 'Harvest-now-decrypt-later motivates adopting NIST post-quantum algorithms (often in hybrid mode) and building crypto-agility so algorithms can be replaced. Larger RSA keys do not help, because a quantum attack succeeds against RSA at any practical key size; rotating session keys and moving secrets into an HSM protect future and stored material but not ciphertext an adversary has already recorded.',
    references: [REF_NIST_PQC, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must verify that a downloaded firmware image was produced by the vendor and not modified. Which mechanism provides authenticity and integrity?',
    options: opts4(
      'A digital signature verified with the vendor\'s public key',
      'A SHA-256 hash published alongside the firmware download page',
      'A CRC32 checksum included in the firmware header',
      'TLS on the download connection to the vendor site'
    ),
    correct: ['a'],
    explanation: 'A digital signature created with the vendor private key and verified with its public key provides both integrity and authenticity. A published SHA-256 hash proves integrity only — an attacker who can alter the download can usually alter the page beside it; CRC32 detects accidental corruption; and TLS protects the connection rather than the artifact.',
    references: [REF_NIST_57, REF_SLSA]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An application must call a downstream API on behalf of a user without ever handling the user\'s password. Which standard should the engineer implement?',
    options: opts4(
      'OAuth 2.0 authorization with scoped access tokens',
      'HTTP Basic auth forwarding the user password',
      'Storing the user password and replaying it to the API',
      'Embedding the password in the URL query string'
    ),
    correct: ['a'],
    explanation: 'OAuth 2.0 issues scoped, delegated access tokens so the application never sees the user credential. Forwarding, storing, or embedding passwords are credential-leak anti-patterns.',
    references: [REF_NIST_63B, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'An engineer hardens a Linux server build. Select ALL changes that meaningfully reduce attack surface.',
    options: opts4(
      'Remove or disable unused services and packages',
      'Enforce a host-based firewall with default-deny inbound',
      'Apply a CIS Benchmark and remediate failed checks',
      'Grant all users passwordless sudo for convenience'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Removing unused services, default-deny host firewalling, and applying a CIS Benchmark all shrink attack surface. Granting all users passwordless sudo massively expands privilege and is the opposite of hardening.',
    references: [REF_CIS, REF_NIST_53]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'A CI pipeline must prevent dependency-confusion and tampered build artifacts from reaching production. Which engineering practice best mitigates supply-chain risk?',
    options: opts4(
      'Pin dependencies and verify provenance via a vetted registry',
      'Mirror the public registry internally without provenance checks',
      'Rely on lockfiles alone without verifying package signatures',
      'Scan dependencies for known CVEs after the build completes'
    ),
    correct: ['a'],
    explanation: 'Pinning versions, verifying signatures/provenance per SLSA, and sourcing from a vetted registry defends against dependency confusion and artifact tampering. Mirroring without provenance checks still accepts a malicious upstream package, lockfiles alone pin versions without proving who built them, and scanning for CVEs after the build finds known flaws rather than substituted artifacts.',
    references: [REF_SLSA, REF_NIST_SSDF]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must ensure a stolen backup tape does not disclose data even if the physical media is read directly. Which control is required?',
    options: opts4(
      'Encryption of the backup data with keys stored separately',
      'Write-once media with a retention lock applied to every tape volume',
      'Encryption of the backup catalog database on the backup server',
      'Physical tamper seals and chain-of-custody logging during transport'
    ),
    correct: ['a'],
    explanation: 'Encrypting backup data and keeping keys separate from the media renders a stolen tape unreadable. Labels, weak physical storage, and an application UI password do not protect raw media read offline.',
    references: [REF_NIST_57, REF_NIST_53]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'A key-management engineer must minimize the impact of a compromised TLS server private key on previously captured traffic. Which property must the negotiated cipher suite provide?',
    options: opts4(
      'Perfect forward secrecy via ephemeral key exchange (ECDHE/DHE)',
      'Static RSA key transport with a 4096-bit server certificate chain',
      'AES-GCM authenticated encryption for the record layer',
      'Certificate pinning of the server certificate in the client'
    ),
    correct: ['a'],
    explanation: 'Forward secrecy from ephemeral Diffie-Hellman (ECDHE/DHE) ensures past sessions cannot be decrypted even if the long-term private key is later compromised. Static RSA transport lacks this; null encryption and compression do not address it (and compression enabled CRIME).',
    references: [REF_TLS, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer integrates a Hardware Security Module so the application can request signing without ever reading the private key. Which interface/standard is commonly used for this?',
    options: opts4(
      'PKCS#11 cryptographic token interface',
      'KMIP key management interoperability protocol',
      'JCE Java cryptography extension provider',
      'OpenSSL command-line signing utility'
    ),
    correct: ['a'],
    explanation: 'PKCS#11 is the standard cryptographic token API used to perform operations (e.g., signing) inside an HSM without exposing the private key. KMIP manages key lifecycle and distribution rather than invoking cryptographic operations, JCE is a Java provider framework that typically fronts PKCS#11 rather than replacing it, and the OpenSSL CLI is a tool rather than an integration interface.',
    references: [REF_NIST_FIPS140, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'To defend a web form against automated credential-stuffing, which engineering control directly raises attacker cost without blocking legitimate users outright?',
    options: opts4(
      'Rate limiting, step-up MFA, and breached-password checks',
      'Account lockout after three failed attempts against any username',
      'A CAPTCHA presented on every login attempt for every user account',
      'IP-based blocking of any address that produces more than one failure'
    ),
    correct: ['a'],
    explanation: 'Rate limiting, risk-based step-up MFA, and rejecting known-breached passwords raise attacker cost while keeping legitimate access usable. Lockout after three failures lets an attacker deny service to real users simply by guessing at them, a CAPTCHA on every login taxes everyone, and blocking an IP after a single failure breaks shared NAT egress for whole offices.',
    references: [REF_NIST_63B, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'An engineer designs a key lifecycle. Select ALL practices aligned with sound key management.',
    options: opts4(
      'Define cryptoperiods and rotate keys before they expire',
      'Separate key-encryption keys from data-encryption keys',
      'Maintain secure key backup/escrow with strict access control',
      'Reuse one symmetric key across all applications indefinitely'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Defined cryptoperiods with rotation, KEK/DEK separation, and controlled key backup/escrow are core NIST SP 800-57 practices. Reusing a single key everywhere forever maximizes blast radius on compromise.',
    references: [REF_NIST_57, REF_NIST_FIPS140]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must prevent a compromised CI runner from minting cloud credentials it can exfiltrate. Which mechanism best limits this?',
    options: opts4(
      'Short-lived OIDC-federated credentials scoped to the pipeline',
      'A long-lived cloud access key stored as a masked pipeline variable',
      'A dedicated service account key rotated by hand every ninety days',
      'Credentials injected at runtime from a shared secrets vault token'
    ),
    correct: ['a'],
    explanation: 'OIDC workload identity federation issues short-lived, narrowly scoped credentials per pipeline run, so a compromised runner cannot reuse or widely abuse them. Long-lived keys, root credentials, and embedded secrets are high-impact anti-patterns.',
    references: [REF_NIST_207, REF_SLSA]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'A secure-coding standard requires preventing SQL injection structurally rather than by filtering input. Which technique satisfies this?',
    options: opts4(
      'Parameterized queries / prepared statements',
      'Blacklisting the word "SELECT" in inputs',
      'URL-encoding all responses',
      'Disabling database logging'
    ),
    correct: ['a'],
    explanation: 'Parameterized queries separate code from data so user input cannot alter query structure, structurally preventing SQL injection. Keyword blacklists are bypassable, output encoding addresses XSS not SQLi, and disabling logging hurts detection.',
    references: [REF_OWASP_TOP10, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure a microservice can verify the integrity and origin of messages on a shared bus without confidentiality being the goal. Which primitive fits best?',
    options: opts4(
      'An HMAC (or signature) over each message with a managed key',
      'TLS on the transport between the message broker and each subscriber',
      'A monotonically increasing sequence number stamped on every message',
      'A CRC32 checksum computed over the message body'
    ),
    correct: ['a'],
    explanation: 'An HMAC or digital signature over each message provides integrity and origin authentication for bus messages. Compression and encoding provide no integrity guarantees, and a static header is trivially forged.',
    references: [REF_NIST_57, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'A privacy-by-design requirement says analytics must not be able to re-identify individuals while preserving aggregate statistical utility. Which technique is most appropriate?',
    options: opts4(
      'Differential privacy applied to query results/aggregates',
      'Deterministic tokenization of identifiers with a retained mapping table',
      'k-anonymity generalization with k set to 1 for each released record',
      'Salted hashing of email addresses before the aggregation runs'
    ),
    correct: ['a'],
    explanation: 'Differential privacy adds calibrated noise so individual records cannot be re-identified while preserving aggregate utility. Reversible encryption and unsalted hashes are reversible/linkable, and trusting analysts is not a technical control.',
    references: [REF_NIST_PRIVACY, REF_NIST_160]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must guarantee that audit logs cannot be silently altered by an attacker who gains write access to the log host. Which control best provides log integrity?',
    options: opts4(
      'Forward logs in near real time to a separate append-only/WORM store with hashing',
      'Store logs only on the same host in a world-writable file',
      'Rotate logs hourly and delete the old ones immediately',
      'Compress logs to save space'
    ),
    correct: ['a'],
    explanation: 'Streaming logs to a separate append-only/WORM store with integrity hashing prevents silent local tampering. Same-host world-writable storage, aggressive deletion, and compression do not protect integrity against an attacker on the log host.',
    references: [REF_NIST_61, REF_NIST_53]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure a database backup is both encrypted and that its integrity can be verified before any restore. Which combination of controls is appropriate?',
    options: opts4(
      'Encrypt the backup with an authenticated cipher and verify a stored cryptographic hash/signature before restore',
      'Store the backup in plaintext and trust the storage system',
      'Rely on the backup filename to indicate integrity',
      'Skip verification because restores are rare'
    ),
    correct: ['a'],
    explanation: 'Encrypting backups with an authenticated cipher protects confidentiality and integrity, and verifying a stored hash/signature before restore detects tampering or corruption. Plaintext storage, filename trust, and skipping verification leave backups exposed and unverified.',
    references: [REF_NIST_57, REF_NIST_53]
  },

  // ── Security Operations (14) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During an incident, responders move to limit the spread of an active ransomware infection by isolating affected segments before eradication. Which incident-response phase is this?',
    options: opts4(
      'Containment',
      'Preparation',
      'Lessons learned',
      'Recovery'
    ),
    correct: ['a'],
    explanation: 'In the NIST SP 800-61 lifecycle, isolating affected systems to limit spread is Containment, which precedes Eradication and Recovery. Preparation is pre-incident and lessons learned is the post-incident phase.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC analyst maps an adversary\'s observed techniques (e.g., spearphishing, credential dumping, lateral movement) to a common taxonomy to drive detection coverage. Which framework is used?',
    options: opts4(
      'MITRE ATT&CK',
      'NIST SP 800-37',
      'PCI DSS',
      'ISO 27001 Annex A'
    ),
    correct: ['a'],
    explanation: 'MITRE ATT&CK is the adversary tactics-and-techniques knowledge base used to map observed behavior and assess detection coverage. The others are risk, compliance, or ISMS frameworks, not technique taxonomies.',
    references: [REF_MITRE_ATTACK, REF_MITRE_DEFEND]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'A SOC is reducing alert fatigue while improving fidelity. Select ALL actions that help.',
    options: opts4(
      'Tune and correlate rules to suppress known-benign noise',
      'Enrich alerts with threat intel and asset context',
      'Automate triage of repetitive low-risk alerts via SOAR playbooks',
      'Disable logging on noisy systems to stop the alerts'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Rule tuning/correlation, enrichment with intel and asset context, and SOAR automation improve signal-to-noise without losing visibility. Disabling logging removes the telemetry needed for detection and investigation.',
    references: [REF_NIST_61, REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A forensic responder must collect evidence from a running server in a way that maximizes admissibility. Which order of volatility principle should guide collection?',
    options: opts4(
      'Capture the most volatile data (memory, network state) before less volatile data (disk)',
      'Always image the disk first and ignore memory',
      'Reboot the system to clear it before imaging',
      'Edit files in place to annotate findings'
    ),
    correct: ['a'],
    explanation: 'The order-of-volatility principle dictates collecting the most volatile evidence (RAM, network connections, running processes) before disk, since volatile data is lost on power-off or reboot. Rebooting or editing in place destroys/contaminates evidence.',
    references: [REF_NIST_61, REF_NIST_115]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'An analyst must preserve and document who handled an evidence drive, when, and why, from acquisition to court. Which artifact provides this?',
    options: opts4(
      'Chain of custody documentation',
      'A network diagram',
      'A vulnerability scan report',
      'An SLA'
    ),
    correct: ['a'],
    explanation: 'Chain-of-custody documentation records every transfer and handler of evidence to preserve integrity and admissibility. A network diagram, scan report, and SLA do not establish evidentiary handling.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A threat hunter forms the hypothesis that an adversary used valid accounts for persistence and proactively searches telemetry for confirming behavior. Which operational activity is this?',
    options: opts4(
      'Hypothesis-driven threat hunting',
      'Signature-based antivirus scanning',
      'Annual penetration testing',
      'Patch deployment'
    ),
    correct: ['a'],
    explanation: 'Proactively forming a hypothesis (often ATT&CK-aligned) and searching telemetry to confirm/deny it is hypothesis-driven threat hunting. AV scanning, scheduled pentests, and patching are different operational functions.',
    references: [REF_MITRE_ATTACK, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'A vulnerability-management program is being matured. Select ALL practices that improve operational risk reduction.',
    options: opts4(
      'Prioritize remediation using exploitability and asset criticality, not raw CVSS alone',
      'Track mean time to remediate and enforce SLAs by severity',
      'Validate fixes with re-scans or targeted testing',
      'Scan once per year and remediate only criticals if convenient'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Risk-based prioritization (exploitability + asset criticality), remediation SLAs/MTTR tracking, and fix validation drive measurable risk reduction. Annual-only scanning with optional remediation leaves long exposure windows.',
    references: [REF_NIST_115, REF_CIS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC wants to correlate logs from many sources, apply detection rules, and alert in near real time. Which platform is purpose-built for this?',
    options: opts4(
      'A Security Information and Event Management (SIEM) system',
      'A static spreadsheet of IPs',
      'A single host syslog file',
      'A WHOIS lookup service'
    ),
    correct: ['a'],
    explanation: 'A SIEM aggregates and normalizes multi-source logs, applies correlation/detection rules, and generates alerts in near real time. A spreadsheet, a single syslog file, or WHOIS cannot perform centralized correlation and alerting.',
    references: [REF_NIST_61, REF_CIS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'After containing an incident, the team holds a blameless review to capture root cause and improve controls and playbooks. Which IR phase does this represent?',
    options: opts4(
      'Post-incident activity (lessons learned)',
      'Detection and analysis',
      'Containment',
      'Preparation'
    ),
    correct: ['a'],
    explanation: 'A blameless post-mortem capturing root cause and feeding control/playbook improvements is the Post-Incident Activity (lessons-learned) phase of NIST SP 800-61. The other phases occur before or during the incident.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst receives indicators (hashes, domains, IPs) from an ISAC and wants automated ingestion and matching against telemetry. Which capability supports this operationally?',
    options: opts4(
      'A threat intelligence platform feeding the SIEM/EDR with structured IOCs (e.g., STIX/TAXII)',
      'Manually emailing the IOC list to all staff',
      'Posting the IOCs on a public website',
      'Ignoring external intelligence to avoid false positives'
    ),
    correct: ['a'],
    explanation: 'A threat-intel platform ingesting structured IOCs (STIX/TAXII) and feeding the SIEM/EDR enables automated matching and detection. Emailing staff, public posting, and ignoring intel are not operationally effective.',
    references: [REF_MITRE_ATTACK, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A managed detection capability needs continuous endpoint visibility with the ability to record process, file, and network activity and remotely isolate a host. Which tooling category fits?',
    options: opts4(
      'Endpoint Detection and Response (EDR)',
      'Security information and event management',
      'Mobile device management enrollment',
      'Network access control with posture checks'
    ),
    correct: ['a'],
    explanation: 'EDR provides continuous endpoint telemetry (process/file/network), detection, and response actions such as host isolation. The other items do not provide endpoint detection-and-response capabilities.',
    references: [REF_MITRE_DEFEND, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A red-team engagement is scoped to emulate a specific named adversary\'s known techniques to test detection and response. Which testing approach is this?',
    options: opts4(
      'Adversary emulation / threat-informed red teaming',
      'A simple unauthenticated vulnerability scan',
      'A compliance checklist review',
      'A tabletop exercise only'
    ),
    correct: ['a'],
    explanation: 'Adversary emulation replicates a specific threat actor\'s ATT&CK techniques to validate detection and response. A vulnerability scan, checklist review, and tabletop have value but do not execute realistic adversary techniques end to end.',
    references: [REF_MITRE_ATTACK, REF_NIST_115]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'During eradication of a persistent compromise, responders discover an attacker-created scheduled task and rogue service account. What is the correct operational action?',
    options: opts4(
      'Remove the attacker artifacts, rotate affected credentials, and verify persistence is gone before recovery',
      'Leave the artifacts to monitor the attacker indefinitely in production',
      'Restore from a backup taken after the compromise without analysis',
      'Only document the findings and take no remediation'
    ),
    correct: ['a'],
    explanation: 'Eradication requires removing all attacker footholds, rotating compromised credentials, and verifying persistence is eliminated before recovery. Leaving artifacts in production, restoring a post-compromise backup, or doing nothing leaves the adversary in place.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC wants to codify and automate repeatable response steps (e.g., disable account, isolate host, open ticket) triggered by alerts. Which capability provides this?',
    options: opts4(
      'Security Orchestration, Automation, and Response (SOAR) playbooks',
      'A wiki page of manual instructions only',
      'A monthly newsletter',
      'A static firewall rule set'
    ),
    correct: ['a'],
    explanation: 'SOAR executes codified playbooks that automate and orchestrate response actions across tools, improving speed and consistency. A wiki, newsletter, or static firewall rules do not provide automated orchestrated response.',
    references: [REF_NIST_61, REF_MITRE_DEFEND]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Governance, Risk, and Compliance (13) ──
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A program tracks identified risks, owners, treatment plans, and status over time so leadership can see the portfolio of exposures. Which artifact is being maintained?',
    options: opts4(
      'Risk register',
      'Network diagram',
      'Data flow diagram',
      'Penetration test scope'
    ),
    correct: ['a'],
    explanation: 'A risk register catalogs each identified risk with its owner, treatment plan, and current status, giving leadership a portfolio view. Network and data-flow diagrams and pentest scopes serve other purposes.',
    references: [REF_NIST_RMF, REF_FAIR]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization computes a Single Loss Expectancy of $400,000 and expects the threat twice per year. A proposed control costs $200,000 annually and is estimated to reduce the ARO to 0.5. What is the annual benefit (ALE reduction) of the control?',
    options: opts4(
      '$600,000',
      '$800,000',
      '$400,000',
      '$200,000'
    ),
    correct: ['a'],
    explanation: 'ALE before = SLE × ARO = $400,000 × 2 = $800,000. ALE after = $400,000 × 0.5 = $200,000. ALE reduction = $800,000 − $200,000 = $600,000, which exceeds the $200,000 control cost, justifying the investment.',
    references: [REF_FAIR, REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'A privacy team is documenting a Data Protection Impact Assessment. Select ALL elements that belong in a DPIA.',
    options: opts4(
      'A description of the processing operations and purposes',
      'An assessment of necessity, proportionality, and risks to data subjects',
      'Measures to mitigate identified privacy risks',
      'A list of marketing campaign creative assets'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A DPIA describes the processing and purposes, assesses necessity/proportionality and risks to data subjects, and documents mitigations. Marketing creative assets are not a privacy-assessment element.',
    references: [REF_GDPR, REF_NIST_PRIVACY]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A healthcare provider in the U.S. must protect electronic protected health information with administrative, physical, and technical safeguards. Which regulation imposes these requirements?',
    options: opts4(
      'HIPAA Security Rule',
      'PCI DSS Requirement 3',
      'GDPR Article 32',
      'SOC 2 Trust Services'
    ),
    correct: ['a'],
    explanation: 'The HIPAA Security Rule mandates administrative, physical, and technical safeguards for electronic PHI. PCI DSS covers card data, GDPR covers EU personal data, and SOX covers financial reporting controls.',
    references: [REF_NIST_53, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A board asks for a single metric expressing the maximum loss the firm could face from cyber events at a 95% confidence level over one year. Which quantitative output answers this?',
    options: opts4(
      'Cyber Value-at-Risk (loss exceedance at a confidence level)',
      'Annualized loss expectancy derived from a single-loss estimate',
      'Mean time to detect across the reporting period',
      'Aggregate CVSS severity of open findings this quarter'
    ),
    correct: ['a'],
    explanation: 'Cyber Value-at-Risk expresses a loss magnitude not expected to be exceeded at a stated confidence over a horizon, derived from loss-distribution modeling (e.g., FAIR/Monte Carlo). CVSS, ticket counts, and patch percentages are not loss-at-confidence measures.',
    references: [REF_FAIR, REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A business impact analysis specifies the system may lose at most 15 minutes of data in a disaster. Which metric does the 15-minute value define?',
    options: opts4(
      'Recovery Point Objective (RPO)',
      'Recovery Time Objective (RTO)',
      'Mean Time Between Failures (MTBF)',
      'Annualized Rate of Occurrence (ARO)'
    ),
    correct: ['a'],
    explanation: 'RPO is the maximum acceptable amount of data loss measured in time; 15 minutes means backups/replication must be no older than that. RTO is restore time, MTBF is a reliability statistic, and ARO is event frequency.',
    references: [REF_NIST_CSF, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'An enterprise is establishing third-party risk management. Select ALL practices that strengthen supply-chain assurance.',
    options: opts4(
      'Right-to-audit and security clauses in contracts',
      'Reviewing independent attestations (SOC 2, ISO 27001 certificate)',
      'Continuous monitoring of critical vendors\' security posture',
      'Onboarding vendors with no security assessment to move faster'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Contractual right-to-audit/security clauses, independent attestations, and continuous monitoring all strengthen third-party assurance. Onboarding vendors with no assessment imports unmanaged risk.',
    references: [REF_ISO27001, REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A control is selected primarily to satisfy an external legal mandate even though its risk-reduction value is low. Which driver is motivating this control?',
    options: opts4(
      'Compliance/regulatory requirement',
      'Reduction of residual risk exposure',
      'Threat intelligence reporting',
      'Penetration test remediation'
    ),
    correct: ['a'],
    explanation: 'When a control is implemented chiefly to meet a legal or regulatory mandate, its driver is compliance, which can differ from pure risk-based prioritization. The other items are risk- or threat-driven.',
    references: [REF_OBJ, REF_NIST_53]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization wants an internationally recognized certifiable standard for an Information Security Management System with continual improvement. Which standard should it pursue?',
    options: opts4(
      'ISO/IEC 27001',
      'OWASP Top 10',
      'MITRE ATT&CK',
      'NIST SP 800-115'
    ),
    correct: ['a'],
    explanation: 'ISO/IEC 27001 is the certifiable ISMS standard built around a Plan-Do-Check-Act continual improvement cycle. The other references are an app-risk list, an adversary taxonomy, and a testing guide.',
    references: [REF_ISO27001, REF_NIST_CSF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A vendor contract states the provider will notify the customer of a confirmed data breach within 24 hours. Which contract element does this commitment belong to?',
    options: opts4(
      'Incident notification / breach reporting clause',
      'Service level agreement uptime commitment',
      'Right-to-audit clause covering the provider',
      'Data processing addendum naming the sub-processors'
    ),
    correct: ['a'],
    explanation: 'A defined breach-notification timeframe is part of the incident-notification/breach-reporting contractual clause, often aligned with regulatory deadlines. The other items are unrelated agreement components.',
    references: [REF_GDPR, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An auditor recommends rotating staff through critical duties and requiring uninterrupted time away from the role. Which control objective do mandatory vacation and job rotation primarily support?',
    options: opts4(
      'Detecting and deterring fraud or concealed malicious activity',
      'Distributing workload evenly across the operations team',
      'Reducing overtime cost during peak reporting periods',
      'Meeting the minimum leave entitlement required by employment law'
    ),
    correct: ['a'],
    explanation: 'Mandatory vacation and job rotation help surface fraud or malicious activity that depends on one person continuously controlling a process, complementing separation of duties. They are administrative fraud-detection/deterrence controls.',
    references: [REF_NIST_53, REF_CIS]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A policy states the overarching management intent ("we will protect customer data"), while another document gives mandatory step-by-step instructions to configure TLS. What is the second document?',
    options: opts4(
      'A procedure',
      'A policy',
      'A guideline',
      'A risk appetite statement'
    ),
    correct: ['a'],
    explanation: 'A procedure provides mandatory step-by-step instructions to implement a policy. A policy states intent, a guideline is advisory, and a risk appetite statement defines tolerable risk.',
    references: [REF_OBJ, REF_ISO27001]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk owner accepts a residual risk that is below appetite and formally signs off, scheduling a review in 12 months. Which risk response and governance step is demonstrated?',
    options: opts4(
      'Risk acceptance with documented sign-off and review date',
      'Risk transfer to an insurer under a cyber policy',
      'Risk avoidance by discontinuing the underlying activity entirely',
      'Risk mitigation by adding compensating controls'
    ),
    correct: ['a'],
    explanation: 'Formally accepting a below-appetite residual risk with documented owner sign-off and a scheduled review is the risk-acceptance response with proper governance. Transfer, avoidance, and mitigation are different responses.',
    references: [REF_NIST_RMF, REF_FAIR]
  },

  // ── Security Architecture (18) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An architect needs remote users to reach private applications without placing the apps on the internet or giving full network access. Which model best fits?',
    options: opts4(
      'Zero Trust Network Access with identity- and context-aware brokering',
      'A site-to-site VPN granting routed access to the internal LAN',
      'A reverse proxy published to the internet in front of each application',
      'A jump host in the DMZ that users RDP into before reaching apps'
    ),
    correct: ['a'],
    explanation: 'ZTNA brokers access to specific applications based on verified identity and device/context without exposing the app publicly or granting broad network access — unlike a full-LAN VPN or direct port-forwarding.',
    references: [REF_NIST_207, REF_CISA_ZT]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A SaaS architecture must keep tenant data logically isolated in a shared database while preventing one tenant from querying another\'s rows. Which design control is most directly responsible?',
    options: opts4(
      'Row-level security keyed to tenant ID and enforced in the database',
      'A tenant identifier column that each application query is expected to filter',
      'Separate database schemas created per tenant on request',
      'Client-side filtering of the result set before rendering'
    ),
    correct: ['a'],
    explanation: 'Server-enforced per-tenant authorization such as database row-level security keyed to the tenant context structurally prevents cross-tenant access. Client-side or UI-only filtering can be bypassed and is not an isolation control.',
    references: [REF_CLOUD_SEC, REF_OWASP_ASVS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'An architect is choosing edge-protection components for a public web application. Select ALL that are appropriate defensive layers.',
    options: opts4(
      'A web application firewall inspecting Layer 7 for injection/abuse',
      'A CDN with DDoS absorption and rate limiting',
      'TLS termination with modern cipher policy and HSTS',
      'Returning stack traces and SQL errors to clients for debugging'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A WAF, CDN-based DDoS/rate limiting, and hardened TLS/HSTS are layered edge defenses. Returning stack traces and SQL errors leaks sensitive internals and aids attackers — it is not a defensive layer.',
    references: [REF_OWASP_TOP10, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ensure that even a fully compromised application server cannot read another microservice\'s database because credentials are scoped and short-lived. Which pattern enforces this?',
    options: opts4(
      'Per-service identities with dynamic, scoped database credentials',
      'A shared application role with read and write on every schema',
      'Database credentials injected once at container build time',
      'Network policy restricting which pods may reach the database port'
    ),
    correct: ['a'],
    explanation: 'Per-service least-privilege identities issued dynamic, narrowly scoped, short-lived DB credentials contain a compromise to one service\'s data. A shared superuser, embedded DBA password, or unauthenticated intra-cluster access removes isolation.',
    references: [REF_NIST_207, REF_NIST_57]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architecture separates the corporate user network from the OT/ICS network with a tightly controlled intermediate zone hosting jump and patch servers. What is this intermediate zone commonly called?',
    options: opts4(
      'An industrial demilitarized zone (IDMZ)',
      'A unidirectional security gateway (data diode)',
      'A management VLAN for network devices',
      'A jump host on the corporate network'
    ),
    correct: ['a'],
    explanation: 'An IDMZ is a controlled buffer zone between IT and OT/ICS networks (Purdue model) that brokers data exchange and hosts jump/patch services so the two networks never connect directly. The other options are unrelated network constructs.',
    references: [REF_NIST_53, REF_OBJ]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must guarantee that disaster recovery can run independently of the primary region\'s control plane and identity provider. Which architectural principle is being applied?',
    options: opts4(
      'Eliminating shared dependencies across regions',
      'Replicating the primary identity provider synchronously to DR',
      'Co-locating DR capacity in a second zone of the same region',
      'Failing over to DR only after the primary control plane recovers'
    ),
    correct: ['a'],
    explanation: 'Resilient DR architecture removes shared dependencies so a primary-region failure (including its control plane/IdP) does not also take down recovery. Co-location, single-IdP reliance, and disabled DR auth reintroduce single points of failure or weaken security.',
    references: [REF_AWS_WAF, REF_NIST_160]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'An architect designs secure inter-service communication in a service mesh. Select ALL controls that are appropriate.',
    options: opts4(
      'Mutual TLS between services with automatic certificate rotation',
      'Authorization policies restricting which service may call which',
      'Telemetry/observability for east-west traffic',
      'Disabling all encryption inside the mesh for latency'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'mTLS with rotation, service-to-service authorization policies, and east-west telemetry are core service-mesh security controls. Disabling encryption inside the mesh exposes intra-cluster traffic to sniffing and tampering.',
    references: [REF_NIST_207, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A multinational must keep certain citizens\' data within national borders while still operating a global platform. Which architectural approach addresses this requirement?',
    options: opts4(
      'Region-pinned storage and processing enforced by policy',
      'Replicating every dataset to all regions for read performance',
      'Encrypting data in transit so location no longer matters',
      'Storing all records centrally with per-country access controls'
    ),
    correct: ['a'],
    explanation: 'Data-residency/sovereignty requirements are met by pinning storage and processing to approved regions and enforcing policy controls on data movement. Global replication, public buckets, or relying only on transit encryption do not satisfy residency law.',
    references: [REF_GDPR, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architecture introduces a hardened, monitored host that administrators must connect through to reach production management interfaces. What is this component?',
    options: opts4(
      'A bastion or jump host for privileged administrative access',
      'A reverse proxy terminating TLS for the management console',
      'A network load balancer in front of the management VIPs',
      'A syslog collector receiving all management-plane audit events'
    ),
    correct: ['a'],
    explanation: 'A bastion/jump host is a hardened, heavily monitored chokepoint through which admin access to sensitive systems is funneled, reducing exposure of management interfaces. A cache, load balancer, and syslog server perform different roles.',
    references: [REF_NIST_53, REF_CIS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ensure code deployed to production exactly matches what was reviewed and built, with no manual edits to running servers. Which architectural model best enforces this?',
    options: opts4(
      'Immutable infrastructure with artifact promotion and no in-place changes',
      'SSH into production to hotfix files directly',
      'Manual configuration drift reconciled quarterly',
      'Building artifacts on the production host at deploy time from unpinned sources'
    ),
    correct: ['a'],
    explanation: 'Immutable infrastructure deploys versioned, pre-built artifacts and replaces (never edits) running instances, guaranteeing prod matches what was reviewed/built. SSH hotfixes and unpinned in-place builds cause drift and supply-chain risk.',
    references: [REF_SLSA, REF_AWS_WAF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must allow third-party SaaS to access only a narrow set of objects in cloud storage, with no standing long-lived keys. Which design is best?',
    options: opts4(
      'Cross-account role assumption scoped to the specific objects',
      'A dedicated IAM user for the vendor with a rotated access key',
      'A presigned URL per object regenerated by a nightly batch job',
      'A bucket policy allowing the vendor account full read access'
    ),
    correct: ['a'],
    explanation: 'Scoped cross-account role assumption/federation grants the SaaS only the needed resources via short-lived tokens with no standing keys. A dedicated IAM user still holds a standing key, presigned URLs regenerated nightly leave a long window and scale badly, and a bucket policy granting the vendor account read access exposes far more than the narrow object set.',
    references: [REF_CLOUD_SEC, REF_NIST_207]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A design adds multiple independent, overlapping controls (network, host, application, data) so failure of one does not cause total compromise. Which principle is this?',
    options: opts4(
      'Defense in depth',
      'Single point of trust',
      'Security through obscurity',
      'Implicit trust zoning'
    ),
    correct: ['a'],
    explanation: 'Layering independent, overlapping controls so no single failure leads to full compromise is defense in depth. The other options describe weak or anti-pattern approaches.',
    references: [REF_NIST_53, REF_CIS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'An architect is choosing controls for a public S3-style object store holding sensitive data. Select ALL controls that should be in the design.',
    options: opts4(
      'Block public access and enforce bucket policies / IAM least privilege',
      'Server-side encryption with managed keys and enforced TLS for access',
      'Access logging and anomaly alerting on object operations',
      'A wildcard policy allowing any principal to read the bucket'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Blocking public access with least-privilege policies, encryption + enforced TLS, and access logging/alerting protect object storage. A wildcard "any principal can read" policy is a classic data-exposure misconfiguration.',
    references: [REF_CLOUD_SEC, REF_AWS_WAF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must let a workload prove its identity to a cloud KMS to decrypt data without any embedded secret. Which mechanism enables this?',
    options: opts4(
      'Workload identity bound to an IAM role authorized on the KMS key',
      'An encrypted key file mounted into the container filesystem at runtime',
      'A key encryption key stored in the application configuration',
      'A long-lived service account key distributed with the image'
    ),
    correct: ['a'],
    explanation: 'Binding the workload\'s platform identity to an IAM role authorized in the KMS key policy lets it decrypt with no embedded secret. Hard-coded keys, manual passwords, and unauthenticated KMS endpoints are insecure or impractical.',
    references: [REF_NIST_57, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architecture must ensure that compromise of a single CA does not invalidate trust for unrelated systems. Which PKI design choice supports this containment?',
    options: opts4(
      'A tiered PKI with an offline root and scoped issuing/intermediate CAs',
      'A single online root CA that issues all end-entity certificates directly',
      'Cross-certification between every CA in the organization',
      'One issuing CA per environment sharing the same private key'
    ),
    correct: ['a'],
    explanation: 'A tiered PKI keeps the root offline and uses scoped intermediate CAs, so compromise of one issuing CA can be revoked without destroying overall trust. A single online root, shared keys, and no revocation remove containment.',
    references: [REF_NIST_57, REF_NIST_FIPS140]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must allow security to detect data exfiltration even over encrypted channels from managed endpoints, without breaking unrelated personal traffic. Which approach is most proportionate?',
    options: opts4(
      'DLP with selective TLS inspection scoped to corporate destinations',
      'Full TLS interception of every session including personal banking traffic',
      'Blocking all outbound HTTPS except to an allow-listed set of hosts',
      'Endpoint agents reporting only file hashes of documents opened'
    ),
    correct: ['a'],
    explanation: 'Scoped DLP with selective TLS inspection on managed endpoints, limited to corporate data/destinations, balances exfiltration detection with proportionality. Capturing personal banking traffic is excessive, blocking all HTTPS is unworkable, and no monitoring leaves exfiltration undetected.',
    references: [REF_NIST_53, REF_TLS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must minimize the chance that a single misconfigured identity grants broad access across the cloud estate. Which design practice most directly limits this?',
    options: opts4(
      'Least-privilege roles with permission boundaries and access reviews',
      'A single break-glass administrator account shared by the platform team',
      'Broad managed policies attached directly to each engineer identity',
      'Service control policies applied only at the root of the organization'
    ),
    correct: ['a'],
    explanation: 'Least-privilege roles with permission boundaries plus periodic access recertification cap the blast radius of a misconfigured identity. Default-admin grants, shared users, and disabled MFA all amplify identity risk.',
    references: [REF_NIST_207, REF_CIS]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A security architect applies STRIDE to a new design and is analyzing the threat of an attacker denying they performed an action. Which STRIDE category is this, and which control mitigates it?',
    options: opts4(
      'Repudiation — mitigated by strong authentication and audit logging',
      'Spoofing — mitigated by tamper-evident logging of every action',
      'Tampering — mitigated by multi-factor authentication at login',
      'Information disclosure — mitigated by non-repudiation signatures on requests'
    ),
    correct: ['a'],
    explanation: 'In STRIDE, an actor denying an action is Repudiation, mitigated by strong authentication and non-repudiable, tamper-evident logging/signing. The other pairings mismatch the category and its proper control.',
    references: [REF_STRIDE, REF_NIST_160]
  },

  // ── Security Engineering (20) ──
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An engineer must protect an entire laptop disk so that a stolen, powered-off device discloses no data. Which control is appropriate?',
    options: opts4(
      'Full-disk encryption with a TPM-bound key and pre-boot authentication',
      'A BIOS supervisor password preventing changes to boot order',
      'File-level encryption applied to the documents folder only',
      'Remote wipe triggered the next time the device contacts the MDM server'
    ),
    correct: ['a'],
    explanation: 'Full-disk encryption with a TPM-protected key and pre-boot authentication renders a stolen, powered-off device unreadable. A BIOS password, hidden folders, and renamed files do not encrypt data and are trivially bypassed.',
    references: [REF_NIST_57, REF_CIS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must derive a strong symmetric key from a user-supplied passphrase for client-side encryption. Which function is appropriate?',
    options: opts4(
      'A password-based KDF such as Argon2 with a high cost and unique salt',
      'A single pass of SHA-256 over the passphrase combined with a fixed salt',
      'HKDF expansion of the passphrase with a random info parameter',
      'Using the passphrase directly as an AES key after padding'
    ),
    correct: ['a'],
    explanation: 'A purpose-built password-based KDF (PBKDF2, Argon2, scrypt) with a high cost factor and unique salt resists brute force when deriving keys from passphrases. A single SHA-256 pass is far too fast to resist offline guessing, HKDF expands existing key material rather than hardening a low-entropy passphrase, and using the passphrase directly inherits all of its weakness.',
    references: [REF_NIST_63B, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'An engineer is integrating security testing into the CI/CD pipeline. Select ALL controls that shift security left effectively.',
    options: opts4(
      'Static application security testing (SAST) on each pull request',
      'Software composition analysis for vulnerable/licensed dependencies',
      'Secrets scanning to block credentials from being committed',
      'Only doing a single manual review the night before release'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'SAST per PR, software composition analysis, and pre-commit secrets scanning embed security early and continuously. A single last-minute manual review is late, inconsistent, and does not scale — the opposite of shifting left.',
    references: [REF_NIST_SSDF, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must let services retrieve database passwords that change automatically and are never stored in code or images. Which capability provides this?',
    options: opts4(
      'A secrets manager issuing dynamic, rotated database credentials',
      'An encrypted environment file injected by the deployment pipeline',
      'A configuration service returning a static password over TLS',
      'Credentials stored in the container orchestrator as a sealed secret'
    ),
    correct: ['a'],
    explanation: 'A secrets manager that brokers dynamic, auto-rotated database credentials keeps secrets out of code/images and limits exposure windows. An encrypted environment file still ships a static credential, a configuration service returning a fixed password over TLS protects transit but never rotates, and a sealed orchestrator secret is durable rather than dynamic.',
    references: [REF_NIST_57, REF_CLOUD_SEC]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer needs to verify that a software release artifact was built from the expected source by the expected pipeline. Which mechanism provides verifiable build provenance?',
    options: opts4(
      'Signed in-toto/SLSA provenance attestation verified before deployment',
      'A SHA-256 digest of the artifact recorded in the published release notes',
      'A signed tag on the source commit the build was cut from',
      'Reproducible build output compared against a local rebuild'
    ),
    correct: ['a'],
    explanation: 'Signed SLSA/in-toto provenance attestations cryptographically bind an artifact to its source and build process and can be verified before deploy. A published digest proves the bytes are unchanged but not which pipeline produced them, a signed source tag attests to the commit rather than the build, and a reproducible rebuild shows determinism without binding the artifact to an authorized builder.',
    references: [REF_SLSA, REF_NIST_SSDF]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must prevent reflected cross-site scripting in a web application. Which control most directly mitigates it?',
    options: opts4(
      'Context-aware output encoding plus a strict Content Security Policy',
      'Server-side input validation rejecting all HTML metacharacters',
      'HttpOnly and Secure flags set on the session cookie',
      'A web application firewall rule blocking script tags in query strings'
    ),
    correct: ['a'],
    explanation: 'Context-aware output encoding neutralizes injected markup/script, and a strict CSP reduces the impact of any residual injection — the primary XSS defenses. Disk encryption, CPU, and cache settings do not address XSS.',
    references: [REF_OWASP_TOP10, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must enable TLS mutual authentication so both client and server present certificates. Which configuration achieves this?',
    options: opts4(
      'mTLS with the server validating client certificates against a trusted CA',
      'Server-only TLS with the client authenticating by a bearer token instead',
      'TLS with certificate pinning configured on the client only',
      'TLS with client certificate requests optional and unverified'
    ),
    correct: ['a'],
    explanation: 'Mutual TLS requires the server to request and validate a client certificate chained to a trusted CA, authenticating both parties. Server-only TLS, plain TCP, and disabled validation do not provide mutual authentication.',
    references: [REF_TLS, REF_NIST_207]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'An engineer hardens a container image and its runtime. Select ALL practices that reduce risk.',
    options: opts4(
      'Use a minimal/distroless base and run as a non-root user',
      'Scan images for known vulnerabilities in the pipeline and at registry',
      'Drop Linux capabilities and set a read-only root filesystem where possible',
      'Run every container as --privileged for compatibility'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Minimal/distroless non-root images, pipeline+registry vulnerability scanning, and dropping capabilities with a read-only root FS materially reduce container risk. Running --privileged grants near-host access and is a major escalation risk.',
    references: [REF_CIS, REF_NIST_SSDF]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure session tokens cannot be reused if stolen from logs or intercepted. Which design choice best mitigates token theft impact?',
    options: opts4(
      'Short-lived bound tokens with refresh and server-side revocation',
      'Long-lived bearer tokens stored in browser local storage without expiry',
      'Tokens passed as query parameters so they appear in access logs',
      'One static API token shared across every user of the service'
    ),
    correct: ['a'],
    explanation: 'Short-lived, sender-constrained (DPoP/mTLS-bound) tokens with refresh and server-side revocation sharply limit the value of a stolen token. Long-lived bearer tokens, tokens-in-URLs, and shared static tokens maximize theft impact.',
    references: [REF_NIST_63B, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer needs strong phishing-resistant multifactor authentication for administrators. Which authenticator type best meets that goal?',
    options: opts4(
      'A FIDO2/WebAuthn hardware security key bound to the origin',
      'A time-based one-time password app on the administrator phone',
      'Push notification approval sent to a registered mobile device',
      'SMS one-time codes delivered to a verified phone number'
    ),
    correct: ['a'],
    explanation: 'FIDO2/WebAuthn hardware keys use origin-bound public-key cryptography and are phishing-resistant. SMS OTP is susceptible to SIM-swap/phishing relay, security questions are weak, and emailed static PINs are not strong MFA.',
    references: [REF_NIST_63B, REF_CIS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must protect data being processed by a third-party analytics function so the provider never sees plaintext. Which advanced technique enables computation on encrypted data?',
    options: opts4(
      'Homomorphic encryption or secure multiparty computation',
      'Tokenizing the fields before sending them to the provider',
      'A confidential computing enclave run by the provider',
      'TLS to the provider with data encrypted at rest afterwards'
    ),
    correct: ['a'],
    explanation: 'Homomorphic encryption and secure multiparty computation allow computation over encrypted data so the processor never accesses plaintext. Encoding, transit-only TLS, and provider-side disk encryption all expose plaintext during processing.',
    references: [REF_NIST_160, REF_NIST_PRIVACY]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must prevent path traversal and SSRF when a service fetches user-supplied URLs/filenames. Which control set is appropriate?',
    options: opts4(
      'Allow-list validation, canonicalization, and internal-address blocking',
      'A deny-list rejecting the literal traversal string and common variants',
      'URL parsing followed by a single DNS lookup before the request is made',
      'Rate limiting the endpoint that accepts the user-supplied URL'
    ),
    correct: ['a'],
    explanation: 'Allow-list validation, canonicalizing inputs, and explicitly blocking internal/link-local/metadata endpoints mitigate path traversal and SSRF. A single substring blacklist is bypassable, and trusting the client is not a control.',
    references: [REF_OWASP_TOP10, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must securely destroy data on decommissioned SSDs so it cannot be recovered. Which method is most reliable for self-encrypting drives?',
    options: opts4(
      'Cryptographic erase that destroys the drive encryption key',
      'A single-pass overwrite of every logical block address',
      'ATA secure erase issued without verifying completion',
      'Deleting the partition table and reformatting the drive'
    ),
    correct: ['a'],
    explanation: 'For self-encrypting drives, cryptographic erase (purging the media encryption key) renders all data unrecoverable instantly; physical destruction is the alternative. Overwrites are unreliable on SSD wear-leveling, and deleting partitions/recycling does not sanitize data.',
    references: [REF_NIST_57, REF_NIST_53]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'An engineer is implementing secure logging for an authentication service. Select ALL practices that are correct.',
    options: opts4(
      'Log authentication outcomes and security events with sufficient context',
      'Mask or omit secrets, full card numbers, and passwords from logs',
      'Protect log integrity and restrict access to logs',
      'Log full plaintext passwords to aid debugging'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Logging security-relevant events with context, masking secrets/PII, and protecting log integrity/access are correct. Logging plaintext passwords creates a high-value credential store and is explicitly prohibited by secure-coding guidance.',
    references: [REF_OWASP_ASVS, REF_NIST_53]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure firmware on IoT devices only boots if it is signed by the manufacturer. Which mechanism enforces this at power-on?',
    options: opts4(
      'Verified boot with a hardware root of trust checking the signature',
      'Firmware stored on read-only media that cannot be rewritten',
      'A checksum verified by the bootloader before handing off control',
      'Signature verification performed by the update service after boot completes'
    ),
    correct: ['a'],
    explanation: 'Secure/verified boot anchored in a hardware root of trust cryptographically validates each stage\'s signature before execution, preventing unauthorized firmware from booting. Splash warnings, labels, and firewall rules do not enforce boot-time integrity.',
    references: [REF_NIST_160, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must prevent insecure deserialization from leading to remote code execution. Which approach is the most robust?',
    options: opts4(
      'Avoid native object deserialization of untrusted data; use safe formats with strict schema validation',
      'Deserialize untrusted input but log it afterward',
      'Run the deserializer as root for reliability',
      'Compress the payload before deserializing'
    ),
    correct: ['a'],
    explanation: 'The strongest defense is not deserializing untrusted native objects at all — use data-only formats (e.g., JSON) with strict schema validation and type allow-lists. Post-hoc logging, root execution, and compression do not prevent the vulnerability.',
    references: [REF_OWASP_TOP10, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must ensure TLS certificates are renewed before expiry across hundreds of services without manual tracking. Which engineering practice solves this?',
    options: opts4(
      'Automated certificate lifecycle management (e.g., ACME) with monitoring and auto-renewal',
      'A spreadsheet of expiry dates updated quarterly',
      'Issuing 20-year self-signed certificates',
      'Disabling certificate expiry checks on clients'
    ),
    correct: ['a'],
    explanation: 'Automated certificate management (ACME-based issuance/renewal) with expiry monitoring prevents outages and weak certs at scale. Manual spreadsheets fail, ultra-long self-signed certs are insecure, and disabling expiry checks breaks trust.',
    references: [REF_TLS, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must prevent a successful authentication bypass when the app trusts a client-supplied "isAdmin" field. Which secure design principle was violated and how should it be fixed?',
    options: opts4(
      'Never trust client input for authorization — enforce roles server-side from a trusted session/identity',
      'Encrypt the isAdmin field client-side',
      'Rename the field to something less obvious',
      'Add the field to the URL instead of the body'
    ),
    correct: ['a'],
    explanation: 'Authorization decisions must be enforced server-side from a trusted identity/session, never from client-supplied flags. Encrypting, renaming, or relocating a client-controlled field still lets the client influence its own privileges.',
    references: [REF_OWASP_TOP10, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer needs assurance that data written to cloud object storage cannot be read by the cloud provider\'s staff. Which control provides this strongest guarantee?',
    options: opts4(
      'Client-side encryption with customer-managed keys before upload',
      'Provider-managed server-side encryption only',
      'Relying on the provider\'s employee policy',
      'Naming the bucket "private"'
    ),
    correct: ['a'],
    explanation: 'Client-side encryption with customer-managed keys means plaintext never reaches the provider, so provider staff cannot read it. Provider-managed encryption, policy reliance, and bucket naming do not prevent provider-side plaintext access.',
    references: [REF_NIST_57, REF_CLOUD_SEC]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure that an attacker who obtains a database dump cannot use stolen email/password hashes to authenticate elsewhere via offline cracking at scale. Beyond strong hashing, which additional engineering control adds defense in depth?',
    options: opts4(
      'A server-side secret pepper applied with the hash and stored separately from the database',
      'Encoding the hashes with Base64 before storage',
      'Lowering the hash cost factor so logins are faster',
      'Storing the salt in a separate column labeled "secret"'
    ),
    correct: ['a'],
    explanation: 'A server-side pepper (an HMAC key or secret added to the password hash) stored outside the database means a stolen dump alone is insufficient to mount offline cracking, adding defense in depth atop salted memory-hard hashing. Base64, lower cost, and a relabeled salt do not add secrecy.',
    references: [REF_NIST_63B, REF_OWASP_ASVS]
  },

  // ── Security Operations (14) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A SOC playbook says: once an incident is detected and scoped, immediately disconnect the affected host from the network to stop attacker activity. Which IR phase is being executed?',
    options: opts4(
      'Containment',
      'Identification/detection',
      'Lessons learned',
      'Preparation'
    ),
    correct: ['a'],
    explanation: 'Disconnecting an affected host to stop attacker activity after scoping is Containment in the NIST SP 800-61 lifecycle. Detection precedes it, while preparation and lessons learned occur before and after the incident.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst correlates a process spawning from a macro-enabled document, then making an outbound connection to a rare domain. Mapping this to tactics like Initial Access and Command and Control uses which model?',
    options: opts4(
      'MITRE ATT&CK tactics and techniques',
      'COBIT',
      'ITIL',
      'TOGAF'
    ),
    correct: ['a'],
    explanation: 'Mapping observed behavior to tactics (Initial Access, Command and Control) and techniques is MITRE ATT&CK, used for detection engineering and coverage analysis. COBIT, ITIL, and TOGAF are governance/service/architecture frameworks.',
    references: [REF_MITRE_ATTACK, REF_MITRE_DEFEND]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'A SOC is improving its detection engineering. Select ALL practices that increase detection quality.',
    options: opts4(
      'Write detections to ATT&CK techniques and track coverage gaps',
      'Validate detections with adversary emulation / purple teaming',
      'Version-control and peer-review detection rules',
      'Deploy untested rules straight to production with no review'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Technique-mapped detections with coverage tracking, validation via purple teaming, and version-controlled peer-reviewed rules all raise detection quality. Pushing untested rules to production causes noise and missed detections.',
    references: [REF_MITRE_ATTACK, REF_MITRE_DEFEND]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A responder must produce a forensically sound copy of a suspect disk that can be verified as unaltered. What is the correct technique?',
    options: opts4(
      'Create a bit-for-bit image using a write blocker and record cryptographic hashes of source and image',
      'Copy the visible files with the OS file explorer',
      'Run a disk defragmenter then copy',
      'Boot the suspect OS and browse for evidence'
    ),
    correct: ['a'],
    explanation: 'A forensically sound acquisition uses a write blocker, captures a bit-for-bit image, and records matching source/image hashes to prove integrity. File-explorer copies, defragmenting, or booting the suspect OS alter evidence.',
    references: [REF_NIST_61, REF_NIST_115]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC wants a single timeline of an incident reconstructed from authentication, EDR, proxy, and DNS logs. Which platform capability enables this cross-source reconstruction?',
    options: opts4(
      'Centralized log aggregation and correlation in a SIEM',
      'A single host\'s local event viewer',
      'Manual screenshots from each system',
      'A WHOIS query'
    ),
    correct: ['a'],
    explanation: 'A SIEM aggregates and time-normalizes logs from many sources so analysts can reconstruct a unified incident timeline. A single local event viewer, screenshots, or WHOIS cannot correlate across sources.',
    references: [REF_NIST_61, REF_CIS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'During recovery, the team must decide when a remediated system can return to production. Which criterion should gate the return-to-operations decision?',
    options: opts4(
      'Verified eradication of attacker presence and restored, monitored, hardened systems',
      'The number of days since the incident started, regardless of state',
      'Whether the news cycle has moved on',
      'A coin flip to avoid bias'
    ),
    correct: ['a'],
    explanation: 'Return to operations should be gated on verified eradication, validated clean restoration, added monitoring, and applied hardening — not elapsed time or external optics. The other options ignore the system\'s actual security state.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'A continuous-monitoring program is being designed. Select ALL telemetry sources that materially improve detection coverage.',
    options: opts4(
      'Endpoint (EDR) process/file/network events',
      'Identity provider authentication and authorization logs',
      'Network flow/DNS and proxy logs',
      'Only the corporate printer\'s page-count counter'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'EDR telemetry, identity provider logs, and network/DNS/proxy logs provide broad, high-value detection coverage across the kill chain. A printer page-count counter is not meaningful security telemetry.',
    references: [REF_MITRE_ATTACK, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst observes many failed logins followed by one success from a new country, then mailbox rule creation. Which attack pattern is most consistent with these indicators?',
    options: opts4(
      'Account takeover via credential stuffing/brute force with persistence (malicious inbox rule)',
      'A routine TLS certificate renewal',
      'Normal scheduled backup activity',
      'A DNS cache refresh'
    ),
    correct: ['a'],
    explanation: 'Many failed logins, an anomalous successful login from a new geo, then inbox-rule creation strongly indicates account takeover with email-rule persistence/exfiltration. The other options are benign and do not match the pattern.',
    references: [REF_MITRE_ATTACK, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC wants to rehearse decision-making for a ransomware scenario without touching production systems. Which exercise type fits?',
    options: opts4(
      'A tabletop exercise',
      'A destructive live-fire test in production',
      'A static policy review',
      'A vulnerability scan'
    ),
    correct: ['a'],
    explanation: 'A tabletop exercise walks stakeholders through a scenario to test decisions, roles, and communications without operational impact. Live-fire-in-prod is risky, and policy reviews/vuln scans do not rehearse incident decision-making.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst enriches an alert by checking whether the destination IP appears in current threat intelligence and which campaign it is associated with. Which operational capability is being used?',
    options: opts4(
      'Threat intelligence enrichment of alerts',
      'Capacity planning',
      'License management',
      'Change advisory board review'
    ),
    correct: ['a'],
    explanation: 'Correlating an alert\'s indicators against threat intelligence to add campaign/actor context is threat-intel enrichment, which improves triage and prioritization. The other items are unrelated IT operations functions.',
    references: [REF_MITRE_ATTACK, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC wants to measure how quickly it detects and responds to incidents to drive improvement. Which pair of metrics is most relevant?',
    options: opts4(
      'Mean Time to Detect (MTTD) and Mean Time to Respond/Contain (MTTR/MTTC)',
      'Lines of code and build duration',
      'Number of office Wi-Fi access points',
      'Marketing conversion rate'
    ),
    correct: ['a'],
    explanation: 'MTTD and MTTR/MTTC quantify detection and response speed and are core SOC performance metrics for continuous improvement. Code volume, AP counts, and marketing metrics do not measure SOC effectiveness.',
    references: [REF_NIST_61, REF_CIS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization needs continuous attack-surface awareness of internet-exposed assets it may not even know it owns. Which operational capability addresses this?',
    options: opts4(
      'External attack surface management (continuous discovery of exposed assets)',
      'A one-time internal asset spreadsheet',
      'Quarterly office walkthroughs',
      'A printer firmware update'
    ),
    correct: ['a'],
    explanation: 'External attack surface management continuously discovers and monitors internet-facing assets, including shadow IT, to reduce unknown exposure. A static spreadsheet, office walkthroughs, and printer updates do not provide continuous external discovery.',
    references: [REF_NIST_115, REF_CIS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A compromised endpoint must be analyzed without alerting the attacker or losing volatile evidence. What is the best immediate operational action?',
    options: opts4(
      'Isolate the host via EDR (network containment) while preserving memory and live state for analysis',
      'Immediately power off the machine to be safe',
      'Reimage the host before any analysis',
      'Leave it fully online and untouched indefinitely'
    ),
    correct: ['a'],
    explanation: 'EDR network isolation cuts attacker control while keeping the host running so volatile memory and live artifacts are preserved for analysis. Powering off or reimaging destroys volatile evidence; leaving it online unmanaged lets the attacker continue.',
    references: [REF_NIST_61, REF_MITRE_DEFEND]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'After an incident, the team updates detection rules, patches the exploited flaw, and revises the playbook. Which IR objective does feeding these changes back accomplish?',
    options: opts4(
      'Continuous improvement that reduces recurrence and improves future response',
      'Eliminating the need for any future monitoring',
      'Guaranteeing the same attack can never be attempted again',
      'Removing the requirement to keep evidence'
    ),
    correct: ['a'],
    explanation: 'Feeding lessons learned into detections, patches, and playbooks drives continuous improvement, lowering recurrence likelihood and speeding future response. It does not eliminate monitoring, guarantee attackers never try again, or remove evidence-retention duties.',
    references: [REF_NIST_61]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Governance, Risk, and Compliance (13) ──
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization adopts a control framework to align security investments with business objectives and to communicate maturity to the board. Which document type guides that strategic alignment?',
    options: opts4(
      'A governance programme aligned to a recognized control framework',
      'An annual penetration test report presented to the board committee',
      'A vulnerability scanning schedule agreed with IT operations',
      'A security awareness curriculum delivered to all staff'
    ),
    correct: ['a'],
    explanation: 'A security strategy/governance program mapped to a recognized framework aligns investments to business goals and communicates maturity to leadership. Device configs and zone files are operational artifacts, not strategic governance.',
    references: [REF_NIST_CSF, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk model produces a loss exceedance curve from a Monte Carlo simulation of frequency and magnitude distributions. Which quantitative risk methodology is being applied?',
    options: opts4(
      'FAIR (Factor Analysis of Information Risk)',
      'A qualitative risk heat map with high/medium/low bands',
      'CVSS environmental scoring of each finding',
      'An ISO 27005 qualitative risk register'
    ),
    correct: ['a'],
    explanation: 'FAIR decomposes risk into loss event frequency and loss magnitude and uses simulation to produce loss-exceedance curves for quantitative analysis. A heat map with high/medium/low bands is qualitative and cannot produce an exceedance curve, CVSS environmental scoring rates individual vulnerabilities rather than aggregate loss, and an ISO 27005 register records risks without simulating them.',
    references: [REF_FAIR, REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'An enterprise is defining a records-retention and data-governance policy. Select ALL practices that support legal and privacy compliance.',
    options: opts4(
      'Retain personal data only as long as necessary for the stated purpose',
      'Apply legal holds that suspend deletion of relevant records during litigation',
      'Classify data and define handling/retention by classification',
      'Keep all data forever to be safe, regardless of regulation'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Purpose-limited retention, litigation legal holds, and classification-driven handling/retention align with privacy and legal obligations. Indefinite retention of all data conflicts with data-minimization and privacy law.',
    references: [REF_GDPR, REF_NIST_PRIVACY]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A U.S. cloud service provider seeking to host federal agency workloads must obtain a standardized cloud security authorization. Which program applies?',
    options: opts4(
      'FedRAMP',
      'PCI DSS',
      'GDPR',
      'HIPAA'
    ),
    correct: ['a'],
    explanation: 'FedRAMP provides a standardized approach to security assessment and authorization for cloud services used by U.S. federal agencies. PCI DSS, GDPR, and HIPAA address payment, EU privacy, and U.S. health data respectively.',
    references: [REF_NIST_53, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A control reduces likelihood after the inherent risk is assessed. The remaining exposure after the control is applied is referred to as what?',
    options: opts4(
      'Residual risk',
      'Inherent risk',
      'Risk appetite',
      'Risk velocity'
    ),
    correct: ['a'],
    explanation: 'Residual risk is the exposure that remains after controls are applied. Inherent risk is pre-control exposure, risk appetite is acceptable risk, and risk velocity describes how quickly a risk materializes.',
    references: [REF_NIST_RMF, REF_FAIR]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization must demonstrate to customers that controls relevant to security, availability, and confidentiality are suitably designed and operating. Which report is most appropriate to share under NDA?',
    options: opts4(
      'A SOC 2 Type II report',
      'A raw vulnerability scan dump',
      'The internal incident bridge transcript',
      'Source code of all applications'
    ),
    correct: ['a'],
    explanation: 'A SOC 2 Type II report independently attests to the design and operating effectiveness of Trust Services Criteria controls and is the standard customer assurance artifact. Raw scans, transcripts, or source code are not appropriate assurance deliverables.',
    references: [REF_ISO27001, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'A governance review examines security policy structure. Select ALL statements that are accurate.',
    options: opts4(
      'Standards specify mandatory, measurable requirements supporting a policy',
      'Guidelines are recommended but not mandatory',
      'Procedures give step-by-step instructions to implement a policy',
      'A policy must contain exact CLI commands to be valid'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Standards are mandatory measurable requirements, guidelines are advisory, and procedures are step-by-step implementations. Policies express management intent and need not contain specific CLI commands.',
    references: [REF_OBJ, REF_ISO27001]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulator requires breach notification to affected individuals "without undue delay" and within a statutory window. Which compliance obligation must the incident-response plan integrate?',
    options: opts4(
      'Mandatory breach-notification timelines and reporting',
      'Contractual service credits for missed availability targets',
      'Records-retention schedules for personal data categories',
      'Data subject access request handling procedures'
    ),
    correct: ['a'],
    explanation: 'IR plans must incorporate statutory breach-notification timelines and regulator/individual reporting obligations (e.g., GDPR 72-hour notification). The other options are unrelated to breach reporting compliance.',
    references: [REF_GDPR, REF_NIST_61]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'An enterprise wants to express security control objectives as outcomes and benchmark maturity over time across business units. Which framework is best suited?',
    options: opts4(
      'NIST Cybersecurity Framework with implementation tiers/profiles',
      'CIS Controls with implementation groups one through three',
      'ISO/IEC 27001 certification audited against the Annex A control set',
      'NIST SP 800-53 baselines tailored to system impact level'
    ),
    correct: ['a'],
    explanation: 'The NIST CSF expresses outcomes and supports maturity benchmarking via tiers and target/current profiles across the organization. A product manual, cabling scheme, and HTTP spec are not maturity frameworks.',
    references: [REF_NIST_CSF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company outsources payroll processing. The contract must ensure the processor implements appropriate security and processes data only on documented instructions. Which instrument captures these obligations under GDPR?',
    options: opts4(
      'A data processing agreement between controller and processor',
      'A master services agreement with a limitation of liability',
      'A statement of work defining the payroll processing deliverables',
      'A mutual non-disclosure agreement covering shared data'
    ),
    correct: ['a'],
    explanation: 'A GDPR data processing agreement binds the processor to act only on documented instructions and to implement appropriate security measures. A master services agreement governs the commercial relationship, a statement of work defines deliverables, and a mutual NDA restricts disclosure — none of them impose the processing obligations the regulation requires.',
    references: [REF_GDPR, REF_OBJ]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk committee must decide whether to fund a $300,000 control. The control reduces ALE from $1,000,000 to $250,000. What is the control\'s net annual value, and is it justified?',
    options: opts4(
      'Net value $450,000 — the $750,000 ALE reduction exceeds the cost',
      'Net value −$50,000 — the control costs more than it saves annually',
      'Net value $250,000 — the residual ALE is the benefit',
      'Net value $700,000 — the cost is excluded from the calculation'
    ),
    correct: ['a'],
    explanation: 'ALE reduction = $1,000,000 − $250,000 = $750,000. Net value = $750,000 − $300,000 control cost = $450,000, so the control is cost-justified. The other figures miscompute the benefit or cost.',
    references: [REF_FAIR, REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'A new system is categorized using FIPS 199 as moderate impact for confidentiality, integrity, and availability. What does this categorization primarily drive in the RMF?',
    options: opts4(
      'Selection of the appropriate control baseline and tailoring',
      'The frequency of continuous monitoring assessments performed',
      'The authorization boundary drawn around the system components',
      'The contingency plan testing method the system must use annually'
    ),
    correct: ['a'],
    explanation: 'FIPS 199 impact categorization drives selection of the NIST SP 800-53 control baseline (low/moderate/high) and subsequent tailoring in the RMF. Monitoring frequency, the authorization boundary, and contingency testing are all decided during the RMF steps that follow categorization rather than by the impact level itself.',
    references: [REF_NIST_RMF, REF_NIST_53]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership wants assurance that critical third parties can recover within agreed times after a disruption. Which contractual/governance control most directly provides this?',
    options: opts4(
      'Contractually required vendor BC/DR with defined RTO and RPO',
      'A right-to-audit clause exercised once every three years',
      'A service credit regime applied when uptime targets are missed',
      'A cyber insurance policy naming the vendor as an insured'
    ),
    correct: ['a'],
    explanation: 'Requiring and validating vendor business continuity/disaster recovery with defined, tested RTO/RPO and evidence gives assurance of resilience. An NDA, logo guideline, or discount clause do not address recovery capability.',
    references: [REF_NIST_CSF, REF_ISO27001]
  },

  // ── Security Architecture (18) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An architect must ensure that a stolen valid session on the corporate VPN does not automatically grant access to every internal application. Which architectural shift addresses this?',
    options: opts4(
      'Per-application authorization rather than network-level access',
      'A shorter VPN session timeout enforced for all users',
      'Certificate-based device authentication performed at VPN connect time',
      'Segmenting the VPN pool into per-department subnets'
    ),
    correct: ['a'],
    explanation: 'Zero Trust enforces per-application authorization based on identity/context, so a compromised network session does not yield blanket internal access. Wider subnets, removed auth, and implicit device trust worsen the problem.',
    references: [REF_NIST_207, REF_CISA_ZT]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A serverless architecture must limit what a compromised function can do to other resources. Which design control most directly enforces least privilege per function?',
    options: opts4(
      'A narrowly scoped execution role granting only what the function needs',
      'One shared execution role reused by every function in the entire account',
      'Network ACLs restricting which subnets the function may reach',
      'Environment variables holding the credentials the function uses'
    ),
    correct: ['a'],
    explanation: 'Assigning each function a narrowly scoped execution role contains the blast radius if that function is compromised. A shared admin role, ACL-only reliance, or embedded root keys grant excessive, dangerous access.',
    references: [REF_NIST_207, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'An architect designs identity for a workforce SSO platform. Select ALL controls that strengthen the identity architecture.',
    options: opts4(
      'Centralized IdP with SAML/OIDC federation to applications',
      'Risk-based conditional access using device posture and signals',
      'Phishing-resistant MFA for privileged roles',
      'A shared admin account with the password on a sticky note'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A centralized federated IdP, risk-based conditional access, and phishing-resistant MFA for privileged roles are strong identity-architecture controls. A shared admin account with an exposed password is a critical weakness.',
    references: [REF_NIST_63B, REF_NIST_207]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A data lake must let analysts query data while ensuring direct identifiers are never exposed but joins on a stable pseudonym remain possible. Which architectural technique fits?',
    options: opts4(
      'Tokenization with the mapping vault access-controlled and segregated',
      'Deterministic hashing of the identifiers with a fixed salt',
      'Column-level encryption with the key held by the analytics platform team',
      'Generalizing the identifiers into broad demographic buckets'
    ),
    correct: ['a'],
    explanation: 'Tokenization/pseudonymization replaces direct identifiers with stable tokens while the re-identification vault is segregated and tightly controlled, enabling joins without exposing PII. Raw PII, public publishing, and encoding do not protect identities.',
    references: [REF_NIST_PRIVACY, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architecture must keep management traffic for switches and hypervisors completely separate from user data traffic. Which design pattern accomplishes this?',
    options: opts4(
      'An out-of-band management network separated from data paths',
      'A dedicated management VLAN carried over the same uplinks',
      'Management access restricted to a jump host on the user network',
      'SSH access to devices permitted only from the operations subnet'
    ),
    correct: ['a'],
    explanation: 'An out-of-band management network isolates administrative access from user/data traffic, reducing exposure of sensitive control interfaces. Sharing guest VLANs, internet-exposed management, or routing SSH through prod LBs increase risk.',
    references: [REF_NIST_53, REF_CIS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ensure that if the primary cloud region is lost, the application can fail over with minimal data loss and meet a 1-hour RTO. Which architecture best meets this?',
    options: opts4(
      'Multi-region active/passive with automated failover',
      'Single-region deployment with hourly snapshots copied offsite',
      'Multi-zone deployment within the primary region only',
      'Backup restore from object storage performed manually'
    ),
    correct: ['a'],
    explanation: 'Multi-region active/passive with continuous async replication and automated, tested failover meets aggressive RTO/RPO targets. Single-region weekly backups, manual rebuilds, or assuming the cloud never fails cannot meet a 1-hour RTO.',
    references: [REF_AWS_WAF, REF_NIST_160]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'An architect designs secure CI/CD infrastructure. Select ALL controls that reduce pipeline compromise risk.',
    options: opts4(
      'Ephemeral, isolated build runners with no standing credentials',
      'Signed artifacts and provenance verified before deployment',
      'Separation of build and deploy duties with protected environments',
      'A single shared runner with admin to all clouds reused across teams'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Ephemeral isolated runners, signed/verified artifacts and provenance, and build/deploy separation with protected environments harden the pipeline. A shared admin-everything runner is a high-value single point of compromise.',
    references: [REF_SLSA, REF_NIST_SSDF]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must prevent a compromised internet-facing service from directly reaching the internal database tier. Which architecture control most directly enforces this restriction?',
    options: opts4(
      'Segmentation allowing only the app tier to reach the database tier',
      'Placing the database in the same subnet as the web servers',
      'Allowing all internal hosts unrestricted access to the database',
      'A web application firewall in front of the internet-facing service'
    ),
    correct: ['a'],
    explanation: 'Tiered segmentation that permits only the application tier to reach the database tier blocks a compromised front-end from directly attacking the DB. Public subnets/IPs and unrestricted internal access remove that containment.',
    references: [REF_NIST_53, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect introduces a component that brokers and records all privileged sessions to critical systems, enforcing checkout of credentials and session recording. What is this called?',
    options: opts4(
      'A Privileged Access Management (PAM) solution',
      'A network access control appliance with posture checks',
      'An identity governance and administration platform',
      'A single sign-on identity provider'
    ),
    correct: ['a'],
    explanation: 'A PAM solution brokers privileged access, vaults and rotates credentials, and records privileged sessions, reducing standing privilege and improving accountability. A CDN, DHCP server, and load balancer serve different functions.',
    references: [REF_NIST_53, REF_CIS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An architecture must allow a mobile app to talk only to its intended backend and reject a malicious proxy with a valid public CA certificate. Which technique addresses this?',
    options: opts4(
      'Certificate/public-key pinning to the expected backend',
      'Disabling TLS to simplify debugging',
      'Trusting all certificates from any public CA without checks',
      'Using HTTP instead of HTTPS on mobile'
    ),
    correct: ['a'],
    explanation: 'Certificate or public-key pinning constrains trust to the expected backend key/cert, defeating interception even with an otherwise valid CA-issued certificate. Disabling TLS, blanket trust, or HTTP eliminate protection.',
    references: [REF_TLS, REF_OWASP_ASVS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must minimize the chance that one developer\'s compromised laptop leads to production code execution. Which architectural control most directly limits this?',
    options: opts4(
      'Protected branches with mandatory review and signed commits',
      'Requiring two-factor authentication on every developer account',
      'Full-disk encryption enforced on all developer laptops',
      'Deploy keys distributed to each developer workstation'
    ),
    correct: ['a'],
    explanation: 'Protected branches requiring review and signed commits, with deploy credentials kept off developer endpoints, prevent a single compromised laptop from pushing code to production. Direct pushes, shared accounts, and laptop-stored deploy keys remove that safeguard.',
    references: [REF_SLSA, REF_NIST_SSDF]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architecture adds an inline component that decrypts, inspects, and re-encrypts traffic to enforce DLP and malware policy for outbound web access. What is this component?',
    options: opts4(
      'A secure web gateway (forward proxy with inspection)',
      'A reverse proxy publishing internal applications outward',
      'A NAT gateway performing address translation only',
      'A DNS filtering resolver blocking known-bad domains'
    ),
    correct: ['a'],
    explanation: 'A secure web gateway acts as an inspecting forward proxy enforcing DLP, URL filtering, and malware policy on outbound web traffic. A plain resolver, NAT gateway, or L2 switch perform no content inspection.',
    references: [REF_NIST_53, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'An architect is designing for a high-assurance air-gapped enclave. Select ALL controls appropriate to the design.',
    options: opts4(
      'Strict, audited data-transfer process (e.g., one-way diode or vetted media procedure)',
      'No uncontrolled network bridge between the enclave and corporate/internet',
      'Hardware and removable-media control with inventory and scanning',
      'A convenience VPN from the enclave to the internet for updates'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'An air-gapped enclave needs strictly audited data transfer (data diode/vetted media), no uncontrolled network bridges, and tight removable-media control. A VPN to the internet defeats the air gap entirely.',
    references: [REF_NIST_53, REF_NIST_160]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must ensure cryptographic keys for a regulated workload remain under the customer\'s control even though the workload runs in a public cloud. Which model best satisfies this?',
    options: opts4(
      'Customer-managed keys in a customer-controlled external key store',
      'Provider-managed keys with the audit log exported to the customer SIEM',
      'Customer-managed keys stored in the provider KMS with rotation',
      'Envelope encryption using a provider-generated data key'
    ),
    correct: ['a'],
    explanation: 'Customer-managed keys in a customer-controlled HSM/KMS (including external/hold-your-own-key models) keep key control with the customer while running in the provider\'s cloud. Provider-owned keys, emailed keys, or no encryption fail the control requirement.',
    references: [REF_NIST_57, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect must ensure that authorization decisions are externalized from application code so policies can be centrally managed and audited. Which pattern accomplishes this?',
    options: opts4(
      'An external authorization service evaluating policy as code',
      'Role checks implemented consistently in a shared library',
      'Authorization enforced at the API gateway by route prefix',
      'Claims embedded in the access token and trusted by each service'
    ),
    correct: ['a'],
    explanation: 'Externalizing authorization to a policy-as-code decision service centralizes, versions, and audits access policy consistently. Scattered hard-coded checks, trusting client cookies, and code comments do not provide centralized enforceable authorization.',
    references: [REF_NIST_207, REF_OWASP_ASVS]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design must reduce the blast radius of a leaked long-lived cloud access key used by an automation account. Which architectural change is most effective?',
    options: opts4(
      'Replace static keys with short-lived federated credentials',
      'Rotate the access key automatically every thirty days',
      'Store the access key in a secrets manager with audit logging',
      'Restrict the key with an IP allow-list for the automation host'
    ),
    correct: ['a'],
    explanation: 'Replacing static long-lived keys with short-lived federated credentials and tight scoping minimizes the value and lifetime of any leak. Longer permanent keys, emailing copies, and admin grants increase exposure.',
    references: [REF_NIST_207, REF_CLOUD_SEC]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A security architect applies STRIDE and is mitigating "Elevation of privilege" in a multi-tenant API. Which control most directly addresses that STRIDE category?',
    options: opts4(
      'Server-side authorization enforcing least privilege per tenant',
      'Rate limiting each tenant to a fixed quota of requests per minute',
      'Encrypting every API response body in transit',
      'Renaming administrative endpoints to non-obvious URL paths'
    ),
    correct: ['a'],
    explanation: 'Elevation of privilege is mitigated by strong server-side authorization enforcing least privilege per request/tenant (preventing IDOR/broken access control). Bandwidth, compression, and endpoint renaming do not address privilege escalation.',
    references: [REF_STRIDE, REF_OWASP_TOP10]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect must design logging so that a compromise of any single production system cannot let the attacker erase the evidence of their activity. Which architectural control most directly achieves this?',
    options: opts4(
      'Stream logs to an isolated append-only logging account',
      'Keep logs on each host with permissions restricted to root',
      'A central log store where production admins retain delete rights',
      'Aggressive rotation and purge of logs on the source hosts'
    ),
    correct: ['a'],
    explanation: 'Forwarding logs to an isolated, append-only logging account/SIEM that production systems cannot alter ensures attacker actions on a host cannot delete the centralized evidence. Local-only logs, broad delete rights, and aggressive purging let an attacker destroy their trail.',
    references: [REF_NIST_53, REF_NIST_61]
  },

  // ── Security Engineering (20) ──
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An engineer must protect data in transit between two services with confidentiality, integrity, and server authentication using a modern protocol. Which choice is correct?',
    options: opts4(
      'TLS 1.3 with a valid certificate and forward-secret cipher',
      'IPsec transport mode using pre-shared keys on both endpoints',
      'SSH port forwarding between the two service hosts',
      'Mutual TLS with certificate validation disabled'
    ),
    correct: ['a'],
    explanation: 'TLS 1.3 with a valid certificate and forward-secret suites provides confidentiality, integrity, and server authentication for data in transit. IPsec with pre-shared keys authenticates the endpoints but not a named server identity, SSH port forwarding secures a tunnel rather than the service itself, and mutual TLS with validation disabled defeats the authentication it appears to provide.',
    references: [REF_TLS, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must generate cryptographic keys and nonces that an attacker cannot predict. Which source must be used?',
    options: opts4(
      'A cryptographically secure pseudo-random number generator',
      'A linear congruential generator seeded with the process ID',
      'The system clock combined with the process identifier',
      'A hash of the previous key used as the next seed'
    ),
    correct: ['a'],
    explanation: 'Keys and nonces must come from a CSPRNG with sufficient entropy. Timestamps, simple LCGs, and counters are predictable and lead to key recovery or nonce-reuse vulnerabilities.',
    references: [REF_NIST_57, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'An engineer is implementing secure session management for a web app. Select ALL correct practices.',
    options: opts4(
      'Set cookies with Secure, HttpOnly, and an appropriate SameSite attribute',
      'Regenerate the session identifier upon privilege change/login',
      'Invalidate sessions server-side on logout and after inactivity timeout',
      'Place the session token in the URL and log full URLs'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Secure/HttpOnly/SameSite cookies, session-ID regeneration on login, and server-side invalidation on logout/timeout are correct. Tokens in URLs leak via logs, referrers, and history and must be avoided.',
    references: [REF_OWASP_ASVS, REF_OWASP_TOP10]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure an AES-GCM implementation never reuses a nonce with the same key. Why is this critical?',
    options: opts4(
      'It breaks confidentiality and allows authentication-key recovery',
      'It only reduces throughput on the encryption path, with no security effect',
      'GCM tolerates nonce reuse provided the key is long enough',
      'Nonce reuse affects only the first block of each message'
    ),
    correct: ['a'],
    explanation: 'In AES-GCM, reusing a nonce with the same key leaks XOR of plaintexts and enables forging by recovering the GHASH authentication key — a catastrophic failure. Nonce uniqueness per key is a strict requirement.',
    references: [REF_NIST_57, REF_NIST_FIPS140]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must establish a shared symmetric key over an untrusted network without ever transmitting the key. Which mechanism is appropriate?',
    options: opts4(
      'Authenticated (Elliptic-Curve) Diffie-Hellman key agreement',
      'RSA key transport using the server public key certificate chain',
      'A pre-shared key distributed out of band beforehand',
      'Key derivation from a password both parties already know'
    ),
    correct: ['a'],
    explanation: 'Authenticated (EC)DH lets both parties derive a shared secret without transmitting it, with authentication preventing man-in-the-middle. Emailing, posting, or hardcoding keys exposes them and removes confidentiality.',
    references: [REF_NIST_57, REF_TLS]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must mitigate cross-site request forgery on state-changing requests. Which control is most appropriate?',
    options: opts4(
      'Anti-CSRF tokens validated server-side on state changes',
      'SameSite=None cookies combined with the Secure attribute',
      'A Content Security Policy restricting script sources',
      'Requiring re-authentication before every read-only operation'
    ),
    correct: ['a'],
    explanation: 'Synchronizer anti-CSRF tokens (and/or SameSite cookies) validated server-side prevent forged cross-site state-changing requests. Response encryption, CAPTCHAs on read pages, and CSS hiding do not stop CSRF.',
    references: [REF_OWASP_TOP10, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must protect signing keys so that no single administrator can use them and a quorum is required. Which control achieves this?',
    options: opts4(
      'Split knowledge and dual control with M-of-N sharing in an HSM',
      'A single administrator holding the full key on a hardware token',
      'Key escrow with a third party holding a full copy',
      'Role-based access controlling who may invoke the signing API'
    ),
    correct: ['a'],
    explanation: 'Split knowledge/dual control with M-of-N quorum (often enforced by an HSM) ensures no single person can use critical keys. A single administrator holding the whole key on a token defeats split knowledge entirely, third-party escrow places a full copy outside the quorum, and role-based access controls who may invoke signing without dividing the key itself.',
    references: [REF_NIST_FIPS140, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'An engineer is implementing input handling for a public API. Select ALL secure practices.',
    options: opts4(
      'Validate input against a strict schema/allow-list server-side',
      'Enforce length, type, and range limits before processing',
      'Reject and safely log malformed input without echoing it unencoded',
      'Trust client-side validation as the only check'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Server-side schema/allow-list validation, length/type/range enforcement, and safe handling/logging of malformed input are correct. Client-side validation is bypassable and must never be the sole check.',
    references: [REF_OWASP_ASVS, REF_OWASP_TOP10]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure that even if the database is exfiltrated, attackers cannot feasibly recover user passwords offline. Which storage approach best resists offline cracking?',
    options: opts4(
      'A slow, salted, memory-hard hash with tuned parameters',
      'SHA-256 of the password with a unique per-user salt applied',
      'AES-GCM encryption of the password with a managed key',
      'A single SHA-512 pass with a 32-byte random salt'
    ),
    correct: ['a'],
    explanation: 'A salted, memory-hard Argon2id hash with tuned cost (and optionally a server-side pepper) makes offline brute force economically infeasible. Unsalted fast hashes, reversible encryption, and truncation drastically weaken protection.',
    references: [REF_NIST_63B, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must verify file integrity after transfer to detect any modification. Which is the appropriate primitive?',
    options: opts4(
      'A cryptographic hash compared against a trusted reference value',
      'A CRC32 checksum recomputed after the transfer completes',
      'File size and last-modified timestamp compared against the source',
      'The transfer protocol acknowledgement for each block sent'
    ),
    correct: ['a'],
    explanation: 'Comparing a SHA-256 hash to a trusted reference reliably detects any modification. File size and timestamps are trivially manipulated, and short CRCs are collision-prone and not collision-resistant against tampering.',
    references: [REF_NIST_57, REF_SLSA]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer is enabling mutual authentication for IoT fleet devices that cannot store long-lived secrets safely. Which approach is most robust?',
    options: opts4(
      'Per-device certificates with keys in a secure element',
      'A shared device password provisioned during manufacturing',
      'Device serial numbers validated against an allow-list',
      'A private APN with no device-level authentication'
    ),
    correct: ['a'],
    explanation: 'Per-device certificates with keys protected in a secure element/TPM and short validity provide strong, revocable mutual authentication for fleets. Shared firmware passwords, no auth, or printed static keys are easily extracted and abused.',
    references: [REF_NIST_57, REF_NIST_160]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must prevent a vulnerable third-party library from being silently pulled into the build. Which control is most effective?',
    options: opts4(
      'Pin exact versions with a lockfile and gate builds on SCA policy',
      'Track the latest minor version so security fixes arrive automatically',
      'Run dependency scanning nightly and file tickets for findings',
      'Mirror the upstream registry and allow any package it carries'
    ),
    correct: ['a'],
    explanation: 'Pinned versions with a lockfile plus a software-composition-analysis gate prevent unreviewed or vulnerable dependencies from entering the build. Floating "latest", disabled scanning, and untrusted mirrors increase supply-chain risk.',
    references: [REF_SLSA, REF_NIST_SSDF]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer needs to securely wipe a single file\'s sensitive contents on a system using a journaling filesystem and SSD. Which approach is most reliable?',
    options: opts4(
      'Encrypt the data at rest and destroy the key for that data set',
      'Overwrite the file in place with a single pass of zero bytes',
      'Issue a filesystem TRIM command for all of the affected blocks',
      'Delete the file and run a full defragmentation pass'
    ),
    correct: ['a'],
    explanation: 'On SSD/journaling filesystems, single-file overwrites are unreliable due to wear-leveling and copy-on-write; encrypting and destroying the key (crypto-shredding) reliably renders the data unrecoverable. Deleting/renaming does not sanitize data.',
    references: [REF_NIST_57, REF_NIST_53]
  },
  {
    domain: ENG, difficulty: 3, type: QType.MULTI,
    stem: 'An engineer hardens an API gateway. Select ALL controls that improve its security posture.',
    options: opts4(
      'Enforce authentication and authorization on every route',
      'Apply rate limiting and request/response schema validation',
      'Terminate TLS with modern ciphers and propagate identity securely to upstreams',
      'Expose an unauthenticated admin/debug endpoint for convenience'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Per-route authn/authz, rate limiting with schema validation, and modern TLS with secure identity propagation harden a gateway. An unauthenticated admin/debug endpoint is a critical exposure.',
    references: [REF_OWASP_ASVS, REF_CLOUD_SEC]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure that JWT access tokens accepted by an API cannot be forged or have their algorithm downgraded to "none". Which validation is required?',
    options: opts4(
      'Verify the signature with a pinned key and reject unexpected algorithms',
      'Accept whichever algorithm the token header specifies without restriction',
      'Validate the issuer and audience claims but not the signature',
      'Check token expiry and reject anything older than one hour'
    ),
    correct: ['a'],
    explanation: 'JWTs must be verified with an explicitly expected algorithm and pinned key, rejecting "alg: none" and algorithm substitution. Trusting payloads, honoring attacker-chosen algorithms, or skipping verification enables token forgery.',
    references: [REF_OWASP_ASVS, REF_NIST_63B]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must ensure secrets are not exposed in container orchestration. Which practice is correct?',
    options: opts4(
      'Inject secrets at runtime from a secrets manager',
      'Bake secrets into the image and push to a shared registry',
      'Pass secrets as plaintext command-line arguments visible in process lists',
      'Store secrets in a public ConfigMap'
    ),
    correct: ['a'],
    explanation: 'Runtime injection from a secrets manager with encryption at rest and least-privilege access keeps secrets out of images and process listings. Image-baked secrets, plaintext CLI args, and public ConfigMaps all leak secrets.',
    references: [REF_NIST_57, REF_CLOUD_SEC]
  },
  {
    domain: ENG, difficulty: 2, type: QType.SINGLE,
    stem: 'An engineer must add integrity and origin authentication to webhook callbacks so receivers can trust the sender. Which mechanism is appropriate?',
    options: opts4(
      'A signature (HMAC or asymmetric) over the payload with timestamp/nonce to prevent replay',
      'Sending the payload over plain HTTP with no signature',
      'A shared secret embedded in client-side JavaScript',
      'Trusting the source IP address alone'
    ),
    correct: ['a'],
    explanation: 'Signing webhook payloads (HMAC or asymmetric) with a timestamp/nonce lets receivers verify integrity, origin, and freshness. Unsigned HTTP, client-side secrets, and IP-only trust are forgeable.',
    references: [REF_NIST_57, REF_OWASP_ASVS]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must protect long-term archival data confidentiality against future quantum decryption while standards mature. Which interim engineering approach is most prudent?',
    options: opts4(
      'Use hybrid classical + post-quantum key establishment and design for crypto-agility',
      'Switch all encryption to ROT13 for simplicity',
      'Stop encrypting archives to save storage',
      'Reduce AES to 64-bit keys for speed'
    ),
    correct: ['a'],
    explanation: 'Hybrid classical + post-quantum key establishment plus crypto-agility hedges against quantum risk while standards finalize, preserving security if either component holds. ROT13, no encryption, and weakened keys destroy confidentiality.',
    references: [REF_NIST_PQC, REF_NIST_57]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must prevent server-side request forgery from reaching the cloud instance metadata service. Which control is most effective?',
    options: opts4(
      'Enforce IMDSv2 (session-token) and block metadata IP egress from app workloads plus URL allow-listing',
      'Rely on the application never being buggy',
      'Allow all outbound traffic from the app server',
      'Log SSRF attempts but take no preventive action'
    ),
    correct: ['a'],
    explanation: 'Requiring IMDSv2 session tokens, blocking the metadata IP from app egress, and allow-listing outbound URLs structurally mitigate SSRF-to-metadata credential theft. Hoping for bug-free code, open egress, or log-only responses do not prevent it.',
    references: [REF_OWASP_TOP10, REF_CLOUD_SEC]
  },
  {
    domain: ENG, difficulty: 3, type: QType.SINGLE,
    stem: 'An engineer must let an application encrypt and decrypt data using a key it never sees, so that compromising the app does not directly expose the key. Which engineering pattern achieves this?',
    options: opts4(
      'Envelope encryption with a KMS/HSM: the app calls the service to wrap/unwrap data keys, never handling the master key',
      'Hard-code the master key in the application configuration',
      'Derive the key from the hostname so it is easy to recompute',
      'Store the master key in a globally readable environment variable'
    ),
    correct: ['a'],
    explanation: 'Envelope encryption via a KMS/HSM keeps the master key inside the service; the app only requests wrap/unwrap of data keys, so an app compromise does not expose the master key. Hard-coded, host-derived, or world-readable keys defeat that protection.',
    references: [REF_NIST_57, REF_CLOUD_SEC]
  },

  // ── Security Operations (14) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A SOC must define, before any incident, the roles, communication tree, tooling, and authority needed to respond. Which IR phase covers establishing this readiness?',
    options: opts4(
      'Preparation',
      'Containment',
      'Eradication',
      'Recovery'
    ),
    correct: ['a'],
    explanation: 'Preparation is the NIST SP 800-61 phase where roles, communications, tooling, and authority are established before incidents occur. Containment, eradication, and recovery occur during/after an incident.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst wants to know which defensive techniques counter a given ATT&CK technique to plan mitigations. Which complementary knowledge base maps defenses to offensive techniques?',
    options: opts4(
      'MITRE D3FEND',
      'PCI DSS SAQ',
      'COBIT',
      'The OSI model'
    ),
    correct: ['a'],
    explanation: 'MITRE D3FEND catalogs defensive (countermeasure) techniques and relates them to offensive ATT&CK techniques, aiding mitigation planning. PCI SAQ, COBIT, and the OSI model are not defensive technique knowledge bases.',
    references: [REF_MITRE_DEFEND, REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'A SOC is preparing for digital forensics. Select ALL practices that preserve evidentiary value.',
    options: opts4(
      'Use write blockers and compute hashes before and after acquisition',
      'Document chain of custody for every transfer',
      'Acquire volatile data following the order of volatility',
      'Analyze evidence directly on the original media to save time'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Write blockers with before/after hashing, documented chain of custody, and volatility-ordered acquisition preserve admissibility. Analyzing the original media instead of a verified image risks altering and invalidating evidence.',
    references: [REF_NIST_61, REF_NIST_115]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst sees beaconing every 60 seconds with jittered intervals to a newly registered domain over HTTPS from a single host. Which ATT&CK tactic does this most strongly indicate?',
    options: opts4(
      'Command and Control',
      'Initial Access',
      'Impact',
      'Resource Development'
    ),
    correct: ['a'],
    explanation: 'Regular jittered beaconing to a rare/newly registered domain is characteristic of Command and Control channel activity. Initial Access is the entry vector, Impact is destructive effect, and Resource Development is attacker pre-staging.',
    references: [REF_MITRE_ATTACK, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC needs to ensure all systems agree on event timestamps so cross-source correlation is accurate. Which operational control is essential?',
    options: opts4(
      'Synchronized, authenticated time (e.g., NTP) across all logging sources',
      'Letting each host keep its own arbitrary clock',
      'Disabling timestamps to reduce log size',
      'Using only relative "minutes ago" labels'
    ),
    correct: ['a'],
    explanation: 'Accurate cross-source correlation and forensics require synchronized (and ideally authenticated) time across all logging systems. Arbitrary clocks, no timestamps, or relative labels make timeline reconstruction unreliable.',
    references: [REF_NIST_61, REF_CIS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A purple-team exercise runs known adversary techniques while the blue team validates detections and tunes gaps in real time. What is the primary operational benefit?',
    options: opts4(
      'Measurable improvement of detection and response coverage against real techniques',
      'Replacing the need for any logging',
      'Guaranteeing zero future incidents',
      'Eliminating the incident-response plan'
    ),
    correct: ['a'],
    explanation: 'Purple teaming collaboratively exercises real techniques to validate and improve detection/response coverage with measurable gap closure. It does not remove logging needs, guarantee no incidents, or replace the IR plan.',
    references: [REF_MITRE_ATTACK, REF_MITRE_DEFEND]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'A vulnerability-management process is being operationalized. Select ALL steps that belong in a mature cycle.',
    options: opts4(
      'Continuous asset discovery and authenticated scanning',
      'Risk-based prioritization considering exploit availability and exposure',
      'Remediation tracking with SLAs and verification re-scans',
      'Suppressing all findings that are inconvenient to fix'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Continuous discovery/authenticated scanning, risk-based prioritization, and tracked remediation with verification form a mature cycle. Blanket suppression of inconvenient findings leaves exploitable exposure unmanaged.',
    references: [REF_NIST_115, REF_CIS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'During an active intrusion, leadership asks whether to immediately block the attacker or first observe to scope the breach. Which factor should most influence the containment decision?',
    options: opts4(
      'Balancing evidence/scope needs against the risk of ongoing damage and data loss',
      'Whichever option requires the least paperwork',
      'The personal preference of the newest analyst',
      'Avoiding any action until the next maintenance window'
    ),
    correct: ['a'],
    explanation: 'Containment timing must balance the value of observing to fully scope the intrusion against the risk of continued damage/exfiltration, per IR doctrine. Paperwork, seniority preference, and arbitrary delay are not sound decision criteria.',
    references: [REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC wants automated, consistent execution of containment steps (disable account, isolate host, notify) the moment a high-confidence detection fires. Which capability delivers this?',
    options: opts4(
      'SOAR automation triggered by detections',
      'A monthly status meeting',
      'A static network diagram',
      'A printed runbook in a binder only'
    ),
    correct: ['a'],
    explanation: 'SOAR executes automated, consistent containment playbooks the instant a high-confidence detection fires, reducing dwell time. Meetings, diagrams, and binder-only runbooks do not provide automated execution.',
    references: [REF_NIST_61, REF_MITRE_DEFEND]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst must determine whether an alert is a true positive before escalating. Which operational step best supports an accurate triage decision?',
    options: opts4(
      'Enrich and corroborate with multiple data sources (EDR, identity, network) and asset/threat context',
      'Escalate every alert immediately without analysis',
      'Close every alert as false positive to reduce backlog',
      'Decide based solely on the alert name'
    ),
    correct: ['a'],
    explanation: 'Corroborating an alert across EDR, identity, and network telemetry with asset and threat context yields accurate true/false-positive triage. Blanket escalation, blanket closure, or judging by alert name alone degrade accuracy.',
    references: [REF_NIST_61, REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC measures dwell time to understand how long adversaries persist undetected. Which improvement most directly reduces dwell time?',
    options: opts4(
      'Better detection engineering and proactive threat hunting',
      'Longer password rotation intervals',
      'More office Wi-Fi access points',
      'Increasing the log retention price tier only'
    ),
    correct: ['a'],
    explanation: 'Improved detection coverage and proactive hunting find adversaries sooner, directly lowering dwell time. Password rotation length, Wi-Fi density, and storage pricing do not materially reduce time-to-detection.',
    references: [REF_MITRE_ATTACK, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A regulator requires the organization to demonstrate it can detect and respond to incidents. Which artifact best evidences operational readiness over time?',
    options: opts4(
      'Documented incident-response tests/exercises with after-action improvements',
      'A single marketing brochure',
      'An unrelated vendor invoice',
      'A blank incident form template only'
    ),
    correct: ['a'],
    explanation: 'Records of IR exercises (tabletop/functional) with documented after-action improvements evidence tested, maturing response capability. A brochure, invoice, or blank template do not demonstrate operational readiness.',
    references: [REF_NIST_61, REF_NIST_CSF]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst pivots from one indicator (a malicious file hash) to find all hosts that executed it and any associated network connections. Which capability enables this fast pivoting across the environment?',
    options: opts4(
      'Centralized telemetry/EDR with historical search and entity correlation',
      'Calling each user to ask if they ran the file',
      'Waiting for the next quarterly audit',
      'Checking a single host\'s local logs only'
    ),
    correct: ['a'],
    explanation: 'Centralized EDR/telemetry with historical search lets analysts pivot from an IOC to all affected hosts and related activity quickly. Phoning users, waiting for audits, or checking one host cannot scope an incident efficiently.',
    references: [REF_MITRE_DEFEND, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'After eradicating a foothold, monitoring detects the same attacker tooling reappear within hours. What does this most likely indicate, and what is the correct response?',
    options: opts4(
      'Incomplete eradication or an undiscovered persistence mechanism — re-scope, find all footholds, and remediate fully',
      'A harmless coincidence to ignore',
      'Proof the attacker has given up',
      'A reason to disable detection to stop the alerts'
    ),
    correct: ['a'],
    explanation: 'Rapid reappearance of attacker tooling indicates incomplete eradication or an unknown persistence mechanism; the correct action is to re-scope, identify all footholds, and remediate comprehensively. Ignoring it or disabling detection lets the adversary persist.',
    references: [REF_NIST_61]
  }
];

const SECURITYX_DOMAINS = [
  { name: GRC, weight: 20 },
  { name: ARCH, weight: 27 },
  { name: ENG, weight: 31 },
  { name: OPS, weight: 22 }
];

const SECURITYX_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'comptia-securityx-p1',
    code: 'CAS-005-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 165-minute, 65-question, blueprint-weighted set covering governance, risk & compliance, security architecture, security engineering, and security operations.',
    questions: P1
  },
  {
    slug: 'comptia-securityx-p2',
    code: 'CAS-005-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 165-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'comptia-securityx-p3',
    code: 'CAS-005-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 165-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const SECURITYX_BUNDLE = {
  slug: 'comptia-securityx',
  title: 'CompTIA SecurityX (CASP+, CAS-005)',
  description: 'All 3 CompTIA SecurityX (CAS-005) practice exams in one bundle — covering governance, risk & compliance, security architecture, security engineering, and security operations, aligned to the CompTIA SecurityX exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 52400 // USD 524 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CompTIA SecurityX bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:securityx-seed'` are deleted and
 * re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedSecurityX(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'comptia' } });
  await db.vendor.upsert({
    where: { slug: 'comptia' },
    update: { name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT and cybersecurity credentials including Security+, CySA+, PenTest+, and the SecurityX (CASP+) expert-level credential.' },
    create: { slug: 'comptia', name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT and cybersecurity credentials including Security+, CySA+, PenTest+, and the SecurityX (CASP+) expert-level credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'comptia' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SECURITYX_EXAMS) {
    const title = `CompTIA SecurityX (CASP+, CAS-005) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the CompTIA SecurityX (CAS-005) exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 165,
      passingScore: 75,
      questionCount: e.questions.length,
      domains: SECURITYX_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:securityx-seed' } });
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
          generatedBy: 'manual:securityx-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SECURITYX_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SECURITYX_BUNDLE.slug },
    update: {
      title: SECURITYX_BUNDLE.title,
      description: SECURITYX_BUNDLE.description,
      price: SECURITYX_BUNDLE.price,
      priceVoucher: SECURITYX_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SECURITYX_BUNDLE.slug,
      title: SECURITYX_BUNDLE.title,
      description: SECURITYX_BUNDLE.description,
      price: SECURITYX_BUNDLE.price,
      priceVoucher: SECURITYX_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'comptia-securityx-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'comptia-securityx-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'comptia-securityx-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'comptia-securityx-p1', tier: 'VOUCHER' as const, position: 4 }
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
