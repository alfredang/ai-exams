/**
 * CompTIA Security+ (SY0-701) bundle seed — vendor, three practice-exam
 * variants, bundle, and 195 blueprint-aligned questions. Idempotent:
 * replaces rows tagged `generatedBy: 'manual:securityplus-seed'` and
 * upserts catalog rows.
 *
 * Exported as `seedSecurityPlus(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/securityplus.ts`) and the
 * protected admin API (`/api/admin/seed-securityplus`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the public CompTIA Security+
 * (SY0-701) exam objectives and NIST publications. Per-variant domain
 * blueprint (65 questions each):
 *   - General Security Concepts                          — 12% (8)
 *   - Threats, Vulnerabilities, and Mitigations          — 22% (14)
 *   - Security Architecture                              — 18% (12)
 *   - Security Operations                                — 28% (18)
 *   - Security Program Management and Oversight          — 20% (13)
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

const CONCEPTS = 'General Security Concepts';
const THREATS = 'Threats, Vulnerabilities, and Mitigations';
const ARCH = 'Security Architecture';
const OPS = 'Security Operations';
const GRC = 'Security Program Management and Oversight';

const REF_OBJECTIVES = { label: 'CompTIA — Security+ (SY0-701) exam objectives', url: 'https://www.comptia.org/certifications/security' };
const REF_NIST_CIA = { label: 'NIST SP 800-12 Rev. 1 — Information security concepts', url: 'https://csrc.nist.gov/pubs/sp/800/12/r1/final' };
const REF_NIST_ZT = { label: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final' };
const REF_NIST_CRYPTO = { label: 'NIST SP 800-175B Rev. 1 — Guideline for using cryptographic standards', url: 'https://csrc.nist.gov/pubs/sp/800/175/b/r1/final' };
const REF_NIST_KEYMGMT = { label: 'NIST SP 800-57 Part 1 Rev. 5 — Recommendation for key management', url: 'https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final' };
const REF_NIST_DIGID = { label: 'NIST SP 800-63B — Digital identity / authentication', url: 'https://csrc.nist.gov/pubs/sp/800/63/b/final' };
const REF_NIST_IR = { label: 'NIST SP 800-61 Rev. 2 — Computer security incident handling guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' };
const REF_NIST_FORENSICS = { label: 'NIST SP 800-86 — Integrating forensic techniques into incident response', url: 'https://csrc.nist.gov/pubs/sp/800/86/final' };
const REF_NIST_RMF = { label: 'NIST SP 800-37 Rev. 2 — Risk Management Framework', url: 'https://csrc.nist.gov/pubs/sp/800/37/r2/final' };
const REF_NIST_CONFIG = { label: 'NIST SP 800-128 — Security-focused configuration management', url: 'https://csrc.nist.gov/pubs/sp/800/128/final' };
const REF_NIST_VULN = { label: 'NIST SP 800-40 Rev. 4 — Guide to enterprise patch management planning', url: 'https://csrc.nist.gov/pubs/sp/800/40/r4/final' };
const REF_NIST_LOG = { label: 'NIST SP 800-92 — Guide to computer security log management', url: 'https://csrc.nist.gov/pubs/sp/800/92/final' };
const REF_NIST_CONTINGENCY = { label: 'NIST SP 800-34 Rev. 1 — Contingency planning guide', url: 'https://csrc.nist.gov/pubs/sp/800/34/r1/final' };
const REF_NIST_MEDIA = { label: 'NIST SP 800-88 Rev. 1 — Guidelines for media sanitization', url: 'https://csrc.nist.gov/pubs/sp/800/88/r1/final' };
const REF_NIST_SUPPLY = { label: 'NIST SP 800-161 Rev. 1 — Cybersecurity supply chain risk management', url: 'https://csrc.nist.gov/pubs/sp/800/161/r1/final' };
const REF_NIST_PII = { label: 'NIST SP 800-122 — Guide to protecting the confidentiality of PII', url: 'https://csrc.nist.gov/pubs/sp/800/122/final' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [
  { id: 'a', text: 'True' }, { id: 'b', text: 'False' }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── General Security Concepts (8) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A database administrator can read and modify customer records, but the application logs every change with a timestamp and the user ID so the action cannot later be denied. Which security principle does this logging primarily provide?',
    options: opts4(
      'Confidentiality',
      'Availability',
      'Non-repudiation',
      'Least privilege'
    ),
    correct: ['c'],
    explanation: 'Non-repudiation ensures a party cannot credibly deny having performed an action. Tamper-evident logs that bind an action to an authenticated identity provide non-repudiation. Confidentiality and availability are separate CIA goals, and least privilege is an access-control practice.',
    references: [REF_NIST_CIA]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'In the AAA framework, a user successfully enters a valid username and password and is then granted access only to the resources their role permits. Which two AAA functions are illustrated, in order?',
    options: opts4(
      'Authorization, then accounting',
      'Authentication, then authorization',
      'Accounting, then authentication',
      'Authorization, then authentication'
    ),
    correct: ['b'],
    explanation: 'Verifying the credentials proves identity (authentication). Determining which resources the proven identity may access is authorization. Accounting is the later recording of what the user actually did.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A network architect is designing access so that no device or user is trusted by default and every request is verified regardless of network location. Which model is being applied?',
    options: opts4(
      'Defense in depth using only perimeter firewalls',
      'Zero trust architecture',
      'Implicit trust within the corporate LAN',
      'Air-gapped segmentation'
    ),
    correct: ['b'],
    explanation: 'Zero trust eliminates implicit trust based on network location and continuously verifies every access request. Perimeter-only and implicit-LAN-trust models assume internal traffic is safe, which zero trust rejects.',
    references: [REF_NIST_ZT]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL elements that are part of a zero trust control plane / policy-driven access decision as described by NIST SP 800-207.',
    options: opts4(
      'A policy engine that evaluates trust before granting access',
      'A policy administrator that establishes or terminates the connection',
      'A flat network where any host can reach any other host once on the LAN',
      'Continuous evaluation of subject and device state'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'NIST SP 800-207 defines a policy engine (decision), a policy administrator (enforces/establishes the session), and continuous evaluation of subject/asset state. A flat, openly reachable LAN is the opposite of zero trust.',
    references: [REF_NIST_ZT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A company encrypts a message with the recipient\'s public key so that only the recipient can read it. Which property of public key infrastructure is being used?',
    options: opts4(
      'Asymmetric encryption for confidentiality',
      'Symmetric key exchange for non-repudiation',
      'Hashing for integrity',
      'Steganography for obfuscation'
    ),
    correct: ['a'],
    explanation: 'Encrypting with the recipient\'s public key means only the matching private key can decrypt, providing confidentiality through asymmetric (public-key) cryptography. Hashing provides integrity, not confidentiality, and steganography hides existence rather than encrypting content.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer wants to prove that a downloaded firmware image has not been altered and genuinely came from the vendor. Which combination best achieves this?',
    options: opts4(
      'A symmetric key shared with all customers',
      'A digital signature created with the vendor\'s private key and verified with its public key',
      'Base64 encoding of the firmware',
      'A salted password hash of the file name'
    ),
    correct: ['b'],
    explanation: 'A digital signature is a hash of the image encrypted with the signer\'s private key; verifying it with the vendor\'s public key proves both integrity and authenticity (origin). Encoding and password hashing do not provide origin assurance.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'A change management process that requires approvals, testing, and a documented rollback plan before modifying production systems is primarily a security control, not just an IT operations practice.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Controlled change management reduces the risk of misconfiguration, unapproved changes, and outages, all of which have security and availability impact, so it is a recognized security control area in the Security+ objectives.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization deploys honeypots and fake credentials to lure and detect attackers. Which category of security control does this represent?',
    options: opts4(
      'Deterrent and deception technology',
      'Corrective control',
      'Compensating physical control',
      'Directive policy control'
    ),
    correct: ['a'],
    explanation: 'Honeypots, honeytokens, and decoy credentials are deception and disruption technologies that detect and mislead attackers. They are not corrective (which restore after an event) or purely directive (policy guidance).',
    references: [REF_OBJECTIVES]
  },

  // ── Threats, Vulnerabilities, and Mitigations (14) ──
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An employee receives an email appearing to be from the CEO urgently requesting a wire transfer. The email targets a specific finance manager by name and title. Which attack is this?',
    options: opts4(
      'Generic phishing',
      'Spear phishing / business email compromise',
      'Smishing',
      'Tailgating'
    ),
    correct: ['b'],
    explanation: 'A targeted email aimed at a specific individual using known details (and impersonating an executive for fraudulent payment) is spear phishing, commonly the basis of business email compromise. Generic phishing is untargeted; smishing uses SMS; tailgating is physical.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A nation-state group conducts a long-term, stealthy intrusion to exfiltrate intellectual property over many months while avoiding detection. This threat actor is best classified as which?',
    options: opts4(
      'Unskilled attacker (script kiddie)',
      'Hacktivist',
      'Advanced persistent threat (APT)',
      'Insider error'
    ),
    correct: ['c'],
    explanation: 'A well-resourced, stealthy, long-dwell actor (often nation-state sponsored) pursuing strategic data over time is an advanced persistent threat. Unskilled attackers lack sophistication, hacktivists pursue ideology publicly, and an insider error is unintentional.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A web application concatenates user input directly into a SQL query. An attacker submits \' OR \'1\'=\'1 into the login field and bypasses authentication. Which mitigation most directly prevents this?',
    options: opts4(
      'Enforcing TLS 1.3 on the site',
      'Using parameterized queries / prepared statements with input validation',
      'Increasing the password complexity policy',
      'Enabling full-disk encryption on the database server'
    ),
    correct: ['b'],
    explanation: 'SQL injection is prevented by parameterized queries (prepared statements) that separate code from data, plus server-side input validation. TLS protects data in transit, and disk encryption or password policy do not stop injection.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE,
    stem: 'Malware encrypts a victim\'s files and demands payment for the decryption key. Which malware type is this?',
    options: opts4(
      'Rootkit',
      'Ransomware',
      'Logic bomb',
      'Keylogger'
    ),
    correct: ['b'],
    explanation: 'Ransomware encrypts data (or systems) and extorts payment for restoration. A rootkit hides presence, a logic bomb triggers on a condition, and a keylogger captures keystrokes.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL indicators that would suggest a system is compromised by malware rather than experiencing a benign performance issue.',
    options: opts4(
      'Outbound connections to known malicious command-and-control IP addresses',
      'Unexpected new scheduled tasks and unknown persistence registry keys',
      'A planned, announced maintenance reboot during the change window',
      'Account lockouts and logins from impossible-travel locations'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'C2 callouts, unexplained persistence mechanisms, and anomalous authentication (impossible travel, lockouts) are classic indicators of compromise. A scheduled, announced maintenance reboot is expected operational activity.',
    references: [REF_NIST_IR]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker exploits a software flaw for which no patch yet exists and the vendor is unaware. What is this called?',
    options: opts4(
      'A zero-day vulnerability',
      'A misconfiguration',
      'An end-of-life vulnerability',
      'A race condition that is always benign'
    ),
    correct: ['a'],
    explanation: 'A zero-day is a vulnerability unknown to the vendor with no available patch, leaving defenders zero days to prepare. End-of-life issues stem from unsupported software, and a misconfiguration is an avoidable setup error.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An attacker places an infected USB drive in a company parking lot hoping an employee plugs it in. Which social engineering technique relies on the victim\'s curiosity in this way?',
    options: opts4(
      'Baiting',
      'Vishing',
      'Pretexting only',
      'Watering hole attack'
    ),
    correct: ['a'],
    explanation: 'Baiting leaves enticing media (such as USB drives) for victims to use, delivering malware. Vishing is voice phishing, pretexting fabricates a scenario, and a watering hole compromises a site the target visits.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 4, type: QType.SINGLE,
    stem: 'A penetration tester captures traffic and replays a previously valid authentication token to gain access. Which attack class is this, and which mitigation is most appropriate?',
    options: opts4(
      'Replay attack — mitigate with nonces/timestamps and short-lived tokens',
      'Brute force — mitigate with longer passwords only',
      'Phishing — mitigate with user training only',
      'Buffer overflow — mitigate with ASLR'
    ),
    correct: ['a'],
    explanation: 'Reusing a captured valid token is a replay attack. Per-session nonces, timestamps, and short-lived/one-time tokens defeat replay. Password length, training, or ASLR address unrelated attack classes.',
    references: [REF_NIST_DIGID]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A vulnerability scan reports a CVSS base score of 9.8 for an internet-facing server with a public exploit available. According to risk-based prioritization, how should this be treated?',
    options: opts4(
      'Defer until the next annual maintenance window',
      'Prioritize for immediate remediation due to high severity, exposure, and exploitability',
      'Ignore because scanners produce only false positives',
      'Accept the risk without documentation'
    ),
    correct: ['b'],
    explanation: 'A critical CVSS score on an internet-facing asset with a known public exploit is high likelihood and high impact, so it should be remediated urgently. Deferring, ignoring, or silently accepting such risk is not defensible.',
    references: [REF_NIST_VULN]
  },
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE,
    stem: 'An attacker overwhelms a web service with traffic from thousands of compromised hosts so legitimate users cannot reach it. Which attack is described?',
    options: opts4(
      'Distributed denial-of-service (DDoS)',
      'On-path (man-in-the-middle)',
      'Privilege escalation',
      'Cross-site scripting'
    ),
    correct: ['a'],
    explanation: 'Flooding a service from many compromised hosts (a botnet) to exhaust resources is a distributed denial-of-service attack. The other options describe interception, gaining higher rights, and injecting scripts into pages.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A web form reflects unsanitized user input back into the page, allowing an attacker to run script in another user\'s browser. Which vulnerability is this and the primary fix?',
    options: opts4(
      'Cross-site scripting (XSS) — output encoding and input validation',
      'SQL injection — full-disk encryption',
      'Directory traversal — stronger Wi-Fi passwords',
      'CSRF — disabling TLS'
    ),
    correct: ['a'],
    explanation: 'Reflecting unsanitized input that executes in a victim\'s browser is cross-site scripting. Context-aware output encoding plus input validation (and a content security policy) mitigate it. The other fixes do not address XSS.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Network segmentation reduces the impact of a compromised host by limiting an attacker\'s lateral movement to other systems.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Segmentation and microsegmentation contain a breach to a smaller zone, restricting lateral movement and limiting blast radius, which is a standard mitigation technique.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 4, type: QType.SINGLE,
    stem: 'A trusted developer with legitimate access deliberately inserts a logic bomb that deletes data 30 days after their account is disabled. Which threat does this best illustrate?',
    options: opts4(
      'Malicious insider threat',
      'Unintentional misconfiguration',
      'Supply chain compromise of a third party',
      'Shadow IT'
    ),
    correct: ['a'],
    explanation: 'An authorized person abusing legitimate access to plant destructive code is a malicious insider threat. It is intentional (not misconfiguration), originates internally (not third-party supply chain), and is not unsanctioned tooling (shadow IT).',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'Two processes use a shared resource without proper locking, and an attacker exploits the gap between a check and the subsequent use. Which vulnerability class is this?',
    options: opts4(
      'Time-of-check to time-of-use (race condition)',
      'Buffer overflow',
      'Insecure deserialization',
      'Open redirect'
    ),
    correct: ['a'],
    explanation: 'Exploiting the window between validating a condition and acting on it is a time-of-check/time-of-use race condition. Buffer overflow corrupts memory, deserialization issues execute crafted objects, and open redirect abuses URL handling.',
    references: [REF_OBJECTIVES]
  },

  // ── Security Architecture (12) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In the cloud shared responsibility model for Infrastructure as a Service (IaaS), which task is the customer\'s responsibility?',
    options: opts4(
      'Securing the physical data center',
      'Patching the guest operating system and applications they deploy',
      'Maintaining the hypervisor',
      'Replacing failed physical disks'
    ),
    correct: ['b'],
    explanation: 'Under IaaS the provider secures the physical facility, hardware, and hypervisor, while the customer is responsible for the guest OS, applications, and data they deploy. The other options are provider responsibilities.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect places public-facing web servers in a screened subnet (DMZ) separated from the internal network by firewalls. What is the primary security benefit?',
    options: opts4(
      'It eliminates the need to patch the web servers',
      'It limits direct exposure of the internal network if a public server is compromised',
      'It encrypts all traffic automatically',
      'It provides multi-factor authentication'
    ),
    correct: ['b'],
    explanation: 'A screened subnet isolates internet-facing systems so that a compromise there does not give direct access to internal resources. It does not remove patching needs, nor inherently provide encryption or MFA.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants to ensure that if one data center fails, operations continue at another site with minimal interruption. Which architectural concept is this?',
    options: opts4(
      'High availability through redundancy and failover',
      'Data minimization',
      'Obfuscation',
      'Least privilege'
    ),
    correct: ['a'],
    explanation: 'Redundant sites with failover provide high availability and resilience against a single point of failure. Data minimization, obfuscation, and least privilege address data exposure and access, not site resilience.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL techniques that protect data confidentiality at rest or in use rather than only in transit.',
    options: opts4(
      'Full-disk encryption on laptops',
      'Database column-level encryption / tokenization',
      'TLS for HTTPS sessions',
      'Hardware security module (HSM) protecting keys used by an application'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Full-disk encryption and column-level encryption/tokenization protect data at rest, and an HSM protects keys used while data is processed. TLS protects data in transit, not at rest.',
    references: [REF_NIST_KEYMGMT]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A firewall rule set ends with an explicit "deny all" after specific allow rules. Which secure design principle does this implement?',
    options: opts4(
      'Implicit allow',
      'Default deny / least functionality',
      'Open by default',
      'Security through obscurity'
    ),
    correct: ['b'],
    explanation: 'Ending with deny-all enforces a default-deny posture so only explicitly permitted traffic passes, reducing attack surface (least functionality). Implicit/open-by-default would allow unlisted traffic, and obscurity is unrelated.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization adopts a Secure Access Service Edge (SASE) solution. What does this primarily converge?',
    options: opts4(
      'Networking (SD-WAN) and security services delivered from the cloud',
      'Only on-premises antivirus signatures',
      'Physical badge readers and CCTV',
      'Database backup schedules'
    ),
    correct: ['a'],
    explanation: 'SASE converges WAN networking (SD-WAN) with cloud-delivered security services such as secure web gateway, CASB, and zero trust network access, enabling consistent policy for distributed users. It is not about physical access or backups.',
    references: [REF_NIST_ZT]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A company stores backups using the 3-2-1 strategy. Which arrangement satisfies it?',
    options: opts4(
      'Three copies, on two different media types, with one copy stored off-site',
      'Three copies all on the same server',
      'One copy on a single cloud bucket only',
      'Two copies on the same disk with one extra file name'
    ),
    correct: ['a'],
    explanation: 'The 3-2-1 rule means at least three copies of data, on at least two different media types, with at least one copy kept off-site, improving resilience against device failure and site loss.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A microservices application is deployed in containers. Which control best limits the blast radius if one container is compromised?',
    options: opts4(
      'Running every container as root for convenience',
      'Network policies / segmentation between services and least-privilege service accounts',
      'Disabling all logging',
      'Sharing a single secret across all services'
    ),
    correct: ['b'],
    explanation: 'Segmenting service-to-service traffic and granting each workload only the privileges it needs constrains lateral movement after a container compromise. Running as root, disabling logging, and sharing secrets all increase risk.',
    references: [REF_NIST_ZT]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'A virtual private network (VPN) using IPsec or TLS primarily protects the confidentiality and integrity of data while it traverses an untrusted network.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. VPN tunnels encrypt and integrity-protect traffic between endpoints across untrusted networks such as the internet, defending against eavesdropping and tampering in transit.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'An architect must protect an industrial control system (ICS/SCADA) that cannot be patched frequently and must not be exposed to the internet. Which approach is most appropriate?',
    options: opts4(
      'Connect it directly to the corporate Wi-Fi for convenience',
      'Isolate it on a segmented OT network with strict allow-listed access and monitoring',
      'Expose it via a public IP with a default password',
      'Disable all monitoring to reduce overhead'
    ),
    correct: ['b'],
    explanation: 'Fragile OT/ICS systems are best protected by network isolation/segmentation, tightly controlled (allow-listed) access, and monitoring, compensating for limited patching. Direct internet or Wi-Fi exposure dramatically increases risk.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An application masks all but the last four digits of stored credit card numbers when displayed to support staff. Which data protection technique is this?',
    options: opts4(
      'Data masking',
      'Full-disk encryption',
      'Key escrow',
      'Load balancing'
    ),
    correct: ['a'],
    explanation: 'Showing only partial values (last four digits) is data masking, which limits exposure of sensitive data to those who do not need the full value. It is distinct from encryption, key escrow, or load balancing.',
    references: [REF_NIST_PII]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'To reduce the chance that a single administrator can unilaterally cause harm, a design requires two different administrators to approve a critical production change. Which principle is applied?',
    options: opts4(
      'Separation of duties',
      'Single sign-on',
      'Federation',
      'Defense in depth at the perimeter only'
    ),
    correct: ['a'],
    explanation: 'Requiring two people to complete or approve a sensitive action enforces separation of duties (and dual control), reducing fraud and error risk. SSO and federation concern authentication, not approval segregation.',
    references: [REF_OBJECTIVES]
  },

  // ── Security Operations (18) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A system administrator removes unused services, closes unnecessary ports, and disables default accounts on a new server before deployment. This process is best described as which?',
    options: opts4(
      'System hardening',
      'Penetration testing',
      'Threat hunting',
      'Tabletop exercise'
    ),
    correct: ['a'],
    explanation: 'Reducing attack surface by removing unneeded services, ports, and default accounts is system hardening (least functionality). Penetration testing simulates attacks, threat hunting proactively searches for adversaries, and a tabletop is a discussion-based exercise.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SIEM correlates logs from firewalls, endpoints, and servers and alerts on a pattern matching a known attack. What is the primary value the SIEM provides here?',
    options: opts4(
      'It encrypts all log data automatically at the source',
      'Centralized aggregation and correlation for faster detection and investigation',
      'It eliminates the need for any human analysts',
      'It patches vulnerable systems automatically'
    ),
    correct: ['b'],
    explanation: 'A SIEM centralizes and correlates events from many sources to detect patterns and speed investigation. It does not inherently encrypt sources, replace analysts, or patch systems.',
    references: [REF_NIST_LOG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'According to NIST SP 800-61, what is the correct ordering of the incident response life cycle phases?',
    options: opts4(
      'Containment → Preparation → Detection → Recovery',
      'Preparation → Detection and Analysis → Containment, Eradication, and Recovery → Post-incident Activity',
      'Detection → Recovery → Preparation → Lessons learned',
      'Eradication → Preparation → Detection → Containment'
    ),
    correct: ['b'],
    explanation: 'NIST SP 800-61 defines the cycle as Preparation; Detection and Analysis; Containment, Eradication, and Recovery; and Post-incident Activity (lessons learned). The other sequences are out of order.',
    references: [REF_NIST_IR]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'During a confirmed ransomware incident, the on-call analyst\'s immediate priority after detection should be which action?',
    options: opts4(
      'Pay the ransom immediately',
      'Contain the incident by isolating affected systems to stop spread',
      'Reimage every machine company-wide before any analysis',
      'Delete all logs to free disk space'
    ),
    correct: ['b'],
    explanation: 'After detection, containment (isolating affected hosts/segments) limits spread and preserves the environment for analysis. Paying ransom is discouraged and risky, mass reimaging destroys evidence prematurely, and deleting logs hampers investigation.',
    references: [REF_NIST_IR]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL practices that correctly preserve digital evidence during a forensic investigation.',
    options: opts4(
      'Create a bit-for-bit forensic image and work from a verified copy',
      'Maintain a documented chain of custody',
      'Calculate and record cryptographic hashes to prove integrity',
      'Analyze directly on the live original drive without imaging'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Forensic best practice is to image evidence, hash it to prove integrity, and maintain chain of custody. Working directly on the original drive risks altering evidence and is improper.',
    references: [REF_NIST_FORENSICS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company implements role-based access control (RBAC). A new accountant is hired. How are permissions assigned most efficiently and securely?',
    options: opts4(
      'Copy permissions from a random existing user',
      'Assign the user to the Accountant role, which carries the predefined least-privilege permissions',
      'Grant domain administrator so nothing is blocked',
      'Give no access and let the user request each file individually forever'
    ),
    correct: ['b'],
    explanation: 'RBAC assigns users to roles whose permissions reflect job needs (least privilege), making provisioning consistent and auditable. Copying arbitrary accounts causes privilege creep, and granting admin violates least privilege.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A bank requires a password plus a one-time code from an authenticator app to log in. Which authentication concept is this?',
    options: opts4(
      'Single-factor authentication',
      'Multi-factor authentication using something you know and something you have',
      'Federation',
      'Accounting'
    ),
    correct: ['b'],
    explanation: 'Combining a password (something you know) with an authenticator-generated code (something you have) is multi-factor authentication, which is stronger than any single factor. Federation and accounting are unrelated concepts.',
    references: [REF_NIST_DIGID]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A vulnerability management program rescans assets after patching to confirm the flaw is no longer present. What is this step called?',
    options: opts4(
      'Validation / remediation verification',
      'Reconnaissance',
      'Exploitation',
      'Social engineering'
    ),
    correct: ['a'],
    explanation: 'Re-scanning after remediation to confirm the vulnerability is fixed is validation (remediation verification), closing the loop in the vulnerability management cycle. The other terms describe attacker activities.',
    references: [REF_NIST_VULN]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A security team writes a SOAR playbook that automatically isolates a host and opens a ticket when an EDR alert fires. What is the main benefit of this automation?',
    options: opts4(
      'It guarantees zero false positives',
      'Faster, consistent response and reduced mean time to respond',
      'It removes the need for any logging',
      'It makes encryption unnecessary'
    ),
    correct: ['b'],
    explanation: 'Security orchestration, automation, and response (SOAR) executes predefined playbooks to respond quickly and consistently, lowering mean time to respond and analyst workload. It does not eliminate false positives or other controls.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A company configures all workstations to retrieve security patches automatically from a managed update service after testing. Which operational practice is this?',
    options: opts4(
      'Patch management',
      'Penetration testing',
      'Data classification',
      'Key rotation'
    ),
    correct: ['a'],
    explanation: 'Systematically testing and deploying vendor updates is patch management, which reduces exposure to known vulnerabilities. The other options address attack simulation, data labeling, and cryptographic key lifecycle.',
    references: [REF_NIST_VULN]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'An EDR product flags a legitimate internal backup tool as malicious and blocks it, disrupting backups. How should this finding be classified and handled?',
    options: opts4(
      'True positive — leave it blocked permanently',
      'False positive — investigate, then tune/allow-list the legitimate tool',
      'False negative — ignore the alert',
      'True negative — escalate to law enforcement'
    ),
    correct: ['b'],
    explanation: 'An alert on benign, legitimate activity is a false positive. The correct handling is to investigate, confirm the tool is authorized, and tune or allow-list it to prevent recurring disruption while keeping detection effective.',
    references: [REF_NIST_LOG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization disables an employee\'s accounts, collects assets, and revokes badge access on their last day. Which IAM process is this?',
    options: opts4(
      'Provisioning',
      'Deprovisioning / offboarding',
      'Privilege escalation',
      'Federation'
    ),
    correct: ['b'],
    explanation: 'Removing access and recovering assets when someone leaves is deprovisioning (offboarding), essential to prevent orphaned accounts and unauthorized access. Provisioning is the onboarding counterpart.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Time synchronization (for example via NTP) across logging systems is important so that correlated events have accurate, comparable timestamps during an investigation.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Without synchronized clocks, event timelines across systems cannot be reliably correlated, undermining detection and forensic reconstruction, so consistent time sources are a logging best practice.',
    references: [REF_NIST_LOG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A security analyst proactively searches the environment for signs of an undetected intrusion using threat intelligence and hypotheses, rather than waiting for an alert. This activity is called what?',
    options: opts4(
      'Threat hunting',
      'Patch management',
      'Backup rotation',
      'User awareness training'
    ),
    correct: ['a'],
    explanation: 'Proactively hypothesizing and searching for adversary activity that evaded automated detection is threat hunting. The other options are reactive or preventive operational tasks unrelated to active searching.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A company enforces that privileged administrative accounts use a separate credential and are checked out from a privileged access management (PAM) vault with session recording. What risk does this most directly reduce?',
    options: opts4(
      'Misuse and compromise of high-privilege accounts',
      'Physical theft of laptops only',
      'DNS cache poisoning',
      'Cross-site scripting in web apps'
    ),
    correct: ['a'],
    explanation: 'PAM with separate privileged credentials, just-in-time checkout, and session recording reduces the risk and impact of privileged account misuse or compromise. It does not address physical theft, DNS poisoning, or XSS.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A baseline configuration is defined and systems are continuously checked for unauthorized deviations. Which operational control is this?',
    options: opts4(
      'Configuration management with drift detection',
      'Penetration testing',
      'Phishing simulation',
      'Data loss prevention'
    ),
    correct: ['a'],
    explanation: 'Establishing secure baselines and monitoring for unauthorized changes (drift) is security-focused configuration management. It differs from offensive testing, awareness simulations, and DLP, which address other risks.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Before disposing of old hard drives containing sensitive data, the company physically shreds the platters. Which control objective does this satisfy?',
    options: opts4(
      'Secure media sanitization to prevent data remanence',
      'High availability',
      'Load balancing',
      'Single sign-on'
    ),
    correct: ['a'],
    explanation: 'Physically destroying media ensures sensitive data cannot be recovered (no data remanence), satisfying secure sanitization/disposal requirements. The other options are unrelated to data destruction.',
    references: [REF_NIST_MEDIA]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A new mobile device enrollment policy requires devices to report OS version, encryption status, and jailbreak/root status before being granted access to corporate resources. Which operational control is this?',
    options: opts4(
      'Device posture / health attestation as a condition of access',
      'A penetration test of the app store',
      'A risk register entry only',
      'A change advisory board meeting'
    ),
    correct: ['a'],
    explanation: 'Evaluating device health (patch level, encryption, integrity) before allowing access enforces device posture/attestation, a key operational control in zero-trust and mobile security. The other options are unrelated governance or testing activities.',
    references: [REF_NIST_ZT]
  },

  // ── Security Program Management and Oversight (13) ──
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization identifies a risk, decides the cost of mitigation exceeds the potential loss, documents the decision, and chooses to take no further action. Which risk treatment is this?',
    options: opts4(
      'Risk transfer',
      'Risk acceptance',
      'Risk avoidance',
      'Risk mitigation'
    ),
    correct: ['b'],
    explanation: 'Knowingly and formally choosing to live with a risk because treatment is not cost-effective is risk acceptance. Transfer shifts it (for example via insurance), avoidance removes the activity, and mitigation reduces it with controls.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company purchases cyber insurance to cover potential breach costs. Which risk treatment strategy does this represent?',
    options: opts4(
      'Risk acceptance',
      'Risk transfer',
      'Risk avoidance',
      'Risk mitigation through hardening'
    ),
    correct: ['b'],
    explanation: 'Shifting the financial impact of a risk to a third party (an insurer) is risk transfer. It does not reduce the likelihood of the event the way mitigation does, nor eliminate the activity (avoidance).',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'In a quantitative risk assessment, an asset is worth $100,000, a fire would destroy 40% of it (exposure factor), and such a fire is expected once every 10 years. What is the annualized loss expectancy (ALE)?',
    options: opts4(
      '$40,000',
      '$4,000',
      '$400,000',
      '$10,000'
    ),
    correct: ['b'],
    explanation: 'Single loss expectancy = $100,000 × 0.40 = $40,000. Annualized rate of occurrence = 1/10 = 0.1. ALE = SLE × ARO = $40,000 × 0.1 = $4,000.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are typically defined in an agreement governing a relationship with a third-party service provider.',
    options: opts4(
      'Service level agreement (SLA) with availability and response targets',
      'Right-to-audit clause and security requirements',
      'The provider\'s personal social media passwords',
      'Data handling, breach notification, and confidentiality (NDA) terms'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Third-party agreements commonly include SLAs, right-to-audit and security requirements, and data handling/breach notification/confidentiality terms. A provider\'s personal social media passwords are never an appropriate contractual element.',
    references: [REF_NIST_SUPPLY]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document is a non-binding agreement that expresses the intent of two parties to work together before a formal contract is signed?',
    options: opts4(
      'Memorandum of understanding (MOU)',
      'Service level agreement (SLA)',
      'Master service agreement (MSA)',
      'Business partners agreement (BPA)'
    ),
    correct: ['a'],
    explanation: 'A memorandum of understanding states a mutual intent to cooperate and is generally non-binding. An SLA defines measurable service levels, an MSA sets overarching contract terms, and a BPA governs a partnership.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulation requires that EU residents\' personal data be processed lawfully and that breaches be reported within a strict timeframe. Which compliance driver is this most associated with?',
    options: opts4(
      'GDPR (data privacy regulation)',
      'A voluntary marketing guideline',
      'An internal naming convention',
      'A firewall vendor manual'
    ),
    correct: ['a'],
    explanation: 'Lawful processing of EU residents\' personal data and mandatory breach notification within tight deadlines are hallmarks of the GDPR, a privacy regulation. The other options are not enforceable compliance obligations.',
    references: [REF_NIST_PII]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An external firm with no operational stake performs an objective evaluation of the organization\'s controls against a standard and issues a formal opinion. What is this best described as?',
    options: opts4(
      'An independent third-party audit / assessment',
      'A phishing campaign',
      'A penetration test scoped only to Wi-Fi',
      'A tabletop exercise run internally'
    ),
    correct: ['a'],
    explanation: 'An impartial external evaluation of controls against a standard with a formal opinion is an independent third-party audit/assessment, valued for objectivity. The other options are different activities with different goals.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company runs simulated phishing emails and short training modules for staff each quarter. Which program element is this?',
    options: opts4(
      'Security awareness and training',
      'Disaster recovery testing',
      'Change advisory board',
      'Penetration testing'
    ),
    correct: ['a'],
    explanation: 'Recurring phishing simulations and user education are part of a security awareness and training program that reduces human-factor risk. It is distinct from DR testing, change governance, and offensive testing.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A business impact analysis (BIA) for a critical system sets a recovery time objective (RTO) of 4 hours. What does the RTO specify?',
    options: opts4(
      'The maximum acceptable amount of data loss measured in time',
      'The maximum tolerable time to restore the system after a disruption',
      'The average age of the hardware',
      'The encryption key length to use'
    ),
    correct: ['b'],
    explanation: 'RTO is the maximum tolerable duration to restore a system/process after disruption. The maximum acceptable data loss measured in time is the recovery point objective (RPO), a different BIA metric.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'During vendor selection, the security team reviews a supplier\'s SOC 2 report, security questionnaire, and software bill of materials. Which program activity is this?',
    options: opts4(
      'Third-party / supply chain risk assessment (due diligence)',
      'Internal salary benchmarking',
      'Marketing analysis',
      'Help desk ticket triage'
    ),
    correct: ['a'],
    explanation: 'Evaluating a supplier\'s attestations, questionnaire responses, and SBOM before engagement is supply chain/third-party risk due diligence, reducing risk inherited from vendors. The other options are unrelated business functions.',
    references: [REF_NIST_SUPPLY]
  },
  {
    domain: GRC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'A data classification policy that labels data as public, internal, confidential, or restricted helps ensure protection controls are applied proportionally to data sensitivity.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Classifying data by sensitivity lets the organization apply proportionate handling, storage, and access controls and is a foundational governance practice for managing information risk.',
    references: [REF_NIST_PII]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization adopts a recognized cybersecurity framework to organize its program around functions such as Identify, Protect, Detect, Respond, and Recover. Which framework is described?',
    options: opts4(
      'The NIST Cybersecurity Framework',
      'A change request form',
      'An acceptable use poster',
      'A network cabling diagram'
    ),
    correct: ['a'],
    explanation: 'The Identify, Protect, Detect, Respond, and Recover (and Govern) functions describe the NIST Cybersecurity Framework, used to structure and mature a security program. The other options are not frameworks.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 4, type: QType.SINGLE,
    stem: 'A risk owner accepts a residual risk that exceeds the organization\'s defined risk appetite without senior leadership approval. Why is this problematic from a governance standpoint?',
    options: opts4(
      'It improves accountability and oversight',
      'Risks beyond the stated appetite require appropriate authority/governance sign-off, so unilateral acceptance undermines oversight',
      'Risk appetite has no bearing on acceptance decisions',
      'It automatically transfers the risk to a vendor'
    ),
    correct: ['b'],
    explanation: 'Governance requires that risks exceeding the defined risk appetite/tolerance be escalated for acceptance by an appropriate authority. Unilateral acceptance bypasses oversight and accountability, which is a governance failure; it does not transfer the risk.',
    references: [REF_NIST_RMF]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── General Security Concepts (8) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A storage array uses RAID and redundant power so the data remains accessible even when a single disk or PSU fails. Which element of the CIA triad is primarily supported?',
    options: opts4(
      'Confidentiality',
      'Integrity',
      'Availability',
      'Non-repudiation'
    ),
    correct: ['c'],
    explanation: 'Redundancy that keeps data and systems reachable despite component failure supports availability. Confidentiality concerns disclosure, integrity concerns unauthorized modification, and non-repudiation concerns proof of action.',
    references: [REF_NIST_CIA]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A certificate authority signs a server\'s certificate, and clients trust the server because they trust the CA. Which PKI concept enables this trust?',
    options: opts4(
      'A chain of trust rooted in a trusted certificate authority',
      'Symmetric pre-shared keys distributed manually',
      'Steganographic embedding of the key',
      'A hash with no key at all'
    ),
    correct: ['a'],
    explanation: 'PKI establishes a chain of trust: clients trust a root/intermediate CA, so certificates the CA signs are trusted without prior contact. Pre-shared symmetric keys and steganography do not provide this scalable trust model.',
    references: [REF_NIST_KEYMGMT]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'An administrator must immediately invalidate a compromised certificate before its expiration. Which mechanism allows clients to learn the certificate is no longer valid?',
    options: opts4(
      'Certificate revocation list (CRL) or OCSP',
      'Increasing the certificate key size',
      'Renaming the certificate file',
      'Disabling DNS'
    ),
    correct: ['a'],
    explanation: 'A certificate revocation list or the Online Certificate Status Protocol lets clients check whether a certificate has been revoked before its natural expiry. Changing key size or file names does not invalidate an issued certificate.',
    references: [REF_NIST_KEYMGMT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes symmetric from asymmetric encryption?',
    options: opts4(
      'Symmetric uses one shared key and is generally faster; asymmetric uses a public/private key pair',
      'Symmetric always uses a public/private key pair',
      'Asymmetric is always faster and uses one key',
      'They are identical in every way'
    ),
    correct: ['a'],
    explanation: 'Symmetric encryption uses a single shared secret key and is computationally faster, making it ideal for bulk data; asymmetric encryption uses a mathematically related public/private key pair and is slower but solves key distribution.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL true statements about cryptographic hash functions.',
    options: opts4(
      'They produce a fixed-length output (digest) for arbitrary input',
      'They are designed to be one-way / infeasible to reverse',
      'They can be decrypted back to the original message with the right key',
      'A small input change should produce a very different digest (avalanche effect)'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Hash functions yield a fixed-size, one-way digest exhibiting the avalanche effect. They are not encryption, so there is no key to "decrypt" a hash back to the original message.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A web service generates a unique random salt per password before hashing and storing it. What attack does the salt primarily defeat?',
    options: opts4(
      'Precomputed rainbow table / hash lookup attacks',
      'TLS downgrade attacks',
      'ARP spoofing',
      'Physical theft of the server'
    ),
    correct: ['a'],
    explanation: 'A unique salt ensures identical passwords hash differently, defeating precomputed rainbow tables and bulk hash lookups. It does not address transport downgrade, ARP spoofing, or physical theft.',
    references: [REF_NIST_DIGID]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'Defense in depth means relying on a single strong control because layering multiple controls is unnecessary.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Defense in depth deliberately layers multiple, diverse controls so that if one fails others still protect the asset; relying on a single control is the opposite of the principle.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company adopts a control framework that categorizes controls as technical, managerial, operational, and physical. A locked server room door is which control type?',
    options: opts4(
      'Technical control',
      'Physical control',
      'Managerial control',
      'Cryptographic control'
    ),
    correct: ['b'],
    explanation: 'A locked door restricting physical entry is a physical control. Technical controls are implemented in technology, managerial controls are policy/management oriented, and cryptographic measures are a subset of technical controls.',
    references: [REF_OBJECTIVES]
  },

  // ── Threats, Vulnerabilities, and Mitigations (14) ──
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An attacker calls the help desk pretending to be a senior executive locked out of an account and pressures the agent to reset the password immediately. Which technique is being used?',
    options: opts4(
      'Vishing combined with authority/urgency pretexting',
      'SQL injection',
      'Cross-site request forgery',
      'DNS tunneling'
    ),
    correct: ['a'],
    explanation: 'A phone-based social engineering call using a fabricated executive identity and urgency/authority pressure is vishing with pretexting. The other options are technical web/network attacks, not phone-based manipulation.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker compromises a popular industry website that the target organization\'s employees frequently visit, in order to infect those employees. Which attack is this?',
    options: opts4(
      'Watering hole attack',
      'Tailgating',
      'Brute force',
      'Smishing'
    ),
    correct: ['a'],
    explanation: 'Compromising a site the intended victims regularly visit so they become infected is a watering hole attack. Tailgating is physical, brute force targets credentials, and smishing uses SMS.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A program copies attacker-controlled input into a fixed-size stack buffer without bounds checking, allowing control-flow hijack. Which vulnerability is this and a key mitigation?',
    options: opts4(
      'Buffer overflow — use safe functions, bounds checking, and ASLR/DEP',
      'Phishing — user training',
      'Weak Wi-Fi password — WPA3',
      'Misconfigured S3 bucket — disable logging'
    ),
    correct: ['a'],
    explanation: 'Unbounded copying into a fixed buffer is a classic buffer overflow. Mitigations include bounds checking, memory-safe functions/languages, and OS protections such as ASLR and DEP. The other answers address unrelated issues.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE,
    stem: 'Software self-replicates across the network without user interaction, consuming bandwidth and infecting hosts. Which malware type is this?',
    options: opts4(
      'Worm',
      'Trojan',
      'Spyware',
      'Adware'
    ),
    correct: ['a'],
    explanation: 'A worm self-propagates across networks without user action. A trojan masquerades as legitimate software, spyware covertly gathers data, and adware displays unwanted advertisements.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid mitigations for credential-based attacks such as password spraying and credential stuffing.',
    options: opts4(
      'Multi-factor authentication',
      'Account lockout / throttling and impossible-travel detection',
      'Reusing the same password across all systems',
      'Monitoring for breached-password reuse and enforcing strong unique passwords'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'MFA, lockout/throttling with anomaly detection, and blocking reused/breached passwords mitigate spraying and stuffing. Password reuse across systems amplifies the attack and is never a mitigation.',
    references: [REF_NIST_DIGID]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker positions themselves between a client and server, transparently intercepting and possibly altering traffic. Which attack and primary defense apply?',
    options: opts4(
      'On-path (MITM) attack — strong mutual TLS and certificate validation',
      'Logic bomb — antivirus signatures',
      'Privilege escalation — disk encryption',
      'Phishing — segmentation'
    ),
    correct: ['a'],
    explanation: 'Intercepting/altering traffic between two parties is an on-path (man-in-the-middle) attack. Properly validated TLS (and certificate pinning/mutual auth) prevents transparent interception. The other defenses do not address MITM.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An employee uses an unsupported operating system that no longer receives security updates. Which vulnerability category does this create?',
    options: opts4(
      'End-of-life / legacy unsupported software vulnerability',
      'A zero-day with vendor awareness',
      'A correctly hardened baseline',
      'A false positive'
    ),
    correct: ['a'],
    explanation: 'Software past end-of-life no longer receives patches, so newly discovered flaws remain permanently exploitable, an end-of-life/legacy vulnerability. This is distinct from zero-days, hardened baselines, or false positives.',
    references: [REF_NIST_VULN]
  },
  {
    domain: THREATS, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker compromises a software vendor\'s build pipeline and inserts malicious code into a signed update delivered to thousands of customers. Which threat does this best illustrate?',
    options: opts4(
      'Supply chain attack',
      'Tailgating',
      'Shoulder surfing',
      'Evil twin Wi-Fi'
    ),
    correct: ['a'],
    explanation: 'Injecting malicious code upstream in a trusted vendor\'s build/distribution process to reach many downstream victims is a supply chain attack. The other options are localized physical or wireless attacks.',
    references: [REF_NIST_SUPPLY]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A vulnerability scanner reports a flaw on a server, but manual testing shows the affected feature is disabled and not exploitable. How is this scanner result classified?',
    options: opts4(
      'False positive',
      'True positive',
      'False negative',
      'Zero-day'
    ),
    correct: ['a'],
    explanation: 'A reported vulnerability that does not actually exist or is not exploitable in context is a false positive. Validation and tuning reduce false positives so analysts focus on real risk.',
    references: [REF_NIST_VULN]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A user installs a free game that secretly opens a backdoor giving an attacker remote control of the machine. Which malware type best describes the game?',
    options: opts4(
      'Trojan with a remote access component (RAT)',
      'Worm',
      'Ransomware',
      'Macro virus only'
    ),
    correct: ['a'],
    explanation: 'Software that appears benign but delivers hidden malicious functionality (here a backdoor for remote control) is a trojan, specifically a remote access trojan. It does not self-replicate like a worm or encrypt files like ransomware.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'To reduce the attack surface of a public web server, the team removes development tools, sample apps, and unused modules. Which mitigation technique is this?',
    options: opts4(
      'Reducing attack surface through hardening / least functionality',
      'Increasing privilege for convenience',
      'Disabling all monitoring',
      'Sharing admin credentials'
    ),
    correct: ['a'],
    explanation: 'Eliminating unnecessary software, samples, and modules shrinks the attack surface (least functionality), a core mitigation. The other options increase rather than reduce risk.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Threat intelligence feeds and indicators of compromise can help defenders detect known malicious infrastructure and adversary techniques earlier.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Curated threat intelligence (IoCs, TTPs) lets defenders proactively block or detect known malicious domains, IPs, hashes, and behaviors, improving detection speed and coverage.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker exploits a flaw to move from a standard user account to SYSTEM/root on the same host. Which technique is this, and which control most directly limits its impact?',
    options: opts4(
      'Privilege escalation — least privilege, prompt patching, and EDR detection',
      'DDoS — rate limiting only',
      'Phishing — spam filtering only',
      'Data exfiltration — backups only'
    ),
    correct: ['a'],
    explanation: 'Gaining higher privileges on a compromised host is privilege escalation. Least privilege, timely patching of the exploited flaw, and endpoint detection reduce both the opportunity and the impact. The other pairs address unrelated attacks.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants to understand which assets are most exposed by simulating real attacker techniques against its environment with permission. Which assessment is this?',
    options: opts4(
      'Penetration testing',
      'Annual budget review',
      'Data classification',
      'License audit'
    ),
    correct: ['a'],
    explanation: 'Authorized simulation of real attacker tactics to find and demonstrate exploitable weaknesses is penetration testing. The other activities do not test exploitability of security controls.',
    references: [REF_OBJECTIVES]
  },

  // ── Security Architecture (12) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a Software as a Service (SaaS) model, which security responsibility remains primarily with the customer?',
    options: opts4(
      'Patching the underlying application code',
      'Managing user access, data, and configuration within the service',
      'Maintaining the physical servers',
      'Securing the provider\'s hypervisor'
    ),
    correct: ['b'],
    explanation: 'In SaaS the provider manages the application, runtime, and infrastructure, while the customer remains responsible for their data, user access/identity, and tenant configuration choices.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization implements a web application firewall (WAF) in front of its public site. What is the primary purpose of the WAF?',
    options: opts4(
      'Filter and block malicious HTTP/S requests such as injection and XSS attempts',
      'Encrypt the database at rest',
      'Provide multi-factor authentication for staff',
      'Replace the need for application patching'
    ),
    correct: ['a'],
    explanation: 'A WAF inspects application-layer HTTP/S traffic to detect and block attacks like SQL injection and XSS. It does not encrypt databases, provide MFA, or remove the need to patch the application itself.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants to detect malicious activity on the network and automatically block it inline. Which device provides this?',
    options: opts4(
      'An intrusion prevention system (IPS)',
      'A passive network tap only',
      'A DHCP server',
      'A print server'
    ),
    correct: ['a'],
    explanation: 'An IPS inspects traffic inline and can actively block detected attacks, unlike an IDS, which only detects/alerts. A tap, DHCP server, and print server do not perform inline threat prevention.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL designs that improve system resilience and availability.',
    options: opts4(
      'Geographic redundancy with failover sites',
      'Load balancing across multiple servers',
      'A single power supply and single network path with no backups',
      'Regular tested backups with offsite copies'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Geographic redundancy, load balancing, and tested offsite backups all increase resilience and availability. A single power supply and single network path with no backups introduces single points of failure.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization minimizes the personal data it collects and retains to only what is necessary for the stated purpose. Which privacy/data protection principle is applied?',
    options: opts4(
      'Data minimization',
      'Data duplication',
      'Unlimited retention',
      'Public disclosure by default'
    ),
    correct: ['a'],
    explanation: 'Collecting and keeping only the data needed for a defined purpose is data minimization, reducing breach impact and compliance exposure. The other options increase risk and conflict with privacy principles.',
    references: [REF_NIST_PII]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design enforces that an application server can only initiate outbound connections to a specific database port on a specific host and nothing else. Which concept does this apply at the network layer?',
    options: opts4(
      'Least privilege / allow-listing applied to network flows',
      'Implicit any-any permit',
      'Security through obscurity',
      'Unrestricted egress'
    ),
    correct: ['a'],
    explanation: 'Restricting a host to only the specific destinations and ports it legitimately needs applies least privilege via allow-listing to network flows, limiting lateral movement and exfiltration. Any-any permit and unrestricted egress are the opposite.',
    references: [REF_NIST_ZT]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A company tokenizes credit card numbers so that systems store a non-sensitive token while the real value stays in a secure vault. What is the main security advantage?',
    options: opts4(
      'Systems handling tokens are removed from much of the sensitive-data exposure and compliance scope',
      'It makes the data publicly shareable',
      'It eliminates the need for any access control',
      'It increases the value of stolen tokens'
    ),
    correct: ['a'],
    explanation: 'Tokenization replaces sensitive values with non-sensitive surrogates so most systems never touch the real data, reducing exposure and compliance scope. Stolen tokens are not usable without the vault mapping.',
    references: [REF_NIST_PII]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An enterprise routes all remote-user traffic through a cloud security stack that enforces identity-aware, per-application access instead of granting full network VPN access. Which model is this?',
    options: opts4(
      'Zero Trust Network Access (ZTNA)',
      'Flat L2 bridging',
      'Open guest Wi-Fi',
      'Legacy split-horizon DNS only'
    ),
    correct: ['a'],
    explanation: 'Granting least-privilege, identity- and context-aware access to specific applications rather than the whole network is Zero Trust Network Access. It contrasts with broad VPN network access and the unrelated options.',
    references: [REF_NIST_ZT]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'Placing a database server with no internet requirement on an internal segment with no inbound internet access reduces its external attack surface.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Keeping a server that has no need for internet exposure off any inbound internet path removes a large class of external attacks and is a standard segmentation/architecture practice.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'A high-security application needs cryptographic keys generated and stored so that the private keys never leave tamper-resistant hardware. Which component should be used?',
    options: opts4(
      'A hardware security module (HSM)',
      'A plaintext file on a web server',
      'A spreadsheet emailed to admins',
      'The application source code repository'
    ),
    correct: ['a'],
    explanation: 'An HSM generates, stores, and uses keys inside tamper-resistant hardware so private keys are never exposed in plaintext, ideal for high-assurance key management. The other options expose keys and are insecure.',
    references: [REF_NIST_KEYMGMT]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A mobile device management (MDM) solution enforces encryption, screen lock, and remote wipe on corporate phones. Which architectural goal does remote wipe specifically support?',
    options: opts4(
      'Protecting data confidentiality if a device is lost or stolen',
      'Increasing battery life',
      'Improving cellular signal',
      'Reducing application licensing cost'
    ),
    correct: ['a'],
    explanation: 'Remote wipe lets the organization erase corporate data on a lost or stolen device, protecting confidentiality of data at rest on mobile endpoints. The other options are unrelated to security objectives.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An architect introduces a jump server (bastion host) that administrators must connect through to reach sensitive internal systems. What is the primary benefit?',
    options: opts4(
      'A single hardened, monitored, and controlled entry point for administrative access',
      'It removes the need for authentication',
      'It exposes all internal systems directly to the internet',
      'It disables logging on internal servers'
    ),
    correct: ['a'],
    explanation: 'A bastion/jump host concentrates administrative access through one hardened, heavily monitored chokepoint, simplifying control and auditing. It does not remove authentication or expose internal systems directly.',
    references: [REF_OBJECTIVES]
  },

  // ── Security Operations (18) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A company applies a vendor-recommended secure configuration benchmark (such as a CIS Benchmark) to all new servers. This establishes what?',
    options: opts4(
      'A secure baseline configuration',
      'A penetration test report',
      'A risk register',
      'A phishing simulation'
    ),
    correct: ['a'],
    explanation: 'Applying a recognized secure benchmark defines a secure baseline configuration that systems are built to and audited against. It is not an offensive test, risk register, or awareness exercise.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A data loss prevention (DLP) system blocks an email containing a spreadsheet of customer Social Security numbers from being sent externally. Which operational objective is met?',
    options: opts4(
      'Preventing unauthorized exfiltration of sensitive data',
      'Improving network throughput',
      'Generating TLS certificates',
      'Load balancing web traffic'
    ),
    correct: ['a'],
    explanation: 'DLP inspects content and enforces policy to stop sensitive data (such as SSNs) from leaving via email, web, or endpoints, directly preventing unauthorized exfiltration. The other options are unrelated functions.',
    references: [REF_NIST_PII]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'During incident response, after containment the team removes malware, closes the exploited vulnerability, and rebuilds affected hosts from known-good images. Which phase is this?',
    options: opts4(
      'Eradication and recovery',
      'Preparation',
      'Detection',
      'Lessons learned only'
    ),
    correct: ['a'],
    explanation: 'Removing the threat, fixing the root cause, and restoring systems to known-good states is the eradication and recovery phase that follows containment in the NIST incident response life cycle.',
    references: [REF_NIST_IR]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'An analyst must collect volatile evidence from a running compromised host. According to forensic order of volatility, which data should generally be collected first?',
    options: opts4(
      'Archived backup tapes',
      'CPU registers, cache, and RAM contents',
      'Data on a powered-off external drive',
      'Printed documents'
    ),
    correct: ['b'],
    explanation: 'The order of volatility dictates collecting the most volatile data first; CPU registers/cache and system memory disappear on power loss and must be captured before less volatile sources like disks or backups.',
    references: [REF_NIST_FORENSICS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL controls that strengthen identity and access management.',
    options: opts4(
      'Multi-factor authentication for privileged accounts',
      'Periodic access reviews / recertification',
      'Permanent shared administrator accounts with no expiry',
      'Just-in-time privilege elevation'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'MFA, periodic access recertification, and just-in-time elevation all reduce identity risk. Permanent shared admin accounts undermine accountability and least privilege and weaken IAM.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company integrates threat intelligence into its monitoring so the SIEM automatically flags traffic to newly reported malicious domains. This is an example of what?',
    options: opts4(
      'Operationalizing threat intelligence for detection',
      'Disaster recovery testing',
      'Data classification',
      'Physical access control'
    ),
    correct: ['a'],
    explanation: 'Feeding curated indicators into detection tooling so alerts fire on known-bad infrastructure operationalizes threat intelligence, improving detection. The other options are different operational or governance activities.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A user authenticates once to a portal and is then automatically signed in to multiple connected applications without re-entering credentials. Which technology is this?',
    options: opts4(
      'Single sign-on (SSO)',
      'Air gap',
      'Full-disk encryption',
      'Port mirroring'
    ),
    correct: ['a'],
    explanation: 'Authenticating once and gaining access to multiple trusting applications is single sign-on, typically via federation protocols such as SAML or OIDC. The other options are unrelated controls.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A vulnerability management team must decide which of hundreds of findings to fix first. Which approach is the most defensible prioritization?',
    options: opts4(
      'Fix in alphabetical order of hostname',
      'Prioritize by severity, exploitability, asset criticality, and exposure',
      'Fix only the cheapest issues regardless of risk',
      'Fix nothing until the annual audit'
    ),
    correct: ['b'],
    explanation: 'Risk-based prioritization weighs severity, known exploitation, the criticality of the affected asset, and its exposure, focusing limited effort on the greatest risk. Arbitrary or cost-only ordering ignores actual risk.',
    references: [REF_NIST_VULN]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team builds an automation pipeline that scans every code commit for vulnerabilities and secrets before deployment. Which security operations practice is this?',
    options: opts4(
      'Automated security testing integrated into the CI/CD pipeline',
      'Manual annual code review only',
      'Disabling version control',
      'Shipping code without any scanning'
    ),
    correct: ['a'],
    explanation: 'Embedding automated vulnerability and secret scanning into the CI/CD pipeline (security automation) catches issues early and consistently. The other options reduce coverage or remove safeguards.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An EDR agent detects a previously unknown malicious process by recognizing suspicious behavior rather than a known signature. Which detection method is this?',
    options: opts4(
      'Behavior/heuristic-based detection',
      'Signature-only detection',
      'DNS round-robin',
      'Static IP assignment'
    ),
    correct: ['a'],
    explanation: 'Identifying malware by anomalous or malicious behavior rather than a known signature is behavior/heuristic-based detection, effective against novel threats. Signature-only detection misses unknown malware.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'Centralized logs are forwarded to a write-once, access-controlled log store that analysts cannot modify. What is the primary security benefit?',
    options: opts4(
      'Protecting log integrity so an attacker cannot easily cover their tracks',
      'Reducing electricity costs',
      'Improving video conference quality',
      'Eliminating the need for backups'
    ),
    correct: ['a'],
    explanation: 'Immutable, access-controlled log storage preserves log integrity and availability for investigations, preventing attackers (or insiders) from tampering with or deleting evidence. It is unrelated to power, conferencing, or backups.',
    references: [REF_NIST_LOG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A new contractor is granted only the specific application permissions needed for a 3-month project, set to expire automatically. Which two principles are demonstrated?',
    options: opts4(
      'Least privilege and time-bound access',
      'Implicit trust and permanent access',
      'Shared accounts and no expiry',
      'Privilege creep and standing access'
    ),
    correct: ['a'],
    explanation: 'Granting only required permissions (least privilege) that automatically expire when no longer needed (time-bound/just-in-time access) limits exposure from contractor accounts. The other options describe poor practices.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Disabling rather than immediately deleting a departing employee\'s account can be appropriate to preserve data and audit trails while still removing access.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Promptly disabling access removes the risk while retaining the account and its data for legal hold, investigation, or data transfer; deletion can be performed later per retention policy.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company schedules authenticated vulnerability scans weekly and credentialed scans monthly, then tracks remediation to closure. Which program is this?',
    options: opts4(
      'A continuous vulnerability management program',
      'A marketing campaign',
      'A payroll process',
      'A disaster recovery site build'
    ),
    correct: ['a'],
    explanation: 'Recurring scanning combined with tracked remediation to closure is a continuous vulnerability management program, reducing the window of exposure to known flaws. The other options are unrelated business activities.',
    references: [REF_NIST_VULN]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC analyst reviews an alert, determines its validity and severity, and decides whether to escalate. This first-line activity is called what?',
    options: opts4(
      'Alert triage',
      'Penetration testing',
      'Capacity planning',
      'Patch deployment'
    ),
    correct: ['a'],
    explanation: 'Assessing incoming alerts for validity, severity, and escalation is alert triage, the front line of security operations that filters noise from real incidents. The other options are different activities.',
    references: [REF_NIST_IR]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization enforces conditional access so logins from unmanaged devices or unusual locations require additional verification or are blocked. Which operational concept is applied?',
    options: opts4(
      'Risk-based / adaptive authentication',
      'Static single-factor login',
      'Open access from any device',
      'Disabling MFA for convenience'
    ),
    correct: ['a'],
    explanation: 'Adjusting authentication requirements based on device posture, location, and risk signals is risk-based (adaptive) authentication / conditional access. The other options weaken rather than strengthen access security.',
    references: [REF_NIST_DIGID]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'After a security incident, the team holds a structured meeting to document what happened, what worked, and what to improve. Which incident response activity is this?',
    options: opts4(
      'Post-incident review / lessons learned',
      'Initial detection',
      'Containment',
      'Preparation only'
    ),
    correct: ['a'],
    explanation: 'A structured post-incident (lessons learned) review captures root cause and improvement actions, feeding back into preparation. It occurs after recovery, not during detection or containment.',
    references: [REF_NIST_IR]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A security team enforces application allow-listing so only explicitly approved executables can run on endpoints. Which threat does this most directly reduce?',
    options: opts4(
      'Execution of unauthorized or malicious software, including unknown malware',
      'Slow network throughput',
      'High electricity costs',
      'Poor video conferencing quality'
    ),
    correct: ['a'],
    explanation: 'Application allow-listing permits only approved binaries to execute, blocking unauthorized and unknown malware by default. It is an operational hardening control unrelated to network, power, or conferencing performance.',
    references: [REF_NIST_CONFIG]
  },

  // ── Security Program Management and Oversight (13) ──
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization stops offering a high-risk legacy online service entirely because the residual risk is unacceptable and cannot be reduced enough. Which risk treatment is this?',
    options: opts4(
      'Risk avoidance',
      'Risk acceptance',
      'Risk transfer',
      'Risk monitoring only'
    ),
    correct: ['a'],
    explanation: 'Eliminating the activity that generates an unacceptable risk is risk avoidance. Acceptance keeps the risk, transfer shifts the impact, and monitoring merely observes it without removing the activity.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A policy defines acceptable use of company systems and the consequences of violations, and all staff must acknowledge it. Which document type is this?',
    options: opts4(
      'Acceptable use policy (AUP)',
      'Network diagram',
      'Penetration test scope',
      'Software license key'
    ),
    correct: ['a'],
    explanation: 'A document defining permitted use of organizational systems and consequences for misuse, acknowledged by users, is an acceptable use policy, a governance/management control. The other options are not policies.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company maintains a living document listing identified risks, their owners, severity, treatment, and status. What is this artifact called?',
    options: opts4(
      'A risk register',
      'A change ticket',
      'A firewall rule base',
      'A user manual'
    ),
    correct: ['a'],
    explanation: 'A risk register records identified risks with ownership, assessment, treatment decisions, and status, supporting ongoing risk governance and reporting. The other options serve different purposes.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid components of a strong vendor/third-party risk management program.',
    options: opts4(
      'Security assessments or questionnaires before onboarding',
      'Contractual security and breach-notification requirements',
      'Skipping all due diligence for trusted brand-name vendors',
      'Ongoing monitoring of the vendor\'s security posture'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Pre-onboarding assessment, contractual security/breach terms, and continuous monitoring are core to third-party risk management. Skipping due diligence for any vendor (even well-known ones) is a recognized failure mode.',
    references: [REF_NIST_SUPPLY]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document specifies measurable performance commitments, such as 99.9% uptime, between a provider and a customer?',
    options: opts4(
      'Service level agreement (SLA)',
      'Memorandum of understanding (MOU)',
      'Non-disclosure agreement (NDA)',
      'Acceptable use policy (AUP)'
    ),
    correct: ['a'],
    explanation: 'An SLA defines measurable service commitments (such as uptime and response times) and remedies. An MOU expresses intent, an NDA protects confidentiality, and an AUP governs system usage.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulation requires safeguarding cardholder data and applies to any organization that stores, processes, or transmits payment card information. Which compliance standard is this?',
    options: opts4(
      'PCI DSS',
      'A voluntary blog post',
      'An internal coding style guide',
      'A printer driver EULA'
    ),
    correct: ['a'],
    explanation: 'The Payment Card Industry Data Security Standard governs organizations handling cardholder data. Non-compliance can bring fines and loss of card-processing privileges. The other options impose no such obligations.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An internal audit team, independent of IT operations, evaluates whether security controls are designed and operating effectively and reports to leadership. What is the value of independence here?',
    options: opts4(
      'It reduces conflicts of interest and increases objectivity of findings',
      'It guarantees no incidents will ever occur',
      'It replaces the need for any controls',
      'It eliminates the need for management oversight'
    ),
    correct: ['a'],
    explanation: 'Auditor independence from the function being assessed reduces conflicts of interest and increases the credibility and objectivity of findings. It does not guarantee zero incidents or remove the need for controls and oversight.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'New employees must complete security onboarding covering phishing recognition, data handling, and reporting procedures. Which program element is this?',
    options: opts4(
      'Security awareness and training',
      'Incident eradication',
      'Vulnerability scanning',
      'Network segmentation'
    ),
    correct: ['a'],
    explanation: 'Educating staff on threats, safe data handling, and reporting is security awareness and training, a managerial control that reduces human-factor risk. The other options are technical or operational measures.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A disaster recovery plan defines a recovery point objective (RPO) of 1 hour for a database. What does the RPO mean?',
    options: opts4(
      'The maximum acceptable amount of data loss, expressed as a time window',
      'The maximum time allowed to restore service',
      'The number of administrators required',
      'The cost of the database license'
    ),
    correct: ['a'],
    explanation: 'RPO is the maximum tolerable data loss measured in time; a 1-hour RPO means backups/replication must ensure no more than one hour of data is lost. The maximum time to restore is the RTO.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company runs a discussion-based exercise where stakeholders walk through their roles in a simulated ransomware scenario without touching production systems. Which exercise type is this?',
    options: opts4(
      'Tabletop exercise',
      'Full interruption/parallel failover test',
      'Penetration test',
      'Vulnerability scan'
    ),
    correct: ['a'],
    explanation: 'A facilitated, discussion-based walkthrough of roles and decisions in a scenario, without affecting production, is a tabletop exercise, useful for validating plans cheaply. A full interruption test actually fails systems over.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: GRC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'Defining clear roles such as data owner, data custodian, and data processor improves accountability for protecting information assets.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Assigning data ownership and custodianship clarifies who is accountable for classification, protection, and handling decisions, a foundational governance practice for data security.',
    references: [REF_NIST_PII]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization formally measures residual risk after controls are applied and compares it to its defined risk tolerance before deciding whether further treatment is needed. This decision-making is part of which process?',
    options: opts4(
      'Risk management / risk assessment',
      'Patch deployment',
      'Network cabling',
      'Marketing segmentation'
    ),
    correct: ['a'],
    explanation: 'Evaluating residual risk against defined tolerance to decide on further treatment is core to the risk management/assessment process under frameworks such as the NIST RMF. The other options are unrelated operational tasks.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 4, type: QType.SINGLE,
    stem: 'A company is subject to a data privacy law that grants individuals the right to request deletion of their personal data. Failing to honor valid requests would most directly create which type of exposure?',
    options: opts4(
      'Regulatory and legal non-compliance consequences (fines, penalties)',
      'Improved customer trust',
      'Lower electricity usage',
      'Faster CPU performance'
    ),
    correct: ['a'],
    explanation: 'Not honoring legally mandated data subject rights (such as deletion) exposes the organization to regulatory enforcement, fines, and legal liability, a compliance/governance consequence. It does not yield the unrelated benefits listed.',
    references: [REF_NIST_PII]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── General Security Concepts (8) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A file\'s SHA-256 hash is published alongside the download so users can verify it after downloading. Which security goal does comparing the hash primarily verify?',
    options: opts4(
      'Confidentiality',
      'Integrity',
      'Availability',
      'Authorization'
    ),
    correct: ['b'],
    explanation: 'Comparing a recomputed hash to a published one detects unauthorized or accidental modification, verifying integrity. It does not conceal the file (confidentiality), keep it reachable (availability), or grant rights (authorization).',
    references: [REF_NIST_CIA]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A user signs a document with their private key, and recipients verify it with the user\'s public key. Which two properties does this digital signature provide?',
    options: opts4(
      'Confidentiality and availability',
      'Integrity and non-repudiation (origin authentication)',
      'Anonymity and deniability',
      'Load balancing and caching'
    ),
    correct: ['b'],
    explanation: 'A digital signature lets anyone verify the content was not altered (integrity) and that it was signed by the holder of the private key (authenticity/non-repudiation). It does not by itself provide confidentiality.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A protocol negotiates a fresh session key for every session so that compromise of a long-term key does not expose past traffic. Which property is this?',
    options: opts4(
      'Perfect forward secrecy',
      'Key escrow',
      'Hard-coded keys',
      'Plaintext transport'
    ),
    correct: ['a'],
    explanation: 'Perfect forward secrecy uses ephemeral per-session keys so that compromising a long-term key does not allow decrypting previously captured sessions. Key escrow and hard-coded keys do not provide this guarantee.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'In access control, an authenticated user attempts to open a file but is denied because their role lacks the required permission. Which AAA function performed this check?',
    options: opts4(
      'Authentication',
      'Authorization',
      'Accounting',
      'Auditing of physical access'
    ),
    correct: ['b'],
    explanation: 'Deciding whether an already-authenticated subject may perform an action on a resource is authorization. Authentication established identity earlier, and accounting records activity afterward.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL accurate statements about the principle of least privilege.',
    options: opts4(
      'Subjects should have only the minimum access required to perform their tasks',
      'It limits the damage from compromised accounts and insider misuse',
      'Every user should be a local administrator for convenience',
      'Access should be reviewed and removed when no longer needed'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Least privilege grants only the minimum necessary access, reducing blast radius from compromise or misuse, and requires periodic review/removal of unneeded access. Making everyone a local admin directly violates the principle.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A control is implemented to satisfy a control objective that the primary control cannot currently meet, while providing comparable protection. What is this called?',
    options: opts4(
      'A compensating control',
      'A detective control only',
      'A redundant power supply',
      'An acceptable use policy'
    ),
    correct: ['a'],
    explanation: 'A compensating control is an alternative measure that provides comparable protection when the primary or required control is not feasible, satisfying the underlying objective. It is defined by purpose, not by being detective or physical.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'Encryption alone always guarantees the integrity of a message, so a separate integrity check is never needed.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Many encryption modes provide confidentiality but not integrity; tampering can go undetected unless an integrity mechanism (such as an HMAC or authenticated encryption) is also used.',
    references: [REF_NIST_CRYPTO]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A security poster reminds employees to lock their screens and report suspicious emails. Which control category does the poster best represent?',
    options: opts4(
      'A directive/managerial control',
      'A cryptographic control',
      'A physical barrier control',
      'A network technical control'
    ),
    correct: ['a'],
    explanation: 'Guidance that instructs people on expected secure behavior is a directive (managerial) control. It is not a cryptographic, physical barrier, or network technical mechanism.',
    references: [REF_OBJECTIVES]
  },

  // ── Threats, Vulnerabilities, and Mitigations (14) ──
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A text message claims the recipient\'s bank account is locked and provides a link to "verify" credentials. Which attack is this?',
    options: opts4(
      'Smishing',
      'Buffer overflow',
      'Privilege escalation',
      'Directory traversal'
    ),
    correct: ['a'],
    explanation: 'Phishing delivered via SMS text message is smishing. The other options are technical software/application attacks unrelated to text-message social engineering.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'An employee follows an authorized person through a secured door without badging in. Which physical threat is this, and which control most directly counters it?',
    options: opts4(
      'Tailgating — mantraps/access vestibules and security awareness',
      'SQL injection — input validation',
      'DDoS — rate limiting',
      'XSS — output encoding'
    ),
    correct: ['a'],
    explanation: 'Following an authorized person through a controlled door without authenticating is tailgating. Access vestibules (mantraps), turnstiles, and awareness training counter it. The other pairs address software/network attacks.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A rogue wireless access point is set up with the same SSID as the corporate Wi-Fi to trick users into connecting. Which attack is this?',
    options: opts4(
      'Evil twin / rogue access point',
      'Logic bomb',
      'Ransomware',
      'SQL injection'
    ),
    correct: ['a'],
    explanation: 'An attacker-controlled access point impersonating a legitimate SSID to intercept connections is an evil twin (a type of rogue AP). The other options are unrelated malware or injection attacks.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE,
    stem: 'Malware that hides its presence by subverting the operating system, often loading early and concealing files and processes, is best described as which?',
    options: opts4(
      'Rootkit',
      'Adware',
      'Spam',
      'CAPTCHA'
    ),
    correct: ['a'],
    explanation: 'A rootkit modifies or subverts the OS to hide malicious files, processes, and itself, making detection and removal difficult. Adware and spam are nuisance categories, and a CAPTCHA is a bot challenge, not malware.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL effective mitigations against phishing and social engineering.',
    options: opts4(
      'Recurring user awareness training and simulated phishing',
      'Email authentication (SPF, DKIM, DMARC) and filtering',
      'Publishing all employee passwords internally',
      'Multi-factor authentication to limit the value of stolen credentials'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Awareness training, email authentication/filtering, and MFA all reduce phishing success or its impact. Publishing passwords internally is never a control and would drastically increase risk.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A scanner finds a default administrative account with the vendor\'s default password still enabled on a network appliance. Which weakness category is this?',
    options: opts4(
      'Misconfiguration / weak default credentials',
      'A zero-day exploit',
      'A correctly hardened device',
      'An encrypted backup'
    ),
    correct: ['a'],
    explanation: 'Leaving default accounts and passwords enabled is a misconfiguration (weak default credentials) that attackers commonly exploit. It is not a zero-day, and it indicates the device is not hardened.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: THREATS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An attacker tries a few very common passwords against many different user accounts to avoid lockouts. Which attack is this?',
    options: opts4(
      'Password spraying',
      'Rainbow table generation',
      'Phishing',
      'Smishing'
    ),
    correct: ['a'],
    explanation: 'Trying a small number of common passwords across many accounts to evade per-account lockout is password spraying. It differs from rainbow tables (precomputed hash attacks) and phishing/smishing (social engineering).',
    references: [REF_NIST_DIGID]
  },
  {
    domain: THREATS, difficulty: 4, type: QType.SINGLE,
    stem: 'An open-source library used by an application has a publicly disclosed critical vulnerability. The application has not updated the dependency. Which risk category and mitigation apply?',
    options: opts4(
      'Vulnerable/outdated component — track an SBOM and patch or upgrade the dependency',
      'Physical theft — disk encryption',
      'Tailgating — mantrap',
      'Vishing — caller ID only'
    ),
    correct: ['a'],
    explanation: 'Using a dependency with a known critical flaw is a vulnerable/outdated component risk. Maintaining a software bill of materials and promptly upgrading/patching the affected library mitigates it. The other pairs address unrelated threats.',
    references: [REF_NIST_SUPPLY]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'During an investigation, analysts find that malware established a scheduled task and a run key so it survives reboots. Which adversary behavior is this?',
    options: opts4(
      'Persistence',
      'Initial reconnaissance',
      'Data classification',
      'Patch management'
    ),
    correct: ['a'],
    explanation: 'Mechanisms that let malware survive reboots and continue executing (scheduled tasks, run keys, services) constitute persistence, a key indicator of compromise. Reconnaissance is pre-attack discovery; the other options are defensive activities.',
    references: [REF_NIST_IR]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker manipulates a URL parameter such as ../../etc/passwd to read files outside the intended web directory. Which vulnerability is this?',
    options: opts4(
      'Directory/path traversal',
      'Cross-site scripting',
      'Replay attack',
      'ARP poisoning'
    ),
    correct: ['a'],
    explanation: 'Using ../ sequences to escape the intended directory and access arbitrary files is directory (path) traversal. It is mitigated by input validation and canonicalization. The other options are different attack classes.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants early warning when employee credentials appear in public breach dumps. Which capability provides this?',
    options: opts4(
      'Threat intelligence / credential-exposure monitoring',
      'A new printer driver',
      'A faster CPU',
      'A brighter monitor'
    ),
    correct: ['a'],
    explanation: 'Monitoring breach data and dark-web sources for exposed organizational credentials is a threat-intelligence capability that enables proactive password resets before attackers exploit the credentials. The other options are irrelevant.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Disabling or removing unused accounts and services on a system reduces the number of potential entry points an attacker can target.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Removing unused accounts and services reduces the attack surface, eliminating credentials and listening services an attacker could otherwise exploit, which is a standard hardening mitigation.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: THREATS, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker poisons a local network so victims\' traffic for the gateway is sent to the attacker\'s machine instead. Which technique is this, and a key defense?',
    options: opts4(
      'ARP poisoning/spoofing — dynamic ARP inspection and segmentation',
      'SQL injection — parameterized queries',
      'Phishing — DMARC',
      'Buffer overflow — ASLR'
    ),
    correct: ['a'],
    explanation: 'Forging ARP replies so traffic destined for the gateway is redirected to the attacker is ARP poisoning, enabling on-path interception. Dynamic ARP inspection, port security, and segmentation mitigate it. The other pairs address different attacks.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: THREATS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company performs an authorized assessment where testers receive no internal knowledge and must discover everything as an external attacker would. Which test approach is this?',
    options: opts4(
      'Black-box (unknown environment) penetration test',
      'A code style review',
      'A data classification exercise',
      'A backup restore drill'
    ),
    correct: ['a'],
    explanation: 'A penetration test where testers have no prior internal knowledge and operate like an external attacker is a black-box (unknown environment) test. The other options do not assess exploitability from an attacker viewpoint.',
    references: [REF_OBJECTIVES]
  },

  // ── Security Architecture (12) ──
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a Platform as a Service (PaaS) model, which item is generally the provider\'s responsibility rather than the customer\'s?',
    options: opts4(
      'The customer\'s application code logic',
      'The runtime, operating system, and underlying infrastructure',
      'The customer\'s data classification decisions',
      'The customer\'s user access policies'
    ),
    correct: ['b'],
    explanation: 'In PaaS the provider manages the runtime, OS, and infrastructure, while the customer is responsible for their application code, data, and access decisions deployed on the platform.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants automatically scalable, isolated test environments that can be created and destroyed quickly without manual server builds. Which approach best supports this securely?',
    options: opts4(
      'Infrastructure as code with immutable, version-controlled definitions',
      'Manually editing production servers by hand',
      'Sharing one static server for all environments',
      'Disabling change tracking'
    ),
    correct: ['a'],
    explanation: 'Infrastructure as code provisions consistent, repeatable, version-controlled environments that can be created and torn down on demand, improving consistency and auditability. Manual or shared static approaches are error-prone and less secure.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An IDS is deployed in a mode where it only observes a copy of traffic via a SPAN/tap and raises alerts but cannot block. What is the main limitation versus an IPS?',
    options: opts4(
      'It can detect but not actively prevent attacks in real time',
      'It encrypts all traffic by default',
      'It authenticates users',
      'It assigns IP addresses'
    ),
    correct: ['a'],
    explanation: 'A passively deployed IDS detects and alerts but cannot drop malicious traffic, whereas an inline IPS can block in real time. An IDS does not encrypt traffic, authenticate users, or assign addresses.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL approaches that help protect data confidentiality.',
    options: opts4(
      'Encrypting sensitive data at rest and in transit',
      'Applying access controls and need-to-know',
      'Posting sensitive data on a public website',
      'Masking or tokenizing data shown to low-privilege users'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Encryption, access control/need-to-know, and masking/tokenization all protect confidentiality. Publicly posting sensitive data is a direct confidentiality breach, not a protection.',
    references: [REF_NIST_PII]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.SINGLE,
    stem: 'A clustered database uses synchronous replication to a standby node so a failure causes near-instant failover. Which design goal is primarily achieved?',
    options: opts4(
      'High availability / fault tolerance',
      'Data minimization',
      'Steganography',
      'Least privilege'
    ),
    correct: ['a'],
    explanation: 'Replication with rapid failover keeps the service available despite a node failure, achieving high availability and fault tolerance. The other concepts address data exposure and access, not uptime.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization separates production, staging, and development into isolated networks and accounts. What primary security benefit does this environment separation provide?',
    options: opts4(
      'Limiting the impact of a compromise or mistake to a single environment',
      'Eliminating the need for backups',
      'Guaranteeing zero vulnerabilities',
      'Removing the need for authentication'
    ),
    correct: ['a'],
    explanation: 'Isolating environments contains the blast radius so a compromise or error in development or staging does not directly affect production. It does not remove the need for backups, patching, or authentication.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A design requires that secrets such as API keys be retrieved at runtime from a centralized secrets manager rather than hard-coded in source. Why is this more secure?',
    options: opts4(
      'Secrets can be rotated, access-controlled, and audited without code changes, and are not exposed in repositories',
      'It makes the code run faster',
      'It removes the need for encryption entirely',
      'It publishes the secrets for transparency'
    ),
    correct: ['a'],
    explanation: 'A secrets manager centralizes storage so credentials can be rotated, tightly access-controlled, and audited, and keeps them out of source control where they could leak. It is about protecting secrets, not performance or transparency.',
    references: [REF_NIST_KEYMGMT]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'A company places a reverse proxy with TLS termination and rate limiting in front of its application servers. Which benefits does this architecture provide?',
    options: opts4(
      'Centralized TLS handling and a control point to mitigate abusive traffic',
      'Automatic elimination of all application bugs',
      'A guarantee of regulatory compliance by itself',
      'Removal of the need for authentication'
    ),
    correct: ['a'],
    explanation: 'A reverse proxy centralizes TLS termination and provides a chokepoint for rate limiting and request filtering, improving manageability and resilience to abusive traffic. It does not fix application bugs or guarantee compliance on its own.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'Microsegmentation applies fine-grained, per-workload network policies so that even hosts within the same data center cannot freely communicate without an explicit policy.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Microsegmentation enforces granular, per-workload allow policies so east-west traffic is not implicitly trusted, limiting lateral movement, which aligns with zero trust principles.',
    references: [REF_NIST_ZT]
  },
  {
    domain: ARCH, difficulty: 4, type: QType.SINGLE,
    stem: 'A sensitive workload must remain operational even if an entire cloud availability zone fails. Which architecture best meets this requirement?',
    options: opts4(
      'Deploy redundant instances across multiple availability zones with automated failover',
      'Deploy a single instance in one zone',
      'Disable health checks to reduce noise',
      'Store the only copy of data on one local disk'
    ),
    correct: ['a'],
    explanation: 'Distributing redundant instances across multiple availability zones with automated failover ensures continued operation if one zone fails. A single instance, disabled health checks, or a single local copy all introduce single points of failure.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An application enforces that all access decisions are made server-side and the client cannot bypass them by modifying requests. Which secure design principle is reflected?',
    options: opts4(
      'Never trust the client / enforce authorization on the server',
      'Security through obscurity',
      'Implicit trust of all inputs',
      'Fail open on errors'
    ),
    correct: ['a'],
    explanation: 'Authorization must be enforced server-side because clients can be manipulated; trusting client-side checks alone is a common flaw. Obscurity, implicit trust, and fail-open behavior weaken security rather than strengthen it.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: ARCH, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization uses certificate pinning in its mobile app so it only trusts a specific server certificate/public key. What threat does this primarily reduce?',
    options: opts4(
      'On-path interception using a fraudulent or mis-issued certificate',
      'Battery drain',
      'Slow Wi-Fi',
      'Excessive log volume'
    ),
    correct: ['a'],
    explanation: 'Certificate/public-key pinning ensures the app only accepts the expected certificate, reducing the risk of on-path interception via fraudulent or mis-issued certificates. It is unrelated to battery, Wi-Fi speed, or log volume.',
    references: [REF_NIST_CRYPTO]
  },

  // ── Security Operations (18) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An administrator enables automatic OS and application updates with a tested staging ring before broad deployment. Which operational practice and benefit is this?',
    options: opts4(
      'Patch management — reduces exposure to known vulnerabilities',
      'Penetration testing — proves exploitability',
      'Data classification — labels data sensitivity',
      'Tabletop exercise — validates plans verbally'
    ),
    correct: ['a'],
    explanation: 'Testing then deploying updates in rings is patch management, which shrinks the window during which known vulnerabilities can be exploited. The other options describe unrelated activities.',
    references: [REF_NIST_VULN]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An EDR solution provides continuous endpoint telemetry, detection, and the ability to isolate a host from the network during an incident. Which capability is the host isolation feature most useful for?',
    options: opts4(
      'Rapid containment of a compromised endpoint',
      'Generating marketing reports',
      'Increasing monitor resolution',
      'Reducing software licensing fees'
    ),
    correct: ['a'],
    explanation: 'Network-isolating a compromised endpoint via EDR enables rapid containment, stopping lateral movement and C2 while preserving the host for analysis. The other options are unrelated to incident response.',
    references: [REF_NIST_IR]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC sets alerting thresholds and tunes rules to reduce noisy false positives while keeping true detections. What is the main operational goal of this tuning?',
    options: opts4(
      'Improve signal-to-noise so analysts focus on real threats and reduce alert fatigue',
      'Permanently disable all alerts',
      'Encrypt all alert emails',
      'Increase the number of false positives'
    ),
    correct: ['a'],
    explanation: 'Tuning detection rules and thresholds improves signal-to-noise, reducing alert fatigue so analysts can prioritize genuine incidents. Disabling alerts or increasing false positives would harm detection effectiveness.',
    references: [REF_NIST_LOG]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'During evidence collection, an investigator must demonstrate who handled the evidence, when, and what was done to it from seizure to court. Which forensic concept ensures this?',
    options: opts4(
      'Chain of custody documentation',
      'Load balancing',
      'Network address translation',
      'Single sign-on'
    ),
    correct: ['a'],
    explanation: 'A chain of custody records every transfer and action on evidence so its integrity and admissibility can be demonstrated. The other options are unrelated networking or identity concepts.',
    references: [REF_NIST_FORENSICS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL practices that improve security logging and monitoring effectiveness.',
    options: opts4(
      'Centralizing logs to a protected, tamper-resistant store',
      'Synchronizing clocks across systems',
      'Logging only after an incident is already confirmed',
      'Defining alerting on high-value events and anomalies'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Centralized tamper-resistant log storage, synchronized clocks, and alerting on meaningful events/anomalies all strengthen monitoring. Only beginning to log after an incident is confirmed leaves no evidence of the earlier activity.',
    references: [REF_NIST_LOG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization implements attribute-based access control (ABAC) so access decisions consider user attributes, resource labels, and context (such as time and location). What is a key advantage over basic RBAC?',
    options: opts4(
      'Fine-grained, context-aware decisions without an explosion of static roles',
      'It removes the need for authentication',
      'It makes all data public',
      'It eliminates logging'
    ),
    correct: ['a'],
    explanation: 'ABAC evaluates multiple attributes and context for each request, enabling fine-grained, dynamic decisions and avoiding the role explosion that pure RBAC can suffer. It does not remove authentication or logging.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A company federates authentication so employees use their corporate identity provider to log in to an external SaaS app via SAML. Which benefit does federation provide here?',
    options: opts4(
      'Centralized identity and access control without separate SaaS passwords',
      'Faster internet bandwidth',
      'Cheaper hardware',
      'Automatic data encryption at rest'
    ),
    correct: ['a'],
    explanation: 'Federation lets the organization centrally manage identities and apply policy (such as MFA and deprovisioning) for external apps without separate credentials, reducing password sprawl. It does not affect bandwidth, hardware cost, or storage encryption.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A vulnerability is found that cannot be patched immediately due to vendor constraints, so the team adds a firewall rule and IPS signature to block exploitation in the meantime. What is this called?',
    options: opts4(
      'A compensating/temporary mitigation while awaiting a permanent fix',
      'Risk avoidance by shutting the company down',
      'A false positive',
      'Accepting the risk with no action'
    ),
    correct: ['a'],
    explanation: 'Applying interim controls (firewall/IPS rules, virtual patching) to reduce exploitability until a permanent patch is available is a compensating/temporary mitigation, a normal part of vulnerability management. It is neither inaction nor a false positive.',
    references: [REF_NIST_VULN]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company periodically reviews each user\'s access rights and removes permissions no longer required for their current role. Which control does this counter?',
    options: opts4(
      'Privilege creep / excessive standing access',
      'DDoS amplification',
      'TLS downgrade',
      'DNS poisoning'
    ),
    correct: ['a'],
    explanation: 'Periodic access reviews (recertification) detect and remove accumulated, unneeded permissions, countering privilege creep that results from role changes over time. The other options are unrelated network attacks.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team scripts the automated provisioning and consistent hardening of new servers so every host starts from the same secure baseline. Which benefit does this automation primarily deliver?',
    options: opts4(
      'Consistent, repeatable secure configuration and reduced human error',
      'Slower deployments',
      'More configuration drift',
      'Less auditability'
    ),
    correct: ['a'],
    explanation: 'Automating provisioning and hardening yields consistent, repeatable, auditable baselines and reduces manual error and drift. The other options are the opposite of what automation provides.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'Analysts must capture a memory image from a live host before powering it off during incident response. Why is acquiring memory before shutdown important?',
    options: opts4(
      'Volatile data such as running processes, network connections, and encryption keys is lost on power-off',
      'It speeds up the next boot',
      'It frees disk space',
      'It updates the antivirus signatures'
    ),
    correct: ['a'],
    explanation: 'RAM holds volatile artifacts (processes, injected code, network state, sometimes keys) that vanish when the system loses power, so memory should be captured before shutdown per the order of volatility.',
    references: [REF_NIST_FORENSICS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company integrates its ticketing, EDR, and firewall so a confirmed malware alert automatically triggers host isolation, blocklist updates, and an incident ticket. Which capability is this?',
    options: opts4(
      'Security orchestration, automation, and response (SOAR)',
      'A spreadsheet macro',
      'A screen saver policy',
      'A DNS forwarder'
    ),
    correct: ['a'],
    explanation: 'Coordinating multiple tools to execute a predefined automated response workflow is SOAR, which speeds and standardizes incident response. The other options are unrelated technologies.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: OPS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Requiring multi-factor authentication on remote administrative access significantly reduces the risk that a stolen password alone leads to a successful intrusion.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. With MFA, a stolen or guessed password is insufficient on its own because the attacker also needs the second factor, substantially lowering the risk of remote credential-based intrusion.',
    references: [REF_NIST_DIGID]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'During recovery from an incident, systems are restored from backups verified to predate the compromise and confirmed clean. Why verify the backup is pre-compromise and clean?',
    options: opts4(
      'Restoring an infected or post-compromise backup would reintroduce the threat',
      'It makes the restore slower for no reason',
      'It is only for licensing purposes',
      'Clean backups reduce monitor brightness'
    ),
    correct: ['a'],
    explanation: 'Recovering from a backup taken after compromise (or that contains the malware) would reinstate the attacker\'s foothold, so backups used for recovery must be validated as clean and from before the incident.',
    references: [REF_NIST_IR]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A new application server is built and only the specific ports and services it requires are enabled; everything else is disabled. Which principle applied during operations is this?',
    options: opts4(
      'Least functionality through hardening',
      'Maximum functionality by default',
      'Implicit any-any trust',
      'Disabling all monitoring'
    ),
    correct: ['a'],
    explanation: 'Enabling only the required ports and services and disabling the rest applies least functionality during system hardening, reducing attack surface. The other options increase risk.',
    references: [REF_NIST_CONFIG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company decommissions servers and uses cryptographic erase plus verified wiping before disposal of solid-state drives. Which operational objective is this satisfying?',
    options: opts4(
      'Secure media sanitization to prevent recovery of residual data',
      'Improving CPU benchmarks',
      'Increasing RAM',
      'Speeding up the network'
    ),
    correct: ['a'],
    explanation: 'Cryptographic erase and verified wiping ensure data on retired SSDs cannot be recovered, satisfying secure media sanitization/disposal requirements (data remanence prevention). The other options are unrelated to data protection.',
    references: [REF_NIST_MEDIA]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A monitoring system alerts when a user account suddenly accesses an unusually large number of records compared to its normal baseline. Which detection approach is this?',
    options: opts4(
      'Behavioral / anomaly-based detection using a baseline',
      'Signature-only matching of known malware hashes',
      'Static asset inventory',
      'Manual log review once per year'
    ),
    correct: ['a'],
    explanation: 'Comparing current activity to an established normal baseline and alerting on significant deviations is anomaly/behavior-based detection, effective for insider threats and novel attacks that signatures miss.',
    references: [REF_NIST_LOG]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization deploys a network access control (NAC) solution that quarantines endpoints failing a posture check until they remediate. Which operational objective does this serve?',
    options: opts4(
      'Ensuring only compliant, healthy devices gain network access',
      'Increasing monitor refresh rate',
      'Reducing software licensing costs',
      'Improving phone call audio quality'
    ),
    correct: ['a'],
    explanation: 'NAC evaluates endpoint posture and restricts or quarantines non-compliant devices until they meet policy, ensuring only healthy, compliant hosts reach the network. The other options are unrelated to access control or security.',
    references: [REF_NIST_ZT]
  },

  // ── Security Program Management and Oversight (13) ──
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization implements additional controls to reduce the likelihood and impact of a risk to an acceptable level. Which risk treatment is this?',
    options: opts4(
      'Risk mitigation',
      'Risk acceptance',
      'Risk transfer',
      'Risk avoidance'
    ),
    correct: ['a'],
    explanation: 'Applying controls to lower likelihood and/or impact is risk mitigation (reduction). Acceptance takes no action, transfer shifts the impact, and avoidance eliminates the risky activity.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A formal document defines how the organization classifies, handles, retains, and disposes of data based on sensitivity. Which governance artifact is this?',
    options: opts4(
      'A data classification and handling policy',
      'A switch configuration file',
      'A penetration test report',
      'A firewall log'
    ),
    correct: ['a'],
    explanation: 'A policy that defines classification levels and corresponding handling, retention, and disposal requirements is a data classification/handling policy, a managerial control underpinning data protection. The other options are technical artifacts.',
    references: [REF_NIST_PII]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company quantifies a risk as a single loss expectancy of $50,000 and an annualized rate of occurrence of 0.2. What is the annualized loss expectancy?',
    options: opts4(
      '$10,000',
      '$50,000',
      '$250,000',
      '$5,000'
    ),
    correct: ['a'],
    explanation: 'ALE = SLE × ARO = $50,000 × 0.2 = $10,000. ALE is commonly used to compare the expected annual cost of a risk against the cost of controls.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that belong in a well-formed information security policy framework.',
    options: opts4(
      'Clear roles, responsibilities, and management support',
      'Defined standards, procedures, and enforcement/consequences',
      'Secret rules known only to the security team and never communicated',
      'A defined review and update cadence'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Effective policy frameworks define roles/responsibilities with leadership support, supporting standards and procedures with enforcement, and a regular review cadence. Undocumented, uncommunicated rules cannot be followed or enforced.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agreement legally obligates parties to keep shared sensitive information confidential?',
    options: opts4(
      'Non-disclosure agreement (NDA)',
      'Service level agreement (SLA)',
      'Acceptable use policy (AUP)',
      'Recovery point objective (RPO)'
    ),
    correct: ['a'],
    explanation: 'An NDA legally binds parties to protect and not disclose confidential information shared during a relationship. An SLA covers service levels, an AUP governs system use, and an RPO is a recovery metric.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A US healthcare provider must protect the privacy and security of patient health information under federal law. Which compliance regime applies?',
    options: opts4(
      'HIPAA',
      'A voluntary email newsletter',
      'An internal coding standard',
      'A vendor brochure'
    ),
    correct: ['a'],
    explanation: 'The Health Insurance Portability and Accountability Act governs the privacy and security of protected health information for covered entities and business associates in the US. The other options impose no such legal obligations.',
    references: [REF_NIST_PII]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company\'s board defines the maximum amount and type of risk it is willing to pursue in achieving objectives. What is this called?',
    options: opts4(
      'Risk appetite',
      'Recovery time objective',
      'Mean time to repair',
      'Patch cadence'
    ),
    correct: ['a'],
    explanation: 'The aggregate level and type of risk an organization is willing to accept in pursuit of its objectives is its risk appetite, which guides treatment and acceptance decisions. The other terms are operational/recovery metrics.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A program tailors security awareness content differently for executives, developers, and general staff based on their roles and risks. Which practice is this?',
    options: opts4(
      'Role-based security awareness training',
      'Network segmentation',
      'Disk encryption',
      'Penetration testing'
    ),
    correct: ['a'],
    explanation: 'Customizing awareness training by role and the threats each group faces (role-based training) increases relevance and effectiveness compared with one-size-fits-all training. The other options are technical or offensive controls.',
    references: [REF_OBJECTIVES]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization conducts a structured exercise that actually fails over critical systems to the recovery site to validate the disaster recovery plan end to end. Which test type is this?',
    options: opts4(
      'Full interruption / failover test',
      'Tabletop discussion only',
      'Vulnerability scan',
      'Phishing simulation'
    ),
    correct: ['a'],
    explanation: 'Actually failing production over to the recovery site to validate the plan end to end is a full interruption (failover) test, the most thorough but highest-impact DR exercise. A tabletop is discussion-only.',
    references: [REF_NIST_CONTINGENCY]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'During third-party onboarding, a company requires the vendor to provide an independent attestation (such as a SOC 2 Type II report) of its control effectiveness. What is the purpose?',
    options: opts4(
      'To gain independent assurance over the vendor\'s security controls before relying on them',
      'To increase the vendor\'s marketing reach',
      'To reduce the company\'s internet bill',
      'To replace the company\'s own access controls'
    ),
    correct: ['a'],
    explanation: 'Requesting an independent attestation provides third-party assurance that a vendor\'s controls are designed and operating effectively, supporting supply chain risk decisions. It does not substitute for the company\'s own controls.',
    references: [REF_NIST_SUPPLY]
  },
  {
    domain: GRC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'A documented incident response plan with defined roles, communication paths, and escalation procedures improves an organization\'s ability to respond consistently to security incidents.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. A prepared, documented IR plan with clear roles, communications, and escalation reduces confusion and response time during incidents, which is why preparation is the first phase of the IR life cycle.',
    references: [REF_NIST_IR]
  },
  {
    domain: GRC, difficulty: 3, type: QType.SINGLE,
    stem: 'A company maintains evidence and documentation to demonstrate to regulators that required security controls are implemented and operating. Which governance activity is this?',
    options: opts4(
      'Compliance management and reporting',
      'Penetration testing',
      'Threat hunting',
      'Network cabling'
    ),
    correct: ['a'],
    explanation: 'Collecting and maintaining evidence to demonstrate adherence to legal/regulatory requirements is compliance management and reporting, supporting audits and reducing legal exposure. The other options are technical or offensive activities.',
    references: [REF_NIST_RMF]
  },
  {
    domain: GRC, difficulty: 4, type: QType.SINGLE,
    stem: 'After a major incident, leadership wants to ensure systemic improvements rather than just fixing the immediate issue. Which governance practice best ensures lessons translate into lasting change?',
    options: opts4(
      'A formal post-incident review feeding tracked corrective actions into the security program',
      'Deleting the incident records to avoid embarrassment',
      'Blaming an individual and closing the case',
      'Taking no action since the incident is over'
    ),
    correct: ['a'],
    explanation: 'A formal post-incident review that produces tracked corrective and preventive actions integrated into the security program drives systemic improvement and accountability. Deleting records, blame, or inaction prevent organizational learning.',
    references: [REF_NIST_IR]
  }
];

const SECURITYPLUS_DOMAINS = [
  { name: CONCEPTS, weight: 12 },
  { name: THREATS, weight: 22 },
  { name: ARCH, weight: 18 },
  { name: OPS, weight: 28 },
  { name: GRC, weight: 20 }
];

const SECURITYPLUS_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'comptia-security-plus-p1',
    code: 'SY0-701-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 90-minute, 65-question, blueprint-weighted set covering general security concepts, threats/vulnerabilities/mitigations, security architecture, security operations, and security program management & oversight.',
    questions: P1
  },
  {
    slug: 'comptia-security-plus-p2',
    code: 'SY0-701-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 90-minute, 65-question, blueprint-weighted set across all five SY0-701 domains.',
    questions: P2
  },
  {
    slug: 'comptia-security-plus-p3',
    code: 'SY0-701-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 90-minute, 65-question, blueprint-weighted set across all five SY0-701 domains.',
    questions: P3
  }
];

const SECURITYPLUS_BUNDLE = {
  slug: 'comptia-security-plus',
  title: 'CompTIA Security+ (SY0-701)',
  description: 'All 3 CompTIA Security+ (SY0-701) practice exams in one bundle — covering general security concepts, threats/vulnerabilities/mitigations, security architecture, security operations, and security program management & oversight, aligned to the published SY0-701 exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 40400 // USD 404 — PRACTICE + real-exam voucher tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CompTIA Security+ (SY0-701) bundle. Safe to
 * call repeatedly — vendor / exam / bundle rows are upserted, and
 * questions tagged `generatedBy: 'manual:securityplus-seed'` are deleted
 * and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedSecurityPlus(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'comptia' } });
  await db.vendor.upsert({
    where: { slug: 'comptia' },
    update: { name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT credentials covering security, networking, infrastructure, and core IT skills, including Security+ (SY0-701).' },
    create: { slug: 'comptia', name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT credentials covering security, networking, infrastructure, and core IT skills, including Security+ (SY0-701).' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'comptia' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SECURITYPLUS_EXAMS) {
    const title = `CompTIA Security+ (SY0-701) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the published CompTIA Security+ (SY0-701) exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 90,
      passingScore: 75,
      questionCount: e.questions.length,
      domains: SECURITYPLUS_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:securityplus-seed' } });
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
          generatedBy: 'manual:securityplus-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SECURITYPLUS_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SECURITYPLUS_BUNDLE.slug },
    update: {
      title: SECURITYPLUS_BUNDLE.title,
      description: SECURITYPLUS_BUNDLE.description,
      price: SECURITYPLUS_BUNDLE.price,
      priceVoucher: SECURITYPLUS_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SECURITYPLUS_BUNDLE.slug,
      title: SECURITYPLUS_BUNDLE.title,
      description: SECURITYPLUS_BUNDLE.description,
      price: SECURITYPLUS_BUNDLE.price,
      priceVoucher: SECURITYPLUS_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'comptia-security-plus-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'comptia-security-plus-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'comptia-security-plus-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'comptia-security-plus-p1', tier: 'VOUCHER' as const, position: 4 }
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
