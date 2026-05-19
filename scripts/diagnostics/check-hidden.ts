import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

(async () => {
  const hidden = await db.exam.findMany({ where: { published: false } });
  const ids = hidden.map(e => e.id);

  const [questions, entitlements, attempts, orders] = await Promise.all([
    db.question.count({ where: { examId: { in: ids } } }),
    db.entitlement.count({ where: { examId: { in: ids } } }),
    db.attempt.count({ where: { examId: { in: ids } } }),
    db.order.count({ where: { examId: { in: ids } } })
  ]);

  console.log(`Hidden exams:           ${hidden.length}`);
  console.log(`  Questions cascading:  ${questions}`);
  console.log(`  Entitlements:         ${entitlements}`);
  console.log(`  Attempts:             ${attempts}`);
  console.log(`  Orders:               ${orders}`);

  await db.$disconnect();
})();
