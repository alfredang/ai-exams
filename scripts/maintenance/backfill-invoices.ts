/**
 * One-off backfill: create an Invoice for every PAID Order that doesn't
 * already have one. Safe to re-run.
 *
 *   npx tsx scripts/maintenance/backfill-invoices.ts
 */
import { db } from '@/lib/db';
import { issueInvoiceForOrder } from '@/lib/invoice/issue';

async function main() {
  const orders = await db.order.findMany({
    where: { status: 'PAID', invoice: null },
    select: { id: true, createdAt: true }
  });
  console.log(`Found ${orders.length} PAID orders without invoices.`);
  let ok = 0;
  let fail = 0;
  // Stable order so the sequence numbers map to oldest-first.
  orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  for (const o of orders) {
    try {
      const inv = await issueInvoiceForOrder(o.id);
      console.log(`OK  ${o.id} → ${inv.number}`);
      ok++;
    } catch (err: any) {
      console.log(`FAIL  ${o.id}  ${err?.message ?? err}`);
      fail++;
    }
  }
  console.log(`Done. ok=${ok} fail=${fail}`);
  await db.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
