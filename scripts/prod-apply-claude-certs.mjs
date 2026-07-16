/* Apply the four Anthropic Claude certification seeds on prod, in one login.
 *
 *   node scripts/prod-apply-claude-certs.mjs
 *
 * Idempotent — every endpoint deletes-and-recreates its own `generatedBy`-tagged
 * questions, so re-running is safe.
 *
 * Why this is needed after a deploy: prisma/seed.ts (which Coolify runs on every
 * boot) creates the exam + bundle rows but NEVER the questions — those live in
 * the src/lib/seed/*-questions.ts modules, which only run from a CLI shim or
 * these admin endpoints. Until this script runs, the three new bundles are
 * published with zero questions.
 *
 * cca-foundations is included even though it is not new: it carries the P1
 * exam-code correction CCA-F -> CCAR-F. prisma/seed.ts fixes the P2/P3 codes on
 * its own (via VENDOR_EXAM_CODE_OVERRIDES) but the exam upsert deliberately
 * omits `code` from its `update` clause, so P1 only moves when the module runs.
 */
const BASE = process.env.PROD_BASE || 'https://exams.tertiaryinfotech.com';
const EMAIL = process.env.PROD_ADMIN_EMAIL || 'angch@tertiaryinfotech.com';
const PASSWORD = process.env.PROD_ADMIN_PASSWORD || 'password123';

const ENDPOINTS = [
  'seed-ccar-professional',
  'seed-ccdv-foundations',
  'seed-ccao-foundations',
  'seed-cca-foundations' // last: the CCAR-F recode
];

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

let failed = 0;
for (const ep of ENDPOINTS) {
  const res = await fetch(`${BASE}/api/admin/${ep}`, { method: 'POST', headers: { cookie: ch() } });
  const body = await res.text();
  console.log(`POST /api/admin/${ep} -> HTTP ${res.status}`);
  if (res.status === 404) {
    console.log('  ! 404 — the deploy has not rolled out yet. Wait and re-run.\n');
    failed++;
    continue;
  }
  try {
    const j = JSON.parse(body);
    for (const e of j.exams ?? []) console.log(`  ✓ ${e.slug}: ${e.questionCount} questions (${e.teaserCount} teaser)`);
    if (j.bundle) console.log(`  ✓ bundle: ${j.bundle}`);
    if (!j.ok) { console.log(`  ! ${body.slice(0, 200)}`); failed++; }
  } catch {
    console.log(`  ! non-JSON: ${body.slice(0, 200)}`);
    failed++;
  }
  console.log();
}
console.log(failed === 0 ? '✅ all seeds applied' : `❌ ${failed} endpoint(s) failed`);
process.exit(failed === 0 ? 0 : 1);
