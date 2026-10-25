'use client';

import { useState } from 'react';
import type { AiProviderTest } from '@/lib/openai';

/** "Test AI keys" panel on Settings → Credentials: pings each saved key on its own. */
export function AiProviderTestPanel() {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<AiProviderTest[] | null>(null);
  const [error, setError] = useState('');

  async function run() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/ai-providers/test', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setResults(json.results);
    } catch (e: any) {
      setError(e?.message ?? 'Test failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mt-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Test AI keys</h2>
          <p className="text-sm text-slate-500">Sends one tiny request to each saved key on its own (no fallback). Save keys first.</p>
        </div>
        <button type="button" onClick={run} disabled={busy} className="btn-secondary">
          {busy ? 'Testing…' : 'Test AI keys'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {results && (
        <ul className="mt-3 space-y-2 text-sm">
          {results.length === 0 && <li className="text-slate-500">No AI key is saved.</li>}
          {results.map((r) => (
            <li key={r.id} className="flex flex-wrap items-baseline gap-x-2">
              <span className={r.ok ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>{r.ok ? 'OK' : 'FAILED'}</span>
              <span className="font-medium">{r.label}</span>
              <span className="font-mono text-[11px] text-slate-500">{r.model}</span>
              <span className="text-[11px] text-slate-500">{(r.ms / 1000).toFixed(1)}s</span>
              {r.error && <span className="basis-full break-words text-red-600">{r.error}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
