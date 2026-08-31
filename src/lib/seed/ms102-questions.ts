/**
 * MS-102 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:ms102-seed'` and upserts catalog rows.
 *
 * Exported as `seedMs102(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/ms102.ts`) and the protected
 * admin API (`/api/admin/seed-ms102`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Microsoft 365 Administrator Expert (MS-102) study guide:
 *   - Deploy and manage a Microsoft 365 tenant                          — 27% (18/variant)
 *   - Implement and manage Microsoft Entra identity and access          — 27% (18/variant)
 *   - Manage security and threats by using Microsoft Defender XDR       — 33% (21/variant)
 *   - Manage compliance by using Microsoft Purview                      — 13% ( 8/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual MS-102 questions.
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

const TENANT = 'Deploy and manage a Microsoft 365 tenant';
const IDENTITY = 'Implement and manage Microsoft Entra identity and access';
const DEFENDER = 'Manage security and threats by using Microsoft Defender XDR';
const PURVIEW = 'Manage compliance by using Microsoft Purview';

// ── Tenant references ──
const REF_M365_ROLES = { label: 'Microsoft Learn — About admin roles in the Microsoft 365 admin center', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/add-users/about-admin-roles' };
const REF_M365_LICENSE = { label: 'Microsoft Learn — Assign licenses to users', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/manage/assign-licenses-to-users' };
const REF_M365_GROUP_LIC = { label: 'Microsoft Learn — Group-based licensing in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/users/licensing-groups-assign' };
const REF_M365_DOMAIN = { label: 'Microsoft Learn — Add a domain to Microsoft 365', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-domain' };
const REF_M365_DOMAIN_DNS = { label: 'Microsoft Learn — Create DNS records at any DNS hosting provider', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider' };
const REF_M365_HEALTH = { label: 'Microsoft Learn — How to check Microsoft 365 service health', url: 'https://learn.microsoft.com/en-us/microsoft-365/enterprise/view-service-health' };
const REF_M365_MSG = { label: 'Microsoft Learn — Stay on top of changes with Message center', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/manage/message-center' };
const REF_M365_USAGE = { label: 'Microsoft Learn — Microsoft 365 usage analytics', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/usage-analytics/usage-analytics' };
const REF_M365_REPORTS = { label: 'Microsoft Learn — Activity reports in the Microsoft 365 admin center', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/activity-reports' };
const REF_M365_ADOPTION = { label: 'Microsoft Learn — Microsoft 365 adoption score', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/adoption/adoption-score' };
const REF_M365_DELEGATED = { label: 'Microsoft Learn — Delegated administration and GDAP', url: 'https://learn.microsoft.com/en-us/partner-center/customers/gdap-introduction' };
const REF_M365_TENANTS = { label: 'Microsoft Learn — Multi-tenant management with Microsoft 365 Lighthouse', url: 'https://learn.microsoft.com/en-us/microsoft-365/lighthouse/m365-lighthouse-overview' };
const REF_INTUNE = { label: 'Microsoft Learn — What is Microsoft Intune?', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/what-is-intune' };
const REF_INTUNE_ENROLL = { label: 'Microsoft Learn — Device enrollment in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/device-enrollment' };
const REF_INTUNE_COMPLIANCE = { label: 'Microsoft Learn — Use device compliance policies in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/device-compliance-get-started' };
const REF_INTUNE_CONFIG = { label: 'Microsoft Learn — Apply features and settings on devices with Intune configuration profiles', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/device-profiles' };
const REF_AUTOPILOT = { label: 'Microsoft Learn — Windows Autopilot overview', url: 'https://learn.microsoft.com/en-us/autopilot/windows-autopilot' };
const REF_M365_APPS = { label: 'Microsoft Learn — Deployment guide for Microsoft 365 Apps', url: 'https://learn.microsoft.com/en-us/deployoffice/deployment-guide-microsoft-365-apps' };
const REF_M365_APPS_CHANNELS = { label: 'Microsoft Learn — Overview of update channels for Microsoft 365 Apps', url: 'https://learn.microsoft.com/en-us/deployoffice/overview-update-channels' };
const REF_M365_APPS_ADMIN = { label: 'Microsoft Learn — Overview of the Microsoft 365 Apps admin center', url: 'https://learn.microsoft.com/en-us/deployoffice/admincenter/overview' };
const REF_OFFICE_INSTALL = { label: 'Microsoft Learn — Install Microsoft 365 Apps with the Office Deployment Tool', url: 'https://learn.microsoft.com/en-us/deployoffice/deploy-microsoft-365-apps-office-deployment-tool' };
const REF_TENANT_REGION = { label: 'Microsoft Learn — Where is your Microsoft 365 data located?', url: 'https://learn.microsoft.com/en-us/microsoft-365/enterprise/o365-data-locations' };
const REF_PAM = { label: 'Microsoft Learn — Privileged access management in Microsoft Purview', url: 'https://learn.microsoft.com/en-us/purview/privileged-access-management' };
const REF_PIM = { label: 'Microsoft Learn — What is Microsoft Entra Privileged Identity Management?', url: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure' };

// ── Identity references ──
const REF_ENTRA = { label: 'Microsoft Learn — What is Microsoft Entra ID?', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/whatis' };
const REF_ENTRA_USERS = { label: 'Microsoft Learn — How to add or delete users in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/how-to-create-delete-users' };
const REF_ENTRA_GROUPS = { label: 'Microsoft Learn — Manage groups in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/fundamentals/how-to-manage-groups' };
const REF_DYN_GROUPS = { label: 'Microsoft Learn — Dynamic membership rules for groups', url: 'https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership' };
const REF_ENTRA_CONNECT = { label: 'Microsoft Learn — What is Microsoft Entra Connect?', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/whatis-azure-ad-connect' };
const REF_ENTRA_CONNECT_SYNC = { label: 'Microsoft Learn — Microsoft Entra Connect Sync: Understand and customize synchronization', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-sync-whatis' };
const REF_ENTRA_CLOUD_SYNC = { label: 'Microsoft Learn — What is Microsoft Entra Cloud Sync?', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/what-is-cloud-sync' };
const REF_PHS = { label: 'Microsoft Learn — Implement password hash synchronization with Microsoft Entra Connect Sync', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-password-hash-synchronization' };
const REF_PTA = { label: 'Microsoft Learn — Microsoft Entra pass-through authentication', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-pta' };
const REF_SSO = { label: 'Microsoft Learn — Microsoft Entra seamless single sign-on', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-sso' };
const REF_FEDERATION = { label: 'Microsoft Learn — Federation with AD FS and Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/whatis-fed' };
const REF_AUTH_METHODS = { label: 'Microsoft Learn — Authentication methods in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-methods' };
const REF_SSPR = { label: 'Microsoft Learn — How it works: Microsoft Entra self-service password reset', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-sspr-howitworks' };
const REF_CA = { label: 'Microsoft Learn — Conditional Access overview', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview' };
const REF_CA_REQ = { label: 'Microsoft Learn — Build a Conditional Access policy', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policies' };
const REF_NAMED_LOC = { label: 'Microsoft Learn — Named locations in Conditional Access', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/location-condition' };
const REF_IDPROTECT = { label: 'Microsoft Learn — What is Microsoft Entra ID Protection?', url: 'https://learn.microsoft.com/en-us/entra/id-protection/overview-identity-protection' };
const REF_IDPROTECT_RISK = { label: 'Microsoft Learn — Risk policies in Microsoft Entra ID Protection', url: 'https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies' };
const REF_B2B = { label: 'Microsoft Learn — B2B collaboration overview', url: 'https://learn.microsoft.com/en-us/entra/external-id/what-is-b2b' };
const REF_ENTRA_ROLES = { label: 'Microsoft Learn — Microsoft Entra built-in roles', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference' };
const REF_ADMIN_UNITS = { label: 'Microsoft Learn — Administrative units in Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/administrative-units' };
const REF_ACCESS_REVIEW = { label: 'Microsoft Learn — What are access reviews?', url: 'https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview' };
const REF_ENTITLEMENT = { label: 'Microsoft Learn — What is entitlement management?', url: 'https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-overview' };
const REF_PASSWORDLESS = { label: 'Microsoft Learn — Passwordless authentication options for Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-passwordless' };

// ── Defender XDR references ──
const REF_XDR = { label: 'Microsoft Learn — Microsoft Defender XDR overview', url: 'https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender' };
const REF_XDR_PORTAL = { label: 'Microsoft Learn — The Microsoft Defender portal', url: 'https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender-portal' };
const REF_INCIDENTS = { label: 'Microsoft Learn — Incidents and alerts in the Microsoft Defender portal', url: 'https://learn.microsoft.com/en-us/defender-xdr/incidents-overview' };
const REF_HUNTING = { label: 'Microsoft Learn — Advanced hunting in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview' };
const REF_MDE = { label: 'Microsoft Learn — Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-endpoint' };
const REF_MDE_ONBOARD = { label: 'Microsoft Learn — Onboard devices to Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/onboard-configure' };
const REF_MDE_ASR = { label: 'Microsoft Learn — Attack surface reduction rules overview', url: 'https://learn.microsoft.com/en-us/defender-endpoint/attack-surface-reduction' };
const REF_MDE_TVM = { label: 'Microsoft Learn — Microsoft Defender Vulnerability Management', url: 'https://learn.microsoft.com/en-us/defender-vulnerability-management/defender-vulnerability-management' };
const REF_MDE_AIR = { label: 'Microsoft Learn — Automated investigation and response in Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/automated-investigations' };
const REF_MDO = { label: 'Microsoft Learn — Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/mdo-about' };
const REF_MDO_SAFEATT = { label: 'Microsoft Learn — Safe Attachments in Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/safe-attachments-about' };
const REF_MDO_SAFELINK = { label: 'Microsoft Learn — Safe Links in Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/safe-links-about' };
const REF_MDO_ANTIPHISH = { label: 'Microsoft Learn — Anti-phishing policies in Microsoft 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/anti-phishing-policies-about' };
const REF_MDO_PRESET = { label: 'Microsoft Learn — Preset security policies in EOP and Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/preset-security-policies' };
const REF_MDO_QUARANTINE = { label: 'Microsoft Learn — Quarantined email messages in EOP and Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/quarantine-about' };
const REF_MDO_ATTACK_SIM = { label: 'Microsoft Learn — Get started using Attack simulation training', url: 'https://learn.microsoft.com/en-us/defender-office-365/attack-simulation-training-get-started' };
const REF_MDI = { label: 'Microsoft Learn — What is Microsoft Defender for Identity?', url: 'https://learn.microsoft.com/en-us/defender-for-identity/what-is' };
const REF_MDI_SENSOR = { label: 'Microsoft Learn — Plan capacity for Microsoft Defender for Identity', url: 'https://learn.microsoft.com/en-us/defender-for-identity/deploy/capacity-planning' };
const REF_MDCA = { label: 'Microsoft Learn — What is Microsoft Defender for Cloud Apps?', url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/what-is-defender-for-cloud-apps' };
const REF_MDCA_DISCOVERY = { label: 'Microsoft Learn — Set up Cloud Discovery in Microsoft Defender for Cloud Apps', url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/set-up-cloud-discovery' };
const REF_MDCA_POLICY = { label: 'Microsoft Learn — Control cloud apps with policies', url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/control-cloud-apps-with-policies' };
const REF_SECURE_SCORE = { label: 'Microsoft Learn — Microsoft Secure Score', url: 'https://learn.microsoft.com/en-us/defender-xdr/microsoft-secure-score' };
const REF_EXPOSURE = { label: 'Microsoft Learn — Microsoft Security Exposure Management', url: 'https://learn.microsoft.com/en-us/security-exposure-management/microsoft-security-exposure-management' };
const REF_EOP = { label: 'Microsoft Learn — Exchange Online Protection overview', url: 'https://learn.microsoft.com/en-us/defender-office-365/eop-about' };
const REF_ANTIMAL = { label: 'Microsoft Learn — Anti-malware protection in EOP', url: 'https://learn.microsoft.com/en-us/defender-office-365/anti-malware-protection-about' };
const REF_ANTISPAM = { label: 'Microsoft Learn — Anti-spam protection in EOP', url: 'https://learn.microsoft.com/en-us/defender-office-365/anti-spam-protection-about' };
const REF_MDO_DKIM = { label: 'Microsoft Learn — Use DKIM to validate outbound email sent from your custom domain', url: 'https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dkim-configure' };
const REF_MDO_DMARC = { label: 'Microsoft Learn — Use DMARC to validate email', url: 'https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure' };
const REF_MDO_SPF = { label: 'Microsoft Learn — Set up SPF to help prevent spoofing', url: 'https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure' };

// ── Purview references ──
const REF_DLP = { label: 'Microsoft Learn — Data Loss Prevention overview', url: 'https://learn.microsoft.com/en-us/purview/dlp-learn-about-dlp' };
const REF_DLP_POLICY = { label: 'Microsoft Learn — Create and deploy a data loss prevention policy', url: 'https://learn.microsoft.com/en-us/purview/dlp-create-deploy-policy' };
const REF_DLP_ENDPOINT = { label: 'Microsoft Learn — Get started with Endpoint data loss prevention', url: 'https://learn.microsoft.com/en-us/purview/endpoint-dlp-getting-started' };
const REF_SIT = { label: 'Microsoft Learn — Sensitive information types in Microsoft Purview', url: 'https://learn.microsoft.com/en-us/purview/sensitive-information-type-learn-about' };
const REF_LABELS = { label: 'Microsoft Learn — Learn about sensitivity labels', url: 'https://learn.microsoft.com/en-us/purview/sensitivity-labels' };
const REF_LABEL_POLICY = { label: 'Microsoft Learn — Publish sensitivity labels by creating a label policy', url: 'https://learn.microsoft.com/en-us/purview/create-sensitivity-labels' };
const REF_RETENTION = { label: 'Microsoft Learn — Learn about retention policies and retention labels', url: 'https://learn.microsoft.com/en-us/purview/retention' };
const REF_RETENTION_POLICY = { label: 'Microsoft Learn — Create and configure retention policies', url: 'https://learn.microsoft.com/en-us/purview/create-retention-policies' };
const REF_RETENTION_LABEL = { label: 'Microsoft Learn — Create retention labels and apply them in apps', url: 'https://learn.microsoft.com/en-us/purview/file-plan-manager' };
const REF_INSIDER = { label: 'Microsoft Learn — Learn about insider risk management', url: 'https://learn.microsoft.com/en-us/purview/insider-risk-management' };
const REF_INSIDER_POLICY = { label: 'Microsoft Learn — Insider risk management policies', url: 'https://learn.microsoft.com/en-us/purview/insider-risk-management-policies' };
const REF_AUDIT = { label: 'Microsoft Learn — Search the audit log in the Microsoft Purview portal', url: 'https://learn.microsoft.com/en-us/purview/audit-search' };
const REF_AUDIT_PREMIUM = { label: 'Microsoft Learn — Microsoft Purview Audit (Premium)', url: 'https://learn.microsoft.com/en-us/purview/audit-premium' };
const REF_EDISCOVERY = { label: 'Microsoft Learn — Microsoft Purview eDiscovery solutions', url: 'https://learn.microsoft.com/en-us/purview/ediscovery' };
const REF_EDISCOVERY_STD = { label: 'Microsoft Learn — Get started with eDiscovery (Standard)', url: 'https://learn.microsoft.com/en-us/purview/ediscovery-standard-get-started' };
const REF_EDISCOVERY_PREM = { label: 'Microsoft Learn — Overview of eDiscovery (Premium)', url: 'https://learn.microsoft.com/en-us/purview/ediscovery-overview' };
const REF_COMM_COMPLIANCE = { label: 'Microsoft Learn — Learn about communication compliance', url: 'https://learn.microsoft.com/en-us/purview/communication-compliance' };
const REF_DATA_CLASS = { label: 'Microsoft Learn — Data classification in the Microsoft Purview portal', url: 'https://learn.microsoft.com/en-us/purview/data-classification-overview' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Deploy and manage a Microsoft 365 tenant (18) ──
  {
    domain: TENANT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You are a Global Administrator for a new Microsoft 365 tenant. You need to add the custom DNS domain contoso.com so users can sign in as ada@contoso.com. After adding the domain in the Microsoft 365 admin center, what is the next required step before the domain can be used?',
    options: opts4(
      'Wait 24 hours for automatic verification',
      'Add the TXT or MX verification record displayed by the admin center to the public DNS for contoso.com',
      'Add the domain to Microsoft Entra Connect',
      'Open a support ticket with Microsoft to confirm ownership'
    ),
    correct: ['b'],
    explanation: 'Domain verification is performed by publishing the TXT (or MX) record shown in the admin center to the public DNS zone. Microsoft does not auto-verify domains over time, no support ticket is needed, and Entra Connect is unrelated to domain verification.',
    references: [REF_M365_DOMAIN, REF_M365_DOMAIN_DNS]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'Helpdesk staff must be able to reset user passwords and assign Microsoft 365 licenses but must NOT be able to manage Conditional Access policies. Which built-in Microsoft Entra role should you assign to follow least-privilege?',
    options: opts4(
      'Global Administrator',
      'User Administrator',
      'Helpdesk Administrator',
      'Authentication Administrator'
    ),
    correct: ['b'],
    explanation: 'User Administrator can create/manage users, reset passwords for most users, and assign licenses, but cannot manage Conditional Access. Helpdesk Administrator cannot assign licenses. Global Administrator is excessive. Authentication Administrator handles auth methods, not licenses.',
    references: [REF_M365_ROLES, REF_ENTRA_ROLES]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want every user who is a member of the Sales department to automatically receive a Microsoft 365 E5 license when added to the Sales group, and lose it when removed. Which feature should you use?',
    options: opts4(
      'Direct license assignment via PowerShell',
      'Group-based licensing on a Microsoft Entra security group',
      'Conditional Access with license enforcement',
      'A retention policy targeting licenses'
    ),
    correct: ['b'],
    explanation: 'Group-based licensing assigns and removes licenses automatically based on group membership. Direct assignment is per-user and manual. Conditional Access governs sign-ins, not licensing. Retention policies are unrelated to licenses.',
    references: [REF_M365_LICENSE, REF_M365_GROUP_LIC]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'In the Microsoft 365 admin center, where do you go to view planned changes, upcoming feature rollouts, and required actions for your tenant?',
    options: opts4(
      'Service health',
      'Message center',
      'Usage reports',
      'Adoption Score'
    ),
    correct: ['b'],
    explanation: 'Message center is the source for announcements about new and changed features, planned changes, and required admin actions. Service health shows current incidents and advisories. Usage reports and Adoption Score show usage data, not change announcements.',
    references: [REF_M365_MSG, REF_M365_HEALTH]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Intune device enrollment in a Microsoft 365 tenant.',
    options: opts4(
      'Windows Autopilot can pre-register devices and enroll them automatically when end users sign in.',
      'iOS and iPadOS personal devices can be enrolled through user-driven enrollment with the Company Portal app.',
      'Enrolling a device in Intune always converts it to a kiosk-only device.',
      'Compliance policies evaluate device health (e.g. encryption, OS version) and can be used as a signal in Conditional Access.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Autopilot pre-registers devices; Company Portal supports user-driven iOS/iPadOS enrollment; compliance results feed Conditional Access for device-based grant controls. Enrolling a device does not make it kiosk-only — kiosk mode is a separate configuration profile.',
    references: [REF_INTUNE, REF_INTUNE_ENROLL, REF_INTUNE_COMPLIANCE, REF_AUTOPILOT]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to require BitLocker encryption and a minimum Windows 11 build on company laptops before they can access Exchange Online and SharePoint Online. What Intune object expresses these requirements?',
    options: opts4(
      'A device configuration profile',
      'A device compliance policy',
      'An app protection policy (MAM)',
      'A Conditional Access named location'
    ),
    correct: ['b'],
    explanation: 'Compliance policies define the device-health requirements (BitLocker, OS build, antivirus, etc.) used by Conditional Access to grant or block access. Configuration profiles apply settings, but compliance status is what CA evaluates. MAM protects app data on unmanaged devices; named locations are network conditions.',
    references: [REF_INTUNE_COMPLIANCE, REF_INTUNE_CONFIG, REF_CA]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to deploy Microsoft 365 Apps for enterprise to 5,000 Windows devices with a customized configuration (specific language packs and a defined update channel). Which tooling pair produces a reusable, declarative deployment?',
    options: opts4(
      'Click-to-Run installer downloaded from the user portal, configured per device',
      'The Office Deployment Tool (ODT) with an XML configuration file generated by the Microsoft 365 Apps admin center',
      'Microsoft 365 Apps installed only via Windows Update for Business',
      'A Group Policy Object that copies the Office 2019 MSI to clients'
    ),
    correct: ['b'],
    explanation: 'ODT with an XML configuration is the standard supported way to scale Microsoft 365 Apps deployment with defined channels, languages, and apps. Per-device portal installs do not scale. Windows Update for Business does not deploy Office. The Office 2019 MSI is a different product.',
    references: [REF_M365_APPS, REF_M365_APPS_ADMIN, REF_OFFICE_INSTALL]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which update channel for Microsoft 365 Apps for enterprise receives new productivity features once a month on a predictable schedule and is the default for enterprise users?',
    options: opts4(
      'Current Channel',
      'Monthly Enterprise Channel',
      'Semi-Annual Enterprise Channel',
      'Beta Channel'
    ),
    correct: ['b'],
    explanation: 'Monthly Enterprise Channel delivers new features once a month on a predictable second-Tuesday cadence and is recommended for most enterprises. Current Channel updates continuously. Semi-Annual delivers features every 6 months. Beta is for early adopters/IT pros.',
    references: [REF_M365_APPS_CHANNELS]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to delegate temporary administrative access to a partner so they can manage your Microsoft 365 tenant while keeping the relationship governed by least-privilege and time-bound roles. Which feature should you use?',
    options: opts4(
      'Add the partner as a Global Administrator in your tenant',
      'Granular Delegated Admin Privileges (GDAP) with specific Entra roles and an expiration',
      'Share the Global Admin password through a secure vault',
      'Add the partner as a guest user with no roles'
    ),
    correct: ['b'],
    explanation: 'GDAP gives partners only the Entra roles they need, scoped and time-bounded. Sharing credentials or granting standing Global Admin breaks least-privilege. A guest with no roles cannot administer the tenant.',
    references: [REF_M365_DELEGATED]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'A Managed Service Provider needs a single pane of glass to manage 80 small-business Microsoft 365 tenants — viewing health, security baseline status, and applying actions across them. Which service is purpose-built for this?',
    options: opts4(
      'Microsoft 365 Lighthouse',
      'Microsoft 365 admin center per tenant',
      'Microsoft Entra Connect Health',
      'Microsoft Purview portal'
    ),
    correct: ['a'],
    explanation: 'Microsoft 365 Lighthouse is the multi-tenant management portal for partners managing small/medium business tenants. The per-tenant admin center scales poorly. Entra Connect Health monitors hybrid identity, not multi-tenant operations. Purview is for data governance.',
    references: [REF_M365_TENANTS]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach should an organization use to grant a Global Administrator role to a user only for the four hours needed to perform a configuration change, rather than as a standing assignment?',
    options: opts4(
      'Use Microsoft Entra Privileged Identity Management (PIM) to assign the role as eligible and require activation with justification',
      'Assign the user as a permanent Global Administrator and remove the role afterwards',
      'Share the existing break-glass Global Admin account credentials for the duration',
      'Use a Conditional Access policy to grant the role temporarily'
    ),
    correct: ['a'],
    explanation: 'PIM provides just-in-time, time-bound, approval-gated activation of privileged roles with audit. Permanent assignment with later removal is error-prone. Sharing break-glass credentials defeats their purpose. Conditional Access does not grant roles — it controls access to apps.',
    references: [REF_PIM]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to know whether Exchange Online is currently experiencing a service incident affecting users in your tenant. Which page in the Microsoft 365 admin center should you open?',
    options: opts4(
      'Service health',
      'Message center',
      'Reports > Usage',
      'Adoption Score'
    ),
    correct: ['a'],
    explanation: 'Service health shows the live status of Microsoft 365 services for your tenant, including incidents and advisories. Message center announces future changes. Usage reports and Adoption Score show usage patterns, not live service status.',
    references: [REF_M365_HEALTH]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'You assigned the Exchange Administrator role to a user, but they cannot manage mailboxes for users in the Finance organizational unit while still managing the rest. Which feature lets you restrict an admin role to a subset of objects?',
    options: opts4(
      'A Conditional Access policy filtered by group',
      'Microsoft Entra administrative units scoped to the Finance OU',
      'A separate Exchange role group with Finance permissions only',
      'Dynamic membership rules on the Exchange Administrator role'
    ),
    correct: ['c'],
    explanation: 'For Exchange-specific scoping (mailboxes/recipients), you create an Exchange Online role group with the appropriate write/admin role and a write scope to the Finance group/OU. Administrative units scope Entra-managed identities. CA controls user sign-ins. Roles do not have dynamic membership.',
    references: [REF_ADMIN_UNITS, REF_ENTRA_ROLES]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which report in the Microsoft 365 admin center can show executives the active usage of Teams, Exchange, SharePoint, and OneDrive across the tenant for the last 30/90/180 days?',
    options: opts4(
      'Microsoft 365 usage analytics / activity reports',
      'Service health dashboard',
      'Audit log search in Microsoft Purview',
      'Conditional Access insights and reporting'
    ),
    correct: ['a'],
    explanation: 'The activity reports / Microsoft 365 usage analytics surface active-user counts and per-workload usage trends. Service health reports incidents. Purview audit search returns admin/user actions. CA insights report policy outcomes.',
    references: [REF_M365_USAGE, REF_M365_REPORTS]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'Your tenant currently has no devices in Intune. You want to allow employees to enroll their corporate Windows devices automatically when they sign in with their work account. What must be configured?',
    options: opts4(
      'A Conditional Access policy that requires compliant devices',
      'Microsoft Entra ID > Mobility (MDM and MAM) so Intune is set as the MDM authority and auto-enrollment is enabled for users',
      'A retention policy that targets devices',
      'Group-based licensing for Intune only'
    ),
    correct: ['b'],
    explanation: 'Auto-enrollment for Entra-joined Windows devices is set under Entra ID > Mobility (MDM and MAM) by configuring the MDM user scope and ensuring users are licensed for Intune. CA requires devices first to be enrolled; retention policies are for content; licensing alone is necessary but not sufficient.',
    references: [REF_INTUNE_ENROLL, REF_INTUNE]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'During tenant setup, where do you choose the geography where your Microsoft 365 customer data will be stored at rest?',
    options: opts4(
      'The data residency is selected at sign-up based on the country/region of the tenant — it cannot be changed afterwards without a tenant move request',
      'It can be changed in Microsoft Entra Connect at any time',
      'It is set per-user in the Microsoft 365 admin center',
      'It is automatically replicated to every Azure region'
    ),
    correct: ['a'],
    explanation: 'Data residency for Microsoft 365 services is determined by the country/region you select when the tenant is created. Moving data to another geography requires a Microsoft-managed tenant move. Entra Connect is unrelated. Data is not automatically replicated to every region.',
    references: [REF_TENANT_REGION]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Windows Autopilot.',
    options: opts4(
      'Autopilot can use a hardware hash to pre-register devices to your tenant before they are shipped to users.',
      'Autopilot user-driven mode enrolls the device in Microsoft Entra and Intune during first sign-in.',
      'Autopilot replaces Microsoft Intune as the MDM authority.',
      'Autopilot profiles can enforce skipping the EULA, OOBE privacy prompts, and the local account creation step.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Autopilot pre-registers devices via hardware hash, enrolls them in Entra+Intune during OOBE, and can skip OOBE prompts via the deployment profile. Intune remains the MDM authority — Autopilot is a provisioning service, not a replacement.',
    references: [REF_AUTOPILOT, REF_INTUNE]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach BEST allows a small company to start using their existing contoso.com domain for Microsoft 365 email while keeping the onmicrosoft.com tenant name for backend identifiers?',
    options: opts4(
      'Rename the tenant to contoso.com',
      'Add contoso.com as a verified domain and set it as the default for new mailboxes',
      'Use only the onmicrosoft.com domain for email',
      'Federate the on-premises Active Directory with contoso.com'
    ),
    correct: ['b'],
    explanation: 'You add and verify contoso.com as a custom domain and set it as default; the tenant onmicrosoft.com identifier remains. Tenants cannot be renamed at will. Using only onmicrosoft.com defeats the goal. Federation is unrelated to adding a domain.',
    references: [REF_M365_DOMAIN]
  },

  // ── Implement and manage Microsoft Entra identity and access (18) ──
  {
    domain: IDENTITY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to create a new cloud-only user named Lin Wei who will sign in as lin@contoso.com and be assigned an E5 license. Where in the Microsoft Entra admin center do you start?',
    options: opts4(
      'Identity > Users > New user > Create new user',
      'Identity > Roles & admins > Role assignments',
      'Identity Governance > Entitlement management',
      'Identity > External Identities > B2B invitation'
    ),
    correct: ['a'],
    explanation: 'Cloud-only users are created from Identity > Users > New user > Create new user. Roles & admins assigns roles to existing principals. Entitlement management assigns access packages, not creates users. B2B is for inviting external guests.',
    references: [REF_ENTRA, REF_ENTRA_USERS]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A multinational deploys Microsoft Entra Connect with password hash synchronization (PHS). The on-premises AD password policy must continue to be the authority. What happens when a user changes their password in on-premises AD?',
    options: opts4(
      'The change is rejected unless the user also resets it in Entra ID',
      'A hash of the new password hash is synced to Entra ID within minutes; cloud sign-ins continue to work',
      'The user must reset MFA',
      'Entra Connect federates the password to ADFS'
    ),
    correct: ['b'],
    explanation: 'PHS syncs a hash-of-the-hash from on-premises AD to Entra ID approximately every 2 minutes, so cloud sign-ins use the same password. PHS is independent of ADFS and does not invalidate MFA registrations.',
    references: [REF_ENTRA_CONNECT, REF_PHS]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want sign-in attempts from anonymous IP addresses (Tor) to be blocked, and sign-ins from medium-or-high risk users to require a password change. Which Microsoft Entra capability provides both?',
    options: opts4(
      'Microsoft Entra ID Protection sign-in risk and user risk policies',
      'Privileged Identity Management',
      'Microsoft Entra Connect filtering',
      'Microsoft Defender for Cloud Apps file policies'
    ),
    correct: ['a'],
    explanation: 'ID Protection ships sign-in-risk and user-risk policies that can require MFA, block, or force a password change. PIM governs role activation. Entra Connect filtering controls object sync. Defender for Cloud Apps governs SaaS, not sign-in risk.',
    references: [REF_IDPROTECT, REF_IDPROTECT_RISK]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to require multifactor authentication for all users when accessing the Microsoft 365 portal, except when the sign-in originates from your corporate office IP range. What should you configure?',
    options: opts4(
      'Per-user MFA enabled for every account',
      'A Conditional Access policy that grants access only with MFA, with the corporate IP range added as a trusted named location and excluded from the policy',
      'Security defaults',
      'Microsoft Entra Connect filtering rules'
    ),
    correct: ['b'],
    explanation: 'Conditional Access lets you target users/apps and exclude trusted named locations from the MFA requirement. Per-user MFA prompts everywhere and cannot exclude networks. Security defaults are tenant-wide with no granular exclusions. Entra Connect is for directory sync.',
    references: [REF_CA, REF_CA_REQ, REF_NAMED_LOC]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Conditional Access policy evaluation in Microsoft Entra ID.',
    options: opts4(
      'Conditional Access policies are evaluated AFTER successful first-factor authentication.',
      'Multiple matching policies are combined; if any policy results in Block, the sign-in is blocked.',
      'If multiple policies require different grant controls (e.g. MFA and compliant device), all controls must be satisfied.',
      'Conditional Access can change a user\'s assigned license.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'CA is post-authentication; results combine across policies; Block trumps; grant controls are ANDed across matching policies. Conditional Access cannot assign or change licenses — that is a separate provisioning concern.',
    references: [REF_CA, REF_CA_REQ]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to roll out passwordless sign-in for executives using FIDO2 security keys. Where do you enable FIDO2 as an allowed authentication method?',
    options: opts4(
      'Identity > Authentication methods > Policies > FIDO2 security key',
      'Identity > Conditional Access > Authentication strengths',
      'Identity Governance > Access reviews',
      'Security > Multifactor authentication > Account lockout'
    ),
    correct: ['a'],
    explanation: 'FIDO2 is enabled and scoped under Identity > Authentication methods > Policies. Authentication strengths reference allowed methods but do not enable them. Access reviews are governance. MFA account lockout is a legacy per-user MFA setting.',
    references: [REF_AUTH_METHODS, REF_PASSWORDLESS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A partner company asks for limited access to a SharePoint site in your tenant. You should not create full accounts for each partner user. Which approach is correct?',
    options: opts4(
      'Microsoft Entra B2B guest invitations',
      'Pass-through authentication',
      'Microsoft Entra Domain Services',
      'Service principal credentials'
    ),
    correct: ['a'],
    explanation: 'B2B collaboration lets you invite external users as guests who sign in with their own identity and receive permissions to resources in your tenant. PTA is for on-prem password validation. Entra Domain Services is a managed domain. Service principals are app identities.',
    references: [REF_B2B]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want managers to certify quarterly that their direct reports still need access to a sensitive Microsoft 365 group. If a manager does not respond, access should be removed automatically. What should you configure?',
    options: opts4(
      'A Microsoft Entra access review that targets the group, reviewer = manager, and "If reviewers don\'t respond" = remove access',
      'A Conditional Access policy that blocks the group',
      'An Intune compliance policy',
      'A Purview retention policy'
    ),
    correct: ['a'],
    explanation: 'Access reviews recurrently certify membership/access. You can set the manager as the reviewer and configure auto-remove when reviewers don\'t respond. CA, Intune compliance, and retention policies don\'t certify group membership.',
    references: [REF_ACCESS_REVIEW]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A user reports they were prompted to reset their password by a Microsoft Entra "Sign-in risk" policy after traveling to a new country. The IT team wants to understand why. Which signals does Entra ID Protection use to compute sign-in risk?',
    options: opts4(
      'Anonymous IP, atypical travel, malware-linked IP, unfamiliar sign-in properties, leaked credentials',
      'Disk encryption status of the device',
      'How many Microsoft 365 licenses the user holds',
      'The user\'s tenure (years since hire)'
    ),
    correct: ['a'],
    explanation: 'ID Protection computes sign-in risk from signals such as anonymous IP, atypical travel, malware-linked IP, unfamiliar sign-in properties, password spray, and leaked credentials. Device encryption, licenses, and tenure are not sign-in-risk signals.',
    references: [REF_IDPROTECT, REF_IDPROTECT_RISK]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature lets end users register and reset their own passwords (subject to administrator-defined authentication methods) without contacting the helpdesk?',
    options: opts4(
      'Self-service password reset (SSPR)',
      'Privileged Identity Management',
      'Microsoft Entra Connect',
      'Per-user MFA'
    ),
    correct: ['a'],
    explanation: 'SSPR lets users reset their own passwords with registered methods (mobile phone, authenticator, email, security questions). PIM is for privileged role activation. Entra Connect syncs directories. Per-user MFA prompts for MFA but does not reset passwords.',
    references: [REF_SSPR]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a security group whose membership is automatically calculated from the user attribute "department". Which group setting is required?',
    options: opts4(
      'Assigned membership',
      'Dynamic user membership with a rule like (user.department -eq "Sales")',
      'Mail-enabled distribution list',
      'Microsoft 365 group with a department label'
    ),
    correct: ['b'],
    explanation: 'Dynamic membership evaluates a rule against user properties to add/remove members automatically. Assigned membership is static. Distribution lists and labels do not auto-evaluate department for security access.',
    references: [REF_ENTRA_GROUPS, REF_DYN_GROUPS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'In a hybrid environment, you want users to sign in to Microsoft 365 with their on-premises AD passwords AND for the password validation to occur against on-premises AD in real time, without password hashes in the cloud. Which option meets the requirement?',
    options: opts4(
      'Password hash synchronization',
      'Pass-through authentication (PTA) with seamless SSO',
      'Cloud-only identities with self-service password reset',
      'Microsoft Entra Cloud Sync'
    ),
    correct: ['b'],
    explanation: 'PTA validates each sign-in against on-premises AD via a lightweight agent, without storing password hashes in the cloud. PHS stores hashes in the cloud. Cloud-only identities have no on-prem connection. Cloud Sync is a sync engine choice — it still typically uses PHS.',
    references: [REF_PTA, REF_SSO]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You assigned the User Administrator role at the tenant scope to a delegated admin, but you want a different admin to manage only the users in the "Lagos" administrative unit. Which assignment shape achieves the second requirement?',
    options: opts4(
      'Assign the User Administrator role with the Lagos administrative unit as the role-assignment scope',
      'Add the admin as a Global Administrator and ask them to operate only on Lagos users',
      'Use a dynamic group of Lagos users as the target of a Conditional Access policy',
      'Configure SSPR for the Lagos administrative unit only'
    ),
    correct: ['a'],
    explanation: 'Administrative-unit-scoped role assignments restrict the admin to the objects in that AU. Global Administrator is unscoped. CA gates access; SSPR is for password reset — neither delegates user management.',
    references: [REF_ADMIN_UNITS, REF_ENTRA_ROLES]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want all guest accounts that have been inactive in your tenant for 90 days to be automatically reviewed and removed if no longer needed. Which Microsoft Entra Identity Governance capability provides this?',
    options: opts4(
      'A recurring access review targeting guest users with auto-apply results to remove inactive guests',
      'Per-user MFA',
      'A retention policy on the guest mailbox',
      'Group-based licensing for guests'
    ),
    correct: ['a'],
    explanation: 'Access reviews can target guests, include inactivity/recommendations, and auto-apply removal. MFA does not remove guests. Retention is for content. Licensing does not govern guest lifecycle.',
    references: [REF_ACCESS_REVIEW, REF_B2B]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports they never see an MFA prompt when signing in to Microsoft 365 from the corporate office, but they are required to use MFA from home. Which Microsoft Entra construct most likely produced this experience?',
    options: opts4(
      'A Conditional Access policy that requires MFA, with the corporate office IP range configured as a trusted named location excluded from the policy',
      'A Microsoft Entra Connect filtering rule',
      'A retention policy on the user',
      'A Defender for Endpoint device tag'
    ),
    correct: ['a'],
    explanation: 'CA policies can exclude trusted named locations (corporate IP ranges) so users in those networks bypass MFA. Connect filtering controls sync; retention is content; MDE tags are device metadata.',
    references: [REF_CA, REF_NAMED_LOC]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Your CTO wants every Microsoft Entra ID privileged role assignment to require a justification, expire in 8 hours, and trigger an email to the security team on every activation. Which Privileged Identity Management settings are required?',
    options: opts4(
      'Configure the role assignment as eligible and tune the role settings to require justification, set maximum activation duration to 8 hours, and add the security team as notification recipients',
      'Make the user a permanent role member with MFA only',
      'Block sign-ins for the user via Conditional Access',
      'Remove the role and re-grant it manually each day'
    ),
    correct: ['a'],
    explanation: 'PIM role settings expose activation maximum duration, required justification, MFA, approval, and email notifications. Permanent assignments bypass JIT controls. CA blocks do not enable activations. Manual cycling is error-prone.',
    references: [REF_PIM]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enforce that all sign-ins to Microsoft 365 require a token strength that includes a phishing-resistant factor (e.g. FIDO2 or Windows Hello for Business) for users with the Global Administrator role. Which combination should you configure?',
    options: opts4(
      'A Conditional Access policy targeting the Global Administrators directory role, with the Authentication strength grant control set to Phishing-resistant MFA',
      'Per-user MFA for the same admins',
      'A retention label on the admins\' mailboxes',
      'A Microsoft Entra ID Protection sign-in risk policy with low threshold'
    ),
    correct: ['a'],
    explanation: 'CA supports targeting directory roles, and Authentication strengths can require phishing-resistant MFA. Per-user MFA cannot enforce method type. Retention labels and risk policies do not select methods.',
    references: [REF_CA, REF_AUTH_METHODS, REF_PASSWORDLESS]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A user signs in successfully and starts a long Microsoft 365 session. Twenty minutes later, the security team confirms the account is compromised and disables it in Microsoft Entra. With which feature enabled will the active session be revoked near-real-time, instead of waiting up to an hour for token expiry?',
    options: opts4(
      'Continuous access evaluation (CAE) for the cloud apps that support it',
      'Conditional Access sign-in frequency = 1 hour',
      'Pass-through authentication',
      'Self-service password reset'
    ),
    correct: ['a'],
    explanation: 'CAE allows Entra ID and supporting services to revoke active tokens in near-real-time when critical events (disable, password reset, location change) occur. Sign-in frequency only forces a re-prompt at the next interval; PTA is auth flow; SSPR is password reset.',
    references: [REF_CA, REF_AUTH_METHODS]
  },

  // ── Manage security and threats by using Microsoft Defender XDR (21) ──
  {
    domain: DEFENDER, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Where do security operations analysts triage incidents and alerts across Defender for Endpoint, Defender for Office 365, Defender for Identity, and Defender for Cloud Apps in a single view?',
    options: opts4(
      'The Microsoft Defender portal (security.microsoft.com)',
      'The Microsoft Entra admin center',
      'The Microsoft Purview portal',
      'The Microsoft 365 admin center'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Defender portal is the unified XDR experience for incidents, alerts, hunting, and configuration across all Defender workloads. Entra, Purview, and the M365 admin center surface different concerns.',
    references: [REF_XDR_PORTAL, REF_XDR]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender XDR incident shows seven correlated alerts that span an email click, a malicious file download, and a credential-theft attempt on an endpoint. What is the primary benefit of the incident view over the alert view?',
    options: opts4(
      'It always closes the alerts automatically',
      'It correlates alerts across workloads (email/endpoint/identity/cloud apps) into a single multi-stage attack story',
      'It blocks all senders on the message permanently',
      'It applies a retention label to mailboxes'
    ),
    correct: ['b'],
    explanation: 'Incidents correlate related alerts across products into one attack story so SOCs can investigate end-to-end. They do not auto-close alerts (AIR can resolve some), block senders, or apply retention labels.',
    references: [REF_INCIDENTS, REF_XDR]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to write a custom query that searches for sign-ins from new countries followed within an hour by mailbox-rule creation. Which Defender XDR capability lets you author such cross-product queries in Kusto Query Language?',
    options: opts4(
      'Advanced hunting',
      'Secure Score',
      'Quarantine',
      'Safe Attachments'
    ),
    correct: ['a'],
    explanation: 'Advanced hunting exposes tables (IdentityLogonEvents, EmailEvents, DeviceEvents, CloudAppEvents) queried with KQL to author custom detections. Secure Score is posture. Quarantine and Safe Attachments are MDO controls.',
    references: [REF_HUNTING]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL valid methods to onboard a Windows 11 device to Microsoft Defender for Endpoint.',
    options: opts4(
      'Microsoft Intune (MDM) configuration profile',
      'Local script (run interactively) from the Defender portal',
      'Group Policy with the onboarding package',
      'Sending an MX record to the device'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Intune, local onboarding script, Group Policy, and Microsoft Configuration Manager are all supported onboarding methods. MX records are DNS records for mail routing, not endpoint onboarding.',
    references: [REF_MDE_ONBOARD, REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to block Office applications from creating executable child processes — a known macro-malware pattern — without breaking legitimate macro use cases. Which Defender for Endpoint feature should you configure?',
    options: opts4(
      'Attack surface reduction (ASR) rules in audit-then-block mode',
      'Microsoft Defender Antivirus quick scan',
      'Defender Vulnerability Management baseline assessment',
      'EDR in block mode'
    ),
    correct: ['a'],
    explanation: 'ASR rules harden against specific attack patterns (e.g. "Block Office applications from creating child processes"). Best practice is audit first, then block. AV scans, vulnerability baselines, and EDR-in-block are different controls.',
    references: [REF_MDE_ASR, REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A vulnerability scan in Defender Vulnerability Management identifies a high-severity CVE on 1,200 Windows endpoints. Which built-in capability lets you push a remediation request directly to the Intune admin?',
    options: opts4(
      'Recommendations > Request remediation in the Defender portal, which creates a remediation task in Intune',
      'A manual email to the helpdesk',
      'A Conditional Access policy blocking the endpoints',
      'A retention policy targeting the CVE number'
    ),
    correct: ['a'],
    explanation: 'In Defender Vulnerability Management, recommendations include a "Request remediation" action that integrates with Intune, creating a remediation task assignable to IT admins. Email, CA, and retention policies are not part of this workflow.',
    references: [REF_MDE_TVM, REF_INTUNE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'A user clicks a phishing link. Defender XDR\'s automated investigation determines the email was malicious and the device shows no signs of compromise. Which capability automatically remediated the user\'s mailbox and other tenant mailboxes?',
    options: opts4(
      'Zero-hour Auto Purge (ZAP) in Defender for Office 365',
      'Safe Links time-of-click protection',
      'Defender for Endpoint EDR in block mode',
      'Microsoft Purview retention policy'
    ),
    correct: ['a'],
    explanation: 'ZAP retroactively purges malicious messages from mailboxes after delivery as new signal is gathered. Safe Links protects URLs at click-time but does not purge messages. EDR is endpoint. Retention does not remove malicious mail.',
    references: [REF_MDO, REF_MDO_SAFELINK]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enforce Microsoft\'s recommended baseline of anti-phish, anti-spam, anti-malware, Safe Attachments, and Safe Links for all users with minimal configuration. Which Defender for Office 365 feature should you apply?',
    options: opts4(
      'Preset security policies (Standard or Strict)',
      'A single custom anti-malware policy',
      'A transport rule that allows everything',
      'A retention policy for inbox'
    ),
    correct: ['a'],
    explanation: 'Preset security policies (Standard/Strict) apply Microsoft-recommended values across the entire EOP+MDO stack. A single anti-malware policy covers only one workload. Transport rules don\'t configure preset security. Retention is unrelated.',
    references: [REF_MDO_PRESET, REF_EOP]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports they never received an expected purchase order from a partner. You need to find out whether the message was quarantined, and release it if appropriate. Where should you start?',
    options: opts4(
      'The quarantine page in the Microsoft Defender portal',
      'Search-Mailbox in Exchange PowerShell',
      'The Microsoft 365 admin center > Users',
      'Purview eDiscovery (Standard)'
    ),
    correct: ['a'],
    explanation: 'The Defender portal\'s quarantine page lists messages held by anti-spam/anti-phish/malware/ZAP and allows release. Search-Mailbox is deprecated. Users blade lists accounts only. eDiscovery is for legal hold, not quarantine release.',
    references: [REF_MDO_QUARANTINE, REF_XDR_PORTAL]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to simulate a credential-harvest phishing campaign against employees and require those who click through to complete training. Which feature should you use?',
    options: opts4(
      'Attack simulation training in Microsoft Defender for Office 365',
      'Microsoft Purview communication compliance',
      'Microsoft Entra ID Protection sign-in risk',
      'Defender for Cloud Apps shadow IT discovery'
    ),
    correct: ['a'],
    explanation: 'Attack simulation training runs simulated phishing campaigns and assigns training to users who interact. Communication compliance reviews internal messages. ID Protection detects risky sign-ins. Defender for Cloud Apps surfaces shadow SaaS.',
    references: [REF_MDO_ATTACK_SIM]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'Your domain receives spoofed messages claiming to be from contoso.com. Which DNS records, configured in your authoritative DNS, allow recipient servers to authenticate that mail truly originated from your authorized senders?',
    options: opts4(
      'SPF, DKIM, and DMARC',
      'A and AAAA records only',
      'MX and CNAME only',
      'TXT records for site verification only'
    ),
    correct: ['a'],
    explanation: 'SPF authorizes sending IPs, DKIM cryptographically signs messages, and DMARC publishes a policy that ties the two to the visible From: address. A/AAAA, MX, and verification TXTs do not authenticate mail authorship.',
    references: [REF_MDO_SPF, REF_MDO_DKIM, REF_MDO_DMARC]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A finance employee receives a message claiming to be from the CEO requesting an urgent wire transfer. Which Microsoft Defender for Office 365 feature specifically protects against this kind of impersonation?',
    options: opts4(
      'Anti-phishing policy impersonation protection (with the CEO listed as a protected user)',
      'Safe Attachments dynamic delivery',
      'Microsoft 365 Apps update channels',
      'Exchange Online archiving'
    ),
    correct: ['a'],
    explanation: 'Anti-phishing policies in Defender for Office 365 include impersonation protection for protected users and domains. Safe Attachments scans files. Update channels and archiving are unrelated to BEC prevention.',
    references: [REF_MDO_ANTIPHISH, REF_MDO]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to detect lateral movement, Pass-the-Hash, and Golden Ticket attacks against on-premises Active Directory and feed the alerts into Defender XDR. Which product should you deploy?',
    options: opts4(
      'Microsoft Defender for Identity (sensor on domain controllers)',
      'Microsoft Defender for Endpoint on the domain controllers only',
      'Microsoft Defender for Cloud Apps',
      'Microsoft Defender for Office 365'
    ),
    correct: ['a'],
    explanation: 'Defender for Identity uses sensors on domain controllers (and AD FS / Entra Connect when applicable) to detect on-prem identity attacks and forwards alerts to the XDR portal. The other Defender products do not analyze AD authentication traffic.',
    references: [REF_MDI, REF_MDI_SENSOR]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to discover what unsanctioned SaaS apps employees use, by uploading firewall logs to Microsoft Defender for Cloud Apps. Which feature analyzes these logs?',
    options: opts4(
      'Cloud Discovery',
      'Conditional Access App Control',
      'File policies',
      'OAuth app governance'
    ),
    correct: ['a'],
    explanation: 'Cloud Discovery analyses traffic logs (from firewalls/proxies or Defender for Endpoint) to surface shadow IT and risk scores. App Control session-controls sanctioned apps. File policies govern files in sanctioned apps. OAuth app governance reviews consented apps.',
    references: [REF_MDCA_DISCOVERY, REF_MDCA]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Defender for Cloud Apps file policies.',
    options: opts4(
      'They can detect external sharing of files containing sensitive information types in OneDrive/SharePoint.',
      'They can quarantine, change sharing, or apply a sensitivity label as governance actions.',
      'They run only on Windows endpoints.',
      'They reuse Microsoft Purview sensitive information types.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'File policies inspect content in connected SaaS apps (M365, Box, etc.), reuse Purview SITs, and can quarantine, change sharing, or apply labels. They are SaaS-side controls — not limited to Windows endpoints.',
    references: [REF_MDCA_POLICY, REF_MDCA]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft 365 capability gives a single 0-100% security posture score that aggregates recommended actions across identity, devices, apps, and data?',
    options: opts4(
      'Microsoft Secure Score',
      'Microsoft Compliance Manager',
      'Microsoft Entra License usage',
      'Microsoft 365 Apps health dashboard'
    ),
    correct: ['a'],
    explanation: 'Microsoft Secure Score aggregates security recommendations into a percentage score and tracks improvement actions. Compliance Manager scores compliance posture. License usage and Apps health are unrelated.',
    references: [REF_SECURE_SCORE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want Defender XDR to automatically investigate alerts and remediate confirmed malicious entities (e.g. delete a file, isolate a device) without analyst intervention for low-risk cases. Which capability provides this?',
    options: opts4(
      'Automated investigation and response (AIR)',
      'Manual playbook in Microsoft Sentinel only',
      'Conditional Access',
      'Microsoft Purview communication compliance'
    ),
    correct: ['a'],
    explanation: 'AIR runs automated investigations on alerts and applies remediation actions based on configured automation levels. Sentinel playbooks are a different (paid SIEM) product. CA controls sign-ins. Purview communication compliance reviews messages.',
    references: [REF_MDE_AIR, REF_INCIDENTS]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature in Defender for Office 365 detonates email attachments in a sandbox before delivery to evaluate whether they exhibit malicious behavior?',
    options: opts4(
      'Safe Attachments',
      'Safe Links',
      'Anti-spam policy',
      'Inbox rules'
    ),
    correct: ['a'],
    explanation: 'Safe Attachments opens attachments in a virtual environment to detect zero-day behaviors before delivery. Safe Links protects URLs at click time. Anti-spam scores spam. Inbox rules are mailbox-level rules, not threat protection.',
    references: [REF_MDO_SAFEATT]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Microsoft\'s recommended posture for outbound mail authentication is to publish a DMARC record with which policy after a monitoring period?',
    options: opts4(
      'p=none indefinitely',
      'p=quarantine or p=reject once SPF and DKIM align cleanly',
      'p=allow',
      'Remove the DMARC record entirely'
    ),
    correct: ['b'],
    explanation: 'Best practice is to start with p=none for visibility, then move to p=quarantine and finally p=reject once SPF/DKIM are passing and aligned. Staying at p=none provides no enforcement. p=allow is not a valid DMARC value.',
    references: [REF_MDO_DMARC]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'A device covered by Defender for Endpoint shows a high-confidence alert that a process is exfiltrating data. As an analyst, which action isolates the device from network communication while preserving its connection to Defender for Endpoint cloud service?',
    options: opts4(
      'Use "Isolate device" from the device page in the Defender portal',
      'Remove the device from Microsoft Entra ID',
      'Apply a Conditional Access "block" policy targeting the user',
      'Run Disk Cleanup remotely'
    ),
    correct: ['a'],
    explanation: 'The "Isolate device" action in the Defender portal cuts general network access while keeping the agent-to-service channel up so analysts can still investigate and remediate. Removing the Entra object, applying CA blocks, or running Disk Cleanup do not provide forensic isolation.',
    references: [REF_MDE, REF_INCIDENTS]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Where do you view and configure the Microsoft Security Exposure Management initiatives that prioritize the most impactful posture improvements across the attack surface?',
    options: opts4(
      'Exposure management section of the Microsoft Defender portal',
      'Microsoft Purview portal',
      'Microsoft Entra admin center',
      'Azure Cost Management'
    ),
    correct: ['a'],
    explanation: 'Microsoft Security Exposure Management lives in the Defender portal\'s Exposure management section and surfaces initiatives that combine Secure Score, vulnerabilities, and other signals. Purview is compliance; Entra is identity; Cost Management is billing.',
    references: [REF_EXPOSURE]
  },

  // ── Manage compliance by using Microsoft Purview (8) ──
  {
    domain: PURVIEW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In the Microsoft Purview portal, where do you create a data loss prevention policy that prevents users from sharing credit card numbers in Microsoft Teams chats?',
    options: opts4(
      'Solutions > Data Loss Prevention > Policies > Create policy',
      'Solutions > Information Protection > Labels',
      'Solutions > Records management > File plan',
      'Solutions > Audit > New search'
    ),
    correct: ['a'],
    explanation: 'DLP policies are created under Solutions > Data Loss Prevention > Policies and can target Teams chats, mailboxes, sites, and endpoints. Information Protection is for sensitivity labels. Records management is for retention. Audit is for activity search.',
    references: [REF_DLP, REF_DLP_POLICY]
  },
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a DLP policy to detect U.S. Social Security Numbers in SharePoint Online with high confidence. Which built-in classifier should the DLP rule match on?',
    options: opts4(
      'A sensitive information type for "U.S. Social Security Number (SSN)" with high confidence',
      'A retention label called "SSN"',
      'A custom Conditional Access named location',
      'A communication compliance policy'
    ),
    correct: ['a'],
    explanation: 'Sensitive information types (SITs) like "U.S. Social Security Number" are the built-in classifiers DLP rules match. Retention labels apply lifecycle, not detection. CA named locations are network conditions. Communication compliance reviews internal messages.',
    references: [REF_SIT, REF_DLP_POLICY]
  },
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want documents tagged "Confidential" to be encrypted, watermarked, and unable to be forwarded outside the organization. Which Purview feature should you use?',
    options: opts4(
      'Sensitivity labels with encryption, content marking, and "Do not forward" rights',
      'Retention labels with delete-only actions',
      'eDiscovery legal holds',
      'Insider risk management policies'
    ),
    correct: ['a'],
    explanation: 'Sensitivity labels apply encryption (Azure Information Protection / Microsoft Purview Information Protection), visual markings, and usage rights such as "Do not forward". Retention labels manage lifecycle; eDiscovery is for legal investigations; insider risk detects risky activities.',
    references: [REF_LABELS, REF_LABEL_POLICY]
  },
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to retain all Exchange mailboxes and SharePoint sites for at least 7 years to satisfy a regulator, regardless of user deletion. Which Purview feature should you use?',
    options: opts4(
      'A retention policy targeting Exchange and SharePoint with retain-only for 7 years',
      'A sensitivity label with encryption',
      'A DLP policy that blocks delete',
      'An eDiscovery (Standard) case'
    ),
    correct: ['a'],
    explanation: 'Retention policies retain content for a specified duration across multiple workloads (Exchange, SharePoint, OneDrive, Teams). Sensitivity labels protect, not retain. DLP rules cannot enforce a deletion hold. eDiscovery cases are matter-specific.',
    references: [REF_RETENTION, REF_RETENTION_POLICY]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Purview retention.',
    options: opts4(
      'A retention policy can preserve content for a fixed period and then delete it.',
      'When retention and deletion conflict on the same item, retention wins (content is preserved).',
      'Retention labels can be applied manually by users or automatically using conditions.',
      'A retention policy can encrypt content with sensitivity-label encryption.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Retention policies handle retain+delete, retention wins over delete by design, and retention labels can be applied manually or via conditions. Encryption is provided by sensitivity labels, not retention.',
    references: [REF_RETENTION, REF_RETENTION_LABEL]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'A legal hold has been requested on the mailbox of an employee under investigation. The mailbox must be preserved even if the user attempts to delete content. Which approach is correct?',
    options: opts4(
      'Create an eDiscovery (Standard or Premium) case, add the custodian, and place a hold on the mailbox',
      'Apply a DLP policy that blocks deletion',
      'Move the mailbox to In-Place Archive',
      'Apply an Insider risk management policy'
    ),
    correct: ['a'],
    explanation: 'eDiscovery cases (Standard/Premium) support legal holds that preserve mailbox content even if the user deletes it. DLP blocks transmissions, not deletions. In-Place Archive is for mailbox tiering, not hold. Insider risk detects risky activities, not preservation.',
    references: [REF_EDISCOVERY, REF_EDISCOVERY_STD]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulator requires a 10-year audit retention with the ability to investigate intelligent insights such as MailItemsAccessed and Send-on-behalf events. Which capability provides these advanced events and extended retention?',
    options: opts4(
      'Microsoft Purview Audit (Premium)',
      'Microsoft Purview Audit (Standard)',
      'Microsoft 365 message trace',
      'Microsoft Entra sign-in logs'
    ),
    correct: ['a'],
    explanation: 'Purview Audit (Premium) provides extended retention (1 year, extensible to 10) and advanced audit events such as MailItemsAccessed. Audit (Standard) has shorter retention and fewer events. Message trace is mail-flow only. Entra sign-in logs only cover sign-ins.',
    references: [REF_AUDIT_PREMIUM]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to detect employees emailing large volumes of internal files to personal accounts shortly before resigning. Which Microsoft Purview feature is designed for this scenario?',
    options: opts4(
      'Insider risk management with the "Data leaks by departing users" template',
      'Microsoft Defender for Endpoint vulnerability assessment',
      'Communication compliance review of all internal emails',
      'eDiscovery (Premium) review-set analytics'
    ),
    correct: ['a'],
    explanation: 'Insider risk management templates such as "Data leaks by departing users" combine HR signals (resignation date) with file/email activity to flag risky actions. The other options address different concerns.',
    references: [REF_INSIDER, REF_INSIDER_POLICY]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Deploy and manage a Microsoft 365 tenant (18) ──
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After you add and verify the domain fabrikam.com to your Microsoft 365 tenant, mail flow to user@fabrikam.com still fails with a non-delivery report. Which DNS record is most likely missing or incorrect?',
    options: opts4(
      'The MX record pointing to the Exchange Online host (fabrikam-com.mail.protection.outlook.com)',
      'A CNAME pointing to outlook.office.com',
      'An A record for the apex domain',
      'A TXT verification record'
    ),
    correct: ['a'],
    explanation: 'For Exchange Online to receive mail for a custom domain, the MX record must point to <tenant>.mail.protection.outlook.com. The verification TXT is needed only at the verification step. Apex A and login CNAMEs are not the cause of NDRs.',
    references: [REF_M365_DOMAIN_DNS, REF_M365_DOMAIN]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'Your CFO needs read-only insight into every user\'s licenses and usage, but should not be able to change settings. Which role is most appropriate?',
    options: opts4(
      'Global Reader',
      'Billing Administrator',
      'User Administrator',
      'License Administrator'
    ),
    correct: ['a'],
    explanation: 'Global Reader provides read-only access across the admin centers, ideal for executives needing visibility without change rights. Billing/License/User Administrators can make changes within their scope.',
    references: [REF_M365_ROLES, REF_ENTRA_ROLES]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You assigned Office 365 E3 to a 5,000-user group via group-based licensing. Two users in that group could not have a license applied because of a service plan dependency. Where can you investigate the error?',
    options: opts4(
      'The "Licenses" page of the group in Microsoft Entra ID, which shows reprocessing status and per-user errors',
      'The user\'s mailbox in Outlook',
      'The Defender XDR portal',
      'Service health'
    ),
    correct: ['a'],
    explanation: 'Group-based licensing reports per-user errors on the group\'s Licenses page in Entra ID, including service-plan conflicts. Outlook, Defender, and Service Health are unrelated to licensing assignment errors.',
    references: [REF_M365_GROUP_LIC, REF_M365_LICENSE]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You receive a Message center post announcing a feature change rolling out in 30 days. Which audience should you notify so that affected users can be prepared?',
    options: opts4(
      'No one — Message center is for admins only',
      'The targeted users and groups noted in the post, by forwarding the post via email or scheduled in the admin center',
      'The Global Administrators of partner tenants',
      'Microsoft support'
    ),
    correct: ['b'],
    explanation: 'Message center posts describe the impact area; the recommendation is to forward to affected users or to broader IT stakeholders. Posts are for admins, but the *impact* extends to users. Partner tenants get their own posts. Microsoft support is not the recipient.',
    references: [REF_M365_MSG]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to deploy Microsoft 365 Apps with semi-annual feature updates and quarterly security baselines for line-of-business compatibility teams. Which update channel matches?',
    options: opts4(
      'Semi-Annual Enterprise Channel',
      'Current Channel',
      'Monthly Enterprise Channel',
      'Beta Channel'
    ),
    correct: ['a'],
    explanation: 'Semi-Annual Enterprise Channel delivers new features every 6 months (with security updates each month) and is the slowest production channel — best suited for environments requiring extensive compatibility testing.',
    references: [REF_M365_APPS_CHANNELS]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports that the Outlook app on their managed iPhone shows their corporate mailbox without prompting for sign-in after they were enrolled in Intune. Which feature most likely provided the seamless experience?',
    options: opts4(
      'A device configuration profile pushing the Outlook email account settings',
      'A retention policy applied to the mailbox',
      'A DLP policy on Outlook',
      'A Defender for Endpoint onboarding package'
    ),
    correct: ['a'],
    explanation: 'Intune can push email-account configuration to Outlook on iOS via a device configuration profile, pre-populating the user\'s sign-in. Retention/DLP policies are content governance. Defender onboarding is endpoint protection.',
    references: [REF_INTUNE_CONFIG, REF_INTUNE]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Intune compliance policies.',
    options: opts4(
      'They can require a minimum operating-system version.',
      'They can require disk encryption (BitLocker or FileVault).',
      'They can directly install or remove applications.',
      'Their compliance state can be referenced as a Conditional Access grant control ("Require device to be marked as compliant").'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Compliance policies define health requirements (OS version, encryption, AV, jailbreak detection, etc.). App install/removal is the role of app deployments, not compliance policies. The compliance result is what CA references.',
    references: [REF_INTUNE_COMPLIANCE, REF_CA]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to migrate ten thousand Windows 11 devices to a self-deploying setup where the device automatically joins Microsoft Entra and enrolls into Intune with no user interaction. Which Autopilot deployment mode meets this requirement?',
    options: opts4(
      'Self-deploying mode',
      'User-driven mode',
      'Pre-provisioning (white glove) mode',
      'Existing-device redeploy'
    ),
    correct: ['a'],
    explanation: 'Self-deploying mode performs Entra join + Intune enrollment without any user input — ideal for kiosks/digital signage. User-driven requires a user sign-in. Pre-provisioning is IT-staged. Existing-device redeploy targets enrolled devices to reset state.',
    references: [REF_AUTOPILOT, REF_INTUNE_ENROLL]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to grant a partner administrator temporary delegated rights to operate as your Helpdesk Administrator for two weeks. Which mechanism is correct?',
    options: opts4(
      'GDAP with a Helpdesk Administrator role and an explicit expiration date',
      'A custom admin role with no expiration',
      'A shared mailbox',
      'A Conditional Access policy excluding the partner'
    ),
    correct: ['a'],
    explanation: 'GDAP allows specifying the Entra roles and an expiration. Custom roles without expiration grant standing access. Shared mailboxes provide mail collaboration, not admin rights. CA does not grant administrative roles.',
    references: [REF_M365_DELEGATED]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'A managed service provider wants to apply baseline security configurations (MFA, default policies) across all 50 of their managed Microsoft 365 SMB tenants from one place. Which service should they use?',
    options: opts4(
      'Microsoft 365 Lighthouse',
      'Microsoft Sentinel multi-workspace',
      'Microsoft Defender for Cloud',
      'Microsoft Entra Domain Services'
    ),
    correct: ['a'],
    explanation: 'Lighthouse provides multi-tenant management for SMB customers with baseline configuration, posture, and remediation. Sentinel multi-workspace is a SIEM scope. Defender for Cloud is Azure workload protection. Entra Domain Services is managed AD.',
    references: [REF_M365_TENANTS]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'A user requires the Exchange Administrator role only when performing an audit. They should not have standing privileges. After enabling PIM, which sign-in setting BEST ensures their activation is logged and approved by a peer?',
    options: opts4(
      'Configure the role assignment as eligible and require approval and MFA for activation',
      'Make them a permanent member of Global Administrators',
      'Disable MFA for their account',
      'Grant tenant access only from the corporate office IP'
    ),
    correct: ['a'],
    explanation: 'PIM eligible assignments allow just-in-time activation with required MFA and approval, and the activation is logged. Permanent Global Admin breaks least privilege; disabling MFA weakens security; IP gating alone does not provide approval/audit.',
    references: [REF_PIM]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft 365 admin center surface is the authoritative source for tenant-wide service incidents and post-incident reports?',
    options: opts4(
      'Service health',
      'Reports > Usage',
      'Reports > Productivity Score',
      'Settings > Org settings'
    ),
    correct: ['a'],
    explanation: 'Service health is the authoritative source for active incidents, advisories, history, and post-incident reports. Usage and Productivity Score are usage analytics. Org settings configure services, not incidents.',
    references: [REF_M365_HEALTH]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to delegate management of users in only the Australia region to a regional admin team. The team must NOT see users from other countries. Which feature satisfies this requirement?',
    options: opts4(
      'A Microsoft Entra administrative unit containing the Australia users, with the team scoped as User Administrator on that unit',
      'A Conditional Access policy filtered to Australia',
      'A retention policy targeting Australia',
      'A Defender for Cloud Apps policy'
    ),
    correct: ['a'],
    explanation: 'Administrative units scope Entra role assignments to a subset of users/groups/devices — exactly the regional delegation scenario. CA gates sign-ins. Retention and Defender for Cloud Apps do not delegate user management.',
    references: [REF_ADMIN_UNITS]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft 365 admin center insight presents an organization\'s "Communication, Meetings, Content collaboration, Teamwork, and Mobility" people-experience score?',
    options: opts4(
      'Adoption Score',
      'Service health',
      'Secure Score',
      'Compliance Score'
    ),
    correct: ['a'],
    explanation: 'Adoption Score (formerly Productivity Score) measures the people experience across Microsoft 365. Service health is incident status. Secure Score is security posture. Compliance Score is governance posture.',
    references: [REF_M365_ADOPTION]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to control which users can self-enroll personal Windows devices into Intune for "Bring Your Own Device" access. Which Intune setting is most relevant?',
    options: opts4(
      'Enrollment restrictions that allow or block personal device platforms per user group',
      'A Conditional Access named location',
      'A communication compliance review',
      'Group-based licensing'
    ),
    correct: ['a'],
    explanation: 'Intune enrollment restrictions can permit or block personal (BYO) devices per platform and user group. Named locations are network conditions; communication compliance reviews messages; licensing is unrelated to platform restrictions.',
    references: [REF_INTUNE_ENROLL, REF_INTUNE]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a specific Microsoft 365 Apps build (a known-good version) to a pilot ring before promoting it tenant-wide. Which feature in the Microsoft 365 Apps admin center supports this?',
    options: opts4(
      'Servicing profiles (Microsoft 365 Apps admin center)',
      'Microsoft Defender for Endpoint',
      'A retention policy',
      'Microsoft Entra access reviews'
    ),
    correct: ['a'],
    explanation: 'Servicing profiles in the Microsoft 365 Apps admin center pin builds to user groups and enable controlled rollouts. Defender, retention, and access reviews are unrelated to Apps build management.',
    references: [REF_M365_APPS_ADMIN, REF_M365_APPS]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a user to be a Global Administrator only for the next 4 hours to complete a configuration change. They will need MFA and a justification reason on activation. Which feature should you use?',
    options: opts4(
      'Microsoft Entra Privileged Identity Management (PIM)',
      'Granting standing Global Administrator and removing it later',
      'A Conditional Access policy',
      'A device compliance policy'
    ),
    correct: ['a'],
    explanation: 'PIM is the just-in-time, time-bound, approval-and-MFA-gated activation system for privileged Entra roles. Standing assignments violate least privilege. CA controls sign-ins; compliance policies evaluate devices.',
    references: [REF_PIM]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'When a new Microsoft 365 tenant is created from sign-up, the default fallback domain takes which form?',
    options: opts4(
      '<tenantname>.onmicrosoft.com',
      '<tenantname>.azurewebsites.net',
      '<tenantname>.cloudapp.net',
      '<tenantname>.local'
    ),
    correct: ['a'],
    explanation: 'The default fallback for a new Microsoft 365 tenant is <tenantname>.onmicrosoft.com. Azurewebsites.net is for App Service, cloudapp.net is legacy Cloud Services, and .local is an on-prem AD pattern.',
    references: [REF_M365_DOMAIN]
  },

  // ── Implement and manage Microsoft Entra identity and access (18) ──
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to invite an external contractor to collaborate on a SharePoint site. The contractor uses an existing Microsoft Entra account in another tenant. Which feature should you use?',
    options: opts4(
      'Microsoft Entra B2B collaboration with a guest invitation',
      'A federated trust with the contractor\'s domain',
      'Microsoft Entra Domain Services',
      'A service principal'
    ),
    correct: ['a'],
    explanation: 'B2B issues guest invitations that let external users sign in with their own identity and access your shared resources. Federation is a complex on-prem trust; Entra Domain Services is a managed AD; service principals are app identities.',
    references: [REF_B2B]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A hybrid identity solution uses Microsoft Entra Cloud Sync (rather than Entra Connect Sync). Which scenario is BEST served by Cloud Sync?',
    options: opts4(
      'Synchronizing disconnected forests and small AD environments with simplified deployment',
      'Synchronizing complex device-write-back scenarios',
      'Real-time replication of certificates from CA',
      'Push-based DKIM key rotation'
    ),
    correct: ['a'],
    explanation: 'Cloud Sync uses lightweight agents and is well suited to multiple disconnected forests, smaller AD scenarios, and simpler deployments. Complex hybrid (device write-back, etc.) still needs Entra Connect Sync. CAs and DKIM rotation are unrelated.',
    references: [REF_ENTRA_CLOUD_SYNC, REF_ENTRA_CONNECT_SYNC]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Entra Conditional Access named locations.',
    options: opts4(
      'They can be defined as IPv4/IPv6 ranges.',
      'They can be defined as countries/regions based on the sign-in IP.',
      'They can be marked as trusted, which affects the sign-in risk calculation.',
      'They can install software on the device.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Named locations support IP ranges, country/region lists, and a trusted flag. They are policy targets — they do not push software (that\'s Intune/SCCM).',
    references: [REF_NAMED_LOC, REF_CA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to require Microsoft Authenticator number-matching MFA when users access a sensitive Power BI report. Which feature lets you require a specific authentication strength?',
    options: opts4(
      'Conditional Access authentication strengths',
      'Self-service password reset settings',
      'Microsoft Entra Domain Services',
      'Tenant access policies'
    ),
    correct: ['a'],
    explanation: 'Authentication strengths in Conditional Access let you require specific methods (e.g. phishing-resistant MFA, number matching). SSPR is about password reset; Entra DS is managed AD; "tenant access policies" is not a CA term.',
    references: [REF_CA, REF_AUTH_METHODS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A new joiner needs access to multiple SharePoint sites, a Teams team, and an Azure subscription. You want managers to request the bundle and have it provisioned with one approval. Which feature should you use?',
    options: opts4(
      'Microsoft Entra entitlement management access packages',
      'Conditional Access policies',
      'Privileged Identity Management activations',
      'Group-based licensing'
    ),
    correct: ['a'],
    explanation: 'Entitlement management access packages bundle resources and an approval workflow for self-service access. CA controls sign-ins, PIM activates roles, group-based licensing assigns licenses — none bundle multiple resources for request.',
    references: [REF_ENTITLEMENT]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You want users to be blocked when Entra ID Protection determines their account is high-risk (e.g. leaked credentials), and they must clean up before access is restored. Which policy should you configure?',
    options: opts4(
      'A Conditional Access policy that targets the high user-risk condition with a Block grant control, requiring admin remediation',
      'A retention policy on the user\'s mailbox',
      'A DLP policy with a custom SIT',
      'A Defender for Cloud Apps OAuth app policy'
    ),
    correct: ['a'],
    explanation: 'User-risk Conditional Access policies block high-risk users (or force password reset). Retention, DLP, and OAuth governance address content and apps, not identity risk.',
    references: [REF_IDPROTECT_RISK, REF_CA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You enabled SSPR for a group of pilot users and want them registered for the right authentication methods before they need to reset. Which approach automates registration?',
    options: opts4(
      'A Conditional Access policy or registration campaign requiring users to register authentication methods at next sign-in',
      'Asking each user manually via email',
      'Disabling all sign-ins until they register',
      'Removing all MFA from accounts'
    ),
    correct: ['a'],
    explanation: 'A registration campaign (or a CA policy with the "Register security information" action) prompts users to register at next sign-in. Manual asks scale poorly. Disabling sign-ins blocks work. Removing MFA weakens security.',
    references: [REF_SSPR, REF_AUTH_METHODS]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Microsoft Entra Connect Sync deployment, which authentication option ensures that on-premises AD continues to make the authentication decision (no password hash in the cloud) while supporting SSO from Entra-joined devices?',
    options: opts4(
      'Pass-through authentication with seamless SSO',
      'Cloud-only password hash sync',
      'Federation with AD FS',
      'Microsoft Entra B2B'
    ),
    correct: ['a'],
    explanation: 'PTA validates each sign-in against on-prem AD via lightweight agents, keeping the decision on-prem. Federation also keeps decisions on-prem but is more complex and typically not recommended for new deployments. PHS stores hashes in the cloud; B2B is unrelated.',
    references: [REF_PTA, REF_FEDERATION]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to grant a group of contractors access to a Microsoft 365 app, but only when sign-in originates from an unmanaged device — and to enforce session controls that prevent download. Which combination is required?',
    options: opts4(
      'A Conditional Access policy with session controls (Use Conditional Access App Control through Microsoft Defender for Cloud Apps) targeting the contractor group',
      'Group-based licensing alone',
      'Federation only',
      'Self-service password reset'
    ),
    correct: ['a'],
    explanation: 'CA App Control (powered by Defender for Cloud Apps) provides session controls — including block-download — for unmanaged-device sessions. Licensing, federation, and SSPR do not implement these session controls.',
    references: [REF_CA, REF_MDCA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A new policy must require a Microsoft Entra ID Protection sign-in risk of medium or higher to trigger MFA, but only for cloud apps; native sign-ins to Windows should not be affected. Which target is correct?',
    options: opts4(
      'Set the Conditional Access policy "Cloud apps or actions" to All cloud apps (or specific apps) and use sign-in risk condition',
      'Use a per-user MFA setting',
      'Add a retention policy',
      'Enable security defaults'
    ),
    correct: ['a'],
    explanation: 'CA policies target cloud apps and let you scope by sign-in risk. Per-user MFA does not respect risk. Retention policies are unrelated. Security defaults are tenant-wide with no risk scoping.',
    references: [REF_CA, REF_IDPROTECT_RISK]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to enforce reauthentication every 4 hours for users accessing a sensitive web app. Which Conditional Access session control should you configure?',
    options: opts4(
      'Sign-in frequency = 4 hours on the Conditional Access policy',
      'Persistent browser session = always',
      'Pass-through authentication enabled',
      'Group-based licensing'
    ),
    correct: ['a'],
    explanation: 'Sign-in frequency forces re-authentication after the specified interval. Persistent browser session does the opposite. PTA is hybrid auth. Licensing is unrelated to session length.',
    references: [REF_CA, REF_CA_REQ]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature, when activated, requires MFA for risky sign-in patterns AND auto-remediates user risk by forcing a password change — but ONLY for licensed users?',
    options: opts4(
      'Microsoft Entra ID Protection risk-based Conditional Access policies (require Entra ID P2 licensing)',
      'Security defaults',
      'Per-user MFA',
      'Microsoft Entra Domain Services'
    ),
    correct: ['a'],
    explanation: 'ID Protection sign-in/user risk policies require Entra ID P2 licensing. Security defaults are free but not risk-conditional. Per-user MFA is not risk-aware. Entra DS is unrelated.',
    references: [REF_IDPROTECT, REF_IDPROTECT_RISK]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to roll out passwordless authentication using Windows Hello for Business across the enterprise, but only for users who currently have a Microsoft Authenticator registered. Where do you configure both the enablement and the targeted group?',
    options: opts4(
      'Microsoft Entra ID > Security > Authentication methods > Policies > Windows Hello for Business, scoped to the chosen group',
      'Per-user MFA Service Settings only',
      'A Conditional Access policy with named locations',
      'Microsoft Entra Connect Sync filters'
    ),
    correct: ['a'],
    explanation: 'Authentication methods policy controls which methods are enabled and to which groups. Per-user MFA service settings predate this and cannot scope WHfB. CA and Connect Sync filters are unrelated.',
    references: [REF_AUTH_METHODS, REF_PASSWORDLESS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A new external partner uses an organization that is NOT a Microsoft Entra tenant — only personal email accounts. You still want them to access a Microsoft Teams team in your tenant with their existing email identity. Which Microsoft Entra capability supports this?',
    options: opts4(
      'B2B collaboration with email one-time passcode authentication for non-Entra guests',
      'B2B direct connect',
      'Federation with the partner\'s on-prem AD',
      'A service principal granted to the partner'
    ),
    correct: ['a'],
    explanation: 'Email one-time passcode (OTP) lets external users without an Entra/Microsoft account sign in as B2B guests using a code sent to their email. B2B direct connect is for Microsoft 365 cross-tenant Teams. Federation/SPNs are not the right fit.',
    references: [REF_B2B, REF_ENTRA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to migrate from on-premises AD FS federation to managed cloud authentication while keeping the option to roll back. Which staged-rollout capability does Microsoft Entra Connect offer?',
    options: opts4(
      'Staged Rollout to move groups of users from federation to PHS or PTA in a controlled way',
      'Tenant-wide replace federation in one shot',
      'B2B collaboration migration',
      'Microsoft Entra Domain Services replacement'
    ),
    correct: ['a'],
    explanation: 'Staged Rollout in Entra ID lets you cut over groups of federated users to PHS or PTA gradually, with rollback. The other options are not the migration pattern.',
    references: [REF_FEDERATION, REF_PHS, REF_PTA]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC analyst notices repeated sign-in attempts to a low-value SaaS app with valid usernames but wrong passwords from many IPs — a password spray pattern. Which Microsoft Entra capability automatically labels these sign-ins as risky and can require remediation?',
    options: opts4(
      'Microsoft Entra ID Protection (sign-in risk detection — "Password spray")',
      'Conditional Access named locations',
      'Per-user MFA enabled for the user',
      'Self-service password reset'
    ),
    correct: ['a'],
    explanation: 'ID Protection includes password-spray detection that elevates sign-in risk. CA named locations are a static condition. Per-user MFA and SSPR are not risk-based.',
    references: [REF_IDPROTECT, REF_IDPROTECT_RISK]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Entra Identity Governance feature lets you define HR-event-triggered "joiner / mover / leaver" automation, such as creating a user, granting access packages, and disabling them at termination?',
    options: opts4(
      'Microsoft Entra lifecycle workflows',
      'Microsoft Entra Domain Services',
      'Microsoft Entra B2B direct connect',
      'Conditional Access reporting-only mode'
    ),
    correct: ['a'],
    explanation: 'Lifecycle workflows orchestrate joiner/mover/leaver tasks tied to attributes/dates and can invoke access-package operations. Entra DS is a managed domain; B2B direct connect is Teams cross-tenant; reporting-only is a CA policy mode.',
    references: [REF_ENTITLEMENT, REF_ACCESS_REVIEW]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organization wants to allow guests from a specific trusted partner tenant to bypass MFA in your tenant because they already satisfied MFA on their home tenant. Which Microsoft Entra setting enables this?',
    options: opts4(
      'Cross-tenant access settings — Inbound trust settings — Trust multifactor authentication from Microsoft Entra tenants',
      'A Conditional Access named location',
      'Per-user MFA for the partner organization',
      'A federation trust in Microsoft Entra Connect'
    ),
    correct: ['a'],
    explanation: 'Cross-tenant access settings include inbound trust controls to accept MFA, device-compliance, and Entra-joined claims from a specific partner tenant. Named locations are network IP scopes; per-user MFA and Connect federation are different controls.',
    references: [REF_B2B, REF_CA, REF_AUTH_METHODS]
  },

  // ── Manage security and threats by using Microsoft Defender XDR (21) ──
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user is reporting that legitimate quarantine releases are taking too long because there is no admin available. Which Defender for Office 365 feature lets users request release of their own quarantined messages?',
    options: opts4(
      'End-user spam notifications and self-service release in quarantine policy',
      'Anti-spam allow-list of the user\'s address',
      'A retention label applied to the quarantine',
      'A Power Automate flow only'
    ),
    correct: ['a'],
    explanation: 'Quarantine policies allow end-user request-to-release (or direct release, depending on type). End-user notifications and the quarantine portal expose this. Allow-listing the user does nothing for quarantined inbound; retention is unrelated.',
    references: [REF_MDO_QUARANTINE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'A Defender XDR incident shows correlated alerts from email, endpoint, and identity. As an analyst, what is the BEST first action after opening the incident?',
    options: opts4(
      'Review the attack story / Graph view to understand the timeline and entities involved',
      'Immediately mark the incident as resolved to clear the queue',
      'Delete the related quarantine items without review',
      'Disable all Defender alerting'
    ),
    correct: ['a'],
    explanation: 'The attack story / graph view in Defender XDR summarizes the timeline, entities, and evidence — the starting point for triage. Marking resolved prematurely, deleting evidence, or disabling alerting are anti-patterns.',
    references: [REF_INCIDENTS, REF_XDR_PORTAL]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You authored a hunting query that returns suspicious behaviors. You want to operationalize it so it runs automatically and creates alerts. Which feature should you use?',
    options: opts4(
      'Custom detection rule built on the saved hunting query',
      'A Power Automate flow only',
      'A retention policy',
      'A DLP rule'
    ),
    correct: ['a'],
    explanation: 'Custom detection rules promote a hunting query to scheduled detections that create alerts and incidents in Defender XDR. Power Automate alone, retention, and DLP do not produce SOC alerts.',
    references: [REF_HUNTING]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A small subset of devices remains unmanaged. You want Defender for Endpoint to discover them via network signals from managed devices on the same subnet. Which feature provides this?',
    options: opts4(
      'Device discovery in Microsoft Defender for Endpoint',
      'Vulnerability assessment baselines',
      'EDR in passive mode',
      'Microsoft Defender Antivirus controlled folder access'
    ),
    correct: ['a'],
    explanation: 'Device discovery in MDE finds unmanaged endpoints visible to onboarded devices and surfaces them in inventory. The other features address vulnerability posture, EDR mode, and ransomware protections respectively.',
    references: [REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Defender Vulnerability Management.',
    options: opts4(
      'It surfaces software vulnerabilities (CVEs) on onboarded devices.',
      'It can recommend security configuration changes (e.g. Microsoft security baselines).',
      'It supports requesting remediation tasks in Microsoft Intune.',
      'It rotates DNS records automatically.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Vulnerability Management surfaces CVEs and security configuration recommendations, and integrates with Intune for remediation tasks. It does not manage DNS records.',
    references: [REF_MDE_TVM]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'A Defender for Endpoint Indicator-of-Compromise (IOC) needs to be applied tenant-wide to block a specific file hash from executing on all onboarded devices. Where do you configure this?',
    options: opts4(
      'Settings > Endpoints > Rules > Indicators in the Microsoft Defender portal',
      'A Conditional Access named location',
      'A Purview retention label',
      'A Microsoft 365 admin center user property'
    ),
    correct: ['a'],
    explanation: 'IOC indicators for files (hashes), IPs, URLs/domains, and certificates are configured under Settings > Endpoints > Rules > Indicators in the Defender portal and applied across onboarded devices. The other options are unrelated.',
    references: [REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ensure that even if a user explicitly extracts an attachment, the file is detonated in a sandbox first. Which Safe Attachments configuration is correct?',
    options: opts4(
      'Set the Safe Attachments policy action to "Dynamic Delivery" (body delivered, attachment delivered after scan) or "Block"',
      'Disable EOP anti-malware',
      'Add the sender to an allow-list',
      'Configure SPF only'
    ),
    correct: ['a'],
    explanation: 'Safe Attachments offers Off / Monitor / Block / Dynamic Delivery / Replace. Dynamic Delivery and Block both ensure detonation before user access. Disabling AM or allow-listing weakens security; SPF doesn\'t inspect attachments.',
    references: [REF_MDO_SAFEATT, REF_MDO]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which feature in Defender for Office 365 protects users from malicious URLs even after delivery, by rewriting links and checking destination reputation at click-time?',
    options: opts4(
      'Safe Links',
      'Safe Attachments',
      'Anti-spam (connection filter)',
      'Outbound spam policy'
    ),
    correct: ['a'],
    explanation: 'Safe Links rewrites and time-of-click-checks URLs in email, Teams, and Office apps. Safe Attachments inspects files. Connection filters and outbound spam policies are about IPs/outbound traffic.',
    references: [REF_MDO_SAFELINK]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A CFO\'s name and look-alike domain are being used in phishing attempts. Which Defender for Office 365 anti-phishing setting is most relevant?',
    options: opts4(
      'Impersonation protection (user and domain) with mailbox-intelligence-based learning',
      'A retention policy on Exchange',
      'A device compliance policy in Intune',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Anti-phishing impersonation protection detects user and domain impersonation and can leverage mailbox intelligence. Retention, Intune compliance, and named locations don\'t address impersonation.',
    references: [REF_MDO_ANTIPHISH, REF_MDO]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want EOP to authenticate outbound mail with DKIM for fabrikam.com. Which step is required after enabling DKIM signing?',
    options: opts4(
      'Publish the two CNAME records (selector1, selector2) for fabrikam.com in your public DNS',
      'Add an A record for the DKIM signing server',
      'Add an SPF record only',
      'Create an MX record to a partner'
    ),
    correct: ['a'],
    explanation: 'Exchange Online provides two CNAME selectors (selector1, selector2) that must be published in public DNS for the custom domain so receivers can validate DKIM signatures. SPF is also recommended but does not enable DKIM.',
    references: [REF_MDO_DKIM]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to detect identity-based attacks against on-premises Active Directory (e.g. NTLM relay, account enumeration). Which deployment is required by Microsoft Defender for Identity?',
    options: opts4(
      'Install the Defender for Identity sensor on each domain controller and (optionally) AD FS / Entra Connect servers',
      'Install the Defender for Endpoint sensor on workstations only',
      'Configure Microsoft Defender for Cloud Apps',
      'Onboard the domain controllers to Microsoft Sentinel only'
    ),
    correct: ['a'],
    explanation: 'Defender for Identity sensors must be installed on domain controllers (and AD FS / Entra Connect when applicable) to read AD traffic and security events. MDE alone, MDCA alone, or Sentinel alone do not provide identity-attack detection on AD.',
    references: [REF_MDI, REF_MDI_SENSOR]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A new SaaS app appears in Defender for Cloud Apps Cloud Discovery with a low compliance score and high data-risk score. Your action is to block its use on managed devices. Which integration accomplishes this?',
    options: opts4(
      'Tag the app as Unsanctioned in Defender for Cloud Apps to integrate with MDE network protection and block access on managed Windows devices',
      'Add the app to Conditional Access as a cloud app to grant access',
      'Apply a retention policy on the app',
      'Set a DLP policy to retain the data'
    ),
    correct: ['a'],
    explanation: 'Tagging an app Unsanctioned causes Defender for Endpoint network protection to block access on managed Windows endpoints. Adding to CA grants, not blocks. Retention and DLP don\'t block app traffic.',
    references: [REF_MDCA, REF_MDCA_DISCOVERY, REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to receive alerts when a user downloads an unusually high volume of files from SharePoint Online in a short time. Which Defender for Cloud Apps policy should you create?',
    options: opts4(
      'An anomaly detection / activity policy (e.g. mass download)',
      'A Conditional Access policy with named location',
      'An EOP outbound spam policy',
      'A Safe Links policy'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud Apps ships built-in anomaly detection (e.g. "Unusual file download") and supports custom activity policies. CA, EOP, and Safe Links don\'t monitor SharePoint download volume.',
    references: [REF_MDCA_POLICY, REF_MDCA]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Where in the Defender portal can an administrator review tenant-wide improvement actions ranked by impact on the security posture (with one-click links to remediation)?',
    options: opts4(
      'Microsoft Secure Score (Exposure management > Secure score)',
      'Audit search',
      'Mail flow rules',
      'Quarantine'
    ),
    correct: ['a'],
    explanation: 'Microsoft Secure Score ranks improvement actions across identity, devices, apps, and data with links to remediate. Audit, mail-flow rules, and quarantine address different needs.',
    references: [REF_SECURE_SCORE]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which mode of Microsoft Defender Antivirus allows a non-Microsoft AV product to be the primary AV, while Defender continues to provide EDR sensor data?',
    options: opts4(
      'Passive mode',
      'Active mode',
      'Block mode',
      'Tamper protection mode'
    ),
    correct: ['a'],
    explanation: 'Passive mode lets a third-party AV be primary while Defender provides EDR telemetry. Active mode is the default primary AV mode. "Block mode" refers to EDR-in-block — a separate feature. Tamper protection is anti-tamper.',
    references: [REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'Automated investigation and response (AIR) in Defender XDR remediates without analyst approval if the automation level is set to which mode?',
    options: opts4(
      'Full automation (remediation actions executed automatically)',
      'Semi — wait for approval on any device',
      'No automated response',
      'Microsoft Sentinel-only'
    ),
    correct: ['a'],
    explanation: 'Full-automation mode executes recommended remediation without explicit analyst approval. Semi modes require approval on at least some actions. "No automated response" disables AIR. Sentinel is a separate SIEM product.',
    references: [REF_MDE_AIR]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Defender for Office 365 preset security policies.',
    options: opts4(
      'They apply Microsoft-recommended settings for EOP and Defender for Office 365 in a single click.',
      'They include Standard and Strict tiers.',
      'They override all custom policies and cannot coexist with them.',
      'They take precedence over policies of lower priority but custom policies can still exist.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Preset policies (Standard/Strict) ship Microsoft-recommended baselines and take precedence according to order of evaluation. They can coexist with custom policies in the same tenant.',
    references: [REF_MDO_PRESET]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A simulated phishing campaign is being planned to assess employee resilience. After users click, you want them to receive a short training module appropriate to the type of phishing. Which feature supports this?',
    options: opts4(
      'Attack simulation training with assigned training modules',
      'Microsoft Defender for Cloud Apps reports',
      'A retention label',
      'A communication compliance policy'
    ),
    correct: ['a'],
    explanation: 'Attack simulation training in Defender for Office 365 assigns training to users who interact with the simulation. The other features address different concerns.',
    references: [REF_MDO_ATTACK_SIM]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which set of records is required to fully authenticate outbound mail from a domain so that recipients can validate spoofing protections (alignment of From: domain)?',
    options: opts4(
      'SPF, DKIM, and DMARC',
      'A only',
      'NS only',
      'PTR only'
    ),
    correct: ['a'],
    explanation: 'SPF lists authorized senders, DKIM signs messages, and DMARC ties the two to the visible From: address and sets policy. A/NS/PTR alone do not authenticate mail.',
    references: [REF_MDO_SPF, REF_MDO_DKIM, REF_MDO_DMARC]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A high-severity alert says "Suspicious PowerShell command line" on a domain controller. Which Microsoft product likely generated this alert and where do you investigate?',
    options: opts4(
      'Microsoft Defender for Identity — investigate in the Defender portal alert + the DC sensor health page',
      'Microsoft Defender for Office 365 — investigate in Outlook',
      'Microsoft Purview Compliance Manager',
      'Microsoft Intune device compliance'
    ),
    correct: ['a'],
    explanation: 'Suspicious PowerShell activity on a DC is a signature DefIdentity / MDE detection; investigation occurs in the Defender portal alert with sensor context. The other products do not detect on-DC PowerShell behavior.',
    references: [REF_MDI, REF_INCIDENTS]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Microsoft Security Exposure Management combines security posture, vulnerabilities, identities, and other signals into prioritized initiatives. Where is it found?',
    options: opts4(
      'Microsoft Defender portal under Exposure management',
      'Microsoft 365 admin center > Health',
      'Microsoft Entra > Identity Protection',
      'Microsoft Purview Audit'
    ),
    correct: ['a'],
    explanation: 'Exposure Management is in the Defender portal under Exposure management. The other options surface different signals (admin-center health, Entra ID Protection, Purview Audit).',
    references: [REF_EXPOSURE]
  },

  // ── Manage compliance by using Microsoft Purview (8) ──
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A regulator requires that you protect documents containing personally identifiable information (PII) at rest and in transit. Which Microsoft Purview capability encrypts the document content and enforces who can decrypt it?',
    options: opts4(
      'Sensitivity labels with encryption enabled',
      'Retention labels',
      'DLP exceptions',
      'Auditing policies'
    ),
    correct: ['a'],
    explanation: 'Sensitivity labels apply encryption (Azure RMS / Purview Information Protection) and define who can read/modify the file. Retention labels manage lifecycle. DLP exceptions allow flows. Audit logs activities.',
    references: [REF_LABELS, REF_LABEL_POLICY]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Purview feature should an investigator use to scan and identify high-risk communications in Teams chats for harassment or threats, with reviewers redacting personal data?',
    options: opts4(
      'Communication compliance',
      'eDiscovery (Standard)',
      'Information Barriers',
      'Insider risk management'
    ),
    correct: ['a'],
    explanation: 'Communication compliance scans Teams/Exchange/Yammer messages for inappropriate content with reviewers and pseudonymization. eDiscovery is for legal investigations. Information Barriers prevent communications. Insider risk monitors behavior, not message content review.',
    references: [REF_COMM_COMPLIANCE]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Purview DLP policies.',
    options: opts4(
      'Policies can target Exchange Online, SharePoint Online, OneDrive for Business, Teams chats, and Windows/macOS endpoints.',
      'Policies can use sensitive information types, sensitivity labels, or trainable classifiers as conditions.',
      'Endpoint DLP can audit and block file activities such as USB copy and cloud upload.',
      'DLP policies bypass auditing by default.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DLP can target multiple workloads, leverages SITs/labels/trainable classifiers, and endpoint DLP can govern USB and cloud-upload actions. DLP activity is logged in the Audit log, not bypassed.',
    references: [REF_DLP, REF_DLP_ENDPOINT]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'A user copies a confidential file to a USB drive. You want the action blocked on managed Windows endpoints while still allowing copies between sanctioned cloud apps. Which feature provides this?',
    options: opts4(
      'Endpoint DLP with the "Copy to USB removable media" activity blocked and sanctioned-cloud apps allowed',
      'A retention policy on the document library',
      'A communication compliance review',
      'Entra Conditional Access named locations'
    ),
    correct: ['a'],
    explanation: 'Endpoint DLP governs activities like "Copy to USB" and supports allow-lists for sanctioned cloud apps/printers. Retention, communication compliance, and named locations address other concerns.',
    references: [REF_DLP_ENDPOINT, REF_DLP]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organization plans to migrate to records management for declaring official corporate records. Which Purview feature should you use to declare items as records, restrict their modification, and apply file-plan metadata?',
    options: opts4(
      'Retention labels with the "Mark items as records" option, published via a file plan',
      'Sensitivity labels with encryption',
      'Communication compliance policies',
      'Defender for Cloud Apps policies'
    ),
    correct: ['a'],
    explanation: 'Records management uses retention labels that declare items as records or regulatory records, with file-plan metadata. Sensitivity labels protect content but do not declare records. Communication compliance and Defender for Cloud Apps are unrelated.',
    references: [REF_RETENTION_LABEL, REF_RETENTION]
  },
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE,
    stem: 'A legal team needs to collect documents from SharePoint, OneDrive, and Exchange that contain the term "Project Atlas" for an investigation. Which Purview tool should they use to scope, search, and export the content?',
    options: opts4(
      'eDiscovery (Premium) case',
      'Content explorer',
      'Activity explorer',
      'Compliance Manager'
    ),
    correct: ['a'],
    explanation: 'eDiscovery (Premium) supports case management, advanced collection, review sets, analytics, and export — the full investigation workflow. Content/Activity explorers are for posture, not investigations. Compliance Manager is a scoring tool.',
    references: [REF_EDISCOVERY_PREM, REF_EDISCOVERY]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a sensitivity label to grant Read-only permission to all employees but allow co-authoring for the Finance team. Which capability of sensitivity labels provides this?',
    options: opts4(
      'Encryption permissions configured per user/group',
      'A retention period setting',
      'Endpoint DLP rules',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Sensitivity-label encryption supports assigning permissions (Co-Author, Reviewer, Viewer, etc.) per user or group. Retention is lifecycle. Endpoint DLP governs activities. CA is sign-in conditioning.',
    references: [REF_LABELS, REF_LABEL_POLICY]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to integrate HR signals so that data-exfiltration risk scoring increases for employees who have submitted a resignation. Which Microsoft Purview feature uses HR connectors?',
    options: opts4(
      'Insider risk management (using HR data connector)',
      'eDiscovery (Standard)',
      'Compliance Manager assessments',
      'Audit search'
    ),
    correct: ['a'],
    explanation: 'Insider risk management consumes HR signals through a data connector (resignation date, termination date, level) to enrich risk scoring. The other features don\'t take HR feeds.',
    references: [REF_INSIDER, REF_INSIDER_POLICY]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Deploy and manage a Microsoft 365 tenant (18) ──
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to add the second custom domain northwind.com to a tenant that already hosts contoso.com. Which statement about multi-domain Microsoft 365 tenants is correct?',
    options: opts4(
      'A single tenant can host multiple verified custom domains, and any verified domain can be set as the user\'s primary SMTP suffix',
      'Only one custom domain is supported per tenant',
      'You must create a separate tenant for each domain',
      'Domain verification can be skipped if MX is configured first'
    ),
    correct: ['a'],
    explanation: 'Tenants support multiple verified custom domains, and per-user UPN/primary-SMTP can use any of them. You don\'t need a tenant per domain. Verification is required before mail flow can be configured.',
    references: [REF_M365_DOMAIN]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'A regional IT team should be able to manage all settings of users located in the Singapore administrative unit, including unit-restricted password reset, but only within Singapore. Which role and scope are correct?',
    options: opts4(
      'Assign the User Administrator role at the Singapore administrative unit scope',
      'Assign Global Administrator with no scope',
      'Assign Reports Reader at the tenant scope',
      'Assign Authentication Administrator at the tenant scope'
    ),
    correct: ['a'],
    explanation: 'Administrative-unit-scoped User Administrator restricts user-management actions to the unit. Global Administrator is unscoped; Reports Reader is read-only; tenant-wide Authentication Administrator exceeds scope.',
    references: [REF_ADMIN_UNITS, REF_ENTRA_ROLES]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You purchased Microsoft 365 E5 licenses for 200 users. Which is the MOST efficient way to assign licenses to all 200 at once?',
    options: opts4(
      'Group-based licensing on a Microsoft Entra security group containing the 200 users',
      'Per-user assignment through PowerShell one user at a time',
      'A device compliance policy',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Group-based licensing scales bulk assignment with simple membership management. Per-user PowerShell is feasible but error-prone. Compliance policies and named locations have nothing to do with licensing.',
    references: [REF_M365_GROUP_LIC]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to receive critical Message center posts directly in Outlook (via the Microsoft 365 admin app or email). Which configuration enables this?',
    options: opts4(
      'Configure Message center preferences > email notifications and select the desired services',
      'Enable inbox rules for an internal mailbox',
      'Configure a retention label',
      'Disable Service health'
    ),
    correct: ['a'],
    explanation: 'Message center preferences let you choose who receives email digests of posts and which services to include. Inbox rules don\'t generate Message center notifications.',
    references: [REF_M365_MSG]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft 365 Apps for enterprise deployments.',
    options: opts4(
      'The Office Deployment Tool (ODT) uses an XML configuration to install specific products, languages, and update channels.',
      'Microsoft 365 Apps admin center can author configuration XML and assign deployment groups.',
      'Microsoft 365 Apps installs are not affected by the chosen update channel after install.',
      'A serviceing profile can pin a specific build to a deployment ring.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'ODT + XML, the Apps admin center, and servicing profiles are all standard tools. The chosen update channel determines ongoing update behavior — it absolutely affects post-install servicing.',
    references: [REF_M365_APPS, REF_M365_APPS_CHANNELS, REF_M365_APPS_ADMIN]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to onboard 1,000 Windows 11 devices via Autopilot but pre-stage the OS image and apps with an IT technician so end users receive a near-ready device when they sign in. Which Autopilot mode meets this?',
    options: opts4(
      'Pre-provisioning (formerly white glove)',
      'User-driven mode without pre-provisioning',
      'Self-deploying mode',
      'Existing devices reset'
    ),
    correct: ['a'],
    explanation: 'Pre-provisioning lets IT pre-stage OS/apps/policies, so end-user sign-in is fast. User-driven without pre-provisioning leaves all setup until user sign-in. Self-deploying has no user. Reset targets enrolled devices.',
    references: [REF_AUTOPILOT, REF_INTUNE_ENROLL]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'When configuring Intune to be the MDM authority for Windows auto-enrollment of Entra-joined devices, which two licensing conditions must be met?',
    options: opts4(
      'Users must hold a license that includes Intune, and the MDM/MAM user scope under Entra ID > Mobility must include them',
      'Users must be guests (B2B)',
      'Users must be assigned a Power BI Pro license',
      'Devices must be domain-joined to a partner tenant'
    ),
    correct: ['a'],
    explanation: 'Auto-enrollment requires users to be in the Mobility MDM user scope and to be licensed for Intune. Guest users, Power BI, and partner-tenant domain join are unrelated.',
    references: [REF_INTUNE_ENROLL, REF_INTUNE]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to require devices to be marked compliant before they can access Exchange Online and SharePoint Online. Where do you enforce this?',
    options: opts4(
      'A Conditional Access policy with the grant control "Require device to be marked as compliant"',
      'A retention policy',
      'A DLP policy',
      'A communication compliance policy'
    ),
    correct: ['a'],
    explanation: 'CA enforces device-compliance requirements as a grant control. Retention, DLP, and communication compliance address content concerns, not access conditions.',
    references: [REF_CA, REF_INTUNE_COMPLIANCE]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'Some of your tenant\'s users routinely need administrative actions that exceed a delegated User Administrator. To grant just-in-time access, scoped to a single task, with approval and break-glass review, you should configure ____.',
    options: opts4(
      'Microsoft Entra Privileged Identity Management (PIM) with approval-required activation',
      'Per-user MFA',
      'Group-based licensing',
      'Insider risk management'
    ),
    correct: ['a'],
    explanation: 'PIM is the canonical Entra solution for just-in-time, scoped, approval-required role activation with audit. The other options solve different problems.',
    references: [REF_PIM]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'A new partner needs read-only access to a single SharePoint site without becoming a Global Reader. Which approach satisfies least privilege?',
    options: opts4(
      'Invite the partner as a Microsoft Entra B2B guest and grant SharePoint site permissions only',
      'Grant Global Reader to the partner',
      'Add the partner as a domain administrator on-premises',
      'Create a service principal'
    ),
    correct: ['a'],
    explanation: 'B2B guest + site-only SharePoint permissions is the minimal grant. Global Reader is tenant-wide read. On-prem admin and service principals address different scenarios.',
    references: [REF_B2B, REF_ENTRA_ROLES]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'Your Microsoft 365 tenant has 50 users with the Global Administrator role. Microsoft recommends what for production hygiene?',
    options: opts4(
      'Limit Global Administrators to fewer than 5 active accounts plus at least 2 break-glass accounts; use PIM eligibility for additional administrators',
      'Add every Active Directory user as a Global Administrator',
      'Disable MFA on all Global Administrators',
      'Remove all admin roles entirely'
    ),
    correct: ['a'],
    explanation: 'Microsoft recommends keeping Global Administrator counts very low, using PIM eligibility for others, and having 2+ emergency-access accounts. The other options violate basic security guidance.',
    references: [REF_M365_ROLES, REF_PIM]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'A specific employee\'s onmicrosoft.com account must be temporarily blocked because they are on extended leave, but their mailbox needs to remain intact for delegated access. Which action(s) should you take?',
    options: opts4(
      'Block sign-in on the user (Sign-in blocked) while keeping the mailbox license assigned',
      'Delete the user',
      'Remove their license and delete the mailbox',
      'Make the account a Global Administrator'
    ),
    correct: ['a'],
    explanation: 'Blocking sign-in prevents access while preserving mailbox/licensing. Deleting the user removes the mailbox. Removing the license starts a retention timer. Making them a Global Admin is the opposite of the goal.',
    references: [REF_M365_ROLES, REF_ENTRA_USERS]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'A reseller manages 30 SMB tenants and wants to apply a baseline policy (security defaults, MFA) consistently across them. Which Microsoft 365 service provides multi-tenant baseline configurations to partners?',
    options: opts4(
      'Microsoft 365 Lighthouse',
      'Microsoft Entra Connect Health',
      'Microsoft Sentinel',
      'Microsoft Defender for Cloud'
    ),
    correct: ['a'],
    explanation: 'Lighthouse provides multi-tenant baseline configuration and posture management for partners managing SMB tenants. The others are not multi-tenant management.',
    references: [REF_M365_TENANTS]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.SINGLE,
    stem: 'You\'ve assigned the SharePoint Administrator role to a user. Which Microsoft 365 admin centers can they manage by default?',
    options: opts4(
      'The SharePoint admin center, and they have access to view related Microsoft 365 admin center info, but cannot manage Exchange or Teams unless granted additional roles',
      'All admin centers',
      'Only the Microsoft 365 admin center home page',
      'Only the Defender portal'
    ),
    correct: ['a'],
    explanation: 'SharePoint Administrator manages SharePoint and OneDrive workloads. Cross-workload management requires additional role grants. Other answers misstate the scope.',
    references: [REF_M365_ROLES, REF_ENTRA_ROLES]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to track who, when, and what was changed in tenant administration (license assignment, role grants). Where in Microsoft 365 should you look?',
    options: opts4(
      'Microsoft Purview Audit log search',
      'Service health',
      'Quarantine',
      'Defender for Cloud Apps file policies'
    ),
    correct: ['a'],
    explanation: 'Purview Audit captures admin actions across the tenant. Service health shows incidents; quarantine is mail; file policies are SaaS content controls.',
    references: [REF_AUDIT]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to give all developers access to Microsoft 365 admin center > Marketplace to install integration apps, but not to manage anything else. Which approach is correct?',
    options: opts4(
      'Assign the appropriate granular role (e.g. Cloud Application Administrator) only to developers needing the capability',
      'Make every developer a Global Administrator',
      'Block sign-ins for developers',
      'Apply a retention policy to developers'
    ),
    correct: ['a'],
    explanation: 'Use a granular role like Cloud Application Administrator (or Application Administrator) per least-privilege. Global Administrator is excessive; blocking and retention don\'t address the requirement.',
    references: [REF_ENTRA_ROLES, REF_M365_ROLES]
  },
  {
    domain: TENANT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Intune feature lets you target the same configuration profile to two different platforms (Windows and macOS) at once if the settings happen to overlap?',
    options: opts4(
      'Settings catalog (profile templates per platform — you configure one profile per platform but can copy settings between)',
      'A single multi-platform profile that applies to every OS',
      'A retention policy',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Intune profiles are per platform; the Settings catalog supports rich per-platform configuration and you typically create a profile per platform. There is no single multi-OS configuration profile.',
    references: [REF_INTUNE_CONFIG, REF_INTUNE]
  },
  {
    domain: TENANT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Entra Cloud Sync versus Microsoft Entra Connect Sync.',
    options: opts4(
      'Cloud Sync uses lightweight agents that communicate outbound to Entra ID.',
      'Cloud Sync is best for multiple disconnected forests and simpler deployments.',
      'Entra Connect Sync supports more advanced sync scenarios such as device write-back and group write-back.',
      'Both Cloud Sync and Entra Connect Sync require ADFS to function.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Cloud Sync uses outbound-only agents and is best for simpler/multi-forest scenarios; Connect Sync supports advanced scenarios. Neither requires ADFS — federation is a separate, optional authentication choice.',
    references: [REF_ENTRA_CLOUD_SYNC, REF_ENTRA_CONNECT_SYNC, REF_FEDERATION]
  },

  // ── Implement and manage Microsoft Entra identity and access (18) ──
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You created a Conditional Access policy in "Report-only" mode targeting all users. After 48 hours of insights, you want to start enforcing it. Which step is required?',
    options: opts4(
      'Change the policy state from Report-only to On',
      'Delete and recreate the policy',
      'Add the policy to a retention label',
      'Re-register all devices'
    ),
    correct: ['a'],
    explanation: 'Setting the policy state to "On" enforces it. Report-only logs what would have happened. Deleting and recreating is unnecessary. Retention and re-registration are unrelated.',
    references: [REF_CA, REF_CA_REQ]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You suspect that a previously synchronized on-premises user is no longer being updated to Entra ID. What is the FIRST place to check the synchronization state?',
    options: opts4(
      'Microsoft Entra Connect Health (or Entra Connect agent / portal) for sync errors and last sync timestamp',
      'Microsoft Defender XDR incidents',
      'Microsoft Purview Audit',
      'Conditional Access insights'
    ),
    correct: ['a'],
    explanation: 'Entra Connect Health (or the Entra ID > Microsoft Entra Connect blade) surfaces sync agent health, latest sync timestamps, and per-object errors. The others address security incidents, audit, and CA policy results.',
    references: [REF_ENTRA_CONNECT, REF_ENTRA_CONNECT_SYNC]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Conditional Access grant control offers the FASTEST sign-in experience while still enforcing MFA for users who already authenticated with phishing-resistant methods?',
    options: opts4(
      'Authentication Strengths — Phishing-resistant MFA',
      'Per-user MFA',
      'Security defaults',
      'Sign-in frequency = always'
    ),
    correct: ['a'],
    explanation: 'Authentication strengths can require phishing-resistant MFA (FIDO2, Windows Hello, certificate-based) — fastest in practice. Per-user MFA prompts always. Security defaults are broad. Sign-in frequency=always forces frequent re-prompts.',
    references: [REF_CA, REF_AUTH_METHODS, REF_PASSWORDLESS]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Entra group types.',
    options: opts4(
      'Security groups can have assigned or dynamic membership.',
      'Microsoft 365 groups create a shared mailbox, calendar, SharePoint site, and Teams team.',
      'Distribution groups can be used for Conditional Access targeting.',
      'A group can host nested group assignments depending on type.'
    ),
    correct: ['a', 'b'],
    explanation: 'Security groups support both membership models; M365 groups provision shared resources. Distribution groups cannot be CA targets (CA targets security groups and M365 groups). Nesting is limited and not universally supported.',
    references: [REF_ENTRA_GROUPS, REF_DYN_GROUPS, REF_CA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A user travels to a country where the company has never had an employee. Sign-ins from there should be blocked unless approved. Which Conditional Access condition should you use?',
    options: opts4(
      'Locations condition with the country added to a "Blocked countries" named location',
      'Device platform = Windows',
      'Risk = none',
      'Application = Microsoft Teams'
    ),
    correct: ['a'],
    explanation: 'Named locations support country/region and can be combined with a Block grant control. Device platform, risk, and a single application don\'t represent geography.',
    references: [REF_NAMED_LOC, REF_CA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to prevent users from registering for SSPR with security questions, while keeping authenticator-app and SMS as registration options. Where do you configure this?',
    options: opts4(
      'Authentication methods policy in Microsoft Entra ID',
      'A retention policy in Purview',
      'A Defender for Endpoint policy',
      'A communication compliance policy'
    ),
    correct: ['a'],
    explanation: 'Authentication methods policy enables/disables registration methods. The other features are unrelated to authentication-method registration.',
    references: [REF_AUTH_METHODS, REF_SSPR]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Entra ID Protection report shows users currently at risk and the recommended remediation (e.g. confirm safe, force password change)?',
    options: opts4(
      'Risky users report',
      'Sign-in logs in Microsoft 365 admin center',
      'Conditional Access insights only',
      'Audit log in Purview'
    ),
    correct: ['a'],
    explanation: 'The Risky users report enumerates risky users with risk state and recommended actions. Sign-in logs, CA insights, and Purview Audit don\'t consolidate user risk this way.',
    references: [REF_IDPROTECT, REF_IDPROTECT_RISK]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A consultant needs admin rights for one specific Azure subscription, but should have no permissions in Microsoft 365 or Entra ID. Which best matches their need?',
    options: opts4(
      'Azure RBAC role (e.g. Contributor) on that subscription only — no Entra role assigned',
      'Global Administrator in Entra ID',
      'Microsoft Entra Application Administrator',
      'Microsoft 365 Service Administrator'
    ),
    correct: ['a'],
    explanation: 'Azure resource roles (RBAC) are independent of Entra ID directory roles. Assigning Contributor at the subscription gives them what they need without Entra rights. The other options grant rights they don\'t need.',
    references: [REF_ENTRA_ROLES, REF_PIM]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which feature lets an administrator decide who can invite external guests to the Microsoft Entra tenant?',
    options: opts4(
      'External collaboration settings in Microsoft Entra (Guest invite settings)',
      'A retention policy',
      'Tenant access policies',
      'Microsoft Entra Connect Health alerts'
    ),
    correct: ['a'],
    explanation: 'External collaboration settings define who can invite guests. The other options either do not exist (tenant access policies) or address different concerns.',
    references: [REF_B2B, REF_ENTRA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to allow a Microsoft Authenticator passwordless sign-in for users who only have iOS devices. Which authentication method policy must be enabled?',
    options: opts4(
      'Microsoft Authenticator (passwordless sign-in) under Authentication methods policy',
      'OATH hardware tokens only',
      'Security questions only',
      'Phone number sign-in by SMS'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Authenticator passwordless option must be enabled and scoped to the user group in the Authentication methods policy. SMS, OATH tokens, and security questions are different methods.',
    references: [REF_PASSWORDLESS, REF_AUTH_METHODS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managers to be able to grant temporary access packages (containing Teams + SharePoint + group memberships) to contractors with an automated approval workflow. Which Microsoft Entra feature should you use?',
    options: opts4(
      'Entitlement management access packages',
      'Conditional Access',
      'Microsoft Defender for Cloud Apps',
      'Self-service password reset'
    ),
    correct: ['a'],
    explanation: 'Entitlement management bundles resources into access packages with approval workflows and time-bound assignments. CA gates sign-ins, MDCA governs SaaS, SSPR resets passwords.',
    references: [REF_ENTITLEMENT, REF_ACCESS_REVIEW]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to ensure that on-premises AD service accounts cannot be used to sign in to cloud apps even if synchronized. Which is the most appropriate approach?',
    options: opts4(
      'Use the cloudFiltered attribute to exclude the service-account OU or specific accounts from synchronization to Entra ID',
      'Assign them all the Global Administrator role',
      'Apply a sensitivity label to the accounts',
      'Add them to Conditional Access as targets and block them — but this still allows sign-in attempts'
    ),
    correct: ['a'],
    explanation: 'Filtering OUs / specific accounts from sync ensures they don\'t exist in Entra ID. Blocking via CA is reactive; granting Global Admin is the opposite of the goal; sensitivity labels are for content protection.',
    references: [REF_ENTRA_CONNECT, REF_ENTRA_CONNECT_SYNC]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want every external Microsoft Entra B2B guest to be reviewed for continued business need every 90 days, with the inviter (sponsor) as the reviewer. Which feature satisfies the requirement?',
    options: opts4(
      'A recurring access review on Guest users with reviewer = "user\'s manager or sponsor"',
      'A Conditional Access policy with sign-in frequency = 90 days',
      'Microsoft Entra B2B direct connect',
      'A retention label on guest user objects'
    ),
    correct: ['a'],
    explanation: 'Access reviews can specifically target guest users and use the sponsor or manager as the reviewer on a recurring schedule. CA sign-in frequency forces a re-prompt but does not review need; B2B direct connect is a Teams feature; retention labels target content.',
    references: [REF_ACCESS_REVIEW, REF_B2B]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'In Microsoft Entra, you want non-admin end users to be prevented from consenting to third-party OAuth apps that request high-risk Microsoft Graph permissions, while still allowing a security admin to approve them. Which configuration enforces this?',
    options: opts4(
      'User consent settings = "Do not allow user consent" combined with an admin consent request workflow',
      'Block sign-ins for non-admins',
      'Disable Conditional Access',
      'Add all third-party apps to a Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'User consent settings can disable user consent entirely (or limit it to verified publishers/low-risk perms); admin consent workflow lets users request approval. Blocking sign-ins is excessive; CA named locations are network IP scopes.',
    references: [REF_ENTRA, REF_ENTRA_ROLES]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports their Microsoft Entra account was locked after a series of bad passwords. The IT team wants to confirm this was a real lockout and not a sign-in failure. Where should they investigate?',
    options: opts4(
      'Microsoft Entra > Monitoring > Sign-in logs (filter on the user and check the error code, e.g. AADSTS50053 / smart lockout)',
      'Microsoft 365 admin center > Reports > Usage',
      'A Conditional Access named location',
      'Defender for Office 365 quarantine'
    ),
    correct: ['a'],
    explanation: 'Entra sign-in logs include status codes and errors that distinguish bad password from smart-lockout (e.g. AADSTS50053). Usage reports, named locations, and MDO quarantine do not surface auth-error details.',
    references: [REF_ENTRA, REF_IDPROTECT]
  },
  {
    domain: IDENTITY, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Entra ID Protection setting governs the minimum risk level at which a sign-in is automatically blocked or required to reauthenticate, and what licensing is required to use these risk-based Conditional Access policies?',
    options: opts4(
      'The sign-in risk and user risk policies expose thresholds (low/medium/high) and require Microsoft Entra ID P2 licensing per affected user',
      'Per-user MFA controls the threshold, and licensing is included with all Microsoft 365 tenants',
      'Security defaults expose risk thresholds for free',
      'A retention policy controls the threshold'
    ),
    correct: ['a'],
    explanation: 'Risk-based CA uses ID Protection signal at low/medium/high thresholds and requires Entra ID P2 licensing per affected user. Per-user MFA, security defaults, and retention policies do not expose risk thresholds.',
    references: [REF_IDPROTECT, REF_IDPROTECT_RISK, REF_CA]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a Microsoft Entra group whose membership is automatically populated from on-premises Active Directory through Microsoft Entra Connect Sync. Where is the source-of-authority for membership in this scenario?',
    options: opts4(
      'On-premises Active Directory — membership changes occur there and sync to Entra ID; you cannot edit the synced group\'s membership directly in Entra ID',
      'Microsoft Entra ID — changes happen there and write back to AD via Entra Connect',
      'Microsoft Intune device groups',
      'Microsoft 365 admin center Groups blade'
    ),
    correct: ['a'],
    explanation: 'For groups synced via Entra Connect Sync, on-premises AD is the source of authority for membership. Group write-back is supported only in limited scenarios. Intune device groups and the admin-center Groups blade do not own synced-group membership.',
    references: [REF_ENTRA_CONNECT, REF_ENTRA_CONNECT_SYNC, REF_ENTRA_GROUPS]
  },
  {
    domain: IDENTITY, difficulty: 2, type: QType.SINGLE,
    stem: 'Your security team wants a Conditional Access policy to be deployed but only to a small pilot user group while the rest of the tenant continues unaffected. Which targeting approach is recommended?',
    options: opts4(
      'Set the policy to "On" but scope Users and groups = Include = the pilot security group, Exclude = break-glass accounts',
      'Apply the policy in Report-only mode to all users indefinitely',
      'Set the policy to Off and ask the pilot users to sign in manually',
      'Disable Microsoft Entra ID for non-pilot users'
    ),
    correct: ['a'],
    explanation: 'Including only the pilot group (and excluding break-glass accounts) is the recommended controlled rollout pattern. Report-only never enforces; Off does nothing; disabling Entra ID is destructive.',
    references: [REF_CA, REF_CA_REQ]
  },

  // ── Manage security and threats by using Microsoft Defender XDR (21) ──
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An analyst is reviewing an Incident in Defender XDR. They want to take a containment action like isolating a device, stopping a process, or disabling a user account directly from the incident page. Which capability provides this?',
    options: opts4(
      'Response actions (live response and one-click remediation) integrated into the incident page',
      'Mail flow rules',
      'Retention policies',
      'Group-based licensing'
    ),
    correct: ['a'],
    explanation: 'Response actions and live response are exposed from incident and entity pages in the Defender portal. Mail flow, retention, and licensing are not response controls for endpoints/identities.',
    references: [REF_XDR, REF_INCIDENTS, REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'Microsoft Defender for Endpoint plan 2 (P2) adds which capability over plan 1 (P1)?',
    options: opts4(
      'Endpoint Detection and Response (EDR), advanced hunting, threat experts, and automated investigation',
      'Anti-malware only',
      'Conditional Access enforcement',
      'Microsoft 365 admin center read-only view'
    ),
    correct: ['a'],
    explanation: 'MDE P2 includes EDR, advanced hunting, threat experts (now Defender Experts), and AIR — beyond the prevention focus of P1. CA and admin-center access are separate functions.',
    references: [REF_MDE, REF_HUNTING, REF_MDE_AIR]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Microsoft Defender Antivirus capability protects user folders (Documents, Pictures) from unauthorized modification — a key defense against ransomware encryption?',
    options: opts4(
      'Controlled folder access',
      'EDR in block mode',
      'ASR rule: Block credential stealing from the Local Security Authority subsystem',
      'Tamper protection'
    ),
    correct: ['a'],
    explanation: 'Controlled folder access protects designated folders from changes by unauthorized apps — the textbook ransomware defense. The others address different attack surfaces.',
    references: [REF_MDE_ASR, REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Defender for Office 365 Safe Links.',
    options: opts4(
      'Safe Links rewrites URLs in messages so they pass through Microsoft scanning at click-time.',
      'Safe Links also protects URLs inside Microsoft Teams chats and Office apps when configured.',
      'Safe Links runs only at the time of message delivery.',
      'A Safe Links policy can be scoped to specific recipients/domains.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Safe Links rewrites and time-of-click-protects URLs across Outlook, Teams, and Office, and can be scoped by recipient. It does NOT only run at delivery — its value is real-time scanning at click time.',
    references: [REF_MDO_SAFELINK]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'Your CISO wants every email containing executable attachments to be detonated before delivery, even at the cost of slight delivery delays. Which Safe Attachments action best implements this requirement?',
    options: opts4(
      'Block (do not deliver until scan complete)',
      'Off',
      'Monitor (deliver and log)',
      'Replace (deliver placeholder)'
    ),
    correct: ['a'],
    explanation: 'Block holds the message until detonation finishes — strongest protection at the cost of delay. Off/Monitor/Replace either skip scanning or deliver placeholders.',
    references: [REF_MDO_SAFEATT]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC analyst wants to perform a real-time interactive remote shell on a compromised device. Which Defender for Endpoint capability supports this?',
    options: opts4(
      'Live response',
      'Vulnerability Management',
      'Attack simulation training',
      'Conditional Access'
    ),
    correct: ['a'],
    explanation: 'Live response provides an interactive shell on the device, allowing analysts to gather evidence and remediate. The others address different scopes.',
    references: [REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to alert on a non-standard scenario: a high number of multifactor-prompt failures followed by a successful sign-in from the same user. Which Defender XDR capability should you use to author the detection?',
    options: opts4(
      'Custom detection rule on advanced hunting',
      'A retention policy',
      'A DLP rule',
      'A communication compliance review'
    ),
    correct: ['a'],
    explanation: 'A custom detection rule built on a KQL hunting query alerts on the exact pattern. Retention, DLP, and communication compliance are unrelated.',
    references: [REF_HUNTING]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Defender for Endpoint device is in compliance with all policies, but the SOC wants to test a new attack-surface-reduction rule before forcing it. Which mode should they choose?',
    options: opts4(
      'Audit mode — events are logged without blocking, so analysts can validate impact before switching to Block',
      'Off mode',
      'Warn mode',
      'Block immediately'
    ),
    correct: ['a'],
    explanation: 'Audit mode logs but does not block — perfect for safe rollout. Off mode does nothing. Warn prompts the user. Blocking immediately risks breaking apps.',
    references: [REF_MDE_ASR]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to publish a DMARC TXT record for fabrikam.com with strict alignment and 100% policy enforcement. Which DMARC tag value enforces "reject"?',
    options: opts4(
      'p=reject',
      'p=none',
      'p=quarantine',
      'p=monitor'
    ),
    correct: ['a'],
    explanation: 'DMARC tag p=reject instructs recipients to reject unauthenticated messages. p=none monitors; p=quarantine sends to junk; p=monitor is not a valid DMARC value.',
    references: [REF_MDO_DMARC]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'A Microsoft Defender for Identity alert mentions "Suspicious LDAP enumeration". This signal originates from which sensor placement?',
    options: opts4(
      'The Defender for Identity sensor installed on domain controllers',
      'The Microsoft Defender for Endpoint agent on a workstation',
      'The Defender for Office 365 connector',
      'The Microsoft 365 admin center service health'
    ),
    correct: ['a'],
    explanation: 'MDI sensors on DCs see LDAP traffic and emit on-prem identity-attack alerts. MDE focuses on endpoints, MDO on mail, and admin-center health on incidents.',
    references: [REF_MDI, REF_MDI_SENSOR]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Defender for Cloud Apps feature lets you analyze user consent grants to third-party OAuth apps and revoke risky ones from the Defender portal?',
    options: opts4(
      'OAuth app governance (App governance / App management)',
      'Cloud Discovery upload',
      'Conditional Access App Control',
      'File policies'
    ),
    correct: ['a'],
    explanation: 'OAuth app governance reviews consented OAuth apps and supports revocation. Cloud Discovery is for shadow IT logs. CA App Control is session control. File policies inspect file content.',
    references: [REF_MDCA, REF_MDCA_POLICY]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ensure that anti-spam policies in EOP send spoofed messages to the recipient\'s Junk Email folder (not quarantine) so users can recover them faster. Which setting handles this?',
    options: opts4(
      'Anti-spam policy action for "Spoofed sender" or "Phishing" set to "Move message to Junk Email folder"',
      'A retention policy',
      'A Conditional Access named location',
      'A DLP rule'
    ),
    correct: ['a'],
    explanation: 'Anti-spam policy actions can move to junk, quarantine, redirect, or NDR. The others do not control mail action.',
    references: [REF_ANTISPAM, REF_EOP]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'You want endpoint protection to automatically block malware as soon as it\'s detected (not just alert). Which Defender for Endpoint feature provides this for processes that EDR identifies as malicious?',
    options: opts4(
      'EDR in block mode',
      'Audit mode',
      'Passive AV mode',
      'Tamper protection'
    ),
    correct: ['a'],
    explanation: 'EDR in block mode lets EDR remediate detected post-breach threats. Audit mode logs only. Passive AV is for third-party AV. Tamper protection prevents AV settings from being altered.',
    references: [REF_MDE]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports legitimate mail keeps being quarantined as phishing. Which is the recommended Microsoft path to investigate and adjust?',
    options: opts4(
      'Use Submissions in the Defender portal to submit the message and adjust anti-phish/SCL settings as needed',
      'Delete the user account',
      'Open a Microsoft Entra incident',
      'Apply a Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Submissions in the Defender portal report false positives and feed Microsoft\'s detection. Deleting accounts, Entra incidents, and CA named locations are unrelated remedies.',
    references: [REF_MDO_QUARANTINE, REF_MDO]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Defender for Cloud Apps Conditional Access App Control session policies.',
    options: opts4(
      'They route user sessions through Defender for Cloud Apps reverse proxy for inspection.',
      'They can block file download from unmanaged devices while still allowing read in the browser.',
      'They can apply sensitivity labels to documents downloaded.',
      'They replace the need for Microsoft Entra Conditional Access policies.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'CA App Control routes sessions for inline inspection, supports block-download and label-on-download policies. It complements — not replaces — Conditional Access (which must invoke it).',
    references: [REF_MDCA, REF_MDCA_POLICY, REF_CA]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Where can administrators view security recommendations to improve their organization\'s posture and track the impact of each recommendation on the overall score?',
    options: opts4(
      'Microsoft Secure Score in the Defender portal',
      'Microsoft Entra ID Protection only',
      'Microsoft Purview Audit',
      'Microsoft 365 admin center > Setup'
    ),
    correct: ['a'],
    explanation: 'Microsoft Secure Score is the centralized recommendations and posture-tracking dashboard. ID Protection is risk-focused. Purview Audit is for activities. M365 admin center Setup is initial setup tasks.',
    references: [REF_SECURE_SCORE]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'A security baseline assessment in Defender Vulnerability Management compares device configurations against which standards?',
    options: opts4(
      'Industry benchmarks (e.g. CIS) and Microsoft security baselines (e.g. Microsoft 365 Apps and Windows)',
      'Only PCI-DSS scoring',
      'Only Microsoft Entra group memberships',
      'Only the Microsoft 365 admin center user list'
    ),
    correct: ['a'],
    explanation: 'Security baselines assessment compares device settings against CIS and Microsoft baselines. PCI-DSS is one of many possible frameworks but is not the dedicated assessment source. Entra group lists are not device-config baselines.',
    references: [REF_MDE_TVM]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft 365 capability lets you simulate a phishing campaign that uses a "credential harvest" payload and tracks user click rates and credential submissions?',
    options: opts4(
      'Attack simulation training in Defender for Office 365',
      'Microsoft Entra ID Protection sign-in risk',
      'Microsoft Defender for Cloud Apps',
      'Microsoft Purview DLP simulation mode'
    ),
    correct: ['a'],
    explanation: 'Attack simulation training supports multiple payloads including credential harvest and reports user behavior. The other options either don\'t simulate phishing or don\'t track click rates.',
    references: [REF_MDO_ATTACK_SIM]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'Which set of products are unified in Microsoft Defender XDR for cross-product incident correlation?',
    options: opts4(
      'Defender for Endpoint, Defender for Office 365, Defender for Identity, Defender for Cloud Apps',
      'Microsoft 365 Apps, Power BI, Power Automate, OneDrive',
      'Microsoft Entra Connect, AD FS, Microsoft Authenticator, FIDO2 keys',
      'SharePoint, Teams, Forms, Lists'
    ),
    correct: ['a'],
    explanation: 'Microsoft Defender XDR (formerly Microsoft 365 Defender) correlates incidents across Defender for Endpoint, Office 365, Identity, and Cloud Apps. The other groupings are unrelated.',
    references: [REF_XDR, REF_XDR_PORTAL]
  },
  {
    domain: DEFENDER, difficulty: 3, type: QType.SINGLE,
    stem: 'A user receives a phishing email that bypassed your filters. ZAP retroactively detects the message as malicious. What is the BEST outcome ZAP performs?',
    options: opts4(
      'It moves the message from the user\'s mailbox to quarantine after delivery (retroactive purge)',
      'It revokes the user\'s license',
      'It deletes the user account',
      'It rotates the tenant DKIM keys'
    ),
    correct: ['a'],
    explanation: 'Zero-hour Auto Purge moves messages to quarantine after delivery as new signal arrives. The other actions are not part of ZAP.',
    references: [REF_MDO, REF_MDO_SAFELINK]
  },
  {
    domain: DEFENDER, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ensure that anti-malware on Exchange Online inspects messages for both file content and known patterns. Which EOP policy must be enabled?',
    options: opts4(
      'Anti-malware policy (default policy or custom)',
      'A retention policy',
      'A Conditional Access named location',
      'A DLP allow list'
    ),
    correct: ['a'],
    explanation: 'EOP anti-malware policy inspects messages for malware patterns and known dangerous file types. Retention, named locations, and DLP allow-lists do not perform malware detection.',
    references: [REF_ANTIMAL, REF_EOP]
  },

  // ── Manage compliance by using Microsoft Purview (8) ──
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to detect and warn users (without blocking) when they share a document containing U.S. SSNs in OneDrive externally. Which Purview policy action should you use?',
    options: opts4(
      'A DLP policy with the "Notify users only" action (policy tip) and no block',
      'A retention policy delete-only',
      'Information barriers segment',
      'Compliance Manager improvement action'
    ),
    correct: ['a'],
    explanation: 'DLP policies offer "Notify users only" tips and "Restrict access" actions. Retention is lifecycle; information barriers prevent communication; Compliance Manager scores frameworks.',
    references: [REF_DLP, REF_DLP_POLICY]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'Your sensitivity-label taxonomy has "Public, General, Confidential, Highly Confidential". You want Confidential to allow Co-Authoring by employees and Highly Confidential to block external sharing. Which capability covers BOTH controls?',
    options: opts4(
      'Encryption permissions in the sensitivity label, plus integration with DLP for sharing prevention on Highly Confidential',
      'A communication compliance policy',
      'An information barrier policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Sensitivity-label encryption controls intra-label permissions; DLP rules referencing the label can prevent external sharing of labeled content. Other features address different concerns.',
    references: [REF_LABELS, REF_DLP_POLICY]
  },
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE,
    stem: 'Where do you author a custom sensitive information type that matches a 9-digit account number with a confidence score and proximity to keywords like "Account No"?',
    options: opts4(
      'Data classification > Classifiers > Sensitive info types > Create info type in the Microsoft Purview portal',
      'Defender XDR > Hunting',
      'Conditional Access policies',
      'Compliance Manager assessments'
    ),
    correct: ['a'],
    explanation: 'Custom SITs are authored in Data classification > Classifiers > Sensitive info types, supporting regex, keywords, confidence, and proximity. The other tools are unrelated.',
    references: [REF_SIT, REF_DATA_CLASS]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulator demands that you retain emails for finance employees for 7 years and then automatically delete them. Which Purview construct best meets this requirement?',
    options: opts4(
      'A retention policy targeting Exchange mailboxes scoped to the Finance group, with retain-and-delete after 7 years',
      'A DLP policy blocking deletion',
      'A sensitivity label with encryption',
      'A communication compliance policy'
    ),
    correct: ['a'],
    explanation: 'Retention policies support retain-then-delete with a defined period and scope. DLP cannot enforce retention; sensitivity labels protect, not retain; communication compliance reviews messages.',
    references: [REF_RETENTION_POLICY, REF_RETENTION]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Purview eDiscovery (Premium).',
    options: opts4(
      'It supports custodian management and legal-hold notifications.',
      'It can collect content from M365 and place it in a review set for analytics, redaction, and export.',
      'It can encrypt mailboxes automatically.',
      'It supports analytics like near-duplicate detection and email-thread analysis.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'eDiscovery (Premium) supports custodians, legal-hold notifications, collections into review sets, redaction, export, and analytics (near-dup, thread). It does not perform mailbox encryption — that\'s a sensitivity-label concern.',
    references: [REF_EDISCOVERY_PREM, REF_EDISCOVERY]
  },
  {
    domain: PURVIEW, difficulty: 3, type: QType.SINGLE,
    stem: 'You want communication-compliance reviewers to see Teams messages flagged for harassment, but with the sender\'s name pseudonymized to reduce bias. Which feature provides this?',
    options: opts4(
      'Pseudonymization in communication compliance reviewer settings',
      'Anonymous IP detection in ID Protection',
      'Privileged Access Management in Microsoft Purview',
      'Information Barriers'
    ),
    correct: ['a'],
    explanation: 'Communication compliance supports pseudonymizing the sender for fairness in reviews. ID Protection deals with sign-in risk. PAM controls privileged tasks. Information Barriers prevent communication, not anonymized review.',
    references: [REF_COMM_COMPLIANCE]
  },
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to detect when a departing employee downloads many files containing trade secrets and prevent further sharing. Which Purview features should you combine?',
    options: opts4(
      'Insider risk management to surface the risky behavior, plus DLP to prevent sharing of the labeled content',
      'Communication compliance only',
      'Information Barriers only',
      'eDiscovery (Standard) only'
    ),
    correct: ['a'],
    explanation: 'Combining insider risk management (behavior detection) with DLP (action prevention) addresses both the signal and the control. Other options miss one of those halves.',
    references: [REF_INSIDER, REF_DLP]
  },
  {
    domain: PURVIEW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Purview solution requires Privileged Access Management to be configured so that a Global Administrator must request approval to perform a sensitive Exchange task?',
    options: opts4(
      'Privileged access management (PAM) in Microsoft Purview',
      'Microsoft Entra Privileged Identity Management for Microsoft 365',
      'Information Barriers',
      'Compliance Manager'
    ),
    correct: ['a'],
    explanation: 'Purview PAM enforces just-in-time approval for sensitive Exchange tasks at the task level. Entra PIM addresses role activation. Information Barriers and Compliance Manager have different roles.',
    references: [REF_PAM]
  }
];

const MS102_DOMAINS = [
  { name: TENANT, weight: 27 },
  { name: IDENTITY, weight: 27 },
  { name: DEFENDER, weight: 33 },
  { name: PURVIEW, weight: 13 }
];

const MS102_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-ms-102-p1',
    code: 'MS-102-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 120-minute, 65-question, blueprint-weighted set covering deploying & managing a Microsoft 365 tenant, Microsoft Entra identity & access, Microsoft Defender XDR security & threat management, and Microsoft Purview compliance.',
    questions: P1
  },
  {
    slug: 'microsoft-ms-102-p2',
    code: 'MS-102-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-ms-102-p3',
    code: 'MS-102-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const MS102_BUNDLE = {
  slug: 'microsoft-ms-102',
  title: 'Microsoft 365 Administrator Expert (MS-102)',
  description: 'All 3 MS-102 practice exams in one bundle — covering deploying & managing a Microsoft 365 tenant, Microsoft Entra identity & access, Microsoft Defender XDR security & threat management, and Microsoft Purview compliance, aligned to the official Microsoft 365 Administrator Expert (MS-102) study guide.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the MS-102 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:ms102-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedMs102(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Microsoft 365 administration, Entra identity, Defender XDR security, Purview compliance, and the role-based certification track including the Microsoft 365 Administrator Expert (MS-102) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Microsoft 365 administration, Entra identity, Defender XDR security, Purview compliance, and the role-based certification track including the Microsoft 365 Administrator Expert (MS-102) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of MS102_EXAMS) {
    const title = `Microsoft 365 Administrator Expert (MS-102) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Microsoft MS-102 study guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Expert',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: MS102_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:ms102-seed' } });
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
          generatedBy: 'manual:ms102-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: MS102_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: MS102_BUNDLE.slug },
    update: {
      title: MS102_BUNDLE.title,
      description: MS102_BUNDLE.description,
      price: MS102_BUNDLE.price,
      priceVoucher: MS102_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: MS102_BUNDLE.slug,
      title: MS102_BUNDLE.title,
      description: MS102_BUNDLE.description,
      price: MS102_BUNDLE.price,
      priceVoucher: MS102_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-ms-102-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-ms-102-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-ms-102-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-ms-102-p1', tier: 'VOUCHER' as const, position: 4 }
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
