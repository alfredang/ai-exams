/**
 * CompTIA Project+ (PK0-005) bundle seed — vendor, three practice-exam
 * variants, bundle, and 195 blueprint-aligned questions. Idempotent:
 * replaces rows tagged `generatedBy: 'manual:project-plus-seed'` and
 * upserts catalog rows.
 *
 * Exported as `seedProjectPlus(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/project-plus.ts`) and the
 * protected admin API (`/api/admin/seed-project-plus`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the public CompTIA Project+
 * (PK0-005) exam objectives and standard project-management practice
 * (PMI/PMBOK, predictive/agile/hybrid delivery):
 *   - Project Management Concepts      — 33% (21 per 65-question variant)
 *   - Project Life Cycle Phases        — 30% (20)
 *   - Tools and Documentation          — 19% (12)
 *   - Basics of IT and Governance      — 18% (12)
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

const CONCEPTS = 'Project Management Concepts';
const LIFECYCLE = 'Project Life Cycle Phases';
const TOOLS = 'Tools and Documentation';
const GOV = 'Basics of IT and Governance';

const REF_OBJECTIVES = { label: 'CompTIA Project+ (PK0-005) Exam Objectives', url: 'https://www.comptia.org/certifications/project' };
const REF_PMI = { label: 'PMI — What is Project Management', url: 'https://www.pmi.org/about/what-is-project-management' };
const REF_PMBOK = { label: 'PMI — A Guide to the Project Management Body of Knowledge (PMBOK Guide)', url: 'https://www.pmi.org/pmbok-guide-standards/foundational/pmbok' };
const REF_AGILE = { label: 'PMI — Agile Practice Guide', url: 'https://www.pmi.org/pmbok-guide-standards/practice-guides/agile' };
const REF_SCRUM = { label: 'Scrum Guide', url: 'https://scrumguides.org/scrum-guide.html' };
const REF_RISK = { label: 'PMI — Risk Management', url: 'https://www.pmi.org/learning/library/risk-management-process-7156' };
const REF_CHANGE = { label: 'PMI — Change Management', url: 'https://www.pmi.org/learning/library/change-management-organizational-flexibility-7689' };
const REF_QUALITY = { label: 'PMI — Project Quality Management', url: 'https://www.pmi.org/learning/library/quality-management-project-success-6748' };
const REF_STAKE = { label: 'PMI — Stakeholder Engagement', url: 'https://www.pmi.org/learning/library/stakeholder-management-task-project-success-7736' };
const REF_EVM = { label: 'PMI — Earned Value Management', url: 'https://www.pmi.org/learning/library/earned-value-management-systems-analysis-8026' };
const REF_GOV = { label: 'PMI — Project Governance', url: 'https://www.pmi.org/learning/library/project-governance-critical-success-9945' };
const REF_ITIL = { label: 'Axelos — ITIL Service Management', url: 'https://www.axelos.com/certifications/itil-service-management' };
const REF_PRIVACY = { label: 'NIST Privacy Framework', url: 'https://www.nist.gov/privacy-framework' };
const REF_SOX = { label: 'U.S. SEC — Sarbanes-Oxley Act', url: 'https://www.sec.gov/about/laws/soa2002.pdf' };
const REF_VENDOR = { label: 'PMI — Procurement Management', url: 'https://www.pmi.org/learning/library/procurement-management-plan-projects-6128' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [
  { id: 'a', text: 'True' }, { id: 'b', text: 'False' },
  { id: 'c', text: 'Only with sponsor approval' }, { id: 'd', text: 'Never under any circumstance' }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Project Management Concepts (21) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which characteristic best distinguishes a project from ongoing operational work?',
    options: opts4(
      'It is repetitive and has no defined end.',
      'It is temporary and creates a unique product, service, or result.',
      'It never has a budget or a sponsor.',
      'It is always managed without any documentation.'
    ),
    correct: ['b'],
    explanation: 'A project is a temporary endeavor with a definite beginning and end that produces a unique deliverable. Operational work is ongoing and repetitive. Projects still have budgets, sponsors, and documentation.',
    references: [REF_PMI, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A sponsor wants the project delivered two weeks sooner without reducing scope or quality. According to the triple constraint, what is the most likely consequence?',
    options: opts4(
      'Cost will increase because more resources or overtime are needed.',
      'Quality automatically improves.',
      'The project charter becomes unnecessary.',
      'Risk is eliminated entirely.'
    ),
    correct: ['a'],
    explanation: 'The triple constraint links scope, schedule, and cost. Compressing the schedule while holding scope and quality constant typically increases cost (crashing/fast-tracking adds resources or overtime).',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which document formally authorizes the project and gives the project manager authority to apply resources?',
    options: opts4(
      'The project charter',
      'The lessons-learned register',
      'The risk register',
      'The status report'
    ),
    correct: ['a'],
    explanation: 'The project charter formally authorizes the project, names the project manager, and grants authority to apply organizational resources. It is created during initiation and signed by the sponsor.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team uses two-week timeboxed iterations, a prioritized backlog, and a daily stand-up. Which delivery approach is being used?',
    options: opts4(
      'Predictive (waterfall)',
      'Agile (Scrum)',
      'Pure sequential phase-gate with no iteration',
      'Operations management'
    ),
    correct: ['b'],
    explanation: 'Timeboxed sprints, a product backlog, and a daily stand-up are hallmarks of Scrum, an agile framework. Predictive delivery plans scope fully up front and does not iterate this way.',
    references: [REF_SCRUM, REF_AGILE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which scenario is the strongest justification for choosing a hybrid delivery approach?',
    options: opts4(
      'All requirements are fully known and fixed by contract.',
      'Infrastructure work is well-defined while the customer-facing UI requirements are still evolving.',
      'There are no stakeholders.',
      'The project has no deliverables.'
    ),
    correct: ['b'],
    explanation: 'Hybrid combines predictive and agile. Stable, well-defined work (infrastructure) suits predictive planning while evolving, feedback-driven work (UI) suits iterative agile delivery — a classic hybrid case.',
    references: [REF_AGILE, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL items that are typically inputs to qualitative risk analysis.',
    options: opts4(
      'Risk register',
      'Probability and impact assessment',
      'The final signed contract close-out',
      'Risk management plan'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Qualitative risk analysis prioritizes risks using the risk register, probability/impact assessment, and the risk management plan. Contract close-out is a procurement closure activity, not a risk-analysis input.',
    references: [REF_RISK, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A stakeholder identifies a risk that, if it occurs, would actually help the project finish early. How should this be classified?',
    options: opts4(
      'A threat to be avoided',
      'An opportunity (positive risk) to be exploited or enhanced',
      'An issue that has already occurred',
      'A defect'
    ),
    correct: ['b'],
    explanation: 'Risks can be negative (threats) or positive (opportunities). A risk that would benefit the project is an opportunity; response strategies include exploit, enhance, share, and accept.',
    references: [REF_RISK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During execution a defect is found that was not foreseen and is affecting work right now. Where should the project manager record and track it?',
    options: opts4(
      'The risk register, as a future risk',
      'The issue log, because it is a current problem requiring action',
      'The project charter',
      'The procurement statement of work'
    ),
    correct: ['b'],
    explanation: 'A risk is a potential future event; once it occurs or a problem is active it becomes an issue and is tracked in the issue log with an owner and target resolution date.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'The cost performance index (CPI) for a project is 0.85. What does this indicate?',
    options: opts4(
      'The project is under budget for the work performed.',
      'The project is over budget — it is getting 0.85 of value per dollar spent.',
      'The schedule is exactly on track.',
      'Quality is below the acceptable threshold.'
    ),
    correct: ['b'],
    explanation: 'CPI = EV / AC. A CPI below 1.0 means the project is over budget: for every dollar spent only $0.85 of earned value is delivered. CPI says nothing directly about schedule or quality.',
    references: [REF_EVM]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A schedule performance index (SPI) of 1.10 most directly means the project is:',
    options: opts4(
      'Behind schedule',
      'Ahead of schedule for the work performed',
      'Over budget',
      'Out of scope'
    ),
    correct: ['b'],
    explanation: 'SPI = EV / PV. SPI greater than 1.0 indicates more value has been earned than planned to date, so the project is ahead of schedule. Budget status is measured separately by CPI.',
    references: [REF_EVM]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which stakeholder analysis tool maps stakeholders by their level of power and level of interest?',
    options: opts4(
      'Power/interest grid',
      'Pareto chart',
      'Network diagram',
      'Burndown chart'
    ),
    correct: ['a'],
    explanation: 'The power/interest grid classifies stakeholders by authority (power) and concern (interest) to determine engagement strategy (manage closely, keep satisfied, keep informed, monitor).',
    references: [REF_STAKE, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A project manager has little formal authority and shares the resource pool with functional managers who control staff. Which organizational structure is this?',
    options: opts4(
      'Projectized organization',
      'Weak matrix organization',
      'Strong matrix organization',
      'Virtual organization with no managers'
    ),
    correct: ['b'],
    explanation: 'In a weak matrix the functional manager retains most authority and the project manager acts more as a coordinator/expediter. A strong matrix gives the PM more authority; a projectized org gives the PM full authority.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which conflict-resolution technique provides the best long-term outcome by openly addressing the disagreement and seeking a win-win?',
    options: opts4(
      'Withdraw/avoid',
      'Smooth/accommodate',
      'Collaborate/problem-solve',
      'Force/direct'
    ),
    correct: ['c'],
    explanation: 'Collaborating (problem-solving) addresses the issue directly to reach a consensus that satisfies all parties; it generally yields the most durable resolution. Withdrawing and forcing tend to leave conflicts unresolved.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A communication plan should primarily define which of the following?',
    options: opts4(
      'The exact source code repository structure',
      'What information is communicated, to whom, when, how, and by whom',
      'The hardware procurement budget only',
      'The legal indemnification clauses of the contract'
    ),
    correct: ['b'],
    explanation: 'The communications management plan defines stakeholder information needs: content, audience, frequency, method/channel, and the responsible sender — ensuring the right people get the right information at the right time.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'With 9 project team members all communicating with one another, how many communication channels exist (n(n-1)/2)?',
    options: opts4('18', '36', '45', '81'),
    correct: ['b'],
    explanation: 'The number of channels is n(n-1)/2 = 9(8)/2 = 36. This formula illustrates why communication complexity grows rapidly as team size increases.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document defines what is and is not included in the project deliverables and acceptance criteria?',
    options: opts4(
      'Scope statement',
      'Stakeholder register',
      'Procurement audit',
      'Resource calendar'
    ),
    correct: ['a'],
    explanation: 'The project scope statement describes the deliverables, project/product scope, acceptance criteria, exclusions, constraints, and assumptions, forming the baseline for managing scope.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'Uncontrolled, gradual expansion of project scope without corresponding adjustments to time, cost, or resources is known as:',
    options: opts4(
      'Gold plating',
      'Scope creep',
      'Fast tracking',
      'Rolling-wave planning'
    ),
    correct: ['b'],
    explanation: 'Scope creep is the uncontrolled addition of features/work without formal change control. Gold plating is the team adding extras voluntarily; both are managed through integrated change control.',
    references: [REF_CHANGE, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Quality assurance differs from quality control primarily in that quality assurance:',
    options: opts4(
      'Inspects finished deliverables for defects',
      'Focuses on the processes used to ensure quality is built in (process-oriented, preventive)',
      'Is performed only after project closure',
      'Replaces the need for acceptance testing'
    ),
    correct: ['b'],
    explanation: 'Quality assurance is process-oriented and preventive — auditing and improving processes so quality is built in. Quality control is product-oriented and inspects deliverables to detect defects.',
    references: [REF_QUALITY, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which contract type places the greatest cost risk on the seller/vendor?',
    options: opts4(
      'Cost-plus-fixed-fee (CPFF)',
      'Time-and-materials (T&M)',
      'Firm-fixed-price (FFP)',
      'Cost-plus-incentive-fee (CPIF)'
    ),
    correct: ['c'],
    explanation: 'In a firm-fixed-price contract the seller bears the cost risk because the price is fixed regardless of actual cost. Cost-reimbursable and T&M contracts shift more cost risk to the buyer.',
    references: [REF_VENDOR, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A RACI chart assigns Responsible, Accountable, Consulted, and Informed roles, and each activity should have exactly one Accountable role.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. A RACI matrix clarifies roles; best practice is exactly one Accountable per activity to avoid diffusion of ownership, while Responsible may be shared.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A project has a 30% chance of a $50,000 loss and a 70% chance of no loss. What is the expected monetary value (EMV) of this risk?',
    options: opts4('-$15,000', '-$35,000', '-$50,000', '$0'),
    correct: ['a'],
    explanation: 'EMV = probability × impact = 0.30 × (−$50,000) = −$15,000. EMV is used in quantitative risk analysis and decision-tree analysis to weigh uncertain outcomes.',
    references: [REF_RISK]
  },

  // ── Project Life Cycle Phases (20) ──
  {
    domain: LIFECYCLE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which phase of the project life cycle produces the project charter and identifies stakeholders?',
    options: opts4('Initiating', 'Executing', 'Closing', 'Monitoring and controlling'),
    correct: ['a'],
    explanation: 'Initiating defines the project at a high level, produces the charter, and identifies stakeholders. Planning then elaborates the detailed plans.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In which phase is the work breakdown structure (WBS) and the detailed schedule and budget developed?',
    options: opts4('Initiating', 'Planning', 'Executing', 'Closing'),
    correct: ['b'],
    explanation: 'The planning phase decomposes scope into a WBS and develops the schedule, cost, quality, resource, communications, risk, and procurement plans that form the baselines.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During which phase is most of the project budget typically expended as deliverables are produced?',
    options: opts4('Initiating', 'Planning', 'Executing', 'Closing'),
    correct: ['c'],
    explanation: 'Executing is where the team performs the work to create deliverables; it consumes the most resources and budget. Monitoring/controlling runs concurrently to track performance.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which activities are performed during the closing phase of a project?',
    options: opts4(
      'Developing the WBS and schedule baseline',
      'Obtaining formal acceptance, closing contracts, releasing resources, and documenting lessons learned',
      'Drafting the project charter',
      'Performing daily stand-ups for the next sprint'
    ),
    correct: ['b'],
    explanation: 'Closing finalizes all activities: obtaining formal sign-off/acceptance, closing procurements, archiving documents, releasing the team, and capturing lessons learned.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A formal review held at the end of a phase to decide whether to continue, modify, or terminate the project is called a:',
    options: opts4('Daily stand-up', 'Phase gate (stage gate / kill point)', 'Retrospective', 'Kickoff meeting'),
    correct: ['b'],
    explanation: 'A phase gate (stage gate) is a go/no-go decision point at a phase boundary where the sponsor/steering committee decides to proceed, hold, rework, or terminate.',
    references: [REF_PMBOK, REF_GOV]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Activities A→B→C are on the critical path with durations 4, 6, and 5 days. Activity D (3 days) runs in parallel to B and has 5 days of total float. What happens to the project end date if B slips by 2 days?',
    options: opts4(
      'No change, because D has float',
      'The project end date slips by 2 days because B is on the critical path',
      'The project finishes 2 days earlier',
      'Activity D becomes impossible'
    ),
    correct: ['b'],
    explanation: 'The critical path has zero float; any slip on a critical-path activity (B) delays the project finish by the same amount. Float on a non-critical activity (D) does not absorb that slip.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During execution the customer requests a new feature. What is the project manager\'s correct first action?',
    options: opts4(
      'Immediately implement it to keep the customer happy',
      'Submit a change request through the integrated change control process for evaluation',
      'Reject it without analysis',
      'Add it silently to the next status report'
    ),
    correct: ['b'],
    explanation: 'New scope must enter integrated change control: a change request is logged, impact (scope/time/cost/risk) assessed, and the change control board approves or rejects before implementation.',
    references: [REF_CHANGE, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which meeting is held at the start of the project (or a phase) to align the team and stakeholders on objectives, roles, and approach?',
    options: opts4('Retrospective', 'Kickoff meeting', 'Lessons-learned review', 'Change control board'),
    correct: ['b'],
    explanation: 'The kickoff meeting formally launches the project or phase, communicating objectives, scope, roles/responsibilities, schedule, and the way of working to align all participants.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Scrum, which event is held at the end of each sprint for the team to inspect how it worked and identify improvements?',
    options: opts4('Sprint planning', 'Sprint review', 'Sprint retrospective', 'Daily scrum'),
    correct: ['c'],
    explanation: 'The sprint retrospective is the team\'s inspect-and-adapt event focused on process improvement. The sprint review inspects the product increment with stakeholders.',
    references: [REF_SCRUM]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'A predictive project is at 60% schedule complete but only 40% of deliverables are accepted, with EV well below PV. Which monitoring-and-controlling action is most appropriate?',
    options: opts4(
      'Close the project early',
      'Perform variance analysis, identify root causes, and develop corrective-action recommendations',
      'Ignore it because executing is still in progress',
      'Skip the remaining quality control'
    ),
    correct: ['b'],
    explanation: 'Monitoring and controlling compares actual performance to baselines; a negative schedule variance triggers variance/root-cause analysis and corrective-action change requests, not premature closure.',
    references: [REF_EVM, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact is reviewed and refined continuously throughout an agile project rather than being fully fixed during planning?',
    options: opts4(
      'The signed firm-fixed-price contract',
      'The prioritized product backlog',
      'The project charter signature page',
      'The closed procurement file'
    ),
    correct: ['b'],
    explanation: 'In agile, the product backlog is continuously refined and reprioritized (backlog grooming) so the team always works on the highest-value items as understanding evolves.',
    references: [REF_AGILE, REF_SCRUM]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Capturing lessons learned should occur:',
    options: opts4(
      'Only after the project is fully closed',
      'Throughout the project as well as at phase ends and closure',
      'Only if the project fails',
      'Never, to avoid blame'
    ),
    correct: ['b'],
    explanation: 'Lessons learned are captured continuously (and consolidated at phase ends and closure) so improvements can be applied to the current project and future ones, not just retrospectively.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Schedule compression that overlaps activities normally done in sequence (accepting added risk/rework but no extra cost) is called:',
    options: opts4('Crashing', 'Fast tracking', 'Resource leveling', 'Lead time elimination'),
    correct: ['b'],
    explanation: 'Fast tracking performs phases or activities in parallel to shorten the schedule, increasing risk of rework. Crashing adds resources to critical activities and increases cost.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique adjusts start/finish dates based on resource constraints and may extend the project to resolve over-allocation?',
    options: opts4('Resource leveling', 'Fast tracking', 'Gold plating', 'Scope decomposition'),
    correct: ['a'],
    explanation: 'Resource leveling adjusts the schedule to address resource availability/over-allocation; it can change the critical path and may lengthen the duration.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A deliverable has been completed and verified. What must happen for it to be formally accepted?',
    options: opts4(
      'The team archives it without review',
      'The customer/sponsor reviews it against acceptance criteria and provides formal sign-off',
      'It is automatically accepted at sprint start',
      'The vendor invoices for it'
    ),
    correct: ['b'],
    explanation: 'Validate-scope/acceptance requires the customer or sponsor to review completed deliverables against documented acceptance criteria and formally sign off before they are considered accepted.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Monitoring and controlling is performed in parallel with the other phases, not as a single phase at the end.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Monitoring and controlling spans the whole life cycle, continuously tracking, reviewing, and regulating progress against the plan and managing changes.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Estimating the cost of an entire work package using a similar past project as the basis is which estimating technique?',
    options: opts4('Bottom-up estimating', 'Analogous estimating', 'Three-point estimating', 'Parametric estimating'),
    correct: ['b'],
    explanation: 'Analogous (top-down) estimating uses historical data from similar projects; it is fast and low-cost but less accurate than bottom-up or parametric estimating.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Using the PERT formula (O + 4M + P) / 6 with optimistic 4, most likely 6, pessimistic 14, what is the expected duration?',
    options: opts4('6', '7', '8', '14'),
    correct: ['b'],
    explanation: 'PERT expected duration = (4 + 4×6 + 14) / 6 = (4 + 24 + 14) / 6 = 42 / 6 = 7. Three-point/PERT estimating accounts for uncertainty.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A project is being terminated early because the business case is no longer valid. Which closing activities still apply?',
    options: opts4(
      'None — early termination skips closing',
      'Document the reason, archive records, capture lessons learned, close contracts, and release resources',
      'Only invoice the customer',
      'Re-baseline the schedule'
    ),
    correct: ['b'],
    explanation: 'Even a terminated project must be formally closed: record why it ended, archive documentation, capture lessons learned, settle/close procurements, and release the team and resources.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'In an iterative/incremental life cycle, scope is generally:',
    options: opts4(
      'Fully fixed before any work begins',
      'Elaborated progressively, with each iteration delivering a usable increment',
      'Never defined',
      'Defined only at closure'
    ),
    correct: ['b'],
    explanation: 'Iterative/incremental life cycles use progressive elaboration: requirements are refined over time and each iteration produces a working increment, enabling early feedback.',
    references: [REF_AGILE, REF_PMBOK]
  },

  // ── Tools and Documentation (12) ──
  {
    domain: TOOLS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which chart displays project activities as horizontal bars along a timeline, showing start, duration, and dependencies?',
    options: opts4('Pareto chart', 'Gantt chart', 'Control chart', 'Fishbone diagram'),
    correct: ['b'],
    explanation: 'A Gantt chart is a bar chart of the schedule showing activities, durations, milestones, and dependencies over time — a core scheduling/communication tool.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which agile chart shows the amount of remaining work in a sprint plotted against time?',
    options: opts4('Burndown chart', 'Gantt chart', 'RACI matrix', 'Histogram'),
    correct: ['a'],
    explanation: 'A sprint burndown chart plots remaining effort/work versus time, helping the team track whether it is on pace to complete the sprint backlog.',
    references: [REF_SCRUM, REF_AGILE]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A bar chart that orders defect causes from most to least frequent to highlight the "vital few" is a:',
    options: opts4('Pareto chart', 'Scatter diagram', 'Run chart', 'Network diagram'),
    correct: ['a'],
    explanation: 'A Pareto chart ranks causes by frequency to apply the 80/20 rule, focusing quality improvement on the few causes producing most defects.',
    references: [REF_QUALITY]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which document records identified risks, their analysis, owners, and planned responses?',
    options: opts4('Risk register', 'Project charter', 'Communication plan', 'Procurement SOW'),
    correct: ['a'],
    explanation: 'The risk register is the central log of identified risks with probability, impact, priority, response strategy, and owner; it is updated throughout the project.',
    references: [REF_RISK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which document is typically issued to vendors to obtain detailed proposals and pricing for defined work?',
    options: opts4(
      'Request for proposal (RFP)',
      'Status report',
      'Lessons-learned register',
      'Issue log'
    ),
    correct: ['a'],
    explanation: 'An RFP solicits detailed vendor proposals and pricing for a defined scope. An RFI gathers information; an RFQ focuses on price for well-defined commodities.',
    references: [REF_VENDOR, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL items that belong in a project status report.',
    options: opts4(
      'Schedule and cost performance vs. baseline',
      'Key risks and issues with status',
      'The vendor\'s internal payroll records',
      'Upcoming milestones and accomplishments'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A status report communicates performance against baselines, risks/issues, accomplishments, and upcoming milestones to stakeholders. A vendor\'s internal payroll is not project status content.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A cause-and-effect (Ishikawa/fishbone) diagram is primarily used to:',
    options: opts4(
      'Schedule project activities',
      'Identify and organize the potential root causes of a problem',
      'Track sprint velocity',
      'Authorize the project'
    ),
    correct: ['b'],
    explanation: 'The fishbone diagram structures brainstorming of potential root causes (e.g., people, process, materials, environment) for a quality problem, supporting root-cause analysis.',
    references: [REF_QUALITY]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool tracks current problems with an owner, priority, and target resolution date?',
    options: opts4('Issue log', 'Project charter', 'WBS dictionary', 'Burndown chart'),
    correct: ['a'],
    explanation: 'The issue log records active problems, the assigned owner, priority/severity, status, and target resolution date so issues are tracked to closure.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A Kanban board with WIP limits is most directly used to:',
    options: opts4(
      'Authorize project funding',
      'Visualize workflow and limit work in progress to improve flow',
      'Calculate earned value',
      'Sign off deliverables'
    ),
    correct: ['b'],
    explanation: 'A Kanban board visualizes work moving through stages and enforces work-in-progress limits to reduce bottlenecks and improve flow efficiency in lean/agile delivery.',
    references: [REF_AGILE]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document defines, for each WBS work package, the description, acceptance criteria, owner, and associated activities?',
    options: opts4('WBS dictionary', 'Stakeholder register', 'Risk register', 'Change log'),
    correct: ['a'],
    explanation: 'The WBS dictionary provides detailed information for each WBS component: scope of work, deliverables, acceptance criteria, responsible party, and related schedule activities.',
    references: [REF_PMBOK]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A change log records all submitted change requests and their status (approved, rejected, deferred) throughout the project.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The change log documents every change request with its disposition and status, providing an auditable history of scope/baseline changes.',
    references: [REF_CHANGE, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'A project scheduling tool reports a task with negative total float. This most likely indicates:',
    options: opts4(
      'The task can be delayed indefinitely',
      'The schedule is infeasible as planned — the task is behind the required date and the plan needs compression or re-baselining',
      'The task is complete',
      'The task has no successors'
    ),
    correct: ['b'],
    explanation: 'Negative float means the schedule cannot meet an imposed date with the current plan; the PM must compress (crash/fast-track), adjust dependencies, or re-baseline to resolve it.',
    references: [REF_PMBOK]
  },

  // ── Basics of IT and Governance (12) ──
  {
    domain: GOV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Project governance primarily provides:',
    options: opts4(
      'The day-to-day code implementation',
      'A framework of decision rights, oversight, and accountability aligning the project with organizational strategy',
      'A list of office supplies',
      'The marketing slogan'
    ),
    correct: ['b'],
    explanation: 'Governance establishes the structure, processes, decision rights, and oversight (e.g., steering committee, phase gates) to ensure the project supports organizational objectives and standards.',
    references: [REF_GOV, REF_OBJECTIVES]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which framework is most associated with IT service management practices such as incident, problem, and change management?',
    options: opts4('ITIL', 'PERT', 'RACI', 'SWOT'),
    correct: ['a'],
    explanation: 'ITIL is the widely adopted IT service management framework covering incident, problem, change, and service-level practices that IT projects often must align with.',
    references: [REF_ITIL, REF_OBJECTIVES]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A project will process customer personal data across regions. Which consideration must be built into the project from the start?',
    options: opts4(
      'Data privacy and regulatory compliance requirements',
      'Only the choice of programming language',
      'The color of the user interface',
      'Nothing — privacy is handled after launch'
    ),
    correct: ['a'],
    explanation: 'Handling personal data triggers privacy and regulatory obligations (e.g., GDPR-style laws). Compliance must be designed in (privacy by design), not bolted on post-launch.',
    references: [REF_PRIVACY, REF_GOV]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A change to a production system is requested mid-project. Following IT change-management best practice, the change should be:',
    options: opts4(
      'Applied immediately by any team member',
      'Documented, assessed for impact and risk, approved by the change authority, and scheduled with a rollback plan',
      'Made directly in production without testing',
      'Ignored until the next project'
    ),
    correct: ['b'],
    explanation: 'IT change management requires a documented request, impact/risk assessment, authorized approval, scheduling within a change window, testing, and a back-out/rollback plan to protect service stability.',
    references: [REF_ITIL, REF_CHANGE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A steering committee on an IT project is primarily responsible for:',
    options: opts4(
      'Writing the application source code',
      'Providing strategic direction, approving major changes, and resolving escalated issues',
      'Performing unit tests',
      'Managing the daily stand-up'
    ),
    correct: ['b'],
    explanation: 'The steering committee is a governance body that sets direction, approves major scope/budget changes, prioritizes, and resolves escalated decisions — it does not perform the technical work.',
    references: [REF_GOV]
  },
  {
    domain: GOV, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL that are typically governance/compliance constraints an IT project may need to satisfy.',
    options: opts4(
      'Regulatory standards (e.g., financial or privacy regulations)',
      'Organizational security policies',
      'The lead developer\'s favorite IDE theme',
      'Industry frameworks the organization has adopted (e.g., ITIL)'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'IT projects must comply with applicable regulations, internal security policies, and adopted industry frameworks. A developer\'s IDE theme is a personal preference, not a governance constraint.',
    references: [REF_GOV, REF_SOX]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document captures the high-level justification, expected benefits, and costs used to decide whether to fund a project?',
    options: opts4('Business case', 'Issue log', 'Burndown chart', 'WBS dictionary'),
    correct: ['a'],
    explanation: 'The business case documents the need, options, benefits, costs, and risks to justify investment; governance uses it to authorize and later validate continued funding.',
    references: [REF_GOV, REF_PMBOK]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'A vendor will host project data in their cloud. Which governance document defines the agreed performance and availability targets?',
    options: opts4('Service-level agreement (SLA)', 'Project charter', 'Retrospective notes', 'Gantt chart'),
    correct: ['a'],
    explanation: 'An SLA defines measurable service targets (uptime, response/resolution times, penalties). It is a key governance/vendor-management artifact for IT projects relying on third-party services.',
    references: [REF_ITIL, REF_VENDOR]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Separating duties so that no single person can both request and approve a financial change is an example of:',
    options: opts4(
      'Gold plating',
      'An internal control supporting compliance and reducing fraud risk',
      'Fast tracking',
      'Resource leveling'
    ),
    correct: ['b'],
    explanation: 'Segregation of duties is an internal control required by governance/compliance regimes (e.g., SOX) to reduce fraud and error by ensuring no single individual controls an entire critical transaction.',
    references: [REF_SOX, REF_GOV]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'When an issue exceeds the project manager\'s authority to resolve, the correct governance action is to:',
    options: opts4(
      'Hide it from stakeholders',
      'Escalate it through the defined escalation path (e.g., to the sponsor or steering committee)',
      'Cancel the project',
      'Reassign it to a junior team member'
    ),
    correct: ['b'],
    explanation: 'Governance defines an escalation path; issues beyond the PM\'s authority or tolerance are escalated to the sponsor/steering committee for a decision, with the issue documented.',
    references: [REF_GOV, REF_OBJECTIVES]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A data classification policy helps a project determine the required handling and security controls for the information it processes.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Data classification (e.g., public, internal, confidential, restricted) drives the security and handling controls a project must apply, supporting governance and compliance.',
    references: [REF_PRIVACY, REF_GOV]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'An IT project must align with an enterprise architecture standard, but the proposed solution deviates from it. What is the appropriate governance step?',
    options: opts4(
      'Proceed without telling anyone',
      'Request a formal exception/waiver through the governance/architecture review board with documented justification',
      'Abandon the project immediately',
      'Change the enterprise standard unilaterally'
    ),
    correct: ['b'],
    explanation: 'Deviations from enterprise architecture or governance standards require a documented exception/waiver approved by the appropriate review board, recording the justification, risk, and any remediation plan.',
    references: [REF_GOV, REF_OBJECTIVES]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Project Management Concepts (21) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A "program" in project management is best defined as:',
    options: opts4(
      'A single small task',
      'A group of related projects managed in a coordinated way to obtain benefits not available from managing them individually',
      'A piece of software only',
      'The project charter'
    ),
    correct: ['b'],
    explanation: 'A program is a group of related projects/subsidiary work managed together to realize benefits and control not achievable by managing them separately. A portfolio groups programs/projects by strategy.',
    references: [REF_PMI, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which value would a sponsor most likely use to decide whether a project is financially worthwhile before it starts?',
    options: opts4(
      'Sprint velocity',
      'Return on investment / net present value from the business case',
      'The number of meetings held',
      'The count of risks identified'
    ),
    correct: ['b'],
    explanation: 'Financial selection criteria such as ROI, NPV, IRR, and payback period — captured in the business case — are used by governance/sponsors to decide whether to fund a project.',
    references: [REF_GOV, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Who is typically accountable for providing project funding and championing the project at the executive level?',
    options: opts4('The project sponsor', 'A junior developer', 'The end customer support agent', 'The external auditor'),
    correct: ['a'],
    explanation: 'The sponsor provides financial resources, champions the project, signs the charter, and removes high-level obstacles. The PM manages day-to-day delivery.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Scrum, who is accountable for maximizing the value of the product and managing the product backlog?',
    options: opts4('Scrum Master', 'Product Owner', 'Project sponsor', 'Functional manager'),
    correct: ['b'],
    explanation: 'The Product Owner owns and orders the product backlog and is accountable for maximizing product value. The Scrum Master serves the team and the process.',
    references: [REF_SCRUM]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A predictive project has stable, well-understood requirements and strict regulatory documentation needs. Which approach fits best?',
    options: opts4(
      'Pure Scrum with no documentation',
      'Predictive (plan-driven) delivery',
      'No methodology at all',
      'Continuous reprioritization every day'
    ),
    correct: ['b'],
    explanation: 'When requirements are stable and heavy compliance documentation is required, a predictive (waterfall/plan-driven) approach with defined phases and baselines is most appropriate.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk response where the project manager buys insurance to transfer the financial impact of a risk to a third party is called:',
    options: opts4('Avoid', 'Mitigate', 'Transfer', 'Accept'),
    correct: ['c'],
    explanation: 'Transferring shifts the impact and ownership of a threat to a third party (e.g., insurance, fixed-price contract, warranty). It does not eliminate the risk, only its financial consequence to the project.',
    references: [REF_RISK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Establishing a contingency reserve for identified ("known-unknown") risks is part of which knowledge area?',
    options: opts4('Cost/Risk management', 'Stakeholder identification only', 'Procurement closeout', 'Kickoff facilitation'),
    correct: ['a'],
    explanation: 'Contingency reserves cover identified risks (known-unknowns) and are part of the cost baseline; management reserves cover unknown-unknowns and sit outside the baseline.',
    references: [REF_RISK, REF_EVM]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A stakeholder is currently resistant but you need them supportive. The stakeholder engagement assessment matrix helps you:',
    options: opts4(
      'Compute earned value',
      'Compare current vs. desired engagement levels and plan actions to close the gap',
      'Schedule the critical path',
      'Close procurements'
    ),
    correct: ['b'],
    explanation: 'The stakeholder engagement assessment matrix maps each stakeholder\'s current vs. desired engagement (unaware → leading) so the PM can target communications/actions to move them.',
    references: [REF_STAKE]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Earned value: PV = $10,000, EV = $8,000, AC = $9,000. What is the cost variance (CV)?',
    options: opts4('+$1,000', '-$1,000', '-$2,000', '+$2,000'),
    correct: ['b'],
    explanation: 'CV = EV − AC = 8,000 − 9,000 = −$1,000. A negative cost variance indicates the project is over budget for the work performed.',
    references: [REF_EVM]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Using the same data (PV = $10,000, EV = $8,000), what is the schedule variance (SV)?',
    options: opts4('+$2,000', '-$2,000', '-$1,000', '$0'),
    correct: ['b'],
    explanation: 'SV = EV − PV = 8,000 − 10,000 = −$2,000. A negative schedule variance means less value has been earned than planned, indicating the project is behind schedule.',
    references: [REF_EVM]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which leadership style is generally most effective when a team is highly skilled, self-organizing, and trusted?',
    options: opts4(
      'Micromanagement of every task',
      'Servant leadership / delegating',
      'Autocratic command on all decisions',
      'No leadership at all'
    ),
    correct: ['b'],
    explanation: 'Mature, self-organizing teams respond best to servant/ delegating leadership that removes impediments and empowers the team, rather than directive micromanagement.',
    references: [REF_AGILE, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A fully projectized organization is characterized by:',
    options: opts4(
      'Functional managers controlling all resources',
      'The project manager having high authority and dedicated resources reporting to them',
      'No project managers',
      'Projects being prohibited'
    ),
    correct: ['b'],
    explanation: 'In a projectized organization the PM has high-to-total authority and team members are dedicated to the project, reporting to the PM rather than to functional managers.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which communication method is most appropriate for resolving a sensitive interpersonal conflict between two team members?',
    options: opts4(
      'A mass email to the whole company',
      'A private, interactive (face-to-face or call) conversation',
      'A public social media post',
      'Posting it on the project dashboard'
    ),
    correct: ['b'],
    explanation: 'Sensitive issues call for interactive, private communication (face-to-face or call) which allows immediate feedback and confidentiality; broadcast methods are inappropriate.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team grows from 5 to 7 members. By how much does the number of communication channels increase (n(n-1)/2)?',
    options: opts4('From 10 to 21 (an increase of 11)', 'From 5 to 7 (an increase of 2)', 'From 10 to 14', 'No change'),
    correct: ['a'],
    explanation: 'Channels = n(n-1)/2. For 5: 10. For 7: 21. The increase is 11, illustrating that communication complexity rises faster than headcount.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Decomposing project deliverables into smaller, manageable work packages produces the:',
    options: opts4('Work breakdown structure (WBS)', 'Risk register', 'Stakeholder register', 'Communication plan'),
    correct: ['a'],
    explanation: 'The WBS is a hierarchical decomposition of the total scope into deliverables and work packages, forming the basis for estimating, scheduling, and control.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'The team adds extra, unrequested features because they think the customer will like them. This is:',
    options: opts4('Scope creep by the customer', 'Gold plating', 'Fast tracking', 'Baseline re-planning'),
    correct: ['b'],
    explanation: 'Gold plating is the team voluntarily adding scope beyond requirements. Like scope creep it consumes resources and adds risk without approved change control.',
    references: [REF_CHANGE, REF_QUALITY]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'The cost of conformance (e.g., training, inspections) plus the cost of nonconformance (e.g., rework, warranty claims) together describe the:',
    options: opts4('Cost of quality', 'Net present value', 'Sunk cost', 'Opportunity cost'),
    correct: ['a'],
    explanation: 'Cost of quality includes prevention and appraisal (conformance) plus internal and external failure costs (nonconformance); investing in conformance typically reduces total cost.',
    references: [REF_QUALITY]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A time-and-materials (T&M) contract is most appropriate when:',
    options: opts4(
      'The full scope is precisely known and fixed',
      'The scope is not yet fully defined and work will be billed at agreed rates for time and materials used',
      'The buyer wants to assume zero cost risk',
      'No vendor is involved'
    ),
    correct: ['b'],
    explanation: 'T&M suits work whose scope cannot be precisely defined up front; the buyer pays agreed labor rates plus materials, carrying more cost risk than under a firm-fixed-price contract.',
    references: [REF_VENDOR, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A management reserve is intended for unforeseen "unknown-unknown" work and is typically outside the cost baseline, requiring management approval to use.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Management reserves cover unknown-unknowns, sit outside the cost baseline (within the budget), and require management approval to release, unlike contingency reserves for known risks.',
    references: [REF_EVM, REF_RISK]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A decision tree shows Option A with EMV +$20,000 and Option B with EMV +$35,000. Which should be selected on EMV alone?',
    options: opts4('Option A', 'Option B', 'Neither', 'Both equally'),
    correct: ['b'],
    explanation: 'Expected monetary value analysis selects the option with the highest expected value; Option B (+$35,000) is preferred over Option A (+$20,000) on EMV alone.',
    references: [REF_RISK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A project objective should be SMART. The "M" in SMART stands for:',
    options: opts4(
      'Mandatory',
      'Measurable',
      'Managed',
      'Mitigated'
    ),
    correct: ['b'],
    explanation: 'SMART objectives are Specific, Measurable, Achievable, Relevant, and Time-bound. "Measurable" ensures progress and success can be objectively quantified and verified.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },

  // ── Project Life Cycle Phases (20) ──
  {
    domain: LIFECYCLE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'The five process groups of a predictive project life cycle are:',
    options: opts4(
      'Initiating, Planning, Executing, Monitoring & Controlling, Closing',
      'Plan, Build, Ship, Sell, Retire',
      'Define, Design, Develop, Deploy, Delete',
      'Start, Stop, Pause, Resume, End'
    ),
    correct: ['a'],
    explanation: 'PMBOK describes five process groups: Initiating, Planning, Executing, Monitoring & Controlling, and Closing. CompTIA Project+ aligns its life-cycle phases to these.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Identifying stakeholders and their influence is primarily performed during which phase (though refined later)?',
    options: opts4('Initiating', 'Closing', 'Executing only', 'It is never done'),
    correct: ['a'],
    explanation: 'Stakeholder identification begins in initiating (stakeholder register) and is continually updated; engaging them effectively requires early identification.',
    references: [REF_STAKE, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Baselines for scope, schedule, and cost are established during which phase?',
    options: opts4('Planning', 'Closing', 'Initiating', 'They are never baselined'),
    correct: ['a'],
    explanation: 'Planning produces the approved scope, schedule, and cost baselines against which performance is measured during monitoring and controlling.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Acquiring, developing, and managing the project team occurs primarily during which phase?',
    options: opts4('Executing', 'Initiating', 'Closing', 'It is not a project activity'),
    correct: ['a'],
    explanation: 'Resource acquisition, team development (e.g., training, team building), and managing the team happen during executing as the work is performed.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Archiving project documents and updating organizational process assets occurs during:',
    options: opts4('Closing', 'Planning', 'Initiating', 'It is optional and never done'),
    correct: ['a'],
    explanation: 'Closing finalizes records: archiving documentation and updating organizational process assets (templates, lessons learned) for future projects.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'On a network diagram, paths are: A-B-C = 12 days, A-D-E = 15 days, A-F = 9 days. What is the critical path duration?',
    options: opts4('9 days', '12 days', '15 days', '36 days'),
    correct: ['c'],
    explanation: 'The critical path is the longest path through the network and determines the minimum project duration: A-D-E at 15 days. Activities on it have zero float.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A go/no-go decision at the boundary of two phases is documented and decided by:',
    options: opts4(
      'The most junior team member alone',
      'The governance body (sponsor/steering committee) at a phase gate',
      'The customer support desk',
      'No one — phases never have gates'
    ),
    correct: ['b'],
    explanation: 'Phase-gate decisions are governance decisions made by the sponsor or steering committee, based on phase deliverables and the continued business justification.',
    references: [REF_GOV, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A change request has been approved by the change control board. The next life-cycle step is to:',
    options: opts4(
      'Ignore it',
      'Update the affected plans/baselines and implement the change, then verify it',
      'Close the project',
      'Delete the change log'
    ),
    correct: ['b'],
    explanation: 'After CCB approval, integrated change control requires updating affected baselines/plans, communicating, implementing, and verifying the change for completeness and correctness.',
    references: [REF_CHANGE, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Scrum, the event where the team plans the work for the upcoming iteration is the:',
    options: opts4('Sprint planning', 'Sprint retrospective', 'Daily scrum', 'Backlog deletion'),
    correct: ['a'],
    explanation: 'Sprint planning starts the sprint: the team selects backlog items and defines a sprint goal and plan. The retrospective ends it with process improvement.',
    references: [REF_SCRUM]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'During executing, quality control inspection reveals a deliverable does not meet acceptance criteria. The appropriate response is to:',
    options: opts4(
      'Ship it anyway to stay on schedule',
      'Log the defect, perform rework/corrective action, and re-inspect before acceptance',
      'Close the project',
      'Remove the acceptance criteria'
    ),
    correct: ['b'],
    explanation: 'Failed quality control requires defect logging and corrective action/rework; the deliverable must pass re-inspection against criteria before validate-scope acceptance.',
    references: [REF_QUALITY, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Progressive elaboration means that:',
    options: opts4(
      'The plan is finalized once and never changed',
      'Plans and estimates are refined and detailed as more information becomes known',
      'The project has no plan',
      'Scope is reduced each phase'
    ),
    correct: ['b'],
    explanation: 'Progressive elaboration continuously refines plans and estimates as the project advances and more accurate information becomes available, common across life-cycle phases.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A retrospective in an agile life cycle primarily aims to:',
    options: opts4(
      'Demonstrate the product to stakeholders',
      'Inspect the team\'s process and agree on improvements for the next iteration',
      'Authorize project funding',
      'Sign the contract'
    ),
    correct: ['b'],
    explanation: 'The retrospective is the inspect-and-adapt event for the team\'s working process, producing actionable improvements; the sprint review handles product demonstration.',
    references: [REF_SCRUM, REF_AGILE]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Adding two extra developers to a critical-path activity to shorten its duration, accepting higher cost, is called:',
    options: opts4('Fast tracking', 'Crashing', 'Resource leveling', 'Scope creep'),
    correct: ['b'],
    explanation: 'Crashing shortens the schedule by adding resources to critical-path activities, increasing cost. Fast tracking overlaps activities instead and increases risk rather than cost.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which sequence correctly orders typical predictive life-cycle phases?',
    options: opts4(
      'Closing → Executing → Planning → Initiating',
      'Initiating → Planning → Executing → Closing (with Monitoring & Controlling throughout)',
      'Executing → Initiating → Closing → Planning',
      'Planning → Closing → Initiating → Executing'
    ),
    correct: ['b'],
    explanation: 'Predictive projects flow Initiating → Planning → Executing → Closing, with Monitoring & Controlling performed continuously across the other phases.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Validate scope (formal acceptance of deliverables) is most closely associated with which phase?',
    options: opts4('Initiating', 'Monitoring and controlling / closing', 'Planning only', 'It is never performed'),
    correct: ['b'],
    explanation: 'Validate scope obtains formal customer acceptance of completed deliverables; it occurs during monitoring/controlling and feeds project/phase closure.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A milestone has zero duration and marks a significant point or event in the project schedule.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. A milestone is a zero-duration marker for a significant event (e.g., phase completion, key approval) used to track progress against the schedule.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Bottom-up estimating differs from analogous estimating in that it:',
    options: opts4(
      'Is faster and less accurate',
      'Aggregates detailed estimates of individual work packages for higher accuracy at greater effort',
      'Ignores the WBS',
      'Cannot be used for cost'
    ),
    correct: ['b'],
    explanation: 'Bottom-up estimating sums detailed estimates of lower-level WBS components, yielding higher accuracy but requiring more time/effort than analogous (top-down) estimating.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A "definition of done" in agile primarily ensures that:',
    options: opts4(
      'The project is fully funded',
      'Backlog items meet a shared, consistent quality/completeness standard before being considered complete',
      'The contract is signed',
      'The team is co-located'
    ),
    correct: ['b'],
    explanation: 'The definition of done is a shared checklist (tested, reviewed, documented, etc.) ensuring increments meet a consistent quality bar before being accepted as complete.',
    references: [REF_SCRUM, REF_AGILE]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'When should risk identification be performed during the life cycle?',
    options: opts4(
      'Only once during planning',
      'Iteratively throughout the project as conditions change',
      'Only at closure',
      'Never'
    ),
    correct: ['b'],
    explanation: 'Risk identification is iterative; new risks emerge and existing ones change as the project progresses, so the risk register is reviewed and updated continuously.',
    references: [REF_RISK, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A project is formally closed only after:',
    options: opts4(
      'The first deliverable is started',
      'All deliverables are accepted (or the project is terminated), contracts are closed, and closure is documented',
      'The kickoff meeting ends',
      'The first sprint ends'
    ),
    correct: ['b'],
    explanation: 'Formal closure requires acceptance of all deliverables (or documented termination), procurement closure, final reporting, lessons learned, and release of resources.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },

  // ── Tools and Documentation (12) ──
  {
    domain: TOOLS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A document that lists stakeholders with their roles, interest, influence, and engagement strategy is the:',
    options: opts4('Stakeholder register', 'Gantt chart', 'Burndown chart', 'Pareto chart'),
    correct: ['a'],
    explanation: 'The stakeholder register identifies stakeholders and records assessment information (interest, influence, expectations) and engagement classification used to plan communications.',
    references: [REF_STAKE, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A network (precedence) diagram is primarily used to:',
    options: opts4(
      'Show the logical relationships and dependencies among schedule activities',
      'Rank defects by frequency',
      'Track remaining sprint work',
      'Authorize the project'
    ),
    correct: ['a'],
    explanation: 'A precedence/network diagram depicts activity dependencies and sequencing, enabling critical path and float analysis for the schedule.',
    references: [REF_PMBOK]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A responsibility assignment matrix that uses Responsible, Accountable, Consulted, Informed is commonly called a:',
    options: opts4('RACI chart', 'Gantt chart', 'Run chart', 'Control chart'),
    correct: ['a'],
    explanation: 'A RACI chart is a responsibility assignment matrix mapping activities to roles as Responsible, Accountable, Consulted, or Informed to clarify ownership.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which document defines acceptance criteria, deliverables, and the work a vendor must perform under a contract?',
    options: opts4('Statement of work (SOW)', 'Burndown chart', 'Issue log', 'Retrospective notes'),
    correct: ['a'],
    explanation: 'The statement of work specifies the products/services, deliverables, and work to be performed by a vendor; it is referenced by the procurement contract.',
    references: [REF_VENDOR, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A run chart or control chart is most useful for:',
    options: opts4(
      'Monitoring whether a process is stable and within control limits over time',
      'Authorizing the project budget',
      'Listing stakeholders',
      'Scheduling the kickoff'
    ),
    correct: ['a'],
    explanation: 'Control charts plot process measurements against upper/lower control limits to determine whether a process is stable (in control) or shows special-cause variation requiring action.',
    references: [REF_QUALITY]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL documents typically produced or updated during project planning.',
    options: opts4(
      'Work breakdown structure',
      'Risk management plan',
      'Schedule baseline',
      'Final lessons-learned archive only after closure'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Planning produces the WBS, subsidiary management plans (including risk), and the schedule/cost/scope baselines. The final lessons-learned archive is completed at closure.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A histogram is best used to:',
    options: opts4(
      'Show the frequency distribution of a numeric variable',
      'Sequence activities',
      'Assign RACI roles',
      'Document risks'
    ),
    correct: ['a'],
    explanation: 'A histogram displays the frequency distribution of measured data (e.g., defect counts by category), supporting quality analysis and decision-making.',
    references: [REF_QUALITY]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A scatter diagram is primarily used to:',
    options: opts4(
      'Show the relationship/correlation between two variables',
      'List the project budget',
      'Define the WBS',
      'Track stakeholder engagement'
    ),
    correct: ['a'],
    explanation: 'A scatter diagram plots paired data points to reveal correlation between an independent and dependent variable, aiding root-cause and quality analysis.',
    references: [REF_QUALITY]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A meeting agenda and documented meeting minutes primarily help to:',
    options: opts4(
      'Replace the project charter',
      'Keep meetings focused and create an auditable record of decisions and action items',
      'Compute earned value',
      'Schedule the critical path'
    ),
    correct: ['b'],
    explanation: 'Agendas keep meetings on topic and time-boxed; minutes record decisions, action items, and owners, providing accountability and an auditable communication record.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A project dashboard rolled up for executives should primarily present:',
    options: opts4(
      'Every line of code written',
      'Concise key performance indicators: status, schedule/cost health, top risks/issues',
      'The full source repository',
      'Each team member\'s hourly timesheet entry'
    ),
    correct: ['b'],
    explanation: 'An executive dashboard summarizes KPIs and overall health (RAG status, schedule/cost variance, top risks/issues) for quick governance decisions, not granular operational detail.',
    references: [REF_GOV, REF_PMBOK]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A lessons-learned register should be updated throughout the project, not only at the end.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Capturing lessons learned continuously lets the team apply improvements during the current project and consolidates a richer record for future projects at closure.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'A traceability matrix is most valuable because it:',
    options: opts4(
      'Lists office equipment',
      'Links each requirement to its source and to the deliverables/tests that satisfy it, preventing gaps and scope creep',
      'Replaces the schedule',
      'Calculates NPV'
    ),
    correct: ['b'],
    explanation: 'A requirements traceability matrix maps requirements to their origin and to design, deliverables, and test cases, ensuring every requirement is delivered and verified and that no unapproved scope is added.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },

  // ── Basics of IT and Governance (12) ──
  {
    domain: GOV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A change advisory board (CAB) in IT operations is primarily responsible for:',
    options: opts4(
      'Writing user stories',
      'Evaluating, prioritizing, and authorizing changes to IT services to minimize risk',
      'Running daily stand-ups',
      'Designing the logo'
    ),
    correct: ['b'],
    explanation: 'The CAB reviews, assesses risk/impact, prioritizes, and authorizes proposed changes to IT services, a core ITIL change-management governance control.',
    references: [REF_ITIL, REF_CHANGE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a primary purpose of a project audit?',
    options: opts4(
      'To compute sprint velocity',
      'To independently verify compliance with policies, processes, and governance requirements',
      'To write production code',
      'To replace the project charter'
    ),
    correct: ['b'],
    explanation: 'Project/quality audits independently assess whether the project follows organizational policies, processes, and governance/compliance requirements, identifying gaps and improvements.',
    references: [REF_GOV, REF_QUALITY]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A project handling cardholder payment data must comply with:',
    options: opts4(
      'A relevant payment-card data security standard (e.g., PCI DSS)',
      'Only the project schedule',
      'No standards at all',
      'The Gantt chart'
    ),
    correct: ['a'],
    explanation: 'Projects processing payment-card data must meet applicable payment security standards (e.g., PCI DSS); compliance constraints shape scope, design, and acceptance criteria.',
    references: [REF_GOV, REF_PRIVACY]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A memorandum of understanding (MOU) between two departments on a shared IT project primarily:',
    options: opts4(
      'Replaces the risk register',
      'Documents the agreed roles, expectations, and responsibilities between the parties',
      'Computes earned value',
      'Schedules the sprint'
    ),
    correct: ['b'],
    explanation: 'An MOU records the mutual understanding, roles, and responsibilities of the parties; it supports governance and stakeholder alignment for cross-organizational work.',
    references: [REF_GOV, REF_VENDOR]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A non-disclosure agreement (NDA) is most relevant to an IT project when:',
    options: opts4(
      'The project never handles sensitive information',
      'External vendors or partners will access confidential or proprietary information',
      'The project has no stakeholders',
      'Only when the project is closed'
    ),
    correct: ['b'],
    explanation: 'NDAs protect confidential/proprietary information shared with vendors, contractors, or partners; executing them is a governance/compliance step before sharing sensitive data.',
    references: [REF_GOV, REF_VENDOR]
  },
  {
    domain: GOV, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL valid reasons an IT project would maintain a documented data retention and disposal requirement.',
    options: opts4(
      'Regulatory/legal compliance obligations',
      'Reducing storage cost and risk by not keeping data longer than needed',
      'Because the developer prefers it stylistically',
      'Supporting audit and e-discovery requirements'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Data retention/disposal requirements are driven by legal/regulatory compliance, cost/risk reduction, and audit/e-discovery needs — not personal stylistic preference.',
    references: [REF_PRIVACY, REF_SOX]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which governance role typically owns the decision to continue funding a project at each phase gate?',
    options: opts4(
      'The sponsor or steering committee',
      'A junior tester',
      'The external customer\'s receptionist',
      'No one'
    ),
    correct: ['a'],
    explanation: 'Funding continuation at phase gates is a governance decision owned by the sponsor or steering committee based on performance and the continued business case.',
    references: [REF_GOV]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Aligning project deliverables with an organization\'s enterprise security policy is an example of:',
    options: opts4(
      'Gold plating',
      'Meeting a governance/compliance constraint',
      'Fast tracking',
      'Resource leveling'
    ),
    correct: ['b'],
    explanation: 'Conforming to enterprise security policy is a governance/compliance constraint the project must satisfy; deviations require a formal exception through governance.',
    references: [REF_GOV, REF_OBJECTIVES]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document typically defines uptime targets and penalties for a hosted IT service used by the project?',
    options: opts4('Service-level agreement (SLA)', 'Burndown chart', 'WBS dictionary', 'Kickoff agenda'),
    correct: ['a'],
    explanation: 'An SLA specifies measurable service commitments (availability, response/resolution) and remedies/penalties; it governs vendor service quality for IT-dependent projects.',
    references: [REF_ITIL, REF_VENDOR]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Tracking who can access project systems and enforcing least privilege is primarily a matter of:',
    options: opts4(
      'Schedule compression',
      'Access control / security governance',
      'Earned value management',
      'Sprint planning'
    ),
    correct: ['b'],
    explanation: 'Least-privilege access control is a security governance control limiting users to the minimum access required, reducing risk and supporting compliance.',
    references: [REF_GOV, REF_PRIVACY]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Regulatory compliance requirements can be a constraint that shapes a project\'s scope, schedule, and acceptance criteria.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Laws, regulations, and standards act as constraints that influence scope, design, documentation, schedule, and the criteria a deliverable must meet to be accepted.',
    references: [REF_GOV, REF_PRIVACY]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization adopts a phased governance model where projects cannot proceed past design until a security review passes. This control primarily:',
    options: opts4(
      'Slows the team for no reason',
      'Ensures security/compliance risks are addressed before significant build investment, reducing costly late rework',
      'Replaces the project schedule',
      'Eliminates the need for testing'
    ),
    correct: ['b'],
    explanation: 'Gating progression on a security review embeds compliance early (shift-left), catching risks before expensive build work and reducing late, costly rework — a governance best practice.',
    references: [REF_GOV, REF_OBJECTIVES]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Project Management Concepts (21) ──
  {
    domain: CONCEPTS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A portfolio in project management is best described as:',
    options: opts4(
      'A single project only',
      'A collection of programs, projects, and operations managed as a group to achieve strategic objectives',
      'A type of Gantt chart',
      'The project closeout report'
    ),
    correct: ['b'],
    explanation: 'A portfolio groups programs, projects, and operations to meet strategic business objectives; portfolio management prioritizes investments to align with strategy.',
    references: [REF_PMI, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A constraint differs from an assumption in that a constraint:',
    options: opts4(
      'Is something believed true without proof',
      'Is a limiting factor (e.g., fixed deadline or budget) that restricts options',
      'Always benefits the project',
      'Is the same as a milestone'
    ),
    correct: ['b'],
    explanation: 'A constraint is a real limitation (budget, deadline, resource, regulation) restricting choices. An assumption is something taken to be true for planning that, if wrong, becomes a risk.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The primary purpose of a kickoff meeting is to:',
    options: opts4(
      'Close the project',
      'Align stakeholders and the team on objectives, scope, roles, and the approach',
      'Sign the vendor invoice',
      'Archive lessons learned'
    ),
    correct: ['b'],
    explanation: 'A kickoff meeting communicates the project\'s objectives, scope, roles, schedule, and way of working to align everyone before execution begins.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In agile, "velocity" is best used to:',
    options: opts4(
      'Punish underperforming team members',
      'Forecast how much work a team can complete in future iterations based on past throughput',
      'Replace the project budget',
      'Compute the critical path'
    ),
    correct: ['b'],
    explanation: 'Velocity is the amount of work a team completes per iteration historically; it is a forecasting/planning aid, not a performance-management or punitive metric.',
    references: [REF_AGILE, REF_SCRUM]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk response strategy of "accept" means the team:',
    options: opts4(
      'Eliminates the risk entirely',
      'Acknowledges the risk and takes no proactive action (possibly setting a contingency reserve) unless it occurs',
      'Transfers it to a vendor',
      'Always buys insurance'
    ),
    correct: ['b'],
    explanation: 'Acceptance acknowledges a risk without proactive change; passive acceptance does nothing, active acceptance establishes a contingency reserve to handle it if it occurs.',
    references: [REF_RISK]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk response that eliminates the threat by changing the plan so the risk can no longer occur is:',
    options: opts4('Accept', 'Avoid', 'Transfer', 'Enhance'),
    correct: ['b'],
    explanation: 'Avoidance changes the project plan (e.g., remove the risky scope or change approach) so the threat cannot materialize. Enhance is an opportunity (positive-risk) strategy.',
    references: [REF_RISK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which best describes the project manager\'s role relative to the sponsor?',
    options: opts4(
      'The PM funds the project; the sponsor runs daily work',
      'The sponsor provides funding/championing; the PM manages day-to-day delivery within authority',
      'They are the same person by definition',
      'Neither has any defined role'
    ),
    correct: ['b'],
    explanation: 'The sponsor funds and champions the project and makes high-level decisions; the project manager plans, executes, and controls the work day to day within delegated authority.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A SWOT analysis is most commonly used in project management to:',
    options: opts4(
      'Sequence schedule activities',
      'Identify strengths, weaknesses, opportunities, and threats to inform strategy and risk identification',
      'Calculate earned value',
      'Track sprint burndown'
    ),
    correct: ['b'],
    explanation: 'SWOT examines internal strengths/weaknesses and external opportunities/threats, frequently feeding risk identification and strategic planning decisions.',
    references: [REF_RISK, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'EV = $12,000, AC = $10,000. What is the cost performance index (CPI), and what does it indicate?',
    options: opts4(
      'CPI = 1.2, under budget',
      'CPI = 0.83, over budget',
      'CPI = 1.0, exactly on budget',
      'CPI = 2.0, over budget'
    ),
    correct: ['a'],
    explanation: 'CPI = EV / AC = 12,000 / 10,000 = 1.2. A CPI above 1.0 means the project is under budget — getting $1.20 of value per dollar spent.',
    references: [REF_EVM]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk has 40% probability and a +$25,000 positive impact (opportunity). Its expected monetary value is:',
    options: opts4('+$10,000', '-$10,000', '+$25,000', '+$15,000'),
    correct: ['a'],
    explanation: 'EMV = 0.40 × (+$25,000) = +$10,000. Positive EMV reflects an opportunity; quantitative analysis uses EMV to weigh and prioritize uncertain outcomes.',
    references: [REF_RISK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which estimating technique uses a statistical relationship (e.g., cost per unit × quantity) to calculate estimates?',
    options: opts4('Analogous estimating', 'Parametric estimating', 'Expert judgment only', 'Gut feel'),
    correct: ['b'],
    explanation: 'Parametric estimating uses a statistical/mathematical relationship between historical data and variables (e.g., $/sq ft × area) to produce estimates; it can be highly accurate with good data.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A stakeholder with high power and low interest should generally be:',
    options: opts4(
      'Ignored entirely',
      'Kept satisfied (monitored with appropriate, not excessive, communication)',
      'Managed with the most intensive daily engagement',
      'Removed from the project'
    ),
    correct: ['b'],
    explanation: 'On the power/interest grid, high-power/low-interest stakeholders should be kept satisfied — engaged enough to retain support without over-communicating.',
    references: [REF_STAKE]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a key benefit of a co-located or well-facilitated virtual team?',
    options: opts4(
      'Eliminates the need for any plan',
      'Improved communication, collaboration, and faster issue resolution',
      'Removes all project risk',
      'Makes the charter unnecessary'
    ),
    correct: ['b'],
    explanation: 'Co-location (or strong virtual collaboration practices) improves communication bandwidth, team cohesion, and speed of resolving issues; it does not remove the need for planning or risk management.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team of 6 grows to 10. Using n(n-1)/2, the number of communication channels goes from:',
    options: opts4('15 to 45', '6 to 10', '15 to 30', '12 to 20'),
    correct: ['a'],
    explanation: 'Channels = n(n-1)/2. For 6: 15. For 10: 45. Tripling channels for a modest headcount rise shows why larger teams need deliberate communication structures.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'The difference between verification and validation of a deliverable is that validation:',
    options: opts4(
      'Checks the deliverable was built right (meets specs)',
      'Confirms the deliverable meets the customer\'s needs/acceptance criteria (built the right thing)',
      'Is the same as verification',
      'Is never performed'
    ),
    correct: ['b'],
    explanation: 'Verification checks conformance to specifications (built it right); validation confirms the deliverable satisfies the customer\'s needs and acceptance criteria (built the right thing).',
    references: [REF_QUALITY, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'A cost-reimbursable contract is generally chosen when:',
    options: opts4(
      'Scope is precisely defined and stable',
      'Scope is uncertain and the buyer is willing to reimburse allowable costs plus a fee, accepting more cost risk',
      'The seller must bear all cost risk',
      'No procurement is required'
    ),
    correct: ['b'],
    explanation: 'Cost-reimbursable contracts (CPFF, CPIF, CPAF) suit uncertain scope; the buyer reimburses allowable costs plus a fee and therefore carries more cost risk than under a fixed-price contract.',
    references: [REF_VENDOR, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Brainstorming, the Delphi technique, and interviews are primarily techniques for:',
    options: opts4(
      'Closing procurements',
      'Information/requirements gathering and risk identification',
      'Computing CPI',
      'Resource leveling'
    ),
    correct: ['b'],
    explanation: 'Brainstorming, Delphi (anonymous expert consensus), and interviews are data-gathering techniques used for requirements elicitation and risk identification.',
    references: [REF_RISK, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A project assumption that later proves false typically becomes a project risk or issue.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Assumptions are documented in an assumption log; if an assumption is invalidated it can introduce a risk (if future) or an issue (if it already affects the project).',
    references: [REF_RISK, REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A project must finish by a regulatory deadline that cannot move, with fixed budget but flexible scope. Which approach best protects the deadline?',
    options: opts4(
      'Fix scope and let the date slip',
      'Time-box delivery and prioritize the highest-value scope to fit the fixed date and budget',
      'Ignore the deadline',
      'Remove all quality control'
    ),
    correct: ['b'],
    explanation: 'With a fixed date/budget and flexible scope, time-boxing and prioritizing the most valuable scope (agile/iterative thinking) protects the immovable regulatory deadline.',
    references: [REF_AGILE, REF_OBJECTIVES]
  },
  {
    domain: CONCEPTS, difficulty: 2, type: QType.SINGLE,
    stem: 'Tuckman\'s model of team development orders the stages as:',
    options: opts4(
      'Forming, Storming, Norming, Performing (then Adjourning)',
      'Performing, Forming, Storming, Norming',
      'Norming, Performing, Forming, Storming',
      'Storming only'
    ),
    correct: ['a'],
    explanation: 'Tuckman\'s ladder progresses Forming → Storming → Norming → Performing, with Adjourning when the team disbands; understanding it helps the PM lead a team through conflict to high performance.',
    references: [REF_PMBOK]
  },
  {
    domain: CONCEPTS, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk response strategy where two parties jointly own an opportunity so each is better positioned to capture its benefit is called:',
    options: opts4(
      'Mitigate',
      'Share',
      'Avoid',
      'Transfer'
    ),
    correct: ['b'],
    explanation: 'Sharing is a positive-risk (opportunity) strategy that allocates ownership to a third party (e.g., a partnership or joint venture) best able to capture the opportunity for the project\'s benefit. Transfer is the negative-risk analog.',
    references: [REF_RISK]
  },

  // ── Project Life Cycle Phases (20) ──
  {
    domain: LIFECYCLE, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which phase formally authorizes the project and appoints the project manager?',
    options: opts4('Closing', 'Initiating', 'Executing', 'Monitoring and controlling'),
    correct: ['b'],
    explanation: 'Initiating produces the charter, which authorizes the project and names the project manager with authority to apply resources.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Developing the project management plan and subsidiary plans occurs during which phase?',
    options: opts4('Planning', 'Initiating', 'Closing', 'It is never created'),
    correct: ['a'],
    explanation: 'The integrated project management plan and subsidiary plans (scope, schedule, cost, quality, risk, etc.) are developed during the planning phase.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Directing and managing project work to produce deliverables occurs primarily in:',
    options: opts4('Executing', 'Initiating', 'Closing', 'Planning'),
    correct: ['a'],
    explanation: 'Executing performs the work defined in the plan, producing deliverables and consuming the bulk of resources, while monitoring/controlling tracks performance.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Comparing actual performance to the baseline and recommending corrective action is the focus of:',
    options: opts4('Monitoring and controlling', 'Initiating', 'Closing', 'A kickoff meeting'),
    correct: ['a'],
    explanation: 'Monitoring and controlling measures performance against baselines, analyzes variances, and generates change requests for corrective/preventive action throughout the life cycle.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Releasing the project team and resources is an activity of which phase?',
    options: opts4('Closing', 'Initiating', 'Planning', 'It never happens'),
    correct: ['a'],
    explanation: 'During closing, after acceptance and administrative closure, the project team and other resources are formally released for reassignment.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'On a network with paths A-C-D = 10, A-B-D = 14, A-E = 7, activity B has 0 float. Activity E\'s total float is:',
    options: opts4('0 days', '4 days', '7 days', '14 days'),
    correct: ['c'],
    explanation: 'The critical path is A-B-D = 14 (longest). Path A-E = 7, so its float = 14 − 7 = 7 days. Activity B is on the critical path and therefore has zero float.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A phase-gate review concludes the business case is no longer viable. The governance body should:',
    options: opts4(
      'Force the project to continue regardless',
      'Decide to terminate (or significantly re-scope) the project and trigger closing activities',
      'Skip closure entirely',
      'Hide the decision'
    ),
    correct: ['b'],
    explanation: 'If a phase gate finds the business case invalid, governance may terminate or re-scope the project; a terminated project still goes through formal closing.',
    references: [REF_GOV, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Integrated change control is performed:',
    options: opts4(
      'Only during initiating',
      'Throughout the project from planning through closing whenever a change is requested',
      'Only at closure',
      'Never'
    ),
    correct: ['b'],
    explanation: 'Integrated change control runs continuously: any requested change is logged, assessed for cross-area impact, approved/rejected, and, if approved, applied to baselines and verified.',
    references: [REF_CHANGE, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Scrum, the daily scrum is primarily for the developers to:',
    options: opts4(
      'Report status to executives',
      'Inspect progress toward the sprint goal and adapt the plan for the next day',
      'Plan the entire release',
      'Conduct the retrospective'
    ),
    correct: ['b'],
    explanation: 'The daily scrum is a short, team-focused planning event to inspect progress toward the sprint goal and adapt the day\'s plan — not an executive status meeting.',
    references: [REF_SCRUM]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'A project is behind schedule (SPI 0.8) but on budget. The team cannot add cost. Which schedule-recovery technique fits best?',
    options: opts4(
      'Crashing (add resources, increasing cost)',
      'Fast tracking (overlap activities, accepting added risk but not cost)',
      'Reduce quality control silently',
      'Stop monitoring'
    ),
    correct: ['b'],
    explanation: 'With no budget to add resources, fast tracking (overlapping sequential activities) can recover schedule without extra cost, at the price of increased risk/rework potential.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A stage/phase boundary deliverable is rejected at the gate review. The most appropriate outcome is to:',
    options: opts4(
      'Proceed to the next phase anyway',
      'Rework the deliverable and re-present at the gate, or terminate if not justified',
      'Delete the deliverable',
      'Close the project successfully'
    ),
    correct: ['b'],
    explanation: 'A failed gate means the phase deliverables/criteria were not met; the project either reworks and re-submits to the gate or, if no longer justified, is terminated through closing.',
    references: [REF_GOV, REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'A "spike" in agile is best described as:',
    options: opts4(
      'A permanent production feature',
      'A time-boxed investigation to reduce uncertainty before estimating or committing to work',
      'A type of contract',
      'A closing activity'
    ),
    correct: ['b'],
    explanation: 'A spike is a time-boxed research/experimentation task used to gain enough knowledge to estimate or de-risk a backlog item before committing it to a sprint.',
    references: [REF_AGILE]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Resource leveling is applied and the critical path changes. This phenomenon is called the:',
    options: opts4(
      'Critical chain / resource-constrained schedule effect',
      'Pareto principle',
      'Triple constraint',
      'Halo effect'
    ),
    correct: ['a'],
    explanation: 'When resource constraints (leveling) drive the schedule, the resource-limited longest path may differ from the logic-only critical path — the basis of critical chain method.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which activity belongs to the executing phase?',
    options: opts4(
      'Developing the WBS',
      'Performing the work and implementing approved changes to produce deliverables',
      'Signing the project charter',
      'Archiving final records'
    ),
    correct: ['b'],
    explanation: 'Executing carries out the planned work, manages the team, performs quality assurance, and implements approved changes to create the project deliverables.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'The output formally accepted from validate scope feeds primarily into:',
    options: opts4(
      'The project charter',
      'Project/phase closure and the deliverable acceptance record',
      'The kickoff agenda',
      'Sprint planning only'
    ),
    correct: ['b'],
    explanation: 'Accepted deliverables from validate scope become inputs to closing, supporting administrative closure and the formal acceptance record.',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: In a predictive life cycle, scope is generally defined and baselined early, before the bulk of execution.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Predictive (plan-driven) life cycles define and baseline scope early; changes thereafter flow through integrated change control.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 3, type: QType.SINGLE,
    stem: 'Three-point estimating with O=8, M=10, P=18 using the simple average (O+M+P)/3 gives:',
    options: opts4('10', '11', '12', '18'),
    correct: ['c'],
    explanation: 'Triangular three-point estimate = (8 + 10 + 18) / 3 = 36 / 3 = 12. (PERT/beta would weight the most likely value more heavily.)',
    references: [REF_PMBOK]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the best time to begin planning the project\'s closing activities?',
    options: opts4(
      'After all work is unexpectedly finished',
      'Early — closure criteria and procedures should be planned during planning, not improvised at the end',
      'Only if the project fails',
      'Never plan closure'
    ),
    correct: ['b'],
    explanation: 'Closure criteria, acceptance procedures, and administrative steps should be defined during planning so closing is orderly and complete, not improvised.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'An iteration review (sprint review) primarily exists to:',
    options: opts4(
      'Improve the team\'s internal process',
      'Demonstrate the increment to stakeholders and gather feedback to adapt the backlog',
      'Authorize project funding',
      'Close all contracts'
    ),
    correct: ['b'],
    explanation: 'The sprint review inspects the increment with stakeholders and gathers feedback that informs backlog adaptation; the retrospective handles internal process improvement.',
    references: [REF_SCRUM, REF_AGILE]
  },
  {
    domain: LIFECYCLE, difficulty: 2, type: QType.SINGLE,
    stem: 'When does stakeholder engagement monitoring occur in the life cycle?',
    options: opts4(
      'Only at initiation',
      'Continuously, adjusting strategies as engagement levels and stakeholders change',
      'Only at closure',
      'It is not performed'
    ),
    correct: ['b'],
    explanation: 'Stakeholder engagement is monitored throughout the project; strategies are adjusted as stakeholders, their influence, and engagement levels change over time.',
    references: [REF_STAKE, REF_PMBOK]
  },

  // ── Tools and Documentation (12) ──
  {
    domain: TOOLS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A document that authorizes the project and is signed by the sponsor is the:',
    options: opts4('Project charter', 'Burndown chart', 'Pareto chart', 'Run chart'),
    correct: ['a'],
    explanation: 'The project charter is the authorizing document signed by the sponsor; it names the PM and grants authority — a foundational project document.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A burnup chart differs from a burndown chart in that a burnup chart shows:',
    options: opts4(
      'Only remaining work',
      'Completed work accumulating toward total scope (and can show scope changes)',
      'The critical path',
      'The stakeholder list'
    ),
    correct: ['b'],
    explanation: 'A burnup chart plots completed work rising toward the total scope line, making scope changes visible; a burndown chart shows only remaining work decreasing.',
    references: [REF_AGILE, REF_SCRUM]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Delphi technique is primarily a tool for:',
    options: opts4(
      'Scheduling activities',
      'Reaching anonymous expert consensus, often for estimating or risk identification',
      'Computing earned value',
      'Drawing the WBS'
    ),
    correct: ['b'],
    explanation: 'The Delphi technique gathers anonymous expert input over rounds to build consensus while reducing bias and dominance, useful for estimating and risk analysis.',
    references: [REF_RISK, REF_PMBOK]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A procurement document used to request price quotes for well-defined commodities is a/an:',
    options: opts4(
      'Request for quotation (RFQ)',
      'Risk register',
      'Burndown chart',
      'Lessons-learned register'
    ),
    correct: ['a'],
    explanation: 'An RFQ requests pricing for clearly specified goods/services. An RFP solicits detailed proposals for more complex work; an RFI gathers general information.',
    references: [REF_VENDOR, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A probability and impact matrix is primarily used to:',
    options: opts4(
      'Prioritize risks by combining likelihood and consequence',
      'Sequence schedule activities',
      'Sign the contract',
      'Track sprint velocity'
    ),
    correct: ['a'],
    explanation: 'The probability and impact matrix scores each risk by likelihood and consequence to rank/prioritize risks for response planning during qualitative analysis.',
    references: [REF_RISK]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL artifacts that are typically considered project closing documents.',
    options: opts4(
      'Final acceptance / sign-off record',
      'Lessons-learned register (final)',
      'Project closeout report',
      'Initial project charter draft'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Closing produces the formal acceptance/sign-off, the consolidated lessons-learned register, and the closeout report. The charter is an initiating document.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A flowchart in quality management is most useful for:',
    options: opts4(
      'Visualizing the steps of a process to find inefficiencies or defect sources',
      'Listing stakeholders',
      'Computing CPI',
      'Authorizing funding'
    ),
    correct: ['a'],
    explanation: 'A flowchart (process map) depicts the sequence of steps and decision points in a process, helping identify bottlenecks, rework loops, and where defects can arise.',
    references: [REF_QUALITY]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A project organization chart (OBS) primarily shows:',
    options: opts4(
      'The reporting structure and roles of the project team',
      'The frequency distribution of defects',
      'The critical path',
      'The contract terms'
    ),
    correct: ['a'],
    explanation: 'An organizational breakdown structure/org chart depicts the team\'s reporting relationships and roles, clarifying hierarchy and responsibility.',
    references: [REF_PMBOK]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A checklist used during quality control primarily helps to:',
    options: opts4(
      'Ensure required steps/criteria are consistently verified',
      'Compute net present value',
      'Sequence activities',
      'Authorize the project'
    ),
    correct: ['a'],
    explanation: 'A quality checklist provides a structured, repeatable list of items to verify, improving consistency and completeness of inspections.',
    references: [REF_QUALITY]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE,
    stem: 'A change request form should at minimum capture:',
    options: opts4(
      'Only the requester\'s name',
      'The change description, justification, and impact on scope/schedule/cost/risk for the approval decision',
      'The office floor plan',
      'The marketing budget only'
    ),
    correct: ['b'],
    explanation: 'A change request documents what is being changed, why, and the assessed impact on scope, schedule, cost, quality, and risk so the change authority can decide.',
    references: [REF_CHANGE, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A project scope statement should explicitly document exclusions (what is out of scope) as well as inclusions.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Stating exclusions explicitly manages stakeholder expectations and helps prevent scope creep by clarifying what the project will not deliver.',
    references: [REF_PMBOK, REF_OBJECTIVES]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'A cost baseline shown as an S-curve is primarily used to:',
    options: opts4(
      'List stakeholders',
      'Track planned cumulative spend over time as a reference for earned value analysis',
      'Sequence the WBS',
      'Document risks'
    ),
    correct: ['b'],
    explanation: 'The cost baseline (time-phased budget) is typically an S-curve of planned cumulative cost; actual and earned value are compared against it to compute CV, SV, CPI, and SPI.',
    references: [REF_EVM, REF_PMBOK]
  },

  // ── Basics of IT and Governance (12) ──
  {
    domain: GOV, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A PMO (project management office) most commonly provides:',
    options: opts4(
      'The actual software code',
      'Standards, methodologies, templates, governance, and support for projects',
      'The marketing campaign',
      'Customer support tickets'
    ),
    correct: ['b'],
    explanation: 'A PMO standardizes project governance: methodologies, templates, tools, training, and oversight, ranging from supportive to controlling to directive in authority.',
    references: [REF_GOV, REF_OBJECTIVES]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A project that processes EU residents\' personal data must consider compliance with:',
    options: opts4(
      'A data-protection regulation such as the GDPR',
      'Only the project schedule',
      'The Gantt chart',
      'No regulation'
    ),
    correct: ['a'],
    explanation: 'Processing EU residents\' personal data triggers GDPR-style obligations (lawful basis, data subject rights, security). These compliance constraints shape design and acceptance criteria.',
    references: [REF_PRIVACY, REF_GOV]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A disaster recovery / business continuity requirement on an IT project primarily ensures:',
    options: opts4(
      'The project is delivered cheaply',
      'Critical services can be recovered and continue within defined objectives after a disruption',
      'The team is co-located',
      'The charter is unsigned'
    ),
    correct: ['b'],
    explanation: 'DR/BC requirements (RTO/RPO) ensure critical IT services can recover and continue after disruption; they are governance/compliance constraints affecting design and testing.',
    references: [REF_ITIL, REF_GOV]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A statement of work, a service-level agreement, and a non-disclosure agreement are examples of:',
    options: opts4(
      'Agile ceremonies',
      'Vendor/governance documents that define obligations, performance, and confidentiality',
      'Quality control charts',
      'Schedule compression techniques'
    ),
    correct: ['b'],
    explanation: 'SOW, SLA, and NDA are vendor/governance documents defining the work and deliverables, service performance commitments, and confidentiality obligations respectively.',
    references: [REF_VENDOR, REF_GOV]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Maintaining an audit trail of approvals and changes on an IT project primarily supports:',
    options: opts4(
      'Faster coding',
      'Accountability, compliance, and the ability to demonstrate proper governance to auditors',
      'Sprint velocity',
      'Resource leveling'
    ),
    correct: ['b'],
    explanation: 'An audit trail of decisions, approvals, and changes provides accountability and evidence of governance/compliance, which auditors and regulators require.',
    references: [REF_SOX, REF_GOV]
  },
  {
    domain: GOV, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL that are appropriate responses when a project deliverable would violate an organizational compliance policy.',
    options: opts4(
      'Escalate to governance and document the conflict',
      'Request a formal exception/waiver if a deviation is justified',
      'Quietly ship it and hope no one notices',
      'Redesign the deliverable to comply'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Compliance conflicts must be escalated, formally waived if justified, or remediated by redesign. Knowingly shipping a violating deliverable is never an acceptable governance response.',
    references: [REF_GOV, REF_OBJECTIVES]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Encrypting sensitive data in transit and at rest on an IT project is primarily driven by:',
    options: opts4(
      'A scheduling preference',
      'Security and regulatory/compliance requirements',
      'Earned value targets',
      'The kickoff agenda'
    ),
    correct: ['b'],
    explanation: 'Encryption of sensitive data is a security control commonly mandated by regulations/policies; it is a governance/compliance requirement that shapes the project\'s design and acceptance criteria.',
    references: [REF_PRIVACY, REF_GOV]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'A vendor performance review during a project primarily checks whether the vendor:',
    options: opts4(
      'Likes the project manager',
      'Is meeting the contract/SLA deliverables, quality, and timelines',
      'Has the newest laptops',
      'Uses the same IDE'
    ),
    correct: ['b'],
    explanation: 'Vendor/procurement performance reviews assess delivery against the contract and SLA (scope, quality, schedule, cost) to manage the relationship and trigger corrective action if needed.',
    references: [REF_VENDOR, REF_ITIL]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes "shadow IT" as a governance concern on a project?',
    options: opts4(
      'Officially approved infrastructure',
      'Technology/services used without IT governance approval, creating security and compliance risk',
      'A backup data center',
      'A type of Gantt chart'
    ),
    correct: ['b'],
    explanation: 'Shadow IT is hardware/software/services adopted without governance/security approval, introducing unmanaged security, compliance, and integration risks the project must address.',
    references: [REF_GOV, REF_ITIL]
  },
  {
    domain: GOV, difficulty: 2, type: QType.SINGLE,
    stem: 'A change freeze (blackout window) before a major business event is a governance control intended to:',
    options: opts4(
      'Speed up all changes',
      'Reduce risk by restricting non-essential changes during a sensitive period',
      'Eliminate the change log',
      'Replace the project charter'
    ),
    correct: ['b'],
    explanation: 'A change freeze restricts non-essential changes during high-risk windows (e.g., fiscal close, peak season) to protect stability — a recognized IT change-governance practice.',
    references: [REF_ITIL, REF_CHANGE]
  },
  {
    domain: GOV, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Governance should define escalation paths and decision authority before issues arise, not improvise them during a crisis.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Predefined escalation paths and decision rights enable fast, accountable decisions under pressure and are a hallmark of effective project governance.',
    references: [REF_GOV, REF_OBJECTIVES]
  },
  {
    domain: GOV, difficulty: 3, type: QType.SINGLE,
    stem: 'An IT project must integrate with a regulated financial system subject to SOX-style controls. The most important governance step early in the project is to:',
    options: opts4(
      'Skip documentation to move faster',
      'Identify applicable compliance requirements and design controls/audit evidence into the solution from the start',
      'Defer all compliance to after go-live',
      'Let each developer decide individually'
    ),
    correct: ['b'],
    explanation: 'For regulated financial systems, compliance requirements and the supporting controls/audit evidence must be identified and designed in early; retrofitting controls after go-live is costly and risky.',
    references: [REF_SOX, REF_GOV]
  }
];

const PROJECT_PLUS_DOMAINS = [
  { name: CONCEPTS, weight: 33 },
  { name: LIFECYCLE, weight: 30 },
  { name: TOOLS, weight: 19 },
  { name: GOV, weight: 18 }
];

const PROJECT_PLUS_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'comptia-project-plus-p1',
    code: 'PK0-005-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 90-minute, 65-question, blueprint-weighted set covering project management concepts, the project life cycle phases, tools & documentation, and the basics of IT & governance.',
    questions: P1
  },
  {
    slug: 'comptia-project-plus-p2',
    code: 'PK0-005-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 90-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'comptia-project-plus-p3',
    code: 'PK0-005-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 90-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const PROJECT_PLUS_BUNDLE = {
  slug: 'comptia-project-plus',
  title: 'CompTIA Project+ (PK0-005)',
  description: 'All 3 CompTIA Project+ (PK0-005) practice exams in one bundle — covering project management concepts, project life cycle phases, tools & documentation, and the basics of IT & governance, aligned to the CompTIA Project+ exam objectives.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 25000 // USD 250 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the CompTIA Project+ (PK0-005) bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:project-plus-seed'` are deleted and
 * re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedProjectPlus(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'comptia' } });
  await db.vendor.upsert({
    where: { slug: 'comptia' },
    update: { name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT credentials including Project+, A+, Network+, Security+, Linux+, and Server+.' },
    create: { slug: 'comptia', name: 'CompTIA', description: 'CompTIA certifications — vendor-neutral IT credentials including Project+, A+, Network+, Security+, Linux+, and Server+.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'comptia' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of PROJECT_PLUS_EXAMS) {
    const title = `CompTIA Project+ (PK0-005) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the CompTIA Project+ (PK0-005) exam objectives.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 90,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: PROJECT_PLUS_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:project-plus-seed' } });
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
          generatedBy: 'manual:project-plus-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: PROJECT_PLUS_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: PROJECT_PLUS_BUNDLE.slug },
    update: {
      title: PROJECT_PLUS_BUNDLE.title,
      description: PROJECT_PLUS_BUNDLE.description,
      price: PROJECT_PLUS_BUNDLE.price,
      priceVoucher: PROJECT_PLUS_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: PROJECT_PLUS_BUNDLE.slug,
      title: PROJECT_PLUS_BUNDLE.title,
      description: PROJECT_PLUS_BUNDLE.description,
      price: PROJECT_PLUS_BUNDLE.price,
      priceVoucher: PROJECT_PLUS_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'comptia-project-plus-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'comptia-project-plus-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'comptia-project-plus-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'comptia-project-plus-p1', tier: 'VOUCHER' as const, position: 4 }
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
