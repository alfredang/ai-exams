/**
 * One-off: create/upsert Jared Tan as an ADMIN user.
 * Run: npx tsx prisma/seeds/create-jared.ts
 */
import argon2 from 'argon2';
import { PrismaClient, Role } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const email = 'jaredtan.handy@gmail.com';
  const name = 'Jared Tan';
  const existing = await db.user.findUnique({ where: { email } });
  const user = existing
    ? await db.user.update({
        where: { id: existing.id },
        data: { name, role: Role.ADMIN, emailVerified: new Date() }
      })
    : await (async () => {
        const password = process.env.JARED_PASSWORD?.trim();
        if (!password) throw new Error('JARED_PASSWORD is required to create Jared');
        return db.user.create({
          data: {
            email,
            name,
            passwordHash: await argon2.hash(password),
            role: Role.ADMIN,
            emailVerified: new Date()
          }
        });
      })();
  console.log(`Upserted ${user.email} (id=${user.id}, role=${user.role})`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
