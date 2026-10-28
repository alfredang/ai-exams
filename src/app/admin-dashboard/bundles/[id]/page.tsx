import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { ExternalLink, Library, Ticket, Trash2 } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { ExamPicker } from '@/components/admin/exam-picker';
import { CertificationSections } from '@/components/admin/certification-sections';
import {
  PRACTICE_PRICE_CENTS, displayExamCode, practiceHref, syncProductItems, voucherOnSale, voucherTitleFor
} from '@/lib/products';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user as { id: string };
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

// The title and description are edited in Certification details below (they
// are also the question bank's exam title and description); this form only has
// them while no question bank is linked.
async function updatePracticeExam(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const slug = slugify(String(formData.get('slug') || ''));
  const published = formData.get('published') === 'on';
  const copy = formData.has('title')
    ? { title: String(formData.get('title') || '').trim(), description: String(formData.get('description') || '').trim() }
    : null;
  if (!slug || (copy && !copy.title)) redirect(`/admin-dashboard/bundles/${id}?error=required`);
  const clash = await db.bundle.findFirst({ where: { slug, NOT: { id } }, select: { id: true } });
  if (clash) redirect(`/admin-dashboard/bundles/${id}?error=slug`);
  // The price is not editable: every Practice Exam is PRACTICE_PRICE_CENTS.
  await db.bundle.update({ where: { id }, data: { ...copy, slug, published, price: PRACTICE_PRICE_CENTS } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'bundle.update', targetType: 'Bundle', targetId: id, metadata: { slug, published } }
  });
  revalidatePath(`/admin-dashboard/bundles/${id}`);
  revalidatePath('/admin-dashboard/bundles');
  redirect(`/admin-dashboard/bundles/${id}?saved=1`);
}

async function changeQuestionBank(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const examId = formData.getAll('examId').map(String).find(Boolean);
  if (!examId) return;
  // Re-points the Practice Exam AND its Exam Voucher at the new question bank.
  await syncProductItems(db, id, examId);
  await db.adminLog.create({
    data: { adminId: user.id, action: 'bundle.question_bank', targetType: 'Bundle', targetId: id, metadata: { examId } }
  });
  revalidatePath(`/admin-dashboard/bundles/${id}`);
}

async function deleteProduct(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const b = await db.bundle.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } });
  if (!b) return;
  if (b._count.orders > 0) {
    // Orders reference it: take both products off sale instead of deleting.
    await db.bundle.update({ where: { id }, data: { published: false, voucherPublished: false } });
  } else {
    await db.bundle.delete({ where: { id } });
  }
  await db.adminLog.create({
    data: {
      adminId: user.id,
      action: b._count.orders > 0 ? 'bundle.disabled' : 'bundle.delete',
      targetType: 'Bundle',
      targetId: id,
      metadata: {}
    }
  });
  revalidatePath('/admin-dashboard/bundles');
  redirect('/admin-dashboard/bundles');
}

export default async function PracticeExamDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  /** `cert` is the certification sections' flash: saved | weights | slug | required. */
  searchParams: Promise<{ saved?: string; error?: string; cert?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id } = await params;
  const sp = await searchParams;
  const bundle = await db.bundle.findUnique({
    where: { id },
    include: {
      items: {
        include: { exam: { include: { vendor: true, _count: { select: { questions: { where: { status: 'PUBLISHED' } } } } } } },
        orderBy: { position: 'asc' }
      }
    }
  });
  if (!bundle) notFound();
  const [practiceOrders, voucherOrders, examRows] = await Promise.all([
    db.order.count({ where: { bundleId: id, status: 'PAID', tier: 'PRACTICE' } }),
    db.order.count({ where: { bundleId: id, status: 'PAID', tier: 'VOUCHER' } }),
    db.exam.findMany({
      where: { deletedAt: null, poolExamId: null },
      orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }],
      select: { id: true, code: true, title: true, label: true, vendor: { select: { name: true } } }
    })
  ]);
  const bank = (bundle.items.find((i) => i.tier === 'PRACTICE') ?? bundle.items[0])?.exam;
  const vendorSlug = bank?.vendor.slug;
  const totalOrders = practiceOrders + voucherOrders;
  const hasVoucher = bundle.priceVoucher != null;

  return (
    <div>
      <PageHeader
        title={bundle.title}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-200">Practice Exam</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${bundle.published ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {bundle.published ? 'On sale' : 'Off sale'}
            </span>
            <span>· {practiceOrders} sold</span>
          </span>
        }
        back={{ href: '/admin-dashboard/bundles', label: 'Back to Practice Exams' }}
        actions={
          <div className="flex items-center gap-2">
            {vendorSlug && bundle.published && (
              <Link href={practiceHref(vendorSlug, bundle)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-3 text-[12px] text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                <ExternalLink className="h-3 w-3" /> View on site
              </Link>
            )}
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={bundle.id} />
              <ConfirmButton
                message={
                  totalOrders > 0
                    ? `Take this Practice Exam and its Exam Voucher off sale? They have ${totalOrders} order(s), so they can't be deleted.`
                    : 'Delete this Practice Exam and its Exam Voucher? The question bank is kept. This cannot be undone.'
                }
              >
                <Trash2 className="mr-1 h-3 w-3" />
                {totalOrders > 0 ? 'Take off sale' : 'Delete'}
              </ConfirmButton>
            </form>
          </div>
        }
      />

      {sp.saved && <Notice tone="ok">Practice Exam saved.</Notice>}
      {sp.error === 'slug' && <Notice tone="error">That URL slug is already used by another Practice Exam.</Notice>}
      {sp.error === 'required' && <Notice tone="error">Title and URL slug are required.</Notice>}

      <div className="grid gap-4 lg:grid-cols-3">
        <form action={updatePracticeExam} className="card space-y-3 p-4 lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Practice Exam listing</h2>
          <input type="hidden" name="id" value={bundle.id} />
          {!bank && (
            <>
              <Field label="Title" hint="Once a question bank is linked, edit this in Certification details on this page.">
                <input name="title" defaultValue={bundle.title} required className="input-sm" />
              </Field>
              <Field label="Description">
                <textarea name="description" rows={4} defaultValue={bundle.description} className="w-full rounded-md border border-slate-200 bg-white p-2 text-[12px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </Field>
            </>
          )}
          {bank && (
            <p className="text-[12px] text-slate-500">
              Title and description: <a href="#certification" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Certification details</a> below.
            </p>
          )}
          <Field label="URL slug" hint={`Page address: /practice-exams/${vendorSlug ?? '<vendor>'}/${bundle.slug}`}>
            <input name="slug" defaultValue={bundle.slug} required className="input-sm font-mono" />
          </Field>
          <Field label="Price" hint="Every Practice Exam is the same price.">
            <div className="flex h-8 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[12px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {formatMoney(PRACTICE_PRICE_CENTS)} <span className="ml-2 font-normal text-slate-500">fixed</span>
            </div>
          </Field>
          <label className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
            <input type="checkbox" name="published" defaultChecked={bundle.published} />
            On sale (shown in the Practice Exams catalog)
          </label>
          <div className="pt-2">
            <button className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
              Save Practice Exam
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <section className="card p-4">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"><Ticket className="h-3.5 w-3.5" /> Exam Voucher</h2>
            {hasVoucher ? (
              <>
                <div className="mt-2 text-[13px] font-medium">{voucherTitleFor(bundle)}</div>
                <div className="mt-2 space-y-1 text-[13px]">
                  <Row k="Price" v={formatMoney(bundle.priceVoucher!)} />
                  <Row k="Status" v={voucherOnSale(bundle) ? 'On sale' : 'Off sale'} />
                  <Row k="Sold" v={String(voucherOrders)} />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Includes this Practice Exam automatically.</p>
                <Link href={`/admin-dashboard/bundles/${bundle.id}/voucher`} className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-300 text-[12px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  Edit Exam Voucher
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-[12px] text-slate-600 dark:text-slate-300">No Exam Voucher for this certification yet.</p>
                <Link href={`/admin-dashboard/bundles/${bundle.id}/voucher`} className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-md bg-emerald-600 text-[12px] font-medium text-white hover:bg-emerald-700">
                  + Add Exam Voucher
                </Link>
              </>
            )}
          </section>

          <section className="card p-4">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"><Library className="h-3.5 w-3.5" /> Question bank</h2>
            {bank ? (
              <>
                <Link href={`/admin-dashboard/exams/${bank.id}`} className="mt-2 block text-[13px] font-medium text-blue-600 hover:underline dark:text-blue-400">
                  {bank.vendor.name} · {displayExamCode(bank.code)}
                </Link>
                <div className="mt-2 space-y-1 text-[13px]">
                  <Row k="Questions in bank" v={String(bank._count.questions)} />
                  <Row k="Per attempt" v={String(Math.min(bank.questionCount, bank._count.questions))} />
                  <Row k="Exam mode timer" v={`${bank.durationMinutes} min`} />
                  <Row k="Pass mark" v={`${bank.passingScore}%`} />
                </div>
                <Link href={`/admin-dashboard/exams/${bank.id}#questions`} className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-300 text-[12px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  Manage questions
                </Link>
              </>
            ) : (
              <p className="mt-2 text-[12px] text-amber-700 dark:text-amber-300">No question bank linked — pick one below.</p>
            )}
            <details className="mt-3 text-[12px]" open={!bank}>
              <summary className="cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">{bank ? 'Change question bank' : 'Link a question bank'}</summary>
              <form action={changeQuestionBank} className="mt-2 space-y-2">
                <input type="hidden" name="id" value={bundle.id} />
                <ExamPicker
                  name="examId"
                  options={examRows.map((e) => ({ id: e.id, code: e.code, title: e.title, vendor: e.vendor.name, label: e.label }))}
                  excludeIds={bank ? [bank.id] : []}
                  placeholder="Search question banks…"
                />
                <button className="inline-flex h-8 items-center rounded-md bg-slate-800 px-3 text-[12px] font-medium text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600">
                  Use selected question bank
                </button>
              </form>
            </details>
          </section>
        </div>
      </div>

      {bank && (
        <div className="mt-4">
          {/* A retired variant's settings live on its pool exam. */}
          <CertificationSections examId={bank.poolExamId ?? bank.id} flash={sp.cert} />
        </div>
      )}
    </div>
  );
}

function Notice({ tone, children }: { tone: 'ok' | 'error'; children: React.ReactNode }) {
  return (
    <div className={`mb-4 rounded-md border px-3 py-2 text-[12px] ${tone === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-200'}`}>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-slate-100 py-1 last:border-0 dark:border-slate-800/70">
      <span className="text-slate-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
