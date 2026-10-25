import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyCaptcha } from '@/lib/captcha';
import { clientIp } from '@/lib/client-ip';
import { rateLimit } from '@/lib/ratelimit';
import { rateLimitEmailKey } from '@/lib/email-guard';
import { notify } from '@/lib/admin-notifications';
import { sendEnquiryAlertEmail } from '@/lib/mail';
import { ENQUIRY_TOPIC_IDS, enquiryTopicLabel } from '@/lib/enquiry-topics';

const Body = z.object({
  topic: z.enum(ENQUIRY_TOPIC_IDS),
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d][\d\s()-]{5,}$/, 'Please enter a valid phone number.')
    .optional()
    .or(z.literal('')),
  preferWhatsApp: z.boolean().optional(),
  certification: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, 'Please tell us a little more (10+ characters).').max(4000),
  // Same bot tells as the OTP forms (see useCaptcha()).
  captchaToken: z.string().max(4096).nullish(),
  hp: z.string().max(500).optional(),
  elapsedMs: z.number().nonnegative().optional()
});

const MIN_FILL_MS = 3000;
const HOUR = 60 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  // JSON only: blocks cross-site form posts, which can't set this type
  // without a CORS preflight.
  if (!(req.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'Expected application/json' }, { status: 415 });
  }
  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message || 'Invalid input', field: first?.path[0] ?? null },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Looks like a bot: answer like a success, store and send nothing.
  if (data.hp || (data.elapsedMs !== undefined && data.elapsedMs < MIN_FILL_MS)) {
    return NextResponse.json({ ok: true });
  }

  if (!(await verifyCaptcha(data.captchaToken, ip, req.headers))) {
    return NextResponse.json({ error: 'Please complete the "verify you are human" check and try again.', captcha: true }, { status: 400 });
  }

  const email = data.email.toLowerCase();
  const byIp = rateLimit(`enquiry:ip:${ip}`, 5, HOUR);
  const byEmail = rateLimit(`enquiry:email:${rateLimitEmailKey(email)}`, 3, HOUR);
  if (!byIp.ok || !byEmail.ok) {
    return NextResponse.json(
      { error: 'We already have your enquiry — our team will be in touch shortly. For anything urgent, message us on WhatsApp.' },
      { status: 429 }
    );
  }

  const phone = data.phone || null;
  const enquiry = await db.enquiry.create({
    data: {
      topic: data.topic,
      name: data.name,
      email,
      phone,
      preferWhatsApp: !!(data.preferWhatsApp && phone),
      certification: data.certification || null,
      message: data.message,
      ip: ip === 'unknown' ? null : ip
    }
  });

  const topic = enquiryTopicLabel(enquiry.topic);
  await notify({
    kind: 'enquiry.new',
    title: `New enquiry — ${topic} — ${enquiry.name}`,
    body: `${enquiry.email}${enquiry.certification ? ` · ${enquiry.certification}` : ''} · ${enquiry.message.slice(0, 200)}`,
    link: '/admin-dashboard/enquiries'
  });
  // The row is the record of truth; a mail outage must not fail the form.
  await sendEnquiryAlertEmail({ ...enquiry, topic }).catch((err) => {
    console.error('enquiry alert email failed', enquiry.id, err);
  });

  return NextResponse.json({ ok: true });
}
