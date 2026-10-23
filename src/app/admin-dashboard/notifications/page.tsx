import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { CheckCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function markAllRead() {
  'use server';
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return;
  await db.adminNotification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } });
  revalidatePath('/admin-dashboard/notifications');
}

async function deleteRead() {
  'use server';
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return;
  await db.adminNotification.deleteMany({ where: { readAt: { not: null } } });
  revalidatePath('/admin-dashboard/notifications');
}

export default async function NotificationsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const items = await db.adminNotification.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  const unread = items.filter((i) => !i.readAt).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${items.length} entr${items.length === 1 ? 'y' : 'ies'} · ${unread} unread`}
        actions={
          <div className="flex gap-2">
            <form action={markAllRead}>
              <button className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
                <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
              </button>
            </form>
            <form action={deleteRead}>
              <button className="btn-sm bg-red-600 text-white hover:bg-red-700">Clear read</button>
            </form>
          </div>
        }
      />
      <div className="card divide-y divide-slate-100 dark:divide-slate-800/70">
        {items.length === 0 ? (
          <p className="p-4 text-[12px] text-slate-500">No notifications.</p>
        ) : (
          items.map((n) => (
            <div key={n.id} className={`flex items-start justify-between gap-3 p-3 ${!n.readAt ? 'bg-blue-50/30 dark:bg-blue-950/15' : ''}`}>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-slate-900 dark:text-slate-100">{n.title}</div>
                {n.body && <div className="mt-0.5 text-[12px] text-slate-500">{n.body}</div>}
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                  <code>{n.kind}</code>
                  <span>·</span>
                  <span>{n.createdAt.toLocaleString()}</span>
                  {n.link && (
                    <Link href={n.link} className="text-blue-600 hover:underline dark:text-blue-400">Open →</Link>
                  )}
                </div>
              </div>
              {!n.readAt && (
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                  NEW
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
