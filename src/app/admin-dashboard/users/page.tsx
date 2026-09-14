import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { buildUserWhere, validUserDate } from '@/lib/admin-user-filters';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { Badge } from '@/components/admin/badge';
import { buildQS } from '@/components/admin/qs';
import { Download, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  q?: string;
  status?: string;
  tag?: string;
  from?: string;
  to?: string;
  page?: string;
  createError?: string;
}>;

async function createUser(formData: FormData) {
  'use server';
  const session = await auth();
  const actorId = (session?.user as { id?: string } | undefined)?.id;
  if (!actorId) redirect('/login');
  const actor = await db.user.findUnique({ where: { id: actorId }, select: { id: true, role: true, active: true } });
  if (!actor?.active || actor.role !== 'ADMIN') redirect('/');

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const name = String(formData.get('name') || '').trim() || 'user';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 || name.length > 200) {
    redirect('/admin-dashboard/users?createError=invalid');
  }

  let userId: string;
  try {
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { email, name, role: 'USER', passwordSetupRequired: true } });
      await tx.adminLog.create({ data: { adminId: actor.id, action: 'user.create', targetType: 'User', targetId: created.id } });
      return created;
    });
    userId = user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      redirect('/admin-dashboard/users?createError=exists');
    }
    throw error;
  }
  redirect(`/admin-dashboard/users/${userId}`);
}

type UserRow = Awaited<ReturnType<typeof loadUsers>>[number];

async function loadUsers(where: Prisma.UserWhereInput, skip: number, take: number) {
  return db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      tags: { include: { tag: true } },
      _count: { select: { orders: true, entitlements: true, attempts: true } }
    }
  });
}

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await auth();
  const canCreateUser = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';
  const q = (sp.q || '').trim();
  const status = ['active', 'suspended', 'anonymized', 'unverified'].includes(sp.status || '') ? sp.status || '' : '';
  const tagSlug = (sp.tag || '').trim();
  const fromStr = validUserDate((sp.from || '').trim()) ? (sp.from || '').trim() : '';
  const toStr = validUserDate((sp.to || '').trim()) ? (sp.to || '').trim() : '';
  const requestedPage = Math.max(1, Math.trunc(Number(sp.page) || 1));

  const where = buildUserWhere({ q, status, tag: tagSlug, from: fromStr, to: toStr });
  const [total, tags] = await Promise.all([
    db.user.count({ where }),
    db.tag.findMany({ orderBy: { label: 'asc' } })
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const users = await loadUsers(where, (page - 1) * PAGE_SIZE, PAGE_SIZE);

  const baseParams = { q, status, tag: tagSlug, from: fromStr, to: toStr };
  const buildHref = (p: number) =>
    `/admin-dashboard/users${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const activeFilters = [
    q && { key: 'search', label: q, clearHref: `/admin-dashboard/users${buildQS({ ...baseParams, q: undefined })}` },
    status && { key: 'status', label: status, clearHref: `/admin-dashboard/users${buildQS({ ...baseParams, status: undefined })}` },
    tagSlug && { key: 'tag', label: tags.find((t) => t.slug === tagSlug)?.label ?? tagSlug, clearHref: `/admin-dashboard/users${buildQS({ ...baseParams, tag: undefined })}` },
    fromStr && { key: 'from', label: fromStr, clearHref: `/admin-dashboard/users${buildQS({ ...baseParams, from: undefined })}` },
    toStr && { key: 'to', label: toStr, clearHref: `/admin-dashboard/users${buildQS({ ...baseParams, to: undefined })}` }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const exportHref = `/api/admin/users/export${buildQS(baseParams)}`;

  const columns: Column<UserRow>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (u) => (
        <Link href={`/admin-dashboard/users/${u.id}`} className="font-medium text-slate-900 hover:underline dark:text-slate-100">
          {u.name || <span className="text-slate-400">—</span>}
        </Link>
      )
    },
    {
      key: 'email',
      header: 'Email',
      cell: (u) => <span className="text-[12px] text-slate-700 dark:text-slate-200">{u.email}</span>
    },
    {
      key: 'tags',
      header: 'Tags',
      cell: (u) =>
        u.tags.length === 0 ? (
          <span className="text-slate-400">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {u.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/admin-dashboard/users${buildQS({ ...baseParams, tag: tag.slug, page: undefined })}`}
                className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700 hover:bg-blue-100 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={u.anonymizedAt ? 'muted' : u.active ? 'success' : 'danger'}>
            {u.anonymizedAt ? 'ANON' : u.active ? 'ACTIVE' : 'SUSPENDED'}
          </Badge>
          {!u.emailVerified && !u.anonymizedAt && <Badge variant="muted">EMAIL UNVERIFIED</Badge>}
        </div>
      )
    },
    {
      key: 'orders',
      header: 'Orders',
      align: 'right',
      cell: (u) => <span className="font-mono text-[11px]">{u._count.orders}</span>
    },
    {
      key: 'entitlements',
      header: 'Ents',
      align: 'right',
      cell: (u) => <span className="font-mono text-[11px]">{u._count.entitlements}</span>
    },
    {
      key: 'attempts',
      header: 'Attempts',
      align: 'right',
      cell: (u) => <span className="font-mono text-[11px]">{u._count.attempts}</span>
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: (u) => <span className="text-[11px] text-slate-500">{u.createdAt.toISOString().slice(0, 10)}</span>
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      headerClassName: 'w-12',
      cell: (u) => (
        <Link href={`/admin-dashboard/users/${u.id}`} title="View" className="icon-btn">
          <Eye className="h-3.5 w-3.5" />
        </Link>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${total} user${total === 1 ? '' : 's'}${pages > 1 ? ` · page ${page} of ${pages}` : ''}`}
        actions={
          <a
            href={exportHref}
            className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            download
          >
            <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
          </a>
        }
      />

      {canCreateUser && (
        <form action={createUser} className="card mb-4 flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="new-user-name" className="label">Name</label>
            <input id="new-user-name" name="name" defaultValue="user" maxLength={200} className="input" />
          </div>
          <div className="min-w-[16rem] flex-1">
            <label htmlFor="new-user-email" className="label">Email</label>
            <input id="new-user-email" name="email" type="email" required maxLength={320} className="input" />
          </div>
          <button className="btn-primary">Add user</button>
          <p className="w-full text-xs text-slate-500">Creates a regular user. On first sign-in, they verify their email with a one-time code, then choose a password.</p>
          {sp.createError && (
            <p role="alert" className="w-full text-sm text-red-600">
              {sp.createError === 'exists' ? 'A user with that email already exists.' : 'Enter a valid email and a name under 200 characters.'}
            </p>
          )}
        </form>
      )}

      <FilterBar resetHref={activeFilters.length > 0 ? '/admin-dashboard/users' : undefined} activeFilters={activeFilters}>
        <FilterField label="Search" className="min-w-[12rem] flex-1">
          <input name="q" defaultValue={q} placeholder="Email or name…" className="input-sm" />
        </FilterField>
        <FilterField label="Status">
          <select name="status" defaultValue={status} className="input-sm">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="anonymized">Anonymized</option>
            <option value="unverified">Email unverified</option>
          </select>
        </FilterField>
        <FilterField label="Tag">
          <select name="tag" defaultValue={tagSlug} className="input-sm">
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.slug}>{t.label}</option>
            ))}
          </select>
        </FilterField>
        <FilterField label="From">
          <input type="date" name="from" defaultValue={fromStr} className="input-sm" />
        </FilterField>
        <FilterField label="To">
          <input type="date" name="to" defaultValue={toStr} className="input-sm" />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={users} rowKey={(u) => u.id} empty="No users match the filters." />

      <Pager page={page} pages={pages} buildHref={buildHref} />
    </div>
  );
}
