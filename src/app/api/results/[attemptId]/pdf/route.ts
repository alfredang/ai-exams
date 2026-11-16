import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { buildAttemptReport } from '@/lib/finalize-attempt';

export const runtime = 'nodejs';

// Download the practice-exam summary (score, domain breakdown, every question
// with answers, explanation and exam domain) as a PDF. Same access rule as
// /results/[attemptId]: the signed-in owner, or the guest holding its token —
// plus admins, who reach it from the user's Attempts tab in the dashboard.
export async function GET(_req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const gt = (await cookies()).get('gt')?.value;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, guestToken: true, submittedAt: true }
  });
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  const allowed = isAdmin || (attempt.userId ? attempt.userId === userId : !!gt && gt === attempt.guestToken);
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!attempt.submittedAt) return NextResponse.json({ error: 'Attempt not submitted yet' }, { status: 409 });

  const report = await buildAttemptReport(attempt.id);
  if (!report) return NextResponse.json({ error: 'Attempt not submitted yet' }, { status: 409 });
  const pdf = await report.renderPdf();
  const filename = report.filename;
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'private, no-store'
    }
  });
}
