import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { StatusBadge } from '@/components/admin/badge';
import { Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Tier } from '@prisma/client';
import { ExamPicker } from '@/components/admin/exam-picker';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user as { id: string };
}

async function updateBundle(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const title = String(formData.get('title') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const description = String(formData.get('description') || '').trim();
  const price = Math.round(Number(formData.get('price') || 0) * 100);
  const priceVoucherStr = String(formData.get('priceVoucher') || '').trim();
  const priceVoucher = priceVoucherStr ? Math.round(Number(priceVoucherStr) * 100) : null;
  const published = formData.get('published') === 'on';
  await db.bundle.update({ where: { id }, data: { title, slug, description, price, priceVoucher, published } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'bundle.update', targetType: 'Bundle', targetId: id, metadata: {} }
  });
  revalidatePath(`/admin-dashboard/bundles/${id}`);
  revalidatePath('/admin-dashboard/bundles');
}

async function deleteBundle(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const b = await db.bundle.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } });
  if (!b) return;
  if (b._count.orders > 0) {
    // Soft-disable instead of delete to preserve order history.
    await db.bundle.update({ where: { id }, data: { published: false } });
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

async function addItem(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const bundleId = String(formData.get('bundleId'));
  const examIds = formData.getAll('examId').map(String).filter(Boolean);
  const tier = (formData.get('tier') as Tier) ?? 'PRACTICE';
  if (!bundleId || examIds.length === 0) return;
  const last = await db.bundleItem.findFirst({
    where: { bundleId },
    orderBy: { position: 'desc' },
    select: { position: true }
  });
  let nextPosition = (last?.position ?? -1) + 1;
  for (const examId of examIds) {
    await db.bundleItem.upsert({
      where: { bundleId_examId_tier: { bundleId, examId, tier } },
      create: { bundleId, examId, tier, position: nextPosition },
      update: {}
    });
    nextPosition += 1;
  }
  await db.adminLog.create({
    data: { adminId: user.id, action: 'bundle.item.add', targetType: 'Bundle', targetId: bundleId, metadata: { examIds, tier } }
  });
  revalidatePath(`/admin-dashboard/bundles/${bundleId}`);
}

async function removeItem(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const item = await db.bundleItem.findUnique({ where: { id }, select: { bundleId: true } });
  if (!item) return;
  await db.bundleItem.delete({ where: { id } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'bundle.item.remove', targetType: 'Bundle', targetId: item.bundleId, metadata: { itemId: id } }
  });
  revalidatePath(`/admin-dashboard/bundles/${item.bundleId}`);
}

async function moveItem(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  const dir = String(formData.get('dir') || 'up') as 'up' | 'down';
  const item = await db.bundleItem.findUnique({ where: { id } });
  if (!item) return;
  const neighbor = await db.bundleItem.findFirst({
    where: {
      bundleId: item.bundleId,
      position: dir === 'up' ? { lt: item.position } : { gt: item.position }
    },
    orderBy: { position: dir === 'up' ? 'desc' : 'asc' }
  });
  if (!neighbor) return;
  await db.$transaction([
    db.bundleItem.update({ where: { id: item.id }, data: { position: neighbor.position } }),
    db.bundleItem.update({ where: { id: neighbor.id }, data: { position: item.position } })
  ]);
  revalidatePath(`/admin-dashboard/bundles/${item.bundleId}`);
}

export default async function BundleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id } = await params;
  const bundle = await db.bundle.findUnique({
    where: { id },
    include: {
      items: {
        include: { exam: { include: { vendor: true } } },
        orderBy: { position: 'asc' }
      },
      _count: { select: { orders: true } }
    }
  });
  if (!bundle) notFound();
  const examRows = await db.exam.findMany({
    where: { deletedAt: null },
    orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }],
    select: { id: true, code: true, title: true, label: true, vendor: { select: { name: true } } }
  });
  const examOptions = examRows.map((e) => ({ id: e.id, code: e.code, title: e.title, vendor: e.vendor.name, label: e.label }));
  const alreadyAddedIds = bundle.items.map((it) => it.examId);

  return (
    <div>
      <PageHeader
        title={bundle.title}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={bundle.published ? 'PUBLISHED' : 'DRAFT'} />
            <span>· {bundle._count.orders} order{bundle._count.orders === 1 ? '' : 's'}</span>
            <span>· {bundle.items.length} item{bundle.items.length === 1 ? '' : 's'}</span>
          </span>
        }
        back={{ href: '/admin-dashboard/bundles', label: 'Back to bundles' }}
        actions={
          <form action={deleteBundle}>
            <input type="hidden" name="id" value={bundle.id} />
            <ConfirmButton
              message={
                bundle._count.orders > 0
                  ? `Disable bundle? It has ${bundle._count.orders} order(s) so it can't be deleted.`
                  : `Delete bundle? This cannot be undone.`
              }
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {bundle._count.orders > 0 ? 'Disable' : 'Delete'}
            </ConfirmButton>
          </form>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <form action={updateBundle} className="card lg:col-span-2 space-y-3 p-4">
          <input type="hidden" name="id" value={bundle.id} />
          <Field label="Title"><input name="title" defaultValue={bundle.title} required className="input-sm" /></Field>
          <Field label="Slug"><input name="slug" defaultValue={bundle.slug} required className="input-sm" /></Field>
          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={bundle.description} className="w-full rounded-md border border-slate-200 bg-white p-2 text-[12px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Price ($)"><input name="price" type="number" step="0.01" defaultValue={(bundle.price / 100).toFixed(2)} required className="input-sm" /></Field>
            <Field label="Voucher price ($)"><input name="priceVoucher" type="number" step="0.01" defaultValue={bundle.priceVoucher != null ? (bundle.priceVoucher / 100).toFixed(2) : ''} placeholder="Empty = practice-only" className="input-sm" /></Field>
          </div>
          <label className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
            <input type="checkbox" name="published" defaultChecked={bundle.published} />
            Published
          </label>
          <div className="pt-2">
            <button className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
              Save bundle
            </button>
          </div>
        </form>

        <section className="card p-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pricing recap</h2>
          <div className="mt-2 space-y-1 text-[13px]">
            <Row k="Practice price" v={formatPrice(bundle.price, 'SGD')} />
            <Row k="Voucher price" v={bundle.priceVoucher != null ? formatPrice(bundle.priceVoucher, 'SGD') : '—'} />
            <Row k="Items" v={String(bundle.items.length)} />
            <Row k="Orders" v={String(bundle._count.orders)} />
          </div>
          <Link href={`/bundles/${bundle.slug}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[11px] text-blue-600 hover:underline">
            Preview as customer →
          </Link>
        </section>
      </div>

      <section className="card mt-4 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Items ({bundle.items.length})</h2>

        <form action={addItem} className="mt-2 flex flex-wrap items-end gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
          <input type="hidden" name="bundleId" value={bundle.id} />
          <input type="hidden" name="tier" value="PRACTICE" />
          <Field label="Add exam" className="min-w-[24rem] flex-1">
            <ExamPicker name="examId" options={examOptions} excludeIds={alreadyAddedIds} placeholder="Search by code, title, or label…" />
          </Field>
          <button className="inline-flex h-8 items-center rounded-md bg-emerald-600 px-3 text-[12px] font-medium text-white hover:bg-emerald-700">
            Add item
          </button>
        </form>

        {bundle.items.length === 0 ? (
          <p className="mt-3 text-[12px] text-slate-500">No items yet. Use the search above to add an exam to this bundle.</p>
        ) : (
          <table className="mt-3 w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className="py-1 w-10"></th>
                <th className="py-1">Exam</th>
                <th className="py-1">Tier</th>
                <th className="py-1 text-right">Position</th>
                <th className="py-1 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {bundle.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-1.5">
                    <div className="flex gap-0.5">
                      <form action={moveItem} className="inline-flex">
                        <input type="hidden" name="id" value={it.id} />
                        <input type="hidden" name="dir" value="up" />
                        <button title="Move up" className="icon-btn"><ArrowUp className="h-3 w-3" /></button>
                      </form>
                      <form action={moveItem} className="inline-flex">
                        <input type="hidden" name="id" value={it.id} />
                        <input type="hidden" name="dir" value="down" />
                        <button title="Move down" className="icon-btn"><ArrowDown className="h-3 w-3" /></button>
                      </form>
                    </div>
                  </td>
                  <td className="py-1.5">
                    <Link href={`/admin-dashboard/exams/${it.examId}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                      {it.exam.vendor.name} · {it.exam.code}
                    </Link>
                    <div className="text-[10px] text-slate-500">{it.exam.title}</div>
                  </td>
                  <td className="py-1.5">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{it.tier}</span>
                  </td>
                  <td className="py-1.5 text-right text-slate-500">{it.position}</td>
                  <td className="py-1.5 text-right">
                    <form action={removeItem} className="inline-flex">
                      <input type="hidden" name="id" value={it.id} />
                      <ConfirmButton message={`Remove ${it.exam.code} (${it.tier}) from this bundle?`} className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</span>
      {children}
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
