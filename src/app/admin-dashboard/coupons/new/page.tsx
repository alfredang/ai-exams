import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PageHeader } from '@/components/admin/page-header';
import { CouponKind, CouponScope } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function createCoupon(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');

  const code = String(formData.get('code') || '').trim().toUpperCase();
  if (!code) return;
  const kind = (formData.get('kind') as CouponKind) ?? 'PERCENT';
  const valueRaw = Number(formData.get('value') || 0);
  const value = kind === 'PERCENT' ? Math.max(0, Math.min(100, valueRaw)) : Math.round(valueRaw * 100);
  const scope = (formData.get('scope') as CouponScope) ?? 'GLOBAL';
  const scopeExamId = String(formData.get('scopeExamId') || '') || null;
  const scopeVendorId = String(formData.get('scopeVendorId') || '') || null;
  const minSubtotalDollars = Number(formData.get('minSubtotal') || 0);
  const minSubtotal = Math.max(0, Math.round(minSubtotalDollars * 100));
  const maxRedemptionsStr = String(formData.get('maxRedemptions') || '');
  const maxRedemptions = maxRedemptionsStr ? Number(maxRedemptionsStr) : null;
  const perUserLimitStr = String(formData.get('perUserLimit') || '');
  const perUserLimit = perUserLimitStr ? Number(perUserLimitStr) : null;
  const startsAtStr = String(formData.get('startsAt') || '');
  const endsAtStr = String(formData.get('endsAt') || '');
  const enabled = formData.get('enabled') === 'on';
  const notes = String(formData.get('notes') || '').trim() || null;

  const created = await db.coupon.create({
    data: {
      code,
      kind,
      value,
      scope,
      scopeExamId: scope === 'EXAM' ? scopeExamId : null,
      scopeVendorId: scope === 'VENDOR' ? scopeVendorId : null,
      minSubtotal,
      maxRedemptions: maxRedemptions ?? null,
      perUserLimit: perUserLimit ?? null,
      startsAt: startsAtStr ? new Date(startsAtStr) : null,
      endsAt: endsAtStr ? new Date(endsAtStr) : null,
      enabled,
      notes
    }
  });
  await db.adminLog.create({
    data: {
      adminId: user.id,
      action: 'coupon.create',
      targetType: 'Coupon',
      targetId: created.id,
      metadata: { code, kind, value, scope }
    }
  });
  revalidatePath('/admin-dashboard/coupons');
  redirect(`/admin-dashboard/coupons/${created.id}`);
}

export default async function NewCouponPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');

  const [vendors, exams] = await Promise.all([
    db.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.exam.findMany({
      orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }],
      select: { id: true, code: true, title: true, vendor: { select: { name: true } } }
    })
  ]);

  return (
    <div>
      <PageHeader title="New coupon" back={{ href: '/admin-dashboard/coupons', label: 'Back to coupons' }} />
      <form action={createCoupon} className="card mx-auto max-w-3xl space-y-3 p-4 text-sm">
        <Field label="Code" hint="Uppercase recommended (e.g. SAVE10).">
          <input name="code" required className="input-sm" placeholder="SAVE10" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kind">
            <select name="kind" className="input-sm" defaultValue="PERCENT">
              <option value="PERCENT">Percent off</option>
              <option value="FIXED">Fixed dollars off</option>
            </select>
          </Field>
          <Field label="Value" hint="0-100 for percent, dollar amount for fixed.">
            <input name="value" type="number" step="0.01" required className="input-sm" />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Scope">
            <select name="scope" className="input-sm" defaultValue="GLOBAL">
              <option>GLOBAL</option>
              <option>EXAM</option>
              <option>VENDOR</option>
            </select>
          </Field>
          <Field label="Scope exam (if EXAM)">
            <select name="scopeExamId" className="input-sm" defaultValue="">
              <option value="">—</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.vendor.name} · {e.code}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Scope vendor (if VENDOR)">
            <select name="scopeVendorId" className="input-sm" defaultValue="">
              <option value="">—</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Min subtotal ($)">
            <input name="minSubtotal" type="number" step="0.01" min="0" defaultValue="0" className="input-sm" />
          </Field>
          <Field label="Max redemptions (total)">
            <input name="maxRedemptions" type="number" min="1" placeholder="∞" className="input-sm" />
          </Field>
          <Field label="Per-user limit">
            <input name="perUserLimit" type="number" min="1" defaultValue="1" className="input-sm" />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Starts at">
            <input name="startsAt" type="datetime-local" className="input-sm" />
          </Field>
          <Field label="Ends at">
            <input name="endsAt" type="datetime-local" className="input-sm" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-200">
          <input type="checkbox" name="enabled" defaultChecked />
          Enabled
        </label>
        <Field label="Notes (admin-only)">
          <input name="notes" className="input-sm" placeholder="e.g. Black Friday campaign 2026" />
        </Field>
        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-[12px] font-medium text-white hover:bg-blue-700">
            Create coupon
          </button>
          <Link href="/admin-dashboard/coupons" className="text-[12px] text-slate-500 hover:underline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}
