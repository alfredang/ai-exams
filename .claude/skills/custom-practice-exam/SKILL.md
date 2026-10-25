---
name: custom-practice-exam
description: Build or extend the Practice Exam for one certification on Tertiary Exams — resolve the product and its pool exam (Question Bank), set the official domain weights, and fill the question pool with domain-weighted MCQ, Multiple select and Sequencing questions that carry suggested answers and references. Use when the user asks to "create a practice exam for X", "generate a full exam", "fill the question bank", "create N questions for the AZ-900 blueprint", "add a new certification", or "top up a domain".
---

# Custom practice exam (Tertiary Exams)

How a Practice Exam works on this site today, and the two ways to fill one.
`CLAUDE.md` is the source of truth — re-read its Exam runtime, Data model
invariants and Seeding sections if anything here disagrees.

## The model you are filling

- **One Practice Exam per certification.** A `Bundle` row is the product
  (`slug`, title, fixed US$20 `price`, optional Exam Voucher). Its PRACTICE
  `BundleItem` points at the **pool exam** — the `Exam` row admins call the
  **Question Bank**. Old `-p2/-p3` variants are retired (`poolExamId` set) and
  folded into it on every deploy; never add questions to a retired variant.
- **Every attempt is drawn, not fixed.** `drawAttemptQuestions()`
  (`src/lib/question-pool.ts`) apportions `Exam.questionCount` seats across
  `Exam.domains` weights (largest remainder). So the pool must be deep in
  every domain — aim for ≥ 2× the per-attempt seats per domain — and every
  question's `domain` must equal a blueprint domain name exactly.
- **Teaser**: 10 questions drawn from the same pool (pinned in code). Exam
  mode is timed from `Exam.durationMinutes`; Practice mode shows the
  explanation ("Suggested answer") immediately; results show the "Why" box,
  the domain and the references.
- Customer-facing words: **Practice Exam**, **Exam Voucher**, **Vendor**,
  **Certification**. Never "bundle", "tier", "dump" or "real exam questions".

## 1. Resolve the certification

Find the product by slug (`aws-saa-c03`), code or title → its PRACTICE item →
the pool exam (`resolvePoolExam()` maps a variant id to it). A brand-new
certification is created in admin at **Create Practice Exam**
(`/admin-dashboard/exams/new`, which makes the Question Bank and a draft
product), or by a seed module listed in `prisma/seed.ts` `BUNDLES`
(see CLAUDE.md "Seeding a new exam bundle to production").

## 2. Domain blueprint

Official weights live in `src/lib/exam-blueprints.ts`, keyed by product slug:
`domains [{name, weight}]`, `sourceUrl`, `verifiedAt`, display-only `topics`
per domain, and `examPageUrl` / `studyGuideUrl` for the product page's
References. Add or update the entry from the vendor's current exam guide
(read it with WebFetch/Firecrawl) and bump `verifiedAt`; the deploy-time fold
applies it unless an admin edited weights later at
`/admin-dashboard/exams/[id]#pool`. Use `aliases` for legacy domain labels.
Never invent domains — if the vendor publishes none, ask.

## 3. Fill the pool — pick one path

| | A. Generate questions & answers with AI (in app) | B. `question-bank-generator` agent |
|---|---|---|
| Where | Exam page → top card **Generate questions & answers with AI** → Review queue | Claude Code, `.claude/agents/question-bank-generator.md` (Opus) |
| Model | OpenAI (`OPENAI_MODEL`, admin → Settings → Credentials) | Claude Opus writes the questions |
| Types | MCQ, Multiple select, True/False | MCQ, Multiple select, **Sequencing** |
| References | model-supplied, validated as URLs | curated official docs, each URL checked |
| Persistence | saved PUBLISHED as they stream | idempotent seed module + admin seed endpoint |
| Use for | quick top-ups by an admin | new certifications, Sequencing, high-quality pools |

Path A: `POST /api/admin/exams/[id]/ai-generate` with
`{ count ≤ 200, domains: [] /* all */, type: 'MIXED' | 'SINGLE' | 'MULTI' | 'TRUE_FALSE' }`
splits `count` by weight (`planDomainCounts()`), validates each question and
streams SSE `plan` / `question` / `warn` / `done`. Admin session only.

Path B: run the agent; it plans the split, writes, validates with
`validateQuestion()` (`src/lib/question-input.ts`) and persists via
`src/lib/seed/<slug>-bank-questions.ts`. Manual one-offs go through **Add
manually** on the exam page.

## 4. Question rules (both paths)

- Shapes: `options` `[{id, text}]`, `correct` = option ids, `references`
  `[{label, url}]` (http/https only). No AnswerOption table.
- MCQ: 4 options, one correct. Multiple select: 5 options, 2 correct, stem
  says "(Select TWO.)". Sequencing (`ORDERING`): 4–6 steps written out of
  order with ids `'1'…'N'`, `correct` = right order; the runner, results and
  PDF all render via `sequencingSteps()`.
- Default mix 70% MCQ / 20% Multiple select / 10% Sequencing, with
  Sequencing only for real procedures.
- Explanation opens with the suggested answer ("Correct: B.", "Correct
  sequence: 3 → 1 → 4 → 2."), then why, then why the distractors are wrong.
- Original, scenario-based, blueprint-aligned. Never claim real-exam content.
- Seeded (path B) questions save PUBLISHED. In-app AI (path A) questions save
  DRAFT and need Approve in the exam page's Review queue. Admins unpublish or edit bad ones
  at `/admin-dashboard/exams/[id]/questions/[qid]`; option ids never change
  on edit so past answers stay valid.

## 5. Check the result

- `/admin-dashboard/exams/[id]#pool`: per-domain pool vs per-attempt draw —
  no domain short of its seats.
- Product page `/practice-exams/[vendor]/[slug]`: card label
  "{pool}-question pool · {n} per attempt" (`poolCardLabel()`), domain
  accordion from blueprint `topics`.
- Take the free teaser and one Practice-mode attempt; open the results page
  and the results PDF to see explanations, domains and references render.

## Failure modes

- No blueprint and the vendor page has no domain list → stop and ask.
- A domain's pool is smaller than its per-attempt seats → the draw
  re-apportions, but top that domain up next.
- Seed endpoint answers 200 with old code → the deploy is not live yet
  (`npm run seed:prod -- <slug> <expected-exam-slug>` exits 4).
