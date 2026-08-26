/* READ-ONLY prod catalog audit via the admin catalog-health JSON endpoint.
 *
 *   1. GET  /api/auth/csrf
 *   2. POST /api/auth/callback/password   (auth only)
 *   3. GET  /api/admin/catalog-health?vendor=<slug>   (pure reads, server-side)
 *
 * Aggregates every vendor into one health report: per-exam published/draft
 * counts, archived/inactive state, anomaly flags, and bundle wiring.
 *
 * Run:  node scripts/prod-health.mjs
 */
import fs from 'fs';

const BASE = process.env.PROD_BASE || 'https://exams.tertiaryinfotech.com';
const EMAIL = process.env.PROD_ADMIN_EMAIL || 'angch@tertiaryinfotech.com';
const PASSWORD = process.env.PROD_ADMIN_PASSWORD;
if (!PASSWORD) throw new Error('PROD_ADMIN_PASSWORD is required');

const VENDORS = [
  'docker', 'elastic', 'gitlab', 'hashicorp', 'redhat', 'linuxfoundation',
  'axelos', 'tableau', 'iassc', 'microsoft', 'google', 'comptia', 'cisco',
  'oracle', 'isc2', 'pmi', 'scrum-org', 'aws', 'anthropic', 'github'
];

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

  const totals = { exams: 0, active: 0, inactive: 0, archived: 0, flags: 0, bundles: 0, pubBundles: 0 };
  const allFlags = [];
  const allBundles = [];
  const examIndex = {}; // slug -> { code, published, archived, pub, draft }
  const vendorMissing = [];

  for (const v of VENDORS) {
    const res = await fetch(`${BASE}/api/admin/catalog-health?vendor=${v}`, { headers: { cookie: cookieHeader() } });
    if (res.status === 404) { vendorMissing.push(v); console.log(`### ${v}: VENDOR NOT FOUND (404)`); continue; }
    if (res.status !== 200) { console.log(`### ${v}: HTTP ${res.status}`); continue; }
    const data = await res.json();
    const s = data.summary;
    totals.exams += s.totalExams; totals.active += s.active; totals.inactive += s.inactive;
    totals.archived += s.archived; totals.flags += s.examsWithFlags; totals.bundles += s.totalBundles;
    const pubB = data.bundles.filter((b) => b.published).length;
    totals.pubBundles += pubB;
    console.log(`### ${v}  exams=${s.totalExams} active=${s.active} inactive=${s.inactive} archived=${s.archived} flagged=${s.examsWithFlags} bundles=${s.totalBundles}(pub ${pubB})`);
    for (const e of data.exams) {
      const tag = [e.archived && 'ARCHIVED', !e.published && !e.archived && 'INACTIVE'].filter(Boolean).join(',');
      if (e.flags.length) allFlags.push(`  [${v}] ${e.code || e.slug} (pub=${e.publishedQuestions} draft=${e.draftQuestions}${tag ? ' ' + tag : ''}): ${e.flags.join(' | ')}`);
      examIndex[e.slug] = { code: e.code, published: e.published, archived: e.archived, pub: e.publishedQuestions, draft: e.draftQuestions };
    }
    for (const b of data.bundles) allBundles.push({ v, ...b });
  }

  console.log('\n===== ANOMALY FLAGS =====');
  console.log(allFlags.length ? allFlags.join('\n') : '  (none)');

  console.log('\n===== UNPUBLISHED / EMPTY BUNDLES =====');
  const badBundles = allBundles.filter((b) => !b.published || b.items.length === 0);
  for (const b of badBundles) {
    console.log(`  [${b.v}] ${b.slug} pub=${b.published} items=${b.items.length}`);
    for (const it of b.items) {
      const ix = examIndex[it.examSlug] || {};
      console.log(`      - ${it.examSlug} (${ix.published ? 'active' : ix.archived ? 'ARCHIVED' : 'inactive'}) pub=${ix.pub} draft=${ix.draft}`);
    }
  }
  if (!badBundles.length) console.log('  (none)');

  // Published bundles whose member exams are archived/inactive or empty = broken product
  console.log('\n===== PUBLISHED BUNDLES WITH BAD MEMBER EXAMS =====');
  const brokenPub = [];
  for (const b of allBundles.filter((x) => x.published)) {
    const bad = b.items.filter((it) => {
      const ix = examIndex[it.examSlug];
      return !ix || ix.archived || !ix.published || ix.pub === 0;
    });
    if (bad.length) brokenPub.push({ b, bad });
  }
  if (brokenPub.length) {
    for (const { b, bad } of brokenPub) {
      console.log(`  [${b.v}] ${b.slug}`);
      for (const it of bad) {
        const ix = examIndex[it.examSlug] || {};
        console.log(`      ! ${it.examSlug} (${ix.archived ? 'ARCHIVED' : !ix.published ? 'inactive' : 'active'}) pub=${ix.pub ?? 'MISSING'}`);
      }
    }
  } else console.log('  (none — every published bundle has all-active, non-empty exams)');

  console.log('\n===== TOTALS =====');
  console.log(`  exams:    ${totals.exams}  (active ${totals.active} / inactive ${totals.inactive} / archived ${totals.archived})`);
  console.log(`  flagged exams: ${totals.flags}`);
  console.log(`  bundles:  ${totals.bundles}  (published ${totals.pubBundles})`);
  if (vendorMissing.length) console.log(`  MISSING VENDORS: ${vendorMissing.join(', ')}`);

  fs.writeFileSync('scripts/_health_full.json', JSON.stringify({ totals, allFlags, allBundles }, null, 2));
}
main().catch((e) => { console.error('AUDIT ERROR:', e.message); process.exit(1); });
