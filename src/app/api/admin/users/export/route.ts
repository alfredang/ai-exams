import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { buildUserWhere } from '@/lib/admin-user-filters';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Streamed CSV export of the filtered user list. Mirrors the same filters
 * as /admin-dashboard/users so admins get exactly what they see on screen.
 */
export async function GET(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const sp = new URL(req.url).searchParams;
  const q = (sp.get('q') || '').trim();
  const status = sp.get('status') || '';
  const tagSlug = (sp.get('tag') || '').trim();
  const fromStr = (sp.get('from') || '').trim();
  const toStr = (sp.get('to') || '').trim();

  const where = buildUserWhere({ q, status, tag: tagSlug, from: fromStr, to: toStr });

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { orders: true, entitlements: true, attempts: true } }
    },
    // We don't paginate the export — admins can refine filters first.
    take: 50_000
  });

  const header = [
    'id',
    'email',
    'name',
    'role',
    'active',
    'anonymizedAt',
    'nationality',
    'tags',
    'orders',
    'entitlements',
    'attempts',
    'joinedAt'
  ];
  const lines = [header.join(',')];
  for (const u of users) {
    lines.push(
      [
        u.id,
        csv(u.email),
        csv(u.name ?? ''),
        u.role,
        u.active ? 'true' : 'false',
        u.anonymizedAt ? u.anonymizedAt.toISOString() : '',
        csv(u.nationality ?? ''),
        csv(u.tags.map((t) => t.tag.slug).join('|')),
        u._count.orders,
        u._count.entitlements,
        u._count.attempts,
        u.createdAt.toISOString()
      ].join(',')
    );
  }
  const body = lines.join('\n');
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}

function csv(v: string): string {
  if (!v) return '';
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
