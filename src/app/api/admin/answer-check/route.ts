import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { answerCheckProgress, answerCheckRun, startAnswerCheck, stopAnswerCheck } from '@/lib/answer-check-job';

export const dynamic = 'force-dynamic';

async function adminId(): Promise<string | null> {
  const session = await auth();
  const user = session?.user as any;
  return user?.role === 'ADMIN' ? (user.id as string) : null;
}

/** GET ?examId= — the background answer-key check: this run + pool progress. */
export async function GET(req: Request) {
  if (!(await adminId())) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const examId = new URL(req.url).searchParams.get('examId') || null;
  return Response.json({ run: answerCheckRun(), progress: await answerCheckProgress(examId) });
}

const Body = z.object({ action: z.enum(['start', 'stop']), examId: z.string().nullish() });

/** POST { action: 'start' | 'stop', examId? } — start (all banks, or one) or stop the check. */
export async function POST(req: Request) {
  const admin = await adminId();
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: 'Bad request' }, { status: 400 });
  const { action, examId } = parsed.data;
  if (examId && !(await db.exam.findUnique({ where: { id: examId }, select: { id: true } }))) {
    return Response.json({ error: 'Question bank not found' }, { status: 404 });
  }
  try {
    const run = action === 'start' ? await startAnswerCheck(admin, examId ?? null) : await stopAnswerCheck(admin);
    return Response.json({ run, progress: await answerCheckProgress(examId ?? null) });
  } catch (e: any) {
    return Response.json({ error: String(e?.message ?? e) }, { status: 400 });
  }
}
