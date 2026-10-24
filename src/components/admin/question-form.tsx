'use client';
import { useActionState, useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import {
  KIND_LABELS,
  TRUE_FALSE_OPTIONS,
  validateQuestion,
  type QuestionInput,
  type QuestionKind
} from '@/lib/question-input';

export type QuestionFormState = { ok?: boolean; error?: string; message?: string; at?: number };
type Option = { id: string; text: string };

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];
const MAX = { SINGLE: 6, MULTI: 6, TRUE_FALSE: 2, ORDERING: 8 } as const;
const MIN = { SINGLE: 3, MULTI: 4, TRUE_FALSE: 2, ORDERING: 3 } as const;
const DIFFICULTY = ['1 · Easy', '2', '3 · Medium', '4', '5 · Hard'];

const blank = (n: number, ordering = false): Option[] =>
  Array.from({ length: n }, (_, i) => ({ id: ordering ? String(i + 1) : LETTERS[i], text: '' }));

/** Next id not already used — existing ids never change, so past answers stay valid. */
function nextId(options: Option[], ordering: boolean): string {
  const used = new Set(options.map((o) => o.id));
  if (!ordering) return LETTERS.find((l) => !used.has(l)) ?? '';
  for (let n = 1; ; n++) if (!used.has(String(n))) return String(n);
}

/**
 * Add / edit form for one question. Rules live in `validateQuestion()`
 * (checked here for instant feedback and again by the server action).
 */
export function QuestionForm({
  action,
  domains,
  initial,
  submitLabel,
  hidden
}: {
  action: (prev: QuestionFormState, fd: FormData) => Promise<QuestionFormState>;
  /** Blueprint domain names, in blueprint order. */
  domains: string[];
  initial?: Partial<QuestionInput>;
  submitLabel: string;
  hidden?: Record<string, string>;
}) {
  const startType = (initial?.type ?? 'SINGLE') as QuestionKind;
  const [type, setType] = useState<QuestionKind>(startType);
  const [domain, setDomain] = useState(initial?.domain ?? (domains.length === 1 ? domains[0] : ''));
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 3);
  const [stem, setStem] = useState(initial?.stem ?? '');
  const [options, setOptions] = useState<Option[]>(
    initial?.options?.length ? initial.options : startType === 'TRUE_FALSE' ? TRUE_FALSE_OPTIONS : blank(4, startType === 'ORDERING')
  );
  const [correct, setCorrect] = useState<string[]>(initial?.correct ?? []);
  const [explanation, setExplanation] = useState(initial?.explanation ?? '');
  const [references, setReferences] = useState(initial?.references ?? '');
  const [clientError, setClientError] = useState('');
  const [state, formAction, pending] = useActionState(action, {} as QuestionFormState);

  // After a successful add, clear the form for the next question (keep type + domain).
  useEffect(() => {
    if (!state.ok || initial?.stem) return;
    setStem('');
    setExplanation('');
    setReferences('');
    setCorrect([]);
    setOptions(type === 'TRUE_FALSE' ? TRUE_FALSE_OPTIONS : blank(4, type === 'ORDERING'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.at]);

  const ordering = type === 'ORDERING';
  const payload: QuestionInput = { type, domain, difficulty, stem, options, correct, explanation, references };

  function changeType(t: QuestionKind) {
    if (t === type) return;
    const filled = type === 'TRUE_FALSE' ? [] : options.filter((o) => o.text.trim());
    if (t === 'TRUE_FALSE') {
      setOptions(TRUE_FALSE_OPTIONS);
      setCorrect([]);
    } else {
      // Re-id only when switching between lettered options and numbered steps.
      const reId = (t === 'ORDERING') !== ordering || type === 'TRUE_FALSE';
      let next = reId ? filled.map((o, i) => ({ id: t === 'ORDERING' ? String(i + 1) : LETTERS[i], text: o.text })) : options;
      next = next.slice(0, MAX[t]);
      while (next.length < 4 && next.length < MAX[t]) next = [...next, { id: nextId(next, t === 'ORDERING'), text: '' }];
      setOptions(next);
      setCorrect(reId ? [] : t === 'SINGLE' ? correct.slice(0, 1) : correct);
    }
    setType(t);
  }

  function toggleCorrect(id: string) {
    if (type === 'MULTI') setCorrect((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    else setCorrect([id]);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= options.length) return;
    const next = [...options];
    [next[i], next[j]] = [next[j], next[i]];
    setOptions(next);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const res = validateQuestion(payload);
    if (!res.ok) {
      e.preventDefault();
      setClientError(res.error);
    } else {
      setClientError('');
    }
  }

  const error = clientError || state.error;
  const domainChoices = domain && !domains.includes(domain) ? [...domains, domain] : domains;

  return (
    <form action={formAction} onSubmit={onSubmit} className="grid gap-4">
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />

      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="label">Question type</span>
          <select className="input" value={type} onChange={(e) => changeType(e.target.value as QuestionKind)}>
            {(Object.keys(KIND_LABELS) as QuestionKind[]).map((k) => (
              <option key={k} value={k}>{KIND_LABELS[k]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Exam domain</span>
          {domainChoices.length ? (
            <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
              <option value="">Choose a domain…</option>
              {domainChoices.map((d) => (
                <option key={d} value={d}>{d}{domains.includes(d) ? '' : ' (not in blueprint)'}</option>
              ))}
            </select>
          ) : (
            <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. Security" />
          )}
        </label>
        <label className="block">
          <span className="label">Difficulty</span>
          <select className="input" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
            {DIFFICULTY.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="label">Question</span>
        <textarea className="input" rows={3} value={stem} onChange={(e) => setStem(e.target.value)} placeholder="Question text…" />
      </label>

      <div>
        <div className="label">
          {ordering
            ? 'Steps — enter them in the CORRECT order (learners see them shuffled)'
            : type === 'TRUE_FALSE'
              ? 'Answer'
              : type === 'MULTI'
                ? 'Options — tick every correct answer'
                : 'Options — select the one correct answer'}
        </div>
        <div className="grid gap-2">
          {options.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-center text-xs font-semibold text-slate-500">
                {ordering ? i + 1 : String.fromCharCode(65 + i)}
              </span>
              {type === 'TRUE_FALSE' ? (
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{o.text}</span>
              ) : (
                <input
                  className="input flex-1"
                  value={o.text}
                  onChange={(e) => setOptions(options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)))}
                  placeholder={ordering ? `Step ${i + 1}` : `Option ${String.fromCharCode(65 + i)}`}
                />
              )}
              {ordering ? (
                <span className="flex gap-1">
                  <button type="button" className="icon-btn" title="Move up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button type="button" className="icon-btn" title="Move down" onClick={() => move(i, 1)} disabled={i === options.length - 1}><ArrowDown className="h-3.5 w-3.5" /></button>
                </span>
              ) : (
                <label className="flex w-24 shrink-0 cursor-pointer items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type={type === 'MULTI' ? 'checkbox' : 'radio'}
                    name="correct-pick"
                    checked={correct.includes(o.id)}
                    onChange={() => toggleCorrect(o.id)}
                  />
                  Correct
                </label>
              )}
              {type !== 'TRUE_FALSE' && (
                <button
                  type="button"
                  className="icon-btn"
                  title="Remove"
                  disabled={options.length <= MIN[type]}
                  onClick={() => {
                    setOptions(options.filter((x) => x.id !== o.id));
                    setCorrect(correct.filter((c) => c !== o.id));
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {type !== 'TRUE_FALSE' && options.length < MAX[type] && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
            onClick={() => setOptions([...options, { id: nextId(options, ordering), text: '' }])}
          >
            <Plus className="h-3.5 w-3.5" /> Add {ordering ? 'step' : 'option'}
          </button>
        )}
      </div>

      <label className="block">
        <span className="label">Explanation</span>
        <textarea
          className="input"
          rows={3}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Why the correct answer is right — and why the others are wrong…"
        />
      </label>

      <label className="block">
        <span className="label">References (optional — one per line: URL, or Label | URL)</span>
        <textarea
          className="input font-mono text-[12px]"
          rows={2}
          value={references}
          onChange={(e) => setReferences(e.target.value)}
          placeholder="AWS docs — IAM roles | https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html"
        />
      </label>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && <p className="mr-auto text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
        {!error && state.ok && state.message && (
          <p className="mr-auto text-sm text-emerald-700 dark:text-emerald-400" role="status">{state.message}</p>
        )}
        <button className="btn-primary" disabled={pending}>{pending ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  );
}
