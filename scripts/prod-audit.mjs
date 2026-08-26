/* READ-ONLY production audit. No writes, no mutations.
 *
 * Network activity is strictly:
 *   1. GET  /api/auth/csrf                (read token)
 *   2. POST /api/auth/callback/password   (authentication only — NextAuth login)
 *   3. GET  /admin-dashboard/exams?...    (read the server-rendered exam list)
 *
 * The admin exams list is now a server-rendered HTML table (the old JSON-in-RSC
 * shape was removed). Each row carries:
 *   - <input ... aria-label="Select {CODE}" value="{examId}">  → code + id
 *   - a vendor <span>, the title <a> with a "· P{n}" variant suffix
 *   - a status dot <span class="... bg-{color}-500" title="{status}">
 * We parse those rows, dedupe by exam id, and print a per-vendor health map.
 *
 * Run:  node scripts/prod-audit.mjs
 */

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
    const [kv] = sc.split(';');
    const i = kv.indexOf('=');
    if (i > 0) jar.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim());
  }
}
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');

// Parse all exam rows out of one page of admin-dashboard/exams HTML.
function parseRows(html, vendor) {
  const out = [];
  // Each row starts at the select-checkbox. Slice row = from this checkbox to the next one.
  const re = /aria-label="Select ([^"]+)"[^>]*value="([a-z0-9]+)"/g;
  const marks = [];
  let m;
  while ((m = re.exec(html))) marks.push({ code: m[1], id: m[2], at: m.index });
  for (let i = 0; i < marks.length; i++) {
    const seg = html.slice(marks[i].at, marks[i + 1]?.at ?? marks[i].at + 1200);
    // vendor name (first span after checkbox)
    const ven = seg.match(/<span class="text-slate-700[^"]*">([^<]+)<\/span>/);
    // title + variant
    const title = seg.match(/href="\/admin-dashboard\/exams\/[a-z0-9]+">([^<]+)</);
    const variant = seg.match(/·\s*P<!--\s*-->\s*(\d+)/);
    // status dot color + title
    const dot = seg.match(/rounded-full bg-(\w+)-500"\s+title="([^"]*)"/);
    out.push({
      vendor,
      vendorName: ven?.[1] ?? '',
      code: marks[i].code,
      id: marks[i].id,
      title: (title?.[1] ?? '').trim(),
      variant: variant ? `P${variant[1]}` : '',
      dotColor: dot?.[1] ?? '?',
      status: dot?.[2] ?? '(no dot)',
    });
  }
  return out;
}

async function main() {
  // 1. CSRF
  let r = await fetch(`${BASE}/api/auth/csrf`, { headers: { cookie: cookieHeader() } });
  setCookies(r);
  const { csrfToken } = await r.json();
  if (!csrfToken) throw new Error('no csrfToken');

  // 2. Login (authentication only)
  const form = new URLSearchParams({
    csrfToken, email: EMAIL, password: PASSWORD,
    callbackUrl: `${BASE}/admin-dashboard`
  });
  r = await fetch(`${BASE}/api/auth/callback/password`, {
    method: 'POST', redirect: 'manual',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookieHeader() },
    body: form
  });
  setCookies(r);
  r = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: cookieHeader() } });
  setCookies(r);
  const session = await r.json();
  if (!session?.user) throw new Error('login failed (no session) — check credentials');
  console.log(`# logged in as ${session.user.email} (role=${session.user.role ?? '?'})\n`);

  const byId = new Map();
  for (const v of VENDORS) {
    for (let page = 1; page <= 12; page++) {
      const res = await fetch(`${BASE}/admin-dashboard/exams?vendor=${v}&page=${page}`, {
        headers: { cookie: cookieHeader() }
      });
      setCookies(res);
      if (res.status !== 200) break;
      const rows = parseRows(await res.text(), v);
      if (rows.length === 0) break;
      let fresh = 0;
      for (const row of rows) {
        if (!byId.has(row.id)) { byId.set(row.id, row); fresh++; }
      }
      if (fresh === 0) break; // page repeats / no new rows
    }
  }

  const rows = [...byId.values()].sort(
    (a, b) => a.vendor.localeCompare(b.vendor) || a.code.localeCompare(b.code)
  );

  let cur = '';
  const dup = [], noq = [], partial = [], other = [];
  for (const x of rows) {
    if (x.vendor !== cur) { console.log(`\n### ${x.vendor}  (${x.vendorName})`); cur = x.vendor; }
    let flag = '';
    if (/duplicate/i.test(x.status)) { flag = '  ⟶DUP'; dup.push(x); }
    else if (/no question/i.test(x.status) || x.dotColor === 'slate' || x.dotColor === 'gray') { flag = '  ⟶NO-Q'; noq.push(x); }
    else if (!/all .* published/i.test(x.status)) { flag = '  ⟶CHECK'; partial.push(x); }
    console.log(`  ${x.code.padEnd(22)} ${(x.variant || '-').padEnd(4)} [${x.dotColor}] ${x.status.padEnd(42)} ${x.title}${flag}`);
  }

  console.log(`\n# total exams: ${rows.length}`);
  console.log(`# duplicate-exam rows: ${dup.length}`);
  console.log(`# no-question rows:    ${noq.length} -> ${noq.map((x) => x.code).join(', ') || 'none'}`);
  console.log(`# non-fully-published: ${partial.length} -> ${partial.map((x) => x.code).join(', ') || 'none'}`);
}
main().catch((e) => { console.error('AUDIT ERROR:', e.message); process.exit(1); });
