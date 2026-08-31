/**
 * ITIL 4 Foundation bundle seed — vendor (AXELOS), four practice-exam
 * variants, bundle, and 260 blueprint-aligned questions. Idempotent:
 * replaces rows tagged `generatedBy: 'manual:itil4-seed'` and upserts
 * catalog rows.
 *
 * Exported as `seedItil4(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/itil4.ts`) and the protected
 * admin API (`/api/admin/seed-itil4`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is original, scenario-based, and grounded in the
 * public ITIL 4 Foundation syllabus / ITIL 4 publications. It is NOT a
 * reproduction of any real or official exam, and these questions do not
 * claim to be the live AXELOS examination.
 *
 * ITIL 4 Foundation domain blueprint (weights sum to 100):
 *   - Key Concepts of Service Management             — 20% (13/variant)
 *   - The Four Dimensions and Guiding Principles      — 25% (16/variant)
 *   - Service Value System and Value Chain            — 20% (13/variant)
 *   - ITIL Practices                                  — 35% (23/variant)
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

const KEY = 'Key Concepts of Service Management';
const DIM = 'The Four Dimensions and Guiding Principles';
const SVS = 'Service Value System and Value Chain';
const PRAC = 'ITIL Practices';

const REF_ITIL = { label: 'AXELOS — ITIL 4 overview', url: 'https://www.axelos.com/certifications/itil-service-management/itil-4-foundation' };
const REF_GLOSSARY = { label: 'AXELOS — ITIL glossary', url: 'https://www.axelos.com/resource-hub/glossary/itil-4-glossary' };
const REF_VALUE = { label: 'AXELOS — Service value and co-creation', url: 'https://www.axelos.com/resource-hub/blog/the-itil-4-service-value-system' };
const REF_PRINCIPLES = { label: 'AXELOS — The ITIL guiding principles', url: 'https://www.axelos.com/resource-hub/blog/the-7-guiding-principles-of-itil-4' };
const REF_DIMENSIONS = { label: 'AXELOS — The four dimensions of service management', url: 'https://www.axelos.com/resource-hub/blog/the-four-dimensions-of-itil-4' };
const REF_SVS = { label: 'AXELOS — The ITIL service value system', url: 'https://www.axelos.com/resource-hub/blog/the-itil-4-service-value-system' };
const REF_SVC = { label: 'AXELOS — The ITIL service value chain', url: 'https://www.axelos.com/resource-hub/blog/the-service-value-chain-explained' };
const REF_PRACTICES = { label: 'AXELOS — ITIL 4 practices', url: 'https://www.axelos.com/resource-hub/blog/itil-4-practices' };
const REF_INCIDENT = { label: 'AXELOS — Incident management practice', url: 'https://www.axelos.com/resource-hub/blog/incident-management-in-itil-4' };
const REF_PROBLEM = { label: 'AXELOS — Problem management practice', url: 'https://www.axelos.com/resource-hub/blog/problem-management-in-itil-4' };
const REF_CHANGE = { label: 'AXELOS — Change enablement practice', url: 'https://www.axelos.com/resource-hub/blog/change-enablement-in-itil-4' };
const REF_SLM = { label: 'AXELOS — Service level management practice', url: 'https://www.axelos.com/resource-hub/blog/service-level-management-in-itil-4' };
const REF_SD = { label: 'AXELOS — Service desk practice', url: 'https://www.axelos.com/resource-hub/blog/the-service-desk-in-itil-4' };
const REF_CI = { label: 'AXELOS — Continual improvement practice', url: 'https://www.axelos.com/resource-hub/blog/continual-improvement-in-itil-4' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
// Helper for 5-option questions.
const opts5 = (a: string, b: string, c: string, d: string, e: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }, { id: 'e', text: e }
];
// Helper for TRUE_FALSE questions.
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Key Concepts of Service Management (13) ──
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A consulting firm provides a managed payroll service so its client no longer has to run payroll in-house. Using ITIL 4 terminology, how is "service" best defined here?',
    options: opts4(
      'A bundle of software licences sold to the client',
      'A means of enabling value co-creation by facilitating outcomes customers want without them owning specific costs and risks',
      'A signed contract between the firm and the client',
      'The internal team that performs payroll processing'
    ),
    correct: ['b'],
    explanation: 'ITIL 4 defines a service as a means of enabling value co-creation by facilitating outcomes that customers want to achieve, without the customer having to manage specific costs and risks. The other options describe contracts, licences, or resources — not the service concept itself.',
    references: [REF_GLOSSARY, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A customer reports that since adopting a cloud backup service their team spends far less time on recovery drills, while a few users complain the new interface is confusing. Which pair of ITIL 4 concepts do these two observations illustrate?',
    options: opts4(
      'Cost and risk',
      'Output and outcome',
      'Utility and warranty',
      'Outcome (reduced effort) and a negative effect that erodes value'
    ),
    correct: ['d'],
    explanation: 'Less time on recovery drills is a desired outcome that contributes to value; the confusing interface is a negative effect that detracts from value. Value in ITIL 4 is a perception influenced by outcomes, costs, and risks for the consumer.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'In a service relationship a hosting provider supplies virtual servers and a SaaS vendor consumes them to deliver an application to end users. What role does the SaaS vendor play with respect to the hosting provider?',
    options: opts4(
      'Service provider only',
      'Service consumer (it consumes the hosting provider\'s services)',
      'Sponsor only',
      'It has no role because it does not pay directly'
    ),
    correct: ['b'],
    explanation: 'Organizations frequently act as both provider and consumer. Toward the hosting provider, the SaaS vendor is a service consumer; toward its own end users it is a service provider. The service consumer role includes customer, user, and sponsor sub-roles.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A manager authorises and approves the budget for a new collaboration platform but never logs in to use it. Which service consumer sub-role does this manager hold?',
    options: opts4(
      'User',
      'Customer',
      'Sponsor',
      'Service provider'
    ),
    correct: ['c'],
    explanation: 'The sponsor authorises the budget for service consumption. The user uses the service day to day; the customer defines requirements and is accountable for outcomes. These roles may be held by the same or different people.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A team debates whether their CI/CD pipeline is a "product" or a "service". Which statement aligns with ITIL 4?',
    options: opts4(
      'Products and services are identical terms with no useful distinction',
      'A product is a configuration of an organization\'s resources designed to offer value; services are based on one or more products',
      'A service is always a physical thing while a product is always intangible',
      'Products cannot be offered to customers; only services can'
    ),
    correct: ['b'],
    explanation: 'In ITIL 4 a product is a configuration of an organization\'s resources designed to offer value to a consumer. Services are built on products. Products are typically not consumed directly; service offerings expose part of a product to consumers.',
    references: [REF_GLOSSARY, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A vendor describes a service offering for a monitoring tool that includes: access to dashboards, the monitoring software itself, and onboarding consulting. Which component types are present?',
    options: opts4(
      'Goods, access to resources, and service actions',
      'Only goods',
      'Only service actions',
      'Risks and costs'
    ),
    correct: ['a'],
    explanation: 'Service offerings can include goods (ownership transfers, e.g. an exported report), access to resources (granted under agreed terms, e.g. dashboard access), and service actions performed to address consumer needs (e.g. onboarding consulting).',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'During an outage a customer says "the cost of this downtime now outweighs the benefit we get". In ITIL 4, what is "value"?',
    options: opts4(
      'The price charged for the service',
      'The perceived benefits, usefulness, and importance of something',
      'Only the financial revenue generated',
      'The total resources owned by the provider'
    ),
    correct: ['b'],
    explanation: 'Value is the perceived benefits, usefulness, and importance of something. It is subjective, defined by stakeholders, and co-created through the active collaboration of provider and consumer; it is not simply price or revenue.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In ITIL 4, value is created solely by the service provider and then delivered to a passive consumer.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. ITIL 4 emphasises value co-creation: value emerges from the active collaboration between provider and consumer (and other stakeholders), not from one-directional delivery.',
    references: [REF_VALUE, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A service desk closes a ticket because the requested action was completed, but the user still cannot achieve their business goal. Which distinction explains this?',
    options: opts4(
      'Cost versus risk',
      'Output versus outcome — an output was produced but the desired outcome was not achieved',
      'Utility versus warranty',
      'Sponsor versus user'
    ),
    correct: ['b'],
    explanation: 'An output is a tangible or intangible deliverable of an activity; an outcome is a result for a stakeholder enabled by outputs. Producing an output does not guarantee the outcome the consumer needs.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL factors that ITIL 4 says influence a service consumer\'s perception of value.',
    options: opts4(
      'Business outcomes achieved',
      'Costs incurred by the consumer',
      'Risks removed or imposed by the service',
      'The provider\'s internal org chart'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Value perception for a consumer is shaped by achieved outcomes, costs, and risks. The provider\'s internal organisational structure is not, by itself, a factor in the consumer\'s value perception.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A provider warns a client that adopting a new service introduces a dependency on a third-party API that might change. In ITIL 4 terms, this is an example of a service relationship that may impose what on the consumer?',
    options: opts4(
      'A new risk',
      'A guaranteed outcome',
      'A reduction in cost',
      'An output'
    ),
    correct: ['a'],
    explanation: 'Services can both remove risks from a consumer and impose new ones. A new external dependency that could change is a risk imposed on the consumer that must be weighed against the outcomes gained.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE,
    stem: 'Which ITIL 4 term describes "the functionality offered by a product or service to meet a particular need" — essentially what the service does (fit for purpose)?',
    options: opts4(
      'Warranty',
      'Utility',
      'Outcome',
      'Output'
    ),
    correct: ['b'],
    explanation: 'Utility is the functionality offered to meet a particular need — "what the service does" and whether it is fit for purpose. Warranty is the assurance that the service meets agreed requirements — "how it is delivered" and whether it is fit for use.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A service is functionally perfect but is frequently unavailable and slow under load, so customers cannot rely on it. Which element is deficient?',
    options: opts4(
      'Utility',
      'Warranty',
      'Outcome ownership',
      'Sponsorship'
    ),
    correct: ['b'],
    explanation: 'Warranty is the assurance that a product or service will meet agreed requirements (availability, capacity, security, continuity). Poor availability and performance indicate a warranty deficiency, even when utility is strong.',
    references: [REF_GLOSSARY]
  },

  // ── The Four Dimensions and Guiding Principles (16) ──
  {
    domain: DIM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which set correctly lists the four dimensions of service management in ITIL 4?',
    options: opts4(
      'People; Process; Technology; Suppliers',
      'Organizations and people; Information and technology; Partners and suppliers; Value streams and processes',
      'Plan; Improve; Engage; Deliver',
      'Strategy; Design; Transition; Operation'
    ),
    correct: ['b'],
    explanation: 'The four dimensions are: Organizations and people; Information and technology; Partners and suppliers; and Value streams and processes. They must all be considered to ensure a holistic approach to service management.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new tool was deployed but adoption failed because roles, culture, and skills were ignored. Which of the four dimensions was neglected?',
    options: opts4(
      'Information and technology',
      'Organizations and people',
      'Partners and suppliers',
      'Value streams and processes'
    ),
    correct: ['b'],
    explanation: 'The organizations and people dimension covers roles, responsibilities, organisational structures, culture, and required skills. Ignoring it commonly causes otherwise sound technology initiatives to fail.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A company relies heavily on a SaaS analytics vendor and must define contracts, integration, and accountability. Which dimension addresses this?',
    options: opts4(
      'Partners and suppliers',
      'Organizations and people',
      'Value streams and processes',
      'Information and technology'
    ),
    correct: ['a'],
    explanation: 'The partners and suppliers dimension covers an organisation\'s relationships with other organisations involved in the design, development, deployment, delivery, support, and continual improvement of services, including contracts and the chosen sourcing strategy.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL examples of external factors captured by the PESTLE model that can affect all four dimensions.',
    options: opts4(
      'Political and economic factors',
      'Legal and environmental factors',
      'Social and technological factors',
      'The provider\'s internal sprint backlog'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The four dimensions are constrained and influenced by external factors summarised by PESTLE: Political, Economic, Social, Technological, Legal, and Environmental. An internal sprint backlog is not a PESTLE external factor.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to redesign how a request flows from intake to fulfilment, including the sequence of activities and who does what. Which dimension is the primary focus?',
    options: opts4(
      'Value streams and processes',
      'Information and technology',
      'Partners and suppliers',
      'Organizations and people'
    ),
    correct: ['a'],
    explanation: 'The value streams and processes dimension is about how the various parts of the organisation work in an integrated and coordinated way — defining the activities, workflows, controls, and procedures needed to achieve agreed objectives.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'How many guiding principles does ITIL 4 define?',
    options: opts4(
      'Four',
      'Five',
      'Seven',
      'Nine'
    ),
    correct: ['c'],
    explanation: 'ITIL 4 defines seven guiding principles: Focus on value; Start where you are; Progress iteratively with feedback; Collaborate and promote visibility; Think and work holistically; Keep it simple and practical; Optimize and automate.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team is tempted to scrap a working legacy system and rebuild everything from scratch without assessing the current state. Which guiding principle is being violated?',
    options: opts4(
      'Keep it simple and practical',
      'Start where you are',
      'Focus on value',
      'Optimize and automate'
    ),
    correct: ['b'],
    explanation: 'Start where you are advises assessing the current state and reusing what is already available rather than starting over, to avoid waste and preserve value already created.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A manager insists on delivering a 12-month "big bang" release with no interim checkpoints or stakeholder input. Which principle should challenge this?',
    options: opts4(
      'Progress iteratively with feedback',
      'Think and work holistically',
      'Focus on value',
      'Collaborate and promote visibility'
    ),
    correct: ['a'],
    explanation: 'Progress iteratively with feedback recommends organising work into smaller, manageable sections that can be executed and completed in a timely manner, using feedback before, during, and after each iteration.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'Different teams hoard information and decisions are made without sharing data, breeding distrust. Which guiding principle most directly addresses this?',
    options: opts4(
      'Keep it simple and practical',
      'Collaborate and promote visibility',
      'Optimize and automate',
      'Start where you are'
    ),
    correct: ['b'],
    explanation: 'Collaborate and promote visibility stresses working together across boundaries and making work and its outcomes visible, which builds trust and supports better decisions.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 3, type: QType.SINGLE,
    stem: 'An organisation automates a wasteful, poorly understood manual process without first streamlining it. Which guiding principle\'s recommended sequence was ignored?',
    options: opts4(
      'Focus on value',
      'Optimize and automate (optimize first, then automate)',
      'Start where you are',
      'Think and work holistically'
    ),
    correct: ['b'],
    explanation: 'Optimize and automate recommends optimizing work as much as possible before automating it. Automating a wasteful process simply makes the waste happen faster.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A solution is designed by optimising one team in isolation, breaking an end-to-end service. Which principle was neglected?',
    options: opts4(
      'Think and work holistically',
      'Keep it simple and practical',
      'Progress iteratively with feedback',
      'Focus on value'
    ),
    correct: ['a'],
    explanation: 'Think and work holistically states that no service, practice, or component stands alone; outcomes are achieved only when the organisation works as an integrated whole rather than optimising parts in isolation.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: "Focus on value" means every activity an organisation undertakes should link back, directly or indirectly, to value for stakeholders.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Focus on value requires that everything the organisation does maps, directly or indirectly, to value for itself, its customers, and other stakeholders, starting with understanding who is being served.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A process accumulates checks and steps "just in case", though several add no value. Which guiding principle advises removing them?',
    options: opts4(
      'Keep it simple and practical',
      'Optimize and automate',
      'Collaborate and promote visibility',
      'Start where you are'
    ),
    correct: ['a'],
    explanation: 'Keep it simple and practical advises eliminating steps that do not contribute to value creation; if a process or step is not adding value it should be removed, using outcome-based thinking.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about applying the ITIL guiding principles is correct?',
    options: opts4(
      'Only one principle may be applied at a time',
      'The guiding principles are universal and enduring recommendations that can guide an organisation in all circumstances',
      'They apply only to incident management',
      'They replace the need for the service value system'
    ),
    correct: ['b'],
    explanation: 'The guiding principles are universal, enduring recommendations applicable in nearly all circumstances. They are not mutually exclusive — organisations typically consider several together and review their relevance to each situation.',
    references: [REF_PRINCIPLES, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect treats data, applications, and infrastructure decisions as a single dimension covering knowledge needed to deliver services. Which dimension is this?',
    options: opts4(
      'Information and technology',
      'Value streams and processes',
      'Organizations and people',
      'Partners and suppliers'
    ),
    correct: ['a'],
    explanation: 'The information and technology dimension includes the information and knowledge needed for service management, plus the technologies required, and considerations such as compatibility, security, and architecture.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'When applying "Start where you are", what does ITIL 4 recommend regarding measurement of the current state?',
    options: opts4(
      'Rely only on past reports and assumptions',
      'Observe and measure directly where possible, since data from prior reports may not reflect reality',
      'Skip measurement to save time',
      'Measure only after the new solution is built'
    ),
    correct: ['b'],
    explanation: 'Start where you are recommends assessing the current state through direct observation and measurement where possible, because second-hand data or assumptions can distort the true picture and lead to poor decisions.',
    references: [REF_PRINCIPLES]
  },

  // ── Service Value System and Value Chain (13) ──
  {
    domain: SVS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of the ITIL service value system (SVS)?',
    options: opts4(
      'To replace all existing processes with new ones',
      'To describe how all the components and activities of the organisation work together to enable value creation',
      'To document only the incident management workflow',
      'To define pricing for service offerings'
    ),
    correct: ['b'],
    explanation: 'The SVS describes how all the components and activities of an organisation work together as a system to enable value creation. Its inputs are opportunity and demand; its output is value.',
    references: [REF_SVS, REF_ITIL]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which list correctly names the components of the ITIL service value system?',
    options: opts5(
      'Guiding principles; governance; service value chain; practices; continual improvement',
      'Plan; improve; engage; design and transition; obtain/build',
      'People; process; products; partners',
      'Strategy; design; transition; operation; improvement',
      'Utility; warranty; outcome; output; value'
    ),
    correct: ['a'],
    explanation: 'The SVS comprises five components: guiding principles, governance, the service value chain, practices, and continual improvement. The second option lists the value chain activities, which sit inside the value chain component.',
    references: [REF_SVS]
  },
  {
    domain: SVS, difficulty: 1, type: QType.SINGLE,
    stem: 'What are the two inputs to the ITIL service value system?',
    options: opts4(
      'Cost and risk',
      'Opportunity and demand',
      'People and technology',
      'Utility and warranty'
    ),
    correct: ['b'],
    explanation: 'The SVS takes opportunity and demand as inputs and produces value as its output. Opportunity represents options to add value; demand is the need or desire for products and services.',
    references: [REF_SVS, REF_GLOSSARY]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of the service value chain?',
    options: opts4(
      'It is an operating model for the activities required to create, deliver, and continually improve services',
      'It is a list of supplier contracts',
      'It is the incident escalation matrix',
      'It is the financial budget for the year'
    ),
    correct: ['a'],
    explanation: 'The service value chain is an operating model that defines the key activities required to respond to demand and enable value realisation through the creation and management of products and services.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which set correctly names the six service value chain activities?',
    options: opts5(
      'Plan; Improve; Engage; Design and transition; Obtain/build; Deliver and support',
      'Plan; Do; Check; Act; Review; Report',
      'Strategy; Design; Transition; Operation; Improvement; Governance',
      'Identify; Assess; Authorize; Implement; Review; Close',
      'Detect; Diagnose; Resolve; Recover; Restore; Report'
    ),
    correct: ['a'],
    explanation: 'The six value chain activities are Plan, Improve, Engage, Design and transition, Obtain/build, and Deliver and support. They are interconnected and combined into different value streams.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team gathers requirements from customers and keeps suppliers informed. Which value chain activity is primarily involved?',
    options: opts4(
      'Engage',
      'Obtain/build',
      'Deliver and support',
      'Plan'
    ),
    correct: ['a'],
    explanation: 'The Engage activity provides good understanding of stakeholder needs, transparency, and continual engagement with all stakeholders — customers, users, suppliers, and partners.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'New service components are procured and made available for use. Which value chain activity is this?',
    options: opts4(
      'Obtain/build',
      'Engage',
      'Plan',
      'Improve'
    ),
    correct: ['a'],
    explanation: 'The Obtain/build activity ensures service components are available when and where they are needed and meet agreed specifications, whether built in-house or acquired from suppliers.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Services are provided to agreed specifications and users are supported day to day. Which value chain activity is this?',
    options: opts4(
      'Deliver and support',
      'Design and transition',
      'Obtain/build',
      'Plan'
    ),
    correct: ['a'],
    explanation: 'Deliver and support ensures services are delivered and supported according to agreed specifications and stakeholder expectations, including ongoing user support.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about value streams in the SVS is correct?',
    options: opts4(
      'A value stream is a fixed, single sequence used for every scenario',
      'A value stream is a specific combination of value chain activities and practices designed for a particular scenario',
      'Value streams replace the guiding principles',
      'Each value chain activity can be used only once per organisation'
    ),
    correct: ['b'],
    explanation: 'A value stream is a series of steps an organisation uses to create and deliver products and services to a consumer. It is a specific combination of value chain activities and practices, and the combination varies per scenario.',
    references: [REF_SVS, REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Senior leaders set direction, policies, and oversight for the organisation\'s service management. Which SVS component is this?',
    options: opts4(
      'Governance',
      'Practices',
      'Continual improvement',
      'Service value chain'
    ),
    correct: ['a'],
    explanation: 'Governance is the means by which an organisation is directed and controlled. Within the SVS it ensures the organisation\'s activities and decisions align with policies, direction, and stakeholder needs.',
    references: [REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: The service value chain activities must always be performed in a single fixed sequence (Plan → Improve → Engage → Design and transition → Obtain/build → Deliver and support).',
    options: tf(),
    correct: ['b'],
    explanation: 'False. The value chain activities are interconnected and are combined in different sequences to form value streams; there is no single mandatory order in which they must be executed.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'The "Plan" value chain activity primarily ensures what across the organisation?',
    options: opts4(
      'A shared understanding of the vision, current status, and improvement direction for all four dimensions and products/services',
      'That every incident is resolved within SLA',
      'That suppliers are paid on time',
      'That code is deployed to production daily'
    ),
    correct: ['a'],
    explanation: 'The Plan activity ensures a shared understanding of the vision, current status, and improvement direction for all four dimensions and all products and services across the organisation.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which SVS component is dedicated to aligning the organisation\'s practices and services with changing business needs through ongoing recurring activity?',
    options: opts4(
      'Continual improvement',
      'Governance',
      'Guiding principles',
      'Practices'
    ),
    correct: ['a'],
    explanation: 'Continual improvement is an SVS component (and a practice) that takes place in all areas of the organisation and at all levels, ensuring services and practices remain aligned with changing needs.',
    references: [REF_SVS, REF_CI]
  },

  // ── ITIL Practices (23) ──
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of the incident management practice?',
    options: opts4(
      'To minimise the negative impact of incidents by restoring normal service operation as quickly as possible',
      'To permanently eliminate the root cause of all problems',
      'To authorise and schedule all changes',
      'To capture and fulfil routine service requests'
    ),
    correct: ['a'],
    explanation: 'Incident management aims to minimise the negative impact of incidents by restoring normal service operation as quickly as possible. Root-cause elimination is problem management; change authorisation is change enablement.',
    references: [REF_INCIDENT]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A recurring error is investigated to understand its underlying cause and prevent recurrence, even though service has been restored via a workaround. Which practice is being used?',
    options: opts4(
      'Problem management',
      'Incident management',
      'Change enablement',
      'Service level management'
    ),
    correct: ['a'],
    explanation: 'Problem management reduces the likelihood and impact of incidents by identifying actual and potential causes and managing workarounds and known errors. Restoring service quickly is incident management.',
    references: [REF_PROBLEM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'In ITIL 4 problem management, a documented means of reducing or eliminating the impact of an incident for which a full resolution is not yet available is called a:',
    options: opts4(
      'Workaround',
      'Known error',
      'Change request',
      'Service request'
    ),
    correct: ['a'],
    explanation: 'A workaround is a solution that reduces or eliminates the impact of an incident or problem for which a full resolution is not yet available. A known error is a problem that has been analysed but not resolved.',
    references: [REF_PROBLEM, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A problem that has been analysed but not resolved is recorded so the service desk can apply its workaround quickly. What is this called?',
    options: opts4(
      'A known error',
      'A major incident',
      'A standard change',
      'A service request'
    ),
    correct: ['a'],
    explanation: 'A known error is a problem that has been analysed and has not been resolved. Documenting known errors and their workarounds speeds up future incident handling.',
    references: [REF_PROBLEM, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of the change enablement practice?',
    options: opts4(
      'To maximise the number of successful service and product changes by ensuring risks are properly assessed and changes are authorised',
      'To restore service after incidents',
      'To handle user password resets',
      'To negotiate service level agreements'
    ),
    correct: ['a'],
    explanation: 'Change enablement maximises the number of successful IT changes by ensuring risks are properly assessed, authorising changes to proceed, and managing the change schedule.',
    references: [REF_CHANGE]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A low-risk, pre-authorised, well-understood change (e.g. a routine password reset following a procedure) is which ITIL 4 change type?',
    options: opts4(
      'Standard change',
      'Normal change',
      'Emergency change',
      'Major incident'
    ),
    correct: ['a'],
    explanation: 'A standard change is low-risk, pre-authorised, well understood and follows a documented procedure; it can be implemented without additional authorisation each time. Normal changes are scheduled and assessed; emergency changes must be implemented as soon as possible.',
    references: [REF_CHANGE, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A critical security patch must be deployed immediately to stop an active exploit. Which change type and authority typically applies?',
    options: opts4(
      'Emergency change, often authorised by an emergency change authority',
      'Standard change, no authorisation needed',
      'Normal change, scheduled into the next quarterly window',
      'Service request fulfilled by the service desk'
    ),
    correct: ['a'],
    explanation: 'Emergency changes must be implemented as soon as possible (e.g. to resolve a major incident or apply a critical security patch). They are typically expedited through a dedicated emergency change authority.',
    references: [REF_CHANGE]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which statement best describes the role of the "change authority" in ITIL 4 change enablement?',
    options: opts4(
      'The person or group that authorises a change',
      'The person who physically deploys the change',
      'The tool used to track incidents',
      'The customer who requested the change'
    ),
    correct: ['a'],
    explanation: 'A change authority is the person or group responsible for authorising a change. Assigning the right change authority to each change type ensures effective and efficient change enablement.',
    references: [REF_CHANGE, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of the service desk practice?',
    options: opts4(
      'To capture demand for incident resolution and service requests and to be the single point of contact between the provider and users',
      'To assess and authorise all changes',
      'To eliminate the root cause of problems',
      'To design new services'
    ),
    correct: ['a'],
    explanation: 'The service desk is the entry point and single point of contact for the service provider with all of its users. It captures incident and service request demand and provides communication and coordination.',
    references: [REF_SD]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A user asks to be provisioned with a standard laptop, which is a predefined, low-risk, routine offering. Which practice handles this?',
    options: opts4(
      'Service request management',
      'Incident management',
      'Problem management',
      'Change enablement'
    ),
    correct: ['a'],
    explanation: 'Service request management handles predefined, user-initiated requests that are a normal part of service delivery (e.g. provisioning standard equipment), using standardised and where possible automated procedures.',
    references: [REF_PRACTICES, REF_SD]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of the service level management (SLM) practice?',
    options: opts4(
      'To set clear business-based targets for service levels and ensure service delivery is properly assessed, monitored, and managed against them',
      'To restore service as fast as possible after incidents',
      'To authorise changes',
      'To manage the configuration management database'
    ),
    correct: ['a'],
    explanation: 'SLM sets clear, business-based targets for service performance, so that delivery can be properly assessed, monitored, and managed against these targets, and engages with stakeholders accordingly.',
    references: [REF_SLM]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL skills/activities ITIL 4 associates with effective service level management.',
    options: opts4(
      'Relationship management and business liaison with customers',
      'Listening, capturing real requirements, and defining meaningful metrics',
      'Reviewing and reporting on service performance against agreed levels',
      'Writing all application source code'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'SLM requires relationship/business engagement, the ability to listen and capture real customer requirements, definition of meaningful metrics (not just operational ones), and regular review/reporting. Writing application code is not an SLM activity.',
    references: [REF_SLM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'In ITIL 4 a "practice" is best defined as:',
    options: opts4(
      'A set of organisational resources designed for performing work or accomplishing an objective',
      'A single mandatory process that cannot be tailored',
      'A type of incident',
      'A piece of software'
    ),
    correct: ['a'],
    explanation: 'A practice is a set of organisational resources designed for performing work or accomplishing an objective. ITIL 4 groups practices into general management, service management, and technical management practices.',
    references: [REF_PRACTICES, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Continual improvement in ITIL 4 uses a model that begins with which step?',
    options: opts4(
      '"What is the vision?"',
      '"Did we get there?"',
      '"Take action"',
      '"How do we keep the momentum going?"'
    ),
    correct: ['a'],
    explanation: 'The continual improvement model starts with "What is the vision?" then "Where are we now?", "Where do we want to be?", "How do we get there?", "Take action", "Did we get there?", and "How do we keep the momentum going?".',
    references: [REF_CI]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artefact does continual improvement use to capture, document, and track improvement ideas?',
    options: opts4(
      'The continual improvement register (CIR)',
      'The change schedule',
      'The known error database only',
      'The incident log'
    ),
    correct: ['a'],
    explanation: 'A continual improvement register (CIR) is used to capture and track ideas for improvement. Multiple CIRs may exist at different organisational levels; ideas are prioritised and acted upon.',
    references: [REF_CI, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In ITIL 4, continual improvement is the responsibility of a dedicated improvement team only, and other staff have no role in it.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Continual improvement is everyone\'s responsibility; while a team may coordinate it, all staff are expected to contribute improvement ideas and embed improvement in their daily work.',
    references: [REF_CI]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.SINGLE,
    stem: 'During a major incident, which relationship between incident and problem management is correct?',
    options: opts4(
      'Incident management restores service (possibly via a workaround) while problem management investigates the underlying cause',
      'Problem management restores service and incident management finds root cause',
      'They are the same practice with different names',
      'Incident management authorises the fix as a change without problem involvement'
    ),
    correct: ['a'],
    explanation: 'Incident management focuses on rapid restoration of normal service (often using a known-error workaround), while problem management analyses causes to reduce future incidents. They are distinct but closely linked practices.',
    references: [REF_INCIDENT, REF_PROBLEM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A normal change of significant risk needs structured assessment and authorisation before scheduling. Who/what typically performs the assessment in ITIL 4?',
    options: opts4(
      'The appropriate change authority, sometimes supported by a change advisory perspective',
      'The user who reported the related incident',
      'The continual improvement register owner only',
      'Nobody — normal changes are auto-approved'
    ),
    correct: ['a'],
    explanation: 'Normal changes are assessed and authorised by the appropriate change authority before being scheduled. ITIL 4 retains the idea of advisory input for assessing risk and impact, but emphasises right-sized authorisation.',
    references: [REF_CHANGE]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A service desk should focus on user experience and "shift left". What does shift-left mean here?',
    options: opts4(
      'Empowering users and lower tiers (e.g. self-service, knowledge) to resolve issues sooner rather than escalating',
      'Moving the service desk physically to the left of the building',
      'Escalating every ticket to third-line support immediately',
      'Removing all automation from the service desk'
    ),
    correct: ['a'],
    explanation: 'Shift-left means resolving issues as early and as close to the user as possible — through self-service, knowledge, and automation — improving experience and efficiency rather than escalating unnecessarily.',
    references: [REF_SD]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is a general management practice in ITIL 4?',
    options: opts4(
      'Continual improvement',
      'Incident management',
      'Service desk',
      'Deployment management'
    ),
    correct: ['a'],
    explanation: 'Continual improvement is a general management practice. Incident management and service desk are service management practices; deployment management is a technical management practice.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Service request management should be optimised through which approach according to ITIL 4?',
    options: opts4(
      'Standardisation and automation of requests as far as practical',
      'Treating every request as an emergency change',
      'Routing every request through problem management',
      'Manual handling with no predefined workflows'
    ),
    correct: ['a'],
    explanation: 'Service request management is most effective when requests and their fulfilment are standardised and automated to the greatest degree possible, with clear workflows and expectations.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.SINGLE,
    stem: 'An incident is logged that matches a documented known error with a workaround. What is the most appropriate immediate action?',
    options: opts4(
      'Apply the documented workaround to restore service, then continue problem management to address the cause',
      'Reject the incident because a known error exists',
      'Raise an emergency change without restoring service',
      'Close the problem record and ignore the incident'
    ),
    correct: ['a'],
    explanation: 'When an incident matches a known error, the documented workaround should be applied to restore service quickly (incident management), while problem management continues to work toward a permanent resolution.',
    references: [REF_INCIDENT, REF_PROBLEM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about the relationship between practices and the service value chain is correct?',
    options: opts4(
      'Practices contribute to multiple value chain activities and are combined into value streams as needed',
      'Each practice maps to exactly one value chain activity only',
      'Practices replace the value chain entirely',
      'Practices are used only in the Deliver and support activity'
    ),
    correct: ['a'],
    explanation: 'ITIL 4 practices are resources that can contribute to many value chain activities. Value streams combine value chain activities and the relevant practices for a given scenario.',
    references: [REF_PRACTICES, REF_SVC]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Key Concepts of Service Management (13) ──
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A streaming company offers customers a way to watch films without owning servers, licences, or operations staff. Which ITIL 4 idea does "not having to manage specific costs and risks" relate to?',
    options: opts4(
      'The definition of a service',
      'The definition of governance',
      'The definition of a value stream',
      'The definition of a practice'
    ),
    correct: ['a'],
    explanation: 'The phrase "without the customer having to manage specific costs and risks" is part of the ITIL 4 definition of a service: a means of enabling value co-creation by facilitating outcomes customers want.',
    references: [REF_GLOSSARY, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A help-desk produces a resolved ticket (deliverable) but the customer\'s real goal of "running payroll on time" is what matters to them. Which terms map to these two ideas?',
    options: opts4(
      'Output = resolved ticket; Outcome = payroll run on time',
      'Output = payroll run on time; Outcome = resolved ticket',
      'Both are outputs',
      'Both are outcomes'
    ),
    correct: ['a'],
    explanation: 'An output is a deliverable of an activity (the resolved ticket). An outcome is a result for a stakeholder enabled by outputs (payroll being run on time). Outputs enable outcomes but are not the same thing.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'Two companies agree that one will provide cloud storage and the other will consume it, with shared responsibilities and ongoing interaction. What is this called in ITIL 4?',
    options: opts4(
      'A service relationship',
      'A configuration item',
      'A known error',
      'A change schedule'
    ),
    correct: ['a'],
    explanation: 'A service relationship is a cooperation between a service provider and service consumer, including service provision, service consumption, and service relationship management.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which service consumer sub-role "uses the service" on a day-to-day basis?',
    options: opts4(
      'User',
      'Sponsor',
      'Customer',
      'Supplier'
    ),
    correct: ['a'],
    explanation: 'The user is the person who uses services. The customer defines requirements and is accountable for outcomes; the sponsor authorises budget for consumption.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A printer is exported to the customer who then owns it as part of a managed print offering. Which service offering component is this?',
    options: opts4(
      'Goods',
      'Access to resources',
      'Service actions',
      'A workaround'
    ),
    correct: ['a'],
    explanation: 'Goods are service offering components where ownership is transferred to the consumer and the consumer takes responsibility for their future use. Access to resources is granted under agreed terms; service actions are performed by the provider.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A consumer is granted login rights to a shared analytics platform but does not own it. Which service offering component is this?',
    options: opts4(
      'Access to resources',
      'Goods',
      'Service actions',
      'Outcome'
    ),
    correct: ['a'],
    explanation: 'Access to resources is a service offering component where access is granted or licensed under agreed terms and conditions, and the consumer can use the resources only as agreed without ownership transfer.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about utility and warranty is correct?',
    options: opts4(
      'A service needs both utility (fit for purpose) and warranty (fit for use) to deliver the desired value',
      'Utility alone is always sufficient for value',
      'Warranty refers only to a money-back guarantee',
      'Utility is "how" and warranty is "what"'
    ),
    correct: ['a'],
    explanation: 'Utility (fit for purpose, what it does) and warranty (fit for use, how well it performs against requirements like availability and security) are both required for a service to provide the value stakeholders expect.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: An organisation can be both a service provider and a service consumer at the same time, depending on the relationship in question.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Organisations commonly act as provider in some relationships and consumer in others, and the roles are defined relative to a specific service relationship.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A new monitoring service removes the customer\'s need to staff an overnight on-call rota. In ITIL 4 terms, the service has primarily done what for the consumer?',
    options: opts4(
      'Removed a cost/risk and enabled a desired outcome',
      'Imposed a new output',
      'Created a known error',
      'Reduced the provider\'s warranty'
    ),
    correct: ['a'],
    explanation: 'Services can remove costs and risks from consumers (here, the cost/risk of staffing overnight) while enabling desired outcomes. This contributes positively to the consumer\'s value perception.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL sub-roles included in the service consumer role in ITIL 4.',
    options: opts4(
      'Customer',
      'User',
      'Sponsor',
      'Configuration item'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The service consumer role includes the customer (defines requirements, accountable for outcomes), the user (uses the service), and the sponsor (authorises budget). A configuration item is not a consumer sub-role.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A product owner says "our mobile app is a configuration of code, infrastructure, and people designed to offer value". What concept is being described?',
    options: opts4(
      'A product',
      'A value stream',
      'A guiding principle',
      'A known error'
    ),
    correct: ['a'],
    explanation: 'A product is a configuration of an organisation\'s resources designed to offer value to a consumer. Service offerings expose parts of products to consumers.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE,
    stem: 'Value in ITIL 4 is best described as:',
    options: opts4(
      'Subjective and co-created, depending on stakeholder perception',
      'An objective fixed number set by the provider',
      'Equal to the provider\'s costs',
      'Only relevant to the sponsor'
    ),
    correct: ['a'],
    explanation: 'Value is subjective — perceived benefits, usefulness, and importance — and is co-created through collaboration between provider and consumer; it varies by stakeholder and context.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes "service consumption"?',
    options: opts4(
      'The activities performed by the consumer to use the service, including using provider resources and receiving goods',
      'The provider building new infrastructure',
      'The governance body setting policy',
      'The supplier negotiating a contract'
    ),
    correct: ['a'],
    explanation: 'Service consumption refers to the consumer\'s activities to use a service: managing consumer resources needed, using provider resources, requesting service actions, and receiving (acquiring) goods.',
    references: [REF_VALUE, REF_GLOSSARY]
  },

  // ── The Four Dimensions and Guiding Principles (16) ──
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A failed initiative is traced to incompatible data formats and an unsuitable security architecture. Which dimension was inadequately addressed?',
    options: opts4(
      'Information and technology',
      'Organizations and people',
      'Partners and suppliers',
      'Value streams and processes'
    ),
    correct: ['a'],
    explanation: 'The information and technology dimension covers the information, knowledge, and technologies needed, including architecture, compatibility, and security considerations.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organisation must decide between insourcing, outsourcing, or a hybrid sourcing model for a service capability. Which dimension is most relevant?',
    options: opts4(
      'Partners and suppliers',
      'Value streams and processes',
      'Organizations and people',
      'Information and technology'
    ),
    correct: ['a'],
    explanation: 'The partners and suppliers dimension includes the organisation\'s sourcing strategy and its relationships with other organisations that contribute to its services.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 1, type: QType.SINGLE,
    stem: 'Which dimension focuses on the activities undertaken and how the organisation\'s parts are coordinated to deliver value?',
    options: opts4(
      'Value streams and processes',
      'Organizations and people',
      'Information and technology',
      'Partners and suppliers'
    ),
    correct: ['a'],
    explanation: 'The value streams and processes dimension is concerned with how the organisation\'s parts work in a coordinated way — the activities, workflows, controls, and procedures used to deliver agreed outcomes.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: All four dimensions must be considered for every product and service to take a holistic approach.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The four dimensions apply to all products and services and to the SVS as a whole; ignoring any of them risks unbalanced, less effective service management.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'New environmental regulations force changes to data-centre cooling. Which model categorises this kind of external influence on the four dimensions?',
    options: opts4(
      'PESTLE',
      'RACI',
      'DIKW',
      'SWOT'
    ),
    correct: ['a'],
    explanation: 'PESTLE (Political, Economic, Social, Technological, Legal, Environmental) categorises external factors that constrain or influence the four dimensions. Environmental regulation is the "E" in PESTLE.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is NOT one of the seven ITIL 4 guiding principles?',
    options: opts4(
      'Maximise utilisation of all resources',
      'Focus on value',
      'Keep it simple and practical',
      'Progress iteratively with feedback'
    ),
    correct: ['a'],
    explanation: 'The seven principles are: Focus on value; Start where you are; Progress iteratively with feedback; Collaborate and promote visibility; Think and work holistically; Keep it simple and practical; Optimize and automate. "Maximise utilisation of all resources" is not one of them.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team breaks a large programme into two-week increments and adjusts based on review outcomes each time. Which principle is being applied?',
    options: opts4(
      'Progress iteratively with feedback',
      'Keep it simple and practical',
      'Start where you are',
      'Optimize and automate'
    ),
    correct: ['a'],
    explanation: 'Progress iteratively with feedback organises work into smaller manageable increments, evaluated and adjusted using feedback before, during, and after each iteration.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'Stakeholders complain they never know what other teams are doing, causing duplicated effort. Which principle should the organisation apply?',
    options: opts4(
      'Collaborate and promote visibility',
      'Optimize and automate',
      'Keep it simple and practical',
      'Focus on value'
    ),
    correct: ['a'],
    explanation: 'Collaborate and promote visibility encourages cross-boundary collaboration and making work visible, reducing duplication, hidden agendas, and rework.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 3, type: QType.SINGLE,
    stem: 'A leader wants to automate before understanding or simplifying the workflow. Which guiding principle\'s guidance is most directly being ignored?',
    options: opts4(
      'Optimize and automate',
      'Start where you are',
      'Collaborate and promote visibility',
      'Think and work holistically'
    ),
    correct: ['a'],
    explanation: 'Optimize and automate advises optimizing the process first (e.g. understanding and simplifying it) and then applying automation; automating an un-optimised process entrenches inefficiency.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A change improves one team\'s metrics but degrades the overall customer journey. Which principle warns against this?',
    options: opts4(
      'Think and work holistically',
      'Keep it simple and practical',
      'Start where you are',
      'Focus on value'
    ),
    correct: ['a'],
    explanation: 'Think and work holistically recognises interdependencies; optimising one component while harming the whole undermines end-to-end value, so the organisation must work as an integrated system.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A reporting procedure has 14 approval steps; analysis shows 9 add no value. Which principle supports removing them?',
    options: opts4(
      'Keep it simple and practical',
      'Optimize and automate',
      'Collaborate and promote visibility',
      'Progress iteratively with feedback'
    ),
    correct: ['a'],
    explanation: 'Keep it simple and practical recommends using the minimum number of steps to accomplish an objective and removing anything that does not contribute to value.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Before launching an improvement, a team measures the actual current performance directly rather than trusting an old report. Which principle does this reflect?',
    options: opts4(
      'Start where you are',
      'Focus on value',
      'Keep it simple and practical',
      'Optimize and automate'
    ),
    correct: ['a'],
    explanation: 'Start where you are advises assessing the current state, ideally through direct observation and measurement, because relying on assumptions or stale data can mislead improvement efforts.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which guiding principle requires the organisation to first understand who is being served and what they value?',
    options: opts4(
      'Focus on value',
      'Optimize and automate',
      'Keep it simple and practical',
      'Start where you are'
    ),
    correct: ['a'],
    explanation: 'Focus on value starts by identifying the service consumer and other stakeholders, then understanding what they value, ensuring every activity links back to value creation.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about the ITIL 4 guiding principles.',
    options: opts4(
      'They are applicable in nearly all circumstances',
      'They are not mutually exclusive; several can apply together',
      'Their relevance should be reviewed for each situation',
      'They are mandatory processes that cannot be tailored'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The guiding principles are universal, enduring, and applicable in most circumstances; they are not mutually exclusive and their relevance should be reviewed per situation. They are recommendations, not rigid mandatory processes.',
    references: [REF_PRINCIPLES, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An organisation defines roles, competencies, and a healthy culture to support a new way of working. Which dimension does this address?',
    options: opts4(
      'Organizations and people',
      'Information and technology',
      'Value streams and processes',
      'Partners and suppliers'
    ),
    correct: ['a'],
    explanation: 'The organizations and people dimension covers organisational structure, roles and responsibilities, required competencies and skills, leadership, and culture.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A consultant says the four dimensions should be applied to which scope?',
    options: opts4(
      'The SVS as a whole and every product and service',
      'Only the incident management practice',
      'Only the technology stack',
      'Only supplier contracts'
    ),
    correct: ['a'],
    explanation: 'The four dimensions apply holistically to the entire service value system and to every product and service, to avoid blind spots and ensure balanced service management.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },

  // ── Service Value System and Value Chain (13) ──
  {
    domain: SVS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the single output of the ITIL service value system?',
    options: opts4(
      'Value',
      'A change schedule',
      'An incident record',
      'A supplier contract'
    ),
    correct: ['a'],
    explanation: 'The SVS converts the inputs of opportunity and demand into its output: value. The components work together as a system to enable this.',
    references: [REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which component of the SVS represents the means by which the organisation is directed and controlled?',
    options: opts4(
      'Governance',
      'Practices',
      'Service value chain',
      'Continual improvement'
    ),
    correct: ['a'],
    explanation: 'Governance is the SVS component describing how an organisation is directed and controlled, ensuring alignment of activities with policy and stakeholder needs.',
    references: [REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'A new requirement arrives; the organisation arranges and prioritises work and ensures readiness across the four dimensions. Which value chain activity is central?',
    options: opts4(
      'Plan',
      'Engage',
      'Obtain/build',
      'Deliver and support'
    ),
    correct: ['a'],
    explanation: 'The Plan activity ensures shared understanding of vision, current state, and improvement direction across the four dimensions and all products/services, supporting prioritisation.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Components are designed, then transitioned into operation meeting quality, cost, and time-to-market expectations. Which value chain activity is this?',
    options: opts4(
      'Design and transition',
      'Obtain/build',
      'Deliver and support',
      'Engage'
    ),
    correct: ['a'],
    explanation: 'Design and transition ensures products and services continually meet stakeholder expectations for quality, costs, and time to market, and are moved into live use effectively.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which value chain activity ensures continual improvement of products, services, and practices across all value chain activities and the four dimensions?',
    options: opts4(
      'Improve',
      'Plan',
      'Engage',
      'Deliver and support'
    ),
    correct: ['a'],
    explanation: 'The Improve activity ensures continual improvement of products, services, and practices across all value chain activities and the four dimensions of service management.',
    references: [REF_SVC, REF_CI]
  },
  {
    domain: SVS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes the service value chain from a value stream?',
    options: opts4(
      'The value chain is the generic operating model of activities; a value stream is a specific combination of those activities (and practices) for a scenario',
      'A value stream is the operating model; the value chain is one scenario',
      'They are identical concepts',
      'A value stream excludes practices entirely'
    ),
    correct: ['a'],
    explanation: 'The service value chain is the high-level operating model with six interconnected activities. A value stream is a specific path through the value chain, combining selected activities and practices for a given scenario.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Continual improvement is both a component of the SVS and an ITIL practice.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Continual improvement appears as a core component of the SVS and also as a general management practice with its own purpose, model, and register.',
    references: [REF_SVS, REF_CI]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'The "Engage" value chain activity primarily provides:',
    options: opts4(
      'A good understanding of stakeholder needs, transparency, and continual engagement with stakeholders',
      'The build of new service components',
      'Direct restoration of failed services',
      'Long-term financial budgeting only'
    ),
    correct: ['a'],
    explanation: 'Engage ensures good understanding of stakeholder needs, transparency, continual engagement, and good relationships with all stakeholders, including customers, users, suppliers, and partners.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which SVS component provides the universal recommendations that help an organisation in nearly all circumstances?',
    options: opts4(
      'Guiding principles',
      'Governance',
      'Practices',
      'Service value chain'
    ),
    correct: ['a'],
    explanation: 'The guiding principles are an SVS component offering universal, enduring recommendations applicable in nearly all circumstances and supporting decision-making throughout the SVS.',
    references: [REF_SVS, REF_PRINCIPLES]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which SVS component is the set of organisational resources designed for performing work or accomplishing an objective?',
    options: opts4(
      'Practices',
      'Governance',
      'Guiding principles',
      'Continual improvement'
    ),
    correct: ['a'],
    explanation: 'Practices are the SVS component consisting of sets of organisational resources designed for performing work or accomplishing objectives; ITIL 4 describes 34 practices.',
    references: [REF_SVS, REF_PRACTICES]
  },
  {
    domain: SVS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL of the following that are value chain activities (not other ITIL concepts).',
    options: opts4(
      'Engage',
      'Obtain/build',
      'Deliver and support',
      'Continual improvement'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Engage, Obtain/build, and Deliver and support are value chain activities. "Continual improvement" is an SVS component and a practice — there is an "Improve" activity, but it is not named "continual improvement".',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Why does the SVS help an organisation avoid "silos"?',
    options: opts4(
      'It describes how all components and activities work together as a system to create value',
      'It removes the need for any practices',
      'It mandates a single tool for all teams',
      'It eliminates governance'
    ),
    correct: ['a'],
    explanation: 'The SVS deliberately models the organisation as an integrated system of interacting components, which counters siloed working and supports flexible, coordinated value creation.',
    references: [REF_SVS, REF_ITIL]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Demand and opportunity enter the SVS. Which statement about them is correct?',
    options: opts4(
      'Opportunity represents options to add value; demand is the need or desire for products and services',
      'Demand is the output and opportunity is governance',
      'They are both outputs of the SVS',
      'Opportunity is a practice'
    ),
    correct: ['a'],
    explanation: 'Opportunity represents options or possibilities to add value for stakeholders; demand is the need or desire for products and services among internal and external consumers. Both are SVS inputs.',
    references: [REF_SVS, REF_GLOSSARY]
  },

  // ── ITIL Practices (23) ──
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An unplanned interruption to a service or reduction in its quality is called what in ITIL 4?',
    options: opts4(
      'An incident',
      'A problem',
      'A change',
      'A service request'
    ),
    correct: ['a'],
    explanation: 'An incident is an unplanned interruption to a service or reduction in the quality of a service. A problem is a cause, or potential cause, of one or more incidents.',
    references: [REF_INCIDENT, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A cause, or potential cause, of one or more incidents is called what?',
    options: opts4(
      'A problem',
      'An incident',
      'A known error',
      'A change'
    ),
    correct: ['a'],
    explanation: 'A problem is a cause, or potential cause, of one or more incidents. Once analysed but not resolved it becomes a known error, often with a documented workaround.',
    references: [REF_PROBLEM, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which sequence reflects the three phases of problem management in ITIL 4?',
    options: opts4(
      'Problem identification; problem control; error control',
      'Detect; restore; close',
      'Plan; do; check',
      'Log; categorise; escalate'
    ),
    correct: ['a'],
    explanation: 'Problem management has three phases: problem identification, problem control (analysis and documenting workarounds/known errors), and error control (managing known errors and potential permanent resolutions).',
    references: [REF_PROBLEM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A change that is scheduled, assessed for risk, and authorised by a change authority before implementation is which type?',
    options: opts4(
      'Normal change',
      'Standard change',
      'Emergency change',
      'Service request'
    ),
    correct: ['a'],
    explanation: 'A normal change is scheduled, assessed, and authorised following the standard change process. Standard changes are pre-authorised; emergency changes must be expedited.',
    references: [REF_CHANGE, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of service request management in ITIL 4?',
    options: opts4(
      'To support the agreed quality of a service by handling all predefined, user-initiated service requests effectively',
      'To restore service after an incident',
      'To investigate root cause',
      'To direct and control the organisation'
    ),
    correct: ['a'],
    explanation: 'Service request management supports the agreed quality of a service by handling all predefined, user-initiated service requests in an effective and user-friendly manner.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the BEST example of a service request rather than an incident?',
    options: opts4(
      'A request for access to an application that the user is entitled to',
      'A server crashing unexpectedly',
      'An application throwing errors for all users',
      'A network outage affecting a building'
    ),
    correct: ['a'],
    explanation: 'A request for entitled access is a predefined, normal part of service delivery — a service request. The other options are unplanned interruptions or quality reductions — incidents.',
    references: [REF_PRACTICES, REF_INCIDENT]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Service level management depends on which kind of agreement to define targets with the customer?',
    options: opts4(
      'A service level agreement (SLA)',
      'A known error record',
      'A continual improvement register',
      'A change schedule'
    ),
    correct: ['a'],
    explanation: 'An SLA is a documented agreement between a service provider and customer that identifies services and targets. SLM negotiates, agrees, monitors, and reports against SLAs.',
    references: [REF_SLM, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.SINGLE,
    stem: 'An SLA only tracks server uptime, yet customers are unhappy because end-to-end transactions fail. What ITIL 4 SLM concept does this illustrate?',
    options: opts4(
      'The "watermelon SLA" effect — green metrics but a poor customer experience',
      'A successful balanced SLA',
      'An emergency change',
      'A standard change'
    ),
    correct: ['a'],
    explanation: 'When SLAs measure isolated technical metrics rather than the customer outcome, reports can look "green" while customers are dissatisfied — informally the "watermelon" effect. SLM should define outcome-based, balanced metrics.',
    references: [REF_SLM]
  },
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'The single point of contact between the service provider and its users is which practice?',
    options: opts4(
      'Service desk',
      'Problem management',
      'Change enablement',
      'Service level management'
    ),
    correct: ['a'],
    explanation: 'The service desk practice provides the single point of contact for users, capturing demand for incident resolution and service requests and coordinating communication.',
    references: [REF_SD]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A modern service desk uses chatbots, knowledge bases, and self-service portals. Which ITIL 4 idea does this support?',
    options: opts4(
      'Optimising and automating channels while improving user experience',
      'Removing the need for any practices',
      'Eliminating change enablement',
      'Avoiding continual improvement'
    ),
    correct: ['a'],
    explanation: 'The service desk should use practical automation and multiple channels (omnichannel), shifting routine resolution left to self-service while preserving good user experience and empathy.',
    references: [REF_SD, REF_PRINCIPLES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which step of the continual improvement model asks "Where are we now?"',
    options: opts4(
      'The baseline assessment step (current state)',
      'The vision step',
      'The "take action" step',
      'The "did we get there?" step'
    ),
    correct: ['a'],
    explanation: '"Where are we now?" establishes a baseline assessment of the current state, following "What is the vision?" and preceding "Where do we want to be?".',
    references: [REF_CI]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which step of the continual improvement model defines measurable targets for the improvement?',
    options: opts4(
      '"Where do we want to be?"',
      '"What is the vision?"',
      '"Take action"',
      '"How do we keep the momentum going?"'
    ),
    correct: ['a'],
    explanation: '"Where do we want to be?" sets measurable targets based on the gap between the vision and current state, enabling progress to be evaluated later by "Did we get there?".',
    references: [REF_CI]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Continual improvement should be supported organisationally by which of the following in ITIL 4?',
    options: opts4(
      'Leadership commitment, embedding improvement in everyone\'s work, and tracking ideas in a CIR',
      'A one-off annual project only',
      'Restricting improvement to the IT department',
      'Avoiding measurement to reduce overhead'
    ),
    correct: ['a'],
    explanation: 'Effective continual improvement requires leadership commitment, improvement embedded in everyone\'s daily work, and a continual improvement register to capture, evaluate, and prioritise ideas.',
    references: [REF_CI]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'In ITIL 4, the 34 practices are grouped into how many categories, and which are they?',
    options: opts4(
      'Three: general management, service management, and technical management practices',
      'Two: technical and non-technical',
      'Four: plan, build, run, improve',
      'Five: matching the SVS components'
    ),
    correct: ['a'],
    explanation: 'ITIL 4 groups its 34 practices into three categories: general management practices, service management practices, and technical management practices.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of these is a service management practice (not general or technical)?',
    options: opts4(
      'Incident management',
      'Continual improvement',
      'Deployment management',
      'Risk management'
    ),
    correct: ['a'],
    explanation: 'Incident management is a service management practice. Continual improvement and risk management are general management practices; deployment management is a technical management practice.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.SINGLE,
    stem: 'An organisation wants timely incident handling. Which approach aligns with ITIL 4 incident management guidance?',
    options: opts4(
      'Prioritise incidents by impact and urgency and use appropriate categorisation and matching to known errors',
      'Treat all incidents identically regardless of impact',
      'Refuse to use workarounds even if available',
      'Skip logging incidents to save time'
    ),
    correct: ['a'],
    explanation: 'Incident management should prioritise incidents based on impact and urgency, use effective categorisation, match against known errors for fast workarounds, and escalate appropriately.',
    references: [REF_INCIDENT]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: A standard change must be assessed and authorised individually each time it is performed.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Standard changes are pre-authorised, low-risk, and follow a documented procedure; they do not require separate authorisation each time, which is what distinguishes them from normal changes.',
    references: [REF_CHANGE]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the relationship between a problem and a known error?',
    options: opts4(
      'A known error is a problem that has been analysed but not resolved',
      'A known error is an unanalysed incident',
      'A known error is the same as a service request',
      'A problem is a resolved known error'
    ),
    correct: ['a'],
    explanation: 'When a problem has been analysed and a workaround or understanding exists but it is not yet permanently resolved, it is recorded as a known error to speed future incident handling.',
    references: [REF_PROBLEM, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the purpose of change enablement in ITIL 4?',
    options: opts4(
      'To maximise successful changes by ensuring risks are assessed, changes are authorised, and a change schedule is managed',
      'To prevent any changes from being made',
      'To resolve incidents directly',
      'To act as the single point of contact for users'
    ),
    correct: ['a'],
    explanation: 'Change enablement maximises the number of successful service and product changes by ensuring risks are properly assessed, authorising changes to proceed, and managing the change schedule.',
    references: [REF_CHANGE]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL practices that are general management practices in ITIL 4.',
    options: opts4(
      'Continual improvement',
      'Risk management',
      'Information security management',
      'Service desk'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Continual improvement, risk management, and information security management are general management practices. The service desk is a service management practice.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A user-friendly, standardised request catalogue with predefined fulfilment workflows supports which practice\'s effectiveness?',
    options: opts4(
      'Service request management',
      'Problem management',
      'Incident management',
      'Service level management'
    ),
    correct: ['a'],
    explanation: 'A request catalogue with standardised, predefined workflows and clear expectations is central to effective service request management, enabling automation and consistency.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly relates incident management to service level management?',
    options: opts4(
      'Incident resolution performance often contributes to SLA targets monitored by SLM',
      'They are unrelated practices',
      'SLM resolves incidents directly',
      'Incident management negotiates SLAs with customers'
    ),
    correct: ['a'],
    explanation: 'Incident handling timeliness and quality frequently feed SLA metrics. SLM defines and monitors those targets, while incident management performs the resolution work — illustrating practices working together.',
    references: [REF_SLM, REF_INCIDENT]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A team wants to know which practice category continual improvement, risk management, and supplier management belong to in ITIL 4.',
    options: opts4(
      'General management practices',
      'Service management practices',
      'Technical management practices',
      'They are value chain activities, not practices'
    ),
    correct: ['a'],
    explanation: 'Continual improvement, risk management, and supplier management are general management practices in ITIL 4 — practices adopted and adapted from general business domains, as opposed to service or technical management practices.',
    references: [REF_PRACTICES]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Key Concepts of Service Management (13) ──
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A bank lets customers use online banking instead of building and running their own banking systems. The bank "facilitates outcomes customers want". Which ITIL 4 term does this define?',
    options: opts4(
      'Service',
      'Output',
      'Practice',
      'Configuration item'
    ),
    correct: ['a'],
    explanation: 'A service enables value co-creation by facilitating outcomes customers want without them having to manage specific costs and risks — exactly what online banking does for customers.',
    references: [REF_GLOSSARY, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After adopting a service, a customer achieves faster reporting (a benefit) but also faces a new compliance obligation (a downside). Together these shape what?',
    options: opts4(
      'The customer\'s perception of value',
      'The provider\'s governance',
      'The change schedule',
      'The known error database'
    ),
    correct: ['a'],
    explanation: 'Value perception for a consumer is influenced by achieved outcomes, costs, and risks. A benefit plus a new risk/obligation together shape how the consumer perceives the service\'s value.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'In a service relationship, which activities are performed by the service provider?',
    options: opts4(
      'Managing provider resources, providing services, and managing the service relationship from the provider side',
      'Only consuming resources',
      'Only sponsoring budgets',
      'Only defining requirements as a customer'
    ),
    correct: ['a'],
    explanation: 'The service provider manages its resources, provisions services (service provision), and participates in service relationship management. Consuming resources and defining requirements are consumer-side activities.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Who, in the service consumer role, is accountable for the outcomes of service consumption and typically defines requirements?',
    options: opts4(
      'The customer',
      'The user',
      'The sponsor',
      'The supplier'
    ),
    correct: ['a'],
    explanation: 'The customer defines the requirements for a service and takes responsibility for the outcomes of its consumption. The user uses it; the sponsor authorises spend.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A consultant explains a service offering may include a downloadable certificate the customer keeps, dashboard access, and on-demand support calls. The downloadable certificate is an example of:',
    options: opts4(
      'Goods',
      'Access to resources',
      'A service action',
      'A risk'
    ),
    correct: ['a'],
    explanation: 'Goods are components where ownership transfers to the consumer (the kept certificate/file). Dashboard access is access to resources; support calls are service actions.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A SaaS vendor performs data migration on behalf of a customer as part of onboarding. Which service offering component is this?',
    options: opts4(
      'A service action',
      'Goods',
      'Access to resources',
      'An incident'
    ),
    correct: ['a'],
    explanation: 'Service actions are activities performed by a provider to address a consumer\'s needs (e.g. onboarding data migration). Goods transfer ownership; access to resources grants usage rights.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A service is highly available and secure (well delivered) but lacks features users actually need. Which element is deficient?',
    options: opts4(
      'Utility',
      'Warranty',
      'Sponsorship',
      'Governance'
    ),
    correct: ['a'],
    explanation: 'Utility is fit for purpose — what the service does. Missing needed features is a utility deficiency, even though warranty (availability/security, fit for use) is strong.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Outputs and outcomes are synonyms in ITIL 4.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. An output is a deliverable of an activity; an outcome is a result for a stakeholder enabled by one or more outputs. Producing outputs does not guarantee outcomes.',
    references: [REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A vendor states their service "removes the cost and risk of managing infrastructure for the customer". This reflects which ITIL 4 idea?',
    options: opts4(
      'Services can remove costs and risks from the consumer',
      'Services always add cost and risk',
      'Services are the same as products',
      'Services replace governance'
    ),
    correct: ['a'],
    explanation: 'Services can both remove costs/risks from consumers and impose new ones. Marketing infrastructure-as-a-service emphasises removal of the cost and risk of running infrastructure.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly describe products and services in ITIL 4.',
    options: opts4(
      'A product is a configuration of an organisation\'s resources designed to offer value',
      'Service offerings may include goods, access to resources, and service actions',
      'Services are based on one or more products',
      'A service must always transfer ownership of goods to the consumer'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Products are resource configurations offering value; services are based on products; service offerings may include goods, access to resources, and service actions. Ownership transfer (goods) is only one possible component, not mandatory.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'Which term describes the cooperation between provider and consumer, including provision, consumption, and relationship management?',
    options: opts4(
      'Service relationship',
      'Value stream',
      'Service value chain',
      'Continual improvement register'
    ),
    correct: ['a'],
    explanation: 'A service relationship is the cooperation between a service provider and consumer and includes service provision, service consumption, and service relationship management.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Value co-creation in ITIL 4 means value is created by:',
    options: opts4(
      'Active collaboration between the provider and the consumer (and other stakeholders)',
      'The provider alone',
      'The consumer alone',
      'A regulator'
    ),
    correct: ['a'],
    explanation: 'ITIL 4 stresses that value is co-created: it emerges from the active collaboration between provider and consumer (and other stakeholders), not from one party in isolation.',
    references: [REF_VALUE, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A negative, unintended effect of a service that detracts from value is sometimes referred to as a service\'s:',
    options: opts4(
      'Risk or undesired outcome reducing value',
      'Guaranteed benefit',
      'Output',
      'Sponsor'
    ),
    correct: ['a'],
    explanation: 'Value is shaped by outcomes, costs, and risks. A negative or unintended effect operates as a risk/undesired outcome that detracts from the consumer\'s perceived value.',
    references: [REF_VALUE, REF_GLOSSARY]
  },

  // ── The Four Dimensions and Guiding Principles (16) ──
  {
    domain: DIM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which dimension covers roles, responsibilities, organisational structure, leadership, and culture?',
    options: opts4(
      'Organizations and people',
      'Information and technology',
      'Partners and suppliers',
      'Value streams and processes'
    ),
    correct: ['a'],
    explanation: 'The organizations and people dimension addresses structures, roles and responsibilities, required skills and competencies, leadership styles, and organisational culture.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A project ignores how knowledge, data, and the technology architecture fit together, causing integration failures. Which dimension was neglected?',
    options: opts4(
      'Information and technology',
      'Organizations and people',
      'Partners and suppliers',
      'Value streams and processes'
    ),
    correct: ['a'],
    explanation: 'The information and technology dimension covers the information/knowledge and technologies required for service management, including architecture and integration considerations.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'An organisation reviews its contracts, underpinning agreements, and the responsibilities of its cloud partner. Which dimension is in focus?',
    options: opts4(
      'Partners and suppliers',
      'Organizations and people',
      'Value streams and processes',
      'Information and technology'
    ),
    correct: ['a'],
    explanation: 'The partners and suppliers dimension covers relationships with other organisations, contracts and agreements, responsibilities, and the sourcing strategy.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team maps the end-to-end activities, controls, and procedures needed to turn a request into a delivered outcome. Which dimension is central?',
    options: opts4(
      'Value streams and processes',
      'Partners and suppliers',
      'Organizations and people',
      'Information and technology'
    ),
    correct: ['a'],
    explanation: 'The value streams and processes dimension defines how the parts of the organisation work in an integrated, coordinated way — the activities, workflows, controls, and procedures used.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'Which acronym summarises the external factors (Political, Economic, Social, Technological, Legal, Environmental) affecting the four dimensions?',
    options: opts4(
      'PESTLE',
      'ITIL',
      'RACI',
      'SVS'
    ),
    correct: ['a'],
    explanation: 'PESTLE summarises the external factors that constrain and influence the four dimensions: Political, Economic, Social, Technological, Legal, and Environmental.',
    references: [REF_DIMENSIONS]
  },
  {
    domain: DIM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which guiding principle states that everything the organisation does should map back, directly or indirectly, to value?',
    options: opts4(
      'Focus on value',
      'Start where you are',
      'Keep it simple and practical',
      'Optimize and automate'
    ),
    correct: ['a'],
    explanation: 'Focus on value requires that all activities link, directly or indirectly, to value for the organisation, its customers, and stakeholders, beginning with understanding who is served.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'An improvement team wants to discard everything and rebuild, ignoring usable existing assets and data. Which principle advises otherwise?',
    options: opts4(
      'Start where you are',
      'Progress iteratively with feedback',
      'Collaborate and promote visibility',
      'Keep it simple and practical'
    ),
    correct: ['a'],
    explanation: 'Start where you are recommends assessing and reusing what already exists and works, rather than discarding and rebuilding, to avoid waste and loss of value.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A programme is split into small increments, each reviewed and adjusted based on feedback. Which principle is being applied?',
    options: opts4(
      'Progress iteratively with feedback',
      'Optimize and automate',
      'Keep it simple and practical',
      'Focus on value'
    ),
    correct: ['a'],
    explanation: 'Progress iteratively with feedback organises work into smaller iterations, using feedback before, during, and after each to remain effective and responsive.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'Hidden work and a lack of transparency are causing distrust between teams. Which principle should be applied?',
    options: opts4(
      'Collaborate and promote visibility',
      'Keep it simple and practical',
      'Start where you are',
      'Optimize and automate'
    ),
    correct: ['a'],
    explanation: 'Collaborate and promote visibility emphasises working together and making work visible, which improves trust, decisions, and the likelihood of success.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 3, type: QType.SINGLE,
    stem: 'A manager insists on automating a chaotic process immediately. According to "Optimize and automate", what should happen first?',
    options: opts4(
      'Optimize (understand and streamline) the process before automating it',
      'Automate first, then optimize later',
      'Skip optimization entirely',
      'Outsource the process without analysis'
    ),
    correct: ['a'],
    explanation: 'Optimize and automate recommends optimizing work as much as practical before automating; automating an un-optimised, chaotic process simply accelerates the waste.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A solution is optimised for one department but breaks the overall service. Which principle highlights this mistake?',
    options: opts4(
      'Think and work holistically',
      'Keep it simple and practical',
      'Start where you are',
      'Focus on value'
    ),
    correct: ['a'],
    explanation: 'Think and work holistically stresses that components are interrelated; optimising one part while harming the whole undermines end-to-end value delivery.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A workflow has many steps that add no value. Which guiding principle recommends removing them and using outcome-based thinking?',
    options: opts4(
      'Keep it simple and practical',
      'Optimize and automate',
      'Collaborate and promote visibility',
      'Progress iteratively with feedback'
    ),
    correct: ['a'],
    explanation: 'Keep it simple and practical advises using the minimum steps necessary, removing anything that does not contribute to value, and applying outcome-based thinking.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: The guiding principles are mutually exclusive — only one may be considered for any given situation.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. The guiding principles are not mutually exclusive; organisations typically apply several together and review their relevance to each specific situation.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL of the following that are ITIL 4 guiding principles.',
    options: opts4(
      'Think and work holistically',
      'Optimize and automate',
      'Collaborate and promote visibility',
      'Plan, do, check, act'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Think and work holistically, Optimize and automate, and Collaborate and promote visibility are guiding principles. "Plan, do, check, act" is the Deming cycle, not an ITIL guiding principle.',
    references: [REF_PRINCIPLES]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'How should the four dimensions be treated when designing or managing a service?',
    options: opts4(
      'Considered together to ensure a holistic, balanced approach',
      'Applied one at a time, ignoring the others',
      'Only the technology dimension matters',
      'Only relevant during incidents'
    ),
    correct: ['a'],
    explanation: 'The four dimensions must be addressed together for every product and service; neglecting any one risks an unbalanced, less effective service and missed value.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which guiding principle most directly supports reducing waste by using the fewest steps necessary?',
    options: opts4(
      'Keep it simple and practical',
      'Focus on value',
      'Start where you are',
      'Collaborate and promote visibility'
    ),
    correct: ['a'],
    explanation: 'Keep it simple and practical directly targets waste by recommending the minimum number of steps and removing anything that does not add value.',
    references: [REF_PRINCIPLES]
  },

  // ── Service Value System and Value Chain (13) ──
  {
    domain: SVS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'The SVS converts inputs into an output. What is the output?',
    options: opts4(
      'Value',
      'Demand',
      'Opportunity',
      'A practice'
    ),
    correct: ['a'],
    explanation: 'The SVS takes opportunity and demand as inputs and produces value as its output by integrating its components and activities.',
    references: [REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is NOT one of the five SVS components?',
    options: opts4(
      'Incident management',
      'Guiding principles',
      'Governance',
      'Continual improvement'
    ),
    correct: ['a'],
    explanation: 'The five SVS components are guiding principles, governance, the service value chain, practices, and continual improvement. Incident management is a practice (it sits inside the practices component), not a top-level SVS component.',
    references: [REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which value chain activity ensures shared understanding of vision, current status, and improvement direction across the four dimensions?',
    options: opts4(
      'Plan',
      'Engage',
      'Improve',
      'Obtain/build'
    ),
    correct: ['a'],
    explanation: 'The Plan value chain activity ensures a shared understanding of vision, current status, and improvement direction for all four dimensions and all products and services.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which value chain activity is about understanding stakeholder needs and maintaining relationships and transparency?',
    options: opts4(
      'Engage',
      'Plan',
      'Obtain/build',
      'Improve'
    ),
    correct: ['a'],
    explanation: 'Engage provides a good understanding of stakeholder needs, transparency, continual engagement, and good relationships with all stakeholders.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team designs a new service and moves it into operation meeting quality, cost, and time expectations. Which value chain activity is this?',
    options: opts4(
      'Design and transition',
      'Obtain/build',
      'Deliver and support',
      'Engage'
    ),
    correct: ['a'],
    explanation: 'Design and transition ensures products and services continually meet stakeholder expectations for quality, costs, and time to market, and are transitioned into use.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Service components are made available, whether built internally or procured. Which value chain activity is this?',
    options: opts4(
      'Obtain/build',
      'Deliver and support',
      'Plan',
      'Improve'
    ),
    correct: ['a'],
    explanation: 'Obtain/build ensures service components are available when and where needed and meet agreed specifications, regardless of whether they are built in-house or obtained from suppliers.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Services are operated and users supported to agreed specifications and expectations. Which value chain activity is this?',
    options: opts4(
      'Deliver and support',
      'Obtain/build',
      'Design and transition',
      'Plan'
    ),
    correct: ['a'],
    explanation: 'Deliver and support ensures services are delivered and supported according to agreed specifications and stakeholders\' expectations, including ongoing user support.',
    references: [REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which value chain activity ensures continual improvement across all activities and the four dimensions?',
    options: opts4(
      'Improve',
      'Plan',
      'Engage',
      'Obtain/build'
    ),
    correct: ['a'],
    explanation: 'The Improve activity ensures continual improvement of products, services, and practices across all six value chain activities and the four dimensions.',
    references: [REF_SVC, REF_CI]
  },
  {
    domain: SVS, difficulty: 3, type: QType.SINGLE,
    stem: 'A value stream for "developing a new feature" combines several value chain activities and relevant practices. What does this illustrate?',
    options: opts4(
      'Value streams are specific combinations of value chain activities and practices for a scenario',
      'Value streams replace the value chain',
      'Each activity may be used only once across all value streams',
      'Practices cannot participate in value streams'
    ),
    correct: ['a'],
    explanation: 'A value stream is a specific series of steps combining selected value chain activities and practices to address a particular scenario; the same activity can appear in many value streams.',
    references: [REF_SVS, REF_SVC]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which SVS component ensures the organisation is directed and controlled in line with policy and stakeholder needs?',
    options: opts4(
      'Governance',
      'Practices',
      'Service value chain',
      'Guiding principles'
    ),
    correct: ['a'],
    explanation: 'Governance is the SVS component for directing and controlling the organisation, ensuring activities and decisions align with policies, direction, and stakeholder needs.',
    references: [REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: The service value chain has six interconnected activities that can be combined in different ways to form value streams.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The six value chain activities (Plan, Improve, Engage, Design and transition, Obtain/build, Deliver and support) are interconnected and combined in varying sequences to form value streams.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following correctly pairs an SVS input with its definition?',
    options: opts4(
      'Demand = the need or desire for products and services',
      'Demand = the output of the SVS',
      'Opportunity = an unresolved problem',
      'Opportunity = a service level agreement'
    ),
    correct: ['a'],
    explanation: 'Demand is the need or desire for products and services among internal and external consumers; opportunity represents options to add value. Both are inputs; value is the output.',
    references: [REF_SVS, REF_GLOSSARY]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Why are the guiding principles included as a component of the SVS?',
    options: opts4(
      'They provide universal guidance that supports decision-making throughout the whole system',
      'They replace governance',
      'They are only used in problem management',
      'They define the SLA targets'
    ),
    correct: ['a'],
    explanation: 'The guiding principles are an SVS component because they offer universal, enduring recommendations that guide behaviour and decisions across all parts of the service value system.',
    references: [REF_SVS, REF_PRINCIPLES]
  },

  // ── ITIL Practices (23) ──
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which practice has the purpose of restoring normal service operation as quickly as possible to minimise negative impact?',
    options: opts4(
      'Incident management',
      'Problem management',
      'Change enablement',
      'Service level management'
    ),
    correct: ['a'],
    explanation: 'Incident management\'s purpose is to minimise the negative impact of incidents by restoring normal service operation as quickly as possible.',
    references: [REF_INCIDENT]
  },
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which practice aims to reduce the likelihood and impact of incidents by identifying actual and potential causes?',
    options: opts4(
      'Problem management',
      'Incident management',
      'Service desk',
      'Change enablement'
    ),
    correct: ['a'],
    explanation: 'Problem management reduces the likelihood and impact of incidents by identifying actual and potential causes of incidents and managing workarounds and known errors.',
    references: [REF_PROBLEM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'During "problem control", what is typically produced to help the service desk handle future related incidents faster?',
    options: opts4(
      'A documented workaround and/or known error record',
      'A new SLA',
      'A service request catalogue',
      'A continual improvement register'
    ),
    correct: ['a'],
    explanation: 'In problem control, problems are analysed and workarounds are documented; problems not resolved become known errors. These speed up handling of recurring incidents.',
    references: [REF_PROBLEM, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A pre-authorised, low-risk, well-understood change following a documented procedure is which change type?',
    options: opts4(
      'Standard change',
      'Normal change',
      'Emergency change',
      'Major incident'
    ),
    correct: ['a'],
    explanation: 'A standard change is low risk, pre-authorised, well understood, and follows a documented procedure, so it does not require separate authorisation each time.',
    references: [REF_CHANGE, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A change must be made immediately to resolve a major incident. Which change type is this and how is it handled?',
    options: opts4(
      'Emergency change, expedited through an emergency change authority',
      'Standard change, no authorisation',
      'Normal change, deferred to next quarter',
      'Service request via the catalogue'
    ),
    correct: ['a'],
    explanation: 'Emergency changes must be implemented as soon as possible (e.g. to resolve a major incident). They follow an expedited assessment and authorisation, often via a dedicated emergency change authority.',
    references: [REF_CHANGE]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new IT support function is being set up. According to ITIL 4, what should the purpose of the service desk practice be?',
    options: opts4(
      'To capture demand for incident resolution and service requests and act as the single point of contact with users',
      'To assess and authorise changes',
      'To define service level targets',
      'To find the root cause of problems'
    ),
    correct: ['a'],
    explanation: 'The service desk is the single point of contact between the provider and users, capturing demand for incident resolution and service requests and coordinating communication.',
    references: [REF_SD]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is the BEST example of a request handled by service request management?',
    options: opts4(
      'A user requesting a standard, entitled software package',
      'A database server failing unexpectedly',
      'An application returning errors to all users',
      'A site-wide network outage'
    ),
    correct: ['a'],
    explanation: 'A request for an entitled, standard software package is a predefined, user-initiated request — service request management. The others are unplanned interruptions/quality reductions — incidents.',
    references: [REF_PRACTICES, REF_INCIDENT]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of service level management?',
    options: opts4(
      'To set clear, business-based targets for service levels and ensure delivery is assessed, monitored, and managed against them',
      'To restore service after incidents',
      'To eliminate root cause of problems',
      'To deploy releases'
    ),
    correct: ['a'],
    explanation: 'SLM sets clear, business-based targets for service performance and ensures delivery is properly assessed, monitored, and managed against those targets, with stakeholder engagement.',
    references: [REF_SLM]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.SINGLE,
    stem: 'An SLM team reports all SLAs green, yet customer satisfaction is poor. What ITIL 4 SLM guidance addresses this?',
    options: opts4(
      'Define metrics that reflect the customer\'s real experience and outcomes, not just isolated technical measures',
      'Increase the number of technical metrics only',
      'Remove the SLA entirely',
      'Convert incidents to standard changes'
    ),
    correct: ['a'],
    explanation: 'ITIL 4 SLM stresses engaging with customers to capture real requirements and defining outcome- and experience-based metrics; relying solely on isolated technical metrics produces misleading "all green" reports.',
    references: [REF_SLM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is the FIRST step of the ITIL 4 continual improvement model?',
    options: opts4(
      'What is the vision?',
      'Where are we now?',
      'Take action',
      'Did we get there?'
    ),
    correct: ['a'],
    explanation: 'The continual improvement model begins with "What is the vision?", aligning improvement with the organisation\'s vision and objectives before assessing the current state.',
    references: [REF_CI]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which step of the continual improvement model focuses on executing the improvement plan?',
    options: opts4(
      'Take action',
      'What is the vision?',
      'Where are we now?',
      'How do we keep the momentum going?'
    ),
    correct: ['a'],
    explanation: '"Take action" is the step where the improvement plan is executed (e.g. via iterative approaches). It is followed by "Did we get there?" to evaluate results.',
    references: [REF_CI]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artefact captures, prioritises, and tracks improvement ideas across the organisation?',
    options: opts4(
      'Continual improvement register (CIR)',
      'Change schedule',
      'Service catalogue',
      'Incident log'
    ),
    correct: ['a'],
    explanation: 'A continual improvement register (CIR) is used to capture, document, evaluate, prioritise, and track improvement ideas; multiple CIRs may exist at different levels.',
    references: [REF_CI, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: Continual improvement should be embedded in everyone\'s daily work, not isolated to a single team.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. ITIL 4 states continual improvement is everyone\'s responsibility and should be embedded in everyday work, even where a team coordinates improvement activity.',
    references: [REF_CI]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Into which three categories does ITIL 4 group its practices?',
    options: opts4(
      'General management, service management, technical management',
      'Strategic, tactical, operational',
      'Plan, build, run',
      'People, process, technology'
    ),
    correct: ['a'],
    explanation: 'ITIL 4 organises its 34 practices into general management practices, service management practices, and technical management practices.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is a technical management practice in ITIL 4?',
    options: opts4(
      'Deployment management',
      'Incident management',
      'Continual improvement',
      'Service level management'
    ),
    correct: ['a'],
    explanation: 'Deployment management is a technical management practice. Incident management and service level management are service management practices; continual improvement is a general management practice.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that correctly describe ITIL 4 incident management.',
    options: opts4(
      'Incidents should be prioritised based on impact and urgency',
      'Workarounds from known errors can be used to restore service quickly',
      'Major incidents may need a separate, coordinated procedure',
      'Every incident must trigger an emergency change'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Incident management prioritises by impact and urgency, leverages known-error workarounds, and uses dedicated handling for major incidents. Not every incident requires an emergency change.',
    references: [REF_INCIDENT, REF_CHANGE]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A change authority is best described as:',
    options: opts4(
      'The person or group responsible for authorising a change',
      'The tool used to deploy changes',
      'The user who reported an incident',
      'The supplier delivering the change'
    ),
    correct: ['a'],
    explanation: 'A change authority is the person or group that authorises a change. Matching the appropriate authority to each change type supports efficient change enablement.',
    references: [REF_CHANGE, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes an incident from a service request?',
    options: opts4(
      'An incident is an unplanned interruption/quality reduction; a service request is a predefined, user-initiated normal request',
      'They are the same thing',
      'A service request is always an emergency',
      'An incident is always pre-approved'
    ),
    correct: ['a'],
    explanation: 'An incident is unplanned (interruption or quality reduction) and handled by incident management; a service request is a predefined, normal part of service delivery handled by service request management.',
    references: [REF_INCIDENT, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which practice is the entry point and single point of contact for users with the service provider?',
    options: opts4(
      'Service desk',
      'Change enablement',
      'Problem management',
      'Service level management'
    ),
    correct: ['a'],
    explanation: 'The service desk practice is the entry point and single point of contact for all users, capturing demand and coordinating communication and resolution.',
    references: [REF_SD]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.SINGLE,
    stem: 'An incident matches a known error with a documented workaround. What should incident management do?',
    options: opts4(
      'Apply the workaround to restore service quickly while problem management continues toward permanent resolution',
      'Close the incident without action because a known error exists',
      'Convert the incident into a standard change',
      'Escalate to the sponsor for budget approval'
    ),
    correct: ['a'],
    explanation: 'When an incident matches a known error, the documented workaround is applied to restore service quickly (incident management), while problem management works on a permanent fix (error control).',
    references: [REF_INCIDENT, REF_PROBLEM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which approach best improves service request management effectiveness?',
    options: opts4(
      'Standardise and automate predefined requests with clear workflows and expectations',
      'Handle each request manually with no defined process',
      'Treat all requests as problems',
      'Route requests through emergency change'
    ),
    correct: ['a'],
    explanation: 'Service request management is most effective when requests are standardised, predefined, and automated where possible, with clear workflows and communicated expectations.',
    references: [REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'How do practices relate to the service value chain in ITIL 4?',
    options: opts4(
      'Practices are resources that support one or more value chain activities and are combined into value streams',
      'Each practice maps to exactly one activity and no others',
      'Practices and the value chain are unrelated',
      'Practices are only used outside the SVS'
    ),
    correct: ['a'],
    explanation: 'Practices are organisational resources that can contribute to multiple value chain activities; value streams combine the relevant activities and practices for a given scenario.',
    references: [REF_PRACTICES, REF_SVC]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about change enablement and risk is correct in ITIL 4?',
    options: opts4(
      'Change enablement balances the need to make beneficial changes with the need to protect customers and users from adverse effects',
      'Change enablement seeks to block all changes to remove risk entirely',
      'Change enablement ignores risk and approves everything',
      'Change enablement is the same as incident management'
    ),
    correct: ['a'],
    explanation: 'Change enablement maximises successful changes by properly assessing risk and authorising changes, balancing the value of change against the need to protect customers and users from adverse impact.',
    references: [REF_CHANGE]
  }
];

// ───────────────────── Practice Exam 4 ─────────────────────
const P4: Q[] = [
  // ── Key Concepts of Service Management (13) ──
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'A logistics company subscribes to a route-optimisation platform so it never has to build or operate the optimisation engine itself. In ITIL 4, the fact that the customer does not have to manage the underlying engine illustrates which characteristic of a service?',
    options: opts4(
      'It transfers ownership of the engine to the customer',
      'It enables value co-creation by facilitating outcomes without the customer managing specific costs and risks',
      'It guarantees zero defects in the customer\'s deliveries',
      'It removes the need for any service relationship'
    ),
    correct: ['b'],
    explanation: 'A service enables value co-creation by facilitating the outcomes a customer wants while sponsoring or managing specific costs and risks on their behalf, so the customer does not have to. Ownership is not transferred and the relationship still exists.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'After deploying a new HR self-service portal, the provider counts "1,200 forms processed" while the HR director cares that "joiners are productive on day one". In ITIL 4, the 1,200 forms and the productive joiners map respectively to which two concepts?',
    options: opts4(
      'Cost and risk',
      'Utility and warranty',
      'Output and outcome',
      'Resource and capability'
    ),
    correct: ['c'],
    explanation: 'An output is a tangible or intangible deliverable of an activity (forms processed); an outcome is the result for a stakeholder enabled by outputs (joiners productive on day one). Outputs alone do not guarantee the desired outcome.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A retailer runs its own e-commerce platform but rents content-delivery capacity from a CDN firm. With respect to the CDN firm specifically, which combination of ITIL 4 roles does the retailer occupy?',
    options: opts4(
      'Service provider toward the CDN firm',
      'Service consumer toward the CDN firm (while being a provider to shoppers)',
      'Sponsor only, with no consumption role',
      'Neither, because money is not exchanged directly'
    ),
    correct: ['b'],
    explanation: 'Organisations routinely play both roles. Toward the CDN firm the retailer is a service consumer; toward its shoppers it is a service provider. The roles are defined per relationship, not globally.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'In a managed-security engagement, the finance lead signs off the contract and budget but never opens the security console. Which service consumer sub-role does the finance lead occupy?',
    options: opts4(
      'User',
      'Sponsor',
      'Service provider',
      'Configuration manager'
    ),
    correct: ['b'],
    explanation: 'The sponsor is the person who authorises the budget for service consumption. A user actually uses the service; here the finance lead funds it but does not use the console, so the sponsor sub-role applies.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'An ITIL 4 trainer is asked whether "products" and "services" are the same. Which explanation is most accurate?',
    options: opts4(
      'A product is a configuration of an organisation\'s resources designed to offer value; services are based on one or more products',
      'A product and a service are identical terms with no distinction in ITIL 4',
      'A service is always a physical good, while a product is always intangible',
      'A product can never be shared between different service offerings'
    ),
    correct: ['a'],
    explanation: 'In ITIL 4 a product is a configuration of an organisation\'s resources designed to offer value, and services are built on products. A single product may underpin several service offerings, and products are typically not visible to consumers in full.',
    references: [REF_GLOSSARY, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A vendor\'s proposal for an analytics service lists: a usage licence for the analytics tool, access to a shared reporting environment, and a quarterly advisory workshop. Which service-offering component types appear in this proposal?',
    options: opts4(
      'Only goods',
      'Goods, access to resources, and service actions',
      'Only service actions',
      'Only access to resources'
    ),
    correct: ['b'],
    explanation: 'Service offerings can include goods (supplied or licensed items), access to resources (granted under agreed conditions), and service actions performed to address consumer needs. The proposal includes all three.',
    references: [REF_GLOSSARY, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A customer states: "the disruption from this outage now costs us more than the benefit we receive." Which ITIL 4 definition of value does this statement best illustrate?',
    options: opts4(
      'Value is the total revenue earned by the service provider',
      'Value is the perceived benefits, usefulness, and importance of something, weighed against costs and risks',
      'Value is a fixed monetary figure set in the contract',
      'Value is determined solely by the service provider'
    ),
    correct: ['b'],
    explanation: 'ITIL 4 defines value as the perceived benefits, usefulness and importance of something. It is subjective, depends on the consumer\'s perspective, and is affected by outcomes, costs and risks — exactly what the customer is weighing here.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In ITIL 4, the service consumer always plays a passive role and never contributes resources to value creation.',
    options: tf(),
    correct: ['b'],
    explanation: 'False. Value is co-created. The service consumer actively contributes — for example by providing requirements, using the service correctly, and giving feedback — so value emerges from collaboration rather than one-way delivery.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A field engineer marks a job "complete" because the requested router was swapped, yet the branch office still cannot reach head-office systems. Which ITIL 4 distinction best explains the gap?',
    options: opts4(
      'Output (router swapped) versus outcome (branch connectivity restored)',
      'Risk versus cost',
      'Utility versus product',
      'Sponsor versus customer'
    ),
    correct: ['a'],
    explanation: 'Swapping the router is an output. The desired outcome — restored branch connectivity — is what the stakeholder actually needs. Delivering outputs does not automatically produce the intended outcome.',
    references: [REF_GLOSSARY, REF_VALUE]
  },
  {
    domain: KEY, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL elements that ITIL 4 says jointly shape a service consumer\'s perception of value.',
    options: opts5(
      'Business outcomes achieved or supported by the service',
      'The costs the consumer incurs or avoids',
      'The risks the consumer is exposed to or relieved of',
      'The provider\'s internal profit margin, which the consumer does not see',
      'The consumer\'s own preferences and perceptions'
    ),
    correct: ['a', 'b', 'c', 'e'],
    explanation: 'Value perception is influenced by outcomes, costs, risks, and the consumer\'s own preferences/perceptions. The provider\'s internal margin is generally invisible to the consumer and is not a stated factor in the value perception model.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A provider tells a prospective customer that adopting the new platform will commit them to a specific vendor data format for several years. In ITIL 4 terms, this commitment is best characterised as which aspect of the service relationship?',
    options: opts4(
      'An output of the service',
      'A risk imposed on the consumer that can affect perceived value',
      'A guiding principle',
      'A value chain activity'
    ),
    correct: ['b'],
    explanation: 'Service relationships can remove some risks for the consumer but may also impose new ones (such as lock-in to a data format). Such imposed risks affect the consumer\'s overall perception of value.',
    references: [REF_VALUE, REF_GLOSSARY]
  },
  {
    domain: KEY, difficulty: 1, type: QType.SINGLE,
    stem: 'Which ITIL 4 term means "the assurance that a product or service will meet agreed requirements" — essentially that it is fit for use?',
    options: opts4(
      'Utility',
      'Warranty',
      'Output',
      'Sponsor'
    ),
    correct: ['b'],
    explanation: 'Warranty is the assurance that a product or service will meet agreed requirements — fit for use, covering aspects such as availability, capacity, security and continuity. Utility is fit for purpose (what it does).',
    references: [REF_GLOSSARY, REF_ITIL]
  },
  {
    domain: KEY, difficulty: 2, type: QType.SINGLE,
    stem: 'A reporting service has every feature the business needs (fit for purpose) but is so unreliable during month-end that finance cannot trust it. Which element is deficient?',
    options: opts4(
      'Utility',
      'Warranty',
      'Output',
      'Demand'
    ),
    correct: ['b'],
    explanation: 'The service is fit for purpose (utility is present) but not fit for use because it is unreliable when needed. The deficient element is warranty, which covers reliability and availability under agreed conditions.',
    references: [REF_GLOSSARY, REF_ITIL]
  },

  // ── The Four Dimensions and Guiding Principles (16) ──
  {
    domain: DIM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'An exam candidate is asked to name the four dimensions of service management. Which option lists them correctly?',
    options: opts4(
      'People; Process; Technology; Partners',
      'Organizations and people; Information and technology; Partners and suppliers; Value streams and processes',
      'Plan; Design; Transition; Operate',
      'Strategy; Tactics; Operations; Governance'
    ),
    correct: ['b'],
    explanation: 'The four dimensions are: organizations and people; information and technology; partners and suppliers; and value streams and processes. All four must be considered for a holistic approach.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A new ticketing tool is technically sound, but adoption collapses because nobody clarified responsibilities, retrained staff, or addressed a blame-oriented culture. Which dimension was inadequately addressed?',
    options: opts4(
      'Information and technology',
      'Organizations and people',
      'Partners and suppliers',
      'Value streams and processes'
    ),
    correct: ['b'],
    explanation: 'Roles, responsibilities, skills, leadership and culture fall under the organizations and people dimension. Ignoring it undermines adoption even when the technology dimension is sound.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'An organisation must agree data-sharing terms, integration responsibilities, and an underpinning contract with an external payments processor. Which dimension is primarily in focus?',
    options: opts4(
      'Organizations and people',
      'Partners and suppliers',
      'Information and technology',
      'Value streams and processes'
    ),
    correct: ['b'],
    explanation: 'Contracts, responsibilities, integration arrangements and sourcing decisions involving third parties are covered by the partners and suppliers dimension.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 3, type: QType.MULTI, isTeaser: true,
    stem: 'Select ALL factors that the PESTLE model identifies as external influences acting on all four dimensions.',
    options: opts5(
      'Political and legal factors',
      'Economic factors',
      'Social and technological factors',
      'Environmental factors',
      'The organisation\'s internal team morale only'
    ),
    correct: ['a', 'b', 'c', 'd'],
    explanation: 'PESTLE covers Political, Economic, Social, Technological, Legal and Environmental external factors. Internal team morale is an internal organizational factor, not part of the external PESTLE model.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A team needs to define the sequence of activities, the controls, and who performs each step to turn a customer request into a delivered result. Which dimension is most directly involved?',
    options: opts4(
      'Information and technology',
      'Partners and suppliers',
      'Value streams and processes',
      'Organizations and people'
    ),
    correct: ['c'],
    explanation: 'How work is organised and coordinated — the activities, workflows, controls and procedures used to create value — is the value streams and processes dimension.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'According to ITIL 4, the guiding principles are best described as which of the following?',
    options: opts4(
      'Mandatory rules that must be followed exactly in every situation',
      'Universal recommendations that can guide an organisation in all circumstances regardless of changes in its goals or structure',
      'A fixed sequence of project phases',
      'A list of the ITIL practices'
    ),
    correct: ['b'],
    explanation: 'The guiding principles are universal and enduring recommendations that help an organisation in almost any circumstance. They are not rigid rules and remain relevant despite changes in goals, strategies or structure.',
    references: [REF_PRINCIPLES, REF_SVS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Before improving a workflow, a team insists on directly observing the current process and measuring it rather than relying on a two-year-old assessment. Which guiding principle does this best reflect?',
    options: opts4(
      'Keep it simple and practical',
      'Start where you are',
      'Optimize and automate',
      'Focus on value'
    ),
    correct: ['b'],
    explanation: '"Start where you are" advises assessing the current state and basing decisions on accurate, directly observed information rather than assumptions or stale reports, reusing what is usable.',
    references: [REF_PRINCIPLES, REF_SVS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A director wants to deliver an 18-month transformation as one massive release with no interim feedback. Which guiding principle most directly challenges this approach?',
    options: opts4(
      'Progress iteratively with feedback',
      'Think and work holistically',
      'Keep it simple and practical',
      'Collaborate and promote visibility'
    ),
    correct: ['a'],
    explanation: '"Progress iteratively with feedback" recommends breaking work into manageable increments, each evaluated and adjusted using feedback, rather than a single large undertaking.',
    references: [REF_PRINCIPLES, REF_SVS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'Teams refuse to share status and decisions, so trust erodes and effort is duplicated. Which guiding principle most directly addresses this dysfunction?',
    options: opts4(
      'Collaborate and promote visibility',
      'Optimize and automate',
      'Start where you are',
      'Keep it simple and practical'
    ),
    correct: ['a'],
    explanation: '"Collaborate and promote visibility" encourages working together across boundaries and making work and decisions visible, which builds trust and reduces duplicated or hidden effort.',
    references: [REF_PRINCIPLES, REF_SVS]
  },
  {
    domain: DIM, difficulty: 3, type: QType.SINGLE,
    stem: 'A manager wants to automate a poorly understood, wasteful approval chain immediately. According to "Optimize and automate", what should be done first?',
    options: opts4(
      'Automate first, then study the process later',
      'Optimize the process (understand, simplify, remove waste) before automating it',
      'Outsource the process to a supplier',
      'Escalate the process to executive governance'
    ),
    correct: ['b'],
    explanation: '"Optimize and automate" advises optimising the work first — understanding it, simplifying it and removing waste — and only then automating. Automating a wasteful process simply makes the waste faster.',
    references: [REF_PRINCIPLES, REF_SVS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A solution is tuned to make one team\'s dashboard look good but it degrades the overall customer journey. Which guiding principle warns against this?',
    options: opts4(
      'Think and work holistically',
      'Start where you are',
      'Keep it simple and practical',
      'Focus on value'
    ),
    correct: ['a'],
    explanation: '"Think and work holistically" stresses that no service or component stands alone; optimising one part in isolation can harm the end-to-end outcome and overall value.',
    references: [REF_PRINCIPLES, REF_SVS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: When applying "Focus on value", every activity an organisation performs should contribute, directly or indirectly, to value for one or more stakeholders.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. "Focus on value" requires that everything the organisation does maps back to value for itself, its customers, or other stakeholders, and that value is understood from the consumer\'s perspective.',
    references: [REF_PRINCIPLES, REF_VALUE]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'A control procedure has acquired many "just in case" checks; analysis shows most add no value. Which guiding principle supports eliminating them?',
    options: opts4(
      'Keep it simple and practical',
      'Collaborate and promote visibility',
      'Start where you are',
      'Progress iteratively with feedback'
    ),
    correct: ['a'],
    explanation: '"Keep it simple and practical" recommends using the minimum number of steps to accomplish an objective and removing anything that fails to provide value or a useful outcome.',
    references: [REF_PRINCIPLES, REF_SVS]
  },
  {
    domain: DIM, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement about how the ITIL 4 guiding principles should be used is correct?',
    options: opts4(
      'Only one principle should ever be selected and applied per decision',
      'All principles should be reviewed for relevance, and the relevant ones applied together, in every situation',
      'They replace the four dimensions',
      'They are only used by the continual improvement practice'
    ),
    correct: ['b'],
    explanation: 'The principles are not mutually exclusive. Organisations should consider all of them, judge how each applies, and apply the relevant ones together rather than picking just one.',
    references: [REF_PRINCIPLES, REF_SVS]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE,
    stem: 'An architect must reconcile the organisation\'s knowledge, information, the technologies used to manage services, and information security requirements. Which dimension covers all of this?',
    options: opts4(
      'Organizations and people',
      'Information and technology',
      'Partners and suppliers',
      'Value streams and processes'
    ),
    correct: ['b'],
    explanation: 'The information and technology dimension covers the information and knowledge needed to manage services, plus the technologies used, including considerations such as security and compliance.',
    references: [REF_DIMENSIONS, REF_ITIL]
  },
  {
    domain: DIM, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'When taking a holistic approach, to what scope should the four dimensions be applied?',
    options: opts4(
      'Only to the technology components of a service',
      'To every product and service, and to the SVS as a whole',
      'Only to services that involve external suppliers',
      'Only during the design stage of a service'
    ),
    correct: ['b'],
    explanation: 'All four dimensions should be considered for every product and service and across the whole service value system, not selectively, to maintain a balanced and holistic approach.',
    references: [REF_DIMENSIONS, REF_SVS]
  },

  // ── Service Value System and Value Chain (13) ──
  {
    domain: SVS, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What does the ITIL service value system (SVS) describe?',
    options: opts4(
      'A fixed project methodology for software delivery',
      'How all the components and activities of an organisation work together as a system to enable value creation',
      'A single ITIL practice for change control',
      'The contract between a provider and a supplier'
    ),
    correct: ['b'],
    explanation: 'The SVS describes how all the components and activities of an organisation work together as a system to enable value creation, helping the organisation respond to opportunity and demand.',
    references: [REF_SVS, REF_ITIL]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which option lists the five components of the ITIL service value system?',
    options: opts4(
      'Guiding principles; governance; service value chain; practices; continual improvement',
      'Plan; engage; design and transition; obtain/build; deliver and support',
      'People; process; technology; partners; value',
      'Strategy; tactics; operations; governance; audit'
    ),
    correct: ['a'],
    explanation: 'The five SVS components are the guiding principles, governance, the service value chain, practices, and continual improvement. The second option lists value chain activities, not SVS components.',
    references: [REF_SVS, REF_ITIL]
  },
  {
    domain: SVS, difficulty: 1, type: QType.SINGLE,
    stem: 'What are the two inputs that trigger the ITIL service value system?',
    options: opts4(
      'Cost and risk',
      'Opportunity and demand',
      'Utility and warranty',
      'People and technology'
    ),
    correct: ['b'],
    explanation: 'Opportunity (options or possibilities to add value) and demand (the need for services among consumers) are the two inputs to the SVS; value is the output.',
    references: [REF_SVS, REF_ITIL]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the central element of the SVS that represents the set of interconnected activities an organisation performs to deliver a valuable product or service?',
    options: opts4(
      'The service value chain',
      'The continual improvement register',
      'The guiding principles',
      'Governance'
    ),
    correct: ['a'],
    explanation: 'The service value chain is the central operating model of the SVS — a set of six interconnected activities that convert demand into value-generating products and services.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which option correctly lists the six service value chain activities?',
    options: opts5(
      'Plan; Improve; Engage; Design and transition; Obtain/build; Deliver and support',
      'Plan; Do; Check; Act; Review; Audit',
      'Strategy; Design; Transition; Operation; Improvement; Governance',
      'Identify; Assess; Authorise; Implement; Review; Close',
      'Create; Build; Test; Release; Deploy; Operate'
    ),
    correct: ['a'],
    explanation: 'The six value chain activities are Plan, Improve, Engage, Design and transition, Obtain/build, and Deliver and support. They can be combined in different sequences to form value streams.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team focuses on understanding stakeholder needs, maintaining good relationships, and ensuring transparency with customers and suppliers. Which value chain activity is this?',
    options: opts4(
      'Engage',
      'Plan',
      'Obtain/build',
      'Deliver and support'
    ),
    correct: ['a'],
    explanation: 'The Engage activity provides a good understanding of stakeholder needs, continual engagement, transparency, and good relationships with all stakeholders.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Components needed for a service are procured from a supplier and made available for use. Which value chain activity is primarily involved?',
    options: opts4(
      'Obtain/build',
      'Engage',
      'Improve',
      'Plan'
    ),
    correct: ['a'],
    explanation: 'The Obtain/build activity ensures service components are available when and where they are needed and meet agreed specifications, whether built in-house or procured.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'A service is operated to agreed specifications and users receive day-to-day support. Which value chain activity is this?',
    options: opts4(
      'Deliver and support',
      'Design and transition',
      'Plan',
      'Improve'
    ),
    correct: ['a'],
    explanation: 'The Deliver and support activity ensures services are delivered and supported according to agreed specifications and stakeholder expectations.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 3, type: QType.SINGLE,
    stem: 'A team builds a "handle a new joiner" value stream that links several value chain activities and practices. What does this best illustrate about value streams?',
    options: opts4(
      'A value stream is a fixed, mandatory sequence identical for every organisation',
      'A value stream is a specific combination of value chain activities and practices designed for a particular scenario',
      'A value stream replaces the service value chain entirely',
      'A value stream is only the Plan activity repeated'
    ),
    correct: ['b'],
    explanation: 'A value stream is a series of steps an organisation uses to create and deliver products and services; it combines selected value chain activities and practices tailored to a specific scenario.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which SVS component represents the means by which an organisation is directed and controlled, including policy and oversight?',
    options: opts4(
      'Governance',
      'The service value chain',
      'Practices',
      'Continual improvement'
    ),
    correct: ['a'],
    explanation: 'Governance is the SVS component covering how the organisation is directed and controlled, including evaluating, directing, and monitoring activities in line with policy and stakeholder needs.',
    references: [REF_SVS, REF_GLOSSARY]
  },
  {
    domain: SVS, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: The six service value chain activities can be combined in many different sequences, so there is no single fixed order that must always be followed.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The value chain activities are interconnected and combined in different ways to form value streams; there is no single mandatory sequence for all situations.',
    references: [REF_SVC, REF_SVS]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'The "Improve" value chain activity primarily ensures what across the organisation?',
    options: opts4(
      'Continual improvement of products, services, and practices across all value chain activities and the four dimensions',
      'Only the procurement of new hardware',
      'Only the resolution of individual incidents',
      'Only the authorisation of changes'
    ),
    correct: ['a'],
    explanation: 'The Improve activity ensures continual improvement of products, services, practices, and all value chain activities across the four dimensions of service management.',
    references: [REF_SVC, REF_CI]
  },
  {
    domain: SVS, difficulty: 2, type: QType.SINGLE,
    stem: 'Why are practices included as a component of the service value system?',
    options: opts4(
      'They are the organisational resources (sets of resources) used to perform work and support value chain activities',
      'They replace the guiding principles',
      'They are the sole input to the SVS',
      'They are external regulations imposed on the organisation'
    ),
    correct: ['a'],
    explanation: 'Practices are sets of organisational resources designed for performing work or accomplishing an objective. They support one or more value chain activities and are therefore an SVS component.',
    references: [REF_PRACTICES, REF_SVS]
  },

  // ── ITIL Practices (23) ──
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which ITIL 4 practice has the purpose of minimising the negative impact of incidents by restoring normal service operation as quickly as possible?',
    options: opts4(
      'Incident management',
      'Problem management',
      'Change enablement',
      'Service level management'
    ),
    correct: ['a'],
    explanation: 'Incident management aims to minimise the negative impact of incidents by restoring normal service operation as quickly as possible.',
    references: [REF_INCIDENT, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A recurring fault keeps causing incidents. A team investigates the underlying cause to stop it happening again, even though service was already restored with a temporary fix. Which practice is being applied?',
    options: opts4(
      'Problem management',
      'Incident management',
      'Service request management',
      'Service desk'
    ),
    correct: ['a'],
    explanation: 'Problem management identifies the actual or potential causes of incidents and manages workarounds and known errors to reduce the likelihood and impact of incidents.',
    references: [REF_PROBLEM, REF_INCIDENT]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'In ITIL 4 problem management, a problem that has been analysed and has not been resolved is recorded as which of the following so future incidents can be handled faster?',
    options: opts4(
      'A known error',
      'A service request',
      'A standard change',
      'A configuration item'
    ),
    correct: ['a'],
    explanation: 'A known error is a problem that has been analysed but not resolved. Recording it, often with a workaround, helps the service desk handle related incidents more quickly.',
    references: [REF_PROBLEM, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A documented way to reduce or eliminate the impact of an incident or problem for which a full resolution is not yet available is called what in ITIL 4?',
    options: opts4(
      'A workaround',
      'An emergency change',
      'A service level agreement',
      'A value stream'
    ),
    correct: ['a'],
    explanation: 'A workaround is a solution that reduces or eliminates the impact of an incident or problem for which a full resolution is not yet available. Workarounds are often recorded with known errors.',
    references: [REF_PROBLEM, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the purpose of the change enablement practice in ITIL 4?',
    options: opts4(
      'To maximise the number of successful service and product changes by properly assessing risks, authorising changes, and managing a change schedule',
      'To restore normal service operation as quickly as possible',
      'To act as the single point of contact for users',
      'To negotiate and agree service targets with customers'
    ),
    correct: ['a'],
    explanation: 'Change enablement maximises the number of successful IT changes by ensuring risks are properly assessed, changes are authorised, and the change schedule is managed.',
    references: [REF_CHANGE, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A routine, low-risk change that follows a documented and pre-authorised procedure (for example a standard mailbox provisioning) is which ITIL 4 change type?',
    options: opts4(
      'Standard change',
      'Normal change',
      'Emergency change',
      'Major incident'
    ),
    correct: ['a'],
    explanation: 'A standard change is low-risk, pre-authorised, well understood and follows a documented procedure. It does not need individual risk assessment and authorisation each time.',
    references: [REF_CHANGE, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A change must be implemented immediately to resolve an ongoing major incident. Which change type is this, and how is it typically handled?',
    options: opts4(
      'An emergency change, assessed and authorised as quickly as possible, often by a dedicated emergency change authority',
      'A standard change, requiring no authorisation at all',
      'A normal change, scheduled weeks in advance',
      'A service request, fulfilled by the service desk catalogue'
    ),
    correct: ['a'],
    explanation: 'Emergency changes must be implemented as soon as possible, typically with an expedited assessment and a separate (often dedicated) emergency change authority, while still controlling risk.',
    references: [REF_CHANGE, REF_INCIDENT]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A normal change carries significant risk and must be assessed and authorised before being scheduled. Who or what typically performs this authorisation in ITIL 4?',
    options: opts4(
      'The appropriate change authority for that type of change',
      'Any user who raises a ticket',
      'The incident manager only',
      'The supplier delivering the change'
    ),
    correct: ['a'],
    explanation: 'Normal changes are assessed and authorised by the appropriate change authority. Matching the right authority to the change type keeps change enablement efficient and controlled.',
    references: [REF_CHANGE, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 1, type: QType.SINGLE, isTeaser: true,
    stem: 'Which ITIL 4 practice provides the single, central point of contact between the service provider and all of its users?',
    options: opts4(
      'Service desk',
      'Change enablement',
      'Problem management',
      'Continual improvement'
    ),
    correct: ['a'],
    explanation: 'The service desk practice provides a single point of contact for users, capturing demand for incident resolution and service requests and coordinating communication.',
    references: [REF_SD, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A user submits a predefined, low-risk request to be granted access to an approved shared mailbox. Which practice should handle this?',
    options: opts4(
      'Service request management',
      'Incident management',
      'Problem management',
      'Change enablement'
    ),
    correct: ['a'],
    explanation: 'A predefined, normal, low-risk user request is handled by service request management, which manages the lifecycle of service requests using standardised, often automated, procedures.',
    references: [REF_PRACTICES, REF_SD]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'What is the purpose of the service level management practice in ITIL 4?',
    options: opts4(
      'To set clear business-based targets for service levels and to ensure delivery is properly assessed, monitored, and managed against these targets',
      'To restore normal service after an unplanned interruption',
      'To authorise and schedule changes',
      'To act as the single point of contact for users'
    ),
    correct: ['a'],
    explanation: 'Service level management sets clear, business-based service-level targets and ensures service delivery is monitored and managed against them, in collaboration with customers.',
    references: [REF_SLM, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL activities or skills that ITIL 4 associates with effective service level management.',
    options: opts5(
      'Engaging with customers to understand and capture requirements',
      'Negotiating and agreeing realistic, business-relevant targets',
      'Monitoring and reviewing actual service performance against targets',
      'Approving every emergency change in the organisation',
      'Building relationships and trust with customers and users'
    ),
    correct: ['a', 'b', 'c', 'e'],
    explanation: 'Effective SLM involves engaging customers, capturing requirements, negotiating realistic targets, monitoring and reviewing performance, and relationship management. Authorising emergency changes belongs to change enablement, not SLM.',
    references: [REF_SLM, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'In ITIL 4, a "practice" is best defined as which of the following?',
    options: opts4(
      'A set of organisational resources designed for performing work or accomplishing an objective',
      'A single mandatory document template',
      'A fixed sequence of value chain activities',
      'An external regulation imposed on the organisation'
    ),
    correct: ['a'],
    explanation: 'ITIL 4 defines a practice as a set of organisational resources designed for performing work or accomplishing an objective. Practices support one or more value chain activities.',
    references: [REF_PRACTICES, REF_GLOSSARY]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The ITIL 4 continual improvement model begins with which step?',
    options: opts4(
      'What is the vision?',
      'Where are we now?',
      'Did we get there?',
      'Take action'
    ),
    correct: ['a'],
    explanation: 'The continual improvement model starts with "What is the vision?", which links the improvement to the organisation\'s vision and objectives before assessing the current state.',
    references: [REF_CI, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which step of the continual improvement model asks the organisation to assess where it currently stands before planning improvements?',
    options: opts4(
      'Where are we now?',
      'What is the vision?',
      'How do we get there?',
      'Did we get there?'
    ),
    correct: ['a'],
    explanation: 'The "Where are we now?" step assesses the current state, including an objective baseline measurement, so improvement progress can later be evaluated.',
    references: [REF_CI, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which artefact does the continual improvement practice use to capture, document, and track improvement opportunities and ideas?',
    options: opts4(
      'The continual improvement register (CIR)',
      'The change schedule',
      'The configuration management database',
      'The service level agreement'
    ),
    correct: ['a'],
    explanation: 'The continual improvement register (CIR) is used to capture, document, assess and track improvement ideas across the organisation. It is a key artefact of the continual improvement practice.',
    references: [REF_CI, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.TRUE_FALSE, isTeaser: true,
    stem: 'True or False: In ITIL 4, continual improvement should be everyone\'s responsibility and embedded into day-to-day work, not confined to a single dedicated team.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. ITIL 4 stresses that while a team may coordinate improvement, continual improvement is everyone\'s responsibility and should be integrated into everyday activities and behaviours.',
    references: [REF_CI, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 3, type: QType.SINGLE,
    stem: 'During a major incident, what is the correct relationship between incident management and problem management?',
    options: opts4(
      'Incident management restores service quickly (possibly using a workaround) while problem management investigates the underlying cause',
      'Problem management restores service while incident management is suspended',
      'They are the same practice with different names',
      'Neither is involved; only change enablement applies'
    ),
    correct: ['a'],
    explanation: 'Incident management focuses on rapid restoration of service (often via a workaround), while problem management addresses the root cause to prevent recurrence. The two practices are complementary.',
    references: [REF_INCIDENT, REF_PROBLEM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A modern service desk encourages users to resolve common requests via a knowledge base and self-service portal before contacting an agent. Which ITIL 4 concept does this support?',
    options: opts4(
      'Shifting left — resolving demand earlier and closer to the user',
      'Emergency change authorisation',
      'Problem control phases',
      'The PESTLE model'
    ),
    correct: ['a'],
    explanation: 'Enabling self-service and knowledge so issues are resolved earlier and closer to the user reflects the "shift left" idea associated with an effective, user-centred service desk.',
    references: [REF_SD, REF_PRACTICES]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A governance team is mapping its practices and wants to know which one of the following ITIL 4 practices is classified as a general management practice rather than a service management or technical management practice.',
    options: opts4(
      'Continual improvement',
      'Incident management',
      'Service desk',
      'Deployment management'
    ),
    correct: ['a'],
    explanation: 'Continual improvement is a general management practice. Incident management and service desk are service management practices; deployment management is a technical management practice.',
    references: [REF_PRACTICES, REF_CI]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'A trainer asks learners to name the three groupings ITIL 4 uses to organise all of its practices. Which option correctly names those three practice groupings?',
    options: opts4(
      'General management, service management, and technical management practices',
      'Strategic, tactical, and operational practices',
      'Plan, build, and run practices',
      'Internal, external, and hybrid practices'
    ),
    correct: ['a'],
    explanation: 'ITIL 4 groups practices into general management practices, service management practices, and technical management practices.',
    references: [REF_PRACTICES, REF_ITIL]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes an incident from a problem in ITIL 4?',
    options: opts4(
      'An incident is an unplanned interruption or quality reduction; a problem is a cause, or potential cause, of one or more incidents',
      'An incident and a problem are the same thing',
      'A problem is always resolved before any incident is logged',
      'An incident is a pre-authorised routine request'
    ),
    correct: ['a'],
    explanation: 'An incident is an unplanned interruption to a service or a reduction in its quality. A problem is a cause, or potential cause, of one or more incidents. Problem management may produce workarounds and known errors.',
    references: [REF_INCIDENT, REF_PROBLEM]
  },
  {
    domain: PRAC, difficulty: 2, type: QType.SINGLE,
    stem: 'How is service request management best optimised according to ITIL 4 guidance?',
    options: opts4(
      'By standardising and automating predefined requests with clear workflows and communicated expectations',
      'By treating every request as a major incident',
      'By handling each request with a unique ad-hoc process',
      'By routing all requests through emergency change'
    ),
    correct: ['a'],
    explanation: 'Service request management is most effective when requests are predefined, standardised, and automated where practical, with clear workflows and well-communicated fulfilment expectations.',
    references: [REF_PRACTICES, REF_SD]
  }
];

const ITIL4_DOMAINS = [
  { name: KEY, weight: 20 },
  { name: DIM, weight: 25 },
  { name: SVS, weight: 20 },
  { name: PRAC, weight: 35 }
];

const ITIL4_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'axelos-itil4-foundation-p1',
    code: 'ITIL4-FND-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 4 — a full 60-minute, 65-question, blueprint-weighted set covering key concepts of service management, the four dimensions and guiding principles, the service value system and value chain, and ITIL practices.',
    questions: P1
  },
  {
    slug: 'axelos-itil4-foundation-p2',
    code: 'ITIL4-FND-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 4 — a second 60-minute, 65-question, blueprint-weighted set with an entirely different question pool.',
    questions: P2
  },
  {
    slug: 'axelos-itil4-foundation-p3',
    code: 'ITIL4-FND-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 4 — a third 60-minute, 65-question, blueprint-weighted set with an entirely different question pool.',
    questions: P3
  },
  {
    slug: 'axelos-itil4-foundation-p4',
    code: 'ITIL4-FND-P4',
    titleSuffix: 'Practice Exam 4',
    descriptionSuffix: 'Practice exam 4 of 4 — a fourth 60-minute, 65-question, blueprint-weighted set with an entirely different question pool.',
    questions: P4
  }
];

const ITIL4_BUNDLE = {
  slug: 'axelos-itil4-foundation',
  title: 'ITIL 4 Foundation',
  description: 'All 4 ITIL 4 Foundation practice exams in one bundle — covering key concepts of service management, the four dimensions and guiding principles, the service value system and value chain, and ITIL practices, aligned to the ITIL 4 Foundation syllabus.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 38000 // USD 380 — PRACTICE + real-exam voucher tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the ITIL 4 Foundation bundle. Safe to call
 * repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:itil4-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedItil4(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'axelos' } });
  await db.vendor.upsert({
    where: { slug: 'axelos' },
    update: { name: 'AXELOS', description: 'AXELOS best-practice certifications — including ITIL 4 service management and the ITIL 4 Foundation credential.' },
    create: { slug: 'axelos', name: 'AXELOS', description: 'AXELOS best-practice certifications — including ITIL 4 service management and the ITIL 4 Foundation credential.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'axelos' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of ITIL4_EXAMS) {
    const title = `ITIL 4 Foundation — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the ITIL 4 Foundation syllabus domains.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Foundational',
      durationMinutes: 60,
      passingScore: 65,
      questionCount: e.questions.length,
      domains: ITIL4_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:itil4-seed' } });
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
          generatedBy: 'manual:itil4-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: ITIL4_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: ITIL4_BUNDLE.slug },
    update: {
      title: ITIL4_BUNDLE.title,
      description: ITIL4_BUNDLE.description,
      price: ITIL4_BUNDLE.price,
      priceVoucher: ITIL4_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: ITIL4_BUNDLE.slug,
      title: ITIL4_BUNDLE.title,
      description: ITIL4_BUNDLE.description,
      price: ITIL4_BUNDLE.price,
      priceVoucher: ITIL4_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'axelos-itil4-foundation-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'axelos-itil4-foundation-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'axelos-itil4-foundation-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'axelos-itil4-foundation-p4', tier: 'PRACTICE' as const, position: 4 },
    { examSlug: 'axelos-itil4-foundation-p1', tier: 'VOUCHER' as const, position: 5 }
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
