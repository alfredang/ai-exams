-- AI Question and Answer Generator: YouTube sources, stored source text,
-- and the per-question AI answer-key check.
ALTER TYPE "ExamSourceKind" ADD VALUE IF NOT EXISTS 'YOUTUBE';

ALTER TABLE "ExamSource" ADD COLUMN IF NOT EXISTS "content" TEXT;

ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "aiCheckedAt" TIMESTAMP(3);
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "aiCheck" JSONB;

ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "auditedAt" TIMESTAMP(3);
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "auditFlag" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "audit" JSONB;

CREATE INDEX IF NOT EXISTS "Question_auditFlag_idx" ON "Question"("auditFlag");
CREATE INDEX IF NOT EXISTS "Question_status_auditedAt_idx" ON "Question"("status", "auditedAt");
CREATE INDEX IF NOT EXISTS "Question_status_aiCheckedAt_idx" ON "Question"("status", "aiCheckedAt");
