UPDATE "EmailLog"
SET "payloadVars" = NULL
WHERE "template" LIKE 'OTP_%' AND "payloadVars" IS NOT NULL;
