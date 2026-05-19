import { describe, expect, it } from 'vitest';
import { hasOnlyAttemptQuestions, isAttemptExpired } from '../attempt-guards';

describe('attempt guards', () => {
  it('detects expired exam-mode attempts', () => {
    expect(isAttemptExpired({ mode: 'EXAM', expiresAt: new Date(Date.now() - 1000) })).toBe(true);
    expect(isAttemptExpired({ mode: 'EXAM', expiresAt: new Date(Date.now() + 1000) })).toBe(false);
    expect(isAttemptExpired({ mode: 'PRACTICE', expiresAt: new Date(Date.now() - 1000) })).toBe(false);
  });

  it('rejects autosave payloads containing questions outside the attempt', () => {
    const attempt = { questionIds: ['q1', 'q2'] };

    expect(hasOnlyAttemptQuestions(attempt, { q1: { answer: ['a'] }, q2: { answer: [] } })).toBe(true);
    expect(hasOnlyAttemptQuestions(attempt, { q1: { answer: ['a'] }, q3: { answer: [] } })).toBe(false);
  });
});
