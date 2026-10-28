import assert from 'node:assert/strict';
import test from 'node:test';
import { isSequencingChoice, questionPresentationType } from './question-presentation';
import { CCAO_POOL } from './seed/ccao-foundations-pool-questions';
import { CCAO_MOCK3 } from './seed/ccao-foundations-mock-questions';

const sequence = {
  type: 'SINGLE',
  stem: 'Which order?\n\n(1) Share the reviewed output.\n\n(2) Draft it.\n\n(3) Review the draft.',
  options: ['2, 3, 1', '3, 2, 1', '1, 2, 3', '2, 1, 3'].map((text, i) => ({ id: String(i), text }))
};

test('single-answer sequencing is discoverable without changing its scoring type', () => {
  const original = structuredClone(sequence);
  assert.equal(isSequencingChoice(sequence), true);
  assert.equal(questionPresentationType(sequence), 'ORDERING');
  assert.deepEqual(sequence, original);
  assert.equal(questionPresentationType({ ...sequence, type: 'ORDERING' }), 'ORDERING');
});

test('ordinary MCQs, numeric answers and malformed permutations stay outside sequencing', () => {
  for (const question of [
    { ...sequence, stem: 'Which number is largest?' },
    { ...sequence, options: [{ text: 'First draft it' }, { text: 'Share it' }, { text: 'Review it' }] },
    { ...sequence, options: [{ text: '1' }, { text: '2' }, { text: '3' }] },
    { ...sequence, options: [...sequence.options.slice(0, 3), { text: '2, 2, 1' }] },
    { ...sequence, type: 'MULTI' },
    { ...sequence, options: null }
  ]) assert.equal(isSequencingChoice(question), false);
});

test('all ten source CCAO-F sequencing MCQs have valid choices and matching keys', () => {
  const questions = [...CCAO_POOL, ...CCAO_MOCK3].filter((q) => q.stem.includes('(1)'));
  assert.equal(questions.length, 10);
  for (const q of questions) {
    assert.equal(questionPresentationType(q), 'ORDERING');
    assert.equal(q.type, 'SINGLE');
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options.map((o) => o.text)).size, 4);
    assert.equal(q.correct.length, 1);
    const chosen = q.options.find((o) => o.id === q.correct[0]);
    assert.ok(chosen);
    const keyed = q.explanation.match(/Correct sequence: ([\d →]+)\./);
    if (keyed) assert.equal(chosen.text, keyed[1].split(' → ').join(', '));
  }
});
