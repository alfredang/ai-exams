'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AiQuestionGenerator } from '@/components/admin/ai-question-generator';

export type GeneratorExam = {
  id: string;
  code: string;
  title: string;
  vendor: string;
  drafts: number;
  domains: { name: string; weight: number; pool: number }[];
};

/**
 * AI Question Generator page body: pick the exam (question bank), then the
 * shared generator takes the domain, question type and number of questions.
 * Changing the exam remounts the generator so its domain list resets.
 */
export function AiGeneratorExamSelect({
  exams,
  initialExamId,
  configured,
  model
}: {
  exams: GeneratorExam[];
  initialExamId?: string;
  configured: boolean;
  model: string;
}) {
  const [examId, setExamId] = useState(initialExamId && exams.some((e) => e.id === initialExamId) ? initialExamId : '');
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? exams.filter((e) => `${e.vendor} ${e.code} ${e.title}`.toLowerCase().includes(needle))
      : exams;
    // Keep the picked exam in the list even when the filter hides it.
    const picked = exams.find((e) => e.id === examId);
    return picked && !list.includes(picked) ? [picked, ...list] : list;
  }, [q, exams, examId]);
  const vendors = [...new Set(shown.map((e) => e.vendor))];
  const exam = exams.find((e) => e.id === examId);

  return (
    <div className="grid gap-4">
      <div>
        <span className="label">Exam</span>
        <div className="grid gap-2 md:grid-cols-[16rem_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by vendor, code or title"
              aria-label="Filter exams"
              className="input pl-8"
            />
          </div>
          <select className="input" value={examId} onChange={(e) => setExamId(e.target.value)} aria-label="Exam">
            <option value="">Select an exam… ({shown.length})</option>
            {vendors.map((v) => (
              <optgroup key={v} label={v}>
                {shown.filter((e) => e.vendor === v).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} — {e.title}
                    {e.drafts ? ` · ${e.drafts} awaiting review` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {exam && (
          <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
            {exam.domains.reduce((s, d) => s + d.pool, 0)} published questions across {exam.domains.length || 'no'} domains ·{' '}
            <a href={`/admin-dashboard/exams/${exam.id}`} className="text-blue-600 hover:underline dark:text-blue-400">Open question bank</a>
            {exam.drafts > 0 && (
              <>
                {' · '}
                <a href={`/admin-dashboard/exams/${exam.id}#review`} className="font-semibold text-amber-700 hover:underline dark:text-amber-400">
                  {exam.drafts} awaiting review
                </a>
              </>
            )}
          </p>
        )}
      </div>

      {exam ? (
        <AiQuestionGenerator
          key={exam.id}
          examId={exam.id}
          domains={exam.domains}
          configured={configured}
          model={model}
          reviewHref={`/admin-dashboard/exams/${exam.id}#review`}
        />
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500 dark:border-slate-700">
          Select an exam to choose its domain, question type and number of questions.
        </p>
      )}
    </div>
  );
}
