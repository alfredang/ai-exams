'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { planAllocation } from '@/lib/question-pool';

type DomainRow = { name: string; weight: number; pool: number };
type GenType = 'MIXED' | 'SINGLE' | 'MULTI' | 'ORDERING' | 'TRUE_FALSE';
type Made = { id: string; stem: string; domain: string };

const ALL = '';

const TYPES: { value: GenType; label: string; hint: string }[] = [
  { value: 'MIXED', label: 'Anything', hint: 'A mix: mostly MCQ, ~1 in 5 multiple select, ~1 in 10 sequencing' },
  { value: 'SINGLE', label: 'MCQ', hint: 'One correct answer out of 4 options' },
  { value: 'MULTI', label: 'Multiple select', hint: '2–3 correct answers out of 5–6 options ("Select TWO")' },
  { value: 'ORDERING', label: 'Sequencing', hint: 'Put 4–6 steps of a procedure in the correct order' },
  { value: 'TRUE_FALSE', label: 'True / False', hint: 'A statement that is either true or false' }
];

/** Mirrors planDomainCounts() on the server: split by blueprint weight. */
function preview(domains: DomainRow[], total: number) {
  const weighted = domains.some((d) => d.weight > 0) ? domains : domains.map((d) => ({ ...d, weight: 1 }));
  return planAllocation(weighted, Object.fromEntries(weighted.map((d) => [d.name, total])), total);
}

/**
 * Generate questions and answers with OpenAI for every exam domain (split by
 * weight) or one domain. Streams from /api/admin/exams/[id]/ai-generate; each
 * valid question is saved as a draft in the review queue — it joins the pool
 * only after an admin approves it.
 */
export function AiQuestionGenerator({
  examId,
  domains,
  configured,
  model,
  reviewHref = '#review'
}: {
  examId: string;
  domains: DomainRow[];
  configured: boolean;
  model: string;
  /** Where "Review them now" goes: the exam page's review queue. */
  reviewHref?: string;
}) {
  const router = useRouter();
  const [count, setCount] = useState(10);
  const [domain, setDomain] = useState(ALL);
  const [type, setType] = useState<GenType>('MIXED');
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<Made[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<number | null>(null);

  const split = useMemo(() => (domain === ALL && domains.length && count > 0 ? preview(domains, count) : {}), [domain, domains, count]);

  async function generate() {
    setError('');
    setCreated(null);
    setWarnings([]);
    setMade([]);
    if (!count || count < 1 || count > 200) return setError('Enter between 1 and 200 questions.');
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/exams/${examId}/ai-generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ count, type, domains: domain === ALL ? [] : [domain] })
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
          else if (event === 'done') setCreated(data.created);
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
        AI generation needs an OpenAI API key. Add it under{' '}
        <Link href="/admin-dashboard/settings/credentials" className="text-blue-600 hover:underline dark:text-blue-400">
          Settings → Credentials
        </Link>
        , then come back here.
      </p>
    );
  }

  const done = made.length;
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-[9rem_1fr_auto] md:items-end">
        <label className="block">
          <span className="label">Number of questions</span>
          <input type="number" min={1} max={200} className="input" value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={busy} />
        </label>
        <label className="block">
          <span className="label">Exam domain</span>
          <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)} disabled={busy || domains.length === 0}>
            <option value={ALL}>All domains (split by exam weight)</option>
            {domains.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.weight}% · {d.pool} in pool)
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {busy ? `Generating… ${done}/${count}` : `Generate ${count || ''} question${count === 1 ? '' : 's'}`}
        </button>
      </div>

      <fieldset disabled={busy}>
        <legend className="label">Question type</legend>
        <div className="flex flex-wrap gap-1.5" role="radiogroup">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={type === t.value}
              title={t.hint}
              onClick={() => setType(t.value)}
              className={`inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium transition disabled:opacity-60 ${
                type === t.value
                  ? 'border-violet-600 bg-violet-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{TYPES.find((t) => t.value === type)?.hint}.</p>
      </fieldset>

      <p className="text-[12px] text-slate-500 dark:text-slate-400">
        {domain === ALL && domains.length > 0 && (
          <>
            Split:{' '}
            {domains.filter((d) => split[d.name]).map((d) => `${d.name} ${split[d.name]}`).join(' · ')}.{' '}
          </>
        )}
        Model <span className="font-mono">{model}</span>. Each question comes with its answer, explanation and references, and is
        saved as a draft for review — nothing reaches learners until you approve it.
      </p>

      {(busy || done > 0) && (
        <div className="h-1.5 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-violet-600 transition-all" style={{ width: `${Math.min(100, (done / Math.max(1, count)) * 100)}%` }} />
        </div>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
      {created !== null && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {created} of {count} question{count === 1 ? '' : 's'} generated and waiting for review.{' '}
          {created > 0 && (
            <a href={reviewHref} className="font-semibold underline">Review them now {reviewHref.startsWith('#') ? '↓' : '→'}</a>
          )}
        </p>
      )}
      {warnings.length > 0 && (
        <details className="text-[12px] text-amber-700 dark:text-amber-400">
          <summary>{warnings.length} warning{warnings.length === 1 ? '' : 's'}</summary>
          <ul className="mt-1 list-disc pl-5">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </details>
      )}
      {made.length > 0 && (
        <ul className="max-h-48 space-y-1 overflow-y-auto text-[12px] text-slate-700 dark:text-slate-300">
          {made.map((q) => (
            <li key={q.id} className="truncate">
              <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">DRAFT</span>
              <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{q.domain}</span>
              {q.stem}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
