import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

(async () => {
  const exams = await db.exam.findMany({
    where: { published: true },
    include: {
      vendor: true,
      _count: { select: { questions: { where: { status: 'PUBLISHED' } } } }
    },
    orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }]
  });
  console.log('Vendor              | Code      | Current | Target');
  console.log('--------------------|-----------|---------|-------');
  let totalGap60 = 0;
  for (const e of exams) {
    const cur = e._count.questions;
    if (cur < 60) totalGap60 += 60 - cur;
    console.log(
      `${e.vendor.name.padEnd(20)}| ${(e.code ?? '-').padEnd(10)}| ${String(cur).padStart(7)} | ${String(e.questionCount).padStart(6)}`
    );
  }
  console.log(`\nTotal questions to bring everything to 60: ${totalGap60}`);
  await db.$disconnect();
})();
