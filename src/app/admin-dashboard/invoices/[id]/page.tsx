import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatMoney } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/badge';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { sendPurchaseEmail, sendRefundEmail } from '@/lib/mail';
import { buildInvoiceLines } from '@/lib/invoice/build-lines';
import { orderIdForInvoice } from '@/lib/invoice/issue';
import { formatTaxRate, invoiceTaxVars } from '@/lib/invoice/tax';
import { renderPdfForInvoice } from '@/lib/invoice/pdf-for-invoice';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user as { id: string };
}

async function voidInvoice(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const reason = String(formData.get('reason') || '').trim() || null;
  const inv = await db.invoice.findUnique({ where: { id } });
  if (!inv || inv.status !== 'ISSUED') return;
  await db.invoice.update({
    where: { id },
    data: { status: 'VOID', voidedAt: new Date(), voidReason: reason }
  });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'invoice.void', targetType: 'Invoice', targetId: id, metadata: { reason } }
  });
  revalidatePath(`/admin-dashboard/invoices/${id}`);
  revalidatePath('/admin-dashboard/invoices');
}

async function issueCreditNote(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const reason = String(formData.get('reason') || '').trim() || null;
  const orig = await db.invoice.findUnique({ where: { id } });
  if (!orig || orig.status !== 'ISSUED') return;
  // Issue a full credit note for the invoice total.
  const { issueCreditNoteForInvoice } = await import('@/lib/invoice/issue');
  const cn = await issueCreditNoteForInvoice(orig.id, orig.total);
  await db.adminLog.create({
    data: {
      adminId: user.id,
      action: 'invoice.credit-note',
      targetType: 'Invoice',
      targetId: id,
      metadata: { creditNoteId: cn.id, creditNoteNumber: cn.number, reason }
    }
  });
  revalidatePath(`/admin-dashboard/invoices/${id}`);
  revalidatePath(`/admin-dashboard/invoices/${cn.id}`);
  revalidatePath('/admin-dashboard/invoices');
}

async function resendInvoice(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const inv = await db.invoice.findUnique({
    where: { id },
    include: { order: { include: { exam: true, bundle: true } }, user: true, refund: true }
  });
  if (!inv) return;
  if (inv.status === 'CREDIT_NOTE') {
    const orderId = await orderIdForInvoice(inv);
    if (orderId) await sendRefundEmail(orderId, inv.id, -inv.total, false).catch(() => {});
  }
  if (!inv.order) {
    await db.adminLog.create({
      data: { adminId: user.id, action: 'invoice.resend', targetType: 'Invoice', targetId: id, metadata: { to: inv.billingEmail } }
    });
    return;
  }
  const pdf = await renderPdfForInvoice(inv);
  // Use the purchase email shape with the invoice attached. Even for a
  // resend we reuse the template so the recipient gets a familiar email.
  const product = inv.order.bundle
    ? inv.order.bundle.title
    : inv.order.exam?.title ?? 'Order';
  const tier = inv.order.bundle ? 'Bundle' : inv.order.tier ?? 'PRACTICE';
  await sendPurchaseEmail(
    inv.billingEmail,
    product,
    tier,
    undefined,
    undefined,
    false,
    {
      order: { id: inv.order.number ?? inv.order.id, amount: inv.total, currency: inv.currency },
      user: { name: inv.user.name, email: inv.billingEmail },
      paymentMethod: inv.order.provider
    },
    { invoicePdf: pdf, invoiceNumber: inv.number, tax: invoiceTaxVars(inv) }
  ).catch(() => {});
  await db.adminLog.create({
    data: { adminId: user.id, action: 'invoice.resend', targetType: 'Invoice', targetId: id, metadata: { to: inv.billingEmail } }
  });
  revalidatePath(`/admin-dashboard/invoices/${id}`);
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      user: true,
      order: { include: { exam: { include: { vendor: true } }, bundle: true } },
      creditNotes: { orderBy: { issueDate: 'asc' } },
      creditNoteOf: { include: { order: true } }
    }
  });
  if (!invoice) notFound();
  const order = invoice.order ?? invoice.creditNoteOf?.order ?? null;

  const lines = await buildInvoiceLines(invoice);

  return (
    <div>
      <PageHeader
        title={invoice.number}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            <span>·</span>
            <span>Issued {invoice.issueDate.toISOString().slice(0, 10)}</span>
          </span>
        }
        back={{ href: '/admin-dashboard/invoices', label: 'Back to invoices' }}
        actions={
          <>
            <a
              href={`/api/admin/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <FileText className="mr-1 h-3.5 w-3.5" /> Open PDF
            </a>
            <a
              href={`/api/admin/invoices/${invoice.id}/pdf?download=1`}
              download
              className="btn-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="mr-1 h-3.5 w-3.5" /> Download
            </a>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="card p-4">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Bill to</h2>
            <div className="mt-2 text-[13px] text-slate-900 dark:text-slate-100">{invoice.billingName}</div>
            <div className="text-[12px] text-slate-500">{invoice.billingEmail}</div>
            {invoice.billingAddress && (
              <pre className="mt-2 whitespace-pre-wrap text-[12px] text-slate-600 dark:text-slate-300">
                {invoice.billingAddress}
              </pre>
            )}
          </div>

          <div className="card p-4">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Items</h2>
            <table className="mt-2 w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-1">Description</th>
                  <th className="py-1 text-right">Qty</th>
                  <th className="py-1 text-right">Unit</th>
                  <th className="py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {lines.map((ln, i) => (
                  <tr key={i}>
                    <td className="py-1.5">{ln.description}</td>
                    <td className="py-1.5 text-right">{ln.qty}</td>
                    <td className="py-1.5 text-right">{formatMoney(ln.unitAmount, invoice.currency)}</td>
                    <td className="py-1.5 text-right font-medium">{formatMoney(ln.qty * ln.unitAmount, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 ml-auto max-w-xs text-[13px]">
              <div className="flex justify-between py-0.5"><span className="text-slate-500">Subtotal{invoice.taxAmount !== 0 && ` (excl. ${invoice.taxLabel})`}</span><span>{formatMoney(invoice.subtotal, invoice.currency)}</span></div>
              {invoice.taxAmount !== 0 && (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">{invoice.taxLabel} {formatTaxRate(invoice.taxRate)} (included)</span>
                  <span>{formatMoney(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-semibold dark:border-slate-700">
                <span>Total{invoice.taxAmount !== 0 && ` (incl. ${invoice.taxLabel})`}</span>
                <span>{formatMoney(invoice.total, invoice.currency)}</span>
              </div>
              {invoice.totalSgd != null && invoice.currency.toUpperCase() !== 'SGD' && (
                <div className="text-right text-[11px] text-slate-500">
                  ≈ {formatMoney(invoice.totalSgd, 'SGD')} @ {(invoice.fxRateBpsToSgd ?? 10000) / 10000}
                </div>
              )}
            </div>
          </div>

          {(invoice.creditNotes.length > 0 || invoice.creditNoteOf) && (
            <div className="card p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Related</h2>
              {invoice.creditNotes.map((cn) => (
                <div key={cn.id} className="mt-2 text-[12px]">
                  Credit-noted by{' '}
                  <Link href={`/admin-dashboard/invoices/${cn.id}`} className="text-blue-600 hover:underline">
                    {cn.number}
                  </Link>{' '}
                  ({formatMoney(cn.total, cn.currency)})
                </div>
              ))}
              {invoice.creditNoteOf && (
                <div className="mt-2 text-[12px]">
                  Credit-note for{' '}
                  <Link href={`/admin-dashboard/invoices/${invoice.creditNoteOf.id}`} className="text-blue-600 hover:underline">
                    {invoice.creditNoteOf.number}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {order && (
            <div className="card p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Order</h2>
              <Link
                href={`/admin-dashboard/orders/${order.id}`}
                className="mt-1 block font-mono text-[12px] text-blue-600 hover:underline dark:text-blue-400"
              >
                {order.number ?? order.id}
              </Link>
              <div className="mt-1 text-[12px] text-slate-500">{order.provider} · {order.status}</div>
            </div>
          )}

          <div className="card p-4">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Issuer</h2>
            <div className="mt-1 text-[12px]">{invoice.companyName}</div>
            <div className="text-xs text-slate-500">UEN {invoice.companyUEN}</div>
            {invoice.companyGstReg && <div className="text-xs text-slate-500">GST {invoice.companyGstReg}</div>}
          </div>

          {invoice.status === 'ISSUED' && (
            <div className="card space-y-3 p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Actions</h2>
              <form action={resendInvoice}>
                <input type="hidden" name="id" value={invoice.id} />
                <button className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700">
                  <RefreshCw className="h-3 w-3" /> Resend email
                </button>
              </form>
              <form action={voidInvoice} className="space-y-1">
                <input type="hidden" name="id" value={invoice.id} />
                <input name="reason" placeholder="Void reason (optional)" className="input-sm" />
                <button className="inline-flex h-7 items-center rounded-md bg-red-600 px-2.5 text-xs font-medium text-white hover:bg-red-700">
                  Mark void
                </button>
              </form>
              <form action={issueCreditNote} className="space-y-1">
                <input type="hidden" name="id" value={invoice.id} />
                <input name="reason" placeholder="Credit note reason (optional)" className="input-sm" />
                <button className="inline-flex h-7 items-center rounded-md bg-amber-600 px-2.5 text-xs font-medium text-white hover:bg-amber-700">
                  Issue credit note
                </button>
              </form>
            </div>
          )}

          {invoice.status === 'VOID' && invoice.voidReason && (
            <div className="card p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Void reason</h2>
              <div className="mt-1 text-[12px] text-slate-700 dark:text-slate-200">{invoice.voidReason}</div>
              {invoice.voidedAt && (
                <div className="text-[11px] text-slate-500">{invoice.voidedAt.toLocaleString()}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
