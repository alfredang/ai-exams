-- Count failed guesses so a one-time code is burned after 5 wrong attempts.
ALTER TABLE "OtpCode" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
