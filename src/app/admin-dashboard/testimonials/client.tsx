'use client';
import { useState } from 'react';
import { Plus, Trash2, Loader2, Star } from 'lucide-react';

type ExamOpt = { id: string; code: string; title: string };

type Row = {
  id: string;
  authorName: string;
  authorTitle: string | null;
  avatarUrl: string | null;
  quote: string;
  rating: number | null;
  examId: string | null;
  exam: { id: string; code: string; title: string } | null;
  published: boolean;
  sortOrder: number;
  sourceReviewId: string | null;
};

export default function TestimonialsAdminClient({ initial, exams }: { initial: Row[]; exams: ExamOpt[] }) {
  const [rows, setRows] = useState<Row[]>(initial);

  async function addBlank() {
    const r = await fetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ authorName: 'New testimonial', quote: 'Quote goes here…', published: false, sortOrder: rows.length })
    });
    const d = await r.json();
    if (d.ok) setRows((rs) => [...rs, { ...d.item, exam: null }]);
  }

  return (
    <div className="space-y-3">
      <div className="card flex flex-wrap items-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex-1 min-w-[260px]">
          <div className="text-sm font-medium">Manage testimonials</div>
          <div className="text-xs text-slate-500">Edit, publish, reorder. Promoted reviews appear here as drafts — set Published to show on the homepage.</div>
        </div>
        <button type="button" onClick={addBlank} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-[13px] font-medium text-white hover:bg-blue-700">
          <Plus className="h-3.5 w-3.5" /> Add testimonial
        </button>
      </div>

      {rows.map((row) => (
        <TestimonialEditor
          key={row.id}
          row={row}
          exams={exams}
          onUpdate={(r) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, ...r } : x)))}
          onDelete={(id) => setRows((rs) => rs.filter((x) => x.id !== id))}
        />
      ))}
      {rows.length === 0 && <p className="text-sm text-slate-500">No testimonials yet.</p>}
    </div>
  );
}

function TestimonialEditor({
  row,
  exams,
  onUpdate,
  onDelete
}: {
  row: Row;
  exams: ExamOpt[];
  onUpdate: (r: any) => void;
  onDelete: (id: string) => void;
}) {
  const [authorName, setAuthorName] = useState(row.authorName);
  const [authorTitle, setAuthorTitle] = useState(row.authorTitle ?? '');
  const [avatarUrl, setAvatarUrl] = useState(row.avatarUrl ?? '');
  const [quote, setQuote] = useState(row.quote);
  const [rating, setRating] = useState<number>(row.rating ?? 5);
  const [examId, setExamId] = useState(row.examId ?? '');
  const [published, setPublished] = useState(row.published);
  const [sortOrder, setSortOrder] = useState(row.sortOrder);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function save() {
    setSaving(true);
    setMsg('');
    const r = await fetch(`/api/admin/testimonials/${row.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        authorName,
        authorTitle: authorTitle || null,
        avatarUrl: avatarUrl || null,
        quote,
        rating: rating || null,
        examId: examId || null,
        published,
        sortOrder
      })
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
    if (!confirm(`Delete testimonial by "${authorName}"?`)) return;
    const r = await fetch(`/api/admin/testimonials/${row.id}`, { method: 'DELETE' });
    if (r.ok) onDelete(row.id);
  }

  return (
    <div className="card space-y-2 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Author name" className="input-sm" />
        <input value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} placeholder="Title (e.g. Cloud Architect at Acme)" className="input-sm" />
      </div>
      <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="Avatar URL (optional)" className="input-sm w-full" />
      <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} maxLength={800} className="w-full rounded-md border border-slate-200 bg-white p-2 text-[12px] dark:border-slate-700 dark:bg-slate-900" />

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star className={`h-4 w-4 ${rating >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            </button>
          ))}
          <button type="button" onClick={() => setRating(0)} className="ml-1 text-[11px] text-slate-500 hover:underline">clear</button>
        </div>
        <select value={examId} onChange={(e) => setExamId(e.target.value)} className="input-sm">
          <option value="">— no exam link —</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>{e.code} · {e.title}</option>
          ))}
        </select>
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} className="input-sm w-20" title="Sort order" />
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        {row.sourceReviewId && <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[11px] text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">From review</span>}
        <button type="button" onClick={save} disabled={saving} className="ml-auto inline-flex h-7 items-center rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}{saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={del} className="inline-flex h-7 items-center gap-1 rounded text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
          <Trash2 className="h-3 w-3" /> Delete
        </button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    </div>
  );
}
