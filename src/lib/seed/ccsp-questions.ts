/**
 * ISC2 CCSP bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:ccsp-seed'` and upserts catalog rows.
 *
 * Exported as `seedCcsp(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/ccsp.ts`) and the protected
 * admin API (`/api/admin/seed-ccsp`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public ISC2 CCSP exam
 * outline, NIST cloud guidance, and CSA guidance. Domain blueprint
 * (CCSP, six domains, sums to 100):
 *   - Cloud Concepts, Architecture and Design        — 17% (11/65)
 *   - Cloud Data Security                            — 20% (13/65)
 *   - Cloud Platform and Infrastructure Security     — 17% (11/65)
 *   - Cloud Application Security                     — 17% (11/65)
 *   - Cloud Security Operations                      — 16% (11/65)
 *   - Legal, Risk and Compliance                     — 13% ( 8/65)
 *
 * These are independent study questions and are NOT real or official
 * exam items.
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

const CONCEPTS = 'Cloud Concepts, Architecture and Design';
const DATA = 'Cloud Data Security';
const INFRA = 'Cloud Platform and Infrastructure Security';
const APP = 'Cloud Application Security';
const OPS = 'Cloud Security Operations';
const LEGAL = 'Legal, Risk and Compliance';

const REF_CCSP_OUTLINE = { label: 'ISC2 — CCSP exam outline', url: 'https://www.isc2.org/certifications/ccsp/ccsp-certification-exam-outline' };
const REF_NIST_800145 = { label: 'NIST SP 800-145 — The NIST Definition of Cloud Computing', url: 'https://csrc.nist.gov/pubs/sp/800/145/final' };
const REF_NIST_500292 = { label: 'NIST SP 500-292 — Cloud Computing Reference Architecture', url: 'https://www.nist.gov/publications/nist-cloud-computing-reference-architecture' };
const REF_NIST_800146 = { label: 'NIST SP 800-146 — Cloud Computing Synopsis and Recommendations', url: 'https://csrc.nist.gov/pubs/sp/800/146/final' };
const REF_NIST_800209 = { label: 'NIST SP 800-209 — Security Guidelines for Storage Infrastructure', url: 'https://csrc.nist.gov/pubs/sp/800/209/final' };
const REF_NIST_800122 = { label: 'NIST SP 800-122 — Guide to Protecting the Confidentiality of PII', url: 'https://csrc.nist.gov/pubs/sp/800/122/final' };
const REF_NIST_800111 = { label: 'NIST SP 800-111 — Guide to Storage Encryption Technologies for End User Devices', url: 'https://csrc.nist.gov/pubs/sp/800/111/final' };
const REF_NIST_80057 = { label: 'NIST SP 800-57 — Recommendation for Key Management', url: 'https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final' };
const REF_NIST_80034 = { label: 'NIST SP 800-34 — Contingency Planning Guide for Federal Information Systems', url: 'https://csrc.nist.gov/pubs/sp/800/34/r1/final' };
const REF_NIST_80061 = { label: 'NIST SP 800-61 — Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' };
const REF_NIST_80086 = { label: 'NIST SP 800-86 — Guide to Integrating Forensic Techniques into Incident Response', url: 'https://csrc.nist.gov/pubs/sp/800/86/final' };
const REF_NIST_800218 = { label: 'NIST SP 800-218 — Secure Software Development Framework (SSDF)', url: 'https://csrc.nist.gov/pubs/sp/800/218/final' };
const REF_NIST_80092 = { label: 'NIST SP 800-92 — Guide to Computer Security Log Management', url: 'https://csrc.nist.gov/pubs/sp/800/92/final' };
const REF_NIST_800207 = { label: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final' };
const REF_CSA_GUIDANCE = { label: 'Cloud Security Alliance — Security Guidance v4', url: 'https://cloudsecurityalliance.org/research/guidance' };
const REF_CSA_CCM = { label: 'Cloud Security Alliance — Cloud Controls Matrix', url: 'https://cloudsecurityalliance.org/research/cloud-controls-matrix' };
const REF_CSA_STAR = { label: 'Cloud Security Alliance — STAR Registry', url: 'https://cloudsecurityalliance.org/star' };
const REF_CSA_EGRESS = { label: 'Cloud Security Alliance — Top Threats to Cloud Computing', url: 'https://cloudsecurityalliance.org/research/topics/top-threats' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Cloud Concepts, Architecture and Design (11) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Per NIST SP 800-145, which set lists the five essential characteristics of cloud computing?',
    options: opts4(
      'Multi-tenancy, virtualization, automation, elasticity, metering',
      'On-demand self-service, broad network access, resource pooling, rapid elasticity, measured service',
      'IaaS, PaaS, SaaS, FaaS, CaaS',
      'Public, private, hybrid, community, edge'
    ),
    correct: ['b'],
    explanation: 'NIST SP 800-145 defines exactly five essential characteristics: on-demand self-service, broad network access, resource pooling, rapid elasticity, and measured service. The other lists mix service models, deployment models, or non-defining traits.',
    references: [REF_NIST_800145]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'In an IaaS deployment, which security responsibility almost always remains with the cloud customer rather than the provider?',
    options: opts4(
      'Physical security of the data center',
      'Hypervisor patching',
      'Guest operating system hardening and patching',
      'Maintenance of the storage area network hardware'
    ),
    correct: ['c'],
    explanation: 'Under the shared responsibility model for IaaS, the provider secures the physical facility, hardware, and hypervisor, while the customer retains responsibility for the guest OS, applications, and data. OS hardening and patching is the customer\'s job in IaaS.',
    references: [REF_CSA_GUIDANCE, REF_NIST_500292]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A customer wants the provider to manage the operating system and runtime but wants to deploy and control their own application code. Which service model best fits?',
    options: opts4('IaaS', 'PaaS', 'SaaS', 'On-premises hosting'),
    correct: ['b'],
    explanation: 'PaaS provides a managed platform (OS, runtime, middleware) while the customer deploys and controls application code and data. IaaS would leave the OS to the customer; SaaS gives no application-code control.',
    references: [REF_NIST_800145, REF_NIST_800146]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL roles defined in the NIST SP 500-292 Cloud Computing Reference Architecture.',
    options: opts4(
      'Cloud Consumer',
      'Cloud Provider',
      'Cloud Broker',
      'Cloud Hypervisor'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'NIST SP 500-292 defines five major actors: Cloud Consumer, Cloud Provider, Cloud Broker, Cloud Carrier, and Cloud Auditor. "Cloud Hypervisor" is a technology component, not an architectural role.',
    references: [REF_NIST_500292]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document is most appropriate for capturing measurable availability and performance commitments between a customer and a cloud provider?',
    options: opts4(
      'Service Level Agreement (SLA)',
      'Acceptable Use Policy',
      'Business Impact Analysis',
      'Statement of Work for a penetration test'
    ),
    correct: ['a'],
    explanation: 'The SLA defines measurable service commitments such as uptime, performance, and remedies/penalties. The other documents serve different purposes (usage rules, impact ranking, scoped testing).',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A financial firm wants dedicated infrastructure shared only among partner banks with common compliance needs. Which cloud deployment model is this?',
    options: opts4('Public cloud', 'Community cloud', 'Hybrid cloud', 'Multi-cloud'),
    correct: ['b'],
    explanation: 'A community cloud is provisioned for exclusive use by a specific community of organizations with shared concerns (e.g., compliance). Public cloud is open to all; hybrid combines models; multi-cloud uses several providers.',
    references: [REF_NIST_800145]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which principle most directly reduces the impact of cloud vendor lock-in?',
    options: opts4(
      'Choosing the provider with the lowest price',
      'Designing for portability and interoperability using open standards',
      'Encrypting all data at rest',
      'Selecting a single-region deployment'
    ),
    correct: ['b'],
    explanation: 'Portability and interoperability built on open standards and abstraction reduce the cost and risk of moving workloads, mitigating lock-in. Price, encryption, and region choice do not address lock-in directly.',
    references: [REF_CSA_GUIDANCE, REF_CCSP_OUTLINE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'In a SaaS model the customer is generally responsible for patching the underlying application code provided by the vendor.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['b'],
    explanation: 'False. In SaaS the provider manages and patches the application, infrastructure, and platform. The customer\'s responsibility is largely limited to data, access management, and configuration.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'During the "define" phase of a cloud secure data lifecycle design, which activity is most important for an architect?',
    options: opts4(
      'Selecting the cheapest storage tier',
      'Classifying data and mapping protection requirements to the lifecycle phases',
      'Choosing the front-end web framework',
      'Negotiating the SLA penalty clauses'
    ),
    correct: ['b'],
    explanation: 'Effective secure cloud design starts with data classification and mapping protection requirements (encryption, access, retention) across the data lifecycle. Cost and framework decisions follow security requirements.',
    references: [REF_CCSP_OUTLINE, REF_CSA_GUIDANCE]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'A cloud broker provides which primary value to a cloud consumer?',
    options: opts4(
      'It physically owns the data center hardware.',
      'It manages use, performance, and delivery of cloud services and negotiates relationships between providers and consumers.',
      'It is the network transport between consumer and provider.',
      'It performs independent security audits only.'
    ),
    correct: ['b'],
    explanation: 'Per NIST SP 500-292, a cloud broker manages the use, performance, and delivery of cloud services and negotiates relationships. The carrier provides transport; the auditor performs independent assessment.',
    references: [REF_NIST_500292]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which emerging-technology consideration most increases the attack surface when adopting serverless (FaaS) architectures?',
    options: opts4(
      'Long-lived virtual machines requiring frequent patching',
      'A larger number of fine-grained functions, event triggers, and third-party dependencies to secure',
      'Mandatory dedicated physical hosts',
      'Inability to use IAM roles'
    ),
    correct: ['b'],
    explanation: 'Serverless decomposes applications into many small functions with numerous event triggers and dependency chains, expanding the attack surface and complicating least-privilege and dependency management. VM patching is reduced, not increased.',
    references: [REF_CSA_GUIDANCE, REF_CSA_EGRESS]
  },

  // ── Cloud Data Security (13) ──
  {
    domain: DATA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which sequence correctly orders the cloud secure data lifecycle phases?',
    options: opts4(
      'Create, Store, Use, Share, Archive, Destroy',
      'Store, Create, Share, Use, Destroy, Archive',
      'Create, Use, Store, Destroy, Share, Archive',
      'Archive, Create, Store, Use, Share, Destroy'
    ),
    correct: ['a'],
    explanation: 'The cloud data security lifecycle is Create, Store, Use, Share, Archive, Destroy. Controls (encryption, DLP, access, retention) are mapped to each phase.',
    references: [REF_CCSP_OUTLINE, REF_CSA_GUIDANCE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary security benefit of tokenization compared with storing the original sensitive value?',
    options: opts4(
      'It compresses the data to save storage costs.',
      'It substitutes the sensitive value with a non-sensitive surrogate, removing the real value from the application/database scope.',
      'It guarantees the data can never be recovered.',
      'It signs the data for integrity only.'
    ),
    correct: ['b'],
    explanation: 'Tokenization replaces sensitive data with a non-sensitive token while the real value is held in a separate secured vault, shrinking the systems in scope (e.g., for PCI DSS). It is not compression, signing, or irreversible destruction.',
    references: [REF_CCSP_OUTLINE, REF_CSA_GUIDANCE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A customer using IaaS wants to ensure the cloud provider cannot read its data at rest. Which key management approach best supports this goal?',
    options: opts4(
      'Provider-managed keys with default settings',
      'Customer-managed keys held in a customer-controlled HSM/KMS (hold-your-own-key)',
      'No encryption, relying on physical security',
      'Hashing the data with SHA-256'
    ),
    correct: ['b'],
    explanation: 'Customer-managed keys, ideally in a customer-controlled HSM/KMS, ensure the provider cannot decrypt customer data because it never holds the keys. Provider-managed defaults give the provider key access; hashing is one-way and unusable as encryption.',
    references: [REF_NIST_80057, REF_CSA_GUIDANCE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL techniques that are valid forms of data de-identification or obfuscation.',
    options: opts4(
      'Masking',
      'Anonymization',
      'Tokenization',
      'Increasing the storage replication factor'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Masking, anonymization, and tokenization are obfuscation/de-identification techniques. Increasing replication improves availability/durability but does nothing to de-identify data.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800122]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is "crypto-shredding" the preferred approach to securely destroy data in multi-tenant cloud storage?',
    options: opts4(
      'It physically degausses the shared disks.',
      'It destroys the encryption keys so the still-present ciphertext becomes unrecoverable.',
      'It overwrites the entire SAN seven times.',
      'It moves data to a colder storage tier.'
    ),
    correct: ['b'],
    explanation: 'In multi-tenant storage you cannot physically destroy shared media without affecting other tenants. Crypto-shredding destroys the keys, rendering the remaining ciphertext effectively unrecoverable. Physical destruction and overwriting are impractical in shared cloud storage.',
    references: [REF_NIST_80057, REF_CSA_GUIDANCE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control is specifically designed to detect and prevent unauthorized exfiltration of sensitive data leaving an organization\'s cloud environment?',
    options: opts4(
      'Data Loss Prevention (DLP)',
      'Network Time Protocol',
      'Container image scanning',
      'Blue-green deployment'
    ),
    correct: ['a'],
    explanation: 'DLP inspects data in use, in motion, and at rest to detect and block unauthorized transfer of sensitive content. The other options address time sync, image vulnerabilities, and deployment strategy.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the main purpose of data classification in a cloud environment?',
    options: opts4(
      'To reduce storage egress fees',
      'To assign protection requirements and handling rules based on sensitivity and impact',
      'To choose a programming language',
      'To select a hypervisor vendor'
    ),
    correct: ['b'],
    explanation: 'Classification assigns sensitivity levels so that appropriate controls (encryption, access, retention, DLP rules) can be applied consistently. It drives protection, not cost or technology selection.',
    references: [REF_NIST_800122, REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which technology enforces access and usage restrictions (e.g., copy, print, forward) that travel with a document even after it leaves the cloud repository?',
    options: opts4(
      'Information Rights Management (IRM/DRM)',
      'TLS 1.3',
      'A WAF',
      'A reverse proxy'
    ),
    correct: ['a'],
    explanation: 'IRM/DRM embeds policy enforcement into the object so usage restrictions persist regardless of location. TLS protects data in transit only; a WAF/reverse proxy protect the application boundary.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Encrypting data at rest alone is sufficient to protect data while it is being actively processed in memory by an application.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['b'],
    explanation: 'False. At-rest encryption does not protect data in use. Protecting data being processed requires additional measures such as confidential computing/trusted execution environments and strong access controls.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: DATA, difficulty: 4, type: QType.SINGLE,
    stem: 'A regulator requires that an organization prove it can demonstrate the lineage and handling of sensitive records throughout their lifecycle. Which capability most directly supports this?',
    options: opts4(
      'Data dispersion across availability zones',
      'Data provenance and audit logging tied to the classification scheme',
      'Auto-scaling groups',
      'A content delivery network'
    ),
    correct: ['b'],
    explanation: 'Data provenance plus immutable audit logs tied to classification provide the chain of custody and handling evidence regulators expect. Dispersion, auto-scaling, and CDNs address availability/performance, not lineage.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800122]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best describes a key escrow arrangement in cloud key management?',
    options: opts4(
      'Keys are deleted immediately after first use.',
      'A copy of cryptographic keys is held by a trusted third party for recovery or lawful access.',
      'Keys are stored in plaintext in the application database.',
      'Keys are derived from the user password each session and never stored.'
    ),
    correct: ['b'],
    explanation: 'Key escrow places a recoverable copy of keys with a trusted party to support recovery or lawful access while maintaining controls. Plaintext storage and immediate deletion are insecure or unrelated; per-session derivation is a different design.',
    references: [REF_NIST_80057]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'In a structured database environment, which obfuscation method replaces production values with realistic but fictitious data for use in lower environments?',
    options: opts4(
      'Static data masking',
      'Full-disk encryption',
      'TLS termination',
      'Database sharding'
    ),
    correct: ['a'],
    explanation: 'Static data masking permanently substitutes sensitive values with realistic fictitious data in non-production copies, preserving usability while removing real sensitive data. Encryption, TLS, and sharding do not de-identify test data.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization stores objects across multiple cloud regions and splits each object into encrypted fragments so no single node holds a complete copy. This technique is best described as:',
    options: opts4(
      'Data dispersion (bit splitting / secret sharing)',
      'Deduplication',
      'Thin provisioning',
      'Write-once-read-many (WORM)'
    ),
    correct: ['a'],
    explanation: 'Data dispersion/bit splitting fragments and encrypts data across locations so no single fragment is usable alone, improving confidentiality and availability. Deduplication, thin provisioning, and WORM serve different goals.',
    references: [REF_NIST_800209, REF_CSA_GUIDANCE]
  },

  // ── Cloud Platform and Infrastructure Security (11) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which attack is uniquely enabled by shared physical hardware in multi-tenant virtualization and is mitigated by strong tenant isolation?',
    options: opts4(
      'VM escape / cross-tenant side-channel attack',
      'SQL injection',
      'Phishing',
      'DNS amplification'
    ),
    correct: ['a'],
    explanation: 'VM escape and side-channel attacks exploit shared hypervisor/hardware in multi-tenant environments; strong isolation and hypervisor hardening mitigate them. SQL injection, phishing, and DNS amplification are not specific to virtualization tenancy.',
    references: [REF_CSA_GUIDANCE, REF_NIST_500292]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component is the most critical to harden because compromising it can impact every guest VM on a host?',
    options: opts4('A single tenant\'s web app', 'The hypervisor', 'A logging agent', 'The CDN edge node'),
    correct: ['b'],
    explanation: 'The hypervisor mediates all guest VMs on a host; its compromise can affect every tenant. Hardening, patching, and isolating the hypervisor is foundational to cloud infrastructure security.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the primary security advantage of network micro-segmentation in a cloud virtual network?',
    options: opts4(
      'It eliminates the need for encryption.',
      'It limits east-west lateral movement by isolating workloads with granular policy.',
      'It increases raw network throughput.',
      'It removes the need for identity management.'
    ),
    correct: ['b'],
    explanation: 'Micro-segmentation applies granular per-workload policy that constrains lateral (east-west) movement after an initial compromise. It complements, not replaces, encryption and identity controls.',
    references: [REF_NIST_800207, REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL elements that belong in a cloud data center physical/environmental design for resilience.',
    options: opts4(
      'Redundant power feeds and UPS/generator',
      'Redundant HVAC and fire suppression',
      'Geographically separated availability zones',
      'Disabling all audit logging to save storage'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Resilient data center design includes redundant power, cooling, fire suppression, and geographically separated zones/regions. Disabling audit logging weakens security and is never a resilience measure.',
    references: [REF_NIST_80034, REF_CCSP_OUTLINE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A BCDR plan specifies an RPO of 15 minutes for a cloud database. Which design most directly satisfies this?',
    options: opts4(
      'Weekly full backups only',
      'Asynchronous replication or transaction-log shipping at intervals not exceeding 15 minutes',
      'Manual export once per day',
      'Snapshotting only when storage is full'
    ),
    correct: ['b'],
    explanation: 'RPO defines the maximum acceptable data loss; meeting a 15-minute RPO requires replication/log shipping at or under that interval. Daily or weekly mechanisms cannot meet a 15-minute RPO.',
    references: [REF_NIST_80034]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which term describes the maximum tolerable time a business process can be unavailable before unacceptable consequences occur?',
    options: opts4(
      'Recovery Point Objective (RPO)',
      'Recovery Time Objective (RTO)',
      'Mean Time Between Failures (MTBF)',
      'Maximum Tolerable Downtime (MTD)'
    ),
    correct: ['d'],
    explanation: 'MTD (also called MAD) is the total time a process can be down before the organization suffers unacceptable harm; RTO must be less than MTD. RPO concerns data loss, MTBF concerns reliability.',
    references: [REF_NIST_80034]
  },
  {
    domain: INFRA, difficulty: 4, type: QType.SINGLE,
    stem: 'Within a Trusted Platform Module (TPM)/hardware root of trust strategy for cloud hosts, what does "measured boot" primarily provide?',
    options: opts4(
      'Faster boot times',
      'Cryptographic attestation that the boot components have not been tampered with',
      'Automatic OS patching',
      'Network load balancing'
    ),
    correct: ['b'],
    explanation: 'Measured boot records cryptographic hashes of boot components into the TPM so their integrity can be attested. It does not improve boot speed, patching, or load balancing.',
    references: [REF_NIST_800209]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control best protects management/orchestration plane access in a cloud platform?',
    options: opts4(
      'Allowing console access from any IP without MFA',
      'Strong MFA, least-privilege RBAC, and a privileged access bastion/jump host',
      'Sharing a single root account among admins',
      'Disabling logging on the management plane'
    ),
    correct: ['b'],
    explanation: 'The management/orchestration plane is high-value; protect it with MFA, least-privilege RBAC, and brokered privileged access. Shared root accounts, open access, and disabled logging dramatically increase risk.',
    references: [REF_CSA_GUIDANCE, REF_NIST_800207]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A host-based intrusion detection system (HIDS) on cloud workloads can complement network controls by detecting malicious activity inside the guest OS.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. HIDS monitors processes, files, and logs inside the guest OS, detecting threats that network controls may miss. Defense in depth combines host and network controls.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best ensures patch consistency for ephemeral cloud compute instances?',
    options: opts4(
      'Manually SSH into each running instance',
      'Bake patched, hardened golden images and redeploy (immutable infrastructure)',
      'Disable updates to avoid downtime',
      'Patch only after an incident'
    ),
    correct: ['b'],
    explanation: 'Immutable infrastructure rebuilds instances from patched, hardened golden images, guaranteeing consistency and removing configuration drift. Manual or reactive patching does not scale or stay consistent in ephemeral environments.',
    references: [REF_CSA_GUIDANCE, REF_NIST_800218]
  },
  {
    domain: INFRA, difficulty: 4, type: QType.SINGLE,
    stem: 'A tenant requires assurance that decommissioned cloud storage media cannot be reconstructed by another tenant. Which provider control gives the strongest assurance for shared media?',
    options: opts4(
      'Default encryption with provider-managed keys plus documented crypto-erase on decommission',
      'Relying solely on file deletion',
      'Reformatting the volume once',
      'Moving the data to archive tier'
    ),
    correct: ['a'],
    explanation: 'On shared media, encrypting all data and cryptographically erasing keys on decommission prevents reconstruction without disrupting other tenants. Deletion, reformat, or tier moves leave recoverable remnants.',
    references: [REF_NIST_800209, REF_NIST_80057]
  },

  // ── Cloud Application Security (11) ──
  {
    domain: APP, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which testing technique analyzes source code without executing it to find vulnerabilities early in the SDLC?',
    options: opts4(
      'Dynamic Application Security Testing (DAST)',
      'Static Application Security Testing (SAST)',
      'Penetration testing in production',
      'User acceptance testing'
    ),
    correct: ['b'],
    explanation: 'SAST inspects source/binary code without execution, enabling early detection. DAST tests a running application; production pen testing and UAT occur later and serve different goals.',
    references: [REF_NIST_800218, REF_CCSP_OUTLINE]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is integrating security into each phase of the SDLC ("shift left") important for cloud applications?',
    options: opts4(
      'It removes the need for production monitoring.',
      'Defects found earlier are cheaper and safer to fix than those found in production.',
      'It guarantees zero vulnerabilities.',
      'It eliminates the need for code review.'
    ),
    correct: ['b'],
    explanation: 'Shifting security left reduces remediation cost and risk because issues are caught before deployment. It does not eliminate monitoring, code review, or all vulnerabilities.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which control most directly protects a public cloud API against injection and abusive traffic?',
    options: opts4(
      'An API gateway enforcing schema validation, authentication, and rate limiting',
      'Increasing the database instance size',
      'Disabling TLS to reduce latency',
      'Removing input validation to simplify code'
    ),
    correct: ['a'],
    explanation: 'An API gateway centralizes authentication, input/schema validation, throttling, and rate limiting, mitigating injection and abuse. The other options weaken security or are unrelated.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that strengthen secrets management for cloud applications.',
    options: opts4(
      'Store secrets in a dedicated secrets manager/vault with access policies',
      'Inject secrets at runtime rather than hardcoding them in source',
      'Rotate secrets regularly and on suspected compromise',
      'Commit API keys to the Git repository for convenience'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Vault-based storage, runtime injection, and rotation are sound secrets-management practices. Committing keys to source control is a severe anti-pattern that leads to credential leakage.',
    references: [REF_NIST_800218, REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'A development team consumes many third-party open-source libraries. Which practice best manages the resulting supply-chain risk?',
    options: opts4(
      'Trust all packages from popular registries',
      'Use software composition analysis (SCA) and maintain a software bill of materials (SBOM)',
      'Disable dependency updates permanently',
      'Only review code written in-house'
    ),
    correct: ['b'],
    explanation: 'SCA scans dependencies for known vulnerabilities and license issues, and an SBOM provides visibility for rapid response (e.g., to a disclosed CVE). Blind trust or freezing updates increases risk.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which threat-modeling methodology categorizes threats as Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, and Elevation of privilege?',
    options: opts4('STRIDE', 'DREAD', 'PASTA', 'OCTAVE'),
    correct: ['a'],
    explanation: 'STRIDE maps to those six threat categories and is commonly used during application design. DREAD is a risk-rating model; PASTA and OCTAVE are broader risk/threat processes.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the primary role of an Identity Provider (IdP) in a federated cloud SSO design?',
    options: opts4(
      'It stores application business data.',
      'It authenticates users and issues assertions/tokens that relying parties trust.',
      'It performs DDoS mitigation.',
      'It compiles the application source code.'
    ),
    correct: ['b'],
    explanation: 'In federation, the IdP authenticates the user and issues signed assertions/tokens (e.g., SAML, OIDC) that service providers/relying parties consume. It is not a data store, DDoS service, or build tool.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'DAST can find runtime and configuration issues that SAST may miss because it tests the running application.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. DAST exercises a running application and can surface runtime, environment, and configuration flaws not visible in static code. SAST and DAST are complementary.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which deployment construct in a CI/CD pipeline best reduces the risk of shipping vulnerable code to production?',
    options: opts4(
      'A manual email approval only',
      'Automated security gates (SAST/DAST/SCA) that fail the build on critical findings',
      'Deploying directly from developer laptops',
      'Skipping tests to speed delivery'
    ),
    correct: ['b'],
    explanation: 'Automated security gates enforce policy by failing builds with critical findings before promotion, providing consistent, scalable assurance. Manual-only approval and skipping tests undermine security.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 4, type: QType.SINGLE,
    stem: 'An application uses OAuth 2.0 for delegated authorization. What is the most accurate statement about OAuth 2.0 vs OpenID Connect (OIDC)?',
    options: opts4(
      'OAuth 2.0 is an authentication protocol; OIDC is for authorization.',
      'OAuth 2.0 handles delegated authorization; OIDC adds an identity layer on top for authentication.',
      'They are identical and interchangeable.',
      'OIDC replaces TLS for transport security.'
    ),
    correct: ['b'],
    explanation: 'OAuth 2.0 is an authorization framework for delegated access; OIDC builds an authentication/identity layer (ID tokens) on top of OAuth 2.0. They are distinct, not interchangeable, and not transport security.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'A cloud-native microservice must call another service securely. Which approach best provides mutual authentication between services?',
    options: opts4(
      'Hardcoded shared password in code',
      'mTLS with short-lived certificates issued by an internal CA / service mesh',
      'Allowing unauthenticated internal traffic',
      'Basic auth over HTTP'
    ),
    correct: ['b'],
    explanation: 'Mutual TLS with short-lived, automatically rotated certificates (often via a service mesh) provides strong service-to-service authentication and encryption. Hardcoded passwords, unauthenticated, or HTTP basic auth are insecure.',
    references: [REF_NIST_800207, REF_CSA_GUIDANCE]
  },

  // ── Cloud Security Operations (11) ──
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of a SIEM in cloud security operations?',
    options: opts4(
      'To compile application code',
      'To aggregate, correlate, and alert on security events/logs from many sources',
      'To provision virtual machines',
      'To negotiate vendor contracts'
    ),
    correct: ['b'],
    explanation: 'A SIEM centralizes log/event collection, correlation, and alerting to support detection and investigation. It does not build code, provision infrastructure, or manage contracts.',
    references: [REF_NIST_80092]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which log management practice best preserves the integrity of cloud audit logs for later forensic use?',
    options: opts4(
      'Allow administrators to edit logs as needed',
      'Forward logs to a write-once/append-only, access-controlled store with time synchronization',
      'Store logs only on the host that generated them',
      'Delete logs after 24 hours to save space'
    ),
    correct: ['b'],
    explanation: 'Immutable, access-controlled, time-synchronized log storage protects integrity and supports forensics. Editable, host-local, or short-lived logs are easily tampered with or lost.',
    references: [REF_NIST_80092, REF_NIST_80086]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Per NIST SP 800-61, what are the four phases of the incident response lifecycle?',
    options: opts4(
      'Identify, Protect, Detect, Recover',
      'Preparation; Detection & Analysis; Containment, Eradication & Recovery; Post-Incident Activity',
      'Plan, Do, Check, Act',
      'Create, Store, Use, Destroy'
    ),
    correct: ['b'],
    explanation: 'NIST SP 800-61 defines Preparation; Detection & Analysis; Containment, Eradication & Recovery; and Post-Incident Activity. The other lists are the CSF functions, PDCA, and the data lifecycle.',
    references: [REF_NIST_80061]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL challenges that complicate digital forensics in public cloud environments.',
    options: opts4(
      'Multi-tenancy and shared resources limiting what can be imaged',
      'Volatility and rapid de-provisioning of ephemeral instances',
      'Jurisdictional issues over where data physically resides',
      'The complete absence of any provider logging APIs'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Multi-tenancy, ephemerality, and cross-jurisdiction data location are well-known cloud forensic challenges. Major providers do offer logging/forensic APIs, so a "complete absence" is inaccurate.',
    references: [REF_NIST_80086, REF_CSA_GUIDANCE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'During incident response in the cloud, why is snapshotting a compromised volume before remediation important?',
    options: opts4(
      'It improves application performance',
      'It preserves evidence and supports chain of custody for forensic analysis',
      'It reduces storage costs',
      'It automatically patches the vulnerability'
    ),
    correct: ['b'],
    explanation: 'Capturing an immutable snapshot preserves volatile evidence and maintains chain of custody before containment/remediation alters the system. It is not a performance, cost, or patching action.',
    references: [REF_NIST_80086, REF_NIST_80061]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which ITSM process ensures that modifications to cloud infrastructure are reviewed, approved, and recorded to reduce outage and security risk?',
    options: opts4('Change management', 'Capacity management', 'Marketing operations', 'Procurement'),
    correct: ['a'],
    explanation: 'Change management governs review, approval, scheduling, and documentation of changes, reducing the risk of outages and insecure modifications. Capacity, marketing, and procurement serve other functions.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A critical vulnerability is announced for a widely used library across many cloud services. Which operations capability most accelerates a coordinated response?',
    options: opts4(
      'A complete and current asset inventory/CMDB with dependency mapping',
      'A larger marketing budget',
      'Disabling all logging',
      'Removing the change management process'
    ),
    correct: ['a'],
    explanation: 'An accurate asset inventory/CMDB with dependency mapping lets responders quickly identify affected systems and prioritize patching. The other options are irrelevant or harmful.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800218]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Time synchronization (e.g., via NTP) across cloud systems is important for correlating events during an investigation.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Accurate, synchronized timestamps are essential to correlate logs across systems and reconstruct an incident timeline.',
    references: [REF_NIST_80092]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice best supports continuous security monitoring of a cloud environment\'s configuration drift?',
    options: opts4(
      'Quarterly manual screenshots of the console',
      'Automated configuration/compliance scanning (CSPM) with alerting on policy violations',
      'Trusting that nothing changes between audits',
      'Disabling APIs to prevent changes'
    ),
    correct: ['b'],
    explanation: 'Cloud Security Posture Management continuously evaluates configuration against policy and alerts on drift/misconfiguration. Periodic manual checks miss most drift; disabling APIs is impractical.',
    references: [REF_CSA_CCM, REF_CSA_GUIDANCE]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A managed cloud service prevents the customer from deploying traditional agents. Which monitoring approach is most appropriate?',
    options: opts4(
      'Refuse to use the service entirely',
      'Leverage provider-native logging, metrics, and security telemetry integrated into the customer SIEM',
      'Assume the provider handles all security with no customer visibility',
      'Disable the service\'s logging'
    ),
    correct: ['b'],
    explanation: 'For agent-restricted managed services, consuming provider-native logs/metrics/security telemetry into the SIEM gives needed visibility within the shared responsibility model. Blind trust or disabling logging removes oversight.',
    references: [REF_NIST_80092, REF_CSA_GUIDANCE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which document, used in operations, defines step-by-step instructions for responding to a specific recurring scenario such as ransomware?',
    options: opts4('A runbook/playbook', 'A marketing brief', 'An SLA penalty schedule', 'A network diagram only'),
    correct: ['a'],
    explanation: 'Runbooks/playbooks provide repeatable, step-by-step response procedures for specific scenarios, improving consistency and speed. The other artifacts do not provide response procedures.',
    references: [REF_NIST_80061]
  },

  // ── Legal, Risk and Compliance (8) ──
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Under the GDPR, which party determines the purposes and means of processing personal data?',
    options: opts4('Data processor', 'Data controller', 'Data subject', 'Supervisory authority'),
    correct: ['b'],
    explanation: 'The data controller determines the purposes and means of processing and bears primary accountability. The processor acts on the controller\'s instructions; the data subject is the individual; the supervisory authority regulates.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A cloud customer wants independent assurance about a SaaS provider\'s security controls over a period of time. Which report is most appropriate?',
    options: opts4(
      'SOC 1 Type I',
      'SOC 2 Type II',
      'A provider marketing whitepaper',
      'An internal self-assessment only'
    ),
    correct: ['b'],
    explanation: 'A SOC 2 Type II report independently evaluates the design and operating effectiveness of security/availability/confidentiality controls over a period. SOC 1 addresses financial reporting controls; marketing and self-assessments are not independent assurance.',
    references: [REF_CSA_STAR, REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which agreement specifically governs how a cloud provider may process personal data on behalf of a customer to satisfy data-protection law?',
    options: opts4(
      'Data Processing Agreement (DPA)',
      'Acceptable Use Policy',
      'Statement of Work',
      'Non-Disclosure Agreement'
    ),
    correct: ['a'],
    explanation: 'A DPA defines the controller-processor relationship, processing scope, security measures, and obligations required by laws like the GDPR. AUP, SOW, and NDA serve other purposes.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that should be addressed in cloud vendor contracts to manage compliance risk.',
    options: opts4(
      'Right-to-audit / access to assurance reports',
      'Data location, sovereignty, and breach notification timelines',
      'Secure data return and deletion upon termination',
      'A clause forbidding the customer from ever encrypting its data'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Right-to-audit, data location/sovereignty, breach notification, and return/deletion on exit are standard contractual safeguards. A clause forbidding customer encryption would be a serious red flag, not a safeguard.',
    references: [REF_CSA_CCM, REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which concept refers to legal restrictions on where data may be stored or processed based on the country of origin or residence?',
    options: opts4('Data sovereignty / data residency', 'Data deduplication', 'Data masking', 'Data dispersion'),
    correct: ['a'],
    explanation: 'Data sovereignty/residency concerns jurisdictional legal control over data based on location. Deduplication, masking, and dispersion are technical data-handling techniques, not legal location requirements.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.SINGLE,
    stem: 'During risk treatment, transferring cloud risk to a third party via cyber-insurance is an example of which option?',
    options: opts4('Risk acceptance', 'Risk avoidance', 'Risk transfer/sharing', 'Risk mitigation'),
    correct: ['c'],
    explanation: 'Purchasing insurance shifts financial impact to another party, which is risk transfer/sharing. Acceptance retains the risk, avoidance eliminates the activity, mitigation reduces likelihood/impact.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Under most data-protection regimes and the shared responsibility model, using a cloud processor transfers the customer\'s accountability for personal data to the provider.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['b'],
    explanation: 'False. The controller (customer) remains accountable for personal data even when a processor (provider) handles it. Responsibility for some controls is shared, but legal accountability is not transferred.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 4, type: QType.SINGLE,
    stem: 'Which framework provides a cloud-specific control mapping that customers can use to assess provider controls against multiple standards (e.g., ISO 27001, PCI DSS)?',
    options: opts4(
      'CSA Cloud Controls Matrix (CCM)',
      'OWASP Top 10',
      'STRIDE',
      'The OSI model'
    ),
    correct: ['a'],
    explanation: 'The CSA Cloud Controls Matrix is a cloud-specific control framework mapped to many standards/regulations, supporting provider assessment (e.g., via the STAR registry). OWASP Top 10, STRIDE, and the OSI model serve other purposes.',
    references: [REF_CSA_CCM, REF_CSA_STAR]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Cloud Concepts, Architecture and Design (11) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which NIST-defined deployment model is provisioned for open use by the general public?',
    options: opts4('Private cloud', 'Public cloud', 'Community cloud', 'Hybrid cloud'),
    correct: ['b'],
    explanation: 'NIST SP 800-145 defines the public cloud as infrastructure provisioned for open use by the general public. Private is for a single organization, community for a specific group, hybrid is a composition.',
    references: [REF_NIST_800145]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In SaaS, which is typically the customer\'s most significant remaining security responsibility?',
    options: opts4(
      'Hypervisor patching',
      'Identity, access management, and data/configuration within the application',
      'Physical data center security',
      'Network fabric maintenance'
    ),
    correct: ['b'],
    explanation: 'In SaaS the customer controls user access, data, and tenant configuration; the provider handles the platform, infrastructure, and physical security. IAM and data governance are the customer\'s key duties.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization runs sensitive workloads on-premises but bursts batch processing to a public cloud during peak. This is best described as:',
    options: opts4('Public cloud', 'Hybrid cloud', 'Community cloud', 'Private cloud'),
    correct: ['b'],
    explanation: 'Combining private/on-prem and public cloud with workload portability ("cloud bursting") is a hybrid cloud. The other models do not combine deployment types.',
    references: [REF_NIST_800145]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which NIST SP 500-292 actor performs independent assessment of cloud services, operations, and security?',
    options: opts4('Cloud Carrier', 'Cloud Auditor', 'Cloud Broker', 'Cloud Consumer'),
    correct: ['b'],
    explanation: 'The Cloud Auditor conducts independent assessments of cloud services and controls. The carrier provides connectivity, the broker intermediates, and the consumer uses services.',
    references: [REF_NIST_500292]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are valid business drivers for adopting cloud computing.',
    options: opts4(
      'Elastic scalability to match demand',
      'Shifting capital expenditure to operating expenditure',
      'Faster time to market via on-demand provisioning',
      'Guaranteed elimination of all security responsibilities'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Elasticity, CapEx-to-OpEx shift, and faster provisioning are genuine cloud drivers. Security responsibilities are shared, never fully eliminated for the customer.',
    references: [REF_NIST_800146, REF_CSA_GUIDANCE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design principle ensures a cloud architecture continues operating despite the failure of an individual component?',
    options: opts4('Single point of failure', 'Resiliency through redundancy and fault isolation', 'Vendor lock-in', 'Manual scaling only'),
    correct: ['b'],
    explanation: 'Resiliency via redundancy, fault isolation, and graceful degradation keeps the system operating through component failures. Single points of failure and lock-in reduce resilience.',
    references: [REF_NIST_80034, REF_CCSP_OUTLINE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'The "measured service" characteristic of cloud computing primarily enables which capability?',
    options: opts4(
      'Unlimited free resources',
      'Metering and transparent billing/optimization of resource usage',
      'Eliminating multi-tenancy',
      'Removing the need for monitoring'
    ),
    correct: ['b'],
    explanation: 'Measured service automatically meters resource usage to support pay-per-use billing, reporting, and optimization. It does not make resources free or remove monitoring.',
    references: [REF_NIST_800145]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Rapid elasticity means resources can be provisioned and released to scale rapidly with demand, sometimes appearing unlimited to the consumer.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. NIST defines rapid elasticity as the ability to provision and release capabilities rapidly, often appearing unlimited and appropriable in any quantity at any time.',
    references: [REF_NIST_800145]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'When designing a secure cloud solution, why is identifying trust boundaries early so important?',
    options: opts4(
      'It determines the marketing strategy',
      'It defines where data/control crosses differing trust levels so controls can be placed appropriately',
      'It sets the application color scheme',
      'It removes the need for encryption'
    ),
    correct: ['b'],
    explanation: 'Trust boundaries mark transitions between differing trust levels (e.g., internet to app, app to data), guiding where authentication, validation, and encryption controls belong.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800207]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'A provider offers a managed function platform billed per invocation with no server management. Which cost/security trade-off should the architect highlight?',
    options: opts4(
      'Lower operational patching burden but reduced low-level control and new dependency/identity risks',
      'Full control of the underlying OS with no provider involvement',
      'Guaranteed zero attack surface',
      'No need for least-privilege design'
    ),
    correct: ['a'],
    explanation: 'Serverless reduces OS patching/operations but trades away low-level control and introduces dependency, configuration, and fine-grained IAM concerns that still require least privilege.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the shared responsibility model is most accurate as you move from IaaS to PaaS to SaaS?',
    options: opts4(
      'The customer\'s share of operational responsibility generally increases.',
      'The customer\'s share of operational responsibility generally decreases while accountability for data/identity remains.',
      'The provider takes full legal accountability for the customer\'s data.',
      'Responsibilities are identical across all service models.'
    ),
    correct: ['b'],
    explanation: 'Moving IaaS → PaaS → SaaS shifts more operational responsibility to the provider, but the customer remains accountable for its data, identities, and access regardless of model.',
    references: [REF_CSA_GUIDANCE, REF_NIST_500292]
  },

  // ── Cloud Data Security (13) ──
  {
    domain: DATA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which lifecycle phase is the best place to first apply data classification labels?',
    options: opts4('Create', 'Archive', 'Destroy', 'Share'),
    correct: ['a'],
    explanation: 'Classification should occur at the Create phase so the correct protection controls follow the data through Store, Use, Share, Archive, and Destroy.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which encryption protects database fields so that even a cloud database administrator cannot read the plaintext?',
    options: opts4(
      'Transparent Data Encryption (TDE) only',
      'Application-layer (client-side) encryption with customer-held keys',
      'TLS in transit only',
      'Full-disk encryption only'
    ),
    correct: ['b'],
    explanation: 'Application/client-side encryption with customer-held keys keeps plaintext out of the database, so a DBA sees only ciphertext. TDE/full-disk decrypt transparently for authorized DB access; TLS protects only transit.',
    references: [REF_NIST_80057, REF_NIST_800111]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'A key management best practice is separation of duties between which two roles?',
    options: opts4(
      'Developer and tester',
      'The key custodian/management function and the data owner/administrator',
      'Network and storage admins',
      'Help desk and end users'
    ),
    correct: ['b'],
    explanation: 'Separating key management from data administration ensures no single person can both manage keys and access all protected data, reducing insider risk. The other pairings are not the core key-management SoD.',
    references: [REF_NIST_80057]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to use tokenization for payment card data in the cloud.',
    options: opts4(
      'It reduces PCI DSS scope by removing PANs from systems',
      'Tokens have no exploitable value if stolen',
      'It can preserve format for downstream systems',
      'It compresses logs to reduce SIEM cost'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Tokenization removes real PANs (scope reduction), yields valueless tokens if breached, and can preserve format. Reducing SIEM log size is unrelated to tokenization.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control most directly enforces data retention and disposition schedules in cloud object storage?',
    options: opts4(
      'Lifecycle policies with retention/expiration and legal hold',
      'A faster CPU instance',
      'A wider network pipe',
      'A new front-end framework'
    ),
    correct: ['a'],
    explanation: 'Object-storage lifecycle policies (with retention, expiration, and legal hold) automate retention and disposition per schedule. Compute, network, and UI changes do not enforce retention.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800122]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the principal goal of Data Loss Prevention rules tuned to "data in motion"?',
    options: opts4(
      'To detect/block sensitive content leaving via email, web, or API channels',
      'To speed up database queries',
      'To compress backups',
      'To rotate TLS certificates'
    ),
    correct: ['a'],
    explanation: 'DLP for data in motion inspects egress channels (email/web/API) to detect and block unauthorized transfer of sensitive data. The other options are unrelated functions.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which de-identification approach is generally irreversible and aims to ensure individuals cannot be re-identified even with additional data?',
    options: opts4('Pseudonymization', 'Anonymization', 'Tokenization', 'Encryption'),
    correct: ['b'],
    explanation: 'Anonymization irreversibly removes the ability to re-identify individuals. Pseudonymization, tokenization, and encryption are reversible with the appropriate mapping/key.',
    references: [REF_NIST_800122, REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Crypto-shredding is effective only if the data was encrypted before the keys are destroyed.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Crypto-shredding relies on the data already being encrypted; destroying the keys makes the ciphertext unrecoverable. Unencrypted data is not protected by destroying keys.',
    references: [REF_NIST_80057]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which storage threat is specifically addressed by integrity controls such as hashing or digital signatures on stored objects?',
    options: opts4(
      'Unauthorized modification or tampering of data',
      'Slow query performance',
      'High egress costs',
      'License non-compliance'
    ),
    correct: ['a'],
    explanation: 'Hashes/signatures detect unauthorized modification, ensuring data integrity. Performance, cost, and licensing are separate concerns.',
    references: [REF_NIST_800209]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'An IRM solution restricts a downloaded report so it expires after 30 days. Which data-security objective is this enforcing?',
    options: opts4(
      'Persistent usage control over data after distribution',
      'Network segmentation',
      'Load balancing',
      'Container isolation'
    ),
    correct: ['a'],
    explanation: 'IRM enforces persistent, policy-based usage controls (expiration, copy/print limits) that travel with the data after distribution. The others are infrastructure controls.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 4, type: QType.SINGLE,
    stem: 'Which approach best balances confidentiality with the need to search encrypted data without fully decrypting it server-side?',
    options: opts4(
      'Store everything in plaintext for searchability',
      'Searchable/structured encryption or client-side index techniques',
      'Disable search entirely',
      'Hash all fields with MD5'
    ),
    correct: ['b'],
    explanation: 'Searchable/structured encryption (or client-side indexing) enables querying while keeping data encrypted server-side, trading some functionality/security for usability. Plaintext defeats confidentiality; MD5 hashing is not searchable encryption.',
    references: [REF_NIST_80057, REF_CSA_GUIDANCE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should backups of cloud data be encrypted with keys managed separately from the production system?',
    options: opts4(
      'To make backups smaller',
      'So a compromise of production keys does not automatically expose all backups',
      'To speed up restores',
      'To avoid the need for retention policies'
    ),
    correct: ['b'],
    explanation: 'Separate key management for backups limits blast radius: compromising production keys should not also decrypt offline backups. It does not reduce size, speed restores, or replace retention policies.',
    references: [REF_NIST_80057, REF_NIST_80034]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST description of "data dispersion" as a cloud storage protection?',
    options: opts4(
      'Encrypting and fragmenting data across multiple locations so no single store holds a usable copy',
      'Storing all data in one optimized region',
      'Compressing data before storage',
      'Caching data at the edge'
    ),
    correct: ['a'],
    explanation: 'Data dispersion encrypts and splits data into fragments distributed across locations, improving confidentiality and availability. Single-region storage, compression, and edge caching are different concepts.',
    references: [REF_NIST_800209, REF_CSA_GUIDANCE]
  },

  // ── Cloud Platform and Infrastructure Security (11) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which technique limits the blast radius of a compromised workload by tightly controlling traffic between individual workloads?',
    options: opts4('Micro-segmentation', 'Vertical scaling', 'DNS round robin', 'Thin provisioning'),
    correct: ['a'],
    explanation: 'Micro-segmentation enforces granular per-workload network policy, restricting lateral movement after compromise. Scaling, DNS round robin, and thin provisioning do not provide isolation.',
    references: [REF_NIST_800207]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'In a Type 1 (bare-metal) hypervisor design, what mainly distinguishes it from Type 2?',
    options: opts4(
      'It runs directly on the host hardware without a host OS',
      'It always runs inside a browser',
      'It cannot run more than one VM',
      'It requires no patching'
    ),
    correct: ['a'],
    explanation: 'A Type 1 hypervisor runs directly on hardware (no underlying host OS), generally offering a smaller attack surface than Type 2 which runs atop a host OS. It still requires patching and supports many VMs.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A region-wide outage occurs. Which BCDR design choice most directly supports continued service?',
    options: opts4(
      'Single-region deployment with daily backups',
      'Active-active or active-passive multi-region architecture with tested failover',
      'Storing backups only in the failed region',
      'Manual rebuild from documentation'
    ),
    correct: ['b'],
    explanation: 'Multi-region active-active/active-passive with tested failover keeps services available during a regional outage. Single-region designs and same-region backups fail with the region.',
    references: [REF_NIST_80034]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls appropriate for securing the cloud network plane.',
    options: opts4(
      'Security groups / network ACLs with least privilege',
      'Private endpoints / no public exposure for sensitive services',
      'TLS for data in transit',
      'A flat network with no segmentation for "simplicity"'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Least-privilege security groups/ACLs, private endpoints, and TLS are sound network controls. A flat, unsegmented network maximizes lateral movement risk and is an anti-pattern.',
    references: [REF_CSA_GUIDANCE, REF_NIST_800207]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which metric defines the maximum acceptable amount of data loss measured in time?',
    options: opts4('RTO', 'RPO', 'MTD', 'SLA'),
    correct: ['b'],
    explanation: 'RPO is the maximum acceptable data loss expressed as a time window. RTO is recovery time, MTD is maximum tolerable downtime, SLA is the service agreement.',
    references: [REF_NIST_80034]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is a hardware security module (HSM) often used in cloud key management?',
    options: opts4(
      'To accelerate web page rendering',
      'To generate, store, and use cryptographic keys in tamper-resistant hardware',
      'To replace network firewalls',
      'To compress storage volumes'
    ),
    correct: ['b'],
    explanation: 'HSMs provide tamper-resistant generation, storage, and use of keys, raising assurance and often supporting compliance. They are not rendering, firewall, or compression devices.',
    references: [REF_NIST_80057, REF_NIST_800209]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice best reduces risk from VM sprawl and orphaned cloud resources?',
    options: opts4(
      'Never decommissioning anything',
      'Automated inventory, tagging, and lifecycle/decommission policies',
      'Disabling logging on idle VMs',
      'Giving all users admin rights for convenience'
    ),
    correct: ['b'],
    explanation: 'Automated inventory, tagging, and lifecycle policies identify and retire unused resources, shrinking attack surface and cost. The other options increase risk.',
    references: [REF_CSA_CCM, REF_CCSP_OUTLINE]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Tested, documented failover procedures are necessary because untested BCDR plans may fail when actually invoked.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. BCDR plans must be exercised; untested procedures often fail under real conditions due to drift, missing dependencies, or unfamiliar steps.',
    references: [REF_NIST_80034]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A cloud host must prove its firmware/boot chain integrity to a remote verifier before joining the cluster. Which capability provides this?',
    options: opts4(
      'Remote attestation using a hardware root of trust/TPM',
      'A louder cooling fan',
      'A larger boot disk',
      'Disabling Secure Boot'
    ),
    correct: ['a'],
    explanation: 'Remote attestation backed by a TPM/hardware root of trust lets a verifier confirm boot/firmware integrity before trusting the host. Disabling Secure Boot would weaken integrity.',
    references: [REF_NIST_800209]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design most reduces the chance that a single compromised credential grants broad infrastructure access?',
    options: opts4(
      'A single shared admin account',
      'Least privilege with just-in-time elevation and short-lived credentials',
      'Permanent standing admin rights for the whole team',
      'Disabling MFA to reduce friction'
    ),
    correct: ['b'],
    explanation: 'Least privilege plus just-in-time, short-lived elevation limits what any single credential can do and for how long. Shared/standing admin and disabled MFA increase exposure.',
    references: [REF_NIST_800207, REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 4, type: QType.SINGLE,
    stem: 'A workload requires that even the cloud provider cannot inspect its memory while processing highly sensitive data. Which technology best addresses this?',
    options: opts4(
      'Confidential computing / trusted execution environments (TEE)',
      'Standard at-rest disk encryption',
      'A bigger instance type',
      'A faster network link'
    ),
    correct: ['a'],
    explanation: 'Confidential computing uses hardware-based TEEs to protect data in use, limiting even the provider/host from inspecting memory. At-rest encryption and resource sizing do not protect data in use.',
    references: [REF_CSA_GUIDANCE, REF_NIST_800209]
  },

  // ── Cloud Application Security (11) ──
  {
    domain: APP, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which testing approach exercises a running application from the outside to find exploitable issues?',
    options: opts4('SAST', 'DAST', 'SBOM generation', 'Unit testing of pure functions'),
    correct: ['b'],
    explanation: 'DAST tests the running application externally for exploitable behavior. SAST analyzes code statically; SBOM lists components; unit tests verify logic, not exploitability.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Where should application secrets (DB passwords, API keys) be stored for a cloud app?',
    options: opts4(
      'Hardcoded in source code',
      'In a managed secrets vault with access policies and rotation',
      'In a public S3 bucket for easy access',
      'In client-side JavaScript'
    ),
    correct: ['b'],
    explanation: 'Secrets belong in a managed vault with tight access policies and rotation, injected at runtime. Hardcoding, public buckets, and client-side exposure leak credentials.',
    references: [REF_NIST_800218, REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control most directly mitigates injection attacks (e.g., SQL injection) in a cloud application?',
    options: opts4(
      'Parameterized queries / strict input validation and output encoding',
      'Increasing instance memory',
      'Disabling TLS',
      'Adding more replicas'
    ),
    correct: ['a'],
    explanation: 'Parameterized queries plus input validation and output encoding prevent untrusted data from being interpreted as code. Scaling resources or disabling TLS does not address injection.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL activities that belong in a secure software development lifecycle for cloud apps.',
    options: opts4(
      'Threat modeling during design',
      'Automated SAST/DAST/SCA in the pipeline',
      'Security acceptance criteria and code review',
      'Granting every service account full admin to avoid permission errors'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Threat modeling, automated testing, and security review/acceptance criteria are core SSDLC practices. Over-privileged service accounts violate least privilege and increase risk.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the main security purpose of an API gateway in front of microservices?',
    options: opts4(
      'To compile microservice code',
      'To centralize authentication, authorization, throttling, and input validation',
      'To store the primary database',
      'To replace the CI/CD pipeline'
    ),
    correct: ['b'],
    explanation: 'An API gateway centralizes cross-cutting security concerns (authn/authz, rate limiting, validation) for downstream services. It is not a compiler, database, or pipeline.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact lists all components and dependencies in a software build to support vulnerability response?',
    options: opts4('Software Bill of Materials (SBOM)', 'SLA', 'BIA', 'DPA'),
    correct: ['a'],
    explanation: 'An SBOM enumerates components/dependencies so teams can quickly assess exposure to a newly disclosed vulnerability. SLA/BIA/DPA serve service, impact, and data-processing purposes.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'In federated identity, what does a relying party (service provider) trust the identity provider to do?',
    options: opts4(
      'Host the application database',
      'Authenticate the user and assert verified identity/attributes via signed tokens',
      'Provide the CDN',
      'Manage container orchestration'
    ),
    correct: ['b'],
    explanation: 'The relying party trusts the IdP to authenticate users and issue signed assertions/tokens about identity and attributes. It is not responsible for the app database, CDN, or orchestration.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'Validating and sanitizing all untrusted input is a foundational defense for cloud web applications.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Treating all external input as untrusted and validating/sanitizing it is foundational to preventing injection, XSS, and related attacks.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice best prevents shipping container images with known critical vulnerabilities?',
    options: opts4(
      'Only scanning images after a breach',
      'Automated image vulnerability scanning in the pipeline with a blocking policy',
      'Using the largest available base image',
      'Disabling registry authentication'
    ),
    correct: ['b'],
    explanation: 'Pipeline image scanning with a policy that blocks critical findings prevents vulnerable images from reaching production. Reactive scanning and weak registry controls fail to prevent issues.',
    references: [REF_NIST_800218, REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 4, type: QType.SINGLE,
    stem: 'A microservice should only access the one storage bucket it needs. Which IAM design principle does this reflect?',
    options: opts4(
      'Privilege escalation',
      'Least privilege via scoped, per-service roles',
      'Shared root credentials',
      'Implicit trust of all internal calls'
    ),
    correct: ['b'],
    explanation: 'Granting a service only the specific access it requires is least privilege using scoped roles, limiting blast radius if the service is compromised. The other options increase risk.',
    references: [REF_NIST_800207, REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should JWT access tokens used by cloud APIs be short-lived and validated on every request?',
    options: opts4(
      'To increase server CPU usage',
      'To limit the window of misuse if a token is leaked and to enforce current authorization',
      'To avoid using TLS',
      'To eliminate the need for an IdP'
    ),
    correct: ['b'],
    explanation: 'Short-lived tokens reduce the exploitation window if leaked, and per-request validation enforces current authorization and revocation. It is unrelated to TLS use or removing the IdP.',
    references: [REF_CSA_GUIDANCE, REF_NIST_800207]
  },

  // ── Cloud Security Operations (11) ──
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which activity correlates events across many cloud sources to detect potential incidents?',
    options: opts4(
      'SIEM event correlation',
      'Static code analysis',
      'Capacity forecasting',
      'Contract negotiation'
    ),
    correct: ['a'],
    explanation: 'SIEM correlation aggregates and analyzes events from many sources to surface potential incidents. The other activities are not detection functions.',
    references: [REF_NIST_80092]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During the Containment phase of incident response in the cloud, which action is most appropriate first?',
    options: opts4(
      'Publicly disclose the breach immediately',
      'Isolate affected resources (e.g., quarantine instances/network) to stop spread while preserving evidence',
      'Delete all logs to prevent attacker insight',
      'Ignore it until the next maintenance window'
    ),
    correct: ['b'],
    explanation: 'Containment focuses on isolating affected resources to limit spread while preserving evidence. Deleting logs destroys evidence; premature disclosure and delay are inappropriate.',
    references: [REF_NIST_80061, REF_NIST_80086]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST reason to centralize cloud logs into a dedicated, access-controlled account/project?',
    options: opts4(
      'To make logs editable by anyone',
      'To protect log integrity and availability even if a workload account is compromised',
      'To reduce the need for time synchronization',
      'To avoid retention requirements'
    ),
    correct: ['b'],
    explanation: 'A separate, locked-down logging account preserves log integrity/availability if a workload account is breached, supporting reliable investigation. It does not remove time-sync or retention needs.',
    references: [REF_NIST_80092]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that improve cloud incident readiness.',
    options: opts4(
      'Pre-defined roles, contacts, and escalation paths',
      'Tested runbooks and tabletop exercises',
      'Automated evidence capture (snapshots, log export)',
      'No prior planning to "stay flexible"'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Defined roles/contacts, tested runbooks/tabletops, and automated evidence capture all strengthen readiness. "No planning" undermines an effective response.',
    references: [REF_NIST_80061]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is a key forensic consideration unique to ephemeral cloud compute?',
    options: opts4(
      'Instances may be terminated quickly, so volatile data and snapshots must be captured rapidly',
      'Cloud instances never produce logs',
      'Time stamps are irrelevant in the cloud',
      'Evidence cannot be collected from cloud at all'
    ),
    correct: ['a'],
    explanation: 'Ephemeral instances can disappear quickly, so responders must rapidly snapshot volumes and export volatile data/logs. Cloud instances do log, timestamps matter, and evidence can be collected.',
    references: [REF_NIST_80086]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which process ensures emergency fixes are still reviewed and documented after rapid deployment?',
    options: opts4(
      'Emergency change management with post-implementation review',
      'Skipping change records for speed',
      'Marketing approval',
      'Capacity planning'
    ),
    correct: ['a'],
    explanation: 'Emergency change management permits rapid action but mandates retrospective review and documentation to maintain control and traceability. Skipping records breaks governance.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability detects insecure cloud configurations (e.g., public storage buckets) continuously?',
    options: opts4(
      'Cloud Security Posture Management (CSPM)',
      'A load balancer',
      'A message queue',
      'A CDN'
    ),
    correct: ['a'],
    explanation: 'CSPM continuously evaluates cloud configuration against policy/benchmarks and flags misconfigurations like public buckets. Load balancers, queues, and CDNs do not perform posture assessment.',
    references: [REF_CSA_CCM, REF_CSA_GUIDANCE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Vulnerability management in the cloud should include both provider-managed components (within their scope) and customer-managed components.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Under shared responsibility, the provider patches what it manages and the customer must patch its OS/apps/config; both must be covered for effective vulnerability management.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST way to validate that backups can actually restore service within the RTO?',
    options: opts4(
      'Assume backups work because the job reported success',
      'Perform periodic restore tests/DR exercises and measure recovery time',
      'Only test after a real disaster',
      'Disable backup monitoring'
    ),
    correct: ['b'],
    explanation: 'Regular restore tests and DR exercises verify recoverability and that RTO can be met. Backup job success alone does not prove a usable restore.',
    references: [REF_NIST_80034]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A SOC must investigate across multiple cloud accounts. Which design most improves cross-account investigation?',
    options: opts4(
      'Independent, siloed logging per team with no aggregation',
      'Centralized log aggregation with consistent schema, retention, and time sync into the SIEM',
      'Verbal status updates only',
      'Deleting logs older than one day'
    ),
    correct: ['b'],
    explanation: 'Centralized, schema-consistent, time-synced log aggregation enables effective cross-account correlation and investigation. Siloed or short-lived logs hamper analysis.',
    references: [REF_NIST_80092, REF_NIST_80061]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why include "lessons learned" (post-incident activity) after a cloud incident?',
    options: opts4(
      'To assign blame to individuals',
      'To improve controls, detection, and response based on what occurred',
      'To delete all evidence',
      'To skip future incident handling'
    ),
    correct: ['b'],
    explanation: 'Post-incident review identifies improvements to controls, detection, and processes, strengthening future response. It is not for blame, evidence destruction, or skipping process.',
    references: [REF_NIST_80061]
  },

  // ── Legal, Risk and Compliance (8) ──
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which role processes personal data only on documented instructions from another party under the GDPR?',
    options: opts4('Data controller', 'Data processor', 'Data subject', 'Data protection authority'),
    correct: ['b'],
    explanation: 'The data processor processes personal data on behalf of and per the instructions of the controller. The controller decides purposes/means; the subject is the individual; the DPA regulates.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which independent assurance artifact reports on the operating effectiveness of a provider\'s security controls over a period of time?',
    options: opts4('SOC 2 Type II', 'SOC 3 logo', 'SOC 1 Type I', 'Internal audit memo'),
    correct: ['a'],
    explanation: 'SOC 2 Type II evaluates control design and operating effectiveness over a period. SOC 3 is a general-use summary, SOC 1 covers financial controls, and an internal memo is not independent.',
    references: [REF_CSA_STAR]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.SINGLE,
    stem: 'A contract clause requires the provider to notify the customer of a personal-data breach within a defined time. This primarily supports which obligation?',
    options: opts4(
      'Marketing transparency',
      'Regulatory breach-notification compliance (e.g., GDPR timelines)',
      'Capacity planning',
      'Software licensing'
    ),
    correct: ['b'],
    explanation: 'Timely provider breach notification enables the customer (controller) to meet legal breach-reporting deadlines. It is unrelated to marketing, capacity, or licensing.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are recognized risk treatment options.',
    options: opts4(
      'Mitigate (reduce)',
      'Transfer/share',
      'Avoid',
      'Conceal the risk from stakeholders'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Recognized treatments are mitigate, transfer/share, avoid, and accept. Concealing risk from stakeholders is not a valid treatment and is unethical.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which assessment quantifies the consequence of disruptions to prioritize recovery of critical processes?',
    options: opts4('Business Impact Analysis (BIA)', 'Penetration test', 'Code review', 'SLA'),
    correct: ['a'],
    explanation: 'A BIA identifies critical processes and the impact of their disruption, informing RTO/RPO and recovery prioritization. Pen tests, code reviews, and SLAs serve different goals.',
    references: [REF_NIST_80034]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.SINGLE,
    stem: 'When a contract ends, which provision most protects the customer from data being retained or stranded at the provider?',
    options: opts4(
      'Secure data return and verified deletion / portability on termination',
      'A confidentiality clause only',
      'A price-escalation clause',
      'An exclusivity clause'
    ),
    correct: ['a'],
    explanation: 'Exit provisions for secure data return, portability, and verified deletion protect the customer against data being stranded or improperly retained. Confidentiality/pricing/exclusivity clauses do not address this.',
    references: [REF_CCSP_OUTLINE, REF_CSA_CCM]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A right-to-audit clause or access to third-party assurance reports helps a customer verify provider compliance.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Right-to-audit or access to independent assurance (e.g., SOC 2, ISO 27001 certificates) lets customers gain assurance over provider controls without on-site audits in many cases.',
    references: [REF_CSA_STAR]
  },
  {
    domain: LEGAL, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer must demonstrate provider control coverage against several regulations efficiently. Which resource best supports this mapping?',
    options: opts4(
      'CSA STAR registry entries based on the Cloud Controls Matrix',
      'A provider press release',
      'The application changelog',
      'The marketing landing page'
    ),
    correct: ['a'],
    explanation: 'CSA STAR entries (built on the CCM, which maps to many standards/regulations) provide structured, comparable assurance information for provider assessment. Press releases and changelogs are not assurance artifacts.',
    references: [REF_CSA_STAR, REF_CSA_CCM]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Cloud Concepts, Architecture and Design (11) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which cloud service model gives the customer the most control over the operating system and runtime?',
    options: opts4('SaaS', 'PaaS', 'IaaS', 'FaaS'),
    correct: ['c'],
    explanation: 'IaaS exposes virtualized compute/storage/network, leaving OS and runtime to the customer — the most low-level control among the listed models. PaaS/SaaS/FaaS abstract more away.',
    references: [REF_NIST_800145, REF_NIST_500292]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Resource pooling in cloud computing primarily relies on which underlying capability?',
    options: opts4(
      'Multi-tenancy and virtualization that abstract and share physical resources',
      'Dedicated single-tenant hardware for every customer',
      'Manual provisioning by operators',
      'Eliminating all monitoring'
    ),
    correct: ['a'],
    explanation: 'Resource pooling uses multi-tenant virtualization to abstract and dynamically assign shared physical resources. Dedicated hardware per customer and manual provisioning contradict pooling.',
    references: [REF_NIST_800145]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which scenario best illustrates "broad network access"?',
    options: opts4(
      'Service is reachable only from one physical terminal',
      'Capabilities are available over the network and accessed via standard mechanisms from diverse client devices',
      'Resources require manual operator setup',
      'Billing is fixed regardless of use'
    ),
    correct: ['b'],
    explanation: 'Broad network access means capabilities are available over the network and accessed through standard mechanisms by heterogeneous clients (phones, laptops, etc.). The other options contradict that characteristic.',
    references: [REF_NIST_800145]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which NIST SP 500-292 actor provides connectivity and transport of cloud services between consumers and providers?',
    options: opts4('Cloud Auditor', 'Cloud Broker', 'Cloud Carrier', 'Cloud Consumer'),
    correct: ['c'],
    explanation: 'The Cloud Carrier provides connectivity/transport between consumer and provider. The auditor assesses, the broker intermediates, and the consumer uses services.',
    references: [REF_NIST_500292]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accurate statements about hybrid cloud designs.',
    options: opts4(
      'They combine two or more distinct cloud infrastructures bound by technology enabling portability',
      'They can support cloud bursting for peak demand',
      'They introduce additional integration and consistent-policy challenges',
      'They inherently remove all customer security responsibility'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Hybrid clouds combine distinct infrastructures with portability, can support bursting, and add integration/policy-consistency challenges. They do not remove customer security responsibility.',
    references: [REF_NIST_800145, REF_CSA_GUIDANCE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is "security by design" emphasized when architecting cloud solutions?',
    options: opts4(
      'It is cheaper to add controls only after a breach',
      'Embedding security requirements from the start reduces rework, gaps, and risk later',
      'It removes the need for the shared responsibility model',
      'It guarantees compliance automatically'
    ),
    correct: ['b'],
    explanation: 'Designing security in from the outset reduces costly rework and security gaps and aligns controls with requirements. It does not eliminate shared responsibility or auto-guarantee compliance.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800218]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A managed database service where the provider runs the engine, patching, and backups, while the customer manages schemas and data, is an example of:',
    options: opts4('IaaS', 'PaaS (managed service)', 'On-premises', 'Colocation'),
    correct: ['b'],
    explanation: 'A managed database is a PaaS-style offering: provider handles engine/patching/backups; customer manages schema/data/access. It is neither raw IaaS nor on-prem/colocation.',
    references: [REF_NIST_800145, REF_CSA_GUIDANCE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Interoperability allows components/services from different providers to work together, supporting portability and reducing lock-in.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Interoperability (often via open standards/APIs) lets components from different providers work together, supporting portability and mitigating lock-in.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best supports a zero trust architecture in a cloud design?',
    options: opts4(
      'Implicit trust for anything inside the virtual network',
      'Continuous verification of identity and device with least-privilege, per-request authorization',
      'A single perimeter firewall as the only control',
      'Granting broad standing access to reduce friction'
    ),
    correct: ['b'],
    explanation: 'Zero trust assumes no implicit trust and continuously verifies identity/device with least-privilege, per-request authorization. Implicit internal trust and perimeter-only models contradict zero trust.',
    references: [REF_NIST_800207]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect must minimize lock-in for a data platform that may move providers. Which choice best supports this objective?',
    options: opts4(
      'Use proprietary, provider-only data formats and APIs everywhere',
      'Favor open formats, standardized APIs, and abstraction layers with documented export paths',
      'Avoid documenting any data flows',
      'Store data only in a provider-specific service with no export'
    ),
    correct: ['b'],
    explanation: 'Open formats, standard APIs, abstraction, and clear export paths reduce migration cost and lock-in. Proprietary-only formats with no export maximize lock-in.',
    references: [REF_CSA_GUIDANCE, REF_CCSP_OUTLINE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST description of the cloud "shared responsibility model"?',
    options: opts4(
      'The provider is responsible for all security in every model',
      'Security duties are divided between provider and customer, with the split varying by service model',
      'The customer is responsible for physical data center security in SaaS',
      'Responsibilities never change regardless of IaaS/PaaS/SaaS'
    ),
    correct: ['b'],
    explanation: 'Shared responsibility divides security duties between provider and customer, and the division shifts with the service model (more customer duty in IaaS, less in SaaS). Customers are not responsible for the provider\'s physical security.',
    references: [REF_CSA_GUIDANCE, REF_NIST_500292]
  },

  // ── Cloud Data Security (13) ──
  {
    domain: DATA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which lifecycle phase is concerned with securely rendering data unrecoverable at end of life?',
    options: opts4('Create', 'Store', 'Archive', 'Destroy'),
    correct: ['d'],
    explanation: 'The Destroy phase securely renders data unrecoverable (e.g., crypto-shredding in the cloud). Create/Store/Archive concern generation, persistence, and long-term retention.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the principal advantage of customer-managed keys (CMK) over provider-default encryption?',
    options: opts4(
      'It removes the need to encrypt data',
      'The customer controls key lifecycle and access, reducing provider ability to decrypt data',
      'It makes encryption faster',
      'It eliminates key rotation requirements'
    ),
    correct: ['b'],
    explanation: 'CMK gives the customer control over key generation, rotation, and access policies, limiting the provider\'s ability to decrypt data. It does not remove encryption or rotation needs.',
    references: [REF_NIST_80057]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which scenario most strongly argues for client-side encryption before uploading to cloud object storage?',
    options: opts4(
      'The customer must ensure the provider can never access plaintext',
      'The customer wants the provider to manage everything including keys',
      'The data is already public',
      'Performance is the only concern'
    ),
    correct: ['a'],
    explanation: 'Client-side encryption with customer-held keys ensures the provider only ever stores ciphertext and cannot access plaintext. If the provider manages keys or data is public, this requirement does not apply.',
    references: [REF_NIST_80057, REF_NIST_800111]
  },
  {
    domain: DATA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accurate statements about DLP in the cloud.',
    options: opts4(
      'It can inspect data at rest, in motion, and in use',
      'It can enforce policy actions like block, quarantine, or alert',
      'Cloud-delivered DLP can cover SaaS via API or inline modes',
      'DLP eliminates the need for data classification'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DLP covers data at rest/in motion/in use, can block/quarantine/alert, and integrates with SaaS via API/inline modes. It complements—does not replace—classification, which DLP relies on.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST definition of pseudonymization?',
    options: opts4(
      'Irreversibly removing any ability to identify individuals',
      'Replacing identifiers so data cannot be attributed to a person without additional separately kept information',
      'Compressing personal data',
      'Encrypting only the database backups'
    ),
    correct: ['b'],
    explanation: 'Pseudonymization replaces identifiers so re-identification requires separately held additional information. It differs from irreversible anonymization, compression, or backup-only encryption.',
    references: [REF_NIST_800122, REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which key-management failure most directly causes permanent data loss in an encrypt-everything design?',
    options: opts4(
      'Rotating keys on schedule',
      'Loss or premature destruction of the only decryption keys without escrow/backup',
      'Using an HSM',
      'Logging key usage'
    ),
    correct: ['b'],
    explanation: 'If the sole decryption keys are lost or destroyed with no escrow/backup, the ciphertext is unrecoverable—permanent data loss. Rotation, HSM use, and logging are sound practices.',
    references: [REF_NIST_80057]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control best ensures records subject to legal hold are not deleted by automated retention policies?',
    options: opts4(
      'A legal hold/immutability flag overriding lifecycle expiration',
      'A faster instance type',
      'A new CDN endpoint',
      'Reducing replication'
    ),
    correct: ['a'],
    explanation: 'A legal hold/immutability (WORM) setting overrides lifecycle expiration so data under hold is preserved. Compute/CDN/replication changes do not enforce legal holds.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800209]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Tokenization and encryption are identical because both make data unreadable.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['b'],
    explanation: 'False. Encryption mathematically transforms data using keys; tokenization substitutes a surrogate value with the real value stored separately. They differ in mechanism, scope reduction, and reversibility model.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which storage-security objective is primarily served by versioning plus immutability on critical cloud objects?',
    options: opts4(
      'Protecting against accidental or malicious deletion/modification (e.g., ransomware)',
      'Reducing CPU usage',
      'Improving font rendering',
      'Lowering DNS latency'
    ),
    correct: ['a'],
    explanation: 'Versioning with immutability/WORM protects integrity and availability against accidental or malicious deletion/modification, aiding ransomware resilience. The other options are unrelated.',
    references: [REF_NIST_800209]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best supports the "Share" phase of the data lifecycle while maintaining control?',
    options: opts4(
      'Email the file with no controls',
      'Use IRM/secure sharing with access policies, expiration, and audit',
      'Disable all logging during sharing',
      'Post the data publicly'
    ),
    correct: ['b'],
    explanation: 'Secure sharing via IRM with access policies, expiration, and audit maintains control during the Share phase. Uncontrolled email or public posting loses control; disabling logs reduces accountability.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: DATA, difficulty: 4, type: QType.SINGLE,
    stem: 'A multinational must keep certain personal data within a specific country. Which combination of controls best enforces this at the data layer?',
    options: opts4(
      'Region-pinned storage with policy controls plus encryption and access restrictions tied to location',
      'A single global bucket with no region constraint',
      'Client-side caching only',
      'Disabling encryption to simplify replication'
    ),
    correct: ['a'],
    explanation: 'Pinning storage to the required region with policy enforcement, plus encryption and location-aware access controls, supports data-residency obligations. Global, unconstrained storage or disabled encryption undermines them.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800209]
  },
  {
    domain: DATA, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is separating encryption keys from the encrypted data across trust boundaries important in cloud designs?',
    options: opts4(
      'It compresses the data',
      'A breach of the data store alone does not yield the keys needed to decrypt it',
      'It speeds up queries',
      'It removes the need for access control'
    ),
    correct: ['b'],
    explanation: 'Keeping keys separate from ciphertext (different trust boundary/KMS) means compromising the data store alone does not expose plaintext. It is not about compression, speed, or replacing access control.',
    references: [REF_NIST_80057, REF_CSA_GUIDANCE]
  },
  {
    domain: DATA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST first step when defining cloud data retention requirements?',
    options: opts4(
      'Pick the cheapest storage tier',
      'Identify legal, regulatory, and business retention obligations by data type',
      'Delete all data after one week',
      'Encrypt then ignore retention'
    ),
    correct: ['b'],
    explanation: 'Retention schedules must be derived from legal, regulatory, and business requirements per data type before configuring storage. Cost or arbitrary deletion should not drive retention.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800122]
  },

  // ── Cloud Platform and Infrastructure Security (11) ──
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the primary security concern of the hypervisor in multi-tenant cloud?',
    options: opts4(
      'Maintaining strong isolation between tenant VMs',
      'Choosing a web font',
      'Optimizing marketing spend',
      'Selecting a CDN provider'
    ),
    correct: ['a'],
    explanation: 'The hypervisor must enforce strong isolation between tenant VMs to prevent cross-tenant attacks (e.g., VM escape). The other options are unrelated to hypervisor security.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control most directly enforces least privilege at the cloud network layer?',
    options: opts4(
      'Default-allow firewall rules',
      'Restrictive security groups/NACLs permitting only required ports/sources',
      'A single flat subnet for all workloads',
      'Public IPs for every instance'
    ),
    correct: ['b'],
    explanation: 'Restrictive security groups/NACLs that permit only required ports/sources enforce least privilege on the network. Default-allow rules, flat subnets, and universal public IPs do the opposite.',
    references: [REF_NIST_800207, REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization needs to recover a critical service within 1 hour after a zone failure. Which design best meets this RTO?',
    options: opts4(
      'Cold standby requiring manual rebuild over several hours',
      'Warm/hot standby in another zone with automated or rapid failover',
      'Backups stored only in the failed zone',
      'No DR plan'
    ),
    correct: ['b'],
    explanation: 'A warm/hot standby in another zone with rapid/automated failover can meet a 1-hour RTO. Cold standby with manual rebuild and same-zone-only backups will not.',
    references: [REF_NIST_80034]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that strengthen cloud datacenter/infrastructure resilience.',
    options: opts4(
      'Multi-AZ/region redundancy with tested failover',
      'Redundant power, cooling, and network paths',
      'Regular DR exercises and runbooks',
      'Single shared admin credential for speed'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Redundancy across zones/regions, redundant facilities, and tested DR strengthen resilience. A single shared admin credential is a security weakness, not resilience.',
    references: [REF_NIST_80034, REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the role of a bastion/jump host in cloud infrastructure security?',
    options: opts4(
      'A public web server for customers',
      'A hardened, monitored entry point that brokers administrative access to private resources',
      'A database replica',
      'A CDN edge cache'
    ),
    correct: ['b'],
    explanation: 'A bastion/jump host is a hardened, monitored gateway that brokers and logs admin access to otherwise private resources, reducing exposure. It is not a public web/db/CDN component.',
    references: [REF_NIST_800207, REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best mitigates the risk that a noisy or compromised tenant impacts others on shared infrastructure?',
    options: opts4(
      'Removing all resource quotas',
      'Strong isolation plus resource quotas/limits and monitoring per tenant',
      'Sharing one network with no segmentation',
      'Disabling logging to save resources'
    ),
    correct: ['b'],
    explanation: 'Strong isolation with per-tenant quotas/limits and monitoring contains the impact of a noisy or compromised tenant. Removing quotas, flat networks, and disabled logging increase risk.',
    references: [REF_CSA_GUIDANCE]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST reason to use immutable infrastructure for cloud hosts?',
    options: opts4(
      'It allows ad-hoc manual changes anytime',
      'It eliminates configuration drift by replacing rather than modifying instances',
      'It removes the need for patching entirely',
      'It disables monitoring'
    ),
    correct: ['b'],
    explanation: 'Immutable infrastructure replaces instances from versioned, hardened images, eliminating drift and ensuring consistent, patched configurations. Patching still occurs—via new images—and monitoring remains.',
    references: [REF_CSA_GUIDANCE, REF_NIST_800218]
  },
  {
    domain: INFRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Placing sensitive backend services on private subnets without public IPs reduces their internet-facing attack surface.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Private subnets without public IPs remove direct internet exposure, reducing attack surface; access is brokered via controlled paths (bastion, private endpoints, VPN).',
    references: [REF_NIST_800207]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability provides assurance that a cloud host\'s platform integrity can be verified before workloads are scheduled on it?',
    options: opts4(
      'Hardware root of trust with measured boot and remote attestation',
      'A bigger network interface',
      'More RAM',
      'Disabling Secure Boot'
    ),
    correct: ['a'],
    explanation: 'A hardware root of trust with measured boot and remote attestation lets the platform integrity be verified before scheduling sensitive workloads. Hardware sizing and disabling Secure Boot do not provide integrity assurance.',
    references: [REF_NIST_800209]
  },
  {
    domain: INFRA, difficulty: 4, type: QType.SINGLE,
    stem: 'A critical workload must remain available even if an entire cloud region is lost, with minimal data loss. Which design best meets both goals?',
    options: opts4(
      'Single-region with hourly backups in the same region',
      'Multi-region active-active with synchronous or near-synchronous replication and tested failover',
      'A single large instance with local snapshots',
      'No replication to avoid cost'
    ),
    correct: ['b'],
    explanation: 'Multi-region active-active with synchronous/near-synchronous replication and tested failover provides regional fault tolerance with minimal RPO. Single-region or same-region backup designs fail when the region is lost.',
    references: [REF_NIST_80034]
  },
  {
    domain: INFRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST control to detect unauthorized changes to cloud infrastructure configuration?',
    options: opts4(
      'Manual quarterly reviews only',
      'Continuous configuration monitoring/CSPM with alerting and drift detection',
      'Trusting infrastructure-as-code without state checks',
      'Disabling API logging'
    ),
    correct: ['b'],
    explanation: 'Continuous configuration monitoring/CSPM with drift detection and alerting catches unauthorized changes promptly. Periodic manual reviews and disabled logging miss most drift.',
    references: [REF_CSA_CCM, REF_CSA_GUIDANCE]
  },

  // ── Cloud Application Security (11) ──
  {
    domain: APP, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which testing technique is best for finding vulnerabilities in third-party open-source dependencies?',
    options: opts4(
      'Software Composition Analysis (SCA)',
      'Manual UI testing',
      'Load testing',
      'A spelling check'
    ),
    correct: ['a'],
    explanation: 'SCA inventories and scans third-party/open-source dependencies for known vulnerabilities and license risks. UI/load testing and spell checks do not assess dependency security.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the BEST practice for handling secrets in container-based cloud apps?',
    options: opts4(
      'Bake secrets into the container image',
      'Inject secrets at runtime from a secrets manager with least-privilege access',
      'Print secrets to application logs for debugging',
      'Store secrets in environment variables committed to Git'
    ),
    correct: ['b'],
    explanation: 'Runtime injection from a secrets manager with least-privilege access avoids embedding secrets in images or source and supports rotation. Baking into images, logging, or committing secrets leaks them.',
    references: [REF_NIST_800218, REF_CSA_GUIDANCE]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which OWASP-style control most directly mitigates broken access control in a cloud API?',
    options: opts4(
      'Enforcing server-side authorization checks on every request/object',
      'Relying on client-side hiding of UI buttons',
      'Trusting the JWT without validating it',
      'Using HTTP instead of HTTPS'
    ),
    correct: ['a'],
    explanation: 'Server-side authorization on every request and object reference prevents broken access control (e.g., IDOR). Client-side hiding and unvalidated tokens are not real controls; HTTP weakens security.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800207]
  },
  {
    domain: APP, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that strengthen a secure CI/CD pipeline.',
    options: opts4(
      'Signing build artifacts and verifying signatures before deploy',
      'Least-privilege pipeline credentials and isolated build runners',
      'Automated security scanning gates (SAST/SCA/secret scanning)',
      'Allowing any developer to push directly to production without review'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Artifact signing/verification, least-privilege isolated runners, and automated security gates harden the pipeline (supply chain). Unreviewed direct-to-prod pushes remove critical controls.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST reason to validate input on the server side even if the client also validates it?',
    options: opts4(
      'Server validation is decorative',
      'Client-side checks can be bypassed, so the server must enforce security-relevant validation',
      'It reduces server cost',
      'It replaces authentication'
    ),
    correct: ['b'],
    explanation: 'Attackers can bypass client-side validation entirely, so security-relevant validation must be enforced server-side. It is not decorative, a cost measure, or a substitute for authentication.',
    references: [REF_CCSP_OUTLINE, REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which threat-modeling output most directly informs which security controls to build into an application?',
    options: opts4(
      'A prioritized list of threats and recommended mitigations',
      'The marketing roadmap',
      'The UI color palette',
      'The DNS TTL settings'
    ),
    correct: ['a'],
    explanation: 'Threat modeling produces a prioritized list of threats and mitigations that directly drives which controls to implement. The other items are unrelated to control selection.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about SAST and DAST is most accurate?',
    options: opts4(
      'They are redundant; only one is ever needed',
      'They are complementary: SAST finds code-level flaws early; DAST finds runtime/config flaws',
      'DAST analyzes source code without running it',
      'SAST requires a fully deployed production environment'
    ),
    correct: ['b'],
    explanation: 'SAST (static, code-level, early) and DAST (dynamic, runtime/config) are complementary and cover different defect classes. DAST runs the app; SAST does not require production.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 2, type: QType.SINGLE,
    stem: 'Using short-lived, automatically rotated credentials for service-to-service calls reduces the impact of credential leakage.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Short-lived, auto-rotated credentials limit the useful lifetime of a leaked secret, reducing the window an attacker can exploit it.',
    references: [REF_CSA_GUIDANCE, REF_NIST_800207]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design best prevents Server-Side Request Forgery (SSRF) impact in a cloud workload that fetches user-supplied URLs?',
    options: opts4(
      'Allow the app full access to the instance metadata endpoint',
      'Strict allow-listing of destinations and blocking access to internal/metadata endpoints',
      'Disabling TLS for outbound calls',
      'Trusting any URL the user provides'
    ),
    correct: ['b'],
    explanation: 'Allow-listing permitted destinations and blocking internal/metadata endpoints mitigates SSRF, which often targets cloud metadata services. Open access to metadata or trusting arbitrary URLs enables SSRF.',
    references: [REF_CSA_GUIDANCE, REF_CCSP_OUTLINE]
  },
  {
    domain: APP, difficulty: 4, type: QType.SINGLE,
    stem: 'A team wants assurance that only approved, unmodified code reaches production. Which combination best achieves this?',
    options: opts4(
      'Mandatory code review, signed commits/artifacts, and deployment from verified pipeline only',
      'Manual SCP of binaries from a laptop',
      'Allowing hotfixes directly on production hosts',
      'No version control'
    ),
    correct: ['a'],
    explanation: 'Code review, signed commits/artifacts, and deploying only from a verified pipeline establish integrity and provenance from commit to production. Manual copies and prod hotfixes break this chain.',
    references: [REF_NIST_800218]
  },
  {
    domain: APP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST way to protect a public-facing cloud web application from common layer-7 attacks such as injection and cross-site scripting?',
    options: opts4(
      'A Web Application Firewall (WAF) combined with secure coding and input validation',
      'Increasing the instance disk size',
      'Disabling logging to reduce noise',
      'Exposing the admin console publicly for convenience'
    ),
    correct: ['a'],
    explanation: 'A WAF provides layer-7 filtering of malicious requests and works as defense in depth alongside secure coding and input validation, which remain the primary controls. Disk size, disabled logging, and a public admin console do not mitigate these attacks and often worsen risk.',
    references: [REF_CCSP_OUTLINE, REF_CSA_GUIDANCE]
  },

  // ── Cloud Security Operations (11) ──
  {
    domain: OPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the primary purpose of centralized log management in cloud operations?',
    options: opts4(
      'To enable detection, investigation, and accountability across systems',
      'To increase storage cost intentionally',
      'To replace encryption',
      'To compile application code'
    ),
    correct: ['a'],
    explanation: 'Centralized log management supports detection, investigation, and accountability by consolidating events for analysis and retention. It is not a cost goal, encryption replacement, or build tool.',
    references: [REF_NIST_80092]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which NIST SP 800-61 phase includes identifying root cause and improving controls after an incident?',
    options: opts4(
      'Preparation',
      'Detection & Analysis',
      'Containment, Eradication & Recovery',
      'Post-Incident Activity'
    ),
    correct: ['d'],
    explanation: 'Post-Incident Activity (lessons learned) reviews root cause and drives control/process improvements. The other phases focus on readiness, detection, and stopping/removing the threat.',
    references: [REF_NIST_80061]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST reason to preserve a forensic snapshot before remediating a compromised cloud instance?',
    options: opts4(
      'To improve instance performance',
      'To maintain evidence integrity and chain of custody for investigation/legal use',
      'To reduce storage cost',
      'To skip the incident report'
    ),
    correct: ['b'],
    explanation: 'A snapshot taken before remediation preserves evidence and chain of custody for analysis and potential legal proceedings. It is not a performance or cost measure.',
    references: [REF_NIST_80086]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that support effective cloud change management.',
    options: opts4(
      'Documented change requests with risk assessment and approval',
      'Rollback plans and post-implementation review',
      'Segregation of duties between requester and approver where feasible',
      'Undocumented direct production edits for speed'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Documented requests with risk assessment/approval, rollback plans/PIR, and SoD strengthen change management. Undocumented direct prod edits defeat its purpose.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best maintains forensic readiness for short-lived cloud workloads?',
    options: opts4(
      'Hope the instance is still running when needed',
      'Automatically export logs and capture snapshots on alert/termination events',
      'Disable termination protection and logging',
      'Only collect evidence after legal demands it'
    ),
    correct: ['b'],
    explanation: 'Automated log export and snapshot capture triggered by alerts/termination ensures evidence survives ephemeral instances. Relying on hope or late collection loses volatile data.',
    references: [REF_NIST_80086, REF_NIST_80061]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice best ensures timely remediation of newly disclosed vulnerabilities in customer-managed cloud components?',
    options: opts4(
      'A defined patch/vulnerability management process with SLAs and prioritization by risk',
      'Patching only during annual maintenance',
      'Ignoring vendor advisories',
      'Disabling vulnerability scanning'
    ),
    correct: ['a'],
    explanation: 'A defined process with risk-based prioritization and remediation SLAs ensures timely patching of customer-managed components. Annual-only patching, ignoring advisories, or disabling scanning increases exposure.',
    references: [REF_CSA_GUIDANCE, REF_NIST_800218]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST description of the value of SOAR in cloud security operations?',
    options: opts4(
      'It eliminates the need for any analysts',
      'It orchestrates and automates repetitive response actions to speed and standardize handling',
      'It replaces all logging',
      'It is only a reporting dashboard'
    ),
    correct: ['b'],
    explanation: 'SOAR orchestrates and automates repetitive response steps (enrichment, containment) to accelerate and standardize handling while analysts focus on judgment. It does not remove analysts or replace logging.',
    references: [REF_NIST_80061, REF_NIST_80092]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Restore testing is unnecessary as long as backup jobs report success.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['b'],
    explanation: 'False. A successful backup job does not guarantee a usable restore; periodic restore/DR testing is required to validate recoverability and RTO.',
    references: [REF_NIST_80034]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST first action when a SIEM alert indicates likely credential compromise in a cloud account?',
    options: opts4(
      'Wait for the next business day',
      'Follow the IR playbook: contain by disabling/rotating the credential and investigate scope',
      'Delete all logs to be safe',
      'Email marketing for approval'
    ),
    correct: ['b'],
    explanation: 'The IR playbook should drive rapid containment (disable/rotate the credential) and scoping investigation while preserving evidence. Delay or deleting logs harms the response.',
    references: [REF_NIST_80061, REF_NIST_80086]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A provider restricts agent installation on a managed service. Which is the BEST way to retain security monitoring?',
    options: opts4(
      'Accept zero visibility',
      'Ingest provider-native audit/security logs and metrics into the SIEM and alert on anomalies',
      'Disable the service\'s native logging',
      'Rely solely on quarterly manual checks'
    ),
    correct: ['b'],
    explanation: 'Consuming provider-native audit/security telemetry into the SIEM preserves monitoring within shared responsibility when agents are not allowed. Zero visibility, disabled logs, or rare manual checks are inadequate.',
    references: [REF_NIST_80092, REF_CSA_GUIDANCE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which metric/process best demonstrates continuous improvement of a cloud security operations program?',
    options: opts4(
      'No measurement at all',
      'Tracking detection/response times and applying post-incident lessons to reduce them over time',
      'Counting marketing leads',
      'Measuring only server CPU'
    ),
    correct: ['b'],
    explanation: 'Tracking metrics like MTTD/MTTR and feeding post-incident lessons back to reduce them demonstrates continuous improvement. Marketing/CPU metrics or no measurement do not.',
    references: [REF_NIST_80061]
  },

  // ── Legal, Risk and Compliance (8) ──
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Under the GDPR, who is the natural person whose personal data is being processed?',
    options: opts4('Data controller', 'Data processor', 'Data subject', 'Supervisory authority'),
    correct: ['c'],
    explanation: 'The data subject is the identified or identifiable natural person whose personal data is processed. The controller decides purposes/means, the processor acts for the controller, and the supervisory authority regulates.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which audit report is intended for general distribution as a high-level summary of a provider\'s controls?',
    options: opts4('SOC 1 Type II', 'SOC 2 Type II', 'SOC 3', 'A private penetration test report'),
    correct: ['c'],
    explanation: 'SOC 3 is a general-use summary report. SOC 1 covers financial-reporting controls, SOC 2 Type II is a detailed restricted report, and a pen-test report is not a SOC assurance artifact.',
    references: [REF_CSA_STAR]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which contractual element most directly addresses where customer data may be physically stored and processed?',
    options: opts4(
      'Data location/sovereignty and sub-processor clauses',
      'Payment terms',
      'Logo usage rights',
      'Office hours'
    ),
    correct: ['a'],
    explanation: 'Data location/sovereignty and sub-processor clauses govern where and by whom data may be stored/processed, supporting jurisdictional compliance. Payment, branding, and hours are unrelated.',
    references: [REF_CCSP_OUTLINE, REF_CSA_CCM]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that belong in a cloud risk management program.',
    options: opts4(
      'Risk identification and assessment of cloud-specific threats',
      'Documented risk treatment decisions and owners',
      'Ongoing monitoring and periodic reassessment',
      'Hiding residual risk from leadership'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Identification/assessment, documented treatment with owners, and ongoing monitoring/reassessment are core risk-program elements. Hiding residual risk undermines governance and accountability.',
    references: [REF_CCSP_OUTLINE, REF_CSA_CCM]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes "residual risk"?',
    options: opts4(
      'Risk before any controls are applied',
      'Risk remaining after controls/treatment have been applied',
      'Risk that can never be measured',
      'Risk owned solely by the provider'
    ),
    correct: ['b'],
    explanation: 'Residual risk is what remains after controls and treatments are applied; it must be accepted by an appropriate risk owner. Inherent risk is before controls.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 3, type: QType.SINGLE,
    stem: 'A provider will not permit on-site customer audits. Which is the BEST alternative for compliance assurance?',
    options: opts4(
      'Accept no assurance',
      'Review independent third-party assurance reports (e.g., SOC 2 Type II, ISO 27001 certification, CSA STAR)',
      'Rely only on the provider\'s marketing claims',
      'Cancel all compliance requirements'
    ),
    correct: ['b'],
    explanation: 'Independent third-party assurance reports/certifications provide credible compliance evidence when direct audits are not feasible. Marketing claims are not assurance, and dropping requirements is not acceptable.',
    references: [REF_CSA_STAR, REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 2, type: QType.SINGLE,
    stem: 'e-Discovery obligations may require a cloud customer to preserve and produce relevant electronically stored information held by its provider.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'True. Legal e-discovery can require preservation (legal hold) and production of relevant ESI even when it resides with a cloud provider; contracts should enable this.',
    references: [REF_CCSP_OUTLINE]
  },
  {
    domain: LEGAL, difficulty: 4, type: QType.SINGLE,
    stem: 'Which is the BEST description of how the shared responsibility model interacts with legal accountability for personal data?',
    options: opts4(
      'Using a processor transfers the controller\'s legal accountability entirely',
      'Operational duties are shared, but the controller generally retains legal accountability for personal data',
      'The provider is always the controller',
      'Accountability disappears in the cloud'
    ),
    correct: ['b'],
    explanation: 'Shared responsibility allocates operational duties, but legal accountability for personal data generally stays with the controller (customer); the processor has its own obligations but does not absorb the controller\'s accountability.',
    references: [REF_CCSP_OUTLINE, REF_CSA_GUIDANCE]
  }
];

const CCSP_DOMAINS = [
  { name: CONCEPTS, weight: 17 },
  { name: DATA, weight: 20 },
  { name: INFRA, weight: 17 },
  { name: APP, weight: 17 },
  { name: OPS, weight: 16 },
  { name: LEGAL, weight: 13 }
];

const CCSP_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'isc2-ccsp-p1',
    code: 'CCSP-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 240-minute, 65-question, blueprint-weighted set covering cloud concepts/architecture/design, cloud data security, cloud platform & infrastructure security, cloud application security, cloud security operations, and legal/risk/compliance.',
    questions: P1
  },
  {
    slug: 'isc2-ccsp-p2',
    code: 'CCSP-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 240-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'isc2-ccsp-p3',
    code: 'CCSP-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 240-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const CCSP_BUNDLE = {
  slug: 'isc2-ccsp',
  title: 'ISC2 CCSP',
  description: 'All 3 CCSP practice exams in one bundle — covering cloud concepts/architecture/design, cloud data security, cloud platform & infrastructure security, cloud application security, cloud security operations, and legal/risk/compliance, aligned to the ISC2 CCSP exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 59900 // USD 599 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the ISC2 CCSP bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:ccsp-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedCcsp(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'isc2' } });
  await db.vendor.upsert({
    where: { slug: 'isc2' },
    update: { name: 'ISC2', description: 'Information security certifications including CISSP and the Certified Cloud Security Professional (CCSP).' },
    create: { slug: 'isc2', name: 'ISC2', description: 'Information security certifications including CISSP and the Certified Cloud Security Professional (CCSP).' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'isc2' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of CCSP_EXAMS) {
    const title = `ISC2 CCSP — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the ISC2 CCSP exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 240,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: CCSP_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:ccsp-seed' } });
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
          generatedBy: 'manual:ccsp-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: CCSP_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CCSP_BUNDLE.slug },
    update: {
      title: CCSP_BUNDLE.title,
      description: CCSP_BUNDLE.description,
      price: CCSP_BUNDLE.price,
      priceVoucher: CCSP_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: CCSP_BUNDLE.slug,
      title: CCSP_BUNDLE.title,
      description: CCSP_BUNDLE.description,
      price: CCSP_BUNDLE.price,
      priceVoucher: CCSP_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'isc2-ccsp-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'isc2-ccsp-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'isc2-ccsp-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'isc2-ccsp-p1', tier: 'VOUCHER' as const, position: 4 }
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
