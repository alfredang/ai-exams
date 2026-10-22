import { db } from '@/lib/db';
import { tierLabel } from '@/lib/utils';
import type { InvoiceLine } from './render-invoice-pdf';
import type { Invoice } from '@prisma/client';
import { orderIdForInvoice } from './issue';

/**
 * Reconstruct the single-line summary for an invoice from its linked Order.
 * Phase 1.1 has one line per order (since orders are single-product today).
 * Phase 3 may introduce multiple line items per order; this function is the
 * single seam to extend. Credit notes describe the refund of the original
 * invoice's product.
 */
export async function buildInvoiceLines(invoice: Invoice): Promise<InvoiceLine[]> {
  const orderId = await orderIdForInvoice(invoice);
  const order = orderId
    ? await db.order.findUnique({
        where: { id: orderId },
        include: { exam: true, bundle: true, coupon: { select: { code: true } } }
      })
    : null;
  if (!order) return [{ description: 'Order', qty: 1, unitAmount: invoice.subtotal }];

  const product = order.bundle
    ? `${order.bundle.title} (bundle)`
    : order.exam
      ? `${order.exam.title} (${order.exam.code})`
      : 'Order';
  const tier = order.bundle ? 'Bundle' : order.tier ? tierLabel(order.tier) : '';
  const base = tier ? `${product} — ${tier}` : product;
  const description = invoice.status === 'CREDIT_NOTE'
    ? `Refund: ${base}`
    : order.coupon
      ? `${base} (promo ${order.coupon.code} −${(order.discount / 100).toFixed(2)})`
      : base;

  return [{ description, qty: 1, unitAmount: invoice.subtotal }];
}
