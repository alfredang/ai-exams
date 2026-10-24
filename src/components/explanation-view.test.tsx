import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExplanationView } from './explanation-view';

const render = (references: unknown) => renderToStaticMarkup(
  <ExplanationView
    text="Check the original evidence before using the answer."
    options={[{ id: 'a', text: 'Verify the source' }, { id: 'b', text: 'Trust the wording' }]}
    correctIds={['a']}
    references={references}
    hideCorrectTitle
  />
);

test('a manual question with null references still renders its explanation', () => {
  const html = render(null);
  assert.match(html, /Check the original evidence before using the answer/);
  assert.doesNotMatch(html, />References</);
});

test('per-option explanation metadata is not treated as a reference list', () => {
  assert.doesNotThrow(() => render({ explanationByOption: { a: 'Check the evidence.' } }));
});

test('legacy URL strings and labeled references remain usable', () => {
  const html = render([
    'https://example.com/guide',
    { label: 'Study objectives', url: 'https://example.com/objectives' },
    null,
    { label: 'No URL' },
    { label: 'Unsafe link', url: 'javascript:alert(1)' }
  ]);
  assert.match(html, /href="https:\/\/example.com\/guide"/);
  assert.match(html, />Study objectives</);
  assert.doesNotMatch(html, /Unsafe link|javascript:|No URL/);
});
