-- The NextAuth PrismaAdapter writes `image` on user.create for OAuth sign-ins;
-- without this column every first-time social login fails with AdapterError.
ALTER TABLE "User" ADD COLUMN "image" TEXT;
