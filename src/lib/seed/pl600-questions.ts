/**
 * PL-600 bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:pl600-seed'` and upserts catalog rows.
 *
 * Exported as `seedPl600(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/pl600.ts`) and the protected
 * admin API (`/api/admin/seed-pl600`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is original, scenario-based, and authored against
 * the public Microsoft Learn PL-600 study guide and Power Platform /
 * Dataverse architecture documentation. It is NOT a copy of any real
 * exam and must never claim to be. Microsoft Power Platform Solution
 * Architect (PL-600) domain blueprint:
 *   - Perform Solution Envisioning and Requirement Analysis — 38% (25)
 *   - Architect a Solution                                  — 39% (25)
 *   - Implement the Solution                                — 23% (15)
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

const ENVISION = 'Perform Solution Envisioning and Requirement Analysis';
const ARCHITECT = 'Architect a Solution';
const IMPLEMENT = 'Implement the Solution';

const REF_SA = { label: 'Microsoft Learn — Solution Architect role', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/role-of-solution-architect' };
const REF_ENVISION = { label: 'Microsoft Learn — Solution envisioning', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/conduct-solution-envisioning' };
const REF_REQ = { label: 'Microsoft Learn — Requirement analysis', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/conduct-detailed-requirements-analysis' };
const REF_PROC = { label: 'Microsoft Learn — Identify business processes', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/identify-business-processes' };
const REF_GAP = { label: 'Microsoft Learn — Perform fit/gap analysis', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/perform-fitgap-analysis' };
const REF_ALA = { label: 'Microsoft Learn — Application lifecycle management (ALM)', url: 'https://learn.microsoft.com/en-us/power-platform/alm/' };
const REF_ALM_ENV = { label: 'Microsoft Learn — Environment strategy for ALM', url: 'https://learn.microsoft.com/en-us/power-platform/alm/environment-strategy-alm' };
const REF_SOLUTION = { label: 'Microsoft Learn — Solution concepts', url: 'https://learn.microsoft.com/en-us/power-platform/alm/solution-concepts-alm' };
const REF_SOL_LAYER = { label: 'Microsoft Learn — Solution layers', url: 'https://learn.microsoft.com/en-us/power-platform/alm/solution-layers-alm' };
const REF_PIPELINES = { label: 'Microsoft Learn — Pipelines in Power Platform', url: 'https://learn.microsoft.com/en-us/power-platform/alm/pipelines' };
const REF_DV_TABLE = { label: 'Microsoft Learn — Tables in Dataverse', url: 'https://learn.microsoft.com/en-us/power-apps/maker/data-platform/entity-overview' };
const REF_DV_REL = { label: 'Microsoft Learn — Table relationships', url: 'https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-entity-relationships' };
const REF_DV_KEY = { label: 'Microsoft Learn — Alternate keys', url: 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/define-alternate-keys-entity' };
const REF_DV_CHOICE = { label: 'Microsoft Learn — Choices (option sets)', url: 'https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-global-option-sets' };
const REF_SEC = { label: 'Microsoft Learn — Security concepts in Dataverse', url: 'https://learn.microsoft.com/en-us/power-platform/admin/wp-security-cds' };
const REF_SEC_ROLE = { label: 'Microsoft Learn — Security roles and privileges', url: 'https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges' };
const REF_BU = { label: 'Microsoft Learn — Business units', url: 'https://learn.microsoft.com/en-us/power-platform/admin/wp-security#how-business-units-control-data-access' };
const REF_TEAMS = { label: 'Microsoft Learn — Manage teams', url: 'https://learn.microsoft.com/en-us/power-platform/admin/manage-teams' };
const REF_COLSEC = { label: 'Microsoft Learn — Column-level security', url: 'https://learn.microsoft.com/en-us/power-platform/admin/field-level-security' };
const REF_DLP = { label: 'Microsoft Learn — Data loss prevention policies', url: 'https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention' };
const REF_CONN = { label: 'Microsoft Learn — Connectors overview', url: 'https://learn.microsoft.com/en-us/connectors/connectors' };
const REF_CUSTOMCONN = { label: 'Microsoft Learn — Create a custom connector', url: 'https://learn.microsoft.com/en-us/connectors/custom-connectors/' };
const REF_INTEGRATE = { label: 'Microsoft Learn — Integration architecture', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/design-integrations' };
const REF_DUALWRITE = { label: 'Microsoft Learn — Dual-write overview', url: 'https://learn.microsoft.com/en-us/power-platform/admin/wp-dual-write' };
const REF_VIRTUAL = { label: 'Microsoft Learn — Virtual tables', url: 'https://learn.microsoft.com/en-us/power-apps/maker/data-platform/create-edit-virtual-entities' };
const REF_DATAFLOW = { label: 'Microsoft Learn — Dataflows', url: 'https://learn.microsoft.com/en-us/power-query/dataflows/overview-dataflows-across-power-platform-dynamics-365' };
const REF_MIGRATE = { label: 'Microsoft Learn — Data migration concepts', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/adoption/methodology' };
const REF_PLUGIN = { label: 'Microsoft Learn — Plug-in development', url: 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/plug-ins' };
const REF_WEBHOOK = { label: 'Microsoft Learn — Webhooks', url: 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-webhooks' };
const REF_FLOW = { label: 'Microsoft Learn — Power Automate cloud flows', url: 'https://learn.microsoft.com/en-us/power-automate/overview-cloud' };
const REF_BPF = { label: 'Microsoft Learn — Business process flows', url: 'https://learn.microsoft.com/en-us/power-automate/business-process-flows-overview' };
const REF_CANVAS = { label: 'Microsoft Learn — Canvas apps overview', url: 'https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/getting-started' };
const REF_MDA = { label: 'Microsoft Learn — Model-driven apps overview', url: 'https://learn.microsoft.com/en-us/power-apps/maker/model-driven-apps/model-driven-app-overview' };
const REF_PAGES = { label: 'Microsoft Learn — Power Pages overview', url: 'https://learn.microsoft.com/en-us/power-pages/introduction' };
const REF_PCF = { label: 'Microsoft Learn — Power Apps component framework', url: 'https://learn.microsoft.com/en-us/power-apps/developer/component-framework/overview' };
const REF_PERF = { label: 'Microsoft Learn — Performance considerations', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/design-performant-solutions' };
const REF_TEST = { label: 'Microsoft Learn — Testing strategy', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/define-testing-strategy' };
const REF_GO = { label: 'Microsoft Learn — Go-live readiness', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/solution-architect/conduct-go-live' };
const REF_COE = { label: 'Microsoft Learn — Center of Excellence (CoE) starter kit', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/coe/starter-kit' };
const REF_GOV = { label: 'Microsoft Learn — Governance and administration', url: 'https://learn.microsoft.com/en-us/power-platform/guidance/adoption/admin-governance' };
const REF_LICENSE = { label: 'Microsoft Learn — Power Platform licensing', url: 'https://learn.microsoft.com/en-us/power-platform/admin/pricing-billing-skus' };
const REF_AAD = { label: 'Microsoft Learn — Authentication and Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/power-platform/admin/security/authenticate-services' };
const REF_DR = { label: 'Microsoft Learn — Business continuity and disaster recovery', url: 'https://learn.microsoft.com/en-us/power-platform/admin/business-continuity-disaster-recovery' };
const REF_STORAGE = { label: 'Microsoft Learn — Dataverse storage capacity', url: 'https://learn.microsoft.com/en-us/power-platform/admin/capacity-storage' };
const REF_AI = { label: 'Microsoft Learn — AI Builder overview', url: 'https://learn.microsoft.com/en-us/ai-builder/overview' };
const REF_COPILOT = { label: 'Microsoft Learn — Copilot Studio overview', url: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio' };
const REF_AUDIT = { label: 'Microsoft Learn — Auditing in Dataverse', url: 'https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing' };
const REF_ENV = { label: 'Microsoft Learn — Environments overview', url: 'https://learn.microsoft.com/en-us/power-platform/admin/environments-overview' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Perform Solution Envisioning and Requirement Analysis (25) ──
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During the initiate phase of a Power Platform engagement, what is the solution architect\'s primary responsibility?',
    options: opts4(
      'Writing all plug-in code for the Dataverse data model',
      'Leading discovery to understand business goals, scope, and high-level requirements before design begins',
      'Approving the customer\'s Microsoft 365 tenant billing',
      'Personally administering every environment in production'
    ),
    correct: ['b'],
    explanation: 'The solution architect leads discovery and envisioning — clarifying business goals, stakeholders, scope, and high-level requirements that drive the architecture. Writing all code or owning billing/administration is not the architect\'s primary role at initiation.',
    references: [REF_SA, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A customer says "the system must be fast." How should the solution architect handle this during requirement analysis?',
    options: opts4(
      'Accept it as-is and move on',
      'Convert it into a measurable non-functional requirement, e.g. "list views load within 3 seconds for 95% of requests"',
      'Defer all performance discussion to after go-live',
      'Replace it with a functional requirement about button colors'
    ),
    correct: ['b'],
    explanation: 'Vague quality statements must be turned into measurable non-functional requirements with acceptance criteria so the design and testing can be validated against them. Deferring or ignoring performance requirements creates risk.',
    references: [REF_REQ, REF_PERF]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL activities that belong to a fit/gap analysis for a Power Platform solution.',
    options: opts4(
      'Mapping each requirement to out-of-the-box capability, configuration, or custom development',
      'Identifying gaps that need extension (plug-ins, PCF, custom connectors) and assessing effort/risk',
      'Choosing the production datacenter region for the Microsoft Entra tenant',
      'Recording assumptions and decisions so trade-offs are traceable'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Fit/gap maps requirements to OOB/configuration/custom options, identifies and sizes gaps, and documents assumptions and decisions. Choosing the Entra tenant datacenter region is not part of fit/gap analysis.',
    references: [REF_GAP, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which technique best captures end-to-end business processes early in an engagement to align stakeholders?',
    options: opts4(
      'Writing the final security role matrix',
      'Process mapping / business process workshops that document current and future state flows',
      'Generating the Dataverse ERD from production data',
      'Configuring DLP policies for all environments'
    ),
    correct: ['b'],
    explanation: 'Process mapping workshops document current- and future-state flows, aligning stakeholders and surfacing requirements. Security matrices, ERDs, and DLP are downstream design/admin activities.',
    references: [REF_PROC, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder requests a feature that conflicts with another department\'s requirement. What should the solution architect do first?',
    options: opts4(
      'Implement both and let users decide',
      'Facilitate a prioritization discussion with stakeholders to resolve the conflict and record the decision',
      'Silently drop the lower-priority requirement',
      'Escalate directly to Microsoft support'
    ),
    correct: ['b'],
    explanation: 'Conflicting requirements are resolved by facilitating stakeholder prioritization and recording the agreed decision and rationale, keeping scope traceable. Implementing both or silently dropping one creates rework and trust issues.',
    references: [REF_REQ, REF_SA]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'During discovery you learn the customer has 4 million customer records in a legacy CRM that must be available day one. Which requirement category does this primarily inform?',
    options: opts4(
      'UI branding requirements',
      'Data migration and storage-capacity requirements',
      'Email signature requirements',
      'Mobile push-notification requirements'
    ),
    correct: ['b'],
    explanation: 'A large legacy dataset that must be available at go-live drives data migration strategy and Dataverse storage-capacity planning, which the architect must size early. It is unrelated to branding or notifications.',
    references: [REF_MIGRATE, REF_STORAGE]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Why should a solution architect identify external systems during requirement analysis?',
    options: opts4(
      'To decide the office wallpaper',
      'Because integration points affect architecture, data ownership, latency, and licensing decisions',
      'Because external systems are always replaced by Power Platform',
      'To remove the need for any security model'
    ),
    correct: ['b'],
    explanation: 'Identifying external systems early surfaces integration patterns, data ownership/system-of-record decisions, latency constraints, and connector/licensing implications that shape the architecture.',
    references: [REF_INTEGRATE, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Non-functional requirements such as availability, security, and performance should be gathered alongside functional requirements, not after go-live.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Non-functional requirements materially shape the architecture and must be captured during requirement analysis, not deferred — late discovery of NFRs is a common cause of rework.',
    references: [REF_REQ, REF_PERF]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which artifact best documents who is impacted by, and who decides on, solution scope?',
    options: opts4(
      'A stakeholder/RACI analysis',
      'A Dataverse plug-in registration',
      'A canvas app theme file',
      'A Power BI dataset refresh schedule'
    ),
    correct: ['a'],
    explanation: 'A stakeholder map / RACI clarifies who is responsible, accountable, consulted, and informed for scope decisions. The other items are implementation artifacts, not stakeholder governance tools.',
    references: [REF_SA, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer wants a "single source of truth" for accounts across Dynamics 365 Sales and an external ERP. Which envisioning question is MOST important to settle first?',
    options: opts4(
      'Which font the form should use',
      'Which system is the system of record for each data domain and how data ownership/synchronization is governed',
      'Whether to use a light or dark theme',
      'How many dashboards to build'
    ),
    correct: ['b'],
    explanation: 'Establishing the system of record per data domain and the synchronization/ownership model is foundational to integration architecture and data quality; UI/theming decisions are secondary.',
    references: [REF_INTEGRATE, REF_DUALWRITE]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best validates that requirements are correctly understood before detailed design?',
    options: opts4(
      'Skip validation to save time',
      'Replay requirements back to stakeholders using process flows, prototypes, or a solution blueprint for sign-off',
      'Only validate after the solution is in production',
      'Validate requirements with the development team alone'
    ),
    correct: ['b'],
    explanation: 'Replaying requirements via flows, prototypes, or a blueprint and obtaining stakeholder sign-off confirms shared understanding before design, reducing costly late changes.',
    references: [REF_REQ, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'During requirement analysis, a department insists on a heavily customized UI that diverges from standard model-driven app patterns. What should the architect assess?',
    options: opts4(
      'Nothing — always honor every UI request',
      'The cost, maintainability, and upgrade-impact trade-off versus configuration, and propose alternatives if risk is high',
      'Immediately reject Power Platform as unsuitable',
      'Move the requirement to a different vendor'
    ),
    correct: ['b'],
    explanation: 'The architect weighs customization cost, maintainability, and upgrade impact against configuration, then advises stakeholders with alternatives — heavy custom UI can increase total cost of ownership and upgrade risk.',
    references: [REF_GAP, REF_MDA]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the main purpose of capturing assumptions and constraints during envisioning?',
    options: opts4(
      'To make documents longer',
      'To make scope decisions explicit and traceable, reducing later disputes and rework',
      'To replace the security model',
      'To avoid talking to stakeholders'
    ),
    correct: ['b'],
    explanation: 'Documented assumptions and constraints make the basis of scope decisions explicit and traceable, limiting later disputes and scope creep.',
    references: [REF_REQ, REF_SA]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer expects 5,000 concurrent users with sub-second form loads. Which envisioning output addresses this best?',
    options: opts4(
      'A list of preferred icon colors',
      'Documented performance and scalability NFRs plus a plan to validate them with load testing',
      'A single hard-coded test user',
      'A decision to skip testing entirely'
    ),
    correct: ['b'],
    explanation: 'High concurrency and latency targets require explicit performance/scalability NFRs and a validation plan (load testing) so the architecture can be designed and proven against them.',
    references: [REF_PERF, REF_TEST]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL inputs a solution architect should review when assessing organizational readiness for Power Platform adoption.',
    options: opts4(
      'Existing licensing and tenant configuration',
      'Governance, DLP posture, and environment strategy',
      'The favorite color of the project sponsor',
      'Current skills, support model, and change-management capacity'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Readiness assessment considers licensing/tenant state, governance and environment strategy, and people factors (skills, support, change management). Personal preferences are irrelevant.',
    references: [REF_GOV, REF_LICENSE]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best distinguishes a functional requirement from a non-functional requirement?',
    options: opts4(
      'Functional = what the system does; non-functional = how well it does it (quality attributes)',
      'They are identical and interchangeable',
      'Non-functional requirements only apply to mobile apps',
      'Functional requirements are always optional'
    ),
    correct: ['a'],
    explanation: 'Functional requirements describe system behavior/features; non-functional requirements describe quality attributes (performance, availability, security) — both must be captured and validated.',
    references: [REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'A stakeholder asks for a capability already provided out-of-the-box by Dataverse and model-driven apps. What should the architect recommend?',
    options: opts4(
      'Build it as a custom plug-in anyway',
      'Use the out-of-the-box capability to reduce cost, risk, and maintenance',
      'Recommend a third-party product',
      'Defer the requirement indefinitely'
    ),
    correct: ['b'],
    explanation: 'Favoring out-of-the-box capability over custom code reduces cost, risk, and long-term maintenance — a core fit/gap principle.',
    references: [REF_GAP, REF_MDA]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'During discovery you find regulatory data-residency requirements. Why must this be captured during envisioning rather than later?',
    options: opts4(
      'It only affects app icons',
      'It constrains environment/region selection and tenant geography decisions that are costly to change post-deployment',
      'It is irrelevant to architecture',
      'It is handled automatically with no design impact'
    ),
    correct: ['b'],
    explanation: 'Data-residency rules constrain environment and tenant geography choices, which are expensive to reverse after deployment, so they must be captured during envisioning.',
    references: [REF_ENV, REF_GOV]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the value of building a low-fidelity prototype during envisioning?',
    options: opts4(
      'It is the final production solution',
      'It validates understanding and gathers feedback cheaply before committing to detailed design and build',
      'It replaces the need for requirements',
      'It eliminates testing'
    ),
    correct: ['b'],
    explanation: 'A low-fidelity prototype is a cheap way to validate understanding and gather early feedback, de-risking the eventual build — it is not the production solution.',
    references: [REF_ENVISION, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A customer demands every legacy field be migrated "just in case." How should the architect respond during requirement analysis?',
    options: opts4(
      'Migrate everything without question',
      'Challenge the requirement: assess actual business need, data quality, and cost of carrying unused data',
      'Delete the legacy system immediately',
      'Ignore data migration entirely'
    ),
    correct: ['b'],
    explanation: 'The architect should challenge "migrate everything" by assessing real business need, data quality, and the storage/maintenance cost of unused data, recommending a scoped migration.',
    references: [REF_MIGRATE, REF_STORAGE]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the goal of solution envisioning?',
    options: opts4(
      'To write production code',
      'To create a shared, high-level vision of the solution aligned to business outcomes and scope',
      'To finalize the security role matrix',
      'To configure the production tenant'
    ),
    correct: ['b'],
    explanation: 'Envisioning produces a shared high-level solution vision aligned to business outcomes and scope, guiding subsequent detailed design — not production code or tenant configuration.',
    references: [REF_ENVISION, REF_SA]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer wants AI-assisted document processing. Which envisioning activity is MOST appropriate before committing to AI Builder?',
    options: opts4(
      'Immediately build the production model',
      'Assess data availability, volume, accuracy targets, and licensing for AI Builder, and validate feasibility',
      'Assume AI will solve all problems',
      'Skip requirements for AI features'
    ),
    correct: ['b'],
    explanation: 'Before committing to AI Builder, assess training-data availability/volume, accuracy targets, and licensing/capacity, validating feasibility against business needs.',
    references: [REF_AI, REF_LICENSE]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'How should a solution architect treat a requirement with no measurable acceptance criteria?',
    options: opts4(
      'Accept it without change',
      'Work with stakeholders to define measurable, testable acceptance criteria',
      'Remove all requirements',
      'Mark the project as complete'
    ),
    correct: ['b'],
    explanation: 'Requirements need measurable, testable acceptance criteria so success can be validated; the architect collaborates with stakeholders to define them.',
    references: [REF_REQ, REF_TEST]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best reason to involve a solution architect in pre-sales/discovery?',
    options: opts4(
      'To deploy production immediately',
      'To shape feasible scope, surface risks, and align expectations with platform capability early',
      'To approve invoices',
      'To write end-user training only'
    ),
    correct: ['b'],
    explanation: 'Early architect involvement shapes feasible scope, surfaces risks, and aligns customer expectations with platform capabilities before commitments are made.',
    references: [REF_SA, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document captures the agreed scope, key requirements, and architecture direction for stakeholder sign-off?',
    options: opts4(
      'A plug-in assembly',
      'A solution blueprint / design document',
      'A Dataverse audit log',
      'A canvas app .msapp file'
    ),
    correct: ['b'],
    explanation: 'A solution blueprint/design document captures agreed scope, key requirements, and architecture direction for stakeholder sign-off — the other items are runtime/implementation artifacts.',
    references: [REF_SA, REF_REQ]
  },

  // ── Architect a Solution (25) ──
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A solution needs related Account and Contact data with referential integrity in Dataverse. Which design is appropriate?',
    options: opts4(
      'Two unrelated tables with copied text fields',
      'A one-to-many (1:N) relationship from Account to Contact using a lookup column',
      'A single flat table containing all account and contact columns',
      'Storing contacts as a comma-separated string on Account'
    ),
    correct: ['b'],
    explanation: 'A 1:N relationship with a lookup column models Account→Contact with referential integrity and is the standard Dataverse pattern. Flattening or denormalizing into strings loses integrity and relational behavior.',
    references: [REF_DV_REL, REF_DV_TABLE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You must enforce that no two Dataverse rows share the same external "CustomerNumber". Which feature should you design in?',
    options: opts4(
      'A business rule that hides the field',
      'An alternate key on the CustomerNumber column',
      'A canvas app gallery filter',
      'A Power BI measure'
    ),
    correct: ['b'],
    explanation: 'An alternate key enforces uniqueness on one or more columns (e.g., CustomerNumber) and also enables upsert by that key. Business rules, gallery filters, and BI measures do not enforce uniqueness.',
    references: [REF_DV_KEY]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL appropriate uses of the Dataverse security model to restrict access by ownership.',
    options: opts4(
      'Business units to segment data by organizational structure',
      'Security roles with privilege depth (User/BU/Parent:Child/Org) to scope access',
      'Hard-coding user IDs in plug-in source for every record',
      'Teams (owner/access) to share records across users'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Business units segment data, security roles set privilege scope/depth, and teams share records — these are the supported access-control mechanisms. Hard-coding user IDs in plug-ins is an anti-pattern.',
    references: [REF_SEC_ROLE, REF_BU, REF_TEAMS]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A solution must surface read-only data from an external SQL system inside model-driven app views without copying it into Dataverse. Which design fits best?',
    options: opts4(
      'Nightly export to CSV',
      'A Dataverse virtual table backed by the external source',
      'Manual re-keying by users',
      'Embedding screenshots of the data'
    ),
    correct: ['b'],
    explanation: 'Virtual tables surface external data in real time inside Dataverse/model-driven apps without storing a copy, ideal for read-mostly external data. The other options are not real-time or are anti-patterns.',
    references: [REF_VIRTUAL]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'Finance and Dataverse must keep Customer records bi-directionally synchronized with Dynamics 365 Finance. Which integration approach is the platform-recommended pattern?',
    options: opts4(
      'Manual CSV import twice a day',
      'Dual-write for synchronous bi-directional integration between Dataverse and finance/operations apps',
      'Screen scraping the finance UI',
      'A nightly canvas-app loop'
    ),
    correct: ['b'],
    explanation: 'Dual-write provides near-real-time, bi-directional integration between Dataverse and Dynamics 365 finance and operations apps, the recommended pattern for that scenario.',
    references: [REF_DUALWRITE, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A requirement says sensitive salary data must be hidden from most users but visible to HR. Which Dataverse capability should the architecture use?',
    options: opts4(
      'Column-level (field) security with a field security profile granting HR access',
      'A JavaScript onLoad handler that hides the field',
      'A canvas app variable',
      'Removing the column entirely'
    ),
    correct: ['a'],
    explanation: 'Column-level security restricts read/update/create of sensitive columns and grants access via field security profiles (e.g., HR). Client-side hiding is not a security control; removing the column loses the data.',
    references: [REF_COLSEC, REF_SEC]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which app type best suits a guided, data-centric internal application over many related Dataverse tables with complex security?',
    options: opts4(
      'A model-driven app',
      'A pixel-perfect marketing website',
      'A spreadsheet',
      'A standalone mobile game'
    ),
    correct: ['a'],
    explanation: 'Model-driven apps are metadata-driven, scale across many related Dataverse tables, and inherit the Dataverse security model — ideal for data-centric internal apps with complex security.',
    references: [REF_MDA, REF_SEC]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'External customers (unauthenticated and authenticated) need to submit and track requests stored in Dataverse. Which Power Platform component fits?',
    options: opts4(
      'A model-driven app shared with external Microsoft Entra accounts',
      'Power Pages (a Dataverse-backed external website with table permissions)',
      'A canvas app published only internally',
      'A Power BI report'
    ),
    correct: ['b'],
    explanation: 'Power Pages provides external-facing, Dataverse-backed sites with web roles and table permissions for anonymous/authenticated external users — the right choice for external self-service.',
    references: [REF_PAGES]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A high-volume integration sends 2 million records/day into Dataverse. Which architecture consideration is MOST important?',
    options: opts4(
      'Choosing the form header color',
      'Service protection API limits, batching, and asynchronous processing to avoid throttling',
      'Adding more dashboards',
      'Using more option sets'
    ),
    correct: ['b'],
    explanation: 'High-volume integrations must respect Dataverse service protection limits and use batching/async patterns to avoid throttling and ensure throughput — a core performance design concern.',
    references: [REF_PERF, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Synchronous plug-ins registered on the main pipeline should contain long-running external calls.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Long-running external calls in synchronous plug-ins block the transaction, risk timeouts, and harm performance; such work should be asynchronous (async plug-in, flow, webhook, or queue).',
    references: [REF_PLUGIN, REF_PERF]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A guided multi-stage sales qualification must be enforced consistently across users. Which Dataverse capability models this best?',
    options: opts4(
      'A business process flow (BPF)',
      'A printed checklist',
      'A canvas app label',
      'A Power BI bookmark'
    ),
    correct: ['a'],
    explanation: 'Business process flows model and enforce guided, multi-stage processes (e.g., lead-to-opportunity) consistently across users in model-driven apps.',
    references: [REF_BPF]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'You must call an external REST API that is not covered by any standard connector, with reusable authentication. What should the architecture include?',
    options: opts4(
      'A custom connector defining the API operations and auth',
      'Hard-coded HTTP calls in every flow with copied secrets',
      'A spreadsheet of URLs',
      'Manual API calls by end users'
    ),
    correct: ['a'],
    explanation: 'A custom connector packages the API operations and authentication for reuse across flows/apps, providing governance and DLP classification — far better than copying secrets into each flow.',
    references: [REF_CUSTOMCONN, REF_CONN]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design best supports tenant-wide governance preventing business data flowing to consumer connectors?',
    options: opts4(
      'A canvas app hidden screen',
      'Data loss prevention (DLP) policies classifying connectors into business/non-business',
      'A single shared admin password',
      'Disabling all connectors permanently'
    ),
    correct: ['b'],
    explanation: 'DLP policies classify connectors (business/non-business/blocked) and prevent data from crossing those boundaries within an environment/tenant — the governance control for this requirement.',
    references: [REF_DLP, REF_GOV]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution requires complex transactional logic that must run atomically on record create in Dataverse, with rollback on failure. Which extension point fits best?',
    options: opts4(
      'A synchronous plug-in within the database transaction',
      'A scheduled Power BI refresh',
      'A canvas app formula',
      'A manual data import'
    ),
    correct: ['a'],
    explanation: 'A synchronous plug-in runs inside the Dataverse transaction so failures roll back atomically — appropriate for transactional, must-be-consistent logic. The other options are not transactional.',
    references: [REF_PLUGIN]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the recommended way to extend a model-driven form with a rich custom UI control bound to a column?',
    options: opts4(
      'Embed an iframe to an external site for everything',
      'A Power Apps component framework (PCF) control',
      'A printed form',
      'A Power BI tile only'
    ),
    correct: ['b'],
    explanation: 'PCF lets you build reusable, supported custom controls bound to columns/datasets in model-driven and canvas apps — the recommended extensibility path for rich UI controls.',
    references: [REF_PCF]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid strategies to design for Dataverse storage-capacity efficiency.',
    options: opts4(
      'Archive or purge stale transactional data per a retention policy',
      'Store large binary files in Azure/SharePoint instead of Dataverse where appropriate',
      'Disable all auditing forever regardless of compliance needs',
      'Model data to avoid unnecessary duplication across tables'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Retention/archival, externalizing large binaries, and avoiding duplication all reduce Dataverse storage consumption. Blanket-disabling auditing ignores compliance and is not a sound storage strategy.',
    references: [REF_STORAGE, REF_AUDIT]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A requirement needs near-real-time notification to an external system whenever a Dataverse row is updated, with custom payload to an Azure endpoint. Which is most appropriate?',
    options: opts4(
      'A webhook (or service endpoint) registered on the update message',
      'A nightly export job',
      'Asking users to email the external team',
      'A Power BI alert'
    ),
    correct: ['a'],
    explanation: 'Webhooks/service endpoints push event data synchronously or asynchronously to an external HTTPS endpoint on Dataverse messages — suited to near-real-time outbound integration.',
    references: [REF_WEBHOOK, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which authentication design should the architecture specify for users accessing Power Platform apps?',
    options: opts4(
      'Shared local accounts with one password',
      'Microsoft Entra ID identities with conditional access as required',
      'Anonymous access for all internal apps',
      'A spreadsheet of credentials'
    ),
    correct: ['b'],
    explanation: 'Power Platform authenticates against Microsoft Entra ID; the architecture should use Entra identities with conditional access policies as needed, not shared/anonymous credentials.',
    references: [REF_AAD, REF_SEC]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'The customer needs business-continuity assurance for a mission-critical Dataverse solution. Which architectural input is MOST relevant?',
    options: opts4(
      'Choosing more colors',
      'Understanding the platform\'s built-in disaster-recovery/SLA model and designing within RPO/RTO expectations',
      'Adding more option sets',
      'Disabling backups'
    ),
    correct: ['b'],
    explanation: 'For business continuity, the architect must understand platform DR/SLA capabilities and design the solution and processes around realistic RPO/RTO expectations.',
    references: [REF_DR]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best practice for packaging customizations to move between environments?',
    options: opts4(
      'Manual re-creation in each environment',
      'Solutions (preferably managed in downstream environments) containing the components',
      'Copy-pasting screens',
      'Emailing instructions to admins'
    ),
    correct: ['b'],
    explanation: 'Solutions are the unit of transport for Power Platform customizations; managed solutions are recommended for downstream (test/prod) environments to ensure clean layering and ALM.',
    references: [REF_SOLUTION, REF_SOL_LAYER]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A reporting requirement needs aggregated analytics across millions of rows without impacting transactional performance. Which design is best?',
    options: opts4(
      'Run heavy aggregate queries directly on production forms',
      'Use an analytics store (e.g., Synapse Link / dataflows to a separate analytical layer) for reporting',
      'Add more plug-ins to compute totals on every read',
      'Disable security to speed up queries'
    ),
    correct: ['b'],
    explanation: 'Offloading heavy analytics to an analytical layer (Azure Synapse Link for Dataverse / dataflows) protects transactional performance while enabling large-scale reporting.',
    references: [REF_PERF, REF_DATAFLOW]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design choice best supports a consistent set of picklist values reused across many tables?',
    options: opts4(
      'A global choice (option set) referenced by multiple columns',
      'A separate hard-coded text field per table',
      'A canvas app collection',
      'A Word document list'
    ),
    correct: ['a'],
    explanation: 'A global choice (option set) centralizes picklist values for reuse and consistent maintenance across multiple columns/tables.',
    references: [REF_DV_CHOICE]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution has heavy custom JavaScript and synchronous plug-ins causing slow form saves. Which architectural remediation is most appropriate?',
    options: opts4(
      'Add more synchronous logic',
      'Move non-critical work to asynchronous processing and optimize/queue or remove unnecessary synchronous logic',
      'Disable the security model',
      'Increase the number of forms'
    ),
    correct: ['b'],
    explanation: 'Slow saves from synchronous extensions are remediated by moving non-essential work to async (flows/async plug-ins/queues) and trimming unnecessary synchronous logic — a performance design principle.',
    references: [REF_PERF, REF_PLUGIN]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct architectural use of a Power Automate cloud flow?',
    options: opts4(
      'To run a high-frequency synchronous transaction inside the Dataverse database transaction',
      'To orchestrate asynchronous, event- or schedule-driven automation and integrations across services',
      'To replace the Dataverse security model',
      'To store large binary files'
    ),
    correct: ['b'],
    explanation: 'Cloud flows orchestrate asynchronous, event/scheduled automation and cross-service integration; they are not a substitute for in-transaction synchronous logic or the security model.',
    references: [REF_FLOW, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A solution should detect duplicate accounts based on a combination of name and email. Which Dataverse design supports this?',
    options: opts4(
      'Duplicate detection rules / alternate keys depending on whether prevention or detection is required',
      'A canvas app button labeled "no duplicates"',
      'A Power BI filter',
      'Disabling create permission for everyone'
    ),
    correct: ['a'],
    explanation: 'Dataverse duplicate detection rules surface potential duplicates; alternate keys enforce hard uniqueness. The architect chooses based on whether soft detection or strict prevention is required.',
    references: [REF_DV_KEY, REF_DV_TABLE]
  },

  // ── Implement the Solution (15) ──
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which environment strategy supports a healthy ALM pipeline for Power Platform?',
    options: opts4(
      'A single shared environment for dev, test, and prod',
      'Separate Dev, Test, and Production environments with solutions promoted between them',
      'Developing directly in production',
      'No environments at all'
    ),
    correct: ['b'],
    explanation: 'A multi-environment strategy (Dev → Test → Prod) with solutions promoted between them is the recommended ALM pattern; developing in production is an anti-pattern.',
    references: [REF_ALM_ENV, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'When deploying customizations to the Test and Production environments, which solution type should you use?',
    options: opts4(
      'Unmanaged solutions in every environment',
      'Managed solutions in downstream (Test/Prod) environments',
      'No solution; manual changes',
      'Only default solution edits in production'
    ),
    correct: ['b'],
    explanation: 'Managed solutions are the supported way to deploy to downstream environments, providing clean layering and the ability to upgrade/uninstall; unmanaged is for the development environment only.',
    references: [REF_SOL_LAYER, REF_SOLUTION]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which native Power Platform capability automates solution promotion from a development to target environments with approvals?',
    options: opts4(
      'Power Platform pipelines',
      'A manual export/import every time',
      'Copying the database file',
      'Renaming the environment'
    ),
    correct: ['a'],
    explanation: 'Power Platform pipelines provide built-in, in-product deployment automation (with optional approvals) to promote solutions across environments without custom DevOps.',
    references: [REF_PIPELINES, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A go-live readiness review should validate performance, security, data migration, and operational support before cutover.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Go-live readiness validates performance, security, data migration correctness, and operational support/run-book readiness before cutover to reduce launch risk.',
    references: [REF_GO]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'During implementation, automated regression coverage is needed for a model-driven app UI. Which is an appropriate testing approach?',
    options: opts4(
      'No testing; rely on users',
      'Automated UI testing (e.g., Test Studio for canvas, EasyRepro/Playwright-style automation for model-driven) plus unit tests for plug-ins',
      'Only test in production',
      'Manually click everything once before go-live'
    ),
    correct: ['b'],
    explanation: 'A solid testing strategy combines automated UI tests and plug-in unit tests so regressions are caught early, not relying solely on manual or production testing.',
    references: [REF_TEST]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A data migration loaded records but lookups are empty. Which is the most likely implementation cause to investigate?',
    options: opts4(
      'The form color is wrong',
      'Reference/lookup mapping or load order — related records or keys were not resolved/loaded first',
      'The environment has too many users',
      'The app icon is missing'
    ),
    correct: ['b'],
    explanation: 'Empty lookups after migration typically indicate incorrect reference mapping or load order — parent/related records or alternate keys must be loaded and resolvable before dependent rows.',
    references: [REF_MIGRATE, REF_DV_KEY]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice keeps configuration data (reference tables) consistent across environments during deployment?',
    options: opts4(
      'Re-enter it by hand each time',
      'Use a configuration-migration approach (e.g., Configuration Migration tool / data in pipelines) to move reference data',
      'Ignore reference data',
      'Store it only in a developer\'s spreadsheet'
    ),
    correct: ['b'],
    explanation: 'Reference/configuration data should be moved with a configuration-migration approach so environments stay consistent — manual re-entry is error-prone and not repeatable.',
    references: [REF_ALA, REF_MIGRATE]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A plug-in works in Dev but throws an authorization error in Test. Which implementation aspect should you check first?',
    options: opts4(
      'The plug-in needs more colors',
      'Security context/connection references and environment-specific configuration (e.g., environment variables, app registrations)',
      'The number of dashboards',
      'The Dataverse logo'
    ),
    correct: ['b'],
    explanation: 'Cross-environment auth failures usually stem from environment-specific configuration — connection references, environment variables, or app registrations — that must be set per environment, not hard-coded.',
    references: [REF_PLUGIN, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the recommended source-control practice for Power Platform solution development?',
    options: opts4(
      'No source control; rely on production',
      'Export/unpack solutions into source control and use a build/release pipeline',
      'Email zip files between developers',
      'Edit managed solutions directly in production'
    ),
    correct: ['b'],
    explanation: 'Unpacking solutions into source control with a build/release pipeline gives versioning, review, and repeatable deployment — a core ALM practice.',
    references: [REF_ALA, REF_PIPELINES]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'After go-live, which capability helps the customer monitor and govern citizen-developed apps and flows at scale?',
    options: opts4(
      'The Center of Excellence (CoE) Starter Kit',
      'A single shared mailbox',
      'Disabling Power Platform entirely',
      'A printed inventory updated yearly'
    ),
    correct: ['a'],
    explanation: 'The CoE Starter Kit provides inventory, monitoring, and governance dashboards for apps/flows/environments at scale, supporting post-go-live operations.',
    references: [REF_COE, REF_GOV]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A managed solution import fails with a missing-dependency error in Production. What is the correct implementation response?',
    options: opts4(
      'Force-delete the production environment',
      'Identify and deploy the missing dependent components/solution in the correct order, then retry',
      'Ignore the error and continue',
      'Switch every solution to unmanaged in production'
    ),
    correct: ['b'],
    explanation: 'Missing-dependency import failures are resolved by deploying the required dependent components/solutions in the correct order — not by forcing deletes or switching to unmanaged in production.',
    references: [REF_SOL_LAYER, REF_SOLUTION]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best way to handle environment-specific values (like an API URL) inside a deployed solution?',
    options: opts4(
      'Hard-code the value in every component',
      'Use environment variables in the solution and set the value per environment',
      'Ask users to edit the value daily',
      'Store the value in a screenshot'
    ),
    correct: ['b'],
    explanation: 'Environment variables let a single solution carry configurable values whose current value is set per environment — the supported pattern for environment-specific settings.',
    references: [REF_ALA, REF_SOLUTION]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'During UAT, business users report a process step is missing. Which is the appropriate solution-architect-guided response?',
    options: opts4(
      'Patch directly in production without tracking',
      'Triage against agreed requirements, change the solution in Dev, retest, and promote through the pipeline',
      'Tell users to ignore it',
      'Delete the test environment'
    ),
    correct: ['b'],
    explanation: 'UAT findings are triaged against requirements, fixed in Dev, retested, and promoted via the ALM pipeline — preserving traceability and avoiding untracked production changes.',
    references: [REF_TEST, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A Copilot Studio agent is part of the solution. Which implementation concern must the architect ensure is governed before production?',
    options: opts4(
      'The agent\'s avatar color',
      'Authentication, knowledge-source/data access scope, and DLP/governance of the agent\'s connectors and topics',
      'The number of greeting messages',
      'Whether it uses emoji'
    ),
    correct: ['b'],
    explanation: 'Before production, a Copilot Studio agent\'s authentication, data/knowledge access scope, and DLP/connector governance must be validated to prevent data exposure — cosmetic concerns are secondary.',
    references: [REF_COPILOT, REF_DLP]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which post-deployment activity best ensures the solution continues to meet requirements over time?',
    options: opts4(
      'Stop monitoring once live',
      'Establish operational monitoring, support processes, and a feedback loop tied back to requirements/governance',
      'Delete documentation',
      'Disable auditing to save space'
    ),
    correct: ['b'],
    explanation: 'Sustained success requires operational monitoring, support processes, and a feedback loop linking changes back to requirements and governance — not abandoning oversight at go-live.',
    references: [REF_GO, REF_GOV]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Perform Solution Envisioning and Requirement Analysis (25) ──
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which deliverable best summarizes the scope boundary (in-scope vs out-of-scope) agreed during envisioning?',
    options: opts4(
      'A plug-in trace log',
      'A documented scope statement listing in-scope and explicitly out-of-scope items',
      'A canvas app theme',
      'A Dataverse backup file'
    ),
    correct: ['b'],
    explanation: 'A scope statement that explicitly lists in-scope and out-of-scope items prevents scope creep and aligns stakeholders — runtime logs and themes do not capture scope decisions.',
    references: [REF_ENVISION, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A customer cannot articulate detailed requirements but knows their business outcomes. Which technique helps the architect bridge this gap?',
    options: opts4(
      'Skip requirements and build immediately',
      'Outcome-driven workshops and process mapping to derive requirements from desired business outcomes',
      'Copy another customer\'s solution verbatim',
      'Only interview the IT helpdesk'
    ),
    correct: ['b'],
    explanation: 'When detailed requirements are unclear, outcome-driven workshops and process mapping derive requirements from the desired business outcomes and current/future-state flows.',
    references: [REF_ENVISION, REF_PROC]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL questions appropriate for assessing data requirements during envisioning.',
    options: opts4(
      'What are the data volumes, growth rate, and retention needs?',
      'Which system is the system of record for each data domain?',
      'What is the CEO\'s favorite color?',
      'What are the data-quality, privacy, and residency constraints?'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Data envisioning covers volumes/growth/retention, system-of-record ownership, and quality/privacy/residency constraints. Personal preferences are not data requirements.',
    references: [REF_REQ, REF_STORAGE]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary benefit of identifying personas/user types during requirement analysis?',
    options: opts4(
      'It sets the database region',
      'It informs UX, security roles, and which app types each user group needs',
      'It eliminates the need for testing',
      'It chooses the licensing tier automatically'
    ),
    correct: ['b'],
    explanation: 'Personas drive UX design, the security model, and the appropriate app type per user group — a key requirement-analysis output.',
    references: [REF_REQ, REF_SEC]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A requirement implies integrating with a system that only supports nightly file exports. Which envisioning conclusion is correct?',
    options: opts4(
      'Real-time sync is guaranteed',
      'The integration will be batch/near-real-time at best; expectations and SLAs must be set accordingly',
      'No integration is possible',
      'The architect should ignore the constraint'
    ),
    correct: ['b'],
    explanation: 'A source that only supports nightly exports constrains integration to batch/near-real-time; the architect must set realistic expectations and SLAs during envisioning.',
    references: [REF_INTEGRATE, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'During discovery the customer mentions strict audit/compliance obligations. What should the architect capture?',
    options: opts4(
      'Nothing — compliance is automatic',
      'Auditing, retention, and traceability requirements that will shape Dataverse auditing and data-handling design',
      'Only the app color scheme',
      'A request to disable logging'
    ),
    correct: ['b'],
    explanation: 'Compliance obligations translate into auditing, retention, and traceability requirements that drive Dataverse auditing configuration and data-handling design.',
    references: [REF_AUDIT, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a key reason to estimate solution complexity early in envisioning?',
    options: opts4(
      'To pick a logo',
      'To inform feasibility, timeline, licensing, and whether configuration vs. pro-dev extension is needed',
      'To avoid talking to the customer',
      'To finalize plug-in code'
    ),
    correct: ['b'],
    explanation: 'Early complexity estimation informs feasibility, timeline, licensing, and the configuration-vs-custom strategy — guiding realistic commitments.',
    references: [REF_GAP, REF_LICENSE]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A solution architect should validate that proposed requirements are technically feasible on the Power Platform before committing to them.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The architect validates technical feasibility on the platform before commitment, surfacing constraints and alternatives early to avoid downstream failure.',
    references: [REF_SA, REF_GAP]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which best describes a "requirement traceability" practice?',
    options: opts4(
      'Tracking each requirement from capture through design, build, and test/acceptance',
      'Hiding requirements from stakeholders',
      'Only documenting requirements after go-live',
      'Tracing network packets'
    ),
    correct: ['a'],
    explanation: 'Requirement traceability links each requirement from capture through design, build, and test/acceptance so coverage and changes are visible — not packet tracing.',
    references: [REF_REQ, REF_TEST]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer wants to "use AI" but has no labeled data and unclear accuracy needs. What is the architect\'s best envisioning action?',
    options: opts4(
      'Promise full automation immediately',
      'Run a feasibility assessment of data readiness, value, accuracy targets, and cost before scoping any AI capability',
      'Skip AI requirements entirely without discussion',
      'Build a production model with no data'
    ),
    correct: ['b'],
    explanation: 'Without data or clear accuracy needs, the architect runs an AI feasibility assessment (data readiness, value, accuracy, cost) before scoping the capability — neither over-promising nor silently dropping it.',
    references: [REF_AI, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which stakeholder is MOST important to engage to validate business-process requirements?',
    options: opts4(
      'The external internet service provider',
      'The business process owners / subject-matter experts who perform and own the process',
      'A random end user only',
      'The hardware vendor'
    ),
    correct: ['b'],
    explanation: 'Process owners and SMEs who perform and own the process are essential to validate that captured business-process requirements are accurate and complete.',
    references: [REF_PROC, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A requirement says "integrate with everything." How should the architect refine it during analysis?',
    options: opts4(
      'Accept it literally',
      'Decompose into specific systems, data, direction, frequency, and volume for each integration',
      'Reject all integrations',
      'Defer until after production'
    ),
    correct: ['b'],
    explanation: 'Vague integration scope must be decomposed into specific systems, data entities, direction, frequency, and volume so the integration architecture can be designed and sized.',
    references: [REF_INTEGRATE, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Why capture the current technology landscape during envisioning?',
    options: opts4(
      'To choose desktop wallpaper',
      'Because existing systems, identity, and licensing affect integration, security, and reuse decisions',
      'It has no architectural relevance',
      'Only to count servers'
    ),
    correct: ['b'],
    explanation: 'The current landscape (systems, identity, licensing) shapes integration patterns, the security/identity model, and reuse decisions in the architecture.',
    references: [REF_REQ, REF_AAD]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A government customer requires data to remain in a specific geography. Which envisioning decision must reflect this FIRST?',
    options: opts4(
      'The choice of app icon',
      'The tenant/environment region and any sovereign-cloud requirements',
      'The number of dashboards',
      'The form tab order'
    ),
    correct: ['b'],
    explanation: 'Data-geography mandates dictate tenant/environment region and possibly sovereign-cloud selection — a foundational, hard-to-reverse envisioning decision.',
    references: [REF_ENV, REF_GOV]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to run a proof of concept during envisioning.',
    options: opts4(
      'To de-risk an uncertain or novel integration/extensibility approach',
      'To validate feasibility and performance assumptions',
      'To deliver final production code without testing',
      'To gather concrete stakeholder feedback on a concept'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A PoC de-risks uncertain approaches, validates feasibility/performance, and gathers feedback — it is not a substitute for proper build and testing of production code.',
    references: [REF_ENVISION, REF_TEST]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'How should the architect handle a "nice to have" request that significantly increases complexity?',
    options: opts4(
      'Always include it',
      'Surface the cost/complexity trade-off and let stakeholders prioritize it against scope and budget',
      'Silently implement it',
      'Remove all other requirements'
    ),
    correct: ['b'],
    explanation: 'High-complexity "nice to haves" should be transparently traded off against scope and budget so stakeholders can make an informed prioritization decision.',
    references: [REF_REQ, REF_GAP]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a primary output of requirement analysis used to drive solution design?',
    options: opts4(
      'A categorized, prioritized, and validated requirements set',
      'A list of office supplies',
      'A network switch configuration',
      'A finalized marketing plan'
    ),
    correct: ['a'],
    explanation: 'Requirement analysis yields a categorized, prioritized, validated requirements set that drives the architecture and design.',
    references: [REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer expects offline mobile use for field workers with intermittent connectivity. Which envisioning consideration is critical?',
    options: opts4(
      'Choosing the splash-screen image',
      'Offline capability, conflict-resolution, and sync requirements that constrain app type and data design',
      'The number of report pages',
      'The email footer text'
    ),
    correct: ['b'],
    explanation: 'Offline field use introduces offline/sync and conflict-resolution requirements that constrain the chosen app type and data model — a critical envisioning consideration.',
    references: [REF_REQ, REF_MDA]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the architect\'s role when business and IT stakeholders disagree on a requirement\'s priority?',
    options: opts4(
      'Decide unilaterally without input',
      'Facilitate alignment, present trade-offs and platform implications, and document the agreed decision',
      'Escalate to the connector team',
      'Abandon the requirement'
    ),
    correct: ['b'],
    explanation: 'The architect facilitates alignment between business and IT, presents trade-offs/platform implications, and records the agreed decision — neither dictating nor abandoning it.',
    references: [REF_SA, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should licensing be assessed during envisioning rather than at deployment?',
    options: opts4(
      'It never changes the design',
      'Licensing affects feasible capabilities (e.g., premium connectors, AI Builder, Power Pages) and total cost, shaping the architecture',
      'It only matters for printing',
      'It is decided by end users'
    ),
    correct: ['b'],
    explanation: 'Licensing determines which capabilities (premium connectors, AI Builder, Power Pages, capacity) are feasible and the total cost — directly shaping the architecture, so it must be assessed early.',
    references: [REF_LICENSE, REF_GAP]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes "current state vs. future state" analysis?',
    options: opts4(
      'Documenting how processes work today and how they should work in the target solution to identify changes',
      'Only documenting the future with no baseline',
      'A network latency test',
      'A licensing invoice'
    ),
    correct: ['a'],
    explanation: 'Current-vs-future-state analysis baselines today\'s processes and defines the target state, exposing the changes the solution must deliver.',
    references: [REF_PROC, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer wants a single solution used by three legally separate subsidiaries with strict data isolation. Which envisioning decision is MOST critical to settle early?',
    options: opts4(
      'The shared color palette',
      'The environment/data-isolation and security strategy (e.g., separate environments vs. business units) per subsidiary',
      'The font size of headings',
      'The number of dashboards per subsidiary'
    ),
    correct: ['b'],
    explanation: 'Strict isolation across legally separate subsidiaries forces an early decision on environment segmentation vs. business-unit isolation and the security strategy — foundational and costly to change later.',
    references: [REF_ENV, REF_BU]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'What should the architect do when a requirement can be met by both configuration and custom code?',
    options: opts4(
      'Always choose custom code',
      'Recommend configuration when it meets the requirement, reserving custom code for genuine gaps to lower TCO',
      'Always choose the most complex option',
      'Let the developer decide alone with no analysis'
    ),
    correct: ['b'],
    explanation: 'Prefer configuration when it satisfies the requirement and reserve custom code for true gaps — this lowers total cost of ownership and upgrade risk.',
    references: [REF_GAP, REF_MDA]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best envisioning practice when scope is large and uncertain?',
    options: opts4(
      'Commit to a fixed full scope immediately',
      'Recommend a phased/iterative delivery with a prioritized MVP and later increments',
      'Cancel the project',
      'Ignore prioritization'
    ),
    correct: ['b'],
    explanation: 'For large, uncertain scope, a phased/iterative approach with a prioritized MVP reduces risk and delivers value sooner while learning informs later increments.',
    references: [REF_ENVISION, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact best communicates the proposed solution at a conceptual level to business stakeholders?',
    options: opts4(
      'A raw SQL schema dump',
      'A conceptual solution architecture diagram / blueprint',
      'A plug-in stack trace',
      'A list of connector API keys'
    ),
    correct: ['b'],
    explanation: 'A conceptual architecture diagram/blueprint communicates the proposed solution to business stakeholders without low-level technical noise.',
    references: [REF_SA, REF_ENVISION]
  },

  // ── Architect a Solution (25) ──
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Dataverse relationship type models a many-to-many association such as Students and Courses?',
    options: opts4(
      'A 1:N lookup only',
      'A many-to-many (N:N) relationship with an intersect table',
      'A single text column listing IDs',
      'A calculated column'
    ),
    correct: ['b'],
    explanation: 'An N:N relationship (with its intersect table) models many-to-many associations like Students↔Courses; a single lookup or text list cannot represent this correctly.',
    references: [REF_DV_REL]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A solution must let users in different regional offices see only their region\'s records by default, with managers seeing their subtree. Which design supports this?',
    options: opts4(
      'A hierarchical business-unit structure with security roles set to Business Unit / Parent:Child depth',
      'A single business unit with Organization-level read for everyone',
      'Hard-coded filters in each canvas screen',
      'Disabling security entirely'
    ),
    correct: ['a'],
    explanation: 'A hierarchical BU structure with role privilege depth (BU and Parent:Child) scopes default visibility per region while letting managers see their subtree — the intended Dataverse pattern.',
    references: [REF_BU, REF_SEC_ROLE]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL integration patterns appropriate for connecting Power Platform to external systems.',
    options: opts4(
      'Standard/custom connectors via Power Automate for service-to-service integration',
      'Dual-write for Dataverse↔Dynamics 365 finance and operations bi-directional sync',
      'Manually retyping data between systems as the strategic approach',
      'Virtual tables for real-time read of external data'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Connectors/flows, dual-write, and virtual tables are valid integration patterns. Manual retyping is not an integration architecture.',
    references: [REF_INTEGRATE, REF_DUALWRITE, REF_VIRTUAL]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the best choice for a task-focused app for frontline staff capturing inspections on tablets with a tailored UI?',
    options: opts4(
      'A canvas app',
      'A SQL Server Reporting Services report',
      'A Power BI dashboard only',
      'A SharePoint list view only'
    ),
    correct: ['a'],
    explanation: 'Canvas apps provide a tailored, task-focused UI ideal for frontline data capture on tablets/phones, with flexible layout and connectors.',
    references: [REF_CANVAS]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution requires that updating an Account cascades certain field updates to all related Contacts automatically and transactionally. Which is the most maintainable design?',
    options: opts4(
      'Configure relationship behavior / use a synchronous plug-in where cascade behavior is insufficient',
      'Ask users to update each contact manually',
      'Export, edit in Excel, and re-import nightly',
      'Use a Power BI measure'
    ),
    correct: ['a'],
    explanation: 'Relationship cascade behaviors handle related-record actions declaratively; where built-in cascade is insufficient, a synchronous plug-in keeps the update transactional and consistent.',
    references: [REF_DV_REL, REF_PLUGIN]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability should the architecture use to grant a project team shared access to a set of records regardless of business unit?',
    options: opts4(
      'An access (or owner) team with appropriate sharing',
      'Giving everyone the System Administrator role',
      'A canvas app collection',
      'A Power BI workspace'
    ),
    correct: ['a'],
    explanation: 'Access/owner teams let you share records with a defined group across business units without over-granting roles like System Administrator.',
    references: [REF_TEAMS, REF_SEC_ROLE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A solution needs reusable, governed access to an internal HTTP API across multiple apps and flows. What should the architecture include?',
    options: opts4(
      'A custom connector with defined operations and authentication',
      'Copying the API key into each app',
      'A manual process for users to call the API',
      'A screenshot of the API docs'
    ),
    correct: ['a'],
    explanation: 'A custom connector centralizes the API definition and authentication for governed reuse across apps/flows, and participates in DLP classification.',
    references: [REF_CUSTOMCONN, REF_DLP]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A reporting need requires combining Dataverse data with on-premises SQL for analytics without harming OLTP performance. Which design is appropriate?',
    options: opts4(
      'Run analytical joins live on the Dataverse forms',
      'Use dataflows/Synapse Link to land data in an analytical store and report from there',
      'Add plug-ins that aggregate on every record read',
      'Disable Dataverse security to speed reports'
    ),
    correct: ['b'],
    explanation: 'Landing data in an analytical store via dataflows/Synapse Link isolates analytics from the transactional system, protecting OLTP performance.',
    references: [REF_DATAFLOW, REF_PERF]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Choosing Organization-level read privilege for a sensitive table is the most restrictive option.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Organization level is the least restrictive (everyone can read). User level is the most restrictive; Business Unit and Parent:Child are intermediate.',
    references: [REF_SEC_ROLE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design enforces required-field and conditional logic on a form without writing code?',
    options: opts4(
      'A business rule',
      'A managed solution layer',
      'A Power BI measure',
      'An Azure Function'
    ),
    correct: ['a'],
    explanation: 'Business rules apply required/visibility/default/validation logic declaratively on forms (and server-side) without code — the low-code choice for this requirement.',
    references: [REF_DV_TABLE, REF_MDA]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'An outbound integration must guarantee delivery to an external system even if it is temporarily down. Which architecture is most resilient?',
    options: opts4(
      'Synchronous plug-in that calls the API directly and fails the transaction if the API is down',
      'Asynchronous pattern with a queue/retry (e.g., async flow or Azure Service Bus via plug-in/webhook)',
      'No integration; manual phone calls',
      'A canvas app timer'
    ),
    correct: ['b'],
    explanation: 'An asynchronous, queued/retry pattern decouples Dataverse from external availability, providing resilient guaranteed delivery — unlike a blocking synchronous call.',
    references: [REF_INTEGRATE, REF_WEBHOOK]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the recommended approach to surface a reusable React-based grid control on a model-driven form?',
    options: opts4(
      'A Power Apps component framework (PCF) dataset control',
      'A static screenshot',
      'A printed report',
      'A Power BI tile only'
    ),
    correct: ['a'],
    explanation: 'A PCF dataset control provides a reusable, supported custom grid/visual bound to Dataverse data on model-driven forms.',
    references: [REF_PCF]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which governance control prevents a maker from using a blocked connector with business data in an environment?',
    options: opts4(
      'A DLP policy assigning the connector to the Blocked group',
      'A canvas app comment',
      'A larger database',
      'A new dashboard'
    ),
    correct: ['a'],
    explanation: 'DLP policies can block specific connectors so makers cannot use them with business data in scoped environments/tenant — the intended governance control.',
    references: [REF_DLP, REF_GOV]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid considerations when designing for Dataverse performance at scale.',
    options: opts4(
      'Limit synchronous server-side logic and prefer async for non-critical work',
      'Design selective queries/views and appropriate indexing (e.g., alternate keys) to avoid full scans',
      'Add as many real-time workflows and sync plug-ins as possible',
      'Respect API service-protection limits with batching/retry'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Scale performance favors limiting sync logic, selective queries/indexing, and respecting service-protection limits with batching/retry. Piling on real-time workflows and sync plug-ins degrades performance.',
    references: [REF_PERF, REF_PLUGIN]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'A customer needs an external partner portal with role-based access to specific Dataverse tables. Which is the correct component and security mechanism?',
    options: opts4(
      'Power Pages with web roles and table permissions',
      'A model-driven app with no security',
      'A public canvas app embedding admin credentials',
      'A shared Excel file'
    ),
    correct: ['a'],
    explanation: 'Power Pages exposes Dataverse externally with web roles and table permissions controlling row/column access for partners — the correct external-portal security model.',
    references: [REF_PAGES, REF_SEC]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the appropriate use of asynchronous Dataverse plug-ins?',
    options: opts4(
      'Blocking the user until a long external call completes',
      'Performing non-immediate work (e.g., post-event processing) without blocking the user transaction',
      'Replacing the security model',
      'Storing files'
    ),
    correct: ['b'],
    explanation: 'Async plug-ins run after the transaction without blocking the user — appropriate for non-immediate post-event processing and longer operations.',
    references: [REF_PLUGIN, REF_PERF]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution must integrate with Dynamics 365 finance and operations with bi-directional, near-real-time customer/product sync. Which is the recommended platform capability?',
    options: opts4(
      'Dual-write',
      'A nightly CSV export',
      'Screen scraping',
      'Manual data entry'
    ),
    correct: ['a'],
    explanation: 'Dual-write is the recommended near-real-time bi-directional integration between Dataverse and Dynamics 365 finance and operations apps.',
    references: [REF_DUALWRITE, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design best protects a small set of highly sensitive columns visible only to a compliance team?',
    options: opts4(
      'Column-level security with a field security profile for the compliance team',
      'Hiding the columns with client script only',
      'A separate spreadsheet',
      'Organization-level read for all'
    ),
    correct: ['a'],
    explanation: 'Column-level security plus a field security profile restricts sensitive columns to authorized users (compliance team) at the platform level — client hiding is not a security boundary.',
    references: [REF_COLSEC, REF_SEC]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach centralizes consistent status values used by many tables and supports localization?',
    options: opts4(
      'A global choice (option set)',
      'A free-text column per table',
      'A canvas variable',
      'A Power BI slicer'
    ),
    correct: ['a'],
    explanation: 'A global choice centralizes reusable, localizable values across tables, ensuring consistency and easier maintenance versus free-text per table.',
    references: [REF_DV_CHOICE]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution\'s nightly batch creates 500k rows and overlaps with business hours, slowing users. Which architectural change helps most?',
    options: opts4(
      'Add more synchronous plug-ins',
      'Schedule/throttle the batch off-peak, use batching/async, and respect service-protection limits',
      'Disable the security model',
      'Add more dashboards'
    ),
    correct: ['b'],
    explanation: 'Rescheduling the batch off-peak with throttled, batched async processing within service-protection limits reduces contention with interactive users.',
    references: [REF_PERF, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct component to model a guided, stage-gated approval journey enforced in a model-driven app?',
    options: opts4(
      'A business process flow combined with cloud-flow approvals',
      'A Power BI report',
      'A static PDF',
      'A canvas label'
    ),
    correct: ['a'],
    explanation: 'A business process flow models the staged journey and integrates with cloud-flow approvals to enforce a guided, stage-gated process in model-driven apps.',
    references: [REF_BPF, REF_FLOW]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is a key reason to choose a virtual table over data import for an external dataset?',
    options: opts4(
      'It always improves write performance',
      'It avoids data duplication and provides real-time read of the source of record',
      'It disables security',
      'It eliminates the need for connectors entirely'
    ),
    correct: ['b'],
    explanation: 'Virtual tables avoid duplicating data and present real-time reads from the external source of record — ideal when the external system remains authoritative.',
    references: [REF_VIRTUAL, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A mission-critical solution needs documented recovery objectives. Which is the architect\'s correct action?',
    options: opts4(
      'Assume zero downtime is guaranteed with no plan',
      'Design operational and backup/restore processes aligned to platform DR capabilities and agreed RPO/RTO',
      'Disable backups to save storage',
      'Ignore continuity until an outage occurs'
    ),
    correct: ['b'],
    explanation: 'The architect aligns operational and backup/restore processes to platform DR capabilities and agreed RPO/RTO, rather than assuming guarantees or deferring planning.',
    references: [REF_DR]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best models per-record sharing exceptions on top of role-based access?',
    options: opts4(
      'Record sharing (grant) to specific users/teams for exceptions',
      'Giving everyone System Administrator',
      'Removing the table',
      'A canvas screen hide'
    ),
    correct: ['a'],
    explanation: 'Record-level sharing grants specific users/teams access to individual records as exceptions to the role-based model, without broadening overall privileges.',
    references: [REF_SEC, REF_TEAMS]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best choice to add AI-powered form processing of invoices into a Dataverse-backed solution?',
    options: opts4(
      'AI Builder (document/form processing) with appropriate capacity and governance',
      'A manual data-entry team only as the strategic design',
      'A Power BI visual',
      'A canvas timer control'
    ),
    correct: ['a'],
    explanation: 'AI Builder document/form processing extracts data from invoices into Dataverse with managed capacity; it should be governed appropriately as part of the architecture.',
    references: [REF_AI, REF_LICENSE]
  },

  // ── Implement the Solution (15) ──
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the correct ALM practice for the development environment?',
    options: opts4(
      'Use a managed solution for active development',
      'Develop in an unmanaged solution, then export as managed for downstream environments',
      'Develop directly against production data',
      'Avoid solutions entirely'
    ),
    correct: ['b'],
    explanation: 'Development happens in an unmanaged solution in Dev; it is exported as managed for Test/Prod — the standard ALM layering practice.',
    references: [REF_SOL_LAYER, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A deployment must move solutions across environments with built-in approval gates and minimal custom DevOps. Which feature fits?',
    options: opts4(
      'Power Platform pipelines',
      'Manual zip emailing',
      'Editing production directly',
      'A spreadsheet of changes'
    ),
    correct: ['a'],
    explanation: 'Power Platform pipelines deliver in-product deployment with optional approvals, ideal when minimal custom DevOps is desired.',
    references: [REF_PIPELINES]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution import succeeds but a flow fails because its connection is not set in the target environment. What is the correct implementation practice?',
    options: opts4(
      'Hard-code credentials into the flow',
      'Use connection references in the solution and bind them to target-environment connections during deployment',
      'Recreate the flow manually in production',
      'Ignore the failure'
    ),
    correct: ['b'],
    explanation: 'Connection references decouple flows from environment-specific connections; they are bound to the target environment\'s connections at deployment — the supported ALM practice.',
    references: [REF_ALA, REF_FLOW]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Performance and load testing should be completed and signed off before the go-live decision for a high-volume solution.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. For high-volume solutions, performance/load testing must be completed and signed off as part of go-live readiness to avoid launch-day failures.',
    references: [REF_TEST, REF_GO]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the recommended way to move reference/configuration data between environments repeatably?',
    options: opts4(
      'Type it again in each environment',
      'Use a configuration/data migration approach (Configuration Migration tool or data deployment in pipelines)',
      'Screenshot the data',
      'Skip configuration data'
    ),
    correct: ['b'],
    explanation: 'A configuration/data migration approach makes reference-data movement repeatable and consistent across environments, unlike manual re-entry.',
    references: [REF_MIGRATE, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A managed-solution upgrade removed a column still referenced by a custom flow, breaking it. Which implementation practice would have prevented this?',
    options: opts4(
      'Skipping testing to deploy faster',
      'Dependency analysis and regression testing in a Test environment before promoting to Production',
      'Editing the managed solution in production',
      'Disabling the flow permanently'
    ),
    correct: ['b'],
    explanation: 'Dependency analysis plus regression testing in Test before Production promotion catches breaking changes (like removed columns) prior to impacting production.',
    references: [REF_SOL_LAYER, REF_TEST]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct way to handle an environment-specific API endpoint inside a deployed managed solution?',
    options: opts4(
      'Hard-code it in a plug-in for all environments',
      'Use a solution environment variable set per environment',
      'Ask each user to type it',
      'Store it in a Power BI dataset'
    ),
    correct: ['b'],
    explanation: 'Environment variables carry environment-specific values in a single solution, set per environment at deployment — the supported configuration pattern.',
    references: [REF_ALA, REF_SOLUTION]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'After go-live, citizen developers proliferate apps. Which tool helps the customer inventory and govern them?',
    options: opts4(
      'The CoE Starter Kit',
      'A manual annual audit only',
      'Turning off Power Platform',
      'A single shared mailbox'
    ),
    correct: ['a'],
    explanation: 'The CoE Starter Kit inventories and governs apps/flows/environments at scale — appropriate for ongoing operations after go-live.',
    references: [REF_COE, REF_GOV]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A plug-in must run with elevated privileges to update records the calling user cannot access. Which is the correct implementation approach?',
    options: opts4(
      'Grant every user System Administrator',
      'Use an appropriate execution context / impersonation pattern (e.g., run-as / a privileged service principal) rather than broadening user roles',
      'Disable security checks in the org',
      'Store admin credentials in the plug-in'
    ),
    correct: ['b'],
    explanation: 'Elevated operations should use the supported execution-context/impersonation pattern (e.g., a privileged service principal/run-as) instead of over-privileging users or embedding credentials.',
    references: [REF_PLUGIN, REF_SEC]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice ensures the deployed solution can be reliably rebuilt and audited?',
    options: opts4(
      'Keeping the only copy in production',
      'Storing unpacked solution source in version control with a repeatable build pipeline',
      'Emailing zip files',
      'No documentation'
    ),
    correct: ['b'],
    explanation: 'Version-controlled, unpacked solution source plus a repeatable build pipeline makes the solution auditable and reliably rebuildable — a core ALM control.',
    references: [REF_ALA, REF_PIPELINES]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'During cutover, the data migration must be validated. Which is the best implementation activity?',
    options: opts4(
      'Assume the migration worked',
      'Reconcile record counts, key relationships, and sample data against the source, with sign-off',
      'Delete the source immediately',
      'Skip validation to save time'
    ),
    correct: ['b'],
    explanation: 'Migration validation reconciles counts, relationships, and sampled data against the source with formal sign-off before the source is decommissioned.',
    references: [REF_MIGRATE, REF_GO]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A Copilot Studio agent must only answer from approved knowledge and respect data boundaries before production. Which implementation control is essential?',
    options: opts4(
      'Letting it use any public source freely',
      'Scoping knowledge sources, authentication, and DLP/connector governance, then testing responses',
      'Disabling all logging',
      'Skipping review to launch faster'
    ),
    correct: ['b'],
    explanation: 'Before production, the agent\'s knowledge sources, authentication, and connector/DLP governance must be scoped and its responses tested to prevent data leakage.',
    references: [REF_COPILOT, REF_DLP]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the recommended response when UAT reveals a requirement gap late in the project?',
    options: opts4(
      'Hot-fix directly in production untracked',
      'Assess impact against scope, change in Dev, retest, and promote through the pipeline with stakeholder agreement',
      'Ship anyway and ignore it',
      'Delete the UAT environment'
    ),
    correct: ['b'],
    explanation: 'A late gap is impact-assessed against scope, fixed in Dev, retested, and promoted via the ALM pipeline with stakeholder agreement — preserving traceability and quality.',
    references: [REF_TEST, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which post-go-live practice keeps the solution aligned with evolving requirements?',
    options: opts4(
      'Freeze the solution and stop all change management',
      'Operate a governed change/feedback process with monitoring and prioritized backlog increments',
      'Allow ungoverned production edits',
      'Remove all environments'
    ),
    correct: ['b'],
    explanation: 'A governed change/feedback process with monitoring and a prioritized backlog keeps the solution aligned with evolving needs while controlling risk.',
    references: [REF_GOV, REF_GO]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is correct about deploying customizations directly in a production environment\'s default solution?',
    options: opts4(
      'It is the recommended ALM approach',
      'It is discouraged; changes should flow from Dev via managed solutions through the ALM pipeline',
      'It guarantees easier upgrades',
      'It removes the need for testing'
    ),
    correct: ['b'],
    explanation: 'Editing production\'s default solution directly bypasses ALM layering and testing; changes should originate in Dev and flow as managed solutions through the pipeline.',
    references: [REF_SOL_LAYER, REF_ALA]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Perform Solution Envisioning and Requirement Analysis (25) ──
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the FIRST thing a solution architect should establish in an engagement?',
    options: opts4(
      'The exact plug-in class names',
      'The business problem and desired outcomes the solution must achieve',
      'The production environment\'s GUID',
      'The canvas app color theme'
    ),
    correct: ['b'],
    explanation: 'Understanding the business problem and desired outcomes anchors all subsequent scope, requirements, and architecture decisions — it must come first.',
    references: [REF_ENVISION, REF_SA]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A requirement reads "the app should be secure." How should the architect refine it?',
    options: opts4(
      'Leave it vague',
      'Decompose into concrete security requirements: authentication, authorization model, data protection, auditing, compliance',
      'Replace it with a UI requirement',
      'Defer security to post-go-live'
    ),
    correct: ['b'],
    explanation: '"Secure" must be decomposed into concrete, testable requirements — authentication, authorization, data protection, auditing, and compliance — to drive the security architecture.',
    references: [REF_SEC, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate envisioning outputs.',
    options: opts4(
      'A high-level solution vision/blueprint',
      'A prioritized, validated requirements set',
      'Fully tested production code',
      'Identified risks, assumptions, and constraints'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Envisioning produces a solution vision, a prioritized/validated requirements set, and identified risks/assumptions/constraints — not finished production code.',
    references: [REF_ENVISION, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A solution architect should challenge requirements that add cost or risk without clear business value.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The architect constructively challenges low-value, high-cost/risk requirements so stakeholders can make informed prioritization decisions.',
    references: [REF_SA, REF_GAP]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best way to capture integration requirements for a system the customer "thinks" they need to connect to?',
    options: opts4(
      'Assume bi-directional real-time sync',
      'Confirm the actual systems, data, direction, volume, frequency, and ownership before designing',
      'Ignore it until production',
      'Decide unilaterally without the customer'
    ),
    correct: ['b'],
    explanation: 'Integration requirements must be confirmed (systems, data, direction, volume, frequency, ownership) rather than assumed, to design a correct and sized integration.',
    references: [REF_INTEGRATE, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A customer requests offline access for inspectors. Which envisioning impact is MOST significant?',
    options: opts4(
      'It changes only the logo',
      'It constrains app type, data design, and sync/conflict requirements',
      'It has no architectural impact',
      'It only affects the report colors'
    ),
    correct: ['b'],
    explanation: 'Offline access drives app-type selection, data design, and sync/conflict handling — a significant architecture-shaping requirement.',
    references: [REF_REQ, REF_MDA]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes prioritization techniques (e.g., MoSCoW) in requirement analysis?',
    options: opts4(
      'A way to rank requirements (Must/Should/Could/Won\'t) to manage scope and trade-offs',
      'A network protocol',
      'A Dataverse storage tier',
      'A connector authentication method'
    ),
    correct: ['a'],
    explanation: 'MoSCoW (Must/Should/Could/Won\'t) ranks requirements to manage scope and trade-offs transparently with stakeholders.',
    references: [REF_REQ, REF_GAP]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Why must the architect assess data volume and growth during envisioning?',
    options: opts4(
      'It only affects the icon',
      'It informs storage capacity, performance design, and archival/retention strategy',
      'It has no design impact',
      'It is decided after go-live'
    ),
    correct: ['b'],
    explanation: 'Data volume/growth informs Dataverse storage capacity, performance design, and retention/archival strategy — all architecture-relevant and best assessed early.',
    references: [REF_STORAGE, REF_PERF]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the architect\'s best response to "we want it to work like our old system exactly"?',
    options: opts4(
      'Replicate the old system one-for-one regardless of cost',
      'Understand the underlying needs, then propose how the platform best meets them, challenging like-for-like where it adds cost/risk',
      'Reject the project',
      'Ignore the statement'
    ),
    correct: ['b'],
    explanation: 'Like-for-like replication often imports legacy waste; the architect uncovers underlying needs and proposes the best platform fit, challenging unnecessary replication.',
    references: [REF_GAP, REF_SA]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer expects 99.9% availability and strict RPO/RTO. Which envisioning action is essential?',
    options: opts4(
      'Promise zero downtime with no analysis',
      'Capture availability and RPO/RTO as NFRs and validate them against platform DR/SLA capabilities',
      'Ignore availability requirements',
      'Decide colors first'
    ),
    correct: ['b'],
    explanation: 'Availability and RPO/RTO must be captured as NFRs and reconciled with platform DR/SLA capabilities so the design and expectations are realistic.',
    references: [REF_DR, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best reason to involve security/compliance stakeholders during requirement analysis?',
    options: opts4(
      'They choose the app theme',
      'They define data-protection, access, and regulatory requirements that shape the security architecture',
      'They write the plug-ins',
      'They have no relevant input'
    ),
    correct: ['b'],
    explanation: 'Security/compliance stakeholders define data-protection, access, and regulatory requirements that directly shape the security architecture and must be captured early.',
    references: [REF_SEC, REF_GOV]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'How should the architect treat conflicting non-functional and functional requirements (e.g., rich UI vs. strict performance budget)?',
    options: opts4(
      'Ignore the conflict',
      'Surface the trade-off, quantify impact, and facilitate a stakeholder decision with documented rationale',
      'Always favor the UI',
      'Always favor performance silently'
    ),
    correct: ['b'],
    explanation: 'NFR/functional conflicts are surfaced with quantified impact and resolved through a documented stakeholder decision, not silently or by default bias.',
    references: [REF_REQ, REF_PERF]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which describes the purpose of a requirements workshop?',
    options: opts4(
      'To collaboratively elicit, clarify, and validate requirements with stakeholders',
      'To deploy production',
      'To configure DLP only',
      'To write release notes'
    ),
    correct: ['a'],
    explanation: 'Requirements workshops collaboratively elicit, clarify, and validate requirements with stakeholders — a core requirement-analysis technique.',
    references: [REF_REQ, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer wants generative AI assistance over their Dataverse data. Which envisioning concern is MOST important before scoping it?',
    options: opts4(
      'The chatbot avatar',
      'Data governance, grounding/knowledge scope, security/DLP, and licensing feasibility',
      'The greeting message wording',
      'The number of emojis used'
    ),
    correct: ['b'],
    explanation: 'Generative AI over business data must be scoped against data governance, grounding/knowledge boundaries, security/DLP, and licensing feasibility before commitment.',
    references: [REF_COPILOT, REF_DLP]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid envisioning risk categories an architect should track.',
    options: opts4(
      'Technical feasibility and integration risk',
      'Data quality and migration risk',
      'The brand of the project manager\'s laptop',
      'Adoption, governance, and licensing/capacity risk'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Tracked risk categories include technical/integration, data quality/migration, and adoption/governance/licensing — irrelevant items like laptop brand are not risks.',
    references: [REF_GOV, REF_REQ]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best practice when a requirement\'s feasibility on Power Platform is uncertain?',
    options: opts4(
      'Commit to it anyway',
      'Run a focused proof of concept or spike to validate before committing scope',
      'Reject the whole project',
      'Defer all analysis to the developers'
    ),
    correct: ['b'],
    explanation: 'Uncertain feasibility is validated with a focused PoC/spike before committing scope, reducing the risk of late, costly surprises.',
    references: [REF_ENVISION, REF_TEST]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a key envisioning question about users?',
    options: opts4(
      'What desktop wallpaper do they prefer?',
      'Who are the user groups, what are their tasks, volumes, devices, and access needs?',
      'What is their favorite food?',
      'What time do they take lunch?'
    ),
    correct: ['b'],
    explanation: 'User envisioning asks who the user groups are and their tasks, volumes, devices, and access needs — these drive UX, app type, and security design.',
    references: [REF_REQ, REF_SEC]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer wants one solution for multiple countries with different languages and regulations. Which envisioning decision is foundational?',
    options: opts4(
      'The home-page banner image',
      'Localization, data-residency, and regulatory/regional configuration strategy',
      'The number of charts',
      'The button corner radius'
    ),
    correct: ['b'],
    explanation: 'Multi-country solutions require an early, foundational decision on localization, data residency, and regional/regulatory configuration — costly to retrofit.',
    references: [REF_GOV, REF_ENV]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes how the architect should document a requirement decision?',
    options: opts4(
      'Verbally only, with no record',
      'Recorded with rationale, owner, date, and impact for traceability',
      'In a private note never shared',
      'Only after go-live'
    ),
    correct: ['b'],
    explanation: 'Decisions are recorded with rationale, owner, date, and impact so the basis of scope/architecture choices is traceable and auditable.',
    references: [REF_REQ, REF_SA]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'A customer wants extensive custom development. What should the architect evaluate during analysis?',
    options: opts4(
      'Nothing — always allow it',
      'Whether configuration/low-code meets the need, plus maintainability, upgrade impact, and total cost of custom code',
      'Only the developer\'s preference',
      'The color of the IDE'
    ),
    correct: ['b'],
    explanation: 'Extensive custom development should be evaluated against low-code alternatives, maintainability, upgrade impact, and total cost — favoring configuration where adequate.',
    references: [REF_GAP, REF_MDA]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the benefit of a future-state process map?',
    options: opts4(
      'It is the production code',
      'It defines the target way of working and exposes the changes the solution must enable',
      'It replaces the security model',
      'It configures the tenant'
    ),
    correct: ['b'],
    explanation: 'A future-state process map defines the target way of working and reveals the gap/changes the solution must deliver — guiding design.',
    references: [REF_PROC, REF_ENVISION]
  },
  {
    domain: ENVISION, difficulty: 4, type: QType.SINGLE,
    stem: 'A customer requires integration with a partner API that is rate-limited to 100 calls/minute. Which envisioning conclusion is correct?',
    options: opts4(
      'Unlimited real-time calls are fine',
      'The integration design must respect the rate limit (throttling/queuing/batching) and set realistic SLAs',
      'No integration is possible',
      'The limit can be ignored'
    ),
    correct: ['b'],
    explanation: 'A partner API rate limit constrains the integration design to throttling/queuing/batching and realistic SLA expectations — a key envisioning conclusion.',
    references: [REF_INTEGRATE, REF_PERF]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best approach when stakeholders provide requirements at very different levels of detail?',
    options: opts4(
      'Use only the most detailed ones',
      'Normalize requirements to a consistent level, validate, and prioritize them together',
      'Ignore high-level ones',
      'Implement them in arrival order'
    ),
    correct: ['b'],
    explanation: 'Requirements at mixed granularity should be normalized to a consistent level, validated, and prioritized together to enable coherent design.',
    references: [REF_REQ, REF_GAP]
  },
  {
    domain: ENVISION, difficulty: 3, type: QType.SINGLE,
    stem: 'Why involve an architect in estimating effort during envisioning?',
    options: opts4(
      'To pick fonts',
      'Effort/feasibility estimates inform realistic scope, timeline, budget, and configuration-vs-custom decisions',
      'It is irrelevant to scope',
      'Only finance should estimate'
    ),
    correct: ['b'],
    explanation: 'Architect-led effort/feasibility estimates ground scope, timeline, budget, and the configuration-vs-custom strategy in reality.',
    references: [REF_GAP, REF_SA]
  },
  {
    domain: ENVISION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a valid envisioning question about reporting and analytics?',
    options: opts4(
      'What color are the charts?',
      'What decisions must the data support, at what latency, volume, and audience?',
      'How many fonts are available?',
      'What is the screensaver timeout?'
    ),
    correct: ['b'],
    explanation: 'Analytics envisioning asks what decisions the data must support and the required latency, volume, and audience — driving the reporting architecture.',
    references: [REF_REQ, REF_DATAFLOW]
  },

  // ── Architect a Solution (25) ──
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A solution stores Orders that each belong to one Customer, but a Customer has many Orders. Which Dataverse relationship is correct?',
    options: opts4(
      'N:N between Order and Customer',
      '1:N from Customer to Order with a lookup on Order',
      'No relationship; duplicate customer fields on Order',
      'A calculated column on Customer'
    ),
    correct: ['b'],
    explanation: 'A 1:N relationship from Customer to Order (lookup on Order) correctly models "a customer has many orders, an order has one customer" with referential integrity.',
    references: [REF_DV_REL, REF_DV_TABLE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which design enforces that a salesperson sees only their own opportunities while their manager sees the team\'s, without custom code?',
    options: opts4(
      'Security roles with User and Parent:Child/BU privilege depth in a business-unit hierarchy',
      'A canvas filter only',
      'Organization-level read for all users',
      'Disabling security'
    ),
    correct: ['a'],
    explanation: 'Setting security-role privilege depth (User for the salesperson, Parent:Child/BU for managers) within a BU hierarchy delivers this visibility natively, no code required.',
    references: [REF_SEC_ROLE, REF_BU]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL appropriate uses of asynchronous processing in a Power Platform solution.',
    options: opts4(
      'Long-running external API calls triggered by record events',
      'Bulk/batch data processing that should not block users',
      'Logic that must complete atomically inside the create transaction',
      'Non-immediate notifications and downstream integrations'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Async suits long external calls, bulk processing, and non-immediate notifications/integrations. Atomic-in-transaction logic must be synchronous, so that option is not appropriate for async.',
    references: [REF_PLUGIN, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component is best for an internal, data-rich app spanning many related Dataverse tables with role-based security and dashboards?',
    options: opts4(
      'A model-driven app',
      'A public Power Pages site',
      'A spreadsheet',
      'A Power BI report alone'
    ),
    correct: ['a'],
    explanation: 'Model-driven apps natively span related Dataverse tables, inherit role-based security, and host dashboards — the right fit for internal data-rich apps.',
    references: [REF_MDA, REF_SEC]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'Customer master data must stay synchronized in near real time, both directions, between Dataverse and Dynamics 365 finance and operations. Which capability is recommended?',
    options: opts4(
      'Dual-write',
      'A nightly export job',
      'Manual entry',
      'A canvas timer loop'
    ),
    correct: ['a'],
    explanation: 'Dual-write provides the recommended near-real-time, bi-directional sync between Dataverse and Dynamics 365 finance and operations apps.',
    references: [REF_DUALWRITE, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which mechanism best surfaces read-only external reference data inside model-driven views in real time?',
    options: opts4(
      'A virtual table',
      'A nightly import',
      'A static export',
      'A printed list'
    ),
    correct: ['a'],
    explanation: 'Virtual tables present external data in real time within Dataverse/model-driven apps without copying it — ideal for read-only external reference data.',
    references: [REF_VIRTUAL]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct way to give an external vendor access to only specific tables and rows via a website?',
    options: opts4(
      'Power Pages with web roles and table permissions scoped to the vendor',
      'Sharing a System Administrator account',
      'A public canvas app with embedded admin credentials',
      'Emailing CSV extracts'
    ),
    correct: ['a'],
    explanation: 'Power Pages with web roles and scoped table permissions grants external vendors least-privilege access to specific tables/rows — the secure pattern.',
    references: [REF_PAGES, REF_SEC]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A heavy nightly integration is throttled by Dataverse service protection limits. Which architectural approach addresses this?',
    options: opts4(
      'Ignore the limits and retry instantly in a tight loop',
      'Batch requests, implement exponential backoff/retry, and spread load within service-protection limits',
      'Disable security to go faster',
      'Move all logic to synchronous plug-ins'
    ),
    correct: ['b'],
    explanation: 'Respecting service-protection limits with batching and exponential backoff/retry, spreading the load, is the correct way to handle throttling — tight retry loops worsen it.',
    references: [REF_PERF, REF_INTEGRATE]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Column-level security is the appropriate mechanism to restrict who can see specific sensitive columns within an otherwise accessible row.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Column-level (field) security restricts read/update/create of specific sensitive columns independent of row access, via field security profiles.',
    references: [REF_COLSEC]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the recommended packaging strategy for moving customizations between Dev, Test, and Prod?',
    options: opts4(
      'Manual rebuild in each environment',
      'Solutions, exported managed for downstream environments',
      'Copy database backups',
      'Email change instructions'
    ),
    correct: ['b'],
    explanation: 'Solutions are the transport unit; managed solutions are used for downstream (Test/Prod) environments to enforce clean layering — manual rebuilds are error-prone.',
    references: [REF_SOLUTION, REF_SOL_LAYER]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution needs guaranteed-once processing of inbound messages from an external system into Dataverse. Which design is most robust?',
    options: opts4(
      'A synchronous plug-in calling the external system on every form load',
      'An async queue/integration with idempotent processing keyed by an alternate key for deduplication',
      'A canvas app button users press',
      'A Power BI scheduled refresh'
    ),
    correct: ['b'],
    explanation: 'An async queued integration with idempotent processing and alternate-key-based deduplication provides robust, effectively-once ingestion despite retries.',
    references: [REF_INTEGRATE, REF_DV_KEY]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the appropriate low-code mechanism to default and validate field values on a form server-side and client-side?',
    options: opts4(
      'A business rule',
      'A managed solution',
      'A DLP policy',
      'A Power BI measure'
    ),
    correct: ['a'],
    explanation: 'Business rules apply defaults, visibility, and validation declaratively on forms (and server-side) without code — the right low-code mechanism.',
    references: [REF_DV_TABLE, REF_MDA]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct extensibility choice for a reusable rich input control bound to a Dataverse column across apps?',
    options: opts4(
      'A Power Apps component framework (PCF) field control',
      'A printed form',
      'A Power BI tile',
      'A static HTML screenshot'
    ),
    correct: ['a'],
    explanation: 'A PCF field control is a reusable, supported custom control bound to a column, usable across model-driven and canvas apps.',
    references: [REF_PCF]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid Dataverse access-control building blocks.',
    options: opts4(
      'Security roles with privilege depth',
      'Business units (including hierarchical) for data segmentation',
      'Hard-coded user GUIDs in canvas formulas as the security model',
      'Owner/access teams and record sharing'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Security roles, business units, and teams/sharing are the Dataverse access-control building blocks. Hard-coded GUIDs in formulas are not a security model.',
    references: [REF_SEC_ROLE, REF_BU, REF_TEAMS]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which capability is appropriate to call a partner REST API with reusable, governed authentication from flows and apps?',
    options: opts4(
      'A custom connector',
      'Embedding the API key in each flow',
      'A spreadsheet of endpoints',
      'Manual user calls'
    ),
    correct: ['a'],
    explanation: 'A custom connector encapsulates the API operations and authentication for governed reuse across flows/apps and DLP classification.',
    references: [REF_CUSTOMCONN, REF_CONN]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best way to enforce a consistent, reusable set of status values across many tables with localization support?',
    options: opts4(
      'A global choice (option set)',
      'A free-text field per table',
      'A canvas collection',
      'A Power BI slicer'
    ),
    correct: ['a'],
    explanation: 'A global choice centralizes reusable, localizable values across tables for consistency and lower maintenance.',
    references: [REF_DV_CHOICE]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution must offload large-scale analytics off the transactional store. Which is the recommended pattern?',
    options: opts4(
      'Run analytics queries directly on production forms',
      'Use Azure Synapse Link for Dataverse / dataflows into an analytical store',
      'Add aggregating sync plug-ins on read',
      'Disable security to speed analytics'
    ),
    correct: ['b'],
    explanation: 'Azure Synapse Link for Dataverse / dataflows export data to an analytical store so heavy analytics do not impact transactional performance.',
    references: [REF_DATAFLOW, REF_PERF]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct way to model a guided, multi-stage process enforced in a model-driven app?',
    options: opts4(
      'A business process flow',
      'A Power BI report',
      'A static document',
      'A canvas label'
    ),
    correct: ['a'],
    explanation: 'Business process flows model and enforce guided multi-stage processes consistently in model-driven apps.',
    references: [REF_BPF]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which design enforces tenant governance that prevents mixing business and consumer connectors in a flow?',
    options: opts4(
      'A DLP policy classifying connectors and blocking cross-group data flow',
      'A canvas comment',
      'A bigger database',
      'A new dashboard'
    ),
    correct: ['a'],
    explanation: 'DLP policies classify connectors and prevent data from flowing across business/non-business boundaries — the governance control for this requirement.',
    references: [REF_DLP, REF_GOV]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution must ensure a complex set of related-record updates either all succeed or all fail on Account creation. Which is the correct design?',
    options: opts4(
      'A synchronous plug-in within the transaction so failure rolls back all changes',
      'Several independent async flows with no coordination',
      'Manual updates by users',
      'A Power BI refresh'
    ),
    correct: ['a'],
    explanation: 'A synchronous plug-in inside the Dataverse transaction guarantees all related updates commit or roll back together — uncoordinated async flows cannot guarantee atomicity.',
    references: [REF_PLUGIN]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the appropriate authentication design for a Power Pages site serving authenticated external customers?',
    options: opts4(
      'A shared admin password for all customers',
      'An external identity provider (e.g., Azure AD B2C / supported OIDC) with web roles for authorization',
      'Anonymous access for everything',
      'A spreadsheet of logins'
    ),
    correct: ['b'],
    explanation: 'Power Pages supports external identity providers (e.g., Azure AD B2C/OIDC) for authentication, with web roles controlling authorization — not shared or anonymous credentials.',
    references: [REF_PAGES, REF_AAD]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best component to provide a tailored, screen-by-screen guided data-capture app on mobile?',
    options: opts4(
      'A canvas app',
      'A Power BI dashboard',
      'A SQL report',
      'A SharePoint list view'
    ),
    correct: ['a'],
    explanation: 'Canvas apps offer tailored, screen-by-screen, mobile-friendly guided data capture with flexible layout and connectors.',
    references: [REF_CANVAS]
  },
  {
    domain: ARCHITECT, difficulty: 4, type: QType.SINGLE,
    stem: 'A mission-critical solution requires documented continuity. Which is the architect\'s correct approach?',
    options: opts4(
      'Assume the platform handles everything with no plan',
      'Define backup/restore and operational runbooks aligned to platform DR capabilities and agreed RPO/RTO',
      'Disable backups',
      'Defer until an incident'
    ),
    correct: ['b'],
    explanation: 'The architect defines backup/restore and operational runbooks aligned to platform DR capabilities and agreed RPO/RTO — continuity must be designed, not assumed.',
    references: [REF_DR]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct mechanism to enforce uniqueness of an external reference number and enable upsert by it?',
    options: opts4(
      'An alternate key on the reference-number column',
      'A business rule hiding the field',
      'A canvas filter',
      'A Power BI measure'
    ),
    correct: ['a'],
    explanation: 'An alternate key enforces uniqueness and enables upsert by that key — the correct design for an external reference number.',
    references: [REF_DV_KEY]
  },
  {
    domain: ARCHITECT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the appropriate use of a Power Automate cloud flow in the architecture?',
    options: opts4(
      'Run atomic in-transaction logic on create',
      'Orchestrate asynchronous, event/scheduled automation and cross-service integration',
      'Replace the security model',
      'Store large files'
    ),
    correct: ['b'],
    explanation: 'Cloud flows orchestrate asynchronous, event/scheduled automation and integration across services — not in-transaction atomic logic or security.',
    references: [REF_FLOW, REF_INTEGRATE]
  },

  // ── Implement the Solution (15) ──
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which ALM environment topology is recommended for a production-grade solution?',
    options: opts4(
      'One environment for everything',
      'Separate Dev, Test, and Production environments with solution promotion',
      'Develop in production directly',
      'No environments'
    ),
    correct: ['b'],
    explanation: 'A separated Dev/Test/Prod topology with solution promotion is the recommended ALM environment strategy for production-grade solutions.',
    references: [REF_ALM_ENV, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which native capability automates promoting solutions across environments with approvals and minimal custom DevOps?',
    options: opts4(
      'Power Platform pipelines',
      'Manual export/import each time',
      'Database file copy',
      'Renaming environments'
    ),
    correct: ['a'],
    explanation: 'Power Platform pipelines provide built-in, approval-gated deployment automation without custom DevOps tooling.',
    references: [REF_PIPELINES, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A flow fails after deployment because it references a Dev-only connection. Which implementation practice prevents this?',
    options: opts4(
      'Hard-code the Dev connection everywhere',
      'Use connection references bound to target-environment connections at deployment',
      'Recreate the flow in production by hand',
      'Disable the flow'
    ),
    correct: ['b'],
    explanation: 'Connection references decouple flows from specific connections; they are bound to the target environment\'s connection at deployment, preventing Dev-only references.',
    references: [REF_ALA, REF_FLOW]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Security testing (roles, column security, sharing) should be validated before go-live, not after.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Security configuration (roles, column-level security, sharing) must be validated as part of go-live readiness so access defects do not reach production.',
    references: [REF_TEST, REF_GO]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the recommended way to carry an environment-specific setting (e.g., service URL) inside a managed solution?',
    options: opts4(
      'Hard-code it per environment in code',
      'Use an environment variable set per environment',
      'Ask users to enter it daily',
      'Store it in a screenshot'
    ),
    correct: ['b'],
    explanation: 'Environment variables let a single managed solution carry configurable values set per environment at deployment — the supported pattern.',
    references: [REF_ALA, REF_SOLUTION]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A managed-solution upgrade in production unexpectedly removed a customization. Which implementation practice would have caught this earlier?',
    options: opts4(
      'Deploying straight to production without testing',
      'Promoting through Test with dependency analysis and regression testing before production',
      'Editing the managed solution in production',
      'Skipping change control'
    ),
    correct: ['b'],
    explanation: 'Promoting through Test with dependency analysis and regression testing catches breaking upgrade behavior before it reaches production.',
    references: [REF_SOL_LAYER, REF_TEST]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which practice makes solution deployment repeatable and auditable?',
    options: opts4(
      'Keeping the only copy in production',
      'Source-controlling unpacked solutions with an automated build/release pipeline',
      'Emailing zip files',
      'Manual undocumented edits'
    ),
    correct: ['b'],
    explanation: 'Source-controlled unpacked solutions plus an automated build/release pipeline make deployments repeatable, auditable, and recoverable.',
    references: [REF_ALA, REF_PIPELINES]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'During cutover the migrated data must be trusted. Which is the correct implementation step?',
    options: opts4(
      'Assume correctness',
      'Reconcile counts, key relationships, and sampled records against the source with formal sign-off',
      'Delete the source first',
      'Skip validation'
    ),
    correct: ['b'],
    explanation: 'Migration trust requires reconciling counts, relationships, and sampled records against the source with formal sign-off before decommissioning the source.',
    references: [REF_MIGRATE, REF_GO]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A plug-in needs to update records beyond the calling user\'s privileges. Which is the correct implementation approach?',
    options: opts4(
      'Give all users System Administrator',
      'Use a supported impersonation/elevated execution context (e.g., privileged service principal) rather than over-privileging users',
      'Disable security org-wide',
      'Embed admin credentials in the plug-in'
    ),
    correct: ['b'],
    explanation: 'Elevated record operations should use a supported impersonation/elevated execution context (e.g., a privileged service principal), not broadened user roles or embedded credentials.',
    references: [REF_PLUGIN, REF_SEC]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which tool helps the customer monitor and govern Power Platform usage after go-live?',
    options: opts4(
      'The CoE Starter Kit',
      'A single shared inbox',
      'Disabling the platform',
      'A yearly manual count'
    ),
    correct: ['a'],
    explanation: 'The CoE Starter Kit provides ongoing inventory, monitoring, and governance dashboards across environments after go-live.',
    references: [REF_COE, REF_GOV]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the correct response when UAT uncovers a defect before go-live?',
    options: opts4(
      'Hot-fix in production untracked',
      'Fix in Dev, retest in Test, and promote via the pipeline with stakeholder sign-off',
      'Ignore the defect',
      'Delete the environment'
    ),
    correct: ['b'],
    explanation: 'UAT defects are fixed in Dev, retested in Test, and promoted via the ALM pipeline with sign-off — preserving traceability and quality.',
    references: [REF_TEST, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A solution includes a Copilot Studio agent. Which implementation safeguard must be validated before production?',
    options: opts4(
      'The agent\'s greeting emoji',
      'Authentication, scoped knowledge sources, and connector/DLP governance with tested responses',
      'Disabling all telemetry',
      'Shipping without review'
    ),
    correct: ['b'],
    explanation: 'A Copilot Studio agent\'s authentication, scoped knowledge, and connector/DLP governance must be validated and responses tested before production to prevent data exposure.',
    references: [REF_COPILOT, REF_DLP]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the recommended approach for moving reference/configuration data across environments?',
    options: opts4(
      'Manual re-entry each time',
      'A repeatable configuration/data migration approach integrated with the deployment process',
      'Screenshots',
      'Skipping reference data'
    ),
    correct: ['b'],
    explanation: 'A repeatable configuration/data migration approach integrated with deployment keeps reference data consistent across environments — manual re-entry is error-prone.',
    references: [REF_MIGRATE, REF_ALA]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which post-go-live practice best sustains solution quality over time?',
    options: opts4(
      'Stop monitoring and freeze change',
      'Run governed change management with monitoring, support processes, and a prioritized backlog tied to requirements',
      'Permit ungoverned production edits',
      'Remove documentation'
    ),
    correct: ['b'],
    explanation: 'Sustained quality comes from governed change management with monitoring, support processes, and a requirement-linked prioritized backlog.',
    references: [REF_GOV, REF_GO]
  },
  {
    domain: IMPLEMENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about developing in an unmanaged vs. managed solution is correct?',
    options: opts4(
      'Develop in managed, deploy unmanaged downstream',
      'Develop in unmanaged in Dev, deploy managed to Test/Prod for clean layering',
      'Always edit managed solutions in production',
      'Solutions are unnecessary for ALM'
    ),
    correct: ['b'],
    explanation: 'The correct ALM pattern is unmanaged development in Dev and managed deployment to Test/Prod, which provides clean solution layering and upgrade/uninstall support.',
    references: [REF_SOL_LAYER, REF_ALA]
  }
];

const PL600_DOMAINS = [
  { name: ENVISION, weight: 38 },
  { name: ARCHITECT, weight: 39 },
  { name: IMPLEMENT, weight: 23 }
];

const PL600_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'microsoft-pl-600-p1',
    code: 'PL-600-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 120-minute, 65-question, blueprint-weighted set covering solution envisioning & requirement analysis, architecting a solution, and implementing the solution on Microsoft Power Platform.',
    questions: P1
  },
  {
    slug: 'microsoft-pl-600-p2',
    code: 'PL-600-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 120-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'microsoft-pl-600-p3',
    code: 'PL-600-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 120-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const PL600_BUNDLE = {
  slug: 'microsoft-pl-600',
  title: 'Microsoft Power Platform Solution Architect (PL-600)',
  description: 'All 3 PL-600 practice exams in one bundle — covering solution envisioning & requirement analysis, architecting a solution, and implementing the solution, aligned to the Microsoft Power Platform Solution Architect (PL-600) exam domains.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 16500 // USD 165 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the PL-600 bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:pl600-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedPl600(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'microsoft' } });
  await db.vendor.upsert({
    where: { slug: 'microsoft' },
    update: { name: 'Microsoft', description: 'Microsoft certifications — Power Platform, Azure, Dynamics 365, and the Power Platform Solution Architect (PL-600) credential.' },
    create: { slug: 'microsoft', name: 'Microsoft', description: 'Microsoft certifications — Power Platform, Azure, Dynamics 365, and the Power Platform Solution Architect (PL-600) credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'microsoft' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of PL600_EXAMS) {
    const title = `Microsoft Power Platform Solution Architect (PL-600) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the Microsoft Power Platform Solution Architect (PL-600) exam domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Expert',
      durationMinutes: 120,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: PL600_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:pl600-seed' } });
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
          generatedBy: 'manual:pl600-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: PL600_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: PL600_BUNDLE.slug },
    update: {
      title: PL600_BUNDLE.title,
      description: PL600_BUNDLE.description,
      price: PL600_BUNDLE.price,
      priceVoucher: PL600_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: PL600_BUNDLE.slug,
      title: PL600_BUNDLE.title,
      description: PL600_BUNDLE.description,
      price: PL600_BUNDLE.price,
      priceVoucher: PL600_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'microsoft-pl-600-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'microsoft-pl-600-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'microsoft-pl-600-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'microsoft-pl-600-p1', tier: 'VOUCHER' as const, position: 4 }
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
