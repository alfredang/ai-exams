import { Prisma, type PrismaClient } from '@prisma/client';
import { CCAR_PPTX_QUESTIONS, CCAR_PPTX_TAG } from './ccar-foundations-pptx-questions';

export const ccarPptxQuestionId = (sourceNumber: number) => `ccar-f-pptx-20261113-q${String(sourceNumber).padStart(2, '0')}`;

/** Append-only. Stable IDs prevent concurrent/repeated boots from duplicating
 * records; no existing question, review status, attempt, or exam setting is
 * updated. Admin edits/unpublishing of previously imported rows survive. */
export async function importCcarFoundationsPptx(db: PrismaClient) {
  return db.$transaction(async tx => {
    const exam = await tx.exam.findUnique({
      where: { slug: 'anthropic-cca-foundations' },
      include: { vendor: { select: { slug: true } } }
    });
    if (!exam || exam.code !== 'CCAR-F' || exam.vendor.slug !== 'anthropic' || exam.poolExamId || exam.deletedAt) {
      throw new Error('CCAR-F import requires the verified active Anthropic CCAR-F pool; no changes made.');
    }
    const domains = new Set((exam.domains as { name: string }[]).map(d => d.name));
    if (CCAR_PPTX_QUESTIONS.some(q => !domains.has(q.domain))) {
      throw new Error('CCAR-F pool domains do not match the question set; no changes made.');
    }
    const ids = CCAR_PPTX_QUESTIONS.map(q => ccarPptxQuestionId(q.sourceNumber));
    const occupied = await tx.question.findMany({ where: { id: { in: ids } }, select: { id: true, examId: true, generatedBy: true } });
    if (occupied.some(q => q.examId !== exam.id || q.generatedBy !== CCAR_PPTX_TAG)) {
      throw new Error('CCAR-F import ID collision; no changes made.');
    }
    const existing = await tx.question.findMany({ where: { examId: exam.id }, select: { stem: true } });
    const stems = new Set(existing.map(q => q.stem));
    const rows: Prisma.QuestionCreateManyInput[] = CCAR_PPTX_QUESTIONS
      .filter(q => !stems.has(q.stem))
      .map(({ sourceNumber, stem, domain, difficulty, type, options, correct, explanation, references }) => ({
        id: ccarPptxQuestionId(sourceNumber), examId: exam.id, stem, domain, difficulty,
        type, options, correct, explanation, references,
        status: 'PUBLISHED', generatedBy: CCAR_PPTX_TAG
      }));
    const result = await tx.question.createMany({ data: rows, skipDuplicates: true });
    const imported = await tx.question.findMany({
      where: { examId: exam.id, generatedBy: CCAR_PPTX_TAG },
      select: { id: true, status: true }
    });
    return {
      examId: exam.id, slug: exam.slug, created: result.count,
      sourceQuestions: CCAR_PPTX_QUESTIONS.length, imported: imported.length,
      publishedImported: imported.filter(q => q.status === 'PUBLISHED').length,
      totalQuestions: await tx.question.count({ where: { examId: exam.id } }),
      publishedQuestions: await tx.question.count({ where: { examId: exam.id, status: 'PUBLISHED' } })
    };
  });
}
