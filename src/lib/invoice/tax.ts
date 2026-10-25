// GST settings and the inclusive split. Storefront prices are GST inclusive
// (PRICE_TAX_NOTE), so the amount charged is the total and the GST is carved
// out of it. Admins edit the settings under Settings → GST & Invoice.
//
// No imports — callers pass in the settings record.

export const DEFAULT_TAX_RATE_BPS = 900; // Singapore GST 9%

export type TaxConfig = { enabled: boolean; rateBps: number; label: string; inclusive: boolean };

export function taxConfigFrom(settings: Partial<Record<string, string | undefined>>): TaxConfig {
  const rate = Number(settings.TAX_RATE_BPS || DEFAULT_TAX_RATE_BPS);
  return {
    enabled: (settings.TAX_ENABLED || 'true').toLowerCase() !== 'false',
    rateBps: Math.max(0, Math.min(10000, Number.isFinite(rate) ? rate : 0)),
    label: settings.TAX_LABEL || 'GST',
    inclusive: (settings.TAX_INCLUSIVE || 'true').toLowerCase() !== 'false'
  };
}

/** Split a charged total (cents) into subtotal + tax. */
export function splitTax(total: number, cfg: TaxConfig): { subtotal: number; taxAmount: number } {
  if (!cfg.enabled || cfg.rateBps === 0) return { subtotal: total, taxAmount: 0 };
  // The customer is always charged the listed price, so the tax sits inside
  // the total whether or not TAX_INCLUSIVE is set: tax = total × rate / (1 + rate).
  const taxAmount = Math.round((total * cfg.rateBps) / (10000 + cfg.rateBps));
  return { subtotal: total - taxAmount, taxAmount };
}

/** 900 → "9%", 825 → "8.25%". */
export function formatTaxRate(bps: number): string {
  return `${Number((bps / 100).toFixed(2))}%`;
}

/** The GST lines an email shows for an issued invoice; null when it carries no tax. */
export function invoiceTaxVars(inv: { subtotal: number; taxAmount: number; taxRate: number; taxLabel: string }) {
  if (inv.taxAmount === 0) return null;
  return { label: inv.taxLabel, rate: formatTaxRate(inv.taxRate), amount: inv.taxAmount, subtotal: inv.subtotal };
}
