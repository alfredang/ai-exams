import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatPrice, tierLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect('/login');

  const orders = await db.order.findMany({
    where: { userId },
    include: { exam: true, bundle: true },
    orderBy: { createdAt: 'desc' }
  });

  const vouchers = await db.entitlement.findMany({
    where: { userId, voucher: { not: null } },
    include: { exam: true }
  });
  const voucherByExam = new Map(vouchers.map((v) => [v.examId, v]));

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders & billing</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your purchase history. PDFs for voucher orders are available below.
      </p>

      <div className="card mt-4 divide-y divide-slate-200 dark:divide-slate-800">
        {orders.map((o) => {
          const product = o.bundle ? o.bundle.title : o.exam?.title ?? '(unknown)';
          const tier = o.tier ? tierLabel(o.tier) : '—';
          const voucher = o.examId ? voucherByExam.get(o.examId) : undefined;
          return (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="font-medium">{product}</div>
                <div className="text-xs text-slate-500">
                  {tier} · {o.createdAt.toLocaleString()} · Order <span className="font-mono">{o.number ?? o.id.slice(0, 10)}</span>
                </div>
                {voucher?.voucher && (
                  <div className="mt-1 text-xs">
                    Voucher code: <code className="font-mono">{voucher.voucher}</code>{' '}
                    <Link
                      href={`/api/vouchers/${voucher.id}/pdf`}
                      className="ml-1 text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Download PDF
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="font-semibold">{formatPrice(o.amount, o.currency)}</div>
                <span
                  className={`badge ${
                    o.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : o.status === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : o.status === 'REFUNDED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {o.status}
                </span>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-500">
            No orders yet.{' '}
            <Link href="/practice-exams" className="text-blue-600 hover:underline dark:text-blue-400">
              Browse exams →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
