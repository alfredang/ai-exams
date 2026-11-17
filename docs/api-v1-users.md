# /api/v1/users — look up and update a user

Bearer-token API for agents and scripts. Mint a token at `/admin-dashboard/api-tokens`; send it as
`Authorization: Bearer <token>` or `X-API-Key`. Every change is audited as the token's admin with `via: 'api'`
and the before/after values.

| Method & path | Scope | Purpose |
|---|---|---|
| `GET /api/v1/users?email=` or `?id=` | `users:write` | One user: `id`, `email`, `name`, `role`, `active`, `nationality`, `emailVerified`, `passwordSetupRequired`, `anonymizedAt`, `createdAt` |
| `GET /api/v1/users?q=` | `users:write` | Up to 20 users whose email or name contains `q` (2+ characters) |
| `PATCH /api/v1/users` | `users:write` (+ `users:role` for `role`) | Update one user |

A `db:write` token is accepted in place of `users:write` (it can already edit those columns). It is **not**
accepted for a role change.

## PATCH body

```json
{ "email": "learner@example.com", "name": "Jane Tan", "nationality": "Singapore",
  "active": true, "emailVerified": true, "passwordSetupRequired": false,
  "role": "ADMIN", "dryRun": false }
```

- Identify the user with exactly one of `email` or `id`. Send only the fields to change; unknown fields are refused.
- `emailVerified: true` stamps now, `false` clears it. `nationality: null` clears it.
- `role` is one of `USER`, `ADMIN`, `FINANCE`, `SUPPORT`, `CONTENT`, `READ_ONLY`.
- `dryRun: true` returns what would change without writing.
- Response: `{ ok, dryRun, changed: ["name", …], user }`. Nothing to change returns `changed: []`.

## Rules

- **Role changes** are the same power as Admin → Admins, so they need the explicit **`users:role`** scope on a
  token minted by the super admin. `*` and `db:write` never imply it.
- The super admin and the token's own issuer cannot be demoted or suspended through the API.
- Anonymised accounts cannot be edited (409).
- The email address, password and two-factor secret cannot be changed here.
- Suspending a user or changing a role bumps `sessionVersion`.
- Audit actions: `user.update`, `user.promote`, `user.demote`. Limit: 30 PATCH calls a minute per token.

## Example

```bash
curl -X PATCH https://exams.tertiaryinfotech.com/api/v1/users \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"email":"staff@example.com","role":"ADMIN"}'
```
