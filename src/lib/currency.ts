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
