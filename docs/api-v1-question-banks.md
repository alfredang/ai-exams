# /api/v1 — question banks (agents)

Bearer-token API for the Digital Workforce exam agents — `exam-question-scout` (daily 07:00: one YouTube course →
10–20 new questions) and `exam-question-auditor` (daily: flags questions that may be wrong or outdated). Same
authentication as [api-v1-practice-exam-assignments.md](api-v1-practice-exam-assignments.md): mint a token at
`/admin-dashboard/api-tokens` with scope **`questions:write`**; mutations are audited as the token's admin with
`via: 'api'`. The agents call it only through `~/DigitalWorkforce/bin/exam-qbank.py`, which reads the token from the
macOS Keychain (`security add-generic-password -U -s exam-qbank-token -a "$USER" -w '<token>'`).

`{ref}` = product slug, exam code or exam id (resolved by `resolvePracticeExam()`; only banks a Practice Exam sells).

| Method & path | Purpose |
|---|---|
| `GET /api/v1/question-banks` | Every bank: `examId`, `slug`, `code`, `certification`, `onSale`, `published`, `domains[{name,weight,published}]`, `openAuditFlags`, `lastScoutAddAt` |
| `GET /api/v1/question-banks/{ref}/questions?view=stems` | Every non-archived stem + domain (to avoid repeats) |
| `GET /api/v1/question-banks/{ref}/questions?view=full&limit=&cursor=&domain=` | Published questions with options, key, explanation, audit state; `nextCursor` |
| `POST /api/v1/question-banks/{ref}/sources` `{ kind: 'YOUTUBE'\|'URL', url }` | The server reads the transcript / page (Firecrawl, youtube.com captions, Tavily or OpenAI web search — never a raw fetch of the URL) and stores an `ExamSource`. Returns `{ id, label, chars, via, text (≤200k chars), truncated }`; 422 with a reason when unreadable |
| `POST /api/v1/question-banks/{ref}/questions` | `{ author, model?, sourceId?, questions[≤25] }` → published straight into the pool with `generatedBy: agent:<author>:<model>`. Per-question validation = the AI generator's `validate()`; `domain` must match the blueprint; exact repeat stems refused. Returns `{ created[{index,id}], rejected[{index,reason}] }` |
| `GET /api/v1/questions/audit-queue?limit=40&examId=` | Next published questions to audit: never-audited from the last 7 days (newest first), then the never-audited pool, then the longest-ago audited. Each has `adminUrl` |
| `POST /api/v1/questions/audit` | `{ auditor?, model?, results[≤100]: { id, verdict: ok\|wrong\|outdated\|ambiguous, note, suggestedAnswer?, sources[] } }` — sets `auditedAt`, `auditFlag` (null for ok) and `audit`. Never changes the question |

Question shape (same as the admin generator): `{ domain, type: SINGLE|MULTI|TRUE_FALSE|ORDERING, stem, options[{id,text}],
correct[ids], explanation, difficulty 1-5, references[{label,url}] }`. ORDERING: step ids `'1'…'N'` listed shuffled,
`correct` = every id in order.

Flags show on the Question Bank page (red highlight, auditor note, **Clear flag**; editing the question clears it),
the **Audit flags** filter, the AI Question and Answer Generator page and the admin dashboard's "Flagged questions" card.
