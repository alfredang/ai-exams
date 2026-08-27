import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';
import { scoreAttempt, type Responses } from '@/lib/attempts';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await ctx.params;
  const a = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { vendor: true } } }
  });
  if (!a || !a.submittedAt) {
    return new Response('Not found', { status: 404 });
  }
  const questions = await db.question.findMany({ where: { id: { in: a.questionIds } } });
  const ordered = a.questionIds.map((id) => questions.find((q) => q.id === id)!).filter(Boolean);
  const { score, correctCount, total } = scoreAttempt(ordered, (a.responses as Responses) || {});
  const passed = a.passed ?? score >= a.exam.passingScore;

  const bg = passed
    ? 'linear-gradient(135deg, #065f46 0%, #10b981 100%)'
    : 'linear-gradient(135deg, #1e3a8a 0%, #6366f1 100%)';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'space-between',
          background: bg, color: 'white', padding: '60px 70px', fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'white', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>E</div>
          Tertiary Exams
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 24, opacity: 0.85, marginBottom: 12 }}>{a.exam.vendor.name} · {a.exam.code}</div>
          <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>{a.exam.title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 36 }}>
            <span style={{ fontSize: 160, fontWeight: 800, letterSpacing: -4 }}>{score}%</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 40, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 4 }}>
                {passed ? 'PASS' : 'In progress'}
              </span>
              <span style={{ fontSize: 24, opacity: 0.85, marginTop: 6 }}>{correctCount}/{total} correct · pass {a.exam.passingScore}%</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 22, opacity: 0.85 }}>
          Practice exams powered by AI on Tertiary Exams
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
