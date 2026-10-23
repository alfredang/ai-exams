'use client';
import { useState } from 'react';
import { SourceStreamPanel, consumeSSE, type GenQuestion } from '@/components/admin/source-stream-panel';

export default function BlueprintAuthorClient({
  examId,
  defaultTotal,
  domains,
  infoUrl
}: {
  examId: string;
  defaultTotal: number;
  domains: { name: string; weight: number }[];
  infoUrl: string | null;
}) {
  const [totalCount, setTotalCount] = useState(defaultTotal);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [type, setType] = useState<'SINGLE' | 'MULTI' | 'TRUE_FALSE'>('SINGLE');
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState<GenQuestion[]>([]);
  const [progress, setProgress] = useState<{ i: number; of: number } | null>(null);
  const [phase, setPhase] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [perDomain, setPerDomain] = useState<Record<string, { target: number; issued: number }>>({});

  // Preview quotas
  const quotas = domains.map((d) => ({ name: d.name, target: Math.round((d.weight / 100) * totalCount), weight: d.weight }));
  let drift = totalCount - quotas.reduce((s, q) => s + q.target, 0);
  let i = 0;
  while (drift !== 0 && quotas.length) {
    quotas[i % quotas.length].target += drift > 0 ? 1 : -1;
    drift += drift > 0 ? -1 : 1;
    i++;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!infoUrl) { setError('Exam infoUrl missing — set it via the exam edit page first.'); return; }
    setBusy(true);
    setQuestions([]);
    setError(null);
    setProgress(null);
    setPerDomain(Object.fromEntries(quotas.map((q) => [q.name, { target: q.target, issued: 0 }])));
    setPhase('Starting blueprint generation…');
    try {
      const res = await fetch('/api/admin/generate-blueprint', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ examId, totalCount, difficulty, type, publish })
      });
      if (!res.ok) {
        setError(await res.text());
        setBusy(false);
        return;
      }
      await consumeSSE(res, (event, data) => {
        if (event === 'phase') setPhase(data.msg);
        else if (event === 'source') setPhase('Scrape complete. Generating per-domain…');
        else if (event === 'domain') setPhase(`Generating ${data.name} (target ${data.target})…`);
        else if (event === 'domain.done') {
          setPerDomain((s) => ({ ...s, [data.name]: { ...(s[data.name] ?? { target: 0, issued: 0 }), issued: data.issued } }));
        }
        else if (event === 'question') {
          setQuestions((qs) => [...qs, data]);
          setPerDomain((s) => ({
            ...s,
            [data.domain]: {
              target: s[data.domain]?.target ?? 0,
              issued: (s[data.domain]?.issued ?? 0) + 1
            }
          }));
        }
        else if (event === 'warn') setError(data.message);
        else if (event === 'error') setError(data.message);
        else if (event === 'done') setPhase(`Done — ${data.total} question${data.total === 1 ? '' : 's'} created.`);
      });
    } catch (err: any) {
      setError(err?.message || 'Stream failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {!infoUrl && (
        <div className="card border-l-2 border-l-amber-500 p-3 text-[12px]">
          This exam has no <b>Info URL</b>. The blueprint mode scrapes that URL to discover the latest exam objectives.
          Set it on the <a href={`/admin-dashboard/exams/${examId}`} className="text-blue-600 hover:underline">exam edit page</a>.
        </div>
      )}
      {domains.length === 0 && (
        <div className="card border-l-2 border-l-red-500 p-3 text-[12px]">
          This exam has no <b>domains</b> blueprint populated. Add a `[{`{name, weight}`}]` array on the exam first.
        </div>
      )}

      <form onSubmit={submit} className="card grid gap-3 p-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Total questions</span>
          <input type="number" min={10} max={120} value={totalCount} onChange={(e) => setTotalCount(Number(e.target.value) || 60)} className="input-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="input-sm">
            <option value="SINGLE">Single answer</option>
            <option value="MULTI">Multiple answers</option>
            <option value="TRUE_FALSE">True / False</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Difficulty (1-5)</span>
          <input type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(Math.max(1, Math.min(5, Number(e.target.value) || 3)) as any)} className="input-sm" />
        </label>
        <label className="md:col-span-3 inline-flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          Publish immediately (otherwise DRAFT)
        </label>
        <div className="md:col-span-3">
          <button type="submit" disabled={busy || !infoUrl || domains.length === 0}
            className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {busy ? 'Generating…' : `Generate ${totalCount} questions across ${domains.length} domains`}
          </button>
          {phase && <span className="ml-3 text-xs text-slate-500">{phase}</span>}
        </div>
      </form>

      <div className="card p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Domain quotas</h3>
        <table className="mt-2 w-full text-[12px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500"><th className="py-1">Domain</th><th className="py-1 text-right">Weight</th><th className="py-1 text-right">Target</th><th className="py-1 text-right">Generated</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {quotas.map((q) => (
              <tr key={q.name}>
                <td className="py-1">{q.name}</td>
                <td className="py-1 text-right">{q.weight}%</td>
                <td className="py-1 text-right font-medium">{q.target}</td>
                <td className="py-1 text-right">{perDomain[q.name]?.issued ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SourceStreamPanel busy={busy} questions={questions} progress={progress} error={error} />
    </div>
  );
}
