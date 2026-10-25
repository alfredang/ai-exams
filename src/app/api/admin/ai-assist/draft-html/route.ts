import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/permissions';
import { aiStructured } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  prompt: z.string().min(2).max(2000),
  context: z.object({
    kind: z.enum(['email', 'page']),
    subject: z.string().optional(),
    title: z.string().optional(),
    currentHtml: z.string().optional()
  })
});

const EMAIL_SYSTEM = `You draft transactional email HTML for an exam-prep SaaS.

Rules:
- Output ONLY the HTML body (no <html>, <head>, or <body> wrapper). The host
  template wraps it in branded chrome.
- Use inline CSS only (Gmail strips <style>). Stick to safe properties:
  color, font-size, line-height, padding, margin, border, border-radius,
  background, text-decoration.
- Use Handlebars expressions for personalization where appropriate:
  {{firstName}}, {{productName}}, {{orderId}}, {{appUrl}}, {{brand.name}},
  {{brand.supportEmail}}, {{brand.primaryColor}}. Wrap conditional sections
  in {{#if ...}}...{{/if}}.
- Keep it concise — 2-4 short paragraphs max, plus a primary CTA button.
- A primary action button should use background:{{brand.primaryColor}} and
  white text, padding:10px 16px, border-radius:8px, text-decoration:none.
- Do NOT invent unsubscribe links or footers — the host template adds them.`;

const PAGE_SYSTEM = `You draft body HTML for a public marketing/legal page on an exam-prep SaaS.

Rules:
- Output ONLY the inner HTML for the article body (no <html>, <head>, or
  <body> wrapper, no <h1> — the page renders its own H1 from the title).
- Structure with <h2> section headings (use inline style margin:24px 0 8px;
  font-size:1.25rem;font-weight:600) and <p> paragraphs (margin:0 0 12px;
  line-height:1.7).
- Use the {{TEASER_N}} placeholder when referring to the free teaser size
  (renderer substitutes the configured value at view time).
- Keep tone clear, professional, and skimmable. Use bullet lists for
  enumerations.`;

function extractHtml(text: string): string {
  // Strip markdown fences if the model wrapped the answer.
  let t = text.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // If the model still emitted a paragraph of prose before the HTML,
  // try to grab from the first tag onward.
  const lt = t.indexOf('<');
  if (lt > 0) t = t.slice(lt);
  return t.trim();
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdminRole((session?.user as any)?.role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  try {
    const { prompt, context } = Body.parse(await req.json());

    const systemPrompt = context.kind === 'email' ? EMAIL_SYSTEM : PAGE_SYSTEM;
    const contextLines = [
      context.kind === 'email' && context.subject ? `Email subject: ${context.subject}` : '',
      context.kind === 'page' && context.title ? `Page title: ${context.title}` : '',
      context.currentHtml
        ? `\nExisting body (revise this if relevant; otherwise replace):\n${context.currentHtml.slice(0, 12_000)}`
        : ''
    ].filter(Boolean).join('\n');

    const userMsg = `${contextLines}\n\nWriter brief:\n${prompt}\n\nRespond with a JSON object { "html": "<the HTML body>" }.`;

    const { html: text } = await aiStructured({ schema: z.object({ html: z.string() }), name: 'html_body', instructions: systemPrompt, input: userMsg });
    const html = extractHtml(text);
    if (!html || html.length < 20) {
      return NextResponse.json({ ok: false, error: 'The AI returned no usable HTML' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, html });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
