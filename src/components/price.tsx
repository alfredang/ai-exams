'use client';
import { formatDisplayPrice, useDisplayCurrency } from './currency-provider';

/**
 * A storefront price. `cents` is always USD (the store currency); the visitor's
 * USD/SGD switcher decides how it is shown. Server components can render this
 * directly — it is a small client island.
 */
export function Price({ cents, className }: { cents: number; className?: string }) {
  const { currency, usdToSgdBps } = useDisplayCurrency();
  const text = formatDisplayPrice(cents, currency, usdToSgdBps);
  return <span className={className} data-currency={currency === 'SGD' && usdToSgdBps ? 'SGD' : 'USD'}>{text}</span>;
}
