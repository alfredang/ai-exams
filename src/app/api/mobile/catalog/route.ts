import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { practiceExamCount, practiceItems, practiceQuestionTotal } from '@/lib/bundle-contents';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim();
  const vendor = url.searchParams.get('vendor')?.trim();

  const bundles = await db.bundle.findMany({
    where: {
      published: true,
      ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}),
      ...(vendor ? { items: { some: { exam: { vendor: { slug: vendor } } } } } : {})
    },
    include: {
      items: {
        orderBy: { position: 'asc' },
        include: { exam: { include: { vendor: true, _count: { select: { questions: { where: { status: 'PUBLISHED' } } } } } } }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  });

  const vendors = await db.vendor.findMany({
    where: { exams: { some: { bundleItems: { some: { bundle: { published: true } } } } } },
    orderBy: { name: 'asc' },
    select: { id: true, slug: true, name: true, description: true }
  });

  return NextResponse.json({
    vendors,
    bundles: bundles.map((bundle) => {
      const practice = practiceItems(bundle.items);
      const first = practice[0]?.exam ?? bundle.items[0]?.exam;
      const totalQuestions = practiceQuestionTotal(bundle.items);
      return {
        id: bundle.id,
        slug: bundle.slug,
        title: bundle.title,
        description: bundle.description,
        vendor: first?.vendor ? { slug: first.vendor.slug, name: first.vendor.name } : null,
        code: first?.code.replace(/-P\d+$/, '') ?? '',
        level: first?.level ?? '',
        totalQuestions,
        practiceExamCount: practiceExamCount(bundle.items),
        exams: practice.map((item, index) => ({
          id: item.exam.id,
          slug: item.exam.slug,
          code: item.exam.code,
          title: item.exam.title,
          level: item.exam.level,
          durationMinutes: item.exam.durationMinutes,
          passingScore: item.exam.passingScore,
          questionCount: item.exam.questionCount,
          publishedQuestionCount: item.exam._count.questions,
          position: index + 1
        }))
      };
    })
  });
}
