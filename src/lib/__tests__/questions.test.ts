import { describe, expect, it } from 'vitest';
import { isRunnerQuestionType, RUNNER_QUESTION_TYPES } from '../questions';

describe('runner question types', () => {
  it('matches the question types supported by the exam runner', () => {
    expect(RUNNER_QUESTION_TYPES).toEqual(['SINGLE', 'MULTI', 'TRUE_FALSE']);
    expect(isRunnerQuestionType('SINGLE')).toBe(true);
    expect(isRunnerQuestionType('ORDERING')).toBe(false);
    expect(isRunnerQuestionType('HOTSPOT')).toBe(false);
  });
});
