'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { FieldDef } from '../groups';

type Initial = Record<string, { configured: boolean; preview: string; current: string }>;

export default function SocialLoginForm({
  initial,
  googleFields,
  githubFields,
  linkedinFields,
  microsoftFields,
  callbackBase
}: {
  initial: Initial;
  googleFields: FieldDef[];
  githubFields: FieldDef[];
  linkedinFields: FieldDef[];
  microsoftFields: FieldDef[];
  callbackBase: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');

  async function save() {
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
      setTimeout(() => location.reload(), 500);
    } else {
      setMsg('Save failed.');
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <ProviderCard
        title="Google"
        callbackUri={`${callbackBase}/api/auth/callback/google`}
        helpUrl="https://console.cloud.google.com/apis/credentials"
        fields={googleFields}
        initial={initial}
        values={values}
        setValues={setValues}
        revealed={revealed}
        setRevealed={setRevealed}
      />
      <ProviderCard
        title="GitHub"
        callbackUri={`${callbackBase}/api/auth/callback/github`}
        helpUrl="https://github.com/settings/developers"
        fields={githubFields}
        initial={initial}
        values={values}
        setValues={setValues}
        revealed={revealed}
        setRevealed={setRevealed}
      />
      <ProviderCard
        title="LinkedIn"
        callbackUri={`${callbackBase}/api/auth/callback/linkedin`}
        helpUrl="https://www.linkedin.com/developers/apps"
        fields={linkedinFields}
        initial={initial}
        values={values}
        setValues={setValues}
        revealed={revealed}
        setRevealed={setRevealed}
      />
      <ProviderCard
        title="Microsoft"
        callbackUri={`${callbackBase}/api/auth/callback/microsoft-entra-id`}
        helpUrl="https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
        fields={microsoftFields}
        initial={initial}
        values={values}
        setValues={setValues}
        revealed={revealed}
        setRevealed={setRevealed}
      />
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {msg && <span className="text-[12px] text-slate-500">{msg}</span>}
      </div>
    </div>
  );
}

function ProviderCard({
  title,
  callbackUri,
  helpUrl,
  fields,
  initial,
  values,
  setValues,
  revealed,
  setRevealed
}: {
  title: string;
  callbackUri: string;
  helpUrl: string;
  fields: FieldDef[];
  initial: Initial;
  values: Record<string, string>;
  setValues: (u: (s: Record<string, string>) => Record<string, string>) => void;
  revealed: Record<string, boolean>;
  setRevealed: (u: (s: Record<string, boolean>) => Record<string, boolean>) => void;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <a
          href={helpUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          Open {title} developer console →
        </a>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Register this exact redirect URI in the {title} console:
      </p>
      <code className="mt-1 block break-all rounded bg-slate-50 px-2 py-1 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {callbackUri}
      </code>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {fields.map((f) => {
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
          return (
            <div key={f.key} className="text-sm">
              <div className="mb-1 flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
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
                  className={`input-sm ${f.secret ? 'pr-9' : ''} ${
                    !touched && f.secret && hasStored && !isRevealed ? 'font-mono tracking-wider' : ''
                  }`}
                  placeholder={placeholder}
                  value={displayValue}
                  onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                />
                {f.secret && hasStored && (
                  <button
                    type="button"
                    onClick={() => setRevealed((s) => ({ ...s, [f.key]: !s[f.key] }))}
                    aria-label={isRevealed ? 'Hide value' : 'Reveal value'}
                    className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
