import { NextResponse } from 'next/server';
import { getGroupedExams } from '@/lib/my-exams';
import { requireMobileUser } from '@/lib/mobile-auth';

export async function GET(req: Request) {
  const auth = await requireMobileUser(req);
  if ('response' in auth) return auth.response;

  const grouped = await getGroupedExams(auth.user.id);
  return NextResponse.json({
    bundles: grouped.bundles.map((bundle) => ({
      ...bundle,
      grantedAt: bundle.grantedAt.toISOString(),
      items: bundle.items.map((item) => ({ ...item, grantedAt: item.grantedAt.toISOString() }))
    })),
    standalone: grouped.standalone.map((item) => ({ ...item, grantedAt: item.grantedAt.toISOString() }))
  });
}
