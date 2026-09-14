import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { auth, isSuperAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatPrice, tierLabel } from '@/lib/utils';
import { PageHeader } from '@/components/admin/page-header';
import { Badge, StatusBadge } from '@/components/admin/badge';
import { ConfirmButton } from '@/components/admin/confirm-button';
import {
  Ban,
  CheckCircle2,
  LogOut,
  ShieldOff,
  Send,
  Eye as EyeIcon,
  Pin,
  Trash2,
  Tag as TagIcon
} from 'lucide-react';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user as { id: string; email: string };
}

function bump(formData: FormData, field: string): string {
  return String(formData.get(field) || '');
}

async function toggleActive(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = bump(formData, 'id');
  const u = await db.user.findUnique({ where: { id }, select: { active: true } });
  if (!u) return;
  await db.user.update({ where: { id }, data: { active: !u.active, sessionVersion: { increment: u.active ? 1 : 0 } } });
  await db.adminLog.create({
    data: { adminId: me.id, action: u.active ? 'user.suspend' : 'user.activate', targetType: 'User', targetId: id, metadata: {} }
  });
  revalidatePath(`/admin-dashboard/users/${id}`);
  revalidatePath('/admin-dashboard/users');
}

async function forceLogout(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = bump(formData, 'id');
  await db.user.update({ where: { id }, data: { sessionVersion: { increment: 1 } } });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.force-logout', targetType: 'User', targetId: id, metadata: {} }
  });
  revalidatePath(`/admin-dashboard/users/${id}`);
}

async function resendLoginOtp(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = bump(formData, 'id');
  const user = await db.user.findUnique({ where: { id }, select: { email: true, active: true } });
  if (!user || !user.active) return;
  // Reuse the public OTP issuer (writes the OtpCode + sends the email).
  // Use a synthetic IP so the per-IP rate limit doesn't reject admin-driven sends.
  const { issueOtp } = await import('@/lib/otp');
  const result = await issueOtp(user.email, 'LOGIN', `admin:${me.id}`);
  if (!result.ok) redirect(`/admin-dashboard/users/${id}?otp=failed`);
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.resend-login-otp', targetType: 'User', targetId: id, metadata: { email: user.email } }
  });
  redirect(`/admin-dashboard/users/${id}?otp=sent`);
}

async function anonymizeUser(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = bump(formData, 'id');
  const u = await db.user.findUnique({ where: { id }, select: { email: true, anonymizedAt: true } });
  if (!u || u.anonymizedAt) return;
  // Scrub identifying fields; keep id + role + relation rows intact so
  // historical revenue + entitlement aggregates still roll up correctly.
  const tag = `deleted-${id.slice(0, 8)}@example.invalid`;
  await db.user.update({
    where: { id },
    data: {
      email: tag,
      name: null,
      passwordHash: null,
      passwordSetupRequired: false,
      nationality: null,
      active: false,
      anonymizedAt: new Date(),
      sessionVersion: { increment: 1 }
    }
  });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.anonymize', targetType: 'User', targetId: id, metadata: { previousEmail: u.email } }
  });
  revalidatePath(`/admin-dashboard/users/${id}`);
  revalidatePath('/admin-dashboard/users');
}

async function impersonate(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = bump(formData, 'id');
  if (id === me.id) return;
  const cookieStore = await cookies();
  cookieStore.set('impersonate_user_id', id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 30 // 30 minutes
  });
  cookieStore.set('impersonate_admin_id', me.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 30
  });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.impersonate.start', targetType: 'User', targetId: id, metadata: { ttlSeconds: 1800 } }
  });
  redirect('/user-dashboard');
}

async function regrant(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const userId = bump(formData, 'userId');
  const examId = bump(formData, 'examId');
  if (!userId || !examId) return;
  await db.entitlement.upsert({
    where: { userId_examId_tier: { userId, examId, tier: 'ADMIN_GRANT' } },
    update: {},
    create: { userId, examId, tier: 'ADMIN_GRANT' }
  });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.regrant', targetType: 'User', targetId: userId, metadata: { examId } }
  });
  revalidatePath(`/admin-dashboard/users/${userId}`);
}

async function addNote(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const userId = bump(formData, 'userId');
  const body = bump(formData, 'body').trim();
  const pinned = formData.get('pinned') === 'on';
  if (!userId || !body) return;
  await db.userNote.create({ data: { userId, authorId: me.id, body, pinned } });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.note.add', targetType: 'User', targetId: userId, metadata: { pinned } }
  });
  revalidatePath(`/admin-dashboard/users/${userId}`);
}

async function deleteNote(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const id = bump(formData, 'id');
  const note = await db.userNote.findUnique({ where: { id }, select: { userId: true } });
  if (!note) return;
  await db.userNote.delete({ where: { id } });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.note.delete', targetType: 'User', targetId: note.userId, metadata: { noteId: id } }
  });
  revalidatePath(`/admin-dashboard/users/${note.userId}`);
}

async function togglePinNote(formData: FormData) {
  'use server';
  await requireAdmin();
  const id = bump(formData, 'id');
  const note = await db.userNote.findUnique({ where: { id } });
  if (!note) return;
  await db.userNote.update({ where: { id }, data: { pinned: !note.pinned } });
  revalidatePath(`/admin-dashboard/users/${note.userId}`);
}

async function attachTag(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const userId = bump(formData, 'userId');
  const tagSlugOrLabel = bump(formData, 'tag').trim();
  if (!userId || !tagSlugOrLabel) return;
  const slug = tagSlugOrLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const tag = await db.tag.upsert({
    where: { slug },
    create: { slug, label: tagSlugOrLabel },
    update: {}
  });
  await db.userTag.upsert({
    where: { userId_tagId: { userId, tagId: tag.id } },
    create: { userId, tagId: tag.id },
    update: {}
  });
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.tag.attach', targetType: 'User', targetId: userId, metadata: { tag: slug } }
  });
  revalidatePath(`/admin-dashboard/users/${userId}`);
  revalidatePath('/admin-dashboard/users');
}

async function detachTag(formData: FormData) {
  'use server';
  const me = await requireAdmin();
  const userId = bump(formData, 'userId');
  const tagId = bump(formData, 'tagId');
  if (!userId || !tagId) return;
  await db.userTag.delete({ where: { userId_tagId: { userId, tagId } } }).catch(() => {});
  await db.adminLog.create({
    data: { adminId: me.id, action: 'user.tag.detach', targetType: 'User', targetId: userId, metadata: { tagId } }
  });
  revalidatePath(`/admin-dashboard/users/${userId}`);
  revalidatePath('/admin-dashboard/users');
}

const TABS = ['overview', 'orders', 'invoices', 'entitlements', 'vouchers', 'attempts', 'emails', 'notes', 'activity'] as const;
type Tab = (typeof TABS)[number];

export default async function AdminUserDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; otp?: string }>;
}) {
  const session = await auth();
  const me = session?.user as any;
  if (me?.role !== 'ADMIN') redirect('/');
  const { id } = await params;
  const sp = await searchParams;
  const tab = (TABS.includes((sp.tab as Tab) ?? 'overview') ? sp.tab : 'overview') as Tab;
  const superAdmin = isSuperAdmin(me?.email);

  const user = await db.user.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      billingAddresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] }
    }
  });
  if (!user) return notFound();

  const [
    orders,
    entitlements,
    invoices,
    attempts,
    emails,
    notes,
    activity,
    aggregates,
    exams
  ] = await Promise.all([
    db.order.findMany({
      where: { userId: id },
      include: { exam: { select: { code: true, title: true } }, bundle: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    db.entitlement.findMany({
      where: { userId: id },
      include: { exam: { include: { vendor: true } }, delivery: true },
      orderBy: { grantedAt: 'desc' }
    }),
    db.invoice.findMany({
      where: { userId: id },
      orderBy: { issueDate: 'desc' }
    }),
    db.attempt.findMany({
      where: { userId: id },
      include: { exam: { select: { code: true, title: true } } },
      orderBy: { startedAt: 'desc' },
      take: 50
    }),
    db.emailLog.findMany({
      where: { userId: id },
      orderBy: { sentAt: 'desc' },
      take: 50
    }),
    db.userNote.findMany({
      where: { userId: id },
      include: { author: { select: { email: true, name: true } } },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
    }),
    db.adminLog.findMany({
      where: { targetType: 'User', targetId: id },
      include: { admin: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    }),
    db.order.aggregate({
      where: { userId: id, status: 'PAID' },
      _sum: { amount: true },
      _count: true
    }),
    db.exam.findMany({ orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }], select: { id: true, code: true, vendor: { select: { name: true } } } })
  ]);

  const ltv = aggregates._sum.amount ?? 0;
  const paidCount = aggregates._count ?? 0;
  const vouchers = entitlements.filter((e) => e.voucher);
  const subtitle = (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge variant={user.active ? 'success' : 'danger'}>{user.active ? 'ACTIVE' : 'SUSPENDED'}</Badge>
      {!user.emailVerified && !user.anonymizedAt && <Badge variant="muted">EMAIL UNVERIFIED</Badge>}
      {user.anonymizedAt && <Badge variant="muted">ANONYMIZED</Badge>}
      <Badge variant={user.role === 'ADMIN' ? 'info' : 'muted'}>{user.role}</Badge>
      <span>· joined {user.createdAt.toLocaleDateString()}</span>
      <span>· {paidCount} paid order{paidCount === 1 ? '' : 's'}</span>
      {ltv > 0 && <span>· LTV {formatPrice(ltv, orders[0]?.currency ?? 'USD')}</span>}
    </span>
  );

  return (
    <div>
      <PageHeader
        title={user.name || user.email}
        subtitle={subtitle}
        back={{ href: '/admin-dashboard/users', label: 'Back to users' }}
      />

      {(sp.otp === 'sent' || sp.otp === 'failed') && (
        <p role="status" className={`mb-4 rounded-md p-3 text-sm ${sp.otp === 'sent' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'}`}>
          {sp.otp === 'sent' ? 'Login code sent to the user.' : 'Could not send a login code. Check email delivery or try again later.'}
        </p>
      )}

      {/* Tag chips + add */}
      <div className="card mb-4 flex flex-wrap items-center gap-2 p-3">
        <TagIcon className="h-3.5 w-3.5 text-slate-400" />
        {user.tags.length === 0 && <span className="text-[11px] text-slate-500">No tags yet.</span>}
        {user.tags.map(({ tag }) => (
          <form key={tag.id} action={detachTag} className="inline-flex">
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="tagId" value={tag.id} />
            <button
              type="submit"
              title="Click to remove"
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-red-100 hover:text-red-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-red-950/40 dark:hover:text-red-300"
            >
              {tag.label}
              <span aria-hidden>×</span>
            </button>
          </form>
        ))}
        <form action={attachTag} className="ml-auto inline-flex items-center gap-1">
          <input type="hidden" name="userId" value={user.id} />
          <input
            name="tag"
            placeholder="Add tag…"
            className="input-sm h-7 w-32 text-[11px]"
          />
          <button className="inline-flex h-7 items-center rounded bg-blue-600 px-2 text-[11px] font-medium text-white hover:bg-blue-700">
            Add
          </button>
        </form>
      </div>

      {/* Tab nav */}
      <div className="mb-4 flex flex-wrap gap-0.5 border-b border-slate-200 dark:border-slate-700">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin-dashboard/users/${user.id}?tab=${t}`}
            className={`inline-flex h-9 items-center border-b-2 px-3 text-[12px] font-medium capitalize transition ${
              tab === t
                ? 'border-blue-500 text-slate-900 dark:text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t === 'overview' && 'Overview'}
            {t === 'orders' && `Orders (${orders.length})`}
            {t === 'invoices' && `Invoices (${invoices.length})`}
            {t === 'entitlements' && `Entitlements (${entitlements.length})`}
            {t === 'vouchers' && `Vouchers (${vouchers.length})`}
            {t === 'attempts' && `Attempts (${attempts.length})`}
            {t === 'emails' && `Emails (${emails.length})`}
            {t === 'notes' && `Notes (${notes.length})`}
            {t === 'activity' && 'Activity'}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tab content */}
        <div className="space-y-4 lg:col-span-2">
          {tab === 'overview' && (
            <>
              <Card title="Profile">
                <Row k="Email" v={user.email} />
                <Row k="Name" v={user.name ?? '—'} />
                <Row k="Role" v={user.role} />
                <Row k="Nationality" v={user.nationality ?? '—'} />
                <Row k="Email verified" v={user.emailVerified ? user.emailVerified.toLocaleString() : '—'} />
                <Row k="Joined" v={user.createdAt.toLocaleString()} />
                <Row k="Session version" v={String(user.sessionVersion)} />
              </Card>
              <Card title="Billing addresses">
                {user.billingAddresses.length === 0 ? (
                  <p className="text-[12px] text-slate-500">None.</p>
                ) : (
                  <ul className="space-y-2 text-[12px]">
                    {user.billingAddresses.map((a) => (
                      <li key={a.id} className="rounded-md border border-slate-200 p-2 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{a.fullName}{a.company ? ` — ${a.company}` : ''}</div>
                          {a.isDefault && <Badge variant="success">Default</Badge>}
                        </div>
                        <div className="mt-1 text-slate-600 dark:text-slate-400">
                          {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}{a.state ? `, ${a.state}` : ''} {a.postalCode}, {a.country}
                          {a.phone ? ` · ${a.phone}` : ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card title="Pinned notes">
                {notes.filter((n) => n.pinned).length === 0 ? (
                  <p className="text-[12px] text-slate-500">No pinned notes.</p>
                ) : (
                  <ul className="space-y-2 text-[12px]">
                    {notes.filter((n) => n.pinned).map((n) => (
                      <li key={n.id} className="rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-900/40 dark:bg-amber-950/30">
                        <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{n.body}</div>
                        <div className="mt-1 text-[10px] text-slate-500">
                          {n.author.name ?? n.author.email} · {n.createdAt.toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}

          {tab === 'orders' && (
            <Card title={`Orders (${orders.length})`}>
              {orders.length === 0 ? (
                <p className="text-[12px] text-slate-500">No orders.</p>
              ) : (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="py-1">No.</th>
                      <th className="py-1">When</th>
                      <th className="py-1">Product</th>
                      <th className="py-1">Provider</th>
                      <th className="py-1">Status</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-1.5">
                          <Link href={`/admin-dashboard/orders/${o.id}`} className="font-mono text-blue-600 hover:underline dark:text-blue-400">
                            {o.number ?? o.id.slice(0, 10)}
                          </Link>
                        </td>
                        <td className="py-1.5">{o.createdAt.toLocaleDateString()}</td>
                        <td className="py-1.5">{o.bundle?.title ?? o.exam?.title ?? '—'}{o.tier && ` · ${tierLabel(o.tier)}`}</td>
                        <td className="py-1.5 text-slate-500">{o.provider}</td>
                        <td className="py-1.5"><StatusBadge status={o.status} /></td>
                        <td className="py-1.5 text-right font-medium">{formatPrice(o.amount, o.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'invoices' && (
            <Card title={`Invoices (${invoices.length})`}>
              {invoices.length === 0 ? (
                <p className="text-[12px] text-slate-500">No invoices.</p>
              ) : (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="py-1">Number</th>
                      <th className="py-1">Date</th>
                      <th className="py-1 text-right">Amount</th>
                      <th className="py-1 text-right">Tax</th>
                      <th className="py-1">Status</th>
                      <th className="py-1"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-1.5">
                          <Link href={`/admin-dashboard/invoices/${inv.id}`} className="font-mono font-semibold text-blue-600 hover:underline dark:text-blue-400">
                            {inv.number}
                          </Link>
                        </td>
                        <td className="py-1.5">{inv.issueDate.toISOString().slice(0, 10)}</td>
                        <td className="py-1.5 text-right">{formatPrice(inv.total, inv.currency)}</td>
                        <td className="py-1.5 text-right">{inv.taxAmount === 0 ? '—' : formatPrice(inv.taxAmount, inv.currency)}</td>
                        <td className="py-1.5"><StatusBadge status={inv.status} /></td>
                        <td className="py-1.5 text-right">
                          <a href={`/api/admin/invoices/${inv.id}/pdf`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline">PDF</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'entitlements' && (
            <Card title={`Entitlements (${entitlements.length})`}>
              {entitlements.length === 0 ? (
                <p className="text-[12px] text-slate-500">No entitlements.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-[12px] dark:divide-slate-800/70">
                  {entitlements.map((e) => (
                    <li key={e.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <span className="font-medium">{e.exam.vendor.name} · {e.exam.code}</span>
                        <span className="ml-2 text-slate-500">{e.exam.title}</span>
                        <span className="ml-2 text-[10px] text-slate-400">{e.tier}</span>
                        {e.voucher && <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 font-mono text-[10px] text-violet-800 dark:bg-violet-950/40 dark:text-violet-200">{e.voucher}</span>}
                      </div>
                      {e.delivery && <StatusBadge status={e.delivery.status} />}
                    </li>
                  ))}
                </ul>
              )}
              <form action={regrant} className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                <input type="hidden" name="userId" value={user.id} />
                <label className="flex flex-col text-[10px] uppercase tracking-wider text-slate-500">
                  Grant ADMIN_GRANT for exam
                  <select name="examId" className="input-sm mt-0.5 w-72" defaultValue="">
                    <option value="">Select exam…</option>
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>{e.vendor.name} · {e.code}</option>
                    ))}
                  </select>
                </label>
                <button className="inline-flex h-8 items-center rounded-md bg-emerald-600 px-3 text-[12px] font-medium text-white hover:bg-emerald-700">
                  Grant
                </button>
              </form>
            </Card>
          )}

          {tab === 'vouchers' && (
            <Card title={`Vouchers (${vouchers.length})`}>
              {vouchers.length === 0 ? (
                <p className="text-[12px] text-slate-500">No vouchers issued yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-[12px] dark:divide-slate-800/70">
                  {vouchers.map((e) => (
                    <li key={e.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <span className="font-mono font-semibold">{e.voucher}</span>
                        <span className="ml-2 text-slate-500">{e.exam.vendor.name} · {e.exam.code}</span>
                      </div>
                      <a href={`/api/vouchers/${e.id}/pdf`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline">PDF</a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {tab === 'attempts' && (
            <Card title={`Recent attempts (${attempts.length})`}>
              {attempts.length === 0 ? (
                <p className="text-[12px] text-slate-500">No attempts.</p>
              ) : (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="py-1">Started</th>
                      <th className="py-1">Exam</th>
                      <th className="py-1">Mode</th>
                      <th className="py-1 text-right">Score</th>
                      <th className="py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {attempts.map((a) => (
                      <tr key={a.id}>
                        <td className="py-1.5">{a.startedAt.toLocaleString()}</td>
                        <td className="py-1.5">{a.exam.code}</td>
                        <td className="py-1.5">{a.mode}</td>
                        <td className="py-1.5 text-right">{a.score != null ? `${a.score}%` : '—'}</td>
                        <td className="py-1.5">
                          <Badge variant={a.submittedAt ? (a.passed ? 'success' : 'warn') : 'muted'}>
                            {a.submittedAt ? (a.passed ? 'PASSED' : 'FAILED') : 'IN PROGRESS'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'emails' && (
            <Card title={`Emails (${emails.length})`}>
              {emails.length === 0 ? (
                <p className="text-[12px] text-slate-500">No emails sent to this user yet.</p>
              ) : (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="py-1">Sent</th>
                      <th className="py-1">Template</th>
                      <th className="py-1">Subject</th>
                      <th className="py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {emails.map((e) => (
                      <tr key={e.id}>
                        <td className="py-1.5">{e.sentAt.toLocaleString()}</td>
                        <td className="py-1.5"><code className="text-[10px]">{e.template ?? '—'}</code></td>
                        <td className="py-1.5 truncate">{e.subject}</td>
                        <td className="py-1.5"><StatusBadge status={e.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {tab === 'notes' && (
            <Card title={`Notes (${notes.length})`}>
              <form action={addNote} className="mb-3 space-y-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                <input type="hidden" name="userId" value={user.id} />
                <textarea
                  name="body"
                  rows={2}
                  placeholder="Add internal note…"
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-[12px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  required
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <input type="checkbox" name="pinned" />
                    Pin to top of profile
                  </label>
                  <button className="inline-flex h-7 items-center rounded-md bg-blue-600 px-3 text-[11px] font-medium text-white hover:bg-blue-700">
                    Add note
                  </button>
                </div>
              </form>
              {notes.length === 0 ? (
                <p className="text-[12px] text-slate-500">No notes yet.</p>
              ) : (
                <ul className="space-y-2 text-[12px]">
                  {notes.map((n) => (
                    <li
                      key={n.id}
                      className={`rounded-md border p-2 ${
                        n.pinned
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{n.body}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{n.author.name ?? n.author.email} · {n.createdAt.toLocaleString()}</span>
                        <span className="flex items-center gap-2">
                          <form action={togglePinNote} className="inline-flex">
                            <input type="hidden" name="id" value={n.id} />
                            <button className="text-slate-500 hover:text-amber-600" title={n.pinned ? 'Unpin' : 'Pin'}>
                              <Pin className="h-3 w-3" />
                            </button>
                          </form>
                          <form action={deleteNote} className="inline-flex">
                            <input type="hidden" name="id" value={n.id} />
                            <ConfirmButton message="Delete this note?" className="h-5 w-5 p-0">
                              <Trash2 className="h-3 w-3" />
                            </ConfirmButton>
                          </form>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {tab === 'activity' && (
            <Card title="Activity (last 100 admin events)">
              {activity.length === 0 ? (
                <p className="text-[12px] text-slate-500">No admin actions recorded.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-[12px] dark:divide-slate-800/70">
                  {activity.map((l) => (
                    <li key={l.id} className="py-1.5">
                      <div className="flex items-center justify-between">
                        <code className="text-[11px] font-medium">{l.action}</code>
                        <span className="text-[10px] text-slate-500">{l.createdAt.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{l.admin.name ?? l.admin.email}</div>
                      {l.metadata && Object.keys(l.metadata as any).length > 0 && (
                        <code className="mt-0.5 block truncate text-[10px] text-slate-500">{JSON.stringify(l.metadata)}</code>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        {/* Right rail: quick actions */}
        <div className="space-y-3">
          <Card title="Account actions">
            <div className="space-y-1.5">
              <form action={toggleActive}>
                <input type="hidden" name="id" value={user.id} />
                <button className={`inline-flex h-7 w-full items-center justify-center gap-1 rounded-md text-[11px] font-medium ${user.active ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                  {user.active ? <><Ban className="h-3 w-3" /> Suspend</> : <><CheckCircle2 className="h-3 w-3" /> Activate</>}
                </button>
              </form>
              <form action={forceLogout}>
                <input type="hidden" name="id" value={user.id} />
                <button className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-md border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  <LogOut className="h-3 w-3" /> Force logout
                </button>
              </form>
              {user.active && !user.anonymizedAt && (
                <form action={resendLoginOtp}>
                  <input type="hidden" name="id" value={user.id} />
                  <button className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-md border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Send className="h-3 w-3" /> Send login OTP
                  </button>
                </form>
              )}
              {superAdmin && user.id !== me.id && !user.anonymizedAt && (
                <form action={impersonate}>
                  <input type="hidden" name="id" value={user.id} />
                  <ConfirmButton
                    message={`Impersonate ${user.email}? You'll appear logged in as them for 30 minutes.`}
                    variant="primary"
                    className="h-7 w-full justify-center gap-1 rounded-md border border-blue-300 px-2 text-[11px] font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30"
                  >
                    <EyeIcon className="h-3 w-3" /> Impersonate
                  </ConfirmButton>
                </form>
              )}
            </div>
          </Card>

          <Card title="GDPR">
            <a
              href={`/api/admin/users/${user.id}/export-data`}
              download
              className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-slate-300 px-2 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Download data export (JSON)
            </a>
          </Card>

          {!user.anonymizedAt && (
            <Card title="Danger zone">
              <p className="mb-2 text-[11px] text-slate-500">
                Anonymizing scrubs PII (email, name, password, nationality) and suspends the account.
                Order, invoice and entitlement rows are kept so revenue history stays intact. <b>Cannot be undone.</b>
              </p>
              <form action={anonymizeUser}>
                <input type="hidden" name="id" value={user.id} />
                <ConfirmButton
                  message={`Anonymize ${user.email}? This cannot be undone.`}
                  className="h-7 w-full justify-center gap-1 rounded-md bg-red-600 px-2 text-[11px] font-medium text-white hover:bg-red-700"
                >
                  <ShieldOff className="h-3 w-3" /> Anonymize (GDPR)
                </ConfirmButton>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string | ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-slate-100 py-1 text-[12px] last:border-0 dark:border-slate-800/70">
      <span className="text-slate-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
