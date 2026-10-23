import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { BookOpen, ExternalLink, Ticket } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import {
  PRACTICE_PRICE_CENTS, displayExamCode, syncProductItems, voucherDescriptionFor, voucherHref, voucherOnSale,
  voucherSlugFor, voucherTitleFor
} from '@/lib/products';

export const dynamic = 'force-dynamic';

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function saveVoucher(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  const id = String(formData.get('id'));
  const back = `/admin-dashboard/bundles/${id}/voucher`;
  const bundle = await db.bundle.findUnique({ where: { id }, include: { items: { where: { tier: 'PRACTICE' }, take: 1 } } });
  if (!bundle) notFound();

  const priceStr = String(formData.get('priceVoucher') || '').trim();
  const priceVoucher = priceStr ? Math.round(Number(priceStr) * 100) : null;
  if (priceVoucher != null && (!Number.isFinite(priceVoucher) || priceVoucher <= 0)) redirect(`${back}?error=price`);
  const voucherPublished = formData.get('voucherPublished') === 'on';
  if (voucherPublished && priceVoucher == null) redirect(`${back}?error=price`);
  const voucherSlug = slugify(String(formData.get('voucherSlug') || '')) || voucherSlugFor({ slug: bundle.slug });
  const clash = await db.bundle.findFirst({ where: { voucherSlug, NOT: { id } }, select: { id: true } });
  if (clash) redirect(`${back}?error=slug`);
  // Blank title/description fall back to text generated from the practice exam.
  const voucherTitle = String(formData.get('voucherTitle') || '').trim() || null;
  const voucherDescription = String(formData.get('voucherDescription') || '').trim() || null;

  await db.bundle.update({
    where: { id },
    data: { priceVoucher, voucherPublished, voucherSlug, voucherTitle, voucherDescription }
  });
  // Link the voucher to the practice exam it includes (fulfilment grants both).
  const practice = bundle.items[0];
  if (practice && priceVoucher != null) await syncProductItems(db, id, practice.examId);
  await db.adminLog.create({
    data: { adminId: user.id, action: 'voucher.update', targetType: 'Bundle', targetId: id, metadata: { priceVoucher, voucherPublished, voucherSlug } }
  });
  revalidatePath(back);
  revalidatePath('/admin-dashboard/bundles/vouchers');
  revalidatePath('/admin-dashboard/bundles');
  redirect(`${back}?saved=1`);
}

export default async function ExamVoucherEditPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id } = await params;
  const sp = await searchParams;
  const bundle = await db.bundle.findUnique({
    where: { id },
    include: { items: { where: { tier: 'PRACTICE' }, take: 1, include: { exam: { include: { vendor: true } } } } }
  });
  if (!bundle) notFound();
  const sold = await db.order.count({ where: { bundleId: id, tier: 'VOUCHER', status: 'PAID' } });
  const exam = bundle.items[0]?.exam;
  const code = displayExamCode(exam?.code);
  const vendorSlug = exam?.vendor.slug ?? '<vendor>';
  const isNew = bundle.priceVoucher == null;
  const onSale = voucherOnSale(bundle);

  return (
    <div>
      <PageHeader
        title={isNew ? `Add Exam Voucher — ${code || bundle.title}` : voucherTitleFor(bundle)}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">Exam Voucher</span>
            <span>{isNew ? 'Not sold yet' : onSale ? 'On sale' : 'Off sale'}</span>
            <span>· {sold} sold</span>
          </span>
        }
        back={{ href: '/admin-dashboard/bundles/vouchers', label: 'Back to Exam Vouchers' }}
        actions={
          onSale && exam ? (
            <Link href={voucherHref(exam.vendor.slug, bundle)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-3 text-[12px] text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <ExternalLink className="h-3 w-3" /> View on site
            </Link>
          ) : undefined
        }
      />

      {sp.saved && <Notice tone="ok">Exam Voucher saved.</Notice>}
      {sp.error === 'slug' && <Notice tone="error">That URL slug is already used by another Exam Voucher.</Notice>}
      {sp.error === 'price' && <Notice tone="error">Enter a voucher price above zero to put the Exam Voucher on sale.</Notice>}

      <div className="grid gap-4 lg:grid-cols-3">
        <form action={saveVoucher} className="card space-y-3 p-4 lg:col-span-2">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"><Ticket className="h-3.5 w-3.5" /> Exam Voucher listing</h2>
          <input type="hidden" name="id" value={bundle.id} />
          <Field label="Price (USD)" hint="What the customer pays for the voucher. The Practice Exam is included at no extra cost.">
            <input name="priceVoucher" type="number" step="0.01" min="0" defaultValue={bundle.priceVoucher != null ? (bundle.priceVoucher / 100).toFixed(2) : ''} placeholder="e.g. 165.00" className="input-sm" />
          </Field>
          <Field label="Title" hint={`Leave blank to use “${voucherTitleFor({ title: bundle.title })}”.`}>
            <input name="voucherTitle" defaultValue={bundle.voucherTitle ?? ''} placeholder={voucherTitleFor({ title: bundle.title })} className="input-sm" />
          </Field>
          <Field label="URL slug" hint={`Page address: /exam-vouchers/${vendorSlug}/${voucherSlugFor(bundle)}`}>
            <input name="voucherSlug" defaultValue={voucherSlugFor(bundle)} className="input-sm font-mono" />
          </Field>
          <Field label="Description" hint="Leave blank to use the standard voucher description shown as the placeholder.">
            <textarea
              name="voucherDescription"
              rows={4}
              defaultValue={bundle.voucherDescription ?? ''}
              placeholder={voucherDescriptionFor({}, { vendorName: exam?.vendor.name, code })}
              className="w-full rounded-md border border-slate-200 bg-white p-2 text-[12px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </Field>
          <label className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
            <input type="checkbox" name="voucherPublished" defaultChecked={isNew ? true : bundle.voucherPublished} />
            On sale (shown in the Exam Vouchers catalog and on the Practice Exam page)
          </label>
          <div className="pt-2">
            <button className="inline-flex h-8 items-center rounded-md bg-emerald-600 px-3 text-[12px] font-medium text-white hover:bg-emerald-700">
              {isNew ? 'Add Exam Voucher' : 'Save Exam Voucher'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <section className="card p-4">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"><BookOpen className="h-3.5 w-3.5" /> Includes Practice Exam</h2>
            <Link href={`/admin-dashboard/bundles/${bundle.id}`} className="mt-2 block text-[13px] font-medium text-blue-600 hover:underline dark:text-blue-400">
              {bundle.title}
            </Link>
            <p className="mt-2 text-[12px] text-slate-600 dark:text-slate-300">
              Linked automatically. Buyers get this practice exam the moment they pay (worth {formatMoney(PRACTICE_PRICE_CENTS)}), then the voucher code within 3–5 business days.
            </p>
          </section>
          <section className="card p-4 text-[12px] text-slate-600 dark:text-slate-300">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivering codes</h2>
            <p className="mt-2">Codes are sent from <Link href="/admin-dashboard/vouchers" className="text-blue-600 hover:underline dark:text-blue-400">Vouchers → Deliveries</Link>; stock them under <Link href="/admin-dashboard/vouchers/inventory" className="text-blue-600 hover:underline dark:text-blue-400">Inventory</Link>.</p>
          </section>
        </div>
      </div>
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
