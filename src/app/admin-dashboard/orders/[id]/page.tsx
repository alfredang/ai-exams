import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { fulfillOrder } from '@/lib/fulfill';
import { sendTemplated } from '@/lib/email/templates';
import { formatPrice, tierLabel } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/badge';

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
  revalidatePath(`/admin-dashboard/orders/${id}`);
}

async function issueRefund(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const reason = String(formData.get('reason') || '').trim() || null;
  const amountStr = String(formData.get('amount') || '').trim();
  const manualRef = String(formData.get('manualRef') || '').trim() || null;
  const recordOnly = formData.get('recordOnly') === 'on';
  const order = await db.order.findUnique({ where: { id }, include: { refunds: true } });
  if (!order) return;
  const already = order.refunds
    .filter((r) => r.status === 'SUCCEEDED')
    .reduce((sum, r) => sum + r.amount, 0);
  const remaining = order.amount - already;
  const dollars = amountStr === '' ? remaining / 100 : Number(amountStr);
  if (!Number.isFinite(dollars) || dollars <= 0) return;
  const amountCents = Math.round(dollars * 100);
  const { refundOrder } = await import('@/lib/payments/refund');
  await refundOrder({ orderId: id, amountCents, reason, byAdminId: user.id, manualRef, recordOnly });
  revalidatePath(`/admin-dashboard/orders/${id}`);
  revalidatePath('/admin-dashboard/orders');
}

async function revokeAccess(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const order = await db.order.findUnique({ where: { id }, select: { status: true } });
  if (!order || order.status !== 'REFUNDED') return;
  const { revokeOrderAccess } = await import('@/lib/payments/refund');
  await revokeOrderAccess(id);
  await db.adminLog.create({
    data: { adminId: user.id, action: 'order.revoke-access', targetType: 'Order', targetId: id, metadata: {} }
  });
  revalidatePath(`/admin-dashboard/orders/${id}`);
}

async function resendConfirmation(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const order = await db.order.findUnique({
    where: { id },
    include: { user: true, exam: true, bundle: true, invoice: true }
  });
  if (!order || order.status !== 'PAID') return;
  await sendTemplated(
    'ORDER_CONFIRMATION',
    order.user.email,
    {
      productName: order.bundle?.title ?? order.exam?.title ?? '',
      tierLabel: order.bundle ? 'Bundle' : (order.tier ? tierLabel(order.tier) : ''),
      paymentMethod: order.provider,
      voucherPending: order.tier === 'VOUCHER' || order.tier === 'BUNDLE' || !!order.bundleId,
      invoiceNumber: order.invoice?.number ?? null,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      user: { name: order.user.name, email: order.user.email }
    }
  );
  await db.adminLog.create({
    data: { adminId: user.id, action: 'order.resend-confirmation', targetType: 'Order', targetId: order.id }
  });
  revalidatePath(`/admin-dashboard/orders/${id}`);
}

type TimelineEntry = {
  at: Date;
  kind: 'order' | 'admin' | 'refund' | 'webhook';
  title: string;
  detail?: string;
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      exam: { include: { vendor: true } },
      bundle: { include: { items: { include: { exam: true } } } },
      billingAddress: true,
      invoice: true,
      refunds: {
        include: { byAdmin: { select: { email: true, name: true } }, creditNoteInvoice: true },
        orderBy: { createdAt: 'desc' }
      },
      webhookEvents: { orderBy: { receivedAt: 'desc' } }
    }
  });
  if (!order) return notFound();

  const entitlements = await db.entitlement.findMany({
    where: { userId: order.userId, ...(order.examId ? { examId: order.examId } : {}) },
    include: { exam: true, delivery: true },
    orderBy: { grantedAt: 'desc' }
  });

  const adminLogs = await db.adminLog.findMany({
    where: { targetType: 'Order', targetId: order.id },
    include: { admin: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const refundsSucceeded = order.refunds.filter((r) => r.status === 'SUCCEEDED');
  const totalRefunded = refundsSucceeded.reduce((s, r) => s + r.amount, 0);
  const remaining = order.amount - totalRefunded;

  // Build the merged timeline
  const timeline: TimelineEntry[] = [
    { at: order.createdAt, kind: 'order' as const, title: `Order created`, detail: `via ${order.provider}` },
    ...(order.capturedAt
      ? ([{ at: order.capturedAt, kind: 'order', title: 'Payment captured' }] as TimelineEntry[])
      : []),
    ...(order.refundedAt
      ? ([{ at: order.refundedAt, kind: 'order', title: 'Order fully refunded' }] as TimelineEntry[])
      : []),
    ...adminLogs.map((l): TimelineEntry => ({
      at: l.createdAt,
      kind: 'admin',
      title: l.action,
      detail: l.admin.name ? `${l.admin.name} · ${l.admin.email}` : l.admin.email
    })),
    ...order.refunds.map((r): TimelineEntry => ({
      at: r.createdAt,
      kind: 'refund',
      title: `Refund ${r.status} ${formatPrice(r.amount, r.currency)}`,
      detail: r.reason || r.providerRefundId || undefined
    })),
    ...order.webhookEvents.map((w): TimelineEntry => ({
      at: w.receivedAt,
      kind: 'webhook',
      title: `Webhook ${w.status} — ${w.eventType}`,
      detail: w.error ?? undefined
    }))
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div>
      <PageHeader
        title={order.number ?? `Order ${order.id.slice(0, 10)}`}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={order.status} />
            <span>·</span>
            <span>{order.provider}</span>
            <span>·</span>
            <span>created {order.createdAt.toLocaleString()}</span>
          </span>
        }
        back={{ href: '/admin-dashboard/orders', label: 'Back to orders' }}
        actions={
          order.invoice && (
            <Link
              href={`/admin-dashboard/invoices/${order.invoice.id}`}
              className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              View invoice {order.invoice.number}
            </Link>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {/* Customer + Product */}
          <div className="grid gap-3 sm:grid-cols-2">
            <section className="card p-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Customer</h2>
              <Link href={`/admin-dashboard/users/${order.user.id}`} className="mt-1 block font-medium text-blue-600 hover:underline dark:text-blue-400">
                {order.user.name || order.user.email}
              </Link>
              {order.user.name && <div className="text-[12px] text-slate-500">{order.user.email}</div>}
            </section>
            <section className="card p-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Product</h2>
              {order.bundle ? (
                <div className="mt-1">
                  <div className="font-medium">{order.bundle.title}</div>
                  <div className="text-[11px] text-slate-500">Bundle</div>
                </div>
              ) : order.exam ? (
                <div className="mt-1">
                  <div className="font-medium">{order.exam.title}</div>
                  <div className="text-[11px] text-slate-500">{order.exam.vendor.name} · {order.exam.code} · {order.tier ? tierLabel(order.tier) : ''}</div>
                </div>
              ) : (
                <div className="mt-1 text-[12px] text-slate-500">No product attached</div>
              )}
              <div className="mt-2 text-xl font-semibold">{formatPrice(order.amount, order.currency)}</div>
              {totalRefunded > 0 && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400">
                  Refunded {formatPrice(totalRefunded, order.currency)} · Remaining {formatPrice(Math.max(0, remaining), order.currency)}
                </div>
              )}
            </section>
          </div>

          {/* Entitlements */}
          <section className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Entitlements</h2>
              {order.status === 'REFUNDED' && entitlements.length > 0 && (
                <form action={revokeAccess}>
                  <input type="hidden" name="id" value={order.id} />
                  <button className="inline-flex h-7 items-center rounded-md border border-red-200 px-2 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40">
                    Revoke remaining access
                  </button>
                </form>
              )}
            </div>
            {entitlements.length === 0 ? (
              <p className="mt-1 text-[12px] text-slate-500">None yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100 text-[12px] dark:divide-slate-800/70">
                {entitlements.map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <span className="font-medium">{e.exam.code}</span>
                      <span className="ml-2 text-slate-500">{e.exam.title}</span>
                      <span className="ml-2 text-[10px] text-slate-400">{e.tier}</span>
                      {e.voucher && (
                        <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 font-mono text-[10px] text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">
                          {e.voucher}
                        </span>
                      )}
                    </div>
                    {e.delivery && (
                      <StatusBadge status={e.delivery.status} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Refunds */}
          <section className="card p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Refunds</h2>
            {order.refunds.length === 0 ? (
              <p className="mt-1 text-[12px] text-slate-500">None yet.</p>
            ) : (
              <table className="mt-2 w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="py-1">When</th>
                    <th className="py-1 text-right">Amount</th>
                    <th className="py-1">Status</th>
                    <th className="py-1">By</th>
                    <th className="py-1">Reason / Ref</th>
                    <th className="py-1">Credit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {order.refunds.map((r) => (
                    <tr key={r.id}>
                      <td className="py-1.5">{r.createdAt.toLocaleString()}</td>
                      <td className="py-1.5 text-right font-medium">{formatPrice(r.amount, r.currency)}</td>
                      <td className="py-1.5"><StatusBadge status={r.status} /></td>
                      <td className="py-1.5 text-slate-500">{r.byAdmin.name ?? r.byAdmin.email}</td>
                      <td className="py-1.5 text-slate-500">
                        {r.reason ?? r.providerRefundId ?? '—'}
                        {r.failureMessage && (
                          <div className="text-[10px] text-red-600">{r.failureMessage}</div>
                        )}
                      </td>
                      <td className="py-1.5">
                        {r.creditNoteInvoice ? (
                          <Link
                            href={`/admin-dashboard/invoices/${r.creditNoteInvoice.id}`}
                            className="font-mono text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {r.creditNoteInvoice.number}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {order.status === 'PAID' && remaining > 0 && (
              <form action={issueRefund} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={order.id} />
                <label className="flex flex-col text-[10px] uppercase tracking-wider text-slate-500">
                  Amount ({order.currency})
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    max={(remaining / 100).toFixed(2)}
                    placeholder={`Max ${(remaining / 100).toFixed(2)}`}
                    className="input-sm mt-0.5 w-32"
                  />
                </label>
                <label className="flex flex-1 flex-col text-[10px] uppercase tracking-wider text-slate-500">
                  Reason
                  <input name="reason" placeholder="Reason (optional)" className="input-sm mt-0.5 w-full" />
                </label>
                {order.provider === 'PAYNOW' || order.provider === 'TEST' ? (
                  <label className="flex flex-col text-[10px] uppercase tracking-wider text-slate-500">
                    Bank ref
                    <input name="manualRef" placeholder="Bank ref" className="input-sm mt-0.5 w-32" />
                  </label>
                ) : (
                  <>
                    <label className="flex flex-col text-[10px] uppercase tracking-wider text-slate-500">
                      Refund ref
                      <input name="manualRef" placeholder="Optional" className="input-sm mt-0.5 w-32" />
                    </label>
                    <label className="flex h-8 items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300">
                      <input type="checkbox" name="recordOnly" />
                      Already refunded in {order.provider} — record only
                    </label>
                  </>
                )}
                <button className="inline-flex h-8 items-center rounded-md bg-red-600 px-3 text-[12px] font-medium text-white hover:bg-red-700">
                  Issue refund
                </button>
              </form>
            )}
          </section>

          {/* Webhook events */}
          {order.webhookEvents.length > 0 && (
            <section className="card p-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Webhook events</h2>
              <ul className="mt-2 divide-y divide-slate-100 text-[12px] dark:divide-slate-800/70">
                {order.webhookEvents.map((w) => (
                  <li key={w.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <code className="text-[11px]">{w.eventType}</code>
                      <span className="ml-2 text-[10px] text-slate-500">{w.receivedAt.toLocaleString()}</span>
                      {w.error && <div className="text-[10px] text-red-600">{w.error}</div>}
                    </div>
                    <StatusBadge status={w.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Timeline */}
          <section className="card p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Timeline</h2>
            <ol className="mt-3 relative border-l border-slate-200 pl-3 dark:border-slate-700">
              {timeline.map((e, i) => (
                <li key={i} className="mb-2 last:mb-0">
                  <span
                    aria-hidden
                    className={`absolute -left-1.5 mt-1 inline-block h-3 w-3 rounded-full ${
                      e.kind === 'refund' ? 'bg-amber-500' :
                      e.kind === 'admin' ? 'bg-blue-500' :
                      e.kind === 'webhook' ? 'bg-violet-500' : 'bg-emerald-500'
                    }`}
                  />
                  <div className="text-[12px] text-slate-700 dark:text-slate-200">{e.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {e.at.toLocaleString()}
                    {e.detail && <> · {e.detail}</>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-3">
          {/* Provider details */}
          <section className="card p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Provider</h2>
            <dl className="mt-2 grid grid-cols-3 gap-y-1 text-[11px]">
              <dt className="col-span-1 text-slate-500">Provider</dt>
              <dd className="col-span-2 font-medium">{order.provider}</dd>
              <dt className="col-span-1 text-slate-500">Order id</dt>
              <dd className="col-span-2 break-all font-mono">{order.providerOrderId || order.paypalOrderId || '—'}</dd>
              <dt className="col-span-1 text-slate-500">Capture id</dt>
              <dd className="col-span-2 break-all font-mono">{order.providerCaptureId || order.paypalCaptureId || '—'}</dd>
            </dl>
            {(order.providerPayload || order.paypalPayload) && (
              <details className="mt-2 text-[11px]">
                <summary className="cursor-pointer text-slate-500">Raw payload</summary>
                <pre className="mt-1 max-h-72 overflow-auto rounded bg-slate-100 p-2 text-[10px] dark:bg-slate-800">
{JSON.stringify(order.providerPayload || order.paypalPayload, null, 2)}
                </pre>
              </details>
            )}
          </section>

          {/* Billing address */}
          <section className="card p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Billing address</h2>
            {order.billingAddress ? (
              <address className="mt-1 text-[12px] not-italic text-slate-700 dark:text-slate-200">
                {order.billingAddress.fullName}<br />
                {order.billingAddress.company && <>{order.billingAddress.company}<br /></>}
                {order.billingAddress.line1}<br />
                {order.billingAddress.line2 && <>{order.billingAddress.line2}<br /></>}
                {order.billingAddress.city}{order.billingAddress.state ? `, ${order.billingAddress.state}` : ''} {order.billingAddress.postalCode}<br />
                {order.billingAddress.country}
              </address>
            ) : (
              <p className="mt-1 text-[12px] text-slate-500">None.</p>
            )}
          </section>

          {/* Actions sidebar */}
          {order.status === 'PENDING' && (
            <section className="card p-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Mark paid</h2>
              <form action={markPaid} className="mt-2 space-y-2">
                <input type="hidden" name="id" value={order.id} />
                <input type="text" name="reference" placeholder="External ref" className="input-sm" />
                <button className="inline-flex h-8 w-full items-center justify-center rounded-md bg-emerald-600 px-3 text-[12px] font-medium text-white hover:bg-emerald-700">
                  Mark paid
                </button>
              </form>
            </section>
          )}

          {order.status === 'PAID' && (
            <section className="card p-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Email</h2>
              <form action={resendConfirmation} className="mt-2">
                <input type="hidden" name="id" value={order.id} />
                <button className="inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-300 px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  Resend confirmation email
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
