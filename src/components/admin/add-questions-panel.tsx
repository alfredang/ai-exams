'use client';
import { useState, type ReactNode } from 'react';
import { PenLine } from 'lucide-react';

/**
 * The question pool's "Add questions" bar: type one in manually (opens the
 * form here), or open the AI generator pop-up (`ai` is its trigger button).
 */
export function AddQuestionsPanel({ manual, ai, defaultOpen }: { manual: ReactNode; ai: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/20">
      <div className="flex flex-wrap items-center gap-3">
        <span className="mr-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Add questions:</span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-pressed={open}
          className={`inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium text-white shadow-sm transition ${open ? 'bg-blue-800 ring-2 ring-blue-300 dark:ring-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          <PenLine className="h-4 w-4" />
          {open ? 'Close manual form' : 'Add manually'}
        </button>
        {ai}
        <span className="text-xs text-slate-500">AI questions arrive as drafts in the review queue; nothing reaches learners until you approve it.</span>
      </div>
      {open && <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">{manual}</div>}
    </div>
  );
}
