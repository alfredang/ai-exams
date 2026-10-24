import Link from 'next/link';
import { ChevronRight, Check, ExternalLink, Gift, GraduationCap, Ticket } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PRACTICE_PRICE_CENTS } from '@/lib/products';
import type { InstructorLedCourse } from '@/lib/instructor-led';

// Shared building blocks for the two storefront product pages:
// the Practice Exam page and the Exam Voucher page.

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
          {it.href ? (
            <Link href={it.href} className="hover:text-brand hover:underline dark:hover:text-brand-300">{it.label}</Link>
          ) : (
            <span aria-current="page" className="font-medium text-slate-700 dark:text-slate-200">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function StatTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white/80 px-4 py-3 shadow-card backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand dark:bg-brand-500/15 dark:text-brand-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted dark:text-slate-400">{label}</div>
        <div className="font-display text-lg font-bold leading-tight">{value}</div>
      </div>
    </div>
  );
}

export function CheckList({ items, tone = 'brand' }: { items: React.ReactNode[]; tone?: 'brand' | 'emerald' }) {
  const color = tone === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand dark:text-brand-300';
  return (
    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
      {items.map((f, i) => (
        <li key={i} className="flex items-start gap-2">
          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The cross-sell on a Practice Exam page: the Exam Voucher for the same
 * certification, with the practice exam included free.
 */
export function VoucherUpsell({ href, buyHref, price, code, compact = false }: {
  href: string;
  buyHref: string;
  price: number;
  code: string;
  compact?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-card dark:border-emerald-500/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl dark:bg-emerald-500/20" aria-hidden="true" />
      <div className="relative">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          <Gift className="h-3 w-3" aria-hidden="true" /> Best value
        </span>
        <h3 className="mt-2 font-display text-lg font-extrabold leading-snug text-ink dark:text-white">
          Ready to sit the real {code} exam?
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Get the official exam voucher and this practice exam is <b className="text-emerald-700 dark:text-emerald-300">included free</b> (worth {formatPrice(PRACTICE_PRICE_CENTS)}).
        </p>
        {!compact && (
          <div className="mt-3">
            <CheckList tone="emerald" items={['Official vendor voucher for one exam attempt', 'Full practice exam unlocked instantly', 'One checkout, one tax invoice']} />
          </div>
        )}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted dark:text-slate-400">Voucher + practice</div>
            <div className="font-display text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{formatPrice(price)}</div>
          </div>
          <Ticket className="h-8 w-8 text-emerald-500/70" aria-hidden="true" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link href={buyHref} className="btn inline-flex w-full items-center justify-center bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400">
            Buy voucher
          </Link>
          <Link href={href} className="btn-outline w-full">Voucher details</Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Links a certification to its trainer-led WSQ / CASL course on
 * tertiarycourses.com.sg. Callers render it only when a course exists.
 */
export function InstructorLedCard({ course, code }: { course: InstructorLedCourse; code: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card dark:border-slate-700/70 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-brand-700 dark:text-brand-300">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> Instructor-Led Exam Prep
        </span>
        <span className="badge">{course.scheme}</span>
      </div>
      <h3 className="mt-2 font-semibold">Prefer a trainer-led class?</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Prepare for {code} with a {course.scheme} course at Tertiary Courses Singapore — live classes with an experienced trainer and course fee funding for eligible learners.
      </p>
      <a href={course.url} target="_blank" rel="noopener" className="btn-outline mt-4 w-full">
        View {course.scheme} course <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

/** Phone-only sticky purchase bar; the desktop buy card lives in the sidebar. */
export function MobileBuyBar({ label, price, href, cta }: { label: string; price: number; href: string; cta: string }) {
  return (
    <>
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-xs text-muted dark:text-slate-400">{label}</div>
            <div className="font-display text-xl font-extrabold text-ink dark:text-white">{formatPrice(price)}</div>
          </div>
          <Link href={href} className="btn-primary-grad min-h-[44px] shrink-0 px-5">{cta}</Link>
        </div>
      </div>
    </>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/80">
      {items.map((f) => (
        <details key={f.q} className="group p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium marker:hidden">
            {f.q}
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" aria-hidden="true" />
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
