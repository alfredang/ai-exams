/**
 * Read-only content quality gate for an exam family.
 *
 *   node scripts/check-option-balance.mjs [slugPrefix]
 *
 * Defaults to the CySA+ family. Reads the database named by DATABASE_URL
 * and writes nothing — safe to point at any environment.
 *
 * Measures the defects the house style actually cares about:
 *   - the "longest answer" tell (correct option strictly longest);
 *     chance for 4 options is 25%, house bar is <= ~30%
 *   - option-length spread (no option should exceed 1.3x the mean)
 *   - per-domain distribution against the exam's own blueprint weights
 *   - type mix, difficulty histogram, teaser count
 *   - questions citing only a generic vendor landing page
 *   - malformed rows: correct ids absent from options, duplicate ids,
 *     TRUE_FALSE without exactly two options, zero correct answers
 */
import { PrismaClient } from '@prisma/client';

const prefix = process.argv[2] ?? 'comptia-cysa-plus';
const db = new PrismaClient();

const pct = (n, d) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);
const GENERIC_REF = /\/certifications?\/?$|\/learn\/certification\//i;

let failures = 0;
const fail = (m) => { failures++; console.log(`   x ${m}`); };
const pass = (m) => console.log(`   . ${m}`);

const exams = await db.exam.findMany({
  where: { slug: { startsWith: prefix } },
  orderBy: { slug: 'asc' },
  select: { id: true, slug: true, code: true, questionCount: true, domains: true, published: true }
});

if (exams.length === 0) {
  console.log(`No exams matched slug prefix "${prefix}".`);
  await db.$disconnect();
  process.exit(1);
}

for (const exam of exams) {
  const qs = await db.question.findMany({
    where: { examId: exam.id, status: 'PUBLISHED' },
    select: { id: true, stem: true, domain: true, difficulty: true, type: true, options: true, correct: true, references: true, isTeaser: true }
  });

  console.log(`\n=== ${exam.slug}  (${exam.code})  ${qs.length} published questions ===`);
  if (exam.questionCount !== qs.length) {
    fail(`Exam.questionCount says ${exam.questionCount} but ${qs.length} published questions exist`);
  } else {
    pass(`questionCount matches actual (${qs.length})`);
  }

  // ---- longest-answer tell + option length spread ----
  const singles = qs.filter((q) => q.type === 'SINGLE');
  let strictLongest = 0;
  const wideSpread = [];
  for (const q of qs) {
    const opts = Array.isArray(q.options) ? q.options : [];
    const correct = Array.isArray(q.correct) ? q.correct : [];
    // TRUE_FALSE has fixed options. ORDERING is excluded because the length
    // check is a proxy for the longest-answer tell: it assumes ONE option is
    // the key and asks whether length gives it away. In an ORDERING item every
    // option is part of the answer and the task is sequencing, so a long step
    // ("Routing table, ARP cache, process table, and memory") next to a short
    // one ("Disk") leaks nothing. Padding them to equal length would damage
    // readability to satisfy a metric that does not apply.
    if (q.type === 'TRUE_FALSE' || q.type === 'ORDERING' || opts.length < 3) continue;
    const lens = opts.map((o) => String(o.text ?? '').length);
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    if (Math.max(...lens) > mean * 1.3) {
      wideSpread.push({ stem: q.stem, ratio: Math.round((Math.max(...lens) / mean) * 100) / 100 });
    }
    if (q.type !== 'SINGLE') continue;
    const key = opts.find((o) => correct.includes(o.id));
    const others = opts.filter((o) => !correct.includes(o.id)).map((o) => String(o.text ?? '').length);
    if (key && others.length && String(key.text ?? '').length > Math.max(...others)) strictLongest++;
  }
  const tell = pct(strictLongest, singles.length);
  if (tell <= 30) pass(`longest-answer tell ${tell}% of ${singles.length} SINGLE (chance 25%, bar <=30%)`);
  else fail(`longest-answer tell ${tell}% of ${singles.length} SINGLE - exceeds the 30% bar`);

  if (wideSpread.length === 0) pass('no option exceeds 1.3x the mean option length');
  else {
    fail(`${wideSpread.length} question(s) have an option over 1.3x the mean length`);
    for (const w of wideSpread.slice(0, 5)) console.log(`       ${w.ratio}x  ${w.stem.slice(0, 84)}`);
  }

  // ---- domain distribution vs blueprint ----
  const weights = Array.isArray(exam.domains) ? exam.domains : [];
  const byDomain = {};
  for (const q of qs) byDomain[q.domain] = (byDomain[q.domain] ?? 0) + 1;
  const known = new Set(weights.map((d) => d.name));
  const orphans = Object.keys(byDomain).filter((d) => !known.has(d));
  if (orphans.length === 0) pass('every question domain matches the blueprint');
  else fail(`orphan domain string(s) not in blueprint: ${orphans.join(' | ')}`);

  console.log('   domain distribution:');
  for (const d of weights) {
    const have = byDomain[d.name] ?? 0;
    const want = Math.round((d.weight / 100) * qs.length);
    const flag = Math.abs(have - want) > 1 ? '  <- off blueprint' : '';
    console.log(`     ${String(have).padStart(3)} (${String(pct(have, qs.length)).padStart(5)}%)  target ${want} (${d.weight}%)  ${d.name}${flag}`);
  }

  // ---- type / difficulty / teaser ----
  const types = {};
  const diffs = {};
  for (const q of qs) {
    types[q.type] = (types[q.type] ?? 0) + 1;
    diffs[q.difficulty] = (diffs[q.difficulty] ?? 0) + 1;
  }
  console.log(`   types: ${Object.entries(types).map(([k, v]) => `${k} ${v} (${pct(v, qs.length)}%)`).join(' | ')}`);
  console.log(`   difficulty: ${Object.keys(diffs).sort().map((k) => `d${k} ${diffs[k]}`).join(' | ')}`);

  const teasers = qs.filter((q) => q.isTeaser);
  if (teasers.length === 10) pass('exactly 10 teaser questions');
  else fail(`${teasers.length} teaser questions (expected 10)`);
  const badTeaser = teasers.filter((q) => q.type !== 'SINGLE' || q.difficulty !== 2);
  if (badTeaser.length) fail(`${badTeaser.length} teaser(s) are not difficulty-2 SINGLE`);

  // ---- references ----
  const noRefs = qs.filter((q) => !Array.isArray(q.references) || q.references.length === 0);
  if (noRefs.length) fail(`${noRefs.length} question(s) have no references`);
  const genericOnly = qs.filter((q) => {
    const rs = Array.isArray(q.references) ? q.references : [];
    return rs.length > 0 && rs.every((r) => GENERIC_REF.test(String(r.url ?? '')));
  });
  if (genericOnly.length === 0) pass('no question cites only a generic landing page');
  else fail(`${genericOnly.length} question(s) cite only a generic landing page`);

  const stringRefs = qs.filter((q) => (Array.isArray(q.references) ? q.references : []).some((r) => typeof r === 'string'));
  if (stringRefs.length) fail(`${stringRefs.length} question(s) use legacy string references instead of {label,url}`);

  // ---- malformed ----
  const malformed = [];
  for (const q of qs) {
    const opts = Array.isArray(q.options) ? q.options : [];
    const correct = Array.isArray(q.correct) ? q.correct : [];
    const ids = opts.map((o) => o.id);
    if (new Set(ids).size !== ids.length) malformed.push(`duplicate option ids: ${q.stem.slice(0, 60)}`);
    if (correct.length === 0) malformed.push(`no correct answer: ${q.stem.slice(0, 60)}`);
    if (correct.some((c) => !ids.includes(c))) malformed.push(`correct id not in options: ${q.stem.slice(0, 60)}`);
    if (q.type === 'TRUE_FALSE' && opts.length !== 2) malformed.push(`TRUE_FALSE with ${opts.length} options: ${q.stem.slice(0, 60)}`);
    if (q.type === 'MULTI' && correct.length < 2) malformed.push(`MULTI with <2 correct: ${q.stem.slice(0, 60)}`);
    // ORDERING: `correct` is the full sequence, so it must list every option
    // exactly once. A short or duplicated sequence is unscoreable — the
    // order-sensitive comparison in isAnswerCorrect() would never match.
    if (q.type === 'ORDERING') {
      if (correct.length !== opts.length) malformed.push(`ORDERING sequence has ${correct.length} ids for ${opts.length} options: ${q.stem.slice(0, 50)}`);
      if (new Set(correct).size !== correct.length) malformed.push(`ORDERING sequence repeats an option id: ${q.stem.slice(0, 50)}`);
      if (opts.length < 3) malformed.push(`ORDERING with only ${opts.length} options: ${q.stem.slice(0, 50)}`);
    }
  }
  if (malformed.length === 0) pass('no malformed questions');
  else {
    fail(`${malformed.length} malformed question(s)`);
    for (const m of malformed.slice(0, 8)) console.log(`       ${m}`);
  }

  // ---- duplicate stems within the exam ----
  const stems = qs.map((q) => q.stem.trim().toLowerCase());
  const dupes = stems.filter((s, i) => stems.indexOf(s) !== i);
  if (dupes.length) fail(`${new Set(dupes).size} duplicate stem(s) within this exam`);
}

// ---- cross-variant duplicate stems ----
const allIds = exams.map((e) => e.id);
const all = await db.question.findMany({ where: { examId: { in: allIds } }, select: { stem: true } });
const norm = all.map((q) => q.stem.trim().toLowerCase());
const crossDupes = new Set(norm.filter((s, i) => norm.indexOf(s) !== i));
console.log('\n=== family ===');
if (crossDupes.size === 0) {
  console.log(`   . no duplicate stems across the ${exams.length} variants (${all.length} questions)`);
} else {
  failures++;
  console.log(`   x ${crossDupes.size} stem(s) repeated across variants`);
}

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`);
await db.$disconnect();
process.exit(failures === 0 ? 0 : 1);
