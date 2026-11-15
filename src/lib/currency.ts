// Catalogue + checkout currency. Every Bundle.price / priceVoucher is
// denominated in this currency and PayPal / Stripe / HitPay charge in it.
// The site sells internationally, so this is USD.
//
// PayNow is the one exception: SGQR can only carry SGD, so the PayNow route
// converts using the admin FX setting FX_TO_SGD_USD_BPS. Invoices and tax
// reports keep an SGD-equivalent alongside (see lib/invoice/issue.ts) for GST.
//
// No imports — safe for edge and client bundles.
export const STORE_CURRENCY = 'USD';

// Shown beside storefront prices. The amount charged is the listed price;
// invoices carve the GST out of it (TAX_INCLUSIVE).
export const PRICE_TAX_NOTE = 'GST inclusive';

// Exam Voucher prices are the vendor's list price plus 10% for GST, rounded
// DOWN to a whole dollar, GST inclusive (owner's rule, 16 Nov 2026) — e.g.
// US$439 → US$482, US$100 → US$110, US$70.50 → US$77. Seed modules keep the
// vendor list price and pass it through this; an admin-entered price in the
// dashboard is used as typed. The Practice Exam stays at its fixed US$20
// (GST inclusive) — never apply this to it.
export function voucherPriceWithGst<T extends number | null | undefined>(listCents: T): T {
  if (listCents == null) return listCents;
  return (Math.floor((listCents * 11) / 1000) * 100) as T;
}
