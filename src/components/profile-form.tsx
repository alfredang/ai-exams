'use client';

import { useState, useTransition } from 'react';
import { NATIONALITIES } from '@/lib/nationalities';

export type ProfileState = { ok?: boolean; error?: string };

// Submitted via onSubmit, not <form action>: React 19 resets the form after an
// action, and that snapped the nationality <select> back to its initial value,
// so a successful save looked like it had done nothing.
export function ProfileForm({
  action,
  email,
  initialName,
  initialNationality,
  footer
}: {
  action: (formData: FormData) => Promise<ProfileState>;
  email: string;
  initialName: string;
  initialNationality: string;
  footer: string;
}) {
  const [state, setState] = useState<ProfileState>({});
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [nationality, setNationality] = useState(initialNationality);

  return (
    <form
      className="mt-4 space-y-4"
      onChange={() => state.ok && setState({})}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          try {
            setState(await action(formData));
          } catch {
            setState({ error: 'Could not save. Try again.' });
          }
        });
      }}
    >
      <div>
        <label className="label">Name</label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="input"
          maxLength={120}
        />
      </div>

      <div>
        <label className="label">Email</label>
        <input value={email} disabled className="input cursor-not-allowed opacity-70" />
        <p className="mt-1 text-xs text-slate-500">Email is used to sign in and cannot be changed here.</p>
      </div>

      <div>
        <label className="label">Nationality</label>
        <select
          name="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          className="input"
        >
          <option value="">Select nationality…</option>
          {NATIONALITIES.map((n) => (
            <option key={n.code} value={n.code}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500">{footer}</span>
        <div className="flex items-center gap-3">
          {!pending && state.ok && (
            <span role="status" className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Saved
            </span>
          )}
          {!pending && state.error && (
            <span role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {state.error}
            </span>
          )}
          <button className="btn-primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
