/**
 * Claude Certified Architect — Foundations (CCA-F) bundle seed —
 * vendor, 3 practice-exam variants (P1 + P2 + P3, 180 blueprint-aligned
 * questions total), and the bundle. Idempotent: replaces rows tagged
 * `generatedBy: 'manual:cca-foundations-{seed,p2-seed,p3-seed}'` and
 * upserts catalog rows. P2/P3 question content lives in the sibling
 * `cca-foundations-p2-questions.ts` / `-p3-questions.ts` modules.
 *
 * Exported as `seedCcaFoundations(db)` so the same code path is reachable
 * from the standalone CLI shim (`prisma/seeds/cca-foundations.ts`) and the
 * protected admin API (`/api/admin/seed-cca-foundations`) — letting us
 * bootstrap the production database without redeploying.
 *
 * Question content is authored against the public Anthropic documentation:
 *   - https://docs.anthropic.com/                     (Claude API + prompting)
 *   - https://docs.claude.com/en/docs/claude-code     (Claude Code CLI)
 *   - https://docs.claude.com/en/api/agent-sdk        (Claude Agent SDK)
 *   - https://modelcontextprotocol.io/                (Model Context Protocol)
 *
 * Aligned to the CCA-F exam objectives (60 questions, 120 min, 72% to pass):
 *   - Agentic Architecture & Orchestration   — 27% (16)
 *   - Tool Design & MCP Integration          — 18% (11)
 *   - Claude Code Configuration & Workflows  — 20% (12)
 *   - Prompt Engineering & Structured Output — 20% (12)
 *   - Context Management & Reliability       — 15% (9)
 *
 * No exam dumps — every question is original and references first-party
 * Anthropic documentation. See [[feedback_no_exam_dumps]] for rationale.
 */
import { PrismaClient, QStatus, QType } from '@prisma/client';
import { CCA_P2 } from './cca-foundations-p2-questions';
import { CCA_P3 } from './cca-foundations-p3-questions';

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

const AGENTIC = 'Agentic Architecture & Orchestration';
const TOOLS = 'Tool Design & MCP Integration';
const CLAUDE_CODE = 'Claude Code Configuration & Workflows';
const PROMPT = 'Prompt Engineering & Structured Output';
const CONTEXT = 'Context Management & Reliability';

const CCA_DOMAINS = [
  { name: AGENTIC, weight: 27 },
  { name: TOOLS, weight: 18 },
  { name: CLAUDE_CODE, weight: 20 },
  { name: PROMPT, weight: 20 },
  { name: CONTEXT, weight: 15 }
];

// ───────────────────── References (all official) ─────────────────────
const REF_AGENT_SDK = { label: 'Anthropic Docs — Claude Agent SDK overview', url: 'https://docs.claude.com/en/api/agent-sdk/overview' };
const REF_AGENT_PY = { label: 'Anthropic Docs — Agent SDK Python', url: 'https://docs.claude.com/en/api/agent-sdk/python' };
const REF_AGENT_TS = { label: 'Anthropic Docs — Agent SDK TypeScript', url: 'https://docs.claude.com/en/api/agent-sdk/typescript' };
const REF_AGENT_SESSIONS = { label: 'Anthropic Docs — Agent SDK sessions', url: 'https://docs.claude.com/en/api/agent-sdk/sessions' };
const REF_AGENT_BUILD = { label: 'Anthropic Engineering — Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents' };

const REF_TOOL_USE = { label: 'Anthropic Docs — Tool use overview', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview' };
const REF_TOOL_SCHEMA = { label: 'Anthropic Docs — How to implement tool use', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use' };
const REF_TOOL_CHOICE = { label: 'Anthropic Docs — Tool choice', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use#forcing-tool-use' };
const REF_COMPUTER_USE = { label: 'Anthropic Docs — Computer use', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use-tool' };

const REF_MCP_INTRO = { label: 'MCP — Introduction', url: 'https://modelcontextprotocol.io/introduction' };
const REF_MCP_SPEC = { label: 'MCP — Specification', url: 'https://modelcontextprotocol.io/specification' };
const REF_MCP_TRANSPORTS = { label: 'MCP — Transports', url: 'https://modelcontextprotocol.io/specification/2025-06-18/basic/transports' };
const REF_MCP_CLAUDE_CODE = { label: 'Anthropic Docs — MCP in Claude Code', url: 'https://docs.claude.com/en/docs/claude-code/mcp' };

const REF_CC_OVERVIEW = { label: 'Anthropic Docs — Claude Code overview', url: 'https://docs.claude.com/en/docs/claude-code/overview' };
const REF_CC_SETTINGS = { label: 'Anthropic Docs — Claude Code settings', url: 'https://docs.claude.com/en/docs/claude-code/settings' };
const REF_CC_HOOKS = { label: 'Anthropic Docs — Claude Code hooks', url: 'https://docs.claude.com/en/docs/claude-code/hooks' };
const REF_CC_HOOKS_GUIDE = { label: 'Anthropic Docs — Hooks guide', url: 'https://docs.claude.com/en/docs/claude-code/hooks-guide' };
const REF_CC_SKILLS = { label: 'Anthropic Docs — Claude Code skills', url: 'https://docs.claude.com/en/docs/claude-code/skills' };
const REF_CC_SLASH = { label: 'Anthropic Docs — Slash commands', url: 'https://docs.claude.com/en/docs/claude-code/slash-commands' };
const REF_CC_SUBAGENTS = { label: 'Anthropic Docs — Subagents', url: 'https://docs.claude.com/en/docs/claude-code/sub-agents' };
const REF_CC_OUTPUT_STYLES = { label: 'Anthropic Docs — Output styles', url: 'https://docs.claude.com/en/docs/claude-code/output-styles' };
const REF_CC_HEADLESS = { label: 'Anthropic Docs — Headless mode', url: 'https://docs.claude.com/en/docs/claude-code/headless' };
const REF_CC_MEMORY = { label: 'Anthropic Docs — Memory and CLAUDE.md', url: 'https://docs.claude.com/en/docs/claude-code/memory' };

const REF_PROMPT_OVERVIEW = { label: 'Anthropic Docs — Prompt engineering overview', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' };
const REF_PROMPT_XML = { label: 'Anthropic Docs — Use XML tags', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags' };
const REF_PROMPT_MULTISHOT = { label: 'Anthropic Docs — Multishot prompting', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting' };
const REF_PROMPT_CHAIN = { label: 'Anthropic Docs — Chain prompts', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/chain-prompts' };
const REF_PROMPT_SYSTEM = { label: 'Anthropic Docs — Giving Claude a role', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts' };
const REF_PROMPT_LONG = { label: 'Anthropic Docs — Long context tips', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips' };
const REF_PROMPT_COT = { label: 'Anthropic Docs — Chain of thought', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/chain-of-thought' };
const REF_PROMPT_PREFILL = { label: 'Anthropic Docs — Prefill response', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prefill-claudes-response' };

const REF_PROMPT_CACHING = { label: 'Anthropic Docs — Prompt caching', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching' };
const REF_EXTENDED_THINKING = { label: 'Anthropic Docs — Extended thinking', url: 'https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking' };
const REF_VISION = { label: 'Anthropic Docs — Vision', url: 'https://docs.anthropic.com/en/docs/build-with-claude/vision' };
const REF_MESSAGES = { label: 'Anthropic Docs — Messages API', url: 'https://docs.anthropic.com/en/api/messages' };
const REF_RATE_LIMITS = { label: 'Anthropic Docs — Rate limits', url: 'https://docs.anthropic.com/en/api/rate-limits' };
const REF_STREAMING = { label: 'Anthropic Docs — Streaming messages', url: 'https://docs.anthropic.com/en/api/messages-streaming' };
const REF_TOKEN_COUNT = { label: 'Anthropic Docs — Token counting', url: 'https://docs.anthropic.com/en/docs/build-with-claude/token-counting' };
const REF_CONTEXT_WIN = { label: 'Anthropic Docs — Context windows', url: 'https://docs.anthropic.com/en/docs/build-with-claude/context-windows' };
const REF_MODEL_OVERVIEW = { label: 'Anthropic Docs — Models overview', url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview' };
const REF_STOP_SEQ = { label: 'Anthropic Docs — Stop sequences', url: 'https://docs.anthropic.com/en/api/messages#body-stop-sequences' };

const opts4 = (a: string, b: string, c: string, d: string): Opt[] => [
  { id: 'a', text: a }, { id: 'b', text: b }, { id: 'c', text: c }, { id: 'd', text: d }
];
const optsTF = (): Opt[] => [
  { id: 't', text: 'True' }, { id: 'f', text: 'False' }
];

// ───────────────────── 60 questions ─────────────────────
const QUESTIONS: Q[] = [
  // ──────────────── Agentic Architecture & Orchestration (16) ────────────────
  {
    domain: AGENTIC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'In the agentic loop pattern described by Anthropic, what is the minimum set of capabilities an agent needs to make progress on an open-ended task?',
    options: opts4(
      'A single LLM call with chain-of-thought prompting',
      'A loop in which the model can gather context, take action via tools, and verify the result before continuing',
      'A vector database and a RAG retrieval step before every LLM call',
      'A fine-tuned model trained on the specific task domain'
    ),
    correct: ['b'],
    explanation: 'Anthropic\'s "building effective agents" pattern describes an agent as a loop: the model gathers context, takes an action (often via a tool), then verifies the outcome before deciding whether to continue. Single calls, fine-tuning, and RAG can all be inputs to this loop but none of them alone is sufficient.',
    references: [REF_AGENT_BUILD, REF_AGENT_SDK]
  },
  {
    domain: AGENTIC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which Anthropic SDK is purpose-built for running an agent loop with tools, sessions, and resumable conversations from your own application code?',
    options: opts4(
      'The Anthropic Messages SDK (anthropic-sdk-python)',
      'The Claude Agent SDK',
      'The Model Context Protocol SDK',
      'A custom wrapper around the /v1/complete legacy endpoint'
    ),
    correct: ['b'],
    explanation: 'The Claude Agent SDK is the official agent runtime, available in Python and TypeScript. It wraps the Messages API with first-class support for tools, multi-turn sessions, and resumable conversations — the things you would otherwise write by hand around anthropic-sdk-python.',
    references: [REF_AGENT_SDK, REF_AGENT_PY, REF_AGENT_TS]
  },
  {
    domain: AGENTIC, difficulty: 3, type: QType.SINGLE,
    stem: 'You are designing a multi-step research agent that must run for an hour and survive process restarts. Which Agent SDK primitive lets a fresh process resume the conversation where the previous one left off?',
    options: opts4(
      'Pass the entire chat history string back in the next request',
      'Persist and reload the session, identified by a session_id',
      'Set stream=false to keep the request alive longer',
      'Reduce temperature to 0 so the agent is deterministic'
    ),
    correct: ['b'],
    explanation: 'Agent SDK sessions are the resumption primitive: each turn writes back into a stored session, and a new process can load the same session_id to pick up the exact state. Reposting raw history works but loses tool-state and is what sessions exist to abstract.',
    references: [REF_AGENT_SESSIONS, REF_AGENT_SDK]
  },
  {
    domain: AGENTIC, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL situations where a subagent (delegating a sub-task to a fresh Claude conversation) is a better choice than continuing in the main conversation.',
    options: opts4(
      'You need to search across hundreds of files and only want the conclusion back, not every excerpt',
      'You have independent pieces of work that could run in parallel',
      'You want to keep a long-running expert conversation that depends on accumulating context',
      'You need to insulate the main thread from noisy intermediate output'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Subagents are right for fan-out searches (the parent keeps the conclusion, not the file dumps), independent parallel work, and isolating noisy intermediate output. They are a bad fit when context must accumulate over time — a subagent starts fresh and discards everything when it returns.',
    references: [REF_CC_SUBAGENTS, REF_AGENT_BUILD]
  },
  {
    domain: AGENTIC, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'A request sent to the Messages API includes a `tools` array and Claude\'s response has `stop_reason: "tool_use"`. What must your application do next?',
    options: opts4(
      'Discard the response and resend the request with a higher max_tokens',
      'Execute the requested tool, then post the result back as a `tool_result` content block in the next user message',
      'Wait for Claude to call the tool itself via an outbound webhook',
      'Forward the response directly to the end user — Claude will retry automatically'
    ),
    correct: ['b'],
    explanation: '`stop_reason: "tool_use"` means Claude asked for a tool. Your application is responsible for executing it and returning the output as a `tool_result` content block keyed by the matching `tool_use_id` in the next user message. Claude does not call tools itself — the API is a contract for the model to ASK for a tool.',
    references: [REF_TOOL_USE, REF_TOOL_SCHEMA]
  },
  {
    domain: AGENTIC, difficulty: 3, type: QType.SINGLE,
    stem: 'Your agent is making 12 tool calls per task on average and burning latency on serial round-trips. Which Anthropic feature lets the model request multiple independent tools in a single response?',
    options: opts4(
      'Setting `parallel_tool_calls: true` in tool_choice — Claude can emit multiple `tool_use` blocks in one response when the tools are independent',
      'There is no way to parallelise tool calls; you must run them serially',
      'Switching to the streaming API and racing the SSE events',
      'Reducing max_tokens to force the model to be more concise'
    ),
    correct: ['a'],
    explanation: 'Claude can return several `tool_use` content blocks in a single response when the tools are independent — your application then runs them in parallel and returns multiple `tool_result` blocks in the next user message. The `parallel_tool_calls` field on tool_choice controls this.',
    references: [REF_TOOL_USE, REF_TOOL_CHOICE]
  },
  {
    domain: AGENTIC, difficulty: 3, type: QType.SINGLE,
    stem: 'For a destructive action (delete production records), what is the recommended pattern in an agentic system?',
    options: opts4(
      'Always allow the agent to proceed if the tool description marks it as destructive',
      'Implement a human-in-the-loop confirmation step before the tool executes, gated by your application',
      'Train a smaller "guardrail" model to approve the action',
      'Lower the model\'s temperature so it is less likely to choose destructive tools'
    ),
    correct: ['b'],
    explanation: 'Anthropic recommends a human-in-the-loop confirmation for destructive or hard-to-reverse actions. The agent should propose the action via a tool call; the application should pause, ask a human (or apply a policy), and only execute on approval. Temperature changes do not prevent destructive choices reliably.',
    references: [REF_AGENT_BUILD, REF_TOOL_USE]
  },
  {
    domain: AGENTIC, difficulty: 2, type: QType.SINGLE,
    stem: 'When using the Claude Agent SDK to orchestrate a long-running task, which control gives you the most direct way to intercept and audit every tool call before it runs?',
    options: opts4(
      'Disable streaming so each turn is fully buffered',
      'Use Claude Code hooks (PreToolUse) or implement a pre-tool callback in the Agent SDK',
      'Set tool_choice to `none` for the entire conversation',
      'Move all tool calls to a separate REST microservice'
    ),
    correct: ['b'],
    explanation: 'The PreToolUse hook in Claude Code (and the equivalent pre-tool callback in the Agent SDK) fires before any tool executes, giving you a deterministic interception point for auditing, policy gates, and dry-run logic. Disabling streaming or routing through a microservice both add latency without adding control.',
    references: [REF_CC_HOOKS, REF_AGENT_SDK]
  },
  {
    domain: AGENTIC, difficulty: 4, type: QType.MULTI,
    stem: 'Select ALL statements that are TRUE about parallel tool execution in an agent loop.',
    options: opts4(
      'Independent tool calls in one response can be executed concurrently by the client.',
      'You must return one `tool_result` content block per `tool_use_id`, and they can be in any order.',
      'Claude requires all tool results to share the same content type.',
      'Returning partial results (only some of the requested tool_use_ids) is allowed and Claude will handle the gap.'
    ),
    correct: ['a', 'b'],
    explanation: 'You may run independent tool calls concurrently and return `tool_result` blocks in any order, keyed by tool_use_id. But you must return one result per requested tool_use_id — partial results are not supported — and the content types of different results are independent.',
    references: [REF_TOOL_USE, REF_TOOL_SCHEMA]
  },
  {
    domain: AGENTIC, difficulty: 2, type: QType.SINGLE,
    stem: 'A coding agent is asked to "fix the bug and ship it". You want the agent to stop and ask the human before pushing to main. The cleanest pattern is:',
    options: opts4(
      'Tell the agent in the system prompt to "be careful"',
      'Make `git push` a tool that requires human approval via a confirmation step, and have the agent ask in chat before invoking it',
      'Disallow `git` entirely and have a human run all git commands',
      'Lower temperature to 0 so the agent is always conservative'
    ),
    correct: ['b'],
    explanation: 'The robust pattern is structural, not stylistic: gate the destructive tool (`git push`) behind explicit approval. Prompt phrasing is unreliable; disallowing git entirely defeats the agent\'s purpose; temperature does not give a per-action veto.',
    references: [REF_AGENT_BUILD, REF_CC_HOOKS]
  },
  {
    domain: AGENTIC, difficulty: 3, type: QType.SINGLE,
    stem: 'You want your agent to run a long sequence of steps in the background, surface status to the user, and let the user interrupt at any point. Which Agent SDK feature supports this?',
    options: opts4(
      'Streaming + interruptible sessions, where the client can send a control message to cancel the current turn',
      'Setting stream=false and letting the process hang on a single long POST',
      'Polling the /v1/messages endpoint for completion every 5 seconds',
      'Storing the agent state in cookies on the user\'s browser'
    ),
    correct: ['a'],
    explanation: 'The Agent SDK supports streaming sessions that the client can interrupt by sending a control message. The model surfaces tokens and tool calls as they happen; the user can cancel mid-stream. Polling and cookie-based state are anti-patterns for long-running work.',
    references: [REF_AGENT_SESSIONS, REF_STREAMING]
  },
  {
    domain: AGENTIC, difficulty: 4, type: QType.SINGLE,
    stem: 'When designing an orchestrator that runs many independent agents in parallel, the safest pattern for sharing learnings between them is:',
    options: opts4(
      'Have all agents share the same conversation history and append to it concurrently',
      'Have each agent run with an isolated session, write results to a structured store, and have a coordinator agent read from that store',
      'Inject a long shared system prompt with every step every agent has taken so far',
      'Use a single tool that mutates a global Python dict in memory'
    ),
    correct: ['b'],
    explanation: 'Concurrent appenders on a single conversation race and corrupt history. The robust pattern is isolated sessions with a structured store (database, files, queue) and a coordinator that reads the store. Massive shared prompts blow context budgets; in-memory dicts vanish at restart.',
    references: [REF_AGENT_BUILD, REF_AGENT_SESSIONS]
  },
  {
    domain: AGENTIC, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: A tool that has side effects (e.g. sending email) is functionally equivalent to a pure read-only tool from the agent\'s point of view, and the Agent SDK does not distinguish between them.',
    options: optsTF(),
    correct: ['t'],
    explanation: 'True. The SDK\'s contract is the same: the model emits a `tool_use`, your application executes it, and you return a `tool_result`. Distinguishing side-effectful tools is your application\'s responsibility — typically via hooks, allowlists, or human-in-the-loop confirmation.',
    references: [REF_TOOL_USE, REF_CC_HOOKS]
  },
  {
    domain: AGENTIC, difficulty: 3, type: QType.SINGLE, isTeaser: true,
    stem: 'You see "stop_reason: \'end_turn\'" after a tool result is returned. What does Claude believe about the task?',
    options: opts4(
      'It needs more tool calls before it can answer',
      'It has finished and the response message contains its final answer',
      'It hit the max_tokens limit and was truncated',
      'It refused the request for safety reasons'
    ),
    correct: ['b'],
    explanation: '`end_turn` means Claude believes the task is complete — the response contains its final answer to the user. The other stop reasons each have their own value (`tool_use`, `max_tokens`, `stop_sequence`, `refusal`).',
    references: [REF_MESSAGES, REF_TOOL_USE]
  },
  {
    domain: AGENTIC, difficulty: 3, type: QType.SINGLE,
    stem: 'A reliability concern: your agent occasionally enters a tool-call loop, calling the same search tool 20+ times with similar queries. Which mitigation is structural rather than prompt-only?',
    options: opts4(
      'Add a sentence to the system prompt asking it not to loop',
      'Enforce a per-conversation tool-call budget in your application and return an error tool_result when exceeded',
      'Use a smaller model so it is less ambitious',
      'Set tool_choice to `auto` instead of `any`'
    ),
    correct: ['b'],
    explanation: 'Looping behaviour needs a structural circuit breaker: count tool calls per conversation and surface an error result when a budget is exceeded. The model then sees the budget breach and can replan. Prompt-only nudges are unreliable; smaller models do not necessarily reduce looping.',
    references: [REF_AGENT_BUILD, REF_TOOL_USE]
  },
  {
    domain: AGENTIC, difficulty: 2, type: QType.SINGLE,
    stem: 'Which statement best captures the relationship between the Claude Agent SDK and the Messages API?',
    options: opts4(
      'The Agent SDK is a separate ML model trained for agentic tasks',
      'The Agent SDK is a runtime that sits on top of the Messages API, adding tool execution, sessions, and a streaming loop',
      'The Messages API replaces the Agent SDK in production deployments',
      'The Agent SDK is only available on Amazon Bedrock and Google Vertex'
    ),
    correct: ['b'],
    explanation: 'The Agent SDK is a runtime layered on top of the Messages API. It handles the loop (call → tool → result → call), session persistence, and streaming, so you do not have to re-implement them. The model is the same Claude served via Messages.',
    references: [REF_AGENT_SDK, REF_MESSAGES]
  },

  // ──────────────── Tool Design & MCP Integration (11) ────────────────
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which three fields are REQUIRED when declaring a custom tool in the `tools` array of a Messages API request?',
    options: opts4(
      '`name`, `description`, and `input_schema`',
      '`name`, `endpoint`, and `auth`',
      '`title`, `body`, and `examples`',
      '`tool_id`, `version`, and `provider`'
    ),
    correct: ['a'],
    explanation: 'A custom tool declaration requires `name` (unique identifier), `description` (what the tool does and when to use it), and `input_schema` (a JSON Schema of the tool inputs). Endpoint and auth are concerns of YOUR execution layer — the model never calls a tool directly.',
    references: [REF_TOOL_SCHEMA, REF_TOOL_USE]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'You define a tool `get_weather` with a curt description "Returns weather." The agent picks it inappropriately in non-weather contexts. The single highest-leverage fix is:',
    options: opts4(
      'Lower model temperature',
      'Write a longer, more specific tool description that names the inputs, the output shape, and WHEN to use it — and crucially, when NOT to use it',
      'Switch to tool_choice="none"',
      'Add a regex guardrail to your application'
    ),
    correct: ['b'],
    explanation: 'The tool description is the single biggest lever for tool selection quality. A good description names the inputs, output shape, intended use cases, and explicit anti-cases. Anthropic\'s docs specifically call out "When to use" and "When NOT to use" as best practice.',
    references: [REF_TOOL_USE, REF_TOOL_SCHEMA]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'For a tool that is expensive (e.g. runs a 10-second SQL query), what is the recommended way to encourage Claude to use it sparingly?',
    options: opts4(
      'Set tool_choice to `none` for non-essential turns',
      'Document the cost / latency in the tool description and add guidance about when the tool is appropriate',
      'Reduce max_tokens',
      'Lower temperature to 0'
    ),
    correct: ['b'],
    explanation: 'Claude reads tool descriptions and respects guidance about cost. Calling out latency, monetary cost, or rate limits in the description leads to more judicious use. tool_choice="none" disables ALL tools for that turn (too blunt), and the other options do not address tool selection.',
    references: [REF_TOOL_USE, REF_TOOL_SCHEMA]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL statements that are TRUE about returning tool results to Claude.',
    options: opts4(
      'A tool_result must include the matching `tool_use_id` from the original request',
      'A tool_result\'s `content` may be a string OR an array of content blocks (text, image)',
      'Setting `is_error: true` on a tool_result tells Claude the call failed and to consider an alternative',
      'You must return tool results within 30 seconds or the request will fail'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'tool_result requires the matching tool_use_id; content can be a string or a content-block array (multimodal results are supported); `is_error: true` signals failure so the model can recover. There is no hard 30-second deadline on returning tool results — your conversation is request-driven, not push-based.',
    references: [REF_TOOL_USE, REF_TOOL_SCHEMA]
  },
  {
    domain: TOOLS, difficulty: 4, type: QType.SINGLE,
    stem: 'Computer Use (the Anthropic-defined `computer` tool) is best suited for which class of problem?',
    options: opts4(
      'Replacing CLI scripts in an automated CI pipeline',
      'Driving a GUI application that has no API — clicking, typing, taking screenshots',
      'Long sequential database migrations',
      'High-frequency low-latency trading'
    ),
    correct: ['b'],
    explanation: 'Computer Use is designed for GUI automation: Claude takes screenshots, plans pixel-accurate clicks, types text, and reads the screen. CI/CD jobs, DB migrations, and HFT are far better served by dedicated APIs and code — computer use is slow and best reserved for "no API exists" scenarios.',
    references: [REF_COMPUTER_USE, REF_TOOL_USE]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the Model Context Protocol (MCP) at its core?',
    options: opts4(
      'A new Anthropic model fine-tuned for context retrieval',
      'An open protocol that lets LLM clients (Claude Desktop, Claude Code, etc.) talk to external tools/resources through a standardised server interface',
      'A proprietary file format for storing prompts',
      'A SaaS product that replaces vector databases'
    ),
    correct: ['b'],
    explanation: 'MCP is an open protocol (specified at modelcontextprotocol.io) for connecting LLM applications to external tools and resources. A "client" (e.g. Claude Desktop, Claude Code) speaks MCP to a "server" your team writes — the same server then works across any MCP-aware client.',
    references: [REF_MCP_INTRO, REF_MCP_SPEC]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'Which two transports does MCP support today for connecting a client to a server?',
    options: opts4(
      'stdio (subprocess) and HTTP with Server-Sent Events',
      'HTTP/2 and gRPC only',
      'WebSocket and AMQP',
      'A custom binary protocol over UDP'
    ),
    correct: ['a'],
    explanation: 'MCP uses two transports: stdio (the client launches the server as a subprocess and they talk over stdin/stdout), and HTTP with SSE (the client connects to a long-lived endpoint over HTTPS). Both speak the same JSON-RPC framing.',
    references: [REF_MCP_TRANSPORTS, REF_MCP_SPEC]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.SINGLE,
    stem: 'You write an MCP server that exposes a `search_internal_docs` tool. To make it usable from Claude Code, you would:',
    options: opts4(
      'Register the server in Claude Code\'s MCP configuration; the tool becomes available like any other tool to the agent',
      'Fork Claude Code and hardcode the tool',
      'Convert the tool into a Claude Code slash command first',
      'Upload it to the Anthropic Model Hub'
    ),
    correct: ['a'],
    explanation: 'Claude Code reads MCP server definitions from its settings (project or user scope). Once configured, every tool the MCP server exposes is automatically available to the agent — no fork, no slash-command conversion, no hub upload required.',
    references: [REF_MCP_CLAUDE_CODE, REF_CC_SETTINGS]
  },
  {
    domain: TOOLS, difficulty: 3, type: QType.MULTI,
    stem: 'Compared to embedding a tool directly in your agent code, what advantages does putting that tool behind an MCP server give you?',
    options: opts4(
      'The same server can be reused across multiple MCP clients (Claude Desktop, Claude Code, custom clients)',
      'You can deploy/upgrade the tool independently from the agent',
      'It eliminates the need to write tool descriptions',
      'It removes the need for the LLM to handle errors'
    ),
    correct: ['a', 'b'],
    explanation: 'MCP gives you decoupling: the same server serves any compliant client, and you can ship the server on its own cadence. It does NOT remove the need for tool descriptions (the MCP server still exposes them) or for the model to handle errors (the same tool_result error path applies).',
    references: [REF_MCP_INTRO, REF_MCP_SPEC]
  },
  {
    domain: TOOLS, difficulty: 4, type: QType.SINGLE,
    stem: 'An MCP server exposes both `tools` and `resources`. Which statement best describes the difference?',
    options: opts4(
      'Tools are actions the model can request to be executed; resources are data the model can read on demand (files, documents, URLs)',
      'Tools must be free; resources may be paid',
      'Tools are deprecated; resources replace them',
      'Tools run on the client; resources run on the server'
    ),
    correct: ['a'],
    explanation: 'In MCP, "tools" are actions (function calls the model can ask to invoke), and "resources" are data items the model can read (files, blobs, URLs) — distinct from prompts (templated user messages exposed by the server). They run on the server in both cases.',
    references: [REF_MCP_SPEC, REF_MCP_INTRO]
  },
  {
    domain: TOOLS, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: MCP requires running an Anthropic-hosted service in your VPC.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. MCP is an open protocol; servers run wherever you choose (laptop subprocess, container, remote HTTPS endpoint). Anthropic does not host an MCP intermediary — the client talks directly to the server.',
    references: [REF_MCP_INTRO, REF_MCP_TRANSPORTS]
  },

  // ──────────────── Claude Code Configuration & Workflows (12) ────────────────
  {
    domain: CLAUDE_CODE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Which precedence order does Claude Code use when resolving settings for a session?',
    options: opts4(
      'User settings > project settings > local settings',
      'Local settings (.claude/settings.local.json) > project settings (.claude/settings.json) > user settings (~/.claude/settings.json)',
      'Project settings > user settings > local settings',
      'There is only one settings file: ~/.claude/settings.json'
    ),
    correct: ['b'],
    explanation: 'Claude Code merges three settings layers with local-most-specific winning: `.claude/settings.local.json` (machine-local, gitignored), then `.claude/settings.json` (project, checked in), then `~/.claude/settings.json` (user). Enterprise managed settings override all three at the top.',
    references: [REF_CC_SETTINGS]
  },
  {
    domain: CLAUDE_CODE, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'What is the primary purpose of a project-level CLAUDE.md file at the repo root?',
    options: opts4(
      'It configures the Anthropic API key for the project',
      'It provides project-specific context (conventions, architecture, common commands) that Claude Code loads automatically into the conversation',
      'It is a required file or Claude Code will refuse to run',
      'It maps slash commands to API endpoints'
    ),
    correct: ['b'],
    explanation: 'CLAUDE.md is the project\'s living context file. Claude Code reads it on session start so the model knows your conventions, key files, and common commands without you having to retype them. It is optional but high-leverage — the codebase pattern documentation lives here.',
    references: [REF_CC_MEMORY, REF_CC_OVERVIEW]
  },
  {
    domain: CLAUDE_CODE, difficulty: 3, type: QType.SINGLE,
    stem: 'Which hook event fires AFTER a tool has executed and gives you the tool\'s output to inspect or transform?',
    options: opts4(
      'PreToolUse',
      'PostToolUse',
      'Notification',
      'UserPromptSubmit'
    ),
    correct: ['b'],
    explanation: 'PostToolUse fires after a tool completes, giving access to the result. PreToolUse fires before and can block or modify the call. UserPromptSubmit fires when the user sends a message. Notification fires for Claude Code notifications (e.g. waiting for input).',
    references: [REF_CC_HOOKS, REF_CC_HOOKS_GUIDE]
  },
  {
    domain: CLAUDE_CODE, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL events a Claude Code hook can be registered against.',
    options: opts4(
      'PreToolUse and PostToolUse',
      'SessionStart and SessionEnd',
      'UserPromptSubmit and Stop',
      'GitCommit and GitPush'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'Claude Code supports lifecycle hooks for PreToolUse, PostToolUse, SessionStart, SessionEnd, UserPromptSubmit, Stop, SubagentStop, PreCompact, Notification, and a few others. "GitCommit"/"GitPush" are NOT first-class hook events — you would implement those via PreToolUse filtering on the Bash tool.',
    references: [REF_CC_HOOKS, REF_CC_HOOKS_GUIDE]
  },
  {
    domain: CLAUDE_CODE, difficulty: 3, type: QType.SINGLE,
    stem: 'A slash command lives at `.claude/commands/test.md` in your repo. When does it become invokable?',
    options: opts4(
      'After explicitly importing it in CLAUDE.md',
      'Immediately — Claude Code discovers slash commands by directory convention; users type `/test`',
      'Only after running `claude install`',
      'Only when an admin enrolls the command via the Anthropic dashboard'
    ),
    correct: ['b'],
    explanation: 'Slash commands are discovered by directory convention. Anything under `.claude/commands/` (project) or `~/.claude/commands/` (user) becomes a `/<filename>` command automatically. No install step is required.',
    references: [REF_CC_SLASH]
  },
  {
    domain: CLAUDE_CODE, difficulty: 3, type: QType.SINGLE,
    stem: 'What is a Claude Code "skill" and how does it differ from a slash command?',
    options: opts4(
      'A skill is just an alias for a slash command',
      'A skill is a packaged capability (instructions + optional scripts/resources) that Claude can choose to invoke on its own when relevant; a slash command is explicitly typed by the user',
      'Skills only work inside MCP servers',
      'Skills replace CLAUDE.md'
    ),
    correct: ['b'],
    explanation: 'A skill bundles model-facing instructions with optional scripts and resources, and Claude can decide to use it autonomously when the user\'s task matches its description. A slash command is user-invoked via `/<name>`. Both extend Claude Code, but skills are agent-discoverable.',
    references: [REF_CC_SKILLS]
  },
  {
    domain: CLAUDE_CODE, difficulty: 3, type: QType.SINGLE,
    stem: 'You want a Claude Code hook that blocks any `Bash` invocation containing `rm -rf /` for safety. Where do you put it?',
    options: opts4(
      'Register a PreToolUse hook matching the Bash tool that returns an error/block when the command pattern matches',
      'Add the string "do not run rm -rf /" to CLAUDE.md',
      'Set `dangerouslySkipPermissions: false` in settings.json',
      'There is no way to enforce this — only the user can block at confirmation time'
    ),
    correct: ['a'],
    explanation: 'PreToolUse hooks fire before a tool runs and can deny the call. A hook script matching the Bash tool and inspecting the command is the deterministic gate. Putting safety into CLAUDE.md is advisory only; permission flags do not pattern-match.',
    references: [REF_CC_HOOKS, REF_CC_HOOKS_GUIDE]
  },
  {
    domain: CLAUDE_CODE, difficulty: 2, type: QType.SINGLE,
    stem: 'Which command-line flag runs Claude Code non-interactively, suitable for CI/CD pipelines?',
    options: opts4(
      'claude --headless "<prompt>"',
      'claude --batch "<prompt>"',
      'claude --print "<prompt>"',
      'claude -p "<prompt>"'
    ),
    correct: ['d'],
    explanation: 'Headless mode is invoked with `claude -p "<prompt>"` (also documented as `--print`). It runs a single turn non-interactively and prints the result, designed for scripting and CI use.',
    references: [REF_CC_HEADLESS]
  },
  {
    domain: CLAUDE_CODE, difficulty: 4, type: QType.SINGLE,
    stem: 'Your team wants to make sure Claude Code can never autonomously call your production deploy API. The most robust technique is:',
    options: opts4(
      'Tell the model in CLAUDE.md not to deploy',
      'Use settings.json `permissions.deny` to disallow the relevant tool/MCP server, and back it up with a PreToolUse hook that fails closed',
      'Hide the deploy command in a separate repo',
      'Use a smaller model for production sessions'
    ),
    correct: ['b'],
    explanation: 'Two-layer defence is correct: declarative `permissions.deny` in settings.json removes the capability from the tool surface, and a PreToolUse hook is the imperative backstop in case settings drift. Documentation and obscurity do not constitute access control.',
    references: [REF_CC_SETTINGS, REF_CC_HOOKS]
  },
  {
    domain: CLAUDE_CODE, difficulty: 3, type: QType.MULTI,
    stem: 'Which of these are valid scopes for Claude Code MCP server configuration?',
    options: opts4(
      'Project scope (.claude/settings.json in repo)',
      'User scope (~/.claude/settings.json)',
      'Per-session ephemeral scope set via slash command',
      'Per-PR scope hosted on GitHub'
    ),
    correct: ['a', 'b'],
    explanation: 'MCP servers are configured at project and user scope (and via enterprise managed settings on top). There is no ephemeral per-session scope and no per-PR scope; servers are declared in settings files.',
    references: [REF_MCP_CLAUDE_CODE, REF_CC_SETTINGS]
  },
  {
    domain: CLAUDE_CODE, difficulty: 3, type: QType.SINGLE,
    stem: 'A subagent in Claude Code is best described as:',
    options: opts4(
      'A second Claude account billed separately',
      'A fresh isolated Claude conversation spun up to handle a sub-task, returning only its final answer to the parent — preserving the parent\'s context budget',
      'A worker thread that shares memory with the parent',
      'A way to call GPT models from Claude Code'
    ),
    correct: ['b'],
    explanation: 'A subagent starts a fresh conversation, performs the delegated task with its own tools, and returns the result to the parent. The parent never sees the subagent\'s intermediate context — that is what makes subagents great for fan-out search and noisy work.',
    references: [REF_CC_SUBAGENTS]
  },
  {
    domain: CLAUDE_CODE, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: Claude Code output styles let you change the persona and formatting of the agent\'s responses without modifying the underlying model.',
    options: optsTF(),
    correct: ['t'],
    explanation: 'True. Output styles are project- or user-scoped instruction sets that change how the model presents its work (e.g. terse, verbose, teacher-style) while still using the same model. They are layered on top of the system prompt.',
    references: [REF_CC_OUTPUT_STYLES]
  },

  // ──────────────── Prompt Engineering & Structured Output (12) ────────────────
  {
    domain: PROMPT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'Why does Anthropic recommend wrapping inputs and instructions in XML-like tags (<context>, <task>, <example>) when prompting Claude?',
    options: opts4(
      'XML is the only supported input format',
      'Claude was trained to recognise these tag structures, making it easier to separate instructions from data and reducing misinterpretation',
      'XML reduces token count compared to plain prose',
      'XML enables Claude to write executable code'
    ),
    correct: ['b'],
    explanation: 'Claude is trained to recognise XML-like tag structures, so wrapping prompts in <tag> blocks gives a strong signal for "this is data" vs "this is the task" vs "this is an example". XML is not required — JSON works too — but tags are the documented best practice for unambiguous prompts.',
    references: [REF_PROMPT_XML, REF_PROMPT_OVERVIEW]
  },
  {
    domain: PROMPT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want structured JSON output from Claude reliably. Which approach is the most robust?',
    options: opts4(
      'Ask for JSON in the system prompt and hope the output parses',
      'Define a tool whose input_schema matches your desired JSON shape and force the model to call it (tool_choice="any" or a specific tool) — Claude\'s tool args are validated JSON',
      'Use prompt caching with temperature=0',
      'Use the deprecated `/v1/complete` endpoint'
    ),
    correct: ['b'],
    explanation: 'The most reliable structured-output pattern is to define a tool whose input_schema is your desired JSON and force the model to call it. Claude\'s tool arguments are validated against the schema, eliminating the "JSON inside a string" parsing risk. Plain-prose prompting for JSON is brittle by comparison.',
    references: [REF_TOOL_USE, REF_TOOL_SCHEMA]
  },
  {
    domain: PROMPT, difficulty: 2, type: QType.SINGLE,
    stem: 'In the Messages API, what is the difference between the `system` parameter and a user message that opens with "You are an expert..."?',
    options: opts4(
      'They are functionally identical',
      'The `system` parameter is the canonical place for high-priority persistent instructions and persona; messages are the conversational turns',
      '`system` is deprecated in favor of user messages',
      '`system` only works for Claude 4'
    ),
    correct: ['b'],
    explanation: 'The `system` parameter is the dedicated channel for persistent instructions: persona, format rules, capability boundaries. Inline "you are an expert" in a user message works but mixes conversation with configuration. Use `system` for the things that should hold for every turn.',
    references: [REF_PROMPT_SYSTEM, REF_MESSAGES]
  },
  {
    domain: PROMPT, difficulty: 3, type: QType.MULTI,
    stem: 'Which techniques does Anthropic recommend for getting better answers on COMPLEX reasoning tasks?',
    options: opts4(
      'Provide multiple in-context examples (multi-shot prompting)',
      'Ask Claude to "think step by step" before answering (chain of thought)',
      'Always lower temperature to 0',
      'Use extended thinking on supported models for tasks that benefit from longer internal reasoning'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Multi-shot examples, chain-of-thought prompting, and extended thinking (on supported models) all measurably improve complex reasoning. Lowering temperature to 0 does not by itself improve reasoning — it just makes outputs more deterministic, sometimes at the cost of quality.',
    references: [REF_PROMPT_MULTISHOT, REF_PROMPT_COT, REF_EXTENDED_THINKING]
  },
  {
    domain: PROMPT, difficulty: 3, type: QType.SINGLE,
    stem: 'Anthropic\'s "long context tips" recommend a specific document layout to maximise Claude\'s recall over very long prompts. Which pattern is closest to that recommendation?',
    options: opts4(
      'Put the documents at the END of the prompt, after the task, to make them recent',
      'Put the documents at the TOP of the prompt (often above the instructions), wrapped in clear <document> tags, and reference them by tag/index later',
      'Compress documents to a single paragraph before sending',
      'Send each document in a separate API call and concatenate results'
    ),
    correct: ['b'],
    explanation: 'Long-context guidance: put large documents near the top of the prompt, tag them clearly (e.g. <document index="1">…</document>), and reference them by tag from the task that comes after. This helps Claude index and retrieve from the long context. Putting documents at the end is the LESS effective pattern.',
    references: [REF_PROMPT_LONG, REF_PROMPT_XML]
  },
  {
    domain: PROMPT, difficulty: 3, type: QType.SINGLE,
    stem: 'You want Claude\'s response to ALWAYS start with the literal string `<answer>` so a downstream parser is reliable. The most direct technique is:',
    options: opts4(
      'Use the `prefill` pattern: include an assistant message whose content is `<answer>` so Claude continues from there',
      'Increase max_tokens',
      'Set temperature=0',
      'Use a stop_sequence of `<answer>`'
    ),
    correct: ['a'],
    explanation: 'Prefilling Claude\'s response — sending an assistant turn that ends with the literal text you want it to continue from — is the canonical way to constrain the start of the response. Stop sequences halt generation, max_tokens caps length, temperature controls randomness — none constrain the prefix.',
    references: [REF_PROMPT_PREFILL]
  },
  {
    domain: PROMPT, difficulty: 4, type: QType.SINGLE,
    stem: 'When chaining prompts (one Claude call feeds the next), which pattern most reliably reduces error compounding?',
    options: opts4(
      'Pass only the final natural-language summary between steps',
      'Pass a structured intermediate (validated JSON, often produced via tool use) between steps and validate before continuing',
      'Use the same model for every step',
      'Increase temperature on later steps to add diversity'
    ),
    correct: ['b'],
    explanation: 'Structured intermediates with validation are the robust chain pattern: each step\'s output is checked against a schema before becoming the next step\'s input. Plain natural-language hand-offs are brittle; same-model use is not the lever; raising temperature increases error.',
    references: [REF_PROMPT_CHAIN, REF_TOOL_USE]
  },
  {
    domain: PROMPT, difficulty: 2, type: QType.SINGLE,
    stem: 'For a multi-shot prompt, what makes the examples most useful?',
    options: opts4(
      'They are syntactically valid Python regardless of the task',
      'They are diverse, cover edge cases similar to the real input, and demonstrate the exact output format you want',
      'They are at least 1,000 tokens each',
      'They use the highest difficulty available in the dataset'
    ),
    correct: ['b'],
    explanation: 'Effective few-shot examples are diverse, edge-case-relevant, and demonstrate the precise output format. Length and arbitrary syntax constraints are red herrings — what matters is "does this example teach the model what good looks like for THIS task".',
    references: [REF_PROMPT_MULTISHOT]
  },
  {
    domain: PROMPT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL TRUE statements about extended thinking on supported Claude models.',
    options: opts4(
      'It lets the model do private internal reasoning before producing the user-visible response',
      'You enable it by setting `thinking: { type: "enabled", budget_tokens: <n> }` on the request',
      'It is supported only on text-only inputs and breaks if images are attached',
      'You receive a `thinking` content block in the response that contains the reasoning'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Extended thinking gives the model a private reasoning budget before the response, configured via the `thinking` field with a budget_tokens cap. The response includes a `thinking` content block alongside the text. It is not restricted to text-only inputs — it works with vision too on supported models.',
    references: [REF_EXTENDED_THINKING, REF_MESSAGES]
  },
  {
    domain: PROMPT, difficulty: 3, type: QType.SINGLE,
    stem: 'You\'re building a vision-based agent that summarises receipts. Which message construction is correct for sending an image to Claude?',
    options: opts4(
      'A user message with a `content` array containing an `image` content block (source: base64 or URL) followed by a `text` block',
      'A system parameter set to the base64-encoded image',
      'A separate `image` parameter on the request body',
      'An assistant message containing the image'
    ),
    correct: ['a'],
    explanation: 'Images go in a user message\'s `content` array as `image` content blocks, with the source being either base64 data or a URL (depending on what the model/version supports). You typically follow with a text block describing the task ("Summarise this receipt").',
    references: [REF_VISION, REF_MESSAGES]
  },
  {
    domain: PROMPT, difficulty: 2, type: QType.SINGLE,
    stem: 'Anthropic\'s docs frame "tools" as the right structured-output mechanism INSTEAD of asking the model for JSON in plain text. Why?',
    options: opts4(
      'Tool arguments are validated against your declared input_schema, so you receive parsed JSON that conforms — not JSON-in-a-string you need to repair',
      'Tool calls are cheaper than text generation',
      'Plain JSON is not supported by the Messages API',
      'Tools always use a smaller model'
    ),
    correct: ['a'],
    explanation: 'When the model calls a tool, the SDK gives you the arguments as parsed JSON that has been validated against the schema. With plain-text JSON you face the perennial "find the curly braces and pray it parses" problem. The cost and model claims are not the reason.',
    references: [REF_TOOL_USE, REF_TOOL_SCHEMA]
  },
  {
    domain: PROMPT, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: A higher `temperature` value reliably improves the factual accuracy of Claude\'s answers.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. Higher temperature increases randomness, which generally HURTS factual accuracy. Low temperature (0–0.3) is preferred for fact-heavy tasks; higher temperature is useful for creative tasks where diversity matters.',
    references: [REF_PROMPT_OVERVIEW, REF_MESSAGES]
  },

  // ──────────────── Context Management & Reliability (9) ────────────────
  {
    domain: CONTEXT, difficulty: 2, type: QType.SINGLE, isTeaser: true,
    stem: 'You attach a 250,000-token document to a Claude Sonnet 4.x request and get an error. The most likely cause is:',
    options: opts4(
      'The standard context window cap (200K tokens) — you need to either trim, use a model variant with the 1M-token window, or split the work',
      'Claude rejects all documents larger than 100KB by policy',
      'Your API key tier does not allow attachments',
      'The Messages API requires base64-encoding for all long text'
    ),
    correct: ['a'],
    explanation: 'Claude Sonnet 4.x ships with a 200K-token standard context window; the 1M-token window is available as a beta capability on specific model variants. Exceeding 200K on the standard variant returns an error. Trim, switch variant, or split the work into chunks.',
    references: [REF_CONTEXT_WIN, REF_MODEL_OVERVIEW]
  },
  {
    domain: CONTEXT, difficulty: 3, type: QType.SINGLE,
    stem: 'Prompt caching is most effective when:',
    options: opts4(
      'Every request has a unique system prompt that varies per-user',
      'A large prefix (e.g. system prompt + document corpus) is reused across many requests; you mark a cache breakpoint after it',
      'You only call the model once',
      'You use streaming responses'
    ),
    correct: ['b'],
    explanation: 'Prompt caching wins when you reuse a large prefix across many requests. You add a `cache_control` breakpoint at the boundary; subsequent requests reusing the prefix pay the cache-hit rate (much cheaper) instead of full input cost. Per-request unique prefixes defeat the cache entirely.',
    references: [REF_PROMPT_CACHING]
  },
  {
    domain: CONTEXT, difficulty: 3, type: QType.SINGLE,
    stem: 'Your application surfaces UI updates as the model generates. The right API mode is:',
    options: opts4(
      'Streaming via Server-Sent Events on /v1/messages with stream=true — emits incremental message_delta events you forward to the client',
      'Polling /v1/messages every 100ms',
      'WebSockets — Anthropic\'s only supported real-time transport',
      'Setting max_tokens very low and looping'
    ),
    correct: ['a'],
    explanation: 'Anthropic\'s real-time mode is HTTP streaming with SSE on the Messages API (`stream=true`). You receive incremental events (message_start, content_block_delta, message_delta, message_stop) you can forward to the client. WebSockets are not the canonical transport; polling burns latency and rate-limit budget.',
    references: [REF_STREAMING, REF_MESSAGES]
  },
  {
    domain: CONTEXT, difficulty: 3, type: QType.MULTI,
    stem: 'Which strategies help your application handle Anthropic rate limits gracefully?',
    options: opts4(
      'Read the `retry-after` header on 429 responses and wait the indicated time before retrying',
      'Use exponential backoff with jitter for retries',
      'Set max_tokens lower so each request consumes fewer output tokens, freeing TPM',
      'Ignore the limits and let the user see the failures — Anthropic auto-retries'
    ),
    correct: ['a', 'b', 'c'],
    explanation: 'On 429, the `retry-after` header is authoritative — respect it. Exponential backoff with jitter prevents stampedes. Lower max_tokens reduces TPM (tokens-per-minute) consumption. Anthropic does NOT auto-retry — that is the client\'s responsibility.',
    references: [REF_RATE_LIMITS]
  },
  {
    domain: CONTEXT, difficulty: 3, type: QType.SINGLE,
    stem: 'Which endpoint lets you predict input token usage WITHOUT making a billed generation call?',
    options: opts4(
      '/v1/messages/count_tokens',
      '/v1/usage',
      '/v1/predict-cost',
      '/v1/admin/tokens'
    ),
    correct: ['a'],
    explanation: 'The token-counting endpoint (POST /v1/messages/count_tokens) returns the input token count for a given message payload without running generation. It is the right pre-flight check for budget-sensitive flows.',
    references: [REF_TOKEN_COUNT, REF_MESSAGES]
  },
  {
    domain: CONTEXT, difficulty: 4, type: QType.SINGLE,
    stem: 'A user opens an exam attempt and answers 20 questions. The server saves their state in `Attempt.responses`. After a 30-minute idle period the user returns. The reliability principle that lets them resume cleanly is:',
    options: opts4(
      'Frequent server-side autosave + server-recomputed state on resume; never trust client-cached correctness',
      'Storing responses in localStorage and trusting them on return',
      'Disabling streaming to force every answer to wait for full commit',
      'Increasing the API timeout to 60 minutes'
    ),
    correct: ['a'],
    explanation: 'Server-side autosave with server-recomputed state on resume is the durable pattern — independent of process restarts, browser refreshes, or client tampering. This is how the exam runner in this codebase handles teaser + exam-mode attempts (see [src/lib/attempts.ts](src/lib/attempts.ts) `scoreAttempt`).',
    references: [REF_AGENT_BUILD]
  },
  {
    domain: CONTEXT, difficulty: 2, type: QType.SINGLE,
    stem: 'A `stop_sequences` parameter set to `["</answer>"]` causes generation to:',
    options: opts4(
      'Halt as soon as the substring `</answer>` is produced; that substring is excluded from the response',
      'Fail with an error if the model ever produces that substring',
      'Add the stop sequence as a literal at the end of every response',
      'Lower the temperature dynamically until that sequence appears'
    ),
    correct: ['a'],
    explanation: 'Stop sequences trigger early termination at the substring boundary; the sequence itself is not included in the returned content. They are useful when prefilling a tag-bracketed format (e.g. prefill `<answer>` and stop at `</answer>`).',
    references: [REF_STOP_SEQ, REF_PROMPT_PREFILL]
  },
  {
    domain: CONTEXT, difficulty: 3, type: QType.MULTI,
    stem: 'Select ALL true statements about Anthropic API rate-limit tiers.',
    options: opts4(
      'Tiers scale TPM (tokens per minute) and RPM (requests per minute) limits',
      'Limits differ across model families; bigger models typically have lower TPM caps',
      'You can ignore tiers entirely; Anthropic auto-scales to your traffic',
      'Tier advancement happens automatically based on spend and account age'
    ),
    correct: ['a', 'b', 'd'],
    explanation: 'Tiers scale both TPM and RPM, vary per model family (large/flagship models have lower per-minute caps), and advance based on spend / account history. Anthropic does NOT auto-scale away from your tier — you have to plan for the cap you have today.',
    references: [REF_RATE_LIMITS]
  },
  {
    domain: CONTEXT, difficulty: 2, type: QType.TRUE_FALSE,
    stem: 'TRUE or FALSE: Setting `stream: true` on a request changes the model\'s output — for the same prompt, streamed and non-streamed responses differ in content quality.',
    options: optsTF(),
    correct: ['f'],
    explanation: 'False. Streaming changes the transport (you receive incremental events instead of one final body) but not the generated content. For the same prompt, seed, and temperature, the produced tokens are the same whether streamed or not.',
    references: [REF_STREAMING, REF_MESSAGES]
  }
];

// ───────────────────── Exam shell config ─────────────────────
// CCA-F is now a 3-variant practice bundle (was a single consolidated exam
// pre-2026-06). Variant 1 keeps the original slug `anthropic-cca-foundations`
// (preserves its history, teaser flow, and bundle-slug = exam-slug HIDDEN
// pattern); P2/P3 are net-new sibling exams. All three share the same
// CCA_DOMAINS blueprint. Each variant's question domain strings must match
// CCA_DOMAINS exactly so the per-domain results breakdown maps.
const CCA_EXAM_DESC =
  'Foundational certification covering Claude Code, the Claude Agent SDK, the Claude API, and the Model Context Protocol (MCP). Scenario-based questions test architectural judgment for production deployments — agentic loops, tool design, prompt engineering, structured output, and context management.';

// Vendor's official exam page (carries the authoritative exam guide PDF).
const CCA_INFO_URL =
  'https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification';

type Variant = {
  slug: string;
  code: string;
  title: string;
  questions: Q[];
  tag: string;
  // Legacy tags retired on this exam (counted as legacyRetired). Only the
  // original variant carries pre-2026-05-28 experimental tags.
  retiredTags: string[];
};

// Codes are the vendor's official ones (CCAR-F), taken from the Claude
// Certified Architect — Foundations Exam Guide v1.0 (July 2026). They were
// `CCA-F*` until 2026-07 — a pre-launch guess made before Anthropic published
// the guide. The slugs deliberately keep the old `cca` spelling: the P1 slug is
// the live, indexed bundle URL and renaming it would break it. See the matching
// VENDOR_EXAM_CODE_OVERRIDES entry in prisma/seed.ts, which must agree with
// these codes or the two seeds fight over them on every deploy.
const VARIANTS: Variant[] = [
  {
    slug: 'anthropic-cca-foundations',
    code: 'CCAR-F',
    title: 'Claude Certified Architect — Foundations',
    questions: QUESTIONS,
    tag: 'manual:cca-foundations-seed',
    retiredTags: ['manual:cca-foundations-seed', 'manual:cca-f-pdf', 'manual:cca-f-extra', 'manual:cca-f-fill']
  },
  {
    slug: 'anthropic-cca-foundations-p2',
    code: 'CCAR-F-P2',
    title: 'Claude Certified Architect — Foundations (Practice Exam 2)',
    questions: CCA_P2 as unknown as Q[],
    tag: 'manual:cca-foundations-p2-seed',
    retiredTags: ['manual:cca-foundations-p2-seed']
  },
  {
    slug: 'anthropic-cca-foundations-p3',
    code: 'CCAR-F-P3',
    title: 'Claude Certified Architect — Foundations (Practice Exam 3)',
    questions: CCA_P3 as unknown as Q[],
    tag: 'manual:cca-foundations-p3-seed',
    retiredTags: ['manual:cca-foundations-p3-seed']
  }
];

const CCA_BUNDLE = {
  slug: 'anthropic-cca-foundations',
  title: 'Claude Certified Architect — Foundations (CCAR-F)',
  description:
    'Practice bundle for the Claude Certified Architect — Foundations (CCAR-F) credential. 180 scenario-based questions across 3 practice exams covering the Claude Agent SDK, tool design and MCP integration, Claude Code configuration, prompt engineering, and context management. Aligned to the official Anthropic exam guide and the public documentation at docs.anthropic.com, docs.claude.com, and modelcontextprotocol.io.',
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

export async function seedCcaFoundations(db: PrismaClient): Promise<SeedResult> {
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
  // it that way. The original variant also retires three pre-2026-05-28
  // experimental tags (manual:cca-f-pdf/extra/fill) that were PDF-sourced or
  // ungrounded — displaced by this hand-written, doc-grounded set. Questions
  // authored via /admin-dashboard/questions (other generatedBy strings) are
  // left untouched.
  const examIdBySlug: Record<string, string> = {};
  const examResults: SeedResult['exams'] = [];

  for (const v of VARIANTS) {
    const examData = {
      title: v.title,
      code: v.code,
      description: CCA_EXAM_DESC,
      level: 'Foundational',
      durationMinutes: 120,
      passingScore: 72,
      questionCount: v.questions.length,
      infoUrl: CCA_INFO_URL,
      domains: CCA_DOMAINS,
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

    // legacyRetired = wiped rows beyond this run's question count (the
    // pre-2026-05-28 experimental tags). 0 on a fresh DB / steady state.
    const legacyRetired = Math.max(0, wiped.count - v.questions.length);
    examResults.push({ slug: v.slug, questionCount: v.questions.length, teaserCount, legacyRetired });
  }

  // Upsert the bundle. No priceVoucher — Anthropic doesn't run a paid proctored
  // exam for this credential, so there's nothing to bundle a voucher for.
  const existingBundle = await db.bundle.findUnique({ where: { slug: CCA_BUNDLE.slug } });
  const bundle = await db.bundle.upsert({
    where: { slug: CCA_BUNDLE.slug },
    update: {
      title: CCA_BUNDLE.title,
      description: CCA_BUNDLE.description,
      price: CCA_BUNDLE.price,
      published: true
    },
    create: {
      slug: CCA_BUNDLE.slug,
      title: CCA_BUNDLE.title,
      description: CCA_BUNDLE.description,
      price: CCA_BUNDLE.price,
      published: true
    }
  });

  // Replace bundle items deterministically: 3 PRACTICE variants in order.
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
