import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { Package, Check, Ticket } from 'lucide-react';
import { ClaimFreeBundleButton } from './claim-free-button';

export default async function BundleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await db.bundle.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { position: 'asc' },
        include: { exam: { include: { vendor: true } } }
      }
    }
  });
  if (!bundle || !bundle.published) notFound();

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const isFree = bundle.price === 0;

  return (
    <div className="container-app max-w-4xl py-10">
      <div className="mb-2 text-sm">
        <Link href="/practice-exams" className="text-blue-600 hover:underline">All exams</Link>
        <span className="text-slate-400"> / </span>
        <span>Bundle</span>
      </div>
      <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
        <Package className="h-3.5 w-3.5" />
        Bundle
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{bundle.title}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">{bundle.description}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-semibold">What you get</h2>
          <ul className="mt-3 space-y-3">
            {bundle.items.map(item => (
              <li key={item.id} className="card flex items-start gap-3 p-4">
                <div className="mt-0.5">
                  {item.tier === 'VOUCHER' ? (
                    <Ticket className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge">{item.exam.vendor.name}</span>
                    <span className="badge">{item.exam.code}</span>
                    <span className={`badge ${item.tier === 'VOUCHER' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'}`}>
                      {item.tier === 'VOUCHER' ? 'Real exam voucher' : 'Practice access'}
                    </span>
                  </div>
                  <div className="mt-1 font-semibold">{item.exam.title}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {item.tier === 'VOUCHER'
                      ? `Includes a real ${item.exam.code} exam voucher you can redeem with the vendor.`
                      : `Lifetime practice access — full question bank, both Practice and Exam modes.`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">
              {isFree ? 'Free for a limited time' : 'Bundle price'}
            </div>
            <div className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {isFree ? 'Free' : formatPrice(bundle.price)}
            </div>
            {bundle.priceVoucher != null && !isFree && (
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Practice + Exam voucher · {formatPrice(bundle.priceVoucher)}
              </div>
            )}
            {!userId ? (
              <Link href={`/login?next=/bundles/${bundle.slug}`} className="btn-primary-grad mt-4 block w-full text-center">
                Sign in to {isFree ? 'claim' : 'buy'}
              </Link>
            ) : isFree ? (
              <ClaimFreeBundleButton bundleId={bundle.id} />
            ) : (
              <Link href={`/checkout/bundle/${bundle.id}`} className="btn-primary-grad mt-4 block w-full text-center">
                Get this bundle
              </Link>
            )}
          </div>
          <div className="card p-5 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-200">What happens after purchase</p>
            <ul className="mt-2 space-y-1">
              <li>• Each practice access is granted instantly to your account.</li>
              <li>• Voucher codes (if any) are emailed and visible under My Content → Vouchers.</li>
              <li>• Bundle items are non-transferable.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
