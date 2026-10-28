'use client';
// Storefront display currency. Every price in the database is USD; when the
// visitor switches to SGD, <Price> converts at the live USD→SGD rate from
// /api/fx (rounded to two decimals). Card checkouts still charge USD — only
// PayNow charges SGD, at the same rate.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type DisplayCurrency = 'USD' | 'SGD';
export const DISPLAY_CURRENCIES: DisplayCurrency[] = ['USD', 'SGD'];
const STORAGE_KEY = 'currency';

type Ctx = {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  /** USD→SGD rate in basis points, null until /api/fx has answered. */
  usdToSgdBps: number | null;
  fxAsOf: string | null;
};

const CurrencyContext = createContext<Ctx>({ currency: 'USD', setCurrency: () => {}, usdToSgdBps: null, fxAsOf: null });

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>('USD');
  const [usdToSgdBps, setBps] = useState<number | null>(null);
  const [fxAsOf, setAsOf] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === 'SGD') setCurrencyState('SGD');
    } catch {}
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/fx', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active || !d?.ok) return;
        setBps(Number(d.bps));
        setAsOf(String(d.asOf ?? ''));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const setCurrency = useCallback((c: DisplayCurrency) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  }, []);

  const value = useMemo(() => ({ currency, setCurrency, usdToSgdBps, fxAsOf }), [currency, setCurrency, usdToSgdBps, fxAsOf]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useDisplayCurrency() {
  return useContext(CurrencyContext);
}

/** Format USD cents in the chosen display currency (two decimals). */
export function formatDisplayPrice(usdCents: number, currency: DisplayCurrency, usdToSgdBps: number | null): string {
  if (usdCents === 0) return 'Free';
  if (currency === 'SGD' && usdToSgdBps) {
    const sgdCents = Math.round((usdCents * usdToSgdBps) / 10000);
    return `S$${(sgdCents / 100).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `US$${(usdCents / 100).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
