---
name: custom-practice-exam
description: Generate a full practice exam (e.g. 60 questions) for an ExamNova exam by first scraping the vendor's latest official exam objectives via Firecrawl, then prompting Claude to author questions whose domain distribution matches the published blueprint percentages. Use when the user asks to "generate a full exam", "auto-fill the exam bank", "create N questions for AZ-900 blueprint", or invokes the "AI Assist (Blueprint)" mode in the admin.
---

# Custom practice exam skill

Generates a faithful, blueprint-aligned practice exam for a given ExamNova `Exam` row. The workflow:

## 1. Resolve the exam + domain blueprint

Read the `Exam` row (by `id` or `slug`). Inspect `exam.domains` — it's a JSON array of `{ name, weight }` where weights sum to ~100.

If `exam.domains` is empty or stale, prefer scraping fresh data from `exam.infoUrl` (set via the admin "Look up via Claude" button). If `infoUrl` is missing, ask the admin to populate it first — do NOT invent domains.

## 2. Scrape the vendor's latest exam guide

Use the Firecrawl API (key in Settings → Credentials → `FIRECRAWL_API_KEY`):

```ts
import { extractFromUrls } from '@/lib/sources/extract';
const { text, meta } = await extractFromUrls([exam.infoUrl]);
```

If the vendor publishes a PDF guide rather than HTML, ask the admin to upload it via the PDF authoring mode instead — Firecrawl handles HTML but PDFs go through `extractFromPdf`.

## 3. Compute per-domain question quotas

Given a target `totalCount` (e.g. 60):

```ts
const quotas = exam.domains.map((d) => ({
  name: d.name,
  count: Math.round((d.weight / 100) * totalCount)
}));
// Reconcile rounding so the sum equals totalCount exactly:
const drift = totalCount - quotas.reduce((s, q) => s + q.count, 0);
if (drift !== 0) quotas[0].count += drift;
```

## 4. Generate per domain via `streamGenerateQuestions`

For each `quota`, call the existing generator with `sourceExcerpt = scraped text` and `domain = quota.name`:

```ts
import { streamGenerateQuestions } from '@/lib/claude';
for (const q of quotas) {
  for await (const ev of streamGenerateQuestions({
    vendor: exam.vendor.name,
    certification: exam.title,
    examCode: exam.code,
    domain: q.name,
    domainWeights: exam.domains,
    count: q.count,
    difficulty: 3,
    type: 'SINGLE',
    sourceExcerpt: text,
    sourceLabel: meta.urls?.map((u) => u.url).join(', ') ?? exam.infoUrl
  })) {
    if (ev.type === 'question') {
      // Persist as PUBLISHED (auto-publish) with examId + domain set, then SSE-emit.
    }
  }
}
```

Persist as `PUBLISHED` with `generatedBy = 'claude:blueprint'` (questions auto-publish into the pool). Admins remove or unpublish bad ones from the exam page's question browser.

## 5. Question type mix

Default to all `SINGLE`. If the admin overrides with a mix (e.g. 70% SINGLE / 30% MULTI), split each domain's quota proportionally with rounding reconciled the same way.

## 6. Surface in the admin

**Current runtime:** the admin mode is **"AI Assist — bulk generate"** in the exam page's Question pool (`/admin-dashboard/exams/[id]#questions`). It calls `POST /api/admin/exams/[id]/ai-generate` with `{ count, domains, type }`, which uses OpenAI (`OPENAI_MODEL`, default `gpt-6.1-sol`) — see `src/lib/ai-question-gen.ts`. The old `/author` blueprint page and `/api/admin/generate-blueprint` were removed; the Claude-based steps above describe the earlier design.

## 7. Failure modes to surface

- `exam.infoUrl missing` → tell admin to set it (banner: "Look up via Claude" button).
- `Firecrawl 4xx/5xx` → relay the API error; ask to retry.
- `Claude returned fewer questions than the quota for domain X` → continue; persist what came back and log a warning. Don't backfill from another domain.
- `Domain blueprint sums to 0` → refuse; ask admin to populate `exam.domains`.

## 8. Cost + time

A 60-question generation typically costs ~3-6 Claude calls (chunks vary by source size) and takes 60-120 seconds end to end. The SSE stream emits one event per question so admins see progress live.
