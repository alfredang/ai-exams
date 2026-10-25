import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PageHeader } from '@/components/admin/page-header';
import { QuestionForm } from '@/components/admin/question-form';
import { parseDomains } from '@/lib/question-pool';
import type { QuestionKind } from '@/lib/question-input';
import { updateQuestion } from '../../question-actions';

export const dynamic = 'force-dynamic';

/** Legacy rows store references as URL strings or {url,label}; show them as editable lines. */
function referencesText(raw: unknown): string {
  if (!Array.isArray(raw)) return '';
  return raw
    .map((r) => (typeof r === 'string' ? r : r && typeof r.url === 'string' ? (r.label && r.label !== r.url ? `${r.label} | ${r.url}` : r.url) : ''))
    .filter(Boolean)
    .join('\n');
}

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string; qid: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id, qid } = await params;
  const q = await db.question.findUnique({ where: { id: qid }, include: { exam: { select: { id: true, code: true, title: true, domains: true } } } });
  if (!q || q.examId !== id) notFound();
  const back = q.status === 'DRAFT' ? `/admin-dashboard/exams/${id}#review-${qid}` : `/admin-dashboard/exams/${id}#q-${qid}`;
  const usedIn = await db.attempt.count({ where: { questionIds: { has: qid } } });

  const options = (q.options as { id: string; text: string }[]) ?? [];
  const correct = ((q.correct as string[]) ?? []).map(String);
  // Sequencing is edited in the correct order (the form treats list order as the answer).
  const ordered = q.type === 'ORDERING'
    ? [...options].sort((a, b) => correct.indexOf(a.id) - correct.indexOf(b.id))
    : options;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Edit question"
        subtitle={`${q.exam.code} · ${q.exam.title} · ${q.status.toLowerCase()}`}
        back={{ href: back, label: q.status === 'DRAFT' ? 'Back to review queue' : 'Back to question bank' }}
      />
      {usedIn > 0 && (
        <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          This question has appeared in {usedIn} attempt{usedIn === 1 ? '' : 's'}. Results are scored against the current answer key,
          so changing the correct answer also changes those past scores.
        </p>
      )}
      <div className="card p-4">
        {q.type === 'HOTSPOT' ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Hotspot questions can&apos;t be edited here. <Link href={back} className="text-blue-600 hover:underline">Back to the question bank</Link>
          </p>
        ) : (
          <QuestionForm
            action={updateQuestion}
            domains={parseDomains(q.exam.domains).map((d) => d.name)}
            hidden={{ questionId: q.id }}
            submitLabel="Save changes"
            initial={{
              type: q.type as QuestionKind,
              domain: q.domain,
              difficulty: q.difficulty,
              stem: q.stem,
              options: ordered,
              correct,
              explanation: q.explanation,
              references: referencesText(q.references)
            }}
          />
        )}
      </div>
    </div>
  );
}
