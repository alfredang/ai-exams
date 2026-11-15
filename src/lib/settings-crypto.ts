// AES-256-GCM for the Setting table. Kept free of path aliases and Prisma so
// prisma/seed.ts can import it: the boot seed must never fail on a missing module.
import crypto from 'node:crypto';

// Derived once per secret: decrypting ~80 settings used to hash it ~80 times.
let derived: { src: string; key: Buffer } | null = null;
function key(): Buffer {
  const src = process.env.SETTINGS_KEY || process.env.NEXTAUTH_SECRET || 'dev-fallback-secret';
  if (derived?.src !== src) derived = { src, key: crypto.createHash('sha256').update(src).digest() };
  return derived.key;
}

export function encrypt(plain: string): string {
  if (!plain) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decrypt(stored: string): string {
  if (!stored) return '';
  if (!stored.startsWith('v1:')) return stored;
  const [, ivB, tagB, encB] = stored.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(encB, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}
