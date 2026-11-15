import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { examAnalytics } from '@/lib/analytics';
import { PageHeader } from '@/components/admin/page-header';
import { DataTable, type Column } from '@/components/admin/data-table';
import { StatusBadge } from '@/components/admin/badge';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Row = Awaited<ReturnType<typeof examAnalytics>>[number];

export default async function ExamAnalyticsPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const rows = await examAnalytics();

  const columns: Column<Row>[] = [
    {
      key: 'exam',
      header: 'Exam',
      cell: (r) => (
        <Link href={`/admin-dashboard/exams/${r.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          {r.vendor} · {r.code}
        </Link>
      )
    },
    { key: 'title', header: 'Title', cell: (r) => <span className="text-[12px] text-slate-700 dark:text-slate-200">{r.title}</span> },
    { key: 'pub', header: 'Status', cell: (r) => <StatusBadge status={r.published ? 'PUBLISHED' : 'DRAFT'} /> },
    { key: 'questions', header: 'Pub Qs', align: 'right', cell: (r) => r.publishedQuestions },
    { key: 'orders', header: 'Paid', align: 'right', cell: (r) => r.paidOrders },
    { key: 'attempts', header: 'Attempts', align: 'right', cell: (r) => r.totalAttempts },
    {
      key: 'avg',
      header: 'Avg score',
      align: 'right',
      cell: (r) =>
        r.avgScore != null ? (
          <span>{r.avgScore.toFixed(1)}%</span>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    {
      key: 'pass',
      header: 'Pass rate',
      align: 'right',
      cell: (r) =>
        r.passRate != null ? (
          <span className={r.passRate >= 0.7 ? 'text-emerald-700 dark:text-emerald-300' : r.passRate < 0.4 ? 'text-red-600' : ''}>
            {(r.passRate * 100).toFixed(1)}%
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Exam analytics"
        subtitle={`${rows.length} active exam${rows.length === 1 ? '' : 's'} — questions, paid orders, attempts, avg score, pass rate.`}
        actions={
          <a href="/api/admin/reports/exams/export" download className="btn-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
            <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
          </a>
        }
      />

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} empty="No active exams." />
    </div>
  );
}
