import { z } from 'zod';
import { aiStructured } from '@/lib/openai';

const Schema = z.object({
  title: z.string().min(10).max(120),
  description: z.string().min(40).max(320),
  keywords: z.string().min(5).max(500)
});
export type SeoMeta = z.infer<typeof Schema>;

const SYSTEM = `You write SEO meta for an exam-prep platform called Tertiary Exams.
- title: 50-70 chars, includes the exam code if relevant
- description: 120-180 chars, friendly + factual, mentions practice + free teaser
- keywords: comma-separated, 5-10 terms, no quotes`;

// Unconstrained shape for structured output; Schema above enforces lengths.
const OutputSchema = z.object({ title: z.string(), description: z.string(), keywords: z.string() });

export async function generateSeoForExam(input: {
  vendor: string;
  code: string;
  title: string;
  description?: string | null;
  domains?: { name: string; weight: number }[];
}): Promise<SeoMeta> {
  const prompt = `Generate SEO meta for this exam:
Vendor: ${input.vendor}
Code: ${input.code}
Title: ${input.title}
${input.description ? `Description: ${input.description}\n` : ''}${input.domains?.length ? `Domains: ${input.domains.map((d) => d.name).join(', ')}\n` : ''}`;
  const raw = await aiStructured({ schema: OutputSchema, name: 'seo_meta', instructions: SYSTEM, input: prompt });
  const parsed = Schema.safeParse(raw);
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
