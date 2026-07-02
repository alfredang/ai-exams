import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllSettings, SECRET_KEYS, mask } from '@/lib/settings';
import { PAYMENT_FULFILLMENT_FIELDS, PAYMENT_SUBGROUPS } from '../groups';
import PaymentForm from './payment-form';

export const dynamic = 'force-dynamic';

export default async function PaymentSettingPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const values = await getAllSettings();
  const initial: Record<string, { configured: boolean; preview: string; current: string }> = {};
  const allKeys = [
    ...PAYMENT_FULFILLMENT_FIELDS.map((f) => f.key),
    ...PAYMENT_SUBGROUPS.flatMap((g) => g.fields.map((f) => f.key))
  ];
  for (const k of allKeys) {
    const v = values[k as keyof typeof values] || '';
    const isSecret = SECRET_KEYS.has(k as any);
    initial[k] = { configured: !!v, preview: isSecret ? mask(v) : v, current: v };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Payment Setting</h1>
      <p className="mt-1 text-sm text-slate-500">
        Configure each payment provider, their credentials, and fulfillment timing for voucher delivery. Not sure where a
        value comes from? Follow the step-by-step{' '}
        <Link href="/admin-dashboard/settings/payment-guide" className="font-medium text-blue-700 underline hover:no-underline dark:text-blue-300">
          Payment Setup Guide
        </Link>
        .
      </p>
      <PaymentForm
        fulfillmentFields={PAYMENT_FULFILLMENT_FIELDS}
        providerGroups={PAYMENT_SUBGROUPS}
        initial={initial}
      />
    </div>
  );
}
