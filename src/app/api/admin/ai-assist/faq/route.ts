import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/permissions';
import { aiStructured } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('generate'),
    topic: z.string().min(2).max(500),
    count: z.number().int().min(1).max(15).default(6),
    existing: z.array(z.object({ question: z.string(), answer: z.string() })).optional()
  }),
  z.object({
    mode: z.literal('rewrite'),
    question: z.string().min(2).max(300),
    answer: z.string().optional().default(''),
    instruction: z.string().min(2).max(500)
  })
]);

const GENERATE_SYSTEM = `You write FAQ entries for an exam-prep SaaS called Tertiary Exams.
Tertiary Exams sells original practice questions for IT certifications (AWS, Microsoft, Cisco,
CompTIA, Google Cloud, etc.), free teasers per exam, Practice Mode + timed Exam Mode,
and discounted real-exam vouchers.

Output a JSON object: { "items": [{ "question": "...", "answer": "..." }, ...] }.
- Each question is a customer-facing question (≤120 chars).
- Each answer is plain text, 1-3 sentences, customer-friendly and specific.
- Use {{TEASER_N}} as a placeholder for the teaser-question count when relevant.
- Do NOT duplicate questions already provided.
- Do NOT include markdown fences. Do NOT include any prose outside the JSON.`;

const GenerateSchema = z.object({ items: z.array(z.object({ question: z.string(), answer: z.string() })) });
const RewriteSchema = z.object({ answer: z.string() });

const REWRITE_SYSTEM = `You rewrite a single FAQ answer for an exam-prep SaaS.

Output ONLY a JSON object: { "answer": "..." }
- Plain text. 1-3 sentences. Customer-friendly and specific.
- Use {{TEASER_N}} as the placeholder for the teaser-question count if relevant.
- No markdown fences, no prose outside the JSON.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  try {
    const body = Body.parse(await req.json());

    if (body.mode === 'generate') {
      const existingList = (body.existing ?? [])
        .map((e, i) => `${i + 1}. Q: ${e.question}\n   A: ${e.answer.slice(0, 200)}`)
        .join('\n');
      const userMsg = `Topic / focus: ${body.topic}
Number of new FAQ entries to write: ${body.count}

${existingList ? `Existing FAQs (do NOT duplicate):\n${existingList}\n` : ''}
Respond with the JSON object now.`;
      const { items: arr } = await aiStructured({ schema: GenerateSchema, name: 'faq_entries', instructions: GENERATE_SYSTEM, input: userMsg });
      const items = arr
        .filter((x: any) => x && typeof x.question === 'string' && typeof x.answer === 'string')
        .map((x: any) => ({ question: String(x.question).trim(), answer: String(x.answer).trim() }))
        .filter((x: { question: string; answer: string }) => x.question.length >= 4 && x.answer.length >= 4);
      return NextResponse.json({ ok: true, items });
    }

    // mode === 'rewrite'
    const userMsg = `Question: ${body.question}
${body.answer ? `Current answer: ${body.answer}\n` : ''}
Writer brief: ${body.instruction}

Respond with the JSON object now.`;
    const obj = await aiStructured({ schema: RewriteSchema, name: 'faq_answer', instructions: REWRITE_SYSTEM, input: userMsg });
    const answer = obj && typeof obj.answer === 'string' ? obj.answer.trim() : '';
    if (!answer) {
      return NextResponse.json({ ok: false, error: 'The AI returned no answer.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, answer });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
