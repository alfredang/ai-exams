import type { Prisma, PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';
import { getSetting } from '@/lib/settings';
import { sendVoucherDeliveredEmail } from '@/lib/mail';
import { renderVoucherPdf } from '@/lib/voucher-pdf';

type TxOrClient = PrismaClient | Prisma.TransactionClient;

const DEFAULT_DELAY_DAYS = 5;
const MAX_ATTEMPTS = 5;

export async function getDelayDays(): Promise<number> {
  const raw = (await getSetting('VOUCHER_DELAY_DAYS')).trim();
  if (!raw) return DEFAULT_DELAY_DAYS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_DELAY_DAYS;
}

export async function scheduleVoucherDelivery(
  entitlementId: string,
  orderId: string | null,
  client: TxOrClient = db,
  opts: { delayDays?: number } = {}
) {
  const delayDays = opts.delayDays ?? (await getDelayDays());
  const scheduledFor = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
  // Idempotent on the unique entitlementId — re-running fulfillOrder won't
  // duplicate a delivery row.
  return client.voucherDelivery.upsert({
    where: { entitlementId },
    create: { entitlementId, orderId, scheduledFor, status: 'SCHEDULED' },
    update: {}
  });
}

export type DeliveryResult = {
  picked: number;
  sent: number;
  failed: number;
  skippedNoCode: number;
  errors: Array<{ id: string; error: string }>;
};

// Sweep due deliveries. Caller is the worker route; safe to invoke repeatedly.
export async function runDueDeliveries(limit = 50): Promise<DeliveryResult> {
  const now = new Date();
  // Race-safe claim: only flip rows that are still SCHEDULED and due.
  // We pick rows one transaction at a time to keep the lock window short.
  const due = await db.voucherDelivery.findMany({
    where: { status: 'SCHEDULED', scheduledFor: { lte: now } },
    orderBy: { scheduledFor: 'asc' },
    take: limit,
    select: { id: true }
  });

  const result: DeliveryResult = { picked: 0, sent: 0, failed: 0, skippedNoCode: 0, errors: [] };

  for (const { id } of due) {
    const claimed = await db.voucherDelivery.updateMany({
      where: { id, status: 'SCHEDULED' },
      data: { status: 'PROCESSING' }
    });
    if (claimed.count === 0) continue; // someone else got it
    result.picked++;

    try {
      const delivery = await db.voucherDelivery.findUnique({
        where: { id },
        include: {
          entitlement: {
            include: { user: true, exam: { include: { vendor: true } } }
          }
        }
      });
      if (!delivery) {
        result.errors.push({ id, error: 'delivery row vanished' });
        continue;
      }
      if (delivery.orderId) {
        const order = await db.order.findUnique({ where: { id: delivery.orderId }, select: { status: true } });
        if (order && order.status !== 'PAID') {
          // Refunded/failed orders must never receive a voucher.
          await db.voucherDelivery.update({
            where: { id },
            data: { status: 'CANCELED', lastError: `order ${order.status.toLowerCase()}` }
          });
          continue;
        }
      }
      const ent = delivery.entitlement;
      const voucherCode = delivery.voucherCode || ent.voucher;
      if (!voucherCode) {
        // No code procured yet — leave as PROCESSING-then-back-to-SCHEDULED so the
        // admin sees it and ops can paste a code. We push the next attempt by 1
        // day so we don't spam the inbox while procurement is in progress.
        const nextAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.voucherDelivery.update({
          where: { id },
          data: {
            status: 'SCHEDULED',
            scheduledFor: nextAt,
            lastError: 'awaiting voucher code',
            attempts: { increment: 1 }
          }
        });
        result.skippedNoCode++;
        continue;
      }

      let pdf: Buffer | undefined;
      try {
        pdf = await renderVoucherPdf({
          examTitle: ent.exam.title,
          examCode: ent.exam.code,
          vendor: ent.exam.vendor.name,
          voucherCode,
          buyerName: ent.user.name,
          buyerEmail: ent.user.email
        });
      } catch {
        // Non-fatal: send the email without the PDF.
      }

      await sendVoucherDeliveredEmail(
        ent.user.email,
        ent.exam.title,
        voucherCode,
        pdf,
        ent.expiresAt ?? null
      );

      await db.$transaction([
        db.voucherDelivery.update({
          where: { id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            voucherCode,
            lastError: null
          }
        }),
        // Mirror the issued code onto the entitlement if it wasn't already there.
        db.entitlement.updateMany({
          where: { id: ent.id, voucher: null },
          data: { voucher: voucherCode }
        })
      ]);
      result.sent++;
    } catch (e: any) {
      const message = String(e?.message ?? e);
      const cur = await db.voucherDelivery.findUnique({ where: { id }, select: { attempts: true } });
      const attempts = (cur?.attempts ?? 0) + 1;
      const giveUp = attempts >= MAX_ATTEMPTS;
      // Exponential backoff: 2^attempts hours, capped at 24h.
      const backoffHours = Math.min(24, 2 ** attempts);
      const nextAt = new Date(Date.now() + backoffHours * 60 * 60 * 1000);
      await db.voucherDelivery.update({
        where: { id },
        data: {
          status: giveUp ? 'FAILED' : 'SCHEDULED',
          attempts,
          lastError: message,
          scheduledFor: nextAt
        }
      });
      result.failed++;
      result.errors.push({ id, error: message });
    }
  }

  return result;
}
