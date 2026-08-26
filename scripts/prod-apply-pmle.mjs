/* Apply the PMLE P1–P3 grounded top-up on prod. Login + POST + report.
 * Idempotent + non-destructive. Run: node scripts/prod-apply-pmle.mjs */
const BASE = process.env.PROD_BASE || 'https://exams.tertiaryinfotech.com';
const EMAIL = process.env.PROD_ADMIN_EMAIL || 'angch@tertiaryinfotech.com';
const PASSWORD = process.env.PROD_ADMIN_PASSWORD;
if (!PASSWORD) throw new Error('PROD_ADMIN_PASSWORD is required');
const jar = new Map();
const sc = (r) => { for (const s of r.headers.getSetCookie?.() ?? []) { const [kv] = s.split(';'); const i = kv.indexOf('='); if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim()); } };
const ch = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
let r = await fetch(`${BASE}/api/auth/csrf`, { headers: { cookie: ch() } }); sc(r); const { csrfToken } = await r.json();
r = await fetch(`${BASE}/api/auth/callback/password`, { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: ch() }, body: new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, callbackUrl: `${BASE}/admin-dashboard` }) }); sc(r);
r = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: ch() } }); sc(r); const s = await r.json();
if (!s?.user) throw new Error('login failed');
console.log(`# logged in as ${s.user.email} (${s.user.role})`);
const res = await fetch(`${BASE}/api/admin/fix-pmle-topup`, { method: 'POST', headers: { cookie: ch() } });
console.log(`POST /api/admin/fix-pmle-topup -> HTTP ${res.status}`);
console.log(JSON.stringify(await res.json(), null, 2));
