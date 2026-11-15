import { formatPrice } from '@/lib/utils';

/**
 * A storefront price. `cents` is USD (the store currency) and every price on
 * the site is shown in USD — there is no currency switcher.
 */
export function Price({ cents, className }: { cents: number; className?: string }) {
  return <span className={className}>{formatPrice(cents, 'USD')}</span>;
}
