'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { RichHtmlEditor } from '@/components/admin/rich-html-editor';

export type TemplateRow = {
  key: string;
  displayName: string;
  description: string;
  subject: string;
  bodyHtml: string;
  ccEmails: string[];
  enabled: boolean;
  customized: boolean;
  updatedAt: string | null;
  defaults: { displayName: string; subject: string; bodyHtml: string };
};

export default function EmailTemplatesClient({
  initial,
  adminEmail
}: {
  initial: TemplateRow[];
  adminEmail: string;
}) {
  const [rows, setRows] = useState<TemplateRow[]>(initial);
  const [openKey, setOpenKey] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenKey((cur) => (cur === key ? null : key));
  }

  function updateRow(key: string, patch: Partial<TemplateRow>) {
    setRows((cur) => cur.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50">
          <tr>
            <th className="px-4 py-3">Template</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">CC</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row) => {
            const isOpen = openKey === row.key;
            return (
              <RowBlock
                key={row.key}
                row={row}
                isOpen={isOpen}
                onToggle={() => toggle(row.key)}
                onPatch={(p) => updateRow(row.key, p)}
                adminEmail={adminEmail}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RowBlock({
  row,
  isOpen,
  onToggle,
  onPatch,
  adminEmail
}: {
  row: TemplateRow;
  isOpen: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<TemplateRow>) => void;
  adminEmail: string;
}) {
  return (
    <>
      <tr className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50" onClick={onToggle}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 font-medium">
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}
            />
            <span>{row.displayName}</span>
            <code className="text-xs text-slate-400">{row.key}</code>
          </div>
          <div className="ml-6 text-xs text-slate-500">{row.description}</div>
        </td>
        <td className="px-4 py-3">
          {row.customized ? (
            row.enabled ? (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                CUSTOM
              </span>
            ) : (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                DISABLED
              </span>
            )
          ) : (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              DEFAULT
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">
          {row.ccEmails.length === 0 ? '—' : `${row.ccEmails.length} address${row.ccEmails.length === 1 ? '' : 'es'}`}
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">
          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '—'}
        </td>
        <td className="px-4 py-3 text-right text-xs text-slate-500">
          {isOpen ? 'Collapse' : 'Expand'}
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-slate-50/60 dark:bg-slate-900/40">
          <td colSpan={5} className="p-4">
            <ExpandedEditor row={row} onPatch={onPatch} adminEmail={adminEmail} />
          </td>
        </tr>
      )}
    </>
  );
}

function ExpandedEditor({
  row,
  onPatch,
  adminEmail
}: {
  row: TemplateRow;
  onPatch: (p: Partial<TemplateRow>) => void;
  adminEmail: string;
}) {
  const [displayName, setDisplayName] = useState(row.displayName);
  const [ccText, setCcText] = useState(row.ccEmails.join(', '));
  const [subject, setSubject] = useState(row.subject);
  const [bodyHtml, setBodyHtml] = useState(row.bodyHtml);
  const [enabled, setEnabled] = useState(row.enabled);
  const [testTo, setTestTo] = useState(adminEmail);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  async function save() {
    setSaving(true);
    setMsg('');
    const ccEmails = ccText.split(',').map((s) => s.trim()).filter(Boolean);
    const res = await fetch(`/api/admin/email-templates/${row.key}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName, subject, bodyHtml, enabled, ccEmails })
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(`Save failed: ${d.error ?? res.status}`);
      return;
    }
    setMsg('Saved.');
    onPatch({
      displayName,
      subject,
      bodyHtml,
      enabled,
      ccEmails,
      customized: true,
      updatedAt: new Date().toISOString()
    });
  }

  async function resetToDefault() {
    if (!confirm(`Reset ${row.key} to the built-in default?`)) return;
    const res = await fetch(`/api/admin/email-templates/${row.key}`, { method: 'DELETE' });
    if (res.ok) {
      setDisplayName(row.defaults.displayName);
      setSubject(row.defaults.subject);
      setBodyHtml(row.defaults.bodyHtml);
      setCcText('');
      setEnabled(true);
      setMsg('Reset to default.');
      onPatch({
        displayName: row.defaults.displayName,
        subject: row.defaults.subject,
        bodyHtml: row.defaults.bodyHtml,
        ccEmails: [],
        enabled: true,
        customized: false
      });
    }
  }

  async function sendTest() {
    if (!testTo) return;
    setSending(true);
    setMsg('');
    const res = await fetch(`/api/admin/email-templates/${row.key}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'test-send', to: testTo })
    });
    setSending(false);
    setMsg(res.ok ? `Test sent to ${testTo}` : 'Test send failed.');
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="mb-1 block text-slate-600 dark:text-slate-300">Short name (display label)</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-600 dark:text-slate-300">CC emails (comma-separated)</span>
        <input
          value={ccText}
          onChange={(e) => setCcText(e.target.value)}
          placeholder="ops@example.com, support@example.com"
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <label className="block text-sm sm:col-span-2">
        <span className="mb-1 block text-slate-600 dark:text-slate-300">Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div className="block text-sm sm:col-span-2">
        <span className="mb-1 block text-slate-600 dark:text-slate-300">Body</span>
        <span className="mb-1 block text-xs text-slate-500">
          Toggle Source to edit Handlebars HTML directly, or use the toolbar for rich text. Click AI Assist to draft.
        </span>
        <RichHtmlEditor
          value={bodyHtml}
          onChange={setBodyHtml}
          aiContext={{ kind: 'email', subject }}
          className="h-56"
        />
      </div>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enabled
        </label>
        <button type="button" onClick={save} disabled={saving} className="btn-primary text-sm">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {row.customized && (
          <button type="button" onClick={resetToDefault} className="text-sm text-rose-600 hover:underline">
            Reset to default
          </button>
        )}
        <Link
          href={`/admin-dashboard/settings/email-templates/${row.key}`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          Full editor with preview <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <span className="text-sm text-slate-500">Send test:</span>
        <input
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="button"
          onClick={sendTest}
          disabled={sending}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          {sending ? 'Sending…' : 'Send test'}
        </button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    </div>
  );
}
