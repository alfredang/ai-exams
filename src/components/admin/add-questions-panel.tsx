'use client';
import { useState, type ReactNode } from 'react';
import { PenLine, Sparkles } from 'lucide-react';

type Mode = 'manual' | 'ai';

/**
 * The question bank's two ways to add questions: type one in manually, or
 * bulk-generate with AI Assist. Closed until the admin picks one.
 */
export function AddQuestionsPanel({ manual, ai, defaultMode }: { manual: ReactNode; ai: ReactNode; defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode | null>(defaultMode ?? null);
  const tab = (m: Mode, icon: ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(mode === m ? null : m)}
      aria-pressed={mode === m}
      className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium transition ${
        mode === m
          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
          : 'border-slate-200 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
  return (
    <div className="mt-4 rounded-md border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] font-semibold text-slate-800 dark:text-slate-100">Add questions:</span>
        {tab('manual', <PenLine className="h-3.5 w-3.5" />, 'Add manually')}
        {tab('ai', <Sparkles className="h-3.5 w-3.5" />, 'AI Assist — bulk generate')}
      </div>
      {mode && <div className="mt-4">{mode === 'manual' ? manual : ai}</div>}
    </div>
  );
}
