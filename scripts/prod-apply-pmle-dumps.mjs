/* Remove the dump-sourced PMLE questions on prod. Idempotent.
 *
 *   node scripts/prod-apply-pmle-dumps.mjs
 *
 * Deploying the code is NOT enough: prisma/seed.ts (which Coolify runs on boot)
 * only rebuilds the bundle's item list, dropping P4-P6. The questions themselves
 * are only deleted by POSTing this admin endpoint — production has no shell.
 *
 * Expect prod's count to differ from local's 158: local is not a proxy for prod
 * content. The endpoint self-sizes by content signature, so it removes whatever
 * is actually there.
 */
const BASE = process.env.PROD_BASE || 'https://exams.tertiaryinfotech.com';
const EMAIL = process.env.PROD_ADMIN_EMAIL || 'angch@tertiaryinfotech.com';
const PASSWORD = process.env.PROD_ADMIN_PASSWORD || 'password123';

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

const res = await fetch(`${BASE}/api/admin/fix-pmle-dumps`, { method: 'POST', headers: { cookie: ch() } });
console.log(`POST /api/admin/fix-pmle-dumps -> HTTP ${res.status}`);
if (res.status === 404) {
  console.log('! 404 — the deploy has not rolled out yet. Wait and re-run.');
  process.exit(1);
}
const j = await res.json();
console.log(`\n✓ scanned ${j.scanned}, removed ${j.removed} dump question(s)`);
for (const [slug, n] of Object.entries(j.removedByExam ?? {})) console.log(`   - ${slug}: ${n}`);
if (j.restoredVariants?.length) {
  console.log(`✓ RESTORED to published: ${j.restoredVariants.join(', ')}`);
}
if (j.retiredVariants?.length) {
  console.log(`✓ retired: ${j.retiredVariants.join(', ')}  (${j.bundleItemsRemoved} bundle item(s) removed)`);
}
for (const [slug, a] of Object.entries(j.questionCountAdjusted ?? {})) {
  console.log(`✓ ${slug}: questionCount ${a.from} → ${a.to}`);
}
console.log('\nFinal state on prod:');
for (const [slug, st] of Object.entries(j.perExam ?? {})) {
  console.log(`   ${slug.padEnd(38)} ${String(st.total).padStart(3)} published · ${st.teasers} teaser · attempt=${st.questionCount} · ${st.published ? 'ACTIVE' : 'inactive'}`);
}
console.log(j.ok ? '\n✅ applied' : '\n❌ failed');
process.exit(j.ok ? 0 : 1);
