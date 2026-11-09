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
import { digitalOfferPolicies, productImageUrl, ratingJsonLd } from '@/lib/product-jsonld';
import { displayExamCode, isExtraVariantSlug } from '@/lib/products';
import { buildExamSeo, certNames, headingWithCode } from '@/lib/exam-seo';
import { examBaseTitle } from '@/lib/exam-title';
import { pageMeta } from '@/lib/seo-meta';
import { parseDomains } from '@/lib/question-pool';
import { Breadcrumbs, FaqList, ProductMeta } from '@/components/product/product-parts';
import { PracticeSeoCopy, RelatedCerts } from '@/components/product/seo-copy';
import { faqJsonLd, practiceFaqs } from '@/lib/product-faqs';
import { breadcrumbJsonLd } from '@/lib/vendor-landing';

export async function generateMetadata({ params }: { params: Promise<{ vendor: string; slug: string }> }) {
  const { slug, vendor } = await params;
  const select = { title: true, code: true, description: true, domains: true, published: true, poolExamId: true, metaTitle: true, metaDescription: true, metaKeywords: true, ogImage: true, vendor: { select: { name: true } } } as const;
  // The Practice Exam product wins its slug; its SEO meta lives on the
  // product's practice (pool) exam. Mirror the page's routing here.
  const product = await db.bundle.findUnique({
    where: { slug },
    select: { published: true, title: true, description: true, items: { where: { tier: 'PRACTICE' }, take: 1, select: { exam: { select } } } }
  });
  const pool = product?.published ? product.items[0]?.exam : null;
  const exam = pool ? { ...pool, title: product!.title, description: product!.description } : await db.exam.findUnique({ where: { slug }, select });
  if (!exam) return {};
  // An exam no product sells (AZ-900 today) has no stored SEO from the pool
  // fold, so build it here rather than falling back to "Vendor CODE — Title".
  const fallback = buildExamSeo({
    title: examBaseTitle(exam.title),
    code: displayExamCode(exam.code),
    vendor: exam.vendor.name,
    domainCount: parseDomains(exam.domains).length,
    hasVoucher: false
  });
  return pageMeta({
    title: exam.metaTitle || fallback.metaTitle,
    description: exam.metaDescription || fallback.metaDescription,
    keywords: exam.metaKeywords || fallback.metaKeywords,
    path: `/practice-exams/${vendor}/${slug}`,
    // /og/product/<slug> only renders for a Practice Exam on sale; an exam page
    // with nothing for sale would point Google at a 404, so it gets the site card.
    ...(pool || exam.ogImage ? { image: productImageUrl(slug, 'practice', exam.ogImage) } : {}),
    // "Practice Exam 2…N" leftovers repeat their first variant: thin duplicates.
    noindex: !pool && isExtraVariantSlug(slug)
  });
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
  const displayCode = displayExamCode(exam.code);
  const baseTitle = examBaseTitle(exam.title);
  const cert = { title: baseTitle, code: displayCode, vendor: exam.vendor.name };
  const { key } = certNames(cert);
  const heading = `${headingWithCode(baseTitle, cert)} Practice Exam`;
  const perAttempt = Math.min(exam.questionCount, exam._count.questions);
  const faqs = practiceFaqs({
    cert,
    poolSize: exam._count.questions,
    perAttempt,
    durationMinutes: exam.durationMinutes,
    passingScore: exam.passingScore,
    priceCents: purchaseBundles[0]?.price ?? null,
    voucherPriceCents: null
  });
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: heading,
    description: exam.description,
    sku: displayCode,
    category: 'Certification practice exam',
    url: productUrl,
    image: [productImageUrl(productSlug, 'practice', exam.ogImage)],
    brand: { '@type': 'Brand', name: 'Tertiary Exams' },
    manufacturer: { '@type': 'Organization', name: 'Tertiary Infotech Academy Pte Ltd' }
  };
  const offers = purchaseBundles.flatMap((bundle) => {
    const values: any[] = [{
      '@type': 'Offer',
      name: 'Practice Exam',
      url: productUrl,
      priceCurrency: STORE_CURRENCY,
      price: (bundle.price / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      ...digitalOfferPolicies('practice')
    }];
    if (bundle.priceVoucher != null) {
      values.push({
        '@type': 'Offer',
        name: 'Exam Voucher (practice exam included)',
        url: productUrl,
        priceCurrency: STORE_CURRENCY,
        price: (bundle.priceVoucher / 100).toFixed(2),
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        ...digitalOfferPolicies('voucher')
      });
    }
    return values;
  });
  if (offers.length > 0) jsonLd.offers = offers;
  Object.assign(jsonLd, ratingJsonLd(ratingSummary, structuredReviews, exam.title));
  // Google rejects a Product with no offers, review or aggregateRating — an
  // exam no product sells yet (and with no reviews) gets no Product markup.
  const emitProductJsonLd = !!(jsonLd.offers || jsonLd.aggregateRating || jsonLd.review);

  // Entitlement check for showing "You have access — Start your attempt"
  // sidebar. userIsEntitled was already computed above for unpublished
  // exams; re-use it for published exams too.
  const entitled = userIsEntitled || (userId ? await hasPracticeAccess(db, userId, exam.id) : false);

  return (
    <div className="container-app py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([
        { name: 'Practice Exams', path: '/practice-exams' },
        { name: exam.vendor.name, path: `/practice-exams/${exam.vendor.slug}` },
        { name: `${key} Practice Exam`, path: `/practice-exams/${exam.vendor.slug}/${exam.slug}` }
      ])) }} />
      {emitProductJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />}
      {teaserUnavailable && (
        <div className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          The free teaser isn't available for this exam yet — it needs at least one teaser question.
        </div>
      )}
      <Breadcrumbs items={[
        { href: '/practice-exams', label: 'Practice Exams' },
        { href: `/practice-exams/${exam.vendor.slug}`, label: exam.vendor.name },
        { label: displayCode }
      ]} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ProductMeta lead="Practice Exam" items={[exam.vendor.name, displayCode, exam.level]} />
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight">{heading}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-100">{exam.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={BookOpen} label="Questions per attempt" value={`${perAttempt}`} />
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
                `A ${exam._count.questions}-question pool — every attempt draws ${perAttempt} fresh questions weighted by the official exam domains`,
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

          <div className="mt-6">
            <PracticeSeoCopy cert={cert} poolSize={exam._count.questions} perAttempt={perAttempt} onSale={purchaseBundles.length > 0} />
          </div>

          <section className="mt-6">
            <h2 className="font-display text-xl font-bold">{key} practice exam questions answered</h2>
            <div className="mt-3"><FaqList items={faqs} /></div>
          </section>

          <ShareExam vendorSlug={exam.vendor.slug} examSlug={exam.slug} title={heading} />

          <ExamReviews examId={exam.id} examTitle={baseTitle} />

          <div className="mt-6"><RelatedCerts kind="practice" vendor={exam.vendor} /></div>

          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            This platform provides original practice questions for learning. We are not affiliated with {exam.vendor.name}, and we do not provide real exam dumps.
          </p>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-300">2026 Practice Exam Details</h3>
            <dl className="mt-3 space-y-1 text-sm">
              <Row k="Exam code" v={displayCode} />
              <Row k="Level" v={exam.level} />
              <Row k="Duration" v={`${exam.durationMinutes} min`} />
              <Row k="Pass score" v={`${exam.passingScore}%`} />
              <Row k="Question count" v={`${perAttempt}`} />
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
