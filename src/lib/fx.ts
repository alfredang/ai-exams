// USD → SGD exchange rate.
//
// Catalogue prices are USD (STORE_CURRENCY). Two places need SGD:
//   • PayNow checkout — SGQR can only carry SGD, so the USD price is converted
//     at the current rate before the QR is built.
//   • Invoices — IRAS wants the GST and total of a foreign-currency tax invoice
//     shown in SGD as well, so each invoice snapshots an SGD equivalent.
//
// The rate comes from a live source (ECB via Frankfurter, then
// exchangerate-api) and is cached in memory for an hour. The admin setting
// FX_TO_SGD_USD_BPS is only a FALLBACK for when both sources are down, and it
// is ignored unless it is a plausible USD→SGD rate — a 10000 (1.0000)
// placeholder once produced a PayNow order that charged S$439 for a US$439
// product, which is why parity is refused here.

import { getSetting } from '@/lib/settings';

export type FxQuote = {
  bps: number; // basis points: 12806 = 1.2806 SGD per USD
  rate: number; // same, as a decimal
  source: 'live' | 'setting';
  asOf: string; // ISO date or timestamp of the quote
};

// USD/SGD has traded between ~1.2 and ~1.8 for decades. Anything outside this
// band is a mis-set setting or a broken feed, never a real rate.
const MIN_BPS = 10500;
const MAX_BPS = 20000;
const CACHE_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 4000;

let cache: { quote: FxQuote; fetchedAt: number } | null = null;

export function isPlausibleUsdToSgdBps(bps: number): boolean {
  return Number.isFinite(bps) && bps >= MIN_BPS && bps <= MAX_BPS;
}

export function toBps(rate: number): number {
  return Math.round(rate * 10000);
}

export function formatFxRate(bps: number): string {
  return (bps / 10000).toFixed(4);
}

/** Convert USD cents to SGD cents at the given rate. */
export function usdToSgdCents(usdCents: number, bps: number): number {
  return Math.round((usdCents * bps) / 10000);
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: 'no-store' });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

// Each source returns a decimal SGD-per-USD rate plus the quote date.
const SOURCES: Array<() => Promise<{ rate: number; asOf: string }>> = [
  async () => {
    // ECB reference rates (no key, daily).
    const j = await fetchJson('https://api.frankfurter.dev/v1/latest?base=USD&symbols=SGD');
    return { rate: Number(j?.rates?.SGD), asOf: String(j?.date ?? '') };
  },
  async () => {
    // exchangerate-api open endpoint (no key, daily).
    const j = await fetchJson('https://open.er-api.com/v6/latest/USD');
    return { rate: Number(j?.rates?.SGD), asOf: String(j?.time_last_update_utc ?? '') };
  }
];

async function fetchLiveQuote(): Promise<FxQuote | null> {
  for (const source of SOURCES) {
    try {
      const { rate, asOf } = await source();
      const bps = toBps(rate);
      if (isPlausibleUsdToSgdBps(bps)) return { bps, rate: bps / 10000, source: 'live', asOf: asOf || new Date().toISOString() };
    } catch {
      // try the next source
    }
  }
  return null;
}

/**
 * Current USD→SGD rate: live (cached 1h), else the admin fallback setting when
 * it is plausible, else null. Callers that charge money must refuse on null
 * rather than guess.
 */
export async function getUsdToSgdQuote(): Promise<FxQuote | null> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache.quote;
  const live = await fetchLiveQuote();
  if (live) {
    cache = { quote: live, fetchedAt: Date.now() };
    return live;
  }
  const bps = Number((await getSetting('FX_TO_SGD_USD_BPS')) || 0);
  if (isPlausibleUsdToSgdBps(bps)) return { bps, rate: bps / 10000, source: 'setting', asOf: new Date().toISOString() };
  return null;
}

/**
 * Rate to SGD for any invoice currency: SGD is 1.0, USD uses the live quote,
 * other currencies only have the admin FX_TO_SGD_<CUR>_BPS setting.
 */
export async function getToSgdBps(currency: string): Promise<number | null> {
  const cur = currency.toUpperCase();
  if (cur === 'SGD') return 10000;
  if (cur === 'USD') return (await getUsdToSgdQuote())?.bps ?? null;
  const key = `FX_TO_SGD_${cur}_BPS`;
  const bps = Number((await getSetting(key as any)) || 0);
  return bps > 0 ? bps : null;
}
