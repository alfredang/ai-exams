'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { planAllocation } from '@/lib/question-pool';

type DomainRow = { name: string; weight: number; pool: number };
type GenType = 'MIXED' | 'SINGLE' | 'MULTI' | 'TRUE_FALSE';
type Made = { id: string; stem: string; domain: string };

const TYPES: { value: GenType; label: string }[] = [
  { value: 'MIXED', label: 'Mixed (mostly MCQ, ~1 in 5 multiple select)' },
  { value: 'SINGLE', label: 'MCQ only' },
  { value: 'MULTI', label: 'Multiple select only' },
  { value: 'TRUE_FALSE', label: 'True / False only' }
];

/** Mirrors planDomainCounts() on the server: split by blueprint weight. */
function preview(domains: DomainRow[], total: number) {
  const weighted = domains.some((d) => d.weight > 0) ? domains : domains.map((d) => ({ ...d, weight: 1 }));
  return planAllocation(weighted, Object.fromEntries(weighted.map((d) => [d.name, total])), total);
}

/**
 * AI Assist — bulk-generate questions and answers with OpenAI across all or
 * selected exam domains. Streams from /api/admin/exams/[id]/ai-generate;
 * every valid question is published into the pool as it arrives.
 */
export function AiQuestionGenerator({
  examId,
  domains,
  configured,
  model
}: {
  examId: string;
  domains: DomainRow[];
  configured: boolean;
  model: string;
}) {
  const router = useRouter();
  const [count, setCount] = useState(10);
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const [picked, setPicked] = useState<string[]>([]);
  const [type, setType] = useState<GenType>('MIXED');
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<Made[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');

  const chosen = scope === 'all' ? domains : domains.filter((d) => picked.includes(d.name));
  const split = useMemo(() => (chosen.length && count > 0 ? preview(chosen, count) : {}), [chosen, count]);

  async function generate() {
    setError('');
    setSummary('');
    setWarnings([]);
    setMade([]);
    if (!count || count < 1 || count > 200) return setError('Enter between 1 and 200 questions.');
    if (domains.length && !chosen.length) return setError('Select at least one domain.');
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/exams/${examId}/ai-generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ count, type, domains: scope === 'all' ? [] : picked })
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split('\n\n');
        buf = events.pop() ?? '';
        for (const block of events) {
          const event = /^event: (.*)$/m.exec(block)?.[1];
          const data = JSON.parse(/^data: (.*)$/m.exec(block)?.[1] ?? 'null');
          if (event === 'question') setMade((m) => [{ id: data.id, stem: data.stem, domain: data.domain }, ...m]);
          else if (event === 'warn') setWarnings((w) => [...w, data.message]);
          else if (event === 'error') setError(data.message);
          else if (event === 'done') setSummary(`Added ${data.created} of ${data.requested} questions to the pool.`);
        }
      }
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Generation failed');
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-300">
        AI Assist needs an OpenAI API key. Add it under{' '}
        <Link href="/admin-dashboard/settings/credentials" className="text-blue-600 hover:underline dark:text-blue-400">
          Settings → Credentials
        </Link>
        , then come back here.
      </p>
    );
  }

  const done = made.length;
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="label">Number of questions</span>
          <input type="number" min={1} max={200} className="input" value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={busy} />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Question types</span>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as GenType)} disabled={busy}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
      </div>

      {domains.length > 0 && (
        <div>
          <div className="label">Exam domains</div>
          <div className="mb-2 flex gap-4 text-sm">
            <label className="inline-flex items-center gap-1.5">
              <input type="radio" checked={scope === 'all'} onChange={() => setScope('all')} disabled={busy} /> All domains
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="radio" checked={scope === 'selected'} onChange={() => setScope('selected')} disabled={busy} /> Selected domains
            </label>
          </div>
          <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/40">
                <tr>
                  <th className="px-3 py-2">Domain</th>
                  <th className="px-3 py-2 text-right">Exam %</th>
                  <th className="px-3 py-2 text-right">In pool</th>
                  <th className="px-3 py-2 text-right">Will add</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => {
                  const on = scope === 'all' || picked.includes(d.name);
                  return (
                    <tr key={d.name} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-1.5">
                        <label className="inline-flex items-center gap-2">
                          {scope === 'selected' && (
                            <input
                              type="checkbox"
                              checked={on}
                              disabled={busy}
                              onChange={() => setPicked((p) => (on ? p.filter((x) => x !== d.name) : [...p, d.name]))}
                            />
                          )}
                          <span className={on ? '' : 'text-slate-400'}>{d.name}</span>
                        </label>
                      </td>
                      <td className="px-3 py-1.5 text-right text-slate-500">{d.weight}%</td>
                      <td className="px-3 py-1.5 text-right text-slate-500">{d.pool}</td>
                      <td className="px-3 py-1.5 text-right font-medium">{on ? split[d.name] ?? 0 : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="mr-auto text-[12px] text-slate-500 dark:text-slate-400">
          Model <span className="font-mono">{model}</span>. Questions and answers are checked, then published straight into the pool —
          review them in the list below and edit or delete any you don&apos;t want.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {busy ? `Generating… ${done}/${count}` : `Generate ${count || ''} question${count === 1 ? '' : 's'}`}
        </button>
      </div>

      {(busy || done > 0) && (
        <div className="h-1.5 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-violet-600 transition-all" style={{ width: `${Math.min(100, (done / Math.max(1, count)) * 100)}%` }} />
        </div>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
      {summary && <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">{summary}</p>}
      {warnings.length > 0 && (
        <details className="text-[12px] text-amber-700 dark:text-amber-400">
          <summary>{warnings.length} warning{warnings.length === 1 ? '' : 's'}</summary>
          <ul className="mt-1 list-disc pl-5">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </details>
      )}
      {made.length > 0 && (
        <ul className="max-h-64 space-y-1 overflow-y-auto text-[12px] text-slate-700 dark:text-slate-300">
          {made.map((q) => (
            <li key={q.id} className="truncate">
              <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{q.domain}</span>
              {q.stem}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
