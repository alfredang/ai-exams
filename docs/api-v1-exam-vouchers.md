# /api/v1 — Exam Voucher price checks (agent)

Bearer-token API for the Digital Workforce agent `exam-voucher-pricer` (weekly, Mon 09:33). It reads each vendor's
official exam price; the site sets the selling price. Mint a token at `/admin-dashboard/api-tokens` with scope
**`vouchers:write`**; mutations are audited as the token's admin with `via: 'api'`. The agent calls it only through
`~/DigitalWorkforce/bin/exam-vouchers.py`, which reads the token from the macOS Keychain
(`security add-generic-password -U -s exam-vouchers-token -a "$USER" -w '<token>'`).

| Method & path | Purpose |
|---|---|
| `GET /api/v1/exam-vouchers` | Every Exam Voucher with a price (on or off sale): `bundleId`, `slug`, `voucherSlug`, `code`, `certification`, `vendor`, `priceCents` (selling price, GST inclusive), `onSale`, `voucherUrl`, `officialPages[]`, `lastCheck { at, status, listPriceCents, sourceUrl, by }`, `manualEditAt` |
| `POST /api/v1/exam-vouchers/price-checks` | `{ agent?, model?, dryRun?, checks[≤100]: { ref, status: found\|unavailable, listPriceCents?, currency: 'USD', sourceUrl, note? } }` → `{ updated, held, results[] }` |

`ref` = product slug, voucher slug, bundle id or a unique exam code.

**Pricing rule** (server side, `decidePrice()` in `src/lib/voucher-pricing.ts`): selling price = official list price
+10% for GST, rounded **down** to a whole dollar (`voucherPriceWithGst()`). Per check:

- `unchanged`: the selling price already matches.
- `updated`: price written, AdminLog `voucher.update` (so the deploy seed stops applying its spec price).
- `held` (nothing changed, admin notified): an admin typed the price by hand since the last check, or the list
  price is unchanged since the last check but the selling price was changed, or the change is over 25%.
- `unavailable`: no official USD price could be confirmed; logged only.

Every check is logged as AdminLog `voucher.price_check` and shows on the admin Exam Voucher page ("Vendor price
check"). Updates and holds raise one `voucher.price` admin notification per run. The API never changes on-sale
status, titles, slugs or the Practice Exam price (fixed US$20).
