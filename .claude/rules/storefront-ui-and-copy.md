---
paths:
  - "src/app/page.tsx"
  - "src/app/practice-exams/**"
  - "src/app/exam-vouchers/**"
  - "src/app/vendors/**"
  - "src/app/p/**"
  - "src/app/user-dashboard/**"
  - "src/app/checkout/**"
  - "src/components/**"
  - "src/app/globals.css"
  - "tailwind.config.ts"
---

# Storefront UI and copy

- **Words**: Practice Exam, Exam Voucher, Vendor, Certification (admins also
  see Question Bank). Never "bundle", "tier" or "product" in customer copy,
  and never "dumps" / "real exam questions".
- **URLs come from helpers** in `src/lib/products.ts` (`practiceHref`,
  `voucherHref`, `checkoutHref`, …) — don't build them by hand.
- **Promises must be true**: teaser is 10 questions, voucher delivery is
  `VOUCHER_DELIVERY_TEXT`, Practice Exam is `formatPrice(PRACTICE_PRICE_CENTS)`.
  Import the constants instead of retyping numbers.
- **Theme**: light by default. Neutrals are the blue-tinted `slate` ramp;
  use `page` / `canvas` / `ink` / `muted` / `line` tokens and the shared
  `.btn-*`, `.card`, `.input`, `.label`, `.eyebrow` classes. Any `bg-white`
  element with grey text needs its own `dark:bg-*`. Check both themes.
- **Mobile first**: no horizontal scroll at 375px, tap targets ≥ 44px,
  `motion-safe:` on animations.
- Fonts: Archivo for h1–h3 (`font-display`), IBM Plex Sans body, Plex Mono
  for `.eyebrow` labels.
- `useSearchParams()` needs a `<Suspense>` boundary at page level.
- Contact details: email from `getCompanyInfo()`, WhatsApp from
  `src/lib/enquiry-topics.ts` (`whatsappLink()`). Leads go through the
  Support page form (`/p/support`, `/api/enquiries`) — link there with
  `?topic=TEAM#enquiry` etc. rather than adding new forms.
- The user dashboard sidebar has one entry per job; don't duplicate pages.
