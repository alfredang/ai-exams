'use client';
import { useState, type ReactNode } from 'react';
import { PenLine, Sparkles } from 'lucide-react';

/**
 * The question pool's "Add questions" bar: type one in manually (opens the
 * form here), or jump to the AI generator at the top of the page.
 */
export function AddQuestionsPanel({ manual, aiHref, defaultOpen }: { manual: ReactNode; aiHref: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const cls = 'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium transition';
  const idle = 'border-slate-200 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200';
  return (
    <div className="mt-4 rounded-md border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] font-semibold text-slate-800 dark:text-slate-100">Add questions:</span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-pressed={open}
          className={`${cls} ${open ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : idle}`}
        >
          <PenLine className="h-3.5 w-3.5" />
          Add manually
        </button>
        <a href={aiHref} className={`${cls} ${idle}`}>
          <Sparkles className="h-3.5 w-3.5" />
          Generate with AI ↑
        </a>
      </div>
      {open && <div className="mt-4">{manual}</div>}
    </div>
  );
}
