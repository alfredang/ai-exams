'use client';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { BookOpen, Loader2, Play, Ticket, Timer } from 'lucide-react';
import { startFromDashboard } from '@/app/user-dashboard/actions';
import { tierLabel } from '@/lib/utils';
import type { MyExamsListItem } from '@/lib/my-exams';

// One shape for both layouts. Bundles are one practice exam per certification
// (each attempt is a fresh, domain-weighted draw, so nothing to expand);
// standalone rows are a single exam entitlement.
type Entry = {
  key: string;
  examId: string;
  vendorName: string;
  code: string;
  title: string;
  meta: string;
  activity?: string;
  detailsHref: string;
  tag: { label: string; tone: 'slate' | 'blue' | 'emerald' } | null;
  hasVoucher: boolean;
};

function toEntry(item: MyExamsListItem): Entry {
  if (item.kind === 'bundle') {
    const b = item.data;
    const row = b.items[0];
    return {
      key: `b-${b.bundleId}`,
      examId: row.examId,
      vendorName: b.vendorName,
      code: b.code,
      title: b.bundleTitle,
      meta: `Practice exam · ${row.questionCount} questions · ${row.durationMinutes} min · unlimited retakes`,
      activity: item.activity,
      detailsHref: `/practice-exams/${b.vendorSlug}/${b.bundleSlug}`,
      tag: b.level ? { label: b.level, tone: 'slate' } : null,
      hasVoucher: b.hasVoucher
    };
  }
  const e = item.data;
  return {
    key: `e-${e.entitlementId}`,
    examId: e.examId,
    vendorName: e.vendorName,
    code: e.examCode,
    title: e.examTitle,
    meta: `${e.questionCount} questions · ${e.durationMinutes} min`,
    activity: item.activity,
    detailsHref: `/practice-exams/${e.vendorSlug}/${e.examSlug}`,
    tag: { label: tierLabel(e.tier), tone: e.tier === 'VOUCHER' ? 'emerald' : 'blue' },
    hasVoucher: false
  };
}

const TONES = {
  slate: '',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
};

export function MyExamsList({
  items,
  cols = 2,
  view = 'cards'
}: {
  items: MyExamsListItem[];
  cols?: 2 | 3;
  view?: 'cards' | 'list';
}) {
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          You don't own any exams yet.
        </p>
        <Link href="/practice-exams" className="btn-primary-grad mt-4 inline-flex items-center gap-1">
          Browse catalog →
        </Link>
      </div>
    );
  }

  const entries = items.map(toEntry);

  if (view === 'list') {
    return (
      <div className="card divide-y divide-line overflow-hidden dark:divide-slate-800">
        {entries.map((e) => (
          <div key={e.key} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="badge mt-0.5 shrink-0 font-mono">{e.code}</span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">
                  <Link href={e.detailsHref} className="hover:underline">{e.title}</Link>
                </h3>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {e.vendorName} · {e.meta}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  {e.activity && <span className="text-slate-500 dark:text-slate-400">{e.activity}</span>}
                  {e.hasVoucher && (
                    <Link href="/user-dashboard/vouchers" className={`badge ${TONES.emerald}`}>
                      <Ticket className="mr-1 h-3 w-3" /> Voucher
                    </Link>
                  )}
                  {e.tag && e.tag.tone !== 'slate' && <span className={`badge ${TONES[e.tag.tone]}`}>{e.tag.label}</span>}
                </div>
              </div>
            </div>
            <form action={startFromDashboard} className="md:w-[22rem] md:shrink-0">
              <input type="hidden" name="examId" value={e.examId} />
              <StartButtons compact />
            </form>
          </div>
        ))}
      </div>
    );
  }

  const gridCols = cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <div className={`grid gap-3 ${gridCols}`}>
      {entries.map((e) => (
        <div key={e.key} className="card flex flex-col p-4">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="badge-brand">{e.vendorName}</span>
            <span className="badge">{e.code}</span>
            {e.tag && <span className={`badge ${TONES[e.tag.tone]}`}>{e.tag.label}</span>}
            {e.hasVoucher && <span className={`badge ${TONES.emerald}`}>Voucher</span>}
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold">{e.title}</h3>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{e.meta}</div>
          {e.activity && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{e.activity}</div>}
          {e.hasVoucher && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-xs dark:bg-emerald-950/30">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-900 dark:text-emerald-100">
                Your real {e.code} exam voucher is in{' '}
                <Link href="/user-dashboard/vouchers" className="font-medium underline">
                  Vouchers
                </Link>
                .
              </span>
            </div>
          )}
          <StartActions examId={e.examId} detailsHref={e.detailsHref} />
        </div>
      ))}
    </div>
  );
}

// One click into the runner in either mode (resumes an unfinished attempt in that mode).
function StartActions({ examId, detailsHref }: { examId: string; detailsHref: string }) {
  return (
    <form action={startFromDashboard} className="mt-auto pt-3">
      <input type="hidden" name="examId" value={examId} />
      <StartButtons />
      <Link href={detailsHref} className="mt-2 block text-center text-xs text-slate-500 hover:underline dark:text-slate-400">
        Exam details
      </Link>
    </form>
  );
}

function StartButtons({ compact = false }: { compact?: boolean }) {
  const { pending, data } = useFormStatus();
  const pendingMode = pending ? (data?.get('mode') === 'PRACTICE' ? 'PRACTICE' : 'EXAM') : null;
  return (
    <div className="flex gap-2">
      <button name="mode" value="EXAM" disabled={pending} className="btn-primary-grad flex-1 gap-1.5 text-sm disabled:cursor-wait">
        {pendingMode === 'EXAM' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Timer className="h-4 w-4" />}
        {pendingMode === 'EXAM' ? 'Starting…' : compact ? 'Exam mode' : 'Exam mode (timed)'}
      </button>
      <button name="mode" value="PRACTICE" disabled={pending} className="btn-secondary flex-1 gap-1.5 text-sm disabled:cursor-wait">
        {pendingMode === 'PRACTICE' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {pendingMode === 'PRACTICE' ? 'Starting…' : 'Practice mode'}
      </button>
    </div>
  );
}
