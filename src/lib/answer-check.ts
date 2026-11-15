/**
 * AI answer-key check (OpenAI gpt-6.1-sol, see QA_MODEL in src/lib/openai.ts).
 *
 * For each question the model independently answers it, says whether it
 * agrees with the stored key and how sure it is, and writes an explanation of
 * the right answer. The result is validated here — never trusted as-is:
 *
 *   ok      the model agrees → the explanation is replaced with the new one
 *   fixed   the model disagrees with HIGH confidence and its answer has the
 *           right shape → key and explanation are replaced; the old ones are
 *           kept in Question.aiCheck.before (and an AdminLog entry)
 *   unsure  it disagrees without high confidence → nothing changes; admins
 *           see the note under the "AI unsure" filter
 *   skipped the reply for that question was unusable → nothing changes
 *
 * Letters follow the STORED option order (A = first option), which is what
 * explanationForDisplay() relabels for each attempt's shuffle. The answer
 * lead ("Suggested answer: B." / "Correct sequence: 3 → 1 → 2.") is written
 * here from the final key, so it can never disagree with it.
 */
import { z } from 'zod';
import { qaStructured } from '@/lib/openai';
import { sequencingSteps } from '@/lib/shuffle';

export type CheckOption = { id: string; text: string };
export type CheckQuestion = {
  id: string;
  type: string;
  stem: string;
  domain: string;
  options: CheckOption[];
  correct: string[];
  references: unknown;
};
export type CheckVerdict = 'ok' | 'fixed' | 'unsure' | 'skipped';
export type CheckResult = {
  verdict: CheckVerdict;
  correct: string[];
  explanation: string | null; // null = keep the stored explanation
  references: { label: string; url: string }[] | null; // null = keep
  note: string;
};
export type CheckContext = { vendor: string; certification: string; examCode: string };

const LETTERS = 'ABCDEFGH';

const ReplySchema = z.object({
  results: z.array(
    z.object({
      ref: z.string(),
      answer: z.array(z.string()),
      agrees_with_key: z.boolean(),
      confidence: z.enum(['high', 'medium', 'low']),
      note: z.string(),
      explanation: z.string(),
      references: z.array(z.object({ label: z.string(), url: z.string() }))
    })
  )
});

const SYSTEM = `You are a senior subject-matter expert checking the answer keys of practice questions for IT certification exams.

For EVERY question:
1. Solve it yourself from first principles and current official documentation. Do not assume the stored key is right.
2. "answer": your answer — option letters (e.g. ["B"], or ["A","D"] for a multiple-select), or for a sequencing question every step number in the correct order (e.g. ["3","1","4","2"]).
3. "agrees_with_key": true when your answer is exactly the stored key.
4. "confidence": "high" only when you are certain and the question is unambiguous; otherwise "medium" or "low".
5. "note": one short sentence — when you disagree, why the stored key is wrong; otherwise empty.
6. "explanation": 60-180 words explaining why YOUR answer is right and why each other option is wrong, referring to options as "Option A", "Option B"… (for sequencing, describe the steps by what they do, never by their step numbers). Do NOT start with "Suggested answer" — that line is added for you.
7. "references": 1-2 official documentation URLs (vendor docs, RFCs, official study guides) that support the answer. Only URLs you are confident exist.

Rules: educational practice material only — never claim any question is from a real exam. Keep each "ref" exactly as given.`;

/** Valid reference links from the stored JSON (strings or {url,label}). */
export function storedReferences(raw: unknown): { label: string; url: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => (typeof r === 'string' ? { url: r, label: r } : r && typeof r.url === 'string' ? { url: r.url, label: r.label || r.url } : null))
    .filter((r): r is { url: string; label: string } => !!r && /^https?:\/\/\S+$/i.test(r.url));
}

function render(q: CheckQuestion, ref: string): string {
  const key =
    q.type === 'ORDERING'
      ? q.correct.map((id) => q.options.findIndex((o) => o.id === id) + 1).join(', ')
      : q.correct.map((id) => LETTERS[q.options.findIndex((o) => o.id === id)] ?? '?').join(', ');
  const opts =
    q.type === 'ORDERING'
      ? q.options.map((o, i) => `  Step ${i + 1}. ${o.text}`).join('\n')
      : q.options.map((o, i) => `  ${LETTERS[i]}. ${o.text}`).join('\n');
  const kind =
    q.type === 'MULTI'
      ? `multiple select (choose ${q.correct.length})`
      : q.type === 'ORDERING'
        ? 'sequencing (order every step)'
        : q.type === 'TRUE_FALSE'
          ? 'true/false'
          : 'single answer';
  return `### ${ref}\nType: ${kind}\nExam domain: ${q.domain}\nQuestion:\n${q.stem}\nOptions:\n${opts}\nStored key: ${key}`;
}

/** The model's letters / step numbers as option ids, or null if malformed. */
function toIds(q: CheckQuestion, answer: string[]): string[] | null {
  const ids: string[] = [];
  for (const raw of answer) {
    const a = raw.trim().replace(/^(option|step)\s+/i, '').replace(/[.)]$/, '').toUpperCase();
    const idx = q.type === 'ORDERING' ? Number(a) - 1 : LETTERS.indexOf(a);
    if (!Number.isInteger(idx) || idx < 0 || idx >= q.options.length || a.length === 0) return null;
    ids.push(q.options[idx].id);
  }
  if (new Set(ids).size !== ids.length || !ids.length) return null;
  if (q.type === 'ORDERING') return ids.length === q.options.length ? ids : null;
  return q.type === 'SINGLE' || q.type === 'TRUE_FALSE' ? (ids.length === 1 ? ids : null) : ids;
}

const sameKey = (q: CheckQuestion, a: string[], b: string[]) =>
  q.type === 'ORDERING' ? a.length === b.length && a.every((x, i) => x === b[i]) : a.length === b.length && a.every((x) => b.includes(x));

/** "Suggested answer: B." — letters by stored position; True/False by its text. */
export function answerLead(q: Pick<CheckQuestion, 'id' | 'type' | 'options'>, correct: string[]): string {
  if (q.type === 'ORDERING') {
    // Step numbers as learners see them (sequencingSteps' fixed order).
    const shown = sequencingSteps(q.options, correct, q.id);
    return `Correct sequence: ${correct.map((id) => shown.findIndex((o) => o.id === id) + 1).join(' → ')}.`;
  }
  if (q.type === 'TRUE_FALSE') return `Suggested answer: ${q.options.find((o) => o.id === correct[0])?.text ?? ''}.`;
  const letters = correct
    .map((id) => q.options.findIndex((o) => o.id === id))
    .sort((a, b) => a - b)
    .map((i) => LETTERS[i]);
  return `Suggested answer: ${letters.length > 1 ? `${letters.slice(0, -1).join(', ')} and ${letters.at(-1)}` : letters[0]}.`;
}

function body(text: string): string {
  return text
    .trim()
    .replace(/^(suggested|correct)\s+(answer|sequence)s?\s*(is|are)?\s*[:\-–—]?\s*[^.\n]*[.\n]\s*/i, '')
    .trim();
}

/**
 * Check one batch of questions from the same exam (≤ 10). Returns one result
 * per question id, plus the "openai:<model>" tag. Throws only when the API
 * call itself fails.
 */
export async function checkAnswerKeys(
  questions: CheckQuestion[],
  ctx: CheckContext
): Promise<{ results: Map<string, CheckResult>; generatedBy: string }> {
  const refs = questions.map((_, i) => `Q${i + 1}`);
  const input = `Certification: ${ctx.vendor} ${ctx.certification} (${ctx.examCode})\n\n${questions.map((q, i) => render(q, refs[i])).join('\n\n')}`;
  const { data, generatedBy } = await qaStructured({ schema: ReplySchema, name: 'answer_key_check', instructions: SYSTEM, input });
  const byRef = new Map(data.results.map((r) => [r.ref.trim(), r]));
  const results = new Map<string, CheckResult>();
  questions.forEach((q, i) => {
    const r = byRef.get(refs[i]);
    const keep: CheckResult = { verdict: 'skipped', correct: q.correct, explanation: null, references: null, note: 'no usable reply' };
    if (!r) return results.set(q.id, keep);
    const ids = toIds(q, r.answer);
    const text = body(r.explanation);
    if (!ids || text.length < 40) return results.set(q.id, { ...keep, note: 'reply had the wrong shape' });
    const stored = storedReferences(q.references);
    const fresh = r.references.filter((x) => /^https:\/\/\S+$/i.test(x.url.trim())).map((x) => ({ label: x.label.trim() || x.url.trim(), url: x.url.trim() }));
    const references = stored.length ? null : fresh.length ? fresh : null;
    if (sameKey(q, ids, q.correct)) {
      return results.set(q.id, { verdict: 'ok', correct: q.correct, explanation: `${answerLead(q, q.correct)} ${text}`, references, note: '' });
    }
    // A multiple-select's stem says how many to pick; a fix may not change that.
    const sameCount = q.type !== 'MULTI' || ids.length === q.correct.length;
    if (r.confidence === 'high' && sameCount) {
      return results.set(q.id, {
        verdict: 'fixed',
        correct: ids,
        explanation: `${answerLead(q, ids)} ${text}`,
        references,
        note: r.note.trim().slice(0, 500)
      });
    }
    return results.set(q.id, {
      verdict: 'unsure',
      correct: q.correct,
      explanation: null,
      references: null,
      note: `AI answered ${r.answer.join(', ')} (${r.confidence} confidence)${sameCount ? '' : ', a different number of answers'}: ${r.note.trim()}`.slice(0, 500)
    });
  });
  return { results, generatedBy };
}
