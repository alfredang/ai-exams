import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * The AI Question and Answer Generator as a three-step map: choose a source
 * (AI generation, YouTube, web link or PDF) → AI extracts or generates the
 * questions and checks every answer key → published into the pool. There is
 * no human review step; audit flags highlight questions that need a look.
 */
export function QuestionFlow({
  published,
  checked,
  perAttempt,
  poolHref,
  generate
}: {
  published: number;
  /** Published questions whose answer key AI has checked. */
  checked: number;
  /** Questions each attempt draws; omitted on the all-exams generator page. */
  perAttempt?: number;
  poolHref?: string;
  /** Step 1's action — the AI Generate button that opens the pop-up form. */
  generate?: ReactNode;
}) {
  return (
    <ol className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
      <Step
        n={1}
        icon={<FileText className="h-4 w-4" />}
        tone="violet"
        title="Choose a source"
        body="A YouTube link, a web link, a PDF upload — or AI generation for the exam domains you choose."
        status={generate ?? 'Use the form below'}
      />
      <Arrow />
      <Step
        n={2}
        icon={<ShieldCheck className="h-4 w-4" />}
        tone="sky"
        title="AI extracts, generates & checks"
        body="OpenAI gpt-6.1-sol extracts (optionally rephrased) or writes questions with answers and explanations, then checks every answer key."
        status={`${checked.toLocaleString()} of ${published.toLocaleString()} answer keys AI-checked`}
      />
      <Arrow />
      <Step
        n={3}
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="emerald"
        title="Published to the pool"
        body={`Questions that pass go straight into the pool.${perAttempt ? ` Every attempt draws ${perAttempt} of them by domain weight.` : ' Attempts draw from them by domain weight.'}`}
        status={poolHref ? <a href={poolHref} className="underline">{published.toLocaleString()} in the pool</a> : `${published.toLocaleString()} in the pool`}
      />
    </ol>
  );
}

const TONES = {
  violet: { ring: 'border-violet-200 dark:border-violet-900/60', badge: 'bg-violet-600 text-white', text: 'text-violet-700 dark:text-violet-300' },
  sky: { ring: 'border-sky-200 dark:border-sky-900/60', badge: 'bg-sky-600 text-white', text: 'text-sky-700 dark:text-sky-300' },
  emerald: { ring: 'border-emerald-200 dark:border-emerald-900/60', badge: 'bg-emerald-600 text-white', text: 'text-emerald-700 dark:text-emerald-300' }
};

function Step({ n, icon, tone, title, body, status }: { n: number; icon: ReactNode; tone: keyof typeof TONES; title: string; body: string; status: ReactNode }) {
  const t = TONES[tone];
  return (
    <li className={`flex flex-col rounded-md border bg-white p-3 dark:bg-slate-900/60 ${t.ring}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${t.badge}`}>{n}</span>
        <span className={t.text}>{icon}</span>
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{title}</span>
      </div>
      <p className="mt-1.5 flex-1 text-[12px] leading-snug text-slate-600 dark:text-slate-300">{body}</p>
      <div className={`mt-2 text-[12px] ${t.text}`}>{status}</div>
    </li>
  );
}

function Arrow() {
  return (
    <li aria-hidden className="flex items-center justify-center text-slate-400">
      <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
    </li>
  );
}
