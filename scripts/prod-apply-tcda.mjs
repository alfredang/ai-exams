/* Publish the Tableau Certified Data Analyst bundle on prod, then report.
 *   1. auth (csrf + password callback)
 *   2. POST /api/admin/publish-tableau-tcda   (idempotent, guarded)
 * Run AFTER the seed change has deployed. Run: node scripts/prod-apply-tcda.mjs
 */
const BASE = process.env.PROD_BASE || 'https://exams.tertiaryinfotech.com';
const EMAIL = process.env.PROD_ADMIN_EMAIL || 'angch@tertiaryinfotech.com';
const PASSWORD = process.env.PROD_ADMIN_PASSWORD;
if (!PASSWORD) throw new Error('PROD_ADMIN_PASSWORD is required');

const jar = new Map();
function setCookies(res) {
  for (const sc of res.headers.getSetCookie?.() ?? []) {
    const [kv] = sc.split(';'); const i = kv.indexOf('=');
    if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim());
  }
}
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');

async function main() {
  let r = await fetch(`${BASE}/api/auth/csrf`, { headers: { cookie: cookieHeader() } });
  setCookies(r); const { csrfToken } = await r.json();
  const form = new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, callbackUrl: `${BASE}/admin-dashboard` });
  r = await fetch(`${BASE}/api/auth/callback/password`, { method: 'POST', redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookieHeader() }, body: form });
  setCookies(r);
  r = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: cookieHeader() } });
  setCookies(r); const session = await r.json();
  if (!session?.user) throw new Error('login failed (no session)');
  console.log(`# logged in as ${session.user.email} (role=${session.user.role})\n`);

  const path = '/api/admin/publish-tableau-tcda';
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers: { cookie: cookieHeader() } });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text.slice(0, 400); }
  console.log(`POST ${path}  -> HTTP ${res.status}`);
  console.log(JSON.stringify(body, null, 2));
}
main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
