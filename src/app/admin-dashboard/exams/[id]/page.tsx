import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { Sparkles } from 'lucide-react';
import { SubmitBusyButton } from '@/components/admin/submit-busy-button';
import { SeoSavedFlash } from '@/components/admin/seo-saved-flash';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Pager } from '@/components/admin/pager';
import { parseDomains, poolStats } from '@/lib/question-pool';
import { getSetting } from '@/lib/settings';
import { DEFAULT_OPENAI_MODEL } from '@/lib/openai';
import { AddQuestionsPanel } from '@/components/admin/add-questions-panel';
import { QuestionForm } from '@/components/admin/question-form';
import { AiQuestionGenerator } from '@/components/admin/ai-question-generator';
import { createQuestion, deleteQuestion, toggleQuestionStatus } from './question-actions';

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

// Domain weights drive every attempt's draw from the pool. Saving stamps
// domainsVerifiedAt, so a deploy only overwrites this with a newer official
// check from src/lib/exam-blueprints.ts.
async function updateDomainWeights(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  const id = String(formData.get('id'));
  const exam = await db.exam.findUnique({ where: { id }, select: { domains: true } });
  if (!exam) return;
  const before = parseDomains(exam.domains);
  const domains = before.map((d, i) => ({
    name: d.name,
    weight: Math.max(0, Math.round(Number(formData.get(`weight${i}`)) || 0))
  }));
  const sourceRaw = String(formData.get('domainsSourceUrl') || '').trim();
  await db.exam.update({
    where: { id },
    data: { domains, domainsSourceUrl: sourceRaw || null, domainsVerifiedAt: new Date() }
  });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'exam.domain_weights', targetType: 'Exam', targetId: id, metadata: { before, after: domains, sourceUrl: sourceRaw } }
  });
  revalidatePath(`/admin-dashboard/exams/${id}`);
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

export default async function EditExamPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ domain?: string; qstatus?: string; qtype?: string; qpage?: string; edited?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const exam = await db.exam.findUnique({
    where: { id },
    include: { vendor: true, poolExam: { select: { id: true, code: true } }, questions: { orderBy: { createdAt: 'asc' } } }
  });
  if (!exam) notFound();
  const pool = await poolStats(db, exam);
  // Published products that sell this exam (customers reach it through them).
  const sellingProducts = (await db.bundleItem.findMany({
    where: { examId: exam.id, tier: 'PRACTICE', bundle: { published: true } },
    select: { bundle: { select: { title: true } } }
  })).map((bi) => bi.bundle.title);
  const weightTotal = pool.rows.reduce((s, r) => s + r.weight, 0);

  // Question-pool browser filters (?domain=&qstatus=&qtype=), applied in memory
  // — a pool is at most a few hundred rows.
  const domainCounts = new Map<string, number>();
  for (const q of exam.questions) domainCounts.set(q.domain, (domainCounts.get(q.domain) ?? 0) + 1);
  const blueprintOrder = pool.rows.map((r) => r.name);
  const domainList = [...domainCounts.keys()].sort((a, b) => {
    const ia = blueprintOrder.indexOf(a), ib = blueprintOrder.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  const fDomain = sp.domain && domainCounts.has(sp.domain) ? sp.domain : '';
  const fStatus = ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(sp.qstatus ?? '') ? sp.qstatus! : '';
  const fType = ['SINGLE', 'MULTI', 'TRUE_FALSE', 'ORDERING', 'HOTSPOT'].includes(sp.qtype ?? '') ? sp.qtype! : '';
  const shownQuestions = exam.questions.filter(
    (q) => (!fDomain || q.domain === fDomain) && (!fStatus || q.status === fStatus) && (!fType || q.type === fType)
  );
  // 30 questions per page (?qpage=); changing a filter drops back to page 1.
  const Q_PAGE_SIZE = 30;
  const qPages = Math.max(1, Math.ceil(shownQuestions.length / Q_PAGE_SIZE));
  // After an edit, open the page that holds the edited question.
  const editedIdx = sp.edited && !sp.qpage ? shownQuestions.findIndex((q) => q.id === sp.edited) : -1;
  const qPage = Math.min(qPages, Math.max(1, editedIdx >= 0 ? Math.floor(editedIdx / Q_PAGE_SIZE) + 1 : Number(sp.qpage) || 1));
  const pageStart = (qPage - 1) * Q_PAGE_SIZE;
  const pageQuestions = shownQuestions.slice(pageStart, pageStart + Q_PAGE_SIZE);
  const filterHref = (patch: Record<string, string>) => {
    const next = { domain: fDomain, qstatus: fStatus, qtype: fType, ...patch };
    const qs = Object.entries(next).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    return `/admin-dashboard/exams/${exam.id}${qs ? `?${qs}` : ''}#questions`;
  };
  const [openaiKey, openaiModel] = await Promise.all([getSetting('OPENAI_API_KEY'), getSetting('OPENAI_MODEL')]);
  const TYPE_NAMES: Record<string, string> = { SINGLE: 'MCQ', MULTI: 'Multiple select', ORDERING: 'Sequencing', TRUE_FALSE: 'True/False', HOTSPOT: 'Hotspot' };

  return (
    <div className="space-y-6">
      <SeoSavedFlash />
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin-dashboard/exams" className="text-xs text-slate-500 hover:underline">
            ← Back to question banks
          </Link>
          <h1 className="text-2xl font-bold">Edit Question Bank</h1>
          <div className="text-sm text-slate-500">{exam.vendor.name} · {exam.code}</div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/exams/${exam.id}/questions/export`}
            className="btn-outline text-sm"
          >
            Export CSV
          </a>
        </div>
      </div>

      <form action={autoFillFromWeb} className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/40">
        <input type="hidden" name="id" value={exam.id} />
        <div className="flex-1 min-w-[260px]">
          <div className="font-medium">AI Assist — auto-fill from official vendor page</div>
          <div className="text-xs text-slate-500">
            Tavily/Firecrawl find the canonical vendor page (with an OpenAI web-search fallback);
            Firecrawl scrapes it and OpenAI returns the metadata. Overwrites <span className="font-medium">Exam Info URL</span> and <span className="font-medium"># of Exams</span>.
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
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <input type="checkbox" name="published" defaultChecked={exam.published} />
            Active (visible to users)
          </label>
          {sellingProducts.length > 0 && (
            <p className="ml-6 mt-1 text-xs text-slate-500 dark:text-slate-400">
              {exam.published ? 'Also on sale' : 'On sale to buyers'} as Practice Exam: {sellingProducts.join(', ')}.
            </p>
          )}
        </div>
        <div className="md:col-span-1 flex justify-end">
          <button className="btn-primary">Save exam</button>
        </div>
      </form>

      <section id="pool" className="card p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Question pool by exam domain</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Every attempt (practice, exam mode, teaser, retakes) draws {Math.min(exam.questionCount, pool.total)} of the {pool.total} published questions in these proportions.
              {exam.domainsVerifiedAt && <> Weights checked {exam.domainsVerifiedAt.toISOString().slice(0, 10)}.</>}
            </p>
          </div>
          {exam.domainsSourceUrl && (
            <a href={exam.domainsSourceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Official source ↗</a>
          )}
        </div>
        {exam.poolExam && (
          <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            This is a retired practice-exam variant. Its questions now live in the pool of{' '}
            <Link href={`/admin-dashboard/exams/${exam.poolExam.id}#pool`} className="font-semibold underline">{exam.poolExam.code}</Link>.
          </p>
        )}
        {pool.rows.length === 0 ? (
          <p className="text-xs text-slate-500">No domain blueprint set — attempts draw uniformly at random.</p>
        ) : (
          <form action={updateDomainWeights}>
            <input type="hidden" name="id" value={exam.id} />
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700">
                    <th className="py-1.5 pr-3 font-medium">Domain</th>
                    <th className="w-28 py-1.5 pr-3 font-medium">Exam %</th>
                    <th className="w-24 py-1.5 pr-3 text-right font-medium">In pool</th>
                    <th className="w-28 py-1.5 text-right font-medium">Per attempt</th>
                  </tr>
                </thead>
                <tbody>
                  {pool.rows.map((r, i) => (
                    <tr key={r.name} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                      <td className="py-1.5 pr-3">{r.name}</td>
                      <td className="py-1.5 pr-3">
                        <input name={`weight${i}`} type="number" min={0} max={100} defaultValue={r.weight} className="input-sm w-20" aria-label={`${r.name} weight`} />
                      </td>
                      <td className={`py-1.5 pr-3 text-right tabular-nums ${r.pool < r.perAttempt || r.pool === 0 ? 'font-semibold text-red-600' : ''}`}>{r.pool}</td>
                      <td className="py-1.5 text-right tabular-nums">{r.perAttempt}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-[12px] font-semibold">
                    <td className="py-1.5 pr-3">Total</td>
                    <td className={`py-1.5 pr-3 ${weightTotal === 100 ? '' : 'text-red-600'}`}>{weightTotal}%</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums">{pool.rows.reduce((s, r) => s + r.pool, 0)}</td>
                    <td className="py-1.5 text-right tabular-nums">{pool.rows.reduce((s, r) => s + r.perAttempt, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {pool.unmatched.length > 0 && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                Not in the blueprint (used only to fill a short domain):{' '}
                {pool.unmatched.map((u) => `${u.domain} (${u.count})`).join(' · ')}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="flex flex-1 flex-col text-[11px] uppercase tracking-wider text-slate-500">
                Official source URL
                <input name="domainsSourceUrl" type="url" defaultValue={exam.domainsSourceUrl ?? exam.infoUrl ?? ''} className="input-sm mt-0.5 w-full" />
              </label>
              <button className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">Save weights</button>
            </div>
          </form>
        )}
      </section>

      <section id="seo" className="card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">SEO meta</h2>
          <form action={runSeoAssist}>
            <input type="hidden" name="id" value={exam.id} />
            <SubmitBusyButton
              idleLabel={<><Sparkles className="mr-1 h-3 w-3" /> AI Assist</>}
              busyLabel={<>Generating…</>}
              className="inline-flex h-7 items-center rounded-md bg-violet-600 px-2.5 text-xs font-medium text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400"
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

      <section id="questions" className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Question pool ({exam.questions.length})</h2>
            <div className="text-xs text-slate-500">
              {exam.questions.filter((q) => q.status === 'PUBLISHED').length} published ·{' '}
              {exam.questions.filter((q) => q.status === 'DRAFT').length} draft (not drawn) ·{' '}
              {exam.questions.filter((q) => q.status === 'ARCHIVED').length} archived ·{' '}
              each attempt draws {exam.questionCount} published questions by domain · Exam mode {exam.durationMinutes} min · pass {exam.passingScore}%
            </div>
          </div>
          <div className="flex items-center gap-2">
            {exam.questions.some((q) => q.status === 'DRAFT') && (
              <form action={publishAllDrafts}>
                <input type="hidden" name="examId" value={exam.id} />
                <button className="btn-primary text-sm" type="submit">
                  Add {exam.questions.filter((q) => q.status === 'DRAFT').length} drafts to pool
                </button>
              </form>
            )}
            {exam.questions.some((q) => q.status === 'PUBLISHED') && (
              <form action={unpublishAll}>
                <input type="hidden" name="examId" value={exam.id} />
                <ConfirmButton
                  variant="neutral"
                  message={`Take all published questions in "${exam.code}" out of the pool? Learners will get no questions until they are published again.`}
                  className="h-8 px-3 text-sm"
                >
                  Unpublish all
                </ConfirmButton>
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

        <AddQuestionsPanel
          defaultMode={exam.questions.length === 0 ? 'manual' : undefined}
          manual={
            <QuestionForm
              action={createQuestion}
              domains={blueprintOrder}
              hidden={{ examId: exam.id }}
              submitLabel="Add question"
            />
          }
          ai={
            <AiQuestionGenerator
              examId={exam.id}
              domains={pool.rows.map((r) => ({ name: r.name, weight: r.weight, pool: r.pool }))}
              configured={!!openaiKey}
              model={openaiModel.trim() || DEFAULT_OPENAI_MODEL}
            />
          }
        />

        {exam.questions.length > 0 && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-14 shrink-0 font-semibold uppercase tracking-wider text-slate-500">Domain</span>
              <a href={filterHref({ domain: '' })} className={`rounded-full border px-2.5 py-1 ${!fDomain ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>All ({exam.questions.length})</a>
              {domainList.map((d) => (
                <a key={d} href={filterHref({ domain: d })} className={`rounded-full border px-2.5 py-1 ${fDomain === d ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>
                  {d} ({domainCounts.get(d)}){!blueprintOrder.includes(d) && blueprintOrder.length > 0 ? ' · not in blueprint' : ''}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-14 shrink-0 font-semibold uppercase tracking-wider text-slate-500">Status</span>
              {['', 'PUBLISHED', 'DRAFT', 'ARCHIVED'].map((st) => (
                <a key={st || 'all'} href={filterHref({ qstatus: st })} className={`rounded-full border px-2.5 py-1 ${fStatus === st ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>
                  {st ? st.charAt(0) + st.slice(1).toLowerCase() : 'All'}
                </a>
              ))}
              <span className="ml-3 w-10 shrink-0 font-semibold uppercase tracking-wider text-slate-500">Type</span>
              {['', 'SINGLE', 'MULTI', 'ORDERING', 'TRUE_FALSE'].map((t) => (
                <a key={t || 'all'} href={filterHref({ qtype: t })} className={`rounded-full border px-2.5 py-1 ${fType === t ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>
                  {t ? TYPE_NAMES[t] : 'All'}
                </a>
              ))}
            </div>
            <div className="text-slate-500">
              {shownQuestions.length === 0
                ? `Showing 0 of ${exam.questions.length}`
                : `Showing ${pageStart + 1}–${pageStart + pageQuestions.length} of ${shownQuestions.length}${shownQuestions.length < exam.questions.length ? ` (filtered from ${exam.questions.length})` : ''}`}
              {qPages > 1 && ` · page ${qPage} of ${qPages}`}
            </div>
          </div>
        )}

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
              {pageQuestions.map((q, i) => {
                const idx = pageStart + i;
                const opts = (q.options as { id: string; text: string }[]) || [];
                const correct = (q.correct as string[]) || [];
                return (
                  <tr key={q.id} id={`q-${q.id}`} className={`scroll-mt-24 align-top ${sp.edited === q.id ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
                    <td className="px-2 py-2 text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-2 py-2">
                      <div className="font-medium">{q.stem}</div>
                      {q.type === 'ORDERING' ? (
                        <>
                          <ol className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                            {opts.map((o, i) => <li key={`${i}-${o.id}`}>Step {i + 1}. {o.text}</li>)}
                          </ol>
                          <div className="mt-1 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Correct sequence: {correct.map((c) => opts.findIndex((o) => o.id === c) + 1).join(' → ')}
                          </div>
                        </>
                      ) : (
                        <ul className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                          {opts.map((o, i) => (
                            <li key={`${i}-${o.id}`} className={correct.includes(o.id) ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>
                              {o.id.toUpperCase()}. {o.text} {correct.includes(o.id) && '✓'}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-slate-500">{TYPE_NAMES[q.type] ?? q.type}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-slate-500">{q.domain}</td>
                    <td className="whitespace-nowrap px-2 py-2">
                      {q.status === 'PUBLISHED' ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          PUBLISHED
                        </span>
                      ) : q.status === 'ARCHIVED' ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                          ARCHIVED
                        </span>
                      ) : (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2">
                      <div className="flex items-center gap-3">
                        {q.type !== 'HOTSPOT' && (
                          <Link href={`/admin-dashboard/exams/${exam.id}/questions/${q.id}`} className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
                            Edit
                          </Link>
                        )}
                        <form action={toggleQuestionStatus}>
                          <input type="hidden" name="id" value={q.id} />
                          <button
                            className="text-xs text-slate-600 hover:underline dark:text-slate-300"
                            title={q.status === 'PUBLISHED' ? 'Take out of the pool (kept as a draft)' : 'Put into the pool'}
                          >
                            {q.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          </button>
                        </form>
                        <form action={deleteQuestion}>
                          <input type="hidden" name="id" value={q.id} />
                          <ConfirmButton message="Delete this question permanently? Use Unpublish instead to keep it out of the pool." className="h-6 px-1.5 text-xs">
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {exam.questions.length > 0 && shownQuestions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center text-sm text-slate-500">No questions match these filters.</td>
                </tr>
              )}
              {exam.questions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-center text-sm text-slate-500">
                    No questions yet — use Add manually or AI Assist above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={qPage} pages={qPages} buildHref={(p) => filterHref({ qpage: p > 1 ? String(p) : '' })} />
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
      <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}
