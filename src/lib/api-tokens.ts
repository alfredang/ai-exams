import crypto from 'node:crypto';
import { db } from '@/lib/db';

const PREFIX = 'examnova_';

export const API_TOKEN_FLASH_COOKIE = 'examnova_api_token_flash';

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function generateApiToken(): { raw: string; prefix: string; hashed: string } {
  const random = crypto.randomBytes(24).toString('base64url');
  const raw = `${PREFIX}${random}`;
  return { raw, prefix: raw.slice(0, 16), hashed: hashToken(raw) };
}

/** Resolve an inbound bearer token to a non-revoked ApiToken row. */
export async function lookupApiToken(rawToken: string) {
  const hashed = hashToken(rawToken);
  const t = await db.apiToken.findUnique({ where: { hashedToken: hashed } });
  if (!t || t.revokedAt) return null;
  if (t.expiresAt && t.expiresAt < new Date()) return null;
  await db.apiToken.update({ where: { id: t.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  return t;
}
