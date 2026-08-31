/**
 * PL-900 bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:pl900-seed'` and upserts catalog rows.
 *
 * Exported as `seedPl900(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/pl900.ts`) and the protected
 * admin API (`/api/admin/seed-pl900`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public Microsoft Learn
 * PL-900 study guide and Power Platform documentation, and the
 * Microsoft Power Platform Fundamentals (PL-900) domain blueprint:
 *   - Describe the Business Value of Power Platform                 — 20% (13)
 *   - Identify Core Components of Power Platform                     — 20% (13)
 *   - Demonstrate the Capabilities of Power Apps                     — 15% (10)
 *   - Demonstrate the Capabilities of Power Automate                 — 15% (10)
 *   - Demonstrate the Capabilities of Power BI                       — 15% (10)
 *   - Demonstrate the Capabilities of Power Pages and Copilot Studio — 15% (9)
 *
 * These are original, scenario-based study questions — they are not
 * copies of any live Microsoft exam and make no claim to be the real
 * certification exam.
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

const BUSVAL = 'Describe the Business Value of Power Platform';
const CORE = 'Identify Core Components of Power Platform';
const APPS = 'Demonstrate the Capabilities of Power Apps';
const FLOW = 'Demonstrate the Capabilities of Power Automate';
const BI = 'Demonstrate the Capabilities of Power BI';
const PAGES = 'Demonstrate the Capabilities of Power Pages and Copilot Studio';

const REF_PP_OVERVIEW = { label: 'Microsoft Learn — What is Microsoft Power Platform?', url: 'https://learn.microsoft.com/en-us/power-platform/' };
const REF_PP_BUSVAL = { label: 'Microsoft Learn — Describe the business value of Power Platform', url: 'https://learn.microsoft.com/en-us/training/paths/power-plat-business-value/' };
const REF_PP_CORE = { label: 'Microsoft Learn — Identify the core components of Power Platform', url: 'https://learn.microsoft.com/en-us/training/paths/power-plat-core-components/' };
const REF_DATAVERSE = { label: 'Microsoft Learn — What is Microsoft Dataverse?', url: 'https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro' };
const REF_CONNECTORS = { label: 'Microsoft Learn — Connectors overview', url: 'https://learn.microsoft.com/en-us/connectors/connectors' };
const REF_CONNECTOR_LICENSE = { label: 'Microsoft Learn — Standard and premium connectors', url: 'https://learn.microsoft.com/en-us/power-platform/admin/pricing-billing-skus' };
const REF_AIBUILDER = { label: 'Microsoft Learn — AI Builder overview', url: 'https://learn.microsoft.com/en-us/ai-builder/overview' };
const REF_PORTAL = { label: 'Microsoft Learn — Power Platform admin center', url: 'https://learn.microsoft.com/en-us/power-platform/admin/admin-documentation' };
const REF_ENV = { label: 'Microsoft Learn — Environments overview', url: 'https://learn.microsoft.com/en-us/power-platform/admin/environments-overview' };
const REF_DLP = { label: 'Microsoft Learn — Data loss prevention policies', url: 'https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention' };
const REF_CDS_SECURITY = { label: 'Microsoft Learn — Security concepts in Microsoft Dataverse', url: 'https://learn.microsoft.com/en-us/power-platform/admin/wp-security-cds' };
const REF_APPS_OVERVIEW = { label: 'Microsoft Learn — What is Power Apps?', url: 'https://learn.microsoft.com/en-us/power-apps/powerapps-overview' };
const REF_CANVAS = { label: 'Microsoft Learn — Create a canvas app from scratch', url: 'https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/data-platform-create-app-scratch' };
const REF_MODEL = { label: 'Microsoft Learn — Build a model-driven app', url: 'https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/build-first-model-driven-app' };
const REF_APP_TYPES = { label: 'Microsoft Learn — Types of apps in Power Apps', url: 'https://learn.microsoft.com/en-us/power-apps/maker/' };
const REF_POWERFX = { label: 'Microsoft Learn — Microsoft Power Fx overview', url: 'https://learn.microsoft.com/en-us/power-platform/power-fx/overview' };
const REF_FLOW_OVERVIEW = { label: 'Microsoft Learn — Get started with Power Automate', url: 'https://learn.microsoft.com/en-us/power-automate/getting-started' };
const REF_FLOW_TYPES = { label: 'Microsoft Learn — Types of cloud flows', url: 'https://learn.microsoft.com/en-us/power-automate/flow-types' };
const REF_FLOW_TRIGGER = { label: 'Microsoft Learn — Triggers and actions in flows', url: 'https://learn.microsoft.com/en-us/power-automate/triggers-introduction' };
const REF_RPA = { label: 'Microsoft Learn — Power Automate desktop flows (RPA)', url: 'https://learn.microsoft.com/en-us/power-automate/desktop-flows/introduction' };
const REF_FLOW_TEMPLATES = { label: 'Microsoft Learn — Use Power Automate templates', url: 'https://learn.microsoft.com/en-us/power-automate/get-started-templates' };
const REF_BI_OVERVIEW = { label: 'Microsoft Learn — What is Power BI?', url: 'https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview' };
const REF_BI_DESKTOP = { label: 'Microsoft Learn — What is Power BI Desktop?', url: 'https://learn.microsoft.com/en-us/power-bi/fundamentals/desktop-what-is-desktop' };
const REF_BI_SERVICE = { label: 'Microsoft Learn — The Power BI service', url: 'https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-service-overview' };
const REF_BI_BLOCKS = { label: 'Microsoft Learn — Basic concepts for designers in the Power BI service', url: 'https://learn.microsoft.com/en-us/power-bi/consumer/end-user-basic-concepts' };
const REF_BI_VISUALS = { label: 'Microsoft Learn — Visualizations in Power BI reports', url: 'https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-report-visualizations' };
const REF_BI_MOBILE = { label: 'Microsoft Learn — Power BI mobile apps', url: 'https://learn.microsoft.com/en-us/power-bi/consumer/mobile/mobile-apps-for-mobile-devices' };
const REF_PAGES = { label: 'Microsoft Learn — What is Power Pages?', url: 'https://learn.microsoft.com/en-us/power-pages/introduction' };
const REF_PAGES_DESIGN = { label: 'Microsoft Learn — Design a website using design studio', url: 'https://learn.microsoft.com/en-us/power-pages/getting-started/use-design-studio' };
const REF_COPILOT = { label: 'Microsoft Learn — Microsoft Copilot Studio overview', url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio' };
const REF_COPILOT_TOPICS = { label: 'Microsoft Learn — Key concepts: Topics in Copilot Studio', url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics' };
const REF_COPILOT_PUBLISH = { label: 'Microsoft Learn — Publish your agent to channels', url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-fundamentals-publish-channels' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Describe the Business Value of Power Platform (13) ──
  {
    domain: BUSVAL, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A retail company wants frontline staff to build small productivity apps without hiring developers. Which Power Platform value proposition does this best illustrate?',
    options: opts4(
      'High-code application development requiring C# expertise',
      'Low-code/no-code development that empowers citizen developers',
      'A replacement for the underlying database engine',
      'A licensing model that removes the need for governance'
    ),
    correct: ['b'],
    explanation: 'A core business value of Power Platform is enabling citizen developers to build solutions with low-code/no-code tools, reducing reliance on professional developers while IT retains governance.',
    references: [REF_PP_BUSVAL, REF_PP_OVERVIEW]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'An operations manager wants to estimate the financial return of automating a manual approval process before committing budget. Which approach aligns with describing Power Platform business value?',
    options: opts4(
      'Quantify time saved and error reduction to build a return-on-investment case',
      'Buy the maximum licenses first and measure later',
      'Avoid any measurement because automation value cannot be quantified',
      'Replace all staff immediately to maximize savings'
    ),
    correct: ['a'],
    explanation: 'Business value is demonstrated by quantifying outcomes such as hours saved, fewer errors, and faster cycle time to construct a return-on-investment case that justifies investment.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL accurate statements about the business value of extending Power Platform with Microsoft 365, Dynamics 365, and Azure.',
    options: opts4(
      'Power Platform can connect to Microsoft 365 data such as SharePoint and Teams',
      'Power Platform can extend Dynamics 365 apps and data',
      'Power Platform can integrate with Azure services and custom APIs',
      'Power Platform can only use data stored inside Excel files'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A key value point is that Power Platform integrates across Microsoft 365, Dynamics 365, and Azure, and extends those investments. It is not limited to Excel; it uses hundreds of connectors and custom APIs.',
    references: [REF_PP_BUSVAL, REF_CONNECTORS]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A compliance officer is concerned about who can share business data through apps and flows. Which Power Platform capability addresses this governance concern?',
    options: opts4(
      'Power Fx formulas',
      'Data loss prevention (DLP) policies',
      'Canvas app screens',
      'Power BI bookmarks'
    ),
    correct: ['b'],
    explanation: 'Data loss prevention policies classify connectors as business or non-business and block combinations that could leak data, addressing governance and compliance concerns about data sharing.',
    references: [REF_DLP]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'Leadership asks how Power Platform supports digital transformation rather than just isolated apps. Which statement best answers this?',
    options: opts4(
      'It only builds single-screen mobile apps with no data connectivity',
      'It combines analytics, app development, automation, and intelligent agents to digitize end-to-end business processes',
      'It is exclusively a reporting tool with no automation',
      'It requires every solution to be coded from scratch'
    ),
    correct: ['b'],
    explanation: 'Power Platform supports digital transformation by combining Power BI (analyze), Power Apps (act), Power Automate (automate), and Copilot Studio/Power Pages to digitize end-to-end processes, not just isolated apps.',
    references: [REF_PP_OVERVIEW, REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A startup wants predictable costs and the ability to scale licenses as adoption grows. Which Power Platform characteristic supports this business need?',
    options: opts4(
      'Per-app and per-user subscription licensing options',
      'A single perpetual license that never changes',
      'No licensing required for premium connectors',
      'Licensing only available through hardware purchase'
    ),
    correct: ['a'],
    explanation: 'Power Platform offers flexible subscription licensing (such as per-app and per-user plans) so organizations can start small and scale cost predictably as adoption grows.',
    references: [REF_CONNECTOR_LICENSE]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL ways Power Platform helps an organization improve productivity and reduce manual effort.',
    options: opts4(
      'Automating repetitive tasks with workflows',
      'Surfacing data insights through interactive dashboards',
      'Building apps quickly with reusable components',
      'Eliminating the need for any data governance'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Productivity gains come from automation, analytics, and rapid app building with reusable components. Strong governance is still required; Power Platform does not eliminate the need for it.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A nonprofit needs an inexpensive way to let employees experiment with building apps before purchasing licenses. Which option supports this?',
    options: opts4(
      'A trial or developer environment for evaluation',
      'Immediate enterprise-wide premium licensing only',
      'Disabling the Power Platform entirely',
      'Buying Azure virtual machines for every user'
    ),
    correct: ['a'],
    explanation: 'Trial and developer environments let organizations evaluate and prototype Power Platform solutions at low or no cost before committing to paid licensing.',
    references: [REF_ENV, REF_CONNECTOR_LICENSE]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'A bank must ensure that solutions handling customer data follow regulatory requirements. Which Power Platform value statement is most accurate?',
    options: opts4(
      'Power Platform provides administration, security, and compliance tooling so solutions can meet regulatory needs',
      'Power Platform cannot be governed by administrators',
      'Compliance is impossible because all data is public',
      'Security is the sole responsibility of end users with no admin controls'
    ),
    correct: ['a'],
    explanation: 'Power Platform delivers administration and security capabilities (environments, DLP, role-based security, the admin center) that help organizations meet compliance and regulatory requirements.',
    references: [REF_PORTAL, REF_DLP]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A field-service team wants insights, an app to log work, and automation to notify dispatch. Which describes the business value of using Power Platform together?',
    options: opts4(
      'Disconnected tools that cannot share data',
      'An integrated suite where analytics, apps, and automation share a common data platform',
      'A purely on-premises product with no cloud option',
      'A single product that only generates PDF reports'
    ),
    correct: ['b'],
    explanation: 'The business value of the integrated suite is that Power BI, Power Apps, and Power Automate work together on a shared data platform (Dataverse and connectors), delivering coordinated solutions.',
    references: [REF_PP_OVERVIEW, REF_DATAVERSE]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'Adopting Power Platform can reduce application backlog by letting business units build approved solutions while IT focuses on governance and complex systems.',
    options: opts4('True', 'False', 'Only true for Azure developers', 'Only true if no governance exists'),
    correct: ['a'],
    explanation: 'True. A recognized business value is reduced IT backlog: business units build approved low-code solutions while IT concentrates on governance and complex enterprise systems.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 1, type: QType.SINGLE,
    stem: 'Which of the following best describes a "citizen developer" in the context of Power Platform business value?',
    options: opts4(
      'A professional software engineer who writes only low-level code',
      'A business user who builds apps and automation using low-code tools',
      'An administrator who only manages licenses',
      'A consultant who never touches the platform'
    ),
    correct: ['b'],
    explanation: 'A citizen developer is a business user who builds apps, flows, or reports with low-code tools, which is central to the productivity and agility value of Power Platform.',
    references: [REF_PP_BUSVAL, REF_APPS_OVERVIEW]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'An enterprise wants to standardize and reuse solutions across departments to lower long-term cost. Which Power Platform concept supports packaging and distributing solutions?',
    options: opts4(
      'Solutions used to package and deploy components across environments',
      'Individual screenshots emailed to each team',
      'Manually recreating every app in each department',
      'Storing components only on local desktops'
    ),
    correct: ['a'],
    explanation: 'Solutions package apps, flows, and tables so they can be moved and reused across environments and departments, supporting standardization and reducing long-term build cost.',
    references: [REF_ENV, REF_PP_CORE]
  },

  // ── Identify Core Components of Power Platform (13) ──
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which set correctly lists the primary product components of Microsoft Power Platform?',
    options: opts4(
      'Power BI, Power Apps, Power Automate, Power Pages, and Copilot Studio',
      'Excel, Word, PowerPoint, and Outlook',
      'Azure SQL, Cosmos DB, and Synapse',
      'Visual Studio, GitHub, and Azure DevOps'
    ),
    correct: ['a'],
    explanation: 'The Power Platform product family includes Power BI, Power Apps, Power Automate, Power Pages, and Microsoft Copilot Studio, supported by Dataverse, connectors, and AI Builder.',
    references: [REF_PP_CORE, REF_PP_OVERVIEW]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A maker needs a scalable, secure cloud data store with tables, relationships, and business rules for Power Apps and Power Automate. Which component should they use?',
    options: opts4(
      'Microsoft Dataverse',
      'A local Excel workbook only',
      'A printed spreadsheet',
      'Power BI bookmarks'
    ),
    correct: ['a'],
    explanation: 'Microsoft Dataverse is the secure, cloud-based data platform with tables, relationships, business rules, and security used across Power Apps and Power Automate.',
    references: [REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A flow must read rows from Salesforce and post a message to Microsoft Teams. Which Power Platform component enables connecting to these external and Microsoft services?',
    options: opts4(
      'Connectors',
      'Power Fx only',
      'Power BI visuals',
      'Solution layers'
    ),
    correct: ['a'],
    explanation: 'Connectors provide pre-built (and custom) connections to services such as Salesforce and Microsoft Teams, enabling apps and flows to read and write external data.',
    references: [REF_CONNECTORS]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to add prediction and form-processing AI to an app without data-science skills. Which core component provides this?',
    options: opts4(
      'AI Builder',
      'Power Fx',
      'Dataverse for Teams only',
      'Power BI gateways'
    ),
    correct: ['a'],
    explanation: 'AI Builder is the low-code AI component that adds prediction, form processing, object detection, and text/category models to Power Apps and Power Automate without data-science expertise.',
    references: [REF_AIBUILDER]
  },
  {
    domain: CORE, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL statements that correctly describe environments in Power Platform.',
    options: opts4(
      'An environment is a container for apps, flows, and data',
      'Environments can be used to separate development from production',
      'Each environment can have its own Dataverse database',
      'There can only ever be one environment per tenant'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Environments are containers that store and manage apps, flows, and data, and are commonly used to separate dev/test/prod. Each can have its own Dataverse database. A tenant can have many environments.',
    references: [REF_ENV]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'An administrator needs a central place to create environments, manage capacity, and configure DLP policies. Which component do they use?',
    options: opts4(
      'Power Platform admin center',
      'Power BI Desktop',
      'A canvas app gallery',
      'Copilot Studio topics'
    ),
    correct: ['a'],
    explanation: 'The Power Platform admin center is the central administration portal for managing environments, capacity, analytics, and data loss prevention policies.',
    references: [REF_PORTAL]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A connector requires a premium license to use. Which statement is correct about standard vs. premium connectors?',
    options: opts4(
      'Premium connectors (for example, common database and many third-party services) require eligible premium licensing, while standard connectors are included with base plans',
      'All connectors are always free with any Microsoft 365 license',
      'Standard connectors require Azure subscriptions',
      'There is no licensing difference between connector types'
    ),
    correct: ['a'],
    explanation: 'Connectors are classified as standard or premium. Premium connectors require eligible premium Power Platform licensing; standard connectors are available with base plans such as many Microsoft 365 subscriptions.',
    references: [REF_CONNECTOR_LICENSE, REF_CONNECTORS]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer needs a connector for an internal REST API that has no pre-built connector. What should they create?',
    options: opts4(
      'A custom connector',
      'A new Power BI dataset',
      'A Copilot Studio topic',
      'A model-driven app form'
    ),
    correct: ['a'],
    explanation: 'A custom connector wraps an internal or third-party REST API so it can be used like any other connector in Power Apps and Power Automate when no pre-built connector exists.',
    references: [REF_CONNECTORS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the role of Microsoft Dataverse relationships and business rules?',
    options: opts4(
      'They model how tables relate and enforce logic without code, such as validating fields',
      'They are only used to color report charts',
      'They replace the need for any security model',
      'They are exclusive to Power BI dashboards'
    ),
    correct: ['a'],
    explanation: 'Dataverse relationships connect tables (one-to-many, many-to-many), and business rules enforce no-code logic such as field validation and default values across apps that use the table.',
    references: [REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Dataverse security model.',
    options: opts4(
      'Security roles grant privileges to users',
      'Business units and teams help organize access',
      'Row-level and column-level security can restrict data',
      'Dataverse has no concept of role-based security'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dataverse uses role-based security with security roles, business units, and teams, and supports row-level and column-level security. It is not without a security model.',
    references: [REF_CDS_SECURITY]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A maker wants logic and expressions that work consistently across canvas apps and other Power Platform products. Which low-code language is designed for this?',
    options: opts4(
      'Microsoft Power Fx',
      'Transact-SQL',
      'PowerShell DSC',
      'KQL'
    ),
    correct: ['a'],
    explanation: 'Microsoft Power Fx is the low-code, Excel-like formula language used across Power Platform, starting with canvas apps, to express logic consistently.',
    references: [REF_POWERFX]
  },
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE,
    stem: 'Dataverse for Teams is a built-in low-capacity data platform that lets teams build apps, flows, and bots directly within Microsoft Teams.',
    options: opts4('True', 'False', 'Only true for Power BI Premium', 'Only true on-premises'),
    correct: ['a'],
    explanation: 'True. Dataverse for Teams provides a built-in, lower-capacity data platform inside Microsoft Teams so teams can build apps, flows, and chatbots without a full Dataverse environment.',
    references: [REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component is responsible for grouping and deploying apps, flows, tables, and connectors as a single unit between environments?',
    options: opts4(
      'Solutions',
      'Dashboards',
      'Gateways',
      'Bookmarks'
    ),
    correct: ['a'],
    explanation: 'Solutions package related components (apps, flows, tables, connectors) so they can be transported and deployed together across environments in an application lifecycle.',
    references: [REF_ENV, REF_PP_CORE]
  },

  // ── Demonstrate the Capabilities of Power Apps (10) ──
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A maker wants pixel-level control over the user interface and to drag controls onto a blank screen. Which type of Power App should they build?',
    options: opts4(
      'A canvas app',
      'A model-driven app',
      'A Power BI report',
      'A desktop flow'
    ),
    correct: ['a'],
    explanation: 'Canvas apps give makers a blank canvas with drag-and-drop controls and pixel-level UI design, ideal for tailored task- or role-based experiences.',
    references: [REF_CANVAS, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs a data-centric app whose forms, views, and navigation are generated from a Dataverse data model with minimal layout work. Which app type fits best?',
    options: opts4(
      'A model-driven app',
      'A pixel-perfect canvas app',
      'A Power Automate cloud flow',
      'A Power BI dashboard'
    ),
    correct: ['a'],
    explanation: 'Model-driven apps are built on the Dataverse data model and generate responsive forms, views, and navigation automatically, suited to data-centric, process-driven scenarios.',
    references: [REF_MODEL, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which data source can a canvas app connect to using a connector?',
    options: opts4(
      'SharePoint lists, SQL Server, and Dataverse',
      'Only printed documents',
      'Only fax machines',
      'Only PowerPoint slides'
    ),
    correct: ['a'],
    explanation: 'Canvas apps connect to many data sources through connectors, including SharePoint lists, SQL Server, Dataverse, and hundreds of other services.',
    references: [REF_CANVAS, REF_CONNECTORS]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker wants to validate that a text input is not empty and show a message using a formula. Which Power Apps capability supports this?',
    options: opts4(
      'Power Fx formulas on control properties',
      'Power BI DAX measures',
      'Copilot Studio entities',
      'Desktop flow UI selectors'
    ),
    correct: ['a'],
    explanation: 'Power Apps uses Power Fx formulas bound to control properties (for example, validation logic and visibility) to implement no-code/low-code behavior such as empty-input checks.',
    references: [REF_POWERFX, REF_APPS_OVERVIEW]
  },
  {
    domain: APPS, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL accurate statements about Power Apps app types.',
    options: opts4(
      'Canvas apps emphasize design flexibility and drag-and-drop UI',
      'Model-driven apps are built on the Dataverse data model',
      'Power Apps can run on web browsers and mobile devices',
      'Power Apps can only run on a single Windows desktop'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Canvas apps focus on UI flexibility, model-driven apps are built on Dataverse, and Power Apps run in browsers and on mobile via the Power Apps mobile app. They are not limited to one desktop.',
    references: [REF_APP_TYPES, REF_APPS_OVERVIEW]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A field worker must capture inspection data on a phone, sometimes without connectivity. Which Power Apps capability is most relevant?',
    options: opts4(
      'Mobile delivery of apps with offline-capable scenarios',
      'Power BI paginated reports',
      'Copilot Studio web channels only',
      'Dataverse business units'
    ),
    correct: ['a'],
    explanation: 'Power Apps can be delivered to mobile devices and support scenarios for capturing data in the field, including offline-capable patterns, which fits mobile inspection use cases.',
    references: [REF_APPS_OVERVIEW, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A maker wants to start an app quickly from existing data such as a SharePoint list. Which Power Apps capability helps?',
    options: opts4(
      'Generating an app automatically from a data source',
      'Writing a custom database engine',
      'Manually drawing every control with no data binding ever',
      'Using Power BI to build the app screens'
    ),
    correct: ['a'],
    explanation: 'Power Apps can auto-generate a working three-screen canvas app from a data source such as a SharePoint list, accelerating initial app creation.',
    references: [REF_CANVAS, REF_APPS_OVERVIEW]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants reusable UI building blocks shared across multiple canvas apps. Which Power Apps feature supports reuse?',
    options: opts4(
      'Components and component libraries',
      'Power BI bookmarks',
      'Dataverse plug-ins only',
      'Copilot Studio publishing channels'
    ),
    correct: ['a'],
    explanation: 'Power Apps components and component libraries let makers build reusable UI elements once and share them across multiple canvas apps for consistency and efficiency.',
    references: [REF_CANVAS, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE,
    stem: 'A model-driven app automatically provides responsive forms and views based on the underlying Dataverse tables.',
    options: opts4('True', 'False', 'Only true with premium Power BI', 'Only true for canvas apps'),
    correct: ['a'],
    explanation: 'True. Model-driven apps generate responsive forms, views, and navigation from the Dataverse data model, so makers focus on the data and process rather than pixel layout.',
    references: [REF_MODEL]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best contrasts canvas and model-driven apps?',
    options: opts4(
      'Canvas apps prioritize custom UI; model-driven apps prioritize a data-model-driven, consistent UI',
      'Canvas apps cannot use data at all',
      'Model-driven apps are only spreadsheets',
      'They are identical with no differences'
    ),
    correct: ['a'],
    explanation: 'Canvas apps give makers full UI design control over connected data, while model-driven apps derive a consistent, responsive UI from the Dataverse data model and processes.',
    references: [REF_APP_TYPES, REF_MODEL]
  },

  // ── Demonstrate the Capabilities of Power Automate (10) ──
  {
    domain: FLOW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A user wants a flow to run automatically whenever a new item is added to a SharePoint list. Which type of cloud flow should they create?',
    options: opts4(
      'An automated cloud flow triggered by an event',
      'A manual desktop installation',
      'A Power BI scheduled refresh',
      'A canvas app screen'
    ),
    correct: ['a'],
    explanation: 'Automated cloud flows start automatically when a specified event occurs, such as a new item created in a SharePoint list.',
    references: [REF_FLOW_TYPES, REF_FLOW_TRIGGER]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A manager wants a flow that runs every weekday at 8 AM to send a summary email. Which flow type fits?',
    options: opts4(
      'A scheduled cloud flow',
      'An instant button flow',
      'A model-driven app',
      'A Power BI report'
    ),
    correct: ['a'],
    explanation: 'Scheduled cloud flows run on a defined recurrence (for example, every weekday at 8 AM), which is ideal for recurring summary tasks.',
    references: [REF_FLOW_TYPES]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An employee wants to trigger a flow on demand from a button in the Power Automate mobile app. Which flow type is this?',
    options: opts4(
      'An instant (button) cloud flow',
      'A scheduled cloud flow',
      'A desktop flow only',
      'A Power BI dataflow'
    ),
    correct: ['a'],
    explanation: 'Instant cloud flows (button flows) are started manually on demand, for example from the Power Automate mobile app or a button.',
    references: [REF_FLOW_TYPES, REF_FLOW_OVERVIEW]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'A finance team must automate clicking through a legacy Windows desktop application that has no API. Which Power Automate capability is appropriate?',
    options: opts4(
      'Desktop flows (robotic process automation)',
      'A scheduled cloud flow with a connector to the legacy app',
      'A Power BI gateway',
      'A canvas app gallery'
    ),
    correct: ['a'],
    explanation: 'Power Automate desktop flows provide robotic process automation to interact with legacy desktop and web user interfaces when no API or connector is available.',
    references: [REF_RPA]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Power Automate triggers and actions.',
    options: opts4(
      'A trigger is the event that starts a flow',
      'Actions are the steps a flow performs after it starts',
      'A flow can use connectors in its actions',
      'A flow cannot have any conditions or branching'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A trigger starts the flow, actions are the subsequent steps, and connectors are used in actions. Flows can include conditions, loops, and branching logic.',
    references: [REF_FLOW_TRIGGER, REF_FLOW_OVERVIEW]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A new user wants to build a common approval automation quickly without starting from scratch. Which Power Automate capability helps?',
    options: opts4(
      'Starting from a pre-built template',
      'Writing a custom C# service',
      'Building a Power BI dataset',
      'Creating a Dataverse security role'
    ),
    correct: ['a'],
    explanation: 'Power Automate provides a large template gallery (including approvals) so users can start common automations quickly without building from scratch.',
    references: [REF_FLOW_TEMPLATES]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'A document review process needs sequential sign-off where reviewers approve in order. Which Power Automate feature directly supports this?',
    options: opts4(
      'Built-in approvals with sequential approval configuration',
      'Power BI Q&A',
      'A canvas app form only',
      'A Dataverse business unit'
    ),
    correct: ['a'],
    explanation: 'Power Automate includes an approvals capability supporting first-to-respond and sequential approvals, enabling ordered sign-off in review processes.',
    references: [REF_FLOW_OVERVIEW, REF_FLOW_TEMPLATES]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A maker wants a flow to take different actions depending on whether an order total exceeds a threshold. Which capability enables this?',
    options: opts4(
      'Conditions and control actions in a cloud flow',
      'Power BI bookmarks',
      'Copilot Studio publishing',
      'Canvas app themes'
    ),
    correct: ['a'],
    explanation: 'Cloud flows support condition and control actions (if/else, switch, loops) so the flow can branch based on data such as an order total threshold.',
    references: [REF_FLOW_OVERVIEW, REF_FLOW_TRIGGER]
  },
  {
    domain: FLOW, difficulty: 1, type: QType.SINGLE,
    stem: 'Power Automate cloud flows can integrate Power Apps so that an app can start a flow and receive results.',
    options: opts4('True', 'False', 'Only true for desktop flows', 'Only true with Power BI Premium'),
    correct: ['a'],
    explanation: 'True. Power Apps can call Power Automate cloud flows (for example, via the Power Apps trigger) to run logic and return results to the app.',
    references: [REF_FLOW_OVERVIEW, REF_APPS_OVERVIEW]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best summarizes the business purpose of Power Automate?',
    options: opts4(
      'Automating repetitive tasks and orchestrating processes across apps and services',
      'Designing only printed report layouts',
      'Replacing the Dataverse security model',
      'Hosting virtual machines'
    ),
    correct: ['a'],
    explanation: 'Power Automate automates repetitive tasks and orchestrates business processes across many apps and services using cloud and desktop flows.',
    references: [REF_FLOW_OVERVIEW]
  },

  // ── Demonstrate the Capabilities of Power BI (10) ──
  {
    domain: BI, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An analyst wants to author a report by connecting to data, modeling it, and creating visuals on their Windows machine. Which Power BI tool should they use?',
    options: opts4(
      'Power BI Desktop',
      'Power Automate desktop',
      'Copilot Studio',
      'Dataverse'
    ),
    correct: ['a'],
    explanation: 'Power BI Desktop is the free Windows authoring application used to connect to data, build the data model, and create reports before publishing.',
    references: [REF_BI_DESKTOP, REF_BI_OVERVIEW]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'After authoring a report, a team wants to share it, build dashboards, and collaborate online. Which Power BI component do they use?',
    options: opts4(
      'The Power BI service (cloud)',
      'Power BI Desktop only',
      'Power Apps Studio',
      'Power Automate cloud flows'
    ),
    correct: ['a'],
    explanation: 'The Power BI service is the cloud platform for publishing, sharing, building dashboards, and collaborating on reports across an organization.',
    references: [REF_BI_SERVICE]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Power BI, which building block is a single-page collection of tiles often used to monitor key metrics at a glance?',
    options: opts4(
      'A dashboard',
      'A dataflow',
      'A connector',
      'A solution'
    ),
    correct: ['a'],
    explanation: 'A Power BI dashboard is a single-page canvas of tiles used to monitor the most important metrics at a glance, often pinned from one or more reports.',
    references: [REF_BI_BLOCKS]
  },
  {
    domain: BI, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL items that are Power BI building blocks.',
    options: opts4(
      'Reports',
      'Dashboards',
      'Datasets (semantic models)',
      'Desktop flows'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power BI building blocks include datasets/semantic models, reports, dashboards, and visualizations. Desktop flows belong to Power Automate, not Power BI.',
    references: [REF_BI_BLOCKS, REF_BI_OVERVIEW]
  },
  {
    domain: BI, difficulty: 3, type: QType.SINGLE,
    stem: 'A user wants to ask a natural-language question like "total sales by region" and get a visual answer in Power BI. Which capability supports this?',
    options: opts4(
      'Q&A natural-language query',
      'Power Fx formulas',
      'Desktop flow recorder',
      'Dataverse business rules'
    ),
    correct: ['a'],
    explanation: 'Power BI Q&A lets users ask natural-language questions about their data and returns an appropriate visualization automatically.',
    references: [REF_BI_VISUALS, REF_BI_SERVICE]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'A sales leader needs to view interactive reports and dashboards on a phone while traveling. Which Power BI capability supports this?',
    options: opts4(
      'Power BI mobile apps',
      'Power BI Desktop only',
      'Power Automate desktop flows',
      'Copilot Studio channels'
    ),
    correct: ['a'],
    explanation: 'Power BI mobile apps for iOS and Android let users securely view and interact with reports and dashboards on mobile devices.',
    references: [REF_BI_MOBILE]
  },
  {
    domain: BI, difficulty: 3, type: QType.SINGLE,
    stem: 'A report should let viewers filter the entire page by selecting a category in a chart. Which Power BI report feature enables this interaction?',
    options: opts4(
      'Cross-filtering/cross-highlighting between visuals',
      'Power Automate triggers',
      'Dataverse teams',
      'Canvas app components'
    ),
    correct: ['a'],
    explanation: 'Power BI visuals support cross-filtering and cross-highlighting, so selecting a value in one visual filters or highlights related visuals on the page.',
    references: [REF_BI_VISUALS]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the relationship between Power BI Desktop and the Power BI service?',
    options: opts4(
      'You typically author in Desktop and publish to the service to share and collaborate',
      'They are unrelated products',
      'The service is only for authoring and Desktop only for sharing',
      'Neither can connect to data sources'
    ),
    correct: ['a'],
    explanation: 'The common workflow is to author reports in Power BI Desktop, then publish them to the Power BI service to share, build dashboards, and collaborate.',
    references: [REF_BI_DESKTOP, REF_BI_SERVICE]
  },
  {
    domain: BI, difficulty: 1, type: QType.SINGLE,
    stem: 'A Power BI report can contain multiple pages with several visualizations on each page.',
    options: opts4('True', 'False', 'Only true in the mobile app', 'Only true for dashboards'),
    correct: ['a'],
    explanation: 'True. A Power BI report can have one or many pages, each containing multiple visualizations built from a dataset.',
    references: [REF_BI_BLOCKS]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario best demonstrates the analytical value of Power BI in Power Platform?',
    options: opts4(
      'Turning raw sales data into interactive dashboards that inform decisions',
      'Hosting a customer-facing public website',
      'Recording desktop UI automation steps',
      'Managing Dataverse security roles'
    ),
    correct: ['a'],
    explanation: 'Power BI delivers the "analyze" capability of Power Platform by transforming raw data into interactive reports and dashboards that support data-driven decisions.',
    references: [REF_BI_OVERVIEW]
  },

  // ── Demonstrate the Capabilities of Power Pages and Copilot Studio (9) ──
  {
    domain: PAGES, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A company wants a secure, external-facing website where customers can submit and track support requests stored in Dataverse. Which Power Platform product fits best?',
    options: opts4(
      'Power Pages',
      'Power BI Desktop',
      'Power Automate desktop',
      'Dataverse for Teams'
    ),
    correct: ['a'],
    explanation: 'Power Pages is the low-code product for building secure, external-facing business websites that surface and collect Dataverse data, such as customer portals.',
    references: [REF_PAGES]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE,
    stem: 'A maker wants to build and style a Power Pages site visually using templates and a what-you-see-is-what-you-get editor. Which Power Pages capability supports this?',
    options: opts4(
      'The design studio with templates and visual editing',
      'Power BI Q&A',
      'Power Automate desktop recorder',
      'Dataverse plug-ins'
    ),
    correct: ['a'],
    explanation: 'Power Pages provides a design studio with templates and visual, low-code editing so makers can build and style websites without extensive coding.',
    references: [REF_PAGES_DESIGN]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A support team wants to build a conversational agent that answers common customer questions without writing code. Which product should they use?',
    options: opts4(
      'Microsoft Copilot Studio',
      'Power BI Desktop',
      'Power Automate desktop flows',
      'Dataverse business rules'
    ),
    correct: ['a'],
    explanation: 'Microsoft Copilot Studio is the low-code product for building conversational agents (chatbots/copilots) that answer questions and automate conversations without code.',
    references: [REF_COPILOT]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'In Microsoft Copilot Studio, what defines a discrete conversation path that handles a particular user intent?',
    options: opts4(
      'A topic',
      'A Power BI dataset',
      'A canvas app screen',
      'A Dataverse security role'
    ),
    correct: ['a'],
    explanation: 'In Copilot Studio, a topic defines a discrete conversation path with trigger phrases and nodes that handle a specific user intent.',
    references: [REF_COPILOT_TOPICS]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Power Pages and Copilot Studio capabilities.',
    options: opts4(
      'Power Pages websites can use Dataverse as a data source',
      'Copilot Studio agents can be published to channels such as a website or Microsoft Teams',
      'Copilot Studio can call Power Automate flows to take actions',
      'Power Pages can only display static text with no data'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power Pages binds to Dataverse data, Copilot Studio agents publish to channels (website, Teams, and more) and can invoke Power Automate flows. Power Pages is not limited to static text.',
    references: [REF_PAGES, REF_COPILOT_PUBLISH]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants their Copilot Studio agent to perform an action such as creating a ticket when a user requests help. Which capability enables this?',
    options: opts4(
      'Calling a Power Automate flow from the agent',
      'A Power BI dashboard tile',
      'A canvas app gallery control',
      'A Dataverse business unit'
    ),
    correct: ['a'],
    explanation: 'Copilot Studio agents can call Power Automate flows so the conversation can perform actions such as creating a ticket or looking up records.',
    references: [REF_COPILOT, REF_FLOW_OVERVIEW]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes how Power Pages helps an organization extend reach beyond internal users?',
    options: opts4(
      'It exposes business data and processes to external audiences through secure web portals',
      'It only builds internal model-driven apps',
      'It is limited to generating PDF reports',
      'It cannot use authentication of any kind'
    ),
    correct: ['a'],
    explanation: 'Power Pages extends Power Platform to external audiences by providing secure, authenticated web portals that surface business data and processes to customers and partners.',
    references: [REF_PAGES]
  },
  {
    domain: PAGES, difficulty: 1, type: QType.SINGLE,
    stem: 'Microsoft Copilot Studio lets makers test an agent before publishing it to users.',
    options: opts4('True', 'False', 'Only true for Power BI', 'Only with premium Power Pages'),
    correct: ['a'],
    explanation: 'True. Copilot Studio includes a test pane so makers can interact with and validate an agent before publishing it to channels and users.',
    references: [REF_COPILOT, REF_COPILOT_PUBLISH]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants a customer chatbot on its public Power Pages site. Which combination correctly describes how the products work together?',
    options: opts4(
      'Build the agent in Copilot Studio and add it to the Power Pages website channel',
      'Build the chatbot in Power BI and publish to Dataverse',
      'Use Power Automate desktop to render the chat UI',
      'Use a canvas app as the only way to host any chatbot'
    ),
    correct: ['a'],
    explanation: 'You author the conversational agent in Copilot Studio and publish/embed it to the Power Pages website channel, combining a portal with a self-service agent.',
    references: [REF_COPILOT_PUBLISH, REF_PAGES]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Describe the Business Value of Power Platform (13) ──
  {
    domain: BUSVAL, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A logistics firm reduced a two-day manual reporting task to minutes after adopting Power Platform. Which business value is demonstrated?',
    options: opts4(
      'Increased operational efficiency through automation and analytics',
      'Higher hardware procurement costs',
      'Slower decision making',
      'Elimination of all governance needs'
    ),
    correct: ['a'],
    explanation: 'Drastically reducing manual effort and cycle time illustrates the operational-efficiency business value delivered by Power Platform automation and analytics.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'An IT director wants business teams to innovate while IT keeps control of data security. Which Power Platform balance does this describe?',
    options: opts4(
      'Empowering makers with low-code while IT governs through environments and policies',
      'Removing all IT involvement permanently',
      'Forcing all development through external vendors only',
      'Blocking every connector by default with no review process'
    ),
    correct: ['a'],
    explanation: 'Power Platform balances maker empowerment with IT governance — citizen developers innovate while administrators control security via environments, DLP, and policies.',
    references: [REF_PP_BUSVAL, REF_DLP]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly describe how Power Platform delivers business value across an organization.',
    options: opts4(
      'It accelerates solution delivery compared to traditional coding',
      'It connects to existing Microsoft 365 and Dynamics 365 investments',
      'It enables analytics, apps, and automation to work together',
      'It requires replacing all existing systems before any value is realized'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power Platform delivers value by accelerating delivery, integrating with existing Microsoft 365/Dynamics 365 investments, and combining analytics, apps, and automation — without requiring a full system replacement.',
    references: [REF_PP_BUSVAL, REF_PP_OVERVIEW]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A CIO asks which administrative tool gives visibility into Power Platform usage and environment management. What is the correct answer?',
    options: opts4(
      'The Power Platform admin center',
      'Power BI Q&A',
      'Power Fx editor',
      'Copilot Studio test pane'
    ),
    correct: ['a'],
    explanation: 'The Power Platform admin center provides administration and analytics for environments, capacity, and usage, supporting governance and oversight.',
    references: [REF_PORTAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants to lower the risk that sensitive data is shared via a consumer connector inside a business app. Which capability provides this protection?',
    options: opts4(
      'Data loss prevention policies that separate business and non-business connectors',
      'Increasing the number of canvas screens',
      'Disabling Power BI entirely',
      'Removing Dataverse relationships'
    ),
    correct: ['a'],
    explanation: 'DLP policies group connectors into business and non-business categories and prevent data from being shared between groups, reducing the risk of leaking sensitive data.',
    references: [REF_DLP]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants to standardize a successful department app for use company-wide with minimal rework. Which Power Platform value enables this?',
    options: opts4(
      'Reusability and application lifecycle management through solutions and environments',
      'Rebuilding the app manually for every team',
      'Printing the app design as documentation',
      'Storing the app only on one laptop'
    ),
    correct: ['a'],
    explanation: 'Solutions and environments support reuse and application lifecycle management, allowing a proven app to be packaged and deployed across the organization with minimal rework.',
    references: [REF_ENV, REF_PP_CORE]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the business value of Power Platform for rapidly responding to changing market conditions?',
    options: opts4(
      'Agility — solutions can be built and changed quickly with low-code tools',
      'Rigidity — changes require months of recoding',
      'No ability to integrate with other systems',
      'Mandatory downtime for every change'
    ),
    correct: ['a'],
    explanation: 'A primary business value is agility: low-code tools let organizations build and adapt solutions quickly to respond to changing market and business conditions.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL roles that typically benefit from Power Platform within an organization.',
    options: opts4(
      'Business users building productivity apps',
      'Analysts creating reports and dashboards',
      'Administrators governing environments and policies',
      'No one benefits because it has no business use'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power Platform delivers value to business users (apps and automation), analysts (Power BI), and administrators (governance), spanning multiple organizational roles.',
    references: [REF_PP_BUSVAL, REF_PORTAL]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated insurer must demonstrate that app and flow data sharing follows policy. Which combination of Power Platform capabilities supports this governance need?',
    options: opts4(
      'Environments plus data loss prevention policies managed in the admin center',
      'Only canvas app themes',
      'Only Power BI bookmarks',
      'Only Copilot Studio topics'
    ),
    correct: ['a'],
    explanation: 'Environments isolate workloads and DLP policies (configured in the admin center) enforce connector usage rules, together supporting compliance for regulated data sharing.',
    references: [REF_ENV, REF_DLP, REF_PORTAL]
  },
  {
    domain: BUSVAL, difficulty: 1, type: QType.SINGLE,
    stem: 'Which statement best captures the overall value proposition of Microsoft Power Platform?',
    options: opts4(
      'A low-code platform to analyze data, build apps, automate processes, and create agents',
      'A hardware-only solution for data centers',
      'A single spreadsheet application',
      'A programming language replacement for all of Azure'
    ),
    correct: ['a'],
    explanation: 'Power Platform is a low-code platform whose value is enabling organizations to analyze (Power BI), act (Power Apps), automate (Power Automate), and build agents/sites (Copilot Studio, Power Pages).',
    references: [REF_PP_OVERVIEW]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'Power Platform can reduce total cost of ownership by reusing connectors and components instead of building integrations from scratch each time.',
    options: opts4('True', 'False', 'Only true for Azure', 'Only true without Dataverse'),
    correct: ['a'],
    explanation: 'True. Reusing pre-built connectors and reusable components lowers development effort and total cost of ownership compared with custom-coding every integration.',
    references: [REF_CONNECTORS, REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants employees to surface AI capabilities (like reading invoices) in their apps without hiring data scientists. Which value point does this reflect?',
    options: opts4(
      'Democratizing AI through low-code AI Builder',
      'Requiring a PhD to use any AI',
      'Removing AI from the platform',
      'Limiting AI to Power BI only'
    ),
    correct: ['a'],
    explanation: 'A business value of Power Platform is democratizing AI: AI Builder lets makers add capabilities such as invoice/form processing without data-science expertise.',
    references: [REF_AIBUILDER, REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Why might an organization choose Power Platform over building every internal tool with traditional custom development?',
    options: opts4(
      'Faster delivery, lower cost, and broader participation by business users',
      'Slower delivery and higher cost',
      'It forbids any integration with Microsoft 365',
      'It cannot be governed or secured'
    ),
    correct: ['a'],
    explanation: 'Compared with traditional development, Power Platform typically offers faster delivery, lower cost, and the ability for business users to participate, while remaining governable.',
    references: [REF_PP_BUSVAL]
  },

  // ── Identify Core Components of Power Platform (13) ──
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Power Platform component is the underlying data platform that securely stores tables used by apps and flows?',
    options: opts4(
      'Microsoft Dataverse',
      'Power BI Desktop',
      'Copilot Studio',
      'Power Fx'
    ),
    correct: ['a'],
    explanation: 'Microsoft Dataverse is the secure, scalable cloud data platform storing tables, relationships, and logic shared across Power Apps and Power Automate.',
    references: [REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'A maker needs to connect a flow to Twitter, Outlook, and SQL Server. Which core component provides these connections?',
    options: opts4(
      'Connectors',
      'Solutions',
      'Business units',
      'Bookmarks'
    ),
    correct: ['a'],
    explanation: 'Connectors are the components that let apps and flows connect to services such as Twitter, Outlook, and SQL Server.',
    references: [REF_CONNECTORS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A maker wants to add document processing AI to read receipts inside a flow with no model training code. Which component is intended for this?',
    options: opts4(
      'AI Builder',
      'Power Fx',
      'Power BI gateways',
      'Dataverse teams'
    ),
    correct: ['a'],
    explanation: 'AI Builder offers prebuilt and customizable models, including document/receipt processing, that makers can use in flows and apps without writing model code.',
    references: [REF_AIBUILDER]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'An administrator wants to keep a sandbox separate from production so testing cannot affect live data. Which core concept enables this isolation?',
    options: opts4(
      'Environments',
      'Power Fx',
      'Power BI dashboards',
      'Canvas components'
    ),
    correct: ['a'],
    explanation: 'Environments are isolated containers for apps, flows, and data, commonly used to separate sandbox/test from production so testing does not affect live data.',
    references: [REF_ENV]
  },
  {
    domain: CORE, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL components considered part of the Power Platform foundation that supports apps, flows, and analytics.',
    options: opts4(
      'Microsoft Dataverse',
      'Connectors',
      'AI Builder',
      'A standalone fax server'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dataverse, connectors, and AI Builder are foundational components supporting Power Apps, Power Automate, and Power BI. A fax server is not a Power Platform component.',
    references: [REF_PP_CORE, REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker needs to enforce that an opportunity\'s close date cannot be earlier than its created date, applied everywhere the table is used. Which Dataverse feature fits?',
    options: opts4(
      'A business rule on the table',
      'A Power BI measure',
      'A canvas app theme',
      'A Copilot Studio topic'
    ),
    correct: ['a'],
    explanation: 'Dataverse business rules enforce no-code logic and validation at the table level, so the rule applies consistently across every app that uses the table.',
    references: [REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about standard versus premium connectors is correct for licensing?',
    options: opts4(
      'Using premium connectors generally requires eligible premium Power Platform licensing',
      'Premium connectors are always free',
      'Standard connectors require an Azure subscription',
      'There is no distinction between connector tiers'
    ),
    correct: ['a'],
    explanation: 'Premium connectors require eligible premium licensing; standard connectors are included with base plans. Understanding this distinction is part of identifying core components and their licensing.',
    references: [REF_CONNECTOR_LICENSE]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A developer must integrate a partner web API that has no out-of-box connector and reuse it across multiple apps. What is the recommended approach?',
    options: opts4(
      'Create a custom connector and share it',
      'Hard-code the API into every app separately',
      'Use a Power BI dashboard as a proxy',
      'Use a Copilot Studio topic instead of any connector'
    ),
    correct: ['a'],
    explanation: 'A custom connector wraps the partner API so it can be reused across apps and flows like any other connector, avoiding duplicate integration code.',
    references: [REF_CONNECTORS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component provides role-based security, including security roles, teams, and business units?',
    options: opts4(
      'Microsoft Dataverse',
      'Power BI mobile',
      'Power Automate desktop',
      'Power Fx'
    ),
    correct: ['a'],
    explanation: 'Microsoft Dataverse implements the role-based security model with security roles, teams, and business units that govern data access across apps.',
    references: [REF_CDS_SECURITY]
  },
  {
    domain: CORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Power Platform environments.',
    options: opts4(
      'Environments can be created and managed in the Power Platform admin center',
      'DLP policies can be scoped to environments',
      'An environment can host a Dataverse database',
      'Environments cannot be used to separate development and production'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Environments are managed in the admin center, can be scoped by DLP policies, and can host a Dataverse database. They are explicitly used to separate dev and production.',
    references: [REF_ENV, REF_PORTAL, REF_DLP]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which low-code language brings consistent, Excel-like formula logic to Power Platform, starting with canvas apps?',
    options: opts4(
      'Microsoft Power Fx',
      'Bicep',
      'YAML',
      'DAX only'
    ),
    correct: ['a'],
    explanation: 'Microsoft Power Fx is the open-source, Excel-like low-code language used across Power Platform, beginning with canvas apps, to express logic consistently.',
    references: [REF_POWERFX]
  },
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE,
    stem: 'Connectors can be either Microsoft-published or custom-built to extend Power Platform connectivity.',
    options: opts4('True', 'False', 'Only Microsoft can publish connectors', 'Connectors do not exist'),
    correct: ['a'],
    explanation: 'True. Power Platform offers many Microsoft and third-party connectors, and makers can build custom connectors to integrate additional APIs.',
    references: [REF_CONNECTORS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which core capability lets organizations package apps, flows, and tables to move them between environments in an ALM process?',
    options: opts4(
      'Solutions',
      'Dashboards',
      'Q&A',
      'Mobile apps'
    ),
    correct: ['a'],
    explanation: 'Solutions group related components for transport between environments, enabling application lifecycle management (ALM) such as dev-to-test-to-production deployment.',
    references: [REF_ENV, REF_PP_CORE]
  },

  // ── Demonstrate the Capabilities of Power Apps (10) ──
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A maker wants a tailored, branded UI with custom navigation built control by control. Which Power Apps type is most appropriate?',
    options: opts4(
      'Canvas app',
      'Model-driven app',
      'Power BI report',
      'Cloud flow'
    ),
    correct: ['a'],
    explanation: 'Canvas apps give makers full control over layout, branding, and navigation by placing controls on a canvas, ideal for tailored experiences.',
    references: [REF_CANVAS, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A complex case-management solution needs consistent forms, views, dashboards, and business process flows on Dataverse. Which app type is recommended?',
    options: opts4(
      'Model-driven app',
      'Canvas app with no data',
      'Power BI dashboard',
      'Desktop flow'
    ),
    correct: ['a'],
    explanation: 'Model-driven apps suit complex, data-driven solutions on Dataverse, providing forms, views, dashboards, and business process flows with a consistent UI.',
    references: [REF_MODEL]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a valid way for a canvas app to obtain data?',
    options: opts4(
      'Connecting to a connector such as SharePoint, SQL, or Dataverse',
      'Only by manual data entry with no data source ever',
      'Only by scanning paper forms',
      'Only from Power BI dashboards'
    ),
    correct: ['a'],
    explanation: 'Canvas apps connect to data through connectors such as SharePoint, SQL Server, and Dataverse, in addition to manual input.',
    references: [REF_CANVAS, REF_CONNECTORS]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker needs to change a label\'s color based on a status value in a canvas app. Which capability provides this conditional logic?',
    options: opts4(
      'Power Fx expressions on the label\'s Color property',
      'A Power BI measure',
      'A Copilot Studio topic',
      'A Dataverse business unit'
    ),
    correct: ['a'],
    explanation: 'Canvas apps use Power Fx expressions bound to control properties (such as Color) to apply conditional formatting and logic without traditional code.',
    references: [REF_POWERFX, REF_CANVAS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Power Apps.',
    options: opts4(
      'Apps can be shared with other users in the organization',
      'Apps can run in a browser and in the Power Apps mobile app',
      'Model-driven apps are built on Dataverse',
      'Power Apps cannot connect to any external data'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power Apps can be shared, run in browsers and the mobile app, and model-driven apps use Dataverse. Power Apps connects to many external data sources via connectors.',
    references: [REF_APPS_OVERVIEW, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker wants to embed a Power App so users can use it inside Microsoft Teams. Which statement is correct?',
    options: opts4(
      'Power Apps can be added as apps/tabs within Microsoft Teams',
      'Power Apps cannot be used in Teams at all',
      'Only Power BI can run in Teams',
      'Apps must be printed to be used in Teams'
    ),
    correct: ['a'],
    explanation: 'Power Apps integrates with Microsoft Teams, where apps can be added as tabs or personal apps, extending where solutions are delivered.',
    references: [REF_APPS_OVERVIEW]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A maker wants to speed up building a data-entry app from an existing Excel table. Which Power Apps capability helps?',
    options: opts4(
      'Auto-generating a canvas app from the data',
      'Manually coding a database engine',
      'Using Power BI to build the form',
      'Creating a Dataverse security role'
    ),
    correct: ['a'],
    explanation: 'Power Apps can automatically generate a starter canvas app from a data source such as an Excel table, accelerating app creation.',
    references: [REF_CANVAS, REF_APPS_OVERVIEW]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants a consistent header used across many apps and managed centrally. Which Power Apps feature is best?',
    options: opts4(
      'A component in a component library',
      'A Power BI bookmark',
      'A desktop flow',
      'A Dataverse table'
    ),
    correct: ['a'],
    explanation: 'Component libraries let makers create reusable components (like a shared header) maintained centrally and used across multiple apps.',
    references: [REF_CANVAS, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE,
    stem: 'Canvas apps allow drag-and-drop placement of controls onto screens for precise UI design.',
    options: opts4('True', 'False', 'Only true for model-driven apps', 'Only true in Power BI'),
    correct: ['a'],
    explanation: 'True. Canvas apps provide a drag-and-drop design surface for placing and arranging controls to achieve precise, custom UI.',
    references: [REF_CANVAS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which choice best summarizes the capability of Power Apps in Power Platform?',
    options: opts4(
      'Rapidly building custom business applications with low-code tools',
      'Only generating analytical dashboards',
      'Only automating desktop UIs',
      'Only hosting external websites'
    ),
    correct: ['a'],
    explanation: 'Power Apps provides the "act" capability of Power Platform: rapidly building custom business apps (canvas and model-driven) using low-code tools.',
    references: [REF_APPS_OVERVIEW]
  },

  // ── Demonstrate the Capabilities of Power Automate (10) ──
  {
    domain: FLOW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A flow should run automatically when an email with an attachment arrives in a shared mailbox. Which flow type is this?',
    options: opts4(
      'An automated cloud flow',
      'A scheduled cloud flow',
      'A model-driven app',
      'A Power BI dataflow'
    ),
    correct: ['a'],
    explanation: 'Automated cloud flows start when a triggering event occurs, such as a new email with an attachment arriving in a mailbox.',
    references: [REF_FLOW_TYPES]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs a process that runs once a month to archive records. Which Power Automate flow type fits?',
    options: opts4(
      'A scheduled cloud flow',
      'An instant button flow',
      'A desktop flow only',
      'A Power BI report'
    ),
    correct: ['a'],
    explanation: 'Scheduled cloud flows execute on a recurrence such as monthly, making them appropriate for periodic archiving tasks.',
    references: [REF_FLOW_TYPES]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user wants to manually launch a flow that collects input and submits an expense. Which flow type is appropriate?',
    options: opts4(
      'An instant (button) cloud flow',
      'An automated cloud flow',
      'A Power BI dashboard',
      'A Dataverse business rule'
    ),
    correct: ['a'],
    explanation: 'Instant cloud flows are triggered on demand by a user and can collect input, suitable for actions like submitting an expense.',
    references: [REF_FLOW_TYPES, REF_FLOW_OVERVIEW]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'An accounting team must automate data entry into a legacy terminal application with no API. Which Power Automate capability applies?',
    options: opts4(
      'Desktop flows for robotic process automation',
      'Scheduled cloud flow only',
      'Power BI Q&A',
      'A Dataverse team'
    ),
    correct: ['a'],
    explanation: 'Power Automate desktop flows (RPA) automate interactions with legacy desktop applications that lack APIs or connectors.',
    references: [REF_RPA]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Power Automate.',
    options: opts4(
      'It supports cloud flows and desktop flows',
      'It can use connectors to many services',
      'It includes an approvals capability',
      'It cannot be triggered by events'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power Automate supports cloud and desktop flows, uses many connectors, and includes approvals. Flows can be triggered by events (automated flows).',
    references: [REF_FLOW_TYPES, REF_FLOW_TRIGGER]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A maker wants a quick start for a "save email attachments to OneDrive" automation. Which capability helps most?',
    options: opts4(
      'Using a Power Automate template',
      'Building a Power BI dataset',
      'Creating a Copilot Studio topic',
      'Writing a Dataverse plug-in'
    ),
    correct: ['a'],
    explanation: 'Power Automate templates provide ready-made flows (such as saving attachments to OneDrive) so users can start quickly and customize.',
    references: [REF_FLOW_TEMPLATES]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'A flow must loop over a list of records and perform an action for each. Which capability supports this?',
    options: opts4(
      'Apply to each (loop) control action',
      'Power BI cross-filter',
      'Canvas app gallery',
      'Dataverse business unit'
    ),
    correct: ['a'],
    explanation: 'Power Automate provides control actions such as Apply to each, enabling iteration over a collection of records to perform an action per item.',
    references: [REF_FLOW_OVERVIEW]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario best demonstrates orchestration across services with Power Automate?',
    options: opts4(
      'When a form is submitted, create a record, notify a channel, and start an approval',
      'Designing a printed brochure',
      'Coloring a Power BI chart',
      'Defining a Dataverse business unit'
    ),
    correct: ['a'],
    explanation: 'Reacting to a form submission by creating a record, notifying a channel, and starting an approval demonstrates Power Automate orchestrating multiple services in one flow.',
    references: [REF_FLOW_OVERVIEW, REF_FLOW_TRIGGER]
  },
  {
    domain: FLOW, difficulty: 1, type: QType.SINGLE,
    stem: 'Power Automate desktop flows can be used to automate repetitive web and Windows UI tasks.',
    options: opts4('True', 'False', 'Only true for cloud flows', 'Only true with Power BI'),
    correct: ['a'],
    explanation: 'True. Desktop flows (RPA) automate repetitive interactions with web and Windows desktop user interfaces.',
    references: [REF_RPA]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the capability Power Automate adds to Power Platform?',
    options: opts4(
      'Automating workflows and processes across apps and services',
      'Authoring interactive analytical dashboards',
      'Building external customer websites',
      'Storing relational tables as the primary data platform'
    ),
    correct: ['a'],
    explanation: 'Power Automate provides the "automate" capability — workflow and process automation across apps and services using cloud and desktop flows.',
    references: [REF_FLOW_OVERVIEW]
  },

  // ── Demonstrate the Capabilities of Power BI (10) ──
  {
    domain: BI, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Power BI component is the free Windows application used primarily for authoring reports and modeling data?',
    options: opts4(
      'Power BI Desktop',
      'Power BI service',
      'Power BI mobile',
      'Power Automate desktop'
    ),
    correct: ['a'],
    explanation: 'Power BI Desktop is the free Windows authoring tool for connecting to data, modeling, and building reports before publishing to the service.',
    references: [REF_BI_DESKTOP]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Power BI component is the cloud service where reports are shared and dashboards are built?',
    options: opts4(
      'The Power BI service',
      'Power BI Desktop',
      'Power Apps Studio',
      'Copilot Studio'
    ),
    correct: ['a'],
    explanation: 'The Power BI service is the online platform for sharing reports, building dashboards, and collaborating across the organization.',
    references: [REF_BI_SERVICE]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Power BI, what is a report?',
    options: opts4(
      'One or more pages of visualizations built from a dataset',
      'A single tile only',
      'A desktop automation script',
      'A Dataverse security role'
    ),
    correct: ['a'],
    explanation: 'A Power BI report is one or more pages of interactive visualizations created from a dataset/semantic model.',
    references: [REF_BI_BLOCKS]
  },
  {
    domain: BI, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Power BI dashboards and reports.',
    options: opts4(
      'A dashboard is a single page of tiles',
      'A report can span multiple pages',
      'Tiles can be pinned from reports to a dashboard',
      'Reports cannot contain any visualizations'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dashboards are single-page tile collections; reports can have many pages; tiles are pinned from reports to dashboards. Reports do contain visualizations.',
    references: [REF_BI_BLOCKS]
  },
  {
    domain: BI, difficulty: 3, type: QType.SINGLE,
    stem: 'An executive wants automatic notification when revenue drops below a threshold shown on a dashboard tile. Which Power BI capability supports this?',
    options: opts4(
      'Data alerts on dashboard tiles',
      'Power Fx formulas',
      'Desktop flow recorder',
      'Dataverse plug-ins'
    ),
    correct: ['a'],
    explanation: 'Power BI supports data alerts on dashboard tiles, notifying users when a metric crosses a defined threshold.',
    references: [REF_BI_SERVICE, REF_BI_BLOCKS]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'A traveling manager needs to review dashboards securely from a phone. Which Power BI capability supports this?',
    options: opts4(
      'Power BI mobile apps',
      'Power BI Desktop only',
      'Power Automate desktop',
      'Copilot Studio channels'
    ),
    correct: ['a'],
    explanation: 'Power BI mobile apps allow secure viewing and interaction with reports and dashboards on mobile devices.',
    references: [REF_BI_MOBILE]
  },
  {
    domain: BI, difficulty: 3, type: QType.SINGLE,
    stem: 'A designer wants viewers to drill from a yearly total down to monthly detail in a chart. Which Power BI feature supports this?',
    options: opts4(
      'Drill-down within a hierarchy in a visual',
      'A Power Automate trigger',
      'A Dataverse business rule',
      'A canvas app screen'
    ),
    correct: ['a'],
    explanation: 'Power BI visuals support drill-down through hierarchies, letting users move from summary (year) to detail (month) within a chart.',
    references: [REF_BI_VISUALS]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which describes a common end-to-end Power BI workflow?',
    options: opts4(
      'Connect and model data in Desktop, publish to the service, then view on web or mobile',
      'Author only in the mobile app and never publish',
      'Use Power Automate to design the visuals',
      'Store reports only on a local disk with no sharing'
    ),
    correct: ['a'],
    explanation: 'The typical workflow is authoring/modeling in Power BI Desktop, publishing to the Power BI service, and consuming reports/dashboards on the web and mobile.',
    references: [REF_BI_DESKTOP, REF_BI_SERVICE, REF_BI_MOBILE]
  },
  {
    domain: BI, difficulty: 1, type: QType.SINGLE,
    stem: 'Power BI provides interactive visualizations such as bar charts, maps, and tables to explore data.',
    options: opts4('True', 'False', 'Only static images', 'Only text output'),
    correct: ['a'],
    explanation: 'True. Power BI offers many interactive visualizations (bar, line, map, table, and more) to explore and analyze data.',
    references: [REF_BI_VISUALS]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the capability Power BI contributes to Power Platform?',
    options: opts4(
      'Business analytics — turning data into insights and dashboards',
      'Building external portals',
      'Automating desktop UI clicks',
      'Storing the primary relational database'
    ),
    correct: ['a'],
    explanation: 'Power BI delivers the analytics capability, turning data into interactive reports and dashboards for data-driven decisions.',
    references: [REF_BI_OVERVIEW]
  },

  // ── Demonstrate the Capabilities of Power Pages and Copilot Studio (9) ──
  {
    domain: PAGES, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An organization needs a public, low-code website where partners register and view their orders from Dataverse. Which product should they use?',
    options: opts4(
      'Power Pages',
      'Power BI Desktop',
      'Power Automate desktop',
      'Dataverse for Teams'
    ),
    correct: ['a'],
    explanation: 'Power Pages builds secure, low-code external websites (such as partner portals) that surface and collect Dataverse data.',
    references: [REF_PAGES]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Power Pages capability allows makers to start from prebuilt site templates and customize visually?',
    options: opts4(
      'The Power Pages design studio',
      'Power BI Q&A',
      'Power Automate desktop recorder',
      'A Dataverse security role'
    ),
    correct: ['a'],
    explanation: 'The Power Pages design studio provides templates and visual editing so makers can build and customize sites with low code.',
    references: [REF_PAGES_DESIGN]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team wants a no-code chatbot to deflect common IT helpdesk questions. Which product is designed for this?',
    options: opts4(
      'Microsoft Copilot Studio',
      'Power BI service',
      'Power Automate desktop',
      'Power Fx'
    ),
    correct: ['a'],
    explanation: 'Microsoft Copilot Studio is the low-code product for building conversational agents that answer questions and deflect repetitive support requests.',
    references: [REF_COPILOT]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'In Copilot Studio, what triggers a topic to begin handling a conversation?',
    options: opts4(
      'Trigger phrases that match user intent',
      'A Power BI dataset refresh',
      'A canvas app OnStart property',
      'A Dataverse business unit change'
    ),
    correct: ['a'],
    explanation: 'In Copilot Studio, topics are started by trigger phrases (or other triggers) that match the user\'s intent, then run the topic\'s conversation nodes.',
    references: [REF_COPILOT_TOPICS]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Power Pages and Copilot Studio.',
    options: opts4(
      'Power Pages can authenticate external users',
      'Copilot Studio agents can publish to multiple channels',
      'Copilot Studio can integrate with Power Automate to take actions',
      'Power Pages cannot connect to Dataverse'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power Pages supports external authentication, Copilot Studio publishes to many channels and can call Power Automate. Power Pages does connect to Dataverse.',
    references: [REF_PAGES, REF_COPILOT_PUBLISH]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker wants their Copilot Studio agent available in Microsoft Teams for employees. Which capability enables this?',
    options: opts4(
      'Publishing the agent to the Microsoft Teams channel',
      'Pinning a Power BI tile',
      'Adding a Dataverse business rule',
      'Creating a canvas app screen'
    ),
    correct: ['a'],
    explanation: 'Copilot Studio agents can be published to channels including Microsoft Teams, making the agent available to employees there.',
    references: [REF_COPILOT_PUBLISH]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best summarizes the capability Power Pages adds to Power Platform?',
    options: opts4(
      'Low-code creation of secure external-facing websites that use business data',
      'Authoring analytical dashboards only',
      'Robotic process automation only',
      'Replacing the Dataverse data platform'
    ),
    correct: ['a'],
    explanation: 'Power Pages adds the ability to build secure, low-code external websites that surface and collect business data, extending Power Platform to external audiences.',
    references: [REF_PAGES]
  },
  {
    domain: PAGES, difficulty: 1, type: QType.SINGLE,
    stem: 'Copilot Studio lets makers build agents using a low-code authoring experience with topics and conversation nodes.',
    options: opts4('True', 'False', 'Only with professional code', 'Only inside Power BI'),
    correct: ['a'],
    explanation: 'True. Copilot Studio provides a low-code authoring experience where makers build agents using topics, trigger phrases, and conversation nodes.',
    references: [REF_COPILOT, REF_COPILOT_TOPICS]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants a public help site plus an embedded assistant that answers FAQs and can open a case. Which combination is correct?',
    options: opts4(
      'A Power Pages site with an embedded Copilot Studio agent that calls a Power Automate flow to open the case',
      'A Power BI dashboard embedded in Power Automate desktop',
      'A canvas app embedded inside a Dataverse business unit',
      'A scheduled flow that renders the website UI'
    ),
    correct: ['a'],
    explanation: 'Combining Power Pages (the public site), an embedded Copilot Studio agent (FAQ answers), and a Power Automate flow (open the case) demonstrates these products working together.',
    references: [REF_PAGES, REF_COPILOT_PUBLISH, REF_FLOW_OVERVIEW]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Describe the Business Value of Power Platform (13) ──
  {
    domain: BUSVAL, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A hospital wants to digitize a paper intake form to reduce errors and speed processing. Which Power Platform business value does this represent?',
    options: opts4(
      'Improving accuracy and efficiency by digitizing manual processes',
      'Increasing paperwork volume',
      'Slowing down patient processing',
      'Removing all security controls'
    ),
    correct: ['a'],
    explanation: 'Digitizing a manual paper process to cut errors and speed handling is a classic Power Platform business value: improved accuracy and operational efficiency.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A manager asks how Power Platform helps without discarding existing Microsoft 365 investments. What is the best answer?',
    options: opts4(
      'It builds on and extends Microsoft 365 data and services rather than replacing them',
      'It requires removing Microsoft 365 first',
      'It cannot interact with Microsoft 365 at all',
      'It only works with non-Microsoft systems'
    ),
    correct: ['a'],
    explanation: 'Power Platform delivers value by extending existing Microsoft 365 (and Dynamics 365) investments through connectors and integration rather than replacing them.',
    references: [REF_PP_BUSVAL, REF_CONNECTORS]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL governance and administration capabilities that support the safe business adoption of Power Platform.',
    options: opts4(
      'Environments to isolate workloads',
      'Data loss prevention policies',
      'The Power Platform admin center',
      'A guarantee that no policies are ever needed'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Safe adoption is supported by environments, DLP policies, and the admin center. Governance policies are needed; there is no scenario where none are required.',
    references: [REF_ENV, REF_DLP, REF_PORTAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best describes how Power Platform supports innovation by non-developers?',
    options: opts4(
      'Low-code tools let business users prototype and deliver solutions quickly',
      'Only certified engineers may build anything',
      'Innovation requires rewriting the platform',
      'Business users are blocked from all building'
    ),
    correct: ['a'],
    explanation: 'Power Platform supports innovation by giving business users low-code tools to prototype and deliver solutions quickly, expanding who can contribute.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A company wants to reduce repetitive manual data transfers between systems. Which Power Platform value applies most directly?',
    options: opts4(
      'Process automation that reduces manual, repetitive work',
      'Increasing manual steps',
      'Removing all integrations',
      'Disabling connectors'
    ),
    correct: ['a'],
    explanation: 'Automating repetitive data transfers reduces manual effort and errors, a direct Power Platform business value delivered by Power Automate.',
    references: [REF_PP_BUSVAL, REF_FLOW_OVERVIEW]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is application lifecycle management considered part of Power Platform business value for larger organizations?',
    options: opts4(
      'It lets teams reliably move and reuse solutions across environments, lowering risk and cost',
      'It forces manual recreation in every environment',
      'It prevents any reuse of components',
      'It is unrelated to cost or risk'
    ),
    correct: ['a'],
    explanation: 'ALM via solutions and environments lets organizations reliably promote and reuse solutions across dev/test/prod, reducing deployment risk and long-term cost.',
    references: [REF_ENV, REF_PP_CORE]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL outcomes commonly used to express Power Platform business value to leadership.',
    options: opts4(
      'Reduced process cycle time',
      'Lower development cost',
      'Faster, data-driven decisions',
      'Guaranteed elimination of all risk'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Common value outcomes are reduced cycle time, lower development cost, and faster data-driven decisions. No platform can guarantee elimination of all risk.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A small team has no budget for premium licensing yet wants to learn Power Platform. Which option supports low-cost evaluation?',
    options: opts4(
      'A developer or trial environment',
      'Immediate enterprise licensing only',
      'Buying a data center',
      'Disabling the platform'
    ),
    correct: ['a'],
    explanation: 'Developer and trial environments let teams learn and prototype with little or no cost before purchasing premium licenses.',
    references: [REF_ENV, REF_CONNECTOR_LICENSE]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulated firm needs assurance that makers cannot freely combine sensitive and consumer connectors. Which capability addresses this?',
    options: opts4(
      'Data loss prevention policies',
      'Power BI bookmarks',
      'Canvas app themes',
      'Copilot Studio greetings'
    ),
    correct: ['a'],
    explanation: 'DLP policies prevent combining business and non-business connectors in the same app or flow, addressing the firm\'s data-protection assurance need.',
    references: [REF_DLP]
  },
  {
    domain: BUSVAL, difficulty: 1, type: QType.SINGLE,
    stem: 'Which phrase best summarizes the four core capabilities Power Platform brings to a business?',
    options: opts4(
      'Analyze, act, automate, and build agents/sites',
      'Print, fax, scan, and mail',
      'Compile, link, deploy, and patch only',
      'Store, archive, and delete only'
    ),
    correct: ['a'],
    explanation: 'Power Platform business value is often summarized as analyze (Power BI), act (Power Apps), automate (Power Automate), and build agents/sites (Copilot Studio, Power Pages).',
    references: [REF_PP_OVERVIEW]
  },
  {
    domain: BUSVAL, difficulty: 3, type: QType.SINGLE,
    stem: 'Power Platform can help organizations respond faster to change because solutions can be modified with low-code tools instead of long development cycles.',
    options: opts4('True', 'False', 'Only true for Azure developers', 'Only true without governance'),
    correct: ['a'],
    explanation: 'True. Low-code tools shorten the change cycle, increasing organizational agility and the ability to respond quickly to changing requirements.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best explains why citizen development is valuable to a business?',
    options: opts4(
      'It expands solution capacity by enabling business users to build approved solutions',
      'It eliminates the need for any data',
      'It removes the value of professional developers entirely',
      'It prevents collaboration between IT and business'
    ),
    correct: ['a'],
    explanation: 'Citizen development increases overall solution capacity by letting business users build approved solutions, while IT focuses on governance and complex work.',
    references: [REF_PP_BUSVAL]
  },
  {
    domain: BUSVAL, difficulty: 2, type: QType.SINGLE,
    stem: 'A leadership team wants one platform to unify reporting, apps, automation, and customer self-service. Which value does Power Platform provide?',
    options: opts4(
      'An integrated low-code suite covering analytics, apps, automation, and external engagement',
      'Four unrelated tools that cannot share data',
      'A reporting-only product',
      'An on-premises-only product'
    ),
    correct: ['a'],
    explanation: 'Power Platform\'s value is an integrated low-code suite (Power BI, Power Apps, Power Automate, Power Pages, Copilot Studio) sharing data and services across the business.',
    references: [REF_PP_OVERVIEW]
  },

  // ── Identify Core Components of Power Platform (13) ──
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component stores structured business data in tables and is shared across Power Apps and Power Automate?',
    options: opts4(
      'Microsoft Dataverse',
      'Power BI Desktop',
      'Power Pages design studio',
      'Power Fx'
    ),
    correct: ['a'],
    explanation: 'Microsoft Dataverse is the shared, secure data platform that stores business data in tables for use across Power Apps and Power Automate.',
    references: [REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component enables a flow to send a message to Microsoft Teams and read a SharePoint list?',
    options: opts4(
      'Connectors',
      'Dataverse business rules',
      'Power BI tiles',
      'Canvas components'
    ),
    correct: ['a'],
    explanation: 'Connectors provide the pre-built integrations that let flows post to Microsoft Teams and read SharePoint lists.',
    references: [REF_CONNECTORS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component adds prebuilt and custom AI models to apps and flows without data-science expertise?',
    options: opts4(
      'AI Builder',
      'Power Fx',
      'Power BI mobile',
      'Dataverse teams'
    ),
    correct: ['a'],
    explanation: 'AI Builder is the low-code AI component offering prebuilt and customizable models for Power Apps and Power Automate without data-science skills.',
    references: [REF_AIBUILDER]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'An admin must ensure a marketing team\'s experimental apps cannot touch production customer data. Which core concept should they use?',
    options: opts4(
      'Separate environments for the marketing team',
      'A single shared environment for everyone',
      'A Power BI dashboard',
      'A canvas app theme'
    ),
    correct: ['a'],
    explanation: 'Environments isolate apps, flows, and data; giving the marketing team a separate environment prevents their experiments from affecting production data.',
    references: [REF_ENV]
  },
  {
    domain: CORE, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL components that form the data and connectivity foundation of Power Platform.',
    options: opts4(
      'Microsoft Dataverse',
      'Connectors',
      'AI Builder',
      'A printer driver'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Dataverse (data), connectors (connectivity), and AI Builder (intelligence) form the platform foundation. A printer driver is not a Power Platform component.',
    references: [REF_PP_CORE, REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker needs to default a field value and prevent saving when a required condition is unmet, applied across all apps using the table. Which Dataverse feature fits?',
    options: opts4(
      'A business rule',
      'A Power BI measure',
      'A Copilot Studio topic',
      'A canvas screen'
    ),
    correct: ['a'],
    explanation: 'Dataverse business rules set defaults and enforce validation at the table level so logic applies consistently across all apps using that table.',
    references: [REF_DATAVERSE]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about connector licensing is correct?',
    options: opts4(
      'Premium connectors require eligible premium Power Platform licensing',
      'All connectors require an Azure subscription',
      'Standard connectors are never included with Microsoft 365 plans',
      'There is no licensing relevance to connectors'
    ),
    correct: ['a'],
    explanation: 'Premium connectors require eligible premium licensing, while standard connectors are included with base plans such as many Microsoft 365 subscriptions.',
    references: [REF_CONNECTOR_LICENSE]
  },
  {
    domain: CORE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team must connect to an internal HR API not covered by any built-in connector. What should they create to make it reusable?',
    options: opts4(
      'A custom connector',
      'A Power BI dataset',
      'A Dataverse business unit',
      'A Copilot Studio topic'
    ),
    correct: ['a'],
    explanation: 'A custom connector wraps the internal HR API so it can be reused across apps and flows like any standard connector.',
    references: [REF_CONNECTORS]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which component governs who can read or modify specific rows and columns of business data?',
    options: opts4(
      'The Dataverse security model (security roles, teams, business units)',
      'Power BI bookmarks',
      'Canvas app themes',
      'Power Automate templates'
    ),
    correct: ['a'],
    explanation: 'The Dataverse security model uses security roles, teams, and business units, plus row- and column-level security, to govern data access.',
    references: [REF_CDS_SECURITY]
  },
  {
    domain: CORE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Power Platform admin center.',
    options: opts4(
      'It is used to create and manage environments',
      'It is used to configure DLP policies',
      'It provides analytics about Power Platform usage',
      'It is where canvas apps are designed'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The admin center manages environments, configures DLP, and provides usage analytics. Canvas apps are designed in Power Apps Studio, not the admin center.',
    references: [REF_PORTAL, REF_ENV, REF_DLP]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which low-code formula language provides consistent expressions across Power Platform, beginning with canvas apps?',
    options: opts4(
      'Microsoft Power Fx',
      'PowerShell',
      'Java',
      'DAX exclusively'
    ),
    correct: ['a'],
    explanation: 'Microsoft Power Fx is the low-code, Excel-like language that brings consistent expressions across Power Platform, starting with canvas apps.',
    references: [REF_POWERFX]
  },
  {
    domain: CORE, difficulty: 1, type: QType.SINGLE,
    stem: 'An environment can contain its own Dataverse database, apps, and flows, and is managed from the admin center.',
    options: opts4('True', 'False', 'Only true for Power BI', 'Environments do not exist'),
    correct: ['a'],
    explanation: 'True. An environment is a container that can include a Dataverse database, apps, and flows, and is managed in the Power Platform admin center.',
    references: [REF_ENV, REF_PORTAL]
  },
  {
    domain: CORE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which mechanism packages apps, flows, and tables so they can be deployed together across environments?',
    options: opts4(
      'Solutions',
      'Dashboards',
      'Q&A',
      'Bookmarks'
    ),
    correct: ['a'],
    explanation: 'Solutions bundle related components for deployment across environments, supporting application lifecycle management.',
    references: [REF_ENV, REF_PP_CORE]
  },

  // ── Demonstrate the Capabilities of Power Apps (10) ──
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A maker wants a highly customized UI built screen by screen with full layout control. Which app type fits?',
    options: opts4(
      'Canvas app',
      'Model-driven app',
      'Power BI report',
      'Desktop flow'
    ),
    correct: ['a'],
    explanation: 'Canvas apps give complete control over screens and layout, ideal when a highly customized UI is required.',
    references: [REF_CANVAS, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'A data-driven solution on Dataverse needs standardized forms, views, and process flows with minimal layout effort. Which app type is best?',
    options: opts4(
      'Model-driven app',
      'Canvas app',
      'Power BI dashboard',
      'Cloud flow'
    ),
    correct: ['a'],
    explanation: 'Model-driven apps generate standardized forms, views, dashboards, and business process flows from the Dataverse model with little layout work.',
    references: [REF_MODEL]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a valid data source for a canvas app via a connector?',
    options: opts4(
      'Microsoft Dataverse, SharePoint, or SQL Server',
      'Only handwritten notes',
      'Only a fax line',
      'Only Power BI dashboards'
    ),
    correct: ['a'],
    explanation: 'Canvas apps connect to Dataverse, SharePoint, SQL Server, and many other sources through connectors.',
    references: [REF_CANVAS, REF_CONNECTORS]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker wants a button to be disabled until required fields are filled in a canvas app. Which capability enables this?',
    options: opts4(
      'A Power Fx expression on the button\'s DisplayMode property',
      'A Power BI measure',
      'A Dataverse business unit',
      'A Copilot Studio channel'
    ),
    correct: ['a'],
    explanation: 'Power Fx expressions bound to control properties (such as DisplayMode) implement conditional behavior like disabling a button until inputs are valid.',
    references: [REF_POWERFX, REF_CANVAS]
  },
  {
    domain: APPS, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Power Apps capabilities.',
    options: opts4(
      'Apps can be delivered to mobile devices',
      'Canvas apps support custom branding and layout',
      'Model-driven apps are based on the Dataverse data model',
      'Power Apps cannot integrate with Power Automate'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power Apps run on mobile, canvas apps support custom branding, and model-driven apps use Dataverse. Power Apps can integrate with Power Automate to run flows.',
    references: [REF_APP_TYPES, REF_APPS_OVERVIEW]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker wants to reuse a common card layout across several apps and update it in one place. Which feature should they use?',
    options: opts4(
      'A component in a component library',
      'A Power BI dashboard tile',
      'A Dataverse plug-in',
      'A scheduled flow'
    ),
    correct: ['a'],
    explanation: 'Component libraries store reusable components (like a card layout) that can be shared and centrally updated across multiple apps.',
    references: [REF_CANVAS, REF_APP_TYPES]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which capability lets Power Apps quickly create a starting app from an existing list or table?',
    options: opts4(
      'Automatic app generation from a data source',
      'Manually building a database engine',
      'Using Power BI to design the app',
      'Creating a Dataverse security role first'
    ),
    correct: ['a'],
    explanation: 'Power Apps can automatically generate a starter app from a data source such as a SharePoint list or Dataverse table, speeding initial development.',
    references: [REF_CANVAS, REF_APPS_OVERVIEW]
  },
  {
    domain: APPS, difficulty: 3, type: QType.SINGLE,
    stem: 'A company wants employees to open a custom app directly inside Microsoft Teams. Which statement is correct?',
    options: opts4(
      'Power Apps can be added to Microsoft Teams as tabs or personal apps',
      'Power Apps cannot run in Teams',
      'Only Power BI works in Teams',
      'Apps must be exported to PDF for Teams'
    ),
    correct: ['a'],
    explanation: 'Power Apps integrates with Microsoft Teams and can be surfaced as tabs or personal apps, extending where apps are used.',
    references: [REF_APPS_OVERVIEW]
  },
  {
    domain: APPS, difficulty: 1, type: QType.SINGLE,
    stem: 'Model-driven apps focus on the data model and processes, generating a consistent UI automatically.',
    options: opts4('True', 'False', 'Only true for canvas apps', 'Only true in Power BI'),
    correct: ['a'],
    explanation: 'True. Model-driven apps are driven by the Dataverse data model and processes, automatically producing a consistent, responsive UI.',
    references: [REF_MODEL]
  },
  {
    domain: APPS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the role of Power Apps within Power Platform?',
    options: opts4(
      'It provides low-code building of custom business applications',
      'It only delivers analytics dashboards',
      'It only automates desktop UIs',
      'It only builds external websites'
    ),
    correct: ['a'],
    explanation: 'Power Apps provides the low-code capability to build custom business applications (canvas and model-driven), the "act" pillar of Power Platform.',
    references: [REF_APPS_OVERVIEW]
  },

  // ── Demonstrate the Capabilities of Power Automate (10) ──
  {
    domain: FLOW, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A flow must start automatically whenever a record is created in Dataverse. Which flow type is this?',
    options: opts4(
      'An automated cloud flow',
      'A scheduled cloud flow',
      'A Power BI dataflow',
      'A model-driven app'
    ),
    correct: ['a'],
    explanation: 'Automated cloud flows are triggered by events such as a new Dataverse record being created.',
    references: [REF_FLOW_TYPES]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs a daily 7 AM job that compiles and emails a report. Which Power Automate flow type fits?',
    options: opts4(
      'A scheduled cloud flow',
      'An instant button flow',
      'A desktop flow only',
      'A Power BI report'
    ),
    correct: ['a'],
    explanation: 'Scheduled cloud flows run on a recurrence (such as daily at 7 AM), making them suitable for recurring report generation.',
    references: [REF_FLOW_TYPES]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A user wants to tap a button to start a flow that logs their current location and time. Which flow type is appropriate?',
    options: opts4(
      'An instant (button) cloud flow',
      'An automated cloud flow',
      'A Power BI dashboard',
      'A Dataverse business rule'
    ),
    correct: ['a'],
    explanation: 'Instant (button) cloud flows are triggered manually on demand, suitable for actions like logging current location and time.',
    references: [REF_FLOW_TYPES, REF_FLOW_OVERVIEW]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'A back-office team must automate a legacy desktop app that lacks an API or connector. Which Power Automate capability applies?',
    options: opts4(
      'Desktop flows (RPA)',
      'A scheduled cloud flow with a connector to the app',
      'Power BI Q&A',
      'A canvas app gallery'
    ),
    correct: ['a'],
    explanation: 'Power Automate desktop flows (RPA) automate UI interactions with legacy desktop applications that have no API or connector.',
    references: [REF_RPA]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL true statements about Power Automate cloud flows.',
    options: opts4(
      'They can be automated, instant, or scheduled',
      'They use connectors for actions',
      'They can include conditions and loops',
      'They cannot send notifications'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Cloud flows can be automated, instant, or scheduled, use connectors, and support conditions and loops. They can send notifications via connectors.',
    references: [REF_FLOW_TYPES, REF_FLOW_OVERVIEW]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'A new maker wants a fast start for a "notify me when my manager emails" automation. Which capability helps most?',
    options: opts4(
      'Starting from a Power Automate template',
      'Building a Power BI dataset',
      'Writing a Dataverse plug-in',
      'Creating a Copilot Studio topic'
    ),
    correct: ['a'],
    explanation: 'Power Automate templates provide ready-made flows that makers can use immediately and customize, speeding common automations.',
    references: [REF_FLOW_TEMPLATES]
  },
  {
    domain: FLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'A purchase request over a set amount must be approved before processing. Which Power Automate capability supports this?',
    options: opts4(
      'The approvals capability combined with a condition',
      'Power BI cross-filtering',
      'A canvas app theme',
      'A Dataverse business unit'
    ),
    correct: ['a'],
    explanation: 'Power Automate approvals plus a condition (amount threshold) enable approval routing before processing a purchase request.',
    references: [REF_FLOW_OVERVIEW, REF_FLOW_TEMPLATES]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scenario best demonstrates Power Automate connecting multiple services together?',
    options: opts4(
      'On new lead in a CRM, add a row to a spreadsheet and post to a chat channel',
      'Designing a Power BI chart color',
      'Drawing a canvas app screen',
      'Defining Dataverse business units'
    ),
    correct: ['a'],
    explanation: 'Reacting to a new CRM lead by writing to a spreadsheet and posting to chat shows Power Automate orchestrating several connected services.',
    references: [REF_FLOW_OVERVIEW, REF_FLOW_TRIGGER]
  },
  {
    domain: FLOW, difficulty: 1, type: QType.SINGLE,
    stem: 'A trigger defines what starts a flow, and actions define what the flow does after it starts.',
    options: opts4('True', 'False', 'Only true for desktop flows', 'Only true with Power BI'),
    correct: ['a'],
    explanation: 'True. In Power Automate, a trigger starts the flow and actions are the steps performed after the trigger fires.',
    references: [REF_FLOW_TRIGGER]
  },
  {
    domain: FLOW, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the capability Power Automate provides to Power Platform?',
    options: opts4(
      'Workflow and process automation across apps and services',
      'Authoring analytical dashboards',
      'Building external websites',
      'Serving as the primary data store'
    ),
    correct: ['a'],
    explanation: 'Power Automate provides workflow and process automation across apps and services, the "automate" capability of Power Platform.',
    references: [REF_FLOW_OVERVIEW]
  },

  // ── Demonstrate the Capabilities of Power BI (10) ──
  {
    domain: BI, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Power BI component is used to author and model data on a Windows desktop before publishing?',
    options: opts4(
      'Power BI Desktop',
      'Power BI service',
      'Power BI mobile',
      'Power Automate desktop'
    ),
    correct: ['a'],
    explanation: 'Power BI Desktop is the free Windows authoring application for connecting to data, modeling, and building reports before publishing to the service.',
    references: [REF_BI_DESKTOP]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'Where do users typically share reports, build dashboards, and collaborate in Power BI?',
    options: opts4(
      'The Power BI service',
      'Power BI Desktop',
      'Power Apps Studio',
      'Power Automate desktop'
    ),
    correct: ['a'],
    explanation: 'The Power BI service is the cloud platform where reports are shared, dashboards are built, and teams collaborate.',
    references: [REF_BI_SERVICE]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Power BI building block is a single-page collection of visual tiles for monitoring at a glance?',
    options: opts4(
      'A dashboard',
      'A dataflow',
      'A connector',
      'A solution'
    ),
    correct: ['a'],
    explanation: 'A dashboard is a single-page canvas of tiles used to monitor key metrics at a glance, often pinned from reports.',
    references: [REF_BI_BLOCKS]
  },
  {
    domain: BI, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL Power BI building blocks.',
    options: opts4(
      'Datasets (semantic models)',
      'Reports',
      'Dashboards',
      'Cloud flows'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Datasets/semantic models, reports, and dashboards are Power BI building blocks. Cloud flows belong to Power Automate.',
    references: [REF_BI_BLOCKS]
  },
  {
    domain: BI, difficulty: 3, type: QType.SINGLE,
    stem: 'A user wants to type "show profit by month" and get an automatic chart in Power BI. Which feature provides this?',
    options: opts4(
      'Q&A natural-language query',
      'Power Fx',
      'A desktop flow',
      'A Dataverse business rule'
    ),
    correct: ['a'],
    explanation: 'Power BI Q&A interprets natural-language questions and returns an appropriate visualization automatically.',
    references: [REF_BI_VISUALS, REF_BI_SERVICE]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'A user needs to securely review dashboards on an iOS device while away from the office. Which Power BI capability fits?',
    options: opts4(
      'Power BI mobile apps',
      'Power BI Desktop only',
      'Power Automate desktop',
      'Copilot Studio'
    ),
    correct: ['a'],
    explanation: 'Power BI mobile apps allow secure, interactive viewing of dashboards and reports on iOS and Android devices.',
    references: [REF_BI_MOBILE]
  },
  {
    domain: BI, difficulty: 3, type: QType.SINGLE,
    stem: 'A report author wants selecting a bar in one chart to filter the other visuals on the page. Which Power BI behavior provides this?',
    options: opts4(
      'Cross-filtering between visuals',
      'A Power Automate trigger',
      'A Dataverse team',
      'A canvas component'
    ),
    correct: ['a'],
    explanation: 'Power BI visuals cross-filter and cross-highlight: selecting a value in one visual filters related visuals on the same page.',
    references: [REF_BI_VISUALS]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which sequence describes a typical Power BI lifecycle?',
    options: opts4(
      'Author in Desktop, publish to the service, consume on web and mobile',
      'Author in mobile, never publish',
      'Build visuals in Power Automate',
      'Store reports only locally with no sharing'
    ),
    correct: ['a'],
    explanation: 'The typical lifecycle is authoring in Power BI Desktop, publishing to the service, and consuming reports/dashboards on the web and mobile apps.',
    references: [REF_BI_DESKTOP, REF_BI_SERVICE, REF_BI_MOBILE]
  },
  {
    domain: BI, difficulty: 1, type: QType.SINGLE,
    stem: 'Power BI reports can include interactive visuals such as charts, maps, and tables built from a dataset.',
    options: opts4('True', 'False', 'Only static text', 'Only single numbers'),
    correct: ['a'],
    explanation: 'True. Power BI reports contain interactive visualizations (charts, maps, tables, and more) built from a dataset/semantic model.',
    references: [REF_BI_VISUALS, REF_BI_BLOCKS]
  },
  {
    domain: BI, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the role Power BI plays within Power Platform?',
    options: opts4(
      'Analytics — transforming data into insights, reports, and dashboards',
      'Building external customer portals',
      'Robotic process automation',
      'Acting as the relational data store'
    ),
    correct: ['a'],
    explanation: 'Power BI provides analytics, transforming data into insights via interactive reports and dashboards — the "analyze" pillar of Power Platform.',
    references: [REF_BI_OVERVIEW]
  },

  // ── Demonstrate the Capabilities of Power Pages and Copilot Studio (9) ──
  {
    domain: PAGES, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A government agency wants a public website where citizens submit permit applications stored in Dataverse. Which product fits?',
    options: opts4(
      'Power Pages',
      'Power BI Desktop',
      'Power Automate desktop',
      'Power Fx'
    ),
    correct: ['a'],
    explanation: 'Power Pages builds secure, low-code external websites (such as a citizen permit portal) that collect and surface Dataverse data.',
    references: [REF_PAGES]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Power Pages feature lets makers visually build and style sites starting from templates?',
    options: opts4(
      'The design studio',
      'Power BI Q&A',
      'The Power Automate recorder',
      'A Dataverse security role'
    ),
    correct: ['a'],
    explanation: 'The Power Pages design studio provides templates and a visual, low-code editing experience for building and styling websites.',
    references: [REF_PAGES_DESIGN]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A service desk wants a low-code conversational agent to answer routine questions. Which product should they use?',
    options: opts4(
      'Microsoft Copilot Studio',
      'Power BI service',
      'Power Automate desktop',
      'Dataverse for Teams'
    ),
    correct: ['a'],
    explanation: 'Microsoft Copilot Studio is the low-code product for building conversational agents that answer routine questions and automate conversations.',
    references: [REF_COPILOT]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'In Copilot Studio, what is the building block that contains trigger phrases and conversation nodes for a particular subject?',
    options: opts4(
      'A topic',
      'A dataset',
      'A canvas screen',
      'A business unit'
    ),
    correct: ['a'],
    explanation: 'A topic in Copilot Studio holds trigger phrases and conversation nodes that handle a particular subject or user intent.',
    references: [REF_COPILOT_TOPICS]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.MULTI,
    stem: 'Select ALL accurate statements about how Power Pages and Copilot Studio extend Power Platform.',
    options: opts4(
      'Power Pages sites can require external user authentication',
      'Copilot Studio agents can be published to a website or Microsoft Teams',
      'Copilot Studio can call Power Automate flows',
      'Power Pages can only show static content'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Power Pages supports authenticated external users, Copilot Studio publishes to channels and can call Power Automate. Power Pages displays dynamic Dataverse data, not only static content.',
    references: [REF_PAGES, REF_COPILOT_PUBLISH]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'A maker wants the Copilot Studio agent to look up an order status during a conversation. Which capability enables this?',
    options: opts4(
      'Calling a Power Automate flow from the agent',
      'A Power BI dashboard tile',
      'A canvas app gallery',
      'A Dataverse business unit'
    ),
    correct: ['a'],
    explanation: 'Copilot Studio agents can invoke Power Automate flows to perform lookups and actions, such as retrieving an order status mid-conversation.',
    references: [REF_COPILOT, REF_FLOW_OVERVIEW]
  },
  {
    domain: PAGES, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the capability Copilot Studio adds to Power Platform?',
    options: opts4(
      'Low-code creation of conversational agents that automate interactions',
      'Authoring analytical dashboards',
      'Building relational data tables',
      'Robotic process automation only'
    ),
    correct: ['a'],
    explanation: 'Copilot Studio adds the ability to build low-code conversational agents (copilots/chatbots) that automate interactions and answer questions.',
    references: [REF_COPILOT]
  },
  {
    domain: PAGES, difficulty: 1, type: QType.SINGLE,
    stem: 'Power Pages is intended for building secure, external-facing business websites with low code.',
    options: opts4('True', 'False', 'Only internal apps', 'Only analytics dashboards'),
    correct: ['a'],
    explanation: 'True. Power Pages is the low-code product for building secure, external-facing business websites that connect to business data.',
    references: [REF_PAGES]
  },
  {
    domain: PAGES, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants a customer portal that also offers an AI assistant able to create a support ticket. Which combination is correct?',
    options: opts4(
      'Power Pages for the portal, a Copilot Studio agent embedded in it, and a Power Automate flow to create the ticket',
      'Power BI for the portal and Power Automate desktop for the assistant',
      'A canvas app as the only possible portal with no agent',
      'A scheduled flow that builds the website pages'
    ),
    correct: ['a'],
    explanation: 'Power Pages provides the customer portal, an embedded Copilot Studio agent handles the conversation, and a Power Automate flow creates the ticket — the products working together.',
    references: [REF_PAGES, REF_COPILOT_PUBLISH, REF_FLOW_OVERVIEW]
  }
];

const PL900_DOMAINS = [
  { name: BUSVAL, weight: 20 },
  { name: CORE, weight: 20 },
  { name: APPS, weight: 15 },
  { name: FLOW, weight: 15 },
  { name: BI, weight: 15 },
  { name: PAGES, weight: 15 }
];

const PL900_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-pl-900-p1',
    code: 'PL-900-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 60-minute, 65-question, blueprint-weighted set covering Power Platform business value, core components, Power Apps, Power Automate, Power BI, and Power Pages & Copilot Studio.',
    questions: P1
  },
  {
    slug: 'microsoft-pl-900-p2',
    code: 'PL-900-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-pl-900-p3',
    code: 'PL-900-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const PL900_BUNDLE = {
  slug: 'microsoft-pl-900',
  title: 'Microsoft Power Platform Fundamentals (PL-900)',
  description: 'All 3 PL-900 practice exams in one bundle — covering the business value of Power Platform, core components, Power Apps, Power Automate, Power BI, and Power Pages & Copilot Studio, aligned to the Microsoft Power Platform Fundamentals (PL-900) exam blueprint.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 9900 // USD 99 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the PL-900 bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:pl900-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedPl900(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — cloud, data, security, and the Power Platform Fundamentals (PL-900) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — cloud, data, security, and the Power Platform Fundamentals (PL-900) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of PL900_EXAMS) {
    const title = `Microsoft Power Platform Fundamentals (PL-900) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Microsoft Power Platform Fundamentals (PL-900) exam blueprint.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 60,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: PL900_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:pl900-seed' } });
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
          generatedBy: 'manual:pl900-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: PL900_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: PL900_BUNDLE.slug },
    update: {
      title: PL900_BUNDLE.title,
      description: PL900_BUNDLE.description,
      price: PL900_BUNDLE.price,
      priceVoucher: PL900_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: PL900_BUNDLE.slug,
      title: PL900_BUNDLE.title,
      description: PL900_BUNDLE.description,
      price: PL900_BUNDLE.price,
      priceVoucher: PL900_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-pl-900-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-pl-900-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-pl-900-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-pl-900-p1', tier: 'VOUCHER' as const, position: 4 }
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
