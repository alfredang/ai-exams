'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import type { GenerationRequestRow } from '@/lib/generation-requests';

const STATUS: Record<GenerationRequestRow['status'], { label: string; cls: string }> = {
  QUEUED: { label: 'Queued', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' },
  RUNNING: { label: 'Running', cls: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200' },
  DONE: { label: 'Done', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' },
  FAILED: { label: 'Failed', cls: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300' }
};
const SOURCE_LABEL: Record<string, string> = { YOUTUBE: 'YouTube', URL: 'Web / GitHub link', PDF: 'PDF', EPUB: 'EPUB' };
const active = (r: GenerationRequestRow) => r.status === 'QUEUED' || r.status === 'RUNNING';

/**
 * "Agent requests": the AI Q&A Generator requests queued for the local AI
 * agents (no OpenAI API key saved) and how far each has got. Refreshes every
 * 8 s while one is queued or running, and when the dialog queues a new one.
 */
export function GenerationRequestsPanel({ initial, examId }: { initial: GenerationRequestRow[]; examId?: string }) {
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState('');
  useEffect(() => setRows(initial), [initial]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/generation-requests${examId ? `?examId=${encodeURIComponent(examId)}` : ''}`, { cache: 'no-store' }).catch(() => null);
    const j = await res?.json().catch(() => null);
    if (res?.ok && Array.isArray(j?.requests)) setRows(j.requests);
  }, [examId]);

  const busy = rows.some(active);
  useEffect(() => {
    window.addEventListener('generation-requests:changed', load);
    return () => window.removeEventListener('generation-requests:changed', load);
  }, [load]);
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 8000);
    return () => clearInterval(t);
  }, [busy, load]);

  async function cancel(id: string) {
    setError('');
    const res = await fetch(`/api/admin/generation-requests/${id}`, { method: 'DELETE' });
    if (!res.ok) setError((await res.json().catch(() => null))?.error ?? 'Could not cancel that request.');
    load();
  }

  if (!rows.length) return null;
  return (
    <section id="agent-requests" className="card scroll-mt-24 p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" /> Agent requests
      </h2>
      <p className="text-xs text-slate-500">
        Requests queued from AI Generate while no OpenAI API key is saved. The agent computer picks them up every few minutes: gpt-6.1-sol
        writes, Claude Opus checks each answer, and only questions both agree on are published.
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
                {r.created} published{r.dropped ? ` · ${r.dropped} not published` : ''}
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
                <Link href={`/admin-dashboard/exams/${r.examId}#questions`} className="admin-link">
                  View questions →
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
  );
}
