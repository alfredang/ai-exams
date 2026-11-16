'use client';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, GitBranch, Globe, Search, Sparkles, X, Youtube } from 'lucide-react';
import { planAllocation } from '@/lib/question-pool';

export type GeneratorExam = {
  id: string;
  code: string;
  title: string;
  vendor: string;
  /** Published questions in the pool. */
  pool: number;
  domains: { name: string; weight: number; pool: number }[];
};
type Kind = 'SINGLE' | 'MULTI' | 'ORDERING';
type Made = { id: string; stem: string; domain: string; verdict: string };
type SourceKind = 'AI' | 'YOUTUBE' | 'URL' | 'GITHUB' | 'PDF';
const GITHUB_LINK = /^https:\/\/(github\.com|gist\.github\.com|raw\.githubusercontent\.com|[a-z0-9-]+\.github\.io)\//i;
type ReadSource = { id: string; label: string; chars: number; key: string };

const SOURCES: { value: SourceKind; label: string; icon: typeof Sparkles; hint: string }[] = [
  { value: 'AI', label: 'AI generation', icon: Sparkles, hint: 'AI writes new questions for the exam domains' },
  { value: 'YOUTUBE', label: 'YouTube link', icon: Youtube, hint: "from the video's transcript" },
  { value: 'URL', label: 'Web link', icon: Globe, hint: 'from a web page (docs, study guide, quiz)' },
  { value: 'GITHUB', label: 'GitHub link', icon: GitBranch, hint: 'from a file or README in a public GitHub repo; extracted questions are always rephrased' },
  { value: 'PDF', label: 'Upload PDF', icon: FileText, hint: 'up to 25 MB; scanned PDFs are read by AI' }
];

const KINDS: { value: Kind; label: string; hint: string }[] = [
  { value: 'SINGLE', label: 'MCQ', hint: 'one correct answer of 4' },
  { value: 'MULTI', label: 'Multiple select', hint: '2–3 correct of 5–6, "Select TWO"' },
  { value: 'ORDERING', label: 'Sequencing', hint: 'put 4–6 steps in order' }
];

/** Mirrors planDomainCounts() on the server: split by blueprint weight. */
function preview(domains: GeneratorExam['domains'], total: number): Record<string, number> {
  if (!domains.length || total < 1) return {};
  const weighted = domains.some((d) => d.weight > 0) ? domains : domains.map((d) => ({ ...d, weight: 1 }));
  return planAllocation(weighted, Object.fromEntries(weighted.map((d) => [d.name, total])), total);
}

/**
 * "AI Generate" button + pop-up form for the AI Question and Answer Generator:
 * exam (when more than one is offered), source (AI generation, YouTube link,
 * web link or PDF upload — a source is read first via
 * /api/admin/exams/[id]/sources), Extract / Generate mode with an optional
 * Rephrase, number of questions, question types and exam domains. Streams
 * from /api/admin/exams/[id]/ai-generate: every question is validated, its
 * answer key checked by AI, and it is published straight into the pool.
 * Without an OpenAI API key (`configured` false) the same form queues the
 * request for the local AI agents instead (POST /api/admin/generation-requests,
 * see src/lib/generation-requests.ts).
 */
export function AiGenerateDialog({
  exams,
  initialExamId,
  defaultOpen = false,
  configured,
  providers,
  triggerLabel = 'AI Generate',
  triggerClassName = 'inline-flex h-10 items-center gap-1.5 rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white hover:bg-violet-700'
}: {
  exams: GeneratorExam[];
  initialExamId?: string;
  defaultOpen?: boolean;
  /** An OpenAI API key is saved. */
  configured: boolean;
  /** Model label for the footer, e.g. "OpenAI gpt-6.1-sol". */
  providers: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const single = exams.length === 1;
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false); // portal target exists only in the browser
  useEffect(() => setMounted(true), []);
  const [examId, setExamId] = useState(single ? exams[0].id : exams.some((e) => e.id === initialExamId) ? initialExamId! : '');
  const [filter, setFilter] = useState('');
  const [count, setCount] = useState(10);
  const [sourceKind, setSourceKind] = useState<SourceKind>('AI');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'generate' | 'extract'>('generate');
  const [rephrase, setRephrase] = useState(true);
  const [read, setRead] = useState<ReadSource | null>(null);
  const [phase, setPhase] = useState<'' | 'reading' | 'generating'>('');
  const [fixed, setFixed] = useState(0);
  const [allTypes, setAllTypes] = useState(true);
  const [kinds, setKinds] = useState<Kind[]>([]);
  const [allDomains, setAllDomains] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<Made[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<number | null>(null);
  const [queued, setQueued] = useState(false);
  const isLink = sourceKind === 'YOUTUBE' || sourceKind === 'URL' || sourceKind === 'GITHUB';
  const mustRephrase = sourceKind === 'GITHUB';

  const exam = exams.find((e) => e.id === examId);
  const domains = exam?.domains ?? [];
  const chosen = allDomains ? domains : domains.filter((d) => picked.includes(d.name));
  const split = useMemo(() => preview(chosen, count), [chosen, count]);
  const shownExams = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const list = needle ? exams.filter((e) => `${e.vendor} ${e.code} ${e.title}`.toLowerCase().includes(needle)) : exams;
    return exam && !list.includes(exam) ? [exam, ...list] : list;
  }, [filter, exams, exam]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy]);

  function pickExam(id: string) {
    setExamId(id);
    setAllDomains(true);
    setPicked([]);
    setMade([]);
    setCreated(null);
    setRead(null);
  }

  // What the current source inputs are, so an already-read source is reused.
  const sourceKey = sourceKind === 'PDF' ? (file ? `${examId}:pdf:${file.name}:${file.size}:${file.lastModified}` : '') : `${examId}:${sourceKind}:${link.trim()}`;

  async function readSource(): Promise<ReadSource> {
    if (read && read.key === sourceKey) return read;
    setPhase('reading');
    let res: Response;
    if (sourceKind === 'PDF') {
      const fd = new FormData();
      fd.append('file', file!);
      res = await fetch(`/api/admin/exams/${examId}/sources`, { method: 'POST', body: fd });
    } else {
      res = await fetch(`/api/admin/exams/${examId}/sources`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: sourceKind === 'GITHUB' ? 'URL' : sourceKind, url: link.trim() })
      });
    }
    const j = await res.json().catch(() => null);
    if (!res.ok || !j?.id) throw new Error(j?.error || `Could not read the source (${res.status})`);
    const out = { id: j.id as string, label: j.label as string, chars: j.chars as number, key: sourceKey };
    setRead(out);
    return out;
  }

  function toggleKind(k: Kind) {
    if (allTypes) {
      setAllTypes(false);
      setKinds([k]);
    } else setKinds((ks) => (ks.includes(k) ? ks.filter((x) => x !== k) : [...ks, k]));
  }

  function toggleDomain(name: string) {
    if (allDomains) {
      setAllDomains(false);
      setPicked([name]);
    } else setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));
  }

  async function generate() {
    setError('');
    setCreated(null);
    setQueued(false);
    setWarnings([]);
    setMade([]);
    if (!exam) return setError('Select an exam.');
    if (!count || count < 1 || count > 200) return setError('Enter between 1 and 200 questions.');
    if (isLink && !/^https?:\/\/\S+\.\S+/.test(link.trim())) return setError('Paste the full link, starting with https://');
    if (sourceKind === 'GITHUB' && !GITHUB_LINK.test(link.trim())) return setError('Paste a github.com link (a file, README or gist).');
    if (sourceKind === 'PDF' && !file) return setError('Choose a PDF file.');
    if (sourceKind === 'PDF' && file && file.size > 25 * 1024 * 1024) return setError('PDFs up to 25 MB, please.');
    if (!allTypes && !kinds.length) return setError('Tick at least one question type, or choose All types.');
    if (!allDomains && !picked.length) return setError('Tick at least one exam domain, or choose All exam domains.');
    setBusy(true);
    setFixed(0);
    try {
      const source = sourceKind === 'AI' ? null : await readSource();
      setPhase('generating');
      if (!configured) {
        // No OpenAI API key: hand the request to the local AI agents.
        const queue = await fetch('/api/admin/generation-requests', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            examId: exam.id,
            count,
            types: allTypes ? [] : kinds,
            domains: allDomains ? [] : picked,
            ...(source ? { sourceId: source.id, mode, rephrase: rephrase || mustRephrase } : {})
          })
        });
        const j = await queue.json().catch(() => null);
        if (!queue.ok) throw new Error(j?.error || `Request failed (${queue.status})`);
        setQueued(true);
        window.dispatchEvent(new Event('generation-requests:changed'));
        router.refresh();
        return;
      }
      const res = await fetch(`/api/admin/exams/${exam.id}/ai-generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          count,
          types: allTypes ? [] : kinds,
          domains: allDomains ? [] : picked,
          ...(source ? { sourceId: source.id, mode, rephrase: rephrase || mustRephrase } : {})
        })
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split('\n\n');
        buf = events.pop() ?? '';
        for (const block of events) {
          const event = /^event: (.*)$/m.exec(block)?.[1];
          const data = JSON.parse(/^data: (.*)$/m.exec(block)?.[1] ?? 'null');
          if (event === 'question') setMade((m) => [{ id: data.id, stem: data.stem, domain: data.domain, verdict: data.verdict }, ...m]);
          else if (event === 'warn') setWarnings((w) => [...w, data.message]);
          else if (event === 'error') setError(data.message);
          else if (event === 'done') {
            setCreated(data.created);
            setFixed(data.fixed ?? 0);
          }
        }
      }
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Generation failed');
    } finally {
      setBusy(false);
      setPhase('');
    }
  }

  const chip = (on: boolean) =>
    `inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-[13px] transition focus-within:ring-2 focus-within:ring-violet-400 ${
      on
        ? 'border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200'
        : 'border-slate-200 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200'
    }`;
  const done = made.length;

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && setOpen(false)}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="ai-gen-title" className="my-auto w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h2 id="ai-gen-title" className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            AI Question and Answer Generator
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={busy}
            aria-label="Close"
            className="rounded p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {
          <fieldset disabled={busy} className="grid gap-5 px-5 py-4">
            {!configured && (
              <p className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-[12px] leading-snug text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">
                No OpenAI API key is saved, so this request is queued for the AI agents: gpt-6.1-sol writes the questions and Claude Opus
                independently answers each one. Only questions both agree on are published. Requests run within a few minutes while the
                agent computer is on.{' '}
                <Link href="/admin-dashboard/settings/credentials" className="font-medium underline">
                  Add an OpenAI API key
                </Link>{' '}
                to generate instantly instead.
              </p>
            )}
            {single ? (
              <p className="text-[13px] text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{exam!.code}</span> — {exam!.title}
              </p>
            ) : (
              <div>
                <span className="label">Exam</span>
                <div className="grid gap-2 sm:grid-cols-[12rem_1fr]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter" aria-label="Filter exams" className="input pl-8" />
                  </div>
                  <select className="input" value={examId} onChange={(e) => pickExam(e.target.value)} aria-label="Exam">
                    <option value="">Select an exam… ({shownExams.length})</option>
                    {[...new Set(shownExams.map((e) => e.vendor))].map((v) => (
                      <optgroup key={v} label={v}>
                        {shownExams.filter((e) => e.vendor === v).map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.code} — {e.title} · {e.pool} in pool
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <span className="label">Source</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SOURCES.map((src) => {
                  const Icon = src.icon;
                  return (
                    <label key={src.value} className={chip(sourceKind === src.value)} title={src.hint}>
                      <input type="radio" name="ai-source" className="sr-only" checked={sourceKind === src.value} onChange={() => setSourceKind(src.value)} />
                      <Icon className="h-4 w-4 shrink-0" /> {src.label}
                    </label>
                  );
                })}
              </div>
              <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{SOURCES.find((x) => x.value === sourceKind)!.hint}.</p>
              {isLink && (
                <input
                  type="url"
                  className="input mt-2"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder={sourceKind === 'YOUTUBE' ? 'https://www.youtube.com/watch?v=…' : sourceKind === 'GITHUB' ? 'https://github.com/owner/repo/blob/main/README.md' : 'https://learn.microsoft.com/…'}
                  aria-label={sourceKind === 'YOUTUBE' ? 'YouTube link' : sourceKind === 'GITHUB' ? 'GitHub link' : 'Web link'}
                />
              )}
              {sourceKind === 'PDF' && (
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="mt-2 block w-full text-[13px] text-slate-700 file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:text-[13px] file:font-medium dark:text-slate-200 dark:file:bg-slate-800 dark:file:text-slate-100"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  aria-label="PDF file"
                />
              )}
              {read && read.key === sourceKey && (
                <p className="mt-1 text-[12px] text-emerald-700 dark:text-emerald-400">
                  Read: {read.label} · {read.chars.toLocaleString()} characters
                </p>
              )}
            </div>

            {sourceKind !== 'AI' && (
              <div>
                <span className="label">From this source, AI should</span>
                <div className="flex flex-wrap gap-2">
                  <label className={chip(mode === 'extract')}>
                    <input type="radio" name="ai-mode" checked={mode === 'extract'} onChange={() => setMode('extract')} /> Extract its questions &amp; answers
                  </label>
                  <label className={chip(mode === 'generate')}>
                    <input type="radio" name="ai-mode" checked={mode === 'generate'} onChange={() => setMode('generate')} /> Generate new questions from it
                  </label>
                </div>
                {mode === 'extract' && (
                  <label className="mt-2 flex min-h-10 cursor-pointer items-center gap-2 text-[13px] text-slate-700 dark:text-slate-200">
                    <input type="checkbox" checked={rephrase || mustRephrase} disabled={mustRephrase} onChange={(e) => setRephrase(e.target.checked)} />
                    Rephrase the questions (same meaning and answer, new wording){mustRephrase ? ' — always on for GitHub' : ''}
                  </label>
                )}
              </div>
            )}

            <label className="block max-w-[12rem]">
              <span className="label">{sourceKind !== 'AI' && mode === 'extract' ? 'Up to # of questions' : '# of questions'}</span>
              <input type="number" min={1} max={200} className="input" value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </label>

            <div>
              <span className="label">Question types{sourceKind !== 'AI' && mode === 'extract' ? ' (extracted questions keep their own type)' : ''}</span>
              <div className="flex flex-wrap gap-2">
                <label className={chip(allTypes)}>
                  <input type="radio" checked={allTypes} onChange={() => setAllTypes(true)} /> All types
                </label>
                {KINDS.map((k) => (
                  <label key={k.value} className={chip(!allTypes && kinds.includes(k.value))} title={k.hint}>
                    <input type="checkbox" checked={!allTypes && kinds.includes(k.value)} onChange={() => toggleKind(k.value)} />
                    {k.label}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                {allTypes
                  ? 'A mix: mostly MCQ, about 1 in 5 multiple select, about 1 in 10 sequencing.'
                  : kinds.length
                    ? KINDS.filter((k) => kinds.includes(k.value)).map((k) => `${k.label}: ${k.hint}`).join(' · ')
                    : 'Tick one or more types.'}
              </p>
            </div>

            <div>
              <span className="label">Exam domains</span>
              {!exam ? (
                <p className="text-[12px] text-slate-500">Select an exam first.</p>
              ) : domains.length === 0 ? (
                <p className="text-[12px] text-slate-500">This question bank has no domain blueprint — questions are tagged &quot;General&quot;.</p>
              ) : (
                <>
                  <label className={`${chip(allDomains)} mb-2`}>
                    <input type="radio" checked={allDomains} onChange={() => setAllDomains(true)} /> All exam domains (split by exam weight)
                  </label>
                  <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                    {domains.map((d) => {
                      const on = allDomains || picked.includes(d.name);
                      return (
                        <li key={d.name}>
                          <label className="flex min-h-10 cursor-pointer items-center gap-2 px-3 py-1.5 text-[13px]">
                            <input type="checkbox" checked={!allDomains && picked.includes(d.name)} onChange={() => toggleDomain(d.name)} />
                            <span className={`flex-1 ${on ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>{d.name}</span>
                            <span className="hidden text-right text-[12px] text-slate-500 sm:inline">{d.weight}% · {d.pool} in pool</span>
                            <span className="w-10 text-right text-[12px] font-semibold text-violet-700 dark:text-violet-300">{on ? `+${split[d.name] ?? 0}` : ''}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </fieldset>
        }

        {
          <div className="grid gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
            {(busy || done > 0) && (
              <div className="h-1.5 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                <div className="h-full bg-violet-600 transition-all" style={{ width: `${Math.min(100, (done / Math.max(1, count)) * 100)}%` }} />
              </div>
            )}
            {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
            {busy && phase === 'reading' && (
              <p className="text-sm text-slate-600 dark:text-slate-300" role="status">Reading the source…</p>
            )}
            {queued && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
                Queued for the AI agents. Progress shows under Agent requests on the AI Q&amp;A Generator page; you can close this window.
              </p>
            )}
            {created !== null && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
                {created} question{created === 1 ? '' : 's'} added to the pool
                {fixed > 0 ? ` (${fixed} answer key${fixed === 1 ? '' : 's'} corrected by the AI check)` : ''}.
              </p>
            )}
            {warnings.length > 0 && (
              <details className="text-[12px] text-amber-700 dark:text-amber-400">
                <summary>{warnings.length} warning{warnings.length === 1 ? '' : 's'}</summary>
                <ul className="mt-1 list-disc pl-5">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </details>
            )}
            {made.length > 0 && (
              <ul className="max-h-40 space-y-1 overflow-y-auto text-[12px] text-slate-700 dark:text-slate-300">
                {made.map((q) => (
                  <li key={q.id} className="truncate">
                    <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{q.domain}</span>
                    {q.verdict === 'fixed' && <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">key corrected</span>}
                    {q.stem}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <p className="mr-auto text-[11px] text-slate-500 dark:text-slate-400">
                {configured ? (
                  <>
                    AI: <span className="font-mono">{providers}</span>. Each answer key is checked by AI, then the question is published to the pool.
                  </>
                ) : (
                  'AI agents: gpt-6.1-sol writes, Claude Opus checks each answer, then the question is published to the pool.'
                )}
              </p>
              {exam && created !== null && created > 0 && (
                <a
                  href={`/admin-dashboard/exams/${exam.id}#questions`}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center rounded-md border border-slate-300 px-4 text-[13px] font-medium text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
                >
                  View in question bank →
                </a>
              )}
              <button
                type="button"
                onClick={generate}
                disabled={busy || !exam}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {busy
                  ? phase === 'reading'
                    ? 'Reading source…'
                    : configured
                      ? `Working… ${done}/${count}`
                      : 'Queuing…'
                  : !configured
                    ? `Queue ${count || ''} question${count === 1 ? '' : 's'} for the AI agents`
                    : sourceKind !== 'AI' && mode === 'extract'
                    ? `Extract up to ${count || ''} question${count === 1 ? '' : 's'}`
                    : `Generate ${count || ''} question${count === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        <Sparkles className="h-4 w-4" /> {triggerLabel}
      </button>
      {/* Portalled: the admin header's backdrop-blur would trap a fixed overlay. */}
      {open && mounted && createPortal(dialog, document.body)}
    </>
  );
}
