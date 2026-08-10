# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Keep this file up to date.** Whenever a change touches routes, the Prisma schema, auth, payments, or deployment, update the matching section here in the same commit. Stale guidance is worse than none — it has already caused wrong assumptions (e.g. this file claimed PayPal was the only payment provider long after Stripe/HitPay/PayNow shipped).

## Common commands

```bash
# Local infra (Postgres + MailHog). Postgres is mapped to host :55432 to avoid
# conflicts with a system Postgres on :5432 — keep this in DATABASE_URL.
docker compose up -d postgres mailhog

# First-time setup
npm install --legacy-peer-deps
cp .env.example .env             # then set DATABASE_URL host port to 55432
npx prisma migrate dev --name init
npm run db:seed                  # admin user + full bundle catalog (prisma/seed.ts + src/lib/seed/*)

# Day-to-day
npm run dev -- -p 3040 -H 127.0.0.1   # repo uses port 3040
npm run typecheck
npm run build                          # `prisma generate && next build --webpack`
npm run db:studio
# npm run lint is BROKEN — this Next version dropped `next lint` (it parses
# "lint" as a directory). Rely on typecheck + build until ESLint is re-wired.

# After schema.prisma changes
npx prisma migrate dev --name <change>
```

There is no test runner. Manual verification flows live in [README.md](README.md).

## Architecture

Single Next.js App Router app — server logic (payment webhooks for PayPal/Stripe/HitPay, Auth.js, Claude SSE, voucher PDF) lives in route handlers. The brief mentioned Vite as an alternative; we chose Next.js for the unified server.

### Routing surface (key paths)
- `/` — gradient hero + vendor grid + popular bundles
- `/practice-exams` (catalog of bundles) → `/practice-exams/[vendor]` → `/practice-exams/[vendor]/[slug]` (bundle detail, presented as the buyable product) → `…/teaser` (free teaser launcher; teaser links use the per-exam slug, e.g. `…/aws-aif-c01-p1/teaser`)
- `/login`, `/signup`, `/verify-otp`, `/forgot-password` — two-card layout, dual auth + social login (Google/GitHub/LinkedIn/Microsoft, toggled per provider in admin Settings)
- `/exam/[attemptId]` — unified runner for Practice and Exam mode (no separate /practice/ route)
- `/results/[attemptId]` — per-domain breakdown + review (+ `/share` variant)
- `/checkout/bundle/[bundleId]?tier=PRACTICE|VOUCHER` — checkout is always for a Bundle, never a single exam; result pages at `/checkout/{success,failed,processing}`
- `/user-dashboard`, `/user-dashboard/{exams,attempts,vouchers,orders,invoices,settings}` — the logged-in "my content" area (the old `/my-content` routes are gone)
- `/admin-dashboard/*` — vendors, exams (incl. `[id]/author` and `[id]/generate`), bundles, questions, users, admins, orders, invoices, vouchers, coupons, payments (webhook log), reports, reviews, testimonials, banners, pages, faq, emails, notifications, audit, api-tokens, settings
- `/api/mobile/*` — REST surface for the native iOS/Android apps (auth, catalog, attempts, library, account). Don't rename these without coordinating an app release.

### Auth & RBAC (subtle)
- **Two NextAuth Credentials providers** in [src/lib/auth.ts](src/lib/auth.ts): id `password` and id `otp`. The OTP provider verifies a code from `OtpCode` (no FK to user) and creates the user if needed.
- **Edge-safe split**: middleware imports [src/lib/auth.config.ts](src/lib/auth.config.ts) (no providers, no Prisma, no argon2) — argon2 has `node:crypto` imports that webpack edge cannot bundle. The full config in [src/lib/auth.ts](src/lib/auth.ts) extends it with the heavy providers.
- **OTP table has no FK** ([prisma/schema.prisma](prisma/schema.prisma) `OtpCode`) so codes can be issued before the user exists — required for the teaser→signup flow. Purposes: `LOGIN | REGISTER | RESET | TEASER_GATE`.
- [src/proxy.ts](src/proxy.ts) (the middleware; Next now calls this "proxy") gates `/admin-dashboard/*`, `/api/admin/*`, `/user-dashboard/*` — anonymous users bounce to `/login?next=…`, non-admins on admin paths bounce to `/`. Admin pages/APIs also re-check `role === 'ADMIN'` server-side.
- **In-memory rate limiter** ([src/lib/ratelimit.ts](src/lib/ratelimit.ts)) does NOT survive restarts and does not work across replicas. Replace with Redis/Upstash before scaling out.
- Password hashing uses **argon2id** (deviates from spec's bcrypt — argon2id is OWASP-recommended).

### Exam runtime — the most subtle part
- [components/exam-runner.tsx](src/components/exam-runner.tsx) is one client component for both modes. Mode is a prop. Differences: PRACTICE reveals correctness/explanation/references immediately (references rows are historically either URL strings or `{url,label}` objects — handle both); EXAM persists each answer via a debounced call to `/api/attempts/answer`, auto-saves every 15s, and auto-submits at timer 0 with a "Time's up" overlay.
- Submission goes through a **review modal** (answered/unanswered/flagged counts, tap-to-jump chips) — EXAM mode disables the submit button until every question is answered; PRACTICE can finish anytime. Keyboard: ←/→ navigate, F flags. Don't reintroduce `alert()`/`confirm()` here.
- **Question types**: schema reserves `SINGLE | MULTI | TRUE_FALSE | ORDERING | HOTSPOT`, but the runner currently only renders SINGLE/MULTI/TRUE_FALSE. ORDERING and HOTSPOT are deferred — admins can still seed them but users can't take them yet.
- `Attempt.responses` is `Json` shaped as `Record<questionId, { answer: string[]; flagged?: boolean; timeSpent?: number }>` (see [src/lib/attempts.ts](src/lib/attempts.ts) `Responses` type). There is **no AttemptAnswer table** — flags, answers, and per-question timing all live in this JSON blob.
- Server-side timing for Exam mode comes from `Attempt.expiresAt` set at start. The page recomputes remaining seconds from `expiresAt - now()`. Submit also recomputes the score from responses + question definitions in [src/lib/attempts.ts](src/lib/attempts.ts) `scoreAttempt()` — never trust client-reported correctness.
- **Autosave** flushes the in-memory responses every 15s through `/api/attempts/autosave` if the runner has dirty state. There is also a `beforeunload` warning. Resume is automatic — visiting `/exam/:id` for an unsubmitted attempt rehydrates from `attempt.responses`.
- **Teaser flow**: anonymous users get an httpOnly `gt` cookie (random `g_<uuid>`); the Attempt is created with `guestToken = gt` and `userId = null`. The teaser is **pinned at exactly 10 questions** in code (`getTeaserSize()` in [src/lib/settings.ts](src/lib/settings.ts)) because marketing copy promises "10 free" site-wide — it is deliberately NOT admin-configurable. [components/teaser-gate.tsx](src/components/teaser-gate.tsx) modal asks for email → OTP (`TEASER_GATE`) → user upserted → `Attempt.userId` reassigned in the OTP-verify endpoint via cookie match. Don't break this path: the migration is in [src/app/api/otp/verify/route.ts](src/app/api/otp/verify/route.ts).

### Payments / fulfillment
- **Four providers**: PayPal (in-page buttons, USD), Stripe (Checkout redirect, USD), HitPay (redirect — card/PayNow/GrabPay/Apple Pay, SGD), and PayNow QR (SGD, manual verification). Each has its own route group under `src/app/api/{paypal,stripe,hitpay,paynow}/`; shared helpers live in [src/lib/payments/](src/lib/payments/) and [src/lib/paypal.ts](src/lib/paypal.ts).
- **Runtime-configured, not env-configured**: provider credentials, enabled flags, and environments live in the encrypted `Setting` table (AES-256-GCM, key from `SETTINGS_KEY` || `NEXTAUTH_SECRET` — see [src/lib/settings.ts](src/lib/settings.ts); `getSetting()` reads DB first, then falls back to `process.env`). Admins edit them at `/admin-dashboard/settings/payment`; a step-by-step **Payment Setup Guide** with live status chips and webhook URLs is at `/admin-dashboard/settings/payment-guide`.
- `/api/checkout/methods` tells the checkout client which methods are enabled and serves the PayPal client id (so the admin-configured value takes effect without a rebuild — don't reintroduce a `NEXT_PUBLIC_PAYPAL_CLIENT_ID`-only path, its `'sb'` fallback silently rendered sandbox buttons).
- **Bundle-only pricing.** We do not sell individual exams. Every saleable product is a `Bundle` that groups multiple practice exams (and optionally a real-exam voucher) for a single certification. The `Exam` model has no price columns — prices live on `Bundle.price` (PRACTICE tier) and optional `Bundle.priceVoucher` (PRACTICE + real-exam voucher).
- All money paths converge on [src/lib/fulfill.ts](src/lib/fulfill.ts) `fulfillOrder()` — idempotent (checks `status === 'PAID'`). Inline happy paths (e.g. [api/paypal/capture](src/app/api/paypal/capture/route.ts)) and the per-provider webhooks both call it; webhooks are the safety net for closed tabs. Webhook events are logged to `PaymentWebhookEvent` (visible under admin → Payments) and deduped by event id. Stripe fulfills from `checkout.session.completed`; PayPal from `PAYMENT.CAPTURE.COMPLETED` / `CHECKOUT.ORDER.APPROVED` (signature verified against `PAYPAL_WEBHOOK_ID`); HitPay signs callbacks with the account Salt and needs no dashboard webhook registration.
- **Order shape**: `Order` targets a `bundleId + tier` (PRACTICE or VOUCHER) with provider-agnostic columns (`provider`, `providerOrderId`, `providerCaptureId`, `providerPayload`; the `paypal*` columns are legacy back-compat). Orders carry an optional `couponId + discount` snapshot (coupons are validated server-side via [src/lib/coupons.ts](src/lib/coupons.ts) — every create-order route accepts `couponCode`) and a `billingAddressId`. Fulfillment walks `BundleItem[]` and writes one `Entitlement(userId, examId, tier)` per item; VOUCHER bundles produce a VOUCHER entitlement plus PRACTICE entitlements for every exam in the bundle. Invoices ([src/lib/invoice/](src/lib/invoice/)) and refunds ([src/lib/payments/refund.ts](src/lib/payments/refund.ts)) hang off the order.
- `Entitlement` unique on `(userId, examId, tier)` — the same exam can be granted at multiple tiers if a user buys both PRACTICE and VOUCHER variants.
- **Voucher** code lives on `Entitlement.voucher` (no separate Voucher table). Generated by [src/lib/utils.ts](src/lib/utils.ts) `genVoucherCode()`. PDF is rendered with `pdf-lib` (see [src/lib/pdf/](src/lib/pdf/)), attached to the purchase email and downloadable from `/api/vouchers/[id]/pdf`.
- **Test payments**: `NEXT_PUBLIC_TEST_PAYMENTS=true` exposes a skip-payment button on checkout and unlocks `/api/test-payment/*`. Must be unset in production.

### Email transport
- Three transports in [src/lib/mail.ts](src/lib/mail.ts), selected by the `EMAIL_TRANSPORT` setting: `GMAIL_OAUTH` (refresh token via `/api/admin/gmail-oauth/*` connect flow), `GMAIL_SERVICE_ACCOUNT` (Workspace domain-wide delegation — JWT minted with `node:crypto`, scope must be `https://mail.google.com/` because SMTP XOAUTH2 rejects the narrower `gmail.send`), and `SMTP`. Configured at `/admin-dashboard/settings/email`.
- **Automatic fallback**: `sendMail()` tries the primary transport, then every other fully-configured transport, unless `EMAIL_FALLBACK_ENABLED` is set to `false`. The `EmailLog` row records the transport that actually delivered; a fallback note goes in its `error` column.
- Gmail OAuth refresh tokens are revoked by Google when the mailbox password changes — the service-account transport exists precisely to survive that.

### AI generation (admin)
- **Tool use, not JSON-from-text**: [src/lib/claude.ts](src/lib/claude.ts) defines a `submit_question` tool and emits each tool call as a question event. Schema enforced with Zod (`QuestionSchema`).
- **SSE streaming** to admin: [api/admin/generate-questions](src/app/api/admin/generate-questions/route.ts) writes each generated question to the DB as DRAFT then emits an SSE `question` event so the UI in [admin-dashboard/exams/[id]/generate/generator-client.tsx](src/app/admin-dashboard/exams/[id]/generate/generator-client.tsx) shows them as they arrive with per-row Approve/Discard.
- System prompt explicitly forbids real-exam claims and requires reference URLs. Preserve that wording when editing.
- Domain weighting is forwarded from `Exam.domains` so generation distribution can match the published blueprint.

### Data model invariants
- **Bundle is the unit of sale.** `Exam` has no price columns; only `Bundle.price` and `Bundle.priceVoucher` matter. Don't add per-exam pricing back — it will diverge from the catalog UI and `fulfillOrder`.
- `Bundle` membership is also the source of truth for "which exams belong to this cert" — the old `ExamSet` model has been dropped. Catalog cards and vendor pages derive their exam list from `Bundle.items[].exam`.
- `Entitlement` unique on `(userId, examId, tier)` — same exam can have multiple tiers granted.
- `Question.status` is `DRAFT | PUBLISHED | ARCHIVED`. Public reads filter by `PUBLISHED`. Drafts are admin-only.
- `Question.isTeaser` flags the free preview set per exam (served size is pinned at 10 — see teaser flow above).
- `Question.options` is `Json` shaped as `[{id, text}]`. `Question.correct` is `Json` shaped as `string[]` of option ids. There is **no AnswerOption table** — keep these JSON shapes consistent across seed, generator, and runner.
- `AdminLog` is written by the AI generator. Add entries when adding admin mutations.

## Things to watch out for

- **Postgres host port 55432**, not 5432 (system Postgres collision). Keep `docker-compose.yml` and `.env` in sync.
- **`--legacy-peer-deps`** is required for `npm install` because `next-auth@5.0.0-beta.25` and a few Radix peers don't yet declare React 19. Don't drop the flag.
- **Edge runtime**: never import `argon2`, `pdf-lib`, `@anthropic-ai/claude-agent-sdk`, `nodemailer`, or `@prisma/client` from [src/proxy.ts](src/proxy.ts) or any file it imports. Use `auth.config.ts` for the edge-safe shape.
- **Prisma schema** must use multi-line block syntax — Prisma rejects `enum X { A B }` on one line.
- **`(session.user as any).{id,role}`** casts are intentional — NextAuth's default `User` type doesn't include them. Add a module augmentation if you want to remove the casts.
- **`useSearchParams()` requires a `<Suspense>` boundary** at the page level for Next 15 build to succeed (see [src/app/login/page.tsx](src/app/login/page.tsx) for the pattern).
- **MailHog** catches OTP and purchase emails in dev — http://127.0.0.1:8025. SMTP failures are swallowed, so registration won't error if mail is down but the user also won't see the code.

## Deployment

Coolify-ready via [Dockerfile](Dockerfile) (multi-stage, Next standalone). Container runs `prisma migrate deploy` before `node server.js` on boot. Coolify auto-deploys on push to `main` (~1–2 min); there is no SSH/exec into the container. See [README.md](README.md) for the env var checklist.

Env vars are only for infrastructure: `DATABASE_URL`, `NEXTAUTH_URL`/`NEXTAUTH_SECRET`, `SETTINGS_KEY` (settings encryption — rotating it orphans stored secrets), `APP_URL` (used to build payment redirect/webhook URLs). Payment/email/OAuth credentials are NOT env vars — they're managed in-app under `/admin-dashboard/settings/*`. Keep `NEXT_PUBLIC_TEST_PAYMENTS` unset in production.

## Seeding a new exam bundle to production

CKAD and CKA are the canonical templates. Coolify auto-deploys on push to `main`; there is no SSH/exec to the container — production seeding goes through a one-shot admin API endpoint.

For every new bundle `xyz` (mirror [src/lib/seed/ckad-questions.ts](src/lib/seed/ckad-questions.ts) and friends):

1. **Idempotent seed module** `src/lib/seed/xyz-questions.ts` — upserts vendor/exams/bundle; deletes + recreates questions tagged `generatedBy: 'manual:xyz-seed'`.
2. **CLI shim** `prisma/seeds/xyz.ts` — invokes `seedXyz(db)` for local runs (`npx tsx prisma/seeds/xyz.ts`).
3. **Admin endpoint** `src/app/api/admin/seed-xyz/route.ts` — admin-gated, writes an `AdminLog` entry (clone [src/app/api/admin/seed-ckad/route.ts](src/app/api/admin/seed-ckad/route.ts)).
4. **Catalog entries** in [prisma/seed.ts](prisma/seed.ts) — add the exam to `EXAMS` and the bundle to `BUNDLES` so `npm run db:seed` on a fresh DB also registers the rows. Notes:
   - `BUNDLES` membership is what keeps a bundle published: `seededSlugs` is derived from it, and any bundle *not* in the list is auto-unpublished on every deploy.
   - Uniform `${slug}-p1..-pN` variants **that have a voucher tier** can use the `buildMultiVariantBundles()` spec list instead; it always appends a VOUCHER item, so practice-only bundles must be hand-written.
   - Add an entry to `VENDOR_EXAM_CODE_OVERRIDES` whenever the vendor's exam code isn't the slug-minus-vendor-prefix uppercased — otherwise the variant recode loop rewrites your exam codes on **every** deploy.
   - `published`, `questionCount`, and `code` are deliberately excluded from the exam upsert's `update` clause (prod admins are authoritative), so `HIDDEN_EXAM_SLUGS` and the initial question count only take effect on **create**. Get them right on the first deploy.
5. `git push origin main` and wait ~1–2 min for Coolify to redeploy.
6. Seed production from this machine:

```bash
# 1. CSRF
curl -sS -c /tmp/cookies.txt https://exams.tertiaryinfotech.com/api/auth/csrf -o /tmp/csrf.json
CSRF=$(jq -r .csrfToken /tmp/csrf.json)

# 2. Admin login via NextAuth credentials provider id `password`
curl -sS -c /tmp/cookies.txt -b /tmp/cookies.txt \
  -X POST https://exams.tertiaryinfotech.com/api/auth/callback/password \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=angch@tertiaryinfotech.com" \
  --data-urlencode "password=password123" \
  --data-urlencode "callbackUrl=https://exams.tertiaryinfotech.com/admin-dashboard"

# 3. Fire the seed (idempotent)
curl -sS -b /tmp/cookies.txt -X POST \
  https://exams.tertiaryinfotech.com/api/admin/seed-xyz \
  -w "\nHTTP_STATUS=%{http_code}\n"
```

Notes:
- The session cookie is `__Secure-authjs.session-token` (NextAuth v5 / authjs).
- The credentials provider id is **`password`** — POST to `/api/auth/callback/password`, NOT `/api/auth/signin/password` (that's the form page). The `otp` provider only accepts one-time codes.
- A 404 right after push means the new route hasn't rolled out yet — retry after the deploy completes. A 200 with `{ ok: true, exams: [...] }` confirms the seed ran.
- Seeds are idempotent (delete-and-recreate by `generatedBy` tag); safe to re-run.
