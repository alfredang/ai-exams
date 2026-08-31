/**
 * PSPO I bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:pspo-seed'` and upserts catalog rows.
 *
 * Exported as `seedPspo(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/pspo.ts`) and the protected
 * admin API (`/api/admin/seed-pspo`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored STRICTLY against the current (2020)
 * Scrum Guide and the Scrum.org Professional Scrum Product Owner
 * stance — not generic agile folklore. Domain blueprint:
 *   - Scrum Framework              — 25% (~16)
 *   - Product Value and Vision     — 20% (~13)
 *   - Product Backlog Management   — 25% (~16)
 *   - Stakeholders and Customers   — 15% (~10)
 *   - Empiricism and Agility       — 15% (~10)
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

const FRAMEWORK = 'Scrum Framework';
const VALUE = 'Product Value and Vision';
const BACKLOG = 'Product Backlog Management';
const STAKE = 'Stakeholders and Customers';
const EMPIRICISM = 'Empiricism and Agility';

const REF_GUIDE_TEAM = { label: 'Scrum Guide 2020 — Scrum Team', url: 'https://scrumguides.org/scrum-guide.html#scrum-team' };
const REF_GUIDE_PO = { label: 'Scrum Guide 2020 — Product Owner', url: 'https://scrumguides.org/scrum-guide.html#product-owner' };
const REF_GUIDE_SM = { label: 'Scrum Guide 2020 — Scrum Master', url: 'https://scrumguides.org/scrum-guide.html#scrum-master' };
const REF_GUIDE_DEV = { label: 'Scrum Guide 2020 — Developers', url: 'https://scrumguides.org/scrum-guide.html#developers' };
const REF_GUIDE_EVENTS = { label: 'Scrum Guide 2020 — Scrum Events', url: 'https://scrumguides.org/scrum-guide.html#scrum-events' };
const REF_GUIDE_SPRINT = { label: 'Scrum Guide 2020 — The Sprint', url: 'https://scrumguides.org/scrum-guide.html#the-sprint' };
const REF_GUIDE_PLANNING = { label: 'Scrum Guide 2020 — Sprint Planning', url: 'https://scrumguides.org/scrum-guide.html#sprint-planning' };
const REF_GUIDE_DAILY = { label: 'Scrum Guide 2020 — Daily Scrum', url: 'https://scrumguides.org/scrum-guide.html#daily-scrum' };
const REF_GUIDE_REVIEW = { label: 'Scrum Guide 2020 — Sprint Review', url: 'https://scrumguides.org/scrum-guide.html#sprint-review' };
const REF_GUIDE_RETRO = { label: 'Scrum Guide 2020 — Sprint Retrospective', url: 'https://scrumguides.org/scrum-guide.html#sprint-retrospective' };
const REF_GUIDE_ARTIFACTS = { label: 'Scrum Guide 2020 — Scrum Artifacts', url: 'https://scrumguides.org/scrum-guide.html#scrum-artifacts' };
const REF_GUIDE_PB = { label: 'Scrum Guide 2020 — Product Backlog', url: 'https://scrumguides.org/scrum-guide.html#product-backlog' };
const REF_GUIDE_SB = { label: 'Scrum Guide 2020 — Sprint Backlog', url: 'https://scrumguides.org/scrum-guide.html#sprint-backlog' };
const REF_GUIDE_INC = { label: 'Scrum Guide 2020 — Increment', url: 'https://scrumguides.org/scrum-guide.html#increment' };
const REF_GUIDE_DOD = { label: 'Scrum Guide 2020 — Definition of Done', url: 'https://scrumguides.org/scrum-guide.html#definition-of-done' };
const REF_GUIDE_GOAL = { label: 'Scrum Guide 2020 — Product Goal', url: 'https://scrumguides.org/scrum-guide.html#product-goal' };
const REF_GUIDE_SGOAL = { label: 'Scrum Guide 2020 — Sprint Goal', url: 'https://scrumguides.org/scrum-guide.html#commitment-sprint-goal' };
const REF_GUIDE_THEORY = { label: 'Scrum Guide 2020 — Scrum Theory', url: 'https://scrumguides.org/scrum-guide.html#scrum-theory' };
const REF_GUIDE_VALUES = { label: 'Scrum Guide 2020 — Scrum Values', url: 'https://scrumguides.org/scrum-guide.html#scrum-values' };
const REF_GUIDE_DEF = { label: 'Scrum Guide 2020 — Scrum Definition', url: 'https://scrumguides.org/scrum-guide.html#scrum-definition' };
const REF_SO_PB = { label: 'Scrum.org — What is a Product Backlog?', url: 'https://www.scrum.org/resources/what-is-a-product-backlog' };
const REF_SO_VALUE = { label: 'Scrum.org — What is Product Value?', url: 'https://www.scrum.org/resources/what-is-product-value' };
const REF_SO_REFINE = { label: 'Scrum.org — Product Backlog Refinement', url: 'https://www.scrum.org/resources/blog/what-product-backlog-refinement' };
const REF_SO_EBM = { label: 'Scrum.org — Evidence-Based Management', url: 'https://www.scrum.org/resources/evidence-based-management' };
const REF_SO_VISION = { label: 'Scrum.org — Product Vision', url: 'https://www.scrum.org/resources/blog/product-vision-revisited' };
const REF_SO_STAKE = { label: 'Scrum.org — Stakeholder collaboration', url: 'https://www.scrum.org/resources/blog/stakeholders-scrum' };
const REF_SO_ROI = { label: 'Scrum.org — Maximizing value & ROI', url: 'https://www.scrum.org/resources/blog/product-owner-and-value' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Scrum Framework (16) ──
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'According to the 2020 Scrum Guide, how many accountabilities make up the Scrum Team?',
    options: opts4(
      'Two: Product Owner and Scrum Master',
      'Three: Product Owner, Scrum Master, and Developers',
      'Four: Product Owner, Scrum Master, Developers, and Stakeholders',
      'One: the self-managing team as a whole'
    ),
    correct: ['b'],
    explanation: 'The 2020 Scrum Guide defines one Scrum Team consisting of three accountabilities: one Product Owner, one Scrum Master, and Developers. Stakeholders are not part of the Scrum Team.',
    references: [REF_GUIDE_TEAM]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Who is accountable for maximizing the value of the product resulting from the work of the Scrum Team?',
    options: opts4(
      'The Scrum Master',
      'The Developers',
      'The Product Owner',
      'The key stakeholders'
    ),
    correct: ['c'],
    explanation: 'The Scrum Guide states the Product Owner is accountable for maximizing the value of the product resulting from the work of the Scrum Team. This accountability cannot be delegated, though others may collaborate.',
    references: [REF_GUIDE_PO]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the maximum length of a Sprint according to the Scrum Guide?',
    options: opts4(
      'Two weeks',
      'One month',
      'One quarter',
      'There is no maximum; the team decides'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide says Sprints are fixed-length events of one month or less. Shorter Sprints generate more learning cycles and limit risk to a smaller time horizon.',
    references: [REF_GUIDE_SPRINT]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'During Sprint Planning, who is ultimately accountable for ensuring the topic of "Why is this Sprint valuable?" is addressed?',
    options: opts4(
      'The Scrum Master, who facilitates the event',
      'The Developers, who do the work',
      'The Product Owner, who proposes how the product could increase value this Sprint',
      'The stakeholders who requested the items'
    ),
    correct: ['c'],
    explanation: 'In Sprint Planning Topic One, the Product Owner proposes how the product could increase its value and utility in the current Sprint; the whole Scrum Team then collaborates to define a Sprint Goal.',
    references: [REF_GUIDE_PLANNING]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The Product Owner may delegate Product Backlog management activities to others, but remains accountable for them.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The Scrum Guide states the Product Owner may do Product Backlog work or may delegate it to others; regardless, the Product Owner remains accountable.',
    references: [REF_GUIDE_PO]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A Sprint Review is running long and stakeholders want to keep discussing. What is the correct guidance?',
    options: opts4(
      'Extend the Sprint Review indefinitely until all topics are exhausted',
      'The Sprint Review is timeboxed (a maximum of four hours for a one-month Sprint) and should end within that box',
      'Move the remaining discussion into the Daily Scrum',
      'Cancel the Sprint Retrospective to reclaim the time'
    ),
    correct: ['b'],
    explanation: 'All Scrum events are timeboxed. The Sprint Review is at most four hours for a one-month Sprint (usually shorter). It is a working session, not a status meeting, and ends within its timebox.',
    references: [REF_GUIDE_REVIEW]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Scrum event is the opportunity for the Scrum Team to inspect itself and create a plan for improvements?',
    options: opts4(
      'Sprint Review',
      'Daily Scrum',
      'Sprint Retrospective',
      'Sprint Planning'
    ),
    correct: ['c'],
    explanation: 'The Sprint Retrospective is the event where the Scrum Team inspects how the last Sprint went regarding individuals, interactions, processes, tools, and Definition of Done, and plans improvements.',
    references: [REF_GUIDE_RETRO]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL events that are formal opportunities for inspection and adaptation within Scrum.',
    options: opts4(
      'Sprint Planning',
      'Daily Scrum',
      'Sprint Review',
      'Sprint Retrospective'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'Each Scrum event is a formal opportunity to inspect and adapt Scrum artifacts. The Sprint itself is the container; Sprint Planning, Daily Scrum, Sprint Review, and Sprint Retrospective are all inspect-and-adapt events.',
    references: [REF_GUIDE_EVENTS]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Who decides how to turn the selected Product Backlog items into an Increment during the Sprint?',
    options: opts4(
      'The Product Owner',
      'The Scrum Master',
      'The Developers',
      'The stakeholders'
    ),
    correct: ['c'],
    explanation: 'The Developers are always accountable for the plan to deliver the Increment — the "how". They craft the Sprint Backlog and self-manage the work.',
    references: [REF_GUIDE_DEV]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the primary purpose of the Sprint as described in the Scrum Guide?',
    options: opts4(
      'To produce a fixed scope of features within a deadline',
      'It is a container for all other events where ideas are turned into value, enabling predictability',
      'To allow the Product Owner to lock the Product Backlog',
      'To give Developers a break between releases'
    ),
    correct: ['b'],
    explanation: 'The Sprint is the heartbeat of Scrum where ideas are turned into value. It is a fixed-length container for the other events, enabling predictability by ensuring inspection and adaptation at least every calendar month.',
    references: [REF_GUIDE_SPRINT]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder asks the Product Owner to cancel a Sprint because market priorities shifted dramatically. Who has the authority to cancel a Sprint?',
    options: opts4(
      'Only the Product Owner',
      'The Scrum Master after consulting Developers',
      'The Developers by majority vote',
      'The most senior stakeholder'
    ),
    correct: ['a'],
    explanation: 'The Scrum Guide states a Sprint could be cancelled if the Sprint Goal becomes obsolete, and only the Product Owner has the authority to cancel the Sprint.',
    references: [REF_GUIDE_SPRINT]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'The Daily Scrum is primarily for whom?',
    options: opts4(
      'Stakeholders to get a status update',
      'The Product Owner to reassign work',
      'The Developers to inspect progress toward the Sprint Goal and adapt the Sprint Backlog',
      'The Scrum Master to report metrics to management'
    ),
    correct: ['c'],
    explanation: 'The Daily Scrum is a 15-minute event for the Developers to inspect progress toward the Sprint Goal and adapt the Sprint Backlog as necessary, adjusting the upcoming planned work.',
    references: [REF_GUIDE_DAILY]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'How does Scrum describe the Product Owner role with respect to a single person versus a committee?',
    options: opts4(
      'The Product Owner is one person, not a committee; they may represent the needs of many stakeholders',
      'The Product Owner is always a committee of business representatives',
      'Each Developer can act as a part-time Product Owner',
      'The Scrum Master serves as a backup Product Owner by default'
    ),
    correct: ['a'],
    explanation: 'The Scrum Guide is explicit: the Product Owner is one person, not a committee. They may represent the needs of many stakeholders in the Product Backlog; those wanting to change priority address the Product Owner.',
    references: [REF_GUIDE_PO]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes the Scrum Master\'s service to the Product Owner?',
    options: opts4(
      'The Scrum Master writes the Product Backlog for the Product Owner',
      'The Scrum Master helps find techniques for effective Product Goal definition and Product Backlog management',
      'The Scrum Master decides product priorities when the Product Owner is unavailable',
      'The Scrum Master approves all releases'
    ),
    correct: ['b'],
    explanation: 'The Scrum Master serves the Product Owner by helping find techniques for effective Product Goal definition and Product Backlog management, and by facilitating stakeholder collaboration as requested or needed.',
    references: [REF_GUIDE_SM]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Sprint Goal per the Scrum Guide.',
    options: opts4(
      'It is the single objective for the Sprint and the commitment for the Sprint Backlog',
      'It is created during Sprint Planning and added to the Sprint Backlog',
      'It may be abandoned freely mid-Sprint by the Developers without discussion',
      'It provides flexibility in terms of the exact work needed to achieve it'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'The Sprint Goal is the commitment for the Sprint Backlog — a single objective created in Sprint Planning. It is not changed during the Sprint, though scope may be clarified/renegotiated with the Product Owner; it provides flexibility about the exact work.',
    references: [REF_GUIDE_SGOAL, REF_GUIDE_PLANNING]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Scrum is founded on empiricism and lean thinking.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The 2020 Scrum Guide states Scrum is founded on empiricism and lean thinking. Empiricism asserts knowledge comes from experience; lean thinking reduces waste and focuses on essentials.',
    references: [REF_GUIDE_THEORY]
  },

  // ── Product Value and Vision (13) ──
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the Product Goal in the 2020 Scrum Guide?',
    options: opts4(
      'A short statement of how the Sprint will deliver value',
      'A long-term objective for the Scrum Team that describes a future state of the product',
      'The list of all tasks for the next release',
      'A synonym for the Definition of Done'
    ),
    correct: ['b'],
    explanation: 'The Product Goal describes a future state of the product and serves as the long-term objective for the Scrum Team. It is the commitment for the Product Backlog.',
    references: [REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Owner is pressured to add more features to "increase value." From a Scrum.org value perspective, what is the most appropriate way to think about value?',
    options: opts4(
      'Value equals the number of features shipped',
      'Value is realized when outcomes improve for customers and the business, not merely by output produced',
      'Value is whatever the loudest stakeholder requests',
      'Value is maximized by always keeping Developers fully utilized'
    ),
    correct: ['b'],
    explanation: 'Scrum.org stresses that value is about outcomes and impact for customers and the organization, not output. More features do not equal more value; the Product Owner optimizes value, sometimes by doing less.',
    references: [REF_SO_VALUE, REF_SO_ROI]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes a useful product vision for a Product Owner?',
    options: opts4(
      'A detailed Gantt chart of all releases for two years',
      'A clear, aspirational description of the future the product aims to create, guiding ordering decisions',
      'A signed contract listing fixed scope',
      'The Definition of Done'
    ),
    correct: ['b'],
    explanation: 'A product vision is an aspirational, clear description of the future the product seeks to create. It provides direction and helps the Product Owner make consistent Product Backlog ordering decisions toward the Product Goal.',
    references: [REF_SO_VISION]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Evidence-Based Management (EBM) helps a Product Owner primarily by:',
    options: opts4(
      'Guaranteeing a fixed return on every Sprint',
      'Providing a framework to measure value and guide empirical investment toward strategic goals',
      'Replacing the Product Backlog with KPIs',
      'Eliminating the need for stakeholder feedback'
    ),
    correct: ['b'],
    explanation: 'EBM is a Scrum.org framework that helps organizations measure value and use empirical evidence to improve outcomes and guide investment toward strategic goals, supporting the Product Owner in maximizing value.',
    references: [REF_SO_EBM]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'A feature is technically impressive but rarely used by customers. What should the Product Owner most likely do?',
    options: opts4(
      'Add more sub-features regardless of usage',
      'Reassess its position/retention based on the value and outcomes it delivers',
      'Hide the data from stakeholders',
      'Ask Developers to make it more complex'
    ),
    correct: ['b'],
    explanation: 'Maximizing value means continuously reassessing items by the outcomes they deliver. Low-usage features are candidates for re-ordering, simplification, or removal — value, not effort already spent, drives decisions.',
    references: [REF_SO_ROI, REF_SO_VALUE]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The Product Goal is the commitment associated with the Product Backlog.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'In the 2020 Scrum Guide, each artifact has a commitment: Product Backlog → Product Goal, Sprint Backlog → Sprint Goal, Increment → Definition of Done.',
    references: [REF_GUIDE_ARTIFACTS, REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'How should a Product Owner relate the Product Goal to the Product Backlog?',
    options: opts4(
      'The Product Backlog should contain items that move the product toward the Product Goal',
      'The Product Goal is unrelated to the Product Backlog',
      'The Product Goal replaces the Product Backlog entirely',
      'Each Sprint must have a brand-new Product Goal'
    ),
    correct: ['a'],
    explanation: 'The Product Backlog emerges to define "what" will fulfill the Product Goal. A Scrum Team focuses on one Product Goal at a time; the backlog contains items that progress toward it.',
    references: [REF_GUIDE_GOAL, REF_GUIDE_PB]
  },
  {
    domain: VALUE, difficulty: 4, type: QType.SINGLE,
    stem: 'A stakeholder demands a fixed two-year roadmap with locked scope. The most value-oriented Product Owner response is to:',
    options: opts4(
      'Commit to the locked scope to keep the stakeholder happy',
      'Explain that direction (vision/goal) is stable but scope adapts based on empirical evidence to maximize value',
      'Refuse to discuss any future plans',
      'Hand roadmap ownership to the stakeholder'
    ),
    correct: ['b'],
    explanation: 'A Product Owner keeps the vision and Product Goal stable while adapting scope as learning accrues. Locking detailed scope years out conflicts with empiricism and risks delivering low-value output.',
    references: [REF_SO_VISION, REF_GUIDE_THEORY]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are legitimate inputs a Product Owner uses when optimizing product value.',
    options: opts4(
      'Customer and user outcomes and feedback',
      'Business strategy and desired impact',
      'Market and competitive insight',
      'Only the number of story points completed'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Value optimization considers customer/user outcomes, business strategy, and market insight. Velocity/story points are a Developers\' planning aid, not a measure of delivered value.',
    references: [REF_SO_ROI, REF_SO_EBM]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why does delivering a usable Increment early help maximize value (ROI)?',
    options: opts4(
      'It guarantees the project finishes faster',
      'It enables earlier feedback and potential earlier value realization, reducing risk',
      'It removes the need for a Product Backlog',
      'It lets the team skip the Sprint Review'
    ),
    correct: ['b'],
    explanation: 'Delivering usable Increments early enables earlier feedback and the possibility of realizing value (and ROI) sooner, while reducing the risk of building the wrong thing — a core empirical and lean benefit.',
    references: [REF_SO_ROI, REF_GUIDE_INC]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'The Product Owner discovers two items: one with high effort and low expected outcome, one with low effort and high expected outcome. What ordering rationale is most aligned with maximizing value?',
    options: opts4(
      'Order strictly by who requested the item',
      'Order to maximize value and outcomes relative to effort and risk',
      'Always do the highest-effort item first',
      'Order alphabetically for transparency'
    ),
    correct: ['b'],
    explanation: 'The Product Owner orders the Product Backlog to best achieve goals and missions — weighing value, outcomes, effort, risk, and dependencies. High-value/low-effort items typically rise.',
    references: [REF_GUIDE_PB, REF_SO_ROI]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST indicator that the product is delivering value?',
    options: opts4(
      'The team\'s velocity increased',
      'All planned features were delivered on time',
      'Customer/business outcomes are improving (e.g., satisfaction, usage, revenue impact)',
      'The Product Backlog is empty'
    ),
    correct: ['c'],
    explanation: 'Value is evidenced by improved outcomes for customers and the business. Output metrics like velocity or "all features delivered" do not confirm value was created.',
    references: [REF_SO_VALUE, REF_SO_EBM]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'A clear Product Goal primarily helps the Scrum Team by:',
    options: opts4(
      'Removing the need for Sprint Goals',
      'Providing focus and a measurable objective the team progresses toward',
      'Eliminating stakeholder involvement',
      'Locking the Product Backlog'
    ),
    correct: ['b'],
    explanation: 'The Product Goal gives the Scrum Team a long-term objective to focus on and plan against. The team must fulfill (or abandon) one Product Goal before taking on the next.',
    references: [REF_GUIDE_GOAL]
  },

  // ── Product Backlog Management (16) ──
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Who is accountable for Product Backlog ordering?',
    options: opts4(
      'The Developers',
      'The Scrum Master',
      'The Product Owner',
      'The stakeholders collectively'
    ),
    correct: ['c'],
    explanation: 'The Product Owner is accountable for Product Backlog management, including ordering the items. Others may collaborate, but the Product Owner remains accountable.',
    references: [REF_GUIDE_PO, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'How many Product Backlogs should exist for a single product?',
    options: opts4(
      'One per Developer',
      'One per team working on the product',
      'Exactly one Product Backlog for the product',
      'One per stakeholder group'
    ),
    correct: ['c'],
    explanation: 'There is a single Product Backlog for a product. If multiple Scrum Teams work on one product, they share one Product Backlog and one Product Goal.',
    references: [REF_GUIDE_PB, REF_SO_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'What is Product Backlog refinement?',
    options: opts4(
      'A mandatory Scrum event held every Friday',
      'The ongoing activity of breaking down and further defining items into smaller, more precise items',
      'The Product Owner privately rewriting all items',
      'Estimation done only by the Scrum Master'
    ),
    correct: ['b'],
    explanation: 'Refinement is the ongoing act of breaking down and further defining Product Backlog items into smaller, more precise items. It is an ongoing activity, not a separate prescribed Scrum event.',
    references: [REF_SO_REFINE, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'During refinement, who decides how much detail and the sizing of Product Backlog items?',
    options: opts4(
      'The Product Owner alone sets all estimates',
      'The Scrum Master assigns sizes',
      'The Developers who will perform the work are responsible for sizing; the Product Owner may influence by trade-offs',
      'Stakeholders provide the final estimates'
    ),
    correct: ['c'],
    explanation: 'The Developers are responsible for sizing/estimation since they do the work. The Product Owner can influence by helping them understand and select trade-offs, but does not set the estimates.',
    references: [REF_GUIDE_PB, REF_GUIDE_DEV]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Product Backlog items that can be Done within one Sprint are considered "ready" for selection in Sprint Planning.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The Scrum Guide notes Product Backlog items that can be Done by the Scrum Team within one Sprint are deemed ready for selection in a Sprint Planning event.',
    references: [REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'A new high-priority customer request arrives mid-Sprint. What is the appropriate Product Owner action regarding the Product Backlog?',
    options: opts4(
      'Force it into the current Sprint Backlog without discussion',
      'Add/order it on the Product Backlog; it can be considered for an upcoming Sprint, and scope may be discussed with Developers',
      'Cancel the Sprint automatically',
      'Reject the request because the backlog is frozen during Sprints'
    ),
    correct: ['b'],
    explanation: 'The Product Backlog is dynamic and may change anytime. New items are added/ordered there. The current Sprint\'s scope is negotiated between Product Owner and Developers without endangering the Sprint Goal.',
    references: [REF_GUIDE_PB, REF_GUIDE_SB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the Product Backlog per the Scrum Guide.',
    options: opts4(
      'It is an emergent, ordered list of what is needed to improve the product',
      'It is the single source of work undertaken by the Scrum Team',
      'It must be fully detailed and frozen before development starts',
      'Attributes of items often vary with the domain of work'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'The Product Backlog is an emergent, ordered list and the single source of work for the Scrum Team; item attributes vary by domain. It is never required to be fully detailed or frozen upfront.',
    references: [REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'Transparency of the Product Backlog is most directly supported when:',
    options: opts4(
      'Only the Product Owner can see it',
      'It is visible, ordered, and understood the same way by those who need it',
      'It contains only technical tasks',
      'It is locked at the start of each release'
    ),
    correct: ['b'],
    explanation: 'Empiricism requires transparency. A Product Backlog supports transparency when it is visible, clearly ordered, and understood consistently by the Scrum Team and stakeholders who rely on it.',
    references: [REF_GUIDE_THEORY, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'Who may change the order of the Product Backlog?',
    options: opts4(
      'Any stakeholder directly',
      'Only the Product Owner (others must influence via the Product Owner)',
      'The Scrum Master during the Retrospective',
      'The Developers during the Daily Scrum'
    ),
    correct: ['b'],
    explanation: 'The Product Owner orders the Product Backlog. For the Product Owner to succeed, the organization must respect their decisions; those wanting to change ordering must do so by convincing the Product Owner.',
    references: [REF_GUIDE_PO]
  },
  {
    domain: BACKLOG, difficulty: 4, type: QType.SINGLE,
    stem: 'A stakeholder maintains a separate "wish list" spreadsheet and asks Developers to work directly from it. What is the best Product Owner response?',
    options: opts4(
      'Allow it to keep the stakeholder satisfied',
      'Reinforce that there is one Product Backlog as the single source of work; integrate and order valid items there',
      'Create a second Product Backlog for that stakeholder',
      'Let Developers decide which list to follow'
    ),
    correct: ['b'],
    explanation: 'A single Product Backlog is the single source of work for the Scrum Team. Parallel lists break transparency and ordering. The Product Owner consolidates valid items into the one ordered backlog.',
    references: [REF_GUIDE_PB, REF_SO_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'What does the Product Owner ensure about the Product Backlog so the Scrum Team works effectively?',
    options: opts4(
      'That every item has a fixed deadline',
      'That it is communicated and understood — clearly expressed and ordered',
      'That only the Product Owner ever reads it',
      'That items never change once written'
    ),
    correct: ['b'],
    explanation: 'The Product Owner is accountable for developing and explicitly communicating the Product Goal, and for creating, clearly communicating, and ordering Product Backlog items so the team understands them.',
    references: [REF_GUIDE_PO]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'When should the Product Backlog be considered "finished"?',
    options: opts4(
      'When all initial requirements are written down',
      'It is never finished as long as the product exists and evolves',
      'After the first release',
      'When velocity stabilizes'
    ),
    correct: ['b'],
    explanation: 'The Product Backlog is dynamic; it constantly changes to identify what the product needs to be appropriate, competitive, and useful. As long as a product exists, its Product Backlog also exists.',
    references: [REF_GUIDE_PB, REF_SO_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'How detailed should items near the top of the Product Backlog be compared to items lower down?',
    options: opts4(
      'All items must be equally detailed',
      'Higher-ordered items are typically clearer and more detailed; lower items are less so',
      'Lower items must be the most detailed',
      'Detail level is set by the Scrum Master'
    ),
    correct: ['b'],
    explanation: 'Progressive refinement means higher-ordered Product Backlog items are usually clearer and more detailed (more precise estimates), enabling them to be selected sooner; lower items remain coarser.',
    references: [REF_SO_REFINE, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'The commitment for the Product Backlog is the:',
    options: opts4(
      'Definition of Done',
      'Sprint Goal',
      'Product Goal',
      'Release plan'
    ),
    correct: ['c'],
    explanation: 'In the 2020 Scrum Guide, the Product Backlog\'s commitment is the Product Goal, which the Product Backlog items collectively work toward.',
    references: [REF_GUIDE_PB, REF_GUIDE_GOAL]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL acceptable ways a Product Owner can keep the Product Backlog healthy.',
    options: opts4(
      'Collaborate with Developers during ongoing refinement',
      'Incorporate stakeholder and customer feedback into ordering',
      'Keep items emergent and re-order as new information arrives',
      'Never remove or change items once added'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A healthy backlog is refined collaboratively, informed by stakeholder/customer feedback, and continuously re-ordered as learning accrues. Items can and should be changed or removed as value understanding evolves.',
    references: [REF_SO_REFINE, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'Where does the Sprint Backlog\'s selected work originate?',
    options: opts4(
      'From a separate technical backlog owned by Developers',
      'From the single Product Backlog, selected during Sprint Planning',
      'From stakeholder emails',
      'From the Scrum Master\'s task list'
    ),
    correct: ['b'],
    explanation: 'During Sprint Planning, the Developers select Product Backlog items to include in the Sprint, forming the Sprint Backlog. The Product Backlog remains the single source of work.',
    references: [REF_GUIDE_PLANNING, REF_GUIDE_SB]
  },

  // ── Stakeholders and Customers (10) ──
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Scrum event is specifically designed for the Scrum Team and stakeholders to collaborate on what was accomplished and what to do next?',
    options: opts4(
      'Daily Scrum',
      'Sprint Planning',
      'Sprint Review',
      'Sprint Retrospective'
    ),
    correct: ['c'],
    explanation: 'The Sprint Review is a working session where the Scrum Team presents results to key stakeholders and collaborates on progress toward the Product Goal and what to do next. It should not be a mere demo.',
    references: [REF_GUIDE_REVIEW]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'How should a Product Owner handle conflicting demands from multiple stakeholders?',
    options: opts4(
      'Implement everything everyone asks for',
      'Make value-based ordering decisions, representing stakeholder needs in one Product Backlog',
      'Let stakeholders vote and follow the majority blindly',
      'Escalate every decision to senior management'
    ),
    correct: ['b'],
    explanation: 'The Product Owner is one person who represents the needs of many stakeholders in the Product Backlog and makes value-based ordering decisions, balancing competing demands rather than satisfying all requests.',
    references: [REF_GUIDE_PO, REF_SO_STAKE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is direct customer/user feedback valuable to a Product Owner?',
    options: opts4(
      'It removes the need for a Product Backlog',
      'It provides empirical evidence to validate assumptions and guide value decisions',
      'It lets the Product Owner skip the Sprint Review',
      'It transfers accountability to customers'
    ),
    correct: ['b'],
    explanation: 'Customer and user feedback provides empirical evidence to test assumptions about value, informing Product Backlog ordering and the Product Goal. Empiricism depends on real inspection of outcomes.',
    references: [REF_SO_STAKE, REF_SO_VALUE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A key stakeholder bypasses the Product Owner and instructs the Developers to change priorities directly. What should happen?',
    options: opts4(
      'Developers should comply since the stakeholder is senior',
      'The change should go through the Product Owner, who is accountable for ordering; the organization must respect that',
      'The Scrum Master re-orders the backlog instead',
      'The team creates a separate backlog for that stakeholder'
    ),
    correct: ['b'],
    explanation: 'For empiricism and accountability to work, the organization must respect the Product Owner\'s decisions. Priority changes are made by convincing the Product Owner, not by directing Developers.',
    references: [REF_GUIDE_PO]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL good practices for stakeholder collaboration by a Product Owner.',
    options: opts4(
      'Involve stakeholders in the Sprint Review to gather feedback',
      'Maintain transparency of the Product Backlog and Product Goal',
      'Use feedback and evidence to adjust ordering',
      'Promise every requested feature to keep stakeholders happy'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Effective collaboration uses the Sprint Review for feedback, keeps the backlog/goal transparent, and adapts based on evidence. Promising all requests undermines value optimization and trust.',
    references: [REF_SO_STAKE, REF_GUIDE_REVIEW]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'Are stakeholders part of the Scrum Team?',
    options: opts4(
      'Yes, they are full members',
      'No; they are outside the Scrum Team but actively collaborate, especially at the Sprint Review',
      'Only the most senior stakeholder is a member',
      'They replace the Product Owner when unavailable'
    ),
    correct: ['b'],
    explanation: 'The Scrum Team is the Product Owner, Scrum Master, and Developers. Stakeholders are not members but are important collaborators, particularly during the Sprint Review.',
    references: [REF_GUIDE_TEAM, REF_GUIDE_REVIEW]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Owner wants better validation of whether a delivered feature created value. The most appropriate approach is to:',
    options: opts4(
      'Count the story points completed',
      'Gather outcome data and feedback from customers/users after release and inspect it',
      'Ask Developers if they think it is valuable',
      'Assume value because the feature met the Definition of Done'
    ),
    correct: ['b'],
    explanation: 'Meeting the Definition of Done means the work is releasable, not that it created value. Value is validated by inspecting real customer/user outcomes and feedback after delivery.',
    references: [REF_SO_VALUE, REF_SO_EBM]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The Sprint Review should be treated as a strict gate/sign-off meeting where stakeholders formally approve the Increment.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['b'],
    explanation: 'The Sprint Review is a collaborative working session to inspect the outcome and adapt the Product Backlog — not a formal sign-off gate. An Increment may already be released before the Review.',
    references: [REF_GUIDE_REVIEW]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'How does collaborating frequently with customers support agility for the Product Owner?',
    options: opts4(
      'It locks the scope so it cannot change',
      'It shortens feedback loops, enabling faster adaptation of the Product Backlog to real needs',
      'It eliminates the need for Sprints',
      'It transfers ordering authority to customers'
    ),
    correct: ['b'],
    explanation: 'Frequent customer collaboration shortens feedback loops. Faster, evidence-based feedback lets the Product Owner adapt the Product Backlog quickly to changing needs — the essence of agility.',
    references: [REF_SO_STAKE, REF_GUIDE_THEORY]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'Who should attend the Sprint Review?',
    options: opts4(
      'Only the Scrum Master',
      'The Scrum Team and key stakeholders invited by the Product Owner',
      'Only Developers',
      'Only executives'
    ),
    correct: ['b'],
    explanation: 'The Sprint Review involves the Scrum Team and key stakeholders. The Product Owner typically invites stakeholders to collaborate on progress toward the Product Goal and adapt the Product Backlog.',
    references: [REF_GUIDE_REVIEW]
  },

  // ── Empiricism and Agility (10) ──
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What are the three pillars of empiricism in Scrum?',
    options: opts4(
      'Commitment, Courage, Focus',
      'Transparency, Inspection, Adaptation',
      'Planning, Execution, Delivery',
      'Roles, Events, Artifacts'
    ),
    correct: ['b'],
    explanation: 'Scrum\'s empirical process control rests on three pillars: Transparency, Inspection, and Adaptation. The five Scrum Values (Commitment, Focus, Openness, Respect, Courage) support these pillars.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'Inspection in Scrum is most useful when:',
    options: opts4(
      'It happens once per release',
      'Artifacts are transparent, so inspection leads to meaningful adaptation',
      'Only the Scrum Master performs it',
      'It is done without any agreed standards'
    ),
    correct: ['b'],
    explanation: 'Inspection enables adaptation, but inspection without transparency is misleading. The Scrum Guide stresses transparency enables inspection; inspection without it can lead to decisions that diminish value.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE,
    stem: 'Adaptation must occur as soon as:',
    options: opts4(
      'The Sprint ends, regardless of findings',
      'Any aspects of a process or product deviate outside acceptable limits or a more desirable outcome is identified',
      'A stakeholder requests it',
      'The Product Owner approves a change request form'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide states adjustment must be made as soon as possible when aspects deviate outside acceptable limits or the resulting product is unacceptable, to minimize further deviation.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'How does a short Sprint length relate to empiricism and risk?',
    options: opts4(
      'Longer Sprints reduce risk by allowing more planning',
      'Shorter Sprints create more learning cycles and limit risk to a smaller time-boxed effort',
      'Sprint length has no relationship to risk',
      'Risk is eliminated entirely by using Scrum'
    ),
    correct: ['b'],
    explanation: 'Each Sprint may be considered a short project. Shorter Sprints generate more inspect-and-adapt cycles and cap cost/risk at a smaller increment of time and effort.',
    references: [REF_GUIDE_SPRINT]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL Scrum Values that support empiricism.',
    options: opts4(
      'Commitment and Focus',
      'Openness',
      'Respect and Courage',
      'Predictability and Utilization'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The five Scrum Values are Commitment, Focus, Openness, Respect, and Courage. Predictability and utilization are not Scrum Values; living the values builds the trust empiricism needs.',
    references: [REF_GUIDE_VALUES]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Scrum is a complete methodology that prescribes detailed processes for every situation.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['b'],
    explanation: 'Scrum is a lightweight framework, intentionally incomplete. It defines only the parts required to implement Scrum theory; practices are chosen by the team to fit their context.',
    references: [REF_GUIDE_DEF]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Owner hides risky assumptions to avoid alarming stakeholders. Which empiricism pillar is most undermined?',
    options: opts4(
      'Transparency',
      'Velocity',
      'Estimation',
      'Utilization'
    ),
    correct: ['a'],
    explanation: 'Concealing assumptions damages Transparency. Without transparency, inspection is unreliable and adaptation may reduce value or increase risk. Openness and courage support transparency.',
    references: [REF_GUIDE_THEORY, REF_GUIDE_VALUES]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best reflects "agility" for a Product Owner working empirically?',
    options: opts4(
      'Resisting change to protect the plan',
      'Embracing change based on evidence to continuously improve product value',
      'Changing direction randomly every Sprint',
      'Delegating all decisions to stakeholders'
    ),
    correct: ['b'],
    explanation: 'Agility for a Product Owner means responding to evidence and change to maximize value — adapting the Product Backlog and ordering based on learning, not clinging to a fixed plan nor changing chaotically.',
    references: [REF_GUIDE_THEORY, REF_SO_VALUE]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE,
    stem: 'The Increment\'s transparency is most ensured by:',
    options: opts4(
      'A detailed status report',
      'Meeting the Definition of Done so it is usable and its state is clear',
      'A long Sprint Review',
      'Stakeholder sign-off forms'
    ),
    correct: ['b'],
    explanation: 'The Definition of Done creates transparency for the Increment by giving a shared understanding of what "Done" means; work not meeting it cannot be released or presented as an Increment.',
    references: [REF_GUIDE_DOD, REF_GUIDE_INC]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does Scrum produce at least one usable Increment per Sprint?',
    options: opts4(
      'To satisfy a contractual milestone',
      'So progress toward the Product Goal can be empirically inspected and adapted frequently',
      'To keep Developers continuously busy',
      'To avoid holding a Sprint Review'
    ),
    correct: ['b'],
    explanation: 'A usable Increment each Sprint provides concrete evidence of progress toward the Product Goal, enabling empirical inspection and adaptation rather than relying on speculation.',
    references: [REF_GUIDE_INC, REF_GUIDE_THEORY]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Scrum Framework (16) ──
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the Scrum Master accountable for?',
    options: opts4(
      'Managing the Product Backlog',
      'Establishing Scrum as defined in the Scrum Guide and the Scrum Team\'s effectiveness',
      'Assigning tasks to Developers daily',
      'Approving the budget'
    ),
    correct: ['b'],
    explanation: 'The Scrum Master is accountable for establishing Scrum as defined in the Scrum Guide and for the Scrum Team\'s effectiveness, helping everyone understand Scrum theory and practice.',
    references: [REF_GUIDE_SM]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'When does the next Sprint start relative to the previous one?',
    options: opts4(
      'After a one-week buffer',
      'Immediately after the conclusion of the previous Sprint',
      'Only when the Product Owner approves a gap',
      'After all bugs are fixed'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide states a new Sprint starts immediately after the conclusion of the previous Sprint. There are no gaps between Sprints.',
    references: [REF_GUIDE_SPRINT]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'During Sprint Planning, which topic is the Product Owner most responsible for bringing?',
    options: opts4(
      'The technical design of each item',
      'How the product could increase its value and utility this Sprint (the "why")',
      'The Daily Scrum schedule',
      'The Retrospective improvements'
    ),
    correct: ['b'],
    explanation: 'In Sprint Planning, the Product Owner proposes how the product could increase value and utility this Sprint; the team then crafts a Sprint Goal. Developers own the "what is doable" and "how".',
    references: [REF_GUIDE_PLANNING]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the timebox for Sprint Planning for a one-month Sprint?',
    options: opts4(
      'A maximum of four hours',
      'A maximum of eight hours',
      'A maximum of two hours',
      'No timebox is defined'
    ),
    correct: ['b'],
    explanation: 'Sprint Planning is timeboxed to a maximum of eight hours for a one-month Sprint. For shorter Sprints it is usually shorter.',
    references: [REF_GUIDE_PLANNING]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'Can the Product Owner also be one of the Developers on the same Scrum Team?',
    options: opts4(
      'Never under any circumstances',
      'Yes; the Scrum Guide allows it, though accountabilities remain distinct',
      'Only if the Scrum Master approves',
      'Only in teams larger than 10'
    ),
    correct: ['b'],
    explanation: 'The 2020 Scrum Guide removed sub-team distinctions; one person may hold more than one accountability. However, the Product Owner accountability for value remains distinct and must still be fulfilled.',
    references: [REF_GUIDE_TEAM]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The Daily Scrum is timeboxed to 15 minutes for the Developers.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The Daily Scrum is a 15-minute event for the Developers of the Scrum Team, held at the same time and place each working day of the Sprint.',
    references: [REF_GUIDE_DAILY]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'Recommended total Scrum Team size in the 2020 Scrum Guide is:',
    options: opts4(
      '7 plus or minus 2 Developers only',
      'Typically 10 or fewer people',
      'Exactly 9 people',
      'No guidance is given'
    ),
    correct: ['b'],
    explanation: 'The 2020 Scrum Guide says the Scrum Team is typically 10 or fewer people; smaller teams communicate better and are more productive.',
    references: [REF_GUIDE_TEAM]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL accountabilities that are part of the one Scrum Team.',
    options: opts4(
      'Product Owner',
      'Scrum Master',
      'Developers',
      'Project Manager'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The Scrum Team consists of one Product Owner, one Scrum Master, and Developers. There is no Project Manager accountability in Scrum.',
    references: [REF_GUIDE_TEAM]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of the Sprint Retrospective?',
    options: opts4(
      'To demonstrate the Increment to stakeholders',
      'To plan ways to increase quality and effectiveness',
      'To re-estimate the Product Backlog',
      'To assign blame for missed work'
    ),
    correct: ['b'],
    explanation: 'The Sprint Retrospective\'s purpose is to plan ways to increase quality and effectiveness. The Scrum Team inspects how the last Sprint went and identifies improvements to enact.',
    references: [REF_GUIDE_RETRO]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which event concludes the Sprint?',
    options: opts4(
      'Sprint Review',
      'Sprint Retrospective',
      'Daily Scrum',
      'Sprint Planning'
    ),
    correct: ['b'],
    explanation: 'The Sprint Retrospective concludes the Sprint. It is the last event, occurring after the Sprint Review and before the next Sprint Planning.',
    references: [REF_GUIDE_RETRO, REF_GUIDE_SPRINT]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'A manager wants the Scrum Master to assign tasks to Developers and report individual performance. The correct stance is:',
    options: opts4(
      'Comply, since the manager is senior',
      'The Developers self-manage; the Scrum Master serves the team and organization, not as a task assigner',
      'The Product Owner should assign tasks instead',
      'Tasks must be assigned by stakeholders'
    ),
    correct: ['b'],
    explanation: 'Developers are self-managing: they decide who does what and how. The Scrum Master is a true leader who serves, removing impediments and coaching — not assigning tasks or policing individuals.',
    references: [REF_GUIDE_DEV, REF_GUIDE_SM]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Who is accountable for the Increment meeting the Definition of Done?',
    options: opts4(
      'The Product Owner',
      'The Scrum Master',
      'The Developers',
      'The stakeholders'
    ),
    correct: ['c'],
    explanation: 'The Developers are accountable for instilling quality by adhering to the Definition of Done. Work that does not meet it is not part of an Increment.',
    references: [REF_GUIDE_DEV, REF_GUIDE_DOD]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'How many Sprint Goals exist for a single Sprint?',
    options: opts4(
      'As many as there are Developers',
      'Exactly one — a single objective for the Sprint',
      'One per Product Backlog item',
      'None; Sprint Goals are optional and never used'
    ),
    correct: ['b'],
    explanation: 'The Sprint Goal is the single objective for the Sprint. Although it is a commitment, it provides flexibility about the exact work to achieve it.',
    references: [REF_GUIDE_SGOAL]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'During the Sprint, scope is clarified and renegotiated. With whom do the Developers negotiate?',
    options: opts4(
      'With the stakeholders directly',
      'With the Product Owner, as more is learned, without endangering the Sprint Goal',
      'With the Scrum Master only',
      'With senior management'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide states that as the Developers learn more, scope may be clarified and renegotiated with the Product Owner — provided the Sprint Goal is not endangered.',
    references: [REF_GUIDE_SPRINT, REF_GUIDE_SB]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: All Scrum events are held during the Sprint, and the Sprint is itself a container for the other events.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The Sprint is a container for all other events (Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective). Each enables transparency, inspection, and adaptation.',
    references: [REF_GUIDE_EVENTS, REF_GUIDE_SPRINT]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'What does it mean that Scrum is "lightweight"?',
    options: opts4(
      'It requires minimal tooling',
      'Its framework is purposefully minimal, defining only what is needed to implement Scrum theory',
      'It only works for small features',
      'It eliminates the need for a Product Owner'
    ),
    correct: ['b'],
    explanation: 'Scrum is lightweight: the framework is purposefully incomplete, defining only the parts required to implement Scrum theory. The rest is generated by the team using their judgment.',
    references: [REF_GUIDE_DEF]
  },

  // ── Product Value and Vision (13) ──
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'How many Product Goals does a Scrum Team focus on at a time?',
    options: opts4(
      'As many as stakeholders request',
      'One; the team must fulfill or abandon one before taking the next',
      'One per Sprint',
      'There is no concept of a Product Goal'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide states a Scrum Team must focus on one Product Goal at a time; the objective must be fulfilled or abandoned before the team takes on the next Product Goal.',
    references: [REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'The Product Owner faces a "build everything" stakeholder. Which framing best maximizes value?',
    options: opts4(
      'Output maximization — ship as many features as possible',
      'Outcome optimization — pursue the smallest set of work that achieves desired customer/business outcomes',
      'Utilization maximization — keep the team fully busy',
      'Documentation maximization — write detailed specs first'
    ),
    correct: ['b'],
    explanation: 'Scrum.org emphasizes optimizing outcomes, not output. The Product Owner maximizes value by pursuing the work that achieves desired outcomes, frequently meaning building less.',
    references: [REF_SO_VALUE, REF_SO_ROI]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'A product vision primarily provides:',
    options: opts4(
      'A detailed work-breakdown structure',
      'Direction and shared purpose that informs the Product Goal and ordering',
      'A binding contract for scope',
      'A replacement for the Sprint Review'
    ),
    correct: ['b'],
    explanation: 'A product vision provides direction and a shared sense of purpose. It informs the Product Goal and helps the Product Owner make consistent, value-oriented ordering decisions.',
    references: [REF_SO_VISION]
  },
  {
    domain: VALUE, difficulty: 4, type: QType.SINGLE,
    stem: 'Using Evidence-Based Management, which is the BEST way for a Product Owner to justify continued investment in a product?',
    options: opts4(
      'Show how many features were shipped last quarter',
      'Show measured changes in value (e.g., customer outcomes, time-to-market) versus strategic goals',
      'Show the team\'s velocity trend only',
      'Show that the Product Backlog grew'
    ),
    correct: ['b'],
    explanation: 'EBM focuses on measuring actual value and using empirical evidence to guide investment. Justification comes from measured value change toward strategic goals, not output counts or velocity.',
    references: [REF_SO_EBM, REF_SO_ROI]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Maximizing value can sometimes mean deciding NOT to build a requested feature.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'Maximizing value is about outcomes, not satisfying every request. Declining or deferring low-value work to focus on higher-value outcomes is a legitimate Product Owner decision.',
    references: [REF_SO_VALUE, REF_SO_ROI]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'How does early and frequent delivery relate to ROI for the Product Owner?',
    options: opts4(
      'It delays value until the final release',
      'It can accelerate value realization and provides feedback to redirect investment',
      'It has no effect on ROI',
      'It only matters for internal products'
    ),
    correct: ['b'],
    explanation: 'Delivering value early and frequently can bring forward returns and provides empirical feedback, allowing the Product Owner to redirect investment toward higher-value opportunities.',
    references: [REF_SO_ROI, REF_GUIDE_INC]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the commitment that gives the Product Backlog focus toward a future state of the product?',
    options: opts4(
      'Sprint Goal',
      'Product Goal',
      'Definition of Done',
      'Release Burndown'
    ),
    correct: ['b'],
    explanation: 'The Product Goal is the Product Backlog\'s commitment and describes a future state of the product, giving the backlog focus and the team a long-term objective.',
    references: [REF_GUIDE_GOAL, REF_GUIDE_PB]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that align with a Product Owner maximizing value.',
    options: opts4(
      'Ordering the Product Backlog by value, risk, and dependencies',
      'Validating outcomes with customers after delivery',
      'Saying no to low-value work to protect focus',
      'Maximizing the number of items in progress'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Value maximization involves value/risk-based ordering, validating outcomes, and protecting focus by declining low-value work. Maximizing work in progress harms flow and value delivery.',
    references: [REF_SO_VALUE, REF_GUIDE_PB]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Goal should be:',
    options: opts4(
      'A list of tasks for the next Sprint',
      'A meaningful objective describing a future product state the team can plan toward',
      'The same as the Definition of Done',
      'Re-created every Daily Scrum'
    ),
    correct: ['b'],
    explanation: 'The Product Goal is a long-term objective describing a future state of the product. It is in the Product Backlog, and the rest of the backlog emerges to define what will fulfill it.',
    references: [REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes "value" from a Scrum.org Product Owner perspective?',
    options: opts4(
      'The cost of building a feature',
      'The benefit/impact realized by customers and the organization from the product',
      'The total story points completed',
      'The number of stakeholders consulted'
    ),
    correct: ['b'],
    explanation: 'Value is the benefit and impact realized by customers and the organization. It is not measured by cost, effort, or output counts; the Product Owner optimizes for realized value.',
    references: [REF_SO_VALUE, REF_SO_ROI]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A long-running product has an outdated vision causing scattered priorities. The Product Owner should:',
    options: opts4(
      'Ignore the vision and order by stakeholder seniority',
      'Revisit and clarify the vision/Product Goal to realign Product Backlog ordering toward value',
      'Freeze the Product Backlog',
      'Delegate vision ownership to Developers'
    ),
    correct: ['b'],
    explanation: 'A clear, current vision and Product Goal provide direction. Revisiting them realigns ordering decisions, restoring focus on value rather than ad-hoc, seniority-driven priorities.',
    references: [REF_SO_VISION, REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Why is connecting the Product Goal to business strategy important?',
    options: opts4(
      'It is not important; the Product Goal is purely technical',
      'It ensures product investment advances the organization\'s strategic outcomes and value',
      'It lets the team skip refinement',
      'It transfers accountability to executives'
    ),
    correct: ['b'],
    explanation: 'Aligning the Product Goal with business strategy ensures the product\'s direction advances strategic outcomes, helping the Product Owner justify and maximize value-driven investment.',
    references: [REF_SO_EBM, REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about value and the Definition of Done is correct?',
    options: opts4(
      'Meeting the Definition of Done proves the feature created value',
      'The Definition of Done makes work releasable; value is confirmed by customer/business outcomes',
      'The Definition of Done replaces the Product Goal',
      'Value is irrelevant once Done is met'
    ),
    correct: ['b'],
    explanation: 'The Definition of Done ensures quality and releasability (transparency of the Increment). Whether value was created is a separate question answered by inspecting real outcomes.',
    references: [REF_GUIDE_DOD, REF_SO_VALUE]
  },

  // ── Product Backlog Management (16) ──
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Product Backlog is best described as:',
    options: opts4(
      'A fixed contract of requirements',
      'An emergent, ordered list of what is needed to improve the product',
      'A list owned by the Scrum Master',
      'A document frozen at project start'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide defines the Product Backlog as an emergent, ordered list of what is needed to improve the product. It is the single source of work for the Scrum Team.',
    references: [REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'Refinement activities are best done:',
    options: opts4(
      'In one big meeting before the project starts',
      'Continuously, as an ongoing collaborative activity throughout the Sprint',
      'Only by the Product Owner in isolation',
      'Only during the Sprint Review'
    ),
    correct: ['b'],
    explanation: 'Refinement is an ongoing activity to add detail, estimates, and order to items. It is done collaboratively with the Developers; the Scrum Guide does not prescribe it as a separate event.',
    references: [REF_SO_REFINE, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'Who is responsible for sizing Product Backlog items?',
    options: opts4(
      'The Product Owner',
      'The Developers who will do the work',
      'The Scrum Master',
      'The stakeholders'
    ),
    correct: ['b'],
    explanation: 'The Developers are responsible for sizing/estimation because they perform the work. The Product Owner may influence sizing by helping them understand trade-offs.',
    references: [REF_GUIDE_PB, REF_GUIDE_DEV]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'Two Scrum Teams work on the same product. How should backlogs be handled?',
    options: opts4(
      'Each team keeps its own separate Product Backlog and Product Goal',
      'One shared Product Backlog and one shared Product Goal for the product',
      'The Scrum Masters merge backlogs weekly',
      'Stakeholders maintain a master list outside Scrum'
    ),
    correct: ['b'],
    explanation: 'A product has one Product Backlog and one Product Goal. If multiple Scrum Teams work on the same product, they share that single Product Backlog and Product Goal.',
    references: [REF_GUIDE_PB, REF_SO_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The Product Backlog can change at any time, including during a Sprint.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The Product Backlog is dynamic and may be updated at any time. However, the current Sprint Backlog is only changed by the Developers without endangering the Sprint Goal.',
    references: [REF_GUIDE_PB, REF_GUIDE_SB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Product Owner action best supports Product Backlog transparency?',
    options: opts4(
      'Keeping ordering rationale secret to retain control',
      'Making the backlog visible and ensuring shared understanding of items and order',
      'Recording items only verbally',
      'Letting each Developer maintain a personal copy'
    ),
    correct: ['b'],
    explanation: 'Transparency requires the backlog to be visible and consistently understood by those who depend on it, enabling reliable inspection and adaptation.',
    references: [REF_GUIDE_PB, REF_GUIDE_THEORY]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid attributes a Product Backlog item may carry.',
    options: opts4(
      'A description',
      'Order',
      'Size',
      'The exact wage of the Developer who will implement it'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Product Backlog items often carry attributes such as description, order, size, and value. Developer wages are not Product Backlog item attributes.',
    references: [REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'What makes a Product Backlog item "ready" for selection in Sprint Planning?',
    options: opts4(
      'It has been in the backlog longest',
      'It is refined enough that the Scrum Team can Done it within one Sprint',
      'A stakeholder personally approved it',
      'It has the most story points'
    ),
    correct: ['b'],
    explanation: 'Items refined to the point that the Scrum Team can complete them (Done) within one Sprint are considered ready for selection during Sprint Planning.',
    references: [REF_GUIDE_PB, REF_SO_REFINE]
  },
  {
    domain: BACKLOG, difficulty: 4, type: QType.SINGLE,
    stem: 'A Product Owner is overwhelmed and lets Developers pick whatever items they like each Sprint, ignoring ordering. The main risk is:',
    options: opts4(
      'Developers will be less busy',
      'The product may not progress toward the highest value or the Product Goal',
      'The Sprint will be shorter',
      'The Scrum Master loses authority'
    ),
    correct: ['b'],
    explanation: 'Ordering by value is how the Product Owner steers the product toward the Product Goal. Ignoring it risks low-value work and slow progress toward the Product Goal.',
    references: [REF_GUIDE_PO, REF_GUIDE_GOAL]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'The single source of work for the Scrum Team is:',
    options: opts4(
      'The Sprint Backlog',
      'The Product Backlog',
      'The Definition of Done',
      'The stakeholder request queue'
    ),
    correct: ['b'],
    explanation: 'The Product Backlog is the single source of work undertaken by the Scrum Team. The Sprint Backlog is the subset selected for the current Sprint plus the plan and Sprint Goal.',
    references: [REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'How should a Product Owner treat a large, vague item near the top of the backlog?',
    options: opts4(
      'Leave it vague and let Developers guess in the Sprint',
      'Refine it: break it into smaller, clearer items so it can be done within a Sprint',
      'Move it to a separate backlog',
      'Delete it because it is too big'
    ),
    correct: ['b'],
    explanation: 'Higher-ordered items should be clearer and smaller. Refinement breaks large items into smaller, more precise ones so they can be completed within a Sprint, supporting transparency.',
    references: [REF_SO_REFINE, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'Who is accountable for clearly communicating Product Backlog items?',
    options: opts4(
      'The Scrum Master',
      'The Product Owner',
      'The Developers',
      'The stakeholders'
    ),
    correct: ['b'],
    explanation: 'The Product Owner is accountable for creating and clearly communicating Product Backlog items and ordering them, ensuring the Product Backlog is transparent and understood.',
    references: [REF_GUIDE_PO]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A separate "technical backlog" maintained only by Developers, outside the Product Backlog, is consistent with Scrum.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['b'],
    explanation: 'There is a single Product Backlog as the single source of work. Technical work belongs in that one backlog (ordered by the Product Owner), not a hidden parallel list.',
    references: [REF_GUIDE_PB, REF_SO_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'During refinement, the Product Owner\'s main contribution is to:',
    options: opts4(
      'Estimate items for the Developers',
      'Clarify intent, value, and priority so Developers can break items down effectively',
      'Decide the technical solution',
      'Schedule the Daily Scrum'
    ),
    correct: ['b'],
    explanation: 'The Product Owner clarifies the intent, value, and priority of items so the Developers can refine and size them. Estimation and technical solutions remain with the Developers.',
    references: [REF_SO_REFINE, REF_GUIDE_PO]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is true about the Product Backlog and the Product Goal?',
    options: opts4(
      'The Product Goal is separate and unrelated to the Product Backlog',
      'The Product Goal is in the Product Backlog; the backlog emerges to define what fulfills it',
      'Each Product Backlog item is its own Product Goal',
      'The Product Goal replaces the need for ordering'
    ),
    correct: ['b'],
    explanation: 'The Product Goal is in the Product Backlog and is its commitment. The rest of the Product Backlog emerges to define what will fulfill the Product Goal.',
    references: [REF_GUIDE_GOAL, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder insists their item be implemented next despite low value. The best Product Owner approach is to:',
    options: opts4(
      'Reorder it to the top to avoid conflict',
      'Make the value/cost trade-offs transparent and order based on maximizing product value',
      'Remove the item silently',
      'Ask Developers to decide the order'
    ),
    correct: ['b'],
    explanation: 'The Product Owner orders for maximum value, using transparency about trade-offs. Caving to pressure without value justification undermines the Product Owner accountability.',
    references: [REF_GUIDE_PO, REF_SO_ROI]
  },

  // ── Stakeholders and Customers (10) ──
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Product Owner represents the needs of stakeholders primarily through:',
    options: opts4(
      'A separate stakeholder backlog',
      'The single Product Backlog and its ordering',
      'Private side agreements',
      'The Definition of Done'
    ),
    correct: ['b'],
    explanation: 'The Product Owner may represent the needs of many stakeholders in the Product Backlog. Stakeholder needs are reflected through backlog content and ordering, not separate lists.',
    references: [REF_GUIDE_PO, REF_SO_STAKE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is the most valuable outcome of inviting the right stakeholders to the Sprint Review?',
    options: opts4(
      'Formal approval to proceed',
      'Collaborative feedback that informs adaptation of the Product Backlog',
      'A chance to assign blame for delays',
      'Reducing the number of Sprints needed'
    ),
    correct: ['b'],
    explanation: 'The Sprint Review is a working session to inspect the outcome and collaborate on next steps. Stakeholder feedback there directly informs adaptation of the Product Backlog.',
    references: [REF_GUIDE_REVIEW, REF_SO_STAKE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Owner rarely talks to actual users and relies only on internal opinions. The main empirical risk is:',
    options: opts4(
      'Sprints will be too short',
      'Decisions rest on unvalidated assumptions, risking low-value outcomes',
      'The Scrum Master will be overloaded',
      'Velocity will increase too fast'
    ),
    correct: ['b'],
    explanation: 'Without real user/customer feedback, the Product Owner makes value decisions on unvalidated assumptions. Empiricism requires inspecting real outcomes to reduce the risk of building the wrong thing.',
    references: [REF_SO_STAKE, REF_SO_VALUE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'Stakeholders relate to the Sprint Review by:',
    options: opts4(
      'Running the event instead of the Scrum Team',
      'Collaborating with the Scrum Team on progress and what to do next',
      'Being excluded to protect the team',
      'Approving each Product Backlog item'
    ),
    correct: ['b'],
    explanation: 'Key stakeholders collaborate with the Scrum Team during the Sprint Review on progress toward the Product Goal and adjustments to the Product Backlog. They do not run the event.',
    references: [REF_GUIDE_REVIEW]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate ways a Product Owner builds trust with stakeholders.',
    options: opts4(
      'Transparent Product Backlog and clear ordering rationale',
      'Honest communication about trade-offs and uncertainty',
      'Using evidence of outcomes to inform decisions',
      'Privately promising conflicting deadlines to each stakeholder'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Trust grows from transparency, honesty about trade-offs, and evidence-based decisions. Conflicting private promises destroy transparency and trust and harm value delivery.',
    references: [REF_SO_STAKE, REF_GUIDE_VALUES]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Customers and users are sources of empirical feedback that the Product Owner uses to adapt the Product Backlog.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'Customer and user feedback is empirical evidence about value. The Product Owner uses it to inspect outcomes and adapt the Product Backlog and Product Goal accordingly.',
    references: [REF_SO_STAKE, REF_SO_VALUE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A senior executive wants to dictate Product Backlog order directly. The healthiest organizational stance is:',
    options: opts4(
      'Executives may override the Product Owner anytime',
      'Decisions are respected; stakeholders influence by convincing the Product Owner, who remains accountable',
      'The Scrum Master arbitrates ordering disputes',
      'Developers vote to resolve the conflict'
    ),
    correct: ['b'],
    explanation: 'For Product Owner accountability to function, the organization must respect their decisions. Stakeholders, including executives, influence ordering by convincing the Product Owner.',
    references: [REF_GUIDE_PO]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'Frequent stakeholder/customer collaboration most directly improves:',
    options: opts4(
      'Developer utilization',
      'The speed and quality of empirical feedback used to adapt the product',
      'The length of the Sprint',
      'The size of the Scrum Team'
    ),
    correct: ['b'],
    explanation: 'Regular collaboration shortens and enriches feedback loops, improving the empirical evidence the Product Owner uses to adapt the Product Backlog toward higher value.',
    references: [REF_SO_STAKE, REF_GUIDE_THEORY]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the Product Owner\'s relationship with stakeholders?',
    options: opts4(
      'The Product Owner obeys whichever stakeholder is most senior',
      'The Product Owner collaborates with stakeholders but makes the final value-based ordering decisions',
      'Stakeholders own the Product Backlog jointly',
      'The Product Owner avoids stakeholders to stay objective'
    ),
    correct: ['b'],
    explanation: 'The Product Owner collaborates closely with stakeholders to understand needs but is the single accountable person who makes value-based ordering decisions for one Product Backlog.',
    references: [REF_GUIDE_PO, REF_SO_STAKE]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder requests a feature; after release, usage data shows little adoption. The Product Owner should:',
    options: opts4(
      'Ignore the data to avoid embarrassing the stakeholder',
      'Share the evidence transparently and use it to re-decide ordering and investment',
      'Immediately delete the feature without discussion',
      'Build more of the same feature regardless'
    ),
    correct: ['b'],
    explanation: 'Empiricism requires acting on real evidence transparently. Low adoption is feedback the Product Owner uses to re-evaluate ordering and future investment, in collaboration with stakeholders.',
    references: [REF_SO_EBM, REF_SO_STAKE]
  },

  // ── Empiricism and Agility (10) ──
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which pillar of empiricism enables the other two to be effective?',
    options: opts4(
      'Adaptation',
      'Transparency',
      'Inspection',
      'Estimation'
    ),
    correct: ['b'],
    explanation: 'Transparency underpins empiricism: inspection without transparency is misleading, and adaptation based on a non-transparent state can reduce value or increase risk.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'Lean thinking, a foundation of Scrum, primarily emphasizes:',
    options: opts4(
      'Maximizing documentation',
      'Reducing waste and focusing on the essentials',
      'Increasing the number of meetings',
      'Locking scope early'
    ),
    correct: ['b'],
    explanation: 'The 2020 Scrum Guide states Scrum is founded on empiricism and lean thinking; lean thinking reduces waste and focuses on the essentials.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE,
    stem: 'Inspection should be performed:',
    options: opts4(
      'Only at the end of the project',
      'Frequently and diligently, but not so often that it impedes the work',
      'Only by the Product Owner',
      'Never during a Sprint'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide advises inspection be done frequently and diligently to detect undesirable variances, but not so frequently that inspection gets in the way of the work.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Scrum Values.',
    options: opts4(
      'They are Commitment, Focus, Openness, Respect, and Courage',
      'Living them builds trust that supports empiricism',
      'They are optional decorations with no role in Scrum',
      'They support the three empirical pillars'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'The five Scrum Values are Commitment, Focus, Openness, Respect, Courage. Successful use of Scrum depends on living them; they build the trust empiricism requires.',
    references: [REF_GUIDE_VALUES]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Adaptation should be delayed until the next Sprint Planning even if a serious deviation is detected today.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['b'],
    explanation: 'The Scrum Guide says adjustment must be made as soon as possible to minimize further deviation. Waiting needlessly increases risk and waste.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'For a Product Owner, "agility" most accurately means:',
    options: opts4(
      'Following the original plan no matter what',
      'Adapting product decisions based on empirical evidence to keep maximizing value',
      'Changing the Product Goal every Sprint',
      'Avoiding all planning'
    ),
    correct: ['b'],
    explanation: 'Agility is the ability to adapt based on evidence. The Product Owner continually adjusts the Product Backlog and ordering as learning occurs to keep maximizing value.',
    references: [REF_GUIDE_THEORY, REF_SO_VALUE]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'Why does Scrum emphasize a "Done", usable Increment each Sprint for empiricism?',
    options: opts4(
      'It guarantees the product is bug-free',
      'It provides a concrete, transparent basis to inspect progress and adapt',
      'It removes the need for the Product Owner',
      'It shortens the Sprint automatically'
    ),
    correct: ['b'],
    explanation: 'A usable, Done Increment is concrete evidence. It makes progress transparent so the Scrum Team and stakeholders can inspect toward the Product Goal and adapt accordingly.',
    references: [REF_GUIDE_INC, REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is NOT one of the five Scrum Values?',
    options: opts4(
      'Focus',
      'Respect',
      'Predictability',
      'Courage'
    ),
    correct: ['c'],
    explanation: 'The five Scrum Values are Commitment, Focus, Openness, Respect, and Courage. Predictability is a benefit of empiricism, not a Scrum Value.',
    references: [REF_GUIDE_VALUES]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'A team produces an Increment but skips parts of the Definition of Done to "go faster". The empirical consequence is:',
    options: opts4(
      'Greater transparency',
      'Reduced transparency — the true state of the product is hidden, undermining inspection',
      'No effect on empiricism',
      'Faster value realization guaranteed'
    ),
    correct: ['b'],
    explanation: 'Skipping the Definition of Done hides undone work, reducing transparency. Inspection then operates on a false state, leading to poor adaptation and accumulated risk.',
    references: [REF_GUIDE_DOD, REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE,
    stem: 'Empiricism asserts that knowledge comes from:',
    options: opts4(
      'Detailed up-front analysis',
      'Experience and making decisions based on what is observed',
      'The most senior stakeholder\'s opinion',
      'Following a fixed methodology'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide states empiricism asserts that knowledge comes from experience and that decisions are made based on what is observed, supported by transparency, inspection, and adaptation.',
    references: [REF_GUIDE_THEORY]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Scrum Framework (16) ──
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What are the three artifacts in the 2020 Scrum Guide?',
    options: opts4(
      'Product Backlog, Sprint Backlog, Increment',
      'Product Backlog, Burndown Chart, Release Plan',
      'Product Goal, Sprint Goal, Definition of Done',
      'Vision, Roadmap, Backlog'
    ),
    correct: ['a'],
    explanation: 'The three Scrum artifacts are the Product Backlog, the Sprint Backlog, and the Increment. Each has a commitment: Product Goal, Sprint Goal, and Definition of Done respectively.',
    references: [REF_GUIDE_ARTIFACTS]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artifact\'s commitment is the Definition of Done?',
    options: opts4(
      'Product Backlog',
      'Sprint Backlog',
      'Increment',
      'Product Goal'
    ),
    correct: ['c'],
    explanation: 'The Increment\'s commitment is the Definition of Done. It provides a formal description of the state of the Increment when it meets the required quality measures.',
    references: [REF_GUIDE_INC, REF_GUIDE_DOD]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'Multiple Increments may be created within a Sprint. When may an Increment be delivered to stakeholders?',
    options: opts4(
      'Only at the Sprint Review',
      'As soon as it meets the Definition of Done; delivery should not wait for the Sprint Review',
      'Only after the Sprint Retrospective',
      'Only at the end of a release'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide says an Increment may be delivered to stakeholders prior to the end of the Sprint; the Sprint Review should never be considered a gate to releasing value.',
    references: [REF_GUIDE_INC, REF_GUIDE_REVIEW]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Who creates the Sprint Backlog?',
    options: opts4(
      'The Product Owner',
      'The Developers',
      'The Scrum Master',
      'The stakeholders'
    ),
    correct: ['b'],
    explanation: 'The Sprint Backlog is composed of the Sprint Goal (why), the selected Product Backlog items (what), and an actionable plan (how). It is created by and for the Developers.',
    references: [REF_GUIDE_SB]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'What are the three topics addressed in Sprint Planning?',
    options: opts4(
      'Why is the Sprint valuable; what can be Done; how will the work be done',
      'Who, what, when',
      'Vision, roadmap, release',
      'Inspect, adapt, transparency'
    ),
    correct: ['a'],
    explanation: 'Sprint Planning addresses: Topic One — Why is this Sprint valuable? Topic Two — What can be Done this Sprint? Topic Three — How will the chosen work get done?',
    references: [REF_GUIDE_PLANNING]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The Scrum Master is a true leader who serves the Scrum Team and the larger organization.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The Scrum Guide describes the Scrum Master as a true leader who serves the Scrum Team and the larger organization, helping everyone understand and apply Scrum.',
    references: [REF_GUIDE_SM]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'The Definition of Done is created by whom when not provided by organizational standards?',
    options: opts4(
      'The Product Owner alone',
      'The Scrum Team (the Developers must conform to it)',
      'The stakeholders',
      'The Scrum Master alone'
    ),
    correct: ['b'],
    explanation: 'If the Definition of Done is not an organizational standard, the Scrum Team must create one appropriate for the product; the Developers are required to conform to it.',
    references: [REF_GUIDE_DOD]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that correctly pair a Scrum artifact with its commitment.',
    options: opts4(
      'Product Backlog → Product Goal',
      'Sprint Backlog → Sprint Goal',
      'Increment → Definition of Done',
      'Product Backlog → Definition of Done'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Each artifact contains a commitment: Product Backlog → Product Goal; Sprint Backlog → Sprint Goal; Increment → Definition of Done. These commitments reinforce empiricism and focus.',
    references: [REF_GUIDE_ARTIFACTS]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'The Sprint Goal is created during which event?',
    options: opts4(
      'Sprint Review',
      'Sprint Planning',
      'Daily Scrum',
      'Sprint Retrospective'
    ),
    correct: ['b'],
    explanation: 'The Sprint Goal is created during Sprint Planning and then added to the Sprint Backlog. It is the single objective for the Sprint.',
    references: [REF_GUIDE_PLANNING, REF_GUIDE_SGOAL]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'Who participates in the Sprint Retrospective?',
    options: opts4(
      'Only the Scrum Master',
      'The Scrum Team',
      'Only the Developers',
      'The Scrum Team plus all stakeholders'
    ),
    correct: ['b'],
    explanation: 'The Sprint Retrospective is for the Scrum Team (Product Owner, Scrum Master, Developers) to inspect and plan improvements. Stakeholders are not part of it.',
    references: [REF_GUIDE_RETRO, REF_GUIDE_TEAM]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'The Product Owner is on vacation during Sprint Planning. What is the best handling per Scrum?',
    options: opts4(
      'Skip Sprint Planning entirely',
      'The Product Owner remains accountable; they should ensure their input/representation so planning can proceed effectively',
      'The Scrum Master becomes the Product Owner permanently',
      'Developers set the Product Backlog order themselves'
    ),
    correct: ['b'],
    explanation: 'The Product Owner accountability does not pause for absence. They must ensure their priorities and value input are represented (e.g., via preparation/delegate) so Sprint Planning can be effective.',
    references: [REF_GUIDE_PO, REF_GUIDE_PLANNING]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the Increment?',
    options: opts4(
      'A status report of the Sprint',
      'A concrete stepping stone toward the Product Goal; each Increment is additive and verified to work',
      'The Sprint Backlog',
      'A list of remaining tasks'
    ),
    correct: ['b'],
    explanation: 'An Increment is a concrete stepping stone toward the Product Goal. Each Increment is additive to prior Increments and thoroughly verified, ensuring all Increments work together.',
    references: [REF_GUIDE_INC]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about the Sprint length and predictability is correct?',
    options: opts4(
      'Variable Sprint lengths improve predictability',
      'Fixed-length Sprints ensure inspection and adaptation at consistent cadence, improving predictability',
      'Sprint length is irrelevant to predictability',
      'Only Sprints over one month are predictable'
    ),
    correct: ['b'],
    explanation: 'Sprints are fixed-length events of one month or less to create consistency. A regular cadence of inspection and adaptation improves predictability and limits risk.',
    references: [REF_GUIDE_SPRINT]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: The 2020 Scrum Guide describes the Scrum Team as self-managing, choosing who does the work, how, and when within the Sprint.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The 2020 Scrum Guide says Scrum Teams are cross-functional and self-managing — they internally decide who does what, when, and how.',
    references: [REF_GUIDE_TEAM]
  },
  {
    domain: FRAMEWORK, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Scrum Master serves the organization by:',
    options: opts4(
      'Writing the Product Backlog',
      'Leading and coaching the organization in its Scrum adoption and removing barriers',
      'Approving budgets',
      'Assigning work to teams'
    ),
    correct: ['b'],
    explanation: 'The Scrum Master serves the organization by leading and coaching Scrum adoption, planning and advising implementations, and helping remove barriers between stakeholders and Scrum Teams.',
    references: [REF_GUIDE_SM]
  },
  {
    domain: FRAMEWORK, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is true about commitments and their artifacts?',
    options: opts4(
      'Commitments are optional add-ons with no purpose',
      'Commitments exist to reinforce empiricism and the Scrum Values for the Scrum Team',
      'Only the Product Owner uses commitments',
      'Commitments replace the Scrum events'
    ),
    correct: ['b'],
    explanation: 'The 2020 Scrum Guide introduced commitments (Product Goal, Sprint Goal, Definition of Done) to provide focus and measurable progress, reinforcing empiricism and the Scrum Values.',
    references: [REF_GUIDE_ARTIFACTS]
  },

  // ── Product Value and Vision (13) ──
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Product Owner maximizes value by focusing the product on:',
    options: opts4(
      'Producing the most features possible',
      'The outcomes that matter most to customers and the business, toward the Product Goal',
      'Keeping every stakeholder equally happy',
      'Minimizing Developer idle time'
    ),
    correct: ['b'],
    explanation: 'Maximizing value means focusing on the outcomes that matter most to customers and the organization, advancing toward the Product Goal — not maximizing output or utilization.',
    references: [REF_SO_VALUE, REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which question best reflects an outcome/value orientation for a Product Owner?',
    options: opts4(
      '"How many story points did we complete?"',
      '"Did this change improve the customer/business outcome we targeted?"',
      '"Were all Developers fully utilized?"',
      '"How many items are in the Product Backlog?"'
    ),
    correct: ['b'],
    explanation: 'Value orientation asks whether targeted outcomes improved. Story points, utilization, and backlog size are output/activity measures, not evidence of value.',
    references: [REF_SO_VALUE, REF_SO_EBM]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A product vision and Product Goal differ in that:',
    options: opts4(
      'They are identical',
      'The vision is the broad aspirational direction; the Product Goal is a specific future state the team progresses toward',
      'The Product Goal is broader than the vision',
      'Neither relates to the Product Backlog'
    ),
    correct: ['b'],
    explanation: 'A vision provides broad aspirational direction; the Product Goal (per the Scrum Guide) is a concrete future state of the product and the Product Backlog\'s commitment the team works toward.',
    references: [REF_SO_VISION, REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 4, type: QType.SINGLE,
    stem: 'A Product Owner must choose between two road options under uncertainty. The most empirical, value-driven approach is to:',
    options: opts4(
      'Commit fully to one option for a year without feedback',
      'Deliver a small Increment to test the riskiest value assumption and use evidence to decide',
      'Ask the Scrum Master to choose',
      'Pick the option requiring the most work'
    ),
    correct: ['b'],
    explanation: 'Empiricism favors small experiments to validate the riskiest assumptions early. Evidence from a real Increment informs the higher-value direction and reduces investment risk.',
    references: [REF_SO_EBM, REF_GUIDE_THEORY]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: ROI for a Product Owner can improve by delivering value earlier and reducing investment in low-value work.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'Earlier value delivery brings returns forward, and cutting low-value work reduces wasted investment — both improve ROI, consistent with Scrum.org\'s value guidance.',
    references: [REF_SO_ROI]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'When a Product Goal is achieved, the Scrum Team should:',
    options: opts4(
      'Stop using Scrum',
      'Define the next Product Goal to continue maximizing product value',
      'Delete the Product Backlog permanently',
      'Disband immediately'
    ),
    correct: ['b'],
    explanation: 'A Product Goal is fulfilled or abandoned, then the team focuses on the next one. As long as the product exists and should improve, there is a Product Backlog and a guiding Product Goal.',
    references: [REF_GUIDE_GOAL, REF_GUIDE_PB]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that a strong product vision provides.',
    options: opts4(
      'A shared sense of direction and purpose',
      'Context for prioritization and Product Goal definition',
      'Alignment of stakeholders and the Scrum Team',
      'A fixed, unchangeable scope contract'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A vision provides direction, prioritization context, and alignment. It is not a fixed scope contract — scope adapts empirically while the vision provides stable direction.',
    references: [REF_SO_VISION]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST description of the Product Owner and business strategy?',
    options: opts4(
      'The Product Owner ignores business strategy and only takes orders',
      'The Product Owner connects product decisions to business strategy to maximize value',
      'Business strategy is the Scrum Master\'s job',
      'Strategy is irrelevant once a Product Backlog exists'
    ),
    correct: ['b'],
    explanation: 'The Product Owner aligns the Product Goal and Product Backlog with business strategy so that delivered outcomes advance the organization\'s strategic value.',
    references: [REF_SO_EBM, REF_GUIDE_GOAL]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A feature met the Definition of Done but customer outcome did not improve. What does this tell the Product Owner?',
    options: opts4(
      'The Definition of Done is wrong',
      'Quality/releasability was achieved, but the value hypothesis was not validated — adapt the backlog',
      'The team should stop using Scrum',
      'Velocity must be increased'
    ),
    correct: ['b'],
    explanation: 'Meeting Done means it was built right and is releasable. No outcome improvement means the value hypothesis failed; the Product Owner uses this evidence to adapt the Product Backlog.',
    references: [REF_GUIDE_DOD, REF_SO_VALUE]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'Evidence-Based Management helps a Product Owner mainly by:',
    options: opts4(
      'Replacing the Scrum framework',
      'Focusing improvement on value measures and using evidence to guide investment decisions',
      'Eliminating the Product Backlog',
      'Removing the need for stakeholders'
    ),
    correct: ['b'],
    explanation: 'EBM provides value-focused measures (e.g., current value, time-to-market) so the Product Owner uses empirical evidence to guide investment and improvement toward strategic goals.',
    references: [REF_SO_EBM]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Owner keeps adding features but customer satisfaction is flat. The most value-aligned next step is to:',
    options: opts4(
      'Add even more features faster',
      'Inspect outcomes, question the value hypotheses, and reprioritize toward higher-impact work',
      'Stop talking to customers',
      'Increase the Sprint length'
    ),
    correct: ['b'],
    explanation: 'Flat satisfaction despite more output signals weak value hypotheses. The Product Owner should inspect outcomes and reprioritize toward work with higher expected impact.',
    references: [REF_SO_VALUE, REF_SO_EBM]
  },
  {
    domain: VALUE, difficulty: 2, type: QType.SINGLE,
    stem: 'The Product Goal is found in which artifact?',
    options: opts4(
      'The Sprint Backlog',
      'The Product Backlog',
      'The Increment',
      'It is not part of any artifact'
    ),
    correct: ['b'],
    explanation: 'The Product Goal is in the Product Backlog and is its commitment. The rest of the Product Backlog emerges to define what will fulfill the Product Goal.',
    references: [REF_GUIDE_GOAL, REF_GUIDE_PB]
  },
  {
    domain: VALUE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which approach best balances long-term vision with short-term value delivery?',
    options: opts4(
      'Deliver nothing until the full vision is built',
      'Use the vision/Product Goal for direction while delivering valuable Increments and adapting from feedback',
      'Ignore the vision and chase any quick win',
      'Freeze the backlog to protect the vision'
    ),
    correct: ['b'],
    explanation: 'A stable vision/Product Goal gives direction; frequent valuable Increments deliver and validate value. Adapting from feedback keeps both long-term direction and short-term value aligned.',
    references: [REF_SO_VISION, REF_GUIDE_INC]
  },

  // ── Product Backlog Management (16) ──
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the commitment for the Product Backlog?',
    options: opts4(
      'Definition of Done',
      'Sprint Goal',
      'Product Goal',
      'Release Goal'
    ),
    correct: ['c'],
    explanation: 'The Product Backlog\'s commitment is the Product Goal. It provides a target for the Scrum Team to plan against and is contained in the Product Backlog.',
    references: [REF_GUIDE_PB, REF_GUIDE_GOAL]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'The Developers select how many items into the Sprint based on:',
    options: opts4(
      'Whatever the Product Owner mandates exactly',
      'Past performance, upcoming capacity, and their Definition of Done',
      'A fixed number set by the Scrum Master',
      'Stakeholder demands'
    ),
    correct: ['b'],
    explanation: 'In Sprint Planning, the Developers select items considering past performance, upcoming capacity, and their Definition of Done; they alone assess what they can accomplish.',
    references: [REF_GUIDE_PLANNING, REF_GUIDE_DEV]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'Refinement typically results in items that are:',
    options: opts4(
      'Larger and vaguer',
      'Smaller, clearer, and more precisely understood',
      'Hidden from the Developers',
      'Owned by stakeholders'
    ),
    correct: ['b'],
    explanation: 'Refinement breaks down and further defines items, making them smaller, clearer, and more precise so they can be completed within a Sprint.',
    references: [REF_SO_REFINE, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Owner wants to ensure the Product Backlog stays transparent over time. The best practice is to:',
    options: opts4(
      'Update it once per release',
      'Keep it visible, ordered, and continuously refined with the Developers',
      'Restrict access to the Product Owner only',
      'Track items only in private notes'
    ),
    correct: ['b'],
    explanation: 'Ongoing visibility, clear ordering, and continuous collaborative refinement keep the Product Backlog transparent, enabling reliable inspection and adaptation.',
    references: [REF_GUIDE_PB, REF_SO_REFINE]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: The Product Owner is accountable for ordering the Product Backlog even if others help create items.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'Others may contribute items, but the Product Owner is accountable for ordering the Product Backlog and for its effective management.',
    references: [REF_GUIDE_PO, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'How does the Product Backlog relate to the Sprint Backlog?',
    options: opts4(
      'They are the same artifact',
      'The Sprint Backlog is the Developers\' plan for items selected from the Product Backlog for the Sprint',
      'The Sprint Backlog replaces the Product Backlog during the Sprint',
      'The Product Backlog is a subset of the Sprint Backlog'
    ),
    correct: ['b'],
    explanation: 'The Sprint Backlog comprises the Sprint Goal, selected Product Backlog items, and the plan to deliver them. The Product Backlog remains the single source of work.',
    references: [REF_GUIDE_SB, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Product Backlog ordering and the Product Owner.',
    options: opts4(
      'The Product Owner orders the backlog to best achieve goals and missions',
      'Ordering may consider value, risk, dependencies, and learning',
      'Stakeholders may directly re-order it whenever they wish',
      'The Product Owner remains accountable for ordering'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'The Product Owner orders the backlog to best achieve goals/missions, weighing value, risk, dependencies, and learning, and remains accountable. Stakeholders influence via the Product Owner, not directly.',
    references: [REF_GUIDE_PO, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'Who may attend and contribute to Product Backlog refinement?',
    options: opts4(
      'Only the Product Owner',
      'The Product Owner and Developers collaborating; others as helpful',
      'Only the Scrum Master',
      'Only stakeholders'
    ),
    correct: ['b'],
    explanation: 'Refinement is collaborative — the Product Owner and Developers work together to add detail, order, and size. The Scrum Guide does not restrict it to one person.',
    references: [REF_SO_REFINE, REF_GUIDE_PB]
  },
  {
    domain: BACKLOG, difficulty: 4, type: QType.SINGLE,
    stem: 'A Product Owner orders the backlog purely by stakeholder seniority, ignoring value and risk. The most likely consequence is:',
    options: opts4(
      'Optimal value delivery',
      'Misaligned investment and slower progress toward the Product Goal',
      'Shorter Sprints',
      'Improved transparency'
    ),
    correct: ['b'],
    explanation: 'Ordering by seniority rather than value/risk misallocates effort and slows progress toward the Product Goal. The Product Owner should order to maximize product value.',
    references: [REF_GUIDE_PO, REF_SO_ROI]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'The Product Backlog exists for as long as:',
    options: opts4(
      'The first release cycle',
      'The product exists and should be improved',
      'The current Sprint',
      'The Product Owner is employed'
    ),
    correct: ['b'],
    explanation: 'As long as a product exists and can be improved, its Product Backlog also exists. It is dynamic and continually evolves with the product.',
    references: [REF_GUIDE_PB, REF_SO_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'A Developer proposes a technical improvement that reduces future risk. Where should it go?',
    options: opts4(
      'A hidden engineering list',
      'Onto the single Product Backlog, where the Product Owner can order it with everything else',
      'Implemented secretly without tracking',
      'Into the Sprint Retrospective notes only'
    ),
    correct: ['b'],
    explanation: 'All work for the product, including technical improvements, belongs on the single Product Backlog so the Product Owner can order it transparently against value and risk.',
    references: [REF_GUIDE_PB, REF_SO_PB]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'What is true about Product Backlog item detail over the lifetime of the backlog?',
    options: opts4(
      'All items always have equal detail',
      'Detail emerges over time; items are progressively refined as they near selection',
      'Detail is fixed when items are first written',
      'Only the Scrum Master adds detail'
    ),
    correct: ['b'],
    explanation: 'The Product Backlog is emergent. Items gain detail progressively through refinement as they rise in order and approach selection for a Sprint.',
    references: [REF_GUIDE_PB, REF_SO_REFINE]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: It is acceptable to keep multiple Product Backlogs for one product to satisfy different departments.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['b'],
    explanation: 'A product has exactly one Product Backlog. Multiple backlogs for one product break transparency and single-source ordering; departmental needs are represented within the one backlog.',
    references: [REF_GUIDE_PB, REF_SO_PB]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'During Sprint Planning Topic Two, the Product Owner\'s role in scope selection is to:',
    options: opts4(
      'Dictate exactly which items the Developers must take',
      'Discuss items and help select what could be Done; Developers decide how much they can take on',
      'Stay out of Sprint Planning entirely',
      'Estimate the items for the Developers'
    ),
    correct: ['b'],
    explanation: 'In Topic Two, the Developers select how many items to bring into the Sprint; the Product Owner discusses objective and trade-offs, but the Developers decide what they can accomplish.',
    references: [REF_GUIDE_PLANNING]
  },
  {
    domain: BACKLOG, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best maintains a healthy, value-ordered Product Backlog?',
    options: opts4(
      'Never changing item order once set',
      'Continuously re-ordering as value, risk, and learning evolve',
      'Ordering only by item age',
      'Letting Developers order it during the Daily Scrum'
    ),
    correct: ['b'],
    explanation: 'A healthy backlog is continuously re-ordered by the Product Owner as understanding of value, risk, dependencies, and new learning evolves.',
    references: [REF_GUIDE_PB, REF_GUIDE_PO]
  },
  {
    domain: BACKLOG, difficulty: 3, type: QType.SINGLE,
    stem: 'The Product Owner ensures the Developers understand items at the needed level by:',
    options: opts4(
      'Writing detailed technical designs for them',
      'Collaborating during refinement to clarify intent, value, and acceptance expectations',
      'Refusing to discuss items until the Sprint',
      'Delegating all clarification to the Scrum Master'
    ),
    correct: ['b'],
    explanation: 'Through ongoing refinement collaboration, the Product Owner clarifies intent, value, and expectations so Developers understand items well enough to size and complete them.',
    references: [REF_SO_REFINE, REF_GUIDE_PO]
  },

  // ── Stakeholders and Customers (10) ──
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Sprint Review exists primarily to:',
    options: opts4(
      'Get formal stakeholder sign-off before release',
      'Inspect the outcome and collaborate with stakeholders on what to do next',
      'Let the Scrum Master report individual performance',
      'Re-estimate the Product Backlog'
    ),
    correct: ['b'],
    explanation: 'The Sprint Review is a working session to inspect the Sprint outcome, review progress toward the Product Goal, and collaborate with stakeholders on adaptations to the Product Backlog.',
    references: [REF_GUIDE_REVIEW]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best describes effective Product Owner stakeholder management?',
    options: opts4(
      'Saying yes to every request to avoid conflict',
      'Aligning stakeholders around the Product Goal and making transparent, value-based decisions',
      'Avoiding stakeholders to remain neutral',
      'Letting stakeholders directly edit the Product Backlog'
    ),
    correct: ['b'],
    explanation: 'Effective stakeholder management aligns people around the Product Goal and makes transparent, value-based ordering decisions — not appeasing every request nor ceding ordering authority.',
    references: [REF_SO_STAKE, REF_GUIDE_PO]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is gathering feedback from real customers central to a Product Owner\'s job?',
    options: opts4(
      'It removes the need for refinement',
      'It supplies empirical evidence to validate value assumptions and steer the product',
      'It shifts accountability to customers',
      'It allows skipping the Sprint Review'
    ),
    correct: ['b'],
    explanation: 'Customer feedback is empirical evidence that validates or refutes value assumptions, helping the Product Owner steer the Product Backlog toward genuine value.',
    references: [REF_SO_STAKE, REF_SO_VALUE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'During the Sprint Review, stakeholders and the Scrum Team should:',
    options: opts4(
      'Watch a one-way demo only',
      'Collaborate on what was done, the changing environment, and what to do next',
      'Sign a formal acceptance document',
      'Conduct the Sprint Retrospective'
    ),
    correct: ['b'],
    explanation: 'The Sprint Review is collaborative: the Scrum Team and stakeholders discuss what was accomplished, environmental changes, and the most valuable next steps — not a passive demo.',
    references: [REF_GUIDE_REVIEW]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that strengthen Product Owner–stakeholder collaboration.',
    options: opts4(
      'Transparency about progress toward the Product Goal',
      'Regular feedback opportunities like the Sprint Review',
      'Evidence-based discussion of value and trade-offs',
      'Keeping stakeholders unaware of risks'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Transparency, regular feedback, and evidence-based value discussions strengthen collaboration and trust. Hiding risks reduces transparency and damages the empirical process.',
    references: [REF_SO_STAKE, REF_GUIDE_THEORY]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Stakeholders should be selectively invited to the Sprint Review based on relevance to the work and feedback needed.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'Key stakeholders relevant to the product and the feedback needed are invited to the Sprint Review to collaborate effectively on progress and next steps.',
    references: [REF_GUIDE_REVIEW]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A stakeholder is frustrated that priorities changed after new market data. The best Product Owner response is to:',
    options: opts4(
      'Revert to the old order to keep the peace',
      'Explain transparently how the evidence changed the value picture and the resulting re-ordering',
      'Tell the stakeholder priorities never change',
      'Ask Developers to justify the change'
    ),
    correct: ['b'],
    explanation: 'Empiricism means adapting to evidence. The Product Owner transparently explains how new data changed value expectations and why re-ordering maximizes product value.',
    references: [REF_SO_STAKE, REF_GUIDE_THEORY]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'How does the Product Owner balance many stakeholders with a single Product Backlog?',
    options: opts4(
      'By maintaining one backlog per stakeholder',
      'By representing diverse needs within one ordered Product Backlog driven by value',
      'By letting the loudest stakeholder set the order',
      'By delegating ordering to the Scrum Master'
    ),
    correct: ['b'],
    explanation: 'The Product Owner represents many stakeholders\' needs within the single Product Backlog, ordering by value to balance competing demands transparently.',
    references: [REF_GUIDE_PO, REF_SO_STAKE]
  },
  {
    domain: STAKE, difficulty: 2, type: QType.SINGLE,
    stem: 'Customer/user collaboration most directly supports which empiricism pillar?',
    options: opts4(
      'It supplies real information that improves Transparency and enables better Inspection',
      'It eliminates the need for Adaptation',
      'It replaces the Product Goal',
      'It has no relation to empiricism'
    ),
    correct: ['a'],
    explanation: 'Direct customer collaboration surfaces real information, improving transparency about value and enabling more meaningful inspection and adaptation of the Product Backlog.',
    references: [REF_SO_STAKE, REF_GUIDE_THEORY]
  },
  {
    domain: STAKE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Product Owner receives contradictory feedback from two customer segments. The best approach is to:',
    options: opts4(
      'Pick the segment that complains the most',
      'Weigh feedback against the Product Goal and value, then order the backlog accordingly and transparently',
      'Ignore both and proceed with the original plan',
      'Ask Developers to choose a segment'
    ),
    correct: ['b'],
    explanation: 'Conflicting feedback is weighed against the Product Goal and expected value. The Product Owner makes a transparent, value-based ordering decision rather than reacting to volume.',
    references: [REF_GUIDE_PO, REF_SO_VALUE]
  },

  // ── Empiricism and Agility (10) ──
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Scrum\'s empirical process control rests on which three pillars?',
    options: opts4(
      'Transparency, Inspection, Adaptation',
      'Plan, Do, Check',
      'Roles, Events, Artifacts',
      'Vision, Goal, Backlog'
    ),
    correct: ['a'],
    explanation: 'Scrum employs an empirical approach with three pillars: Transparency, Inspection, and Adaptation. These are supported by the five Scrum Values.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'If an artifact\'s transparency is low, what is the empirical danger?',
    options: opts4(
      'Inspection and adaptation become reliable',
      'Decisions that diminish value and increase risk may be made',
      'Sprints become shorter automatically',
      'The Product Goal becomes unnecessary'
    ),
    correct: ['b'],
    explanation: 'The Scrum Guide warns that decisions made on low-transparency artifacts can diminish value and increase risk because inspection is then based on a false picture.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which Scrum Value most directly enables raising uncomfortable truths for transparency?',
    options: opts4(
      'Courage',
      'Predictability',
      'Velocity',
      'Utilization'
    ),
    correct: ['a'],
    explanation: 'Courage, one of the five Scrum Values, gives Scrum Team members the strength to do the right thing and raise tough issues, supporting the transparency empiricism needs.',
    references: [REF_GUIDE_VALUES]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL that are true about the relationship between Scrum Values and empiricism.',
    options: opts4(
      'Living the values builds trust',
      'Trust enables transparency, inspection, and adaptation',
      'The values are Commitment, Focus, Openness, Respect, Courage',
      'The values replace the three empirical pillars'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'When the values are embodied, the pillars of transparency, inspection, and adaptation come to life and build trust. The values support, not replace, the empirical pillars.',
    references: [REF_GUIDE_VALUES, REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'True or False: Scrum combines empiricism with lean thinking to focus on essentials and reduce waste.',
    options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }],
    correct: ['a'],
    explanation: 'The 2020 Scrum Guide explicitly states Scrum is founded on empiricism and lean thinking; lean thinking reduces waste and focuses on the essentials.',
    references: [REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'How does a Product Owner demonstrate agility when new evidence contradicts the plan?',
    options: opts4(
      'Stick rigidly to the original Product Backlog order',
      'Adapt the Product Backlog and ordering to reflect the new evidence and maximize value',
      'Wait until the product is fully built before changing anything',
      'Escalate to management and pause all work'
    ),
    correct: ['b'],
    explanation: 'Agility is responding to change driven by evidence. The Product Owner adapts the Product Backlog and ordering to reflect new learning and continue maximizing value.',
    references: [REF_GUIDE_THEORY, REF_SO_VALUE]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST example of inspection leading to adaptation in a Product Owner\'s work?',
    options: opts4(
      'Reading the Scrum Guide once a year',
      'Reviewing customer usage data at the Sprint Review and reordering the Product Backlog accordingly',
      'Keeping the same plan regardless of data',
      'Increasing the team size'
    ),
    correct: ['b'],
    explanation: 'Inspecting real evidence (usage data) at the Sprint Review and then reordering the Product Backlog is a direct empirical inspect-and-adapt cycle for the Product Owner.',
    references: [REF_GUIDE_REVIEW, REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE,
    stem: 'Scrum is best described as:',
    options: opts4(
      'A complete prescriptive methodology',
      'A lightweight framework founded on empiricism and lean thinking',
      'A project management certification',
      'A documentation standard'
    ),
    correct: ['b'],
    explanation: 'The 2020 Scrum Guide describes Scrum as a lightweight framework that helps people, teams, and organizations generate value through adaptive solutions, founded on empiricism and lean thinking.',
    references: [REF_GUIDE_DEF, REF_GUIDE_THEORY]
  },
  {
    domain: EMPIRICISM, difficulty: 3, type: QType.SINGLE,
    stem: 'A team only inspects at the end of a long release. The empirical weakness is:',
    options: opts4(
      'Too much adaptation too early',
      'Infrequent inspection delays detection of deviations, increasing risk and waste',
      'Excessive transparency',
      'The Product Goal becomes too clear'
    ),
    correct: ['b'],
    explanation: 'Empiricism relies on frequent inspection. Inspecting only at release end delays detecting variances, so corrective adaptation comes late, increasing risk and wasted effort.',
    references: [REF_GUIDE_THEORY, REF_GUIDE_SPRINT]
  },
  {
    domain: EMPIRICISM, difficulty: 2, type: QType.SINGLE,
    stem: 'Why does Scrum prescribe a fixed cadence of events within the Sprint?',
    options: opts4(
      'To add bureaucracy',
      'To create regular, reliable opportunities for transparency, inspection, and adaptation',
      'To keep Developers busy',
      'To replace the Product Backlog'
    ),
    correct: ['b'],
    explanation: 'The prescribed events create a regular cadence and minimize the need for undefined meetings, ensuring consistent opportunities for transparency, inspection, and adaptation.',
    references: [REF_GUIDE_EVENTS, REF_GUIDE_THEORY]
  }
];

const PSPO_DOMAINS = [
  { name: FRAMEWORK, weight: 25 },
  { name: VALUE, weight: 20 },
  { name: BACKLOG, weight: 25 },
  { name: STAKE, weight: 15 },
  { name: EMPIRICISM, weight: 15 }
];

const PSPO_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'scrum-org-pspo-i-p1',
    code: 'PSPO-I-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — a 60-minute, 65-question, blueprint-weighted set covering the Scrum framework & accountabilities, product value & vision, Product Backlog management, stakeholder & customer collaboration, and empiricism & agility, grounded in the 2020 Scrum Guide.',
    questions: P1
  },
  {
    slug: 'scrum-org-pspo-i-p2',
    code: 'PSPO-I-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 60-minute, 65-question, blueprint-weighted set grounded in the 2020 Scrum Guide and Scrum.org Product Owner guidance.',
    questions: P2
  },
  {
    slug: 'scrum-org-pspo-i-p3',
    code: 'PSPO-I-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 60-minute, 65-question, blueprint-weighted set grounded in the 2020 Scrum Guide and Scrum.org Product Owner guidance.',
    questions: P3
  }
];

const PSPO_BUNDLE = {
  slug: 'scrum-org-pspo-i',
  title: 'Professional Scrum Product Owner I (PSPO I)',
  description: 'All 3 PSPO I practice exams in one bundle — covering the Scrum framework & accountabilities, product value & vision, Product Backlog management, stakeholder & customer collaboration, and empiricism & agility, grounded strictly in the 2020 Scrum Guide and Scrum.org Product Owner guidance.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 20000 // USD 200 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the PSPO I bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:pspo-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedPspo(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'scrum-org' } });
  await db.vendor.upsert({
    where: { slug: 'scrum-org' },
    update: { name: 'Scrum.org', description: 'Scrum.org Professional Scrum certifications — Scrum framework, Product Ownership, and the Professional Scrum Product Owner credential, grounded in the Scrum Guide.' },
    create: { slug: 'scrum-org', name: 'Scrum.org', description: 'Scrum.org Professional Scrum certifications — Scrum framework, Product Ownership, and the Professional Scrum Product Owner credential, grounded in the Scrum Guide.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'scrum-org' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of PSPO_EXAMS) {
    const title = `Professional Scrum Product Owner I (PSPO I) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} This is independent practice material and is not an official or real Scrum.org exam.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 60,
      passingScore: 85,
      questionCount: e.questions.length,
      domains: PSPO_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:pspo-seed' } });
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
          generatedBy: 'manual:pspo-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: PSPO_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: PSPO_BUNDLE.slug },
    update: {
      title: PSPO_BUNDLE.title,
      description: PSPO_BUNDLE.description,
      price: PSPO_BUNDLE.price,
      priceVoucher: PSPO_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: PSPO_BUNDLE.slug,
      title: PSPO_BUNDLE.title,
      description: PSPO_BUNDLE.description,
      price: PSPO_BUNDLE.price,
      priceVoucher: PSPO_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'scrum-org-pspo-i-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'scrum-org-pspo-i-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'scrum-org-pspo-i-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'scrum-org-pspo-i-p1', tier: 'VOUCHER' as const, position: 4 }
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
