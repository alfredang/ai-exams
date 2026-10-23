import { db } from '@/lib/db';
import { refundCapture as paypalRefundCapture } from '@/lib/paypal';
import { refundPayment as hitpayRefundPayment } from '@/lib/payments/hitpay';
import { issueCreditNoteForInvoice } from '@/lib/invoice/issue';
import { poolAccessExamIds, resolvePoolExam } from '@/lib/question-pool';
import type { PaymentProvider, Tier } from '@prisma/client';

export type RefundInput = {
  orderId: string;
  amountCents: number;
  reason?: string | null;
  byAdminId: string;
  /** Free-text bank/manual reference for PayNow/TEST orders. */
  manualRef?: string | null;
  /**
   * The refund was already made in the provider's own dashboard: record it
   * and issue the credit note without calling the provider (which would
   * refund the money a second time).
   */
  recordOnly?: boolean;
};

export type RefundOutcome = {
  ok: boolean;
  refundId?: string;
  providerRefundId?: string | null;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
  message?: string;
  fullyRefunded?: boolean;
};

/**
 * Unified refund flow. Routes through the appropriate provider, persists a
 * Refund row, updates Order aggregates, mints a credit-note Invoice, and
 * writes an AdminLog entry. Safe to call from a server action or admin route.
 */
export async function refundOrder(input: RefundInput): Promise<RefundOutcome> {
  const { orderId, amountCents, reason, byAdminId, manualRef, recordOnly } = input;

  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { ok: false, status: 'FAILED', message: 'Amount must be positive cents.' };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { invoice: true, refunds: true }
  });
  if (!order) return { ok: false, status: 'FAILED', message: 'Order not found.' };
  if (order.status !== 'PAID') {
    return { ok: false, status: 'FAILED', message: 'Only PAID orders can be refunded.' };
  }

  const alreadyRefunded = order.refunds
    .filter((r) => r.status === 'SUCCEEDED')
    .reduce((sum, r) => sum + r.amount, 0);
  const remaining = order.amount - alreadyRefunded;
  if (amountCents > remaining) {
    return {
      ok: false,
      status: 'FAILED',
      message: `Refund amount exceeds remaining balance (${remaining / 100} ${order.currency}).`
    };
  }

  // 1. Provider-side refund call
  let providerRefundId: string | null = null;
  let providerStatus: 'SUCCEEDED' | 'FAILED' | 'PENDING' = 'SUCCEEDED';
  let failureMessage: string | undefined;
  if (recordOnly) {
    providerRefundId = manualRef ?? null;
  } else try {
    const result = await callProviderRefund(
      order.provider as PaymentProvider,
      {
        captureId: order.providerCaptureId || order.paypalCaptureId || null,
        providerOrderId: order.providerOrderId || order.paypalOrderId || null,
        amountCents,
        currency: order.currency,
        reason: reason ?? undefined,
        manualRef: manualRef ?? null
      }
    );
    providerRefundId = result.providerRefundId;
    providerStatus = result.status;
  } catch (err: any) {
    providerStatus = 'FAILED';
    failureMessage = String(err?.message ?? err);
  }

  // 2. Insert Refund row (even on failure, so admins can see the audit trail).
  const refund = await db.refund.create({
    data: {
      orderId: order.id,
      amount: amountCents,
      currency: order.currency,
      reason: reason ?? null,
      provider: order.provider,
      providerRefundId: providerRefundId,
      byAdminId,
      status: providerStatus,
      failureMessage
    }
  });

  if (providerStatus !== 'SUCCEEDED') {
    await db.adminLog.create({
      data: {
        adminId: byAdminId,
        action: 'order.refund.failed',
        targetType: 'Order',
        targetId: order.id,
        metadata: { refundId: refund.id, amountCents, provider: order.provider, error: failureMessage ?? null }
      }
    });
    return {
      ok: false,
      refundId: refund.id,
      providerRefundId,
      status: providerStatus,
      message: failureMessage
    };
  }

  // 3. Update Order aggregates
  const cumulative = alreadyRefunded + amountCents;
  const fully = cumulative >= order.amount;
  await db.order.update({
    where: { id: order.id },
    data: {
      refundAmount: cumulative,
      refundReason: reason ?? order.refundReason,
      refundRef: providerRefundId || manualRef || order.refundRef,
      refundedAt: fully ? new Date() : order.refundedAt,
      status: fully ? 'REFUNDED' : order.status
    }
  });

  if (fully) await revokeOrderAccess(order.id);

  // 4. Mint credit-note Invoice linked to this refund
  let creditNoteInvoiceId: string | undefined;
  if (order.invoice) {
    try {
      const cn = await issueCreditNoteForInvoice(order.invoice.id, amountCents);
      creditNoteInvoiceId = cn.id;
      await db.refund.update({
        where: { id: refund.id },
        data: { creditNoteInvoiceId: cn.id }
      });
    } catch (err) {
      // The refund itself succeeded; missing credit note is recoverable but
      // we still surface it in the admin log so an admin can mint manually.
      await db.adminLog.create({
        data: {
          adminId: byAdminId,
          action: 'invoice.credit-note.failed',
          targetType: 'Invoice',
          targetId: order.invoice.id,
          metadata: { error: String((err as Error)?.message ?? err), refundId: refund.id }
        }
      });
    }
  }

  await db.adminLog.create({
    data: {
      adminId: byAdminId,
      action: 'order.refund',
      targetType: 'Order',
      targetId: order.id,
      metadata: {
        refundId: refund.id,
        providerRefundId,
        amountCents,
        cumulativeRefunded: cumulative,
        fullyRefunded: fully,
        reason: reason ?? null,
        creditNoteInvoiceId: creditNoteInvoiceId ?? null
      }
    }
  });

  if (creditNoteInvoiceId) {
    try {
      const { sendRefundEmail } = await import('@/lib/mail');
      await sendRefundEmail(order.id, creditNoteInvoiceId, amountCents, fully);
    } catch {
      /* never break refund flow; sendMail logs failures to EmailLog */
    }
  }

  try {
    const { notify } = await import('@/lib/admin-notifications');
    await notify({
      kind: 'order.refund',
      title: `${fully ? 'Full' : 'Partial'} refund · ${(amountCents / 100).toFixed(2)} ${order.currency}`,
      body: `Order ${order.number ?? order.id.slice(0, 8)} refunded${reason ? ` — ${reason}` : ''}`,
      link: `/admin-dashboard/orders/${order.id}`
    });
  } catch {
    /* never break refund flow */
  }

  return {
    ok: true,
    refundId: refund.id,
    providerRefundId,
    status: 'SUCCEEDED',
    fullyRefunded: fully
  };
}

async function callProviderRefund(
  provider: PaymentProvider,
  input: {
    captureId: string | null;
    providerOrderId: string | null;
    amountCents: number;
    currency: string;
    reason?: string;
    manualRef?: string | null;
  }
): Promise<{ providerRefundId: string | null; status: 'SUCCEEDED' | 'FAILED' | 'PENDING' }> {
  switch (provider) {
    case 'PAYPAL': {
      if (!input.captureId) throw new Error('Order has no PayPal capture id to refund.');
      const result = await paypalRefundCapture(input.captureId, input.amountCents, input.currency, input.reason);
      const status = result.status === 'COMPLETED' ? 'SUCCEEDED' : result.status === 'PENDING' ? 'PENDING' : 'FAILED';
      return { providerRefundId: result.id, status };
    }
    case 'HITPAY': {
      // /v1/refund takes the payment id the webhook stored as the capture id,
      // not the payment request id kept in providerOrderId.
      if (!input.captureId) throw new Error('Order has no HitPay payment id to refund.');
      const result = await hitpayRefundPayment(input.captureId, input.amountCents);
      const status = result.status === 'succeeded' || result.status === 'completed' ? 'SUCCEEDED' : 'PENDING';
      return { providerRefundId: result.id, status };
    }
    case 'PAYNOW':
    case 'TEST': {
      // No provider API — admin records a manual reference. We mark
      // SUCCEEDED immediately; the admin is asserting they processed it
      // out-of-band (bank transfer for PayNow, no-op for TEST).
      return { providerRefundId: input.manualRef ?? null, status: 'SUCCEEDED' };
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

type OrderWithItems = {
  examId: string | null;
  tier: Tier | null;
  bundle: { items: { examId: string; tier: Tier }[] } | null;
};

/** The (exam, tier) pairs fulfillOrder() grants for an order. */
function grantedBy(order: OrderWithItems): { examId: string; tier: Tier }[] {
  if (order.bundle) {
    const grantAll = !order.tier || order.tier === 'VOUCHER';
    return order.bundle.items.filter((i) => grantAll || i.tier === order.tier).map((i) => ({ examId: i.examId, tier: i.tier }));
  }
  if (!order.examId || !order.tier) return [];
  const tiers: Tier[] = order.tier === 'BUNDLE' || order.tier === 'VOUCHER' ? ['PRACTICE', 'VOUCHER'] : [order.tier];
  return tiers.map((tier) => ({ examId: order.examId!, tier }));
}

/** Pool exam id for an exam (a retired variant resolves to its pool exam). */
async function poolIdOf(examId: string, cache: Map<string, string>) {
  if (!cache.has(examId)) cache.set(examId, (await resolvePoolExam(db, examId))?.id ?? examId);
  return cache.get(examId)!;
}

/**
 * Take back what a fully refunded order granted: cancel undelivered vouchers
 * and remove the entitlements no other paid order of the same user still
 * covers. Works per certification pool — the pool exam plus its retired
 * variants — because older orders granted variants (e.g. SY0-701-P2) that a
 * catalogue consolidation later folded into the pool, and those still unlock
 * it. Safe to re-run (admin "Revoke remaining access").
 */
export async function revokeOrderAccess(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { bundle: { include: { items: true } } }
  });
  if (!order) return;
  await db.voucherDelivery.updateMany({
    where: { orderId, status: { in: ['SCHEDULED', 'FAILED'] } },
    data: { status: 'CANCELED' }
  });

  const pools = new Map<string, string>();
  const otherPaid = await db.order.findMany({
    where: { userId: order.userId, status: 'PAID', id: { not: orderId } },
    include: { bundle: { include: { items: true } } }
  });
  const covered = new Set<string>();
  for (const o of otherPaid) {
    for (const g of grantedBy(o)) covered.add(`${await poolIdOf(g.examId, pools)}:${g.tier}`);
  }

  for (const g of grantedBy(order)) {
    const poolId = await poolIdOf(g.examId, pools);
    if (covered.has(`${poolId}:${g.tier}`)) continue;
    const family = await poolAccessExamIds(db, poolId);
    // A voucher code already sent can't be recalled; keep that entitlement as the record.
    await db.entitlement.deleteMany({
      where: { userId: order.userId, examId: { in: family }, tier: g.tier, voucher: null }
    });
  }
}
