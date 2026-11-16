'use client';
import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { deleteUser } from '@/app/admin-dashboard/users/actions';

/**
 * Delete a customer account, behind a confirm dialog (a native <dialog>, so
 * the table's overflow can't clip it). `variant="icon"` is the users list
 * row button; `variant="button"` is the full-width one on the user page.
 */
export function DeleteUserButton({
  userId,
  email,
  name,
  returnTo,
  variant = 'icon'
}: {
  userId: string;
  email: string;
  name?: string | null;
  returnTo?: string;
  variant?: 'icon' | 'button';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => ref.current?.showModal()}
          aria-label={`Delete ${email}`}
          title="Delete user"
          className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 transition hover:bg-red-50 hover:text-red-700 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.showModal()}
          className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-md bg-red-600 px-2 text-xs font-medium text-white hover:bg-red-700"
        >
          <Trash2 className="h-3 w-3" /> Delete user
        </button>
      )}
      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
        className="w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-line bg-white p-0 text-left text-ink shadow-xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <form action={deleteUser} className="p-5">
          <input type="hidden" name="id" value={userId} />
          <input type="hidden" name="returnTo" value={returnTo ?? ''} />
          <h2 className="text-base font-semibold">Delete this user?</h2>
          <p className="mt-1.5 break-words text-sm text-slate-600 dark:text-slate-300">
            <b>{name || email}</b>
            {`${name ? ` (${email})` : ''} will be permanently deleted, with their exam access, attempts and results. This can't be undone.`}
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => ref.current?.close()} className="btn-sm-quiet">Cancel</button>
            <Confirm />
          </div>
        </form>
      </dialog>
    </>
  );
}

function Confirm() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="btn-sm inline-flex items-center gap-1.5 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" /> {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
