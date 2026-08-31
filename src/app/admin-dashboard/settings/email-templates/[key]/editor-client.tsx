'use client';
import { useEffect, useMemo, useState } from 'react';
import { RichHtmlEditor } from '@/components/admin/rich-html-editor';

type Props = {
  templateKey: string;
  initial: { subject: string; bodyHtml: string; enabled: boolean; customized: boolean };
  defaults: { subject: string; bodyHtml: string };
  sampleVars: Record<string, unknown>;
  adminEmail: string;
};

export default function EditorClient({ templateKey, initial, defaults, sampleVars, adminEmail }: Props) {
  const [subject, setSubject] = useState(initial.subject);
  const [bodyHtml, setBodyHtml] = useState(initial.bodyHtml);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [varsText, setVarsText] = useState(() => JSON.stringify(sampleVars, null, 2));
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [testTo, setTestTo] = useState(adminEmail);

  const parsedVars = useMemo(() => {
    try { return JSON.parse(varsText) as Record<string, unknown>; } catch { return null; }
  }, [varsText]);

  async function refreshPreview() {
    if (!parsedVars) { setPreviewError('Invalid JSON in sample variables'); setPreview(null); return; }
    setPreviewError('');
    const res = await fetch(`/api/admin/email-templates/${templateKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'preview', subject, bodyHtml, vars: parsedVars })
    });
    const data = await res.json();
    if (!res.ok) { setPreviewError(data.message || data.error || 'Preview failed'); setPreview(null); return; }
    setPreview(data);
  }

  // Initial preview intentionally mirrors the server-provided template once.
  // Later edits refresh only when the administrator clicks Preview.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => { void refreshPreview(); }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  async function save() {
    setSaving(true); setMsg('');
    const res = await fetch(`/api/admin/email-templates/${templateKey}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subject, bodyHtml, enabled })
    });
    setSaving(false);
    setMsg(res.ok ? 'Saved.' : 'Save failed.');
  }

  async function resetToDefault() {
    if (!confirm('Reset this template to the built-in default? Your custom version will be deleted.')) return;
    const res = await fetch(`/api/admin/email-templates/${templateKey}`, { method: 'DELETE' });
    if (res.ok) {
      setSubject(defaults.subject);
      setBodyHtml(defaults.bodyHtml);
      setEnabled(true);
      setMsg('Reset to default.');
    }
  }

  async function sendTest() {
    if (!testTo) return;
    setSending(true); setMsg('');
    const res = await fetch(`/api/admin/email-templates/${templateKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'test-send', to: testTo, vars: parsedVars ?? sampleVars })
    });
    setSending(false);
    setMsg(res.ok ? `Test sent to ${testTo}` : 'Test send failed.');
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-4">
          <label className="block text-sm font-medium">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <label className="mt-3 block text-sm font-medium">Body</label>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Toggle Source to edit Handlebars HTML directly, or use the toolbar for rich text. Click AI Assist to draft or rewrite the body.
          </p>
          <div className="mt-1">
            <RichHtmlEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              aiContext={{ kind: 'email', subject }}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              Enabled
            </label>
            <button type="button" onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={refreshPreview} className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
              Refresh preview
            </button>
            {initial.customized && (
              <button type="button" onClick={resetToDefault} className="text-sm text-rose-600 hover:underline">
                Reset to default
              </button>
            )}
          </div>
          {msg && <p className="mt-2 text-sm text-slate-500">{msg}</p>}
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold">Sample variables (JSON)</h3>
          <p className="mt-1 text-xs text-slate-500">Used for preview and test-send. Edit to test edge cases.</p>
          <textarea
            value={varsText}
            onChange={(e) => setVarsText(e.target.value)}
            spellCheck={false}
            className="mt-2 h-40 w-full rounded border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold">Send test</h3>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button type="button" onClick={sendTest} disabled={sending} className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
              {sending ? 'Sending…' : 'Send test'}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">Renders with the current editor content and sample variables.</p>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold">Preview</h3>
        {previewError && <p className="mt-2 text-sm text-rose-600">{previewError}</p>}
        {preview && (
          <>
            <p className="mt-2 text-xs text-slate-500">Subject: <span className="text-slate-800 dark:text-slate-200">{preview.subject}</span></p>
            <iframe
              title="email-preview"
              srcDoc={preview.html}
              sandbox=""
              className="mt-2 h-[36rem] w-full rounded border border-slate-200 bg-white dark:border-slate-700"
            />
          </>
        )}
      </div>
    </div>
  );
}
