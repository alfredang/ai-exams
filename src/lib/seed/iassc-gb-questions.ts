/**
 * IASSC Lean Six Sigma Green Belt bundle seed — vendor, three
 * practice-exam variants, bundle, and 195 blueprint-aligned questions.
 * Idempotent: replaces rows tagged `generatedBy: 'manual:iassc-gb-seed'`
 * and upserts catalog rows.
 *
 * Exported as `seedIasscGb(db)` so the same code path is reachable from
 * the standalone CLI shim (`prisma/seeds/iassc-gb.ts`) and the protected
 * admin API (`/api/admin/seed-iassc-gb`) — letting us bootstrap the
 * production database without redeploying.
 *
 * Question content is authored against the public IASSC Lean Six Sigma
 * Green Belt Body of Knowledge and standard DMAIC statistical practice:
 *   - Define Phase   — 23% (15 / variant)
 *   - Measure Phase  — 23% (15 / variant)
 *   - Analyze Phase  — 23% (15 / variant)
 *   - Improve Phase  — 18% (12 / variant)
 *   - Control Phase  — 13% (8  / variant)
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

const DEFINE = 'Define Phase';
const MEASURE = 'Measure Phase';
const ANALYZE = 'Analyze Phase';
const IMPROVE = 'Improve Phase';
const CONTROL = 'Control Phase';

const REF_IASSC_BOK = { label: 'IASSC — Lean Six Sigma Green Belt Body of Knowledge', url: 'https://iassc.org/six-sigma-certification/green-belt-certification/' };
const REF_IASSC_GLOSSARY = { label: 'IASSC — Lean Six Sigma Glossary', url: 'https://iassc.org/lean-six-sigma-glossary/' };
const REF_ASQ_SIXSIGMA = { label: 'ASQ — What is Six Sigma?', url: 'https://asq.org/quality-resources/six-sigma' };
const REF_ASQ_DMAIC = { label: 'ASQ — The DMAIC Process', url: 'https://asq.org/quality-resources/dmaic' };
const REF_ASQ_SIPOC = { label: 'ASQ — SIPOC Diagram', url: 'https://asq.org/quality-resources/sipoc' };
const REF_ASQ_VOC = { label: 'ASQ — Voice of the Customer', url: 'https://asq.org/quality-resources/voice-of-the-customer' };
const REF_ASQ_PROJECT_CHARTER = { label: 'ASQ — Project Charter', url: 'https://asq.org/quality-resources/project-planning-tools' };
const REF_ASQ_FISHBONE = { label: 'ASQ — Fishbone (Ishikawa) Diagram', url: 'https://asq.org/quality-resources/fishbone' };
const REF_ASQ_PARETO = { label: 'ASQ — Pareto Chart', url: 'https://asq.org/quality-resources/pareto-chart' };
const REF_ASQ_MSA = { label: 'ASQ — Measurement Systems Analysis (Gage R&R)', url: 'https://asq.org/quality-resources/measurement-systems-analysis' };
const REF_ASQ_CONTROL_CHART = { label: 'ASQ — Control Chart', url: 'https://asq.org/quality-resources/control-chart' };
const REF_ASQ_PROCESS_CAPABILITY = { label: 'ASQ — Process Capability (Cp, Cpk)', url: 'https://asq.org/quality-resources/process-capability' };
const REF_ASQ_HYPOTHESIS = { label: 'ASQ — Hypothesis Testing', url: 'https://asq.org/quality-resources/hypothesis-testing' };
const REF_ASQ_DOE = { label: 'ASQ — Design of Experiments (DOE)', url: 'https://asq.org/quality-resources/design-of-experiments' };
const REF_ASQ_FMEA = { label: 'ASQ — Failure Mode and Effects Analysis (FMEA)', url: 'https://asq.org/quality-resources/fmea' };
const REF_ASQ_FIVES = { label: 'ASQ — 5S', url: 'https://asq.org/quality-resources/lean/five-s-tutorial' };
const REF_ASQ_VSM = { label: 'ASQ — Value Stream Mapping', url: 'https://asq.org/quality-resources/lean/value-stream-mapping' };
const REF_ASQ_REGRESSION = { label: 'ASQ — Scatter Diagram and Regression', url: 'https://asq.org/quality-resources/scatter-diagram' };
const REF_ASQ_KAIZEN = { label: 'ASQ — Kaizen', url: 'https://asq.org/quality-resources/kaizen' };
const REF_NIST_HANDBOOK = { label: 'NIST/SEMATECH — e-Handbook of Statistical Methods', url: 'https://www.itl.nist.gov/div898/handbook/' };

// Helper to build 4-option SINGLE questions with id 'a','b','c','d'.
const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];

// ───────────────────── Practice Exam 1 ─────────────────────
const P1: Q[] = [
  // ── Define Phase (15) ──
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In the DMAIC methodology, what is the primary purpose of the Define phase?',
    options: opts4(
      'To statistically validate the root cause of variation',
      'To clearly state the problem, goal, scope, and customer requirements of the project',
      'To implement and standardize the chosen solution',
      'To collect baseline measurement data on the process'
    ),
    correct: ['b'],
    explanation: 'Define establishes the business problem, project goal, scope, timeline, team, and the customer requirements (CTQs). Root-cause validation belongs to Analyze, data collection to Measure, and standardization to Control.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A SIPOC diagram is being created for an order-fulfillment process. Which element captures the high-level start and end boundaries of the process being improved?',
    options: opts4(
      'Suppliers and Inputs',
      'The Process column (typically 4–7 high-level steps)',
      'Outputs and Customers only',
      'The measurement system'
    ),
    correct: ['b'],
    explanation: 'SIPOC = Suppliers, Inputs, Process, Outputs, Customers. The Process column lists 4–7 high-level steps and, with its first/last step, frames the project scope boundaries. Suppliers/Inputs feed it; Outputs/Customers receive it.',
    references: [REF_ASQ_SIPOC]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team writes a project goal: "Reduce average invoice cycle time from 12 days to 6 days by the end of Q3." Which characteristic of a good problem/goal statement does this BEST demonstrate?',
    options: opts4(
      'It assigns blame to a specific department',
      'It is specific, measurable, and time-bound',
      'It already names the root cause',
      'It proposes the solution to be implemented'
    ),
    correct: ['b'],
    explanation: 'A strong goal statement is SMART — specific, measurable, attainable, relevant, time-bound. It should be solution-neutral and not assign blame or presuppose a root cause; those are determined later in Analyze.',
    references: [REF_ASQ_PROJECT_CHARTER, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A customer states "I want my package delivered fast." To make this usable for the project, the team translates it into "95% of packages delivered within 2 business days." This translation is an example of:',
    options: opts4(
      'Converting the Voice of the Customer into a measurable Critical-to-Quality (CTQ) requirement',
      'Performing a measurement systems analysis',
      'Calculating process sigma level',
      'Creating a control plan'
    ),
    correct: ['a'],
    explanation: 'Vague VOC statements are translated through a CTQ tree into specific, measurable requirements with targets and specification limits. This makes customer needs actionable and measurable for the project.',
    references: [REF_ASQ_VOC]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which document formally authorizes a Six Sigma project and typically contains the business case, problem statement, goal, scope, team, and milestones?',
    options: opts4(
      'The control chart',
      'The project charter',
      'The FMEA worksheet',
      'The Gage R&R report'
    ),
    correct: ['b'],
    explanation: 'The project charter is the foundational Define-phase document that authorizes the project and aligns sponsors and the team on the business case, problem, goal, scope, roles, and timeline.',
    references: [REF_ASQ_PROJECT_CHARTER, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'In a typical Lean Six Sigma project team, which role provides resources, removes organizational barriers, and is accountable for the project\'s business results?',
    options: opts4(
      'The Green Belt',
      'The project Champion/Sponsor',
      'The process operator',
      'The Master Black Belt instructor'
    ),
    correct: ['b'],
    explanation: 'The Champion (Sponsor) is a senior leader who charters the project, secures resources, clears organizational obstacles, and is accountable for business results. The Green Belt leads execution day to day.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that belong in a well-formed project charter.',
    options: opts4(
      'Business case / problem statement',
      'Project scope and boundaries',
      'The confirmed statistical root cause of the defect',
      'Goal statement with a measurable target and timeline'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A charter contains the business case, problem statement, goal, scope, team, and milestones. The confirmed statistical root cause is an output of the Analyze phase, not an input documented in the Define charter.',
    references: [REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.SINGLE,
    stem: 'A stakeholder analysis classifies a key operations manager as "high power, currently resistant." What engagement strategy is MOST appropriate?',
    options: opts4(
      'Ignore the manager until the project is complete',
      'Actively engage and manage them closely to understand concerns and convert resistance to support',
      'Remove them from all project communications',
      'Escalate immediately to terminate their employment'
    ),
    correct: ['b'],
    explanation: 'High-power, resistant stakeholders must be managed closely — engaging them, understanding objections, and addressing concerns to move them toward support. Ignoring or excluding a high-power stakeholder is a common cause of project failure.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE,
    stem: 'A "Critical to Quality" (CTQ) characteristic is best described as:',
    options: opts4(
      'Any internal cost-saving idea proposed by the team',
      'A measurable product or process attribute that is essential to meeting a customer requirement',
      'The financial benefit reported to the Champion',
      'The control limit on an X-bar chart'
    ),
    correct: ['b'],
    explanation: 'A CTQ is a measurable characteristic whose performance must fall within specified limits to satisfy the customer. CTQs are derived by translating VOC into specific requirements with targets and tolerances.',
    references: [REF_ASQ_VOC, REF_IASSC_GLOSSARY]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team uses a Kano model during Define. A feature that customers do not explicitly ask for but that delights them when present is classified as:',
    options: opts4(
      'A "must-be" (basic) requirement',
      'A "one-dimensional" (performance) requirement',
      'An "attractive" (delighter/exciter) requirement',
      'An "indifferent" requirement'
    ),
    correct: ['c'],
    explanation: 'In the Kano model, attractive (exciter/delighter) features are unspoken; their absence does not dissatisfy, but their presence delights. Must-be features cause dissatisfaction if absent; one-dimensional features scale linearly with satisfaction.',
    references: [REF_ASQ_VOC]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which of the following is the BEST example of a properly scoped Green Belt project?',
    options: opts4(
      'Redesign the entire enterprise ERP system across all business units',
      'Reduce defects on the night-shift labeling step of Line 3 within 4 months',
      'Improve overall company profitability this fiscal year',
      'Make customers happier'
    ),
    correct: ['b'],
    explanation: 'Green Belt projects should be narrowly scoped, achievable in roughly 3–6 months, with a measurable target. Enterprise-wide redesigns and vague aspirational statements are too broad and unmeasurable.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team estimates that fixing a defect will save $180,000 annually and require $40,000 of one-time investment. Where in Define is this information primarily captured and used to justify the project?',
    options: opts4(
      'The control plan',
      'The business case within the project charter',
      'The Gage R&R study',
      'The hypothesis test'
    ),
    correct: ['b'],
    explanation: 'The business case in the charter quantifies the financial and strategic justification (costs, expected benefits, ROI). It is used to gain sponsorship and prioritize the project against alternatives.',
    references: [REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is a problem statement in Define typically required to be "solution-neutral"?',
    options: opts4(
      'Because solutions are illegal until the Control phase',
      'To avoid prematurely anchoring the team on one fix before the data reveals the true root cause',
      'Because charters cannot contain verbs',
      'To reduce the document length'
    ),
    correct: ['b'],
    explanation: 'Embedding a presumed solution biases the team and may cause them to "solve" the wrong cause. Keeping the statement solution-neutral preserves objectivity until Measure/Analyze identify the verified root cause.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE,
    stem: 'A high-level process map created in Define to show the major steps from supplier to customer, often the "P" of SIPOC, is commonly called a:',
    options: opts4(
      'Detailed value-add/non-value-add swimlane map',
      'High-level process map (macro map)',
      'Statistical process control chart',
      'Cause-and-effect matrix'
    ),
    correct: ['b'],
    explanation: 'The Define phase typically uses a high-level (macro) process map of 4–7 steps to frame scope. Detailed swimlane/VA-NVA maps and SPC charts come later in Measure/Analyze.',
    references: [REF_ASQ_SIPOC]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL valid sources for capturing the Voice of the Customer.',
    options: opts4(
      'Customer surveys and interviews',
      'Complaint and warranty-claim logs',
      'Random numbers generated to fill the analysis',
      'Direct observation of customers using the product/service'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'VOC is gathered from surveys, interviews, complaint/warranty data, focus groups, and direct observation. Fabricated or random data is never a valid VOC source and would invalidate the requirements.',
    references: [REF_ASQ_VOC]
  },

  // ── Measure Phase (15) ──
  {
    domain: MEASURE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary objective of the Measure phase in DMAIC?',
    options: opts4(
      'To brainstorm and implement solutions',
      'To establish a validated baseline of current process performance and a trustworthy measurement system',
      'To write the project charter',
      'To audit the control plan after rollout'
    ),
    correct: ['b'],
    explanation: 'Measure quantifies the current state: it defines the metric (Y), validates the measurement system, collects baseline data, and computes baseline capability/sigma. Solutions come in Improve; charter in Define.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Gage R&R study shows %Study Variation of 8%. According to common AIAG guidelines, this measurement system is:',
    options: opts4(
      'Unacceptable and must be redesigned',
      'Generally acceptable (under 10%)',
      'Marginal — acceptable only depending on cost',
      'Impossible; %GRR cannot be below 10%'
    ),
    correct: ['b'],
    explanation: 'A common rule of thumb: %GRR under 10% is acceptable, 10–30% is marginal (acceptable depending on application/cost), and over 30% is unacceptable. At 8% the measurement system is acceptable.',
    references: [REF_ASQ_MSA, REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'In a Gage R&R study, "Repeatability" specifically measures variation due to:',
    options: opts4(
      'Different operators measuring the same part',
      'The same operator measuring the same part multiple times with the same gage',
      'Part-to-part differences in the population',
      'Drift in the process mean over a shift'
    ),
    correct: ['b'],
    explanation: 'Repeatability (equipment variation) is the variation when one operator measures the same part repeatedly with the same instrument. Reproducibility is the variation between different operators.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which scale of measurement allows ranking but has no true zero and unequal or undefined intervals (e.g., satisfaction rated 1–5)?',
    options: opts4(
      'Nominal',
      'Ordinal',
      'Interval',
      'Ratio'
    ),
    correct: ['b'],
    explanation: 'Ordinal data can be rank-ordered but the intervals are not necessarily equal and there is no meaningful true zero. Nominal data is categorical without order; interval/ratio data have equal intervals (ratio also has a true zero).',
    references: [REF_NIST_HANDBOOK, REF_IASSC_GLOSSARY]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A process produces 4 defects across 500 units, where each unit has 3 opportunities for a defect. What is the DPMO (defects per million opportunities)?',
    options: opts4(
      'Approximately 8,000',
      'Approximately 2,667',
      'Approximately 800',
      'Approximately 1,500'
    ),
    correct: ['b'],
    explanation: 'DPMO = (defects / (units × opportunities)) × 1,000,000 = (4 / (500 × 3)) × 1,000,000 = (4 / 1500) × 1,000,000 ≈ 2,667.',
    references: [REF_ASQ_SIXSIGMA, REF_IASSC_GLOSSARY]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A data set has values: 4, 8, 6, 8, 10. What is the mean, and what is the mode?',
    options: opts4(
      'Mean = 7.2, Mode = 8',
      'Mean = 8, Mode = 7.2',
      'Mean = 6, Mode = 10',
      'Mean = 7.2, Mode = 4'
    ),
    correct: ['a'],
    explanation: 'Mean = (4+8+6+8+10)/5 = 36/5 = 7.2. The mode is the most frequent value, which is 8 (appears twice).',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which of the following BEST describes "accuracy" versus "precision" of a measurement system?',
    options: opts4(
      'Accuracy is closeness to the true value; precision is the repeatability/spread of repeated measurements',
      'Accuracy and precision are synonyms',
      'Accuracy is the spread of values; precision is the average value',
      'Precision refers only to the number of decimal places displayed'
    ),
    correct: ['a'],
    explanation: 'Accuracy (bias) is how close measurements are to the true/reference value. Precision is how close repeated measurements are to each other (low spread). A system can be precise but biased, or accurate on average but imprecise.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'For a stable, normally distributed process with mean 50 and standard deviation 2, approximately what percentage of output falls between 46 and 54?',
    options: opts4(
      'About 68%',
      'About 95%',
      'About 99.7%',
      'About 50%'
    ),
    correct: ['b'],
    explanation: 'The empirical rule for a normal distribution: ~68% within ±1σ, ~95% within ±2σ, ~99.7% within ±3σ. 46 to 54 is the mean ±2σ (50 ± 4), so about 95%.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'An operational definition is created for the metric "late delivery." Its primary purpose is to:',
    options: opts4(
      'Hide the data from the customer',
      'Ensure everyone measures and classifies the metric consistently and unambiguously',
      'Replace the need for a measurement system analysis',
      'Increase the project budget'
    ),
    correct: ['b'],
    explanation: 'An operational definition specifies exactly how a characteristic is measured and classified so that different people get consistent results. Without it, data is ambiguous and not comparable.',
    references: [REF_NIST_HANDBOOK, REF_IASSC_BOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL examples of continuous (variable) data.',
    options: opts4(
      'Cycle time in minutes',
      'Weight in kilograms',
      'Number of defective units in a lot (count)',
      'Temperature in degrees Celsius'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Continuous data can take any value on a scale (time, weight, temperature). A count of defective units is discrete (attribute) data — it can only take whole-number values.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which sampling method divides the population into homogeneous subgroups and then samples from each subgroup proportionally?',
    options: opts4(
      'Simple random sampling',
      'Stratified sampling',
      'Convenience sampling',
      'Census'
    ),
    correct: ['b'],
    explanation: 'Stratified sampling partitions the population into homogeneous strata (e.g., by shift or product line) and samples each, improving representativeness. A census measures every unit; convenience sampling is non-probabilistic.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A process has a first-pass yield of 90% at step A and 80% at step B (sequential, independent). What is the rolled throughput yield (RTY)?',
    options: opts4(
      '85%',
      '72%',
      '170%',
      '90%'
    ),
    correct: ['b'],
    explanation: 'RTY is the product of the individual step yields: 0.90 × 0.80 = 0.72, i.e., 72%. RTY captures the probability a unit passes all steps with no rework.',
    references: [REF_ASQ_SIXSIGMA]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team plots collected data on a histogram and sees two distinct peaks. This bimodal pattern MOST likely indicates:',
    options: opts4(
      'A perfectly capable process',
      'Two different populations or process conditions mixed in the data (e.g., two machines/shifts)',
      'The measurement system is perfect',
      'The data must be discarded entirely'
    ),
    correct: ['b'],
    explanation: 'Bimodality usually signals that the data contains two underlying populations or process states (different machines, operators, materials, or shifts) that should be stratified and analyzed separately.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'For a data set, the standard deviation is 0 (zero). What does this indicate?',
    options: opts4(
      'The data has maximum spread',
      'Every value in the data set is identical (no variation)',
      'The calculation must be wrong',
      'The mean is also zero'
    ),
    correct: ['b'],
    explanation: 'A standard deviation of zero means there is no dispersion — all observed values are equal. It says nothing about the value of the mean itself.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'During an Attribute Agreement Analysis (attribute MSA), two appraisers disagree frequently when classifying the same items as pass/fail. The BEST conclusion is:',
    options: opts4(
      'The process is highly capable',
      'The attribute measurement system lacks reproducibility and the operational definition/training needs improvement',
      'The customer specification is wrong',
      'Continuous data should be reported instead'
    ),
    correct: ['b'],
    explanation: 'Poor between-appraiser agreement indicates weak reproducibility of the attribute measurement system. The fix is to clarify the operational definition and retrain appraisers before trusting the baseline data.',
    references: [REF_ASQ_MSA]
  },

  // ── Analyze Phase (15) ──
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The principal goal of the Analyze phase is to:',
    options: opts4(
      'Identify and statistically validate the root cause(s) of the problem',
      'Write the project charter',
      'Implement the control plan',
      'Calibrate the measurement gages'
    ),
    correct: ['a'],
    explanation: 'Analyze uses data and statistical tools to identify and verify the vital few root causes (X\'s) driving the output (Y). Charter is Define; control plan is Control; gage calibration is part of Measure/MSA.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A two-sample t-test comparing the mean cycle time of two suppliers returns a p-value of 0.02 with α = 0.05. The correct interpretation is:',
    options: opts4(
      'Fail to reject the null hypothesis; the means are equal',
      'Reject the null hypothesis; there is a statistically significant difference in means',
      'The test is invalid because p < α',
      'The sample size must be increased before any conclusion'
    ),
    correct: ['b'],
    explanation: 'When p-value (0.02) < α (0.05), you reject the null hypothesis (H0: means equal) and conclude there is a statistically significant difference between the two suppliers\' mean cycle times.',
    references: [REF_ASQ_HYPOTHESIS, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A Type I error in hypothesis testing is best described as:',
    options: opts4(
      'Failing to reject a false null hypothesis (missing a real effect)',
      'Rejecting a true null hypothesis (a false alarm)',
      'Choosing the wrong test statistic',
      'Using too large a sample size'
    ),
    correct: ['b'],
    explanation: 'A Type I error (α) is rejecting H0 when it is actually true — a false positive. A Type II error (β) is failing to reject H0 when it is false — a missed detection.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A cause-and-effect (Ishikawa/fishbone) diagram is being used in Analyze. The classic "6M" categories for a manufacturing process are Man, Machine, Method, Material, Measurement, and:',
    options: opts4(
      'Mother Nature (Environment)',
      'Money',
      'Marketing',
      'Management'
    ),
    correct: ['a'],
    explanation: 'The classic 6Ms are Man (People), Machine, Method, Material, Measurement, and Mother Nature (Environment). The fishbone organizes potential causes into these categories for structured brainstorming.',
    references: [REF_ASQ_FISHBONE]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pareto chart of defect types shows that 3 of 12 categories account for 80% of all defects. The Pareto principle suggests the team should:',
    options: opts4(
      'Spread effort equally across all 12 categories',
      'Focus improvement effort on the "vital few" categories driving most of the defects',
      'Ignore the chart because all defects matter equally',
      'Eliminate Pareto analysis and use a control chart instead'
    ),
    correct: ['b'],
    explanation: 'The Pareto principle (80/20 rule) directs the team to prioritize the vital few categories that produce the majority of the impact, maximizing return on improvement effort.',
    references: [REF_ASQ_PARETO]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A scatter plot of oven temperature vs. defect rate yields a correlation coefficient r = -0.85. The correct interpretation is:',
    options: opts4(
      'A strong positive linear relationship',
      'A strong negative linear relationship; as temperature rises, defect rate tends to fall',
      'No relationship at all',
      'A guaranteed causal relationship proving temperature causes defects'
    ),
    correct: ['b'],
    explanation: 'r = -0.85 indicates a strong negative linear association: higher temperature is associated with lower defect rate. Correlation alone does not prove causation; confounding must be considered.',
    references: [REF_ASQ_REGRESSION, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which technique repeatedly asks "Why?" to drill from a symptom down to an underlying root cause?',
    options: opts4(
      'Design of Experiments',
      'The 5 Whys',
      'Control charting',
      'Process capability analysis'
    ),
    correct: ['b'],
    explanation: 'The 5 Whys is an iterative interrogative technique that repeatedly asks why a problem occurs to traverse the chain of causation to a root cause, often used alongside the fishbone diagram.',
    references: [REF_ASQ_FISHBONE, REF_IASSC_GLOSSARY]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'An ANOVA is used to compare the mean output of four machines. A statistically significant F-test result tells you:',
    options: opts4(
      'All four machine means are equal',
      'At least one machine mean differs from the others, warranting post-hoc comparison',
      'Exactly two means differ and the rest are equal',
      'The machines have equal variances by definition'
    ),
    correct: ['b'],
    explanation: 'A significant one-way ANOVA rejects the null that all group means are equal; it indicates at least one mean differs. Post-hoc tests (e.g., Tukey) are then used to identify which specific groups differ.',
    references: [REF_ASQ_HYPOTHESIS, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that are TRUE about correlation and causation.',
    options: opts4(
      'A high correlation can occur without any causal relationship (e.g., a lurking variable)',
      'Correlation alone is sufficient to prove cause and effect',
      'A controlled experiment (DOE) provides stronger evidence of causation than observational correlation',
      'Two variables can be causally related yet show low linear correlation if the relationship is non-linear'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Correlation does not prove causation; confounders can create spurious correlation. Designed experiments give stronger causal evidence. Non-linear true relationships may produce low linear r despite a real dependency.',
    references: [REF_ASQ_REGRESSION, REF_ASQ_DOE]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'In hypothesis testing, the null hypothesis (H0) typically represents:',
    options: opts4(
      'The claim of a difference or effect the team hopes to prove',
      'The default position of "no difference / no effect / status quo"',
      'The alternative the team must always accept',
      'The significance level α'
    ),
    correct: ['b'],
    explanation: 'H0 states no difference or no effect (status quo). The alternative hypothesis (Ha) represents the effect/difference being investigated. We gather evidence to potentially reject H0 in favor of Ha.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A chi-square test of independence is the appropriate tool when you want to determine whether:',
    options: opts4(
      'Two continuous variables have a linear relationship',
      'Two categorical (attribute) variables are associated/independent',
      'The mean of one group differs from a target value',
      'A process is in statistical control over time'
    ),
    correct: ['b'],
    explanation: 'A chi-square test of independence assesses whether two categorical variables (e.g., shift vs. defect type) are associated. Continuous relationships use regression/correlation; means use t-tests; control is assessed with control charts.',
    references: [REF_ASQ_HYPOTHESIS, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A simple linear regression yields R² = 0.64. The correct interpretation is:',
    options: opts4(
      '64% of the variation in the response is explained by the predictor in the model',
      'The slope of the line is 0.64',
      '64% of the data points lie exactly on the line',
      'The correlation coefficient is 0.64'
    ),
    correct: ['a'],
    explanation: 'R² (coefficient of determination) is the proportion of variation in the response explained by the model. R² = 0.64 means 64% of the response variation is explained; it is not the slope and r = √0.64 = 0.8 (sign aside).',
    references: [REF_ASQ_REGRESSION]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A box plot of cycle times shows several points beyond the upper whisker. These points are best described as:',
    options: opts4(
      'The interquartile range',
      'Potential outliers that warrant investigation',
      'The median values',
      'Guaranteed measurement errors that must be deleted'
    ),
    correct: ['b'],
    explanation: 'Points beyond the whiskers (typically 1.5×IQR from the quartiles) are potential outliers. They should be investigated for special causes or data errors, not automatically deleted without justification.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team performs a hypothesis test with very small sample sizes and fails to reject H0, even though a meaningful difference may exist. This situation most directly relates to:',
    options: opts4(
      'High statistical power',
      'Low statistical power / increased risk of a Type II error',
      'A Type I error',
      'A perfect measurement system'
    ),
    correct: ['b'],
    explanation: 'Small samples reduce statistical power (1−β), increasing the chance of a Type II error — failing to detect a real effect. Adequate sample size is needed to detect a practically meaningful difference.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'When constructing a fishbone diagram, the "head" (effect) of the fish should contain:',
    options: opts4(
      'The proposed solution',
      'A clear statement of the problem or effect being analyzed',
      'The project budget',
      'The control limits'
    ),
    correct: ['b'],
    explanation: 'The effect/problem statement is placed at the head of the fishbone; the bones branch into cause categories. Solutions are not placed in the diagram — it is a tool for identifying potential causes.',
    references: [REF_ASQ_FISHBONE]
  },

  // ── Improve Phase (12) ──
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The primary objective of the Improve phase is to:',
    options: opts4(
      'Identify the root cause statistically',
      'Develop, select, pilot, and implement solutions that address the validated root causes',
      'Define the project scope',
      'Audit the control chart'
    ),
    correct: ['b'],
    explanation: 'Improve generates potential solutions, evaluates and selects them (e.g., via DOE, piloting, criteria matrices), and implements the chosen solution to address the verified root causes from Analyze.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team runs a full factorial Design of Experiments with 3 factors each at 2 levels. How many runs are in a single replicate of the full factorial?',
    options: opts4(
      '6',
      '8',
      '9',
      '3'
    ),
    correct: ['b'],
    explanation: 'A full factorial with k factors at 2 levels requires 2^k runs. With k = 3, that is 2³ = 8 runs per replicate.',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'In a designed experiment, an "interaction effect" between factors A and B means:',
    options: opts4(
      'A and B can never be tested together',
      'The effect of factor A on the response depends on the level of factor B',
      'A and B have identical main effects',
      'There is no relationship between A and the response'
    ),
    correct: ['b'],
    explanation: 'An interaction exists when the effect of one factor on the response changes depending on the level of another factor. Detecting interactions is a key advantage of factorial DOE over one-factor-at-a-time testing.',
    references: [REF_ASQ_DOE]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A solution selection matrix scores candidate solutions against weighted criteria (impact, cost, ease, risk). Its main purpose is to:',
    options: opts4(
      'Guarantee the cheapest solution always wins',
      'Provide a structured, objective comparison to prioritize among competing solutions',
      'Replace the need for a pilot',
      'Eliminate stakeholder involvement'
    ),
    correct: ['b'],
    explanation: 'A weighted criteria/solution selection matrix structures the decision so options are compared objectively against agreed criteria, reducing bias. It informs — but does not eliminate — piloting and stakeholder buy-in.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is a pilot (small-scale trial) typically run before full-scale implementation of a solution?',
    options: opts4(
      'To delay the project indefinitely',
      'To validate effectiveness and surface unintended consequences at low risk and cost before full rollout',
      'Because pilots are required by law',
      'To avoid measuring the results'
    ),
    correct: ['b'],
    explanation: 'A pilot confirms the solution actually improves the metric and reveals practical issues or side effects on a limited scale, allowing adjustment before committing to a costly, full-scale deployment.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL tools commonly used during the Improve phase.',
    options: opts4(
      'Design of Experiments (DOE)',
      'FMEA to assess risk of proposed solutions',
      'Pilot studies',
      'SIPOC to charter the project'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'DOE, FMEA (to evaluate risk of new solutions), and pilots are Improve-phase tools. SIPOC is a Define-phase scoping tool used to frame the project, not to develop solutions.',
    references: [REF_ASQ_DOE, REF_ASQ_FMEA]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A "poka-yoke" implemented during Improve is best described as:',
    options: opts4(
      'A statistical hypothesis test',
      'A mistake-proofing device or design that prevents or immediately detects errors',
      'A type of control chart',
      'A project scheduling technique'
    ),
    correct: ['b'],
    explanation: 'Poka-yoke (mistake-proofing) designs the process so errors are prevented from occurring or are immediately obvious, removing reliance on human vigilance — a powerful, sustainable improvement.',
    references: [REF_IASSC_GLOSSARY]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'In DOE terminology, "randomization" of run order is performed primarily to:',
    options: opts4(
      'Reduce the number of runs required',
      'Protect against the influence of unknown lurking/time-related variables by spreading their effect',
      'Guarantee no interactions exist',
      'Make the analysis impossible to compute'
    ),
    correct: ['b'],
    explanation: 'Randomizing run order helps ensure that uncontrolled, time-related nuisance factors (tool wear, temperature drift) do not systematically bias the estimated factor effects. It is a core DOE principle alongside replication and blocking.',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A fractional factorial design is chosen instead of a full factorial primarily to:',
    options: opts4(
      'Eliminate the need for any analysis',
      'Reduce the number of experimental runs by accepting some confounding (aliasing) of higher-order effects',
      'Guarantee all interactions are estimated independently',
      'Increase cost and runs for more precision'
    ),
    correct: ['b'],
    explanation: 'Fractional factorials use a carefully chosen subset of runs to study many factors economically, at the cost of aliasing (confounding) higher-order interactions with lower-order effects — usually acceptable when high-order interactions are negligible.',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE,
    stem: 'A focused, short-duration improvement event where a cross-functional team rapidly implements changes (often 3–5 days) is commonly called a:',
    options: opts4(
      'Kaizen event (rapid improvement event)',
      'Gage R&R study',
      'Control plan review',
      'Stakeholder analysis'
    ),
    correct: ['a'],
    explanation: 'A Kaizen (rapid improvement) event concentrates a cross-functional team on quickly analyzing and implementing focused improvements within a short, time-boxed period, embodying continuous improvement.',
    references: [REF_ASQ_KAIZEN]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'After piloting, the team confirms the solution improved the metric. What should they do BEFORE full-scale rollout?',
    options: opts4(
      'Immediately close the project with no further action',
      'Develop an implementation plan and a control/sustainability plan to hold the gains',
      'Discard the pilot results',
      'Restart the Define phase from scratch'
    ),
    correct: ['b'],
    explanation: 'A validated pilot should lead to a structured implementation plan and a control plan (Control phase) so improvements are deployed reliably and the gains are sustained, not lost over time.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A response surface or main-effects plot from a DOE shows that increasing factor "cure time" from low to high raises yield substantially while "pressure" has little effect. The appropriate Improve action is to:',
    options: opts4(
      'Set both factors to their lowest setting regardless of the data',
      'Optimize the significant factor (cure time) toward the level that maximizes yield and de-prioritize the non-significant factor',
      'Ignore the DOE and use intuition',
      'Conclude the experiment was invalid'
    ),
    correct: ['b'],
    explanation: 'DOE results guide optimization: drive the statistically and practically significant factor toward its best level, while non-significant factors can be set for cost/convenience. This is the core value of experimentation in Improve.',
    references: [REF_ASQ_DOE]
  },

  // ── Control Phase (8) ──
  {
    domain: CONTROL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'The primary objective of the Control phase is to:',
    options: opts4(
      'Identify the root cause of variation',
      'Sustain the improvement gains over time and prevent the process from reverting',
      'Write the business case',
      'Brainstorm potential solutions'
    ),
    correct: ['b'],
    explanation: 'Control institutionalizes the improvement: it monitors the process (e.g., SPC), documents standards, trains staff, and creates a control/response plan so gains are sustained and the process does not regress.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'On a control chart, a single point falling outside the upper control limit (UCL) most likely indicates:',
    options: opts4(
      'Normal common-cause variation that needs no action',
      'A special (assignable) cause of variation that should be investigated',
      'The specification limits were exceeded by definition',
      'The chart must be deleted'
    ),
    correct: ['b'],
    explanation: 'A point beyond a control limit is an out-of-control signal indicating special-cause variation to investigate. Control limits reflect process voice (±3σ) and are distinct from customer specification limits.',
    references: [REF_ASQ_CONTROL_CHART, REF_NIST_HANDBOOK]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'Which statement correctly distinguishes control limits from specification limits?',
    options: opts4(
      'They are always identical',
      'Control limits come from the process data (voice of the process); specification limits come from customer/engineering requirements (voice of the customer)',
      'Specification limits are calculated as ±3σ from the data',
      'Control limits are set by the customer'
    ),
    correct: ['b'],
    explanation: 'Control limits are computed from process variation (typically ±3σ of the plotted statistic) — the voice of the process. Specification limits are externally defined customer/engineering requirements — the voice of the customer. They are independent.',
    references: [REF_ASQ_CONTROL_CHART, REF_ASQ_PROCESS_CAPABILITY]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'A stable process has Cp = 1.0. What does this imply about its capability relative to the specification spread?',
    options: opts4(
      'The process spread (6σ) exactly equals the specification width; roughly 0.27% out of spec if perfectly centered',
      'The process produces zero defects',
      'The process is at Six Sigma capability',
      'Cp = 1.0 is impossible for a stable process'
    ),
    correct: ['a'],
    explanation: 'Cp = (USL−LSL)/(6σ). Cp = 1.0 means the 6σ process spread equals the tolerance width; if perfectly centered, about 0.27% falls outside (±3σ). Six Sigma quality typically targets Cp/Cpk ≥ 1.33–2.0.',
    references: [REF_ASQ_PROCESS_CAPABILITY, REF_NIST_HANDBOOK]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'Which document specifies what to monitor, the measurement method, sample size/frequency, control limits, and the reaction plan for out-of-control conditions?',
    options: opts4(
      'The project charter',
      'The control plan',
      'The SIPOC diagram',
      'The fishbone diagram'
    ),
    correct: ['b'],
    explanation: 'The control plan is the Control-phase artifact that documents monitoring of the vital X\'s and the Y: what is measured, how, how often, the control method/limits, and the documented reaction plan when signals appear.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'For monitoring a defective/non-defective attribute with varying subgroup sizes, which control chart is MOST appropriate?',
    options: opts4(
      'X-bar and R chart',
      'p-chart',
      'Individuals (I-MR) chart for continuous data',
      'Histogram'
    ),
    correct: ['b'],
    explanation: 'A p-chart tracks the proportion defective and handles varying subgroup sizes. X-bar/R and I-MR are for continuous data; a histogram is not a time-ordered control chart.',
    references: [REF_ASQ_CONTROL_CHART]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate elements of a Control-phase plan to sustain improvements.',
    options: opts4(
      'Standardized work instructions / updated SOPs',
      'Statistical process control monitoring with a reaction plan',
      'Training and clear process ownership/handoff',
      'Removing all measurement of the process to save time'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Sustaining gains requires standardized procedures, ongoing SPC monitoring with a defined reaction plan, training, and clear ownership. Eliminating measurement removes the ability to detect regression and defeats the purpose of Control.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'A control chart shows 8 consecutive points all above the centerline, though none exceed the control limits. The BEST interpretation is:',
    options: opts4(
      'The process is perfectly in control; no action needed',
      'A non-random run pattern signals a likely shift/special cause to investigate even though no point breached a limit',
      'The control limits must be widened',
      'The specification limits were violated'
    ),
    correct: ['b'],
    explanation: 'Run rules (e.g., Western Electric / Nelson rules) flag non-random patterns such as 8+ points on one side of the centerline as out-of-control signals, indicating a process shift to investigate even without a point outside the limits.',
    references: [REF_ASQ_CONTROL_CHART, REF_NIST_HANDBOOK]
  }
];

// ───────────────────── Practice Exam 2 ─────────────────────
const P2: Q[] = [
  // ── Define Phase (15) ──
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which DMAIC phase concludes with an approved project charter and a clearly bounded scope?',
    options: opts4(
      'Measure',
      'Define',
      'Analyze',
      'Control'
    ),
    correct: ['b'],
    explanation: 'The Define phase produces the approved charter (business case, problem, goal, scope, team, timeline) and a clearly bounded scope before the team proceeds to baseline measurement.',
    references: [REF_ASQ_DMAIC, REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team is tempted to expand its project scope to include three additional processes mid-project. This risk is commonly called:',
    options: opts4(
      'Scope creep',
      'Common-cause variation',
      'A Type II error',
      'Reproducibility error'
    ),
    correct: ['a'],
    explanation: 'Scope creep is the uncontrolled expansion of project boundaries. It dilutes focus and endangers timelines; the charter and scope statement are used to manage and contain it.',
    references: [REF_IASSC_BOK, REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In SIPOC, what does the letter "I" represent?',
    options: opts4(
      'Improvement',
      'Inputs (materials, information, resources entering the process)',
      'Inspection',
      'Interval data'
    ),
    correct: ['b'],
    explanation: 'SIPOC = Suppliers, Inputs, Process, Outputs, Customers. "I" is Inputs — the materials, information, and resources that suppliers feed into the process.',
    references: [REF_ASQ_SIPOC]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A CTQ tree is used in Define primarily to:',
    options: opts4(
      'Calculate process sigma',
      'Decompose a broad customer need into specific, measurable quality requirements',
      'Track defects over time',
      'Schedule the project tasks'
    ),
    correct: ['b'],
    explanation: 'A Critical-to-Quality (CTQ) tree breaks a general customer need down into drivers and then into specific, measurable requirements with targets and limits, making VOC actionable.',
    references: [REF_ASQ_VOC]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.SINGLE,
    stem: 'A Green Belt project\'s expected benefit is $25,000/year but it will consume 9 months of cross-functional effort costing an estimated $90,000. As the Champion, the BEST Define-phase decision is to:',
    options: opts4(
      'Proceed regardless because all projects must be completed',
      'Re-evaluate or rescope the project — the cost/benefit does not currently justify the investment',
      'Skip the Measure phase to save money',
      'Increase the goal arbitrarily to improve ROI on paper'
    ),
    correct: ['b'],
    explanation: 'Project selection in Define must weigh expected benefit against cost and effort. A weak business case should trigger rescoping, reprioritization, or cancellation rather than blindly proceeding or manipulating targets.',
    references: [REF_ASQ_PROJECT_CHARTER, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is the BEST example of a measurable problem statement for Define?',
    options: opts4(
      'Customers are unhappy with us.',
      'Over the last 6 months, on-time delivery averaged 78% versus a target of 95%, costing an estimated $120K in penalties.',
      'The warehouse team should work harder.',
      'We will implement a new scheduling tool to fix delivery.'
    ),
    correct: ['b'],
    explanation: 'A good problem statement quantifies the gap (78% vs 95% target), the timeframe, and the business impact, while remaining solution-neutral and free of blame. The others are vague, blaming, or solution-prescriptive.',
    references: [REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A RACI matrix in the Define phase is used to:',
    options: opts4(
      'Compute control limits',
      'Clarify who is Responsible, Accountable, Consulted, and Informed for project activities',
      'Test a statistical hypothesis',
      'Measure gage repeatability'
    ),
    correct: ['b'],
    explanation: 'RACI clarifies roles and decision rights — Responsible, Accountable, Consulted, Informed — reducing ambiguity and improving stakeholder alignment during the project.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE,
    stem: 'The "Voice of the Business" differs from the "Voice of the Customer" in that it primarily reflects:',
    options: opts4(
      'External customer satisfaction only',
      'Internal organizational needs such as cost, revenue, compliance, and strategic goals',
      'The standard deviation of the process',
      'The control plan reaction steps'
    ),
    correct: ['b'],
    explanation: 'Voice of the Business captures internal stakeholder/organizational needs (cost, profit, compliance, strategy), complementing the external Voice of the Customer. Both inform project selection and CTQs.',
    references: [REF_ASQ_VOC, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL characteristics of an effective Six Sigma goal statement.',
    options: opts4(
      'Specific and measurable',
      'Time-bound',
      'Prescribes the exact technical solution to implement',
      'Aligned to a business need / customer requirement'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Effective goals are SMART and tied to a business/customer need. They should remain solution-neutral; prescribing the solution prematurely biases the team before the root cause is verified.',
    references: [REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.SINGLE,
    stem: 'A project sponsor wants results in 2 weeks for a problem that historically requires data collection across a 60-day cycle. The Green Belt should:',
    options: opts4(
      'Promise the 2-week deadline and fabricate early data',
      'Negotiate a realistic timeline in the charter based on the data-collection cycle and project complexity',
      'Skip the Measure phase entirely',
      'Cancel the project without discussion'
    ),
    correct: ['b'],
    explanation: 'Define includes setting a realistic, data-informed timeline in the charter. The Green Belt should manage expectations and negotiate scope/timeline rather than fabricate data or skip rigor.',
    references: [REF_ASQ_PROJECT_CHARTER, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which tool visually represents the magnitude and direction of stakeholders\' support or resistance to the project?',
    options: opts4(
      'Control chart',
      'Stakeholder analysis / commitment scale',
      'Histogram',
      'Gage R&R chart'
    ),
    correct: ['b'],
    explanation: 'A stakeholder analysis (often with a commitment scale from "strongly against" to "strongly supportive") maps influence and attitude so the team can plan targeted engagement and change management.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Green Belt frames the project Y as "percentage of invoices paid within terms." In Define, this Y should be:',
    options: opts4(
      'Left undefined until Control',
      'Clearly defined with an operational definition and tied to the customer/business requirement',
      'Replaced by a list of solutions',
      'Set equal to the project budget'
    ),
    correct: ['b'],
    explanation: 'The project output metric (Y) should be clearly identified and operationally defined in Define and linked to the CTQ/business need so the team measures the right thing in the Measure phase.',
    references: [REF_ASQ_VOC, REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which statement best describes the relationship between Lean and Six Sigma in a "Lean Six Sigma" project?',
    options: opts4(
      'Lean focuses on eliminating waste and improving flow; Six Sigma focuses on reducing variation and defects — they are complementary',
      'They are identical methodologies with different names',
      'Lean replaces the need for any statistical analysis',
      'Six Sigma only applies to manufacturing and Lean only to services'
    ),
    correct: ['a'],
    explanation: 'Lean targets waste and flow (speed), Six Sigma targets variation and defects (quality). Combined, Lean Six Sigma improves both speed and quality; both apply across manufacturing and services.',
    references: [REF_ASQ_SIXSIGMA, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.SINGLE,
    stem: 'During Define, the team identifies that the true sponsor of the affected process is in a different department than originally assumed. The MOST appropriate action is to:',
    options: opts4(
      'Proceed without informing the correct sponsor',
      'Update the charter and engage the correct sponsor/stakeholders to secure proper authority and resources',
      'Cancel the project permanently',
      'Skip stakeholder analysis to save time'
    ),
    correct: ['b'],
    explanation: 'Correct sponsorship is essential for authority, resources, and barrier removal. The charter and stakeholder analysis must be updated and the proper sponsor engaged as soon as the gap is discovered.',
    references: [REF_IASSC_BOK, REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A "Big Y / little y" discussion in Define helps the team to:',
    options: opts4(
      'Choose a font for the report',
      'Link the project\'s measurable output (little y) to the strategic business outcome (Big Y)',
      'Compute the standard deviation',
      'Select a control chart type'
    ),
    correct: ['b'],
    explanation: 'The Big Y is the strategic business metric; the project little y is the specific, measurable output the team can influence. Aligning them ensures the project contributes to organizational goals.',
    references: [REF_IASSC_BOK]
  },

  // ── Measure Phase (15) ──
  {
    domain: MEASURE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Before trusting baseline data, the Measure phase requires the team to:',
    options: opts4(
      'Implement the final solution',
      'Validate the measurement system (e.g., via Gage R&R or attribute agreement analysis)',
      'Write the control plan',
      'Close the project'
    ),
    correct: ['b'],
    explanation: 'A measurement systems analysis (Gage R&R for continuous data, attribute agreement analysis for attribute data) confirms the data is trustworthy before it is used for baseline capability and later decisions.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A process has USL = 110, LSL = 90, mean = 100, and σ = 2. What is the approximate Cpk?',
    options: opts4(
      '1.67',
      '0.83',
      '3.33',
      '1.00'
    ),
    correct: ['a'],
    explanation: 'Cpk = min[(USL−mean)/3σ, (mean−LSL)/3σ] = min[(110−100)/6, (100−90)/6] = min[1.667, 1.667] = 1.67. The centered process gives equal one-sided indices.',
    references: [REF_ASQ_PROCESS_CAPABILITY, REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which measure of central tendency is LEAST affected by extreme outliers?',
    options: opts4(
      'Mean',
      'Median',
      'Sum',
      'Range'
    ),
    correct: ['b'],
    explanation: 'The median is resistant (robust) to outliers because it depends on rank position, not magnitude. The mean is pulled toward extreme values; range and sum are highly sensitive to outliers.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A data collection plan should specify all of the following EXCEPT:',
    options: opts4(
      'What data to collect and the operational definition',
      'Who collects it, how, and how often (sampling plan)',
      'The confirmed solution to implement',
      'How the data will be recorded and stratified'
    ),
    correct: ['c'],
    explanation: 'A data collection plan defines what/who/how/when/where and how to stratify, plus operational definitions. The solution is determined later (Improve), not part of the Measure data collection plan.',
    references: [REF_NIST_HANDBOOK, REF_IASSC_BOK]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A process yields 3.4 defects per million opportunities. This corresponds to approximately which sigma level (with the conventional 1.5σ shift)?',
    options: opts4(
      '3 sigma',
      '4.5 sigma',
      '6 sigma',
      '2 sigma'
    ),
    correct: ['c'],
    explanation: 'The Six Sigma benchmark is defined as 3.4 DPMO when allowing for a long-term 1.5σ shift, corresponding to a 6 sigma process level.',
    references: [REF_ASQ_SIXSIGMA]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A check sheet is primarily used in the Measure phase to:',
    options: opts4(
      'Run a hypothesis test',
      'Systematically collect and tally observed data in real time in a structured format',
      'Compute regression coefficients',
      'Define the project scope'
    ),
    correct: ['b'],
    explanation: 'A check sheet is a simple structured form for collecting and tallying data (e.g., defect types by category) at the point and time of occurrence, supporting later Pareto/analysis work.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'Discrete (attribute) data is best described as:',
    options: opts4(
      'Data that can take any value within a continuous range',
      'Data that is counted in whole units or classified into categories (e.g., pass/fail, number of defects)',
      'Always normally distributed',
      'Data that requires a Gage R&R study only'
    ),
    correct: ['b'],
    explanation: 'Attribute (discrete) data is counted or categorized — counts of defects, pass/fail, yes/no. Continuous data is measured on a scale and can take any value within a range.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'In a Gage R&R, "Reproducibility" is the variation attributable to:',
    options: opts4(
      'The same operator measuring repeatedly',
      'Different operators (appraisers) measuring the same parts',
      'True part-to-part differences',
      'Calibration drift of the master standard'
    ),
    correct: ['b'],
    explanation: 'Reproducibility (appraiser variation) is the variation introduced by different operators measuring the same parts with the same gage. Repeatability is the within-operator equipment variation.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team computes the baseline process sigma to establish:',
    options: opts4(
      'The control plan reaction steps',
      'A quantified starting point against which post-improvement performance can be compared',
      'The fishbone categories',
      'The stakeholder commitment scale'
    ),
    correct: ['b'],
    explanation: 'Baseline performance (sigma level, DPMO, capability) provides the quantified "before" state so the project can later demonstrate measurable improvement against an objective benchmark.',
    references: [REF_ASQ_SIXSIGMA]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid components of a Measurement Systems Analysis.',
    options: opts4(
      'Bias (accuracy relative to a reference)',
      'Repeatability and reproducibility',
      'Linearity and stability over the operating range',
      'The project business case'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'MSA evaluates bias, repeatability, reproducibility, linearity, and stability of the measurement system. The business case is a Define-phase charter element, not part of MSA.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 2, type: QType.SINGLE,
    stem: 'The range of a data set is calculated as:',
    options: opts4(
      'The most frequently occurring value',
      'The maximum value minus the minimum value',
      'The middle value when sorted',
      'The sum divided by the count'
    ),
    correct: ['b'],
    explanation: 'Range = maximum − minimum. It is the simplest measure of dispersion. The mode is the most frequent value, the median is the middle value, and the mean is the sum divided by the count.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A normal distribution has mean 200 and standard deviation 10. Approximately what proportion of values exceeds 220?',
    options: opts4(
      'About 2.3%',
      'About 16%',
      'About 50%',
      'About 0.13%'
    ),
    correct: ['a'],
    explanation: '220 is 2σ above the mean (200 + 2×10). Roughly 95% lie within ±2σ, leaving ~2.5% in each tail; more precisely about 2.3% exceed +2σ.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why is it important to validate the measurement system BEFORE collecting large amounts of baseline data?',
    options: opts4(
      'It is only a formality with no real impact',
      'If the measurement system is unreliable, the collected data will mislead every subsequent DMAIC decision',
      'It eliminates the need for a control plan',
      'It guarantees the process is capable'
    ),
    correct: ['b'],
    explanation: 'Garbage-in, garbage-out: an unreliable measurement system produces untrustworthy data, corrupting baseline capability, root-cause analysis, and improvement validation. MSA must precede heavy data collection.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team plots time-ordered data on a run chart during Measure. Its main value is to:',
    options: opts4(
      'Prove statistical significance',
      'Reveal trends, shifts, or cycles in the process over time before formal control charting',
      'Compute the regression equation',
      'Define the project scope'
    ),
    correct: ['b'],
    explanation: 'A run chart displays data in time order and helps spot trends, shifts, and cyclical patterns early. It is a precursor to control charts, which add statistically derived control limits.',
    references: [REF_NIST_HANDBOOK, REF_ASQ_CONTROL_CHART]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A measurement system is found to be precise (low spread on repeats) but consistently reads 3 units higher than the reference standard. This indicates a problem with:',
    options: opts4(
      'Repeatability',
      'Bias (accuracy)',
      'Part-to-part variation',
      'Reproducibility'
    ),
    correct: ['b'],
    explanation: 'Consistently reading high relative to the true value is a bias (accuracy) problem, even though precision (repeatability) is good. Bias is typically corrected through calibration.',
    references: [REF_ASQ_MSA]
  },

  // ── Analyze Phase (15) ──
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In the "Y = f(X)" model used in Analyze, the X\'s represent:',
    options: opts4(
      'The project budget',
      'The process inputs/factors believed to drive the output Y',
      'The customer satisfaction score only',
      'The control limits'
    ),
    correct: ['b'],
    explanation: 'Y = f(X) expresses the output (Y) as a function of process inputs/factors (X\'s). Analyze identifies and verifies which X\'s significantly drive Y so the team can act on the vital few.',
    references: [REF_ASQ_DMAIC, REF_IASSC_GLOSSARY]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A two-sample t-test for equal means returns p = 0.42 with α = 0.05. The correct conclusion is:',
    options: opts4(
      'Reject H0; the means differ significantly',
      'Fail to reject H0; there is insufficient evidence of a difference in means',
      'The data is invalid',
      'A Type I error has certainly occurred'
    ),
    correct: ['b'],
    explanation: 'Since p (0.42) > α (0.05), we fail to reject H0. There is insufficient statistical evidence to conclude the means differ — note this is not the same as proving them equal.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Type II error occurs when a hypothesis test:',
    options: opts4(
      'Rejects a true null hypothesis',
      'Fails to reject a false null hypothesis (misses a real effect)',
      'Uses the wrong significance level',
      'Has too large a sample size'
    ),
    correct: ['b'],
    explanation: 'A Type II error (β) is failing to reject H0 when it is actually false — a missed detection of a real effect. Its complement, 1−β, is the statistical power of the test.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team builds a Pareto chart and finds defects are spread almost evenly across all 10 categories. What does this suggest?',
    options: opts4(
      'There is a clear vital few to target',
      'There is no dominant category; the team may need to stratify differently or address systemic causes',
      'The chart is invalid and must be discarded',
      'The process is already at Six Sigma'
    ),
    correct: ['b'],
    explanation: 'A flat Pareto means no obvious vital few. The team should re-stratify the data (e.g., by time, location, operator) or consider a common systemic cause rather than chasing many small categories.',
    references: [REF_ASQ_PARETO]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A regression model has a statistically significant predictor (p < 0.05) but a very low R² (0.06). The BEST interpretation is:',
    options: opts4(
      'The predictor explains almost all variation in the response',
      'The relationship is statistically detectable but explains very little of the response variation; other factors dominate',
      'The model perfectly predicts the response',
      'The predictor has no relationship with the response'
    ),
    correct: ['b'],
    explanation: 'Statistical significance means the effect is unlikely due to chance, but low R² means the predictor explains little of the total variation. Practically important drivers likely lie elsewhere; significance ≠ practical importance.',
    references: [REF_ASQ_REGRESSION]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which graphical tool is BEST for visually comparing the distribution (center and spread) of cycle time across four different shifts?',
    options: opts4(
      'A single pie chart',
      'Side-by-side box plots (one per shift)',
      'A SIPOC diagram',
      'A project Gantt chart'
    ),
    correct: ['b'],
    explanation: 'Side-by-side box plots compactly compare medians, spread, and outliers across groups, making shift-to-shift differences visually evident. Pie charts, SIPOC, and Gantt charts do not serve this purpose.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'The "vital few" versus "trivial many" concept in root-cause analysis is grounded in:',
    options: opts4(
      'The central limit theorem',
      'The Pareto principle',
      'The empirical (68-95-99.7) rule',
      'Little\'s Law'
    ),
    correct: ['b'],
    explanation: 'The Pareto principle holds that a small number of causes (the vital few) account for the majority of effects, while the trivial many contribute little — guiding prioritization in Analyze.',
    references: [REF_ASQ_PARETO]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team wants to test whether the proportion of defects differs among three suppliers using attribute data. The MOST appropriate test is:',
    options: opts4(
      'One-way ANOVA',
      'Chi-square test for association/homogeneity of proportions',
      'Paired t-test',
      'Simple linear regression'
    ),
    correct: ['b'],
    explanation: 'Comparing defect proportions (counts/categories) across multiple groups uses a chi-square test. ANOVA compares means of continuous data; t-tests compare two means; regression models continuous relationships.',
    references: [REF_ASQ_HYPOTHESIS, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL tools that help identify or verify root causes in the Analyze phase.',
    options: opts4(
      'Cause-and-effect (fishbone) diagram',
      '5 Whys',
      'Hypothesis testing on suspected X\'s',
      'Project charter sign-off'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Fishbone and 5 Whys generate candidate causes; hypothesis testing statistically verifies which suspected X\'s actually affect Y. Charter sign-off is a Define-phase governance step, not a root-cause tool.',
    references: [REF_ASQ_FISHBONE, REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A p-value in a hypothesis test represents:',
    options: opts4(
      'The probability that the null hypothesis is true',
      'The probability of observing data as extreme as (or more extreme than) the sample, assuming H0 is true',
      'The probability of a Type II error',
      'The effect size of the difference'
    ),
    correct: ['b'],
    explanation: 'The p-value is the probability of obtaining a result at least as extreme as observed, assuming H0 is true. It is not the probability that H0 is true, nor the effect size, nor β.',
    references: [REF_ASQ_HYPOTHESIS, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'During Analyze, a hypothesis test confirms that machine setting "A" yields significantly fewer defects than setting "B." The team should:',
    options: opts4(
      'Immediately conclude the project with no further work',
      'Carry this verified root-cause insight forward to develop and pilot a solution in the Improve phase',
      'Discard the result because it came from a sample',
      'Re-write the project charter\'s problem statement to remove it'
    ),
    correct: ['b'],
    explanation: 'A statistically verified relationship between an X (machine setting) and Y (defects) is a root-cause insight. It feeds the Improve phase, where a solution is developed, piloted, and implemented.',
    references: [REF_ASQ_DMAIC, REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A value stream analysis in Analyze identifies that a step adds no value and is not required by the customer or for compliance. This step is classified as:',
    options: opts4(
      'Value-added',
      'Non-value-added (waste) — a candidate for elimination',
      'A control point',
      'A specification limit'
    ),
    correct: ['b'],
    explanation: 'Steps that do not transform the product/service toward what the customer values and are not required for business/legal reasons are non-value-added waste — prime candidates for elimination in Improve.',
    references: [REF_ASQ_VSM]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A normal probability (Q-Q) plot of residuals from a regression is used to check:',
    options: opts4(
      'Whether the residuals are approximately normally distributed',
      'The project budget variance',
      'The Gage R&R percentage',
      'The number of process steps'
    ),
    correct: ['a'],
    explanation: 'A normal probability/Q-Q plot assesses the normality assumption of residuals. Points roughly on a straight line support the normality assumption underlying many parametric tests and regression inference.',
    references: [REF_NIST_HANDBOOK, REF_ASQ_REGRESSION]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'Two variables show r ≈ 0.0 on a scatter plot, yet the points clearly form a U-shaped curve. The correct conclusion is:',
    options: opts4(
      'There is definitely no relationship of any kind',
      'There is a strong non-linear relationship that the linear correlation coefficient fails to capture',
      'The data must be fabricated',
      'r ≈ 0 proves the variables are independent'
    ),
    correct: ['b'],
    explanation: 'The Pearson correlation measures only linear association. A clear U-shaped pattern indicates a strong non-linear relationship even though r ≈ 0; always visualize the data, not just the coefficient.',
    references: [REF_ASQ_REGRESSION, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'When selecting a significance level α before a hypothesis test, choosing a smaller α (e.g., 0.01 instead of 0.05):',
    options: opts4(
      'Increases the risk of a Type I error',
      'Decreases the risk of a Type I error but, all else equal, increases the risk of a Type II error',
      'Has no effect on either error type',
      'Guarantees the null hypothesis is true'
    ),
    correct: ['b'],
    explanation: 'A smaller α reduces the Type I error (false positive) probability but, holding sample size and effect size constant, makes it harder to reject H0, increasing the Type II error (false negative) risk.',
    references: [REF_ASQ_HYPOTHESIS]
  },

  // ── Improve Phase (12) ──
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which DMAIC phase is where solutions are generated, selected, piloted, and implemented?',
    options: opts4(
      'Define',
      'Improve',
      'Measure',
      'Control'
    ),
    correct: ['b'],
    explanation: 'The Improve phase is dedicated to developing potential solutions to the verified root causes, selecting the best option, piloting it, and implementing it.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A 2-level full factorial experiment with 4 factors requires how many runs for one complete replicate?',
    options: opts4(
      '8',
      '16',
      '4',
      '24'
    ),
    correct: ['b'],
    explanation: 'Runs for a 2-level full factorial = 2^k. With k = 4 factors, 2⁴ = 16 runs per replicate.',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'The three fundamental principles of designed experiments are randomization, replication, and:',
    options: opts4(
      'Blocking',
      'Calibration',
      'Stratification',
      'Standardization'
    ),
    correct: ['a'],
    explanation: 'The classical DOE principles are randomization (guards against lurking variables), replication (estimates experimental error), and blocking (removes the effect of known nuisance variables).',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team uses brainstorming followed by an affinity diagram during Improve to:',
    options: opts4(
      'Compute the process capability',
      'Generate many solution ideas and then organize them into natural groupings/themes',
      'Test a statistical hypothesis',
      'Set the control limits'
    ),
    correct: ['b'],
    explanation: 'Brainstorming generates a broad set of solution ideas; an affinity diagram organizes the ideas into logical groupings/themes, helping the team structure and evaluate candidate solutions.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A pilot of the proposed solution shows improvement, but operators report it adds significant manual effort that is unlikely to be sustained. The BEST action is to:',
    options: opts4(
      'Roll it out company-wide immediately and ignore the feedback',
      'Refine the solution (e.g., simplify or mistake-proof it) before full-scale implementation',
      'Abandon Six Sigma entirely',
      'Hide the operator feedback from the sponsor'
    ),
    correct: ['b'],
    explanation: 'Sustainability is a key criterion. If a piloted solution is effective but impractical to maintain, it should be refined or mistake-proofed so the gains can be held after rollout (Control phase).',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A FMEA assigns Severity, Occurrence, and Detection ratings. The Risk Priority Number (RPN) is calculated as:',
    options: opts4(
      'Severity + Occurrence + Detection',
      'Severity × Occurrence × Detection',
      'Severity − Detection',
      'Occurrence ÷ Detection'
    ),
    correct: ['b'],
    explanation: 'RPN = Severity × Occurrence × Detection. Higher RPNs flag failure modes needing priority mitigation. FMEA is often used in Improve to assess and reduce risk of proposed solutions.',
    references: [REF_ASQ_FMEA]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid approaches for selecting among competing solutions in Improve.',
    options: opts4(
      'A weighted criteria (solution selection) matrix',
      'Cost-benefit analysis',
      'Piloting and comparing measured results',
      'Choosing whichever the loudest team member prefers, ignoring data'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Structured selection uses weighted criteria matrices, cost-benefit analysis, and data from pilots. Deferring to the loudest voice instead of evidence undermines the data-driven nature of Lean Six Sigma.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'In a DOE, a "main effect" of a factor is:',
    options: opts4(
      'The average change in the response when the factor moves from its low to high level',
      'The interaction between two factors',
      'The residual error term',
      'The number of replicates'
    ),
    correct: ['a'],
    explanation: 'A main effect quantifies the average change in the response caused by changing a single factor from its low to high level, averaged over the levels of the other factors. Interactions are separate effects.',
    references: [REF_ASQ_DOE]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Standardizing the new method with updated work instructions during/after Improve is important because:',
    options: opts4(
      'It is optional and rarely helps',
      'Without standardization, the improvement is unlikely to be performed consistently or sustained',
      'It replaces the need for a pilot',
      'It increases process variation'
    ),
    correct: ['b'],
    explanation: 'Standardized work captures the improved method so it is performed consistently by everyone. It is foundational to sustaining gains and transitions naturally into the Control phase.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE,
    stem: 'Reducing setup/changeover time so smaller batches flow more efficiently is a Lean technique known as:',
    options: opts4(
      'SMED (Single-Minute Exchange of Dies)',
      'Gage R&R',
      'ANOVA',
      'Hypothesis testing'
    ),
    correct: ['a'],
    explanation: 'SMED systematically reduces changeover/setup time (ideally to single-digit minutes), enabling smaller batch sizes, smoother flow, and lower inventory — a common Improve-phase Lean tool.',
    references: [REF_IASSC_GLOSSARY, REF_IASSC_BOK]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Why might a team replicate runs in a designed experiment?',
    options: opts4(
      'To make the experiment more expensive for no reason',
      'To estimate experimental (pure) error and improve the precision of effect estimates',
      'To guarantee no interactions exist',
      'To avoid having to randomize'
    ),
    correct: ['b'],
    explanation: 'Replication provides an estimate of inherent experimental error and increases the precision/power for detecting real factor effects. It complements, not replaces, randomization.',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team is choosing between a low-cost solution with moderate impact and a high-cost solution with slightly higher impact. Within a properly scoped Green Belt project, the BEST general guidance is to:',
    options: opts4(
      'Always pick the most expensive solution',
      'Use cost-benefit analysis and selection criteria to choose the option with the best overall value and feasibility',
      'Pick randomly to save time',
      'Defer the decision indefinitely'
    ),
    correct: ['b'],
    explanation: 'Solution selection should be evidence-based, weighing impact, cost, risk, and feasibility (e.g., via a weighted criteria matrix and cost-benefit analysis) to maximize overall value — not defaulting to cost extremes.',
    references: [REF_IASSC_BOK]
  },

  // ── Control Phase (8) ──
  {
    domain: CONTROL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A control chart is used in the Control phase primarily to:',
    options: opts4(
      'Generate solution ideas',
      'Monitor process stability over time and detect special-cause variation so the process does not regress',
      'Define the project scope',
      'Calculate the Risk Priority Number'
    ),
    correct: ['b'],
    explanation: 'Control charts track a process statistic over time with statistically derived limits, signaling special-cause variation early so corrective action can keep the improved process stable and sustained.',
    references: [REF_ASQ_CONTROL_CHART]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'Common-cause variation is BEST described as:',
    options: opts4(
      'Variation from a specific, identifiable, assignable source',
      'The natural, inherent, random variation of a stable process',
      'Always a sign the process is out of control',
      'Variation that must be ignored entirely'
    ),
    correct: ['b'],
    explanation: 'Common-cause variation is the inherent, random "noise" of a stable, in-control process. Special (assignable) cause variation comes from a specific identifiable source and signals an out-of-control condition.',
    references: [REF_ASQ_CONTROL_CHART, REF_NIST_HANDBOOK]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'A control chart for a continuous measurement uses subgroups of size 5 sampled hourly. The MOST appropriate chart pair is:',
    options: opts4(
      'p-chart and c-chart',
      'X-bar and R (or X-bar and S) chart',
      'Pareto chart and histogram',
      'Scatter plot and box plot'
    ),
    correct: ['b'],
    explanation: 'For continuous data collected in rational subgroups, X-bar tracks the subgroup mean and R (or S) tracks within-subgroup spread. p-/c-charts are for attribute data; the others are not control charts.',
    references: [REF_ASQ_CONTROL_CHART]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'The reaction plan within a control plan specifies:',
    options: opts4(
      'How to write the project charter',
      'The predefined actions to take when a monitored characteristic goes out of control',
      'The marketing strategy for the product',
      'The DOE run order'
    ),
    correct: ['b'],
    explanation: 'A reaction (response) plan documents exactly what to do, and who is responsible, when a control signal indicates an out-of-control condition — ensuring rapid, consistent corrective action to protect the gains.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'Why should the team formally hand off the process and control plan to the process owner at the end of Control?',
    options: opts4(
      'So the Green Belt never has to document anything',
      'To establish clear ongoing ownership and accountability so improvements are monitored and sustained after the project closes',
      'To avoid measuring the process',
      'Because the charter requires deleting all data'
    ),
    correct: ['b'],
    explanation: 'A formal handoff transfers ownership and accountability to the process owner, who sustains monitoring and the reaction plan after the project team disbands — preventing the process from regressing.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'A stable, centered process improves so its Cpk rises from 0.9 to 1.5. The practical meaning is:',
    options: opts4(
      'The process became less capable',
      'The process is now substantially more capable of meeting specifications with fewer defects',
      'Cpk has no relationship to defect rate',
      'The specification limits must have widened'
    ),
    correct: ['b'],
    explanation: 'Higher Cpk indicates greater capability — the process spread fits more comfortably within the specification limits, dramatically reducing the expected defect rate. Cpk ≥ 1.33 is a common minimum target.',
    references: [REF_ASQ_PROCESS_CAPABILITY, REF_NIST_HANDBOOK]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL outputs typically delivered at the close of the Control phase.',
    options: opts4(
      'A documented control plan with monitoring and reaction steps',
      'Updated standard operating procedures and training',
      'Validated, sustained financial/operational benefits and project closure',
      'The original brainstormed list of unselected solution ideas as the deliverable'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Control delivers the control plan, updated SOPs/training, and documented sustained benefits with formal closure. A raw list of rejected ideas is not a Control deliverable.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'After implementation, the control chart of the key metric stays well within limits for 3 months, then begins a steady upward drift across many consecutive points. The team should:',
    options: opts4(
      'Ignore it because no single point exceeded a control limit',
      'Treat the trend as a special-cause signal, trigger the reaction plan, and investigate before the process degrades further',
      'Delete the control chart',
      'Widen the control limits to make the trend disappear'
    ),
    correct: ['b'],
    explanation: 'A sustained trend is a recognized out-of-control pattern even without a limit breach. The reaction plan should be triggered to investigate and correct the assignable cause before performance regresses.',
    references: [REF_ASQ_CONTROL_CHART, REF_NIST_HANDBOOK]
  }
];

// ───────────────────── Practice Exam 3 ─────────────────────
const P3: Q[] = [
  // ── Define Phase (15) ──
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What does the acronym DMAIC stand for?',
    options: opts4(
      'Define, Measure, Analyze, Improve, Control',
      'Design, Manage, Apply, Innovate, Close',
      'Define, Monitor, Adjust, Implement, Confirm',
      'Develop, Measure, Assess, Improve, Certify'
    ),
    correct: ['a'],
    explanation: 'DMAIC is the core Lean Six Sigma improvement roadmap: Define, Measure, Analyze, Improve, Control — applied sequentially to existing processes.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A project charter\'s "scope" section should clearly state:',
    options: opts4(
      'The statistical test that will be used in Analyze',
      'What is in-scope and out-of-scope (process boundaries) for the project',
      'The final solution to be implemented',
      'The control chart limits'
    ),
    correct: ['b'],
    explanation: 'The scope section defines process boundaries — what is included and explicitly excluded — to focus the team and guard against scope creep. The solution and statistical tests are determined later.',
    references: [REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In SIPOC, "Customers" refers to:',
    options: opts4(
      'Only the people who pay the invoice',
      'The recipients of the process outputs, which may be external or internal customers',
      'The suppliers of raw materials',
      'The Six Sigma team members'
    ),
    correct: ['b'],
    explanation: 'In SIPOC, Customers are whoever receives the process outputs — external paying customers or internal downstream customers (e.g., the next department). Their requirements drive the CTQs.',
    references: [REF_ASQ_SIPOC, REF_ASQ_VOC]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team translates "the report should be accurate" into "fewer than 1 data-entry error per 1,000 fields." This is an example of creating:',
    options: opts4(
      'A control limit',
      'An operationalized, measurable CTQ from a vague customer requirement',
      'A fishbone category',
      'A DOE factor'
    ),
    correct: ['b'],
    explanation: 'Turning a vague requirement ("accurate") into a specific, measurable target (error rate threshold) operationalizes the CTQ, making it usable for measurement and goal-setting.',
    references: [REF_ASQ_VOC]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.SINGLE,
    stem: 'Two candidate projects are proposed. Project A: high strategic alignment, strong data availability, achievable in 4 months. Project B: unclear sponsor, no baseline data, 18-month scope. As the deployment leader, you should generally:',
    options: opts4(
      'Select Project B because larger projects are always better',
      'Select Project A — it is better scoped, sponsored, data-ready, and achievable for a Green Belt',
      'Select both and assign them to one Green Belt simultaneously',
      'Reject both and stop all improvement work'
    ),
    correct: ['b'],
    explanation: 'Good project selection favors clear sponsorship, data availability, strategic alignment, and an achievable Green Belt scope (~3–6 months). Project A meets these criteria; Project B has major feasibility risks.',
    references: [REF_IASSC_BOK, REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'The primary reason to perform a stakeholder analysis early in Define is to:',
    options: opts4(
      'Calculate process capability',
      'Identify who is affected by/influences the project and plan communication and change management accordingly',
      'Determine the DOE design',
      'Set the control limits'
    ),
    correct: ['b'],
    explanation: 'Stakeholder analysis identifies parties who influence or are affected by the project and their attitudes, enabling targeted communication and change management to build support and reduce resistance.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A "business case" in the project charter primarily answers which question?',
    options: opts4(
      'Which control chart should we use?',
      'Why should the organization invest in this project now (impact, cost of inaction, alignment)?',
      'What is the standard deviation of the process?',
      'Which operator made the most errors?'
    ),
    correct: ['b'],
    explanation: 'The business case articulates why the project matters — the strategic/financial impact, the cost of doing nothing, and alignment with organizational priorities — to secure sponsorship and resources.',
    references: [REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which of the following is an example of "Voice of the Customer" data?',
    options: opts4(
      'The internal manufacturing cost per unit',
      'Customer survey responses about delivery satisfaction',
      'The process standard deviation',
      'The DOE run order'
    ),
    correct: ['b'],
    explanation: 'VOC is information expressing customer needs and perceptions — surveys, interviews, complaints, observed behavior. Internal cost and process statistics are not VOC (cost is more "Voice of the Business").',
    references: [REF_ASQ_VOC]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that are appropriate to define or document during the Define phase.',
    options: opts4(
      'Problem statement and goal statement',
      'Project scope and high-level process (SIPOC)',
      'Team roles and the project sponsor',
      'The verified statistical root cause and final solution'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Define documents the problem/goal, scope, SIPOC, team, and sponsor. The verified root cause is an Analyze output and the final solution an Improve output — not produced in Define.',
    references: [REF_ASQ_PROJECT_CHARTER, REF_ASQ_DMAIC]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.SINGLE,
    stem: 'A sponsor pressures the Green Belt to predetermine the conclusion ("we already know it\'s the night shift; just prove it"). The MOST appropriate response is to:',
    options: opts4(
      'Agree and selectively present only data that supports the sponsor\'s belief',
      'Explain that DMAIC requires objective, data-driven root-cause analysis and keep the problem statement solution/cause-neutral',
      'Cancel the project to avoid conflict',
      'Skip the Analyze phase to deliver faster'
    ),
    correct: ['b'],
    explanation: 'Lean Six Sigma rigor requires letting data — not preconceptions — identify the root cause. The Green Belt should keep the charter cause-neutral and educate the sponsor on objective analysis, preserving integrity.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: DEFINE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which best describes the relationship between a CTQ and a specification limit?',
    options: opts4(
      'They are unrelated concepts',
      'A CTQ is the measurable characteristic; specification limits define the acceptable range for that characteristic',
      'A specification limit is the project budget',
      'A CTQ is always equal to the process mean'
    ),
    correct: ['b'],
    explanation: 'A CTQ is the customer-critical measurable characteristic; its specification limits (USL/LSL) define the range within which performance is acceptable to the customer. The two work together to define quality.',
    references: [REF_ASQ_VOC, REF_ASQ_PROCESS_CAPABILITY]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A project charter is typically reviewed and approved by:',
    options: opts4(
      'Only the Green Belt, with no oversight',
      'The project Champion/Sponsor (and relevant stakeholders) before the team proceeds',
      'The customer\'s competitors',
      'No one; charters do not require approval'
    ),
    correct: ['b'],
    explanation: 'The charter is formally approved by the Champion/Sponsor and key stakeholders, signifying agreement on the problem, goal, scope, and resources before substantial work begins.',
    references: [REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Green Belt notices the problem statement names a presumed culprit ("the new vendor causes all defects"). The BEST revision keeps the statement:',
    options: opts4(
      'Solution- and cause-prescriptive to save analysis time',
      'Focused on the observable problem and its measurable impact, without naming an unverified cause',
      'Vague and unmeasurable to allow flexibility',
      'Blaming a specific employee by name'
    ),
    correct: ['b'],
    explanation: 'A good problem statement describes the observable gap and impact objectively and stays cause/solution-neutral. Naming an unverified culprit biases the team before Analyze confirms the root cause.',
    references: [REF_ASQ_PROJECT_CHARTER, REF_ASQ_DMAIC]
  },
  {
    domain: DEFINE, difficulty: 4, type: QType.SINGLE,
    stem: 'A Green Belt project goal states "improve the process." A reviewer rejects it. The MOST likely reason is that the goal:',
    options: opts4(
      'Is too specific and detailed',
      'Lacks a measurable target, baseline, and timeframe (not SMART)',
      'Names too many root causes',
      'Includes a control plan'
    ),
    correct: ['b'],
    explanation: '"Improve the process" is vague — no metric, baseline, target, or deadline. A reviewer would require a SMART goal, e.g., reduce X from A to B by date, to make success objectively assessable.',
    references: [REF_ASQ_PROJECT_CHARTER]
  },
  {
    domain: DEFINE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which Lean concept, often introduced conceptually in Define when framing the problem, refers to any activity that consumes resources but creates no value for the customer?',
    options: opts4(
      'Waste (muda)',
      'Standard deviation',
      'Replication',
      'Reproducibility'
    ),
    correct: ['a'],
    explanation: 'Muda (waste) is any activity consuming resources without adding customer value. Recognizing waste helps frame improvement opportunities; the classic categories include defects, overproduction, waiting, and excess motion/inventory.',
    references: [REF_IASSC_GLOSSARY, REF_ASQ_VSM]
  },

  // ── Measure Phase (15) ──
  {
    domain: MEASURE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which of the following is a measure of dispersion (spread) rather than central tendency?',
    options: opts4(
      'Mean',
      'Standard deviation',
      'Median',
      'Mode'
    ),
    correct: ['b'],
    explanation: 'Standard deviation quantifies dispersion around the mean. Mean, median, and mode are measures of central tendency (location), not spread.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A specification is USL = 50, LSL = 30. The process mean is 44 with σ = 2. What is Cpk?',
    options: opts4(
      '1.00',
      '2.33',
      '1.33',
      '0.50'
    ),
    correct: ['a'],
    explanation: 'Cpk = min[(USL−mean)/3σ, (mean−LSL)/3σ] = min[(50−44)/6, (44−30)/6] = min[1.00, 2.33] = 1.00. The process is off-center toward the USL, so the upper side limits capability.',
    references: [REF_ASQ_PROCESS_CAPABILITY, REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Pareto chart is built from data collected on a check sheet. The check sheet primarily supports the Measure phase by:',
    options: opts4(
      'Proving causation',
      'Providing a simple, structured way to tally observed occurrences as they happen',
      'Setting the control limits',
      'Defining the project sponsor'
    ),
    correct: ['b'],
    explanation: 'A check sheet structures real-time data collection (tallying defect types, locations, times), producing the organized counts that feed Pareto and other Measure/Analyze tools.',
    references: [REF_NIST_HANDBOOK, REF_ASQ_PARETO]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'The Central Limit Theorem states that, for a sufficiently large sample size, the sampling distribution of the sample mean:',
    options: opts4(
      'Is always identical to the population distribution',
      'Tends toward a normal distribution regardless of the population\'s distribution shape',
      'Has zero variance',
      'Cannot be approximated'
    ),
    correct: ['b'],
    explanation: 'The CLT says the distribution of sample means approaches normality as sample size increases, even when the underlying population is non-normal — the basis for many inferential procedures.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A process produces 12 defects in a sample of 300 units. What is the defects-per-unit (DPU)?',
    options: opts4(
      '0.04',
      '0.25',
      '4.0',
      '0.004'
    ),
    correct: ['a'],
    explanation: 'DPU = defects / units = 12 / 300 = 0.04 defects per unit. (DPMO would further divide by opportunities per unit and scale by one million.)',
    references: [REF_ASQ_SIXSIGMA]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which is an example of attribute data?',
    options: opts4(
      'The exact fill volume of a bottle in milliliters',
      'Whether each bottle passes or fails a leak test (pass/fail)',
      'The temperature of an oven in degrees',
      'The cycle time in seconds'
    ),
    correct: ['b'],
    explanation: 'Pass/fail classification is attribute (discrete) data. Fill volume, temperature, and cycle time are continuous (variable) data measured on a scale.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A Gage R&R study\'s %Study Variation is 35%. According to common guidelines, this measurement system is:',
    options: opts4(
      'Acceptable without reservation',
      'Generally unacceptable; the measurement system needs improvement',
      'Better than a 5% system',
      'Irrelevant to data quality'
    ),
    correct: ['b'],
    explanation: 'A common rule of thumb treats %GRR over 30% as unacceptable. At 35%, measurement variation is too large relative to total variation, so the system must be improved before trusting the data.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A normally distributed process has mean 75 and σ = 5. Approximately what percentage of output lies between 70 and 80?',
    options: opts4(
      'About 68%',
      'About 95%',
      'About 99.7%',
      'About 34%'
    ),
    correct: ['a'],
    explanation: '70 to 80 is the mean ±1σ (75 ± 5). By the empirical rule, approximately 68% of a normal distribution lies within ±1σ of the mean.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'The interquartile range (IQR) is computed as:',
    options: opts4(
      'Q3 − Q1 (the spread of the middle 50% of the data)',
      'Maximum − minimum',
      'The mean ± 3 standard deviations',
      'Q2 (the median)'
    ),
    correct: ['a'],
    explanation: 'IQR = Q3 − Q1, capturing the spread of the central 50% of the data. It is robust to outliers and is used in box plots to flag potential outliers (typically beyond 1.5×IQR).',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about a good data collection plan.',
    options: opts4(
      'It includes operational definitions for each metric',
      'It specifies the sampling method, size, and frequency',
      'It identifies who collects the data and how it is recorded/stratified',
      'It documents the final implemented solution'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A data collection plan specifies operational definitions, sampling method/size/frequency, responsibilities, and stratification factors. The implemented solution is an Improve-phase output, not part of the plan.',
    references: [REF_NIST_HANDBOOK, REF_IASSC_BOK]
  },
  {
    domain: MEASURE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statistic is the average of the squared deviations from the mean?',
    options: opts4(
      'The variance',
      'The median',
      'The range',
      'The mode'
    ),
    correct: ['a'],
    explanation: 'Variance is the average of squared deviations from the mean; the standard deviation is its square root. Median, range, and mode are different summary statistics.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team needs to estimate baseline performance but the measurement device has never been assessed. The correct sequence is to:',
    options: opts4(
      'Collect all baseline data first, then check the gage only if results look odd',
      'Validate the measurement system (MSA) first, then collect baseline data',
      'Skip MSA because baseline data is only approximate',
      'Implement a solution before measuring anything'
    ),
    correct: ['b'],
    explanation: 'MSA must precede baseline data collection. Trusting data from an unvalidated device risks basing the entire project on misleading numbers — measurement integrity comes before quantity.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'A frequency distribution displayed as adjacent bars showing how often values fall into ranges (bins) is a:',
    options: opts4(
      'Scatter plot',
      'Histogram',
      'Control chart',
      'Fishbone diagram'
    ),
    correct: ['b'],
    explanation: 'A histogram displays the frequency of values across bins, revealing the distribution\'s shape, center, and spread. It is a core Measure-phase descriptive tool.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: MEASURE, difficulty: 3, type: QType.SINGLE,
    stem: 'Two operators measure the same 10 parts and their averages differ noticeably and consistently. This points to a problem with measurement system:',
    options: opts4(
      'Repeatability',
      'Reproducibility',
      'Part-to-part variation',
      'The customer specification'
    ),
    correct: ['b'],
    explanation: 'Consistent differences between operators measuring the same parts indicate poor reproducibility (appraiser variation). Repeatability concerns one operator\'s repeated measures of the same part.',
    references: [REF_ASQ_MSA]
  },
  {
    domain: MEASURE, difficulty: 4, type: QType.SINGLE,
    stem: 'A process baseline shows a long-term DPMO of about 6,210, roughly corresponding (with the 1.5σ shift convention) to which sigma level?',
    options: opts4(
      'About 2 sigma',
      'About 4 sigma',
      'About 6 sigma',
      'About 1 sigma'
    ),
    correct: ['b'],
    explanation: 'Using the standard Six Sigma conversion (with the 1.5σ shift), roughly 6,210 DPMO corresponds to about a 4 sigma process level. (3.4 DPMO ≈ 6 sigma; ~66,800 DPMO ≈ 3 sigma.)',
    references: [REF_ASQ_SIXSIGMA]
  },

  // ── Analyze Phase (15) ──
  {
    domain: ANALYZE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which pair of tools is MOST associated with structured root-cause identification?',
    options: opts4(
      'Project charter and SIPOC',
      'Fishbone (Ishikawa) diagram and the 5 Whys',
      'Control plan and reaction plan',
      'Voucher PDF and email template'
    ),
    correct: ['b'],
    explanation: 'The fishbone diagram and the 5 Whys are classic Analyze-phase tools for systematically brainstorming and drilling into potential root causes of the problem.',
    references: [REF_ASQ_FISHBONE]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A paired t-test is the appropriate hypothesis test when:',
    options: opts4(
      'Comparing means of two independent, unrelated groups',
      'Comparing two measurements taken on the same subjects/items (e.g., before vs. after)',
      'Comparing proportions across categories',
      'Testing the correlation between two continuous variables'
    ),
    correct: ['b'],
    explanation: 'A paired t-test analyzes the differences between two related measurements on the same units (before/after, matched pairs), which controls for between-subject variability. Independent groups use a two-sample t-test.',
    references: [REF_ASQ_HYPOTHESIS, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'If the calculated p-value equals exactly the chosen α (e.g., both 0.05), conventional practice is to:',
    options: opts4(
      'Always accept the null hypothesis as proven true',
      'Treat the result as borderline; many practitioners reject H0 at p ≤ α, but the practical significance should be considered',
      'Discard the entire analysis',
      'Conclude a Type II error definitely occurred'
    ),
    correct: ['b'],
    explanation: 'p exactly at α is borderline. Common convention rejects H0 when p ≤ α, but a borderline result warrants caution and assessment of practical significance and power rather than mechanical decision-making.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team suspects defect rate depends on which of three raw-material lots was used. The appropriate analysis to compare mean defect counts across the three lots (continuous response) is:',
    options: opts4(
      'One-way ANOVA',
      'A single two-proportion z-test',
      'A scatter plot only',
      'A SIPOC diagram'
    ),
    correct: ['a'],
    explanation: 'One-way ANOVA compares the means of a continuous response across three or more groups (material lots) in a single test, controlling the overall error rate better than multiple pairwise t-tests.',
    references: [REF_ASQ_HYPOTHESIS, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A regression analysis produces a slope coefficient of 2.5 for "training hours" predicting "units per hour." The correct interpretation is:',
    options: opts4(
      'Units per hour is always 2.5',
      'Each additional training hour is associated with an estimated increase of 2.5 units per hour, holding other model terms constant',
      'Training hours cause exactly 2.5 defects',
      'The R² is 2.5'
    ),
    correct: ['b'],
    explanation: 'A regression slope estimates the average change in the response per one-unit change in the predictor, holding other model terms constant. It is an association estimate, not a guaranteed causal value, and is distinct from R².',
    references: [REF_ASQ_REGRESSION]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A multi-vari chart is used in Analyze primarily to:',
    options: opts4(
      'Implement the final solution',
      'Visually display and partition variation (e.g., within-part, part-to-part, time-to-time) to localize the dominant source',
      'Define the project charter',
      'Compute the Risk Priority Number'
    ),
    correct: ['b'],
    explanation: 'A multi-vari chart graphically separates families of variation (positional, cyclical, temporal) to help the team see where the largest variation lives, guiding deeper root-cause investigation.',
    references: [REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A confidence interval for a difference in means is [-0.5, 3.2] at 95% confidence. Because the interval contains 0, you would typically conclude:',
    options: opts4(
      'There is a statistically significant difference at α = 0.05',
      'There is not sufficient evidence of a significant difference at α = 0.05',
      'The means are exactly equal',
      'The sample size was definitely adequate'
    ),
    correct: ['b'],
    explanation: 'A 95% confidence interval for a mean difference that includes 0 is consistent with failing to reject H0 at α = 0.05 — there is insufficient evidence of a significant difference (not proof of exact equality).',
    references: [REF_ASQ_HYPOTHESIS, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team finds a strong correlation between ice-cream sales and drowning incidents. The MOST likely explanation is:',
    options: opts4(
      'Ice cream causes drowning',
      'A lurking/confounding variable (hot weather) drives both — correlation is not causation',
      'Drowning causes ice-cream sales',
      'The correlation must be a calculation error'
    ),
    correct: ['b'],
    explanation: 'This classic example illustrates confounding: warm weather independently increases both ice-cream sales and swimming (hence drownings). High correlation here reflects a lurking variable, not causation.',
    references: [REF_ASQ_REGRESSION]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL appropriate uses of hypothesis testing in the Analyze phase.',
    options: opts4(
      'Confirming whether a suspected X significantly affects Y',
      'Comparing performance before and after a change is observed',
      'Testing whether two process settings produce different mean outputs',
      'Writing the project business case'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Hypothesis tests verify suspected X→Y relationships, compare before/after data, and compare settings/groups. Writing the business case is a Define-phase charter activity, not a hypothesis test.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A residual plot from a regression shows a clear funnel shape (residual spread increases with the fitted value). This indicates a violation of which assumption?',
    options: opts4(
      'Constant variance of residuals (homoscedasticity)',
      'That the slope is positive',
      'That R² must be 1',
      'That the predictor is categorical'
    ),
    correct: ['a'],
    explanation: 'A funnel-shaped residual plot indicates heteroscedasticity — non-constant residual variance — violating a key linear regression assumption and potentially requiring transformation or a different model.',
    references: [REF_ASQ_REGRESSION, REF_NIST_HANDBOOK]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team rejects H0 (p = 0.001) but the estimated improvement is only 0.2 seconds on a 4-hour process. The BEST conclusion is:',
    options: opts4(
      'The result is both statistically and practically significant',
      'The result is statistically significant but likely not practically significant; pursuing it may not be worthwhile',
      'A Type I error definitely occurred',
      'The hypothesis test was set up incorrectly'
    ),
    correct: ['b'],
    explanation: 'Statistical significance with a trivial effect size means the difference is real but practically negligible. Lean Six Sigma decisions weigh practical significance and ROI, not p-values alone.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A "lurking variable" in an observational study is:',
    options: opts4(
      'A variable deliberately controlled by the experimenter',
      'An unmeasured/unaccounted variable that influences the observed relationship and can create spurious correlation',
      'The response variable itself',
      'The significance level'
    ),
    correct: ['b'],
    explanation: 'A lurking (confounding) variable is not accounted for yet affects both variables of interest, potentially producing a misleading correlation. Designed experiments help control for such variables.',
    references: [REF_ASQ_REGRESSION, REF_ASQ_DOE]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'The alternative hypothesis (Ha) in a test that "the new method changes the mean cycle time" would typically be expressed as:',
    options: opts4(
      'μ_new = μ_old',
      'μ_new ≠ μ_old (a two-sided alternative)',
      'There is no difference',
      'The sample size is large'
    ),
    correct: ['b'],
    explanation: 'A claim that the method "changes" (in either direction) the mean is a two-sided alternative, Ha: μ_new ≠ μ_old, with H0: μ_new = μ_old. A directional claim ("reduces") would be one-sided.',
    references: [REF_ASQ_HYPOTHESIS]
  },
  {
    domain: ANALYZE, difficulty: 4, type: QType.SINGLE,
    stem: 'After Analyze, the team has statistically verified two vital X\'s driving defects. The proper next step in DMAIC is to:',
    options: opts4(
      'Skip directly to Control and write the control plan',
      'Move to Improve to generate, select, and pilot solutions targeting those verified X\'s',
      'Return to Define and rewrite the business case',
      'Stop the project; analysis is the final phase'
    ),
    correct: ['b'],
    explanation: 'Verified root causes (vital X\'s) are the input to Improve, where targeted solutions are developed, evaluated, and piloted before the Control phase sustains the gains.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: ANALYZE, difficulty: 3, type: QType.SINGLE,
    stem: 'A team graphs defect rate by hour of day and sees a pronounced spike every shift changeover. This time-based pattern in Analyze MOST strongly suggests the team should:',
    options: opts4(
      'Ignore the pattern because time is never a root cause',
      'Investigate the shift-changeover process (handoff, ramp-up, staffing) as a likely source of the defects',
      'Immediately widen the specification limits',
      'Conclude the measurement system is biased'
    ),
    correct: ['b'],
    explanation: 'A repeating spike tied to changeover is a strong stratification clue pointing at the handoff/transition process. The team should drill into changeover practices as a candidate root cause rather than dismiss the time signal.',
    references: [REF_NIST_HANDBOOK, REF_ASQ_FISHBONE]
  },

  // ── Improve Phase (12) ──
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A pilot study in the Improve phase is best described as:',
    options: opts4(
      'A full enterprise-wide rollout with no monitoring',
      'A small-scale, controlled trial of the proposed solution to validate effectiveness before broad implementation',
      'A statistical hypothesis test of the baseline',
      'A method for writing the project charter'
    ),
    correct: ['b'],
    explanation: 'A pilot tests the proposed solution at limited scale under controlled conditions to confirm it improves the metric and to surface issues before committing to a full, costly rollout.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A 2^k full factorial with k = 5 factors at 2 levels requires how many runs for one replicate?',
    options: opts4(
      '10',
      '32',
      '25',
      '16'
    ),
    correct: ['b'],
    explanation: 'Runs for a 2-level full factorial = 2^k. With k = 5, 2⁵ = 32 runs for a single replicate.',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'The main advantage of a factorial Design of Experiments over the one-factor-at-a-time (OFAT) approach is that DOE:',
    options: opts4(
      'Is always cheaper regardless of factors',
      'Can estimate interaction effects and is more efficient at exploring the factor space',
      'Eliminates the need to measure the response',
      'Guarantees no experimental error'
    ),
    correct: ['b'],
    explanation: 'Factorial DOE varies factors together, enabling estimation of interactions (which OFAT misses) and using runs more efficiently to characterize the response surface.',
    references: [REF_ASQ_DOE]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Mistake-proofing a process so an incorrect part physically cannot be installed is an example of:',
    options: opts4(
      'Poka-yoke',
      'A control chart',
      'Hypothesis testing',
      'A SIPOC diagram'
    ),
    correct: ['a'],
    explanation: 'Poka-yoke (error/mistake-proofing) designs the process or fixture so the defect cannot occur (or is immediately detected), a robust and sustainable Improve-phase solution.',
    references: [REF_IASSC_GLOSSARY]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A DOE main-effects plot shows factor "temperature" steeply increasing yield while "operator" shows a nearly flat line. The reasonable conclusion is:',
    options: opts4(
      'Operator is the dominant driver of yield',
      'Temperature has a strong effect on yield while operator has little effect over the tested range',
      'Both factors are equally influential',
      'The experiment must be discarded'
    ),
    correct: ['b'],
    explanation: 'A steep main-effects line indicates a strong effect; a nearly flat line indicates little effect over the tested range. Here temperature strongly affects yield while operator does not, guiding optimization.',
    references: [REF_ASQ_DOE]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'During Improve, an FMEA on the proposed solution helps the team to:',
    options: opts4(
      'Set the customer specification limits',
      'Proactively identify potential failure modes of the new solution and prioritize mitigations before rollout',
      'Compute the process mean',
      'Write the project business case'
    ),
    correct: ['b'],
    explanation: 'Applying FMEA to a proposed solution surfaces how it could fail, with Severity/Occurrence/Detection driving an RPN to prioritize preventive actions before full implementation, reducing rollout risk.',
    references: [REF_ASQ_FMEA]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL outcomes that a successful Improve phase should produce.',
    options: opts4(
      'A selected solution that addresses the verified root causes',
      'Pilot results demonstrating the solution improves the metric',
      'An implementation plan for broader rollout',
      'The original problem statement, unchanged and unvalidated, as the only deliverable'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Improve yields a chosen, root-cause-targeted solution, pilot evidence of effectiveness, and an implementation plan. Merely restating the problem statement is not an Improve deliverable.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A team wants to economically screen 7 potential factors to find the few that matter, accepting some confounding of higher-order interactions. The MOST appropriate design is a:',
    options: opts4(
      'Full factorial with all 7 factors',
      'Fractional factorial (screening) design',
      'Single one-factor-at-a-time test',
      'No experiment; rely on opinion'
    ),
    correct: ['b'],
    explanation: 'A fractional factorial screening design efficiently identifies the vital few factors among many with far fewer runs than a full factorial, accepting aliasing of typically negligible higher-order interactions.',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'A 5S workplace organization initiative ("Sort, Set in order, Shine, Standardize, Sustain") is implemented to:',
    options: opts4(
      'Increase variation deliberately',
      'Create an organized, efficient, standardized workplace that supports flow and reduces waste',
      'Replace the need for hypothesis testing',
      'Define the project sponsor'
    ),
    correct: ['b'],
    explanation: '5S establishes an organized, clean, standardized work area, reducing wasted motion and search time and creating a stable foundation for sustained improvements and visual management.',
    references: [REF_ASQ_FIVES]
  },
  {
    domain: IMPROVE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which is a key reason to involve process operators when designing and piloting the solution?',
    options: opts4(
      'Operators must be excluded to remain objective',
      'Operators provide practical insight and their buy-in improves adoption and sustainability of the solution',
      'It is required to delay the project',
      'Operators set the control chart limits by themselves'
    ),
    correct: ['b'],
    explanation: 'Frontline operators understand practical realities and constraints; engaging them improves solution quality and builds ownership, which is critical for adoption and long-term sustainability.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: IMPROVE, difficulty: 3, type: QType.SINGLE,
    stem: 'Blocking in a designed experiment is used to:',
    options: opts4(
      'Increase unexplained noise',
      'Account for and remove the effect of a known nuisance variable so factor effects are estimated more precisely',
      'Eliminate the need for replication',
      'Guarantee a significant result'
    ),
    correct: ['b'],
    explanation: 'Blocking groups experimental units by a known nuisance source (e.g., batch, day, machine) so its variation is isolated from the factor effects, increasing the precision and sensitivity of the experiment.',
    references: [REF_ASQ_DOE, REF_NIST_HANDBOOK]
  },
  {
    domain: IMPROVE, difficulty: 4, type: QType.SINGLE,
    stem: 'A piloted solution improves the metric but the gains erode within weeks once the team\'s attention shifts. This MOST strongly indicates the team should strengthen:',
    options: opts4(
      'The Define-phase business case',
      'The Control-phase plan (standardization, monitoring, ownership) to sustain the improvement',
      'The Measure-phase Gage R&R only',
      'The number of DOE replicates'
    ),
    correct: ['b'],
    explanation: 'Erosion of gains after attention shifts is a classic sustainability failure addressed by a robust Control plan — standardized work, ongoing SPC monitoring, clear ownership, and a reaction plan.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },

  // ── Control Phase (8) ──
  {
    domain: CONTROL, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which DMAIC phase focuses on sustaining the gains and handing the improved process to the process owner?',
    options: opts4(
      'Define',
      'Control',
      'Analyze',
      'Measure'
    ),
    correct: ['b'],
    explanation: 'Control institutionalizes and monitors the improvement and formally transfers ownership to the process owner so the gains persist after the project team disbands.',
    references: [REF_ASQ_DMAIC]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'For monitoring the count of defects per inspected unit (where the area of opportunity is constant), the MOST appropriate attribute control chart is the:',
    options: opts4(
      'X-bar and R chart',
      'c-chart',
      'Scatter plot',
      'Histogram'
    ),
    correct: ['b'],
    explanation: 'A c-chart monitors the count of defects per unit/sample when the area of opportunity is constant. X-bar/R is for continuous data; scatter plots and histograms are not control charts.',
    references: [REF_ASQ_CONTROL_CHART]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'Tampering — adjusting a stable process in response to common-cause variation — typically:',
    options: opts4(
      'Reduces process variation',
      'Increases process variation and instability',
      'Has no effect on the process',
      'Is the recommended response to every data point'
    ),
    correct: ['b'],
    explanation: 'Reacting to common-cause variation as if it were special cause (tampering/over-adjustment, per Deming\'s funnel) adds variation and destabilizes a process that was already in control.',
    references: [REF_ASQ_CONTROL_CHART, REF_NIST_HANDBOOK]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'A visual management board displaying real-time process metrics on the floor primarily supports Control by:',
    options: opts4(
      'Hiding performance from the team',
      'Making process status and abnormalities immediately visible so issues are addressed quickly',
      'Replacing the need for any control chart',
      'Eliminating the process owner role'
    ),
    correct: ['b'],
    explanation: 'Visual management makes performance and deviations transparent at a glance, enabling fast response and reinforcing accountability — a practical mechanism for sustaining improvements.',
    references: [REF_IASSC_BOK]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'A process is in statistical control but its Cpk is only 0.7 against the customer specification. The correct interpretation is:',
    options: opts4(
      'A stable process is automatically a capable process',
      'The process is stable/predictable but not capable — it predictably produces an unacceptable rate of out-of-spec output',
      'Cpk is irrelevant once a process is in control',
      'The control limits must be wrong'
    ),
    correct: ['b'],
    explanation: 'Stability (in control) and capability (meeting specs) are distinct. A controlled process with Cpk = 0.7 predictably yields too many defects; it needs centering and/or variation reduction to become capable.',
    references: [REF_ASQ_PROCESS_CAPABILITY, REF_ASQ_CONTROL_CHART]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.SINGLE,
    stem: 'The main purpose of updating Standard Operating Procedures (SOPs) during Control is to:',
    options: opts4(
      'Make the process harder to follow',
      'Document the improved method so it is performed consistently and the improvement is institutionalized',
      'Remove the need for the control plan',
      'Increase process variation'
    ),
    correct: ['b'],
    explanation: 'Updated SOPs capture the new standard method, ensuring everyone performs the process consistently. Standardization is essential to institutionalizing and sustaining the improvement.',
    references: [REF_ASQ_DMAIC, REF_IASSC_BOK]
  },
  {
    domain: CONTROL, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL valid reasons to maintain ongoing process monitoring after project closure.',
    options: opts4(
      'To detect special-cause variation early and trigger the reaction plan',
      'To verify the improvement is sustained over time',
      'To provide objective evidence of continued benefit to stakeholders',
      'To intentionally stop measuring so the process can drift unnoticed'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Ongoing monitoring catches special causes early, confirms the improvement holds, and gives stakeholders evidence of sustained benefit. Deliberately ceasing measurement defeats the purpose of Control.',
    references: [REF_ASQ_CONTROL_CHART, REF_ASQ_DMAIC]
  },
  {
    domain: CONTROL, difficulty: 4, type: QType.SINGLE,
    stem: 'Six months after closure, the metric has held its improved level and the control chart shows only common-cause variation. The Green Belt should:',
    options: opts4(
      'Re-open the project and repeat DMAIC for no reason',
      'Confirm the gains are sustained, document the verified benefit, and rely on the process owner and control plan going forward',
      'Remove all monitoring immediately',
      'Conclude the improvement failed'
    ),
    correct: ['b'],
    explanation: 'A stable chart at the improved level with only common-cause variation confirms sustained success. The team documents the validated benefit and leaves the process owner and control plan to maintain it.',
    references: [REF_ASQ_DMAIC, REF_ASQ_CONTROL_CHART]
  }
];

const IASSC_GB_DOMAINS = [
  { name: DEFINE, weight: 23 },
  { name: MEASURE, weight: 23 },
  { name: ANALYZE, weight: 23 },
  { name: IMPROVE, weight: 18 },
  { name: CONTROL, weight: 13 }
];

const IASSC_GB_EXAMS: { slug: string; code: string; titleSuffix: string; descriptionSuffix: string; questions: Q[] }[] = [
  {
    slug: 'iassc-lean-six-sigma-green-belt-p1',
    code: 'ICGB-P1',
    titleSuffix: 'Practice Exam 1',
    descriptionSuffix: 'Practice exam 1 of 3 — full 180-minute, 65-question, blueprint-weighted set covering the Define, Measure, Analyze, Improve, and Control phases of DMAIC.',
    questions: P1
  },
  {
    slug: 'iassc-lean-six-sigma-green-belt-p2',
    code: 'ICGB-P2',
    titleSuffix: 'Practice Exam 2',
    descriptionSuffix: 'Practice exam 2 of 3 — a second 180-minute, 65-question, blueprint-weighted set across the five DMAIC phases.',
    questions: P2
  },
  {
    slug: 'iassc-lean-six-sigma-green-belt-p3',
    code: 'ICGB-P3',
    titleSuffix: 'Practice Exam 3',
    descriptionSuffix: 'Practice exam 3 of 3 — a third 180-minute, 65-question, blueprint-weighted set across the five DMAIC phases.',
    questions: P3
  }
];

const IASSC_GB_BUNDLE = {
  slug: 'iassc-lean-six-sigma-green-belt',
  title: 'IASSC Lean Six Sigma Green Belt',
  description: 'Unlimited IASSC Lean Six Sigma Green Belt practice exam retakes, each drawn fresh from a question pool weighted by the official exam domains — covering the Define, Measure, Analyze, Improve, and Control phases of DMAIC, aligned to the IASSC Lean Six Sigma Green Belt Body of Knowledge blueprint weights.',
  price: 2000, // USD 20 — PRACTICE tier
  priceVoucher: 29500 // USD 295 — PRACTICE + real-exam voucher tier
};

type SeedResult = {
  vendor: 'created' | 'updated';
  exams: { slug: string; questionCount: number; teaserCount: number }[];
  bundle: 'created' | 'updated';
};

/**
 * Idempotent seed for the IASSC Lean Six Sigma Green Belt bundle. Safe to
 * call repeatedly — vendor / exam / bundle rows are upserted, and questions
 * tagged `generatedBy: 'manual:iassc-gb-seed'` are deleted and re-created.
 *
 * Pass an existing PrismaClient (lifecycle managed by caller).
 */
export async function seedIasscGb(db: PrismaClient): Promise<SeedResult> {
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'iassc' } });
  await db.vendor.upsert({
    where: { slug: 'iassc' },
    update: { name: 'IASSC', description: 'International Association for Six Sigma Certification — Lean Six Sigma Yellow, Green, and Black Belt credentials covering the DMAIC methodology.' },
    create: { slug: 'iassc', name: 'IASSC', description: 'International Association for Six Sigma Certification — Lean Six Sigma Yellow, Green, and Black Belt credentials covering the DMAIC methodology.' }
  });
  const vendor = await db.vendor.findUniqueOrThrow({ where: { slug: 'iassc' } });

  const examResults: SeedResult['exams'] = [];
  const examIds: Record<string, string> = {};

  for (const e of IASSC_GB_EXAMS) {
    const title = `IASSC Lean Six Sigma Green Belt — ${e.titleSuffix}`;
    const description = `${e.descriptionSuffix} Aligned to the IASSC Lean Six Sigma Green Belt Body of Knowledge.`;
    const examData = {
      title,
      code: e.code,
      description,
      level: 'Associate',
      durationMinutes: 180,
      passingScore: 70,
      questionCount: e.questions.length,
      domains: IASSC_GB_DOMAINS,
      published: true
    };
    const exam = await db.exam.upsert({
      where: { slug: e.slug },
      update: examData,
      create: { ...examData, slug: e.slug, vendorId: vendor.id }
    });
    examIds[e.slug] = exam.id;

    await db.question.deleteMany({ where: { examId: exam.id, generatedBy: 'manual:iassc-gb-seed' } });
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
          generatedBy: 'manual:iassc-gb-seed',
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }
    examResults.push({ slug: e.slug, questionCount: e.questions.length, teaserCount });
  }

  const existingBundle = await db.bundle.findUnique({ where: { slug: IASSC_GB_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: IASSC_GB_BUNDLE.slug },
    update: {
      title: IASSC_GB_BUNDLE.title,
      description: IASSC_GB_BUNDLE.description,
      price: IASSC_GB_BUNDLE.price,
      priceVoucher: IASSC_GB_BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: IASSC_GB_BUNDLE.slug,
      title: IASSC_GB_BUNDLE.title,
      description: IASSC_GB_BUNDLE.description,
      price: IASSC_GB_BUNDLE.price,
      priceVoucher: IASSC_GB_BUNDLE.priceVoucher,
      published: true
    }
  });

  // Replace bundle items deterministically: drop existing, recreate.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  const items = [
    { examSlug: 'iassc-lean-six-sigma-green-belt-p1', tier: 'PRACTICE' as const, position: 1 },
    { examSlug: 'iassc-lean-six-sigma-green-belt-p2', tier: 'PRACTICE' as const, position: 2 },
    { examSlug: 'iassc-lean-six-sigma-green-belt-p3', tier: 'PRACTICE' as const, position: 3 },
    { examSlug: 'iassc-lean-six-sigma-green-belt-p1', tier: 'VOUCHER' as const, position: 4 }
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
