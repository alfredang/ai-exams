/**
 * ISC2 SSCP bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:sscp-seed'` and upserts catalog rows.
 *
 * Exported as `seedSscp(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/sscp.ts`) and the protected
 * admin API (`/api/admin/seed-sscp`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public ISC2 Systems Security
 * Certified Practitioner (SSCP) Exam Outline and standard operational
 * security practice (NIST SP 800-series, CISA). These are original,
 * scenario-based items — not real exam questions or braindumps.
 *
 *   - Security Operations and Administration              — 16% (10)
 *   - Access Controls                                     — 15% (10)
 *   - Risk Identification, Monitoring, and Analysis        — 15% (10)
 *   - Incident Response and Recovery                       — 14% (9)
 *   - Cryptography                                         — 9%  (6)
 *   - Network and Communications Security                  — 16% (10)
 *   - Systems and Application Security                      — 15% (10)
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

const OPS = 'Security Operations and Administration';
const AC = 'Access Controls';
const RISK = 'Risk Identification, Monitoring, and Analysis';
const IR = 'Incident Response and Recovery';
const CRYPTO = 'Cryptography';
const NET = 'Network and Communications Security';
const SYS = 'Systems and Application Security';

const REF_OUTLINE = { label: 'ISC2 — SSCP Exam Outline', url: 'https://www.isc2.org/certifications/sscp/sscp-certification-exam-outline' };
const REF_ETHICS = { label: 'ISC2 — Code of Ethics', url: 'https://www.isc2.org/ethics' };
const REF_800_53 = { label: 'NIST SP 800-53 Rev. 5 — Security and Privacy Controls', url: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final' };
const REF_800_61 = { label: 'NIST SP 800-61 — Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' };
const REF_800_63 = { label: 'NIST SP 800-63B — Digital Identity Guidelines: Authentication', url: 'https://pages.nist.gov/800-63-3/sp800-63b.html' };
const REF_800_57 = { label: 'NIST SP 800-57 Part 1 — Key Management Recommendations', url: 'https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final' };
const REF_800_175 = { label: 'NIST SP 800-175B — Guideline for Using Cryptographic Standards', url: 'https://csrc.nist.gov/pubs/sp/800/175/b/r1/final' };
const REF_800_30 = { label: 'NIST SP 800-30 — Guide for Conducting Risk Assessments', url: 'https://csrc.nist.gov/pubs/sp/800/30/r1/final' };
const REF_800_37 = { label: 'NIST SP 800-37 Rev. 2 — Risk Management Framework', url: 'https://csrc.nist.gov/pubs/sp/800/37/r2/final' };
const REF_800_92 = { label: 'NIST SP 800-92 — Guide to Computer Security Log Management', url: 'https://csrc.nist.gov/pubs/sp/800/92/final' };
const REF_800_94 = { label: 'NIST SP 800-94 — Guide to Intrusion Detection and Prevention Systems', url: 'https://csrc.nist.gov/pubs/sp/800/94/final' };
const REF_800_41 = { label: 'NIST SP 800-41 Rev. 1 — Guidelines on Firewalls and Firewall Policy', url: 'https://csrc.nist.gov/pubs/sp/800/41/r1/final' };
const REF_800_77 = { label: 'NIST SP 800-77 Rev. 1 — Guide to IPsec VPNs', url: 'https://csrc.nist.gov/pubs/sp/800/77/r1/final' };
const REF_800_52 = { label: 'NIST SP 800-52 Rev. 2 — Guidelines for TLS Implementations', url: 'https://csrc.nist.gov/pubs/sp/800/52/r2/final' };
const REF_800_40 = { label: 'NIST SP 800-40 Rev. 4 — Guide to Enterprise Patch Management', url: 'https://csrc.nist.gov/pubs/sp/800/40/r4/final' };
const REF_800_83 = { label: 'NIST SP 800-83 — Guide to Malware Incident Prevention and Handling', url: 'https://csrc.nist.gov/pubs/sp/800/83/r1/final' };
const REF_800_34 = { label: 'NIST SP 800-34 Rev. 1 — Contingency Planning Guide', url: 'https://csrc.nist.gov/pubs/sp/800/34/r1/final' };
const REF_800_88 = { label: 'NIST SP 800-88 Rev. 1 — Guidelines for Media Sanitization', url: 'https://csrc.nist.gov/pubs/sp/800/88/r1/final' };
const REF_800_162 = { label: 'NIST SP 800-162 — Guide to Attribute Based Access Control (ABAC)', url: 'https://csrc.nist.gov/pubs/sp/800/162/final' };
const REF_800_207 = { label: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final' };
const REF_800_115 = { label: 'NIST SP 800-115 — Technical Guide to Information Security Testing', url: 'https://csrc.nist.gov/pubs/sp/800/115/final' };
const REF_800_184 = { label: 'NIST SP 800-184 — Guide for Cybersecurity Event Recovery', url: 'https://csrc.nist.gov/pubs/sp/800/184/final' };
const REF_CISA_RANSOM = { label: 'CISA — Stop Ransomware Guide', url: 'https://www.cisa.gov/stopransomware/ransomware-guide' };
const REF_CISA_PHISH = { label: 'CISA — Avoiding Social Engineering and Phishing Attacks', url: 'https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks' };
const REF_CISA_MFA = { label: 'CISA — Implementing Phishing-Resistant MFA', url: 'https://www.cisa.gov/resources-tools/resources/implementing-phishing-resistant-mfa' };
const REF_CISA_IR = { label: 'CISA — Incident Response Resources', url: 'https://www.cisa.gov/resources-tools/resources/federal-government-cybersecurity-incident-and-vulnerability-response-playbooks' };
const REF_CISA_ZT = { label: 'CISA — Zero Trust Maturity Model', url: 'https://www.cisa.gov/zero-trust-maturity-model' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [
  { id: 'a', text: 'True' }, { id: 'b', text: 'False' },
  { id: 'c', text: 'Cannot be determined' }, { id: 'd', text: 'Only in regulated industries' }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Security Operations and Administration (10) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new analyst is granted exactly the system rights needed to run vulnerability scans and nothing else. Which core security principle does this best illustrate?',
    options: opts4(
      'Defense in depth',
      'Least privilege',
      'Security through obscurity',
      'Separation of duties'
    ),
    correct: ['b'],
    explanation: 'Least privilege means giving a subject only the minimum access required to perform assigned duties, reducing the attack surface and limiting damage from compromise or error. Defense in depth is about layered controls; separation of duties splits a task among people.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A finance process requires that the person who creates a vendor payment cannot also approve it. Which control is being enforced?',
    options: opts4(
      'Least privilege',
      'Separation (segregation) of duties',
      'Mandatory vacation',
      'Job rotation'
    ),
    correct: ['b'],
    explanation: 'Separation of duties divides a critical transaction so no single individual can complete it alone, reducing fraud and error. It differs from least privilege (minimum rights) and from job rotation (moving staff between roles).',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are typically governed by a formal change management process.',
    options: opts4(
      'Production firewall rule modifications',
      'Operating system patch deployment to servers',
      'An employee reading their own email',
      'Application configuration changes in production'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Change management governs modifications that could affect the security or availability of production systems — firewall rules, patches, and config changes all qualify and need review, approval, testing, and rollback plans. Routine user activity such as reading email is not a managed change.',
    references: [REF_800_53, REF_800_40]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization classifies data as Public, Internal, Confidential, and Restricted. What is the primary purpose of this data classification scheme?',
    options: opts4(
      'To make data easier to compress for backups',
      'To apply protection and handling controls proportional to the data’s sensitivity and value',
      'To guarantee that all data is encrypted at rest',
      'To remove the need for access controls on Public data'
    ),
    correct: ['b'],
    explanation: 'Classification lets an organization apply handling, labeling, storage, and protection controls that are proportional to the sensitivity and business value of the information, ensuring resources are spent where risk is highest.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A security policy states "all remote access must use multifactor authentication." A standard then specifies "use FIDO2 hardware authenticators." How do the policy and standard relate?',
    options: opts4(
      'The standard is optional guidance; the policy is mandatory',
      'The policy sets the mandatory high-level requirement; the standard specifies the mandatory technology to meet it',
      'They are interchangeable terms',
      'The standard overrides and weakens the policy'
    ),
    correct: ['b'],
    explanation: 'A policy is a high-level mandatory directive. A standard is a mandatory, specific implementation requirement that supports the policy. Guidelines are the discretionary, recommended documents.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: According to the ISC2 Code of Ethics, a member may secretly exploit a discovered vulnerability for personal financial gain.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. The ISC2 Code of Ethics canons require members to act honorably, honestly, and in the best interest of society and principals — exploiting findings for personal advantage violates these obligations.',
    references: [REF_ETHICS]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'An administrator must occasionally use elevated rights to patch a database. The security team wants those rights granted only for the maintenance window and automatically revoked afterward. Which approach best meets this need?',
    options: opts4(
      'Permanently add the admin to the Domain Admins group',
      'Just-in-time (JIT) privileged access with time-bound elevation',
      'Share a static root password with the team',
      'Disable logging during the maintenance window'
    ),
    correct: ['b'],
    explanation: 'Just-in-time privileged access grants elevated rights only for a defined window and automatically revokes them, minimizing standing privilege and the window of exposure. Permanent membership or shared static credentials violate least privilege and accountability.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'During offboarding, a departing employee’s accounts should be handled in what way to best preserve security and accountability?',
    options: opts4(
      'Delete all accounts immediately so no trace remains',
      'Disable the accounts promptly and retain them per the data-retention policy for investigation/audit',
      'Leave the accounts active for 90 days in case the employee returns',
      'Reset the password and share it with the team'
    ),
    correct: ['b'],
    explanation: 'Prompt disablement removes access while retaining the account and associated logs/data per retention policy supports audit, investigations, and accountability. Immediate deletion can destroy evidence; leaving accounts active is an unnecessary risk.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A service provider commits in a contract to 99.9% monthly availability with defined remedies if the target is missed. This document is best described as a:',
    options: opts4(
      'Memorandum of understanding (MOU)',
      'Service level agreement (SLA)',
      'Non-disclosure agreement (NDA)',
      'Acceptable use policy (AUP)'
    ),
    correct: ['b'],
    explanation: 'A service level agreement defines measurable service expectations (such as availability) and the remedies or penalties when they are not met. An MOU is a non-binding statement of intent; an NDA covers confidentiality; an AUP governs user behavior.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Security awareness training is delivered to all staff annually and reinforced with simulated phishing. Which control category does this represent?',
    options: opts4(
      'Technical (logical) control',
      'Administrative (managerial) control',
      'Physical control',
      'Compensating cryptographic control'
    ),
    correct: ['b'],
    explanation: 'Awareness training is an administrative (managerial) control — a policy- and people-oriented safeguard. Technical controls are implemented in hardware/software; physical controls protect facilities.',
    references: [REF_800_53, REF_CISA_PHISH]
  },

  // ── Access Controls (10) ──
  {
    domain: AC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user enters a username and password, then approves a push notification on a registered phone. Which two authentication factor categories are combined here?',
    options: opts4(
      'Something you know and something you are',
      'Something you know and something you have',
      'Something you have and something you are',
      'Somewhere you are and something you know'
    ),
    correct: ['b'],
    explanation: 'A password is "something you know"; the registered phone that receives/approves the push is "something you have." Combining two different categories provides multifactor authentication.',
    references: [REF_800_63, REF_CISA_MFA]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'In a system where the data owner sets permissions and a discretionary ACL on each file controls who may read or write it, which access control model is in use?',
    options: opts4(
      'Mandatory access control (MAC)',
      'Discretionary access control (DAC)',
      'Rule-based access control',
      'Attribute-based access control (ABAC)'
    ),
    correct: ['b'],
    explanation: 'Discretionary access control lets the resource owner grant or revoke access at their discretion, typically via ACLs. MAC uses system-enforced labels/clearances the owner cannot override; ABAC evaluates attributes/policies.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'A defense system labels documents Top Secret/Secret/Confidential and grants access only when a subject’s clearance dominates the object label and need-to-know applies. The owner cannot override these rules. Which model is this?',
    options: opts4(
      'Discretionary access control',
      'Mandatory access control (MAC)',
      'Role-based access control',
      'Identity-based access control'
    ),
    correct: ['b'],
    explanation: 'Mandatory access control enforces access via system-assigned security labels and clearances that users (including owners) cannot change, with decisions based on label dominance and need-to-know — typical of multilevel-secure government systems.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A hospital assigns permissions to job functions such as "Nurse," "Physician," and "Billing Clerk," and users inherit rights by being placed in the appropriate function. This is an example of:',
    options: opts4(
      'Role-based access control (RBAC)',
      'Discretionary access control',
      'Mandatory access control',
      'Context-based access control'
    ),
    correct: ['a'],
    explanation: 'Role-based access control assigns permissions to roles that map to job functions; users acquire permissions through role membership, simplifying administration and supporting least privilege at scale.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'An access decision is computed from policy rules that evaluate subject attributes (department, clearance), resource attributes (sensitivity), and environment (time of day, network). Which model is described?',
    options: opts4(
      'Attribute-based access control (ABAC)',
      'Role-based access control',
      'Discretionary access control',
      'Bell-LaPadula only'
    ),
    correct: ['a'],
    explanation: 'Attribute-based access control makes dynamic decisions by evaluating policies against attributes of the subject, resource, action, and environment, enabling fine-grained, context-aware authorization.',
    references: [REF_800_162, REF_800_207]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'After logging in to the identity provider once, a user accesses email, HR, and the wiki without re-entering credentials. Which capability is this?',
    options: opts4(
      'Federation by SAML assertion replay',
      'Single sign-on (SSO)',
      'Credential stuffing',
      'Privilege escalation'
    ),
    correct: ['b'],
    explanation: 'Single sign-on lets a user authenticate once and gain access to multiple applications without re-authenticating, improving usability while centralizing authentication for stronger control.',
    references: [REF_800_63, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL of the following that are valid steps in the identity and access management (IAM) lifecycle.',
    options: opts4(
      'Provisioning (account creation and entitlement assignment)',
      'Periodic access review and recertification',
      'Deprovisioning on role change or termination',
      'Disabling all logging to speed up access requests'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The IAM lifecycle includes provisioning, ongoing entitlement review/recertification, and timely deprovisioning when roles change or users leave. Disabling logging would destroy accountability and is never a valid IAM step.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'A zero trust architecture is being adopted. Which statement best reflects a core zero trust tenet?',
    options: opts4(
      'Devices on the internal LAN are inherently trusted',
      'Trust is never implicit; every request is authenticated, authorized, and continuously evaluated regardless of network location',
      'A single perimeter firewall is sufficient to enforce zero trust',
      'Once authenticated, a session is trusted indefinitely'
    ),
    correct: ['b'],
    explanation: 'Zero trust eliminates implicit trust based on network location. Each access request is authenticated and authorized using least privilege, and trust is continually re-evaluated with device and context signals throughout the session.',
    references: [REF_800_207, REF_CISA_ZT]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A biometric reader rejects an enrolled, legitimate user. This error is best described as the:',
    options: opts4(
      'False acceptance rate (FAR / Type II error)',
      'False rejection rate (FRR / Type I error)',
      'Crossover error rate (CER)',
      'Equal error tolerance'
    ),
    correct: ['b'],
    explanation: 'A false rejection (Type I error) occurs when a biometric system denies an authorized, enrolled user. A false acceptance (Type II error) admits an impostor. The crossover error rate is where FAR and FRR are equal and is a measure of overall accuracy.',
    references: [REF_800_63, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization wants phishing-resistant authentication for high-risk admins. Which option best meets that goal?',
    options: opts4(
      'SMS one-time passcodes',
      'FIDO2/WebAuthn hardware security keys',
      'Security questions',
      'A reused complex password'
    ),
    correct: ['b'],
    explanation: 'FIDO2/WebAuthn hardware authenticators are phishing-resistant because the credential is cryptographically bound to the legitimate origin and cannot be replayed to a fake site. SMS OTPs and knowledge factors are susceptible to phishing and interception.',
    references: [REF_CISA_MFA, REF_800_63]
  },

  // ── Risk Identification, Monitoring, and Analysis (10) ──
  {
    domain: RISK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In quantitative risk analysis, what does Single Loss Expectancy (SLE) represent?',
    options: opts4(
      'The expected monetary loss from a single occurrence of a threat (Asset Value × Exposure Factor)',
      'The number of times a threat occurs per year',
      'The total cost of all controls',
      'The residual risk after mitigation'
    ),
    correct: ['a'],
    explanation: 'SLE = Asset Value × Exposure Factor and is the expected loss from one occurrence of a threat. Annualized Loss Expectancy (ALE) = SLE × Annualized Rate of Occurrence (ARO).',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'A server has an asset value of $50,000. A flood would destroy 40% of its value and occurs once every 25 years. What is the Annualized Loss Expectancy (ALE)?',
    options: opts4(
      '$20,000',
      '$800',
      '$2,000',
      '$500,000'
    ),
    correct: ['b'],
    explanation: 'SLE = $50,000 × 0.40 = $20,000. ARO = 1/25 = 0.04. ALE = SLE × ARO = $20,000 × 0.04 = $800. ALE guides how much is justified to spend on a safeguard.',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'After applying all selected controls, some risk remains. The organization decides to formally accept it. This remaining risk is called:',
    options: opts4(
      'Inherent risk',
      'Residual risk',
      'Total risk',
      'Risk appetite'
    ),
    correct: ['b'],
    explanation: 'Residual risk is what remains after controls are applied. Inherent risk is the risk before controls. Risk appetite is the amount of risk leadership is willing to accept; acceptance of residual risk should fall within that appetite.',
    references: [REF_800_30, REF_800_37]
  },
  {
    domain: RISK, difficulty: 2, type: QType.SINGLE,
    stem: 'An organization buys cyber-insurance to cover potential breach costs. Which risk treatment is this?',
    options: opts4(
      'Risk avoidance',
      'Risk transference',
      'Risk acceptance',
      'Risk mitigation'
    ),
    correct: ['b'],
    explanation: 'Purchasing insurance transfers the financial impact of a risk to a third party (the insurer). Avoidance eliminates the activity; acceptance retains the risk; mitigation reduces likelihood or impact with controls.',
    references: [REF_800_30, REF_800_37]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A weakness in a web application that could be exploited by an attacker is best classified as a:',
    options: opts4(
      'Threat',
      'Vulnerability',
      'Risk',
      'Control'
    ),
    correct: ['b'],
    explanation: 'A vulnerability is a weakness that could be exploited. A threat is the potential agent/event that could exploit it. Risk is the likelihood and impact of a threat exploiting a vulnerability; a control reduces that risk.',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 4, type: QType.SINGLE,
    stem: 'During monitoring, an analyst notices the SIEM is generating thousands of low-value alerts daily, causing staff to ignore them. The best immediate improvement is to:',
    options: opts4(
      'Disable the SIEM to stop the noise',
      'Tune correlation rules and thresholds and prioritize by risk to reduce false positives',
      'Forward every alert to executives',
      'Delete historical logs to save space'
    ),
    correct: ['b'],
    explanation: 'Alert fatigue from excessive false positives degrades detection. Tuning correlation rules, thresholds, and risk-based prioritization improves signal-to-noise so genuine incidents are not missed. Disabling monitoring or deleting logs harms security and accountability.',
    references: [REF_800_92, REF_800_94]
  },
  {
    domain: RISK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL activities that are part of continuous security monitoring.',
    options: opts4(
      'Collecting and correlating logs from systems and security devices',
      'Reviewing alerts and analyzing anomalies against a baseline',
      'Periodic vulnerability scanning and tracking remediation',
      'Permanently disabling audit logging to improve performance'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Continuous monitoring aggregates and correlates logs, analyzes anomalies against an established baseline, and tracks vulnerabilities/remediation over time. Disabling audit logging removes the evidence monitoring depends on and is never appropriate.',
    references: [REF_800_92, REF_800_37]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'A penetration test is performed with no prior knowledge of the target environment and no internal credentials provided. This is best described as a:',
    options: opts4(
      'White-box test',
      'Black-box test',
      'Credentialed scan',
      'Configuration review'
    ),
    correct: ['b'],
    explanation: 'A black-box test simulates an external attacker with no internal knowledge or credentials. White-box testing provides full information; a credentialed scan and configuration review use internal access and are not adversarial simulations.',
    references: [REF_800_115, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document records identified risks along with their owners, likelihood, impact, and treatment decisions?',
    options: opts4(
      'Risk register',
      'System security plan',
      'Acceptable use policy',
      'Network diagram'
    ),
    correct: ['a'],
    explanation: 'A risk register is the central record of identified risks, their assessed likelihood and impact, assigned owners, and chosen treatment, providing traceability for governance and monitoring.',
    references: [REF_800_30, REF_800_37]
  },
  {
    domain: RISK, difficulty: 4, type: QType.SINGLE,
    stem: 'A vulnerability scan reports a "critical" finding on a server, but investigation shows the vulnerable service is not installed. This scanner result is a:',
    options: opts4(
      'True positive',
      'False positive',
      'False negative',
      'True negative'
    ),
    correct: ['b'],
    explanation: 'A false positive is an alert/finding that indicates a problem that does not actually exist. Validation of scan output is essential to avoid wasting remediation effort and to maintain confidence in the monitoring program.',
    references: [REF_800_115, REF_800_94]
  },

  // ── Incident Response and Recovery (9) ──
  {
    domain: IR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'According to the NIST incident response life cycle, which phase comes immediately after Detection and Analysis?',
    options: opts4(
      'Preparation',
      'Containment, Eradication, and Recovery',
      'Lessons Learned only',
      'Risk acceptance'
    ),
    correct: ['b'],
    explanation: 'NIST SP 800-61 defines the phases as Preparation; Detection and Analysis; Containment, Eradication, and Recovery; and Post-Incident Activity. Containment follows detection and analysis to limit damage before eradication and recovery.',
    references: [REF_800_61, REF_CISA_IR]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'A workstation is actively communicating with a known command-and-control server. The single most appropriate immediate action is to:',
    options: opts4(
      'Reimage the machine right away to remove malware',
      'Isolate/contain the host from the network to stop further compromise and preserve evidence',
      'Email all staff about the infection',
      'Wait until the end-of-day maintenance window'
    ),
    correct: ['b'],
    explanation: 'Containment (e.g., network isolation) is the priority once active malicious communication is confirmed: it stops spread and data exfiltration while preserving volatile evidence for analysis. Immediate reimaging would destroy evidence before investigation.',
    references: [REF_800_61, REF_800_83]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'When collecting volatile evidence from a live compromised host, what is the correct general principle for collection order?',
    options: opts4(
      'Collect disk images first, then memory',
      'Collect the most volatile data first (e.g., RAM, running processes) before less volatile data (e.g., disk)',
      'Power off the system immediately, then collect everything',
      'Order does not matter for forensic validity'
    ),
    correct: ['b'],
    explanation: 'The order of volatility dictates collecting the most ephemeral data first (memory, running processes, network connections) before stable data (disk), because volatile data is lost on power-off. Maintaining chain of custody is also essential.',
    references: [REF_800_61, REF_800_115]
  },
  {
    domain: IR, difficulty: 2, type: QType.SINGLE,
    stem: 'A disaster recovery plan states the database must be restored within 4 hours of an outage. This 4-hour target is the:',
    options: opts4(
      'Recovery Point Objective (RPO)',
      'Recovery Time Objective (RTO)',
      'Maximum Tolerable Downtime baseline',
      'Mean Time Between Failures (MTBF)'
    ),
    correct: ['b'],
    explanation: 'The Recovery Time Objective is the maximum acceptable time to restore a system/service after disruption. The Recovery Point Objective is the maximum acceptable data loss measured in time (how far back the last good backup must be).',
    references: [REF_800_34, REF_800_184]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A backup policy requires that no more than 15 minutes of transactions may be lost in a disaster. This requirement defines the:',
    options: opts4(
      'Recovery Time Objective (RTO)',
      'Recovery Point Objective (RPO)',
      'Service level agreement',
      'Mean time to repair (MTTR)'
    ),
    correct: ['b'],
    explanation: 'The Recovery Point Objective expresses the maximum tolerable data loss in time; a 15-minute RPO means backups/replication must be frequent enough that at most 15 minutes of data is lost.',
    references: [REF_800_34, REF_800_184]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'A server room is destroyed. The organization activates a pre-configured site with hardware, current data replication, and connectivity that can take over operations within minutes. This is a:',
    options: opts4(
      'Cold site',
      'Warm site',
      'Hot site',
      'Mobile parking site'
    ),
    correct: ['c'],
    explanation: 'A hot site is fully equipped and continuously synchronized so operations can resume almost immediately. A cold site is space/power only; a warm site has some equipment but requires configuration and data restoration before use.',
    references: [REF_800_34, REF_800_184]
  },
  {
    domain: IR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL activities that belong in the post-incident (lessons learned) phase.',
    options: opts4(
      'Documenting root cause and timeline',
      'Updating playbooks, controls, and detection rules based on findings',
      'Briefing stakeholders and improving training',
      'Deleting all incident logs to close the case quickly'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Post-incident activity captures root cause and timeline, feeds improvements back into controls/playbooks/detection, and informs stakeholders and training. Destroying logs would eliminate evidence and the basis for improvement.',
    references: [REF_800_61, REF_800_184]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'During a ransomware incident, before restoring systems from backup, the response team should FIRST:',
    options: opts4(
      'Pay the ransom to obtain the decryption key',
      'Ensure the malware is eradicated and backups are verified clean and offline so restoration does not reinfect',
      'Restore immediately to minimize downtime',
      'Disable all backups to prevent encryption'
    ),
    correct: ['b'],
    explanation: 'Restoring before eradication risks reinfection from residual malware or compromised backups. Best practice is to eradicate the threat, validate that backups are clean and were isolated/offline, then restore. Paying the ransom is discouraged and does not guarantee recovery.',
    references: [REF_CISA_RANSOM, REF_800_184]
  },
  {
    domain: IR, difficulty: 2, type: QType.SINGLE,
    stem: 'A tabletop exercise walks the incident response team through a simulated breach scenario via discussion. Its primary purpose is to:',
    options: opts4(
      'Replace the need for any written plan',
      'Validate roles, decisions, and the response plan and surface gaps before a real incident',
      'Patch vulnerable systems automatically',
      'Generate marketing materials'
    ),
    correct: ['b'],
    explanation: 'Tabletop exercises test the plan and team readiness through guided discussion, exposing gaps in roles, communications, and procedures so they can be fixed before an actual incident occurs.',
    references: [REF_800_61, REF_CISA_IR]
  },

  // ── Cryptography (6) ──
  {
    domain: CRYPTO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which cryptographic service ensures that data has not been altered in transit or storage?',
    options: opts4(
      'Confidentiality',
      'Integrity',
      'Availability',
      'Anonymity'
    ),
    correct: ['b'],
    explanation: 'Integrity protections (e.g., cryptographic hashes, HMACs, digital signatures) let a recipient detect unauthorized modification of data. Confidentiality protects against disclosure; availability ensures access.',
    references: [REF_800_175, REF_OUTLINE]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE,
    stem: 'Alice encrypts a message with Bob’s public key so only Bob can read it. Which property and key does this provide?',
    options: opts4(
      'Confidentiality, decrypted with Bob’s private key',
      'Integrity, decrypted with Alice’s public key',
      'Non-repudiation, decrypted with Alice’s private key',
      'Availability, decrypted with a shared symmetric key'
    ),
    correct: ['a'],
    explanation: 'In asymmetric encryption, encrypting with the recipient’s public key provides confidentiality because only the holder of the matching private key (Bob) can decrypt the message.',
    references: [REF_800_175, REF_800_57]
  },
  {
    domain: CRYPTO, difficulty: 4, type: QType.SINGLE,
    stem: 'To provide both sender authenticity and integrity for a document, Alice creates a digital signature. What does she sign with?',
    options: opts4(
      'Bob’s public key',
      'Her own private key (signing a hash of the document)',
      'A shared symmetric session key',
      'Bob’s private key'
    ),
    correct: ['b'],
    explanation: 'A digital signature is produced by hashing the document and encrypting that hash with the signer’s private key. Anyone can verify it with the signer’s public key, providing integrity, authenticity, and non-repudiation.',
    references: [REF_800_175, REF_800_57]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which algorithm is a symmetric block cipher widely recommended for protecting data confidentiality at rest?',
    options: opts4(
      'RSA',
      'AES (e.g., AES-256)',
      'SHA-256',
      'Diffie-Hellman'
    ),
    correct: ['b'],
    explanation: 'AES is a symmetric block cipher used for bulk data confidentiality. RSA and Diffie-Hellman are asymmetric (key exchange/encryption/signing); SHA-256 is a hash function, not an encryption algorithm.',
    references: [REF_800_175, REF_800_57]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A certificate authority is compromised and several issued certificates must be invalidated before expiry. Which mechanism communicates that a certificate is no longer trusted?',
    options: opts4(
      'A longer key length',
      'A Certificate Revocation List (CRL) or OCSP',
      'A self-signed certificate',
      'A stronger hash algorithm'
    ),
    correct: ['b'],
    explanation: 'Certificate Revocation Lists and the Online Certificate Status Protocol (OCSP) let relying parties learn that a certificate has been revoked before its scheduled expiration, which is essential after CA or key compromise.',
    references: [REF_800_57, REF_800_52]
  },
  {
    domain: CRYPTO, difficulty: 4, type: QType.SINGLE,
    stem: 'Why is proper cryptographic key management (generation, storage, rotation, destruction) critical to a cryptosystem’s strength?',
    options: opts4(
      'Algorithms are secret, so keys are unimportant',
      'The security of a well-designed cryptosystem depends on protecting the keys, not the secrecy of the algorithm',
      'Keys never need to be rotated or destroyed',
      'Key management only matters for hashing'
    ),
    correct: ['b'],
    explanation: 'Per Kerckhoffs’s principle, modern cryptosystem security rests on key secrecy and proper key management, not algorithm secrecy. Weak generation, exposed storage, or never rotating/destroying keys undermines even strong algorithms.',
    references: [REF_800_57, REF_800_175]
  },

  // ── Network and Communications Security (10) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A stateful inspection firewall differs from a simple packet filter primarily because it:',
    options: opts4(
      'Inspects only the source IP address',
      'Tracks connection state and only allows packets that belong to an established, legitimate session',
      'Encrypts all traffic by default',
      'Operates only at the physical layer'
    ),
    correct: ['b'],
    explanation: 'A stateful firewall maintains a state table of active connections and permits packets that are part of an established/expected session, providing stronger control than a stateless filter that evaluates each packet in isolation.',
    references: [REF_800_41, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Internet-facing web and mail servers are placed in a screened subnet between two firewalls, separated from the internal LAN. This network segment is commonly called a:',
    options: opts4(
      'VLAN trunk',
      'DMZ (demilitarized zone / screened subnet)',
      'Loopback interface',
      'Broadcast domain'
    ),
    correct: ['b'],
    explanation: 'A DMZ/screened subnet hosts services that must be reachable from the Internet while isolating them from the internal network, so a compromise of a public-facing host does not directly expose internal systems.',
    references: [REF_800_41, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'An intrusion prevention system (IPS) differs from an intrusion detection system (IDS) primarily because the IPS:',
    options: opts4(
      'Only logs events for later review',
      'Is placed inline and can actively block or drop malicious traffic in real time',
      'Cannot use signatures',
      'Operates only on encrypted traffic'
    ),
    correct: ['b'],
    explanation: 'An IDS detects and alerts on suspicious activity but does not stop it. An IPS is deployed inline and can take active prevention actions such as dropping or blocking malicious packets in real time.',
    references: [REF_800_94, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'A site-to-site VPN must protect confidentiality and integrity of IP traffic between two offices over the Internet. Which protocol suite is the standard choice?',
    options: opts4(
      'IPsec (ESP/IKE)',
      'SNMPv2c',
      'Telnet',
      'FTP'
    ),
    correct: ['a'],
    explanation: 'IPsec, using ESP for confidentiality/integrity and IKE for authenticated key exchange, is the standard for securing site-to-site VPN tunnels at the network layer. Telnet, FTP, and SNMPv2c provide no strong protection.',
    references: [REF_800_77, REF_800_41]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which protocol provides confidentiality and integrity for web traffic by securing HTTP, and should use modern versions only?',
    options: opts4(
      'TLS (HTTPS)',
      'SSLv3',
      'HTTP with Basic Auth',
      'WEP'
    ),
    correct: ['a'],
    explanation: 'TLS secures HTTP as HTTPS, providing confidentiality, integrity, and server authentication. Legacy SSL and SSLv3 are deprecated and insecure; modern TLS versions and cipher suites should be enforced.',
    references: [REF_800_52, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A network is divided into separate VLANs for finance, HR, and guests, with inter-VLAN traffic filtered by ACLs. The main security benefit is:',
    options: opts4(
      'Faster internet download speeds',
      'Network segmentation that limits lateral movement and contains the blast radius of a compromise',
      'Elimination of the need for authentication',
      'Automatic data encryption between VLANs'
    ),
    correct: ['b'],
    explanation: 'Segmentation with VLANs and filtering restricts which systems can communicate, reducing lateral movement and containing the impact of a compromised host. It does not by itself provide encryption or remove the need for authentication.',
    references: [REF_800_41, REF_800_207]
  },
  {
    domain: NET, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL controls that help defend against a distributed denial-of-service (DDoS) attack.',
    options: opts4(
      'Upstream/cloud-based DDoS scrubbing or mitigation services',
      'Rate limiting and traffic filtering at the network edge',
      'Sufficient bandwidth and scalable, redundant capacity',
      'Disabling all logging during the attack'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DDoS resilience combines upstream scrubbing/mitigation, edge rate limiting and filtering, and scalable redundant capacity to absorb volumetric load. Disabling logging removes the visibility needed to detect and analyze the attack.',
    references: [REF_800_41, REF_CISA_IR]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A wireless network must use a current, strong security protocol. Which option should be selected?',
    options: opts4(
      'WEP',
      'WPA3 (or WPA2-Enterprise where WPA3 is unavailable)',
      'Open network with a hidden SSID',
      'WPA-TKIP only'
    ),
    correct: ['b'],
    explanation: 'WPA3 provides modern wireless protection; WPA2-Enterprise with strong EAP is acceptable where WPA3 is not available. WEP and WPA-TKIP are broken/deprecated, and hiding the SSID is not a security control.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Network Access Control (NAC) is deployed so devices must pass a posture check (patch level, antivirus) before joining the corporate network. The primary benefit is:',
    options: opts4(
      'Faster DNS resolution',
      'Enforcing endpoint compliance and restricting non-compliant or unknown devices from accessing the network',
      'Encrypting all stored data',
      'Eliminating the need for firewalls'
    ),
    correct: ['b'],
    explanation: 'NAC evaluates device identity and health posture before granting network access, quarantining or restricting non-compliant or unknown endpoints to reduce the risk they introduce.',
    references: [REF_800_207, REF_CISA_ZT]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker on the same LAN sends forged ARP replies so traffic destined for the gateway is routed through the attacker. This attack is:',
    options: opts4(
      'DNS tunneling',
      'ARP cache poisoning (spoofing) enabling a man-in-the-middle',
      'A SYN flood',
      'Cross-site scripting'
    ),
    correct: ['b'],
    explanation: 'ARP spoofing/poisoning injects forged ARP mappings so the attacker becomes a man-in-the-middle for LAN traffic. Mitigations include dynamic ARP inspection, port security, and encryption of traffic.',
    references: [REF_800_94, REF_800_41]
  },

  // ── Systems and Application Security (10) ──
  {
    domain: SYS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which type of malware disguises itself as legitimate software to trick a user into executing it, then performs hidden malicious actions?',
    options: opts4(
      'Worm',
      'Trojan horse',
      'Logic bomb',
      'Rootkit'
    ),
    correct: ['b'],
    explanation: 'A Trojan horse masquerades as benign or useful software to induce execution, then carries out malicious activity. A worm self-propagates; a logic bomb triggers on a condition; a rootkit hides its presence at a low level.',
    references: [REF_800_83, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'A web form passes user input directly into a SQL query so an attacker can read other users’ records by entering crafted input. The most effective prevention is to:',
    options: opts4(
      'Hide the error messages only',
      'Use parameterized queries / prepared statements and validate input',
      'Increase the database server’s RAM',
      'Rename the database tables'
    ),
    correct: ['b'],
    explanation: 'SQL injection is prevented primarily by parameterized queries/prepared statements (and input validation/least-privilege DB accounts) so user input is treated strictly as data, never executable SQL.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker injects a malicious script into a comment field; it later runs in other visitors’ browsers. This vulnerability class is:',
    options: opts4(
      'Cross-site scripting (XSS)',
      'Buffer overflow',
      'Race condition',
      'Privilege escalation'
    ),
    correct: ['a'],
    explanation: 'Cross-site scripting occurs when untrusted input is rendered as executable script in other users’ browsers. Output encoding, input validation, and a Content Security Policy are key defenses.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'A critical vulnerability is announced for an internet-facing application. Following good patch management, the security team should:',
    options: opts4(
      'Ignore it because the system has a firewall',
      'Assess applicability and risk, test the patch, then deploy it on a prioritized, expedited schedule with rollback planned',
      'Apply the patch directly to production without testing or approval',
      'Wait for the annual maintenance cycle'
    ),
    correct: ['b'],
    explanation: 'Risk-based patch management assesses applicability/exposure, tests the fix, then deploys on a prioritized schedule (expedited for critical, internet-facing systems) with change control and rollback. Untested production patching and indefinite delay are both poor practice.',
    references: [REF_800_40, REF_800_53]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Removing unnecessary services, closing unused ports, and disabling default accounts on a server is collectively known as:',
    options: opts4(
      'Fuzzing',
      'System hardening (reducing the attack surface)',
      'Load balancing',
      'Steganography'
    ),
    correct: ['b'],
    explanation: 'System hardening reduces the attack surface by removing or disabling unneeded services, ports, accounts, and software, and applying secure configuration baselines.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'A laptop hard drive is being retired and contained Confidential data. To prevent data remanence, the organization should:',
    options: opts4(
      'Move files to the recycle bin and empty it',
      'Securely sanitize the media (cryptographic erase, purge, or physical destruction) per a media sanitization standard',
      'Quick-format the drive once',
      'Rename the files'
    ),
    correct: ['b'],
    explanation: 'Deleting or quick-formatting leaves recoverable data (remanence). Proper sanitization — clear, purge (e.g., cryptographic erase), or destroy per NIST SP 800-88 — ensures the data cannot be reconstructed.',
    references: [REF_800_88, REF_800_53]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'Endpoint detection and response (EDR) primarily improves security by:',
    options: opts4(
      'Replacing the need for backups',
      'Continuously monitoring endpoint behavior to detect, investigate, and respond to threats including fileless and post-exploitation activity',
      'Encrypting all network traffic',
      'Blocking only known file hashes and nothing else'
    ),
    correct: ['b'],
    explanation: 'EDR continuously records and analyzes endpoint behavior to detect malicious or anomalous activity (including fileless and post-exploitation techniques) and supports investigation and response, going beyond signature-only antivirus.',
    references: [REF_800_83, REF_800_94]
  },
  {
    domain: SYS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that improve the security of virtualized and cloud workloads.',
    options: opts4(
      'Patching and hardening hypervisors and guest images',
      'Strong isolation/segmentation between tenants or workloads',
      'Applying least privilege to management/console access',
      'Using a single shared admin account for all VMs'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Securing virtualization/cloud requires patched and hardened hypervisors and images, strong isolation between workloads/tenants, and least-privilege management access. A single shared admin account destroys accountability and violates least privilege.',
    references: [REF_800_53, REF_800_207]
  },
  {
    domain: SYS, difficulty: 2, type: QType.SINGLE,
    stem: 'A mobile device management (MDM) policy enforces device encryption, screen lock, and remote wipe for company phones. The main risk this addresses is:',
    options: opts4(
      'Slow application performance',
      'Loss of confidential data if a device is lost or stolen',
      'High network latency',
      'Excessive log storage'
    ),
    correct: ['b'],
    explanation: 'MDM controls such as enforced encryption, screen lock, and remote wipe protect data confidentiality if a mobile device is lost or stolen, reducing the impact of physical loss.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'Application allowlisting (whitelisting) improves endpoint security primarily because it:',
    options: opts4(
      'Permits any signed software to run automatically',
      'Allows only explicitly approved applications to execute and blocks everything else by default',
      'Encrypts the application binaries',
      'Removes the need for patching'
    ),
    correct: ['b'],
    explanation: 'Allowlisting enforces a default-deny posture where only explicitly approved executables can run, strongly limiting malware and unauthorized software. It complements, but does not replace, patching and other controls.',
    references: [REF_800_83, REF_800_53]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Security Operations and Administration (10) ──
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A company periodically reassigns staff between duties and requires employees in sensitive roles to take uninterrupted leave. Which two controls help detect fraud and collusion?',
    options: opts4(
      'Least privilege and need-to-know',
      'Job rotation and mandatory vacation',
      'Defense in depth and air gapping',
      'Encryption and tokenization'
    ),
    correct: ['b'],
    explanation: 'Job rotation and mandatory vacation are administrative controls that surface fraud or hidden manipulation, because another person performing the duties (or scrutiny during enforced absence) can reveal irregularities.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A document specifies recommended (not mandatory) steps for hardening a workstation. This document type is best described as a:',
    options: opts4(
      'Policy',
      'Standard',
      'Guideline',
      'Statute'
    ),
    correct: ['c'],
    explanation: 'A guideline provides recommended, discretionary advice. A policy is a mandatory high-level directive and a standard is a mandatory specific requirement; guidelines support them without being compulsory.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization assigns each information asset an owner and a custodian. The data custodian is primarily responsible for:',
    options: opts4(
      'Deciding the classification and who may access the data',
      'Implementing and maintaining the protective controls and day-to-day handling as directed by the owner',
      'Accepting residual risk on behalf of the business',
      'Auditing the organization independently'
    ),
    correct: ['b'],
    explanation: 'The data owner sets classification and access decisions and accepts risk; the custodian implements and maintains the technical and operational controls (backups, access enforcement) according to the owner’s direction.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL elements that should be defined in a secure configuration/baseline management program.',
    options: opts4(
      'Approved hardened configuration settings for each platform',
      'A process to detect and remediate configuration drift',
      'Change control for modifications to the baseline',
      'A rule that audit logging must be disabled to save space'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Configuration management defines approved hardened baselines, detects/remediates drift, and controls baseline changes. Disabling audit logging would remove accountability and is never an acceptable baseline rule.',
    references: [REF_800_53, REF_800_92]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the CIA triad components is primarily concerned with ensuring authorized users have timely, reliable access to systems and data?',
    options: opts4(
      'Confidentiality',
      'Integrity',
      'Availability',
      'Non-repudiation'
    ),
    correct: ['c'],
    explanation: 'Availability ensures systems, services, and data are accessible to authorized users when needed. Confidentiality prevents unauthorized disclosure; integrity prevents unauthorized modification.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'A security operations team must ensure that privileged actions can always be traced to a specific individual. Which combination most directly supports this accountability?',
    options: opts4(
      'Shared admin accounts plus a strong password',
      'Unique named accounts, individual authentication, and tamper-resistant audit logging',
      'A single service account used by everyone',
      'Anonymous access with IP logging only'
    ),
    correct: ['b'],
    explanation: 'Accountability requires uniquely identifying each actor (unique named accounts), authenticating them individually, and recording their actions in protected audit logs. Shared/anonymous accounts break the link between an action and an individual.',
    references: [REF_800_92, REF_800_53]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A new third-party SaaS vendor will process customer data. Before onboarding, the security team should primarily perform:',
    options: opts4(
      'No review, since the vendor is well known',
      'A third-party/vendor risk assessment including security, contractual, and compliance due diligence',
      'Only a price negotiation',
      'A marketing analysis'
    ),
    correct: ['b'],
    explanation: 'Third-party risk management requires due diligence on the vendor’s security posture, contractual safeguards (e.g., data protection, breach notification), and compliance before entrusting customer data to them.',
    references: [REF_800_53, REF_800_37]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An acceptable use policy (AUP) primarily exists to:',
    options: opts4(
      'Define how the network is physically cabled',
      'Set the rules and expected behavior for users when using organizational systems and data',
      'Specify cryptographic key lengths',
      'List the company’s product prices'
    ),
    correct: ['b'],
    explanation: 'An acceptable use policy defines permitted and prohibited use of organizational systems, data, and networks, setting behavioral expectations and the basis for enforcement.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Protecting society, the common good, and the infrastructure is one of the canons of the ISC2 Code of Ethics.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. An ISC2 Code of Ethics canon requires members to "protect society, the common good, necessary public trust and confidence, and the infrastructure."',
    references: [REF_ETHICS]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'During a security review, an analyst finds that the same person requests, approves, and implements firewall changes. The principal weakness is:',
    options: opts4(
      'Excessive logging',
      'Lack of separation of duties, enabling unilateral and potentially malicious changes',
      'Too much encryption',
      'Insufficient bandwidth'
    ),
    correct: ['b'],
    explanation: 'When one individual can request, approve, and implement a sensitive change with no independent check, separation of duties is absent, increasing the risk of error, fraud, or malicious change going undetected.',
    references: [REF_800_53, REF_OUTLINE]
  },

  // ── Access Controls (10) ──
  {
    domain: AC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Identification, authentication, and authorization occur in which order when a user accesses a protected system?',
    options: opts4(
      'Authorization, then authentication, then identification',
      'Identification (claim identity), authentication (prove it), then authorization (grant access)',
      'Authentication, then authorization, then identification',
      'They all occur simultaneously and order is irrelevant'
    ),
    correct: ['b'],
    explanation: 'A subject first claims an identity (identification), then proves it (authentication), and only then is access to resources granted based on permissions (authorization). Accountability via auditing follows.',
    references: [REF_800_63, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A system enforces "no read up, no write down" using sensitivity labels to protect confidentiality. Which security model is being applied?',
    options: opts4(
      'Bell-LaPadula',
      'Biba',
      'Clark-Wilson',
      'Brewer-Nash'
    ),
    correct: ['a'],
    explanation: 'The Bell-LaPadula model protects confidentiality with the simple security property (no read up) and the star property (no write down). Biba protects integrity with the opposite rules.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A model enforces "no write up, no read down" to protect data integrity. This is the:',
    options: opts4(
      'Bell-LaPadula model',
      'Biba integrity model',
      'Take-Grant model',
      'Lattice confidentiality model'
    ),
    correct: ['b'],
    explanation: 'The Biba model protects integrity: subjects cannot write to higher integrity levels (no write up) or read from lower integrity levels (no read down), preventing contamination of trusted data.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization wants users to authenticate to an external partner application using credentials managed by the organization’s own identity provider via SAML. This trust arrangement is called:',
    options: opts4(
      'Local password authentication',
      'Federated identity management',
      'Privilege escalation',
      'Credential stuffing'
    ),
    correct: ['b'],
    explanation: 'Federated identity lets users authenticate with their home identity provider and access resources in a trusting partner domain (e.g., via SAML/OIDC assertions), avoiding separate credentials per service.',
    references: [REF_800_63, REF_800_207]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A security team performs a quarterly review confirming each user’s access still matches their current job role and removing stale entitlements. This activity is:',
    options: opts4(
      'Penetration testing',
      'Access review / entitlement recertification',
      'Patch management',
      'Capacity planning'
    ),
    correct: ['b'],
    explanation: 'Access reviews/recertification periodically validate that entitlements remain appropriate, removing accumulated or stale rights (privilege creep) and enforcing least privilege over time.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL examples of "something you are" (inherence) authentication factors.',
    options: opts4(
      'Fingerprint scan',
      'Iris/retina scan',
      'Hardware token PIN',
      'Facial recognition'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Biometrics such as fingerprint, iris/retina, and facial recognition are inherence ("something you are") factors. A PIN is a knowledge ("something you know") factor, even when used with a hardware token.',
    references: [REF_800_63, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'An account lockout policy locks an account after 5 failed logins for 15 minutes. The primary threat this mitigates is:',
    options: opts4(
      'Phishing emails',
      'Online password guessing / brute-force attacks',
      'SQL injection',
      'Cross-site scripting'
    ),
    correct: ['b'],
    explanation: 'Lockout/throttling after repeated failures slows or stops online brute-force and password-guessing attempts by limiting how many guesses an attacker can make against an account.',
    references: [REF_800_63, REF_800_53]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'Privileged access management (PAM) solutions improve security mainly by:',
    options: opts4(
      'Granting all users administrative rights for convenience',
      'Vaulting, brokering, and monitoring privileged credentials/sessions with least privilege and just-in-time elevation',
      'Disabling logging for admins',
      'Removing the need for authentication on servers'
    ),
    correct: ['b'],
    explanation: 'PAM centrally vaults and rotates privileged credentials, brokers and records privileged sessions, and enforces least privilege and just-in-time elevation, reducing standing privilege and improving oversight.',
    references: [REF_800_53, REF_800_207]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'A capability list and an access control list (ACL) differ in that an ACL is organized by:',
    options: opts4(
      'Subject (what each user can access)',
      'Object (which subjects may access that resource and how)',
      'Encryption key',
      'Network port'
    ),
    correct: ['b'],
    explanation: 'An ACL is attached to an object and lists which subjects may access it and with what rights. A capability list is organized by subject and enumerates the objects/rights that subject holds.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'A user keeps gaining new permissions with each role change but old permissions are never removed. This accumulation is called:',
    options: opts4(
      'Privilege creep (aggregation)',
      'Defense in depth',
      'Separation of duties',
      'Single sign-on'
    ),
    correct: ['a'],
    explanation: 'Privilege creep (authorization aggregation) is the gradual accumulation of access rights beyond what a role needs, typically from incomplete deprovisioning during role changes; access reviews counter it.',
    references: [REF_800_53, REF_OUTLINE]
  },

  // ── Risk Identification, Monitoring, and Analysis (10) ──
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An assessor evaluates risk using descriptive ratings of High/Medium/Low for likelihood and impact rather than dollar amounts. This is a:',
    options: opts4(
      'Quantitative risk analysis',
      'Qualitative risk analysis',
      'Penetration test',
      'Business impact analysis only'
    ),
    correct: ['b'],
    explanation: 'Qualitative risk analysis uses descriptive scales (High/Medium/Low) to rank likelihood and impact, which is faster and useful when precise monetary data is unavailable. Quantitative analysis assigns monetary/numeric values (SLE, ARO, ALE).',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'A business impact analysis (BIA) is performed primarily to:',
    options: opts4(
      'Select cryptographic algorithms',
      'Identify critical processes and the impact/timing of their disruption to set RTO/RPO priorities',
      'Configure firewall rules',
      'Write the acceptable use policy'
    ),
    correct: ['b'],
    explanation: 'A BIA identifies critical business functions, the impact of their disruption over time, and dependencies, producing the recovery priorities and RTO/RPO targets that drive continuity and DR planning.',
    references: [REF_800_34, REF_800_30]
  },
  {
    domain: RISK, difficulty: 2, type: QType.SINGLE,
    stem: 'The maximum level of risk an organization’s leadership is willing to accept in pursuit of its objectives is the:',
    options: opts4(
      'Residual risk',
      'Risk appetite (risk tolerance)',
      'Single loss expectancy',
      'Annualized rate of occurrence'
    ),
    correct: ['b'],
    explanation: 'Risk appetite (tolerance) is the amount and type of risk leadership is willing to accept to meet objectives; treatment decisions and acceptance of residual risk should remain within this defined appetite.',
    references: [REF_800_30, REF_800_37]
  },
  {
    domain: RISK, difficulty: 4, type: QType.SINGLE,
    stem: 'A workstation’s asset value is $4,000. Malware destroys 50% of its value, and such an event is expected twice per year. The ALE is:',
    options: opts4(
      '$2,000',
      '$4,000',
      '$1,000',
      '$8,000'
    ),
    correct: ['b'],
    explanation: 'SLE = $4,000 × 0.50 = $2,000. ARO = 2 per year. ALE = SLE × ARO = $2,000 × 2 = $4,000. A safeguard costing less than $4,000/year would be cost-justified.',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization decides to discontinue a risky legacy service entirely rather than secure it. This risk treatment is:',
    options: opts4(
      'Risk acceptance',
      'Risk avoidance',
      'Risk transference',
      'Risk mitigation'
    ),
    correct: ['b'],
    explanation: 'Eliminating the activity or asset that creates the risk is risk avoidance. Acceptance retains the risk, transference shifts the impact to a third party, and mitigation reduces but does not eliminate the activity.',
    references: [REF_800_30, REF_800_37]
  },
  {
    domain: RISK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid sources an analyst can use for security event monitoring and analysis.',
    options: opts4(
      'Operating system and application audit logs',
      'Firewall, IDS/IPS, and proxy logs',
      'Endpoint detection and response telemetry',
      'Guessing without any data collection'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Effective monitoring correlates OS/application audit logs, network security device logs (firewall, IDS/IPS, proxy), and endpoint telemetry. Analysis must be evidence-driven, not guesswork.',
    references: [REF_800_92, REF_800_94]
  },
  {
    domain: RISK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A vulnerability scanner fails to report a real, exploitable flaw that exists on a host. This outcome is a:',
    options: opts4(
      'False positive',
      'False negative',
      'True positive',
      'True negative'
    ),
    correct: ['b'],
    explanation: 'A false negative is when a real issue is present but the tool fails to detect/report it. False negatives are dangerous because they create unwarranted confidence that a system is secure.',
    references: [REF_800_115, REF_800_94]
  },
  {
    domain: RISK, difficulty: 4, type: QType.SINGLE,
    stem: 'In the NIST Risk Management Framework (RMF), which step authorizes a system to operate based on an acceptable level of risk to operations?',
    options: opts4(
      'Categorize',
      'Authorize',
      'Implement',
      'Monitor'
    ),
    correct: ['b'],
    explanation: 'The RMF Authorize step is where a senior official accepts the residual risk and grants an authorization to operate. Categorize classifies the system, Implement deploys controls, and Monitor provides ongoing oversight.',
    references: [REF_800_37, REF_800_30]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'A threat actor and the method they use to exploit a weakness are together described as a threat and its:',
    options: opts4(
      'Asset',
      'Threat vector (attack vector)',
      'Control',
      'Baseline'
    ),
    correct: ['b'],
    explanation: 'The threat vector (attack vector) is the path or method a threat actor uses to exploit a vulnerability (e.g., phishing email, exposed RDP). Understanding vectors helps prioritize defensive controls.',
    references: [REF_800_30, REF_800_115]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'Establishing a "baseline" of normal network and system behavior is important for monitoring because it:',
    options: opts4(
      'Eliminates the need for firewalls',
      'Enables anomaly detection by providing a reference of normal activity to compare against',
      'Encrypts all log data automatically',
      'Guarantees zero false positives'
    ),
    correct: ['b'],
    explanation: 'A behavioral baseline defines what normal looks like, so deviations (anomalies) can be flagged for investigation. It does not by itself encrypt data, replace firewalls, or eliminate false positives.',
    references: [REF_800_94, REF_800_92]
  },

  // ── Incident Response and Recovery (9) ──
  {
    domain: IR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In the NIST incident response life cycle, training the team, building tools, and creating playbooks occur in which phase?',
    options: opts4(
      'Preparation',
      'Detection and Analysis',
      'Containment, Eradication, and Recovery',
      'Post-Incident Activity'
    ),
    correct: ['a'],
    explanation: 'The Preparation phase establishes the capability to respond — policies, the response team, tools, communications, and playbooks — before any incident occurs.',
    references: [REF_800_61, REF_CISA_IR]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'A documented record of who handled a piece of evidence, when, and what was done with it is the:',
    options: opts4(
      'Risk register',
      'Chain of custody',
      'Service level agreement',
      'Configuration baseline'
    ),
    correct: ['b'],
    explanation: 'Chain of custody documents the seizure, handling, transfer, and storage of evidence to demonstrate it was not altered, which is essential for the evidence to be admissible and credible.',
    references: [REF_800_61, REF_800_115]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'During eradication after a confirmed compromise, the team should:',
    options: opts4(
      'Leave the malware in place to study it indefinitely on production',
      'Remove malware/artifacts, close the exploited vulnerability, and rebuild affected systems from known-good media',
      'Only change the user’s password and resume use',
      'Restore from any available backup without validation'
    ),
    correct: ['b'],
    explanation: 'Eradication removes malicious code and artifacts, closes the exploited vulnerability/root cause, and rebuilds compromised systems from trusted, known-good sources so the threat does not persist into recovery.',
    references: [REF_800_61, REF_800_83]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization runs a "3-2-1" backup strategy. What does this mean?',
    options: opts4(
      'Three passwords, two admins, one server',
      'Three copies of data, on two different media types, with one copy stored offsite/offline',
      'Backups every three hours, two days a week, one month retention',
      'Three encryption keys for one backup'
    ),
    correct: ['b'],
    explanation: 'The 3-2-1 rule keeps at least three copies of data on two different media, with one copy offsite (and ideally offline/immutable), improving resilience against hardware failure, disaster, and ransomware.',
    references: [REF_800_34, REF_CISA_RANSOM]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'After a major outage, before declaring full recovery, the team should:',
    options: opts4(
      'Skip validation to save time',
      'Validate that restored systems are clean, functioning correctly, and monitored before returning them to normal operations',
      'Immediately delete all incident documentation',
      'Disable monitoring on restored systems'
    ),
    correct: ['b'],
    explanation: 'The recovery phase requires validating that restored systems are free of compromise, fully functional, and under heightened monitoring before they are returned to production and the incident is closed.',
    references: [REF_800_61, REF_800_184]
  },
  {
    domain: IR, difficulty: 2, type: QType.SINGLE,
    stem: 'A facility-only recovery site with power, cooling, and space but no installed servers or data is a:',
    options: opts4(
      'Hot site',
      'Warm site',
      'Cold site',
      'Mirrored site'
    ),
    correct: ['c'],
    explanation: 'A cold site provides only the physical environment (space, power, cooling). Equipment must be procured/installed and data restored before operations can resume, making it the cheapest but slowest option.',
    references: [REF_800_34, REF_800_184]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'Which incident-response metric measures the average time between the start of an incident and its detection?',
    options: opts4(
      'Mean time to detect (MTTD)',
      'Mean time between failures (MTBF)',
      'Recovery point objective (RPO)',
      'Annualized loss expectancy (ALE)'
    ),
    correct: ['a'],
    explanation: 'Mean time to detect (MTTD) measures how long it takes to discover an incident after it begins. Reducing MTTD (and MTTR, mean time to respond/recover) limits dwell time and damage.',
    references: [REF_800_61, REF_800_184]
  },
  {
    domain: IR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate immediate containment options for a compromised server still serving production traffic.',
    options: opts4(
      'Isolate it on a quarantine VLAN or block its network access',
      'Capture volatile evidence (memory, connections) before changes when feasible',
      'Fail over to a known-good standby while preserving the affected host',
      'Publicly post the incident details on social media'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Containment options include network isolation/quarantine, capturing volatile evidence before altering state, and failing over to a clean standby while preserving the compromised host for analysis. Public disclosure during response is not a containment action and may harm the investigation.',
    references: [REF_800_61, REF_CISA_IR]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'A user reports a suspicious email with a malicious-looking attachment. The correct first step in the IR process is to:',
    options: opts4(
      'Open the attachment to confirm it is malicious',
      'Report it to the security team / follow the reporting procedure so it can be analyzed safely',
      'Forward it to all colleagues as a warning',
      'Delete it and say nothing'
    ),
    correct: ['b'],
    explanation: 'Suspected phishing/malware should be reported through the defined channel so trained responders can analyze it safely (in a sandbox) and take protective action. Opening it or forwarding it could trigger or spread the threat; deleting silently loses detection signal.',
    references: [REF_CISA_PHISH, REF_800_61]
  },

  // ── Cryptography (6) ──
  {
    domain: CRYPTO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which cryptographic primitive produces a fixed-length, one-way digest used to verify data integrity?',
    options: opts4(
      'A symmetric cipher such as AES',
      'A cryptographic hash function such as SHA-256',
      'An asymmetric cipher such as RSA',
      'A key exchange such as Diffie-Hellman'
    ),
    correct: ['b'],
    explanation: 'A cryptographic hash function maps input to a fixed-length digest and is one-way and collision-resistant, allowing detection of changes to data. It does not provide confidentiality or key exchange by itself.',
    references: [REF_800_175, REF_OUTLINE]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE,
    stem: 'Two parties need to agree on a shared secret over an untrusted channel without transmitting the secret itself. Which algorithm is designed for this?',
    options: opts4(
      'SHA-512',
      'Diffie-Hellman key exchange',
      'AES-CBC',
      'CRC32'
    ),
    correct: ['b'],
    explanation: 'Diffie-Hellman enables two parties to derive a shared secret over an insecure channel without sending the secret. AES is a cipher, SHA-512 is a hash, and CRC32 is a non-cryptographic checksum.',
    references: [REF_800_57, REF_800_175]
  },
  {
    domain: CRYPTO, difficulty: 4, type: QType.SINGLE,
    stem: 'A relying party validates a server’s TLS certificate. Trust is ultimately established because the certificate chains to a:',
    options: opts4(
      'Self-signed certificate the server generated',
      'Trusted root certificate authority (CA) in the trust store',
      'Shared symmetric key',
      'Random nonce'
    ),
    correct: ['b'],
    explanation: 'X.509 trust is hierarchical: a server certificate is trusted if it chains through valid intermediate CAs up to a root CA already present in the relying party’s trusted root store. Self-signed certificates have no such external trust anchor.',
    references: [REF_800_52, REF_800_57]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Storing passwords using a slow, salted password-hashing function (e.g., bcrypt/Argon2) primarily protects against:',
    options: opts4(
      'Network sniffing of passwords in transit',
      'Offline brute-force and precomputed (rainbow table) attacks if the hash database is stolen',
      'Cross-site scripting',
      'Denial-of-service attacks'
    ),
    correct: ['b'],
    explanation: 'Salting defeats precomputed rainbow tables and a deliberately slow KDF (bcrypt/Argon2/PBKDF2) makes large-scale offline brute-forcing of stolen hashes expensive. Transit protection is provided separately by TLS.',
    references: [REF_800_63, REF_800_175]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement correctly contrasts symmetric and asymmetric cryptography?',
    options: opts4(
      'Symmetric uses one shared key and is fast; asymmetric uses a public/private key pair and is slower but solves key distribution',
      'Symmetric is always more secure than asymmetric',
      'Asymmetric uses one shared key; symmetric uses a key pair',
      'Both require the same key for encryption and decryption'
    ),
    correct: ['a'],
    explanation: 'Symmetric ciphers use a single shared secret key and are computationally fast (good for bulk data); asymmetric algorithms use a public/private key pair, are slower, and solve secure key distribution and enable signatures. They are commonly combined in hybrid schemes.',
    references: [REF_800_175, REF_800_57]
  },
  {
    domain: CRYPTO, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization must protect highly sensitive data so that even if recorded ciphertext is captured today, future advances should not easily decrypt it. The best practice is to:',
    options: opts4(
      'Use a short key for performance',
      'Use strong, current standardized algorithms with adequate key lengths and a sound key-management lifecycle',
      'Invent a proprietary secret algorithm',
      'Reuse the same key indefinitely for all systems'
    ),
    correct: ['b'],
    explanation: 'Long-term confidentiality depends on standardized, vetted algorithms with adequate key sizes and disciplined key management (rotation, protection, destruction). Proprietary "secret" algorithms and weak/short or reused keys undermine durability of protection.',
    references: [REF_800_57, REF_800_175]
  },

  // ── Network and Communications Security (10) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'At which OSI layer does a traditional packet-filtering firewall primarily make allow/deny decisions based on IP addresses and ports?',
    options: opts4(
      'Layer 2 (Data Link)',
      'Layers 3 and 4 (Network and Transport)',
      'Layer 7 (Application) only',
      'Layer 1 (Physical)'
    ),
    correct: ['b'],
    explanation: 'Packet filters operate primarily at the network and transport layers, filtering on IP addresses, protocol, and port numbers. Application-layer (Layer 7) inspection is performed by proxies or next-generation/application firewalls.',
    references: [REF_800_41, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A next-generation firewall (NGFW) adds which capability beyond classic stateful filtering?',
    options: opts4(
      'It only filters by MAC address',
      'Application awareness and integrated deep packet inspection / IPS',
      'It removes the need for any logging',
      'It encrypts the local hard drive'
    ),
    correct: ['b'],
    explanation: 'An NGFW augments stateful filtering with application identification, deep packet inspection, and integrated intrusion prevention (and often user identity), enabling policy based on applications and content rather than ports alone.',
    references: [REF_800_41, REF_800_94]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A remote user connects through an encrypted tunnel that gives their laptop an internal IP and access to corporate resources. This is a:',
    options: opts4(
      'Reverse proxy',
      'Remote-access VPN',
      'Load balancer',
      'Network tap'
    ),
    correct: ['b'],
    explanation: 'A remote-access VPN establishes an encrypted tunnel from a user’s device to the corporate network, protecting confidentiality/integrity over untrusted networks and extending controlled access to internal resources.',
    references: [REF_800_77, REF_800_41]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker floods a server with TCP SYN packets and never completes the handshake, exhausting the connection table. This is a:',
    options: opts4(
      'SQL injection',
      'SYN flood denial-of-service attack',
      'Phishing attack',
      'Privilege escalation'
    ),
    correct: ['b'],
    explanation: 'A SYN flood sends many half-open connection requests to exhaust server resources, denying service to legitimate users. SYN cookies, rate limiting, and upstream filtering help mitigate it.',
    references: [REF_800_94, REF_800_41]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which protocol should replace Telnet for secure remote command-line administration?',
    options: opts4(
      'SSH (Secure Shell)',
      'FTP',
      'SNMPv1',
      'HTTP'
    ),
    correct: ['a'],
    explanation: 'SSH provides authenticated, encrypted remote shell and file transfer, protecting credentials and session data. Telnet, FTP, SNMPv1, and HTTP transmit data (often credentials) in clear text.',
    references: [REF_800_52, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL controls that improve email security against spoofing and phishing.',
    options: opts4(
      'SPF, DKIM, and DMARC for sender authentication',
      'Inbound email filtering / sandboxing of attachments and links',
      'User awareness training and easy reporting',
      'Disabling all spam filtering to receive every message'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'SPF/DKIM/DMARC authenticate senders and reduce spoofing; gateway filtering/sandboxing inspects attachments and links; and trained, reporting users add a human layer. Disabling spam filtering would increase exposure.',
    references: [REF_CISA_PHISH, REF_800_53]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Placing all IoT devices on a dedicated, isolated network segment with strict filtering primarily provides:',
    options: opts4(
      'Faster firmware updates',
      'Containment so a compromised IoT device cannot easily reach sensitive internal systems',
      'Automatic encryption of device data',
      'Elimination of the need to patch the devices'
    ),
    correct: ['b'],
    explanation: 'Segmenting and tightly filtering IoT/OT devices contains the impact of their typically weaker security, preventing a compromised device from being used to pivot into sensitive systems.',
    references: [REF_800_41, REF_800_207]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker sends spoofed DNS responses so users resolving a legitimate domain are sent to a malicious server. This is:',
    options: opts4(
      'DNS spoofing / cache poisoning',
      'A buffer overflow',
      'Session fixation',
      'A logic bomb'
    ),
    correct: ['a'],
    explanation: 'DNS spoofing/cache poisoning injects forged DNS records so victims are directed to attacker-controlled hosts. DNSSEC, response validation, and secure resolvers mitigate this threat.',
    references: [REF_800_94, REF_800_41]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A proxy server that clients explicitly send web requests through, providing filtering, caching, and anonymization of internal clients, is a:',
    options: opts4(
      'Reverse proxy',
      'Forward (web) proxy',
      'Transparent bridge',
      'Network tap'
    ),
    correct: ['b'],
    explanation: 'A forward proxy sits between internal clients and the Internet, enforcing URL/content filtering, caching, and hiding internal client addresses. A reverse proxy fronts servers to protect/balance inbound requests.',
    references: [REF_800_41, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is transmitting credentials over HTTP (instead of HTTPS) a serious risk on a shared network?',
    options: opts4(
      'HTTP is slower than HTTPS',
      'Credentials are sent in clear text and can be captured by anyone able to sniff the traffic',
      'HTTP cannot load images',
      'HTTP uses more CPU than HTTPS'
    ),
    correct: ['b'],
    explanation: 'HTTP provides no confidentiality, so credentials and session data travel in clear text and can be intercepted on a shared/untrusted network. TLS (HTTPS) encrypts the session and authenticates the server.',
    references: [REF_800_52, REF_800_41]
  },

  // ── Systems and Application Security (10) ──
  {
    domain: SYS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Malware that self-replicates and spreads across networks without requiring a host file or user action is a:',
    options: opts4(
      'Virus',
      'Worm',
      'Trojan horse',
      'Spyware'
    ),
    correct: ['b'],
    explanation: 'A worm self-propagates across networks autonomously, often exploiting vulnerabilities, without needing to attach to a host file or rely on user execution. A virus requires a host and usually user action to spread.',
    references: [REF_800_83, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'An attacker sends more data than a fixed-size memory buffer can hold, overwriting adjacent memory to execute arbitrary code. This is a:',
    options: opts4(
      'Buffer overflow',
      'Cross-site request forgery',
      'Phishing attack',
      'DNS poisoning'
    ),
    correct: ['a'],
    explanation: 'A buffer overflow writes beyond a buffer’s bounds, corrupting memory and potentially redirecting execution. Bounds checking, safe languages/libraries, and protections like ASLR/DEP mitigate it.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'A web application trusts a request that the user’s authenticated browser sends without their intent (e.g., a hidden form auto-submitting a transfer). This attack is:',
    options: opts4(
      'Cross-site request forgery (CSRF)',
      'SQL injection',
      'Buffer overflow',
      'Port scanning'
    ),
    correct: ['a'],
    explanation: 'CSRF abuses an authenticated session by tricking the victim’s browser into sending an unintended state-changing request. Anti-CSRF tokens, same-site cookies, and re-authentication for sensitive actions defend against it.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'Following the principle of secure software development, input from users should be:',
    options: opts4(
      'Trusted by default to improve performance',
      'Validated, sanitized, and treated as untrusted (allowlist where possible)',
      'Logged but never validated',
      'Encrypted instead of validated'
    ),
    correct: ['b'],
    explanation: 'All external input must be treated as untrusted and validated/sanitized (preferably with allowlists) to prevent injection, overflow, and logic attacks. Encryption protects confidentiality but does not substitute for input validation.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A "zero-day" vulnerability is best described as one that:',
    options: opts4(
      'Has a patch released the same day it is found',
      'Is unknown to the vendor/defenders and has no available patch when first exploited',
      'Only affects systems older than a year',
      'Can never be exploited remotely'
    ),
    correct: ['b'],
    explanation: 'A zero-day is a vulnerability not yet known to the vendor or defenders, with no patch available, so attackers can exploit it before a fix exists. Defense relies on layered controls and rapid response.',
    references: [REF_800_40, REF_800_83]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'Application sandboxing improves security primarily by:',
    options: opts4(
      'Encrypting the application source code',
      'Isolating an application/process so that, if compromised, its access to the rest of the system is constrained',
      'Removing the need for authentication',
      'Increasing CPU clock speed'
    ),
    correct: ['b'],
    explanation: 'Sandboxing confines an application or process within a restricted environment, limiting the resources and system interfaces it can reach so a compromise is contained and cannot freely affect the host.',
    references: [REF_800_53, REF_800_83]
  },
  {
    domain: SYS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that strengthen database security.',
    options: opts4(
      'Least-privilege database accounts and role separation',
      'Encryption of sensitive data at rest and in transit',
      'Input validation/parameterized queries in applications',
      'Granting the application a database superuser account for convenience'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Database security relies on least-privilege accounts, encryption of sensitive data at rest/in transit, and applications using parameterized queries with validated input. Using a superuser for the app violates least privilege and amplifies injection impact.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 2, type: QType.SINGLE,
    stem: 'Antivirus that relies on a database of known malware patterns uses which detection method?',
    options: opts4(
      'Signature-based detection',
      'Quantum detection',
      'Steganographic detection',
      'Latency-based detection'
    ),
    correct: ['a'],
    explanation: 'Signature-based detection compares files against known malware patterns. It is effective for known threats but misses novel/zero-day malware, so it is paired with heuristic/behavioral and EDR techniques.',
    references: [REF_800_83, REF_800_94]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer wants to ensure downloaded software has not been tampered with. The best verification is to:',
    options: opts4(
      'Check the file size only',
      'Verify a vendor-provided cryptographic hash and/or digital signature of the file',
      'Trust the file because it downloaded quickly',
      'Rename the file and run it'
    ),
    correct: ['b'],
    explanation: 'Comparing a securely obtained cryptographic hash and validating the vendor’s digital signature confirms the file’s integrity and authenticity. File size or download speed provide no tamper assurance.',
    references: [REF_800_175, REF_800_57]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'Data loss prevention (DLP) technology primarily helps an organization by:',
    options: opts4(
      'Encrypting backups automatically',
      'Detecting and blocking unauthorized exfiltration or transmission of sensitive data based on content/context policies',
      'Replacing the firewall',
      'Speeding up the network'
    ),
    correct: ['b'],
    explanation: 'DLP inspects data in use, in motion, and at rest against policy and can alert or block attempts to send or copy sensitive data to unauthorized destinations, reducing the risk of data leakage.',
    references: [REF_800_53, REF_OUTLINE]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Security Operations and Administration (10) ──
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best describes "defense in depth"?',
    options: opts4(
      'Relying on a single strong perimeter firewall',
      'Layering multiple independent controls so the failure of one does not result in total compromise',
      'Hiding system details so attackers cannot find them',
      'Encrypting only the most sensitive file'
    ),
    correct: ['b'],
    explanation: 'Defense in depth applies multiple, overlapping, independent layers of administrative, technical, and physical controls so a single control failure does not lead to full compromise.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A non-disclosure agreement (NDA) is signed with a contractor primarily to:',
    options: opts4(
      'Define service availability targets',
      'Legally obligate the contractor to protect confidential information they may access',
      'Set the cryptographic algorithm to use',
      'Schedule patch windows'
    ),
    correct: ['b'],
    explanation: 'An NDA legally binds parties to protect and not disclose confidential or proprietary information shared during an engagement, supporting the confidentiality objective contractually.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL responsibilities typically assigned to a data owner.',
    options: opts4(
      'Determining the classification level of the data',
      'Approving who may access the data',
      'Accepting residual risk for the data on behalf of the business',
      'Physically swapping the failed backup tape drive'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The data owner sets classification, authorizes access, and accepts residual risk. Hands-on operational tasks such as replacing hardware or running backups are performed by the custodian/operations staff.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which property ensures a user cannot credibly deny having performed an action they actually performed?',
    options: opts4(
      'Confidentiality',
      'Availability',
      'Non-repudiation',
      'Anonymity'
    ),
    correct: ['c'],
    explanation: 'Non-repudiation provides proof of origin and action (e.g., via digital signatures and secure logs) so a party cannot plausibly deny having taken the action.',
    references: [REF_800_175, REF_800_92]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A standard requires log retention of 12 months for security events. The MAIN reason to retain logs is to:',
    options: opts4(
      'Increase disk vendor revenue',
      'Support detection, investigation, forensics, and compliance/audit needs',
      'Slow down the systems intentionally',
      'Replace the need for backups'
    ),
    correct: ['b'],
    explanation: 'Retained logs enable detection of slow/low-and-slow attacks, post-incident forensics, accountability, and compliance/audit obligations. Retention duration should match legal/regulatory and investigative needs.',
    references: [REF_800_92, REF_800_61]
  },
  {
    domain: OPS, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization wants emergency ("break-glass") admin access available for outages but tightly controlled. The best design is to:',
    options: opts4(
      'Give all admins permanent root and share the password',
      'Use a sealed, monitored break-glass account with strong vaulting, alerting on use, and mandatory post-use review',
      'Disable logging on the emergency account',
      'Email the emergency password to the whole IT team'
    ),
    correct: ['b'],
    explanation: 'Break-glass accounts should be tightly vaulted, used only in emergencies, generate immediate alerts on use, and undergo mandatory after-action review, preserving availability for emergencies without normalizing standing privileged access.',
    references: [REF_800_53, REF_800_92]
  },
  {
    domain: OPS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Providing diligent and competent service to principals is one of the canons of the ISC2 Code of Ethics.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. An ISC2 Code of Ethics canon requires members to "provide diligent and competent service to principals."',
    references: [REF_ETHICS]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A security operations metric program tracks mean time to detect and mean time to respond. The primary value of these metrics is to:',
    options: opts4(
      'Replace the incident response plan',
      'Measure and drive improvement in detection and response effectiveness over time',
      'Encrypt the SIEM database',
      'Eliminate the need for monitoring'
    ),
    correct: ['b'],
    explanation: 'Operational metrics such as MTTD and MTTR quantify how quickly threats are found and handled, providing objective targets to measure and continuously improve the security operations program.',
    references: [REF_800_61, REF_800_92]
  },
  {
    domain: OPS, difficulty: 3, type: QType.SINGLE,
    stem: 'The principle that critical operations should require the involvement of two or more individuals to complete (e.g., dual control of keys) is:',
    options: opts4(
      'Single sign-on',
      'Dual control / two-person integrity',
      'Defense in depth',
      'Mandatory access control'
    ),
    correct: ['b'],
    explanation: 'Dual control (two-person integrity) requires two authorized individuals to jointly perform a highly sensitive action, preventing a single person from completing it alone and reducing fraud and error risk.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: OPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A written, approved set of mandatory rules for using strong passwords across the organization is best categorized as a:',
    options: opts4(
      'Guideline',
      'Procedure',
      'Policy/standard (mandatory directive)',
      'Network diagram'
    ),
    correct: ['c'],
    explanation: 'Mandatory, organization-wide rules are expressed through policy and supporting standards. A procedure is the step-by-step "how," and a guideline is discretionary advice.',
    references: [REF_800_53, REF_800_63]
  },

  // ── Access Controls (10) ──
  {
    domain: AC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which control concept means a subject should only be able to access information required for the specific task at hand, even within their clearance level?',
    options: opts4(
      'Need-to-know',
      'Defense in depth',
      'Single sign-on',
      'Implicit allow'
    ),
    correct: ['a'],
    explanation: 'Need-to-know restricts access to only the information necessary for a specific task or duty, further constraining access even when a subject’s clearance or role would otherwise permit broader access.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A protocol that provides centralized Authentication, Authorization, and Accounting (AAA) for network device administration and supports command-level authorization is:',
    options: opts4(
      'TACACS+',
      'ICMP',
      'SMTP',
      'NTP'
    ),
    correct: ['a'],
    explanation: 'TACACS+ is an AAA protocol commonly used for administrative access to network devices, separating authentication, authorization, and accounting and supporting per-command authorization. RADIUS is another AAA option more common for network access.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'A modern authorization framework that lets a user grant a third-party app limited access to their resources without sharing their password is:',
    options: opts4(
      'OAuth 2.0',
      'WEP',
      'ICMP',
      'ARP'
    ),
    correct: ['a'],
    explanation: 'OAuth 2.0 is a delegated authorization framework allowing a user to grant a third party scoped, revocable access to resources via tokens, without exposing the user’s credentials.',
    references: [REF_800_63, REF_800_207]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker reuses username/password pairs leaked from another breach to log into many accounts on your service. This attack is:',
    options: opts4(
      'Credential stuffing',
      'Cross-site scripting',
      'Privilege escalation',
      'A SYN flood'
    ),
    correct: ['a'],
    explanation: 'Credential stuffing automates login attempts using credentials leaked elsewhere, succeeding where users reuse passwords. MFA, breached-password screening, and rate limiting/anomaly detection mitigate it.',
    references: [REF_800_63, REF_CISA_MFA]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A time-based one-time password (TOTP) authenticator app provides which authentication factor?',
    options: opts4(
      'Something you know',
      'Something you have',
      'Something you are',
      'Somewhere you are'
    ),
    correct: ['b'],
    explanation: 'A TOTP code is generated by a device/app provisioned with a shared secret, so possession of that authenticator is "something you have." Combined with a password it yields multifactor authentication.',
    references: [REF_800_63, REF_CISA_MFA]
  },
  {
    domain: AC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL measures that reduce the risk of unauthorized privileged access.',
    options: opts4(
      'Enforcing MFA for all administrative accounts',
      'Just-in-time elevation and removing standing admin rights',
      'Separate admin accounts distinct from daily-use accounts',
      'Sharing one administrator password across the whole team'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'MFA on admin accounts, just-in-time elevation with minimal standing privilege, and dedicated admin accounts all reduce privileged-access risk and improve accountability. A shared admin password destroys accountability and is a major weakness.',
    references: [REF_800_53, REF_800_207]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'A reference monitor concept requires that the access-mediation mechanism be tamperproof, always invoked, and small enough to be verifiable. The component implementing this is the:',
    options: opts4(
      'Security kernel',
      'Network switch',
      'Load balancer',
      'Backup server'
    ),
    correct: ['a'],
    explanation: 'The security kernel implements the reference monitor concept and must be tamperproof, non-bypassable (always invoked), and small/verifiable, mediating all access between subjects and objects.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 3, type: QType.SINGLE,
    stem: 'To enforce least privilege when granting database access to a reporting application, you should:',
    options: opts4(
      'Grant full DBA rights so it never fails',
      'Grant only read access to the specific views/tables the reports require',
      'Use the same account as the production write service',
      'Disable authentication for the reporting account'
    ),
    correct: ['b'],
    explanation: 'Least privilege means the reporting application gets only the minimal read access to exactly the data it needs, limiting damage if the application or its credentials are compromised.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: AC, difficulty: 2, type: QType.SINGLE,
    stem: 'Auditing (accounting) within an access control system primarily supports which security objective?',
    options: opts4(
      'Confidentiality only',
      'Accountability — linking actions to identities for review and non-repudiation',
      'Availability only',
      'Faster authentication'
    ),
    correct: ['b'],
    explanation: 'The accounting/audit function records subject actions so they can be attributed to identities and reviewed, supporting accountability, detection, and non-repudiation.',
    references: [REF_800_92, REF_800_53]
  },
  {
    domain: AC, difficulty: 4, type: QType.SINGLE,
    stem: 'A continuous, adaptive authentication system increases scrutiny (e.g., step-up MFA) when it detects an unusual location or device. This approach is best called:',
    options: opts4(
      'Static single-factor authentication',
      'Risk-based / adaptive authentication',
      'Anonymous access',
      'Security through obscurity'
    ),
    correct: ['b'],
    explanation: 'Risk-based (adaptive) authentication evaluates contextual signals (location, device, behavior) and dynamically raises authentication requirements when risk is elevated, aligning friction with risk and supporting zero trust.',
    references: [REF_800_207, REF_CISA_ZT]
  },

  // ── Risk Identification, Monitoring, and Analysis (10) ──
  {
    domain: RISK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which formula best expresses risk in qualitative terms?',
    options: opts4(
      'Risk = Likelihood × Impact',
      'Risk = Asset Value + Threat',
      'Risk = Control − Vulnerability',
      'Risk = Bandwidth ÷ Latency'
    ),
    correct: ['a'],
    explanation: 'Risk is commonly conceptualized as a function of the likelihood that a threat exploits a vulnerability and the resulting impact, i.e., Risk ≈ Likelihood × Impact.',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'A control is added to reduce the likelihood of a phishing-based breach (training, MFA, filtering). This risk treatment is:',
    options: opts4(
      'Risk acceptance',
      'Risk mitigation (reduction)',
      'Risk transference',
      'Risk avoidance'
    ),
    correct: ['b'],
    explanation: 'Applying controls to lower the likelihood and/or impact of a risk is risk mitigation/reduction. The activity continues but with reduced exposure, unlike avoidance, transference, or acceptance.',
    references: [REF_800_30, REF_800_37]
  },
  {
    domain: RISK, difficulty: 4, type: QType.SINGLE,
    stem: 'A safeguard costs $5,000/year. It reduces a risk’s ALE from $20,000 to $6,000. What is the approximate annual benefit (value) of the safeguard?',
    options: opts4(
      '$14,000 (ALE before − ALE after), so $9,000 net of its cost',
      '$5,000',
      '$26,000',
      '$0 — safeguards never provide measurable value'
    ),
    correct: ['a'],
    explanation: 'The safeguard value = (ALE before − ALE after) − annual cost of control = ($20,000 − $6,000) − $5,000 = $14,000 reduction yielding $9,000 net benefit, indicating the control is cost-justified.',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'Continuous monitoring under the NIST RMF primarily ensures that:',
    options: opts4(
      'Controls are selected only once and never reviewed',
      'Security control effectiveness and the risk posture are tracked over time so changes/degradations are detected',
      'All systems are decommissioned annually',
      'Logging is disabled to save resources'
    ),
    correct: ['b'],
    explanation: 'The RMF Monitor step provides ongoing assessment of control effectiveness, system changes, and emerging threats so the authorizing official maintains awareness of the current risk posture.',
    references: [REF_800_37, REF_800_92]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An asset is anything of value to the organization that may need protection. Which of the following is the BEST example of an asset in risk analysis?',
    options: opts4(
      'A phishing email',
      'A customer database containing PII',
      'A misconfigured firewall rule',
      'An attacker’s toolkit'
    ),
    correct: ['b'],
    explanation: 'An asset is something of value requiring protection — a customer database with PII is a clear example. A phishing email/attacker toolkit are threat-related; a misconfiguration is a vulnerability.',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL that are valid risk treatment (response) options.',
    options: opts4(
      'Mitigate (reduce)',
      'Transfer (share)',
      'Avoid',
      'Ignore the risk and never document it'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Standard risk responses are mitigate, transfer/share, avoid, and accept. Deliberately ignoring and not documenting a risk is not a valid, governed treatment — even acceptance must be informed and recorded.',
    references: [REF_800_30, REF_800_37]
  },
  {
    domain: RISK, difficulty: 2, type: QType.SINGLE,
    stem: 'Threat intelligence feeds primarily improve risk monitoring by:',
    options: opts4(
      'Encrypting all internal data',
      'Providing timely information about adversary tactics, indicators, and emerging threats to inform detection and prioritization',
      'Replacing the firewall',
      'Eliminating the need for patching'
    ),
    correct: ['b'],
    explanation: 'Threat intelligence supplies indicators of compromise and adversary TTPs that help tune detection, prioritize vulnerabilities likely to be exploited, and inform risk-based decisions.',
    references: [REF_800_30, REF_800_94]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'During a risk assessment, the team estimates how often a threat is expected to occur in a year. This estimate is the:',
    options: opts4(
      'Exposure factor (EF)',
      'Annualized rate of occurrence (ARO)',
      'Single loss expectancy (SLE)',
      'Residual risk'
    ),
    correct: ['b'],
    explanation: 'The annualized rate of occurrence (ARO) is the estimated frequency of a threat event per year. Combined with SLE (AV × EF), it yields the annualized loss expectancy (ALE = SLE × ARO).',
    references: [REF_800_30, REF_OUTLINE]
  },
  {
    domain: RISK, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization performs an authenticated (credentialed) vulnerability scan instead of an unauthenticated one because it:',
    options: opts4(
      'Is undetectable by the target',
      'Provides more accurate results (e.g., missing patches, configuration) with fewer false positives',
      'Requires no permission',
      'Is the same as a penetration test'
    ),
    correct: ['b'],
    explanation: 'Credentialed scans log into hosts to inspect installed patches and configuration directly, producing more accurate, lower-false-positive results than unauthenticated scans that only see the network-facing surface.',
    references: [REF_800_115, REF_800_94]
  },
  {
    domain: RISK, difficulty: 4, type: QType.SINGLE,
    stem: 'An analyst correlates failed logins across many systems followed by a successful login and lateral movement. The MOST appropriate conclusion is:',
    options: opts4(
      'It is definitely a false positive; ignore it',
      'A potential account-compromise/intrusion warranting escalation and investigation per the IR process',
      'Normal behavior requiring no action',
      'A hardware failure'
    ),
    correct: ['b'],
    explanation: 'A pattern of widespread failed logins, a success, then lateral movement is a strong indicator of credential compromise/intrusion. It should be escalated and investigated under the incident response process rather than dismissed.',
    references: [REF_800_94, REF_800_61]
  },

  // ── Incident Response and Recovery (9) ──
  {
    domain: IR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the correct high-level order of the NIST incident response life cycle?',
    options: opts4(
      'Detection → Preparation → Recovery → Lessons Learned',
      'Preparation → Detection & Analysis → Containment, Eradication & Recovery → Post-Incident Activity',
      'Recovery → Containment → Detection → Preparation',
      'Eradication → Preparation → Detection → Containment'
    ),
    correct: ['b'],
    explanation: 'NIST SP 800-61 orders the life cycle as Preparation; Detection and Analysis; Containment, Eradication, and Recovery; and Post-Incident Activity (lessons learned), with feedback into Preparation.',
    references: [REF_800_61, REF_CISA_IR]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'A backup that copies only data changed since the last full backup, and is independent of other incrementals, is a:',
    options: opts4(
      'Incremental backup',
      'Differential backup',
      'Synthetic full backup',
      'Snapshot only'
    ),
    correct: ['b'],
    explanation: 'A differential backup copies all data changed since the last full backup; restoring needs only the last full plus the latest differential. An incremental copies changes since the last backup of any type and requires the full plus every subsequent incremental.',
    references: [REF_800_34, REF_800_184]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'During a ransomware event, isolating infected hosts and disabling affected accounts/services to stop spread is part of which IR phase?',
    options: opts4(
      'Preparation',
      'Containment',
      'Lessons Learned',
      'Risk acceptance'
    ),
    correct: ['b'],
    explanation: 'Stopping propagation by isolating infected systems and disabling compromised accounts/services is containment, performed after detection and before eradication and recovery to limit damage.',
    references: [REF_CISA_RANSOM, REF_800_61]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'A communications plan within incident response primarily ensures that:',
    options: opts4(
      'Attackers are notified first',
      'The right internal and external stakeholders are informed appropriately and on time, including legal/regulatory notification when required',
      'Logs are deleted to protect privacy',
      'All systems are powered off'
    ),
    correct: ['b'],
    explanation: 'An IR communications plan defines who must be informed (management, legal, affected parties, regulators, customers), what to share, and when, ensuring timely, accurate, and compliant notification during an incident.',
    references: [REF_800_61, REF_CISA_IR]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Periodically performing test restores of backups is important primarily because it:',
    options: opts4(
      'Increases backup storage usage',
      'Verifies that backups are complete, uncorrupted, and actually recoverable within the RTO',
      'Encrypts the production data',
      'Replaces the disaster recovery plan'
    ),
    correct: ['b'],
    explanation: 'Untested backups can be incomplete, corrupted, or unrecoverable. Regular test restores validate that data can actually be recovered correctly and within the required recovery time objective.',
    references: [REF_800_34, REF_800_184]
  },
  {
    domain: IR, difficulty: 2, type: QType.SINGLE,
    stem: 'A recovery site with hardware and connectivity in place but requiring data restoration and some configuration before use is a:',
    options: opts4(
      'Hot site',
      'Warm site',
      'Cold site',
      'Air-gapped site'
    ),
    correct: ['b'],
    explanation: 'A warm site has equipment and connectivity but is not continuously synchronized; recent data must be restored and final configuration completed before operations resume — a middle ground between hot and cold sites.',
    references: [REF_800_34, REF_800_184]
  },
  {
    domain: IR, difficulty: 4, type: QType.SINGLE,
    stem: 'Which sequence correctly reflects evidence handling priorities during live incident response?',
    options: opts4(
      'Preserve volatile data and maintain chain of custody, then contain, then analyze',
      'Wipe the disk first, then investigate',
      'Notify the public before any analysis',
      'Disable logging, then collect evidence'
    ),
    correct: ['a'],
    explanation: 'Forensically sound response preserves the most volatile evidence and documents chain of custody while containing the threat, then performs analysis. Wiping disks or disabling logging destroys evidence and undermines the investigation.',
    references: [REF_800_61, REF_800_115]
  },
  {
    domain: IR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that should be included in an incident response plan.',
    options: opts4(
      'Defined roles, responsibilities, and escalation paths',
      'Detection, triage, containment, eradication, and recovery procedures',
      'Communication and legal/regulatory notification requirements',
      'A statement that no incident should ever be documented'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'An IR plan defines roles/escalation, the procedural playbooks across the life cycle, and communication/notification requirements. Documentation is essential for accountability and lessons learned — never prohibited.',
    references: [REF_800_61, REF_CISA_IR]
  },
  {
    domain: IR, difficulty: 3, type: QType.SINGLE,
    stem: 'After containment of a malware outbreak, the BEST way to ensure a thoroughly compromised server is trustworthy again is to:',
    options: opts4(
      'Run an antivirus scan and immediately return it to service',
      'Rebuild it from known-good media/images and restore validated clean data, then patch and harden before return',
      'Change only the administrator password',
      'Leave it as is and monitor more closely'
    ),
    correct: ['b'],
    explanation: 'For a thoroughly compromised system, rebuilding from trusted media, restoring validated clean data, then patching and hardening provides the strongest assurance the threat is fully removed before returning to service.',
    references: [REF_800_61, REF_800_83]
  },

  // ── Cryptography (6) ──
  {
    domain: CRYPTO, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Encrypting data stored on a server’s disks so it is unreadable if the drives are stolen protects data:',
    options: opts4(
      'In transit',
      'At rest',
      'In use only',
      'Only during backups'
    ),
    correct: ['b'],
    explanation: 'Full-disk or database encryption protects data at rest — stored data — so stolen or improperly disposed media does not disclose information. Data in transit is protected by TLS/IPsec.',
    references: [REF_800_175, REF_800_57]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE,
    stem: 'An HMAC (hash-based message authentication code) provides:',
    options: opts4(
      'Confidentiality only',
      'Integrity and authenticity of a message using a shared secret key',
      'Non-repudiation equivalent to a digital signature',
      'Key exchange'
    ),
    correct: ['b'],
    explanation: 'An HMAC uses a cryptographic hash with a shared secret key to verify both the integrity and the authenticity (sender possesses the key) of a message. It does not provide non-repudiation, since both parties share the key.',
    references: [REF_800_175, REF_800_57]
  },
  {
    domain: CRYPTO, difficulty: 4, type: QType.SINGLE,
    stem: 'Perfect forward secrecy (PFS) in a TLS session ensures that:',
    options: opts4(
      'The server certificate never expires',
      'Compromise of the server’s long-term private key does not allow decryption of previously captured session traffic',
      'No keys are ever used',
      'The same session key is reused forever'
    ),
    correct: ['b'],
    explanation: 'Perfect forward secrecy uses ephemeral key exchange so each session has a unique key not derivable from the server’s long-term private key; thus past recorded sessions remain protected even if that key is later compromised.',
    references: [REF_800_52, REF_800_57]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Why should a unique, random salt be used when hashing each user’s password?',
    options: opts4(
      'To compress the hash',
      'To ensure identical passwords produce different hashes and to defeat precomputed (rainbow table) attacks',
      'To encrypt the database connection',
      'To speed up the hash function'
    ),
    correct: ['b'],
    explanation: 'A unique random salt per password ensures that identical passwords hash differently and makes precomputed rainbow-table attacks infeasible because tables cannot be reused across salted hashes.',
    references: [REF_800_63, REF_800_175]
  },
  {
    domain: CRYPTO, difficulty: 3, type: QType.SINGLE,
    stem: 'Hybrid cryptosystems (e.g., TLS) typically use asymmetric cryptography to:',
    options: opts4(
      'Encrypt the entire bulk data stream for speed',
      'Securely exchange or establish a symmetric session key, which then encrypts the bulk data',
      'Replace hashing entirely',
      'Avoid using any keys'
    ),
    correct: ['b'],
    explanation: 'Hybrid schemes use slower asymmetric cryptography only to authenticate and establish a shared symmetric session key; the fast symmetric cipher then encrypts the bulk traffic, combining the strengths of both.',
    references: [REF_800_52, REF_800_175]
  },
  {
    domain: CRYPTO, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization must securely retire cryptographic keys at end of their crypto-period. The correct key-management action is to:',
    options: opts4(
      'Keep all keys forever in case they are needed',
      'Destroy/zeroize retired keys per policy and revoke associated certificates as appropriate',
      'Email the keys to an archive mailbox',
      'Reuse the retired key for a new system'
    ),
    correct: ['b'],
    explanation: 'Sound key management requires secure destruction (zeroization) of keys at the end of their crypto-period and revocation of related certificates, preventing reuse or recovery of decommissioned keys.',
    references: [REF_800_57, REF_800_175]
  },

  // ── Network and Communications Security (10) ──
  {
    domain: NET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A device that connects different network segments and forwards traffic based on IP addresses, often enforcing ACLs between subnets, is a:',
    options: opts4(
      'Hub',
      'Router',
      'Repeater',
      'Patch panel'
    ),
    correct: ['b'],
    explanation: 'A router operates at Layer 3, forwarding packets between networks/subnets based on IP addressing and can apply access control lists to filter inter-subnet traffic. A hub/repeater simply regenerates signals.',
    references: [REF_800_41, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A honeypot deployed on the network is primarily used to:',
    options: opts4(
      'Serve production traffic',
      'Lure and observe attackers, providing early detection and intelligence while diverting them from real assets',
      'Encrypt all internal traffic',
      'Replace the firewall'
    ),
    correct: ['b'],
    explanation: 'A honeypot is a decoy system designed to attract attackers so their behavior can be detected and studied and to divert them from production assets. It is not used to serve real traffic or replace security controls.',
    references: [REF_800_94, REF_OUTLINE]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'Port security on a switch that limits which MAC addresses may use a port primarily mitigates:',
    options: opts4(
      'Cross-site scripting',
      'Unauthorized device connection and MAC flooding/CAM table attacks',
      'SQL injection',
      'TLS downgrade'
    ),
    correct: ['b'],
    explanation: 'Switch port security restricts the MAC addresses permitted on a port, mitigating unauthorized device attachment and MAC-flooding attacks that try to overflow the CAM table and force the switch to behave like a hub.',
    references: [REF_800_94, REF_800_41]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'Which design BEST limits an attacker’s lateral movement after compromising one internal workstation?',
    options: opts4(
      'A single flat network for simplicity',
      'Microsegmentation with least-privilege east-west traffic policies',
      'Disabling all logging',
      'Allowing any-to-any internal communication'
    ),
    correct: ['b'],
    explanation: 'Microsegmentation enforces granular least-privilege controls on east-west (internal) traffic so a compromised host cannot freely reach other systems, directly limiting lateral movement — a core zero trust practice.',
    references: [REF_800_207, REF_CISA_ZT]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement about a VPN is correct?',
    options: opts4(
      'A VPN makes the endpoint device immune to malware',
      'A VPN provides an encrypted tunnel protecting confidentiality and integrity of traffic over untrusted networks',
      'A VPN removes the need for authentication',
      'A VPN encrypts data at rest on the server'
    ),
    correct: ['b'],
    explanation: 'A VPN creates an encrypted tunnel that protects traffic confidentiality and integrity across untrusted networks. It does not make endpoints malware-proof, replace authentication, or encrypt stored (at-rest) data.',
    references: [REF_800_77, REF_800_41]
  },
  {
    domain: NET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL secure replacements for legacy clear-text protocols.',
    options: opts4(
      'SSH instead of Telnet',
      'SFTP/FTPS instead of plain FTP',
      'SNMPv3 instead of SNMPv1/v2c',
      'HTTP instead of HTTPS'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'SSH, SFTP/FTPS, and SNMPv3 add authentication and encryption over their clear-text predecessors. Replacing HTTPS with HTTP is the opposite of secure — it removes encryption.',
    references: [REF_800_52, REF_800_53]
  },
  {
    domain: NET, difficulty: 2, type: QType.SINGLE,
    stem: 'Out-of-band network management (a separate dedicated management network) improves security by:',
    options: opts4(
      'Making management traffic faster than production',
      'Isolating administrative access from the production data path, reducing exposure of management interfaces to attackers',
      'Encrypting production application data',
      'Removing the need for credentials'
    ),
    correct: ['b'],
    explanation: 'A dedicated out-of-band management network keeps administrative interfaces off the production data path, reducing the attack surface for management access and helping preserve control during an incident on the production network.',
    references: [REF_800_41, REF_800_53]
  },
  {
    domain: NET, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker intercepts and relays communications between two parties who believe they are talking directly to each other. This is a:',
    options: opts4(
      'Man-in-the-middle (on-path) attack',
      'Denial-of-service attack',
      'SQL injection',
      'Privilege escalation'
    ),
    correct: ['a'],
    explanation: 'A man-in-the-middle (on-path) attacker secretly intercepts and possibly alters traffic between two parties. Strong mutual authentication and end-to-end encryption (e.g., properly validated TLS) defend against it.',
    references: [REF_800_52, REF_800_77]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'A web application firewall (WAF) differs from a network firewall because it:',
    options: opts4(
      'Filters only by IP and port',
      'Inspects HTTP(S) application-layer traffic to block web attacks such as injection and XSS',
      'Operates at the physical layer',
      'Encrypts the database'
    ),
    correct: ['b'],
    explanation: 'A WAF inspects application-layer HTTP(S) requests/responses to detect and block web-specific attacks (SQL injection, XSS, etc.), complementing a network firewall that filters primarily on IP/port and state.',
    references: [REF_800_41, REF_800_94]
  },
  {
    domain: NET, difficulty: 3, type: QType.SINGLE,
    stem: 'TLS provides server authentication primarily through:',
    options: opts4(
      'A shared password',
      'An X.509 certificate validated against trusted certificate authorities',
      'The client’s IP address',
      'An unauthenticated Diffie-Hellman exchange alone'
    ),
    correct: ['b'],
    explanation: 'TLS authenticates the server using its X.509 certificate, which the client validates by chaining to a trusted CA and checking validity, name, and revocation — preventing impersonation when properly enforced.',
    references: [REF_800_52, REF_800_57]
  },

  // ── Systems and Application Security (10) ──
  {
    domain: SYS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Ransomware primarily harms an organization by:',
    options: opts4(
      'Improving system performance',
      'Encrypting or destroying data and demanding payment, threatening availability (and often confidentiality via exfiltration)',
      'Patching vulnerabilities automatically',
      'Speeding up backups'
    ),
    correct: ['b'],
    explanation: 'Ransomware encrypts or destroys data and extorts payment, primarily attacking availability; modern variants also exfiltrate data first, adding a confidentiality/extortion dimension. Offline, tested backups are a key defense.',
    references: [REF_CISA_RANSOM, REF_800_83]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'A logic bomb is malicious code that:',
    options: opts4(
      'Self-replicates across networks automatically',
      'Lies dormant and executes its payload when a specific condition or time is met',
      'Is always visible in the task list',
      'Only affects printers'
    ),
    correct: ['b'],
    explanation: 'A logic bomb is dormant code that triggers a malicious payload when a defined condition occurs (a date, an event, an employee’s account being disabled). Unlike a worm it does not self-propagate.',
    references: [REF_800_83, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'Secure software development should integrate security:',
    options: opts4(
      'Only as a final penetration test before release',
      'Throughout the entire SDLC — requirements, design, coding, testing, deployment, and maintenance',
      'Only after a breach occurs',
      'Only in the documentation'
    ),
    correct: ['b'],
    explanation: 'A secure SDLC builds security into every phase — threat modeling in design, secure coding standards, security testing (SAST/DAST), hardened deployment, and ongoing maintenance — which is far more effective than a single late test.',
    references: [REF_800_53, REF_OUTLINE]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'A rootkit is particularly dangerous because it:',
    options: opts4(
      'Always announces itself to the user',
      'Hides its presence and the attacker’s activity, often at a low/privileged level, evading normal detection',
      'Only runs in a sandbox',
      'Cannot maintain persistence'
    ),
    correct: ['b'],
    explanation: 'A rootkit conceals malicious processes, files, and the attacker’s presence — frequently with kernel or firmware-level privileges — making detection and removal difficult and often requiring rebuild from trusted media.',
    references: [REF_800_83, REF_800_61]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Keeping systems patched is a core security operation because unpatched vulnerabilities:',
    options: opts4(
      'Improve performance',
      'Are a leading initial-access vector that attackers actively exploit',
      'Cannot be exploited remotely',
      'Only matter for desktops'
    ),
    correct: ['b'],
    explanation: 'Known, unpatched vulnerabilities are among the most common ways attackers gain initial access. Timely, risk-based patch management closes these exposures before they are exploited.',
    references: [REF_800_40, REF_800_53]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'An attacker exploits a flaw to gain higher rights than originally granted (e.g., from a normal user to administrator). This is:',
    options: opts4(
      'Privilege escalation',
      'A phishing attack',
      'A denial-of-service attack',
      'Steganography'
    ),
    correct: ['a'],
    explanation: 'Privilege escalation is gaining elevated permissions beyond those authorized, often by exploiting a vulnerability or misconfiguration. Least privilege, patching, and hardening reduce its likelihood and impact.',
    references: [REF_800_53, REF_800_83]
  },
  {
    domain: SYS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL effective defenses against ransomware.',
    options: opts4(
      'Maintaining tested, offline/immutable backups',
      'Timely patching and least-privilege access',
      'Email filtering, EDR, and user awareness training',
      'Disabling all backups to avoid encryption of backup files'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Layered ransomware defense includes tested offline/immutable backups, prompt patching, least privilege, email filtering, EDR, and user training. Disabling backups removes the most important recovery capability and increases harm.',
    references: [REF_CISA_RANSOM, REF_800_83]
  },
  {
    domain: SYS, difficulty: 2, type: QType.SINGLE,
    stem: 'Heuristic/behavior-based malware detection is valuable because it can:',
    options: opts4(
      'Only detect malware with a known signature',
      'Detect previously unknown or polymorphic malware by analyzing suspicious behavior',
      'Encrypt the operating system',
      'Replace the need for patching'
    ),
    correct: ['b'],
    explanation: 'Behavioral/heuristic detection identifies malicious activity patterns rather than fixed signatures, enabling detection of new, polymorphic, or fileless threats that signature-based tools miss.',
    references: [REF_800_83, REF_800_94]
  },
  {
    domain: SYS, difficulty: 3, type: QType.SINGLE,
    stem: 'A trusted platform module (TPM) contributes to endpoint security primarily by:',
    options: opts4(
      'Providing more CPU cores',
      'Securely storing cryptographic keys and supporting measured/secure boot and disk-encryption key protection',
      'Acting as a network firewall',
      'Replacing the operating system'
    ),
    correct: ['b'],
    explanation: 'A TPM is a hardware security module on the device that protects cryptographic keys, supports measured/secure boot integrity, and anchors full-disk-encryption keys, strengthening platform and data protection.',
    references: [REF_800_53, REF_800_175]
  },
  {
    domain: SYS, difficulty: 4, type: QType.SINGLE,
    stem: 'A supply-chain attack compromises software security by:',
    options: opts4(
      'Only affecting the network cabling',
      'Injecting malicious code or components via a trusted vendor/update so it is distributed to many downstream victims',
      'Improving code quality',
      'Being limited to a single endpoint with no spread'
    ),
    correct: ['b'],
    explanation: 'A supply-chain attack subverts a trusted software/component or update mechanism so malicious code is delivered to many downstream organizations. Defenses include code signing, integrity verification, vendor risk management, and SBOMs.',
    references: [REF_800_53, REF_800_40]
  }
];

const SSCP_DOMAINS = [
  { name: OPS, weight: 16 },
  { name: AC, weight: 15 },
  { name: RISK, weight: 15 },
  { name: IR, weight: 14 },
  { name: CRYPTO, weight: 9 },
  { name: NET, weight: 16 },
  { name: SYS, weight: 15 }
];

const SSCP_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'isc2-sscp-p1',
    code: 'SSCP-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 180-minute, 65-question, blueprint-weighted set covering security operations & administration, access controls, risk identification/monitoring/analysis, incident response & recovery, cryptography, network & communications security, and systems & application security.',
    questions: P1
  },
  {
    slug: 'isc2-sscp-p2',
    code: 'SSCP-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 180-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'isc2-sscp-p3',
    code: 'SSCP-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 180-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const SSCP_BUNDLE = {
  slug: 'isc2-sscp',
  title: 'ISC2 Systems Security Certified Practitioner (SSCP)',
  description: 'All 3 SSCP practice exams in one bundle — covering security operations & administration, access controls, risk identification/monitoring/analysis, incident response & recovery, cryptography, network & communications security, and systems & application security, aligned to the ISC2 SSCP exam outline.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 28900 // USD 289 — PRACTICE + real-exam voucher tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the ISC2 SSCP bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:sscp-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedSscp(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'isc2' } });
  await db.vendor.upsert({
    where: { slug: 'isc2' },
    update: { name: 'ISC2', description: 'ISC2 cybersecurity certifications — including Certified in Cybersecurity (CC) and the Systems Security Certified Practitioner (SSCP).' },
    create: { slug: 'isc2', name: 'ISC2', description: 'ISC2 cybersecurity certifications — including Certified in Cybersecurity (CC) and the Systems Security Certified Practitioner (SSCP).' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'isc2' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SSCP_EXAMS) {
    const title = `ISC2 SSCP — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the ISC2 SSCP exam outline.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 180,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: SSCP_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:sscp-seed' } });
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
          generatedBy: 'manual:sscp-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SSCP_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SSCP_BUNDLE.slug },
    update: {
      title: SSCP_BUNDLE.title,
      description: SSCP_BUNDLE.description,
      price: SSCP_BUNDLE.price,
      priceVoucher: SSCP_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SSCP_BUNDLE.slug,
      title: SSCP_BUNDLE.title,
      description: SSCP_BUNDLE.description,
      price: SSCP_BUNDLE.price,
      priceVoucher: SSCP_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'isc2-sscp-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'isc2-sscp-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'isc2-sscp-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'isc2-sscp-p1', tier: 'VOUCHER' as const, position: 4 }
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
