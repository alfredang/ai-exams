/**
 * Claude Certified Architect — Professional (CCAR-P) bundle seed —
 * vendor, 1 practice-exam variant (P1, 63 blueprint-aligned questions),
 * and the bundle. Idempotent: replaces rows tagged
 * `generatedBy: 'manual:ccar-professional-seed'` and upserts catalog rows.
 * P2/P3 variants come later; the VARIANTS table is already shaped for them.
 *
 * Exported as `seedCcarProfessional(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/ccar-professional.ts`) and the
 * protected admin API (`/api/admin/seed-ccar-professional`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the official Anthropic exam guide plus
 * the public documentation:
 *   - https://docs.claude.com/en/api/                  (Claude API + Agent SDK)
 *   - https://docs.claude.com/en/docs/build-with-claude (prompting, caching, context)
 *   - https://docs.claude.com/en/docs/test-and-evaluate (evals, guardrails)
 *   - https://www.anthropic.com/engineering/            (agent + context patterns)
 *   - https://modelcontextprotocol.io/                  (Model Context Protocol)
 *
 * Aligned to the CCAR-P exam objectives (63 questions, 120 min, 72% to pass):
 *   - Solution Design & Architecture                    — 17% (11)
 *   - Claude Models, Prompting & Context Engineering    — 13% (8)
 *   - Integration                                       — 19% (12)
 *   - Evaluation, Testing & Optimization                — 16% (10)
 *   - Governance, Safety & Risk Management              — 14% (9)
 *   - Stakeholder Communication & Lifecycle Management  — 14% (9)
 *   - Developer Productivity & Operational Enablement   —  7% (4)
 *
 * CCAR-P is the hardest of the four Claude credentials: the audience is
 * mid- to senior-level solution architects with 3+ years in systems
 * architecture, so items skew to difficulty 3-4 (architectural judgment and
 * tradeoffs) rather than definition recall.
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

const DESIGN = 'Solution Design & Architecture';
const MODELS = 'Claude Models, Prompting & Context Engineering';
const INTEGRATION = 'Integration';
const EVALUATION = 'Evaluation, Testing & Optimization';
const GOVERNANCE = 'Governance, Safety & Risk Management';
const STAKEHOLDER = 'Stakeholder Communication & Lifecycle Management';
const DEVPROD = 'Developer Productivity & Operational Enablement';

const CCAR_P_DOMAINS = [
  { name: DESIGN, weight: 17 },
  { name: MODELS, weight: 13 },
  { name: INTEGRATION, weight: 19 },
  { name: EVALUATION, weight: 16 },
  { name: GOVERNANCE, weight: 14 },
  { name: STAKEHOLDER, weight: 14 },
  { name: DEVPROD, weight: 7 }
];

// ───────────────────── References (all official) ─────────────────────
// Core API & build-with-claude
const REF_MESSAGES = { label: 'Anthropic Docs — Messages API', url: 'https://docs.claude.com/en/api/messages' };
const REF_STREAMING = { label: 'Anthropic Docs — Streaming messages', url: 'https://docs.claude.com/en/api/messages-streaming' };
const REF_RATE_LIMITS = { label: 'Anthropic Docs — Rate limits', url: 'https://docs.claude.com/en/api/rate-limits' };
const REF_ERRORS = { label: 'Anthropic Docs — Errors', url: 'https://docs.claude.com/en/api/errors' };
const REF_CONTEXT_WIN = { label: 'Anthropic Docs — Context windows', url: 'https://docs.claude.com/en/docs/build-with-claude/context-windows' };
const REF_EXTENDED_THINKING = { label: 'Anthropic Docs — Extended thinking', url: 'https://docs.claude.com/en/docs/build-with-claude/extended-thinking' };
const REF_CITATIONS = { label: 'Anthropic Docs — Citations', url: 'https://docs.claude.com/en/docs/build-with-claude/citations' };
const REF_PROMPT_CACHING = { label: 'Anthropic Docs — Prompt caching', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-caching' };
const REF_BATCH = { label: 'Anthropic Docs — Batch processing', url: 'https://docs.claude.com/en/docs/build-with-claude/batch-processing' };

// Agent SDK
const REF_AGENT_COST = { label: 'Anthropic Docs — Agent SDK cost tracking', url: 'https://docs.claude.com/en/api/agent-sdk/cost-tracking' };
const REF_AGENT_PERMISSIONS = { label: 'Anthropic Docs — Agent SDK permissions', url: 'https://docs.claude.com/en/api/agent-sdk/permissions' };

// Tools, MCP, Skills
const REF_TOOL_USE = { label: 'Anthropic Docs — Tool use overview', url: 'https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview' };
const REF_MCP_DOCS = { label: 'Anthropic Docs — Model Context Protocol', url: 'https://docs.claude.com/en/docs/agents-and-tools/mcp' };
const REF_SKILLS = { label: 'Anthropic Docs — Agent Skills overview', url: 'https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview' };
const REF_MCP_INTRO = { label: 'MCP — Introduction', url: 'https://modelcontextprotocol.io/introduction' };
const REF_MCP_SPEC = { label: 'MCP — Specification', url: 'https://modelcontextprotocol.io/specification' };

// Claude Code
const REF_CC_HOOKS = { label: 'Anthropic Docs — Claude Code hooks', url: 'https://docs.claude.com/en/docs/claude-code/hooks' };
const REF_CC_MEMORY = { label: 'Anthropic Docs — Memory and CLAUDE.md', url: 'https://docs.claude.com/en/docs/claude-code/memory' };
const REF_CC_SETTINGS = { label: 'Anthropic Docs — Claude Code settings', url: 'https://docs.claude.com/en/docs/claude-code/settings' };
const REF_CC_HEADLESS = { label: 'Anthropic Docs — Headless mode', url: 'https://docs.claude.com/en/docs/claude-code/headless' };
const REF_CC_GHA = { label: 'Anthropic Docs — Claude Code GitHub Actions', url: 'https://docs.claude.com/en/docs/claude-code/github-actions' };

// Test & evaluate
const REF_EVAL_TOOL = { label: 'Anthropic Docs — Evaluation tool', url: 'https://docs.claude.com/en/docs/test-and-evaluate/eval-tool' };
const REF_DEFINE_SUCCESS = { label: 'Anthropic Docs — Define success criteria', url: 'https://docs.claude.com/en/docs/test-and-evaluate/define-success' };
const REF_DEVELOP_TESTS = { label: 'Anthropic Docs — Develop test cases', url: 'https://docs.claude.com/en/docs/test-and-evaluate/develop-tests' };
const REF_REDUCE_HALLUC = { label: 'Anthropic Docs — Reduce hallucinations', url: 'https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations' };
const REF_JAILBREAKS = { label: 'Anthropic Docs — Mitigate jailbreaks', url: 'https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks' };
const REF_REFUSALS = { label: 'Anthropic Docs — Handle streaming refusals', url: 'https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/handle-streaming-refusals' };
const REF_LATENCY = { label: 'Anthropic Docs — Reduce latency', url: 'https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-latency' };

// Models & cost
const REF_CHOOSING = { label: 'Anthropic Docs — Choosing a model', url: 'https://docs.claude.com/en/docs/about-claude/models/choosing-a-model' };
const REF_PRICING = { label: 'Anthropic Docs — Pricing', url: 'https://docs.claude.com/en/docs/about-claude/pricing' };

// Prompt engineering
const REF_PE_OVERVIEW = { label: 'Anthropic Docs — Prompt engineering overview', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview' };
const REF_PE_CLEAR = { label: 'Anthropic Docs — Be clear and direct', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct' };
const REF_PE_XML = { label: 'Anthropic Docs — Use XML tags', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags' };
const REF_PE_SYSTEM = { label: 'Anthropic Docs — System prompts', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/system-prompts' };
const REF_PE_CHAIN = { label: 'Anthropic Docs — Chain prompts', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/chain-prompts' };
const REF_PE_LONG = { label: 'Anthropic Docs — Long context tips', url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/long-context-tips' };

// Engineering blog & product
const REF_AGENT_BUILD = { label: 'Anthropic Engineering — Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents' };
const REF_MULTI_AGENT = { label: 'Anthropic Engineering — Multi-agent research system', url: 'https://www.anthropic.com/engineering/multi-agent-research-system' };
const REF_CC_BEST = { label: 'Anthropic Engineering — Claude Code best practices', url: 'https://www.anthropic.com/engineering/claude-code-best-practices' };
const REF_WRITING_TOOLS = { label: 'Anthropic Engineering — Writing tools for agents', url: 'https://www.anthropic.com/engineering/writing-tools-for-agents' };
const REF_CONTEXT_ENG = { label: 'Anthropic Engineering — Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents' };
const REF_AUP = { label: 'Anthropic — Usage Policy', url: 'https://www.anthropic.com/legal/aup' };

const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const optsTF = (): Opt[] => [
  { id: 't', text: 'True' }, { id: 'f', text: 'False' }
];

// ───────────────────── 63 questions ─────────────────────
const QUESTIONS: Q[] = [
  // ──────────────── Solution Design & Architecture (11) ────────────────
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A business process has steps that are known in advance and always execute in the same order. Following Anthropic\'s guidance on building effective agents, which architecture should an architect choose?',
    options: opts4(
      'An autonomous agent, so the system can adapt if the process changes later',
      'A multi-agent orchestrator with one agent per step',
      'A workflow — the steps are predefined, so orchestrate the LLM calls through fixed code paths',
      'A fine-tuned model that has the process baked into its weights'
    ),
    correct: ['c'],
    explanation: 'Anthropic distinguishes workflows (LLM calls orchestrated through predefined code paths) from agents (the model directs its own process). The guidance is to find the simplest solution that works: when the steps are known and fixed, a workflow gives you determinism, cheaper runs, and easier debugging. Agents buy flexibility you only need when the path cannot be predicted in advance.',
    references: [REF_AGENT_BUILD]
  },
  {
    domain: DESIGN, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In Anthropic\'s taxonomy, the "augmented LLM" is the basic building block of every agentic system. What does the augmentation consist of?',
    options: opts4(
      'Additional pre-training on the customer\'s proprietary corpus',
      'The model paired with retrieval, tools, and memory, which it can use to gather context and take action',
      'A larger context window plus a higher rate-limit tier',
      'A vector database placed in front of every model call'
    ),
    correct: ['b'],
    explanation: 'The augmented LLM is the model plus retrieval, tools, and memory — the capabilities it needs to pull in context and act on the world. Every workflow and agent pattern in Anthropic\'s guidance composes this block. Retrieval alone (a vector DB in front of every call) is only one of the three augmentations, and fine-tuning is a different lever entirely.',
    references: [REF_AGENT_BUILD]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.MULTI,
    stem: 'Anthropic\'s write-up of its multi-agent research system found that a multi-agent architecture earns its substantially higher token cost only under certain conditions. Select ALL conditions that apply.',
    options: opts4(
      'The task is naturally parallelizable — subtasks can be explored independently and concurrently',
      'The task\'s value is high enough to justify roughly an order of magnitude more tokens than a single chat interaction',
      'Subtasks depend tightly on each other and must build sequentially on one another\'s partial state',
      'The work is heavy on breadth-first exploration across many sources, where separate context windows help'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Anthropic reports that multi-agent systems burn far more tokens than chat, so they pay off only on high-value, parallelizable, breadth-first work where subagents can explore independently in their own context windows. Tightly coupled sequential subtasks are the counter-indication: coordination overhead and lost shared context make a single agent or a workflow the better design.',
    references: [REF_MULTI_AGENT, REF_AGENT_BUILD]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'You must design a system that fixes a reported defect which may touch an unknown number of files across a large repository. The subtasks cannot be enumerated before the run begins. Which pattern fits best?',
    options: opts4(
      'Parallelization (sectioning): split the work into a fixed set of subtasks up front and run them concurrently',
      'Prompt chaining: a fixed linear sequence of calls with a gate between each',
      'Routing: classify the input and dispatch it to one specialized prompt',
      'Orchestrator-workers: a central LLM dynamically decomposes the task, dispatches workers, and synthesizes their results'
    ),
    correct: ['d'],
    explanation: 'Orchestrator-workers is the pattern for tasks whose subtasks cannot be predicted up front — the orchestrator decides the decomposition at runtime. Parallelization (sectioning) requires you to know the subtasks in advance; prompt chaining requires a known linear path; routing only selects among predefined handlers.',
    references: [REF_AGENT_BUILD]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'A document pipeline must draft marketing copy, verify it against a style guide, then translate it. Accuracy matters far more than latency. Which design gives the best accuracy?',
    options: opts4(
      'Prompt chaining: decompose into sequential calls, with a programmatic gate between steps that checks each intermediate output before continuing',
      'A single prompt that instructs Claude to draft, verify, and translate in one response',
      'An autonomous agent that decides its own steps for each document',
      'Three parallel calls whose outputs are concatenated'
    ),
    correct: ['a'],
    explanation: 'Prompt chaining trades latency for accuracy: each call handles one easier subtask, and a programmatic gate between steps checks the intermediate before it propagates. Doing all three in one call gives the model no checkpoint and compounds errors; the steps here are strictly dependent, so parallelizing them is not possible, and an agent adds nondeterminism you do not need.',
    references: [REF_AGENT_BUILD, REF_PE_CHAIN]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A support platform sees two distinct traffic classes: ~80% simple FAQ lookups, ~20% multi-step reasoning over account history. Serving everything with the flagship model blows the cost target; serving everything with the smallest model fails the quality bar. What is the right architecture?',
    options: opts4(
      'Use the flagship model everywhere but cap max_tokens to control spend',
      'Routing: classify the incoming query first, then dispatch simple queries to a smaller, faster model and complex ones to the more capable model',
      'Use the smallest model everywhere and accept the quality loss on the 20%',
      'Batch all queries and process them asynchronously overnight'
    ),
    correct: ['b'],
    explanation: 'Routing exists exactly for this: classify the input, then send each class to the prompt and model sized for it. It lets you optimize cost on the common path without degrading the hard path. Capping max_tokens truncates answers rather than reducing per-query cost meaningfully, and batching destroys the interactive experience support requires.',
    references: [REF_AGENT_BUILD, REF_CHOOSING]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.SINGLE,
    stem: 'Your architecture needs an internal feedback loop that measurably improves an output over successive iterations, and you have clear, articulable criteria that a human reviewer would apply. Which workflow pattern matches?',
    options: opts4(
      'Routing, with a reviewer prompt as one of the routes',
      'Parallelization (voting), taking the majority answer from several runs',
      'Evaluator-optimizer: one call generates a candidate, a second call critiques it against the criteria, and the loop repeats until the critique passes',
      'Prompt caching of the reviewer instructions'
    ),
    correct: ['c'],
    explanation: 'The evaluator-optimizer pattern pairs a generator with an evaluator that provides critique, and iterates. Anthropic notes it works best when you can articulate the evaluation criteria clearly and when iterative refinement measurably helps — exactly the conditions described. Voting samples independent attempts but adds no refinement loop, and caching is a cost lever, not a pattern.',
    references: [REF_AGENT_BUILD]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.MULTI,
    stem: 'An end-to-end Claude architecture is commonly described as input → processing → output → feedback loop. Select ALL elements that belong to the feedback-loop stage.',
    options: opts4(
      'Choosing the JSON schema the service returns to its callers',
      'Capturing user signals (thumbs up/down, corrections, escalations) against individual responses',
      'Logging inputs, outputs, and tool calls with a correlating trace id so failures can be reconstructed',
      'Promoting real production failures into the evaluation dataset so the next change is measured against them'
    ),
    correct: ['b', 'c', 'd'],
    explanation: 'The feedback loop is what turns production behaviour back into system improvement: user signals, reconstructable traces, and a growing eval set seeded from real failures. The response schema is an output-stage design decision — it shapes what callers receive but feeds nothing back into the system.',
    references: [REF_DEFINE_SUCCESS, REF_DEVELOP_TESTS]
  },
  {
    domain: DESIGN, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: Because agents handle open-ended tasks that workflows cannot, an agentic architecture is the correct default for any new production Claude system.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. Anthropic\'s guidance is the opposite: find the simplest solution that works, and only increase complexity when it demonstrably improves outcomes. Agents trade latency, cost, and predictability for autonomy — a worthwhile trade only when the path genuinely cannot be predetermined. Many production systems are best served by a single well-engineered call or a fixed workflow.',
    references: [REF_AGENT_BUILD]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'A legal-review solution must extract 40 distinct clause types from contracts up to 300 pages long. One call with a single giant prompt performs well on the first few clause types and poorly on the rest. What is the best first architectural move?',
    options: opts4(
      'Truncate each contract to the first 50 pages, where most clauses appear',
      'Re-issue the same prompt with a higher temperature so the model explores more clause types',
      'Fine-tune a model on the contract corpus',
      'Decompose by clause group into several focused calls over the same cached document prefix, then merge the structured results'
    ),
    correct: ['d'],
    explanation: 'Decomposition is the lever: several focused calls each carry a tractable instruction load, and because the contract prefix is identical across them, prompt caching keeps the repeated input cheap. Truncation discards clauses the deliverable requires; raising temperature adds randomness, not coverage; fine-tuning is a large investment that does not address an instruction-density problem.',
    references: [REF_AGENT_BUILD, REF_PROMPT_CACHING]
  },
  {
    domain: DESIGN, difficulty: 4, type: QType.SINGLE,
    stem: 'An agent performs well in testing but occasionally runs away in production, burning budget in an unbounded loop. Which design change addresses this structurally?',
    options: opts4(
      'Give the agent explicit stopping conditions — a bounded number of iterations plus checkpoints where it hands control back to a human',
      'Move to a more capable model, which is less likely to loop',
      'Set temperature to 0 so the agent behaves deterministically',
      'Remove tools from the agent so it terminates sooner'
    ),
    correct: ['a'],
    explanation: 'Anthropic\'s agent guidance calls for stopping conditions — iteration caps and human checkpoints — so an agent can never run unbounded. This is a property of the harness, enforced in your code. Model choice and temperature influence behaviour probabilistically but grant no hard ceiling, and stripping tools removes the agent\'s ability to do the job at all.',
    references: [REF_AGENT_BUILD, REF_AGENT_PERMISSIONS]
  },

  // ──────────────── Claude Models, Prompting & Context Engineering (8) ────────────────
  {
    domain: MODELS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You are starting a complex, accuracy-critical use case where correctness outweighs cost. Which model-selection approach fits, and why?',
    options: opts4(
      'Start with the fastest, cheapest model and only move up if users complain',
      'Always deploy the most capable model available, regardless of task',
      'Start with the most capable model to establish a quality baseline against your evaluation set, then consider optimizing down to cheaper or faster models that still clear the bar',
      'Select whichever model was released most recently'
    ),
    correct: ['c'],
    explanation: 'Anthropic describes two valid starting points. For complex reasoning where accuracy outweighs cost, start with the most capable model, then consider optimizing down once the eval bar is established. (The other documented approach — starting with a fast, cost-effective model and upgrading only for specific capability gaps — is the better fit for prototyping, tight latency budgets, and cost-sensitive or high-volume simple tasks.) Either way the decision is evaluation-driven, which is what rules out waiting for user complaints, defaulting to the largest model for every task, and picking by release date.',
    references: [REF_CHOOSING, REF_DEFINE_SUCCESS]
  },
  {
    domain: MODELS, difficulty: 3, type: QType.SINGLE,
    stem: 'Each request to your service is composed of a static 6,000-token system prompt, a set of retrieved documents that differ per user, and the user question. You want prompt caching to actually produce cache hits. How should the request be structured?',
    options: opts4(
      'Put the retrieved documents first so the freshest content has the model\'s attention, then the system prompt',
      'Place the static system prompt at the start and set the cache breakpoint immediately after it, with the per-user documents and question after the breakpoint',
      'Set the cache breakpoint after the user question so the whole request is cached',
      'Interleave the static and dynamic content so the cache covers a larger share of the request'
    ),
    correct: ['b'],
    explanation: 'Prompt caching works on prefixes: everything up to a cache breakpoint must be byte-identical across requests to hit. Putting the static system prompt first and breaking there yields a stable, reusable prefix. Placing dynamic content ahead of static content, or caching past the varying part, makes the prefix unique per request and the cache never hits.',
    references: [REF_PROMPT_CACHING]
  },
  {
    domain: MODELS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL techniques that reduce token consumption WITHOUT discarding information the model needs to do the task.',
    options: opts4(
      'Enable prompt caching for a large static prefix that is reused across many requests',
      'Truncate the system prompt to its first 500 tokens',
      'Retrieve and inject only the chunks relevant to the current query, instead of the whole corpus',
      'Compact completed turns of a long conversation into a summary before continuing'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Caching, targeted retrieval, and compaction all cut token spend while preserving the signal the task depends on — caching re-reads a prefix at the cache-hit rate, retrieval narrows to what is relevant, and compaction keeps the meaning of earlier turns without their full text. Blind truncation of the system prompt is the one option that deletes information the model needs, which is why it is a cost saving you pay for in quality.',
    references: [REF_CONTEXT_ENG, REF_PROMPT_CACHING]
  },
  {
    domain: MODELS, difficulty: 4, type: QType.SINGLE,
    stem: 'Your agent\'s system prompt has grown to 4,000 tokens of edge-case rules accumulated one bug report at a time, and behaviour is getting worse rather than better. What does Anthropic\'s context-engineering guidance advise?',
    options: opts4(
      'Keep appending rules — more explicit instructions always constrain the model more tightly',
      'Move every rule into few-shot examples instead of prose',
      'Raise temperature so the model treats the rules as guidance rather than constraints',
      'Find the smallest set of high-signal tokens that maximizes the likelihood of the desired outcome — prune to clear, distinct rules at the right altitude instead of stacking brittle special cases'
    ),
    correct: ['d'],
    explanation: 'Context engineering treats context as a finite resource with diminishing returns: the goal is the smallest set of high-signal tokens that produces the desired behaviour. A prompt that has accreted hyper-specific patches becomes brittle and internally conflicting, and the fix is to raise the altitude — distinct, general rules — not to add more. Dumping the rules into examples relocates the bloat, and temperature is unrelated.',
    references: [REF_CONTEXT_ENG, REF_PE_SYSTEM]
  },
  {
    domain: MODELS, difficulty: 3, type: QType.SINGLE,
    stem: 'For which workload does enabling extended thinking give the best return?',
    options: opts4(
      'A high-volume intent classifier with a p95 latency budget of 300 ms',
      'A complex analysis where the model must weigh several competing constraints before committing to an answer',
      'Verbatim extraction of a single named field from a short form',
      'Reformatting text from Markdown to HTML'
    ),
    correct: ['b'],
    explanation: 'Extended thinking gives the model a budgeted reasoning pass before its visible answer, which pays off on genuinely hard, multi-constraint problems. It costs tokens and time, so it is a poor trade on latency-critical classification or on mechanical extraction and formatting, where there is no reasoning for the budget to buy.',
    references: [REF_EXTENDED_THINKING, REF_LATENCY]
  },
  {
    domain: MODELS, difficulty: 3, type: QType.SINGLE,
    stem: 'Five product teams have each re-implemented the same "house style + document template" instructions inside their own prompts, and the copies have drifted apart. Which Claude platform mechanism packages those instructions together with supporting files so Claude can load them on demand when a task matches?',
    options: opts4(
      'Agent Skills — a packaged folder of instructions and resources that Claude loads when the task calls for it',
      'A stop sequence that terminates output at the template boundary',
      'The Message Batches API',
      'A prefilled assistant turn containing the template'
    ),
    correct: ['a'],
    explanation: 'Agent Skills package model-facing instructions plus optional scripts and resources into a reusable folder that Claude loads when relevant, which is exactly the "author once, use everywhere" property the teams are missing. Stop sequences, batching, and prefill are unrelated mechanisms — none provides a shareable, versioned instruction asset.',
    references: [REF_SKILLS, REF_CONTEXT_ENG]
  },
  {
    domain: MODELS, difficulty: 4, type: QType.MULTI,
    stem: 'Select TWO practices that make a system prompt a more reliable behavioural guardrail.',
    options: opts4(
      'Keep the rules deliberately vague so the model can generalize across cases',
      'State explicitly what Claude should do when a request falls outside scope, not only what it must not do',
      'Rely on the system prompt as the sole control for high-consequence actions',
      'Use clear, direct, specific language — brief the model the way you would brief a capable new colleague who lacks your context'
    ),
    correct: ['b', 'd'],
    explanation: 'Anthropic\'s prompt-engineering guidance is that clarity and directness beat cleverness, and that giving the model a defined action for the out-of-scope case is far more reliable than a list of prohibitions with no alternative. Vagueness invites the model to invent the boundary itself, and a system prompt is an instruction, not an access control — high-consequence actions must be gated in code.',
    references: [REF_PE_SYSTEM, REF_PE_CLEAR]
  },
  {
    domain: MODELS, difficulty: 2, type: QType.SINGLE,
    stem: 'A team asks which prompt-engineering technique to reach for first, before investing in chain-of-thought, multishot examples, or prefill. What does Anthropic\'s guidance put first?',
    options: opts4(
      'Lower the temperature until the output stabilizes',
      'Prefill the assistant response to lock the output format',
      'Be clear and direct — give explicit, specific instructions with the context a capable newcomer would need to succeed',
      'Add as many few-shot examples as the context window allows'
    ),
    correct: ['c'],
    explanation: 'Anthropic\'s prompt-engineering path starts with being clear and direct: most disappointing outputs trace back to instructions that assumed context the model was never given. The more advanced techniques are worth adding once the prompt is unambiguous — applied to a vague prompt, they mostly amplify the ambiguity.',
    references: [REF_PE_OVERVIEW, REF_PE_CLEAR]
  },

  // ──────────────── Integration (12) ────────────────
  {
    domain: INTEGRATION, difficulty: 3, type: QType.SINGLE,
    stem: 'An internal agent has 45 registered tools, many with overlapping responsibilities, and the model frequently selects the wrong one. What is the most effective first fix?',
    options: opts4(
      'Move to a more capable model that follows tool descriptions better',
      'Consolidate to a small set of well-named, non-overlapping tools scoped to the workflows the agent actually performs, and remove the rest',
      'Add a long section to the system prompt listing all 45 tools and when to use each',
      'Force tool_choice to a specific tool on every request'
    ),
    correct: ['b'],
    explanation: 'Anthropic\'s guidance on writing tools for agents is to build a few thoughtful, high-impact tools rather than wrapping every existing endpoint: overlapping tools force the model into ambiguous choices no description can fully disambiguate. Restating all 45 in the system prompt spends context on the same ambiguity, forcing tool_choice removes the agent\'s judgment, and a bigger model masks the design flaw at higher cost.',
    references: [REF_WRITING_TOOLS, REF_TOOL_USE]
  },
  {
    domain: INTEGRATION, difficulty: 4, type: QType.SINGLE,
    stem: 'An MCP server connects your agent to a customer database using a single shared service account with full read/write access. End users of the agent have differing permissions in the source system. What is the security gap?',
    options: opts4(
      'The service account credentials live on the server rather than being passed in the prompt',
      'MCP servers cannot be exposed over HTTP, so the transport is insecure',
      'Every request executes with the service account\'s privileges, so a user can reach data their own identity is not authorized to see — authorization must be enforced per end user, not per agent',
      'The model may generate invalid SQL, which authorization cannot prevent'
    ),
    correct: ['c'],
    explanation: 'This is the classic confused-deputy problem: the agent holds broader authority than its caller, so the model becomes a path around the source system\'s access controls. The fix is to carry the end user\'s identity through to the data layer and enforce authorization there. Keeping credentials server-side is correct practice (putting them in a prompt would be worse), MCP does support HTTP transports, and malformed SQL is a correctness issue, not an authorization gap.',
    references: [REF_MCP_DOCS, REF_AGENT_PERMISSIONS]
  },
  {
    domain: INTEGRATION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Your platform team needs one connector for an internal ticketing system, usable from Claude Code, Claude Desktop, and a custom agent application, without re-implementing the tool definitions in each. Which integration mechanism fits?',
    options: opts4(
      'Build an MCP server exposing the ticketing tools; any MCP-compatible client can then use it',
      'Write a REST wrapper and re-declare it as custom tools inside each application',
      'Give each application a CLI to shell out to, and document the flags',
      'Fine-tune a separate model per client application'
    ),
    correct: ['a'],
    explanation: 'MCP is an open protocol that standardizes how applications expose tools and data to LLM clients, so one server serves every compatible client and can be versioned and operated independently. Re-declaring the same tools in each application is exactly the triplication MCP exists to eliminate, and fine-tuning has nothing to do with connectivity.',
    references: [REF_MCP_DOCS, REF_MCP_INTRO]
  },
  {
    domain: INTEGRATION, difficulty: 3, type: QType.SINGLE,
    stem: 'You are chunking a technical manual made up of long, ordered procedures. Retrieval keeps returning fragments that split a procedure in half, and answers omit later steps. What is the best correction to the chunking strategy?',
    options: opts4(
      'Halve the chunk size so more chunks fit into the top-k results',
      'Remove overlap between chunks to avoid returning duplicate content',
      'Raise the temperature so the model can fill in the missing steps',
      'Chunk on the document\'s structural boundaries — one procedure per chunk, with modest overlap — so each chunk is a self-contained semantic unit'
    ),
    correct: ['d'],
    explanation: 'Retrieval quality depends on chunks being coherent units of meaning; a procedure sliced mid-sequence cannot answer a question about the procedure no matter how it is ranked. Chunking along structural boundaries with a little overlap keeps each unit self-contained. Smaller chunks fragment the procedure further, removing overlap loses boundary context, and temperature would only make the model invent the missing steps.',
    references: [REF_CONTEXT_ENG, REF_PE_LONG]
  },
  {
    domain: INTEGRATION, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL situations in which pure vector (semantic) similarity search, used on its own, is a poor fit for the retrieval layer.',
    options: opts4(
      'Open-ended natural-language questions asked over a large corpus of prose documents',
      'Queries that turn on an exact identifier, such as an error code, SKU, or ticket number',
      'Queries that require aggregation over structured records, such as "how many tickets closed last month"',
      'A corpus small enough to fit comfortably in the context window, where retrieval adds a failure mode without adding value'
    ),
    correct: ['b', 'c', 'd'],
    explanation: 'Semantic search retrieves what is similar in meaning, which is the wrong primitive for exact-token lookups (an error code is near-identical in embedding space to every other error code), for aggregations that a SQL query answers exactly, and for a corpus that simply fits in the window — there, retrieval only introduces a way to drop the right chunk. Open-ended prose questions over a large corpus are the case vector search is built for.',
    references: [REF_CONTEXT_ENG, REF_CONTEXT_WIN]
  },
  {
    domain: INTEGRATION, difficulty: 3, type: QType.SINGLE,
    stem: 'An agent must operate against a 10,000-document knowledge base and roughly 30 tools. Preloading all of it into the prompt is impossible. Which strategy does Anthropic\'s context-engineering guidance favour?',
    options: opts4(
      'Preload as much as fits and truncate the oldest content as the window fills',
      'Fine-tune a model on the knowledge base so retrieval is unnecessary',
      'Progressive disclosure — give the agent the means to discover and pull in what it needs at runtime (search, listings, metadata) rather than loading everything up front',
      'Raise max_tokens so the model can process more of the corpus per call'
    ),
    correct: ['c'],
    explanation: 'Progressive disclosure lets the agent navigate to relevant context just in time, keeping the working set small and high-signal — the same way an engineer explores an unfamiliar repository. Preload-and-truncate wastes budget and drops content arbitrarily, fine-tuning does not keep pace with changing documents, and max_tokens governs output length, not input capacity.',
    references: [REF_CONTEXT_ENG, REF_CONTEXT_WIN]
  },
  {
    domain: INTEGRATION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A RAG assistant in a regulated industry must let reviewers verify every claim in an answer against the exact source passage it came from. Which Claude API capability is designed for this?',
    options: opts4(
      'Prompt caching, which preserves the documents between requests',
      'Stop sequences, which bound the answer at the source boundary',
      'Citations, which ground responses in the supplied documents and return the cited source locations',
      'Batch processing, which keeps a record of each document processed'
    ),
    correct: ['c'],
    explanation: 'The Citations feature has Claude ground its answers in the documents you supply and return precise references to the passages it used, giving reviewers a verifiable trail. Caching is a cost optimization, stop sequences bound generation, and batching is an execution mode — none of them produces attributable citations.',
    references: [REF_CITATIONS, REF_REDUCE_HALLUC]
  },
  {
    domain: INTEGRATION, difficulty: 4, type: QType.SINGLE,
    stem: 'A support-deflection agent has a p95 latency budget of 2 seconds. The current design runs retrieval → extended thinking → generation and measures p95 at 6 seconds, while quality sits comfortably above target. Which change trades the least accuracy for the SLA and is the easiest to defend to the business?',
    options: opts4(
      'Reduce or disable the thinking budget on the common intent classes, keep it enabled on the escalation path, and re-run the evaluation set to quantify the accuracy delta',
      'Remove retrieval and let the model answer from what it already knows',
      'Cut max_tokens to 50 so responses finish sooner',
      'Turn off streaming to remove the per-event overhead'
    ),
    correct: ['a'],
    explanation: 'The defensible move is to spend the reasoning budget only where it earns its latency, then measure the resulting accuracy loss on the eval set so the tradeoff is a number, not an opinion. Dropping retrieval trades accuracy for latency far more aggressively and reintroduces hallucination risk, truncating max_tokens produces cut-off answers rather than faster ones, and disabling streaming makes perceived latency worse, not better.',
    references: [REF_LATENCY, REF_EXTENDED_THINKING]
  },
  {
    domain: INTEGRATION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL signals that a production observability design for a Claude agent should capture.',
    options: opts4(
      'Request and response traces correlated by a session or trace id across the whole agent loop, including every tool call and its result',
      'Token usage and cost per request, attributable to a feature, tenant, or customer',
      'The model weights used to serve each request',
      'stop_reason distribution and error/refusal rates tracked over time'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Agent debugging is trace debugging: without a correlated view of the whole loop including tool calls, a bad answer is unattributable. Per-request cost attribution is what makes the economics governable, and stop_reason plus error/refusal rates are the early-warning signals for silent behavioural change. Model weights are not exposed or observable — you pin and record the model version instead.',
    references: [REF_AGENT_COST, REF_ERRORS]
  },
  {
    domain: INTEGRATION, difficulty: 2, type: QType.SINGLE,
    stem: 'A nightly job re-classifies two million archived support tickets. There is no latency requirement — the results are needed by morning. Which API path fits best?',
    options: opts4(
      'One synchronous request per ticket, retrying on 429',
      'Streaming requests issued from a tight parallel loop',
      'Extended thinking on every ticket to maximize classification accuracy',
      'The Message Batches API, which processes large volumes asynchronously at reduced cost'
    ),
    correct: ['d'],
    explanation: 'The Message Batches API is purpose-built for high-volume, latency-tolerant work: you submit the batch, it processes asynchronously, and it costs less than the equivalent synchronous traffic. Hammering the synchronous endpoint fights your rate limits for no benefit, streaming buys incremental delivery nobody is watching at 3 a.m., and extended thinking is an accuracy lever, not a throughput one.',
    references: [REF_BATCH, REF_RATE_LIMITS]
  },
  {
    domain: INTEGRATION, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: Because the Model Context Protocol is an open standard with a published specification, the tools exposed by a third-party MCP server are inherently safe to grant to a production agent.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. MCP standardizes how a client and server communicate; it says nothing about whether a given server is trustworthy or what its tools will do with the access you grant. A third-party server is third-party code in your trust boundary, so it needs the same review, least-privilege scoping, and permission gating you would apply to any dependency with production access.',
    references: [REF_MCP_SPEC, REF_AGENT_PERMISSIONS]
  },
  {
    domain: INTEGRATION, difficulty: 3, type: QType.SINGLE,
    stem: 'Your `search_orders` tool returns the raw JSON of every matching order — 40 fields each, up to 200 matches — and the agent\'s context is exhausted after two calls. Following Anthropic\'s guidance on writing tools for agents, what is the right fix?',
    options: opts4(
      'Move to a model variant with a larger context window so the raw payloads fit',
      'Return a compact, high-signal response by default — the fields the agent actually needs, paginated or truncated with a clear indicator — and offer a detail level or follow-up tool for the full record',
      'Instruct the agent in the system prompt to ignore the fields it does not need',
      'Gzip the JSON payload before returning it from the tool'
    ),
    correct: ['b'],
    explanation: 'Tool responses are context, so they should be designed for token efficiency: return what the agent needs, signal clearly when results were truncated, and let it request more. A bigger window postpones the same problem at higher cost, telling the model to ignore fields still pays for every one of those tokens, and compression is meaningless because the model consumes the decompressed text.',
    references: [REF_WRITING_TOOLS, REF_CONTEXT_ENG]
  },

  // ──────────────── Evaluation, Testing & Optimization (10) ────────────────
  {
    domain: EVALUATION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Before building an evaluation suite, Anthropic recommends defining success criteria. What makes a success criterion usable?',
    options: opts4(
      'It is an aspirational statement that the whole team agrees feels right',
      'It is specific and measurable against a task-relevant metric with a stated target, so a run can be judged pass or fail objectively',
      'It is written after the first production incident, when the real risks are known',
      'It is owned by the model provider, who publishes the benchmark scores'
    ),
    correct: ['b'],
    explanation: 'A success criterion has to be specific, measurable, and tied to a target on a task-relevant metric — "F1 of at least 0.85 on the held-out set" can be tested; "high quality answers" cannot. Criteria defined up front are what make model selection, prompt iteration, and go/no-go decisions objective; provider benchmarks measure someone else\'s task, not yours.',
    references: [REF_DEFINE_SUCCESS]
  },
  {
    domain: EVALUATION, difficulty: 3, type: QType.SINGLE,
    stem: 'Your evaluation must grade 500 test cases on every commit. Which grading strategy does Anthropic\'s guidance prioritize?',
    options: opts4(
      'Human review of every case, since humans are the ground truth',
      'LLM-based grading for every case, since it is the most flexible method',
      'Code-based grading (exact match, regex, structural checks) wherever the task allows, LLM-based grading for open-ended outputs, and human review only where neither works',
      'Skip automated grading and rely on production feedback to surface regressions'
    ),
    correct: ['c'],
    explanation: 'Anthropic ranks graders by speed and reliability: code-based grading is fastest and most consistent and should be used wherever the output can be checked mechanically; LLM-based grading covers the open-ended cases; human grading is the most flexible but the slowest and costliest, so it is the fallback. Grading 500 cases per commit by hand is not a repeatable process, and waiting for production to find regressions is not an evaluation strategy.',
    references: [REF_DEVELOP_TESTS, REF_EVAL_TOOL]
  },
  {
    domain: EVALUATION, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL statements that describe a well-designed evaluation dataset.',
    options: opts4(
      'It prioritizes volume — more cases with slightly noisier automated grading generally beats a small hand-graded gold set',
      'It is drawn exclusively from the examples already used as few-shot prompts, so the model has seen the format',
      'It mirrors the real distribution of production inputs, including messy and adversarial ones',
      'It includes edge cases and known failure modes, not only the happy path'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Anthropic explicitly advises prioritizing volume over per-case polish: a larger set with automated grading gives more statistical signal than a handful of hand-graded cases. The set should also mirror real inputs and deliberately include edge cases, since those are where regressions hide. Reusing your few-shot examples as tests is the one clear anti-pattern — you would be measuring recall of the prompt, not generalization.',
    references: [REF_DEVELOP_TESTS, REF_DEFINE_SUCCESS]
  },
  {
    domain: EVALUATION, difficulty: 4, type: QType.SINGLE,
    stem: 'A system-prompt change lifts offline evaluation accuracy by three points. Before routing 100% of traffic to it, what is the most defensible next step?',
    options: opts4(
      'Ship to 100% — the offline evaluation is the ground truth',
      'Have three engineers try the new prompt and vote on whether it feels better',
      'Ship it behind a flag and check the dashboard when someone remembers to',
      'Run an A/B test on live traffic with the success metric and sample size agreed in advance, so the change is measured on the real input distribution'
    ),
    correct: ['d'],
    explanation: 'An offline eval measures the distribution you curated; only live traffic measures the distribution you actually serve, and pre-committing to the metric and sample size is what stops the result being read selectively afterwards. Shipping outright bets the blast radius on that gap, informal impressions are not measurement, and an unmonitored flag is a rollout with no readout.',
    references: [REF_DEFINE_SUCCESS, REF_DEVELOP_TESTS]
  },
  {
    domain: EVALUATION, difficulty: 3, type: QType.SINGLE,
    stem: 'A summarization feature has started cutting off mid-sentence on long inputs. The responses come back with `stop_reason: "max_tokens"`. What is the correct diagnosis and fix?',
    options: opts4(
      'The model hit the output cap, not a reasoning failure — raise max_tokens and/or ask for a shorter summary that fits the cap',
      'The model is hallucinating an ending — lower the temperature',
      'The input no longer fits — move to a model variant with a larger context window',
      'The prefix is no longer cached — enable prompt caching'
    ),
    correct: ['a'],
    explanation: '`stop_reason: "max_tokens"` is unambiguous: generation was truncated because it reached the output token limit you set. Either raise the limit or constrain the requested output length to fit it. Running out of context reports itself differently — an input that does not fit at all is rejected as a request error, and generation that reaches the context limit returns `stop_reason: "model_context_window_exceeded"` — so neither produces `max_tokens`. Temperature and caching affect neither.',
    references: [REF_MESSAGES, REF_CONTEXT_WIN]
  },
  {
    domain: EVALUATION, difficulty: 3, type: QType.SINGLE,
    stem: 'Which technique most directly reduces hallucination in a document-grounded assistant?',
    options: opts4(
      'Raise the temperature so the model explores more candidate answers',
      'Instruct Claude to answer only from the provided documents, to quote the supporting passage before answering, and to say it does not know when the documents do not cover the question',
      'Remove the system prompt so the model is not constrained into guessing',
      'Increase max_tokens so the model has room to qualify its answers'
    ),
    correct: ['b'],
    explanation: 'Anthropic\'s hallucination guidance centres on grounding: allow "I don\'t know" as an acceptable answer, and require the model to extract and quote the supporting evidence before it reasons over it, so an unsupported claim has no quote to stand on. Higher temperature increases invention, removing the system prompt removes the grounding instruction, and more output tokens just make a wrong answer longer.',
    references: [REF_REDUCE_HALLUC, REF_CITATIONS]
  },
  {
    domain: EVALUATION, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL changes that reduce user-perceived latency WITHOUT degrading the quality of the final answer.',
    options: opts4(
      'Truncate the retrieved context to half its current size',
      'Stream the response, so what the user experiences is time-to-first-token rather than time-to-completion',
      'Enable prompt caching on a large static prefix, cutting time-to-first-token on cache hits',
      'Move work that is not needed to produce the response (analytics enrichment, logging fan-out) out of the request path'
    ),
    correct: ['b', 'c', 'd'],
    explanation: 'Streaming, prefix caching, and removing non-essential work from the critical path all shorten what the user waits for while the generated answer stays byte-for-byte the same. Halving the retrieved context also reduces latency, but it does so by removing information the answer may depend on — that is a quality trade, not a free one.',
    references: [REF_LATENCY, REF_STREAMING, REF_PROMPT_CACHING]
  },
  {
    domain: EVALUATION, difficulty: 4, type: QType.SINGLE,
    stem: 'Your agent\'s spend is dominated by input tokens: each of roughly eight loop iterations resends the same 30,000-token system prompt and tool definitions. What is the single highest-leverage optimization?',
    options: opts4(
      'Reduce max_tokens so each iteration produces less output',
      'Move the whole workload to the Message Batches API',
      'Enable prompt caching so the stable prefix is written once and read at the cache-hit rate on every subsequent iteration',
      'Switch to a smaller model for the whole loop'
    ),
    correct: ['c'],
    explanation: 'The cost is an identical prefix paid eight times, which is precisely the shape prompt caching addresses — write the prefix once, then read it at a fraction of the input price on each following iteration, with no change to behaviour. Cutting max_tokens attacks output tokens, which are not the problem here; batching does not fit an interactive loop; and downgrading the model trades quality for a saving caching gives you for free.',
    references: [REF_PROMPT_CACHING, REF_PRICING]
  },
  {
    domain: EVALUATION, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Latency and error rates for a deployed Claude feature are both flat, but users report the answers have gotten worse. Which signal would have caught this?',
    options: opts4(
      'CPU utilization on the application servers',
      'Requests per second served by the endpoint',
      'The size of the deployed container image',
      'A scheduled evaluation run against a held-out test set, tracked over time alongside production quality signals'
    ),
    correct: ['d'],
    explanation: 'Quality regressions are invisible to infrastructure telemetry: a wrong answer is served with the same latency and the same HTTP 200 as a right one. The only instrument that sees them is an evaluation suite run continuously against a held-out set and trended over time, which is why the eval set is an operational asset rather than a pre-launch artifact.',
    references: [REF_DEVELOP_TESTS, REF_DEFINE_SUCCESS]
  },
  {
    domain: EVALUATION, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: The Anthropic Console\'s evaluation tool lets you run a set of test cases against different prompt versions and grade the results, so a prompt change can be measured before it ships.',
    options: optsTF(),
    correct: ['t'],
    explanation: 'True. The Console evaluation tool is built for exactly this loop: define test cases, run them across prompt versions, and compare graded results side by side. It gives teams a measured basis for prompt iteration instead of shipping changes on impression, and complements — rather than replaces — an eval suite wired into CI.',
    references: [REF_EVAL_TOOL, REF_DEVELOP_TESTS]
  },

  // ──────────────── Governance, Safety & Risk Management (9) ────────────────
  {
    domain: GOVERNANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which description best characterizes a defense-in-depth guardrail design for a public-facing Claude assistant with tool access?',
    options: opts4(
      'Layered controls: input screening, a constrained system prompt, tool allowlists enforced in application code, output filtering, and human review on high-risk actions',
      'A single carefully written system prompt, since Claude follows instructions reliably',
      'A keyword blocklist applied at the API gateway',
      'Temperature set to 0, so behaviour is deterministic and therefore predictable'
    ),
    correct: ['a'],
    explanation: 'Guardrails are layered because each individual layer is defeasible: screening catches some adversarial input, the system prompt shapes default behaviour, code-enforced allowlists bound what can actually happen, output filtering catches what slips through, and human review backstops the consequential cases. Any single control — prompt, blocklist, or temperature — is a single point of failure, and temperature does not constrain what the model is willing to do at all.',
    references: [REF_JAILBREAKS, REF_AGENT_PERMISSIONS]
  },
  {
    domain: GOVERNANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which technique does Anthropic document for hardening an application against jailbreak attempts?',
    options: opts4(
      'Prefill the assistant response with the user\'s own request so the model can inspect it',
      'Increase the extended thinking budget so the model reasons its way past the attack',
      'Harmlessness screening: run a cheap, fast classification pass over user input before the main request, and reject or route the flagged inputs',
      'Remove the system prompt, so an attacker has no instructions to override'
    ),
    correct: ['c'],
    explanation: 'Anthropic\'s jailbreak mitigations include a lightweight screening pass in front of the main call, so adversarial inputs are filtered before they reach the expensive, capable model — one layer among several including input validation and clear system-prompt boundaries. Removing the system prompt deletes a guardrail rather than protecting one, and neither prefill nor a thinking budget is a defence against adversarial input.',
    references: [REF_JAILBREAKS, REF_PE_SYSTEM]
  },
  {
    domain: GOVERNANCE, difficulty: 4, type: QType.MULTI,
    stem: 'Your agent ingests third-party web pages and also has a tool that can send email. Select ALL controls that reduce the risk that instructions hidden inside a fetched page cause the agent to email data to an attacker.',
    options: opts4(
      'Rely on the model recognizing and ignoring injected instructions, since it is trained to be helpful and harmless',
      'Treat retrieved content as untrusted data: delimit it clearly and instruct the model that anything inside those delimiters is data to analyze, never instructions to follow',
      'Require human approval before the email tool executes, or restrict recipients to an allowlist enforced in application code',
      'Scope the agent to the minimum tools it needs and remove the email tool from the ingestion agent\'s configuration entirely'
    ),
    correct: ['b', 'c', 'd'],
    explanation: 'Prompt injection is mitigated in layers: mark untrusted content as data with clear delimiters, gate the dangerous capability behind human approval or a code-enforced allowlist, and — most effectively — do not give the ingestion agent the exfiltration tool at all. Relying on the model to spot the injection is the one option with no enforcement behind it; model judgment is a mitigation, never a control.',
    references: [REF_JAILBREAKS, REF_AGENT_PERMISSIONS, REF_PE_XML]
  },
  {
    domain: GOVERNANCE, difficulty: 4, type: QType.SINGLE,
    stem: 'Reviewer time is scarce. Where does human-in-the-loop validation buy the most risk reduction per hour of reviewer effort?',
    options: opts4(
      'On a random sample of all outputs, reviewed after the fact, to build reviewer familiarity with the system',
      'On the small subset of actions that are irreversible or high-consequence, gated before execution',
      'On every output, reviewed at 100%, so nothing reaches a user unchecked',
      'Only on the outputs the model itself flags as low-confidence'
    ),
    correct: ['b'],
    explanation: 'Review is a scarce resource, so it belongs where an error cannot be undone — placed before execution, where it can still prevent the outcome. Post-hoc sampling detects but does not prevent, 100% review does not scale and dilutes attention across mostly-safe outputs, and self-reported confidence is exactly the signal that fails on confident-but-wrong answers.',
    references: [REF_AGENT_BUILD, REF_AGENT_PERMISSIONS]
  },
  {
    domain: GOVERNANCE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A client asks you to design a Claude-powered feature and wants to know which uses are permitted. Which document is authoritative?',
    options: opts4(
      'The Claude API rate limits reference',
      'The model overview page\'s published benchmark scores',
      'The Claude Code settings reference',
      'Anthropic\'s Usage Policy, which sets out prohibited uses and the standards applications must meet'
    ),
    correct: ['d'],
    explanation: 'The Usage Policy (AUP) is the authoritative statement of what Claude may and may not be used for, and reviewing it against the proposed use case is part of an architect\'s design work — not a legal afterthought. Rate limits, benchmarks, and tool settings describe capability and configuration; none of them speaks to permitted use.',
    references: [REF_AUP]
  },
  {
    domain: GOVERNANCE, difficulty: 3, type: QType.SINGLE,
    stem: 'A healthcare customer requires that protected health information never leave their trust boundary for a low-value internal logging feature. Which architectural control most directly satisfies the requirement?',
    options: opts4(
      'Redact or tokenize the identifiers in the application before the request is constructed, so the PHI is never part of any payload sent out',
      'Add a system-prompt instruction telling Claude not to retain or repeat PHI',
      'Enable prompt caching so the PHI is transmitted only once and reused thereafter',
      'Rely on the model\'s refusal behaviour to decline handling PHI'
    ),
    correct: ['a'],
    explanation: 'A data-residency requirement is satisfied where the data is handled — in your own application, by removing or tokenizing the identifiers before a request exists. Everything on the model side happens after the data has already crossed the boundary: a system-prompt instruction is a request to the model, caching means the PHI was sent (and now stored), and a refusal cannot un-transmit a payload.',
    references: [REF_AUP, REF_AGENT_PERMISSIONS]
  },
  {
    domain: GOVERNANCE, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL of the following that are genuine, documented failure modes an architect must design around when building on LLMs.',
    options: opts4(
      'Confidently stated but incorrect claims, especially where the supplied context does not actually contain the answer',
      'Silent, undisclosed changes to a pinned model version\'s weights between requests',
      'Sensitivity to where information sits within a long context',
      'Refusals or partial refusals that appear mid-stream, after tokens have already been delivered to the client'
    ),
    correct: ['a', 'c', 'd'],
    explanation: 'Hallucination under weak grounding, position sensitivity in long contexts, and mid-stream refusals are all documented behaviours you must design for — with grounding and citations, deliberate long-context layout, and client-side refusal handling respectively. A pinned model version does not have its weights silently swapped underneath you; that is the reason to pin a version in the first place.',
    references: [REF_REDUCE_HALLUC, REF_PE_LONG, REF_REFUSALS]
  },
  {
    domain: GOVERNANCE, difficulty: 3, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: When streaming, a refusal can only arrive as an error before any content is sent, so a client that has already begun rendering text does not need to handle refusals.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. A streaming response can begin normally and then stop with a refusal after content has already reached the client, which is why Anthropic documents handling streaming refusals as a distinct concern. Clients must inspect the terminal stop reason rather than assuming that a stream which started successfully will finish successfully, and they need a defined behaviour for retracting or annotating what was already rendered.',
    references: [REF_REFUSALS, REF_STREAMING]
  },
  {
    domain: GOVERNANCE, difficulty: 4, type: QType.SINGLE,
    stem: 'Your team is building a Claude-based résumé screening assistant. Which design choice best addresses the fairness and transparency concerns an architect should raise?',
    options: opts4(
      'Hide the model\'s reasoning from candidates and reviewers to prevent applicants gaming the criteria',
      'Produce a written rationale tied to the job\'s stated criteria for every recommendation, keep a human as the decision maker, and evaluate outcomes across candidate subgroups on a held-out set',
      'Emit a single numeric score per candidate with no rationale, so reviewers apply it consistently',
      'Strip demographic fields from the input and treat fairness as addressed'
    ),
    correct: ['b'],
    explanation: 'Consequential decisions about people need all three: an auditable rationale bound to the stated criteria, a human who owns the decision, and measured outcomes broken down by subgroup — because bias is an empirical question that only measurement answers. Hiding reasoning removes accountability, a bare score is unauditable, and removing demographic fields does not remove proxies for them from the text.',
    references: [REF_DEFINE_SUCCESS, REF_AUP]
  },

  // ──────────────── Stakeholder Communication & Lifecycle Management (9) ────────────────
  {
    domain: STAKEHOLDER, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In a discovery workshop, the business sponsor opens with "we want an AI agent for customer support." What is the most valuable next question for the architect to ask?',
    options: opts4(
      'Which Claude model would you like us to use?',
      'Should we integrate over MCP or call the API directly?',
      'What monthly token budget has been approved?',
      'Which specific tasks in the current support workflow are slow or costly today, and how would we know the system had made them better?'
    ),
    correct: ['d'],
    explanation: 'Discovery converts a solution request into a problem statement plus a measurable definition of better — without those, nothing downstream can be evaluated or defended. Model choice, integration protocol, and budget are all real decisions, but each one is a consequence of the answer to this question, and asking them first anchors the design to a solution nobody has yet justified.',
    references: [REF_DEFINE_SUCCESS]
  },
  {
    domain: STAKEHOLDER, difficulty: 4, type: QType.SINGLE,
    stem: 'A sponsor states that the system must be 100% accurate before it can launch. What is the most effective architect response?',
    options: opts4(
      'Reframe the goal as a measurable accuracy bar on a representative evaluation set, plus a defined fallback path for the residual error rate, and agree with the business what level of error it can absorb',
      'Accept the 100% target now and renegotiate it after the first release',
      'Explain that LLMs are probabilistic and therefore cannot be held to accuracy targets',
      'Escalate to the sponsor\'s manager for a more realistic requirement'
    ),
    correct: ['a'],
    explanation: 'The sponsor\'s underlying concern is real — they cannot absorb unbounded error — so the job is to translate it into something achievable and testable: a measured bar on a representative set, plus an explicit plan for what happens on the errors that remain. Accepting a target you cannot meet defers the conflict to launch, and "it\'s probabilistic" reads as an excuse for having no target at all, which is precisely what makes stakeholders distrust the system.',
    references: [REF_DEFINE_SUCCESS, REF_DEVELOP_TESTS]
  },
  {
    domain: STAKEHOLDER, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL items that belong in the SLA for a Claude-powered feature.',
    options: opts4(
      'A latency target expressed as a percentile (for example, p95) rather than an average',
      'A quality target defined against a named, versioned evaluation set',
      'A guarantee that the system will never return an incorrect answer',
      'The defined degraded-mode behaviour when the upstream model API is rate-limited or unavailable'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'A workable SLA commits to what can be measured and operated: tail latency (averages hide the experience that generates complaints), quality against a named eval set version so both sides mean the same thing, and the agreed behaviour when the dependency degrades. A promise of zero incorrect answers is not achievable for an LLM system and, once written down, converts every normal error into a breach.',
    references: [REF_DEFINE_SUCCESS, REF_RATE_LIMITS]
  },
  {
    domain: STAKEHOLDER, difficulty: 4, type: QType.SINGLE,
    stem: 'A prototype built on 20 hand-picked examples impressed the steering committee, which now wants a go-live date. What is the most responsible move?',
    options: opts4(
      'Commit to a date — the demo established that the approach works',
      'Refuse to give any date until the system is fully built and tested',
      'Explain that the demo measured 20 curated inputs, and commit to a date once the prototype has been measured against a representative evaluation set drawn from real production traffic',
      'Re-run the demo on a more capable model so the committed date carries less risk'
    ),
    correct: ['c'],
    explanation: 'A curated demo demonstrates feasibility on the easy path and says nothing about the messy real distribution, which is where the remaining work lives — so the honest answer names the gap and ties the date to closing it with a measurement. Committing on demo evidence sets a date on unknown work, blanket refusal gives stakeholders nothing to plan around, and a bigger model does not tell you what real inputs look like.',
    references: [REF_DEVELOP_TESTS, REF_DEFINE_SUCCESS]
  },
  {
    domain: STAKEHOLDER, difficulty: 3, type: QType.SINGLE,
    stem: 'Six months after handoff, the client\'s team asks why the design routes simple queries to a smaller model. Which artifact should have answered that without you?',
    options: opts4(
      'The Slack thread in which the decision was originally made',
      'An architecture decision record — the decision, the alternatives considered, the tradeoff, and the evidence — kept in the repository alongside the code',
      'The system prompt, which contains the routing instructions',
      'The evaluation dataset used to validate the routing'
    ),
    correct: ['b'],
    explanation: 'Decisions need a durable, discoverable record of the reasoning, not just the outcome, and it belongs next to the code — in the repo, where both the client\'s engineers and their tooling will actually find it (this is also what a checked-in CLAUDE.md gives Claude Code). The system prompt and eval set show what the system does; only the decision record explains why, and a chat thread is neither discoverable nor durable.',
    references: [REF_CC_MEMORY, REF_CHOOSING]
  },
  {
    domain: STAKEHOLDER, difficulty: 3, type: QType.MULTI,
    stem: 'You are handing a Claude solution over to the client\'s platform team. Select ALL of the following that must transfer for that team to genuinely own the system.',
    options: opts4(
      'Your personal API key, so that nothing breaks during the transition',
      'The evaluation suite and the documented success criteria, so the team can verify future changes',
      'Runbooks for the known failure modes, covering rate limiting, refusals, and degraded retrieval',
      'Cost and token observability attributable per feature, together with the levers that move it (caching, model choice, context size)'
    ),
    correct: ['b', 'c', 'd'],
    explanation: 'Ownership means the team can change the system safely (evals plus success criteria), operate it when it misbehaves (runbooks for the real failure modes), and govern its economics (attributable cost plus the levers that move it). Handing over a personal credential is the opposite of a handoff — it leaves your identity on their production traffic and guarantees an outage when it is eventually rotated.',
    references: [REF_DEVELOP_TESTS, REF_AGENT_COST, REF_RATE_LIMITS]
  },
  {
    domain: STAKEHOLDER, difficulty: 4, type: QType.SINGLE,
    stem: 'Which post-launch practice most reliably converts stakeholder complaints into durable system improvement?',
    options: opts4(
      'A monthly meeting where complaints are discussed and prioritized',
      'Rewriting the system prompt in response to each complaint as it arrives',
      'Switching to a more capable model whenever complaints spike',
      'A pipeline that turns each reported failure into a reproducible case in the evaluation set, so the fix is verified and the regression is caught if it returns'
    ),
    correct: ['d'],
    explanation: 'A complaint only becomes durable improvement once it exists as a reproducible test: then the fix is provable and the regression cannot silently return. Discussion prioritizes but does not verify; per-complaint prompt edits are the mechanism by which system prompts accrete brittle special cases; and reaching for a bigger model treats a symptom without ever identifying the cause.',
    references: [REF_DEVELOP_TESTS, REF_DEFINE_SUCCESS]
  },
  {
    domain: STAKEHOLDER, difficulty: 3, type: QType.SINGLE,
    stem: 'On day one of an engagement, a client wants to begin with model selection. Why should the architect push back?',
    options: opts4(
      'Model selection is downstream of the success criteria and the evaluation set — without them there is no basis on which to compare candidate models',
      'Model selection can only be performed by Anthropic on the customer\'s behalf',
      'Models change too frequently for the choice to be made at all',
      'Model selection should be the final step, performed only after the system is already in production'
    ),
    correct: ['a'],
    explanation: 'Choosing a model is an empirical comparison, and a comparison needs a yardstick: the success criteria and an eval set. Starting there turns "which model" into a measurable question instead of a preference. The choice is certainly the customer\'s to make, it is very much makeable, and deferring it until after production inverts the dependency entirely.',
    references: [REF_CHOOSING, REF_DEFINE_SUCCESS]
  },
  {
    domain: STAKEHOLDER, difficulty: 4, type: QType.SINGLE,
    stem: 'The sponsor\'s stated business pillar is cost reduction across a 200-agent support centre, and your design proposes an autonomous agent that resolves tickets end to end — including issuing refunds. Legal objects to the irreversible refund action. What is the best-aligned adjustment?',
    options: opts4(
      'Drop the project — the legal risk outweighs the projected benefit',
      'Proceed as designed and add comprehensive logging so incorrect refunds can be reversed afterwards',
      'Keep the agent for triage and drafting, where the value is realized through reversible outputs, and gate refunds behind human approval — preserving most of the cost benefit while removing the irreversible-action risk',
      'Replace the agent with a more capable model, which will make fewer refund errors'
    ),
    correct: ['c'],
    explanation: 'The architect\'s job here is to find the design that keeps the sponsor\'s value pillar intact while satisfying the constraint: most of the cost saving lives in triage and drafting volume, so gating only the irreversible action costs little and resolves the objection. Abandoning the project discards the benefit unnecessarily, logging is detective rather than preventive on an action that has already moved money, and a better model reduces error frequency without ever bounding the consequence.',
    references: [REF_AGENT_BUILD, REF_AGENT_PERMISSIONS]
  },

  // ──────────────── Developer Productivity & Operational Enablement (4) ────────────────
  {
    domain: DEVPROD, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A team of twelve engineers keeps re-explaining the repository\'s build commands and conventions to Claude Code at the start of every session. What is the right fix?',
    options: opts4(
      'Have each developer paste the conventions in as their first message each session',
      'Check a CLAUDE.md into the repository root containing the conventions, key commands, and architecture notes — Claude Code loads it automatically for everyone who works in the repo',
      'Fine-tune a model on the repository',
      'Add the conventions to each developer\'s shell profile'
    ),
    correct: ['b'],
    explanation: 'CLAUDE.md is the project\'s memory file: checked into the repo, loaded automatically at session start, reviewed like code, and improved by whoever notices a gap. That makes the context a shared asset that stays current. Per-developer pasting is twelve copies drifting apart, a shell profile is invisible to Claude Code, and fine-tuning cannot track a repository that changes daily.',
    references: [REF_CC_MEMORY, REF_CC_BEST]
  },
  {
    domain: DEVPROD, difficulty: 3, type: QType.SINGLE,
    stem: 'Your platform team must guarantee that Claude Code, in the payments repository, can never run `terraform apply` — on every developer\'s machine, not just the ones that remember to configure it. Which control is right?',
    options: opts4(
      'A line in CLAUDE.md asking Claude not to run the command',
      'A team wiki page documenting the policy and its rationale',
      'Each developer\'s personal `~/.claude/settings.json`',
      'A checked-in project `.claude/settings.json` that denies the command, backed by a PreToolUse hook that fails closed — controls that travel with the repository rather than with each developer'
    ),
    correct: ['d'],
    explanation: 'A guarantee has to be enforced and it has to be distributed: project settings checked into the repo apply to everyone who clones it, and a PreToolUse hook is the imperative backstop that fires before the tool executes if settings drift. CLAUDE.md and a wiki are advisory text, and per-developer user settings are exactly the "only on machines that configured it" gap the requirement rules out.',
    references: [REF_CC_SETTINGS, REF_CC_HOOKS]
  },
  {
    domain: DEVPROD, difficulty: 4, type: QType.MULTI,
    stem: 'Select TWO appropriate uses of Claude Code within an automated pipeline.',
    options: opts4(
      'Granting the CI job unrestricted tool permissions so that it never blocks waiting for an approval',
      'Running headless (`claude -p`) in CI to triage a failing test and post its diagnosis as a comment on the pull request',
      'Automatically merging any pull request Claude Code opens, with no human review',
      'A GitHub Actions workflow that responds to an @claude mention on an issue or pull request'
    ),
    correct: ['b', 'd'],
    explanation: 'Headless mode is built for non-interactive automation like CI triage, and the GitHub Actions integration is the supported way to have Claude respond to mentions on issues and PRs — both produce output a human then reviews. The other two remove the human from the loop precisely where it matters: unrestricted permissions in CI hand broad tool access to an unattended process, and auto-merging without review ships unreviewed code by design.',
    references: [REF_CC_HEADLESS, REF_CC_GHA, REF_CC_SETTINGS]
  },
  {
    domain: DEVPROD, difficulty: 3, type: QType.SINGLE,
    stem: 'An on-call engineer is paged: a Claude-backed feature is returning 429 responses at peak traffic. What is the correct immediate operational response?',
    options: opts4(
      'Respect the `retry-after` header, apply exponential backoff with jitter, and shed or queue non-urgent traffic — then address the cap by raising the tier or spreading load',
      'Retry immediately in a tight loop until a request succeeds',
      'Switch to a more capable model, which carries higher rate limits',
      'Disable streaming to reduce the number of requests'
    ),
    correct: ['a'],
    explanation: 'A 429 is a rate-limit signal with an authoritative `retry-after` header: honour it, back off exponentially with jitter to avoid a synchronized retry storm, and protect the limit by shedding or queueing what is not urgent while you fix the underlying capacity. Tight retry loops amplify the overload that caused the 429; larger models typically carry lower per-minute caps, not higher; and streaming does not change the request count.',
    references: [REF_RATE_LIMITS, REF_ERRORS]
  }
];

// ───────────────────── Exam shell config ─────────────────────
// CCAR-P ships as a single-variant practice bundle (P1 on the bare slug).
// P2/P3 siblings will be added later the way CCA-F did it — net-new exam
// slugs appended to VARIANTS, question content in sibling modules. Every
// variant shares the CCAR_P_DOMAINS blueprint, and each variant's question
// domain strings must match CCAR_P_DOMAINS exactly or the per-domain results
// breakdown silently orphans them.
const CCAR_P_EXAM_DESC =
  'Professional certification for architects who design, build, and deliver production-grade AI solutions on the Claude platform. Covers end-to-end solution design, model selection and context engineering, RAG and integration patterns, evaluation and optimization, governance and risk, stakeholder communication, and developer enablement.';

// Vendor's official exam page (carries the authoritative exam guide PDF).
const CCAR_P_INFO_URL =
  'https://anthropic-partners.skilljar.com/claude-certified-architect-professional-certification';

type Variant = {
  slug: string;
  code: string;
  title: string;
  questions: Q[];
  tag: string;
  // Legacy tags retired on this exam (counted as legacyRetired). CCAR-P is
  // net-new, so its only retired tag is its own — no pre-launch experiments
  // to displace.
  retiredTags: string[];
};

// Code is the vendor's official one, taken from the Claude Certified
// Architect — Professional Exam Guide v1.0 (July 2026). If a matching
// VENDOR_EXAM_CODE_OVERRIDES entry is added to prisma/seed.ts it must agree
// with this code, or the two seeds fight over it on every deploy.
const VARIANTS: Variant[] = [
  {
    slug: 'anthropic-ccar-professional',
    code: 'CCAR-P',
    title: 'Claude Certified Architect — Professional',
    questions: QUESTIONS,
    tag: 'manual:ccar-professional-seed',
    retiredTags: ['manual:ccar-professional-seed']
  }
];

const CCAR_P_BUNDLE = {
  slug: 'anthropic-ccar-professional',
  title: 'Claude Certified Architect — Professional (CCAR-P)',
  description:
    'Practice bundle for the Claude Certified Architect — Professional (CCAR-P) credential. 63 questions matching the official exam blueprint — solution design and architecture, model selection and context engineering, integration and RAG, evaluation and optimization, governance and risk, stakeholder communication, and developer enablement. Aligned to the official Anthropic exam guide and the public documentation at docs.anthropic.com and docs.claude.com.',
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

export async function seedCcarProfessional(db: PrismaClient): Promise<SeedResult> {
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
      description: CCAR_P_EXAM_DESC,
      level: 'Professional',
      durationMinutes: 120,
      passingScore: 72,
      questionCount: v.questions.length,
      infoUrl: CCAR_P_INFO_URL,
      domains: CCAR_P_DOMAINS,
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

  // Upsert the bundle. No priceVoucher — Anthropic sells CCAR-P attempts
  // directly via Partner Academy and has no partner voucher storefront yet,
  // so there is nothing to bundle a voucher for.
  const existingBundle = await db.bundle.findUnique({ where: { slug: CCAR_P_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CCAR_P_BUNDLE.slug },
    update: {
      title: CCAR_P_BUNDLE.title,
      description: CCAR_P_BUNDLE.description,
      price: CCAR_P_BUNDLE.price,
      published: true
    },
    create: {
      slug: CCAR_P_BUNDLE.slug,
      title: CCAR_P_BUNDLE.title,
      description: CCAR_P_BUNDLE.description,
      price: CCAR_P_BUNDLE.price,
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
