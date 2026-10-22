import { db } from '@/lib/db';
import type { Prisma, PrismaClient } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

export type CounterKind = 'INVOICE' | 'ORDER' | 'CREDIT_NOTE';

/**
 * Atomically increment the global NumberCounter for `kind` and return the
 * formatted number. Format: `<prefix>-<6-digit zero-padded>`.
 *
 * Safe to call inside or outside a transaction — pass the tx client when
 * the surrounding work also needs to commit/rollback together.
 */
export async function nextNumber(kind: CounterKind, prefix: string, dbc?: DbClient): Promise<string> {
  const client: DbClient = dbc ?? db;
  const row = await client.numberCounter.upsert({
    where: { kind },
    create: { kind, last: 1 },
    update: { last: { increment: 1 } }
  });
  return `${prefix}-${String(row.last).padStart(6, '0')}`;
}

export function formatInvoiceNumber(seq: number, prefix = 'INV'): string {
  return `${prefix}-${String(seq).padStart(6, '0')}`;
}

export function formatOrderNumber(seq: number, prefix = 'ORD'): string {
  return `${prefix}-${String(seq).padStart(6, '0')}`;
}
