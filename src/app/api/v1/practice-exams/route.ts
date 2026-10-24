import { NextResponse } from 'next/server';
import { SCOPE_ASSIGN_PRACTICE_EXAMS, listPracticeExams, requireApiToken } from '@/lib/api-v1';

export const dynamic = 'force-dynamic';

/** GET /api/v1/practice-exams?q=ccao — the assignable practice exams, optionally filtered. */
export async function GET(req: Request) {
  const auth = await requireApiToken(req, SCOPE_ASSIGN_PRACTICE_EXAMS);
  if ('response' in auth) return auth.response;

  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase();
  const all = await listPracticeExams();
  const practiceExams = q
    ? all.filter((p) => [p.slug, p.code, p.title, p.vendor].some((s) => s.toLowerCase().includes(q)))
    : all;
  return NextResponse.json({ practiceExams });
}
