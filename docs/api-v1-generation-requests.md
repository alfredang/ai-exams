# /api/v1 — generation requests (agent queue for the AI Q&A Generator)

When no OpenAI API key is saved, **AI Generate** does not run in the web server. The admin's request (exam, source,
extract or generate, count, types, domains) is stored as a `GenerationRequest` and a worker on the agent computer runs
it with two models on that computer's own sign-ins:

| Role | Model | How it runs |
|---|---|---|
| Writer | `gpt-6.1-sol` | Codex CLI, "Sign in with ChatGPT" (`codex login`) |
| Checker | Claude Opus 5.5 | Claude CLI, Claude subscription — answers each question itself |

The worker only runs models. The site builds every prompt, validates every reply and decides what is published
([src/lib/generation-requests.ts](../src/lib/generation-requests.ts)). **Only a question the checker agrees with is
published**; a disagreement drops the question, it never changes the key.

Authentication is the same as [api-v1-question-banks.md](api-v1-question-banks.md): scope **`questions:write`**, token in
the macOS Keychain (`exam-qbank-token`). Worker: `~/DigitalWorkforce/bin/exam-generation-worker.py`, started every
5 minutes by the LaunchAgent `com.alfred.workforce.exam-generation`.

| Method & path | Purpose |
|---|---|
| `GET /api/v1/generation-requests` | Requests a worker may claim: `QUEUED`, or `RUNNING` with no update for 20 minutes. Oldest first. `?all=1` = latest 50 in any state |
| `POST …/{id}/claim` `{ worker }` | Take the request (409 if it is not waiting). Returns `writer { instructions, schema }`, `checker { instructions, schema }` and `jobs[{ index, count, input }]` — one writer prompt per job |
| `POST …/{id}/screen` `{ jobIndex, output }` | The writer's raw reply. Returns `candidates[]` that passed validation, `rejected[]`, `remaining`, and `check { input }` (the checker's prompt) or `null` when nothing survived |
| `POST …/{id}/publish` `{ candidates, checkOutput, writer, checker }` | The candidates from `/screen`, unchanged and in order, with the checker's raw reply. Returns `{ created, dropped, reasons[], total, remaining }` |
| `POST …/{id}/progress` | `{ phase }` or `{ note }` while working (also keeps the claim alive); `{ status: 'DONE' \| 'FAILED', error? }` to finish; `{ status: 'QUEUED', note }` to hand it back (e.g. the Codex sign-in expired) |

Any call on a request that is no longer `RUNNING` (cancelled by an admin, finished) answers **409**: stop working on it.

A request has `autoPublish` (default true). When the admin chose **Review first** it is false, and the questions are saved as `DRAFT` ("Awaiting review") instead of `PUBLISHED`: an admin publishes them on the Question Bank page.

Published questions carry `generatedBy: agent:generator:<writer>` (e.g. `agent:generator:codex:gpt-6.1-sol`),
`aiCheckedAt` and `aiCheck { verdict: 'ok', model: <checker> }`, so the pool-wide answer-key check skips them.
A finished request writes AdminLog `question.agent_generate`; queuing writes `question.generation_request`,
cancelling `question.generation_cancel`.

Sources are read by the site when the admin submits the form (`POST /api/admin/exams/[id]/sources`: Firecrawl for web
and GitHub links, YouTube captions, PDF text), so the worker never fetches a URL. Extracts from a GitHub link are always
rephrased, and the writer is told to return nothing for a source that presents itself as real exam questions.

## Running the worker by hand

```bash
~/DigitalWorkforce/bin/exam-generation-worker.py --list            # what is waiting
~/DigitalWorkforce/bin/exam-generation-worker.py                   # run everything waiting
~/DigitalWorkforce/bin/exam-generation-worker.py --writer claude   # fallback: Claude also writes
~/DigitalWorkforce/bin/exam-generation-worker.py --base http://127.0.0.1:3040   # against a local site
```

Exit 5 = the Codex sign-in expired: run `codex logout`, then `codex login`. The request goes back to the queue with a
note and runs on the next pass.
