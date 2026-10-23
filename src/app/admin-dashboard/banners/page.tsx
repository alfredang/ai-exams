import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/admin/badge';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (!user || user.role === 'USER') throw new Error('forbidden');
}

async function createBanner(formData: FormData) {
  'use server';
  await requireAdmin();
  const body = String(formData.get('body') || '').trim();
  const link = String(formData.get('link') || '').trim() || null;
  const theme = String(formData.get('theme') || 'info');
  const startsAt = String(formData.get('startsAt') || '').trim();
  const endsAt = String(formData.get('endsAt') || '').trim();
  const published = formData.get('published') === 'on';
  if (!body) return;
  await db.banner.create({
    data: {
      body, link, theme,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      published
    }
  });
  revalidatePath('/admin-dashboard/banners');
}

async function deleteBanner(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = String(formData.get('id'));
  await db.banner.delete({ where: { id } });
  revalidatePath('/admin-dashboard/banners');
}

export default async function BannersAdminPage() {
  const session = await auth();
  if ((session?.user as any)?.role === 'USER' || !session?.user) redirect('/');
  const banners = await db.banner.findMany({ orderBy: { createdAt: 'desc' } });
  const now = new Date();

  return (
    <div>
      <PageHeader title="Banners" subtitle={`${banners.length} banner${banners.length === 1 ? '' : 's'}. Show announcements / promotions on the public surface.`} />

      <form action={createBanner} className="card mb-3 space-y-2 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Add banner</div>
        <input name="body" required placeholder="Banner text (one line)" className="input-sm" />
        <input name="link" placeholder="Optional link URL" className="input-sm" />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500">Theme</span>
            <select name="theme" defaultValue="info" className="input-sm">
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
            </select>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500">Starts</span>
            <input type="datetime-local" name="startsAt" className="input-sm" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500">Ends</span>
            <input type="datetime-local" name="endsAt" className="input-sm" />
          </label>
          <label className="inline-flex items-center gap-1 self-end text-xs"><input type="checkbox" name="published" defaultChecked /> Published</label>
          <button className="ml-auto inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">Add</button>
        </div>
      </form>

      <div className="space-y-2">
        {banners.length === 0 && <p className="text-[12px] text-slate-500">No banners yet.</p>}
        {banners.map((b) => {
          const live = b.published && (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now);
          return (
            <div key={b.id} className="card flex items-start justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={live ? 'success' : 'muted'}>{live ? 'LIVE' : 'OFF'}</Badge>
                  <span className="text-[11px] text-slate-500">{b.theme}</span>
                  <span className="text-[11px] text-slate-500">
                    {b.startsAt ? b.startsAt.toISOString().slice(0, 10) : 'always'} → {b.endsAt ? b.endsAt.toISOString().slice(0, 10) : '∞'}
                  </span>
                </div>
                <div className="mt-1 text-[13px] text-slate-900 dark:text-slate-100">{b.body}</div>
                {b.link && <div className="text-[11px] text-slate-500">→ {b.link}</div>}
              </div>
              <form action={deleteBanner}>
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton message="Delete this banner?" className="h-7 px-2 text-xs">
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </ConfirmButton>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
