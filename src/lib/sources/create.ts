import type { PrismaClient } from '@prisma/client';
import { extractFromPdf, extractFromWebPage, extractFromYoutube, MAX_PDF_BYTES, type ExtractResult } from './extract';

export type SourceRequest =
  | { kind: 'PDF'; file: { name: string; bytes: Buffer } }
  | { kind: 'URL'; url: string }
  | { kind: 'YOUTUBE'; url: string };

export type CreatedSource = { id: string; kind: SourceRequest['kind']; label: string; chars: number; via: string };

/**
 * Read a question source (PDF / web page / YouTube transcript) and store its
 * text as an ExamSource of that question bank, for the AI Question and Answer
 * Generator (admin dialog) and the exam-question-scout agent (/api/v1).
 * Throws with an admin-readable message when the source can't be read.
 */
export async function createExamSource(
  db: PrismaClient,
  input: { examId: string; adminId: string; source: SourceRequest }
): Promise<CreatedSource> {
  const src = input.source;
  let read: ExtractResult;
  if (src.kind === 'PDF') {
    if (!src.file.bytes.length) throw new Error('The PDF is empty.');
    if (src.file.bytes.length > MAX_PDF_BYTES) throw new Error('PDFs up to 25 MB, please.');
    if (src.file.bytes.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Error('That file is not a PDF.');
    read = await extractFromPdf(src.file.bytes, src.file.name);
  } else if (src.kind === 'YOUTUBE') {
    read = await extractFromYoutube(src.url);
  } else {
    read = await extractFromWebPage(src.url);
  }
  const label = `${read.title || (src.kind === 'PDF' ? src.file.name : src.url)}`.slice(0, 200);
  const row = await db.examSource.create({
    data: {
      examId: input.examId,
      kind: src.kind,
      label,
      urls: src.kind === 'PDF' ? undefined : [src.url.trim()],
      content: read.text,
      importedById: input.adminId
    },
    select: { id: true }
  });
  return { id: row.id, kind: src.kind, label, chars: read.text.length, via: read.via };
}
