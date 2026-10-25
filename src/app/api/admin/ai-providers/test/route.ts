import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { testAiProviders } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Health check for the AI keys in Settings → Credentials. Read-only. */
export async function POST() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const results = await testAiProviders();
  return NextResponse.json({ ok: true, results });
}
