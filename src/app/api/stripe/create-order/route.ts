import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSetting } from '@/lib/settings';
import {
  BundleCheckoutError,
  type BundleCheckoutDraft,
  createPendingBundleOrder,
  prepareBundleCheckout
} from '@/lib/payments/bundle-checkout';
import { parseJsonBody } from '@/lib/api/request';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const Body = z.object({
  bundleId: z.string().min(1),
  tier: z.enum(['PRACTICE', 'VOUCHER']).optional(),
  billingAddressId: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable()
});

export async function POST(req: Request) {
  const stripeEnabled = await getSetting('STRIPE_ENABLED');
  if (stripeEnabled !== 'true') return NextResponse.json({ error: 'stripe-disabled' }, { status: 400 });
  const secretKey = await getSetting('STRIPE_SECRET_KEY');
  if (!secretKey) return NextResponse.json({ error: 'stripe-misconfigured' }, { status: 500 });
  
  const stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' as any });

  const session = await auth();
  const user = session?.user;
  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!user.email) return NextResponse.json({ error: 'email-required' }, { status: 400 });

  const parsed = await parseJsonBody(req, Body);
  if (!parsed.ok) return parsed.response;
  const { bundleId, tier, billingAddressId, couponCode } = parsed.data;

  const currency = 'USD'; // Fixed to USD for Stripe in this implementation
  let draft: BundleCheckoutDraft;
  let order;
  try {
    draft = await prepareBundleCheckout({
      userId: user.id,
      bundleId,
      tier,
      billingAddressId,
      couponCode,
      currency
    });
    order = await createPendingBundleOrder(draft, { provider: 'STRIPE' });
  } catch (err) {
    if (err instanceof BundleCheckoutError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: err.status });
    }
    throw err;
  }

  const appUrl = process.env.APP_URL || new URL(req.url).origin;
  
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: draft.title },
          unit_amount: order.amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/checkout/success?orderId=${order.id}`,
    cancel_url: `${appUrl}/checkout/bundle/${bundleId}`,
    client_reference_id: order.id,
    customer_email: user.email,
  });

  await db.order.update({
    where: { id: order.id },
    data: { providerOrderId: stripeSession.id, providerPayload: stripeSession as any }
  });

  return NextResponse.json({ orderId: order.id, url: stripeSession.url, paymentId: stripeSession.id });
}
