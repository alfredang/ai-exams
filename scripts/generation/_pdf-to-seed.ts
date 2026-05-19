/**
 * Internal utility — converts a practice-exam PDF into a static seed script.
 *
 * Not part of the production seed chain (filename starts with `_` so the
 * orchestrator won't accidentally run it). Generated seed scripts are what
 * actually get committed and run at deploy time.
 *
 *   npx tsx scripts/generation/_pdf-to-seed.ts <config.json>
 *
 * Config shape (see scripts/generation/_aws-batch.ts for the driver that fans this out):
 *   {
 *     pdfPath, vendorSlug, examSlug, examCode, examTitle, examDescription,
 *     level, durationMinutes, passingScore, domains: [{name, weight}, ...],
 *     ref: {label, url}, tag,
 *     outputPath
 *   }
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

type Config = {
  pdfPath: string;
  vendorSlug: string;
  examSlug: string;
  examCode: string;
  examTitle: string;
  examDescription: string;
  level: string;
  durationMinutes: number;
  passingScore: number;
  domains: { name: string; weight: number }[];
  ref: { label: string; url: string };
  tag: string;
  outputPath: string;
  defaultDomain?: string;
};

type Q = {
  domain: string;
  type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE';
  stem: string;
  options: { id: string; text: string }[];
  correct: string[];
  explanation: string;
};

function extractText(pdfPath: string): string {
  return execSync(`pdftotext -layout "${pdfPath}" -`, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
}

function extractTextRaw(pdfPath: string): string {
  return execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
}

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

// Split source text on Q\d+\. markers. Handles several PDF format variants:
//   "Q1. 1. text..."        — original spaced format
//   "Q1. 1.text..."          — glued second number (DOP-C02, DVA-C02)
//   "Q1. text..."            — no second number (DEA-C01)
//   "    Q1. 1. text..."    — indented (AIF-C01 P4+)
function splitIntoBlocks(text: string): string[] {
  const blocks: string[] = [];
  // Match Q<n>. then optionally "<n>." (with or without trailing space)
  const re = /\bQ(\d+)\.\s*(?:\d+\.)?\s*/g;
  const matches: { idx: number; markerLen: number; n: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ idx: m.index, markerLen: m[0].length, n: parseInt(m[1], 10) });
  }
  if (matches.length === 0) return blocks;
  // Filter to monotonically increasing n (skip false matches like Q42 inside an explanation)
  const filtered: typeof matches = [];
  let expected = 1;
  for (const mm of matches) {
    if (mm.n === expected) {
      filtered.push(mm);
      expected++;
    }
  }
  if (filtered.length === 0) return blocks;
  for (let i = 0; i < filtered.length; i++) {
    const start = filtered[i].idx + filtered[i].markerLen;
    const endIdx = i + 1 < filtered.length ? filtered[i + 1].idx : text.length;
    blocks.push(text.slice(start, endIdx));
  }
  return blocks;
}

// Parse one block into stem / options / explanation / correct ids
function parseBlock(block: string, defaultDomain: string): Q | null {
  // 1. Locate the start of the options block: a line beginning with "A." (allow leading whitespace)
  const optStartMatch = block.match(/(^|\n)\s*A\.\s+/);
  if (!optStartMatch) return null;
  const optStart = optStartMatch.index! + optStartMatch[0].indexOf('A');
  const stemRaw = block.slice(0, optStart);

  // 2. Detect question type from the stem (SINGLE / MULTI / TRUE_FALSE marker at end)
  let type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE' = 'SINGLE';
  const typeMatch = stemRaw.match(/\b(SINGLE|MULTI|TRUE_FALSE)\b\s*$/);
  if (typeMatch) type = typeMatch[1] as any;
  const stem = normalizeWhitespace(stemRaw.replace(/\b(SINGLE|MULTI|TRUE_FALSE)\b\s*$/, ''));

  // 3. Find Explanation: split point
  const explanationMatch = block.match(/Explanation:\s*(?:Overall explanation\s+)?/);
  if (!explanationMatch) return null;
  const explStart = explanationMatch.index!;
  const optionsBlock = block.slice(optStart, explStart);
  const explanationBlock = block.slice(explStart + explanationMatch[0].length);

  // 4. Parse options A/B/C/D/E — keep leading-whitespace count for each so
  // we can use the indentation-difference heuristic when there's no explicit
  // "Correct option:" marker (Microsoft PDFs use this scheme).
  const options: { id: string; text: string; leadingSpaces: number }[] = [];
  const optRe = /(?:^|\n)([ \t]*)([A-E])\.\s+([\s\S]*?)(?=(?:\n[ \t]*[A-E]\.\s+)|$)/g;
  let om: RegExpExecArray | null;
  while ((om = optRe.exec(optionsBlock)) !== null) {
    options.push({
      id: om[2],
      text: normalizeWhitespace(om[3]),
      leadingSpaces: om[1].replace(/\t/g, '    ').length
    });
  }
  if (options.length < 2) return null;

  // 5. Extract correct option text and match against options
  // Pattern variants:
  //   "Correct option: <text> ... Incorrect option(s):"          (most PDFs)
  //   "Correct options: <text1> <text2> ... Incorrect options:"  (MULTI)
  //   "CORRECT: <text> ... INCORRECT: <text>"                    (DOP-C02 family)
  let correctMatch = explanationBlock.match(/Correct options?:\s*([\s\S]*?)(?:Incorrect options?:|$)/);
  if (!correctMatch) {
    correctMatch = explanationBlock.match(/CORRECT:\s*([\s\S]*?)(?:INCORRECT:|$)/);
  }

  const correct: string[] = [];
  if (correctMatch) {
    const correctPayload = normalizeWhitespace(correctMatch[1]);
    for (const opt of options) {
      const fingerprint = normalizeWhitespace(opt.text).slice(0, 40);
      if (fingerprint && correctPayload.includes(fingerprint)) correct.push(opt.id);
    }
    if (correct.length === 0) {
      for (const opt of options) {
        const fingerprint = normalizeWhitespace(opt.text).slice(0, 25);
        if (fingerprint && correctPayload.includes(fingerprint)) correct.push(opt.id);
      }
    }
  } else {
    // Fallback heuristic: Microsoft PDFs encode correct answers by giving them
    // a different leading-whitespace count than the majority (no explicit
    // "Correct option:" marker). Find the modal leading-space count and flag
    // outliers as correct.
    const counts = new Map<number, number>();
    for (const opt of options) counts.set(opt.leadingSpaces, (counts.get(opt.leadingSpaces) ?? 0) + 1);
    let modeCount = 0, modeSpaces = options[0].leadingSpaces;
    for (const [sp, c] of counts) if (c > modeCount) { modeCount = c; modeSpaces = sp; }
    // Only trust the heuristic if at least 2 options share the modal indent
    // AND at least one option differs from it.
    if (modeCount >= 2 && counts.size >= 2) {
      for (const opt of options) if (opt.leadingSpaces !== modeSpaces) correct.push(opt.id);
    }
  }
  if (correct.length === 0) return null;

  // For SINGLE questions, take the first match if multiple matched (shouldn't normally happen)
  if (type === 'SINGLE' && correct.length > 1) correct.length = 1;

  // Explanation: full text (correct payload + incorrect explanations)
  const explanation = normalizeWhitespace(explanationBlock).slice(0, 2500);

  return { domain: defaultDomain, type, stem, options, correct, explanation };
}

function parsePDF(pdfPath: string, defaultDomain: string): Q[] {
  const text = extractText(pdfPath);
  const blocks = splitIntoBlocks(text);
  const out: Q[] = [];
  for (const b of blocks) {
    const q = parseBlock(b, defaultDomain);
    if (q) out.push(q);
  }
  return out;
}

// Raw-mode parser for PDFs whose -layout output has no explicit
// "Correct option:" marker AND no consistent leading-space differences in
// -layout mode. The raw extraction preserves a different signal: the
// correct option's text either (a) starts on a line with one leading space
// before the option marker (` C. ...`), or (b) wraps to a continuation
// line that itself starts with leading whitespace.
function parseBlockRaw(block: string, defaultDomain: string): Q | null {
  // Find first option marker — at line start (with optional leading whitespace)
  const optStart = block.search(/(^|\n)[ \t]*A\.\s+/);
  if (optStart < 0) return null;

  const stemRaw = block.slice(0, block.indexOf('A.', optStart));
  let type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE' = 'SINGLE';
  const typeMatch = stemRaw.match(/\b(SINGLE|MULTI|TRUE_FALSE)\b\s*$/);
  if (typeMatch) type = typeMatch[1] as any;
  const stem = normalizeWhitespace(stemRaw.replace(/\b(SINGLE|MULTI|TRUE_FALSE)\b\s*$/, ''));

  // Collect option markers — at line start OR inline after whitespace.
  // We also capture the whitespace gap preceding each option, since 2+
  // inline spaces in raw mode can indicate the option was originally on its
  // own (indented = correct) line that pdftotext merged onto the prior line.
  type RawOpt = { id: string; startIdx: number; lineLeadingSpaces: number; precedingSpaces: number };
  const optRe = /(^|\n)([ \t]*)([A-E])\.\s+/g;
  const inlineOptRe = /(?<=\S)( +)([B-E])\.\s+/g;
  const rawOpts: RawOpt[] = [];
  let m: RegExpExecArray | null;
  while ((m = optRe.exec(block)) !== null) {
    const lead = m[2].replace(/\t/g, '    ').length;
    rawOpts.push({
      id: m[3],
      startIdx: m.index + m[1].length + m[2].length,
      lineLeadingSpaces: lead,
      precedingSpaces: lead
    });
  }
  while ((m = inlineOptRe.exec(block)) !== null) {
    const id = m[2];
    const gapLen = m[1].length;
    // m.index points at the first space; the letter sits at m.index + gapLen.
    const startIdx = m.index + gapLen;
    if (rawOpts.some(o => o.id === id && Math.abs(o.startIdx - startIdx) < 5)) continue;
    rawOpts.push({ id, startIdx, lineLeadingSpaces: -1, precedingSpaces: gapLen });
  }
  rawOpts.sort((a, b) => a.startIdx - b.startIdx);
  // Keep first occurrence of each id, but only after we've seen A
  // (some PDFs have "A." in the question stem; we want to start at the
  // first A that comes after the question type marker).
  const seen = new Set<string>();
  const uniqueOpts = rawOpts.filter(o => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
  if (uniqueOpts.length < 2) return null;

  // Slice each option's text from its start to the next option's start
  const options: { id: string; text: string; isCorrect: boolean }[] = [];
  for (let i = 0; i < uniqueOpts.length; i++) {
    const o = uniqueOpts[i];
    const end = i + 1 < uniqueOpts.length ? uniqueOpts[i + 1].startIdx : block.length;
    const slice = block.slice(o.startIdx, end).replace(/^[A-E]\.\s+/, '');
    // Correct if: marker at line start with leading-whitespace indent, OR
    // marker preceded inline by 2+ spaces (indicates it was originally on
    // its own indented line that pdftotext merged), OR option text contains
    // a continuation line that starts with leading whitespace.
    const correctByLineIndent = o.lineLeadingSpaces > 0;
    const correctByInlineGap = o.lineLeadingSpaces < 0 && o.precedingSpaces >= 2;
    const correctByContinuation = /\n[ \t]+\S/.test(slice);
    options.push({
      id: o.id,
      text: normalizeWhitespace(slice),
      isCorrect: correctByLineIndent || correctByInlineGap || correctByContinuation
    });
  }

  const correct = options.filter(o => o.isCorrect).map(o => o.id);
  if (correct.length === 0) return null;
  if (type === 'SINGLE' && correct.length > 1) {
    // For SINGLE, prefer line-start-with-leading-space over indented-continuation
    const lineStartCorrect = options.find(o => {
      const ro = uniqueOpts.find(u => u.id === o.id);
      return o.isCorrect && ro && ro.lineLeadingSpaces > 0;
    });
    if (lineStartCorrect) correct.length = 0, correct.push(lineStartCorrect.id);
    else correct.length = 1;
  }

  // Reasonable explanation: just use the first 1500 chars of the explanation
  // section if it exists, otherwise omit. Many of these PDFs don't have
  // explanations at all in raw mode.
  let explanation = '';
  const explMatch = block.match(/Explanation:\s*([\s\S]+?)(?=$)/);
  if (explMatch) explanation = normalizeWhitespace(explMatch[1]).slice(0, 2000);

  return {
    domain: defaultDomain,
    type,
    stem,
    options: options.map(o => ({ id: o.id, text: o.text })),
    correct,
    explanation
  };
}

function parsePDFRaw(pdfPath: string, defaultDomain: string): Q[] {
  const text = extractTextRaw(pdfPath);
  const blocks = splitIntoBlocks(text);
  const out: Q[] = [];
  for (const b of blocks) {
    const q = parseBlockRaw(b, defaultDomain);
    if (q) out.push(q);
  }
  return out;
}

// Try -layout mode first; if it produces few questions, also try raw mode
// and keep whichever gave more.
function parsePDFAuto(pdfPath: string, defaultDomain: string): Q[] {
  const layoutQs = parsePDF(pdfPath, defaultDomain);
  const rawQs = parsePDFRaw(pdfPath, defaultDomain);
  return rawQs.length > layoutQs.length ? rawQs : layoutQs;
}

// Escape a string for JS single-quoted source emission
function jsQuote(s: string): string {
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
}

function emitSeedScript(cfg: Config, questions: Q[]): string {
  const domainLines = cfg.domains
    .map(d => `  { name: ${jsQuote(d.name)}, weight: ${d.weight} }`)
    .join(',\n');

  const questionLines = questions
    .map((q) => {
      const opts = q.options.map(o => `      { id: ${jsQuote(o.id)}, text: ${jsQuote(o.text)} }`).join(',\n');
      const correctArr = '[' + q.correct.map(c => jsQuote(c)).join(', ') + ']';
      return `  {
    domain: ${jsQuote(q.domain)},
    type: QType.${q.type},
    stem: ${jsQuote(q.stem)},
    options: [
${opts}
    ],
    correct: ${correctArr},
    explanation: ${jsQuote(q.explanation)}
  }`;
    })
    .join(',\n');

  const displayPath = cfg.outputPath.split(/[\\/]/).slice(-2).join('/');
  return `/**
 * One-shot seed: ${cfg.examTitle} (${questions.length} questions).
 *
 *   npx tsx ${displayPath}
 *
 * Idempotent: skips Question seeding if any questions tagged "${cfg.tag}"
 * already exist for this exam. Source: practice PDF (parsed via
 * pdftotext + scripts/generation/_pdf-to-seed.ts).
 */
import { PrismaClient, QStatus, QType } from '@prisma/client';

const db = new PrismaClient();

const VENDOR_SLUG = ${jsQuote(cfg.vendorSlug)};
const EXAM_SLUG = ${jsQuote(cfg.examSlug)};
const TAG = ${jsQuote(cfg.tag)};

const DOMAINS = [
${domainLines}
];

const REF = {
  label: ${jsQuote(cfg.ref.label)},
  url: ${jsQuote(cfg.ref.url)}
};

type Q = {
  domain: string;
  type: QType;
  stem: string;
  options: { id: string; text: string }[];
  correct: string[];
  explanation: string;
};

const QUESTIONS: Q[] = [
${questionLines}
];

async function main() {
  const vendor = await db.vendor.findUnique({ where: { slug: VENDOR_SLUG } });
  if (!vendor) throw new Error(\`Vendor "\${VENDOR_SLUG}" not found — run prisma seed first.\`);

  const exam = await db.exam.upsert({
    where: { slug: EXAM_SLUG },
    update: {
      title: ${jsQuote(cfg.examTitle)},
      description: ${jsQuote(cfg.examDescription)},
      level: ${jsQuote(cfg.level)},
      durationMinutes: ${cfg.durationMinutes},
      passingScore: ${cfg.passingScore},
      questionCount: ${questions.length},
      domains: DOMAINS,
      published: true
    },
    create: {
      vendorId: vendor.id,
      code: ${jsQuote(cfg.examCode)},
      slug: EXAM_SLUG,
      title: ${jsQuote(cfg.examTitle)},
      description: ${jsQuote(cfg.examDescription)},
      level: ${jsQuote(cfg.level)},
      durationMinutes: ${cfg.durationMinutes},
      passingScore: ${cfg.passingScore},
      questionCount: ${questions.length},
      domains: DOMAINS,
      published: true
    }
  });

  const alreadySeeded = await db.question.count({
    where: { examId: exam.id, generatedBy: TAG }
  });
  if (alreadySeeded > 0) {
    console.log(\`Already have \${alreadySeeded} questions tagged "\${TAG}" — skipping.\`);
    return;
  }

  let i = 0;
  for (const q of QUESTIONS) {
    await db.question.create({
      data: {
        examId: exam.id,
        domain: q.domain,
        difficulty: 3,
        type: q.type,
        stem: q.stem,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        references: [REF],
        status: QStatus.PUBLISHED,
        generatedBy: TAG,
        isTeaser: i < 10
      }
    });
    i++;
  }

  const total = await db.question.count({ where: { examId: exam.id, status: QStatus.PUBLISHED } });
  console.log(\`✓ \${EXAM_SLUG} — inserted \${QUESTIONS.length} questions (\${total} total published)\`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
`;
}

function main() {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error('Usage: npx tsx scripts/generation/_pdf-to-seed.ts <config.json>');
    process.exit(1);
  }
  const cfg: Config = JSON.parse(readFileSync(configPath, 'utf8'));
  const defaultDomain = cfg.defaultDomain || cfg.domains[0]?.name || 'General';
  const questions = parsePDFAuto(cfg.pdfPath, defaultDomain);
  if (questions.length === 0) {
    console.error(`No questions parsed from ${cfg.pdfPath}`);
    process.exit(1);
  }
  const script = emitSeedScript(cfg, questions);
  mkdirSync(dirname(cfg.outputPath), { recursive: true });
  writeFileSync(cfg.outputPath, script, 'utf8');
  console.log(`✓ Wrote ${cfg.outputPath} — ${questions.length} questions parsed`);
}

main();
