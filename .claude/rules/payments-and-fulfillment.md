---
paths:
  - "src/app/api/paypal/**"
  - "src/app/api/stripe/**"
  - "src/app/api/hitpay/**"
  - "src/app/api/paynow/**"
  - "src/app/api/checkout/**"
  - "src/app/api/coupons/**"
  - "src/app/api/test-payment/**"
  - "src/app/checkout/**"
  - "src/lib/payments/**"
  - "src/lib/fulfill.ts"
  - "src/lib/coupons.ts"
  - "src/lib/products.ts"
  - "src/lib/invoice/**"
  - "src/lib/currency.ts"
---

# Payments, orders and fulfillment

- **The unit of sale is `Bundle + tier`** (`PRACTICE` | `VOUCHER`). Never add
  per-exam pricing. Practice Exam price is fixed `PRACTICE_PRICE_CENTS`
  (US$20); the voucher price is `Bundle.priceVoucher`.
- **Price only through `productSale(bundle, tier)`** — null means not on sale
  → 404. No fallback price, no client-supplied amount. Names come from
  `productTitle(bundle, tier)`.
- **Store currency is USD** (`STORE_CURRENCY`). Only PayNow converts to SGD
  via the `FX_TO_SGD_USD_BPS` setting and refuses when it is unset.
- **Every paid path ends in `fulfillOrder()`** — idempotent on
  `status === 'PAID'`. Inline capture and webhooks both call it; webhooks are
  the safety net. Fulfil only on a completed capture/payment event, and check
  amount + currency against the order before fulfilling.
- **Webhooks**: verify the provider signature first, log to
  `PaymentWebhookEvent`, dedupe by event id, return 2xx for duplicates.
- **Provider credentials are runtime settings** (`getSetting()`, encrypted
  `Setting` table, admin → Settings → Payment) — never env vars, never
  `NEXT_PUBLIC_*` (the PayPal client id is served by `/api/checkout/methods`).
- **Refunds** go through `src/lib/payments/refund.ts`: credit note (`CN-`
  sequence, separate `Invoice` row), `REFUND_ISSUED` email, and on a full
  refund remove entitlements no other paid order covers.
- A VOUCHER order grants the VOUCHER entitlement **and** the PRACTICE
  entitlement on the same pool exam; voucher codes live on
  `Entitlement.voucher`.
- `NEXT_PUBLIC_TEST_PAYMENTS` gates `/api/test-payment/*`; it must stay unset
  in production.
- Sales relies on `sendOrderAlertEmail()` after each paid order — keep it.
