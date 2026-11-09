---
name: seo-audit
description: Audit and improve the SEO of the Tertiary Exams storefront, targeting certification, practice exam and exam voucher searches in Singapore. Checks meta tags on every public page, validates sitemap.xml, ensures structured data is present where applicable, and proposes per-page improvements. Use when the user asks to "improve SEO", "audit SEO", "check meta tags", "boost search rankings", or runs an SEO review.
---

# SEO audit skill for Tertiary Exams

When invoked, run the following audit sequence and produce an actionable report.

## 1. Inventory the public surface

Enumerate every public route reachable without auth:
- `/` (homepage)
- `/practice-exams` (catalog)
- `/practice-exams/[vendor]` (vendor page)
- `/practice-exams/[vendor]/[slug]` (exam detail)
- `/practice-exams/[vendor]/[slug]/teaser` (free 10-question teaser)
- `/p/[slug]` (Pages — Terms, Privacy, About, etc.)
- `/pricing`, `/faq` (if rendered)

For each route, fetch the rendered HTML at `http://127.0.0.1:3040<path>` and extract:
- `<title>` (length + presence)
- `<meta name="description">` (length 120–180 chars ideal)
- `<meta name="keywords">` (optional, populated by `src/lib/exam-seo.ts`)
- `<meta property="og:title">`, `og:description`, `og:image`
- Presence of structured data (`<script type="application/ld+json">`)
- Number of `<h1>` (should be exactly 1)
- Word count of main content
- Canonical link

## 2. Validate sitemap + robots

- `GET /sitemap.xml` → must return XML with `<urlset>` and contain the homepage + at least one vendor + one exam
- `GET /robots.txt` (if missing, propose creating one that references `/sitemap.xml`)

## 3. DB-side meta coverage

Use the Prisma client (`tsx scripts/<name>.ts`) to compute:
- Number of `Exam` rows with `published=true && deletedAt=null && metaTitle IS NULL` — those need SEO populated via the AI Assist button on the exam edit page or the batch script `scripts/seo-populate.ts` (create if missing).
- Number of `Page` rows with `published=true && metaTitle IS NULL`.

## 4. Per-exam structured data

Each page on sale exposes `Product` JSON-LD (`src/lib/product-jsonld.ts`), `BreadcrumbList` and `FAQPage`. `aggregateRating` comes from real reviews only. An exam nothing sells gets no `Product` markup.

Check that every title holds the exam code or name plus "in Singapore", stays within 66 characters and is never cut mid-word, and that every `h1` holds the exam code. `/exam-vouchers/[vendor]/[slug]` builds its meta on render; practice meta is stored on the pool exam by the deploy seed unless an admin saved it.

## 5. Output format

Produce a single markdown report titled "SEO audit — YYYY-MM-DD" with sections:
- **Summary** — counts of passing / failing pages, biggest 3 issues
- **Per-page issues** — table: path · title-len · description-len · h1-count · OG present · JSON-LD present · notes
- **DB coverage gaps** — exact SQL or Prisma snippets the operator can run
- **Top 5 recommended fixes** — concrete, ordered by impact

Do NOT modify code yourself unless the user has explicitly approved a fix. Always present the report first.

## 6. Useful one-liners

```bash
# Render a page and grep meta tags
curl -s http://127.0.0.1:3040/ | grep -oE '<title>[^<]*</title>|<meta [^>]*(name|property)="(description|keywords|og:[^"]*)"[^>]*>'

# Count exams missing SEO meta
docker compose exec -T postgres psql -U aiexams -d aiexams -c \
  "SELECT COUNT(*) FROM \"Exam\" WHERE published=true AND \"deletedAt\" IS NULL AND \"metaTitle\" IS NULL;"
```
