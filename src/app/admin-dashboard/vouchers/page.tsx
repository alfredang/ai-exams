import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { sendVoucherDeliveredEmail } from '@/lib/mail';
import { renderVoucherPdf } from '@/lib/voucher-pdf';
import { runDueDeliveries } from '@/lib/scheduling/voucher-delivery';

async function deliverVoucher(opts: {
  userEmail: string;
  userName: string | null;
  examTitle: string;
  examCode: string;
  vendorName: string;
  voucher: string;
}) {
  let pdf: Buffer | undefined;
  try {
    pdf = await renderVoucherPdf({
      examTitle: opts.examTitle,
      examCode: opts.examCode,
      vendor: opts.vendorName,
      voucherCode: opts.voucher,
      buyerName: opts.userName,
      buyerEmail: opts.userEmail
    });
  } catch { /* non-fatal */ }
  await sendVoucherDeliveredEmail(opts.userEmail, opts.examTitle, opts.voucher, pdf).catch(() => {});
}

async function issueExistingVoucher(formData: FormData) {
  'use server';
  const entitlementId = String(formData.get('entitlementId') || '');
  const voucher = String(formData.get('voucher') || '').trim();
  if (!entitlementId || !voucher) return;

  const ent = await db.entitlement.findUnique({
    where: { id: entitlementId },
    include: { user: true, exam: { include: { vendor: true } } }
  });
  if (!ent || ent.tier !== 'VOUCHER' || ent.voucher) return;

  const collision = await db.entitlement.findFirst({ where: { voucher } });
  if (collision) return;

  await db.entitlement.update({ where: { id: entitlementId }, data: { voucher } });
  await deliverVoucher({
    userEmail: ent.user.email,
    userName: ent.user.name,
    examTitle: ent.exam.title,
    examCode: ent.exam.code,
    vendorName: ent.exam.vendor.name,
    voucher
  });

  revalidatePath('/admin-dashboard/vouchers');
}

async function sendNowAction(formData: FormData) {
  'use server';
  const deliveryId = String(formData.get('deliveryId') || '');
  const code = String(formData.get('voucher') || '').trim();
  if (!deliveryId) return;
  if (code) {
    const collision = await db.entitlement.findFirst({ where: { voucher: code } });
    if (collision) return;
    await db.voucherDelivery.update({
      where: { id: deliveryId },
      data: { voucherCode: code, scheduledFor: new Date() }
    });
  } else {
    await db.voucherDelivery.update({
      where: { id: deliveryId },
      data: { scheduledFor: new Date() }
    });
  }
  await runDueDeliveries(1);
  revalidatePath('/admin-dashboard/vouchers');
}

async function runDeliveriesAction() {
  'use server';
  await runDueDeliveries(50);
  revalidatePath('/admin-dashboard/vouchers');
}

async function cancelDeliveryAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  if (!id) return;
  await db.voucherDelivery.update({
    where: { id },
    data: { status: 'CANCELED', lastError: 'Cancelled by admin' }
  });
  revalidatePath('/admin-dashboard/vouchers');
}

async function grantVoucherToUser(formData: FormData) {
  'use server';
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const examId = String(formData.get('examId') || '');
  const voucher = String(formData.get('voucher') || '').trim();
  if (!email || !examId || !voucher) return;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return;

  const exam = await db.exam.findUnique({ where: { id: examId }, include: { vendor: true } });
  if (!exam) return;

  const collision = await db.entitlement.findFirst({ where: { voucher } });
  if (collision) return;

  await db.entitlement.upsert({
    where: { userId_examId_tier: { userId: user.id, examId, tier: 'VOUCHER' } },
    create: { userId: user.id, examId, tier: 'VOUCHER', voucher },
    update: { voucher }
  });

  await deliverVoucher({
    userEmail: user.email,
    userName: user.name,
    examTitle: exam.title,
    examCode: exam.code,
    vendorName: exam.vendor.name,
    voucher
  });

  revalidatePath('/admin-dashboard/vouchers');
}

type SearchParams = Promise<{ q?: string; vendorId?: string; examId?: string }>;

export default async function AdminVouchersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const vendorId = sp.vendorId || '';
  const examId = sp.examId || '';

  const [vendors, exams] = await Promise.all([
    db.vendor.findMany({ orderBy: { name: 'asc' } }),
    db.exam.findMany({
      where: vendorId ? { vendorId } : undefined,
      orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }],
      include: { vendor: true }
    })
  ]);

  const baseWhere: any = { tier: 'VOUCHER' };
  if (examId) baseWhere.examId = examId;
  else if (vendorId) baseWhere.exam = { vendorId };
  if (q) baseWhere.user = { email: { contains: q, mode: 'insensitive' } };

  const [pending, recentlyIssued, deliveries] = await Promise.all([
    db.entitlement.findMany({
      where: { ...baseWhere, voucher: null },
      include: { user: true, exam: { include: { vendor: true } } },
      orderBy: { grantedAt: 'asc' },
      take: 100
    }),
    db.entitlement.findMany({
      where: { ...baseWhere, voucher: { not: null } },
      include: { user: true, exam: { include: { vendor: true } } },
      orderBy: { grantedAt: 'desc' },
      take: 20
    }),
    db.voucherDelivery.findMany({
      where: { status: { in: ['SCHEDULED', 'PROCESSING', 'FAILED'] } },
      include: {
        entitlement: {
          include: { user: true, exam: { include: { vendor: true } } }
        }
      },
      orderBy: { scheduledFor: 'asc' },
      take: 100
    })
  ]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Voucher Management</h1>
          <p className="mt-1 text-[12px] text-slate-500">
            Issue real exam voucher codes. Codes are emailed to the learner once you save.
            Inventory FIFO is consulted automatically when "Assign Voucher" runs from an order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin-dashboard/vouchers/inventory"
            className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Inventory →
          </a>
          <form action={runDeliveriesAction}>
            <button className="btn-sm bg-blue-600 text-white hover:bg-blue-700">Run deliveries now</button>
          </form>
        </div>
      </div>

      {/* Grant new voucher */}
      <section className="card mt-6 p-4">
        <h2 className="text-lg font-semibold">Add voucher to a user</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Grants a VOUCHER entitlement to the user for the selected exam.
        </p>
        <form action={grantVoucherToUser} className="mt-3 grid gap-3 sm:grid-cols-4">
          <input
            name="email"
            type="email"
            required
            placeholder="user@example.com"
            className="input sm:col-span-2"
          />
          <select name="examId" required defaultValue="" className="input">
            <option value="" disabled>Select exam…</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.vendor.name} · {e.code} — {e.title}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              name="voucher"
              type="text"
              required
              placeholder="Voucher code"
              className="input flex-1"
            />
            <button type="submit" className="btn-primary-grad whitespace-nowrap">Add</button>
          </div>
        </form>
      </section>

      {/* Filters */}
      <section className="card mt-6 p-4">
        <h2 className="text-base font-semibold">Filters</h2>
        <form method="get" className="mt-3 grid gap-3 sm:grid-cols-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search user email…"
            className="input sm:col-span-2"
          />
          <select name="vendorId" defaultValue={vendorId} className="input">
            <option value="">All vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <select name="examId" defaultValue={examId} className="input">
            <option value="">All exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.code} — {e.title}</option>
            ))}
          </select>
          <div className="sm:col-span-4 flex gap-2">
            <button type="submit" className="btn-primary">Apply</button>
            <a href="/admin-dashboard/vouchers" className="btn-ghost">Reset</a>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Scheduled deliveries ({deliveries.length})</h2>
          <form action={runDeliveriesAction}>
            <button type="submit" className="btn-ghost text-sm">Run worker now</button>
          </form>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Voucher emails are sent automatically when their scheduled time is reached. Enter a voucher code and click <b>Send now</b> to fast-track delivery.
        </p>
        <div className="mt-2 card divide-y divide-slate-200 dark:divide-slate-800">
          {deliveries.length === 0 && <p className="p-5 text-sm text-slate-500">No scheduled deliveries.</p>}
          {deliveries.map((d) => {
            const ent = d.entitlement;
            const due = d.scheduledFor <= new Date();
            const statusColor =
              d.status === 'FAILED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' :
              d.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' :
              due ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            return (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    {ent.user.email}
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium uppercase ${statusColor}`}>{d.status}</span>
                    {due && d.status === 'SCHEDULED' && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">DUE</span>}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {ent.exam.vendor.name} · <b>{ent.exam.code}</b> — {ent.exam.title}
                    <span className="mx-2 text-slate-400">·</span>
                    scheduled {d.scheduledFor.toLocaleString()}
                    {d.attempts > 0 && <> · {d.attempts} attempt{d.attempts === 1 ? '' : 's'}</>}
                  </div>
                  {d.lastError && <div className="mt-1 text-xs text-rose-600">{d.lastError}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <form action={sendNowAction} className="flex items-center gap-2">
                    <input type="hidden" name="deliveryId" value={d.id} />
                    <input
                      type="text"
                      name="voucher"
                      placeholder={ent.voucher ? 'Already coded' : 'Voucher code'}
                      defaultValue={d.voucherCode ?? ''}
                      className="input w-56"
                    />
                    <button type="submit" className="btn-primary-grad whitespace-nowrap">Send now</button>
                  </form>
                  <form action={cancelDeliveryAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button className="text-xs text-slate-500 hover:text-red-600">Cancel</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <h2 className="mt-8 text-lg font-semibold">Pending issuance ({pending.length})</h2>
      <div className="mt-2 card divide-y divide-slate-200 dark:divide-slate-800">
        {pending.length === 0 && <p className="p-5 text-sm text-slate-500">No pending vouchers.</p>}
        {pending.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="font-medium">{e.user.email}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {e.exam.vendor.name} · <b>{e.exam.code}</b> — {e.exam.title}
                <span className="mx-2 text-slate-400">·</span>
                granted {e.grantedAt.toLocaleString()}
              </div>
            </div>
            <form action={issueExistingVoucher} className="flex items-center gap-2">
              <input type="hidden" name="entitlementId" value={e.id} />
              <input
                type="text"
                name="voucher"
                placeholder="Enter voucher code"
                required
                className="input w-64"
              />
              <button className="btn-primary-grad whitespace-nowrap" type="submit">Issue</button>
            </form>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Recently issued (last 20)</h2>
      <div className="mt-2 card divide-y divide-slate-200 dark:divide-slate-800">
        {recentlyIssued.length === 0 && <p className="p-5 text-sm text-slate-500">No vouchers issued yet.</p>}
        {recentlyIssued.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="font-medium">{e.user.email}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {e.exam.vendor.name} · <b>{e.exam.code}</b> — {e.exam.title}
              </div>
            </div>
            <code className="rounded bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800">{e.voucher}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
