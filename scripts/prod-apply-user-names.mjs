/* Correct two users' display names on prod. Idempotent + defensive.
 *
 *   node scripts/prod-apply-user-names.mjs
 *
 * Calls POST /api/admin/fix-user-names, which only renames an account whose
 * current name is the exact expected old value (else it reports the mismatch
 * and writes nothing). Run AFTER the endpoint has deployed — a 404 means it
 * has not rolled out yet.
 */
const BASE = process.env.PROD_BASE || 'https://exams.tertiaryinfotech.com';
const EMAIL = process.env.PROD_ADMIN_EMAIL || 'angch@tertiaryinfotech.com';
const PASSWORD = process.env.PROD_ADMIN_PASSWORD;
if (!PASSWORD) throw new Error('PROD_ADMIN_PASSWORD is required');

const jar = new Map();
const sc = (r) => {
  for (const s of r.headers.getSetCookie?.() ?? []) {
    const [kv] = s.split(';');
    const i = kv.indexOf('=');
    if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim());
  }
};
const ch = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');

let r = await fetch(`${BASE}/api/auth/csrf`, { headers: { cookie: ch() } });
sc(r);
const { csrfToken } = await r.json();

r = await fetch(`${BASE}/api/auth/callback/password`, {
  method: 'POST',
  redirect: 'manual',
  headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: ch() },
  body: new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, callbackUrl: `${BASE}/admin-dashboard` })
});
sc(r);

r = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: ch() } });
sc(r);
const s = await r.json();
if (!s?.user) throw new Error('login failed');
console.log(`# logged in as ${s.user.email} (${s.user.role})\n`);

const res = await fetch(`${BASE}/api/admin/fix-user-names`, { method: 'POST', headers: { cookie: ch() } });
console.log(`POST /api/admin/fix-user-names -> HTTP ${res.status}`);
if (res.status === 404) {
  console.log('! 404 — the endpoint has not deployed yet. Wait and re-run.');
  process.exit(1);
}
const j = await res.json();
for (const x of j.results ?? []) {
  const arrow = x.from !== undefined ? `  "${x.from}" -> "${x.to}"` : '';
  console.log(`  ${x.action.padEnd(16)} ${x.email}${arrow}`);
}
console.log(j.ok ? '\n✅ applied' : '\n⚠ some rows were skipped — review above');
process.exit(j.ok ? 0 : 1);
