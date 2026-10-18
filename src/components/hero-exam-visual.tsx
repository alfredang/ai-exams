'use client';
import { useEffect, useState } from 'react';
import { Check, CheckCircle2, Clock, Flag } from 'lucide-react';

/**
 * Animated hero illustration: a miniature exam window in the same test-centre
 * chrome as the real runner (navy title bar, timer, Mark-for-review, bottom
 * nav), cycling through sample items — an option is picked, the answer is
 * revealed, progress advances. Floating score and domain cards echo the
 * results page. Purely decorative (aria-hidden); the sample items are
 * original and not drawn from any exam bank.
 *
 * Honors prefers-reduced-motion by freezing on a revealed state.
 */
const SAMPLES = [
  {
    tag: 'AWS · SAA-C03',
    stem: 'A workload must survive the loss of one Availability Zone with no manual action. Which design fits?',
    options: [
      'One large instance with daily snapshots',
      'Instances in two AZs behind a load balancer',
      'A read replica in the same Availability Zone',
      'A bigger instance type with more vCPUs'
    ],
    correct: 1
  },
  {
    tag: 'Anthropic · CCAO-F',
    stem: 'A Claude-drafted summary quotes a figure you cannot find in the source. What should happen before it is shared?',
    options: [
      'Share it; the figure looks plausible',
      'Add a note that AI helped write it',
      'Verify the figure or remove it',
      'Ask for a longer, more detailed summary'
    ],
    correct: 2
  },
  {
    tag: 'Kubernetes · CKAD',
    stem: 'A Pod is in CrashLoopBackOff. Which command shows logs from the container that just crashed?',
    options: [
      'kubectl logs <pod> --previous',
      'kubectl get events --watch',
      'kubectl describe node',
      'kubectl top pod'
    ],
    correct: 0
  }
];

const DOMAIN_FRAMES = [
  [72, 58, 86],
  [80, 66, 88],
  [88, 74, 92]
];

// Steps per sample: 0 read, 1 picked, 2 revealed, 3 hold.
const STEPS = 4;
const STEP_MS = 1100;

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function HeroExamVisual() {
  const [tick, setTick] = useState(2);
  const [secs, setSecs] = useState(1 * 3600 + 47 * 60 + 12);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Browser-only media query; read once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStill(mq.matches);
    if (mq.matches) return;
    const step = setInterval(() => setTick(t => t + 1), STEP_MS);
    const clock = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 2 * 3600)), 1000);
    return () => { clearInterval(step); clearInterval(clock); };
  }, []);

  const qi = Math.floor(tick / STEPS) % SAMPLES.length;
  const phase = still ? 2 : tick % STEPS;
  const q = SAMPLES[qi];
  const qNumber = 7 + (Math.floor(tick / STEPS) % 50);
  const progress = Math.min(100, Math.round((qNumber / 60) * 100));
  const doms = DOMAIN_FRAMES[qi];

  return (
    <div className="relative mx-auto w-full max-w-[580px] select-none pb-6 pt-6 sm:pb-24 sm:pt-12" aria-hidden="true">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -left-10 top-4 h-64 w-64 rounded-full bg-brand/25 blur-3xl motion-safe:animate-drift" />
      <div className="pointer-events-none absolute -right-6 bottom-0 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl motion-safe:animate-drift [animation-delay:-7s]" />

      {/* Exam window */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-white shadow-lift">
        <div className="flex items-center justify-between gap-3 bg-navy px-4 py-2.5 text-[11px] text-white sm:text-xs">
          <span className="truncate font-semibold">{q.tag} · Practice Exam</span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-1 sm:inline-flex">
              <Clock className="h-3.5 w-3.5" />
              <span className="opacity-80">Time Remaining</span>
              <span className="font-mono tabular-nums">{fmt(secs)}</span>
            </span>
            <span className="font-mono tabular-nums">{qNumber} of 60</span>
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-line bg-slate-100 px-4 py-1.5 text-[11px] text-slate-600">
          <span className="font-mono">Exam mode</span>
          <span className="inline-flex items-center gap-1.5">
            <span className={`inline-flex h-3 w-3 items-center justify-center rounded-sm border ${qi === 1 ? 'border-amber-600 bg-amber-500' : 'border-slate-400 bg-white'}`}>
              {qi === 1 && <Check className="h-2.5 w-2.5 text-white" />}
            </span>
            Mark for review
          </span>
        </div>

        <div key={qi} className="px-5 pb-5 pt-4 motion-safe:animate-fade-up">
          <p className="text-[13px] font-medium leading-snug text-ink sm:text-[15px]">{q.stem}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((o, i) => {
              const picked = phase >= 1 && i === q.correct;
              const revealed = phase >= 2 && i === q.correct;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-[12px] transition-colors duration-300 sm:text-[13px] ${
                    revealed ? 'border-emerald-600 bg-emerald-50' : picked ? 'border-brand bg-brand-100' : 'border-line bg-white'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                      revealed ? 'border-emerald-600 bg-emerald-600' : picked ? 'border-brand bg-brand' : 'border-slate-400'
                    }`}
                  >
                    {picked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="font-mono text-[11px] text-muted">{'ABCD'[i]}.</span>
                  <span className={`min-w-0 flex-1 truncate ${i === 0 && qi === 2 ? 'font-mono' : ''}`}>{o}</span>
                  {revealed && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-1 bg-line">
          <div className="h-full bg-brand transition-[width] duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between bg-navy px-4 py-2 text-[11px] text-white">
          <span className="rounded border border-white/30 px-2 py-0.5">End Exam</span>
          <span className="flex gap-1.5">
            <span className="rounded border border-white/30 px-2 py-0.5">◀ Previous</span>
            <span className="rounded border border-white/30 bg-white/10 px-2 py-0.5">Next ▶</span>
            <span className="hidden rounded border border-white/30 px-2 py-0.5 sm:inline">Review</span>
          </span>
        </div>
      </div>

      {/* Floating score card */}
      <div className="absolute bottom-0 -left-2 hidden w-48 rounded-lg border border-line bg-white p-3 shadow-lift motion-safe:animate-float sm:block lg:-left-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Your score · 87%</div>
        <div className="mt-1 flex items-baseline gap-1 font-display">
          <span className="text-3xl font-extrabold text-ink">52</span>
          <span className="text-sm font-bold text-muted">/ 60</span>
          <span className="ml-auto text-xs font-bold text-emerald-700">Comfortable</span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map(i => (
            <span key={i} className={`h-1.5 rounded-full ${i === 3 ? 'bg-brand' : 'bg-line'}`} />
          ))}
        </div>
      </div>

      {/* Floating domain card */}
      <div className="absolute -right-2 bottom-0 hidden w-52 rounded-lg border border-line bg-white p-3 shadow-lift motion-safe:animate-float-slow sm:block lg:-right-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">By domain</div>
        {['Design', 'Security', 'Operations'].map((d, i) => (
          <div key={d} className="mt-2">
            <div className="flex justify-between text-[11px] text-ink">
              <span>{d}</span>
              <span className="font-mono">{doms[i]}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-emerald-600 transition-[width] duration-1000" style={{ width: `${doms[i]}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Autosave chip */}
      <div className="absolute right-2 top-1 hidden items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-[11px] text-slate-600 shadow-card md:inline-flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Answers auto-saved
      </div>

      {/* Flag chip */}
      <div className="absolute left-2 top-1 hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 shadow-card md:inline-flex ">
        <Flag className="h-3 w-3 fill-amber-400" /> 3 flagged for review
      </div>
    </div>
  );
}
