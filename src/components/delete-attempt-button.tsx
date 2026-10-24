'use client';
import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { deleteAttempt } from '@/app/user-dashboard/actions';

// Trash button on an attempt row. Opens a modal confirm (a native <dialog>,
// so the history card's overflow-hidden can't clip it) before the server
// action removes the attempt.
export function DeleteAttemptButton({ attemptId, label }: { attemptId: string; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={`Delete ${label}`}
        title="Delete attempt"
        className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-700 dark:text-slate-500 dark:hover:bg-red-950/50 dark:hover:text-red-300"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
        className="w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <form action={deleteAttempt} className="p-5">
          <input type="hidden" name="attemptId" value={attemptId} />
          <h2 className="text-base font-semibold">Delete this attempt?</h2>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            {`Your ${label} will be removed from your history, along with its score and answers. This can't be undone.`}
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => ref.current?.close()} className="btn-outline text-sm">Cancel</button>
            <ConfirmButton />
          </div>
        </form>
      </dialog>
    </>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" /> {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
