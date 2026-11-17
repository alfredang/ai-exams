'use client';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import type { GenerationRequestRow } from '@/lib/generation-requests';
import { QuestionFlow, type FlowActivity } from '@/components/admin/question-flow';

const STATUS: Record<GenerationRequestRow['status'], { label: string; cls: string }> = {
  QUEUED: { label: 'Queued', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' },
  RUNNING: { label: 'Running', cls: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200' },
  DONE: { label: 'Done', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' },
  FAILED: { label: 'Failed', cls: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300' }
};
const SOURCE_LABEL: Record<string, string> = { YOUTUBE: 'YouTube', URL: 'Web / GitHub link', PDF: 'PDF', EPUB: 'EPUB' };
const active = (r: GenerationRequestRow) => r.status === 'QUEUED' || r.status === 'RUNNING';

/** How long a finished run keeps the "done" state on the step cards. */
const DONE_SHOW_MS = 90_000;

/** The step-card animation for the newest request that is queued, running or just finished. */
export function flowActivity(rows: GenerationRequestRow[], now: number): FlowActivity | null {
  const r = rows.find(active) ?? rows.find((x) => x.status === 'DONE' && x.finishedAt && now - Date.parse(x.finishedAt) < DONE_SHOW_MS);
  if (!r) return null;
  const base = { exam: r.examCode, done: r.created, total: r.count, autoPublish: r.autoPublish };
  if (r.status === 'DONE') return { ...base, step: 4, label: 'Done' };
  if (r.status === 'QUEUED') return { ...base, step: 1, label: `Source ready for ${r.examCode} · waiting for the AI agents` };
  return { ...base, step: 2, label: r.phase ?? 'Writing questions' };
}

/**
 * The generator page's live area: the three step cards (animated while a
 * request runs) and "Agent requests" — the requests queued for the local AI
 * agents (no OpenAI API key saved) and how far each has got. Refreshes every
 * 5 s while one is queued or running, and when the dialog queues a new one.
 */
export function GeneratorBoard({
  initial,
  examId,
  generate,
  published,
  agents,
  review
}: {
  initial: GenerationRequestRow[];
  examId?: string;
  generate: ReactNode;
  published: number;
  agents: boolean;
  review?: { count: number; href: string };
}) {
  const [rows, setRows] = useState(initial);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');
  useEffect(() => setRows(initial), [initial]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/generation-requests${examId ? `?examId=${encodeURIComponent(examId)}` : ''}`, { cache: 'no-store' }).catch(() => null);
    const j = await res?.json().catch(() => null);
    if (res?.ok && Array.isArray(j?.requests)) setRows(j.requests);
    setNow(Date.now());
  }, [examId]);

  const busy = rows.some(active);
  useEffect(() => {
    window.addEventListener('generation-requests:changed', load);
    return () => window.removeEventListener('generation-requests:changed', load);
  }, [load]);
  const activity = flowActivity(rows, now);
  const live = busy || !!activity;
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 5000);
    return () => clearInterval(t);
  }, [live, load]);

  async function cancel(id: string) {
    setError('');
    const res = await fetch(`/api/admin/generation-requests/${id}`, { method: 'DELETE' });
    if (!res.ok) setError((await res.json().catch(() => null))?.error ?? 'Could not cancel that request.');
    load();
  }

  return (
    <>
      <QuestionFlow published={published} agents={agents} review={review} generate={generate} activity={activity} />
      {rows.length > 0 && (
    <section id="agent-requests" className="card scroll-mt-24 p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" /> Agent requests
      </h2>
      <p className="text-xs text-slate-500">
        Requests started from Get sources while no OpenAI API key is saved. The agent computer picks them up every few minutes: gpt-6.1-sol
        writes, Claude Opus checks each answer, and only questions both agree on are published (or saved for review).
      </p>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
      <ul className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-800">
        {rows.map((r) => (
          <li key={r.id} className="grid gap-1 py-2 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <span className={`mr-2 rounded px-1.5 py-0.5 text-[11px] font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
              <span className="font-medium">{r.examCode}</span>
              <span className="text-slate-500">
                {' '}
                · {r.mode === 'extract' ? `extract up to ${r.count}` : `generate ${r.count}`}
                {r.source ? ` from ${SOURCE_LABEL[r.source.kind] ?? r.source.kind}: ${r.source.label}` : ' by exam domain'}
              </span>
              <div className="text-[12px] text-slate-500">
                {r.created} {r.autoPublish ? 'published' : 'saved for review'}
                {r.dropped ? ` · ${r.dropped} dropped` : ''}
                {r.autoPublish ? '' : ' · review first'}
                {r.status === 'RUNNING' && r.phase ? ` · ${r.phase}…` : ''}
                {r.status === 'QUEUED' ? ' · waiting for the agent computer' : ''}
                {' · '}
                {new Date(r.createdAt).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              {r.error && <div className="text-[12px] text-red-700 dark:text-red-400">{r.error}</div>}
              {r.notes.length > 0 && (
                <details className="text-[12px] text-amber-700 dark:text-amber-400">
                  <summary>{r.notes.length} note{r.notes.length === 1 ? '' : 's'}</summary>
                  <ul className="mt-1 list-disc pl-5">{r.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </details>
              )}
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              {r.created > 0 && (
                <Link href={`/admin-dashboard/exams/${r.examId}${r.autoPublish ? '' : '?qstatus=DRAFT'}#questions`} className="admin-link">
                  {r.autoPublish ? 'View questions →' : 'Review and publish →'}
                </Link>
              )}
              {active(r) && (
                <button type="button" onClick={() => cancel(r.id)} className="btn-sm-quiet">
                  Cancel
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
      )}
    </>
  );
}
