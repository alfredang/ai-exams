/**
 * Read a question source into plain text for the AI Question and Answer
 * Generator: an uploaded PDF, a web page, or a YouTube video's transcript.
 *
 * SSRF rule (.claude/rules/api-and-server-actions.md): this server never
 * fetches an admin-supplied URL itself. Web pages are read through fixed
 * provider hosts (Firecrawl, Tavily, or OpenAI web search); YouTube is fetched
 * only from www.youtube.com with a URL rebuilt from a validated video id.
 */
import { z } from 'zod';
import { getSetting } from '@/lib/settings';
import { qaStructured } from '@/lib/openai';

export type ExtractResult = { text: string; title: string; via: string; meta?: Record<string, unknown> };

/** Longest source text kept (≈ 500k tokens would be far too much; this is ~150k). */
export const MAX_SOURCE_CHARS = 600_000;
export const MAX_PDF_BYTES = 25 * 1024 * 1024;

const clip = (t: string) => t.replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_SOURCE_CHARS);

// ---------- URL checks ----------

/** A public http(s) URL, or an error message. Private / local hosts are refused. */
export function checkPublicUrl(raw: string): URL | string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return 'Enter a full link starting with https://';
  }
  if (!/^https?:$/.test(url.protocol)) return 'Only http(s) links are supported.';
  const host = url.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    host.includes(':') ||
    !host.includes('.')
  ) {
    return 'Use a public website link (not an IP address or local host).';
  }
  return url;
}

/** The 11-character video id of a YouTube link, or null. */
export function youtubeVideoId(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^(www\.|m\.|music\.)/, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const m = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname);
      id = m?.[1] ?? null;
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

// ---------- PDF ----------

/**
 * Text of an uploaded PDF. pdf-parse first; a scanned or image-only PDF (little
 * or no text layer) is read by OpenAI from the file itself.
 */
export async function extractFromPdf(buf: Buffer, filename: string): Promise<ExtractResult> {
  let text = '';
  let pages = 0;
  let parseError = '';
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    try {
      const res = await parser.getText();
      text = res.text ?? '';
      pages = res.total ?? 0;
    } finally {
      await parser.destroy().catch(() => {});
    }
  } catch (e: any) {
    parseError = String(e?.message ?? e);
  }
  const title = filename.replace(/\.pdf$/i, '');
  // Under ~200 characters a page means a scan: let the model read the file.
  if (clip(text).length >= Math.max(500, pages * 200)) {
    return { text: clip(text), title, via: 'pdf-text', meta: { pages } };
  }
  const { data } = await qaStructured({
    schema: z.object({ text: z.string() }),
    name: 'pdf_transcript',
    instructions:
      'You transcribe documents. Return the full readable text of the attached PDF in reading order — every heading, paragraph, list, table row, question and answer option. No commentary.',
    input: 'Transcribe the attached PDF.',
    file: { filename: filename || 'source.pdf', base64: buf.toString('base64'), mime: 'application/pdf' }
  });
  if (clip(data.text).length < 200) {
    throw new Error(`Could not read any text from this PDF${parseError ? ` (${parseError})` : ''}.`);
  }
  return { text: clip(data.text), title, via: 'openai-file', meta: { pages } };
}

// ---------- Web page ----------

async function firecrawlScrape(url: string): Promise<{ markdown: string; title: string } | null> {
  const key = await getSetting('FIRECRAWL_API_KEY');
  if (!key) return null;
  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
    signal: AbortSignal.timeout(120_000)
  });
  const json = (await res.json().catch(() => null)) as { success?: boolean; data?: { markdown?: string; metadata?: { title?: string } }; error?: string } | null;
  if (!res.ok || !json?.success || !json.data?.markdown) throw new Error(`Firecrawl: ${json?.error ?? `HTTP ${res.status}`}`);
  return { markdown: json.data.markdown, title: json.data.metadata?.title ?? '' };
}

async function tavilyExtract(url: string): Promise<{ markdown: string; title: string } | null> {
  const key = await getSetting('TAVILY_API_KEY');
  if (!key) return null;
  const res = await fetch('https://api.tavily.com/extract', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: [url], extract_depth: 'advanced' }),
    signal: AbortSignal.timeout(120_000)
  });
  const json = (await res.json().catch(() => null)) as { results?: { raw_content?: string; title?: string }[]; detail?: unknown } | null;
  const hit = json?.results?.[0];
  if (!res.ok || !hit?.raw_content) throw new Error(`Tavily: HTTP ${res.status}`);
  return { markdown: hit.raw_content, title: hit.title ?? '' };
}

/** Main text of a public web page, read through a provider (never fetched here). */
export async function extractFromWebPage(raw: string): Promise<ExtractResult> {
  const url = checkPublicUrl(raw);
  if (typeof url === 'string') throw new Error(url);
  const errors: string[] = [];
  for (const [via, read] of [
    ['firecrawl', firecrawlScrape],
    ['tavily', tavilyExtract]
  ] as const) {
    try {
      const out = await read(url.href);
      if (out && clip(out.markdown).length >= 200) return { text: clip(out.markdown), title: out.title || url.hostname, via };
    } catch (e: any) {
      errors.push(String(e?.message ?? e));
    }
  }
  // No scraper key (or both failed): OpenAI opens the page with web search.
  try {
    const { data } = await qaStructured({
      schema: z.object({ title: z.string(), text: z.string() }),
      name: 'web_page',
      instructions:
        'You read web pages for an exam-question author. Open the exact URL given with web search and return its title and its main content as faithfully and completely as you can (headings, paragraphs, lists, tables, any questions with their options and answers). Do not summarise other pages. If you cannot open that URL, return empty text.',
      input: `URL: ${url.href}`,
      webSearch: true
    });
    if (clip(data.text).length >= 200) return { text: clip(data.text), title: data.title || url.hostname, via: 'openai-web-search' };
  } catch (e: any) {
    errors.push(`OpenAI web search: ${e?.message ?? e}`);
  }
  throw new Error(`Could not read that page${errors.length ? ` — ${errors.join(' | ')}` : ''}. Try another link or upload it as a PDF.`);
}

// ---------- YouTube ----------

/** Captions straight from youtube.com (the only host fetched directly here). */
async function youtubeCaptions(id: string): Promise<{ text: string; title: string }> {
  const page = await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TertiaryExamsBot/1.0)', 'Accept-Language': 'en' },
    signal: AbortSignal.timeout(30_000)
  });
  const html = await page.text();
  const title = (/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '').replace(/\s*-\s*YouTube\s*$/, '').trim();
  const tracksJson = /"captionTracks":(\[.*?\])/.exec(html)?.[1];
  if (!tracksJson) throw new Error('this video has no captions YouTube will share');
  const tracks = JSON.parse(tracksJson) as { baseUrl: string; languageCode?: string; kind?: string }[];
  const track =
    tracks.find((t) => t.languageCode?.startsWith('en') && t.kind !== 'asr') ??
    tracks.find((t) => t.languageCode?.startsWith('en')) ??
    tracks[0];
  const base = new URL(track.baseUrl.replace(/\\u0026/g, '&'), 'https://www.youtube.com');
  if (base.hostname !== 'www.youtube.com') throw new Error('unexpected caption host');
  base.searchParams.set('fmt', 'json3');
  const res = await fetch(base.href, { signal: AbortSignal.timeout(30_000) });
  const json = (await res.json().catch(() => null)) as { events?: { segs?: { utf8?: string }[] }[] } | null;
  const text = (json?.events ?? [])
    .map((e) => (e.segs ?? []).map((s) => s.utf8 ?? '').join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length < 200) throw new Error('the transcript came back empty');
  return { text, title };
}

/** Transcript of a YouTube video. */
export async function extractFromYoutube(raw: string): Promise<ExtractResult> {
  const id = youtubeVideoId(raw);
  if (!id) throw new Error('That is not a YouTube video link (youtube.com/watch?v=… or youtu.be/…).');
  const canonical = `https://www.youtube.com/watch?v=${id}`;
  const errors: string[] = [];
  try {
    const out = await firecrawlScrape(canonical);
    if (out && clip(out.markdown).length >= 500) return { text: clip(out.markdown), title: out.title || `YouTube ${id}`, via: 'firecrawl', meta: { videoId: id } };
  } catch (e: any) {
    errors.push(String(e?.message ?? e));
  }
  try {
    const out = await youtubeCaptions(id);
    return { text: clip(out.text), title: out.title || `YouTube ${id}`, via: 'youtube-captions', meta: { videoId: id } };
  } catch (e: any) {
    errors.push(`YouTube: ${e?.message ?? e}`);
  }
  throw new Error(
    `Could not read this video's transcript (${errors.join(' | ')}). Add a Firecrawl key under Settings → Credentials, or upload the transcript as a PDF.`
  );
}
