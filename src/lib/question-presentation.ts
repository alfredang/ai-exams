type QuestionShape = { type: string; stem: string; options: unknown };

/** Numbered steps with permutation choices are sequencing MCQs. Their stored
 * type stays SINGLE so existing option ids, responses and scoring stay valid.
 */
export function isSequencingChoice(question: QuestionShape): boolean {
  if (question.type !== 'SINGLE' || !Array.isArray(question.options)) return false;
  const steps = [...question.stem.matchAll(/\((\d+)\)/g)].map((m) => Number(m[1]));
  if (steps.length < 3 || !steps.every((n, i) => n === i + 1) || question.options.length < 3) return false;
  return question.options.every((option: unknown) => {
    if (!option || typeof option !== 'object' || !('text' in option) || typeof option.text !== 'string') return false;
    if (!/^\s*\d+(?:\s*(?:,|→|->)\s*\d+)+\s*$/.test(option.text)) return false;
    const order = option.text.match(/\d+/g)!.map(Number).sort((a, b) => a - b);
    return order.length === steps.length && order.every((n, i) => n === steps[i]);
  });
}

/** Presentation category for bank filters and labels; never use for scoring. */
export function questionPresentationType(question: QuestionShape): string {
  return isSequencingChoice(question) ? 'ORDERING' : question.type;
}

/** Question-bank list filters (?domain=&qstatus=&qtype=); '' means any. */
export type QuestionListFilter = { domain: string; status: string; type: string };

export const QUESTION_STATUS_FILTERS = ['PUBLISHED', 'DRAFT', 'ARCHIVED'];
export const QUESTION_TYPE_FILTERS = ['SINGLE', 'MULTI', 'TRUE_FALSE', 'ORDERING', 'HOTSPOT'];

/** Admin label for a question status: ARCHIVED reads "Unpublished". */
export const QUESTION_STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Awaiting review',
  ARCHIVED: 'Unpublished'
};

/** Shared by the question list and its "select all matching" bulk action. */
export function matchesQuestionFilter(question: QuestionShape & { domain: string; status: string }, f: QuestionListFilter): boolean {
  return (!f.domain || question.domain === f.domain)
    && (!f.status || question.status === f.status)
    && (!f.type || questionPresentationType(question) === f.type);
}
