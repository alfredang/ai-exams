'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichHtmlEditor } from '@/components/admin/rich-html-editor';

type Props = {
  id: string | null;
  initial: {
    slug: string;
    title: string;
    bodyHtml: string;
    excerpt: string;
    published: boolean;
    showInFooter: boolean;
    footerGroup: 'legal' | 'company' | null;
    position: number;
  };
};

export default function PageEditorClient({ id, initial }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [bodyHtml, setBodyHtml] = useState(initial.bodyHtml);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [published, setPublished] = useState(initial.published);
  const [showInFooter, setShowInFooter] = useState(initial.showInFooter);
  const [footerGroup, setFooterGroup] = useState<'legal' | 'company' | ''>(initial.footerGroup ?? '');
  const [position, setPosition] = useState(initial.position);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function save() {
    setBusy(true); setMsg('');
    const body = {
      slug, title, bodyHtml, excerpt: excerpt || null,
      published, showInFooter,
      footerGroup: footerGroup || null,
      position
    };
    const r = id
      ? await fetch(`/api/admin/pages/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/admin/pages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    setBusy(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setMsg(d.error === 'slug-exists' ? 'Slug already in use.' : `Save failed: ${d.error ?? r.status}`);
      return;
    }
    if (!id) {
      const d = await r.json();
      router.replace(`/admin-dashboard/pages/${d.item.id}`);
    } else {
      setMsg('Saved.');
    }
  }

  async function del() {
    if (!id) return;
    if (!confirm(`Delete page "${title}"? This cannot be undone.`)) return;
    const r = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
    if (r.ok) router.replace('/admin-dashboard/pages');
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-4">
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 input" />

          <label className="mt-3 block text-sm font-medium">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="terms-of-service" className="mt-1 input" />
          <p className="mt-1 text-xs text-slate-500">Lowercase, dashes only. URL will be <code>/p/{slug || 'your-slug'}</code>.</p>

          <label className="mt-3 block text-sm font-medium">Excerpt (optional)</label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1 input" />

          <label className="mt-3 block text-sm font-medium">Body</label>
          <p className="mt-0.5 text-xs text-slate-500">
            Use the toolbar for rich text, or toggle Source to edit HTML. <code>{'{{TEASER_N}}'}</code> is substituted with the live teaser size at render time. Click AI Assist to draft.
          </p>
          <div className="mt-1">
            <RichHtmlEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              aiContext={{ kind: 'page', title }}
            />
          </div>
        </div>

        <div className="card p-4 space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published (visible on public site)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showInFooter} onChange={(e) => setShowInFooter(e.target.checked)} />
            Show in site footer
          </label>
          {showInFooter && (
            <>
              <div>
                <label className="block">Footer column</label>
                <select value={footerGroup} onChange={(e) => setFooterGroup(e.target.value as any)} className="mt-1 input">
                  <option value="">(none — won't show)</option>
                  <option value="company">Company</option>
                  <option value="legal">Legal</option>
                </select>
              </div>
              <div>
                <label className="block">Position (lower = first)</label>
                <input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="mt-1 input w-32" />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={save} disabled={busy} className="btn-primary">{busy ? 'Saving…' : id ? 'Save' : 'Create'}</button>
          {id && <button type="button" onClick={del} className="text-sm text-rose-600 hover:underline">Delete</button>}
          {msg && <span className="text-sm text-slate-500">{msg}</span>}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold">Preview</h3>
        <iframe
          title="page-preview"
          sandbox=""
          srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Inter,system-ui,sans-serif;margin:0;padding:24px;color:#0f172a;max-width:680px}h1{font-size:1.75rem;font-weight:700;margin:0 0 16px}h2{font-size:1.25rem;font-weight:600;margin:24px 0 8px}p{line-height:1.7;margin:0 0 12px}</style></head><body><h1>${title.replace(/[<&>]/g,'')}</h1>${bodyHtml}</body></html>`}
          className="mt-2 h-[40rem] w-full rounded border border-slate-200 bg-white dark:border-slate-700"
        />
      </div>
    </div>
  );
}
