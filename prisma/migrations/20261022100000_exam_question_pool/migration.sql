-- One practice exam per certification, drawn from a domain-weighted pool.
ALTER TABLE "Exam" ADD COLUMN "domainsSourceUrl" TEXT;
ALTER TABLE "Exam" ADD COLUMN "domainsVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Exam" ADD COLUMN "poolExamId" TEXT;
CREATE INDEX "Exam_poolExamId_idx" ON "Exam"("poolExamId");
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_poolExamId_fkey" FOREIGN KEY ("poolExamId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
