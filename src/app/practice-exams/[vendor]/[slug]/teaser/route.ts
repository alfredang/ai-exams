import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { publicUrl } from '@/lib/url';

// Route handler (replaces the prior page.tsx). Next.js 16 disallows writing
// cookies in Server Components, so the guest-token cookie must be set here.
// Starting an attempt is deliberately POST-only: GET links are crawled by
// search engines and health checkers and must never create database records.

export async function GET(req: NextRequest, { params }: { params: Promise<{ vendor: string; slug: string }> }) {
  const { vendor, slug } = await params;
  return NextResponse.redirect(publicUrl(req, `/practice-exams/${vendor}/${slug}`));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ vendor: string; slug: string }> }) {
  const { vendor: vendorSlug, slug } = await params;

  const exam = await db.exam.findUnique({ where: { slug }, include: { vendor: true } });
  if (!exam || exam.vendor.slug !== vendorSlug) {
    return new NextResponse('Not found', { status: 404 });
  }
  // Reachability guard — added 2026-05-26 after a user finished a teaser
  // for an archived exam (microsoft-dp-100-p1) and landed on a 404 because
  // the post-conversion redirect target no longer exists. The teaser
  // route previously accepted ANY slug whose row existed in the DB,
  // including archived (deletedAt set) and orphan-unpublished exams.
  //
  // An exam is "publicly reachable" iff its detail page or a bundle that
  // contains it would render for an anonymous visitor. If neither holds,
  // we refuse to start a teaser — the user would just be sent to a 404
  // afterwards.
  if (exam.deletedAt) {
    return new NextResponse('Not found', { status: 404 });
  }
  if (!exam.published) {
    const bundleRef = await db.bundleItem.findFirst({
      where: { examId: exam.id, bundle: { published: true } },
      select: { id: true }
    });
    if (!bundleRef) {
      return new NextResponse('Not found', { status: 404 });
    }
  }

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  const c = await cookies();
  let gt = c.get('gt')?.value;
  if (!userId && !gt) {
    gt = `g_${crypto.randomUUID()}`;
    // `secure` over HTTPS in production — the gt token is bearer-equivalent
    // for the guest attempt and must not traverse plain HTTP. (Teaser-audit L1.)
    c.set('gt', gt, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' });
  }

  // The teaser pool: prefer curated (isTeaser:true) questions, but fall
  // back to any other published question if the curated pool is shy of
  // the target teaser size. That way the user always gets exactly
  // `teaserSize` questions when the exam has at least that many
  // published — regardless of how many of them are flagged isTeaser.
  // (Some certs were seeded with only ~4 questions marked isTeaser per
  // variant; without this fallback, those certs would render a 4-q
  // teaser instead of the 10-q teaser the marketing copy promises.)
  const allPublished = await db.question.findMany({
    where: { examId: exam.id, status: 'PUBLISHED' },
    select: { id: true, isTeaser: true }
  });
  if (allPublished.length === 0) {
    // No published content at all — bounce back to the exam detail page with a notice flag.
    return NextResponse.redirect(publicUrl(req, `/practice-exams/${vendorSlug}/${slug}?teaser=unavailable`), 303);
  }

  // Pinned teaser size (10). See getTeaserSize() doc.
  const { getTeaserSize } = await import('@/lib/settings');
  const teaserSize = await getTeaserSize();
  const shuffle = <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
  const flagged = shuffle(allPublished.filter((q) => q.isTeaser).map((q) => q.id));
  const unflagged = shuffle(allPublished.filter((q) => !q.isTeaser).map((q) => q.id));
  const ids = [...flagged, ...unflagged].slice(0, teaserSize);

  const attempt = await db.attempt.create({
    data: {
      userId: userId ?? null,
      guestToken: !userId ? gt : null,
      examId: exam.id,
      mode: 'PRACTICE',
      isTeaser: true,
      questionIds: ids,
      durationSec: 0,
      responses: {}
    }
  });
  return NextResponse.redirect(publicUrl(req, `/exam/${attempt.id}`), 303);
}
