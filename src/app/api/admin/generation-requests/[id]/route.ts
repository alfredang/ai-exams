import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/generation-requests/[id] — cancel a queued or running
 * request. Questions already published stay; the worker gets a 409 on its
 * next call and stops.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const done = await db.generationRequest.updateMany({
    where: { id, status: { in: ['QUEUED', 'RUNNING'] } },
    data: { status: 'CANCELLED', phase: null, finishedAt: new Date() }
  });
  if (!done.count) return Response.json({ error: 'This request has already finished.' }, { status: 409 });
  const row = await db.generationRequest.findUnique({ where: { id }, select: { examId: true, created: true } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'question.generation_cancel', targetType: 'Exam', targetId: row?.examId ?? null, metadata: { requestId: id, created: row?.created ?? 0 } }
  });
  return Response.json({ ok: true });
}
