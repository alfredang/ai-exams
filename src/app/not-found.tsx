import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="container-app max-w-xl py-8 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">The page you&apos;re looking for doesn&apos;t exist. Try one of these instead.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/practice-exams" className="btn-primary">Browse Practice Exams</Link>
        <Link href="/exam-vouchers" className="btn-outline">Exam Vouchers</Link>
        <Link href="/p/support" className="btn-outline">Contact support</Link>
      </div>
    </div>
  );
}
