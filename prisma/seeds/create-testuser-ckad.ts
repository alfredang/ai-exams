/**
 * One-off: create a test user and grant access to all CKAD practice exams.
 * Run: npx tsx prisma/seeds/create-testuser-ckad.ts
 *
 * Safe to run multiple times — uses upsert for both user and entitlements.
 */
import argon2 from 'argon2';
import { PrismaClient, Role, Tier } from '@prisma/client';

const db = new PrismaClient();

const CKAD_EXAM_SLUGS = [
  'linuxfoundation-ckad-p1',
  'linuxfoundation-ckad-p2',
  'linuxfoundation-ckad-p3',
  'linuxfoundation-ckad-p4',
];

const TEST_EMAIL    = process.env.TEST_EMAIL    || 'testuser@tertiaryinfotech.com';
const TEST_NAME     = process.env.TEST_NAME     || 'Test User';

async function main() {
  // 1. Create the test user if needed; never reset an existing password.
  const existing = await db.user.findUnique({ where: { email: TEST_EMAIL } });
  const user = existing
    ? await db.user.update({
        where: { id: existing.id },
        data: { name: TEST_NAME, emailVerified: new Date() }
      })
    : await (async () => {
        const password = process.env.TEST_PASSWORD;
        if (!password) throw new Error('TEST_PASSWORD is required to create the test user');
        return db.user.create({
          data: {
            email: TEST_EMAIL,
            name: TEST_NAME,
            passwordHash: await argon2.hash(password),
            role: Role.USER,
            emailVerified: new Date()
          }
        });
      })();
  console.log(`✓ User: ${user.email} (id=${user.id})`);

  // 2. Resolve exam IDs from slugs
  const exams = await db.exam.findMany({
    where: { slug: { in: CKAD_EXAM_SLUGS } },
    select: { id: true, slug: true, title: true },
  });

  if (exams.length === 0) {
    console.error('✗ No CKAD exams found — run the CKAD seed first:');
    console.error('  POST /api/admin/seed-ckad  OR  npx tsx prisma/seeds/ckad.ts');
    process.exit(1);
  }

  // 3. Grant ADMIN_GRANT entitlement for each exam
  for (const exam of exams) {
    await db.entitlement.upsert({
      where:  { userId_examId_tier: { userId: user.id, examId: exam.id, tier: Tier.ADMIN_GRANT } },
      update: { grantedAt: new Date() },
      create: { userId: user.id, examId: exam.id, tier: Tier.ADMIN_GRANT },
    });
    console.log(`  ✓ Granted ADMIN_GRANT → ${exam.slug}`);
  }

  const missing = CKAD_EXAM_SLUGS.filter(s => !exams.find(e => e.slug === s));
  if (missing.length > 0) {
    console.warn(`  ⚠ Exams not found in DB (seed them first): ${missing.join(', ')}`);
  }

  console.log(`\nDone. Login at /login with ${TEST_EMAIL}.`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
