/**
 * Explanation text helpers shared by the runner (via the answer APIs), the
 * results page, the results PDF and the mobile API.
 *
 * 1. Option letters. Authors write explanations against the AUTHORED option
 *    order ("Suggested answer: C … Option A …"), but every attempt shows the
 *    options in a per-attempt shuffle (`optionsForAttempt`). Without
 *    relabelling, the explanation names a different letter from the one marked
 *    "Correct answer". `relabelOptionLetters()` rewrites letter references so
 *    they point at the letters the taker actually sees.
 *
 * 2. Paragraphs. Most explanations are stored as one long run of sentences.
 *    `explanationParagraphs()` splits them into readable paragraphs: the
 *    "Suggested answer: X." lead on its own, a new paragraph for each
 *    "Option X …" discussion, and long runs broken every few sentences.
 *
 * Pure (no React, no Prisma) so it can run on the server and in the client.
 */

const LETTERS = 'ABCDEFGH';
const L = `[${LETTERS}]`;
// Keywords match "Option" or "option" but the patterns stay case-SENSITIVE so
// option letters are only ever capitals — with /i, "choices a developer…"
// would read the article "a" as option A.
const w = (word: string) => `[${word[0].toUpperCase()}${word[0]}]${word.slice(1)}`;
const OPTIONS_WORD = `(?:${w('options')}|${w('option')}|${w('choices')}|${w('choice')})`;
const ANSWER_WORD = `(?:(?:${w('suggested')}|${w('correct')}|${w('best')}|${w('right')})\\s+)?(?:${w('answers')}|${w('answer')}|${w('options')}|${w('option')})`;

type WithId = { id: string };

// A letter, optionally in parentheses: "C" or "(C)". Not followed by a word
// character, so "Option CI/CD" or "Answer: An" never match.
const LETTER_TOKEN = `\\(?${L}\\)?(?![A-Za-z0-9])`;
// More letters in a list: "A and C", "A, B, and D", "A/C", "A or option C".
const LETTER_LIST = `${LETTER_TOKEN}(?:\\s*(?:,\\s*(?:and\\s+|or\\s+)?|\\/|\\s+(?:and|or|&)\\s+)(?:options?\\s+)?${LETTER_TOKEN})*`;

// "Option C", "options A and D", "Choice B" — unambiguous, a letter after
// these words is always an option label.
const OPTION_REF = new RegExp(`\\b(${OPTIONS_WORD}\\s+)(${LETTER_LIST})`, 'g');
// "Suggested answer: C", "Correct answer is B", "Answer: A." — an article
// ("Answer: A well-designed …") is excluded by requiring the letter list to
// end the clause.
const ANSWER_REF = new RegExp(
  `\\b(${ANSWER_WORD}(?:\\s+is|\\s+are)?\\s*[:\\-–—]?\\s*)(${LETTER_LIST})(?=\\s*(?:[.,;:)\\]—–]|-\\s|$|\\s+(?:and|or|is|are|because|since|as)\\b))`,
  'g'
);

function remapList(list: string, map: Map<string, string>): string {
  // Letter tokens in the list, mapped, then re-sorted so a set reads
  // "A and C" rather than "C and A". Separators keep their positions.
  const tokens = [...list.matchAll(new RegExp(`(?<![A-Za-z0-9])${L}(?![A-Za-z0-9])`, 'g'))];
  if (!tokens.length) return list;
  const mapped = tokens.map((t) => map.get(t[0]) ?? t[0]);
  const sorted = tokens.length > 1 ? [...mapped].sort() : mapped;
  let out = '';
  let last = 0;
  tokens.forEach((t, i) => {
    out += list.slice(last, t.index) + sorted[i];
    last = t.index! + 1;
  });
  return out + list.slice(last);
}

/**
 * Rewrite option-letter references written against `authored` order so they
 * match the `shown` order. Returns the text unchanged when the orders agree
 * or when the two lists don't hold the same options.
 */
export function relabelOptionLetters(text: string, authored: readonly WithId[], shown: readonly WithId[]): string {
  if (!text || authored.length !== shown.length || authored.length < 2) return text;
  if (authored.every((o, i) => o.id === shown[i].id)) return text;
  const shownIndex = new Map(shown.map((o, i) => [o.id, i]));
  const map = new Map<string, string>();
  authored.forEach((o, i) => {
    const j = shownIndex.get(o.id);
    if (j !== undefined && i < LETTERS.length && j < LETTERS.length) map.set(LETTERS[i], LETTERS[j]);
  });
  if (map.size !== authored.length) return text;

  // One pass per pattern; each match is remapped exactly once because the
  // second pattern skips text the first already rewrote (tracked by offsets).
  const done: [number, number][] = [];
  let out = text.replace(OPTION_REF, (m, lead: string, list: string, offset: number) => {
    done.push([offset, offset + m.length]);
    return lead + remapList(list, map);
  });
  // OPTION_REF never changes string length (one letter → one letter), so the
  // offsets recorded above still hold for the second pass.
  out = out.replace(ANSWER_REF, (m, lead: string, list: string, offset: number) => {
    const listStart = offset + lead.length;
    if (done.some(([s, e]) => listStart >= s && listStart < e)) return m;
    return lead + remapList(list, map);
  });
  return out;
}

// "Source: CCAR-F_passquestion.pdf, question 48." — an authoring note naming
// a local file. It means nothing to a learner and must never be shown; web
// sources (URLs) are kept.
const FILE_SOURCE = /\s*\b(?:Sources?|Ref(?:erence)?s?|From)\s*:\s*[^\s:/]+\.(?:pdf|docx?|pptx?|xlsx?|txt|csv|md|json)\b(?:\s*[,;(-]?\s*(?:question|q\.?|item|no\.?)\s*#?\s*\d+\)?)?\.?/gi;

export function stripFileSources(text: string): string {
  return text.replace(FILE_SOURCE, '').replace(/[ \t]{2,}/g, ' ').trim();
}

/** Explanation text for an attempt: internal file citations removed and option
 * letters matching the shown order. */
export function explanationForDisplay(
  text: string | null | undefined,
  type: string,
  authored: readonly WithId[],
  shown: readonly WithId[]
): string {
  if (!text) return text ?? '';
  const clean = stripFileSources(text);
  // Sequencing steps are numbered, never lettered.
  if (type === 'ORDERING') return clean;
  return relabelOptionLetters(clean, authored, shown);
}

// ---------------------------------------------------------------------------
// Paragraphs

const ABBREVIATIONS = /(?:\be\.g|\bi\.e|\bvs|\betc|\bcf|\bapprox|\bincl|\bfig|\bno|\bmr|\bms|\bdr|\bst|\binc|\bltd|\bu\.s)\.$/i;

/** Split prose into sentences on ". " / "? " / "! " before a capital, digit or quote. */
export function splitSentences(text: string): string[] {
  const s = text.replace(/\s+/g, ' ').trim();
  if (!s) return [];
  const out: string[] = [];
  const re = /[.!?]["'”’)\]]?\s+(?=["'“‘(]?[A-Z0-9])/g;
  let start = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const end = m.index + m[0].trimEnd().length;
    const candidate = s.slice(start, end);
    if (ABBREVIATIONS.test(candidate)) continue;
    out.push(candidate.trim());
    start = m.index + m[0].length;
  }
  const rest = s.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

const LEAD_SENTENCE = new RegExp(
  `^${ANSWER_WORD}(?:\\s+is|\\s+are)?\\s*[:\\-–—]?\\s*${LETTER_LIST}\\s*\\.?$`
);
const NEW_TOPIC_OPTION = new RegExp(`^["'“(]?${OPTIONS_WORD}\\s+${LETTER_TOKEN}`);
const NEW_TOPIC_WORDS = /^["'“(]?(?:incorrect\b|why not\b|why the others\b|the other (?:options|choices)\b|other options\b|the remaining\b|by contrast\b|in contrast\b|distractors?\b|references?:|sources?:|exam tip\b|tip:|key takeaway\b|remember\b)/i;
const NEW_TOPIC = { test: (s: string) => NEW_TOPIC_OPTION.test(s) || NEW_TOPIC_WORDS.test(s) };

/** True when a paragraph is the bare "Suggested answer: B." lead line. */
export function isAnswerLead(paragraph: string): boolean {
  return LEAD_SENTENCE.test(paragraph.trim());
}

const MAX_SENTENCES = 3;
const MAX_CHARS = 420;

/**
 * Break an explanation into paragraphs. Authored line breaks win; otherwise
 * the text is split by sentence: the answer lead stands alone, each
 * "Option X …" discussion starts a paragraph, and long runs break after
 * three sentences or ~420 characters.
 */
export function explanationParagraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  const trimmed = text.trim();
  if (/\n/.test(trimmed)) {
    return trimmed.split(/\n\s*\n|\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  }
  const sentences = splitSentences(trimmed);
  const paras: string[][] = [];
  let current: string[] = [];
  const flush = () => { if (current.length) paras.push(current); current = []; };
  sentences.forEach((sentence, i) => {
    if (i === 0 && isAnswerLead(sentence)) {
      paras.push([sentence]);
      return;
    }
    const length = current.join(' ').length;
    if (current.length && (NEW_TOPIC.test(sentence) || current.length >= MAX_SENTENCES || length >= MAX_CHARS)) flush();
    current.push(sentence);
  });
  flush();
  return paras.map((p) => p.join(' '));
}
