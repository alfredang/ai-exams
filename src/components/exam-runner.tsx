'use client';
// Build marker: force-rebuild 2026-05-28 — Coolify Docker layer cache
// was silently reusing the pre-d04565c image despite "successful" redeploys.
// This comment line is the noop change that invalidates the COPY layer so
// the exam-runner edits from PR #72 actually make it into the bundle.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid, ListChecks, Loader2, LogOut, X } from 'lucide-react';
import { ExplanationView } from '@/components/explanation-view';
import { shuffleSeeded } from '@/lib/shuffle';
import { startFromDashboard } from '@/app/user-dashboard/actions';

export type RunnerQuestion = {
  id: string;
  stem: string;
  type: 'SINGLE' | 'MULTI' | 'TRUE_FALSE' | 'ORDERING';
  options: { id: string; text: string }[];
  domain?: string;
  // MULTI only: how many options to pick ("Select TWO answers").
  selectCount?: number;
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
  // Where "Save & exit" lands. Defaults to the signed-in attempts list.
  exitHref?: string;
  // Signed-in Practice attempts: lets the taker jump to a timed Exam-mode
  // attempt on the same certification (this practice attempt stays resumable).
  examModeSwitch?: { examId: string; durationMinutes: number };
};

const TYPE_HINT: Record<RunnerQuestion['type'], string> = {
  SINGLE: 'Select ONE answer',
  MULTI: 'Select ALL that apply',
  TRUE_FALSE: 'True or False',
  ORDERING: 'Arrange the steps in the correct sequence'
};

const COUNT_WORDS = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
const typeHint = (q: RunnerQuestion) =>
  q.type === 'MULTI' && q.selectCount && q.selectCount > 1
    ? `Select ${COUNT_WORDS[q.selectCount] ?? q.selectCount} answers`
    : TYPE_HINT[q.type];

// Types where one click is not "I'm done": the user confirms with an explicit
// button before the answer is checked (PRACTICE) — see checkAnswer().
const NEEDS_CONFIRM = (t: RunnerQuestion['type']) => t === 'MULTI' || t === 'ORDERING';

const LETTERS = 'ABCDEFGHIJ';

export function ExamRunner(props: ExamRunnerProps) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, RunnerResponse>>(props.initialResponses || {});
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
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability */
  useEffect(() => {
    if (props.mode === 'EXAM' && props.remainingSec > 0 && remaining === 0 && !submitted) {
      setTimeUp(true);
      submitAttempt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/immutability */

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
  const shuffledOptions = useMemo(() => {
    // ORDERING arrives in its fixed Step 1…N order (sequencingSteps() on the
    // server) — the step numbers must not move between attempts.
    if (q.type === 'TRUE_FALSE' || q.type === 'ORDERING') return q.options;
    return shuffleSeeded(q.options, `${props.attemptId}:${q.id}`);
  }, [q.options, q.type, q.id, props.attemptId]);

  // ORDERING renders as a working list the user rearranges, so the displayed
  // sequence IS the answer. Once they've moved anything we follow the stored
  // answer; before that we show the steps in their numbered order. Any id in
  // the stored answer that no longer exists (option edited after the attempt
  // started) is dropped, and any missing option is appended, so a stale
  // response can never blank the list.
  const displayOptions = useMemo(() => {
    if (q.type !== 'ORDERING') return shuffledOptions;
    const saved = a.answer ?? [];
    if (!saved.length) return shuffledOptions;
    const byId = new Map(q.options.map(o => [o.id, o]));
    const ordered = saved.map(id => byId.get(id)).filter((o): o is { id: string; text: string } => !!o);
    const seen = new Set(ordered.map(o => o.id));
    return [...ordered, ...shuffledOptions.filter(o => !seen.has(o.id))];
  }, [q.type, q.options, shuffledOptions, a.answer]);

  // Move an option up (-1) or down (+1) in the ORDERING list and persist the
  // resulting sequence as the answer.
  function move(optId: string, delta: number) {
    if (a.submitted && props.mode === 'PRACTICE') return;
    const cur = displayOptions.map(o => o.id);
    const from = cur.indexOf(optId);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= cur.length) return;
    const next = [...cur];
    [next[from], next[to]] = [next[to], next[from]];
    setAnswer(next);
  }

  // Each sequencing step keeps its original number wherever it is moved.
  const stepNo = (id: string) => q.options.findIndex(o => o.id === id) + 1;

  const answeredCount = Object.values(answers).filter(r => r.answer?.length).length;
  const flaggedCount = Object.values(answers).filter(r => r.flagged).length;
  const unansweredIdx = props.questions.map((_, i) => i).filter(i => !answers[props.questions[i].id]?.answer?.length);

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
    // ORDERING has no notion of selecting an option — the sequence is the
    // answer, and it changes only through move().
    if (q.type === 'ORDERING') return;
    const cur = a.answer || [];
    const next = q.type === 'MULTI'
      ? (cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId])
      : [optId];
    setAnswer(next);
    // PRACTICE mode auto-reveals the answer for single-pick types as soon as
    // the user clicks an option — no "Show answer" button needed.
    if (props.mode === 'PRACTICE' && !NEEDS_CONFIRM(q.type)) {
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

  // ── Test-centre navigation ──────────────────────────────────────────────
  // Mirrors the flow candidates meet at a proctored test centre: Next on the
  // last item opens the Review Screen; from there "Review Incomplete" /
  // "Review Flagged" walk ONLY those items (reviewSeq) and return to the
  // Review Screen when the walk ends. End Exam always asks for confirmation.
  const [view, setView] = useState<'question' | 'review'>('question');
  const [reviewSeq, setReviewSeq] = useState<{ label: string; items: number[] } | null>(null);
  const isExam = props.mode === 'EXAM';
  // Exam mode runs like the live test: no answer sheet, and the Review Screen
  // only opens once the candidate has worked through to the last question
  // (or comes back to an attempt that is already fully answered).
  const [reachedEnd, setReachedEnd] = useState(
    () => !isExam || props.questions.every(qq => props.initialResponses?.[qq.id]?.answer?.length)
  );
  const [navOpen, setNavOpen] = useState(!isExam);
  const [showExit, setShowExit] = useState(false);
  // Right-click strike-out of options the candidate has ruled out. Visual aid
  // only — never persisted or scored.
  const [struck, setStruck] = useState<Record<string, string[]>>({});

  function next() {
    if (reviewSeq) {
      const pos = reviewSeq.items.indexOf(idx);
      if (pos >= 0 && pos < reviewSeq.items.length - 1) setIdx(reviewSeq.items[pos + 1]);
      else { setReviewSeq(null); setView('review'); }
      return;
    }
    if (idx >= props.questions.length - 1) { setReachedEnd(true); setView('review'); }
    else goto(idx + 1);
  }
  function prev() {
    if (reviewSeq) {
      const pos = reviewSeq.items.indexOf(idx);
      if (pos > 0) setIdx(reviewSeq.items[pos - 1]);
      return;
    }
    goto(idx - 1);
  }
  function startReview(kind: 'all' | 'incomplete' | 'flagged' | 'incorrect') {
    // Review All walks every question and comes back to the Review Screen.
    const items = props.questions.map((_, i) => i).filter(i => {
      const r = answers[props.questions[i].id];
      if (kind === 'incomplete') return !r?.answer?.length;
      if (kind === 'flagged') return !!r?.flagged;
      if (kind === 'incorrect') return r?.submitted && r.isCorrect === false;
      return true;
    });
    if (!items.length) return;
    const label = kind === 'all' ? 'all questions' : `${kind} questions`;
    setReviewSeq({ label, items });
    setIdx(items[0]);
    setView('question');
  }
  function jumpTo(i: number) {
    setReviewSeq(null);
    goto(i);
    setView('question');
  }
  function toggleStrike(optId: string) {
    setStruck(prev => {
      const cur = prev[q.id] || [];
      return { ...prev, [q.id]: cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId] };
    });
  }
  const [switching, setSwitching] = useState(false);
  async function switchToExamMode() {
    if (!props.examModeSwitch) return;
    setSwitching(true);
    const payload = Object.fromEntries(Object.entries(answers).map(([qid, r]) => [qid, { answer: r.answer || [], flagged: r.flagged }]));
    await fetch('/api/attempts/autosave', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attemptId: props.attemptId, responses: payload }) }).catch(() => {});
    dirty.current = false;
    const fd = new FormData();
    fd.set('examId', props.examModeSwitch.examId);
    fd.set('mode', 'EXAM');
    await startFromDashboard(fd).catch(() => setSwitching(false));
  }
  async function saveAndExit() {
    const payload = Object.fromEntries(Object.entries(answers).map(([qid, r]) => [qid, { answer: r.answer || [], flagged: r.flagged }]));
    await fetch('/api/attempts/autosave', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attemptId: props.attemptId, responses: payload }) }).catch(() => {});
    dirty.current = false;
    router.push(props.exitHref || '/user-dashboard/attempts');
  }

  // The runner takes over the viewport like a test-centre workstation, so
  // the page behind it must not scroll.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // Keyboard shortcuts: ← / → navigate, F toggles the flag. Disabled while
  // a dialog is open, on the Review Screen, or when focus is in a form field.
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (showReview || timeUp || showExit || view !== 'question') return;
      const el = e.target as HTMLElement;
      if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) && (el as HTMLInputElement).type !== 'radio' && (el as HTMLInputElement).type !== 'checkbox') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'f' || e.key === 'F') toggleFlag();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, showReview, timeUp, showExit, view, reviewSeq, answers]);

  function fmt(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const timed = props.mode === 'EXAM' && props.remainingSec > 0;
  const timerTone = remaining < 60
    ? 'motion-safe:animate-pulse bg-red-600 text-white'
    : remaining < 300
    ? 'bg-amber-400 text-navy-800'
    : 'bg-white/10 text-white';

  const total = props.questions.length;
  const progressPct = Math.round((answeredCount / total) * 100);
  const incorrectCount = Object.values(answers).filter(r => r.submitted && r.isCorrect === false).length;
  const isK8sPerf = props.examVendor === 'Linux Foundation' && /CKAD?\b/i.test(props.examTitle);
  const struckHere = struck[q.id] || [];
  const seqPos = reviewSeq ? reviewSeq.items.indexOf(idx) : -1;
  const atFirst = reviewSeq ? seqPos <= 0 : idx === 0;
  const atLast = reviewSeq ? seqPos === reviewSeq.items.length - 1 : idx === total - 1;

  // Fixed light buttons: the shared .btn-* classes carry dark-theme variants,
  // and the runner stays a light test-centre screen in both themes.
  const lightPrimary = 'btn bg-brand text-white shadow-sm hover:bg-brand-700';
  const lightOutline = 'btn border border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50';
  // Full-size question-card buttons, as in the mock-exam booklet layout.
  const navBase = 'inline-flex items-center justify-center gap-1.5 rounded-md px-[22px] py-3 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';
  const navGhost = `${navBase} border border-line bg-white text-ink hover:border-brand hover:text-brand-700`;
  const navPrimary = `${navBase} bg-brand text-white shadow-sm hover:bg-brand-700`;
  const barBase = 'inline-flex items-center gap-1 rounded border px-2.5 py-1.5 sm:px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40';
  const barBtn = `${barBase} border-white/35 text-white hover:bg-white/15`;

  return (
    <div className="light-scope fixed inset-0 z-50 flex flex-col bg-white font-sans text-ink" role="application" aria-label={`${props.examTitle} exam`}>
      {/* Title bar */}
      <header className="bg-navy text-white">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold sm:text-base">{props.examVendor} · {props.examTitle}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/70">
              {props.mode === 'EXAM' ? 'Exam mode' : 'Practice mode'}{props.isTeaser ? ' · Free teaser' : ''}
            </div>
          </div>
          {props.examModeSwitch && (
            <button
              type="button"
              onClick={switchToExamMode}
              disabled={switching}
              title={`Start a timed ${props.examModeSwitch.durationMinutes}-minute exam. This practice session is saved.`}
              className="flex items-center gap-1.5 rounded border border-white/35 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/15 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
            >
              {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
              <span className="hidden sm:inline">Switch to Exam mode · {props.examModeSwitch.durationMinutes} min</span>
              <span className="sm:hidden">Exam mode</span>
            </button>
          )}
          {timed && (
            <div className={`flex items-center gap-2 rounded px-2.5 py-1 ${timerTone}`} role="timer" aria-label="Time remaining">
              <Clock className="h-4 w-4" />
              <span className="hidden text-xs sm:inline">Time Remaining</span>
              <span className="font-mono text-base font-medium tabular-nums">{fmt(remaining)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded bg-white/10 px-2.5 py-1 font-mono text-sm tabular-nums" aria-live="polite">
            <ListChecks className="h-4 w-4" />
            {view === 'review' ? 'Review' : `${idx + 1} of ${total}`}
          </div>
        </div>
      </header>

      {/* Tool strip */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line bg-slate-100 px-4 py-1.5 text-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3 text-xs text-muted">
          <span className="font-mono tabular-nums">{answeredCount} / {total} answered</span>
          <span className="hidden items-center gap-1 sm:inline-flex" aria-live="polite">
            {saveState === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>}
            {saveState === 'saved' && <><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Saved</>}
          </span>
          {reviewSeq && view === 'question' && (
            <span className="rounded bg-brand-100 px-2 py-0.5 font-medium text-brand-700">
              Reviewing {reviewSeq.label} · {seqPos + 1} of {reviewSeq.items.length}
            </span>
          )}
        </div>
        {view === 'question' && !isExam && (
          <button type="button" onClick={() => setNavOpen(o => !o)} className="hidden text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline lg:inline">
            {navOpen ? 'Hide answer sheet' : 'Show answer sheet'}
          </button>
        )}
      </div>
      <div className="h-1 bg-line" role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={total} aria-label="Questions answered">
        <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-y-auto bg-canvas">
        {view === 'question' ? (
          <div className={`mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 ${navOpen && !isExam ? 'lg:grid-cols-[minmax(0,1fr)_240px]' : 'max-w-4xl'}`}>
            <div className="min-w-0">
              {timed && remaining < 300 && remaining > 0 && (
                <div className={`mb-4 flex items-center gap-2 rounded-md border p-3 text-sm ${remaining < 60 ? 'border-red-300 bg-red-50 text-red-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {remaining < 60 ? 'Less than a minute left. The exam ends automatically when the timer reaches zero.' : 'Less than 5 minutes remaining. Unanswered questions score zero.'}
                </div>
              )}

              {isK8sPerf && (
                <details className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm">
                  <summary className="cursor-pointer font-medium text-blue-900">Practice these tasks hands-on — free Kubernetes playground</summary>
                  <div className="mt-2 space-y-2 text-slate-700">
                    <p>
                      The real CKA / CKAD exam is performance-based — you solve tasks on a live cluster from a browser terminal. Open the Killercoda playground in a second tab and reproduce each question with <code className="rounded bg-white px-1">kubectl</code> while you work through this set.
                    </p>
                    <p>
                      <a href="https://killercoda.com/playgrounds/scenario/kubernetes" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline hover:no-underline">
                        Open the free Kubernetes playground →
                      </a>
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
                      <li>Spins up a single-node cluster in your browser — no signup, no install.</li>
                      <li>For each question, also try to <em>produce</em> the resource: <code className="rounded bg-white px-1">kubectl run</code>, <code className="rounded bg-white px-1">create -f</code>, <code className="rounded bg-white px-1">edit</code>, then verify with <code className="rounded bg-white px-1">describe</code> / <code className="rounded bg-white px-1">get -o yaml</code>.</li>
                      <li>Practice imperative shortcuts you&apos;ll need under time pressure — <code className="rounded bg-white px-1">--dry-run=client -o yaml</code>, <code className="rounded bg-white px-1">kubectl explain</code>, <code className="rounded bg-white px-1">alias k=kubectl</code>.</li>
                      <li>Killercoda sessions expire after ~60 min of inactivity. KodeKloud runs the playground; we are not affiliated with them.</li>
                    </ul>
                  </div>
                </details>
              )}

              <section className="rounded-md border border-line bg-white p-5 shadow-card sm:p-7" aria-labelledby="q-stem">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow">Question {idx + 1} of {total}</span>
                    {/* The live exam never names the domain mid-test, so Exam
                        mode keeps it hidden until the results page. */}
                    {q.domain && props.mode === 'PRACTICE' && (
                      <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">{q.domain}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={toggleFlag}
                    aria-pressed={!!a.flagged}
                    title="Flag this question for review (F)"
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                      a.flagged ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-line bg-white text-ink hover:border-amber-500'
                    }`}
                  >
                    <Flag className={`h-4 w-4 ${a.flagged ? 'fill-amber-400 text-amber-600' : 'text-muted'}`} />
                    {a.flagged ? 'Flagged for review' : 'Flag for review'}
                  </button>
                </div>
                <p id="q-stem" className="whitespace-pre-wrap text-[17px] font-medium leading-relaxed sm:text-[19px]">{q.stem}</p>
                <p className="eyebrow mb-2 mt-5">{typeHint(q)}</p>

                {q.type === 'ORDERING' ? (
                  <div className="space-y-2">
                    {displayOptions.map((o, oi) => {
                      // After submission the correct position is known, so mark each
                      // row by whether the user placed it where it belongs.
                      const correctSeq = a.correct ?? [];
                      const placedRight = a.submitted && correctSeq[oi] === o.id;
                      const placedWrong = a.submitted && correctSeq.length > 0 && correctSeq[oi] !== o.id;
                      const locked = a.submitted && props.mode === 'PRACTICE';
                      return (
                        <div
                          key={`${oi}-${o.id}`}
                          className={`flex items-center gap-3 rounded-md border px-4 py-3 ${
                            placedRight ? 'border-emerald-600 bg-emerald-50' :
                            placedWrong ? 'border-red-600 bg-red-50' :
                            'border-line bg-white'
                          }`}
                        >
                          <span className="inline-flex h-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-muted px-2 font-mono text-xs" aria-label={`Step ${stepNo(o.id)}`}>{stepNo(o.id)}</span>
                          <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{o.text}</span>
                          {a.submitted && correctSeq.length > 0 && (
                            <span className="shrink-0 text-xs font-semibold text-muted">position {correctSeq.indexOf(o.id) + 1}</span>
                          )}
                          <span className="flex shrink-0 flex-col gap-1">
                            <button type="button" onClick={() => move(o.id, -1)} disabled={locked || oi === 0} aria-label={`Move "${o.text}" up`} className="rounded border border-line px-1.5 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-30">▲</button>
                            <button type="button" onClick={() => move(o.id, 1)} disabled={locked || oi === displayOptions.length - 1} aria-label={`Move "${o.text}" down`} className="rounded border border-line px-1.5 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-30">▼</button>
                          </span>
                        </div>
                      );
                    })}
                    {!a.answer.length ? (
                      <p className="pt-1 text-xs text-muted">The steps are numbered 1–{q.options.length} in a scrambled order. Use the arrows to arrange them into the correct sequence{props.mode === 'PRACTICE' ? ', then check your answer' : ''}.</p>
                    ) : (
                      <p className="pt-1 font-mono text-sm text-ink">Your sequence: {displayOptions.map(o => stepNo(o.id)).join(' → ')}</p>
                    )}
                    {a.submitted && (a.correct?.length ?? 0) > 0 && (
                      <p className="font-mono text-sm font-semibold text-emerald-800">Correct sequence: {(a.correct ?? []).map(stepNo).join(' → ')}</p>
                    )}
                  </div>
                ) : (
                  <fieldset className="grid min-w-0 gap-2.5">
                    <legend className="sr-only">{typeHint(q)}</legend>
                    {displayOptions.map((o, oi) => {
                      const sel = a.answer.includes(o.id);
                      const isAnswered = !!a.submitted;
                      const correct = a.correct?.includes(o.id);
                      const wrong = isAnswered && sel && !correct;
                      const isStruck = struckHere.includes(o.id) && !sel;
                      const locked = a.submitted && props.mode === 'PRACTICE';
                      const inputId = `q-${q.id}-${o.id}`;
                      return (
                        <label
                          key={`${oi}-${o.id}`}
                          htmlFor={inputId}
                          onContextMenu={(e) => { e.preventDefault(); if (!locked) toggleStrike(o.id); }}
                          className={`group flex min-w-0 items-start gap-3.5 rounded-md border px-4 py-3.5 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
                            locked ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            isAnswered && correct ? 'border-emerald-600 bg-emerald-50' :
                            wrong ? 'border-red-600 bg-red-50' :
                            sel ? 'border-brand bg-brand-100' : 'border-line bg-white hover:border-brand'
                          }`}
                        >
                          <input
                            id={inputId}
                            type={q.type === 'MULTI' ? 'checkbox' : 'radio'}
                            name={`q-${q.id}`}
                            checked={sel}
                            disabled={locked}
                            onChange={() => toggle(o.id)}
                            className="pointer-events-none absolute opacity-0"
                          />
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center border-[1.5px] font-mono text-[13px] ${q.type === 'MULTI' ? 'rounded' : 'rounded-full'} ${
                            isAnswered && correct ? 'border-emerald-600 bg-emerald-600 text-white' :
                            wrong ? 'border-red-600 bg-red-600 text-white' :
                            sel ? 'border-brand bg-brand text-white' : 'border-muted text-ink'
                          }`}>
                            {sel && q.type === 'MULTI' && !isAnswered ? <Check className="h-4 w-4" /> : LETTERS[oi] ?? '?'}
                          </span>
                          <span className={`min-w-0 flex-1 pt-0.5 [overflow-wrap:anywhere] ${isStruck ? 'text-muted line-through decoration-2' : ''}`}>{o.text}</span>
                          {isAnswered && correct && (
                            <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">Correct answer</span>
                          )}
                          {wrong && (
                            <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">Your answer</span>
                          )}
                        </label>
                      );
                    })}
                  </fieldset>
                )}

                {revealErr && <p className="mt-3 text-xs text-red-600">{revealErr}</p>}
                {!a.submitted && props.mode === 'PRACTICE' && NEEDS_CONFIRM(q.type) && (
                  <button
                    onClick={checkAnswer}
                    disabled={!a.answer.length}
                    title={!a.answer.length ? 'Select at least one option first' : ''}
                    className={`${lightPrimary} mt-5 disabled:cursor-not-allowed disabled:opacity-50`}
                  >Check answer</button>
                )}
                {!a.submitted && props.mode === 'PRACTICE' && !NEEDS_CONFIRM(q.type) && !a.answer.length && (
                  <p className="mt-4 text-xs text-muted">Pick an option to reveal the answer.</p>
                )}
                {a.submitted && a.explanation && (
                  <div className={`mt-5 rounded-md border border-l-[5px] p-4 text-sm ${a.isCorrect ? 'border-emerald-600 bg-emerald-50/60' : 'border-red-600 bg-red-50/60'}`}>
                    <div className={`mb-2 font-semibold ${a.isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>{a.isCorrect ? 'Correct' : 'Incorrect'}</div>
                    {q.domain && (
                      <div className="mb-2.5 flex flex-wrap items-center gap-2">
                        <span className="eyebrow">Exam domain</span>
                        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{q.domain}</span>
                      </div>
                    )}
                    <div className="eyebrow mb-2">Suggested answer</div>
                    <ExplanationView text={a.explanation} options={q.options} correctIds={a.correct ?? []} />
                    {!!a.references?.length && (
                      <div className="mt-3 border-t border-line pt-3 text-xs">
                        <div className="mb-1 font-semibold text-slate-600">References</div>
                        <ul className="space-y-1">
                          {a.references.map((ref, i) => {
                            const url = typeof ref === 'string' ? ref : ref?.url || '';
                            const label = typeof ref === 'string' ? ref : ref?.label || ref?.url || '';
                            if (!label) return null;
                            return (
                              <li key={i}>
                                {/^https?:\/\//.test(url)
                                  ? <a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-brand-700 underline hover:no-underline">{label}</a>
                                  : <span className="text-slate-600">{label}</span>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <button type="button" onClick={prev} disabled={atFirst} className={navGhost}>
                    <ChevronLeft className="h-5 w-5" /> Previous
                  </button>
                  <button type="button" onClick={next} className={navGhost}>
                    {atLast ? 'Review Screen' : 'Next'} <ChevronRight className="h-5 w-5" />
                  </button>
                  {/* Exam mode submits from the Review Screen at the end, like the live test. */}
                  {(!isExam || reachedEnd) && (
                    <button type="button" onClick={() => setShowReview(true)} className={`${navPrimary} ml-auto`}>
                      {isExam ? 'Submit exam' : 'Submit'}
                    </button>
                  )}
                </div>
              </section>
              <p className="mt-3 hidden text-center text-xs text-muted lg:block">
                <span className="font-semibold">Keyboard shortcuts:</span>{' '}
                <kbd className="rounded border border-line bg-white px-1">←</kbd> Previous question ·{' '}
                <kbd className="rounded border border-line bg-white px-1">→</kbd> Next question ·{' '}
                <kbd className="rounded border border-line bg-white px-1">F</kbd> Flag for review ·{' '}
                Right-click an answer to cross it out (a note for yourself, not saved)
              </p>
            </div>

            {navOpen && !isExam && (
              <aside className="hidden h-fit rounded-md border border-line bg-white p-4 shadow-card lg:sticky lg:top-0 lg:block" aria-label="Answer sheet">
                <div className="eyebrow">Answer sheet</div>
                <div className="mb-3 mt-2.5 grid grid-cols-5 gap-1.5">
                  {props.questions.map((qq, i) => {
                    const r = answers[qq.id];
                    const tone =
                      r?.isCorrect === true ? 'border-emerald-600 bg-emerald-50' :
                      r?.isCorrect === false ? 'border-red-600 bg-red-50' :
                      r?.answer?.length ? 'border-brand bg-brand-100' : 'border-line bg-white';
                    return (
                      <button
                        key={qq.id}
                        type="button"
                        onClick={() => jumpTo(i)}
                        aria-label={`Question ${i + 1}, ${r?.answer?.length ? 'completed' : 'incomplete'}${r?.flagged ? ', flagged for review' : ''}`}
                        aria-current={i === idx ? 'true' : undefined}
                        className={`relative aspect-square rounded border font-mono text-sm tabular-nums ${tone} ${i === idx ? 'outline outline-2 outline-offset-1 outline-ink' : ''}`}
                      >
                        {i + 1}
                        {r?.flagged && <span className="absolute right-0.5 top-0.5 h-[7px] w-[7px] rounded-full bg-amber-500" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-1 border-t border-line pt-3 text-xs text-muted">
                  <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-brand bg-brand-100" /> Completed</span>
                  <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-line bg-white" /> Incomplete</span>
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Flagged for review</span>
                  {props.mode === 'PRACTICE' && (
                    <>
                      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-emerald-600 bg-emerald-50" /> Correct</span>
                      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-red-600 bg-red-50" /> Incorrect</span>
                    </>
                  )}
                </div>
              </aside>
            )}
          </div>
        ) : (
          /* Review Screen */
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <div className="rounded-md border border-line bg-white p-5 shadow-card sm:p-7">
              <h2 className="text-2xl font-extrabold">Review Screen</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted">
                Below is the summary of your completed questions and the questions you flagged for review. Select a question to return to it, or use Review All or Review Flagged at the bottom of the screen.
                {isExam ? ' Every question must be completed before you can submit the exam.' : ''} When you are finished, select Submit {isExam ? 'Exam' : ''}.
              </p>
              <div className="eyebrow mt-5">Summary of reviews and completed</div>
              <div className={`mt-2 grid gap-3 sm:max-w-md ${unansweredIdx.length ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="rounded-md border border-line bg-canvas px-3 py-2">
                  <div className="font-display text-2xl font-extrabold">{answeredCount}<span className="text-base font-bold text-muted"> / {total}</span></div>
                  <div className="text-xs text-muted">Completed</div>
                </div>
                <div className="rounded-md border border-line bg-canvas px-3 py-2">
                  <div className="font-display text-2xl font-extrabold">{flaggedCount}</div>
                  <div className="flex items-center gap-1 text-xs text-muted"><Flag className="h-3 w-3 fill-amber-400 text-amber-600" aria-hidden /> Flagged for review</div>
                </div>
                {unansweredIdx.length > 0 && (
                  <div className="rounded-md border border-amber-400 bg-amber-50 px-3 py-2">
                    <div className="font-display text-2xl font-extrabold">{unansweredIdx.length}</div>
                    <div className="text-xs text-muted">Incomplete</div>
                  </div>
                )}
              </div>
              <div className="mt-6 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                {props.questions.map((qq, i) => {
                  const r = answers[qq.id];
                  const done = !!r?.answer?.length;
                  return (
                    <button
                      key={qq.id}
                      type="button"
                      onClick={() => jumpTo(i)}
                      className="flex items-center gap-3 border-b border-line px-1 py-2 text-left text-sm hover:bg-brand-50"
                    >
                      <span className="flex-1 font-medium">Question {i + 1}</span>
                      {r?.flagged && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-amber-700">
                          <Flag className="h-3.5 w-3.5 fill-amber-400 text-amber-600" aria-hidden /> Flagged for review
                        </span>
                      )}
                      {!isExam && r?.submitted ? (
                        <span className={`font-mono text-xs font-medium ${r.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{r.isCorrect ? 'Correct' : 'Incorrect'}</span>
                      ) : (
                        <span className={`font-mono text-xs font-medium ${done ? 'text-emerald-700' : 'text-amber-700'}`}>{done ? 'Completed' : 'Incomplete'}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <button type="button" onClick={() => jumpTo(idx)} className={navGhost}>
                  <ChevronLeft className="h-5 w-5" /> Back to question {idx + 1}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation bar */}
      <footer className="flex flex-wrap items-center justify-between gap-2 bg-navy px-3 py-2.5 sm:px-6">
        <button type="button" onClick={() => setShowExit(true)} className={barBtn}>
          <LogOut className="h-4 w-4" /> Save &amp; exit
        </button>
        {view === 'question' ? (
          reachedEnd && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { setReviewSeq(null); setView('review'); }} className={barBtn}>
                <LayoutGrid className="h-4 w-4" /> <span className="hidden sm:inline">Review Screen</span><span className="sm:hidden">Review</span>
              </button>
            </div>
          )
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => startReview('all')} className={barBtn}>Review All</button>
            <button type="button" onClick={() => startReview('flagged')} disabled={!flaggedCount} className={barBtn}>Review Flagged</button>
            {unansweredIdx.length > 0 && (
              <button type="button" onClick={() => startReview('incomplete')} className={barBtn}>Review Incomplete</button>
            )}
            {!isExam && (
              <button type="button" onClick={() => startReview('incorrect')} disabled={!incorrectCount} className={barBtn}>Review Incorrect</button>
            )}
            <button type="button" onClick={() => setShowReview(true)} className={`${barBase} border-white bg-white font-semibold text-navy hover:bg-white/90`}>
              {isExam ? 'Submit Exam' : 'Submit'}
            </button>
          </div>
        )}
      </footer>

      {/* Submit Exam confirmation — replaces the old alert()-based flow */}
      {showReview && !timeUp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-labelledby="end-title">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-md border border-line bg-white shadow-lift">
            <div className="flex items-center justify-between bg-navy px-5 py-3 text-white">
              <h2 id="end-title" className="font-display text-base font-bold">Submit {props.mode === 'EXAM' ? 'Exam' : 'Practice Session'}</h2>
              <button onClick={() => setShowReview(false)} aria-label="Close" className="text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md border border-line bg-canvas p-3">
                  <div className="font-display text-2xl font-extrabold text-brand">{answeredCount}</div>
                  <div className="text-xs text-muted">Completed</div>
                </div>
                <div className={`rounded-md border p-3 ${unansweredIdx.length ? 'border-amber-400 bg-amber-50' : 'border-line bg-canvas'}`}>
                  <div className={`font-display text-2xl font-extrabold ${unansweredIdx.length ? 'text-amber-700' : 'text-muted'}`}>{unansweredIdx.length}</div>
                  <div className="text-xs text-muted">Incomplete</div>
                </div>
                <div className="rounded-md border border-line bg-canvas p-3">
                  <div className="font-display text-2xl font-extrabold">{flaggedCount}</div>
                  <div className="text-xs text-muted">Flagged</div>
                </div>
              </div>
              {timed && (
                <p className="mt-3 text-center text-xs text-muted">Time remaining: <span className="font-mono font-semibold">{fmt(remaining)}</span></p>
              )}
              {unansweredIdx.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-amber-800">
                    {props.mode === 'EXAM' ? 'All questions must be completed before you can submit the exam:' : 'Incomplete questions (tap to jump):'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {unansweredIdx.slice(0, 40).map(i => (
                      <button key={i} onClick={() => { setShowReview(false); jumpTo(i); }} className="rounded border border-amber-300 bg-amber-50 px-2 py-1 font-mono text-xs font-medium text-amber-900 hover:bg-amber-100">
                        {i + 1}
                      </button>
                    ))}
                    {unansweredIdx.length > 40 && <span className="px-1 text-xs text-muted">+{unansweredIdx.length - 40} more</span>}
                  </div>
                </div>
              )}
              <p className="mt-4 text-sm text-slate-700">
                {props.mode === 'EXAM'
                  ? 'Once you submit the exam you cannot return to your answers. Your score report appears immediately.'
                  : 'Your results and a full answer review appear on the next screen.'}
              </p>
              {submitErr && <p className="mt-3 text-sm text-red-600">{submitErr}</p>}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button onClick={() => setShowReview(false)} className={lightOutline}>Return to exam</button>
                <button
                  onClick={() => submitAttempt()}
                  disabled={submitted || (props.mode === 'EXAM' && unansweredIdx.length > 0)}
                  className={`${lightPrimary} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {submitted ? 'Submitting…' : props.mode === 'EXAM' ? 'Submit exam' : 'Submit and see results'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save & exit confirmation */}
      {showExit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-labelledby="exit-title">
          <div className="w-full max-w-md rounded-md border border-line bg-white p-5 shadow-lift">
            <h2 id="exit-title" className="font-display text-lg font-bold">Save and exit?</h2>
            <p className="mt-2 text-sm text-slate-700">
              Your answers are saved and you can resume this attempt later.
              {timed ? ' The timer keeps running while you are away, and the exam ends automatically when it reaches zero.' : ''}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowExit(false)} className={lightOutline}>Stay</button>
              <button onClick={saveAndExit} className={lightPrimary}>Save &amp; exit</button>
            </div>
          </div>
        </div>
      )}

      {/* Time-expired overlay */}
      {timeUp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 p-4" role="alertdialog" aria-modal="true" aria-label="Time is up">
          <div className="w-full max-w-sm rounded-md border border-line bg-white p-8 text-center shadow-lift">
            <Clock className="mx-auto h-10 w-10 text-red-600" />
            <h2 className="mt-3 text-xl font-extrabold">Time&apos;s up</h2>
            <p className="mt-2 text-sm text-slate-700">Your exam is being submitted automatically…</p>
            {submitErr ? (
              <>
                <p className="mt-3 text-sm text-red-600">{submitErr}</p>
                <button onClick={() => { setTimeUp(true); submitAttempt(true); }} className={`${lightPrimary} mt-4`}>Retry submission</button>
              </>
            ) : (
              <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-muted" />
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
