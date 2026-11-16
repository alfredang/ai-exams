import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { SCOPE_VOUCHERS_WRITE, apiError, requireApiToken } from '@/lib/api-v1';
import { notify } from '@/lib/admin-notifications';
import {
  MAX_LIST_CENTS, MIN_LIST_CENTS, PRICE_CHECK_ACTION, decidePrice, findVoucherRow, listVoucherRows, sourceUrlProblem
} from '@/lib/voucher-pricing';

export const dynamic = 'force-dynamic';

const Check = z.object({
  ref: z.string().min(1).max(200),
  /** found = listPriceCents read from the vendor's page; unavailable = no official USD price could be confirmed. */
  status: z.enum(['found', 'unavailable']).default('found'),
  listPriceCents: z.number().int().min(MIN_LIST_CENTS).max(MAX_LIST_CENTS).optional(),
  currency: z.literal('USD').default('USD'),
  sourceUrl: z.string().max(1000).optional(),
  note: z.string().max(1000).default('')
});
const Body = z.object({
  agent: z.string().regex(/^[a-z0-9-]{3,40}$/).default('exam-voucher-pricer'),
  model: z.string().regex(/^[a-z0-9.-]{3,60}$/).default('claude-opus-5-5'),
  dryRun: z.boolean().default(false),
  checks: z.array(Check).min(1).max(100)
});

const usd = (c: number) => `US$${(c / 100).toFixed(2)}`;

/**
 * POST /api/v1/exam-vouchers/price-checks — record official vendor list
 * prices. The server sets the selling price (list +10% for GST, rounded
 * down) when the change is safe; otherwise it holds it for an admin (see
 * decidePrice). Never changes on-sale status, titles or the Practice Exam.
 */
export async function POST(req: Request) {
  const auth = await requireApiToken(req, SCOPE_VOUCHERS_WRITE);
  if ('response' in auth) return auth.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError(`Bad request: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`, 400);
  const { agent, model, dryRun, checks } = parsed.data;
  const by = `agent:${agent}:${model}`;

  const rows = await listVoucherRows(db);
  const results: Record<string, unknown>[] = [];
  const updated: string[] = [];
  const held: string[] = [];
  const seen = new Set<string>();

  for (const c of checks) {
    const found = findVoucherRow(rows, c.ref);
    if (!found) { results.push({ ref: c.ref, status: 'rejected', reason: 'no Exam Voucher with a price matches this ref' }); continue; }
    if (Array.isArray(found)) { results.push({ ref: c.ref, status: 'rejected', reason: 'ambiguous code; pass the product slug', candidates: found.map((r) => r.slug) }); continue; }
    const row = found;
    if (seen.has(row.bundleId)) { results.push({ ref: c.ref, status: 'rejected', reason: 'duplicate in this batch' }); continue; }
    seen.add(row.bundleId);

    if (c.status === 'unavailable') {
      if (!dryRun) {
        await db.adminLog.create({
          data: { adminId: auth.adminId, action: PRICE_CHECK_ACTION, targetType: 'Bundle', targetId: row.bundleId,
            metadata: { via: 'api', by, status: 'unavailable', note: c.note || undefined, sourceUrl: c.sourceUrl, priceCents: row.priceCents } }
        });
      }
      results.push({ ref: c.ref, slug: row.slug, status: 'unavailable', priceCents: row.priceCents });
      continue;
    }
    if (c.listPriceCents == null) { results.push({ ref: c.ref, slug: row.slug, status: 'rejected', reason: 'listPriceCents is required when status is found' }); continue; }
    const urlProblem = c.sourceUrl ? sourceUrlProblem(c.sourceUrl) : 'sourceUrl (the official vendor page) is required';
    if (urlProblem) { results.push({ ref: c.ref, slug: row.slug, status: 'rejected', reason: urlProblem }); continue; }

    const d = decidePrice(row, c.listPriceCents);
    const result = {
      ref: c.ref, slug: row.slug, code: row.code, status: d.status, listPriceCents: c.listPriceCents,
      priceBeforeCents: row.priceCents, expectedCents: d.expectedCents,
      priceAfterCents: d.status === 'updated' ? d.expectedCents : row.priceCents,
      ...(d.status === 'held' ? { reason: d.reason } : {})
    };
    results.push(result);
    if (d.status === 'updated') updated.push(`${row.code || row.slug}: ${usd(row.priceCents)} → ${usd(d.expectedCents)}`);
    if (d.status === 'held') held.push(`${row.code || row.slug}: list ${usd(c.listPriceCents)} → ${usd(d.expectedCents)} (now ${usd(row.priceCents)}) — ${d.reason}`);
    if (dryRun) continue;

    await db.$transaction(async (tx) => {
      if (d.status === 'updated') {
        await tx.bundle.update({ where: { id: row.bundleId }, data: { priceVoucher: d.expectedCents } });
        // `voucher.update` also tells the deploy seed this price is managed (it keeps its hands off).
        await tx.adminLog.create({
          data: { adminId: auth.adminId, action: 'voucher.update', targetType: 'Bundle', targetId: row.bundleId,
            metadata: { via: 'api', by, priceVoucher: d.expectedCents, from: row.priceCents, listPriceCents: c.listPriceCents, sourceUrl: c.sourceUrl } }
        });
      }
      await tx.adminLog.create({
        data: { adminId: auth.adminId, action: PRICE_CHECK_ACTION, targetType: 'Bundle', targetId: row.bundleId,
          metadata: { via: 'api', by, status: d.status, listPriceCents: c.listPriceCents, currency: 'USD', sourceUrl: c.sourceUrl,
            note: c.note || undefined, priceBeforeCents: row.priceCents, expectedCents: d.expectedCents,
            ...(d.status === 'held' ? { reason: d.reason } : {}) } }
      });
    });
  }

  if (!dryRun && (updated.length || held.length)) {
    await notify({
      kind: 'voucher.price',
      title: `Exam Voucher prices: ${updated.length} updated, ${held.length} held for review`,
      body: [...updated.map((u) => `Updated ${u}`), ...held.map((h) => `Held ${h}`)].join('\n'),
      link: '/admin-dashboard/bundles/vouchers'
    });
    if (updated.length) {
      revalidatePath('/');
      revalidatePath('/exam-vouchers', 'layout');
      revalidatePath('/practice-exams', 'layout');
    }
  }
  return NextResponse.json({ dryRun, updated: updated.length, held: held.length, results });
}
