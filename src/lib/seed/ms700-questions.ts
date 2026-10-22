/**
 * MS-700 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:ms700-seed'` and upserts catalog rows.
 *
 * Exported as `seedMs700(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/ms700.ts`) and the protected
 * admin API (`/api/admin/seed-ms700`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Managing Microsoft Teams (MS-700) study guide (skills
 * measured as of April 28, 2026):
 *
 *   - Configure and manage a Teams environment        — 42% (27/variant)
 *   - Manage teams, channels, chats, and apps         — 23% (15/variant)
 *   - Manage meetings and calling                     — 18% (12/variant)
 *   - Monitor, report on, and troubleshoot Teams      — 17% (11/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual MS-700 questions.
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

const ENVIRONMENT = 'Configure and manage a Teams environment';
const TEAMS = 'Manage teams, channels, chats, and apps';
const MEETINGS = 'Manage meetings and calling';
const MONITOR = 'Monitor, report on, and troubleshoot Teams';

// ── Environment: network ──
const REF_NETWORK = { label: 'Microsoft Learn — Prepare your organization\'s network for Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/prepare-network' };
const REF_NETWORK_PLANNER = { label: 'Microsoft Learn — Use Network Planner for Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/network-planner' };
const REF_NETWORK_ASSESS = { label: 'Microsoft Learn — Microsoft 365 network connectivity test tool', url: 'https://learn.microsoft.com/en-us/microsoft-365/enterprise/office-365-network-mac-perf-onboarding-tool' };
const REF_PORTS = { label: 'Microsoft Learn — Microsoft 365 and Office 365 URLs and IP address ranges', url: 'https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges' };
const REF_QOS = { label: 'Microsoft Learn — Implement Quality of Service (QoS) in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/qos-in-teams' };

// ── Environment: security & compliance ──
const REF_ADMIN_ROLES = { label: 'Microsoft Learn — Use Microsoft Teams administrator roles to manage Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/using-admin-roles' };
const REF_RETENTION = { label: 'Microsoft Learn — Learn about retention for Microsoft Teams', url: 'https://learn.microsoft.com/en-us/purview/retention-policies-teams' };
const REF_SENSITIVITY = { label: 'Microsoft Learn — Use sensitivity labels to protect content in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/purview/sensitivity-labels-teams-groups-sites' };
const REF_DLP = { label: 'Microsoft Learn — Data loss prevention and Microsoft Teams', url: 'https://learn.microsoft.com/en-us/purview/dlp-microsoft-teams' };
const REF_CA = { label: 'Microsoft Learn — Conditional Access overview', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview' };
const REF_INFO_BARRIERS = { label: 'Microsoft Learn — Learn about information barriers', url: 'https://learn.microsoft.com/en-us/purview/information-barriers' };
const REF_COMM_COMPLIANCE = { label: 'Microsoft Learn — Learn about communication compliance', url: 'https://learn.microsoft.com/en-us/purview/communication-compliance' };
const REF_DEFENDER_O365 = { label: 'Microsoft Learn — Microsoft Defender for Office 365 — Safe Attachments for Teams', url: 'https://learn.microsoft.com/en-us/defender-office-365/safe-attachments-for-spo-odfb-teams-about' };
const REF_ALERT_POLICIES = { label: 'Microsoft Learn — Alert policies in Microsoft Defender XDR and Microsoft Purview', url: 'https://learn.microsoft.com/en-us/purview/alert-policies' };

// ── Environment: governance ──
const REF_POLICY_ASSIGN = { label: 'Microsoft Learn — Assign policies to users and groups in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/assign-policies-users-and-groups' };
const REF_POLICY_PACKAGES = { label: 'Microsoft Learn — Manage policy packages in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/manage-policy-packages' };
const REF_GROUP_EXPIRATION = { label: 'Microsoft Learn — Microsoft 365 group expiration policy', url: 'https://learn.microsoft.com/en-us/entra/identity/users/groups-lifecycle' };
const REF_GROUP_NAMING = { label: 'Microsoft Learn — Microsoft 365 groups naming policy', url: 'https://learn.microsoft.com/en-us/entra/identity/users/groups-naming-policy' };
const REF_GROUP_CREATION = { label: 'Microsoft Learn — Manage who can create Microsoft 365 Groups', url: 'https://learn.microsoft.com/en-us/microsoft-365/solutions/manage-creation-of-groups' };
const REF_TEAMS_STORAGE = { label: 'Microsoft Learn — Locations of Microsoft Teams data', url: 'https://learn.microsoft.com/en-us/microsoftteams/location-of-data-in-teams' };
const REF_ARCHIVE_TEAM = { label: 'Microsoft Learn — Archive or delete a team in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/archive-or-delete-a-team' };
const REF_UPDATE_POLICIES = { label: 'Microsoft Learn — Microsoft Teams Public Preview and update management', url: 'https://learn.microsoft.com/en-us/microsoftteams/public-preview-doc-updates' };
const REF_TEAMS_POWERSHELL = { label: 'Microsoft Learn — Microsoft Teams PowerShell overview', url: 'https://learn.microsoft.com/en-us/microsoftteams/teams-powershell-overview' };
const REF_ACCESS_REVIEWS = { label: 'Microsoft Learn — What are access reviews?', url: 'https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview' };

// ── Environment: external collaboration ──
const REF_EXTERNAL_ACCESS = { label: 'Microsoft Learn — Manage external access (federation) in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/manage-external-access' };
const REF_GUEST_ACCESS = { label: 'Microsoft Learn — Guest access in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/guest-access' };
const REF_SHARED_CHANNELS = { label: 'Microsoft Learn — Shared channels in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/shared-channels' };
const REF_B2B_DIRECT = { label: 'Microsoft Learn — B2B direct connect in Microsoft Entra External ID', url: 'https://learn.microsoft.com/en-us/entra/external-id/b2b-direct-connect-overview' };
const REF_EXTERNAL_SHARING = { label: 'Microsoft Learn — Manage sharing settings for SharePoint and OneDrive', url: 'https://learn.microsoft.com/en-us/sharepoint/turn-external-sharing-on-or-off' };

// ── Environment: clients & devices ──
const REF_TEAMS_DEVICES = { label: 'Microsoft Learn — Manage your devices in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/devices/device-management' };
const REF_TEAMS_ROOMS = { label: 'Microsoft Learn — Microsoft Teams Rooms', url: 'https://learn.microsoft.com/en-us/microsoftteams/rooms/' };
const REF_TEAMS_VDI = { label: 'Microsoft Learn — Teams for Virtualized Desktop Infrastructure', url: 'https://learn.microsoft.com/en-us/microsoftteams/teams-for-vdi' };
const REF_DEVICE_PROFILES = { label: 'Microsoft Learn — Manage configuration profiles for Teams devices', url: 'https://learn.microsoft.com/en-us/microsoftteams/devices/remote-provision-remote-login' };

// ── Teams / channels / chats / apps ──
const REF_CREATE_TEAM = { label: 'Microsoft Learn — Create a team in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/create-an-org-wide-team' };
const REF_TEAM_TEMPLATES = { label: 'Microsoft Learn — Get started with Teams templates in the Teams admin center', url: 'https://learn.microsoft.com/en-us/microsoftteams/get-started-with-teams-templates-in-the-admin-console' };
const REF_TEAM_OWNERSHIP = { label: 'Microsoft Learn — Assign team owners and members in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/assign-roles-permissions' };
const REF_ADVISOR = { label: 'Microsoft Learn — Use Advisor for Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/use-advisor-teams-roll-out' };
const REF_CHANNELS = { label: 'Microsoft Learn — Overview of teams and channels in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/teams-channels-overview' };
const REF_PRIVATE_CHANNELS = { label: 'Microsoft Learn — Private channels in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/private-channels' };
const REF_MESSAGING_POLICIES = { label: 'Microsoft Learn — Manage messaging policies in Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/messaging-policies-in-teams' };
const REF_TEAMS_POLICIES = { label: 'Microsoft Learn — Manage Teams policies in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/teams-policies' };
const REF_APP_POLICIES = { label: 'Microsoft Learn — Overview of app management and governance in the Teams admin center', url: 'https://learn.microsoft.com/en-us/microsoftteams/manage-apps' };
const REF_APP_SETUP = { label: 'Microsoft Learn — Manage app setup policies in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/teams-app-setup-policies' };
const REF_APP_PERMISSION = { label: 'Microsoft Learn — Manage app permission policies in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/teams-app-permission-policies' };
const REF_FRONTLINE = { label: 'Microsoft Learn — Get started with a frontline team', url: 'https://learn.microsoft.com/en-us/microsoftteams/flw-deploy-teams-at-scale' };

// ── Meetings & calling ──
const REF_MEETING_POLICIES = { label: 'Microsoft Learn — Manage meeting policies in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/meeting-policies-overview' };
const REF_MEETING_SETTINGS = { label: 'Microsoft Learn — Manage meeting settings in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/meeting-settings-in-teams' };
const REF_MEETING_TEMPLATES = { label: 'Microsoft Learn — Use custom meeting templates in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/custom-meeting-templates-overview' };
const REF_WEBINARS = { label: 'Microsoft Learn — Set up webinars in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/set-up-webinars' };
const REF_TOWN_HALL = { label: 'Microsoft Learn — Get started with town hall in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/plan-town-halls' };
const REF_AUDIO_CONF = { label: 'Microsoft Learn — Audio Conferencing in Microsoft 365', url: 'https://learn.microsoft.com/en-us/microsoftteams/audio-conferencing-in-office-365' };
const REF_TEAMS_PHONE = { label: 'Microsoft Learn — Teams Phone overview', url: 'https://learn.microsoft.com/en-us/microsoftteams/what-is-phone-system-in-office-365' };
const REF_PHONE_NUMBERS = { label: 'Microsoft Learn — Manage phone numbers for your organization', url: 'https://learn.microsoft.com/en-us/microsoftteams/manage-phone-numbers-landing-page' };
const REF_AUTO_ATTENDANT = { label: 'Microsoft Learn — Set up an auto attendant for Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/create-a-phone-system-auto-attendant' };
const REF_CALL_QUEUE = { label: 'Microsoft Learn — Create a call queue in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/create-a-phone-system-call-queue' };
const REF_CALLING_POLICIES = { label: 'Microsoft Learn — Calling policies in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/teams-calling-policy' };
const REF_RESOURCE_ACCOUNT = { label: 'Microsoft Learn — Manage resource accounts in Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/manage-resource-accounts' };
const REF_EMERGENCY_CALLING = { label: 'Microsoft Learn — Plan and manage emergency calling', url: 'https://learn.microsoft.com/en-us/microsoftteams/what-are-emergency-locations-addresses-and-call-routing' };
const REF_DIRECT_ROUTING = { label: 'Microsoft Learn — Plan Direct Routing', url: 'https://learn.microsoft.com/en-us/microsoftteams/direct-routing-plan' };

// ── Monitor / report / troubleshoot ──
const REF_CQD = { label: 'Microsoft Learn — Set up Call Quality Dashboard (CQD)', url: 'https://learn.microsoft.com/en-us/microsoftteams/turning-on-and-using-call-quality-dashboard' };
const REF_CALL_ANALYTICS = { label: 'Microsoft Learn — Set up call analytics for Microsoft Teams', url: 'https://learn.microsoft.com/en-us/microsoftteams/set-up-call-analytics' };
const REF_TEAMS_REPORTS = { label: 'Microsoft Learn — Teams analytics and reporting in the Teams admin center', url: 'https://learn.microsoft.com/en-us/microsoftteams/teams-analytics-and-reports/teams-reporting-reference' };
const REF_USAGE_REPORT = { label: 'Microsoft Learn — Microsoft 365 Reports — Microsoft Teams usage activity', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-usage-activity' };
const REF_TROUBLESHOOT = { label: 'Microsoft Learn — Troubleshoot Microsoft Teams installation and update issues', url: 'https://learn.microsoft.com/en-us/microsoftteams/troubleshoot-installation' };
const REF_CLIENT_HEALTH = { label: 'Microsoft Learn — Use the Teams admin center to manage Teams devices and client health', url: 'https://learn.microsoft.com/en-us/microsoftteams/devices/device-management' };
const REF_TEAMS_CACHE = { label: 'Microsoft Learn — Clear the Microsoft Teams client cache', url: 'https://learn.microsoft.com/en-us/microsoftteams/troubleshoot/teams-administration/clear-teams-cache' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Configure and manage a Teams environment (27) ──
  {
    domain: ENVIRONMENT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Before rolling out Teams, you need to estimate the WAN bandwidth required for voice, video, and meetings across your sites. Which Microsoft tool should you use?',
    options: opts4(
      'Network Planner in the Teams admin center',
      'Call Quality Dashboard',
      'Microsoft 365 network connectivity test tool',
      'Teams usage activity report'
    ),
    correct: ['a'],
    explanation: 'Network Planner models per-site bandwidth needs for Teams voice, video, and meetings based on personas and site details. The Call Quality Dashboard analyzes calls after the fact, the connectivity test tool measures live connectivity, and usage reports show adoption — none estimate planned bandwidth.',
    references: [REF_NETWORK_PLANNER, REF_NETWORK]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You must prioritize Teams real-time media traffic on the corporate network. Which approach should you implement?',
    options: opts4(
      'Quality of Service (QoS) with DSCP markings and matching port ranges configured via policy',
      'A Conditional Access policy for Teams',
      'A messaging policy',
      'A retention policy for Teams'
    ),
    correct: ['a'],
    explanation: 'QoS uses DSCP markings (applied by policy) on defined media port ranges so network devices prioritize Teams audio/video/sharing. Conditional Access governs sign-in, messaging policies control chat features, and retention governs data lifecycle — none prioritize media.',
    references: [REF_QOS, REF_NETWORK]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A helpdesk engineer must manage Teams users, meetings, and phone numbers but should NOT change org-wide Teams settings. Which administrator role follows least privilege?',
    options: opts4(
      'Teams Communications Administrator',
      'Global Administrator',
      'Teams Communications Support Engineer',
      'Teams Device Administrator'
    ),
    correct: ['a'],
    explanation: 'The Teams Communications Administrator role manages calling, meetings, and phone numbers without org-wide Teams configuration rights. Global Admin is excessive; the Support Engineer/Specialist roles are troubleshooting-focused; Device Administrator manages devices only.',
    references: [REF_ADMIN_ROLES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Your organization must retain all Teams chat and channel messages for 7 years for compliance. Which feature should you configure?',
    options: opts4(
      'A Microsoft Purview retention policy for Teams',
      'A messaging policy in the Teams admin center',
      'A Teams app setup policy',
      'A sensitivity label'
    ),
    correct: ['a'],
    explanation: 'Microsoft Purview retention policies for Teams retain (and optionally delete) chat and channel messages for a defined period. Messaging policies control chat features, app setup policies pin apps, and sensitivity labels classify/protect — none enforce 7-year retention.',
    references: [REF_RETENTION]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to apply a "Confidential" classification to specific teams that also enforces the team\'s privacy setting and guest access. Which feature should you use?',
    options: opts4(
      'Sensitivity labels (with container/group settings)',
      'A retention label',
      'A messaging policy',
      'An app permission policy'
    ),
    correct: ['a'],
    explanation: 'Sensitivity labels can be applied to teams/groups/sites and enforce container settings such as privacy (public/private) and guest access. Retention labels govern data lifecycle; messaging and app permission policies control different features.',
    references: [REF_SENSITIVITY]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You must prevent users from sharing credit card numbers in Teams chats and channels. Which feature should you configure?',
    options: opts4(
      'A Microsoft Purview Data Loss Prevention (DLP) policy that includes Teams as a location',
      'A messaging policy',
      'A Conditional Access policy',
      'An information barrier policy'
    ),
    correct: ['a'],
    explanation: 'A Purview DLP policy with the Teams chat and channel location detects and blocks sensitive information like credit card numbers. Messaging policies control chat features; Conditional Access governs sign-in; information barriers prevent specific groups from communicating.',
    references: [REF_DLP]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'The legal department must be prevented from communicating in Teams with the trading desk to avoid conflicts of interest. Which feature enforces this?',
    options: opts4(
      'Information barrier policies',
      'A data loss prevention policy',
      'A Conditional Access policy',
      'Guest access settings'
    ),
    correct: ['a'],
    explanation: 'Information barriers restrict communication and collaboration between defined segments of users (e.g. legal vs trading) in Teams. DLP inspects content, Conditional Access governs sign-in, and guest access settings control external users — none segment internal users.',
    references: [REF_INFO_BARRIERS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to monitor Teams messages for harassment and offensive language as part of a code-of-conduct program. Which Microsoft Purview solution should you use?',
    options: opts4(
      'Communication compliance',
      'Data loss prevention',
      'Retention policies',
      'Information barriers'
    ),
    correct: ['a'],
    explanation: 'Communication compliance detects inappropriate content (harassment, offensive language, regulatory issues) in Teams and other channels. DLP targets sensitive data leakage, retention governs lifecycle, and information barriers segment users.',
    references: [REF_COMM_COMPLIANCE]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want files shared in Teams channels to be scanned for malware and unsafe content. Which capability provides this?',
    options: opts4(
      'Microsoft Defender for Office 365 Safe Attachments for SharePoint, OneDrive, and Microsoft Teams',
      'A retention policy',
      'A messaging policy',
      'A Teams app permission policy'
    ),
    correct: ['a'],
    explanation: 'Safe Attachments for SharePoint, OneDrive, and Microsoft Teams (Defender for Office 365) detonates and blocks malicious files in Teams. Retention, messaging, and app permission policies do not scan files for malware.',
    references: [REF_DEFENDER_O365]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need Teams to be accessible only from compliant, managed devices. Which mechanism enforces this?',
    options: opts4(
      'A Microsoft Entra Conditional Access policy requiring a compliant device, applied to the Teams cloud apps',
      'A Teams meeting policy',
      'A Teams messaging policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Conditional Access with a "require compliant device" grant control, scoped to the Teams/Office 365 apps, restricts Teams to managed compliant devices. Meeting, messaging, and retention policies do not gate device compliance.',
    references: [REF_CA]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a consistent set of Teams policies (meeting, messaging, app, calling) applied together to frontline workers. What should you use?',
    options: opts4(
      'A policy package',
      'A single messaging policy',
      'A sensitivity label',
      'An information barrier'
    ),
    correct: ['a'],
    explanation: 'A policy package bundles a collection of predefined policies (meeting, messaging, app, calling, etc.) tailored to a role such as frontline workers, applied as a unit. A single messaging policy covers only chat; labels and barriers are unrelated.',
    references: [REF_POLICY_PACKAGES, REF_POLICY_ASSIGN]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must assign a custom meeting policy to 5,000 users who are all members of one Microsoft Entra security group, and have it automatically apply to new members. Which assignment method should you use?',
    options: opts4(
      'Group policy assignment (assign the policy to the group)',
      'Assign the policy to each user individually',
      'Batch policy assignment by user list',
      'Set the policy as the global (org-wide default)'
    ),
    correct: ['a'],
    explanation: 'Group policy assignment assigns a policy to a group; members (including new ones added later) inherit it by precedence rules. Per-user and batch assignment don\'t auto-apply to new members; changing the global default would affect everyone, not just the group.',
    references: [REF_POLICY_ASSIGN, REF_POLICY_PACKAGES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want unused teams to be automatically reviewed and removed after a period of inactivity. Which feature should you configure?',
    options: opts4(
      'A Microsoft 365 group expiration policy',
      'A Teams retention policy',
      'A Teams messaging policy',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'A Microsoft 365 group expiration policy expires (and eventually deletes) groups — and their teams — after an inactivity period unless renewed. Retention policies govern message data; messaging and naming policies serve other purposes.',
    references: [REF_GROUP_EXPIRATION]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You must enforce that every new team\'s name starts with a department prefix and blocks profanity. Which feature should you configure?',
    options: opts4(
      'A Microsoft 365 groups naming policy (prefix-suffix + blocked words)',
      'A Teams template',
      'A sensitivity label',
      'An app setup policy'
    ),
    correct: ['a'],
    explanation: 'A Microsoft 365 groups naming policy applies a prefix/suffix and a blocked-words list to group (and team) names. Teams templates predefine channels/apps, sensitivity labels classify, and app setup policies pin apps — none enforce naming.',
    references: [REF_GROUP_NAMING]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Your organization wants only members of an "Team Creators" group to be able to create new teams. How do you accomplish this?',
    options: opts4(
      'Restrict Microsoft 365 Group creation to the specified security group',
      'Delete the New Team button via a Teams policy',
      'Apply an information barrier',
      'Set a retention policy'
    ),
    correct: ['a'],
    explanation: 'Because a team is backed by a Microsoft 365 Group, restricting M365 Group creation to a designated security group controls who can create teams. There is no per-policy "hide New Team" control; barriers and retention are unrelated.',
    references: [REF_GROUP_CREATION]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A compliance auditor asks where the files shared in a Teams standard channel are physically stored. What is the correct answer?',
    options: opts4(
      'In the SharePoint site associated with the team',
      'In each member\'s OneDrive',
      'In the Exchange Online mailbox of the team',
      'In Azure Blob storage managed by Teams'
    ),
    correct: ['a'],
    explanation: 'Files in a standard channel are stored in the team\'s SharePoint site. Chat (1:1/group) files go to the sender\'s OneDrive; channel messages are journaled to a group mailbox, but the files themselves live in SharePoint.',
    references: [REF_TEAMS_STORAGE]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A project has ended. You want to make its team read-only — preserving content and conversations but preventing new activity — with the option to reactivate later. What should you do?',
    options: opts4(
      'Archive the team',
      'Delete the team',
      'Remove all members',
      'Apply a retention policy'
    ),
    correct: ['a'],
    explanation: 'Archiving a team makes it read-only while preserving content, and it can be unarchived later. Deleting removes it (recoverable only within the 30-day soft-delete window); removing members doesn\'t freeze content; retention governs data lifecycle, not team state.',
    references: [REF_ARCHIVE_TEAM]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to bulk-update calling policy assignments for hundreds of users via scripting. Which tool should you use?',
    options: opts4(
      'Microsoft Teams PowerShell module',
      'The Teams client',
      'The Microsoft 365 message center',
      'Network Planner'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Teams PowerShell module supports scripted bulk administration, including policy assignment. The Teams client is end-user, the message center shows announcements, and Network Planner models bandwidth.',
    references: [REF_TEAMS_POWERSHELL, REF_POLICY_ASSIGN]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want users in your tenant to be able to chat with users in a specific partner organization\'s tenant, but not with any other external domains. Which feature and configuration?',
    options: opts4(
      'External access (federation) configured to allow only the partner\'s domain',
      'Guest access enabled for all domains',
      'A shared channel for the partner',
      'B2B direct connect for all tenants'
    ),
    correct: ['a'],
    explanation: 'External access (federation) controls Teams-to-Teams chat/calling with other tenants and can be scoped to allow specific domains only. Guest access adds external users into your teams; shared channels and B2B direct connect address channel-level collaboration, not tenant-wide chat scoping.',
    references: [REF_EXTERNAL_ACCESS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A contractor from another company needs to be added as a member of one of your teams with access to its channels and files. Which capability should you use?',
    options: opts4(
      'Guest access',
      'External access (federation)',
      'B2B direct connect',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Guest access adds an external person into your team as a guest member with access to channels, chats, and files. External access only enables cross-tenant chat/calling without team membership; B2B direct connect underlies shared channels; CA governs sign-in.',
    references: [REF_GUEST_ACCESS]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want people from a partner tenant to collaborate in a single channel of your team using their own Teams identities, without being added as guests to the whole team. Which feature should you use?',
    options: opts4(
      'A shared channel (backed by B2B direct connect)',
      'A private channel',
      'Guest access for the whole team',
      'A standard channel with anonymous join'
    ),
    correct: ['a'],
    explanation: 'A shared channel lets external users (via B2B direct connect cross-tenant access settings) participate in just that channel with their home identity, without joining the whole team. Private channels are for a subset of the team\'s own members; guest access adds them to the whole team.',
    references: [REF_SHARED_CHANNELS, REF_B2B_DIRECT]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Guest access in Teams depends on settings in multiple admin centers. Besides the Teams admin center, where must guest access also be permitted for it to work end-to-end?',
    options: opts4(
      'Microsoft Entra External collaboration settings, Microsoft 365 admin center groups settings, and SharePoint/OneDrive sharing settings',
      'Only the Exchange admin center',
      'Only the Defender portal',
      'Only the Purview portal'
    ),
    correct: ['a'],
    explanation: 'Guest access is gated at several layers: Microsoft Entra External collaboration settings, Microsoft 365 Groups guest settings, SharePoint/OneDrive external sharing, and the Teams admin center. All must allow guests. Exchange/Defender/Purview alone do not control it.',
    references: [REF_GUEST_ACCESS, REF_EXTERNAL_SHARING]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You are deploying Microsoft Teams Rooms devices. Which Teams admin center capability lets you apply consistent settings (e.g. meeting options, theme) to groups of those devices?',
    options: opts4(
      'Configuration profiles for Teams devices',
      'A messaging policy',
      'A retention policy',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'Configuration profiles in the Teams admin center apply consistent settings to groups of Teams devices (Rooms, phones, panels). Messaging, retention, and naming policies serve unrelated functions.',
    references: [REF_DEVICE_PROFILES, REF_TEAMS_DEVICES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Users connect to Teams from a non-persistent VDI environment and report poor audio/video. What is the recommended approach?',
    options: opts4(
      'Deploy Teams optimized for VDI with media optimization (AV redirection) on a supported virtualization platform',
      'Increase each user\'s mailbox size',
      'Disable QoS',
      'Move all users to guest accounts'
    ),
    correct: ['a'],
    explanation: 'Teams for VDI with media optimization offloads audio/video processing to the local endpoint via the supported virtualization platform\'s optimization, fixing AV quality. Mailbox size, disabling QoS, and guest accounts are irrelevant or harmful.',
    references: [REF_TEAMS_VDI, REF_QOS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to confirm an office location\'s network can reach Microsoft 365 with acceptable latency before a Teams rollout. Which tool should you run from that location?',
    options: opts4(
      'The Microsoft 365 network connectivity test tool',
      'Network Planner',
      'Call Quality Dashboard',
      'The Teams usage report'
    ),
    correct: ['a'],
    explanation: 'The Microsoft 365 network connectivity test tool measures actual connectivity, latency, and routing from a location to Microsoft 365. Network Planner models planned bandwidth; CQD analyzes historical call data; usage reports show adoption.',
    references: [REF_NETWORK_ASSESS, REF_NETWORK]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about guest access versus external access in Microsoft Teams.',
    options: opts4(
      'Guest access adds an external user as a member of a team.',
      'External access (federation) enables chat and calling with users in other domains/tenants.',
      'A guest counts against your tenant and appears in the team\'s membership.',
      'External access adds the external user into your teams as a member.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Guest access makes an external user a guest member of a team; they appear in membership. External access enables cross-domain chat/calling but does NOT add the external user into your teams.',
    references: [REF_GUEST_ACCESS, REF_EXTERNAL_ACCESS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to periodically have team owners attest that guest members still need access. Which Microsoft Entra feature automates this?',
    options: opts4(
      'Access reviews for teams and groups',
      'A retention policy',
      'A naming policy',
      'A messaging policy'
    ),
    correct: ['a'],
    explanation: 'Microsoft Entra access reviews periodically prompt reviewers (e.g. team owners) to confirm or remove members and guests. Retention, naming, and messaging policies do not perform recurring membership attestation.',
    references: [REF_ACCESS_REVIEWS, REF_GUEST_ACCESS]
  },

  // ── Manage teams, channels, chats, and apps (15) ──
  {
    domain: TEAMS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to create 30 teams that all have the same channel structure, pre-pinned tabs, and apps for new retail stores. What is the most efficient approach?',
    options: opts4(
      'Create a team template and use it for each new team',
      'Manually build each team and copy settings',
      'Create one team and rename it 30 times',
      'Use a messaging policy'
    ),
    correct: ['a'],
    explanation: 'A team template defines a reusable structure (channels, tabs, apps) so each new team is created consistently. Manual building doesn\'t scale; you cannot reuse one team 30 times; messaging policies don\'t define team structure.',
    references: [REF_TEAM_TEMPLATES, REF_CREATE_TEAM]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'An existing Microsoft 365 group already has the right membership for a new team. What is the recommended way to create the team?',
    options: opts4(
      'Create the team from the existing Microsoft 365 group',
      'Create a brand-new team and re-add all members',
      'Export and import members via CSV into a new team',
      'Convert the group to a distribution list first'
    ),
    correct: ['a'],
    explanation: 'You can create a team from an existing Microsoft 365 group, reusing its membership and SharePoint site. Creating a new team and re-adding members duplicates effort; CSV re-import is unnecessary; converting to a distribution list loses team capability.',
    references: [REF_CREATE_TEAM, REF_TEAM_TEMPLATES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'During a Teams rollout you want a guided checklist of recommended deployment tasks (e.g. networking, governance) inside the Teams admin center. Which feature provides this?',
    options: opts4(
      'Advisor for Teams',
      'Network Planner',
      'Call Quality Dashboard',
      'The message center'
    ),
    correct: ['a'],
    explanation: 'Advisor for Teams provides a guided, plan-based set of deployment tasks (a project plan with recommended actions). Network Planner models bandwidth; CQD analyzes calls; the message center shows announcements.',
    references: [REF_ADVISOR]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a channel within a team that only a subset of the team\'s members can see and access. Which channel type should you create?',
    options: opts4(
      'A private channel',
      'A standard channel',
      'A shared channel',
      'An org-wide channel'
    ),
    correct: ['a'],
    explanation: 'A private channel is visible and accessible only to a subset of the parent team\'s members. Standard channels are open to all team members; shared channels are for cross-team/cross-tenant collaboration; there is no "org-wide channel" type.',
    references: [REF_PRIVATE_CHANNELS, REF_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A private channel\'s files are stored where?',
    options: opts4(
      'In a separate, dedicated SharePoint site provisioned for that private channel',
      'In the parent team\'s SharePoint site, same as standard channels',
      'In the channel owner\'s OneDrive',
      'In an Exchange public folder'
    ),
    correct: ['a'],
    explanation: 'Each private channel gets its own dedicated SharePoint site, separate from the parent team\'s site, so only private channel members can access its files. Standard channels share the team site; chat files use OneDrive.',
    references: [REF_PRIVATE_CHANNELS, REF_TEAMS_STORAGE]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to prevent users from deleting sent messages in Teams chats. Which policy controls this?',
    options: opts4(
      'A messaging policy',
      'A meeting policy',
      'An app setup policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Messaging policies control chat/message features such as edit and delete sent messages, read receipts, and giphy use. Meeting and app setup policies are unrelated; retention governs data lifecycle, not the in-client delete control.',
    references: [REF_MESSAGING_POLICIES, REF_TEAMS_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a specific set of apps pinned to the Teams app bar for the finance department. Which policy should you configure?',
    options: opts4(
      'An app setup policy',
      'An app permission policy',
      'A messaging policy',
      'A meeting policy'
    ),
    correct: ['a'],
    explanation: 'App setup policies control which apps are installed and pinned, and the pin order, for targeted users. App permission policies control which apps are ALLOWED; messaging and meeting policies are unrelated.',
    references: [REF_APP_SETUP, REF_APP_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You must block a specific third-party app from being used by anyone in the organization. Which policy should you configure?',
    options: opts4(
      'An app permission policy (or org-wide app settings) that blocks the app',
      'An app setup policy',
      'A messaging policy',
      'A team template'
    ),
    correct: ['a'],
    explanation: 'App permission policies (and org-wide app settings) control which apps are allowed or blocked. App setup policies only pin allowed apps; messaging policies and templates do not block apps.',
    references: [REF_APP_PERMISSION, REF_APP_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team owner left the company and their team now has no owner. As Teams administrator, what should you do?',
    options: opts4(
      'Promote an existing member to owner (or add and promote a new owner) via the Teams admin center',
      'Delete and recreate the team',
      'Archive the team permanently',
      'Convert the team to a private channel'
    ),
    correct: ['a'],
    explanation: 'An administrator can manage a team\'s membership in the Teams admin center and promote a member to owner. Deleting/recreating loses content; archiving freezes it; you cannot convert a team into a private channel.',
    references: [REF_TEAM_OWNERSHIP, REF_CREATE_TEAM]
  },
  {
    domain: TEAMS, difficulty: 3, type: QType.SINGLE,
    stem: 'Shift workers in retail stores need a lightweight team experience with Shifts, Walkie Talkie, and tasks, deployed at scale across many locations. Which Teams capability is designed for this?',
    options: opts4(
      'Frontline teams (deploy Teams at scale for frontline workers)',
      'Org-wide teams',
      'Private channels',
      'Shared channels'
    ),
    correct: ['a'],
    explanation: 'Frontline team deployment provisions teams at scale for frontline/shift workers with frontline-oriented apps. Org-wide teams auto-include all users; private/shared channels address channel scoping, not frontline scale deployment.',
    references: [REF_FRONTLINE, REF_CREATE_TEAM]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to control whether team owners and members are allowed to create private channels. Where is this configured?',
    options: opts4(
      'A Teams policy controlling private channel creation, assigned to users',
      'A messaging policy',
      'A retention policy',
      'An app permission policy'
    ),
    correct: ['a'],
    explanation: 'A Teams policy includes a setting that allows or disallows creating private channels, assignable to users. Messaging, retention, and app permission policies do not govern channel creation.',
    references: [REF_TEAMS_POLICIES, REF_PRIVATE_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A user accidentally deleted a channel. Within what general window can a deleted standard channel be restored?',
    options: opts4(
      'Within about 30 days (deleted channels are recoverable for roughly 30 days)',
      'Channels cannot be restored once deleted',
      'Within 24 hours only',
      'Within 1 year'
    ),
    correct: ['a'],
    explanation: 'A deleted standard channel can be restored for approximately 30 days. After that window it is permanently removed. It is recoverable — not immediately permanent — and the window is far longer than 24 hours but not a full year.',
    references: [REF_CHANNELS, REF_ARCHIVE_TEAM]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a team automatically created with channels named "Announcements", "Logistics", and a pre-pinned Planner tab whenever a project starts. Which two features combine best?',
    options: opts4(
      'A team template defining the channels/tabs/apps, plus team creation from that template',
      'A messaging policy and a meeting policy',
      'A retention policy and a sensitivity label',
      'An app permission policy and an information barrier'
    ),
    correct: ['a'],
    explanation: 'A team template defines the channel/tab/app structure, and new teams created from it inherit that structure. Messaging/meeting policies, retention/labels, and permission/barrier policies do not define team structure.',
    references: [REF_TEAM_TEMPLATES, REF_CREATE_TEAM]
  },
  {
    domain: TEAMS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Teams channel types.',
    options: opts4(
      'Standard channels are open to all members of the parent team.',
      'Private channels are limited to a subset of the team\'s members and have their own SharePoint site.',
      'Shared channels can include people from outside the team, including other tenants via B2B direct connect.',
      'Private channels can include users who are not members of the parent team.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Standard channels are open to all team members; private channels are a subset with a dedicated site; shared channels can include external/other-tenant users. Private channel members MUST be members of the parent team — that is the difference from shared channels.',
    references: [REF_CHANNELS, REF_PRIVATE_CHANNELS, REF_SHARED_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to require a custom app you developed to be available to users without publishing it to the public Teams store. What should you do?',
    options: opts4(
      'Upload the custom app to your org\'s app catalog (org-wide / custom app upload)',
      'Publish it to the public Microsoft Teams store',
      'Email the app package to users',
      'Add it as a tab in one channel only'
    ),
    correct: ['a'],
    explanation: 'A custom (line-of-business) app can be uploaded to the organization\'s app catalog so it is available internally without public store publication. Emailing packages and single-channel tabs don\'t make it broadly available; public store publication is not desired here.',
    references: [REF_APP_POLICIES, REF_APP_SETUP]
  },

  // ── Manage meetings and calling (12) ──
  {
    domain: MEETINGS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to control whether anonymous users can join meetings organized by a group of users. Which policy should you configure?',
    options: opts4(
      'A Teams meeting policy',
      'A messaging policy',
      'A calling policy',
      'An app setup policy'
    ),
    correct: ['a'],
    explanation: 'Meeting policies control meeting features and participant behavior, including whether anonymous users can join meetings. Messaging policies govern chat; calling policies govern 1:1/PSTN calls; app setup policies pin apps.',
    references: [REF_MEETING_POLICIES, REF_MEETING_SETTINGS]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want external/PSTN participants to be able to dial in to Teams meetings by phone. Which capability must be enabled for meeting organizers?',
    options: opts4(
      'Audio Conferencing',
      'A calling policy',
      'Direct Routing',
      'A messaging policy'
    ),
    correct: ['a'],
    explanation: 'Audio Conferencing provides dial-in (and dial-out) phone numbers for Teams meetings, so participants can join by phone. Calling policies govern person-to-person calls; Direct Routing connects Teams Phone to a carrier; messaging policies are chat-only.',
    references: [REF_AUDIO_CONF, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a standardized meeting experience (locked settings, branding) for company all-hands meetings that organizers cannot change. Which feature should you use?',
    options: opts4(
      'A custom meeting template with locked settings',
      'A messaging policy',
      'An app permission policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Custom meeting templates let admins predefine and lock meeting settings, ensuring a consistent experience organizers cannot override. Messaging/app permission/retention policies do not template meetings.',
    references: [REF_MEETING_TEMPLATES, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'Marketing wants to host an external-facing event with registration, a structured presenter/attendee experience, and capacity for a few hundred attendees. Which meeting type should you recommend?',
    options: opts4(
      'A webinar',
      'A standard meeting',
      'A 1:1 call',
      'A channel meeting'
    ),
    correct: ['a'],
    explanation: 'Webinars provide registration, a presenter/attendee split, and structured event management for audiences. Standard meetings lack registration workflows; 1:1 calls and channel meetings are not event formats.',
    references: [REF_WEBINARS, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Leadership wants to broadcast a quarterly company-wide event to up to 10,000+ attendees with a managed production experience. Which Teams capability is best suited?',
    options: opts4(
      'A town hall',
      'A regular meeting',
      'A webinar with 100 seats',
      'A group chat'
    ),
    correct: ['a'],
    explanation: 'Town halls are designed for large-scale, one-to-many broadcast events (company-wide, large attendee capacity) with a managed production experience. Regular meetings and small webinars don\'t scale to this; group chat is not an event format.',
    references: [REF_TOWN_HALL, REF_WEBINARS]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'A user must be assigned a phone number so they can make and receive PSTN calls in Teams using a Microsoft-provided number. Which option provides the number?',
    options: opts4(
      'A Microsoft Teams Calling Plan',
      'An auto attendant',
      'A call queue',
      'A messaging policy'
    ),
    correct: ['a'],
    explanation: 'A Calling Plan provides Microsoft as the PSTN carrier and supplies user phone numbers. Auto attendants and call queues are voice applications that use service numbers; messaging policies are chat-only.',
    references: [REF_TEAMS_PHONE, REF_PHONE_NUMBERS]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.SINGLE,
    stem: 'You need an automated phone menu that greets callers and routes them ("Press 1 for Sales") to the right department. Which Teams Phone feature should you configure?',
    options: opts4(
      'An auto attendant',
      'A call queue',
      'A calling policy',
      'A dial plan'
    ),
    correct: ['a'],
    explanation: 'An auto attendant provides an interactive menu (greetings, prompts, key-press routing) to direct callers. A call queue distributes calls to a group of agents; calling policies govern call features; dial plans normalize dialed numbers.',
    references: [REF_AUTO_ATTENDANT, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.SINGLE,
    stem: 'The support team needs incoming calls distributed among a group of agents with hold music and an overflow rule. Which Teams Phone feature should you configure?',
    options: opts4(
      'A call queue',
      'An auto attendant',
      'A meeting policy',
      'An app setup policy'
    ),
    correct: ['a'],
    explanation: 'A call queue distributes inbound calls to a set of agents with options like hold music, routing method, and overflow/timeout handling. Auto attendants are menu-based routers; meeting and app setup policies are unrelated.',
    references: [REF_CALL_QUEUE, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'Auto attendants and call queues need an associated identity to hold their phone number and license. What must you create?',
    options: opts4(
      'A resource account',
      'A standard user account',
      'A shared mailbox',
      'A Microsoft 365 group'
    ),
    correct: ['a'],
    explanation: 'A resource account is a disabled-for-sign-in account that holds the phone number and the appropriate license for an auto attendant or call queue. Standard user accounts, shared mailboxes, and groups are not used for this.',
    references: [REF_RESOURCE_ACCOUNT, REF_AUTO_ATTENDANT]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to control whether a group of users can make PSTN calls, place calls on hold, or use call forwarding. Which policy should you configure?',
    options: opts4(
      'A calling policy',
      'A meeting policy',
      'A messaging policy',
      'An app permission policy'
    ),
    correct: ['a'],
    explanation: 'Calling policies control person-to-person calling features such as making private/PSTN calls, call forwarding, delegation, and busy options. Meeting, messaging, and app permission policies govern other areas.',
    references: [REF_CALLING_POLICIES, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organization already has a contract with a telephony carrier and a Session Border Controller. You want to use those for Teams Phone PSTN connectivity. Which option should you implement?',
    options: opts4(
      'Direct Routing',
      'A Microsoft Calling Plan',
      'Operator Connect only with no SBC',
      'Audio Conferencing'
    ),
    correct: ['a'],
    explanation: 'Direct Routing connects Teams Phone to your existing carrier through a supported SBC. A Calling Plan uses Microsoft as the carrier; Operator Connect uses a participating operator without your own SBC; Audio Conferencing is for meeting dial-in.',
    references: [REF_DIRECT_ROUTING, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Teams Phone PSTN connectivity options.',
    options: opts4(
      'A Microsoft Calling Plan makes Microsoft your PSTN carrier.',
      'Direct Routing connects Teams Phone to your own carrier via a Session Border Controller.',
      'Operator Connect lets a participating operator provide PSTN service managed in the Teams admin center.',
      'Audio Conferencing is a PSTN option for assigning user calling numbers.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Calling Plan = Microsoft as carrier; Direct Routing = your carrier via SBC; Operator Connect = participating operator managed in the admin center. Audio Conferencing provides dial-in numbers for MEETINGS — it does not assign user calling numbers.',
    references: [REF_TEAMS_PHONE, REF_DIRECT_ROUTING, REF_AUDIO_CONF]
  },

  // ── Monitor, report on, and troubleshoot Teams (11) ──
  {
    domain: MONITOR, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to investigate poor audio quality for a specific user\'s recent Teams calls, seeing per-call and per-leg details. Which tool should you use?',
    options: opts4(
      'Per-user call analytics in the Teams admin center',
      'Network Planner',
      'The Teams usage activity report',
      'The message center'
    ),
    correct: ['a'],
    explanation: 'Per-user call analytics shows detailed per-call/per-leg quality data for an individual user, ideal for investigating their specific calls. Network Planner models bandwidth; usage reports show adoption; the message center shows announcements.',
    references: [REF_CALL_ANALYTICS, REF_CQD]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want organization-wide trends and aggregate quality analysis across all Teams calls and meetings to spot systemic problems (e.g. a bad subnet). Which tool should you use?',
    options: opts4(
      'Call Quality Dashboard (CQD)',
      'Per-user call analytics',
      'The Teams device health page',
      'Advisor for Teams'
    ),
    correct: ['a'],
    explanation: 'The Call Quality Dashboard aggregates call/meeting quality data across the organization for trend analysis (e.g. identifying problem subnets, regions, or builds). Per-user analytics is for a single user; device health and Advisor serve other purposes.',
    references: [REF_CQD, REF_CALL_ANALYTICS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'To make Call Quality Dashboard reports show building, subnet, and ISP names instead of raw IPs, what should you upload?',
    options: opts4(
      'A tenant data / building (subnet) mapping file to CQD',
      'A retention policy',
      'A team template',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'Uploading a building/subnet mapping (tenant data) file to CQD enriches reports with friendly names for buildings, subnets, ISPs, etc. Retention policies, team templates, and meeting templates do not enrich CQD data.',
    references: [REF_CQD]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Leadership asks how many active Teams users you have and how usage breaks down by activity type. Which report should you use?',
    options: opts4(
      'The Microsoft Teams usage activity report in the Microsoft 365 admin center',
      'The Call Quality Dashboard',
      'Per-user call analytics',
      'Network Planner'
    ),
    correct: ['a'],
    explanation: 'The Teams usage activity report (Microsoft 365 admin center reports) shows active users and activity breakdowns (messages, meetings, calls). CQD and call analytics are quality tools; Network Planner models bandwidth.',
    references: [REF_USAGE_REPORT, REF_TEAMS_REPORTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to be notified when a large number of teams are created or deleted in a short time, as a governance signal. Which capability provides this?',
    options: opts4(
      'An alert policy in Microsoft Purview / Defender that monitors team creation and deletion events',
      'A meeting policy',
      'A retention policy',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'Alert policies can monitor activity such as team/group creation and deletion and notify admins. Meeting, retention, and naming policies do not raise activity alerts.',
    references: [REF_ALERT_POLICIES, REF_TEAMS_REPORTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports the Teams desktop client is showing stale data and behaving oddly after an update. As a first low-impact troubleshooting step, what should you advise?',
    options: opts4(
      'Clear the Teams client cache and restart Teams',
      'Delete and recreate the user\'s account',
      'Remove the user from all teams',
      'Reinstall the operating system'
    ),
    correct: ['a'],
    explanation: 'Clearing the Teams client cache and restarting resolves many stale-data and odd-behavior issues with low impact. Recreating the account, removing teams, or reinstalling the OS are disproportionate.',
    references: [REF_TEAMS_CACHE, REF_TROUBLESHOOT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'The Teams desktop client repeatedly fails to install or update on a managed device. Which Microsoft resource should you consult for structured remediation?',
    options: opts4(
      'The Microsoft Learn troubleshooting guidance for Teams installation and update issues',
      'Network Planner',
      'The Teams usage report',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s troubleshooting documentation for Teams installation/update issues provides structured remediation steps and log locations. Network Planner, usage reports, and retention policies are unrelated to client install failures.',
    references: [REF_TROUBLESHOOT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You manage many Teams Rooms and phones and need to see which devices are healthy, offline, or need a firmware update. Where do you look?',
    options: opts4(
      'The Devices section of the Teams admin center',
      'The Call Quality Dashboard',
      'Network Planner',
      'The message center'
    ),
    correct: ['a'],
    explanation: 'The Devices section of the Teams admin center shows device inventory, health, status, and update state for Teams devices. CQD analyzes call quality; Network Planner models bandwidth; the message center shows announcements.',
    references: [REF_CLIENT_HEALTH, REF_TEAMS_DEVICES]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'CQD shows a cluster of poor calls all coming from one office subnet. What is the most appropriate next investigative step?',
    options: opts4(
      'Investigate that subnet\'s network path/quality (e.g. Wi-Fi, QoS, ISP) since the data points to a location-specific issue',
      'Reset every affected user\'s password',
      'Delete and recreate the affected teams',
      'Disable Audio Conferencing tenant-wide'
    ),
    correct: ['a'],
    explanation: 'Poor calls clustered on one subnet indicate a location/network problem; investigate that subnet\'s Wi-Fi, QoS, wired path, and ISP. Password resets, recreating teams, and disabling Audio Conferencing do not address a network-quality issue.',
    references: [REF_CQD, REF_QOS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to report on how guest access is being used across teams in the organization. Which Teams admin center capability helps?',
    options: opts4(
      'Teams analytics and reporting (which includes reports relevant to guests and team activity)',
      'Network Planner',
      'The Call Quality Dashboard',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'Teams analytics and reporting in the Teams admin center provides usage and activity reports, including views relevant to teams and guest activity. Network Planner, CQD, and meeting templates do not report on guest usage.',
    references: [REF_TEAMS_REPORTS, REF_USAGE_REPORT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Teams monitoring and reporting tools.',
    options: opts4(
      'Per-user call analytics gives detailed quality data for an individual user\'s calls.',
      'Call Quality Dashboard aggregates call quality across the whole organization for trends.',
      'The Microsoft 365 usage activity report shows Teams active users and activity types.',
      'Network Planner reports historical call quality for completed calls.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Call analytics = per-user detail; CQD = org-wide aggregate trends; usage report = adoption/activity. Network Planner does NOT report historical call quality — it MODELS planned bandwidth before deployment.',
    references: [REF_CALL_ANALYTICS, REF_CQD, REF_USAGE_REPORT]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Configure and manage a Teams environment (27) ──
  {
    domain: ENVIRONMENT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Your firewall team asks which network endpoints to allow for Microsoft Teams. Which Microsoft resource provides the authoritative, regularly-updated list of URLs and IP ranges?',
    options: opts4(
      'The Microsoft 365 URLs and IP address ranges reference (with the Teams Optimize/Allow categories)',
      'The Call Quality Dashboard',
      'The Teams usage activity report',
      'Network Planner'
    ),
    correct: ['a'],
    explanation: 'The Microsoft 365 URLs and IP address ranges page is the authoritative, regularly-updated endpoint list, with Teams traffic categorized (Optimize/Allow). CQD analyzes calls, usage reports show adoption, and Network Planner models bandwidth.',
    references: [REF_PORTS, REF_NETWORK]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to model the bandwidth impact of adding 500 Teams users at a branch office, accounting for personas and site characteristics. Which tool should you use?',
    options: opts4(
      'Network Planner',
      'Call Quality Dashboard',
      'Per-user call analytics',
      'The message center'
    ),
    correct: ['a'],
    explanation: 'Network Planner models projected bandwidth for a site based on personas (users, devices) and site details before deployment. CQD and call analytics analyze actual calls after the fact; the message center shows announcements.',
    references: [REF_NETWORK_PLANNER, REF_NETWORK]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A staff member must be able to read Teams settings and reports for auditing but must not change anything. Which administrator role is appropriate?',
    options: opts4(
      'Global Reader',
      'Teams Administrator',
      'Teams Communications Administrator',
      'Global Administrator'
    ),
    correct: ['a'],
    explanation: 'Global Reader provides read-only visibility into configuration and reports without change rights — ideal for auditing. Teams Administrator and Teams Communications Administrator can make changes; Global Administrator is full control.',
    references: [REF_ADMIN_ROLES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A retention policy for Teams is set to retain and then delete chat messages after 3 years. What happens to a message a user "deletes" after 1 year?',
    options: opts4(
      'It is hidden from the user but preserved in a substrate location until the 3-year retention period elapses',
      'It is permanently and immediately purged',
      'It is moved to the user\'s OneDrive',
      'The retention policy is voided for that chat'
    ),
    correct: ['a'],
    explanation: 'With a retain-then-delete retention policy, user deletion removes the message from view but a copy is preserved in the compliance substrate until the retention period ends. It is not immediately purged, moved to OneDrive, or able to void the policy.',
    references: [REF_RETENTION]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You publish sensitivity labels for use with Teams. For a label to control a team\'s privacy and guest access, what must be enabled?',
    options: opts4(
      'Sensitivity labels for groups and sites (container labeling) must be turned on',
      'A retention policy must be created first',
      'Guest access must be disabled tenant-wide',
      'A DLP policy must be applied to the team'
    ),
    correct: ['a'],
    explanation: 'To use sensitivity labels to govern team/group/site container settings (privacy, guest access), label support for groups and sites must be enabled. Retention policies, disabling guest access, or DLP are not prerequisites for container labeling.',
    references: [REF_SENSITIVITY]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A DLP policy for Teams should warn users but still let them override the block with a business justification when sharing sensitive content. Which DLP setting provides this?',
    options: opts4(
      'A policy tip with a user override option',
      'Hard block with no notification',
      'Audit-only with no tip',
      'Disable the policy for Teams'
    ),
    correct: ['a'],
    explanation: 'A DLP policy tip can notify the user and allow an override with justification, balancing protection and productivity. A hard block prevents sharing entirely; audit-only doesn\'t inform users; disabling removes protection.',
    references: [REF_DLP]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to prevent two specific departments from being added to the same team or chatting with each other. Which feature, and what must be defined?',
    options: opts4(
      'Information barriers, with segments and barrier policies defined for the two departments',
      'A DLP policy with credit card detection',
      'A messaging policy that disables chat',
      'A retention policy with a 0-day setting'
    ),
    correct: ['a'],
    explanation: 'Information barriers use defined user segments and barrier policies to block communication/collaboration between groups. DLP inspects content, a messaging policy disabling chat affects everyone, and retention governs lifecycle.',
    references: [REF_INFO_BARRIERS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need Teams sign-in blocked from outside the corporate network for a sensitive group of users. Which feature should you use?',
    options: opts4(
      'A Conditional Access policy with a location condition (named locations) targeting Teams',
      'A messaging policy',
      'A retention policy',
      'A team template'
    ),
    correct: ['a'],
    explanation: 'Conditional Access with a named-locations condition can block or allow Teams sign-in based on network location. Messaging/retention policies and templates do not gate sign-in by location.',
    references: [REF_CA]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want the security team alerted when communication compliance detects a policy match in Teams messages. What should you configure within communication compliance?',
    options: opts4(
      'A communication compliance policy with the appropriate reviewers and conditions',
      'A DLP policy for SharePoint',
      'A retention label',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'A communication compliance policy defines the conditions to detect and the reviewers who are alerted to and triage matches. DLP for SharePoint, retention labels, and naming policies do not perform code-of-conduct review of Teams messages.',
    references: [REF_COMM_COMPLIANCE]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to be notified of unusual administrative or security activity in Teams, such as a spike in role changes. Which capability should you configure?',
    options: opts4(
      'An alert policy in Microsoft Purview / Defender',
      'A messaging policy',
      'A meeting template',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'Alert policies monitor defined activities and notify admins when thresholds or conditions are met. Messaging policies, meeting templates, and naming policies do not generate security/activity alerts.',
    references: [REF_ALERT_POLICIES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You created a custom meeting policy. A user is a member of two groups that each have a different meeting policy assigned. How is the effective policy determined?',
    options: opts4(
      'By group assignment ranking — the policy from the highest-ranked group the user belongs to wins',
      'Both policies merge into one combined policy',
      'The most restrictive policy always wins automatically',
      'The user gets the global default, ignoring group policies'
    ),
    correct: ['a'],
    explanation: 'When a user is in multiple groups with group-assigned policies, the group with the highest assignment ranking determines the effective policy. Policies do not merge, "most restrictive" is not the rule, and a direct/group assignment takes precedence over the global default.',
    references: [REF_POLICY_ASSIGN]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement about Teams policy assignment precedence is correct?',
    options: opts4(
      'A policy assigned directly to a user takes precedence over a policy assigned via a group',
      'Group-assigned policies always override direct user assignment',
      'The global (org-wide default) policy always wins',
      'Policies are applied in random order'
    ),
    correct: ['a'],
    explanation: 'Direct user assignment has the highest precedence, then group assignment (by ranking), then the global default. Group assignment does not override direct assignment, and the global default is the fallback, not the winner.',
    references: [REF_POLICY_ASSIGN, REF_POLICY_PACKAGES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A Microsoft 365 group expiration policy is enabled with a 180-day lifetime. What keeps an active team from being deleted at expiration?',
    options: opts4(
      'Ongoing activity auto-renews the group, or an owner renews it before expiration',
      'Nothing — all teams are deleted at 180 days regardless',
      'Only a Global Administrator can prevent deletion',
      'The team must be archived'
    ),
    correct: ['a'],
    explanation: 'Group expiration auto-renews groups that show activity, and owners receive renewal notifications to renew manually. Active teams are not blindly deleted; archiving is unrelated to expiration renewal.',
    references: [REF_GROUP_EXPIRATION]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Your naming policy blocks the word "CEO" in team names. A user with a specific admin role can still create a team named "CEO Updates". Why?',
    options: opts4(
      'Certain administrator roles are exempt from the Microsoft 365 groups naming policy',
      'Naming policies only apply to channels, not teams',
      'The blocked-words list is case-sensitive',
      'Naming policies do not apply to teams created in the Teams client'
    ),
    correct: ['a'],
    explanation: 'Specified administrator roles are exempt from the groups naming policy. The policy applies to teams (which are groups) regardless of creation surface, and blocked words are not bypassed by case.',
    references: [REF_GROUP_NAMING]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'After restricting Microsoft 365 Group creation to one security group, a user not in that group reports they cannot create a team. Is this expected?',
    options: opts4(
      'Yes — creating a team creates a Microsoft 365 Group, so only members of the allowed group can create teams',
      'No — team creation is independent of group creation',
      'No — only channel creation is affected',
      'Yes — but only for private teams'
    ),
    correct: ['a'],
    explanation: 'Because each team is backed by a Microsoft 365 Group, restricting group creation directly restricts who can create teams. This is expected and applies to all team types, not just private ones.',
    references: [REF_GROUP_CREATION]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Where are 1:1 and group chat files (files shared in a chat, not a channel) stored?',
    options: opts4(
      'In the OneDrive for Business of the user who shared the file',
      'In the team\'s SharePoint site',
      'In a shared mailbox',
      'In Azure Blob storage'
    ),
    correct: ['a'],
    explanation: 'Files shared in 1:1 or group chats are stored in the sharing user\'s OneDrive for Business (in a Microsoft Teams Chat Files folder). Channel files go to the team\'s SharePoint site, not chat files.',
    references: [REF_TEAMS_STORAGE]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A team was archived last quarter and the project is restarting. What should you do to resume normal activity?',
    options: opts4(
      'Unarchive the team',
      'Create a new team and migrate content manually',
      'Restore the team from the recycle bin',
      'Convert a channel into the team'
    ),
    correct: ['a'],
    explanation: 'An archived team is read-only and can be unarchived to restore full read/write activity. The team was never deleted, so the recycle bin and manual migration are unnecessary; you cannot promote a channel to a team.',
    references: [REF_ARCHIVE_TEAM]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You must report on every team and its owners across the tenant for a governance review, exporting the data. Which approach is most efficient?',
    options: opts4(
      'Use the Microsoft Teams PowerShell module to enumerate teams and owners',
      'Open each team in the Teams client and note owners manually',
      'Use Network Planner',
      'Use the Call Quality Dashboard'
    ),
    correct: ['a'],
    explanation: 'Teams PowerShell can enumerate all teams and their owners/members programmatically and export the data. Manual review doesn\'t scale; Network Planner and CQD are network/quality tools.',
    references: [REF_TEAMS_POWERSHELL]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to allow your users to chat with a partner organization while blocking everyone else, and the partner uses Teams. Which external access configuration is correct?',
    options: opts4(
      'Set external access to block all domains except the partner\'s domain (allowed domains list)',
      'Enable guest access for the partner',
      'Create a shared channel',
      'Turn off external access entirely'
    ),
    correct: ['a'],
    explanation: 'External access can be configured with an allowed-domains list so only the partner domain is permitted for Teams-to-Teams chat/calling. Guest access adds users into teams; shared channels are channel-level; turning external access off blocks everyone.',
    references: [REF_EXTERNAL_ACCESS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A guest in one of your teams should no longer have access. As Teams admin, what is the correct action?',
    options: opts4(
      'Remove the guest from the team (or from the tenant) via the Teams admin center or Microsoft Entra',
      'Archive the team',
      'Delete the team',
      'Disable guest access tenant-wide'
    ),
    correct: ['a'],
    explanation: 'Removing the specific guest from the team (or from the tenant) revokes their access cleanly. Archiving/deleting the team is disproportionate; disabling guest access tenant-wide affects all guests, not just this one.',
    references: [REF_GUEST_ACCESS]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'For a shared channel to include members from an external partner tenant, what must be configured between the tenants?',
    options: opts4(
      'B2B direct connect in the cross-tenant access settings of both tenants',
      'Guest access only in your tenant',
      'External access (federation) only',
      'A Conditional Access policy in the partner tenant only'
    ),
    correct: ['a'],
    explanation: 'Shared channels with external participants rely on B2B direct connect, configured in the cross-tenant access settings of both organizations. Guest access and external access do not enable shared channel cross-tenant membership.',
    references: [REF_B2B_DIRECT, REF_SHARED_CHANNELS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You manage a fleet of Teams phones and panels. You want a firmware update applied to a group of those devices on a schedule. Where do you do this?',
    options: opts4(
      'In the Devices section of the Teams admin center (device update / configuration)',
      'In Network Planner',
      'In the Call Quality Dashboard',
      'In a messaging policy'
    ),
    correct: ['a'],
    explanation: 'The Teams admin center Devices area manages device firmware/software updates and configuration for Teams devices. Network Planner, CQD, and messaging policies do not manage device firmware.',
    references: [REF_TEAMS_DEVICES, REF_DEVICE_PROFILES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You are configuring a Microsoft Teams Rooms device. Which type of account does the room itself sign in with?',
    options: opts4(
      'A dedicated resource account (room mailbox) licensed appropriately for Teams Rooms',
      'A standard licensed user account belonging to an employee',
      'A guest account',
      'A Global Administrator account'
    ),
    correct: ['a'],
    explanation: 'A Teams Room signs in with a dedicated resource account (room mailbox) with the appropriate Teams Rooms license. It should not use an employee\'s user account, a guest account, or an admin account.',
    references: [REF_TEAMS_ROOMS, REF_RESOURCE_ACCOUNT]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Users in a virtualized desktop environment need good Teams call quality. Besides deploying Teams optimized for VDI, what else most directly improves real-time media?',
    options: opts4(
      'Ensuring the virtualization platform\'s media optimization (AV redirection) is supported and enabled',
      'Increasing each user\'s OneDrive quota',
      'Disabling QoS',
      'Converting users to guests'
    ),
    correct: ['a'],
    explanation: 'Media optimization / AV redirection on a supported virtualization platform offloads audio/video to the local endpoint, directly improving call quality in VDI. OneDrive quota, disabling QoS, and guest conversion do not help (disabling QoS hurts).',
    references: [REF_TEAMS_VDI, REF_QOS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want recurring confirmation that members of sensitive teams still require access, with team owners as reviewers. Which feature should you configure?',
    options: opts4(
      'Microsoft Entra access reviews scoped to those teams/groups',
      'A retention policy',
      'A messaging policy',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'Access reviews recur on a schedule and let designated reviewers (e.g. team owners) confirm or remove members. Retention/messaging policies and meeting templates do not perform membership attestation.',
    references: [REF_ACCESS_REVIEWS, REF_GUEST_ACCESS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a curated set of Teams update behavior — controlling whether a group of users receives public preview features. Which mechanism should you use?',
    options: opts4(
      'A Teams update policy that controls public preview / show-preview-features for assigned users',
      'A messaging policy',
      'A retention policy',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'Teams update policies control whether assigned users get public preview features and update notifications. Messaging policies govern chat, retention governs data lifecycle, and naming policies govern team names — none control preview/update behavior.',
    references: [REF_UPDATE_POLICIES, REF_POLICY_ASSIGN]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about managing a Microsoft Teams environment with policies.',
    options: opts4(
      'Policy packages bundle multiple policy types for a role and apply them together.',
      'A policy assigned directly to a user wins over a group-assigned policy.',
      'Group policy assignment applies to new members added to the group later.',
      'The global (org-wide default) policy overrides direct user assignment.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Policy packages bundle policies; direct assignment beats group assignment; group assignment covers future members. The global default is the fallback — it does NOT override direct user assignment.',
    references: [REF_POLICY_PACKAGES, REF_POLICY_ASSIGN]
  },

  // ── Manage teams, channels, chats, and apps (15) ──
  {
    domain: TEAMS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want a team that automatically includes every user in the organization and keeps membership in sync as people join or leave. Which option should you choose?',
    options: opts4(
      'Create an org-wide team',
      'Create a standard team and add everyone manually',
      'Create a shared channel',
      'Create a frontline team'
    ),
    correct: ['a'],
    explanation: 'An org-wide team automatically includes all users in the tenant and keeps membership current. Manually adding everyone does not auto-sync; shared channels and frontline teams serve different purposes.',
    references: [REF_CREATE_TEAM, REF_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to standardize and govern which team templates makers can use, including hiding templates you do not want used. Which capability provides this?',
    options: opts4(
      'Team templates and template policies in the Teams admin center',
      'A messaging policy',
      'A retention policy',
      'An app permission policy'
    ),
    correct: ['a'],
    explanation: 'Team templates plus template policies let admins create custom templates and control (show/hide) which templates are available to users. Messaging/retention/app permission policies do not govern templates.',
    references: [REF_TEAM_TEMPLATES, REF_TEAMS_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team currently has 1 owner and 4,000 members. What is the recommended minimum number of owners, and why?',
    options: opts4(
      'At least 2 owners, so the team is not left ownerless if one owner leaves',
      'Exactly 1 owner is required and sufficient',
      'At least 100 owners',
      'Owners are optional for large teams'
    ),
    correct: ['a'],
    explanation: 'Microsoft recommends each team have at least two owners so it is not orphaned if one owner departs. One owner is risky; 100 is unnecessary; every team must have at least one owner.',
    references: [REF_TEAM_OWNERSHIP, REF_CREATE_TEAM]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You are planning a phased Teams rollout and want Microsoft\'s recommended deployment task list tracked as a project. Which Teams admin center feature do you use?',
    options: opts4(
      'Advisor for Teams',
      'Network Planner',
      'Call Quality Dashboard',
      'Teams device management'
    ),
    correct: ['a'],
    explanation: 'Advisor for Teams generates a recommended deployment project plan with tasks. Network Planner models bandwidth, CQD analyzes calls, and device management handles hardware.',
    references: [REF_ADVISOR]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A subset of a team\'s members need a private space for confidential conversations. The members are all already in the team. Which channel type fits?',
    options: opts4(
      'A private channel',
      'A shared channel',
      'A standard channel',
      'A new separate team'
    ),
    correct: ['a'],
    explanation: 'A private channel restricts visibility/access to a subset of the team\'s existing members — exactly this scenario. Shared channels are for cross-team/tenant collaboration; standard channels are open to all members; a new team is heavier than needed.',
    references: [REF_PRIVATE_CHANNELS, REF_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to stop users from using animated GIFs and stickers in chat for a compliance-sensitive department. Which policy should you configure?',
    options: opts4(
      'A messaging policy',
      'A meeting policy',
      'An app setup policy',
      'A team template'
    ),
    correct: ['a'],
    explanation: 'Messaging policies control chat features including Giphy, memes, and stickers. Meeting policies, app setup policies, and team templates do not control chat content features.',
    references: [REF_MESSAGING_POLICIES, REF_TEAMS_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a department\'s users to have Approvals and Shifts apps pinned, in a specific order, on the Teams app bar. Which policy delivers this?',
    options: opts4(
      'An app setup policy assigned to the department',
      'An app permission policy',
      'A messaging policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'App setup policies install and pin specific apps in a defined order for targeted users. App permission policies allow/block apps but do not pin them; messaging and retention policies are unrelated.',
    references: [REF_APP_SETUP, REF_APP_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Your security team wants only Microsoft-published apps allowed, with all third-party and custom apps blocked by default. Which control should you configure?',
    options: opts4(
      'Org-wide app settings / app permission policies that allow Microsoft apps and block third-party and custom apps',
      'An app setup policy',
      'A messaging policy',
      'A meeting policy'
    ),
    correct: ['a'],
    explanation: 'Org-wide app settings and app permission policies control which categories of apps (Microsoft, third-party, custom) are allowed or blocked. App setup policies only pin allowed apps; messaging and meeting policies are unrelated.',
    references: [REF_APP_PERMISSION, REF_APP_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 3, type: QType.SINGLE,
    stem: 'A third-party app requests permissions (consent) to access organizational data. As Teams admin, where do you review and manage consent for Teams apps?',
    options: opts4(
      'App management and governance in the Teams admin center (app permissions/consent), aligned with Microsoft Entra app consent settings',
      'A retention policy',
      'Network Planner',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'Teams admin center app management governs app permissions and consent for Teams apps, in conjunction with Microsoft Entra app consent settings. Retention policies, Network Planner, and meeting templates do not manage app consent.',
    references: [REF_APP_POLICIES, REF_APP_PERMISSION]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to control whether members (not just owners) can add and remove channels in their teams. Where is this set?',
    options: opts4(
      'In the team\'s member permissions settings (managed by the team owner or admin)',
      'In a messaging policy',
      'In an app setup policy',
      'In a retention policy'
    ),
    correct: ['a'],
    explanation: 'A team\'s member permission settings control whether members can create/update/delete channels, tabs, apps, and connectors. Messaging, app setup, and retention policies do not govern member channel permissions.',
    references: [REF_CHANNELS, REF_TEAM_OWNERSHIP]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A retail company wants thousands of store teams provisioned with a consistent structure and frontline apps, deployed and kept in sync automatically. Which capability fits best?',
    options: opts4(
      'Deploy frontline teams at scale (frontline team deployment)',
      'Create one org-wide team',
      'Use shared channels for each store',
      'Create teams manually per store'
    ),
    correct: ['a'],
    explanation: 'Frontline team deployment provisions many teams at scale with a consistent frontline structure and keeps membership synced from a data source. An org-wide team is a single team; shared channels and manual creation don\'t fit thousands of stores.',
    references: [REF_FRONTLINE, REF_TEAM_TEMPLATES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team owner wants a channel where they post updates and members can read but cannot reply. Which channel setting achieves this?',
    options: opts4(
      'Set the standard channel so that only owners (moderators) can post new messages',
      'Convert the channel to a private channel',
      'Convert the channel to a shared channel',
      'Apply a retention policy to the channel'
    ),
    correct: ['a'],
    explanation: 'Channel moderation lets owners restrict who can start posts (e.g. owners only), turning a channel into an announcement-style space. Private/shared channels change membership scope, not posting rights; retention is about data lifecycle.',
    references: [REF_CHANNELS, REF_MESSAGING_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a custom line-of-business app to Teams for internal users only. After uploading it to the org app catalog, how do you make it available and pinned for the target users?',
    options: opts4(
      'Allow the app in an app permission policy and pin it via an app setup policy assigned to those users',
      'Publish it to the public Teams store',
      'Email the app package to users',
      'Add it as a connector in one channel'
    ),
    correct: ['a'],
    explanation: 'After uploading the custom app, an app permission policy allows it and an app setup policy installs/pins it for the targeted users. Public store publication is not desired; emailing packages and single-channel connectors don\'t scale availability.',
    references: [REF_APP_PERMISSION, REF_APP_SETUP]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Two teams need to collaborate on one workstream without merging or one joining the other as guests. Which feature should you use?',
    options: opts4(
      'A shared channel that both teams can be given access to',
      'A private channel in one of the teams',
      'An org-wide team',
      'Guest access for all members of both teams'
    ),
    correct: ['a'],
    explanation: 'A shared channel can be shared with other teams (and tenants), letting members collaborate in that channel without merging teams or adding guests. Private channels are limited to one team\'s members; org-wide teams and mass guest access are inappropriate.',
    references: [REF_SHARED_CHANNELS, REF_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about creating and managing teams.',
    options: opts4(
      'A team can be created from an existing Microsoft 365 group, SharePoint site, or another team.',
      'Team templates predefine channels, tabs, and apps for consistent team creation.',
      'Each team should have at least two owners as a best practice.',
      'Deleting a team permanently and immediately destroys all its content with no recovery.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Teams can be created from existing groups/sites/teams; templates predefine structure; two owners is best practice. A deleted team (and its group) is recoverable during the ~30-day soft-delete window — not immediately unrecoverable.',
    references: [REF_CREATE_TEAM, REF_TEAM_TEMPLATES, REF_TEAM_OWNERSHIP]
  },

  // ── Manage meetings and calling (12) ──
  {
    domain: MEETINGS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to disable meeting recording for a group of users. Which policy controls this?',
    options: opts4(
      'A Teams meeting policy',
      'A calling policy',
      'A messaging policy',
      'An app setup policy'
    ),
    correct: ['a'],
    explanation: 'Meeting policies control meeting capabilities including cloud recording and transcription. Calling policies govern person-to-person calls; messaging and app setup policies are unrelated.',
    references: [REF_MEETING_POLICIES, REF_MEETING_SETTINGS]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to change tenant-level meeting behavior such as whether anonymous users can join and the default email invitation branding. Where do you configure this?',
    options: opts4(
      'Meeting settings (org-wide) in the Teams admin center',
      'A per-user meeting policy only',
      'A messaging policy',
      'A team template'
    ),
    correct: ['a'],
    explanation: 'Org-wide meeting settings control tenant-level behavior such as anonymous join and meeting invitation customization. Per-user meeting policies control assigned users\' features; messaging policies and templates are unrelated.',
    references: [REF_MEETING_SETTINGS, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ensure that town hall and webinar events for the marketing team always start with predefined, locked settings. Which feature should you use?',
    options: opts4(
      'Custom meeting templates with locked settings, assigned via a template policy',
      'A messaging policy',
      'A calling policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Custom meeting templates predefine and lock settings, and template policies control which templates users can use. Messaging, calling, and retention policies do not template event settings.',
    references: [REF_MEETING_TEMPLATES, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'An event needs attendee registration, a waitlist, and a structured presenter experience for an audience of about 500. Which meeting type fits?',
    options: opts4(
      'A webinar',
      'A town hall',
      'A standard scheduled meeting',
      'A 1:1 call'
    ),
    correct: ['a'],
    explanation: 'Webinars provide registration (including waitlist/capacity) and a presenter/attendee experience suitable for moderate audiences. Town halls target very large broadcasts; standard meetings lack registration; 1:1 calls are not events.',
    references: [REF_WEBINARS, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to control who in the organization is allowed to schedule webinars. Which policy should you configure?',
    options: opts4(
      'A meeting policy that governs webinar scheduling permissions',
      'A calling policy',
      'A messaging policy',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'Meeting policies include settings that govern whether assigned users can schedule webinars (and related event types). Calling, messaging, and naming policies do not control webinar scheduling.',
    references: [REF_MEETING_POLICIES, REF_WEBINARS]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'To enable phone dial-in for meetings organized by a set of users, what must each of those users be assigned?',
    options: opts4(
      'An Audio Conferencing license/capability',
      'A calling policy only',
      'A messaging policy',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'Meeting organizers need Audio Conferencing assigned so their meetings include dial-in numbers. A calling policy governs calls, not meeting dial-in; messaging policies and meeting templates do not provide dial-in.',
    references: [REF_AUDIO_CONF, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.SINGLE,
    stem: 'You need callers to a main line to hear "Press 1 for Sales, Press 2 for Support" and be routed accordingly, with business hours and holiday handling. What should you configure?',
    options: opts4(
      'An auto attendant',
      'A call queue',
      'A calling policy',
      'A resource account with no voice app'
    ),
    correct: ['a'],
    explanation: 'An auto attendant provides menu prompts, key-press routing, and business-hours/holiday call handling. A call queue distributes calls to agents; calling policies govern features; a resource account is just the identity holder for a voice app.',
    references: [REF_AUTO_ATTENDANT, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.SINGLE,
    stem: 'A 12-agent help desk needs inbound calls distributed with serial vs round-robin options, an overflow threshold, and a timeout action. Which feature should you configure?',
    options: opts4(
      'A call queue',
      'An auto attendant',
      'A dial plan',
      'A meeting policy'
    ),
    correct: ['a'],
    explanation: 'A call queue distributes inbound calls to a set of agents with routing methods (attendant, serial, round robin, longest idle), and overflow/timeout handling. Auto attendants are menus; dial plans normalize dialed numbers; meeting policies are unrelated.',
    references: [REF_CALL_QUEUE, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You created an auto attendant. It needs a phone number callers can dial. How is the number associated with it?',
    options: opts4(
      'Assign a service number to a resource account, and associate that resource account with the auto attendant',
      'Assign the number directly to the auto attendant object',
      'Assign the number to a standard user who owns the auto attendant',
      'Auto attendants do not use phone numbers'
    ),
    correct: ['a'],
    explanation: 'A service phone number is assigned to a resource account, and the resource account is linked to the auto attendant (or call queue). Numbers are not assigned directly to the voice-app object or to a standard user for this purpose.',
    references: [REF_RESOURCE_ACCOUNT, REF_AUTO_ATTENDANT]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You must ensure Teams calls to emergency services route correctly and report the caller\'s location. Which capability should you configure?',
    options: opts4(
      'Emergency calling — emergency addresses, locations (LIS), and emergency call routing policies',
      'A messaging policy',
      'An app setup policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Emergency calling configuration (emergency addresses/locations, Location Information Service, and emergency call routing policies) ensures correct routing and location reporting. Messaging, app setup, and retention policies are unrelated.',
    references: [REF_EMERGENCY_CALLING, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to prevent a group of users from making international PSTN calls. Which mechanism should you use?',
    options: opts4(
      'A calling policy / outbound call restriction (call routing) that blocks international calls for those users',
      'A meeting policy',
      'A messaging policy',
      'An app permission policy'
    ),
    correct: ['a'],
    explanation: 'Outbound calling restrictions (via calling policy / voice routing controls) limit the types of PSTN calls users can place, including blocking international. Meeting, messaging, and app permission policies do not restrict outbound calling.',
    references: [REF_CALLING_POLICIES, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Teams meetings, webinars, and town halls.',
    options: opts4(
      'Webinars support attendee registration and a presenter/attendee experience.',
      'Town halls are designed for very large one-to-many broadcast events.',
      'Meeting templates can predefine and lock meeting settings for organizers.',
      'Town halls require every attendee to be a licensed member of the host tenant.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Webinars have registration; town halls are large broadcasts; meeting templates predefine/lock settings. Town halls can include external/public attendees — they do not require every attendee to be a licensed member of the host tenant.',
    references: [REF_WEBINARS, REF_TOWN_HALL, REF_MEETING_TEMPLATES]
  },

  // ── Monitor, report on, and troubleshoot Teams (11) ──
  {
    domain: MONITOR, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A user complains that one specific meeting last week had bad video. Which tool gives you the detailed quality timeline for that exact session?',
    options: opts4(
      'Per-user call analytics for that user',
      'Network Planner',
      'The Teams usage activity report',
      'The message center'
    ),
    correct: ['a'],
    explanation: 'Per-user call analytics drills into a specific user\'s calls and meetings with per-session, per-leg quality detail. Network Planner models bandwidth, usage reports show adoption, and the message center shows announcements.',
    references: [REF_CALL_ANALYTICS, REF_CQD]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You suspect a systemic call-quality problem and want to compare quality across regions, builds, and network types organization-wide. Which tool should you use?',
    options: opts4(
      'Call Quality Dashboard',
      'Per-user call analytics',
      'Advisor for Teams',
      'The Teams device page'
    ),
    correct: ['a'],
    explanation: 'The Call Quality Dashboard aggregates quality across the org and supports slicing by region, client build, network type, etc. Per-user analytics is single-user; Advisor is for deployment tasks; the device page shows hardware health.',
    references: [REF_CQD, REF_CALL_ANALYTICS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'In CQD, you want reports to label calls by office building and ISP rather than raw subnets. What must you provide?',
    options: opts4(
      'A building/subnet (tenant data) mapping uploaded to CQD',
      'A retention policy',
      'A naming policy',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'Uploading a building/subnet tenant-data file to CQD maps subnets to building, ISP, and other friendly attributes for richer reports. Retention/naming policies and meeting templates do not enrich CQD.',
    references: [REF_CQD]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to report monthly active Teams users and a breakdown of messages, meetings, and calls to leadership. Which report should you use?',
    options: opts4(
      'The Microsoft Teams usage activity report in the Microsoft 365 admin center',
      'The Call Quality Dashboard',
      'Per-user call analytics',
      'Advisor for Teams'
    ),
    correct: ['a'],
    explanation: 'The Teams usage activity report shows active users and activity breakdowns over time. CQD and call analytics measure quality; Advisor is for deployment planning.',
    references: [REF_USAGE_REPORT, REF_TEAMS_REPORTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user\'s Teams desktop client keeps crashing and you need to gather data for support. As a first step, what should you collect?',
    options: opts4(
      'Client-side Teams diagnostic logs from the user\'s machine',
      'The tenant\'s billing invoices',
      'The user\'s OneDrive contents',
      'The team\'s SharePoint site logs'
    ),
    correct: ['a'],
    explanation: 'Collecting the Teams client-side diagnostic logs from the affected machine is the first data-gathering step for client crashes. Billing invoices, OneDrive contents, and SharePoint site logs are irrelevant to a client crash.',
    references: [REF_TROUBLESHOOT, REF_TEAMS_CACHE]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'After a Teams update, a user sees outdated presence and missing chats. What is the recommended low-impact remediation?',
    options: opts4(
      'Clear the Teams client cache and restart the client',
      'Rebuild the user\'s Windows profile',
      'Delete the user from Microsoft Entra',
      'Disable the user\'s mailbox'
    ),
    correct: ['a'],
    explanation: 'Clearing the Teams cache and restarting resolves most stale-presence and missing-data symptoms with minimal impact. Rebuilding the profile, deleting the account, or disabling the mailbox are excessive.',
    references: [REF_TEAMS_CACHE, REF_TROUBLESHOOT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to be alerted whenever an unusually high number of teams are deleted in a short window. Which capability should you configure?',
    options: opts4(
      'An alert policy that monitors group/team deletion activity',
      'A meeting policy',
      'A messaging policy',
      'Network Planner'
    ),
    correct: ['a'],
    explanation: 'Alert policies can watch activities such as group/team deletions and notify admins on threshold breaches. Meeting/messaging policies and Network Planner do not raise activity alerts.',
    references: [REF_ALERT_POLICIES, REF_TEAMS_REPORTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You manage 200 Teams Rooms and need a single view of which rooms are online, in a call, or unhealthy. Where do you look?',
    options: opts4(
      'The Devices area of the Teams admin center (and Teams Rooms Pro Management portal)',
      'The Call Quality Dashboard',
      'Network Planner',
      'The Microsoft 365 message center'
    ),
    correct: ['a'],
    explanation: 'The Teams admin center Devices area (and the Teams Rooms Pro Management portal) shows device health, status, and call state. CQD analyzes call quality, Network Planner models bandwidth, and the message center shows announcements.',
    references: [REF_CLIENT_HEALTH, REF_TEAMS_DEVICES]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'CQD shows poor quality concentrated on wireless (Wi-Fi) connections across multiple buildings. What is the most appropriate remediation focus?',
    options: opts4(
      'Improve Wi-Fi quality and apply QoS / wired connections for real-time media where possible',
      'Reset all users\' passwords',
      'Disable Teams meetings tenant-wide',
      'Delete and recreate the affected teams'
    ),
    correct: ['a'],
    explanation: 'Quality concentrated on Wi-Fi points to wireless network conditions; remediation focuses on Wi-Fi improvements and QoS (and wired connections where feasible). Password resets, disabling meetings, and recreating teams do not address Wi-Fi quality.',
    references: [REF_CQD, REF_QOS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A Teams device fails to complete remote sign-in/provisioning. Which Microsoft resource best guides remediation?',
    options: opts4(
      'Microsoft Learn guidance on Teams device management and remote provisioning/sign-in',
      'The Teams usage activity report',
      'Network Planner',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s device management / remote provisioning documentation guides remediation of device sign-in/provisioning failures. Usage reports, Network Planner, and retention policies are unrelated.',
    references: [REF_DEVICE_PROFILES, REF_TEAMS_DEVICES]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about troubleshooting and monitoring Teams.',
    options: opts4(
      'Clearing the Teams client cache resolves many stale-data and update-related client issues.',
      'Per-user call analytics is best for investigating one user\'s specific call.',
      'Call Quality Dashboard is best for organization-wide quality trend analysis.',
      'The Teams usage activity report is the primary tool for diagnosing a single dropped call.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Clearing the cache fixes many client issues; per-user call analytics targets a single user\'s call; CQD is for org-wide trends. The usage activity report shows adoption metrics — it is NOT a per-call diagnostic for a dropped call (use call analytics for that).',
    references: [REF_TEAMS_CACHE, REF_CALL_ANALYTICS, REF_CQD, REF_USAGE_REPORT]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Configure and manage a Teams environment (27) ──
  {
    domain: ENVIRONMENT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'When preparing the network for Teams, Microsoft recommends categorizing endpoints. Which traffic category should be allowed to bypass proxies and inspection for best real-time media quality?',
    options: opts4(
      'The Optimize category endpoints',
      'The Default category endpoints',
      'The Blocked category endpoints',
      'All endpoints should always be inspected by the proxy'
    ),
    correct: ['a'],
    explanation: 'Microsoft 365 endpoints are grouped into Optimize, Allow, and Default. Optimize endpoints carry latency-sensitive real-time media and should bypass proxies/inspection. Default endpoints can route normally; inspecting all traffic harms media quality.',
    references: [REF_PORTS, REF_NETWORK]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You implement QoS for Teams. For the DSCP markings to be honored, what must also be true?',
    options: opts4(
      'The network devices (routers/switches) must be configured to honor the same DSCP values Teams marks',
      'Only the Teams client needs configuration; the network ignores DSCP',
      'QoS requires Audio Conferencing licenses',
      'QoS requires guest access to be enabled'
    ),
    correct: ['a'],
    explanation: 'QoS is end-to-end: endpoints mark packets with DSCP and the network infrastructure must be configured to recognize and prioritize those markings. Client-only configuration with an unaware network has no effect; licenses and guest access are unrelated.',
    references: [REF_QOS, REF_NETWORK]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A junior admin must reset Teams call/meeting issues and view diagnostics for users, but must not change policies. Which role is most appropriate?',
    options: opts4(
      'Teams Communications Support Specialist',
      'Teams Administrator',
      'Global Administrator',
      'Teams Communications Administrator'
    ),
    correct: ['a'],
    explanation: 'The Teams Communications Support Specialist role is troubleshooting-focused — viewing user call/meeting diagnostics — without policy or configuration rights. Teams Administrator and Teams Communications Administrator can change configuration; Global Admin is full control.',
    references: [REF_ADMIN_ROLES]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Two retention policies apply to the same Teams chat: Policy A retains for 1 year, Policy B retains for 7 years. Which retention outcome wins?',
    options: opts4(
      'The longest retention period wins — content is retained for 7 years',
      'The shortest retention period wins — 1 year',
      'The policies cancel each other out',
      'Only the most recently created policy applies'
    ),
    correct: ['a'],
    explanation: 'Retention principles: retention always wins over deletion, and the longest retention period wins when multiple retain policies apply. So content is kept for 7 years. Policies do not cancel out, and creation order is not the deciding factor.',
    references: [REF_RETENTION]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A sensitivity label applied to a team is configured to set the team to "Private". What happens if a user tries to change that team to Public?',
    options: opts4(
      'The label enforces the Private setting and the user cannot change it to Public',
      'The label is ignored and the user can change it freely',
      'The team is deleted',
      'The label only affects files, not the team privacy setting'
    ),
    correct: ['a'],
    explanation: 'A sensitivity label with container settings enforces the privacy (and guest) configuration; users cannot override the labeled setting. The label is not ignored, does not delete the team, and does affect container/team-level settings, not just files.',
    references: [REF_SENSITIVITY]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A DLP policy for Teams should apply to chat with external participants but not to purely internal chats. How is this scoped?',
    options: opts4(
      'Configure the DLP rule conditions to target content shared with people outside the organization',
      'Apply the DLP policy to SharePoint only',
      'Disable guest access',
      'Use a messaging policy instead'
    ),
    correct: ['a'],
    explanation: 'DLP rules support conditions such as "content is shared with people outside my organization", letting the policy act on external sharing specifically. Scoping to SharePoint, disabling guest access, or using a messaging policy do not achieve this.',
    references: [REF_DLP]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'After information barrier policies are applied, what happens if a user already in a team violates a newly created barrier?',
    options: opts4(
      'Information barriers processing removes the non-compliant user from the team',
      'Nothing — existing memberships are always grandfathered in',
      'The whole team is deleted',
      'The barrier is automatically disabled'
    ),
    correct: ['a'],
    explanation: 'When information barrier policies are applied and processed, users who violate a barrier are removed from the shared team/group. Existing memberships are not grandfathered; the team is not deleted and the barrier is not auto-disabled.',
    references: [REF_INFO_BARRIERS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want the security team to be alerted when Teams content matching a communication compliance policy is detected, and to be able to investigate and remediate. Who should be configured on the policy?',
    options: opts4(
      'Reviewers — the users/group responsible for triaging matched items',
      'Only the affected end user',
      'A retention administrator',
      'A network engineer'
    ),
    correct: ['a'],
    explanation: 'Communication compliance policies designate reviewers who are notified of and triage/remediate matched items. The affected end user is not the reviewer; retention admins and network engineers are unrelated to this workflow.',
    references: [REF_COMM_COMPLIANCE]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Teams accessible from personal devices, but only with limited functionality (no download of files) when the device is unmanaged. Which combination should you use?',
    options: opts4(
      'Conditional Access app-enforced restrictions / app protection policies to limit functionality on unmanaged devices',
      'A messaging policy',
      'A retention policy',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'Conditional Access with app-enforced restrictions (and app protection policies for mobile) can limit functionality such as file download on unmanaged devices. Messaging, retention, and naming policies do not impose device-state-based functional limits.',
    references: [REF_CA]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You configured an alert policy for Teams. Where do admins go to view and act on the alerts it generates?',
    options: opts4(
      'The alerts dashboard in the Microsoft Purview / Microsoft Defender portal',
      'Network Planner',
      'The Teams client activity feed',
      'The SharePoint admin center'
    ),
    correct: ['a'],
    explanation: 'Alerts from alert policies surface in the Purview/Defender portal alerts dashboard for review and action. Network Planner, the Teams client activity feed, and the SharePoint admin center are not where compliance/security alerts are managed.',
    references: [REF_ALERT_POLICIES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to deploy a policy package so that frontline managers get a manager-oriented set of policies. After assigning the package, a manager later gets a directly-assigned messaging policy. Which messaging policy applies to that manager?',
    options: opts4(
      'The directly-assigned messaging policy — direct assignment overrides the package\'s messaging policy',
      'The package\'s messaging policy always wins',
      'Both apply simultaneously',
      'Neither applies; the global default is used'
    ),
    correct: ['a'],
    explanation: 'Direct user assignment of a policy overrides the corresponding policy from a policy package. Policies of the same type do not both apply; the global default is only the fallback when nothing else is assigned.',
    references: [REF_POLICY_PACKAGES, REF_POLICY_ASSIGN]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must assign a meeting policy to 8,000 users defined only by a dynamic Microsoft Entra group based on department. Which assignment method handles this and keeps up as departments change?',
    options: opts4(
      'Group policy assignment to the dynamic group',
      'Per-user assignment exported to CSV',
      'Setting the policy as the org-wide default',
      'Batch assignment run once'
    ),
    correct: ['a'],
    explanation: 'Group policy assignment works with dynamic groups; as the dynamic membership changes, the policy follows. Per-user/CSV and one-time batch assignment go stale; the org-wide default would affect everyone.',
    references: [REF_POLICY_ASSIGN]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A Microsoft 365 group/team is about to expire. Who receives the renewal notifications?',
    options: opts4(
      'The team/group owners',
      'Every member of the team',
      'Only Global Administrators',
      'The Microsoft 365 service desk'
    ),
    correct: ['a'],
    explanation: 'Group expiration renewal notifications are sent to the group owners, who can renew the group. Members, Global Admins, and a service desk are not the notification recipients.',
    references: [REF_GROUP_EXPIRATION]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A groups naming policy uses the suffix "[Dept]" filled from a Microsoft Entra attribute. A user\'s attribute is empty. What is the typical result?',
    options: opts4(
      'The suffix may resolve to a blank value, so plan to populate the attribute for accurate names',
      'Team creation is permanently blocked for everyone',
      'The naming policy is disabled tenant-wide',
      'The team is created with a random suffix'
    ),
    correct: ['a'],
    explanation: 'Attribute-based prefix/suffix tokens draw from Microsoft Entra attributes; if the attribute is empty the token resolves to nothing, so attributes should be populated for meaningful names. It does not block all creation, disable the policy, or generate a random suffix.',
    references: [REF_GROUP_NAMING]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You restricted team creation to a security group. A manager not in that group needs to create teams for their projects going forward. What should you do?',
    options: opts4(
      'Add the manager to the security group that is permitted to create Microsoft 365 Groups',
      'Make the manager a Global Administrator',
      'Disable the group-creation restriction tenant-wide',
      'Tell the manager to create channels instead'
    ),
    correct: ['a'],
    explanation: 'Adding the manager to the permitted security group grants team-creation rights with least privilege. Global Admin is excessive, removing the restriction defeats governance, and channels are not a substitute for teams.',
    references: [REF_GROUP_CREATION]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Where is the content of channel messages (the posts themselves) journaled for compliance, even though channel files live in SharePoint?',
    options: opts4(
      'In a hidden folder of the team\'s group mailbox in Exchange Online',
      'In each member\'s personal mailbox',
      'In the team\'s SharePoint site',
      'In Azure Blob storage'
    ),
    correct: ['a'],
    explanation: 'Channel messages are journaled into a hidden folder of the team\'s Microsoft 365 group mailbox in Exchange Online (used by compliance tools). Files go to SharePoint, but the messages themselves use the group mailbox.',
    references: [REF_TEAMS_STORAGE]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A team was deleted yesterday by mistake. Within the soft-delete window, how can it be recovered?',
    options: opts4(
      'Restore the underlying Microsoft 365 group (and thus the team) within the ~30-day soft-delete window',
      'It cannot be recovered once deleted',
      'Recreate it from scratch — content is unrecoverable',
      'Unarchive it'
    ),
    correct: ['a'],
    explanation: 'A deleted team\'s backing Microsoft 365 group is soft-deleted and restorable for about 30 days, which restores the team and its content. It is recoverable in that window; "unarchive" applies only to archived (not deleted) teams.',
    references: [REF_ARCHIVE_TEAM, REF_TEAMS_STORAGE]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to perform a bulk operation that the Teams admin center UI does not support efficiently — for example, applying a policy to 3,000 users from a CSV. Which tool should you use?',
    options: opts4(
      'Microsoft Teams PowerShell (and/or Microsoft Graph)',
      'The Teams client',
      'Network Planner',
      'The Call Quality Dashboard'
    ),
    correct: ['a'],
    explanation: 'Teams PowerShell (and Microsoft Graph) support scripted bulk operations such as batch policy assignment. The Teams client is end-user; Network Planner and CQD are network/quality tools.',
    references: [REF_TEAMS_POWERSHELL, REF_POLICY_ASSIGN]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'You enabled external access with no domain restrictions, then later add a domain to the "blocked" list. What is the effect?',
    options: opts4(
      'Users can communicate externally with all domains except the blocked one',
      'Only the blocked domain is allowed',
      'All external access is disabled',
      'Guest access is disabled'
    ),
    correct: ['a'],
    explanation: 'With an allow-all-with-exceptions model, adding a domain to the blocked list blocks just that domain while all others remain allowed. It does not invert to allow-only, disable all external access, or affect guest access.',
    references: [REF_EXTERNAL_ACCESS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A guest should be able to see and post in a team\'s channels but should not be able to create new channels. How is this controlled?',
    options: opts4(
      'Guest permissions in the team settings (which channel-management actions guests can perform)',
      'A messaging policy',
      'A retention policy',
      'A meeting policy'
    ),
    correct: ['a'],
    explanation: 'A team\'s guest permission settings control what guests can do, such as creating/updating/deleting channels. Messaging, retention, and meeting policies do not govern guest channel-management permissions.',
    references: [REF_GUEST_ACCESS, REF_CHANNELS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Your organization wants employees to collaborate with a partner in a shared channel, using their normal work identities, with no guest accounts created. Which prerequisite must both organizations configure?',
    options: opts4(
      'B2B direct connect cross-tenant access settings allowing the other organization',
      'Guest access turned on in both tenants',
      'A site-to-site VPN between the two organizations',
      'A Conditional Access policy disabling MFA'
    ),
    correct: ['a'],
    explanation: 'Shared channels with external participants require B2B direct connect cross-tenant access settings allowing the partner organization in both tenants. Guest access creates guest accounts (not desired here); VPNs and disabling MFA are irrelevant.',
    references: [REF_B2B_DIRECT, REF_SHARED_CHANNELS]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You manage common-area phones in lobbies. Which Teams admin center capability lets you apply a consistent configuration (e.g. hot desking, display) to all of them?',
    options: opts4(
      'Configuration profiles for Teams devices applied to the common-area phones',
      'A messaging policy',
      'A meeting template',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Device configuration profiles apply consistent settings to a group of Teams devices such as common-area phones. Messaging policies, meeting templates, and retention policies do not configure devices.',
    references: [REF_DEVICE_PROFILES, REF_TEAMS_DEVICES]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A Microsoft Teams Room must be excluded from a Conditional Access MFA requirement because it cannot perform interactive MFA. What is the recommended approach?',
    options: opts4(
      'Exclude the room\'s resource account from the MFA Conditional Access policy (using a documented exception)',
      'Disable Conditional Access for the whole tenant',
      'Give the room a Global Administrator role',
      'Convert the room account to a guest account'
    ),
    correct: ['a'],
    explanation: 'Teams Rooms resource accounts typically need a documented Conditional Access exclusion from interactive MFA (while still being secured by other controls). Disabling CA tenant-wide, granting Global Admin, or using a guest account are all inappropriate.',
    references: [REF_TEAMS_ROOMS, REF_CA]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Teams data residency information for a compliance questionnaire — specifically where the various Teams workloads store data. Which Microsoft resource answers this?',
    options: opts4(
      'Microsoft Learn documentation on the location of Microsoft Teams data',
      'The Call Quality Dashboard',
      'Network Planner',
      'A meeting policy'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s documentation on the location of Teams data describes where each Teams workload\'s data is stored. CQD, Network Planner, and meeting policies do not provide data-residency information.',
    references: [REF_TEAMS_STORAGE]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want only a pilot group to receive Teams public preview features ahead of the rest of the organization. Which mechanism should you use?',
    options: opts4(
      'Assign a Teams update policy that enables public preview to the pilot group',
      'A messaging policy',
      'A retention policy',
      'An information barrier'
    ),
    correct: ['a'],
    explanation: 'A Teams update policy controls public preview enrollment and can be assigned to a pilot group. Messaging/retention policies and information barriers do not govern preview feature access.',
    references: [REF_UPDATE_POLICIES, REF_POLICY_ASSIGN]
  },
  {
    domain: ENVIRONMENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want recurring reviews where reviewers confirm whether external guests still need membership in sensitive teams. Which feature should you configure and what is a good reviewer choice?',
    options: opts4(
      'Microsoft Entra access reviews, with team owners (or a chosen reviewer) as the reviewers',
      'A retention policy, reviewed by the compliance team',
      'A naming policy, reviewed by HR',
      'A messaging policy, reviewed by the help desk'
    ),
    correct: ['a'],
    explanation: 'Access reviews recur and let reviewers (e.g. team owners) confirm or remove guests. Retention, naming, and messaging policies are not membership-attestation tools.',
    references: [REF_ACCESS_REVIEWS, REF_GUEST_ACCESS]
  },
  {
    domain: ENVIRONMENT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Teams network readiness and quality.',
    options: opts4(
      'QoS requires both endpoint DSCP marking and network devices configured to honor those markings.',
      'Optimize-category Microsoft 365 endpoints carry latency-sensitive media and should bypass proxy inspection.',
      'Network Planner models projected per-site bandwidth before deployment.',
      'The Call Quality Dashboard estimates bandwidth needs before any calls are made.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'QoS is end-to-end (endpoints + network); Optimize endpoints should bypass inspection; Network Planner models planned bandwidth. The Call Quality Dashboard analyzes ACTUAL historical call data — it does not estimate bandwidth before calls exist.',
    references: [REF_QOS, REF_PORTS, REF_NETWORK_PLANNER]
  },

  // ── Manage teams, channels, chats, and apps (15) ──
  {
    domain: TEAMS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to create a team specifically for a class or a project using a structure Microsoft already provides. What should you start from?',
    options: opts4(
      'A built-in (Microsoft-provided) team template',
      'An org-wide team',
      'A private channel',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Microsoft provides built-in team templates (e.g. for classes, projects, events) you can use as a starting point. Org-wide teams auto-include everyone; private channels and retention policies are not team-creation starting points.',
    references: [REF_TEAM_TEMPLATES, REF_CREATE_TEAM]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want makers in your organization to only see and use two approved custom team templates and not the full built-in list. Which capability achieves this?',
    options: opts4(
      'A template policy that controls which templates are visible to assigned users',
      'A messaging policy',
      'An app permission policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Template policies control which team templates users can see/use, so you can hide the rest. Messaging, app permission, and retention policies do not govern template visibility.',
    references: [REF_TEAM_TEMPLATES, REF_TEAMS_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team owner wants members to be unable to delete or edit their own sent messages in the team. Which setting controls message edit/delete behavior?',
    options: opts4(
      'A messaging policy assigned to the relevant users',
      'A team template',
      'A retention label',
      'An app setup policy'
    ),
    correct: ['a'],
    explanation: 'A messaging policy controls whether users can edit and delete sent messages. Team templates define structure, retention labels govern data lifecycle, and app setup policies pin apps.',
    references: [REF_MESSAGING_POLICIES, REF_TEAMS_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports they cannot create a private channel in their team. As admin, where do you check first?',
    options: opts4(
      'The Teams policy assigned to the user (private channel creation setting) and the team\'s member permissions',
      'The user\'s mailbox size',
      'The Call Quality Dashboard',
      'Network Planner'
    ),
    correct: ['a'],
    explanation: 'Private channel creation is governed by the Teams policy assigned to the user and by the team\'s member permission settings. Mailbox size, CQD, and Network Planner are unrelated to channel creation rights.',
    references: [REF_TEAMS_POLICIES, REF_PRIVATE_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to make a specific app required (auto-installed) for all members of the sales department in Teams. Which policy delivers a required app installation?',
    options: opts4(
      'An app setup policy that installs the app for the targeted users',
      'An app permission policy',
      'A messaging policy',
      'A meeting policy'
    ),
    correct: ['a'],
    explanation: 'App setup policies can install (and pin) apps for targeted users, effectively making an app required for them. App permission policies only allow/block apps; messaging and meeting policies are unrelated.',
    references: [REF_APP_SETUP, REF_APP_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a new third-party app to be unavailable to everyone until your security team reviews it, but you do not want to block all new apps permanently. Which approach fits?',
    options: opts4(
      'Use org-wide app settings / permission policies to block the specific app (or new third-party apps) pending review, then allow it after approval',
      'Delete the Teams app store',
      'Disable Teams for all users',
      'Apply a retention policy to the app'
    ),
    correct: ['a'],
    explanation: 'Org-wide app settings and app permission policies let you block specific apps (or new third-party apps) pending review and then allow them. You cannot delete the app store; disabling Teams is extreme; retention policies do not gate apps.',
    references: [REF_APP_PERMISSION, REF_APP_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team\'s only owner has left and the team is ownerless. Members can still chat but cannot manage the team. What is the cleanest admin remediation?',
    options: opts4(
      'In the Teams admin center, edit the team\'s membership and promote a suitable member to owner',
      'Delete the team and tell members to start over',
      'Archive the team permanently',
      'Convert the team to an org-wide team'
    ),
    correct: ['a'],
    explanation: 'An admin can manage team membership in the Teams admin center and promote a member to owner, restoring manageability without data loss. Deleting/archiving loses or freezes content; converting to org-wide changes the team\'s nature.',
    references: [REF_TEAM_OWNERSHIP, REF_CREATE_TEAM]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You are rolling out Teams and want a structured plan in the Teams admin center listing recommended configuration tasks with progress tracking. Which feature provides it?',
    options: opts4(
      'Advisor for Teams',
      'A team template',
      'A messaging policy',
      'The message center'
    ),
    correct: ['a'],
    explanation: 'Advisor for Teams provides a deployment plan of recommended tasks with progress tracking. Team templates define team structure; messaging policies govern chat; the message center shows announcements.',
    references: [REF_ADVISOR]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You need many store teams to stay in sync with an HR system so staff are automatically added/removed as they are hired or leave. Which capability supports this?',
    options: opts4(
      'Frontline team deployment with dynamic membership driven by a data source',
      'Manually editing each team weekly',
      'A retention policy',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'Frontline team deployment can keep team membership synchronized from a workforce/HR data source at scale. Manual weekly edits do not scale; retention policies and meeting templates do not manage membership.',
    references: [REF_FRONTLINE, REF_TEAM_TEMPLATES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team owner wants one channel to be an announcements-only space where members can read but only owners post. What should the owner configure?',
    options: opts4(
      'Channel moderation, setting only owners (moderators) as able to start new posts',
      'Convert the channel to a private channel',
      'Apply a retention policy',
      'Convert the channel to a shared channel'
    ),
    correct: ['a'],
    explanation: 'Channel moderation lets owners restrict who can start posts (e.g. owners only) — an announcements pattern. Private/shared channels change membership scope, not posting rights; retention is data lifecycle.',
    references: [REF_CHANNELS, REF_MESSAGING_POLICIES]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Where do private channel files reside, and what governs access to them?',
    options: opts4(
      'In the private channel\'s own dedicated SharePoint site, accessible only to private channel members',
      'In the parent team\'s SharePoint site, accessible to all team members',
      'In the channel owner\'s OneDrive',
      'In Exchange public folders'
    ),
    correct: ['a'],
    explanation: 'A private channel gets its own dedicated SharePoint site so only that channel\'s members can reach its files. Standard channel files use the team site; chat files use OneDrive.',
    references: [REF_PRIVATE_CHANNELS, REF_TEAMS_STORAGE]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to allow a partner organization\'s Teams users into a single workstream channel using their own identities, while your team\'s other channels stay internal. Which channel type should you use?',
    options: opts4(
      'A shared channel',
      'A private channel',
      'A standard channel',
      'An org-wide team'
    ),
    correct: ['a'],
    explanation: 'A shared channel can include external/other-tenant users (via B2B direct connect) in just that channel, keeping the rest of the team internal. Private channels are limited to the team\'s own members; standard channels and org-wide teams do not provide this.',
    references: [REF_SHARED_CHANNELS, REF_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'A user accidentally deleted an important channel two weeks ago. What should you tell them?',
    options: opts4(
      'The channel can be restored — deleted channels are recoverable for roughly 30 days',
      'It is permanently gone and must be recreated',
      'Only Microsoft Support can recover it',
      'Channels are never recoverable'
    ),
    correct: ['a'],
    explanation: 'Deleted standard channels are recoverable for about 30 days, so a two-week-old deletion can be restored by a team owner. It is not permanently gone, and recovery does not require Microsoft Support.',
    references: [REF_CHANNELS]
  },
  {
    domain: TEAMS, difficulty: 2, type: QType.SINGLE,
    stem: 'Your developers built a custom Teams app. You want it available internally and pinned for the engineering team, but never listed in the public Teams store. What is the correct sequence?',
    options: opts4(
      'Upload the custom app to the org app catalog, allow it via an app permission policy, and pin it via an app setup policy for the engineering team',
      'Submit the app to the public Microsoft Teams store',
      'Email the app package to engineers and ask them to sideload it individually',
      'Add the app as a tab in a single channel only'
    ),
    correct: ['a'],
    explanation: 'Custom apps are uploaded to the org app catalog, allowed by an app permission policy, and pinned by an app setup policy for the target group — internal availability without public listing. Public submission is not wanted; emailing and single-channel tabs do not scale.',
    references: [REF_APP_POLICIES, REF_APP_SETUP]
  },
  {
    domain: TEAMS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Teams app management.',
    options: opts4(
      'App permission policies control which apps are allowed or blocked.',
      'App setup policies control which apps are installed and pinned, and their order.',
      'Custom line-of-business apps can be uploaded to the org app catalog without public store publication.',
      'App setup policies are used to block third-party apps organization-wide.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'App permission policies allow/block apps; app setup policies install/pin apps in order; custom apps can be uploaded to the org catalog. Blocking apps is done with app permission policies / org-wide app settings — NOT app setup policies.',
    references: [REF_APP_PERMISSION, REF_APP_SETUP, REF_APP_POLICIES]
  },

  // ── Manage meetings and calling (12) ──
  {
    domain: MEETINGS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to control whether external (anonymous) participants automatically enter a meeting or wait in the lobby. Which setting governs this?',
    options: opts4(
      'The lobby settings within a Teams meeting policy (who can bypass the lobby)',
      'A calling policy',
      'A messaging policy',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'Meeting policy lobby settings control who can bypass the lobby and who must wait. Calling, messaging, and naming policies do not control meeting lobby behavior.',
    references: [REF_MEETING_POLICIES, REF_MEETING_SETTINGS]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a tenant-wide default that all new meetings have transcription available, while still letting a policy restrict it for some users. Where do you set the tenant default?',
    options: opts4(
      'In org-wide meeting settings / the global meeting policy, then override with user-assigned policies',
      'Only in a team template',
      'In a messaging policy',
      'In a retention policy'
    ),
    correct: ['a'],
    explanation: 'The global (org-wide default) meeting policy and meeting settings establish tenant-wide defaults; user-assigned policies override them for specific users. Team templates, messaging policies, and retention policies do not set meeting defaults.',
    references: [REF_MEETING_SETTINGS, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'A regulated team must always use a meeting configuration that organizers cannot change, including disabling chat and forcing the lobby on. Which feature should you use?',
    options: opts4(
      'A custom meeting template with those settings locked',
      'A messaging policy',
      'An app permission policy',
      'A naming policy'
    ),
    correct: ['a'],
    explanation: 'A custom meeting template can predefine and lock settings (chat, lobby, etc.) so organizers cannot change them. Messaging, app permission, and naming policies do not template/lock meeting settings.',
    references: [REF_MEETING_TEMPLATES, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'An internal training session for ~300 staff needs registration and a clear presenter/attendee separation. Which event type should you choose?',
    options: opts4(
      'A webinar',
      'A town hall for 20,000',
      'A 1:1 call',
      'A persistent group chat'
    ),
    correct: ['a'],
    explanation: 'Webinars provide registration and presenter/attendee roles, fitting a few-hundred-person training. A town hall is for very large broadcasts; 1:1 calls and group chats are not structured events.',
    references: [REF_WEBINARS, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership wants a quarterly all-hands streamed to 15,000 employees with structured production and Q&A, not a regular meeting. Which event type should you recommend?',
    options: opts4(
      'A town hall',
      'A webinar with 1,000 seats',
      'A standard meeting',
      'A channel meeting'
    ),
    correct: ['a'],
    explanation: 'Town halls are designed for large-scale broadcast events (well beyond typical meeting/webinar capacity) with managed production and Q&A. A 1,000-seat webinar, standard meeting, or channel meeting cannot scale to 15,000 appropriately.',
    references: [REF_TOWN_HALL, REF_WEBINARS]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A meeting organizer needs participants to be able to call in from a landline. What must the organizer have, and what do dial-in participants use?',
    options: opts4(
      'The organizer needs Audio Conferencing; participants dial the conferencing bridge number and enter the conference ID',
      'The organizer needs a calling policy; participants use a custom app',
      'The organizer needs Direct Routing; participants use a private channel',
      'No special licensing is ever required for dial-in'
    ),
    correct: ['a'],
    explanation: 'Audio Conferencing gives the organizer\'s meetings a dial-in bridge; participants call the bridge number and enter the conference ID. Calling policies govern calls, Direct Routing is PSTN connectivity for Teams Phone, and dial-in does require Audio Conferencing.',
    references: [REF_AUDIO_CONF, REF_MEETING_POLICIES]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'An auto attendant must answer differently on weekends and public holidays. Which auto attendant capability handles this?',
    options: opts4(
      'Business hours and holiday call-handling configuration in the auto attendant',
      'A call queue overflow rule',
      'A calling policy',
      'A dial plan'
    ),
    correct: ['a'],
    explanation: 'Auto attendants support business-hours schedules and holiday call handling with different greetings/routing. Call queue overflow rules, calling policies, and dial plans do not provide holiday-aware auto attendant routing.',
    references: [REF_AUTO_ATTENDANT, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.SINGLE,
    stem: 'A call queue should send callers to voicemail if no agent answers within 60 seconds. Which call queue setting handles this?',
    options: opts4(
      'The call timeout handling setting (timeout threshold and timeout action)',
      'The auto attendant business hours setting',
      'A messaging policy',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'A call queue\'s timeout handling defines the wait threshold and the action (e.g. send to voicemail) when no agent answers in time. Auto attendant business hours, messaging policies, and meeting templates are unrelated.',
    references: [REF_CALL_QUEUE, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You created an auto attendant and a call queue. Each needs its own service phone number and license. What identity holds those?',
    options: opts4(
      'A separate resource account for each voice application',
      'A single shared user mailbox',
      'A Microsoft 365 group',
      'The Teams admin\'s own account'
    ),
    correct: ['a'],
    explanation: 'Each auto attendant and each call queue is associated with its own resource account that holds the service number and license. Shared mailboxes, M365 groups, and admin accounts are not used for voice applications.',
    references: [REF_RESOURCE_ACCOUNT, REF_CALL_QUEUE]
  },
  {
    domain: MEETINGS, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to allow a group of users to use call forwarding and simultaneous ring, but block call delegation. Which policy controls these calling features?',
    options: opts4(
      'A calling policy assigned to those users',
      'A meeting policy',
      'A messaging policy',
      'An app setup policy'
    ),
    correct: ['a'],
    explanation: 'Calling policies control person-to-person calling features such as call forwarding, simultaneous ring, and delegation. Meeting, messaging, and app setup policies do not govern these calling features.',
    references: [REF_CALLING_POLICIES, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organization will keep its current telecom carrier and on-premises SBC but move users to Teams for calling. Which PSTN connectivity option is required?',
    options: opts4(
      'Direct Routing',
      'A Microsoft Calling Plan',
      'Audio Conferencing',
      'Operator Connect without any SBC'
    ),
    correct: ['a'],
    explanation: 'Direct Routing connects Teams Phone to an existing carrier through a customer-managed (or partner) SBC. A Calling Plan makes Microsoft the carrier; Audio Conferencing is meeting dial-in; Operator Connect uses a participating operator and does not use your own SBC.',
    references: [REF_DIRECT_ROUTING, REF_TEAMS_PHONE]
  },
  {
    domain: MEETINGS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about auto attendants and call queues in Teams Phone.',
    options: opts4(
      'An auto attendant provides menu-based (key-press) call routing.',
      'A call queue distributes inbound calls to a set of agents.',
      'Both an auto attendant and a call queue are associated with a resource account.',
      'Auto attendants and call queues are assigned directly to a standard user license.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Auto attendants are menu routers; call queues distribute calls to agents; both are linked to resource accounts that hold the service number/license. They are NOT assigned to a standard user license — the resource account is the identity.',
    references: [REF_AUTO_ATTENDANT, REF_CALL_QUEUE, REF_RESOURCE_ACCOUNT]
  },

  // ── Monitor, report on, and troubleshoot Teams (11) ──
  {
    domain: MONITOR, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which tool should you use to drill into a single user\'s recent call and meeting quality, session by session?',
    options: opts4(
      'Per-user call analytics in the Teams admin center',
      'The Microsoft 365 usage activity report',
      'Network Planner',
      'Advisor for Teams'
    ),
    correct: ['a'],
    explanation: 'Per-user call analytics provides session-by-session call/meeting quality detail for one user. The usage report shows adoption; Network Planner models bandwidth; Advisor tracks deployment tasks.',
    references: [REF_CALL_ANALYTICS, REF_CQD]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a recurring, organization-wide view of call quality trends to drive infrastructure decisions. Which tool fits, and what improves its reporting?',
    options: opts4(
      'Call Quality Dashboard, improved by uploading a building/subnet (tenant data) mapping',
      'Per-user call analytics, improved by adding more licenses',
      'Network Planner, improved by clearing the client cache',
      'The message center, improved by adding reviewers'
    ),
    correct: ['a'],
    explanation: 'CQD provides org-wide quality trends, and uploading building/subnet tenant-data enriches its reports with friendly location/ISP names. Per-user analytics is single-user; Network Planner models bandwidth; the message center shows announcements.',
    references: [REF_CQD, REF_CALL_ANALYTICS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Leadership wants a monthly trend of Teams adoption — active users, messages, meetings — across the tenant. Which report should you provide?',
    options: opts4(
      'The Microsoft Teams usage activity report (Microsoft 365 admin center)',
      'The Call Quality Dashboard',
      'Per-user call analytics',
      'The Teams device health page'
    ),
    correct: ['a'],
    explanation: 'The Teams usage activity report shows adoption metrics — active users, messages, meetings, calls — over time. CQD and call analytics measure quality; the device health page shows hardware status.',
    references: [REF_USAGE_REPORT, REF_TEAMS_REPORTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user\'s Teams client will not sign in after a recent update. After confirming credentials are correct, what is a sensible next low-impact step?',
    options: opts4(
      'Clear the Teams client cache and restart, then retry sign-in',
      'Delete the user from Microsoft Entra',
      'Reimage the user\'s laptop',
      'Remove the user from all teams'
    ),
    correct: ['a'],
    explanation: 'Clearing the Teams cache and restarting resolves many post-update sign-in problems with minimal impact. Deleting the account, reimaging, or removing the user from teams are disproportionate next steps.',
    references: [REF_TEAMS_CACHE, REF_TROUBLESHOOT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to be notified when guest accounts are added to teams in unusually high volume. Which capability provides this?',
    options: opts4(
      'An alert policy monitoring guest/member-add activity',
      'A meeting policy',
      'A naming policy',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'Alert policies can monitor activities such as adding guests/members and notify admins on unusual volume. Meeting, naming, and retention policies do not raise activity alerts.',
    references: [REF_ALERT_POLICIES, REF_TEAMS_REPORTS]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'A Teams phone in a conference room shows as offline in the admin center. Where do you start troubleshooting?',
    options: opts4(
      'The Devices area of the Teams admin center — check device health, status, and connectivity',
      'The Microsoft 365 usage report',
      'Network Planner',
      'A retention policy'
    ),
    correct: ['a'],
    explanation: 'The Teams admin center Devices area shows device health/status and is the starting point for an offline device. Usage reports, Network Planner, and retention policies do not diagnose device connectivity.',
    references: [REF_CLIENT_HEALTH, REF_TEAMS_DEVICES]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'CQD reports show poor call quality strongly correlated with one specific client build version. What is the appropriate action?',
    options: opts4(
      'Ensure affected users update Teams to a current supported build',
      'Reset all affected users\' passwords',
      'Disable Audio Conferencing tenant-wide',
      'Delete and recreate the affected teams'
    ),
    correct: ['a'],
    explanation: 'Quality correlated with a specific client build points to a client version issue; updating affected users to a current supported build is the fix. Password resets, disabling Audio Conferencing, and recreating teams do not address a client build problem.',
    references: [REF_CQD, REF_TROUBLESHOOT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'You need a report focused specifically on which teams exist and their activity level for a governance cleanup. Which Teams admin center area helps?',
    options: opts4(
      'Teams analytics and reporting (Teams usage / team activity reports)',
      'The Call Quality Dashboard',
      'Network Planner',
      'A meeting template'
    ),
    correct: ['a'],
    explanation: 'Teams analytics and reporting includes team usage/activity reports useful for governance cleanup. CQD measures call quality, Network Planner models bandwidth, and meeting templates are unrelated.',
    references: [REF_TEAMS_REPORTS, REF_USAGE_REPORT]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'The Teams desktop client fails to update on several managed devices. Besides checking client logs, what is a recommended structured resource?',
    options: opts4(
      'Microsoft Learn troubleshooting guidance for Teams installation and update issues',
      'The Call Quality Dashboard',
      'Network Planner',
      'The Teams usage report'
    ),
    correct: ['a'],
    explanation: 'Microsoft\'s troubleshooting documentation for Teams installation/update issues gives structured remediation steps. CQD, Network Planner, and the usage report do not address client update failures.',
    references: [REF_TROUBLESHOOT]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'CQD shows poor quality isolated to calls traversing one branch office\'s internet circuit during business hours. What is the most likely cause to investigate?',
    options: opts4(
      'Network congestion / insufficient bandwidth or QoS on that branch circuit during peak hours',
      'A corrupt Teams installation on every device globally',
      'An expired Microsoft 365 subscription',
      'A misconfigured retention policy'
    ),
    correct: ['a'],
    explanation: 'Poor quality isolated to one circuit during business hours points to peak-hour congestion / bandwidth or missing QoS on that branch link. A global client corruption, an expired subscription, or a retention policy would not produce this localized, time-bound pattern.',
    references: [REF_CQD, REF_QOS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about monitoring, reporting, and troubleshooting Teams.',
    options: opts4(
      'Per-user call analytics targets one user\'s specific calls/meetings.',
      'Call Quality Dashboard is for organization-wide quality trend analysis.',
      'Clearing the Teams client cache resolves many stale-data and post-update issues.',
      'Network Planner is the tool for analyzing the quality of calls that already happened.'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Call analytics = single user; CQD = org-wide trends; clearing the cache fixes many client issues. Network Planner MODELS planned bandwidth before deployment — it does not analyze the quality of calls that already happened (that is CQD / call analytics).',
    references: [REF_CALL_ANALYTICS, REF_CQD, REF_TEAMS_CACHE, REF_NETWORK_PLANNER]
  }
];

const MS700_DOMAINS = [
  { name: ENVIRONMENT, weight: 42 },
  { name: TEAMS, weight: 23 },
  { name: MEETINGS, weight: 18 },
  { name: MONITOR, weight: 17 }
];

const MS700_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-ms-700-p1',
    code: 'MS-700-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 100-minute, 65-question, blueprint-weighted set covering configuring and managing a Teams environment (network, security & compliance, governance, external collaboration, devices), managing teams / channels / chats / apps, managing meetings and calling (Teams Phone), and monitoring, reporting on, and troubleshooting Teams.',
    questions: P1
  },
  {
    slug: 'microsoft-ms-700-p2',
    code: 'MS-700-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 100-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-ms-700-p3',
    code: 'MS-700-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 100-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const MS700_BUNDLE = {
  slug: 'microsoft-ms-700',
  title: 'Microsoft Teams Administrator Associate (MS-700)',
  description: 'Unlimited MS-700 practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering configuring and managing a Microsoft Teams environment (network planning, security & compliance, governance and lifecycle, external and guest collaboration, Teams clients and devices), managing teams / channels / chats / apps, managing meetings and calling including Teams Phone (auto attendants, call queues, phone numbers, policies), and monitoring, reporting on, and troubleshooting Teams. Aligned to the official Managing Microsoft Teams (MS-700) study guide (skills measured as of April 28, 2026).',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the MS-700 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:ms700-seed'` are deleted and re-created.
 */
export async function seedMs700(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security operations, identity, and the role-based certification track including the Microsoft Teams Administrator Associate (MS-700) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security operations, identity, and the role-based certification track including the Microsoft Teams Administrator Associate (MS-700) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of MS700_EXAMS) {
    const title = `Microsoft Teams Administrator Associate (MS-700) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Microsoft MS-700 study guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 100,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: MS700_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:ms700-seed' } });
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
          generatedBy: 'manual:ms700-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: MS700_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: MS700_BUNDLE.slug },
    update: {
      title: MS700_BUNDLE.title,
      description: MS700_BUNDLE.description,
      price: MS700_BUNDLE.price,
      priceVoucher: MS700_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: MS700_BUNDLE.slug,
      title: MS700_BUNDLE.title,
      description: MS700_BUNDLE.description,
      price: MS700_BUNDLE.price,
      priceVoucher: MS700_BUNDLE.priceVoucher,
      published: true
    }
  });

  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-ms-700-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-ms-700-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-ms-700-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-ms-700-p1', tier: 'VOUCHER' as const, position: 4 }
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
