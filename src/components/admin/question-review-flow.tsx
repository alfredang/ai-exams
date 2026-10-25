import { ArrowRight, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * The question bank's AI workflow as a three-step process map:
 * AI generates drafts → an admin reviews each one → approved questions join
 * the pool that attempts draw from. Counts are live.
 */
export function QuestionReviewFlow({
  awaiting,
  published,
  perAttempt,
  reviewHref = '#review',
  poolHref,
  generate
}: {
  awaiting: number;
  published: number;
  /** Questions each attempt draws; omitted on the all-exams generator page. */
  perAttempt?: number;
  reviewHref?: string;
  poolHref?: string;
  /** Step 1's action — the AI Generate button that opens the pop-up form. */
  generate?: ReactNode;
}) {
  return (
    <ol className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
      <Step
        n={1}
        icon={<Sparkles className="h-4 w-4" />}
        tone="violet"
        title="AI generates"
        body="Questions, answers, explanations and references for the domains you choose. Saved as drafts."
        status={generate ?? 'Use the form below'}
      />
      <Arrow />
      <Step
        n={2}
        icon={<UserCheck className="h-4 w-4" />}
        tone="amber"
        title="Human review"
        body="An admin checks each draft: edit it, approve it, or reject it. Drafts are never shown to learners."
        status={awaiting > 0 ? <a href={reviewHref} className="font-semibold underline">{awaiting} awaiting review →</a> : 'Nothing to review'}
      />
      <Arrow />
      <Step
        n={3}
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="emerald"
        title="Added to the pool"
        body={`Approved questions are published.${perAttempt ? ` Every attempt draws ${perAttempt} of them by domain weight.` : ' Attempts draw from them by domain weight.'}`}
        status={poolHref ? <a href={poolHref} className="underline">{published} in the pool</a> : `${published} in the pool`}
      />
    </ol>
  );
}

const TONES = {
  violet: { ring: 'border-violet-200 dark:border-violet-900/60', badge: 'bg-violet-600 text-white', text: 'text-violet-700 dark:text-violet-300' },
  amber: { ring: 'border-amber-200 dark:border-amber-900/60', badge: 'bg-amber-500 text-white', text: 'text-amber-800 dark:text-amber-300' },
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
