-- Preserve every historical layout. New application attempts opt in to v1.
ALTER TABLE "Attempt" ADD COLUMN "optionShuffleVersion" INTEGER NOT NULL DEFAULT 0;
