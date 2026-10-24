'use client';
import { useState } from 'react';

type Draft = {
  id: string;
  stem: string;
  type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE';
  options: { id: string; text: string }[];
  correct: string[];
  explanation: string;
  domain: string;
  difficulty: number;
  references?: { label: string; url: string }[];
};

export function GeneratorClient({ examId, domains }: { examId: string; domains: string[] }) {
  const [domain, setDomain] = useState(domains[0] || '');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [type, setType] = useState<'SINGLE' | 'MULTI' | 'TRUE_FALSE'>('SINGLE');
  const [examGuideUrl, setExamGuideUrl] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [progress, setProgress] = useState<{ count: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(''); setDrafts([]); setProgress({ count: 0, total: count });
    try {
      const r = await fetch('/api/admin/generate-questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ examId, domain, count, difficulty, type, examGuideUrl: examGuideUrl || undefined })
      });
      if (!r.ok || !r.body) { setErr(`Error ${r.status}`); setBusy(false); return; }
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split('\n\n');
        buf = events.pop() || '';
        for (const evt of events) {
          const lines = evt.split('\n');
          const type = lines.find(l => l.startsWith('event: '))?.slice(7);
          const data = lines.find(l => l.startsWith('data: '))?.slice(6);
          if (!type || !data) continue;
          const payload = JSON.parse(data);
          if (type === 'question') setDrafts(prev => [...prev, payload]);
          if (type === 'progress') setProgress({ count: payload.count, total: payload.total });
          if (type === 'error') setErr(payload.message);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function discard(id: string) {
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    setDrafts(prev => prev.filter(d => d.id !== id));
  }

  return (
    <>
      <form onSubmit={generate} className="card mt-4 grid gap-3 p-4 md:grid-cols-3">
        <div className="md:col-span-3">
          <label className="label">Domain</label>
          {domains.length > 0 ? (
            <select className="input" value={domain} onChange={e => setDomain(e.target.value)} required>
              {domains.map(d => <option key={d}>{d}</option>)}
            </select>
          ) : (
            <input className="input" value={domain} onChange={e => setDomain(e.target.value)} placeholder="Domain (free text)" required />
          )}
        </div>
        <div><label className="label">Count</label><input type="number" min={1} max={25} className="input" value={count} onChange={e => setCount(Number(e.target.value))} /></div>
        <div>
          <label className="label">Difficulty</label>
          <select className="input" value={difficulty} onChange={e => setDifficulty(Number(e.target.value) as any)}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={e => setType(e.target.value as any)}>
            <option value="SINGLE">Single answer</option>
            <option value="MULTI">Multiple answers</option>
            <option value="TRUE_FALSE">True/False</option>
          </select>
        </div>
        <div className="md:col-span-3"><label className="label">Official exam guide URL (optional)</label><input className="input" value={examGuideUrl} onChange={e => setExamGuideUrl(e.target.value)} placeholder="https://learn.microsoft.com/..." /></div>
        <div className="md:col-span-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">Generated questions are published straight into the pool — Remove any you don't want.</p>
          <button className="btn-primary-grad" disabled={busy}>{busy ? `Generating (${progress?.count ?? 0}/${progress?.total ?? count})…` : 'Generate'}</button>
        </div>
        {err && <p className="md:col-span-3 text-sm text-red-600">{err}</p>}
      </form>

      <div className="mt-6 space-y-3">
        {drafts.map(d => (
          <div key={d.id} className="card p-5">
            <div className="mb-1 flex items-center gap-2 text-xs">
              <span className="badge">{d.type}</span>
              <span className="badge">{d.domain}</span>
              <span className="badge">D{d.difficulty}</span>
            </div>
            <p className="font-medium">{d.stem}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {d.options.map((o, oi) => (
                <li key={`${oi}-${o.id}`} className={d.correct.includes(o.id) ? 'text-green-700 dark:text-green-300' : 'text-slate-700 dark:text-slate-300'}>
                  {d.correct.includes(o.id) ? '✓ ' : '○ '}{o.text}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-slate-600"><b>Explanation:</b> {d.explanation}</p>
            {d.references && d.references.length > 0 && (
              <p className="mt-1 text-xs text-slate-500"><b>Refs:</b> {d.references.map((r, i) => <a key={i} href={r.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">{r.label}</a>).reduce((p, c) => <>{p}{p ? ' · ' : ''}{c}</>, null as any)}</p>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={() => discard(d.id)} className="btn-outline">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
