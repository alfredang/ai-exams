import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';
import { STORE_CURRENCY } from '@/lib/currency';

export async function GET() {
  const [paypal, hitpay, paynow, stripe, paypalClient] = await Promise.all([
    getSetting('PAYPAL_ENABLED'),
    getSetting('HITPAY_ENABLED'),
    getSetting('PAYNOW_ENABLED'),
    getSetting('STRIPE_ENABLED'),
    getSetting('PAYPAL_CLIENT_ID')
  ]);
  // PayPal historically had no enabled flag; treat empty as "on" if a client id
  // is configured so we don't regress existing deployments.
  const paypalOn = paypal === 'true' || (paypal === '' && !!paypalClient);
  return NextResponse.json({
    methods: [
      // Catalogue prices are in STORE_CURRENCY (USD) and card providers charge
      // in it. PayNow can only carry SGD, so it converts at the admin FX rate.
      { id: 'PAYPAL', enabled: paypalOn, currency: STORE_CURRENCY },
      { id: 'HITPAY', enabled: hitpay === 'true', currency: STORE_CURRENCY },
      { id: 'PAYNOW', enabled: paynow === 'true', currency: 'SGD' },
      { id: 'STRIPE', enabled: stripe === 'true', currency: STORE_CURRENCY }
    ],
    // The PayPal JS SDK needs the client id in the browser. It's a public
    // (non-secret) value; serving the admin-configured one here means the
    // dashboard setting actually takes effect instead of only the build-time
    // NEXT_PUBLIC_PAYPAL_CLIENT_ID env (which fell back to sandbox 'sb').
    paypalClientId: paypalClient || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || null
  });
}
