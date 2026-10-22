'use server';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { resumeOrCreateAttempt } from '@/lib/start-attempt';

/** One-click start from a dashboard badge: straight into the exam runner. */
export async function startFromDashboard(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect('/login?next=/user-dashboard');
  const examId = String(formData.get('examId') || '');
  const mode = formData.get('mode') === 'EXAM' ? 'EXAM' : 'PRACTICE';
  const attemptId = examId ? await resumeOrCreateAttempt(userId, examId, mode) : null;
  redirect(attemptId ? `/exam/${attemptId}` : '/user-dashboard?start=failed');
}
