import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/admin/badge';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { formatMoney } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { CouponKind, CouponScope } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user as { id: string };
}

async function updateCoupon(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  if (!id) return;
  const kind = (formData.get('kind') as CouponKind) ?? 'PERCENT';
  const valueRaw = Number(formData.get('value') || 0);
  const value = kind === 'PERCENT' ? Math.max(0, Math.min(100, valueRaw)) : Math.round(valueRaw * 100);
  const scope = (formData.get('scope') as CouponScope) ?? 'GLOBAL';
  const scopeExamId = String(formData.get('scopeExamId') || '') || null;
  const scopeVendorId = String(formData.get('scopeVendorId') || '') || null;
  const minSubtotal = Math.max(0, Math.round(Number(formData.get('minSubtotal') || 0) * 100));
  const maxRedemptionsStr = String(formData.get('maxRedemptions') || '');
  const maxRedemptions = maxRedemptionsStr ? Number(maxRedemptionsStr) : null;
  const perUserLimitStr = String(formData.get('perUserLimit') || '');
  const perUserLimit = perUserLimitStr ? Number(perUserLimitStr) : null;
  const startsAtStr = String(formData.get('startsAt') || '');
  const endsAtStr = String(formData.get('endsAt') || '');
  const enabled = formData.get('enabled') === 'on';
  const notes = String(formData.get('notes') || '').trim() || null;

  await db.coupon.update({
    where: { id },
    data: {
      kind,
      value,
      scope,
      scopeExamId: scope === 'EXAM' ? scopeExamId : null,
      scopeVendorId: scope === 'VENDOR' ? scopeVendorId : null,
      minSubtotal,
      maxRedemptions,
      perUserLimit,
      startsAt: startsAtStr ? new Date(startsAtStr) : null,
      endsAt: endsAtStr ? new Date(endsAtStr) : null,
      enabled,
      notes
    }
  });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'coupon.update', targetType: 'Coupon', targetId: id, metadata: {} }
  });
  revalidatePath('/admin-dashboard/coupons');
  revalidatePath(`/admin-dashboard/coupons/${id}`);
}

async function deleteCoupon(formData: FormData) {
  'use server';
  const user = await requireAdmin();
  const id = String(formData.get('id'));
  const coupon = await db.coupon.findUnique({ where: { id }, include: { _count: { select: { redemptions: true } } } });
  if (!coupon) return;
  if (coupon._count.redemptions > 0) {
    // Refuse — historic redemptions reference this row. Disable instead.
    await db.coupon.update({ where: { id }, data: { enabled: false } });
  } else {
    await db.coupon.delete({ where: { id } });
  }
  await db.adminLog.create({
    data: {
      adminId: user.id,
      action: coupon._count.redemptions > 0 ? 'coupon.disabled' : 'coupon.delete',
      targetType: 'Coupon',
      targetId: id,
      metadata: { code: coupon.code }
    }
  });
  revalidatePath('/admin-dashboard/coupons');
  redirect('/admin-dashboard/coupons');
}

function toDateTimeLocal(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export default async function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const { id } = await params;
  const [coupon, vendors, exams, redemptions] = await Promise.all([
    db.coupon.findUnique({
      where: { id },
      include: { scopeExam: true, scopeVendor: true, _count: { select: { redemptions: true } } }
    }),
    db.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.exam.findMany({
      orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }],
      select: { id: true, code: true, vendor: { select: { name: true } } }
    }),
    db.couponRedemption.findMany({
      where: { couponId: id },
      include: {
        user: { select: { email: true, name: true } },
        order: { select: { id: true, number: true, status: true, amount: true, currency: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  ]);
  if (!coupon) notFound();

  return (
    <div>
      <PageHeader
        title={coupon.code}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <Badge variant={coupon.enabled ? 'success' : 'muted'}>{coupon.enabled ? 'Enabled' : 'Disabled'}</Badge>
            <span>·</span>
            <span>{coupon.kind === 'PERCENT' ? `${coupon.value}%` : `$${(coupon.value / 100).toFixed(2)}`} off</span>
            <span>·</span>
            <span>{coupon.scope}</span>
          </span>
        }
        back={{ href: '/admin-dashboard/coupons', label: 'Back to coupons' }}
        actions={
          <form action={deleteCoupon}>
            <input type="hidden" name="id" value={coupon.id} />
            <ConfirmButton
              message={
                coupon._count.redemptions > 0
                  ? `Disable ${coupon.code}? It has ${coupon._count.redemptions} redemption(s) so it can't be deleted.`
                  : `Delete ${coupon.code}? This cannot be undone.`
              }
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {coupon._count.redemptions > 0 ? 'Disable' : 'Delete'}
            </ConfirmButton>
          </form>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <form action={updateCoupon} className="card lg:col-span-2 space-y-3 p-4">
          <input type="hidden" name="id" value={coupon.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kind">
              <select name="kind" className="input-sm" defaultValue={coupon.kind}>
                <option value="PERCENT">Percent off</option>
                <option value="FIXED">Fixed dollars off</option>
              </select>
            </Field>
            <Field label="Value">
              <input
                name="value"
                type="number"
                step="0.01"
                defaultValue={coupon.kind === 'PERCENT' ? coupon.value : (coupon.value / 100).toFixed(2)}
                className="input-sm"
                required
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Scope">
              <select name="scope" className="input-sm" defaultValue={coupon.scope}>
                <option>GLOBAL</option>
                <option>EXAM</option>
                <option>VENDOR</option>
              </select>
            </Field>
            <Field label="Scope exam">
              <select name="scopeExamId" className="input-sm" defaultValue={coupon.scopeExamId ?? ''}>
                <option value="">—</option>
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>{e.vendor.name} · {e.code}</option>
                ))}
              </select>
            </Field>
            <Field label="Scope vendor">
              <select name="scopeVendorId" className="input-sm" defaultValue={coupon.scopeVendorId ?? ''}>
                <option value="">—</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Min subtotal ($)">
              <input name="minSubtotal" type="number" step="0.01" min="0" defaultValue={(coupon.minSubtotal / 100).toFixed(2)} className="input-sm" />
            </Field>
            <Field label="Max redemptions">
              <input name="maxRedemptions" type="number" min="1" defaultValue={coupon.maxRedemptions ?? ''} placeholder="∞" className="input-sm" />
            </Field>
            <Field label="Per-user limit">
              <input name="perUserLimit" type="number" min="1" defaultValue={coupon.perUserLimit ?? ''} placeholder="∞" className="input-sm" />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Starts at">
              <input name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(coupon.startsAt)} className="input-sm" />
            </Field>
            <Field label="Ends at">
              <input name="endsAt" type="datetime-local" defaultValue={toDateTimeLocal(coupon.endsAt)} className="input-sm" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
            <input type="checkbox" name="enabled" defaultChecked={coupon.enabled} />
            Enabled
          </label>
          <Field label="Notes (admin-only)">
            <input name="notes" defaultValue={coupon.notes ?? ''} className="input-sm" />
          </Field>
          <div className="pt-2">
            <button type="submit" className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
              Save changes
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <section className="card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Usage</h2>
            <div className="mt-2 text-2xl font-semibold">{coupon._count.redemptions}</div>
            <div className="text-[12px] text-slate-500">
              {coupon.maxRedemptions != null ? `of ${coupon.maxRedemptions} total allowed` : 'no total cap'}
            </div>
          </section>
          <section className="card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick link</h2>
            <div className="mt-2 text-xs text-slate-500">
              Customers redeem this on the checkout page by entering:
            </div>
            <code className="mt-1 block break-all rounded bg-slate-50 px-2 py-1 text-[12px] font-semibold dark:bg-slate-800">{coupon.code}</code>
          </section>
        </div>
      </div>

      <section className="card mt-4 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent redemptions</h2>
        {redemptions.length === 0 ? (
          <p className="mt-2 text-[12px] text-slate-500">None yet.</p>
        ) : (
          <table className="mt-2 w-full text-[12px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="py-1">When</th>
                <th className="py-1">User</th>
                <th className="py-1">Order</th>
                <th className="py-1 text-right">Amount</th>
                <th className="py-1 text-right">Discount</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {redemptions.map((r) => (
                <tr key={r.id}>
                  <td className="py-1.5">{r.createdAt.toLocaleString()}</td>
                  <td className="py-1.5">{r.user.name ?? r.user.email}</td>
                  <td className="py-1.5">
                    <Link href={`/admin-dashboard/orders/${r.order.id}`} className="font-mono text-blue-600 hover:underline dark:text-blue-400">
                      {r.order.number ?? r.order.id.slice(0, 10)}
                    </Link>
                  </td>
                  <td className="py-1.5 text-right">{formatMoney(r.order.amount, r.order.currency)}</td>
                  <td className="py-1.5 text-right font-medium text-emerald-700 dark:text-emerald-400">
                    −{formatMoney(r.amount, r.order.currency)}
                  </td>
                  <td className="py-1.5">
                    <Badge variant={r.order.status === 'PAID' ? 'success' : r.order.status === 'REFUNDED' ? 'warn' : 'muted'}>
                      {r.order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}
