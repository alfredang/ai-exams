---
paths:
  - "src/components/exam-runner.tsx"
  - "src/components/explanation-view.tsx"
  - "src/app/exam/**"
  - "src/app/results/**"
  - "src/app/api/attempts/**"
  - "src/app/api/results/**"
  - "src/lib/attempts.ts"
  - "src/lib/start-attempt.ts"
  - "src/lib/question-pool.ts"
  - "src/lib/shuffle.ts"
  - "src/lib/attempt-history.ts"
  - "src/lib/pdf/attempt-report.ts"
---

# Exam runtime

- **Every attempt is drawn by `drawAttemptQuestions()`** — domain-weighted,
  largest remainder over `Exam.domains`. Practice, Exam mode, teaser and
  Retake all use it; never a plain shuffle. Signed-in starts go through
  `createAttempt()` / `resumeOrCreateAttempt()`.
- **Access** = `hasPracticeAccess()` on the pool exam or any retired variant;
  map variant ids with `resolvePoolExam()`.
- **Server is authoritative**: score with `scoreAttempt()` on submit; time
  from `Attempt.expiresAt`; never trust client correctness or timers.
- `Attempt.responses` is the only answer store:
  `Record<questionId, { answer: string[]; flagged?; timeSpent? }>`.
  There is no AttemptAnswer table.
- **Sequencing** renders through `sequencingSteps(options, correct, questionId)`
  everywhere (runner, results, PDF) — never the per-attempt shuffle.
- **Teaser is exactly 10 questions** (`getTeaserSize()`), anonymous via the
  `gt` cookie; the OTP verify route moves it to the new user. Don't make it
  configurable or break that hand-over.
- **Exam mode behaves like the live test**: no answer sheet, Review Screen
  only after reaching the end, submit disabled until all answered, domain
  hidden until results, auto-submit at 0. Practice mode reveals answers.
  Keep the runner labels listed in CLAUDE.md.
- The runner is a `.light-scope` full-viewport shell — use fixed light
  classes inside it, not the shared `.btn-*`. No `alert()` / `confirm()`.
- `Question.references` may be null, URL strings or `{url,label}` — normalise
  through `ExplanationView`; a bad reference must never break a result page.
- Full attempts require a real full name (`requireFullNameToStart()`);
  teasers, staff and impersonated sessions are exempt.
