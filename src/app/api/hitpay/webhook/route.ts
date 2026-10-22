import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhook } from '@/lib/payments/hitpay';
import { fulfillOrder } from '@/lib/fulfill';
import {
  logWebhookReceived,
  markWebhookFailed,
  markWebhookIgnored,
  markWebhookProcessed
} from '@/lib/payments/webhook-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// HitPay posts application/x-www-form-urlencoded with an `hmac` signature.
export async function POST(req: Request) {
  const raw = await req.text();
  const form: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(raw).entries()) form[k] = v;

  const log = await logWebhookReceived({
    provider: 'HITPAY',
    eventId: form.payment_id || form.payment_request_id || null,
    eventType: form.status || 'unknown',
    payload: form
  });
  if (log.status === 'PROCESSED') return NextResponse.json({ ok: true, dedup: true });

  try {
    const verified = await verifyWebhook(form);
    if (!verified) {
      await markWebhookFailed(log.id, 'HitPay HMAC verification failed');
      return NextResponse.json({ error: 'invalid-signature' }, { status: 400 });
    }

    const status = verified.status;
    const paymentRequestId = verified.payment_request_id || verified.reference || '';
    const paymentId = verified.payment_id || '';
    const reference = verified.reference_number || '';

    const order =
      (reference && (await db.order.findUnique({ where: { id: reference } }))) ||
      (paymentRequestId
        ? await db.order.findUnique({
            where: { provider_providerOrderId: { provider: 'HITPAY', providerOrderId: paymentRequestId } }
          })
        : null);

    if (!order) {
      await markWebhookIgnored(log.id, 'No matching order');
      return NextResponse.json({ error: 'unknown-order' }, { status: 404 });
    }

    if (status === 'completed' || status === 'succeeded') {
      await fulfillOrder(order.id, verified, paymentId);
      await db.order.update({
        where: { id: order.id },
        data: { providerCaptureId: paymentId, providerPayload: verified }
      });
    } else if (status === 'failed' || status === 'cancelled') {
      await db.order.updateMany({
        where: { id: order.id, status: 'PENDING' },
        data: { status: 'FAILED', providerPayload: verified }
      });
    }

    await markWebhookProcessed(log.id, { orderId: order.id });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await markWebhookFailed(log.id, String(err?.message ?? err));
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}
