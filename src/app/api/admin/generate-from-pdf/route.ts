import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { streamGenerateQuestions, type GenerateInput } from '@/lib/claude';
import { extractFromPdf } from '@/lib/sources/extract';
import { chunkBySection } from '@/lib/sources/chunk';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 });

  const form = await req.formData();
  const examId = String(form.get('examId') || '');
  const domain = String(form.get('domain') || 'General');
  const count = Math.max(1, Math.min(25, Number(form.get('count') || 5)));
  const difficulty = Math.max(1, Math.min(5, Number(form.get('difficulty') || 3))) as 1 | 2 | 3 | 4 | 5;
  const qType = (form.get('type') as 'SINGLE' | 'MULTI' | 'TRUE_FALSE') ?? 'SINGLE';
  const file = form.get('file');
  if (!(file instanceof File)) return new Response('No file', { status: 400 });

  const exam = await db.exam.findUnique({ where: { id: examId }, include: { vendor: true } });
  if (!exam) return new Response('Exam not found', { status: 404 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), 'uploads', 'exam-sources');
  await mkdir(uploadsDir, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const storedName = `${Date.now()}-${safeName}`;
  const storagePath = path.join('uploads', 'exam-sources', storedName);
  await writeFile(path.join(process.cwd(), storagePath), buffer);

  const { text, meta } = await extractFromPdf(buffer);
  const chunks = chunkBySection(text, 5000);

  const sourceRow = await db.examSource.create({
    data: {
      examId,
      kind: 'PDF',
      label: file.name,
      storagePath,
      importedById: user.id
    }
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      try {
        send('init', { sourceId: sourceRow.id, chunks: chunks.length, pdfPages: meta.numpages ?? 0 });
        let issued = 0;
        for (let i = 0; i < chunks.length && issued < count; i++) {
          send('chunk', { i: i + 1, of: chunks.length });
          const input: GenerateInput = {
            vendor: exam.vendor.name,
            certification: exam.title,
            examCode: exam.code,
            domain,
            domainWeights: (exam.domains as any[]) || [],
            count: Math.min(count - issued, 5),
            difficulty,
            type: qType,
            sourceExcerpt: chunks[i],
            sourceLabel: file.name
          };
          for await (const ev of streamGenerateQuestions(input)) {
            if (ev.type === 'question') {
              const created = await db.question.create({
                data: {
                  examId,
                  stem: ev.question.stem,
                  type: ev.question.type,
                  options: ev.question.options,
                  correct: ev.question.correct,
                  explanation: ev.question.explanation,
                  domain: ev.question.domain,
                  difficulty: ev.question.difficulty,
                  references: ev.question.references,
                  status: 'PUBLISHED', // auto-publish: added questions join the pool
                  generatedBy: 'claude:from-pdf',
                  sourceId: sourceRow.id
                }
              });
              issued++;
              send('question', { id: created.id, ...ev.question });
              if (issued >= count) break;
            } else if (ev.type === 'error') {
              send('warn', { message: ev.message });
            }
          }
        }
        await db.adminLog.create({
          data: {
            adminId: user.id,
            action: 'exam.generate-from-pdf',
            targetType: 'Exam',
            targetId: examId,
            metadata: { sourceId: sourceRow.id, fileName: file.name, requested: count, issued }
          }
        });
        send('done', { total: issued });
      } catch (e: any) {
        send('error', { message: e?.message ?? 'Generation failed' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no'
    }
  });
}
