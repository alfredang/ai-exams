import type { Mode } from '@prisma/client';
import { db } from './db';
import { scoreAttempt, type Responses } from './attempts';

export type HistoryAttempt = {
  id: string;
  examId: string;      // pool exam (retired variants fold into it)
  examCode: string;
  examTitle: string;
  mode: Mode;
  isTeaser: boolean;
  startedAt: Date;
  inProgress: boolean;
  expiresAt: Date | null; // Exam mode only — past it the attempt can no longer be resumed
  score: number | null;
  correct: number;
  total: number;
  passed: boolean | null;
  timeUsedSec: number | null;
};

export type DomainStat = { name: string; correct: number; total: number };

export type ExamHistory = {
  examId: string;
  code: string;
  title: string;
  vendorName: string;
  passingScore: number;
  attempts: HistoryAttempt[];  // newest first
  best: number | null;
  average: number | null;
  latest: number | null;
  domains: DomainStat[];       // all submitted attempts, weakest first
};

/**
 * A user's attempt history, newest first, plus a per-certification summary
 * (best / average / latest score and domain performance across every
 * submitted attempt). Scores are recomputed from the questions exactly as
 * the results page does, so both always agree.
 */
export async function getAttemptHistory(userId: string, take = 200) {
  const rows = await db.attempt.findMany({
    where: { userId },
    include: { exam: { include: { vendor: true, poolExam: { include: { vendor: true } } } } },
    orderBy: { startedAt: 'desc' },
    take
  });
  const submitted = rows.filter((a) => a.submittedAt);
  const questions = await db.question.findMany({
    where: { id: { in: [...new Set(submitted.flatMap((a) => a.questionIds))] } },
    select: { id: true, type: true, correct: true, domain: true }
  });
  const byId = new Map(questions.map((q) => [q.id, q]));

  const exams = new Map<string, ExamHistory & { domainMap: Map<string, DomainStat> }>();
  const attempts: HistoryAttempt[] = rows.map((a) => {
    const exam = a.exam.poolExam ?? a.exam;
    let group = exams.get(exam.id);
    if (!group) {
      group = {
        examId: exam.id,
        code: exam.code.replace(/-P\d+$/, ''),
        title: exam.title,
        vendorName: exam.vendor.name,
        passingScore: exam.passingScore,
        attempts: [],
        best: null,
        average: null,
        latest: null,
        domains: [],
        domainMap: new Map()
      };
      exams.set(exam.id, group);
    }

    let result: Pick<HistoryAttempt, 'score' | 'correct' | 'total' | 'passed' | 'timeUsedSec'> = {
      score: null, correct: 0, total: a.questionIds.length, passed: null, timeUsedSec: null
    };
    if (a.submittedAt) {
      const qs = a.questionIds.map((id) => byId.get(id)).filter((q) => !!q);
      const s = scoreAttempt(qs, (a.responses as Responses) || {});
      const elapsed = Math.max(0, Math.round((a.submittedAt.getTime() - a.startedAt.getTime()) / 1000));
      result = {
        score: s.score,
        correct: s.correctCount,
        total: s.total,
        passed: a.passed ?? s.score >= a.exam.passingScore,
        timeUsedSec: a.mode === 'EXAM' && a.exam.durationMinutes ? Math.min(elapsed, a.exam.durationMinutes * 60) : elapsed
      };
      for (const [name, d] of Object.entries(s.perDomain)) {
        const agg = group.domainMap.get(name) ?? { name, correct: 0, total: 0 };
        agg.correct += d.correct;
        agg.total += d.total;
        group.domainMap.set(name, agg);
      }
    }

    const row: HistoryAttempt = {
      id: a.id,
      examId: exam.id,
      examCode: group.code,
      examTitle: exam.title,
      mode: a.mode,
      isTeaser: a.isTeaser,
      startedAt: a.startedAt,
      inProgress: !a.submittedAt,
      expiresAt: a.expiresAt,
      ...result
    };
    group.attempts.push(row);
    return row;
  });

  const summaries: ExamHistory[] = [...exams.values()].map(({ domainMap, ...g }) => {
    const scores = g.attempts.filter((a) => a.score !== null).map((a) => a.score!);
    return {
      ...g,
      best: scores.length ? Math.max(...scores) : null,
      average: scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null,
      latest: scores[0] ?? null,
      domains: [...domainMap.values()].sort((x, y) => x.correct / x.total - y.correct / y.total)
    };
  });
  summaries.sort((x, y) => x.code.localeCompare(y.code));
  return { attempts, exams: summaries };
}

export function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
