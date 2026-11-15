-- Abandoned checkouts can be cancelled (see src/lib/order-cleanup.ts).
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
