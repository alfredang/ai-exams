'use client';
import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Mail, Plug, Unplug, Send } from 'lucide-react';
import type { FieldDef } from '../groups';

type Initial = Record<string, { configured: boolean; preview: string; current: string }>;
type Transport = 'GMAIL_OAUTH' | 'GMAIL_SERVICE_ACCOUNT' | 'SMTP';

export default function EmailForm({
  initial,
  gmailFields,
  saFields,
  smtpFields,
  commonFields,
  initialTransport,
  initialFallbackEnabled,
  gmailConnected,
  gmailSender,
  flash
}: {
  initial: Initial;
  gmailFields: FieldDef[];
  saFields: FieldDef[];
  smtpFields: FieldDef[];
  commonFields: FieldDef[];
  initialTransport: Transport;
  initialFallbackEnabled: boolean;
  gmailConnected: boolean;
  gmailSender: string;
  flash?: { kind: 'success' | 'error'; message: string };
}) {
  const [transport, setTransport] = useState<Transport>(initialTransport);
  const [fallbackEnabled, setFallbackEnabled] = useState(initialFallbackEnabled);
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [testTo, setTestTo] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  async function save(extra?: Record<string, string>) {
    setSaving(true);
    setMsg('');
    const payload: Record<string, string> = {
      EMAIL_TRANSPORT: transport,
      EMAIL_FALLBACK_ENABLED: fallbackEnabled ? 'true' : 'false',
      ...(extra ?? {})
    };
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

  async function disconnectGmail() {
    if (!confirm('Disconnect Gmail? The refresh token will be cleared. You can reconnect anytime.')) return;
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ GMAIL_OAUTH_REFRESH_TOKEN: '', GMAIL_OAUTH_SENDER_EMAIL: '', EMAIL_TRANSPORT: 'SMTP' })
    });
    setSaving(false);
    location.reload();
  }

  async function sendTest() {
    setTestResult('');
    setTesting(true);
    try {
      const res = await fetch('/api/admin/email/test-send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to: testTo })
      });
      const data = await res.json();
      if (data.ok) {
        setTestResult(`Sent via ${data.transport}. Message id: ${data.messageId ?? '(n/a)'}`);
      } else {
        setTestResult(`Failed: ${data.error ?? 'unknown'}`);
      }
    } catch (err: any) {
      setTestResult(`Failed: ${err?.message ?? 'network error'}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {flash && (
        <div
          className={`rounded-md px-3 py-2 text-[12px] ${
            flash.kind === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
          }`}
        >
          {flash.message}
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Transport</h3>
        <p className="mt-1 text-[12px] text-slate-500">Choose the primary channel for outbound emails.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${
              transport === 'GMAIL_OAUTH'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="transport"
              value="GMAIL_OAUTH"
              checked={transport === 'GMAIL_OAUTH'}
              onChange={() => setTransport('GMAIL_OAUTH')}
            />
            <Mail className="h-4 w-4" />
            <span className="font-medium">Gmail OAuth</span>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${
              transport === 'GMAIL_SERVICE_ACCOUNT'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="transport"
              value="GMAIL_SERVICE_ACCOUNT"
              checked={transport === 'GMAIL_SERVICE_ACCOUNT'}
              onChange={() => setTransport('GMAIL_SERVICE_ACCOUNT')}
            />
            <KeyRound className="h-4 w-4" />
            <span className="font-medium">Gmail Service Account</span>
            <span className="text-[11px] text-slate-500">Survives password changes</span>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${
              transport === 'SMTP'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="transport"
              value="SMTP"
              checked={transport === 'SMTP'}
              onChange={() => setTransport('SMTP')}
            />
            <Send className="h-4 w-4" />
            <span className="font-medium">SMTP</span>
            <span className="text-[11px] text-slate-500">MailHog in dev</span>
          </label>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={fallbackEnabled} onChange={(e) => setFallbackEnabled(e.target.checked)} />
          <span>
            Automatic fallback — if the primary transport fails, retry through any other fully-configured transport
            before giving up.
          </span>
        </label>
      </div>

      {transport === 'GMAIL_OAUTH' && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Gmail OAuth credentials</h3>
            {gmailConnected ? (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                <Plug className="h-3 w-3" /> Connected{gmailSender ? ` · ${gmailSender}` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                Not connected
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-slate-500">
            Create an OAuth client of type <span className="font-mono">Web application</span> in Google Cloud Console
            and register{' '}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">/api/admin/gmail-oauth/callback</code> as a
            redirect URI. Then click <b>Connect Gmail</b> below.
          </p>
          <FieldGrid
            fields={gmailFields}
            initial={initial}
            values={values}
            setValues={setValues}
            revealed={revealed}
            setRevealed={setRevealed}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href="/api/admin/gmail-oauth/start"
              className="inline-flex h-8 items-center gap-2 rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700"
            >
              <Plug className="h-3.5 w-3.5" />
              {gmailConnected ? 'Reconnect Gmail' : 'Connect Gmail'}
            </a>
            {gmailConnected && (
              <button
                type="button"
                onClick={disconnectGmail}
                className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-300 px-3 text-[12px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Unplug className="h-3.5 w-3.5" />
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}

      {transport === 'GMAIL_SERVICE_ACCOUNT' && (
        <div className="card p-4">
          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            Google Workspace service account
          </h3>
          <p className="mt-1 text-[12px] text-slate-500">
            Create a service account in Google Cloud Console, enable{' '}
            <b>Domain-wide Delegation</b>, and in the Workspace Admin console (Security → API controls → Domain-wide
            delegation) authorize its Client ID for the scope{' '}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">https://mail.google.com/</code>. Unlike Gmail
            OAuth, this keeps working when the mailbox password changes.
          </p>
          <FieldGrid
            fields={saFields}
            initial={initial}
            values={values}
            setValues={setValues}
            revealed={revealed}
            setRevealed={setRevealed}
          />
        </div>
      )}

      {transport === 'SMTP' && (
        <div className="card p-4">
          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">SMTP credentials</h3>
          <FieldGrid
            fields={smtpFields}
            initial={initial}
            values={values}
            setValues={setValues}
            revealed={revealed}
            setRevealed={setRevealed}
          />
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Common</h3>
        <FieldGrid
          fields={commonFields}
          initial={initial}
          values={values}
          setValues={setValues}
          revealed={revealed}
          setRevealed={setRevealed}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => save()}
          disabled={saving}
          className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {msg && <span className="text-[12px] text-slate-500">{msg}</span>}
      </div>

      <div className="card p-4">
        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Send test email</h3>
        <p className="mt-1 text-[12px] text-slate-500">
          Uses the currently saved transport. Switch the radio and Save first if you want to test the other path.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="recipient@example.com"
            className="input-sm max-w-xs"
          />
          <button
            type="button"
            onClick={sendTest}
            disabled={testing || !testTo}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-[12px] font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {testing ? 'Sending…' : 'Send test'}
          </button>
          {testResult && <span className="text-[12px] text-slate-600 dark:text-slate-300">{testResult}</span>}
        </div>
      </div>
    </div>
  );
}

function FieldGrid({
  fields,
  initial,
  values,
  setValues,
  revealed,
  setRevealed
}: {
  fields: FieldDef[];
  initial: Initial;
  values: Record<string, string>;
  setValues: (u: (s: Record<string, string>) => Record<string, string>) => void;
  revealed: Record<string, boolean>;
  setRevealed: (u: (s: Record<string, boolean>) => Record<string, boolean>) => void;
}) {
  return (
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
        const colSpan = f.fullWidth ? 'sm:col-span-2' : '';
        return (
          <div key={f.key} className={`text-sm ${colSpan}`}>
            <div className="mb-1 flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
              <span>{f.label}</span>
              {hasStored && (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  SET
                </span>
              )}
            </div>
            <div className="relative">
              {f.multiline ? (
                <textarea
                  rows={4}
                  autoComplete="off"
                  className={`input-sm h-auto py-1.5 font-mono text-[11px] ${f.secret ? 'pr-9' : ''}`}
                  placeholder={placeholder || f.placeholder || ''}
                  value={displayValue}
                  onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              ) : (
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
              )}
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
  );
}
