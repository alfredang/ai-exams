/**
 * MD-102 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:md102-seed'` and upserts catalog rows.
 *
 * Exported as `seedMd102(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/md102.ts`) and the protected
 * admin API (`/api/admin/seed-md102`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Microsoft Endpoint Administrator (MD-102) study guide (skills
 * measured as of April 28, 2026 — Prepare / Manage / Apps / Protect):
 *
 *   - Prepare infrastructure for devices    — 28% (18/variant)
 *   - Manage and maintain devices           — 32% (21/variant)
 *   - Manage applications                   — 20% (13/variant)
 *   - Protect devices                       — 20% (13/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual MD-102 questions.
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

const PREPARE = 'Prepare infrastructure for devices';
const MANAGE = 'Manage and maintain devices';
const APPS = 'Manage applications';
const PROTECT = 'Protect devices';

// ── Intune fundamentals + Entra device identity ──
const REF_INTUNE = { label: 'Microsoft Learn — What is Microsoft Intune?', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/what-is-intune' };
const REF_INTUNE_ADMIN = { label: 'Microsoft Learn — Microsoft Intune admin center', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/what-is-device-management' };
const REF_INTUNE_ROLES = { label: 'Microsoft Learn — Role-based access control (RBAC) with Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/role-based-access-control' };
const REF_INTUNE_SCOPE = { label: 'Microsoft Learn — Use scope tags to control access to Intune objects', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/scope-tags' };
const REF_ENTRA_DEVICE = { label: 'Microsoft Learn — Microsoft Entra device identity overview', url: 'https://learn.microsoft.com/en-us/entra/identity/devices/overview' };
const REF_ENTRA_JOIN = { label: 'Microsoft Learn — Microsoft Entra joined devices', url: 'https://learn.microsoft.com/en-us/entra/identity/devices/concept-directory-join' };
const REF_HYBRID_JOIN = { label: 'Microsoft Learn — Plan your Microsoft Entra hybrid join deployment', url: 'https://learn.microsoft.com/en-us/entra/identity/devices/hybrid-join-plan' };
const REF_ENTRA_REGISTER = { label: 'Microsoft Learn — Microsoft Entra registered devices', url: 'https://learn.microsoft.com/en-us/entra/identity/devices/concept-device-registration' };
const REF_DEVICE_GROUPS = { label: 'Microsoft Learn — Plan for groups in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/groups-add' };
const REF_DYN_GROUPS = { label: 'Microsoft Learn — Dynamic membership rules for groups', url: 'https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-membership' };

// ── Enrollment ──
const REF_ENROLL = { label: 'Microsoft Learn — Device enrollment in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/device-enrollment' };
const REF_ENROLL_AUTO_W = { label: 'Microsoft Learn — Enable Windows automatic enrollment in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/quickstart-setup-auto-enrollment' };
const REF_ENROLL_RESTRICT = { label: 'Microsoft Learn — Create a device platform restriction in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/enrollment-restrictions-set' };
const REF_ENROLL_IOS = { label: 'Microsoft Learn — Enrollment options for devices managed by Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/ios-enroll' };
const REF_APPLE_ABM = { label: 'Microsoft Learn — Set up Apple automated device enrollment with Apple Business Manager', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/device-enrollment-program-enroll-ios' };
const REF_APPLE_VPP = { label: 'Microsoft Learn — Set up the Apple Volume Purchase Program token in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/vpp-apps-ios' };
const REF_ENROLL_ANDROID = { label: 'Microsoft Learn — Enrollment options for Android devices in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/android-enroll' };
const REF_ANDROID_FULLY = { label: 'Microsoft Learn — Set up Intune enrollment of Android Enterprise fully managed devices', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/android-fully-managed-enroll' };
const REF_ANDROID_DEDICATED = { label: 'Microsoft Learn — Set up Intune enrollment of Android Enterprise dedicated devices', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/android-kiosk-enroll' };
const REF_ANDROID_WORK = { label: 'Microsoft Learn — Set up Intune enrollment of Android Enterprise personally-owned work profile devices', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/android-work-profile-enroll' };
const REF_AUTOPILOT = { label: 'Microsoft Learn — Windows Autopilot overview', url: 'https://learn.microsoft.com/en-us/autopilot/windows-autopilot' };
const REF_AUTOPILOT_DEVICE_UP = { label: 'Microsoft Learn — Windows Autopilot user-driven mode', url: 'https://learn.microsoft.com/en-us/autopilot/user-driven' };
const REF_AUTOPILOT_SELFDEPLOY = { label: 'Microsoft Learn — Windows Autopilot self-deploying mode', url: 'https://learn.microsoft.com/en-us/autopilot/self-deploying' };
const REF_AUTOPILOT_PRE = { label: 'Microsoft Learn — Windows Autopilot for pre-provisioned deployment', url: 'https://learn.microsoft.com/en-us/autopilot/pre-provision' };
const REF_AUTOPILOT_RESET = { label: 'Microsoft Learn — Windows Autopilot Reset', url: 'https://learn.microsoft.com/en-us/autopilot/windows-autopilot-reset' };
const REF_AUTOPILOT_NAME = { label: 'Microsoft Learn — Configure Autopilot profiles — device name template', url: 'https://learn.microsoft.com/en-us/autopilot/profiles' };
const REF_PROVISION_PKG = { label: 'Microsoft Learn — Provisioning packages for Windows', url: 'https://learn.microsoft.com/en-us/windows/configuration/provisioning-packages/provisioning-packages' };
const REF_ESP = { label: 'Microsoft Learn — Set up the Enrollment Status Page', url: 'https://learn.microsoft.com/en-us/mem/intune/enrollment/windows-enrollment-status' };
const REF_W365 = { label: 'Microsoft Learn — What is Windows 365?', url: 'https://learn.microsoft.com/en-us/windows-365/overview' };
const REF_W365_DEPLOY = { label: 'Microsoft Learn — Provision Cloud PCs in Windows 365 Enterprise', url: 'https://learn.microsoft.com/en-us/windows-365/enterprise/provisioning' };
const REF_W11_UPGRADE = { label: 'Microsoft Learn — Windows 11 deployment planning', url: 'https://learn.microsoft.com/en-us/windows/deployment/windows-11-plan' };

// ── Identity & compliance ──
const REF_COMPLIANCE = { label: 'Microsoft Learn — Use compliance policies to set rules for devices you manage with Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/device-compliance-get-started' };
const REF_COMPLIANCE_W = { label: 'Microsoft Learn — Windows 10/11 compliance settings in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/compliance-policy-create-windows' };
const REF_COMPLIANCE_ANDROID = { label: 'Microsoft Learn — Compliance settings for Android Enterprise devices in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/compliance-policy-create-android-for-work' };
const REF_COMPLIANCE_IOS = { label: 'Microsoft Learn — iOS/iPadOS compliance settings in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/compliance-policy-create-ios' };
const REF_COMPLIANCE_MAC = { label: 'Microsoft Learn — macOS compliance settings in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/compliance-policy-create-mac-os' };
const REF_CA = { label: 'Microsoft Learn — Conditional Access overview', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview' };
const REF_CA_COMPLIANT = { label: 'Microsoft Learn — Conditional Access — Require compliant device', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant' };
const REF_WHFB = { label: 'Microsoft Learn — Windows Hello for Business overview', url: 'https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/' };
const REF_WHFB_HYBRID = { label: 'Microsoft Learn — Windows Hello for Business hybrid cloud Kerberos trust deployment', url: 'https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-cloud-kerberos-trust' };
const REF_LAPS = { label: 'Microsoft Learn — What is Windows LAPS?', url: 'https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview' };
const REF_LAPS_INTUNE = { label: 'Microsoft Learn — Manage Windows LAPS with Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/windows-laps-overview' };
const REF_LOCAL_GROUPS = { label: 'Microsoft Learn — Use Account protection policy to manage built-in local groups on Windows devices', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/endpoint-security-account-protection-policy' };

// ── Device configuration profiles ──
const REF_CONFIG_PROFILE = { label: 'Microsoft Learn — Apply features and settings on devices using configuration profiles', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/device-profiles' };
const REF_SETTINGS_CATALOG = { label: 'Microsoft Learn — Use the settings catalog to configure settings on devices', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/settings-catalog' };
const REF_ADMIN_TEMPLATES = { label: 'Microsoft Learn — Use Windows administrative templates in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/administrative-templates-windows' };
const REF_ADMX_IMPORT = { label: 'Microsoft Learn — Add and create custom ADMX and ADML templates in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/administrative-templates-import-custom' };
const REF_WIN_MULTISESSION = { label: 'Microsoft Learn — Configure Windows 11 Enterprise multi-session VMs in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/windows-multi-session-vms' };
const REF_FILTERS = { label: 'Microsoft Learn — Use filters when assigning your apps, policies, and profiles in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/filters' };
const REF_VPN = { label: 'Microsoft Learn — Use Microsoft Intune to deploy VPN configuration profiles', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/vpn-settings-configure' };
const REF_WIFI = { label: 'Microsoft Learn — Add Wi-Fi profiles to devices in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/wi-fi-settings-configure' };

// ── Intune Suite add-ons ──
const REF_EPM = { label: 'Microsoft Learn — Use Endpoint Privilege Management with Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/epm-overview' };
const REF_REMOTE_HELP = { label: 'Microsoft Learn — Use Remote Help with Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/remote-help' };
const REF_ADV_ANALYTICS = { label: 'Microsoft Learn — Use Advanced Analytics in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/advanced-analytics-overview' };
const REF_ENT_APP_CATALOG = { label: 'Microsoft Learn — Add Enterprise App Catalog apps to Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/apps-add-enterprise-app' };
const REF_CLOUD_PKI = { label: 'Microsoft Learn — Overview of Microsoft Cloud PKI', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/cloud-pki-overview' };
const REF_TUNNEL_MAM = { label: 'Microsoft Learn — Microsoft Tunnel for Mobile Application Management overview', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/microsoft-tunnel-mam' };

// ── Remote actions ──
const REF_REMOTE_ACTIONS = { label: 'Microsoft Learn — Available device actions in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/remote-actions/device-management' };
const REF_REMOTE_WIPE = { label: 'Microsoft Learn — Wipe, retire, manually sync, or restart a device', url: 'https://learn.microsoft.com/en-us/mem/intune/remote-actions/devices-wipe' };
const REF_BULK_ACTIONS = { label: 'Microsoft Learn — Use bulk device actions in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/remote-actions/bulk-device-actions' };
const REF_BITLOCKER_ROTATE = { label: 'Microsoft Learn — Rotate BitLocker recovery keys with Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/encrypt-devices' };
const REF_DEVICE_QUERY = { label: 'Microsoft Learn — Device query in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/fundamentals/device-query' };

// ── Apps ──
const REF_APPS = { label: 'Microsoft Learn — App management in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/app-management' };
const REF_APP_DEPLOY = { label: 'Microsoft Learn — Add apps to Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/apps-add' };
const REF_APP_ASSIGN = { label: 'Microsoft Learn — Assign apps to groups with Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/apps-deploy' };
const REF_M365_APPS = { label: 'Microsoft Learn — Add Microsoft 365 Apps to Windows 10/11 devices with Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/apps-add-office365' };
const REF_OFFICE_POLICY = { label: 'Microsoft Learn — Cloud policy service for Microsoft 365', url: 'https://learn.microsoft.com/en-us/deployoffice/admincenter/overview-cloud-policy' };
const REF_M365_ADMIN = { label: 'Microsoft Learn — Overview of the Microsoft 365 Apps admin center', url: 'https://learn.microsoft.com/en-us/deployoffice/admincenter/overview' };
const REF_ODT = { label: 'Microsoft Learn — Office Deployment Tool overview', url: 'https://learn.microsoft.com/en-us/deployoffice/overview-office-deployment-tool' };
const REF_OCT = { label: 'Microsoft Learn — Office Customization Tool', url: 'https://learn.microsoft.com/en-us/deployoffice/overview-office-customization-tool' };
const REF_APP_STORE = { label: 'Microsoft Learn — Add iOS store apps to Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/store-apps-ios' };
const REF_APP_PROTECTION = { label: 'Microsoft Learn — App protection policies overview', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy' };
const REF_APP_CONFIG_DEVICE = { label: 'Microsoft Learn — App configuration policies for managed devices', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/app-configuration-policies-managed-device' };
const REF_APP_CONFIG_APP = { label: 'Microsoft Learn — App configuration policies for managed apps (MAM)', url: 'https://learn.microsoft.com/en-us/mem/intune/apps/app-configuration-policies-managed-app' };
const REF_CA_APP_PROT = { label: 'Microsoft Learn — Conditional Access — Require app protection policy', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant' };

// ── Protect devices ──
const REF_ENDPOINT_SEC = { label: 'Microsoft Learn — Manage endpoint security in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/endpoint-security' };
const REF_ANTIVIRUS = { label: 'Microsoft Learn — Configure Microsoft Defender Antivirus settings using Microsoft Intune endpoint security antivirus policies', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/endpoint-security-antivirus-policy' };
const REF_DISK_ENCRYPTION = { label: 'Microsoft Learn — Use endpoint security disk encryption policies in Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/encrypt-devices-bitlocker' };
const REF_FIREWALL = { label: 'Microsoft Learn — Endpoint security firewall policy', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/endpoint-security-firewall-policy' };
const REF_ASR = { label: 'Microsoft Learn — Attack surface reduction rules overview', url: 'https://learn.microsoft.com/en-us/defender-endpoint/attack-surface-reduction' };
const REF_ASR_INTUNE = { label: 'Microsoft Learn — Manage attack surface reduction rules with Microsoft Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/endpoint-security-asr-policy' };
const REF_BASELINES = { label: 'Microsoft Learn — Use security baselines to configure Windows devices in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/security-baselines' };
const REF_MDE_INT = { label: 'Microsoft Learn — Configure Microsoft Defender for Endpoint in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/advanced-threat-protection-configure' };
const REF_MDE_ONBOARD = { label: 'Microsoft Learn — Onboard devices to Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/onboard-configure' };
const REF_BITLOCKER = { label: 'Microsoft Learn — Encrypt Windows devices with BitLocker in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/encrypt-devices' };

// ── Updates ──
const REF_UPDATES = { label: 'Microsoft Learn — Manage Windows 10/11 software updates in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/windows-10-update-rings' };
const REF_UPDATE_POLICY = { label: 'Microsoft Learn — Use Intune to manage Windows updates as a service', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/windows-update-for-business-configure' };
const REF_UPDATE_IOS = { label: 'Microsoft Learn — Manage iOS/iPadOS software update policies in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/software-updates-ios' };
const REF_UPDATE_MAC = { label: 'Microsoft Learn — Manage macOS software update policies in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/protect/software-updates-macos' };
const REF_UPDATE_ANDROID = { label: 'Microsoft Learn — Manage Android Enterprise system updates with configuration profiles', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/device-restrictions-android-for-work' };
const REF_DELIVERY_OPT = { label: 'Microsoft Learn — Optimize Windows update delivery with Delivery Optimization settings in Intune', url: 'https://learn.microsoft.com/en-us/mem/intune/configuration/delivery-optimization-windows' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Prepare infrastructure for devices (18) ──
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A new corporate-owned Windows 11 laptop is purchased for an employee who only uses cloud apps (Microsoft 365). Which device-join type provides cloud identity with single sign-on to cloud apps and SSO to on-premises resources via Microsoft Entra hybrid features?',
    options: opts4(
      'Microsoft Entra registered',
      'Microsoft Entra joined',
      'Active Directory–domain joined only',
      'Workgroup only'
    ),
    correct: ['b'],
    explanation: 'Entra joined is the cloud-first identity for corporate Windows devices, providing SSO to cloud apps; with the right hybrid config it can SSO to on-prem too. Registered is for personal devices. AD-only is on-prem only. Workgroup has no central identity.',
    references: [REF_ENTRA_DEVICE, REF_ENTRA_JOIN]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You have on-prem AD-joined Windows 10/11 devices that you want to also bring under Microsoft Entra to support Conditional Access. Which approach lets the device keep its AD join AND get an Entra device identity?',
    options: opts4(
      'Microsoft Entra hybrid join',
      'Microsoft Entra registered',
      'Disjoin from AD and rejoin Entra only',
      'Add the device to a workgroup'
    ),
    correct: ['a'],
    explanation: 'Hybrid join keeps AD membership while adding an Entra device identity. Registered is for personal devices. Disjoining destroys AD trust. Workgroup is unmanaged.',
    references: [REF_HYBRID_JOIN, REF_ENTRA_DEVICE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'An employee wants to use a personal iPhone to access Outlook. The company wants device-level identity but does NOT need full MDM control. The appropriate device state in Entra is:',
    options: opts4(
      'Microsoft Entra registered',
      'Microsoft Entra joined',
      'Microsoft Entra hybrid joined',
      'Workgroup'
    ),
    correct: ['a'],
    explanation: 'Entra registered is for personal devices that need an identity for access (BYOD), without full corporate ownership. Joined and hybrid joined are corporate-only. Workgroup is not an Entra concept.',
    references: [REF_ENTRA_REGISTER, REF_ENTRA_DEVICE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want all Windows devices to be automatically enrolled into Intune when a user joins them to Microsoft Entra. Which setting must be configured in the Microsoft Entra admin center?',
    options: opts4(
      'Mobility (MDM and MAM) — MDM User scope → All (or a chosen group), with the Intune MDM URLs',
      'Cross-tenant access settings',
      'Conditional Access named locations',
      'External Identities settings'
    ),
    correct: ['a'],
    explanation: 'Automatic Windows enrollment requires the MDM User scope configured under Mobility (MDM and MAM) to point at Intune. The other settings are unrelated to enrollment automation.',
    references: [REF_ENROLL_AUTO_W, REF_ENROLL]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to allow only corporate-owned Android Enterprise devices and BLOCK personal devices from enrolling. Which Intune feature enforces this?',
    options: opts4(
      'Device platform restrictions / enrollment restrictions (personal vs corporate)',
      'A compliance policy',
      'A Conditional Access policy',
      'An app protection policy'
    ),
    correct: ['a'],
    explanation: 'Enrollment restrictions in Intune control which device types/platforms/ownerships can enroll. Compliance applies after enrollment. CA governs sign-in. APP protects app data.',
    references: [REF_ENROLL_RESTRICT, REF_ENROLL_ANDROID]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Android Enterprise enrollment profiles in Intune.',
    options: opts4(
      'Fully managed (corporate-owned, single-user) gives Intune full control of the device.',
      'Dedicated (corporate-owned, kiosk) is for single-use shared devices.',
      'Work profile (personal-owned) creates a managed work container alongside personal data.',
      'Work profile (personal-owned) enables Intune to wipe the entire device, including personal apps and photos.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Fully managed = full control, Dedicated = kiosk, Work profile (personal) = managed container. Work-profile (personal) wipe affects only the work profile — NOT the personal side.',
    references: [REF_ANDROID_FULLY, REF_ANDROID_DEDICATED, REF_ANDROID_WORK]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enroll thousands of corporate iPhones with NO end-user interaction beyond unboxing. The supported Apple pattern is:',
    options: opts4(
      'Apple Business Manager (ABM) + Automated Device Enrollment in Intune',
      'Apple Configurator only',
      'Manual user enrollment via the Company Portal',
      'Apple ID Family Sharing'
    ),
    correct: ['a'],
    explanation: 'ABM + ADE registers the device serial numbers so Intune enrolls on out-of-box first boot. Apple Configurator is for older bulk patterns (some still supported). Manual user enrollment is per-device. Family Sharing is consumer.',
    references: [REF_APPLE_ABM, REF_ENROLL_IOS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy app store iOS apps purchased in volume to corporate iPads. Which token must you upload to Intune for license tracking?',
    options: opts4(
      'Apple VPP token',
      'Apple Push Notification Certificate only',
      'Microsoft Entra B2B token',
      'Google Play Store key'
    ),
    correct: ['a'],
    explanation: 'The Volume Purchase Program (VPP) token connects Apple Business Manager purchases to Intune for license tracking and assignment. APNs cert is required but for push, not VPP. The others are unrelated.',
    references: [REF_APPLE_VPP, REF_ENROLL_IOS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a Helpdesk engineer to add and edit devices and apps in Intune but not modify users or roles. Which built-in Intune role is the closest match?',
    options: opts4(
      'Help Desk Operator (with appropriate scope tags)',
      'Global Administrator',
      'Read Only Operator',
      'School Administrator'
    ),
    correct: ['a'],
    explanation: 'Help Desk Operator can manage device and app tasks. Global Admin is excessive. Read Only Operator can\'t modify. School Administrator is education-specific.',
    references: [REF_INTUNE_ROLES, REF_INTUNE_SCOPE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want devices that don\'t have BitLocker encryption to be reported as non-compliant. Which Intune object expresses this requirement?',
    options: opts4(
      'A device compliance policy for Windows 10/11 with "BitLocker — Require"',
      'A device configuration profile only',
      'A Conditional Access policy',
      'An app protection policy'
    ),
    correct: ['a'],
    explanation: 'Compliance policies define the health requirements; CA enforces them at sign-in. Configuration profiles apply settings; APP protects app data.',
    references: [REF_COMPLIANCE, REF_COMPLIANCE_W]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Exchange Online to allow only devices marked "Compliant" by Intune. Which combination achieves this?',
    options: opts4(
      'Conditional Access grant control "Require device to be marked as compliant" applied to Exchange Online',
      'A workspace retention setting',
      'A Defender Antivirus exclusion',
      'A Sentinel workbook'
    ),
    correct: ['a'],
    explanation: 'CA grant "Require compliant device" gates the app on the compliance signal. The other options don\'t gate access.',
    references: [REF_CA, REF_CA_COMPLIANT, REF_COMPLIANCE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to sign in with passwordless biometric or PIN on Windows 11 devices. Which feature should you deploy via Intune?',
    options: opts4(
      'Windows Hello for Business policy (configured via the settings catalog or Identity protection endpoint security policy)',
      'A Conditional Access named location',
      'A device compliance policy only',
      'BitLocker drive encryption'
    ),
    correct: ['a'],
    explanation: 'WHfB enables biometric/PIN sign-in tied to the device key. The other options serve unrelated purposes.',
    references: [REF_WHFB, REF_WHFB_HYBRID]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to randomize and store local admin passwords for managed Windows 11 devices and have Intune surface the current password for support. Which feature do you enable and configure via Intune?',
    options: opts4(
      'Windows LAPS managed via the Intune endpoint security Account protection policy',
      'BitLocker recovery key escrow only',
      'A Sentinel workbook',
      'A Defender for Cloud Apps governance policy'
    ),
    correct: ['a'],
    explanation: 'Windows LAPS (via the Account protection endpoint-security policy) rotates and escrows local admin passwords to Entra/AD, visible to authorized admins. BitLocker key escrow is a different secret. The other options aren\'t LAPS.',
    references: [REF_LAPS, REF_LAPS_INTUNE]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need to ensure only members of the AD group "Server Admins" are present in the local Administrators group on Windows devices managed by Intune. Which mechanism is supported?',
    options: opts4(
      'Account protection policy → Local user group membership (Add or Replace) targeting the Administrators group',
      'A workbook with a parameter',
      'A Defender for Cloud Apps governance log',
      'A Sentinel watchlist'
    ),
    correct: ['a'],
    explanation: 'Endpoint security Account protection policies can set the membership of built-in local groups on Windows devices. The other options don\'t manage local group membership.',
    references: [REF_LOCAL_GROUPS, REF_INTUNE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want an Entra group that automatically includes any Windows device whose "Manufacturer" is "Dell". Which group type and rule supports this?',
    options: opts4(
      'A dynamic device group with rule: device.deviceManufacturer -eq "Dell"',
      'A static security group',
      'A Conditional Access named location',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Dynamic device groups support attribute-based membership rules like manufacturer/model/OSVersion. Static groups need manual updates; the other options aren\'t group types.',
    references: [REF_DEVICE_GROUPS, REF_DYN_GROUPS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enroll a corporate iPad via Apple Automated Device Enrollment. The end user sees a Microsoft Authentication screen at out-of-box. Which Intune component shaped this experience?',
    options: opts4(
      'An iOS/iPadOS Automated Device Enrollment profile attached to the ABM serial number with "Authenticate with Company Portal" enabled',
      'A Conditional Access named location',
      'A Sentinel workbook',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'ADE profiles in Intune (combined with ABM-assigned serials) drive the OOBE, including the Setup Assistant pane sequence and authentication method. The other options aren\'t enrollment profile mechanisms.',
    references: [REF_APPLE_ABM, REF_ENROLL_IOS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a macOS compliance policy to require System Integrity Protection (SIP) to be enabled and the OS to be at least 14.0. Which Intune object expresses this?',
    options: opts4(
      'A macOS compliance policy with System Integrity Protection and Minimum OS settings',
      'A configuration profile only',
      'A Conditional Access policy alone',
      'A scope tag'
    ),
    correct: ['a'],
    explanation: 'Compliance policies define the macOS health requirements (SIP, minimum OS, FileVault). Configuration profiles apply settings, CA gates access, scope tags scope admin visibility.',
    references: [REF_COMPLIANCE_MAC, REF_COMPLIANCE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want only Marketing-department iOS devices to receive a specific compliance policy. Which two settings combine to scope it?',
    options: opts4(
      'Assign the policy to a Marketing group AND filter the assignment to iOS devices using an Intune assignment filter',
      'Apply a Conditional Access policy',
      'Disable Microsoft Defender Antivirus',
      'Reduce workspace retention'
    ),
    correct: ['a'],
    explanation: 'Group + filter is the standard Intune scoping pattern for fine-grained assignment. The other options don\'t scope assignments.',
    references: [REF_COMPLIANCE_IOS, REF_FILTERS, REF_DEVICE_GROUPS]
  },

  // ── Manage and maintain devices (21) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A user receives a new corporate Windows 11 laptop. You want them to power it on, sign in once with Entra credentials, and have Intune apply all corporate settings/apps before the desktop appears. Which deployment is appropriate?',
    options: opts4(
      'Windows Autopilot user-driven mode with Enrollment Status Page',
      'Provisioning package via USB only',
      'Manual sysprep image deployment',
      'A Defender for Cloud Apps governance flow'
    ),
    correct: ['a'],
    explanation: 'Autopilot user-driven with ESP delivers the desired out-of-box experience. PPKG and manual sysprep are older patterns; MDCA is unrelated.',
    references: [REF_AUTOPILOT, REF_AUTOPILOT_DEVICE_UP, REF_ESP]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A shared kiosk Windows 11 device should be reset and reprovisioned by IT without user sign-in. Which Autopilot mode is intended for this?',
    options: opts4(
      'Self-deploying mode',
      'User-driven mode',
      'Pre-provisioned (white glove) mode',
      'Manual sysprep'
    ),
    correct: ['a'],
    explanation: 'Self-deploying targets shared/kiosk scenarios without user sign-in (TPM-attested). User-driven requires user sign-in; pre-provisioned is split: IT preprovisions then user finishes; sysprep is legacy imaging.',
    references: [REF_AUTOPILOT_SELFDEPLOY, REF_AUTOPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want IT to fully prep a device (apps, policies) BEFORE shipping to the end user, who then signs in to complete setup. Which Autopilot mode is this?',
    options: opts4(
      'Pre-provisioned deployment (formerly white glove)',
      'Self-deploying',
      'User-driven',
      'Autopilot Reset'
    ),
    correct: ['a'],
    explanation: 'Pre-provisioned splits OOBE between IT (apps/policies/cert) and end user (sign-in, secrets). Self-deploying is no-user, user-driven is user-only, Reset wipes a deployed device.',
    references: [REF_AUTOPILOT_PRE, REF_AUTOPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Autopilot-deployed laptops to be named "CORP-{SERIAL}". Which Autopilot setting configures this?',
    options: opts4(
      'Device name template in the Autopilot deployment profile',
      'A compliance policy',
      'A Conditional Access named location',
      'A Sentinel watchlist'
    ),
    correct: ['a'],
    explanation: 'Autopilot profiles include a device name template (e.g., CORP-%SERIAL%). Compliance/CA/Sentinel don\'t set device names.',
    references: [REF_AUTOPILOT_NAME, REF_AUTOPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to see a progress page during Autopilot enrollment that BLOCKS desktop access until critical apps and policies are installed. Which Intune feature is this?',
    options: opts4(
      'Enrollment Status Page (ESP) configured with blocking apps and a maximum time',
      'A compliance policy',
      'A configuration profile only',
      'A scope tag'
    ),
    correct: ['a'],
    explanation: 'ESP provides the blocking experience with selectable blocking apps and timeouts. The other options don\'t control the OOBE progress page.',
    references: [REF_ESP, REF_AUTOPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to configure 200 Surface devices for branch offices without internet during initial provisioning. Which lightweight Windows configuration mechanism is suitable?',
    options: opts4(
      'Provisioning packages (PPKG) created in Windows Configuration Designer',
      'Autopilot user-driven mode requiring internet',
      'A Conditional Access trusted location',
      'A workspace cross-region replica'
    ),
    correct: ['a'],
    explanation: 'PPKGs apply WiFi, certificates, apps, and policies offline. Autopilot needs internet. CA and replicas don\'t provision.',
    references: [REF_PROVISION_PKG, REF_AUTOPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to upgrade Windows 10 devices to Windows 11 in a controlled, staged rollout via Intune. The recommended mechanism is:',
    options: opts4(
      'Create a Windows 11 feature update profile (or use Windows Update for Business policies with the appropriate target version)',
      'A compliance policy',
      'A Defender for Cloud Apps governance policy',
      'A workspace cross-region replica'
    ),
    correct: ['a'],
    explanation: 'Feature update profiles / WUfB target a version; Intune deploys to chosen groups in waves. The other options don\'t drive Windows upgrades.',
    references: [REF_W11_UPGRADE, REF_UPDATE_POLICY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user needs a virtual Windows 11 desktop accessible from any device. Which Microsoft offering is purpose-built for per-user cloud PCs?',
    options: opts4(
      'Windows 365 (Cloud PC)',
      'Azure Virtual Desktop session host (multi-session)',
      'Windows Server VM on Azure with RDS',
      'Microsoft Stream'
    ),
    correct: ['a'],
    explanation: 'Windows 365 provisions a per-user Cloud PC managed by Intune. AVD multi-session is multi-user. Server RDS is legacy. Stream is video.',
    references: [REF_W365, REF_W365_DEPLOY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to deploy a complex Windows configuration setting NOT exposed in the Settings catalog (e.g., a vendor-specific Group Policy). The supported Intune path is:',
    options: opts4(
      'Import the vendor\'s ADMX/ADML and deploy via Imported Administrative templates (or settings catalog if surfaced)',
      'Edit the Windows registry manually on each device',
      'Use a Conditional Access named location',
      'Use a Sentinel watchlist'
    ),
    correct: ['a'],
    explanation: 'ADMX/ADML import surfaces custom policies in Intune. Manual registry edits don\'t scale. The other options aren\'t configuration tools.',
    references: [REF_ADMX_IMPORT, REF_ADMIN_TEMPLATES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single Settings-catalog profile that targets all Windows 11 devices in Finance but EXCLUDES kiosks. Which Intune mechanism limits applicability beyond simple group assignment?',
    options: opts4(
      'Assignment filters based on device properties (e.g., excludes devices in the "Kiosk" device-category)',
      'A Conditional Access policy',
      'A compliance policy',
      'A workspace retention setting'
    ),
    correct: ['a'],
    explanation: 'Assignment filters add device-property exclusions/inclusions on top of group targeting. The other options don\'t scope per-device on assignment.',
    references: [REF_FILTERS, REF_SETTINGS_CATALOG]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A line-of-business admin wants to elevate a specific .exe on managed Windows devices for ONLY a defined group without making the user a local administrator. Which Intune Suite feature is this?',
    options: opts4(
      'Endpoint Privilege Management (EPM) — managed elevation rules',
      'Microsoft Tunnel for MAM',
      'Microsoft Cloud PKI',
      'Remote Help'
    ),
    correct: ['a'],
    explanation: 'EPM elevates specific apps without granting local admin rights. Tunnel-MAM is VPN for MAM, Cloud PKI is cert issuance, Remote Help is remote assistance.',
    references: [REF_EPM]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Your helpdesk wants a secure remote view/control session with a Windows user, with the user prompted to consent, fully audited. Which Intune Suite feature provides this?',
    options: opts4(
      'Remote Help',
      'Endpoint Privilege Management',
      'Microsoft Cloud PKI',
      'Microsoft Tunnel for MAM'
    ),
    correct: ['a'],
    explanation: 'Remote Help is Intune\'s remote assistance with auth/consent/audit. The other Suite features serve different purposes.',
    references: [REF_REMOTE_HELP]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Intune to issue X.509 certificates to managed devices/users WITHOUT operating your own AD CS / NDES infrastructure. Which Intune Suite capability fits?',
    options: opts4(
      'Microsoft Cloud PKI',
      'Endpoint Privilege Management',
      'Remote Help',
      'Microsoft Tunnel'
    ),
    correct: ['a'],
    explanation: 'Cloud PKI is cloud-native cert issuance for managed devices/users without on-prem AD CS/NDES. The others address other problem domains.',
    references: [REF_CLOUD_PKI]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want only specific managed iOS apps to send traffic through a corporate VPN gateway WITHOUT requiring full MDM enrollment. Which Intune feature enables this?',
    options: opts4(
      'Microsoft Tunnel for Mobile Application Management',
      'Endpoint Privilege Management',
      'Remote Help',
      'Cloud PKI'
    ),
    correct: ['a'],
    explanation: 'Tunnel for MAM provides per-app VPN to a Tunnel gateway for managed apps on non-enrolled devices. The others don\'t.',
    references: [REF_TUNNEL_MAM]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want SOC analysts to see KQL-style summarized device telemetry (anomalies, score drift, common failures) for an Intune tenant. Which Intune Suite feature is this?',
    options: opts4(
      'Advanced Analytics in Microsoft Intune',
      'Endpoint Privilege Management',
      'Cloud PKI',
      'Remote Help'
    ),
    correct: ['a'],
    explanation: 'Advanced Analytics surfaces anomaly and trend insights for managed devices. The others are different.',
    references: [REF_ADV_ANALYTICS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to perform a one-time action on 500 devices: "Sync" with Intune. The most efficient action is:',
    options: opts4(
      'Use a bulk device action (Sync) from the Devices view in Intune',
      'Click Sync on each device individually',
      'Open a support ticket with Microsoft',
      'Wait for the daily auto-sync only'
    ),
    correct: ['a'],
    explanation: 'Bulk actions scale per-device operations. Per-device click does not scale; tickets/auto-sync don\'t give immediate response.',
    references: [REF_BULK_ACTIONS, REF_REMOTE_ACTIONS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to force-rotate a BitLocker recovery key for a managed Windows device because the previous key may have been exposed. Which Intune remote action does this?',
    options: opts4(
      'Rotate BitLocker keys (from the device page or via the BitLocker key rotation remote action)',
      'Wipe the device',
      'Sync the device',
      'Update Windows'
    ),
    correct: ['a'],
    explanation: 'BitLocker key rotation is a specific remote action. Wipe is destructive; Sync re-checks policy; Update Windows installs updates.',
    references: [REF_BITLOCKER_ROTATE, REF_BITLOCKER]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A device is lost. You need to remotely remove ALL company data including the OS and reset to factory defaults. Which remote action is correct?',
    options: opts4(
      'Wipe device (Factory reset)',
      'Retire device (removes only company data, leaves personal data on personal device)',
      'Sync device',
      'Restart device'
    ),
    correct: ['a'],
    explanation: 'Wipe is destructive factory reset for corporate devices. Retire removes only corporate data (BYOD-friendly). Sync re-checks policy; Restart reboots.',
    references: [REF_REMOTE_WIPE, REF_REMOTE_ACTIONS]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Intune Device Query (KQL).',
    options: opts4(
      'You can run KQL queries against a single device to retrieve live data (e.g., processes, services, registry).',
      'It supports a fixed set of KQL tables exposed via the Intune Device Query schema.',
      'Results are returned synchronously through the Intune portal.',
      'It requires onboarding the device to Microsoft Sentinel.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Device Query runs KQL against a single device using a defined schema with synchronous portal results. Sentinel onboarding is NOT required.',
    references: [REF_DEVICE_QUERY, REF_INTUNE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure a Wi-Fi profile in Intune to push corporate SSID + certificate-based authentication. Which configuration object type and trust dependency are typical?',
    options: opts4(
      'A Wi-Fi configuration profile referencing a SCEP/PKCS or Cloud PKI certificate profile',
      'A Conditional Access policy',
      'A workspace retention policy',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Wi-Fi profiles reference a cert profile for EAP-TLS auth. The other options aren\'t Wi-Fi/cert configuration mechanisms.',
    references: [REF_WIFI, REF_CLOUD_PKI]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single-image Windows 11 Enterprise multi-session pool for Azure Virtual Desktop, with applications layered via Intune. Which Intune configuration is intended for multi-session VMs?',
    options: opts4(
      'Apply a configuration profile targeted at "Windows 11 Enterprise multi-session" device platform',
      'Use a macOS configuration profile',
      'Disable Conditional Access',
      'Apply a workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Multi-session VMs are a distinct platform; Intune profiles can target it. The other options don\'t apply.',
    references: [REF_WIN_MULTISESSION, REF_CONFIG_PROFILE]
  },

  // ── Manage applications (13) ──
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to deploy a Windows MSI line-of-business app to managed Windows 11 devices via Intune. The supported workflow is:',
    options: opts4(
      'Add the app in Intune as a "Line-of-business app" (Windows installer .intunewin or supported package) and assign to groups',
      'Email the MSI to users',
      'Place the MSI in OneDrive and share with users',
      'Run the MSI manually on each device with PowerShell over WinRM'
    ),
    correct: ['a'],
    explanation: 'Intune App management supports LOB apps in supported formats deployed to groups. The other approaches don\'t scale or aren\'t supported.',
    references: [REF_APPS, REF_APP_DEPLOY]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You assign a Windows app to a user group with intent "Required". A device in the group shows the app failed install. The next correct triage step is to:',
    options: opts4(
      'Open the device\'s App install status and install errors detail in Intune, and pull the install logs for further analysis',
      'Wipe the device immediately',
      'Disable the user account',
      'Disable Conditional Access for the tenant'
    ),
    correct: ['a'],
    explanation: 'Intune surfaces app install status and error codes for triage; download logs for further analysis. The other actions are inappropriate first responses.',
    references: [REF_APP_DEPLOY, REF_APP_ASSIGN]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy Microsoft 365 Apps (Word, Excel, etc.) to corporate Windows devices with a specific update channel (Monthly Enterprise). The supported Intune pattern is:',
    options: opts4(
      'Add Microsoft 365 Apps via the Intune "Microsoft 365 Apps for Windows 10/11" app template and select the desired channel and apps',
      'Manually download the MSI from each user\'s portal',
      'Push the Office 2019 MSI via Group Policy',
      'Configure a Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'The Intune M365 Apps template configures channel/apps/language declaratively. Office 2019 MSI is a different product. GPO/CA don\'t deploy Office.',
    references: [REF_M365_APPS, REF_APP_DEPLOY]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a baseline set of Office policies (e.g., disable macros from internet) applied to all users, regardless of device. Which Microsoft 365 service applies user-centric Office policies?',
    options: opts4(
      'Microsoft 365 Cloud Policy service (via the Microsoft 365 Apps admin center)',
      'A Conditional Access policy',
      'An MDM device configuration profile only',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Cloud Policy applies user-level Office policy regardless of device. CA is sign-in; MDM device config is per-device; retention is unrelated.',
    references: [REF_OFFICE_POLICY, REF_M365_ADMIN]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy Microsoft 365 Apps during an Autopilot sequence using a customized configuration XML. The supported tool is:',
    options: opts4(
      'Office Deployment Tool (ODT) with an XML configuration generated by the Office Customization Tool (OCT) or the Microsoft 365 Apps admin center',
      'Group Policy editor only',
      'Windows Update for Business',
      'A Sentinel workbook'
    ),
    correct: ['a'],
    explanation: 'ODT + XML (often generated via OCT or M365 Apps admin center) is the standard customized Office deployment. The other options aren\'t Office deployment tools.',
    references: [REF_ODT, REF_OCT]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to install Apple App Store apps on managed iPads via the Company Portal — without needing VPP licenses. Which Intune app type supports this?',
    options: opts4(
      'iOS store app added to Intune (search by App Store ID/URL) and assigned with "Available" intent',
      'A LOB app from a SharePoint URL',
      'A Microsoft Defender Antivirus exclusion',
      'A Conditional Access trusted location'
    ),
    correct: ['a'],
    explanation: 'iOS store apps can be assigned by URL/ID without VPP (although VPP improves license/silent install). The other options aren\'t app types.',
    references: [REF_APP_STORE, REF_APP_DEPLOY]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want corporate data accessed in Outlook on iOS to be PROTECTED (e.g., copy/paste only into approved apps, PIN required), but the device itself is NOT enrolled. Which Intune feature is appropriate?',
    options: opts4(
      'App protection policy (MAM) targeting the user/app combination',
      'A device configuration profile only',
      'A Defender Antivirus exclusion',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'App protection policies (MAM) protect corporate data inside managed apps even without enrollment. The other options don\'t fit MAM.',
    references: [REF_APP_PROTECTION, REF_CA_APP_PROT]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You configure an app protection policy. The policy is being ignored on iOS Outlook because users sign in to personal Exchange too. The recommended approach is to:',
    options: opts4(
      'Combine the APP policy with a Conditional Access policy requiring approved client app + app protection policy for the corporate Exchange Online resource',
      'Disable the app protection policy entirely',
      'Disable MFA for these users',
      'Increase workspace retention'
    ),
    correct: ['a'],
    explanation: 'CA "Require approved client app" + "Require app protection policy" forces APP-managed access; APP alone doesn\'t block legacy auth or unmanaged apps. The other options are inappropriate.',
    references: [REF_CA_APP_PROT, REF_APP_PROTECTION]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to push a server URL into the LOB app "Acme Inventory" running on managed Android devices, so users don\'t type it. The supported mechanism is:',
    options: opts4(
      'App configuration policy for managed devices targeting the app with a key/value pair (e.g., serverUrl=https://...)',
      'A Conditional Access named location',
      'A compliance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'App configuration policies inject key/value config into managed apps. The other options don\'t configure apps.',
    references: [REF_APP_CONFIG_DEVICE, REF_APPS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to push the same server URL into the Outlook MAM app on non-enrolled iOS devices. Which Intune mechanism applies?',
    options: opts4(
      'App configuration policy for managed apps (MAM) targeting Outlook + key/value',
      'A device configuration profile only',
      'A compliance policy',
      'A workspace cross-region replica'
    ),
    correct: ['a'],
    explanation: 'App configuration policies for MAM target managed apps without device enrollment. The other options are unrelated.',
    references: [REF_APP_CONFIG_APP, REF_APP_PROTECTION]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A user wants Word for Mac on a managed Mac. Which Intune deployment path is the simplest supported approach?',
    options: opts4(
      'Add Microsoft 365 Apps (macOS) as an Intune app and assign to a group',
      'Manually email the .pkg installer',
      'Put the installer in a personal OneDrive',
      'Use Windows Autopilot'
    ),
    correct: ['a'],
    explanation: 'Microsoft 365 Apps for macOS is a built-in Intune app type; assign to a group. Manual paths don\'t scale. Autopilot is Windows.',
    references: [REF_M365_APPS, REF_APP_DEPLOY]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a Win32 app with complex install dependencies and detection logic. Which Intune app type supports this?',
    options: opts4(
      'Win32 app (.intunewin) with detection rules and install command',
      'LOB app (.msi) only',
      'Built-in app',
      'Microsoft Store app (UWP) only'
    ),
    correct: ['a'],
    explanation: 'Win32 .intunewin packages support custom install/uninstall commands, detection rules, dependencies, and supersedence. MSI LOB is simpler; built-in apps are Microsoft-owned; UWP is store-distributed.',
    references: [REF_APP_DEPLOY, REF_APPS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A Microsoft 365 Apps update needs to roll out only after IT validates a build. Which Microsoft tool centralizes channel/version control for M365 Apps with admin-driven rollout?',
    options: opts4(
      'Microsoft 365 Apps admin center (servicing profiles + cloud update)',
      'Microsoft Sentinel workbook',
      'Defender for Cloud Apps governance',
      'Conditional Access trusted locations'
    ),
    correct: ['a'],
    explanation: 'The M365 Apps admin center provides servicing profiles to manage M365 Apps versions/rollout. The other options aren\'t the Office update control plane.',
    references: [REF_M365_ADMIN, REF_OFFICE_POLICY]
  },

  // ── Protect devices (13) ──
  {
    domain: PROTECT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to enforce Defender Antivirus settings (real-time protection, scheduled scans, cloud protection) across managed Windows 11 devices via Intune. Which Intune object is appropriate?',
    options: opts4(
      'An Antivirus policy under Endpoint security in Intune',
      'A Conditional Access policy',
      'A workspace retention policy',
      'A Defender for Cloud Apps governance policy'
    ),
    correct: ['a'],
    explanation: 'Endpoint security Antivirus policies are the right surface to configure Defender AV in Intune. The other options serve different purposes.',
    references: [REF_ANTIVIRUS, REF_ENDPOINT_SEC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to encrypt all managed Windows 11 laptops with BitLocker, escrow keys to Microsoft Entra ID, and require recovery for changed firmware. Which Intune object expresses this?',
    options: opts4(
      'A Disk encryption policy (BitLocker) under Endpoint security with key escrow to Entra ID',
      'A device configuration profile only',
      'A compliance policy',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Endpoint security Disk encryption (BitLocker) policy configures BitLocker with key escrow. Configuration profiles can also set BitLocker but Endpoint security is the recommended surface; compliance evaluates; AV exclusions are different.',
    references: [REF_DISK_ENCRYPTION, REF_BITLOCKER]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to block inbound traffic on managed Windows 11 devices except for specific allowed rules. Which Intune object expresses this?',
    options: opts4(
      'An Endpoint security Firewall policy (with the necessary firewall rules)',
      'A workspace retention policy',
      'A Defender for Cloud Apps policy',
      'A scope tag'
    ),
    correct: ['a'],
    explanation: 'Endpoint security Firewall policy configures Defender Firewall. The other options don\'t.',
    references: [REF_FIREWALL, REF_ENDPOINT_SEC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enable specific ASR rules in Block mode (e.g., "Block executable content from email client and webmail") on managed Windows devices. The supported Intune pattern is:',
    options: opts4(
      'Endpoint security Attack surface reduction policy with the chosen rules set to Block',
      'A compliance policy',
      'A configuration profile for macOS',
      'A workspace cross-region replica'
    ),
    correct: ['a'],
    explanation: 'Endpoint security ASR policies configure ASR rule states. Compliance evaluates state; macOS profile doesn\'t apply; replicas aren\'t configuration.',
    references: [REF_ASR_INTUNE, REF_ASR]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to apply Microsoft\'s recommended baseline of Windows security settings to managed devices in a structured way. Which Intune feature is recommended?',
    options: opts4(
      'Security baselines (e.g., Microsoft\'s "Windows 11 security baseline") in Endpoint security',
      'A custom configuration profile only',
      'A compliance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Microsoft-curated security baselines apply hundreds of recommended settings. Custom profiles can do this manually but baselines are the recommended starting point.',
    references: [REF_BASELINES, REF_ENDPOINT_SEC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to onboard Windows 11 managed devices into Microsoft Defender for Endpoint using an Intune-driven flow. Which step is required?',
    options: opts4(
      'Configure the Microsoft Defender for Endpoint connector in Intune (Endpoint security → Microsoft Defender for Endpoint) and assign an EDR/onboarding policy',
      'Configure a Conditional Access named location',
      'Disable Defender Antivirus',
      'Set workspace retention to 1 day'
    ),
    correct: ['a'],
    explanation: 'The MDE connector + EDR policy onboards devices to MDE. The other options are unrelated or destructive.',
    references: [REF_MDE_INT, REF_MDE_ONBOARD]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to manage Windows quality updates with controlled rings (Pilot in 2 days, Broad in 7 days). Which Intune feature is purpose-built?',
    options: opts4(
      'Windows Update for Business — Update rings configured in Intune',
      'A Defender Antivirus offline scan',
      'A workspace cross-region replica',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'WUfB Update rings via Intune control deferral, deadlines, and rollouts per group. The other options aren\'t update management.',
    references: [REF_UPDATES, REF_UPDATE_POLICY]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to specify a minimum iOS version that managed iPhones must be on, and enforce updates centrally. Which Intune feature is purpose-built?',
    options: opts4(
      'iOS software update policy (for ADE-enrolled supervised devices) and/or compliance policy minimum OS',
      'Windows Update for Business',
      'BitLocker disk encryption',
      'ASR rules'
    ),
    correct: ['a'],
    explanation: 'iOS update policies (for supervised devices) and compliance minimum OS govern iOS updates. WUfB/BitLocker/ASR are Windows-only.',
    references: [REF_UPDATE_IOS, REF_COMPLIANCE_IOS]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to reduce internet bandwidth used during Windows update rollouts across a branch office. Which Intune setting helps?',
    options: opts4(
      'Delivery Optimization configuration to use peer-to-peer cache within the branch',
      'A Conditional Access policy',
      'A workspace retention policy',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Delivery Optimization peer-caching reduces upstream bandwidth. The other options don\'t affect update delivery.',
    references: [REF_DELIVERY_OPT, REF_UPDATES]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed macOS devices to install latest macOS updates within 7 days. Which Intune feature applies?',
    options: opts4(
      'macOS software update policy in Endpoint security (with the supervised/ADE devices)',
      'Windows Update for Business',
      'ASR rules',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'macOS update policies in Intune drive enforcement on supervised macOS devices. WUfB/ASR/CA are not macOS update tools.',
    references: [REF_UPDATE_MAC, REF_COMPLIANCE_MAC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a SOC analyst to know the patch status of all managed Windows devices in one place. Which Intune report is appropriate?',
    options: opts4(
      'The Windows update reports under Reports → Windows updates (Update rings / Feature updates)',
      'A Defender for Cloud Apps governance log',
      'A workspace cross-region replica',
      'A Conditional Access What-if'
    ),
    correct: ['a'],
    explanation: 'Intune Reports → Windows updates aggregates status per ring/feature update. The other options don\'t report patch status.',
    references: [REF_UPDATES, REF_UPDATE_POLICY]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Android Enterprise dedicated devices to receive the latest OS updates via FOTA on a regular schedule. Which Intune mechanism supports this?',
    options: opts4(
      'Android Enterprise system update policy in a device configuration / restrictions profile (or FOTA deployment for supported OEMs)',
      'Windows Update for Business',
      'iOS software update policy',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Android Enterprise device-restrictions / config profiles control update mode (automatic/postponed/windowed). The others don\'t apply to Android.',
    references: [REF_UPDATE_ANDROID, REF_ANDROID_DEDICATED]
  },
  {
    domain: PROTECT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Defender Antivirus policies in Intune Endpoint security.',
    options: opts4(
      'They can configure real-time protection, cloud-delivered protection, and scheduled scans.',
      'They support per-platform variants (Windows, macOS, Linux for Defender for Endpoint).',
      'They replace Microsoft Defender Antivirus with a third-party antivirus.',
      'They can be assigned to device groups via Intune.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'AV policies configure Defender AV across supported platforms and are assigned to groups. They do NOT install a third-party AV.',
    references: [REF_ANTIVIRUS, REF_MDE_INT]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Prepare infrastructure for devices (18) ──
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to bulk-import Autopilot devices from a CSV (serial number + hardware hash) into Microsoft Intune so they appear in the Autopilot devices list. Which Intune view supports this?',
    options: opts4(
      'Devices → Enrollment → Windows → Devices (Autopilot) → Import',
      'Endpoint security → Antivirus',
      'Reports → Windows updates',
      'Apps → Microsoft 365 Apps'
    ),
    correct: ['a'],
    explanation: 'Autopilot devices are imported under Windows enrollment. The other views serve other purposes.',
    references: [REF_AUTOPILOT, REF_ENROLL]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enroll macOS devices using Apple Business Manager-driven automated enrollment. Which Intune profile type targets this scenario?',
    options: opts4(
      'macOS Automated Device Enrollment profile attached to ABM-assigned serials',
      'iOS/iPadOS Volume Purchase Program token only',
      'Windows Autopilot profile',
      'Android Enterprise enrollment profile'
    ),
    correct: ['a'],
    explanation: 'macOS ADE profiles drive the macOS OOBE for ABM-assigned devices. The other profile types are for different platforms.',
    references: [REF_APPLE_ABM, REF_ENROLL_IOS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You configured a compliance policy with "Mark device noncompliant after grace period" = 3 days. After 4 days a non-compliant device is denied Exchange Online access. Which feature enforced the denial?',
    options: opts4(
      'A Conditional Access policy requiring compliant device, applied to Exchange Online',
      'A device wipe action',
      'A Windows Defender Firewall rule',
      'A Sentinel automation rule'
    ),
    correct: ['a'],
    explanation: 'Compliance signals are only enforced when paired with a CA policy. Wipe is destructive, firewall is local, automation rules are SOC.',
    references: [REF_CA_COMPLIANT, REF_COMPLIANCE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to assign different Intune permissions to a regional admin who should only manage devices tagged "Asia-Pacific". Which Intune feature scopes object visibility for this admin role?',
    options: opts4(
      'Scope tags applied to objects + role assignment scoped to the same tag',
      'A Conditional Access named location',
      'A workspace retention policy',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Scope tags scope object visibility for an admin role. CA is sign-in; retention is data; AV exclusions are detection-side.',
    references: [REF_INTUNE_SCOPE, REF_INTUNE_ROLES]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a security group whose membership includes every Windows device whose name starts with "FIN-". Which group rule supports this?',
    options: opts4(
      'Dynamic device group rule: device.displayName -startsWith "FIN-"',
      'Static group with manual member updates',
      'A Conditional Access policy',
      'A compliance policy'
    ),
    correct: ['a'],
    explanation: 'Dynamic device groups support startsWith/contains/equals/matches rules. The other options aren\'t membership rules.',
    references: [REF_DYN_GROUPS, REF_DEVICE_GROUPS]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Entra hybrid join.',
    options: opts4(
      'It enables on-prem AD-joined devices to also have an Entra device identity.',
      'It enables Conditional Access controls based on device compliance.',
      'It allows devices to break AD trust and join only Entra.',
      'It supports federated and managed authentication scenarios.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Hybrid join keeps AD membership + adds Entra identity, supports CA + federation/managed auth. It does NOT break AD trust.',
    references: [REF_HYBRID_JOIN, REF_ENTRA_DEVICE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to authenticate to managed iPhones with Microsoft Authenticator and an Entra-issued cert for VPN. Which mechanism issues per-device certs?',
    options: opts4(
      'Microsoft Cloud PKI (or NDES + SCEP) via Intune certificate profiles',
      'A compliance policy alone',
      'A Sentinel watchlist',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Cloud PKI or NDES+SCEP issues per-device/user certs via Intune cert profiles. The other options don\'t issue certs.',
    references: [REF_CLOUD_PKI, REF_VPN]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ENFORCE Windows Hello for Business enrollment as a user signs in on a new Windows 11 device. Which Intune object configures this?',
    options: opts4(
      'A Windows Hello for Business identity protection / endpoint security policy with required PIN/biometric',
      'A Defender Antivirus exclusion',
      'A workspace retention policy',
      'A Sentinel workbook'
    ),
    correct: ['a'],
    explanation: 'Identity protection / Account protection endpoint security policy (or tenant-wide WHfB setting) drives WHfB enrollment. The other options don\'t.',
    references: [REF_WHFB, REF_WHFB_HYBRID]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A device is enrolled but compliance shows "Not evaluated". The most likely root cause is:',
    options: opts4(
      'No compliance policy is yet assigned to a group containing the device (or sync has not completed)',
      'The device has not been encrypted',
      'Windows Update has not run',
      'The user is in a different tenant'
    ),
    correct: ['a'],
    explanation: '"Not evaluated" means no policy applies (or hasn\'t yet evaluated). Encryption or updates may be required by a policy but only if one is assigned.',
    references: [REF_COMPLIANCE, REF_DEVICE_GROUPS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want all corporate Android Enterprise fully-managed devices to require a biometric or 6-digit PIN. Which Intune object expresses this?',
    options: opts4(
      'An Android compliance policy and a device configuration / restrictions profile requiring secure password complexity',
      'A LOB app',
      'A workspace retention policy',
      'A Conditional Access trusted location'
    ),
    correct: ['a'],
    explanation: 'Compliance + restrictions on Android enforce password complexity and biometrics. The other options don\'t.',
    references: [REF_COMPLIANCE_ANDROID, REF_ANDROID_FULLY]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to scope Intune\'s "Help Desk Operator" role to only see devices in the "Pilot" device category. Which combination is required?',
    options: opts4(
      'Assign the role to the Helpdesk group + apply a scope tag "Pilot" + tag Pilot devices and supporting objects with the same scope tag',
      'A Conditional Access policy',
      'A compliance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'RBAC + scope tags scope visibility. Apply matching scope tags to objects + role assignment. The other options aren\'t RBAC scoping.',
    references: [REF_INTUNE_SCOPE, REF_INTUNE_ROLES, REF_DEVICE_GROUPS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want only devices that match a compliance policy AND are running Windows 11 22H2 or higher to access SharePoint Online. Which combination achieves this?',
    options: opts4(
      'Compliance policy "Minimum OS version" set + Conditional Access policy "Require compliant device" + SharePoint Online as cloud app',
      'A Conditional Access named location only',
      'A LOB app deployment',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Min OS in compliance is enforced via CA grant. The other options don\'t enforce minimum OS.',
    references: [REF_COMPLIANCE_W, REF_CA_COMPLIANT]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a corporate Wi-Fi profile to all macOS managed devices in the company without on-prem certificate infrastructure. Which combination supports this?',
    options: opts4(
      'A Wi-Fi configuration profile for macOS combined with a Microsoft Cloud PKI / SCEP cert profile',
      'A Group Policy template',
      'A workspace retention setting',
      'A Sentinel hunting query'
    ),
    correct: ['a'],
    explanation: 'macOS Wi-Fi profile + Cloud PKI / SCEP cert profile is the cloud-native pattern. GPO is Windows-only. The others aren\'t configuration tools.',
    references: [REF_WIFI, REF_CLOUD_PKI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A guest user from a partner tenant needs to access your managed Windows app from their personal laptop. Which device-identity model in your tenant typically applies to their laptop?',
    options: opts4(
      'Microsoft Entra registered (in their home tenant, with B2B cross-tenant trust to your tenant)',
      'Microsoft Entra joined in your tenant',
      'Hybrid join in your tenant',
      'AD-joined to your domain'
    ),
    correct: ['a'],
    explanation: 'B2B guests usually have a registered device in their home tenant; your tenant grants access via CA/B2B settings, not by re-enrolling the device.',
    references: [REF_ENTRA_REGISTER, REF_ENTRA_DEVICE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want bulk Android Enterprise dedicated-device enrollment with a QR code distributed to retail kiosks. Which enrollment path supports this?',
    options: opts4(
      'Android Enterprise dedicated devices via QR code enrollment profile (or Zero-Touch / KME)',
      'Apple ADE',
      'Windows Autopilot',
      'Provisioning packages'
    ),
    correct: ['a'],
    explanation: 'Dedicated Android profiles support QR/Zero-Touch/KME enrollment. The others target other platforms.',
    references: [REF_ANDROID_DEDICATED, REF_ENROLL_ANDROID]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows devices to use a particular custom DNS suffix and search list. Which Intune object expresses this?',
    options: opts4(
      'A device configuration profile (Settings catalog or Administrative templates) setting DNS suffix / search list',
      'A compliance policy',
      'A Conditional Access policy',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Configuration profiles set DNS suffix and other network settings. Compliance/CA/AV are different.',
    references: [REF_CONFIG_PROFILE, REF_SETTINGS_CATALOG]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to require multi-factor authentication during the Intune device enrollment process for sensitive groups. Which Conditional Access policy applies?',
    options: opts4(
      'A Conditional Access policy targeting the "Microsoft Intune Enrollment" service principal (or "Microsoft Intune") with grant control "Require MFA"',
      'A workspace retention policy',
      'A compliance policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'CA can target Intune (Enrollment) with MFA grant to gate enrollment. The other options don\'t require MFA at enrollment.',
    references: [REF_CA, REF_ENROLL]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ensure that only specific Windows 11 SKUs (Enterprise/Education) can enroll into Intune. Which feature supports this?',
    options: opts4(
      'Enrollment restrictions that block specified Windows versions/editions or device platforms',
      'A compliance policy',
      'A Defender for Cloud Apps governance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Enrollment restrictions can block by platform/version. Compliance evaluates after enrollment. MDCA/retention are unrelated.',
    references: [REF_ENROLL_RESTRICT, REF_ENROLL]
  },

  // ── Manage and maintain devices (21) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A user resets their Autopilot Windows 11 device for re-deployment without IT involvement. Which feature did they invoke?',
    options: opts4(
      'Autopilot Reset',
      'BitLocker recovery',
      'Windows Update for Business',
      'A Conditional Access What-if'
    ),
    correct: ['a'],
    explanation: 'Autopilot Reset removes apps/settings and prepares the device for the next user without full re-imaging. The other options aren\'t reset mechanisms.',
    references: [REF_AUTOPILOT_RESET, REF_AUTOPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want corporate Windows 11 devices to receive a specific time zone, language preference, and proxy automatically. Which Intune mechanism is the cleanest?',
    options: opts4(
      'A Settings catalog configuration profile bundling the chosen settings',
      'A Sentinel workbook',
      'A compliance policy',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Settings catalog provides a single configuration profile with thousands of granular settings. The other options aren\'t configuration mechanisms.',
    references: [REF_SETTINGS_CATALOG, REF_CONFIG_PROFILE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports their managed iPad shows "Screen lock disabled — non-compliant". Which Intune object should you check FIRST?',
    options: opts4(
      'The iOS compliance policy enforcing screen-lock requirements applied to that user',
      'The Windows compliance policy',
      'A Defender Antivirus exclusion',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'iOS compliance policies define screen-lock requirements. Windows policies don\'t apply to iOS; the others aren\'t compliance.',
    references: [REF_COMPLIANCE_IOS, REF_COMPLIANCE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to apply a configuration profile to ONLY corporate-owned devices (not BYOD). Which filter or property targets this?',
    options: opts4(
      'Use an Intune assignment filter on device.deviceOwnership equal to Corporate',
      'A Conditional Access named location',
      'A workspace retention policy',
      'A Defender for Cloud Apps governance policy'
    ),
    correct: ['a'],
    explanation: 'Filters can scope assignment on ownership and other device properties. The other options aren\'t assignment scopers.',
    references: [REF_FILTERS, REF_CONFIG_PROFILE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A managed Windows 11 device shows "ESP failed: app install error". The blocking app was a Win32 LOB. Which Intune surface gives the per-app install status and error code?',
    options: opts4(
      'Apps → Win32 app → Device install status / User install status',
      'Conditional Access → Sign-in logs',
      'Defender Antivirus events',
      'Sentinel KQL'
    ),
    correct: ['a'],
    explanation: 'Intune Apps install status pages show error codes and device-level details. The other options aren\'t app-install diagnostics.',
    references: [REF_APP_DEPLOY, REF_ESP]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to permanently retire 50 BYOD iPhones (remove only company data, leave personal data). Which remote action and pattern?',
    options: opts4(
      'Bulk Retire action on the selected devices in Intune',
      'Bulk Wipe (Factory reset)',
      'Bulk Sync',
      'Bulk Restart'
    ),
    correct: ['a'],
    explanation: 'Retire removes only company data, ideal for BYOD. Wipe factory-resets; Sync/Restart don\'t remove data.',
    references: [REF_REMOTE_WIPE, REF_BULK_ACTIONS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a device-query KQL example that returns the currently running processes on a Windows device. The right KQL table is:',
    options: opts4(
      'Process (e.g., Process | take 50 within Device query)',
      'SecurityEvent',
      'DeviceLogonEvents',
      'CommonSecurityLog'
    ),
    correct: ['a'],
    explanation: 'Device query exposes a fixed schema; "Process" is the live processes table. SecurityEvent/DeviceLogonEvents/CommonSecurityLog are Sentinel/Defender tables, not Device query.',
    references: [REF_DEVICE_QUERY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single approval workflow where an end user requests elevation for an installer, an admin approves, and Intune logs the action. Which Intune Suite feature supports this?',
    options: opts4(
      'Endpoint Privilege Management (EPM) with elevation requests and approval workflow',
      'Microsoft Tunnel for MAM',
      'Microsoft Cloud PKI',
      'Remote Help'
    ),
    correct: ['a'],
    explanation: 'EPM supports user-initiated elevation requests with admin approval and audit. The other Intune Suite features are different.',
    references: [REF_EPM]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to deploy a curated set of LOB apps from a partner-vetted catalog into Intune. Which Intune Suite feature provides this catalog?',
    options: opts4(
      'Enterprise App Catalog (managed apps with metadata and update lifecycle)',
      'Endpoint Privilege Management',
      'Microsoft Cloud PKI',
      'Remote Help'
    ),
    correct: ['a'],
    explanation: 'Enterprise App Catalog provides curated managed apps with metadata and packaged deployment. The other Suite features serve other use cases.',
    references: [REF_ENT_APP_CATALOG]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user requests a remote support session on their managed Windows 11 device. The session needs end-user consent and full audit. Which Intune Suite feature applies?',
    options: opts4(
      'Remote Help with view + control modes and audit logs',
      'Microsoft Tunnel for MAM',
      'Cloud PKI',
      'Endpoint Privilege Management'
    ),
    correct: ['a'],
    explanation: 'Remote Help is intended for help-desk-driven assistance with consent + audit. The other Suite features address different scenarios.',
    references: [REF_REMOTE_HELP]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Intune to display a custom organization logo and helpdesk contact in the Company Portal app. Which setting controls this?',
    options: opts4(
      'Tenant administration → Customization → upload logo, set support email/phone, theme colors',
      'A Conditional Access named location',
      'A compliance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Customization under Tenant administration is where logo/support contact/theme live. The other options aren\'t branding controls.',
    references: [REF_INTUNE_ADMIN, REF_INTUNE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A managed Windows device repeatedly fails a configuration profile setting. Which Intune diagnostic gives a per-setting status with error code?',
    options: opts4(
      'Devices → Device → Per-setting status / Configuration profile assignment results',
      'A Defender for Cloud Apps governance log',
      'A workspace cross-region replica',
      'A Conditional Access What-if'
    ),
    correct: ['a'],
    explanation: 'Per-setting status surfaces apply results per setting per device. The other options aren\'t diagnostics for profile application.',
    references: [REF_CONFIG_PROFILE, REF_INTUNE_ADMIN]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want certain Windows devices to receive a different ESP than the default. Which Intune mechanism supports a per-group ESP?',
    options: opts4(
      'Create an additional Enrollment Status Page profile and assign it to specific groups (with appropriate priority)',
      'A scheduled analytics rule',
      'A compliance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Multiple ESPs can be assigned with priorities, allowing per-group ESP customization. The other options don\'t affect ESP.',
    references: [REF_ESP, REF_AUTOPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want all newly enrolled Windows devices to receive a baseline set of certificates BEFORE the user signs in. Which Autopilot mode best supports prep BEFORE user sign-in?',
    options: opts4(
      'Pre-provisioned deployment (formerly white glove) so IT prep happens before shipment',
      'User-driven mode',
      'Autopilot Reset',
      'Manual sysprep imaging'
    ),
    correct: ['a'],
    explanation: 'Pre-provisioned runs IT phase to apply policies/apps/certs before shipping to the user. User-driven runs everything at user sign-in. Reset wipes; sysprep is legacy.',
    references: [REF_AUTOPILOT_PRE, REF_AUTOPILOT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to apply a managed configuration to Microsoft Edge on macOS managed devices. Which Intune object applies?',
    options: opts4(
      'A macOS configuration profile (Settings catalog or Custom profile with the Edge .mobileconfig payload)',
      'A Windows configuration profile',
      'A Conditional Access policy',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'macOS configuration profiles apply Edge managed config. Windows profiles don\'t target macOS.',
    references: [REF_CONFIG_PROFILE, REF_SETTINGS_CATALOG]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Cloud PC user needs a different SKU (more RAM). Which Windows 365 surface lets the admin change the Cloud PC SKU?',
    options: opts4(
      'Windows 365 / Intune admin center → Cloud PCs → resize / change provisioning policy',
      'A Conditional Access policy',
      'A compliance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Cloud PC sizing is changed via the Cloud PC resize action or by reassigning provisioning. The other options don\'t change SKUs.',
    references: [REF_W365, REF_W365_DEPLOY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports a hung managed Windows device. Which Intune remote action is the safest first attempt?',
    options: opts4(
      'Restart (with a reasonable countdown so the user can save work)',
      'Wipe (factory reset)',
      'Retire',
      'Rotate BitLocker keys'
    ),
    correct: ['a'],
    explanation: 'Restart is safest. Wipe/Retire are destructive; Rotate BitLocker keys doesn\'t unhang a device.',
    references: [REF_REMOTE_ACTIONS, REF_REMOTE_WIPE]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Intune assignment filters.',
    options: opts4(
      'Filters use device properties (e.g., model, OS version, ownership, enrollment profile name).',
      'Filters can include or exclude on the assignment of apps, policies, and profiles.',
      'Filters require Intune Suite licenses to use.',
      'Filters apply on top of group-based targeting.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Filters are property-based, used inclusively/exclusively on assignment, on top of group targeting. They do NOT require Intune Suite to use.',
    references: [REF_FILTERS, REF_CONFIG_PROFILE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want each Autopilot-enrolled device to be added automatically to a Microsoft Entra dynamic group named "Autopilot Pilot" by Autopilot profile assignment. Which mechanism supports this association?',
    options: opts4(
      'Assign the Autopilot deployment profile to a dynamic device group with rule on (device.devicePhysicalIds -any _ -contains "[ZTDId]")',
      'A static security group with manual updates',
      'A Conditional Access policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Autopilot uses the ZTDId property in dynamic group rules. Static groups don\'t scale. CA/retention aren\'t group definitions.',
    references: [REF_AUTOPILOT, REF_DYN_GROUPS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Windows 11 Cloud PC user complains of slow logon. Which Cloud PC capability surfaces user experience and signed-in latency metrics?',
    options: opts4(
      'Cloud PC Connection Quality / User Experience reports in the Intune admin center',
      'A Conditional Access What-if',
      'A Defender Antivirus exclusion',
      'A Sentinel hunting bookmark'
    ),
    correct: ['a'],
    explanation: 'Windows 365 surfaces connection quality and UX reports. The other options aren\'t Cloud PC telemetry.',
    references: [REF_W365, REF_W365_DEPLOY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to track if a configuration profile is "in conflict" with another policy for the same setting on the same device. Which Intune view is useful?',
    options: opts4(
      'Per-setting status with "Conflict" indication and conflict resolution guidance in the profile/device pages',
      'A workspace cross-region replica',
      'A Defender for Cloud Apps governance log',
      'A Sentinel watchlist'
    ),
    correct: ['a'],
    explanation: 'Per-setting status flags conflicts and points at the source policies. The other options aren\'t conflict diagnostics.',
    references: [REF_CONFIG_PROFILE, REF_INTUNE_ADMIN]
  },

  // ── Manage applications (13) ──
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a managed Android Enterprise app to require a numeric PIN before the user can access corporate data within the app. Which Intune object does this?',
    options: opts4(
      'An app protection policy (MAM) for Android with "Require PIN for access"',
      'A device configuration profile only',
      'A Defender Antivirus policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'APP/MAM enforces PIN inside managed apps. The other options don\'t apply to app-level PINs.',
    references: [REF_APP_PROTECTION, REF_APP_CONFIG_APP]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A LOB Win32 app needs to be replaced by a newer version on managed devices. Which Intune feature supports versioned replacement without users uninstalling first?',
    options: opts4(
      'Win32 app supersedence (newer app supersedes older app with optional uninstall)',
      'A compliance policy',
      'A Conditional Access named location',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Win32 app supersedence handles version upgrades cleanly. The other options aren\'t app-replacement features.',
    references: [REF_APP_DEPLOY, REF_APPS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a Microsoft Store (UWP) app to managed Windows 11 devices via Intune. Which app type is appropriate?',
    options: opts4(
      'Microsoft Store app (new) — Intune integrates with the new Microsoft Store',
      'iOS store app',
      'LOB app (.msi)',
      'Win32 .intunewin'
    ),
    correct: ['a'],
    explanation: 'Microsoft Store app type targets store-distributed Windows apps. iOS store is iOS-only; LOB MSI and Win32 are different packaging.',
    references: [REF_APP_DEPLOY, REF_APPS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want Outlook on personal iOS devices to allow saving attachments ONLY to approved cloud storage (e.g., OneDrive for Business), not personal iCloud. Which APP setting?',
    options: opts4(
      'In the iOS app protection policy, configure "Save copies of org data" → "Block" with exceptions for approved cloud storage providers',
      'A compliance policy',
      'A workspace retention policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'APP "Save org data" controls and exceptions specify approved providers. The other options don\'t.',
    references: [REF_APP_PROTECTION]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a configuration to managed Microsoft Edge on Windows that pre-populates SSO URLs and disables InPrivate browsing. Which Intune mechanism?',
    options: opts4(
      'A Settings catalog configuration profile with Microsoft Edge settings or an Administrative templates profile',
      'A compliance policy',
      'A Sentinel hunting query',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Settings catalog or admin templates apply Edge policies on Windows. The other options aren\'t configuration mechanisms.',
    references: [REF_SETTINGS_CATALOG, REF_ADMIN_TEMPLATES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to install certain optional apps from the Company Portal. Which app assignment intent makes them visible but not auto-installed?',
    options: opts4(
      'Available for enrolled devices / Available with or without enrollment',
      'Required',
      'Uninstall',
      'None'
    ),
    correct: ['a'],
    explanation: '"Available" makes apps appear in Company Portal for user choice. Required auto-installs. Uninstall removes. None doesn\'t assign.',
    references: [REF_APP_ASSIGN, REF_APP_DEPLOY]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure an Office app protection policy with "Encrypt org data" enabled. What does this protection do?',
    options: opts4(
      'Encrypts corporate data within the app using a key tied to the user/account so it cannot be read by other apps without policy',
      'Encrypts the entire device storage',
      'Disables Microsoft 365 globally',
      'Enables Conditional Access trusted locations'
    ),
    correct: ['a'],
    explanation: 'APP encrypts org data inside managed apps with a per-user key. It is not device-level encryption or CA configuration.',
    references: [REF_APP_PROTECTION]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want an Azure-hosted line-of-business website to require devices to have an MDM-issued certificate present BEFORE access. Which Conditional Access control type fits?',
    options: opts4(
      'Conditional Access with custom controls / authentication strengths and certificate-based authentication (requires the cert issued by your trusted CA)',
      'A compliance policy alone',
      'A Defender Antivirus exclusion',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'CA certificate-based auth (with auth strengths) enforces cert presence. Compliance alone doesn\'t enforce cert presentation. The other options are unrelated.',
    references: [REF_CA, REF_CLOUD_PKI]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Microsoft Teams to be installed automatically and pinned in the taskbar on managed Windows 11 devices. Which combination achieves this?',
    options: opts4(
      'Deploy Teams (built-in or LOB) as Required + a configuration profile that pins Teams via Start layout customization or the New Teams admin policies',
      'A compliance policy',
      'A LOB app set to Uninstall',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Required app install + pinning via Start layout/Teams admin policies. The other options don\'t pin Teams.',
    references: [REF_APP_DEPLOY, REF_SETTINGS_CATALOG]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a managed Android app to receive its server endpoint from Intune. Which app configuration policy targets managed devices (vs MAM)?',
    options: opts4(
      'App configuration policy for managed devices (targeting Android Enterprise enrolled devices)',
      'App configuration policy for managed apps (MAM)',
      'Compliance policy',
      'Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'For Android Enterprise managed devices, app configuration policies for managed devices apply. The MAM variant targets non-enrolled scenarios. The others don\'t deliver app config.',
    references: [REF_APP_CONFIG_DEVICE, REF_APP_CONFIG_APP]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to package a complex Win32 app that has a series of pre-install scripts and a custom uninstall script. The right Intune feature is:',
    options: opts4(
      'Win32 app (.intunewin) with detection rules and PowerShell install/uninstall commands plus return-code handling',
      'LOB app (.msi) only',
      'Microsoft Store app',
      'iOS store app'
    ),
    correct: ['a'],
    explanation: 'Win32 .intunewin handles custom commands, detection, dependencies, supersedence, and return-code mapping. MSI LOB is more limited; store apps are different.',
    references: [REF_APP_DEPLOY, REF_APPS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to revoke Microsoft 365 app sessions for a user whose phone was lost. Which Microsoft surface supports forcing token revocation?',
    options: opts4(
      'Microsoft Entra user properties → Revoke sessions (or Microsoft Graph revokeSignInSessions)',
      'An Intune configuration profile',
      'A workspace retention policy',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Revoke sessions in Entra invalidates refresh tokens; access tokens expire shortly after. The other options don\'t revoke tokens.',
    references: [REF_CA, REF_APP_PROTECTION]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to be required to enroll their device into Intune before they can access SharePoint Online from the Microsoft Authenticator app. Which Conditional Access grant control achieves this?',
    options: opts4(
      'Require device to be marked as compliant (combined with assignment to managed app set or Cloud apps as appropriate)',
      'Require named location only',
      'Require sign-in frequency: 1 year',
      'Disable MFA'
    ),
    correct: ['a'],
    explanation: 'Require compliant device gates the resource on Intune compliance after enrollment. The others don\'t enforce enrollment.',
    references: [REF_CA_COMPLIANT, REF_CA]
  },

  // ── Protect devices (13) ──
  {
    domain: PROTECT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want managed Windows 11 devices to block lateral macro execution from Word documents downloaded from the internet. Which Intune endpoint security policy is appropriate?',
    options: opts4(
      'Attack surface reduction policy that enables ASR rules including "Block Office macros from making Win32 API calls" (and related Office-macro rules)',
      'A Conditional Access policy',
      'A workspace retention policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'ASR rules block specific Office/macro behaviors. CA/retention/LOB don\'t block macros.',
    references: [REF_ASR_INTUNE, REF_ASR]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You apply the Microsoft "Windows 11 security baseline (v23H2)" and several settings conflict with existing custom profiles. The recommended approach is:',
    options: opts4(
      'Resolve conflicts by aligning the custom profiles with the baseline (the baseline is the recommended starting point; custom profiles should layer in only justified exceptions)',
      'Delete the baseline immediately',
      'Disable Defender Antivirus',
      'Disable Conditional Access for the tenant'
    ),
    correct: ['a'],
    explanation: 'Baselines are recommended defaults; custom profiles should be exceptions with rationale. Disabling baseline/AV/CA weakens posture.',
    references: [REF_BASELINES]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Windows devices to inbound-block all traffic except a specific port 8443 for an internal app. Which Intune object expresses this?',
    options: opts4(
      'Endpoint security Firewall policy with a custom inbound allow rule for TCP 8443 (default block remaining)',
      'A workspace retention policy',
      'A Sentinel hunting query',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Firewall policies define rules and inbound defaults. The other options aren\'t firewall config.',
    references: [REF_FIREWALL, REF_ENDPOINT_SEC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows 11 devices to enforce specific Microsoft Defender Antivirus exclusions (e.g., a vendor LOB app folder). Which Intune object expresses this?',
    options: opts4(
      'Antivirus policy with the necessary file/folder/process exclusions',
      'A workspace retention policy',
      'A Defender for Cloud Apps governance policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'Defender AV exclusions are configured via the Antivirus endpoint security policy. The other options aren\'t AV configuration.',
    references: [REF_ANTIVIRUS, REF_ENDPOINT_SEC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to onboard a fleet of Windows 11 managed devices to Microsoft Defender for Endpoint via Intune in one step. Which Intune policy type?',
    options: opts4(
      'Endpoint security Endpoint detection and response (EDR) policy with the MDE connector configured',
      'A compliance policy alone',
      'A Conditional Access named location',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'EDR policy + MDE connector onboards devices. Compliance/CA/retention don\'t onboard MDE.',
    references: [REF_MDE_INT, REF_MDE_ONBOARD]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Windows 11 devices to defer feature updates by 60 days while keeping quality updates current. Which Intune feature controls this granularly?',
    options: opts4(
      'Windows Update for Business — feature update profile (deferral) + update rings for quality updates',
      'A Defender Antivirus exclusion',
      'A LOB app deployment',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Feature update profile + update rings split feature/quality update controls. The others don\'t control Windows updates.',
    references: [REF_UPDATES, REF_UPDATE_POLICY]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a managed iPad to install iOS 17.5 within 7 days of release. Which Intune object is purpose-built?',
    options: opts4(
      'iOS/iPadOS software update policy targeting supervised devices (ADE-enrolled) with the desired install deadline',
      'A Defender Antivirus exclusion',
      'A LOB app deployment',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'iOS update policies for supervised devices enforce update install timing. The others don\'t.',
    references: [REF_UPDATE_IOS, REF_COMPLIANCE_IOS]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enforce that BitLocker is enabled on the OS drive AND fixed data drives on managed Windows devices. Which Intune object expresses this?',
    options: opts4(
      'Endpoint security Disk encryption policy with BitLocker settings covering OS + Fixed drives',
      'A Conditional Access policy',
      'A LOB app deployment',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Disk encryption policy covers OS + fixed drive BitLocker requirements. The others aren\'t encryption controls.',
    references: [REF_DISK_ENCRYPTION, REF_BITLOCKER]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a centralized way to see which devices are MISSING Windows security updates per ring. Which Intune surface is purpose-built?',
    options: opts4(
      'Reports → Windows updates (showing per-ring deployment status, devices pending/failing)',
      'A Defender for Cloud Apps governance log',
      'A workspace cross-region replica',
      'A Conditional Access What-if'
    ),
    correct: ['a'],
    explanation: 'Windows updates report aggregates per-ring status. The other options aren\'t the update-status reports.',
    references: [REF_UPDATES, REF_UPDATE_POLICY]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enforce a specific iOS managed app to disable copy/paste outside approved apps. Which APP setting controls this?',
    options: opts4(
      'iOS app protection policy "Restrict cut, copy, and paste between other apps" set to "Policy managed apps"',
      'A device configuration profile only',
      'A compliance policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'APP cut/copy/paste restrictions enforce data-loss prevention inside managed apps. The other options don\'t.',
    references: [REF_APP_PROTECTION]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enforce that managed Windows devices reboot during a defined nighttime maintenance window after security updates install. Which feature controls this?',
    options: opts4(
      'Update rings with configurable Active hours / Restart settings, or Update settings in Windows Update for Business',
      'A Defender for Cloud Apps governance policy',
      'A LOB app deployment',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Update rings configure restart behavior and active hours. The other options don\'t.',
    references: [REF_UPDATE_POLICY, REF_UPDATES]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to use Delivery Optimization to allow internet peers (other devices on the same provider network) to share update bytes. Which Intune setting toggles this?',
    options: opts4(
      'Delivery Optimization configuration "Download mode" set to "HTTP blended with Internet peering"',
      'A Defender Antivirus exclusion',
      'A LOB app deployment',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Delivery Optimization Download mode selects peer-sharing scope. The other options don\'t affect DO.',
    references: [REF_DELIVERY_OPT, REF_UPDATES]
  },
  {
    domain: PROTECT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Defender for Endpoint integration with Microsoft Intune.',
    options: opts4(
      'Intune can onboard supported Windows / macOS / Linux devices to MDE via Endpoint security EDR policies.',
      'MDE risk-level signals can be a compliance signal in Intune compliance policies for Windows.',
      'Intune Endpoint security ASR / Antivirus / Firewall policies map to Defender capabilities on the device.',
      'MDE replaces the need for compliance policies in Intune.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'EDR policies onboard; MDE risk-level can drive compliance; AV/ASR/Firewall configure Defender. MDE does NOT replace compliance policies — they\'re complementary.',
    references: [REF_MDE_INT, REF_MDE_ONBOARD, REF_COMPLIANCE]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Prepare infrastructure for devices (18) ──
  {
    domain: PREPARE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A user enrolls a personal Windows laptop into Intune via the Company Portal (BYOD). Which device-identity state is established in Microsoft Entra?',
    options: opts4(
      'Microsoft Entra registered (personal/BYOD)',
      'Microsoft Entra joined (corporate)',
      'Hybrid joined',
      'Workgroup'
    ),
    correct: ['a'],
    explanation: 'Registered is for personal/BYOD with an Entra identity for access. Joined and Hybrid joined are corporate-owned scenarios.',
    references: [REF_ENTRA_REGISTER, REF_ENTRA_DEVICE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a dynamic device group whose membership rule is "all Entra joined Windows 11 devices NOT in pilot category". Which rule snippet is correct?',
    options: opts4(
      '(device.deviceOSType -eq "Windows") and (device.deviceOSVersion -startsWith "10.0.22") and (device.deviceTrustType -eq "AzureAD") and (device.deviceCategory -ne "Pilot")',
      '(user.department -eq "IT") and (device.deviceOSType -eq "Mac")',
      '(group.objectId -eq "00000000-0000-0000-0000-000000000000")',
      '(device.compliance -eq "Failed")'
    ),
    correct: ['a'],
    explanation: 'Dynamic device rules use device.* attributes (deviceOSType, deviceTrustType, deviceCategory, OSVersion). The other options either don\'t match the criteria or aren\'t valid syntax.',
    references: [REF_DYN_GROUPS, REF_DEVICE_GROUPS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A new Mac model arrives at the office. You want to enroll it without Apple Business Manager or user interaction. Which Intune-supported alternative exists?',
    options: opts4(
      'User-driven enrollment via the Company Portal for macOS — user signs in to enroll (BYOD-style)',
      'Use Windows Autopilot',
      'Use an Android Enterprise enrollment profile',
      'Manual sysprep'
    ),
    correct: ['a'],
    explanation: 'Without ABM, user-driven enrollment via Company Portal for macOS is the supported path. Autopilot/Android Enterprise/sysprep are different platforms or legacy approaches.',
    references: [REF_ENROLL, REF_INTUNE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to set the maximum number of devices a single user can enroll into Intune. Which Intune setting controls this?',
    options: opts4(
      'Device enrollment limit (under Devices → Enrollment → Enrollment device limit restrictions)',
      'A compliance policy',
      'A Conditional Access named location',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'Enrollment device limit restrictions cap per-user enrollment count. The other options don\'t.',
    references: [REF_ENROLL_RESTRICT, REF_ENROLL]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want compliance "Require encryption of data storage on device" enabled for all corporate iPhones. Which Intune object expresses this?',
    options: opts4(
      'An iOS/iPadOS compliance policy with "Require encryption of data storage on device" enabled',
      'A Windows compliance policy',
      'A Defender Antivirus exclusion',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'iOS compliance policies define encryption requirements (iOS encrypts by default when passcode is set). Windows policy doesn\'t apply; the others aren\'t compliance.',
    references: [REF_COMPLIANCE_IOS, REF_COMPLIANCE]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Cloud PKI for Intune.',
    options: opts4(
      'It is a Microsoft-hosted PKI service for issuing certificates to Intune-managed users and devices.',
      'It removes the need to operate on-prem AD CS and NDES infrastructure for the supported scenarios.',
      'Certificates issued by Cloud PKI can be referenced in Wi-Fi and VPN profiles.',
      'Cloud PKI replaces Microsoft Entra ID Protection.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Cloud PKI is a hosted issuance service that replaces self-run AD CS/NDES for many scenarios and integrates with Intune profiles. It does NOT replace ID Protection (which is risk-based identity protection).',
    references: [REF_CLOUD_PKI, REF_VPN, REF_WIFI]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows 11 devices to NOT escrow the BitLocker recovery key to Entra ID due to a data-residency requirement. Which alternative escrow path exists?',
    options: opts4(
      'On-prem Active Directory (when devices are hybrid-joined and configured for AD escrow) — though for Entra-joined the recommended path is Entra escrow',
      'A workspace retention policy',
      'A Conditional Access named location',
      'A Sentinel watchlist'
    ),
    correct: ['a'],
    explanation: 'Hybrid-joined devices can escrow to on-prem AD. Entra-joined devices use Entra escrow. The other options aren\'t escrow targets.',
    references: [REF_BITLOCKER, REF_HYBRID_JOIN]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC analyst wants Intune compliance to mark a Windows device "non-compliant" if Microsoft Defender for Endpoint risk level is Medium or higher. Which combination supports this?',
    options: opts4(
      'Enable the MDE compliance connection in Intune + add the rule "Machine risk score" to the Windows compliance policy',
      'A Conditional Access named location',
      'A workspace retention policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'MDE risk-level flows into the Windows compliance policy when the MDE connector is enabled. The other options don\'t bridge the signals.',
    references: [REF_MDE_INT, REF_COMPLIANCE_W]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want only iOS devices that have a serial number in your Apple Business Manager and an Intune ADE profile to enroll. Which mechanism stops manual user-driven iOS enrollment?',
    options: opts4(
      'Set Personal device enrollment to Block (Allow only Corporate) in Enrollment restrictions, and only ABM-known serials map to your tenant',
      'A workspace cross-region replica',
      'A Sentinel hunting query',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'Restricting Personal devices ensures only ABM-claimed serials can enroll as Corporate. The other options don\'t restrict enrollment.',
    references: [REF_ENROLL_RESTRICT, REF_APPLE_ABM]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable Windows Hello for Business in cloud trust mode in a hybrid environment. Which on-prem dependency is needed for users to access on-prem Kerberos-authenticated resources?',
    options: opts4(
      'Microsoft Entra Kerberos (deployed in your on-prem AD via the Entra Kerberos PowerShell module)',
      'An ASR rule',
      'A workspace retention policy',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Entra Kerberos provides cloud Kerberos trust into AD for WHfB cloud trust mode. The other options don\'t.',
    references: [REF_WHFB_HYBRID, REF_HYBRID_JOIN]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a baseline compliance policy that applies to ALL platforms (Windows, iOS, Android, macOS) with a common minimum-OS-version-style enforcement. Which approach is realistic?',
    options: opts4(
      'Create per-platform compliance policies (one each for Windows, iOS, Android, macOS) targeted to the same group — compliance policies are platform-specific',
      'Create a single multi-platform compliance policy',
      'Use a Conditional Access policy in place of compliance',
      'Use a workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Compliance policies are platform-specific. Create one per platform and target the same group. CA is enforcement, not definition. Retention is unrelated.',
    references: [REF_COMPLIANCE, REF_COMPLIANCE_W, REF_COMPLIANCE_IOS, REF_COMPLIANCE_ANDROID, REF_COMPLIANCE_MAC]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a corporate Android Enterprise dedicated kiosk to display only a single app (e.g., a check-in kiosk). Which Intune configuration achieves this?',
    options: opts4(
      'A device-restrictions / device configuration profile for Android Enterprise dedicated with kiosk mode (single-app or multi-app) and the allowed app(s)',
      'A LOB app marked as Required only',
      'A compliance policy',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Android dedicated kiosk profiles configure single-app or multi-app kiosk mode. The other options don\'t lock the device down.',
    references: [REF_ANDROID_DEDICATED, REF_CONFIG_PROFILE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to expand Intune RBAC to grant a specific user the ability to assign Win32 apps, but not modify compliance policies. Which RBAC approach is best?',
    options: opts4(
      'Create a custom Intune role with App assignment permissions only and assign to the user (with scope tags)',
      'Make the user Global Administrator',
      'Use a Conditional Access policy',
      'Use a workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Custom roles with least-privilege permissions support fine-grained control. Global Admin is excessive; CA/retention aren\'t RBAC.',
    references: [REF_INTUNE_ROLES, REF_INTUNE_SCOPE]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows devices to be classified by their device category (e.g., Sales, Engineering) for assignment scoping. Which Intune feature does this?',
    options: opts4(
      'Device categories — admin-defined buckets that users (or admins) can assign devices to during/after enrollment',
      'Conditional Access named locations',
      'Workspace retention policies',
      'LOB app assignment intents'
    ),
    correct: ['a'],
    explanation: 'Device categories assign devices to admin-defined buckets for use in dynamic groups and scoping. The other options don\'t.',
    references: [REF_DEVICE_GROUPS, REF_DYN_GROUPS]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable Conditional Access to require a "Compliant device" for SharePoint Online. A user on a non-enrolled Mac is blocked from SharePoint. The user wants temporary access. The safe path is to:',
    options: opts4(
      'Have the user enroll the Mac in Intune so it can be marked Compliant',
      'Disable the Conditional Access policy temporarily',
      'Add the user to Global Administrators',
      'Disable MFA tenant-wide'
    ),
    correct: ['a'],
    explanation: 'Enrollment + compliance fixes the gap without weakening policy. The other options weaken security broadly.',
    references: [REF_CA_COMPLIANT, REF_ENROLL]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to allow specific iOS-personally-owned devices to enroll as "Corporate" rather than "Personal". Which Intune mechanism marks them Corporate?',
    options: opts4(
      'Add the device IMEI or serial numbers to the corporate device identifiers list in Devices → Enrollment',
      'A compliance policy',
      'A Defender Antivirus exclusion',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Corporate device identifiers (IMEI/serial) flip the ownership state to Corporate at enrollment. The other options don\'t.',
    references: [REF_ENROLL, REF_ENROLL_RESTRICT]
  },
  {
    domain: PREPARE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want every Microsoft Entra hybrid-joined device to receive an automatic Intune enrollment. Which Group Policy / Intune combination is required?',
    options: opts4(
      'Group Policy "Enable automatic MDM enrollment using default Azure AD credentials" on the on-prem AD policy targeting hybrid devices, combined with Mobility MDM scope set to All in Entra',
      'A workspace retention policy',
      'A Sentinel hunting query',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'Auto-enrollment for hybrid devices uses the GPO + Mobility MDM scope settings. The other options don\'t enable auto-enrollment.',
    references: [REF_ENROLL_AUTO_W, REF_HYBRID_JOIN]
  },
  {
    domain: PREPARE, difficulty: 2, type: QType.SINGLE,
    stem: 'A user with PERSONAL Android device wants to access Outlook + Teams without MDM enrollment, while keeping company data protected. The right Intune flow is:',
    options: opts4(
      'Configure app protection policies (MAM) + Conditional Access requiring approved client app and app protection policy',
      'Require full MDM enrollment',
      'Block all Android devices',
      'Disable MFA'
    ),
    correct: ['a'],
    explanation: 'APP + CA delivers MAM-without-enrollment for personal devices. Requiring MDM defeats the BYOD ask. Blocking/disabling MFA degrades posture.',
    references: [REF_APP_PROTECTION, REF_CA_APP_PROT]
  },

  // ── Manage and maintain devices (21) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A user requests their Cloud PC be temporarily upgraded from 4 vCPU / 16 GB RAM to 8 vCPU / 32 GB RAM for a CAD project. Which Windows 365 action does this?',
    options: opts4(
      'Resize Cloud PC (changes size of the existing user\'s Cloud PC without reprovisioning)',
      'Wipe device',
      'Run a Defender Antivirus offline scan',
      'Create a Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Cloud PC resize changes the SKU in place. Wipe is destructive; AV scan/CA are unrelated.',
    references: [REF_W365, REF_W365_DEPLOY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to add a new device platform to your Intune device-restrictions baseline — Android Enterprise. Which Intune object configures the baseline restrictions?',
    options: opts4(
      'A device configuration profile of type "Device restrictions" for Android Enterprise',
      'A LOB app',
      'A compliance policy alone',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Device restrictions profiles bundle multi-setting restrictions per platform. The other options don\'t.',
    references: [REF_CONFIG_PROFILE, REF_ANDROID_FULLY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want devices to receive a deployment profile during Autopilot that BLOCKS local admin assignment to the enrolling user. Which Autopilot setting is appropriate?',
    options: opts4(
      'In the Autopilot deployment profile, set "User account type" = Standard (instead of Administrator)',
      'A compliance policy',
      'A workspace retention policy',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Autopilot profile user account type controls local admin/standard. The other options don\'t affect that during Autopilot.',
    references: [REF_AUTOPILOT, REF_AUTOPILOT_DEVICE_UP]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows 11 devices to have a custom desktop wallpaper deployed via Intune. Which mechanism applies?',
    options: opts4(
      'A Settings catalog (or admin templates) profile that sets the Personalization / Wallpaper policy',
      'A Defender Antivirus exclusion',
      'A workspace retention policy',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Personalization settings (wallpaper) are configured via Settings catalog/admin templates. The other options don\'t set wallpaper.',
    references: [REF_SETTINGS_CATALOG, REF_ADMIN_TEMPLATES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Windows device shows configuration profile status "Error: 0x87d1fde8 (Remediation failed)". The best initial diagnostic step in Intune is to:',
    options: opts4(
      'Open the device → Configuration → expand the profile → review per-setting status with error codes and recommended remediation',
      'Wipe the device',
      'Disable Defender Antivirus',
      'Disable Conditional Access for the tenant'
    ),
    correct: ['a'],
    explanation: 'Per-setting error detail guides remediation. Wipe/disabling AV/CA are inappropriate first steps.',
    references: [REF_CONFIG_PROFILE, REF_SETTINGS_CATALOG]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a managed iPad to receive a Wi-Fi profile pre-configured with EAP-TLS and a Cloud PKI cert. Which Intune profile sequence is supported?',
    options: opts4(
      'Deploy a SCEP / Cloud PKI certificate profile + a Wi-Fi profile that references it',
      'A LOB app',
      'A compliance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Cert profile + Wi-Fi referencing it is the standard pattern. The other options don\'t deliver certs/Wi-Fi.',
    references: [REF_CLOUD_PKI, REF_WIFI]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to push a corporate VPN profile to managed macOS devices using a per-app VPN configuration. Which Intune mechanism supports this?',
    options: opts4(
      'A macOS VPN configuration profile with per-app VPN configured to selected managed apps',
      'A Defender Antivirus exclusion',
      'A workspace cross-region replica',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'macOS VPN profiles support per-app VPN. The other options don\'t.',
    references: [REF_VPN, REF_CONFIG_PROFILE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a one-off Run remediation script to scan registry keys on 100 Windows devices and report findings to Intune. Which feature is purpose-built?',
    options: opts4(
      'Intune Remediations (detection + remediation PowerShell scripts) with results in the Remediations report',
      'A compliance policy',
      'A workspace retention policy',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Intune Remediations run detection + remediation PS scripts at scale with reporting. The other options don\'t run PS scripts.',
    references: [REF_INTUNE, REF_DEVICE_QUERY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed devices in the "Finance" group to NOT receive a configuration profile that other groups receive. Which assignment construct uses an exclusion?',
    options: opts4(
      'Add the Finance group to the profile assignment\'s Excluded groups',
      'Create a separate workspace',
      'Apply a workspace retention policy',
      'Use a Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Excluded groups in the assignment block delivery to the listed group. The other options don\'t scope assignments.',
    references: [REF_CONFIG_PROFILE, REF_DEVICE_GROUPS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to run a remote action that deletes a corrupt user profile from a managed Windows 11 device. Which Intune feature is best?',
    options: opts4(
      'A Remediations script (PowerShell) that deletes the user profile under controlled conditions',
      'A device wipe',
      'A retire',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'PowerShell remediations are appropriate for targeted maintenance. Wipe/retire are destructive; CA is unrelated.',
    references: [REF_INTUNE, REF_REMOTE_ACTIONS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a single-image policy that deploys a Win32 app to all Autopilot-enrolled devices that are marked "Engineering". Which combination is best?',
    options: opts4(
      'Deploy the Win32 app to an Engineering dynamic device group; use Autopilot device-category to set "Engineering" at enrollment',
      'Manually copy installer to USB drives',
      'A workspace retention policy',
      'A compliance policy'
    ),
    correct: ['a'],
    explanation: 'Device category + dynamic group + app assignment scales declaratively. The other options don\'t.',
    references: [REF_AUTOPILOT, REF_DYN_GROUPS, REF_APP_DEPLOY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A managed Windows 11 device\'s Settings catalog policy contains a setting that no longer applies. Which best practice avoids leaving stale settings on the device?',
    options: opts4(
      'Use "Not configured" or remove the setting from the policy and re-deploy — Intune sends the remove instruction (tattooing depends on each CSP)',
      'Delete the workspace',
      'Wipe every affected device',
      'Disable Conditional Access for the tenant'
    ),
    correct: ['a'],
    explanation: 'Removing a setting (or re-deploying as not configured) reverses settings where the CSP supports it. Some CSPs tattoo state; document and remediate. The other options are inappropriate.',
    references: [REF_SETTINGS_CATALOG, REF_CONFIG_PROFILE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a Microsoft Cloud PKI–issued cert to renew automatically on managed Windows devices before expiration. Which Intune setting is required?',
    options: opts4(
      'Configure the certificate profile with a renewal threshold (e.g., 20%) so it renews before expiry',
      'A Conditional Access named location',
      'A workspace retention policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'Cert profile renewal threshold drives auto-renewal before expiry. The other options don\'t.',
    references: [REF_CLOUD_PKI]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Intune to give SOC analysts a per-device security score, helping prioritize remediation. Which Microsoft surface is intended?',
    options: opts4(
      'Microsoft Secure Score (in the Defender portal) with the Intune secure score recommendations',
      'A Sentinel watchlist',
      'A Conditional Access What-if',
      'A workspace cross-region replica'
    ),
    correct: ['a'],
    explanation: 'Secure Score aggregates posture across MDE, Entra, Defender for Cloud, etc., and surfaces Intune-driven recommendations. The other options don\'t score posture.',
    references: [REF_MDE_INT, REF_ENDPOINT_SEC]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Intune Suite — Endpoint Privilege Management (EPM).',
    options: opts4(
      'It allows specific apps to elevate without making the user a local administrator.',
      'It supports approval workflows where end users request elevation and admins approve.',
      'It logs elevation activity for audit and reporting.',
      'It applies to macOS and Linux devices as well as Windows.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'EPM elevates specific apps, supports approval flows, and audits. It is currently a Windows feature.',
    references: [REF_EPM]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Android Enterprise work-profile devices to disable the personal Camera. Which type of profile applies?',
    options: opts4(
      'A device restrictions profile targeting Android Enterprise personally-owned work profile devices that disables Camera within the work profile',
      'A LOB app',
      'A compliance policy',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Restrictions profiles control work-profile features. The other options don\'t.',
    references: [REF_ANDROID_WORK, REF_CONFIG_PROFILE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Sentinel SOC to see KQL-based events from Intune Advanced Analytics (e.g., anomalies). Which feature integration is appropriate?',
    options: opts4(
      'Use Intune Advanced Analytics insights surfaced in Intune; you can export logs or use the Microsoft Intune connector / diagnostic settings to forward data to Sentinel',
      'A workspace cross-region replica',
      'A LOB app deployment',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Intune Advanced Analytics shows insights in Intune; export/connectors send data to Sentinel for KQL. The other options don\'t bridge data.',
    references: [REF_ADV_ANALYTICS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a managed device\'s collected logs uploaded to Intune for support. Which remote action is purpose-built for this?',
    options: opts4(
      'Collect diagnostics (on Windows devices, gathers MDM diagnostic logs to Intune for download)',
      'Wipe device',
      'Restart device',
      'Retire device'
    ),
    correct: ['a'],
    explanation: '"Collect diagnostics" gathers MDM logs to Intune. Wipe/Restart/Retire are different remote actions.',
    references: [REF_REMOTE_ACTIONS, REF_INTUNE_ADMIN]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to apply different configuration profiles to Windows 10 vs Windows 11. Which feature scopes assignment by OS version?',
    options: opts4(
      'Intune assignment filters with rule device.osVersion (e.g., startsWith "10.0.22" for Windows 11 22H2)',
      'A workspace retention policy',
      'A Conditional Access named location',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Assignment filters can target by osVersion. The other options don\'t scope assignments.',
    references: [REF_FILTERS, REF_CONFIG_PROFILE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a Microsoft Edge bookmark bar configuration to managed Windows devices. Which Intune mechanism applies?',
    options: opts4(
      'A Settings catalog configuration profile setting Microsoft Edge "Managed favorites" (BookmarkList)',
      'A workspace retention policy',
      'A Conditional Access named location',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Settings catalog (or admin templates) configures Edge managed favorites. The other options don\'t.',
    references: [REF_SETTINGS_CATALOG, REF_ADMIN_TEMPLATES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to perform a one-time Sync remote action across 50 specific devices selected from a search/filter result. Which Intune feature scales this without per-device clicks?',
    options: opts4(
      'Bulk device actions invoked from Devices → Bulk Device Actions (with optional CSV import of device IDs)',
      'Wipe each device individually',
      'A Conditional Access named location',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Bulk Device Actions scales sync/restart/wipe across multiple devices in one command. Per-device clicks don\'t scale. The other options aren\'t bulk action surfaces.',
    references: [REF_BULK_ACTIONS, REF_REMOTE_ACTIONS]
  },

  // ── Manage applications (13) ──
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want users to install Microsoft Teams as REQUIRED on managed Windows 11 devices. Which app assignment intent and target group?',
    options: opts4(
      'Required intent assigned to a group containing the users (or devices)',
      'Uninstall intent',
      'Available with self-service only',
      'None'
    ),
    correct: ['a'],
    explanation: 'Required auto-installs. Available is opt-in. Uninstall removes. None doesn\'t assign.',
    references: [REF_APP_ASSIGN, REF_APP_DEPLOY]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want an in-house iOS app distributed without using the public App Store. The Intune-supported pattern is:',
    options: opts4(
      'Add the app as an "iOS line-of-business app" (.ipa) signed with your Apple Developer Enterprise certificate',
      'Use a Microsoft Store app',
      'Use Win32 .intunewin',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'iOS LOB apps are .ipa signed with an Enterprise dev cert. The other options aren\'t iOS LOB.',
    references: [REF_APP_DEPLOY, REF_APPS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to push a managed configuration to "Microsoft Outlook" on managed Android Enterprise (fully managed) devices — pre-set the Exchange server and account. Which policy type is correct?',
    options: opts4(
      'App configuration policy for managed devices targeting Outlook on Android Enterprise',
      'App protection policy (MAM) for Android',
      'Compliance policy',
      'Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'For managed devices, App configuration policies (managed device) push key/values into the app. APP/MAM is for protection, not config. CA is sign-in.',
    references: [REF_APP_CONFIG_DEVICE, REF_APP_PROTECTION]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a managed iOS app to block screenshots while corporate data is on screen. Which app protection setting controls this?',
    options: opts4(
      'iOS app protection policy "Screen capture and Google Assistant" / "Block screen capture and Google Assistant" (or "Restrict screenshot" depending on UI)',
      'A LOB app deployment intent',
      'A workspace retention policy',
      'A compliance policy'
    ),
    correct: ['a'],
    explanation: 'APP screen-capture restrictions block screenshots inside managed apps. The other options don\'t.',
    references: [REF_APP_PROTECTION]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a different Win32 LOB app deployed to ROLE A and another deployed to ROLE B. Which Intune feature handles per-role assignment cleanly?',
    options: opts4(
      'Assign each Win32 app to the corresponding Entra group (Role A group / Role B group)',
      'A single combined app deployed to all users',
      'A workspace retention policy',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Per-app assignment to per-role groups is the simple correct pattern. The other options don\'t scope per role.',
    references: [REF_APP_DEPLOY, REF_APP_ASSIGN]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Office on managed Windows devices to follow specific tenant-wide policies (e.g., disable connected experiences). Which surface defines them?',
    options: opts4(
      'Microsoft 365 Apps admin center — Cloud policy service (user-centric Office policies)',
      'A device compliance policy',
      'A Defender for Cloud Apps governance policy',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Cloud policy in M365 Apps admin center applies Office policies per user. The other options aren\'t Office policy surfaces.',
    references: [REF_OFFICE_POLICY, REF_M365_ADMIN]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ensure that newly released Microsoft 365 Apps versions are validated on a pilot ring before broad rollout. Which M365 Apps admin center feature is intended?',
    options: opts4(
      'Servicing profiles in the Microsoft 365 Apps admin center (cloud-managed updates with rings)',
      'BitLocker recovery escrow',
      'Defender Antivirus exclusions',
      'Sentinel hunting bookmarks'
    ),
    correct: ['a'],
    explanation: 'Servicing profiles drive ringed M365 Apps updates from the M365 Apps admin center. The other options aren\'t app update controls.',
    references: [REF_M365_ADMIN, REF_OFFICE_POLICY]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports their managed Edge browser shows extensions they did not install. Which Intune feature can declaratively manage Edge extensions?',
    options: opts4(
      'A Settings catalog / admin templates profile configuring Microsoft Edge "ExtensionInstallForcelist" / "ExtensionInstallAllowlist" / blocklist',
      'A workspace retention policy',
      'A Sentinel hunting query',
      'A compliance policy'
    ),
    correct: ['a'],
    explanation: 'Edge extension lists are configured via policy. The other options don\'t.',
    references: [REF_SETTINGS_CATALOG, REF_ADMIN_TEMPLATES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a corporate iOS app to receive a cert-based authentication identity at app launch. Which combination is the supported pattern?',
    options: opts4(
      'A SCEP / Cloud PKI cert profile assigned to the device or user + an app configuration policy that references the cert in the app\'s configuration',
      'A compliance policy alone',
      'A workspace retention policy',
      'A Sentinel watchlist'
    ),
    correct: ['a'],
    explanation: 'Cert profile + app config policy referencing the cert is the supported pattern. The other options don\'t.',
    references: [REF_CLOUD_PKI, REF_APP_CONFIG_DEVICE]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want users to consent to an MDM app protection notice in the Company Portal before launching protected apps. Which APP setting controls this?',
    options: opts4(
      'App protection policy "Conditional launch — Custom Privacy notice / Terms" (or organization branding in the Company Portal)',
      'A workspace retention policy',
      'A Sentinel hunting query',
      'A compliance policy'
    ),
    correct: ['a'],
    explanation: 'Conditional launch / custom messages and Company Portal branding deliver the consent / notice. The other options don\'t.',
    references: [REF_APP_PROTECTION, REF_INTUNE_ADMIN]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure an APP and CA combo to block users on unmanaged devices from downloading SharePoint files. Which CA grant control matches?',
    options: opts4(
      'Require app protection policy (with Approved client apps as appropriate)',
      'Require named location',
      'Require sign-in frequency: 1 year',
      'Disable MFA'
    ),
    correct: ['a'],
    explanation: 'CA "Require app protection policy" requires APP-managed access. The other options don\'t.',
    references: [REF_CA_APP_PROT, REF_APP_PROTECTION]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a managed Win32 app to install with elevated privileges using EPM rather than as the user. Which EPM construct enables this?',
    options: opts4(
      'An EPM elevation rule that targets the installer (by hash/path/cert) and grants automatic or user-requested elevation',
      'A compliance policy',
      'A workspace retention policy',
      'A LOB app uninstall intent'
    ),
    correct: ['a'],
    explanation: 'EPM elevation rules grant elevation for specific files/processes. The other options don\'t elevate.',
    references: [REF_EPM]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to add a managed iOS app whose vendor only distributes via the App Store. Which app type is correct?',
    options: opts4(
      'iOS store app added by App Store URL/Bundle ID; if you also use VPP, assign via VPP for silent install',
      'iOS LOB (.ipa)',
      'Win32 .intunewin',
      'Microsoft Store app'
    ),
    correct: ['a'],
    explanation: 'iOS store apps are added by URL/Bundle ID; VPP enables silent install. LOB is for in-house IPAs; Win32 is Windows; Microsoft Store is Windows.',
    references: [REF_APP_STORE, REF_APP_DEPLOY]
  },

  // ── Protect devices (13) ──
  {
    domain: PROTECT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want managed iPads to require updating to iOS 17 within 30 days of release as a compliance signal. Which Intune object expresses this?',
    options: opts4(
      'iOS compliance policy with Minimum OS version configured',
      'A LOB app deployment',
      'A Defender Antivirus exclusion',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'Compliance Minimum OS version drives compliance/CA. The other options don\'t.',
    references: [REF_COMPLIANCE_IOS, REF_UPDATE_IOS]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows 11 devices to use Smart App Control to block unsigned and untrusted apps. Which Intune setting toggles this?',
    options: opts4(
      'A Settings catalog policy that enables Smart App Control (note: it operates in Evaluation / On / Off and may require reset to enable)',
      'A workspace retention policy',
      'A LOB app deployment',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Smart App Control is configured via policy. The other options don\'t.',
    references: [REF_SETTINGS_CATALOG, REF_ENDPOINT_SEC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows 11 devices to allow ONLY signed PowerShell scripts. Which Intune object expresses this?',
    options: opts4(
      'A Settings catalog (or admin templates) profile that sets the PowerShell Execution Policy to AllSigned',
      'A workspace retention policy',
      'A Conditional Access policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'PowerShell execution policy can be set via Settings catalog/admin templates. The others don\'t.',
    references: [REF_SETTINGS_CATALOG, REF_ADMIN_TEMPLATES]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed macOS devices to require FileVault disk encryption with key escrow. Which Intune object expresses this?',
    options: opts4(
      'A macOS Endpoint security Disk encryption (FileVault) policy with personal recovery key escrow to Intune',
      'A Windows BitLocker policy',
      'A compliance policy alone',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'macOS FileVault is configured via the Disk encryption endpoint security policy. Windows BitLocker doesn\'t apply; compliance evaluates; AV is separate.',
    references: [REF_DISK_ENCRYPTION, REF_COMPLIANCE_MAC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want managed Windows devices to deploy a custom antivirus signature update faster than the default 24-hour cadence. Which Intune feature controls this?',
    options: opts4(
      'An Antivirus policy with shorter "Check for signature updates before scan" or set Defender update frequency (some controls are via the Defender remote action "Update Defender Antivirus")',
      'A workspace retention policy',
      'A LOB app deployment',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Antivirus policy + Defender update remote action control update cadence. The other options don\'t.',
    references: [REF_ANTIVIRUS, REF_REMOTE_ACTIONS]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Defender for Endpoint to be the sole AV on managed Windows 11 devices, removing a third-party AV. Which Intune Antivirus policy setting helps?',
    options: opts4(
      'Configure the antivirus policy to ensure Microsoft Defender Antivirus is running and not in passive mode (when third-party AV is uninstalled)',
      'A workspace retention policy',
      'A Conditional Access policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'AV policy enforces Defender AV state. When third-party AV is removed, Defender exits passive. The other options don\'t affect AV state.',
    references: [REF_ANTIVIRUS, REF_MDE_INT]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enforce that managed Android Enterprise fully-managed devices use Google Play Protect. Which Intune Android compliance setting is appropriate?',
    options: opts4(
      'A device-restrictions / device-restrictions Android profile and an Android compliance policy that require Play Protect and SafetyNet/Play Integrity verification',
      'A Defender Antivirus exclusion',
      'A workspace retention policy',
      'A Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Android-specific compliance can require Play Protect / Play Integrity. The other options don\'t.',
    references: [REF_COMPLIANCE_ANDROID, REF_ANDROID_FULLY]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows 11 devices to defer macOS-like quality updates while still receiving security updates. Which combination is correct (per platform)?',
    options: opts4(
      'Use Windows Update for Business — separate Quality update profile / Update ring with deferrals for quality + an explicit "expedited quality update" or zero-deferral for security ratings',
      'A Conditional Access named location',
      'A compliance policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'WUfB separates quality / feature / driver and supports expedited updates. The others don\'t.',
    references: [REF_UPDATES, REF_UPDATE_POLICY]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to make sure Defender Antivirus signatures and engine on managed Windows devices are current. Which Intune remote action triggers an update?',
    options: opts4(
      'Update Microsoft Defender Antivirus security intelligence (signatures)',
      'Wipe device',
      'Restart device',
      'Retire device'
    ),
    correct: ['a'],
    explanation: 'A dedicated remote action updates Defender signatures. Wipe/Restart/Retire don\'t target signatures.',
    references: [REF_REMOTE_ACTIONS, REF_ANTIVIRUS]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enforce that Windows 11 managed devices have Microsoft Defender Application Guard or App Control for Business configured. Which Intune surface targets this?',
    options: opts4(
      'Endpoint security → App and browser isolation (Application Guard) and App control for business policies',
      'A Conditional Access named location',
      'A workspace retention policy',
      'A LOB app deployment'
    ),
    correct: ['a'],
    explanation: 'App and browser isolation and App Control policies live under Endpoint security. The other options don\'t configure them.',
    references: [REF_ENDPOINT_SEC, REF_BASELINES]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enable Tamper protection on managed Windows 11 devices so users cannot disable Defender Antivirus. Which Intune setting controls this?',
    options: opts4(
      'In the Endpoint security Antivirus policy, enable "Turn on tamper protection"',
      'A workspace retention policy',
      'A Sentinel hunting query',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Tamper protection is set in the Antivirus endpoint security policy. The other options don\'t.',
    references: [REF_ANTIVIRUS, REF_ENDPOINT_SEC]
  },
  {
    domain: PROTECT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want managed Windows 11 devices to defer driver updates for 30 days. Which Intune surface controls this?',
    options: opts4(
      'Windows Update for Business / Update rings with driver update deferral settings',
      'A Conditional Access named location',
      'A LOB app deployment',
      'A workspace retention policy'
    ),
    correct: ['a'],
    explanation: 'WUfB / update rings support driver-update deferrals. The other options don\'t.',
    references: [REF_UPDATE_POLICY, REF_UPDATES]
  },
  {
    domain: PROTECT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about security baselines in Microsoft Intune.',
    options: opts4(
      'Baselines are Microsoft-curated sets of recommended security settings for Windows / Defender for Endpoint / Edge.',
      'Baselines can be versioned and updated to align with new Microsoft recommendations.',
      'Baselines automatically delete conflicting custom configuration profiles.',
      'Baseline assignments and per-setting status are visible in Intune reports.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Baselines are curated, versioned, and reportable. They do NOT automatically delete custom profiles — admins resolve conflicts manually.',
    references: [REF_BASELINES, REF_ENDPOINT_SEC]
  }
];

const MD102_DOMAINS = [
  { name: PREPARE, weight: 28 },
  { name: MANAGE, weight: 32 },
  { name: APPS, weight: 20 },
  { name: PROTECT, weight: 20 }
];

const MD102_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-md-102-p1',
    code: 'MD-102-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 100-minute, 65-question, blueprint-weighted set covering preparing infrastructure for devices (Entra device identity + Intune enrollment + identity & compliance), managing and maintaining devices (Autopilot + configuration profiles + Intune Suite + remote actions), managing applications (deploy, configure, protect), and protecting devices (endpoint security + Defender + updates).',
    questions: P1
  },
  {
    slug: 'microsoft-md-102-p2',
    code: 'MD-102-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 100-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-md-102-p3',
    code: 'MD-102-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 100-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const MD102_BUNDLE = {
  slug: 'microsoft-md-102',
  title: 'Microsoft Endpoint Administrator (MD-102)',
  description: 'All 3 MD-102 practice exams in one bundle — covering preparing infrastructure for devices (Microsoft Entra device identity, Intune enrollment, identity & compliance, Windows Hello for Business, Windows LAPS), managing and maintaining devices (Windows Autopilot deployment, device configuration profiles, Intune Suite add-ons including Endpoint Privilege Management and Remote Help, remote actions and device query), managing applications (deploy, configure, and protect apps including M365 Apps, app protection policies, and app configuration policies), and protecting devices (endpoint security policies for antivirus / disk encryption / firewall / ASR / security baselines, Microsoft Defender for Endpoint integration, and Windows / iOS / macOS / Android update management). Aligned to the official Microsoft Endpoint Administrator (MD-102) study guide (skills measured as of April 28, 2026).',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the MD-102 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:md102-seed'` are deleted and re-created.
 *
 * Also wipes any pre-existing questions on md-102-p1/p2/p3 with a
 * different generatedBy tag — the previous 4-variant pool used multiple
 * tags from prior generations.
 */
export async function seedMd102(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security operations, identity, and the role-based certification track including the Microsoft Endpoint Administrator (MD-102) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security operations, identity, and the role-based certification track including the Microsoft Endpoint Administrator (MD-102) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of MD102_EXAMS) {
    const title = `Microsoft Endpoint Administrator (MD-102) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Microsoft MD-102 study guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 100,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: MD102_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    // Wipe ALL existing questions on these slugs — the legacy 4-variant pool
    // used the deprecated domain structure and multiple generatedBy tags.
    await db.question.deleteMany({ where: { examId: exam.id } });
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
          generatedBy: 'manual:md102-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: MD102_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: MD102_BUNDLE.slug },
    update: {
      title: MD102_BUNDLE.title,
      description: MD102_BUNDLE.description,
      price: MD102_BUNDLE.price,
      priceVoucher: MD102_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: MD102_BUNDLE.slug,
      title: MD102_BUNDLE.title,
      description: MD102_BUNDLE.description,
      price: MD102_BUNDLE.price,
      priceVoucher: MD102_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-md-102-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-md-102-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-md-102-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-md-102-p1', tier: 'VOUCHER' as const, position: 4 }
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
