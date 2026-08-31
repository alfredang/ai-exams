/**
 * SC-300 bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:sc300-seed'` and upserts catalog rows.
 *
 * Exported as `seedSc300(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/sc300.ts`) and the protected
 * admin API (`/api/admin/seed-sc300`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn
 * SC-300 study guide and Microsoft Entra ID documentation, mapped to
 * the Microsoft Identity and Access Administrator (SC-300) domains:
 *   - Implement Identities in Microsoft Entra            — 20% (13)
 *   - Implement Authentication and Access Management      — 30% (19)
 *   - Implement Access Management for Applications        — 15% (10)
 *   - Plan and Implement Identity Governance              — 35% (23)
 *
 * These are original scenario-based items written to teach the
 * objectives — they are not transcribed from any live exam and the
 * product never claims to reproduce real exam questions.
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

const IDENT = 'Implement Identities in Microsoft Entra';
const AUTH = 'Implement Authentication and Access Management';
const APPS = 'Implement Access Management for Applications';
const GOV = 'Plan and Implement Identity Governance';

const REF_USERS = { label: 'Microsoft Learn — Add or delete users in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/how-to-create-delete-users' };
const REF_GROUPS = { label: 'Microsoft Learn — Manage groups and group membership', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-groups' };
const REF_DYNGROUP = { label: 'Microsoft Learn — Dynamic membership rules for groups', url: 'https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership' };
const REF_GUEST = { label: 'Microsoft Learn — B2B collaboration overview', url: 'https://learn.microsoft.com/en-us/entra/external-id/what-is-b2b' };
const REF_GUESTINVITE = { label: 'Microsoft Learn — Add B2B collaboration users', url: 'https://learn.microsoft.com/en-us/entra/external-id/add-users-administrator' };
const REF_BULK = { label: 'Microsoft Learn — Bulk create users in the Microsoft Entra admin center', url: 'https://learn.microsoft.com/en-us/entra/identity/users/users-bulk-add' };
const REF_DEVICES = { label: 'Microsoft Learn — Manage device identities', url: 'https://learn.microsoft.com/en-us/entra/identity/devices/manage-device-identities' };
const REF_DEVICEJOIN = { label: 'Microsoft Learn — Microsoft Entra registered vs joined vs hybrid joined', url: 'https://learn.microsoft.com/en-us/entra/identity/devices/concept-device-registration' };
const REF_ADMINUNITS = { label: 'Microsoft Learn — Administrative units in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/administrative-units' };
const REF_LICENSE = { label: 'Microsoft Learn — Group-based licensing in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/users/licensing-groups-assign' };
const REF_CONNECT = { label: 'Microsoft Learn — What is Microsoft Entra Connect Sync?', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/whatis-azure-ad-connect' };
const REF_CLOUDSYNC = { label: 'Microsoft Learn — What is Microsoft Entra Cloud Sync?', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/what-is-cloud-sync' };

const REF_MFA = { label: 'Microsoft Learn — How Microsoft Entra multifactor authentication works', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks' };
const REF_CA = { label: 'Microsoft Learn — What is Conditional Access?', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview' };
const REF_CAPOLICY = { label: 'Microsoft Learn — Building a Conditional Access policy', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies' };
const REF_SSPR = { label: 'Microsoft Learn — How self-service password reset works', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sspr-howitworks' };
const REF_PASSWORDLESS = { label: 'Microsoft Learn — Passwordless authentication options', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless' };
const REF_FIDO = { label: 'Microsoft Learn — Enable passwordless security key sign-in', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key' };
const REF_AUTHSTRENGTH = { label: 'Microsoft Learn — Conditional Access authentication strength', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-strengths' };
const REF_IPB = { label: 'Microsoft Learn — What is Identity Protection?', url: 'https://learn.microsoft.com/en-us/entra/id-protection/overview-identity-protection' };
const REF_RISK = { label: 'Microsoft Learn — What are risk detections?', url: 'https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-risks' };
const REF_RISKPOLICY = { label: 'Microsoft Learn — Configure and enable risk policies', url: 'https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-configure-risk-policies' };
const REF_BANNED = { label: 'Microsoft Learn — Eliminate bad passwords with Microsoft Entra Password Protection', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-password-ban-bad' };
const REF_NAMEDLOC = { label: 'Microsoft Learn — Using the location condition in a Conditional Access policy', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-assignment-network' };
const REF_CAE = { label: 'Microsoft Learn — Continuous access evaluation', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-continuous-access-evaluation' };
const REF_SECDEFAULTS = { label: 'Microsoft Learn — Security defaults in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/security-defaults' };

const REF_APPREG = { label: 'Microsoft Learn — Application and service principal objects', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals' };
const REF_ENTAPP = { label: 'Microsoft Learn — What is application management?', url: 'https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/what-is-application-management' };
const REF_SSO = { label: 'Microsoft Learn — Single sign-on options in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/sso-options' };
const REF_CONSENT = { label: 'Microsoft Learn — Configure how users consent to applications', url: 'https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-user-consent' };
const REF_ADMINCONSENT = { label: 'Microsoft Learn — Configure the admin consent workflow', url: 'https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-admin-consent-workflow' };
const REF_APPROLES = { label: 'Microsoft Learn — Add app roles and get them from a token', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-app-roles-in-apps' };
const REF_APPPROXY = { label: 'Microsoft Learn — Microsoft Entra application proxy', url: 'https://learn.microsoft.com/en-us/entra/identity/app-proxy/overview-what-is-app-proxy' };
const REF_PROVISION = { label: 'Microsoft Learn — App provisioning in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/app-provisioning/user-provisioning' };
const REF_MANAGEDID = { label: 'Microsoft Learn — Managed identities for Azure resources', url: 'https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview' };

const REF_ENTITLEMENT = { label: 'Microsoft Learn — What is entitlement management?', url: 'https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-overview' };
const REF_ACCESSPKG = { label: 'Microsoft Learn — Create an access package in entitlement management', url: 'https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-create' };
const REF_ACCESSREVIEW = { label: 'Microsoft Learn — What are access reviews?', url: 'https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview' };
const REF_PIM = { label: 'Microsoft Learn — What is Privileged Identity Management?', url: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure' };
const REF_PIMROLE = { label: 'Microsoft Learn — Assign Microsoft Entra roles in PIM', url: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-add-role-to-user' };
const REF_PIMACTIVATE = { label: 'Microsoft Learn — Activate my Microsoft Entra roles in PIM', url: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-how-to-activate-role' };
const REF_TOU = { label: 'Microsoft Learn — Terms of use in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/terms-of-use' };
const REF_LIFECYCLE = { label: 'Microsoft Learn — What are lifecycle workflows?', url: 'https://learn.microsoft.com/en-us/entra/id-governance/what-are-lifecycle-workflows' };
const REF_RBAC = { label: 'Microsoft Learn — Microsoft Entra built-in roles', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference' };
const REF_AUDITLOG = { label: 'Microsoft Learn — Audit logs in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-audit-logs' };
const REF_SIGNINLOG = { label: 'Microsoft Learn — Sign-in logs in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ins' };
const REF_CONNECTHEALTH = { label: 'Microsoft Learn — Microsoft Entra Connect Health', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/whatis-azure-ad-connect-health' };
const REF_DELEGATE = { label: 'Microsoft Learn — Delegate access governance to access package managers', url: 'https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-delegate' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Implement Identities in Microsoft Entra (13) ──
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You must create 200 user accounts for new hires in a single operation from the Microsoft Entra admin center without scripting. Which approach is most appropriate?',
    options: opts4(
      'Create each user individually under Users > New user',
      'Use the bulk create operation by uploading a CSV file under Users > Bulk operations',
      'Run Microsoft Entra Connect Sync from on-premises Active Directory',
      'Invite each new hire as a B2B guest'
    ),
    correct: ['b'],
    explanation: 'The Microsoft Entra admin center supports bulk create by uploading a comma-separated value (CSV) template; this provisions many cloud users in one operation without PowerShell or Graph scripting. Individual creation does not scale, Connect Sync requires on-premises AD, and B2B invitations create guest objects, not member accounts.',
    references: [REF_BULK, REF_USERS]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A company wants the Sales security group to automatically include every member account whose department attribute equals "Sales". Which group configuration achieves this with no manual maintenance?',
    options: opts4(
      'A static assigned security group',
      'A Microsoft 365 group with owners adding members manually',
      'A dynamic membership group with the rule (user.department -eq "Sales")',
      'An administrative unit scoped to Sales'
    ),
    correct: ['c'],
    explanation: 'Dynamic membership groups evaluate a membership rule against user attributes (for example user.department -eq "Sales") and add or remove members automatically as attributes change. Assigned groups and manual ownership require human maintenance, and administrative units delegate admin scope rather than computing membership.',
    references: [REF_DYNGROUP, REF_GROUPS]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to grant a regional helpdesk admin the ability to reset passwords only for users in the Germany office, not the entire tenant. Which Microsoft Entra feature scopes the role this way?',
    options: opts4(
      'Conditional Access',
      'Administrative units',
      'Dynamic groups',
      'Privileged Identity Management eligibility'
    ),
    correct: ['b'],
    explanation: 'Administrative units let you scope a directory role assignment (for example Helpdesk Administrator) to a subset of users and groups, so the admin can only manage members of that administrative unit. Conditional Access controls sign-in, dynamic groups compute membership, and PIM controls when a role is active, not its object scope.',
    references: [REF_ADMINUNITS, REF_RBAC]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Group-based licensing in Microsoft Entra ID automatically assigns the configured product licenses to any user who becomes a member of the group.',
    options: tf(),
    correct: ['a'],
    explanation: 'Group-based licensing assigns the licenses configured on the group to all current and future members, and removes them when a user leaves the group, provided enough licenses are available. This is the standard way to license users at scale based on group membership.',
    references: [REF_LICENSE]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A partner organization needs occasional access to a shared SharePoint site. You want them to sign in with their own corporate credentials and appear in your directory as external. What should you create?',
    options: opts4(
      'A cloud-only member account with a temporary password',
      'A B2B collaboration guest user via an invitation',
      'A managed identity',
      'A hybrid-joined device record'
    ),
    correct: ['b'],
    explanation: 'B2B collaboration creates a guest user object that authenticates against the partner\'s home identity provider while being represented in your tenant for resource sharing. Member accounts are for your own organization, managed identities are for Azure workloads, and device records are not user identities.',
    references: [REF_GUEST, REF_GUESTINVITE]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organization synchronizes on-premises Active Directory to Microsoft Entra ID and needs a lightweight, agent-based option that supports multiple disconnected forests without a full server. Which tool fits best?',
    options: opts4(
      'Microsoft Entra Connect Sync',
      'Microsoft Entra Cloud Sync',
      'Active Directory Federation Services only',
      'Bulk CSV import'
    ),
    correct: ['b'],
    explanation: 'Microsoft Entra Cloud Sync uses a lightweight provisioning agent managed in the cloud and supports synchronizing multiple disconnected AD forests, with lower infrastructure footprint than the full Connect Sync server. AD FS handles federation, not provisioning, and CSV import is for cloud-only users.',
    references: [REF_CLOUDSYNC, REF_CONNECT]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which device registration state describes a personal device that a user adds to access organizational resources, where the device gets a Microsoft Entra identity but is not domain joined?',
    options: opts4(
      'Microsoft Entra hybrid joined',
      'Microsoft Entra joined',
      'Microsoft Entra registered',
      'On-premises domain joined only'
    ),
    correct: ['c'],
    explanation: 'Microsoft Entra registered (workplace joined) is used for bring-your-own personal devices that get a directory identity for Conditional Access and SSO without being organization owned. Entra joined devices are organization owned cloud devices, and hybrid joined devices are also joined to on-premises AD.',
    references: [REF_DEVICEJOIN, REF_DEVICES]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a single object that lets you assign the same set of cloud licenses and a security group membership to a department, and have it react to HR attribute changes. Which combination is correct?',
    options: opts4(
      'A dynamic security group with group-based licensing applied to it',
      'An administrative unit with a static license per user',
      'A B2B guest group with manual licensing',
      'A managed identity assigned licenses'
    ),
    correct: ['a'],
    explanation: 'A dynamic security group recomputes membership from user attributes, and applying group-based licensing to that group means members automatically receive (and lose) the licenses as they enter or leave the group. Administrative units do not compute membership, and managed identities are not licensed user objects.',
    references: [REF_DYNGROUP, REF_LICENSE]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'After a user is deleted in the Microsoft Entra admin center, an admin realizes the deletion was a mistake. Within what window can the account typically be restored from the deleted users view?',
    options: opts4(
      'It cannot be restored once deleted',
      'Within 30 days from the Deleted users list',
      'Only within 24 hours',
      'Within 1 year automatically'
    ),
    correct: ['b'],
    explanation: 'A soft-deleted Microsoft Entra user remains in the Deleted users list and can be restored for 30 days; after that the object is permanently removed and cannot be recovered. This soft-delete window protects against accidental deletions.',
    references: [REF_USERS]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which role allows creating and managing users and groups, resetting most user passwords, and managing service requests, but is more limited than Global Administrator?',
    options: opts4(
      'User Administrator',
      'Global Reader',
      'Security Administrator',
      'Application Administrator'
    ),
    correct: ['a'],
    explanation: 'The User Administrator role can create and manage users and groups and reset passwords for non-admin and limited admin users, without the full tenant control of Global Administrator. Global Reader is read-only, and the other roles target security or application objects.',
    references: [REF_RBAC]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want guest invitation emails to be branded and to restrict who in your tenant can invite guests. Where do you primarily configure external collaboration restrictions?',
    options: opts4(
      'Conditional Access named locations',
      'External collaboration settings / cross-tenant access settings',
      'Group-based licensing',
      'Password protection settings'
    ),
    correct: ['b'],
    explanation: 'External collaboration settings (and cross-tenant access settings) control who can invite B2B guests, guest permission levels, and collaboration restrictions per partner tenant. Conditional Access, licensing, and password protection address different controls.',
    references: [REF_GUEST, REF_GUESTINVITE]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A Microsoft 365 group can be used both for collaboration (mailbox, SharePoint site) and as a security principal for assigning access to resources.',
    options: tf(),
    correct: ['a'],
    explanation: 'Microsoft 365 groups provide collaboration workloads such as a shared mailbox and SharePoint site, and they can also be used to grant access to applications and resources, including app role assignments, similar to security groups in many scenarios.',
    references: [REF_GROUPS]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid environment must keep on-premises Active Directory as the source of authority while still enabling cloud sign-in. Which statement about Microsoft Entra Connect Sync is correct?',
    options: opts4(
      'It writes all changes from the cloud back to AD by default',
      'It synchronizes identities from on-premises AD to Microsoft Entra ID, with AD as the authoritative source for synced objects',
      'It replaces the need for any on-premises directory',
      'It only works with a single domain controller'
    ),
    correct: ['b'],
    explanation: 'Microsoft Entra Connect Sync provisions and updates objects from on-premises AD into Microsoft Entra ID, keeping AD authoritative for synced attributes. Writeback is optional and limited to specific features; it does not eliminate the on-premises directory.',
    references: [REF_CONNECT]
  },

  // ── Implement Authentication and Access Management (19) ──
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Conditional Access policy component determines WHO and WHAT the policy applies to (for example users, groups, and target cloud apps)?',
    options: opts4(
      'Grant controls',
      'Assignments',
      'Session controls',
      'Authentication strength'
    ),
    correct: ['b'],
    explanation: 'In a Conditional Access policy, Assignments define the scope: users/groups, target resources (cloud apps), and conditions. Grant and session controls define what happens once the policy matches, and authentication strength is a specific grant control.',
    references: [REF_CAPOLICY, REF_CA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must require phishing-resistant authentication (such as FIDO2 security keys) for administrators accessing the Azure portal. Which Conditional Access grant control should you use?',
    options: opts4(
      'Require multifactor authentication only',
      'Require an authentication strength that includes only phishing-resistant methods',
      'Require device to be marked as compliant',
      'Block legacy authentication'
    ),
    correct: ['b'],
    explanation: 'Conditional Access authentication strength lets you require a specific set of methods; the built-in phishing-resistant MFA strength permits only methods such as FIDO2 security keys, Windows Hello for Business, and certificate-based authentication. Plain "require MFA" still allows weaker methods like SMS.',
    references: [REF_AUTHSTRENGTH, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A small organization with no Conditional Access licenses wants a baseline of free protection that enforces MFA registration and blocks legacy authentication. What should they enable?',
    options: opts4(
      'Security defaults',
      'A custom Conditional Access policy',
      'Identity Protection sign-in risk policy',
      'Privileged Identity Management'
    ),
    correct: ['a'],
    explanation: 'Security defaults provide a free, preconfigured set of identity security controls (enforced MFA registration, MFA for admins, blocking legacy authentication) for tenants that do not use Conditional Access. Conditional Access and risk policies require premium licensing.',
    references: [REF_SECDEFAULTS, REF_MFA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want users to reset their own passwords from the sign-in page after registering verification methods, reducing helpdesk calls. Which feature should you configure?',
    options: opts4(
      'Self-service password reset (SSPR)',
      'Password protection banned password list',
      'Conditional Access sign-in frequency',
      'Continuous access evaluation'
    ),
    correct: ['a'],
    explanation: 'Self-service password reset (SSPR) lets users reset or unlock their account using pre-registered authentication methods, cutting helpdesk volume. Password protection blocks weak passwords, and the other features control session behavior, not user-driven reset.',
    references: [REF_SSPR]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Microsoft Entra Password Protection can block users from setting passwords that contain terms on a custom banned password list as well as Microsoft\'s global list.',
    options: tf(),
    correct: ['a'],
    explanation: 'Microsoft Entra Password Protection enforces the Microsoft global banned password list and supports a tenant-specific custom banned password list, blocking weak or organization-specific terms during password set and change, including on-premises with the agent.',
    references: [REF_BANNED]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'Identity Protection flags a user as high risk because of leaked credentials. You want to automatically force a secure password change for high-risk users. Which policy accomplishes this?',
    options: opts4(
      'A sign-in risk Conditional Access policy that blocks access',
      'A user risk Conditional Access policy requiring password change for high user risk',
      'A named location policy',
      'Security defaults'
    ),
    correct: ['b'],
    explanation: 'A user risk-based Conditional Access policy can require a secure password change when user risk is high, which remediates the risky user once they complete MFA and change the password. Sign-in risk policies respond to the sign-in session, not the user\'s accumulated risk.',
    references: [REF_RISKPOLICY, REF_IPB]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which authentication method is considered passwordless and phishing-resistant, using a hardware authenticator that performs cryptographic sign-in?',
    options: opts4(
      'SMS text message code',
      'FIDO2 security key',
      'Security questions',
      'Email one-time passcode'
    ),
    correct: ['b'],
    explanation: 'FIDO2 security keys provide passwordless, phishing-resistant authentication using public-key cryptography bound to the relying party, so credentials cannot be replayed on a fake site. SMS, security questions, and email OTP are not phishing-resistant.',
    references: [REF_FIDO, REF_PASSWORDLESS]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'You want sessions to be revoked quickly when a user is disabled or a risky condition is detected, rather than waiting for the access token to expire. Which capability addresses this?',
    options: opts4(
      'Continuous access evaluation (CAE)',
      'Sign-in frequency of 90 days',
      'Persistent browser session',
      'Security defaults'
    ),
    correct: ['a'],
    explanation: 'Continuous access evaluation enables near-real-time enforcement: supported services can revoke access mid-session in response to critical events (user disabled, password reset, high risk) without waiting for token expiry. Long sign-in frequency and persistent sessions do the opposite.',
    references: [REF_CAE, REF_CA]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'A Conditional Access policy should treat connections from the corporate public IP ranges as trusted. Where do you define those IP ranges for use in the policy?',
    options: opts4(
      'Authentication methods policy',
      'Named locations',
      'Token lifetime policy',
      'App registration manifest'
    ),
    correct: ['b'],
    explanation: 'Named locations define IP ranges or countries (and can be marked trusted) that you reference in the location condition of Conditional Access policies, for example to require MFA only when outside trusted corporate IPs.',
    references: [REF_NAMEDLOC, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'You configure a Conditional Access policy with "Require device to be marked as compliant". Which prerequisite service must evaluate and report device compliance?',
    options: opts4(
      'Microsoft Intune (or another supported MDM) integrated with Microsoft Entra ID',
      'Microsoft Entra Connect Health',
      'Privileged Identity Management',
      'Entitlement management'
    ),
    correct: ['a'],
    explanation: 'Device compliance state used by Conditional Access comes from a mobile device management solution such as Microsoft Intune, which evaluates compliance policies and writes the compliant flag back to the device object in Microsoft Entra ID.',
    references: [REF_CAPOLICY, REF_DEVICES]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Blocking legacy authentication protocols is recommended because they cannot enforce multifactor authentication and are a common target for password spray attacks.',
    options: tf(),
    correct: ['a'],
    explanation: 'Legacy authentication protocols (such as older mail clients using basic authentication) do not support modern authentication or MFA, so attackers favor them for password spray. Blocking them with Conditional Access significantly reduces account compromise risk.',
    references: [REF_CA, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'Identity Protection assigns a "sign-in risk" of medium for an atypical-travel detection. You want to require MFA only for medium-or-above sign-in risk. Which policy type should you create?',
    options: opts4(
      'A user risk policy',
      'A sign-in risk-based Conditional Access policy with risk levels medium and high',
      'A named location block policy',
      'A terms of use policy'
    ),
    correct: ['b'],
    explanation: 'A sign-in risk-based Conditional Access policy evaluates the real-time sign-in risk level and can require MFA when risk is medium or high, allowing the legitimate user to self-remediate while challenging suspicious sessions.',
    references: [REF_RISKPOLICY, REF_RISK]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes how Microsoft Entra multifactor authentication strengthens sign-in security?',
    options: opts4(
      'It replaces the password with a single hardware token',
      'It requires two or more verification factors from different categories (something you know, have, or are)',
      'It only applies to administrator accounts',
      'It encrypts the password in transit'
    ),
    correct: ['b'],
    explanation: 'MFA requires the user to present two or more independent factors from different categories, so a stolen password alone is insufficient. It is not limited to admins and is not merely transport encryption.',
    references: [REF_MFA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to register users for combined security information (MFA and SSPR) in one streamlined experience. Which capability provides this?',
    options: opts4(
      'Combined security information registration',
      'Per-user MFA enforced state',
      'Security defaults only',
      'Token lifetime configuration'
    ),
    correct: ['a'],
    explanation: 'Combined registration lets users register authentication methods once for both MFA and self-service password reset, improving the experience versus separate legacy registration flows. Per-user MFA legacy state is not a combined registration mechanism.',
    references: [REF_SSPR, REF_MFA]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'A Conditional Access policy is created in report-only mode. What is the effect on users?',
    options: opts4(
      'The policy blocks users but logs nothing',
      'The policy is evaluated and results are logged, but grant/session controls are not enforced',
      'The policy is disabled entirely',
      'The policy applies only to guests'
    ),
    correct: ['b'],
    explanation: 'Report-only mode evaluates the policy and records what would have happened in sign-in logs and the Conditional Access workbook, without actually enforcing controls — ideal for measuring impact before turning a policy on.',
    references: [REF_CAPOLICY, REF_SIGNINLOG]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which authentication method allows users to sign in with a phone notification approve/deny prompt and is managed via the Authentication methods policy?',
    options: opts4(
      'Microsoft Authenticator app push notification',
      'Security questions',
      'Email OTP for members',
      'Certificate revocation list'
    ),
    correct: ['a'],
    explanation: 'Microsoft Authenticator supports push approval (and passwordless phone sign-in) and is enabled and scoped through the Authentication methods policy. Security questions are SSPR-only, and email OTP is generally for external users.',
    references: [REF_MFA, REF_PASSWORDLESS]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to ensure that even if a session token is exported, access stops promptly after an administrator disables the account in a critical incident. Besides disabling the user, which feature most directly shortens the window of continued access?',
    options: opts4(
      'Increasing sign-in frequency to 90 days',
      'Continuous access evaluation with strict location enforcement',
      'Disabling MFA',
      'Enabling persistent browser sessions'
    ),
    correct: ['b'],
    explanation: 'Continuous access evaluation lets resource providers honor critical events (such as account disabled) quickly, and strict enforcement reduces tolerance for token reuse from changed conditions, shortening the period a stolen token remains usable.',
    references: [REF_CAE]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Identity Protection report helps you investigate which users are flagged risky and why, so you can confirm or dismiss the risk?',
    options: opts4(
      'Risky users report',
      'Audit logs only',
      'Bulk operation results',
      'License assignment report'
    ),
    correct: ['a'],
    explanation: 'The Risky users report in Identity Protection lists users with detected risk, their risk level, and detections, and lets admins confirm compromise or dismiss risk. Audit logs track directory changes, not consolidated risk state.',
    references: [REF_IPB, REF_RISK]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A policy must require MFA for all users accessing any cloud app, but exclude a break-glass emergency access account. What is the recommended practice?',
    options: opts4(
      'Do not create the policy at all',
      'Create the MFA policy and explicitly exclude the dedicated emergency access account(s)',
      'Disable MFA for everyone',
      'Apply the policy only to guests'
    ),
    correct: ['b'],
    explanation: 'Best practice is to maintain one or two cloud-only emergency access (break-glass) accounts excluded from MFA/Conditional Access policies so admins can still sign in if a policy or MFA service fails, while all other users are protected.',
    references: [REF_CAPOLICY, REF_CA]
  },

  // ── Implement Access Management for Applications (10) ──
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'When you register an application in Microsoft Entra ID, which object is created in your tenant to represent that application instance for sign-in and permission grants?',
    options: opts4(
      'A managed identity',
      'A service principal',
      'An administrative unit',
      'A dynamic group'
    ),
    correct: ['b'],
    explanation: 'An application registration creates an application object plus a service principal in the tenant; the service principal is the local representation used for authentication, sign-in policies, and permission/role assignments. Managed identities are a special automatically managed service principal type.',
    references: [REF_APPREG, REF_ENTAPP]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Users keep consenting to risky third-party apps requesting broad permissions. You want users to be able to request access but require an administrator to approve. What should you configure?',
    options: opts4(
      'Disable all user sign-in',
      'Configure the admin consent workflow and restrict user consent to low-risk permissions',
      'Delete all enterprise applications',
      'Enable security defaults only'
    ),
    correct: ['b'],
    explanation: 'Restricting user consent (for example to verified publishers and low-impact permissions) combined with the admin consent workflow lets users request access while administrators review and approve consent requests, reducing illicit consent risk without blocking sign-in.',
    references: [REF_CONSENT, REF_ADMINCONSENT]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to publish an internal on-premises web app for secure remote access through Microsoft Entra ID without a VPN. Which feature should you use?',
    options: opts4(
      'Microsoft Entra application proxy',
      'Conditional Access named locations',
      'Group-based licensing',
      'Cloud Sync'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra application proxy publishes on-premises web applications for secure external access, with pre-authentication through Microsoft Entra ID and Conditional Access, eliminating the need for a traditional VPN for those apps.',
    references: [REF_APPPROXY]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SaaS application supports automatic creation and deactivation of user accounts based on Microsoft Entra group membership. Which capability should you configure on the enterprise application?',
    options: opts4(
      'SAML SSO only',
      'Automatic user provisioning (SCIM)',
      'A managed identity',
      'A named location'
    ),
    correct: ['b'],
    explanation: 'Automatic user provisioning uses the SCIM protocol so Microsoft Entra ID can create, update, and deprovision accounts in the SaaS app based on assignment and group membership, keeping app accounts in sync with the directory lifecycle.',
    references: [REF_PROVISION, REF_ENTAPP]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'An Azure VM-hosted application needs to authenticate to Azure Key Vault without storing any secret in code or configuration. What should the application use?',
    options: opts4(
      'A user account password',
      'A managed identity',
      'A B2B guest invitation',
      'A named location'
    ),
    correct: ['b'],
    explanation: 'A managed identity gives the Azure resource an automatically managed identity in Microsoft Entra ID so it can obtain tokens for services like Key Vault without any credentials in code, and the identity\'s lifecycle is tied to the resource.',
    references: [REF_MANAGEDID]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'You need an application to expose different permission levels so that tokens contain a claim indicating whether the caller is an "Admin" or "Reader". Which feature should the app developer define?',
    options: opts4(
      'App roles in the application registration',
      'A dynamic group rule',
      'A named location',
      'A terms of use document'
    ),
    correct: ['a'],
    explanation: 'App roles defined on the application registration are emitted as a roles claim in the token when users or groups are assigned to those roles, enabling in-app role-based authorization. Groups and named locations do not surface app-specific role claims.',
    references: [REF_APPROLES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: When "Assignment required" is enabled on an enterprise application, only users or groups explicitly assigned to the app can sign in to it.',
    options: tf(),
    correct: ['a'],
    explanation: 'Enabling "Assignment required" (User assignment required) restricts sign-in to principals that have been explicitly assigned to the application, which is a common way to limit who can access a gallery or custom enterprise app.',
    references: [REF_ENTAPP, REF_SSO]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A gallery SaaS app supports federated single sign-on. You want users to authenticate once with their Microsoft Entra credentials and access the app without a separate password. Which SSO method should you configure?',
    options: opts4(
      'Password-based SSO with a shared credential',
      'SAML or OpenID Connect-based SSO',
      'Linked SSO that just adds a tile',
      'No SSO; use the local app login'
    ),
    correct: ['b'],
    explanation: 'Federated SSO using SAML or OpenID Connect lets Microsoft Entra ID issue tokens the app trusts, giving true single sign-on without app-specific passwords. Password-based SSO stores credentials, and linked SSO only adds a launch tile.',
    references: [REF_SSO]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which audit data source shows when a user or admin granted consent (a permission grant) to an application?',
    options: opts4(
      'Microsoft Entra audit logs',
      'Group-based licensing report',
      'Connect Health',
      'Named locations'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra audit logs record directory activities including consent grants and service principal changes, so you can investigate when and by whom an application was granted permissions. Licensing reports and Connect Health track different data.',
    references: [REF_AUDITLOG, REF_CONSENT]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants only verified-publisher multitenant apps requesting low-impact delegated permissions to be user-consentable, with everything else routed for admin approval. Which two settings work together?',
    options: opts4(
      'Security defaults and per-user MFA',
      'User consent settings (restricted) and the admin consent workflow',
      'Named locations and sign-in frequency',
      'PIM eligibility and access reviews'
    ),
    correct: ['b'],
    explanation: 'Restricting user consent settings to verified publishers and selected low-impact permissions, combined with the admin consent workflow, lets benign apps proceed while routing higher-risk consent to administrators for review.',
    references: [REF_CONSENT, REF_ADMINCONSENT]
  },

  // ── Plan and Implement Identity Governance (23) ──
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft Entra ID Governance feature bundles groups, apps, and SharePoint sites into a single requestable package with approval and expiration?',
    options: opts4(
      'Privileged Identity Management',
      'Entitlement management access packages',
      'Conditional Access',
      'Password protection'
    ),
    correct: ['b'],
    explanation: 'Entitlement management uses access packages that bundle resources (groups, apps, SharePoint sites) with policies for who can request, approval workflow, and expiration, automating access lifecycle for internal and external users.',
    references: [REF_ENTITLEMENT, REF_ACCESSPKG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want privileged role holders to have NO standing access; they must request and justify activation, get approval, and the role is time-bound. Which capability provides this?',
    options: opts4(
      'Permanent active role assignment',
      'Privileged Identity Management with eligible assignments and activation',
      'Group-based licensing',
      'A dynamic group'
    ),
    correct: ['b'],
    explanation: 'Privileged Identity Management implements just-in-time access: users are made eligible for a role and must activate it (with justification, optional approval, and MFA) for a limited time, removing standing privilege. Permanent active assignment is the opposite.',
    references: [REF_PIM, REF_PIMROLE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Auditors require quarterly confirmation that members of the "Finance App Admins" group still need access. Which feature automates this recurring attestation?',
    options: opts4(
      'Access reviews',
      'Conditional Access',
      'Cloud Sync',
      'Application proxy'
    ),
    correct: ['a'],
    explanation: 'Access reviews let you schedule recurring reviews of group membership, app assignments, or role assignments where reviewers (self, managers, or designated reviewers) attest to continued need, with automatic removal of denied access.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'New employees should automatically receive a welcome task and be added to baseline groups on their hire date, and have access removed on termination. Which Microsoft Entra ID Governance feature is designed for this?',
    options: opts4(
      'Lifecycle workflows',
      'Named locations',
      'Security defaults',
      'Token lifetime policy'
    ),
    correct: ['a'],
    explanation: 'Lifecycle workflows automate joiner/mover/leaver tasks (such as enabling accounts, sending welcome emails, adding to groups, and disabling accounts) triggered by attributes like employeeHireDate and employeeLeaveDateTime.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In Privileged Identity Management, you can require approval and multifactor authentication as conditions for activating an eligible privileged role.',
    options: tf(),
    correct: ['a'],
    explanation: 'PIM role settings let you require MFA on activation, justification, ticket information, and approval by designated approvers, plus a maximum activation duration — strengthening control over privileged access.',
    references: [REF_PIM, REF_PIMACTIVATE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'You need external partners to request access to a collaboration package, with their own organization\'s sponsor approving and access auto-expiring after 90 days. Which entitlement management construct enforces the approval and expiration?',
    options: opts4(
      'A dynamic group rule',
      'An access package policy',
      'A named location',
      'A Conditional Access grant control'
    ),
    correct: ['b'],
    explanation: 'An access package can have policies targeting external users, defining who may request, the approval stages (including sponsor approval), and lifecycle settings such as expiration after a set number of days, automating governed external access.',
    references: [REF_ACCESSPKG, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which review outcome setting in an access review automatically removes access for users who are denied or not reviewed by the deadline?',
    options: opts4(
      'Take recommendations only',
      'Auto-apply results and remove access for denied/not-reviewed users',
      'Disable the review',
      'Convert the group to dynamic'
    ),
    correct: ['b'],
    explanation: 'Access reviews can be configured to auto-apply results so denied users (and optionally users not reviewed) automatically lose the reviewed access when the review ends, ensuring attestation actually enforces least privilege.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'You must ensure all users accept a legal disclaimer before accessing finance applications, and re-accept annually. Which feature integrates with Conditional Access to enforce this?',
    options: opts4(
      'Terms of use',
      'Access packages',
      'Connect Health',
      'Bulk operations'
    ),
    correct: ['a'],
    explanation: 'Terms of use documents can be required through a Conditional Access grant control, forcing users to accept the agreement before access, with options to require periodic re-acceptance and to report acceptance for audit.',
    references: [REF_TOU, REF_CA]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which PIM concept describes a role assignment a user holds but cannot use until they explicitly activate it?',
    options: opts4(
      'Active assignment',
      'Eligible assignment',
      'Permanent owner',
      'Dynamic assignment'
    ),
    correct: ['b'],
    explanation: 'An eligible assignment means the user can activate the role when needed (subject to PIM settings) but does not have the permissions until activation. Active assignment grants the role immediately for its duration.',
    references: [REF_PIM, REF_PIMROLE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Security wants to detect and review standing Global Administrator assignments and convert them to just-in-time. Which sequence is most appropriate?',
    options: opts4(
      'Delete all admins, then recreate them',
      'Use PIM to make assignments eligible, configure activation requirements, and schedule access reviews of privileged roles',
      'Enable security defaults and stop',
      'Move admins to an administrative unit'
    ),
    correct: ['b'],
    explanation: 'Best practice is to onboard privileged roles into PIM, convert permanent assignments to eligible just-in-time with MFA/approval, and run access reviews of privileged roles so unused or unjustified admin access is removed over time.',
    references: [REF_PIM, REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Entitlement management can govern access for both internal employees and external (B2B) users through the same access package with different policies.',
    options: tf(),
    correct: ['a'],
    explanation: 'A single access package can have multiple policies — one for internal users and another for external/connected organizations — allowing governed self-service requests, approval, and expiration for guests as well as employees.',
    references: [REF_ENTITLEMENT, REF_ACCESSPKG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to delegate creation and management of access packages for the Marketing department to a non-Global-Administrator owner, scoped to that department\'s catalog. What should you use?',
    options: opts4(
      'Grant Global Administrator to the owner',
      'Delegate via entitlement management catalog roles (catalog owner / access package manager)',
      'Add the owner to a dynamic group',
      'Create a named location'
    ),
    correct: ['b'],
    explanation: 'Entitlement management supports delegation: assigning catalog owner or access package manager roles on a specific catalog lets a non-global admin manage that department\'s packages without broad tenant privilege.',
    references: [REF_DELEGATE, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which monitoring log would you use to investigate failed and successful authentications, Conditional Access policy results, and MFA outcomes for a specific user?',
    options: opts4(
      'Sign-in logs',
      'Audit logs',
      'Provisioning logs',
      'Bulk operation results'
    ),
    correct: ['a'],
    explanation: 'Sign-in logs capture interactive and non-interactive sign-ins, including applied Conditional Access policies, MFA results, and failure reasons, which is the primary source for troubleshooting access for a user.',
    references: [REF_SIGNINLOG, REF_AUDITLOG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'A leaver process must disable the account, remove group memberships, and revoke sessions automatically on the employee\'s last day. Which feature schedules these tasks based on the leave date attribute?',
    options: opts4(
      'Lifecycle workflows with a leaver workflow',
      'Conditional Access session controls',
      'Group-based licensing',
      'Password protection'
    ),
    correct: ['a'],
    explanation: 'A lifecycle workflow leaver scenario can trigger on employeeLeaveDateTime to run tasks such as disabling the account, removing group/Teams memberships, and revoking sessions, automating offboarding consistently.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which access review reviewer option asks the affected users themselves to attest whether they still need the access?',
    options: opts4(
      'Self-review',
      'Manager review',
      'Designated reviewer',
      'No reviewer'
    ),
    correct: ['a'],
    explanation: 'Access reviews can be assigned to the users themselves (self-review), to managers, or to specific designated reviewers. Self-review asks each member to justify their own continued need for the access.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'PIM is configured so activating the Exchange Administrator role requires approval. The approver is unavailable for hours. Which PIM setting could have mitigated long waits while preserving control?',
    options: opts4(
      'Remove approval entirely for all roles',
      'Configure multiple approvers and a reasonable maximum activation/justification policy',
      'Make the assignment permanently active',
      'Disable PIM'
    ),
    correct: ['b'],
    explanation: 'Assigning multiple approvers (so any one can approve) and tuning activation settings balances control with availability, avoiding single-approver bottlenecks without resorting to permanent standing access.',
    references: [REF_PIM, REF_PIMACTIVATE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature provides a catalog where related resources are grouped so that access package designers can only include approved resources for their scope?',
    options: opts4(
      'Entitlement management catalogs',
      'Named locations',
      'Administrative units',
      'Connect Health'
    ),
    correct: ['a'],
    explanation: 'In entitlement management, a catalog is a container of resources (groups, apps, sites) and access packages; catalog owners control which resources are available, enabling delegated, scoped access package design.',
    references: [REF_ENTITLEMENT, REF_DELEGATE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership wants a recurring review of all guest users\' access to a sensitive Microsoft 365 group, with managers as reviewers and automatic removal if not approved. Which configuration meets all requirements?',
    options: opts4(
      'A one-time self-review with recommendations only',
      'A recurring access review scoped to guests, manager as reviewer, auto-apply removing denied/unreviewed access',
      'A dynamic group rule on guests',
      'A Conditional Access policy blocking guests'
    ),
    correct: ['b'],
    explanation: 'A recurring access review scoped to guest members of the group, with the manager as reviewer and auto-apply enabled to remove denied or unreviewed users, satisfies recurring attestation plus enforced cleanup.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: PIM can manage just-in-time activation for both Microsoft Entra roles and Azure (ARM) resource roles.',
    options: tf(),
    correct: ['a'],
    explanation: 'Privileged Identity Management supports eligible assignments and just-in-time activation for Microsoft Entra directory roles and for Azure resource (RBAC) roles, plus PIM for groups, centralizing privileged access governance.',
    references: [REF_PIM, REF_PIMROLE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'To investigate the health and synchronization errors of your hybrid identity infrastructure (Connect Sync, AD FS), which monitoring solution should you use?',
    options: opts4(
      'Microsoft Entra Connect Health',
      'Identity Protection',
      'Entitlement management',
      'Terms of use'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra Connect Health monitors and alerts on the health, performance, and synchronization of hybrid identity components such as Connect Sync and AD FS, helping detect sync errors and outages.',
    references: [REF_CONNECTHEALTH, REF_CONNECT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which governance practice most directly enforces the principle of least privilege for administrators on an ongoing basis?',
    options: opts4(
      'Granting permanent Global Administrator to all IT staff',
      'Combining PIM just-in-time activation with periodic access reviews of privileged roles',
      'Disabling MFA for admins',
      'Using a single shared admin account'
    ),
    correct: ['b'],
    explanation: 'Least privilege over time is best achieved by eliminating standing privilege with PIM just-in-time activation and continuously validating necessity through access reviews of privileged roles, removing unused admin access.',
    references: [REF_PIM, REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'An access package for contractors should require both the requestor\'s manager and a resource owner to approve in sequence before access is granted. Which capability supports this?',
    options: opts4(
      'Single-stage auto-approval only',
      'Multi-stage approval in the access package policy',
      'A dynamic group',
      'Security defaults'
    ),
    correct: ['b'],
    explanation: 'Access package request policies support multi-stage approval, so you can require sequential approvals (for example first-stage manager, second-stage resource owner) before entitlement is granted, enforcing layered authorization.',
    references: [REF_ACCESSPKG, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which report helps an administrator review historical changes such as role assignments, group modifications, and policy edits for compliance?',
    options: opts4(
      'Audit logs',
      'Sign-in logs',
      'Named locations',
      'Licensing report'
    ),
    correct: ['a'],
    explanation: 'Audit logs record directory change activities — who changed what and when — including role assignments, group changes, and policy modifications, which is essential for compliance investigations and change tracking.',
    references: [REF_AUDITLOG]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Implement Identities in Microsoft Entra (13) ──
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new project team of 40 contractors needs cloud accounts created quickly. The identity admin prefers a no-code, repeatable file-driven method in the portal. Which option is best?',
    options: opts4(
      'Invite each contractor as a guest one by one',
      'Use Bulk operations to upload a CSV of users in the Microsoft Entra admin center',
      'Configure Microsoft Entra Connect Sync',
      'Create one shared account for all contractors'
    ),
    correct: ['b'],
    explanation: 'Bulk operations in the Microsoft Entra admin center accept a CSV upload to create many cloud users repeatably with no scripting. Guest invitations create external objects, Connect Sync needs on-premises AD, and shared accounts violate identity best practice.',
    references: [REF_BULK, REF_USERS]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need a group whose membership always equals all users in the "Engineering" department and country "US", updating automatically. Which membership type and rule are correct?',
    options: opts4(
      'Assigned group; add users manually each month',
      'Dynamic user group; (user.department -eq "Engineering") and (user.country -eq "US")',
      'Microsoft 365 group with owner-managed membership',
      'Administrative unit scoped to Engineering'
    ),
    correct: ['b'],
    explanation: 'A dynamic user group with a compound rule using -and on department and country recomputes membership automatically as attributes change. Assigned and owner-managed groups need manual upkeep; administrative units delegate admin scope, not membership.',
    references: [REF_DYNGROUP, REF_GROUPS]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want the Paris helpdesk to manage only Paris users while the Berlin helpdesk manages only Berlin users, using the same Helpdesk Administrator role. Which feature scopes each assignment?',
    options: opts4(
      'Dynamic groups',
      'Administrative units (one per city) with scoped role assignments',
      'Conditional Access',
      'Group-based licensing'
    ),
    correct: ['b'],
    explanation: 'Creating an administrative unit per city and assigning the Helpdesk Administrator role scoped to each unit confines each helpdesk team to its own users. Dynamic groups, Conditional Access, and licensing do not scope directory-role administration this way.',
    references: [REF_ADMINUNITS, REF_RBAC]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: With group-based licensing, removing a user from the licensing group automatically reclaims that user\'s assigned licenses (assuming no other source assigns them).',
    options: tf(),
    correct: ['a'],
    explanation: 'Group-based licensing removes the group-derived licenses when a user leaves the group, freeing the license unless another group or direct assignment still grants it. This keeps license consumption aligned with membership.',
    references: [REF_LICENSE]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A vendor needs to collaborate using their existing Microsoft Entra account from another tenant. You want them governed in your directory as external. Which identity model applies?',
    options: opts4(
      'Create a synced AD account for them',
      'B2B collaboration guest with cross-tenant access settings',
      'A managed identity for the vendor',
      'A device registration'
    ),
    correct: ['b'],
    explanation: 'B2B collaboration represents the vendor as a guest while they authenticate in their home tenant; cross-tenant access settings govern inbound/outbound trust. Synced accounts are for your own AD, and managed identities/devices are not user collaboration objects.',
    references: [REF_GUEST, REF_GUESTINVITE]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organization has three separate Active Directory forests that are not connected to each other and wants minimal on-premises infrastructure for provisioning to the cloud. Which solution is recommended?',
    options: opts4(
      'A single Microsoft Entra Connect Sync server only',
      'Microsoft Entra Cloud Sync with lightweight provisioning agents',
      'Manual CSV exports each night',
      'AD FS federation alone'
    ),
    correct: ['b'],
    explanation: 'Microsoft Entra Cloud Sync supports synchronizing multiple disconnected forests using lightweight agents managed from the cloud, reducing on-premises footprint compared with a full Connect Sync deployment. AD FS handles federation, not provisioning.',
    references: [REF_CLOUDSYNC, REF_CONNECT]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A corporate-owned Windows 11 laptop is provisioned so it has an identity only in the cloud and is not joined to on-premises AD. Which join type is this?',
    options: opts4(
      'Microsoft Entra registered',
      'Microsoft Entra joined',
      'Microsoft Entra hybrid joined',
      'Workgroup only'
    ),
    correct: ['b'],
    explanation: 'Microsoft Entra joined describes organization-owned devices joined directly to Microsoft Entra ID (cloud only). Registered is for personal devices, and hybrid joined devices are joined to both on-premises AD and Microsoft Entra ID.',
    references: [REF_DEVICEJOIN, REF_DEVICES]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which role can manage all aspects of users and groups, including resetting passwords for limited admins, but is intended specifically for user lifecycle administration?',
    options: opts4(
      'User Administrator',
      'Global Administrator',
      'Reports Reader',
      'Conditional Access Administrator'
    ),
    correct: ['a'],
    explanation: 'User Administrator is purpose-built for managing users and groups and resetting passwords for non-admin and limited-admin users, providing least privilege compared with Global Administrator for routine user lifecycle tasks.',
    references: [REF_RBAC]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'An admin accidentally deleted a cloud user 10 days ago. What is the correct way to recover the account with its original object ID and group memberships?',
    options: opts4(
      'Recreate the user manually with the same UPN',
      'Restore the user from the Deleted users list within the 30-day window',
      'Run Connect Sync to bring it back',
      'It is permanently gone after deletion'
    ),
    correct: ['b'],
    explanation: 'Soft-deleted users can be restored from the Deleted users list for 30 days, preserving the object ID and associated properties. Recreating a user makes a new object with a new ID and no prior memberships.',
    references: [REF_USERS]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'To assign Microsoft 365 licenses to an entire department automatically and have it follow personnel changes, which approach scales best?',
    options: opts4(
      'Direct per-user license assignment',
      'Group-based licensing on a dynamic group keyed to department',
      'A spreadsheet tracked manually',
      'Per-user PowerShell run weekly'
    ),
    correct: ['b'],
    explanation: 'Applying group-based licensing to a dynamic group keyed on the department attribute automatically licenses members as they join and reclaims licenses as they leave, scaling without manual or scripted upkeep.',
    references: [REF_LICENSE, REF_DYNGROUP]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to limit guest users so they cannot enumerate other users and groups in your directory. Where is this primarily controlled?',
    options: opts4(
      'Conditional Access grant controls',
      'External collaboration settings (guest user access restrictions)',
      'PIM role settings',
      'Token lifetime policy'
    ),
    correct: ['b'],
    explanation: 'Guest user access restrictions in external collaboration settings control how much directory information guests can see (for example restricting them to their own object), reducing unnecessary exposure of users and groups.',
    references: [REF_GUEST, REF_GUESTINVITE]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Administrative units can contain users, groups, and devices, and let you delegate scoped administration over only those objects.',
    options: tf(),
    correct: ['a'],
    explanation: 'Administrative units restrict the scope of a delegated admin role to a subset of the directory (users, groups, and devices in the unit), supporting decentralized administration without granting tenant-wide privilege.',
    references: [REF_ADMINUNITS]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes Microsoft Entra Cloud Sync from Microsoft Entra Connect Sync?',
    options: opts4(
      'Cloud Sync requires a full Windows Server with SQL like Connect Sync',
      'Cloud Sync uses a lightweight cloud-managed agent and supports multiple disconnected forests',
      'Connect Sync cannot synchronize passwords',
      'Cloud Sync only works for guest users'
    ),
    correct: ['b'],
    explanation: 'Cloud Sync uses a lightweight provisioning agent with configuration managed in the cloud and supports multiple disconnected AD forests, whereas Connect Sync is a heavier server-based tool with broader feature coverage.',
    references: [REF_CLOUDSYNC, REF_CONNECT]
  },

  // ── Implement Authentication and Access Management (19) ──
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a Conditional Access policy, which element specifies the requirement that must be satisfied for access to be allowed, such as requiring MFA or a compliant device?',
    options: opts4(
      'Assignments',
      'Grant controls',
      'Named locations',
      'Risk detections'
    ),
    correct: ['b'],
    explanation: 'Grant controls define what a user must satisfy to gain access (require MFA, compliant device, hybrid joined device, approved app, authentication strength). Assignments define scope; named locations and risk detections are conditions/signals.',
    references: [REF_CAPOLICY, REF_CA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must ensure that only phishing-resistant methods can satisfy MFA for a highly privileged group, blocking SMS and voice. Which control gives this precise method requirement?',
    options: opts4(
      'Require MFA grant control',
      'Conditional Access authentication strength set to phishing-resistant MFA',
      'Sign-in frequency control',
      'Security defaults'
    ),
    correct: ['b'],
    explanation: 'Authentication strength lets you require a specific combination of methods; the phishing-resistant MFA strength excludes SMS/voice and permits only FIDO2, Windows Hello for Business, and certificate-based authentication. "Require MFA" still allows weaker methods.',
    references: [REF_AUTHSTRENGTH, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A startup without premium licenses wants Microsoft to enforce a security baseline including MFA registration for all users with minimal configuration. What should they turn on?',
    options: opts4(
      'Custom Conditional Access policies',
      'Security defaults',
      'A user risk policy',
      'Application proxy'
    ),
    correct: ['b'],
    explanation: 'Security defaults are a free baseline that requires all users to register and use MFA, protects privileged actions, and blocks legacy authentication, suitable for organizations not using Conditional Access.',
    references: [REF_SECDEFAULTS, REF_MFA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Helpdesk is overwhelmed with password reset tickets. You want users to securely reset forgotten passwords themselves after registering methods. Which feature do you deploy?',
    options: opts4(
      'Password protection',
      'Self-service password reset (SSPR)',
      'Continuous access evaluation',
      'Named locations'
    ),
    correct: ['b'],
    explanation: 'SSPR enables users to reset or unlock their accounts using registered authentication methods, dramatically reducing helpdesk tickets. Password protection blocks weak passwords but does not provide self-service reset.',
    references: [REF_SSPR]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A Conditional Access policy in report-only mode does not enforce grant or session controls but logs the would-be result for analysis.',
    options: tf(),
    correct: ['a'],
    explanation: 'Report-only mode evaluates the policy against sign-ins and logs what would have happened without enforcing controls, letting admins measure impact before enabling the policy.',
    references: [REF_CAPOLICY, REF_SIGNINLOG]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'Identity Protection detects that a user\'s credentials appeared in a leaked credentials feed, raising the user\'s risk to high. Which automated response forces remediation by the legitimate user?',
    options: opts4(
      'Sign-in risk policy that blocks the device',
      'User risk policy requiring secure password change for high user risk',
      'Named location policy',
      'Token lifetime reduction'
    ),
    correct: ['b'],
    explanation: 'A user risk-based Conditional Access policy can require a secure password change when user risk is high; after MFA and password change the user risk is remediated, restoring access while invalidating the leaked credential.',
    references: [REF_RISKPOLICY, REF_IPB]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is a passwordless sign-in option built into Windows that uses biometrics or a PIN bound to the device hardware?',
    options: opts4(
      'SMS code',
      'Windows Hello for Business',
      'Email OTP',
      'Security questions'
    ),
    correct: ['b'],
    explanation: 'Windows Hello for Business provides passwordless, phishing-resistant authentication using a PIN or biometric gesture that unlocks a hardware-protected key, replacing passwords for Windows sign-in and access.',
    references: [REF_PASSWORDLESS, REF_FIDO]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'You need access tokens to be re-evaluated quickly when critical events occur (user disabled, password change), instead of remaining valid until normal expiry. Which capability provides this?',
    options: opts4(
      'Continuous access evaluation',
      'Long sign-in frequency',
      'Persistent browser sessions',
      'Per-user MFA'
    ),
    correct: ['a'],
    explanation: 'Continuous access evaluation enables supported resource providers to react to critical security events in near real time by rejecting tokens, rather than waiting for the access token lifetime to elapse.',
    references: [REF_CAE]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to require MFA only when users connect from outside the corporate network. Which Conditional Access condition do you configure with your office IP ranges?',
    options: opts4(
      'Device platform',
      'Locations using named locations marked as trusted',
      'Client apps',
      'User risk'
    ),
    correct: ['b'],
    explanation: 'By defining the corporate IP ranges as a trusted named location and using the location condition, you can require MFA only when sign-ins originate outside those trusted locations.',
    references: [REF_NAMEDLOC, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A Conditional Access policy requires a compliant device. Devices are not being recognized as compliant even though they exist in the directory. What is the most likely missing prerequisite?',
    options: opts4(
      'Devices are not enrolled/managed by an MDM such as Intune reporting compliance',
      'Security defaults are enabled',
      'The tenant lacks named locations',
      'PIM is not configured'
    ),
    correct: ['a'],
    explanation: 'The compliant flag is set by an MDM (for example Intune) evaluating compliance policies; without enrollment and compliance evaluation, devices will not be marked compliant and the Conditional Access requirement fails.',
    references: [REF_CAPOLICY, REF_DEVICES]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Microsoft recommends excluding emergency access (break-glass) accounts from Conditional Access MFA policies so administrators can recover access during outages.',
    options: tf(),
    correct: ['a'],
    explanation: 'Maintaining excluded break-glass accounts ensures administrators can still sign in if Conditional Access misconfiguration or an MFA provider outage would otherwise lock everyone out; these accounts are tightly monitored.',
    references: [REF_CAPOLICY, REF_CA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to challenge sign-ins that Identity Protection rates as medium or high real-time risk with MFA, allowing self-remediation. Which policy do you configure?',
    options: opts4(
      'User risk policy requiring password change',
      'Sign-in risk-based Conditional Access policy requiring MFA at medium and high',
      'Named location block',
      'Terms of use'
    ),
    correct: ['b'],
    explanation: 'A sign-in risk policy evaluates the risk of the current sign-in; requiring MFA at medium/high lets the legitimate user prove identity and remediate the sign-in risk while suspicious sessions are challenged or blocked.',
    references: [REF_RISKPOLICY, REF_RISK]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the goal of blocking legacy authentication in Microsoft Entra ID?',
    options: opts4(
      'To improve email performance',
      'To prevent protocols that cannot enforce MFA, reducing password spray success',
      'To disable all third-party apps',
      'To force password expiration'
    ),
    correct: ['b'],
    explanation: 'Legacy authentication clients cannot perform MFA, so attackers exploit them in password spray campaigns. Blocking them with Conditional Access closes that bypass and substantially lowers account compromise.',
    references: [REF_CA, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'Your tenant must prevent users from choosing passwords containing the company name and product names. Which feature enforces a custom banned list at password set time?',
    options: opts4(
      'Microsoft Entra Password Protection custom banned password list',
      'Conditional Access sign-in frequency',
      'Security defaults',
      'Named locations'
    ),
    correct: ['a'],
    explanation: 'Password Protection lets administrators add organization-specific terms to a custom banned password list; combined with the global list, weak or brandable passwords are blocked during password creation and change.',
    references: [REF_BANNED]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature lets users register methods once for both MFA and self-service password reset in a unified portal?',
    options: opts4(
      'Combined security information registration',
      'Bulk operations',
      'Token lifetime policy',
      'Application proxy'
    ),
    correct: ['a'],
    explanation: 'Combined registration consolidates MFA and SSPR method registration into a single experience, simplifying onboarding and ensuring users have methods for both verification and password reset.',
    references: [REF_SSPR, REF_MFA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Conditional Access session control would you use to limit how long a user can stay signed in before being prompted to reauthenticate?',
    options: opts4(
      'Sign-in frequency',
      'Require compliant device',
      'Block legacy authentication',
      'Named location'
    ),
    correct: ['a'],
    explanation: 'The sign-in frequency session control defines the period after which a user must reauthenticate, useful for high-risk apps where you want shorter sessions than the default token lifetime allows.',
    references: [REF_CAPOLICY, REF_CAE]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which authentication method provides app-based approval prompts and time-based one-time passcodes, managed through the Authentication methods policy?',
    options: opts4(
      'Microsoft Authenticator',
      'Security questions',
      'Certificate revocation list',
      'Email OTP for members'
    ),
    correct: ['a'],
    explanation: 'Microsoft Authenticator supports push approvals and TOTP codes (and passwordless phone sign-in), and is enabled/scoped via the Authentication methods policy, the recommended modern method.',
    references: [REF_MFA, REF_PASSWORDLESS]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'After enabling a strict Conditional Access policy you got locked out. What design practice should have prevented being unable to fix the policy?',
    options: opts4(
      'Disabling MFA tenant-wide',
      'Excluding monitored emergency access accounts from the policy',
      'Applying the policy only in report-only mode forever',
      'Removing all admins from PIM'
    ),
    correct: ['b'],
    explanation: 'Excluding dedicated, closely monitored emergency access (break-glass) accounts from Conditional Access ensures an administrator can always sign in to correct a misconfigured policy.',
    references: [REF_CAPOLICY, REF_CA]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Identity Protection view lets an administrator confirm a sign-in as compromised or dismiss it as safe to tune detections?',
    options: opts4(
      'Risky sign-ins report',
      'Provisioning logs',
      'Licensing report',
      'Named locations list'
    ),
    correct: ['a'],
    explanation: 'The Risky sign-ins report shows sign-ins with detected risk and lets admins confirm compromise or dismiss the risk, feeding back into Identity Protection\'s risk evaluation and remediation workflows.',
    references: [REF_IPB, REF_RISK]
  },

  // ── Implement Access Management for Applications (10) ──
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A developer registered a multitenant app. In a customer tenant, which object represents the app so that tenant can assign users and apply policies?',
    options: opts4(
      'The application object in the home tenant',
      'A service principal created in the customer tenant',
      'An administrative unit',
      'A dynamic group'
    ),
    correct: ['b'],
    explanation: 'For a multitenant app, a service principal is provisioned in each consuming tenant; that service principal is what local admins assign users to and apply Conditional Access and consent policies against. The application object lives in the home tenant.',
    references: [REF_APPREG, REF_ENTAPP]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must stop users from granting consent to unverified apps requesting high-impact permissions while still letting them request access. Which configuration achieves this?',
    options: opts4(
      'Block all enterprise apps',
      'Restrict user consent and enable the admin consent workflow for requests',
      'Enable security defaults only',
      'Disable provisioning'
    ),
    correct: ['b'],
    explanation: 'Restricting user consent to low-risk/verified scenarios and enabling the admin consent workflow allows users to request access while administrators evaluate and approve higher-risk consent, mitigating illicit consent grant attacks.',
    references: [REF_CONSENT, REF_ADMINCONSENT]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An internal time-tracking web app runs on-premises and must be reachable by remote staff with Microsoft Entra pre-authentication, without a VPN. Which solution publishes it?',
    options: opts4(
      'Microsoft Entra application proxy',
      'Cloud Sync',
      'Named locations',
      'PIM'
    ),
    correct: ['a'],
    explanation: 'Application proxy securely publishes on-premises web apps for external access with Microsoft Entra pre-authentication and Conditional Access, removing the need for a VPN for those applications.',
    references: [REF_APPPROXY]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SaaS HR app should automatically receive new hires and have leavers deactivated based on Microsoft Entra assignments. Which enterprise application capability do you configure?',
    options: opts4(
      'SAML SSO only',
      'Automatic provisioning using SCIM',
      'A managed identity',
      'A terms of use'
    ),
    correct: ['b'],
    explanation: 'SCIM-based automatic provisioning lets Microsoft Entra ID create, update, and disable users in the SaaS app based on assignment and group membership, keeping the app account lifecycle synchronized with the directory.',
    references: [REF_PROVISION, REF_ENTAPP]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'An Azure Function must call Microsoft Graph without storing client secrets. What is the recommended identity for the function?',
    options: opts4(
      'A shared user account',
      'A system-assigned managed identity',
      'A B2B guest',
      'A named location'
    ),
    correct: ['b'],
    explanation: 'A system-assigned managed identity gives the Azure Function an automatically managed credential-free identity to obtain Microsoft Graph tokens; no secrets are stored and the identity is removed with the resource.',
    references: [REF_MANAGEDID]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An application needs to authorize callers as "Approver" or "Submitter" using a claim in the token. Which app registration feature defines these and surfaces them as a roles claim?',
    options: opts4(
      'App roles',
      'Named locations',
      'Dynamic group rules',
      'Terms of use'
    ),
    correct: ['a'],
    explanation: 'App roles declared in the app registration appear in the token\'s roles claim when principals are assigned, enabling the application to perform role-based authorization for capabilities such as Approver vs Submitter.',
    references: [REF_APPROLES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Setting "User assignment required" on an enterprise application limits sign-in to only explicitly assigned users and groups.',
    options: tf(),
    correct: ['a'],
    explanation: 'When user assignment is required, only principals assigned to the application can authenticate to it, a common control for restricting access to sensitive enterprise applications.',
    references: [REF_ENTAPP, REF_SSO]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want true single sign-on to a gallery app using federation so no app-specific password is stored anywhere. Which SSO mode should you choose?',
    options: opts4(
      'Password-based SSO',
      'SAML-based (or OIDC) federated SSO',
      'Linked SSO',
      'Header-based only with shared secret'
    ),
    correct: ['b'],
    explanation: 'Federated SSO (SAML or OpenID Connect) has Microsoft Entra ID issue trusted tokens, so users sign in once with their directory credentials and no per-app password is stored, unlike password-based SSO.',
    references: [REF_SSO]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'To find out which administrator approved an OAuth permission for a third-party application last month, which log should you query?',
    options: opts4(
      'Audit logs',
      'Sign-in logs',
      'Connect Health',
      'Licensing report'
    ),
    correct: ['a'],
    explanation: 'Audit logs record consent and permission grant events, including the actor and timestamp, so administrators can investigate when and by whom an app was granted access.',
    references: [REF_AUDITLOG, REF_CONSENT]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which combination best mitigates illicit consent grant attacks while keeping productivity for low-risk apps?',
    options: opts4(
      'Allow all user consent for any app',
      'Restrict user consent to verified publishers/low-impact permissions and use the admin consent workflow',
      'Disable single sign-on',
      'Remove all service principals'
    ),
    correct: ['b'],
    explanation: 'Limiting user consent to verified publishers and low-impact scopes blocks risky grants automatically, while the admin consent workflow channels higher-risk requests to administrators, balancing security and productivity.',
    references: [REF_CONSENT, REF_ADMINCONSENT]
  },

  // ── Plan and Implement Identity Governance (23) ──
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which feature lets employees request a bundle of resources (a group, an app, and a SharePoint site) through a portal with approval and time-limited access?',
    options: opts4(
      'Entitlement management access packages',
      'Conditional Access',
      'Password protection',
      'Named locations'
    ),
    correct: ['a'],
    explanation: 'Entitlement management access packages bundle resources and define request, approval, and lifecycle policies so users can self-request governed, time-limited access from the My Access portal.',
    references: [REF_ENTITLEMENT, REF_ACCESSPKG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must eliminate standing Global Administrator access; admins should activate the role only when needed, with justification and approval. Which capability provides this just-in-time model?',
    options: opts4(
      'Permanent active assignment',
      'Privileged Identity Management eligible assignment with activation requirements',
      'Group-based licensing',
      'Security defaults'
    ),
    correct: ['b'],
    explanation: 'PIM provides just-in-time privileged access: eligible assignments require activation with justification, MFA, and optional approval for a limited duration, removing always-on admin rights.',
    references: [REF_PIM, REF_PIMACTIVATE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Compliance requires that every six months someone confirms whether users still need membership in a sensitive group, with automatic cleanup. Which feature provides this?',
    options: opts4(
      'Recurring access reviews',
      'Named locations',
      'Application proxy',
      'Cloud Sync'
    ),
    correct: ['a'],
    explanation: 'Recurring access reviews schedule periodic attestation of group membership (or app/role assignments) and can auto-remove access for users denied or not reviewed, satisfying recurring compliance certification.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'HR wants accounts enabled and a welcome email sent automatically on each employee\'s start date, with offboarding tasks on the leave date. Which feature orchestrates these joiner/leaver actions?',
    options: opts4(
      'Lifecycle workflows',
      'Conditional Access',
      'Token lifetime policy',
      'Group-based licensing'
    ),
    correct: ['a'],
    explanation: 'Lifecycle workflows automate joiner, mover, and leaver tasks driven by attributes such as employeeHireDate and employeeLeaveDateTime, including enabling/disabling accounts, group changes, and notifications.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: PIM lets you require approval, MFA, and a justification before a user can activate an eligible privileged role.',
    options: tf(),
    correct: ['a'],
    explanation: 'PIM role activation settings can enforce MFA, justification, ticket number, and approval, plus a maximum duration, providing strong governance over when privileged roles become active.',
    references: [REF_PIM, REF_PIMACTIVATE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'A partner organization\'s users must self-request a collaboration access package, approved by an internal sponsor, with access auto-expiring in 60 days. Which entitlement management element enforces approval and expiry for these external users?',
    options: opts4(
      'A dynamic group',
      'An access package policy targeting external users',
      'A named location',
      'Security defaults'
    ),
    correct: ['b'],
    explanation: 'An access package can include a policy scoped to external/connected organizations specifying who may request, the approval workflow, and expiration, so guest access is granted, approved, and removed automatically.',
    references: [REF_ACCESSPKG, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which access review setting ensures users who are not reviewed by the end date automatically lose the access being reviewed?',
    options: opts4(
      'Recommendations only',
      'Auto-apply with remove access for not-reviewed users',
      'Disable auto-apply',
      'Convert group to Microsoft 365'
    ),
    correct: ['b'],
    explanation: 'Enabling auto-apply and configuring the action for users not reviewed to remove access enforces that unattested access is cleaned up at the review deadline, preventing lingering unjustified access.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Legal requires staff to accept an updated data-handling agreement before opening finance apps and to re-accept it every 12 months. Which feature, enforced via Conditional Access, meets this?',
    options: opts4(
      'Terms of use with periodic reacceptance',
      'Access packages',
      'PIM activation',
      'Named locations'
    ),
    correct: ['a'],
    explanation: 'Terms of use can be required through a Conditional Access grant control and configured to require reacceptance on a schedule (for example annually), with acceptance recorded for audit.',
    references: [REF_TOU, REF_CA]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'In PIM, a user has a role they can use only after activating it within the configured limits. What is this assignment type called?',
    options: opts4(
      'Active assignment',
      'Eligible assignment',
      'Permanent assignment',
      'Dynamic assignment'
    ),
    correct: ['b'],
    explanation: 'An eligible assignment means the user must activate the role before its permissions apply, in contrast to an active assignment that grants the role immediately for its assigned duration.',
    references: [REF_PIM, REF_PIMROLE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'A security review finds many permanent privileged role holders. What is the recommended remediation pattern using Microsoft Entra ID Governance?',
    options: opts4(
      'Leave them permanent but document it',
      'Onboard roles to PIM, convert to eligible just-in-time with MFA/approval, and run recurring access reviews of privileged roles',
      'Delete the privileged roles',
      'Apply security defaults only'
    ),
    correct: ['b'],
    explanation: 'Reducing standing privilege means moving roles into PIM as eligible just-in-time assignments with activation controls and validating necessity through recurring access reviews of privileged roles.',
    references: [REF_PIM, REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A single access package can serve internal employees and external partners using separate request policies tailored to each population.',
    options: tf(),
    correct: ['a'],
    explanation: 'Access packages support multiple policies, allowing different request, approval, and lifecycle rules for internal users versus external/connected organization users within the same package.',
    references: [REF_ENTITLEMENT, REF_ACCESSPKG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a department lead (not a Global Administrator) to manage that department\'s access packages and approve requests within a dedicated catalog. Which delegation should you apply?',
    options: opts4(
      'Grant Global Administrator',
      'Assign catalog owner / access package manager roles on the department catalog',
      'Add the lead to a dynamic group',
      'Create a Conditional Access exclusion'
    ),
    correct: ['b'],
    explanation: 'Entitlement management delegation uses catalog-scoped roles such as catalog owner and access package manager, letting a non-global admin govern only that catalog\'s packages, following least privilege.',
    references: [REF_DELEGATE, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'To troubleshoot why a specific user was blocked at sign-in by a Conditional Access policy, which log provides the applied policies and result?',
    options: opts4(
      'Sign-in logs',
      'Audit logs',
      'Provisioning logs',
      'Connect Health'
    ),
    correct: ['a'],
    explanation: 'Sign-in logs show each sign-in attempt with the Conditional Access policies evaluated, which applied, and the outcome (success, MFA required, blocked), making them the primary troubleshooting source.',
    references: [REF_SIGNINLOG, REF_AUDITLOG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'On termination day a worker\'s account must be disabled, group memberships removed, and tokens revoked automatically. Which feature schedules these tasks from the leave-date attribute?',
    options: opts4(
      'Lifecycle workflows leaver workflow',
      'Conditional Access',
      'Group-based licensing',
      'Password protection'
    ),
    correct: ['a'],
    explanation: 'A lifecycle workflows leaver workflow triggered on employeeLeaveDateTime can disable the account, remove memberships, and revoke sessions, automating consistent, timely offboarding.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which reviewer type in an access review delegates the attestation decision to each member\'s manager?',
    options: opts4(
      'Manager review',
      'Self-review',
      'Designated reviewer',
      'No reviewer (auto-approve)'
    ),
    correct: ['a'],
    explanation: 'Manager review assigns the attestation of each user\'s access to that user\'s manager, leveraging organizational hierarchy to validate continued business need.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'PIM activations for a critical role are delayed because the single approver is often unavailable. Which adjustment preserves governance while improving availability?',
    options: opts4(
      'Remove the approval requirement entirely',
      'Add multiple approvers so any one can approve the activation',
      'Make the role permanently active',
      'Disable PIM for the role'
    ),
    correct: ['b'],
    explanation: 'Configuring multiple approvers (any of whom can approve) avoids a single point of failure for activations while keeping the approval control and just-in-time model intact.',
    references: [REF_PIM, REF_PIMACTIVATE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'In entitlement management, what is the container that holds resources and access packages, used to delegate and scope administration?',
    options: opts4(
      'Catalog',
      'Named location',
      'Administrative unit',
      'Dynamic group'
    ),
    correct: ['a'],
    explanation: 'A catalog groups resources (groups, apps, sites) and access packages and is the unit of delegation, letting catalog owners manage scoped access without tenant-wide privilege.',
    references: [REF_ENTITLEMENT, REF_DELEGATE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership requires a quarterly review of all guests with access to a confidential SharePoint-backed group, with managers reviewing and unapproved guests automatically removed. Which setup satisfies this?',
    options: opts4(
      'One-time self-review with recommendations only',
      'Recurring access review scoped to guest members, manager as reviewer, auto-apply removing denied/unreviewed',
      'A Conditional Access block for all guests',
      'A dynamic group of guests'
    ),
    correct: ['b'],
    explanation: 'A recurring access review limited to guest members, with managers as reviewers and auto-apply set to remove denied or unreviewed guests, meets the periodic attestation plus enforced cleanup requirement.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Privileged Identity Management supports just-in-time activation for Microsoft Entra roles, Azure resource roles, and PIM for groups.',
    options: tf(),
    correct: ['a'],
    explanation: 'PIM governs eligible/just-in-time access across Microsoft Entra directory roles, Azure resource (RBAC) roles, and group memberships/ownership through PIM for groups, centralizing privileged access control.',
    references: [REF_PIM, REF_PIMROLE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Synchronization between on-premises AD and Microsoft Entra ID is intermittently failing. Which tool gives proactive health monitoring and alerts for the sync service and AD FS?',
    options: opts4(
      'Microsoft Entra Connect Health',
      'Identity Protection',
      'Terms of use',
      'Entitlement management'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra Connect Health monitors hybrid identity components (Connect Sync, AD FS) with alerts and usage insights, helping detect and resolve synchronization failures proactively.',
    references: [REF_CONNECTHEALTH, REF_CONNECT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which combination most effectively enforces least privilege for administrators continuously over time?',
    options: opts4(
      'Permanent admin roles plus annual documentation',
      'PIM just-in-time activation plus recurring access reviews of privileged roles',
      'Shared admin accounts with strong passwords',
      'Disabling MFA for admins to speed access'
    ),
    correct: ['b'],
    explanation: 'Removing standing privilege via PIM and continuously validating need with recurring privileged-role access reviews together enforce least privilege over time, unlike static permanent assignments.',
    references: [REF_PIM, REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'A contractor access package must be approved first by the requestor\'s manager and then by the resource owner before access is granted. Which access package capability supports this ordered approval?',
    options: opts4(
      'Auto-approval',
      'Multi-stage approval in the request policy',
      'Dynamic membership',
      'Security defaults'
    ),
    correct: ['b'],
    explanation: 'Access package request policies support multi-stage (sequential) approval, allowing a first-stage manager approval followed by a second-stage resource owner approval before the entitlement is granted.',
    references: [REF_ACCESSPKG, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which log should an auditor review to see who modified a Conditional Access policy and when?',
    options: opts4(
      'Audit logs',
      'Sign-in logs',
      'Licensing report',
      'Named locations'
    ),
    correct: ['a'],
    explanation: 'Audit logs capture configuration changes including Conditional Access policy creation and modification with actor and timestamp, supporting change tracking and compliance review.',
    references: [REF_AUDITLOG]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Implement Identities in Microsoft Entra (13) ──
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Onboarding 75 seasonal workers requires fast cloud account creation without writing code. Which Microsoft Entra admin center capability is the best fit?',
    options: opts4(
      'Create users one at a time in the portal',
      'CSV-based Bulk operations to create users',
      'Microsoft Entra Connect Sync from AD',
      'Send 75 individual B2B invitations'
    ),
    correct: ['b'],
    explanation: 'CSV-based bulk operations create many cloud member accounts at once with no scripting, ideal for seasonal onboarding. One-by-one creation does not scale, Connect Sync needs AD, and B2B creates guests rather than members.',
    references: [REF_BULK, REF_USERS]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A security group must always reflect every enabled member account with jobTitle "Nurse". Which configuration maintains this automatically?',
    options: opts4(
      'Assigned group updated by a weekly script',
      'Dynamic user group with rule (user.jobTitle -eq "Nurse") and (user.accountEnabled -eq true)',
      'A Microsoft 365 group with manual owners',
      'An administrative unit named Nurses'
    ),
    correct: ['b'],
    explanation: 'A dynamic user group with a rule on jobTitle and accountEnabled recalculates membership automatically as attributes change, eliminating scripts. Administrative units delegate admin scope; they do not compute membership.',
    references: [REF_DYNGROUP, REF_GROUPS]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want regional admins to manage password resets only for users in their own country, reusing one built-in role. Which feature scopes the role to those users?',
    options: opts4(
      'Conditional Access',
      'Administrative units with scoped role assignment',
      'Dynamic groups',
      'Group-based licensing'
    ),
    correct: ['b'],
    explanation: 'Administrative units let you assign a role such as Helpdesk Administrator scoped only to the users in that unit, confining each regional admin to their country\'s users without tenant-wide rights.',
    references: [REF_ADMINUNITS, REF_RBAC]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Group-based licensing can target a dynamic group so license assignment follows attribute-driven membership changes automatically.',
    options: tf(),
    correct: ['a'],
    explanation: 'You can apply group-based licensing to a dynamic group; as users enter or leave based on the membership rule, the licenses are assigned or reclaimed automatically, scaling licensing with HR-driven attribute changes.',
    references: [REF_LICENSE, REF_DYNGROUP]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A consultancy needs short-term access to your Teams and SharePoint while signing in with their own organizational identities. Which approach represents them appropriately in your tenant?',
    options: opts4(
      'Create local member accounts and share passwords',
      'Invite them as B2B collaboration guests',
      'Assign them a managed identity',
      'Register their laptops as devices'
    ),
    correct: ['b'],
    explanation: 'B2B collaboration guests authenticate with their home identities while being represented as external users in your tenant for resource sharing, which is the correct, governable model for short-term partner access.',
    references: [REF_GUEST, REF_GUESTINVITE]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'You have two unmerged AD forests and want a low-footprint, cloud-managed provisioning option rather than a full synchronization server. Which should you choose?',
    options: opts4(
      'Microsoft Entra Connect Sync only',
      'Microsoft Entra Cloud Sync',
      'Nightly manual CSV import',
      'AD FS only'
    ),
    correct: ['b'],
    explanation: 'Microsoft Entra Cloud Sync provisions from multiple disconnected forests using lightweight, cloud-configured agents, reducing infrastructure compared with Connect Sync. AD FS only handles federation, not provisioning.',
    references: [REF_CLOUDSYNC, REF_CONNECT]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A user enrolls a personal phone to access Microsoft 365 with Conditional Access but the phone is not organization owned. Which device identity state results?',
    options: opts4(
      'Microsoft Entra joined',
      'Microsoft Entra registered',
      'Microsoft Entra hybrid joined',
      'On-premises domain joined'
    ),
    correct: ['b'],
    explanation: 'Personal (BYOD) devices that gain a directory identity for SSO and Conditional Access without being organization owned are Microsoft Entra registered. Joined and hybrid joined apply to organization-owned devices.',
    references: [REF_DEVICEJOIN, REF_DEVICES]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which role should you grant a helpdesk lead who must create and manage users and groups and reset most user passwords, while following least privilege?',
    options: opts4(
      'Global Administrator',
      'User Administrator',
      'Billing Administrator',
      'Global Reader'
    ),
    correct: ['b'],
    explanation: 'User Administrator provides user and group lifecycle management and password resets for non-admin/limited-admin users without the broad control of Global Administrator, aligning with least privilege.',
    references: [REF_RBAC]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A user was deleted 5 days ago and must be restored with the same object ID so existing access continues to resolve. What should you do?',
    options: opts4(
      'Create a new user with the same name',
      'Restore the user from Deleted users (available for 30 days)',
      'Re-run Connect Sync',
      'Nothing can be done'
    ),
    correct: ['b'],
    explanation: 'Restoring from the Deleted users list within 30 days returns the same object with its original ID and properties, so existing references and memberships remain valid; recreating yields a different object.',
    references: [REF_USERS]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'To assign licenses to all members of a project automatically and have the assignment follow membership, what should you configure?',
    options: opts4(
      'Direct per-user assignment',
      'Group-based licensing on the project group',
      'A named location',
      'A Conditional Access policy'
    ),
    correct: ['b'],
    explanation: 'Group-based licensing assigns the configured products to all current and future members of the group and reclaims them when users leave, automating licensing at scale based on membership.',
    references: [REF_LICENSE]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'You must restrict which users can send B2B guest invitations and brand the invitation experience. Where is this configured?',
    options: opts4(
      'PIM role settings',
      'External collaboration / cross-tenant access settings',
      'Token lifetime policy',
      'Named locations'
    ),
    correct: ['b'],
    explanation: 'External collaboration settings (with cross-tenant access settings) control who may invite guests and related restrictions; these are the correct place to limit and govern B2B invitations.',
    references: [REF_GUEST, REF_GUESTINVITE]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Microsoft Entra registered, Microsoft Entra joined, and Microsoft Entra hybrid joined are distinct device identity states with different ownership and join models.',
    options: tf(),
    correct: ['a'],
    explanation: 'Registered (personal/BYOD), joined (organization-owned, cloud), and hybrid joined (joined to both on-premises AD and Microsoft Entra ID) are separate states used to apply device-based access controls appropriately.',
    references: [REF_DEVICEJOIN, REF_DEVICES]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about Microsoft Entra Connect Sync is accurate for a hybrid identity deployment?',
    options: opts4(
      'It makes Microsoft Entra ID authoritative for all synced attributes',
      'It synchronizes from on-premises AD to Microsoft Entra ID with AD authoritative for synced objects, and offers optional limited writeback',
      'It eliminates the need for any on-premises AD',
      'It cannot synchronize password hashes'
    ),
    correct: ['b'],
    explanation: 'Connect Sync provisions and updates objects from on-premises AD to Microsoft Entra ID with AD as the source of authority for synced attributes; writeback is optional and limited to specific features, and password hash sync is supported.',
    references: [REF_CONNECT]
  },

  // ── Implement Authentication and Access Management (19) ──
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which part of a Conditional Access policy contains conditions such as sign-in risk, device platform, and locations?',
    options: opts4(
      'Grant controls',
      'Assignments (conditions)',
      'Session controls',
      'Authentication methods policy'
    ),
    correct: ['b'],
    explanation: 'Conditions live under Assignments in a Conditional Access policy and include signals like user/sign-in risk, device platform, locations, and client apps that scope when the policy applies.',
    references: [REF_CAPOLICY, REF_CA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'For domain administrators you must mandate FIDO2 or Windows Hello for Business and explicitly disallow SMS as an MFA method. Which Conditional Access control enforces the exact method set?',
    options: opts4(
      'Require MFA',
      'Authentication strength (phishing-resistant MFA)',
      'Sign-in frequency',
      'Persistent browser session'
    ),
    correct: ['b'],
    explanation: 'Authentication strength enforces a specific set of allowed methods; the phishing-resistant strength permits only FIDO2, Windows Hello for Business, and certificate-based authentication, excluding SMS, unlike a generic require-MFA control.',
    references: [REF_AUTHSTRENGTH, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Without Conditional Access licensing, which free option enforces MFA registration and blocks legacy authentication with minimal setup?',
    options: opts4(
      'Security defaults',
      'A custom Conditional Access policy',
      'Identity Protection risk policy',
      'PIM'
    ),
    correct: ['a'],
    explanation: 'Security defaults provide a free baseline that requires MFA registration, requires MFA for privileged actions, and blocks legacy authentication, designed for tenants not using Conditional Access.',
    references: [REF_SECDEFAULTS, REF_MFA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to cut password-reset helpdesk volume by letting users reset forgotten passwords themselves after registering verification methods. Which feature do you enable?',
    options: opts4(
      'Self-service password reset',
      'Password protection',
      'Named locations',
      'Continuous access evaluation'
    ),
    correct: ['a'],
    explanation: 'SSPR allows users to securely reset or unlock accounts using registered methods, reducing helpdesk tickets. Password protection only blocks weak passwords and does not provide self-service reset.',
    references: [REF_SSPR]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Continuous access evaluation can revoke access in near real time when a critical event such as account disablement occurs, instead of waiting for token expiry.',
    options: tf(),
    correct: ['a'],
    explanation: 'Continuous access evaluation lets supported resources reject tokens promptly after critical events (account disabled, password change, high risk), shortening the window an old token remains usable.',
    references: [REF_CAE]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'Identity Protection raises a user to high risk due to leaked credentials. Which policy automatically forces the legitimate user to set a new secure password to clear the risk?',
    options: opts4(
      'Sign-in risk policy blocking access',
      'User risk policy requiring secure password change at high user risk',
      'Named location policy',
      'Sign-in frequency policy'
    ),
    correct: ['b'],
    explanation: 'A user risk-based Conditional Access policy requiring a secure password change at high user risk remediates the risky user: after MFA and password change the leaked credential is invalidated and risk cleared.',
    references: [REF_RISKPOLICY, REF_IPB]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which method is BOTH passwordless and phishing-resistant, using cryptographic keys stored on a hardware authenticator?',
    options: opts4(
      'Voice call verification',
      'FIDO2 security key',
      'Security questions',
      'SMS one-time code'
    ),
    correct: ['b'],
    explanation: 'FIDO2 security keys authenticate with origin-bound public-key cryptography, making them passwordless and resistant to phishing/replay, unlike voice, SMS, or security questions.',
    references: [REF_FIDO, REF_PASSWORDLESS]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A security incident requires that disabling a user account stops their existing sessions almost immediately on supporting services. Beyond disabling the account, which capability shortens continued access?',
    options: opts4(
      'Continuous access evaluation',
      'Increasing token lifetime',
      'Persistent browser sessions',
      'Disabling MFA'
    ),
    correct: ['a'],
    explanation: 'Continuous access evaluation lets supporting resource providers honor critical events such as account disablement quickly, revoking access without waiting for normal token expiration.',
    references: [REF_CAE]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'To require MFA only for sign-ins originating outside trusted office IP ranges, which condition do you configure with those IPs?',
    options: opts4(
      'Client apps',
      'Locations using a trusted named location',
      'Device platform',
      'Sign-in risk'
    ),
    correct: ['b'],
    explanation: 'Defining office IPs as a trusted named location and using the location condition lets the policy require MFA only when the sign-in is outside those trusted ranges.',
    references: [REF_NAMEDLOC, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A "require compliant device" Conditional Access policy is failing for all users though devices appear in the directory. What is the most likely root cause?',
    options: opts4(
      'No MDM (e.g., Intune) is enrolling devices and reporting compliance state',
      'Named locations are missing',
      'Security defaults are disabled',
      'PIM is not enabled'
    ),
    correct: ['a'],
    explanation: 'The compliant device flag is produced by an MDM such as Intune evaluating compliance policies; without enrollment and compliance evaluation, no device is marked compliant and the policy denies access.',
    references: [REF_CAPOLICY, REF_DEVICES]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: It is a best practice to keep at least one emergency access account excluded from Conditional Access so admins can recover from a misconfigured policy.',
    options: tf(),
    correct: ['a'],
    explanation: 'Excluded, closely monitored break-glass accounts ensure recoverability if a Conditional Access policy or MFA provider failure would otherwise lock out all administrators.',
    references: [REF_CAPOLICY, REF_CA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'You want suspicious real-time sign-ins (medium/high sign-in risk) challenged with MFA so legitimate users can self-remediate. Which policy do you use?',
    options: opts4(
      'User risk policy requiring password change',
      'Sign-in risk-based Conditional Access requiring MFA at medium/high',
      'Named location block policy',
      'Terms of use policy'
    ),
    correct: ['b'],
    explanation: 'A sign-in risk policy challenges risky sign-ins with MFA; passing MFA remediates the sign-in risk, balancing security with usability for legitimate users.',
    references: [REF_RISKPOLICY, REF_RISK]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Why does Microsoft recommend blocking legacy authentication?',
    options: opts4(
      'It speeds up sign-in',
      'Legacy protocols cannot enforce MFA and are heavily abused in password spray attacks',
      'It reduces licensing cost',
      'It forces password expiration'
    ),
    correct: ['b'],
    explanation: 'Legacy authentication bypasses modern controls including MFA, so it is a frequent target for password spray; blocking it via Conditional Access materially reduces account compromise risk.',
    references: [REF_CA, REF_CAPOLICY]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'You must prevent users from setting passwords that include the organization\'s brand and common product names, on both cloud and on-premises. Which feature provides this?',
    options: opts4(
      'Microsoft Entra Password Protection with a custom banned list (and on-prem agent)',
      'Conditional Access sign-in frequency',
      'Security defaults',
      'Continuous access evaluation'
    ),
    correct: ['a'],
    explanation: 'Password Protection enforces the global banned list plus a tenant custom banned list, and with the on-premises agent it also blocks weak/branded passwords in Active Directory.',
    references: [REF_BANNED]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which capability lets users register authentication methods once for use by both MFA and SSPR?',
    options: opts4(
      'Combined security information registration',
      'Bulk operations',
      'Named locations',
      'Token lifetime policy'
    ),
    correct: ['a'],
    explanation: 'Combined registration unifies MFA and SSPR method registration in one flow so users set up methods a single time for both verification and password reset.',
    references: [REF_SSPR, REF_MFA]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'For a sensitive finance app you want users re-prompted to authenticate after 4 hours regardless of token lifetime. Which Conditional Access session control achieves this?',
    options: opts4(
      'Sign-in frequency set to 4 hours',
      'Require compliant device',
      'Block legacy authentication',
      'Persistent browser session enabled'
    ),
    correct: ['a'],
    explanation: 'The sign-in frequency session control forces reauthentication after the configured interval (for example 4 hours), tightening session length for sensitive applications beyond default token behavior.',
    references: [REF_CAPOLICY, REF_CAE]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which authentication method, configured via the Authentication methods policy, supports push approvals and passwordless phone sign-in?',
    options: opts4(
      'Microsoft Authenticator',
      'Security questions',
      'Email OTP for members',
      'Certificate revocation list'
    ),
    correct: ['a'],
    explanation: 'Microsoft Authenticator provides push approvals, TOTP codes, and passwordless phone sign-in, all enabled and scoped through the Authentication methods policy.',
    references: [REF_MFA, REF_PASSWORDLESS]
  },
  {
    domain: AUTH, difficulty: 3, type: QType.SINGLE,
    stem: 'A new tenant-wide MFA Conditional Access policy must protect all users but never lock out recovery. What is the correct safeguard?',
    options: opts4(
      'Apply the policy to guests only',
      'Exclude dedicated, monitored emergency access accounts from the policy',
      'Disable MFA tenant-wide',
      'Never enable the policy'
    ),
    correct: ['b'],
    explanation: 'Excluding a small number of monitored break-glass accounts from the policy guarantees administrative recovery if the policy or MFA infrastructure fails, while all normal users remain protected.',
    references: [REF_CAPOLICY, REF_CA]
  },
  {
    domain: AUTH, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Identity Protection report focuses specifically on individual sign-in attempts that were detected as risky?',
    options: opts4(
      'Risky sign-ins',
      'Audit logs',
      'Provisioning logs',
      'Licensing report'
    ),
    correct: ['a'],
    explanation: 'The Risky sign-ins report lists sign-in events with detected risk, their level, and detection types, and lets admins confirm or dismiss the sign-in risk to tune detections.',
    references: [REF_IPB, REF_RISK]
  },

  // ── Implement Access Management for Applications (10) ──
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which object is the local representation of an application in a tenant, used to assign users, apply Conditional Access, and grant permissions?',
    options: opts4(
      'Application (registration) object',
      'Service principal',
      'Administrative unit',
      'Managed group'
    ),
    correct: ['b'],
    explanation: 'The service principal is the per-tenant representation of an application used for sign-in, user/role assignment, Conditional Access targeting, and permission grants. The application object is the global definition.',
    references: [REF_APPREG, REF_ENTAPP]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'To curb risky OAuth consent while keeping productivity, you want users to request access to high-permission apps and admins to approve. Which two controls combine for this?',
    options: opts4(
      'Disable SSO and provisioning',
      'Restricted user consent settings plus the admin consent workflow',
      'Security defaults plus per-user MFA',
      'Named locations plus PIM'
    ),
    correct: ['b'],
    explanation: 'Restricting user consent (to verified publishers/low-impact scopes) automatically blocks risky grants, while the admin consent workflow lets users request and admins approve higher-risk app access.',
    references: [REF_CONSENT, REF_ADMINCONSENT]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An on-premises intranet portal must be securely accessible to remote employees with Microsoft Entra pre-authentication and no VPN. Which feature do you deploy?',
    options: opts4(
      'Microsoft Entra application proxy',
      'Cloud Sync',
      'Named locations',
      'Entitlement management'
    ),
    correct: ['a'],
    explanation: 'Application proxy publishes on-premises web apps for secure remote access with Microsoft Entra pre-authentication and Conditional Access, eliminating the need for a VPN for those apps.',
    references: [REF_APPPROXY]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A SaaS application should automatically deprovision accounts when users lose group-based assignment in Microsoft Entra ID. Which capability provides this?',
    options: opts4(
      'SAML SSO',
      'SCIM-based automatic user provisioning',
      'A managed identity',
      'A named location'
    ),
    correct: ['b'],
    explanation: 'SCIM-based automatic provisioning synchronizes the user lifecycle to the SaaS app: assignment grants accounts and removal triggers deprovisioning, keeping app access aligned with directory assignment.',
    references: [REF_PROVISION, REF_ENTAPP]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A containerized app on Azure must read secrets from Key Vault with no credentials in code or config. What identity should it use?',
    options: opts4(
      'A shared service account password',
      'A managed identity',
      'A guest invitation',
      'A named location'
    ),
    correct: ['b'],
    explanation: 'A managed identity provides the Azure-hosted app a credential-free Microsoft Entra identity to obtain Key Vault tokens; there are no secrets to store and the identity\'s lifecycle follows the resource.',
    references: [REF_MANAGEDID]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A line-of-business app needs to authorize users as "Editor" or "Viewer" using a token claim. Which app registration feature provides these as a roles claim?',
    options: opts4(
      'App roles',
      'Dynamic groups',
      'Named locations',
      'Terms of use'
    ),
    correct: ['a'],
    explanation: 'App roles defined on the app registration are emitted in the roles claim when users or groups are assigned, enabling the app to enforce role-based authorization such as Editor versus Viewer.',
    references: [REF_APPROLES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Enabling "User assignment required" on an enterprise app restricts sign-in to only assigned users and groups.',
    options: tf(),
    correct: ['a'],
    explanation: 'With user assignment required, only explicitly assigned principals can authenticate to the application, commonly used to limit access to sensitive enterprise apps.',
    references: [REF_ENTAPP, REF_SSO]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want federated single sign-on to a gallery SaaS app so no per-app password is stored. Which SSO method should you configure?',
    options: opts4(
      'Password-based SSO with stored credentials',
      'SAML/OIDC federated SSO',
      'Linked SSO (tile only)',
      'Local app authentication only'
    ),
    correct: ['b'],
    explanation: 'Federated SSO via SAML or OpenID Connect uses Microsoft Entra-issued trusted tokens so users sign in once with directory credentials and no per-app password is stored, unlike password-based or linked SSO.',
    references: [REF_SSO]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which log shows the event and actor when an administrator granted tenant-wide consent to an application?',
    options: opts4(
      'Audit logs',
      'Sign-in logs',
      'Connect Health',
      'Licensing report'
    ),
    correct: ['a'],
    explanation: 'Audit logs record consent and permission grant events including who performed the grant and when, which is the source for investigating application consent activity.',
    references: [REF_AUDITLOG, REF_CONSENT]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design best limits illicit consent grant attacks without blocking all third-party app productivity?',
    options: opts4(
      'Allow unrestricted user consent',
      'Restrict user consent to verified publishers/low-impact permissions and enable the admin consent workflow',
      'Remove all enterprise applications',
      'Turn off audit logging'
    ),
    correct: ['b'],
    explanation: 'Restricting user consent to verified, low-impact scenarios stops risky grants automatically, while the admin consent workflow lets users request and admins evaluate higher-risk app access, balancing security and productivity.',
    references: [REF_CONSENT, REF_ADMINCONSENT]
  },

  // ── Plan and Implement Identity Governance (23) ──
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which feature provides a self-service portal where users request a predefined bundle of access with approval and automatic expiration?',
    options: opts4(
      'Entitlement management access packages',
      'Conditional Access',
      'Named locations',
      'Password protection'
    ),
    correct: ['a'],
    explanation: 'Entitlement management access packages bundle resources with request, approval, and lifecycle policies, enabling governed self-service access requests with time limits via the My Access portal.',
    references: [REF_ENTITLEMENT, REF_ACCESSPKG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'To remove always-on privileged access, admins should hold roles they must activate just-in-time with justification, MFA, and approval. Which feature delivers this?',
    options: opts4(
      'Permanent active role assignment',
      'Privileged Identity Management with eligible assignments',
      'Group-based licensing',
      'Named locations'
    ),
    correct: ['b'],
    explanation: 'PIM eligible assignments require just-in-time activation with justification, MFA, and optional approval for a limited time, eliminating standing privileged access.',
    references: [REF_PIM, REF_PIMACTIVATE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Auditors require periodic confirmation that app role assignments are still needed, with automatic removal of those denied. Which feature provides this?',
    options: opts4(
      'Access reviews',
      'Conditional Access',
      'Cloud Sync',
      'Application proxy'
    ),
    correct: ['a'],
    explanation: 'Access reviews can periodically attest application or role assignments and auto-remove denied (or unreviewed) access, satisfying recurring audit certification requirements.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need accounts enabled and onboarding tasks executed on each hire date and offboarding tasks on the leave date, automatically. Which feature orchestrates this?',
    options: opts4(
      'Lifecycle workflows',
      'Conditional Access',
      'Group-based licensing',
      'Token lifetime policy'
    ),
    correct: ['a'],
    explanation: 'Lifecycle workflows automate joiner/mover/leaver tasks based on attributes like employeeHireDate and employeeLeaveDateTime, ensuring consistent onboarding and offboarding.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Entitlement management access packages can include external users and require approval before access is granted.',
    options: tf(),
    correct: ['a'],
    explanation: 'Access packages support policies for external/connected organization users with approval workflows and expiration, governing guest access end to end alongside internal users.',
    references: [REF_ENTITLEMENT, REF_ACCESSPKG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'External partners must request a collaboration package, get sponsor approval, and have access auto-removed after 45 days. Which element enforces approval and expiry for these external requests?',
    options: opts4(
      'A dynamic group',
      'An access package policy scoped to external users',
      'A named location',
      'Security defaults'
    ),
    correct: ['b'],
    explanation: 'An access package policy targeting external/connected organizations defines who can request, the approval workflow (including sponsor approval), and lifecycle settings such as expiration after a set number of days.',
    references: [REF_ACCESSPKG, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which access review configuration removes access for users who are denied or not reviewed by the deadline?',
    options: opts4(
      'Recommendations only, no action',
      'Auto-apply results with remove access for denied/not-reviewed',
      'Disable the review on completion',
      'Switch the group to dynamic'
    ),
    correct: ['b'],
    explanation: 'Configuring auto-apply with the action to remove access for denied and not-reviewed users enforces cleanup at the review deadline so attestation translates into least privilege.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Compliance mandates acceptance of a usage policy before accessing HR apps, with annual reacceptance. Which feature, enforced through Conditional Access, satisfies this?',
    options: opts4(
      'Terms of use with scheduled reacceptance',
      'Access packages',
      'PIM eligibility',
      'Named locations'
    ),
    correct: ['a'],
    explanation: 'Terms of use can be required by a Conditional Access grant control and set to require reacceptance on a schedule (for example yearly), with acceptance tracked for audit evidence.',
    references: [REF_TOU, REF_CA]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'In PIM, an assignment the user can use immediately for its assigned duration without activation is called what?',
    options: opts4(
      'Eligible assignment',
      'Active assignment',
      'Pending assignment',
      'Dynamic assignment'
    ),
    correct: ['b'],
    explanation: 'An active assignment grants the role immediately for its duration with no activation step, in contrast to an eligible assignment which requires just-in-time activation before use.',
    references: [REF_PIM, REF_PIMROLE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'An audit reveals excessive permanent privileged assignments. Which Microsoft Entra ID Governance approach best reduces standing privilege over time?',
    options: opts4(
      'Document and keep them permanent',
      'Onboard roles into PIM as eligible just-in-time with activation controls and run recurring privileged-role access reviews',
      'Delete all privileged roles',
      'Enable security defaults only'
    ),
    correct: ['b'],
    explanation: 'Converting permanent assignments to PIM eligible just-in-time with activation requirements, then validating necessity through recurring access reviews of privileged roles, systematically reduces standing privilege.',
    references: [REF_PIM, REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Access reviews can target group memberships, application assignments, and privileged role assignments.',
    options: tf(),
    correct: ['a'],
    explanation: 'Access reviews can be created for group memberships, access package assignments, application access, and Microsoft Entra/Azure privileged role assignments, providing broad attestation coverage.',
    references: [REF_ACCESSREVIEW, REF_PIM]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'You must let a project lead manage only their team\'s access packages and approvals within a scoped catalog, without Global Administrator. Which delegation is correct?',
    options: opts4(
      'Assign Global Administrator',
      'Grant catalog owner / access package manager on the project catalog',
      'Add the lead to a dynamic group',
      'Create a named location'
    ),
    correct: ['b'],
    explanation: 'Entitlement management catalog-scoped roles (catalog owner, access package manager) delegate management of only that catalog\'s packages, satisfying least privilege without tenant-wide admin rights.',
    references: [REF_DELEGATE, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which log do you review to see which Conditional Access policies were applied to a user\'s sign-in and the result?',
    options: opts4(
      'Sign-in logs',
      'Audit logs',
      'Provisioning logs',
      'Connect Health'
    ),
    correct: ['a'],
    explanation: 'Sign-in logs include the Conditional Access policies evaluated for each sign-in, which applied, and the outcome, making them the primary tool for diagnosing access decisions.',
    references: [REF_SIGNINLOG, REF_AUDITLOG]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'On an employee\'s last day, the account must be disabled, memberships removed, and sessions revoked automatically. Which feature schedules these from the leave-date attribute?',
    options: opts4(
      'Lifecycle workflows leaver workflow',
      'Conditional Access session control',
      'Group-based licensing',
      'Password protection'
    ),
    correct: ['a'],
    explanation: 'A lifecycle workflows leaver workflow triggered by employeeLeaveDateTime can disable the account, remove memberships, and revoke sessions, ensuring timely, consistent offboarding.',
    references: [REF_LIFECYCLE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which access review reviewer setting asks each user\'s manager to attest to that user\'s continued need for access?',
    options: opts4(
      'Manager review',
      'Self-review',
      'Designated reviewers',
      'Auto-approve'
    ),
    correct: ['a'],
    explanation: 'Manager review routes each user\'s attestation to their manager, using the org hierarchy to validate ongoing business need for the reviewed access.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Critical-role PIM activations are blocked because the only approver is frequently unavailable. Which change keeps the approval control but improves availability?',
    options: opts4(
      'Remove approval for the role',
      'Configure multiple approvers so any one can approve',
      'Make the role permanently active',
      'Disable PIM entirely'
    ),
    correct: ['b'],
    explanation: 'Adding multiple approvers eliminates the single-approver bottleneck while retaining the approval requirement and just-in-time model for the critical role.',
    references: [REF_PIM, REF_PIMACTIVATE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the entitlement management container that groups resources and access packages for scoped delegation?',
    options: opts4(
      'A catalog',
      'A named location',
      'An administrative unit',
      'A dynamic group'
    ),
    correct: ['a'],
    explanation: 'A catalog in entitlement management groups resources and access packages and is the delegation boundary, so catalog owners manage only that catalog\'s scope.',
    references: [REF_ENTITLEMENT, REF_DELEGATE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership wants a recurring review of all external guests in a sensitive group, reviewed by managers, with unapproved guests automatically removed. Which configuration meets all of this?',
    options: opts4(
      'A one-time self-review with recommendations only',
      'A recurring access review scoped to guests with manager reviewers and auto-apply removing denied/unreviewed',
      'A Conditional Access policy blocking all guests',
      'A dynamic group containing all guests'
    ),
    correct: ['b'],
    explanation: 'A recurring access review scoped to guest members, with managers reviewing and auto-apply removing denied or unreviewed guests, satisfies recurring attestation plus enforced cleanup of stale guest access.',
    references: [REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: PIM can govern just-in-time membership and ownership of groups, in addition to Microsoft Entra and Azure resource roles.',
    options: tf(),
    correct: ['a'],
    explanation: 'PIM for groups extends just-in-time eligibility and activation to group membership and ownership, complementing PIM for Microsoft Entra directory roles and Azure resource roles.',
    references: [REF_PIM, REF_PIMROLE]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'Hybrid identity synchronization is failing intermittently and you need proactive alerting on Connect Sync and AD FS health. Which tool should you use?',
    options: opts4(
      'Microsoft Entra Connect Health',
      'Identity Protection',
      'Terms of use',
      'Entitlement management'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra Connect Health monitors and alerts on the health and performance of hybrid identity infrastructure including Connect Sync and AD FS, enabling proactive remediation of sync issues.',
    references: [REF_CONNECTHEALTH, REF_CONNECT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach enforces least privilege for administrators on an ongoing basis rather than as a one-time cleanup?',
    options: opts4(
      'Permanent roles reviewed once at deployment',
      'PIM just-in-time activation combined with recurring access reviews of privileged roles',
      'A single shared admin credential',
      'Disabling MFA to speed admin access'
    ),
    correct: ['b'],
    explanation: 'Eliminating standing privilege with PIM and continuously re-validating need through recurring privileged-role access reviews enforces least privilege over time, unlike a one-time cleanup.',
    references: [REF_PIM, REF_ACCESSREVIEW]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'A contractor access package requires sequential approval: first the requestor\'s manager, then the resource owner. Which access package feature supports this?',
    options: opts4(
      'Single-stage auto-approval',
      'Multi-stage approval in the request policy',
      'Dynamic membership rule',
      'Security defaults'
    ),
    correct: ['b'],
    explanation: 'Multi-stage approval in an access package request policy lets you require sequential approvals (manager first, then resource owner) before the entitlement is granted, enforcing layered authorization.',
    references: [REF_ACCESSPKG, REF_ENTITLEMENT]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'To determine who deleted a group and when, for a compliance investigation, which log should be reviewed?',
    options: opts4(
      'Audit logs',
      'Sign-in logs',
      'Provisioning logs',
      'Named locations'
    ),
    correct: ['a'],
    explanation: 'Audit logs record directory change events such as group deletion with the actor and timestamp, providing the evidence trail needed for compliance investigations.',
    references: [REF_AUDITLOG]
  }
];

const SC300_DOMAINS = [
  { name: IDENT, weight: 20 },
  { name: AUTH, weight: 30 },
  { name: APPS, weight: 15 },
  { name: GOV, weight: 35 }
];

const SC300_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-sc-300-p1',
    code: 'SC-300-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering identities in Microsoft Entra, authentication and access management, access management for applications, and identity governance.',
    questions: P1
  },
  {
    slug: 'microsoft-sc-300-p2',
    code: 'SC-300-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-sc-300-p3',
    code: 'SC-300-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const SC300_BUNDLE = {
  slug: 'microsoft-sc-300',
  title: 'Microsoft Identity and Access Administrator (SC-300)',
  description: 'All 3 SC-300 practice exams in one bundle — covering implementing identities in Microsoft Entra, authentication and access management, access management for applications, and planning and implementing identity governance, aligned to the Microsoft Identity and Access Administrator exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the SC-300 bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:sc300-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedSc300(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security, and the Microsoft Identity and Access Administrator credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security, and the Microsoft Identity and Access Administrator credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SC300_EXAMS) {
    const title = `Microsoft Identity and Access Administrator (SC-300) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Microsoft Identity and Access Administrator exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: SC300_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:sc300-seed' } });
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
          generatedBy: 'manual:sc300-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SC300_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SC300_BUNDLE.slug },
    update: {
      title: SC300_BUNDLE.title,
      description: SC300_BUNDLE.description,
      price: SC300_BUNDLE.price,
      priceVoucher: SC300_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SC300_BUNDLE.slug,
      title: SC300_BUNDLE.title,
      description: SC300_BUNDLE.description,
      price: SC300_BUNDLE.price,
      priceVoucher: SC300_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-sc-300-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-sc-300-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-sc-300-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-sc-300-p1', tier: 'VOUCHER' as const, position: 4 }
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
