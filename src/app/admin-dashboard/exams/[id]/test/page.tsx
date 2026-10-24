import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { examBaseTitle } from '@/lib/exam-title';
import { auth } from '@/lib/auth';
import { drawAttemptQuestions } from '@/lib/question-pool';

async function startTestAttempt(formData: FormData) {
  'use server';
  const session = await auth();
  const me = session?.user as any;
  if (!me?.id || me.role !== 'ADMIN') return;
  const examId = String(formData.get('examId'));
  const mode = (String(formData.get('mode')) as 'PRACTICE' | 'EXAM') || 'PRACTICE';
  const exam = await db.exam.findUnique({ where: { id: examId } });
  if (!exam) return;
  const ids = await drawAttemptQuestions(db, exam);
  if (ids.length === 0) return;
  const att = await db.attempt.create({
    data: {
      optionShuffleVersion: 1,
      userId: me.id,
      examId,
      mode,
      questionIds: ids,
      durationSec: mode === 'EXAM' ? exam.durationMinutes * 60 : 0,
      expiresAt: mode === 'EXAM' ? new Date(Date.now() + exam.durationMinutes * 60_000) : null,
      responses: {}
    }
  });
  redirect(`/exam/${att.id}`);
}

export default async function AdminTestExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await db.exam.findUnique({
    where: { id },
    include: {
      vendor: true,
      _count: { select: { questions: { where: { status: 'PUBLISHED' } } } }
    }
  });
  if (!exam) notFound();
  const publishedCount = exam._count.questions;
  const canStart = publishedCount > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin-dashboard/exams" className="text-xs text-slate-500 hover:underline">
        ← Back to question banks
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Test Question Bank</h1>
      <div className="mt-1 text-sm text-slate-500">
        {exam.vendor.name} · {exam.code} · {examBaseTitle(exam.title)}
      </div>

      <div className="card mt-4 p-4 text-sm">
        <dl className="grid grid-cols-2 gap-2">
          <Row k="Level" v={exam.level} />
          <Row k="Duration" v={`${exam.durationMinutes} min`} />
          <Row k="Questions per exam" v={String(exam.questionCount)} />
          <Row k="Published in bank" v={String(publishedCount)} />
        </dl>
        {!canStart && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            No published questions yet. Add or publish questions before testing.
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <form action={startTestAttempt} className="card p-4">
          <input type="hidden" name="examId" value={exam.id} />
          <input type="hidden" name="mode" value="PRACTICE" />
          <h2 className="text-base font-semibold">Practice Mode</h2>
          <p className="mt-1 text-xs text-slate-500">
            Immediate feedback after each answer. No timer.
          </p>
          <button
            disabled={!canStart}
            className="btn-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Practice
          </button>
        </form>

        <form action={startTestAttempt} className="card p-4">
          <input type="hidden" name="examId" value={exam.id} />
          <input type="hidden" name="mode" value="EXAM" />
          <h2 className="text-base font-semibold">Exam Mode</h2>
          <p className="mt-1 text-xs text-slate-500">
            Real-exam simulation. {exam.durationMinutes}-minute timer, results at the end.
          </p>
          <button
            disabled={!canStart}
            className="btn-primary-grad mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Exam
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </>
  );
}
