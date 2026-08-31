/**
 * PMI-ACP bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:pmiacp-seed'` and upserts catalog rows.
 *
 * Exported as `seedPmiAcp(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/pmiacp.ts`) and the protected
 * admin API (`/api/admin/seed-pmiacp`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is original, scenario-based, and authored against the
 * public PMI-ACP exam content outline and standard agile / Scrum / Kanban
 * / Lean / XP practice. These are practice items only — they are not
 * copied from, and do not reproduce, any real PMI exam.
 *
 * PMI-ACP domain blueprint (sum 100):
 *   - Agile Principles and Mindset            — 16 (10 per 65-q variant)
 *   - Value-Driven Delivery                   — 20 (13)
 *   - Stakeholder Engagement                  — 17 (11)
 *   - Team Performance                        — 16 (10)
 *   - Adaptive Planning                       — 12 (8)
 *   - Problem Detection and Resolution        — 10 (7)
 *   - Continuous Improvement                  — 9  (6)
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

const MINDSET = 'Agile Principles and Mindset';
const VALUE = 'Value-Driven Delivery';
const STAKE = 'Stakeholder Engagement';
const TEAM = 'Team Performance';
const PLAN = 'Adaptive Planning';
const PROBLEM = 'Problem Detection and Resolution';
const IMPROVE = 'Continuous Improvement';

const REF_ACP = { label: 'PMI — PMI Agile Certified Practitioner (PMI-ACP)', url: 'https://www.pmi.org/certifications/agile-acp' };
const REF_AGILE_GUIDE = { label: 'PMI — Agile Practice Guide', url: 'https://www.pmi.org/standards/agile-practice-guide' };
const REF_MANIFESTO = { label: 'Agile Alliance — Manifesto for Agile Software Development', url: 'https://agilemanifesto.org/' };
const REF_PRINCIPLES = { label: 'Agile Alliance — Twelve Principles behind the Agile Manifesto', url: 'https://agilemanifesto.org/principles.html' };
const REF_SCRUMGUIDE = { label: 'Scrum.org — The Scrum Guide', url: 'https://scrumguides.org/scrum-guide.html' };
const REF_AA_GLOSSARY = { label: 'Agile Alliance — Agile glossary', url: 'https://www.agilealliance.org/agile101/agile-glossary/' };
const REF_KANBAN = { label: 'Agile Alliance — Kanban', url: 'https://www.agilealliance.org/glossary/kanban/' };
const REF_LEAN = { label: 'Agile Alliance — Lean software development', url: 'https://www.agilealliance.org/glossary/lean/' };
const REF_XP = { label: 'Agile Alliance — Extreme Programming (XP)', url: 'https://www.agilealliance.org/glossary/xp/' };
const REF_CI = { label: 'Agile Alliance — Continuous Integration', url: 'https://www.agilealliance.org/glossary/continuous-integration/' };
const REF_RETRO = { label: 'Agile Alliance — Retrospective', url: 'https://www.agilealliance.org/glossary/heartbeat-retrospective/' };
const REF_VELOCITY = { label: 'Agile Alliance — Velocity', url: 'https://www.agilealliance.org/glossary/velocity/' };
const REF_BURNDOWN = { label: 'Agile Alliance — Burndown chart', url: 'https://www.agilealliance.org/glossary/burndown-chart/' };
const REF_STORY = { label: 'Agile Alliance — User stories', url: 'https://www.agilealliance.org/glossary/user-stories/' };
const REF_INVEST = { label: 'Agile Alliance — INVEST', url: 'https://www.agilealliance.org/glossary/invest/' };
const REF_DOD = { label: 'Agile Alliance — Definition of Done', url: 'https://www.agilealliance.org/glossary/definition-of-done/' };
const REF_PERSONA = { label: 'Agile Alliance — Personas', url: 'https://www.agilealliance.org/glossary/personas/' };
const REF_WIP = { label: 'Agile Alliance — WIP limit', url: 'https://www.agilealliance.org/glossary/wip-limit/' };
const REF_RCA = { label: 'Agile Alliance — Five whys / root cause analysis', url: 'https://www.agilealliance.org/glossary/root-cause-analysis/' };
const REF_PMI_ETHICS = { label: 'PMI — Code of Ethics and Professional Conduct', url: 'https://www.pmi.org/about/ethics/code' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Agile Principles and Mindset (10) ──
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'According to the Agile Manifesto, which of these is valued MORE than the other in the pair?',
    options: opts4(
      'Comprehensive documentation over working software',
      'Working software over comprehensive documentation',
      'Contract negotiation over customer collaboration',
      'Following a plan over responding to change'
    ),
    correct: ['b'],
    explanation: 'The Agile Manifesto values working software over comprehensive documentation, customer collaboration over contract negotiation, and responding to change over following a plan. The items on the right still have value, but the left items are valued more.',
    references: [REF_MANIFESTO]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'A new team treats the Agile Manifesto\'s "individuals and interactions over processes and tools" as license to skip all process. What is the most accurate interpretation a coach should offer?',
    options: opts4(
      'Processes and tools have no place on an agile team',
      'The statement expresses a preference, not an absolute — processes still have value but should serve people and collaboration',
      'Teams should adopt as many tools as possible to maximize interaction',
      'The Manifesto forbids documenting any process'
    ),
    correct: ['b'],
    explanation: 'Each Manifesto line states a value preference, not an absolute. Process and tools still have value; the point is that they should support — not replace — human collaboration and judgement.',
    references: [REF_MANIFESTO, REF_AGILE_GUIDE]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which agile principle most directly supports delivering a minimal slice early and iterating?',
    options: opts4(
      '"Deliver working software frequently, from a couple of weeks to a couple of months, with a preference to the shorter timescale."',
      '"The best architectures emerge from self-organizing teams."',
      '"Simplicity—the art of maximizing the amount of work not done—is essential."',
      '"Build projects around motivated individuals."'
    ),
    correct: ['a'],
    explanation: 'Frequent delivery of working software in short timescales is the principle that most directly underpins releasing a small slice early and iterating based on feedback.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder asks the team to "lock the scope and just follow the plan." Which agile value should the coach reference to reframe the conversation?',
    options: opts4(
      'Processes and tools over individuals',
      'Responding to change over following a plan',
      'Contract negotiation over customer collaboration',
      'Documentation over working software'
    ),
    correct: ['b'],
    explanation: '"Responding to change over following a plan" is the value that frames why agile teams keep scope adaptable and re-plan based on learning rather than freezing scope up front.',
    references: [REF_MANIFESTO]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that reflect a servant-leadership mindset for an agile practitioner.',
    options: opts4(
      'Remove impediments so the team can focus on delivering value',
      'Assign every task and dictate how each is done',
      'Foster an environment where the team can self-organize',
      'Shield the team from unnecessary interruptions'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Servant leadership focuses on enabling the team: removing impediments, fostering self-organization, and protecting focus. Dictating every task contradicts self-organization.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: An agile mindset treats predictive (plan-driven) approaches as always inferior and never appropriate.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. An agile mindset is context-aware. Predictive approaches are appropriate when requirements and technology are well understood; agile shines under high uncertainty and change.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'Which behavior best demonstrates "embracing change for the customer\'s competitive advantage"?',
    options: opts4(
      'Rejecting all changes once a sprint backlog is set, forever',
      'Welcoming a high-value requirement change at the next planning boundary even though it was not in the original plan',
      'Charging a change-control fee for any feedback',
      'Freezing requirements at project kickoff'
    ),
    correct: ['b'],
    explanation: 'The agile principle welcomes changing requirements, even late, for the customer\'s competitive advantage. Incorporating a high-value change at the next planning boundary embodies this.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'A team debates whether "sustainable pace" means working slowly. What is the correct framing?',
    options: opts4(
      'It means deliberately working as slowly as possible',
      'It means a pace the team can maintain indefinitely without burnout, sustaining quality and throughput',
      'It means unlimited overtime to hit dates',
      'It applies only to the testers'
    ),
    correct: ['b'],
    explanation: 'Sustainable development means stakeholders should be able to maintain a constant pace indefinitely — protecting quality, predictability, and people from burnout, not working slowly.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is a core element of the Kanban method\'s mindset?',
    options: opts4(
      'Start with big-bang reorganization and new roles immediately',
      'Visualize the workflow and limit work in progress to expose bottlenecks',
      'Eliminate all measurement to reduce overhead',
      'Mandate fixed two-week iterations for every team'
    ),
    correct: ['b'],
    explanation: 'Kanban emphasizes visualizing the workflow, limiting WIP, and managing flow — evolving the current process rather than imposing big-bang change.',
    references: [REF_KANBAN]
  },
  {
    domain: MINDSET, difficulty: 4, type: QType.SINGLE,
    stem: 'A leader claims "agile means no documentation and no planning." Which response best corrects this misconception?',
    options: opts4(
      'They are right; agile teams never plan or document',
      'Agile favors just-enough, just-in-time documentation and continuous planning rather than none at all',
      'Agile requires more documentation than waterfall',
      'Planning is forbidden after project start'
    ),
    correct: ['b'],
    explanation: 'Agile reduces low-value, big-up-front documentation in favor of just-enough, just-in-time artifacts and continuous, adaptive planning — not the absence of planning or documentation.',
    references: [REF_AGILE_GUIDE, REF_MANIFESTO]
  },

  // ── Value-Driven Delivery (13) ──
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A product owner can release one of three features. Each has equal cost and effort. Which prioritization basis is most consistent with value-driven delivery?',
    options: opts4(
      'Alphabetical order of feature names',
      'The order the features were requested',
      'Expected business value and risk reduction per unit of effort',
      'Whichever the most senior engineer prefers'
    ),
    correct: ['c'],
    explanation: 'Value-driven delivery sequences work to maximize value and reduce risk early — prioritizing by value (and risk) per unit of effort, not arbitrary or seniority-based ordering.',
    references: [REF_ACP, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A backlog has items A (value 8, effort 2), B (value 9, effort 9), C (value 4, effort 1). Using a simple value-to-effort ratio for sequencing, which order maximizes early value delivery?',
    options: opts4(
      'B, A, C',
      'A, C, B',
      'C, B, A',
      'B, C, A'
    ),
    correct: ['b'],
    explanation: 'Ratios: A = 8/2 = 4.0, C = 4/1 = 4.0, B = 9/9 = 1.0. Sequencing highest ratio first (A and C ahead of B) delivers value soonest; A then C then B is the best fit.',
    references: [REF_ACP]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of a Minimum Viable Product (MVP)?',
    options: opts4(
      'To ship the lowest-quality product possible',
      'To deliver the smallest releasable increment that lets the team learn validated information from real users',
      'To complete every planned feature before any release',
      'To avoid talking to customers until launch'
    ),
    correct: ['b'],
    explanation: 'An MVP is the smallest thing you can build and release to obtain validated learning about customers with the least effort — it is about learning fast, not low quality.',
    references: [REF_AA_GLOSSARY]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'The team has a strong, agreed Definition of Done. A stakeholder pressures them to mark a story "done" without automated tests to hit a date. What is the best agile response?',
    options: opts4(
      'Mark it done; dates outrank quality',
      'Keep the story not-done because it does not meet the Definition of Done, and make the trade-off transparent',
      'Silently delete the test requirement from the Definition of Done',
      'Split the team so half ignore the Definition of Done'
    ),
    correct: ['b'],
    explanation: 'The Definition of Done protects quality and creates a shared, transparent standard. Work that does not meet it is not done; the trade-off should be made visible to stakeholders, not hidden.',
    references: [REF_DOD]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that reduce the risk of large, late, low-value delivery.',
    options: opts4(
      'Delivering in small, frequent increments',
      'Prioritizing high-risk, high-value items earlier',
      'Deferring all integration to the end of the project',
      'Validating increments with real users early'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Small frequent increments, early high-risk/high-value work, and early validation all shorten feedback loops and reduce delivery risk. Deferring integration to the end increases risk.',
    references: [REF_AGILE_GUIDE, REF_CI]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Incremental delivery allows value to be realized before the entire scope is complete.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Delivering usable increments lets the customer realize and benefit from value early, rather than waiting for the entire scope to be complete.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which metric best signals the economic value being returned by the product over time?',
    options: opts4(
      'Lines of code written per developer',
      'Number of meetings held',
      'Return on investment (ROI) and realized business benefits',
      'Count of Jira tickets created'
    ),
    correct: ['c'],
    explanation: 'Value-driven delivery focuses on economic outcomes — ROI and realized benefits — not activity proxies like lines of code, meetings, or ticket counts.',
    references: [REF_ACP]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team uses cumulative flow and notices the "in progress" band widening continuously. From a value perspective, what is the most likely problem?',
    options: opts4(
      'Throughput is too high',
      'Work is starting faster than it is finishing, increasing WIP and delaying value',
      'The team is delivering too frequently',
      'The backlog is too small'
    ),
    correct: ['b'],
    explanation: 'A widening in-progress band on a cumulative flow diagram indicates arrival rate exceeding completion rate — growing WIP, longer lead times, and delayed value realization.',
    references: [REF_WIP, REF_KANBAN]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is a prioritized product backlog central to value-driven delivery?',
    options: opts4(
      'It guarantees fixed scope',
      'It ensures the team always works on the highest-value, highest-priority items next',
      'It removes the need for a product owner',
      'It eliminates the need for any planning'
    ),
    correct: ['b'],
    explanation: 'An ordered backlog ensures the next work taken is the most valuable remaining item, maximizing value delivered per unit of capacity.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: VALUE, difficulty: 4, type: QType.SINGLE,
    stem: 'A feature will lose $10,000/week of benefit for every week its delivery is delayed. Two other features have negligible delay cost. Which prioritization concept most directly argues to sequence the costly-delay feature first?',
    options: opts4(
      'Sunk cost',
      'Cost of delay',
      'Parkinson\'s law',
      'Conway\'s law'
    ),
    correct: ['b'],
    explanation: 'Cost of delay quantifies the economic impact of not having a feature now. A high cost of delay argues for sequencing that feature earlier to avoid losing accruing value.',
    references: [REF_ACP, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'The customer wants a "perfect" feature but cannot articulate exact needs. Which approach best balances value and learning?',
    options: opts4(
      'Build the full feature in isolation for six months, then show it',
      'Release a thin, usable slice quickly and refine based on real feedback',
      'Refuse to start until every requirement is signed off',
      'Document requirements exhaustively and skip releasing'
    ),
    correct: ['b'],
    explanation: 'Delivering a thin, usable slice and refining from real feedback validates assumptions early and reduces the risk of building the wrong "perfect" thing.',
    references: [REF_AA_GLOSSARY, REF_PRINCIPLES]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is the best example of reducing waste in a Lean sense?',
    options: opts4(
      'Building speculative features no customer has requested',
      'Eliminating handoffs and partially done work that add no customer value',
      'Adding more approval gates to every change',
      'Increasing batch sizes to "be efficient"'
    ),
    correct: ['b'],
    explanation: 'Lean targets waste such as partially done work, handoffs, and overproduction. Removing non-value-adding handoffs and WIP reduces waste; speculative features and larger batches add it.',
    references: [REF_LEAN]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A regulatory constraint means a compliance feature has low user-visible value but high risk if missing at launch. How should value-driven prioritization treat it?',
    options: opts4(
      'Always last, since user-visible value is low',
      'Treat risk reduction as part of value; sequence it early enough to avoid a launch-blocking risk',
      'Drop it entirely',
      'Defer it indefinitely to a future release'
    ),
    correct: ['b'],
    explanation: 'Value in agile includes risk reduction. A launch-blocking compliance item carries high risk-adjusted value and should be scheduled early enough to retire that risk.',
    references: [REF_ACP]
  },

  // ── Stakeholder Engagement (11) ──
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of a sprint review (iteration review)?',
    options: opts4(
      'To privately rate individual team members',
      'To inspect the increment with stakeholders and adapt the product backlog based on feedback',
      'To assign blame for missed commitments',
      'To plan the next sprint in detail'
    ),
    correct: ['b'],
    explanation: 'The sprint review is a working session where the team and stakeholders inspect the increment and adapt the backlog based on feedback — collaborative, not an evaluation or detailed planning event.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'Two key stakeholders give conflicting priority direction. What should the agile practitioner do first?',
    options: opts4(
      'Pick one arbitrarily and proceed',
      'Facilitate a conversation to surface the conflict and route the priority decision to the product owner / accountable decision-maker',
      'Escalate to legal',
      'Stop all work until they agree on their own'
    ),
    correct: ['b'],
    explanation: 'Surfacing conflicts transparently and channeling priority decisions to the single accountable role (product owner) preserves a coherent value order and stakeholder trust.',
    references: [REF_AGILE_GUIDE, REF_SCRUMGUIDE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why do agile teams favor frequent demos of working software to stakeholders?',
    options: opts4(
      'To reduce transparency',
      'To get fast, concrete feedback and keep expectations aligned with reality',
      'To avoid having to talk to customers',
      'To replace all written communication permanently'
    ),
    correct: ['b'],
    explanation: 'Frequent demos provide concrete, early feedback and keep stakeholder expectations aligned with the actual product state, building trust and reducing late surprises.',
    references: [REF_PRINCIPLES, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL techniques that improve stakeholder engagement and shared understanding.',
    options: opts4(
      'Information radiators visible to all',
      'Collaborative story workshops with the customer',
      'Hiding progress until the project ends',
      'Regular review/demo cadence'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Information radiators, collaborative workshops, and a regular review cadence all increase transparency and shared understanding. Hiding progress destroys trust and engagement.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder rarely attends reviews and later complains the product is "wrong." What is the most effective agile-aligned remedy going forward?',
    options: opts4(
      'Remove that stakeholder from the project',
      'Negotiate an engagement model (cadence, channel, format) that fits their availability so feedback arrives early',
      'Stop holding reviews',
      'Build everything without their input'
    ),
    correct: ['b'],
    explanation: 'Tailoring the engagement model to stakeholder availability keeps feedback loops short and prevents late "this is wrong" surprises, rather than excluding them or eliminating reviews.',
    references: [REF_AGILE_GUIDE, REF_ACP]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Building trust with stakeholders through transparency and honest communication is a core agile practice.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Transparency, honesty, and frequent collaboration build the stakeholder trust agile relies on for fast feedback and adaptive decision-making.',
    references: [REF_AGILE_GUIDE, REF_PMI_ETHICS]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'During a review the customer requests a change that conflicts with a previously stated need. Best practice is to:',
    options: opts4(
      'Refuse to discuss it',
      'Capture it transparently, discuss trade-offs, and let the product owner re-prioritize the backlog',
      'Implement both contradictory requests silently',
      'Tell the customer they are not allowed to change their mind'
    ),
    correct: ['b'],
    explanation: 'Welcoming change means capturing the request, making trade-offs explicit, and letting the product owner re-order the backlog — collaboration over contract rigidity.',
    references: [REF_MANIFESTO, REF_SCRUMGUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the main benefit of creating personas with stakeholders?',
    options: opts4(
      'They replace all real user research permanently',
      'They build a shared, concrete understanding of target users to guide prioritization and design decisions',
      'They are used to rank developers',
      'They eliminate the need for a backlog'
    ),
    correct: ['b'],
    explanation: 'Personas give the team and stakeholders a shared, concrete picture of users, improving empathy and guiding value-based prioritization and design — they complement, not replace, research.',
    references: [REF_PERSONA]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'An "information radiator" (e.g., a visible task board) primarily serves to:',
    options: opts4(
      'Hide status from management',
      'Make progress, flow, and impediments transparent to anyone who walks by',
      'Replace all team conversations',
      'Track individual performance secretly'
    ),
    correct: ['b'],
    explanation: 'An information radiator makes status and impediments highly visible and low-effort to consume, supporting transparency and shared situational awareness.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 4, type: QType.SINGLE,
    stem: 'A senior executive wants weekly written status only and never attends demos. Which agile-aligned approach best preserves engagement and value alignment?',
    options: opts4(
      'Ignore the executive entirely',
      'Provide a concise value-focused summary in their preferred channel while still inviting them to demos and offering recorded increments',
      'Force the executive to attend every ceremony',
      'Stop demonstrating working software'
    ),
    correct: ['b'],
    explanation: 'Meeting stakeholders in their preferred channel with value-focused information — while keeping the door open to demos/recordings — maintains alignment without coercion or loss of transparency.',
    references: [REF_AGILE_GUIDE, REF_ACP]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best example of managing stakeholder expectations honestly under PMI\'s ethical standards?',
    options: opts4(
      'Reporting optimistic dates you do not believe to keep stakeholders calm',
      'Communicating realistic forecasts with uncertainty ranges and surfacing risks early',
      'Withholding bad news until the deadline',
      'Blaming the team for any slippage publicly'
    ),
    correct: ['b'],
    explanation: 'PMI\'s code emphasizes honesty and responsibility. Realistic forecasts with uncertainty and early risk disclosure manage expectations ethically and preserve trust.',
    references: [REF_PMI_ETHICS, REF_AGILE_GUIDE]
  },

  // ── Team Performance (10) ──
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What characterizes a self-organizing agile team?',
    options: opts4(
      'A manager assigns each task and tracks individual hours',
      'The team decides how to accomplish its work and who does what within its goals',
      'Only the most senior member makes all decisions',
      'Tasks are assigned by an external PMO daily'
    ),
    correct: ['b'],
    explanation: 'Self-organizing teams determine how best to accomplish their work and allocate tasks among themselves within the goals and constraints set with leadership.',
    references: [REF_SCRUMGUIDE, REF_PRINCIPLES]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A team is in the "storming" stage (Tuckman model) with frequent conflict. What is the most constructive coaching action?',
    options: opts4(
      'Disband and rebuild the team',
      'Facilitate healthy conflict resolution and establish working agreements to move toward norming',
      'Ignore the conflict; it will pass on its own',
      'Reassign all members to other teams'
    ),
    correct: ['b'],
    explanation: 'Storming is a normal stage. Coaching the team through constructive conflict and co-creating working agreements helps it progress to norming and performing.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Why are small, co-located or well-connected cross-functional teams preferred in agile?',
    options: opts4(
      'They require more documentation',
      'They lower communication cost and can deliver end-to-end value with fewer external dependencies',
      'They eliminate the need for testing',
      'They make estimation impossible'
    ),
    correct: ['b'],
    explanation: 'Small cross-functional teams reduce communication overhead and external handoffs, enabling them to deliver complete slices of value independently.',
    references: [REF_PRINCIPLES, REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that improve team performance and motivation.',
    options: opts4(
      'Providing a clear, shared goal',
      'Protecting the team from constant context switching',
      'Adding more parallel projects per person',
      'Building psychological safety so issues surface early'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Clear goals, focus (less context switching), and psychological safety all raise performance and motivation. Adding parallel projects increases WIP and harms throughput and morale.',
    references: [REF_AGILE_GUIDE, REF_PRINCIPLES]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A team\'s velocity is best used as a tool for the team\'s own forecasting and improvement rather than as a cross-team performance comparison.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Velocity is team-specific and estimation-relative. It supports the team\'s own planning and trend analysis; comparing velocities across teams is misleading and harmful.',
    references: [REF_VELOCITY]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A coach notices the daily stand-up has become a 30-minute status report to the manager. What is the best corrective action?',
    options: opts4(
      'Cancel the stand-up entirely',
      'Refocus it as a short team coordination/replanning event toward the sprint goal, time-boxed to ~15 minutes',
      'Make it 60 minutes so everything is covered',
      'Have only the manager speak'
    ),
    correct: ['b'],
    explanation: 'The daily stand-up is for the team to inspect progress toward the goal and re-plan — a brief, team-owned coordination event, not a status report to a manager.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the strongest indicator of a healthy, high-performing agile team?',
    options: opts4(
      'Individuals optimizing only their own utilization',
      'Predictable delivery of valuable, done increments with stable quality and engaged members',
      'Maximum lines of code per person',
      'Zero conversations during the day'
    ),
    correct: ['b'],
    explanation: 'Sustained delivery of valuable, truly-done increments with stable quality and engaged people is the meaningful signal — not individual utilization or output proxies.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of a team working agreement?',
    options: opts4(
      'A legal contract with the customer',
      'A set of norms the team co-creates to guide collaboration and behavior',
      'A list of individual performance ratings',
      'The product backlog'
    ),
    correct: ['b'],
    explanation: 'A working agreement is a team-authored set of behavioral norms (e.g., core hours, definition of done usage, meeting etiquette) that strengthens collaboration and accountability.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 4, type: QType.SINGLE,
    stem: 'Frequent reassignment of team members between projects is harming delivery. Which agile principle most directly supports stabilizing the team?',
    options: opts4(
      '"Maximize the amount of work not done"',
      '"Build projects around motivated individuals... give them the environment and support they need"',
      '"The best architectures emerge from self-organizing teams"',
      '"Working software is the primary measure of progress"'
    ),
    correct: ['b'],
    explanation: 'Building projects around motivated individuals and giving them a supportive, stable environment argues for protecting team stability rather than churning membership.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A high-skill member dominates discussions, suppressing others\' input. What is the best facilitation response?',
    options: opts4(
      'Let the strongest voice always decide',
      'Use facilitation techniques (round-robin, silent writing, time-boxing) to ensure balanced participation',
      'Remove the skilled member from the team',
      'Stop holding team discussions'
    ),
    correct: ['b'],
    explanation: 'Structured facilitation techniques balance participation and surface diverse ideas, improving decision quality and psychological safety without losing the skilled member\'s contribution.',
    references: [REF_AGILE_GUIDE]
  },

  // ── Adaptive Planning (8) ──
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best describes progressive elaboration / rolling-wave planning in agile?',
    options: opts4(
      'Plan the entire project in full detail once, up front',
      'Plan near-term work in detail and longer-term work at a coarser level, refining as you learn',
      'Never plan beyond the current day',
      'Only the sponsor plans; the team executes blindly'
    ),
    correct: ['b'],
    explanation: 'Adaptive planning elaborates detail just in time: near-term items are refined finely while distant items stay coarse, updated continuously as knowledge increases.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'A team\'s average velocity over five sprints is 24 points. The backlog for a release has ~144 points. Roughly how many sprints should the team forecast, communicating it as a range?',
    options: opts4(
      'Exactly 3 sprints, no uncertainty',
      'About 6 sprints, expressed as a range to reflect uncertainty',
      'Exactly 12 sprints, fixed',
      'It cannot be estimated at all'
    ),
    correct: ['b'],
    explanation: '144 / 24 = 6 sprints as a point estimate. Adaptive planning communicates this as a range (e.g., 5–7) to reflect velocity variability and scope change.',
    references: [REF_VELOCITY, REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the main purpose of backlog refinement (grooming)?',
    options: opts4(
      'To assign blame for incomplete stories',
      'To keep upcoming items clear, sized, and ready so planning is smooth',
      'To freeze the backlog permanently',
      'To remove the product owner from the process'
    ),
    correct: ['b'],
    explanation: 'Refinement continuously clarifies, splits, estimates, and orders upcoming backlog items so they are "ready," making iteration planning efficient and predictable.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL inputs that should inform re-planning in an agile project.',
    options: opts4(
      'Actual velocity / throughput trends',
      'New stakeholder feedback and changed priorities',
      'A one-time plan that must never change',
      'Newly discovered risks or impediments'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Adaptive planning continuously incorporates empirical data (velocity), changing priorities/feedback, and emerging risks. A plan that must never change contradicts adaptive planning.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In agile, the plan is treated as a living artifact updated as the team learns, not a fixed contract.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Agile planning is continuous; the plan is refined as empirical data and feedback arrive, embodying "responding to change over following a plan."',
    references: [REF_MANIFESTO, REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Relative estimation (e.g., story points) is preferred over absolute hours mainly because:',
    options: opts4(
      'It is always perfectly accurate',
      'Humans compare sizes more reliably than they predict absolute durations, and it decouples estimates from individuals',
      'It removes the need for any planning',
      'It guarantees fixed delivery dates'
    ),
    correct: ['b'],
    explanation: 'People are better at relative sizing than absolute time prediction. Points decouple estimates from a specific person and feed empirical velocity-based forecasting.',
    references: [REF_AA_GLOSSARY, REF_VELOCITY]
  },
  {
    domain: PLAN, difficulty: 4, type: QType.SINGLE,
    stem: 'Scope, schedule, and cost are pressured simultaneously. Which agile "iron triangle" inversion is typically applied?',
    options: opts4(
      'Fix scope; let time and cost float',
      'Fix time and cost (and team); let scope flex, delivering the highest-value subset',
      'Fix all three rigidly',
      'Remove quality to fit everything in'
    ),
    correct: ['b'],
    explanation: 'Agile typically fixes time, cost, and team while flexing scope — delivering the highest-value subset within the timebox rather than sacrificing quality or fixing all constraints.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'A release plan was built on optimistic velocity. After three sprints actual velocity is 30% lower. Best adaptive-planning action?',
    options: opts4(
      'Hide the variance and hope it recovers',
      'Re-forecast using actual velocity and collaborate with the product owner to re-scope or re-time the release',
      'Mandate overtime indefinitely',
      'Ignore velocity and keep the original plan'
    ),
    correct: ['b'],
    explanation: 'Adaptive planning uses empirical velocity to re-forecast transparently and collaborate on scope/time trade-offs — not concealment, indefinite overtime, or ignoring data.',
    references: [REF_VELOCITY, REF_AGILE_GUIDE]
  },

  // ── Problem Detection and Resolution (7) ──
  {
    domain: PROBLEM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why do agile teams aim to make problems visible quickly (e.g., via boards and frequent integration)?',
    options: opts4(
      'To assign blame faster',
      'Because early detection lowers the cost and risk of resolving problems',
      'To avoid talking about problems',
      'To slow the team down deliberately'
    ),
    correct: ['b'],
    explanation: 'Surfacing problems early — through visualization and short feedback loops — reduces the cost and risk of fixing them compared with discovering them late.',
    references: [REF_AGILE_GUIDE, REF_CI]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'A recurring defect keeps reappearing after being "fixed." Which technique best targets the underlying cause?',
    options: opts4(
      'Add more manual hot-fixes each time',
      'Perform root cause analysis (e.g., Five Whys) and address the systemic cause',
      'Stop logging the defect',
      'Reassign the bug to a different person each time'
    ),
    correct: ['b'],
    explanation: 'Root cause analysis such as the Five Whys looks past symptoms to the systemic cause, preventing recurrence rather than repeatedly patching symptoms.',
    references: [REF_RCA]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that belong in an effective impediment-management approach.',
    options: opts4(
      'Maintain a visible impediment list/board',
      'Resolve or escalate impediments promptly with owners and dates',
      'Hide impediments from stakeholders',
      'Track recurring impediments for systemic improvement'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Visible tracking, prompt ownership/escalation, and trend analysis of recurring impediments drive resolution and systemic improvement. Hiding impediments delays resolution.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PROBLEM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Treating defects and impediments as opportunities for systemic improvement reflects an agile problem-solving mindset.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Agile views problems as learning signals; addressing systemic causes (not just symptoms) improves the process and prevents recurrence.',
    references: [REF_RCA, REF_AGILE_GUIDE]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'Maintaining a risk/issue board where threats are made visible and re-assessed each iteration primarily supports:',
    options: opts4(
      'Concealing risk from the team',
      'Continuous, proactive risk management with shared ownership',
      'Eliminating the need to ever plan',
      'Removing the product owner role'
    ),
    correct: ['b'],
    explanation: 'A visible, regularly re-assessed risk board keeps risk management continuous and collectively owned, enabling early mitigation rather than late surprises.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PROBLEM, difficulty: 4, type: QType.SINGLE,
    stem: 'Integration repeatedly breaks because branches diverge for weeks. Which practice most directly detects and reduces this problem early?',
    options: opts4(
      'Longer-lived feature branches',
      'Continuous integration with frequent small merges and automated build/test',
      'Manual integration only at release',
      'Disabling the test suite to speed builds'
    ),
    correct: ['b'],
    explanation: 'Continuous integration with small frequent merges and automated tests surfaces integration problems within minutes instead of weeks, shrinking the cost of resolution.',
    references: [REF_CI]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'The team finds a problem mid-sprint that threatens the sprint goal. Best agile response?',
    options: opts4(
      'Hide it until the review',
      'Raise it immediately, collaborate on options, and adapt the plan with the product owner if needed',
      'Continue as if nothing happened',
      'Cancel agile and revert to waterfall'
    ),
    correct: ['b'],
    explanation: 'Transparency and inspect-and-adapt require raising the issue at once, exploring options, and re-planning collaboratively to protect the goal or adjust it consciously.',
    references: [REF_SCRUMGUIDE, REF_AGILE_GUIDE]
  },

  // ── Continuous Improvement (6) ──
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of a sprint retrospective?',
    options: opts4(
      'To demo the product to customers',
      'For the team to inspect how it works and identify concrete improvements for the next iteration',
      'To estimate the next backlog',
      'To evaluate individuals for performance reviews'
    ),
    correct: ['b'],
    explanation: 'The retrospective is the team\'s regular inspect-and-adapt of its process, producing actionable improvements — not a demo, estimation session, or individual evaluation.',
    references: [REF_RETRO, REF_SCRUMGUIDE]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Retrospectives generate many ideas but nothing changes. What is the most effective fix?',
    options: opts4(
      'Stop holding retrospectives',
      'Select a small number of high-impact actions, assign owners, and track them to completion',
      'Generate even more ideas next time',
      'Make the meeting longer only'
    ),
    correct: ['b'],
    explanation: 'Improvement requires follow-through: pick a few high-impact actions, give them owners, and verify completion in the next cycle — quality of action over quantity of ideas.',
    references: [REF_RETRO, REF_AGILE_GUIDE]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that support continuous improvement of the product and process.',
    options: opts4(
      'Regular retrospectives with tracked action items',
      'Inspecting empirical data (velocity, defects, cycle time) to guide changes',
      'Never changing the process once defined',
      'Small experiments (e.g., process changes) evaluated for effect'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Retrospectives with follow-through, data-informed change, and small evaluated experiments form the kaizen loop. A frozen process contradicts continuous improvement.',
    references: [REF_RETRO, REF_LEAN]
  },
  {
    domain: IMPROVE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: "At regular intervals, the team reflects on how to become more effective, then tunes and adjusts its behavior accordingly" is one of the twelve agile principles.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. This is the twelfth agile principle and the foundation of the retrospective and continuous-improvement practice.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best embodies Lean "kaizen" within an agile team?',
    options: opts4(
      'One large annual reorganization',
      'Frequent small, incremental improvements driven by the people doing the work',
      'Improvement only when mandated by executives',
      'Avoiding any change to reduce risk'
    ),
    correct: ['b'],
    explanation: 'Kaizen means continuous small improvements owned by the people doing the work, accumulating into large gains — the opposite of rare, top-down big-bang change.',
    references: [REF_LEAN]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team wants to know whether a process change actually helped. What is the most rigorous lightweight approach?',
    options: opts4(
      'Assume it helped because it felt better',
      'Define a measurable hypothesis, run the change as a time-boxed experiment, and compare before/after metrics',
      'Roll it out permanently with no measurement',
      'Ask only the most senior person\'s opinion'
    ),
    correct: ['b'],
    explanation: 'Treating a process change as a hypothesis with a time-boxed trial and before/after metrics gives evidence of impact, supporting disciplined continuous improvement.',
    references: [REF_RETRO, REF_LEAN]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Agile Principles and Mindset (10) ──
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which pairing correctly states an Agile Manifesto value preference?',
    options: opts4(
      'Following a plan over responding to change',
      'Customer collaboration over contract negotiation',
      'Processes and tools over individuals and interactions',
      'Comprehensive documentation over working software'
    ),
    correct: ['b'],
    explanation: 'Customer collaboration over contract negotiation is one of the four Manifesto value statements; the other options reverse the intended preference.',
    references: [REF_MANIFESTO]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'A team adopts Scrum events but ignores the underlying values, so transparency is low. This is best described as:',
    options: opts4(
      'A fully mature agile team',
      'Mechanical "process compliance" without an agile mindset (cargo-cult agile)',
      'The intended outcome of Scrum',
      'A reason to abandon agile entirely'
    ),
    correct: ['b'],
    explanation: 'Performing ceremonies without the values (transparency, inspection, adaptation) is cargo-cult / mechanical agile; the mindset, not just the mechanics, delivers the benefits.',
    references: [REF_AGILE_GUIDE, REF_SCRUMGUIDE]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which agile principle directly states that working software is the primary measure of progress?',
    options: opts4(
      '"Working software is the primary measure of progress."',
      '"Welcome changing requirements, even late in development."',
      '"Business people and developers must work together daily."',
      '"Continuous attention to technical excellence enhances agility."'
    ),
    correct: ['a'],
    explanation: 'One of the twelve principles states explicitly that working software is the primary measure of progress, shifting focus from documents/phases to delivered value.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best example of "continuous attention to technical excellence and good design enhances agility"?',
    options: opts4(
      'Skipping refactoring to ship faster every sprint',
      'Maintaining tests, refactoring, and managing technical debt so future change stays cheap',
      'Adding undocumented shortcuts to meet dates',
      'Freezing the architecture and never revisiting it'
    ),
    correct: ['b'],
    explanation: 'Sustained technical excellence — testing, refactoring, debt management — keeps the cost of change low, which is exactly what preserves agility over time.',
    references: [REF_PRINCIPLES, REF_XP]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL behaviors consistent with an agile, empirical mindset.',
    options: opts4(
      'Inspecting outcomes frequently and adapting',
      'Making work and progress transparent',
      'Committing to a fixed multi-year detailed plan with no revision',
      'Running small experiments to reduce uncertainty'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Empiricism rests on transparency, inspection, and adaptation, plus experimentation under uncertainty. A fixed multi-year non-revisable plan contradicts empirical control.',
    references: [REF_SCRUMGUIDE, REF_AGILE_GUIDE]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: "Simplicity—the art of maximizing the amount of work not done—is essential" is one of the twelve agile principles.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. This principle promotes doing only what is needed to deliver value, avoiding gold-plating and unnecessary work.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'A leader wants to "scale agile" by adding heavy stage gates and sign-offs to every team. The best coaching observation is:',
    options: opts4(
      'Adding gates always increases agility',
      'Heavy gates can reintroduce the delays and batching agile aims to remove; scale by preserving flow and feedback',
      'Agile cannot be scaled at all',
      'Teams should never coordinate'
    ),
    correct: ['b'],
    explanation: 'Scaling should preserve fast flow and feedback. Heavy stage gates reintroduce batching and delay, undermining the very benefits agile provides.',
    references: [REF_AGILE_GUIDE, REF_LEAN]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'In the Kanban method, "make policies explicit" primarily helps because:',
    options: opts4(
      'It hides how work is actually done',
      'Shared, visible rules enable consistent decisions and meaningful improvement discussions',
      'It forces fixed-length iterations',
      'It removes the need to limit WIP'
    ),
    correct: ['b'],
    explanation: 'Explicit policies make the rules of the system visible and shared so the team can apply them consistently and reason about improving them.',
    references: [REF_KANBAN]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best reflects the agile attitude toward failure during disciplined experimentation?',
    options: opts4(
      'Failure must always be punished',
      'Fast, safe-to-fail experiments produce learning that improves future decisions',
      'Experiments should never be tried',
      'Only successes provide any information'
    ),
    correct: ['b'],
    explanation: 'Agile/Lean treat small safe-to-fail experiments as a primary source of validated learning; the learning, not just success, drives improvement.',
    references: [REF_LEAN, REF_AGILE_GUIDE]
  },
  {
    domain: MINDSET, difficulty: 4, type: QType.SINGLE,
    stem: 'A distributed team is told face-to-face conversation is "impossible," so all communication moves to ticket comments. What is the most agile-aligned interpretation of the relevant principle?',
    options: opts4(
      'The principle forbids any tools',
      'The principle favors the most effective, rich communication available — approximate face-to-face with video/synchronous channels, not only async tickets',
      'Tickets are always the richest channel',
      'Communication richness does not matter'
    ),
    correct: ['b'],
    explanation: 'The principle prefers the most efficient and effective communication (ideally face-to-face). Distributed teams approximate it with rich synchronous tools rather than relying solely on async text.',
    references: [REF_PRINCIPLES, REF_AGILE_GUIDE]
  },

  // ── Value-Driven Delivery (13) ──
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which sequence best reflects value-driven delivery for a new product?',
    options: opts4(
      'Deliver all "nice to have" features first',
      'Deliver the highest-value, riskiest-assumption items early to learn and return value sooner',
      'Deliver in the order tickets were filed',
      'Deliver only after 100% of scope is built'
    ),
    correct: ['b'],
    explanation: 'Sequencing the highest-value and riskiest-assumption work first returns value sooner and retires uncertainty early — the essence of value-driven delivery.',
    references: [REF_ACP, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A story is large and uncertain. Which approach best protects value delivery?',
    options: opts4(
      'Keep it as one big story and start coding everything',
      'Split it into thin vertical slices that each deliver testable value',
      'Defer it to the last sprint',
      'Estimate it in hours and lock the date'
    ),
    correct: ['b'],
    explanation: 'Vertical slicing turns a large risky item into small end-to-end increments that each deliver and validate value, reducing batch size and risk.',
    references: [REF_STORY, REF_INVEST]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The "INVEST" heuristic for good user stories means a story should be Independent, Negotiable, Valuable, Estimable, Small, and:',
    options: opts4(
      'Technical',
      'Testable',
      'Tracked',
      'Templated'
    ),
    correct: ['b'],
    explanation: 'INVEST = Independent, Negotiable, Valuable, Estimable, Small, Testable. Testability ensures the story has clear acceptance criteria and can be verified as done.',
    references: [REF_INVEST]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does delivering smaller batches generally increase realized value and reduce risk?',
    options: opts4(
      'Smaller batches are always cheaper to build per item',
      'They shorten feedback cycles, surface defects sooner, and let value be used earlier',
      'They eliminate the need for testing',
      'They guarantee zero defects'
    ),
    correct: ['b'],
    explanation: 'Small batches shorten feedback loops, expose problems earlier, and let value be realized sooner — improving economics and lowering delivery risk.',
    references: [REF_LEAN, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are valid agile prioritization aids.',
    options: opts4(
      'MoSCoW (Must/Should/Could/Won\'t)',
      'Weighted shortest job first (WSJF) using cost of delay',
      'Random selection each sprint',
      'Kano model to classify features by customer satisfaction impact'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'MoSCoW, WSJF (cost of delay / job size), and the Kano model are recognized prioritization aids. Random selection ignores value entirely.',
    references: [REF_ACP, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: A clear, shared Definition of Done helps prevent hidden, undone work that erodes real value.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The Definition of Done sets a transparent quality bar so "done" means truly releasable, preventing accumulation of hidden incomplete work.',
    references: [REF_DOD]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A feature is technically complete but the customer never uses it. From a value perspective this is best described as:',
    options: opts4(
      'A success because code was written',
      'Waste — effort spent that produced no customer/business value',
      'A required investment',
      'Irrelevant to value-driven delivery'
    ),
    correct: ['b'],
    explanation: 'Output without outcome is waste. Value-driven delivery measures realized value, so an unused completed feature represents wasted effort and an opportunity to validate sooner.',
    references: [REF_LEAN, REF_ACP]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Using WSJF, Job A has cost of delay 20 and size 4; Job B has cost of delay 15 and size 15. Which should be done first?',
    options: opts4(
      'Job B, because its cost of delay is lower',
      'Job A, because WSJF (CoD / size) is higher (5 vs 1)',
      'They are equal',
      'Neither — WSJF cannot compare them'
    ),
    correct: ['b'],
    explanation: 'WSJF = cost of delay / job size. A = 20/4 = 5; B = 15/15 = 1. The higher WSJF (Job A) is sequenced first to maximize value delivered per unit time.',
    references: [REF_ACP]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Acceptance criteria on a user story primarily exist to:',
    options: opts4(
      'Pad documentation',
      'Define, in testable terms, what "done and valuable" means for that story',
      'Replace the product backlog',
      'Assign the story to a developer'
    ),
    correct: ['b'],
    explanation: 'Acceptance criteria express the conditions of satisfaction in testable terms, ensuring shared understanding of when the story delivers its intended value.',
    references: [REF_STORY, REF_DOD]
  },
  {
    domain: VALUE, difficulty: 4, type: QType.SINGLE,
    stem: 'A high-value feature depends on an unproven third-party integration. Which sequencing best manages value and risk?',
    options: opts4(
      'Build all easy features first and the integration last',
      'Prototype/spike the risky integration early to validate feasibility before committing the full feature',
      'Ignore the risk until release',
      'Cancel the feature without investigation'
    ),
    correct: ['b'],
    explanation: 'A small early spike validates the risky assumption cheaply, so the team learns feasibility before investing in the full high-value feature — risk-adjusted value sequencing.',
    references: [REF_ACP, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes "potentially shippable increment"?',
    options: opts4(
      'Code that compiles but is untested',
      'An integrated, tested increment that meets the Definition of Done and could be released if the business chooses',
      'A design document',
      'A backlog of ideas'
    ),
    correct: ['b'],
    explanation: 'A potentially shippable increment is integrated, tested, and meets the Definition of Done — release is a business decision, but technically it could ship.',
    references: [REF_SCRUMGUIDE, REF_DOD]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Frequent releasing of small increments primarily benefits value delivery by:',
    options: opts4(
      'Increasing the size of each release',
      'Shortening the time between investment and realized value and feedback',
      'Removing the need for a backlog',
      'Eliminating stakeholders'
    ),
    correct: ['b'],
    explanation: 'Frequent small releases shorten the cycle from building to receiving value and feedback, improving ROI timing and learning.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A product owner keeps adding low-value "pet" features ahead of high-value ones. The agile practitioner should:',
    options: opts4(
      'Override the product owner and reorder secretly',
      'Make value/cost trade-offs transparent with data and coach value-based prioritization, keeping the PO accountable',
      'Refuse to deliver anything',
      'Escalate to remove the product owner immediately'
    ),
    correct: ['b'],
    explanation: 'The practitioner influences through transparent value/cost data and coaching while respecting the PO\'s accountability for ordering — not covert reordering or refusing work.',
    references: [REF_AGILE_GUIDE, REF_ACP]
  },

  // ── Stakeholder Engagement (11) ──
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Stakeholder engagement in agile is best achieved through:',
    options: opts4(
      'A single requirements sign-off at the start',
      'Continuous collaboration: frequent demos, feedback, and shared visibility',
      'Communicating only at project end',
      'Avoiding stakeholder contact to protect the team'
    ),
    correct: ['b'],
    explanation: 'Agile relies on ongoing collaboration — frequent demos, feedback loops, and transparency — rather than a one-time sign-off or end-of-project communication.',
    references: [REF_AGILE_GUIDE, REF_PRINCIPLES]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder requests a feature directly from a developer mid-sprint, bypassing the product owner. Best response?',
    options: opts4(
      'Implement it immediately and skip the backlog',
      'Welcome the input but route it through the product owner/backlog so priorities stay coherent and transparent',
      'Ignore the stakeholder permanently',
      'Start the feature and tell no one'
    ),
    correct: ['b'],
    explanation: 'Channeling requests through the product owner/backlog preserves a single, transparent priority order while still valuing the stakeholder\'s input.',
    references: [REF_SCRUMGUIDE, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is a key benefit of a shared product roadmap with stakeholders?',
    options: opts4(
      'It fixes scope and dates permanently',
      'It aligns expectations on direction and priorities while remaining adaptable',
      'It removes the need for a backlog',
      'It hides strategy from the team'
    ),
    correct: ['b'],
    explanation: 'A roadmap communicates direction and priorities to align expectations, while staying adaptive as learning occurs — not a fixed contract.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL approaches that build stakeholder trust in an agile context.',
    options: opts4(
      'Consistently delivering working increments',
      'Being transparent about risks and progress',
      'Promising unrealistic dates to satisfy them',
      'Honoring commitments or renegotiating openly when needed'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Trust grows from reliable delivery, transparency, and honest commitment management. Promising unrealistic dates destroys trust when reality diverges.',
    references: [REF_AGILE_GUIDE, REF_PMI_ETHICS]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A customer proxy is unavailable for most of the iteration, slowing decisions. Best agile-aligned action?',
    options: opts4(
      'Make all product decisions yourself without them',
      'Negotiate clear availability/decision SLAs or a delegated decision-maker so feedback stays timely',
      'Stop the project until they are free',
      'Guess at requirements and never confirm'
    ),
    correct: ['b'],
    explanation: 'Establishing availability expectations or a delegated decision-maker keeps decisions timely and feedback flowing without bypassing the customer voice.',
    references: [REF_AGILE_GUIDE, REF_ACP]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Tailoring communication frequency and format to different stakeholder needs improves engagement.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Different stakeholders need different cadence, depth, and channels; tailoring communication increases relevance and engagement.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'During a demo, conflicting feedback comes from two stakeholders. The most agile-aligned facilitation is to:',
    options: opts4(
      'Pick the louder person\'s view',
      'Surface the conflict, capture both perspectives, and facilitate a value-based decision with the product owner',
      'End the demo immediately',
      'Implement both without discussion'
    ),
    correct: ['b'],
    explanation: 'Making the conflict explicit and facilitating a value-based resolution via the product owner preserves a coherent direction and stakeholder trust.',
    references: [REF_AGILE_GUIDE, REF_SCRUMGUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is involving stakeholders in story workshops valuable?',
    options: opts4(
      'It removes the need for acceptance criteria',
      'Shared conversation builds common understanding and surfaces real needs and constraints early',
      'It transfers all decisions to developers',
      'It eliminates the product owner role'
    ),
    correct: ['b'],
    explanation: 'Collaborative story workshops create shared understanding and surface needs, assumptions, and constraints early, improving the value and clarity of the backlog.',
    references: [REF_STORY, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the best example of managing expectations about uncertainty?',
    options: opts4(
      'Communicating a single fixed date with no caveats',
      'Sharing forecasts as ranges with confidence and explaining assumptions',
      'Refusing to forecast at all',
      'Only reporting good news'
    ),
    correct: ['b'],
    explanation: 'Range-based forecasts with stated assumptions and confidence honestly convey uncertainty, helping stakeholders plan and trust the information.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 4, type: QType.SINGLE,
    stem: 'A powerful stakeholder repeatedly pressures the team to skip quality practices. Under PMI ethics and agile values, the practitioner should:',
    options: opts4(
      'Comply silently to avoid conflict',
      'Respectfully explain the risk/quality trade-off, document it, and escalate transparently if pressure continues',
      'Lie that quality is fine',
      'Quietly lower the Definition of Done'
    ),
    correct: ['b'],
    explanation: 'PMI\'s code requires honesty and responsibility. The practitioner transparently explains trade-offs, documents the decision, and escalates appropriately rather than silently compromising quality.',
    references: [REF_PMI_ETHICS, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder asks "what will we get and when?" early in a high-uncertainty product. The most honest agile answer is:',
    options: opts4(
      'A precise scope and date guaranteed now',
      'A prioritized direction with the next increment committed and later scope expressed as adaptable forecasts',
      '"We cannot tell you anything"',
      'A fixed plan that will not change'
    ),
    correct: ['b'],
    explanation: 'Agile commits concretely to the near-term increment while expressing later scope/timing as adaptable forecasts — honest about both direction and uncertainty.',
    references: [REF_AGILE_GUIDE, REF_ACP]
  },

  // ── Team Performance (10) ──
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a hallmark of a cross-functional agile team?',
    options: opts4(
      'It depends on many external teams to complete any increment',
      'It has the skills needed to deliver a usable increment without external handoffs',
      'It is composed only of testers',
      'It cannot make any decisions'
    ),
    correct: ['b'],
    explanation: 'A cross-functional team contains the mix of skills required to take work from idea to done increment without relying on external handoffs.',
    references: [REF_SCRUMGUIDE, REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A team consistently over-commits and misses sprint goals, harming morale. Best coaching response?',
    options: opts4(
      'Punish the team for missing goals',
      'Use empirical capacity/velocity to set realistic forecasts and protect a sustainable pace',
      'Increase the commitment further',
      'Stop tracking outcomes'
    ),
    correct: ['b'],
    explanation: 'Empirical, capacity-based forecasting and sustainable pace restore predictability and morale; punishment or larger commitments worsen the pattern.',
    references: [REF_VELOCITY, REF_PRINCIPLES]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Psychological safety on a team primarily means:',
    options: opts4(
      'No one is ever held accountable',
      'Members feel safe to raise issues, admit mistakes, and ask questions without fear of humiliation',
      'There is never any disagreement',
      'Only managers may speak'
    ),
    correct: ['b'],
    explanation: 'Psychological safety is the shared belief that the team is safe for interpersonal risk-taking — surfacing problems and ideas without fear, which improves performance.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that typically improve flow and team throughput.',
    options: opts4(
      'Limiting work in progress',
      'Swarming on the highest-priority item to finish it',
      'Starting many items in parallel per person',
      'Reducing handoffs and wait states'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'WIP limits, swarming to finish work, and removing handoffs/wait states improve flow. Starting many items per person increases WIP and lengthens cycle time.',
    references: [REF_WIP, REF_KANBAN]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Servant leadership focuses on serving the team\'s growth and removing obstacles rather than command-and-control.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Servant leadership prioritizes enabling the team — growth, support, and obstacle removal — over directive command-and-control management.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A remote team struggles with collaboration and isolation. Which intervention is most aligned with agile team performance?',
    options: opts4(
      'Mandate that everyone work fully independently',
      'Establish rich synchronous collaboration norms, visible boards, and regular human connection',
      'Replace all meetings with long email threads',
      'Stop holding retrospectives'
    ),
    correct: ['b'],
    explanation: 'Rich synchronous collaboration, shared visibility, and intentional connection counter isolation and approximate the benefits of co-location for distributed teams.',
    references: [REF_AGILE_GUIDE, REF_PRINCIPLES]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is collective ownership (e.g., shared code ownership in XP) beneficial?',
    options: opts4(
      'It removes accountability entirely',
      'It reduces single points of failure and lets anyone improve any part, increasing resilience and flow',
      'It slows everyone down permanently',
      'It forbids pair programming'
    ),
    correct: ['b'],
    explanation: 'Collective ownership spreads knowledge, removes bottlenecks tied to individuals, and lets the team improve any area — boosting resilience and flow.',
    references: [REF_XP]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE,
    stem: 'A team\'s definition of a "done" task includes peer review and tests. A member skips both to "go faster." This most directly harms:',
    options: opts4(
      'Nothing; speed is all that matters',
      'Quality and trust in "done," creating hidden risk and rework',
      'Only that member\'s metrics',
      'The product backlog ordering'
    ),
    correct: ['b'],
    explanation: 'Bypassing agreed quality steps undermines the shared meaning of "done," injects hidden defects, and erodes team trust — typically causing more rework, not speed.',
    references: [REF_DOD, REF_XP]
  },
  {
    domain: TEAM, difficulty: 4, type: QType.SINGLE,
    stem: 'Management wants individual KPIs based on story points per developer. The agile-aligned concern is:',
    options: opts4(
      'It will perfectly measure productivity',
      'It can drive estimate inflation, local optimization, and reduced collaboration, harming team outcomes',
      'It is required by the Scrum Guide',
      'It improves psychological safety'
    ),
    correct: ['b'],
    explanation: 'Individual point KPIs incentivize gaming (inflated estimates), local optimization, and reduced collaboration — undermining team-level value delivery.',
    references: [REF_VELOCITY, REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'Pair programming is sometimes resisted as "two people doing one job." The best agile-aligned rebuttal is:',
    options: opts4(
      'It always doubles cost with no benefit',
      'It can improve quality, spread knowledge, and reduce defects/rework, often paying back the apparent cost',
      'It is forbidden in agile',
      'It removes the need for any testing'
    ),
    correct: ['b'],
    explanation: 'Evidence and XP practice indicate pairing can raise quality, share knowledge, and cut defects/rework, frequently offsetting the apparent doubling of effort.',
    references: [REF_XP]
  },

  // ── Adaptive Planning (8) ──
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which planning horizon is typically the MOST detailed in agile multi-level planning?',
    options: opts4(
      'The multi-year product vision',
      'The current iteration / sprint plan',
      'The five-year roadmap',
      'The portfolio strategy'
    ),
    correct: ['b'],
    explanation: 'Detail concentrates on the nearest horizon. The current iteration plan is the most detailed; longer horizons (release, roadmap, vision) stay progressively coarser.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'A team\'s velocity over four sprints is 18, 22, 20, 20. What is the most defensible planning assumption for the next sprint?',
    options: opts4(
      'Assume 40, to be ambitious',
      'Plan around the recent average (~20) and express the release forecast as a range',
      'Assume 0, to be safe',
      'Use the single highest value, 22, as a guarantee'
    ),
    correct: ['b'],
    explanation: 'Using the recent average (~20) as a planning anchor and forecasting with a range reflects empirical reality better than optimistic, zero, or best-case assumptions.',
    references: [REF_VELOCITY]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE,
    stem: 'Why are spikes used during adaptive planning?',
    options: opts4(
      'To deliver final production features',
      'Time-boxed research/experiments to reduce uncertainty so future estimates and plans improve',
      'To replace retrospectives',
      'To skip planning entirely'
    ),
    correct: ['b'],
    explanation: 'A spike is a time-boxed investigation that buys knowledge to reduce uncertainty, enabling better estimation and planning of the related work.',
    references: [REF_AA_GLOSSARY, REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are appropriate during iteration planning.',
    options: opts4(
      'Selecting backlog items the team is confident it can complete',
      'Defining an iteration goal',
      'Committing to scope the team has no capacity for',
      'Breaking selected items into tasks'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Iteration planning sets a goal, selects feasible items based on capacity, and decomposes them into tasks. Committing to infeasible scope is an anti-pattern.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A release burn-up or burn-down helps stakeholders see scope/progress trends and re-plan as reality changes.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Burn-up/burn-down charts visualize progress and scope trends over time, supporting transparent, data-informed re-planning.',
    references: [REF_BURNDOWN]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Mid-release, the customer adds a high-value epic. Which adaptive-planning response is most appropriate?',
    options: opts4(
      'Reject it because the plan is fixed',
      'Re-prioritize the backlog with the product owner and adjust scope/forecast transparently',
      'Add it silently and hide the impact',
      'Stop the release entirely'
    ),
    correct: ['b'],
    explanation: 'Adaptive planning welcomes valuable change: re-prioritize with the PO and transparently adjust scope or forecast, making trade-offs visible.',
    references: [REF_AGILE_GUIDE, REF_MANIFESTO]
  },
  {
    domain: PLAN, difficulty: 4, type: QType.SINGLE,
    stem: 'A program has three teams with interdependencies. Which adaptive-planning practice best manages cross-team alignment?',
    options: opts4(
      'Each team plans in isolation with no coordination',
      'A cadenced cross-team planning/sync to align dependencies and a shared roadmap, refined regularly',
      'A single fixed plan never revisited',
      'Removing all planning to reduce overhead'
    ),
    correct: ['b'],
    explanation: 'Cadenced cross-team planning and a shared, regularly refined roadmap align dependencies while preserving adaptability — scaling adaptive planning across teams.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is it risky to convert story points directly into a guaranteed fixed delivery date with no range?',
    options: opts4(
      'Points are always wrong',
      'Velocity varies and scope evolves, so a single-point date hides real uncertainty and sets false expectations',
      'Dates are forbidden in agile',
      'Points cannot be summed at all'
    ),
    correct: ['b'],
    explanation: 'Velocity fluctuates and scope changes; a single guaranteed date conceals uncertainty. Forecasts should be ranges with confidence to set honest expectations.',
    references: [REF_VELOCITY, REF_AGILE_GUIDE]
  },

  // ── Problem Detection and Resolution (7) ──
  {
    domain: PROBLEM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The daily stand-up is well suited to detect problems early because it:',
    options: opts4(
      'Is a formal status report to executives',
      'Gives the team a frequent, short checkpoint to surface impediments and re-plan toward the goal',
      'Replaces the retrospective',
      'Only happens once per release'
    ),
    correct: ['b'],
    explanation: 'The daily checkpoint provides a frequent, low-overhead opportunity to surface impediments and adapt the plan before small issues grow.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'A team keeps missing a quality target. Using a fishbone (Ishikawa) diagram primarily helps them:',
    options: opts4(
      'Assign individual blame quickly',
      'Systematically explore categories of potential causes to find root causes',
      'Skip root cause analysis',
      'Estimate story points'
    ),
    correct: ['b'],
    explanation: 'A fishbone diagram structures cause exploration across categories (people, process, tools, etc.), helping the team reason toward root causes rather than symptoms or blame.',
    references: [REF_RCA]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that help detect problems before they become expensive.',
    options: opts4(
      'Continuous integration with automated tests',
      'Frequent demos to real users',
      'Deferring all testing to a final phase',
      'Visualizing flow and aging work items'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'CI/automated tests, frequent user demos, and visualizing aging work all shorten detection time. Deferring testing to the end delays detection and inflates cost.',
    references: [REF_CI, REF_KANBAN]
  },
  {
    domain: PROBLEM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Addressing only the symptom of a recurring problem, without root cause analysis, tends to let it recur.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Symptom-only fixes leave the underlying cause intact, so the problem typically returns; root cause analysis targets recurrence.',
    references: [REF_RCA]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'An impediment is outside the team\'s authority to resolve. The agile practitioner should:',
    options: opts4(
      'Ignore it since the team cannot fix it',
      'Escalate it promptly to the right owner while keeping it visible and tracked',
      'Hide it from stakeholders',
      'Wait until the retrospective to mention it'
    ),
    correct: ['b'],
    explanation: 'Impediments beyond the team\'s control should be escalated promptly to an owner who can act, while remaining visible and tracked until resolved.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PROBLEM, difficulty: 4, type: QType.SINGLE,
    stem: 'Cycle time has been steadily increasing for several iterations. Which is the best first analytical step?',
    options: opts4(
      'Add more people immediately',
      'Investigate flow data (WIP, bottlenecks, aging items) to locate where work is delayed',
      'Stop measuring cycle time',
      'Increase WIP limits to "go faster"'
    ),
    correct: ['b'],
    explanation: 'Rising cycle time signals a flow problem; analyzing WIP, bottlenecks, and aging items locates the constraint before changing staffing or limits blindly.',
    references: [REF_KANBAN, REF_WIP]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'A serious risk is identified that could block the release. The most agile-aligned action is to:',
    options: opts4(
      'Note it privately and hope it does not occur',
      'Make it visible, assess impact/probability, and plan/execute mitigation early with the team and stakeholders',
      'Wait until it materializes to act',
      'Remove it from the risk list to reduce worry'
    ),
    correct: ['b'],
    explanation: 'Proactive, transparent risk management — visibility, assessment, and early mitigation with stakeholders — is the agile approach to release-threatening risks.',
    references: [REF_AGILE_GUIDE]
  },

  // ── Continuous Improvement (6) ──
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which best describes the inspect-and-adapt cycle behind continuous improvement?',
    options: opts4(
      'Plan once and never revisit',
      'Regularly inspect outcomes and process, then adapt to improve effectiveness',
      'Only inspect at the end of the project',
      'Adapt randomly without inspection'
    ),
    correct: ['b'],
    explanation: 'Continuous improvement relies on regular inspection of outcomes and process followed by deliberate adaptation — the empirical inspect-and-adapt loop.',
    references: [REF_SCRUMGUIDE, REF_RETRO]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which retrospective practice most improves the quality of improvement actions?',
    options: opts4(
      'Listing as many complaints as possible with no follow-up',
      'Identifying root causes and converting them into a few owned, time-bound experiments',
      'Only the facilitator decides actions',
      'Skipping action items to save time'
    ),
    correct: ['b'],
    explanation: 'Tracing issues to root causes and turning them into a few owned, time-bound experiments produces meaningful, verifiable improvement instead of recurring complaints.',
    references: [REF_RETRO, REF_RCA]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are valid sources of continuous-improvement insight.',
    options: opts4(
      'Retrospective discussions',
      'Metrics trends (cycle time, defect rates, velocity stability)',
      'Customer feedback from demos/usage',
      'Ignoring all feedback to avoid change'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Retrospectives, metric trends, and customer feedback all inform improvement. Ignoring feedback is the antithesis of continuous improvement.',
    references: [REF_RETRO, REF_AGILE_GUIDE]
  },
  {
    domain: IMPROVE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Continuous improvement applies to the product, the process, and the people/team, not just one of these.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Agile continuous improvement spans product (e.g., usability), process (e.g., flow), and people/team (e.g., skills, collaboration).',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team\'s retrospectives have become stale and low-energy. A good improvement is to:',
    options: opts4(
      'Cancel retrospectives permanently',
      'Vary the retrospective format/focus and ensure prior actions are reviewed for impact',
      'Make them mandatory two-hour lectures',
      'Let only the manager speak'
    ),
    correct: ['b'],
    explanation: 'Varying format/focus and closing the loop on prior actions re-engages the team and keeps the improvement cycle effective and credible.',
    references: [REF_RETRO]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'Which metric pattern would most strongly suggest a past process change actually improved delivery?',
    options: opts4(
      'No change in any metric, but the team feels better',
      'Sustained reduction in cycle time and defect rate after the change, holding scope/quality constant',
      'A one-day spike in velocity only',
      'More meetings scheduled'
    ),
    correct: ['b'],
    explanation: 'A sustained, post-change reduction in cycle time and defects (with scope/quality controlled) is strong evidence the change improved delivery, beyond sentiment or transient spikes.',
    references: [REF_RETRO, REF_LEAN]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Agile Principles and Mindset (10) ──
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Agile Manifesto consists of how many value statements and how many supporting principles?',
    options: opts4(
      '4 values and 12 principles',
      '12 values and 4 principles',
      '3 values and 9 principles',
      '4 values and 4 principles'
    ),
    correct: ['a'],
    explanation: 'The Agile Manifesto comprises 4 value statements and 12 supporting principles that elaborate the values.',
    references: [REF_MANIFESTO, REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best captures the agile attitude toward "responding to change"?',
    options: opts4(
      'Change is a failure of planning and should be prevented',
      'Change is expected; the process is designed to harness it for customer advantage',
      'Change is only acceptable before the project starts',
      'Change must be billed punitively to discourage it'
    ),
    correct: ['b'],
    explanation: 'Agile treats change as an expected, even desirable, source of competitive advantage and designs its short feedback loops to absorb it, rather than suppressing it.',
    references: [REF_MANIFESTO, REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is an example of "business people and developers must work together daily"?',
    options: opts4(
      'The product owner is available for questions and decisions throughout the iteration',
      'The business hands off a 200-page spec and leaves',
      'Developers never speak with the business',
      'Requirements are frozen at kickoff with no contact'
    ),
    correct: ['a'],
    explanation: 'Daily collaboration means ongoing access to business decision-makers (e.g., an available product owner), not a one-time handoff or no contact.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'A team treats "self-organizing" as "no leadership or accountability." The best correction is:',
    options: opts4(
      'They are correct; agile has no leadership',
      'Self-organization operates within goals, boundaries, and accountability set with leadership — autonomy with alignment',
      'Self-organization means each person ignores the team',
      'Leadership must control every task'
    ),
    correct: ['b'],
    explanation: 'Self-organizing teams have autonomy in HOW they work but operate inside clear goals, boundaries, and accountability — alignment plus autonomy, not anarchy.',
    references: [REF_AGILE_GUIDE, REF_SCRUMGUIDE]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are pillars of empirical process control used by Scrum.',
    options: opts4(
      'Transparency',
      'Inspection',
      'Concealment',
      'Adaptation'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Scrum\'s empiricism rests on three pillars: transparency, inspection, and adaptation. Concealment is the opposite of transparency.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Lean thinking\'s focus on eliminating waste is compatible with and reinforces agile values.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Lean\'s waste elimination and flow focus align closely with agile values such as simplicity, fast delivery, and continuous improvement.',
    references: [REF_LEAN, REF_AGILE_GUIDE]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best illustrates "the best architectures, requirements, and designs emerge from self-organizing teams"?',
    options: opts4(
      'A central architect dictates all designs with no team input',
      'The team collaboratively evolves architecture as it learns, within agreed constraints',
      'Architecture is fully fixed before any code',
      'No one is responsible for design'
    ),
    correct: ['b'],
    explanation: 'Emergent architecture means the team evolves design collaboratively as understanding grows, within constraints — not top-down dictation or big-design-up-front.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: MINDSET, difficulty: 3, type: QType.SINGLE,
    stem: 'An organization wants "agile" but keeps annual fixed scope-and-budget contracts with no change tolerance. The core tension is with which value?',
    options: opts4(
      'Working software over documentation',
      'Responding to change over following a plan, and customer collaboration over contract negotiation',
      'Individuals over processes only',
      'There is no tension'
    ),
    correct: ['b'],
    explanation: 'Rigid fixed-scope, change-intolerant contracts conflict with "responding to change" and "customer collaboration over contract negotiation," the heart of the tension.',
    references: [REF_MANIFESTO]
  },
  {
    domain: MINDSET, difficulty: 2, type: QType.SINGLE,
    stem: 'In Kanban, "manage flow" primarily means:',
    options: opts4(
      'Maximize how many items are started at once',
      'Optimize the smooth, fast movement of work through the system and reduce delays',
      'Ignore cycle time',
      'Assign all work to the fastest person'
    ),
    correct: ['b'],
    explanation: 'Managing flow focuses on smooth, predictable, fast movement of work and reducing delays/bottlenecks — not maximizing started work.',
    references: [REF_KANBAN]
  },
  {
    domain: MINDSET, difficulty: 4, type: QType.SINGLE,
    stem: 'A team proudly reports 100% utilization of every member at all times. From a Lean/agile flow perspective this is concerning because:',
    options: opts4(
      'High utilization always means high throughput',
      'Near-100% utilization typically increases queues and cycle time, harming flow and responsiveness',
      'Utilization has no relationship to flow',
      'It guarantees zero defects'
    ),
    correct: ['b'],
    explanation: 'Queuing theory shows resource utilization near 100% sharply increases wait times and cycle time; some slack is needed for healthy flow and responsiveness.',
    references: [REF_LEAN, REF_KANBAN]
  },

  // ── Value-Driven Delivery (13) ──
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does "deliver value early and often" primarily achieve?',
    options: opts4(
      'It delays all feedback to the end',
      'It returns benefit sooner and shortens feedback loops to validate assumptions',
      'It increases batch size',
      'It removes the need for prioritization'
    ),
    correct: ['b'],
    explanation: 'Early, frequent delivery returns value sooner and shortens feedback loops, validating assumptions before large investment — core to value-driven delivery.',
    references: [REF_PRINCIPLES, REF_ACP]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Using the Kano model, a feature that customers do not request but delights them when present is classified as:',
    options: opts4(
      'A must-be (basic) feature',
      'An attractive (exciter/delighter) feature',
      'A reverse feature',
      'An indifferent feature'
    ),
    correct: ['b'],
    explanation: 'In Kano, unexpected features that strongly increase satisfaction when present are "attractive"/exciters; basics cause dissatisfaction only when missing.',
    references: [REF_ACP, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A "vertical slice" of a feature means:',
    options: opts4(
      'Only the database layer is built first',
      'A thin end-to-end piece touching all layers that delivers usable, testable value',
      'Only the UI mockup with no logic',
      'A document describing the feature'
    ),
    correct: ['b'],
    explanation: 'A vertical slice cuts through all layers (UI to data) to deliver a small but complete, testable piece of value, unlike horizontal layer-only work.',
    references: [REF_STORY, REF_INVEST]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Two features: X returns value now and decays if delayed; Y\'s value is stable regardless of timing. With equal size, which should generally go first?',
    options: opts4(
      'Y, because its value is stable',
      'X, because delaying it loses accruing value (higher cost of delay)',
      'Whichever is alphabetically first',
      'It does not matter'
    ),
    correct: ['b'],
    explanation: 'X has a higher cost of delay (value erodes with time), so sequencing X first captures value that would otherwise be lost.',
    references: [REF_ACP]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that reduce the risk of building the wrong thing.',
    options: opts4(
      'Releasing an MVP to validate assumptions',
      'Frequent demos and usage feedback',
      'Building the entire scope before any feedback',
      'A/B testing or experiments on key assumptions'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'MVPs, frequent feedback, and experiments validate assumptions early, reducing the risk of building the wrong product. Full build before feedback maximizes that risk.',
    references: [REF_AA_GLOSSARY, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Technical debt left unmanaged tends to slow future delivery and erode the value the team can produce.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Unmanaged technical debt raises the cost of change over time, slowing delivery and reducing the value throughput of the team.',
    references: [REF_XP, REF_PRINCIPLES]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A backlog item has unclear value. The most value-driven response before building it is to:',
    options: opts4(
      'Build it anyway to be safe',
      'Clarify the expected outcome/benefit and acceptance criteria with the product owner, or de-prioritize it',
      'Estimate it in hours and schedule it',
      'Split the team to build it twice'
    ),
    correct: ['b'],
    explanation: 'Value-driven delivery avoids building unclear-value work; clarifying the intended outcome or de-prioritizing prevents waste.',
    references: [REF_STORY, REF_ACP]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is "release frequently" considered a risk-reduction practice, not just a delivery practice?',
    options: opts4(
      'It increases the blast radius of each release',
      'Smaller, frequent releases reduce per-release risk and surface issues while changes are small and fresh',
      'It removes the need for testing',
      'It guarantees no production incidents'
    ),
    correct: ['b'],
    explanation: 'Frequent small releases shrink the change set per deployment, making issues easier to detect, diagnose, and roll back — reducing risk.',
    references: [REF_CI, REF_AGILE_GUIDE]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the best indicator that a backlog is genuinely value-ordered?',
    options: opts4(
      'It is sorted by story ID',
      'The next items, if delivered, would yield the most value/risk reduction for the effort',
      'It is sorted by who requested each item',
      'It never changes'
    ),
    correct: ['b'],
    explanation: 'A value-ordered backlog is arranged so that delivering the top items maximizes value and risk reduction per effort — not by ID, requester, or immutability.',
    references: [REF_SCRUMGUIDE, REF_ACP]
  },
  {
    domain: VALUE, difficulty: 4, type: QType.SINGLE,
    stem: 'A stakeholder insists on a "big bang" launch of all features at once. The strongest value/risk argument for incremental release is:',
    options: opts4(
      'Incremental release is always cheaper to build',
      'Incremental release returns value earlier and isolates risk, while big-bang concentrates risk and delays all value',
      'Big-bang has no downsides',
      'Incremental release removes the need for a roadmap'
    ),
    correct: ['b'],
    explanation: 'Incremental release realizes value sooner and limits the risk exposure of any single change; big-bang launches delay all value and concentrate risk.',
    references: [REF_AGILE_GUIDE, REF_PRINCIPLES]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team finishes a feature that meets acceptance criteria but not the team\'s Definition of Done (no automated regression). It should be considered:',
    options: opts4(
      'Done and shippable',
      'Not done — value is not safely releasable until the Definition of Done is met',
      'Done for reporting but not for the customer',
      'Irrelevant to value'
    ),
    correct: ['b'],
    explanation: 'Meeting story-level acceptance criteria is necessary but not sufficient; until the Definition of Done is satisfied, the increment is not safely releasable value.',
    references: [REF_DOD]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the relationship between feedback speed and value risk?',
    options: opts4(
      'Faster feedback has no effect on risk',
      'Faster feedback generally reduces the risk and cost of delivering low-value or wrong work',
      'Slower feedback reduces risk',
      'Feedback should be avoided to save time'
    ),
    correct: ['b'],
    explanation: 'Shorter feedback loops catch wrong-value or defective work sooner, when it is cheaper to correct — directly reducing value risk.',
    references: [REF_AGILE_GUIDE, REF_CI]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A product owner wants to maximize ROI. Which backlog behavior best supports that goal?',
    options: opts4(
      'Implement every requested item regardless of value',
      'Continuously re-order to deliver highest value/risk-reduction first and drop low-value items',
      'Freeze the backlog at project start',
      'Sequence work by team member preference'
    ),
    correct: ['b'],
    explanation: 'Maximizing ROI means continuously sequencing the highest value/risk-reduction work first and dropping low-value items, not building everything or freezing scope.',
    references: [REF_ACP, REF_SCRUMGUIDE]
  },

  // ── Stakeholder Engagement (11) ──
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Who is typically accountable for ordering the product backlog and representing stakeholder value?',
    options: opts4(
      'The whole development team by vote only',
      'The product owner',
      'The scrum master/agile coach',
      'An external PMO'
    ),
    correct: ['b'],
    explanation: 'The product owner is accountable for maximizing product value and ordering the backlog, acting as the focal point for stakeholder value.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder group feels "out of the loop." The most effective agile remedy is to:',
    options: opts4(
      'Send a single end-of-project report',
      'Establish a regular feedback cadence and visible information radiators tailored to their needs',
      'Restrict information to managers only',
      'Stop demos to avoid scrutiny'
    ),
    correct: ['b'],
    explanation: 'A regular, tailored feedback cadence plus visible information radiators keeps stakeholders informed and engaged, restoring trust and alignment.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why is early and continuous stakeholder feedback emphasized in agile?',
    options: opts4(
      'To delay decisions as long as possible',
      'Because acting on feedback early is far cheaper than discovering misalignment late',
      'To reduce transparency',
      'To avoid building anything'
    ),
    correct: ['b'],
    explanation: 'Early feedback lets the team correct course while change is cheap; late discovery of misalignment is far more costly to fix.',
    references: [REF_PRINCIPLES, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are good practices for engaging diverse stakeholders.',
    options: opts4(
      'Identify stakeholders and their interests/influence',
      'Tailor communication channel and cadence to each group',
      'Communicate only positive news',
      'Invite relevant stakeholders to reviews/demos'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Identifying stakeholders, tailoring communication, and inviting them to reviews build engagement. Communicating only good news destroys trust and hides risk.',
    references: [REF_AGILE_GUIDE, REF_PMI_ETHICS]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder asks for a feature that conflicts with a regulatory constraint the team knows about. The practitioner should:',
    options: opts4(
      'Silently build it as requested',
      'Transparently raise the conflict, explain the constraint, and collaborate on a compliant alternative',
      'Refuse and end the conversation',
      'Escalate to remove the stakeholder'
    ),
    correct: ['b'],
    explanation: 'Honest, transparent surfacing of the conflict and collaborating toward a compliant alternative aligns with PMI ethics and agile collaboration.',
    references: [REF_PMI_ETHICS, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Agile reviews/demos are a two-way collaboration, not a one-way presentation.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Reviews are working sessions for inspecting the increment and gathering feedback collaboratively, not a one-way status presentation.',
    references: [REF_SCRUMGUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the main risk of engaging only a single proxy stakeholder and never real users?',
    options: opts4(
      'There is no risk',
      'The proxy\'s assumptions may diverge from real user needs, leading to validated-on-paper but wrong product',
      'It guarantees correct requirements',
      'It removes the need for demos'
    ),
    correct: ['b'],
    explanation: 'A proxy can misrepresent real user needs; without contact with actual users, the team risks confidently building the wrong thing.',
    references: [REF_PERSONA, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder repeatedly changes priorities every few days, causing thrash. The best agile-aligned response is to:',
    options: opts4(
      'Ignore all priority input from them',
      'Agree on a stable planning boundary (e.g., per iteration) within which priorities hold, while still welcoming change at the boundary',
      'Freeze the backlog forever',
      'Switch priorities continuously to please them'
    ),
    correct: ['b'],
    explanation: 'A stable iteration boundary protects focus while still welcoming reprioritization at the boundary — balancing responsiveness with sustainable delivery.',
    references: [REF_SCRUMGUIDE, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact most helps align a broad stakeholder audience on product direction over time?',
    options: opts4(
      'A detailed Gantt chart of every task',
      'A living product roadmap communicating themes/goals by horizon',
      'A list of individual developer tasks',
      'The sprint task board only'
    ),
    correct: ['b'],
    explanation: 'A living roadmap communicates direction and goals by time horizon to a broad audience, aligning expectations while remaining adaptable.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 4, type: QType.SINGLE,
    stem: 'A sponsor demands the team commit publicly to a fixed scope and date for a high-uncertainty initiative. The most ethical, agile-aligned response is to:',
    options: opts4(
      'Commit publicly to avoid conflict, even if not credible',
      'Explain the uncertainty honestly, offer a committed near-term increment plus a forecast range, and propose checkpoints',
      'Refuse to communicate any dates',
      'Privately plan to blame the team later'
    ),
    correct: ['b'],
    explanation: 'Honesty (PMI ethics) plus agile forecasting: commit to the near-term, forecast the rest as a range, and use checkpoints — rather than a non-credible public promise.',
    references: [REF_PMI_ETHICS, REF_AGILE_GUIDE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes effective facilitation of a multi-stakeholder prioritization session?',
    options: opts4(
      'Let the highest-ranking person decide everything unilaterally',
      'Use structured techniques to surface value, cost, and risk so the product owner can make an informed ordering decision',
      'Avoid discussing trade-offs',
      'Prioritize by who speaks the most'
    ),
    correct: ['b'],
    explanation: 'Good facilitation surfaces value, cost, and risk transparently so the accountable product owner can make an informed prioritization decision — not rank or volume based.',
    references: [REF_AGILE_GUIDE, REF_ACP]
  },

  // ── Team Performance (10) ──
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Tuckman stage is characterized by the team working effectively with high trust and minimal friction?',
    options: opts4(
      'Forming',
      'Storming',
      'Performing',
      'Adjourning'
    ),
    correct: ['c'],
    explanation: 'In the "performing" stage the team operates with high trust, shared norms, and effective collaboration toward goals.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A new team has unclear roles and frequent rework. Which intervention most directly improves performance?',
    options: opts4(
      'Add more members immediately',
      'Co-create a Definition of Done, working agreements, and a shared goal to align the team',
      'Assign all work to one expert',
      'Remove the retrospective'
    ),
    correct: ['b'],
    explanation: 'Shared goal, working agreements, and a Definition of Done create the clarity and alignment that reduce rework and improve a forming team\'s performance.',
    references: [REF_DOD, REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the most agile-aligned view of team motivation (per the principle on motivated individuals)?',
    options: opts4(
      'Motivate purely through detailed control and surveillance',
      'Build projects around motivated people and give them environment, support, and trust to do the job',
      'Motivation is irrelevant to delivery',
      'Only financial incentives matter'
    ),
    correct: ['b'],
    explanation: 'The principle says to build projects around motivated individuals and give them the environment, support, and trust they need — intrinsic motivation over control.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL signs of a healthy self-organizing team.',
    options: opts4(
      'Members pull work and collaborate without waiting for task assignment',
      'The team raises and resolves impediments proactively',
      'Decisions require sign-off from outside the team for everything',
      'The team adapts its process via retrospectives'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Pulling work, proactive impediment handling, and self-adapting the process are hallmarks of self-organization. Requiring external sign-off for everything is the opposite.',
    references: [REF_SCRUMGUIDE, REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Frequent disruptive context switching across many simultaneous tasks generally reduces a team\'s effective throughput.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Excessive context switching adds overhead and increases WIP, lowering effective throughput and increasing cycle time.',
    references: [REF_WIP, REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'A coach wants to grow team capability and reduce key-person risk. Which practice helps most?',
    options: opts4(
      'Concentrate all knowledge in one specialist',
      'Encourage pairing/mobbing, knowledge sharing, and cross-skilling so capability spreads',
      'Forbid anyone from learning new areas',
      'Silo each skill to one person'
    ),
    correct: ['b'],
    explanation: 'Pairing/mobbing, knowledge sharing, and cross-skilling distribute capability, reduce single points of failure, and strengthen team resilience.',
    references: [REF_XP, REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'The team blames an individual whenever a defect escapes. The most performance-positive cultural shift is toward:',
    options: opts4(
      'Stronger individual blame to deter mistakes',
      'A blameless culture focused on systemic causes and learning, preserving accountability for improvement',
      'Hiding all defects',
      'Removing testing to avoid finding defects'
    ),
    correct: ['b'],
    explanation: 'A blameless, systems-focused culture surfaces problems honestly and drives systemic improvement; individual blame suppresses transparency and learning.',
    references: [REF_RCA, REF_AGILE_GUIDE]
  },
  {
    domain: TEAM, difficulty: 2, type: QType.SINGLE,
    stem: 'What does "swarming" mean in a team-performance context?',
    options: opts4(
      'Everyone starts a different new item',
      'Multiple team members collaborate to finish the highest-priority item quickly',
      'Splitting the team into competing factions',
      'Avoiding collaboration to reduce conflict'
    ),
    correct: ['b'],
    explanation: 'Swarming is when several team members focus together to complete the top-priority item, reducing WIP and accelerating value delivery.',
    references: [REF_WIP, REF_KANBAN]
  },
  {
    domain: TEAM, difficulty: 4, type: QType.SINGLE,
    stem: 'A high performer is unhappy because the team\'s shared standards "slow them down." The best agile-aligned coaching stance is:',
    options: opts4(
      'Exempt the high performer from all standards',
      'Reinforce that shared standards optimize team (not individual) throughput and quality, and explore the concern in a retrospective',
      'Drop all team standards',
      'Ignore the concern entirely'
    ),
    correct: ['b'],
    explanation: 'Agile optimizes team-level outcomes; shared standards protect overall quality/flow. The concern should be heard and addressed via the retrospective, not by exemptions.',
    references: [REF_AGILE_GUIDE, REF_RETRO]
  },
  {
    domain: TEAM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes the agile coach/scrum master\'s role regarding team performance?',
    options: opts4(
      'Command the team and assign all tasks',
      'Act as a servant leader: coach, facilitate, remove impediments, and foster self-organization',
      'Report individual performance to HR weekly',
      'Make all technical decisions for the team'
    ),
    correct: ['b'],
    explanation: 'The coach/scrum master serves the team — coaching, facilitating, removing impediments, and enabling self-organization — rather than commanding or deciding the work.',
    references: [REF_AGILE_GUIDE, REF_SCRUMGUIDE]
  },

  // ── Adaptive Planning (8) ──
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is an example of adaptive (vs. predictive) planning?',
    options: opts4(
      'A fully detailed 18-month plan locked at kickoff',
      'A coarse release plan refined each iteration using actual velocity and feedback',
      'No plan and no goals at all',
      'A plan that cannot be changed under any circumstances'
    ),
    correct: ['b'],
    explanation: 'Adaptive planning maintains a coarse longer-term plan that is continuously refined with empirical data and feedback, unlike a locked predictive plan.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'A release has 200 points remaining; velocity averages 25 with a range of 20–30. Which forecast best communicates this?',
    options: opts4(
      'Exactly 8 sprints, guaranteed',
      'Roughly 7–10 sprints depending on velocity, with ~8 as the midpoint',
      'Exactly 4 sprints',
      'Unknowable, give no estimate'
    ),
    correct: ['b'],
    explanation: '200/30 ≈ 7 and 200/20 = 10; with a 25 average the midpoint is ~8. Communicating a 7–10 range with a midpoint reflects the velocity variability honestly.',
    references: [REF_VELOCITY, REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the primary input to iteration planning regarding capacity?',
    options: opts4(
      'The number of features the sponsor wants',
      'The team\'s realistic available capacity and recent velocity/throughput',
      'The longest historical sprint ever',
      'The number of meetings scheduled'
    ),
    correct: ['b'],
    explanation: 'Iteration planning should be grounded in realistic available capacity and recent empirical velocity/throughput, not stakeholder desire or extreme outliers.',
    references: [REF_VELOCITY, REF_SCRUMGUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are valid agile estimation techniques.',
    options: opts4(
      'Planning poker',
      'T-shirt sizing (S/M/L/XL)',
      'Demanding a single guaranteed hour figure with no uncertainty',
      'Affinity estimation / relative grouping'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Planning poker, T-shirt sizing, and affinity estimation are recognized relative-estimation techniques. Demanding a single no-uncertainty hour figure is not agile estimation.',
    references: [REF_AA_GLOSSARY, REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In agile, longer-horizon plans are intentionally less detailed than near-term plans.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Progressive elaboration means distant work is planned coarsely and refined as it nears, avoiding wasted detailed planning of uncertain future work.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'A dependency on another team threatens the iteration plan. The best adaptive-planning action is to:',
    options: opts4(
      'Ignore the dependency and hope it resolves',
      'Make the dependency visible, coordinate/sequence with the other team, and adjust the plan if needed',
      'Cancel the iteration',
      'Hide the risk from stakeholders'
    ),
    correct: ['b'],
    explanation: 'Adaptive planning surfaces cross-team dependencies, coordinates sequencing, and re-plans transparently rather than ignoring or concealing the risk.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 4, type: QType.SINGLE,
    stem: 'Scope is fixed by contract but the team learns mid-project that part of it is low value and risky. The most agile-aligned planning move is to:',
    options: opts4(
      'Build all of it regardless of value, silently',
      'Transparently propose a change/renegotiation focusing on delivering the highest-value subset within constraints',
      'Stop work entirely',
      'Deliver only the easy parts without telling anyone'
    ),
    correct: ['b'],
    explanation: 'Even with contractual scope, agile favors transparent renegotiation toward maximizing delivered value (customer collaboration over contract rigidity), not silent compliance or concealment.',
    references: [REF_MANIFESTO, REF_AGILE_GUIDE]
  },
  {
    domain: PLAN, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does adaptive planning prefer frequent re-planning over a single comprehensive plan?',
    options: opts4(
      'Because planning is unimportant',
      'Because uncertainty is highest early; frequent re-planning incorporates new knowledge and reduces forecast error',
      'Because plans should never exist',
      'Because it removes accountability'
    ),
    correct: ['b'],
    explanation: 'Uncertainty is greatest at the start; frequent re-planning continually folds in new learning, producing more accurate forecasts than a single up-front plan.',
    references: [REF_AGILE_GUIDE]
  },

  // ── Problem Detection and Resolution (7) ──
  {
    domain: PROBLEM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why does a visible task/Kanban board aid problem detection?',
    options: opts4(
      'It hides bottlenecks from the team',
      'It makes blocked items, aging work, and bottlenecks immediately visible so they can be addressed',
      'It eliminates the need for stand-ups',
      'It prevents any change to the plan'
    ),
    correct: ['b'],
    explanation: 'A visible board exposes blocked/aging items and bottlenecks at a glance, prompting timely problem detection and resolution.',
    references: [REF_KANBAN]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'The "Five Whys" technique is best described as:',
    options: opts4(
      'Asking five different people for opinions',
      'Iteratively asking "why" to trace a problem from symptom to root cause',
      'A five-point estimation scale',
      'A way to assign blame to five people'
    ),
    correct: ['b'],
    explanation: 'Five Whys repeatedly asks "why" to move from the visible symptom toward the underlying root cause so the real problem can be addressed.',
    references: [REF_RCA]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are good responses when a serious impediment is detected.',
    options: opts4(
      'Make it visible on the impediment list',
      'Assign an owner and target resolution date',
      'Suppress it to avoid alarming stakeholders',
      'Escalate beyond the team if it cannot be resolved internally'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Visibility, ownership with a date, and escalation when needed drive resolution. Suppressing the impediment delays the fix and erodes trust.',
    references: [REF_AGILE_GUIDE]
  },
  {
    domain: PROBLEM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Detecting problems earlier in the delivery cycle generally lowers the cost to fix them.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The cost of change/defects typically rises the later they are found; early detection through short feedback loops reduces remediation cost.',
    references: [REF_CI, REF_AGILE_GUIDE]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'A team treats every production incident only with a quick patch and no follow-up analysis. The main long-term risk is:',
    options: opts4(
      'Incidents will stop on their own',
      'Underlying causes persist, so similar incidents keep recurring and erode reliability and trust',
      'Patches always fix root causes',
      'There is no long-term risk'
    ),
    correct: ['b'],
    explanation: 'Patch-only responses leave root causes intact, so similar incidents recur, degrading reliability and stakeholder trust over time.',
    references: [REF_RCA]
  },
  {
    domain: PROBLEM, difficulty: 4, type: QType.SINGLE,
    stem: 'Defect escape rate is rising despite stable code volume. Which investigation best fits an agile problem-resolution approach?',
    options: opts4(
      'Blame the newest team member',
      'Analyze where defects are introduced/escaping (e.g., test coverage, review, environment) and address the systemic gap',
      'Stop measuring defects',
      'Add more features to distract stakeholders'
    ),
    correct: ['b'],
    explanation: 'Investigating where defects are introduced and escaping (coverage, review, environments) targets the systemic gap, consistent with agile root-cause-driven resolution.',
    references: [REF_RCA, REF_CI]
  },
  {
    domain: PROBLEM, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk has low probability but catastrophic impact on the release. The agile-aligned handling is to:',
    options: opts4(
      'Ignore it because probability is low',
      'Keep it visible, monitor it, and prepare a mitigation/contingency proportionate to its impact',
      'Remove it from the risk register',
      'Address it only after it occurs'
    ),
    correct: ['b'],
    explanation: 'High-impact risks warrant visibility, monitoring, and a prepared mitigation/contingency even when probability is low, because the consequence is severe.',
    references: [REF_AGILE_GUIDE]
  },

  // ── Continuous Improvement (6) ──
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which event is specifically dedicated to improving how the team works?',
    options: opts4(
      'The sprint review',
      'The retrospective',
      'Backlog refinement',
      'The daily stand-up'
    ),
    correct: ['b'],
    explanation: 'The retrospective is the dedicated inspect-and-adapt event for the team\'s process and ways of working; the review focuses on the product/increment.',
    references: [REF_RETRO, REF_SCRUMGUIDE]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'To make continuous improvement durable, retrospective actions should be:',
    options: opts4(
      'Numerous, unowned, and untracked',
      'Few, specific, owned, and reviewed for impact in the next cycle',
      'Decided solely by the manager',
      'Discarded after the meeting'
    ),
    correct: ['b'],
    explanation: 'Durable improvement comes from a few specific, owned actions that are tracked and reviewed for impact — closing the inspect-and-adapt loop.',
    references: [REF_RETRO]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that strengthen a culture of continuous improvement.',
    options: opts4(
      'Psychological safety to surface problems honestly',
      'Treating change as a series of small, evaluated experiments',
      'Punishing anyone who raises a problem',
      'Closing the loop on prior improvement actions'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Safety, small evaluated experiments, and following through on prior actions sustain improvement. Punishing problem-raisers suppresses the transparency improvement needs.',
    references: [REF_RETRO, REF_AGILE_GUIDE]
  },
  {
    domain: IMPROVE, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Continuous improvement in agile is everyone\'s responsibility, not only the coach\'s or manager\'s.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Agile makes improvement a shared, team-wide responsibility; the whole team inspects and adapts, supported (not owned exclusively) by the coach.',
    references: [REF_AGILE_GUIDE, REF_RETRO]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the best example of process improvement driven by empirical data?',
    options: opts4(
      'Changing the process because a competitor did',
      'Noticing rising cycle time, hypothesizing a WIP cause, lowering WIP, and verifying the effect',
      'Never changing the process',
      'Changing process based only on the loudest opinion'
    ),
    correct: ['b'],
    explanation: 'Using a metric trend to form a hypothesis, making a targeted change, and verifying the effect is empirical, data-driven continuous improvement.',
    references: [REF_WIP, REF_LEAN]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization wants improvement but only runs a single yearly "lessons learned" at project end. The strongest agile critique is:',
    options: opts4(
      'Yearly is the ideal cadence for learning',
      'Feedback that late cannot influence the work it concerns; frequent retrospectives enable timely, compounding improvement',
      'Lessons learned should never be done',
      'Improvement does not need any cadence'
    ),
    correct: ['b'],
    explanation: 'End-of-project lessons arrive too late to help that work; frequent retrospectives let teams apply learning continuously, compounding improvement over time.',
    references: [REF_RETRO, REF_AGILE_GUIDE]
  }
];

const PMIACP_DOMAINS = [
  { name: MINDSET, weight: 16 },
  { name: VALUE, weight: 20 },
  { name: STAKE, weight: 17 },
  { name: TEAM, weight: 16 },
  { name: PLAN, weight: 12 },
  { name: PROBLEM, weight: 10 },
  { name: IMPROVE, weight: 9 }
];

const PMIACP_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'pmi-acp-p1',
    code: 'PMI-ACP-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a full 180-minute, 65-question, blueprint-weighted set covering agile principles & mindset, value-driven delivery, stakeholder engagement, team performance, adaptive planning, problem detection & resolution, and continuous improvement.',
    questions: P1
  },
  {
    slug: 'pmi-acp-p2',
    code: 'PMI-ACP-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 180-minute, 65-question, blueprint-weighted set across all seven PMI-ACP domains.',
    questions: P2
  },
  {
    slug: 'pmi-acp-p3',
    code: 'PMI-ACP-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 180-minute, 65-question, blueprint-weighted set across all seven PMI-ACP domains.',
    questions: P3
  }
];

const PMIACP_BUNDLE = {
  slug: 'pmi-acp',
  title: 'PMI Agile Certified Practitioner (PMI-ACP)',
  description: 'All 3 PMI-ACP practice exams in one bundle — covering agile principles & mindset, value-driven delivery, stakeholder engagement, team performance, adaptive planning, problem detection & resolution, and continuous improvement, aligned to the PMI-ACP exam content outline.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 50500 // USD 505 — PRACTICE + real-exam VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the PMI-ACP bundle. Safe to call repeatedly — vendor /
 * exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:pmiacp-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedPmiAcp(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'pmi' } });
  await db.vendor.upsert({
    where: { slug: 'pmi' },
    update: { name: 'PMI', description: 'Project Management Institute (PMI) certifications — project, program, agile, and business analysis credentials including the PMI Agile Certified Practitioner (PMI-ACP).' },
    create: { slug: 'pmi', name: 'PMI', description: 'Project Management Institute (PMI) certifications — project, program, agile, and business analysis credentials including the PMI Agile Certified Practitioner (PMI-ACP).' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'pmi' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of PMIACP_EXAMS) {
    const title = `PMI Agile Certified Practitioner (PMI-ACP) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the PMI-ACP exam content outline.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 180,
      passingScore: 75,
      questionCount: e.questions.length,
      domains: PMIACP_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:pmiacp-seed' } });
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
          generatedBy: 'manual:pmiacp-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: PMIACP_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: PMIACP_BUNDLE.slug },
    update: {
      title: PMIACP_BUNDLE.title,
      description: PMIACP_BUNDLE.description,
      price: PMIACP_BUNDLE.price,
      priceVoucher: PMIACP_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: PMIACP_BUNDLE.slug,
      title: PMIACP_BUNDLE.title,
      description: PMIACP_BUNDLE.description,
      price: PMIACP_BUNDLE.price,
      priceVoucher: PMIACP_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'pmi-acp-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'pmi-acp-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'pmi-acp-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'pmi-acp-p1', tier: 'VOUCHER' as const, position: 4 }
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
