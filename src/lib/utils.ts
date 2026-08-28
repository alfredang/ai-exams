import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Tier } from '@prisma/client';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatPrice(cents: number, currency = 'SGD') {
  if (cents === 0) return 'Free';
  if (currency.toUpperCase() === 'SGD') {
    const amount = new Intl.NumberFormat('en-SG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cents / 100);
    return `S$${amount}`;
  }
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  }).format(cents / 100);
}

// Per the simplified tier model: VOUCHER now includes practice access
// (it absorbs what the old BUNDLE tier did). The BUNDLE label/price
// are preserved here for legacy orders/entitlements that already exist
// in the DB, but the public catalogue no longer offers BUNDLE.
export function tierLabel(t: Tier) {
  return ({
    PRACTICE: 'Practice Exam',
    BUNDLE: 'Practice + Exam Voucher',  // legacy orders only
    VOUCHER: 'Exam Voucher (practice exams included)',
    ADMIN_GRANT: 'Admin Grant'
  } as const)[t];
}

export function genVoucherCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VCH-${part()}${part()}`;
}
