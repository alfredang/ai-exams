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
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apk add --no-cache openssl
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
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
# scripts/content/seed-all-content.ts is intentionally NOT in the boot chain.
# It loads the large question-bank JSON files and can take long enough that a
# failed content run would turn an otherwise healthy deploy into a 502.
# Run it manually when you need to refill question content:
#   docker exec <container> npm run content:seed
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && npx tsx prisma/seed.ts && node server.js"]
