/** Preview/export by default. --apply appends to a verified existing bank in
 * DATABASE_URL. Production uses the same importer during the normal boot seed.
 * Never invokes the legacy replacement seed or changes existing question rows.
 */
import { PrismaClient } from '@prisma/client';
import { mkdir, writeFile } from 'node:fs/promises';
import { CCAR_PPTX_QUESTIONS, CCAR_PPTX_SOURCE_GAPS, CCAR_PPTX_TAG } from '../src/lib/seed/ccar-foundations-pptx-questions';
import { importCcarFoundationsPptx } from '../src/lib/seed/import-ccar-foundations-pptx';

async function main() {
  const directory = 'reference/ccar-f-pptx-import-2026-11-13';
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/questions.json`, JSON.stringify(CCAR_PPTX_QUESTIONS, null, 2) + '\n');
  const counts: Record<string, number> = {};
  for (const q of CCAR_PPTX_QUESTIONS) counts[q.scenarioId] = (counts[q.scenarioId] ?? 0) + 1;
  const summary = { generatedBy: CCAR_PPTX_TAG, ...CCAR_PPTX_SOURCE_GAPS, scenarios: counts };
  const markdown = [
    '# CCAR-F question-bank additions',
    '57 rephrased questions from the supplied presentation. Answers were reasoned independently of selected screenshot options.',
    'Source gaps: questions 13, 18, and 47 are not present in readable screenshots. Slide 48 is too blurred to recover. Repeated screenshots were deduplicated.',
    ...CCAR_PPTX_QUESTIONS.map(q => {
      const answer = q.options.find(o => o.id === q.correct[0])!;
      return `## Source question ${q.sourceNumber} (slides ${q.sourceSlides.join(', ')})\n\n${q.stem}\n\n${q.options.map(o => `${o.id.toUpperCase()}. ${o.text}`).join('\n\n')}\n\n**Answer: ${answer.id.toUpperCase()}. ${answer.text}**\n\n${q.explanation}\n\n${q.references.map(r => `- [${r.label}](${r.url})`).join('\n')}`;
    })
  ].join('\n\n') + '\n';
  await writeFile(`${directory}/questions-and-explanations.md`, markdown);
  await writeFile(`${directory}/preflight.json`, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
  if (process.argv.includes('--apply')) {
    const db = new PrismaClient();
    try {
      const result = await importCcarFoundationsPptx(db);
      await writeFile(`${directory}/apply-result.json`, JSON.stringify(result, null, 2) + '\n');
      console.log(JSON.stringify(result, null, 2));
    } finally { await db.$disconnect(); }
  } else console.log(`Preview only. Review ${directory}/questions-and-explanations.md; use --apply for an existing verified bank.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
