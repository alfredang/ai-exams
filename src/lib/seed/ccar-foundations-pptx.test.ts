import assert from 'node:assert/strict';
import test from 'node:test';
import { CCAR_PPTX_QUESTIONS, CCAR_PPTX_SOURCE_GAPS, CCAR_SCENARIOS } from './ccar-foundations-pptx-questions';
import { splitQuestionScenario } from '../question-presentation';
import { ccarPptxQuestionId } from './import-ccar-foundations-pptx';

test('all readable source questions are covered once with their scenario and validated answers', () => {
  assert.equal(CCAR_PPTX_QUESTIONS.length, 57);
  assert.equal(new Set(CCAR_PPTX_QUESTIONS.map(q => q.stem)).size, 57);
  assert.equal(new Set(CCAR_PPTX_QUESTIONS.map(q => ccarPptxQuestionId(q.sourceNumber))).size, 57);
  assert.deepEqual(CCAR_PPTX_QUESTIONS.map(q => q.sourceNumber),
    Array.from({ length: 60 }, (_, i) => i + 1).filter(n => ![13, 18, 47].includes(n)));
  const slides = CCAR_PPTX_QUESTIONS.flatMap(q => q.sourceSlides).sort((a, b) => a - b);
  assert.deepEqual(slides, Array.from({ length: 67 }, (_, i) => i + 1).filter(n => n !== 48));
  assert.equal(CCAR_PPTX_SOURCE_GAPS.unreadableSlides[0], 48);
  for (const q of CCAR_PPTX_QUESTIONS) {
    const split = splitQuestionScenario(q.stem);
    assert.ok(split);
    assert.equal(split.scenario, CCAR_SCENARIOS[q.scenarioId].text);
    assert.equal(q.correct.length, 1);
    assert.ok(q.options.some(o => o.id === q.correct[0]));
    assert.equal(q.options.length, 4);
    assert.ok(q.explanation.length > 100);
    assert.ok(q.references.length > 0);
    // Option letters change per attempt; explanations must identify concepts.
    assert.doesNotMatch(q.explanation, /(?:option|answer) [ABCD]\b/);
  }
});

test('scenario parsing is explicit and leaves ordinary or incomplete stems intact', () => {
  assert.equal(splitQuestionScenario('A scenario-based MCQ without an envelope.'), null);
  assert.equal(splitQuestionScenario('Scenario: Empty\n\nQuestion:\nWhich?'), null);
  assert.deepEqual(splitQuestionScenario('Scenario: Test\r\nFirst line\r\nSecond line\r\n\r\nQuestion:\r\nWhich action?'), {
    title: 'Test', scenario: 'First line\r\nSecond line', question: 'Which action?'
  });
});
