/**
 * Claude Certified Associate — Foundations (CCAO-F) bundle seed —
 * vendor, 1 practice-exam variant (P1, 60 blueprint-aligned questions),
 * and the bundle. Idempotent: replaces rows tagged
 * `generatedBy: 'manual:ccao-foundations-seed'` and upserts catalog rows.
 * P2/P3 variants come later and will mirror the CCA-F module's shape.
 *
 * Exported as `seedCcaoFoundations(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/ccao-foundations.ts`) and the
 * protected admin API (`/api/admin/seed-ccao-foundations`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the official CCAO-F Exam Guide v1.0
 * (July 2026) plus the public Anthropic documentation:
 *   - https://support.anthropic.com/en/collections/9811458-claude-projects
 *   - https://docs.claude.com/en/docs/about-claude/models/choosing-a-model
 *   - https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/
 *   - https://www.anthropic.com/legal/aup
 *
 * Aligned to the CCAO-F exam blueprint (60 questions, 120 min, 72% to pass):
 *   - Prompting and Task Execution              — 14% (8)
 *   - Output Evaluation and Validation          — 21% (13)
 *   - Product and Model Selection               — 12% (7)
 *   - Workflow Integration and Solution Design  — 16% (10)
 *   - Configuration and Knowledge Management    — 12% (7)
 *   - Governance, Risk, and Responsible Use     — 15% (9)
 *   - Troubleshooting and Optimization          — 10% (6)
 *
 * AUDIENCE NOTE — this is the deliberately NON-ENGINEERING credential. Per the
 * exam guide it targets "professionals who use Claude as a productivity tool in
 * roles such as operations, marketing, project management, education and
 * communications", and is explicitly "not intended for software developers who
 * build against APIs or design agentic systems" — that scope belongs to the
 * Architect (CCAR-F) and Developer credentials. Therefore NO question in this
 * file may reference code, API calls, SDKs, JSON, request parameters, the CLI,
 * MCP servers, or Claude Code. Items test the claude.ai product surface a
 * business user actually touches (Projects, Artifacts, chat, research mode,
 * file uploads, connectors, custom instructions) and, above all, judgment.
 *
 * No exam dumps — every question is original and references first-party
 * Anthropic documentation. See [[feedback_no_exam_dumps]] for rationale.
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

const PROMPTING = 'Prompting and Task Execution';
const OUTPUT = 'Output Evaluation and Validation';
const SELECTION = 'Product and Model Selection';
const WORKFLOW = 'Workflow Integration and Solution Design';
const CONFIG = 'Configuration and Knowledge Management';
const GOVERNANCE = 'Governance, Risk, and Responsible Use';
const TROUBLESHOOT = 'Troubleshooting and Optimization';

const CCAO_DOMAINS = [
  { name: PROMPTING, weight: 14 },
  { name: OUTPUT, weight: 21 },
  { name: SELECTION, weight: 12 },
  { name: WORKFLOW, weight: 16 },
  { name: CONFIG, weight: 12 },
  { name: GOVERNANCE, weight: 15 },
  { name: TROUBLESHOOT, weight: 10 }
];

// ───────────────────── References (all official) ─────────────────────
// Skewed to the product/business surface — this credential's audience never
// touches the API docs.
const REF_PROJECTS = { label: 'Anthropic Support — Claude Projects', url: 'https://support.anthropic.com/en/collections/9811458-claude-projects' };
const REF_PROJECTS_NEWS = { label: 'Anthropic — Introducing Projects', url: 'https://www.anthropic.com/news/projects' };
const REF_AUP = { label: 'Anthropic — Usage Policy', url: 'https://www.anthropic.com/legal/aup' };

const REF_MODEL_OVERVIEW = { label: 'Anthropic Docs — Models overview', url: 'https://docs.claude.com/en/docs/about-claude/models/overview' };
const REF_MODEL_CHOOSE = { label: 'Anthropic Docs — Choosing a model', url: 'https://docs.claude.com/en/docs/about-claude/models/choosing-a-model' };
const REF_PRICING = { label: 'Anthropic Docs — Pricing', url: 'https://docs.claude.com/en/docs/about-claude/pricing' };
const REF_CONTEXT_WIN = { label: 'Anthropic Docs — Context windows', url: 'https://docs.claude.com/en/docs/build-with-claude/context-windows' };

const REF_HALLUCINATION = { label: 'Anthropic Docs — Reduce hallucinations', url: 'https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations' };
const REF_DEFINE_SUCCESS = { label: 'Anthropic Docs — Define your success criteria', url: 'https://docs.claude.com/en/docs/test-and-evaluate/define-success' };
const REF_DEVELOP_TESTS = { label: 'Anthropic Docs — Develop test cases', url: 'https://docs.claude.com/en/docs/test-and-evaluate/develop-tests' };
const REF_LATENCY = { label: 'Anthropic Docs — Reduce latency', url: 'https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-latency' };
const REF_CITATIONS = { label: 'Anthropic Docs — Citations', url: 'https://docs.claude.com/en/docs/build-with-claude/citations' };
const REF_FILES = { label: 'Anthropic Docs — Working with files', url: 'https://docs.claude.com/en/docs/build-with-claude/files' };

const REF_PROMPT_OVERVIEW = { label: 'Anthropic Docs — Prompt engineering overview', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview' };
const REF_PROMPT_CLEAR = { label: 'Anthropic Docs — Be clear and direct', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct' };
const REF_PROMPT_MULTISHOT = { label: 'Anthropic Docs — Multishot prompting', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting' };
const REF_PROMPT_COT = { label: 'Anthropic Docs — Let Claude think (chain of thought)', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/chain-of-thought' };
const REF_PROMPT_XML = { label: 'Anthropic Docs — Use XML tags', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags' };
const REF_PROMPT_SYSTEM = { label: 'Anthropic Docs — Giving Claude a role', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/system-prompts' };
const REF_PROMPT_CHAIN = { label: 'Anthropic Docs — Chain complex prompts', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/chain-prompts' };
const REF_PROMPT_LONG = { label: 'Anthropic Docs — Long context tips', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/long-context-tips' };

const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const optsTF = (): Opt[] => [
  { id: 't', text: 'True' }, { id: 'f', text: 'False' }
];

// ───────────────────── 60 questions ─────────────────────
const QUESTIONS: Q[] = [
  // ──────────────── Prompting and Task Execution (8) ────────────────
  {
    domain: PROMPTING, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You ask Claude to "write something about our new onboarding process" and get a generic, unusable draft. Which change to the request will most improve the next attempt?',
    options: opts4(
      'Send the same request again with "please try harder and make it excellent" appended, so Claude puts more effort into the second attempt',
      'Name the audience, purpose, format and length — "a 300-word friendly email to new hires covering the three onboarding steps"',
      'Send the identical request twice and ask Claude to merge the two drafts into a single stronger version',
      'Switch to the most capable model tier and send the identical request, since the vagueness is a capability limit'
    ),
    correct: ['b'],
    explanation: 'Anthropic\'s first prompting principle is to be clear and direct: tell Claude who the output is for, what it is for, what format it should take, and how long it should be. A vague request produces a vague draft because Claude has to guess all four. Re-sending with effort language, merging two equally vague drafts, or escalating to a more capable tier all leave the missing information missing — no tier can infer an audience the prompt never named.',
    references: [REF_PROMPT_CLEAR, REF_PROMPT_OVERVIEW]
  },
  {
    domain: PROMPTING, difficulty: 3, type: QType.SINGLE,
    stem: 'You need Claude to produce a competitor analysis that involves gathering facts on five competitors, comparing them on four criteria, and then recommending a positioning strategy. Asking for all of it in one prompt produces shallow work. What is the better approach?',
    options: opts4(
      'Re-send the same all-in-one request several times and keep whichever answer happens to come back deepest',
      'Ask for the positioning recommendation up front and then have Claude backfill the competitor profiles and criteria comparison that support it',
      'Put the five competitor names into Project knowledge, then send the same single overloaded prompt',
      'Split it into stages: profile each competitor, build the comparison from those profiles, then draft the recommendation from the comparison'
    ),
    correct: ['d'],
    explanation: 'Task decomposition — chaining a complex request into ordered subtasks where each step\'s output feeds the next — reliably beats one overloaded prompt, because Claude gives each subtask its full attention and you can check the work at each stage. Asking for the recommendation first inverts the dependency — the conclusion is supposed to fall out of the analysis, so demanding it up front invites unsupported claims.',
    references: [REF_PROMPT_CHAIN, REF_PROMPT_OVERVIEW]
  },
  {
    domain: PROMPTING, difficulty: 3, type: QType.SINGLE,
    stem: 'Your team needs 40 customer case studies written in an identical house structure. Claude gets the content right but varies the structure every time. Which technique addresses this most directly?',
    options: opts4(
      'Include two or three finished case studies in the house format as examples, then ask for the next one',
      'Tell Claude to keep the structure consistent across all 40 and to match the structure it used previously',
      'Write each case study in its own fresh conversation so earlier drafts cannot influence the structure',
      'Ask for a longer output each time so every section has room, and let the structure follow from the length'
    ),
    correct: ['a'],
    explanation: 'This is what multishot (few-shot) prompting is for: showing Claude two or three worked examples of exactly the output you want teaches the format far more precisely than describing it. Asking it to match what it produced previously points at a moving target — the structure that keeps varying is the very thing you are trying to pin down; a fresh conversation per case study removes even the previous draft as an anchor; and output length does not define structure.',
    references: [REF_PROMPT_MULTISHOT, REF_PROMPT_OVERVIEW]
  },
  {
    domain: PROMPTING, difficulty: 3, type: QType.MULTI,
    stem: 'You are rewriting a weak prompt for a quarterly business review summary. Select ALL changes that are likely to improve the output.',
    options: opts4(
      'Name the audience and the decision the summary is meant to support',
      'Specify the output format and the length you need explicitly',
      'Label the source material separately from your instructions so Claude can tell data from task',
      'Append "this is extremely important, do not make any mistakes" to the end of the prompt'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Naming the audience and purpose, specifying format and length, and clearly delimiting source material from instructions are all documented prompt-engineering improvements — each removes a guess Claude would otherwise have to make. Urgency phrasing on its own adds no information and does not change what Claude knows about the task.',
    references: [REF_PROMPT_CLEAR, REF_PROMPT_XML]
  },
  {
    domain: PROMPTING, difficulty: 4, type: QType.SINGLE,
    stem: 'An operations lead uses the same tightly-specified prompt template for every task. It works well for drafting standard emails but produces narrow, repetitive results when the team wants fresh campaign ideas. What does this indicate?',
    options: opts4(
      'Prompting should suit the task: drafting rewards tight constraints, brainstorming rewards a looser, more open prompt',
      'The template has degraded through overuse and should be rebuilt from scratch before every new task',
      'Brainstorming needs the most capable model tier, so the template is fine and the model choice is the limiting factor here',
      'The team should run the same template many more times and pick the best of the resulting ideas'
    ),
    correct: ['a'],
    explanation: 'Different task types call for different prompting strategies. Drafting and formatting tasks reward tight constraints; brainstorming rewards deliberately opening the space — asking for a set of deliberately different directions, including unconventional ones. Reusing a constraint-heavy template for ideation suppresses exactly the variety you want, but the template is still right for its original job — it has not degraded, and no model tier will produce variety a constraint-heavy prompt forbids.',
    references: [REF_PROMPT_OVERVIEW, REF_PROMPT_CLEAR]
  },
  {
    domain: PROMPTING, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Claude\'s draft of a stakeholder update is about 80% right — the structure works but the tone is too formal and one section is too long. What is the most efficient next step?',
    options: opts4(
      'Start a fresh conversation and rewrite the original prompt from scratch, this time specifying the tone and the section length',
      'Accept the draft and rewrite the tone and the over-long section by hand rather than iterating',
      'Continue the conversation with specific feedback: make the tone conversational, cut the second section to one paragraph',
      'Ask Claude to score the draft out of ten and regenerate it until the score it reports is above eight'
    ),
    correct: ['c'],
    explanation: 'Iteration is the core skill: when a draft is close, give specific, targeted feedback in the same conversation so Claude keeps what worked and changes only what did not. Starting over discards the 80% that was already right, and asking Claude to score its own draft does not tell it what you actually want changed.',
    references: [REF_PROMPT_OVERVIEW, REF_PROMPT_CLEAR]
  },
  {
    domain: PROMPTING, difficulty: 3, type: QType.SINGLE,
    stem: 'You ask Claude to pick the best of three vendor proposals against five weighted criteria. It names a winner immediately with a thin justification. Which prompt change most improves the quality of the reasoning?',
    options: opts4(
      'Ask Claude to work through each vendor against each criterion before naming a recommendation',
      'Ask for the verdict in a single sentence, so the reasoning is forced to be precise rather than rambling',
      'Ask the same question in three separate conversations and go with whichever vendor wins two out of three',
      'Tell Claude a large budget rides on the answer so it treats the comparison as high-stakes'
    ),
    correct: ['a'],
    explanation: 'Asking Claude to reason through the analysis before committing to a conclusion — chain-of-thought prompting — measurably improves performance on multi-step comparison tasks, and it also makes the reasoning auditable so you can spot where you disagree. Forcing a one-sentence verdict removes the reasoning entirely, which is the opposite of what this task needs; a majority vote across three thin answers just counts guesses; and telling Claude the stakes are high adds no information about the vendors.',
    references: [REF_PROMPT_COT, REF_PROMPT_OVERVIEW]
  },
  {
    domain: PROMPTING, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: A longer prompt is reliably a better prompt — adding more words and more background will consistently improve the quality of Claude\'s output.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. What improves output is relevant specificity — audience, purpose, format, constraints, and pertinent source material — not volume. Padding a prompt with background that has no bearing on the task adds noise and can bury the actual instruction, which is why the guidance is to be clear and direct rather than simply lengthy.',
    references: [REF_PROMPT_CLEAR, REF_PROMPT_OVERVIEW]
  },

  // ──────────────── Output Evaluation and Validation (13) ────────────────
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You ask Claude to summarise a new industry regulation. The summary is confident, well written, and cites a specific subsection number. Before forwarding it to your compliance team, what should you do first?',
    options: opts4(
      'Send it as written — the summary is detailed, internally consistent, and cites a specific subsection',
      'Ask Claude to rate its own confidence in the summary and send it if it reports high confidence',
      'Check the cited subsection against the official published text of the regulation',
      'Reformat it into the compliance team\'s template and add a note that it was AI-drafted'
    ),
    correct: ['c'],
    explanation: 'Specific-looking details such as citation and subsection numbers are exactly the kind of thing a language model can fabricate, and fluent confident prose is not evidence of accuracy. Verifying the citation against the authoritative source is the required diligence step. Self-reported confidence is generated text, not a reliable accuracy signal, and reformatting — even with an AI-drafted disclosure attached — does not touch correctness.',
    references: [REF_HALLUCINATION, REF_CITATIONS]
  },
  {
    domain: OUTPUT, difficulty: 3, type: QType.SINGLE,
    stem: 'You are drafting a quarterly report in a Claude Project and the output cites a market-growth statistic you cannot find in any of the uploaded source documents. What should you do first?',
    options: opts4(
      'Ask Claude which uploaded document the statistic came from, and verify it against that source',
      'Delete the sentence and carry on, since an unsourced figure is not worth the time to chase down',
      'Leave it in — the Project knowledge grounds everything Claude writes, so the figure must have come from an upload',
      'Regenerate the report and keep the statistic if it appears again, since a repeated figure is a confirmed one'
    ),
    correct: ['a'],
    explanation: 'A claim you cannot trace to a source is unverified, not verified-by-default. Asking Claude to point to the supporting document either surfaces the source (which you then check) or exposes that no source exists — a hallucination you have now caught. Assuming Project knowledge grounds every claim is the tempting error: Claude can still draw on general knowledge or fabricate specifics. Regeneration is no better a test — the same model on the same material can repeat the same fabrication, so a figure reappearing confirms nothing. Deleting the sentence unexamined hides the signal that other claims may be affected too.',
    references: [REF_HALLUCINATION, REF_PROJECTS]
  },
  {
    domain: OUTPUT, difficulty: 3, type: QType.MULTI,
    stem: 'You are reviewing a Claude-drafted research brief for possible hallucinations. Select ALL characteristics that should raise your suspicion and prompt verification.',
    options: opts4(
      'A precise-looking statistic presented with no source named anywhere in the brief',
      'A citation to a report, author, or page number that you cannot locate anywhere',
      'A claim about a very recent event that post-dates the model\'s knowledge and was not in your uploads',
      'A confident, fluent, well-organised writing style running through the whole brief'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Unsourced precise figures, uncheckable citations, and claims about events after the model\'s knowledge cutoff that you did not supply are all classic hallucination signals worth verifying. Fluency and confidence are not signals at all — every Claude output is fluent and confident, including the wrong ones, which is precisely why style cannot be used as a proxy for accuracy.',
    references: [REF_HALLUCINATION, REF_CITATIONS]
  },
  {
    domain: OUTPUT, difficulty: 4, type: QType.SINGLE,
    stem: 'A colleague argues that a validation step is unnecessary because they always ask Claude "Are you sure this is accurate?" and it confirms. What is the best assessment of this practice?',
    options: opts4(
      'It is sufficient — a model can inspect its own claims and tell you whether they are true',
      'It is sufficient for internal documents, where the consequence of an error is contained',
      'It is sufficient provided you ask in a separate conversation, so the earlier answer cannot influence it',
      'It is not verification — self-assessment is generated text, not a check against a source of truth'
    ),
    correct: ['d'],
    explanation: 'Asking a model to grade its own output produces more generated text, not an independent verification — it can restate a fabrication with the same confidence it used the first time. Real validation compares the claim against an authoritative external source. Asking in a fresh conversation removes the conversational anchor but still leaves you with self-assessment rather than evidence.',
    references: [REF_HALLUCINATION, REF_DEFINE_SUCCESS]
  },
  {
    domain: OUTPUT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL of these Claude-assisted tasks that require human review by an accountable person before the output is acted on.',
    options: opts4(
      'Summarising a contract\'s termination clauses for a decision on whether to renew',
      'Brainstorming a list of candidate names for a new internal team chat channel',
      'Drafting a customer-facing statement describing what your product can do',
      'Producing the figures for a board pack from uploaded financial statements'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'The need for human review scales with the consequence of an error and the specificity of the factual claims. A contract summary driving a renewal decision, a customer-facing capability claim, and board-pack figures are all consequential and full of precise claims an accountable person must confirm. Brainstorming internal channel names is the outlier — it is low-stakes and self-evidently checkable by whoever uses it.',
    references: [REF_HALLUCINATION, REF_DEFINE_SUCCESS]
  },
  {
    domain: OUTPUT, difficulty: 3, type: QType.SINGLE,
    stem: 'You have a well-researched technical summary written for your engineering team, and you now need a version for the executive committee. What is the most effective way to use Claude here?',
    options: opts4(
      'Forward the engineering version to the executive committee with a covering note explaining that it is written for engineers',
      'Ask Claude to cut the document to half its length, which is what an executive version means',
      'Ask Claude to recast it for executives — decision and impact first — then check nothing material was dropped',
      'Ask Claude to research the topic again from scratch, this time writing for an executive audience'
    ),
    correct: ['c'],
    explanation: 'Adapting an existing validated output for a different audience means restructuring around what that audience needs to decide, not just cutting length — and you still review the adaptation to confirm nothing material was lost or distorted. Blind 50% compression optimises for a word count rather than the audience, and re-researching discards work you have already verified.',
    references: [REF_PROMPT_SYSTEM, REF_PROMPT_CLEAR]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You have asked Claude to produce a project charter that you will edit over several rounds and eventually export into your team wiki. Which output format best suits this?',
    options: opts4(
      'An artifact — the document gets its own pane you can iterate on and copy out',
      'Inline chat text, so each revision appears as a fresh copy further down the conversation',
      'A series of short chat messages, one per section, so each section can be revised on its own',
      'A single unformatted block that you restructure yourself before it goes into the wiki'
    ),
    correct: ['a'],
    explanation: 'Artifacts exist for exactly this case: substantial, standalone content you intend to keep, iterate on, and take elsewhere. It lives in its own pane rather than scrolling away in the conversation, and successive edits update it in place. Inline text is fine for short conversational answers but becomes unmanageable for a document you will revise repeatedly.',
    references: [REF_PROJECTS, REF_PROJECTS_NEWS]
  },
  {
    domain: OUTPUT, difficulty: 4, type: QType.SINGLE,
    stem: 'An HR partner asks Claude to summarise the strengths of a shortlist of applicants from their written applications. The summaries consistently describe candidates from one university in warmer terms than equally qualified candidates from elsewhere. What is the appropriate response?',
    options: opts4(
      'Treat it as possible bias, stop using the summaries to rank, and have a human judge job-relevant criteria',
      'Accept the pattern — Claude is probably picking up a genuine quality signal carried in the applications themselves',
      'Ask Claude to check its summaries for bias and continue using them once it confirms there is none',
      'Widen the shortlist so the warmer descriptions are diluted across a larger pool of candidates'
    ),
    correct: ['a'],
    explanation: 'A systematic difference in tone that tracks an attribute unrelated to job performance is a bias signal, and the consequence — who gets hired — is high. The correct move is to stop using the output as a ranking input and return to human evaluation against defined job-relevant criteria. Rationalising the pattern as a real signal, or asking the model to self-certify, both fail; adding volume propagates the bias rather than diluting it.',
    references: [REF_AUP, REF_HALLUCINATION]
  },
  {
    domain: OUTPUT, difficulty: 3, type: QType.MULTI,
    stem: 'You have a Claude-drafted summary of a 60-page vendor agreement. Select TWO validation techniques that genuinely increase your confidence in its accuracy.',
    options: opts4(
      'Spot-check specific claims — dates, amounts, named clauses — against the agreement',
      'Have Claude name the section supporting each key claim, then read those sections yourself',
      'Ask Claude to rewrite the summary in a more authoritative, confident tone before circulating it',
      'Regenerate the summary and treat agreement between the two versions as proof of correctness'
    ),
    correct: ['a', 'b'],
    explanation: 'Both spot-checking specific claims against the source and requiring per-claim source attribution that you then verify anchor the summary to the actual document. Rewriting for tone changes presentation only. Regeneration is the subtle trap: two outputs from the same model on the same source can repeat the same error, so agreement between them is not independent evidence.',
    references: [REF_HALLUCINATION, REF_CITATIONS]
  },
  {
    domain: OUTPUT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want to make it easier to validate Claude\'s summaries of documents you upload. Which instruction most improves your ability to check the work?',
    options: opts4(
      'Ask Claude to be accurate, to double-check every claim, and never to state anything it is unsure of',
      'Ask Claude to include far more detail, so there is more for you to cross-check against',
      'Ask Claude to write in short, plain sentences so that any errors are easier to spot on a read-through',
      'Ask Claude to name the document and section behind each claim, and to say when the sources do not cover something'
    ),
    correct: ['d'],
    explanation: 'Requiring per-claim attribution and an explicit "the sources do not cover this" escape hatch is a documented technique for reducing hallucinations and, just as importantly, it makes every claim cheap for you to check. A general instruction not to make things up gives you no verification handle, and sentence length and detail volume are unrelated to accuracy.',
    references: [REF_HALLUCINATION, REF_CITATIONS]
  },
  {
    domain: OUTPUT, difficulty: 3, type: QType.SINGLE,
    stem: 'A campaign brief you gave Claude required five deliverables. The returned plan is polished and covers four of them well; the fifth is missing entirely. What does this illustrate about evaluating output?',
    options: opts4(
      'Quality must be judged on completeness against the brief, not only on how the delivered parts read',
      'A five-deliverable brief overloads one request; briefs like this should be capped at three deliverables',
      'The plan is acceptable — four strong deliverables outweigh one that Claude judged unnecessary',
      'A missing deliverable means the request exceeded what Claude is capable of producing'
    ),
    correct: ['a'],
    explanation: 'Evaluation has two axes — accuracy and completeness — and a fluent partial answer fails the second one. The discipline is to check the output back against the original requirements item by item, then ask for the gap to be filled. Judging only the delivered portion is how omissions ship, and a five-item brief is not inherently beyond Claude.',
    references: [REF_DEFINE_SUCCESS, REF_DEVELOP_TESTS]
  },
  {
    domain: OUTPUT, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: If Claude introduces a claim with "according to the uploaded file", that phrasing confirms the claim genuinely appears in the file you uploaded.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. Attribution phrasing is generated text like any other part of the response — the model can produce a source-flavoured preamble in front of a claim the document does not actually make. The phrase tells you where Claude asserts the claim came from, which is a starting point for verification, not the verification itself.',
    references: [REF_HALLUCINATION, REF_CITATIONS]
  },
  {
    domain: OUTPUT, difficulty: 4, type: QType.SINGLE,
    stem: 'A Claude-generated financial summary states in the opening that revenue grew 12%, and in a later section that it grew 1.2%. What is the correct interpretation?',
    options: opts4(
      'The later figure supersedes the earlier one, because it comes after more of the analysis has been done',
      'It is a decimal-formatting slip; correct it by keeping the rounder of the two figures',
      'Neither figure can be trusted — both must be checked against the source data before either is used',
      'The two figures probably describe different periods, so both can stand exactly as written'
    ),
    correct: ['c'],
    explanation: 'An internal contradiction proves at least one figure is wrong and tells you nothing about which — so neither can be trusted until both are checked against the underlying data. Position in the document confers no authority, and choosing the rounder or more plausible number is guessing dressed up as editing. If the figures really do cover different periods, the source data will show it and the summary needs to say so explicitly.',
    references: [REF_HALLUCINATION, REF_DEFINE_SUCCESS]
  },

  // ──────────────── Product and Model Selection (7) ────────────────
  {
    domain: SELECTION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A support team needs to generate a high volume of short, straightforward reply drafts where speed and cost matter far more than deep reasoning. Which choice best fits the task?',
    options: opts4(
      'Use the most capable, highest-cost model for every reply, so quality is never in question',
      'Alternate between the tiers at random so the average cost per reply lands in the middle',
      'Draft every reply on the most capable tier, then have the cheapest tier shorten it',
      'Use the fastest, lowest-cost tier, which is built for straightforward high-volume work'
    ),
    correct: ['d'],
    explanation: 'Matching the model to the task is the core selection skill: high-volume, low-complexity work is exactly what the fastest and cheapest tier of the Claude family exists for, with the most capable model reserved for genuinely hard reasoning. Using the top model everywhere burns cost and latency for no quality gain on simple drafts — and routing every reply through the top tier first, or picking a tier at random, keeps that cost while adding steps.',
    references: [REF_MODEL_CHOOSE, REF_MODEL_OVERVIEW]
  },
  {
    domain: SELECTION, difficulty: 3, type: QType.SINGLE,
    stem: 'Your team must analyse a complex regulatory change, reason through its implications across four business units, and produce a defensible recommendation. Speed is not a constraint. Which selection reasoning is soundest?',
    options: opts4(
      'Choose the most capable tier — the task is reasoning-heavy, high-stakes and rare, so its cost is justified',
      'Choose the fastest tier, since the Claude models differ in speed and price but not in their reasoning ability',
      'Choose the mid-tier model, which is always the safest default regardless of how hard the task is',
      'Choose whichever model Anthropic released most recently, since newer always means a better fit'
    ),
    correct: ['a'],
    explanation: 'Selection is a cost/speed/quality trade-off, and here quality dominates: the task is complex, consequential, and rare, so the most capable model\'s higher per-use cost is trivially worth it. The Claude models differ meaningfully in reasoning capability, so the claim that they all reason equally well is false, and "newest" is not a selection criterion — fit to the task is.',
    references: [REF_MODEL_CHOOSE, REF_PRICING]
  },
  {
    domain: SELECTION, difficulty: 3, type: QType.SINGLE,
    stem: 'You support a recurring monthly reporting process that always draws on the same style guide, data definitions, and report template. You currently re-paste all three into a new chat every month. What is the better fit?',
    options: opts4(
      'Keep re-pasting each month, since it is the only way to guarantee the material is actually present',
      'Email the three documents to yourself each month so they are easy to find and paste in',
      'Keep one very long chat running all year, scrolling back to the original material as needed',
      'Set up a Project holding the guide, definitions and template, with instructions for how the report is written'
    ),
    correct: ['d'],
    explanation: 'Projects exist to hold the durable context of an ongoing body of work — knowledge sources plus instructions — so every conversation in the Project starts with them already available. Re-pasting is manual, error-prone, and drifts as the material changes. One endless chat accumulates irrelevant history and makes the reference material harder, not easier, for Claude to use.',
    references: [REF_PROJECTS, REF_PROJECTS_NEWS]
  },
  {
    domain: SELECTION, difficulty: 3, type: QType.SINGLE,
    stem: 'A market analyst needs a briefing that pulls together current information from many sources, with the underlying sources visible so each claim can be traced. Which Claude capability is the best fit?',
    options: opts4(
      'A single chat message asking Claude for everything it knows about the market from memory',
      'An artifact holding the analyst\'s own notes, which Claude can then expand into a briefing',
      'Research mode, which works through multiple sources and reports the sources it drew on',
      'A Project whose only knowledge source is one competitor\'s website, kept up to date weekly'
    ),
    correct: ['c'],
    explanation: 'Research mode is built for multi-source investigation and surfaces the sources behind its findings, which is what makes the claims traceable. A plain chat answer relies on the model\'s general knowledge with nothing to trace; an artifact is an output container, not a research capability; and a Project scoped to one competitor cannot cover the market.',
    references: [REF_PROJECTS_NEWS, REF_CITATIONS]
  },
  {
    domain: SELECTION, difficulty: 4, type: QType.SINGLE,
    stem: 'A conversation about a workshop plan has run for hours across many tangents. Claude has begun losing track of decisions made early on. What is the most appropriate action?',
    options: opts4(
      'Keep the thread going and re-state the earlier decisions by hand whenever they come up',
      'Ask Claude to forget the tangents and keep only the decisions in mind, then carry on in the same thread',
      'Switch to a lower-cost tier, which uses the context window more sparingly and therefore loses less',
      'Have Claude summarise the decisions and state, then start a fresh conversation seeded with that summary'
    ),
    correct: ['d'],
    explanation: 'Every conversation has a finite context window, and a long meandering thread fills it with tangents that crowd out what matters. Summarising the durable decisions and restarting with that summary is the standard remedy — it carries forward the signal and drops the noise. Repeating decisions manually treats the symptom; instructing Claude to forget the tangents does not remove them from the thread; and model choice does not change the fact that the context is full of tangents.',
    references: [REF_CONTEXT_WIN, REF_PROMPT_LONG]
  },
  {
    domain: SELECTION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that are TRUE about choosing between the Claude model tiers (Haiku, Sonnet, Opus) for business tasks.',
    options: opts4(
      'The tiers trade cost, speed, and reasoning capability off against one another',
      'The fastest, lowest-cost tier suits simple, high-volume work such as short classifications or routine drafts',
      'The most capable tier is worth its cost on complex reasoning and high-stakes analysis',
      'The most capable tier should be used for every task, since output quality always outweighs cost and speed'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'The tiers exist precisely to give you a cost/speed/quality dial: the lightest tier suits simple high-volume work, and the most capable tier earns its cost on hard reasoning. Defaulting to the top model everywhere is the error the blueprint tests — it ignores the trade-off and wastes budget and latency on work a cheaper tier handles just as well.',
    references: [REF_MODEL_CHOOSE, REF_MODEL_OVERVIEW]
  },
  {
    domain: SELECTION, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best describes what an artifact is in the Claude product?',
    options: opts4(
      'A saved copy of an entire conversation, exported so that it can be retained for compliance review',
      'A setting that controls which colleagues can open a Project and see its knowledge',
      'A dedicated pane holding standalone content — a document, table or draft — you can iterate on',
      'A connector that links Claude to an external data source such as a Drive folder'
    ),
    correct: ['c'],
    explanation: 'An artifact is a container for substantial standalone content that you intend to keep and refine: it appears in its own pane beside the conversation and updates in place as you iterate. Conversation exports, sharing permissions, and connectors are all separate concepts — a connector, for instance, brings data in rather than presenting output.',
    references: [REF_PROJECTS_NEWS, REF_PROJECTS]
  },

  // ──────────────── Workflow Integration and Solution Design (10) ────────────────
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'An operations manager wants a first candidate for a Claude-supported workflow. Which task profile is the strongest starting point?',
    options: opts4(
      'A frequent text-heavy task with a clear input and reviewable output, like summarising weekly field reports',
      'A once-a-year task that takes an afternoon and has never caused the team any trouble',
      'A task where an undetected error would trigger immediate regulatory penalties, so the time savings matter most',
      'A task whose rules nobody on the team can articulate, so Claude can work them out from examples'
    ),
    correct: ['a'],
    explanation: 'Good first candidates are high-frequency (so the saving compounds), text-heavy (Claude\'s strength), and reviewable (so mistakes are caught cheaply while you build trust). A once-yearly task offers almost no return; an unforgiving high-penalty task is a poor place to learn; and a task nobody can describe cannot be specified well enough to delegate.',
    references: [REF_DEFINE_SUCCESS, REF_PROJECTS]
  },
  {
    domain: WORKFLOW, difficulty: 4, type: QType.SINGLE,
    stem: 'You have designed a Claude-assisted workflow for drafting client status reports and your director wants it rolled out to all 200 account managers next week. What should you advise?',
    options: opts4(
      'Roll out to all 200 account managers next week — the sooner it is adopted, the sooner the value lands',
      'Pilot with a small group, define what a good report looks like, measure against it, and refine first',
      'Roll out to all 200 but make it optional, so the account managers it fails simply stop using it',
      'Delay the rollout until the workflow can be guaranteed to produce error-free reports every time'
    ),
    correct: ['b'],
    explanation: 'A pilot with explicit success criteria surfaces failure modes while the blast radius is small and produces the evidence a broad rollout needs. Shipping to 200 people first turns every unknown into an incident. Making it optional does not fix a flawed design, it just hides the failures; and waiting for a guarantee of zero errors means never shipping.',
    references: [REF_DEFINE_SUCCESS, REF_DEVELOP_TESTS]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.MULTI,
    stem: 'You are using Claude to help analyse requirements for a process redesign. Select ALL uses that fit an Associate-level scope.',
    options: opts4(
      'Turning stakeholder interview notes into a structured list of requirements with open questions flagged',
      'Identifying gaps, ambiguities, and contradictions across requirements gathered from different stakeholders',
      'Drafting user scenarios that describe how the redesigned process would work day to day',
      'Designing and building the enterprise integration architecture that will implement the redesign'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Structuring interview notes, surfacing gaps and contradictions, and drafting scenarios are all squarely within the Associate scope of translating business objectives into effective Claude interactions. Designing enterprise integration architecture is explicitly outside it — the exam guide places that with the Architect and Developer credentials, and recognising the boundary is itself a tested skill.',
    references: [REF_DEFINE_SUCCESS, REF_PROMPT_CHAIN]
  },
  {
    domain: WORKFLOW, difficulty: 4, type: QType.SINGLE,
    stem: 'A senior stakeholder tells the steering committee that Claude will "eliminate the need for review on all customer communications". As the Associate who introduced the workflow, what is the right response?',
    options: opts4(
      'Agree in the meeting — correcting a sponsor in public would undermine adoption of the workflow',
      'Say nothing in the meeting and raise the review requirement privately once the programme has been approved',
      'Correct it with specifics: the review step the design depends on, and what the workflow genuinely saves',
      'Agree publicly, then quietly keep the review step in place so the outputs are still checked'
    ),
    correct: ['c'],
    explanation: 'Communicating Claude\'s value *and* its limitations to stakeholders is an explicit blueprint objective, and an uncorrected overclaim becomes the standard the programme is later judged against. The professional move is to restate the value concretely while being clear about the review step the design depends on. Staying silent or agreeing while privately doing otherwise lets a false expectation harden.',
    references: [REF_AUP, REF_DEFINE_SUCCESS]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL the things you should establish before introducing Claude into your team\'s proposal-writing process.',
    options: opts4(
      'A baseline — how long the process takes today, and what a good proposal looks like',
      'The measures you will use to judge whether the change actually helped',
      'Whether the process handles client data that your organisation\'s policy restricts',
      'A standing rule that every proposal from now on must be drafted by Claude first'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'A baseline tells you where you are starting, agreed measures let you tell real improvement from enthusiasm, and the data-sensitivity question determines whether the workflow is permissible at all — each must be settled before you start. Mandating that all proposals be Claude-drafted is a conclusion, not a precondition: it presumes the answer to the very question the baseline and measures exist to test.',
    references: [REF_DEFINE_SUCCESS, REF_DEVELOP_TESTS]
  },
  {
    domain: WORKFLOW, difficulty: 4, type: QType.SINGLE,
    stem: 'Your Claude-supported reporting workflow has proven itself, and the team now wants it to run automatically against the live sales database and post results into an internal system. What should you do?',
    options: opts4(
      'Build the live database integration yourself using whatever automation tooling you can get access to',
      'Keep running the workflow manually indefinitely and tell the team automation is not worth discussing',
      'Tell the team that Claude cannot be connected to internal systems at all, so this request is simply not possible',
      'Escalate the integration design to the developer team, with the requirements and criteria you established'
    ),
    correct: ['d'],
    explanation: 'Recognising limitations and escalating more complex or technical implementations is a defining Associate competency named in the exam guide. Building a live database integration is Developer/Architect work, and the valuable thing you bring to that handover is the validated requirements and success criteria from your manual workflow. Telling the team it cannot be done is simply untrue — connecting Claude to internal systems is a solved problem, just not yours to solve — and refusing to discuss automation abandons the team rather than routing them to the right people.',
    references: [REF_DEFINE_SUCCESS, REF_PROJECTS]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'A team wants to add Claude to a review process that currently involves six sequential handoffs, three of which exist only to reformat the same information for the next reviewer. What is the most valuable application?',
    options: opts4(
      'Question whether the three reformatting handoffs need to exist at all, and redesign around judgement',
      'Add Claude to each of the six steps so that every handoff, including the three reformatting ones, runs faster',
      'Leave the six-step process as it is and use Claude only to polish the final write-up',
      'Have Claude carry out all six steps in one prompt, collapsing the handoffs into a single pass'
    ),
    correct: ['a'],
    explanation: 'The blueprint distinguishes augmenting a workflow from redesigning it, and handoffs that exist only to reformat information are the classic signal that redesign is the bigger prize. Speeding up steps that should not exist locks the waste in. Collapsing everything into one prompt, meanwhile, discards the judgement steps that are the process\'s actual purpose.',
    references: [REF_DEFINE_SUCCESS, REF_PROMPT_CHAIN]
  },
  {
    domain: WORKFLOW, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You are planning a product launch and want to use Claude for the planning phase. Which use is the best fit for its strengths?',
    options: opts4(
      'Predicting when each team will finish so that the launch date can be guaranteed to the board',
      'Deciding the final budget allocation across the launch workstreams without human input',
      'Giving the final legal sign-off on the performance claims that will appear in the launch copy',
      'Drafting the plan structure, surfacing dependencies and risks, and turning it into a checklist you review'
    ),
    correct: ['d'],
    explanation: 'Planning support — structuring the plan, surfacing dependencies and risks, and producing a reviewable checklist — plays directly to Claude\'s strengths while keeping a human in the decision seat. Predicting delivery dates, allocating budget unilaterally, and giving legal sign-off are all consequential judgement calls that need accountable humans, not a drafting assistant.',
    references: [REF_PROMPT_CHAIN, REF_DEFINE_SUCCESS]
  },
  {
    domain: WORKFLOW, difficulty: 3, type: QType.SINGLE,
    stem: 'Your team has built a Claude-assisted workflow that works well when you run it, but colleagues get inconsistent results. What is the most likely cause and the right fix?',
    options: opts4(
      'Your colleagues are on the wrong model tier — mandate a single tier across the team and results will converge',
      'Much of it lives in your head as ad-hoc prompting — capture it as shared instructions and Project knowledge',
      'Claude gives different accounts different answers by design, so raise a support ticket about the inconsistency',
      'The workflow is too complex to be shared and should be abandoned in favour of the old process'
    ),
    correct: ['b'],
    explanation: 'Undocumented expertise is the usual reason a workflow works for its author and nobody else — the context and refinements exist only in that person\'s prompting habits. Integrating it properly means externalising them into shared instructions and Project knowledge so the workflow is reproducible. Mandating a model tier does not supply the missing context, and a support ticket is the wrong escalation: personal settings can differ between accounts, but that is fixed by sharing the configuration, not by reporting a fault.',
    references: [REF_PROJECTS, REF_PROMPT_SYSTEM]
  },
  {
    domain: WORKFLOW, difficulty: 4, type: QType.MULTI,
    stem: 'You are presenting a Claude-supported workflow to a sceptical leadership team. Select TWO things you should include for the presentation to be credible.',
    options: opts4(
      'Concrete evidence from the pilot — what improved, by how much, measured against the baseline',
      'An honest account of the workflow\'s limitations and the review steps the design depends on',
      'A commitment that the workflow will not require human review once the team is experienced',
      'A projection of the headcount reductions the workflow will enable, to strengthen the business case'
    ),
    correct: ['a', 'b'],
    explanation: 'Credibility with a sceptical audience comes from measured pilot evidence against a baseline plus a candid account of limitations and the review steps in the design — the two together show you understand what you built. Promising that review will become unnecessary and projecting headcount cuts are both unsupported commitments that will be held against the programme later.',
    references: [REF_DEFINE_SUCCESS, REF_AUP]
  },

  // ──────────────── Configuration and Knowledge Management (7) ────────────────
  {
    domain: CONFIG, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What do custom instructions on a Claude Project do?',
    options: opts4(
      'They control which colleagues can open the Project and whether they can see its uploaded knowledge',
      'They give Claude standing guidance — role, tone, audience, format — that applies to every conversation in the Project',
      'They schedule the Project to run its conversations automatically at a set time each week and email the results',
      'They set which model tier every conversation in the Project uses and how that usage is billed'
    ),
    correct: ['b'],
    explanation: 'Project instructions are the standing configuration for a body of work: the role Claude should take, the tone and audience, the format conventions, and the rules that always apply. Setting them once means every conversation in the Project starts correctly oriented. Access control, scheduling, and billing are separate concerns entirely.',
    references: [REF_PROJECTS, REF_PROJECTS_NEWS]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'A Project used for pricing quotes contains a rate card that was superseded three months ago. Claude keeps quoting the old rates. What is the correct fix?',
    options: opts4(
      'Remind Claude at the start of every conversation to ignore the Project rate card and use only the rates you paste in',
      'Start a fresh Project whenever rates change, so the old rate card is never in the knowledge',
      'Add a line to the Project instructions warning that the rate card may be out of date',
      'Replace the stale rate card in Project knowledge with the current one and assign someone to keep it updated'
    ),
    correct: ['d'],
    explanation: 'Claude is faithfully using the knowledge it was given — the defect is that the knowledge is stale, so the fix is to update the source and assign ownership for keeping it current. Per-conversation workarounds depend on every user remembering every time; a disclaimer in the instructions leaves the wrong data in place; and a new Project per change discards the rest of the configuration.',
    references: [REF_PROJECTS, REF_FILES]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.MULTI,
    stem: 'Your organisation is considering enabling connectors such as Google Drive and Gmail for Claude. Select ALL statements that reflect sound practice.',
    options: opts4(
      'Connectors let Claude draw on content in connected systems, so the same sensitivity rules that govern that content still apply when Claude uses it',
      'Enabling a connector should follow your organisation\'s AI and data-governance policy, not individual preference',
      'Connecting a source means Claude works from live content rather than a copy you pasted in, so what it can reach changes as that source changes',
      'Connecting a source removes the need to think about data sensitivity, because the data never leaves your organisation\'s systems'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Connectors change how content reaches Claude, not what that content is — sensitive material stays sensitive, enablement is a governance decision rather than a personal one, and a live connection means the reachable content moves as the source moves. The claim that connecting a source removes the need to think about data sensitivity inverts the risk: broadening what Claude can reach makes that thinking more necessary, not less.',
    references: [REF_PROJECTS, REF_AUP]
  },
  {
    domain: CONFIG, difficulty: 4, type: QType.SINGLE,
    stem: 'You lead a comms team that produces the same four content types weekly, each with its own house rules. You are deciding how to configure this. Which approach is best?',
    options: opts4(
      'One Project for everything, with all four sets of house rules stacked in one long instruction block',
      'No Projects — have each writer paste the relevant house rules into a fresh chat each time',
      'A Project per content type, each with focused instructions and only the knowledge that type needs',
      'A new Project for every individual piece of content, set up fresh from the house rules each time'
    ),
    correct: ['c'],
    explanation: 'Scoping a Project to a coherent body of work keeps its instructions focused and its knowledge relevant, which is what makes the configuration reliable. Cramming four rule sets into one Project forces Claude to work out which apply each time; per-piece Projects create constant setup overhead with nothing reusable; and pasting rules by hand leaves consistency to individual memory.',
    references: [REF_PROJECTS, REF_PROJECTS_NEWS]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.MULTI,
    stem: 'You are writing instructions for a shared Project used by your whole department. Select ALL items that genuinely belong there.',
    options: opts4(
      'The audience the Project\'s outputs are written for, and the tone to use',
      'House conventions — terminology, formatting rules, things never to claim without sign-off',
      'When Claude should ask a clarifying question instead of guessing',
      'A colleague\'s one-off request from last Tuesday, written out in full so it is not forgotten'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Project instructions should hold what is durably true for every conversation in the Project: audience and tone, house conventions and prohibitions, and how to behave under uncertainty. A one-off request belongs in the conversation where it arose — putting transient details into standing instructions dilutes them and makes them harder to maintain.',
    references: [REF_PROJECTS, REF_PROMPT_SYSTEM]
  },
  {
    domain: CONFIG, difficulty: 3, type: QType.SINGLE,
    stem: 'You are about to add a document to a Project that your whole department can access. What is the key consideration?',
    options: opts4(
      'Whether the document is longer than the Project instructions, since knowledge sources must not outweigh them',
      'Whether everyone who can use the Project is permitted to see the document — shared knowledge reaches them all',
      'Whether the document was created this quarter, since Claude weights the most recently uploaded files more heavily',
      'Whether the document is in the same file format as the Project\'s other knowledge sources'
    ),
    correct: ['b'],
    explanation: 'Adding a document to shared Project knowledge effectively extends its audience to everyone who can use the Project, so the question is whether they are all permitted to see it. The other considerations rest on rules that do not exist — Project knowledge is not ranked against the instructions by length, nor weighted by upload date, and mixing file formats is perfectly normal. The access question is the one that turns a routine upload into a data-handling incident.',
    references: [REF_PROJECTS, REF_AUP]
  },
  {
    domain: CONFIG, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: Knowledge you add to a Claude Project is available to Claude across the conversations in that Project, rather than only in the single chat where you added it.',
    options: optsTF(),
    correct: ['t'],
    explanation: 'True — and this is the central reason Projects exist. Knowledge added to a Project is available across that Project\'s conversations, so recurring context does not have to be re-supplied in every new chat. That persistence is also why what you place in shared Project knowledge is a governance decision, not just a convenience one.',
    references: [REF_PROJECTS, REF_PROJECTS_NEWS]
  },

  // ──────────────── Governance, Risk, and Responsible Use (9) ────────────────
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A project manager wants to upload a spreadsheet of customer names and account numbers so Claude can analyse spending trends. Organisational policy restricts the sharing of regulated personal data. What is the most appropriate action?',
    options: opts4(
      'Remove or anonymise the personal identifiers first, so the trend analysis can proceed without them',
      'Upload it as-is — the policy governs external sharing, and this analysis never leaves the company',
      'Upload it as-is but instruct Claude not to retain or remember the names and account numbers',
      'Abandon the analysis — regulated personal data means the spending trends cannot be examined at all'
    ),
    correct: ['a'],
    explanation: 'Anonymising or removing regulated identifiers lets the analysis proceed while honouring the policy — trend analysis rarely needs to know whose account is whose. Internal use does not exempt data from its handling rules, an instruction to the model is not a policy control, and abandoning the work is unnecessary when de-identification makes it compliant.',
    references: [REF_AUP, REF_FILES]
  },
  {
    domain: GOVERNANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which of these requests would fall outside Anthropic\'s Usage Policy?',
    options: opts4(
      'Summarising publicly available research about a competitor\'s published product line for a briefing',
      'Drafting a marketing email announcing a new product launch to your existing customers',
      'Generating messages that impersonate a bank in order to obtain people\'s banking credentials',
      'Analysing anonymised internal survey results to identify recurring themes and concerns'
    ),
    correct: ['c'],
    explanation: 'Anthropic\'s Usage Policy prohibits using Claude to deceive or defraud people, and generating content to trick people into surrendering banking credentials is squarely within that prohibition. Summarising public research, drafting marketing copy, and analysing anonymised survey data are all ordinary business uses — the distinguishing factor is intent to deceive and cause harm.',
    references: [REF_AUP]
  },
  {
    domain: GOVERNANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Your organisation has an approved-AI-tools list and an internal policy on what may be shared with them. A colleague suggests pasting an unreleased product roadmap into a personal, unapproved AI account because "it is faster". What should you do?',
    options: opts4(
      'Agree, as long as the colleague deletes the conversation from the personal account straight afterwards',
      'Agree — the policy covers personal data, and a product roadmap contains none of it',
      'Decline and use the approved tooling, raising the gap through governance if it really is too slow',
      'Agree, but ask the colleague to swap the product names for codenames before pasting it in'
    ),
    correct: ['c'],
    explanation: 'Following organisational AI policy is a blueprint objective, and confidential material such as an unreleased roadmap belongs only in approved tooling regardless of convenience. Deleting afterwards does not undo the disclosure; "not personal data" is the wrong test, since confidentiality is a separate category from privacy; and codenames do not make a roadmap non-confidential — the dates, sequencing and strategy are the sensitive part. If the approved path really is too slow, that is a case to make through governance.',
    references: [REF_AUP]
  },
  {
    domain: GOVERNANCE, difficulty: 4, type: QType.SINGLE,
    stem: 'A manager uses Claude to draft performance reviews from their own notes on each team member. What is the responsible boundary?',
    options: opts4(
      'Claude may draft language from the manager\'s notes, but the assessment and the rating stay the manager\'s',
      'Claude should set the ratings itself, since it applies the criteria more consistently than a human manager does',
      'Claude must not touch performance reviews at all, since they concern people rather than documents',
      'The employee should review and approve the draft before the manager sees it, to keep it fair'
    ),
    correct: ['a'],
    explanation: 'The defensible line is drafting versus deciding: Claude can help articulate observations the manager has already made, but a consequential judgement about a person must be made and owned by the accountable human. Handing the rating decision to the model outsources exactly the part requiring accountability, and the appeal to consistency is how that abdication usually gets rationalised.',
    references: [REF_AUP, REF_HALLUCINATION]
  },
  {
    domain: GOVERNANCE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL considerations that should shape whether a given business task is an appropriate use of Claude.',
    options: opts4(
      'The sensitivity and regulatory status of the data the task requires',
      'The consequence of an undetected error, and whether a human review step can realistically catch one',
      'Whether the use is consistent with your organisation\'s AI policy and with Anthropic\'s Usage Policy',
      'Whether the task is one that a person on the team would prefer not to do'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Appropriateness is governed by data sensitivity, error consequence and reviewability, and alignment with both organisational and Anthropic policy. Whether someone dislikes the task is a motivation for automating it, not evidence that doing so is appropriate — plenty of unpopular tasks are high-stakes or handle regulated data.',
    references: [REF_AUP, REF_DEFINE_SUCCESS]
  },
  {
    domain: GOVERNANCE, difficulty: 4, type: QType.SINGLE,
    stem: 'Your team publishes a research report that Claude helped draft. A colleague argues there is no need to mention AI involvement anywhere because "the analysis is ours". What is the most defensible position?',
    options: opts4(
      'Never mention AI involvement anywhere — disclosure only undermines a reader\'s confidence in the analysis',
      'Always append a technical description of the model and settings used to every published report',
      'Follow the applicable disclosure policy — and either way, make sure a human has verified the claims',
      'Disclose the AI involvement only if a reader asks about it directly after publication'
    ),
    correct: ['c'],
    explanation: 'Disclosure norms vary by organisation, jurisdiction, and publication context, so the governed answer is to follow the applicable policy rather than a personal preference — and the non-negotiable part is that a human has verified the claims and is accountable for them. Blanket secrecy ignores policy that may require disclosure, and a technical model description is not what disclosure is for.',
    references: [REF_AUP, REF_HALLUCINATION]
  },
  {
    domain: GOVERNANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'A healthcare client asks your consultancy to use Claude to analyse a dataset containing patient records. What is the correct first step?',
    options: opts4(
      'Begin the analysis now and deal with compliance questions if and when the client raises them',
      'Proceed once the client verbally confirms on a call that they are comfortable with it',
      'Ask the client to email the records to you instead, so that the patient data is never pasted into a chat window',
      'Establish what the regulations and the client\'s policies permit, and whether de-identified data would do'
    ),
    correct: ['d'],
    explanation: 'Regulated health data demands that you establish the legal and policy constraints before any data moves, and de-identification is often what makes the analysis possible at all. Starting first and asking later inverts the control. Changing the transport, or relying on a verbal assurance, does nothing to establish what the regulation actually permits.',
    references: [REF_AUP, REF_FILES]
  },
  {
    domain: GOVERNANCE, difficulty: 4, type: QType.SINGLE,
    stem: 'Marketing wants to publish a Claude-drafted comparison claiming your product is "40% faster than every competitor". The figure came from Claude and no one can identify its source. What should happen?',
    options: opts4(
      'Publish it — comparative performance claims are standard practice in competitive marketing',
      'Publish it as "approximately 40% faster", since the hedge covers any imprecision in the figure',
      'Do not publish it unless the team can produce evidence for the figure and stand behind it',
      'Ask Claude to confirm the figure and its source, and publish once it confirms both'
    ),
    correct: ['c'],
    explanation: 'An unsourced comparative performance claim fails on two fronts at once: it is exactly the kind of specific figure a model can fabricate, and published comparative claims typically must be substantiated. Neither hedging language nor the model\'s own confirmation creates the evidence that is missing — only substantiation the team can produce and defend does.',
    references: [REF_HALLUCINATION, REF_AUP]
  },
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: Instructing Claude in your prompt not to remember or retain sensitive information you paste in satisfies an organisational policy that restricts sharing that information with AI tools.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. Once you paste restricted information into the tool you have already done the thing the policy prohibits — an instruction in the prompt is a request to the model, not a technical or contractual control over data handling. The compliant approaches are to remove or anonymise the restricted content, or to use tooling and terms your organisation has actually approved for it.',
    references: [REF_AUP, REF_FILES]
  },

  // ──────────────── Troubleshooting and Optimization (6) ────────────────
  {
    domain: TROUBLESHOOT, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'Claude keeps returning generic, boilerplate-sounding copy for your product announcements — technically fine but that could describe anyone\'s product. What is the most likely cause?',
    options: opts4(
      'The model tier is too low — announcement copy needs the most capable tier to sound distinctive',
      'The prompt gives no distinguishing context — what the product does, who it is for, the brand voice',
      'Product announcements sit outside what Claude can usefully help with and should be written by hand',
      'The request simply needs re-sending several times; quality improves as Claude settles into the task'
    ),
    correct: ['b'],
    explanation: 'Generic output is the standard symptom of a context-starved prompt: with nothing specific to work from, the model produces the average of everything it has seen, which is boilerplate by definition. Supplying the differentiators, the audience, and the brand voice is the fix. Escalating the model tier does not invent context the prompt never contained.',
    references: [REF_PROMPT_CLEAR, REF_PROMPT_OVERVIEW]
  },
  {
    domain: TROUBLESHOOT, difficulty: 3, type: QType.MULTI,
    stem: 'A prompt you rely on has started producing poor results and you have changed six things at once trying to fix it, with no improvement. Select ALL practices that will make your troubleshooting more effective.',
    options: opts4(
      'Change one thing at a time so you can attribute any improvement to a specific change',
      'Define what a good output looks like before you start, so you can tell whether a change actually helped',
      'Test each candidate prompt against the same example input so the comparison is fair',
      'Make each candidate prompt as long as possible, so more possibilities are covered up front'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Effective diagnosis is controlled: change one variable at a time, hold a definition of "good" so improvement is measurable rather than a matter of impression, and test against a fixed example so comparisons are like-for-like. Maximising length is not a diagnostic technique — it adds variables and noise at the moment you are trying to remove them.',
    references: [REF_DEVELOP_TESTS, REF_DEFINE_SUCCESS]
  },
  {
    domain: TROUBLESHOOT, difficulty: 4, type: QType.SINGLE,
    stem: 'You have rephrased a prompt five times and Claude still cannot produce a usable output for a task that involves reading three documents, reconciling their differences, building a timeline, and drafting a recommendation. What should you conclude?',
    options: opts4(
      'The task exceeds what Claude can do with documents and should be dropped from the workflow',
      'Summarise each of the documents down to a paragraph first, so all three fit comfortably in one prompt',
      'Keep rephrasing — a sixth or seventh wording will eventually land on what Claude responds to',
      'The size is the problem, not the wording — split it into stages and check the output at each one'
    ),
    correct: ['d'],
    explanation: 'When rewording repeatedly fails, the usual culprit is scope, not phrasing: four dependent subtasks in one request give Claude no chance to get any of them fully right and give you no visibility into where it went wrong. Decomposing into checkable stages fixes both. Pre-summarising to a paragraph each would strip out the very details the reconciliation depends on.',
    references: [REF_PROMPT_CHAIN, REF_PROMPT_COT]
  },
  {
    domain: TROUBLESHOOT, difficulty: 3, type: QType.MULTI,
    stem: 'A weekly reporting workflow works, but takes you 90 minutes of prompting and correction every time. Select ALL steps that would genuinely optimise it.',
    options: opts4(
      'Capture the prompting that works into a Project with instructions, so context is not rebuilt each week',
      'Encode the corrections you make every single week into the instructions so they stop recurring',
      'Use a faster, lower-cost tier for the mechanical steps where deep reasoning is not required',
      'Drop the review step to save time, since the workflow has run cleanly for several weeks now'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Real optimisation removes repeated work: reusable Project configuration eliminates weekly context rebuilding, encoding recurring corrections stops you making the same edit forever, and matching a lighter model to the mechanical steps cuts cost and latency where quality is not at risk. Deleting the review step removes the control that catches errors — that is accepting risk, not optimising.',
    references: [REF_PROJECTS, REF_LATENCY]
  },
  {
    domain: TROUBLESHOOT, difficulty: 4, type: QType.SINGLE,
    stem: 'Your prompt contains a long block of pasted source material with the formatting requirement mentioned in the middle of it. Claude follows the requirement inconsistently. What is the best correction?',
    options: opts4(
      'Cut the source material down until the formatting instruction is by far the most prominent thing in the prompt',
      'Restructure it: label the source material separately and state the formatting requirement as an instruction',
      'Repeat the formatting requirement several times at intervals inside the source material block',
      'Accept the inconsistency and fix the formatting by hand each time the output comes back'
    ),
    correct: ['b'],
    explanation: 'An instruction buried inside a block of source material reads as part of the data rather than as a directive, which is why it is followed erratically. Clearly delimiting data from instructions and stating the requirement explicitly is the documented fix. Cutting the source material down removes what the task actually needs, and repeating the requirement inside the data compounds the original confusion rather than resolving it.',
    references: [REF_PROMPT_XML, REF_PROMPT_CLEAR]
  },
  {
    domain: TROUBLESHOOT, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: When Claude returns an output that misses what you wanted, replying only "that is not right, try again" is generally as effective as explaining specifically what was wrong.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. "Try again" tells Claude that the output failed but not on which dimension, so the next attempt is a fresh guess that may miss in a new way. Specific feedback — the tone was too formal, the second section is too long, the figures should be quarterly — identifies what to change while preserving what already worked, which is why targeted iteration converges and vague rejection does not.',
    references: [REF_PROMPT_CLEAR, REF_PROMPT_OVERVIEW]
  }
];

// ───────────────────── Exam shell config ─────────────────────
// CCAO-F launches as a single-variant practice bundle (P1 only, on the bare
// slug — no `-p1` suffix, matching the CCA-F P1 convention so the bundle slug
// and exam slug agree). P2/P3 are planned and will slot into VARIANTS below as
// sibling exams sharing this same CCAO_DOMAINS blueprint. Each variant's
// question domain strings must match CCAO_DOMAINS exactly so the per-domain
// results breakdown maps.
const CCAO_EXAM_DESC =
  'Foundational certification for professionals who apply Claude to real-world business and productivity tasks. Covers prompting and task execution, evaluating and validating output, choosing the right Claude product and model, integrating Claude into workflows, Projects and knowledge configuration, responsible use, and troubleshooting.';

// Vendor's official exam page (carries the authoritative exam guide PDF).
const CCAO_INFO_URL =
  'https://anthropic-partners.skilljar.com/claude-certified-associate-foundations-certification';

type Variant = {
  slug: string;
  code: string;
  title: string;
  questions: Q[];
  tag: string;
  // Legacy tags retired on this exam (counted as legacyRetired). CCAO-F is
  // net-new as of 2026-07, so this is just the current tag.
  retiredTags: string[];
};

// Code is the vendor's official one (CCAO-F), taken from the Claude Certified
// Associate — Foundations Exam Guide v1.0 (July 2026). If a matching
// VENDOR_EXAM_CODE_OVERRIDES entry is added in prisma/seed.ts it must agree
// with this code or the two seeds will fight over it on every deploy.
const VARIANTS: Variant[] = [
  {
    slug: 'anthropic-ccao-foundations',
    code: 'CCAO-F',
    title: 'Claude Certified Associate — Foundations',
    questions: QUESTIONS,
    tag: 'manual:ccao-foundations-seed',
    retiredTags: ['manual:ccao-foundations-seed']
  }
];

const CCAO_BUNDLE = {
  slug: 'anthropic-ccao-foundations',
  title: 'Claude Certified Associate — Foundations (CCAO-F)',
  description:
    'Practice bundle for the Claude Certified Associate — Foundations (CCAO-F) credential. 60 questions matching the official exam blueprint — prompting and task execution, output evaluation, product and model selection, workflow integration, Projects and knowledge configuration, responsible use, and troubleshooting. Written for professionals who use Claude as a productivity tool. Aligned to the official Anthropic exam guide and the public documentation at docs.anthropic.com and docs.claude.com.',
  // $20 PRACTICE tier. No voucher tier: Anthropic sells exam attempts directly
  // through Partner Academy (credit card, then schedule with Pearson VUE), and
  // its partner voucher storefront is still "in progress" as of July 2026 —
  // there is nothing for us to resell.
  price: 2000
};

// ───────────────────── Seed entry point ─────────────────────
export type SeedResult = {
  vendor: 'created' | 'updated' | 'existing';
  exams: { slug: string; questionCount: number; teaserCount: number; legacyRetired: number }[];
  bundle: 'created' | 'updated';
};

export async function seedCcaoFoundations(db: PrismaClient): Promise<SeedResult> {
  // Vendor row already exists in prisma/seed.ts VENDORS[] but make the
  // seed self-sufficient: if it is missing, create it.
  const existingVendor = await db.vendor.findUnique({ where: { slug: 'anthropic' } });
  const vendor = existingVendor
    ? existingVendor
    : await db.vendor.create({
        data: {
          slug: 'anthropic',
          name: 'Anthropic',
          description:
            'Anthropic Claude — agent SDK, Claude Code, MCP, and applied AI architecture.'
        }
      });

  // Upsert each variant exam + its questions. We set published: false because
  // the bundle is the customer-facing product (HIDDEN_EXAM_SLUGS pattern);
  // only the bundle shows on the catalog. The seed.ts visibility loop keeps
  // it that way. Questions authored via /admin-dashboard/questions (other
  // generatedBy strings) are left untouched.
  const examIdBySlug: Record<string, string> = {};
  const examResults: SeedResult['exams'] = [];

  for (const v of VARIANTS) {
    const examData = {
      title: v.title,
      code: v.code,
      description: CCAO_EXAM_DESC,
      level: 'Foundational',
      durationMinutes: 120,
      passingScore: 72,
      questionCount: v.questions.length,
      infoUrl: CCAO_INFO_URL,
      domains: CCAO_DOMAINS,
      published: false
    };
    const exam = await db.exam.upsert({
      where: { slug: v.slug },
      update: examData,
      create: { ...examData, slug: v.slug, vendorId: vendor.id }
    });
    examIdBySlug[v.slug] = exam.id;

    const wiped = await db.question.deleteMany({
      where: { examId: exam.id, generatedBy: { in: v.retiredTags } }
    });
    let teaserCount = 0;
    for (const q of v.questions) {
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
          generatedBy: v.tag,
          isTeaser: !!q.isTeaser
        }
      });
      if (q.isTeaser) teaserCount++;
    }

    // legacyRetired = wiped rows beyond this run's question count. 0 on a
    // fresh DB / steady state.
    const legacyRetired = Math.max(0, wiped.count - v.questions.length);
    examResults.push({ slug: v.slug, questionCount: v.questions.length, teaserCount, legacyRetired });
  }

  // Upsert the bundle. No priceVoucher — see the CCAO_BUNDLE comment: there is
  // no Anthropic partner voucher storefront to resell against yet.
  const existingBundle = await db.bundle.findUnique({ where: { slug: CCAO_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CCAO_BUNDLE.slug },
    update: {
      title: CCAO_BUNDLE.title,
      description: CCAO_BUNDLE.description,
      price: CCAO_BUNDLE.price,
      published: true
    },
    create: {
      slug: CCAO_BUNDLE.slug,
      title: CCAO_BUNDLE.title,
      description: CCAO_BUNDLE.description,
      price: CCAO_BUNDLE.price,
      published: true
    }
  });

  // Replace bundle items deterministically: 1 PRACTICE variant.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  let position = 1;
  for (const v of VARIANTS) {
    await db.bundleItem.create({
      data: {
        bundleId: bundle.id,
        examId: examIdBySlug[v.slug],
        tier: 'PRACTICE',
        position: position++
      }
    });
  }

  return {
    vendor: existingVendor ? 'existing' : 'created',
    exams: examResults,
    bundle: existingBundle ? 'updated' : 'created'
  };
}
