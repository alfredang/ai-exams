---
paths:
  - "src/app/api/**"
  - "src/app/**/actions.ts"
  - "src/app/**/*-actions.ts"
  - "src/app/admin-dashboard/**/page.tsx"
---

# API routes and server actions

- **Authorize inside every handler.** `src/proxy.ts` only bounces page
  navigations; it is not an authorization layer. Admin routes and admin
  server actions re-check `role === 'ADMIN'` (or `requireAdmin()` from
  `src/lib/auth.ts`) themselves, even when the page already did.
- **Ownership, not just login.** Records fetched by id (attempts, orders,
  invoices, vouchers, entitlements) must also match `userId` — or the `gt`
  guest cookie for teaser attempts. Return 404, not 403, for other people's ids.
- **Validate input with zod** and use `safeParse` → 400 with a readable
  message; never let a malformed body become a 500.
- **Public POST endpoints** (forms anyone can submit) follow
  `/api/otp/request` and `/api/enquiries`: require `application/json`
  (blocks cross-site form posts), honeypot + `elapsedMs` from
  `useCaptcha().fields()`, `verifyCaptcha()`, then `rateLimit()` keyed by
  `clientIp()` and `rateLimitEmailKey()`. Bots get a fake `{ ok: true }`.
- **Never key on raw `X-Forwarded-For`** — use `clientIp()`.
- **Never trust client numbers**: prices come from `productSale()`, scores
  from `scoreAttempt()`, timers from `Attempt.expiresAt`.
- **Admin mutations write `AdminLog`** (`action` like `thing.verb`,
  `targetType`, `targetId`, small `metadata`). API-token (`/api/v1`) mutations
  are audited as the token's admin with `via: 'api'`.
- **No user-supplied URL is fetched server-side** (SSRF). Server fetches go
  to fixed provider hosts only.
- **Email HTML** interpolates user text through `escapeHtml()`; never log
  OTP codes or put them in `EmailLog.payloadVars`.
- `/api/mobile/*` shapes are a contract with shipped iOS/Android apps —
  additive changes only.
