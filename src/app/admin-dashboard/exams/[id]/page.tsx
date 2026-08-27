import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { Sparkles } from 'lucide-react';
import { SubmitBusyButton } from '@/components/admin/submit-busy-button';
import { SeoSavedFlash } from '@/components/admin/seo-saved-flash';
import { ConfirmButton } from '@/components/admin/confirm-button';

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('forbidden');
}

async function autoFillFromWeb(formData: FormData) {
  'use server';
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error('forbidden');
  const adminId = (session!.user as any).id as string;
  const id = String(formData.get('id'));
  if (!id) return;
  const exam = await db.exam.findUnique({ where: { id }, include: { vendor: true } });
  if (!exam) return;
  const { lookupExamInfo } = await import('@/lib/exam-info-lookup');
  try {
    const res = await lookupExamInfo({
      vendor: exam.vendor.name,
      title: exam.title,
      code: exam.code,
      infoUrl: exam.infoUrl ?? undefined
    });
    await db.exam.update({
      where: { id },
      data: { infoUrl: res.infoUrl }
    });
    await db.adminLog.create({
      data: {
        adminId,
        action: 'exam.auto_fill_info',
        targetType: 'Exam',
        targetId: id,
        metadata: { infoUrl: res.infoUrl, notes: res.notes ?? '' }
      }
    });
  } catch (err: any) {
    await db.adminLog.create({
      data: {
        adminId,
        action: 'exam.auto_fill_info_failed',
        targetType: 'Exam',
        targetId: id,
        metadata: { error: String(err?.message || err) }
      }
    });
  }
  revalidatePath(`/admin-dashboard/exams/${id}`);
  revalidatePath('/admin-dashboard/exams');
}

async function updateExam(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  const title = String(formData.get('title') || '').trim();
  const code = String(formData.get('code') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const level = String(formData.get('level') || 'Associate');
  const description = String(formData.get('description') || '');
  const durationMinutes = Number(formData.get('durationMinutes') || 90);
  const passingScore = Number(formData.get('passingScore') || 70);
  const questionCount = Number(formData.get('questionCount') || 60);
  const infoUrlRaw = String(formData.get('infoUrl') || '').trim();
  const infoUrl = infoUrlRaw ? infoUrlRaw : null;
  const labelRaw = String(formData.get('label') || '').trim();
  const label = labelRaw ? labelRaw : null;
  const metaTitle = String(formData.get('metaTitle') || '').trim() || null;
  const metaDescription = String(formData.get('metaDescription') || '').trim() || null;
  const metaKeywords = String(formData.get('metaKeywords') || '').trim() || null;
  const ogImage = String(formData.get('ogImage') || '').trim() || null;
  const published = formData.get('published') === 'on';
  if (!id || !title || !code || !slug) return;
  await db.exam.update({
    where: { id },
    data: {
      title, code, slug, level, description, durationMinutes, passingScore, questionCount, infoUrl, label, published,
      metaTitle, metaDescription, metaKeywords, ogImage
    }
  });
  revalidatePath(`/admin-dashboard/exams/${id}`);
  revalidatePath('/admin-dashboard/exams');
}

async function runSeoAssist(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const id = String(formData.get('id'));
  const exam = await db.exam.findUnique({ where: { id }, include: { vendor: true } });
  if (!exam) return;
  try {
    const { generateSeoForExam } = await import('@/lib/seo-assist');
    const seo = await generateSeoForExam({
      vendor: exam.vendor.name,
      code: exam.code,
      title: exam.title,
      description: exam.description,
      domains: (exam.domains as any[]) || []
    });
    await db.exam.update({
      where: { id },
      data: { metaTitle: seo.title, metaDescription: seo.description, metaKeywords: seo.keywords }
    });
    await db.adminLog.create({
      data: { adminId: user.id, action: 'exam.seo.assist', targetType: 'Exam', targetId: id, metadata: { ...seo } }
    });
  } catch (err: any) {
    await db.adminLog.create({
      data: { adminId: user.id, action: 'exam.seo.assist.failed', targetType: 'Exam', targetId: id, metadata: { error: String(err?.message ?? err) } }
    });
  }
  revalidatePath(`/admin-dashboard/exams/${id}`);
}

async function addQuestion(formData: FormData) {
  'use server';
  await requireAdmin();
  const examId = String(formData.get('examId'));
  const stem = String(formData.get('stem') || '').trim();
  const type = String(formData.get('type') || 'SINGLE') as 'SINGLE' | 'MULTI' | 'TRUE_FALSE';
  const domain = String(formData.get('domain') || 'General').trim() || 'General';
  const difficulty = Number(formData.get('difficulty') || 3);
  const explanation = String(formData.get('explanation') || '').trim();
  const publish = formData.get('publish') === 'on';

  const optionTexts = [0, 1, 2, 3, 4, 5]
    .map((i) => String(formData.get(`opt${i}`) || '').trim())
    .filter(Boolean);
  if (!examId || !stem || optionTexts.length < 2 || !explanation) return;

  const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
  const options = optionTexts.map((text, i) => ({ id: letters[i], text }));
  const correct: string[] = [];
  for (let i = 0; i < optionTexts.length; i++) {
    if (formData.get(`correct${i}`) === 'on') correct.push(letters[i]);
  }
  if (correct.length < 1) return;
  if (type === 'SINGLE' && correct.length !== 1) return;

  await db.question.create({
    data: {
      examId,
      stem,
      type,
      domain,
      difficulty,
      explanation,
      options,
      correct,
      status: publish ? 'PUBLISHED' : 'DRAFT',
      generatedBy: 'manual'
    }
  });
  revalidatePath(`/admin-dashboard/exams/${examId}`);
  revalidatePath('/admin-dashboard/exams');
}

async function deleteQuestion(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  const examId = String(formData.get('examId'));
  if (!id) return;
  await db.question.delete({ where: { id } });
  revalidatePath(`/admin-dashboard/exams/${examId}`);
}

async function toggleQuestionStatus(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  const examId = String(formData.get('examId'));
  const q = await db.question.findUnique({ where: { id } });
  if (!q) return;
  await db.question.update({
    where: { id },
    data: { status: q.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }
  });
  revalidatePath(`/admin-dashboard/exams/${examId}`);
}

async function publishAllDrafts(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const examId = String(formData.get('examId'));
  if (!examId) return;
  const result = await db.question.updateMany({
    where: { examId, status: 'DRAFT' },
    data: { status: 'PUBLISHED' }
  });
  await db.adminLog.create({
    data: {
      adminId: user.id,
      action: 'question.bulk_publish',
      targetType: 'Exam',
      targetId: examId,
      metadata: { count: result.count }
    }
  });
  revalidatePath(`/admin-dashboard/exams/${examId}`);
}

async function unpublishAll(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const examId = String(formData.get('examId'));
  if (!examId) return;
  const result = await db.question.updateMany({
    where: { examId, status: 'PUBLISHED' },
    data: { status: 'DRAFT' }
  });
  await db.adminLog.create({
    data: {
      adminId: user.id,
      action: 'question.bulk_unpublish',
      targetType: 'Exam',
      targetId: examId,
      metadata: { count: result.count }
    }
  });
  revalidatePath(`/admin-dashboard/exams/${examId}`);
}

// HARD DELETE every question for an exam. Irreversible. Useful before a
// refill-from-curated-set migration. Guarded by ADMIN + a typed
// confirmation in the UI (ConfirmButton). Logs the count.
async function deleteAllQuestions(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const examId = String(formData.get('examId'));
  if (!examId) return;
  const result = await db.question.deleteMany({ where: { examId } });
  if (result.count === 0) return;
  await db.adminLog.create({
    data: {
      adminId: user.id,
      action: 'question.bulk_hard_delete',
      targetType: 'Exam',
      targetId: examId,
      metadata: { count: result.count }
    }
  });
  revalidatePath(`/admin-dashboard/exams/${examId}`);
}

async function saveSeoMeta(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  if (!id) return;
  const metaTitle = String(formData.get('metaTitle') || '').trim() || null;
  const metaDescription = String(formData.get('metaDescription') || '').trim() || null;
  const metaKeywords = String(formData.get('metaKeywords') || '').trim() || null;
  const ogImage = String(formData.get('ogImage') || '').trim() || null;
  await db.exam.update({
    where: { id },
    data: { metaTitle, metaDescription, metaKeywords, ogImage }
  });
  revalidatePath(`/admin-dashboard/exams/${id}`);
  redirect(`/admin-dashboard/exams/${id}?seo=saved#seo`);
}

const LEVELS = ['Foundational', 'Associate', 'Professional', 'Specialty'];

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await db.exam.findUnique({
    where: { id },
    include: { vendor: true, questions: { orderBy: { createdAt: 'asc' } } }
  });
  if (!exam) notFound();

  return (
    <div className="space-y-6">
      <SeoSavedFlash />
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin-dashboard/exams" className="text-xs text-slate-500 hover:underline">
            ← Back to exams
          </Link>
          <h1 className="text-2xl font-bold">Edit Exam</h1>
          <div className="text-sm text-slate-500">{exam.vendor.name} · {exam.code}</div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/exams/${exam.id}/questions/export`}
            className="btn-outline text-sm"
          >
            Export CSV
          </a>
          <Link
            href={`/admin-dashboard/exams/${exam.id}/author`}
            className="btn-outline text-sm"
          >
            Author questions →
          </Link>
        </div>
      </div>

      <form action={autoFillFromWeb} className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/40">
        <input type="hidden" name="id" value={exam.id} />
        <div className="flex-1 min-w-[260px]">
          <div className="font-medium">AI Assist — auto-fill from official vendor page</div>
          <div className="text-xs text-slate-500">
            Tavily/Firecrawl find the canonical vendor page (with a Claude Agent fallback that uses WebSearch);
            Firecrawl scrapes it and Claude returns the metadata. Overwrites <span className="font-medium">Exam Info URL</span> and <span className="font-medium"># of Exams</span>.
          </div>
        </div>
        <SubmitBusyButton
          idleLabel={<><Sparkles className="mr-1 h-3.5 w-3.5" /> AI Assist</>}
          busyLabel={<>Looking up…</>}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400"
        />
      </form>

      <form action={updateExam} className="card grid gap-3 p-4 md:grid-cols-3">
        <input type="hidden" name="id" value={exam.id} />
        <Field label="Exam title" className="md:col-span-3">
          <input name="title" defaultValue={exam.title} className="input" required />
        </Field>
        <Field label="Code">
          <input name="code" defaultValue={exam.code} className="input" required />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={exam.slug} className="input" required />
        </Field>
        <Field label="Level">
          <select name="level" defaultValue={exam.level} className="input">
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Duration (min)">
          <input name="durationMinutes" type="number" min={1} defaultValue={exam.durationMinutes} className="input" />
        </Field>
        <Field label="Pass %">
          <input name="passingScore" type="number" min={0} max={100} defaultValue={exam.passingScore} className="input" />
        </Field>
        <Field label="Questions per exam">
          <input name="questionCount" type="number" min={1} defaultValue={exam.questionCount} className="input" />
        </Field>
        <Field label="Exam Info URL (vendor page or PDF)" className="md:col-span-2">
          <input name="infoUrl" type="url" placeholder="https://aws.amazon.com/certification/..." defaultValue={exam.infoUrl ?? ''} className="input" />
        </Field>
        <Field label="Label (optional)" className="md:col-span-1">
          <input name="label" placeholder="e.g. Practice Exam 1" defaultValue={exam.label ?? ''} className="input" />
        </Field>
        <Field label="Description" className="md:col-span-3">
          <input name="description" defaultValue={exam.description ?? ''} className="input" />
        </Field>
        <label className="md:col-span-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={exam.published} />
          Active (visible to users)
        </label>
        <div className="md:col-span-1 flex justify-end">
          <button className="btn-primary">Save exam</button>
        </div>
      </form>

      <section id="seo" className="card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">SEO meta</h2>
          <form action={runSeoAssist}>
            <input type="hidden" name="id" value={exam.id} />
            <SubmitBusyButton
              idleLabel={<><Sparkles className="mr-1 h-3 w-3" /> AI Assist</>}
              busyLabel={<>Generating…</>}
              className="inline-flex h-7 items-center rounded-md bg-violet-600 px-2.5 text-[11px] font-medium text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400"
            />
          </form>
        </div>
        <form action={saveSeoMeta} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="id" value={exam.id} />
          <Field label="Meta title (≤70 chars)" className="md:col-span-2">
            <input name="metaTitle" defaultValue={exam.metaTitle ?? ''} className="input" placeholder="AWS SAA-C03 Practice Exam | Tertiary Exams" />
          </Field>
          <Field label="Meta description (120–180 chars)" className="md:col-span-2">
            <textarea name="metaDescription" defaultValue={exam.metaDescription ?? ''} rows={2} className="input" />
          </Field>
          <Field label="Meta keywords (comma-separated)">
            <input name="metaKeywords" defaultValue={exam.metaKeywords ?? ''} className="input" />
          </Field>
          <Field label="OG image URL (optional)">
            <input name="ogImage" defaultValue={exam.ogImage ?? ''} className="input" />
          </Field>
          <div className="md:col-span-2 flex justify-end">
            <SubmitBusyButton
              idleLabel={<>Save SEO</>}
              busyLabel={<>Saving…</>}
              className="btn-primary disabled:cursor-wait disabled:opacity-70"
            />
          </div>
        </form>
      </section>

      <section className="card p-4">
        <h2 className="text-lg font-semibold">Add MCQ question</h2>
        <p className="text-xs text-slate-500">
          Tick the correct option(s). Single-answer = exactly 1; Multi-answer = 1 or more.
        </p>
        <form action={addQuestion} className="mt-3 grid gap-3 md:grid-cols-3">
          <input type="hidden" name="examId" value={exam.id} />
          <Field label="Type">
            <select name="type" defaultValue="SINGLE" className="input">
              <option value="SINGLE">Single answer</option>
              <option value="MULTI">Multiple answers</option>
              <option value="TRUE_FALSE">True/False</option>
            </select>
          </Field>
          <Field label="Domain">
            <input name="domain" placeholder="e.g. Security" defaultValue="General" className="input" />
          </Field>
          <Field label="Difficulty (1-5)">
            <input name="difficulty" type="number" min={1} max={5} defaultValue={3} className="input" />
          </Field>
          <Field label="Question stem" className="md:col-span-3">
            <textarea name="stem" required rows={3} className="input" placeholder="Question text…" />
          </Field>

          <div className="md:col-span-3">
            <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              Options (leave blank to skip; min 2)
            </div>
            <div className="grid gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 text-xs font-semibold text-slate-500">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    name={`opt${i}`}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="input flex-1"
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <input type="checkbox" name={`correct${i}`} /> correct
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Field label="Explanation" className="md:col-span-3">
            <textarea name="explanation" required rows={2} className="input" placeholder="Why the correct answer is correct…" />
          </Field>

          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="publish" defaultChecked />
            Publish immediately (else save as draft)
          </label>
          <div className="md:col-span-1 flex justify-end">
            <button className="btn-primary">Add question</button>
          </div>
        </form>
      </section>

      <section className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Questions ({exam.questions.length})</h2>
            <div className="text-xs text-slate-500">
              {exam.questions.filter((q) => q.status === 'DRAFT').length} draft ·{' '}
              {exam.questions.filter((q) => q.status === 'PUBLISHED').length} published ·{' '}
              Target: {exam.questionCount} · Duration: {exam.durationMinutes} min
            </div>
          </div>
          <div className="flex items-center gap-2">
            {exam.questions.some((q) => q.status === 'DRAFT') && (
              <form action={publishAllDrafts}>
                <input type="hidden" name="examId" value={exam.id} />
                <button className="btn-primary text-sm" type="submit">
                  Publish all drafts ({exam.questions.filter((q) => q.status === 'DRAFT').length})
                </button>
              </form>
            )}
            {exam.questions.some((q) => q.status === 'PUBLISHED') && (
              <form action={unpublishAll}>
                <input type="hidden" name="examId" value={exam.id} />
                <button className="btn-outline text-sm" type="submit">
                  Unpublish all
                </button>
              </form>
            )}
            {exam.questions.length > 0 && (
              <form action={deleteAllQuestions}>
                <input type="hidden" name="examId" value={exam.id} />
                <ConfirmButton
                  variant="danger"
                  message={`HARD DELETE all ${exam.questions.length} questions for "${exam.code}"? This is IRREVERSIBLE — the questions are removed from the database entirely. Use this before a curated refill.`}
                  className="h-8 px-3 text-sm"
                >
                  Delete all
                </ConfirmButton>
              </form>
            )}
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-max min-w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="w-10 px-2 py-2 font-medium">#</th>
                <th className="w-[36rem] px-2 py-2 font-medium">Question</th>
                <th className="w-24 px-2 py-2 font-medium">Type</th>
                <th className="w-32 px-2 py-2 font-medium">Domain</th>
                <th className="w-24 px-2 py-2 font-medium">Status</th>
                <th className="w-40 px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {exam.questions.map((q, idx) => {
                const opts = (q.options as { id: string; text: string }[]) || [];
                const correct = (q.correct as string[]) || [];
                return (
                  <tr key={q.id} className="align-top">
                    <td className="px-2 py-2 text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-2 py-2">
                      <div className="font-medium">{q.stem}</div>
                      <ul className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                        {opts.map((o, i) => (
                          <li key={`${i}-${o.id}`} className={correct.includes(o.id) ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>
                            {o.id.toUpperCase()}. {o.text} {correct.includes(o.id) && '✓'}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-slate-500">{q.type}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-slate-500">{q.domain}</td>
                    <td className="whitespace-nowrap px-2 py-2">
                      {q.status === 'PUBLISHED' ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                          PUBLISHED
                        </span>
                      ) : (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2">
                      <div className="flex items-center gap-3">
                        <form action={toggleQuestionStatus}>
                          <input type="hidden" name="id" value={q.id} />
                          <input type="hidden" name="examId" value={exam.id} />
                          <button className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                            {q.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          </button>
                        </form>
                        <form action={deleteQuestion}>
                          <input type="hidden" name="id" value={q.id} />
                          <input type="hidden" name="examId" value={exam.id} />
                          <button className="text-xs text-red-600 hover:underline">Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {exam.questions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center text-sm text-slate-500">
                    No questions yet. Add one above or use AI Generate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  className,
  children
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-sm ${className || ''}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}
