-- Queue of question-generation requests run by the local AI agents (AI Q&A Generator without an OpenAI API key).
CREATE TABLE "GenerationRequest" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "sourceId" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'generate',
    "rephrase" BOOLEAN NOT NULL DEFAULT true,
    "count" INTEGER NOT NULL,
    "types" JSONB NOT NULL,
    "domains" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "phase" TEXT,
    "created" INTEGER NOT NULL DEFAULT 0,
    "dropped" INTEGER NOT NULL DEFAULT 0,
    "notes" JSONB,
    "error" TEXT,
    "worker" TEXT,
    "claimedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GenerationRequest_status_createdAt_idx" ON "GenerationRequest"("status", "createdAt");
CREATE INDEX "GenerationRequest_examId_idx" ON "GenerationRequest"("examId");

ALTER TABLE "GenerationRequest" ADD CONSTRAINT "GenerationRequest_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GenerationRequest" ADD CONSTRAINT "GenerationRequest_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExamSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
