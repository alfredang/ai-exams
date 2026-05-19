import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const user = await db.user.findUnique({ where: { email: 'developer.bob24@gmail.com' } });
  console.log('User details:', user);
}

main().catch(console.error).finally(() => db.$disconnect());
