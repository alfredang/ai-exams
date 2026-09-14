import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { renderVoucherPdf } from '@/lib/voucher-pdf';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const ent = await db.entitlement.findUnique({
    where: { id },
    include: { exam: { include: { vendor: true } }, user: true }
  });
  if (!ent || (!isAdmin && ent.userId !== userId) || !ent.voucher) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pdf = await renderVoucherPdf({
    examTitle: ent.exam.title,
    examCode: ent.exam.code,
    vendor: ent.exam.vendor.name,
    voucherCode: ent.voucher,
    buyerName: ent.user.name,
    buyerEmail: ent.user.email,
    expiresAt: ent.expiresAt
  });
  return new NextResponse(pdf as any, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="voucher-${ent.voucher}.pdf"`
    }
  });
}
