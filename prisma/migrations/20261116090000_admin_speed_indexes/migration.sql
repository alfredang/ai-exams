-- Indexes for the columns the admin dashboard filters and sorts on.
-- Additive only: safe while the previous container is still serving.
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_role_createdAt_idx" ON "User"("role", "createdAt");
CREATE INDEX IF NOT EXISTS "Question_status_idx" ON "Question"("status");
CREATE INDEX IF NOT EXISTS "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");
CREATE INDEX IF NOT EXISTS "Entitlement_examId_idx" ON "Entitlement"("examId");
CREATE INDEX IF NOT EXISTS "Entitlement_tier_grantedAt_idx" ON "Entitlement"("tier", "grantedAt");
CREATE INDEX IF NOT EXISTS "Attempt_examId_submittedAt_idx" ON "Attempt"("examId", "submittedAt");
CREATE INDEX IF NOT EXISTS "Attempt_startedAt_idx" ON "Attempt"("startedAt");
CREATE INDEX IF NOT EXISTS "Order_status_capturedAt_idx" ON "Order"("status", "capturedAt");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "Order_examId_idx" ON "Order"("examId");
CREATE INDEX IF NOT EXISTS "Order_bundleId_idx" ON "Order"("bundleId");
CREATE INDEX IF NOT EXISTS "PaymentWebhookEvent_receivedAt_idx" ON "PaymentWebhookEvent"("receivedAt");
CREATE INDEX IF NOT EXISTS "PaymentWebhookEvent_orderId_idx" ON "PaymentWebhookEvent"("orderId");
CREATE INDEX IF NOT EXISTS "AdminLog_createdAt_idx" ON "AdminLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AdminLog_targetType_targetId_idx" ON "AdminLog"("targetType", "targetId");
