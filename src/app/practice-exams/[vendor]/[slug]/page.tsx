import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Check, Timer, BookOpen, Award, BookOpenCheck, Hourglass } from 'lucide-react';
import { BundleAsExamView } from './bundle-as-exam-view';
import { ExamReviews } from '@/components/exam-reviews';
import { getExamRatingSummary } from '@/lib/reviews';
import { ShareExam } from '@/components/share-exam';
import { ExamBundleCTA } from '@/components/exam-bundle-cta';
import { PUBLIC_SITE_URL, serializeJsonLd } from '@/lib/structured-data';
import { STORE_CURRENCY } from '@/lib/currency';
import { hasPracticeAccess } from '@/lib/question-pool';
import { StartButton } from './start-attempt-button';
import { ExamDomains, ExamReferences } from '@/components/exam-domains';

export async function generateMetadata({ params }: { params: Promise<{ vendor: string; slug: string }> }) {
  const { slug } = await params;
  const select = { title: true, code: true, description: true, published: true, poolExamId: true, metaTitle: true, metaDescription: true, metaKeywords: true, ogImage: true, vendor: { select: { name: true } } } as const;
  // The Practice Exam product wins its slug; its SEO meta lives on the
  // product's practice (pool) exam. Mirror the page's routing here.
  const product = await db.bundle.findUnique({
    where: { slug },
    select: { published: true, title: true, description: true, items: { where: { tier: 'PRACTICE' }, take: 1, select: { exam: { select } } } }
  });
  const pool = product?.published ? product.items[0]?.exam : null;
  let exam = pool ? { ...pool, title: product!.title, description: product!.description } : await db.exam.findUnique({ where: { slug }, select });
  if (!exam) return {};
  const title = exam.metaTitle || `${exam.vendor.name} ${exam.code} — ${exam.title} | Tertiary Exams`;
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
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  // The Practice Exam product owns its URL. Owners still reach it after the
  // product is taken off sale so they can keep starting attempts.
  const product = await db.bundle.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { position: 'asc' },
        include: { exam: { include: { vendor: true, _count: { select: { questions: { where: { status: 'PUBLISHED' } } } } } } }
      }
    }
  });
  const productPool = product?.items.find((i) => i.tier === 'PRACTICE') ?? product?.items[0];
  if (product && productPool && productPool.exam.vendor.slug === vendorSlug) {
    const owned = !!userId && await hasPracticeAccess(db, userId, productPool.examId);
    if (product.published || owned) return <BundleAsExamView bundle={product} userId={userId} owned={owned} />;
  }

  const exam = await db.exam.findUnique({
    where: { slug },
    include: {
      vendor: true,
      _count: { select: { questions: { where: { status: 'PUBLISHED' } } } }
    }
  });

  // Retired "Practice Exam N" variants live on as rows only — their questions
  // are in the certification's single pool exam — and a pool exam's own slug
  // (e.g. aws-aif-c01-p1) is not a product URL. Send both to the product.
  if (exam) {
    const owner = await db.bundle.findFirst({
      where: { published: true, items: { some: { examId: exam.poolExamId ?? exam.id, tier: 'PRACTICE' } } },
      select: { slug: true }
    });
    if (owner && owner.slug !== slug) permanentRedirect(`/practice-exams/${vendorSlug}/${owner.slug}`);
  }

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
  // Is the unpublished exam (if any) one this user is entitled to via a
  // bundle purchase? If yes, they should still see the exam detail page so
  // they can launch attempts.
  let userIsEntitled = false;
  if (exam && !exam.published && userId) {
    userIsEntitled = await hasPracticeAccess(db, userId, exam.id);
  }

  // Routing rules:
  //   - Exam found AND (published OR entitled)  →  render exam page
  //   - Otherwise try Bundle by the same slug (the bundle wins when an
  //     unpublished base shell shares its slug, e.g. aws-saa-c03,
  //     aws-soa-c03, aws-sap-c02)
  //   - Otherwise 404
  const examIsViewable = !!exam && !exam.poolExamId && (exam.published || userIsEntitled);
  if (!examIsViewable) notFound();

  if (!exam) notFound(); // narrowing for TS — examIsViewable ⇒ exam !== null
  if (exam.vendor.slug !== vendorSlug) notFound();

  // Run the three independent fetches concurrently — saves ~200–500ms vs
  // the previous sequential await chain.
  const { getTeaserSize } = await import('@/lib/settings');
  const [teaserCount, teaserN, ratingSummary, purchaseBundles, structuredReviews] = await Promise.all([
    db.question.count({ where: { examId: exam.id, isTeaser: true, status: 'PUBLISHED' } }),
    getTeaserSize(),
    getExamRatingSummary(exam.id),
    db.bundle.findMany({
      where: { published: true, items: { some: { examId: exam.id } } },
      orderBy: { price: 'asc' },
      select: { id: true, slug: true, price: true, priceVoucher: true }
    }),
    db.review.findMany({
      where: { examId: exam.id, status: 'APPROVED', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        rating: true,
        title: true,
        body: true,
        createdAt: true,
        user: { select: { name: true } }
      }
    })
  ]);
  // Subtopics and reference links are keyed by product (Bundle) slug.
  const productSlug = purchaseBundles[0]?.slug ?? exam.slug;
  const productUrl = `${PUBLIC_SITE_URL}/practice-exams/${exam.vendor.slug}/${exam.slug}`;
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: exam.title,
    description: exam.description,
    sku: exam.code,
    category: 'Certification practice exam',
    url: productUrl,
    brand: { '@type': 'Brand', name: 'Tertiary Exams' },
    manufacturer: { '@type': 'Organization', name: 'Tertiary Infotech Academy Pte Ltd' }
  };
  const offers = purchaseBundles.flatMap((bundle) => {
    const checkoutUrl = `${PUBLIC_SITE_URL}/checkout/bundle/${bundle.id}`;
    const values: any[] = [{
      '@type': 'Offer',
      name: 'Practice Exam',
      url: `${checkoutUrl}?tier=PRACTICE`,
      priceCurrency: STORE_CURRENCY,
      price: (bundle.price / 100).toFixed(2),
      availability: 'https://schema.org/InStock'
    }];
    if (bundle.priceVoucher != null) {
      values.push({
        '@type': 'Offer',
        name: 'Exam Voucher (practice exam included)',
        url: `${checkoutUrl}?tier=VOUCHER`,
        priceCurrency: STORE_CURRENCY,
        price: (bundle.priceVoucher / 100).toFixed(2),
        availability: 'https://schema.org/InStock'
      });
    }
    return values;
  });
  if (offers.length > 0) jsonLd.offers = offers;
  if (ratingSummary.count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingSummary.average,
      reviewCount: ratingSummary.count
    };
  }
  if (structuredReviews.length > 0) {
    jsonLd.review = structuredReviews.map((review) => ({
      '@type': 'Review',
      name: review.title || `Review of ${exam.title}`,
      reviewBody: review.body || undefined,
      datePublished: review.createdAt.toISOString().slice(0, 10),
      author: { '@type': 'Person', name: review.user.name || 'Anonymous learner' },
      reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 }
    }));
  }

  // Entitlement check for showing "You have access — Start your attempt"
  // sidebar. userIsEntitled was already computed above for unpublished
  // exams; re-use it for published exams too.
  const entitled = userIsEntitled || (userId ? await hasPracticeAccess(db, userId, exam.id) : false);

  return (
    <div className="container-app py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
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
            <Stat icon={BookOpen} label="Questions per attempt" value={`${Math.min(exam.questionCount, exam._count.questions)}`} />
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

          <ExamDomains domains={exam.domains} productSlug={productSlug} />

          <div className="mt-6 card p-6">
            <h2 className="font-semibold">What you get</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-100">
              {[
                `A ${exam._count.questions}-question pool — every attempt draws ${Math.min(exam.questionCount, exam._count.questions)} fresh questions weighted by the official exam domains`,
                'Unlimited retakes',
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

          <ExamReferences productSlug={productSlug} fallbackExamUrl={exam.infoUrl} />

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
            <form action={`/practice-exams/${exam.vendor.slug}/${exam.slug}/teaser`} method="post" className="card-hover block p-5">
              <button type="submit" className="w-full text-left">
                <span className="mb-1 block text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">Free</span>
                <span className="block font-semibold">Try {teaserN} questions for free</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-100">No credit card required.</span>
                <span className="btn-outline mt-3 w-full">Start free practice exam</span>
              </button>
            </form>
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
