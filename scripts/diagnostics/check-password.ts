import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const db = new PrismaClient();

async function main() {
  const user = await db.user.findUnique({ where: { email: 'developer.bob24@gmail.com' } });
  if (user && user.passwordHash) {
    const ok = await argon2.verify(user.passwordHash, '123');
    console.log('Password verified:', ok);
  } else {
    console.log('User not found or no password hash');
  }
}

main().catch(console.error).finally(() => db.$disconnect());
