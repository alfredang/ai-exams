import Link from 'next/link';
import { AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';

export default function FailedPage() {
  return (
    <div className="container-app max-w-xl py-20">
      <div className="card p-10 text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment failed</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          We couldn't complete your payment. <b>No charge was made</b> to your account.
        </p>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left text-sm dark:bg-slate-900">
          <p className="font-medium text-slate-700 dark:text-slate-200">Common causes:</p>
          <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
            <li>• PayPal session timed out — try again from the exam page.</li>
            <li>• Bank declined the charge (insufficient funds or international block).</li>
            <li>• Browser blocked the PayPal popup — check popup blockers.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/practice-exams" className="btn-primary-grad inline-flex items-center justify-center gap-1">
            <RotateCcw className="h-4 w-4" /> Try again
          </Link>
          <Link href="mailto:sales@tertiarycourses.com.sg" className="btn-outline inline-flex items-center justify-center gap-1">
            Contact support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
