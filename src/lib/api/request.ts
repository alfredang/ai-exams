import { NextResponse } from 'next/server';
import type { TypeOf, ZodTypeAny } from 'zod';

export type JsonBodyResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

export async function parseJsonBody<TSchema extends ZodTypeAny>(
  req: Request,
  schema: TSchema
): Promise<JsonBodyResult<TypeOf<TSchema>>> {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.issues },
        { status: 400 }
      )
    };
  }
  return { ok: true, data: parsed.data };
}
