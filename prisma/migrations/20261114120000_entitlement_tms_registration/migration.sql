-- Learners registered from the LMS/TMS for a class: course run ID, register date and remark on the grant.
ALTER TABLE "Entitlement" ADD COLUMN "courseRunId" TEXT;
ALTER TABLE "Entitlement" ADD COLUMN "registeredAt" TIMESTAMP(3);
ALTER TABLE "Entitlement" ADD COLUMN "remark" TEXT;
CREATE INDEX "Entitlement_courseRunId_idx" ON "Entitlement"("courseRunId");
