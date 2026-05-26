'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExplanationView } from '@/components/explanation-view';

export type RunnerQuestion = {
  id: string;
  stem: string;
  type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE';
  options: { id: string; text: string }[];
};

export type RunnerResponse = { answer: string[]; flagged?: boolean; submitted?: boolean; isCorrect?: boolean; correct?: string[]; explanation?: string };

export type ExamRunnerProps = {
  attemptId: string;
  mode: 'PRACTICE' | 'EXAM';
  isTeaser: boolean;
  examTitle: string;
  examVendor: string;
  questions: RunnerQuestion[];
  remainingSec: number;        // 0 for untimed
  initialResponses: Record<string, RunnerResponse>;
  teaserGateAt?: number[];     // e.g. [last] — show modal after answering this many in teaser
  onTeaserGate?: (count: number) => void;
  autoSubmitAtEnd?: boolean;   // teaser path for non-guests: auto-submit when all answered
};

export function ExamRunner(props: ExamRunnerProps) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, RunnerResponse>>(props.initialResponses || {});
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'incorrect' | 'flagged'>('all');
  const [remaining, setRemaining] = useState(props.remainingSec);
  const [submitted, setSubmitted] = useState(false);
  // Guards the teaser signup gate so it fires at most once per session —
  // once the guest has seen it (converted or dismissed), don't re-trigger.
  const [gateShown, setGateShown] = useState(false);
  const dirty = useRef(false);

  // Timer (Exam mode only)
  useEffect(() => {
    if (props.mode !== 'EXAM' || props.remainingSec <= 0) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [props.mode, props.remainingSec]);
  useEffect(() => {
    if (props.mode === 'EXAM' && props.remainingSec > 0 && remaining === 0 && !submitted) submitAttempt(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // Autosave every 15s if dirty
  useEffect(() => {
    const t = setInterval(async () => {
      if (!dirty.current) return;
      dirty.current = false;
      const payload = Object.fromEntries(
        Object.entries(answers).map(([qid, r]) => [qid, { answer: r.answer || [], flagged: r.flagged }])
      );
      await fetch('/api/attempts/autosave', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ attemptId: props.attemptId, responses: payload })
      }).catch(() => { dirty.current = true; });
    }, 15000);
    return () => clearInterval(t);
  }, [answers, props.attemptId]);

  // Beforeunload flush
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, []);

  const q = props.questions[idx];
  const stored = answers[q.id];
  const a: RunnerResponse = { ...stored, answer: stored?.answer ?? [] };

  const visible = useMemo(() => props.questions.map((_, i) => i).filter(i => {
    const r = answers[props.questions[i].id];
    if (filter === 'unanswered') return !r?.answer?.length;
    if (filter === 'incorrect') return r?.submitted && r.isCorrect === false;
    if (filter === 'flagged') return r?.flagged;
    return true;
  }), [answers, filter, props.questions]);

  const answeredCount = Object.values(answers).filter(r => r.answer?.length).length;

  // Proactively open the teaser signup gate as soon as a guest teaser is
  // complete, regardless of question types. Closes the bug where the gate
  // was wired only inside revealAnswer() and so was skipped when the last
  // answered question was MULTI (revealAnswer only runs for MULTI via the
  // explicit "Check answer" button).
  useEffect(() => {
    const isGuestTeaser = props.isTeaser && !props.autoSubmitAtEnd;
    if (isGuestTeaser && !gateShown && answeredCount >= props.questions.length) {
      setGateShown(true);
      props.onTeaserGate?.(answeredCount);
    }
  }, [answeredCount, gateShown, props.isTeaser, props.autoSubmitAtEnd, props.questions.length, props.onTeaserGate]);

  function setAnswer(answer: string[]) {
    setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], answer } }));
    dirty.current = true;
  }

  function toggle(optId: string) {
    if (a.submitted && props.mode === 'PRACTICE') return;
    const cur = a.answer || [];
    const next = q.type === 'MULTI'
      ? (cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId])
      : [optId];
    setAnswer(next);
    // PRACTICE mode auto-reveals the answer for single-pick types as soon as
    // the user clicks an option — no "Show answer" button needed.
    if (props.mode === 'PRACTICE' && q.type !== 'MULTI') {
      revealAnswer(next);
    }
  }

  async function revealAnswer(answer: string[]) {
    if (!answer.length) {
      alert('Select an option first.');
      return;
    }
    let j: any;
    try {
      const r = await fetch('/api/attempts/answer', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ attemptId: props.attemptId, questionId: q.id, answer, flagged: a.flagged })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      j = await r.json();
    } catch (e) {
      alert(`Couldn't reveal the answer (${(e as Error).message}). Check your connection and try again.`);
      return;
    }
    if (props.mode === 'PRACTICE') {
      setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], answer, submitted: true, isCorrect: j.isCorrect, correct: j.correct, explanation: j.explanation } }));
    }
    // Teaser gate check (after answering, not flagging)
    const newCount = answeredCount + (a.submitted ? 0 : 1);
    if (props.isTeaser && !gateShown && props.teaserGateAt?.includes(newCount)) {
      setGateShown(true);
      props.onTeaserGate?.(newCount);
    }
    // End-of-teaser auto-submit for non-guest users (no signup gate needed)
    if (props.autoSubmitAtEnd && newCount === props.questions.length) {
      setTimeout(() => { void submitAttempt(true); }, 600);
    }
  }

  // For MULTI questions in PRACTICE mode, the user still needs an explicit
  // confirm button since one click doesn't mean "done picking".
  function checkAnswer() {
    return revealAnswer(a.answer);
  }

  async function toggleFlag() {
    const flagged = !a.flagged;
    setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], flagged } }));
    await fetch('/api/attempts/mark', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ attemptId: props.attemptId, questionId: q.id, flagged })
    }).catch(() => {});
  }

  async function submitAttempt(force = false) {
    if (submitted) return;
    // Guest-teaser safety net: intercept Submit so a guest can never reach
    // /results without first seeing the signup gate. `force` (timer expiry)
    // bypasses; teasers have no timer anyway.
    const isGuestTeaser = props.isTeaser && !props.autoSubmitAtEnd;
    if (!force && isGuestTeaser && !gateShown) {
      setGateShown(true);
      props.onTeaserGate?.(answeredCount);
      return;
    }
    // EXAM mode requires every question answered before manual submit.
    // `force=true` is passed by the timer-expiry effect so time-out still submits.
    if (!force && props.mode === 'EXAM') {
      const unanswered = props.questions.length - answeredCount;
      if (unanswered > 0) {
        alert(`You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. Please answer all questions before submitting the exam.`);
        return;
      }
    }
    setSubmitted(true);
    // Final autosave
    const payload = Object.fromEntries(Object.entries(answers).map(([qid, r]) => [qid, { answer: r.answer || [], flagged: r.flagged }]));
    await fetch('/api/attempts/autosave', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attemptId: props.attemptId, responses: payload }) }).catch(() => {});
    const r = await fetch('/api/attempts/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attemptId: props.attemptId }) });
    if (r.ok) router.push(`/results/${props.attemptId}`);
  }

  function fmt(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  }

  const isK8sPerf = props.examVendor === 'Linux Foundation' && /CKAD?\b/i.test(props.examTitle);

  return (
    <div className="container-app py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="badge">{props.mode === 'EXAM' ? 'Exam mode' : 'Practice mode'}</span>
          {props.isTeaser && <span className="badge-brand">Free teaser</span>}
          <span className="text-slate-500">{props.examVendor} · {props.examTitle}</span>
          <span className="text-slate-500">· Q{idx + 1}/{props.questions.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {props.mode === 'EXAM' && props.remainingSec > 0 && (
            <span className={`badge ${remaining < 60 ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' : ''}`}>⏱ {fmt(remaining)}</span>
          )}
          <button onClick={toggleFlag} className={`btn-outline ${a.flagged ? 'border-amber-400 text-amber-700 dark:text-amber-300' : ''}`}><Flag className="mr-1 h-4 w-4 inline" />{a.flagged ? 'Flagged' : 'Flag'}</button>
          <button onClick={() => submitAttempt()} className="btn-primary-grad">Submit exam</button>
        </div>
      </div>

      {isK8sPerf && (
        <details className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm dark:border-blue-900 dark:bg-blue-950/40">
          <summary className="cursor-pointer font-medium text-blue-900 dark:text-blue-200">
            Practice these tasks hands-on — free Kubernetes playground
          </summary>
          <div className="mt-2 space-y-2 text-slate-700 dark:text-slate-200">
            <p>
              The real CKA / CKAD exam is performance-based — you solve tasks on a live cluster from a browser terminal. Open the Killercoda playground in a second tab and reproduce each question with <code className="rounded bg-white px-1 dark:bg-slate-800">kubectl</code> while you work through this set.
            </p>
            <p>
              <a
                href="https://killercoda.com/playgrounds/scenario/kubernetes"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 underline hover:no-underline dark:text-blue-300"
              >
                Open the free Kubernetes playground →
              </a>
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-300">
              <li>Spins up a single-node cluster in your browser — no signup, no install.</li>
              <li>For each question, also try to <em>produce</em> the resource: <code className="rounded bg-white px-1 dark:bg-slate-800">kubectl run</code>, <code className="rounded bg-white px-1 dark:bg-slate-800">create -f</code>, <code className="rounded bg-white px-1 dark:bg-slate-800">edit</code>, then verify with <code className="rounded bg-white px-1 dark:bg-slate-800">describe</code> / <code className="rounded bg-white px-1 dark:bg-slate-800">get -o yaml</code>.</li>
              <li>Practice imperative shortcuts you&apos;ll need under time pressure — <code className="rounded bg-white px-1 dark:bg-slate-800">--dry-run=client -o yaml</code>, <code className="rounded bg-white px-1 dark:bg-slate-800">kubectl explain</code>, <code className="rounded bg-white px-1 dark:bg-slate-800">alias k=kubectl</code>.</li>
              <li>Killercoda sessions expire after ~60 min of inactivity. KodeKloud runs the playground; we are not affiliated with them.</li>
            </ul>
          </div>
        </details>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="card p-6">
          <p className="text-base font-medium">{q.stem}</p>
          <div className="mt-4 space-y-2">
            {q.options.map((o, oi) => {
              const sel = a.answer.includes(o.id);
              const isAnswered = !!a.submitted;
              const correct = a.correct?.includes(o.id);
              const wrong = isAnswered && sel && !correct;
              return (
                <button
                  key={`${oi}-${o.id}`}
                  onClick={() => toggle(o.id)}
                  disabled={a.submitted && props.mode === 'PRACTICE'}
                  className={`flex w-full items-start justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm transition ${
                    isAnswered && correct ? 'border-green-500 bg-green-50 dark:bg-green-950/40' :
                    wrong ? 'border-red-500 bg-red-50 dark:bg-red-950/40' :
                    sel ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="inline-flex items-baseline gap-2">
                    <span className="shrink-0 select-none text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <OptionText text={o.text} />
                  </span>
                  {isAnswered && correct && (
                    <span className="shrink-0 rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">✓ Correct answer</span>
                  )}
                  {wrong && (
                    <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">✗ Your answer</span>
                  )}
                </button>
              );
            })}
          </div>
          {!a.submitted && props.mode === 'PRACTICE' && q.type === 'MULTI' && (
            <button
              onClick={checkAnswer}
              disabled={!a.answer.length}
              title={!a.answer.length ? 'Select at least one option first' : ''}
              className="btn-primary-grad mt-4 disabled:cursor-not-allowed disabled:opacity-50"
            >Check answer</button>
          )}
          {!a.submitted && props.mode === 'PRACTICE' && q.type !== 'MULTI' && !a.answer.length && (
            <p className="mt-4 text-xs text-slate-500">Pick an option to reveal the answer.</p>
          )}
          {a.submitted && a.explanation && (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
              <div className="mb-2 font-semibold">{a.isCorrect ? '✓ Correct' : '✗ Incorrect'}</div>
              <ExplanationView
                text={a.explanation}
                options={q.options}
                correctIds={a.correct ?? []}
              />
            </div>
          )}
          {props.mode === 'EXAM' && a.answer.length > 0 && (
            <button onClick={checkAnswer} className="btn-outline mt-4 text-xs">Save answer</button>
          )}
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setIdx(Math.max(0, idx - 1))} className="btn-outline" disabled={idx === 0}><ChevronLeft className="h-4 w-4" /> Previous</button>
            <button onClick={() => setIdx(Math.min(props.questions.length - 1, idx + 1))} className="btn-primary" disabled={idx === props.questions.length - 1}>Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>

        <aside className="card h-fit p-4">
          <div className="mb-3 flex flex-wrap gap-1 text-xs">
            {(['all', 'unanswered', 'incorrect', 'flagged'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`badge ${filter === f ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : ''}`}>{f}</button>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {props.questions.map((qq, i) => {
              const r = answers[qq.id];
              const hidden = !visible.includes(i);
              const cls = hidden ? 'opacity-30' :
                r?.isCorrect === true ? 'bg-green-100 text-green-800' :
                r?.isCorrect === false ? 'bg-red-100 text-red-800' :
                r?.answer?.length ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600';
              return (
                <button key={qq.id} onClick={() => setIdx(i)} className={`rounded-md py-1 text-xs ${cls} ${i === idx ? 'ring-2 ring-blue-500' : ''} ${r?.flagged ? 'border border-amber-400' : ''}`}>{i + 1}</button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">{answeredCount}/{props.questions.length} answered</p>
        </aside>
      </div>
    </div>
  );
}

/**
 * Renders one answer-option's text. For "code-like" answers (ISO dates,
 * identifiers, syntax-laden output snippets, CLI flags, …) it switches
 * to a monospace font with subtle styling so the answer reads as code,
 * not prose. For everything else it falls back to plain text.
 *
 * Conservative on what counts as code-like — prose answers like "A
 * DateTimeException is thrown" (4 spaces, no code symbols) stay as
 * prose. The detector trips only on short, syntax-heavy, or
 * date/identifier-shaped strings.
 */
function OptionText({ text }: { text: string }) {
  if (looksLikeCode(text)) {
    return (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-900 dark:bg-slate-800 dark:text-slate-100">
        {text}
      </code>
    );
  }
  return <span>{text}</span>;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:[Tt ].+)?$/;
const VERSION_RE = /^\d+(?:\.\d+){1,3}(?:-[\w.]+)?$/;
const DOTTED_ID_RE = /^[a-z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)+(?:\(\))?$/;
const SCREAMING_RE = /^[A-Z][A-Z0-9_]{2,}$/;
const CLI_FLAG_RE = /^--?[a-z][\w-]*(?:=[\S]+)?$/i;
const CODE_TOKENS_RE = /[;{}<>=]|::|=>|->|&&|\|\||!=|==/;

function looksLikeCode(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  // Cheap structural patterns — single-line, machine-shaped tokens.
  if (ISO_DATE_RE.test(t)) return true;
  if (VERSION_RE.test(t)) return true;
  if (DOTTED_ID_RE.test(t)) return true;
  if (SCREAMING_RE.test(t)) return true;
  if (CLI_FLAG_RE.test(t)) return true;

  // Anything with code-shaped punctuation AND few spaces (= dense
  // syntax, not prose with parenthetical remarks).
  const spaceCount = (t.match(/ /g) || []).length;
  if (spaceCount <= 1 && CODE_TOKENS_RE.test(t)) return true;

  // Parenthesised expressions like `foo(x, y)` — only when the whole
  // string is dominated by the call shape, not prose with a single
  // parenthetical aside.
  if (/^[\w.$]+\([^)]*\)$/.test(t)) return true;

  return false;
}
