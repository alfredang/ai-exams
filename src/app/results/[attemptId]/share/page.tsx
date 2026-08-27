import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { scoreAttempt, type Responses } from '@/lib/attempts';

export const dynamic = 'force-dynamic';

async function loadAttempt(attemptId: string) {
  const a = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { vendor: true } } }
  });
  if (!a || !a.submittedAt) return null;
  const questions = await db.question.findMany({ where: { id: { in: a.questionIds } } });
  const ordered = a.questionIds.map((id) => questions.find((q) => q.id === id)!).filter(Boolean);
  const { score, correctCount, total } = scoreAttempt(ordered, (a.responses as Responses) || {});
  const passed = a.passed ?? score >= a.exam.passingScore;
  return { attempt: a, score, correctCount, total, passed };
}

export async function generateMetadata({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const r = await loadAttempt(attemptId);
  if (!r) return {};
  const title = `${r.score}% on ${r.attempt.exam.vendor.name} ${r.attempt.exam.code} | Tertiary Exams`;
  const description = r.passed
    ? `Scored ${r.score}% (${r.correctCount}/${r.total}) on ${r.attempt.exam.title} practice exam — passed!`
    : `Practicing for ${r.attempt.exam.title} — ${r.score}% (${r.correctCount}/${r.total}).`;
  const ogUrl = `/api/og/results/${attemptId}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [ogUrl] },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] }
  };
}

export default async function ShareResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const r = await loadAttempt(attemptId);
  if (!r) notFound();
  const { attempt, score, correctCount, total, passed } = r;

  return (
    <div className="container-app py-10">
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">{attempt.exam.vendor.name} · {attempt.exam.code}</p>
        <h1 className="mt-1 text-3xl font-bold">{attempt.exam.title}</h1>
        <div className={`mt-6 inline-flex flex-col items-center rounded-full ${passed ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'} px-8 py-6`}>
          <span className="text-5xl font-bold">{score}%</span>
          <span className="text-sm font-semibold uppercase tracking-wide">{passed ? 'Pass' : 'In progress'}</span>
        </div>
        <p className="mt-4 text-slate-600 dark:text-slate-200">{correctCount} correct out of {total} · pass mark {attempt.exam.passingScore}%</p>
        <p className="mt-2 text-xs text-slate-500">Practiced on Tertiary Exams — original questions, never real exam dumps.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href={`/practice-exams/${attempt.exam.vendor.slug}/${attempt.exam.slug}`} className="btn-primary-grad">
            Try this exam
          </Link>
          <Link href="/" className="btn-outline">Explore Tertiary Exams</Link>
        </div>
      </div>
    </div>
  );
}
