'use client';
import { useState } from 'react';
import { SourceStreamPanel, consumeSSE, type GenQuestion } from '@/components/admin/source-stream-panel';

export default function WebAuthorClient({ examId, domains }: { examId: string; domains: string[] }) {
  const [urls, setUrls] = useState('');
  const [domain, setDomain] = useState(domains[0] ?? 'General');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [type, setType] = useState<'SINGLE' | 'MULTI' | 'TRUE_FALSE'>('SINGLE');
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState<GenQuestion[]>([]);
  const [progress, setProgress] = useState<{ i: number; of: number } | null>(null);
  const [phase, setPhase] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const list = urls
      .split(/\s+/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\//.test(u));
    if (list.length === 0) {
      setError('Enter one or more https URLs (one per line).');
      return;
    }
    setBusy(true);
    setQuestions([]);
    setError(null);
    setProgress(null);
    setPhase('Scraping with Firecrawl…');
    try {
      const res = await fetch('/api/admin/generate-from-urls', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ examId, urls: list, domain, count, difficulty, type, publish })
      });
      if (!res.ok) {
        setError(await res.text());
        setBusy(false);
        return;
      }
      await consumeSSE(res, (event, data) => {
        if (event === 'init') setPhase(`Scraping ${data.urls} URL${data.urls === 1 ? '' : 's'}…`);
        else if (event === 'source') {
          setPhase('Generating from scraped content…');
          setProgress({ i: 0, of: data.chunks });
        }
        else if (event === 'chunk') setProgress({ i: data.i, of: data.of });
        else if (event === 'question') setQuestions((qs) => [...qs, data]);
        else if (event === 'warn') setError(data.message);
        else if (event === 'error') setError(data.message);
        else if (event === 'done') setPhase('');
      });
    } catch (err: any) {
      setError(err?.message || 'Stream failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card grid gap-3 p-4 md:grid-cols-2">
        <label className="md:col-span-2 block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">URLs (one per line, max 10)</span>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={5}
            placeholder="https://docs.aws.amazon.com/...&#10;https://aws.amazon.com/certification/..."
            className="w-full rounded-md border border-slate-200 bg-white p-2 text-[12px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            required
          />
          <span className="mt-1 block text-xs text-slate-500">Uses Firecrawl to scrape each URL to markdown. The Firecrawl API key must be set in Settings → Credentials.</span>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Domain</span>
          {domains.length > 0 ? (
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className="input-sm">
              {domains.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          ) : (
            <input value={domain} onChange={(e) => setDomain(e.target.value)} className="input-sm" />
          )}
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Question type</span>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="input-sm">
            <option value="SINGLE">Single answer</option>
            <option value="MULTI">Multiple answers</option>
            <option value="TRUE_FALSE">True / False</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Count (1-25)</span>
          <input type="number" min={1} max={25} value={count} onChange={(e) => setCount(Number(e.target.value) || 5)} className="input-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Difficulty (1-5)</span>
          <input type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(Math.max(1, Math.min(5, Number(e.target.value) || 3)) as any)} className="input-sm" />
        </label>
        <label className="md:col-span-2 inline-flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          Publish immediately (otherwise saved as DRAFT for review)
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={busy || !urls.trim()}
            className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Scraping + generating…' : 'Scrape & generate'}
          </button>
          {phase && <span className="ml-3 text-xs text-slate-500">{phase}</span>}
        </div>
      </form>
      <SourceStreamPanel busy={busy} questions={questions} progress={progress} error={error} />
    </div>
  );
}
