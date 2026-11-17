import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, Role } from '@prisma/client';
import { db } from '@/lib/db';
import { isSuperAdmin } from '@/lib/auth';
import { apiError, requireApiToken, SCOPE_DB_WRITE, SCOPE_USERS_ROLE, SCOPE_USERS_WRITE } from '@/lib/api-v1';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  nationality: true,
  emailVerified: true,
  passwordSetupRequired: true,
  anonymizedAt: true,
  createdAt: true
} satisfies Prisma.UserSelect;

/** `users:write`, or a `db:write` token (it can already edit these columns). */
async function requireUsersToken(req: Request) {
  let auth = await requireApiToken(req, SCOPE_USERS_WRITE);
  if (auth.response?.status === 403) auth = await requireApiToken(req, SCOPE_DB_WRITE);
  return auth;
}

/** GET ?email= | ?id= → one user; ?q= → up to 20 matches on email or name. */
export async function GET(req: Request) {
  const auth = await requireUsersToken(req);
  if (auth.response) return auth.response;
  const url = new URL(req.url);
  const email = (url.searchParams.get('email') || '').toLowerCase().trim();
  const id = (url.searchParams.get('id') || '').trim();
  const q = (url.searchParams.get('q') || '').trim();
  if (email || id) {
    const user = await db.user.findUnique({ where: email ? { email } : { id }, select: SELECT });
    return user ? NextResponse.json({ user }) : apiError('No user matches', 404);
  }
  if (q.length < 2) return apiError('Pass ?email=, ?id= or ?q= (2+ characters)', 400);
  const users = await db.user.findMany({
    where: { OR: [{ email: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: SELECT
  });
  return NextResponse.json({ users });
}

const Body = z
  .object({
    email: z.string().email().optional(),
    id: z.string().min(1).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    nationality: z.string().trim().max(80).nullable().optional(),
    active: z.boolean().optional(),
    emailVerified: z.boolean().optional(),
    passwordSetupRequired: z.boolean().optional(),
    role: z.nativeEnum(Role).optional(),
    dryRun: z.boolean().optional()
  })
  .strict()
  .refine((b) => Boolean(b.email) !== Boolean(b.id), { message: 'Pass exactly one of email or id' });

/**
 * PATCH { email | id, name?, nationality?, active?, emailVerified?,
 * passwordSetupRequired?, role?, dryRun? } → { user, changed[] }.
 *
 * Profile fields need `users:write` (a `db:write` token is accepted). A
 * `role` change is the same power as Admin → Admins, so it needs the
 * explicit `users:role` scope on a token minted by the super admin; `*` and
 * `db:write` never imply it. The super admin and the token's own issuer can't
 * be demoted or suspended here. Audited as the token's admin, `via: 'api'`.
 */
export async function PATCH(req: Request) {
  const auth = await requireUsersToken(req);
  if (auth.response) return auth.response;
  const rl = rateLimit(`api-v1:users:${auth.token.id}`, 30, 60_000);
  if (!rl.ok) return apiError('Too many requests', 429, { retryAfter: rl.retryAfter });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return apiError('Invalid body', 400, { issues: parsed.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`) });
  }
  const { email, id, dryRun, ...fields } = parsed.data;
  const user = await db.user.findUnique({
    where: email ? { email: email.toLowerCase().trim() } : { id: id! },
    select: SELECT
  });
  if (!user) return apiError('No user matches', 404);
  if (user.anonymizedAt) return apiError('This account is anonymised and cannot be edited', 409);

  const data: Prisma.UserUpdateInput = {};
  const changed: string[] = [];
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};
  const set = (key: string, from: unknown, to: unknown, apply: () => void) => {
    if (from === to) return;
    changed.push(key);
    before[key] = from;
    after[key] = to;
    apply();
  };

  if (fields.name !== undefined) set('name', user.name, fields.name, () => (data.name = fields.name));
  if (fields.nationality !== undefined) {
    const value = fields.nationality || null;
    set('nationality', user.nationality, value, () => (data.nationality = value));
  }
  if (fields.passwordSetupRequired !== undefined) {
    set('passwordSetupRequired', user.passwordSetupRequired, fields.passwordSetupRequired, () => (data.passwordSetupRequired = fields.passwordSetupRequired));
  }
  if (fields.emailVerified !== undefined) {
    set('emailVerified', Boolean(user.emailVerified), fields.emailVerified, () => (data.emailVerified = fields.emailVerified ? new Date() : null));
  }
  const protectedAccount = isSuperAdmin(user.email) || user.id === auth.adminId;
  if (fields.active !== undefined) {
    if (!fields.active && protectedAccount) return apiError('This account cannot be suspended through the API', 403);
    set('active', user.active, fields.active, () => (data.active = fields.active));
  }
  if (fields.role !== undefined && fields.role !== user.role) {
    const roleAuth = await requireApiToken(req, SCOPE_USERS_ROLE);
    if (roleAuth.response) return roleAuth.response;
    const issuer = await db.user.findUnique({ where: { id: roleAuth.adminId }, select: { email: true } });
    if (!isSuperAdmin(issuer?.email)) return apiError('Only a token minted by the super admin can change roles', 403);
    if (protectedAccount) return apiError("This account's role cannot be changed through the API", 403);
    set('role', user.role, fields.role, () => (data.role = fields.role));
  }
  // A suspension or role change must end the sessions signed under the old state.
  if (changed.includes('role') || (changed.includes('active') && fields.active === false)) {
    data.sessionVersion = { increment: 1 };
  }

  if (!changed.length || dryRun) return NextResponse.json({ ok: true, dryRun: Boolean(dryRun), changed, user });

  const [updated] = await db.$transaction([
    db.user.update({ where: { id: user.id }, data, select: SELECT }),
    db.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: changed.includes('role') ? (after.role === 'USER' ? 'user.demote' : 'user.promote') : 'user.update',
        targetType: 'User',
        targetId: user.id,
        metadata: JSON.parse(JSON.stringify({ via: 'api', tokenId: auth.token.id, email: user.email, before, after }))
      }
    })
  ]);
  return NextResponse.json({ ok: true, dryRun: false, changed, user: updated });
}
