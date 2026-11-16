#!/usr/bin/env node
/* Direct database access to production through /api/v1/db/* (no browser, no DB password).
 *
 * Token: mint one at https://exams.tertiaryinfotech.com/admin-dashboard/api-tokens with scopes
 * `db:read` (and `db:write` to change data), then store it in the login Keychain — never in .env:
 *   security add-generic-password -U -s exam-db-token -a "$USER" -w '<token>'
 *
 *   npm run db:prod -- schema [Table]
 *   npm run db:prod -- query 'SELECT id, email FROM "User" WHERE email = $1' shamil707@gmail.com [--limit 50]
 *   npm run db:prod -- exec  'UPDATE "User" SET name = $1 WHERE id = $2' 'New Name' <id> --dry-run
 *   npm run db:prod -- exec  '…' … [--max 100]          # more rows than --max → nothing changes (409)
 * Positional values after the SQL become $1, $2 … (strings; cast in SQL: $1::int, $1::jsonb).
 * --base http://127.0.0.1:3040 runs against the local dev server. --json prints raw JSON.
 */
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const base = (flag('--base') || 'https://exams.tertiaryinfotech.com').replace(/\/$/, '');
if (!/^(https:\/\/exams\.tertiaryinfotech\.com|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?)$/.test(base)) {
  console.error('--base may only be exams.tertiaryinfotech.com or the local dev server'); process.exit(1);
}
const limit = flag('--limit'), max = flag('--max'), dryRun = bool('--dry-run'), raw = bool('--json');
const [cmd, sql, ...params] = args;

function token() {
  try {
    return execFileSync('/usr/bin/security', ['find-generic-password', '-s', 'exam-db-token', '-a', process.env.USER || '', '-w'], { encoding: 'utf8' }).trim();
  } catch {
    console.error('No token in the Keychain (service exam-db-token). Mint one with scopes "db:read db:write" at /admin-dashboard/api-tokens, then:\n  security add-generic-password -U -s exam-db-token -a "$USER" -w \'<token>\'');
    process.exit(2);
  }
}

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: { Authorization: `Bearer ${token()}`, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) { console.error(`ERROR ${res.status}: ${json.error || JSON.stringify(json)}`); process.exit(3); }
  return json;
}

function table(rows) {
  if (!rows.length) return console.log('(no rows)');
  const cols = Object.keys(rows[0]);
  const cell = (v) => (v === null || v === undefined ? '∅' : typeof v === 'object' ? JSON.stringify(v) : String(v)).replace(/\s+/g, ' ').slice(0, 60);
  const w = cols.map((c) => Math.max(c.length, ...rows.map((r) => cell(r[c]).length)));
  console.log(cols.map((c, i) => c.padEnd(w[i])).join(' │ '));
  console.log(w.map((n) => '─'.repeat(n)).join('─┼─'));
  for (const r of rows) console.log(cols.map((c, i) => cell(r[c]).padEnd(w[i])).join(' │ '));
}

if (cmd === 'schema') {
  const res = await call('GET', '/api/v1/db/schema' + (sql ? `?table=${encodeURIComponent(sql)}` : ''));
  if (raw) console.log(JSON.stringify(res, null, 1));
  else for (const [t, info] of Object.entries(res.tables)) {
    console.log(`${t}${info.writable ? '' : ' (read-only)'}: ${info.columns.map((c) => c.name + (c.writable || !info.writable ? '' : '*')).join(', ')}${info.hidden.length ? `  [hidden: ${info.hidden.join(', ')}]` : ''}`);
  }
} else if (cmd === 'query' && sql) {
  const res = await call('POST', '/api/v1/db/query', { sql, params, ...(limit ? { limit: Number(limit) } : {}) });
  if (raw) console.log(JSON.stringify(res, null, 1));
  else { table(res.rows); console.log(`\n${res.rowCount} row(s)${res.truncated ? ' (truncated — raise --limit, max 1000)' : ''} · ${res.ms} ms`); }
} else if (cmd === 'exec' && sql) {
  const res = await call('POST', '/api/v1/db/execute', { sql, params, dryRun, ...(max ? { maxAffected: Number(max) } : {}) });
  if (raw) console.log(JSON.stringify(res, null, 1));
  else { if (res.rows.length) table(res.rows); console.log(`${res.verb.toUpperCase()}: ${res.affected} row(s) ${res.committed ? 'changed' : 'would change (dry run, rolled back)'} · ${res.ms} ms`); }
} else {
  console.log('usage: npm run db:prod -- schema [Table] | query <sql> [params…] [--limit N] | exec <sql> [params…] [--max N] [--dry-run]  [--json] [--base URL]');
  process.exit(1);
}
