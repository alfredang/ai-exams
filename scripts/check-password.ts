import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const db = new PrismaClient();

async function main() {
  const email = process.env.CHECK_PASSWORD_EMAIL?.trim();
  const password = process.env.CHECK_PASSWORD_VALUE;
  if (!email || !password) {
    throw new Error('CHECK_PASSWORD_EMAIL and CHECK_PASSWORD_VALUE are required');
  }
  const user = await db.user.findUnique({ where: { email } });
  if (user && user.passwordHash) {
    const ok = await argon2.verify(user.passwordHash, password);
    console.log('Password verified:', ok);
  } else {
    console.log('User not found or no password hash');
  }
}

main().catch(console.error).finally(() => db.$disconnect());
