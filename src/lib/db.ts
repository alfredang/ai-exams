import { PrismaClient } from '@prisma/client';

// One client (one connection pool) per process, in production too: separately
// bundled copies of this module would otherwise each open their own pool.
const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
g.prisma = db;
