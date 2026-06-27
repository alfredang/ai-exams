import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Check, Timer, BookOpen, Award, BookOpenCheck, Hourglass } from 'lucide-react';
import { BundleAsExamView } from './bundle-as-exam-view';
import { ExamReviews } from '@/components/exam-reviews';
import { getExamRatingSummary } from '@/lib/reviews';
import { ShareExam } from '@/components/share-exam';
import { ExamBundleCTA } from '@/components/exam-bundle-cta';

export async function generateMetadata({ params }: { params: Promise<{ vendor: string; slug: string }> }) {
  const { slug } = await params;
  const exam = await db.exam.findUnique({
    where: { slug },
    select: { title: true, code: true, description: true, metaTitle: true, metaDescription: true, metaKeywords: true, ogImage: true, vendor: { select: { name: true } } }
  });
  if (!exam) return {};
  const title = exam.metaTitle || `${exam.vendor.name} ${exam.code} — ${exam.title} | ExamNova`;
  const description = exam.metaDescription || (exam.description ? exam.description.slice(0, 170) : `Practice questions and exam voucher for ${exam.code}.`);
  return {
    title,
    description,
    keywords: exam.metaKeywords ?? undefined,
    openGraph: { title, description, images: exam.ogImage ? [exam.ogImage] : undefined },
    alternates: { canonical: `/practice-exams/${(await params).vendor}/${slug}` }
  };
}

export default async function ExamDetailPage({ params, searchParams }: { params: Promise<{ vendor: string; slug: string }>; searchParams: Promise<{ teaser?: string }> }) {
  const { vendor: vendorSlug, slug } = await params;
  // Surface the teaser route's "no teaser questions" bounce — without this,
  // a user who clicked "Try the free teaser" on an exam with 0 teaser
  // questions silently landed back here with no explanation. (Teaser-audit L4.)
  const teaserUnavailable = (await searchParams)?.teaser === 'unavailable';
  const exam = await db.exam.findUnique({
    where: { slug },
    include: {
      vendor: true,
      _count: { select: { questions: { where: { status: 'PUBLISHED' } } } }
    }
  });

  // We need session info early to decide whether unpublished exams are
  // viewable (entitled users can see exams they own even when those
  // exams are hidden from the public catalog because they're sold via
  // a bundle).
  //
  // Note: admins are intentionally NOT bypassed here. Earlier we let
  // admins see any unpublished exam at its public URL — but that meant
  // when an admin browsed to a lonely-base-shell URL (e.g. aws-soa-c03,
  // which is unpublished so the bundle view wins for customers), the
  // admin saw a misleading "isn't yet available in a bundle" message
  // because the base shell isn't in any bundle item. To preview an
  // unpublished exam's content, admins should use the admin dashboard
  // routes (`/admin-dashboard/exams/[id]` and `/test`) — that's the
  // right tool. The public URL should mirror the customer experience.
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  // Is the unpublished exam (if any) one this user is entitled to via a
  // bundle purchase? If yes, they should still see the exam detail page so
  // they can launch attempts.
  let userIsEntitled = false;
  if (exam && !exam.published && userId) {
    const ent = await db.entitlement.findFirst({
      where: { userId, examId: exam.id, tier: { in: ['PRACTICE', 'BUNDLE', 'VOUCHER', 'ADMIN_GRANT'] } }
    });
    userIsEntitled = !!ent;
  }

  // Routing rules:
  //   - Exam found AND (published OR entitled)  →  render exam page
  //   - Otherwise try Bundle by the same slug (the bundle wins when an
  //     unpublished base shell shares its slug, e.g. aws-saa-c03,
  //     aws-soa-c03, aws-sap-c02)
  //   - Otherwise 404
  const examIsViewable = !!exam && (exam.published || userIsEntitled);
  if (!examIsViewable) {
    const bundle = await db.bundle.findUnique({
      where: { slug },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: { exam: { include: { vendor: true } } }
        }
      }
    });
    const bundleVendor = bundle?.items[0]?.exam.vendor;
    if (!bundle || !bundle.published || bundleVendor?.slug !== vendorSlug) {
      notFound();
    }
    return <BundleAsExamView bundle={bundle} userId={userId} />;
  }

  if (!exam) notFound(); // narrowing for TS — examIsViewable ⇒ exam !== null
  if (exam.vendor.slug !== vendorSlug) notFound();

  // Run the three independent fetches concurrently — saves ~200–500ms vs
  // the previous sequential await chain.
  const { getTeaserSize } = await import('@/lib/settings');
  const [teaserCount, teaserN, ratingSummary] = await Promise.all([
    db.question.count({ where: { examId: exam.id, isTeaser: true, status: 'PUBLISHED' } }),
    getTeaserSize(),
    getExamRatingSummary(exam.id)
  ]);
  const domains = (exam.domains as any[]) || [];
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: exam.title,
    description: exam.description,
    brand: { '@type': 'Brand', name: exam.vendor.name }
  };
  if (ratingSummary.count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingSummary.average,
      reviewCount: ratingSummary.count
    };
  }

  // Entitlement check for showing "You have access — Start your attempt"
  // sidebar. userIsEntitled was already computed above for unpublished
  // exams; re-use it for published exams too.
  const entitled = userIsEntitled || (userId
    ? !!(await db.entitlement.findFirst({
        where: { userId, examId: exam.id, tier: { in: ['PRACTICE', 'BUNDLE', 'VOUCHER', 'ADMIN_GRANT'] } }
      }))
    : false);

  return (
    <div className="container-app py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {teaserUnavailable && (
        <div className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          The free teaser isn't available for this exam yet — it needs at least one teaser question.
        </div>
      )}
      <div className="mb-2 text-sm">
        <Link href="/practice-exams" className="text-blue-600 hover:underline">All exams</Link>
        <span className="text-slate-400"> / </span>
        <Link href={`/practice-exams/${exam.vendor.slug}`} className="text-blue-600 hover:underline">{exam.vendor.name}</Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="badge-brand">{exam.vendor.name}</span>
            <span className="badge">{exam.code}</span>
            <span className="badge">{exam.level}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-100">{exam.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={BookOpen} label="Questions" value={`${exam._count.questions}`} />
            <Stat icon={Timer} label="Duration" value={`${exam.durationMinutes} min`} />
            <Stat icon={Award} label="Pass score" value={`${exam.passingScore}%`} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="card p-5">
              <BookOpenCheck className="h-6 w-6 text-blue-600" />
              <h3 className="mt-3 font-semibold">Practice mode</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">See the correct answer and full explanation immediately after each question. Best for studying.</p>
            </div>
            <div className="card p-5">
              <Hourglass className="h-6 w-6 text-blue-600" />
              <h3 className="mt-3 font-semibold">Exam mode</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">{exam.durationMinutes}-minute timer, no answer reveal until you submit. Auto-saves and auto-submits — like the real exam.</p>
            </div>
          </div>

          {domains.length > 0 && (
            <div className="mt-8 card p-6">
              <h2 className="font-semibold">Domains covered</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {domains.map((d, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-100">{d.name}</span>
                    <span className="text-slate-500 dark:text-slate-300">{d.weight}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 card p-6">
            <h2 className="font-semibold">What you get</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-100">
              {[
                'Practice mode with immediate explanations',
                'Timed Exam mode that simulates the real test',
                'Mark questions for review and filter by status',
                'Per-domain breakdown after each attempt',
                'Original questions — never real exam dumps'
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-blue-600" /> {f}</li>
              ))}
            </ul>
          </div>

          <ShareExam vendorSlug={exam.vendor.slug} examSlug={exam.slug} title={`${exam.vendor.name} ${exam.code} — ${exam.title}`} />

          <ExamReviews examId={exam.id} examTitle={exam.title} />

          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            This platform provides original practice questions for learning. We are not affiliated with {exam.vendor.name}, and we do not provide real exam dumps.
          </p>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-300">2026 Practice Exam Details</h3>
            <dl className="mt-3 space-y-1 text-sm">
              <Row k="Exam code" v={exam.code} />
              <Row k="Level" v={exam.level} />
              <Row k="Duration" v={`${exam.durationMinutes} min`} />
              <Row k="Pass score" v={`${exam.passingScore}%`} />
              <Row k="Question count" v={`${exam.questionCount}`} />
            </dl>
          </div>

          {entitled && (
            <div className="card p-5">
              <div className="mb-1 text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">You have access</div>
              <div className="font-semibold">Start your attempt</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">Pick a mode below.</p>
              <div className="mt-3 flex flex-col gap-2">
                <StartButton examId={exam.id} mode="PRACTICE" />
                <StartButton examId={exam.id} mode="EXAM" />
              </div>
            </div>
          )}
          {!entitled && teaserCount > 0 && (
            <Link href={`/practice-exams/${exam.vendor.slug}/${exam.slug}/teaser`} className="card-hover block p-5">
              <div className="mb-1 text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Free</div>
              <div className="font-semibold">Try {teaserN} questions for free</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-100">No credit card required.</p>
              <div className="btn-outline mt-3 w-full">Start free practice exam</div>
            </Link>
          )}
          {!entitled && <ExamBundleCTA examId={exam.id} />}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <Icon className="h-5 w-5 text-blue-600" />
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-300">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-300">{k}</dt><dd className="font-medium">{v}</dd></div>;
}

function StartButton({ examId, mode }: { examId: string; mode: 'PRACTICE' | 'EXAM' }) {
  return (
    <form action={async () => {
      'use server';
      const { db } = await import('@/lib/db');
      const { auth } = await import('@/lib/auth');
      const { redirect } = await import('next/navigation');
      const s = await auth();
      const uid = (s?.user as any)?.id;
      const exam = await db.exam.findUnique({ where: { id: examId } });
      if (!exam || !uid) return;
      const ent = await db.entitlement.findFirst({
        where: { userId: uid, examId, tier: { in: ['PRACTICE', 'BUNDLE', 'ADMIN_GRANT'] } }
      });
      if (!ent) return;
      const qs = await db.question.findMany({ where: { examId, status: 'PUBLISHED' }, select: { id: true } });
      const ids = qs.map(q => q.id).sort(() => Math.random() - 0.5).slice(0, exam.questionCount);
      const att = await db.attempt.create({
        data: {
          userId: uid, examId, mode, questionIds: ids,
          durationSec: mode === 'EXAM' ? exam.durationMinutes * 60 : 0,
          expiresAt: mode === 'EXAM' ? new Date(Date.now() + exam.durationMinutes * 60_000) : null,
          responses: {}
        }
      });
      redirect(`/exam/${att.id}`);
    }}>
      <button className={mode === 'EXAM' ? 'btn-primary-grad w-full' : 'btn-secondary w-full'}>
        {mode === 'EXAM' ? 'Exam Mode' : 'Practice Mode'}
      </button>
    </form>
  );
}
