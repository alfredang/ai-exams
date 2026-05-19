import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Prisma, PrismaClient, QStatus, QType } from '@prisma/client';

type DuplicateStrategy = 'generatedBy' | 'examHasQuestions';

type QuestionBank = {
  sourceScript: string;
  examSlug: string;
  arrayName: string;
  tag: string | null;
  duplicateStrategy: DuplicateStrategy;
  targetPublishedCount?: number;
  sourceOffset?: number;
  upsertExam?: UpsertExamRecord;
  defaultDifficulty: number;
  defaultType: string;
  defaultStatus: string;
  teaserCount: number;
  defaultReferences: unknown[];
  questions: QuestionRecord[];
};

type QuestionRecord = {
  domain: string;
  difficulty?: number;
  type: string;
  stem: string;
  options: unknown[];
  correct: string[];
  explanation: string;
  references?: unknown[];
};

type UpsertExamRecord = {
  vendorSlug: string;
  code: string;
  title: string;
  description: string;
  level: string;
  durationMinutes: number;
  passingScore: number;
  questionCount: number;
  domains: unknown[];
  published: boolean;
};

type SeedResult = {
  path: string;
  examSlug: string;
  inserted: number;
  skipped: boolean;
  reason?: string;
};

function readQuestionBank(path: string): QuestionBank {
  const resolvedPath = resolve(process.cwd(), path);
  if (!existsSync(resolvedPath)) {
    throw new Error(`Question bank not found: ${path}`);
  }

  const bank = JSON.parse(readFileSync(resolvedPath, 'utf8')) as QuestionBank;
  validateQuestionBank(bank, path);
  return bank;
}

function validateQuestionBank(bank: QuestionBank, path: string) {
  if (!bank.examSlug) throw new Error(`${path}: missing examSlug`);
  if (!Array.isArray(bank.questions) || bank.questions.length === 0) {
    throw new Error(`${path}: no questions found`);
  }
  if (bank.duplicateStrategy !== 'generatedBy' && bank.duplicateStrategy !== 'examHasQuestions') {
    throw new Error(`${path}: invalid duplicateStrategy`);
  }
  if (!isQStatus(bank.defaultStatus)) {
    throw new Error(`${path}: invalid defaultStatus "${bank.defaultStatus}"`);
  }

  bank.questions.forEach((question, index) => {
    const label = `${path}: question ${index + 1}`;
    if (!question.domain) throw new Error(`${label} missing domain`);
    if (typeof question.stem !== 'string') throw new Error(`${label} missing stem`);
    if (!Array.isArray(question.options) || question.options.length === 0) {
      throw new Error(`${label} missing options`);
    }
    if (!Array.isArray(question.correct) || question.correct.length === 0) {
      throw new Error(`${label} missing correct answers`);
    }
    if (typeof question.explanation !== 'string') throw new Error(`${label} missing explanation`);
    if (!isQType(question.type || bank.defaultType)) {
      throw new Error(`${label} has invalid type "${question.type}"`);
    }
  });
}

function isQType(value: string): value is QType {
  return Object.values(QType).includes(value as QType);
}

function isQStatus(value: string): value is QStatus {
  return Object.values(QStatus).includes(value as QStatus);
}

function getGeneratedBy(bank: QuestionBank) {
  return bank.tag ?? `json:${bank.sourceScript}`;
}

async function getOrCreateExam(db: PrismaClient, bank: QuestionBank) {
  if (!bank.upsertExam) {
    const exam = await db.exam.findUnique({ where: { slug: bank.examSlug } });
    if (!exam) {
      throw new Error(`${bank.examSlug}: exam not found. Run npm run db:seed first.`);
    }
    return exam;
  }

  const vendor = await db.vendor.findUnique({ where: { slug: bank.upsertExam.vendorSlug } });
  if (!vendor) {
    throw new Error(`${bank.examSlug}: vendor "${bank.upsertExam.vendorSlug}" not found. Run npm run db:seed first.`);
  }

  const examData = {
    code: bank.upsertExam.code,
    title: bank.upsertExam.title,
    description: bank.upsertExam.description,
    level: bank.upsertExam.level,
    durationMinutes: bank.upsertExam.durationMinutes,
    passingScore: bank.upsertExam.passingScore,
    questionCount: bank.upsertExam.questionCount,
    domains: bank.upsertExam.domains as Prisma.InputJsonValue,
    published: bank.upsertExam.published
  };

  return db.exam.upsert({
    where: { slug: bank.examSlug },
    update: examData,
    create: {
      ...examData,
      slug: bank.examSlug,
      vendor: { connect: { id: vendor.id } }
    }
  });
}

function toCreateData(bank: QuestionBank, question: QuestionRecord, index: number, examId: string): Prisma.QuestionCreateInput {
  return {
    exam: { connect: { id: examId } },
    domain: question.domain,
    difficulty: question.difficulty ?? bank.defaultDifficulty,
    type: (question.type || bank.defaultType) as QType,
    stem: question.stem,
    options: question.options as Prisma.InputJsonValue,
    correct: question.correct as Prisma.InputJsonValue,
    explanation: question.explanation,
    references: (question.references ?? bank.defaultReferences) as Prisma.InputJsonValue,
    status: bank.defaultStatus as QStatus,
    generatedBy: getGeneratedBy(bank),
    isTeaser: index < bank.teaserCount
  };
}

export async function seedQuestionBank(db: PrismaClient, bankPath: string): Promise<SeedResult> {
  const bank = readQuestionBank(bankPath);
  const exam = await getOrCreateExam(db, bank);

  const generatedBy = getGeneratedBy(bank);

  if (bank.targetPublishedCount) {
    const current = await db.question.count({
      where: { examId: exam.id, status: QStatus.PUBLISHED }
    });
    if (current >= bank.targetPublishedCount) {
      return {
        path: bankPath,
        examSlug: bank.examSlug,
        inserted: 0,
        skipped: true,
        reason: `already has ${current} published questions`
      };
    }

    const need = bank.targetPublishedCount - current;
    const already = await db.question.count({ where: { examId: exam.id, generatedBy } });
    if (already >= need) {
      return {
        path: bankPath,
        examSlug: bank.examSlug,
        inserted: 0,
        skipped: true,
        reason: `already has ${already} generated questions`
      };
    }

    for (let index = 0; index < need; index++) {
      const sourceIndex = ((bank.sourceOffset ?? 0) + index) % bank.questions.length;
      const question = bank.questions[sourceIndex];
      await db.question.create({ data: toCreateData(bank, question, index, exam.id) });
    }

    const newTotal = await db.question.count({
      where: { examId: exam.id, status: QStatus.PUBLISHED }
    });
    await db.exam.update({ where: { id: exam.id }, data: { questionCount: newTotal } });

    return { path: bankPath, examSlug: bank.examSlug, inserted: need, skipped: false };
  }

  const duplicateWhere =
    bank.duplicateStrategy === 'examHasQuestions'
      ? { examId: exam.id }
      : { examId: exam.id, generatedBy };

  const existing = await db.question.count({ where: duplicateWhere });
  if (existing > 0) {
    return {
      path: bankPath,
      examSlug: bank.examSlug,
      inserted: 0,
      skipped: true,
      reason: `found ${existing} existing matching questions`
    };
  }

  for (let index = 0; index < bank.questions.length; index++) {
    await db.question.create({
      data: toCreateData(bank, bank.questions[index], index, exam.id)
    });
  }

  return {
    path: bankPath,
    examSlug: bank.examSlug,
    inserted: bank.questions.length,
    skipped: false
  };
}

async function main() {
  const bankPaths = process.argv.slice(2);
  if (bankPaths.length === 0) {
    throw new Error('Usage: npx tsx scripts/content/seed-question-bank.ts content/question-banks/<bank>.json');
  }

  const db = new PrismaClient();
  try {
    for (const bankPath of bankPaths) {
      const result = await seedQuestionBank(db, bankPath);
      const status = result.skipped ? `skipped (${result.reason})` : `inserted ${result.inserted}`;
      console.log(`${result.examSlug}: ${status}`);
    }
  } finally {
    await db.$disconnect();
  }
}

if (process.argv[1]?.endsWith('seed-question-bank.ts')) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
