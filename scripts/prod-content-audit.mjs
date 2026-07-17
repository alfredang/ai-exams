/* READ-ONLY content audit of PROD. Changes nothing.
 *
 *   node scripts/prod-content-audit.mjs google
 *   node scripts/prod-content-audit.mjs --slugPrefix google-professional-ml-engineer
 *
 * Drives GET /api/admin/content-audit. Use this BEFORE sizing any content fix:
 * local is not a proxy for prod content (2026-07-17 — local PMLE had 158 dump
 * questions, prod had zero and entirely different content).
 */
const BASE = process.env.PROD_BASE || 'https://exams.tertiaryinfotech.com';
const EMAIL = process.env.PROD_ADMIN_EMAIL || 'angch@tertiaryinfotech.com';
const PASSWORD = process.env.PROD_ADMIN_PASSWORD || 'password123';

const args = process.argv.slice(2);
let query;
if (args[0] === '--slugPrefix') query = `slugPrefix=${encodeURIComponent(args[1])}`;
else query = `vendor=${encodeURIComponent(args[0] || 'google')}`;

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
  method: 'POST', redirect: 'manual',
  headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: ch() },
  body: new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, callbackUrl: `${BASE}/admin-dashboard` })
});
sc(r);
r = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: ch() } });
sc(r);
if (!(await r.json())?.user) throw new Error('login failed');

const res = await fetch(`${BASE}/api/admin/content-audit?${query}`, { headers: { cookie: ch() } });
if (res.status === 404) { console.log('! 404 — deploy has not rolled out yet.'); process.exit(1); }
const j = await res.json();
if (!j.exams) { console.log(JSON.stringify(j)); process.exit(1); }

console.log(`PROD content audit — ${JSON.stringify(j.scope)}\n`);
console.log(`TOTALS: ${j.totals.exams} exams · ${j.totals.publishedQuestions} published questions`);
console.log(`  dump-signature questions : ${j.totals.dumpSignature}`);
console.log(`  generic-only citations   : ${j.totals.genericOnlyRefs}\n`);

for (const e of j.exams) {
  const t = e.lengthTell;
  console.log(`── ${e.code} (${e.slug}) ${e.published ? 'ACTIVE' : 'inactive'}${e.archived ? ' ARCHIVED' : ''}`);
  console.log(`   questions: ${e.totals.published} published / ${e.totals.draft} draft · attempt=${e.questionCount} · ${e.totals.teasers} teaser`);
  console.log(`   provenance: ${JSON.stringify(e.provenance)}`);
  console.log(`   dumpSignature=${e.dumpSignature}  genericOnlyRefs=${e.genericOnlyRefs}  staleness=${JSON.stringify(e.staleness)}`);
  console.log(`   length tell: correct is strictly longest in ${t.correctIsStrictlyLongest}/${t.singleQuestions} SINGLE (${t.pct}%, chance ${t.chanceBaselinePct}%)`);
  if (e.orphanDomains.length) console.log(`   ⚠ orphan domains: ${JSON.stringify(e.orphanDomains)}`);
  const off = e.domainMix.filter((d) => Math.abs(d.actualPct - d.targetPct) >= 5);
  if (off.length) {
    console.log(`   domain mix off-blueprint by >=5pts:`);
    for (const d of off) console.log(`     ${String(d.actualPct).padStart(3)}% vs ${String(d.targetPct).padStart(2)}% target  ${d.domain}`);
  }
  console.log();
}
