import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/permissions';
import { lookupExamInfo } from '@/lib/exam-info-lookup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  vendor: z.string().min(2),
  code: z.string().min(2),
  title: z.string().optional().default(''),
  infoUrl: z.string().url().optional()
});

/**
 * Stateless AI Assist for the Create Exam form. Looks up exam metadata
 * (info URL, description, duration, passing %, question count, domain
 * blueprint) and returns it as JSON so the client can pre-fill the form.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!isAdminRole((session?.user as any)?.role)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const body = Body.parse(await req.json());
    const data = await lookupExamInfo(body);
    return NextResponse.json({ ok: true, ...data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
