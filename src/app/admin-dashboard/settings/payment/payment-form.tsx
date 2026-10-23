'use client';
import { useState } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import type { FieldDef, SettingsGroup } from '../groups';

type Initial = Record<string, { configured: boolean; preview: string; current: string }>;

type Props = {
  fulfillmentFields: FieldDef[];
  providerGroups: SettingsGroup[];
  initial: Initial;
};

export default function PaymentForm({ fulfillmentFields, providerGroups, initial }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');
  // PayPal expanded by default; others collapsed.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(providerGroups.map((g, i) => [g.slug, i === 0]))
  );

  function toggleGroup(slug: string) {
    setOpenGroups((s) => ({ ...s, [slug]: !s[slug] }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) if (v !== '') payload[k] = v;
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    if (res.ok) {
      setMsg('Saved.');
      setValues({});
      setTimeout(() => location.reload(), 600);
    } else {
      setMsg('Save failed.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {/* Fulfillment block — applies to all providers */}
      <div className="card p-4">
        <h2 className="text-base font-semibold">Fulfillment</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Applies to voucher delivery across all payment providers.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {fulfillmentFields.map((f) => renderField(f, values, setValues, revealed, setRevealed, initial))}
        </div>
      </div>

      {/* Provider subgroups (collapsible) */}
      {providerGroups.map((g) => {
        const isOpen = !!openGroups[g.slug];
        return (
          <div key={g.slug} className="card p-4">
            <button
              type="button"
              onClick={() => toggleGroup(g.slug)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={isOpen}
            >
              <h2 className="text-base font-semibold">{g.title}</h2>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {g.fields.map((f) => renderField(f, values, setValues, revealed, setRevealed, initial))}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {msg && <span className="text-sm text-slate-500">{msg}</span>}
      </div>
    </form>
  );
}

function renderField(
  f: FieldDef,
  values: Record<string, string>,
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  revealed: Record<string, boolean>,
  setRevealed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  initial: Initial
) {
  const info = initial[f.key];
  const touched = values[f.key] !== undefined;
  const isRevealed = !!revealed[f.key];
  const hasStored = !!info?.configured;

  const displayValue = touched
    ? values[f.key]
    : f.secret
    ? hasStored
      ? isRevealed
        ? info!.current
        : info!.preview
      : ''
    : info?.current ?? '';

  const placeholder = !hasStored ? f.placeholder || '' : '';

  const colSpan = f.fullWidth ? 'sm:col-span-2' : '';

  return (
    <div key={f.key} className={`text-sm ${colSpan}`}>
      <div className="mb-1 flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <span>{f.label}</span>
        {hasStored && (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            SET
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type={f.secret && touched && !isRevealed ? 'password' : 'text'}
          autoComplete="off"
          className={`w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 ${
            f.secret ? 'pr-10' : ''
          } ${!touched && f.secret && hasStored && !isRevealed ? 'font-mono tracking-wider' : ''}`}
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
        />
        {f.secret && hasStored && (
          <button
            type="button"
            onClick={() => setRevealed((s) => ({ ...s, [f.key]: !s[f.key] }))}
            aria-label={isRevealed ? 'Hide value' : 'Reveal value'}
            title={isRevealed ? 'Hide value' : 'Reveal value'}
            className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {f.secret && hasStored && !touched && (
        <p className="mt-1 text-xs text-slate-500">
          {isRevealed
            ? 'Showing stored value. Type to replace.'
            : 'Click the eye to reveal. Type to replace.'}
        </p>
      )}
    </div>
  );
}
