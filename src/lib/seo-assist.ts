import { query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { getSetting } from '@/lib/settings';

const Schema = z.object({
  title: z.string().min(10).max(120),
  description: z.string().min(40).max(320),
  keywords: z.string().min(5).max(500)
});
export type SeoMeta = z.infer<typeof Schema>;

const SYSTEM = `You write SEO meta for an exam-prep platform called Tertiary Exams.
- title: 50-70 chars, includes the exam code if relevant
- description: 120-180 chars, friendly + factual, mentions practice + free teaser
- keywords: comma-separated, 5-10 terms, no quotes
Respond with ONLY a JSON object {"title":"...","description":"...","keywords":"..."}.`;

export async function generateSeoForExam(input: {
  vendor: string;
  code: string;
  title: string;
  description?: string | null;
  domains?: { name: string; weight: number }[];
}): Promise<SeoMeta> {
  const storedKey = await getSetting('ANTHROPIC_API_KEY');
  if (storedKey && !process.env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = storedKey;

  const prompt = `Generate SEO meta for this exam:
Vendor: ${input.vendor}
Code: ${input.code}
Title: ${input.title}
${input.description ? `Description: ${input.description}\n` : ''}${input.domains?.length ? `Domains: ${input.domains.map((d) => d.name).join(', ')}\n` : ''}
Return JSON only.`;
  const result = query({
    prompt,
    options: { systemPrompt: SYSTEM, model: 'claude-sonnet-4-6', maxTurns: 1 } as any
  });
  let text = '';
  for await (const msg of result) {
    if (msg.type === 'assistant') {
      for (const b of (msg as any).message.content) if (b.type === 'text') text += b.text;
    } else if (msg.type === 'result' && (msg as any).result && !text) {
      text = (msg as any).result;
    }
  }
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON returned');
  const parsed = Schema.safeParse(JSON.parse(cleaned.slice(start, end + 1)));
  if (!parsed.success) throw new Error(`Invalid SEO payload: ${parsed.error.issues[0]?.message}`);
  // Trim to recommended SEO limits AFTER parsing — preserves the AI output
  // intent while keeping stored values within search-engine display caps.
  const data = parsed.data;
  return {
    title: data.title.slice(0, 70).trim(),
    description: data.description.slice(0, 180).trim(),
    keywords: data.keywords.slice(0, 200).trim()
  };
}
