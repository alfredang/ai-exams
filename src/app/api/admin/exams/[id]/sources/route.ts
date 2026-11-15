import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createExamSource, type SourceRequest } from '@/lib/sources/create';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const LinkBody = z.object({ kind: z.enum(['URL', 'YOUTUBE']), url: z.string().trim().min(8).max(2000) });

/**
 * POST /api/admin/exams/[id]/sources — read a source for the AI Question and
 * Answer Generator and store its text: multipart `file` (PDF), or JSON
 * `{ kind: 'URL' | 'YOUTUBE', url }`. Returns `{ id, label, chars, via }`;
 * the dialog then calls ai-generate with that `sourceId`.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const exam = await db.exam.findUnique({ where: { id }, select: { id: true, poolExamId: true } });
  if (!exam) return Response.json({ error: 'Question bank not found' }, { status: 404 });
  if (exam.poolExamId) return Response.json({ error: 'This is a retired variant — add questions to its pool exam.' }, { status: 400 });

  let source: SourceRequest;
  const type = req.headers.get('content-type') ?? '';
  if (type.startsWith('multipart/form-data')) {
    const form = await req.formData().catch(() => null);
    const file = form?.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'Choose a PDF file.' }, { status: 400 });
    source = { kind: 'PDF', file: { name: file.name || 'source.pdf', bytes: Buffer.from(await file.arrayBuffer()) } };
  } else {
    const parsed = LinkBody.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return Response.json({ error: 'Paste a full link starting with https://' }, { status: 400 });
    source = parsed.data;
  }

  try {
    const created = await createExamSource(db, { examId: id, adminId: user.id, source });
    await db.adminLog.create({
      data: {
        adminId: user.id,
        action: 'question.source_add',
        targetType: 'Exam',
        targetId: id,
        metadata: { sourceId: created.id, kind: created.kind, label: created.label, chars: created.chars, via: created.via }
      }
    });
    return Response.json(created);
  } catch (e: any) {
    return Response.json({ error: String(e?.message ?? 'Could not read that source').slice(0, 600) }, { status: 422 });
  }
}
