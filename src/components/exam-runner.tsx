'use client';
// Build marker: force-rebuild 2026-05-28 — Coolify Docker layer cache
// was silently reusing the pre-d04565c image despite "successful" redeploys.
// This comment line is the noop change that invalidates the COPY layer so
// the exam-runner edits from PR #72 actually make it into the bundle.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, Loader2, X } from 'lucide-react';
import { ExplanationView } from '@/components/explanation-view';
import { shuffleSeeded } from '@/lib/shuffle';

export type RunnerQuestion = {
  id: string;
  stem: string;
  type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE';
  options: { id: string; text: string }[];
  domain?: string;
};

// `references` rows come from Question.references JSON — historically either
// plain URL strings or { url, label } objects depending on the seed/generator.
export type RunnerReference = string | { url?: string; label?: string };
export type RunnerResponse = { answer: string[]; flagged?: boolean; submitted?: boolean; isCorrect?: boolean; correct?: string[]; explanation?: string; references?: RunnerReference[] };

export type ExamRunnerProps = {
  attemptId: string;
  mode: 'PRACTICE' | 'EXAM';
  isTeaser: boolean;
  examTitle: string;
  examVendor: string;
  questions: RunnerQuestion[];
  remainingSec: number;        // 0 for untimed
  initialResponses: Record<string, RunnerResponse>;
};

const TYPE_HINT: Record<RunnerQuestion['type'], string> = {
  SINGLE: 'Select ONE answer',
  MULTI: 'Select ALL that apply',
  TRUE_FALSE: 'True or False'
};

const LETTERS = 'ABCDEFGHIJ';

export function ExamRunner(props: ExamRunnerProps) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, RunnerResponse>>(props.initialResponses || {});
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'incorrect' | 'flagged'>('all');
  const [remaining, setRemaining] = useState(props.remainingSec);
  const [submitted, setSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const dirty = useRef(false);
  const examSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer (Exam mode only)
  useEffect(() => {
    if (props.mode !== 'EXAM' || props.remainingSec <= 0) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [props.mode, props.remainingSec]);
  useEffect(() => {
    if (props.mode === 'EXAM' && props.remainingSec > 0 && remaining === 0 && !submitted) {
      setTimeUp(true);
      submitAttempt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  async function flushAutosave(current: Record<string, RunnerResponse>) {
    const payload = Object.fromEntries(
      Object.entries(current).map(([qid, r]) => [qid, { answer: r.answer || [], flagged: r.flagged }])
    );
    setSaveState('saving');
    try {
      const r = await fetch('/api/attempts/autosave', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ attemptId: props.attemptId, responses: payload })
      });
      if (!r.ok) throw new Error(String(r.status));
      setSaveState('saved');
    } catch {
      dirty.current = true;
      setSaveState('idle');
    }
  }

  // Autosave every 15s if dirty
  useEffect(() => {
    const t = setInterval(() => {
      if (!dirty.current) return;
      dirty.current = false;
      flushAutosave(answers);
    }, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Shuffle option positions per-attempt for SINGLE / MULTI questions so the
  // correct answer isn't always in the same slot across users and attempts.
  // Seed = (attemptId, questionId) → deterministic within the attempt, so
  // Previous/Next navigation doesn't re-shuffle on each render. TRUE_FALSE
  // is left untouched — convention is True before False, swapping is jarring
  // with no anti-cheat benefit (only two options anyway).
  const displayOptions = useMemo(() => {
    if (q.type === 'TRUE_FALSE') return q.options;
    return shuffleSeeded(q.options, `${props.attemptId}:${q.id}`);
  }, [q.options, q.type, q.id, props.attemptId]);

  const visible = useMemo(() => props.questions.map((_, i) => i).filter(i => {
    const r = answers[props.questions[i].id];
    if (filter === 'unanswered') return !r?.answer?.length;
    if (filter === 'incorrect') return r?.submitted && r.isCorrect === false;
    if (filter === 'flagged') return r?.flagged;
    return true;
  }), [answers, filter, props.questions]);

  const answeredCount = Object.values(answers).filter(r => r.answer?.length).length;
  const flaggedCount = Object.values(answers).filter(r => r.flagged).length;
  const unansweredIdx = props.questions.map((qq, i) => i).filter(i => !answers[props.questions[i].id]?.answer?.length);

  const goto = useCallback((i: number) => {
    setIdx(Math.min(props.questions.length - 1, Math.max(0, i)));
  }, [props.questions.length]);

  function setAnswer(answer: string[]) {
    setAnswers(prev => {
      const next = { ...prev, [q.id]: { ...prev[q.id], answer } };
      // EXAM mode persists each answer shortly after the pick (debounced so a
      // burst of MULTI clicks becomes one request). The 15s autosave and the
      // navigation flush remain as safety nets — real exam software never asks
      // the candidate to click "Save".
      if (props.mode === 'EXAM') {
        if (examSaveTimer.current) clearTimeout(examSaveTimer.current);
        const qid = q.id;
        const flagged = prev[qid]?.flagged;
        examSaveTimer.current = setTimeout(async () => {
          setSaveState('saving');
          try {
            const r = await fetch('/api/attempts/answer', {
              method: 'POST', headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ attemptId: props.attemptId, questionId: qid, answer, flagged })
            });
            if (!r.ok) throw new Error(String(r.status));
            setSaveState('saved');
          } catch {
            setSaveState('idle'); // dirty flag below keeps the autosave net
          }
        }, 700);
      }
      return next;
    });
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

  const [revealErr, setRevealErr] = useState('');
  async function revealAnswer(answer: string[]) {
    if (!answer.length) return;
    setRevealErr('');
    let j: any;
    try {
      const r = await fetch('/api/attempts/answer', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ attemptId: props.attemptId, questionId: q.id, answer, flagged: a.flagged })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      j = await r.json();
    } catch (e) {
      setRevealErr(`Couldn't check the answer (${(e as Error).message}). Check your connection and try again.`);
      return;
    }
    if (props.mode === 'PRACTICE') {
      setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], answer, submitted: true, isCorrect: j.isCorrect, correct: j.correct, explanation: j.explanation, references: Array.isArray(j.references) ? j.references : undefined } }));
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
    // EXAM mode requires every question answered before manual submit.
    // `force=true` is passed by the timer-expiry effect so time-out still submits.
    if (!force && props.mode === 'EXAM' && unansweredIdx.length > 0) return;
    setSubmitted(true);
    setSubmitErr('');
    // Final autosave
    const payload = Object.fromEntries(Object.entries(answers).map(([qid, r]) => [qid, { answer: r.answer || [], flagged: r.flagged }]));
    await fetch('/api/attempts/autosave', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attemptId: props.attemptId, responses: payload }) }).catch(() => {});
    const r = await fetch('/api/attempts/submit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attemptId: props.attemptId }) }).catch(() => null);
    if (r?.ok) {
      router.push(`/results/${props.attemptId}`);
    } else {
      setSubmitted(false);
      setTimeUp(false);
      setSubmitErr('Submission failed — check your connection and try again. Your answers are saved.');
    }
  }

  // Keyboard shortcuts: ← / → navigate, F toggles the flag. Disabled while
  // the review modal is open or when focus is in a form field.
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (showReview || timeUp) return;
      const el = e.target as HTMLElement;
      if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      if (e.key === 'ArrowRight') goto(idx + 1);
      else if (e.key === 'ArrowLeft') goto(idx - 1);
      else if (e.key === 'f' || e.key === 'F') toggleFlag();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, showReview, timeUp, answers]);

  function fmt(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  }

  const timed = props.mode === 'EXAM' && props.remainingSec > 0;
  const timerTone = remaining < 60
    ? 'animate-pulse bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
    : remaining < 300
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';

  const progressPct = Math.round((answeredCount / props.questions.length) * 100);
  const isK8sPerf = props.examVendor === 'Linux Foundation' && /CKAD?\b/i.test(props.examTitle);

  return (
    <div className="container-app py-6">
      {/* Sticky exam header — sits directly under the h-24 global nav */}
      <div className="sticky top-24 z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 xl:-mx-16 xl:px-16">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="badge">{props.mode === 'EXAM' ? 'Exam mode' : 'Practice mode'}</span>
            {props.isTeaser && <span className="badge-brand">Free teaser</span>}
            <span className="hidden truncate text-slate-500 md:inline">{props.examVendor} · {props.examTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex" aria-live="polite">
              {saveState === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>}
              {saveState === 'saved' && <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Saved</>}
            </span>
            {timed && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-sm font-semibold tabular-nums ${timerTone}`}>
                <Clock className="h-4 w-4" /> {fmt(remaining)}
              </span>
            )}
            <button
              onClick={toggleFlag}
              title="Flag this question for review (F)"
              className={`btn-outline ${a.flagged ? 'border-amber-400 text-amber-700 dark:text-amber-300' : ''}`}
            >
              <Flag className={`mr-1 inline h-4 w-4 ${a.flagged ? 'fill-amber-400' : ''}`} />{a.flagged ? 'Flagged' : 'Flag'}
            </button>
            <button onClick={() => setShowReview(true)} className="btn-primary-grad">
              {props.mode === 'EXAM' ? 'Review & submit' : 'Finish & see results'}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={props.questions.length}>
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="whitespace-nowrap text-xs tabular-nums text-slate-500">{answeredCount}/{props.questions.length} answered</span>
        </div>
      </div>

      {timed && remaining < 300 && remaining > 0 && (
        <div className={`mb-4 flex items-center gap-2 rounded-md border p-3 text-sm ${remaining < 60 ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200' : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {remaining < 60 ? 'Less than a minute left — your exam will auto-submit when the timer reaches zero.' : 'Less than 5 minutes remaining. Unanswered questions score zero.'}
        </div>
      )}

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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold uppercase tracking-wide">Question {idx + 1} of {props.questions.length}</span>
              {q.domain && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{q.domain}</span>
              )}
            </span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${q.type === 'MULTI' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {TYPE_HINT[q.type]}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-base font-medium leading-relaxed">{q.stem}</p>
          <div className="mt-5 space-y-2">
            {displayOptions.map((o, oi) => {
              const sel = a.answer.includes(o.id);
              const isAnswered = !!a.submitted;
              const correct = a.correct?.includes(o.id);
              const wrong = isAnswered && sel && !correct;
              return (
                <button
                  key={`${oi}-${o.id}`}
                  onClick={() => toggle(o.id)}
                  disabled={a.submitted && props.mode === 'PRACTICE'}
                  aria-pressed={sel}
                  className={`group flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left text-sm transition ${
                    isAnswered && correct ? 'border-green-500 bg-green-50 dark:bg-green-950/40' :
                    wrong ? 'border-red-500 bg-red-50 dark:bg-red-950/40' :
                    sel ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-950/40' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    isAnswered && correct ? 'border-green-600 bg-green-600 text-white' :
                    wrong ? 'border-red-600 bg-red-600 text-white' :
                    sel ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-500 group-hover:border-slate-400 dark:border-slate-600 dark:text-slate-400'
                  }`}>
                    {sel && !isAnswered ? <Check className="h-3.5 w-3.5" /> : LETTERS[oi] ?? '?'}
                  </span>
                  <span className="flex-1">{o.text}</span>
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
          {revealErr && <p className="mt-3 text-xs text-red-600">{revealErr}</p>}
          {!a.submitted && props.mode === 'PRACTICE' && q.type !== 'MULTI' && !a.answer.length && (
            <p className="mt-4 text-xs text-slate-500">Pick an option to reveal the answer.</p>
          )}
          {a.submitted && a.explanation && (
            <div className={`mt-4 rounded-md border p-4 text-sm ${a.isCorrect ? 'border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-950/20' : 'border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20'}`}>
              <div className={`mb-2 font-semibold ${a.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{a.isCorrect ? '✓ Correct' : '✗ Incorrect'}</div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested Answer</div>
              <ExplanationView
                text={a.explanation}
                options={q.options}
                correctIds={a.correct ?? []}
              />
              {!!a.references?.length && (
                <div className="mt-3 border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
                  <div className="mb-1 font-semibold text-slate-600 dark:text-slate-300">References</div>
                  <ul className="space-y-1">
                    {a.references.map((ref, i) => {
                      const url = typeof ref === 'string' ? ref : ref?.url || '';
                      const label = typeof ref === 'string' ? ref : ref?.label || ref?.url || '';
                      if (!label) return null;
                      return (
                        <li key={i}>
                          {/^https?:\/\//.test(url)
                            ? <a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-blue-700 underline hover:no-underline dark:text-blue-300">{label}</a>
                            : <span className="text-slate-600 dark:text-slate-300">{label}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            {/* Hide Previous entirely on the first question (nothing to go
                back to). The empty <div> keeps it occupying the left slot so
                justify-between still right-aligns Next. Mirrors the Next-hide
                on the last question below. */}
            {idx > 0 ? (
              <button onClick={() => goto(idx - 1)} className="btn-outline"><ChevronLeft className="h-4 w-4" /> Previous</button>
            ) : (
              <div />
            )}
            {/* MULTI in PRACTICE: the right slot holds "Check answer" until the
                user confirms their picks (one click ≠ done picking). Next is
                hidden until then, so they can't skip past without checking —
                and it's disabled until at least one option is selected. Once
                checkAnswer() flips a.submitted, this falls through to Next. */}
            {!a.submitted && props.mode === 'PRACTICE' && q.type === 'MULTI' ? (
              <button
                onClick={checkAnswer}
                disabled={!a.answer.length}
                title={!a.answer.length ? 'Select at least one option first' : ''}
                className="btn-primary-grad disabled:cursor-not-allowed disabled:opacity-50"
              >Check answer</button>
            ) : (
              /* Hide Next entirely on the last question — there's nothing
                 to navigate to. Submit button stays available in the header
                 bar for the explicit-finish action. (Per user feedback
                 2026-05-26: the disabled Next button on Q10/10 was visually
                 indistinguishable from active and added clutter.) */
              idx < props.questions.length - 1 && (
                <button onClick={() => goto(idx + 1)} className="btn-primary">Next <ChevronRight className="h-4 w-4" /></button>
              )
            )}
          </div>
          <p className="mt-4 hidden text-center text-[11px] text-slate-400 lg:block">
            Keyboard: <kbd className="rounded border border-slate-300 px-1 dark:border-slate-600">←</kbd>{' '}
            <kbd className="rounded border border-slate-300 px-1 dark:border-slate-600">→</kbd> to navigate ·{' '}
            <kbd className="rounded border border-slate-300 px-1 dark:border-slate-600">F</kbd> to flag
          </p>
        </div>

        <aside className="card h-fit p-4 lg:sticky lg:top-52">
          <div className="mb-3 flex flex-wrap gap-1 text-xs">
            {(['all', 'unanswered', 'incorrect', 'flagged'] as const)
              .filter(f => f !== 'incorrect' || props.mode === 'PRACTICE')
              .map(f => {
                const count = f === 'all' ? props.questions.length
                  : f === 'unanswered' ? props.questions.length - answeredCount
                  : f === 'flagged' ? flaggedCount
                  : Object.values(answers).filter(r => r.submitted && r.isCorrect === false).length;
                return (
                  <button key={f} onClick={() => setFilter(f)} className={`badge capitalize ${filter === f ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : ''}`}>
                    {f} · {count}
                  </button>
                );
              })}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {props.questions.map((qq, i) => {
              const r = answers[qq.id];
              const hidden = !visible.includes(i);
              const cls = hidden ? 'opacity-30' :
                r?.isCorrect === true ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300' :
                r?.isCorrect === false ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300' :
                r?.answer?.length ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
              return (
                <button
                  key={qq.id}
                  onClick={() => goto(i)}
                  aria-label={`Go to question ${i + 1}`}
                  aria-current={i === idx ? 'true' : undefined}
                  className={`relative rounded-md py-1 text-xs tabular-nums ${cls} ${i === idx ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {i + 1}
                  {r?.flagged && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" aria-hidden />}
                </button>
              );
            })}
          </div>
          <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-700">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-blue-100 dark:bg-blue-950/50" /> Answered</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-slate-100 dark:bg-slate-800" /> Not answered</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-400" /> Flagged for review</div>
            {props.mode === 'PRACTICE' && (
              <>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-green-100 dark:bg-green-950/50" /> Correct</div>
                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-100 dark:bg-red-950/50" /> Incorrect</div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Review & submit modal — replaces the old alert()-based flow */}
      {showReview && !timeUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Review and submit">
          <div className="card max-h-[85vh] w-full max-w-lg overflow-y-auto p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold">Review your {props.mode === 'EXAM' ? 'exam' : 'practice session'}</h2>
              <button onClick={() => setShowReview(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{answeredCount}</div>
                <div className="text-xs text-slate-500">Answered</div>
              </div>
              <div className={`rounded-lg p-3 ${unansweredIdx.length ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                <div className={`text-2xl font-bold ${unansweredIdx.length ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400'}`}>{unansweredIdx.length}</div>
                <div className="text-xs text-slate-500">Unanswered</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{flaggedCount}</div>
                <div className="text-xs text-slate-500">Flagged</div>
              </div>
            </div>
            {timed && (
              <p className="mt-3 text-center text-xs text-slate-500">Time remaining: <span className="font-mono font-semibold">{fmt(remaining)}</span></p>
            )}
            {unansweredIdx.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {props.mode === 'EXAM'
                    ? 'All questions must be answered before you can submit:'
                    : 'Unanswered questions (tap to jump):'}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {unansweredIdx.slice(0, 40).map(i => (
                    <button key={i} onClick={() => { setShowReview(false); goto(i); }} className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 dark:bg-amber-950/50 dark:text-amber-300">
                      {i + 1}
                    </button>
                  ))}
                  {unansweredIdx.length > 40 && <span className="px-1 text-xs text-slate-500">+{unansweredIdx.length - 40} more</span>}
                </div>
              </div>
            )}
            {submitErr && <p className="mt-3 text-sm text-red-600">{submitErr}</p>}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setShowReview(false)} className="btn-outline">Keep working</button>
              <button
                onClick={() => submitAttempt()}
                disabled={submitted || (props.mode === 'EXAM' && unansweredIdx.length > 0)}
                className="btn-primary-grad disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitted ? 'Submitting…' : props.mode === 'EXAM' ? 'Submit exam' : 'See my results'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time-expired overlay */}
      {timeUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="alertdialog" aria-modal="true" aria-label="Time is up">
          <div className="card w-full max-w-sm p-8 text-center">
            <Clock className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-3 text-lg font-bold">Time&apos;s up</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Your exam is being submitted automatically…</p>
            {submitErr ? (
              <>
                <p className="mt-3 text-sm text-red-600">{submitErr}</p>
                <button onClick={() => { setTimeUp(true); submitAttempt(true); }} className="btn-primary mt-4">Retry submission</button>
              </>
            ) : (
              <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-slate-400" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// shuffleSeeded now lives in '@/lib/shuffle' so the server-rendered results
// page can apply the IDENTICAL per-attempt order. Keep the seed format
// (`${attemptId}:${q.id}`) in sync with results/[attemptId]/page.tsx.
