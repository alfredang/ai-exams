import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseJsonBody } from '../api/request';

const Body = z.object({ email: z.string().email() });

describe('parseJsonBody', () => {
  it('returns parsed data for valid JSON bodies', async () => {
    const result = await parseJsonBody(
      new Request('http://test.local', {
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com' })
      }),
      Body
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.email).toBe('user@example.com');
  });

  it('returns a 400 response for malformed JSON', async () => {
    const result = await parseJsonBody(
      new Request('http://test.local', {
        method: 'POST',
        body: '{'
      }),
      Body
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toMatchObject({ error: 'Invalid request body' });
    }
  });
});
