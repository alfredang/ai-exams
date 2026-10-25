import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { EnquiryStatus } from '@prisma/client';
import { auth, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { ENQUIRY_TOPICS, enquiryTopicLabel } from '@/lib/enquiry-topics';

export const dynamic = 'force-dynamic';

const STATUSES: EnquiryStatus[] = ['NEW', 'CONTACTED', 'CLOSED'];

const STATUS_CHIP: Record<EnquiryStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  CONTACTED: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  CLOSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
};

async function setStatus(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as EnquiryStatus;
  if (!STATUSES.includes(status)) return;
  await db.enquiry.update({ where: { id }, data: { status } });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'enquiry.status', targetType: 'Enquiry', targetId: id, metadata: { status } }
  });
  revalidatePath('/admin-dashboard/enquiries');
}

/** wa.me wants digits only; local 8-digit SG numbers get the 65 prefix. */
function waNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 8) return `65${digits}`;
  return digits.length >= 8 ? digits : null;
}

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; topic?: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as EnquiryStatus) ? (sp.status as EnquiryStatus) : undefined;
  const topic = ENQUIRY_TOPICS.some((t) => t.id === sp.topic) ? sp.topic : undefined;

  const [items, counts] = await Promise.all([
    db.enquiry.findMany({ where: { status, topic }, orderBy: { createdAt: 'desc' }, take: 200 }),
    db.enquiry.groupBy({ by: ['status'], _count: { _all: true } })
  ]);
  const countOf = (s: EnquiryStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const total = counts.reduce((n, c) => n + c._count._all, 0);
  const href = (p: { status?: string; topic?: string }) => {
    const q = new URLSearchParams();
    if (p.status) q.set('status', p.status);
    if (p.topic) q.set('topic', p.topic);
    const s = q.toString();
    return `/admin-dashboard/enquiries${s ? `?${s}` : ''}`;
  };
  const chip = (on: boolean) =>
    `rounded-full border px-2.5 py-1 text-[12px] font-medium ${
      on
        ? 'border-blue-600 bg-blue-600 text-white'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
    }`;

  return (
    <div>
      <PageHeader title="Enquiries" subtitle={`Leads from the Support page · ${total} total · ${countOf('NEW')} new`} />

      <div className="mb-3 flex flex-wrap gap-2">
        <Link href={href({ topic })} className={chip(!status)}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={href({ status: s, topic })} className={chip(status === s)}>
            {s.charAt(0) + s.slice(1).toLowerCase()} ({countOf(s)})
          </Link>
        ))}
        <span className="mx-1 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
        <Link href={href({ status })} className={chip(!topic)}>Any topic</Link>
        {ENQUIRY_TOPICS.map((t) => (
          <Link key={t.id} href={href({ status, topic: t.id })} className={chip(topic === t.id)}>{t.label}</Link>
        ))}
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-800/70">
        {items.length === 0 ? (
          <p className="p-4 text-[12px] text-slate-500">No enquiries.</p>
        ) : (
          items.map((e) => {
            const wa = e.phone ? waNumber(e.phone) : null;
            return (
              <div key={e.id} className={`p-4 ${e.status === 'NEW' ? 'bg-blue-50/30 dark:bg-blue-950/15' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_CHIP[e.status]}`}>{e.status}</span>
                      <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{e.name}</span>
                      <span className="text-[12px] text-slate-500">· {enquiryTopicLabel(e.topic)}</span>
                      {e.certification && <span className="text-[12px] text-slate-500">· {e.certification}</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                      <a href={`mailto:${e.email}`} className="text-blue-600 hover:underline dark:text-blue-400">{e.email}</a>
                      {e.phone && <span className="text-slate-600 dark:text-slate-300">{e.phone}</span>}
                      {wa && (
                        <a
                          href={`https://wa.me/${wa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          WhatsApp{e.preferWhatsApp ? ' (preferred)' : ''} →
                        </a>
                      )}
                      <span className="text-[11px] text-slate-500">{e.createdAt.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[13px] text-slate-700 dark:text-slate-200">{e.message}</p>
                  </div>
                  <form action={setStatus} className="flex shrink-0 items-center gap-1.5">
                    <input type="hidden" name="id" value={e.id} />
                    {STATUSES.filter((s) => s !== e.status).map((s) => (
                      <button
                        key={s}
                        name="status"
                        value={s}
                        className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        Mark {s.toLowerCase()}
                      </button>
                    ))}
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
