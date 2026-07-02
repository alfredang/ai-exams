import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllSettings, type SettingKey } from '@/lib/settings';
import { ArrowRight, CheckCircle2, XCircle, ExternalLink, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

type KeyStatus = { key: SettingKey; label: string; set: boolean };

function StatusRow({ items }: { items: KeyStatus[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it.key}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            it.set
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {it.set ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {it.label}
        </span>
      ))}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="select-all break-all rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
      {children}
    </code>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
        {n}
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <div className="font-medium text-slate-900 dark:text-slate-100">{title}</div>
        <div className="mt-1 space-y-2 text-slate-600 dark:text-slate-300">{children}</div>
      </div>
    </li>
  );
}

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-blue-700 underline hover:no-underline dark:text-blue-300">
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export default async function PaymentGuidePage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const values = await getAllSettings();
  const set = (k: SettingKey) => !!values[k];

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'exams.tertiaryinfotech.com';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const appUrl = process.env.APP_URL || `${proto}://${host}`;

  const paypalStatus: KeyStatus[] = [
    { key: 'PAYPAL_ENABLED', label: values.PAYPAL_ENABLED === 'true' ? 'Enabled' : 'Not enabled', set: values.PAYPAL_ENABLED === 'true' },
    { key: 'PAYPAL_ENV', label: `Environment: ${values.PAYPAL_ENV || 'not set'}`, set: values.PAYPAL_ENV === 'live' || values.PAYPAL_ENV === 'sandbox' },
    { key: 'PAYPAL_CLIENT_ID', label: 'Client ID', set: set('PAYPAL_CLIENT_ID') },
    { key: 'PAYPAL_CLIENT_SECRET', label: 'Client Secret', set: set('PAYPAL_CLIENT_SECRET') },
    { key: 'PAYPAL_WEBHOOK_ID', label: 'Webhook ID', set: set('PAYPAL_WEBHOOK_ID') }
  ];
  const hitpayStatus: KeyStatus[] = [
    { key: 'HITPAY_ENABLED', label: values.HITPAY_ENABLED === 'true' ? 'Enabled' : 'Not enabled', set: values.HITPAY_ENABLED === 'true' },
    { key: 'HITPAY_ENV', label: `Environment: ${values.HITPAY_ENV || 'sandbox (default)'}`, set: values.HITPAY_ENV === 'live' },
    { key: 'HITPAY_API_KEY', label: 'API Key', set: set('HITPAY_API_KEY') },
    { key: 'HITPAY_SALT', label: 'Salt', set: set('HITPAY_SALT') }
  ];
  const stripeStatus: KeyStatus[] = [
    { key: 'STRIPE_ENABLED', label: values.STRIPE_ENABLED === 'true' ? 'Enabled' : 'Not enabled', set: values.STRIPE_ENABLED === 'true' },
    { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', label: 'Publishable Key', set: set('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') },
    { key: 'STRIPE_SECRET_KEY', label: 'Secret Key', set: set('STRIPE_SECRET_KEY') },
    { key: 'STRIPE_WEBHOOK_SECRET', label: 'Webhook Secret', set: set('STRIPE_WEBHOOK_SECRET') }
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payment Setup Guide</h1>
          <p className="mt-1 text-sm text-slate-500">
            Step-by-step configuration for PayPal, HitPay, and Stripe. Credentials are entered on the{' '}
            <Link href="/admin-dashboard/settings/payment" className="font-medium text-blue-700 underline hover:no-underline dark:text-blue-300">
              Payment Setting
            </Link>{' '}
            page — this guide tells you where each value comes from.
          </p>
        </div>
        <Link href="/admin-dashboard/settings/payment" className="btn-primary inline-flex items-center gap-1">
          Open Payment Setting <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        <Globe className="h-4 w-4 shrink-0" />
        <p>
          This deployment&apos;s base URL is <Code>{appUrl}</Code>. All webhook URLs below are built from it — if you move domains, re-register the webhooks.
        </p>
      </div>

      {/* ────────────────────────── PayPal ────────────────────────── */}
      <section className="card mt-6 p-6" id="paypal">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">1 · PayPal</h2>
          <StatusRow items={paypalStatus} />
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Charges in <b>USD</b>. Renders the in-page PayPal buttons at checkout; the buyer pays with a PayPal balance or card without leaving the site.
        </p>
        <ol className="mt-4 space-y-4">
          <Step n={1} title="Create a PayPal Business account">
            <p>Sign up (or upgrade) at <Ext href="https://www.paypal.com/business">paypal.com/business</Ext>. Personal accounts cannot receive checkout payments.</p>
          </Step>
          <Step n={2} title="Create a REST app and copy the credentials">
            <p>
              Go to <Ext href="https://developer.paypal.com/dashboard/applications/live">developer.paypal.com → Apps &amp; Credentials</Ext>. Pick the <b>Live</b> tab
              (use <b>Sandbox</b> only for testing), click <b>Create App</b>, then copy the <b>Client ID</b> and <b>Secret</b> into the PayPal section of Payment Setting.
            </p>
          </Step>
          <Step n={3} title="Register the webhook">
            <p>In the same app page, scroll to <b>Webhooks</b> → <b>Add Webhook</b> and set the URL to:</p>
            <p><Code>{appUrl}/api/paypal/webhook</Code></p>
            <p>
              Subscribe to the events <Code>PAYMENT.CAPTURE.COMPLETED</Code> and <Code>CHECKOUT.ORDER.APPROVED</Code>. After saving, copy the generated{' '}
              <b>Webhook ID</b> into the <b>Webhook ID</b> field. The webhook is a safety net — it fulfills orders even if the buyer closes the tab before the
              capture response returns.
            </p>
          </Step>
          <Step n={4} title="Switch on">
            <p>Set <b>Environment</b> to <Code>live</Code> (or <Code>sandbox</Code> while testing) and <b>Enabled</b> to <Code>true</Code>, then Save.</p>
          </Step>
          <Step n={5} title="Verify">
            <p>
              Open any bundle checkout — the PayPal buttons should render. With sandbox credentials, pay using a{' '}
              <Ext href="https://developer.paypal.com/dashboard/accounts">sandbox personal account</Ext>; confirm the order flips to PAID under{' '}
              <Link href="/admin-dashboard/orders" className="font-medium text-blue-700 underline hover:no-underline dark:text-blue-300">Orders</Link>{' '}
              and the entitlements appear for the buyer.
            </p>
          </Step>
        </ol>
      </section>

      {/* ────────────────────────── HitPay ────────────────────────── */}
      <section className="card mt-6 p-6" id="hitpay">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">2 · HitPay</h2>
          <StatusRow items={hitpayStatus} />
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Charges in <b>SGD</b>. Redirect checkout supporting cards, PayNow, GrabPay, and Apple Pay — the best fit for Singapore buyers.
        </p>
        <ol className="mt-4 space-y-4">
          <Step n={1} title="Register and complete verification">
            <p>
              Create a business account at <Ext href="https://dashboard.hit-pay.com/">dashboard.hit-pay.com</Ext> and complete KYC — payouts (and live payments)
              only work on a verified account. For testing, use the separate sandbox at <Ext href="https://dashboard.sandbox.hit-pay.com/">dashboard.sandbox.hit-pay.com</Ext>.
            </p>
          </Step>
          <Step n={2} title="Copy the API Key and Salt">
            <p>
              In the HitPay dashboard go to <b>Settings → Payment Gateway → API Keys</b>. Copy the <b>API Key</b> and the <b>Salt</b> into the HitPay section of
              Payment Setting. The Salt is used to verify webhook signatures — both are required.
            </p>
          </Step>
          <Step n={3} title="Webhook — nothing to register">
            <p>
              No dashboard webhook setup is needed: each payment request we create already carries its own webhook URL (<Code>{appUrl}/api/hitpay/webhook</Code>),
              and HitPay signs the callback with your Salt.
            </p>
          </Step>
          <Step n={4} title="Switch on">
            <p>
              Set <b>Environment</b> to <Code>live</Code> and <b>Enabled</b> to <Code>true</Code>, then Save. <b>Important:</b> the environment defaults to{' '}
              <Code>sandbox</Code> when unset — a live API key against the sandbox endpoint fails with an authentication error.
            </p>
          </Step>
          <Step n={5} title="Verify">
            <p>
              Run a checkout with HitPay selected. In sandbox, pay with the test card <Code>4242 4242 4242 4242</Code> (any future expiry / CVC). Confirm the order
              flips to PAID and the webhook shows PROCESSED under{' '}
              <Link href="/admin-dashboard/payments/webhooks" className="font-medium text-blue-700 underline hover:no-underline dark:text-blue-300">Payments → Webhooks</Link>.
            </p>
          </Step>
        </ol>
      </section>

      {/* ────────────────────────── Stripe ────────────────────────── */}
      <section className="card mt-6 p-6" id="stripe">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">3 · Stripe</h2>
          <StatusRow items={stripeStatus} />
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Charges in <b>USD</b>. Redirects to Stripe Checkout with cards, Apple Pay, and Google Pay. Test and live modes each have their own key pair — don&apos;t mix them.
        </p>
        <ol className="mt-4 space-y-4">
          <Step n={1} title="Get your API keys">
            <p>
              In <Ext href="https://dashboard.stripe.com/apikeys">dashboard.stripe.com → Developers → API keys</Ext>, copy the <b>Publishable key</b>{' '}
              (<Code>pk_live_…</Code>) and <b>Secret key</b> (<Code>sk_live_…</Code>) into the Stripe section of Payment Setting. For testing, toggle the dashboard
              to <b>Test mode</b> and use the <Code>pk_test_…</Code> / <Code>sk_test_…</Code> pair instead.
            </p>
          </Step>
          <Step n={2} title="Register the webhook endpoint">
            <p>Go to <Ext href="https://dashboard.stripe.com/webhooks">Developers → Webhooks</Ext> → <b>Add endpoint</b> and set the URL to:</p>
            <p><Code>{appUrl}/api/stripe/webhook</Code></p>
            <p>
              Select the single event <Code>checkout.session.completed</Code>. After creating it, reveal the <b>Signing secret</b> (<Code>whsec_…</Code>) and paste
              it into the <b>Webhook Secret</b> field. Fulfillment runs from this webhook — without it, paid orders stay PENDING.
            </p>
          </Step>
          <Step n={3} title="Switch on">
            <p>Set <b>Enabled</b> to <Code>true</Code> and Save. The keys themselves determine test vs live mode — there is no separate environment field.</p>
          </Step>
          <Step n={4} title="Verify">
            <p>
              Run a checkout with card selected. In test mode use card <Code>4242 4242 4242 4242</Code>, any future expiry, any CVC. Confirm the redirect to the
              success page, the PAID order, and the PROCESSED webhook event.
            </p>
          </Step>
        </ol>
      </section>

      {/* ────────────────────────── Go-live checklist ────────────────────────── */}
      <section className="card mt-6 p-6">
        <h2 className="text-lg font-bold">Go-live checklist</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Every provider you enable shows all-green status chips above.</li>
          <li>PayPal and HitPay <b>Environment</b> are set to <Code>live</Code>; Stripe uses <Code>pk_live_…</Code> / <Code>sk_live_…</Code> keys.</li>
          <li>Webhooks registered against <Code>{appUrl}</Code> (PayPal and Stripe; HitPay is automatic).</li>
          <li>One real low-value purchase per provider, then refund it from the provider dashboard and confirm the refund shows on the order.</li>
          <li>Purchase confirmation email arrives (check Settings → Email if not).</li>
          <li>
            The <Code>NEXT_PUBLIC_TEST_PAYMENTS</Code> env var is unset (or not <Code>true</Code>) in production — it exposes a skip-payment button on checkout.
          </li>
        </ul>
      </section>
    </div>
  );
}
