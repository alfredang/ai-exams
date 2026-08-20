/**
 * CompTIA CySA+ (CS0-004, V4) — Practice Exam 2 (P2).
 *
 * 65 net-new scenario questions authored against the official CompTIA
 * CySA+ CS0-004 V4 Exam Objectives (Document Version 2.0), distinct from
 * the P1 set. Distributed to the published blueprint:
 *   Security Operations              34% (22)
 *   Vulnerability Management         26% (17)
 *   Incident Response and Management 24% (16)
 *   Reporting and Communication      16% (10)
 *
 * This variant leans into the objective areas P1 covers lightly — the
 * 1.1 architecture concepts (ZTNA, SASE, containerization, PAM, secrets
 * management, OT/ICS/SCADA), the 1.3 tool list (CyberChef, YARA, Zeek,
 * MISP/OTX/OpenCTI, WHOIS/AbuseIPDB), the 1.6 AI governance items, the
 * 2.4 control and risk vocabulary, and the 4.x reporting artifacts.
 *
 * Domain strings MUST exactly match CYSA_DOMAINS in cysa-questions.ts
 * (the exam blueprint) so the per-domain results breakdown maps correctly.
 *
 * Independent practice questions, not real or official exam items, and
 * not derived from any third-party question bank.
 */
import { QType } from '@prisma/client';

export type Opt = { id: string; text: string };
export type CysaQ = {
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

const OPS = 'Security Operations';
const VULN = 'Vulnerability Management';
const IR = 'Incident Response and Management';
const REPORT = 'Reporting and Communication';

const REF_OBJ = { label: 'CompTIA — CySA+ V4 (CS0-004) certification', url: 'https://www.comptia.org/en-us/certifications/cybersecurity-analyst/v4/' };
const REF_NIST_61 = { label: 'NIST SP 800-61 Rev. 2 — Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' };
const REF_NIST_40 = { label: 'NIST SP 800-40 Rev. 4 — Enterprise Patch Management Planning', url: 'https://csrc.nist.gov/pubs/sp/800/40/r4/final' };
const REF_NIST_53 = { label: 'NIST SP 800-53 Rev. 5 — Security and Privacy Controls', url: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final' };
const REF_NIST_82 = { label: 'NIST SP 800-82 Rev. 3 — Guide to Operational Technology (OT) Security', url: 'https://csrc.nist.gov/pubs/sp/800/82/r3/final' };
const REF_NIST_86 = { label: 'NIST SP 800-86 — Integrating Forensic Techniques into Incident Response', url: 'https://csrc.nist.gov/pubs/sp/800/86/final' };
const REF_NIST_92 = { label: 'NIST SP 800-92 — Guide to Computer Security Log Management', url: 'https://csrc.nist.gov/pubs/sp/800/92/final' };
const REF_NIST_190 = { label: 'NIST SP 800-190 — Application Container Security Guide', url: 'https://csrc.nist.gov/pubs/sp/800/190/final' };
const REF_NIST_207 = { label: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final' };
const REF_NIST_137 = { label: 'NIST SP 800-137 — Information Security Continuous Monitoring', url: 'https://csrc.nist.gov/pubs/sp/800/137/final' };
const REF_NIST_150 = { label: 'NIST SP 800-150 — Guide to Cyber Threat Information Sharing', url: 'https://csrc.nist.gov/pubs/sp/800/150/final' };
const REF_NIST_115 = { label: 'NIST SP 800-115 — Technical Guide to Information Security Testing', url: 'https://csrc.nist.gov/pubs/sp/800/115/final' };
const REF_NIST_AI_RMF = { label: 'NIST — AI Risk Management Framework (AI RMF 1.0)', url: 'https://www.nist.gov/itl/ai-risk-management-framework' };
const REF_MITRE_ATTACK = { label: 'MITRE ATT&CK — Enterprise matrix', url: 'https://attack.mitre.org/matrices/enterprise/' };
const REF_MITRE_NAV = { label: 'MITRE ATT&CK Navigator — coverage heat maps', url: 'https://mitre-attack.github.io/attack-navigator/' };
const REF_ATOMIC = { label: 'Atomic Red Team — Documentation', url: 'https://www.atomicredteam.io/atomic-red-team/' };
const REF_DIAMOND = { label: 'Caltagirone, Pendergast & Betz — The Diamond Model of Intrusion Analysis', url: 'https://www.activeresponse.org/wp-content/uploads/2013/07/diamond.pdf' };
const REF_KILLCHAIN = { label: 'Lockheed Martin — Cyber Kill Chain', url: 'https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html' };
const REF_PYRAMID = { label: 'David Bianco — The Pyramid of Pain', url: 'https://detect-respond.blogspot.com/2013/03/the-pyramid-of-pain.html' };
const REF_STRIDE = { label: 'Microsoft — Threat modeling and the STRIDE model', url: 'https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats' };
const REF_CVSS4 = { label: 'FIRST — CVSS v4.0 specification', url: 'https://www.first.org/cvss/v4-0/specification-document' };
const REF_EPSS = { label: 'FIRST — Exploit Prediction Scoring System (EPSS)', url: 'https://www.first.org/epss/' };
const REF_KEV = { label: 'CISA — Known Exploited Vulnerabilities Catalog', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' };
const REF_SBOM = { label: 'CISA — Software Bill of Materials (SBOM)', url: 'https://www.cisa.gov/sbom' };
const REF_OWASP_TOP10 = { label: 'OWASP Top 10 — Web Application Security Risks', url: 'https://owasp.org/www-project-top-ten/' };
const REF_OWASP_LLM = { label: 'OWASP Top 10 for Large Language Model Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' };
const REF_SAMM = { label: 'OWASP SAMM — Software Assurance Maturity Model', url: 'https://owaspsamm.org/' };
const REF_CIS = { label: 'CIS — Benchmarks and secure configuration guidance', url: 'https://www.cisecurity.org/cis-benchmarks' };
const REF_PCI = { label: 'PCI Security Standards Council — PCI DSS', url: 'https://www.pcisecuritystandards.org/standards/pci-dss/' };
const REF_YARA = { label: 'YARA — Writing rules documentation', url: 'https://yara.readthedocs.io/en/stable/writingrules.html' };
const REF_ZEEK = { label: 'Zeek — Network monitoring documentation', url: 'https://docs.zeek.org/en/master/about.html' };
const REF_SURICATA = { label: 'Suricata — Rules documentation', url: 'https://docs.suricata.io/en/latest/rules/index.html' };
const REF_CYBERCHEF = { label: 'GCHQ — CyberChef', url: 'https://github.com/gchq/CyberChef' };
const REF_MISP = { label: 'MISP — Threat intelligence sharing platform', url: 'https://www.misp-project.org/documentation/' };
const REF_VIRUSTOTAL = { label: 'VirusTotal — How it works', url: 'https://docs.virustotal.com/docs/how-it-works' };
const REF_ABUSEIPDB = { label: 'AbuseIPDB — IP reputation checking', url: 'https://docs.abuseipdb.com/' };
const REF_NMAP = { label: 'Nmap — Reference Guide', url: 'https://nmap.org/book/man.html' };
const REF_MASSCAN = { label: 'Masscan — Documentation', url: 'https://github.com/robertdavidgraham/masscan' };
const REF_NUCLEI = { label: 'Nuclei — Template-based scanning documentation', url: 'https://docs.projectdiscovery.io/tools/nuclei/overview' };
const REF_TRIVY = { label: 'Trivy — Vulnerability and misconfiguration scanner', url: 'https://trivy.dev/latest/docs/' };
const REF_CHECKOV = { label: 'Checkov — Infrastructure-as-code static analysis', url: 'https://www.checkov.io/1.Welcome/What%20is%20Checkov.html' };
const REF_BURP = { label: 'PortSwigger — Burp Suite documentation', url: 'https://portswigger.net/burp/documentation' };

const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const optsTF = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

export const CYSA_P2: CysaQ[] = [
  // ───────────── Security Operations (22) ─────────────
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An architecture review recommends that no user or device be trusted by virtue of network location alone. Which principle is being applied?',
    options: opts4(
      'Zero trust, where every request is authenticated and authorized',
      'Defense in depth, where controls are layered across the stack',
      'Least privilege, where accounts hold only the rights they need',
      'Separation of duties, where one person cannot complete a task alone'
    ),
    correct: ['a'],
    explanation: 'Zero trust removes implicit trust from network position and evaluates identity, device posture, and context per request. Layering, minimal rights, and split responsibilities are all sound principles, but none of them is the specific idea that location confers no trust.',
    references: [REF_NIST_207]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A distributed workforce connects to SaaS applications directly rather than backhauling through the data centre. Management wants consistent policy enforcement regardless of user location. Which model addresses this?',
    options: opts4(
      'Secure access service edge, converging network and security at the edge',
      'A traditional DMZ hosting the organization\'s internet-facing services',
      'Network access control validating device posture at the switch port',
      'A jump host through which all administrative sessions are brokered'
    ),
    correct: ['a'],
    explanation: 'SASE delivers policy from cloud-hosted points of presence close to the user, so protections follow the user rather than the office. A DMZ segments hosted services, NAC governs on-premises admission, and a jump host controls administrative access to specific systems.',
    references: [REF_NIST_207, REF_OBJ]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A container in a Kubernetes cluster is observed mounting the host filesystem and writing to /etc on the node. Which concern does this raise?',
    options: opts4(
      'A container escape granting access to the underlying host',
      'An image layer caching failure during the container build',
      'A readiness probe misconfiguration restarting the workload',
      'A service mesh certificate expiring for east-west traffic'
    ),
    correct: ['a'],
    explanation: 'Reaching the node filesystem from inside a container means isolation has been broken, usually through a privileged container, a permissive hostPath mount, or a kernel flaw. Build caching, probe settings, and mesh certificates affect delivery and connectivity, not host isolation.',
    references: [REF_NIST_190]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Administrators currently hold permanent domain admin rights. Which capability issues those rights only for an approved window and records the session?',
    options: opts4(
      'Privileged access management',
      'Single sign-on across enterprise applications',
      'Multifactor authentication on administrative accounts',
      'Role-based access control for standard user groups'
    ),
    correct: ['a'],
    explanation: 'PAM brokers elevated access just in time, with approval, expiry, and session recording, which removes standing privilege. SSO simplifies authentication, MFA strengthens it, and RBAC structures entitlements — none of them time-bound the elevation itself.',
    references: [REF_NIST_53]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A code review finds a production database password committed in a repository and reused across three services. Beyond rotating it, which control best prevents recurrence?',
    options: opts4(
      'A secrets management service issuing short-lived credentials to workloads',
      'Repository branch protection requiring a second reviewer before any merge to the main branch',
      'Full-disk encryption on the developer workstations holding the clone',
      'A longer minimum password length enforced by the database engine'
    ),
    correct: ['a'],
    explanation: 'Centralized secrets management removes the static credential from source entirely and issues short-lived, per-workload credentials. Branch protection may catch a future commit but does not eliminate the pattern, disk encryption protects data at rest, and length rules do not address exposure through source control.',
    references: [REF_NIST_53]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A SCADA system controlling a water treatment process has a critical vulnerability, but the vendor-supported patch requires a plant shutdown. Which factor most distinguishes this from an IT patching decision?',
    options: opts4(
      'Availability and safety take precedence over rapid patch deployment',
      'Operational technology systems are exempt from vulnerability management',
      'Confidentiality is the dominant concern for industrial control data',
      'The patch can be applied without validation because the vendor supplied it'
    ),
    correct: ['a'],
    explanation: 'In OT and ICS environments an outage can carry physical and safety consequences, so change is scheduled, validated, and often mitigated with segmentation in the interim. These systems are still in scope for vulnerability management, confidentiality is usually secondary to availability and integrity, and vendor patches still require validation.',
    references: [REF_NIST_82]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Regulation requires that authentication logs be available for investigation for seven years, but the SIEM holds only 90 days of searchable data. What is the appropriate design response?',
    options: opts4(
      'Tier older logs to lower-cost archival storage that remains retrievable',
      'Increase the SIEM ingestion licence so all seven years stay searchable',
      'Reduce the logged event types so seven years fits within current storage',
      'Delete logs at 90 days and document the regulatory gap as accepted risk'
    ),
    correct: ['a'],
    explanation: 'Retention and search performance are separate requirements: hot data stays in the SIEM while older data moves to cheaper archival tiers it can be restored from. Licensing everything hot is rarely affordable, dropping event types loses the evidence the rule protects, and deleting required records breaches the obligation.',
    references: [REF_NIST_92]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker with local administrator rights clears the Windows Security event log to hide their activity. Which control most directly preserves the evidence?',
    options: opts4(
      'Forwarding events off-host in near real time to a write-protected collector',
      'Increasing the maximum local event log file size on each endpoint',
      'Enabling verbose audit policy for process creation across every domain-joined workstation',
      'Applying full-disk encryption to the endpoints holding the logs'
    ),
    correct: ['a'],
    explanation: 'Once events leave the host to append-only central storage, clearing the local log no longer destroys them — this is the integrity and security half of log management. Bigger local logs and richer auditing produce more data on a host the attacker still controls, and disk encryption does not stop an authenticated administrator.',
    references: [REF_NIST_92]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst has a suspicious string that appears to be Base64 wrapped around a gzip blob and needs to decode it through several transformations quickly. Which tool is designed for this?',
    options: opts4(
      'CyberChef, chaining decode and decompress operations in a recipe',
      'Wireshark, applying a display filter to the captured session',
      'Nessus, running a credentialed scan against the affected host',
      'Volatility, parsing structures from an acquired memory image'
    ),
    correct: ['a'],
    explanation: 'CyberChef exists to chain encoding, decoding, decompression, and extraction operations into a repeatable recipe. Wireshark analyzes captured traffic, Nessus assesses hosts for known flaws, and Volatility works on memory images.',
    references: [REF_CYBERCHEF]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'After analyzing a malware family, a team wants to sweep the estate for other samples that share its distinctive strings and byte patterns. Which technology fits?',
    options: opts4(
      'YARA rules describing textual and binary patterns to match files',
      'Suricata rules inspecting network traffic for protocol anomalies',
      'Sigma rules expressing detection logic for SIEM log sources',
      'STIX objects describing the threat actor and campaign context'
    ),
    correct: ['a'],
    explanation: 'YARA is purpose-built for identifying and classifying files by string and byte-pattern conditions, which is exactly a retrospective file sweep. Suricata inspects traffic, Sigma targets log events, and STIX is a structured format for sharing intelligence.',
    references: [REF_YARA]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC wants rich protocol-level records of every connection — HTTP requests, TLS certificates, DNS answers — rather than alerts on known-bad signatures. Which tool provides this?',
    options: opts4(
      'Zeek, which generates structured transaction logs from traffic',
      'Snort, which raises an alert when traffic matches a signature rule',
      'tcpdump, which writes raw packets to a capture file for later review',
      'MXToolbox, which queries public mail and DNS records for a domain'
    ),
    correct: ['a'],
    explanation: 'Zeek turns traffic into structured logs per protocol, giving analysts searchable connection history for hunting. Snort is signature-driven alerting, tcpdump captures raw packets without protocol summarization, and MXToolbox performs external lookups.',
    references: [REF_ZEEK, REF_SURICATA]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A file is flagged by 41 of 68 engines on VirusTotal. How should an analyst treat this result?',
    options: opts4(
      'As strong supporting evidence that still warrants local verification',
      'As definitive proof the file is malicious, requiring no further analysis',
      'As irrelevant, because multi-engine services produce only false positives',
      'As confirmation that the file was purpose-built to target this organization'
    ),
    correct: ['a'],
    explanation: 'A high detection ratio is meaningful corroboration, but engines share heuristics and mislabel packed or niche software, so analysts confirm behavior locally. It is neither proof on its own nor worthless, and it says nothing about targeting.',
    references: [REF_VIRUSTOTAL]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants to store, correlate, and share indicators with sector peers using a common structured model rather than emailing spreadsheets. Which platform class fits?',
    options: opts4(
      'A threat intelligence platform such as MISP or OpenCTI',
      'A security orchestration and automated response platform',
      'An endpoint detection and response management console',
      'A configuration management database of enterprise assets'
    ),
    correct: ['a'],
    explanation: 'Threat intelligence platforms ingest, normalize, correlate, and redistribute indicators and their context across communities. SOAR executes response workflows, EDR manages endpoint telemetry and containment, and a CMDB inventories assets.',
    references: [REF_MISP, REF_NIST_150]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Investigating outbound traffic to an unfamiliar IP address, an analyst wants ownership, hosting country, and any history of reported abuse. Which combination of sources answers this?',
    options: opts4(
      'WHOIS registration data, GEO-IP lookup, and AbuseIPDB reports',
      'A credentialed vulnerability scan of the destination address',
      'A YARA sweep of endpoint filesystems for matching samples',
      'A packet capture filtered to the organization\'s internal subnets'
    ),
    correct: ['a'],
    explanation: 'WHOIS gives registration and ownership, GEO-IP approximates location, and AbuseIPDB aggregates community abuse reports — together forming a reputation picture. Scanning a third-party address is inappropriate and possibly unlawful, YARA matches files, and an internal capture does not describe the remote host.',
    references: [REF_ABUSEIPDB]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Which indicators are characteristic of business email compromise? (Choose three.)',
    options: opts4(
      'An urgent payment change request appearing to come from an executive',
      'A reply-to address on a lookalike domain differing by one character',
      'A newly created inbox rule silently moving finance replies to Archive',
      'A mass-mailed message with a malicious macro attachment to all staff'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'BEC relies on social pressure, impersonation through lookalike domains or compromised mailboxes, and hidden inbox rules that keep the victim from noticing replies. Indiscriminate malware-laden mass mail is commodity phishing rather than the targeted fraud BEC describes.',
    references: [REF_OBJ, REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Staff receive links to "rnicrosoft-login.com" and to shortened URLs that redirect there. Which two techniques are combined?',
    options: opts4(
      'Typosquatting a lookalike domain and URL shortening to mask the target',
      'Domain generation algorithms and fast-flux hosting of the C2 endpoint',
      'Cross-site scripting and session fixation against the login application',
      'DNS cache poisoning and ARP spoofing on the local network segment'
    ),
    correct: ['a'],
    explanation: 'Substituting "rn" for "m" is typosquatting, and the shortener hides the destination until the click. DGA and fast flux serve C2 resilience, XSS and session fixation attack a web application, and poisoning and spoofing manipulate name and address resolution.',
    references: [REF_OBJ, REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'Using the Pyramid of Pain, which detection focus imposes the greatest cost on an adversary?',
    options: opts4(
      'Detecting the tactics, techniques, and procedures they rely on',
      'Blocking the file hashes of the samples they have deployed',
      'Blocking the IP addresses their infrastructure currently uses',
      'Blocking the domain names registered for their campaign'
    ),
    correct: ['a'],
    explanation: 'The pyramid ranks indicators by how painful they are to change: hashes and addresses are trivially rotated, domains slightly less so, but detecting behavior forces the adversary to rework how they operate. That is why hunting targets TTPs rather than atomic indicators alone.',
    references: [REF_PYRAMID, REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'During design review of a new payments API, the team enumerates how an attacker might forge requests, alter records, deny actions taken, or read data they should not. Which model structures this analysis?',
    options: opts4(
      'STRIDE, categorizing threats by the property each one violates',
      'The Diamond Model, relating adversary, capability, infrastructure, victim',
      'The Cyber Kill Chain, sequencing an intrusion from recon to objectives',
      'CVSS, scoring the severity of an identified vulnerability'
    ),
    correct: ['a'],
    explanation: 'STRIDE walks spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege — the categories named in the scenario. The Diamond Model and Kill Chain describe intrusions after the fact, and CVSS scores severity rather than enumerating threats.',
    references: [REF_STRIDE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A honeypot placed on an internal segment is valuable primarily because legitimate users have no reason to interact with it, so almost any access is suspicious.',
    options: optsTF(),
    correct: ['a'],
    explanation: 'True. Cyber deception assets carry no production role, which gives them an extremely low false-positive rate and makes interaction a high-fidelity signal of reconnaissance or lateral movement. Their value is signal quality rather than the volume of data they produce.',
    references: [REF_MITRE_ATTACK, REF_OBJ]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which example is an atomic indicator of compromise rather than a behavioral one?',
    options: opts4(
      'A specific malicious IP address contacted by an infected host',
      'A pattern of credential dumping followed by remote service creation',
      'Repeated privilege escalation attempts preceding data staging',
      'A sequence of reconnaissance commands run soon after logon'
    ),
    correct: ['a'],
    explanation: 'Atomic indicators are single, indivisible data points such as an address, hash, or domain. The other options describe chains of activity, which are behavioral indicators and generally more durable because they are harder for an adversary to change.',
    references: [REF_NIST_150, REF_PYRAMID]
  },
  {
    domain: OPS, difficulty: 4, type: QType.MULTI,
    stem: 'An organization is drafting an AI usage policy for its SOC. Which provisions directly address the AI risks named in the CySA+ objectives? (Choose three.)',
    options: opts4(
      'Prohibit pasting customer data or credentials into external AI services',
      'Require analyst verification of AI output before it informs a decision',
      'Restrict which models may process case data, and log their use',
      'Mandate that all AI-assisted tickets be closed within one business day'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The objective names data exposure, hallucinations, model poisoning, and malicious prompts as the risks, and governance as the control: restrict what data leaves, verify what comes back, and constrain and audit which models are used. A ticket-closure deadline is a throughput target that addresses none of those risks.',
    references: [REF_NIST_AI_RMF, REF_OWASP_LLM]
  },
  {
    domain: OPS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Pasting a full log excerpt containing customer identifiers into a public AI chat service to speed up triage is acceptable provided the analyst deletes the conversation afterwards.',
    options: optsTF(),
    correct: ['b'],
    explanation: 'False. Submission is the disclosure — the data has already left the organization\'s control and may be retained or used for training regardless of what the analyst does next. Deleting the conversation does not undo the exposure or any contractual and regulatory breach it caused.',
    references: [REF_NIST_AI_RMF, REF_OWASP_LLM]
  },

  // ───────────── Vulnerability Management (17) ─────────────
  {
    domain: VULN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new vulnerability management programme is being established. Why is an accurate asset inventory the first prerequisite?',
    options: opts4(
      'Unknown assets cannot be scanned, prioritized, or remediated',
      'Scanners require an inventory file before they will start a scan',
      'Regulations require inventories to be published to external auditors',
      'An inventory replaces the need to run authenticated scans on hosts'
    ),
    correct: ['a'],
    explanation: 'Coverage is bounded by what the organization knows it owns; anything absent from the inventory is silently excluded from every subsequent step. Scanners accept ranges without an inventory, publication is not a general requirement, and an inventory records existence rather than assessing configuration.',
    references: [REF_NIST_137]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A scan of a production ERP cluster during business hours caused response times to degrade sharply. Which adjustment addresses the cause while preserving coverage?',
    options: opts4(
      'Schedule the scan out of hours and limit its concurrent connections',
      'Switch to a non-credentialed scan to reduce the depth of checks',
      'Exclude the ERP cluster from the vulnerability management scope',
      'Halve the frequency of scanning to once every six months'
    ),
    correct: ['a'],
    explanation: 'Scheduling and throttling are the planning levers for performance impact and keep assessment depth intact. Dropping credentials degrades accuracy, excluding the asset creates a blind spot on a critical system, and scanning less often leaves exposure undetected for longer.',
    references: [REF_NIST_115, REF_NIST_137]
  },
  {
    domain: VULN, difficulty: 4, type: QType.SINGLE,
    stem: 'A plant engineer forbids active scanning of a legacy PLC network because probe traffic has previously caused controllers to fault. What is the appropriate assessment approach?',
    options: opts4(
      'Passive monitoring of network traffic to identify devices and versions',
      'A credentialed active scan scheduled during the night shift',
      'An aggressive Nmap sweep with service and version detection enabled',
      'A breach and attack simulation executed against the controllers'
    ),
    correct: ['a'],
    explanation: 'Passive analysis observes existing traffic and never sends probes, which is why it is the standard approach where fragile OT devices may fault. Every other option generates active traffic against the controllers, which is the behavior the engineer ruled out.',
    references: [REF_NIST_82, REF_NIST_115]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst needs to identify which operating systems and service versions are running across an unfamiliar subnet before assessing it. Which Nmap capability provides this?',
    options: opts4(
      'Service and OS detection, which fingerprints responses to probes',
      'A ping sweep, which reports only which addresses are reachable',
      'A traceroute, which maps the hops between scanner and target',
      'A DNS zone transfer, which lists records held by the name server'
    ),
    correct: ['a'],
    explanation: 'Version and OS detection compare protocol responses against a fingerprint database to infer software and platform, which is what discovery and device fingerprinting require. Ping sweeps establish liveness only, traceroute maps paths, and zone transfers enumerate DNS records.',
    references: [REF_NMAP]
  },
  {
    domain: VULN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization wants to measure its server builds against a recognized secure-configuration standard rather than only against known CVEs. Which approach fits?',
    options: opts4(
      'Baseline scanning against CIS Benchmarks for each platform',
      'Authenticated CVE scanning with a commercial vulnerability scanner',
      'Software composition analysis of the applications hosted on the servers',
      'Penetration testing of the externally reachable server services'
    ),
    correct: ['a'],
    explanation: 'CIS Benchmarks define per-platform hardening settings, and baseline scanning reports drift from them — a configuration question rather than a patch question. CVE scanning finds missing fixes, SCA covers third-party components, and penetration testing measures exploitability.',
    references: [REF_CIS, REF_PCI]
  },
  {
    domain: VULN, difficulty: 2, type: QType.SINGLE,
    stem: 'A team must establish which of 65,000 ports are open across a large address space in minutes, accepting that detail will be limited. Which tool suits this first pass?',
    options: opts4(
      'Masscan, which trades inspection depth for very high scan rates',
      'Nessus, which performs deep credentialed checks per host',
      'Burp Suite, which proxies and tests web application requests',
      'Trivy, which scans container images for known vulnerabilities'
    ),
    correct: ['a'],
    explanation: 'Masscan is built for internet-scale port discovery at high packet rates, making it the right choice for rapid breadth before deeper tools run. Nessus is depth-oriented, Burp targets web applications, and Trivy inspects images rather than networks.',
    references: [REF_MASSCAN, REF_NMAP]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A security team wants community-maintained, YAML-defined checks they can run against their web estate and extend with their own templates. Which scanner matches?',
    options: opts4(
      'Nuclei, which executes template-defined checks against targets',
      'OpenVAS, which runs a maintained feed of network vulnerability tests',
      'Angry IP Scanner, which enumerates live hosts and open ports',
      'Recon-ng, which automates open-source intelligence collection'
    ),
    correct: ['a'],
    explanation: 'Nuclei\'s model is exactly template-driven scanning, with a public template repository teams extend privately. OpenVAS uses its own NVT feed, Angry IP Scanner performs host discovery, and Recon-ng gathers OSINT rather than testing for vulnerabilities.',
    references: [REF_NUCLEI]
  },
  {
    domain: VULN, difficulty: 4, type: QType.SINGLE,
    stem: 'A pipeline should fail when a container image ships a critical CVE and when a Terraform plan would create a public storage bucket. Which pairing addresses both checks?',
    options: opts4(
      'Trivy for the image and Checkov for the infrastructure-as-code',
      'Burp Suite for the image and Nuclei for the infrastructure-as-code',
      'Nessus for the image and Masscan for the infrastructure-as-code',
      'YARA for the image and Suricata for the infrastructure-as-code'
    ),
    correct: ['a'],
    explanation: 'Trivy scans image layers for vulnerable packages, and Checkov statically analyzes IaC for insecure configuration before it is applied. The other pairings apply web testing, network scanning, and file or traffic pattern matching to problems they were not built for.',
    references: [REF_TRIVY, REF_CHECKOV]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst must test whether an authenticated web workflow can be manipulated by tampering with a request parameter mid-session. Which tool capability is required?',
    options: opts4(
      'An intercepting proxy that pauses and edits requests in flight',
      'A network mapper that enumerates open ports on the web server',
      'A container scanner that inspects the application image layers',
      'A passive sniffer that records traffic without modifying it'
    ),
    correct: ['a'],
    explanation: 'Interception lets the tester hold a request, alter a parameter, and forward it while the session remains valid — the defining capability of Burp Suite or ZAP in proxy mode. Port mapping, image scanning, and passive capture cannot modify live requests.',
    references: [REF_BURP]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to confirm that its EDR actually detects credential dumping and scheduled-task persistence, by safely executing those techniques. Which tooling is intended for this?',
    options: opts4(
      'Breach and attack simulation such as Atomic Red Team or Caldera',
      'A credentialed vulnerability scan of the endpoints in scope',
      'Software composition analysis of the EDR agent\'s dependencies',
      'A tabletop exercise walking through the detection process'
    ),
    correct: ['a'],
    explanation: 'BAS frameworks execute mapped adversary techniques in a controlled way so defenders can verify whether detection and prevention fire. Vulnerability scanning finds missing patches, SCA examines components, and a tabletop tests decisions rather than technical controls.',
    references: [REF_ATOMIC, REF_MITRE_ATTACK]
  },
  {
    domain: VULN, difficulty: 3, type: QType.MULTI,
    stem: 'Which criteria legitimately raise the remediation priority of a vulnerability? (Choose three.)',
    options: opts4(
      'Confirmed active exploitation reported by threat intelligence',
      'The affected asset processes regulated cardholder data',
      'The vulnerable service is reachable from the public internet',
      'The finding was first reported by the scanner more recently than others'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Prioritization weighs exploitation activity, asset value and data sensitivity, and exposure or context. Recency of discovery describes when the scanner noticed the issue and carries no information about risk.',
    references: [REF_KEV, REF_EPSS, REF_CVSS4]
  },
  {
    domain: VULN, difficulty: 4, type: QType.SINGLE,
    stem: 'Two hosts carry the same CVE with an identical base score. One is an internet-facing web server; the other sits on an isolated lab network with no outbound route. How should context awareness affect the decision?',
    options: opts4(
      'The internet-facing host is remediated first because exposure raises risk',
      'Both hosts must be remediated simultaneously because the scores match',
      'The isolated host is remediated first because it lacks other controls',
      'Neither is prioritized, because the base score already accounts for context'
    ),
    correct: ['a'],
    explanation: 'CVSS base metrics are intrinsic and deliberately exclude the environment, so identical scores can carry very different real risk. Reachability and surrounding controls are what context awareness contributes, and they favour the exposed host.',
    references: [REF_CVSS4, REF_SBOM]
  },
  {
    domain: VULN, difficulty: 4, type: QType.SINGLE,
    stem: 'A board sets the level of risk the organization is willing to pursue in order to meet its objectives. After controls are applied, some risk remains. Which pairing names these two concepts?',
    options: opts4(
      'Risk appetite and residual risk',
      'Inherent risk and risk appetite',
      'Residual risk and inherent risk',
      'Risk tolerance and inherent risk'
    ),
    correct: ['a'],
    explanation: 'Risk appetite is the amount of risk leadership is willing to accept in pursuit of objectives, and residual risk is what survives after controls are implemented. Inherent risk is the exposure before any controls are applied, which is neither of the two described.',
    references: [REF_NIST_53]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization purchases cyber insurance to offset the financial consequences of a breach it cannot fully prevent. Which risk management strategy is this?',
    options: opts4(
      'Transfer',
      'Mitigate',
      'Avoid',
      'Accept'
    ),
    correct: ['a'],
    explanation: 'Insurance shifts financial consequence to a third party, which is risk transfer. Mitigation reduces likelihood or impact through controls, avoidance stops the activity altogether, and acceptance retains the risk without further action.',
    references: [REF_NIST_53]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A file integrity monitoring agent alerts when a critical system binary changes but takes no action to stop the change. Which control function does it perform?',
    options: opts4(
      'Detective',
      'Preventative',
      'Corrective',
      'Responsive'
    ),
    correct: ['a'],
    explanation: 'Detective controls identify that something has happened and raise awareness of it. Preventative controls stop the event, corrective controls restore the correct state afterwards, and responsive controls act to limit the consequences once triggered.',
    references: [REF_NIST_53]
  },
  {
    domain: VULN, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Once a patch has been deployed through the change management process, the vulnerability can be closed on the register without any further checking.',
    options: optsTF(),
    correct: ['b'],
    explanation: 'False. Deployment and effectiveness are different claims — patches fail to install, roll back, or need a restart or configuration step to take effect. Validation of remediation, normally a targeted rescan or manual confirmation, is what justifies closure.',
    references: [REF_NIST_40]
  },
  {
    domain: VULN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'How does software composition analysis differ from static application security testing?',
    options: opts4(
      'SCA identifies known flaws in third-party components the code includes',
      'SCA executes the application and observes its runtime behavior',
      'SCA verifies the maturity of the organization\'s software assurance programme',
      'SCA intercepts requests between the browser and the application server'
    ),
    correct: ['a'],
    explanation: 'SCA inventories dependencies and matches them against vulnerability data, whereas SAST analyzes first-party source for weaknesses. Running the application is DAST, programme maturity is what SAMM assesses, and request interception is a proxy function.',
    references: [REF_SBOM, REF_SAMM, REF_OWASP_TOP10]
  },

  // ───────────── Incident Response and Management (16) ─────────────
  {
    domain: IR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Forty alerts arrive at once during a suspected intrusion. What is the purpose of triage at this point?',
    options: opts4(
      'To rank alerts by severity and impact so effort goes where it matters',
      'To close low-severity alerts without review to reduce the queue',
      'To assign every alert to a separate analyst for parallel handling',
      'To escalate all alerts to management for a prioritization decision'
    ),
    correct: ['a'],
    explanation: 'Triage establishes what each alert means and orders the work by severity and business impact so scarce analyst time is spent well. Closing alerts unreviewed discards evidence, parallel assignment ignores relationships between alerts, and blanket escalation defers the analytical judgement triage exists to apply.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does a responder build a timeline of events early in the analysis phase?',
    options: opts4(
      'It establishes sequence and scope, showing what happened before what',
      'It satisfies the regulatory requirement to report within a fixed period',
      'It calculates the financial loss attributable to the incident',
      'It replaces the need to preserve the underlying source evidence'
    ),
    correct: ['a'],
    explanation: 'Ordering events reveals initial access, dwell time, and the full extent of the intrusion, which drives containment scope. Regulatory clocks, loss quantification, and evidence preservation are separate obligations a timeline supports but does not replace.',
    references: [REF_NIST_61, REF_NIST_86]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'Two incidents involve the same malware. One affects a developer laptop; the other affects the payment processing server. Why do they receive different severity ratings?',
    options: opts4(
      'Severity reflects business impact, not just the technical finding',
      'Severity is determined solely by the malware family involved',
      'Servers are always rated higher than endpoints by policy definition',
      'Severity depends on which analyst first triaged the alert'
    ),
    correct: ['a'],
    explanation: 'Determining severity and impact weighs the criticality of the affected asset, the data it handles, and the consequences of disruption. Identical technical findings therefore differ in severity, and neither a rigid asset-class rule nor the identity of the analyst should decide it.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'A SOC adds asset owner, business criticality, and geolocation to each alert as it is ingested. What is this practice, and what does it achieve?',
    options: opts4(
      'Log enrichment, which lets analysts triage without pivoting to other systems',
      'Log rotation, which prevents storage exhaustion on the collectors',
      'Log normalization, which maps differing vendor field names into one shared schema',
      'Log aggregation, which collapses duplicate events into single records'
    ),
    correct: ['a'],
    explanation: 'Augmenting events with context at ingestion removes lookups from the critical path, so an analyst can judge an alert from the alert itself. Rotation manages storage, normalization aligns field names, and aggregation reduces duplicate volume.',
    references: [REF_NIST_92, REF_NIST_137]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'A responder images a disk and records a SHA-256 hash of the image, then re-hashes it before analysis months later. What does the matching hash establish?',
    options: opts4(
      'Data integrity — the image is unchanged since acquisition',
      'Chain of custody — every handler of the evidence is documented',
      'Authenticity — the image definitely came from the suspect host',
      'Admissibility — a court is obliged to accept the evidence'
    ),
    correct: ['a'],
    explanation: 'A matching cryptographic hash proves the bits have not altered, which is data integrity validation. Custody is proved by documentation of handling, provenance by acquisition records, and admissibility is a judicial determination that integrity supports but does not guarantee.',
    references: [REF_NIST_86]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization suspends automatic deletion of mailboxes, logs, and backups relating to an incident after being notified of litigation. What is this obligation called?',
    options: opts4(
      'A legal hold requiring preservation of potentially relevant data',
      'A chain of custody record tracking evidence between handlers',
      'A data retention schedule defining how long records are stored',
      'A non-disclosure agreement restricting discussion of the incident'
    ),
    correct: ['a'],
    explanation: 'A legal hold overrides routine disposal so potentially relevant material is preserved, and failing to honour it carries serious consequences. Custody records track handling, retention schedules govern ordinary deletion, and NDAs restrict disclosure.',
    references: [REF_NIST_86]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'A tier-1 analyst finds evidence that an intrusion has reached a domain controller. What should the incident response plan direct them to do?',
    options: opts4(
      'Escalate immediately according to the plan\'s predefined criteria',
      'Continue investigating alone until the full scope is understood',
      'Reimage the domain controller before notifying anyone else',
      'Wait for the next scheduled shift handover to raise the finding'
    ),
    correct: ['a'],
    explanation: 'Escalation criteria exist so that severity thresholds trigger the right people and authority without hesitation. Investigating alone delays containment, unilateral reimaging destroys evidence and may not remove the intruder, and waiting for handover wastes critical time.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Malware is spreading laterally across a subnet. Which action isolates the affected targets with the least disruption to unaffected systems?',
    options: opts4(
      'Move the affected hosts to a quarantine VLAN with no lateral access',
      'Shut down the core switch serving the entire building',
      'Disable every user account in the affected department',
      'Block all outbound internet traffic for every site in the organization immediately'
    ),
    correct: ['a'],
    explanation: 'Quarantining the specific hosts halts spread while leaving unaffected systems working and preserving the ability to investigate. The remaining options are blunt actions that impose broad outages disproportionate to the containment achieved.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'How does a playbook differ from a runbook in security operations?',
    options: opts4(
      'A playbook defines the overall response process; a runbook gives the specific steps',
      'A playbook is executed only by automation, whereas a runbook is always carried out manually',
      'A playbook applies to vulnerabilities; a runbook applies to incidents',
      'A playbook is a legal document; a runbook is an internal reference'
    ),
    correct: ['a'],
    explanation: 'Playbooks describe the decision flow for a scenario such as phishing or ransomware, while runbooks hold the concrete operational procedures each step invokes. Both may be automated or manual, both are internal artifacts, and neither is scoped to only one problem domain.',
    references: [REF_NIST_61, REF_OBJ]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does an incident response plan include a separate communication plan?',
    options: opts4(
      'It predefines who is told what, by whom, and through which channel',
      'It records the technical steps for containing each class of incident',
      'It documents the chain of custody applied to collected evidence',
      'It lists the detection rules that trigger an incident declaration'
    ),
    correct: ['a'],
    explanation: 'Communication planning fixes stakeholders, message ownership, approval, and channels in advance so that pressure does not produce inconsistent or premature disclosure. Containment steps, custody records, and detection logic live in other parts of the response documentation.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.MULTI,
    stem: 'Which practices are part of sound evidence gathering during an incident? (Choose three.)',
    options: opts4(
      'Recording each transfer of evidence between named individuals',
      'Hashing acquired images and verifying the hash before analysis',
      'Preserving volatile data before shutting down affected systems',
      'Editing collected log files to remove entries that are not relevant'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Custody records, integrity validation, and preservation of volatile sources are the core disciplines that keep evidence reliable and usable. Editing collected logs destroys integrity and would undermine the evidence entirely.',
    references: [REF_NIST_86]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'A root cause analysis concludes that an intrusion succeeded because a legacy VPN appliance was never enrolled in patch management. Which output should follow?',
    options: opts4(
      'Corrective actions with owners, addressing the process gap that allowed it',
      'A revised severity rating applied retrospectively to the closed incident',
      'A recalculation of mean time to detect for the affected quarter',
      'An updated network diagram showing where the appliance was deployed'
    ),
    correct: ['a'],
    explanation: 'Root cause analysis earns its value by producing corrective action development — assigned, tracked changes that close the systemic gap, here enrolment coverage rather than one appliance. Re-rating a closed incident, recomputing metrics, and refreshing diagrams do not prevent recurrence.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Containment should always be completed before any analysis begins, so that the incident cannot spread while responders work.',
    options: optsTF(),
    correct: ['b'],
    explanation: 'False. Analysis and containment interleave: enough analysis is needed to know what to contain and how far the intrusion reaches, or premature action tips off the adversary and leaves footholds untouched. Speed matters, but scope determines whether containment actually works.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst identifies a C2 domain and uses it to discover three further victims contacting the same infrastructure. Which analytic model describes this movement between related features?',
    options: opts4(
      'The Diamond Model, pivoting from infrastructure to other victims',
      'The Cyber Kill Chain, advancing through sequential intrusion phases',
      'STRIDE, categorizing the threat by the property it violates',
      'CVSS, expressing the severity of the underlying vulnerability'
    ),
    correct: ['a'],
    explanation: 'Pivoting between adversary, capability, infrastructure, and victim is the Diamond Model\'s central analytic move. The Kill Chain sequences one intrusion, STRIDE classifies threats during design, and CVSS scores severity.',
    references: [REF_DIAMOND]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'A team maps its existing detections onto the ATT&CK matrix and colours each technique by coverage. How should the resulting heat map be used?',
    options: opts4(
      'To target detection engineering at techniques relevant but uncovered',
      'To demonstrate that the organization is protected against every technique',
      'To rank vulnerabilities for the next patch deployment cycle',
      'To calculate the residual risk figure reported to the audit committee'
    ),
    correct: ['a'],
    explanation: 'Coverage heat maps expose gaps so engineering effort goes where relevant adversary behavior is currently invisible. Full-matrix coverage is neither achievable nor the goal, and the map addresses detection rather than patch sequencing or quantified residual risk.',
    references: [REF_MITRE_NAV, REF_MITRE_ATTACK]
  },
  {
    domain: IR, difficulty: 3, type: QType.ORDERING,
    stem: 'An adversary researches staff on a networking site, emails a weaponized document, gains execution, installs a backdoor, calls home, and steals data. Arrange the Cyber Kill Chain phases in the order they occur.',
    options: [
      { id: 'a', text: 'Reconnaissance' },
      { id: 'b', text: 'Weaponization' },
      { id: 'c', text: 'Delivery' },
      { id: 'd', text: 'Exploitation' },
      { id: 'e', text: 'Installation' },
      { id: 'f', text: 'Command and control' },
      { id: 'g', text: 'Actions on objectives' }
    ],
    correct: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    explanation: 'The Cyber Kill Chain runs reconnaissance, weaponization, delivery, exploitation, installation, command and control, then actions on objectives. Its defensive value is that breaking any single link stops the chain, so the earlier a defender can detect and disrupt, the less the adversary achieves. Note that weaponization happens on the attacker\'s own infrastructure and generates no telemetry in the victim environment.',
    references: [REF_KILLCHAIN]
  },

  // ───────────── Reporting and Communication (10) ─────────────
  {
    domain: REPORT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of a risk scorecard in vulnerability management reporting?',
    options: opts4(
      'To summarize risk posture across business units for comparison over time',
      'To list every open finding with its full technical reproduction steps',
      'To record the chain of custody for evidence gathered during incidents',
      'To define the scanning schedule applied to each network segment'
    ),
    correct: ['a'],
    explanation: 'Scorecards condense posture into comparable measures so leaders can see relative standing and direction of travel. Exhaustive technical detail belongs in the vulnerability report, and custody records and scan schedules are unrelated artifacts.',
    references: [REF_NIST_137, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.SINGLE,
    stem: 'An assessment finds that cardholder data systems lack the quarterly internal scanning their standard requires. How should this be reported?',
    options: opts4(
      'As a compliance finding against the specific control requirement',
      'As a critical vulnerability with a CVSS score assigned to it',
      'As an inhibitor to remediation blocking other patching work',
      'As an incident requiring declaration and stakeholder notification'
    ),
    correct: ['a'],
    explanation: 'The gap is between practice and a mandated control, which is precisely a compliance finding traceable to the requirement. It is not a software flaw to score, not an obstacle preventing other remediation, and no adverse event has occurred.',
    references: [REF_PCI, REF_NIST_53]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.SINGLE,
    stem: 'A remediation action plan notes that patching the reporting database requires the upstream data warehouse to be upgraded first. What does this item represent?',
    options: opts4(
      'A dependency that determines the sequencing of the remediation work',
      'An escalation path to follow if the remediation misses its deadline',
      'A compensating control applied while the patch remains outstanding',
      'An exception formally accepting the risk for a defined period'
    ),
    correct: ['a'],
    explanation: 'One task requiring another to complete first is a dependency, and recording it is what makes the plan schedulable. Escalation defines who is informed when targets slip, compensating controls reduce interim risk, and an exception is a documented acceptance decision.',
    references: [REF_NIST_40]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.MULTI,
    stem: 'Which situations are recognized inhibitors to remediation? (Choose three.)',
    options: opts4(
      'A contractual agreement that forbids modifying a managed appliance',
      'A legacy application that will not run on the patched library version',
      'Patching would interrupt a business process during month-end close',
      'The security team has not yet reviewed the scanner output in detail'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Contractual constraints, legacy and proprietary system limitations, degraded functionality, and business process interruption are the documented inhibitors. An unreviewed scan report is an internal backlog issue, not a constraint preventing remediation.',
    references: [REF_NIST_40, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 4, type: QType.SINGLE,
    stem: 'A SOC produces an internal threat intelligence report for its own engineering teams. What most distinguishes it from a commercial feed summary?',
    options: opts4(
      'It is tailored to the organization\'s own environment, assets, and exposure',
      'It contains only indicators that have never appeared in public reporting',
      'It is distributed externally to peers under a sharing agreement',
      'It replaces the need to subscribe to any external intelligence source'
    ),
    correct: ['a'],
    explanation: 'Internal reporting earns its value by relating threat activity to the technologies actually deployed and the assets actually at risk, so recipients can act. Novelty is not the criterion, the audience is internal, and internal analysis complements rather than replaces external sources.',
    references: [REF_NIST_150, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.SINGLE,
    stem: 'A 24-hour SOC is handing an ongoing investigation to the incoming shift. What must the handover include beyond the list of open alerts?',
    options: opts4(
      'Current findings, actions taken, and the next planned analytical steps',
      'The full raw packet captures collected by the sensors during the previous shift',
      'A performance assessment of each analyst on the outgoing shift',
      'The vendor licence status of the tools used in the investigation'
    ),
    correct: ['a'],
    explanation: 'Effective handover transfers understanding — what is known, what has been done, and what comes next — so the incoming shift continues rather than restarts. Raw captures remain accessible in the case, and staff assessments and licensing are irrelevant to continuity.',
    references: [REF_NIST_61, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A shift handover is complete once the outgoing analyst has listed which tickets remain open.',
    options: optsTF(),
    correct: ['b'],
    explanation: 'False. A ticket list conveys status without context, so the incoming shift must reconstruct the reasoning already done. Handover needs findings so far, actions taken, working hypotheses, and the next planned steps to preserve investigative continuity.',
    references: [REF_NIST_61, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 2, type: QType.SINGLE,
    stem: 'How does a service-level agreement differ from a service-level objective in vulnerability reporting?',
    options: opts4(
      'An SLA is a commitment to another party; an SLO is an internal target',
      'An SLA applies to incidents; an SLO applies only to vulnerabilities',
      'An SLA is measured monthly; an SLO is measured annually by audit',
      'An SLA is set by the scanner vendor; an SLO is set by the regulator'
    ),
    correct: ['a'],
    explanation: 'SLAs are agreed with a customer or supplier and typically carry consequences for breach, while SLOs are the organization\'s own performance targets. Neither is restricted to one problem type, and their measurement cadence and ownership are chosen internally.',
    references: [REF_NIST_40, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 4, type: QType.SINGLE,
    stem: 'Monthly reporting shows critical findings falling from 240 to 180 to 120, while the top risks list is unchanged. What should the analyst conclude?',
    options: opts4(
      'Volume is improving but the most significant exposures are unaddressed',
      'The programme is fully effective because the total count is falling',
      'The scanner configuration must have changed between reporting cycles',
      'The top risks list should be removed because it is not changing'
    ),
    correct: ['a'],
    explanation: 'Trends and top risks answer different questions: the trend shows throughput while the static top-risks list shows the hardest, highest-consequence items are being deferred. That divergence is the finding worth reporting, not a reason to doubt the tooling or drop the metric.',
    references: [REF_NIST_40, REF_NIST_137]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.SINGLE,
    stem: 'During a suspected email system compromise, why should the response team switch to a predefined out-of-band communication channel?',
    options: opts4(
      'The adversary may be reading response coordination in the compromised system',
      'Out-of-band channels are faster than corporate email under load',
      'Regulators require incident coordination to occur outside corporate systems',
      'It removes the requirement to keep records of response decisions'
    ),
    correct: ['a'],
    explanation: 'If mail or chat is compromised, coordinating there tells the intruder exactly what defenders know and plan, so operational security requires a channel the adversary cannot observe. Speed is not the issue, no such regulatory rule exists, and decisions must still be recorded.',
    references: [REF_NIST_61, REF_OBJ]
  }
];
