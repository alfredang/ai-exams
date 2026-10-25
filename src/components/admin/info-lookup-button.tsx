'use client';
import { useTransition } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * "Find official page" beside the Exam Info URL field. A plain button (not a
 * submit) so it never becomes the exam form's default Enter action.
 */
export function InfoLookupButton({ examId, action }: { examId: string; action: (fd: FormData) => Promise<void> }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const fd = new FormData();
        fd.set('id', examId);
        start(() => action(fd));
      }}
      title="Search the web for the official vendor exam page and fill this field"
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-violet-300 px-3 text-[12px] font-medium text-violet-700 hover:bg-violet-50 disabled:cursor-wait disabled:opacity-70 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/40"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {pending ? 'Looking up…' : 'Find official page'}
    </button>
  );
}
