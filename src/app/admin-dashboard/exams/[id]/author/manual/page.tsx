import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user as { id: string };
}

async function createBatch(formData: FormData) {
  'use server';
  await requireAdmin();
  const examId = String(formData.get('examId'));
  const publish = formData.get('publish') === 'on';
  if (!examId) return;
  const rows: any[] = [];
  // Form field naming: q{idx}_stem, q{idx}_type, q{idx}_domain, q{idx}_difficulty,
  // q{idx}_explanation, q{idx}_opt{i}, q{idx}_correct{i}, q{idx}_opt{i}_explanation
  const stems = new Map<number, string>();
  for (const [k, v] of formData.entries()) {
    const m = /^q(\d+)_stem$/.exec(k);
    if (m && typeof v === 'string' && v.trim()) stems.set(Number(m[1]), v.trim());
  }
  const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
  for (const [idx] of Array.from(stems.entries()).sort((a, b) => a[0] - b[0])) {
    const stem = String(formData.get(`q${idx}_stem`) || '').trim();
    if (!stem) continue;
    const type = (formData.get(`q${idx}_type`) as 'SINGLE' | 'MULTI' | 'TRUE_FALSE') ?? 'SINGLE';
    const domain = String(formData.get(`q${idx}_domain`) || 'General').trim() || 'General';
    const difficulty = Number(formData.get(`q${idx}_difficulty`) || 3);
    const explanation = String(formData.get(`q${idx}_explanation`) || '').trim();
    const optionTexts: string[] = [];
    const explainPerOption: Record<string, string> = {};
    const correct: string[] = [];
    for (let i = 0; i < 6; i++) {
      const opt = String(formData.get(`q${idx}_opt${i}`) || '').trim();
      if (!opt) continue;
      optionTexts.push(opt);
      const expl = String(formData.get(`q${idx}_opt${i}_explanation`) || '').trim();
      if (expl) explainPerOption[letters[optionTexts.length - 1]] = expl;
      if (formData.get(`q${idx}_correct${i}`) === 'on') correct.push(letters[optionTexts.length - 1]);
    }
    if (optionTexts.length < 2 || correct.length < 1 || !explanation) continue;
    if (type === 'SINGLE' && correct.length !== 1) continue;
    const options = optionTexts.map((text, i) => ({ id: letters[i], text }));
    rows.push({
      examId,
      stem,
      type,
      domain,
      difficulty,
      explanation,
      options,
      correct,
      status: publish ? 'PUBLISHED' : 'DRAFT',
      generatedBy: 'manual',
      references: Object.keys(explainPerOption).length
        ? { explanationByOption: explainPerOption }
        : undefined
    });
  }
  if (rows.length > 0) {
    await db.question.createMany({ data: rows });
  }
  revalidatePath(`/admin-dashboard/exams/${examId}`);
  redirect(`/admin-dashboard/exams/${examId}`);
}

export default async function ManualBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id } = await params;
  const exam = await db.exam.findUnique({ where: { id }, include: { vendor: true } });
  if (!exam) notFound();

  const ROW_COUNT = 5;

  return (
    <div>
      <PageHeader
        title="Manual question batch"
        subtitle={`${exam.vendor.name} · ${exam.code} — enter up to ${ROW_COUNT} questions and submit. Per-answer explanations are optional.`}
        back={{ href: `/admin-dashboard/exams/${id}/author`, label: 'Back to mode chooser' }}
      />
      <form action={createBatch} className="space-y-3">
        <input type="hidden" name="examId" value={id} />
        {Array.from({ length: ROW_COUNT }).map((_, idx) => (
          <details key={idx} open={idx === 0} className="card p-4">
            <summary className="cursor-pointer text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              Question #{idx + 1}
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Field label="Type">
                <select name={`q${idx}_type`} defaultValue="SINGLE" className="input-sm">
                  <option value="SINGLE">Single answer</option>
                  <option value="MULTI">Multiple answers</option>
                  <option value="TRUE_FALSE">True / False</option>
                </select>
              </Field>
              <Field label="Domain">
                <input name={`q${idx}_domain`} placeholder="e.g. Security" defaultValue="General" className="input-sm" />
              </Field>
              <Field label="Difficulty (1-5)">
                <input name={`q${idx}_difficulty`} type="number" min={1} max={5} defaultValue={3} className="input-sm" />
              </Field>
            </div>
            <Field label="Question stem" className="mt-3">
              <textarea name={`q${idx}_stem`} rows={3} className="w-full rounded-md border border-slate-200 bg-white p-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Question text…" />
            </Field>
            <div className="mt-3">
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Options (leave blank to skip; min 2; tick correct ones)
              </div>
              <div className="space-y-1.5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col gap-1 md:flex-row md:items-start md:gap-2">
                    <span className="w-5 pt-1 text-xs font-semibold text-slate-500">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      name={`q${idx}_opt${i}`}
                      placeholder={`Option ${String.fromCharCode(65 + i)} text`}
                      className="input-sm md:flex-1"
                    />
                    <label className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 md:pt-1.5">
                      <input type="checkbox" name={`q${idx}_correct${i}`} /> correct
                    </label>
                    <input
                      name={`q${idx}_opt${i}_explanation`}
                      placeholder="Per-answer explanation (optional)"
                      className="input-sm md:flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
            <Field label="Overall explanation" className="mt-3">
              <textarea name={`q${idx}_explanation`} rows={2} className="w-full rounded-md border border-slate-200 bg-white p-2 text-[13px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Why the correct answer is correct…" />
            </Field>
          </details>
        ))}
        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
            <input type="checkbox" name="publish" defaultChecked />
            Publish immediately (otherwise saved as DRAFT)
          </label>
          <button className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
            Save batch
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}
