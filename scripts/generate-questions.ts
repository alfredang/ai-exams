/**
 * Bulk question generator using the Claude Agent SDK.
 *
 *   npm run generate:exam -- --slug aws-saa-c03 [--count 60] [--teaser 30]
 *   npm run generate:exam -- --all [--count 60] [--teaser 30] [--skip-existing]
 *
 * Writes questions as PUBLISHED so they're immediately usable. The first
 * `--teaser` questions per exam are flagged `isTeaser=true`. Distributes
 * `--count` across the exam's domain blueprint by weight.
 */
import { PrismaClient, QStatus, QType } from '@prisma/client';
import { streamGenerateQuestions } from '../src/lib/claude';

const db = new PrismaClient();

type Args = {
  slug?: string;
  all: boolean;
  count: number;
  teaser: number;
  skipExisting: boolean;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    slug: get('--slug'),
    all: argv.includes('--all'),
    count: Number(get('--count') ?? 60),
    teaser: Number(get('--teaser') ?? 30),
    skipExisting: argv.includes('--skip-existing')
  };
}

function distributeByWeight(total: number, domains: { name: string; weight: number }[]): { name: string; count: number }[] {
  const totalWeight = domains.reduce((s, d) => s + d.weight, 0);
  const raw = domains.map(d => ({
    name: d.name,
    raw: (total * d.weight) / totalWeight
  }));
  const floored = raw.map(r => ({ name: r.name, count: Math.floor(r.raw), frac: r.raw - Math.floor(r.raw) }));
  const remainder = total - floored.reduce((s, r) => s + r.count, 0);
  floored.sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < remainder; i++) floored[i].count += 1;
  return floored.map(f => ({ name: f.name, count: f.count })).filter(f => f.count > 0);
}

async function generateForExam(examSlug: string, totalCount: number, teaserCount: number, skipExisting: boolean) {
  const exam = await db.exam.findUnique({
    where: { slug: examSlug },
    include: { vendor: true }
  });
  if (!exam) {
    console.error(`✗ Exam not found: ${examSlug}`);
    return { generated: 0 };
  }

  const existing = await db.question.count({ where: { examId: exam.id } });
  if (skipExisting && existing > 0) {
    console.log(`→ Skip ${exam.slug} (already has ${existing} questions)`);
    return { generated: 0 };
  }

  const domains = (exam.domains as any as { name: string; weight: number }[]) || [];
  if (!domains.length) {
    console.error(`✗ ${exam.slug} has no domains`);
    return { generated: 0 };
  }

  const distribution = distributeByWeight(totalCount, domains);
  console.log(`\n▸ ${exam.code} — ${exam.title}`);
  console.log(`  Domains: ${distribution.map(d => `${d.name}=${d.count}`).join(', ')}`);

  let inserted = 0;
  for (const d of distribution) {
    process.stdout.write(`  [${d.name}] generating ${d.count}…`);
    const stream = streamGenerateQuestions({
      vendor: exam.vendor.name,
      certification: exam.title,
      examCode: exam.code,
      domain: d.name,
      domainWeights: domains,
      count: d.count,
      difficulty: 3,
      type: 'SINGLE'
    });

    let domainCount = 0;
    for await (const ev of stream) {
      if (ev.type === 'question') {
        const q = ev.question;
        const isTeaser = inserted < teaserCount;
        await db.question.create({
          data: {
            examId: exam.id,
            stem: q.stem,
            explanation: q.explanation,
            domain: q.domain || d.name,
            difficulty: q.difficulty,
            type: q.type as QType,
            status: QStatus.PUBLISHED,
            generatedBy: 'claude-agent-sdk',
            isTeaser,
            options: q.options,
            correct: q.correct,
            references: q.references || []
          }
        });
        inserted += 1;
        domainCount += 1;
      } else if (ev.type === 'error') {
        console.error(`\n  ! error: ${ev.message}`);
      }
    }
    process.stdout.write(` ✓ ${domainCount}\n`);
  }

  console.log(`  Total inserted: ${inserted} (teaser: ${Math.min(inserted, teaserCount)})`);
  return { generated: inserted };
}

async function main() {
  const args = parseArgs();
  if (!args.slug && !args.all) {
    console.error('Usage: npm run generate:exam -- --slug <exam-slug> [--count 60] [--teaser 30]');
    console.error('   or: npm run generate:exam -- --all [--skip-existing]');
    process.exit(1);
  }

  if (args.slug) {
    const r = await generateForExam(args.slug, args.count, args.teaser, args.skipExisting);
    console.log(`\nDone. Inserted ${r.generated} questions for ${args.slug}.`);
    return;
  }

  const exams = await db.exam.findMany({ where: { published: true }, orderBy: { createdAt: 'asc' } });
  console.log(`Generating for ${exams.length} published exams (count=${args.count}, teaser=${args.teaser})…`);
  let total = 0;
  for (const e of exams) {
    const r = await generateForExam(e.slug, args.count, args.teaser, args.skipExisting);
    total += r.generated;
  }
  console.log(`\nAll done. Total inserted: ${total} questions across ${exams.length} exams.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
