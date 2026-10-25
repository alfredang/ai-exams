---
paths:
  - "src/lib/auth.ts"
  - "src/lib/auth.config.ts"
  - "src/proxy.ts"
  - "src/lib/otp.ts"
  - "src/lib/captcha.ts"
  - "src/lib/email-guard.ts"
  - "src/lib/ratelimit.ts"
  - "src/lib/settings.ts"
  - "src/app/api/otp/**"
  - "src/app/api/mobile/auth/**"
  - "src/app/login/**"
  - "src/app/signup/**"
  - "src/app/forgot-password/**"
  - "next.config.*"
---

# Auth and security

- **Edge split**: `src/proxy.ts` imports only `auth.config.ts`. Never import
  argon2, pdf-lib, nodemailer, Prisma or the Claude SDK from the proxy or
  anything it imports.
- Two Credentials providers: `password` and `otp`. The OTP provider signs in
  existing users only; accounts are created by REGISTER / TEASER_GATE verify,
  OAuth, mobile register or an admin.
- **Keep every anti-abuse guard**: Turnstile on all `/api/otp/request`
  purposes (single-use tokens — follow-up codes via `sendLoginCode: true`),
  honeypot + 2s minimum fill, disposable/no-MX screening for new accounts,
  no mail to non-accounts (no enumeration), failures-only sign-in limits,
  codes burned after 5 wrong guesses.
- Report OTP delivery failures; never say a code was sent when it wasn't.
- Passwords use **argon2id**. Settings secrets are AES-256-GCM in `Setting`
  (key `SETTINGS_KEY` || `NEXTAUTH_SECRET`) — credentials are never env vars.
- The rate limiter is in-memory: per-process, lost on restart. Don't rely on
  it for anything that must hold across replicas.
- Impersonated sessions can't change passwords, delete attempts or set
  `passwordSetupRequired`.
- Open security work (docs/security report, local only): session revocation
  via `sessionVersion`, security headers in `next.config`, Next.js/next-auth
  upgrades, PayPal capture/amount checks. Don't widen these gaps.
- Never commit secrets; `.env*`, `.agents/` and `docs/security/` are
  git-ignored. Never upload security reports.
