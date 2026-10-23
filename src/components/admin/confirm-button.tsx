'use client';
import { useState, type ReactNode, type MouseEvent } from 'react';

/**
 * A button that wraps a form-submit action with a confirmation prompt.
 * Drop into a `<form action={...}>` — the inner `<button type="submit">`
 * is only fired after the user confirms.
 */
export function ConfirmButton({
  message,
  children,
  className,
  disabled,
  title,
  variant = 'danger'
}: {
  message: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  title?: string;
  variant?: 'danger' | 'neutral' | 'primary';
}) {
  const [armed, setArmed] = useState(false);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!armed) {
      e.preventDefault();
      const ok = typeof window !== 'undefined' && window.confirm(message);
      if (!ok) return;
      setArmed(true);
      // re-submit via the form: find the closest form and submit it
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit(e.currentTarget);
    }
  }

  const base =
    'inline-flex h-6 items-center justify-center rounded px-2 text-xs font-medium transition';
  const variantCls =
    variant === 'danger'
      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 disabled:text-slate-400 dark:disabled:text-slate-600'
      : variant === 'primary'
        ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40'
        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800';

  return (
    <button
      type="submit"
      disabled={disabled}
      title={title}
      onClick={handleClick}
      className={`${base} ${variantCls} disabled:cursor-not-allowed ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
