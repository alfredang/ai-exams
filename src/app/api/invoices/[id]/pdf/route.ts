import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { renderPdfForInvoice } from '@/lib/invoice/pdf-for-invoice';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
  });
  if (!invoice) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (user.role !== 'ADMIN' && invoice.userId !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const pdf = await renderPdfForInvoice(invoice);
  return new NextResponse(pdf as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.number}.pdf"`
    }
  });
}
