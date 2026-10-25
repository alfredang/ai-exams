import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import type { z } from 'zod';
import { getSetting } from '@/lib/settings';

/**
 * AI providers for admin features (question generation, Find official page,
 * SEO and FAQ assist), tried in order until one answers:
 *
 *   1. OpenAI   — OPENAI_API_KEY + OPENAI_MODEL (Responses API, strict
 *                 structured output, web search). Sign in with ChatGPT (plan
 *                 usage) replaces the key once OpenAI approves this hosted app.
 *   2. DeepSeek — DEEPSEEK_API_KEY, model `deepseek-flash` (V4.1 Flash).
 *   3. MiniMax  — MINIMAX_API_KEY, model `MiniMax-M3.1-Flash`.
 *
 * Keys are runtime settings (admin → Settings → Credentials), never env vars.
 * The fallbacks are OpenAI-compatible Chat Completions endpoints; their JSON
 * is still validated against the caller's zod schema.
 */
export const DEFAULT_OPENAI_MODEL = 'gpt-6.1-sol';
export const DEEPSEEK_MODEL = 'deepseek-flash';
export const MINIMAX_MODEL = 'MiniMax-M3.1-Flash';

export type AiProviderId = 'openai' | 'deepseek' | 'minimax';
export type AiProvider = { id: AiProviderId; label: string; model: string; apiKey: string; webSearch: boolean };

/** The configured providers, in fallback order. Empty when no key is set. */
export async function aiProviders(): Promise<AiProvider[]> {
  const [openaiKey, openaiModel, deepseekKey, minimaxKey] = await Promise.all([
    getSetting('OPENAI_API_KEY'),
    getSetting('OPENAI_MODEL'),
    getSetting('DEEPSEEK_API_KEY'),
    getSetting('MINIMAX_API_KEY')
  ]);
  const out: AiProvider[] = [];
  if (openaiKey) out.push({ id: 'openai', label: 'OpenAI', model: openaiModel.trim() || DEFAULT_OPENAI_MODEL, apiKey: openaiKey, webSearch: true });
  if (deepseekKey) out.push({ id: 'deepseek', label: 'DeepSeek', model: DEEPSEEK_MODEL, apiKey: deepseekKey, webSearch: false });
  if (minimaxKey) out.push({ id: 'minimax', label: 'MiniMax', model: MINIMAX_MODEL, apiKey: minimaxKey, webSearch: false });
  return out;
}

/** "OpenAI gpt-6.1-sol → DeepSeek deepseek-flash", for admin UI copy. */
export function providerChainLabel(providers: AiProvider[]): string {
  return providers.map((p) => `${p.label} ${p.model}`).join(' → ');
}

const BASE_URL: Record<Exclude<AiProviderId, 'openai'>, string> = {
  deepseek: 'https://api.deepseek.com',
  minimax: 'https://api.minimax.io/v1'
};

/** Pull the JSON object out of a chat reply (drops <think> blocks and fences). */
export function extractJsonObject(text: string): unknown {
  const t = text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```(?:json)?/gi, '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('reply contained no JSON object');
  return JSON.parse(t.slice(start, end + 1));
}

async function callProvider<S extends z.ZodTypeAny>(
  p: AiProvider,
  opts: { schema: S; name: string; instructions: string; input: string; webSearch?: boolean }
): Promise<z.infer<S>> {
  const format = zodTextFormat(opts.schema, opts.name);
  if (p.id === 'openai') {
    const res = await new OpenAI({ apiKey: p.apiKey }).responses.parse({
      model: p.model,
      instructions: opts.instructions,
      input: opts.input,
      tools: opts.webSearch ? [{ type: 'web_search' }] : undefined,
      text: { format }
    });
    if (!res.output_parsed) throw new Error('no structured output');
    return res.output_parsed as z.infer<S>;
  }
  const client = new OpenAI({ apiKey: p.apiKey, baseURL: BASE_URL[p.id] });
  const res = await client.chat.completions.create({
    model: p.model,
    messages: [
      {
        role: 'system',
        content: `${opts.instructions}\n\nReply with ONE JSON object only — no prose, no markdown fences — matching this JSON Schema:\n${JSON.stringify(format.schema)}`
      },
      { role: 'user', content: opts.input }
    ],
    // DeepSeek's JSON mode; MiniMax relies on the instruction above.
    ...(p.id === 'deepseek' ? { response_format: { type: 'json_object' as const } } : {})
  });
  const text = res.choices[0]?.message?.content ?? '';
  return opts.schema.parse(extractJsonObject(text));
}

/**
 * One structured call, parsed and validated against `schema`, trying each
 * configured provider in turn. `webSearch` calls only go to providers that can
 * browse (OpenAI) — the others would guess URLs. Returns which provider answered.
 */
export async function aiStructuredWithMeta<S extends z.ZodTypeAny>(opts: {
  schema: S;
  name: string;
  instructions: string;
  input: string;
  webSearch?: boolean;
}): Promise<{ data: z.infer<S>; provider: AiProviderId; model: string }> {
  const all = await aiProviders();
  if (!all.length) throw new Error('No AI provider configured (admin → Settings → Credentials).');
  const providers = opts.webSearch ? all.filter((p) => p.webSearch) : all;
  if (!providers.length) throw new Error('Web search needs the OpenAI provider (admin → Settings → Credentials).');
  const errors: string[] = [];
  for (const p of providers) {
    try {
      return { data: await callProvider(p, opts), provider: p.id, model: p.model };
    } catch (e: any) {
      errors.push(`${p.label}: ${e?.message ?? e}`);
    }
  }
  throw new Error(`All AI providers failed — ${errors.join(' | ')}`);
}

export async function aiStructured<S extends z.ZodTypeAny>(opts: {
  schema: S;
  name: string;
  instructions: string;
  input: string;
  webSearch?: boolean;
}): Promise<z.infer<S>> {
  return (await aiStructuredWithMeta(opts)).data;
}
