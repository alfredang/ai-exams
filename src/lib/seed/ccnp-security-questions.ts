/**
 * Cisco CCNP Security (SCOR 350-701) bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:ccnp-security-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedCcnpSecurity(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/ccnp-security.ts`) and the
 * protected admin API (`/api/admin/seed-ccnp-security`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the public Cisco SCOR 350-701
 * exam topics and Cisco security product documentation (ISE, Firepower/
 * FTD, Umbrella, ESA/WSA, AnyConnect, Stealthwatch). It is NOT a
 * braindump and never claims to be the real certification exam. Domain
 * blueprint (sum 100):
 *   - Security Concepts                                            — 25% (16/variant)
 *   - Network Security                                             — 20% (13/variant)
 *   - Securing the Cloud                                           — 15% (10/variant)
 *   - Content Security                                             — 15% (10/variant)
 *   - Endpoint Protection and Detection                            — 10% (7/variant)
 *   - Secure Network Access, Visibility, and Enforcement           — 15% (9/variant)
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

const CONCEPTS = 'Security Concepts';
const NETSEC = 'Network Security';
const CLOUD = 'Securing the Cloud';
const CONTENT = 'Content Security';
const ENDPOINT = 'Endpoint Protection and Detection';
const ACCESS = 'Secure Network Access, Visibility, and Enforcement';

const REF_SCOR = { label: 'Cisco — 350-701 SCOR Exam Topics', url: 'https://learningnetwork.cisco.com/s/scor-exam-topics' };
const REF_ISE = { label: 'Cisco — Identity Services Engine (ISE)', url: 'https://www.cisco.com/c/en/us/products/security/identity-services-engine/index.html' };
const REF_ISE_ADMIN = { label: 'Cisco ISE Administrator Guide', url: 'https://www.cisco.com/c/en/us/td/docs/security/ise/3-1/admin_guide/b_ise_admin_3_1.html' };
const REF_FTD = { label: 'Cisco Secure Firewall (FTD) Configuration Guide', url: 'https://www.cisco.com/c/en/us/td/docs/security/firepower/70/configuration/guide/fpmc-config-guide-v70.html' };
const REF_FW = { label: 'Cisco — Secure Firewall', url: 'https://www.cisco.com/c/en/us/products/security/firewalls/index.html' };
const REF_UMBRELLA = { label: 'Cisco Umbrella Documentation', url: 'https://docs.umbrella.com/' };
const REF_ESA = { label: 'Cisco Secure Email Gateway (ESA) User Guide', url: 'https://www.cisco.com/c/en/us/support/security/email-security-appliance/series.html' };
const REF_WSA = { label: 'Cisco Secure Web Appliance (WSA) User Guide', url: 'https://www.cisco.com/c/en/us/support/security/web-security-appliance/series.html' };
const REF_ANYCONNECT = { label: 'Cisco Secure Client (AnyConnect) Admin Guide', url: 'https://www.cisco.com/c/en/us/support/security/anyconnect-secure-mobility-client/series.html' };
const REF_STEALTHWATCH = { label: 'Cisco Secure Network Analytics (Stealthwatch)', url: 'https://www.cisco.com/c/en/us/products/security/stealthwatch/index.html' };
const REF_AMP = { label: 'Cisco Secure Endpoint (AMP for Endpoints)', url: 'https://www.cisco.com/c/en/us/products/security/amp-for-endpoints/index.html' };
const REF_DUO = { label: 'Cisco Duo — MFA Documentation', url: 'https://duo.com/docs' };
const REF_TALOS = { label: 'Cisco Talos Intelligence', url: 'https://talosintelligence.com/' };
const REF_VPN = { label: 'Cisco — Site-to-Site and Remote Access VPN', url: 'https://www.cisco.com/c/en/us/products/security/vpn-endpoint-security-clients/index.html' };
const REF_NETFLOW = { label: 'Cisco IOS NetFlow', url: 'https://www.cisco.com/c/en/us/products/ios-nx-os-software/ios-netflow/index.html' };
const REF_TRUSTSEC = { label: 'Cisco TrustSec', url: 'https://www.cisco.com/c/en/us/solutions/enterprise-networks/trustsec/index.html' };
const REF_8021X = { label: 'Cisco — IEEE 802.1X Authentication', url: 'https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-3/configuration_guide/sec/b_173_sec_9300_cg/configuring_ieee_802_1x_port_based_authentication.html' };
const REF_SDA = { label: 'Cisco SD-Access Solution', url: 'https://www.cisco.com/c/en/us/solutions/enterprise-networks/software-defined-access/index.html' };
const REF_SECCLOUD = { label: 'Cisco — Cloud Security', url: 'https://www.cisco.com/c/en/us/products/security/cloud-security/index.html' };
const REF_CASB = { label: 'Cisco Cloudlock (CASB)', url: 'https://www.cisco.com/c/en/us/products/security/cloudlock/index.html' };
const REF_TETRATION = { label: 'Cisco Secure Workload (Tetration)', url: 'https://www.cisco.com/c/en/us/products/security/secure-workload/index.html' };
const REF_OWASP = { label: 'OWASP — API Security & Web Risks', url: 'https://owasp.org/www-project-top-ten/' };
const REF_DEVNET = { label: 'Cisco DevNet — Security APIs', url: 'https://developer.cisco.com/security/' };
const REF_PXGRID = { label: 'Cisco Platform Exchange Grid (pxGrid)', url: 'https://developer.cisco.com/docs/pxgrid/' };
const REF_THREATGRID = { label: 'Cisco Secure Malware Analytics (Threat Grid)', url: 'https://www.cisco.com/c/en/us/products/security/threat-grid/index.html' };
const REF_POSTURE = { label: 'Cisco ISE — Posture Services', url: 'https://www.cisco.com/c/en/us/support/docs/security/identity-services-engine/216510-ise-posture-over-anyconnect-remote-acce.html' };
const REF_MAB = { label: 'Cisco — MAC Authentication Bypass', url: 'https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-3/configuration_guide/sec/b_173_sec_9300_cg/mac_authentication_bypass.html' };

// Helper to build 4-option questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Security Concepts (16) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A security architect is documenting threats for a new web application. Which option best describes the difference between a vulnerability and an exploit?',
    options: opts4(
      'A vulnerability is the malicious code; an exploit is the unpatched flaw.',
      'A vulnerability is a weakness in a system; an exploit is the technique or code that takes advantage of that weakness.',
      'They are interchangeable terms for the same concept.',
      'A vulnerability only exists after an exploit has been written.'
    ),
    correct: ['b'],
    explanation: 'A vulnerability is an inherent weakness or flaw (e.g., a missing patch or misconfiguration). An exploit is the specific method, tool, or code that leverages that weakness to cause an impact. The two are distinct stages of risk.',
    references: [REF_SCOR, REF_TALOS]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An attacker intercepts traffic between a client and server, relaying and possibly altering messages while both endpoints believe they communicate directly. Which attack is this?',
    options: opts4(
      'Distributed denial-of-service (DDoS)',
      'On-path (man-in-the-middle) attack',
      'SQL injection',
      'Password spraying'
    ),
    correct: ['b'],
    explanation: 'An on-path (man-in-the-middle) attack positions the adversary between two communicating parties to read or modify traffic. Mutual authentication and integrity-protected channels (TLS with certificate validation) mitigate it.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL statements that correctly describe the goals of the CIA triad in information security.',
    options: opts4(
      'Confidentiality ensures information is disclosed only to authorized parties.',
      'Integrity ensures data is not altered in an unauthorized or undetected way.',
      'Availability ensures systems and data are accessible to authorized users when needed.',
      'Accounting is the third pillar of the CIA triad.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The CIA triad is Confidentiality, Integrity, and Availability. Accounting (the second A in AAA) is not part of the CIA triad — it relates to auditing/logging of authenticated and authorized activity.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which cryptographic primitive provides data integrity and authenticity by combining a shared secret key with a hash function?',
    options: opts4(
      'AES-CBC',
      'HMAC (Hash-based Message Authentication Code)',
      'RSA encryption',
      'Diffie-Hellman'
    ),
    correct: ['b'],
    explanation: 'HMAC combines a cryptographic hash (e.g., SHA-256) with a shared secret key to produce a keyed message authentication code, providing integrity and authenticity. AES provides confidentiality; RSA provides asymmetric encryption/signatures; Diffie-Hellman is key exchange.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'During an IKEv2 negotiation, which protocol enables two peers to establish a shared secret over an insecure channel without transmitting the secret itself?',
    options: opts4(
      'SHA-512',
      'Diffie-Hellman key exchange',
      'MD5',
      'Base64 encoding'
    ),
    correct: ['b'],
    explanation: 'Diffie-Hellman allows two parties to derive a shared secret over an untrusted medium without sending the secret. IKEv2 uses DH groups to establish keying material for the IPsec SA. Hashes and encoding do not perform key agreement.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC analyst classifies an alert where a legitimate user is blocked because the IPS mistakenly flagged normal traffic as malicious. What is this called?',
    options: opts4(
      'True positive',
      'False positive',
      'True negative',
      'False negative'
    ),
    correct: ['b'],
    explanation: 'A false positive is benign activity incorrectly identified as malicious. A false negative is malicious activity missed by the control. Tuning IPS signatures reduces false positives without raising false negatives.',
    references: [REF_FTD, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In a digital signature scheme, the sender signs a message digest with their private key, and recipients verify it using the sender\'s public key.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The sender hashes the message and encrypts (signs) the digest with their private key. Anyone with the sender\'s public key can verify the signature, providing authenticity, integrity, and non-repudiation.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which attack technique floods a CAM table on a switch so that the switch begins flooding frames out all ports, enabling traffic sniffing?',
    options: opts4(
      'VLAN hopping',
      'MAC address table (CAM) overflow attack',
      'DHCP starvation',
      'ARP poisoning'
    ),
    correct: ['b'],
    explanation: 'A MAC flooding (CAM overflow) attack exhausts the switch MAC table, forcing it to flood frames like a hub so an attacker can capture traffic. Port security limiting learned MACs mitigates it.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which term describes the principle of granting a user or process only the minimum permissions required to perform its function?',
    options: opts4(
      'Defense in depth',
      'Least privilege',
      'Separation of duties',
      'Implicit trust'
    ),
    correct: ['b'],
    explanation: 'Least privilege limits access to the minimum needed, reducing attack surface and blast radius. Defense in depth is layered controls; separation of duties splits sensitive tasks; implicit trust is the opposite of zero trust.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization adopts a zero-trust model. Which statement best reflects a core zero-trust principle?',
    options: opts4(
      'Devices inside the corporate perimeter are inherently trusted.',
      'Never trust, always verify — authenticate and authorize every access request regardless of network location.',
      'A VPN connection alone is sufficient to grant full network access.',
      'Trust is granted permanently after the first successful login.'
    ),
    correct: ['b'],
    explanation: 'Zero trust removes implicit network-location trust. Every request is continuously authenticated, authorized, and validated (identity, device posture, context) before access is granted, ideally with least privilege and micro-segmentation.',
    references: [REF_SCOR, REF_DUO]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which IPsec component provides confidentiality, integrity, and authentication for the entire IP payload, and is the protocol typically used in modern VPNs?',
    options: opts4(
      'Authentication Header (AH)',
      'Encapsulating Security Payload (ESP)',
      'GRE',
      'L2TP'
    ),
    correct: ['b'],
    explanation: 'ESP encrypts and optionally authenticates the payload, providing confidentiality plus integrity. AH provides integrity/authentication only (no encryption) and is incompatible with NAT in many cases. GRE and L2TP are tunneling, not IPsec security services.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'A penetration tester sends crafted input that breaks out of an application\'s data context to run arbitrary database commands. Which OWASP-class vulnerability is being exploited?',
    options: opts4(
      'Cross-site scripting (XSS)',
      'Injection (e.g., SQL injection)',
      'Security misconfiguration',
      'Broken access control'
    ),
    correct: ['b'],
    explanation: 'Injection occurs when untrusted input is interpreted as a command/query. SQL injection manipulates database queries. Parameterized queries and input validation are the primary mitigations.',
    references: [REF_OWASP, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which type of malware encrypts a victim\'s files and demands payment for the decryption key?',
    options: opts4(
      'Rootkit',
      'Ransomware',
      'Adware',
      'Logic bomb'
    ),
    correct: ['b'],
    explanation: 'Ransomware encrypts data and extorts payment. Backups, segmentation, and endpoint detection (Cisco Secure Endpoint) limit impact. A rootkit hides presence; adware shows ads; a logic bomb triggers on conditions.',
    references: [REF_AMP, REF_TALOS]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'In a Public Key Infrastructure (PKI), which entity issues and digitally signs end-entity certificates?',
    options: opts4(
      'Registration Authority (RA)',
      'Certificate Authority (CA)',
      'Online Certificate Status Protocol (OCSP) responder',
      'Key Distribution Center (KDC)'
    ),
    correct: ['b'],
    explanation: 'The CA issues and signs certificates binding identities to public keys. The RA verifies identity before issuance, the OCSP responder reports revocation status, and a KDC is a Kerberos component.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker registers a domain visually similar to a bank and sends emails to lure users into entering credentials. Which attack category is this?',
    options: opts4(
      'Privilege escalation',
      'Phishing (social engineering)',
      'Buffer overflow',
      'Session fixation'
    ),
    correct: ['b'],
    explanation: 'Phishing is social engineering that tricks users into disclosing credentials or running malware. Email security (Cisco Secure Email) and DNS-layer security (Umbrella) plus user awareness reduce exposure.',
    references: [REF_ESA, REF_UMBRELLA]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes symmetric from asymmetric cryptography in a VPN context?',
    options: opts4(
      'Symmetric algorithms use a public/private key pair; asymmetric algorithms use one shared key.',
      'Asymmetric crypto is typically used for key exchange and authentication; symmetric crypto (e.g., AES) encrypts the bulk data because it is faster.',
      'Symmetric crypto cannot provide confidentiality.',
      'Asymmetric crypto is always faster than symmetric crypto.'
    ),
    correct: ['b'],
    explanation: 'Asymmetric algorithms (RSA/ECDSA, DH) handle authentication and key establishment; the negotiated symmetric key (AES) then encrypts bulk traffic because symmetric ciphers are far faster for large data.',
    references: [REF_VPN, REF_SCOR]
  },

  // ── Network Security (13) ──
  {
    domain: NETSEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'On a Cisco Secure Firewall (FTD), which policy element is evaluated to permit or deny traffic based on zones, networks, applications, and users?',
    options: opts4(
      'Platform Settings policy',
      'Access Control Policy',
      'NAT policy',
      'Health policy'
    ),
    correct: ['b'],
    explanation: 'The Access Control Policy is the primary rule set on FTD that matches traffic by zone, network, port, application, URL, and user, then applies an action (allow, block, trust) with optional IPS/file inspection.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A firewall must allow return traffic for sessions initiated by inside hosts without an explicit inbound rule. Which firewall capability provides this?',
    options: opts4(
      'Static packet filtering',
      'Stateful inspection',
      'Proxy ARP',
      'Port mirroring'
    ),
    correct: ['b'],
    explanation: 'Stateful inspection tracks connection state in a session table and automatically permits return traffic that matches an established flow, removing the need for explicit reverse rules.',
    references: [REF_FW, REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco FTD feature decrypts TLS traffic so the IPS and malware engines can inspect otherwise-encrypted payloads?',
    options: opts4(
      'Prefilter policy',
      'SSL/TLS decryption policy',
      'QoS policy',
      'Identity policy'
    ),
    correct: ['b'],
    explanation: 'The SSL/TLS decryption policy lets FTD decrypt-resign or decrypt-known-key flows so the access control, IPS, and file/malware inspection engines can examine encrypted content, then re-encrypt before forwarding.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A next-generation IPS (NGIPS) can identify and block attacks based on application-layer signatures and contextual awareness, not just port/protocol.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. NGIPS (such as Cisco Firepower/FTD with Snort) uses deep packet inspection, application identification, reputation, and contextual data (host/user) rather than only port-based rules.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which command-line tool on Cisco IOS configures an extended ACL to permit TCP from any source to host 10.1.1.10 on port 443 only?',
    options: opts4(
      'access-list 10 permit tcp any host 10.1.1.10 eq 443',
      'access-list 110 permit tcp any host 10.1.1.10 eq 443',
      'access-list 110 permit ip any host 10.1.1.10 eq 443',
      'access-list 1 permit tcp any host 10.1.1.10 eq www'
    ),
    correct: ['b'],
    explanation: 'Extended ACLs use numbers 100–199 (and 2000–2699) and match protocol, source, destination, and ports. `access-list 110 permit tcp any host 10.1.1.10 eq 443` is the correct extended syntax; 1–99 are standard ACLs and cannot match ports.',
    references: [REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A site-to-site IPsec tunnel is up but no traffic passes. Which configuration element most likely defines which traffic should be encrypted?',
    options: opts4(
      'The ISAKMP policy lifetime',
      'The crypto ACL / interesting traffic match',
      'The router hostname',
      'The NTP server address'
    ),
    correct: ['b'],
    explanation: 'The crypto ACL (interesting-traffic match) defines which flows are protected and trigger/maintain the IPsec SA. Mismatched proxy IDs/crypto ACLs between peers are a common cause of a tunnel that comes up but passes no data.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco solution provides clientless and full-tunnel remote-access VPN terminating on Secure Firewall ASA or FTD?',
    options: opts4(
      'Cisco DMVPN',
      'Cisco Secure Client (AnyConnect) SSL/IPsec VPN',
      'Cisco GET VPN',
      'Cisco FlexVPN spoke-to-spoke only'
    ),
    correct: ['b'],
    explanation: 'Cisco Secure Client (AnyConnect) provides remote-access VPN (SSL/TLS or IKEv2/IPsec) and a clientless web portal, terminating on ASA or FTD headends. DMVPN/GET VPN/FlexVPN are site-to-site technologies.',
    references: [REF_ANYCONNECT, REF_VPN]
  },
  {
    domain: NETSEC, difficulty: 4, type: QType.SINGLE,
    stem: 'In an IKEv2 remote-access design, which feature lets the headend push split-tunnel routes and DNS to the Secure Client endpoint?',
    options: opts4(
      'IKEv2 configuration payload (mode-config)',
      'BGP route reflection',
      'PortFast',
      'HSRP'
    ),
    correct: ['a'],
    explanation: 'The IKEv2 configuration payload (mode-config) delivers client attributes — assigned IP, DNS, split-tunnel networks, and policies — from the VPN headend to the Secure Client endpoint during negotiation.',
    references: [REF_ANYCONNECT, REF_VPN]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control prevents a rogue device from spoofing the default gateway by validating DHCP-learned IP-to-MAC bindings on switch ports?',
    options: opts4(
      'BPDU Guard',
      'Dynamic ARP Inspection (DAI) with DHCP snooping',
      'UDLD',
      'Storm control'
    ),
    correct: ['b'],
    explanation: 'DHCP snooping builds a trusted binding table; Dynamic ARP Inspection uses that table to drop ARP packets with invalid IP/MAC mappings, preventing ARP-spoofing/gateway impersonation.',
    references: [REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'On Cisco FTD, which inline action allows traffic but generates an event and continues inspection, useful for tuning before enforcing a block?',
    options: opts4(
      'Block with reset',
      'Monitor',
      'Trust',
      'Interactive Block'
    ),
    correct: ['b'],
    explanation: 'The Monitor action logs and continues evaluating subsequent rules without dropping traffic — ideal for visibility and tuning. Trust skips deeper inspection; Block actions drop traffic.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which deployment mode lets Cisco FTD inspect traffic without being in the forwarding path, by receiving a copy via SPAN/TAP?',
    options: opts4(
      'Routed mode',
      'Passive (IPS-only) mode',
      'Transparent firewall mode',
      'Inline tap with bypass'
    ),
    correct: ['b'],
    explanation: 'Passive mode connects FTD to a SPAN/TAP and analyzes copied traffic for detection only; it cannot drop packets. Routed/transparent are inline forwarding modes; inline tap is inline but in fail-open analysis.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A DMVPN hub-and-spoke design needs dynamic spoke-to-spoke tunnels. Which protocol provides the multipoint GRE next-hop resolution?',
    options: opts4(
      'NHRP (Next Hop Resolution Protocol)',
      'LACP',
      'VRRP',
      'STP'
    ),
    correct: ['a'],
    explanation: 'DMVPN uses mGRE plus NHRP so spokes register with the hub and resolve other spokes\' tunnel/NBMA addresses to build dynamic, on-demand spoke-to-spoke IPsec tunnels.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid reasons to deploy a firewall in transparent (Layer 2) mode.',
    options: opts4(
      'Insert the firewall without re-IP-addressing the network.',
      'Bridge two interfaces in the same subnet while still applying security policy.',
      'Provide dynamic routing as the primary network router.',
      'Make the firewall a bump-in-the-wire that is hard to detect at Layer 3.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Transparent mode bridges interfaces in the same subnet, requires no re-addressing, and is largely invisible at Layer 3 while still enforcing policy. Acting as the primary dynamic router is a routed-mode role, not transparent mode.',
    references: [REF_FTD, REF_FW]
  },

  // ── Securing the Cloud (10) ──
  {
    domain: CLOUD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Under the cloud shared responsibility model for IaaS, which task is generally the customer\'s responsibility?',
    options: opts4(
      'Physical security of the data center',
      'Patching the guest operating system and securing applications/data',
      'Maintaining the hypervisor',
      'Securing the cloud provider\'s network backbone'
    ),
    correct: ['b'],
    explanation: 'In IaaS the provider secures the physical facility, hypervisor, and backbone; the customer secures the guest OS, applications, data, IAM, and network configuration they control.',
    references: [REF_SECCLOUD, REF_SCOR]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco product is a cloud access security broker (CASB) that discovers shadow IT and enforces data security policies for SaaS apps?',
    options: opts4(
      'Cisco Umbrella DNS only',
      'Cisco Cloudlock',
      'Cisco Stealthwatch',
      'Cisco ISE'
    ),
    correct: ['b'],
    explanation: 'Cisco Cloudlock is an API-based CASB that provides visibility and control over users, data, and apps in cloud/SaaS environments, including DLP and OAuth app risk. Umbrella adds DNS/SWG cloud-edge security but is not the CASB.',
    references: [REF_CASB, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants micro-segmentation and workload behavior baselining across on-prem and cloud data centers. Which Cisco product fits best?',
    options: opts4(
      'Cisco Secure Workload (Tetration)',
      'Cisco Secure Email Gateway',
      'Cisco DUO',
      'Cisco WSA'
    ),
    correct: ['a'],
    explanation: 'Cisco Secure Workload (Tetration) maps application dependencies, baselines workload behavior, and generates/enforces micro-segmentation policy across multicloud and on-prem environments.',
    references: [REF_TETRATION, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Securing CI/CD pipelines by scanning container images and Infrastructure-as-Code for vulnerabilities is part of a DevSecOps approach.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. DevSecOps integrates security into the development lifecycle — scanning images, dependencies, and IaC templates in the pipeline so vulnerabilities are caught before deployment.',
    references: [REF_SCOR, REF_DEVNET]
  },
  {
    domain: CLOUD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which cloud service model places the most security responsibility on the provider and the least on the customer?',
    options: opts4(
      'IaaS',
      'SaaS',
      'PaaS',
      'On-premises'
    ),
    correct: ['b'],
    explanation: 'In SaaS the provider manages the application, runtime, OS, and infrastructure; the customer mainly manages data, user access, and configuration. IaaS shifts the most responsibility to the customer.',
    references: [REF_SECCLOUD, REF_SCOR]
  },
  {
    domain: CLOUD, difficulty: 4, type: QType.SINGLE,
    stem: 'An API gateway should reject requests that present an expired or tampered bearer token. Which mechanism validates token authenticity and expiration?',
    options: opts4(
      'Round-robin load balancing',
      'JWT signature and claims (exp/iat) validation',
      'TCP keepalive',
      'DNS round robin'
    ),
    correct: ['b'],
    explanation: 'JSON Web Tokens are validated by verifying the signature against the issuer key and checking claims such as exp (expiry) and aud/iss. This detects tampering and rejects expired tokens at the API gateway.',
    references: [REF_OWASP, REF_DEVNET]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco Umbrella capability secures roaming users by enforcing security policy at the DNS layer before a connection is established?',
    options: opts4(
      'Cisco Umbrella DNS-layer security',
      'Cisco ISE posture',
      'Cisco Secure Endpoint engine',
      'Cisco TrustSec SGT'
    ),
    correct: ['a'],
    explanation: 'Umbrella resolves DNS in the cloud and blocks requests to malicious or policy-violating domains before an IP connection is made, protecting on- and off-network users including roaming laptops.',
    references: [REF_UMBRELLA, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'A misconfigured cloud storage bucket is publicly readable. Which control category would have prevented the exposure?',
    options: opts4(
      'Cloud security posture management (CSPM) / configuration auditing',
      'Layer 2 port security',
      'STP root guard',
      'NetFlow export'
    ),
    correct: ['a'],
    explanation: 'CSPM continuously audits cloud configurations against best practices and flags risky settings such as world-readable storage, enabling remediation before data is exposed.',
    references: [REF_SECCLOUD, REF_SCOR]
  },
  {
    domain: CLOUD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which authentication framework is commonly used to delegate access to cloud APIs without sharing user credentials with third-party apps?',
    options: opts4(
      'RADIUS',
      'OAuth 2.0',
      'TACACS+',
      'NTLM'
    ),
    correct: ['b'],
    explanation: 'OAuth 2.0 issues scoped access tokens so a third-party app can act on a resource on the user\'s behalf without ever receiving the user\'s password. RADIUS/TACACS+ are network AAA; NTLM is legacy Windows auth.',
    references: [REF_DEVNET, REF_SCOR]
  },
  {
    domain: CLOUD, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization extends its security perimeter to remote users using a cloud-delivered Secure Internet Gateway (SIG). Which Cisco offering provides DNS, SWG, CASB, and FWaaS as a converged cloud edge?',
    options: opts4(
      'Cisco Umbrella SIG',
      'Cisco ASA 5505',
      'Cisco Catalyst 9300',
      'Cisco Prime Infrastructure'
    ),
    correct: ['a'],
    explanation: 'Cisco Umbrella Secure Internet Gateway converges DNS-layer security, secure web gateway, cloud-delivered firewall, and CASB functionality into a single cloud edge for distributed/remote users — a SASE building block.',
    references: [REF_UMBRELLA, REF_SECCLOUD]
  },

  // ── Content Security (10) ──
  {
    domain: CONTENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'On the Cisco Secure Email Gateway (ESA), which pipeline component evaluates inbound messages against spam, reputation, and content rules?',
    options: opts4(
      'Listener with incoming mail policies (anti-spam/anti-virus/content filters)',
      'The RAID controller',
      'The DHCP relay',
      'The SNMP agent'
    ),
    correct: ['a'],
    explanation: 'On the ESA, listeners receive mail and apply mail-flow and incoming mail policies — sender reputation (SBRS), anti-spam, anti-virus, content/outbreak filters — before delivery or quarantine.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco ESA feature uses SPF, DKIM, and DMARC to reduce spoofed/forged sender email?',
    options: opts4(
      'Outbreak Filters',
      'Sender authentication / email authentication checks',
      'Bounce Verification',
      'Centralized Quarantine'
    ),
    correct: ['b'],
    explanation: 'ESA email authentication verifies SPF (authorized sending IPs), DKIM (cryptographic signature), and DMARC (alignment/policy) to detect and act on spoofed messages, reducing phishing/BEC.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'On the Cisco Secure Web Appliance (WSA), which deployment mode requires PAC files or browser/proxy settings rather than WCCP/PBR redirection?',
    options: opts4(
      'Transparent mode',
      'Explicit forward proxy mode',
      'Passive tap mode',
      'Inline IPS mode'
    ),
    correct: ['b'],
    explanation: 'In explicit forward proxy mode, clients are configured (PAC file, WPAD, or manual proxy settings) to send traffic to the WSA. Transparent mode relies on WCCP or policy-based routing to redirect traffic without client config.',
    references: [REF_WSA]
  },
  {
    domain: CONTENT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: The Cisco WSA can apply URL category filtering and reputation scoring to block access to malicious or non-business websites.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The WSA uses URL categorization, Talos web reputation, and application visibility/control to allow, warn, or block requests based on category, reputation, and policy.',
    references: [REF_WSA, REF_TALOS]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A security team wants outbound email scanned to prevent credit card numbers from leaving the organization. Which ESA capability addresses this?',
    options: opts4(
      'Data Loss Prevention (DLP) policies',
      'Anti-spam scanning',
      'Graymail safe unsubscribe',
      'LDAP accept queries'
    ),
    correct: ['a'],
    explanation: 'ESA outbound DLP policies inspect message content for sensitive data patterns (PCI, PII, custom dictionaries) and can quarantine, encrypt, or block messages that violate policy.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco service detonates suspicious files in a sandbox to determine malicious behavior, integrating with ESA/WSA/FTD?',
    options: opts4(
      'Cisco Secure Malware Analytics (Threat Grid)',
      'Cisco Prime',
      'Cisco DNA Center',
      'Cisco Meraki Dashboard'
    ),
    correct: ['a'],
    explanation: 'Cisco Secure Malware Analytics (Threat Grid) performs dynamic file analysis (sandboxing) and threat intelligence, feeding verdicts to ESA, WSA, FTD, and Secure Endpoint for blocking and retrospection.',
    references: [REF_THREATGRID, REF_AMP]
  },
  {
    domain: CONTENT, difficulty: 4, type: QType.SINGLE,
    stem: 'On the WSA, HTTPS inspection is enabled but users get certificate errors for all sites. What is the most likely cause?',
    options: opts4(
      'The WSA is in passive mode.',
      'The WSA decryption root certificate is not trusted by client browsers.',
      'DNS is unreachable.',
      'NTP is misconfigured on clients only.'
    ),
    correct: ['b'],
    explanation: 'For HTTPS decryption the WSA re-signs server certificates with its own root CA. Clients must trust that root (pushed via GPO/MDM); otherwise every decrypted site shows a certificate warning.',
    references: [REF_WSA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ESA mechanism throttles or blocks connections from senders with poor reputation before message acceptance?',
    options: opts4(
      'Host Access Table (HAT) with sender groups and mail-flow policies',
      'Recipient Access Table (RAT) only',
      'Bounce profile',
      'Destination controls'
    ),
    correct: ['a'],
    explanation: 'The HAT classifies sending hosts into sender groups by reputation (SBRS) and applies mail-flow policies (e.g., THROTTLED, BLOCKED) at the connection/SMTP-conversation stage, before the message is fully accepted.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Cisco component supplies the global threat intelligence (reputation, signatures, IOCs) consumed by ESA, WSA, FTD, and Umbrella?',
    options: opts4(
      'Cisco Talos',
      'Cisco TAC',
      'Cisco CCO',
      'Cisco Feature Navigator'
    ),
    correct: ['a'],
    explanation: 'Cisco Talos is the threat-intelligence organization that produces reputation data, signatures, and indicators of compromise consumed across the Cisco Security portfolio for near-real-time protection.',
    references: [REF_TALOS]
  },
  {
    domain: CONTENT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL Cisco WSA controls that help enforce acceptable-use and protect against web-based threats.',
    options: opts4(
      'URL category and web reputation filtering',
      'Application Visibility and Control (AVC)',
      'Anti-malware scanning (e.g., AMP / file reputation)',
      'BGP route dampening'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The WSA enforces policy via URL categories, web reputation, AVC, and anti-malware/file reputation (AMP). BGP route dampening is an unrelated routing-stability feature, not a content-security control.',
    references: [REF_WSA, REF_TALOS]
  },

  // ── Endpoint Protection and Detection (7) ──
  {
    domain: ENDPOINT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco Secure Endpoint capability lets analysts see the full chain of file activity and "go back in time" after a file is later found malicious?',
    options: opts4(
      'Retrospective security / device trajectory',
      'Spanning Tree Protocol',
      'DHCP snooping',
      'NetFlow v9'
    ),
    correct: ['a'],
    explanation: 'Secure Endpoint continuously records file/process activity. Retrospective security and trajectory views let analysts see where a now-malicious file traveled and remediate, even if it was initially deemed clean.',
    references: [REF_AMP]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary difference between EDR and traditional signature-only antivirus?',
    options: opts4(
      'EDR only scans email attachments.',
      'EDR continuously monitors endpoint behavior, detects/responds to threats, and supports investigation and remediation, beyond static signatures.',
      'EDR cannot quarantine files.',
      'EDR is a network firewall feature.'
    ),
    correct: ['b'],
    explanation: 'Endpoint Detection and Response adds continuous behavioral telemetry, detection, threat hunting, and response/remediation. Signature-only AV detects known malware patterns but lacks the behavioral and investigative depth.',
    references: [REF_AMP]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco Secure Endpoint feature blocks a file from running everywhere in the org once it is identified as malicious on a single host?',
    options: opts4(
      'Outbreak/Simple Custom Detection (file blocklisting by hash)',
      'BPDU Guard',
      'Port security sticky MAC',
      'IKEv2 rekey'
    ),
    correct: ['a'],
    explanation: 'A custom detection / outbreak list adds the malicious file hash to a blocklist, so the cloud-managed connectors quarantine or block that file across all protected endpoints organization-wide.',
    references: [REF_AMP, REF_THREATGRID]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Cisco Secure Endpoint can integrate with Cisco SecureX/XDR to correlate endpoint detections with network and email telemetry for unified investigation.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Secure Endpoint shares telemetry with SecureX/XDR, enabling cross-product correlation (endpoint, network, email, cloud) and orchestrated response from a single console.',
    references: [REF_AMP]
  },
  {
    domain: ENDPOINT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which endpoint hardening practice reduces the attack surface by preventing unauthorized software from executing?',
    options: opts4(
      'Application allow-listing (allow-listing trusted binaries)',
      'Enabling Telnet',
      'Disabling host firewall',
      'Granting all users local admin'
    ),
    correct: ['a'],
    explanation: 'Application allow-listing permits only approved executables to run, blocking unknown/unauthorized binaries (including much malware). The other options weaken endpoint security.',
    references: [REF_AMP, REF_SCOR]
  },
  {
    domain: ENDPOINT, difficulty: 4, type: QType.SINGLE,
    stem: 'A laptop must be checked for required AV, OS patch level, and disk encryption before it is granted full network access. Which combined Cisco capability enforces this?',
    options: opts4(
      'ISE posture assessment with Cisco Secure Client (AnyConnect) posture module',
      'NetFlow sampling',
      'STP PortFast',
      'GLBP'
    ),
    correct: ['a'],
    explanation: 'Cisco ISE posture, using the Secure Client posture module, evaluates endpoint compliance (AV, patches, encryption) and authorizes/quarantines/remediates based on the posture result before granting access.',
    references: [REF_POSTURE, REF_ANYCONNECT]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Secure Endpoint engine uses machine-learning analysis of file features to convict previously unseen malware before execution?',
    options: opts4(
      'Spero/ML-based file analysis',
      'Spanning Tree',
      'PAgP',
      'LLDP-MED'
    ),
    correct: ['a'],
    explanation: 'Secure Endpoint uses machine-learning file analysis (e.g., Spero) plus reputation and behavioral indicators to convict unknown/zero-day samples before or during execution, complementing signature and sandbox verdicts.',
    references: [REF_AMP, REF_THREATGRID]
  },

  // ── Secure Network Access, Visibility, and Enforcement (9) ──
  {
    domain: ACCESS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In an 802.1X deployment, which device role does a Cisco Catalyst switch perform?',
    options: opts4(
      'Supplicant',
      'Authenticator',
      'Authentication server',
      'Certificate authority'
    ),
    correct: ['b'],
    explanation: 'In 802.1X the endpoint is the supplicant, the switch/WLC is the authenticator (relays EAP between supplicant and server), and Cisco ISE acts as the RADIUS authentication server.',
    references: [REF_8021X, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A printer cannot do 802.1X. Which ISE feature authenticates it by its hardware address as a fallback?',
    options: opts4(
      'MAC Authentication Bypass (MAB)',
      'EAP-TLS',
      'PEAP-MSCHAPv2',
      'TACACS+ command authorization'
    ),
    correct: ['a'],
    explanation: 'MAB authenticates non-802.1X-capable devices using their MAC address against ISE (often with profiling), typically as a lower-priority fallback after 802.1X times out.',
    references: [REF_MAB, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which protocol does Cisco ISE use for device administration AAA, providing command-level authorization and full payload encryption?',
    options: opts4(
      'RADIUS',
      'TACACS+',
      'SNMPv2c',
      'NetFlow'
    ),
    correct: ['b'],
    explanation: 'TACACS+ separates authentication, authorization, and accounting and supports per-command authorization with full packet encryption — the standard for device administration. RADIUS is used for network access AAA.',
    references: [REF_ISE_ADMIN, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Cisco TrustSec uses Security Group Tags (SGTs) to enforce policy based on group/role rather than IP address.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. TrustSec classifies traffic with SGTs at ingress and enforces Security Group ACLs (SGACLs) based on source/destination group, decoupling policy from IP addressing and topology.',
    references: [REF_TRUSTSEC, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which Cisco technology shares contextual identity/session information from ISE with other security products (e.g., FTD, Stealthwatch) for adaptive policy?',
    options: opts4(
      'Cisco pxGrid',
      'Cisco CDP',
      'Cisco VTP',
      'Cisco UDLD'
    ),
    correct: ['a'],
    explanation: 'pxGrid is a secure publish/subscribe framework that lets ISE share session, identity, and posture context with ecosystem products (FTD, Stealthwatch, WSA), and lets them request rapid threat containment (e.g., quarantine).',
    references: [REF_PXGRID, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco solution provides network visibility and behavioral threat detection by analyzing NetFlow/telemetry across the enterprise?',
    options: opts4(
      'Cisco Secure Network Analytics (Stealthwatch)',
      'Cisco Prime Infrastructure',
      'Cisco Config Pro',
      'Cisco IP SLA'
    ),
    correct: ['a'],
    explanation: 'Cisco Secure Network Analytics (Stealthwatch) ingests NetFlow and telemetry to baseline normal behavior and detect anomalies such as lateral movement, data exfiltration, and command-and-control.',
    references: [REF_STEALTHWATCH, REF_NETFLOW]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Stealthwatch can detect threats inside encrypted traffic without decryption using which Cisco capability?',
    options: opts4(
      'Encrypted Traffic Analytics (ETA)',
      'SSL offload',
      'IPsec transport mode',
      'MACsec'
    ),
    correct: ['a'],
    explanation: 'Encrypted Traffic Analytics uses metadata such as the initial data packet and sequence of packet lengths/times exported by capable devices, letting Stealthwatch identify malware in encrypted flows without decryption.',
    references: [REF_STEALTHWATCH, REF_NETFLOW]
  },
  {
    domain: ACCESS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which ISE feature dynamically identifies endpoint device type (e.g., IP phone, camera) using attributes like DHCP, CDP/LLDP, and HTTP user-agent?',
    options: opts4(
      'Profiling',
      'Guest sponsor portal',
      'Certificate provisioning',
      'BYOD onboarding only'
    ),
    correct: ['a'],
    explanation: 'ISE profiling collects attributes from probes (RADIUS, DHCP, SNMP, NetFlow, CDP/LLDP, HTTP) to classify endpoint type, which can then drive authorization (e.g., assign a VLAN/SGT for IoT devices).',
    references: [REF_ISE, REF_ISE_ADMIN]
  },
  {
    domain: ACCESS, difficulty: 4, type: QType.SINGLE,
    stem: 'In a Cisco SD-Access fabric, which component is the policy controller that defines group-based access policy enforced via SGTs?',
    options: opts4(
      'Cisco ISE',
      'A standalone TFTP server',
      'A Layer 2 hub',
      'An out-of-band console server'
    ),
    correct: ['a'],
    explanation: 'In SD-Access, Cisco DNA Center provides automation/assurance while Cisco ISE is the policy engine (identity, SGTs, group-based policy). The fabric enforces TrustSec SGT policy derived from ISE.',
    references: [REF_SDA, REF_ISE]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Security Concepts (16) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which AAA component records what an authenticated user did, such as commands executed and session duration?',
    options: opts4(
      'Authentication',
      'Accounting',
      'Authorization',
      'Attestation'
    ),
    correct: ['b'],
    explanation: 'Accounting logs activity (commands, bytes, session times) after authentication and authorization, supporting auditing, billing, and forensics. Authorization decides allowed actions; authentication proves identity.',
    references: [REF_ISE_ADMIN, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An attacker tries one common password against thousands of accounts to avoid lockout thresholds. Which attack is this?',
    options: opts4(
      'Brute-force single-account attack',
      'Password spraying',
      'Pass-the-hash',
      'Rainbow table collision'
    ),
    correct: ['b'],
    explanation: 'Password spraying tries a few common passwords across many accounts to stay under per-account lockout limits. MFA and detecting many failed logins across accounts mitigate it.',
    references: [REF_DUO, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which property of a cryptographic hash function ensures it is computationally infeasible to find two different inputs producing the same digest?',
    options: opts4(
      'Reversibility',
      'Collision resistance',
      'Symmetry',
      'Compressibility'
    ),
    correct: ['b'],
    explanation: 'Collision resistance means it is infeasible to find two distinct inputs with the same hash. Cryptographic hashes are also one-way (pre-image resistant) and deterministic; they are not reversible.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Multi-factor authentication combines factors such as something you know, something you have, and something you are.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. MFA requires two or more independent factor categories (knowledge, possession, inherence), so a single stolen credential is insufficient. Cisco Duo provides MFA for apps and VPN.',
    references: [REF_DUO]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which attack overwhelms a target with traffic from many compromised hosts to exhaust resources and deny service?',
    options: opts4(
      'DDoS (Distributed Denial of Service)',
      'Cross-site request forgery',
      'DNS cache poisoning',
      'Privilege escalation'
    ),
    correct: ['a'],
    explanation: 'A DDoS uses a distributed botnet to saturate bandwidth, connections, or application resources. Rate limiting, scrubbing services, and anycast/CDN architectures help mitigate it.',
    references: [REF_SCOR, REF_TALOS]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which secure protocol replaces Telnet for encrypted device management CLI access?',
    options: opts4(
      'SNMPv1',
      'SSH',
      'TFTP',
      'HTTP'
    ),
    correct: ['b'],
    explanation: 'SSH provides authenticated, encrypted remote CLI access, protecting credentials and session data. Telnet, TFTP, SNMPv1, and HTTP transmit data in clear text and should be avoided for management.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which IKEv2 feature provides forward secrecy so that compromise of a long-term key does not expose previously recorded session data?',
    options: opts4(
      'Aggressive mode',
      'Perfect Forward Secrecy (PFS) via fresh Diffie-Hellman per rekey',
      'Pre-shared key only authentication',
      'Disabling DPD'
    ),
    correct: ['b'],
    explanation: 'PFS performs a new Diffie-Hellman exchange for each key (re)negotiation so session keys are not derived solely from a long-term key; compromising that key does not retroactively decrypt past sessions.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'An adversary exploits a software flaw unknown to the vendor with no available patch. What is this called?',
    options: opts4(
      'Known CVE exploitation',
      'Zero-day attack',
      'Brute force',
      'Credential stuffing'
    ),
    correct: ['b'],
    explanation: 'A zero-day exploits a vulnerability not yet known/patched by the vendor. Behavioral detection, sandboxing, and rapid IOC sharing (Talos) help detect and contain zero-day activity.',
    references: [REF_TALOS, REF_THREATGRID]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which security model concept assumes the network is hostile and enforces strict identity and device verification for every session?',
    options: opts4(
      'Castle-and-moat perimeter trust',
      'Zero trust',
      'Open trust',
      'Transitive trust'
    ),
    correct: ['b'],
    explanation: 'Zero trust treats every request as untrusted regardless of location, verifying identity, device posture, and context continuously before granting least-privilege access.',
    references: [REF_SCOR, REF_DUO]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that improve the security of stored passwords.',
    options: opts4(
      'Salting each password before hashing',
      'Using a slow, adaptive hash (e.g., bcrypt/Argon2/PBKDF2)',
      'Storing passwords in reversible encryption for convenience',
      'Enforcing MFA in addition to password authentication'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Unique salts defeat precomputed/rainbow tables; slow adaptive hashes resist brute force; MFA reduces impact of credential theft. Reversible encryption of passwords is a poor practice — they should be hashed, not decryptable.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which term describes a layered security strategy where multiple independent controls protect an asset so failure of one does not compromise it?',
    options: opts4(
      'Single point of trust',
      'Defense in depth',
      'Security through obscurity',
      'Implicit allow'
    ),
    correct: ['b'],
    explanation: 'Defense in depth deploys overlapping controls (network, host, application, data, identity) so a single control failure does not lead to compromise. Obscurity alone is not a reliable control.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'A web app stores a session token that an attacker tricks the victim\'s browser into submitting to perform an unwanted state-changing action. Which attack is this?',
    options: opts4(
      'Cross-Site Request Forgery (CSRF)',
      'SQL injection',
      'Directory traversal',
      'Clickjacking only'
    ),
    correct: ['a'],
    explanation: 'CSRF abuses the browser\'s automatic credential/cookie submission to perform actions as the authenticated user. Anti-CSRF tokens and SameSite cookies mitigate it.',
    references: [REF_OWASP, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which encryption algorithm is a modern symmetric block cipher recommended for bulk data confidentiality in IPsec/TLS?',
    options: opts4(
      'DES',
      'AES (e.g., AES-256-GCM)',
      'RC4',
      'MD5'
    ),
    correct: ['b'],
    explanation: 'AES (notably AES-GCM) is the recommended symmetric cipher providing strong confidentiality and, in GCM, integrity. DES/RC4 are deprecated/weak; MD5 is a broken hash, not a cipher.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control validates that a downloaded firmware image was not modified and came from the legitimate vendor?',
    options: opts4(
      'A CRC checksum only',
      'A vendor digital signature verified against the vendor public key',
      'Renaming the file',
      'Compressing the file'
    ),
    correct: ['b'],
    explanation: 'A digital signature provides integrity and authenticity: verifying it with the vendor\'s public key proves the image is unaltered and genuinely from the vendor. A plain CRC detects accidental corruption only, not tampering.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which attack manipulates DNS resolver caches so users are redirected to attacker-controlled IP addresses?',
    options: opts4(
      'DNS cache poisoning (spoofing)',
      'ARP flooding',
      'SYN flood',
      'Smurf attack'
    ),
    correct: ['a'],
    explanation: 'DNS cache poisoning injects forged records into a resolver so legitimate names resolve to malicious IPs. DNSSEC and DNS-layer security (Umbrella) help detect/prevent this.',
    references: [REF_UMBRELLA, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which term describes the likelihood and impact of a threat exploiting a vulnerability against an asset?',
    options: opts4(
      'Risk',
      'Patch',
      'Baseline',
      'Token'
    ),
    correct: ['a'],
    explanation: 'Risk is a function of threat, vulnerability, and asset value/impact. Risk management selects controls to reduce risk to an acceptable level (mitigate, transfer, avoid, accept).',
    references: [REF_SCOR]
  },

  // ── Network Security (13) ──
  {
    domain: NETSEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'On Cisco FTD, which object type groups IP addresses/subnets for reuse across access control rules?',
    options: opts4(
      'Network object/object-group',
      'VLAN map',
      'Route map',
      'Class map only'
    ),
    correct: ['a'],
    explanation: 'Network objects and object-groups represent hosts, ranges, or subnets and are reused across access control, NAT, and other policies, simplifying rule management on FTD.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which NAT type on a Cisco firewall maps many inside hosts to a single outside IP using unique port numbers?',
    options: opts4(
      'Static one-to-one NAT',
      'PAT (Port Address Translation / NAT overload)',
      'Identity NAT',
      'NAT exemption'
    ),
    correct: ['b'],
    explanation: 'PAT (overload) multiplexes many internal hosts onto one public IP by tracking unique source ports per flow. Static NAT is one-to-one; identity NAT/NAT exemption avoid translation for specific traffic (e.g., VPN).',
    references: [REF_FTD, REF_FW]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco IOS feature protects the control plane by rate-limiting or filtering traffic destined to the router itself?',
    options: opts4(
      'Control Plane Policing (CoPP)',
      'PortFast',
      'Root Guard',
      'UDLD'
    ),
    correct: ['a'],
    explanation: 'CoPP applies a QoS policy to traffic punted to the route processor, protecting the control plane from DoS and excessive management/protocol traffic by policing or dropping abusive flows.',
    references: [REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A site-to-site IPsec VPN typically uses IKE Phase 1 to build a secure management channel and IKE Phase 2 to negotiate the IPsec SAs that protect data.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. IKE Phase 1 (IKE SA / ISAKMP) authenticates peers and builds a secure channel; Phase 2 (IPsec SA / Quick Mode or IKEv2 child SA) negotiates the parameters that actually protect user traffic.',
    references: [REF_VPN]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco FTD policy is evaluated earliest and can fast-path or block flows before full Snort inspection for performance?',
    options: opts4(
      'Prefilter policy',
      'SSL policy',
      'File policy',
      'Identity policy'
    ),
    correct: ['a'],
    explanation: 'The Prefilter policy runs before the main access control/Snort engine and can fastpath (offload), block, or analyze flows early (e.g., based on tunnels or simple L3/L4), improving performance for trusted/high-volume traffic.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A spoke router must reach the DMVPN hub and learn other spokes dynamically. Which combination is required on the tunnel interface?',
    options: opts4(
      'Point-to-point GRE with static routes only',
      'Multipoint GRE (mGRE) with NHRP and IPsec protection',
      'PPP with CHAP',
      '802.1Q trunking'
    ),
    correct: ['b'],
    explanation: 'DMVPN spokes use mGRE tunnels with NHRP to register/resolve peers and IPsec to protect the GRE traffic, enabling dynamic, on-demand spoke-to-spoke tunnels through the hub.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 4, type: QType.SINGLE,
    stem: 'Which Cisco Secure Firewall high-availability concept synchronizes connection state so existing flows survive a failover?',
    options: opts4(
      'Stateful failover with a state/failover link',
      'STP topology change',
      'GLBP weighting',
      'OSPF graceful restart only'
    ),
    correct: ['a'],
    explanation: 'In an active/standby HA pair, the stateful failover/state link replicates connection and translation tables so established sessions are preserved when the standby takes over, minimizing disruption.',
    references: [REF_FTD, REF_FW]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Layer 2 protection disables a port if it receives a superior BPDU, preventing a rogue switch from becoming root?',
    options: opts4(
      'Root Guard',
      'BPDU Guard',
      'Loop Guard',
      'PortFast'
    ),
    correct: ['a'],
    explanation: 'Root Guard puts a port into root-inconsistent (blocking) state if it receives a superior BPDU, ensuring the designated root bridge cannot be hijacked by an attacker-introduced switch.',
    references: [REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'On Cisco FTD, which inspection adds intrusion prevention to allowed access-control rules?',
    options: opts4(
      'An associated Intrusion Policy (Snort rules) on the access rule',
      'A QoS policy',
      'A platform settings policy',
      'An SNMP host'
    ),
    correct: ['a'],
    explanation: 'Allowed access-control rules can reference an Intrusion Policy so matching traffic is inspected by the Snort IPS engine with chosen rule sets and variables, blocking or alerting on exploits.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which VPN technology encrypts traffic between any pair of group members using a shared group key, ideal for fully meshed private WANs?',
    options: opts4(
      'GET VPN (Group Encrypted Transport)',
      'Clientless SSL VPN',
      'PPTP',
      'L2TP without IPsec'
    ),
    correct: ['a'],
    explanation: 'Cisco GET VPN uses a group key server and GDOI so any member can encrypt to any member without point-to-point tunnels — well suited to fully meshed MPLS/private WANs preserving the original IP header.',
    references: [REF_VPN]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'A firewall rule must block known malicious IPs sourced from Talos automatically. Which FTD feature provides this?',
    options: opts4(
      'Security Intelligence (block lists / feeds)',
      'QoS shaping',
      'NAT exemption',
      'DHCP relay'
    ),
    correct: ['a'],
    explanation: 'FTD Security Intelligence uses Talos-sourced and custom IP/URL/DNS feeds to block or monitor traffic to/from known-bad entities early in processing, before resource-intensive inspection.',
    references: [REF_FTD, REF_TALOS]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which feature mitigates DHCP starvation by limiting the rate of DHCP discover messages on untrusted access ports?',
    options: opts4(
      'DHCP snooping rate limiting on untrusted ports',
      'Proxy ARP',
      'IP directed broadcast',
      'Gratuitous ARP'
    ),
    correct: ['a'],
    explanation: 'DHCP snooping marks access ports as untrusted and can rate-limit DHCP messages, mitigating starvation attacks that exhaust the DHCP pool by flooding spoofed discovers.',
    references: [REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid IKEv2/IPsec design choices that improve VPN security.',
    options: opts4(
      'Use certificate-based authentication instead of weak pre-shared keys where possible',
      'Enable Perfect Forward Secrecy on the IPsec SA',
      'Prefer AES-GCM and SHA-256+ over DES/MD5',
      'Disable Dead Peer Detection to save CPU'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Certificates, PFS, and strong modern algorithms harden the VPN. Disabling Dead Peer Detection harms resilience (stale SAs/blackholing) and is not a security improvement.',
    references: [REF_VPN, REF_SCOR]
  },

  // ── Securing the Cloud (10) ──
  {
    domain: CLOUD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a SaaS deployment, which security responsibility almost always remains with the customer?',
    options: opts4(
      'Patching the application code',
      'Managing user identities, access, and data classification/sharing settings',
      'Maintaining the data-center cooling',
      'Hypervisor patching'
    ),
    correct: ['b'],
    explanation: 'Even in SaaS the customer owns identity/access management, data classification, and sharing/permission settings. The provider handles the application, runtime, and infrastructure.',
    references: [REF_SECCLOUD, REF_CASB]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco capability inspects OAuth grants and risky third-party app connections to SaaS platforms?',
    options: opts4(
      'Cisco Cloudlock (CASB) app discovery and OAuth risk',
      'Cisco ISE MAB',
      'Cisco UDLD',
      'Cisco HSRP'
    ),
    correct: ['a'],
    explanation: 'Cloudlock discovers connected third-party apps and evaluates OAuth scopes/risk against SaaS platforms, letting admins revoke or restrict risky integrations that could exfiltrate data.',
    references: [REF_CASB, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach restricts east-west traffic between cloud workloads to only required flows, limiting lateral movement?',
    options: opts4(
      'Flat network with any-any rules',
      'Micro-segmentation (e.g., Secure Workload policy)',
      'Disabling all logging',
      'Single shared admin credential'
    ),
    correct: ['b'],
    explanation: 'Micro-segmentation enforces least-privilege, workload-to-workload policy so a compromised workload cannot freely move laterally. Cisco Secure Workload generates and enforces such policy.',
    references: [REF_TETRATION, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Encrypting data at rest and in transit is a customer-controllable safeguard in most cloud service models.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Customers can typically enable/manage encryption for data at rest (keys, KMS) and enforce TLS in transit, reducing exposure even if underlying storage is compromised.',
    references: [REF_SECCLOUD, REF_SCOR]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Umbrella component provides full secure web gateway proxy with content/AV inspection for risky domains?',
    options: opts4(
      'Umbrella DNS-only package',
      'Umbrella Secure Web Gateway (SWG / selective or full proxy)',
      'Umbrella roaming client uninstall',
      'Umbrella SNMP poller'
    ),
    correct: ['b'],
    explanation: 'The Umbrella Secure Web Gateway proxies web traffic for deeper inspection (URL filtering, AV, file analysis, decryption) beyond the DNS-layer enforcement of the DNS-only tier.',
    references: [REF_UMBRELLA, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 4, type: QType.SINGLE,
    stem: 'A REST API must prevent abuse from a single client overwhelming it. Which control directly addresses this?',
    options: opts4(
      'API rate limiting / throttling',
      'Enabling verbose stack traces',
      'Allowing unauthenticated writes',
      'Removing TLS'
    ),
    correct: ['a'],
    explanation: 'Rate limiting/throttling caps requests per client/token/time window, mitigating brute force and resource exhaustion. The other options weaken security or aid attackers.',
    references: [REF_OWASP, REF_DEVNET]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice ensures cloud infrastructure changes are reviewed and reproducible, reducing drift and misconfiguration?',
    options: opts4(
      'Manual console-only changes',
      'Infrastructure as Code with version control and review',
      'Shared root credentials',
      'Disabling change logging'
    ),
    correct: ['b'],
    explanation: 'Infrastructure as Code (with VCS, peer review, and pipeline scanning) makes changes auditable, repeatable, and testable, reducing configuration drift and human-error misconfigurations.',
    references: [REF_DEVNET, REF_SCOR]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco solution gives application dependency mapping to build accurate allow-list segmentation policy before enforcement?',
    options: opts4(
      'Cisco Secure Workload (Tetration) ADM',
      'Cisco IP SLA',
      'Cisco Config Pro',
      'Cisco Discovery Protocol'
    ),
    correct: ['a'],
    explanation: 'Secure Workload\'s Application Dependency Mapping (ADM) analyzes flows to discover how applications communicate, generating accurate allow-list micro-segmentation policy that can be simulated before enforcement.',
    references: [REF_TETRATION]
  },
  {
    domain: CLOUD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which term describes employees using unsanctioned cloud apps without IT approval, increasing data risk?',
    options: opts4(
      'Shadow IT',
      'Air gap',
      'Hairpinning',
      'Split tunneling'
    ),
    correct: ['a'],
    explanation: 'Shadow IT is the use of unapproved apps/services, creating ungoverned data flows. CASB (Cloudlock) and Umbrella app discovery surface and help control shadow IT.',
    references: [REF_CASB, REF_UMBRELLA]
  },
  {
    domain: CLOUD, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL controls that strengthen the security of a public cloud account.',
    options: opts4(
      'Enforce MFA for all privileged identities',
      'Apply least-privilege IAM roles instead of broad admin',
      'Enable configuration auditing/CSPM and logging',
      'Embed long-lived static access keys in source code'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'MFA, least-privilege IAM, and continuous configuration auditing/logging materially reduce cloud risk. Hard-coding long-lived keys in code is a severe anti-pattern leading to credential leakage.',
    references: [REF_SECCLOUD, REF_DEVNET]
  },

  // ── Content Security (10) ──
  {
    domain: CONTENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which ESA table determines which recipient domains/addresses the appliance will accept mail for?',
    options: opts4(
      'Recipient Access Table (RAT)',
      'Host Access Table (HAT)',
      'Routing table',
      'ARP table'
    ),
    correct: ['a'],
    explanation: 'The RAT defines which recipient addresses/domains the listener accepts (relay control), while the HAT classifies sending hosts by reputation and applies mail-flow policy.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which WSA feature inspects and controls applications like file-sharing or webmail beyond simple URL categories?',
    options: opts4(
      'Application Visibility and Control (AVC)',
      'NTP authentication',
      'Spanning Tree',
      'DHCP relay'
    ),
    correct: ['a'],
    explanation: 'AVC identifies web applications and micro-applications (e.g., specific actions within an app) so policy can allow, block, or limit them, providing control beyond URL category filtering.',
    references: [REF_WSA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'On the ESA, which feature rewrites URLs in messages and evaluates them at click time to protect against delayed weaponization?',
    options: opts4(
      'URL filtering with click-time protection (Outbreak Filters URL rewriting)',
      'Bounce verification',
      'LDAP routing',
      'Delivery throttling'
    ),
    correct: ['a'],
    explanation: 'ESA can rewrite URLs and proxy them through a Cisco service so they are re-evaluated at click time, protecting users when a link is weaponized after delivery.',
    references: [REF_ESA, REF_TALOS]
  },
  {
    domain: CONTENT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: The Cisco WSA can be deployed transparently using WCCP redirection from a supported firewall/router.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. In transparent mode the WSA receives traffic via WCCP (or policy-based routing) without per-client proxy configuration, simplifying deployment for large user populations.',
    references: [REF_WSA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ESA capability automatically protects against fast-breaking email threats before traditional signatures are available?',
    options: opts4(
      'Outbreak Filters',
      'PVST+',
      'GLBP',
      'IP SLA'
    ),
    correct: ['a'],
    explanation: 'Outbreak Filters use Talos real-time threat intelligence to quarantine or rewrite suspicious messages during the early window of an attack, before conventional anti-virus signatures exist.',
    references: [REF_ESA, REF_TALOS]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which integration lets WSA/ESA submit unknown files for dynamic analysis and receive a malware verdict?',
    options: opts4(
      'Cisco Secure Malware Analytics (Threat Grid) / File Analysis',
      'Cisco VTP',
      'Cisco CDP',
      'Cisco PAgP'
    ),
    correct: ['a'],
    explanation: 'File Analysis sends unknown files to Cisco Secure Malware Analytics (Threat Grid) sandboxing; verdicts feed back to ESA/WSA (and Secure Endpoint) including retrospective alerts.',
    references: [REF_THREATGRID, REF_AMP]
  },
  {
    domain: CONTENT, difficulty: 4, type: QType.SINGLE,
    stem: 'WSA HTTPS decryption should be selectively bypassed for which category to respect privacy/compliance?',
    options: opts4(
      'Known-malware sites',
      'Financial/healthcare (sensitive) categories per policy',
      'All advertising sites',
      'All sites unconditionally'
    ),
    correct: ['b'],
    explanation: 'Organizations commonly create decryption-policy exceptions for sensitive categories (banking, healthcare) to meet privacy/compliance requirements, while still decrypting general traffic for inspection.',
    references: [REF_WSA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ESA feature encrypts outbound sensitive messages so only the intended recipient can open them?',
    options: opts4(
      'Cisco Secure Email Encryption (envelope/S-MIME/TLS enforcement)',
      'SNMP traps',
      'NetFlow export',
      'PortFast'
    ),
    correct: ['a'],
    explanation: 'ESA can enforce TLS, apply S/MIME, or use Cisco encryption (secure envelope) triggered by content/DLP policy so confidential outbound mail is protected end to end.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which appliance is specifically designed to secure web (HTTP/HTTPS) traffic with proxy, URL filtering, and malware defense?',
    options: opts4(
      'Cisco Secure Web Appliance (WSA)',
      'Cisco Catalyst switch',
      'Cisco ISR router',
      'Cisco Nexus switch'
    ),
    correct: ['a'],
    explanation: 'The WSA is a dedicated secure web gateway providing forward proxy, URL/category filtering, web reputation, AVC, and anti-malware/file analysis for outbound web traffic.',
    references: [REF_WSA]
  },
  {
    domain: CONTENT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL ESA mechanisms that help defend against phishing and business email compromise (BEC).',
    options: opts4(
      'SPF/DKIM/DMARC email authentication',
      'Forged Email Detection / sender spoof checks',
      'URL click-time protection (Outbreak Filters)',
      'Disabling all anti-spam scanning'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Email authentication, forged-email/spoof detection, and click-time URL protection directly counter phishing/BEC. Disabling anti-spam scanning would increase exposure, not reduce it.',
    references: [REF_ESA, REF_TALOS]
  },

  // ── Endpoint Protection and Detection (7) ──
  {
    domain: ENDPOINT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco Secure Endpoint component is installed on hosts to collect telemetry and enforce policy?',
    options: opts4(
      'The connector/agent',
      'A SPAN port',
      'A RADIUS server',
      'An NTP daemon'
    ),
    correct: ['a'],
    explanation: 'The Secure Endpoint connector (agent) runs on endpoints/servers to monitor file and process activity, enforce policy, and report to the cloud console for detection and response.',
    references: [REF_AMP]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Secure Endpoint feature isolates a compromised host from the network while preserving the connector\'s control channel for investigation?',
    options: opts4(
      'Host isolation / endpoint isolation',
      'STP root guard',
      'IP SLA tracking',
      'GLBP failover'
    ),
    correct: ['a'],
    explanation: 'Endpoint isolation cuts the host\'s network communication except the Secure Endpoint management channel, containing a threat while still allowing remote investigation and remediation.',
    references: [REF_AMP]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability allows Secure Endpoint to convict a file based on the global reputation/disposition derived from cloud intelligence?',
    options: opts4(
      'File reputation lookup (cloud disposition)',
      'OSPF LSA flooding',
      'DHCP relay',
      'LACP hashing'
    ),
    correct: ['a'],
    explanation: 'Secure Endpoint queries the cloud for a file\'s reputation/disposition (clean, malicious, unknown). Malicious dispositions are blocked/quarantined; unknowns may be sent for analysis.',
    references: [REF_AMP, REF_TALOS]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Endpoint posture compliance can be enforced at network access time using ISE in conjunction with the Secure Client posture module.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. ISE evaluates the posture report from the Secure Client posture module (AV, patches, encryption) and authorizes, quarantines, or triggers remediation before granting full access.',
    references: [REF_POSTURE, REF_ANYCONNECT]
  },
  {
    domain: ENDPOINT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which practice limits malware persistence by ensuring users do not run with unnecessary administrative rights?',
    options: opts4(
      'Removing local administrator rights / least privilege on endpoints',
      'Enabling guest accounts everywhere',
      'Disabling endpoint logging',
      'Sharing one admin account'
    ),
    correct: ['a'],
    explanation: 'Operating with least privilege limits what malware and attackers can do (install services, persist, tamper). Standard-user accounts plus elevation controls reduce blast radius.',
    references: [REF_AMP, REF_SCOR]
  },
  {
    domain: ENDPOINT, difficulty: 4, type: QType.SINGLE,
    stem: 'An analyst needs to search all endpoints for the presence of a specific file hash or process during incident response. Which Secure Endpoint capability supports this?',
    options: opts4(
      'Advanced search / endpoint IOC and threat hunting',
      'Spanning Tree topology change',
      'BGP route refresh',
      'NTP stratum query'
    ),
    correct: ['a'],
    explanation: 'Secure Endpoint provides advanced search/threat hunting and IOC scanning so responders can sweep the fleet for a hash, file path, or behavior to scope and contain an incident.',
    references: [REF_AMP, REF_THREATGRID]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Secure Endpoint protection blocks exploitation techniques (e.g., memory injection) used by fileless malware?',
    options: opts4(
      'Exploit Prevention / behavioral protection engine',
      'DHCP snooping',
      'PortFast',
      'VTP pruning'
    ),
    correct: ['a'],
    explanation: 'Exploit Prevention and behavioral protection detect and block in-memory and exploitation techniques (such as code injection) used by fileless attacks that evade signature-based detection.',
    references: [REF_AMP]
  },

  // ── Secure Network Access, Visibility, and Enforcement (9) ──
  {
    domain: ACCESS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which EAP method uses client and server certificates for mutual authentication and is considered the most secure common 802.1X method?',
    options: opts4(
      'EAP-MD5',
      'EAP-TLS',
      'EAP-FAST without certificates',
      'PAP'
    ),
    correct: ['b'],
    explanation: 'EAP-TLS performs mutual certificate authentication, avoiding password exposure and resisting credential theft. EAP-MD5 is weak/one-way; PAP is clear-text; EAP-FAST without strong provisioning is weaker than EAP-TLS.',
    references: [REF_8021X, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'In ISE, which policy element determines the access result (VLAN, dACL, SGT) returned after a user is authenticated?',
    options: opts4(
      'Authorization policy/profile',
      'Authentication policy only',
      'Logging profile',
      'Backup schedule'
    ),
    correct: ['a'],
    explanation: 'The ISE authorization policy matches conditions (identity group, posture, device profile) and applies an authorization profile (VLAN, downloadable ACL, SGT, redirect) that defines the granted access.',
    references: [REF_ISE_ADMIN, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which RADIUS message lets ISE dynamically change or revoke a live session\'s authorization (e.g., quarantine after a threat)?',
    options: opts4(
      'Change of Authorization (CoA)',
      'Accounting-Stop only',
      'Access-Reject',
      'Access-Challenge'
    ),
    correct: ['a'],
    explanation: 'RADIUS Change of Authorization allows ISE to push a new policy (re-auth, port-bounce, quarantine, disconnect) to an active session without waiting for re-authentication — key for rapid threat containment.',
    references: [REF_ISE_ADMIN, REF_PXGRID]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: ISE guest services can provide self-registration and sponsor-approved temporary network access for visitors.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. ISE guest portals support self-registration, sponsor approval, and time-bound credentials, isolating guests (often via a dedicated VLAN/SGT) from the corporate network.',
    references: [REF_ISE, REF_ISE_ADMIN]
  },
  {
    domain: ACCESS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which TrustSec construct enforces policy between source and destination groups on enforcement devices?',
    options: opts4(
      'Security Group ACL (SGACL)',
      'Static route',
      'Prefix list',
      'BGP community'
    ),
    correct: ['a'],
    explanation: 'TrustSec uses SGTs to classify traffic and SGACLs (the policy matrix from ISE) to permit/deny between source and destination groups on enforcement points, decoupling policy from IP.',
    references: [REF_TRUSTSEC, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which deployment lets a switch port allow limited access for unknown devices while still authenticating capable ones?',
    options: opts4(
      '802.1X with MAB fallback and a restricted/guest authorization',
      'Disabling AAA on the port',
      'Hard-coding the port to a trunk',
      'Removing the access VLAN'
    ),
    correct: ['a'],
    explanation: 'A flexible authentication design runs 802.1X first, falls back to MAB for non-supplicant devices, and can apply a restricted/guest authorization for unknowns — balancing security and usability.',
    references: [REF_8021X, REF_MAB]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Stealthwatch concept builds a baseline of normal host behavior to detect deviations like data hoarding or beaconing?',
    options: opts4(
      'Behavioral modeling / host group baselining',
      'Spanning Tree recalculation',
      'NAT translation slots',
      'HSRP preempt'
    ),
    correct: ['a'],
    explanation: 'Stealthwatch builds behavioral baselines per host/host-group from telemetry and raises alarms on anomalies (suspect data hoarding, C2 beaconing, lateral movement) without signatures.',
    references: [REF_STEALTHWATCH, REF_NETFLOW]
  },
  {
    domain: ACCESS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which protocol does ISE most commonly use to authenticate network access (802.1X/MAB) clients?',
    options: opts4(
      'RADIUS',
      'TACACS+',
      'SMTP',
      'NetFlow'
    ),
    correct: ['a'],
    explanation: 'ISE uses RADIUS for network access authentication/authorization (802.1X, MAB, VPN). TACACS+ is reserved for device administration AAA with per-command authorization.',
    references: [REF_ISE, REF_8021X]
  },
  {
    domain: ACCESS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which integration lets a security product (e.g., FTD or Stealthwatch) request that ISE quarantine a compromised endpoint via CoA?',
    options: opts4(
      'pxGrid with Adaptive Network Control / Rapid Threat Containment',
      'CDP neighbor exchange',
      'VTP advertisement',
      'OSPF adjacency'
    ),
    correct: ['a'],
    explanation: 'Through pxGrid and ISE Adaptive Network Control, ecosystem products can trigger Rapid Threat Containment so ISE issues a CoA to quarantine or restrict the offending endpoint automatically.',
    references: [REF_PXGRID, REF_ISE]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Security Concepts (16) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which control category does encryption of data at rest primarily provide?',
    options: opts4(
      'Availability',
      'Confidentiality',
      'Non-repudiation only',
      'Physical security'
    ),
    correct: ['b'],
    explanation: 'Encryption at rest protects confidentiality so that stolen disks/backups cannot be read without keys. Integrity/authenticity require additional mechanisms (signatures/MACs).',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which attack reuses captured authentication hashes to access systems without knowing the plaintext password?',
    options: opts4(
      'Pass-the-hash',
      'SQL injection',
      'SYN flood',
      'Smurf attack'
    ),
    correct: ['a'],
    explanation: 'Pass-the-hash replays stolen password hashes (e.g., NTLM) to authenticate without cracking them. Credential isolation, least privilege, and MFA reduce the risk.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which IKE version natively supports EAP for remote-access authentication and has fewer messages/built-in NAT traversal than its predecessor?',
    options: opts4(
      'IKEv1 main mode',
      'IKEv2',
      'IKEv1 aggressive mode',
      'ISAKMP v0'
    ),
    correct: ['b'],
    explanation: 'IKEv2 streamlines negotiation, includes built-in NAT-T and dead-peer detection, supports EAP for remote access, and is more robust than IKEv1 main/aggressive modes.',
    references: [REF_VPN, REF_ANYCONNECT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Non-repudiation ensures a party cannot credibly deny having performed an action, often achieved with digital signatures.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Non-repudiation binds an action to an identity such that it cannot later be plausibly denied; digital signatures (private-key signing) provide this property along with integrity.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which technique hides the existence of data or malware by embedding it within other benign-looking files?',
    options: opts4(
      'Steganography',
      'Hashing',
      'Tokenization',
      'Load balancing'
    ),
    correct: ['a'],
    explanation: 'Steganography conceals data within other media (images, audio) so its presence is not obvious. It is used for covert channels/exfiltration; deep inspection and DLP help detect anomalies.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which factor type is a fingerprint or facial scan in multi-factor authentication?',
    options: opts4(
      'Something you know',
      'Something you are (inherence)',
      'Something you have',
      'Somewhere you are'
    ),
    correct: ['b'],
    explanation: 'Biometrics (fingerprint, face, iris) are an inherence factor — "something you are." Combining it with a password (knowledge) or token (possession) yields multi-factor authentication.',
    references: [REF_DUO, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which weakness allows an attacker to read files outside the intended web root by manipulating path input like ../../etc/passwd?',
    options: opts4(
      'Directory/path traversal',
      'CSRF',
      'Race condition',
      'Buffer underflow'
    ),
    correct: ['a'],
    explanation: 'Path traversal abuses insufficient input validation to escape the intended directory and access arbitrary files. Canonicalization and strict input validation mitigate it.',
    references: [REF_OWASP, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which security service ensures a message was not altered between sender and receiver?',
    options: opts4(
      'Confidentiality',
      'Integrity',
      'Availability',
      'Anonymity'
    ),
    correct: ['b'],
    explanation: 'Integrity guarantees data has not been modified in transit/at rest in an unauthorized or undetected way, typically via hashes, MACs (HMAC), or digital signatures.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which describes a botnet?',
    options: opts4(
      'A network of compromised hosts controlled by an attacker',
      'A trusted internal management VLAN',
      'A digital certificate chain',
      'A backup replication cluster'
    ),
    correct: ['a'],
    explanation: 'A botnet is a collection of malware-infected devices under attacker command-and-control, used for DDoS, spam, or fraud. C2 detection (Stealthwatch/Umbrella) helps disrupt it.',
    references: [REF_STEALTHWATCH, REF_UMBRELLA]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly describe asymmetric cryptography.',
    options: opts4(
      'It uses a mathematically related public/private key pair.',
      'Data encrypted with the public key is decryptable only with the matching private key.',
      'It is typically slower than symmetric encryption for bulk data.',
      'The same single secret key is shared by all parties.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Asymmetric crypto uses a key pair; public-key-encrypted data needs the private key to decrypt; it is computationally heavier than symmetric ciphers, so it is used for key exchange/signatures, not bulk data.',
    references: [REF_SCOR, REF_VPN]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which mitigation best reduces the risk of compromised credentials being reused by attackers?',
    options: opts4(
      'Reusing the same password across systems',
      'Enforcing multi-factor authentication',
      'Disabling account lockout',
      'Logging only successful logins'
    ),
    correct: ['b'],
    explanation: 'MFA requires an additional independent factor, so a stolen password alone is insufficient. Reusing passwords and disabling lockout increase risk; logging only successes weakens detection.',
    references: [REF_DUO, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which scripting attack injects malicious client-side code that executes in other users\' browsers in the context of a trusted site?',
    options: opts4(
      'Cross-site scripting (XSS)',
      'SQL injection',
      'XML external entity (XXE)',
      'Server-side request forgery (SSRF)'
    ),
    correct: ['a'],
    explanation: 'XSS injects script that runs in victims\' browsers under the trusted site\'s origin, enabling session theft and defacement. Output encoding and a strong Content Security Policy mitigate it.',
    references: [REF_OWASP, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which device validates certificate revocation in real time using a request/response protocol?',
    options: opts4(
      'OCSP responder',
      'DHCP server',
      'NTP server',
      'Syslog collector'
    ),
    correct: ['a'],
    explanation: 'The Online Certificate Status Protocol responder answers real-time queries about whether a specific certificate is revoked, an alternative/complement to downloading full CRLs.',
    references: [REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which IPsec mode encrypts the entire original IP packet and adds a new IP header, used for site-to-site VPNs?',
    options: opts4(
      'Transport mode',
      'Tunnel mode',
      'Promiscuous mode',
      'Half-duplex mode'
    ),
    correct: ['b'],
    explanation: 'Tunnel mode encapsulates and protects the entire original IP packet within a new outer IP header — the standard for gateway-to-gateway (site-to-site) VPNs. Transport mode protects only the payload between hosts.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best practice limits the impact of a single compromised administrator credential on network devices?',
    options: opts4(
      'Shared admin accounts for all engineers',
      'Per-user TACACS+ accounts with command authorization and accounting',
      'Disabling AAA and using a local enable secret only',
      'Telnet for management'
    ),
    correct: ['b'],
    explanation: 'Per-user TACACS+ with command authorization and accounting provides individual accountability and least-privilege command control, so one credential\'s compromise is contained and auditable.',
    references: [REF_ISE_ADMIN, REF_SCOR]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which attack technique floods a target with TCP connection requests that are never completed, exhausting the connection table?',
    options: opts4(
      'SYN flood',
      'Ping of death',
      'Teardrop attack',
      'Session hijacking'
    ),
    correct: ['a'],
    explanation: 'A SYN flood sends many half-open TCP connections (SYN without final ACK) to exhaust the server\'s connection table and deny service. SYN cookies and rate limiting mitigate it.',
    references: [REF_SCOR, REF_TALOS]
  },

  // ── Network Security (13) ──
  {
    domain: NETSEC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco FTD management platform provides centralized policy, logging, and event analysis for multiple FTD devices?',
    options: opts4(
      'Cisco Secure Firewall Management Center (FMC)',
      'Cisco Prime LMS',
      'Cisco Config Pro',
      'Cisco Works'
    ),
    correct: ['a'],
    explanation: 'The Secure Firewall Management Center (FMC) centrally manages multiple FTD devices: access control, intrusion, file, NAT policies, plus event/log analysis and reporting.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which firewall feature inspects traffic up to Layer 7 to identify applications regardless of port (e.g., detecting HTTP on a non-standard port)?',
    options: opts4(
      'Application identification / deep packet inspection',
      'Static routing',
      'MAC filtering',
      'CDP'
    ),
    correct: ['a'],
    explanation: 'Application identification via deep packet inspection recognizes the actual application by behavior/signatures, not just port, so policy applies even when apps use non-standard or evasive ports.',
    references: [REF_FTD, REF_FW]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco IOS feature provides stateful firewalling on a router using the zone-based model?',
    options: opts4(
      'Zone-Based Policy Firewall (ZBFW)',
      'Reflexive ACL only',
      'NAT pool',
      'Policy-based routing'
    ),
    correct: ['a'],
    explanation: 'The Zone-Based Policy Firewall assigns interfaces to security zones and applies stateful inspection policy between zone pairs, providing modern stateful firewalling on IOS routers.',
    references: [REF_SCOR, REF_FW]
  },
  {
    domain: NETSEC, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A reflexive ACL or stateful firewall dynamically permits return traffic for sessions initiated from the trusted side.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Reflexive ACLs and stateful firewalls track outbound sessions and dynamically allow only the corresponding return traffic, without a permanent inbound permit rule.',
    references: [REF_SCOR, REF_FW]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which IPsec parameter set must match on both peers for IKE Phase 1 to succeed?',
    options: opts4(
      'Encryption, hash, DH group, authentication method, and lifetime (IKE policy)',
      'Hostnames only',
      'Interface descriptions',
      'SNMP community strings'
    ),
    correct: ['a'],
    explanation: 'IKE Phase 1 requires a matching policy: encryption algorithm, hashing/integrity, Diffie-Hellman group, authentication method (PSK/cert), and lifetime. Mismatches prevent the IKE SA from forming.',
    references: [REF_VPN, REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which FTD policy controls which files can traverse and whether they are sent for malware analysis?',
    options: opts4(
      'File/Malware policy (AMP for Networks)',
      'QoS policy',
      'Platform settings policy',
      'Health policy'
    ),
    correct: ['a'],
    explanation: 'The File/Malware policy (AMP for Networks) detects, blocks, or stores files by type, performs file reputation, and can submit unknown files for dynamic analysis (Threat Grid).',
    references: [REF_FTD, REF_THREATGRID]
  },
  {
    domain: NETSEC, difficulty: 4, type: QType.SINGLE,
    stem: 'A clustering deployment of FTD must scale throughput while sharing connection state. Which feature enables this?',
    options: opts4(
      'FTD clustering with a cluster control link',
      'Spanning Tree PortFast',
      'GLBP load balancing',
      'OSPF ECMP only'
    ),
    correct: ['a'],
    explanation: 'FTD clustering pools multiple units into one logical firewall, using a cluster control link to distribute flows and share state, scaling throughput while maintaining stateful inspection.',
    references: [REF_FTD]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Layer 2 security feature limits the number of MAC addresses on an access port and can shut the port on violation?',
    options: opts4(
      'Port security',
      'EtherChannel',
      'VTP',
      'CDP'
    ),
    correct: ['a'],
    explanation: 'Port security restricts the MACs allowed on a port (count and/or specific addresses) and can protect/restrict/shutdown on violation, mitigating MAC flooding and unauthorized devices.',
    references: [REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which technology protects management traffic by encrypting Layer 2 frames between switches/devices?',
    options: opts4(
      'MACsec (802.1AE)',
      'STP',
      'VTP',
      'CDP'
    ),
    correct: ['a'],
    explanation: 'MACsec (IEEE 802.1AE) provides hop-by-hop Layer 2 encryption and integrity between directly connected devices, often keyed via MKA and used with 802.1X/TrustSec.',
    references: [REF_TRUSTSEC, REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which VPN type terminates on a user device for remote workers to securely reach corporate resources?',
    options: opts4(
      'Remote-access VPN (Cisco Secure Client/AnyConnect)',
      'GET VPN only',
      'DMVPN hub-only',
      'MPLS L3VPN'
    ),
    correct: ['a'],
    explanation: 'A remote-access VPN (Cisco Secure Client/AnyConnect via SSL or IKEv2/IPsec) connects individual user devices to the corporate network, unlike site-to-site technologies (DMVPN/GET VPN/MPLS).',
    references: [REF_ANYCONNECT, REF_VPN]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which FTD capability blocks access to malicious domains by inspecting and policing DNS requests?',
    options: opts4(
      'DNS-based Security Intelligence (DNS policy with sinkhole)',
      'NAT exemption',
      'QoS marking',
      'PortFast'
    ),
    correct: ['a'],
    explanation: 'FTD DNS-based Security Intelligence can block or sinkhole DNS queries to known-malicious domains using Talos and custom feeds, stopping connections before they are established.',
    references: [REF_FTD, REF_TALOS]
  },
  {
    domain: NETSEC, difficulty: 3, type: QType.SINGLE,
    stem: 'Which mechanism prevents IP spoofing by verifying that a packet\'s source address is reachable via the interface it arrived on?',
    options: opts4(
      'Unicast Reverse Path Forwarding (uRPF)',
      'Proxy ARP',
      'IP helper-address',
      'GLBP'
    ),
    correct: ['a'],
    explanation: 'uRPF checks that the source address of an incoming packet has a route back out the same interface (strict mode), dropping spoofed packets and mitigating address-spoofed attacks.',
    references: [REF_SCOR]
  },
  {
    domain: NETSEC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL recommended hardening steps for Cisco network device management planes.',
    options: opts4(
      'Use SSHv2 and disable Telnet',
      'Apply AAA (TACACS+/RADIUS) with role-based command authorization',
      'Restrict management access with ACLs/management VRF and use NTP-authenticated time',
      'Enable HTTP server with no authentication for convenience'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'SSHv2, AAA with role-based authorization, and restricted/authenticated management access all harden the device. Enabling an unauthenticated HTTP server is an insecure practice that should be avoided.',
    references: [REF_SCOR, REF_ISE_ADMIN]
  },

  // ── Securing the Cloud (10) ──
  {
    domain: CLOUD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which model component does the cloud provider always manage in PaaS?',
    options: opts4(
      'The application code written by the customer',
      'The runtime, operating system, and underlying infrastructure',
      'The customer\'s data classification',
      'The customer\'s user accounts'
    ),
    correct: ['b'],
    explanation: 'In PaaS the provider manages the runtime, OS, and infrastructure; the customer focuses on application code, data, and access. Identity/data governance remains a customer responsibility.',
    references: [REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco product enforces data loss prevention and user-behavior monitoring directly within SaaS suites via API?',
    options: opts4(
      'Cisco Cloudlock',
      'Cisco ISE',
      'Cisco Catalyst Center',
      'Cisco IOS XE'
    ),
    correct: ['a'],
    explanation: 'Cloudlock is an API-based CASB that applies DLP, detects risky user/entity behavior (e.g., impossible-travel logins), and controls third-party app access inside SaaS platforms.',
    references: [REF_CASB, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'A containerized microservice must obtain short-lived credentials rather than embedding static secrets. Which practice supports this?',
    options: opts4(
      'Hard-coding API keys in the image',
      'Using a secrets manager / dynamic short-lived tokens',
      'Storing secrets in a public repo',
      'Disabling TLS to simplify auth'
    ),
    correct: ['b'],
    explanation: 'A secrets manager issuing short-lived, automatically rotated credentials avoids long-lived embedded secrets, limiting exposure if an image or repo leaks.',
    references: [REF_DEVNET, REF_SCOR]
  },
  {
    domain: CLOUD, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Cisco Umbrella can secure remote workers\' DNS traffic even when they are not connected to the corporate VPN.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The Umbrella roaming client/module enforces DNS-layer policy on/off network, protecting roaming users regardless of VPN state — a key SASE/remote-work control.',
    references: [REF_UMBRELLA, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which control limits the blast radius if one cloud workload is compromised?',
    options: opts4(
      'Allowing all east-west traffic',
      'Workload micro-segmentation with least-privilege policy',
      'Sharing one IAM admin role',
      'Disabling flow logs'
    ),
    correct: ['b'],
    explanation: 'Micro-segmentation enforces least-privilege workload-to-workload communication so a compromised workload cannot freely pivot. Cisco Secure Workload builds and enforces these policies.',
    references: [REF_TETRATION, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 4, type: QType.SINGLE,
    stem: 'Which API authorization weakness lets a user access another user\'s object simply by changing an ID in the request?',
    options: opts4(
      'Broken Object Level Authorization (BOLA/IDOR)',
      'Clickjacking',
      'TLS downgrade',
      'DNS poisoning'
    ),
    correct: ['a'],
    explanation: 'Broken Object Level Authorization (a.k.a. IDOR) occurs when the API does not verify the caller owns/may access the referenced object, so manipulating IDs exposes other users\' data. Enforce per-object authorization checks.',
    references: [REF_OWASP, REF_DEVNET]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Cisco cloud-edge feature provides cloud-delivered firewall (FWaaS) for branch and roaming traffic?',
    options: opts4(
      'Cisco Umbrella Cloud-Delivered Firewall',
      'Cisco ISE profiling',
      'Cisco TrustSec SGT',
      'Cisco UDLD'
    ),
    correct: ['a'],
    explanation: 'Umbrella\'s cloud-delivered firewall provides L3/L4 (and with SIG, L7/IPS) policy enforcement for traffic forwarded to the cloud, extending firewalling to branches and roaming users without on-prem hardware.',
    references: [REF_UMBRELLA, REF_SECCLOUD]
  },
  {
    domain: CLOUD, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice reduces risk from vulnerable open-source dependencies in cloud applications?',
    options: opts4(
      'Software composition analysis / dependency scanning in CI/CD',
      'Disabling code review',
      'Using only the latest unpinned versions blindly',
      'Removing all logging'
    ),
    correct: ['a'],
    explanation: 'Software composition analysis inventories and scans third-party/open-source dependencies for known vulnerabilities and license issues, integrated into CI/CD so risky packages are flagged before release.',
    references: [REF_DEVNET, REF_SCOR]
  },
  {
    domain: CLOUD, difficulty: 2, type: QType.SINGLE,
    stem: 'Which converged cloud-security model combines networking and security services (SWG, CASB, ZTNA, FWaaS) delivered from the cloud?',
    options: opts4(
      'SASE (Secure Access Service Edge)',
      'STP',
      'MPLS',
      'OSPF'
    ),
    correct: ['a'],
    explanation: 'SASE converges network and security functions (SWG, CASB, ZTNA, FWaaS, SD-WAN) as a cloud-delivered service near the user. Cisco delivers SASE building blocks via Umbrella and Secure Connect.',
    references: [REF_SECCLOUD, REF_UMBRELLA]
  },
  {
    domain: CLOUD, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL practices that improve cloud workload security.',
    options: opts4(
      'Scan container images for vulnerabilities before deployment',
      'Apply least-privilege IAM roles to workloads',
      'Enforce micro-segmentation between tiers',
      'Run all workloads with cluster-admin privileges'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Image scanning, least-privilege workload identities, and micro-segmentation all reduce risk. Running workloads with cluster-admin violates least privilege and dramatically widens blast radius.',
    references: [REF_TETRATION, REF_SECCLOUD]
  },

  // ── Content Security (10) ──
  {
    domain: CONTENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Cisco appliance secures inbound and outbound SMTP email with anti-spam, anti-malware, and DLP?',
    options: opts4(
      'Cisco Secure Email Gateway (ESA)',
      'Cisco Secure Web Appliance (WSA)',
      'Cisco ISE',
      'Cisco Catalyst switch'
    ),
    correct: ['a'],
    explanation: 'The Cisco Secure Email Gateway (ESA) protects SMTP mail flow with reputation filtering, anti-spam, anti-virus, Outbreak Filters, DLP, and encryption for inbound and outbound messages.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which ESA verdict mechanism evaluates the reputation of the sending mail server\'s IP address?',
    options: opts4(
      'SenderBase/Talos IP reputation (SBRS)',
      'STP root election',
      'VTP synchronization',
      'CDP neighbor lookup'
    ),
    correct: ['a'],
    explanation: 'ESA uses Talos/SenderBase reputation (SBRS) to score sending IPs; low-reputation senders can be throttled or blocked via HAT mail-flow policies before content scanning.',
    references: [REF_ESA, REF_TALOS]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which WSA policy decides whether HTTPS sessions are decrypted, passed through, or dropped?',
    options: opts4(
      'Decryption policy',
      'Identification profile only',
      'Routing policy',
      'SNMP policy'
    ),
    correct: ['a'],
    explanation: 'The WSA decryption policy uses URL category, web reputation, and other criteria to decide per-flow whether to decrypt for inspection, pass through, or drop HTTPS traffic.',
    references: [REF_WSA]
  },
  {
    domain: CONTENT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: ESA and WSA can integrate with Cisco Secure Malware Analytics for sandboxing unknown files.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Both ESA and WSA support File Analysis integration with Cisco Secure Malware Analytics (Threat Grid), submitting unknown files for dynamic analysis and acting on verdicts (including retrospection).',
    references: [REF_THREATGRID, REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which WSA authentication method transparently identifies users via their Windows domain session for policy?',
    options: opts4(
      'Transparent user identification with Active Directory (e.g., ISE/AD agent or Kerberos/NTLM)',
      'PAP over HTTP',
      'No authentication',
      'SNMP community auth'
    ),
    correct: ['a'],
    explanation: 'The WSA can transparently identify users via integrated Windows authentication (Kerberos/NTLM) or identity services so per-user/group web policy applies without manual login prompts.',
    references: [REF_WSA, REF_ISE]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ESA feature quarantines suspected spam for end-user or admin review rather than outright deletion?',
    options: opts4(
      'Spam quarantine',
      'NAT pool',
      'Route map',
      'STP edge port'
    ),
    correct: ['a'],
    explanation: 'The spam quarantine holds messages classified as spam/suspect for a configurable period so admins or end users can review and release false positives instead of losing legitimate mail.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A WSA must allow business SaaS but block personal file uploads to the same domain. Which capability enables this granularity?',
    options: opts4(
      'Application Visibility and Control with micro-application/action controls',
      'Static routing',
      'MAC filtering',
      'NTP authentication'
    ),
    correct: ['a'],
    explanation: 'AVC can distinguish actions/micro-applications (e.g., "upload" vs "view") within a web app, so policy can permit sanctioned use while blocking risky actions like personal uploads.',
    references: [REF_WSA]
  },
  {
    domain: CONTENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which email defense verifies the cryptographic signature a sender adds to prove the message body/headers were not altered?',
    options: opts4(
      'DKIM verification',
      'SPF only',
      'Reverse DNS only',
      'TCP MSS clamping'
    ),
    correct: ['a'],
    explanation: 'DKIM adds a domain signature over selected headers/body; verifying it confirms integrity and that an authorized domain key signed the message, complementing SPF and DMARC.',
    references: [REF_ESA]
  },
  {
    domain: CONTENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which threat-intelligence source powers reputation and signature updates across ESA, WSA, FTD, Umbrella, and Secure Endpoint?',
    options: opts4(
      'Cisco Talos',
      'Cisco Feature Navigator',
      'Cisco CCO downloads',
      'Cisco Bug Search Tool'
    ),
    correct: ['a'],
    explanation: 'Cisco Talos provides unified, continuously updated threat intelligence (reputation, signatures, IOCs) consumed across the Cisco Security portfolio for coordinated protection.',
    references: [REF_TALOS]
  },
  {
    domain: CONTENT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL Cisco Secure Email controls that mitigate inbound malware delivery.',
    options: opts4(
      'Anti-virus scanning of attachments',
      'File Analysis (sandboxing) of unknown attachments',
      'Outbreak Filters with URL rewriting/click-time checks',
      'Disabling all attachment scanning to speed delivery'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'AV scanning, sandbox File Analysis, and Outbreak Filters with click-time URL protection all reduce inbound malware risk. Disabling attachment scanning would increase exposure, not mitigate it.',
    references: [REF_ESA, REF_THREATGRID]
  },

  // ── Endpoint Protection and Detection (7) ──
  {
    domain: ENDPOINT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which describes the primary value of EDR over preventive-only endpoint security?',
    options: opts4(
      'It blocks only known-signature malware',
      'It provides continuous detection, investigation, and response to threats that bypass prevention',
      'It replaces the need for network security',
      'It only manages OS patches'
    ),
    correct: ['b'],
    explanation: 'EDR assumes some threats bypass prevention and adds continuous monitoring, detection, threat hunting, and response/remediation — visibility and action beyond signature blocking.',
    references: [REF_AMP]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Secure Endpoint feature shows the sequence of actions a file/process took on a host to aid root-cause analysis?',
    options: opts4(
      'Device/file trajectory',
      'Spanning Tree topology',
      'NAT translation table',
      'ARP cache'
    ),
    correct: ['a'],
    explanation: 'Trajectory visualizes the chronological chain of file and process activity (creation, execution, network) across hosts, accelerating root-cause analysis and scoping of an incident.',
    references: [REF_AMP]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Secure Endpoint mechanism re-evaluates previously seen files when new intelligence changes their disposition to malicious?',
    options: opts4(
      'Retrospective detection',
      'OSPF SPF recalculation',
      'DHCP lease renewal',
      'STP reconvergence'
    ),
    correct: ['a'],
    explanation: 'Retrospective detection uses the cloud\'s evolving intelligence: when a file\'s disposition later changes to malicious, Secure Endpoint alerts and can quarantine it wherever it was seen.',
    references: [REF_AMP, REF_TALOS]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Cisco Secure Endpoint can submit unknown files to Cisco Secure Malware Analytics for dynamic sandbox analysis.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Secure Endpoint integrates with Cisco Secure Malware Analytics (Threat Grid) to detonate unknown files and incorporate the behavioral verdict into detection and retrospection.',
    references: [REF_AMP, REF_THREATGRID]
  },
  {
    domain: ENDPOINT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which endpoint control reduces risk from removable media auto-running malware?',
    options: opts4(
      'Device control / disabling autorun and restricting USB',
      'Enabling Telnet',
      'Granting admin to all users',
      'Disabling the host firewall'
    ),
    correct: ['a'],
    explanation: 'Device control policies that restrict USB/removable media and disable autorun prevent a common malware introduction/execution vector. The other options weaken security.',
    references: [REF_AMP, REF_SCOR]
  },
  {
    domain: ENDPOINT, difficulty: 4, type: QType.SINGLE,
    stem: 'During incident response, which Secure Endpoint action immediately stops a host from spreading malware while keeping it manageable?',
    options: opts4(
      'Endpoint isolation (network containment)',
      'Shutting down the SOC console',
      'Disabling the cloud connector',
      'Removing the host from DNS only'
    ),
    correct: ['a'],
    explanation: 'Endpoint isolation severs the host\'s network connectivity except the secure management channel, halting lateral spread/exfiltration while still permitting investigation and remediation.',
    references: [REF_AMP]
  },
  {
    domain: ENDPOINT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which integrated platform correlates Secure Endpoint detections with network, email, and cloud data for unified investigation and response?',
    options: opts4(
      'Cisco XDR / SecureX',
      'Cisco Prime LMS',
      'Cisco Config Pro',
      'Cisco Feature Navigator'
    ),
    correct: ['a'],
    explanation: 'Cisco XDR (and SecureX) aggregates and correlates telemetry across endpoint, network, email, and cloud, enabling unified investigation, automation, and orchestrated response.',
    references: [REF_AMP]
  },

  // ── Secure Network Access, Visibility, and Enforcement (9) ──
  {
    domain: ACCESS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which device acts as the authentication server in a Cisco 802.1X deployment?',
    options: opts4(
      'Cisco Identity Services Engine (ISE)',
      'The access switch',
      'The endpoint supplicant',
      'The DHCP server'
    ),
    correct: ['a'],
    explanation: 'Cisco ISE is the RADIUS authentication server that validates supplicant credentials and returns authorization. The switch is the authenticator; the endpoint is the supplicant.',
    references: [REF_ISE, REF_8021X]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which ISE feature allows employees to securely register and provision their personal devices for network access?',
    options: opts4(
      'BYOD onboarding (native supplicant/certificate provisioning)',
      'TACACS+ command authorization',
      'NetFlow export',
      'Spanning Tree'
    ),
    correct: ['a'],
    explanation: 'ISE BYOD onboarding provisions the native supplicant and issues device certificates so personal devices can be registered and granted appropriate, often segmented, access.',
    references: [REF_ISE, REF_ISE_ADMIN]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which ISE persona handles authentication/authorization requests (RADIUS/TACACS+) and policy evaluation?',
    options: opts4(
      'Policy Service Node (PSN)',
      'Monitoring (MnT) node only',
      'pxGrid node only',
      'NTP server'
    ),
    correct: ['a'],
    explanation: 'The Policy Service Node (PSN) processes access requests and evaluates policy; the Policy Administration Node manages configuration and the Monitoring node handles logging/reporting.',
    references: [REF_ISE_ADMIN, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A downloadable ACL (dACL) from ISE can be applied per-session to enforce granular access after authentication.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. ISE can return a downloadable ACL in the authorization result so the switch enforces per-session, identity-based filtering without pre-provisioning ACLs on every port.',
    references: [REF_ISE_ADMIN, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which SD-Access component automates fabric provisioning and provides assurance/telemetry while ISE supplies policy?',
    options: opts4(
      'Cisco Catalyst Center (DNA Center)',
      'Cisco Prime LMS',
      'A standalone TFTP server',
      'An out-of-band terminal server'
    ),
    correct: ['a'],
    explanation: 'In SD-Access, Cisco Catalyst Center (formerly DNA Center) automates the fabric and provides assurance, while ISE is the policy/identity engine driving SGT-based segmentation.',
    references: [REF_SDA, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which mechanism allows ISE to assign different access based on whether an endpoint passed posture checks?',
    options: opts4(
      'Posture-based authorization (compliant vs. non-compliant rules)',
      'STP cost adjustment',
      'GLBP weighting',
      'VTP pruning'
    ),
    correct: ['a'],
    explanation: 'ISE authorization rules can match the posture status so compliant endpoints get full access while non-compliant ones are quarantined/redirected for remediation, then re-evaluated.',
    references: [REF_POSTURE, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Stealthwatch data source is most commonly used to gain network-wide visibility for threat detection?',
    options: opts4(
      'NetFlow/IPFIX telemetry',
      'STP BPDUs',
      'CDP advertisements',
      'ARP requests'
    ),
    correct: ['a'],
    explanation: 'Stealthwatch consumes NetFlow/IPFIX (and other telemetry) from routers, switches, and firewalls to model behavior network-wide and detect anomalies indicative of threats.',
    references: [REF_STEALTHWATCH, REF_NETFLOW]
  },
  {
    domain: ACCESS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach segments users/devices by role using tags rather than VLAN/IP redesign?',
    options: opts4(
      'Cisco TrustSec with Security Group Tags',
      'Static routing only',
      'Spanning Tree tuning',
      'Proxy ARP'
    ),
    correct: ['a'],
    explanation: 'TrustSec assigns Security Group Tags based on identity/context and enforces SGACL policy between groups, enabling role-based segmentation without large-scale VLAN/IP re-architecture.',
    references: [REF_TRUSTSEC, REF_ISE]
  },
  {
    domain: ACCESS, difficulty: 4, type: QType.SINGLE,
    stem: 'Which capability lets ISE share endpoint context with FTD so firewall policy can be written using user/group identity?',
    options: opts4(
      'pxGrid identity sharing (ISE-FTD integration)',
      'CDP neighbor table',
      'VTP domain sync',
      'OSPF area 0'
    ),
    correct: ['a'],
    explanation: 'Via pxGrid, ISE shares session/identity context with FTD so access control rules can match users/groups (identity-based policy) and support rapid threat containment.',
    references: [REF_PXGRID, REF_ISE]
  }
];

const CCNP_SECURITY_DOMAINS = [
  { name: CONCEPTS, weight: 25 },
  { name: NETSEC, weight: 20 },
  { name: CLOUD, weight: 15 },
  { name: CONTENT, weight: 15 },
  { name: ENDPOINT, weight: 10 },
  { name: ACCESS, weight: 15 }
];

const CCNP_SECURITY_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'cisco-ccnp-security-350-701-p1',
    code: '350-701-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering security concepts, network security, securing the cloud, content security, endpoint protection, and secure network access.',
    questions: P1
  },
  {
    slug: 'cisco-ccnp-security-350-701-p2',
    code: '350-701-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'cisco-ccnp-security-350-701-p3',
    code: '350-701-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const CCNP_SECURITY_BUNDLE = {
  slug: 'cisco-ccnp-security-350-701',
  title: 'Cisco CCNP Security (SCOR 350-701)',
  description: 'Unlimited CCNP Security SCOR 350-701 practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering security concepts, network security, securing the cloud, content security, endpoint protection and detection, and secure network access, visibility, and enforcement, aligned to the Cisco 350-701 SCOR exam topics.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 40000 // USD 400 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CCNP Security bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:ccnp-security-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedCcnpSecurity(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'cisco' } });
  await db.vendor.upsert({
    where: { slug: 'cisco' },
    update: { name: 'Cisco', description: 'Cisco certifications — enterprise networking, security, and the CCNP Security (SCOR 350-701) credential.' },
    create: { slug: 'cisco', name: 'Cisco', description: 'Cisco certifications — enterprise networking, security, and the CCNP Security (SCOR 350-701) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'cisco' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of CCNP_SECURITY_EXAMS) {
    const title = `Cisco CCNP Security (SCOR 350-701) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Cisco 350-701 SCOR exam topics.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 120,
      passingScore: 80,
      questionCount: e.questions.length,
      domains: CCNP_SECURITY_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:ccnp-security-seed' } });
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
          generatedBy: 'manual:ccnp-security-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: CCNP_SECURITY_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CCNP_SECURITY_BUNDLE.slug },
    update: {
      title: CCNP_SECURITY_BUNDLE.title,
      description: CCNP_SECURITY_BUNDLE.description,
      price: CCNP_SECURITY_BUNDLE.price,
      priceVoucher: CCNP_SECURITY_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: CCNP_SECURITY_BUNDLE.slug,
      title: CCNP_SECURITY_BUNDLE.title,
      description: CCNP_SECURITY_BUNDLE.description,
      price: CCNP_SECURITY_BUNDLE.price,
      priceVoucher: CCNP_SECURITY_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'cisco-ccnp-security-350-701-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'cisco-ccnp-security-350-701-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'cisco-ccnp-security-350-701-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'cisco-ccnp-security-350-701-p1', tier: 'VOUCHER' as const, position: 4 }
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
