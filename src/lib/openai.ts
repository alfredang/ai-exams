import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import type { z } from 'zod';
import { getSetting } from '@/lib/settings';

/**
 * OpenAI client for admin AI features (question generation, AI Assist).
 * The key and model are runtime settings (admin → Settings → Credentials),
 * never env vars, so they can change without a rebuild.
 */
export const DEFAULT_OPENAI_MODEL = 'gpt-6.1-sol';

export async function getOpenAI(): Promise<{ client: OpenAI; model: string }> {
  const [apiKey, model] = await Promise.all([getSetting('OPENAI_API_KEY'), getSetting('OPENAI_MODEL')]);
  if (!apiKey) throw new Error('OpenAI API key not configured (admin → Settings → Credentials).');
  return { client: new OpenAI({ apiKey }), model: model.trim() || DEFAULT_OPENAI_MODEL };
}

/** One Responses API call whose output is parsed and validated against `schema`. */
export async function aiStructured<S extends z.ZodTypeAny>(opts: {
  schema: S;
  name: string;
  instructions: string;
  input: string;
  webSearch?: boolean;
}): Promise<z.infer<S>> {
  const { client, model } = await getOpenAI();
  const res = await client.responses.parse({
    model,
    instructions: opts.instructions,
    input: opts.input,
    tools: opts.webSearch ? [{ type: 'web_search' }] : undefined,
    text: { format: zodTextFormat(opts.schema, opts.name) }
  });
  if (!res.output_parsed) throw new Error('OpenAI returned no structured output.');
  return res.output_parsed as z.infer<S>;
}
