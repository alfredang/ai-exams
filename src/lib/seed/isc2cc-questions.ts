/**
 * ISC2 Certified in Cybersecurity (CC) bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:isc2cc-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedIsc2Cc(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/isc2cc.ts`) and the protected
 * admin API (`/api/admin/seed-isc2cc`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is original, scenario-based, and authored against the
 * public ISC2 Certified in Cybersecurity (CC) Exam Outline and
 * foundational security concepts (NIST, ISC2 study material). These are
 * NOT real exam items and make no claim to mirror live exam content.
 * Blueprint domain weighting:
 *   - Security Principles                                          — 26% (17/65)
 *   - Access Controls Concepts                                     — 22% (14/65)
 *   - Network Security                                             — 24% (16/65)
 *   - Security Operations                                          — 18% (12/65)
 *   - Business Continuity, Disaster Recovery and Incident Response  — 10% (6/65)
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

const SP = 'Security Principles';
const BCDR = 'Business Continuity, Disaster Recovery and Incident Response';
const AC = 'Access Controls Concepts';
const NS = 'Network Security';
const SO = 'Security Operations';

const REF_OUTLINE = { label: 'ISC2 — Certified in Cybersecurity (CC) Exam Outline', url: 'https://www.isc2.org/certifications/cc/cc-certification-exam-outline' };
const REF_CIA = { label: 'NIST — Glossary: confidentiality, integrity, availability', url: 'https://csrc.nist.gov/glossary' };
const REF_RMF = { label: 'NIST SP 800-37 — Risk Management Framework', url: 'https://csrc.nist.gov/pubs/sp/800/37/r2/final' };
const REF_RISK = { label: 'NIST SP 800-30 — Guide for Conducting Risk Assessments', url: 'https://csrc.nist.gov/pubs/sp/800/30/r1/final' };
const REF_AC = { label: 'NIST SP 800-162 — Attribute Based Access Control (ABAC)', url: 'https://csrc.nist.gov/pubs/sp/800/162/upd1/final' };
const REF_RBAC = { label: 'NIST — Role Based Access Control (RBAC)', url: 'https://csrc.nist.gov/projects/role-based-access-control' };
const REF_IDENT = { label: 'NIST SP 800-63 — Digital Identity Guidelines', url: 'https://pages.nist.gov/800-63-3/' };
const REF_INCIDENT = { label: 'NIST SP 800-61 — Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' };
const REF_CP = { label: 'NIST SP 800-34 — Contingency Planning Guide', url: 'https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final' };
const REF_NET = { label: 'NIST SP 800-41 — Guidelines on Firewalls and Firewall Policy', url: 'https://csrc.nist.gov/pubs/sp/800/41/r1/final' };
const REF_WIFI = { label: 'NIST SP 800-153 — Guidelines for Securing Wireless LANs', url: 'https://csrc.nist.gov/pubs/sp/800/153/final' };
const REF_VPN = { label: 'NIST — Glossary: virtual private network (VPN)', url: 'https://csrc.nist.gov/glossary/term/virtual_private_network' };
const REF_CRYPTO = { label: 'NIST SP 800-175B — Guideline for Using Cryptographic Standards', url: 'https://csrc.nist.gov/pubs/sp/800/175/b/r1/final' };
const REF_MALWARE = { label: 'NIST SP 800-83 — Guide to Malware Incident Prevention and Handling', url: 'https://csrc.nist.gov/pubs/sp/800/83/r1/final' };
const REF_PATCH = { label: 'NIST SP 800-40 — Guide to Enterprise Patch Management Planning', url: 'https://csrc.nist.gov/pubs/sp/800/40/r4/final' };
const REF_LOG = { label: 'NIST SP 800-92 — Guide to Computer Security Log Management', url: 'https://csrc.nist.gov/pubs/sp/800/92/final' };
const REF_PHYS = { label: 'NIST SP 800-12 — An Introduction to Information Security', url: 'https://csrc.nist.gov/pubs/sp/800/12/r1/final' };
const REF_CONTROLS = { label: 'NIST SP 800-53 — Security and Privacy Controls', url: 'https://csrc.nist.gov/pubs/sp/800/53/r5/final' };
const REF_AUTH = { label: 'CISA — Multi-Factor Authentication', url: 'https://www.cisa.gov/secure-our-world/turn-mfa' };
const REF_PHISH = { label: 'CISA — Avoiding Social Engineering and Phishing Attacks', url: 'https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks' };
const REF_ZT = { label: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final' };
const REF_DDOS = { label: 'CISA — Understanding Denial-of-Service Attacks', url: 'https://www.cisa.gov/news-events/news/understanding-denial-service-attacks' };
const REF_OSI = { label: 'NIST — Glossary: OSI reference model', url: 'https://csrc.nist.gov/glossary' };
const REF_PRIVACY = { label: 'NIST Privacy Framework', url: 'https://www.nist.gov/privacy-framework' };
const REF_ETHICS = { label: 'ISC2 — Code of Ethics', url: 'https://www.isc2.org/ethics' };

// Helper to build 4-option questions with ids 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [
  { id: 'a', text: 'True' }, { id: 'b', text: 'False' },
  { id: 'c', text: 'Cannot be determined' }, { id: 'd', text: 'Only in regulated industries' }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Security Principles (17) ──
  {
    domain: SP, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A hospital encrypts patient records so that only authorized clinicians can read them. Which element of the CIA triad is this control primarily protecting?',
    options: opts4('Integrity', 'Confidentiality', 'Availability', 'Non-repudiation'),
    correct: ['b'],
    explanation: 'Encryption that restricts who can read data primarily protects confidentiality — preventing unauthorized disclosure. Integrity protects against unauthorized modification, and availability ensures access when needed.',
    references: [REF_CIA, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An online banking system uses a checksum and digital signatures so that any tampering with a transaction record is detectable. Which security objective does this best support?',
    options: opts4('Availability', 'Confidentiality', 'Integrity', 'Anonymity'),
    correct: ['c'],
    explanation: 'Checksums and digital signatures detect unauthorized or accidental modification of data, which is the definition of integrity in the CIA triad. They do not by themselves keep data secret or guarantee uptime.',
    references: [REF_CIA, REF_CRYPTO]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'A company keeps redundant servers and an offsite replica so the website stays reachable even if one data center fails. Which CIA triad component is the focus?',
    options: opts4('Confidentiality', 'Integrity', 'Availability', 'Authentication'),
    correct: ['c'],
    explanation: 'Redundancy and failover are designed so authorized users can reach systems and data when needed — that is the availability objective of the CIA triad.',
    references: [REF_CIA, REF_CP]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A user digitally signs an email with their private key. Later they deny having sent it. Which property prevents this denial?',
    options: opts4('Confidentiality', 'Non-repudiation', 'Availability', 'Least privilege'),
    correct: ['b'],
    explanation: 'Non-repudiation ensures a party cannot credibly deny an action. A digital signature created with the sender\'s private key binds the message to that signer, providing non-repudiation.',
    references: [REF_CRYPTO, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'During risk analysis, the team multiplies the probability of a flood by the expected dollar loss it would cause. What are they calculating?',
    options: opts4('Residual risk', 'Risk (likelihood × impact)', 'Risk appetite', 'A vulnerability score'),
    correct: ['b'],
    explanation: 'Risk is commonly expressed as a function of the likelihood (probability) of a threat exploiting a vulnerability and the impact (loss) if it occurs. Residual risk is what remains after controls are applied.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A small business decides to buy cyber-insurance to cover potential ransomware losses rather than build its own large reserve fund. Which risk treatment is this?',
    options: opts4('Risk avoidance', 'Risk acceptance', 'Risk transference', 'Risk mitigation'),
    correct: ['c'],
    explanation: 'Purchasing insurance shifts the financial impact of a risk to a third party — this is risk transference (or sharing). Avoidance stops the activity, acceptance takes on the risk, and mitigation reduces it with controls.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'After deploying anti-malware and user training, a firm still faces some chance of a successful phishing attack. What is the remaining exposure called?',
    options: opts4('Inherent risk', 'Residual risk', 'Risk appetite', 'Total risk'),
    correct: ['b'],
    explanation: 'Residual risk is the risk that remains after security controls have been applied. Inherent risk is the risk before controls; risk appetite is the amount of risk an organization is willing to accept.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL items that are components of the classic CIA triad.',
    options: opts4('Confidentiality', 'Integrity', 'Availability', 'Authorization'),
    correct: ['a', 'b', 'c'],
    explanation: 'The CIA triad is Confidentiality, Integrity, and Availability. Authorization is an access-control concept, not a member of the triad.',
    references: [REF_CIA, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization publishes a document stating that data must be encrypted in transit and that staff must complete annual security training. What type of governance document is this?',
    options: opts4('A procedure', 'A security policy', 'A baseline scan report', 'An audit log'),
    correct: ['b'],
    explanation: 'A security policy is a high-level management statement of required behavior and intent. Procedures give step-by-step instructions; baselines define minimum configurations; logs record events.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'A regulation requires a company to follow a specific data-protection law in every jurisdiction it operates. Which governance concept does this represent?',
    options: opts4('Risk appetite', 'Regulatory compliance', 'Defense in depth', 'Separation of duties'),
    correct: ['b'],
    explanation: 'Adhering to externally mandated laws, regulations, and standards is regulatory compliance. It is distinct from internal risk appetite or technical control strategies like defense in depth.',
    references: [REF_OUTLINE, REF_PRIVACY]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A network is protected by a firewall, intrusion detection, endpoint anti-malware, and user training, so a single failure does not expose the whole environment. Which principle is illustrated?',
    options: opts4('Least privilege', 'Defense in depth', 'Single point of failure', 'Security through obscurity'),
    correct: ['b'],
    explanation: 'Layering multiple, independent controls so the failure of one does not compromise the system is defense in depth (layered security). It increases the work an attacker must do.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: An ISC2 member who discovers a serious vulnerability should keep it secret indefinitely for personal advantage, according to the ISC2 Code of Ethics.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. The ISC2 Code of Ethics canons require acting honorably, honestly, and in the best interest of society and principals — exploiting findings for personal advantage violates these obligations.',
    references: [REF_ETHICS]
  },
  {
    domain: SP, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL of the four canons of the ISC2 Code of Ethics.',
    options: opts4(
      'Protect society, the common good, necessary public trust and confidence, and the infrastructure',
      'Act honorably, honestly, justly, responsibly, and legally',
      'Provide diligent and competent service to principals',
      'Maximize personal financial gain above all duties'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The ISC2 Code of Ethics has four canons: protect society/infrastructure; act honorably and legally; provide diligent service to principals; and advance and protect the profession. Maximizing personal gain is not a canon.',
    references: [REF_ETHICS]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A vulnerability is described as "a weakness in a system that could be exploited." In risk terms, what is the actor or event that could exploit it called?',
    options: opts4('A threat', 'A control', 'An asset', 'A baseline'),
    correct: ['a'],
    explanation: 'A threat is any circumstance or event (or actor) with the potential to exploit a vulnerability and cause harm to an asset. Controls reduce risk; assets are what is being protected.',
    references: [REF_RISK, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the relationship between privacy and confidentiality?',
    options: opts4(
      'They are identical terms.',
      'Privacy concerns an individual\'s right to control their personal information; confidentiality is the protection that limits disclosure of that information.',
      'Confidentiality only applies to government data.',
      'Privacy is purely a technical encryption setting.'
    ),
    correct: ['b'],
    explanation: 'Privacy is the right of individuals to control how their personal data is collected and used; confidentiality is a security objective that limits unauthorized disclosure and helps enforce privacy. They are related but not identical.',
    references: [REF_PRIVACY, REF_CIA]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization defines, in writing, the maximum amount of risk it is willing to accept in pursuit of its objectives. What is this called?',
    options: opts4('Residual risk', 'Risk appetite (risk tolerance)', 'Risk register', 'Risk avoidance'),
    correct: ['b'],
    explanation: 'Risk appetite (or risk tolerance) is the amount and type of risk an organization is willing to accept to meet its objectives. A risk register is a catalog of identified risks.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A new employee signs a document agreeing not to share company secrets even after leaving. Which control type best describes this agreement?',
    options: opts4('Technical control', 'Administrative (managerial) control', 'Physical control', 'Detective control'),
    correct: ['b'],
    explanation: 'Policies, agreements, and procedures such as a non-disclosure agreement are administrative (managerial) controls — they govern human behavior rather than enforcing it through technology or physical barriers.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },

  // ── Access Controls Concepts (14) ──
  {
    domain: AC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A help-desk technician is given only the permissions needed to reset passwords and nothing more. Which access-control principle is being applied?',
    options: opts4('Separation of duties', 'Least privilege', 'Defense in depth', 'Implicit allow'),
    correct: ['b'],
    explanation: 'Granting a user only the minimum access required to perform their job is the principle of least privilege. It limits damage from mistakes or compromised accounts.',
    references: [REF_AC, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'To prevent fraud, the person who requests a payment cannot also approve it. Which principle does this enforce?',
    options: opts4('Least privilege', 'Separation of duties', 'Single sign-on', 'Need to know'),
    correct: ['b'],
    explanation: 'Separation (segregation) of duties splits a sensitive task among multiple people so no single individual can complete it alone, reducing fraud and error.',
    references: [REF_AC, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'A user logs in with a password and then a one-time code from an authenticator app. Which authentication factors are combined?',
    options: opts4(
      'Something you know and something you have',
      'Something you are and something you know',
      'Somewhere you are and something you have',
      'Two instances of something you know'
    ),
    correct: ['a'],
    explanation: 'A password is "something you know"; a one-time code from a device/app is "something you have." Combining two different factor categories is multi-factor authentication.',
    references: [REF_AUTH, REF_IDENT]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'An access model assigns permissions to job roles such as "Nurse" or "Billing Clerk," and users inherit permissions by being placed in a role. Which model is this?',
    options: opts4('Discretionary Access Control (DAC)', 'Role-Based Access Control (RBAC)', 'Mandatory Access Control (MAC)', 'Rule-based filtering only'),
    correct: ['b'],
    explanation: 'Role-Based Access Control grants permissions to roles, and users receive permissions through role membership. This simplifies administration in organizations with well-defined job functions.',
    references: [REF_RBAC, REF_AC]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'In a system where the data owner can grant other users access to files they own at their own discretion, which access-control model is in use?',
    options: opts4('Mandatory Access Control (MAC)', 'Discretionary Access Control (DAC)', 'Role-Based Access Control (RBAC)', 'Attribute-Based Access Control (ABAC)'),
    correct: ['b'],
    explanation: 'Discretionary Access Control lets the owner of a resource decide who else may access it. MAC uses system-enforced labels; RBAC uses roles; ABAC uses attributes/policies.',
    references: [REF_AC, REF_RBAC]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'A government system enforces access using classification labels (e.g., Secret, Top Secret) that users and the system cannot override. Which model is this?',
    options: opts4('Discretionary Access Control', 'Mandatory Access Control (MAC)', 'Role-Based Access Control', 'Single sign-on'),
    correct: ['b'],
    explanation: 'Mandatory Access Control enforces access decisions based on system-assigned security labels and clearances that users cannot change, commonly used in classified environments.',
    references: [REF_AC, REF_CONTROLS]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'A badge reader unlocks a server-room door only for employees whose card is authorized. This is an example of which control category?',
    options: opts4('Logical/technical access control', 'Physical access control', 'Administrative control', 'Compensating policy'),
    correct: ['b'],
    explanation: 'A badge-controlled door restricts physical entry to a facility or room — a physical access control. Logical controls restrict access to systems and data electronically.',
    references: [REF_PHYS, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'Identification, authentication, and authorization occur in what order during a typical access attempt?',
    options: opts4(
      'Authorization, then authentication, then identification',
      'Identification, then authentication, then authorization',
      'Authentication, then identification, then authorization',
      'They occur simultaneously and order is irrelevant'
    ),
    correct: ['b'],
    explanation: 'A subject first claims an identity (identification), then proves it (authentication), and only then is granted or denied access to resources (authorization). Accounting/auditing typically follows.',
    references: [REF_IDENT, REF_AC]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'Even though a manager has high privileges, they should only see payroll records for their own department. Which principle is being enforced?',
    options: opts4('Need to know', 'Defense in depth', 'Non-repudiation', 'Fail open'),
    correct: ['a'],
    explanation: 'Need to know restricts access to only the specific information required for a person\'s duties, even if their clearance or role would otherwise permit broader access.',
    references: [REF_AC, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Using a fingerprint to unlock a phone is an example of a "something you are" (biometric) authentication factor.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Biometric characteristics such as fingerprints, facial geometry, or iris patterns are "something you are" factors used for authentication.',
    references: [REF_IDENT, REF_AUTH]
  },
  {
    domain: AC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL examples of "something you have" authentication factors.',
    options: opts4('Hardware security token', 'Smart card', 'A memorized PIN', 'One-time-code device/app'),
    correct: ['a', 'b', 'd'],
    explanation: 'Tokens, smart cards, and code-generating devices/apps are physical possessions ("something you have"). A memorized PIN is "something you know."',
    references: [REF_AUTH, REF_IDENT]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company removes a departed employee\'s accounts and access the same day they leave. This activity is part of which lifecycle stage?',
    options: opts4('Provisioning', 'Deprovisioning (offboarding)', 'Authentication', 'Privilege escalation'),
    correct: ['b'],
    explanation: 'Promptly disabling or removing access when a user leaves or changes roles is deprovisioning (offboarding). It prevents orphaned accounts from being misused.',
    references: [REF_IDENT, REF_AC]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'A modern architecture assumes no user or device is trusted by default and verifies every request regardless of network location. What is this approach called?',
    options: opts4('Perimeter-only security', 'Zero trust', 'Security through obscurity', 'Implicit trust zone'),
    correct: ['b'],
    explanation: 'Zero trust eliminates implicit trust based on network location and continuously verifies identity, device, and context for every access request ("never trust, always verify").',
    references: [REF_ZT, REF_AC]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'A user signs in once and then accesses several connected applications without re-entering credentials. What capability is this?',
    options: opts4('Single sign-on (SSO)', 'Separation of duties', 'Mandatory access control', 'Privilege creep'),
    correct: ['a'],
    explanation: 'Single sign-on lets a user authenticate once and access multiple trusting applications without repeated logins. It improves usability but makes that one credential high value.',
    references: [REF_IDENT, REF_AC]
  },

  // ── Network Security (16) ──
  {
    domain: NS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A device inspects traffic between the internal network and the internet and blocks packets that violate the configured rule set. What is this device?',
    options: opts4('A firewall', 'A switch', 'A repeater', 'A KVM'),
    correct: ['a'],
    explanation: 'A firewall enforces a rule set to permit or deny network traffic between zones (for example, internal network and internet), forming a key boundary control.',
    references: [REF_NET, REF_OUTLINE]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A remote employee creates an encrypted tunnel over the public internet to securely reach the corporate network. Which technology provides this?',
    options: opts4('A VPN', 'A hub', 'A DMZ', 'A honeypot'),
    correct: ['a'],
    explanation: 'A Virtual Private Network establishes an encrypted tunnel across an untrusted network so remote users can access internal resources with confidentiality and integrity.',
    references: [REF_VPN, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'Public-facing web and mail servers are placed in a separate subnet that is isolated from the internal LAN by firewalls. What is this zone commonly called?',
    options: opts4('A DMZ (screened subnet)', 'A VLAN trunk', 'A broadcast domain', 'A loopback'),
    correct: ['a'],
    explanation: 'A DMZ (demilitarized zone / screened subnet) hosts internet-facing services in an isolated segment so a compromise there does not directly expose the internal network.',
    references: [REF_NET, REF_OUTLINE]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker floods a web server with so many requests that legitimate users can no longer connect. Which attack is this?',
    options: opts4('SQL injection', 'Denial-of-service (DoS)', 'Phishing', 'Privilege escalation'),
    correct: ['b'],
    explanation: 'Overwhelming a service so it cannot serve legitimate users is a denial-of-service attack; when launched from many sources it is a distributed DoS (DDoS). It primarily harms availability.',
    references: [REF_DDOS, REF_NET]
  },
  {
    domain: NS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which OSI layer is primarily associated with IP addressing and routing of packets between networks?',
    options: opts4('Layer 2 — Data Link', 'Layer 3 — Network', 'Layer 4 — Transport', 'Layer 7 — Application'),
    correct: ['b'],
    explanation: 'The Network layer (Layer 3) handles logical addressing (IP) and routing between networks. Layer 2 deals with MAC addressing on a local segment; Layer 4 handles end-to-end transport.',
    references: [REF_OSI, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A monitoring system detects suspicious traffic and only generates alerts without blocking it. Which technology is this?',
    options: opts4('Intrusion Prevention System (IPS)', 'Intrusion Detection System (IDS)', 'Proxy server', 'Load balancer'),
    correct: ['b'],
    explanation: 'An IDS observes traffic and raises alerts on suspicious activity but does not block it. An IPS sits inline and can actively drop or block malicious traffic.',
    references: [REF_NET, REF_LOG]
  },
  {
    domain: NS, difficulty: 4, type: QType.SINGLE,
    stem: 'A Wi-Fi network is configured with WPA3 and a strong passphrase instead of an open network. Which security objective is most directly improved for wireless traffic?',
    options: opts4('Availability only', 'Confidentiality of over-the-air data', 'Physical safety', 'Non-repudiation of email'),
    correct: ['b'],
    explanation: 'Strong wireless encryption such as WPA3 protects the confidentiality (and integrity) of data transmitted over the air, preventing eavesdropping on an otherwise open radio medium.',
    references: [REF_WIFI, REF_CRYPTO]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol pair is the secure, encrypted version of web traffic that protects data between a browser and a server?',
    options: opts4('HTTP', 'HTTPS (HTTP over TLS)', 'FTP', 'Telnet'),
    correct: ['b'],
    explanation: 'HTTPS carries HTTP over TLS, encrypting web traffic for confidentiality and integrity. Plain HTTP, FTP, and Telnet transmit data (including credentials) in cleartext.',
    references: [REF_CRYPTO, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization splits its network so that finance systems cannot directly reach the guest Wi-Fi network. Which practice is this?',
    options: opts4('Network segmentation', 'Port mirroring', 'Cable management', 'DNS caching'),
    correct: ['a'],
    explanation: 'Network segmentation divides a network into isolated zones (e.g., via VLANs/subnets and firewall rules) to limit lateral movement and contain the impact of a compromise.',
    references: [REF_NET, REF_ZT]
  },
  {
    domain: NS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Telnet is a secure protocol because it encrypts all session data including passwords.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Telnet transmits data, including credentials, in cleartext. SSH should be used instead because it provides an encrypted remote session.',
    references: [REF_NET, REF_CRYPTO]
  },
  {
    domain: NS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL controls that help defend against network-based attacks.',
    options: opts4('Firewall rule sets', 'Network segmentation', 'Intrusion detection/prevention', 'Disabling all logging'),
    correct: ['a', 'b', 'c'],
    explanation: 'Firewalls, segmentation, and IDS/IPS are core network defenses. Disabling logging removes visibility needed to detect and investigate attacks and weakens security.',
    references: [REF_NET, REF_LOG]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker on the same LAN sends forged ARP replies to associate their MAC address with the gateway\'s IP so they can intercept traffic. What attack is this?',
    options: opts4('On-path / man-in-the-middle via ARP spoofing', 'Brute-force password attack', 'Cross-site scripting', 'Ransomware'),
    correct: ['a'],
    explanation: 'ARP spoofing/poisoning lets an attacker position themselves between hosts (on-path / man-in-the-middle) to intercept or alter traffic on a local segment.',
    references: [REF_NET, REF_OSI]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which device forwards traffic only to the specific port where the destination device is connected, rather than to all ports?',
    options: opts4('Hub', 'Switch', 'Repeater', 'Patch panel'),
    correct: ['b'],
    explanation: 'A switch learns MAC addresses and forwards frames only to the relevant port, reducing unnecessary exposure of traffic compared with a hub that floods all ports.',
    references: [REF_OSI, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company places a system that intentionally looks vulnerable to lure and study attackers, away from production systems. What is this called?',
    options: opts4('A honeypot', 'A jump box', 'A proxy', 'A load balancer'),
    correct: ['a'],
    explanation: 'A honeypot is a decoy system designed to attract and observe attackers, providing early warning and threat intelligence without exposing real production data.',
    references: [REF_NET, REF_LOG]
  },
  {
    domain: NS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which statement about the Transport layer (OSI Layer 4) is correct?',
    options: opts4(
      'It assigns MAC addresses to network cards.',
      'It provides end-to-end communication, using protocols like TCP and UDP, including port numbers.',
      'It defines physical cabling standards.',
      'It renders HTML in a browser.'
    ),
    correct: ['b'],
    explanation: 'The Transport layer provides end-to-end delivery between hosts. TCP offers reliable, connection-oriented delivery; UDP is connectionless. Port numbers identify the communicating applications.',
    references: [REF_OSI, REF_NET]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technology hides internal private IP addresses behind a single public address when hosts access the internet?',
    options: opts4('NAT (Network Address Translation)', 'DHCP', 'ARP', 'SMTP'),
    correct: ['a'],
    explanation: 'NAT translates private internal addresses to a public address (and back), conserving public IPs and masking internal addressing from the outside world.',
    references: [REF_NET, REF_OSI]
  },

  // ── Security Operations (12) ──
  {
    domain: SO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An IT team applies vendor updates regularly to fix known software flaws before they can be exploited. What is this practice called?',
    options: opts4('Patch management', 'Penetration testing', 'Data classification', 'Social engineering'),
    correct: ['a'],
    explanation: 'Patch management is the routine process of acquiring, testing, and applying software updates to remediate known vulnerabilities and reduce the attack surface.',
    references: [REF_PATCH, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization keeps three copies of data, on two different media, with one copy offsite. Which well-known guideline is this?',
    options: opts4('The 3-2-1 backup rule', 'The CIA triad', 'The OSI model', 'The principle of least privilege'),
    correct: ['a'],
    explanation: 'The 3-2-1 rule recommends three copies of data, on two different media types, with one copy stored offsite, to improve resilience against loss, corruption, and disasters.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Logs from servers, firewalls, and applications are centrally collected and correlated to detect suspicious activity. Which type of tool does this?',
    options: opts4('SIEM (Security Information and Event Management)', 'A spreadsheet', 'A DHCP server', 'A load balancer'),
    correct: ['a'],
    explanation: 'A SIEM aggregates and correlates log and event data from many sources to support monitoring, alerting, and investigation of security incidents.',
    references: [REF_LOG, REF_INCIDENT]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Before deleting old drives, a company physically shreds them so data cannot be recovered. Which data lifecycle activity is this?',
    options: opts4('Data classification', 'Secure data destruction (sanitization)', 'Data backup', 'Data replication'),
    correct: ['b'],
    explanation: 'Secure destruction or sanitization (e.g., shredding, degaussing, cryptographic erase) ensures data on end-of-life media cannot be reconstructed by unauthorized parties.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization labels documents as Public, Internal, or Confidential to apply appropriate handling rules. What is this process?',
    options: opts4('Data classification', 'Patch management', 'Network segmentation', 'Penetration testing'),
    correct: ['a'],
    explanation: 'Data classification assigns sensitivity labels so that protection, access, and handling controls can be applied proportionally to the value and risk of the information.',
    references: [REF_CONTROLS, REF_PRIVACY]
  },
  {
    domain: SO, difficulty: 4, type: QType.SINGLE,
    stem: 'A new server is configured to a documented minimum secure standard (services disabled, strong settings) before deployment. What is this standard called?',
    options: opts4('A security baseline / hardening standard', 'A risk register', 'A honeypot', 'An incident report'),
    correct: ['a'],
    explanation: 'A security baseline (or configuration/hardening standard) defines the minimum secure configuration systems must meet, reducing unnecessary services and exposure.',
    references: [REF_CONTROLS, REF_PATCH]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker calls an employee pretending to be IT support and convinces them to reveal their password. Which attack category is this?',
    options: opts4('Social engineering', 'Denial-of-service', 'SQL injection', 'Buffer overflow'),
    correct: ['a'],
    explanation: 'Manipulating people into divulging information or taking unsafe actions is social engineering. Pretexting and phishing are common forms; security awareness training is a key defense.',
    references: [REF_PHISH, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Regular security awareness training for staff is an effective control against phishing and social-engineering attacks.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Because social engineering targets people, ongoing awareness training that teaches users to recognize and report suspicious requests is a primary and effective defense.',
    references: [REF_PHISH, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL practices that strengthen day-to-day security operations.',
    options: opts4('Timely patch management', 'Centralized logging and monitoring', 'Configuration/hardening baselines', 'Sharing admin passwords by email'),
    correct: ['a', 'b', 'c'],
    explanation: 'Patching, monitoring, and hardening baselines are sound operational controls. Sharing admin passwords by email exposes credentials and breaks accountability.',
    references: [REF_PATCH, REF_LOG]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best describes the security purpose of maintaining and reviewing audit logs?',
    options: opts4(
      'Logs are only for billing.',
      'Logs support detection, accountability, and investigation of security events.',
      'Logs replace the need for any access controls.',
      'Logs should never be retained for privacy reasons.'
    ),
    correct: ['b'],
    explanation: 'Audit logs provide accountability and the evidence needed to detect, investigate, and respond to security events. They complement, not replace, preventive controls.',
    references: [REF_LOG, REF_INCIDENT]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Software that secretly records keystrokes to steal credentials is an example of which threat?',
    options: opts4('Malware (a keylogger)', 'A firewall', 'A backup job', 'A baseline'),
    correct: ['a'],
    explanation: 'A keylogger is a form of malicious software (malware) that captures keystrokes to steal credentials and other sensitive input. Anti-malware and monitoring help defend against it.',
    references: [REF_MALWARE, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization restricts physical entry to its data center using locked doors, cameras, and visitor logs. These are primarily which kind of controls?',
    options: opts4('Physical security controls', 'Cryptographic controls', 'Network controls', 'Application controls'),
    correct: ['a'],
    explanation: 'Locks, surveillance cameras, and visitor logs are physical security controls that deter, prevent, and detect unauthorized physical access to facilities and equipment.',
    references: [REF_PHYS, REF_CONTROLS]
  },

  // ── Business Continuity, Disaster Recovery and Incident Response (6) ──
  {
    domain: BCDR, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A plan defines how the business will keep critical operations running during and after a major disruption. What is this plan called?',
    options: opts4('Business Continuity Plan (BCP)', 'Acceptable Use Policy', 'Network diagram', 'Patch schedule'),
    correct: ['a'],
    explanation: 'A Business Continuity Plan describes how an organization sustains essential functions during and after a disruption. Disaster recovery focuses specifically on restoring IT systems.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'During incident response, the team isolates an infected laptop from the network to stop the malware from spreading. Which phase is this?',
    options: opts4('Preparation', 'Containment', 'Lessons learned', 'Detection'),
    correct: ['b'],
    explanation: 'Containment limits the scope and damage of an incident — for example, isolating affected systems — before eradication and recovery. It follows detection/analysis in the IR lifecycle.',
    references: [REF_INCIDENT, REF_OUTLINE]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.SINGLE,
    stem: 'A recovery objective states that the organization can tolerate at most 2 hours of data loss after an outage. Which metric is this?',
    options: opts4('Recovery Time Objective (RTO)', 'Recovery Point Objective (RPO)', 'Mean Time Between Failures (MTBF)', 'Service Level Agreement (SLA)'),
    correct: ['b'],
    explanation: 'The Recovery Point Objective is the maximum acceptable amount of data loss measured in time. RTO is the maximum acceptable time to restore the service after a disruption.',
    references: [REF_CP, REF_INCIDENT]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document specifically focuses on restoring IT systems and infrastructure after a disaster such as a fire or flood?',
    options: opts4('Disaster Recovery Plan (DRP)', 'Code of Ethics', 'Data classification policy', 'Firewall rule base'),
    correct: ['a'],
    explanation: 'A Disaster Recovery Plan addresses the technical recovery of IT systems and data after a disaster. It is a component supporting the broader Business Continuity Plan.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Conducting periodic tests and exercises of the incident response and continuity plans is unnecessary if the plans are well written.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Plans must be tested through exercises (walkthroughs, tabletop, simulations) to validate assumptions, train staff, and reveal gaps before a real incident occurs.',
    references: [REF_CP, REF_INCIDENT]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL phases that are part of a typical incident response lifecycle.',
    options: opts4('Preparation', 'Detection and analysis', 'Containment, eradication, and recovery', 'Marketing promotion'),
    correct: ['a', 'b', 'c'],
    explanation: 'NIST describes incident response as preparation; detection and analysis; containment, eradication, and recovery; and post-incident (lessons learned). Marketing promotion is not part of it.',
    references: [REF_INCIDENT, REF_CP]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Security Principles (17) ──
  {
    domain: SP, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A backup system ensures that if a database server crashes, a copy of the data is still reachable. Which CIA triad goal does this primarily support?',
    options: opts4('Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'),
    correct: ['c'],
    explanation: 'Backups and redundancy support availability by ensuring data and services remain accessible to authorized users even after a failure.',
    references: [REF_CIA, REF_CP]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A file-sharing service uses hashing to verify that downloaded files were not altered in transit. Which CIA objective is this protecting?',
    options: opts4('Availability', 'Integrity', 'Confidentiality', 'Anonymity'),
    correct: ['b'],
    explanation: 'Hash verification detects unauthorized or accidental modification of data, which is the integrity objective of the CIA triad.',
    references: [REF_CRYPTO, REF_CIA]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'A messaging app encrypts messages so only the intended recipient can read them. Which CIA goal is the focus?',
    options: opts4('Integrity', 'Availability', 'Confidentiality', 'Accountability'),
    correct: ['c'],
    explanation: 'Encrypting content so only the intended recipient can read it protects confidentiality by preventing unauthorized disclosure.',
    references: [REF_CIA, REF_CRYPTO]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization decides to stop offering a risky legacy service entirely because the potential losses outweigh any benefit. Which risk treatment is this?',
    options: opts4('Risk acceptance', 'Risk avoidance', 'Risk transference', 'Risk mitigation'),
    correct: ['b'],
    explanation: 'Eliminating the activity that creates the risk is risk avoidance. Acceptance keeps the risk, transference shares it, and mitigation reduces it with controls.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A company evaluates a low-likelihood, low-impact risk and consciously chooses to take no further action. Which treatment is this?',
    options: opts4('Risk avoidance', 'Risk mitigation', 'Risk acceptance', 'Risk transference'),
    correct: ['c'],
    explanation: 'Deliberately choosing to take on a risk without additional controls — typically because it is within the risk appetite — is risk acceptance.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'In the formula Risk = Likelihood × Impact, what does "impact" represent?',
    options: opts4(
      'The number of users on the network',
      'The magnitude of harm if the threat is realized',
      'The number of firewalls deployed',
      'The encryption key length'
    ),
    correct: ['b'],
    explanation: 'Impact is the magnitude of harm or loss that would result if a threat successfully exploits a vulnerability. Likelihood is the probability of that occurring.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'A risk that exists before any security controls are applied is best described as which of the following?',
    options: opts4('Residual risk', 'Inherent risk', 'Transferred risk', 'Accepted risk'),
    correct: ['b'],
    explanation: 'Inherent risk is the level of risk in the absence of controls. After controls are applied, what remains is residual risk.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL valid risk treatment options an organization may choose.',
    options: opts4('Accept the risk', 'Mitigate the risk', 'Transfer the risk', 'Ignore that the risk exists without analysis'),
    correct: ['a', 'b', 'c'],
    explanation: 'Recognized risk treatments are acceptance, mitigation, transference, and avoidance. Ignoring a risk without any analysis is not a managed treatment and is poor practice.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A step-by-step instruction sheet that tells administrators exactly how to configure account lockout is best classified as what?',
    options: opts4('A policy', 'A procedure', 'A regulation', 'A risk register'),
    correct: ['b'],
    explanation: 'A procedure provides detailed, step-by-step instructions to implement a policy. Policies state intent; standards/baselines define required settings; regulations are external mandates.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'Which document type is mandatory and externally imposed by a government, with legal penalties for non-compliance?',
    options: opts4('An internal guideline', 'A law or regulation', 'A best-practice tip', 'A meeting agenda'),
    correct: ['b'],
    explanation: 'Laws and regulations are external, mandatory requirements enforced by governmental authorities, often with legal penalties. Guidelines are advisory and internal.',
    references: [REF_OUTLINE, REF_PRIVACY]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A security architect deliberately uses overlapping preventive, detective, and corrective controls. What strategy is this?',
    options: opts4('Single layer security', 'Defense in depth', 'Security through obscurity', 'Implicit trust'),
    correct: ['b'],
    explanation: 'Combining multiple, overlapping control types and layers so no single failure is catastrophic is defense in depth (layered security).',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Acting honestly and legally is one of the obligations expressed in the ISC2 Code of Ethics canons.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. One canon requires members to "act honorably, honestly, justly, responsibly, and legally." Ethical conduct is fundamental to the certification.',
    references: [REF_ETHICS]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'According to the ISC2 Code of Ethics, when canons appear to conflict, how should they generally be applied?',
    options: opts4(
      'In the order they are listed, with the first canon taking precedence',
      'Randomly',
      'Only the last canon matters',
      'Members may ignore all canons under pressure'
    ),
    correct: ['a'],
    explanation: 'The ISC2 Code of Ethics canons are intended to be applied in order, so protecting society and the common good takes precedence when canons appear to conflict.',
    references: [REF_ETHICS]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'An asset is best defined in risk management as which of the following?',
    options: opts4(
      'Anything of value to the organization that should be protected',
      'A weakness in a system',
      'An event that could cause harm',
      'A document describing required behavior'
    ),
    correct: ['a'],
    explanation: 'An asset is anything of value (data, systems, people, reputation) worth protecting. A vulnerability is a weakness; a threat is a potential harmful event.',
    references: [REF_RISK, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario best illustrates a loss of integrity?',
    options: opts4(
      'A server is offline for six hours.',
      'An attacker silently changes account balances in a database.',
      'A laptop is encrypted and the key is held safely.',
      'Users authenticate with MFA.'
    ),
    correct: ['b'],
    explanation: 'Unauthorized modification of data — such as silently altering account balances — is a loss of integrity. An outage is a loss of availability.',
    references: [REF_CIA, REF_CRYPTO]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'A privacy program lets customers request deletion of their personal data. This most directly supports which concept?',
    options: opts4('Availability of marketing data', 'Individual privacy rights', 'Network throughput', 'Patch management'),
    correct: ['b'],
    explanation: 'Allowing individuals to control or request deletion of their personal data supports privacy rights — the individual\'s ability to control collection and use of their information.',
    references: [REF_PRIVACY, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A locked server cabinet and a CCTV camera are examples of which control category, respectively?',
    options: opts4(
      'Physical (preventive) and physical (detective)',
      'Technical and administrative',
      'Administrative and technical',
      'Both are administrative controls'
    ),
    correct: ['a'],
    explanation: 'A locked cabinet is a physical preventive control; a CCTV camera is a physical detective control. Both are physical controls serving different functions.',
    references: [REF_PHYS, REF_CONTROLS]
  },

  // ── Access Controls Concepts (14) ──
  {
    domain: AC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A database administrator should not also be the person who audits database activity. Which principle does separating these duties uphold?',
    options: opts4('Least privilege', 'Separation of duties', 'Single sign-on', 'Defense in depth'),
    correct: ['b'],
    explanation: 'Separation of duties divides sensitive responsibilities (such as performing an action and auditing it) so no single person can both act and conceal misconduct.',
    references: [REF_AC, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An application grants each user the smallest set of permissions required for their tasks and nothing more. Which principle is this?',
    options: opts4('Least privilege', 'Implicit allow', 'Privilege creep', 'Fail open'),
    correct: ['a'],
    explanation: 'Least privilege restricts users (and processes) to only the access strictly necessary for their function, limiting the blast radius of compromise or error.',
    references: [REF_AC, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'A login requires a smart card plus a PIN. Which two factor categories are combined?',
    options: opts4(
      'Something you have and something you know',
      'Something you are and something you have',
      'Something you know and somewhere you are',
      'Two something-you-are factors'
    ),
    correct: ['a'],
    explanation: 'A smart card is "something you have" and a PIN is "something you know." Combining two different categories provides multi-factor authentication.',
    references: [REF_AUTH, REF_IDENT]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'Permissions are evaluated against policies that consider the user\'s department, the resource\'s sensitivity, and the time of day. Which access-control model is this?',
    options: opts4('Discretionary Access Control', 'Attribute-Based Access Control (ABAC)', 'Mandatory Access Control', 'Role-Based Access Control'),
    correct: ['b'],
    explanation: 'Attribute-Based Access Control makes decisions by evaluating attributes of the subject, object, action, and environment against policies, enabling fine-grained, context-aware access.',
    references: [REF_AC, REF_RBAC]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'Over years, an employee changes roles several times and accumulates access rights from every past role. What is this problem called?',
    options: opts4('Privilege creep (aggregation)', 'Least privilege', 'Separation of duties', 'Single sign-on'),
    correct: ['a'],
    explanation: 'Privilege creep (authorization/aggregation creep) is the gradual accumulation of unnecessary access rights. Periodic access reviews and recertification help correct it.',
    references: [REF_AC, REF_IDENT]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'In which model does a central authority enforce access based on labels, and ordinary users cannot change permissions on objects they create?',
    options: opts4('Discretionary Access Control', 'Mandatory Access Control (MAC)', 'Role-Based Access Control', 'Attribute-Based Access Control'),
    correct: ['b'],
    explanation: 'Mandatory Access Control enforces access centrally using security labels/clearances; users cannot override these decisions, unlike discretionary models.',
    references: [REF_AC, REF_CONTROLS]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'A turnstile that allows only one authenticated person through at a time, preventing a second person from slipping in behind, mitigates which threat?',
    options: opts4('Tailgating / piggybacking', 'SQL injection', 'DNS poisoning', 'Privilege creep'),
    correct: ['a'],
    explanation: 'Tailgating (piggybacking) is when an unauthorized person follows an authorized one through a controlled entrance. Mantraps/turnstiles physically prevent this.',
    references: [REF_PHYS, REF_AC]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which term describes the process of confirming that a claimed identity is genuine, for example by checking a password?',
    options: opts4('Identification', 'Authentication', 'Authorization', 'Accounting'),
    correct: ['b'],
    explanation: 'Authentication verifies that a subject is who it claims to be. Identification is the initial claim of identity; authorization grants access after authentication.',
    references: [REF_IDENT, REF_AC]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'After a user is authenticated, the system checks what files and actions they are permitted to use. Which step is this?',
    options: opts4('Identification', 'Authentication', 'Authorization', 'Registration'),
    correct: ['c'],
    explanation: 'Authorization determines what an authenticated subject is allowed to do or access, enforcing policy after identity has been proven.',
    references: [REF_IDENT, REF_AC]
  },
  {
    domain: AC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Reusing the same password across many sites improves account security.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Password reuse means one breach can compromise many accounts (credential stuffing). Unique strong passwords, a password manager, and MFA are recommended.',
    references: [REF_AUTH, REF_IDENT]
  },
  {
    domain: AC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL recognized authentication factor categories.',
    options: opts4('Something you know', 'Something you have', 'Something you are', 'Something you wish'),
    correct: ['a', 'b', 'c'],
    explanation: 'The standard authentication factor categories are knowledge (something you know), possession (something you have), and inherence (something you are). "Something you wish" is not a factor.',
    references: [REF_IDENT, REF_AUTH]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A periodic review confirms that each user still needs the access they currently hold and removes anything unnecessary. What is this activity?',
    options: opts4('Access review / recertification', 'Penetration test', 'Backup rotation', 'Patch deployment'),
    correct: ['a'],
    explanation: 'Access reviews (entitlement recertification) periodically validate that users\' access remains appropriate, helping enforce least privilege and curb privilege creep.',
    references: [REF_AC, REF_IDENT]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'In zero trust, why is a request from inside the corporate network still verified?',
    options: opts4(
      'Because internal location is not treated as inherently trustworthy',
      'Because internal traffic is always malicious',
      'To slow down employees deliberately',
      'Because firewalls do not exist in zero trust'
    ),
    correct: ['a'],
    explanation: 'Zero trust removes implicit trust based on network location; every request is authenticated, authorized, and validated regardless of whether it originates inside or outside.',
    references: [REF_ZT, REF_AC]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'Granting a contractor access only for the two weeks of their project and automatically revoking it afterward is an example of what?',
    options: opts4('Time-based / just-in-time access provisioning', 'Privilege creep', 'Implicit allow', 'Security through obscurity'),
    correct: ['a'],
    explanation: 'Limiting access to the necessary time window and revoking it automatically supports least privilege through time-based or just-in-time provisioning.',
    references: [REF_AC, REF_IDENT]
  },

  // ── Network Security (16) ──
  {
    domain: NS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which protocol provides an encrypted command-line session to remotely administer a server, replacing insecure Telnet?',
    options: opts4('SSH', 'HTTP', 'SNMPv1', 'FTP'),
    correct: ['a'],
    explanation: 'SSH (Secure Shell) provides an encrypted, authenticated remote session, protecting credentials and commands. Telnet and plain FTP transmit data in cleartext.',
    references: [REF_CRYPTO, REF_NET]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A firewall rule set ends with an implicit rule that blocks anything not explicitly allowed. What is this called?',
    options: opts4('Implicit allow', 'Default deny (implicit deny)', 'Fail open', 'Promiscuous mode'),
    correct: ['b'],
    explanation: 'A default-deny (implicit deny) posture blocks all traffic that is not explicitly permitted, which is a secure firewall design principle.',
    references: [REF_NET, REF_OUTLINE]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A device sits inline and can automatically drop traffic it identifies as an attack. Which technology is this?',
    options: opts4('Intrusion Detection System (IDS)', 'Intrusion Prevention System (IPS)', 'Hub', 'DHCP server'),
    correct: ['b'],
    explanation: 'An IPS is positioned inline and can actively block or drop malicious traffic in real time. An IDS only detects and alerts.',
    references: [REF_NET, REF_LOG]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'Many compromised computers worldwide simultaneously flood a target site with traffic. What is this specifically called?',
    options: opts4('A distributed denial-of-service (DDoS) attack', 'A phishing attack', 'A SQL injection', 'A privilege escalation'),
    correct: ['a'],
    explanation: 'When a denial-of-service attack originates from many distributed, often compromised hosts (a botnet), it is a distributed denial-of-service (DDoS) attack.',
    references: [REF_DDOS, REF_NET]
  },
  {
    domain: NS, difficulty: 4, type: QType.SINGLE,
    stem: 'At which OSI layer do MAC addresses and Ethernet frames operate?',
    options: opts4('Layer 1 — Physical', 'Layer 2 — Data Link', 'Layer 3 — Network', 'Layer 5 — Session'),
    correct: ['b'],
    explanation: 'The Data Link layer (Layer 2) handles framing and physical (MAC) addressing on the local network segment. IP addressing is Layer 3.',
    references: [REF_OSI, REF_NET]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'A protocol used to securely transfer files using an encrypted channel is best represented by which option?',
    options: opts4('FTP', 'SFTP / FTPS', 'Telnet', 'HTTP'),
    correct: ['b'],
    explanation: 'SFTP (over SSH) and FTPS (FTP over TLS) encrypt file transfers. Plain FTP transmits data and credentials in cleartext and should be avoided.',
    references: [REF_CRYPTO, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company creates separate VLANs for staff, guests, and IoT devices. What security benefit does this provide?',
    options: opts4(
      'It increases internet bandwidth automatically.',
      'It segments the network so a compromise in one segment is harder to spread to others.',
      'It encrypts all traffic by default.',
      'It removes the need for passwords.'
    ),
    correct: ['b'],
    explanation: 'VLAN-based segmentation isolates traffic between groups, limiting lateral movement and containing the impact of a compromise. It does not by itself encrypt traffic.',
    references: [REF_NET, REF_ZT]
  },
  {
    domain: NS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A VPN protects data in transit by creating an encrypted tunnel over an untrusted network.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. A VPN encapsulates and encrypts traffic in a tunnel across an untrusted network such as the internet, protecting confidentiality and integrity in transit.',
    references: [REF_VPN, REF_CRYPTO]
  },
  {
    domain: NS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL examples of insecure protocols that transmit credentials in cleartext.',
    options: opts4('Telnet', 'FTP', 'HTTP basic auth without TLS', 'SSH'),
    correct: ['a', 'b', 'c'],
    explanation: 'Telnet, plain FTP, and HTTP basic auth without TLS send credentials in cleartext. SSH provides an encrypted channel and is the secure alternative.',
    references: [REF_NET, REF_CRYPTO]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A proxy server placed between users and the internet can do which of the following?',
    options: opts4(
      'Filter and log outbound web requests on behalf of clients',
      'Replace the need for any firewall',
      'Automatically patch all endpoints',
      'Encrypt local disk drives'
    ),
    correct: ['a'],
    explanation: 'A forward proxy intermediates client requests, enabling content filtering, caching, and logging of outbound traffic. It complements but does not replace a firewall.',
    references: [REF_NET, REF_LOG]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker intercepts and possibly alters communication between two parties who believe they are talking directly. What is this?',
    options: opts4('On-path (man-in-the-middle) attack', 'Denial-of-service', 'Brute force', 'Ransomware'),
    correct: ['a'],
    explanation: 'An on-path / man-in-the-middle attack positions the attacker between communicating parties to eavesdrop on or modify traffic. TLS and mutual authentication help defend against it.',
    references: [REF_NET, REF_CRYPTO]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component automatically assigns IP addresses to devices joining a network?',
    options: opts4('DHCP server', 'IDS sensor', 'Firewall', 'Honeypot'),
    correct: ['a'],
    explanation: 'A DHCP server dynamically assigns IP addresses and network configuration to clients. Securing DHCP (e.g., DHCP snooping) helps prevent rogue server attacks.',
    references: [REF_NET, REF_OSI]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'Placing internet-facing services in a screened subnet so the internal network is not directly exposed is an example of which design concept?',
    options: opts4('Network segmentation / DMZ', 'Single sign-on', 'Privilege creep', 'Security through obscurity'),
    correct: ['a'],
    explanation: 'Using a DMZ/screened subnet is a network segmentation strategy that isolates exposed services from the trusted internal network to limit attack impact.',
    references: [REF_NET, REF_OUTLINE]
  },
  {
    domain: NS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which statement about the Application layer (OSI Layer 7) is most accurate?',
    options: opts4(
      'It is where user-facing protocols such as HTTP, SMTP, and DNS operate.',
      'It assigns IP addresses.',
      'It defines voltage levels on the wire.',
      'It performs MAC address learning.'
    ),
    correct: ['a'],
    explanation: 'The Application layer (Layer 7) supports user-facing network applications and protocols such as HTTP, SMTP, and DNS. Addressing and physical signaling occur at lower layers.',
    references: [REF_OSI, REF_NET]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'Disabling SSID broadcast and relying on it as the only Wi-Fi protection is best described as which weak practice?',
    options: opts4('Strong encryption', 'Security through obscurity', 'Defense in depth', 'Mandatory access control'),
    correct: ['b'],
    explanation: 'Hiding the SSID provides only minor obscurity and is easily defeated; relying on it as the primary control is security through obscurity. Strong WPA3 encryption is the real protection.',
    references: [REF_WIFI, REF_OUTLINE]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A network access control (NAC) solution checks a device for up-to-date patches and antivirus before allowing it onto the corporate LAN. What is this enforcing?',
    options: opts4('Endpoint posture / health checking before access', 'Email encryption', 'Disk defragmentation', 'DNS resolution'),
    correct: ['a'],
    explanation: 'NAC evaluates device posture (patch level, security software, configuration) and only admits compliant endpoints, reducing the risk of compromised devices joining the network.',
    references: [REF_NET, REF_ZT]
  },

  // ── Security Operations (12) ──
  {
    domain: SO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Classifying data as Public, Internal, or Restricted so each level gets appropriate protection is an example of what?',
    options: opts4('Data classification', 'Penetration testing', 'Network segmentation', 'Patch management'),
    correct: ['a'],
    explanation: 'Data classification assigns sensitivity levels so handling, access, encryption, and retention controls can be applied proportionally to the data\'s value and risk.',
    references: [REF_CONTROLS, REF_PRIVACY]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'Securely wiping or destroying storage media at end of life so data cannot be recovered is which activity?',
    options: opts4('Data classification', 'Data sanitization / destruction', 'Data replication', 'Data ingestion'),
    correct: ['b'],
    explanation: 'Data sanitization or destruction (overwriting, degaussing, shredding, cryptographic erase) ensures information on retired media cannot be reconstructed by others.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'A team tests patches in a staging environment before deploying them to production. Why is this an operational best practice?',
    options: opts4(
      'To verify the update works and does not break systems before wide rollout',
      'To slow attackers down',
      'Because patches are never necessary',
      'To increase the attack surface intentionally'
    ),
    correct: ['a'],
    explanation: 'Testing patches in staging validates compatibility and stability, reducing the risk that a needed security update causes outages when deployed broadly.',
    references: [REF_PATCH, REF_CP]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'A SIEM raises an alert when a single account logs in from two distant countries within minutes. What capability does this demonstrate?',
    options: opts4('Log correlation and anomaly detection', 'Data encryption', 'Disk partitioning', 'Cable testing'),
    correct: ['a'],
    explanation: 'By correlating events across sources, a SIEM can flag improbable patterns (such as impossible travel) as anomalies for investigation, supporting monitoring and detection.',
    references: [REF_LOG, REF_INCIDENT]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'Following the 3-2-1 rule, where should at least one backup copy be stored?',
    options: opts4('On the same server as the original', 'Offsite (away from the primary location)', 'Only in RAM', 'Nowhere; one copy is enough'),
    correct: ['b'],
    explanation: 'The 3-2-1 rule requires at least one of the three copies to be stored offsite so a local disaster (fire, flood, theft) cannot destroy all copies at once.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 4, type: QType.SINGLE,
    stem: 'Disabling unused services and closing unnecessary ports on a server reduces what?',
    options: opts4('The attack surface', 'The need for backups', 'The CIA triad', 'The OSI model layers'),
    correct: ['a'],
    explanation: 'Hardening by removing unused services and ports reduces the attack surface — the set of points where an attacker could attempt to gain entry.',
    references: [REF_CONTROLS, REF_PATCH]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'An email appears to come from the CEO urgently asking finance to wire money to a new account. Which attack is most likely?',
    options: opts4('Business email compromise / phishing', 'DDoS', 'Port scanning', 'Cross-site scripting'),
    correct: ['a'],
    explanation: 'A spoofed urgent payment request impersonating an executive is business email compromise, a targeted form of phishing/social engineering. Verification procedures and awareness training mitigate it.',
    references: [REF_PHISH, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Centralized log management makes it easier to detect and investigate suspicious activity across many systems.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Aggregating logs centrally enables correlation, retention, and faster investigation across systems, improving detection and incident response capability.',
    references: [REF_LOG, REF_INCIDENT]
  },
  {
    domain: SO, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL examples of malware.',
    options: opts4('Ransomware', 'Trojan horse', 'Worm', 'A firewall rule'),
    correct: ['a', 'b', 'c'],
    explanation: 'Ransomware, Trojans, and worms are types of malicious software (malware). A firewall rule is a defensive configuration, not malware.',
    references: [REF_MALWARE, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Granting building access only during a contractor\'s scheduled work hours and logging each entry primarily supports which goals?',
    options: opts4(
      'Physical access control and accountability',
      'Network throughput and caching',
      'Encryption key rotation',
      'Source code compilation'
    ),
    correct: ['a'],
    explanation: 'Time-bounded physical access plus entry logging enforces least-privilege physical access and provides an audit trail supporting accountability.',
    references: [REF_PHYS, REF_LOG]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes the role of security awareness training in operations?',
    options: opts4(
      'It eliminates the need for technical controls.',
      'It reduces human-factor risk such as falling for phishing and unsafe behavior.',
      'It is only for IT administrators.',
      'It is a one-time event with no follow-up.'
    ),
    correct: ['b'],
    explanation: 'Ongoing awareness training reduces the likelihood that staff fall for social engineering or behave unsafely. It complements, but does not replace, technical controls.',
    references: [REF_PHISH, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'Keeping software inventory current and removing applications that are no longer supported helps reduce what?',
    options: opts4('Unpatched vulnerability exposure', 'Available disk capacity only', 'Network latency only', 'User satisfaction only'),
    correct: ['a'],
    explanation: 'Tracking software and removing end-of-life applications reduces exposure from unsupported, unpatchable vulnerabilities, lowering operational risk.',
    references: [REF_PATCH, REF_CONTROLS]
  },

  // ── Business Continuity, Disaster Recovery and Incident Response (6) ──
  {
    domain: BCDR, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A document focused specifically on restoring IT systems after a major outage is best called what?',
    options: opts4('Disaster Recovery Plan (DRP)', 'Acceptable Use Policy', 'Code of Ethics', 'Data classification policy'),
    correct: ['a'],
    explanation: 'A Disaster Recovery Plan details the technical steps to restore IT systems and data after a disruptive event, supporting the broader Business Continuity Plan.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'After containing and removing malware, the team restores affected systems from clean backups and verifies normal operation. Which incident response phase is this?',
    options: opts4('Preparation', 'Detection', 'Recovery', 'Identification'),
    correct: ['c'],
    explanation: 'Recovery restores affected systems to normal operation (e.g., from clean backups) and confirms they function correctly, following containment and eradication.',
    references: [REF_INCIDENT, REF_CP]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.SINGLE,
    stem: 'A service must be back online within 4 hours of an outage. Which metric expresses this requirement?',
    options: opts4('Recovery Point Objective (RPO)', 'Recovery Time Objective (RTO)', 'Maximum tolerable data loss', 'Mean Time To Failure'),
    correct: ['b'],
    explanation: 'The Recovery Time Objective is the maximum acceptable duration to restore a service after disruption. RPO addresses acceptable data loss measured in time.',
    references: [REF_CP, REF_INCIDENT]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which analysis identifies the organization\'s critical functions and the impact over time if they are interrupted?',
    options: opts4('Business Impact Analysis (BIA)', 'Penetration test', 'Vulnerability scan', 'Code review'),
    correct: ['a'],
    explanation: 'A Business Impact Analysis identifies critical business functions and the operational and financial impact of their disruption over time, informing recovery priorities and objectives.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A tabletop exercise is a discussion-based walkthrough used to validate incident response and continuity plans without disrupting production.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. A tabletop exercise is a discussion-based session where participants walk through scenarios to test plans, roles, and decisions without affecting live systems.',
    references: [REF_INCIDENT, REF_CP]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL activities that belong to the post-incident ("lessons learned") phase of incident response.',
    options: opts4(
      'Documenting what happened and the response timeline',
      'Identifying improvements to controls and processes',
      'Updating the incident response plan',
      'Ignoring the incident once systems are restored'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The post-incident phase documents the incident, derives improvements, and updates plans and controls. Ignoring the incident wastes the opportunity to reduce future risk.',
    references: [REF_INCIDENT, REF_CP]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Security Principles (17) ──
  {
    domain: SP, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Restricting who can view employee salary data so only HR can read it primarily protects which CIA goal?',
    options: opts4('Availability', 'Integrity', 'Confidentiality', 'Non-repudiation'),
    correct: ['c'],
    explanation: 'Limiting who may view sensitive salary data protects confidentiality by preventing unauthorized disclosure of the information.',
    references: [REF_CIA, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A version-control system records every change and who made it so unauthorized edits are detectable. Which CIA goal is supported?',
    options: opts4('Confidentiality', 'Integrity', 'Availability', 'Anonymity'),
    correct: ['b'],
    explanation: 'Tracking changes and detecting unauthorized modification supports integrity — ensuring data has not been altered without authorization.',
    references: [REF_CIA, REF_CRYPTO]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'An e-commerce site uses clustered servers so it stays online during peak traffic and hardware failures. Which CIA goal is the focus?',
    options: opts4('Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'),
    correct: ['c'],
    explanation: 'Clustering and redundancy keep services reachable during load spikes and failures, directly supporting availability.',
    references: [REF_CIA, REF_CP]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'A firm installs extra controls to lower the chance and impact of a data breach but accepts the small remaining chance. Which two treatments are combined?',
    options: opts4(
      'Mitigation then acceptance of residual risk',
      'Avoidance then transference',
      'Transference then avoidance',
      'Acceptance then avoidance'
    ),
    correct: ['a'],
    explanation: 'Adding controls reduces the risk (mitigation); consciously taking on the small remaining exposure is acceptance of residual risk. Combining treatments is common.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'Outsourcing payment processing to a PCI-compliant provider so they bear much of the cardholder-data risk is an example of which treatment?',
    options: opts4('Risk avoidance', 'Risk acceptance', 'Risk transference (sharing)', 'Risk inheritance'),
    correct: ['c'],
    explanation: 'Shifting a risk and its handling to a qualified third party (e.g., a payment processor or insurer) is risk transference or sharing.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'In risk terminology, what is a "vulnerability"?',
    options: opts4(
      'Anything of value to be protected',
      'A weakness that could be exploited to cause harm',
      'The probability a threat occurs',
      'A control that reduces risk'
    ),
    correct: ['b'],
    explanation: 'A vulnerability is a weakness or flaw (in a system, process, or control) that a threat could exploit, leading to a loss. Assets are protected; controls reduce risk.',
    references: [REF_RISK, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'A risk register is best described as which of the following?',
    options: opts4(
      'A catalog of identified risks with their analysis and treatment decisions',
      'A list of employee passwords',
      'A network diagram',
      'A firewall configuration file'
    ),
    correct: ['a'],
    explanation: 'A risk register documents identified risks along with their likelihood, impact, owner, and chosen treatment, supporting ongoing risk management and tracking.',
    references: [REF_RISK, REF_RMF]
  },
  {
    domain: SP, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL statements that correctly relate threats, vulnerabilities, and assets.',
    options: opts4(
      'A threat exploits a vulnerability to harm an asset.',
      'A vulnerability is a weakness that may be exploited.',
      'An asset is something of value worth protecting.',
      'A vulnerability is the same thing as a threat actor.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A threat exploits a vulnerability to harm an asset; a vulnerability is a weakness; an asset has value. A vulnerability is a weakness, not the threat actor itself.',
    references: [REF_RISK, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'An advisory recommendation that suggests, but does not require, a particular secure practice is best classified as what?',
    options: opts4('A guideline', 'A law', 'A mandatory standard', 'A binding contract'),
    correct: ['a'],
    explanation: 'Guidelines are advisory recommendations that help apply policies and standards but are not mandatory. Standards and laws impose required behavior.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'A mandatory internal document that specifies the exact minimum encryption algorithm and key length all systems must use is best called what?',
    options: opts4('A guideline', 'A standard', 'A suggestion', 'An audit log'),
    correct: ['b'],
    explanation: 'A standard is a mandatory, specific requirement (e.g., required algorithm and key length) that supports policy. Guidelines are advisory and non-binding.',
    references: [REF_CRYPTO, REF_CONTROLS]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'Why are multiple independent layers of defense preferred over a single strong control?',
    options: opts4(
      'They guarantee no attack will ever succeed.',
      'If one layer fails or is bypassed, others still provide protection.',
      'They remove the need for monitoring.',
      'They make systems faster.'
    ),
    correct: ['b'],
    explanation: 'Defense in depth assumes any single control may fail; layered, independent controls ensure a single failure does not lead to total compromise. No control set guarantees absolute safety.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Providing diligent and competent service to those you serve is one of the obligations in the ISC2 Code of Ethics.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. One ISC2 Code of Ethics canon requires members to "provide diligent and competent service to principals."',
    references: [REF_ETHICS]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'A security professional discovers a colleague falsifying audit results. According to the ISC2 Code of Ethics, the most appropriate action is to:',
    options: opts4(
      'Ignore it to avoid conflict',
      'Act honestly and report the misconduct through proper channels',
      'Help conceal it for a fee',
      'Falsify their own results to compete'
    ),
    correct: ['b'],
    explanation: 'The Code of Ethics requires acting honestly, legally, and in the interest of society and principals. Reporting misconduct through proper channels upholds these canons.',
    references: [REF_ETHICS]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best distinguishes a threat from a vulnerability?',
    options: opts4(
      'A threat is a potential cause of harm; a vulnerability is the weakness it can exploit.',
      'They are identical.',
      'A vulnerability is always a person.',
      'A threat is always software.'
    ),
    correct: ['a'],
    explanation: 'A threat is any potential event or actor that could cause harm; a vulnerability is the weakness that a threat exploits. Risk arises when a threat can exploit a vulnerability affecting an asset.',
    references: [REF_RISK, REF_OUTLINE]
  },
  {
    domain: SP, difficulty: 2, type: QType.SINGLE,
    stem: 'Anonymizing personal data before analytics so individuals cannot be identified primarily supports which concept?',
    options: opts4('Availability', 'Privacy', 'Non-repudiation', 'Throughput'),
    correct: ['b'],
    explanation: 'De-identifying or anonymizing personal data reduces the ability to link data to individuals, supporting privacy by limiting exposure of personal information.',
    references: [REF_PRIVACY, REF_CIA]
  },
  {
    domain: SP, difficulty: 4, type: QType.SINGLE,
    stem: 'An automated rule that locks an account after five failed logins is best categorized as which control function?',
    options: opts4('Preventive technical control', 'Physical control', 'Recovery control', 'Administrative-only control'),
    correct: ['a'],
    explanation: 'Account lockout is implemented in technology and acts before damage occurs (deterring/preventing brute force), making it a preventive technical control.',
    references: [REF_CONTROLS, REF_AC]
  },
  {
    domain: SP, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization documents acceptable use, password requirements, and incident reporting expectations for all staff. This collection is best described as what?',
    options: opts4('Security policies', 'A network diagram', 'A penetration test report', 'A vulnerability scan'),
    correct: ['a'],
    explanation: 'Management statements defining required and acceptable behavior (acceptable use, passwords, incident reporting) are security policies, the top of the governance document hierarchy.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },

  // ── Access Controls Concepts (14) ──
  {
    domain: AC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A junior analyst is granted read-only access to the reports they need and no administrative rights. Which principle is applied?',
    options: opts4('Least privilege', 'Privilege creep', 'Implicit allow', 'Fail open'),
    correct: ['a'],
    explanation: 'Granting only the minimum access required (read-only, no admin) for the job is the principle of least privilege.',
    references: [REF_AC, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Splitting the ability to create a vendor and the ability to approve payments to that vendor between two employees enforces what?',
    options: opts4('Separation of duties', 'Single sign-on', 'Least functionality', 'Mandatory access control'),
    correct: ['a'],
    explanation: 'Separation of duties divides a sensitive process so collusion would be required for fraud, reducing the risk that one person can both create and pay a fraudulent vendor.',
    references: [REF_AC, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'A facility requires a fingerprint scan and a PIN to enter the vault. Which factor combination is used?',
    options: opts4(
      'Something you are and something you know',
      'Something you have and something you are',
      'Something you know and somewhere you are',
      'Two something-you-have factors'
    ),
    correct: ['a'],
    explanation: 'A fingerprint is "something you are" (biometric) and a PIN is "something you know," combining two factor categories for multi-factor access.',
    references: [REF_AUTH, REF_IDENT]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which access-control model is generally easiest to administer in a large company with clearly defined job functions?',
    options: opts4('Discretionary Access Control', 'Role-Based Access Control (RBAC)', 'Ad-hoc per-user permissions', 'No access control'),
    correct: ['b'],
    explanation: 'RBAC scales well in organizations with well-defined job functions because permissions attach to roles and users inherit them through role membership, simplifying administration.',
    references: [REF_RBAC, REF_AC]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'A cloud policy allows access only if the user is in the Finance group AND connecting from a managed device AND during business hours. Which model fits best?',
    options: opts4('Discretionary Access Control', 'Mandatory Access Control', 'Attribute-Based Access Control (ABAC)', 'No model — this is impossible'),
    correct: ['c'],
    explanation: 'Evaluating multiple attributes (group, device state, time) against a policy to make a decision is Attribute-Based Access Control, which enables fine-grained, context-aware rules.',
    references: [REF_AC, REF_ZT]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'In a military system using Top Secret/Secret/Confidential labels enforced by the system regardless of user wishes, which model is in use?',
    options: opts4('Discretionary Access Control', 'Role-Based Access Control', 'Mandatory Access Control (MAC)', 'Attribute-Based Access Control'),
    correct: ['c'],
    explanation: 'System-enforced classification labels and clearances that users cannot override characterize Mandatory Access Control, common in classified/military environments.',
    references: [REF_AC, REF_CONTROLS]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'A mantrap (access control vestibule) at a data-center entrance primarily prevents which issue?',
    options: opts4('Tailgating / unauthorized following', 'SQL injection', 'Email spoofing', 'Weak encryption'),
    correct: ['a'],
    explanation: 'An access control vestibule (mantrap) admits one authenticated person at a time, preventing tailgating where an unauthorized person follows an authorized one inside.',
    references: [REF_PHYS, REF_AC]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A user types their username at a login prompt. Which step of access control is this?',
    options: opts4('Identification', 'Authentication', 'Authorization', 'Accounting'),
    correct: ['a'],
    explanation: 'Providing a username is identification — the claim of an identity. Authentication then proves that claim, and authorization grants access.',
    references: [REF_IDENT, REF_AC]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'Recording which user accessed which file and when, to support later review, is which part of access control (AAA)?',
    options: opts4('Authentication', 'Authorization', 'Accounting (auditing)', 'Identification'),
    correct: ['c'],
    explanation: 'Accounting (auditing) logs subjects\' actions on resources, providing accountability and an audit trail after identification, authentication, and authorization.',
    references: [REF_IDENT, REF_LOG]
  },
  {
    domain: AC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Multi-factor authentication significantly reduces the risk of account compromise from a stolen password alone.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. With MFA, a stolen password is insufficient because the attacker still needs the additional factor (e.g., a device or biometric), greatly reducing account takeover risk.',
    references: [REF_AUTH, REF_IDENT]
  },
  {
    domain: AC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL controls that help enforce the principle of least privilege over time.',
    options: opts4(
      'Periodic access reviews / recertification',
      'Removing access when roles change',
      'Just-in-time temporary access',
      'Granting everyone administrator rights for convenience'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Access reviews, prompt removal on role change, and just-in-time access all keep privileges minimal. Granting everyone admin rights violates least privilege.',
    references: [REF_AC, REF_IDENT]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A departing employee\'s accounts remain active for months because no one disabled them. What is this weakness called?',
    options: opts4('An orphaned account', 'A honeypot', 'A baseline', 'A risk register'),
    correct: ['a'],
    explanation: 'An account that remains active without a valid owner (e.g., after an employee leaves) is an orphaned account — a common risk that timely deprovisioning prevents.',
    references: [REF_IDENT, REF_AC]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'Which statement best captures the core idea of zero trust?',
    options: opts4(
      'Trust internal users fully and verify only external ones',
      'Never trust by default; continuously verify identity, device, and context for every request',
      'Disable authentication to speed up access',
      'Trust any device that has an internal IP address'
    ),
    correct: ['b'],
    explanation: 'Zero trust assumes no implicit trust based on location; it continuously authenticates and authorizes each request using identity, device posture, and context.',
    references: [REF_ZT, REF_AC]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'Single sign-on improves user experience but introduces which risk that must be managed?',
    options: opts4(
      'If the SSO credentials are compromised, multiple connected systems may be exposed',
      'Users must remember more passwords',
      'It disables logging',
      'It removes the need for authorization'
    ),
    correct: ['a'],
    explanation: 'SSO concentrates risk: compromise of the single credential can grant access to all connected systems, so strong authentication (e.g., MFA) on the SSO is essential.',
    references: [REF_IDENT, REF_AC]
  },

  // ── Network Security (16) ──
  {
    domain: NS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which boundary device is the primary control for filtering traffic between a trusted internal network and an untrusted external one?',
    options: opts4('Firewall', 'Print server', 'KVM switch', 'UPS'),
    correct: ['a'],
    explanation: 'A firewall is the primary perimeter control that permits or denies traffic between trusted and untrusted networks based on a defined rule set.',
    references: [REF_NET, REF_OUTLINE]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which web protocol should be used to protect login credentials submitted from a browser?',
    options: opts4('HTTP', 'HTTPS', 'FTP', 'Telnet'),
    correct: ['b'],
    explanation: 'HTTPS encrypts traffic between browser and server using TLS, protecting credentials and data in transit. Plain HTTP, FTP, and Telnet are cleartext.',
    references: [REF_CRYPTO, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which solution observes network traffic for known attack signatures and alerts staff but does not block traffic?',
    options: opts4('IDS', 'IPS', 'DHCP', 'NAT'),
    correct: ['a'],
    explanation: 'An Intrusion Detection System monitors traffic and raises alerts on suspicious or signature-matching activity but, unlike an IPS, does not actively block it.',
    references: [REF_NET, REF_LOG]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A flood of traffic from a botnet renders an online service unreachable for legitimate users. Which CIA goal is most directly harmed?',
    options: opts4('Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'),
    correct: ['c'],
    explanation: 'A DDoS attack overwhelms a service so legitimate users cannot reach it, directly harming availability.',
    references: [REF_DDOS, REF_CIA]
  },
  {
    domain: NS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which OSI layer is responsible for converting data into electrical, optical, or radio signals on the medium?',
    options: opts4('Layer 1 — Physical', 'Layer 3 — Network', 'Layer 4 — Transport', 'Layer 6 — Presentation'),
    correct: ['a'],
    explanation: 'The Physical layer (Layer 1) transmits raw bits as electrical, optical, or radio signals over the physical medium and defines cabling and connectors.',
    references: [REF_OSI, REF_NET]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'A remote worker must reach internal file shares securely from home. Which technology is most appropriate?',
    options: opts4('A site-to-internet hub', 'A VPN client to the corporate gateway', 'Plain FTP', 'Disabling the firewall'),
    correct: ['b'],
    explanation: 'A VPN establishes an encrypted tunnel from the remote device to the corporate network, allowing secure access to internal resources over the untrusted internet.',
    references: [REF_VPN, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is placing IoT devices on a separate, restricted VLAN considered good practice?',
    options: opts4(
      'IoT devices are often less secure; isolating them limits the impact if one is compromised',
      'It makes IoT devices run faster',
      'It encrypts all IoT data automatically',
      'It removes the need to patch them'
    ),
    correct: ['a'],
    explanation: 'IoT devices frequently have weak security; segmenting them onto a restricted VLAN limits lateral movement so a compromised device cannot easily reach critical systems.',
    references: [REF_NET, REF_ZT]
  },
  {
    domain: NS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: WPA3 with a strong passphrase provides better protection for wireless traffic than an open (unencrypted) network.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. WPA3 encrypts wireless traffic and authenticates clients, whereas an open network transmits data in the clear and is trivially eavesdropped.',
    references: [REF_WIFI, REF_CRYPTO]
  },
  {
    domain: NS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about the OSI model.',
    options: opts4(
      'It has seven layers.',
      'Layer 3 handles IP addressing and routing.',
      'Layer 7 is the Application layer.',
      'Layer 1 assigns IP addresses.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The OSI model has seven layers; Layer 3 (Network) handles IP/routing and Layer 7 is the Application layer. IP addressing is Layer 3, not Layer 1 (Physical).',
    references: [REF_OSI, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker sets up a rogue Wi-Fi access point with the same name as the corporate network to capture credentials. What is this attack?',
    options: opts4('Evil twin', 'SQL injection', 'Ransomware', 'Privilege escalation'),
    correct: ['a'],
    explanation: 'An evil twin is a rogue access point impersonating a legitimate SSID to lure clients and capture credentials or intercept traffic. Strong authentication and verifying networks mitigate it.',
    references: [REF_WIFI, REF_NET]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which describes the security purpose of a default-deny firewall posture?',
    options: opts4(
      'Allow everything and block only known-bad traffic',
      'Block all traffic except what is explicitly permitted',
      'Disable logging to improve performance',
      'Permit all internal traffic without inspection'
    ),
    correct: ['b'],
    explanation: 'Default deny blocks all traffic unless a rule explicitly allows it, minimizing the attack surface and following the principle of least privilege at the network boundary.',
    references: [REF_NET, REF_OUTLINE]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol resolves human-readable names like example.com to IP addresses and, if abused, can redirect users to malicious sites?',
    options: opts4('DNS', 'SMTP', 'NTP', 'ARP'),
    correct: ['a'],
    explanation: 'DNS resolves domain names to IP addresses. Attacks like DNS spoofing/poisoning can redirect users to malicious servers, so DNS security (e.g., DNSSEC) matters.',
    references: [REF_NET, REF_OSI]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A screened subnet (DMZ) most directly reduces risk by doing which of the following?',
    options: opts4(
      'Isolating internet-facing services from the internal network',
      'Encrypting all internal disks',
      'Eliminating the need for authentication',
      'Increasing Wi-Fi range'
    ),
    correct: ['a'],
    explanation: 'A DMZ isolates internet-facing services in a separate, firewalled segment so that compromising one of those services does not directly grant access to the internal network.',
    references: [REF_NET, REF_OUTLINE]
  },
  {
    domain: NS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which OSI layer manages establishing, maintaining, and terminating sessions between applications?',
    options: opts4('Layer 2 — Data Link', 'Layer 5 — Session', 'Layer 1 — Physical', 'Layer 3 — Network'),
    correct: ['b'],
    explanation: 'The Session layer (Layer 5) establishes, manages, and terminates communication sessions between applications. Lower layers handle addressing and signaling.',
    references: [REF_OSI, REF_NET]
  },
  {
    domain: NS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control inspects and can block malicious traffic in real time because it is positioned directly in the traffic path?',
    options: opts4('IDS (out-of-band)', 'IPS (inline)', 'Syslog server', 'DHCP relay'),
    correct: ['b'],
    explanation: 'An inline IPS sits in the traffic path and can actively drop or block malicious packets in real time, whereas an out-of-band IDS only detects and alerts.',
    references: [REF_NET, REF_LOG]
  },
  {
    domain: NS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company requires all administrative connections to network devices to use SSH instead of Telnet. What is the primary security benefit?',
    options: opts4(
      'Encrypted, authenticated management sessions instead of cleartext',
      'Faster typing speed',
      'More colorful terminal output',
      'Lower electricity usage'
    ),
    correct: ['a'],
    explanation: 'SSH encrypts and authenticates the management session, protecting administrative credentials and commands from interception, unlike cleartext Telnet.',
    references: [REF_CRYPTO, REF_NET]
  },

  // ── Security Operations (12) ──
  {
    domain: SO, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Routinely applying vendor updates to remediate known vulnerabilities is which operational process?',
    options: opts4('Patch management', 'Social engineering', 'Penetration testing', 'Data classification'),
    correct: ['a'],
    explanation: 'Patch management is the ongoing process of obtaining, testing, and deploying updates to fix known vulnerabilities and reduce exploitable exposure.',
    references: [REF_PATCH, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'A backup strategy keeps three copies of data on two media types with one copy offsite. Which rule is being followed?',
    options: opts4('The 3-2-1 backup rule', 'The AAA model', 'The OSI model', 'The CIA triad'),
    correct: ['a'],
    explanation: 'The 3-2-1 rule (three copies, two media types, one offsite) is a widely recommended backup strategy that improves resilience against data loss and disasters.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which tool centrally aggregates and correlates logs to help analysts detect and investigate security events?',
    options: opts4('SIEM', 'DHCP server', 'Load balancer', 'Spreadsheet macro'),
    correct: ['a'],
    explanation: 'A Security Information and Event Management (SIEM) system centralizes and correlates logs across the environment, enabling monitoring, alerting, and investigation.',
    references: [REF_LOG, REF_INCIDENT]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Why must storage media be sanitized or destroyed before disposal or reuse?',
    options: opts4(
      'To prevent recovery of sensitive data by unauthorized parties',
      'To increase the media\'s storage capacity',
      'To speed up the next computer',
      'To comply with the OSI model'
    ),
    correct: ['a'],
    explanation: 'Sanitization or destruction prevents residual sensitive data from being recovered after media is disposed of, donated, or reused, protecting confidentiality.',
    references: [REF_CONTROLS, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'Labeling and handling data differently based on sensitivity (e.g., Confidential vs Public) is primarily intended to do what?',
    options: opts4(
      'Apply protection proportional to the data\'s value and risk',
      'Make all data public',
      'Eliminate the need for backups',
      'Replace authentication'
    ),
    correct: ['a'],
    explanation: 'Data classification ensures controls (access, encryption, retention, handling) are applied in proportion to each data set\'s sensitivity and risk, optimizing protection and cost.',
    references: [REF_CONTROLS, REF_PRIVACY]
  },
  {
    domain: SO, difficulty: 4, type: QType.SINGLE,
    stem: 'Hardening a system by applying a documented secure baseline primarily achieves which outcome?',
    options: opts4(
      'A reduced and consistent attack surface across systems',
      'Faster internet speed',
      'Automatic incident response',
      'Elimination of all risk'
    ),
    correct: ['a'],
    explanation: 'Applying a secure configuration baseline disables unneeded services and enforces secure settings consistently, reducing and standardizing the attack surface. No control eliminates all risk.',
    references: [REF_CONTROLS, REF_PATCH]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'A text message claims your bank account is locked and links to a fake login page to steal credentials. What is this called?',
    options: opts4('Smishing (SMS phishing)', 'A DDoS attack', 'A buffer overflow', 'ARP poisoning'),
    correct: ['a'],
    explanation: 'Phishing delivered via SMS text messages is called smishing. Like other social engineering, awareness and verifying through official channels are key defenses.',
    references: [REF_PHISH, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Reviewing logs regularly has no security value and should be skipped to save time.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Regular log review supports detection of anomalies, accountability, and incident investigation. Skipping it reduces visibility and weakens security operations.',
    references: [REF_LOG, REF_INCIDENT]
  },
  {
    domain: SO, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL recommended responses when an employee receives a suspicious email asking for credentials.',
    options: opts4(
      'Do not click links or open attachments',
      'Report it to the security team',
      'Verify requests through an independent, trusted channel',
      'Reply with the requested password to be helpful'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Not interacting with the message, reporting it, and verifying through a separate trusted channel are correct. Replying with a password would directly cause compromise.',
    references: [REF_PHISH, REF_OUTLINE]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Cameras, security guards, and visitor sign-in sheets at a facility are best described as which type of controls?',
    options: opts4('Physical security controls', 'Cryptographic controls', 'Application controls', 'Transport-layer controls'),
    correct: ['a'],
    explanation: 'Guards, cameras, and visitor logs deter, detect, and document physical access, making them physical security controls protecting facilities and equipment.',
    references: [REF_PHYS, REF_CONTROLS]
  },
  {
    domain: SO, difficulty: 3, type: QType.SINGLE,
    stem: 'Anti-malware software that scans files and quarantines threats supports which security goal most directly?',
    options: opts4(
      'Preventing and detecting malicious code on endpoints',
      'Increasing network bandwidth',
      'Replacing the firewall',
      'Improving screen resolution'
    ),
    correct: ['a'],
    explanation: 'Endpoint anti-malware detects, blocks, and quarantines malicious code, helping prevent infections and supporting confidentiality, integrity, and availability of systems.',
    references: [REF_MALWARE, REF_CONTROLS]
  },
  {
    domain: SO, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice most directly reduces the chance that a known, already-patched vulnerability is exploited?',
    options: opts4('Timely patch deployment', 'Increasing monitor brightness', 'Disabling all logs', 'Sharing admin passwords'),
    correct: ['a'],
    explanation: 'Promptly deploying available patches closes known vulnerabilities before attackers can exploit them, which is among the most effective operational defenses.',
    references: [REF_PATCH, REF_CONTROLS]
  },

  // ── Business Continuity, Disaster Recovery and Incident Response (6) ──
  {
    domain: BCDR, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Keeping critical business operations running during and after a disruptive event is the goal of which plan?',
    options: opts4('Business Continuity Plan (BCP)', 'Firewall rule base', 'Acceptable Use Policy', 'Data classification policy'),
    correct: ['a'],
    explanation: 'A Business Continuity Plan ensures essential business functions continue during and after disruptions. Disaster recovery focuses specifically on IT restoration.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.SINGLE,
    stem: 'During incident response, identifying the root cause and removing malware and attacker artifacts from systems is which phase?',
    options: opts4('Preparation', 'Eradication', 'Detection', 'Lessons learned'),
    correct: ['b'],
    explanation: 'Eradication removes the cause of the incident (malware, malicious accounts, attacker footholds) after containment and before systems are recovered to normal operation.',
    references: [REF_INCIDENT, REF_CP]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization can tolerate losing at most 15 minutes of transactions if a database fails. Which metric defines this?',
    options: opts4('Recovery Time Objective (RTO)', 'Recovery Point Objective (RPO)', 'Mean Time To Repair (MTTR)', 'Service Level Agreement (SLA)'),
    correct: ['b'],
    explanation: 'The Recovery Point Objective specifies the maximum acceptable data loss measured in time (here, 15 minutes), driving backup/replication frequency.',
    references: [REF_CP, REF_INCIDENT]
  },
  {
    domain: BCDR, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the FIRST phase of the NIST incident response lifecycle, performed before any incident occurs?',
    options: opts4('Preparation', 'Containment', 'Recovery', 'Lessons learned'),
    correct: ['a'],
    explanation: 'Preparation (policies, tools, training, communication plans) is the first incident response phase and is performed proactively before incidents occur.',
    references: [REF_INCIDENT, REF_CP]
  },
  {
    domain: BCDR, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: An offsite or geographically separate backup copy improves the chance of recovery after a site-wide disaster such as a fire.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Keeping at least one backup copy offsite or in a separate region ensures a localized disaster (fire, flood) does not destroy all copies, enabling recovery.',
    references: [REF_CP, REF_OUTLINE]
  },
  {
    domain: BCDR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL elements typically defined by a Business Continuity / Disaster Recovery program.',
    options: opts4(
      'Recovery Time Objective (RTO)',
      'Recovery Point Objective (RPO)',
      'Identification of critical business functions',
      'The marketing department\'s ad budget'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'BC/DR programs define RTO, RPO, and critical business functions (via a business impact analysis) to prioritize and guide recovery. The marketing ad budget is unrelated.',
    references: [REF_CP, REF_INCIDENT]
  }
];

const ISC2CC_DOMAINS = [
  { name: SP, weight: 26 },
  { name: AC, weight: 22 },
  { name: NS, weight: 24 },
  { name: SO, weight: 18 },
  { name: BCDR, weight: 10 }
];

const ISC2CC_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'isc2-cc-p1',
    code: 'CC-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering security principles, access controls, network security, security operations, and business continuity / disaster recovery / incident response.',
    questions: P1
  },
  {
    slug: 'isc2-cc-p2',
    code: 'CC-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'isc2-cc-p3',
    code: 'CC-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const ISC2CC_BUNDLE = {
  slug: 'isc2-cc',
  title: 'ISC2 Certified in Cybersecurity (CC)',
  description: 'All 3 ISC2 Certified in Cybersecurity (CC) practice exams in one bundle — covering security principles, access controls concepts, network security, security operations, and business continuity / disaster recovery / incident response, aligned to the official ISC2 CC exam outline.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 5000 // USD 50 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the ISC2 Certified in Cybersecurity (CC) bundle.
 * Safe to call repeatedly — vendor / exam / bundle rows are upserted, and
 * questions tagged `generatedBy: 'manual:isc2cc-seed'` are deleted and
 * re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedIsc2Cc(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'isc2' } });
  await db.vendor.upsert({
    where: { slug: 'isc2' },
    update: { name: 'ISC2', description: 'ISC2 cybersecurity certifications — including the entry-level Certified in Cybersecurity (CC) credential covering security principles, access controls, network security, security operations, and continuity/incident response.' },
    create: { slug: 'isc2', name: 'ISC2', description: 'ISC2 cybersecurity certifications — including the entry-level Certified in Cybersecurity (CC) credential covering security principles, access controls, network security, security operations, and continuity/incident response.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'isc2' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of ISC2CC_EXAMS) {
    const title = `ISC2 Certified in Cybersecurity (CC) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official ISC2 Certified in Cybersecurity (CC) exam outline.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: ISC2CC_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:isc2cc-seed' } });
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
          generatedBy: 'manual:isc2cc-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: ISC2CC_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: ISC2CC_BUNDLE.slug },
    update: {
      title: ISC2CC_BUNDLE.title,
      description: ISC2CC_BUNDLE.description,
      price: ISC2CC_BUNDLE.price,
      priceVoucher: ISC2CC_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: ISC2CC_BUNDLE.slug,
      title: ISC2CC_BUNDLE.title,
      description: ISC2CC_BUNDLE.description,
      price: ISC2CC_BUNDLE.price,
      priceVoucher: ISC2CC_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'isc2-cc-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'isc2-cc-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'isc2-cc-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'isc2-cc-p1', tier: 'VOUCHER' as const, position: 4 }
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
