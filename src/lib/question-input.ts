/**
 * Validation for a question authored in the admin (manual add / edit).
 * Pure — imported by the client form for instant feedback and by the server
 * actions, which are authoritative.
 *
 * Shapes match the rest of the app: `options` is [{id, text}], `correct` is
 * the list of correct option ids. SEQUENCING (ORDERING) steps are entered in
 * the correct order, so `correct` is the step ids in the order given.
 */
export type QuestionKind = 'SINGLE' | 'MULTI' | 'TRUE_FALSE' | 'ORDERING';

export type QuestionInput = {
  type: QuestionKind;
  domain: string;
  difficulty: number;
  stem: string;
  options: { id: string; text: string }[];
  correct: string[];
  explanation: string;
  /** One per line: "https://…" or "Label | https://…". */
  references: string;
};

export type CleanQuestion = Omit<QuestionInput, 'references'> & { references: { label: string; url: string }[] };

export const KIND_LABELS: Record<QuestionKind, string> = {
  SINGLE: 'MCQ (one answer)',
  MULTI: 'Multiple select',
  TRUE_FALSE: 'True / False',
  ORDERING: 'Sequencing'
};

export const TRUE_FALSE_OPTIONS = [
  { id: 'a', text: 'True' },
  { id: 'b', text: 'False' }
];

export function parseReferences(text: string): { refs: { label: string; url: string }[]; bad: string[] } {
  const refs: { label: string; url: string }[] = [];
  const bad: string[] = [];
  for (const line of text.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const [a, b] = line.includes(' | ') ? line.split(' | ', 2) : ['', line];
    const url = b.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) bad.push(line);
    else refs.push({ label: a.trim() || url, url });
  }
  return { refs, bad };
}

/** Returns the cleaned question, or a message describing the first problem. */
export function validateQuestion(input: QuestionInput): { ok: true; value: CleanQuestion } | { ok: false; error: string } {
  const fail = (error: string) => ({ ok: false as const, error });
  const stem = input.stem.trim();
  const explanation = input.explanation.trim();
  const domain = input.domain.trim();
  if (!['SINGLE', 'MULTI', 'TRUE_FALSE', 'ORDERING'].includes(input.type)) return fail('Pick a question type.');
  if (!domain) return fail('Pick the exam domain this question covers.');
  if (stem.length < 10) return fail('Write the question (at least 10 characters).');

  const options = input.type === 'TRUE_FALSE'
    ? TRUE_FALSE_OPTIONS
    : input.options.map((o) => ({ id: o.id, text: o.text.trim() })).filter((o) => o.text);
  const ids = options.map((o) => o.id);
  if (new Set(ids).size !== ids.length) return fail('Two options share an id — reload the form and try again.');
  const texts = options.map((o) => o.text.toLowerCase());
  if (new Set(texts).size !== texts.length) return fail('Two options have the same text.');

  let correct: string[];
  if (input.type === 'ORDERING') {
    if (options.length < 3) return fail('A sequencing question needs at least 3 steps.');
    correct = ids; // steps are entered in the correct order
  } else {
    correct = [...new Set(input.correct)].filter((c) => ids.includes(c));
    if (input.type === 'SINGLE') {
      if (options.length < 3) return fail('An MCQ needs at least 3 options.');
      if (correct.length !== 1) return fail('Mark the one correct answer.');
    } else if (input.type === 'MULTI') {
      if (options.length < 4) return fail('A multiple-select question needs at least 4 options.');
      if (correct.length < 2) return fail('Mark at least 2 correct answers (use MCQ for a single answer).');
      if (correct.length >= options.length) return fail('At least one option must be wrong.');
    } else if (correct.length !== 1) {
      return fail('Choose whether the statement is True or False.');
    }
  }

  if (explanation.length < 10) return fail('Explain why the answer is correct (at least 10 characters).');
  const { refs, bad } = parseReferences(input.references);
  if (bad.length) return fail(`Reference is not a full http(s) URL: ${bad[0]}`);
  const difficulty = Math.max(1, Math.min(5, Math.round(Number(input.difficulty)) || 3));
  return { ok: true, value: { type: input.type, domain, difficulty, stem, options, correct, explanation, references: refs } };
}
