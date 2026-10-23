'use server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
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
