/**
 * PMI CAPM bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:capm-seed'` and upserts catalog rows.
 *
 * Exported as `seedCapm(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/capm.ts`) and the protected
 * admin API (`/api/admin/seed-capm`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against PMI's public resources and the
 * Certified Associate in Project Management (CAPM) exam content outline:
 *   - Project Management Fundamentals and Core Concepts  — 36% (23)
 *   - Predictive, Plan-Based Methodologies               — 17% (11)
 *   - Agile Frameworks/Methodologies                     — 20% (13)
 *   - Business Analysis Frameworks                        — 27% (18)
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

const FUND = 'Project Management Fundamentals and Core Concepts';
const PRED = 'Predictive, Plan-Based Methodologies';
const AGILE = 'Agile Frameworks/Methodologies';
const BA = 'Business Analysis Frameworks';

const REF_CAPM = { label: 'PMI — Certified Associate in Project Management (CAPM)', url: 'https://www.pmi.org/certifications/certified-associate-capm' };
const REF_PMBOK = { label: 'PMI — A Guide to the Project Management Body of Knowledge (PMBOK Guide)', url: 'https://www.pmi.org/standards/pmbok' };
const REF_STANDARDS = { label: 'PMI — Standards and publications', url: 'https://www.pmi.org/standards' };
const REF_AGILE = { label: 'PMI — Agile Practice Guide', url: 'https://www.pmi.org/standards/agile-practice-guide' };
const REF_BA = { label: 'PMI — The PMI Guide to Business Analysis', url: 'https://www.pmi.org/standards/business-analysis' };
const REF_BACERT = { label: 'PMI — Professional in Business Analysis (PMI-PBA)', url: 'https://www.pmi.org/certifications/business-analysis-pba' };
const REF_ETHICS = { label: 'PMI — Code of Ethics and Professional Conduct', url: 'https://www.pmi.org/about/ethics/code' };
const REF_GLOSSARY = { label: 'PMI — Project management glossary of terms', url: 'https://www.pmi.org/about/learn-about-pmi/what-is-project-management' };
const REF_RISK = { label: 'PMI — Standard for Risk Management', url: 'https://www.pmi.org/standards' };
const REF_EVM = { label: 'PMI — Standard for Earned Value Management', url: 'https://www.pmi.org/standards' };
const REF_SCHEDULE = { label: 'PMI — Practice Standard for Scheduling', url: 'https://www.pmi.org/standards' };
const REF_WBS = { label: 'PMI — Practice Standard for Work Breakdown Structures', url: 'https://www.pmi.org/standards' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Project Management Fundamentals and Core Concepts (23) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best defines a project?',
    options: opts4(
      'An ongoing operational effort that produces the same output indefinitely',
      'A temporary endeavor undertaken to create a unique product, service, or result',
      'Any set of repeated tasks performed by a functional department',
      'A permanent organizational structure that manages day-to-day work'
    ),
    correct: ['b'],
    explanation: 'A project is temporary, meaning it has a defined start and end, and it produces a unique deliverable. Ongoing, repetitive work is operations, not a project. The temporary and unique characteristics are what distinguish project work from operational work.',
    references: [REF_GLOSSARY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A sponsor wants to understand how a proposed project will deliver benefits and contribute to organizational objectives. Which concept does this describe?',
    options: opts4(
      'Scope creep',
      'Value delivery',
      'Resource leveling',
      'Critical path'
    ),
    correct: ['b'],
    explanation: 'Value delivery focuses on how a project produces benefits that support strategic objectives and stakeholder outcomes. Scope creep is uncontrolled change, resource leveling is a scheduling technique, and critical path is a schedule analysis concept.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is a primary responsibility of a project manager?',
    options: opts4(
      'Approving the organization\'s annual operating budget',
      'Leading the project team and integrating the work to meet objectives',
      'Performing all technical tasks personally to ensure quality',
      'Setting enterprise-wide HR compensation policy'
    ),
    correct: ['b'],
    explanation: 'The project manager leads the team and integrates project work to achieve objectives. They do not personally perform all technical tasks, nor do they own enterprise budgets or HR policy, which sit with functional or executive management.',
    references: [REF_CAPM]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document formally authorizes the existence of a project and gives the project manager authority to apply resources?',
    options: opts4(
      'Project charter',
      'Project schedule',
      'Risk register',
      'Lessons learned register'
    ),
    correct: ['a'],
    explanation: 'The project charter formally authorizes the project and grants the project manager authority to apply organizational resources. The schedule, risk register, and lessons learned register are produced after the project is authorized.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In the PMBOK Guide, which process group involves defining the new project and obtaining authorization to start it?',
    options: opts4(
      'Planning',
      'Initiating',
      'Executing',
      'Closing'
    ),
    correct: ['b'],
    explanation: 'The Initiating process group defines a new project or phase and obtains authorization to begin. Planning establishes scope and refines objectives, Executing completes the work, and Closing finalizes activities.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A stakeholder asks which knowledge area addresses identifying, analyzing, and engaging the people affected by a project. Which area is this?',
    options: opts4(
      'Project Schedule Management',
      'Project Stakeholder Management',
      'Project Procurement Management',
      'Project Cost Management'
    ),
    correct: ['b'],
    explanation: 'Project Stakeholder Management covers identifying stakeholders, analyzing their interests and influence, and planning and managing their engagement. Schedule, procurement, and cost management address timelines, contracts, and budgets respectively.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project\'s earned value (EV) is $40,000 and its actual cost (AC) is $50,000. What is the cost performance index (CPI), and what does it indicate?',
    options: opts4(
      'CPI = 1.25; the project is under budget',
      'CPI = 0.80; the project is over budget for the work performed',
      'CPI = 1.00; the project is exactly on budget',
      'CPI = 0.80; the project is ahead of schedule'
    ),
    correct: ['b'],
    explanation: 'CPI = EV / AC = 40,000 / 50,000 = 0.80. A CPI below 1.0 means the project is spending more than the value of the work performed, so it is over budget. CPI measures cost efficiency, not schedule.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project has a planned value (PV) of $60,000 and an earned value (EV) of $45,000. What is the schedule variance (SV), and what does it tell you?',
    options: opts4(
      'SV = +$15,000; the project is ahead of schedule',
      'SV = -$15,000; the project is behind schedule',
      'SV = -$15,000; the project is over budget',
      'SV = $0; the project is on schedule'
    ),
    correct: ['b'],
    explanation: 'Schedule variance SV = EV - PV = 45,000 - 60,000 = -$15,000. A negative SV indicates less work has been performed than planned, so the project is behind schedule. SV measures schedule, not cost.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Progressive elaboration means continuously improving and detailing a plan as more specific information becomes available.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Progressive elaboration is the iterative process of increasing the level of detail in a plan as the project progresses and more accurate information becomes available. It is a core characteristic of project planning.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which organizational structure typically gives the project manager the LEAST authority over resources?',
    options: opts4(
      'Projectized organization',
      'Strong matrix organization',
      'Functional organization',
      'Balanced matrix organization'
    ),
    correct: ['c'],
    explanation: 'In a functional organization, the functional manager controls resources and the project manager has little or no formal authority. Projectized and strong matrix structures give the project manager substantial authority.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are typically components of a project management plan.',
    options: opts4(
      'Scope management plan',
      'Schedule baseline',
      'The organization\'s payroll system source code',
      'Risk management plan'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'The project management plan integrates subsidiary management plans (such as scope and risk management plans) and baselines (such as the schedule baseline). An unrelated payroll system\'s source code is not part of the project management plan.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which term describes the knowledge and information unique to the organization, such as policies, procedures, and historical databases?',
    options: opts4(
      'Enterprise environmental factors',
      'Organizational process assets',
      'Work performance data',
      'Project funding requirements'
    ),
    correct: ['b'],
    explanation: 'Organizational process assets (OPAs) are the plans, processes, policies, procedures, and knowledge bases specific to the organization. Enterprise environmental factors are conditions outside the team\'s control, such as market conditions or regulations.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A governance body has been established to ensure the project aligns with organizational strategy and to make key escalation decisions. What does this represent?',
    options: opts4(
      'Project governance',
      'Resource leveling',
      'Quality assurance',
      'Schedule compression'
    ),
    correct: ['a'],
    explanation: 'Project governance is the framework, functions, and processes that guide project activities to align with organizational and strategic objectives, including decision-making and escalation paths. The other options are technical management techniques.',
    references: [REF_STANDARDS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following best describes a program in PMI terms?',
    options: opts4(
      'A single deliverable produced during a project phase',
      'A group of related projects managed in a coordinated way to obtain benefits not available from managing them individually',
      'A detailed list of all project activities and their durations',
      'A temporary contract with an external vendor'
    ),
    correct: ['b'],
    explanation: 'A program is a group of related projects, subsidiary programs, and program activities managed in a coordinated way to obtain benefits not available from managing them individually. It is broader than a single project.',
    references: [REF_GLOSSARY]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project manager notices the team is unsure who makes which decisions. Which tool would best clarify roles and responsibilities?',
    options: opts4(
      'A RACI (responsibility assignment) matrix',
      'A Pareto chart',
      'A control chart',
      'A Monte Carlo simulation'
    ),
    correct: ['a'],
    explanation: 'A RACI matrix (Responsible, Accountable, Consulted, Informed) is a responsibility assignment matrix that clarifies roles for activities and decisions. Pareto charts, control charts, and Monte Carlo simulation address quality and risk analysis, not role clarity.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'According to PMI\'s Code of Ethics and Professional Conduct, which value requires being truthful in communications and conduct?',
    options: opts4(
      'Responsibility',
      'Respect',
      'Fairness',
      'Honesty'
    ),
    correct: ['d'],
    explanation: 'Honesty is the value requiring practitioners to understand the truth and act in a truthful manner in both communications and conduct. Responsibility, respect, and fairness are the other three core values in the Code of Ethics.',
    references: [REF_ETHICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project\'s budget at completion (BAC) is $200,000, earned value (EV) is $50,000, and actual cost (AC) is $62,500. Using the typical EAC formula EAC = BAC / CPI, what is the estimate at completion?',
    options: opts4(
      '$160,000',
      '$200,000',
      '$250,000',
      '$312,500'
    ),
    correct: ['c'],
    explanation: 'CPI = EV / AC = 50,000 / 62,500 = 0.80. EAC = BAC / CPI = 200,000 / 0.80 = $250,000. This forecasting formula assumes current cost performance will continue for the rest of the project.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which process group includes the work performed to complete the activities defined in the project management plan?',
    options: opts4(
      'Initiating',
      'Planning',
      'Executing',
      'Monitoring and Controlling'
    ),
    correct: ['c'],
    explanation: 'The Executing process group consists of processes performed to complete the work defined in the project management plan to satisfy project requirements. Monitoring and Controlling tracks and reviews progress, while Planning defines the approach.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A stakeholder requests a change to project scope after the baseline is approved. What should the project manager do first?',
    options: opts4(
      'Immediately implement the change to keep the stakeholder satisfied',
      'Submit the request through the integrated change control process',
      'Reject the request because the baseline is fixed',
      'Quietly absorb the change without documenting it'
    ),
    correct: ['b'],
    explanation: 'Changes to a baselined plan must go through integrated change control, where the impact is evaluated and the change is approved or rejected by the appropriate authority. Implementing or rejecting changes without analysis bypasses governance.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following best describes a milestone in a project schedule?',
    options: opts4(
      'A significant point or event with zero duration',
      'The longest path through the schedule network',
      'The amount of time an activity can be delayed without delaying the project',
      'A detailed work package in the WBS'
    ),
    correct: ['a'],
    explanation: 'A milestone is a significant point or event in the project and has zero duration. The longest path is the critical path, delay tolerance is float/slack, and a detailed deliverable component is a work package.',
    references: [REF_SCHEDULE]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project manager wants to capture knowledge gained so future projects can benefit. Which artifact is most appropriate?',
    options: opts4(
      'Stakeholder register',
      'Lessons learned register',
      'Cost baseline',
      'Procurement statement of work'
    ),
    correct: ['b'],
    explanation: 'The lessons learned register records knowledge gained during the project so it can be used by the current project and transferred into organizational process assets for future projects. The other artifacts serve different purposes.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best distinguishes a deliverable from an objective?',
    options: opts4(
      'A deliverable is a measurable target; an objective is a tangible output',
      'A deliverable is a unique, verifiable product or result; an objective is the end toward which work is directed',
      'They are identical terms used interchangeably in PMI standards',
      'A deliverable is always financial; an objective is always technical'
    ),
    correct: ['b'],
    explanation: 'A deliverable is a unique and verifiable product, result, or capability produced to complete a process or project. An objective is the end toward which effort is directed — a strategic or operational target. They are distinct concepts.',
    references: [REF_GLOSSARY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A project is being closed. Which activity is typically performed during project closure?',
    options: opts4(
      'Developing the initial project charter',
      'Obtaining final acceptance of deliverables and archiving project documents',
      'Identifying stakeholders for the first time',
      'Creating the work breakdown structure'
    ),
    correct: ['b'],
    explanation: 'Closing includes obtaining final acceptance of the product or result, transferring deliverables, archiving project records, and releasing resources. Charter development, initial stakeholder identification, and WBS creation occur earlier in the life cycle.',
    references: [REF_PMBOK]
  },

  // ── Predictive, Plan-Based Methodologies (11) ──
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a predictive (waterfall) life cycle, when is project scope typically defined?',
    options: opts4(
      'Continuously refined every iteration',
      'Defined in detail early in the project before significant work begins',
      'Never formally defined',
      'Defined only at project closure'
    ),
    correct: ['b'],
    explanation: 'Predictive life cycles define scope, time, and cost in detail early in the project, before significant execution begins. Continuous refinement each iteration is characteristic of adaptive (agile) approaches.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique decomposes project deliverables into smaller, more manageable components to create the WBS?',
    options: opts4(
      'Decomposition',
      'Crashing',
      'Fast tracking',
      'Resource leveling'
    ),
    correct: ['a'],
    explanation: 'Decomposition is the technique of dividing and subdividing project scope and deliverables into smaller, more manageable parts to produce the work breakdown structure. Crashing and fast tracking are schedule compression techniques.',
    references: [REF_WBS]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'A project network has a critical path. What is the total float of activities on the critical path?',
    options: opts4(
      'Always greater than zero',
      'Zero (no schedule flexibility)',
      'Equal to the project duration',
      'Undefined'
    ),
    correct: ['b'],
    explanation: 'Activities on the critical path have zero total float, meaning any delay to them delays the project end date. Non-critical activities have positive float and can be delayed without affecting the finish date.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'A project is behind schedule. The manager adds resources to a critical activity to shorten its duration, accepting higher cost. Which technique is this?',
    options: opts4(
      'Fast tracking',
      'Crashing',
      'Resource smoothing',
      'Rolling wave planning'
    ),
    correct: ['b'],
    explanation: 'Crashing shortens schedule duration by adding resources to critical path activities, usually increasing cost. Fast tracking overlaps activities normally done in sequence. Resource smoothing and rolling wave planning do not directly compress duration this way.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'Two activities normally done sequentially are performed in parallel to compress the schedule, increasing risk. Which technique is this?',
    options: opts4(
      'Crashing',
      'Fast tracking',
      'Reserve analysis',
      'Decomposition'
    ),
    correct: ['b'],
    explanation: 'Fast tracking compresses the schedule by performing activities in parallel that would normally be sequential, which can increase rework and risk. Crashing instead adds resources at additional cost.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document defines how project scope will be defined, validated, and controlled?',
    options: opts4(
      'Scope management plan',
      'Quality metrics',
      'Issue log',
      'Milestone list'
    ),
    correct: ['a'],
    explanation: 'The scope management plan describes how the scope will be defined, developed, monitored, controlled, and validated. The issue log and milestone list track issues and key events respectively.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid cost estimating techniques used in plan-based projects.',
    options: opts4(
      'Analogous estimating',
      'Parametric estimating',
      'Bottom-up estimating',
      'Random guessing without any basis'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Analogous (top-down using historical data), parametric (using statistical relationships), and bottom-up (aggregating component estimates) are recognized cost estimating techniques. Unfounded guessing is not a valid estimating method.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'A project manager performs quantitative risk analysis to model the combined effect of risks on objectives. Which tool is commonly used?',
    options: opts4(
      'Monte Carlo simulation',
      'Fishbone diagram',
      'RACI matrix',
      'Burndown chart'
    ),
    correct: ['a'],
    explanation: 'Monte Carlo simulation is a quantitative risk analysis technique that models the probability of various outcomes by running many iterations. A fishbone diagram is a cause-and-effect quality tool, and a burndown chart is an agile tracking tool.',
    references: [REF_RISK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which output establishes the approved version of the scope, schedule, and cost against which performance is measured?',
    options: opts4(
      'Performance measurement baseline',
      'Stakeholder register',
      'Project charter',
      'Communications management plan'
    ),
    correct: ['a'],
    explanation: 'The performance measurement baseline integrates the approved scope, schedule, and cost baselines and is used as the basis for comparing actual performance. The charter authorizes the project but is not the performance baseline.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'During risk planning, the team sets aside funds for "unknown unknowns" that may require a change to the cost baseline. What is this called?',
    options: opts4(
      'Contingency reserve',
      'Management reserve',
      'Cost of quality',
      'Sunk cost'
    ),
    correct: ['b'],
    explanation: 'Management reserve is budget set aside for unforeseen work (unknown unknowns) and is not part of the cost baseline; using it generally requires a change. Contingency reserve covers identified risks and is within the cost baseline.',
    references: [REF_EVM]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which quality concept refers to delivering exactly what is required without adding extra features the customer did not request?',
    options: opts4(
      'Gold plating avoidance',
      'Fast tracking',
      'Resource leveling',
      'Schedule crashing'
    ),
    correct: ['a'],
    explanation: 'Gold plating is adding extra features or work beyond requirements; avoiding it means delivering exactly what was agreed. The other options are schedule and resource techniques unrelated to quality conformance.',
    references: [REF_PMBOK]
  },

  // ── Agile Frameworks/Methodologies (13) ──
  {
    domain: AGILE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In Scrum, which role is responsible for maximizing the value of the product and managing the product backlog?',
    options: opts4(
      'Scrum Master',
      'Product Owner',
      'Project sponsor',
      'Functional manager'
    ),
    correct: ['b'],
    explanation: 'The Product Owner is accountable for maximizing product value and managing (ordering and refining) the product backlog. The Scrum Master fosters the process, and the development team builds the increment.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Scrum event is a short daily synchronization for the development team to inspect progress toward the sprint goal?',
    options: opts4(
      'Sprint review',
      'Sprint retrospective',
      'Daily scrum (daily stand-up)',
      'Sprint planning'
    ),
    correct: ['c'],
    explanation: 'The daily scrum is a short, time-boxed event where the team synchronizes and plans work to meet the sprint goal. The sprint review inspects the increment, and the retrospective improves the process.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'A Scrum Master removes impediments and coaches the team rather than directing their work. This leadership style is best described as:',
    options: opts4(
      'Command-and-control leadership',
      'Servant leadership',
      'Transactional leadership',
      'Autocratic leadership'
    ),
    correct: ['b'],
    explanation: 'Servant leadership focuses on serving the team — removing impediments, coaching, and enabling self-organization — rather than directing. This is the leadership stance emphasized in agile frameworks.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact in Kanban limits the number of items in progress to improve flow?',
    options: opts4(
      'Work-in-progress (WIP) limit',
      'Sprint backlog',
      'Definition of done',
      'Velocity chart'
    ),
    correct: ['a'],
    explanation: 'A WIP limit caps the number of items in a workflow stage at one time, reducing multitasking and improving flow. Sprint backlog and velocity are Scrum concepts, and the definition of done is a quality agreement.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team uses two-week iterations, plans only the upcoming iteration in detail, and refines the backlog continuously. Which planning concept is this?',
    options: opts4(
      'Big design up front',
      'Adaptive (rolling) planning through progressive elaboration',
      'Critical chain scheduling',
      'Earned value forecasting'
    ),
    correct: ['b'],
    explanation: 'Adaptive planning plans in short cycles, detailing only the near-term work and refining the backlog as understanding grows. Big design up front is a predictive characteristic; the others are predictive scheduling and forecasting techniques.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'A hybrid approach can combine predictive and agile elements within the same project.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Hybrid life cycles deliberately combine predictive and adaptive elements — for example, planning some components up front while developing others iteratively. PMI explicitly recognizes hybrid as a valid delivery approach.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agile chart shows the amount of remaining work in a sprint over time?',
    options: opts4(
      'Burndown chart',
      'Pareto chart',
      'Control chart',
      'Network diagram'
    ),
    correct: ['a'],
    explanation: 'A burndown chart plots remaining work against time, helping the team see whether it is on track to finish the sprint. Pareto and control charts are quality tools, and a network diagram is a predictive scheduling tool.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'According to the Agile Manifesto, which is valued more?',
    options: opts4(
      'Comprehensive documentation over working software',
      'Working software over comprehensive documentation',
      'Contract negotiation over customer collaboration',
      'Following a plan over responding to change'
    ),
    correct: ['b'],
    explanation: 'The Agile Manifesto values working software over comprehensive documentation, individuals and interactions over processes and tools, customer collaboration over contract negotiation, and responding to change over following a plan.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team holds a meeting at the end of each sprint to inspect how it worked and identify improvements. Which event is this?',
    options: opts4(
      'Sprint review',
      'Sprint retrospective',
      'Backlog refinement',
      'Release planning'
    ),
    correct: ['b'],
    explanation: 'The sprint retrospective focuses on the team\'s process and how to improve it for the next sprint. The sprint review inspects the product increment with stakeholders, which is a different purpose.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary purpose of a definition of done in agile?',
    options: opts4(
      'To list all stakeholders and their interests',
      'To establish a shared, consistent understanding of when work is complete',
      'To define the project budget baseline',
      'To assign individual blame for defects'
    ),
    correct: ['b'],
    explanation: 'The definition of done is a shared agreement on the quality criteria a work item must meet to be considered complete, ensuring consistency and transparency. It is not a budgeting or stakeholder-analysis tool.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL events that are part of the Scrum framework.',
    options: opts4(
      'Sprint planning',
      'Daily scrum',
      'Sprint retrospective',
      'Gantt chart review'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Scrum events include sprint planning, the daily scrum, the sprint review, and the sprint retrospective (all within the sprint). A Gantt chart review is a predictive scheduling activity, not a Scrum event.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'A stakeholder wants frequent, working increments to gather feedback early. Which delivery approach best fits?',
    options: opts4(
      'A single big-bang delivery at project end',
      'Iterative and incremental delivery',
      'Deferring all delivery to closure',
      'No delivery until full documentation is complete'
    ),
    correct: ['b'],
    explanation: 'Iterative and incremental delivery produces usable increments frequently, enabling early and continuous feedback. A single big-bang delivery delays feedback until the end, increasing risk.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.SINGLE,
    stem: 'In agile, who is primarily responsible for ordering the product backlog to maximize value?',
    options: opts4(
      'The Scrum Master',
      'The Product Owner',
      'The project sponsor',
      'The PMO director'
    ),
    correct: ['b'],
    explanation: 'The Product Owner orders (prioritizes) the product backlog so the team works on the highest-value items first. The Scrum Master facilitates the process but does not own backlog priorities.',
    references: [REF_AGILE]
  },

  // ── Business Analysis Frameworks (18) ──
  {
    domain: BA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which business analysis activity identifies the business problem or opportunity and recommends a viable approach?',
    options: opts4(
      'Needs assessment',
      'Sprint planning',
      'Schedule crashing',
      'Resource leveling'
    ),
    correct: ['a'],
    explanation: 'Needs assessment analyzes the current state, identifies the business problem or opportunity, and recommends a viable solution approach before solution work begins. The other options are scheduling and agile techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A business analyst conducts interviews and workshops to gather stakeholder needs. Which activity is this?',
    options: opts4(
      'Requirements elicitation',
      'Risk response planning',
      'Procurement closure',
      'Earned value analysis'
    ),
    correct: ['a'],
    explanation: 'Requirements elicitation is the activity of drawing out information from stakeholders using techniques such as interviews, workshops, observation, and surveys. The other options are unrelated cost, risk, and procurement activities.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool links each requirement to its origin and to the deliverables that satisfy it, supporting scope verification?',
    options: opts4(
      'Requirements traceability matrix',
      'Pareto chart',
      'Velocity chart',
      'Responsibility assignment matrix'
    ),
    correct: ['a'],
    explanation: 'A requirements traceability matrix links requirements from their origin through deliverables, helping ensure each requirement adds value and is delivered and tested. A RACI matrix maps roles, not requirement traceability.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'After delivery, a business analyst assesses whether the solution delivered the expected business value. Which activity is this?',
    options: opts4(
      'Solution evaluation',
      'Scope decomposition',
      'Sprint planning',
      'Cost baselining'
    ),
    correct: ['a'],
    explanation: 'Solution evaluation determines how well a delivered solution meets the business need and delivers value, often after deployment. Scope decomposition, sprint planning, and cost baselining occur earlier and serve different purposes.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document captures the business need, objectives, and justification used to decide whether to undertake a project?',
    options: opts4(
      'Business case',
      'Sprint backlog',
      'Issue log',
      'Risk register'
    ),
    correct: ['a'],
    explanation: 'The business case documents the business need, expected benefits, costs, and justification, supporting the go/no-go decision. The sprint backlog, issue log, and risk register serve execution and tracking purposes.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'A business analyst distinguishes between stakeholder requirements and solution requirements. Which best describes solution requirements?',
    options: opts4(
      'High-level needs of a sponsor expressed as goals',
      'The functional and nonfunctional capabilities the solution must have',
      'The contractual terms with an external vendor',
      'The list of project milestones'
    ),
    correct: ['b'],
    explanation: 'Solution requirements describe the functional and nonfunctional features and capabilities the solution must provide to meet stakeholder and business requirements. Stakeholder requirements describe needs from a stakeholder\'s perspective.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'During elicitation a stakeholder gives requirements that conflict with another stakeholder\'s. What should the business analyst do?',
    options: opts4(
      'Pick the requirement from the more senior stakeholder without discussion',
      'Facilitate analysis and collaboration to resolve the conflict and reach agreement',
      'Discard both requirements',
      'Implement both regardless of the conflict'
    ),
    correct: ['b'],
    explanation: 'Conflicting requirements should be analyzed and resolved through facilitation and stakeholder collaboration to reach a documented agreement. Arbitrarily choosing, discarding, or implementing both without resolution leads to rework and dissatisfaction.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique prioritizes requirements into Must have, Should have, Could have, and Won\'t have categories?',
    options: opts4(
      'MoSCoW prioritization',
      'Critical path method',
      'Earned value management',
      'Resource histogram'
    ),
    correct: ['a'],
    explanation: 'MoSCoW classifies requirements as Must have, Should have, Could have, and Won\'t have (this time) to support prioritization decisions. The other options are scheduling, cost, and resource analysis techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Requirements should be verified to ensure they are of acceptable quality (clear, consistent, and testable) and validated to ensure they deliver business value.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Verification confirms requirements meet quality criteria such as clarity, consistency, and testability. Validation confirms they support business objectives and deliver value. Both are distinct, necessary activities in business analysis.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which stakeholder analysis output documents stakeholder interests, influence, and engagement needs for business analysis work?',
    options: opts4(
      'Stakeholder register / engagement plan',
      'Cost baseline',
      'Sprint burndown',
      'Procurement contract'
    ),
    correct: ['a'],
    explanation: 'A stakeholder register and engagement approach capture who the stakeholders are, their interests and influence, and how they will be engaged for elicitation and analysis. The other documents serve cost, agile tracking, and procurement needs.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL recognized requirements elicitation techniques.',
    options: opts4(
      'Interviews',
      'Facilitated workshops',
      'Document analysis',
      'Randomly assigning requirements without stakeholder input'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Interviews, facilitated workshops, observation, surveys, and document analysis are recognized elicitation techniques that draw information from stakeholders and existing sources. Assigning requirements without stakeholder input is not elicitation.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'A business analyst models how a user interacts with a system to achieve a goal. Which technique is this?',
    options: opts4(
      'Use case modeling',
      'Monte Carlo simulation',
      'Critical chain analysis',
      'Earned value analysis'
    ),
    correct: ['a'],
    explanation: 'Use case modeling describes interactions between actors and a system to achieve a goal, helping define functional requirements. Monte Carlo, critical chain, and earned value are quantitative risk, scheduling, and cost techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'In a business analysis context, what is the main purpose of analyzing the current state before defining a future state?',
    options: opts4(
      'To produce the final project schedule',
      'To understand the business problem and establish a baseline for measuring improvement',
      'To select the project management software',
      'To assign the project budget reserve'
    ),
    correct: ['b'],
    explanation: 'Analyzing the current state clarifies the business problem or opportunity and establishes a baseline against which the value of the future state and the solution can be measured. It is not about tooling or budgeting.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact records and tracks the disposition of requirements changes during a project?',
    options: opts4(
      'Requirements change log / configuration management',
      'Network diagram',
      'Resource calendar',
      'Quality control chart'
    ),
    correct: ['a'],
    explanation: 'Requirements changes are managed through configuration and change management, with a change log tracking proposed changes and their disposition. A network diagram, resource calendar, and control chart serve scheduling, resourcing, and quality monitoring.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is a nonfunctional requirement?',
    options: opts4(
      'The system shall allow a user to submit an order',
      'The system shall respond to a search within two seconds',
      'The system shall let an admin create accounts',
      'The system shall generate an invoice'
    ),
    correct: ['b'],
    explanation: 'A nonfunctional requirement specifies a quality attribute such as performance, security, or usability — for example, a two-second response time. The other options describe functional capabilities (what the system does).',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'A solution is live but is not delivering the expected benefits. From a business analysis perspective, what is the appropriate next step?',
    options: opts4(
      'Immediately cancel the product without analysis',
      'Evaluate the solution\'s performance against expected value and recommend corrective actions',
      'Ignore the gap because the project is closed',
      'Add unrequested features to compensate'
    ),
    correct: ['b'],
    explanation: 'Solution evaluation includes assessing actual performance against expected value and recommending corrective or improvement actions. Cancelling without analysis, ignoring the gap, or gold plating are not value-driven responses.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which role focuses on eliciting, analyzing, documenting, and managing requirements to enable a successful solution?',
    options: opts4(
      'Business analyst',
      'Procurement officer',
      'Quality auditor',
      'Resource manager'
    ),
    correct: ['a'],
    explanation: 'The business analyst elicits, analyzes, specifies, validates, and manages requirements so the delivered solution meets the business need. The other roles focus on contracts, audits, and staffing respectively.',
    references: [REF_BACERT]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'A business analyst creates a high-level scope statement describing solution boundaries before detailed requirements. What is the main benefit?',
    options: opts4(
      'It eliminates the need for any further requirements work',
      'It establishes shared understanding of what is in and out of scope, reducing later ambiguity',
      'It replaces the project schedule',
      'It guarantees the project will finish under budget'
    ),
    correct: ['b'],
    explanation: 'Defining solution scope boundaries early creates a shared understanding of inclusions and exclusions, reducing ambiguity and scope disputes later. It does not replace detailed requirements work, scheduling, or guarantee budget outcomes.',
    references: [REF_BA]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Project Management Fundamentals and Core Concepts (23) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which characteristic is true of all projects?',
    options: opts4(
      'They continue indefinitely with no defined end',
      'They are temporary and create a unique result',
      'They never involve any uncertainty',
      'They always cost more than operations'
    ),
    correct: ['b'],
    explanation: 'Every project is temporary (has a defined beginning and end) and produces a unique product, service, or result. Ongoing, unchanging work is operational. Uncertainty and cost vary by project.',
    references: [REF_GLOSSARY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A project produces a benefit only after the deliverable is in operational use. This realized benefit is best described as:',
    options: opts4(
      'Scope baseline',
      'Business value/outcome',
      'Critical path',
      'Float'
    ),
    correct: ['b'],
    explanation: 'Business value is the net quantifiable benefit derived from a project, often realized when the outcome is in use. Scope baseline, critical path, and float are planning and scheduling concepts, not realized benefits.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Who typically provides resources and support for the project and is accountable for enabling its success at the sponsor level?',
    options: opts4(
      'Project sponsor',
      'Team member',
      'End user',
      'Quality auditor'
    ),
    correct: ['a'],
    explanation: 'The project sponsor provides resources, support, and championing for the project and is accountable for enabling success. Team members perform work, end users consume the result, and auditors check conformance.',
    references: [REF_CAPM]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which knowledge area integrates the various processes and activities to identify, define, combine, unify, and coordinate the project?',
    options: opts4(
      'Project Integration Management',
      'Project Cost Management',
      'Project Quality Management',
      'Project Procurement Management'
    ),
    correct: ['a'],
    explanation: 'Project Integration Management coordinates the processes and activities across all knowledge areas, including charter development and integrated change control. Cost, quality, and procurement management address narrower domains.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which process group tracks, reviews, and regulates progress and performance of the project?',
    options: opts4(
      'Initiating',
      'Planning',
      'Monitoring and Controlling',
      'Closing'
    ),
    correct: ['c'],
    explanation: 'The Monitoring and Controlling process group tracks, reviews, and regulates progress and performance, identifying needed changes. Initiating authorizes, Planning defines the approach, and Closing finalizes the project.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A project manager wants to understand external conditions like regulations and market conditions that influence the project. These are called:',
    options: opts4(
      'Organizational process assets',
      'Enterprise environmental factors',
      'Work performance reports',
      'Change requests'
    ),
    correct: ['b'],
    explanation: 'Enterprise environmental factors are conditions, often outside the team\'s control, such as regulations, market conditions, and organizational culture, that influence the project. OPAs are internal assets like templates and procedures.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'Earned value (EV) is $30,000 and planned value (PV) is $25,000. What is the schedule performance index (SPI), and what does it indicate?',
    options: opts4(
      'SPI = 0.83; behind schedule',
      'SPI = 1.20; ahead of schedule',
      'SPI = 1.20; over budget',
      'SPI = 1.00; on schedule'
    ),
    correct: ['b'],
    explanation: 'SPI = EV / PV = 30,000 / 25,000 = 1.20. An SPI above 1.0 indicates more work has been completed than planned, so the project is ahead of schedule. SPI measures schedule efficiency, not cost.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project has EV = $80,000 and AC = $80,000. What is the cost variance (CV), and what does it mean?',
    options: opts4(
      'CV = +$80,000; under budget',
      'CV = $0; on budget',
      'CV = -$80,000; over budget',
      'CV = $0; behind schedule'
    ),
    correct: ['b'],
    explanation: 'Cost variance CV = EV - AC = 80,000 - 80,000 = $0, meaning the project is exactly on budget for the work performed. CV measures cost, not schedule, so it says nothing about being behind schedule.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A portfolio is a collection of projects, programs, and operations managed as a group to achieve strategic objectives.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'A portfolio groups projects, programs, subsidiary portfolios, and operations managed together to achieve strategic objectives. Portfolio management focuses on doing the right work to maximize strategic value.',
    references: [REF_GLOSSARY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'In a strong matrix organization, who generally has the most authority over project resources?',
    options: opts4(
      'The functional manager',
      'The project manager',
      'The end user',
      'The auditor'
    ),
    correct: ['b'],
    explanation: 'In a strong matrix, the project manager has considerable authority and resources, more than the functional manager. In a weak matrix, the functional manager retains most authority; a balanced matrix shares it.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid PMBOK process groups.',
    options: opts4(
      'Initiating',
      'Executing',
      'Closing',
      'Auditing'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The five process groups are Initiating, Planning, Executing, Monitoring and Controlling, and Closing. "Auditing" is not a PMBOK process group.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which artifact records identified risks along with their analysis and planned responses?',
    options: opts4(
      'Risk register',
      'Stakeholder register',
      'Milestone list',
      'Cost baseline'
    ),
    correct: ['a'],
    explanation: 'The risk register documents identified risks, their analysis, owners, and planned responses, and is updated throughout the project. The stakeholder register, milestone list, and cost baseline serve other purposes.',
    references: [REF_RISK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which constraint set is commonly used to balance competing project demands?',
    options: opts4(
      'Scope, schedule, cost, quality, resources, and risk',
      'Only scope and cost',
      'Only schedule',
      'Only stakeholder names'
    ),
    correct: ['a'],
    explanation: 'Project managers balance multiple competing constraints, commonly including scope, schedule, cost, quality, resources, and risk. Focusing on a single dimension ignores the trade-offs inherent in project delivery.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A project manager communicates status to stakeholders based on their needs. Which plan governs this?',
    options: opts4(
      'Communications management plan',
      'Procurement management plan',
      'Schedule baseline',
      'Quality metrics'
    ),
    correct: ['a'],
    explanation: 'The communications management plan defines what information is communicated, to whom, when, how, and by whom, based on stakeholder needs. Procurement, schedule, and quality artifacts address different aspects.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project with 5 stakeholders adds 3 more. Using n(n-1)/2, how many communication channels now exist, and how many were added?',
    options: opts4(
      '28 channels; 18 added',
      '10 channels; 0 added',
      '28 channels; 10 added',
      '15 channels; 5 added'
    ),
    correct: ['a'],
    explanation: 'With 5 stakeholders: 5(4)/2 = 10 channels. With 8 stakeholders: 8(7)/2 = 28 channels. The increase is 28 - 10 = 18 added channels. Communication complexity grows rapidly with stakeholder count.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'According to PMI\'s Code of Ethics, disclosing a conflict of interest to affected stakeholders most directly reflects which value?',
    options: opts4(
      'Honesty and responsibility',
      'Schedule compression',
      'Resource leveling',
      'Scope verification'
    ),
    correct: ['a'],
    explanation: 'Disclosing conflicts of interest reflects honesty (truthful conduct) and responsibility (ownership of decisions and their impacts). The other options are scheduling and scope techniques unrelated to ethics.',
    references: [REF_ETHICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project\'s BAC is $100,000 and the project is forecast to complete on plan for remaining work. Current EV = $40,000 and AC = $45,000. Using EAC = AC + (BAC - EV), what is the EAC?',
    options: opts4(
      '$100,000',
      '$105,000',
      '$112,500',
      '$95,000'
    ),
    correct: ['b'],
    explanation: 'EAC = AC + (BAC - EV) = 45,000 + (100,000 - 40,000) = 45,000 + 60,000 = $105,000. This formula assumes the cost variance to date was atypical and remaining work will proceed at the budgeted rate.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which process group establishes the scope, refines objectives, and defines the course of action to attain objectives?',
    options: opts4(
      'Initiating',
      'Planning',
      'Executing',
      'Closing'
    ),
    correct: ['b'],
    explanation: 'The Planning process group establishes the total scope, defines and refines objectives, and develops the course of action (the project management plan) to attain them. Executing carries out that plan.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A project manager identifies that a deliverable was completed but not formally accepted by the customer. Which process addresses formal acceptance of deliverables?',
    options: opts4(
      'Validate Scope',
      'Define Activities',
      'Estimate Costs',
      'Identify Risks'
    ),
    correct: ['a'],
    explanation: 'Validate Scope is the process of formalizing acceptance of the completed project deliverables with the customer or sponsor. Defining activities, estimating costs, and identifying risks are planning processes.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary purpose of an issue log?',
    options: opts4(
      'To document and track issues that need resolution to keep the project on track',
      'To define the project budget',
      'To list all stakeholders\' salaries',
      'To replace the project schedule'
    ),
    correct: ['a'],
    explanation: 'An issue log records issues, their owners, status, and resolution actions so they can be tracked to closure. It is not a budgeting, salary, or scheduling document.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the relationship between project management and operations management?',
    options: opts4(
      'They are identical and interchangeable',
      'Projects are temporary and unique; operations are ongoing and repetitive, but they interact across the life cycle',
      'Operations never use any project outputs',
      'Projects never hand anything off to operations'
    ),
    correct: ['b'],
    explanation: 'Projects are temporary and create unique outputs; operations are ongoing and repetitive. They interact — for example, when a project deliverable is transitioned into operational use at closure.',
    references: [REF_GLOSSARY]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project manager is assigned but the team is unsure of escalation paths and decision authority. Which framework should be clarified first?',
    options: opts4(
      'Project governance',
      'Resource histogram',
      'Burndown chart',
      'Pareto analysis'
    ),
    correct: ['a'],
    explanation: 'Project governance defines decision authority, escalation paths, and oversight aligned to organizational strategy. A resource histogram, burndown chart, and Pareto analysis are technical tools that do not define decision authority.',
    references: [REF_STANDARDS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document, produced during initiating, identifies people or groups who could affect or be affected by the project?',
    options: opts4(
      'Stakeholder register',
      'Cost baseline',
      'Sprint backlog',
      'Network diagram'
    ),
    correct: ['a'],
    explanation: 'The stakeholder register identifies stakeholders and records assessment and classification information. It is typically created during initiating and refined throughout. The other artifacts address cost, agile, and scheduling.',
    references: [REF_PMBOK]
  },

  // ── Predictive, Plan-Based Methodologies (11) ──
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a predictive life cycle, which baseline is established for time?',
    options: opts4(
      'Schedule baseline',
      'Burndown baseline',
      'Velocity baseline',
      'Retrospective baseline'
    ),
    correct: ['a'],
    explanation: 'The schedule baseline is the approved version of the schedule used as the basis for comparison to actual results in predictive projects. Burndown and velocity are agile measures, and a retrospective is an agile event.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the lowest level of the WBS, representing work that can be scheduled, cost-estimated, and monitored?',
    options: opts4(
      'Work package',
      'Milestone',
      'Sprint',
      'Epic'
    ),
    correct: ['a'],
    explanation: 'A work package is the lowest level of the WBS, where cost and duration can be estimated and managed. A milestone has zero duration; sprints and epics are agile constructs, not WBS levels.',
    references: [REF_WBS]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'An activity has early start day 4, early finish day 8, late start day 6, and late finish day 10. What is its total float?',
    options: opts4(
      '0 days',
      '2 days',
      '4 days',
      '6 days'
    ),
    correct: ['b'],
    explanation: 'Total float = late start - early start = 6 - 4 = 2 days (equivalently late finish - early finish = 10 - 8 = 2). The activity can be delayed up to 2 days without delaying the project finish.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which sequencing relationship means an activity cannot start until a predecessor finishes?',
    options: opts4(
      'Finish-to-start (FS)',
      'Start-to-start (SS)',
      'Finish-to-finish (FF)',
      'Start-to-finish (SF)'
    ),
    correct: ['a'],
    explanation: 'Finish-to-start (FS) is the most common dependency: the successor cannot start until the predecessor finishes. SS, FF, and SF describe other logical relationships used in precedence diagramming.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'Using three-point (PERT) estimating with optimistic 4, most likely 6, pessimistic 14 (beta distribution), what is the expected duration?',
    options: opts4(
      '6',
      '7',
      '8',
      '14'
    ),
    correct: ['b'],
    explanation: 'PERT expected duration = (O + 4M + P) / 6 = (4 + 24 + 14) / 6 = 42 / 6 = 7. Three-point estimating accounts for uncertainty by weighting the most likely estimate.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which plan describes how risks will be identified, analyzed, responded to, and monitored?',
    options: opts4(
      'Risk management plan',
      'Communications management plan',
      'Scope baseline',
      'Milestone list'
    ),
    correct: ['a'],
    explanation: 'The risk management plan describes how risk management activities will be structured and performed, including methodology, roles, and risk categories. It is distinct from the risk register, which holds the actual risks.',
    references: [REF_RISK]
  },
  {
    domain: PRED, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL negative risk (threat) response strategies.',
    options: opts4(
      'Avoid',
      'Transfer',
      'Mitigate',
      'Exploit'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Threat (negative risk) strategies are avoid, transfer, mitigate, escalate, and accept. Exploit is an opportunity (positive risk) strategy, not a threat response.',
    references: [REF_RISK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique evaluates the cost and schedule impact of identified risks by assigning probability and impact?',
    options: opts4(
      'Qualitative risk analysis',
      'Decomposition',
      'Resource leveling',
      'Fast tracking'
    ),
    correct: ['a'],
    explanation: 'Qualitative risk analysis prioritizes risks by assessing probability and impact, often using a probability-impact matrix. Decomposition builds the WBS, and leveling/fast tracking are schedule techniques.',
    references: [REF_RISK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which quality tool displays the relative frequency of causes of problems to identify the vital few?',
    options: opts4(
      'Pareto chart',
      'Burndown chart',
      'Network diagram',
      'Velocity chart'
    ),
    correct: ['a'],
    explanation: 'A Pareto chart is a bar chart ordered by frequency that highlights the vital few causes responsible for most problems (the 80/20 principle). Burndown and velocity are agile charts; a network diagram models schedule logic.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'A project uses rolling wave planning. What does this mean?',
    options: opts4(
      'All work is planned in full detail at project start',
      'Near-term work is planned in detail while future work is planned at a higher level and elaborated later',
      'No planning is performed at all',
      'Planning is done only at project closure'
    ),
    correct: ['b'],
    explanation: 'Rolling wave planning is an iterative planning technique where imminent work is planned in detail and future work is planned at a higher level, then progressively elaborated. It is common in predictive projects with evolving information.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document defines acceptance criteria, deliverables, exclusions, and constraints for the project scope?',
    options: opts4(
      'Project scope statement',
      'Risk register',
      'Stakeholder register',
      'Burndown chart'
    ),
    correct: ['a'],
    explanation: 'The project scope statement describes the project scope, major deliverables, assumptions, constraints, exclusions, and acceptance criteria. The risk and stakeholder registers and burndown chart serve other purposes.',
    references: [REF_PMBOK]
  },

  // ── Agile Frameworks/Methodologies (13) ──
  {
    domain: AGILE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In Scrum, what is the maximum recommended length of a sprint?',
    options: opts4(
      'One calendar year',
      'One month or less',
      'Exactly 90 days',
      'There is no time box'
    ),
    correct: ['b'],
    explanation: 'A sprint is time-boxed to one month or less, with shorter sprints (often one to four weeks) providing faster feedback. Sprints are always time-boxed; there is no unbounded sprint.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Scrum artifact is an ordered list of everything that might be needed in the product?',
    options: opts4(
      'Product backlog',
      'Risk register',
      'Cost baseline',
      'Network diagram'
    ),
    correct: ['a'],
    explanation: 'The product backlog is the single, ordered source of work for the product, managed by the Product Owner. The risk register, cost baseline, and network diagram are predictive/management artifacts.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'A team measures the amount of work completed per sprint to forecast future capacity. What is this measure?',
    options: opts4(
      'Velocity',
      'Float',
      'CPI',
      'Planned value'
    ),
    correct: ['a'],
    explanation: 'Velocity is the amount of work (e.g., story points) a team completes per sprint, used to forecast future delivery. Float, CPI, and planned value are predictive scheduling and earned value metrics.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about a self-organizing agile team is correct?',
    options: opts4(
      'A manager assigns every task to each member daily',
      'The team decides how to accomplish its work rather than being directed',
      'The team has no accountability for outcomes',
      'The team cannot communicate with stakeholders'
    ),
    correct: ['b'],
    explanation: 'Self-organizing teams choose how best to accomplish their work rather than being directed by others, while remaining accountable for outcomes and collaborating with stakeholders.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.SINGLE,
    stem: 'A project must deliver a fixed regulatory module up front but the rest of the product iteratively. Which approach is most appropriate?',
    options: opts4(
      'Pure predictive for the entire project',
      'Pure agile for the entire project',
      'A hybrid approach combining predictive and agile elements',
      'No methodology'
    ),
    correct: ['c'],
    explanation: 'A hybrid approach lets the team plan and deliver the fixed, well-understood regulatory component predictively while developing the evolving parts iteratively. PMI recognizes hybrid as a valid tailored approach.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Scrum, the sprint goal provides a single objective that gives the team focus for the sprint.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'The sprint goal is a single objective for the sprint that creates coherence and focus, guiding the team on why the increment is valuable. It is a core element of sprint planning in Scrum.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which event in Scrum is used to inspect the increment and adapt the product backlog with stakeholders?',
    options: opts4(
      'Sprint review',
      'Daily scrum',
      'Sprint retrospective',
      'Backlog refinement'
    ),
    correct: ['a'],
    explanation: 'The sprint review is held at the end of the sprint to inspect the increment with stakeholders and adapt the product backlog. The retrospective focuses on process improvement, not the product.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'What does a cumulative flow diagram help an agile team visualize?',
    options: opts4(
      'Work in each workflow state over time and potential bottlenecks',
      'The project cost baseline',
      'The list of project sponsors',
      'The procurement contract terms'
    ),
    correct: ['a'],
    explanation: 'A cumulative flow diagram shows the quantity of work in each state over time, helping teams spot bottlenecks and assess flow stability. It is not a cost, sponsor, or procurement artifact.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Owner reorders the backlog so the highest-value, highest-risk items are done first. What is the main benefit?',
    options: opts4(
      'It guarantees zero defects',
      'It delivers value early and reduces risk by validating uncertain items sooner',
      'It removes the need for testing',
      'It eliminates stakeholder involvement'
    ),
    correct: ['b'],
    explanation: 'Prioritizing high-value, high-risk work early delivers benefits sooner and surfaces uncertainty when it is cheapest to address, reducing overall risk. It does not eliminate testing or stakeholder engagement.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'In agile, what is a user story typically used to capture?',
    options: opts4(
      'A detailed contract clause',
      'A short description of a feature from an end user\'s perspective',
      'The full project budget',
      'The organization\'s legal terms'
    ),
    correct: ['b'],
    explanation: 'A user story is a brief, value-focused description of functionality told from the perspective of the user, used to drive conversation and incremental delivery. It is not a contract, budget, or legal document.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices commonly associated with agile delivery.',
    options: opts4(
      'Iterative delivery of working increments',
      'Frequent stakeholder feedback',
      'Continuous improvement via retrospectives',
      'Locking all requirements before any work begins'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Agile emphasizes iterative delivery, frequent feedback, and continuous improvement. Locking all requirements up front before any work is a predictive characteristic, contrary to agile\'s embrace of change.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which role in Scrum is accountable for fostering an environment where the team is effective and Scrum is understood?',
    options: opts4(
      'Scrum Master',
      'Product Owner',
      'Sponsor',
      'Procurement officer'
    ),
    correct: ['a'],
    explanation: 'The Scrum Master is accountable for the team\'s effectiveness, coaching the team, and ensuring Scrum is understood and enacted. The Product Owner owns value and the backlog; sponsors and procurement officers are not Scrum roles.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why do agile teams prefer face-to-face or close collaboration where possible?',
    options: opts4(
      'It increases documentation volume',
      'It improves the speed and richness of communication and feedback',
      'It removes the need for any planning',
      'It guarantees fixed scope'
    ),
    correct: ['b'],
    explanation: 'Agile values rich, fast communication; close collaboration improves shared understanding and feedback loops. It does not aim to maximize documentation, remove planning, or fix scope.',
    references: [REF_AGILE]
  },

  // ── Business Analysis Frameworks (18) ──
  {
    domain: BA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary goal of requirements elicitation?',
    options: opts4(
      'To draw out and discover stakeholder needs and expectations',
      'To finalize the project budget',
      'To compress the project schedule',
      'To close procurement contracts'
    ),
    correct: ['a'],
    explanation: 'Requirements elicitation aims to draw out, explore, and identify stakeholder needs and expectations using techniques such as interviews and workshops. Budgeting, scheduling, and procurement are separate activities.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which activity assesses whether a proposed solution is feasible and aligned with the business need before significant investment?',
    options: opts4(
      'Needs assessment and feasibility analysis',
      'Sprint retrospective',
      'Resource leveling',
      'Schedule crashing'
    ),
    correct: ['a'],
    explanation: 'Needs assessment, including feasibility analysis, evaluates the problem, options, and viability against the business need before major investment. The other options are agile and scheduling techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'A business analyst ensures every requirement can be traced forward to deliverables and backward to a business objective. This supports:',
    options: opts4(
      'Requirements traceability',
      'Critical path analysis',
      'Earned value management',
      'Resource histogram creation'
    ),
    correct: ['a'],
    explanation: 'Requirements traceability links requirements bidirectionally to their origin and to deliverables and tests, ensuring coverage and value. The other options are scheduling and cost techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'A delivered feature meets its written requirement but does not solve the actual business problem. What does this most likely indicate?',
    options: opts4(
      'A verification failure only',
      'A validation gap — the requirement did not reflect the real need',
      'A scheduling defect',
      'A procurement breach'
    ),
    correct: ['b'],
    explanation: 'If a feature satisfies its stated requirement but not the business need, the requirement itself was not validated against the real objective. Verification checks quality of the requirement; validation checks fitness for the need.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique structures requirements by grouping related items into a hierarchy or model to improve understanding?',
    options: opts4(
      'Requirements modeling/analysis',
      'Schedule crashing',
      'Monte Carlo simulation',
      'Resource leveling'
    ),
    correct: ['a'],
    explanation: 'Requirements analysis and modeling organize and structure requirements (e.g., process models, data models) to improve clarity and detect gaps. Crashing, Monte Carlo, and leveling address schedule, risk, and resources.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document records assumptions and constraints affecting the business analysis effort and solution?',
    options: opts4(
      'Assumptions and constraints log',
      'Sprint backlog',
      'Velocity chart',
      'Procurement statement of work'
    ),
    correct: ['a'],
    explanation: 'An assumptions and constraints log captures factors believed true and limiting conditions that affect analysis and solution decisions. The other artifacts serve agile tracking and procurement purposes.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'During elicitation, the analyst discovers stakeholders have not articulated what success looks like. What should be defined?',
    options: opts4(
      'Measurable acceptance/success criteria for the solution',
      'The project sponsor\'s salary',
      'The vendor payment schedule',
      'The team\'s velocity'
    ),
    correct: ['a'],
    explanation: 'Defining measurable acceptance or success criteria clarifies what an acceptable solution looks like and enables validation. Salaries, payment schedules, and velocity do not define solution success.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes a business requirement?',
    options: opts4(
      'A high-level need of the organization, such as a goal or objective the solution should help achieve',
      'A detailed UI field specification',
      'A vendor invoice',
      'A daily stand-up agenda'
    ),
    correct: ['a'],
    explanation: 'Business requirements describe higher-level needs of the organization, such as goals and objectives, that the solution should help achieve. Detailed UI specs are solution requirements; invoices and agendas are unrelated.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Stakeholder engagement is a continuous activity throughout business analysis, not a one-time step.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Stakeholder engagement is continuous — stakeholders are identified, analyzed, and engaged throughout elicitation, analysis, and evaluation as understanding and circumstances change.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique compares the current state and desired future state to identify what must change?',
    options: opts4(
      'Gap analysis',
      'Crashing',
      'Fast tracking',
      'Resource smoothing'
    ),
    correct: ['a'],
    explanation: 'Gap analysis compares the current state with the desired future state to identify the differences and the work needed to close them. Crashing, fast tracking, and smoothing are schedule techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL activities typically within the scope of business analysis.',
    options: opts4(
      'Needs assessment',
      'Requirements elicitation and analysis',
      'Solution evaluation',
      'Negotiating the construction subcontract pricing'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Business analysis includes needs assessment, requirements elicitation and analysis, traceability and monitoring, and solution evaluation. Negotiating subcontract pricing is a procurement activity, not core business analysis.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'A requirement states "the system shall encrypt data at rest." This is best classified as:',
    options: opts4(
      'A nonfunctional (quality/security) requirement',
      'A milestone',
      'A risk response',
      'A procurement term'
    ),
    correct: ['a'],
    explanation: 'Encryption of data at rest is a security/quality attribute, making it a nonfunctional requirement. It constrains how the system behaves rather than describing a specific user-facing function.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach helps reach agreement when stakeholders disagree on requirement priorities?',
    options: opts4(
      'Facilitated decision-making and prioritization techniques',
      'Ignoring lower-ranked stakeholders entirely',
      'Randomly selecting requirements',
      'Deferring all decisions to closure'
    ),
    correct: ['a'],
    explanation: 'Facilitated decision-making and prioritization techniques (e.g., MoSCoW, weighted scoring) help stakeholders reach agreement transparently. Ignoring stakeholders or random selection undermines buy-in and value.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'When should solution evaluation ideally be planned?',
    options: opts4(
      'Only after the solution has failed',
      'Early, so success measures and evaluation methods are defined before delivery',
      'Never, since it is optional',
      'Only during procurement'
    ),
    correct: ['b'],
    explanation: 'Planning solution evaluation early ensures success measures, metrics, and evaluation methods are defined so the realized value can be assessed objectively after delivery. Waiting until failure or skipping it loses that opportunity.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact communicates the recommended solution approach and its justification to decision-makers?',
    options: opts4(
      'Business case / solution recommendation',
      'Sprint burndown',
      'Resource calendar',
      'Network diagram'
    ),
    correct: ['a'],
    explanation: 'The business case and solution recommendation present the analysis, options, and justification to support an investment decision. Burndown charts, resource calendars, and network diagrams support execution, not the recommendation.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which elicitation technique observes users performing tasks in their real environment to uncover unstated needs?',
    options: opts4(
      'Observation (job shadowing)',
      'Crashing',
      'Earned value analysis',
      'Resource leveling'
    ),
    correct: ['a'],
    explanation: 'Observation, including job shadowing, watches users in their actual context to uncover tacit or unstated needs that interviews alone may miss. The other options are scheduling and cost techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'A change to an approved requirement is requested mid-project. What is the best practice?',
    options: opts4(
      'Apply it immediately without analysis',
      'Assess the impact and route it through requirements change/configuration management for a decision',
      'Reject all changes by policy',
      'Implement it secretly to avoid delay'
    ),
    correct: ['b'],
    explanation: 'Requirement changes should be analyzed for impact and routed through change/configuration management so the appropriate authority can decide. Applying or rejecting changes without analysis undermines traceability and value.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the purpose of a requirements baseline?',
    options: opts4(
      'An approved set of requirements that serves as the basis for further work and change control',
      'A list of all team members',
      'The project\'s final invoice',
      'The daily stand-up notes'
    ),
    correct: ['a'],
    explanation: 'A requirements baseline is the approved, agreed set of requirements used as the reference for development and change control. Changes to it are managed through a controlled process.',
    references: [REF_BA]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Project Management Fundamentals and Core Concepts (23) ──
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is NOT a characteristic of a project?',
    options: opts4(
      'It is temporary',
      'It creates a unique result',
      'It is progressively elaborated',
      'It runs forever with no end date'
    ),
    correct: ['d'],
    explanation: 'Projects are temporary (defined start and end), create unique results, and are progressively elaborated. Running forever with no end date describes ongoing operations, not a project.',
    references: [REF_GLOSSARY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which concept describes the worth, importance, or usefulness a project delivers to stakeholders and the organization?',
    options: opts4(
      'Float',
      'Value',
      'Crashing',
      'Decomposition'
    ),
    correct: ['b'],
    explanation: 'Value is the worth, importance, or usefulness delivered by a project to stakeholders and the organization. Float, crashing, and decomposition are scheduling and scope techniques.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A PMO is established to standardize governance and share resources and methodologies. What is a PMO?',
    options: opts4(
      'A project management office that standardizes project governance and facilitates resource sharing',
      'A single project deliverable',
      'A type of risk response',
      'A scheduling network diagram'
    ),
    correct: ['a'],
    explanation: 'A project management office (PMO) is an organizational structure that standardizes project governance and shares resources, methodologies, tools, and techniques. It is not a deliverable, risk response, or diagram.',
    references: [REF_STANDARDS]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which knowledge area focuses on planning, estimating, budgeting, and controlling costs?',
    options: opts4(
      'Project Cost Management',
      'Project Scope Management',
      'Project Stakeholder Management',
      'Project Communications Management'
    ),
    correct: ['a'],
    explanation: 'Project Cost Management includes planning cost management, estimating costs, determining the budget, and controlling costs. Scope, stakeholder, and communications management address other dimensions.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which process group formally completes or closes the project, phase, or contract?',
    options: opts4(
      'Initiating',
      'Planning',
      'Executing',
      'Closing'
    ),
    correct: ['d'],
    explanation: 'The Closing process group includes the processes to formally complete or close the project, phase, or contract, including final acceptance and archiving. The other groups occur earlier in the life cycle.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A team member raises a concern that could become a problem if not addressed. Where should it be recorded?',
    options: opts4(
      'Issue log',
      'Cost baseline',
      'Procurement contract',
      'Sprint backlog'
    ),
    correct: ['a'],
    explanation: 'Issues and concerns requiring action are recorded and tracked in the issue log. The cost baseline, procurement contract, and sprint backlog are not used to track general project issues.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project has CPI = 1.25 and SPI = 0.90. Which statement is correct?',
    options: opts4(
      'Under budget and ahead of schedule',
      'Under budget but behind schedule',
      'Over budget and ahead of schedule',
      'Over budget and behind schedule'
    ),
    correct: ['b'],
    explanation: 'CPI = 1.25 (>1.0) means cost efficiency is good — under budget. SPI = 0.90 (<1.0) means less work completed than planned — behind schedule. The two indices measure cost and schedule independently.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project has BAC = $120,000, EV = $30,000, AC = $40,000. What is the to-complete performance index (TCPI) to finish on the original budget, using (BAC - EV) / (BAC - AC)?',
    options: opts4(
      '0.75',
      '1.00',
      '1.13',
      '1.33'
    ),
    correct: ['c'],
    explanation: 'TCPI = (BAC - EV) / (BAC - AC) = (120,000 - 30,000) / (120,000 - 40,000) = 90,000 / 80,000 = 1.125 ≈ 1.13. A TCPI above 1.0 means the remaining work must be performed more efficiently than planned to meet the BAC.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Operations are ongoing and produce repetitive outputs, whereas projects are temporary and produce unique outputs.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Operations are ongoing activities that produce repetitive outputs (e.g., manufacturing), while projects are temporary endeavors producing unique results. The distinction is fundamental in PMI terminology.',
    references: [REF_GLOSSARY]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'In a projectized organization, to whom do team members typically report?',
    options: opts4(
      'The functional manager only',
      'The project manager',
      'No one',
      'The external vendor'
    ),
    correct: ['b'],
    explanation: 'In a projectized organization, team members usually report directly to the project manager, who has high authority. In functional structures, they report to functional managers instead.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are typically project baselines.',
    options: opts4(
      'Scope baseline',
      'Schedule baseline',
      'Cost baseline',
      'Stakeholder baseline'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The three commonly referenced baselines are scope, schedule, and cost; together they form the performance measurement baseline. There is no standard "stakeholder baseline."',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which artifact documents how the project will be executed, monitored, controlled, and closed?',
    options: opts4(
      'Project management plan',
      'Issue log',
      'Stakeholder register',
      'Risk register'
    ),
    correct: ['a'],
    explanation: 'The project management plan is the comprehensive document describing how the project will be executed, monitored and controlled, and closed, integrating subsidiary plans and baselines. The other artifacts are narrower.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A stakeholder with high power and high interest should generally be:',
    options: opts4(
      'Managed closely (actively engaged)',
      'Ignored',
      'Only monitored with minimal effort',
      'Removed from the project'
    ),
    correct: ['a'],
    explanation: 'In a power/interest grid, stakeholders with high power and high interest should be managed closely with active engagement. Low-power, low-interest stakeholders are monitored with minimal effort.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which value in PMI\'s Code of Ethics requires making decisions and acting in the best interests of society, safety, and the environment?',
    options: opts4(
      'Responsibility',
      'Crashing',
      'Float',
      'Velocity'
    ),
    correct: ['a'],
    explanation: 'Responsibility is the duty to take ownership of decisions and act in the best interests of society, public safety, and the environment. Crashing, float, and velocity are unrelated technical terms.',
    references: [REF_ETHICS]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A project has PV = $50,000, EV = $40,000, AC = $45,000. Which pair is correct?',
    options: opts4(
      'CV = -$5,000 (over budget); SV = -$10,000 (behind schedule)',
      'CV = +$5,000 (under budget); SV = +$10,000 (ahead)',
      'CV = $0; SV = $0',
      'CV = -$10,000; SV = -$5,000'
    ),
    correct: ['a'],
    explanation: 'CV = EV - AC = 40,000 - 45,000 = -$5,000 (over budget). SV = EV - PV = 40,000 - 50,000 = -$10,000 (behind schedule). Negative variances indicate unfavorable cost and schedule performance.',
    references: [REF_EVM]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the main purpose of a kickoff meeting?',
    options: opts4(
      'To align stakeholders on objectives, roles, and the plan as the project begins execution',
      'To close all contracts',
      'To archive lessons learned',
      'To perform final acceptance of deliverables'
    ),
    correct: ['a'],
    explanation: 'A kickoff meeting aligns the team and stakeholders on objectives, roles, responsibilities, and the approach as the project transitions into execution. Contract closure and final acceptance occur during closing.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which describes a phase gate (stage gate)?',
    options: opts4(
      'A review at the end of a phase to decide whether to continue, modify, or end the project',
      'A type of network dependency',
      'A risk response strategy',
      'A cost estimating technique'
    ),
    correct: ['a'],
    explanation: 'A phase gate is a review at the end of a phase where a decision is made to continue, continue with modification, or end the project or program. It is a governance checkpoint, not a dependency or estimating method.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 1, type: QType.SINGLE,
    stem: 'Which process group occurs throughout the project to compare actual performance against the plan?',
    options: opts4(
      'Monitoring and Controlling',
      'Initiating',
      'Closing',
      'Planning'
    ),
    correct: ['a'],
    explanation: 'Monitoring and Controlling occurs throughout the project, continuously comparing actual performance to the plan and recommending corrective or preventive action. Initiating and Closing bracket the life cycle.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document captures high-level project information and authorizes the project manager during initiating?',
    options: opts4(
      'Project charter',
      'Sprint backlog',
      'Cost performance report',
      'Network diagram'
    ),
    correct: ['a'],
    explanation: 'The project charter, created during initiating, captures high-level requirements and objectives and authorizes the project and the project manager. The other artifacts are produced later for execution and control.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'What does "tailoring" mean in project management?',
    options: opts4(
      'Adapting processes, inputs, tools, and approaches to suit the project context',
      'Cutting all documentation',
      'Removing the project manager role',
      'Outsourcing the entire project'
    ),
    correct: ['a'],
    explanation: 'Tailoring is the deliberate adaptation of processes, governance, tools, and life cycle to fit the specific project environment and objectives. It is not about eliminating documentation or roles.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 3, type: QType.SINGLE,
    stem: 'A team is unsure whether a request is a defect repair, corrective action, or preventive action. Which is a preventive action?',
    options: opts4(
      'An activity to ensure future performance aligns with the plan by reducing the probability of negative outcomes',
      'Fixing a nonconforming product component',
      'Realigning current performance with the plan',
      'Updating the project charter'
    ),
    correct: ['a'],
    explanation: 'Preventive action is an intentional activity to ensure future performance conforms to the plan by reducing the probability of adverse outcomes. Corrective action realigns current performance; defect repair fixes nonconformities.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the role of a functional manager in a matrix organization?',
    options: opts4(
      'Manages a department and supplies resources/expertise to projects',
      'Owns the project budget exclusively',
      'Is always the project sponsor',
      'Performs all project work alone'
    ),
    correct: ['a'],
    explanation: 'A functional manager leads a functional department and provides staff and subject-matter expertise to projects. Authority over project resources is shared with the project manager depending on the matrix strength.',
    references: [REF_PMBOK]
  },
  {
    domain: FUND, difficulty: 2, type: QType.SINGLE,
    stem: 'A project deliverable is transitioned to operations at project end. This handoff is part of which life-cycle phase?',
    options: opts4(
      'Closing/transition',
      'Initiating',
      'Planning',
      'Elicitation'
    ),
    correct: ['a'],
    explanation: 'Transitioning the final product, service, or result to operations or the customer occurs as part of project closing/transition activities. Initiating, planning, and elicitation occur earlier and serve different purposes.',
    references: [REF_PMBOK]
  },

  // ── Predictive, Plan-Based Methodologies (11) ──
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which characteristic best describes a predictive (waterfall) life cycle?',
    options: opts4(
      'Scope, schedule, and cost are determined early and changes are tightly controlled',
      'Requirements emerge continuously each iteration',
      'There is no plan',
      'Delivery happens only in two-week increments'
    ),
    correct: ['a'],
    explanation: 'Predictive life cycles fix scope, schedule, and cost early and manage changes through formal change control. Continuously emerging requirements and fixed short increments are adaptive (agile) characteristics.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the WBS dictionary used for?',
    options: opts4(
      'Providing detailed information about each WBS component, such as work description and acceptance criteria',
      'Listing all stakeholders',
      'Tracking sprint velocity',
      'Recording risk responses'
    ),
    correct: ['a'],
    explanation: 'The WBS dictionary provides detailed deliverable, activity, and scheduling information for each WBS component, including work descriptions and acceptance criteria. It supports clear scope definition.',
    references: [REF_WBS]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'A network has paths A-B-C = 12 days and A-D-E = 15 days. Which is the critical path and project duration?',
    options: opts4(
      'A-B-C; 12 days',
      'A-D-E; 15 days',
      'Both paths; 27 days',
      'A-D-E; 12 days'
    ),
    correct: ['b'],
    explanation: 'The critical path is the longest path through the network and determines the shortest possible project duration. A-D-E at 15 days is longer than A-B-C at 12 days, so the project duration is 15 days.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which estimating technique uses historical data from a similar past project to estimate the current one?',
    options: opts4(
      'Analogous estimating',
      'Bottom-up estimating',
      'Parametric estimating',
      'Reserve analysis'
    ),
    correct: ['a'],
    explanation: 'Analogous estimating uses values or attributes from a similar previous project as the basis for estimating the current project. It is faster but less accurate than bottom-up or parametric methods.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'Resource leveling is applied and the project end date moves later. Why does this happen?',
    options: opts4(
      'Leveling can change the critical path and extend duration to resolve resource over-allocation',
      'Leveling always shortens the schedule',
      'Leveling adds budget reserve',
      'Leveling removes all dependencies'
    ),
    correct: ['a'],
    explanation: 'Resource leveling adjusts activities to address resource constraints/over-allocation, which can change the critical path and often extends the project duration. It does not inherently shorten schedules or remove dependencies.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document lists project milestones and whether they are mandatory or optional?',
    options: opts4(
      'Milestone list',
      'Risk register',
      'Stakeholder register',
      'Velocity chart'
    ),
    correct: ['a'],
    explanation: 'The milestone list identifies all project milestones and indicates whether each is mandatory (e.g., contractual) or optional. The risk and stakeholder registers and velocity chart serve other purposes.',
    references: [REF_SCHEDULE]
  },
  {
    domain: PRED, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid opportunity (positive risk) response strategies.',
    options: opts4(
      'Exploit',
      'Enhance',
      'Share',
      'Mitigate'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Opportunity (positive risk) strategies are exploit, enhance, share, escalate, and accept. Mitigate is a threat (negative risk) strategy, used to reduce the probability or impact of a threat.',
    references: [REF_RISK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which process determines the budget by aggregating estimated costs to establish a cost baseline?',
    options: opts4(
      'Determine Budget',
      'Estimate Activity Durations',
      'Identify Stakeholders',
      'Plan Communications'
    ),
    correct: ['a'],
    explanation: 'Determine Budget aggregates the estimated costs of activities or work packages to establish an authorized cost baseline. Duration estimating, stakeholder identification, and communications planning are separate processes.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'Which quality management tool is a cause-and-effect (Ishikawa) diagram used for?',
    options: opts4(
      'Identifying potential root causes of a problem',
      'Compressing the schedule',
      'Forecasting earned value',
      'Listing stakeholders'
    ),
    correct: ['a'],
    explanation: 'A cause-and-effect (Ishikawa or fishbone) diagram organizes potential causes of a problem to support root-cause analysis. It is a quality tool, not a scheduling, forecasting, or stakeholder tool.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 3, type: QType.SINGLE,
    stem: 'A predictive project must change baselined scope. What is the correct sequence?',
    options: opts4(
      'Implement, then document if time allows',
      'Submit a change request, perform integrated change control, then update baselines if approved',
      'Update the baseline first, then ask for approval',
      'Ignore the change'
    ),
    correct: ['b'],
    explanation: 'In predictive projects, scope changes require a change request, evaluation through integrated change control, and only then baseline updates if approved. Implementing before approval or ignoring changes violates change control.',
    references: [REF_PMBOK]
  },
  {
    domain: PRED, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the cost baseline include that distinguishes it from the project budget?',
    options: opts4(
      'The cost baseline excludes management reserve; the budget includes it',
      'They are always identical',
      'The cost baseline excludes contingency reserve',
      'The budget excludes all reserves'
    ),
    correct: ['a'],
    explanation: 'The cost baseline includes contingency reserves but excludes management reserve. The total project budget equals the cost baseline plus management reserve, which covers unforeseen (unknown-unknown) work.',
    references: [REF_EVM]
  },

  // ── Agile Frameworks/Methodologies (13) ──
  {
    domain: AGILE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which framework uses a board with columns and WIP limits to visualize and optimize flow?',
    options: opts4(
      'Kanban',
      'Waterfall',
      'Critical chain',
      'Earned value'
    ),
    correct: ['a'],
    explanation: 'Kanban visualizes work on a board with columns representing workflow states and uses WIP limits to improve flow and reduce bottlenecks. Waterfall, critical chain, and earned value are predictive techniques.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of backlog refinement (grooming) in Scrum?',
    options: opts4(
      'To add detail, estimates, and order to product backlog items so they are ready for future sprints',
      'To close the project',
      'To perform final acceptance',
      'To archive lessons learned'
    ),
    correct: ['a'],
    explanation: 'Backlog refinement is the ongoing activity of adding detail, estimates, and order to product backlog items so they are ready to be selected in upcoming sprints. It is not a closing or acceptance activity.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'In agile, who is responsible for creating the increment of working product each sprint?',
    options: opts4(
      'The developers/development team',
      'The project sponsor',
      'The PMO',
      'The external auditor'
    ),
    correct: ['a'],
    explanation: 'The developers (the development team) are responsible for creating a usable increment each sprint. The Product Owner sets priorities and the Scrum Master facilitates; sponsors, PMOs, and auditors do not build the increment.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about agile estimation (e.g., story points) is correct?',
    options: opts4(
      'It is a relative measure of effort, complexity, and uncertainty rather than exact hours',
      'It must always be expressed in exact hours',
      'It is fixed and never re-estimated',
      'It is set only by the Scrum Master'
    ),
    correct: ['a'],
    explanation: 'Story points are a relative measure of size that combines effort, complexity, and uncertainty rather than precise hours. Estimates can be revised as understanding improves and are typically owned by the team.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder demands a fixed scope, schedule, and cost while also wanting frequent change. What should the project manager explain?',
    options: opts4(
      'All four can be fixed simultaneously with no trade-offs',
      'Frequent change requires flexibility in at least one constraint; an adaptive or hybrid approach can manage this trade-off',
      'Change is impossible in any project',
      'Scope is irrelevant in agile'
    ),
    correct: ['b'],
    explanation: 'Embracing frequent change requires flexibility in at least one constraint (often scope). Adaptive or hybrid approaches manage this by fixing time and cost while varying scope per iteration. Not all constraints can be rigidly fixed with constant change.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'In Kanban, pulling work only when capacity is available helps limit work in progress and improve flow.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Kanban uses a pull system: new work is started only when capacity frees up, which keeps work in progress within limits and improves flow and predictability.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the main goal of the sprint retrospective?',
    options: opts4(
      'Identify improvements to the team\'s process and create an actionable plan',
      'Demonstrate the increment to stakeholders',
      'Estimate the product backlog',
      'Authorize the project'
    ),
    correct: ['a'],
    explanation: 'The sprint retrospective inspects how the last sprint went regarding people, relationships, process, and tools, and produces actionable improvements. Demonstrating the increment is the sprint review\'s purpose.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why are short feedback loops valuable in agile?',
    options: opts4(
      'They surface issues and learning early, reducing risk and rework',
      'They increase documentation only',
      'They eliminate the need for a Product Owner',
      'They guarantee a fixed scope'
    ),
    correct: ['a'],
    explanation: 'Short feedback loops let teams detect problems and incorporate learning early, when changes are cheaper, reducing risk and rework. They do not remove roles or guarantee fixed scope.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team consistently completes about 30 story points per sprint and has 150 points remaining. Roughly how many sprints remain, assuming stable velocity?',
    options: opts4(
      'About 2 sprints',
      'About 5 sprints',
      'About 10 sprints',
      'Cannot be estimated at all'
    ),
    correct: ['b'],
    explanation: 'Remaining sprints ≈ remaining work / velocity = 150 / 30 = 5 sprints, assuming velocity remains stable. Velocity-based forecasting gives a useful approximate projection for release planning.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes an increment in Scrum?',
    options: opts4(
      'A usable, potentially releasable piece of the product that meets the definition of done',
      'A list of all stakeholders',
      'The project budget',
      'A risk response strategy'
    ),
    correct: ['a'],
    explanation: 'An increment is a concrete, usable step toward the product goal that meets the definition of done and is potentially releasable. It is not a stakeholder list, budget, or risk strategy.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accountabilities/roles defined in the Scrum framework.',
    options: opts4(
      'Product Owner',
      'Scrum Master',
      'Developers',
      'Project sponsor'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Scrum defines three accountabilities: Product Owner, Scrum Master, and Developers. The project sponsor is an organizational role outside the Scrum team structure.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'What does servant leadership emphasize for the leader\'s focus?',
    options: opts4(
      'Serving and enabling the team to perform at its best',
      'Maximizing personal authority',
      'Detailed task assignment to each member',
      'Avoiding stakeholder contact'
    ),
    correct: ['a'],
    explanation: 'Servant leadership focuses on serving the team — removing impediments, developing people, and enabling self-organization — so the team performs at its best. It is not about maximizing personal authority.',
    references: [REF_AGILE]
  },
  {
    domain: AGILE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which agile principle relates to sustainable development?',
    options: opts4(
      'Teams should maintain a constant, sustainable pace indefinitely',
      'Teams should work maximum overtime every sprint',
      'Teams should never plan',
      'Teams should avoid all feedback'
    ),
    correct: ['a'],
    explanation: 'Agile promotes sustainable development: sponsors, developers, and users should be able to maintain a constant pace indefinitely, avoiding burnout. Constant overtime is contrary to this principle.',
    references: [REF_AGILE]
  },

  // ── Business Analysis Frameworks (18) ──
  {
    domain: BA, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which activity comes first in a typical business analysis effort?',
    options: opts4(
      'Needs assessment to understand the problem or opportunity',
      'Solution evaluation after delivery',
      'Project closure',
      'Procurement contract signing'
    ),
    correct: ['a'],
    explanation: 'Needs assessment, understanding the business problem or opportunity, comes early to justify and frame the work before requirements and solution activities. Solution evaluation occurs after delivery.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which technique uses a structured session with stakeholders to collaboratively define requirements quickly?',
    options: opts4(
      'Facilitated workshop',
      'Crashing',
      'Resource leveling',
      'Earned value analysis'
    ),
    correct: ['a'],
    explanation: 'A facilitated workshop brings stakeholders together in a structured session to elicit, refine, and reach agreement on requirements efficiently. Crashing, leveling, and earned value are schedule/cost techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'A requirement is ambiguous and could be interpreted multiple ways. Which quality attribute is it failing?',
    options: opts4(
      'Clarity/unambiguity',
      'Schedule float',
      'Velocity',
      'Cost variance'
    ),
    correct: ['a'],
    explanation: 'A good requirement should be clear and unambiguous so all stakeholders interpret it the same way. Ambiguity is a verification (quality) failure. Float, velocity, and cost variance are unrelated metrics.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'After deployment, metrics show only 40% of expected benefits realized. From a BA view, what should happen?',
    options: opts4(
      'Conduct solution evaluation to identify causes and recommend corrective actions',
      'Immediately delete the solution',
      'Ignore it because the project closed',
      'Add unrequested features'
    ),
    correct: ['a'],
    explanation: 'Solution evaluation assesses realized value against expectations and recommends corrective actions when benefits fall short. Deleting the solution, ignoring the gap, or gold plating are not value-driven responses.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact links business needs to requirements and then to test cases and deliverables?',
    options: opts4(
      'Requirements traceability matrix',
      'Burndown chart',
      'Network diagram',
      'Resource histogram'
    ),
    correct: ['a'],
    explanation: 'The requirements traceability matrix links business needs to requirements and onward to design, build, and test artifacts, ensuring coverage and impact analysis. The other options are scheduling/agile tools.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes a transition requirement?',
    options: opts4(
      'A temporary capability needed to move from the current state to the future state (e.g., data migration, training)',
      'A permanent functional feature of the solution',
      'A project milestone',
      'A risk response'
    ),
    correct: ['a'],
    explanation: 'Transition requirements are temporary capabilities (e.g., data conversion, training, parallel running) needed to move from the current to the future state. They are not permanent solution features.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'Stakeholders provide many requirements but resources are limited. What technique helps decide what to deliver first?',
    options: opts4(
      'Requirements prioritization (e.g., MoSCoW, value vs. effort)',
      'Schedule crashing',
      'Monte Carlo simulation',
      'Resource leveling'
    ),
    correct: ['a'],
    explanation: 'Requirements prioritization techniques such as MoSCoW or value-versus-effort analysis help determine which requirements deliver the most value within constraints. Crashing, simulation, and leveling do not prioritize requirements.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is an example of a stakeholder requirement?',
    options: opts4(
      'A sales manager needs to view monthly regional revenue to make staffing decisions',
      'The database index must use B-tree structures',
      'The API must respond within 200 ms',
      'The vendor invoice is due in 30 days'
    ),
    correct: ['a'],
    explanation: 'A stakeholder requirement expresses the need of a stakeholder group (the sales manager needing revenue visibility). The B-tree and 200 ms items are solution/nonfunctional requirements; the invoice term is a procurement detail.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Validating requirements ensures they will deliver business value and align with objectives.',
    options: opts4('True', 'False', '', '').slice(0, 2),
    correct: ['a'],
    explanation: 'Validation confirms that requirements align with business objectives and will deliver the intended value. This is distinct from verification, which checks that requirements meet quality criteria such as clarity and consistency.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique decomposes a high-level requirement into more detailed sub-requirements?',
    options: opts4(
      'Requirements decomposition/elaboration',
      'Fast tracking',
      'Crashing',
      'Reserve analysis'
    ),
    correct: ['a'],
    explanation: 'Requirements decomposition (elaboration) breaks high-level requirements into detailed, testable sub-requirements to improve clarity and traceability. Fast tracking, crashing, and reserve analysis are schedule/cost techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL characteristics of a well-written requirement.',
    options: opts4(
      'Clear and unambiguous',
      'Testable/verifiable',
      'Traceable to a need',
      'Intentionally vague to allow flexibility'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Good requirements are clear, unambiguous, testable, complete, consistent, and traceable to a business need. Intentional vagueness undermines verification and shared understanding and is not a quality characteristic.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the purpose of a context diagram in business analysis?',
    options: opts4(
      'To show the solution\'s scope and its interactions with external entities at a high level',
      'To list the project budget',
      'To track sprint velocity',
      'To record risk responses'
    ),
    correct: ['a'],
    explanation: 'A context diagram depicts the solution as a single process and its interactions with external entities (actors, systems), clarifying scope boundaries. It is not a budget, velocity, or risk artifact.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'A business analyst wants to confirm requirements with stakeholders before development. Which activity is this?',
    options: opts4(
      'Requirements review/sign-off',
      'Schedule crashing',
      'Resource leveling',
      'Procurement closure'
    ),
    correct: ['a'],
    explanation: 'A requirements review and sign-off confirms stakeholder agreement and acceptance of the requirements before development proceeds, reducing rework. Crashing, leveling, and procurement closure are unrelated activities.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'Two requirements cannot both be implemented because they contradict each other. What should the BA do?',
    options: opts4(
      'Document the conflict and facilitate stakeholder resolution to an agreed decision',
      'Implement both anyway',
      'Choose randomly',
      'Delete both without telling anyone'
    ),
    correct: ['a'],
    explanation: 'Conflicting requirements should be documented and resolved through facilitated stakeholder collaboration leading to an agreed, traceable decision. Implementing both, choosing randomly, or deleting silently creates rework and loss of trust.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which activity monitors requirements throughout the life cycle to manage changes and maintain traceability?',
    options: opts4(
      'Requirements management/monitoring',
      'Resource leveling',
      'Earned value analysis',
      'Schedule crashing'
    ),
    correct: ['a'],
    explanation: 'Requirements management and monitoring tracks requirements through the life cycle, manages changes, and maintains traceability and quality. The other options are schedule and cost techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique helps identify root causes rather than just symptoms of a business problem?',
    options: opts4(
      'Root cause analysis (e.g., 5 Whys, fishbone)',
      'Schedule crashing',
      'Velocity tracking',
      'Reserve analysis'
    ),
    correct: ['a'],
    explanation: 'Root cause analysis techniques such as the 5 Whys and fishbone diagrams trace a problem to its underlying causes so the solution addresses the real issue, not just symptoms. The others are schedule/cost techniques.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 3, type: QType.SINGLE,
    stem: 'A solution is technically successful but stakeholders are not using it. From a BA perspective, what was likely insufficient?',
    options: opts4(
      'Stakeholder engagement and adoption/transition planning',
      'The schedule baseline',
      'The cost contingency reserve',
      'The network diagram'
    ),
    correct: ['a'],
    explanation: 'Low adoption despite technical success often signals insufficient stakeholder engagement and transition/adoption planning (training, change management). Schedule baselines, reserves, and network diagrams do not drive adoption.',
    references: [REF_BA]
  },
  {
    domain: BA, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the relationship between business analysis and project management?',
    options: opts4(
      'They are complementary disciplines that collaborate to ensure the right solution is delivered effectively',
      'They are the same role with the same focus',
      'Business analysis replaces project management',
      'They never interact on a project'
    ),
    correct: ['a'],
    explanation: 'Business analysis focuses on defining the right solution and requirements, while project management focuses on delivering it effectively; they are complementary and collaborate throughout the project.',
    references: [REF_BA]
  }
];

const CAPM_DOMAINS = [
  { name: FUND, weight: 36 },
  { name: PRED, weight: 17 },
  { name: AGILE, weight: 20 },
  { name: BA, weight: 27 }
];

const CAPM_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'pmi-capm-p1',
    code: 'CAPM-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 180-minute, 65-question, blueprint-weighted set covering project management fundamentals and core concepts, predictive plan-based methodologies, agile frameworks/methodologies, and business analysis frameworks.',
    questions: P1
  },
  {
    slug: 'pmi-capm-p2',
    code: 'CAPM-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 180-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'pmi-capm-p3',
    code: 'CAPM-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 180-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const CAPM_BUNDLE = {
  slug: 'pmi-capm',
  title: 'PMI CAPM',
  description: 'All 3 PMI CAPM practice exams in one bundle — covering project management fundamentals and core concepts, predictive plan-based methodologies, agile frameworks/methodologies, and business analysis frameworks, aligned to the PMI Certified Associate in Project Management exam content outline.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 30000 // USD 300 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the PMI CAPM bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:capm-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedCapm(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'pmi' } });
  await db.vendor.upsert({
    where: { slug: 'pmi' },
    update: { name: 'PMI', description: 'Project Management Institute (PMI) certifications — project, program, agile, and business analysis credentials including the Certified Associate in Project Management (CAPM).' },
    create: { slug: 'pmi', name: 'PMI', description: 'Project Management Institute (PMI) certifications — project, program, agile, and business analysis credentials including the Certified Associate in Project Management (CAPM).' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'pmi' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of CAPM_EXAMS) {
    const title = `PMI CAPM — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the PMI Certified Associate in Project Management exam content outline.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 180,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: CAPM_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:capm-seed' } });
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
          generatedBy: 'manual:capm-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: CAPM_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CAPM_BUNDLE.slug },
    update: {
      title: CAPM_BUNDLE.title,
      description: CAPM_BUNDLE.description,
      price: CAPM_BUNDLE.price,
      priceVoucher: CAPM_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: CAPM_BUNDLE.slug,
      title: CAPM_BUNDLE.title,
      description: CAPM_BUNDLE.description,
      price: CAPM_BUNDLE.price,
      priceVoucher: CAPM_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'pmi-capm-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'pmi-capm-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'pmi-capm-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'pmi-capm-p1', tier: 'VOUCHER' as const, position: 4 }
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
