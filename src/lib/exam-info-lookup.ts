import { z } from 'zod';
import { getSetting } from '@/lib/settings';
import { aiStructured } from '@/lib/openai';

const DomainSchema = z.object({ name: z.string().min(1), weight: z.number().min(0).max(100) });

const ResultSchema = z.object({
  infoUrl: z.string().url(),
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(2).max(80).optional(),
  notes: z.string().optional(),
  description: z.string().min(20).max(600).optional(),
  durationMinutes: z.number().int().min(15).max(360).optional(),
  passingScore: z.number().int().min(40).max(100).optional(),
  questionCount: z.number().int().min(10).max(120).optional(),
  domains: z.array(DomainSchema).optional()
});
export type ExamInfoLookup = z.infer<typeof ResultSchema>;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const VENDOR_DOMAINS: Record<string, string[]> = {
  comptia: ['comptia.org'],
  'amazon web services': ['aws.amazon.com'],
  aws: ['aws.amazon.com'],
  microsoft: ['learn.microsoft.com', 'microsoft.com'],
  google: ['cloud.google.com', 'google.com'],
  cisco: ['cisco.com', 'learningnetwork.cisco.com'],
  'isc2': ['isc2.org'],
  'isaca': ['isaca.org'],
  oracle: ['oracle.com', 'education.oracle.com'],
  ibm: ['ibm.com'],
  'red hat': ['redhat.com'],
  vmware: ['vmware.com', 'broadcom.com'],
  hashicorp: ['hashicorp.com', 'developer.hashicorp.com'],
  pmi: ['pmi.org']
};

function preferredDomains(vendor: string): string[] {
  const v = vendor.toLowerCase();
  for (const [k, arr] of Object.entries(VENDOR_DOMAINS)) {
    if (v.includes(k)) return arr;
  }
  return [];
}

async function searchTavily(
  apiKey: string,
  q: string,
  preferred: string[]
): Promise<{ url: string; title: string }[]> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query: q,
      search_depth: 'advanced',
      max_results: 8,
      include_domains: preferred.length ? preferred : undefined
    })
  });
  if (!res.ok) throw new Error(`Tavily search failed: ${res.status}`);
  const j = (await res.json()) as { results?: { url: string; title: string }[] };
  return (j.results || []).map((r) => ({ url: r.url, title: r.title }));
}

async function searchFirecrawl(
  apiKey: string,
  q: string
): Promise<{ url: string; title: string }[]> {
  const res = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: q, limit: 8 })
  });
  if (!res.ok) throw new Error(`Firecrawl search failed: ${res.status}`);
  const j = (await res.json()) as { data?: { url: string; title?: string }[] };
  return (j.data || []).map((r) => ({ url: r.url, title: r.title || r.url }));
}

async function scrapeFirecrawl(apiKey: string, url: string): Promise<string> {
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true })
  });
  if (!res.ok) throw new Error(`Firecrawl scrape failed for ${url}: ${res.status}`);
  const j = (await res.json()) as { data?: { markdown?: string } };
  return j.data?.markdown || '';
}

function rankUrls(
  results: { url: string; title: string }[],
  preferred: string[],
  code: string
): string[] {
  const codeRe = new RegExp(code.replace(/[-]/g, '[- ]?'), 'i');
  const blogRe = /\/(blog|news|article|story|stories|insights|press)\b/i;
  const goodPathRe = /\/(certifications?|certification-exams|exams?|training|exam-objectives|exam-details|learn|credentials?)\b/i;
  const scored = results.map((r) => {
    let s = 0;
    if (preferred.some((d) => r.url.includes(d))) s += 50;
    if (codeRe.test(r.url)) s += 40;
    if (codeRe.test(r.title)) s += 15;
    if (goodPathRe.test(r.url)) s += 25;
    if (blogRe.test(r.url)) s -= 60;
    if (/\.pdf(\?|$)/i.test(r.url)) s += 20;
    return { ...r, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored.map((r) => r.url);
}

const FIND_URL_SYSTEM = `You locate the canonical official vendor page for an IT certification.

Given a vendor name and exam code, use web search to find the OFFICIAL vendor page
that describes the exam (overview, blueprint, or exam guide PDF).
Prefer pages on the vendor's primary domain (comptia.org, aws.amazon.com,
learn.microsoft.com, cloud.google.com, cisco.com, isc2.org, oracle.com, etc.).
Avoid blog posts, marketing articles, third-party study guides, and unofficial dumps.
If you cannot find the official page, return infoUrl as null.`;

const FindUrlSchema = z.object({ infoUrl: z.string().nullable() });

/** Last-resort URL finder: OpenAI with its web_search tool. */
async function findUrlViaAgent(vendor: string, code: string, title: string): Promise<string | null> {
  const prompt = `Vendor: ${vendor}
Exam code: ${code}
${title ? `Title hint: ${title}\n` : ''}
Find the canonical official vendor page for this exam and return its URL.`;
  const { infoUrl } = await aiStructured({
    schema: FindUrlSchema,
    name: 'exam_page',
    instructions: FIND_URL_SYSTEM,
    input: prompt,
    webSearch: true
  });
  return infoUrl && /^https?:\/\//i.test(infoUrl) ? infoUrl : null;
}

const EXTRACT_SYSTEM = `You extract structured metadata about an IT certification exam
from raw vendor-page markdown.

Fields:
- title: official certification title (e.g. "CompTIA PenTest+")
- description: 1-3 sentence overview (100-500 chars)
- durationMinutes: exam length in minutes (integer)
- passingScore: passing percentage as an integer if stated; CompTIA uses a 100-900 scale so
  convert to a percentage estimate (e.g. 750/900 ≈ 83). Omit if you cannot infer.
- questionCount: total questions in one sitting (integer)
- domains: array of { name, weight } from the published blueprint, weights as
  percentages summing to ~100. Use the exact domain names from the page.

Use null for any field you cannot verify from the page. Do not invent numbers.`;

// Structured-output shape: every field present, null when the page doesn't say.
const ExtractSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  durationMinutes: z.number().int().nullable(),
  passingScore: z.number().int().nullable(),
  questionCount: z.number().int().nullable(),
  domains: z.array(z.object({ name: z.string(), weight: z.number() })).nullable()
});

async function extractWithAI(
  url: string,
  markdown: string,
  vendor: string,
  code: string,
  titleHint: string
): Promise<Partial<ExamInfoLookup>> {
  const prompt = `Vendor: ${vendor}
Exam code: ${code}
${titleHint ? `Title hint: ${titleHint}\n` : ''}Source URL: ${url}

--- BEGIN PAGE MARKDOWN ---
${markdown.slice(0, 60_000)}
--- END PAGE MARKDOWN ---`;
  const raw = await aiStructured({ schema: ExtractSchema, name: 'exam_info', instructions: EXTRACT_SYSTEM, input: prompt });
  // Drop nulls so ResultSchema's optional fields stay absent.
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null)) as Partial<ExamInfoLookup>;
}

export async function lookupExamInfo(input: {
  vendor: string;
  title?: string;
  code: string;
  infoUrl?: string;
}): Promise<ExamInfoLookup> {
  const [firecrawlKey, tavilyKey] = await Promise.all([
    getSetting('FIRECRAWL_API_KEY'),
    getSetting('TAVILY_API_KEY')
  ]);
  if (!firecrawlKey) throw new Error('Firecrawl API key not configured (Settings → Credentials).');

  // Short-circuit: if the caller already has a vendor URL, scrape that
  // first. Search/agent fallback only runs if this URL yields nothing.
  const hintedErrors: string[] = [];
  if (input.infoUrl && /^https?:\/\//i.test(input.infoUrl)) {
    try {
      const markdown = await scrapeFirecrawl(firecrawlKey, input.infoUrl);
      if (markdown && markdown.length >= 200) {
        const extracted = await extractWithAI(
          input.infoUrl,
          markdown,
          input.vendor,
          input.code,
          input.title || ''
        );
        const hasContent =
          !!extracted.description ||
          !!extracted.durationMinutes ||
          !!extracted.questionCount ||
          (Array.isArray(extracted.domains) && extracted.domains.length > 0);
        if (hasContent) {
          const merged: Record<string, any> = { ...extracted, infoUrl: input.infoUrl };
          if (!merged.slug) merged.slug = slugify(`${input.vendor} ${input.code}`);
          const parsed = ResultSchema.safeParse(merged);
          if (parsed.success) return parsed.data;
          hintedErrors.push(`hinted ${input.infoUrl}: ${parsed.error.issues[0]?.message}`);
        } else {
          hintedErrors.push(`hinted ${input.infoUrl}: no substantive fields extracted`);
        }
      } else {
        hintedErrors.push(`hinted ${input.infoUrl}: scrape too short (${markdown?.length ?? 0})`);
      }
    } catch (e: any) {
      hintedErrors.push(`hinted ${input.infoUrl}: ${e?.message ?? e}`);
    }
  }

  const preferred = preferredDomains(input.vendor);
  const queries = [
    `${input.vendor} ${input.code} exam objectives`,
    `${input.vendor} ${input.code} certification exam details`,
    `"${input.code}" ${input.vendor} exam`
  ];

  const seen = new Set<string>();
  const aggregated: { url: string; title: string }[] = [];
  let tavilyWorked = false;
  let firecrawlSearchWorked = false;
  for (const q of queries) {
    let results: { url: string; title: string }[] = [];
    if (tavilyKey) {
      try {
        results = await searchTavily(tavilyKey, q, preferred);
        if (results.length) tavilyWorked = true;
      } catch {
        /* fall through */
      }
    }
    if (!results.length) {
      try {
        results = await searchFirecrawl(firecrawlKey, q);
        if (results.length) firecrawlSearchWorked = true;
      } catch {
        /* keep trying next query */
      }
    }
    for (const r of results) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        aggregated.push(r);
      }
    }
    if (aggregated.length >= 5) break;
  }
  const errors: string[] = [];

  // Fallback: if neither search backend gave us anything, ask OpenAI (with
  // web search) to find the canonical URL itself. We then keep
  // using Firecrawl for the actual scrape because its markdown output is
  // cleaner than WebFetch's raw HTML.
  if (!aggregated.length || (!tavilyWorked && !firecrawlSearchWorked)) {
    try {
      const agentUrl = await findUrlViaAgent(input.vendor, input.code, input.title || '');
      if (agentUrl) aggregated.push({ url: agentUrl, title: agentUrl });
    } catch (e: any) {
      errors.push(`agent fallback: ${e?.message ?? e}`);
    }
  }

  if (!aggregated.length) {
    throw new Error(
      `No search results for ${input.vendor} ${input.code}.${errors.length ? ` (${errors.join('; ')})` : ''}`
    );
  }

  const ranked = rankUrls(aggregated, preferred, input.code);
  for (const url of ranked.slice(0, 4)) {
    try {
      const markdown = await scrapeFirecrawl(firecrawlKey, url);
      if (!markdown || markdown.length < 200) {
        errors.push(`${url}: too short (${markdown.length})`);
        continue;
      }
      const extracted = await extractWithAI(
        url,
        markdown,
        input.vendor,
        input.code,
        input.title || ''
      );
      // Require at least one substantive field — otherwise try the next URL.
      const hasContent =
        !!extracted.description ||
        !!extracted.durationMinutes ||
        !!extracted.questionCount ||
        (Array.isArray(extracted.domains) && extracted.domains.length > 0);
      if (!hasContent) {
        errors.push(`${url}: no substantive fields extracted`);
        continue;
      }
      const merged: Record<string, any> = { ...extracted, infoUrl: url };
      if (!merged.slug) merged.slug = slugify(`${input.vendor} ${input.code}`);
      const parsed = ResultSchema.safeParse(merged);
      if (!parsed.success) {
        errors.push(`${url}: ${parsed.error.issues[0]?.message}`);
        continue;
      }
      return parsed.data;
    } catch (e: any) {
      errors.push(`${url}: ${e?.message ?? e}`);
    }
  }
  // Last-ditch: ask the agent to find a different canonical URL we haven't
  // tried yet, then scrape+extract that.
  try {
    const agentUrl = await findUrlViaAgent(input.vendor, input.code, input.title || '');
    if (agentUrl && !ranked.includes(agentUrl)) {
      const markdown = await scrapeFirecrawl(firecrawlKey, agentUrl);
      if (markdown && markdown.length >= 200) {
        const extracted = await extractWithAI(
          agentUrl,
          markdown,
          input.vendor,
          input.code,
          input.title || ''
        );
        const merged: Record<string, any> = { ...extracted, infoUrl: agentUrl };
        if (!merged.slug) merged.slug = slugify(`${input.vendor} ${input.code}`);
          const parsed = ResultSchema.safeParse(merged);
        if (parsed.success) return parsed.data;
        errors.push(`agent ${agentUrl}: ${parsed.error.issues[0]?.message}`);
      } else {
        errors.push(`agent ${agentUrl}: scrape too short`);
      }
    }
  } catch (e: any) {
    errors.push(`agent fallback: ${e?.message ?? e}`);
  }

  throw new Error(
    `Could not extract usable metadata. Tried: ${[...hintedErrors, ...errors].join(' | ')}`
  );
}
