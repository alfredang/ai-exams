import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueOtp } from '@/lib/otp';
import { verifyCaptcha } from '@/lib/captcha';
import { clientIp } from '@/lib/client-ip';
import { checkSignupEmail } from '@/lib/email-guard';

const Body = z.object({
  email: z.string().email(),
  purpose: z.enum(['LOGIN', 'REGISTER', 'RESET', 'TEASER_GATE']),
  captchaToken: z.string().max(4096).nullish(),
  // Bot tells from the web forms: a hidden field people never see, and how
  // long the form was open before submit. Both optional for API callers.
  hp: z.string().max(500).optional(),
  elapsedMs: z.number().nonnegative().optional()
});

const MIN_FILL_MS = 2000;

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  // JSON only: blocks cross-site form posts, which can't set this type
  // without a CORS preflight.
  if (!(req.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'Expected application/json' }, { status: 415 });
  }
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

  // Looks like a bot: answer exactly like a success so it learns nothing,
  // but send no email.
  if (data.hp || (data.elapsedMs !== undefined && data.elapsedMs < MIN_FILL_MS)) {
    return NextResponse.json({ ok: true });
  }

  // Every email-code request is a bot target (signup spam, inbox bombing),
  // so all purposes pass the CAPTCHA. No-op until the Turnstile keys are set.
  if (!(await verifyCaptcha(data.captchaToken, ip, req.headers))) {
    return NextResponse.json({ error: 'Please complete the "verify you are human" check and try again.', captcha: true }, { status: 400 });
  }

  // REGISTER / TEASER_GATE can create an account — screen new addresses
  // for disposable or undeliverable domains. Existing users pass through.
  if (data.purpose === 'REGISTER' || data.purpose === 'TEASER_GATE') {
    const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase().trim() }, select: { id: true } });
    if (!existing) {
      const check = await checkSignupEmail(data.email);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
    }
  }

  const r = await issueOtp(data.email, data.purpose, ip);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 'deliveryFailed' in r ? 503 : 429 });
  return NextResponse.json({ ok: true });
}
