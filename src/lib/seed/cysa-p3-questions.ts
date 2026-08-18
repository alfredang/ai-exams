/**
 * CompTIA CySA+ (CS0-004, V4) — Practice Exam 3 (P3).
 *
 * 65 net-new scenario questions authored against the official CompTIA
 * CySA+ CS0-004 V4 Exam Objectives (Document Version 2.0), distinct from
 * the P1 and P2 sets. Distributed to the published blueprint:
 *   Security Operations              34% (22)
 *   Vulnerability Management         26% (17)
 *   Incident Response and Management 24% (16)
 *   Reporting and Communication      16% (10)
 *
 * This variant completes the objective surface: the 1.3 tooling and file
 * formats P1/P2 leave untouched (tcpdump, Suricata, sandboxes, strings,
 * regular expressions, MXToolbox, EVTX/JSON/YAML), the 1.4 threat-actor
 * and attribution material, the 2.x control types and application
 * security testing split, the 3.x preparation and restoration steps, and
 * the 4.2 post-incident reporting artifacts.
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
const REF_NIST_86 = { label: 'NIST SP 800-86 — Integrating Forensic Techniques into Incident Response', url: 'https://csrc.nist.gov/pubs/sp/800/86/final' };
const REF_NIST_92 = { label: 'NIST SP 800-92 — Guide to Computer Security Log Management', url: 'https://csrc.nist.gov/pubs/sp/800/92/final' };
const REF_NIST_94 = { label: 'NIST SP 800-94 — Guide to Intrusion Detection and Prevention Systems', url: 'https://csrc.nist.gov/pubs/sp/800/94/final' };
const REF_NIST_115 = { label: 'NIST SP 800-115 — Technical Guide to Information Security Testing', url: 'https://csrc.nist.gov/pubs/sp/800/115/final' };
const REF_NIST_124 = { label: 'NIST SP 800-124 Rev. 2 — Guidelines for Managing the Security of Mobile Devices', url: 'https://csrc.nist.gov/pubs/sp/800/124/r2/final' };
const REF_NIST_137 = { label: 'NIST SP 800-137 — Information Security Continuous Monitoring', url: 'https://csrc.nist.gov/pubs/sp/800/137/final' };
const REF_NIST_150 = { label: 'NIST SP 800-150 — Guide to Cyber Threat Information Sharing', url: 'https://csrc.nist.gov/pubs/sp/800/150/final' };
const REF_NIST_AI_RMF = { label: 'NIST — AI Risk Management Framework (AI RMF 1.0)', url: 'https://www.nist.gov/itl/ai-risk-management-framework' };
const REF_MITRE_ATTACK = { label: 'MITRE ATT&CK — Enterprise matrix', url: 'https://attack.mitre.org/matrices/enterprise/' };
const REF_MITRE_CWE = { label: 'MITRE — Common Weakness Enumeration (CWE)', url: 'https://cwe.mitre.org/' };
const REF_CVSS4 = { label: 'FIRST — CVSS v4.0 specification', url: 'https://www.first.org/cvss/v4-0/specification-document' };
const REF_EPSS = { label: 'FIRST — Exploit Prediction Scoring System (EPSS)', url: 'https://www.first.org/epss/' };
const REF_KEV = { label: 'CISA — Known Exploited Vulnerabilities Catalog', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' };
const REF_SBOM = { label: 'CISA — Software Bill of Materials (SBOM)', url: 'https://www.cisa.gov/sbom' };
const REF_OWASP_TOP10 = { label: 'OWASP Top 10 — Web Application Security Risks', url: 'https://owasp.org/www-project-top-ten/' };
const REF_OWASP_LLM = { label: 'OWASP Top 10 for Large Language Model Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' };
const REF_SAMM = { label: 'OWASP SAMM — Software Assurance Maturity Model', url: 'https://owaspsamm.org/' };
const REF_ISO27001 = { label: 'ISO/IEC 27001 — Information security management systems', url: 'https://www.iso.org/standard/27001' };
const REF_CIS = { label: 'CIS — Benchmarks and secure configuration guidance', url: 'https://www.cisecurity.org/cis-benchmarks' };
const REF_TCPDUMP = { label: 'tcpdump — Manual page', url: 'https://www.tcpdump.org/manpages/tcpdump.1.html' };
const REF_SURICATA = { label: 'Suricata — Rules documentation', url: 'https://docs.suricata.io/en/latest/rules/index.html' };
const REF_CUCKOO = { label: 'Cuckoo Sandbox — Documentation', url: 'https://cuckoo.readthedocs.io/en/latest/' };
const REF_STRINGS = { label: 'Sysinternals — Strings utility', url: 'https://learn.microsoft.com/en-us/sysinternals/downloads/strings' };
const REF_DMARC = { label: 'IETF RFC 7489 — Domain-based Message Authentication, Reporting, and Conformance (DMARC)', url: 'https://www.rfc-editor.org/rfc/rfc7489' };
const REF_EVTX = { label: 'Microsoft — Windows Event Log reference', url: 'https://learn.microsoft.com/en-us/windows/win32/wes/windows-event-log' };
const REF_NESSUS = { label: 'Tenable — Nessus documentation', url: 'https://docs.tenable.com/nessus/Content/GettingStarted.htm' };
const REF_NIKTO = { label: 'Nikto — Web server scanner', url: 'https://github.com/sullo/nikto/wiki' };
const REF_METASPLOIT = { label: 'Rapid7 — Metasploit Framework documentation', url: 'https://docs.rapid7.com/metasploit/' };
const REF_MALTEGO = { label: 'Maltego — OSINT link analysis documentation', url: 'https://docs.maltego.com/' };
const REF_SCOUTSUITE = { label: 'ScoutSuite — Multi-cloud security auditing tool', url: 'https://github.com/nccgroup/ScoutSuite/wiki' };
const REF_SOAR = { label: 'NIST SP 800-160 Vol. 2 Rev. 1 — Developing Cyber-Resilient Systems', url: 'https://csrc.nist.gov/pubs/sp/800/160/v2/r1/final' };

const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const optsTF = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

export const CYSA_P3: CysaQ[] = [
  // ───────────── Security Operations (22) ─────────────
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which characteristic most distinguishes an advanced persistent threat from opportunistic commodity crime?',
    options: opts4(
      'Sustained, well-resourced targeting of a specific objective over time',
      'Exclusive reliance on previously unknown zero-day vulnerabilities',
      'Use of ransomware deployment as the primary means of monetizing the access obtained',
      'Operation without any command-and-control infrastructure'
    ),
    correct: ['a'],
    explanation: 'APT activity is defined by persistence, resourcing, and a deliberate objective pursued over months, not by any single technique. APTs frequently use ordinary phishing and stolen credentials, monetization varies or is absent for espionage actors, and they still require command and control.',
    references: [REF_MITRE_ATTACK, REF_NIST_150]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A departing employee with legitimate access copies the customer database to personal storage during their notice period. Which threat category and property best describe this?',
    options: opts4(
      'An insider threat, difficult to detect because the access is authorized',
      'An APT campaign, characterized by long-term external reconnaissance',
      'A supply chain attack, introduced through a third-party component',
      'A hacktivist operation, motivated by publicizing an ideological cause'
    ),
    correct: ['a'],
    explanation: 'Insider activity uses entitlements the person legitimately holds, so perimeter and malware controls see nothing unusual and behavioral analytics carry the detection burden. The other categories describe external actors, third-party compromise, and ideological motive respectively.',
    references: [REF_NIST_53, REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'An intrusion uses tooling and language artifacts publicly associated with a named nation-state group. Why should the analyst be cautious about attributing it to that group?',
    options: opts4(
      'Tooling and artifacts can be reused or planted to mislead investigators',
      'Attribution is prohibited unless performed by a government agency',
      'Nation-state groups never reuse tooling across separate operations',
      'Technical artifacts are inadmissible as evidence in any jurisdiction'
    ),
    correct: ['a'],
    explanation: 'Shared tooling, leaked code, and deliberate false flags make artifact-based attribution weak on its own, so confident attribution requires converging evidence across many sources. There is no legal monopoly on attribution, reuse is common rather than impossible, and technical evidence is routinely used.',
    references: [REF_NIST_150, REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An analyst compiles intelligence from public breach disclosures, domain registration records, and social media profiles. Which collection method is this?',
    options: opts4(
      'Open-source intelligence',
      'Closed-source intelligence',
      'Human intelligence',
      'Signals intelligence'
    ),
    correct: ['a'],
    explanation: 'OSINT draws on publicly available material that requires no privileged access. Closed-source intelligence comes from paid or restricted feeds, human intelligence from people, and signals intelligence from intercepted transmissions.',
    references: [REF_NIST_150]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A feed supplies accurate, well-corroborated indicators, but they typically arrive three weeks after the campaigns they describe have ended. Which confidence dimension is deficient?',
    options: opts4(
      'Timeliness',
      'Accuracy',
      'Relevance',
      'Attribution'
    ),
    correct: ['a'],
    explanation: 'The intelligence is correct but arrives too late to inform defensive action, which is a timeliness failure. Accuracy concerns correctness, relevance concerns applicability to the organization, and attribution concerns identifying the actor.',
    references: [REF_NIST_150]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A responder must capture traffic on a headless Linux server for later analysis on a workstation. Which approach fits?',
    options: opts4(
      'Run tcpdump with a capture filter, writing packets to a pcap file',
      'Open Wireshark on the server and inspect the live capture there',
      'Enable NetFlow export and review the flow records on the collector',
      'Increase syslog verbosity and forward the messages to the SIEM'
    ),
    correct: ['a'],
    explanation: 'tcpdump is the command-line capture tool for exactly this case, and the resulting pcap opens in Wireshark elsewhere. A GUI is unavailable on a headless host, and flow records and syslog give summaries and events rather than full packet data.',
    references: [REF_TCPDUMP]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team writes a rule that inspects packet payloads for a byte sequence unique to a malware family and alerts when it appears in traffic. Which technology are they configuring?',
    options: opts4(
      'A network intrusion detection system such as Suricata',
      'A host-based file integrity monitoring agent',
      'A security orchestration and automated response playbook',
      'A cloud security posture management policy'
    ),
    correct: ['a'],
    explanation: 'Signature rules matching content in traffic are network IDS/IPS constructs, which Suricata and Snort implement. FIM watches files on a host, SOAR automates response workflows, and posture management evaluates cloud configuration.',
    references: [REF_SURICATA, REF_NIST_94]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Detonating a suspicious executable in an instrumented sandbox produces a report of created files, registry keys, and contacted domains. What kind of analysis is this?',
    options: opts4(
      'Dynamic analysis, observing the sample\'s behavior as it executes',
      'Static analysis, examining the sample without running it',
      'Composition analysis, enumerating third-party libraries it includes',
      'Regression analysis, comparing it against previous software versions'
    ),
    correct: ['a'],
    explanation: 'Executing the sample and recording what it does is dynamic analysis, which is what sandboxes such as Cuckoo and Joe Sandbox provide. Static analysis inspects the file at rest, composition analysis inventories dependencies, and regression analysis is a testing practice.',
    references: [REF_CUCKOO]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Before detonating an unknown binary, an analyst extracts readable character sequences from it and finds URLs and a mutex name. Which technique produced this?',
    options: opts4(
      'Running strings against the binary to recover embedded text',
      'Calculating the file hash and querying a reputation service',
      'Disassembling the binary into annotated assembly instructions',
      'Executing the binary inside an isolated virtual machine'
    ),
    correct: ['a'],
    explanation: 'Strings extraction reads printable sequences straight out of the file and often exposes URLs, mutexes, and command fragments cheaply. Hashing produces an identifier, disassembly is far deeper static work, and execution is dynamic analysis rather than extraction.',
    references: [REF_STRINGS]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An analyst needs to pull every IPv4 address out of several thousand lines of unstructured log text. Which approach is most appropriate?',
    options: opts4(
      'Apply a regular expression matching the dotted-quad address pattern',
      'Sort the file alphabetically and review the results by hand',
      'Import the file into the SIEM and wait for a correlation rule to fire',
      'Hash each line and compare the values against a known-bad list'
    ),
    correct: ['a'],
    explanation: 'Pattern recognition through regular expressions is the standard way to extract structured artifacts from unstructured text at scale. Manual review does not scale, correlation rules act on parsed events rather than raw text, and hashing lines does not extract anything.',
    references: [REF_OBJ, REF_NIST_92]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Phishing messages are arriving that appear to come from the organization\'s own domain. Which combination of DNS records should the analyst verify?',
    options: opts4(
      'SPF, DKIM, and DMARC records published for the domain',
      'A, AAAA, and CNAME records for the mail server hostnames',
      'NS and SOA records delegating authority for the zone',
      'PTR records providing reverse lookups for the mail servers'
    ),
    correct: ['a'],
    explanation: 'SPF authorizes sending hosts, DKIM signs messages, and DMARC tells receivers how to handle failures and where to report — together they are what stops domain spoofing. Address, delegation, and reverse records serve resolution rather than sender authentication.',
    references: [REF_DMARC]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A SOC must parse Windows event logs collected as .evtx files and normalize them alongside cloud audit records supplied as JSON. What does this require?',
    options: opts4(
      'Parsers for each format that map fields into a common schema',
      'Conversion of all sources into plain text before any analysis',
      'Separate analyst teams dedicated to each individual log format',
      'Discarding the JSON records because EVTX is the authoritative source'
    ),
    correct: ['a'],
    explanation: 'Heterogeneous formats are handled by format-specific parsers feeding one normalized schema, which is what makes cross-source correlation possible. Flattening to text loses structure, splitting teams by format prevents correlation, and discarding a source creates a blind spot.',
    references: [REF_EVTX, REF_NIST_92]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Which tasks are well suited to scripting in a security operations centre? (Choose three.)',
    options: opts4(
      'Bulk-querying a reputation API for a list of observed addresses',
      'Parsing recurring log exports into a normalized summary report',
      'Automating collection of a standard artifact set from a host',
      'Deciding whether a confirmed breach should be disclosed publicly'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Repetitive, well-defined, high-volume work — enrichment lookups, parsing, and standardized collection — is exactly what Python, PowerShell, and shell scripting streamline. Disclosure is a legal and executive judgement that must not be automated.',
    references: [REF_OBJ, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A network sweep finds a wireless access point on the corporate LAN that is not in the asset inventory and is broadcasting an open SSID. What does this represent?',
    options: opts4(
      'A rogue device creating an unmanaged path into the network',
      'An evil twin impersonating the corporate wireless network',
      'A honeypot deployed by the security team to attract attackers',
      'A guest network segment operating as designed for visitors'
    ),
    correct: ['a'],
    explanation: 'An unmanaged device attached to the corporate network is a rogue device, and an open SSID on it bypasses the controls every sanctioned entry point enforces. An evil twin specifically mimics a legitimate SSID, a honeypot would be deliberately deployed and documented, and a guest segment would be inventoried and isolated.',
    references: [REF_NIST_137]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A database server that should serve only TCP 1433 internally is observed listening on TCP 4444 and accepting external connections. How should this be interpreted?',
    options: opts4(
      'Activity on an unexpected port, warranting immediate investigation',
      'Normal ephemeral port usage by the database client library',
      'A scanner artifact produced by an incomplete TCP handshake during discovery',
      'Expected behavior following a routine database version upgrade'
    ),
    correct: ['a'],
    explanation: 'A service listening on a port outside its baseline, especially one commonly used by remote-access payloads, is a strong indicator of unauthorized software or a backdoor. Ephemeral ports are used by outbound client connections rather than listeners, and neither scanning artifacts nor upgrades create unexplained external listeners.',
    references: [REF_MITRE_ATTACK, REF_NIST_137]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A file server that normally sends under 1 GB per day transfers 240 GB to an external cloud storage provider between 02:00 and 05:00. Which indicator category applies, and what should follow?',
    options: opts4(
      'Data exfiltration; scope what was transferred and contain the account used',
      'Resource consumption; add storage capacity to the affected file server',
      'Service disruption; restart the file sharing service to restore performance',
      'Anomalous configuration; revert the server to its previous baseline image'
    ),
    correct: ['a'],
    explanation: 'A two-order-of-magnitude outbound spike to external storage outside business hours is the classic exfiltration signature, and the priority is establishing what left and cutting off the access used. The alternatives treat it as a capacity, availability, or configuration problem and would destroy evidence while the transfer continues.',
    references: [REF_MITRE_ATTACK, REF_NIST_61]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A cloud account shows dozens of large compute instances launched in unused regions, and the monthly spend has tripled. What is the most likely explanation?',
    options: opts4(
      'Resource compromise, with the account used for unauthorized compute',
      'A billing system error duplicating charges across regions',
      'Automatic scaling responding to legitimate demand growth',
      'A scheduled disaster recovery test provisioning standby capacity'
    ),
    correct: ['a'],
    explanation: 'Mass instance creation in regions the organization does not use is the standard pattern of credential compromise turned to cryptomining. Billing errors do not create instances, autoscaling stays within configured regions and limits, and a DR test would be planned and documented.',
    references: [REF_MITRE_ATTACK]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A cloud storage bucket holding customer records is changed from private to public, with no corresponding change request. How should this be classified?',
    options: opts4(
      'An unauthorized configuration change requiring investigation',
      'A routine administrative action needing no security review',
      'A false positive produced by the cloud provider\'s audit logging',
      'A compensating control applied to improve service availability'
    ),
    correct: ['a'],
    explanation: 'A security-relevant setting altered outside the change process is an unauthorized configuration change, and on customer data it is potentially a disclosure incident. It is neither routine nor a logging artifact, and public exposure is not a control of any kind.',
    references: [REF_NIST_137, REF_NIST_53]
  },
  {
    domain: OPS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Mobile device management can enforce encryption and remotely wipe a lost corporate phone, but it cannot by itself guarantee that no corporate data was copied off the device beforehand.',
    options: optsTF(),
    correct: ['a'],
    explanation: 'True. MDM enforces posture and enables remote wipe, but data already copied to another destination is outside its reach, which is why containerization and data loss prevention complement it. Recognizing that limit matters when scoping a lost-device incident.',
    references: [REF_NIST_124]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A team defines its cloud environment in version-controlled templates so every deployment is reproducible and reviewable. How does this most benefit security operations?',
    options: opts4(
      'Configuration drift becomes visible and correctable through the pipeline',
      'The environment no longer requires vulnerability scanning at runtime',
      'Credentials can safely be stored inside the templates themselves',
      'Incident response becomes unnecessary because deployments are consistent'
    ),
    correct: ['a'],
    explanation: 'Infrastructure as code makes the intended state explicit and reviewable, so drift is detectable and remediation ships as a code change. Runtime scanning is still required, secrets must stay out of templates, and consistent deployment reduces but never removes the need to respond.',
    references: [REF_SOAR, REF_NIST_137]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A rule generates 400 alerts a day, of which fewer than five are genuine. What is the appropriate first response?',
    options: opts4(
      'Tune the rule with additional context to suppress the benign pattern',
      'Delete the rule entirely so analysts stop receiving its alerts',
      'Route the alerts to a mailbox nobody actively monitors',
      'Leave the rule unchanged, since it does occasionally detect genuine malicious activity'
    ),
    correct: ['a'],
    explanation: 'Rule and alert tuning refines logic with the context that separates benign from malicious, preserving detection while restoring signal. Deleting the rule loses coverage, silently routing alerts away is deletion with extra steps, and leaving it produces the fatigue that causes real detections to be missed.',
    references: [REF_NIST_137, REF_NIST_92]
  },
  {
    domain: OPS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Using an AI assistant to compare artifacts from two separate incidents and highlight overlapping indicators is a legitimate use case, provided the findings are verified against the source data.',
    options: optsTF(),
    correct: ['a'],
    explanation: 'True. Comparing artifacts, correlating events, and drafting documentation are named AI use cases in security operations, and their value is speed across large volumes. The verification requirement stands because generated output can assert overlaps that the underlying evidence does not support.',
    references: [REF_NIST_AI_RMF, REF_OWASP_LLM]
  },

  // ───────────── Vulnerability Management (17) ─────────────
  {
    domain: VULN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does an external vulnerability scan reveal that an internal scan of the same estate does not?',
    options: opts4(
      'The attack surface actually reachable from the public internet',
      'The complete list of missing patches on every internal host',
      'The configuration baseline drift across internal server builds',
      'The third-party components embedded in internally built applications'
    ),
    correct: ['a'],
    explanation: 'Scanning from outside shows what an unauthenticated internet attacker can reach through the perimeter, which internal scanning cannot establish. Patch state, baseline drift, and component inventories are all better assessed from inside or through dedicated tooling.',
    references: [REF_NIST_115]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A hospital classifies systems by data sensitivity before scanning, treating clinical systems differently from the guest wireless network. Why does sensitivity level belong in scan planning?',
    options: opts4(
      'It drives scan depth, timing, and the handling of the results produced',
      'It determines which vendor\'s scanning engine may lawfully be used',
      'It sets the CVSS base score applied to any findings discovered',
      'It removes low-sensitivity systems from the scanning scope entirely'
    ),
    correct: ['a'],
    explanation: 'Sensitivity shapes how aggressively a system may be probed, when, and how carefully results are stored and shared, since scan output on a critical system is itself sensitive. It does not dictate tool choice, does not alter base scores, and does not exempt lower-sensitivity systems.',
    references: [REF_NIST_115, REF_NIST_137]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization must demonstrate a certified information security management system to win contracts in several markets. Which standard applies?',
    options: opts4(
      'ISO/IEC 27001, which certifies a management system for information security',
      'PCI DSS, which governs how payment cardholder data is stored, processed, and transmitted',
      'CIS Benchmarks, which define per-platform hardening configurations',
      'CVSS, which provides a scoring method for vulnerability severity'
    ),
    correct: ['a'],
    explanation: 'ISO/IEC 27001 is the certifiable ISMS standard organizations are audited against for exactly this purpose. PCI DSS is a payments-specific mandate, CIS Benchmarks are configuration guidance rather than a certification, and CVSS is a scoring system.',
    references: [REF_ISO27001, REF_CIS]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'An analyst reviews Nessus output showing a finding rated critical on a host, with a plugin note that the check was performed without credentials. What caveat applies?',
    options: opts4(
      'The result is inferred from banners and needs confirmation on the host',
      'The result is definitive because the plugin returned a critical rating',
      'The result can be closed immediately as an unverifiable false positive',
      'The result applies to every host in the same subnet as the target'
    ),
    correct: ['a'],
    explanation: 'Uncredentialed checks often infer versions from service banners, which backported vendor patches routinely make misleading, so verification on the host is required. The rating is not self-validating, dismissing it unverified is equally wrong, and findings do not generalize across a subnet.',
    references: [REF_NESSUS, REF_NIST_115]
  },
  {
    domain: VULN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team wants a quick check of a web server for dangerous default files, outdated server software, and known misconfigurations. Which tool is purpose-built for this?',
    options: opts4(
      'Nikto, which tests web servers against a database of known issues',
      'Maltego, which visualizes relationships between OSINT entities',
      'Metasploit, which develops and delivers working exploit payloads',
      'ScoutSuite, which audits cloud provider account configuration'
    ),
    correct: ['a'],
    explanation: 'Nikto exists to sweep web servers for default content, outdated versions, and common misconfiguration. Maltego maps OSINT relationships, Metasploit is an exploitation framework, and ScoutSuite assesses cloud accounts.',
    references: [REF_NIKTO]
  },
  {
    domain: VULN, difficulty: 4, type: QType.SINGLE,
    stem: 'With written authorization, a tester needs to establish whether a reported flaw is genuinely exploitable in the environment before the business accepts a disruptive emergency change. Which tool supports this validation?',
    options: opts4(
      'Metasploit Framework, to attempt controlled exploitation of the finding',
      'Angry IP Scanner, to enumerate which hosts respond on the network',
      'Trivy, to inspect container images for vulnerable packages',
      'Checkov, to statically analyze the infrastructure-as-code templates for misconfiguration'
    ),
    correct: ['a'],
    explanation: 'Confirming exploitability requires attempting the exploit under authorization, which is what an exploitation framework provides and what converts a theoretical score into a decision. Host discovery, image scanning, and IaC analysis all identify potential issues without demonstrating exploitability.',
    references: [REF_METASPLOIT, REF_NIST_115]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'Before an authorized assessment, a team maps the target organization\'s domains, subdomains, employees, and technology footprint, visualizing the relationships. Which tool fits?',
    options: opts4(
      'Maltego, which builds link graphs from open-source data',
      'Nessus, which performs authenticated vulnerability checks',
      'Suricata, which inspects network traffic against signature rules',
      'Cuckoo Sandbox, which detonates samples and records behavior'
    ),
    correct: ['a'],
    explanation: 'Maltego specializes in transforming and graphing relationships between OSINT entities, which is exactly footprint mapping. The others perform vulnerability assessment, traffic inspection, and malware detonation.',
    references: [REF_MALTEGO]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-cloud estate spans AWS, Azure, and GCP, and leadership wants one consolidated view of misconfiguration across all three. Which tool addresses this?',
    options: opts4(
      'ScoutSuite, which audits multiple cloud providers into one report',
      'Nikto, which scans web servers for dangerous default files and outdated software',
      'Masscan, which discovers open ports at very high scan rates',
      'Strings, which extracts printable text from binary files'
    ),
    correct: ['a'],
    explanation: 'ScoutSuite queries each provider\'s APIs and produces a unified assessment, which is the multi-cloud posture requirement described. The alternatives address web content, port discovery, and file inspection.',
    references: [REF_SCOUTSUITE]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A critical finding has no vendor patch available, and the affected component is business-essential. Which prioritization criterion does this most directly affect?',
    options: opts4(
      'Patch and remediation availability, which shapes the response options',
      'Exploitability, which describes how readily the flaw can be triggered',
      'Asset value, which reflects the importance of the affected system',
      'Impact, which describes the consequence of successful exploitation'
    ),
    correct: ['a'],
    explanation: 'Whether a fix exists determines whether the response is patching or compensating controls, and it is tracked as its own criterion. Exploitability, asset value, and impact remain unchanged by the absence of a patch, though they still inform urgency.',
    references: [REF_NIST_40, REF_KEV]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A security team continuously discovers and inventories internet-facing assets, including systems provisioned by business units without approval. What is this practice?',
    options: opts4(
      'Attack surface management',
      'Software composition analysis',
      'Breach and attack simulation',
      'Static application security testing'
    ),
    correct: ['a'],
    explanation: 'Attack surface management continuously discovers and monitors externally reachable assets, which is how shadow IT is found. SCA inventories code dependencies, BAS validates detection, and SAST analyzes source.',
    references: [REF_NIST_137, REF_SBOM]
  },
  {
    domain: VULN, difficulty: 3, type: QType.MULTI,
    stem: 'Which practices are examples of secure coding that reduce vulnerability introduction? (Choose three.)',
    options: opts4(
      'Encoding output according to the context it is rendered in',
      'Validating and constraining input on the server side',
      'Using vetted cryptographic libraries rather than custom implementations',
      'Storing application secrets in comments within the source file'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Context-aware output encoding stops injection into rendered content, server-side validation constrains what the application accepts, and using reviewed crypto libraries avoids self-inflicted flaws. Placing secrets in source comments exposes them to anyone with repository access.',
    references: [REF_OWASP_TOP10, REF_MITRE_CWE]
  },
  {
    domain: VULN, difficulty: 4, type: QType.SINGLE,
    stem: 'A business unit requests permission to run an unpatched application for six months pending a replacement project. How should the vulnerability programme handle this?',
    options: opts4(
      'Record a time-bound exception with approval, controls, and a review date',
      'Close the finding permanently because the business has accepted it',
      'Remove the host from the scanning scope so the finding stops reappearing in reports',
      'Escalate to the regulator for a formal determination on the request'
    ),
    correct: ['a'],
    explanation: 'Exceptions are documented, authorized at the right level, paired with compensating controls, and given an expiry that forces re-examination. Permanent closure loses visibility, excluding the host hides the risk, and this is an internal governance decision rather than a regulatory one.',
    references: [REF_NIST_40, REF_NIST_53]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'Security awareness training and an acceptable use policy are examples of which control type?',
    options: opts4(
      'Administrative',
      'Technical',
      'Preventative',
      'Compensating'
    ),
    correct: ['a'],
    explanation: 'Administrative controls are the policies, procedures, and training that govern how people behave. Technical controls are implemented in systems, while preventative is a control function and compensating describes a control substituted when the primary one is not feasible — neither is a control type.',
    references: [REF_NIST_53]
  },
  {
    domain: VULN, difficulty: 3, type: QType.SINGLE,
    stem: 'A development team wants findings raised while code is being written, before anything is deployed. Which testing approach fits, and what is its main limitation?',
    options: opts4(
      'SAST; it analyzes source early but cannot see runtime or deployment issues',
      'DAST; it analyzes source early but produces a high false-negative rate',
      'SCA; it analyzes source early but only reports first-party code defects',
      'BAS; it analyzes source early but requires a running production system'
    ),
    correct: ['a'],
    explanation: 'Static testing runs against source in the pipeline, giving early feedback, but it cannot observe configuration, environment, or runtime behavior. DAST requires a running application, SCA covers third-party components rather than first-party code, and BAS validates detection rather than analyzing source.',
    references: [REF_NIST_115, REF_SAMM]
  },
  {
    domain: VULN, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A vulnerability with a high CVSS base score but an EPSS probability near zero should automatically be remediated ahead of a medium-scoring vulnerability listed in the CISA KEV catalog.',
    options: optsTF(),
    correct: ['b'],
    explanation: 'False. KEV listing means exploitation is confirmed in the wild, which usually outweighs a higher severity score with no observed exploitation. Prioritization combines severity with real-world exploitation evidence, asset value, and exposure rather than ranking on base score alone.',
    references: [REF_KEV, REF_EPSS, REF_CVSS4]
  },
  {
    domain: VULN, difficulty: 4, type: QType.SINGLE,
    stem: 'A build server is compromised and a backdoor is inserted into a signed application shipped to customers. Which risk category does this represent?',
    options: opts4(
      'Supply chain risk, where compromise propagates through trusted distribution',
      'Insider risk, where an authorized employee misuses their access',
      'Residual risk, the exposure that remains after the organization applies its chosen controls',
      'Inherent risk, present before any security controls are considered'
    ),
    correct: ['a'],
    explanation: 'Compromising the build and signing pipeline turns the vendor\'s trusted distribution channel into the delivery mechanism, which is the defining shape of a supply chain attack. The other options describe an actor category and two general risk states rather than this propagation path.',
    references: [REF_SBOM, REF_MITRE_ATTACK]
  },
  {
    domain: VULN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of the Software Assurance Maturity Model?',
    options: opts4(
      'To assess and improve an organization\'s software security practices over time',
      'To score the technical severity of an individual discovered vulnerability',
      'To enumerate the third-party components included in an application build',
      'To detect injection flaws in a running web application automatically'
    ),
    correct: ['a'],
    explanation: 'SAMM is a maturity framework for measuring and improving software assurance practices across governance, design, implementation, verification, and operations. Severity scoring is CVSS, component inventory is SCA and SBOM, and runtime flaw detection is DAST.',
    references: [REF_SAMM]
  },

  // ───────────── Incident Response and Management (16) ─────────────
  {
    domain: IR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which activity belongs to the preparation phase rather than to detection or analysis?',
    options: opts4(
      'Defining team roles and stocking a jump kit before an incident occurs',
      'Correlating alerts to establish whether an incident has taken place',
      'Determining which systems an intruder accessed during the intrusion',
      'Confirming that malicious persistence has been removed from a host'
    ),
    correct: ['a'],
    explanation: 'Preparation is everything done in advance — roles, tooling, plans, and training — so the team can act when something happens. Correlation and scoping are detection and analysis work, and confirming persistence removal belongs to eradication.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does an incident response plan name specific roles such as incident commander and communications lead in advance?',
    options: opts4(
      'It removes ambiguity about who decides and who speaks under pressure',
      'It satisfies a legal requirement applying to all commercial organizations',
      'It guarantees that at least one responder is always physically on site',
      'It determines the severity rating assigned to each declared incident'
    ),
    correct: ['a'],
    explanation: 'Pre-assigned roles prevent the confusion and duplicated or omitted action that occur when authority is negotiated mid-incident. There is no universal legal mandate of this form, staffing presence is a rostering matter, and severity is set by defined criteria rather than by role assignment.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization centralizes endpoint, firewall, proxy, and identity logs into one platform before an incident occurs. How does this help the response?',
    options: opts4(
      'Responders can reconstruct activity across systems from a single source',
      'It prevents the adversary from gaining access to any of those systems',
      'It removes the need to preserve evidence from individual endpoints',
      'It guarantees that every intrusion will be detected automatically'
    ),
    correct: ['a'],
    explanation: 'Log collection and correlation make cross-system reconstruction possible without racing to gather sources while an intrusion is live. Centralization is a visibility control, not a preventive one, endpoint evidence is still required, and detection depends on the rules applied to the data.',
    references: [REF_NIST_92, REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC receives 900 alerts a day and closes most without action. Which improvement most directly addresses the risk that a genuine intrusion is overlooked?',
    options: opts4(
      'Tuning detections and prioritizing alerts by asset criticality',
      'Hiring additional analysts to work through the entire alert queue',
      'Extending the SIEM retention period from 90 days to twelve months',
      'Adding more detection rules to increase overall coverage'
    ),
    correct: ['a'],
    explanation: 'Alert fatigue is a signal-quality problem, so improving fidelity and ordering work by what matters is the direct fix. More analysts scale the noise, longer retention aids investigation after the fact, and additional untuned rules make the underlying problem worse.',
    references: [REF_NIST_61, REF_NIST_137]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'Ransomware has encrypted a file server. Backups exist and the intrusion vector has been identified and closed. What must precede restoration?',
    options: opts4(
      'Verifying the backups are clean and predate the initial compromise',
      'Paying the ransom to obtain the decryption key as a contingency',
      'Restoring immediately to minimize the business outage duration',
      'Publishing the incident details to the organization\'s customers'
    ),
    correct: ['a'],
    explanation: 'Backups taken after initial access can carry the intrusion straight back, so establishing a restore point earlier than the compromise and validating its integrity is the gating step. Immediate restoration risks reinfection, payment is a separate legal and executive decision, and customer notification is a communications step rather than a restoration prerequisite.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'After remediating an intrusion, the team runs targeted queries to confirm the attacker\'s persistence mechanisms no longer exist and the credentials used have been rotated. What is this step?',
    options: opts4(
      'Remediation verification, confirming the fix achieved its intent',
      'Root cause analysis, establishing why the intrusion succeeded',
      'Evidence preservation, protecting artifacts for later proceedings',
      'Incident declaration, formally recognizing that an incident occurred'
    ),
    correct: ['a'],
    explanation: 'Checking that the remediation actually worked before standing down is verification, and it is what prevents a premature all-clear. RCA explains the underlying cause, preservation protects evidence, and declaration happens at the start of the response.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'In MITRE ATT&CK, an analyst records that an adversary used "Scheduled Task/Job: Scheduled Task" for persistence. What does the second element represent?',
    options: opts4(
      'A sub-technique giving a more specific method within the technique',
      'A separate tactic pursued in parallel with persistence',
      'A mitigation recommended for the technique described',
      'A data source describing the telemetry from which the activity can be detected'
    ),
    correct: ['a'],
    explanation: 'ATT&CK nests sub-techniques under techniques to express a more precise variant of the same behavior. Tactics are the objectives, mitigations are recommended defenses, and data sources describe the telemetry that reveals the activity.',
    references: [REF_MITRE_ATTACK]
  },
  {
    domain: IR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A monitoring rule fires and pages the on-call analyst at 03:00. Which incident response element does this represent?',
    options: opts4(
      'Alerting and notification, routing a detection to a responder',
      'Escalation, raising the incident to a higher authority level',
      'Triage, ranking competing alerts by severity and impact',
      'Containment, limiting the spread of confirmed malicious activity'
    ),
    correct: ['a'],
    explanation: 'Generating the signal and delivering it to the person who can act is alerting and notification. Escalation raises an existing case, triage orders competing work, and containment is a response action taken later.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'Three incidents are open: malware on an isolated test VM, credential theft affecting a finance administrator, and a phishing report with no clicks. How should they be prioritized?',
    options: opts4(
      'Credential theft first, then the malware, then the phishing report',
      'Malware first, because executing code is always the greatest risk',
      'Phishing first, because early action prevents any user from clicking',
      'All three simultaneously, because every incident carries equal weight'
    ),
    correct: ['a'],
    explanation: 'Prioritization weighs likely impact and asset criticality: stolen privileged finance credentials enable immediate fraud and lateral movement, malware confined to an isolated test system is contained by design, and an unclicked phish is lowest. Treating all incidents equally squanders finite response capacity.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'During analysis, responders discover the intrusion began six weeks earlier than the triggering alert suggested. What is the immediate consequence for the response?',
    options: opts4(
      'Containment scope must widen to cover the longer period of activity',
      'The incident severity must be reduced because detection already occurred',
      'The evidence collected before this discovery must be discarded',
      'The response can proceed unchanged because the alert defined the scope'
    ),
    correct: ['a'],
    explanation: 'Extended dwell time means more hosts, accounts, and data are potentially affected, so scoping and containment must expand or footholds will survive eradication. Longer dwell raises rather than lowers severity, prior evidence remains valid, and treating the alert as the boundary is the error that causes reinfection.',
    references: [REF_NIST_61, REF_MITRE_ATTACK]
  },
  {
    domain: IR, difficulty: 3, type: QType.MULTI,
    stem: 'Which conditions would appropriately trigger formal incident declaration under a typical plan? (Choose three.)',
    options: opts4(
      'Confirmed unauthorized access to systems holding regulated data',
      'Ransomware encrypting files on a production file server',
      'Credential compromise of an account with domain administrator rights',
      'A single blocked phishing email quarantined by the mail gateway'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Declaration criteria centre on confirmed impact or the credible potential for serious impact — regulated data exposure, active ransomware, and compromise of highly privileged credentials all qualify. A phish the gateway blocked is a routine control success handled as an event.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'A responder must choose between immediately blocking an adversary\'s C2 domain and continuing to monitor the channel briefly. Which consideration should drive the decision?',
    options: opts4(
      'Whether the full scope is known well enough that blocking will not just hide activity',
      'Whether the domain appears in any commercial threat intelligence feed',
      'Whether blocking the domain would first require emergency change advisory board approval',
      'Whether the domain was registered within the previous thirty days'
    ),
    correct: ['a'],
    explanation: 'Acting before scoping alerts the adversary and pushes them to backup channels the team has not identified, so the judgement is whether visibility is sufficient to make containment comprehensive. Feed presence, registration age, and change process are inputs to the case but do not resolve the timing trade-off.',
    references: [REF_NIST_61, REF_MITRE_ATTACK]
  },
  {
    domain: IR, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'Because an incident response plan is written in advance, it should be treated as fixed and only revised when a regulator or auditor requires a change.',
    options: optsTF(),
    correct: ['b'],
    explanation: 'False. The plan is a living document updated from exercises, real incidents, technology change, and staffing change; lessons learned feed directly back into preparation. Waiting for external pressure guarantees the plan drifts out of step with the environment it governs.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'A responder needs to prove that a specific user account executed a command on a server at a given time. Which combination of evidence is strongest?',
    options: opts4(
      'Correlated authentication, process creation, and command-line logs from multiple sources',
      'A screenshot of the alert taken from the monitoring console',
      'The analyst\'s written recollection of what the console displayed',
      'The output of the most recent authenticated vulnerability scan run against that server'
    ),
    correct: ['a'],
    explanation: 'Independent, time-correlated sources that survive tampering on any single host provide the strongest evidentiary chain. Screenshots and recollections are weak and easily challenged, and scan output describes exposure rather than actions taken.',
    references: [REF_NIST_86, REF_NIST_92]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'A simulation exercise reveals that responders could not locate the current contact details for the third-party hosting provider. What should follow?',
    options: opts4(
      'Update the plan\'s contact roster and retest it in the next exercise',
      'Record the failure in the exercise report without further follow-up',
      'Cancel future exercises until the provider improves its responsiveness',
      'Transfer responsibility for the failure to the hosting provider'
    ),
    correct: ['a'],
    explanation: 'Exercises exist to surface exactly this kind of gap, and the value is realized only when a corrective action is made and verified in a later test. Recording without acting leaves the gap live, cancelling exercises removes the mechanism that found it, and the roster is the organization\'s own to maintain.',
    references: [REF_NIST_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best describes the relationship between an event and an incident?',
    options: opts4(
      'Every incident is an event, but most events are not incidents',
      'Every event is an incident once it has been logged by a system',
      'Events occur on hosts while incidents occur only on networks',
      'Incidents are detected automatically while events require human review'
    ),
    correct: ['a'],
    explanation: 'An event is any observable occurrence, and an incident is the subset that adversely affects or threatens security, so the relationship is one of containment. Logging alone does not elevate an event, the distinction is not about location, and both may involve automation or human judgement.',
    references: [REF_NIST_61]
  },

  // ───────────── Reporting and Communication (10) ─────────────
  {
    domain: REPORT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of an after-action report following a significant incident?',
    options: opts4(
      'To record what happened, what was done, and what should change',
      'To assign individual responsibility for the failures that occurred',
      'To provide the legal team with a privileged litigation strategy',
      'To list every alert the SIEM generated during the incident window'
    ),
    correct: ['a'],
    explanation: 'The after-action report captures the narrative, the response, and the improvements to carry forward, which is what makes the organization better prepared. Blame suppresses candour, legal strategy is counsel\'s work product, and an exhaustive alert dump is raw material rather than a report.',
    references: [REF_NIST_61]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.SINGLE,
    stem: 'A vulnerability scan report is being prepared for the server engineering team who will perform the remediation. What should it emphasize?',
    options: opts4(
      'Affected hosts, specific fixes required, and the order to apply them',
      'Aggregate risk trends across the organization over the past year',
      'The financial impact of a breach expressed as an annualized figure',
      'A summary of the security programme\'s budget and staffing levels'
    ),
    correct: ['a'],
    explanation: 'Reporting is tailored to the audience, and engineers need actionable specifics: which systems, which fix, in which order. Trends, financial modelling, and programme resourcing are executive-audience content.',
    references: [REF_NIST_40, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which content belongs in the executive summary of an incident report?',
    options: opts4(
      'Business impact, current status, and the decisions being requested',
      'The full list of indicators of compromise recovered during analysis',
      'Command-line output captured from each of the affected hosts',
      'The detection rule logic that generated the initial alert'
    ),
    correct: ['a'],
    explanation: 'Executives need to understand consequence, where things stand, and what they must decide or authorize. Indicators, host output, and rule logic are technical detail for responders and belong in the body or appendices.',
    references: [REF_NIST_61]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.MULTI,
    stem: 'Which parties are typically identified as stakeholders in an incident communication plan? (Choose three.)',
    options: opts4(
      'Regulatory reporting agencies with jurisdiction over the affected data',
      'Affected customers whose personal information may have been exposed',
      'Law enforcement, where criminal activity is suspected and reportable',
      'Competitors operating in the same market as the affected organization'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Communication plans name regulators, customers, law enforcement, legal, public relations, and internal leadership as the parties who may need to be told and by whom. Competitors have no role in incident communication.',
    references: [REF_NIST_61, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 4, type: QType.SINGLE,
    stem: 'A programme reports mean time to remediate of 47 days for critical findings, against a 30-day target, while mean time to detect has improved. What does this combination indicate?',
    options: opts4(
      'Detection is outpacing the capacity to fix what is found',
      'The vulnerability scanning configuration is producing invalid results',
      'The detection improvement caused the remediation delay directly',
      'Both metrics are within target and require no management attention'
    ),
    correct: ['a'],
    explanation: 'Finding problems faster while fixing them slower than committed points at a remediation bottleneck — resourcing, change windows, or ownership — and that is the conversation the report should prompt. Faster detection does not cause slower remediation, the data is not invalid, and one metric is plainly outside target.',
    references: [REF_NIST_40, REF_NIST_137]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.SINGLE,
    stem: 'A simulated phishing campaign reports a click rate of 18%, down from 31% six months earlier. How should this metric be used?',
    options: opts4(
      'As a measure of awareness programme effectiveness guiding further training',
      'As proof that the organization can no longer be compromised by phishing',
      'As grounds for disciplinary action against every employee who clicked',
      'As a replacement for technical email filtering and detection controls'
    ),
    correct: ['a'],
    explanation: 'Click rate tracks the direction of awareness over time and shows where training should focus next. A material share still click, punishment discourages the reporting that shortens response time, and awareness supplements rather than replaces technical controls.',
    references: [REF_OBJ, REF_NIST_53]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'A rising true-positive rate alongside a falling false-positive rate indicates that detection engineering and tuning work is having the intended effect.',
    options: optsTF(),
    correct: ['a'],
    explanation: 'True. Together the two rates describe signal quality: a greater share of alerts reflecting genuine activity while fewer are noise is precisely the outcome tuning aims for. Either metric alone can mislead, which is why they are reported as a pair.',
    references: [REF_NIST_137, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does an organization brief staff on which channels to use for reporting suspected security issues?',
    options: opts4(
      'Clear reporting channels shorten the time between suspicion and response',
      'It transfers responsibility for detection from the SOC to end users',
      'It satisfies the requirement to encrypt all internal communications',
      'It removes the need for automated detection controls on endpoints and email gateways'
    ),
    correct: ['a'],
    explanation: 'Operational security awareness makes reporting fast and unambiguous, and users often observe things no sensor catches. It supplements rather than transfers detection responsibility, is unrelated to encryption requirements, and does not displace automated controls.',
    references: [REF_NIST_53, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which pairing correctly matches an incident response metric to what it measures?',
    options: opts4(
      'Mean time to close — the interval from declaration to formal closure',
      'Mean time to detect — the interval from containment to eradication',
      'Mean time to respond — the interval from closure to lessons learned',
      'Alert volume — the proportion of alerts that prove to be genuine'
    ),
    correct: ['a'],
    explanation: 'Mean time to close measures the full lifespan of the case from declaration to closure. MTTD measures how long activity ran before detection, MTTR measures detection to response action, and alert volume is a raw count — the genuine proportion is the true-positive rate.',
    references: [REF_NIST_61, REF_OBJ]
  },
  {
    domain: REPORT, difficulty: 4, type: QType.SINGLE,
    stem: 'Six weeks after an incident closes, none of the agreed corrective actions have been implemented. What does this most directly indicate about the reporting process?',
    options: opts4(
      'Lessons learned are not being tracked to completion with named owners',
      'The root cause analysis must have identified the wrong underlying cause',
      'The incident was declared at too high a severity for its actual impact',
      'The after-action report contained too much technical detail to act on'
    ),
    correct: ['a'],
    explanation: 'Improvements only materialize when actions carry owners, dates, and follow-up in a tracked register, so stalled remediation points at the tracking mechanism. A wrong root cause would produce ineffective rather than unstarted actions, and severity and report length do not explain inaction.',
    references: [REF_NIST_61]
  }
];
