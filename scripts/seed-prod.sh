#!/usr/bin/env bash
# Fire a one-shot seed endpoint on production: POST /api/admin/seed-<bundle>.
#
#   npm run seed:prod -- ccao-foundations
#   bash scripts/seed-prod.sh ccao-foundations [expected-exam-slug ...]
#
# Credentials come from PROD_ADMIN_EMAIL / PROD_ADMIN_PASSWORD (shell env first,
# then the git-ignored .env). NOT ADMIN_PASSWORD — that is the local dev admin.
# The password is never printed and never passed on a command line.
#
# Optional expected slugs guard against seeding before the deploy that carries
# the new seed code is live: an existing endpoint still answers 200 with the
# OLD code, so if a slug is missing from the response the script exits 4 —
# wait for Coolify and re-run (seeds are idempotent).
set -euo pipefail

BUNDLE="${1:?usage: scripts/seed-prod.sh <bundle> [expected-exam-slug ...]}"
shift
BASE="${PROD_URL:-https://exams.tertiaryinfotech.com}"
cd "$(dirname "$0")/.."

read_env() {
  [ -f .env ] || return 0
  /usr/bin/grep -E "^$1=" .env | tail -1 | cut -d= -f2- | sed -E "s/^['\"]//; s/['\"]$//"
}
EMAIL="${PROD_ADMIN_EMAIL:-$(read_env PROD_ADMIN_EMAIL)}"
PW="${PROD_ADMIN_PASSWORD:-$(read_env PROD_ADMIN_PASSWORD)}"
EMAIL="${EMAIL:-angch@tertiaryinfotech.com}"
if [ -z "$PW" ]; then
  echo "PROD_ADMIN_PASSWORD is empty. Set it in .env, or use the browser fallback in CLAUDE.md." >&2
  exit 2
fi

JAR="$(mktemp)"
trap 'rm -f "$JAR"' EXIT

CSRF="$(curl -fsS -c "$JAR" "$BASE/api/auth/csrf" | jq -r .csrfToken)"
# Credentials provider id is `password` (POST /api/auth/callback/password).
printf '%s' "$PW" | curl -sS -o /dev/null -c "$JAR" -b "$JAR" \
  -X POST "$BASE/api/auth/callback/password" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=$EMAIL" \
  --data-urlencode "password@-" \
  --data-urlencode "callbackUrl=$BASE/admin-dashboard"

# A wrong password still returns 302, so check the session explicitly. One
# attempt only — never loop on a failed login.
ROLE="$(curl -fsS -b "$JAR" "$BASE/api/auth/session" | jq -r '.user.role // empty')"
if [ "$ROLE" != "ADMIN" ]; then
  echo "Admin login failed for $EMAIL (no ADMIN session). Check PROD_ADMIN_PASSWORD; not retrying." >&2
  exit 3
fi
echo "Signed in as $EMAIL (ADMIN)"

OUT="$(curl -sS -b "$JAR" -X POST "$BASE/api/admin/seed-$BUNDLE" -w '\n%{http_code}')"
CODE="$(printf '%s' "$OUT" | tail -1)"
BODY="$(printf '%s' "$OUT" | sed '$d')"
echo "HTTP $CODE"
printf '%s\n' "$BODY" | jq . 2>/dev/null || printf '%s\n' "$BODY"
[ "$CODE" = 200 ] || exit 1

for slug in "$@"; do
  if ! printf '%s' "$BODY" | jq -e --arg s "$slug" '[.exams[]?.slug] | index($s)' >/dev/null; then
    echo "Expected exam '$slug' missing — the new deploy is probably not live yet. Wait and re-run." >&2
    exit 4
  fi
done
