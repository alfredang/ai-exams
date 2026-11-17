import { ArrowRight, Check, CheckCircle2, FileText, Loader2, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

/** What the generator is doing right now, shown as animation on the step cards. */
export type FlowActivity = {
  /** The step in progress: 1 source, 2 AI answers, 3 publish. 4 = just finished. */
  step: 1 | 2 | 3 | 4;
  /** One line under the active step, e.g. "Checking answers (batch 2 of 7)". */
  label: string;
  exam: string;
  done: number;
  total: number;
  autoPublish: boolean;
};

/**
 * The AI Question and Answer Generator as three steps:
 *   1 Get sources — exam, number of questions and a source (YouTube, GitHub,
 *     web link, PDF, or AI generation alone)
 *   2 AI generated answers — AI writes or extracts the questions and gives
 *     each one its answer key and explanation; a second pass checks the key
 *   3 Publish — Auto publish (default), or held for an admin to review
 * While a run is in progress (`activity`) the cards animate: finished steps
 * show a tick, the current one pulses with a spinner, arrows flow, and step 3
 * fills a progress bar.
 */
export function QuestionFlow({
  published,
  perAttempt,
  poolHref,
  generate,
  agents = false,
  review,
  activity
}: {
  published: number;
  /** Questions each attempt draws; omitted on the all-exams generator page. */
  perAttempt?: number;
  poolHref?: string;
  /** Step 1's action — the Get sources button that opens the pop-up form. */
  generate?: ReactNode;
  /** No OpenAI API key: requests are queued for the local AI agents. */
  agents?: boolean;
  /** Questions held for review (Review mode), with where to publish them. */
  review?: { count: number; href: string };
  activity?: FlowActivity | null;
}) {
  const at = activity?.step ?? 0;
  const state = (n: 1 | 2 | 3): StepState => (!at ? 'idle' : at > n ? 'done' : at === n ? 'active' : 'idle');
  const pct = activity ? Math.min(100, Math.round((activity.done / Math.max(1, activity.total)) * 100)) : 0;
  return (
    <ol id="ai-flow" className="grid scroll-mt-24 gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch" aria-live="polite">
      <Step
        n={1}
        icon={<FileText className="h-4 w-4" />}
        tone="violet"
        state={state(1)}
        title="Get sources"
        body="Pick the exam, the number of questions and a source: a YouTube link, a GitHub or web link, a PDF — or AI generation alone."
        status={
          <>
            {generate ?? 'Use the form below'}
            {at === 1 && <Live>{activity!.label}</Live>}
            {at > 1 && <Live done>Source ready · {activity!.exam}</Live>}
          </>
        }
      />
      <Arrow flowing={at === 1 || at === 2} />
      <Step
        n={2}
        icon={<ShieldCheck className="h-4 w-4" />}
        tone="sky"
        state={state(2)}
        title="AI generated answers"
        body={
          agents
            ? 'gpt-6.1-sol writes or extracts the questions and gives each one its answer key and explanation. Claude Opus then answers each question itself; only keys both agree on go on.'
            : 'OpenAI gpt-6.1-sol writes or extracts the questions and gives each one its answer key and explanation, then checks every key a second time.'
        }
        status={
          at === 2 ? (
            <Live>{activity!.label}</Live>
          ) : at > 2 ? (
            <Live done>Answer keys checked</Live>
          ) : (
            'Every question gets its answer key and explanation'
          )
        }
      />
      <Arrow flowing={at === 2 || at === 3} />
      <Step
        n={3}
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="emerald"
        state={at === 4 ? 'done' : at === 2 && activity!.done > 0 ? 'active' : state(3)}
        title="Publish"
        body={`Auto publish (the default) puts checked questions straight into the pool. Choose Review first to hold them until you publish them by hand.${perAttempt ? ` Every attempt draws ${perAttempt} by domain weight.` : ''}`}
        status={
          <>
            {activity && (
              <div className="mb-1.5">
                <div className="h-1.5 overflow-hidden rounded bg-emerald-100 dark:bg-emerald-950/60" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 font-medium">
                  {activity.done} of {activity.total} {activity.autoPublish ? 'published' : 'saved for review'}
                  {at === 4 ? ' · done' : ''}
                </div>
              </div>
            )}
            {poolHref ? <a href={poolHref} className="underline">{published.toLocaleString()} in the pool</a> : `${published.toLocaleString()} in the pool`}
            {review && review.count > 0 && (
              <>
                {' · '}
                <a href={review.href} className="font-semibold text-amber-700 underline dark:text-amber-400">
                  {review.count.toLocaleString()} awaiting review
                </a>
              </>
            )}
          </>
        }
      />
    </ol>
  );
}

type StepState = 'idle' | 'active' | 'done';

const TONES = {
  violet: { ring: 'border-violet-200 dark:border-violet-900/60', glow: 'border-violet-500 ring-2 ring-violet-300/70 dark:ring-violet-700/60', badge: 'bg-violet-600 text-white', ping: 'bg-violet-400', text: 'text-violet-700 dark:text-violet-300' },
  sky: { ring: 'border-sky-200 dark:border-sky-900/60', glow: 'border-sky-500 ring-2 ring-sky-300/70 dark:ring-sky-700/60', badge: 'bg-sky-600 text-white', ping: 'bg-sky-400', text: 'text-sky-700 dark:text-sky-300' },
  emerald: { ring: 'border-emerald-200 dark:border-emerald-900/60', glow: 'border-emerald-500 ring-2 ring-emerald-300/70 dark:ring-emerald-700/60', badge: 'bg-emerald-600 text-white', ping: 'bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-300' }
};

function Step({ n, icon, tone, state, title, body, status }: { n: number; icon: ReactNode; tone: keyof typeof TONES; state: StepState; title: string; body: string; status: ReactNode }) {
  const t = TONES[tone];
  return (
    <li className={`flex flex-col rounded-md border bg-white p-3 transition-shadow duration-500 dark:bg-slate-900/60 ${state === 'active' ? t.glow : t.ring}`}>
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-6 w-6 shrink-0">
          {state === 'active' && <span className={`absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping ${t.ping}`} />}
          <span className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${t.badge}`}>
            {state === 'done' ? <Check className="h-3.5 w-3.5" /> : n}
          </span>
        </span>
        <span className={t.text}>{state === 'active' ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" /> : icon}</span>
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{title}</span>
      </div>
      <p className="mt-1.5 flex-1 text-[12px] leading-snug text-slate-600 dark:text-slate-300">{body}</p>
      <div className={`mt-2 text-[12px] ${t.text}`}>{status}</div>
    </li>
  );
}

/** A live status line: three bouncing dots while working, a tick when done. */
function Live({ children, done = false }: { children: ReactNode; done?: boolean }) {
  return (
    <div className="mt-1.5 flex items-center gap-1.5 font-medium">
      {done ? (
        <Check className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <span className="inline-flex shrink-0 items-end gap-0.5" aria-hidden>
          {[0, 150, 300].map((d) => (
            <span key={d} className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}

function Arrow({ flowing = false }: { flowing?: boolean }) {
  return (
    <li aria-hidden className={`flex items-center justify-center ${flowing ? 'text-violet-500' : 'text-slate-400'}`}>
      <span className="relative inline-flex">
        {flowing && <ArrowRight className="absolute h-4 w-4 rotate-90 opacity-70 motion-safe:animate-ping md:rotate-0" />}
        <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
      </span>
    </li>
  );
}
