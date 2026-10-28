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
