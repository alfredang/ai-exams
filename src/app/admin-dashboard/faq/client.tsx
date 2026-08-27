'use client';
import { useState } from 'react';
import { Sparkles, Loader2, Trash2, Plus } from 'lucide-react';

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  position: number;
  published: boolean;
};

export default function FaqAdminClient({ initial }: { initial: FaqRow[] }) {
  const [rows, setRows] = useState<FaqRow[]>(initial);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTopic, setBulkTopic] = useState('');
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkErr, setBulkErr] = useState('');

  async function bulkGenerate() {
    setBulkBusy(true);
    setBulkErr('');
    try {
      const r = await fetch('/api/admin/ai-assist/faq', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          topic: bulkTopic.trim() || 'Tertiary Exams practice exams, teasers, vouchers, refunds',
          count: bulkCount,
          existing: rows.map((r) => ({ question: r.question, answer: r.answer }))
        })
      });
      const d = await r.json();
      if (!d.ok) {
        setBulkErr(d.error || 'Generate failed');
        return;
      }
      const persist = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items: d.items })
      });
      const pd = await persist.json();
      if (!pd.ok) {
        setBulkErr(pd.error || 'Persist failed');
        return;
      }
      const fresh = await fetch('/api/admin/faqs/list', { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
      if (fresh?.ok) setRows(fresh.items);
      else location.reload();
      setBulkOpen(false);
      setBulkTopic('');
    } catch (e: any) {
      setBulkErr(e?.message ?? 'Generate failed');
    } finally {
      setBulkBusy(false);
    }
  }

  async function addBlank() {
    const r = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        question: 'New question',
        answer: 'Answer goes here…',
        position: rows.length,
        published: false
      })
    });
    const d = await r.json();
    if (d.ok) setRows((rs) => [...rs, d.item]);
  }

  return (
    <div className="space-y-3">
      <div className="card flex flex-wrap items-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex-1 min-w-[260px]">
          <div className="text-sm font-medium">AI Assist — bulk generate FAQs</div>
          <div className="text-[11px] text-slate-500">
            Claude drafts FAQ pairs about Tertiary Exams. Adds them as published rows; review and edit per row below.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setBulkOpen((v) => !v)}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white hover:bg-violet-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Assist
        </button>
        <button
          type="button"
          onClick={addBlank}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add empty
        </button>
      </div>

      {bulkOpen && (
        <div className="card border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-900 dark:bg-violet-950/30">
          <label className="block text-[11px] font-medium text-violet-900 dark:text-violet-200">
            Focus / topic for the new FAQs
          </label>
          <textarea
            value={bulkTopic}
            onChange={(e) => setBulkTopic(e.target.value)}
            rows={2}
            placeholder="e.g. Refunds, exam vouchers, account access, teasers"
            className="mt-1 w-full rounded border border-violet-300 bg-white px-2 py-1.5 text-xs dark:border-violet-800 dark:bg-slate-900"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="text-[11px] text-violet-900 dark:text-violet-200">
              Number of entries:
              <input
                type="number"
                min={1}
                max={15}
                value={bulkCount}
                onChange={(e) => setBulkCount(Math.max(1, Math.min(15, Number(e.target.value) || 1)))}
                className="ml-2 w-16 rounded border border-violet-300 bg-white px-2 py-0.5 text-xs dark:border-violet-800 dark:bg-slate-900"
              />
            </label>
            <button
              type="button"
              onClick={bulkGenerate}
              disabled={bulkBusy}
              className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md bg-violet-600 px-3 text-[12px] font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {bulkBusy ? 'Generating…' : 'Generate'}
            </button>
          </div>
          {bulkErr && <p className="mt-1 text-[11px] text-rose-600">{bulkErr}</p>}
        </div>
      )}

      {rows.map((row) => (
        <FaqEditor key={row.id} row={row} onUpdate={(r) => setRows((rs) => rs.map((x) => (x.id === r.id ? r : x)))} onDelete={(id) => setRows((rs) => rs.filter((x) => x.id !== id))} />
      ))}
      {rows.length === 0 && <p className="text-sm text-slate-500">No FAQs yet. Use AI Assist above or click "Add empty".</p>}
    </div>
  );
}

function FaqEditor({
  row,
  onUpdate,
  onDelete
}: {
  row: FaqRow;
  onUpdate: (row: FaqRow) => void;
  onDelete: (id: string) => void;
}) {
  const [question, setQuestion] = useState(row.question);
  const [answer, setAnswer] = useState(row.answer);
  const [position, setPosition] = useState(row.position);
  const [published, setPublished] = useState(row.published);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInstr, setAiInstr] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');

  async function save() {
    setSaving(true);
    setMsg('');
    const r = await fetch(`/api/admin/faqs/${row.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question, answer, position, published })
    });
    setSaving(false);
    const d = await r.json().catch(() => ({}));
    if (d.ok) {
      onUpdate(d.item);
      setMsg('Saved.');
      setTimeout(() => setMsg(''), 1500);
    } else {
      setMsg('Save failed.');
    }
  }

  async function del() {
    if (!confirm(`Delete FAQ "${question}"?`)) return;
    const r = await fetch(`/api/admin/faqs/${row.id}`, { method: 'DELETE' });
    if (r.ok) onDelete(row.id);
  }

  async function aiRewrite() {
    if (!aiInstr.trim()) return;
    setAiBusy(true);
    setAiErr('');
    try {
      const r = await fetch('/api/admin/ai-assist/faq', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'rewrite', question, answer, instruction: aiInstr })
      });
      const d = await r.json();
      if (!d.ok) {
        setAiErr(d.error || 'Rewrite failed');
        return;
      }
      setAnswer(d.answer);
      setAiOpen(false);
      setAiInstr('');
    } catch (e: any) {
      setAiErr(e?.message ?? 'Rewrite failed');
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="card space-y-2 p-3">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="input-sm"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-slate-200 bg-white p-2 text-[12px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {aiOpen && (
        <div className="rounded border border-violet-200 bg-violet-50 p-2 text-xs dark:border-violet-900 dark:bg-violet-950/30">
          <textarea
            value={aiInstr}
            onChange={(e) => setAiInstr(e.target.value)}
            rows={2}
            placeholder="e.g. Make it shorter and friendlier"
            className="w-full rounded border border-violet-300 bg-white px-2 py-1.5 dark:border-violet-800 dark:bg-slate-900"
          />
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={aiRewrite}
              disabled={aiBusy || !aiInstr.trim()}
              className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded bg-violet-600 px-2 text-[11px] font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {aiBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {aiBusy ? 'Rewriting…' : 'Rewrite'}
            </button>
            {aiErr && <span className="text-[11px] text-rose-600">{aiErr}</span>}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value) || 0)}
          className="input-sm w-20"
        />
        <label className="inline-flex items-center gap-1 text-[11px]">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        <button
          type="button"
          onClick={() => setAiOpen((v) => !v)}
          className="inline-flex h-7 items-center gap-1 whitespace-nowrap rounded bg-violet-600 px-2 text-[11px] font-medium text-white hover:bg-violet-700"
        >
          <Sparkles className="h-3 w-3" /> AI Assist
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="ml-auto inline-flex h-7 items-center rounded-md bg-emerald-600 px-3 text-[11px] font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={del}
          className="inline-flex h-7 items-center gap-1 rounded text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
        {msg && <span className="text-[11px] text-slate-500">{msg}</span>}
      </div>
    </div>
  );
}
