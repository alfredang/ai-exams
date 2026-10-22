import { db } from '@/lib/db';
import type { Invoice } from '@prisma/client';
import { buildInvoiceLines } from './build-lines';
import { orderIdForInvoice } from './issue';
import { renderInvoicePdf } from './render-invoice-pdf';

/** Render an invoice or credit note with its order number, original invoice and refund reason. */
export async function renderPdfForInvoice(invoice: Invoice): Promise<Buffer> {
  const orderId = await orderIdForInvoice(invoice);
  const [order, original, refund, lines] = await Promise.all([
    orderId ? db.order.findUnique({ where: { id: orderId }, select: { number: true } }) : null,
    invoice.creditNoteOfId
      ? db.invoice.findUnique({ where: { id: invoice.creditNoteOfId }, select: { number: true, issueDate: true } })
      : null,
    invoice.status === 'CREDIT_NOTE'
      ? db.refund.findFirst({ where: { creditNoteInvoiceId: invoice.id }, select: { reason: true } })
      : null,
    buildInvoiceLines(invoice)
  ]);
  return renderInvoicePdf({ invoice, lines, orderNumber: order?.number, original, reason: refund?.reason });
}
