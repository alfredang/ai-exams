import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { seedDefaultPages } from '@/lib/pages';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function seedAction() {
  'use server';
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return;
  await seedDefaultPages();
  revalidatePath('/admin-dashboard/pages');
}

export default async function AdminPagesPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const pages = await db.page.findMany({
    orderBy: [{ footerGroup: 'asc' }, { position: 'asc' }, { title: 'asc' }]
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="mt-1 text-sm text-slate-500">
            Static content pages (Terms, Privacy, FAQ, etc.). Footer-visible pages appear in the site footer.
          </p>
        </div>
        <div className="flex gap-2">
          <form action={seedAction}>
            <button className="btn-ghost text-sm">Seed defaults</button>
          </form>
          <Link href="/admin-dashboard/pages/new" className="btn-primary text-sm">+ New page</Link>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Footer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {pages.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">
                No pages yet. Click <b>Seed defaults</b> to create Terms, Privacy, Refund, FAQ, and How it works.
              </td></tr>
            )}
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-xs">
                  <Link href={`/p/${p.slug}`} target="_blank" className="text-blue-600 hover:underline">/p/{p.slug}</Link>
                </td>
                <td className="px-4 py-3 text-xs">
                  {p.showInFooter ? (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {p.footerGroup || 'shown'}
                    </span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-xs">
                  {p.published ? (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">PUBLISHED</span>
                  ) : (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">DRAFT</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.updatedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin-dashboard/pages/${p.id}`} className="text-sm text-blue-600 hover:underline">Edit →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
