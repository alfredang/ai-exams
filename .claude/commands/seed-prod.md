---
description: Seed a practice-exam bundle on the live production deployment (exams.tertiaryinfotech.com) via the admin POST /api/admin/seed-<bundle> endpoint.
argument-hint: <bundle-slug> [expected-exam-slug ...]   (e.g. cka, ccao-foundations anthropic-ccao-foundations-p4)
---

You are seeding the **$ARGUMENTS** bundle on the production deployment at `https://exams.tertiaryinfotech.com`.

## Prerequisites — verify before seeding

1. The endpoint `src/app/api/admin/seed-<bundle>/route.ts` exists in the repo.
2. `git status` is clean for the seed files and `git log origin/main..HEAD` is empty (everything pushed).
3. **The deploy carrying the new seed code is live.** Coolify takes ~2–4 min after a push. An *existing* endpoint keeps answering 200 with the OLD seed code until then, so a 200 alone proves nothing. Either poll the site for something only the new commit renders, or pass the expected exam slugs (step 2 below) so the script fails with exit 4 when they're missing.

If 1 or 2 is not true, stop and fix that first — `/seed-prod` only fires the production endpoint; it does NOT push code.

## Workflow

1. Check credentials are configured, without printing the value:
   ```bash
   /usr/bin/grep -qE '^PROD_ADMIN_PASSWORD=.+' .env && echo configured || echo missing
   ```
   **Never** use `ADMIN_PASSWORD` — that is the LOCAL dev admin and does not match production. If missing, go to the browser fallback below; do not guess.

2. Run the script (CSRF → login → `/api/auth/session` role check → POST seed):
   ```bash
   npm run seed:prod -- <bundle> [expected-exam-slug ...]
   ```

## Interpreting the result (script exit codes)

- **0** — HTTP 200 with `{ ok: true, vendor, bundle, exams: [...] }`. Report each exam's `questionCount` / `teaserCount` to the user.
- **1** — the seed returned non-200:
  - **404** → a *new* route isn't deployed yet; wait for Coolify and retry. Still 404 after a few minutes means the deploy probably failed — check Coolify rather than retrying blindly.
  - **403** → the session isn't admin (shouldn't happen after the role check).
  - **500** → read the body for the Prisma error (often schema drift or a `generatedBy` tag mismatch).
- **2** — `PROD_ADMIN_PASSWORD` is empty → use the browser fallback.
- **3** — admin login failed (a wrong password still returns 302, which is why the script checks the session). **Do not retry** — ask the user, or use the browser fallback.
- **4** — an expected exam slug is missing from the response → the new deploy isn't live yet. Wait and re-run; seeds are idempotent.

## Browser fallback (no stored password needed)

1. Playwright: `browser_navigate` to `https://exams.tertiaryinfotech.com/login?next=/admin-dashboard` and ask the user to sign in in that window themselves. Never ask them to paste the password into chat.
2. Poll `fetch('/api/auth/session')` inside the page every few seconds (up to ~5 min) until `user.role === 'ADMIN'`.
3. Run `fetch('/api/admin/seed-<bundle>', { method: 'POST' }).then(r => r.json())` inside the page and report the result.
4. `browser_close` afterwards so the admin session doesn't linger.

(Manual equivalent: the user pastes that same `fetch(...)` into DevTools → Console while signed in as admin.)

## After success

- Load the public bundle page (`/practice-exams/<vendor>/<bundle-slug>`) to confirm the exam count. Variants are labelled "Practice Exam 1…N" there, whatever their titles.
- Do NOT auto-commit or push anything from this command — code changes are a separate concern.
