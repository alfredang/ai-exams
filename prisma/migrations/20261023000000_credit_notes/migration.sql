-- Credit notes are separate Invoice rows that point at the invoice they
-- adjust (creditNoteOfId) instead of sharing its orderId, which is unique.
-- An invoice may now carry several credit notes (partial refunds).
ALTER TABLE "Invoice" ALTER COLUMN "orderId" DROP NOT NULL;
DROP INDEX IF EXISTS "Invoice_creditNoteOfId_key";
CREATE INDEX "Invoice_creditNoteOfId_idx" ON "Invoice"("creditNoteOfId");

-- Customer email sent with the credit note when an order is refunded.
ALTER TYPE "EmailTemplateKey" ADD VALUE 'REFUND_ISSUED';
