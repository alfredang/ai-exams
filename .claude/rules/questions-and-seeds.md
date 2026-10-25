---
paths:
  - "src/lib/seed/**"
  - "prisma/seed.ts"
  - "prisma/seeds/**"
  - "src/app/api/admin/seed-*/**"
  - "src/lib/exam-blueprints.ts"
  - "src/lib/pool-consolidation.ts"
  - "src/lib/question-input.ts"
  - "src/lib/ai-question-gen.ts"
  - "src/app/admin-dashboard/exams/**"
---

# Questions, blueprints and seeds

- **JSON shapes are fixed**: `options` `[{id, text}]`, `correct` = option-id
  array, `references` `[{label, url}]`. No AnswerOption table.
- **Types**: `SINGLE` (MCQ, 1 correct), `MULTI` (≥ 2 correct, at least one
  wrong; stem says "Select TWO"), `TRUE_FALSE`, `ORDERING` (sequencing: steps
  authored out of order with ids `'1'…'N'`, `correct` = right sequence).
  `HOTSPOT` is not supported. Validate with `validateQuestion()`.
- **`domain` must equal a blueprint domain name exactly**; use `aliases` in
  `exam-blueprints.ts` for legacy tags. Official weights live there, keyed by
  product slug, with `sourceUrl` + `verifiedAt` — bump `verifiedAt` when
  re-checked. Never invent domains.
- **Human-authored questions auto-publish** (`PUBLISHED`): Add manually, CSV
  import, seeds. **AI-generated ones are `DRAFT`** and join the pool only when
  an admin approves them in the exam page's Review queue (`#review`).
- **Explanations** lead with the suggested answer, explain why, and cite
  official docs. Never claim real-exam content or reproduce vendor samples.
- **Seed modules are idempotent**: delete-and-recreate only rows tagged with
  their own `generatedBy`. New certs author ONE exam (`${slug}-p1`); the
  deploy-time fold (`consolidateExamPools()`) does the rest.
- `published`, `questionCount` and `code` are create-only in the exam upsert
  — get them right on first deploy. Add `VENDOR_EXAM_CODE_OVERRIDES` when the
  code isn't slug-derived. List new products in `BUNDLES` or they are taken
  off sale on deploy.
- Never publish or add a retired variant (`poolExamId` set) to a product.
- Admin AI generation is **OpenAI** (`src/lib/openai.ts`); Claude-authored
  banks go through the `question-bank-generator` agent and a seed module.
- Seeding production: `npm run seed:prod -- <name> <expected-slug>` after the
  deploy is confirmed live; stop after one failed login.
