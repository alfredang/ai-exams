/**
 * PMI-RMP bundle seed — vendor, three practice-exam variants, bundle,
 * and 195 blueprint-aligned questions. Idempotent: replaces rows
 * tagged `generatedBy: 'manual:pmirmp-seed'` and upserts catalog rows.
 *
 * Exported as `seedPmiRmp(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/pmirmp.ts`) and the protected
 * admin API (`/api/admin/seed-pmirmp`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is original, scenario-based, and authored against the
 * public PMI-RMP exam content outline, The Standard for Risk Management
 * in Portfolios, Programs, and Projects, and PMBOK Guide risk practices
 * (qualitative & quantitative analysis, EMV, decision trees, Monte Carlo
 * simulation, risk responses, and management/contingency reserves).
 * These are practice items only — they are not copied from, and do not
 * reproduce, any real PMI exam.
 *
 * PMI-RMP domain blueprint (sum 100):
 *   - Risk Strategy and Planning   — 22 (14 per 65-q variant)
 *   - Risk Identification          — 23 (15)
 *   - Risk Analysis                — 23 (15)
 *   - Risk Response                — 13 (8)
 *   - Monitor and Close Risks      — 19 (13)
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

const STRAT = 'Risk Strategy and Planning';
const IDENT = 'Risk Identification';
const ANALYSIS = 'Risk Analysis';
const RESPONSE = 'Risk Response';
const MONITOR = 'Monitor and Close Risks';

const REF_RMP = { label: 'PMI — PMI Risk Management Professional (PMI-RMP)', url: 'https://www.pmi.org/certifications/risk-management-rmp' };
const REF_STD_RISK = { label: 'PMI — The Standard for Risk Management in Portfolios, Programs, and Projects', url: 'https://www.pmi.org/standards/risk-management' };
const REF_PMBOK = { label: 'PMI — A Guide to the Project Management Body of Knowledge (PMBOK Guide)', url: 'https://www.pmi.org/standards/pmbok' };
const REF_PMI_STANDARDS = { label: 'PMI — Standards and publications', url: 'https://www.pmi.org/standards' };
const REF_PMI_ETHICS = { label: 'PMI — Code of Ethics and Professional Conduct', url: 'https://www.pmi.org/about/ethics/code' };
const REF_RMP_ECO = { label: 'PMI — PMI-RMP Exam Content Outline', url: 'https://www.pmi.org/certifications/risk-management-rmp/earn-the-rmp/rmp-exam-prep' };
const REF_PMI_BLOG_RISK = { label: 'PMI — Risk management resources', url: 'https://www.pmi.org/learning/featured-topics/risk' };
const REF_MONTECARLO = { label: 'PMI — Quantitative risk analysis and Monte Carlo simulation', url: 'https://www.pmi.org/learning/library/quantitative-risk-analysis-simulation-models-8000' };
const REF_EMV = { label: 'PMI — Expected monetary value and decision-tree analysis', url: 'https://www.pmi.org/learning/library/expected-monetary-value-decision-tree-6928' };
const REF_RISKREG = { label: 'PMI — The project risk register', url: 'https://www.pmi.org/learning/library/risk-register-roles-responsibilities-6643' };
const REF_RESERVE = { label: 'PMI — Contingency and management reserves', url: 'https://www.pmi.org/learning/library/contingency-management-reserves-risk-7137' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const tf = (): Opt[] => [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Risk Strategy and Planning (14) ──
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Plan Risk Management process produces which primary output that documents how risk activities will be structured and performed?',
    options: opts4(
      'The risk register',
      'The risk management plan',
      'The risk report',
      'The issue log'
    ),
    correct: ['b'],
    explanation: 'Plan Risk Management produces the risk management plan, which defines methodology, roles, funding, timing, risk categories, and probability/impact definitions. The risk register and risk report are produced by later processes; an issue log tracks issues, not risk planning.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A sponsor states the organization is generally willing to accept significant uncertainty to pursue an aggressive innovation goal. Which concept does this statement primarily describe?',
    options: opts4(
      'Risk threshold',
      'Risk appetite',
      'Residual risk',
      'Secondary risk'
    ),
    correct: ['b'],
    explanation: 'Risk appetite is the degree of uncertainty an organization is willing to take on in anticipation of a reward. A risk threshold is the measurable level of exposure at which action is taken; residual and secondary risks relate to responses, not the high-level appetite statement.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'During risk planning the team defines a Probability and Impact matrix. What is its main purpose?',
    options: opts4(
      'To calculate the project contingency reserve',
      'To establish rating scales and the rules used to prioritize risks for further analysis or action',
      'To list every identified risk with an owner',
      'To simulate cost and schedule outcomes'
    ),
    correct: ['b'],
    explanation: 'The probability and impact matrix specifies combinations of probability and impact that lead to a risk priority rating, ensuring consistent qualitative prioritization. Reserves come from quantitative analysis, the risk register lists risks/owners, and simulation is a quantitative technique.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk manager is tailoring the risk approach for a small, low-criticality project. Which action best reflects appropriate tailoring?',
    options: opts4(
      'Apply the full enterprise quantitative simulation process regardless of project size',
      'Scale the rigor, methods, and reporting of risk activities to the project size, complexity, and importance',
      'Skip risk management entirely because the project is small',
      'Use only the organization template without any adjustment'
    ),
    correct: ['b'],
    explanation: 'Tailoring scales risk effort to project size, complexity, and strategic importance. Over-applying heavy quantitative methods wastes effort, skipping risk management abandons due diligence, and blindly using a template ignores project context.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document defines the risk categories, often organized in a Risk Breakdown Structure (RBS)?',
    options: opts4(
      'The risk management plan',
      'The stakeholder register',
      'The project charter',
      'The cost baseline'
    ),
    correct: ['a'],
    explanation: 'The risk management plan typically contains the RBS, a hierarchical decomposition of potential sources of risk used to structure identification. The charter authorizes the project, the stakeholder register lists stakeholders, and the cost baseline is a budget.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL elements that are typically defined in the risk management plan.',
    options: opts4(
      'Risk methodology and the tools to be used',
      'Roles and responsibilities for risk activities',
      'The exact numeric value of every identified risk',
      'Probability and impact definitions and the P-I matrix'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'The risk management plan defines methodology, roles and responsibilities, funding, timing, categories, stakeholder risk appetite, and probability/impact definitions including the matrix. Specific numeric values of individual risks are produced later during analysis, not in the plan.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Risk attitude, appetite, and thresholds of key stakeholders should be considered when planning the risk management approach.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Stakeholder risk attitudes, appetite, and thresholds directly shape how aggressively risks are pursued or avoided and therefore inform the methodology, reporting, and escalation rules in the risk management plan.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk threshold differs from risk appetite in that a threshold is:',
    options: opts4(
      'A vague qualitative preference statement',
      'A measurable level of exposure above or below which action is required',
      'The same thing expressed differently',
      'Only relevant after the project closes'
    ),
    correct: ['b'],
    explanation: 'A risk threshold is the measurable level of risk exposure at which a stakeholder takes action; it operationalizes the broader, more qualitative risk appetite. They are related but distinct, and thresholds are applied throughout execution, not only at close.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is establishing a common risk vocabulary and categorization during planning important?',
    options: opts4(
      'It eliminates the need for a risk register',
      'It enables consistent identification, analysis, communication, and aggregation of risks across the team',
      'It guarantees no risks will occur',
      'It replaces the need for stakeholder engagement'
    ),
    correct: ['b'],
    explanation: 'A shared vocabulary and categories (e.g., an RBS) let the team identify, rate, communicate, and roll up risks consistently. It does not remove the register, prevent risks, or substitute for stakeholder engagement.',
    references: [REF_STD_RISK, REF_RMP_ECO]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization wants risk management embedded so that risk thinking informs decision-making rather than being a separate compliance task. This best reflects which principle?',
    options: opts4(
      'Risk management as a one-time start-up activity',
      'Risk management integrated into project governance and decision processes',
      'Risk management owned solely by the PMO and not the project team',
      'Risk management performed only when problems appear'
    ),
    correct: ['b'],
    explanation: 'Effective risk management is integrated and iterative, informing governance and decisions continuously rather than being a one-off, reactive, or isolated PMO task. This is a core principle in the Standard for Risk Management.',
    references: [REF_STD_RISK, REF_PMI_BLOG_RISK]
  },
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE,
    stem: 'Who is typically accountable for ensuring an appropriate, funded risk management approach exists on a project?',
    options: opts4(
      'Every individual contributor independently',
      'The project manager (supported by a risk owner/risk manager) with sponsor backing',
      'Only the external auditor',
      'Nobody — risk management is optional'
    ),
    correct: ['b'],
    explanation: 'The project manager, supported by risk owners or a dedicated risk manager and backed by the sponsor, is accountable for an adequate, funded approach. Auditors review, and risk management is a planned, deliberate practice, not optional.',
    references: [REF_PMBOK, REF_RMP]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A program splits into several projects. How should risk thresholds generally relate across these levels?',
    options: opts4(
      'Project thresholds should ignore program-level appetite',
      'Project thresholds should align with and roll up to program and organizational risk appetite',
      'Each project should set thresholds in complete isolation',
      'Thresholds only exist at the portfolio level'
    ),
    correct: ['b'],
    explanation: 'Risk thresholds should cascade and remain consistent: project thresholds align with program and organizational appetite so aggregated exposure stays within tolerances. Isolated or ignored alignment can breach overall organizational appetite.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which input is MOST useful when planning the risk management approach for a new project?',
    options: opts4(
      'The completed lessons-learned register from the same project',
      'Organizational process assets such as risk policies, templates, and lessons learned from prior projects',
      'The final project closeout report of the current project',
      'The vendor invoice register'
    ),
    correct: ['b'],
    explanation: 'Organizational process assets — risk policies, categories, templates, and historical lessons learned — strongly inform the planned approach. The current project is not yet complete, so its closeout/lessons cannot be a planning input, and invoices are unrelated.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.SINGLE,
    stem: 'A stakeholder insists on a "zero risk" project. What is the BEST response from the risk manager?',
    options: opts4(
      'Agree and promise to remove all uncertainty',
      'Explain that uncertainty is inherent; the goal is to manage exposure within agreed thresholds, not eliminate all risk',
      'Cancel the project because zero risk is impossible',
      'Ignore the stakeholder and proceed silently'
    ),
    correct: ['b'],
    explanation: 'All projects carry uncertainty; the realistic objective is to keep exposure within agreed appetite and thresholds while pursuing opportunities. Promising zero risk is misleading, cancellation is disproportionate, and ignoring the stakeholder fails engagement and ethics expectations.',
    references: [REF_STD_RISK, REF_PMI_ETHICS]
  },

  // ── Risk Identification (15) ──
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which output is created and progressively elaborated as risks are identified?',
    options: opts4(
      'The risk management plan',
      'The risk register',
      'The project charter',
      'The schedule baseline'
    ),
    correct: ['b'],
    explanation: 'Identify Risks creates the risk register, which is then progressively elaborated with analysis results, owners, and responses. The plan is from earlier planning, the charter authorizes the project, and the schedule baseline is a time baseline.',
    references: [REF_RISKREG, REF_PMBOK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A facilitator gathers experts anonymously over multiple rounds with controlled feedback to converge on identified risks. Which technique is this?',
    options: opts4(
      'Brainstorming',
      'Delphi technique',
      'Monte Carlo simulation',
      'Decision tree analysis'
    ),
    correct: ['b'],
    explanation: 'The Delphi technique uses anonymous, multi-round expert input with facilitated feedback to reduce bias and reach consensus on risks. Brainstorming is open and group-based; Monte Carlo and decision trees are quantitative analysis methods.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A team analyzes Strengths, Weaknesses, Opportunities, and Threats to surface both negative and positive risks. Which identification technique is described?',
    options: opts4(
      'SWOT analysis',
      'Variance analysis',
      'Earned value analysis',
      'Reserve analysis'
    ),
    correct: ['a'],
    explanation: 'SWOT analysis examines internal strengths/weaknesses and external opportunities/threats, helping identify both threats and opportunities. Variance, earned value, and reserve analysis are monitoring/quantitative techniques, not identification methods.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement BEST describes a well-written risk statement?',
    options: opts4(
      'A single vague word such as "weather"',
      'A cause leading to an uncertain event that, if it occurs, has an effect on one or more objectives',
      'A list of tasks remaining in the schedule',
      'A statement of a problem that has already occurred'
    ),
    correct: ['b'],
    explanation: 'A good risk statement follows a cause-risk-effect structure: a definite cause, an uncertain event, and its potential effect on objectives. A single word lacks structure, a task list is a schedule, and an already-occurred problem is an issue, not a risk.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'During design reviews the team uses prompt lists derived from the Risk Breakdown Structure. The primary benefit is:',
    options: opts4(
      'Guaranteeing all risks are quantified',
      'Stimulating broader thinking so categories of risk are not overlooked',
      'Replacing the need for a risk owner',
      'Eliminating residual risk'
    ),
    correct: ['b'],
    explanation: 'Prompt lists from an RBS systematically prompt the team across risk categories, reducing the chance that whole categories are missed. They do not quantify, assign owners, or remove residual risk.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid sources/techniques for identifying project risks.',
    options: opts4(
      'Documentation review of plans and assumptions',
      'Assumption and constraint analysis',
      'Stakeholder interviews and brainstorming',
      'Ignoring lessons learned from similar past projects'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Documentation review, assumption/constraint analysis, interviews, brainstorming, checklists, and historical lessons learned are all valid identification inputs. Ignoring prior lessons learned discards one of the richest sources of recurring risks.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Risk identification is an iterative activity that should be repeated throughout the project as new information emerges.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. New risks emerge and existing ones change as the project progresses, so identification is iterative and continues throughout the life cycle, not a one-time event at initiation.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A schedule assumption "the permit will be approved within 10 days" is uncertain and could affect the start date. The BEST action is to:',
    options: opts4(
      'Delete the assumption from the plan',
      'Record it as an identified risk (with cause and potential effect) in the risk register',
      'Treat it as an already-realized issue',
      'Ignore it because assumptions are always reliable'
    ),
    correct: ['b'],
    explanation: 'An uncertain assumption that could affect objectives is a risk and should be captured in the register with its cause and effect. It is not yet an issue, deleting it hides exposure, and assumptions are not inherently reliable.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'A checklist built from prior similar projects is used to identify risks. A key limitation of checklists is that they:',
    options: opts4(
      'Are always exhaustive and complete',
      'May not cover novel risks unique to the current project',
      'Cannot be updated',
      'Replace the risk register'
    ),
    correct: ['b'],
    explanation: 'Checklists capture known, recurring risks but can miss novel risks unique to the current context, so they should supplement, not replace, other techniques. They can and should be updated and do not replace the register.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.SINGLE,
    stem: 'During identification a participant raises a positive uncertain event that could shorten the schedule. How should it be treated?',
    options: opts4(
      'Discard it because only threats are risks',
      'Record it as an opportunity (a positive risk) in the risk register',
      'Convert it into an issue immediately',
      'Move it to the lessons-learned register'
    ),
    correct: ['b'],
    explanation: 'Risk includes both threats and opportunities. A beneficial uncertain event is a positive risk (opportunity) and belongs in the risk register so a response (e.g., exploit/enhance) can be planned.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which role is normally assigned in the risk register at or soon after identification to drive a specific risk?',
    options: opts4(
      'Risk owner',
      'External auditor',
      'Procurement clerk',
      'End user only'
    ),
    correct: ['a'],
    explanation: 'Each significant risk should be assigned a risk owner responsible for monitoring it and ensuring an appropriate response is planned and executed. Auditors and clerks are not accountable for managing the risk.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A cause-and-effect (Ishikawa) diagram is used in a workshop. Its main contribution to risk identification is to:',
    options: opts4(
      'Quantify the cost impact of each risk',
      'Trace potential root causes of a problem area so related risks can be surfaced',
      'Replace the probability and impact matrix',
      'Determine the contingency reserve'
    ),
    correct: ['b'],
    explanation: 'A fishbone/Ishikawa diagram organizes potential causes of an effect, helping the team surface root-cause-related risks. It is a qualitative identification aid, not a quantification, prioritization matrix, or reserve method.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'The most appropriate place to capture newly identified risks during execution is:',
    options: opts4(
      'The closed change log',
      'The risk register, with status and potential responses',
      'An informal email only',
      'The financial ledger'
    ),
    correct: ['b'],
    explanation: 'Newly identified risks should be entered into the risk register where they can be analyzed, owned, and tracked. Email-only capture or unrelated logs lose traceability and accountability.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.SINGLE,
    stem: 'Early in identification the team focuses only on cost risks and ignores stakeholder and external categories. What is the BEST corrective action?',
    options: opts4(
      'Continue, since cost is the only objective that matters',
      'Use the full Risk Breakdown Structure to systematically cover all risk categories',
      'Stop identification entirely',
      'Move all risks to the issue log'
    ),
    correct: ['b'],
    explanation: 'Narrow focus creates blind spots. Applying the full RBS ensures technical, management, commercial, external, and stakeholder categories are all examined, producing a more complete risk register.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'What distinguishes a risk from an issue in the register/log?',
    options: opts4(
      'A risk has already happened; an issue may happen',
      'A risk is an uncertain future event; an issue is a condition that has already occurred and needs action now',
      'They are identical',
      'Issues only appear during planning'
    ),
    correct: ['b'],
    explanation: 'A risk is an uncertain future event that may affect objectives; an issue is something that has already materialized and requires immediate management. When a risk occurs it typically converts into an issue handled via the issue log.',
    references: [REF_STD_RISK, REF_RISKREG]
  },

  // ── Risk Analysis (15) ──
  {
    domain: ANALYSIS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Perform Qualitative Risk Analysis primarily aims to:',
    options: opts4(
      'Produce a numeric model of overall project cost risk',
      'Prioritize individual risks by assessing probability and impact for further action',
      'Eliminate all identified risks',
      'Set the project budget baseline'
    ),
    correct: ['b'],
    explanation: 'Qualitative analysis assesses and prioritizes individual risks using probability and impact (and factors like urgency) so attention focuses on the most significant. Numeric overall modeling is quantitative analysis; it does not eliminate risks or set baselines.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk has a 30% probability and a $200,000 cost impact if it occurs. What is its Expected Monetary Value (EMV)?',
    options: opts4(
      '$200,000',
      '$60,000',
      '$30,000',
      '$6,000'
    ),
    correct: ['b'],
    explanation: 'EMV = probability × impact = 0.30 × $200,000 = $60,000. EMV gives a probability-weighted value used to compare risks and inform reserves and decision trees.',
    references: [REF_EMV, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which technique models combined effects of many uncertain variables to produce a probability distribution of project cost or schedule outcomes?',
    options: opts4(
      'Monte Carlo simulation',
      'SWOT analysis',
      'Probability and impact matrix',
      'Affinity diagram'
    ),
    correct: ['a'],
    explanation: 'Monte Carlo simulation runs many iterations sampling input distributions to produce a distribution (e.g., S-curve) of total cost or finish-date outcomes and confidence levels. SWOT and affinity diagrams are qualitative; the P-I matrix prioritizes individual risks.',
    references: [REF_MONTECARLO, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A decision tree compares Path A (EMV +$120,000) and Path B (EMV +$90,000). Based solely on EMV, which path should be chosen?',
    options: opts4(
      'Path B, because lower EMV is safer',
      'Path A, because it has the higher expected monetary value',
      'Neither — EMV cannot guide decisions',
      'Both equally'
    ),
    correct: ['b'],
    explanation: 'Decision-tree analysis chooses the branch with the most favorable EMV; for gains, the higher EMV (Path A, +$120,000) is preferred. EMV is precisely designed to support such decisions under uncertainty.',
    references: [REF_EMV, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL factors that may be assessed during qualitative risk analysis in addition to probability and impact.',
    options: opts4(
      'Urgency (proximity) of the risk',
      'Manageability and detectability',
      'The exact dollar value of the contingency reserve',
      'Quality of available data about the risk'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Qualitative analysis can also weigh urgency/proximity, manageability, detectability, strategic impact, and data quality. Computing the contingency reserve in dollars is a quantitative output, not a qualitative assessment factor.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Quantitative risk analysis is typically performed on the entire project, while qualitative analysis prioritizes individual risks.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Qualitative analysis prioritizes individual risks; quantitative analysis numerically models the aggregate effect of risks on overall project objectives (cost, schedule) using techniques like simulation.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'A Monte Carlo cost analysis shows an 80% confidence (P80) finish budget of $5.4M while the deterministic estimate is $5.0M. What does the $0.4M difference most directly inform?',
    options: opts4(
      'The management reserve set by the sponsor',
      'A data point for sizing the contingency reserve for known/identified risk exposure',
      'The fixed price quoted to the customer',
      'The earned value at completion'
    ),
    correct: ['b'],
    explanation: 'The gap between a chosen confidence level and the base estimate informs the contingency reserve held for identified risk exposure. Management reserve covers unknown-unknowns and is set separately; it is not the quoted price or an EV metric.',
    references: [REF_MONTECARLO, REF_RESERVE]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A tornado diagram produced from sensitivity analysis primarily helps the team:',
    options: opts4(
      'Assign risk owners',
      'See which individual risks or variables have the greatest influence on the outcome',
      'Track issues during execution',
      'Define the communications plan'
    ),
    correct: ['b'],
    explanation: 'A tornado diagram ranks variables by their influence on an outcome, focusing attention on the most impactful drivers. It is a sensitivity-analysis display, not an owner-assignment, issue-tracking, or communications tool.',
    references: [REF_PMBOK, REF_MONTECARLO]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Two risks share the same probability, but Risk X impacts a regulatory milestone while Risk Y impacts an internal nice-to-have. Qualitatively, Risk X should generally be:',
    options: opts4(
      'Rated lower because probabilities are equal',
      'Rated higher priority because its impact on objectives is more severe',
      'Removed from the register',
      'Treated identically to Risk Y'
    ),
    correct: ['b'],
    explanation: 'With equal probability, the risk whose impact on objectives is more severe (regulatory milestone) ranks higher in qualitative prioritization. Equal probability does not make impacts equal.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'Poor quality or sparse data about several risks is discovered during analysis. The BEST response is to:',
    options: opts4(
      'Assume the worst-case for everything and stop analysis',
      'Note the data-quality limitation, gather better information where feasible, and treat results with appropriate uncertainty',
      'Ignore those risks entirely',
      'Replace analysis with intuition only'
    ),
    correct: ['b'],
    explanation: 'Risk data quality assessment is part of credible analysis: document limitations, improve data where practical, and interpret results with appropriate caution. Ignoring risks or relying solely on intuition undermines the analysis.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 2, type: QType.SINGLE,
    stem: 'The product of probability and impact for an individual risk is often called its:',
    options: opts4(
      'Residual risk',
      'Risk score (or risk exposure)',
      'Management reserve',
      'Risk appetite'
    ),
    correct: ['b'],
    explanation: 'Combining probability and impact yields a risk score / exposure value used to rank risks in the P-I matrix. Residual risk remains after responses, management reserve covers unknowns, and appetite is an organizational attitude.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'An expert provides optimistic (O=8), most likely (M=12), and pessimistic (P=22) duration estimates. Using triangular distribution, the expected duration is:',
    options: opts4(
      '12 days',
      '14 days',
      '15 days',
      '22 days'
    ),
    correct: ['b'],
    explanation: 'Triangular expected value = (O + M + P) / 3 = (8 + 12 + 22) / 3 = 42 / 3 = 14 days. Three-point estimates feed quantitative schedule/cost risk models.',
    references: [REF_PMBOK, REF_MONTECARLO]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'A simulation outputs an S-curve for project cost. A stakeholder asks for the "P50" value. This represents:',
    options: opts4(
      'The maximum possible cost',
      'The cost at which there is a 50% probability the project completes at or below that amount',
      'The minimum possible cost',
      'The exact deterministic estimate'
    ),
    correct: ['b'],
    explanation: 'On a cumulative S-curve, the P50 is the cost with a 50% cumulative probability of finishing at or under it. Higher confidence levels (e.g., P80) sit further right and usually inform reserve decisions.',
    references: [REF_MONTECARLO, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST reason to perform quantitative analysis only on high-priority risks from qualitative analysis?',
    options: opts4(
      'Quantitative analysis is illegal for low risks',
      'It focuses limited analytical effort and data collection where it most affects overall objectives',
      'Low-priority risks cannot be modeled mathematically',
      'It guarantees zero residual risk'
    ),
    correct: ['b'],
    explanation: 'Quantitative modeling is effort- and data-intensive, so it is typically applied to risks that materially affect overall objectives, usually those prioritized by qualitative analysis. It is not illegal or impossible for low risks, and it never guarantees zero residual risk.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'EMV of a threat is conventionally expressed as a negative value because:',
    options: opts4(
      'Threats increase project value',
      'Threats represent potential loss, so their probability-weighted impact reduces expected value',
      'EMV cannot be negative',
      'Negative numbers are easier to read'
    ),
    correct: ['b'],
    explanation: 'By convention, threats carry negative EMV (potential loss) and opportunities positive EMV (potential gain), so summed EMV reflects net expected effect. This sign convention drives decision-tree and reserve calculations.',
    references: [REF_EMV, REF_PMBOK]
  },

  // ── Risk Response (8) ──
  {
    domain: RESPONSE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which set lists recognized strategies for NEGATIVE risks (threats)?',
    options: opts4(
      'Exploit, Share, Enhance, Accept',
      'Escalate, Avoid, Transfer, Mitigate, Accept',
      'Identify, Analyze, Plan, Close',
      'Initiate, Execute, Monitor, Control'
    ),
    correct: ['b'],
    explanation: 'Threat strategies are Escalate, Avoid, Transfer, Mitigate, and Accept. Exploit/Share/Enhance/Accept apply to opportunities; the other lists describe process groups or risk process steps, not response strategies.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team buys insurance and uses a fixed-price contract so a vendor bears a cost risk. Which threat response is this?',
    options: opts4(
      'Avoid',
      'Transfer',
      'Mitigate',
      'Accept'
    ),
    correct: ['b'],
    explanation: 'Transferring shifts the impact (and ownership of the response) to a third party, e.g., via insurance, warranties, or fixed-price contracts, usually for a premium. Avoid eliminates the cause, mitigate reduces probability/impact, and accept takes no proactive action.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'For a high-value opportunity the team adds expert staff to ensure the opportunity is fully realized. Which opportunity strategy is this?',
    options: opts4(
      'Exploit',
      'Mitigate',
      'Avoid',
      'Transfer'
    ),
    correct: ['a'],
    explanation: 'Exploit aims to make an opportunity definitely happen, e.g., by assigning the best resources. Enhance increases its probability/impact, share allocates it to a partner best able to capture it; mitigate/avoid/transfer are threat-side strategies.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 4, type: QType.SINGLE,
    stem: 'A risk is outside the project team\'s authority and would best be handled at the program or organizational level. The MOST appropriate response is:',
    options: opts4(
      'Accept it silently',
      'Escalate it to the appropriate level with the proper owner notified',
      'Mitigate it with project funds anyway',
      'Delete it from the register'
    ),
    correct: ['b'],
    explanation: 'Escalation is used when a risk is outside the project\'s scope of authority; ownership moves to the program/organization level and the project no longer actively manages it but records the escalation. Quietly accepting, force-fitting mitigation, or deleting it are inappropriate.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'After implementing a mitigation, a new risk arises directly because of that response. This new risk is called a:',
    options: opts4(
      'Residual risk',
      'Secondary risk',
      'Primary risk',
      'Risk trigger'
    ),
    correct: ['b'],
    explanation: 'A secondary risk arises as a direct result of implementing a risk response. Residual risk is the exposure that remains after the response; a trigger is a warning sign that a risk is about to occur.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Active acceptance of a risk typically involves establishing a contingency reserve to handle the risk if it occurs.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Active acceptance acknowledges the risk and sets aside a contingency reserve (time, money, or resources). Passive acceptance documents the risk but takes no proactive provision until it occurs.',
    references: [REF_RESERVE, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL attributes of an effective risk response.',
    options: opts4(
      'It is appropriate to the severity of the risk and cost-effective',
      'It is assigned to an accountable owner with agreed actions and timing',
      'It always eliminates all residual and secondary risk',
      'It is realistic and agreed by relevant stakeholders'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Good responses are proportionate, cost-effective, owned, time-bound, realistic, and stakeholder-agreed. They rarely eliminate all residual or secondary risk; remaining exposure must itself be assessed and tracked.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'A planned response that will only be executed if a defined warning sign (trigger) occurs is best described as a:',
    options: opts4(
      'Workaround',
      'Contingent response (fallback/contingency plan)',
      'Avoidance strategy',
      'Management reserve drawdown'
    ),
    correct: ['b'],
    explanation: 'A contingent response (contingency or fallback plan) is pre-planned but executed only when specific trigger conditions arise. A workaround is unplanned and reactive, avoidance removes the risk proactively, and management reserve covers unidentified risks.',
    references: [REF_PMBOK, REF_RESERVE]
  },

  // ── Monitor and Close Risks (13) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Monitor Risks is primarily concerned with:',
    options: opts4(
      'Identifying risks for the first time',
      'Tracking identified risks, evaluating response effectiveness, and identifying new/changed risks',
      'Setting the project budget',
      'Writing the project charter'
    ),
    correct: ['b'],
    explanation: 'Monitor Risks tracks agreed responses, monitors residual and emerging risks, evaluates response effectiveness, and reviews whether risk processes remain valid. Initial identification, budgeting, and chartering are separate activities.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A periodic meeting to review the status of risks, responses, and emerging risks is called a:',
    options: opts4(
      'Risk review / risk audit',
      'Daily stand-up only',
      'Steering committee budget hearing',
      'Procurement bid conference'
    ),
    correct: ['a'],
    explanation: 'Risk reviews and risk audits periodically examine risk status, response effectiveness, and the risk management process itself. The other meetings serve different governance, scheduling, or procurement purposes.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk audit specifically evaluates:',
    options: opts4(
      'Only the project budget',
      'The effectiveness of risk responses and of the overall risk management process',
      'Vendor invoices',
      'Team morale exclusively'
    ),
    correct: ['b'],
    explanation: 'A risk audit examines and documents the effectiveness of risk responses and the risk management process so it can be improved. It is broader than budgeting, invoicing, or morale.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk in the register has now passed its window and can no longer occur. The correct action during monitoring is to:',
    options: opts4(
      'Leave it open indefinitely',
      'Close the risk, recording the outcome and any lessons learned',
      'Convert it into a new threat',
      'Delete all trace of it'
    ),
    correct: ['b'],
    explanation: 'Risks that can no longer occur (or have occurred and been handled) should be formally closed with outcomes and lessons captured. Leaving them open clutters the register; deleting all trace loses valuable history.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'A key risk metric trends adversely and a defined trigger is reached. The risk owner should FIRST:',
    options: opts4(
      'Ignore it until the next monthly report',
      'Execute the pre-planned contingent response and inform stakeholders',
      'Open a new project',
      'Remove the risk from the register'
    ),
    correct: ['b'],
    explanation: 'When a trigger condition is met, the owner should execute the pre-planned contingency/fallback response and communicate status. Waiting, starting unrelated work, or deleting the risk are inappropriate and increase exposure.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid techniques/activities used during Monitor Risks.',
    options: opts4(
      'Risk reassessment of existing and new risks',
      'Risk audits of response and process effectiveness',
      'Reserve analysis to compare remaining reserve to remaining risk',
      'Permanently freezing the risk register'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Monitor Risks uses risk reassessment, risk audits, reserve analysis, and variance/trend analysis. The register is a living document and must not be frozen while the project is active.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Reserve analysis during monitoring compares the amount of remaining contingency reserve to the amount of remaining risk to judge adequacy.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Reserve analysis checks whether remaining contingency reserve is still sufficient for the remaining risk exposure, prompting replenishment, release, or escalation as appropriate.',
    references: [REF_RESERVE, REF_PMBOK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'During project closure, lessons learned about risk should be:',
    options: opts4(
      'Discarded as no longer useful',
      'Captured and shared so future projects and organizational process assets benefit',
      'Kept secret from other teams',
      'Used only by the auditor'
    ),
    correct: ['b'],
    explanation: 'Risk lessons learned should be documented and fed into organizational process assets and knowledge bases so future projects can identify and respond to similar risks more effectively. Discarding or hoarding them wastes the learning.',
    references: [REF_STD_RISK, REF_PMI_BLOG_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Which information is MOST appropriate for an executive-level risk report during monitoring?',
    options: opts4(
      'Every low-level technical risk in full detail',
      'Overall project risk exposure, key risks, trends, and required decisions',
      'Only the daily task list',
      'The complete source code repository'
    ),
    correct: ['b'],
    explanation: 'Executive risk reporting summarizes overall exposure, top risks, trends, and decisions needed, tailored to the audience. Exhaustive low-level detail or unrelated artifacts are not appropriate at that level.',
    references: [REF_STD_RISK, REF_RMP_ECO]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'After several responses succeed, significant unused contingency reserve remains and exposure has dropped. The BEST governance action is to:',
    options: opts4(
      'Spend the reserve on scope additions without approval',
      'Recommend releasing the surplus reserve back to the organization through the proper change/governance process',
      'Hide the surplus to use later informally',
      'Immediately close the project'
    ),
    correct: ['b'],
    explanation: 'When exposure falls, surplus contingency reserve should be released through proper governance/change control rather than spent informally or concealed. Reserve is for risk, not silent scope growth.',
    references: [REF_RESERVE, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Trend and variance analysis during monitoring primarily helps determine whether:',
    options: opts4(
      'The team should be reorganized',
      'Overall project risk is increasing or decreasing relative to plan, signaling needed action',
      'The vendor should be paid',
      'The charter should be rewritten'
    ),
    correct: ['b'],
    explanation: 'Trend and variance analysis reveals whether overall risk exposure is improving or worsening against the plan, prompting corrective or preventive action. It is not a staffing, payment, or chartering tool.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'When a previously identified risk actually occurs, it should be:',
    options: opts4(
      'Ignored because it was expected',
      'Managed as an issue, with the planned response executed and status updated',
      'Removed without action',
      'Reclassified as an opportunity'
    ),
    correct: ['b'],
    explanation: 'A risk that materializes becomes an issue; the planned response (or a workaround if none exists) is executed and the register/issue log updated. It is not ignored, silently removed, or arbitrarily reclassified.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'A stakeholder pressures the risk manager to omit a serious, escalating risk from the status report to "avoid alarming executives." The BEST response is to:',
    options: opts4(
      'Comply to keep the stakeholder happy',
      'Report the risk transparently and accurately, consistent with professional and ethical responsibilities',
      'Report it only verbally and off the record',
      'Delete the risk from the register'
    ),
    correct: ['b'],
    explanation: 'Honest, transparent risk reporting is required by professional and ethical responsibility; concealing a serious risk endangers the project and breaches the PMI Code of Ethics. The risk must be reported accurately and remain in the register.',
    references: [REF_PMI_ETHICS, REF_STD_RISK]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Risk Strategy and Planning (14) ──
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The risk management plan should be developed:',
    options: opts4(
      'Only after all risks have occurred',
      'Early in the project, during planning, before detailed risk identification and analysis',
      'At project closure',
      'Only if the sponsor asks for it'
    ),
    correct: ['b'],
    explanation: 'Plan Risk Management is performed early, so methodology, roles, funding, and definitions are in place before risks are identified and analyzed in detail. Doing it at closure or only on request defeats its purpose.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Stakeholder risk appetite is BEST described as:',
    options: opts4(
      'The measurable point at which action is triggered',
      'The amount and type of risk an organization or individual is willing to pursue or retain',
      'The list of all project risks',
      'The contingency reserve amount'
    ),
    correct: ['b'],
    explanation: 'Risk appetite is the amount/type of risk an entity is willing to pursue or retain. The measurable trigger point is a threshold; the list of risks is the register; the reserve is a funded buffer.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Which is a key benefit of defining standardized probability and impact scales during planning?',
    options: opts4(
      'It removes the need to analyze risks',
      'It enables consistent, comparable qualitative ratings across all risks and assessors',
      'It guarantees the project finishes on time',
      'It eliminates the risk register'
    ),
    correct: ['b'],
    explanation: 'Standardized scales make qualitative ratings consistent and comparable across assessors and risks, improving prioritization quality. They do not replace analysis, guarantee outcomes, or remove the register.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.SINGLE,
    stem: 'A highly regulated project demands traceability of every risk decision. The risk management plan should therefore emphasize:',
    options: opts4(
      'Minimal documentation to move fast',
      'Defined documentation, review cadence, and audit trails proportionate to the regulatory context',
      'No risk reviews to save time',
      'Removing risk roles to reduce overhead'
    ),
    correct: ['b'],
    explanation: 'Tailoring for a regulated context increases documentation rigor, review cadence, and auditability so decisions are traceable. Minimizing documentation, skipping reviews, or removing roles would violate the governance need.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE,
    stem: 'The Risk Breakdown Structure (RBS) is primarily used to:',
    options: opts4(
      'Schedule project activities',
      'Provide a hierarchical framework of potential risk sources to support systematic identification',
      'Calculate earned value',
      'Assign salaries'
    ),
    correct: ['b'],
    explanation: 'The RBS hierarchically organizes potential risk sources/categories, prompting comprehensive identification. It is not a schedule, earned value, or compensation tool.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL purposes served by the risk management plan.',
    options: opts4(
      'Define how risk processes will be tailored and resourced',
      'Establish risk categories and probability/impact definitions',
      'Specify reporting formats and review timing',
      'List the final realized cost of each risk'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The plan defines tailoring, resourcing, categories, P-I definitions, reporting formats, and timing. The realized cost of each risk is an actual outcome captured later, not a planning element.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: The level of detail and rigor in risk management should be tailored to the project rather than applied identically to every project.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Risk effort is tailored to project size, complexity, stakeholder appetite, and importance; identical treatment regardless of context wastes effort on small projects and under-serves complex ones.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which stakeholder input MOST directly shapes the escalation rules placed in the risk management plan?',
    options: opts4(
      'Stakeholders\' favorite project tools',
      'Stakeholder risk thresholds and authority limits',
      'The team\'s office location',
      'The vendor\'s logo guidelines'
    ),
    correct: ['b'],
    explanation: 'Escalation rules depend on stakeholder thresholds and authority limits — what exposure must be escalated and to whom. Tooling preferences, location, and branding are irrelevant to escalation design.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A project manager wants risk activities to be repeatable across the program. The BEST planning action is to:',
    options: opts4(
      'Invent a new method for each project independently',
      'Align the project risk methodology with established organizational/program standards and templates',
      'Avoid documenting the methodology',
      'Delegate the methodology choice to whoever is free'
    ),
    correct: ['b'],
    explanation: 'Aligning with organizational/program standards and templates makes risk management repeatable and comparable across projects. Ad-hoc invention, no documentation, or arbitrary delegation undermine consistency.',
    references: [REF_STD_RISK, REF_PMI_STANDARDS]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.SINGLE,
    stem: 'Why is securing risk funding (contingency/management reserve authority) addressed during planning?',
    options: opts4(
      'So responses can later be executed without ad-hoc funding battles',
      'Because reserves are never needed',
      'To inflate the project budget arbitrarily',
      'To avoid identifying any risks'
    ),
    correct: ['a'],
    explanation: 'Defining how risk responses and reserves will be funded during planning ensures responses can be executed promptly without scrambling for money later. It is disciplined provisioning, not arbitrary budget inflation.',
    references: [REF_RESERVE, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is an organizational process asset useful when planning risk management?',
    options: opts4(
      'Historical risk lessons learned and risk policy templates',
      'Today\'s weather forecast',
      'The CEO\'s travel itinerary',
      'The office Wi-Fi password'
    ),
    correct: ['a'],
    explanation: 'Historical lessons learned and standard risk policy/templates are organizational process assets that strongly inform the planned approach. The other items are irrelevant to risk planning.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Residual risk is BEST defined as:',
    options: opts4(
      'A risk created by a response',
      'The risk that remains after planned responses have been implemented',
      'A risk that has not yet been identified',
      'The organizational risk appetite'
    ),
    correct: ['b'],
    explanation: 'Residual risk is the exposure remaining after responses are applied; it must itself be assessed and accepted or further treated. A risk created by a response is a secondary risk; appetite is an attitude.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk manager defines clear roles such as risk owner and risk action owner in the plan. The primary benefit is:',
    options: opts4(
      'Diffusing accountability so no one is responsible',
      'Clear accountability for monitoring risks and executing response actions',
      'Eliminating the need for a project manager',
      'Guaranteeing zero risk occurrence'
    ),
    correct: ['b'],
    explanation: 'Defining risk owner and risk action owner roles creates clear accountability for tracking risks and carrying out responses. It does not diffuse responsibility, remove the PM, or prevent risks.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.SINGLE,
    stem: 'During planning, the team disagrees on how to rate "high" impact. The BEST resolution is to:',
    options: opts4(
      'Let each member use their own private definition',
      'Agree explicit, documented impact scale definitions in the risk management plan',
      'Skip impact rating altogether',
      'Use only probability and ignore impact'
    ),
    correct: ['b'],
    explanation: 'Documented, agreed impact-scale definitions ensure consistent qualitative ratings. Private definitions create inconsistency, and ignoring impact removes half of the prioritization basis.',
    references: [REF_PMBOK, REF_STD_RISK]
  },

  // ── Risk Identification (15) ──
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Brainstorming as a risk-identification technique is MOST effective when:',
    options: opts4(
      'One person lists risks alone with no input',
      'A facilitated, diverse group generates ideas freely, often guided by an RBS or prompt list',
      'Only executives participate',
      'It is done once at closure'
    ),
    correct: ['b'],
    explanation: 'Facilitated brainstorming with a diverse group, often structured by an RBS or prompt list, surfaces a broad range of risks. Solo lists, executive-only sessions, or closure-only timing reduce coverage.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Assumptions and constraints analysis identifies risks by examining:',
    options: opts4(
      'Only the project budget',
      'The validity, stability, and consequences of project assumptions and constraints',
      'Vendor marketing brochures',
      'Team members\' personal calendars'
    ),
    correct: ['b'],
    explanation: 'Assumption and constraint analysis tests whether assumptions are valid/stable and what happens if they prove false, surfacing related risks. It is not limited to budget and is unrelated to brochures or calendars.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Interviews with experienced stakeholders primarily help identify risks by:',
    options: opts4(
      'Capturing tacit knowledge and experience about likely risks',
      'Calculating EMV automatically',
      'Eliminating the need for a risk register',
      'Setting the project schedule'
    ),
    correct: ['a'],
    explanation: 'Structured interviews tap experts\' tacit knowledge and prior experience to surface risks that documents may not reveal. They do not compute EMV, replace the register, or set the schedule.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk trigger (warning sign) is BEST captured in the risk register so that:',
    options: opts4(
      'The risk can be ignored',
      'The team can detect early indications that the risk is about to occur and respond promptly',
      'The risk is automatically eliminated',
      'The schedule can be deleted'
    ),
    correct: ['b'],
    explanation: 'Documenting triggers lets the team watch for early warning signs and act before or as the risk materializes. Triggers do not eliminate risks or relate to deleting the schedule.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL that are good practices when documenting a newly identified risk.',
    options: opts4(
      'Use a clear cause-risk-effect statement',
      'Assign or propose a risk owner',
      'Categorize it (e.g., via the RBS)',
      'Record it only in a private notebook never shared'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Good practice uses structured statements, proposes an owner, and categorizes the risk for analysis and roll-up. Keeping it in a private, unshared notebook destroys traceability and team visibility.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Opportunities (positive risks) as well as threats should be captured during risk identification.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Risk includes both threats and opportunities; identifying opportunities allows the team to plan exploit/enhance/share responses to capture potential benefits.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Reviewing prior similar projects\' risk registers during identification is valuable because it:',
    options: opts4(
      'Guarantees no new risks will appear',
      'Surfaces recurring/known risks that are likely relevant again',
      'Replaces stakeholder engagement',
      'Sets the contingency reserve directly'
    ),
    correct: ['b'],
    explanation: 'Historical registers reveal recurring risks likely to apply again, improving completeness. They do not guarantee no novel risks, replace engagement, or directly set reserves.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is an example of an external risk category in an RBS?',
    options: opts4(
      'Unstable internal requirements',
      'Regulatory or market changes outside the project\'s control',
      'Poor internal estimating',
      'Team skill gaps'
    ),
    correct: ['b'],
    explanation: 'External categories cover sources outside the project/organization such as regulatory, market, or environmental changes. Requirements instability, estimating, and skill gaps are typically internal/technical or management risks.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A nominal group technique session is used. Compared with open brainstorming, its key advantage is:',
    options: opts4(
      'It eliminates the need for any facilitator',
      'It reduces dominance by louder participants by collecting and ranking ideas more independently',
      'It guarantees quantitative results',
      'It removes the need to document risks'
    ),
    correct: ['b'],
    explanation: 'The nominal group technique gathers individual contributions before group discussion and ranking, reducing dominance bias and improving idea breadth. It still needs facilitation and documentation and is not quantitative.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A project assumption later proves false during execution and causes rework. This shows the importance of:',
    options: opts4(
      'Never recording assumptions',
      'Identifying and tracking assumption-related risks so they can be monitored and managed',
      'Ignoring assumptions until closure',
      'Treating all assumptions as facts'
    ),
    correct: ['b'],
    explanation: 'Assumptions are uncertain; capturing assumption-based risks lets the team monitor and respond before they cause rework. Ignoring or treating assumptions as facts leaves the project exposed.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'A SWOT analysis output most directly contributes which to the risk register?',
    options: opts4(
      'Only threats',
      'Both threats (from weaknesses/external) and opportunities (from strengths/external)',
      'Only the budget',
      'Only the schedule'
    ),
    correct: ['b'],
    explanation: 'SWOT yields both threats and opportunities by examining internal strengths/weaknesses and external opportunities/threats, enriching the register with positive and negative risks.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.SINGLE,
    stem: 'During a workshop, identified items are mostly vague phrases like "schedule" or "budget." The facilitator should:',
    options: opts4(
      'Accept them as-is',
      'Coach the group to restate them as specific cause-risk-effect statements',
      'Discard all of them',
      'Convert them to issues immediately'
    ),
    correct: ['b'],
    explanation: 'Vague single-word "risks" are not actionable; restating them as cause-risk-effect statements makes analysis and response planning possible. Accepting vague items or prematurely converting them to issues is incorrect.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should risk identification involve a broad set of stakeholders, not just the core team?',
    options: opts4(
      'To slow the project down',
      'Different perspectives expose risks the core team may not see',
      'To remove the need for analysis',
      'To avoid documenting risks'
    ),
    correct: ['b'],
    explanation: 'Diverse stakeholders bring varied expertise and viewpoints, revealing blind spots the core team might miss and improving completeness of the register.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the risk register immediately after the first identification session?',
    options: opts4(
      'A complete, final list never to be changed',
      'An initial, evolving list of risks to be elaborated through later analysis and monitoring',
      'A financial statement',
      'A staffing plan'
    ),
    correct: ['b'],
    explanation: 'The register starts as an initial list and is progressively elaborated with analysis, owners, responses, and status throughout the project. It is neither final nor a financial/staffing document.',
    references: [REF_RISKREG, REF_PMBOK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A facilitator notices the group is anchoring on the first risk raised and not exploring other categories. The BEST corrective technique is to:',
    options: opts4(
      'End the session early',
      'Use structured prompts from the RBS to deliberately cover each risk category',
      'Only discuss that first risk in depth',
      'Replace identification with a budget review'
    ),
    correct: ['b'],
    explanation: 'Anchoring bias narrows search; structured RBS prompts force coverage across all categories, improving completeness. Ending early or fixating on one risk worsens the blind spot.',
    references: [REF_PMBOK, REF_STD_RISK]
  },

  // ── Risk Analysis (15) ──
  {
    domain: ANALYSIS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk with probability 0.2 and impact $500,000 has an EMV of:',
    options: opts4(
      '$500,000',
      '$100,000',
      '$50,000',
      '$25,000'
    ),
    correct: ['b'],
    explanation: 'EMV = 0.2 × $500,000 = $100,000. EMV converts probability and impact into a single comparable, probability-weighted figure used for prioritization and reserve estimation.',
    references: [REF_EMV, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'The main difference between qualitative and quantitative risk analysis is that quantitative analysis:',
    options: opts4(
      'Uses subjective high/medium/low ratings only',
      'Numerically models the combined effect of risks on overall project objectives',
      'Is performed before identification',
      'Replaces the risk register'
    ),
    correct: ['b'],
    explanation: 'Quantitative analysis assigns numbers and models aggregate effects (e.g., via simulation) on cost/schedule objectives, whereas qualitative uses relative ratings to prioritize individual risks. It follows identification and complements the register.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'In a decision tree, a chance node represents:',
    options: opts4(
      'A decision the manager makes',
      'An uncertain outcome with associated probabilities',
      'The final monetary payoff only',
      'A fixed, certain value'
    ),
    correct: ['b'],
    explanation: 'A chance node represents uncertainty with branch probabilities; a decision node represents a choice the manager controls. End nodes hold payoffs. EMV is rolled back through chance nodes to evaluate decisions.',
    references: [REF_EMV, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'Path A: invest $100k, 60% chance of +$300k, 40% chance of $0. Path B: invest $0, payoff $80k for certain. Using EMV (net of investment), which is better?',
    options: opts4(
      'Path B (EMV = $80,000)',
      'Path A (EMV = $80,000) — tie, both equal',
      'Path A (net EMV = $80,000) vs Path B ($80,000): they tie on EMV',
      'Path A clearly, net EMV = $180,000'
    ),
    correct: ['c'],
    explanation: 'Path A gross EMV = 0.6×300k + 0.4×0 = $180k; net of $100k investment = $80k. Path B = $80k certain. Their EMVs tie at $80k, so the choice would then consider risk tolerance, not EMV alone.',
    references: [REF_EMV, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL outputs typically produced by quantitative risk analysis.',
    options: opts4(
      'Probability distribution of project cost or completion date',
      'Probability of achieving cost/time objectives',
      'A prioritized contingency reserve recommendation',
      'The project charter'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Quantitative analysis yields outcome distributions, probabilities of meeting objectives, sensitivity insights, and reserve recommendations. The project charter is an initiating document, not a quantitative analysis output.',
    references: [REF_MONTECARLO, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Monte Carlo simulation requires probability distributions for the uncertain input variables.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Monte Carlo sampling draws from defined input distributions (e.g., triangular, PERT/beta, normal) over many iterations to build an output distribution; the quality of inputs drives result credibility.',
    references: [REF_MONTECARLO, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Using PERT (beta) with O=10, M=14, P=24, the expected duration is:',
    options: opts4(
      '14.0 days',
      '15.0 days',
      '16.0 days',
      '24.0 days'
    ),
    correct: ['b'],
    explanation: 'PERT expected = (O + 4M + P) / 6 = (10 + 56 + 24) / 6 = 90 / 6 = 15 days. PERT weights the most likely value more heavily than the triangular average.',
    references: [REF_PMBOK, REF_MONTECARLO]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Sensitivity analysis (e.g., a tornado diagram) is MOST useful to:',
    options: opts4(
      'Assign owners to each risk',
      'Identify which uncertainties most strongly drive overall project outcomes so effort can be focused',
      'Close risks at project end',
      'Write the communications plan'
    ),
    correct: ['b'],
    explanation: 'Sensitivity analysis ranks the influence of individual uncertainties on the outcome, helping focus management attention and data-gathering on the most impactful drivers.',
    references: [REF_PMBOK, REF_MONTECARLO]
  },
  {
    domain: ANALYSIS, difficulty: 2, type: QType.SINGLE,
    stem: 'A P90 cost result from simulation means:',
    options: opts4(
      'There is a 90% chance the cost will exceed this value',
      'There is a 90% probability the project completes at or below this cost',
      'The cost is exactly this value',
      'Only 10% of risks were modeled'
    ),
    correct: ['b'],
    explanation: 'On a cumulative distribution, P90 is the value with a 90% probability of finishing at or below it — a high-confidence figure often used for conservative reserve or commitment decisions.',
    references: [REF_MONTECARLO, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'Sum of EMV of all identified threats is -$120k and opportunities +$30k. The net expected risk effect on cost is:',
    options: opts4(
      '+$150,000 (favorable)',
      '-$90,000 (a net expected cost increase)',
      '$0',
      '-$150,000'
    ),
    correct: ['b'],
    explanation: 'Net EMV = -$120k + $30k = -$90k, an expected net adverse cost effect that helps inform contingency reserve sizing for identified risk exposure.',
    references: [REF_EMV, REF_RESERVE]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is risk data quality assessment performed before relying on qualitative results?',
    options: opts4(
      'To make the analysis longer',
      'To gauge how accurate and reliable the underlying risk data is so confidence in the ratings is appropriate',
      'To eliminate the risk register',
      'To set salaries'
    ),
    correct: ['b'],
    explanation: 'Risk data quality assessment evaluates the reliability and completeness of risk information, so prioritization decisions reflect appropriate confidence rather than spurious precision.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Risk categorization during analysis (e.g., grouping by RBS source) primarily helps to:',
    options: opts4(
      'Hide risks from stakeholders',
      'Reveal concentrations of risk in particular sources so targeted responses can be developed',
      'Replace quantitative analysis',
      'Set the project charter'
    ),
    correct: ['b'],
    explanation: 'Grouping risks by source or other categories exposes hotspots/concentrations, enabling focused, root-cause-oriented responses rather than treating each risk in isolation.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'A simulation shows only a 35% probability of meeting the committed deadline. The MOST appropriate next step is to:',
    options: opts4(
      'Report the deadline as safe anyway',
      'Communicate the confidence level and explore schedule risk responses or re-baselining with stakeholders',
      'Delete the schedule risks',
      'Stop all analysis'
    ),
    correct: ['b'],
    explanation: 'A low confidence level should be transparently communicated and used to drive response planning (e.g., compress, add buffer, re-baseline) with stakeholders, not concealed or ignored.',
    references: [REF_MONTECARLO, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk\'s qualitative priority increases sharply because it could occur very soon. Which assessment factor caused this?',
    options: opts4(
      'Detectability',
      'Urgency / proximity',
      'Manageability',
      'Strategic alignment'
    ),
    correct: ['b'],
    explanation: 'Urgency (proximity) reflects how soon a risk may occur and how quickly a response is needed; near-term risks often get higher priority even at similar probability/impact.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which technique converts subjective expert judgement into ranges for quantitative modeling?',
    options: opts4(
      'Three-point estimating (optimistic/most likely/pessimistic)',
      'Charter approval',
      'Stakeholder mapping',
      'Code review'
    ),
    correct: ['a'],
    explanation: 'Three-point estimates capture optimistic, most likely, and pessimistic values, forming the ranges/distributions fed into simulation or expected-value calculations. The other options are unrelated activities.',
    references: [REF_PMBOK, REF_MONTECARLO]
  },

  // ── Risk Response (8) ──
  {
    domain: RESPONSE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which set lists recognized strategies for POSITIVE risks (opportunities)?',
    options: opts4(
      'Avoid, Transfer, Mitigate, Accept',
      'Escalate, Exploit, Share, Enhance, Accept',
      'Initiate, Plan, Execute, Close',
      'Identify, Analyze, Monitor, Report'
    ),
    correct: ['b'],
    explanation: 'Opportunity strategies are Escalate, Exploit, Share, Enhance, and Accept. Avoid/Transfer/Mitigate/Accept are threat strategies; the other lists are process phases, not response types.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'Changing the project plan to remove a threat\'s cause entirely is which strategy?',
    options: opts4(
      'Mitigate',
      'Avoid',
      'Transfer',
      'Accept'
    ),
    correct: ['b'],
    explanation: 'Avoid eliminates the threat by removing its cause or changing the plan (e.g., dropping a risky scope element). Mitigate only reduces probability/impact, transfer shifts it, and accept takes no proactive change.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Allocating an opportunity to a third party best able to capture its benefit is which strategy?',
    options: opts4(
      'Share',
      'Exploit',
      'Enhance',
      'Avoid'
    ),
    correct: ['a'],
    explanation: 'Share assigns ownership of an opportunity (e.g., via partnership or joint venture) to the party best positioned to realize it. Exploit ensures it happens, enhance increases its likelihood/impact, and avoid is a threat strategy.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 4, type: QType.SINGLE,
    stem: 'A response plan reduces a threat\'s probability from 40% to 10% but cannot remove it entirely. The remaining 10% exposure is the:',
    options: opts4(
      'Secondary risk',
      'Residual risk',
      'Risk trigger',
      'Management reserve'
    ),
    correct: ['b'],
    explanation: 'The exposure remaining after a mitigation is the residual risk, which must be assessed and accepted or further treated. A new risk caused by the response would be a secondary risk.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Escalation transfers ownership of a risk to a higher level (e.g., program), and the project team no longer actively manages it but records it.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Escalated risks are owned and managed at the program/organizational level; the project records the escalation and ceases active management, since the risk is beyond its authority.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about contingency vs. management reserves.',
    options: opts4(
      'Contingency reserve covers identified (known) risks and is part of the cost baseline',
      'Management reserve covers unforeseen (unknown) risks and is outside the cost baseline',
      'Using management reserve typically requires a change/approval',
      'Contingency reserve covers only unknown-unknowns'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Contingency reserve addresses identified risks and is within the cost baseline; management reserve covers unknown-unknowns, sits outside the baseline, and usually needs management approval to access. The last option misstates contingency reserve.',
    references: [REF_RESERVE, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk owner proposes a response that costs more than the risk\'s entire potential impact. The risk manager should:',
    options: opts4(
      'Approve it without question',
      'Challenge it — responses should be cost-effective and proportionate to the risk\'s severity',
      'Double the response budget',
      'Escalate the project'
    ),
    correct: ['b'],
    explanation: 'Effective responses are cost-effective and proportionate; spending more than the exposure is uneconomic and the plan should be reconsidered (e.g., active acceptance) rather than approved automatically.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'Passive acceptance of a risk means the team:',
    options: opts4(
      'Establishes a contingency reserve and detailed plan',
      'Acknowledges the risk but takes no proactive action, dealing with it only if it occurs',
      'Transfers it to a vendor',
      'Avoids it by changing scope'
    ),
    correct: ['b'],
    explanation: 'Passive acceptance documents the risk but plans no proactive measures, handling it reactively if it occurs. Active acceptance differs by establishing reserves/plans; transfer and avoid are different strategies.',
    references: [REF_PMBOK, REF_RESERVE]
  },

  // ── Monitor and Close Risks (13) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'During Monitor Risks, the team discovers a brand-new risk not previously identified. The correct action is to:',
    options: opts4(
      'Ignore it because identification is over',
      'Add it to the risk register and analyze/plan a response',
      'Wait until project closure',
      'Delete an old risk to make room'
    ),
    correct: ['b'],
    explanation: 'Identification is iterative; newly emerged risks are added to the register and analyzed, with responses planned. Ignoring or deferring them, or arbitrarily deleting other risks, increases exposure.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Reserve analysis during monitoring may lead to which legitimate outcome?',
    options: opts4(
      'Spending reserve on unrelated bonuses',
      'Releasing surplus contingency reserve when exposure has decreased',
      'Hiding reserve status from governance',
      'Permanently freezing the register'
    ),
    correct: ['b'],
    explanation: 'If remaining exposure drops, surplus contingency reserve can be released through proper governance. Misusing reserve, concealing status, or freezing the register are improper.',
    references: [REF_RESERVE, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk review meeting should typically cover:',
    options: opts4(
      'Only finished tasks',
      'Status of risks, effectiveness of responses, new risks, and required actions/decisions',
      'Only the vendor contract',
      'Only team vacation schedules'
    ),
    correct: ['b'],
    explanation: 'Risk reviews examine current risk status, response effectiveness, newly identified risks, and decisions/actions needed. Limiting it to tasks, contracts, or vacations misses the purpose.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'A response that was implemented is found ineffective during a risk audit. The BEST action is to:',
    options: opts4(
      'Keep the ineffective response unchanged',
      'Revise or replace the response, update the register, and reassess residual risk',
      'Delete the risk',
      'Stop monitoring that risk'
    ),
    correct: ['b'],
    explanation: 'When a response proves ineffective, it should be revised or replaced, the register updated, and residual risk reassessed. Keeping it unchanged or abandoning monitoring leaves exposure unmanaged.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A risk audit examines both the effectiveness of risk responses and the effectiveness of the risk management process itself.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Risk audits assess how well responses worked and how well the overall risk process is functioning, providing input for process improvement and lessons learned.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL appropriate Monitor Risks activities.',
    options: opts4(
      'Reassess existing risks and identify new ones',
      'Evaluate effectiveness of implemented responses',
      'Track trigger conditions and execute contingency plans when triggered',
      'Delete risks that have not yet occurred to shorten the register'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Monitoring reassesses risks, evaluates response effectiveness, and watches triggers to execute contingency plans. Deleting not-yet-occurred risks hides live exposure and is never appropriate.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Closing a risk in the register should include:',
    options: opts4(
      'No documentation at all',
      'Recording the final status, outcome, and lessons learned',
      'Only the date with no context',
      'Reopening it later for no reason'
    ),
    correct: ['b'],
    explanation: 'Risk closure documents final status, outcome, and lessons learned so the organization retains knowledge. Closing without context or arbitrary reopening loses traceability and value.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Risk reporting tailored to different audiences is important because:',
    options: opts4(
      'Executives need the same detail as engineers',
      'Different stakeholders need different levels of detail and focus to make appropriate decisions',
      'Reporting should always be maximally detailed',
      'Only the PM should ever see risks'
    ),
    correct: ['b'],
    explanation: 'Effective communication tailors content and detail to the audience — summarized exposure/decisions for executives, detailed actions for the team — so each can act appropriately.',
    references: [REF_STD_RISK, REF_RMP_ECO]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'A trigger fires but no contingency plan exists for that risk. The team must use a:',
    options: opts4(
      'Pre-approved fallback plan',
      'Workaround (an unplanned, reactive response)',
      'Management reserve drawdown automatically',
      'Risk avoidance strategy retroactively'
    ),
    correct: ['b'],
    explanation: 'When no planned response exists and the risk occurs, the team applies a workaround — an unplanned, reactive response — and updates the register/issue log. A fallback would only exist if previously planned.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Variance and trend analysis of risk metrics over time helps the team to:',
    options: opts4(
      'Determine office seating',
      'Detect whether overall risk exposure is improving or deteriorating and act early',
      'Set the project charter',
      'Pay invoices faster'
    ),
    correct: ['b'],
    explanation: 'Tracking variance and trends in risk metrics shows whether exposure is rising or falling versus plan, enabling timely corrective/preventive action. It is unrelated to seating, chartering, or payments.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'Lessons learned about risk are MOST valuable when they are:',
    options: opts4(
      'Stored where no one can access them',
      'Documented and shared into organizational process assets for future projects',
      'Only remembered informally',
      'Discarded at closure'
    ),
    correct: ['b'],
    explanation: 'Risk lessons learned add value when captured and shared into organizational process assets so future teams identify and respond to similar risks faster. Inaccessible, informal, or discarded lessons are wasted.',
    references: [REF_STD_RISK, REF_PMI_BLOG_RISK]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'An executive asks the risk manager to soften a report so a struggling vendor "looks better." The ethically correct action is to:',
    options: opts4(
      'Soften the report as requested',
      'Provide accurate, objective risk information regardless of pressure, consistent with the PMI Code of Ethics',
      'Remove the vendor risks from the register',
      'Report only positive risks'
    ),
    correct: ['b'],
    explanation: 'Honesty and responsibility under the PMI Code of Ethics require accurate, objective reporting; distorting risk information to flatter a vendor misleads decision-makers and is unethical.',
    references: [REF_PMI_ETHICS, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'During monitoring, the risk manager finds the risk register has not been updated for several reporting cycles. The BEST corrective action is to:',
    options: opts4(
      'Discard the outdated register and start a new one with no history',
      'Reassess current risks, capture new and changed ones, update statuses/responses, and restore a regular review cadence',
      'Wait until project closure to update it',
      'Delete all risks that look stale'
    ),
    correct: ['b'],
    explanation: 'A stale register undermines risk control; the correct action is to reassess and refresh it (new, changed, and closed risks, statuses, and responses) and reinstate a disciplined review cadence. Discarding history, deferring to closure, or deleting stale entries destroys traceability and leaves exposure unmanaged.',
    references: [REF_RISKREG, REF_STD_RISK]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Risk Strategy and Planning (14) ──
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The primary purpose of Plan Risk Management is to:',
    options: opts4(
      'List every project risk',
      'Define how to conduct risk management activities for the project',
      'Compute the EMV of each risk',
      'Close completed risks'
    ),
    correct: ['b'],
    explanation: 'Plan Risk Management defines how risk activities will be conducted — methodology, roles, funding, timing, categories, and definitions. Listing risks, computing EMV, and closing risks belong to later processes.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which factor would MOST increase the appropriate rigor of the risk approach?',
    options: opts4(
      'A small, routine, low-value project',
      'High complexity, strategic importance, and significant uncertainty',
      'A project with no stakeholders',
      'A project already completed'
    ),
    correct: ['b'],
    explanation: 'Greater complexity, strategic importance, and uncertainty justify more rigorous, better-resourced risk management. Small/routine work warrants lighter tailoring; the other options are not realistic drivers.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Risk thresholds are useful in the risk management plan because they:',
    options: opts4(
      'Provide measurable trigger points for escalation or action',
      'List all identified risks',
      'Replace the need for analysis',
      'Set team salaries'
    ),
    correct: ['a'],
    explanation: 'Thresholds give concrete, measurable points at which action or escalation is required, operationalizing risk appetite. They neither list risks, replace analysis, nor relate to compensation.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.SINGLE,
    stem: 'An organization wants project risk data to roll up consistently into program and portfolio dashboards. The planning approach should ensure:',
    options: opts4(
      'Each project invents unique categories and scales',
      'Common risk categories, scales, and reporting aligned with program/portfolio standards',
      'No reporting to upper levels',
      'Risk data is kept only locally'
    ),
    correct: ['b'],
    explanation: 'Consistent roll-up requires shared categories, scales, and reporting aligned to higher-level standards. Unique per-project schemes or local-only data prevent meaningful aggregation.',
    references: [REF_STD_RISK, REF_PMI_STANDARDS]
  },
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is typically NOT part of the risk management plan?',
    options: opts4(
      'Risk methodology',
      'Roles and responsibilities',
      'The actual realized outcome of each risk',
      'Probability and impact definitions'
    ),
    correct: ['c'],
    explanation: 'The plan defines methodology, roles, funding, timing, categories, and P-I definitions. The actual realized outcome of each risk is recorded later during monitoring/closure, not in the plan.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid inputs to Plan Risk Management.',
    options: opts4(
      'Project charter and stakeholder register',
      'Organizational process assets (policies, templates, lessons learned)',
      'Enterprise environmental factors (risk appetite, thresholds)',
      'The final project closeout report of this same project'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Charter, stakeholder register, organizational process assets, and enterprise environmental factors inform risk planning. The current project\'s own closeout report does not yet exist during planning.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Risk appetite is generally set by the organization/sponsor, while the project defines thresholds consistent with that appetite.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Risk appetite is an organizational/sponsor-level attitude; the project translates it into measurable thresholds that remain consistent with the broader appetite.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Defining risk reporting formats during planning primarily ensures:',
    options: opts4(
      'There is nothing to report',
      'Consistent, audience-appropriate communication of risk information throughout the project',
      'Risks are never escalated',
      'Analysis is unnecessary'
    ),
    correct: ['b'],
    explanation: 'Predefined reporting formats ensure risk information is communicated consistently and appropriately to each audience throughout the project, supporting timely decisions.',
    references: [REF_STD_RISK, REF_RMP_ECO]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'A risk manager notices the project has no defined funding mechanism for responses. The BEST corrective action during planning is to:',
    options: opts4(
      'Assume funds will appear when needed',
      'Establish contingency/management reserve provisions and access rules in the plan',
      'Decide responses will never cost money',
      'Remove risk responses from scope'
    ),
    correct: ['b'],
    explanation: 'The plan should define how risk responses and reserves are funded and accessed so responses can be executed promptly. Assuming funds appear or eliminating responses leaves the project exposed.',
    references: [REF_RESERVE, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.SINGLE,
    stem: 'Why integrate risk management with overall project governance rather than running it as a standalone task?',
    options: opts4(
      'To create more meetings',
      'So risk information continuously informs decisions and stays aligned with objectives and appetite',
      'To remove accountability',
      'To avoid documenting risks'
    ),
    correct: ['b'],
    explanation: 'Integration keeps risk thinking embedded in decision-making and aligned with objectives and appetite, making risk management proactive and value-adding rather than a disconnected formality.',
    references: [REF_STD_RISK, REF_PMI_BLOG_RISK]
  },
  {
    domain: STRAT, difficulty: 2, type: QType.SINGLE,
    stem: 'A "risk action owner" differs from a "risk owner" in that the risk action owner:',
    options: opts4(
      'Owns the overall risk and its monitoring',
      'Is responsible for carrying out a specific agreed response action',
      'Sets organizational risk appetite',
      'Approves the project charter'
    ),
    correct: ['b'],
    explanation: 'A risk owner is accountable for the risk overall; a risk action owner executes a specific response action assigned to them. Neither sets enterprise appetite nor approves the charter.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'The cadence of risk reviews should be defined in the plan so that:',
    options: opts4(
      'Reviews happen only once',
      'Risks are reassessed regularly and at appropriate decision points throughout the life cycle',
      'No reviews are ever needed',
      'Only closure includes a review'
    ),
    correct: ['b'],
    explanation: 'A defined review cadence ensures risks are revisited regularly and at key decision points, keeping the register current and responses effective throughout the project.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which best reflects an iterative view of risk management embedded in planning?',
    options: opts4(
      'Risk activities run once at project start',
      'Risk activities recur throughout the project, with the plan setting their frequency and triggers',
      'Risk activities run only at closure',
      'Risk activities are performed only by auditors'
    ),
    correct: ['b'],
    explanation: 'Risk management is iterative; the plan establishes the frequency and triggers for recurring identification, analysis, response, and monitoring activities across the life cycle.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: STRAT, difficulty: 4, type: QType.SINGLE,
    stem: 'A sponsor with a very low risk appetite funds an inherently uncertain R&D project. The risk manager should:',
    options: opts4(
      'Promise zero risk to satisfy the sponsor',
      'Reconcile expectations: clarify realistic exposure, define tight thresholds, and agree how risk will be managed within appetite',
      'Hide the uncertainty from the sponsor',
      'Cancel the project automatically'
    ),
    correct: ['b'],
    explanation: 'The professional approach reconciles the sponsor\'s low appetite with the project\'s inherent uncertainty by clarifying realistic exposure and agreeing tight thresholds and management approach — not false promises, concealment, or automatic cancellation.',
    references: [REF_STD_RISK, REF_PMI_ETHICS]
  },

  // ── Risk Identification (15) ──
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Identify Risks process is BEST characterized as:',
    options: opts4(
      'A one-time activity at project start',
      'An iterative activity performed throughout the project as conditions change',
      'Performed only by the sponsor',
      'Only relevant at closure'
    ),
    correct: ['b'],
    explanation: 'Identify Risks is iterative; new and changed risks emerge as the project progresses, so identification continues throughout the life cycle rather than occurring only once.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which technique uses anonymous expert input over rounds to reduce bias and groupthink in identifying risks?',
    options: opts4(
      'Delphi technique',
      'Tornado diagram',
      'Earned value analysis',
      'Critical path method'
    ),
    correct: ['a'],
    explanation: 'The Delphi technique aggregates anonymous expert opinions across iterative rounds with feedback, reducing dominance and groupthink. Tornado diagrams, earned value, and critical path serve analysis/scheduling, not identification.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk register entry should typically include at minimum:',
    options: opts4(
      'Only a risk title',
      'A risk description (cause-risk-effect), category, owner, and status',
      'Only the project budget',
      'Only the sponsor\'s name'
    ),
    correct: ['b'],
    explanation: 'Useful register entries include a structured description, category, proposed/assigned owner, and status, later enriched with analysis and responses. A bare title or unrelated fields are insufficient.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Documentation review during identification focuses on finding risks by:',
    options: opts4(
      'Examining plans, assumptions, and prior files for inconsistencies and gaps',
      'Running Monte Carlo simulation',
      'Calculating EMV',
      'Closing risks'
    ),
    correct: ['a'],
    explanation: 'Documentation review inspects project plans, assumptions, contracts, and historical files for inconsistencies, omissions, and signals of risk. Simulation, EMV, and closure are different activities.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL techniques commonly used to identify risks.',
    options: opts4(
      'Brainstorming and the Delphi technique',
      'Interviews and checklists',
      'SWOT and assumption/constraint analysis',
      'Earned value variance reporting only'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Brainstorming, Delphi, interviews, checklists, SWOT, and assumption analysis are identification techniques. Earned value variance reporting is a monitoring/performance technique, not a primary identification method.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A well-formed risk statement separates the cause, the uncertain event, and the effect on objectives.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. The cause-risk-effect structure clarifies what gives rise to the risk, the uncertain event itself, and the consequence on objectives, enabling sound analysis and response planning.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'The project team identifies a positive uncertainty that could finish a task early. This belongs in the register as:',
    options: opts4(
      'An issue',
      'An opportunity (positive risk)',
      'A constraint',
      'A milestone'
    ),
    correct: ['b'],
    explanation: 'A beneficial uncertain event is an opportunity (positive risk) recorded so the team can plan to exploit, enhance, or share it. It is not an already-occurred issue, a constraint, or a milestone.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a strength of using a checklist for risk identification?',
    options: opts4(
      'It captures completely novel, project-unique risks automatically',
      'It quickly surfaces known, recurring risks from prior experience',
      'It quantifies risk exposure',
      'It assigns risk owners automatically'
    ),
    correct: ['b'],
    explanation: 'Checklists efficiently bring forward known, recurring risks from organizational experience. They do not automatically surface novel risks, quantify exposure, or assign owners.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A team relies solely on a checklist and misses a novel technology risk that later causes major rework. The lesson is to:',
    options: opts4(
      'Always trust checklists exclusively',
      'Combine checklists with creative techniques (brainstorming, interviews) to cover novel risks',
      'Stop using checklists entirely',
      'Only identify risks at closure'
    ),
    correct: ['b'],
    explanation: 'Checklists are necessary but insufficient alone; combining them with creative, forward-looking techniques helps surface novel risks. Abandoning checklists or deferring identification are both wrong extremes.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should the risk owner ideally be involved when their risk is first documented?',
    options: opts4(
      'To assign blame for the risk',
      'To ensure the risk is understood and that responses can be planned and executed by an accountable person',
      'To remove the risk from the register',
      'To set the project budget'
    ),
    correct: ['b'],
    explanation: 'Engaging the prospective owner early ensures the risk is well understood and that an accountable person can drive analysis and response. Risk ownership is about management, not blame.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Examining whether a key constraint (fixed deadline) is realistic is part of:',
    options: opts4(
      'Assumption and constraint analysis',
      'Monte Carlo simulation',
      'Reserve analysis',
      'Procurement negotiation'
    ),
    correct: ['a'],
    explanation: 'Testing the realism and stability of constraints (and assumptions) for risk is assumption/constraint analysis, an identification technique. Simulation, reserve analysis, and procurement are different activities.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.SINGLE,
    stem: 'A facilitator notices identified risks are all worded as solutions ("hire more staff") rather than risks. The BEST coaching is to:',
    options: opts4(
      'Accept solutions as risks',
      'Reframe each as the underlying uncertain event and its effect, separate from any response',
      'Discard them all',
      'Treat them as completed actions'
    ),
    correct: ['b'],
    explanation: 'Risks must be stated as uncertain events with effects, kept separate from candidate responses; otherwise analysis is distorted. Reframing to cause-risk-effect restores clarity.',
    references: [REF_RISKREG, REF_STD_RISK]
  },
  {
    domain: IDENT, difficulty: 3, type: QType.SINGLE,
    stem: 'Engaging suppliers and customers in risk identification is valuable because they:',
    options: opts4(
      'Have no relevant knowledge',
      'May see external and interface risks the internal team cannot',
      'Should never be consulted',
      'Only add cost'
    ),
    correct: ['b'],
    explanation: 'External parties often perceive interface, supply, and market risks that the internal team cannot see, improving completeness of identification. Excluding them creates blind spots.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: IDENT, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement about the risk register early in the project is correct?',
    options: opts4(
      'It is finalized and never updated',
      'It is a living document elaborated as analysis, responses, and monitoring proceed',
      'It is only a budget figure',
      'It is owned by the auditor'
    ),
    correct: ['b'],
    explanation: 'The risk register is a living artifact, continually updated with analysis results, owners, responses, and status as the project progresses. It is neither finalized early nor a single budget number.',
    references: [REF_RISKREG, REF_PMBOK]
  },
  {
    domain: IDENT, difficulty: 4, type: QType.SINGLE,
    stem: 'During identification, an "issue" that has already happened is raised. The facilitator should:',
    options: opts4(
      'Record it as a risk in the risk register',
      'Route it to the issue log and, if relevant, identify any remaining uncertain effects as risks',
      'Ignore it entirely',
      'Treat it as an opportunity'
    ),
    correct: ['b'],
    explanation: 'Already-occurred problems are issues for the issue log; any remaining uncertain consequences can still be captured as risks. Logging a current issue as a risk, ignoring it, or mislabeling it is incorrect.',
    references: [REF_RISKREG, REF_STD_RISK]
  },

  // ── Risk Analysis (15) ──
  {
    domain: ANALYSIS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk with 25% probability and $80,000 impact has an EMV of:',
    options: opts4(
      '$80,000',
      '$20,000',
      '$8,000',
      '$2,000'
    ),
    correct: ['b'],
    explanation: 'EMV = 0.25 × $80,000 = $20,000. This probability-weighted value enables comparison across risks and supports decision-tree and contingency-reserve analysis.',
    references: [REF_EMV, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Qualitative risk analysis primarily produces:',
    options: opts4(
      'A simulated cost distribution',
      'A prioritized list of individual risks for further attention or quantitative analysis',
      'The project charter',
      'The procurement plan'
    ),
    correct: ['b'],
    explanation: 'Qualitative analysis prioritizes individual risks (by probability, impact, urgency, etc.) so the most significant get further analysis or response. Cost distributions come from quantitative analysis.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'In decision-tree analysis, EMV at a chance node is calculated by:',
    options: opts4(
      'Adding all payoffs',
      'Summing each branch\'s probability multiplied by its payoff',
      'Choosing the largest payoff only',
      'Ignoring probabilities'
    ),
    correct: ['b'],
    explanation: 'A chance node\'s EMV equals the sum of (probability × payoff) across its branches; this value is rolled back to evaluate decisions. Simply adding payoffs or ignoring probabilities is incorrect.',
    references: [REF_EMV, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'A threat: 20% chance of a $250,000 loss. An opportunity: 30% chance of a $100,000 gain. The combined EMV is:',
    options: opts4(
      '-$20,000',
      '+$20,000',
      '-$50,000',
      '+$80,000'
    ),
    correct: ['a'],
    explanation: 'Threat EMV = -0.20 × $250,000 = -$50,000; opportunity EMV = +0.30 × $100,000 = +$30,000; combined = -$50,000 + $30,000 = -$20,000, a net expected adverse value.',
    references: [REF_EMV, REF_RESERVE]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL true statements about Monte Carlo simulation.',
    options: opts4(
      'It runs many iterations sampling input distributions',
      'It produces a probability distribution of outcomes (e.g., cost or finish date)',
      'It can show the probability of meeting a target',
      'It requires no input data assumptions'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Monte Carlo iterates over sampled input distributions to produce outcome distributions and target-achievement probabilities. It absolutely depends on input distribution assumptions, so the last statement is false.',
    references: [REF_MONTECARLO, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: A higher confidence level (e.g., P85 vs. P50) on a cumulative cost curve corresponds to a higher cost value.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. On a cumulative S-curve, higher confidence of finishing at or under a value sits further to the right, meaning a higher cost; conservative commitments use higher percentiles.',
    references: [REF_MONTECARLO, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Triangular three-point estimate with O=6, M=9, P=18 gives an expected value of:',
    options: opts4(
      '9 days',
      '11 days',
      '12 days',
      '18 days'
    ),
    correct: ['b'],
    explanation: 'Triangular expected = (6 + 9 + 18) / 3 = 33 / 3 = 11 days. The triangular average weights all three points equally, unlike PERT which weights the most likely value.',
    references: [REF_PMBOK, REF_MONTECARLO]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'A tornado diagram lists variables widest at the top. The widest bar indicates:',
    options: opts4(
      'The least influential variable',
      'The variable with the greatest impact on the outcome',
      'The cheapest response',
      'The risk owner'
    ),
    correct: ['b'],
    explanation: 'In a tornado diagram, the longest (widest) bar is the most influential variable on the outcome, focusing attention where it matters most. Bar width is not about cost or ownership.',
    references: [REF_PMBOK, REF_MONTECARLO]
  },
  {
    domain: ANALYSIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Why express threat EMV as negative and opportunity EMV as positive?',
    options: opts4(
      'To confuse stakeholders',
      'So summed EMV reflects the net expected effect (losses vs. gains) on objectives',
      'Because EMV must always be positive',
      'It has no analytical purpose'
    ),
    correct: ['b'],
    explanation: 'Signed EMV (threats negative, opportunities positive) lets the team sum exposures into a meaningful net expected effect that informs decisions and reserves.',
    references: [REF_EMV, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'A simulation indicates a 40% probability of meeting the budget. The risk manager should MOST appropriately:',
    options: opts4(
      'Report the budget as fully safe',
      'Present the confidence level and recommend response actions or reserve/budget adjustment to stakeholders',
      'Delete the cost risks',
      'Stop simulating'
    ),
    correct: ['b'],
    explanation: 'A low probability of meeting the budget should be transparently communicated with recommended responses or reserve/budget adjustments, supporting informed stakeholder decisions rather than false reassurance.',
    references: [REF_MONTECARLO, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which qualitative factor reflects how easily a risk\'s occurrence can be detected before it impacts the project?',
    options: opts4(
      'Detectability',
      'Probability',
      'Strategic alignment',
      'Reserve adequacy'
    ),
    correct: ['a'],
    explanation: 'Detectability assesses how readily warning signs can be observed before impact; low detectability often raises priority because there is little chance to react. It is distinct from probability or strategic factors.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'The output of quantitative analysis that helps size the contingency reserve is:',
    options: opts4(
      'The stakeholder register',
      'The probability distribution of project cost/schedule and a chosen confidence level',
      'The communications plan',
      'The project charter'
    ),
    correct: ['b'],
    explanation: 'A simulated cost/schedule distribution and a selected confidence level quantify the buffer needed for identified risk exposure, informing the contingency reserve. The other documents are unrelated to reserve sizing.',
    references: [REF_MONTECARLO, REF_RESERVE]
  },
  {
    domain: ANALYSIS, difficulty: 4, type: QType.SINGLE,
    stem: 'Two risks have identical probability and impact, but one is far harder to manage once it occurs. Qualitatively it should be:',
    options: opts4(
      'Rated identically',
      'Given higher priority due to lower manageability',
      'Removed from the register',
      'Ignored'
    ),
    correct: ['b'],
    explanation: 'Manageability is a legitimate qualitative factor; a risk that is harder to control once it occurs warrants higher priority even with equal probability and impact.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: ANALYSIS, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a quantitative risk analysis technique?',
    options: opts4(
      'Probability and impact matrix',
      'Monte Carlo simulation',
      'SWOT analysis',
      'Affinity diagram'
    ),
    correct: ['b'],
    explanation: 'Monte Carlo simulation is a quantitative technique producing outcome probability distributions. The P-I matrix, SWOT, and affinity diagrams are qualitative tools.',
    references: [REF_MONTECARLO, REF_PMBOK]
  },
  {
    domain: ANALYSIS, difficulty: 3, type: QType.SINGLE,
    stem: 'When data about risks is sparse, presenting precise single-point EMV figures without caveats is problematic because it:',
    options: opts4(
      'Is always perfectly accurate',
      'Implies false precision and can mislead decisions; uncertainty/ranges should be communicated',
      'Eliminates the need for analysis',
      'Guarantees the reserve is correct'
    ),
    correct: ['b'],
    explanation: 'Single-point figures from weak data imply false precision; communicating ranges, assumptions, and data-quality caveats leads to better-informed decisions and reserve setting.',
    references: [REF_PMBOK, REF_STD_RISK]
  },

  // ── Risk Response (8) ──
  {
    domain: RESPONSE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Reducing the probability or impact of a threat without eliminating it is which strategy?',
    options: opts4(
      'Avoid',
      'Mitigate',
      'Accept',
      'Exploit'
    ),
    correct: ['b'],
    explanation: 'Mitigate reduces a threat\'s probability and/or impact to an acceptable level. Avoid removes the cause entirely, accept takes no proactive action, and exploit is an opportunity strategy.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'Increasing the probability or positive impact of an opportunity is which strategy?',
    options: opts4(
      'Enhance',
      'Exploit',
      'Share',
      'Mitigate'
    ),
    correct: ['a'],
    explanation: 'Enhance increases an opportunity\'s likelihood and/or benefit. Exploit makes it certain to occur, share allocates it to a capable partner, and mitigate is a threat strategy.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk that cannot be addressed within the project\'s authority and is moved to the program level uses which strategy (applicable to both threats and opportunities)?',
    options: opts4(
      'Accept',
      'Escalate',
      'Mitigate',
      'Enhance'
    ),
    correct: ['b'],
    explanation: 'Escalate applies to both threats and opportunities when the response is beyond the project\'s authority; ownership moves to program/organization level and the project records the escalation.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 4, type: QType.SINGLE,
    stem: 'After applying responses, the remaining exposure is judged acceptable and no further action is planned but a reserve is held. This is:',
    options: opts4(
      'Active acceptance of residual risk',
      'Avoidance',
      'A secondary risk',
      'Transfer'
    ),
    correct: ['a'],
    explanation: 'Holding a reserve while planning no further proactive action for acceptable residual exposure is active acceptance. Avoidance changes the plan, transfer shifts impact, and a secondary risk is one caused by a response.',
    references: [REF_STD_RISK, REF_RESERVE]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: Implementing a risk response can itself introduce a new (secondary) risk that must be assessed and possibly responded to.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. A secondary risk arises directly from implementing a response; it must be identified, analyzed, and addressed like any other risk so it is not overlooked.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: RESPONSE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL characteristics of a sound risk response plan entry.',
    options: opts4(
      'Named owner and action owner with agreed timing',
      'Proportionate and cost-effective relative to the risk',
      'Documented residual and any secondary risks',
      'Guaranteed to remove 100% of all uncertainty'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Good response entries name owners, set timing, are proportionate/cost-effective, and document residual/secondary risk. No response can guarantee removing all uncertainty, so that option is false.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'A fallback plan is BEST described as:',
    options: opts4(
      'The primary response executed immediately',
      'A response used if the primary response fails or proves ineffective',
      'An unplanned reactive workaround',
      'The organizational risk appetite'
    ),
    correct: ['b'],
    explanation: 'A fallback plan is a pre-planned alternative invoked if the primary response is ineffective. It differs from a workaround, which is unplanned and reactive, and from appetite, which is an attitude.',
    references: [REF_PMBOK, REF_RESERVE]
  },
  {
    domain: RESPONSE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team transfers a technical risk to a specialist subcontractor via a fixed-price contract. A key consideration is that transfer:',
    options: opts4(
      'Eliminates the risk completely with no cost',
      'Usually involves a premium/fee and may create new contract-management or counterparty risks',
      'Removes the need to monitor the risk',
      'Is the same as avoidance'
    ),
    correct: ['b'],
    explanation: 'Transfer shifts impact to a third party but typically costs a premium and can create secondary risks (e.g., counterparty performance), which still require monitoring. It is neither free nor identical to avoidance.',
    references: [REF_PMBOK, REF_STD_RISK]
  },

  // ── Monitor and Close Risks (13) ──
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The Monitor Risks process is performed:',
    options: opts4(
      'Only once at project closure',
      'Throughout the project to track risks, evaluate responses, and identify new risks',
      'Only during planning',
      'Only by external auditors'
    ),
    correct: ['b'],
    explanation: 'Monitor Risks runs throughout execution and closing, tracking identified risks, evaluating response effectiveness, and surfacing new or changed risks. It is continuous, not a one-time closure step.',
    references: [REF_PMBOK, REF_RMP_ECO]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'During monitoring, residual risk for a treated risk has grown beyond its threshold. The risk owner should:',
    options: opts4(
      'Do nothing until closure',
      'Reassess the risk and revise or add responses, updating the register',
      'Delete the risk',
      'Convert it to an opportunity'
    ),
    correct: ['b'],
    explanation: 'When residual risk breaches its threshold, the owner reassesses and strengthens or adds responses and updates the register. Inaction, deletion, or reclassification leaves the breach unmanaged.',
    references: [REF_STD_RISK, REF_PMBOK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'A risk audit is BEST described as a review of:',
    options: opts4(
      'Only project finances',
      'The effectiveness of risk responses and of the risk management process',
      'Only the schedule',
      'Only stakeholder satisfaction'
    ),
    correct: ['b'],
    explanation: 'A risk audit evaluates how effective the risk responses and the overall risk management process are, feeding process improvement and lessons learned. It is broader than finances, schedule, or satisfaction alone.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'Reserve analysis shows remaining contingency reserve is far below remaining identified risk exposure. The BEST action is to:',
    options: opts4(
      'Ignore the shortfall',
      'Escalate for additional reserve or strengthen responses to bring exposure within available reserve',
      'Spend the reserve faster',
      'Delete high risks to balance the numbers'
    ),
    correct: ['b'],
    explanation: 'A reserve shortfall versus exposure should trigger escalation for more reserve and/or stronger responses to reduce exposure. Ignoring it, spending faster, or deleting risks misrepresents and worsens the situation.',
    references: [REF_RESERVE, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'True or False: When a risk can no longer occur, it should be formally closed with its outcome and lessons learned recorded.',
    options: tf(),
    correct: ['a'],
    explanation: 'True. Closing risks that can no longer occur (or have been resolved) with documented outcomes and lessons keeps the register accurate and preserves organizational knowledge.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL legitimate results of Monitor Risks.',
    options: opts4(
      'Change requests for corrective/preventive action',
      'Updates to the risk register and risk report',
      'Lessons learned added to organizational process assets',
      'Concealing escalating risks from stakeholders'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Monitoring generates change requests, register/report updates, and lessons learned. Concealing escalating risks violates transparency and ethics and is never a legitimate outcome.',
    references: [REF_PMBOK, REF_PMI_ETHICS]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'A defined risk trigger occurs and a contingency plan exists. The owner should:',
    options: opts4(
      'Wait for the next monthly meeting',
      'Execute the contingency plan promptly and communicate status',
      'Delete the risk',
      'Start an unrelated initiative'
    ),
    correct: ['b'],
    explanation: 'When the trigger condition is met and a contingency plan exists, the owner executes it promptly and communicates status. Delay, deletion, or unrelated work increase impact.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Why update the risk report periodically during monitoring?',
    options: opts4(
      'It is never necessary',
      'To communicate the current overall risk exposure and key risks to stakeholders for decisions',
      'To replace the risk register permanently',
      'To set the project charter'
    ),
    correct: ['b'],
    explanation: 'The risk report summarizes overall project risk and key individual risks; updating it keeps stakeholders informed for timely decisions. It complements, not replaces, the register.',
    references: [REF_STD_RISK, REF_RMP_ECO]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'During closure, the BEST handling of the final risk register and lessons learned is to:',
    options: opts4(
      'Discard them since the project is over',
      'Archive them and feed lessons learned into organizational process assets for future projects',
      'Keep them hidden from other teams',
      'Delete all closed risks permanently'
    ),
    correct: ['b'],
    explanation: 'At closure, the register is archived and risk lessons learned are contributed to organizational process assets so future projects benefit. Discarding, hiding, or deleting destroys reusable knowledge.',
    references: [REF_STD_RISK, REF_PMI_BLOG_RISK]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Trend analysis showing rising overall risk exposure across reporting periods should prompt the team to:',
    options: opts4(
      'Take no action until it is too late',
      'Investigate causes and take corrective/preventive action early',
      'Stop reporting risk',
      'Close the project immediately'
    ),
    correct: ['b'],
    explanation: 'A worsening exposure trend is an early-warning signal to investigate root causes and act proactively. Inaction or ceasing reporting increases the chance of serious impact.',
    references: [REF_PMBOK, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 2, type: QType.SINGLE,
    stem: 'When a previously identified risk occurs, the planned response should be:',
    options: opts4(
      'Ignored because the risk was expected',
      'Executed, with the register and issue log updated to reflect the occurrence',
      'Replaced with a brand-new project',
      'Deleted without action'
    ),
    correct: ['b'],
    explanation: 'A materialized risk triggers execution of its planned response (or a workaround if none), and the register/issue log are updated. Ignoring or deleting it leaves the impact unmanaged.',
    references: [REF_STD_RISK, REF_RISKREG]
  },
  {
    domain: MONITOR, difficulty: 3, type: QType.SINGLE,
    stem: 'Surplus contingency reserve identified during monitoring should be:',
    options: opts4(
      'Spent quietly on extra scope',
      'Released back through proper governance/change control when exposure has decreased',
      'Hidden for later informal use',
      'Converted to personal bonuses'
    ),
    correct: ['b'],
    explanation: 'Surplus reserve, once exposure decreases, is released via proper governance/change control. Spending it covertly, hoarding it, or misusing it violates reserve discipline and governance.',
    references: [REF_RESERVE, REF_STD_RISK]
  },
  {
    domain: MONITOR, difficulty: 4, type: QType.SINGLE,
    stem: 'A senior manager pressures the risk manager to omit a major escalating risk from the executive risk report. The risk manager should:',
    options: opts4(
      'Comply to avoid conflict',
      'Report the risk accurately and transparently, consistent with the PMI Code of Ethics and professional responsibility',
      'Report it only informally',
      'Remove it from the register entirely'
    ),
    correct: ['b'],
    explanation: 'Professional and ethical responsibility require honest, transparent risk reporting; omitting a major escalating risk to avoid conflict misleads decision-makers and breaches the PMI Code of Ethics.',
    references: [REF_PMI_ETHICS, REF_STD_RISK]
  }
];

const PMIRMP_DOMAINS = [
  { name: STRAT, weight: 22 },
  { name: IDENT, weight: 23 },
  { name: ANALYSIS, weight: 23 },
  { name: RESPONSE, weight: 13 },
  { name: MONITOR, weight: 19 }
];

const PMIRMP_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'pmi-rmp-p1',
    code: 'PMI-RMP-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 150-minute, 65-question, blueprint-weighted set covering risk strategy and planning, risk identification, qualitative and quantitative risk analysis, risk response, and monitoring and closing risks.',
    questions: P1
  },
  {
    slug: 'pmi-rmp-p2',
    code: 'PMI-RMP-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 150-minute, 65-question, blueprint-weighted set.',
    questions: P2
  },
  {
    slug: 'pmi-rmp-p3',
    code: 'PMI-RMP-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 150-minute, 65-question, blueprint-weighted set.',
    questions: P3
  }
];

const PMIRMP_BUNDLE = {
  slug: 'pmi-rmp',
  title: 'PMI Risk Management Professional (PMI-RMP)',
  description: 'Unlimited PMI-RMP practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering risk strategy and planning, risk identification, qualitative and quantitative risk analysis, risk response, and monitoring and closing risks, aligned to the PMI-RMP exam content outline.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 52000 // USD 520 — VOUCHER tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the PMI-RMP bundle. Safe to call repeatedly —
 * vendor / exam / bundle rows are upserted, and questions tagged
 * `generatedBy: 'manual:pmirmp-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedPmiRmp(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'pmi' } });
  await db.vendor.upsert({
    where: { slug: 'pmi' },
    update: { name: 'PMI', description: 'Project Management Institute (PMI) certifications — project, program, agile, and risk management credentials including the PMI Risk Management Professional (PMI-RMP).' },
    create: { slug: 'pmi', name: 'PMI', description: 'Project Management Institute (PMI) certifications — project, program, agile, and risk management credentials including the PMI Risk Management Professional (PMI-RMP).' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'pmi' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of PMIRMP_EXAMS) {
    const title = `PMI Risk Management Professional (PMI-RMP) — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the PMI-RMP exam content outline.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Professional',
      durationMinutes: 150,
      passingScore: 75,
      questionCount: e.questions.length,
      domains: PMIRMP_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:pmirmp-seed' } });
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
          generatedBy: 'manual:pmirmp-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: PMIRMP_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: PMIRMP_BUNDLE.slug },
    update: {
      title: PMIRMP_BUNDLE.title,
      description: PMIRMP_BUNDLE.description,
      price: PMIRMP_BUNDLE.price,
      priceVoucher: PMIRMP_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: PMIRMP_BUNDLE.slug,
      title: PMIRMP_BUNDLE.title,
      description: PMIRMP_BUNDLE.description,
      price: PMIRMP_BUNDLE.price,
      priceVoucher: PMIRMP_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'pmi-rmp-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'pmi-rmp-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'pmi-rmp-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'pmi-rmp-p1', tier: 'VOUCHER' as const, position: 4 }
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
