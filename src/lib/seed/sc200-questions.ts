/**
 * SC-200 bundle seed — vendor (Microsoft), three practice-exam variants,
 * bundle, and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:sc200-seed'` and upserts catalog rows.
 *
 * Exported as `seedSc200(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/sc200.ts`) and the protected
 * admin API (`/api/admin/seed-sc200`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn docs
 * and the Microsoft Security Operations Analyst (SC-200) study guide
 * (skills measured as of April 16, 2026 — workflow-axis 3-domain
 * structure replacing the legacy product-axis Defender XDR / Defender
 * for Cloud / Sentinel split):
 *
 *   - Manage a security operations environment     — 40% (26/variant)
 *   - Respond to security incidents                — 40% (26/variant)
 *   - Perform threat hunting                       — 20% (13/variant)
 *
 * These are original practice scenarios. They are NOT real exam items and
 * make no claim of being official or actual SC-200 questions.
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

const MANAGE = 'Manage a security operations environment';
const RESPOND = 'Respond to security incidents';
const HUNT = 'Perform threat hunting';

// ── Defender XDR / portal / incidents ──
const REF_XDR = { label: 'Microsoft Learn — Microsoft Defender XDR overview', url: 'https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender' };
const REF_XDR_PORTAL = { label: 'Microsoft Learn — The Microsoft Defender portal', url: 'https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender-portal' };
const REF_INCIDENTS = { label: 'Microsoft Learn — Incidents and alerts in the Microsoft Defender portal', url: 'https://learn.microsoft.com/en-us/defender-xdr/incidents-overview' };
const REF_XDR_EMAIL_NOTIFY = { label: 'Microsoft Learn — Get incident notifications by email from Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/incidents-overview' };
const REF_XDR_ALERT_TUNE = { label: 'Microsoft Learn — Tune an alert in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/investigate-alerts' };
const REF_XDR_ALERT_SUPPRESS = { label: 'Microsoft Learn — Suppress alerts in Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/manage-alerts' };
const REF_XDR_THREAT_ANALYTICS = { label: 'Microsoft Learn — Threat analytics in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/threat-analytics' };
const REF_AIR = { label: 'Microsoft Learn — Automated investigation and response in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/m365d-autoir' };
const REF_ATTACK_DISRUPT = { label: 'Microsoft Learn — Automatic attack disruption in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/automatic-attack-disruption' };
const REF_CASE_MGMT = { label: 'Microsoft Learn — Manage incidents with case management in the Microsoft Defender portal', url: 'https://learn.microsoft.com/en-us/defender-xdr/manage-incidents' };
const REF_COPILOT_SEC = { label: 'Microsoft Learn — Microsoft Security Copilot in the Microsoft Defender portal', url: 'https://learn.microsoft.com/en-us/copilot/security/microsoft-365-defender-overview' };
const REF_XDR_CORRELATE = { label: 'Microsoft Learn — How Microsoft Defender XDR correlates alerts into incidents', url: 'https://learn.microsoft.com/en-us/defender-xdr/incidents-overview' };

// ── Defender for Endpoint ──
const REF_MDE = { label: 'Microsoft Learn — Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-endpoint' };
const REF_MDE_ONBOARD = { label: 'Microsoft Learn — Onboard devices to Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/onboard-configure' };
const REF_MDE_ADVANCED = { label: 'Microsoft Learn — Configure advanced features in Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/advanced-features' };
const REF_MDE_ASR = { label: 'Microsoft Learn — Attack surface reduction rules overview', url: 'https://learn.microsoft.com/en-us/defender-endpoint/attack-surface-reduction' };
const REF_MDE_ASR_DEPLOY = { label: 'Microsoft Learn — Deploy attack surface reduction rules', url: 'https://learn.microsoft.com/en-us/defender-endpoint/attack-surface-reduction-rules-deployment' };
const REF_MDE_DEVICE_GROUPS = { label: 'Microsoft Learn — Create and manage device groups in Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/machine-groups' };
const REF_MDE_RBAC = { label: 'Microsoft Learn — Use role-based access control to grant fine-grained access to Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/rbac' };
const REF_MDE_AUTO_LEVEL = { label: 'Microsoft Learn — Configure automation levels in Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/configure-automated-investigations-remediation' };
const REF_MDE_AIR = { label: 'Microsoft Learn — Automated investigation and response in Microsoft Defender for Endpoint', url: 'https://learn.microsoft.com/en-us/defender-endpoint/automated-investigations' };
const REF_MDE_TIMELINE = { label: 'Microsoft Learn — Investigate devices in the Microsoft Defender for Endpoint Devices list', url: 'https://learn.microsoft.com/en-us/defender-endpoint/investigate-machines' };
const REF_MDE_LIVE_RESPONSE = { label: 'Microsoft Learn — Investigate entities on devices using live response', url: 'https://learn.microsoft.com/en-us/defender-endpoint/live-response' };
const REF_MDE_INVESTIGATION_PKG = { label: 'Microsoft Learn — Take response actions on a device — collect investigation package', url: 'https://learn.microsoft.com/en-us/defender-endpoint/respond-machine-alerts' };
const REF_MDE_TVM = { label: 'Microsoft Learn — Microsoft Defender Vulnerability Management', url: 'https://learn.microsoft.com/en-us/defender-vulnerability-management/defender-vulnerability-management' };

// ── Defender for Office 365 ──
const REF_MDO = { label: 'Microsoft Learn — Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/mdo-about' };
const REF_MDO_SAFEATT = { label: 'Microsoft Learn — Safe Attachments in Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/safe-attachments-about' };
const REF_MDO_SAFELINK = { label: 'Microsoft Learn — Safe Links in Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/safe-links-about' };
const REF_MDO_ANTIPHISH = { label: 'Microsoft Learn — Anti-phishing policies in Microsoft 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/anti-phishing-policies-about' };
const REF_MDO_QUARANTINE = { label: 'Microsoft Learn — Quarantined email messages in EOP and Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/quarantine-about' };
const REF_MDO_AIR = { label: 'Microsoft Learn — Automated investigation and response (AIR) in Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/air-about' };
const REF_MDO_THREAT_EXPLORER = { label: 'Microsoft Learn — Threat Explorer and real-time detections in Microsoft Defender for Office 365', url: 'https://learn.microsoft.com/en-us/defender-office-365/threat-explorer-real-time-detections-about' };

// ── Defender for Identity ──
const REF_MDI = { label: 'Microsoft Learn — What is Microsoft Defender for Identity?', url: 'https://learn.microsoft.com/en-us/defender-for-identity/what-is' };
const REF_MDI_ALERTS = { label: 'Microsoft Learn — Microsoft Defender for Identity security alerts', url: 'https://learn.microsoft.com/en-us/defender-for-identity/alerts-overview' };
const REF_MDI_LATERAL = { label: 'Microsoft Learn — Lateral movement security alerts in Microsoft Defender for Identity', url: 'https://learn.microsoft.com/en-us/defender-for-identity/lateral-movement-alerts' };

// ── Defender for Cloud Apps ──
const REF_MDCA_POLICIES = { label: 'Microsoft Learn — Control cloud apps with policies', url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/control-cloud-apps-with-policies' };
const REF_MDCA_INVESTIGATE = { label: 'Microsoft Learn — Investigate risky users in Microsoft Defender for Cloud Apps', url: 'https://learn.microsoft.com/en-us/defender-cloud-apps/tutorial-ueba' };

// ── Defender for Cloud (workload protection) ──
const REF_MDC = { label: 'Microsoft Learn — Microsoft Defender for Cloud overview', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-cloud-introduction' };
const REF_MDC_ALERTS = { label: 'Microsoft Learn — Security alerts in Microsoft Defender for Cloud', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/alerts-overview' };
const REF_MDC_SERVERS = { label: 'Microsoft Learn — Microsoft Defender for Servers', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-servers-introduction' };
const REF_MDC_STORAGE = { label: 'Microsoft Learn — Microsoft Defender for Storage', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-storage-introduction' };
const REF_MDC_CONTAINERS = { label: 'Microsoft Learn — Microsoft Defender for Containers', url: 'https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-introduction' };

// ── Entra / Identity Protection ──
const REF_IDPROTECT = { label: 'Microsoft Learn — What is Microsoft Entra ID Protection?', url: 'https://learn.microsoft.com/en-us/entra/id-protection/overview-identity-protection' };
const REF_IDPROTECT_RISK = { label: 'Microsoft Learn — Risk policies in Microsoft Entra ID Protection', url: 'https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies' };
const REF_IDPROTECT_INVESTIGATE = { label: 'Microsoft Learn — Investigate risk in Microsoft Entra ID Protection', url: 'https://learn.microsoft.com/en-us/entra/id-protection/howto-identity-protection-investigate-risk' };

// ── Microsoft Sentinel ──
const REF_SENTINEL = { label: 'Microsoft Learn — What is Microsoft Sentinel?', url: 'https://learn.microsoft.com/en-us/azure/sentinel/overview' };
const REF_SENTINEL_RBAC = { label: 'Microsoft Learn — Roles and permissions in Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/roles' };
const REF_SENTINEL_RETENTION = { label: 'Microsoft Learn — Manage data retention in a Log Analytics workspace', url: 'https://learn.microsoft.com/en-us/azure/sentinel/configure-data-retention-archive' };
const REF_SENTINEL_DATA_LAKE = { label: 'Microsoft Learn — Microsoft Sentinel Data lake overview', url: 'https://learn.microsoft.com/en-us/azure/sentinel/datalake/sentinel-lake-overview' };
const REF_SENTINEL_WORKBOOKS = { label: 'Microsoft Learn — Visualize and monitor your data using Microsoft Sentinel workbooks', url: 'https://learn.microsoft.com/en-us/azure/sentinel/monitor-your-data' };
const REF_SENTINEL_SOC_OPT = { label: 'Microsoft Learn — Microsoft Sentinel SOC optimization', url: 'https://learn.microsoft.com/en-us/azure/sentinel/soc-optimization/soc-optimization-access' };
const REF_SENTINEL_CONNECTORS = { label: 'Microsoft Learn — Find your Microsoft Sentinel data connector', url: 'https://learn.microsoft.com/en-us/azure/sentinel/data-connectors-reference' };
const REF_SENTINEL_AMA = { label: 'Microsoft Learn — Collect Windows Security Events with the Azure Monitor Agent (AMA) connector', url: 'https://learn.microsoft.com/en-us/azure/sentinel/connect-windows-security-events' };
const REF_DCR = { label: 'Microsoft Learn — Data collection rules in Azure Monitor', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-collection-rule-overview' };
const REF_SYSLOG_AMA = { label: 'Microsoft Learn — Collect Syslog and CEF data with the AMA connectors', url: 'https://learn.microsoft.com/en-us/azure/sentinel/connect-cef-syslog-ama' };
const REF_AZ_ACTIVITY = { label: 'Microsoft Learn — Connect Azure activity data to Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/data-connectors/azure-activity' };
const REF_DIAG_SETTINGS = { label: 'Microsoft Learn — Create diagnostic settings to send Azure Monitor platform metrics and logs to different destinations', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/diagnostic-settings' };
const REF_TI = { label: 'Microsoft Learn — Threat intelligence integration in Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/threat-intelligence-integration' };
const REF_TI_UPLOAD = { label: 'Microsoft Learn — Connect threat intelligence to Microsoft Sentinel using the Threat Intelligence Upload API', url: 'https://learn.microsoft.com/en-us/azure/sentinel/connect-threat-intelligence-upload-api' };
const REF_CUSTOM_LOGS = { label: 'Microsoft Learn — Send custom logs to Microsoft Sentinel with the Logs Ingestion API', url: 'https://learn.microsoft.com/en-us/azure/sentinel/create-custom-connector' };
const REF_ANALYTICS_RULES = { label: 'Microsoft Learn — Detect threats with built-in analytics rules in Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/detect-threats-built-in' };
const REF_NRT_RULES = { label: 'Microsoft Learn — Detect threats quickly with near-real-time (NRT) analytics rules in Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/near-real-time-rules' };
const REF_ML_RULES = { label: 'Microsoft Learn — Use machine learning behavioral analytics in Microsoft Sentinel analytics rules', url: 'https://learn.microsoft.com/en-us/azure/sentinel/configure-fusion-rules' };
const REF_MITRE = { label: 'Microsoft Learn — Understand security coverage by the MITRE ATT&CK framework in Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/mitre-coverage' };
const REF_ANOMALIES = { label: 'Microsoft Learn — Work with anomaly detection analytics rules in Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/work-with-anomaly-rules' };
const REF_AUTOMATION_RULES = { label: 'Microsoft Learn — Automate threat response in Microsoft Sentinel with automation rules', url: 'https://learn.microsoft.com/en-us/azure/sentinel/automate-incident-handling-with-automation-rules' };
const REF_PLAYBOOKS = { label: 'Microsoft Learn — Use playbooks with automation rules in Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/automate-responses-with-playbooks' };
const REF_SENTINEL_INCIDENTS = { label: 'Microsoft Learn — Investigate incidents with Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/investigate-cases' };
const REF_HUNT_QUERIES = { label: 'Microsoft Learn — Hunt for threats with Microsoft Sentinel', url: 'https://learn.microsoft.com/en-us/azure/sentinel/hunting' };
const REF_KQL_JOBS = { label: 'Microsoft Learn — Run KQL jobs on Microsoft Sentinel Data lake data', url: 'https://learn.microsoft.com/en-us/azure/sentinel/datalake/kql-jobs' };
const REF_SUMMARY_RULES = { label: 'Microsoft Learn — Aggregate Microsoft Sentinel data with summary rules', url: 'https://learn.microsoft.com/en-us/azure/sentinel/summary-rules' };
const REF_NOTEBOOKS = { label: 'Microsoft Learn — Use Jupyter notebooks to hunt for security threats', url: 'https://learn.microsoft.com/en-us/azure/sentinel/notebooks' };
const REF_SENTINEL_MCP = { label: 'Microsoft Learn — Microsoft Sentinel MCP Server', url: 'https://learn.microsoft.com/en-us/azure/sentinel/sentinel-mcp-server' };
const REF_SENTINEL_GRAPH = { label: 'Microsoft Learn — Hunt with Sentinel Graph in the Microsoft Defender portal', url: 'https://learn.microsoft.com/en-us/azure/sentinel/sentinel-graph' };
const REF_HUNT_GRAPHS = { label: 'Microsoft Learn — Use hunting graphs in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview' };
const REF_BLAST_RADIUS = { label: 'Microsoft Learn — Identify blast radius of a compromised entity using Sentinel Graph', url: 'https://learn.microsoft.com/en-us/azure/sentinel/sentinel-graph' };

// ── Advanced hunting / KQL ──
const REF_HUNTING = { label: 'Microsoft Learn — Advanced hunting in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview' };
const REF_KQL = { label: 'Microsoft Learn — Kusto Query Language (KQL) overview', url: 'https://learn.microsoft.com/en-us/kusto/query/' };
const REF_AH_SCHEMA = { label: 'Microsoft Learn — Understand the advanced hunting schema in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-schema-tables' };
const REF_CUSTOM_DETECT = { label: 'Microsoft Learn — Create and manage custom detection rules in Microsoft Defender XDR', url: 'https://learn.microsoft.com/en-us/defender-xdr/custom-detection-rules' };
const REF_AH_BEST = { label: 'Microsoft Learn — Advanced hunting query best practices', url: 'https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-best-practices' };

// ── Purview ──
const REF_PURVIEW_AUDIT = { label: 'Microsoft Learn — Search the audit log in the Microsoft Purview portal', url: 'https://learn.microsoft.com/en-us/purview/audit-search' };
const REF_PURVIEW_AUDIT_PREMIUM = { label: 'Microsoft Learn — Microsoft Purview Audit (Premium)', url: 'https://learn.microsoft.com/en-us/purview/audit-premium' };
const REF_CONTENT_SEARCH = { label: 'Microsoft Learn — Search for content using the Content search tool in the Microsoft Purview portal', url: 'https://learn.microsoft.com/en-us/purview/ediscovery-search-for-content' };
const REF_PURVIEW_INSIDER = { label: 'Microsoft Learn — Learn about insider risk management', url: 'https://learn.microsoft.com/en-us/purview/insider-risk-management' };
const REF_PURVIEW_DLP = { label: 'Microsoft Learn — Investigate Data Loss Prevention alerts', url: 'https://learn.microsoft.com/en-us/purview/dlp-alerts-get-started' };

// ── Microsoft Graph activity logs ──
const REF_GRAPH_ACTIVITY = { label: 'Microsoft Learn — Microsoft Graph activity logs overview', url: 'https://learn.microsoft.com/en-us/graph/microsoft-graph-activity-logs-overview' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Manage a security operations environment (26) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want SOC analysts to receive an email whenever a NEW incident with severity High is generated in Microsoft Defender XDR. Where do you configure this?',
    options: opts4(
      'Settings > Microsoft Defender XDR > Email notifications > Incidents',
      'Settings > Endpoints > Advanced features',
      'A scheduled analytics rule in Microsoft Sentinel',
      'A Conditional Access policy in Microsoft Entra ID'
    ),
    correct: ['a'],
    explanation: 'Incident email notifications are configured in the Microsoft Defender portal under Settings > Microsoft Defender XDR > Email notifications > Incidents. You can scope by severity and device group. Advanced features control MDE behaviors, not incident notifications. Analytics rules generate alerts, not notification configuration. Conditional Access governs sign-in, not notifications.',
    references: [REF_XDR_EMAIL_NOTIFY, REF_XDR_PORTAL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You have an alert in Microsoft Defender XDR that fires repeatedly from an internal vulnerability scanner. You want to suppress only future alerts that match the same condition without affecting other detections. What should you create?',
    options: opts4(
      'A delete rule in the audit log',
      'An alert tuning rule (suppression rule) scoped to the scanner host and detection',
      'A custom detection rule that excludes the host',
      'A device exclusion in Microsoft Defender Antivirus'
    ),
    correct: ['b'],
    explanation: 'Alert tuning / suppression rules in Defender XDR allow you to suppress matching future alerts based on conditions such as alert title, severity, and entity, without disabling the underlying detection logic. A custom detection rule creates new detections — it does not suppress existing ones. AV exclusions only affect antivirus scanning behavior, not alert generation.',
    references: [REF_XDR_ALERT_TUNE, REF_XDR_ALERT_SUPPRESS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'In the Microsoft Defender portal, where do you find guidance about specific active threat campaigns affecting your tenant, including recommended mitigations and current exposure data?',
    options: opts4(
      'Threat analytics',
      'Secure Score',
      'Attack simulator',
      'Vulnerability management'
    ),
    correct: ['a'],
    explanation: 'Threat analytics provides analyst reports on specific threat actors and campaigns, with your tenant\'s current exposure, impacted assets, and recommended mitigations. Secure Score measures configuration posture. Attack simulator runs phishing simulations. Vulnerability management focuses on CVEs.',
    references: [REF_XDR_THREAT_ANALYTICS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want Microsoft Defender for Endpoint to automatically investigate and remediate suspicious file activity on FULLY managed servers without analyst approval, while keeping a stricter "Semi" automation level on user workstations. What should you configure?',
    options: opts4(
      'A single global automation level across the tenant',
      'A device group with automation level "Full - remediate threats automatically" for the server collection',
      'Attack surface reduction rules in Audit mode for servers',
      'An exclusion list for the server collection'
    ),
    correct: ['b'],
    explanation: 'Automation levels are set per device group in MDE. By placing servers in a dedicated group with "Full - remediate threats automatically" and leaving workstations on "Semi", you get the per-collection behavior described. A single global level cannot vary by collection. ASR rules are unrelated to AIR automation level. Exclusions stop scanning, not automation.',
    references: [REF_MDE_DEVICE_GROUPS, REF_MDE_AUTO_LEVEL, REF_MDE_AIR]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about automatic attack disruption in Microsoft Defender XDR.',
    options: opts4(
      'It can automatically contain a compromised user account by disabling sign-in.',
      'It requires manual analyst approval before taking any action.',
      'It can isolate a compromised device from the network.',
      'It is powered by high-confidence multi-signal XDR correlations such as human-operated ransomware patterns.'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Attack disruption autonomously contains identities (disable account), devices (isolate), and other entities involved in high-confidence active attacks like HumOR, BEC, and AiTM. It does NOT require manual approval — that is its core value. Triggers are XDR-correlated, multi-signal patterns.',
    references: [REF_ATTACK_DISRUPT, REF_AIR]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to allow a SOC analyst to view and respond to incidents in the Microsoft Defender portal but NOT change configuration settings. Which RBAC role is best aligned to least privilege?',
    options: opts4(
      'Global Administrator',
      'Security Administrator',
      'Security Operator',
      'Compliance Administrator'
    ),
    correct: ['c'],
    explanation: 'Security Operator can view security data and take response actions (e.g., resolve incidents, run live response, isolate devices) but cannot modify security configuration. Security Administrator additionally can change configuration — too broad here. Global Admin is excessive. Compliance Administrator does not cover security operations.',
    references: [REF_MDE_RBAC, REF_XDR_PORTAL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable attack surface reduction (ASR) rule "Block executable content from email client and webmail" in Audit mode. What is the expected behavior?',
    options: opts4(
      'The rule blocks the activity and writes an audit event.',
      'The rule does NOT block; it logs the activity that would have been blocked so impact can be evaluated.',
      'The rule requires the device to be in passive mode for Defender Antivirus.',
      'The rule is enforced on Windows Server only.'
    ),
    correct: ['b'],
    explanation: 'Audit mode logs what would have been blocked without actually blocking — used to evaluate impact before enforcing. Block mode is required to actually prevent the action. ASR works on Windows 10/11 and Windows Server, with no passive-mode requirement.',
    references: [REF_MDE_ASR, REF_MDE_ASR_DEPLOY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ingest Windows Security events from a domain controller into Microsoft Sentinel via the Azure Monitor Agent. Which Sentinel-side artifact selects which events get collected and routed to the Log Analytics workspace?',
    options: opts4(
      'A scheduled analytics rule',
      'A Data Collection Rule (DCR)',
      'An automation rule',
      'A summary rule'
    ),
    correct: ['b'],
    explanation: 'The Windows Security Events via AMA connector uses a Data Collection Rule (DCR) to declare which event sets (All, Common, Minimal, or a custom XPath filter) to forward from the agent to the workspace. Analytics rules detect on already-ingested data. Automation rules respond to incidents. Summary rules aggregate data.',
    references: [REF_SENTINEL_AMA, REF_DCR]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You must collect Cisco ASA Common Event Format (CEF) syslog from an on-premises firewall into Microsoft Sentinel. Microsoft recommends using which collection pattern in current deployments?',
    options: opts4(
      'Install the legacy CommonSecurityLog connector with the OMS Linux agent on each firewall',
      'Forward CEF over syslog to a Linux VM running the Azure Monitor Agent with the CEF via AMA connector',
      'Send CEF directly from the firewall to the Log Analytics workspace HTTPS endpoint',
      'Use Azure Event Hubs as the sole supported ingestion path for CEF'
    ),
    correct: ['b'],
    explanation: 'The current Microsoft pattern is CEF/Syslog via AMA: firewalls send syslog/CEF to a Linux forwarder running AMA, which forwards to the workspace. The legacy OMS agent path is being retired. Firewalls cannot post directly to the workspace HTTPS endpoint. Event Hubs is an alternative but not the sole supported path.',
    references: [REF_SYSLOG_AMA, REF_SENTINEL_CONNECTORS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to capture Azure subscription management plane events (resource creates, RBAC role assignments, policy changes) into Microsoft Sentinel. Which data source should you connect?',
    options: opts4(
      'Azure Activity logs',
      'Microsoft Defender for Cloud workload alerts',
      'Microsoft Sentinel UEBA',
      'Microsoft Graph activity logs'
    ),
    correct: ['a'],
    explanation: 'Azure Activity logs record subscription-level management plane operations. The Azure Activity connector streams these to Sentinel. MDC alerts are runtime threat detections. UEBA enriches identities. Microsoft Graph activity logs cover Graph API calls (M365/Entra), not Azure subscription operations.',
    references: [REF_AZ_ACTIVITY, REF_DIAG_SETTINGS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to ingest a curated list of malicious IPs from a third-party feed into Microsoft Sentinel and have them visible in the ThreatIntelligenceIndicator table for use in analytics. Which approach is supported?',
    options: opts4(
      'Push the IPs via the Threat Intelligence Upload API (or TAXII connector)',
      'Add the IPs to a Conditional Access named location',
      'Hardcode the IPs into an analytics rule\'s where clause',
      'Place the IPs into a Defender for Endpoint device exclusion list'
    ),
    correct: ['a'],
    explanation: 'The TI Upload API (and TAXII connector) writes structured indicators into ThreatIntelligenceIndicator, which built-in analytics rules and custom queries can join against. Named locations are sign-in conditions, not TI. Hardcoding loses provenance and history. MDE exclusions stop scanning, not detection.',
    references: [REF_TI, REF_TI_UPLOAD]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You need a custom log table named NetworkAuditEvents_CL populated by an internal HTTP forwarder. Which combination is the supported "logs ingestion" path into a Sentinel workspace?',
    options: opts4(
      'A Data Collection Endpoint (DCE) + a Data Collection Rule (DCR) targeting the custom table via the Logs Ingestion API',
      'A Logic App that writes via the deprecated HTTP Data Collector API only',
      'A direct insert via Kusto Management commands (.ingest into)',
      'A diagnostic setting on the workspace itself'
    ),
    correct: ['a'],
    explanation: 'The current supported pattern is DCE + DCR + Logs Ingestion API to land custom logs in a *_CL table. The HTTP Data Collector API is deprecated. Kusto ingest commands are not exposed for Sentinel workspaces. Diagnostic settings export FROM resources, not into custom tables.',
    references: [REF_CUSTOM_LOGS, REF_DCR]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to run a low-latency detection that fires within a minute of seeing a specific KQL pattern in CommonSecurityLog. Which analytics rule type should you choose?',
    options: opts4(
      'Scheduled (5 min query frequency)',
      'Near-Real-Time (NRT)',
      'Anomaly',
      'Machine learning behavioral analytics (Fusion)'
    ),
    correct: ['b'],
    explanation: 'NRT rules run approximately every minute on newly ingested data with KQL identical to scheduled rules — best when latency matters. Scheduled rules have a 5-min minimum frequency. Anomaly rules and Fusion are ML/correlation, not fixed-latency query rules.',
    references: [REF_NRT_RULES, REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Microsoft Sentinel, which capability lets you visualize how your existing detections map to the MITRE ATT&CK tactics and techniques so you can spot coverage gaps?',
    options: opts4(
      'MITRE ATT&CK page (under Threat management)',
      'SOC optimization page',
      'Hunting bookmarks',
      'Notebook gallery'
    ),
    correct: ['a'],
    explanation: 'The MITRE ATT&CK blade renders a coverage matrix from your enabled and simulated detections. SOC optimization recommends data and detection improvements but is a different surface. Bookmarks save hunting findings. Notebooks are for advanced hunting in Python.',
    references: [REF_MITRE, REF_SENTINEL_SOC_OPT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC analyst wants Sentinel to auto-close any new incident that contains the entity "TestAccount-01" and add a comment "test traffic". Which Sentinel feature accomplishes this without writing Logic Apps?',
    options: opts4(
      'An automation rule with conditions and the "Change status" + "Add comment" actions',
      'A scheduled analytics rule',
      'A workbook with a parameter',
      'A hunting query'
    ),
    correct: ['a'],
    explanation: 'Automation rules can trigger on incident create/update, match entity conditions, and run built-in actions (Change status, Add tags/comments, Assign owner, Run playbook). Analytics rules generate alerts, not response actions. Workbooks visualize. Hunting queries proactively search.',
    references: [REF_AUTOMATION_RULES]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a Sentinel incident on a brute-force alert to trigger a Logic App that disables the targeted user account in Entra ID. What component invokes the Logic App from the incident?',
    options: opts4(
      'A playbook attached via an automation rule run-action on incident create',
      'A scheduled query rule\'s "trigger" property',
      'A diagnostic setting on the workspace',
      'A Sentinel data connector'
    ),
    correct: ['a'],
    explanation: 'Sentinel runs Logic App playbooks via automation rules (recommended) or directly from incidents. The automation rule fires on incident create and invokes the playbook with incident/entity context. Analytics rules detect, but the response action is owned by automation rules + playbooks.',
    references: [REF_PLAYBOOKS, REF_AUTOMATION_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Your SOC needs interactive analytics retention for SecurityEvent at 90 days, plus 2 years of low-cost searchable retention. Which Sentinel data tier should you target for the 2-year window?',
    options: opts4(
      'Analytics tier (continued)',
      'Sentinel Data lake tier',
      'Basic logs tier with default 8-day retention',
      'Archive blob storage outside the workspace'
    ),
    correct: ['b'],
    explanation: 'Sentinel Data lake is the cost-optimized long-term tier with KQL job query support, designed for security data older than the Analytics window. Extending Analytics is expensive. Basic logs is for low-value, low-query telemetry. Archive blob loses KQL access.',
    references: [REF_SENTINEL_DATA_LAKE, REF_SENTINEL_RETENTION]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need a dashboard for SOC leadership showing daily incident counts by severity and MTTR by analyst. The fastest path is to use which Sentinel artifact?',
    options: opts4(
      'A built-in workbook (e.g., Security Operations Efficiency) or a custom workbook',
      'A scheduled analytics rule that emails a CSV',
      'An automation rule that posts to Teams',
      'A custom detection rule in Defender XDR'
    ),
    correct: ['a'],
    explanation: 'Sentinel workbooks render KQL-driven, interactive dashboards. The "Security Operations Efficiency" gallery workbook ships with MTTR and incident metrics out of the box. Analytics/automation rules are detection/response surfaces, not dashboards. Custom detection rules live in Defender XDR for hunting-based detections.',
    references: [REF_SENTINEL_WORKBOOKS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Where in Microsoft Sentinel do you get recommendations such as "Consider enabling the Microsoft Entra ID connector — high coverage value, low cost" tailored to your environment?',
    options: opts4(
      'SOC optimization',
      'Notebooks gallery',
      'Watchlists',
      'Hunting queries page'
    ),
    correct: ['a'],
    explanation: 'SOC optimization analyzes your tenant\'s ingestion, detection, and coverage and surfaces ranked recommendations to improve value or reduce cost. Notebooks, watchlists, and hunting queries are different SOC surfaces.',
    references: [REF_SENTINEL_SOC_OPT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Microsoft Defender for Endpoint advanced features include the "Allow or block file" capability. What does this allow a SOC team to do?',
    options: opts4(
      'Add file hashes to a tenant-wide allow or block list that MDE enforces on managed devices',
      'Quarantine an Exchange email attachment globally',
      'Block a URL in Microsoft Edge using Conditional Access',
      'Tag an Entra ID user as "compromised"'
    ),
    correct: ['a'],
    explanation: 'In MDE Advanced features, enabling "Allow or block file" lets analysts manage a tenant-scoped indicator list (SHA-256) for files. Email attachments are governed by Defender for Office 365. URL blocking via CA is not a feature. Marking identities compromised is an Entra ID Protection flow.',
    references: [REF_MDE_ADVANCED]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Microsoft Defender for Endpoint, what is the function of a "device group" in addition to RBAC scoping?',
    options: opts4(
      'It sets the automation level (Full / Semi / No automation) and ranks rules for matching devices',
      'It enrolls devices into Microsoft Intune automatically',
      'It overrides Conditional Access for the device',
      'It controls TLS encryption for the agent\'s telemetry'
    ),
    correct: ['a'],
    explanation: 'Device groups set automation level and remediation behavior in addition to RBAC scope. Devices match the highest-ranked group whose membership rule applies. Groups do not enroll Intune, override CA, or affect TLS.',
    references: [REF_MDE_DEVICE_GROUPS, REF_MDE_AUTO_LEVEL]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Sentinel scheduled analytics rules.',
    options: opts4(
      'They run on a configurable schedule and look back over a configurable period.',
      'They can create incidents from alerts and group related alerts.',
      'They always use entity mappings derived automatically from KQL output column names.',
      'They support suppression to silence after a hit for a configurable duration.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Scheduled rules have configurable frequency, lookback, incident creation, alert grouping, and suppression. Entity mappings are EXPLICITLY configured per rule (mapping KQL columns to entity types like Account, Host, IP) — not derived automatically.',
    references: [REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A pen-test exercise will generate many spurious "Failed logon" alerts for a week. You want to keep the detection enabled but stop incidents from being created during the exercise. What is the cleanest mechanism?',
    options: opts4(
      'Delete the analytics rule and re-create after the exercise',
      'Use an automation rule that auto-closes new incidents matching the rule and the pen-test hosts during the exercise window',
      'Lower the workspace retention to 1 day',
      'Disable the connector for SecurityEvent'
    ),
    correct: ['b'],
    explanation: 'An automation rule with time-bound conditions can auto-close incidents matching the rule + pen-test hosts. Deleting the rule loses history and risks forgetting to re-enable. Retention changes wipe data. Disabling the connector blinds the SOC to other detections.',
    references: [REF_AUTOMATION_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to keep DeviceLogonEvents data queryable for 18 months at the lowest cost. The Defender XDR retention default is 30 days. What is the recommended path today?',
    options: opts4(
      'Route the table to the Sentinel Data lake tier and query via KQL jobs when needed',
      'Export to a Storage Account JSON blob and re-import to KQL each time you need a query',
      'Increase the workspace Analytics retention to 18 months for that single table',
      'Forward every event individually into an Event Hub'
    ),
    correct: ['a'],
    explanation: 'Routing the table to the Sentinel Data lake keeps it queryable via KQL jobs at a fraction of Analytics-tier cost, suited to 18-month security retention. Blob export breaks KQL. Per-table 18-month Analytics retention is supported but is the most expensive option.',
    references: [REF_SENTINEL_DATA_LAKE, REF_SENTINEL_RETENTION]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable a built-in Microsoft Sentinel connector for "Microsoft Entra ID". Which logs does it ingest by default once you choose the included data types?',
    options: opts4(
      'Sign-in logs and audit logs (and optionally provisioning, risky users, and risk detections)',
      'Only the Microsoft Graph activity logs',
      'Only Azure Activity logs',
      'Defender for Identity sensor traffic'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Entra ID connector ingests SigninLogs and AuditLogs (and additional optional streams like ProvisioningLogs, RiskyUsers, IdentityRiskEvents). Graph activity logs and Azure Activity are separate connectors; MDI traffic is captured by the MDI sensor.',
    references: [REF_SENTINEL_CONNECTORS, REF_GRAPH_ACTIVITY]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a custom detection rule in Microsoft Defender XDR that fires when a specific Advanced Hunting KQL query returns rows. Which is required for the rule to take device-level remediation actions automatically?',
    options: opts4(
      'The query must project an entity column that resolves to DeviceId (and similar identifiers for User/File etc.)',
      'The query must run on a 24-hour frequency only',
      'The query must include a where clause filtering on Severity == "High"',
      'The query must be created via Logic Apps'
    ),
    correct: ['a'],
    explanation: 'Custom detection rules require impacted entities (DeviceId, AccountObjectId, FileSha1, etc.) projected from the KQL query so the rule can target response actions. Frequency, severity filters, and Logic Apps are not requirements.',
    references: [REF_CUSTOM_DETECT, REF_HUNTING]
  },

  // ── Respond to security incidents (26) ──
  {
    domain: RESPOND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A user reports a suspicious email. In the Microsoft Defender portal, which feature lets a SOC analyst search recent emails by sender/subject/URL across the tenant and submit them to Microsoft for analysis?',
    options: opts4(
      'Threat Explorer (Real-time detections)',
      'Attack simulator',
      'Endpoint device timeline',
      'Insider risk activity explorer'
    ),
    correct: ['a'],
    explanation: 'Threat Explorer (and Real-time detections) is the MDO investigation surface for email, supporting search, triage, take-action, and submission to Microsoft. Attack simulator runs phishing exercises. Device timeline is MDE. Insider risk activity explorer is Purview.',
    references: [REF_MDO_THREAT_EXPLORER, REF_MDO]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A user clicks a link in a quarantined message and asks for release. Which Microsoft Defender for Office 365 action grants the user the message AND tells Microsoft the original verdict was wrong?',
    options: opts4(
      'Release and report (Submit as not junk / clean)',
      'Preview only',
      'Add sender to the user\'s Outlook block list',
      'Delete from quarantine'
    ),
    correct: ['a'],
    explanation: 'Release and report (Submit as clean) both delivers the message and tells Microsoft the verdict was wrong, improving filter accuracy. Preview does not release. Adding to a block list reinforces a bad signal. Delete loses the artifact.',
    references: [REF_MDO_QUARANTINE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'Defender for Office 365 Safe Attachments blocked a malicious PDF. The user insists on a one-time exception to view the file. What is the supported way to inspect it without disabling Safe Attachments tenant-wide?',
    options: opts4(
      'Open the email via the Threat Explorer "preview header" only — never the attachment',
      'Use Dynamic Delivery to view the body, then detonate or retrieve the file in a sandbox/IR system rather than disabling policy',
      'Disable Safe Attachments globally for 10 minutes',
      'Forward the email to a personal account to evaluate'
    ),
    correct: ['b'],
    explanation: 'Dynamic Delivery delivers the body while the attachment is still being scanned. For controlled inspection of a blocked file, use sandbox detonation/IR tooling. Disabling Safe Attachments globally puts the tenant at risk. Forwarding to a personal account is a policy violation.',
    references: [REF_MDO_SAFEATT]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You\'re responding to a Defender for Cloud Apps alert "Activity from a Tor exit node" for user adele@contoso.com. Which immediate action is BEST aligned to a contain-first response?',
    options: opts4(
      'Mark the alert as benign and notify the user',
      'Suspend the user and require sign-in (so existing tokens are revoked and re-auth is forced)',
      'Add the Tor IP to the Defender for Cloud Apps allow list',
      'Open an eDiscovery case'
    ),
    correct: ['b'],
    explanation: 'Containment requires invalidating active sessions and forcing re-authentication. MDCA can suspend the user and require sign-in (revoking refresh tokens). Marking benign without verification is risky. Allow-listing Tor weakens detection. eDiscovery is not an immediate containment.',
    references: [REF_MDCA_POLICIES, REF_MDCA_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You investigate an Entra ID Protection "User at risk: High" alert. Which built-in remediation flow forces the user to securely reset their own password after MFA verification, then dismisses the risk if successful?',
    options: opts4(
      'Confirm user compromised',
      'Reset password via self-service password reset (SSPR) — automated remediation',
      'Block sign-in indefinitely',
      'Delete the user'
    ),
    correct: ['b'],
    explanation: 'The User Risk Conditional Access policy that requires password change leverages SSPR — after MFA, the user resets their password and the risk is automatically remediated. Confirm compromised feeds learning but doesn\'t reset. Permanent block harms productivity. Delete loses identity.',
    references: [REF_IDPROTECT, REF_IDPROTECT_RISK, REF_IDPROTECT_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Identity alert "Suspected DCSync attack" fires. Which response action targets the immediate replication-rights abuse?',
    options: opts4(
      'Block the user\'s mailbox in Exchange Online',
      'Disable the compromised on-prem account in Active Directory and revoke Replicating Directory Changes / Replicating Directory Changes All rights',
      'Add the user to the Domain Admins group temporarily for inspection',
      'Quarantine all emails to the user'
    ),
    correct: ['b'],
    explanation: 'DCSync exploits Replicating Directory Changes rights to dump hashes. Containment means disabling the account and removing those replication rights from the principal that abused them. Mailbox blocks/quarantine target email. Granting Domain Admin worsens the breach.',
    references: [REF_MDI, REF_MDI_ALERTS, REF_MDI_LATERAL]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Cloud alert "Suspicious shell command on Linux VM" fires. From the Defender portal, what is the recommended immediate response on the VM?',
    options: opts4(
      'Trigger the workflow automation to send a Teams notification only',
      'Use Defender for Servers to isolate the VM (network segmentation) and collect investigation evidence',
      'Move the VM to a different subscription',
      'Re-deploy the VM from the Marketplace image immediately'
    ),
    correct: ['b'],
    explanation: 'Isolate (segment) the VM to contain lateral movement while you collect investigation evidence, then remediate. Notifications alone don\'t contain. Moving subscriptions doesn\'t isolate. Re-deploying without preserving evidence loses forensic data.',
    references: [REF_MDC, REF_MDC_ALERTS, REF_MDC_SERVERS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'Defender for Cloud fires a "Possible data exfiltration" alert on an Azure Storage account. Which Defender plan must be enabled for these storage-tier alerts?',
    options: opts4(
      'Defender for Storage',
      'Defender for App Service',
      'Defender for Key Vault',
      'Defender for SQL'
    ),
    correct: ['a'],
    explanation: 'Defender for Storage analyzes data plane signals and emits alerts on suspicious access, exfiltration, and malware uploads. The other plans cover different resource types.',
    references: [REF_MDC_STORAGE, REF_MDC]
  },
  {
    domain: RESPOND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL response actions you can take on a device directly from the Defender portal device page (Microsoft Defender for Endpoint).',
    options: opts4(
      'Isolate device',
      'Run antivirus scan',
      'Collect investigation package',
      'Migrate the device\'s Active Directory object to a new OU'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Isolate, AV scan, restrict app execution, collect investigation package, and initiate live response are device-level response actions in MDE. Active Directory OU moves are not a Defender action.',
    references: [REF_MDE_TIMELINE, REF_MDE_INVESTIGATION_PKG, REF_MDE_LIVE_RESPONSE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'During live response on a Windows device in Microsoft Defender for Endpoint, which command lets you upload a PowerShell script from the live response library and execute it on the target device?',
    options: opts4(
      'run <scriptname>',
      'getfile <path>',
      'remediate file <hash>',
      'isolate'
    ),
    correct: ['a'],
    explanation: '`run` invokes a script from the live response library on the device. `getfile` retrieves a file. `remediate` targets known threats. `isolate` is a separate response action (not a live response command per se).',
    references: [REF_MDE_LIVE_RESPONSE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC analyst needs the autoruns, scheduled tasks, prefetch, and event logs from a suspect Windows endpoint. Which MDE response action is purpose-built for this collection?',
    options: opts4(
      'Initiate antivirus scan',
      'Collect investigation package',
      'Run a Live Response "kill" command',
      'Restrict app execution'
    ),
    correct: ['b'],
    explanation: 'Collect investigation package gathers a bundle of forensic artifacts (autoruns, prefetch, event logs, scheduled tasks, processes, services, installed programs) for offline review. AV scan, Kill, and Restrict app execution don\'t produce a package.',
    references: [REF_MDE_INVESTIGATION_PKG]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'In Microsoft Defender XDR, multiple related alerts across email, identity, and endpoint converge under one incident representing the same kill chain. What primarily groups these alerts together?',
    options: opts4(
      'A manually assigned incident ID per alert',
      'Defender XDR\'s automated correlation that links alerts sharing entities and timeline patterns',
      'A scheduled analytics rule that runs every hour',
      'A SOC analyst\'s tag on each alert'
    ),
    correct: ['b'],
    explanation: 'Defender XDR automatically correlates alerts that share entities (user, device, file, IP, mailbox) and temporal/causal patterns into a single incident, accelerating cross-workload triage. Manual IDs and tags aren\'t the correlation engine.',
    references: [REF_INCIDENTS, REF_XDR_CORRELATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Your team has Microsoft Security Copilot integrated in the Defender portal. Which scenario does the embedded experience BEST accelerate?',
    options: opts4(
      'Plain-English summarization of an incident with suggested next steps and KQL snippets',
      'Automatic patching of vulnerable Linux kernels',
      'Migration of an on-prem Active Directory forest',
      'Issuing X.509 certificates for IoT devices'
    ),
    correct: ['a'],
    explanation: 'Copilot in Defender summarizes incidents, drafts response plans, generates KQL, and explains scripts. Patching, AD migration, and certificate issuance are out of scope.',
    references: [REF_COPILOT_SEC]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to give incidents organizational context (e.g., a numbered case for legal hold and analyst assignment) without leaving the Defender portal. Which feature should you use?',
    options: opts4(
      'Case management for incidents',
      'Microsoft Sentinel watchlists',
      'Insider risk management',
      'Defender for Cloud Apps governance'
    ),
    correct: ['a'],
    explanation: 'Case management lets SOC teams group incidents into a tracked case with status, assignees, and comments. Watchlists are reference tables for KQL. Insider risk is Purview. MDCA governance is third-party app control.',
    references: [REF_CASE_MGMT]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Purview DLP policy fires "High severity — credit card numbers shared externally". From the SecOps perspective, the FIRST investigative step is to confirm what?',
    options: opts4(
      'Whether the policy match is a true positive (real CC data) vs a sensitive information type misclassification',
      'Whether the user is in the Global Administrator group',
      'Whether MFA is enabled for the user',
      'Whether the file is encrypted with BitLocker'
    ),
    correct: ['a'],
    explanation: 'DLP triage starts with verifying the SIT match — inspecting the matched text/file to confirm real CC data vs a false-positive SIT. Group membership and MFA matter later. BitLocker doesn\'t affect content inspection.',
    references: [REF_PURVIEW_DLP]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to investigate which mailbox folders a recently-departed user opened in the last 90 days. Which Microsoft Purview tool is best suited?',
    options: opts4(
      'Audit search (look for MailItemsAccessed)',
      'Content Search query for the user\'s email',
      'Insider risk policy summary',
      'Data lifecycle management'
    ),
    correct: ['a'],
    explanation: 'Purview Audit logs include MailItemsAccessed events (available with Audit Premium / E5 features) that show folder/message access. Content Search returns matching items, not access events. Insider risk and DLM are different.',
    references: [REF_PURVIEW_AUDIT, REF_PURVIEW_AUDIT_PREMIUM]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A legal team requests an export of all emails containing a specific phrase from a specific custodian. Which Purview tool is appropriate?',
    options: opts4(
      'Content Search (or eDiscovery)',
      'Microsoft Defender XDR custom detection',
      'Defender for Cloud Apps activity log',
      'Sentinel watchlist'
    ),
    correct: ['a'],
    explanation: 'Purview Content Search (or eDiscovery for case-bound holds + review) is the supported path for keyword + custodian export. The other tools have no email-export semantics.',
    references: [REF_CONTENT_SEARCH, REF_PURVIEW_AUDIT]
  },
  {
    domain: RESPOND, difficulty: 3, type: QType.SINGLE,
    stem: 'Microsoft Graph activity logs reveal a spike in Microsoft Graph API calls from a service principal you did not expect. The next analyst step is to:',
    options: opts4(
      'Disable the service principal in Entra ID and rotate any associated client secret/certificate',
      'Increase logging retention on the workspace',
      'Disable Conditional Access for the tenant',
      'Email the user listed in the Created By field'
    ),
    correct: ['a'],
    explanation: 'For a suspicious SP, contain by disabling the SP and rotating its credentials, then investigate. Increasing retention doesn\'t stop abuse. Disabling CA opens broader risk. Emailing the creator is part of context-gathering, not containment.',
    references: [REF_GRAPH_ACTIVITY, REF_IDPROTECT]
  },
  {
    domain: RESPOND, difficulty: 3, type: QType.MULTI,
    stem: 'A multi-stage incident in Defender XDR shows: a phishing email delivered, the user clicked, MDE saw a beacon, and an Entra sign-in came from an impossible-travel location. Select ALL true statements about the response.',
    options: opts4(
      'You can isolate the device, disable the account, and purge the email all from inside the incident timeline.',
      'Each workload must be opened in a separate console to take action.',
      'Confirming "Compromised user" in Entra ID Protection improves future risk scoring.',
      'Automatic attack disruption may already have contained part of the incident before analyst review.'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Defender XDR consolidates response actions inside one incident across MDE/Entra/MDO. Confirming compromise teaches IDP\'s model. Attack disruption can pre-contain identities/devices. The "separate consoles" claim is false in modern Defender XDR.',
    references: [REF_INCIDENTS, REF_ATTACK_DISRUPT, REF_IDPROTECT_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'Automated investigation in MDE has reached the "Pending — requires approval" state. What does this mean?',
    options: opts4(
      'The investigation has finished and made changes silently',
      'AIR has proposed remediation actions that require analyst approval because the device group is set to "Semi" automation',
      'AIR is blocked by an antivirus exclusion',
      'AIR can run only after the device reboots'
    ),
    correct: ['b'],
    explanation: '"Semi" automation surfaces proposed remediations for analyst review; analyst approves/rejects each. "Full" auto-remediates. "No automation" prevents AIR entirely. Pending is not blocked by AV exclusions or reboots.',
    references: [REF_MDE_AIR, REF_MDE_AUTO_LEVEL]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During incident response, you mark a Defender XDR alert as a "True positive — security testing". What downstream effect does this have?',
    options: opts4(
      'It is included as training feedback for Defender\'s detection telemetry (and reflected in case/incident metrics)',
      'It deletes all matching events from the workspace',
      'It silently disables the analytics rule that produced the alert',
      'It opens a support ticket with Microsoft'
    ),
    correct: ['a'],
    explanation: 'Classification + determination feed Microsoft\'s detection improvement and your own efficiency metrics. It does not delete data, disable rules, or open support tickets.',
    references: [REF_INCIDENTS, REF_XDR_PORTAL]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to remove a malicious email from every recipient mailbox in the tenant after detection. The supported approach from MDO is to:',
    options: opts4(
      'Use Threat Explorer take-action to "Soft delete" or "Hard delete" the message across all mailboxes',
      'Run an eDiscovery export only',
      'Ask each user to delete it from their own mailbox',
      'Disable Exchange Online for one minute'
    ),
    correct: ['a'],
    explanation: 'Take-action in Threat Explorer / Action center can soft- or hard-delete malicious mails across all recipients tenant-wide. eDiscovery exports; it does not purge by default. User-driven deletion is unreliable. Disabling EXO is not a response action.',
    references: [REF_MDO_THREAT_EXPLORER, REF_MDO_AIR]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel incident is created with an entity "Account" that maps to an Entra ID user. From the incident, you want to query all sign-ins by that user in the past 24 hours. The fastest in-portal path is to:',
    options: opts4(
      'Open the entity page and view the entity timeline / related sign-ins',
      'Manually copy the username and write KQL from scratch',
      'Open an eDiscovery case',
      'Run a Logic App with a delay'
    ),
    correct: ['a'],
    explanation: 'The Entity page surfaces pre-built insights (sign-ins, alerts, activities) for the matched entity. Manual KQL is slower. eDiscovery doesn\'t do sign-in analytics. Logic Apps automate response, not on-demand entity views.',
    references: [REF_SENTINEL_INCIDENTS, REF_SENTINEL_GRAPH]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Cloud Apps anomaly detection alert fires for "Mass download" by user ada@contoso.com from OneDrive. Which automated MDCA governance action immediately reduces blast radius without permanently locking the account?',
    options: opts4(
      'Apply session control to require step-up authentication on next access',
      'Confirm user compromised in MDCA → Suspend user (Entra ID) and require sign-in',
      'Delete the user\'s OneDrive permanently',
      'Convert OneDrive to read-only globally'
    ),
    correct: ['b'],
    explanation: 'Confirming compromised propagates to Entra ID and can suspend the user, revoking tokens — strongest containment without destructive change. Session step-up alone doesn\'t reset existing sessions. Permanent delete and tenant-wide read-only are excessive.',
    references: [REF_MDCA_POLICIES, REF_MDCA_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 3, type: QType.SINGLE,
    stem: 'In Defender for Endpoint, an "Evidence and Response" tab on an incident lists entities (files, processes, IPs, URLs). What does selecting "Approve" on a proposed file remediation action do?',
    options: opts4(
      'Approves the AIR proposal so MDE quarantines/removes the file on the impacted devices',
      'Whitelists the file across the tenant',
      'Sends the file to VirusTotal',
      'Closes the incident automatically'
    ),
    correct: ['a'],
    explanation: 'In Semi automation, AIR surfaces proposed actions; Approve executes them (quarantine/remove) on impacted devices. It does not whitelist, post to VirusTotal, or auto-close the incident.',
    references: [REF_MDE_AIR, REF_AIR]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Endpoint device timeline shows back-to-back events: a suspicious file write to %TEMP%, a parent process of winword.exe, and outbound network to an unfamiliar domain. From the timeline view, the FIRST containment step on the device is to:',
    options: opts4(
      'Isolate the device (preserving forensic state) so it cannot talk to the C2 while you investigate',
      'Reset the user\'s Active Directory password',
      'Delete the temp file via Windows Explorer',
      'Reboot the device to flush memory'
    ),
    correct: ['a'],
    explanation: 'Isolate device cuts the device off from the network (except management traffic) without losing forensic state. Password reset doesn\'t stop an on-device payload. Manual file deletion loses evidence and may miss artifacts. Reboot can lose memory-resident IOCs.',
    references: [REF_MDE_TIMELINE, REF_MDE_INVESTIGATION_PKG]
  },

  // ── Perform threat hunting (13) ──
  {
    domain: HUNT, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In Microsoft Defender XDR Advanced Hunting, which KQL table contains process creation events on onboarded endpoints, including the parent and initiating process information?',
    options: opts4(
      'DeviceProcessEvents',
      'DeviceFileEvents',
      'DeviceLogonEvents',
      'IdentityLogonEvents'
    ),
    correct: ['a'],
    explanation: 'DeviceProcessEvents records process creation with InitiatingProcessFileName/Path/CommandLine and the resulting FileName, etc. FileEvents covers file CRUD; LogonEvents covers device logons; IdentityLogonEvents covers AD/Entra logons.',
    references: [REF_AH_SCHEMA, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to find Microsoft Defender XDR email events where the verdict was "Phish" and the user clicked the link. Which two tables would you typically join?',
    options: opts4(
      'EmailEvents joined to UrlClickEvents on NetworkMessageId / Url',
      'DeviceFileEvents joined to SecurityIncident',
      'DeviceLogonEvents joined to AADSignInEventsBeta',
      'CloudAppEvents joined to DeviceImageLoadEvents'
    ),
    correct: ['a'],
    explanation: 'EmailEvents records mail verdict; UrlClickEvents records user/safelink clicks. Joining on NetworkMessageId and/or URL surfaces clicked phish. The other combinations are unrelated to email-click investigations.',
    references: [REF_AH_SCHEMA, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You see this KQL: `DeviceProcessEvents | where Timestamp > ago(1h) | summarize count() by FileName | top 10 by count_`. What does it return?',
    options: opts4(
      'The top 10 process names by count of process-creation events in the last hour',
      'The top 10 file paths modified in the last hour',
      'The top 10 logon failures in the last hour',
      'The top 10 inbound network connections in the last hour'
    ),
    correct: ['a'],
    explanation: '`summarize count() by FileName` aggregates process events by image name; `top 10 by count_` returns the most frequent. The other choices reference unrelated tables/fields.',
    references: [REF_KQL, REF_AH_SCHEMA]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to convert an Advanced Hunting query into a recurring detection that opens a Defender XDR alert. The most direct path is to:',
    options: opts4(
      'Save it as a custom detection rule and configure entities, frequency, and impacted actions',
      'Export the results to CSV and email them daily',
      'Create a Conditional Access policy that references the query',
      'Add it as a Sentinel workbook tile'
    ),
    correct: ['a'],
    explanation: 'Custom detection rules in Defender XDR turn an AH query into a recurring detection that emits alerts and supports remediation. CSV email, CA, and workbooks are not detection mechanisms.',
    references: [REF_CUSTOM_DETECT, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A KQL query times out frequently. Which optimization is consistent with Advanced Hunting best practices?',
    options: opts4(
      'Filter early on Timestamp and indexed columns; project only the columns you need before joins',
      'Always use `summarize *` to materialize everything before filtering',
      'Replace `join kind=inner` with full outer joins for performance',
      'Avoid `where` clauses and prefer client-side filtering on the results'
    ),
    correct: ['a'],
    explanation: 'Early filtering (Timestamp, indexed columns) and projection reduce data scanned before expensive joins. The other options would each make the query slower or wrong.',
    references: [REF_AH_BEST, REF_KQL]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'In Microsoft Sentinel, which feature lets you proactively store the output of an investigation snippet for future reference and link it to entities/incidents?',
    options: opts4(
      'Hunting bookmarks',
      'Watchlists',
      'Analytics rules',
      'SOC optimization'
    ),
    correct: ['a'],
    explanation: 'Bookmarks save query results during hunting and can be promoted into incidents and linked to entities. Watchlists are reference data. Analytics rules detect. SOC optimization recommends improvements.',
    references: [REF_HUNT_QUERIES]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to identify the blast radius (everything a compromised identity touched) across email, identity, endpoint, and SaaS. Which capability is purpose-built for this?',
    options: opts4(
      'Sentinel Graph (hunting graphs) in the Microsoft Defender portal',
      'A Logic Apps run history search',
      'A Conditional Access What-if tool',
      'Office Message Encryption'
    ),
    correct: ['a'],
    explanation: 'Sentinel Graph in the Defender portal traverses entity relationships across XDR sources to visualize blast radius. Logic Apps history is run telemetry. CA What-if is policy simulation. OME is mail encryption.',
    references: [REF_SENTINEL_GRAPH, REF_HUNT_GRAPHS, REF_BLAST_RADIUS]
  },
  {
    domain: HUNT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to hunt across 12 months of SigninLogs while keeping interactive cost down. Which feature lets you run KQL across data already routed to the long-term tier?',
    options: opts4(
      'KQL jobs on Sentinel Data lake data',
      'Workspace Cross-region search',
      'Workspace function `materialize()` on archive',
      'A Logic App with a 30-day retry'
    ),
    correct: ['a'],
    explanation: 'KQL jobs run async on Data lake-tiered data and write results back to the workspace for analyst review. Materialize is an in-memory KQL function — unrelated. Logic Apps retries are orchestration.',
    references: [REF_KQL_JOBS, REF_SENTINEL_DATA_LAKE]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to maintain a per-day aggregated table of unique sign-ins per user as a low-cost surface for hunting and dashboards. Which Sentinel feature would you use?',
    options: opts4(
      'A Summary rule (aggregating SigninLogs to a custom summary table)',
      'A scheduled analytics rule with high severity',
      'A retention exception',
      'A Conditional Access report-only policy'
    ),
    correct: ['a'],
    explanation: 'Summary rules produce a small aggregated table from high-volume sources, ideal for dashboards and look-back hunting at low cost. Analytics rules generate alerts, not aggregates. The other options are unrelated.',
    references: [REF_SUMMARY_RULES]
  },
  {
    domain: HUNT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A threat hunter wants to use Jupyter notebooks and Python with MSTICPy to enrich and analyze Sentinel data. From the Defender / Sentinel portal, what is the supported entry point?',
    options: opts4(
      'Sentinel "Notebooks" pane (Azure ML workspace–backed) with MSTICPy install',
      'Sentinel "Workbooks" page only',
      'Defender XDR Advanced Hunting console',
      'Power BI Desktop'
    ),
    correct: ['a'],
    explanation: 'Sentinel\'s Notebooks experience integrates with an Azure ML workspace and exposes MSTICPy for security data science. Workbooks don\'t run Python. Advanced Hunting runs KQL. Power BI is BI reporting.',
    references: [REF_NOTEBOOKS]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to connect Microsoft Sentinel data to an MCP-aware AI tool for advanced agentic hunting. Which Microsoft-hosted endpoint is intended for this?',
    options: opts4(
      'Microsoft Sentinel MCP Server',
      'Defender for Endpoint Streaming API',
      'Microsoft Graph Explorer',
      'Azure Resource Graph Explorer'
    ),
    correct: ['a'],
    explanation: 'The Sentinel MCP Server exposes Sentinel data and operations to Model Context Protocol clients (Notebooks, AI agents). The Streaming API is for SIEM forwarding. Graph Explorer is for Microsoft Graph. Resource Graph is for Azure resource inventory queries.',
    references: [REF_SENTINEL_MCP, REF_NOTEBOOKS]
  },
  {
    domain: HUNT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Threat analytics in Microsoft Defender XDR.',
    options: opts4(
      'It maps your tenant\'s exposure to specific threat actors and campaigns.',
      'It provides recommended mitigations and links to relevant hunting queries.',
      'It only works for tenants with Microsoft Sentinel enabled.',
      'It can highlight devices and identities currently impacted by an active campaign.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Threat analytics is a Defender XDR feature (not Sentinel-only): exposure mapping, mitigations, hunting queries, and live impact for active campaigns. Sentinel is not a prerequisite.',
    references: [REF_XDR_THREAT_ANALYTICS, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'A hunter writes `EmailEvents | where SenderFromAddress endswith "@example.com" | join kind=inner (DeviceProcessEvents | where ProcessCommandLine has "rundll32") on $left.RecipientEmailAddress == $right.AccountUpn`. What pattern is being hunted?',
    options: opts4(
      'Recipients of email from @example.com who subsequently executed rundll32 on their device',
      'External users sending phishing to internal accounts',
      'Devices that uninstalled rundll32',
      'Email addresses on a corporate watchlist'
    ),
    correct: ['a'],
    explanation: 'The join correlates email recipients (RecipientEmailAddress) with device events for that same identity (AccountUpn) where the command line includes rundll32 — a phishing-then-LOLBin pattern.',
    references: [REF_HUNTING, REF_KQL, REF_AH_SCHEMA]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Manage a security operations environment (26) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to give a partner SOC team access to ONLY a single device group in Microsoft Defender for Endpoint, without seeing the rest of the tenant. Which RBAC mechanism enforces this?',
    options: opts4(
      'Assign the partner team a role mapped to that single device group',
      'Create a Conditional Access policy excluding the other device groups',
      'Use Privileged Identity Management eligible assignment for Global Admin',
      'Make the partner team Co-administrators of the Azure subscription'
    ),
    correct: ['a'],
    explanation: 'MDE roles are bound to device-group scopes; the role grants permissions only on the assigned groups. CA governs sign-in. PIM is eligibility for higher privilege, not scoping. Azure Co-admin is unrelated.',
    references: [REF_MDE_RBAC, REF_MDE_DEVICE_GROUPS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to ingest threat intelligence into Microsoft Sentinel from a third-party TAXII server. What pair must you provide?',
    options: opts4(
      'TAXII server API root and collection ID, plus credentials if required',
      'Storage account SAS URL and container name',
      'Log Analytics workspace ID and key only',
      'Service principal client ID, secret, and tenant ID for the TAXII server'
    ),
    correct: ['a'],
    explanation: 'The TAXII connector polls a given API root + collection ID (optionally with username/password). Storage SAS, workspace ID/key, and SP credentials are not how TAXII auth is configured.',
    references: [REF_TI, REF_SENTINEL_CONNECTORS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel content hub solution offers data connectors, analytics rules, workbooks, hunting queries, and playbooks for a product. What is the benefit of installing a content hub solution vs creating each artifact manually?',
    options: opts4(
      'Solutions bundle and version vetted SOC content for a product so you can deploy and update as a unit',
      'Solutions disable Sentinel\'s free trial',
      'Solutions allow Sentinel to bypass Azure RBAC',
      'Solutions delete existing analytics rules in the workspace'
    ),
    correct: ['a'],
    explanation: 'Content hub solutions package and version Microsoft- and partner-published content for a product. Other claims are false: solutions don\'t bypass RBAC, disable trials, or delete existing content.',
    references: [REF_SENTINEL_CONNECTORS, REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want every Sentinel analyst to be able to view incidents AND comment on them but NOT delete incidents or edit analytics rules. The least-privilege built-in role is:',
    options: opts4(
      'Microsoft Sentinel Reader',
      'Microsoft Sentinel Responder',
      'Microsoft Sentinel Contributor',
      'Owner'
    ),
    correct: ['b'],
    explanation: 'Microsoft Sentinel Responder allows viewing data, managing incidents (assign, change status, comment), and running playbooks. Reader is view-only. Contributor adds creating/editing rules and content. Owner is full control.',
    references: [REF_SENTINEL_RBAC]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Microsoft Defender for Endpoint indicator type lets you block a specific file from running across all onboarded devices?',
    options: opts4(
      'File hash indicator (SHA-256) with action "Block and remediate"',
      'IP address indicator with action "Allow"',
      'Certificate indicator with action "Audit"',
      'URL/domain indicator with action "Warn"'
    ),
    correct: ['a'],
    explanation: 'File hash indicators (SHA-256) with Block and remediate prevent execution and trigger quarantine. The other indicator types operate on different artifacts or use non-blocking actions.',
    references: [REF_MDE_ADVANCED, REF_MDE_ASR]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Data Collection Rules (DCRs) in Azure Monitor / Microsoft Sentinel.',
    options: opts4(
      'A DCR can transform incoming log records (filter and project columns) before storage.',
      'A DCR can route the same data stream to multiple destinations.',
      'A DCR is required for every legacy MMA / OMS agent install.',
      'A DCR is used by the Azure Monitor Agent (AMA) and the Logs Ingestion API.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'DCRs declare collection, transformation (KQL transform), and multi-destination routing for AMA and the Logs Ingestion API. The legacy MMA agent does NOT use DCRs (one reason for the migration).',
    references: [REF_DCR, REF_SENTINEL_AMA]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to schedule a "Fusion" detection that correlates anomalous sign-ins, mailbox forwarding rules, and OneDrive mass downloads into a single high-fidelity incident. Which Sentinel rule type leverages built-in ML for this?',
    options: opts4(
      'Machine learning behavioral analytics (Fusion)',
      'Scheduled rule',
      'NRT rule',
      'A workbook tile'
    ),
    correct: ['a'],
    explanation: 'Fusion uses ML to correlate weak multi-source signals into high-fidelity incidents. Scheduled and NRT are query-based KQL rules. Workbooks visualize, they don\'t generate incidents.',
    references: [REF_ML_RULES, REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to onboard a multi-cloud AWS environment to Microsoft Defender for Cloud to receive workload-protection alerts. Which integration is the recommended path?',
    options: opts4(
      'Connect the AWS account in Defender for Cloud > Environment settings > Add environment > AWS, then enable required plans',
      'Forward CloudTrail to a custom log table only',
      'Install Microsoft Sentinel agent on every EC2 instance',
      'Manually create an Azure Arc-enabled server for each EC2 instance via PowerShell'
    ),
    correct: ['a'],
    explanation: 'Defender for Cloud has a first-class AWS connector under Environment settings; enabling plans (Servers, Databases, Containers) extends workload protection. CloudTrail forwarding is for Sentinel only. Per-instance manual Arc is excessive.',
    references: [REF_MDC, REF_MDC_SERVERS, REF_MDC_CONTAINERS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want analytics rules to automatically group alerts about the same user across a 6-hour window into a single incident. What rule setting controls this?',
    options: opts4(
      'Alert grouping with entity-based or all-entities matching and a configurable lookback',
      'A workspace retention setting',
      'A Conditional Access "Persistent browser session"',
      'An auto-close automation rule'
    ),
    correct: ['a'],
    explanation: 'Alert grouping on a scheduled rule groups alerts by entity sets/all entities within a configured lookback. Retention is unrelated. CA does not group alerts. Auto-close affects status, not grouping.',
    references: [REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Defender for Endpoint, you want to control whether Microsoft Defender Antivirus collects optional file samples for in-cloud detonation. Where is this configured?',
    options: opts4(
      'Defender portal > Settings > Endpoints > Advanced features (Sample submission / cloud-delivered protection)',
      'Microsoft 365 admin center > Security > Privacy',
      'Microsoft Sentinel > Settings > Privacy',
      'Conditional Access > Sign-in frequency'
    ),
    correct: ['a'],
    explanation: 'Sample submission and cloud-delivered protection settings are surfaced under Advanced features in MDE. The other locations are unrelated.',
    references: [REF_MDE_ADVANCED]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel analyst needs to enrich incoming SecurityEvent records with the city of the source IP before ingestion. Which capability supports inline enrichment at ingest time?',
    options: opts4(
      'A DCR transformation using KQL (e.g., extend City = geo_info_from_ip_address(SourceIp).city)',
      'A scheduled analytics rule scoped to "ingest"',
      'A Sentinel workbook with a parameter',
      'A retention policy targeting SecurityEvent'
    ),
    correct: ['a'],
    explanation: 'DCR transformations can call KQL functions like geo_info_from_ip_address() to enrich at ingest time. Analytics rules run after ingest. Workbooks read data. Retention controls lifecycle.',
    references: [REF_DCR, REF_SENTINEL_AMA]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'Your tenant has both Defender for Endpoint Plan 2 and Defender for Servers. To avoid double-billing for the same Windows Server VM, the recommended setting is:',
    options: opts4(
      'Enable the "Microsoft Defender for Endpoint integration" in Defender for Cloud Servers plan so MDE is provisioned via the MDC connection (no separate MDE onboarding cost on top)',
      'Disable Defender for Endpoint on those servers',
      'Set MDE licensing to "Audit only"',
      'Remove the Azure Monitor Agent from the servers'
    ),
    correct: ['a'],
    explanation: 'Defender for Servers (Plan 2) provisions MDE via the integration; you don\'t pay for MDE separately for those VMs. Disabling MDE removes protection. Audit-only and removing AMA degrade security telemetry.',
    references: [REF_MDC_SERVERS, REF_MDE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel analytics rule triggers but no alert appears in the Incidents queue. The rule definition shows "Create incidents from alerts triggered by this analytics rule" disabled. What does that mean?',
    options: opts4(
      'The rule creates only alerts; no incidents are created from those alerts',
      'The rule is fully disabled',
      'The rule writes to Storage Account only',
      'The rule is deleted on next run'
    ),
    correct: ['a'],
    explanation: 'Without "Create incidents" enabled, the rule generates alerts in the SecurityAlert table but no Sentinel incident wraps them. The rule itself is still active. Storage and self-delete are not behaviors.',
    references: [REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You have ASR rule "Block credential stealing from the Windows local security authority subsystem (lsass.exe)" enabled, but a legitimate enterprise IT script is blocked. Which targeted change preserves the rule and unblocks the script?',
    options: opts4(
      'Add an ASR rule exclusion for the specific script/path or file hash',
      'Set the ASR rule to Audit mode tenant-wide',
      'Disable Microsoft Defender Antivirus on those devices',
      'Remove all device groups'
    ),
    correct: ['a'],
    explanation: 'ASR rules support per-rule exclusions for files and folders so you can keep the rule in Block while allowing a known-good utility. Audit mode disables block. Disabling AV loses defense. Removing device groups breaks RBAC and automation scoping.',
    references: [REF_MDE_ASR, REF_MDE_ASR_DEPLOY]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'Microsoft Defender XDR can ingest alerts from a third-party EDR via the Microsoft Defender XDR API for partner integrations. What is the primary advantage of this integration?',
    options: opts4(
      'Alerts from the third party show up in Defender XDR incidents and are correlated with native signals',
      'It disables all Microsoft AV on devices',
      'It removes the need for Conditional Access',
      'It moves the workspace to a new region'
    ),
    correct: ['a'],
    explanation: 'Partner alert ingestion via Defender XDR APIs lets non-Microsoft alerts participate in XDR correlation and incident creation. The other claims are unrelated/false.',
    references: [REF_XDR, REF_INCIDENTS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel workbook displays the same data slightly differently for each SOC team. The fastest way to allow each team to filter without modifying the workbook is to:',
    options: opts4(
      'Add a parameter (dropdown, time range, etc.) referenced by the queries via {parameterName}',
      'Create a separate workbook per team',
      'Hard-code per-team filters into the queries',
      'Re-write the workbook in Power BI'
    ),
    correct: ['a'],
    explanation: 'Workbook parameters are interactive controls referenced inside KQL queries — one workbook, many filtered views. Forking per team duplicates maintenance. Hard-coding eliminates flexibility. Power BI is a separate product.',
    references: [REF_SENTINEL_WORKBOOKS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'In the Defender portal, "Microsoft Sentinel" appears as a unified pane alongside XDR. Which prerequisite is required for this unified experience?',
    options: opts4(
      'A Microsoft Sentinel workspace is connected (onboarded) to Microsoft Defender XDR',
      'A separate Sentinel tenant in a different Azure subscription',
      'Disabling Microsoft Defender XDR for the tenant',
      'A user-assigned managed identity on every onboarded device'
    ),
    correct: ['a'],
    explanation: 'Onboarding a Sentinel workspace to Defender XDR surfaces Sentinel inside the Defender portal\'s unified experience. The other options describe unrelated configurations.',
    references: [REF_SENTINEL, REF_XDR_PORTAL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to ensure that Microsoft Defender for Endpoint device group membership rules are applied in the right order. How are conflicting memberships resolved?',
    options: opts4(
      'Devices match the group with the highest rank (lowest rank number) whose membership criteria they satisfy',
      'Devices match the alphabetically first group',
      'Devices match all matching groups and inherit settings from all',
      'Devices match the most recently created group'
    ),
    correct: ['a'],
    explanation: 'MDE evaluates groups by rank; the highest-priority (lowest number) matching group wins. Alphabetical, multi-inheritance, and recency rules don\'t apply.',
    references: [REF_MDE_DEVICE_GROUPS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A scheduled analytics rule with "Trigger" set to "Trigger an alert when number of query results is greater than 0" is ALSO configured with "Suppression — Stop running query after alert is generated: 1 hour". What is the runtime behavior?',
    options: opts4(
      'After the rule fires once, the query is paused for 1 hour, then resumes on its normal schedule',
      'The rule is permanently disabled after the first hit',
      'The rule fires only once per day regardless of suppression',
      'Suppression only applies to manual runs'
    ),
    correct: ['a'],
    explanation: 'Suppression silences the rule for the configured period after a hit, then resumes. It does not permanently disable, doesn\'t cap to one per day, and applies to the scheduled job, not manual runs.',
    references: [REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want SOC analysts to view RAW event data for an alert across Defender XDR, including parent process tree and network connections, without leaving the incident. Which tab on the incident page typically holds this?',
    options: opts4(
      'Evidence and Response (and the alert\'s related Process tree)',
      'Workbooks',
      'Notebooks',
      'Service health'
    ),
    correct: ['a'],
    explanation: 'Evidence and Response (alert tab) shows enriched entities and process trees with related events. Workbooks, Notebooks, and Service health are unrelated panes.',
    references: [REF_INCIDENTS, REF_MDE_TIMELINE]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Sentinel automation rules.',
    options: opts4(
      'They can trigger on incident creation or update.',
      'They can change status, assign owner, add tags, and run playbooks.',
      'They can rewrite the underlying KQL of the analytics rule that fired.',
      'They run server-side without analyst interaction.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Automation rules trigger on incident create/update, with actions including status/owner/tags/playbooks, running server-side. They CANNOT modify analytics rule KQL.',
    references: [REF_AUTOMATION_RULES, REF_PLAYBOOKS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable a Sentinel anomaly detection analytics rule. By default, what does the rule do when an anomalous event matches?',
    options: opts4(
      'Writes to the Anomalies table (visible for hunting and analytics rule joining); does not create incidents until you tune & enable production mode',
      'Immediately creates a Sev=Critical incident with no tuning options',
      'Disables itself after the first hit',
      'Re-ingests the SecurityEvent table'
    ),
    correct: ['a'],
    explanation: 'Anomalies write to the Anomalies table for hunting and rule joining. To convert anomalies to incidents you typically duplicate to production mode and tune thresholds. They don\'t auto-create incidents at default config.',
    references: [REF_ANOMALIES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to support a regulator-driven 7-year retention for a single small Sentinel table. The lowest-cost path with KQL queryability is to:',
    options: opts4(
      'Route the table to Data lake tier and use KQL jobs for occasional access',
      'Set workspace Analytics retention to 7 years for all tables',
      'Export to a Storage Account JSON blob and re-import each request',
      'Increase the workspace cap to 1 TB per day'
    ),
    correct: ['a'],
    explanation: 'Data lake-tier retention with KQL jobs keeps the data queryable cheaply for long horizons. Workspace-wide 7-year analytics retention is the most expensive choice. Blob loses KQL.',
    references: [REF_SENTINEL_DATA_LAKE, REF_SENTINEL_RETENTION]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure Defender XDR to send email notifications for INCIDENTS with severity High or Critical to the SOC distribution list. Which scoping option is also available?',
    options: opts4(
      'Scope by device group (and/or tag), so notifications only fire for incidents involving devices in chosen groups',
      'Scope by file hash',
      'Scope by Conditional Access policy',
      'Scope by Azure region only'
    ),
    correct: ['a'],
    explanation: 'Incident notifications can be scoped by severity AND device group/tag for tenant-specific routing. File hash, CA, and region scoping are not options on the notification rule.',
    references: [REF_XDR_EMAIL_NOTIFY, REF_MDE_DEVICE_GROUPS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You need to migrate Sentinel data ingestion from the legacy MMA agent to AMA for a fleet of Windows servers. Which Microsoft-supported tool helps automate the migration plan?',
    options: opts4(
      'AMA migration helper / Azure Monitor Agent Migration Tool',
      'Azure Site Recovery',
      'Microsoft Defender Antivirus offline scan',
      'Conditional Access What-if'
    ),
    correct: ['a'],
    explanation: 'Microsoft publishes an AMA migration helper to plan and execute migration from MMA to AMA. ASR is for DR, AV offline scan is malware cleanup, CA What-if is policy simulation.',
    references: [REF_SENTINEL_AMA, REF_DCR]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a Defender XDR custom detection rule to mark devices it identifies as "compromised" automatically. Which entity / response setting enables this?',
    options: opts4(
      'Map the DeviceId entity in the rule and configure response actions to "Isolate device" or "Mark user as compromised"',
      'Add a Sentinel automation rule with the action "Modify Defender XDR detections"',
      'Configure the workspace retention to 1 day',
      'Disable AIR globally'
    ),
    correct: ['a'],
    explanation: 'Custom detection rules can mark users compromised, isolate devices, restrict app execution, etc., when the rule projects the right entity (DeviceId/AccountObjectId). The other options don\'t apply to this scenario.',
    references: [REF_CUSTOM_DETECT, REF_AIR]
  },

  // ── Respond to security incidents (26) ──
  {
    domain: RESPOND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An MDE alert shows "Beacon traffic to known malicious domain" on a single device. Which response action prevents network egress to the C2 while preserving live forensic state?',
    options: opts4(
      'Isolate device (with selective isolation if needed)',
      'Restart the device',
      'Stop the Microsoft Defender Antivirus service',
      'Quarantine the user mailbox'
    ),
    correct: ['a'],
    explanation: 'Isolate cuts the device off network-wide (Outlook, Teams, browsing, C2) while preserving memory and disk. Selective isolation lets MDE communication continue. Restart loses memory IOCs. Stopping AV reduces protection. Mailbox quarantine is unrelated to a device beacon.',
    references: [REF_MDE_TIMELINE, REF_MDE_INVESTIGATION_PKG]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A user mailbox shows a newly created inbox rule that auto-forwards all messages from finance@contoso.com to an external address. Which feature should you use to remove the rule across the user\'s mailbox and prevent recurrence?',
    options: opts4(
      'Delete the inbox rule, reset credentials, and ensure the anti-phishing/automatic forwarding policy blocks external forwarding for the affected user/group',
      'Mark the email as junk',
      'Disable Conditional Access entirely',
      'Submit the rule text to a sensitive information type (SIT)'
    ),
    correct: ['a'],
    explanation: 'Containment is: delete the rule, rotate creds, and ensure mail-forwarding policies (or transport rules) block external auto-forwarding. Junk classification, disabling CA, and SIT submission don\'t address the inbox rule abuse.',
    references: [REF_MDO_ANTIPHISH, REF_IDPROTECT_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'After an Entra ID Protection sign-in risk alert "Unfamiliar sign-in properties", a SOC analyst reviews the sign-in details and confirms it is the user\'s laptop on a new ISP. The correct classification is:',
    options: opts4(
      'Confirm sign-in safe (so future similar sign-ins lower the risk score)',
      'Confirm user compromised',
      'Block the user permanently',
      'Delete the user'
    ),
    correct: ['a'],
    explanation: '"Confirm sign-in safe" feeds Microsoft\'s risk-scoring models so future similar sign-ins for this user are scored lower. Confirming compromised would be wrong; permanent block/delete is destructive.',
    references: [REF_IDPROTECT, REF_IDPROTECT_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'Microsoft Defender for Identity raises a "Suspected identity theft (pass-the-hash)" alert. The immediate containment for the SOURCE device is best handled by:',
    options: opts4(
      'Isolating the source device in MDE and disabling the impacted account in AD/Entra',
      'Blocking the destination URL at the firewall only',
      'Increasing workspace retention',
      'Adding the source device to Defender for Cloud Apps allow list'
    ),
    correct: ['a'],
    explanation: 'Pass-the-hash is a credential-reuse attack. Containment requires isolating the compromised endpoint and disabling the affected identity to prevent further reuse. Firewall URL blocks, retention, and MDCA allow-listing don\'t contain the on-host abuse.',
    references: [REF_MDI_ALERTS, REF_MDI_LATERAL, REF_MDE_TIMELINE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Cloud Apps "Unusual file share activity" alert fires for adele@contoso.com. To stop further OneDrive sharing without disabling the account, which MDCA action is most surgical?',
    options: opts4(
      'Apply a Conditional Access App Control session policy that blocks share / download actions for the user',
      'Suspend the user in Entra ID',
      'Delete OneDrive content',
      'Restart Office 365'
    ),
    correct: ['a'],
    explanation: 'CASB session control via Conditional Access App Control can block specific actions (share, download) in real time without full suspension. Suspending the user is broader; deleting content and "restarting O365" are not surgical responses.',
    references: [REF_MDCA_POLICIES, REF_MDCA_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Microsoft Sentinel incident summary in the Defender portal shows an "AI summary" generated by Microsoft Security Copilot. The intended use of this summary is to:',
    options: opts4(
      'Help the analyst rapidly understand scope (entities, kill chain, recommended next actions) without reading every alert manually',
      'Replace the SOC analyst entirely',
      'Automatically close the incident',
      'Disable the analytics rule that fired'
    ),
    correct: ['a'],
    explanation: 'Copilot summaries aid triage and response planning; they do not replace analyst judgment, close incidents, or modify rules.',
    references: [REF_COPILOT_SEC, REF_INCIDENTS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to revoke all refresh tokens for a compromised user so existing sessions cannot continue. Which Entra ID action is appropriate?',
    options: opts4(
      'Revoke sessions (revoke all refresh tokens) for the user from the Entra admin center or Microsoft Graph',
      'Disable Conditional Access entirely',
      'Reset the user\'s display name',
      'Force a tenant-wide MFA registration'
    ),
    correct: ['a'],
    explanation: 'Revoking sessions invalidates refresh tokens; existing access tokens still work until they expire (typically 1 hour), but no new tokens can be issued. The other actions don\'t evict sessions.',
    references: [REF_IDPROTECT, REF_IDPROTECT_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'During MDE live response on a Windows device, you need to delete a known-malicious file. Which command performs the on-device deletion?',
    options: opts4(
      'remediate file <path>',
      'getfile <path>',
      'run <scriptname>',
      'fg <command-id>'
    ),
    correct: ['a'],
    explanation: '`remediate file <path>` removes the file. `getfile` downloads it for analysis. `run` executes a library script. `fg` brings a background command to the foreground.',
    references: [REF_MDE_LIVE_RESPONSE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You receive a Defender for Office 365 alert about a high-confidence phishing campaign delivered to 200 mailboxes 30 minutes ago. Which AIR-driven flow may have already taken action?',
    options: opts4(
      'Zero-hour Auto Purge (ZAP) retroactively quarantining the messages',
      'Email DKIM re-signing',
      'Conditional Access "Require compliant device"',
      'Defender Antivirus offline scan'
    ),
    correct: ['a'],
    explanation: 'ZAP retroactively purges malicious mail from mailboxes after delivery when verdicts change. DKIM, CA, and AV offline scan address different threats.',
    references: [REF_MDO, REF_MDO_AIR, REF_MDO_QUARANTINE]
  },
  {
    domain: RESPOND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL containment actions a SOC analyst can take from a Defender XDR incident page where a compromised Entra ID user account is the principal entity.',
    options: opts4(
      'Confirm user compromised (in Entra ID Protection)',
      'Disable user in Entra ID',
      'Force password reset',
      'Re-issue the user\'s passport'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Confirm compromised feeds the model and can trigger CA-driven actions; disable account and force password reset are direct containment. "Re-issue passport" is not a security action.',
    references: [REF_IDPROTECT_INVESTIGATE, REF_IDPROTECT_RISK]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel automation rule auto-assigns new incidents to a specific shift queue (e.g., "EMEA-SOC") based on tags. Which incident property is the simplest to use as the assignment criterion?',
    options: opts4(
      'Tags applied by an earlier automation rule (or by an analytics rule)',
      'The geographic IP address of the analyst',
      'The Conditional Access named location of the incident',
      'The Azure subscription billing tag'
    ),
    correct: ['a'],
    explanation: 'Tags are first-class incident metadata supported by automation rule conditions. The other options aren\'t exposed as incident properties for assignment.',
    references: [REF_AUTOMATION_RULES, REF_SENTINEL_INCIDENTS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC analyst needs to investigate a SharePoint Online file that was leaked externally. Which Purview tool generates a content-and-activity record (when, who, what) for the file?',
    options: opts4(
      'Audit search (Activity in Purview Audit) — filter on the SharePoint workload and the file URL',
      'Insider risk management policies',
      'Data lifecycle management',
      'Defender XDR custom detection'
    ),
    correct: ['a'],
    explanation: 'Audit search records SharePoint events (File accessed, File shared, File downloaded, ExternallyAccessed etc.). Insider risk uses indicators, not raw audit. DLM governs retention. Defender XDR detections are device/email-centric.',
    references: [REF_PURVIEW_AUDIT, REF_PURVIEW_AUDIT_PREMIUM]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'An analyst wants to use Microsoft Security Copilot in Defender to translate a complex KQL query into plain English to document the detection. Which prompt produces a relevant response?',
    options: opts4(
      'Paste the KQL with "Explain this query in plain English"',
      'Type "Please disable the analytics rule"',
      'Type "Export all incidents to email"',
      'Type "Run a vulnerability scan on every device"'
    ),
    correct: ['a'],
    explanation: 'Copilot can explain, generate, and translate KQL. Disabling rules, mass exports, and on-device scans are operational changes that Copilot doesn\'t execute as a prompt response.',
    references: [REF_COPILOT_SEC]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After a Defender for Cloud alert "Crypto coin miner activity (XMR)" on an Azure VM, which immediate Defender for Cloud-suggested response is most appropriate?',
    options: opts4(
      'Trigger workflow automation to isolate the VM (NSG-based segmentation) and start an investigation, then forensic capture',
      'Resize the VM to a smaller SKU',
      'Move the VM to a different resource group',
      'Run a Conditional Access What-if simulation'
    ),
    correct: ['a'],
    explanation: 'Segmenting / quarantining the VM and starting investigation is the recommended response. Resizing/moving doesn\'t contain. CA What-if is policy modeling, not response.',
    references: [REF_MDC_ALERTS, REF_MDC_SERVERS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC team uses Sentinel incidents pulled into the Defender portal, but wants automated case tracking across multiple incidents related to the same campaign. Which Defender XDR feature should they use?',
    options: opts4(
      'Case management (group incidents into a case with shared status/assignees/notes)',
      'Workspace cross-region replication',
      'Defender for Cloud Apps governance log',
      'Microsoft 365 Roadmap'
    ),
    correct: ['a'],
    explanation: 'Case management groups related incidents into a tracked case. The other options are unrelated.',
    references: [REF_CASE_MGMT]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You investigate a Defender for Endpoint incident and want to identify all OTHER devices that loaded the same malicious DLL recently. The fastest approach is to:',
    options: opts4(
      'Run an Advanced Hunting query on DeviceImageLoadEvents with the SHA-256 of the DLL across the last 30 days',
      'Run a scheduled rule that creates new incidents every 5 minutes',
      'Reset Conditional Access policies',
      'Open a Purview Audit search for SharePoint'
    ),
    correct: ['a'],
    explanation: 'DeviceImageLoadEvents records image loads with hash and process; a 30-day AH query enumerates affected devices. Scheduled rules detect on a schedule (forward-looking), CA reset is unrelated, Purview Audit is not endpoint-load-centric.',
    references: [REF_HUNTING, REF_AH_SCHEMA]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'During incident response, an analyst sees an Entra ID risk detection "Token issuer anomaly". The next investigative pivot is to:',
    options: opts4(
      'Inspect the user\'s sign-in logs in Entra ID and correlate with MDCA and Defender for Identity for related events',
      'Restart the Entra ID tenant',
      'Disable all Conditional Access policies',
      'Delete the user immediately'
    ),
    correct: ['a'],
    explanation: 'Pivot to sign-in logs and other Defender signals to understand scope before taking destructive action. There is no "restart tenant" operation. Disabling CA opens a wider hole. Deleting the user destroys identity context.',
    references: [REF_IDPROTECT_INVESTIGATE, REF_MDI_ALERTS, REF_MDCA_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Microsoft Defender for Cloud Apps to automatically suspend a user when a high-severity detection fires. Which mechanism enables this?',
    options: opts4(
      'A MDCA policy with the governance action "Suspend user"',
      'A Conditional Access "Sign-in frequency" policy',
      'A Sentinel workbook with a parameter',
      'An NRT rule with no entities'
    ),
    correct: ['a'],
    explanation: 'MDCA policies can execute governance actions (Suspend user, Require sign-in, Confirm compromised). CA Sign-in frequency forces re-auth, not suspension. Workbooks visualize. NRT rules detect, not govern.',
    references: [REF_MDCA_POLICIES, REF_IDPROTECT_RISK]
  },
  {
    domain: RESPOND, difficulty: 3, type: QType.SINGLE,
    stem: 'An incident in Defender XDR involves the same user being targeted by phishing (MDO), then the user device beaconing (MDE), then the user account performing risky sign-ins from a new IP (Entra ID Protection). Which characteristic of XDR helps the SOC respond as one coordinated effort?',
    options: opts4(
      'Cross-workload entity correlation that groups alerts into a single incident with unified actions',
      'Strict workload silos with separate consoles',
      'A separate Conditional Access policy per workload',
      'A separate analytics rule per workload that never share entities'
    ),
    correct: ['a'],
    explanation: 'XDR\'s core value is cross-workload correlation into one incident with unified response. The other options describe non-XDR (siloed) flows.',
    references: [REF_INCIDENTS, REF_XDR_CORRELATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC analyst wants to add a comment to a Sentinel incident from inside a Logic App playbook. Which connector action enables this?',
    options: opts4(
      'Microsoft Sentinel — "Add comment to incident" (V3)',
      'Office 365 Outlook — "Send an email"',
      'Azure Monitor Logs — "Run query"',
      'HTTP — "Call URL"'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Sentinel Logic Apps connector exposes incident-level actions like Add comment. Email, KQL runners, and HTTP can be composed but aren\'t the native incident-comment action.',
    references: [REF_PLAYBOOKS, REF_AUTOMATION_RULES]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A user reports MFA push prompts at 03:00 — likely MFA fatigue. Which Entra ID Protection / Authentication Method action best counters this?',
    options: opts4(
      'Enable number matching for Microsoft Authenticator and configure a sign-in risk policy that blocks or requires MFA on risky sign-ins',
      'Disable MFA for the tenant',
      'Increase the Conditional Access sign-in frequency to 1 year',
      'Block all sign-ins from outside the country'
    ),
    correct: ['a'],
    explanation: 'Number matching forces the user to enter a number shown on the sign-in screen (defeats blind approve), and sign-in risk policies stop or step up risky sign-ins. Disabling MFA is destructive; 1-year sign-in frequency hurts security; country block alone doesn\'t stop intra-country fatigue.',
    references: [REF_IDPROTECT_RISK, REF_IDPROTECT]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to take a process tree snapshot for an alert from MDE to share with another team. From the alert page, what is the easiest way?',
    options: opts4(
      'Use the alert\'s "Process tree" pane and export / share the link to the alert/incident',
      'Recreate the process tree manually from KQL output',
      'Pull a Sentinel workbook snapshot',
      'Open Microsoft Sentinel Notebooks and reconstruct from scratch'
    ),
    correct: ['a'],
    explanation: 'The process tree is shown inline on the alert; sharing the alert/incident URL preserves context. Manual reconstruction is unnecessary. Workbooks/Notebooks are alternative analysis tools, not the primary share path.',
    references: [REF_MDE_TIMELINE, REF_INCIDENTS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'After investigating a true positive incident, you want the rule that fired to write a higher severity for similar future hits. Which is the right place to adjust the severity rating?',
    options: opts4(
      'Edit the analytics rule\'s alert details (Severity field)',
      'Edit each user\'s sign-in log retroactively',
      'Edit the Conditional Access named location',
      'Edit the workspace data retention'
    ),
    correct: ['a'],
    explanation: 'Severity is configured on the analytics rule (or in the custom detection rule for Defender XDR). The other options don\'t affect alert severity.',
    references: [REF_ANALYTICS_RULES, REF_CUSTOM_DETECT]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You investigate a Defender for Cloud Containers alert "Exposed Kubernetes dashboard". The first hardening step is to:',
    options: opts4(
      'Remove the public exposure of the dashboard (apply network policy / private endpoint, RBAC review)',
      'Increase node count to mask the issue',
      'Migrate the cluster to another region',
      'Restart the cluster'
    ),
    correct: ['a'],
    explanation: 'Containment for exposed admin endpoints is to remove the public exposure (network policy, private endpoint) and review RBAC. Scaling, migrating, or restarting do not address the exposure.',
    references: [REF_MDC_CONTAINERS, REF_MDC_ALERTS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to immediately stop a known-malicious URL from being clicked by any user in the tenant. From the Defender portal, the most direct action is to:',
    options: opts4(
      'Create an indicator (URL/domain) with action "Block" in Microsoft Defender for Endpoint / Defender for Office 365 tenant indicators',
      'Disable Defender Antivirus globally',
      'Add the URL to a Sentinel watchlist',
      'Send a Teams message to all users'
    ),
    correct: ['a'],
    explanation: 'A tenant-wide URL/domain block indicator stops navigation on managed devices (MDE) and Safe Links rewrites (MDO). Disabling AV reduces protection. Watchlists are detection helpers, not enforcement. Teams messages are awareness, not blocking.',
    references: [REF_MDE_ADVANCED, REF_MDO_SAFELINK]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A high-severity Defender for Cloud Apps alert says "Anonymous IP address" sign-in for a Global Administrator. The MOST urgent containment for a Global Admin compromise is to:',
    options: opts4(
      'Disable the account in Entra ID, revoke all sessions, then evaluate scope from the audit logs and break-glass account procedures',
      'Wait 24 hours and re-evaluate',
      'Add the anonymous IP to a Conditional Access trusted location',
      'Increase MFA prompt frequency tenant-wide'
    ),
    correct: ['a'],
    explanation: 'Compromised Global Admin requires immediate disable + session revocation, then audit log review. Break-glass accounts ensure you don\'t lock yourself out. Waiting is dangerous. Trusting the IP is the opposite of the right move. Tenant MFA changes don\'t contain THIS incident.',
    references: [REF_IDPROTECT, REF_IDPROTECT_INVESTIGATE, REF_MDCA_INVESTIGATE]
  },

  // ── Perform threat hunting (13) ──
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In KQL, which operator extracts a specific field from a JSON-typed column?',
    options: opts4(
      'parse_json (and bracket / dot notation, e.g., parse_json(Payload).user)',
      'mv-expand only',
      'project-away',
      'distinct'
    ),
    correct: ['a'],
    explanation: 'parse_json parses a string into dynamic, then bracket/dot notation extracts fields. mv-expand expands arrays. project-away drops columns. distinct dedupes rows.',
    references: [REF_KQL]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to hunt for processes that load a DLL signed by an untrusted certificate. Which Advanced Hunting table is most relevant?',
    options: opts4(
      'DeviceImageLoadEvents',
      'EmailUrlInfo',
      'CloudAppEvents',
      'IdentityDirectoryEvents'
    ),
    correct: ['a'],
    explanation: 'DeviceImageLoadEvents captures image loads with file/cert info. EmailUrlInfo is email URL detail; CloudAppEvents is SaaS app activity; IdentityDirectoryEvents is AD/Entra directory changes.',
    references: [REF_AH_SCHEMA, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 3, type: QType.SINGLE,
    stem: 'You join DeviceProcessEvents to DeviceNetworkEvents to find processes that opened outbound connections to a list of suspect IPs stored in a Sentinel watchlist. Which KQL function references the watchlist?',
    options: opts4(
      '_GetWatchlist("WatchlistName")',
      'get_watch("WatchlistName")',
      'parse_watch("WatchlistName")',
      'extract_watch("WatchlistName")'
    ),
    correct: ['a'],
    explanation: '_GetWatchlist("Name") is the standard helper to read a Sentinel watchlist as a tabular expression for joins. The other function names don\'t exist.',
    references: [REF_HUNT_QUERIES, REF_KQL]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a hunting query that surfaces unusual data egress: 95th percentile bytes-out per device. Which KQL aggregation supports percentile calculation?',
    options: opts4(
      'percentile(BytesOut, 95) inside summarize',
      'avg(BytesOut)',
      'sum(BytesOut)',
      'count()'
    ),
    correct: ['a'],
    explanation: 'percentile(field, n) computes the nth percentile (and percentiles() for multiple). avg/sum/count don\'t produce percentiles.',
    references: [REF_KQL, REF_AH_BEST]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Microsoft Sentinel Data lake feature lets you run a KQL job ad-hoc, get the results into a smaller analytics-tier table for further hunting, and pay only for the compute you used?',
    options: opts4(
      'KQL jobs (Search jobs / interactive jobs against Data lake-tier data)',
      'Workspace cross-region replication',
      'Diagnostic settings to Storage Account',
      'Azure Monitor Workbook scheduled refresh'
    ),
    correct: ['a'],
    explanation: 'KQL jobs let analysts query Data lake data and write results back to the workspace for hunting. The other options don\'t serve this purpose.',
    references: [REF_KQL_JOBS, REF_SENTINEL_DATA_LAKE]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to use Sentinel Graph to visualize the relationships among a compromised account, the devices it signed into, and the files it accessed. Which Defender XDR surface exposes this graph experience?',
    options: opts4(
      'Sentinel Graph hunting in the Microsoft Defender portal',
      'Azure Cosmos DB Graph API',
      'Power BI scatter chart',
      'Microsoft Graph Explorer'
    ),
    correct: ['a'],
    explanation: 'Sentinel Graph hunting renders entity relationships in the Defender portal. Cosmos Graph API is a graph DB. Power BI is BI. Microsoft Graph Explorer queries Microsoft Graph API metadata.',
    references: [REF_SENTINEL_GRAPH, REF_HUNT_GRAPHS]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want the KQL output of a query to be charted as time-over-time. Which operator renders it as a time chart?',
    options: opts4(
      'render timechart (preceded by summarize ... by bin(Timestamp, 1h))',
      'order by Timestamp asc',
      'where Timestamp > ago(7d)',
      'distinct Timestamp'
    ),
    correct: ['a'],
    explanation: 'render timechart visualizes summarized data with Timestamp as the x-axis. order/where/distinct don\'t render charts.',
    references: [REF_KQL]
  },
  {
    domain: HUNT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Sentinel watchlists.',
    options: opts4(
      'Watchlists are key-value tables you can reference from KQL during hunting and analytics.',
      'Watchlists can be imported from a CSV uploaded in the portal or from an Azure Storage URL.',
      'Watchlists replace the need for analytics rules entirely.',
      'Watchlists support search keys for fast lookups in joins.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Watchlists are reference tables (CSV/storage import) with search keys for joins. They COMPLEMENT analytics rules, not replace them.',
    references: [REF_HUNT_QUERIES, REF_KQL]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'A hunting query against EmailEvents and UrlClickEvents takes 3+ minutes because it joins 30 days of data. Which two changes most improve performance?',
    options: opts4(
      'Filter Timestamp first; project only required columns before the join; use kind=inner with the smallest side on the left',
      'Disable workspace retention',
      'Run the query in a Logic App so it doesn\'t time out',
      'Move data to Sentinel Data lake without changes'
    ),
    correct: ['a'],
    explanation: 'Early time filters and column projection (and smaller-left ordering with kind=inner) drastically reduce join cost. Disabling retention loses data. Running via Logic Apps doesn\'t change query cost. Moving to Data lake helps cost but not interactive performance unless using KQL jobs.',
    references: [REF_AH_BEST, REF_KQL]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You promoted a hunting bookmark into a Sentinel incident. What additional context does the bookmark carry into the incident?',
    options: opts4(
      'The KQL query used, the result row(s) at the time of bookmark, and any mapped entities and notes',
      'Only an HTML screenshot',
      'Only the analyst\'s name',
      'Only the workspace ID'
    ),
    correct: ['a'],
    explanation: 'Bookmarks store the query, the matched rows at the time, mapped entities, and analyst notes — promotable into incidents for full investigation context.',
    references: [REF_HUNT_QUERIES]
  },
  {
    domain: HUNT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a Jupyter Notebook in Sentinel to query and enrich data with MSTICPy and present interactive visualizations during an investigation. Which dependency must typically be configured?',
    options: opts4(
      'An Azure Machine Learning workspace linked to Sentinel, with MSTICPy installed and tenant/workspace settings configured',
      'A Conditional Access policy targeting Jupyter',
      'A separate Azure subscription with no resources',
      'A Defender for Cloud Apps governance action'
    ),
    correct: ['a'],
    explanation: 'Sentinel Notebooks run on an Azure ML workspace; MSTICPy is installed in the notebook environment and configured with workspace/tenant settings to query Sentinel. The other options are unrelated.',
    references: [REF_NOTEBOOKS]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to expose Sentinel data to an MCP-aware AI agent (e.g., a custom Copilot) so it can perform retrieval-augmented hunting. The supported Microsoft endpoint is the:',
    options: opts4(
      'Microsoft Sentinel MCP Server',
      'Azure Functions HTTP endpoint with anonymous auth',
      'Direct ODBC connection to the workspace',
      'SQL Server linked server'
    ),
    correct: ['a'],
    explanation: 'Sentinel MCP Server is the supported MCP-compatible interface to Sentinel data and operations. ODBC, SQL linked server, and anonymous Functions are not supported.',
    references: [REF_SENTINEL_MCP]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to identify the BLAST RADIUS of a compromised account quickly — every other identity, device, file, and mailbox it touched in the last 7 days. In the Defender portal, the recommended hunting capability is:',
    options: opts4(
      'Sentinel Graph hunting graphs (which automatically traverse XDR entity relationships)',
      'A scheduled analytics rule that runs every 5 minutes',
      'A workbook scheduled refresh',
      'A Conditional Access What-if'
    ),
    correct: ['a'],
    explanation: 'Sentinel Graph hunting graphs traverse XDR entity relationships to map blast radius — built for this exact scenario. Scheduled rules, workbooks, and CA What-if don\'t fit.',
    references: [REF_SENTINEL_GRAPH, REF_HUNT_GRAPHS, REF_BLAST_RADIUS]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Manage a security operations environment (26) ──
  {
    domain: MANAGE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to onboard a Linux (Ubuntu) server to Microsoft Defender for Endpoint. Which onboarding method is supported and Microsoft-recommended?',
    options: opts4(
      'Install the MDE agent package (mdatp) and run the onboarding script provided in the Defender portal',
      'Sideload the Windows MSI installer',
      'Enable Conditional Access "Require compliant device"',
      'Apply a Group Policy targeting Linux'
    ),
    correct: ['a'],
    explanation: 'MDE for Linux uses the mdatp agent installed via package manager + onboarding script. Windows MSI does not run on Linux. CA enforces sign-in, not onboarding. GPO is Windows-only.',
    references: [REF_MDE_ONBOARD, REF_MDE]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to grant a managed-identity Logic App permission to add comments to Sentinel incidents. Which RBAC role assigned to the Logic App\'s managed identity meets this?',
    options: opts4(
      'Microsoft Sentinel Responder (or Contributor) on the Sentinel workspace',
      'Owner on the Azure subscription',
      'Reader on the Log Analytics workspace',
      'Storage Blob Data Owner on the workspace storage account'
    ),
    correct: ['a'],
    explanation: 'Sentinel Responder grants incident update permissions. Owner is excessive. Reader can\'t modify. Blob Data Owner is unrelated.',
    references: [REF_SENTINEL_RBAC, REF_PLAYBOOKS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You configured a custom analytics rule that should fire only when an entity matches a watchlist (e.g., "VIP users"). The query already joins with `_GetWatchlist("VIPUsers")`. What ELSE is required for the rule to expose the watchlist row context inside alerts?',
    options: opts4(
      'Project the watchlist columns alongside the source columns and map the entities so alert details and entity insights include the watchlist context',
      'Nothing — Sentinel automatically infers everything',
      'A separate diagnostic setting',
      'A Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Watchlist columns surface only if projected, and entities must be mapped explicitly on the analytics rule for entity insights to use them.',
    references: [REF_ANALYTICS_RULES, REF_HUNT_QUERIES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A SOC team wants Defender XDR to apply automatic attack disruption ONLY to a controlled subset of devices first as a pilot. Which scoping option exists today?',
    options: opts4(
      'Configure attack disruption automation scope via Defender XDR settings to target a specific device group',
      'Use a Conditional Access named location',
      'Use a Sentinel watchlist of device names',
      'Disable threat analytics for non-pilot devices'
    ),
    correct: ['a'],
    explanation: 'Attack disruption can be scoped to selected device groups in Defender XDR settings, supporting pilots. CA named locations, watchlists, and threat analytics toggles don\'t scope automation.',
    references: [REF_ATTACK_DISRUPT, REF_MDE_DEVICE_GROUPS]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Sentinel Data lake tier.',
    options: opts4(
      'It is intended for cost-optimized long-term retention of high-volume security data.',
      'You query it using KQL jobs (search jobs / interactive jobs).',
      'Analytics rules can run directly on Data-lake-tier data without lifting it to Analytics tier.',
      'It coexists with the Analytics tier in the same Sentinel workspace.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Data lake is for long-term low-cost retention, queried via KQL jobs, in the same workspace as Analytics. Analytics rules generally need data in the Analytics tier; lifting via summary/KQL jobs is required for Data-lake-only data.',
    references: [REF_SENTINEL_DATA_LAKE, REF_KQL_JOBS, REF_SUMMARY_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enrich Defender XDR alerts about an Entra user with HR data (department, manager, country) from your HR system. Which Sentinel construct is well-suited to this enrichment for analytics and hunting?',
    options: opts4(
      'A watchlist populated from the HR system CSV/export, joined in analytics rules and hunting queries',
      'A diagnostic setting on the workspace',
      'A KQL function defined in Defender XDR custom detections',
      'A Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Watchlists are the standard reference-data store for analyst enrichment, joinable from KQL. Diagnostic settings, AV exclusions, and XDR functions are unrelated.',
    references: [REF_HUNT_QUERIES, REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable Defender for Cloud\'s "Logical-network mapping" / "Cloud Security Posture Management" recommendations. What signals does it use?',
    options: opts4(
      'Cloud configuration and resource graph data from the connected subscriptions (Azure/AWS/GCP) compared to security baselines',
      'On-device endpoint telemetry only',
      'Microsoft Graph mailbox data',
      'Sentinel KQL job output'
    ),
    correct: ['a'],
    explanation: 'CSPM evaluates cloud configuration posture across connected environments against benchmarks. Endpoint telemetry feeds workload protection (different plan). Mailboxes and KQL jobs are unrelated.',
    references: [REF_MDC, REF_MDC_SERVERS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to confirm that an Azure Monitor Agent installation is healthy and receiving DCR-targeted data. Which workspace table indicates AMA heartbeat?',
    options: opts4(
      'Heartbeat',
      'AzureActivity',
      'AADSignInEventsBeta',
      'AzureMetrics'
    ),
    correct: ['a'],
    explanation: 'The Heartbeat table records agent heartbeats (Computer, AgentTypes, last seen). AzureActivity is subscription operations; AADSignInEventsBeta is Defender XDR sign-ins; AzureMetrics is platform metrics.',
    references: [REF_SENTINEL_AMA, REF_DCR]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want SOC analysts to be able to install a new content hub solution (e.g., Microsoft Sentinel Solution for Microsoft Entra ID) but NOT to delete workspaces. Which role provides solution-installation rights?',
    options: opts4(
      'Microsoft Sentinel Contributor on the workspace resource group / workspace',
      'Owner on the Azure subscription',
      'Microsoft Sentinel Reader on the workspace',
      'Storage Account Contributor on the workspace storage'
    ),
    correct: ['a'],
    explanation: 'Sentinel Contributor on the resource group / workspace can install solutions and create content. Owner is broader than needed. Reader can\'t install. Storage Contributor is unrelated.',
    references: [REF_SENTINEL_RBAC, REF_SENTINEL_CONNECTORS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want a Sentinel automation rule to trigger on incident UPDATE (e.g., status changed) — not just on creation. Which configuration achieves this?',
    options: opts4(
      'Set Trigger = "When incident is updated" and add condition(s) that fire on the relevant change',
      'Use a scheduled analytics rule',
      'Use a Conditional Access named location',
      'Configure workspace retention to 7 days'
    ),
    correct: ['a'],
    explanation: 'Automation rules support Trigger = updated, with conditional filters on changed fields. The other options don\'t pertain.',
    references: [REF_AUTOMATION_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want Microsoft Defender for Endpoint to upload sample files to Microsoft for analysis only on Windows servers, not on user laptops. Which mechanism allows per-group control?',
    options: opts4(
      'Device-group-targeted MDE configuration profiles (Intune / Defender) for sample submission behavior',
      'A Conditional Access policy',
      'A Sentinel automation rule',
      'A Power Automate flow'
    ),
    correct: ['a'],
    explanation: 'MDE configuration profiles (via Intune or Defender) target specific device groups for settings like sample submission. CA, automation rules, and Power Automate don\'t configure agent behavior.',
    references: [REF_MDE_ADVANCED, REF_MDE_DEVICE_GROUPS]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to ingest events from a non-Microsoft cloud (e.g., Cloudflare) without a built-in connector. Which Sentinel pattern is supported?',
    options: opts4(
      'Custom Logs Ingestion API + DCR + DCE (or codeless connector platform) to land events into a custom *_CL table',
      'Modify the SecurityEvent table schema',
      'Write directly to ThreatIntelligenceIndicator',
      'Use Conditional Access to route logs'
    ),
    correct: ['a'],
    explanation: 'The Logs Ingestion API (with DCR+DCE) or the codeless connector platform is the way to land custom logs. SecurityEvent schema is fixed. TI table is for indicators. CA doesn\'t route logs.',
    references: [REF_CUSTOM_LOGS, REF_DCR]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable the Microsoft Defender XDR connector in Sentinel to ingest Defender alerts and incidents. After enabling, the SecurityAlert and SecurityIncident tables receive Defender XDR data. What is the BEST analytics-rule pattern when also using Sentinel-native rules?',
    options: opts4(
      'Enable the "Microsoft Defender XDR incidents creation" rule to merge XDR incidents with Sentinel incidents in a unified queue',
      'Disable all Sentinel analytics rules',
      'Stop the connector and run Defender alerts via a Logic App',
      'Build a workbook tile only'
    ),
    correct: ['a'],
    explanation: 'The Microsoft Defender XDR incident-creation analytics rule unifies XDR and Sentinel incidents in one queue. Disabling rules or replacing with workbooks/Logic Apps doesn\'t unify incidents.',
    references: [REF_XDR, REF_SENTINEL_CONNECTORS, REF_INCIDENTS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure Defender for Endpoint Linux to receive auditd-based custom data collection. Which configuration object specifies the events to collect?',
    options: opts4(
      'A Defender for Endpoint custom file/process exclusions and audit collection profile applied via mdatp-managed config',
      'A Conditional Access policy',
      'Azure Policy assigned to the resource group',
      'A Sentinel hunting bookmark'
    ),
    correct: ['a'],
    explanation: 'MDE for Linux supports managed config (mdatp_managed.json) and configuration profiles for custom collection. CA is unrelated. Azure Policy governs Azure resources. Bookmarks save hunting state.',
    references: [REF_MDE_ADVANCED, REF_MDE_ONBOARD]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A custom analytics rule fires hundreds of low-severity alerts per day, drowning the SOC queue. Which combination is the recommended noise-reduction approach BEFORE disabling the rule?',
    options: opts4(
      'Refine the KQL to reduce false positives, configure alert grouping, and add suppression where benign repetition occurs',
      'Delete the source data',
      'Lower the workspace cap',
      'Disable Defender Antivirus'
    ),
    correct: ['a'],
    explanation: 'Tune the query first (more specific filters), enable alert grouping to collapse repeats, and use suppression for known benign windows. Deleting data, capping ingest, or disabling AV are not noise-reduction techniques.',
    references: [REF_ANALYTICS_RULES, REF_AUTOMATION_RULES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable Microsoft Defender Vulnerability Management add-on for non-MDE-managed servers. Which key feature does this unlock?',
    options: opts4(
      'Agent-based vulnerability assessment, security baseline assessment, and software inventory across discovered devices',
      'Replacing Microsoft Defender Antivirus',
      'Issuing X.509 certificates',
      'Disabling Conditional Access automatically'
    ),
    correct: ['a'],
    explanation: 'Defender Vulnerability Management provides agent-based VA, baseline assessment, and software inventory. It does not replace AV, issue certs, or change CA.',
    references: [REF_MDE_TVM]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A "Microsoft Sentinel" admin wants to allow the workspace to ingest data from a different Azure subscription where the source resource lives. The minimum permission setup is:',
    options: opts4(
      'Grant the workspace\'s collecting identity (e.g., AMA managed identity) Reader (or specific Read-resource) permission on the source resource/subscription, and configure the data connector / DCR accordingly',
      'Give the workspace Owner on the source subscription',
      'Make the source resource public',
      'Disable RBAC entirely'
    ),
    correct: ['a'],
    explanation: 'Cross-subscription ingestion uses delegated Reader permissions on the source side and a DCR routing data to the destination workspace. Owner is excessive. Public/Disable RBAC are insecure.',
    references: [REF_DCR, REF_DIAG_SETTINGS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to migrate a legacy on-prem syslog forwarder pattern to Sentinel. Which is the current Microsoft-recommended pattern for high-volume Linux syslog?',
    options: opts4(
      'Deploy a Linux VM running the Azure Monitor Agent with the Syslog via AMA connector and route via DCR',
      'Use the legacy OMS Linux agent with custom forwarding',
      'Bind syslog to a HTTP webhook in Logic Apps',
      'Direct workspace HTTPS POSTs from each Linux client'
    ),
    correct: ['a'],
    explanation: 'AMA + Syslog via AMA + DCR is the current pattern. OMS is being retired. Logic Apps/HTTPS approaches don\'t scale and aren\'t recommended.',
    references: [REF_SYSLOG_AMA, REF_DCR]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You configure an MDE custom detection rule with a query that returns DeviceId and SHA-256. The rule should run every 24 hours and look back 7 days. Which control on the rule limits how often the same finding generates duplicate alerts?',
    options: opts4(
      'Suppression behavior on the rule (alert grouping / dedupe by DeviceId+SHA-256)',
      'Workspace retention',
      'Conditional Access sign-in frequency',
      'Defender Antivirus exclusion'
    ),
    correct: ['a'],
    explanation: 'Custom detection rules support deduplication / grouping configuration to avoid repeating identical alerts. The other options aren\'t about alert dedup.',
    references: [REF_CUSTOM_DETECT, REF_ANALYTICS_RULES]
  },
  {
    domain: MANAGE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Sentinel SOC optimization.',
    options: opts4(
      'It recommends actions to improve coverage of specific threats and to optimize cost.',
      'It can suggest enabling specific data connectors that increase MITRE ATT&CK coverage.',
      'It rewrites your existing analytics rules automatically.',
      'It is informed by your tenant\'s ingested data and existing detections.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'SOC optimization recommends coverage and cost improvements based on your data and detections. It does NOT rewrite analytics rules — recommendations are suggestions, not automatic edits.',
    references: [REF_SENTINEL_SOC_OPT]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You enable Microsoft Sentinel User and Entity Behavior Analytics (UEBA). What does UEBA produce that helps hunting and analytics?',
    options: opts4(
      'BehaviorAnalytics and IdentityInfo tables that enrich users/entities with baseline behavior and risk',
      'A new Conditional Access policy per user',
      'A workspace cross-region replica',
      'A list of expired certificates'
    ),
    correct: ['a'],
    explanation: 'UEBA populates BehaviorAnalytics, IdentityInfo, and related tables that surface anomalies and enrich entities. The other options are unrelated.',
    references: [REF_SENTINEL_CONNECTORS, REF_HUNT_QUERIES]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to control whether MDE collects file evidence beyond the file hash (e.g., the file itself for cloud detonation). Which Advanced features toggle covers this?',
    options: opts4(
      'Sample submission / Cloud-delivered protection (and related "Allow or block file")',
      'Network protection only',
      'Tamper protection only',
      'Web content filtering only'
    ),
    correct: ['a'],
    explanation: 'Sample submission with cloud-delivered protection controls automatic file upload for detonation. The other features address different protections.',
    references: [REF_MDE_ADVANCED]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A SOC team wants to ingest Microsoft Graph activity logs into Sentinel for tenant-wide hunting. Which connector is appropriate?',
    options: opts4(
      'Microsoft Graph activity logs connector (or diagnostic settings on the Microsoft Graph activity logs feature)',
      'AzureActivity connector',
      'Office 365 connector (Exchange + SharePoint)',
      'Defender for Endpoint streaming API'
    ),
    correct: ['a'],
    explanation: 'Microsoft Graph activity logs have a dedicated connector (or are routed via diagnostic settings) and land in MicrosoftGraphActivityLogs. AzureActivity covers Azure subscriptions, O365 connector covers email/SharePoint, MDE streaming is endpoint telemetry.',
    references: [REF_GRAPH_ACTIVITY, REF_SENTINEL_CONNECTORS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to use MDE Web content filtering to block "Gambling" category sites tenant-wide. Where is this configured?',
    options: opts4(
      'Defender portal > Settings > Endpoints > Web content filtering (then apply the policy to a device group)',
      'Microsoft Sentinel > Workbooks',
      'Microsoft Purview > Audit',
      'Conditional Access > Named locations'
    ),
    correct: ['a'],
    explanation: 'Web content filtering is configured under Endpoints settings and applied via policy to device groups. Workbooks, Purview Audit, and CA Named locations aren\'t web filters.',
    references: [REF_MDE_ADVANCED, REF_MDE_DEVICE_GROUPS]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel analytics rule produces alerts but you want enrichment with a custom risk score before incident creation. Which is the supported approach inside the rule?',
    options: opts4(
      'Project a custom column (e.g., RiskScore = case(...)) in the KQL and surface it in alert details / entity mapping',
      'Add a Logic App that re-writes alerts',
      'Use a Power Automate flow to modify the SecurityAlert row',
      'Use a workbook formula'
    ),
    correct: ['a'],
    explanation: 'In-query enrichment via projected columns is the cleanest in-rule path. Logic Apps and Power Automate can post-process alerts/incidents but the per-alert enrichment ideally lives in the KQL. Workbooks don\'t alter alerts.',
    references: [REF_ANALYTICS_RULES, REF_KQL]
  },
  {
    domain: MANAGE, difficulty: 2, type: QType.SINGLE,
    stem: 'You want SOC leadership to receive a single weekly digest of incident metrics (created, resolved, MTTR). The simplest Microsoft-native approach is:',
    options: opts4(
      'A Sentinel workbook saved as a PDF or shared via a scheduled Logic App that exports workbook content',
      'A Conditional Access weekly report',
      'A Microsoft 365 Group post each week typed manually',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Workbooks are the native dashboard surface; export via Logic Apps or scheduled snapshot is the simplest path. CA, manual posts, and MDCA logs aren\'t the right tooling.',
    references: [REF_SENTINEL_WORKBOOKS, REF_PLAYBOOKS]
  },

  // ── Respond to security incidents (26) ──
  {
    domain: RESPOND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'During a BEC investigation, you find that an attacker created a mailbox rule that moves messages from "ceo@partner.com" to RSS Subscriptions. What is the FIRST containment step?',
    options: opts4(
      'Delete the inbox rule, reset the user\'s credentials, revoke active sessions, then audit outbound emails for fraud',
      'Block all inbound email from partner.com',
      'Disable Conditional Access for the tenant',
      'Increase workspace retention'
    ),
    correct: ['a'],
    explanation: 'Remove the malicious rule, rotate creds, revoke sessions, then forensic on outbound mail. Blocking inbound from a legit partner harms business. Disabling CA worsens posture. Retention is irrelevant.',
    references: [REF_MDO_ANTIPHISH, REF_IDPROTECT_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Identity "Suspected golden ticket usage" alert fires. Containment must include:',
    options: opts4(
      'Resetting the KRBTGT account password twice (with the appropriate delay between resets) and isolating impacted devices',
      'Disabling LDAP signing',
      'Removing all Domain Admins from the tenant',
      'Disabling Microsoft Sentinel'
    ),
    correct: ['a'],
    explanation: 'Golden Ticket abuses KRBTGT — the documented remediation is a double KRBTGT reset (with replication wait between) plus isolation of impacted hosts. The others don\'t address the credential abuse.',
    references: [REF_MDI_ALERTS, REF_MDI_LATERAL]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You investigate an alert in Defender for Cloud about a suspicious Key Vault access pattern. Defender for Key Vault flags repeated denied access attempts followed by a successful access from an unusual IP. Which response action is most direct?',
    options: opts4(
      'Rotate Key Vault secrets/keys, scope access via private endpoint and tighter access policies (or RBAC), and review audit logs for misuse',
      'Delete the Key Vault',
      'Disable Defender for Cloud',
      'Add the IP to a Conditional Access trusted location'
    ),
    correct: ['a'],
    explanation: 'Rotation, tightening access (private endpoint, fewer principals), and audit log review are the right containment. Deletion is destructive; disabling MDC removes detection; trusting the bad IP is wrong.',
    references: [REF_MDC, REF_MDC_ALERTS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'Defender for Endpoint detects "Suspicious WMI persistence" on a Linux server. Which response action collects forensic state for offline analysis?',
    options: opts4(
      'Run "Collect investigation package" on the device',
      'Disable the device\'s network card via DHCP',
      'Stop the Defender Antivirus engine',
      'Open a Conditional Access What-if'
    ),
    correct: ['a'],
    explanation: 'Collect investigation package gathers persistence artifacts, scheduled tasks (cron on Linux), services, and processes. The other options either don\'t preserve evidence or are unrelated.',
    references: [REF_MDE_INVESTIGATION_PKG, REF_MDE_TIMELINE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A Microsoft Defender XDR incident shows two related alerts: an Entra ID "impossible travel" detection and a Defender for Cloud Apps "Activity from infrequent country". Which classification helps Microsoft\'s detection models the most?',
    options: opts4(
      'Classify the incident as True positive with the right determination (e.g., compromised user/SaaS abuse)',
      'Delete the incident immediately',
      'Disable both detections',
      'Mark all alerts as informational'
    ),
    correct: ['a'],
    explanation: 'Classifying TP + determination provides high-quality feedback to Microsoft\'s detection models and to your own metrics. Deleting, disabling, or downgrading robs the model of signal.',
    references: [REF_INCIDENTS, REF_IDPROTECT_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'During an MDE investigation, you discover a malicious scheduled task. To stop the persistence WITHOUT triggering AIR rollbacks across other artifacts, which targeted action is best?',
    options: opts4(
      'Use Live Response to delete the scheduled task and the dropped binary on that single device',
      'Re-image every device in the OU',
      'Run a tenant-wide AV full scan',
      'Reset the user\'s password only'
    ),
    correct: ['a'],
    explanation: 'Live response surgically removes the artifact on the affected device. Re-imaging is excessive; tenant-wide scan is broad; password reset alone doesn\'t address local persistence.',
    references: [REF_MDE_LIVE_RESPONSE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel incident is created from a Defender for Cloud Apps anomaly. You want the same response action (Suspend user, Revoke OAuth grant) AUTOMATICALLY for all similar incidents. The supported pattern is:',
    options: opts4(
      'A Sentinel automation rule that runs a playbook (Logic App) calling Entra ID + MDCA APIs to perform the actions',
      'A scheduled analytics rule with severity Informational',
      'A Conditional Access trusted location update',
      'A workbook with a parameter'
    ),
    correct: ['a'],
    explanation: 'Automation rules + playbooks are the standard for end-to-end automated response. Scheduled rules detect, CA controls access, workbooks visualize.',
    references: [REF_AUTOMATION_RULES, REF_PLAYBOOKS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to export evidence for an MDE incident (process tree, file events, network events) for the legal team. What is the supported way?',
    options: opts4(
      'Use the incident/alert export options in the Defender portal (e.g., download details, run AH queries and export CSV)',
      'Screenshot the portal pages',
      'Send the workspace ID to legal',
      'Disable retention so logs are wiped'
    ),
    correct: ['a'],
    explanation: 'Portal export + Advanced Hunting CSV export are the supported evidence flows. Screenshots are fragile, workspace IDs aren\'t evidence, and wiping logs destroys evidence.',
    references: [REF_INCIDENTS, REF_HUNTING]
  },
  {
    domain: RESPOND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL response actions that automatic attack disruption can perform without analyst approval (when criteria are met).',
    options: opts4(
      'Disable a compromised user account',
      'Isolate (contain) a compromised device',
      'Disable Conditional Access policies tenant-wide',
      'Block a specific malicious IP via custom indicator'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Attack disruption can disable users, contain devices, and block indicators. It will NOT disable Conditional Access policies tenant-wide.',
    references: [REF_ATTACK_DISRUPT, REF_AIR]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Sentinel analyst is investigating an incident and uses Copilot for Security to draft a closure summary. After analyst review and edits, where should the summary be posted?',
    options: opts4(
      'In the incident comments (and the incident resolution / determination fields) so future analysts have the context',
      'In an email to leadership only',
      'In a Teams chat only',
      'In a private OneNote notebook'
    ),
    correct: ['a'],
    explanation: 'Persisting investigation context in the incident itself is the SOC-of-record. Email/Teams/OneNote may complement but should not replace the incident record.',
    references: [REF_INCIDENTS, REF_CASE_MGMT, REF_COPILOT_SEC]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'After a confirmed phishing incident, you want to track training compliance for affected users. Which Defender for Office 365 feature assigns and tracks training?',
    options: opts4(
      'Attack simulation training (assign training to users)',
      'Microsoft Purview eDiscovery hold',
      'Defender for Cloud Apps governance log',
      'Conditional Access named location'
    ),
    correct: ['a'],
    explanation: 'Attack simulation training assigns and tracks specific user training modules. The other features serve unrelated purposes.',
    references: [REF_MDO]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You investigate a Defender for Cloud "Suspicious authentication from Tor" against an Azure SQL DB. Which response is BEST aligned to containment?',
    options: opts4(
      'Rotate credentials, restrict network access (VNet, Private Link, firewall rules), and review SQL audit logs for malicious activity',
      'Drop the database immediately',
      'Disable Defender for SQL',
      'Promote SQL to a new region'
    ),
    correct: ['a'],
    explanation: 'Rotate creds, tighten network (VNet rules, Private Link), and review audit logs. Dropping/migrating is destructive. Disabling Defender for SQL removes detection.',
    references: [REF_MDC_ALERTS, REF_MDC]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to confirm whether a malicious file blocked by MDE is present anywhere else in the tenant. Which Advanced Hunting query column is the right starting point?',
    options: opts4(
      'SHA256 in DeviceFileEvents (and DeviceImageLoadEvents)',
      'AccountUpn in EmailEvents',
      'AssetId in CloudAppEvents',
      'Domain in IdentityInfo'
    ),
    correct: ['a'],
    explanation: 'SHA256 in file/image-load tables is the canonical pivot for finding the same file across devices. The other options pivot on different artifact types.',
    references: [REF_HUNTING, REF_AH_SCHEMA]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'After Defender XDR auto-disrupted an active ransomware-pattern attack, the SOC must:',
    options: opts4(
      'Review the disruption actions, confirm scope, and decide whether to re-enable the affected entities once forensics is complete',
      'Disable Defender XDR for the tenant',
      'Bypass MFA on affected users to "get back to work" quickly',
      'Delete the SecurityIncident rows'
    ),
    correct: ['a'],
    explanation: 'After disruption, analysts validate scope and remediate before re-enabling identities/devices. Disabling XDR, bypassing MFA, or deleting records is wrong.',
    references: [REF_ATTACK_DISRUPT, REF_AIR]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Cloud Apps "Suspicious OAuth app" alert flags a malicious third-party application granted broad Graph permissions across the tenant. Which action removes the app\'s access at the tenant level?',
    options: opts4(
      'Revoke the OAuth app consent (disable the enterprise application / service principal in Entra ID)',
      'Suspend each consenting user one by one',
      'Disable Microsoft Defender Antivirus',
      'Block all inbound email'
    ),
    correct: ['a'],
    explanation: 'Revoke the OAuth grant (disable the SP / remove consent) removes the app\'s tenant-wide access. The other options don\'t address the OAuth grant.',
    references: [REF_MDCA_POLICIES, REF_IDPROTECT_INVESTIGATE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You need to ensure that incident closure determinations roll up to reporting accurately. Which Defender XDR field MUST be set on close to feed the right learning loop?',
    options: opts4(
      'Classification (True/False positive, Informational) and Determination (e.g., Malware, Phishing, Compromised user)',
      'Severity only',
      'Display name only',
      'Workspace ID only'
    ),
    correct: ['a'],
    explanation: 'Classification + Determination at close drive metrics and model learning. Severity is set during creation. Display name and workspace ID are not classification fields.',
    references: [REF_INCIDENTS, REF_XDR_PORTAL]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'In Sentinel, you receive an incident from a TI-matched rule that says an internal host contacted a known C2. The right SOC pivot is to:',
    options: opts4(
      'Pivot to the host\'s activity (DeviceNetworkEvents) and to the user(s) signed in (DeviceLogonEvents / SigninLogs) to scope blast radius',
      'Increase TI feed cost only',
      'Open a Conditional Access What-if',
      'Disable MDI'
    ),
    correct: ['a'],
    explanation: 'Pivot to host network activity and signed-in identities to map blast radius. The other options don\'t investigate.',
    references: [REF_HUNTING, REF_INCIDENTS]
  },
  {
    domain: RESPOND, difficulty: 3, type: QType.SINGLE,
    stem: 'A SOC analyst opens an incident showing a Defender XDR alert from MDE and a Sentinel alert from a custom KQL rule. Both reference the same DeviceId. What enables them to be in a single incident?',
    options: opts4(
      'Sentinel + Defender XDR unification: shared entity (DeviceId) correlation across SecurityAlert and Defender XDR alerts',
      'A workspace cross-region replica',
      'Manual analyst merging of two separate incidents only',
      'A Conditional Access merge rule'
    ),
    correct: ['a'],
    explanation: 'Unified incident creation correlates alerts sharing entities across XDR and Sentinel sources. Manual merging is an alternative but the unification handles common shared-entity cases automatically.',
    references: [REF_INCIDENTS, REF_XDR_CORRELATE, REF_SENTINEL_INCIDENTS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You investigate an MDE alert "Suspicious connection to public proxy". Live response shows a process named "powershell.exe" with a base64-encoded command line. The right next step is to:',
    options: opts4(
      'Capture the command line, decode the base64 payload offline, identify the malicious script, and proceed with file/process containment',
      'Skip decoding and immediately delete the device',
      'Re-image without preserving evidence',
      'Apply a Conditional Access policy to the device'
    ),
    correct: ['a'],
    explanation: 'Decode base64 to understand intent, then contain. Skipping investigation and destroying evidence is wrong. CA is identity-side, not relevant here.',
    references: [REF_MDE_LIVE_RESPONSE, REF_MDE_TIMELINE]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'Defender XDR shows an MDO alert about a phishing email containing a Safe Links wrapped URL. The user clicked but Safe Links blocked the page. What did the user actually experience?',
    options: opts4(
      'A Microsoft "page blocked" warning page when navigating to the unsafe URL',
      'A successful page load and downloaded file',
      'Their mailbox was disabled',
      'They were prompted for MFA on every site for 24 hours'
    ),
    correct: ['a'],
    explanation: 'Safe Links rewrites URLs and, at click time, blocks navigation to unsafe destinations with a warning page. The other options aren\'t Safe Links behaviors.',
    references: [REF_MDO_SAFELINK, REF_MDO]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Cloud alert "Anomalous traffic from your VM to known malicious IPs" arrives. The most useful immediate Defender for Cloud response is:',
    options: opts4(
      'Quarantine/isolate the VM using NSG-based segmentation (or "Restrict" via Just-in-Time VM access) and start a forensic capture',
      'Add the malicious IP to Conditional Access trusted locations',
      'Increase the VM size',
      'Disable Defender for Cloud'
    ),
    correct: ['a'],
    explanation: 'Network isolation (NSG / JIT lockdown) contains; forensic capture preserves evidence. CA "trusted location" is wrong; resizing doesn\'t contain; disabling MDC removes detection.',
    references: [REF_MDC_ALERTS, REF_MDC_SERVERS]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You investigate a Purview Insider risk alert "User sent confidential information to a personal account before resignation". Which combination of actions is appropriate?',
    options: opts4(
      'Coordinate with HR and Legal; preserve evidence via eDiscovery hold; review user activity in Insider risk and Audit',
      'Email the user a warning and close the case',
      'Delete the user\'s mailbox immediately',
      'Disable Defender Antivirus for the tenant'
    ),
    correct: ['a'],
    explanation: 'Insider-risk-with-data-egress requires HR/Legal coordination, preservation (hold), and disciplined review. Quick warnings, mailbox deletion, or disabling AV are inappropriate.',
    references: [REF_PURVIEW_INSIDER, REF_CONTENT_SEARCH, REF_PURVIEW_AUDIT]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to give an MSSP read-only access to your Sentinel incidents in your tenant via Microsoft Sentinel\'s multi-tenant scenarios. The recommended access model is:',
    options: opts4(
      'Azure Lighthouse delegated resource management with least-privilege Sentinel roles scoped to the workspace',
      'Sending a copy of every incident via email',
      'Sharing your Global Administrator password',
      'Disabling MFA for the MSSP'
    ),
    correct: ['a'],
    explanation: 'Azure Lighthouse + least-privilege Sentinel roles is the supported MSSP pattern. The other choices are insecure.',
    references: [REF_SENTINEL_RBAC, REF_SENTINEL]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender XDR incident\'s "AI analyst" (Copilot for Security) suggests a KQL hunt to find related lateral movement. The analyst should:',
    options: opts4(
      'Review the suggested KQL, run it in Advanced Hunting (or as a hunting query in Sentinel), validate results, and pivot accordingly',
      'Disable the suggestion feature',
      'Forward the suggestion to the user under investigation',
      'Replace the analytics rule with the suggestion'
    ),
    correct: ['a'],
    explanation: 'Copilot suggestions are starting points — review and run them in AH/Hunting, validate, and pivot. The other options misuse the feature.',
    references: [REF_COPILOT_SEC, REF_HUNTING]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'After resolving an incident, you want to bookmark the KQL query used to find the original IOC so future hunts can re-run it. In Sentinel, the right artifact is:',
    options: opts4(
      'Save the query as a hunting query (and optionally promote to a custom detection / analytics rule if appropriate)',
      'Email the KQL to the SOC distribution list',
      'Copy the KQL into a Teams chat',
      'Store the KQL only in a personal text file'
    ),
    correct: ['a'],
    explanation: 'Hunting queries persist as searchable, runnable artifacts and can become detections. Email/Teams/text files lose discoverability and execution.',
    references: [REF_HUNT_QUERIES, REF_CUSTOM_DETECT]
  },
  {
    domain: RESPOND, difficulty: 2, type: QType.SINGLE,
    stem: 'A Defender for Endpoint alert "Tampering activity detected on the device" indicates someone attempted to disable security controls on a managed device. Which configuration helps PREVENT recurrence without removing legitimate IT scripts?',
    options: opts4(
      'Enable Tamper protection in MDE (locks security settings against malicious change) and restrict who can modify Defender configuration via Intune / GPO',
      'Disable Microsoft Defender Antivirus entirely',
      'Remove all device groups',
      'Disable Conditional Access for the tenant'
    ),
    correct: ['a'],
    explanation: 'Tamper protection prevents unauthorized changes to security settings; combine with restricted Intune/GPO admin to prevent legitimate-channel abuse. Disabling AV, removing groups, or disabling CA all weaken posture.',
    references: [REF_MDE_ADVANCED, REF_MDE_DEVICE_GROUPS]
  },

  // ── Perform threat hunting (13) ──
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You want to identify devices where a process spawned cmd.exe from a Microsoft Office process within the last 7 days. Which KQL pattern fits?',
    options: opts4(
      'DeviceProcessEvents | where Timestamp > ago(7d) | where InitiatingProcessFileName in~ ("winword.exe","excel.exe","powerpnt.exe","outlook.exe") and FileName =~ "cmd.exe"',
      'DeviceLogonEvents | where ActionType == "LogonSuccess"',
      'EmailEvents | where ThreatTypes has "Malware"',
      'IdentityInfo | where City == "Redmond"'
    ),
    correct: ['a'],
    explanation: 'Parent (Initiating) Office process spawning cmd.exe is a classic LOLBin pattern detected via DeviceProcessEvents with where on InitiatingProcessFileName + FileName.',
    references: [REF_HUNTING, REF_AH_SCHEMA, REF_KQL]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which KQL function returns the count of distinct values of a column inside summarize?',
    options: opts4(
      'dcount(column)',
      'distinct column',
      'count() by column',
      'project column'
    ),
    correct: ['a'],
    explanation: 'dcount(column) returns approximate distinct count inside summarize. `distinct column` removes duplicate rows. `count() by column` aggregates rows per value. project selects columns.',
    references: [REF_KQL]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to enumerate identities that recently authenticated to Active Directory and look for unusual logon types. Which Advanced Hunting table is the right primary source?',
    options: opts4(
      'IdentityLogonEvents (on-prem AD and Entra ID logon events via Defender for Identity)',
      'DeviceProcessEvents',
      'EmailEvents',
      'CloudAppEvents'
    ),
    correct: ['a'],
    explanation: 'IdentityLogonEvents (MDI) shows AD and Entra logon events. The other tables cover endpoints, email, or SaaS apps.',
    references: [REF_AH_SCHEMA, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You convert a hunting query into a CUSTOM DETECTION RULE in Defender XDR. The rule projects DeviceId. Which response action becomes available BECAUSE of that projection?',
    options: opts4(
      'Device-level remediation (e.g., isolate, run AV scan) when the rule fires',
      'Auto-DELETE the user\'s mailbox',
      'Auto-RESET the user\'s phone',
      'Auto-MIGRATE the device to another tenant'
    ),
    correct: ['a'],
    explanation: 'Mapping the DeviceId entity unlocks device-targeted response actions on the rule. Mailbox/phone/tenant actions aren\'t available regardless of entity mapping.',
    references: [REF_CUSTOM_DETECT, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 3, type: QType.SINGLE,
    stem: 'A summarized Sentinel anomaly result fires on a host but you want to enrich it with full DeviceInfo at hunt time. Which join pattern is correct?',
    options: opts4(
      'AnomalyRow | join kind=leftouter (DeviceInfo | summarize arg_max(Timestamp, *) by DeviceId) on DeviceId',
      'AnomalyRow | join (DeviceInfo) on DeviceName == DeviceId',
      'AnomalyRow | distinct DeviceId',
      'AnomalyRow | project AlertId'
    ),
    correct: ['a'],
    explanation: 'arg_max(Timestamp, *) by DeviceId selects the most recent device record before joining — a common enrichment pattern. The other options join on wrong keys or don\'t enrich.',
    references: [REF_KQL, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A hunter wants ad-hoc, interactive Python over Sentinel data with a notebook-driven investigation. The supported pattern is:',
    options: opts4(
      'Use a Sentinel Notebook running on Azure ML, with MSTICPy installed for queries and visualizations',
      'Open Excel and paste CSV rows',
      'Use Conditional Access to query data',
      'Use a Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Sentinel Notebooks (Jupyter on Azure ML) with MSTICPy is the Microsoft-supported analyst notebook surface. Excel, CA, and MDCA logs aren\'t hunting notebooks.',
    references: [REF_NOTEBOOKS]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to identify all OAuth applications consented in the last 30 days with broad Microsoft Graph scopes. Which Microsoft Graph activity / audit data and which table is relevant?',
    options: opts4(
      'AuditLogs (Entra) for "Consent to application" events, joined with ServicePrincipalSignInLogs and Microsoft Graph activity logs for usage',
      'DeviceFileEvents only',
      'EmailUrlInfo only',
      'AzureActivity only'
    ),
    correct: ['a'],
    explanation: 'Entra AuditLogs records consents; SP sign-ins and Graph activity reveal usage. Endpoint/email/Azure activity tables don\'t cover OAuth consent.',
    references: [REF_GRAPH_ACTIVITY, REF_HUNTING]
  },
  {
    domain: HUNT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Microsoft Sentinel hunting bookmarks.',
    options: opts4(
      'Bookmarks save query results, KQL, and entity mappings.',
      'Bookmarks can be promoted to incidents.',
      'Bookmarks automatically delete after 24 hours.',
      'Bookmarks can be queried via the HuntingBookmark table for analysis or hunting.'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Bookmarks save query+results+entities, can be promoted to incidents, and are queryable as HuntingBookmark. They do NOT auto-delete after 24 hours.',
    references: [REF_HUNT_QUERIES]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to share a hunting query with the SOC and let teammates run it with their own time-range parameters. Which Sentinel feature supports parameterized queries shared in the workspace?',
    options: opts4(
      'Save the query as a hunting query (where it appears in the gallery, executable by anyone with Sentinel access)',
      'Email the query as plain text',
      'Convert to a Logic App',
      'Convert to a Conditional Access policy'
    ),
    correct: ['a'],
    explanation: 'Hunting queries live in the workspace and are runnable by Sentinel users. Email loses versioning; Logic Apps and CA aren\'t hunting surfaces.',
    references: [REF_HUNT_QUERIES, REF_KQL]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'A hunter wants to find every device that loaded a specific DLL signed with a stolen code-signing certificate within the last 180 days. Default Analytics-tier retention is 90 days. Which feature can run KQL across data beyond the Analytics retention?',
    options: opts4(
      'KQL jobs against Data lake-tier data',
      'Hunting bookmarks',
      'Conditional Access What-if',
      'Defender Antivirus offline scan'
    ),
    correct: ['a'],
    explanation: 'KQL jobs (search jobs) run against Data lake-tier data for long-look-back hunts. Bookmarks save findings, CA What-if simulates policy, AV offline scan is endpoint cleanup.',
    references: [REF_KQL_JOBS, REF_SENTINEL_DATA_LAKE]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which KQL operator joins two tables and keeps only matching rows from both?',
    options: opts4(
      'join kind=inner (default)',
      'union',
      'distinct',
      'render'
    ),
    correct: ['a'],
    explanation: 'kind=inner returns only rows with matches in both. union concatenates rows from multiple sources. distinct dedupes. render visualizes.',
    references: [REF_KQL, REF_AH_BEST]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to expose hunting queries and Sentinel data to a Model Context Protocol (MCP)-aware AI hunter. Which Microsoft endpoint exposes Sentinel context to MCP clients?',
    options: opts4(
      'Microsoft Sentinel MCP Server',
      'Defender for Endpoint streaming API only',
      'A direct SQL connection',
      'A standalone Functions endpoint with anonymous auth'
    ),
    correct: ['a'],
    explanation: 'Sentinel MCP Server is the supported MCP endpoint for Sentinel data and operations. The other options don\'t fit.',
    references: [REF_SENTINEL_MCP, REF_NOTEBOOKS]
  },
  {
    domain: HUNT, difficulty: 2, type: QType.SINGLE,
    stem: 'You want to interpret an entity\'s "blast radius" in the Defender portal — what other identities, devices, files, and mailboxes it touched in a 7-day window. The recommended capability is:',
    options: opts4(
      'Sentinel Graph hunting graphs (XDR entity relationships visualization)',
      'A Workbook tile',
      'A Conditional Access What-if',
      'A Defender for Cloud Apps governance log'
    ),
    correct: ['a'],
    explanation: 'Sentinel Graph hunting graphs are purpose-built for blast-radius investigations. Workbooks/CA/MDCA aren\'t this capability.',
    references: [REF_SENTINEL_GRAPH, REF_HUNT_GRAPHS, REF_BLAST_RADIUS]
  }
];

const SC200_DOMAINS = [
  { name: MANAGE, weight: 40 },
  { name: RESPOND, weight: 40 },
  { name: HUNT, weight: 20 }
];

const SC200_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-sc-200-p1',
    code: 'SC-200-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 100-minute, 65-question, blueprint-weighted set covering managing a security operations environment (Defender XDR + Sentinel automation, ingestion, detections), responding to security incidents, and performing threat hunting with KQL and Sentinel Graph.',
    questions: P1
  },
  {
    slug: 'microsoft-sc-200-p2',
    code: 'SC-200-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 100-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-sc-200-p3',
    code: 'SC-200-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 100-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const SC200_BUNDLE = {
  slug: 'microsoft-sc-200',
  title: 'Microsoft Security Operations Analyst (SC-200)',
  description: 'All 3 SC-200 practice exams in one bundle — covering managing a security operations environment (Defender XDR + Sentinel automation, SIEM platform configuration, data ingestion, and detection engineering), responding to security incidents across Defender XDR and Microsoft Defender for Endpoint, and performing threat hunting with KQL, Sentinel Graph, hunting notebooks, and the Sentinel MCP Server. Aligned to the official Microsoft Security Operations Analyst (SC-200) study guide (skills measured as of April 16, 2026).',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the SC-200 bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:sc200-seed'` are deleted and re-created.
 *
 * Also wipes any pre-existing questions on sc-200-p1/p2/p3 with a
 * different generatedBy tag — the previous 5-variant × 60Q product-axis
 * pool used multiple tags from prior generations.
 */
export async function seedSc200(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security operations, identity, and the role-based certification track including the Microsoft Security Operations Analyst (SC-200) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Azure, Microsoft 365, security operations, identity, and the role-based certification track including the Microsoft Security Operations Analyst (SC-200) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of SC200_EXAMS) {
    const title = `Microsoft Security Operations Analyst (SC-200) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the official Microsoft SC-200 study guide.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 100,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: SC200_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    // Wipe ALL existing questions on these slugs — the legacy 5-variant pool
    // used the deprecated product-axis domain structure (Defender XDR /
    // Defender for Cloud / Sentinel) which is no longer valid.
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
          generatedBy: 'manual:sc200-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: SC200_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: SC200_BUNDLE.slug },
    update: {
      title: SC200_BUNDLE.title,
      description: SC200_BUNDLE.description,
      price: SC200_BUNDLE.price,
      priceVoucher: SC200_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: SC200_BUNDLE.slug,
      title: SC200_BUNDLE.title,
      description: SC200_BUNDLE.description,
      price: SC200_BUNDLE.price,
      priceVoucher: SC200_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-sc-200-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-sc-200-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-sc-200-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-sc-200-p1', tier: 'VOUCHER' as const, position: 4 }
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
