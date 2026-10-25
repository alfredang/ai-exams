/**
 * Bulk AI question generation for a question bank (OpenAI, Responses API).
 *
 * The admin picks a total and a set of exam domains; `planDomainCounts()`
 * splits the total by blueprint weight, and `generateDomainBatch()` asks the
 * model for one domain's batch at a time. Every question is validated here
 * before it is saved — the model's output is never trusted as-is.
 */
import { z } from 'zod';
import { aiStructuredWithMeta } from '@/lib/openai';
import { planAllocation, type BlueprintDomain } from '@/lib/question-pool';

/** Question kinds the generator can write. An empty selection means all of them. */
export type GenKind = 'SINGLE' | 'MULTI' | 'ORDERING' | 'TRUE_FALSE';
export const GEN_KINDS: GenKind[] = ['SINGLE', 'MULTI', 'ORDERING', 'TRUE_FALSE'];

export type ValidQuestion = {
  stem: string;
  type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE' | 'ORDERING';
  options: { id: string; text: string }[];
  correct: string[];
  explanation: string;
  difficulty: number;
  references: { label: string; url: string }[];
};

// Structured-output shape (no min/max — those are checked in validate()).
const BatchSchema = z.object({
  questions: z.array(
    z.object({
      stem: z.string(),
      type: z.enum(['SINGLE', 'MULTI', 'TRUE_FALSE', 'ORDERING']),
      options: z.array(z.object({ id: z.string(), text: z.string() })),
      correct: z.array(z.string()),
      explanation: z.string(),
      difficulty: z.number().int(),
      references: z.array(z.object({ label: z.string(), url: z.string() }))
    })
  )
});

// Keep the original rules from the Claude generator: original questions only,
// never real-exam claims, always official reference URLs.
const SYSTEM = `You are an expert practice-exam author for industry IT certifications.

Rules — these are non-negotiable:
- Produce ORIGINAL questions for educational use only.
- NEVER reproduce real exam questions or claim to be official dumps.
- Every question gets a clear explanation and at least one reference URL pointing to official vendor documentation (Microsoft Learn, AWS docs, Anthropic docs, Google Cloud docs, RFCs, vendor study guide, etc).
- Single-answer questions (SINGLE) have 4 options and exactly one correct option.
- Multi-answer questions (MULTI) have 2-3 correct options of 5-6 total options, and the stem says how many to select (e.g. "Select TWO.").
- TRUE_FALSE questions have exactly two options, {"id":"a","text":"True"} and {"id":"b","text":"False"}, and one correct option.
- Option ids are lowercase letters in order: a, b, c, d, e, f. "correct" lists the ids of the correct options.
- Sequencing questions (ORDERING) ask the candidate to put 4-6 steps of a real procedure in the correct order. The stem ends with "Arrange the steps in the correct order." Step ids are "1", "2", "3"… in the order the steps are LISTED, and the steps are listed SHUFFLED (never already in the correct order). "correct" lists EVERY step id in the correct sequence, e.g. ["3","1","4","2"].
- The explanation says why the correct answer is right and why each distractor is wrong. For ORDERING it leads with the correct sequence by step number (e.g. "Correct sequence: 3 → 1 → 4 → 2.") and explains why each step comes where it does.
- Scenario-based stems that test applied understanding beat recall of trivia. Vary the correct option's position.
- difficulty is an integer 1-5.`;

/** The prompt's type instruction for the admin's selection (empty = all types). */
function typeHint(kinds: GenKind[]): string {
  if (!kinds.length) return 'A mix: mostly SINGLE, about 1 in 5 MULTI, and about 1 in 10 ORDERING where the domain has a real step-by-step procedure.';
  if (kinds.length === 1) return `All questions are ${kinds[0]}.`;
  return `Only these types, mixed roughly evenly: ${kinds.join(', ')}.`;
}

/** Split `total` across the chosen domains by blueprint weight (largest remainder). */
export function planDomainCounts(domains: BlueprintDomain[], total: number): Record<string, number> {
  // Equal weights when the blueprint has none, so every chosen domain gets a share.
  const weighted = domains.some((d) => d.weight > 0) ? domains : domains.map((d) => ({ ...d, weight: 1 }));
  const unlimited = Object.fromEntries(weighted.map((d) => [d.name, total]));
  return planAllocation(weighted, unlimited, total);
}

export function validate(q: z.infer<typeof BatchSchema>['questions'][number]): ValidQuestion | string {
  const stem = q.stem.trim();
  const explanation = q.explanation.trim();
  if (stem.length < 10) return 'stem too short';
  if (explanation.length < 10) return 'explanation too short';
  const options = q.options.map((o) => ({ id: o.id.trim().toLowerCase(), text: o.text.trim() })).filter((o) => o.text);
  const ids = options.map((o) => o.id);
  if (new Set(ids).size !== ids.length) return 'duplicate option ids';
  const correct = [...new Set(q.correct.map((c) => c.trim().toLowerCase()))];
  if (!correct.length || correct.some((c) => !ids.includes(c))) return 'correct answer not among the options';
  if (q.type === 'TRUE_FALSE' && (options.length !== 2 || correct.length !== 1)) return 'bad true/false shape';
  if (q.type === 'SINGLE' && (options.length < 3 || options.length > 6 || correct.length !== 1)) return 'bad single-answer shape';
  if (q.type === 'MULTI' && (options.length < 4 || options.length > 6 || correct.length < 2 || correct.length >= options.length)) return 'bad multi-answer shape';
  if (q.type === 'ORDERING') {
    // Steps '1'…'N' as listed; correct = every step, once, in the right order.
    if (options.length < 3 || options.length > 8) return 'bad sequencing shape';
    if (ids.some((id, i) => id !== String(i + 1))) return 'sequencing step ids must be 1…N';
    if (correct.length !== options.length) return 'sequencing answer must order every step';
  }
  const references = q.references.filter((r) => /^https?:\/\/\S+$/i.test(r.url.trim())).map((r) => ({ label: r.label.trim() || r.url.trim(), url: r.url.trim() }));
  return {
    stem,
    type: q.type,
    options,
    correct,
    explanation,
    difficulty: Math.max(1, Math.min(5, Math.round(q.difficulty) || 3)),
    references
  };
}

export async function generateDomainBatch(input: {
  vendor: string;
  certification: string;
  examCode: string;
  blueprint: BlueprintDomain[];
  domain: string;
  count: number;
  /** Allowed question kinds; empty = all. */
  types: GenKind[];
  /** Stems already in this domain, so the model avoids repeating them. */
  avoid: string[];
}): Promise<{ questions: ValidQuestion[]; rejected: string[]; generatedBy: string }> {
  const blueprint = input.blueprint.length
    ? `Full exam blueprint (for context):\n${input.blueprint.map((d) => `- ${d.name}: ${d.weight}%`).join('\n')}\n\n`
    : '';
  const avoid = input.avoid.length
    ? `Questions already in the pool for this domain — do NOT repeat or paraphrase them; cover other objectives:\n${input.avoid.map((s) => `- ${s.slice(0, 160)}`).join('\n')}\n\n`
    : '';
  const prompt = `Write exactly ${input.count} practice questions.

Vendor: ${input.vendor}
Certification: ${input.certification}
Exam code: ${input.examCode}
Exam domain for EVERY question: ${input.domain}
Question types: ${typeHint(input.types)}

${blueprint}${avoid}`;
  const { data: out, provider, model } = await aiStructuredWithMeta({ schema: BatchSchema, name: 'practice_questions', instructions: SYSTEM, input: prompt });
  const questions: ValidQuestion[] = [];
  const rejected: string[] = [];
  for (const q of out.questions.slice(0, input.count)) {
    if (input.types.length && !input.types.includes(q.type)) {
      rejected.push(`wrong type ${q.type}`);
      continue;
    }
    const v = validate(q);
    if (typeof v === 'string') rejected.push(v);
    else questions.push(v);
  }
  return { questions, rejected, generatedBy: `${provider}:${model}` };
}
