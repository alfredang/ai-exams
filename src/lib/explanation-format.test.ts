import assert from 'node:assert/strict';
import test from 'node:test';
import { explanationForDisplay, explanationParagraphs, isAnswerLead, relabelOptionLetters, splitSentences, stripFileSources } from './explanation-format';
import { optionsForAttempt } from './shuffle';

const authored = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
// The learner sees authored C as B, A as C, B as A, D stays D.
const shown = [{ id: 'b' }, { id: 'c' }, { id: 'a' }, { id: 'd' }];

const CCAR = 'Suggested answer: C. The evaluation results demonstrate prompt interference: improving attention to business-logic examples reduces performance on API design. Option C isolates the competing objectives so each model call can apply focused terminology, examples, evidence requirements, and evaluation criteria. The resulting structured findings can then be merged, deduplicated, and ranked before being posted. Anthropic’s Building Effective AI Agents describes parallelization through sectioning, where independent aspects of a task are handled by separate model calls and subsequently aggregated. This pattern is appropriate when one prompt must evaluate several distinct considerations and a single call does not handle all of them reliably. Option A increases context volume without resolving competition between the review objectives; irrelevant repository content may further dilute attention. Option B may improve known quiz-scoring cases but can overfit the reviewer to an incomplete checklist and does not restore API-design recall. Option D assumes that additional model capability will eliminate prompt interference without supporting evaluation evidence.';

test('the suggested answer and every option reference follow the shown order', () => {
  const out = relabelOptionLetters(CCAR, authored, shown);
  assert.match(out, /^Suggested answer: B\./);
  assert.match(out, /Option B isolates the competing objectives/);
  assert.match(out, /Option C increases context volume/);
  assert.match(out, /Option A may improve known quiz-scoring/);
  assert.match(out, /Option D assumes/);
});

test('letter lists, parentheses and lower-case keywords are remapped; articles are not', () => {
  assert.equal(relabelOptionLetters('Options A and C are wrong.', authored, shown), 'Options A and C are wrong.'.replace('A and C', 'B and C'));
  assert.equal(relabelOptionLetters('Choose option (C) here.', authored, shown), 'Choose option (B) here.');
  assert.equal(relabelOptionLetters('The correct answer is C.', authored, shown), 'The correct answer is B.');
  assert.equal(relabelOptionLetters('Answer: A well-designed pipeline wins.', authored, shown), 'Answer: A well-designed pipeline wins.');
  assert.equal(relabelOptionLetters('There are choices a developer can make.', authored, shown), 'There are choices a developer can make.');
  assert.equal(relabelOptionLetters('Use Option CI pipelines.', authored, shown), 'Use Option CI pipelines.');
});

test('identical order, mismatched lists and sequencing leave the text alone', () => {
  assert.equal(relabelOptionLetters(CCAR, authored, authored), CCAR);
  assert.equal(relabelOptionLetters(CCAR, authored, shown.slice(0, 3)), CCAR);
  assert.equal(explanationForDisplay('Option A first.', 'ORDERING', authored, shown), 'Option A first.');
});

test('relabelling agrees with the real per-attempt shuffle', () => {
  const opts = ['a', 'b', 'c', 'd'].map((id) => ({ id, text: id }));
  const seen = optionsForAttempt(opts, 'SINGLE', ['c'], 'attempt-1', 'q-1', 1);
  const letter = 'ABCD'[seen.findIndex((o) => o.id === 'c')];
  assert.equal(explanationForDisplay('Suggested answer: C.', 'SINGLE', opts, seen), `Suggested answer: ${letter}.`);
});

test('a long single-block explanation becomes paragraphs', () => {
  const paras = explanationParagraphs(relabelOptionLetters(CCAR, authored, shown));
  assert.equal(paras[0], 'Suggested answer: B.');
  assert.ok(isAnswerLead(paras[0]));
  assert.ok(paras.length >= 5, `expected ≥5 paragraphs, got ${paras.length}`);
  assert.ok(paras.some((p) => p.startsWith('Option C increases')));
  assert.ok(paras.some((p) => p.startsWith('Option A may improve')));
  assert.ok(paras.some((p) => p.startsWith('Option D assumes')));
  // Nothing is lost or reordered.
  assert.equal(paras.join(' '), relabelOptionLetters(CCAR, authored, shown));
});

test('authored line breaks win and abbreviations do not split sentences', () => {
  assert.deepEqual(explanationParagraphs('First.\n\nSecond line.'), ['First.', 'Second line.']);
  assert.deepEqual(splitSentences('Use a queue, e.g. SQS. Then scale.'), ['Use a queue, e.g. SQS.', 'Then scale.']);
  assert.deepEqual(explanationParagraphs(''), []);
});

test('the second CCAR-F report: letters follow the shown order and the file source is hidden', () => {
  const text = 'Suggested answer: B. The prompt suppresses findings. Option B separates detection from filtering. Option A leaves the instruction intact. Option C discards the classification. Option D repeats the same policy. Option B preserves recall. Source: CCAR-F_passquestion.pdf, question 48.';
  // Shown A, D, B, C = authored A, C, D, B.
  const seen = [{ id: 'a' }, { id: 'c' }, { id: 'd' }, { id: 'b' }];
  const out = explanationForDisplay(text, 'SINGLE', authored, seen);
  assert.match(out, /^Suggested answer: D\./);
  assert.match(out, /Option D separates/);
  assert.match(out, /Option A leaves/);
  assert.match(out, /Option B discards/);
  assert.match(out, /Option C repeats/);
  assert.match(out, /Option D preserves recall\.$/);
  assert.doesNotMatch(out, /passquestion|Source:/);
});

test('file citations are removed but web sources stay', () => {
  assert.equal(stripFileSources('Use sectioning. Source: notes.docx.'), 'Use sectioning.');
  assert.equal(stripFileSources('Use sectioning. Source: bank.pdf (question 12)'), 'Use sectioning.');
  assert.equal(stripFileSources('Use sectioning. Source: https://docs.anthropic.com/x.pdf'), 'Use sectioning. Source: https://docs.anthropic.com/x.pdf');
  assert.equal(explanationForDisplay('Step 2 first. Source: seq.pdf, question 3.', 'ORDERING', authored, shown), 'Step 2 first.');
});
