'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { resumeOrCreateAttempt } from '@/lib/start-attempt';
import { requireFullNameToStart } from '@/lib/full-name';

/** One-click start from a dashboard badge: straight into the exam runner. */
export async function startFromDashboard(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect('/login?next=/user-dashboard');
  const examId = String(formData.get('examId') || '');
  // Exam mode is the default, like the real test; Practice must be asked for.
  const mode = formData.get('mode') === 'PRACTICE' ? 'PRACTICE' : 'EXAM';
  if (examId) await requireFullNameToStart(session, examId, mode);
  const attemptId = examId ? await resumeOrCreateAttempt(userId, examId, mode) : null;
  redirect(attemptId ? `/exam/${attemptId}` : '/user-dashboard?start=failed');
}

/**
 * Remove one attempt from the learner's own history. Scoped to the signed-in
 * user's rows, so an id from someone else's attempt deletes nothing. An
 * impersonating admin can't erase the user's history.
 */
export async function deleteAttempt(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId || (session?.user as any)?.impersonatedBy) return;
  const attemptId = String(formData.get('attemptId') || '');
  if (!attemptId) return;
  await db.attempt.deleteMany({ where: { id: attemptId, userId } });
  revalidatePath('/user-dashboard');
  revalidatePath('/user-dashboard/attempts');
}
