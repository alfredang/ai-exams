import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdminRole } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CSV import. Expected columns (header row required, order flexible):
 *   stem, type, domain, difficulty, opt_a, opt_b, opt_c, opt_d, opt_e, opt_f,
 *   correct (pipe-joined option ids), explanation, status, isTeaser
 *
 * Mirror format of the export endpoint so a round-trip works.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const me = session?.user as any;
  if (!isAdminRole(me?.role)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const exam = await db.exam.findUnique({ where: { id }, select: { id: true } });
  if (!exam) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'no_file' }, { status: 400 });
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return NextResponse.json({ error: 'empty' }, { status: 400 });
  const header = splitCsv(lines[0]).map((c) => c.toLowerCase());
  const colIdx = (name: string) => header.indexOf(name);

  const idx = {
    stem: colIdx('stem'),
    type: colIdx('type'),
    domain: colIdx('domain'),
    difficulty: colIdx('difficulty'),
    a: colIdx('opt_a'),
    b: colIdx('opt_b'),
    c: colIdx('opt_c'),
    d: colIdx('opt_d'),
    e: colIdx('opt_e'),
    f: colIdx('opt_f'),
    correct: colIdx('correct'),
    explanation: colIdx('explanation'),
    status: colIdx('status'),
    isTeaser: colIdx('isteaser')
  };
  if (idx.stem === -1 || idx.correct === -1 || idx.explanation === -1) {
    return NextResponse.json({ error: 'missing_required_columns', required: ['stem', 'correct', 'explanation'] }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsv(lines[i]);
    const stem = (cols[idx.stem] ?? '').trim();
    if (!stem) { skipped++; continue; }
    const opts: { id: string; text: string }[] = [];
    const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
    const optCols = [idx.a, idx.b, idx.c, idx.d, idx.e, idx.f];
    for (let k = 0; k < 6; k++) {
      const col = optCols[k];
      if (col === -1) continue;
      const v = (cols[col] ?? '').trim();
      if (v) opts.push({ id: letters[k], text: v });
    }
    const correct = (cols[idx.correct] ?? '').split('|').map((s) => s.trim()).filter(Boolean);
    if (opts.length < 2 || correct.length === 0) { skipped++; continue; }
    const explanation = (cols[idx.explanation] ?? '').trim();
    if (!explanation) { skipped++; continue; }
    try {
      await db.question.create({
        data: {
          examId: id,
          stem,
          type: (cols[idx.type]?.trim() as any) || 'SINGLE',
          domain: cols[idx.domain]?.trim() || 'General',
          difficulty: Math.max(1, Math.min(5, Number(cols[idx.difficulty]) || 3)),
          explanation,
          options: opts,
          correct,
          status: (cols[idx.status]?.trim() as any) || 'PUBLISHED',
          isTeaser: cols[idx.isTeaser]?.trim().toLowerCase() === 'true',
          generatedBy: 'csv-import'
        }
      });
      created++;
    } catch (e: any) {
      errors.push(`row ${i + 1}: ${e?.message ?? e}`);
      skipped++;
    }
  }

  await db.adminLog.create({
    data: {
      adminId: me.id,
      action: 'exam.questions.import',
      targetType: 'Exam',
      targetId: id,
      metadata: { created, skipped, errors: errors.slice(0, 10) }
    }
  });

  return NextResponse.json({ created, skipped, errors });
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}
