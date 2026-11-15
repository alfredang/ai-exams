// Every price the site lists is USD (STORE_CURRENCY), with no SGD conversion.
//
// A few historic orders carry currency = 'SGD': orders from before the store
// moved to USD (23 Sep 2026; the amount is the catalogue price, e.g. 2000 =
// $20), and PayNow orders, whose QR had to be SGD. For display they all read
// as USD:
//   • a PayNow order that snapshotted its USD price (providerPayload.fx
//     .usdAmount) shows that USD price;
//   • anything else shows its stored amount as USD (no FX applied).
// The stored order, refund and invoice rows are never rewritten.

import { db } from '@/lib/db';
import { formatMoney } from '@/lib/utils';

type OrderRef = { id: string; amount: number; currency: string };

/** USD amount snapshotted on a PayNow order, if any. */
export function usdAmountFromPayload(payload: unknown): number | null {
  const v = (payload as any)?.fx?.usdAmount;
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v) : null;
}

/**
 * Snapshotted USD prices for the non-USD orders in `orders`, keyed by order id.
 * Reads providerPayload only for those few rows, so list pages can keep it out
 * of their main query.
 */
export async function loadUsdSnapshots(orders: Array<{ id: string; currency: string }>): Promise<Map<string, number>> {
  const ids = orders.filter((o) => o.currency.toUpperCase() !== 'USD').map((o) => o.id);
  const map = new Map<string, number>();
  if (!ids.length) return map;
  const rows = await db.order.findMany({ where: { id: { in: ids } }, select: { id: true, providerPayload: true } });
  for (const r of rows) {
    const usd = usdAmountFromPayload(r.providerPayload);
    if (usd !== null) map.set(r.id, usd);
  }
  return map;
}

/** Same map, built from orders already loaded with their providerPayload. */
export function usdSnapshotsOf(orders: Array<{ id: string; currency: string; providerPayload?: unknown }>): Map<string, number> {
  const map = new Map<string, number>();
  for (const o of orders) {
    if (o.currency.toUpperCase() === 'USD') continue;
    const usd = usdAmountFromPayload(o.providerPayload);
    if (usd !== null) map.set(o.id, usd);
  }
  return map;
}

/**
 * `cents` (an amount on `order` — its total, discount or a refund, all in the
 * order's currency) expressed in USD. Pass the order's own amount for its total.
 */
export function orderUsdCents(cents: number, order: OrderRef, snapshots?: Map<string, number>): number {
  if (order.currency.toUpperCase() === 'USD') return cents;
  const usd = snapshots?.get(order.id);
  if (usd === undefined || order.amount <= 0) return cents;
  return Math.round((cents * usd) / order.amount);
}

/** Format an order amount as USD (see orderUsdCents). */
export function formatOrderUsd(cents: number, order: OrderRef, snapshots?: Map<string, number>): string {
  return formatMoney(orderUsdCents(cents, order, snapshots), 'USD');
}
