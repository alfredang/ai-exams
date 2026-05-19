import type { QType } from '@prisma/client';

export const RUNNER_QUESTION_TYPES = ['SINGLE', 'MULTI', 'TRUE_FALSE'] as const;
export type RunnerQuestionType = (typeof RUNNER_QUESTION_TYPES)[number];

const RUNNER_QUESTION_TYPE_SET = new Set<string>(RUNNER_QUESTION_TYPES);

export function isRunnerQuestionType(type: QType | string): type is RunnerQuestionType {
  return RUNNER_QUESTION_TYPE_SET.has(type);
}
