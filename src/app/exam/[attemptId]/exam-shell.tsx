'use client';
import { ExamRunner, type RunnerQuestion, type RunnerResponse } from '@/components/exam-runner';

export function ExamShell(props: {
  attemptId: string;
  mode: 'PRACTICE' | 'EXAM';
  isTeaser: boolean;
  examTitle: string;
  examVendor: string;
  examSlug: string;
  vendorSlug: string;
  questions: RunnerQuestion[];
  remainingSec: number;
  initialResponses: Record<string, RunnerResponse>;
  isGuest: boolean;
}) {
  // No in-attempt teaser gate and no auto-submit: the user clicks the
  // "Submit exam" button in the header when they're ready. Per user
  // feedback 2026-05-26, the auto-submit-on-last-answer made guests
  // feel hijacked, and the in-attempt signup modal was redundant
  // anyway since PR #70 fires ResultsSignupPrompt on /results for
  // anonymous teaser submitters.
  return (
    <ExamRunner
      attemptId={props.attemptId}
      mode={props.mode}
      isTeaser={props.isTeaser}
      examTitle={props.examTitle}
      examVendor={props.examVendor}
      questions={props.questions}
      remainingSec={props.remainingSec}
      initialResponses={props.initialResponses}
    />
  );
}
