# Practice Exam Assignment API (v1)

Assign Tertiary Exams practice exams to existing user accounts. An assigned
exam shows up on the user's dashboard (`/user-dashboard`) at once, with Exam
mode and Practice mode and unlimited retakes. It is the same as an admin
pressing **Grant** on the user's Entitlements tab.

**Base URL:** `https://exams.tertiaryinfotech.com/api/v1`

## Authentication

Every request needs an API token, sent in either header:

```
Authorization: Bearer examnova_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
X-API-Key: examnova_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Create a token at **Admin → API Tokens** (`/admin-dashboard/api-tokens`):

- **Name**: something that identifies the caller, e.g. `AI agent – exam assignments`.
- **Scopes**: `assign:practice-exams`. A token with no scopes or other scopes is rejected with 403.
- The token is shown once, so copy it then. Revoke it on the same page.

The token acts for the admin who created it. It stops working if that
account is no longer an active ADMIN. Each grant or removal is written to the
admin audit log and to the user's Activity tab, with the token name.

Note: 20 failed authentications from one IP within 15 minutes block that IP for the rest of the window.

## Identifying an exam

Wherever a request takes `exam`, any of these work:

| Form | Example |
|---|---|
| Exam code, case-insensitive | `CCAO-F`, `ai-900` |
| Product slug | `anthropic-ccao-foundations` |
| Exam id | `cmvdslzzm0001yvlo7uz2ckhq` |

If a code matches more than one vendor's exam, the API returns `409` with
`candidates`. Retry with the `slug` of the right one.

## Endpoints

### `GET /practice-exams?q=<text>`

List the practice exams that can be assigned. `q` is optional and matches the code, slug, title or vendor.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://exams.tertiaryinfotech.com/api/v1/practice-exams?q=ccao"
```

```json
{
  "practiceExams": [
    {
      "examId": "cmvdslzzm0001yvlo7uz2ckhq",
      "slug": "anthropic-ccao-foundations",
      "code": "CCAO-F",
      "title": "Claude Certified Associate — Foundations (CCAO-F)",
      "vendor": "Anthropic",
      "onSale": true
    }
  ]
}
```

`onSale: false` means the exam is hidden from the storefront. It can still be assigned.

### `POST /assignments`

Assign a practice exam to a user. Calling it twice is safe.

```bash
curl -X POST https://exams.tertiaryinfotech.com/api/v1/assignments \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"learner@example.com","exam":"CCAO-F"}'
```

| Field | Type | Notes |
|---|---|---|
| `email` | string | Email of an existing account (case-insensitive). |
| `exam` | string | Code, slug or exam id (see above). |

**201 Created** for a new assignment. **200 OK** if the user already had this assignment.

```json
{
  "ok": true,
  "created": true,
  "alreadyHadAccess": false,
  "user": { "id": "…", "email": "learner@example.com", "name": "Jane Tan", "active": true },
  "practiceExam": { "examId": "…", "slug": "anthropic-ccao-foundations", "code": "CCAO-F", "title": "…", "vendor": "Anthropic", "onSale": true }
}
```

`alreadyHadAccess: true` means the user could already open the exam before
this call, through a purchase or an earlier assignment.

### `GET /assignments?email=<email>`

List every practice exam the user can open, and how they got it.

```json
{
  "user": { "id": "…", "email": "learner@example.com", "name": "Jane Tan", "active": true },
  "assignments": [
    {
      "practiceExam": { "examId": "…", "slug": "anthropic-ccao-foundations", "code": "CCAO-F", "title": "…", "vendor": "Anthropic", "onSale": true },
      "tiers": ["ADMIN_GRANT"],
      "grantedAt": "2026-10-24T04:48:48.433Z"
    }
  ]
}
```

`tiers` values:

- `ADMIN_GRANT`: assigned by an admin or this API.
- `PRACTICE`: the user bought the Practice Exam.
- `VOUCHER`: the user bought the Exam Voucher, which includes the practice exam.
- `BUNDLE`: legacy purchase.

### `DELETE /assignments`

Remove an assignment. The body is the same as for `POST`. Only `ADMIN_GRANT` access is removed; purchases are never touched.

```json
{ "ok": true, "removed": 1, "stillHasAccess": false, "user": { … }, "practiceExam": { … } }
```

`stillHasAccess: true` means the user keeps the exam because they paid for it.

### `POST /registrations` (LMS/TMS class registration)

Register a class's learner for a practice exam. Unlike `POST /assignments`, this
**creates the account** when the email is new (with the name, no password; the
learner signs in with Google or an email code and gets the Welcome email).
The grant records the course run ID, the register date and a remark.

```bash
curl -X POST https://exams.tertiaryinfotech.com/api/v1/registrations \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Tan Mei Ling","email":"mei@example.com","exam":"CCAR-F","courseRunId":"1387021"}'
```

| Field | Type | Notes |
|---|---|---|
| `name` | string | Learner's full name. Fills a missing or placeholder name; never overwrites a real one. |
| `email` | string | Learner's email (case-insensitive). |
| `exam` | string | Code, slug or exam id. |
| `courseRunId` | string, optional | The SSG course run ID. |
| `remark` | string, optional | Defaults to `Registered from TMS`. |
| `sendWelcomeEmail` | boolean, optional | Default `true`; only sent when the account is new. |

**201** for a new grant, **200** otherwise. Calling again for the same course run
changes nothing; a different `courseRunId` updates the record and its register date.

```json
{ "ok": true, "accountCreated": true, "created": true, "alreadyHadAccess": false, "welcomeEmailSent": true,
  "user": { … }, "practiceExam": { … },
  "registration": { "courseRunId": "1387021", "registeredAt": "2026-11-14T09:39:54.664Z", "remark": "Registered from TMS" } }
```

### `GET /registrations?courseRunId=<id>[&exam=<ref>]`

Every learner registered for that course run: `email`, `name`, `signedIn`
(email verified), `courseRunId`, `registeredAt`, `remark`.

## Errors

Every error returns JSON in the form `{ "error": "message" }`.

| Status | Meaning |
|---|---|
| 400 | Body is not JSON `{ email, exam }`, or the email is malformed |
| 401 | Token missing, wrong, revoked or expired |
| 403 | Token lacks `assign:practice-exams`, or its admin is no longer an active ADMIN |
| 404 | No user with that email, or no practice exam matches `exam` |
| 409 | User account is disabled, or `exam` matches several exams (`candidates` lists them) |
| 429 | Too many failed authentications from this IP; wait up to 15 minutes |

## Notes for agents

- `/assignments` needs an existing account and does not create one; use `/registrations` to create it. If you get a 404 for the user, ask an admin to create the account at `/admin-dashboard/users` first.
- Users without a real full name on their profile are asked for one the first time they start a full exam. Nothing more is needed from the agent.
- A typical flow is: `GET /practice-exams?q=<code>` to confirm the exam, then `POST /assignments`, then `GET /assignments?email=` to verify.
