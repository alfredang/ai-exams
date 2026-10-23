'use client';
import { useState } from 'react';
import { SourceStreamPanel, consumeSSE, type GenQuestion } from '@/components/admin/source-stream-panel';

export default function PdfAuthorClient({ examId, domains }: { examId: string; domains: string[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [domain, setDomain] = useState(domains[0] ?? 'General');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [type, setType] = useState<'SINGLE' | 'MULTI' | 'TRUE_FALSE'>('SINGLE');
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState<GenQuestion[]>([]);
  const [progress, setProgress] = useState<{ i: number; of: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setQuestions([]);
    setError(null);
    setProgress(null);
    const fd = new FormData();
    fd.set('examId', examId);
    fd.set('file', file);
    fd.set('domain', domain);
    fd.set('count', String(count));
    fd.set('difficulty', String(difficulty));
    fd.set('type', type);
    fd.set('publish', publish ? 'true' : 'false');
    try {
      const res = await fetch('/api/admin/generate-from-pdf', { method: 'POST', body: fd });
      if (!res.ok) {
        const t = await res.text();
        setError(t || 'Upload failed');
        setBusy(false);
        return;
      }
      await consumeSSE(res, (event, data) => {
        if (event === 'init') setProgress({ i: 0, of: data.chunks });
        else if (event === 'chunk') setProgress({ i: data.i, of: data.of });
        else if (event === 'question') setQuestions((qs) => [...qs, data]);
        else if (event === 'warn') setError(data.message);
        else if (event === 'error') setError(data.message);
      });
    } catch (err: any) {
      setError(err?.message || 'Stream failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card grid gap-3 p-4 md:grid-cols-2">
        <label className="block md:col-span-2 text-[12px] text-slate-700 dark:text-slate-200">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">PDF file</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-[12px]"
            required
          />
          {file && <span className="mt-1 block text-xs text-slate-500">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</span>}
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Domain</span>
          {domains.length > 0 ? (
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className="input-sm">
              {domains.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          ) : (
            <input value={domain} onChange={(e) => setDomain(e.target.value)} className="input-sm" />
          )}
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Question type</span>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="input-sm">
            <option value="SINGLE">Single answer</option>
            <option value="MULTI">Multiple answers</option>
            <option value="TRUE_FALSE">True / False</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Count (1-25)</span>
          <input type="number" min={1} max={25} value={count} onChange={(e) => setCount(Number(e.target.value) || 5)} className="input-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">Difficulty (1-5)</span>
          <input type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(Math.max(1, Math.min(5, Number(e.target.value) || 3)) as any)} className="input-sm" />
        </label>
        <label className="md:col-span-2 inline-flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          Publish immediately (otherwise saved as DRAFT for review)
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={busy || !file}
            className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Extracting + generating…' : 'Extract & generate'}
          </button>
        </div>
      </form>
      <SourceStreamPanel busy={busy} questions={questions} progress={progress} error={error} />
    </div>
  );
}
