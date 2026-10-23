FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# `next build` pre-renders ISR pages (the homepage, catalog) against the live
# database, so the schema must be migrated BEFORE the build — otherwise a new
# column makes the build fail and the boot-time migrate below never runs.
# Coolify passes DATABASE_URL as a build arg. Migrations must stay backward
# compatible: the old container keeps serving until the new one is healthy.
RUN npx prisma migrate deploy
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apk add --no-cache openssl
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
# prisma/seed.ts runs on boot and imports ../src/lib/* (pool consolidation);
# without these sources the seed crashes and the new container never starts.
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/node_modules ./node_modules
USER nextjs
EXPOSE 3000
# On every boot:
#   1) apply DB schema migrations (fatal if it fails — schema must match)
#   2) run prisma/seed.ts to ensure the catalog (vendors, exams, admins,
#      team entitlements) is in sync with the latest seed
#   3) start the Next.js server
# Step 2 is idempotent — re-running on every boot is a no-op once data exists.
#
# scripts/seed-all-content.ts is intentionally NOT in the boot chain. It
# runs dozens of question-seeding scripts which are slow and brittle in
# aggregate; if any one fails the whole boot fails and Coolify serves 502.
# Run it manually when you need to refill question content:
#   docker exec <container> npx tsx scripts/seed-all-content.ts
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && npx tsx prisma/seed.ts && node server.js"]
