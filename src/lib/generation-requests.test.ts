import test from 'node:test';
import assert from 'node:assert/strict';
import { isGithubUrl, planJobs, shuffleOptions } from './generation-requests';

const chosen = [
  { name: 'A', weight: 60 },
  { name: 'B', weight: 40 }
];

test('AI generation: the total is split by domain weight, 5 per job', () => {
  const { jobs, plan } = planJobs({ chosen, count: 12, mode: 'generate' });
  assert.deepEqual(plan, { A: 7, B: 5 });
  assert.deepEqual(jobs.map((j) => [j.domains[0], j.count]), [['A', 5], ['A', 2], ['B', 5]]);
  assert.ok(jobs.every((j) => !j.excerpt));
});

test('extract: one job per excerpt, every chosen domain allowed', () => {
  const text = Array.from({ length: 40 }, (_, i) => `## Section ${i}\n${'Question text. '.repeat(30)}`).join('\n\n');
  const { jobs } = planJobs({ chosen, count: 10, mode: 'extract', sourceText: text });
  assert.ok(jobs.length > 1);
  assert.ok(jobs.every((j) => j.excerpt && j.count === 20 && j.domains.length === 2));
});

test('generate from a source: job counts add up to the total', () => {
  const text = Array.from({ length: 12 }, (_, i) => `## Topic ${i}\n${'Some teaching text. '.repeat(120)}`).join('\n\n');
  for (const count of [1, 3, 17, 50]) {
    const { jobs } = planJobs({ chosen, count, mode: 'generate', sourceText: text });
    assert.equal(jobs.reduce((s, j) => s + j.count, 0), count);
    assert.ok(jobs.every((j) => j.count >= 1 && j.count <= 5 && j.excerpt));
  }
});

test('the plan is deterministic, so endpoints can rebuild it per call', () => {
  const text = `## One\n${'x '.repeat(4000)}\n\n## Two\n${'y '.repeat(4000)}`;
  assert.deepEqual(planJobs({ chosen, count: 9, mode: 'generate', sourceText: text }), planJobs({ chosen, count: 9, mode: 'generate', sourceText: text }));
});

test('GitHub links are recognised (extracts from them are always rephrased)', () => {
  for (const u of ['https://github.com/o/r/blob/main/README.md', 'https://raw.githubusercontent.com/o/r/main/q.md', 'https://gist.github.com/o/abc', 'https://o.github.io/quiz/']) assert.ok(isGithubUrl(u), u);
  for (const u of ['https://learn.microsoft.com/', 'https://notgithub.com/x', 'https://github.com.evil.example/x', 'not a url']) assert.ok(!isGithubUrl(u), u);
});

const single = {
  domain: 'A',
  type: 'SINGLE' as const,
  stem: 'Which service stores objects?',
  options: [
    { id: 'a', text: 'Compute' },
    { id: 'b', text: 'Queue' },
    { id: 'c', text: 'Object storage' },
    { id: 'd', text: 'DNS' }
  ],
  correct: ['c'],
  explanation: 'x'.repeat(20),
  difficulty: 3,
  references: []
};

test('shuffleOptions moves the key with its text and keeps ids a, b, c… by position', () => {
  const seenAt = new Set<string>();
  for (let n = 0; n < 60; n++) {
    const out = shuffleOptions(single);
    assert.deepEqual(out.options.map((o) => o.id), ['a', 'b', 'c', 'd']);
    assert.equal(out.options.find((o) => o.id === out.correct[0])?.text, 'Object storage');
    assert.deepEqual([...out.options.map((o) => o.text)].sort(), ['Compute', 'DNS', 'Object storage', 'Queue']);
    seenAt.add(out.correct[0]);
  }
  assert.ok(seenAt.size > 1, 'the key should not always land on the same letter');
});

test('shuffleOptions keeps a multiple-select key set and leaves other types alone', () => {
  const multi = { ...single, type: 'MULTI' as const, options: [...single.options, { id: 'e', text: 'Archive storage' }], correct: ['c', 'e'] };
  const out = shuffleOptions(multi, () => 0);
  assert.deepEqual(out.correct.map((id) => out.options.find((o) => o.id === id)!.text).sort(), ['Archive storage', 'Object storage']);
  const ordering = { ...single, type: 'ORDERING' as const, options: single.options.map((o, i) => ({ id: String(i + 1), text: o.text })), correct: ['2', '1', '4', '3'] };
  assert.equal(shuffleOptions(ordering), ordering);
  const linked = { ...single, options: [...single.options.slice(0, 3), { id: 'd', text: 'All of the above' }] };
  assert.equal(shuffleOptions(linked), linked);
});
