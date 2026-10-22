-- Admin-created users who later signed in with Google/GitHub were linked by
-- email but never marked verified (the signIn event only did that for brand
-- new users), so the admin list showed them as EMAIL UNVERIFIED. A linked
-- OAuth account proves the provider verified the address.
UPDATE "User" u
SET "emailVerified" = NOW()
WHERE u."emailVerified" IS NULL
  AND EXISTS (
    SELECT 1 FROM "Account" a
    WHERE a."userId" = u."id"
      AND a."provider" IN ('google', 'github', 'linkedin', 'microsoft-entra-id')
  );
