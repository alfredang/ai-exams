const origin = (process.env.LINK_CHECK_ORIGIN || 'http://127.0.0.1:3040').replace(/\/$/, '');
const maxUrls = Number(process.env.LINK_CHECK_MAX_URLS || 600);
const concurrency = Number(process.env.LINK_CHECK_CONCURRENCY || 4);
const startPaths = ['/', '/practice-exams', '/vendors', '/p/support'];

const queued = [];
const seen = new Set();
const sources = new Map();
const failures = [];
const redirects = [];
let checked = 0;

function enqueue(raw, source) {
  if (!raw || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) return;
  let url;
  try {
    url = new URL(raw.replaceAll('&amp;', '&'), origin);
  } catch {
    failures.push({ url: raw, status: 'invalid-url', source });
    return;
  }
  if (url.origin !== origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/api') return;
  url.hash = '';
  // Query strings on catalogue filters can produce an unbounded crawl while
  // exercising the same page route. Keep checkout tier parameters because
  // they materially change rendered content.
  if (!url.pathname.startsWith('/checkout/') && !url.pathname.startsWith('/_next/')) url.search = '';
  const key = url.href;
  if (seen.has(key) || queued.some((item) => item.url === key) || seen.size + queued.length >= maxUrls) return;
  queued.push({ url: key, source });
  sources.set(key, source);
}

function discover(html, pageUrl) {
  const attrPattern = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(attrPattern)) enqueue(match[1], pageUrl);
}

async function check(item) {
  seen.add(item.url);
  try {
    const response = await fetch(item.url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    checked += 1;
    if (response.url !== item.url) redirects.push({ from: item.url, to: response.url, status: response.status });
    if (!response.ok) {
      failures.push({ url: item.url, status: response.status, source: item.source });
      return;
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const html = await response.text();
      if (/Application error|Internal Server Error|This page could not be found/i.test(html)) {
        failures.push({ url: item.url, status: 'error-page-content', source: item.source });
        return;
      }
      discover(html, item.url);
    }
  } catch (error) {
    failures.push({ url: item.url, status: error?.name || 'fetch-error', source: item.source, message: error?.message });
  }
}

for (const path of startPaths) enqueue(path, '(start)');
while (queued.length > 0) {
  const batch = queued.splice(0, concurrency);
  await Promise.all(batch.map(check));
}

console.log(`Checked ${checked} local URLs (${seen.size} attempted).`);
console.log(`Observed ${redirects.length} redirects.`);
if (redirects.length) {
  for (const row of redirects.slice(0, 20)) console.log(`REDIRECT ${row.from} -> ${row.to}`);
}
if (failures.length) {
  console.error(`Found ${failures.length} failure(s):`);
  for (const row of failures) console.error(`${row.status} ${row.url} (found on ${row.source})${row.message ? `: ${row.message}` : ''}`);
  process.exitCode = 1;
} else {
  console.log('All discovered internal links and assets passed.');
}
