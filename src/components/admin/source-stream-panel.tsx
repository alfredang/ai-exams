'use client';
import { useState } from 'react';
import { Check, Trash2, Loader2 } from 'lucide-react';

export type GenQuestion = {
  id: string;
  stem: string;
  type: string;
  options: { id: string; text: string }[];
  correct: string[];
  explanation: string;
  domain: string;
  difficulty: number;
};

type StatusByQ = Record<string, 'idle' | 'approving' | 'approved' | 'discarding' | 'discarded'>;

/**
 * Reusable streaming panel: shows phase/progress + per-question Approve/Discard
 * actions. The caller drives the SSE fetch and pushes events through `events`.
 */
export function SourceStreamPanel({
  busy,
  questions,
  progress,
  error
}: {
  busy: boolean;
  questions: GenQuestion[];
  progress?: { i: number; of: number } | null;
  error?: string | null;
}) {
  const [status, setStatus] = useState<StatusByQ>({});

  async function approve(id: string) {
    setStatus((s) => ({ ...s, [id]: 'approving' }));
    const r = await fetch(`/api/admin/questions/${id}/approve`, { method: 'POST' });
    setStatus((s) => ({ ...s, [id]: r.ok ? 'approved' : 'idle' }));
  }
  async function discard(id: string) {
    setStatus((s) => ({ ...s, [id]: 'discarding' }));
    const r = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    setStatus((s) => ({ ...s, [id]: r.ok ? 'discarded' : 'idle' }));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-[12px] text-slate-600 dark:text-slate-300">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy && progress && <span>Chunk {progress.i} of {progress.of}…</span>}
        {!busy && questions.length > 0 && <span>{questions.length} question{questions.length === 1 ? '' : 's'} streamed. Approve the ones to keep.</span>}
        {error && <span className="text-red-600">{error}</span>}
      </div>
      {questions.length === 0 && !busy && !error && (
        <p className="text-[12px] text-slate-500">Submit the form above to start generating.</p>
      )}
      <ol className="space-y-2">
        {questions.map((q, i) => {
          const st = status[q.id] || 'idle';
          const done = st === 'approved' || st === 'discarded';
          return (
            <li
              key={q.id}
              className={`card p-3 transition ${
                st === 'approved' ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-700 dark:bg-emerald-950/20' :
                st === 'discarded' ? 'border-red-300 bg-red-50/60 opacity-60 dark:border-red-800 dark:bg-red-950/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">
                    Q{i + 1} · {q.type} · {q.domain} · D{q.difficulty}
                  </div>
                  <div className="mt-1 text-[13px] font-medium">{q.stem}</div>
                  <ul className="mt-1 space-y-0.5 text-[12px]">
                    {q.options.map((o, oi) => (
                      <li key={`${oi}-${o.id}`} className={q.correct.includes(o.id) ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}>
                        {q.correct.includes(o.id) ? '✓ ' : '○ '}
                        {o.text}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-xs text-slate-500"><b>Why:</b> {q.explanation}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => approve(q.id)}
                    disabled={done || st === 'approving'}
                    className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {st === 'approving' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    {st === 'approved' ? 'Approved' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => discard(q.id)}
                    disabled={done || st === 'discarding'}
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    {st === 'discarding' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    {st === 'discarded' ? 'Discarded' : 'Discard'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * SSE helper: parses `event: x\ndata: {...}` chunks. Calls onEvent(type, data)
 * for each parsed frame.
 */
export async function consumeSSE(
  res: Response,
  onEvent: (type: string, data: any) => void
) {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let event = 'message';
      let dataStr = '';
      for (const line of frame.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim();
        else if (line.startsWith('data: ')) dataStr += line.slice(6);
      }
      if (dataStr) {
        try { onEvent(event, JSON.parse(dataStr)); } catch { /* ignore */ }
      }
    }
  }
}
