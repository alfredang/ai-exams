import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerLead, storedReferences } from './answer-check';

const opts = [{ id: 'a', text: 'x' }, { id: 'b', text: 'y' }, { id: 'c', text: 'z' }, { id: 'd', text: 'w' }];

test('answer lead uses stored option positions', () => {
  assert.equal(answerLead({ id: 'q', type: 'SINGLE', options: opts }, ['c']), 'Suggested answer: C.');
  assert.equal(answerLead({ id: 'q', type: 'MULTI', options: opts }, ['d', 'a']), 'Suggested answer: A and D.');
  assert.equal(answerLead({ id: 'q', type: 'MULTI', options: opts }, ['d', 'a', 'b']), 'Suggested answer: A, B and D.');
});

test('true/false lead names the statement value', () => {
  assert.equal(answerLead({ id: 'q', type: 'TRUE_FALSE', options: [{ id: 'a', text: 'True' }, { id: 'b', text: 'False' }] }, ['b']), 'Suggested answer: False.');
});

test('sequencing lead uses the step numbers learners see', () => {
  const steps = [{ id: '1', text: 's1' }, { id: '2', text: 's2' }, { id: '3', text: 's3' }];
  assert.equal(answerLead({ id: 'q', type: 'ORDERING', options: steps }, ['3', '1', '2']), 'Correct sequence: 3 → 1 → 2.');
  // Authored already solved: learners see a stable shuffle, and the lead follows it.
  const lead = answerLead({ id: 'q2', type: 'ORDERING', options: steps }, ['1', '2', '3']);
  assert.match(lead, /^Correct sequence: \d → \d → \d\.$/);
  assert.notEqual(lead, 'Correct sequence: 1 → 2 → 3.');
});

test('stored references keep only http(s) links', () => {
  assert.deepEqual(storedReferences(['https://a.example/x', 'nope', { url: 'http://b.example', label: 'B' }]), [
    { url: 'https://a.example/x', label: 'https://a.example/x' },
    { url: 'http://b.example', label: 'B' }
  ]);
  assert.deepEqual(storedReferences(null), []);
});
