import { PDFDocument, type PDFPage, type RGB } from 'pdf-lib';
import { A4, COLORS, newA4Doc, type Fonts } from './layout';
import { isAnswerCorrect, type Responses } from '../attempts';
import { sequencingSteps, shuffleSeeded } from '../shuffle';

/**
 * Downloadable practice-exam summary: score, per-domain breakdown, then every
 * question with its exam domain, the options (correct one and the taker's pick
 * marked), and the explanation. Option order matches the results page — the
 * seeded per-attempt order, and the fixed Step 1…N order for sequencing.
 */

type Opt = { id: string; text: string };
export type ReportQuestion = {
  id: string;
  type: string;
  domain: string;
  stem: string;
  options: unknown;
  correct: unknown;
  explanation: string;
  references: unknown;
};

export type AttemptReport = {
  attemptId: string;
  examTitle: string;
  examCode: string;
  vendorName: string;
  mode: 'PRACTICE' | 'EXAM';
  submittedAt: Date;
  timeUsedSec: number;
  passingScore: number;
  score: number;
  correctCount: number;
  total: number;
  passed: boolean;
  perDomain: Record<string, { correct: number; total: number }>;
  questions: ReportQuestion[];
  responses: Responses;
};

const MARGIN = 42;
const WIDTH = A4.width - MARGIN * 2;
const BOTTOM = 54;
const LETTERS = 'ABCDEFGH';

// The standard Helvetica font only encodes WinAnsi. Map the few typographic
// characters our content uses and drop anything else rather than throw.
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');
function clean(text: string): string {
  return text
    .replace(/→/g, '->')
    .replace(/[≥]/g, '>=')
    .replace(/[≤]/g, '<=')
    .replace(/[✓✔]/g, 'v')
    .replace(/\s+/g, ' ')
    .split('')
    .filter((c) => c.charCodeAt(0) < 256 || WIN_ANSI_EXTRA.has(c))
    .join('')
    .trim();
}

class Flow {
  page: PDFPage;
  y: number;
  pages: PDFPage[] = [];
  constructor(private doc: PDFDocument, private fonts: Fonts, first: PDFPage, private footer: string) {
    this.page = first;
    this.pages.push(first);
    this.y = A4.height - MARGIN;
  }
  ensure(h: number) {
    if (this.y - h >= BOTTOM) return;
    this.page = this.doc.addPage([A4.width, A4.height]);
    this.pages.push(this.page);
    this.y = A4.height - MARGIN;
  }
  lines(text: string, size: number, bold: boolean, width: number): string[] {
    const font = bold ? this.fonts.bold : this.fonts.regular;
    const out: string[] = [];
    let line = '';
    for (const w of clean(text).split(' ')) {
      const cand = line ? `${line} ${w}` : w;
      if (line && font.widthOfTextAtSize(cand, size) > width) { out.push(line); line = w; } else line = cand;
    }
    if (line) out.push(line);
    return out;
  }
  text(text: string, opts: { size?: number; bold?: boolean; color?: RGB; indent?: number; gap?: number } = {}) {
    const size = opts.size ?? 10;
    const indent = opts.indent ?? 0;
    const lh = size * 1.38;
    for (const l of this.lines(text, size, !!opts.bold, WIDTH - indent)) {
      this.ensure(lh);
      this.page.drawText(l, { x: MARGIN + indent, y: this.y - size, size, font: opts.bold ? this.fonts.bold : this.fonts.regular, color: opts.color ?? COLORS.slate });
      this.y -= lh;
    }
    this.y -= opts.gap ?? 0;
  }
  rule(color: RGB = COLORS.borderSoft) {
    this.ensure(10);
    this.page.drawLine({ start: { x: MARGIN, y: this.y - 4 }, end: { x: A4.width - MARGIN, y: this.y - 4 }, thickness: 0.6, color });
    this.y -= 12;
  }
  finish() {
    const n = this.pages.length;
    this.pages.forEach((p, i) => {
      p.drawText(clean(`${this.footer}   ·   Page ${i + 1} of ${n}`), { x: MARGIN, y: 28, size: 8, font: this.fonts.regular, color: COLORS.muted });
    });
  }
}

const fmtDuration = (sec: number) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}h ${m}m` : `${m}m ${s}s`;
};
const TYPE_LABEL: Record<string, string> = { SINGLE: 'Multiple choice', MULTI: 'Multiple select', ORDERING: 'Sequencing', TRUE_FALSE: 'True / False' };

export async function renderAttemptReportPdf(r: AttemptReport): Promise<Uint8Array> {
  const { doc, page, fonts } = await newA4Doc();
  doc.setTitle(clean(`${r.examCode} practice exam summary`));
  doc.setAuthor('Tertiary Exams');

  // Header bar
  page.drawRectangle({ x: 0, y: A4.height - 46, width: A4.width, height: 46, color: COLORS.slate });
  page.drawText('Practice Exam Summary', { x: MARGIN, y: A4.height - 30, size: 16, font: fonts.bold, color: COLORS.white });
  const flow = new Flow(doc, fonts, page, `Tertiary Exams · ${r.vendorName} ${r.examCode} · original practice questions, not real exam items`);
  flow.y = A4.height - 70;

  flow.text(`${r.vendorName} · ${r.examCode} · ${r.mode === 'EXAM' ? 'Exam mode' : 'Practice mode'}`, { size: 9, bold: true, color: COLORS.muted });
  flow.text(r.examTitle, { size: 15, bold: true, gap: 4 });
  flow.text(`Score: ${r.correctCount} / ${r.total} (${r.score}%)   ·   Pass mark: ${r.passingScore}%   ·   Result: ${r.passed ? 'Above the pass mark' : 'Below the pass mark'}`, { size: 11, bold: true, color: r.passed ? COLORS.green : COLORS.red });
  flow.text(`Submitted ${r.submittedAt.toISOString().slice(0, 16).replace('T', ' ')} UTC   ·   Time used ${fmtDuration(r.timeUsedSec)}`, { size: 9, color: COLORS.muted, gap: 8 });

  // Per-domain breakdown, weakest first.
  flow.text('Performance by exam domain', { size: 12, bold: true, gap: 2 });
  const domains = Object.entries(r.perDomain).sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total);
  for (const [name, d] of domains) {
    flow.ensure(16);
    const pct = Math.round((d.correct / d.total) * 100);
    const y = flow.y - 10;
    flow.page.drawText(clean(name), { x: MARGIN, y, size: 10, font: fonts.regular, color: COLORS.slate });
    const figure = `${d.correct} / ${d.total}  (${pct}%)`;
    flow.page.drawText(figure, { x: A4.width - MARGIN - fonts.bold.widthOfTextAtSize(figure, 10), y, size: 10, font: fonts.bold, color: COLORS.slate });
    const barX = MARGIN + 280, barW = 120;
    flow.page.drawRectangle({ x: barX, y: y - 1, width: barW, height: 8, color: COLORS.blueSoft });
    flow.page.drawRectangle({ x: barX, y: y - 1, width: (barW * d.correct) / d.total, height: 8, color: pct >= r.passingScore ? COLORS.green : COLORS.amber });
    flow.y -= 16;
  }
  flow.y -= 6;
  flow.rule(COLORS.slate);

  // Every question with answers, explanation and domain.
  flow.text('Questions, answers and explanations', { size: 12, bold: true, gap: 4 });
  r.questions.forEach((q, i) => {
    const opts = (Array.isArray(q.options) ? q.options : []) as Opt[];
    const correctIds = ((q.correct as string[]) || []).map(String);
    const ans = r.responses[q.id]?.answer ?? [];
    const flagged = !!r.responses[q.id]?.flagged;
    const right = ans.length > 0 && isAnswerCorrect({ type: q.type as any, correct: correctIds as any }, ans);
    const status = !ans.length ? 'Unanswered' : right ? 'Correct' : 'Incorrect';

    flow.ensure(60);
    flow.text(`Question ${i + 1}  ·  Exam domain: ${q.domain}  ·  ${TYPE_LABEL[q.type] ?? q.type}`, { size: 8.5, bold: true, color: COLORS.muted });
    flow.text(`${status}${flagged ? '  ·  Flagged for review' : ''}`, { size: 9, bold: true, color: !ans.length ? COLORS.amber : right ? COLORS.green : COLORS.red });
    flow.text(q.stem, { size: 10.5, bold: true, gap: 3 });

    if (q.type === 'ORDERING') {
      const steps = sequencingSteps(opts, correctIds, q.id);
      const stepNo = (id: string) => steps.findIndex((o) => o.id === id) + 1;
      steps.forEach((o, n) => flow.text(`Step ${n + 1}.  ${o.text}`, { size: 10, indent: 10 }));
      flow.text(`Your sequence: ${ans.length ? ans.map(stepNo).join(' -> ') : 'not answered'}`, { size: 10, bold: true, indent: 10, color: right ? COLORS.green : COLORS.red });
      flow.text(`Correct sequence: ${correctIds.map(stepNo).join(' -> ')}`, { size: 10, bold: true, indent: 10, color: COLORS.green });
    } else {
      const shown = q.type === 'TRUE_FALSE' ? opts : shuffleSeeded(opts, `${r.attemptId}:${q.id}`);
      shown.forEach((o, n) => {
        const isRight = correctIds.includes(o.id);
        const picked = ans.includes(o.id);
        const tags = [isRight ? 'Correct answer' : '', picked ? 'Your answer' : ''].filter(Boolean).join(' · ');
        flow.text(`${LETTERS[n] ?? '?'}.  ${o.text}${tags ? `   [${tags}]` : ''}`, {
          size: 10, indent: 10, bold: isRight, color: isRight ? COLORS.green : picked ? COLORS.red : COLORS.slate
        });
      });
    }

    flow.y -= 3;
    flow.text(`Why · Exam domain: ${q.domain}`, { size: 8.5, bold: true, color: COLORS.blue });
    flow.text(q.explanation, { size: 9.5, color: COLORS.slate });
    const refs = (Array.isArray(q.references) ? q.references : []) as (string | { label?: string; url?: string })[];
    const refText = refs
      .map((ref) => (typeof ref === 'string' ? ref : [ref.label, ref.url].filter(Boolean).join(' — ')))
      .filter(Boolean);
    if (refText.length) flow.text(`References: ${refText.join('; ')}`, { size: 8, color: COLORS.muted });
    flow.y -= 4;
    flow.rule();
  });

  flow.finish();
  return doc.save();
}
