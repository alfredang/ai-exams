'use client';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, X } from 'lucide-react';
import { planAllocation } from '@/lib/question-pool';

export type GeneratorExam = {
  id: string;
  code: string;
  title: string;
  vendor: string;
  drafts: number;
  domains: { name: string; weight: number; pool: number }[];
};
type Kind = 'SINGLE' | 'MULTI' | 'ORDERING';
type Made = { id: string; stem: string; domain: string };

const KINDS: { value: Kind; label: string; hint: string }[] = [
  { value: 'SINGLE', label: 'MCQ', hint: 'one correct answer of 4' },
  { value: 'MULTI', label: 'Multiple select', hint: '2–3 correct of 5–6, "Select TWO"' },
  { value: 'ORDERING', label: 'Sequencing', hint: 'put 4–6 steps in order' }
];

/** Mirrors planDomainCounts() on the server: split by blueprint weight. */
function preview(domains: GeneratorExam['domains'], total: number): Record<string, number> {
  if (!domains.length || total < 1) return {};
  const weighted = domains.some((d) => d.weight > 0) ? domains : domains.map((d) => ({ ...d, weight: 1 }));
  return planAllocation(weighted, Object.fromEntries(weighted.map((d) => [d.name, total])), total);
}

/**
 * "AI Generate" button + pop-up form: exam (when more than one is offered),
 * number of questions, question types (all, or any of MCQ / Multiple select /
 * Sequencing) and exam domains (all, or any). Streams from
 * /api/admin/exams/[id]/ai-generate; every valid question is saved as a draft
 * in that question bank's review queue and joins the pool only once approved.
 */
export function AiGenerateDialog({
  exams,
  initialExamId,
  defaultOpen = false,
  configured,
  providers
}: {
  exams: GeneratorExam[];
  initialExamId?: string;
  defaultOpen?: boolean;
  configured: boolean;
  /** Provider chain for the footer, e.g. "OpenAI gpt-6.1-sol → DeepSeek deepseek-flash". */
  providers: string;
}) {
  const router = useRouter();
  const single = exams.length === 1;
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false); // portal target exists only in the browser
  useEffect(() => setMounted(true), []);
  const [examId, setExamId] = useState(single ? exams[0].id : exams.some((e) => e.id === initialExamId) ? initialExamId! : '');
  const [filter, setFilter] = useState('');
  const [count, setCount] = useState(10);
  const [allTypes, setAllTypes] = useState(true);
  const [kinds, setKinds] = useState<Kind[]>([]);
  const [allDomains, setAllDomains] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<Made[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<number | null>(null);

  const exam = exams.find((e) => e.id === examId);
  const domains = exam?.domains ?? [];
  const chosen = allDomains ? domains : domains.filter((d) => picked.includes(d.name));
  const split = useMemo(() => preview(chosen, count), [chosen, count]);
  const shownExams = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const list = needle ? exams.filter((e) => `${e.vendor} ${e.code} ${e.title}`.toLowerCase().includes(needle)) : exams;
    return exam && !list.includes(exam) ? [exam, ...list] : list;
  }, [filter, exams, exam]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy]);

  function pickExam(id: string) {
    setExamId(id);
    setAllDomains(true);
    setPicked([]);
    setMade([]);
    setCreated(null);
  }

  function toggleKind(k: Kind) {
    if (allTypes) {
      setAllTypes(false);
      setKinds([k]);
    } else setKinds((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));
  }

  function toggleDomain(name: string) {
    if (allDomains) {
      setAllDomains(false);
      setPicked([name]);
    } else setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));
  }

  async function generate() {
    setError('');
    setCreated(null);
    setWarnings([]);
    setMade([]);
    if (!exam) return setError('Select an exam.');
    if (!count || count < 1 || count > 200) return setError('Enter between 1 and 200 questions.');
    if (!allTypes && !kinds.length) return setError('Tick at least one question type, or choose All types.');
    if (!allDomains && !picked.length) return setError('Tick at least one exam domain, or choose All exam domains.');
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}/ai-generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ count, types: allTypes ? [] : kinds, domains: allDomains ? [] : picked })
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

  const chip = (on: boolean) =>
    `inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-[13px] transition ${
      on
        ? 'border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200'
        : 'border-slate-200 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200'
    }`;
  const done = made.length;

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && setOpen(false)}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="ai-gen-title" className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h2 id="ai-gen-title" className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            AI Generate questions &amp; answers
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={busy}
            aria-label="Close"
            className="rounded p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!configured ? (
          <p className="px-5 py-6 text-sm text-slate-600 dark:text-slate-300">
            AI generation needs at least one AI key (OpenAI, DeepSeek or MiniMax). Add it under{' '}
            <Link href="/admin-dashboard/settings/credentials" className="text-blue-600 hover:underline dark:text-blue-400">
              Settings → Credentials
            </Link>
            .
          </p>
        ) : (
          <fieldset disabled={busy} className="grid gap-5 px-5 py-4">
            {single ? (
              <p className="text-[13px] text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{exam!.code}</span> — {exam!.title}
              </p>
            ) : (
              <div>
                <span className="label">Exam</span>
                <div className="grid gap-2 sm:grid-cols-[12rem_1fr]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter" aria-label="Filter exams" className="input pl-8" />
                  </div>
                  <select className="input" value={examId} onChange={(e) => pickExam(e.target.value)} aria-label="Exam">
                    <option value="">Select an exam… ({shownExams.length})</option>
                    {[...new Set(shownExams.map((e) => e.vendor))].map((v) => (
                      <optgroup key={v} label={v}>
                        {shownExams.filter((e) => e.vendor === v).map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.code} — {e.title}
                            {e.drafts ? ` · ${e.drafts} awaiting review` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <label className="block max-w-[12rem]">
              <span className="label"># of questions</span>
              <input type="number" min={1} max={200} className="input" value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </label>

            <div>
              <span className="label">Question types</span>
              <div className="flex flex-wrap gap-2">
                <label className={chip(allTypes)}>
                  <input type="radio" checked={allTypes} onChange={() => setAllTypes(true)} /> All types
                </label>
                {KINDS.map((k) => (
                  <label key={k.value} className={chip(!allTypes && kinds.includes(k.value))} title={k.hint}>
                    <input type="checkbox" checked={!allTypes && kinds.includes(k.value)} onChange={() => toggleKind(k.value)} />
                    {k.label}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                {allTypes
                  ? 'A mix: mostly MCQ, about 1 in 5 multiple select, about 1 in 10 sequencing.'
                  : kinds.length
                    ? KINDS.filter((k) => kinds.includes(k.value)).map((k) => `${k.label}: ${k.hint}`).join(' · ')
                    : 'Tick one or more types.'}
              </p>
            </div>

            <div>
              <span className="label">Exam domains</span>
              {!exam ? (
                <p className="text-[12px] text-slate-500">Select an exam first.</p>
              ) : domains.length === 0 ? (
                <p className="text-[12px] text-slate-500">This question bank has no domain blueprint — questions are tagged &quot;General&quot;.</p>
              ) : (
                <>
                  <label className={`${chip(allDomains)} mb-2`}>
                    <input type="radio" checked={allDomains} onChange={() => setAllDomains(true)} /> All exam domains (split by exam weight)
                  </label>
                  <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                    {domains.map((d) => {
                      const on = allDomains || picked.includes(d.name);
                      return (
                        <li key={d.name}>
                          <label className="flex min-h-10 cursor-pointer items-center gap-2 px-3 py-1.5 text-[13px]">
                            <input type="checkbox" checked={!allDomains && picked.includes(d.name)} onChange={() => toggleDomain(d.name)} />
                            <span className={`flex-1 ${on ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>{d.name}</span>
                            <span className="hidden text-right text-[12px] text-slate-500 sm:inline">{d.weight}% · {d.pool} in pool</span>
                            <span className="w-10 text-right text-[12px] font-semibold text-violet-700 dark:text-violet-300">{on ? `+${split[d.name] ?? 0}` : ''}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </fieldset>
        )}

        {configured && (
          <div className="grid gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
            {(busy || done > 0) && (
              <div className="h-1.5 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                <div className="h-full bg-violet-600 transition-all" style={{ width: `${Math.min(100, (done / Math.max(1, count)) * 100)}%` }} />
              </div>
            )}
            {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
            {created !== null && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
                {created} of {count} question{count === 1 ? '' : 's'} generated and waiting for review.
              </p>
            )}
            {warnings.length > 0 && (
              <details className="text-[12px] text-amber-700 dark:text-amber-400">
                <summary>{warnings.length} warning{warnings.length === 1 ? '' : 's'}</summary>
                <ul className="mt-1 list-disc pl-5">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </details>
            )}
            {made.length > 0 && (
              <ul className="max-h-40 space-y-1 overflow-y-auto text-[12px] text-slate-700 dark:text-slate-300">
                {made.map((q) => (
                  <li key={q.id} className="truncate">
                    <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{q.domain}</span>
                    {q.stem}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <p className="mr-auto text-[11px] text-slate-500 dark:text-slate-400">
                AI: <span className="font-mono">{providers}</span>. Saved as drafts — nothing reaches learners until you approve it.
              </p>
              {exam && created !== null && created > 0 && (
                <a
                  href={`/admin-dashboard/exams/${exam.id}#review`}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center rounded-md bg-amber-500 px-4 text-[13px] font-medium text-white hover:bg-amber-600"
                >
                  Review {created} draft{created === 1 ? '' : 's'} →
                </a>
              )}
              <button
                type="button"
                onClick={generate}
                disabled={busy || !exam}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {busy ? `Generating… ${done}/${count}` : `Generate ${count || ''} question${count === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-1.5 rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white hover:bg-violet-700"
      >
        <Sparkles className="h-3.5 w-3.5" /> AI Generate
      </button>
      {/* Portalled: the admin header's backdrop-blur would trap a fixed overlay. */}
      {open && mounted && createPortal(dialog, document.body)}
    </>
  );
}
