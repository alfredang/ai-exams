import { NextResponse } from 'next/server';
import { z } from 'zod';
import { issueOtp } from '@/lib/otp';

const Body = z.object({
  email: z.string().email(),
  purpose: z.enum(['LOGIN', 'REGISTER', 'RESET', 'TEASER_GATE'])
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  // Defensive parsing — invalid JSON or schema-mismatched payload returns
  // 400, not a 500 from an unhandled throw. The UI always sends a valid
  // body; this is for direct API callers + curl probes.
  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const result = Body.safeParse(raw);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: result.error.flatten() },
      { status: 400 }
    );
  }
  const data = result.data;
  const r = await issueOtp(data.email, data.purpose, ip);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 'deliveryFailed' in r ? 503 : 429 });
  return NextResponse.json({ ok: true });
}
