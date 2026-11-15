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
/**
 * The AI Question and Answer Generator and the answer-key check always run on
 * OpenAI with this model (OpenAI SDK, API key) — never the cheaper fallbacks,
 * whose answer keys can't be trusted to overrule the pool's.
 */
export const QA_MODEL = 'gpt-6.1-sol';
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

/** A file the model reads alongside the prompt (OpenAI only), e.g. a scanned PDF. */
export type AiInputFile = { filename: string; base64: string; mime: string };

type CallOpts<S extends z.ZodTypeAny> = {
  schema: S;
  name: string;
  instructions: string;
  input: string;
  webSearch?: boolean;
  file?: AiInputFile;
};

async function callProvider<S extends z.ZodTypeAny>(p: AiProvider, opts: CallOpts<S>): Promise<z.infer<S>> {
  const format = zodTextFormat(opts.schema, opts.name);
  if (p.id === 'openai') {
    const input = opts.file
      ? [
          {
            role: 'user' as const,
            content: [
              { type: 'input_file' as const, filename: opts.file.filename, file_data: `data:${opts.file.mime};base64,${opts.file.base64}` },
              { type: 'input_text' as const, text: opts.input }
            ]
          }
        ]
      : opts.input;
    const res = await new OpenAI({ apiKey: p.apiKey, maxRetries: 4, timeout: 10 * 60_000 }).responses.parse({
      model: p.model,
      instructions: opts.instructions,
      input,
      tools: opts.webSearch ? [{ type: 'web_search' }] : undefined,
      text: { format }
    });
    if (!res.output_parsed) throw new Error('no structured output');
    return res.output_parsed as z.infer<S>;
  }
  if (opts.file) throw new Error(`${p.label} cannot read files`);
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
export async function aiStructuredWithMeta<S extends z.ZodTypeAny>(opts: CallOpts<S>): Promise<{ data: z.infer<S>; provider: AiProviderId; model: string }> {
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

export async function aiStructured<S extends z.ZodTypeAny>(opts: CallOpts<S>): Promise<z.infer<S>> {
  return (await aiStructuredWithMeta(opts)).data;
}

/** The OpenAI provider pinned to QA_MODEL, or null when no OpenAI key is saved. */
export async function qaProvider(): Promise<AiProvider | null> {
  const openai = (await aiProviders()).find((p) => p.id === 'openai');
  return openai ? { ...openai, model: QA_MODEL } : null;
}

/**
 * One structured call on OpenAI QA_MODEL only (no fallback): the AI Question
 * and Answer Generator and the answer-key check. Throws when no OpenAI key is
 * saved. Returns `generatedBy`-style "openai:gpt-6.1-sol".
 */
export async function qaStructured<S extends z.ZodTypeAny>(opts: CallOpts<S>): Promise<{ data: z.infer<S>; generatedBy: string }> {
  const p = await qaProvider();
  if (!p) throw new Error('The AI Question and Answer Generator needs an OpenAI API key (admin → Settings → Credentials).');
  return { data: await callProvider(p, opts), generatedBy: `openai:${p.model}` };
}

/** True when an OpenAI API call failed on a rate or usage limit (worth waiting and retrying). */
export function isRateLimit(e: unknown): boolean {
  const status = (e as any)?.status;
  return status === 429 || /rate limit|quota/i.test(String((e as any)?.message ?? ''));
}

export type AiProviderTest = { id: AiProviderId; label: string; model: string; ok: boolean; ms: number; error?: string };

/**
 * Ping every configured provider on its own (no fallback) through the same
 * structured-output path the admin features use, so a bad key, an unknown
 * model or a usage limit shows up per provider. Admin → Settings → Credentials.
 */
export async function testAiProviders(): Promise<AiProviderTest[]> {
  const { z } = await import('zod');
  const schema = z.object({ ok: z.boolean(), sum: z.number() });
  const providers = await aiProviders();
  return Promise.all(
    providers.map(async (p): Promise<AiProviderTest> => {
      const started = Date.now();
      try {
        const out = await callProvider(p, {
          schema,
          name: 'ping',
          instructions: 'You are a health check. Answer with the JSON object only.',
          input: 'Set ok to true and sum to 2 + 3.'
        });
        if (out.sum !== 5) throw new Error(`unexpected reply ${JSON.stringify(out)}`);
        return { id: p.id, label: p.label, model: p.model, ok: true, ms: Date.now() - started };
      } catch (e: any) {
        const status = e?.status ? `HTTP ${e.status}: ` : '';
        return { id: p.id, label: p.label, model: p.model, ok: false, ms: Date.now() - started, error: `${status}${String(e?.message ?? e).slice(0, 300)}` };
      }
    })
  );
}
