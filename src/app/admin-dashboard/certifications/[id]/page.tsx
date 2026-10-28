import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ExternalLink, FileText, ShoppingBag } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { CertificationSections } from '@/components/admin/certification-sections';
import { examBaseTitle } from '@/lib/exam-title';
import { practiceHref } from '@/lib/products';

export const dynamic = 'force-dynamic';

const linkBtn =
  'inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800';

// One certification: its exam details, domain weights and SEO meta. Keyed by
// the question bank (Exam) id, since that is where these fields are stored.
export default async function CertificationPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cert?: string }>;
}) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id } = await params;
  const sp = await searchParams;
  const exam = await db.exam.findUnique({
    where: { id },
    select: { id: true, title: true, code: true, poolExamId: true, vendor: { select: { name: true, slug: true } } }
  });
  if (!exam) notFound();
  // A retired variant's settings no longer apply: go to its pool exam.
  if (exam.poolExamId) redirect(`/admin-dashboard/certifications/${exam.poolExamId}`);
  const product = (await db.bundleItem.findFirst({
    where: { examId: exam.id, tier: 'PRACTICE' },
    orderBy: { bundle: { published: 'desc' } },
    select: { bundle: { select: { id: true, slug: true, published: true } } }
  }))?.bundle;

  return (
    <div>
      <PageHeader
        title={examBaseTitle(exam.title)}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-semibold text-violet-800 dark:bg-violet-950/60 dark:text-violet-200">Certification</span>
            <span>{exam.vendor.name} · {exam.code}</span>
          </span>
        }
        back={{ href: '/admin-dashboard/certifications', label: 'Back to Certifications' }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {product?.published && (
              <Link href={practiceHref(exam.vendor.slug, product)} target="_blank" rel="noreferrer" className={linkBtn}>
                <ExternalLink className="h-4 w-4" /> View on site
              </Link>
            )}
            {product && (
              <Link href={`/admin-dashboard/bundles/${product.id}`} className={linkBtn}>
                <ShoppingBag className="h-4 w-4" /> Practice Exam
              </Link>
            )}
            <Link href={`/admin-dashboard/exams/${exam.id}`} className={linkBtn}>
              <FileText className="h-4 w-4" /> Question Bank
            </Link>
          </div>
        }
      />
      <CertificationSections examId={exam.id} flash={sp.cert} />
    </div>
  );
}
