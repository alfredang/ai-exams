import assert from 'node:assert/strict';
import test from 'node:test';
import { optionsForAttempt, sequencingSteps, shuffleSeeded } from './shuffle';
import { isAnswerCorrect } from './attempts';

const options = ['a', 'b', 'c', 'd'].map(id => ({ id, text: `Choice ${id}` }));
const ids = (rows: { id: string }[]) => rows.map(o => o.id);

for (const type of ['SINGLE', 'MULTI', 'TRUE_FALSE', 'ORDERING']) {
  test(`${type}: stable on resume, varied across retakes, ids score correctly`, () => {
    const choices = type === 'TRUE_FALSE' ? options.slice(0, 2) : options;
    const correct = type === 'MULTI' ? ['b', 'd'] : type === 'ORDERING' ? ['d', 'c', 'b', 'a'] : ['b'];
    const original = structuredClone(choices);
    const orders = new Set<string>();
    const positions = new Set<number>();
    for (let n = 0; n < 40; n++) {
      const attempt = `retake-${n}`;
      const shown = optionsForAttempt(choices, type, correct, attempt, 'shared-question', 1);
      assert.deepEqual(shown, optionsForAttempt(choices, type, correct, attempt, 'shared-question', 1));
      assert.deepEqual([...ids(shown)].sort(), ids(choices).sort());
      orders.add(ids(shown).join(','));
      positions.add(shown.findIndex(o => o.id === correct[0]));
      assert.equal(isAnswerCorrect({ type: type as any, correct }, correct), true);
      assert.equal(isAnswerCorrect({ type: type as any, correct }, ['missing']), false);
      if (type === 'ORDERING') assert.notDeepEqual(ids(shown), correct);
    }
    assert.ok(orders.size > 1, 'retakes must not use a fixed option layout');
    assert.ok(positions.size > 1, 'the same correct option can move positions');
    assert.deepEqual(choices, original, 'shuffling must not modify the question pool');
  });
}

test('historical web attempts preserve every previous layout', () => {
  for (const type of ['SINGLE', 'MULTI']) {
    assert.deepEqual(optionsForAttempt(options, type, ['b'], 'old', 'q', 0), shuffleSeeded(options, 'old:q'));
  }
  assert.deepEqual(optionsForAttempt(options, 'TRUE_FALSE', ['b'], 'old', 'q', 0), options);
  assert.deepEqual(optionsForAttempt(options, 'ORDERING', ['d', 'c', 'b', 'a'], 'old', 'q', 0),
    sequencingSteps(options, ['d', 'c', 'b', 'a'], 'q'));
});

test('sequencing keeps canonical step labels while its working order changes', () => {
  const correct = ['a', 'b', 'c', 'd'];
  const labels = sequencingSteps(options, correct, 'q');
  const shown = optionsForAttempt(options, 'ORDERING', correct, 'retake-3', 'q', 1);
  assert.notDeepEqual(ids(shown), correct);
  for (const option of shown) assert.ok(labels.findIndex(step => step.id === option.id) >= 0);
  assert.deepEqual(labels, sequencingSteps(options, correct, 'q'));
});
