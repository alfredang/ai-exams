import { getToSgdBps } from '@/lib/fx';
import { db } from '@/lib/db';
import type { Prisma, PrismaClient } from '@prisma/client';
import { getAllSettings, getCompanyInfo } from '@/lib/settings';
import { nextNumber } from '@/lib/numbering';
import { splitTax, taxConfigFrom } from './tax';

export type IssueInput = {
  orderId: string;
};

type DbClient = PrismaClient | Prisma.TransactionClient;


/**
 * Issue (or return existing) Invoice for the given paid Order.
 *
 * - Idempotent: returns the existing Invoice if one is already linked.
 * - Sequential numbering via a row-locked InvoiceCounter per year.
 * - Snapshots customer + company at issue time so historical records are
 *   immutable even when the source rows change later.
 */
export async function issueInvoiceForOrder(orderId: string, dbc?: DbClient) {
  const client: DbClient = dbc ?? db;

  const existing = await client.invoice.findUnique({ where: { orderId } });
  if (existing) return existing;

  const order = await client.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      billingAddress: true
    }
  });
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.status !== 'PAID') throw new Error(`Order ${orderId} is not PAID`);

  const settings = await getAllSettings();
  const company = await getCompanyInfo();

  const tax = taxConfigFrom(settings);
  const taxRateBps = tax.enabled ? tax.rateBps : 0;
  const taxLabel = tax.label;
  const prefix = settings.INVOICE_PREFIX || 'INV';

  // order.amount is what the customer paid; GST is carved out of it.
  const total = order.amount;
  const { subtotal, taxAmount } = splitTax(total, tax);

  // SGD-equivalent (for reporting in mixed-currency stores)
  let fxRateBpsToSgd: number | null = null;
  let totalSgd: number | null = null;
  // USD uses the live USD→SGD rate (lib/fx.ts); SGD is 1.0; other currencies
  // need their FX_TO_SGD_<CUR>_BPS setting. Left null when no rate is known.
  const currency = order.currency || 'SGD';
  const fxBps = await getToSgdBps(currency);
  if (fxBps) {
    fxRateBpsToSgd = fxBps;
    totalSgd = Math.round((total * fxBps) / 10000);
  }

  // Sequential number across all years
  const number = await nextNumber('INVOICE', prefix, client);

  const addr = order.billingAddress;
  const billingAddressStr = addr
    ? [addr.line1, addr.line2, [addr.city, addr.state, addr.postalCode].filter(Boolean).join(' '), addr.country]
        .filter(Boolean)
        .join('\n')
    : null;

  const invoice = await client.invoice.create({
    data: {
      number,
      orderId: order.id,
      userId: order.userId,
      issueDate: order.capturedAt ?? new Date(),
      billingName: addr?.fullName || order.user.name || order.user.email,
      billingEmail: order.user.email,
      billingAddress: billingAddressStr,
      billingUEN: null,
      companyName: company.name,
      companyAddress: company.address,
      companyUEN: company.uen,
      companyGstReg: settings.COMPANY_GST_REG || null,
      currency,
      subtotal,
      taxRate: taxRateBps,
      taxLabel,
      taxAmount,
      total,
      fxRateBpsToSgd,
      totalSgd
    }
  });
  return invoice;
}

/**
 * Issue a CREDIT_NOTE that offsets `amountCents` of the original invoice.
 * Credit notes carry their own CN- sequence, leave orderId null (the order
 * keeps exactly one tax invoice) and point back via creditNoteOfId, so an
 * invoice can carry several credit notes for partial refunds. The number and
 * the row are written in one transaction so a failure never burns a number.
 */
export async function issueCreditNoteForInvoice(invoiceId: string, amountCents: number, dbc?: DbClient) {
  const run = async (client: DbClient) => {
    const orig = await client.invoice.findUnique({ where: { id: invoiceId } });
    if (!orig) throw new Error(`Invoice ${invoiceId} not found`);
    if (orig.status === 'CREDIT_NOTE') throw new Error('Cannot credit a credit note');

    // Mirror the original tax split; the total is exactly the refunded amount.
    const total = amountCents;
    const taxAmount = Math.round((total * orig.taxAmount) / Math.max(1, orig.total));
    const subtotal = total - taxAmount;
    const number = await nextNumber('CREDIT_NOTE', 'CN', client);

    return client.invoice.create({
      data: {
        number,
        orderId: null,
        userId: orig.userId,
        issueDate: new Date(),
        billingName: orig.billingName,
        billingEmail: orig.billingEmail,
        billingAddress: orig.billingAddress,
        billingUEN: orig.billingUEN,
        companyName: orig.companyName,
        companyAddress: orig.companyAddress,
        companyUEN: orig.companyUEN,
        companyGstReg: orig.companyGstReg,
        currency: orig.currency,
        subtotal: -subtotal,
        taxRate: orig.taxRate,
        taxLabel: orig.taxLabel,
        taxAmount: -taxAmount,
        total: -total,
        fxRateBpsToSgd: orig.fxRateBpsToSgd,
        totalSgd: orig.fxRateBpsToSgd ? -Math.round((total * orig.fxRateBpsToSgd) / 10000) : null,
        status: 'CREDIT_NOTE',
        creditNoteOfId: orig.id
      }
    });
  };
  return dbc ? run(dbc) : db.$transaction((tx) => run(tx));
}

/** The order an invoice belongs to; a credit note reaches it through the invoice it adjusts. */
export async function orderIdForInvoice(invoice: { orderId: string | null; creditNoteOfId: string | null }, dbc?: DbClient) {
  if (invoice.orderId) return invoice.orderId;
  if (!invoice.creditNoteOfId) return null;
  const orig = await (dbc ?? db).invoice.findUnique({ where: { id: invoice.creditNoteOfId }, select: { orderId: true } });
  return orig?.orderId ?? null;
}
