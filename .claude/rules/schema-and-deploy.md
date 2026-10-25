---
paths:
  - "prisma/schema.prisma"
  - "prisma/migrations/**"
  - "Dockerfile"
  - "docker-compose.yml"
  - ".dockerignore"
---

# Schema, migrations and deploy

- Prisma blocks are multi-line (`enum X {` … `}`), never one-line.
- After a schema change: write the migration (`npx prisma migrate dev --name
  <change>` locally, Postgres on host port **55432**), run `npx prisma
  generate`, and restart the dev server — a running server keeps the old
  client and 500s on new models.
- **Migrations must be backward compatible**: they run in the Docker build
  before `next build` (ISR pre-renders against prod), and the old container
  keeps serving until the new one is healthy. Add columns nullable or with
  defaults; drop/rename in a later deploy.
- Boot runs `prisma/seed.ts` before the server; anything it imports must be
  copied into the runner image (`src/lib`). A crashing boot seed silently
  blocks deploys.
- Coolify auto-deploys on push to `main` (~1–2 min). No SSH/exec; production
  data changes go through admin endpoints.
- Infra-only env vars: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`,
  `SETTINGS_KEY`, `APP_URL`. Everything else is an admin setting.
- Update CLAUDE.md in the same commit when routes, schema, auth, payments or
  deployment change.
