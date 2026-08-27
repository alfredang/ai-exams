import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSetting } from '@/lib/settings';
import { sendMail } from '@/lib/mail';
import { paidOrdersIn, taxCollectedIn, Ranges } from '@/lib/analytics';
import { formatPrice } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sends due ReportSubscription emails. Schedule format we support:
 *   - 'daily'            → fires once per day
 *   - 'weekly-monday'    → fires once per week (Monday)
 *   - 'monthly-first'    → fires once per month (1st)
 * Combined with `lastSentAt` so we don't double-fire if the cron runs hourly.
 */
async function authorize(req: Request): Promise<boolean> {
  const headerSecret = req.headers.get('x-worker-secret');
  const expected = await getSetting('WORKER_SHARED_SECRET');
  if (expected && headerSecret && headerSecret === expected) return true;
  const session = await auth();
  return (session?.user as any)?.role === 'ADMIN';
}

function isDue(schedule: string, lastSentAt: Date | null): boolean {
  const now = new Date();
  if (!lastSentAt) return true;
  const hoursSince = (now.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60);
  if (schedule === 'daily') return hoursSince >= 23;
  if (schedule === 'weekly-monday') return hoursSince >= 24 * 6 && now.getDay() === 1;
  if (schedule === 'monthly-first') return hoursSince >= 24 * 27 && now.getDate() === 1;
  return false;
}

export async function POST(req: Request) {
  if (!(await authorize(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const subs = await db.reportSubscription.findMany({
    where: { enabled: true },
    include: { admin: { select: { email: true, name: true } } }
  });
  let sent = 0;
  for (const sub of subs) {
    if (!isDue(sub.schedule, sub.lastSentAt)) continue;
    try {
      const html = await buildReportEmail(sub.reportKey);
      await sendMail(sub.admin.email, `Tertiary Exams report — ${sub.reportKey}`, html, undefined, undefined, {
        template: `report.${sub.reportKey}`
      });
      await db.reportSubscription.update({ where: { id: sub.id }, data: { lastSentAt: new Date() } });
      sent++;
    } catch (err: any) {
      // Continue; per-sub failure shouldn't stop the batch.
    }
  }
  return NextResponse.json({ ok: true, total: subs.length, sent });
}

export async function GET(req: Request) {
  return POST(req);
}

async function buildReportEmail(key: string): Promise<string> {
  if (key === 'revenue') {
    const r = await paidOrdersIn(Ranges.lastNDays(7));
    return `<h2>Weekly revenue digest</h2>
<p>Last 7 days: <b>${formatPrice(r.grossCents, 'USD')}</b> across ${r.ordersCount} orders.</p>
<p>AOV: ${formatPrice(r.aovCents, 'USD')} · Refunds: ${formatPrice(r.refundedCents, 'USD')} · Net: ${formatPrice(r.netCents, 'USD')}</p>`;
  }
  if (key === 'tax') {
    const r = await taxCollectedIn(Ranges.mtd());
    return `<h2>Tax (MTD) digest</h2>
<p>SGD-equivalent tax collected: <b>${formatPrice(r.taxSgdTotal, 'SGD')}</b> across ${r.invoiceCount} invoices.</p>`;
  }
  return `<p>Report ${key} has no template yet.</p>`;
}
