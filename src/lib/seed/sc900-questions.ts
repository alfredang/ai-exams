/**
 * SC-900 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:sc900-seed'` and upserts catalog rows.
 *
 * Exported as `seedSc900(db)` so the same code path is reachable from the
 * standalone CLI shim (`prisma/seeds/sc900.ts`) and the protected admin
 * API (`/api/admin/seed-sc900`) — letting us bootstrap the production
 * database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Microsoft Security, Compliance, and Identity Fundamentals
 * (SC-900) domain blueprint:
 *   - Describe the concepts of security, compliance, and identity   — 13% (8)
 *   - Describe the capabilities of Microsoft Entra                  — 27% (18)
 *   - Describe the capabilities of Microsoft security solutions     — 35% (23)
 *   - Describe the capabilities of Microsoft compliance solutions   — 25% (16)
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

const CONCEPTS = 'Describe the concepts of security, compliance, and identity';
const ENTRA = 'Describe the capabilities of Microsoft Entra';
const SECURITY = 'Describe the capabilities of Microsoft security solutions';
const COMPLIANCE = 'Describe the capabilities of Microsoft compliance solutions';

const REF_ZT = { label: 'Microsoft Learn — Zero Trust model', url: 'https://learn.microsoft.com/en-us/security/zero-trust/zero-trust-overview' };
const REF_SHARED = { label: 'Microsoft Learn — Shared responsibility in the cloud', url: 'https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility' };
const REF_ENCRYPT = { label: 'Microsoft Learn — Encryption and hashing', url: 'https://learn.microsoft.com/en-us/azure/security/fundamentals/encryption-overview' };
const REF_DEFENSE = { label: 'Microsoft Learn — Defense in depth', url: 'https://learn.microsoft.com/en-us/azure/security/fundamentals/network-overview' };
const REF_IDENTITY = { label: 'Microsoft Learn — Identity as the primary security perimeter', url: 'https://learn.microsoft.com/en-us/training/modules/explore-basic-services-identity-types/' };
const REF_AUTHN = { label: 'Microsoft Learn — Authentication vs authorization', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/authentication-vs-authorization' };
const REF_ENTRA = { label: 'Microsoft Learn — What is Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/whatis' };
const REF_ENTRA_IDENT = { label: 'Microsoft Learn — Identity types in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/how-to-create-delete-users' };
const REF_MFA = { label: 'Microsoft Learn — How Microsoft Entra multifactor authentication works', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks' };
const REF_PWLESS = { label: 'Microsoft Learn — Passwordless authentication options', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless' };
const REF_CA = { label: 'Microsoft Learn — What is Conditional Access', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview' };
const REF_SSPR = { label: 'Microsoft Learn — Self-service password reset', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sspr-howitworks' };
const REF_PIM = { label: 'Microsoft Learn — What is Privileged Identity Management', url: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure' };
const REF_ACCREV = { label: 'Microsoft Learn — What are access reviews', url: 'https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview' };
const REF_ENTITLE = { label: 'Microsoft Learn — What is entitlement management', url: 'https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-overview' };
const REF_RBAC = { label: 'Microsoft Learn — Microsoft Entra built-in roles', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference' };
const REF_B2B = { label: 'Microsoft Learn — B2B collaboration overview', url: 'https://learn.microsoft.com/en-us/entra/external-id/what-is-b2b' };
const REF_HYBRID = { label: 'Microsoft Learn — Microsoft Entra hybrid identity', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/whatis-hybrid-identity' };
const REF_IDPROT = { label: 'Microsoft Learn — What is Microsoft Entra ID Protection', url: 'https://learn.microsoft.com/en-us/entra/id-protection/overview-identity-protection' };
const REF_DEFCLOUD = { label: 'Microsoft Learn — What is Microsoft Defender for Cloud', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction' };
const REF_SENTINEL = { label: 'Microsoft Learn — What is Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/overview' };
const REF_XDR = { label: 'Microsoft Learn — What is Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender' };
const REF_DEFO365 = { label: 'Microsoft Learn — Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/mdo-about' };
const REF_DEFEP = { label: 'Microsoft Learn — Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-endpoint' };
const REF_DEFID = { label: 'Microsoft Learn — Microsoft Defender for Identity', url: 'https://learn.microsoft.com/en-us/defender-for-identity/what-is' };
const REF_MCAS = { label: 'Microsoft Learn — Microsoft Defender for Cloud Apps overview', url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/what-is-defender-for-cloud-apps' };
const REF_SECSCORE = { label: 'Microsoft Learn — Microsoft Secure Score', url: 'https://learn.microsoft.com/en-us/defender-xdr/microsoft-secure-score' };
const REF_NSG = { label: 'Microsoft Learn — Network security groups', url: 'https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview' };
const REF_FW = { label: 'Microsoft Learn — What is Azure Firewall', url: 'https://learn.microsoft.com/en-us/azure/firewall/overview' };
const REF_DDOS = { label: 'Microsoft Learn — Azure DDoS Protection overview', url: 'https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview' };
const REF_BASTION = { label: 'Microsoft Learn — What is Azure Bastion', url: 'https://learn.microsoft.com/en-us/azure/bastion/bastion-overview' };
const REF_KEYVAULT = { label: 'Microsoft Learn — About Azure Key Vault', url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/overview' };
const REF_PURVIEW = { label: 'Microsoft Learn — Microsoft Purview compliance portal', url: 'https://learn.microsoft.com/en-us/purview/microsoft-365-compliance-center' };
const REF_CMGR = { label: 'Microsoft Learn — Microsoft Purview Compliance Manager', url: 'https://learn.microsoft.com/en-us/purview/compliance-manager' };
const REF_SENSLBL = { label: 'Microsoft Learn — Learn about sensitivity labels', url: 'https://learn.microsoft.com/en-us/purview/sensitivity-labels' };
const REF_DLP = { label: 'Microsoft Learn — Learn about data loss prevention', url: 'https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp' };
const REF_RETENTION = { label: 'Microsoft Learn — Learn about retention policies and labels', url: 'https://learn.microsoft.com/en-us/purview/retention' };
const REF_EDISCOVERY = { label: 'Microsoft Learn — Learn about eDiscovery solutions', url: 'https://learn.microsoft.com/en-us/purview/ediscovery' };
const REF_INSIDER = { label: 'Microsoft Learn — Learn about insider risk management', url: 'https://learn.microsoft.com/en-us/purview/insider-risk-management' };
const REF_AUDIT = { label: 'Microsoft Learn — Learn about auditing solutions', url: 'https://learn.microsoft.com/en-us/purview/audit-solutions-overview' };
const REF_DATACLASS = { label: 'Microsoft Learn — Learn about data classification', url: 'https://learn.microsoft.com/en-us/purview/data-classification-overview' };
const REF_CB = { label: 'Microsoft Learn — Learn about communication compliance', url: 'https://learn.microsoft.com/en-us/purview/communication-compliance' };
const REF_TRUST = { label: 'Microsoft Learn — Microsoft Service Trust Portal', url: 'https://learn.microsoft.com/en-us/purview/get-started-with-service-trust-portal' };
const REF_PRIORITY = { label: 'Microsoft Learn — Microsoft Priva Privacy Risk Management', url: 'https://learn.microsoft.com/en-us/privacy/priva/risk-management' };
const REF_IRM = { label: 'Microsoft Learn — Learn about information barriers', url: 'https://learn.microsoft.com/en-us/purview/information-barriers' };
const REF_SCFND = { label: 'Microsoft Learn — Describe security and compliance concepts', url: 'https://learn.microsoft.com/en-us/training/modules/describe-security-compliance-concepts/' };
const REF_GOV = { label: 'Microsoft Learn — Microsoft Entra ID Governance', url: 'https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview' };
const REF_LICENSE = { label: 'Microsoft Learn — Microsoft Entra ID licensing', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/licensing' };
const REF_DEVICE = { label: 'Microsoft Learn — Microsoft Entra device identity', url: 'https://learn.microsoft.com/en-us/entra/identity/devices/overview' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Concepts of security, compliance, and identity (8) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'The Zero Trust model is built on a set of guiding principles. Which statement best captures its core philosophy?',
    options: opts4(
      'Trust everything inside the corporate network and verify only external traffic.',
      'Never trust, always verify — authenticate and authorize every request explicitly.',
      'Trust is granted permanently once a device joins the domain.',
      'Security is enforced only at the network firewall.'
    ),
    correct: ['b'],
    explanation: 'Zero Trust assumes breach and treats every access request as if it originates from an uncontrolled network. Its core principles are verify explicitly, use least-privilege access, and assume breach. Trust is never implicit based on network location.',
    references: [REF_ZT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'In the cloud shared responsibility model, who is always responsible for protecting the data and identities regardless of the service model (IaaS, PaaS, or SaaS)?',
    options: opts4(
      'The cloud provider',
      'The customer',
      'A neutral third-party auditor',
      'Responsibility is split evenly by contract'
    ),
    correct: ['b'],
    explanation: 'Across IaaS, PaaS, and SaaS, the customer always retains responsibility for their data, devices, accounts, and identities. What shifts to the provider as you move toward SaaS is the operating system, network, and physical infrastructure.',
    references: [REF_SHARED]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which trio of properties is described by the CIA triad in information security?',
    options: opts4(
      'Control, Identity, Auditing',
      'Confidentiality, Integrity, Availability',
      'Compliance, Identity, Authentication',
      'Containment, Isolation, Access'
    ),
    correct: ['b'],
    explanation: 'The CIA triad stands for Confidentiality (data is accessible only to authorized parties), Integrity (data is accurate and unaltered), and Availability (data and systems are accessible when needed).',
    references: [REF_SCFND]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A file is scrambled with an algorithm and a key so that only a holder of the matching key can read it. Which security control does this describe?',
    options: opts4(
      'Hashing',
      'Encryption',
      'Tokenization indexing',
      'Compression'
    ),
    correct: ['b'],
    explanation: 'Encryption transforms readable data into an unreadable form using an algorithm and a key; the data can be returned to plaintext with the correct key. Hashing is a one-way function and is not reversible.',
    references: [REF_ENCRYPT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the key difference between symmetric and asymmetric encryption?',
    options: opts4(
      'Symmetric uses one shared key for encrypt and decrypt; asymmetric uses a public/private key pair.',
      'Symmetric is always more secure than asymmetric.',
      'Asymmetric encryption cannot be used over the internet.',
      'Symmetric encryption does not require any key.'
    ),
    correct: ['a'],
    explanation: 'Symmetric encryption uses the same secret key to encrypt and decrypt. Asymmetric encryption uses a mathematically related public and private key pair, where data encrypted with one key is decrypted with the other.',
    references: [REF_ENCRYPT]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'In modern security, identity is often described as the new primary security perimeter, replacing the traditional network perimeter.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'With cloud apps and remote work, controls can no longer rely solely on a network boundary. Identity becomes the primary perimeter because access decisions are made based on who the user is, the device, and conditions of the request.',
    references: [REF_IDENTITY]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes authentication from authorization?',
    options: opts4(
      'Authentication grants permissions; authorization proves identity.',
      'Authentication proves who you are; authorization determines what you can access.',
      'They are two names for the same process.',
      'Authorization always happens before authentication.'
    ),
    correct: ['b'],
    explanation: 'Authentication (AuthN) verifies the identity of a user or service. Authorization (AuthZ) decides what an authenticated identity is allowed to do. Authentication always precedes authorization.',
    references: [REF_AUTHN]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL principles that are part of the Zero Trust guiding model.',
    options: opts4(
      'Verify explicitly',
      'Use least-privilege access',
      'Assume breach',
      'Trust all internal traffic implicitly'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The three Zero Trust principles are verify explicitly, use least-privilege access (just-enough-access and just-in-time), and assume breach. Implicitly trusting internal traffic is the opposite of Zero Trust.',
    references: [REF_ZT]
  },

  // ── Microsoft Entra (18) ──
  {
    domain: ENTRA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is Microsoft Entra ID?',
    options: opts4(
      'An on-premises file server role',
      'A cloud-based identity and access management service',
      'A relational database service',
      'A network firewall appliance'
    ),
    correct: ['b'],
    explanation: 'Microsoft Entra ID (formerly Azure Active Directory) is Microsoft’s cloud-based identity and access management service that helps users sign in and access internal and external resources.',
    references: [REF_ENTRA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Entra identity is used by an application or service to authenticate and access resources without a human signing in?',
    options: opts4(
      'A guest user',
      'A service principal / managed identity',
      'A member user',
      'A distribution group'
    ),
    correct: ['b'],
    explanation: 'Workload identities such as service principals and managed identities let applications, services, and automation authenticate to Microsoft Entra ID without an interactive user. Managed identities remove the need to manage credentials.',
    references: [REF_ENTRA_IDENT]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A partner from another organization is invited to collaborate on a SharePoint site. What type of Microsoft Entra account is typically created for them?',
    options: opts4(
      'A guest (B2B) user',
      'A member user',
      'A service principal',
      'A hybrid synced user'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra B2B collaboration creates a guest user object for the external partner so they can be granted access using their own identity, without you managing their credentials.',
    references: [REF_B2B]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which authentication method requires the user to provide two or more verification factors of different types?',
    options: opts4(
      'Single sign-on',
      'Multifactor authentication (MFA)',
      'Password-only sign-in',
      'Kerberos delegation'
    ),
    correct: ['b'],
    explanation: 'MFA requires two or more factors from different categories — something you know (password), something you have (phone/token), or something you are (biometric) — significantly increasing account security.',
    references: [REF_MFA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is an example of passwordless authentication in Microsoft Entra ID?',
    options: opts4(
      'Username and a complex password',
      'Windows Hello for Business',
      'A security question challenge',
      'A shared service account password'
    ),
    correct: ['b'],
    explanation: 'Passwordless methods replace the password entirely. Windows Hello for Business, the Microsoft Authenticator app, and FIDO2 security keys are the main passwordless options in Microsoft Entra ID.',
    references: [REF_PWLESS]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A Conditional Access policy is configured to require MFA when users access an app from outside the corporate network. Which Conditional Access component expresses the "from outside the corporate network" part?',
    options: opts4(
      'Grant control',
      'Assignment condition (location/signal)',
      'Session control',
      'Authentication strength'
    ),
    correct: ['b'],
    explanation: 'A Conditional Access policy combines signals (assignments/conditions such as user, location, device, risk) with decisions (grant or block, with controls like MFA). Network location is evaluated as a condition/signal in the assignments.',
    references: [REF_CA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature lets users reset their own passwords without contacting the help desk?',
    options: opts4(
      'Self-service password reset (SSPR)',
      'Privileged Identity Management',
      'Conditional Access',
      'Access reviews'
    ),
    correct: ['a'],
    explanation: 'Self-service password reset (SSPR) allows users to change or reset their password with no administrator or help desk involvement, after registering authentication methods.',
    references: [REF_SSPR]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization wants administrators to activate the Global Administrator role only when needed, for a limited time, with approval and justification. Which Microsoft Entra capability provides this?',
    options: opts4(
      'Privileged Identity Management (PIM)',
      'Self-service password reset',
      'Conditional Access',
      'B2B collaboration'
    ),
    correct: ['a'],
    explanation: 'Privileged Identity Management (PIM) provides just-in-time privileged access, time-bound assignments, approval workflows, justification, and alerting for privileged roles such as Global Administrator.',
    references: [REF_PIM]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Entra ID Governance feature is used to periodically recertify whether users still need their group memberships, app access, or role assignments?',
    options: opts4(
      'Access reviews',
      'Conditional Access',
      'Multifactor authentication',
      'Identity Protection'
    ),
    correct: ['a'],
    explanation: 'Access reviews let organizations efficiently manage group memberships, application access, and role assignments by having reviewers recertify access on a recurring basis to reduce stale or excessive access.',
    references: [REF_ACCREV]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Entra ID Governance feature bundles groups, apps, and roles into an access package that users can request, with approval and expiration?',
    options: opts4(
      'Entitlement management',
      'Conditional Access',
      'Identity Protection',
      'Hybrid identity'
    ),
    correct: ['a'],
    explanation: 'Entitlement management uses access packages to bundle the resources (groups, apps, SharePoint sites) a user needs, with request workflows, approvals, automatic expiration, and access reviews.',
    references: [REF_ENTITLE]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What does Microsoft Entra ID Protection primarily do?',
    options: opts4(
      'Encrypts files at rest in storage accounts',
      'Detects, investigates, and remediates identity-based risks such as risky sign-ins and risky users',
      'Provides a virtual network firewall',
      'Performs eDiscovery searches on mailboxes'
    ),
    correct: ['b'],
    explanation: 'Microsoft Entra ID Protection uses signals and machine learning to detect identity risks (e.g., leaked credentials, anonymous IP, atypical travel), assigns risk levels, and enables automated risk-based Conditional Access remediation.',
    references: [REF_IDPROT]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Single sign-on (SSO) in Microsoft Entra ID provides which primary benefit?',
    options: opts4(
      'Users authenticate once and access multiple applications without re-entering credentials.',
      'It removes the need for any authentication.',
      'It encrypts all network traffic between data centers.',
      'It automatically classifies documents.'
    ),
    correct: ['a'],
    explanation: 'SSO allows a user to sign in once and gain access to multiple connected applications without being prompted to authenticate again, improving usability while centralizing identity control.',
    references: [REF_ENTRA]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'In a hybrid identity scenario, which tool synchronizes on-premises Active Directory identities to Microsoft Entra ID?',
    options: opts4(
      'Microsoft Entra Connect',
      'Azure Bastion',
      'Microsoft Sentinel',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra Connect (and Entra Cloud Sync) synchronizes on-premises directory objects to Microsoft Entra ID, enabling a common hybrid identity that users use for both on-premises and cloud resources.',
    references: [REF_HYBRID]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Entra concept allows access policies and management based on whether a device is registered or joined to the directory?',
    options: opts4(
      'Device identity',
      'Service principal',
      'Distribution list',
      'Information barrier'
    ),
    correct: ['a'],
    explanation: 'Device identities (registered, Microsoft Entra joined, or hybrid joined) give the directory a representation of the device so policies such as Conditional Access can require compliant or managed devices.',
    references: [REF_DEVICE]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are valid Microsoft Entra authentication or verification methods.',
    options: opts4(
      'Microsoft Authenticator app',
      'FIDO2 security key',
      'SMS text message code',
      'A network security group rule'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The Microsoft Authenticator app, FIDO2 security keys, and SMS codes are all supported Entra authentication/verification methods. A network security group is an Azure networking control, not an identity authentication method.',
    references: [REF_MFA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of role-based access control (RBAC) using Microsoft Entra built-in roles?',
    options: opts4(
      'To grant permissions based on the role assigned to an identity, following least privilege',
      'To encrypt data at rest',
      'To detect malware on endpoints',
      'To classify documents automatically'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra RBAC grants administrative permissions through roles (e.g., User Administrator, Helpdesk Administrator) so identities receive only the privileges needed for their job, supporting least privilege.',
    references: [REF_RBAC]
  },
  {
    domain: ENTRA, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Entra ID and on-premises Active Directory Domain Services are the same product with the same protocols.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'They are different. AD DS is an on-premises directory using Kerberos/LDAP and organizational units. Microsoft Entra ID is a cloud identity service using modern protocols such as SAML, OAuth 2.0, and OpenID Connect.',
    references: [REF_ENTRA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about Microsoft Entra ID Governance is correct?',
    options: opts4(
      'It helps organizations ensure the right people have the right access to the right resources at the right time.',
      'It is a malware scanning engine for endpoints.',
      'It replaces Azure Firewall.',
      'It provides eDiscovery legal holds.'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra ID Governance balances security and productivity by managing the identity lifecycle and access lifecycle — entitlement management, access reviews, PIM, and lifecycle workflows ensure the right access at the right time.',
    references: [REF_GOV]
  },

  // ── Microsoft security solutions (23) ──
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure service is a cloud-native SIEM and SOAR solution for collecting, detecting, investigating, and responding to threats across the enterprise?',
    options: opts4(
      'Microsoft Sentinel',
      'Azure Key Vault',
      'Azure Bastion',
      'Microsoft Entra ID'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel is a cloud-native security information and event management (SIEM) and security orchestration, automation, and response (SOAR) solution that provides intelligent security analytics across the enterprise.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary purpose of Microsoft Defender for Cloud?',
    options: opts4(
      'It provides cloud security posture management and workload protection across Azure, hybrid, and multicloud.',
      'It is an email client.',
      'It is a relational database.',
      'It manages user passwords.'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender for Cloud is a cloud security posture management (CSPM) and cloud workload protection platform (CWPP) that assesses configurations, provides secure score and recommendations, and protects workloads across Azure, on-premises, and other clouds.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Microsoft Defender XDR coordinates protection across several Defender workloads. Which workload protects email and collaboration tools like Teams and SharePoint?',
    options: opts4(
      'Microsoft Defender for Office 365',
      'Microsoft Defender for Endpoint',
      'Microsoft Defender for Identity',
      'Microsoft Defender for Cloud Apps'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender for Office 365 protects against threats in email and collaboration tools (Exchange, Teams, SharePoint, OneDrive), including phishing, malicious attachments (Safe Attachments), and links (Safe Links).',
    references: [REF_DEFO365]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Defender XDR workload focuses on endpoint detection and response (EDR) for devices such as Windows, macOS, and Linux?',
    options: opts4(
      'Microsoft Defender for Endpoint',
      'Microsoft Defender for Office 365',
      'Microsoft Sentinel',
      'Azure Firewall'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender for Endpoint provides endpoint protection, attack surface reduction, EDR, automated investigation and remediation, and threat and vulnerability management for managed devices.',
    references: [REF_DEFEP]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Defender XDR workload uses signals from on-premises Active Directory Domain Services to detect identity threats such as lateral movement and reconnaissance?',
    options: opts4(
      'Microsoft Defender for Identity',
      'Microsoft Defender for Office 365',
      'Microsoft Defender for Cloud Apps',
      'Microsoft Defender for Cloud'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender for Identity uses sensors on domain controllers to monitor on-premises Active Directory, detecting compromised identities, lateral movement, and advanced attacks targeting the identity infrastructure.',
    references: [REF_DEFID]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which solution acts as a cloud access security broker (CASB) to give visibility and control over the cloud apps and SaaS services users access?',
    options: opts4(
      'Microsoft Defender for Cloud Apps',
      'Azure Bastion',
      'Microsoft Entra Connect',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender for Cloud Apps is a cloud access security broker (CASB) that provides discovery of shadow IT, information protection, threat detection, and conditional access app control for SaaS applications.',
    references: [REF_MCAS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Microsoft Secure Score helps an organization do what?',
    options: opts4(
      'Measure and improve its security posture with a numeric score and recommended actions',
      'Encrypt all virtual machine disks',
      'Provide a VPN gateway',
      'Run eDiscovery cases'
    ),
    correct: ['a'],
    explanation: 'Microsoft Secure Score is a measurement of an organization’s security posture, with a higher number indicating more recommended actions taken. It provides prioritized improvement actions across identity, devices, apps, and data.',
    references: [REF_SECSCORE]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure networking control filters inbound and outbound traffic to Azure resources using allow/deny rules based on source, destination, port, and protocol?',
    options: opts4(
      'Network security group (NSG)',
      'Azure Key Vault',
      'Microsoft Sentinel',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'A network security group (NSG) contains security rules that allow or deny inbound and outbound network traffic to Azure resources based on five-tuple criteria (source/destination IP, port, protocol).',
    references: [REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'What is Azure Firewall?',
    options: opts4(
      'A managed, cloud-based network security service that protects Azure virtual network resources',
      'A document classification engine',
      'An identity provider',
      'A backup service'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall is a managed, cloud-based, stateful network security service with high availability and scalability that protects Azure Virtual Network resources, supporting application and network rules and threat intelligence filtering.',
    references: [REF_FW]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure service helps protect applications and resources from volumetric and protocol attacks designed to exhaust resources?',
    options: opts4(
      'Azure DDoS Protection',
      'Azure Key Vault',
      'Microsoft Purview',
      'Microsoft Entra ID Protection'
    ),
    correct: ['a'],
    explanation: 'Azure DDoS Protection defends against distributed denial-of-service attacks by providing always-on traffic monitoring, adaptive tuning, and mitigation of volumetric, protocol, and resource-layer attacks.',
    references: [REF_DDOS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure Bastion provides which capability?',
    options: opts4(
      'Secure RDP/SSH connectivity to virtual machines directly in the portal without exposing public IPs',
      'Email anti-phishing',
      'Document sensitivity labeling',
      'Distributed denial-of-service mitigation'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion is a fully managed PaaS service that provides secure RDP and SSH access to virtual machines over TLS directly from the Azure portal, removing the need for public IP addresses on the VMs.',
    references: [REF_BASTION]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service securely stores and manages secrets, keys, and certificates?',
    options: opts4(
      'Azure Key Vault',
      'Microsoft Sentinel',
      'Azure Bastion',
      'Microsoft Defender for Endpoint'
    ),
    correct: ['a'],
    explanation: 'Azure Key Vault is a centralized cloud service for securely storing and accessing secrets, encryption keys, and certificates, with access controlled by Microsoft Entra ID and policies.',
    references: [REF_KEYVAULT]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In Microsoft Sentinel, which component connects data sources such as Microsoft Entra ID, Office 365, and Azure resources so their logs can be ingested?',
    options: opts4(
      'Data connectors',
      'Sensitivity labels',
      'Access packages',
      'Information barriers'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel uses data connectors to ingest data from Microsoft and third-party sources. Once connected, analytics rules, workbooks, and automation (playbooks) detect and respond to threats.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A security analyst wants a single portal to investigate an incident that spans email, endpoints, and identities with correlated alerts. Which solution provides this unified incident view?',
    options: opts4(
      'Microsoft Defender XDR portal',
      'Azure Key Vault',
      'Microsoft Entra Connect',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender XDR (in the Microsoft Defender portal) correlates alerts from Defender for Endpoint, Office 365, Identity, and Cloud Apps into unified incidents, enabling cross-domain investigation and automated response.',
    references: [REF_XDR]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Defense in depth is best described as which approach?',
    options: opts4(
      'Using multiple layers of security controls so that if one fails, others still protect assets',
      'Relying on a single strong firewall',
      'Disabling all logging to reduce overhead',
      'Granting all users administrator rights for convenience'
    ),
    correct: ['a'],
    explanation: 'Defense in depth applies layered controls (physical, identity, perimeter, network, compute, application, data) so that a failure or breach in one layer does not compromise the entire system.',
    references: [REF_DEFENSE]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL workloads that are part of Microsoft Defender XDR.',
    options: opts4(
      'Microsoft Defender for Endpoint',
      'Microsoft Defender for Office 365',
      'Microsoft Defender for Identity',
      'Azure Key Vault'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Microsoft Defender XDR includes Defender for Endpoint, Defender for Office 365, Defender for Identity, and Defender for Cloud Apps. Azure Key Vault is a secrets management service, not part of Defender XDR.',
    references: [REF_XDR]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Defender for Office 365 feature opens attachments in a sandbox to detect malicious behavior before delivery?',
    options: opts4(
      'Safe Attachments',
      'Safe Links',
      'Conditional Access',
      'Just-in-time VM access'
    ),
    correct: ['a'],
    explanation: 'Safe Attachments detonates email attachments in a virtual sandbox to detect malicious content before the message reaches the user. Safe Links provides time-of-click URL protection.',
    references: [REF_DEFO365]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'In Microsoft Defender for Cloud, what does the secure score on the dashboard represent?',
    options: opts4(
      'A measure of the current security posture of your assessed cloud resources with recommendations to improve it',
      'The monthly cost of cloud resources',
      'The number of users in the tenant',
      'The amount of storage consumed'
    ),
    correct: ['a'],
    explanation: 'The Defender for Cloud secure score aggregates security findings into a single score reflecting the posture of assessed resources, with prioritized recommendations to remediate misconfigurations and improve the score.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Sentinel can use playbooks to automate responses to incidents.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Microsoft Sentinel’s SOAR capabilities use playbooks (built on Azure Logic Apps) to automate and orchestrate responses to alerts and incidents, such as enriching, notifying, or remediating.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best describes the relationship between SIEM and SOAR in Microsoft Sentinel?',
    options: opts4(
      'SIEM collects and analyzes security data; SOAR automates and orchestrates the response to findings.',
      'SIEM encrypts data; SOAR classifies documents.',
      'SIEM manages identities; SOAR manages firewalls.',
      'They are unrelated and cannot be used together.'
    ),
    correct: ['a'],
    explanation: 'SIEM (security information and event management) aggregates and analyzes log data to detect threats. SOAR (security orchestration, automation, and response) automates and coordinates the response. Microsoft Sentinel combines both.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Defender for Cloud capability protects specific resource types such as servers, storage, SQL, and containers with advanced threat detection?',
    options: opts4(
      'Defender plans (cloud workload protection)',
      'Conditional Access',
      'Sensitivity labels',
      'Access reviews'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud offers enhanced security via Defender plans (e.g., Defender for Servers, Storage, SQL, Containers) that add cloud workload protection with advanced threat detection for those resource types.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which solution would a Security Operations Center (SOC) analyst primarily use to hunt across long-term aggregated logs from many sources using a query language?',
    options: opts4(
      'Microsoft Sentinel',
      'Azure Bastion',
      'Microsoft Entra Connect',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel stores ingested data in a Log Analytics workspace and supports proactive threat hunting using Kusto Query Language (KQL) across large volumes of aggregated security data.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Defender for Office 365 capability provides post-breach automated investigation and remediation of email threats?',
    options: opts4(
      'Automated investigation and response (AIR)',
      'Network security groups',
      'Sensitivity labels',
      'Self-service password reset'
    ),
    correct: ['a'],
    explanation: 'Defender for Office 365 includes automated investigation and response (AIR), which triggers investigation playbooks on alerts and recommends or applies remediation actions, reducing manual SOC effort.',
    references: [REF_DEFO365]
  },

  // ── Microsoft compliance solutions (16) ──
  {
    domain: COMPLIANCE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft solution provides a unified set of tools for data governance, risk, and compliance, including information protection and data loss prevention?',
    options: opts4(
      'Microsoft Purview',
      'Microsoft Sentinel',
      'Azure Bastion',
      'Microsoft Entra Connect'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview brings together compliance and risk solutions — information protection, data loss prevention, records management, eDiscovery, insider risk, and Compliance Manager — in a unified portal.',
    references: [REF_PURVIEW]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'What does Microsoft Purview Compliance Manager provide?',
    options: opts4(
      'A risk-based compliance score and assessments mapped to regulations and standards',
      'A network firewall',
      'An endpoint antivirus engine',
      'A password reset portal'
    ),
    correct: ['a'],
    explanation: 'Compliance Manager helps manage regulatory compliance with assessments, a compliance score, and improvement actions mapped to standards and regulations (e.g., ISO 27001, GDPR), tracking both Microsoft-managed and customer-managed controls.',
    references: [REF_CMGR]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft Purview capability classifies and protects documents and emails by applying labels that can enforce encryption and visual markings?',
    options: opts4(
      'Sensitivity labels',
      'Network security groups',
      'Conditional Access',
      'Access packages'
    ),
    correct: ['a'],
    explanation: 'Sensitivity labels (part of Microsoft Purview Information Protection) classify and protect content by applying encryption, content markings (headers/footers/watermarks), and access restrictions that travel with the file.',
    references: [REF_SENSLBL]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary purpose of a data loss prevention (DLP) policy in Microsoft Purview?',
    options: opts4(
      'To detect and help prevent the risky or accidental sharing of sensitive information',
      'To back up virtual machines',
      'To assign Microsoft Entra roles',
      'To monitor network bandwidth'
    ),
    correct: ['a'],
    explanation: 'DLP policies identify, monitor, and protect sensitive information (such as credit card or national ID numbers) across services like Exchange, SharePoint, OneDrive, Teams, and endpoints, blocking or warning on risky sharing.',
    references: [REF_DLP]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Purview capability ensures content is kept for a required period and then deleted, supporting regulatory and legal requirements?',
    options: opts4(
      'Retention policies and labels',
      'Conditional Access policies',
      'Sensitivity labels',
      'Network security groups'
    ),
    correct: ['a'],
    explanation: 'Retention policies and retention labels govern how long content is kept and whether it is deleted afterward, helping organizations comply with regulations and reduce risk from over-retention.',
    references: [REF_RETENTION]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft Purview solution helps organizations identify, hold, collect, and review content relevant to an investigation or litigation?',
    options: opts4(
      'eDiscovery',
      'Microsoft Sentinel',
      'Azure Firewall',
      'Microsoft Entra ID Protection'
    ),
    correct: ['a'],
    explanation: 'eDiscovery solutions (Content search, eDiscovery Standard, eDiscovery Premium) help locate and act on content for legal cases, including legal holds, search, review, and export.',
    references: [REF_EDISCOVERY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Purview solution helps detect and manage risky activities by internal users, such as data theft by a departing employee?',
    options: opts4(
      'Insider risk management',
      'Conditional Access',
      'Azure DDoS Protection',
      'Microsoft Defender for Endpoint'
    ),
    correct: ['a'],
    explanation: 'Insider risk management uses policies and signals to detect, investigate, and act on potentially risky internal activities (e.g., data leaks, IP theft, security policy violations) while protecting user privacy with pseudonymization.',
    references: [REF_INSIDER]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Purview capability records user and admin activities so they can be searched for investigations and compliance?',
    options: opts4(
      'Auditing solutions (Audit Standard/Premium)',
      'Sensitivity labels',
      'Conditional Access',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview auditing logs user and administrator activities across Microsoft 365 services. Audit (Standard) provides core logging; Audit (Premium) adds longer retention and intelligent insights.',
    references: [REF_AUDIT]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'What does data classification in Microsoft Purview help an organization do?',
    options: opts4(
      'Discover and categorize sensitive data using trainable classifiers and sensitive information types',
      'Block all inbound network traffic',
      'Assign privileged roles just in time',
      'Provide RDP access to VMs'
    ),
    correct: ['a'],
    explanation: 'Data classification uses sensitive information types and trainable classifiers to identify and categorize data across the organization, providing insight via content explorer and activity explorer to drive protection policies.',
    references: [REF_DATACLASS]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Purview solution helps detect inappropriate messages (e.g., harassment or sensitive data sharing) in communications like email and Teams?',
    options: opts4(
      'Communication compliance',
      'Entitlement management',
      'Azure Firewall',
      'Microsoft Secure Score'
    ),
    correct: ['a'],
    explanation: 'Communication compliance detects, captures, and helps remediate inappropriate or risky messages (offensive language, sensitive information, regulatory violations) in Microsoft 365 communications while supporting privacy controls.',
    references: [REF_CB]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which portal provides audit reports, certifications, and compliance documentation about Microsoft cloud services?',
    options: opts4(
      'Microsoft Service Trust Portal',
      'Azure Bastion',
      'Microsoft Sentinel',
      'Microsoft Entra admin center'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Service Trust Portal is a public site that provides audit reports, compliance guides, and details about how Microsoft cloud services protect customer data and meet regulatory standards.',
    references: [REF_TRUST]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft solution helps organizations identify and protect personal data and manage subject rights requests for privacy regulations?',
    options: opts4(
      'Microsoft Priva',
      'Microsoft Sentinel',
      'Azure Key Vault',
      'Microsoft Defender for Identity'
    ),
    correct: ['a'],
    explanation: 'Microsoft Priva (Priva Privacy Risk Management and Subject Rights Requests) helps organizations discover personal data, mitigate privacy risks, and automate the handling of data subject requests.',
    references: [REF_PRIORITY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Purview capability restricts communication between groups of users to avoid conflicts of interest, such as separating a research team from a brokerage team?',
    options: opts4(
      'Information barriers',
      'Sensitivity labels',
      'Retention policies',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'Information barriers are policies that prevent or limit communication and collaboration between specific groups of users to avoid conflicts of interest and meet regulatory or ethical wall requirements.',
    references: [REF_IRM]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Compliance Manager, what are improvement actions?',
    options: opts4(
      'Recommended steps the organization can take to improve its compliance posture and score',
      'Firewall rules to block traffic',
      'Identity authentication factors',
      'Storage replication settings'
    ),
    correct: ['a'],
    explanation: 'Improvement actions are recommended controls and tasks (with assigned points) in Compliance Manager. Completing customer-managed actions raises the compliance score and reduces risk.',
    references: [REF_CMGR]
  },
  {
    domain: COMPLIANCE, difficulty: 1, type: QType.SINGLE,
    stem: 'Sensitivity labels can apply encryption that stays with a document even after it leaves the organization.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Sensitivity labels can enforce encryption and usage rights that persist with the file regardless of where it is stored or shared, so protection travels with the content outside the organization.',
    references: [REF_SENSLBL]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL solutions that are part of Microsoft Purview.',
    options: opts4(
      'Data loss prevention (DLP)',
      'Insider risk management',
      'eDiscovery',
      'Azure Bastion'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DLP, insider risk management, and eDiscovery are all Microsoft Purview compliance solutions. Azure Bastion is a networking/security service for secure VM access, not part of Purview.',
    references: [REF_PURVIEW]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Concepts of security, compliance, and identity (8) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization moves from an on-premises datacenter to a SaaS application. Under the shared responsibility model, which responsibility shifts most fully to the cloud provider?',
    options: opts4(
      'Protecting account data and identities',
      'Classifying its own business documents',
      'Managing the physical hosts, operating system, and application infrastructure',
      'Deciding which users get access'
    ),
    correct: ['c'],
    explanation: 'With SaaS, the provider manages physical hosts, the operating system, and the application layer. The customer always retains responsibility for data, identities, and access decisions regardless of the service model.',
    references: [REF_SHARED]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about hashing is correct?',
    options: opts4(
      'Hashing is reversible with the correct key.',
      'Hashing converts data to a fixed-length value and is a one-way function.',
      'Hashing is the same as symmetric encryption.',
      'Hashing requires a public/private key pair.'
    ),
    correct: ['b'],
    explanation: 'Hashing produces a fixed-length value (hash) from input data and is one-way — you cannot reverse a hash to get the original data. It is commonly used to store passwords and verify integrity.',
    references: [REF_ENCRYPT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario best illustrates the "availability" element of the CIA triad?',
    options: opts4(
      'Encrypting a database so only authorized apps can read it',
      'Using checksums to detect tampering',
      'Ensuring an e-commerce site remains reachable during a traffic spike',
      'Requiring MFA to sign in'
    ),
    correct: ['c'],
    explanation: 'Availability means systems and data are accessible when needed. Keeping a site reachable during demand or attack addresses availability. Encryption addresses confidentiality and checksums address integrity.',
    references: [REF_SCFND]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which term describes confirming that a user, device, or service is who or what it claims to be?',
    options: opts4(
      'Authorization',
      'Authentication',
      'Auditing',
      'Accounting'
    ),
    correct: ['b'],
    explanation: 'Authentication is the process of proving identity. Authorization then determines what the authenticated identity is allowed to do.',
    references: [REF_AUTHN]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is identity often considered the primary security perimeter in modern environments?',
    options: opts4(
      'Because firewalls are no longer used anywhere',
      'Because resources and users are distributed across cloud and remote locations, so access decisions center on verified identity',
      'Because encryption has been deprecated',
      'Because all data is now public'
    ),
    correct: ['b'],
    explanation: 'Cloud apps, mobile devices, and remote work mean assets are no longer behind a single network boundary. Identity becomes the consistent control point for verifying and authorizing every access request.',
    references: [REF_IDENTITY]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Under the cloud shared responsibility model, the customer is never responsible for any security controls when using SaaS.',
    options: opts4('True', 'False', '', ''),
    correct: ['b'],
    explanation: 'Even with SaaS, the customer remains responsible for data, identities, accounts, and access management. Responsibility for the underlying infrastructure shifts to the provider, but not all responsibility.',
    references: [REF_SHARED]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A company applies controls at the network, identity, application, and data layers so a single failure does not expose everything. This strategy is called:',
    options: opts4(
      'Single point of trust',
      'Defense in depth',
      'Implicit trust',
      'Flat network design'
    ),
    correct: ['b'],
    explanation: 'Defense in depth uses multiple, layered security controls so that if one layer is compromised, subsequent layers continue to protect the assets.',
    references: [REF_DEFENSE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are commonly considered pillars/layers covered by Zero Trust enforcement.',
    options: opts4(
      'Identities',
      'Devices',
      'Data and applications',
      'Implicit network trust'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Zero Trust applies policy across identities, devices, applications, data, infrastructure, and networks. "Implicit network trust" contradicts Zero Trust, which never trusts based on network location alone.',
    references: [REF_ZT]
  },

  // ── Microsoft Entra (18) ──
  {
    domain: ENTRA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is a primary function of Microsoft Entra ID?',
    options: opts4(
      'Authenticate users and provide access to applications',
      'Store relational database tables',
      'Run container orchestration',
      'Provide block storage'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra ID authenticates users and applications and controls access to internal and external resources, including Microsoft 365, Azure, and thousands of SaaS apps.',
    references: [REF_ENTRA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'A managed identity in Microsoft Entra ID provides which key benefit?',
    options: opts4(
      'It removes the need for developers to manage credentials for an Azure resource to authenticate.',
      'It encrypts all virtual machine disks.',
      'It performs eDiscovery searches.',
      'It blocks DDoS attacks.'
    ),
    correct: ['a'],
    explanation: 'A managed identity is an automatically managed identity in Microsoft Entra ID that lets Azure resources authenticate to services without developers handling credentials, reducing secret management risk.',
    references: [REF_ENTRA_IDENT]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which identity type represents an internal employee account that is native to the organization’s Microsoft Entra tenant?',
    options: opts4(
      'Guest user',
      'Member user',
      'External service account from another tenant',
      'Anonymous user'
    ),
    correct: ['b'],
    explanation: 'A member user is an internal account native to the tenant (typically employees). Guest users are external collaborators invited via B2B.',
    references: [REF_ENTRA_IDENT]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which factor categories combine to satisfy multifactor authentication?',
    options: opts4(
      'Two passwords of different lengths',
      'Something you know, something you have, and/or something you are',
      'Two different usernames',
      'A username and an email address'
    ),
    correct: ['b'],
    explanation: 'MFA requires factors from at least two different categories: knowledge (password/PIN), possession (phone, token, key), and inherence (biometrics). Two passwords are the same category and do not satisfy MFA.',
    references: [REF_MFA]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A Conditional Access policy blocks access unless the device is marked compliant. Which part of the policy is "block unless compliant device"?',
    options: opts4(
      'The signal/assignment',
      'The access decision and grant control',
      'The data connector',
      'The sensitivity label'
    ),
    correct: ['b'],
    explanation: 'Conditional Access evaluates signals (user, location, device, risk) and then enforces an access decision with grant controls. Requiring a compliant device is a grant control applied as part of the decision.',
    references: [REF_CA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about self-service password reset (SSPR) is correct?',
    options: opts4(
      'Users must register authentication methods before they can use SSPR.',
      'SSPR requires a help desk ticket.',
      'SSPR disables MFA for the tenant.',
      'SSPR only works for guest users.'
    ),
    correct: ['a'],
    explanation: 'Before users can reset their own passwords with SSPR, they must register one or more authentication methods (e.g., phone, email, Authenticator app) so their identity can be verified during reset.',
    references: [REF_SSPR]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An auditor asks you to prove that privileged role assignments are reviewed regularly and removed when no longer needed. Which combination of Microsoft Entra ID Governance features best addresses this?',
    options: opts4(
      'Privileged Identity Management and access reviews',
      'Azure Bastion and Key Vault',
      'Sentinel and Defender for Endpoint',
      'DLP and sensitivity labels'
    ),
    correct: ['a'],
    explanation: 'PIM provides time-bound, just-in-time privileged access with approval and auditing, and access reviews periodically recertify whether assignments are still needed — together they satisfy regular review and removal.',
    references: [REF_PIM]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the main benefit of access packages in entitlement management?',
    options: opts4(
      'They bundle resources and automate request, approval, and expiration of access.',
      'They encrypt files at rest.',
      'They scan endpoints for malware.',
      'They provide a managed firewall.'
    ),
    correct: ['a'],
    explanation: 'Access packages group the groups, apps, and sites a user needs and govern them with self-service requests, approvals, time-limited assignments, and recurring access reviews, reducing manual administration.',
    references: [REF_ENTITLE]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Microsoft Entra ID Protection classifies sign-in risk and user risk. What can be automatically triggered when a high-risk sign-in is detected, if configured?',
    options: opts4(
      'A risk-based Conditional Access policy requiring MFA or blocking access',
      'An automatic firewall reconfiguration',
      'Deletion of the user mailbox',
      'A new Azure subscription'
    ),
    correct: ['a'],
    explanation: 'ID Protection feeds risk signals into Conditional Access. Risk-based policies can require MFA, force a secure password change, or block access automatically when sign-in or user risk is detected.',
    references: [REF_IDPROT]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of these is a passwordless authentication method supported by Microsoft Entra ID?',
    options: opts4(
      'FIDO2 security keys',
      'A long complex password',
      'A security question',
      'A shared mailbox password'
    ),
    correct: ['a'],
    explanation: 'FIDO2 security keys, the Microsoft Authenticator app (phone sign-in), and Windows Hello for Business are passwordless methods. A long password is still password-based.',
    references: [REF_PWLESS]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'In B2B collaboration, whose identity provider authenticates the invited external guest by default?',
    options: opts4(
      'The guest’s own home identity provider/organization',
      'The host organization always issues a new password',
      'No authentication occurs for guests',
      'A shared anonymous account'
    ),
    correct: ['a'],
    explanation: 'With Microsoft Entra B2B, guests sign in with their own organizational or personal identity. The host does not manage the guest’s credentials; it simply grants the guest object access to resources.',
    references: [REF_B2B]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants users to have a single identity for both on-premises apps and Microsoft 365. Which approach enables this?',
    options: opts4(
      'Hybrid identity using Microsoft Entra Connect synchronization',
      'Creating completely separate cloud-only accounts with different passwords',
      'Disabling on-premises Active Directory',
      'Using guest accounts for all employees'
    ),
    correct: ['a'],
    explanation: 'Hybrid identity, implemented with Microsoft Entra Connect (or Cloud Sync), synchronizes on-premises AD identities to the cloud so users have one identity for on-premises and cloud resources.',
    references: [REF_HYBRID]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft Entra capability supports requiring MFA only when sign-in risk is elevated, rather than for every sign-in?',
    options: opts4(
      'Risk-based Conditional Access',
      'Self-service password reset',
      'Information barriers',
      'Retention labels'
    ),
    correct: ['a'],
    explanation: 'Risk-based Conditional Access uses ID Protection signals so MFA is challenged only when sign-in or user risk is detected, balancing security and user experience.',
    references: [REF_CA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario is an example of authorization rather than authentication?',
    options: opts4(
      'A user enters a password and approves an Authenticator prompt',
      'After signing in, a user is allowed to read but not edit a SharePoint library based on their role',
      'A user registers a phone number for SSPR',
      'A user proves identity with a FIDO2 key'
    ),
    correct: ['b'],
    explanation: 'Determining what an already-authenticated user is permitted to do (read vs edit, based on role) is authorization. Entering a password or using a key proves identity (authentication).',
    references: [REF_AUTHN]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What does a Microsoft Entra hybrid joined device represent?',
    options: opts4(
      'A device joined to both on-premises Active Directory and registered with Microsoft Entra ID',
      'A device with no directory presence',
      'A guest user account',
      'A network firewall'
    ),
    correct: ['a'],
    explanation: 'A Microsoft Entra hybrid joined device is joined to on-premises AD and also registered in Microsoft Entra ID, allowing cloud-based policies such as Conditional Access to evaluate the device.',
    references: [REF_DEVICE]
  },
  {
    domain: ENTRA, difficulty: 1, type: QType.SINGLE,
    stem: 'Privileged Identity Management can require approval and provide time-bound activation for privileged roles.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'PIM supports just-in-time, time-bound privileged role activation with optional approval workflows, justification, MFA on activation, and access reviews/alerts for privileged roles.',
    references: [REF_PIM]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL Microsoft Entra ID Governance capabilities.',
    options: opts4(
      'Entitlement management',
      'Access reviews',
      'Privileged Identity Management',
      'Azure DDoS Protection'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Entitlement management, access reviews, and Privileged Identity Management are Microsoft Entra ID Governance capabilities. Azure DDoS Protection is a network security service, not identity governance.',
    references: [REF_GOV]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Entra edition/licensing concept determines whether features like Conditional Access and PIM are available?',
    options: opts4(
      'Microsoft Entra ID Free vs P1/P2 licensing',
      'The number of virtual networks',
      'The Azure region selected',
      'The storage account tier'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra ID licensing tiers (Free, P1, P2) determine feature availability. Conditional Access requires P1, while ID Protection and PIM require P2.',
    references: [REF_LICENSE]
  },

  // ── Microsoft security solutions (23) ──
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft solution would you use to ingest logs from many sources and use analytics rules to generate incidents across the enterprise?',
    options: opts4(
      'Microsoft Sentinel',
      'Microsoft Entra Connect',
      'Azure Bastion',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel ingests data through connectors and uses analytics rules to detect threats and create incidents, with workbooks for visualization and playbooks for automated response.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Microsoft Defender for Cloud provides cloud security posture management. What does CSPM primarily assess?',
    options: opts4(
      'Misconfigurations and security recommendations across cloud resources',
      'The cost of running virtual machines',
      'User mailbox sizes',
      'Document retention periods'
    ),
    correct: ['a'],
    explanation: 'Cloud security posture management (CSPM) continuously assesses resource configurations against security best practices, surfacing misconfigurations and prioritized recommendations to improve secure score.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Defender XDR workload would detect a malicious sign-in pattern against on-premises domain controllers using AD signals?',
    options: opts4(
      'Microsoft Defender for Identity',
      'Microsoft Defender for Office 365',
      'Azure Firewall',
      'Microsoft Purview DLP'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender for Identity monitors on-premises Active Directory via domain controller sensors to detect compromised identities, lateral movement, and reconnaissance against the identity infrastructure.',
    references: [REF_DEFID]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user clicks a link in an email; the URL is checked at time of click for malicious content. Which Microsoft Defender for Office 365 feature is this?',
    options: opts4(
      'Safe Links',
      'Safe Attachments',
      'Conditional Access',
      'Secure Score'
    ),
    correct: ['a'],
    explanation: 'Safe Links provides time-of-click verification of URLs in email and Office documents, rewriting links so they are checked against threat intelligence when the user clicks.',
    references: [REF_DEFO365]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which solution provides a single incident queue correlating alerts from endpoints, email, identity, and cloud apps for an analyst?',
    options: opts4(
      'Microsoft Defender XDR',
      'Azure Key Vault',
      'Microsoft Entra Connect',
      'Azure DDoS Protection'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender XDR automatically correlates alerts from its workloads into unified incidents in the Microsoft Defender portal, giving a cross-domain view and automated investigation/response.',
    references: [REF_XDR]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service provides secure RDP/SSH to VMs without assigning public IP addresses to them?',
    options: opts4(
      'Azure Bastion',
      'Azure Key Vault',
      'Microsoft Sentinel',
      'Network security group'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion provides browser-based, TLS-secured RDP and SSH to VMs through the Azure portal, so VMs do not need public IP addresses, reducing exposure.',
    references: [REF_BASTION]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control allows or denies network traffic to a subnet or NIC based on five-tuple rules?',
    options: opts4(
      'Network security group (NSG)',
      'Azure Bastion',
      'Azure Key Vault',
      'Sensitivity label'
    ),
    correct: ['a'],
    explanation: 'NSGs contain prioritized allow/deny rules evaluated on source/destination IP, port, and protocol, applied to subnets or network interfaces to filter traffic.',
    references: [REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Azure DDoS Protection primarily defends against which type of attack?',
    options: opts4(
      'Distributed denial-of-service attacks that overwhelm resources',
      'Phishing emails',
      'Malicious document macros',
      'Privilege escalation in Active Directory'
    ),
    correct: ['a'],
    explanation: 'Azure DDoS Protection mitigates volumetric, protocol, and resource-layer distributed denial-of-service attacks through always-on monitoring and automatic attack mitigation.',
    references: [REF_DDOS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Where should an application store database connection secrets so they are centrally managed and access-controlled?',
    options: opts4(
      'Azure Key Vault',
      'In plaintext in the app config file',
      'In a public storage container',
      'In the NSG rules'
    ),
    correct: ['a'],
    explanation: 'Azure Key Vault centrally stores and controls access to secrets, keys, and certificates with Microsoft Entra-based authorization and auditing, avoiding hard-coded credentials.',
    references: [REF_KEYVAULT]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Defender for Cloud capability would alert you that a storage account is publicly accessible and recommend remediation?',
    options: opts4(
      'Security posture recommendations / secure score',
      'Safe Attachments',
      'Conditional Access',
      'Information barriers'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud’s CSPM continuously assesses configurations and surfaces recommendations (and lowers secure score) for issues such as a publicly exposed storage account, with guided remediation.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of Microsoft Secure Score in the Defender portal?',
    options: opts4(
      'To represent overall security posture and recommend prioritized improvement actions',
      'To bill for Azure consumption',
      'To classify documents',
      'To synchronize directories'
    ),
    correct: ['a'],
    explanation: 'Microsoft Secure Score quantifies the organization’s security posture across identity, devices, apps, and data and provides prioritized actions; completing them increases the score.',
    references: [REF_SECSCORE]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Defender XDR workload provides endpoint detection and response and vulnerability management for devices?',
    options: opts4(
      'Microsoft Defender for Endpoint',
      'Microsoft Defender for Office 365',
      'Microsoft Defender for Cloud Apps',
      'Microsoft Sentinel'
    ),
    correct: ['a'],
    explanation: 'Defender for Endpoint delivers preventive protection, EDR, automated investigation and remediation, and threat & vulnerability management for endpoints across platforms.',
    references: [REF_DEFEP]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organization wants to discover unsanctioned SaaS apps employees use (shadow IT) and apply controls. Which solution fits?',
    options: opts4(
      'Microsoft Defender for Cloud Apps',
      'Azure Bastion',
      'Azure Key Vault',
      'Microsoft Entra Connect'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender for Cloud Apps (a CASB) discovers shadow IT through cloud app discovery, assesses risk, and applies session and access controls to sanctioned and unsanctioned cloud apps.',
    references: [REF_MCAS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about Microsoft Sentinel data connectors is correct?',
    options: opts4(
      'They enable ingestion of data from Microsoft and third-party sources into Sentinel.',
      'They encrypt VM disks.',
      'They classify documents.',
      'They reset user passwords.'
    ),
    correct: ['a'],
    explanation: 'Data connectors integrate sources (Microsoft Entra ID, Office 365, Azure, AWS, firewalls, etc.) so their logs flow into the Sentinel workspace for analytics, hunting, and response.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Defender for Cloud can protect workloads across Azure, on-premises, and other cloud providers.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Defender for Cloud supports multicloud and hybrid scenarios, assessing and protecting resources in Azure, on-premises, and other clouds such as AWS and Google Cloud.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL Azure services that are network security controls.',
    options: opts4(
      'Network security group',
      'Azure Firewall',
      'Azure DDoS Protection',
      'Microsoft Purview Compliance Manager'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'NSG, Azure Firewall, and Azure DDoS Protection are network security controls. Compliance Manager is a Microsoft Purview compliance/risk tool, not a network control.',
    references: [REF_FW]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Defender for Office 365 capability detonates attachments in an isolated environment before delivery?',
    options: opts4(
      'Safe Attachments',
      'Safe Links',
      'Secure Score',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'Safe Attachments opens attachments in a sandbox/detonation environment to identify malicious behavior before the message is delivered to the recipient.',
    references: [REF_DEFO365]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which solution combines SIEM and SOAR to detect and automatically respond to threats?',
    options: opts4(
      'Microsoft Sentinel',
      'Microsoft Entra ID',
      'Azure Key Vault',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel is a cloud-native SIEM with built-in SOAR. It detects threats via analytics and automates responses through playbooks built on Logic Apps.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A managed VM should not be reachable from the internet, but admins still need SSH access. Which combination achieves least exposure?',
    options: opts4(
      'No public IP on the VM plus Azure Bastion for SSH',
      'A public IP plus open NSG to 0.0.0.0/0',
      'Disable all logging',
      'Grant all users the Owner role'
    ),
    correct: ['a'],
    explanation: 'Removing the public IP and using Azure Bastion provides secure SSH/RDP through the portal without exposing the VM to the internet, minimizing the attack surface.',
    references: [REF_BASTION]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'What does Microsoft Defender for Cloud’s "Defender plans" provide beyond free posture management?',
    options: opts4(
      'Workload protection with advanced threat detection for specific resource types',
      'Free unlimited storage',
      'Identity synchronization',
      'Email archiving'
    ),
    correct: ['a'],
    explanation: 'Enabling Defender plans adds cloud workload protection with advanced threat detection and alerting for resource types like servers, SQL, storage, containers, and key vaults.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which portal would a SOC analyst use to investigate a unified incident that includes a phishing email and a compromised endpoint?',
    options: opts4(
      'Microsoft Defender portal (Defender XDR)',
      'Azure Key Vault',
      'Microsoft Entra Connect Health',
      'Service Trust Portal'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Defender portal hosts Defender XDR, which correlates email and endpoint alerts into one incident with an investigation graph and automated remediation.',
    references: [REF_XDR]
  },
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE,
    stem: 'What does SIEM stand for?',
    options: opts4(
      'Security Information and Event Management',
      'System Integrity and Encryption Module',
      'Secure Identity and Endpoint Manager',
      'Service Inventory and Entitlement Map'
    ),
    correct: ['a'],
    explanation: 'SIEM stands for Security Information and Event Management — a solution that aggregates and analyzes activity from many sources to detect threats. Microsoft Sentinel is Microsoft’s cloud-native SIEM.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Defender for Cloud Apps capability lets you monitor and control user sessions in real time, such as blocking download of sensitive files from an unmanaged device?',
    options: opts4(
      'Conditional Access app control (session policies)',
      'Safe Attachments',
      'Retention labels',
      'Privileged Identity Management'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud Apps integrates with Conditional Access to provide app control with session policies, enabling real-time monitoring and controls like blocking downloads or applying restrictions during a user session.',
    references: [REF_MCAS]
  },

  // ── Microsoft compliance solutions (16) ──
  {
    domain: COMPLIANCE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft portal centralizes compliance solutions such as DLP, sensitivity labels, and eDiscovery?',
    options: opts4(
      'Microsoft Purview portal',
      'Azure Bastion',
      'Microsoft Entra admin center',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Purview portal centralizes data governance and compliance solutions including information protection, DLP, retention/records, eDiscovery, insider risk, and Compliance Manager.',
    references: [REF_PURVIEW]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'The compliance score in Compliance Manager is primarily based on what?',
    options: opts4(
      'Completion of improvement actions mapped to controls and regulations',
      'The number of users in the tenant',
      'The amount of email sent',
      'The number of virtual machines'
    ),
    correct: ['a'],
    explanation: 'The compliance score reflects progress on improvement actions tied to controls in assessments. Microsoft-managed and customer-managed actions both contribute, helping prioritize risk reduction.',
    references: [REF_CMGR]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which capability automatically applies a "Confidential" label and encryption to documents that contain detected financial data?',
    options: opts4(
      'Auto-labeling with sensitivity labels',
      'Network security groups',
      'Conditional Access',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Sensitivity labels support auto-labeling based on sensitive information types or trainable classifiers, applying classification, encryption, and markings without relying solely on users.',
    references: [REF_SENSLBL]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'A DLP policy detects a user attempting to email a spreadsheet containing many credit card numbers externally. What can the policy do?',
    options: opts4(
      'Block the email and/or notify the user and admins',
      'Encrypt the entire mailbox permanently',
      'Delete the user account',
      'Disable the network'
    ),
    correct: ['a'],
    explanation: 'DLP policies can block the action, allow with override, show policy tips, and notify users and administrators when sensitive information is shared in a way that violates policy.',
    references: [REF_DLP]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Purview capability ensures records are retained for a legally required period and disposed of afterward?',
    options: opts4(
      'Records management with retention labels',
      'Conditional Access',
      'Azure Firewall',
      'Microsoft Secure Score'
    ),
    correct: ['a'],
    explanation: 'Records management uses retention labels to declare content as records, enforce retention for required periods, and manage disposition, supporting regulatory recordkeeping obligations.',
    references: [REF_RETENTION]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A legal team must preserve all mailbox and SharePoint content for custodians involved in a lawsuit. Which Microsoft Purview solution supports legal holds and review?',
    options: opts4(
      'eDiscovery (Premium)',
      'Microsoft Sentinel',
      'Azure Key Vault',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'eDiscovery (Premium) provides custodian management, legal holds, advanced search, review sets, and export for legal investigations and litigation across Microsoft 365 content.',
    references: [REF_EDISCOVERY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which solution detects a departing employee downloading large volumes of confidential files and raises an alert for review?',
    options: opts4(
      'Insider risk management',
      'Azure DDoS Protection',
      'Microsoft Entra Connect',
      'Network security group'
    ),
    correct: ['a'],
    explanation: 'Insider risk management correlates signals (e.g., HR departure events plus mass downloads) into risk alerts so investigators can review potential data theft while preserving privacy controls.',
    references: [REF_INSIDER]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Purview capability provides a searchable record of who did what and when across Microsoft 365 services?',
    options: opts4(
      'Auditing (Audit Standard/Premium)',
      'Sensitivity labels',
      'Conditional Access',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview auditing captures user and admin activity. Audit (Standard) provides core logs; Audit (Premium) adds longer retention and additional high-value events for investigations.',
    references: [REF_AUDIT]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'What do sensitive information types and trainable classifiers support in Microsoft Purview?',
    options: opts4(
      'Identifying and classifying data to drive protection and compliance policies',
      'Encrypting network traffic',
      'Assigning Entra roles',
      'Provisioning virtual machines'
    ),
    correct: ['a'],
    explanation: 'Sensitive information types use patterns/keywords and trainable classifiers use machine learning to detect data categories, feeding data classification and policies such as DLP and auto-labeling.',
    references: [REF_DATACLASS]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Purview solution helps detect offensive language or sensitive data sharing in Microsoft Teams chats and email for review?',
    options: opts4(
      'Communication compliance',
      'Entitlement management',
      'Azure Key Vault',
      'Microsoft Defender for Endpoint'
    ),
    correct: ['a'],
    explanation: 'Communication compliance uses policies and classifiers to surface inappropriate or risky communications (harassment, sensitive info, regulatory issues) in Microsoft 365 for designated reviewers.',
    references: [REF_CB]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Where can a customer obtain Microsoft’s third-party audit reports and compliance certifications?',
    options: opts4(
      'Microsoft Service Trust Portal',
      'Azure Bastion',
      'Microsoft Sentinel',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'The Service Trust Portal publishes independent audit reports (e.g., SOC, ISO), compliance guides, and security/privacy documentation for Microsoft cloud services.',
    references: [REF_TRUST]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft solution helps fulfill data subject rights requests (such as access or delete) under privacy regulations?',
    options: opts4(
      'Microsoft Priva Subject Rights Requests',
      'Azure Firewall',
      'Microsoft Sentinel',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'Microsoft Priva includes Subject Rights Requests to help organizations discover, review, and fulfill data subject requests, and Privacy Risk Management to reduce privacy risk.',
    references: [REF_PRIORITY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'A financial firm must prevent its investment bankers from communicating with its research analysts to avoid conflicts of interest. Which Purview capability enforces this?',
    options: opts4(
      'Information barriers',
      'Retention labels',
      'Safe Links',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'Information barriers create policies that restrict or block communication and collaboration between defined segments of users to meet ethical wall and regulatory requirements.',
    references: [REF_IRM]
  },
  {
    domain: COMPLIANCE, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Purview Compliance Manager includes both Microsoft-managed and customer-managed improvement actions.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Compliance Manager tracks Microsoft-managed controls (handled by Microsoft) and customer-managed controls (the customer’s responsibility), and only completed customer actions raise the score.',
    references: [REF_CMGR]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes Microsoft Purview Information Protection sensitivity labels?',
    options: opts4(
      'Labels that classify and can encrypt and mark content, with protection that persists with the file',
      'Firewall rules applied to subnets',
      'Identity authentication factors',
      'A SIEM analytics rule'
    ),
    correct: ['a'],
    explanation: 'Sensitivity labels classify content and can enforce encryption, content markings, and access control; the protection travels with the document wherever it goes.',
    references: [REF_SENSLBL]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about data loss prevention (DLP) in Microsoft Purview.',
    options: opts4(
      'DLP can protect content in Exchange, SharePoint, OneDrive, and Teams.',
      'DLP can show policy tips and block sharing of sensitive data.',
      'DLP can extend to endpoint devices.',
      'DLP is a network firewall appliance.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DLP works across Microsoft 365 services and endpoints, with policy tips, blocking, and notifications. It is a data protection policy engine, not a network firewall appliance.',
    references: [REF_DLP]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Concepts of security, compliance, and identity (8) ──
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which principle of Zero Trust limits a user or workload to only the access required to perform a task, for only as long as needed?',
    options: opts4(
      'Verify explicitly',
      'Use least-privilege access',
      'Assume breach',
      'Trust the internal network'
    ),
    correct: ['b'],
    explanation: 'Least-privilege access (just-enough-access and just-in-time) limits the scope and duration of access to what is needed, reducing the blast radius of compromised credentials.',
    references: [REF_ZT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Encrypting data while it is stored on disk is referred to as protecting data in which state?',
    options: opts4(
      'Data in transit',
      'Data at rest',
      'Data in use',
      'Data in motion'
    ),
    correct: ['b'],
    explanation: 'Data at rest is data stored physically (databases, disks, blobs). Data in transit is moving across networks; data in use is being processed in memory. Encryption can apply to each state.',
    references: [REF_ENCRYPT]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which CIA triad principle is violated when an attacker alters the amounts in financial records?',
    options: opts4(
      'Confidentiality',
      'Integrity',
      'Availability',
      'Accountability'
    ),
    correct: ['b'],
    explanation: 'Integrity ensures data is accurate and unaltered. Tampering with record values violates integrity. Confidentiality concerns disclosure; availability concerns access.',
    references: [REF_SCFND]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'In an IaaS deployment, which responsibility typically belongs to the customer rather than the cloud provider?',
    options: opts4(
      'Securing the physical datacenter',
      'Patching and securing the guest operating system and applications',
      'Maintaining the host hypervisor hardware',
      'Physical network cabling'
    ),
    correct: ['b'],
    explanation: 'In IaaS, the provider manages physical infrastructure and the hypervisor, while the customer is responsible for the guest OS, applications, network configuration within the VM, data, and identities.',
    references: [REF_SHARED]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly describes asymmetric encryption use in digital communication?',
    options: opts4(
      'Data encrypted with a recipient’s public key can only be decrypted with their private key.',
      'The same key is shared publicly to encrypt and decrypt.',
      'No keys are involved.',
      'It is identical to hashing.'
    ),
    correct: ['a'],
    explanation: 'Asymmetric encryption uses a key pair. Encrypting with the recipient’s public key ensures only the holder of the matching private key can decrypt, enabling confidential exchange without sharing a secret key.',
    references: [REF_ENCRYPT]
  },
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE,
    stem: 'Authorization determines what an authenticated identity is permitted to do.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Authorization (AuthZ) decides the level of access an authenticated identity has to resources. Authentication first proves identity; authorization then governs permitted actions.',
    references: [REF_AUTHN]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes why governance, risk, and compliance (GRC) matters to an organization?',
    options: opts4(
      'It helps align security practices with regulations and manage risk to the business.',
      'It is only about network speed.',
      'It replaces the need for identity management.',
      'It is purely a marketing function.'
    ),
    correct: ['a'],
    explanation: 'GRC provides the framework to set policies (governance), identify and treat risk, and meet legal/regulatory obligations (compliance), reducing legal, financial, and reputational exposure.',
    references: [REF_SCFND]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL states in which data can be encrypted to protect confidentiality.',
    options: opts4(
      'Data at rest',
      'Data in transit',
      'Data in use',
      'Data that has been permanently deleted and overwritten'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Encryption can protect data at rest, in transit, and in use (e.g., confidential computing). Data that no longer exists cannot be encrypted; secure deletion is a separate control.',
    references: [REF_ENCRYPT]
  },

  // ── Microsoft Entra (18) ──
  {
    domain: ENTRA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Microsoft Entra ID primarily uses which modern protocols for authentication and authorization?',
    options: opts4(
      'SAML, OAuth 2.0, and OpenID Connect',
      'SMTP and POP3',
      'FTP and Telnet',
      'SNMP and ICMP'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra ID uses modern identity protocols — SAML, WS-Federation, OAuth 2.0, and OpenID Connect — to enable SSO and secure access to cloud and on-premises applications.',
    references: [REF_ENTRA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which identity type would you assign to an automated DevOps pipeline that deploys to Azure without a user signing in?',
    options: opts4(
      'A workload identity (service principal/managed identity)',
      'A guest user',
      'A member user',
      'A distribution group'
    ),
    correct: ['a'],
    explanation: 'Automation should use a workload identity such as a service principal or managed identity so it can authenticate non-interactively with scoped permissions, avoiding user credentials.',
    references: [REF_ENTRA_IDENT]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft Entra feature lets a user sign in once and access many applications without re-authenticating?',
    options: opts4(
      'Single sign-on (SSO)',
      'Self-service password reset',
      'Information barriers',
      'Data loss prevention'
    ),
    correct: ['a'],
    explanation: 'Single sign-on lets users authenticate once to Microsoft Entra ID and then access connected apps without repeated prompts, improving experience while centralizing security.',
    references: [REF_ENTRA]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'A Conditional Access policy should require MFA for administrators when signing in from an untrusted location. Which two elements are being combined?',
    options: opts4(
      'A signal (admin role + location) and an access control (require MFA)',
      'A sensitivity label and a retention policy',
      'A network security group and a firewall rule',
      'A data connector and a workbook'
    ),
    correct: ['a'],
    explanation: 'Conditional Access evaluates signals (who, where, device, risk) and applies a decision/control. Here the signal is the admin role plus location and the control is requiring MFA.',
    references: [REF_CA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a benefit of passwordless authentication compared with passwords?',
    options: opts4(
      'It reduces phishing and credential theft risk by removing the password as a target.',
      'It eliminates the need for any identity provider.',
      'It makes accounts impossible to audit.',
      'It removes the need for authorization.'
    ),
    correct: ['a'],
    explanation: 'Passwordless methods (Windows Hello, Authenticator, FIDO2) remove the password, which is a common target for phishing and reuse attacks, improving both security and user experience.',
    references: [REF_PWLESS]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization wants external partners to request access to specific apps through a self-service catalog with approvals and automatic expiration. Which feature should they use?',
    options: opts4(
      'Entitlement management access packages',
      'Self-service password reset',
      'Microsoft Sentinel playbooks',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Entitlement management lets you publish access packages (including for external users) that partners can request, with approval workflows, time limits, and automatic expiration.',
    references: [REF_ENTITLE]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Entra ID Governance feature would you use to have managers periodically confirm their team still needs access to a sensitive group?',
    options: opts4(
      'Access reviews',
      'Conditional Access',
      'Azure Firewall',
      'Sensitivity labels'
    ),
    correct: ['a'],
    explanation: 'Access reviews can be assigned to managers or the users themselves to recertify group, app, or role access on a schedule, automatically removing access that is no longer attested.',
    references: [REF_ACCREV]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability provides just-in-time activation and approval specifically for privileged directory and Azure roles?',
    options: opts4(
      'Privileged Identity Management (PIM)',
      'Self-service password reset',
      'B2B collaboration',
      'Data loss prevention'
    ),
    correct: ['a'],
    explanation: 'PIM manages, controls, and monitors access to privileged roles with eligible assignments, time-bound activation, approval, MFA on activation, justification, and audit logs.',
    references: [REF_PIM]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which signal source allows Microsoft Entra ID Protection to flag a sign-in as risky?',
    options: opts4(
      'Indicators such as anonymous IP address, atypical travel, or leaked credentials',
      'The size of the user mailbox',
      'The number of files in OneDrive',
      'The VM disk type'
    ),
    correct: ['a'],
    explanation: 'ID Protection evaluates risk detections like anonymous IP usage, atypical travel, leaked credentials, and unfamiliar sign-in properties to assign sign-in and user risk levels.',
    references: [REF_IDPROT]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What is a guest (B2B) user in Microsoft Entra ID?',
    options: opts4(
      'An external user invited to collaborate using their own identity',
      'An internal employee account',
      'A managed identity for a VM',
      'A built-in administrator role'
    ),
    correct: ['a'],
    explanation: 'A B2B guest is an external collaborator represented by a guest user object; they authenticate with their own home identity and are granted access to specific resources.',
    references: [REF_B2B]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which best describes role-based access control (RBAC) in Microsoft Entra ID?',
    options: opts4(
      'Permissions are granted through roles assigned to identities to support least privilege',
      'All users automatically get administrator rights',
      'Access is granted only by IP address',
      'Permissions are random'
    ),
    correct: ['a'],
    explanation: 'RBAC assigns roles (collections of permissions) to identities so they receive only the access required for their responsibilities, supporting least privilege and easier administration.',
    references: [REF_RBAC]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization syncs on-premises AD accounts to the cloud so users have one set of credentials. What is this called?',
    options: opts4(
      'Hybrid identity',
      'Cloud-only identity',
      'Anonymous access',
      'Information barrier'
    ),
    correct: ['a'],
    explanation: 'Hybrid identity uses synchronization (Microsoft Entra Connect/Cloud Sync) so the same identity works on-premises and in the cloud, enabling consistent access and SSO.',
    references: [REF_HYBRID]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Conditional Access grant control would require a device to be marked compliant by Intune before access is allowed?',
    options: opts4(
      'Require device to be marked as compliant',
      'Require a sensitivity label',
      'Require a retention policy',
      'Require a network security group'
    ),
    correct: ['a'],
    explanation: 'Conditional Access grant controls include requiring MFA, a compliant device, a hybrid joined device, or approved client apps. Compliance is evaluated by device management (e.g., Intune).',
    references: [REF_CA]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is an example of "something you are" as an authentication factor?',
    options: opts4(
      'A fingerprint or facial recognition',
      'A password',
      'A hardware token',
      'A one-time SMS code'
    ),
    correct: ['a'],
    explanation: 'Biometrics (fingerprint, face) are the inherence factor — "something you are". Passwords are knowledge; tokens and SMS codes are possession factors.',
    references: [REF_MFA]
  },
  {
    domain: ENTRA, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Entra ID Protection can feed sign-in and user risk signals into Conditional Access policies.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'ID Protection integrates with Conditional Access so risk-based policies can require MFA, force a password change, or block access when risk is detected.',
    references: [REF_IDPROT]
  },
  {
    domain: ENTRA, difficulty: 2, type: QType.SINGLE,
    stem: 'What does a Microsoft Entra registered device typically represent?',
    options: opts4(
      'A personal (BYOD) device registered to enable access policies without full domain join',
      'A network firewall',
      'A service principal',
      'A retention label'
    ),
    correct: ['a'],
    explanation: 'A registered device is commonly a personal/BYOD device that is registered with Microsoft Entra ID so policies (like Conditional Access) can evaluate it, without being fully joined.',
    references: [REF_DEVICE]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Entra licensing tier is required to use ID Protection and Privileged Identity Management?',
    options: opts4(
      'Microsoft Entra ID P2',
      'Microsoft Entra ID Free',
      'No license is required',
      'A storage account SKU'
    ),
    correct: ['a'],
    explanation: 'ID Protection and PIM are premium capabilities requiring Microsoft Entra ID P2. Conditional Access requires at least P1; basic directory features are available in Free.',
    references: [REF_LICENSE]
  },
  {
    domain: ENTRA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid Microsoft Entra identity types.',
    options: opts4(
      'Member user',
      'Guest (external) user',
      'Workload identity (service principal/managed identity)',
      'Network security group'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Member users, guest users, and workload identities (service principals/managed identities) are Microsoft Entra identity types. A network security group is an Azure networking control, not an identity.',
    references: [REF_ENTRA_IDENT]
  },

  // ── Microsoft security solutions (23) ──
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft solution is described as a cloud-native SIEM and SOAR platform?',
    options: opts4(
      'Microsoft Sentinel',
      'Microsoft Entra ID',
      'Azure Bastion',
      'Microsoft Purview'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel is a cloud-native SIEM with integrated SOAR, providing data collection, detection, investigation, threat hunting, and automated response across the enterprise.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Defender for Cloud feature continuously evaluates resource configuration against best practices?',
    options: opts4(
      'Cloud security posture management (secure score and recommendations)',
      'Safe Links',
      'eDiscovery',
      'Self-service password reset'
    ),
    correct: ['a'],
    explanation: 'CSPM in Defender for Cloud continuously assesses configuration, computes a secure score, and provides recommendations to remediate weaknesses across Azure, hybrid, and multicloud resources.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Defender XDR workload protects against phishing and malware in Microsoft 365 email and collaboration?',
    options: opts4(
      'Microsoft Defender for Office 365',
      'Microsoft Defender for Endpoint',
      'Microsoft Defender for Identity',
      'Microsoft Defender for Cloud'
    ),
    correct: ['a'],
    explanation: 'Defender for Office 365 protects email and collaboration (Teams, SharePoint, OneDrive) using Safe Attachments, Safe Links, anti-phishing, and automated investigation and response.',
    references: [REF_DEFO365]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which workload protects laptops and servers with EDR and threat & vulnerability management?',
    options: opts4(
      'Microsoft Defender for Endpoint',
      'Microsoft Defender for Office 365',
      'Microsoft Sentinel',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Defender for Endpoint protects endpoints with attack surface reduction, next-generation protection, endpoint detection and response, automated investigation, and vulnerability management.',
    references: [REF_DEFEP]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Defender XDR workload would surface a Pass-the-Hash attack against on-premises domain controllers?',
    options: opts4(
      'Microsoft Defender for Identity',
      'Microsoft Defender for Office 365',
      'Azure Bastion',
      'Microsoft Purview DLP'
    ),
    correct: ['a'],
    explanation: 'Defender for Identity monitors domain controller traffic and behavior to detect identity attacks such as Pass-the-Hash, Pass-the-Ticket, and reconnaissance against on-premises AD.',
    references: [REF_DEFID]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A CASB providing visibility and control over SaaS apps in Microsoft 365 is which product?',
    options: opts4(
      'Microsoft Defender for Cloud Apps',
      'Azure Firewall',
      'Microsoft Entra Connect',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender for Cloud Apps is the cloud access security broker that provides discovery, information protection, threat detection, and app governance for SaaS applications.',
    references: [REF_MCAS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Azure resource provides a managed, stateful firewall for a virtual network?',
    options: opts4(
      'Azure Firewall',
      'Azure Bastion',
      'Azure Key Vault',
      'Microsoft Sentinel'
    ),
    correct: ['a'],
    explanation: 'Azure Firewall is a managed, cloud-based, stateful network security service that protects virtual network resources with application/network rules and threat intelligence-based filtering.',
    references: [REF_FW]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which control filters traffic at the subnet or NIC level using prioritized allow/deny rules?',
    options: opts4(
      'Network security group',
      'Azure Bastion',
      'Sensitivity label',
      'Compliance Manager'
    ),
    correct: ['a'],
    explanation: 'A network security group applies prioritized inbound/outbound rules based on source, destination, port, and protocol to subnets or network interfaces.',
    references: [REF_NSG]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which service mitigates large-scale traffic floods aimed at exhausting application resources?',
    options: opts4(
      'Azure DDoS Protection',
      'Azure Key Vault',
      'Microsoft Purview',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'Azure DDoS Protection continuously monitors traffic and automatically mitigates distributed denial-of-service attacks at the volumetric, protocol, and resource layers.',
    references: [REF_DDOS]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure service stores cryptographic keys and secrets with access governed by Microsoft Entra ID?',
    options: opts4(
      'Azure Key Vault',
      'Azure Bastion',
      'Microsoft Sentinel',
      'Microsoft Defender for Endpoint'
    ),
    correct: ['a'],
    explanation: 'Azure Key Vault securely stores and manages secrets, keys, and certificates, with access controlled through Microsoft Entra ID authentication and access policies/RBAC.',
    references: [REF_KEYVAULT]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A SOC team needs to write custom KQL queries to proactively hunt across months of aggregated security logs. Which platform supports this?',
    options: opts4(
      'Microsoft Sentinel',
      'Azure Key Vault',
      'Azure Bastion',
      'Microsoft Entra Connect'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel stores data in a Log Analytics workspace and supports proactive threat hunting with Kusto Query Language across large volumes of historical security data.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the value of Microsoft Secure Score to an organization?',
    options: opts4(
      'It benchmarks security posture and recommends prioritized actions to improve it',
      'It calculates monthly Azure cost',
      'It encrypts mailboxes',
      'It manages firewall rules only'
    ),
    correct: ['a'],
    explanation: 'Microsoft Secure Score provides a measurable indicator of security posture across identity, devices, apps, and data, with prioritized recommendations whose completion increases the score.',
    references: [REF_SECSCORE]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft solution correlates an identity alert, an endpoint alert, and an email alert into a single investigable incident?',
    options: opts4(
      'Microsoft Defender XDR',
      'Azure Key Vault',
      'Azure Bastion',
      'Microsoft Purview Compliance Manager'
    ),
    correct: ['a'],
    explanation: 'Defender XDR automatically stitches related alerts across identity, endpoint, email, and cloud apps into one incident with an attack story, enabling efficient investigation and response.',
    references: [REF_XDR]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about Azure Bastion is true?',
    options: opts4(
      'It provides secure RDP/SSH to VMs without exposing them via public IPs.',
      'It is a document classification service.',
      'It is a SIEM.',
      'It is an identity provider.'
    ),
    correct: ['a'],
    explanation: 'Azure Bastion is a managed PaaS service that delivers TLS-secured RDP/SSH connectivity to VMs from the Azure portal, eliminating the need for public IPs and reducing exposure.',
    references: [REF_BASTION]
  },
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Defender for Endpoint includes endpoint detection and response (EDR) capabilities.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Defender for Endpoint provides EDR along with attack surface reduction, next-generation protection, automated investigation and remediation, and vulnerability management.',
    references: [REF_DEFEP]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL capabilities provided by Microsoft Defender for Cloud.',
    options: opts4(
      'Cloud security posture management with secure score',
      'Security recommendations to remediate misconfigurations',
      'Workload protection via Defender plans',
      'Document sensitivity labeling'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Defender for Cloud offers CSPM (secure score), recommendations, and workload protection through Defender plans. Sensitivity labeling is a Microsoft Purview Information Protection capability.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Defender for Office 365 capability provides automated investigation and response to email threats?',
    options: opts4(
      'AIR (automated investigation and response)',
      'Sensitivity labels',
      'Conditional Access',
      'Azure Bastion'
    ),
    correct: ['a'],
    explanation: 'Defender for Office 365 includes automated investigation and response (AIR) that investigates alerts and recommends or takes remediation actions for email-based threats, reducing analyst workload.',
    references: [REF_DEFO365]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Azure security control is most appropriate to centrally store a TLS certificate used by multiple apps?',
    options: opts4(
      'Azure Key Vault',
      'Network security group',
      'Azure Bastion',
      'Microsoft Sentinel'
    ),
    correct: ['a'],
    explanation: 'Azure Key Vault manages certificates (and keys/secrets) centrally with controlled access and auditing, allowing multiple applications to retrieve them securely.',
    references: [REF_KEYVAULT]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which solution would generate a security incident from analytics rules applied to ingested logs?',
    options: opts4(
      'Microsoft Sentinel',
      'Microsoft Entra Connect',
      'Azure Bastion',
      'Microsoft Priva'
    ),
    correct: ['a'],
    explanation: 'Microsoft Sentinel applies scheduled and built-in analytics rules to ingested data to generate alerts and group them into incidents for investigation and response.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants posture management plus advanced threat protection for its Azure SQL databases. Which should it enable?',
    options: opts4(
      'A Microsoft Defender for Cloud Defender plan for SQL',
      'A retention label',
      'An information barrier',
      'A sensitivity label'
    ),
    correct: ['a'],
    explanation: 'Enabling the relevant Defender plan in Microsoft Defender for Cloud (e.g., Defender for SQL) adds advanced threat detection and alerting on top of free posture management for that resource type.',
    references: [REF_DEFCLOUD]
  },
  {
    domain: SECURITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft portal hosts Microsoft Defender XDR for unified incident investigation?',
    options: opts4(
      'The Microsoft Defender portal',
      'The Microsoft Purview portal',
      'The Microsoft Entra admin center',
      'The Azure Key Vault blade'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender XDR is managed in the Microsoft Defender portal, which presents unified incidents, the incident graph, advanced hunting, and automated investigation across workloads.',
    references: [REF_XDR]
  },
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE,
    stem: 'What does SOAR add to a SIEM such as Microsoft Sentinel?',
    options: opts4(
      'Orchestration and automation of incident response (e.g., playbooks)',
      'Document retention',
      'Identity synchronization',
      'Disk encryption'
    ),
    correct: ['a'],
    explanation: 'SOAR (security orchestration, automation, and response) automates and coordinates responses. In Sentinel, playbooks built on Logic Apps automate enrichment, notification, and remediation.',
    references: [REF_SENTINEL]
  },
  {
    domain: SECURITY, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Sentinel can ingest data from non-Microsoft sources such as third-party firewalls.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'Microsoft Sentinel provides data connectors for Microsoft services and many third-party sources (firewalls, network appliances, other clouds), so it can centralize security data from across the enterprise.',
    references: [REF_SENTINEL]
  },

  // ── Microsoft compliance solutions (16) ──
  {
    domain: COMPLIANCE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which solution provides Compliance Manager, sensitivity labels, DLP, and eDiscovery in one place?',
    options: opts4(
      'Microsoft Purview',
      'Microsoft Sentinel',
      'Azure Bastion',
      'Microsoft Entra ID'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview unifies compliance and data governance solutions — Compliance Manager, information protection (sensitivity labels), DLP, retention/records, eDiscovery, and insider risk.',
    references: [REF_PURVIEW]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Compliance Manager element is a recommended action the customer completes to reduce risk and raise the score?',
    options: opts4(
      'Improvement action',
      'Data connector',
      'Sensitivity label',
      'Network security rule'
    ),
    correct: ['a'],
    explanation: 'Improvement actions are recommended controls in Compliance Manager. Completing customer-managed improvement actions increases the compliance score and reduces risk.',
    references: [REF_CMGR]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A document labeled "Highly Confidential" stays encrypted even when emailed to an external recipient. Which capability enables this?',
    options: opts4(
      'Sensitivity labels with encryption',
      'A network security group',
      'A retention policy',
      'A SIEM analytics rule'
    ),
    correct: ['a'],
    explanation: 'Sensitivity labels can apply encryption and usage rights that persist with the content, so protection follows the document even when shared externally.',
    references: [REF_SENSLBL]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which solution prevents users from sharing sensitive data such as health record numbers outside the organization?',
    options: opts4(
      'Data loss prevention (DLP)',
      'Azure Bastion',
      'Microsoft Sentinel',
      'Privileged Identity Management'
    ),
    correct: ['a'],
    explanation: 'DLP policies identify sensitive information and enforce protective actions (block, warn, notify) when users attempt to share it inappropriately across Microsoft 365 services and endpoints.',
    references: [REF_DLP]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which capability automatically deletes content after a defined period to limit over-retention risk?',
    options: opts4(
      'Retention policies/labels',
      'Conditional Access',
      'Azure Firewall',
      'Microsoft Secure Score'
    ),
    correct: ['a'],
    explanation: 'Retention policies and labels can retain content for a set period and then delete it (or delete-only), helping comply with regulations and reduce risk from keeping data too long.',
    references: [REF_RETENTION]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which eDiscovery tier provides custodian management, legal hold notifications, review sets, and analytics?',
    options: opts4(
      'eDiscovery (Premium)',
      'Content search only',
      'Conditional Access',
      'Azure Key Vault'
    ),
    correct: ['a'],
    explanation: 'eDiscovery (Premium) adds an end-to-end workflow with custodian management, legal hold notifications, advanced indexing, review sets, analytics, and export for litigation and investigations.',
    references: [REF_EDISCOVERY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which solution correlates HR resignation signals with mass file downloads to flag potential data theft for investigation?',
    options: opts4(
      'Insider risk management',
      'Microsoft Sentinel data connectors',
      'Conditional Access',
      'Azure DDoS Protection'
    ),
    correct: ['a'],
    explanation: 'Insider risk management uses configurable policy templates (e.g., data theft by departing users) that correlate signals like HR events and exfiltration activity into prioritized alerts for review.',
    references: [REF_INSIDER]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Purview capability provides a tamper-aware log of activities for investigations and compliance?',
    options: opts4(
      'Auditing solutions',
      'Sensitivity labels',
      'Azure Bastion',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview auditing records user and admin activities across Microsoft 365 so investigators can search the audit log; Audit (Premium) adds longer retention and richer events.',
    references: [REF_AUDIT]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'What does content explorer in Microsoft Purview data classification show?',
    options: opts4(
      'Where sensitive or labeled content currently resides across the organization',
      'A list of firewall rules',
      'Identity sign-in logs',
      'VM performance metrics'
    ),
    correct: ['a'],
    explanation: 'Content explorer shows a current snapshot of where labeled and sensitive items are stored, while activity explorer shows what actions were taken on labeled content — both part of data classification.',
    references: [REF_DATACLASS]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which solution helps a compliance officer review potentially harassing messages in Microsoft Teams?',
    options: opts4(
      'Communication compliance',
      'Privileged Identity Management',
      'Azure Key Vault',
      'Network security group'
    ),
    correct: ['a'],
    explanation: 'Communication compliance detects and surfaces inappropriate messages (e.g., harassment, offensive language) in Microsoft 365 communications for designated reviewers, with privacy protections.',
    references: [REF_CB]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Where would an auditor download Microsoft’s ISO 27001 certificate and SOC reports for cloud services?',
    options: opts4(
      'Microsoft Service Trust Portal',
      'Microsoft Defender portal',
      'Azure Bastion',
      'Microsoft Entra admin center'
    ),
    correct: ['a'],
    explanation: 'The Service Trust Portal provides Microsoft’s independent audit reports and certifications (SOC 1/2/3, ISO, etc.), along with compliance and privacy documentation.',
    references: [REF_TRUST]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft solution helps discover personal data and automate data subject rights requests for privacy laws?',
    options: opts4(
      'Microsoft Priva',
      'Microsoft Sentinel',
      'Azure Firewall',
      'Microsoft Defender for Endpoint'
    ),
    correct: ['a'],
    explanation: 'Microsoft Priva helps organizations identify personal data, reduce privacy risk (Privacy Risk Management), and automate handling of subject rights requests to support privacy regulations.',
    references: [REF_PRIORITY]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability creates an ethical wall preventing two defined user segments from communicating to avoid conflicts of interest?',
    options: opts4(
      'Information barriers',
      'Sensitivity labels',
      'Retention policies',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'Information barriers define policies that restrict or block communication and collaboration between specified groups, enforcing ethical walls required by some regulations.',
    references: [REF_IRM]
  },
  {
    domain: COMPLIANCE, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Purview eDiscovery can place content on legal hold so it is preserved during an investigation.',
    options: opts4('True', 'False', '', ''),
    correct: ['a'],
    explanation: 'eDiscovery solutions support legal holds that preserve relevant content (mailboxes, sites) so it cannot be permanently deleted while an investigation or litigation is active.',
    references: [REF_EDISCOVERY]
  },
  {
    domain: COMPLIANCE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the purpose of Microsoft Purview Compliance Manager assessments?',
    options: opts4(
      'They map controls to regulations/standards and track progress toward compliance',
      'They scan endpoints for malware',
      'They synchronize on-premises directories',
      'They provide RDP access to VMs'
    ),
    correct: ['a'],
    explanation: 'Compliance Manager assessments group controls aligned to a regulation or standard and track Microsoft-managed and customer-managed actions, producing a compliance score and guidance.',
    references: [REF_CMGR]
  },
  {
    domain: COMPLIANCE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL Microsoft Purview information protection / data lifecycle capabilities.',
    options: opts4(
      'Sensitivity labels',
      'Retention labels and policies',
      'Records management',
      'Azure DDoS Protection'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Sensitivity labels, retention labels/policies, and records management are Microsoft Purview information protection and data lifecycle capabilities. Azure DDoS Protection is a network security service.',
    references: [REF_PURVIEW]
  }
];

const SC900_DOMAINS = [
  { name: CONCEPTS, weight: 13 },
  { name: ENTRA, weight: 27 },
  { name: SECURITY, weight: 35 },
  { name: COMPLIANCE, weight: 25 }
];

const SC900_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-sc-900-p1',
    code: 'SC-900-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 60-minute, 65-question, blueprint-weighted set covering security/compliance/identity concepts, Microsoft Entra, Microsoft security solutions, and Microsoft compliance solutions.',
    questions: P1
  },
  {
    slug: 'microsoft-sc-900-p2',
    code: 'SC-900-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-sc-900-p3',
    code: 'SC-900-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const SC900_BUNDLE = {
  slug: 'microsoft-sc-900',
  title: 'Microsoft Security, Compliance, and Identity Fundamentals (SC-900)',
  description: 'Unlimited SC-900 practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering the concepts of security, compliance, and identity; the capabilities of Microsoft Entra; Microsoft security solutions; and Microsoft compliance solutions, aligned to the Microsoft SC-900 exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 9900 // USD 99 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the SC-900 bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:sc900-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedSc900(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure, security, compliance, identity, Microsoft 365, and the role-based and fundamentals credentials.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure, security, compliance, identity, Microsoft 365, and the role-based and fundamentals credentials.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SC900_EXAMS) {
    const title = `Microsoft Security, Compliance, and Identity Fundamentals (SC-900) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Microsoft SC-900 exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 60,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: SC900_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:sc900-seed' } });
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
          generatedBy: 'manual:sc900-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SC900_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SC900_BUNDLE.slug },
    update: {
      title: SC900_BUNDLE.title,
      description: SC900_BUNDLE.description,
      price: SC900_BUNDLE.price,
      priceVoucher: SC900_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SC900_BUNDLE.slug,
      title: SC900_BUNDLE.title,
      description: SC900_BUNDLE.description,
      price: SC900_BUNDLE.price,
      priceVoucher: SC900_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-sc-900-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-sc-900-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-sc-900-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-sc-900-p1', tier: 'VOUCHER' as const, position: 4 }
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
