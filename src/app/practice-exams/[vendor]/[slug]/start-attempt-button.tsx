// Server action button that starts a practice- or exam-mode attempt on the
// certification's pool exam. Shared by the exam page and the product view.
export function StartButton({ examId, mode }: { examId: string; mode: 'PRACTICE' | 'EXAM' }) {
  return (
    <form action={async () => {
      'use server';
      const { db } = await import('@/lib/db');
      const { auth } = await import('@/lib/auth');
      const { redirect } = await import('next/navigation');
      const { drawAttemptQuestions, hasPracticeAccess, resolvePoolExam } = await import('@/lib/question-pool');
      const s = await auth();
      const uid = (s?.user as any)?.id;
      const exam = await resolvePoolExam(db, examId);
      if (!exam || !uid || !(await hasPracticeAccess(db, uid, exam.id))) return;
      // Fresh domain-weighted draw from the pool on every attempt.
      const ids = await drawAttemptQuestions(db, exam);
      if (ids.length === 0) return;
      const att = await db.attempt.create({
        data: {
          userId: uid, examId: exam.id, mode, questionIds: ids,
          durationSec: mode === 'EXAM' ? exam.durationMinutes * 60 : 0,
          expiresAt: mode === 'EXAM' ? new Date(Date.now() + exam.durationMinutes * 60_000) : null,
          responses: {}
        }
      });
      redirect(`/exam/${att.id}`);
    }}>
      <button className={mode === 'EXAM' ? 'btn-primary-grad w-full' : 'btn-secondary w-full'}>
        {mode === 'EXAM' ? 'Exam Mode' : 'Practice Mode'}
      </button>
    </form>
  );
}
