# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common commands

```bash
# Local infra (Postgres + MailHog). Postgres is mapped to host :55432 to avoid
# conflicts with a system Postgres on :5432 — keep this in DATABASE_URL.
docker compose up -d postgres mailhog

# First-time setup
npm install --legacy-peer-deps
cp .env.example .env             # then set DATABASE_URL host port to 55432
npx prisma migrate dev --name init
npm run db:seed                  # admin + AWS SAA-C03 (60q, 30 teaser) + AZ-900 + CompTIA vendor

# Day-to-day
npm run dev -- -p 3040 -H 127.0.0.1   # repo uses port 3040
npm run typecheck
npm run lint
npm run build                          # `prisma generate && next build`
npm run db:studio

# After schema.prisma changes
npx prisma migrate dev --name <change>
```

There is no test runner. Manual verification flows live in [README.md](README.md).

## Architecture

Single Next.js 15 App Router app — server logic (PayPal webhooks, Auth.js, Claude SSE, voucher PDF) lives in route handlers. The brief mentioned Vite as an alternative; we chose Next.js for the unified server.

### Routing surface (key paths)
- `/` — gradient hero + vendor grid + popular bundles
- `/practice-exams` (catalog of bundles) → `/practice-exams/[vendor]` → `/practice-exams/[vendor]/[slug]` (bundle detail, presented as the buyable product) → `…/teaser` (free teaser launcher)
- `/login`, `/signup`, `/verify-otp`, `/forgot-password` — two-card layout, dual auth
- `/exam/[attemptId]` — unified runner for Practice and Exam mode (no separate /practice/ route)
- `/results/[attemptId]` — per-domain breakdown + review
- `/checkout/[bundleId]?tier=PRACTICE|VOUCHER` — checkout is always for a Bundle, never a single exam
- `/my-content`, `/my-content/{exams,attempts,vouchers,settings}`
- `/admin-dashboard/{vendors,exams,bundles,questions,users,orders}` and `/admin-dashboard/exams/[id]/author`

### Auth & RBAC (subtle)
- **Two NextAuth Credentials providers** in [src/lib/auth.ts](src/lib/auth.ts): id `password` and id `otp`. The OTP provider verifies a code from `OtpCode` (no FK to user) and creates the user if needed.
- **Edge-safe split**: middleware imports [src/lib/auth.config.ts](src/lib/auth.config.ts) (no providers, no Prisma, no argon2) — argon2 has `node:crypto` imports that webpack edge cannot bundle. The full config in [src/lib/auth.ts](src/lib/auth.ts) extends it with the heavy providers.
- **OTP table has no FK** ([prisma/schema.prisma](prisma/schema.prisma) `OtpCode`) so codes can be issued before the user exists — required for the teaser→signup flow. Purposes: `LOGIN | REGISTER | RESET | TEASER_GATE`.
- [src/middleware.ts](src/middleware.ts) gates `/admin/*`, `/api/admin/*`, `/my-content/*`. Admin routes also re-check `role === 'ADMIN'` server-side.
- **In-memory rate limiter** ([src/lib/ratelimit.ts](src/lib/ratelimit.ts)) does NOT survive restarts and does not work across replicas. Replace with Redis/Upstash before scaling out.
- Password hashing uses **argon2id** (deviates from spec's bcrypt — argon2id is OWASP-recommended).

### Exam runtime — the most subtle part
- [components/exam-runner.tsx](src/components/exam-runner.tsx) is one client component for both modes. Mode is a prop. Differences: PRACTICE reveals correctness/explanation immediately; EXAM auto-saves every 15s and auto-submits at timer 0.
- **Question types**: schema reserves `SINGLE | MULTI | TRUE_FALSE | ORDERING | HOTSPOT`, but the runner currently only renders SINGLE/MULTI/TRUE_FALSE. ORDERING and HOTSPOT are deferred — admins can still seed them but users can't take them yet.
- `Attempt.responses` is `Json` shaped as `Record<questionId, { answer: string[]; flagged?: boolean; timeSpent?: number }>` (see [src/lib/attempts.ts](src/lib/attempts.ts) `Responses` type). There is **no AttemptAnswer table** — flags, answers, and per-question timing all live in this JSON blob.
- Server-side timing for Exam mode comes from `Attempt.expiresAt` set at start. The page recomputes remaining seconds from `expiresAt - now()`. Submit also recomputes the score from responses + question definitions in [src/lib/attempts.ts](src/lib/attempts.ts) `scoreAttempt()` — never trust client-reported correctness.
- **Autosave** flushes the in-memory responses every 15s through `/api/attempts/autosave` if the runner has dirty state. There is also a `beforeunload` warning. Resume is automatic — visiting `/exam/:id` for an unsubmitted attempt rehydrates from `attempt.responses`.
- **Teaser flow**: anonymous users get an httpOnly `gt` cookie (random `g_<uuid>`); the Attempt is created with `guestToken = gt` and `userId = null`. After answering 20 or 30, [components/teaser-gate.tsx](src/components/teaser-gate.tsx) modal asks for email → OTP (`TEASER_GATE`) → user upserted → `Attempt.userId` reassigned in the OTP-verify endpoint via cookie match. Don't break this path: the migration is in [src/app/api/otp/verify/route.ts](src/app/api/otp/verify/route.ts).

### Payments / fulfillment
- **Bundle-only pricing.** We do not sell individual exams. Every saleable product is a `Bundle` that groups multiple practice exams (and optionally a real-exam voucher) for a single certification. The `Exam` model has no price columns — prices live on `Bundle.price` (PRACTICE tier) and optional `Bundle.priceVoucher` (PRACTICE + real-exam voucher).
- All money paths converge on [src/lib/fulfill.ts](src/lib/fulfill.ts) `fulfillOrder()`. Idempotent (checks `status === 'PAID'`, upserts `paypalCaptureId`).
- **Order shape**: `Order` targets a `bundleId + tier` (PRACTICE or VOUCHER). Fulfillment walks `BundleItem[]` and writes one `Entitlement(userId, examId, tier)` per item. VOUCHER bundles produce a VOUCHER entitlement plus PRACTICE entitlements for every exam in the bundle (you get the practice access too).
- `Entitlement` unique on `(userId, examId, tier)` — the same exam can be granted at multiple tiers if a user buys both PRACTICE and VOUCHER variants.
- **Voucher** code lives on `Entitlement.voucher` (no separate Voucher table). Generated by [src/lib/utils.ts](src/lib/utils.ts) `genVoucherCode()`. PDF is rendered by [src/lib/voucher-pdf.ts](src/lib/voucher-pdf.ts) using `pdf-lib`, attached to the purchase email and downloadable from `/api/vouchers/[id]/pdf`.
- [api/paypal/capture](src/app/api/paypal/capture/route.ts) is the inline happy path; [api/paypal/webhook](src/app/api/paypal/webhook/route.ts) is the safety net for closed tabs — both call `fulfillOrder`.

### AI generation (admin)
- **Tool use, not JSON-from-text**: [src/lib/claude.ts](src/lib/claude.ts) defines a `submit_question` tool and emits each tool call as a question event. Schema enforced with Zod (`QuestionSchema`).
- **SSE streaming** to admin: [api/admin/generate-questions](src/app/api/admin/generate-questions/route.ts) writes each generated question to the DB as DRAFT then emits an SSE `question` event so the UI in [admin/exams/[id]/generate/generator-client.tsx](src/app/admin/exams/[id]/generate/generator-client.tsx) shows them as they arrive with per-row Approve/Discard.
- System prompt explicitly forbids real-exam claims and requires reference URLs. Preserve that wording when editing.
- Domain weighting is forwarded from `Exam.domains` so generation distribution can match the published blueprint.

### Data model invariants
- **Bundle is the unit of sale.** `Exam` has no price columns; only `Bundle.price` and `Bundle.priceVoucher` matter. Don't add per-exam pricing back — it will diverge from the catalog UI and `fulfillOrder`.
- `Bundle` membership is also the source of truth for "which exams belong to this cert" — the old `ExamSet` model has been dropped. Catalog cards and vendor pages derive their exam list from `Bundle.items[].exam`.
- `Entitlement` unique on `(userId, examId, tier)` — same exam can have multiple tiers granted.
- `Question.status` is `DRAFT | PUBLISHED | ARCHIVED`. Public reads filter by `PUBLISHED`. Drafts are admin-only.
- `Question.isTeaser` flags the free preview set per exam (count configurable via admin Settings).
- `Question.options` is `Json` shaped as `[{id, text}]`. `Question.correct` is `Json` shaped as `string[]` of option ids. There is **no AnswerOption table** — keep these JSON shapes consistent across seed, generator, and runner.
- `AdminLog` is written by the AI generator. Add entries when adding admin mutations.

## Things to watch out for

- **Postgres host port 55432**, not 5432 (system Postgres collision). Keep `docker-compose.yml` and `.env` in sync.
- **`--legacy-peer-deps`** is required for `npm install` because `next-auth@5.0.0-beta.25` and a few Radix peers don't yet declare React 19. Don't drop the flag.
- **Edge runtime**: never import `argon2`, `pdf-lib`, `@anthropic-ai/claude-agent-sdk`, `nodemailer`, or `@prisma/client` from middleware or any file middleware imports. Use `auth.config.ts` for the edge-safe shape.
- **Prisma schema** must use multi-line block syntax — Prisma rejects `enum X { A B }` on one line.
- **`(session.user as any).{id,role}`** casts are intentional — NextAuth's default `User` type doesn't include them. Add a module augmentation if you want to remove the casts.
- **`useSearchParams()` requires a `<Suspense>` boundary** at the page level for Next 15 build to succeed (see [src/app/login/page.tsx](src/app/login/page.tsx) for the pattern).
- **MailHog** catches OTP and purchase emails in dev — http://127.0.0.1:8025. SMTP failures are swallowed, so registration won't error if mail is down but the user also won't see the code.

## Deployment

Coolify-ready via [Dockerfile](Dockerfile) (multi-stage, Next standalone). Container runs `prisma migrate deploy` before `node server.js` on boot. See [README.md](README.md) for env var checklist.

## Seeding a new exam bundle to production

CKAD and CKA are the canonical templates. Coolify auto-deploys on push to `main`; there is no SSH/exec to the container — production seeding goes through a one-shot admin API endpoint.

For every new bundle `xyz` (mirror [src/lib/seed/ckad-questions.ts](src/lib/seed/ckad-questions.ts) and friends):

1. **Idempotent seed module** `src/lib/seed/xyz-questions.ts` — upserts vendor/exams/bundle; deletes + recreates questions tagged `generatedBy: 'manual:xyz-seed'`.
2. **CLI shim** `prisma/seeds/xyz.ts` — invokes `seedXyz(db)` for local runs (`npx tsx prisma/seeds/xyz.ts`).
3. **Admin endpoint** `src/app/api/admin/seed-xyz/route.ts` — admin-gated, writes an `AdminLog` entry (clone [src/app/api/admin/seed-ckad/route.ts](src/app/api/admin/seed-ckad/route.ts)).
4. **Catalog entries** in [prisma/seed.ts](prisma/seed.ts) (`bundleSpecs` + `EXAM_SEEDS`) so `npm run db:seed` on a fresh DB also registers the rows.
5. `git push origin main` and wait ~1–2 min for Coolify to redeploy.
6. Seed production from this machine:

```bash
export SEED_ADMIN_EMAIL="<admin-email>"
export SEED_ADMIN_PASSWORD="<admin-password>"

# 1. CSRF
curl -sS -c /tmp/cookies.txt https://ai-exams.tertiaryinfo.tech/api/auth/csrf -o /tmp/csrf.json
CSRF=$(jq -r .csrfToken /tmp/csrf.json)

# 2. Admin login via NextAuth credentials provider id `password`
curl -sS -c /tmp/cookies.txt -b /tmp/cookies.txt \
  -X POST https://ai-exams.tertiaryinfo.tech/api/auth/callback/password \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=$SEED_ADMIN_EMAIL" \
  --data-urlencode "password=$SEED_ADMIN_PASSWORD" \
  --data-urlencode "callbackUrl=https://ai-exams.tertiaryinfo.tech/admin-dashboard"

# 3. Fire the seed (idempotent)
curl -sS -b /tmp/cookies.txt -X POST \
  https://ai-exams.tertiaryinfo.tech/api/admin/seed-xyz \
  -w "\nHTTP_STATUS=%{http_code}\n"
```

Notes:
- The session cookie is `__Secure-authjs.session-token` (NextAuth v5 / authjs).
- The credentials provider id is **`password`** — POST to `/api/auth/callback/password`, NOT `/api/auth/signin/password` (that's the form page). The `otp` provider only accepts one-time codes.
- A 404 right after push means the new route hasn't rolled out yet — retry after the deploy completes. A 200 with `{ ok: true, exams: [...] }` confirms the seed ran.
- Seeds are idempotent (delete-and-recreate by `generatedBy` tag); safe to re-run.
