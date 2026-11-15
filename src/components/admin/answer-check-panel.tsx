'use client';
import { useCallback, useEffect, useState } from 'react';
import { Pause, Play, ShieldCheck } from 'lucide-react';

type Run = { running: boolean; examId: string | null; startedAt: string | null; checked: number; fixed: number; unsure: number; lastError: string | null };
type Progress = { total: number; checked: number; fixed: number; unsure: number };

/**
 * AI answer-key check (OpenAI gpt-6.1-sol) over every published question — all
 * banks, or one when `examId` is given. Runs in the background on the server
 * (src/lib/answer-check-job.ts) and survives redeploys; this panel shows its
 * progress and starts / stops it.
 */
export function AnswerCheckPanel({
  examId,
  initial,
  configured,
  fixedHref,
  unsureHref
}: {
  examId?: string;
  initial: Progress;
  /** An OpenAI API key is saved. */
  configured: boolean;
  fixedHref?: string;
  unsureHref?: string;
}) {
  const [progress, setProgress] = useState<Progress>(initial);
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const qs = examId ? `?examId=${encodeURIComponent(examId)}` : '';

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/admin/answer-check${qs}`, { cache: 'no-store' }).catch(() => null);
    const j = res?.ok ? await res.json() : null;
    if (j) {
      setRun(j.run);
      setProgress(j.progress);
    }
  }, [qs]);

  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (!run?.running) return;
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [run?.running, refresh]);

  async function act(action: 'start' | 'stop') {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/answer-check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, examId: examId ?? null })
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || `Request failed (${res.status})`);
      setRun(j.run);
      setProgress(j.progress);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  }

  const left = Math.max(0, progress.total - progress.checked);
  const pct = progress.total ? Math.round((progress.checked / progress.total) * 100) : 100;
  const otherScope = run?.running && (run.examId ?? null) !== (examId ?? null);

  return (
    <section className="card p-4" aria-labelledby="answer-check-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="answer-check-title" className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" /> Answer-key check
          </h2>
          <p className="text-xs text-slate-500">
            AI (OpenAI gpt-6.1-sol) answers every published question{examId ? ' in this bank' : ''} on its own, fixes the key only when it is
            certain the stored one is wrong, and rewrites the explanation for the right answer. Unsure cases are left as they are and flagged.
          </p>
        </div>
        {configured &&
          (run?.running && !otherScope ? (
            <button type="button" onClick={() => act('stop')} disabled={busy} className="btn-secondary inline-flex h-10 items-center gap-1.5 px-4 text-[13px]">
              <Pause className="h-4 w-4" /> Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => act('start')}
              disabled={busy || left === 0 || !!otherScope}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-sky-600 px-4 text-[13px] font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" /> {left === 0 ? 'All checked' : `Check ${left.toLocaleString()} question${left === 1 ? '' : 's'}`}
            </button>
          ))}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-sky-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600 dark:text-slate-300">
        <span>
          <strong>{progress.checked.toLocaleString()}</strong> of {progress.total.toLocaleString()} checked ({pct}%)
        </span>
        <span>
          {fixedHref && progress.fixed ? <a href={fixedHref} className="text-amber-700 underline dark:text-amber-400">{progress.fixed.toLocaleString()} keys corrected</a> : `${progress.fixed.toLocaleString()} keys corrected`}
        </span>
        <span>
          {unsureHref && progress.unsure ? <a href={unsureHref} className="text-rose-700 underline dark:text-rose-400">{progress.unsure.toLocaleString()} AI unsure</a> : `${progress.unsure.toLocaleString()} AI unsure`}
        </span>
        {run?.running && (
          <span className="font-medium text-sky-700 dark:text-sky-300">
            Running{otherScope ? (run.examId ? ' on another bank' : ' on all banks') : ''} — {run.checked.toLocaleString()} this run
          </span>
        )}
      </div>
      {!configured && <p className="mt-2 text-[12px] text-slate-500">Add an OpenAI API key under Settings → Credentials to run the check.</p>}
      {(error || run?.lastError) && (
        <p className="mt-2 text-[12px] text-rose-700 dark:text-rose-400" role="alert">
          {error || run?.lastError}
        </p>
      )}
    </section>
  );
}
