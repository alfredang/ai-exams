import Link from 'next/link';
import { db } from '@/lib/db';
import { formatMoney, tierLabel, genVoucherCode } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { fulfillOrder } from '@/lib/fulfill';
import { auth } from '@/lib/auth';
import type { OrderStatus, Prisma } from '@prisma/client';
import { Pencil, Trash2, Ticket, CheckCircle2, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { StatusBadge } from '@/components/admin/badge';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { ActionMenu, ActionItem } from '@/components/admin/action-menu';
import { buildQS } from '@/components/admin/qs';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user as { id: string };
}

async function markPaid(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const reference = String(formData.get('reference') || '').trim() || null;
  const order = await db.order.findUnique({ where: { id } });
  if (!order || order.status === 'PAID') return;
  await fulfillOrder(order.id, { manualConfirm: true, reference, byAdminId: user.id }, reference || order.id);
  await db.adminLog.create({
    data: { adminId: user.id, action: 'order.mark-paid', targetType: 'Order', targetId: order.id, metadata: { reference, provider: order.provider } }
  });
  revalidatePath('/admin-dashboard/orders');
}

async function refund(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const order = await db.order.findUnique({ where: { id }, include: { refunds: true } });
  if (!order || order.status !== 'PAID') return;
  const already = order.refunds
    .filter((r) => r.status === 'SUCCEEDED')
    .reduce((sum, r) => sum + r.amount, 0);
  const remaining = order.amount - already;
  if (remaining <= 0) return;
  const { refundOrder } = await import('@/lib/payments/refund');
  await refundOrder({
    orderId: id,
    amountCents: remaining,
    reason: 'Full refund',
    byAdminId: user.id
  });
  revalidatePath('/admin-dashboard/orders');
  revalidatePath(`/admin-dashboard/orders/${id}`);
}

async function deleteOrder(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const order = await db.order.findUnique({ where: { id } });
  if (!order) return;
  if (order.status === 'PAID') return; // refuse: keeps fulfilment history
  await db.order.delete({ where: { id } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'order.delete', targetType: 'Order', targetId: id, metadata: { status: order.status } }
  });
  revalidatePath('/admin-dashboard/orders');
}

async function assignVoucher(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const orderId = String(formData.get('orderId'));
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { exam: { select: { vendorId: true } } }
  });
  if (!order || order.status !== 'PAID' || !order.examId || !order.userId) return;
  let ent = await db.entitlement.findFirst({
    where: { userId: order.userId, examId: order.examId, tier: 'VOUCHER' }
  });
  if (!ent) {
    ent = await db.entitlement.create({
      data: { userId: order.userId, examId: order.examId, tier: 'VOUCHER' }
    });
  }
  if (ent.voucher) {
    await db.adminLog.create({
      data: { adminId: user.id, action: 'order.assign-voucher.noop', targetType: 'Order', targetId: orderId, metadata: { reason: 'already-assigned', voucher: ent.voucher } }
    });
    revalidatePath('/admin-dashboard/orders');
    return;
  }
  // 1) Try vendor inventory FIFO. Falls through to synthetic on miss.
  let code: string | null = null;
  let source: 'inventory' | 'synthetic' = 'synthetic';
  if (order.exam?.vendorId) {
    code = await (await import('@/lib/voucher-inventory')).claimNextInventoryCode(
      { vendorId: order.exam.vendorId, examId: order.examId },
      ent.id
    );
    if (code) source = 'inventory';
  }
  if (!code) {
    let attempt = genVoucherCode();
    for (let i = 0; i < 5; i++) {
      const exists = await db.entitlement.findFirst({ where: { voucher: attempt } });
      if (!exists) break;
      attempt = genVoucherCode();
    }
    code = attempt;
  }
  await db.entitlement.update({ where: { id: ent.id }, data: { voucher: code } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'order.assign-voucher', targetType: 'Order', targetId: orderId, metadata: { voucher: code, entitlementId: ent.id, source } }
  });
  revalidatePath('/admin-dashboard/orders');
  revalidatePath('/admin-dashboard/vouchers');
  revalidatePath('/admin-dashboard/vouchers/inventory');
}

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  q?: string;
  status?: string;
  examId?: string;
  vendorId?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

type OrderRow = Awaited<ReturnType<typeof loadOrders>>[number];

async function loadOrders(where: Prisma.OrderWhereInput, skip: number, take: number) {
  return db.order.findMany({
    where,
    include: { user: true, exam: { include: { vendor: true } }, bundle: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take
  });
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const status = sp.status as OrderStatus | undefined;
  const examId = (sp.examId || '').trim();
  const vendorId = (sp.vendorId || '').trim();
  const fromStr = (sp.from || '').trim();
  const toStr = (sp.to || '').trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.OrderWhereInput = {};
  if (status && ['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(status)) where.status = status;
  if (examId) where.examId = examId;
  if (vendorId) where.exam = { vendorId };

  const fromDate = fromStr ? new Date(fromStr) : null;
  const toDate = toStr ? new Date(toStr) : null;
  if (toDate) toDate.setHours(23, 59, 59, 999);
  if ((fromDate && !isNaN(fromDate.getTime())) || (toDate && !isNaN(toDate.getTime()))) {
    where.createdAt = {
      ...(fromDate && !isNaN(fromDate.getTime()) ? { gte: fromDate } : {}),
      ...(toDate && !isNaN(toDate.getTime()) ? { lte: toDate } : {})
    };
  }
  if (q) {
    where.OR = [
      { id: { contains: q } },
      { number: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { name: { contains: q, mode: 'insensitive' } } }
    ];
  }

  const [total, orders, vendors, exams] = await Promise.all([
    db.order.count({ where }),
    loadOrders(where, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    db.vendor.findMany({ orderBy: { name: 'asc' } }),
    db.exam.findMany({
      where: vendorId ? { vendorId } : undefined,
      orderBy: [{ vendor: { name: 'asc' } }, { title: 'asc' }],
      select: { id: true, code: true, title: true, vendor: { select: { name: true } } }
    })
  ]);

  const orFilters = orders
    .filter((o) => o.userId && o.examId)
    .map((o) => ({ userId: o.userId!, examId: o.examId! }));
  const voucherEnts = orFilters.length
    ? await db.entitlement.findMany({
        where: { tier: 'VOUCHER', OR: orFilters },
        select: { userId: true, examId: true, voucher: true }
      })
    : [];
  const voucherByKey = new Map<string, string | null>();
  for (const e of voucherEnts) voucherByKey.set(`${e.userId}::${e.examId}`, e.voucher);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const baseParams = { q, status, examId, vendorId, from: fromStr, to: toStr };
  const buildHref = (p: number) =>
    `/admin-dashboard/orders${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const activeFilters = [
    q && {
      key: 'search',
      label: q,
      clearHref: `/admin-dashboard/orders${buildQS({ ...baseParams, q: undefined })}`
    },
    status && {
      key: 'status',
      label: status,
      clearHref: `/admin-dashboard/orders${buildQS({ ...baseParams, status: undefined })}`
    },
    vendorId && {
      key: 'vendor',
      label: vendors.find((v) => v.id === vendorId)?.name ?? vendorId,
      clearHref: `/admin-dashboard/orders${buildQS({ ...baseParams, vendorId: undefined, examId: undefined })}`
    },
    examId && {
      key: 'exam',
      label: exams.find((e) => e.id === examId)?.code ?? examId,
      clearHref: `/admin-dashboard/orders${buildQS({ ...baseParams, examId: undefined })}`
    },
    fromStr && {
      key: 'from',
      label: fromStr,
      clearHref: `/admin-dashboard/orders${buildQS({ ...baseParams, from: undefined })}`
    },
    toStr && {
      key: 'to',
      label: toStr,
      clearHref: `/admin-dashboard/orders${buildQS({ ...baseParams, to: undefined })}`
    }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const columns: Column<OrderRow>[] = [
    {
      key: 'number',
      header: 'Order No.',
      cell: (o) => (
        <Link
          href={`/admin-dashboard/orders/${o.id}`}
          className="font-mono text-[12px] font-semibold text-slate-900 hover:underline dark:text-slate-100"
          title={o.id}
        >
          {o.number ?? o.id.slice(0, 10)}
        </Link>
      )
    },
    {
      key: 'name',
      header: 'Name',
      cell: (o) => (
        <span className="text-slate-900 dark:text-slate-100">
          {o.user.name || <span className="text-slate-400">—</span>}
        </span>
      )
    },
    {
      key: 'email',
      header: 'Email',
      cell: (o) => <span className="text-[12px] text-slate-700 dark:text-slate-200">{o.user.email}</span>
    },
    {
      key: 'product',
      header: 'Exam Purchased',
      cell: (o) => {
        const productLabel = o.bundle ? `${o.bundle.title} (bundle)` : o.exam?.title ?? '(unknown)';
        const tierLabelText = o.tier ? tierLabel(o.tier) : o.bundle ? 'Practice Exam' : '—';
        return (
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{productLabel}</div>
            <div className="text-xs text-slate-500">{tierLabelText}</div>
          </div>
        );
      }
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (o) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {formatMoney(o.amount, o.currency)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (o) => (
        <div>
          <StatusBadge status={o.status} />
          <div className="mt-0.5 text-[11px] text-slate-500">{o.provider}</div>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Purchased',
      cell: (o) => <span className="text-[12px] text-slate-700 dark:text-slate-200">{o.createdAt.toLocaleString()}</span>
    },
    {
      key: 'voucher',
      header: 'Voucher',
      cell: (o) => {
        const isVoucherTier = o.tier === 'VOUCHER' || o.tier === 'BUNDLE';
        const voucherKey = o.userId && o.examId ? `${o.userId}::${o.examId}` : null;
        const existing = voucherKey ? voucherByKey.get(voucherKey) ?? null : null;
        if (!isVoucherTier || !o.userId || !o.examId) return <span className="text-slate-400">—</span>;
        if (existing) {
          return (
            <span className="rounded bg-violet-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">
              {existing}
            </span>
          );
        }
        if (o.status !== 'PAID') return <span className="text-slate-400">—</span>;
        return (
          <form action={assignVoucher} className="inline-flex">
            <input type="hidden" name="orderId" value={o.id} />
            <button
              type="submit"
              title="Generate and assign a voucher code"
              className="inline-flex h-6 items-center gap-1 rounded bg-violet-600 px-2 text-xs font-medium text-white hover:bg-violet-700"
            >
              <Ticket className="h-3 w-3" />
              Assign
            </button>
          </form>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      headerClassName: 'w-20',
      cell: (o) => {
        const canDelete = o.status !== 'PAID';
        return (
          <div className="flex items-center justify-end gap-0.5">
            <Link
              href={`/admin-dashboard/orders/${o.id}`}
              title="Edit order"
              className="icon-btn"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            <ActionMenu>
              {o.status === 'PENDING' && o.provider === 'PAYNOW' && (
                <ActionItem asChild>
                  <form action={markPaid} className="flex items-center gap-1 p-1">
                    <input type="hidden" name="id" value={o.id} />
                    <input
                      type="text"
                      name="reference"
                      placeholder="Bank ref"
                      className="h-7 w-24 rounded border border-slate-200 px-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-7 items-center gap-1 rounded bg-emerald-600 px-2 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Paid
                    </button>
                  </form>
                </ActionItem>
              )}
              {o.status === 'PAID' && (
                <ActionItem asChild>
                  <form action={refund}>
                    <input type="hidden" name="id" value={o.id} />
                    <button type="submit" className="flex w-full items-center gap-2">
                      <RotateCcw className="h-3 w-3" />
                      Mark refunded
                    </button>
                  </form>
                </ActionItem>
              )}
              <ActionItem asChild destructive>
                <form action={deleteOrder}>
                  <input type="hidden" name="id" value={o.id} />
                  <ConfirmButton
                    message="Delete this order? Only allowed when not PAID."
                    disabled={!canDelete}
                    title={canDelete ? 'Delete order' : 'Cannot delete a PAID order'}
                    className="w-full justify-start gap-2 px-0"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </ConfirmButton>
                </form>
              </ActionItem>
            </ActionMenu>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="View Orders"
        subtitle={`${total} order${total === 1 ? '' : 's'}${pages > 1 ? ` · page ${page} of ${pages}` : ''}`}
      />

      <FilterBar
        resetHref={activeFilters.length > 0 ? '/admin-dashboard/orders' : undefined}
        activeFilters={activeFilters}
      >
        <FilterField label="Search" className="min-w-[14rem] flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Email, name, or order id…"
            className="input-sm"
          />
        </FilterField>
        <FilterField label="Vendor">
          <select name="vendorId" defaultValue={vendorId} className="input-sm">
            <option value="">All vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Exam">
          <select name="examId" defaultValue={examId} className="input-sm">
            <option value="">All exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.vendor.name} — {e.code}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Status">
          <select name="status" defaultValue={status ?? ''} className="input-sm">
            <option value="">All statuses</option>
            <option>PENDING</option>
            <option>PAID</option>
            <option>FAILED</option>
            <option>REFUNDED</option>
          </select>
        </FilterField>
        <FilterField label="From">
          <input type="date" name="from" defaultValue={fromStr} className="input-sm" />
        </FilterField>
        <FilterField label="To">
          <input type="date" name="to" defaultValue={toStr} className="input-sm" />
        </FilterField>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={orders}
        rowKey={(o) => o.id}
        empty="No orders match the filters."
      />

      <Pager page={page} pages={pages} buildHref={buildHref} />
    </div>
  );
}
