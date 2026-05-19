---
description: Seed a practice-exam bundle on the live production deployment (ai-exams.tertiaryinfo.tech) via the admin POST /api/admin/seed-<bundle> endpoint.
argument-hint: <bundle-slug>   (e.g. cka, ckad)
---

You are seeding the **$ARGUMENTS** bundle on the production deployment at `https://ai-exams.tertiaryinfo.tech`.

## Prerequisites — verify before seeding

1. The endpoint `src/app/api/admin/seed-$ARGUMENTS/route.ts` exists in the repo.
2. `git status` is clean and `git log origin/main..HEAD` is empty (everything pushed).
3. The latest commit touching that file is on `origin/main` (auto-deploy is triggered by push to main).

If any of these are not true, stop and fix that first — `/seed-prod` only fires the production endpoint; it does NOT push code.

## Workflow

Run these shell commands in sequence from this repo's working directory:

```bash
export SEED_ADMIN_EMAIL="<admin-email>"
export SEED_ADMIN_PASSWORD="<admin-password>"

# 1. Fetch CSRF token
curl -sS -c /tmp/seed-cookies.txt https://ai-exams.tertiaryinfo.tech/api/auth/csrf -o /tmp/seed-csrf.json
CSRF=$(jq -r .csrfToken /tmp/seed-csrf.json)

# 2. Log in via NextAuth credentials provider id `password`
#    (NOT the `otp` provider, and NOT /api/auth/signin/password which is the form page)
curl -sS -c /tmp/seed-cookies.txt -b /tmp/seed-cookies.txt \
  -X POST https://ai-exams.tertiaryinfo.tech/api/auth/callback/password \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=$SEED_ADMIN_EMAIL" \
  --data-urlencode "password=$SEED_ADMIN_PASSWORD" \
  --data-urlencode "callbackUrl=https://ai-exams.tertiaryinfo.tech/admin-dashboard" \
  -w "login HTTP=%{http_code}\n" -o /dev/null

# 3. Fire the seed (idempotent — safe to re-run)
curl -sS -b /tmp/seed-cookies.txt \
  -X POST https://ai-exams.tertiaryinfo.tech/api/admin/seed-$ARGUMENTS \
  -w "\nHTTP_STATUS=%{http_code}\n"
```

## Interpreting the result

- **HTTP 200** with `{ ok: true, vendor, bundle, exams: [...] }` → success. Report the per-exam `questionCount` / `teaserCount` back to the user.
- **HTTP 404** → the new route is not deployed yet. The Coolify auto-deploy on push to `main` typically takes ~1–2 minutes; retry once. If it's still 404 after a few minutes, the deploy probably failed — check Coolify rather than retrying blindly.
- **HTTP 403** → the admin login step failed (login HTTP was probably 302 to `/login?error=...`). Re-verify the credentials provider id is `password` and the email/password match an existing admin. For seeded admins, the password comes from `SEED_ADMIN_PASSWORD`.
- **HTTP 500** → check the response body for the Prisma error. Often a schema drift or a missing `generatedBy` tag mismatch.

The session cookie name on production is `__Secure-authjs.session-token` (NextAuth v5 / authjs). Don't hardcode it — the cookie jar `-c /tmp/seed-cookies.txt` handles it.

## After success

- Tell the user the bundle is live and to refresh `/admin-dashboard/exams?q=<code>` to verify the rows.
- Do NOT auto-commit or push anything from this command — code changes are a separate concern.
