-- AI Q&A Generator: publish straight into the pool (default) or hold the questions for an admin to review and publish.
ALTER TABLE "GenerationRequest" ADD COLUMN "autoPublish" BOOLEAN NOT NULL DEFAULT true;
