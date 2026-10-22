import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { renderPdfForInvoice } from '@/lib/invoice/pdf-for-invoice';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
  });
  if (!invoice) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const pdf = await renderPdfForInvoice(invoice);
  return new NextResponse(pdf as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.number}.pdf"`
    }
  });
}
