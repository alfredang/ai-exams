'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

type Option = { tier: 'PRACTICE' | 'VOUCHER'; label: string; price: number };

export function BundleBuyForm({
  bundleId,
  bundleSlug,
  vendorSlug,
  options,
  isSignedIn
}: {
  bundleId: string;
  bundleSlug: string;
  vendorSlug: string;
  options: Option[];
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<'PRACTICE' | 'VOUCHER'>(options[0]?.tier ?? 'PRACTICE');

  function handleClick() {
    const target = `/checkout/bundle/${bundleId}?tier=${selected}`;
    if (!isSignedIn) {
      const next = encodeURIComponent(target);
      router.push(`/login?next=${next}`);
      return;
    }
    router.push(target);
  }

  const showVoucherNotice = options.some(o => o.tier === 'VOUCHER');

  return (
    <div className="card p-5">
      <div className="mb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Pick a plan</div>
      <div className="space-y-2">
        {options.map(o => (
          <label
            key={o.tier}
            className={`flex cursor-pointer items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm transition ${
              selected === o.tier
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-950/40 dark:border-blue-400 dark:ring-blue-400'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="bundle-tier"
                value={o.tier}
                checked={selected === o.tier}
                onChange={() => setSelected(o.tier)}
                className="mt-1"
              />
              <span className="font-semibold text-slate-900 dark:text-slate-100">{o.label}</span>
            </div>
            <span className="shrink-0 font-bold text-blue-700 dark:text-blue-300">{formatPrice(o.price)}</span>
          </label>
        ))}
      </div>
      {showVoucherNotice && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <b>Heads up:</b> exam vouchers take <b>3–5 business days</b> to deliver — you'll get an email with your code when it's ready. Practice access is unlocked immediately on purchase.
        </p>
      )}
      <button onClick={handleClick} className="btn-primary-grad mt-4 w-full">
        {isSignedIn ? 'Buy now' : 'Sign in to buy'}
      </button>
    </div>
  );
}
