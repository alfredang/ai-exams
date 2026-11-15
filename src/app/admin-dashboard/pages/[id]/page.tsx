import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import PageEditorClient from './editor-client';

export const dynamic = 'force-dynamic';

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id } = await params;
  const isNew = id === 'new';
  const page = isNew ? null : await db.page.findUnique({ where: { id } });
  if (!isNew && !page) return notFound();

  return (
    <div>
      <div className="mb-2 text-sm">
        <Link href="/admin-dashboard/pages" className="text-slate-500 hover:underline">← All pages</Link>
      </div>
      <h1 className="admin-h1">{isNew ? 'New page' : page!.title}</h1>
      {!isNew && (
        <p className="mt-1 text-xs text-slate-500">
          Public URL: <Link href={`/p/${page!.slug}`} target="_blank" className="text-brand-600 hover:underline">/p/{page!.slug}</Link>
        </p>
      )}
      <PageEditorClient
        id={isNew ? null : page!.id}
        initial={
          isNew
            ? { slug: '', title: '', bodyHtml: '', excerpt: '', published: true, showInFooter: false, footerGroup: null, position: 0 }
            : {
                slug: page!.slug,
                title: page!.title,
                bodyHtml: page!.bodyHtml,
                excerpt: page!.excerpt ?? '',
                published: page!.published,
                showInFooter: page!.showInFooter,
                footerGroup: (page!.footerGroup as 'legal' | 'company' | null) ?? null,
                position: page!.position
              }
        }
      />
    </div>
  );
}
