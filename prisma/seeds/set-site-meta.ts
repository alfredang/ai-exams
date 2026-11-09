import { PrismaClient } from '@prisma/client';
import { HOME_SEO } from '../../src/lib/exam-seo';
const db = new PrismaClient();
const KV: Record<string, string> = HOME_SEO;
(async () => {
  for (const [key, value] of Object.entries(KV)) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
    console.log('set', key);
  }
  await db.$disconnect();
})();
