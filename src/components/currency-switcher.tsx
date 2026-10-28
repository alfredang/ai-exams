'use client';
import { DISPLAY_CURRENCIES, useDisplayCurrency } from './currency-provider';

/** USD | SGD segmented toggle for the site header. */
export function CurrencySwitcher({ className = '' }: { className?: string }) {
  const { currency, setCurrency, usdToSgdBps } = useDisplayCurrency();
  return (
    <div
      role="group"
      aria-label="Display currency"
      title={usdToSgdBps ? `1 USD = ${(usdToSgdBps / 10000).toFixed(4)} SGD (today's rate)` : 'Prices in US dollars'}
      className={`inline-flex h-9 items-center rounded-md border border-line bg-white p-0.5 font-mono text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {DISPLAY_CURRENCIES.map((c) => {
        const active = c === currency;
        return (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            aria-pressed={active}
            className={`h-full rounded px-2 transition ${active ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
