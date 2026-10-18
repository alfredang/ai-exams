'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Trash2, Star, Sparkles, Loader2 } from 'lucide-react';

type Row = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  attemptId: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string | null };
  exam: { id: string; code: string; title: string; slug: string; vendor: { slug: string; name: string } };
};

export default function ReviewsAdminClient({
  initial,
  currentStatus,
  counts
}: {
  initial: Row[];
  currentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial);

  async function setStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', adminNote?: string) {
    const r = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status, adminNote })
    });
    if (r.ok) setRows((rs) => rs.filter((row) => row.id !== id));
  }

  async function del(id: string) {
    if (!confirm('Delete this review?')) return;
    const r = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    if (r.ok) setRows((rs) => rs.filter((row) => row.id !== id));
  }

  async function promote(id: string) {
    const r = await fetch(`/api/admin/reviews/${id}/promote`, { method: 'POST' });
    const d = await r.json().catch(() => ({}));
    if (d.ok) {
      router.push('/admin-dashboard/testimonials');
    } else {
      alert(d.error || 'Failed to promote');
    }
  }

  const tabs: Array<{ key: 'PENDING' | 'APPROVED' | 'REJECTED'; label: string }> = [
    { key: 'PENDING', label: `Pending (${counts.PENDING || 0})` },
    { key: 'APPROVED', label: `Approved (${counts.APPROVED || 0})` },
    { key: 'REJECTED', label: `Rejected (${counts.REJECTED || 0})` }
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin-dashboard/reviews?status=${t.key}`}
            className={`px-3 py-1.5 text-sm font-medium ${currentStatus === t.key ? 'border-b-2 border-blue-600 text-blue-700 dark:text-blue-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 && <p className="card p-6 text-sm text-slate-500">No reviews in this state.</p>}

      <div className="space-y-2">
        {rows.map((r) => (
          <ReviewRow key={r.id} row={r} onApprove={() => setStatus(r.id, 'APPROVED')} onReject={(note) => setStatus(r.id, 'REJECTED', note)} onUnset={() => setStatus(r.id, 'PENDING')} onDelete={() => del(r.id)} onPromote={() => promote(r.id)} />
        ))}
      </div>
    </div>
  );
}

function ReviewRow({
  row,
  onApprove,
  onReject,
  onUnset,
  onDelete,
  onPromote
}: {
  row: Row;
  onApprove: () => Promise<void> | void;
  onReject: (note?: string) => Promise<void> | void;
  onUnset: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  onPromote: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState('');

  async function run(name: string, fn: () => Promise<void> | void) {
    setBusy(name);
    try { await fn(); } finally { setBusy(null); }
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[280px]">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < row.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              ))}
            </span>
            <Link href={`/practice-exams/${row.exam.vendor.slug}/${row.exam.slug}`} className="font-medium text-blue-600 hover:underline">{row.exam.vendor.name} {row.exam.code}</Link>
            <span>·</span>
            <span>{row.user.name || row.user.email}</span>
            {row.attemptId && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">Verified</span>}
            <span className="ml-auto">{new Date(row.createdAt).toLocaleDateString()}</span>
          </div>
          {row.title && <div className="mt-1 font-semibold">{row.title}</div>}
          {row.body && <p className="mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-200">{row.body}</p>}
          {row.adminNote && <p className="mt-1 text-xs italic text-rose-600">Mod note: {row.adminNote}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {row.status !== 'APPROVED' && (
            <button type="button" disabled={!!busy} onClick={() => run('approve', onApprove)} className="btn-sm bg-emerald-600 text-white hover:bg-emerald-700">
              {busy === 'approve' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Approve
            </button>
          )}
          {row.status !== 'REJECTED' && (
            <button type="button" disabled={!!busy} onClick={() => setShowReject((v) => !v)} className="btn-sm bg-rose-600 text-white hover:bg-rose-700">
              <X className="h-3 w-3" /> Reject
            </button>
          )}
          {row.status !== 'PENDING' && (
            <button type="button" disabled={!!busy} onClick={() => run('pending', onUnset)} className="btn-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              Move to pending
            </button>
          )}
          <button type="button" disabled={!!busy} onClick={() => run('promote', onPromote)} className="btn-sm bg-violet-600 text-white hover:bg-violet-700">
            <Sparkles className="h-3 w-3" /> Promote
          </button>
          <button type="button" disabled={!!busy} onClick={() => run('delete', onDelete)} className="btn-sm text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      {showReject && (
        <div className="mt-2 rounded border border-rose-200 bg-rose-50 p-2 text-xs dark:border-rose-900 dark:bg-rose-950/30">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional moderator note (private)"
            className="input-sm w-full"
          />
          <div className="mt-1.5 flex justify-end gap-1.5">
            <button type="button" onClick={() => { setShowReject(false); setNote(''); }} className="btn-sm">Cancel</button>
            <button type="button" onClick={() => run('reject', () => onReject(note))} className="btn-sm bg-rose-600 text-white hover:bg-rose-700">Confirm reject</button>
          </div>
        </div>
      )}
    </div>
  );
}
