import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { evaluateCoupon } from '@/lib/coupons';
import { productSale } from '@/lib/products';

export const dynamic = 'force-dynamic';

const Body = z.object({
  code: z.string().min(1).max(64),
  bundleId: z.string().min(1),
  tier: z.enum(['PRACTICE', 'VOUCHER']).optional()
});

/**
 * Public endpoint used by the checkout client. Returns the discount that
 * WOULD be applied right now — server-side computed so the price the user
 * sees in checkout matches what gets persisted on order-create.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const body = Body.parse(await req.json().catch(() => ({})));

  const bundle = await db.bundle.findUnique({
    where: { id: body.bundleId },
    include: { items: { include: { exam: { select: { vendorId: true } } } } }
  });
  if (!bundle) return NextResponse.json({ ok: false, reason: 'invalid_product', message: 'Bundle not found.' }, { status: 400 });

  const sale = productSale(bundle, body.tier);
  if (!sale) return NextResponse.json({ ok: false, reason: 'invalid_product', message: 'This product is not on sale.' }, { status: 400 });
  const subtotal = sale.amount;
  const vendorIds = new Set(bundle.items.map((i) => i.exam.vendorId));
  const vendorId = vendorIds.size === 1 ? [...vendorIds][0] : null;

  const result = await evaluateCoupon({
    code: body.code,
    userId: userId ?? null,
    bundleId: body.bundleId,
    vendorId,
    subtotalCents: subtotal
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 200 });
  }
  return NextResponse.json({
    ok: true,
    code: result.code,
    discountCents: result.discountCents,
    subtotalCents: subtotal,
    totalCents: Math.max(0, subtotal - result.discountCents)
  });
}
