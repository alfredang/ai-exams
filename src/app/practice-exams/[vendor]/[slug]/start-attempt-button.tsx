// Server action button that starts a practice- or exam-mode attempt on the
// certification's pool exam. Shared by the exam page and the product view.
export function StartButton({ examId, mode }: { examId: string; mode: 'PRACTICE' | 'EXAM' }) {
  return (
    <form action={async () => {
      'use server';
      const { auth } = await import('@/lib/auth');
      const { redirect } = await import('next/navigation');
      const { createAttempt } = await import('@/lib/start-attempt');
      const { requireProfileToStart } = await import('@/lib/full-name');
      const s = await auth();
      const uid = (s?.user as any)?.id;
      if (!uid) return;
      await requireProfileToStart(s, examId, mode);
      const id = await createAttempt(uid, examId, mode);
      if (id) redirect(`/exam/${id}`);
    }}>
      <button className={mode === 'EXAM' ? 'btn-primary-grad w-full' : 'btn-secondary w-full'}>
        {mode === 'EXAM' ? 'Start Exam Mode (timed)' : 'Start Practice Mode'}
      </button>
    </form>
  );
}
