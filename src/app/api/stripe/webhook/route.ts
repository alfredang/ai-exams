import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fulfillOrder } from '@/lib/fulfill';
import { getSetting } from '@/lib/settings';
import {
  logWebhookReceived,
  markWebhookFailed,
  markWebhookIgnored,
  markWebhookProcessed
} from '@/lib/payments/webhook-log';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  const secretKey = await getSetting('STRIPE_SECRET_KEY');
  const webhookSecret = await getSetting('STRIPE_WEBHOOK_SECRET');

  if (!secretKey || !webhookSecret || !sig) {
    return NextResponse.json({ error: 'stripe-misconfigured' }, { status: 400 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' as any });
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const log = await logWebhookReceived({
    provider: 'STRIPE',
    eventId: event.id,
    eventType: event.type,
    payload: event as any
  });
  if (log.status === 'PROCESSED') return NextResponse.json({ ok: true, dedup: true });

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.client_reference_id;
      
      if (!orderId) {
        await markWebhookIgnored(log.id, 'No client_reference_id found');
        return NextResponse.json({ error: 'unknown-order' }, { status: 404 });
      }

      const order = await db.order.findUnique({ where: { id: orderId } });
      if (!order) {
        await markWebhookIgnored(log.id, 'No matching order');
        return NextResponse.json({ error: 'unknown-order' }, { status: 404 });
      }

      // Check payment status
      if (session.payment_status === 'paid') {
        await fulfillOrder(order.id, session as any, session.payment_intent as string);
        await db.order.update({
          where: { id: order.id },
          data: { providerCaptureId: session.payment_intent as string, providerPayload: session as any }
        });
      } else {
        await db.order.update({
          where: { id: order.id },
          data: { status: 'FAILED', providerPayload: session as any }
        });
      }

      await markWebhookProcessed(log.id, { orderId: order.id });
    } else {
      await markWebhookIgnored(log.id, 'Event type not handled');
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await markWebhookFailed(log.id, String(err?.message ?? err));
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}
