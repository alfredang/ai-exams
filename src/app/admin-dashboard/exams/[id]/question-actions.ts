'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { validateQuestion, type QuestionInput } from '@/lib/question-input';
import type { QuestionFormState } from '@/components/admin/question-form';

async function adminId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user as any;
  return user?.role === 'ADMIN' ? (user.id as string) : null;
}

function readPayload(fd: FormData) {
  try {
    return validateQuestion(JSON.parse(String(fd.get('payload') || '{}')) as QuestionInput);
  } catch {
    return { ok: false as const, error: 'Could not read the form — reload and try again.' };
  }
}

function refresh(examId: string) {
  revalidatePath(`/admin-dashboard/exams/${examId}`);
  revalidatePath('/admin-dashboard/exams');
}

/** Add one question by hand. It is published straight into the pool. */
export async function createQuestion(_prev: QuestionFormState, fd: FormData): Promise<QuestionFormState> {
  const admin = await adminId();
  if (!admin) return { error: 'Only admins can add questions.' };
  const examId = String(fd.get('examId') || '');
  if (!examId || !(await db.exam.findUnique({ where: { id: examId }, select: { id: true } }))) {
    return { error: 'Question bank not found.' };
  }
  const res = readPayload(fd);
  if (!res.ok) return { error: res.error };
  const q = res.value;
  const row = await db.question.create({
    data: { examId, ...q, status: 'PUBLISHED', generatedBy: 'manual' }
  });
  await db.adminLog.create({
    data: { adminId: admin, action: 'question.create', targetType: 'Question', targetId: row.id, metadata: { examId, type: q.type, domain: q.domain } }
  });
  refresh(examId);
  return { ok: true, message: 'Question added to the pool. Add another, or close this panel.', at: Date.now() };
}

/** Save an edited question; keeps its status, then returns to the bank list. */
export async function updateQuestion(_prev: QuestionFormState, fd: FormData): Promise<QuestionFormState> {
  const admin = await adminId();
  if (!admin) return { error: 'Only admins can edit questions.' };
  const id = String(fd.get('questionId') || '');
  const before = await db.question.findUnique({ where: { id } });
  if (!before) return { error: 'Question not found — it may have been deleted.' };
  const res = readPayload(fd);
  if (!res.ok) return { error: res.error };
  const q = res.value;
  await db.question.update({ where: { id }, data: q });
  await db.adminLog.create({
    data: {
      adminId: admin,
      action: 'question.update',
      targetType: 'Question',
      targetId: id,
      metadata: {
        examId: before.examId,
        before: { stem: before.stem, type: before.type, domain: before.domain, options: before.options, correct: before.correct } as any
      }
    }
  });
  refresh(before.examId);
  // A draft goes back to the review queue; anything else to its row in the pool.
  if (before.status === 'DRAFT') redirect(`/admin-dashboard/exams/${before.examId}?edited=${id}#review-${id}`);
  redirect(`/admin-dashboard/exams/${before.examId}?edited=${id}#q-${id}`);
}

/** Review queue: an admin approves a draft, which publishes it into the pool. */
export async function approveQuestion(fd: FormData) {
  const admin = await adminId();
  if (!admin) return;
  const id = String(fd.get('id') || '');
  const q = await db.question.findUnique({ where: { id }, select: { examId: true, status: true } });
  if (!q || q.status !== 'DRAFT') return;
  await db.question.update({ where: { id }, data: { status: 'PUBLISHED' } });
  await db.adminLog.create({
    data: { adminId: admin, action: 'question.approve', targetType: 'Question', targetId: id, metadata: { examId: q.examId } }
  });
  refresh(q.examId);
}

/**
 * Review queue: reject a draft. It is deleted, unless an earlier attempt drew
 * it (it was published before), in which case it is archived so that
 * attempt's results still open.
 */
export async function rejectQuestion(fd: FormData) {
  const admin = await adminId();
  if (!admin) return;
  const id = String(fd.get('id') || '');
  const q = await db.question.findUnique({ where: { id }, select: { examId: true, status: true, stem: true, generatedBy: true } });
  if (!q || q.status !== 'DRAFT') return;
  const usedIn = await db.attempt.count({ where: { questionIds: { has: id } } });
  if (usedIn > 0) await db.question.update({ where: { id }, data: { status: 'ARCHIVED' } });
  else await db.question.delete({ where: { id } });
  await db.adminLog.create({
    data: {
      adminId: admin,
      action: 'question.reject',
      targetType: 'Question',
      targetId: id,
      metadata: { examId: q.examId, stem: q.stem, generatedBy: q.generatedBy, archived: usedIn > 0 }
    }
  });
  refresh(q.examId);
}

export async function deleteQuestion(fd: FormData) {
  const admin = await adminId();
  if (!admin) return;
  const id = String(fd.get('id') || '');
  const q = await db.question.findUnique({ where: { id }, select: { examId: true, stem: true } });
  if (!q) return;
  await db.question.delete({ where: { id } });
  await db.adminLog.create({
    data: { adminId: admin, action: 'question.delete', targetType: 'Question', targetId: id, metadata: { examId: q.examId, stem: q.stem } }
  });
  refresh(q.examId);
}

export async function toggleQuestionStatus(fd: FormData) {
  const admin = await adminId();
  if (!admin) return;
  const id = String(fd.get('id') || '');
  const q = await db.question.findUnique({ where: { id }, select: { examId: true, status: true } });
  if (!q) return;
  const status = q.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
  await db.question.update({ where: { id }, data: { status } });
  await db.adminLog.create({
    data: { adminId: admin, action: status === 'PUBLISHED' ? 'question.publish' : 'question.unpublish', targetType: 'Question', targetId: id, metadata: { examId: q.examId } }
  });
  refresh(q.examId);
}
