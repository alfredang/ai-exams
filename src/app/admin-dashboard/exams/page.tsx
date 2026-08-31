import Link from 'next/link';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { Pencil, Trash2, BookOpenCheck, Archive, ArchiveRestore, Copy } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar, FilterField } from '@/components/admin/filter-bar';
import { DataTable, type Column } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/pager';
import { StatusBadge } from '@/components/admin/badge';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { buildQS } from '@/components/admin/qs';
import { SelectAllCheckbox, SelectedCounter, SelectAllMatchingBanner } from '@/components/admin/bulk-select';

export const dynamic = 'force-dynamic';

/** Build a Prisma `where` clause for the search bar.
 *
 *  Robust by design:
 *   - searches title, code, slug, description, vendor name, and vendor slug
 *   - case-insensitive substring (ILIKE '%term%')
 *   - whitespace-tokenized: "microsoft administrator" → each token must
 *     match at least one field. Lets multi-word searches find rows where
 *     the words aren't contiguous (e.g. "ms 102" finds MS-102 titles).
 *   - empty / whitespace-only query short-circuits to no filter.
 *
 *  Returned as a partial `where` to spread into the caller's clause.
 */
function searchClause(q: string) {
  const tokens = q.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return {};
  const ci = (term: string) => ({ contains: term, mode: 'insensitive' as const });
  const tokenOr = (tok: string) => ({
    OR: [
      { title: ci(tok) },
      { code: ci(tok) },
      { slug: ci(tok) },
      { description: ci(tok) },
      { vendor: { is: { name: ci(tok) } } },
      { vendor: { is: { slug: ci(tok) } } }
    ]
  });
  return tokens.length === 1 ? tokenOr(tokens[0]) : { AND: tokens.map(tokenOr) };
}

/** Relation-filter fragment for the question-content dimension. Orthogonal to
 *  the lifecycle View (active/inactive/archived) — this tracks whether the
 *  exam's *questions* are ready.
 *    ''       → any (no constraint)
 *    'clean'  → has ≥1 PUBLISHED question and 0 DRAFT (ready to ship)
 *    'drafts' → has ≥1 DRAFT question (work outstanding)
 *    'empty'  → has 0 questions at all (a bare shell)
 */
function qstatusClause(qs: string) {
  switch (qs) {
    case 'clean':
      return { questions: { some: { status: 'PUBLISHED' as const }, none: { status: 'DRAFT' as const } } };
    case 'drafts':
      return { questions: { some: { status: 'DRAFT' as const } } };
    case 'empty':
      return { questions: { none: {} } };
    default:
      return {};
  }
}

async function deleteExam(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const id = String(formData.get('id'));
  if (!id) return;
  const [attempts, orders] = await Promise.all([
    db.attempt.count({ where: { examId: id } }),
    db.order.count({ where: { examId: id } })
  ]);
  if (attempts > 0 || orders > 0) return; // refuse if referenced
  await db.question.deleteMany({ where: { examId: id } });
  await db.entitlement.deleteMany({ where: { examId: id } });
  await db.exam.delete({ where: { id } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'exam.delete', targetType: 'Exam', targetId: id, metadata: {} }
  });
  revalidatePath('/admin-dashboard/exams');
}

async function archiveExam(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const id = String(formData.get('id'));
  if (!id) return;
  await db.exam.update({ where: { id }, data: { deletedAt: new Date(), published: false } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'exam.archive', targetType: 'Exam', targetId: id, metadata: {} }
  });
  revalidatePath('/admin-dashboard/exams');
}

async function restoreExam(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const id = String(formData.get('id'));
  if (!id) return;
  await db.exam.update({ where: { id }, data: { deletedAt: null } });
  await db.adminLog.create({
    data: { adminId: user.id, action: 'exam.restore', targetType: 'Exam', targetId: id, metadata: {} }
  });
  revalidatePath('/admin-dashboard/exams');
}

async function bulkExamAction(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const op = String(formData.get('op') || '');

  // When the "Select all N matching" banner is engaged, the page does NOT
  // submit per-row checkbox ids — instead we resolve ids on the server
  // from the same filter the table was built with (scales without
  // materialising every checkbox in the DOM).
  let ids: string[];
  if (formData.get('selectAllMatching') === '1') {
    const fVendor = String(formData.get('filterVendor') || '');
    const fLevel = String(formData.get('filterLevel') || '');
    const fQ = String(formData.get('filterQ') || '').trim();
    const fQstatus = String(formData.get('filterQstatus') || '');
    const rawView = String(formData.get('filterView') || '');
    const fView: 'active' | 'inactive' | 'archived' | 'all' =
      rawView === 'inactive' || rawView === 'archived' || rawView === 'all'
        ? rawView
        : 'active';
    const where = {
      ...(fView === 'active'
        ? { deletedAt: null, published: true }
        : fView === 'inactive'
          ? { deletedAt: null, published: false }
          : fView === 'archived'
            ? { deletedAt: { not: null } }
            : {}),
      ...(fVendor ? { vendor: { slug: fVendor } } : {}),
      ...(fLevel ? { level: fLevel } : {}),
      ...searchClause(fQ),
      ...qstatusClause(fQstatus)
    };
    const matching = await db.exam.findMany({ where, select: { id: true } });
    ids = matching.map((e) => e.id);
  } else {
    ids = formData.getAll('ids').map(String).filter(Boolean);
  }
  if (!ids.length) return;
  if (op === 'publish') {
    const result = await db.exam.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { published: true }
    });
    await db.adminLog.create({
      data: { adminId: user.id, action: 'exam.bulk_publish', targetType: 'Exam', targetId: ids[0], metadata: { ids, count: result.count } }
    });
  } else if (op === 'unpublish') {
    const result = await db.exam.updateMany({
      where: { id: { in: ids } },
      data: { published: false }
    });
    await db.adminLog.create({
      data: { adminId: user.id, action: 'exam.bulk_unpublish', targetType: 'Exam', targetId: ids[0], metadata: { ids, count: result.count } }
    });
  } else if (op === 'archive') {
    const result = await db.exam.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date(), published: false }
    });
    await db.adminLog.create({
      data: { adminId: user.id, action: 'exam.bulk_archive', targetType: 'Exam', targetId: ids[0], metadata: { ids, count: result.count } }
    });
  }
  revalidatePath('/admin-dashboard/exams');
}

async function duplicateExam(formData: FormData) {
  'use server';
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return;
  const id = String(formData.get('id'));
  if (!id) return;
  const orig = await db.exam.findUnique({ where: { id }, include: { questions: true } });
  if (!orig) return;
  // Append a copy suffix to code+slug; admin can rename after.
  const suffix = `-copy-${Date.now().toString(36).slice(-4)}`;
  const cloned = await db.exam.create({
    data: {
      vendorId: orig.vendorId,
      code: `${orig.code}${suffix}`,
      slug: `${orig.slug}${suffix}`,
      title: `${orig.title} (copy)`,
      description: orig.description,
      level: orig.level,
      durationMinutes: orig.durationMinutes,
      passingScore: orig.passingScore,
      questionCount: orig.questionCount,
      infoUrl: orig.infoUrl,
      label: orig.label,
      domains: orig.domains as any,
      published: false,
      createdById: user.id
    }
  });
  if (orig.questions.length) {
    await db.question.createMany({
      data: orig.questions.map((q) => ({
        examId: cloned.id,
        stem: q.stem,
        type: q.type,
        domain: q.domain,
        difficulty: q.difficulty,
        explanation: q.explanation,
        options: q.options as any,
        correct: q.correct as any,
        references: q.references as any,
        status: 'DRAFT',
        generatedBy: q.generatedBy,
        isTeaser: false
      }))
    });
  }
  await db.adminLog.create({
    data: { adminId: user.id, action: 'exam.duplicate', targetType: 'Exam', targetId: id, metadata: { newExamId: cloned.id } }
  });
  revalidatePath('/admin-dashboard/exams');
}

const LEVELS = ['Foundational', 'Associate', 'Professional', 'Specialty'];
const PAGE_SIZE = 50;

type ExamRow = Awaited<ReturnType<typeof loadExams>>[number];

async function loadExams(where: any, skip: number, take: number) {
  const exams = await db.exam.findMany({
    where,
    include: {
      vendor: true,
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { questions: true, attempts: true, orders: true } }
    },
    orderBy: [{ vendor: { name: 'asc' } }, { title: 'asc' }],
    skip,
    take
  });
  // Per-exam draft/published question counts for the publish-status dot indicator.
  const examIds = exams.map((e) => e.id);
  const statusCounts = examIds.length
    ? await db.question.groupBy({
        by: ['examId', 'status'],
        where: { examId: { in: examIds } },
        _count: { _all: true }
      })
    : [];
  const draftByExam = new Map<string, number>();
  const publishedByExam = new Map<string, number>();
  for (const r of statusCounts) {
    if (r.status === 'DRAFT') draftByExam.set(r.examId, r._count._all);
    else if (r.status === 'PUBLISHED') publishedByExam.set(r.examId, r._count._all);
  }
  return exams.map((e) => ({
    ...e,
    draftCount: draftByExam.get(e.id) ?? 0,
    publishedCount: publishedByExam.get(e.id) ?? 0
  }));
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function AdminExamsPage({
  searchParams
}: {
  searchParams: Promise<{ vendor?: string; level?: string; q?: string; view?: string; qstatus?: string; archived?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const vendorFilter = sp.vendor || '';
  const levelFilter = sp.level || '';
  const q = (sp.q || '').trim();
  // Single View dropdown now collapses what used to be two filters
  // (?status= + ?archived=) into one ?view= param. Old links still work:
  // we map legacy ?status= / ?archived= to the matching view value.
  // Default is `active` so the list opens on the live catalog; switch the
  // View dropdown to `inactive` / `archived` / `all` to surface hidden rows
  // (e.g. freshly-seeded INACTIVE base shells).
  type View = 'active' | 'inactive' | 'archived' | 'all';
  function resolveView(): View {
    const raw = sp.view;
    if (raw === 'active' || raw === 'inactive' || raw === 'archived' || raw === 'all') return raw;
    // Legacy compatibility — old bookmarks/links.
    if (sp.archived === '1') return 'archived';
    if (sp.archived === 'all') return 'all';
    if (sp.status === 'inactive') return 'inactive';
    if (sp.status === 'active') return 'active';
    return 'active'; // default
  }
  const view: View = resolveView();

  // Question-readiness dimension, orthogonal to the lifecycle View. Surfaced
  // both as a "Questions" dropdown and as clickable tracker chips up top.
  type QStatus = '' | 'clean' | 'drafts' | 'empty';
  const qstatus: QStatus = (['clean', 'drafts', 'empty'] as const).includes(sp.qstatus as any)
    ? (sp.qstatus as QStatus)
    : '';

  const requestedPage = Math.max(1, Number(sp.page || 1) || 1);

  // Build the `where` for a given view, sharing the search + vendor + level
  // filters. Extracted so the empty-state hint can count how many rows would
  // match in OTHER views with the same search.
  function buildWhere(v: View, qs: QStatus = qstatus) {
    return {
      ...(v === 'active'
        ? { deletedAt: null, published: true }
        : v === 'inactive'
          ? { deletedAt: null, published: false }
          : v === 'archived'
            ? { deletedAt: { not: null } }
            : {}),
      ...(vendorFilter ? { vendor: { slug: vendorFilter } } : {}),
      ...(levelFilter ? { level: levelFilter } : {}),
      ...searchClause(q),
      ...qstatusClause(qs)
    };
  }

  const where = buildWhere(view);

  // Tracker chip counts — respect the vendor/level/search filters, but each
  // chip carries its own lifecycle View + question status so the numbers stay
  // navigational. Plain COUNTs (no row hydration), run in parallel.
  const [trkActive, trkInactive, trkArchived, trkDrafts, trkEmpty] = await Promise.all([
    db.exam.count({ where: buildWhere('active', '') }),
    db.exam.count({ where: buildWhere('inactive', '') }),
    db.exam.count({ where: buildWhere('archived', '') }),
    db.exam.count({ where: buildWhere('all', 'drafts') }),
    db.exam.count({ where: buildWhere('all', 'empty') })
  ]);

  const [vendors, totalCount] = await Promise.all([
    db.vendor.findMany({ orderBy: { name: 'asc' } }),
    db.exam.count({ where })
  ]);

  // When the current view returns 0 results AND the user has narrowed by
  // search/vendor/level, look in the other views with the same filters and
  // surface "found N in inactive — switch?" so it's obvious where the rows
  // are hiding. Skip when filters are empty (don't run 3 extra counts on the
  // default landing page).
  const hasFilters = !!(q || vendorFilter || levelFilter);
  let viewHints: { view: View; count: number }[] = [];
  if (totalCount === 0 && hasFilters) {
    const others = (['active', 'inactive', 'archived', 'all'] as const).filter((v) => v !== view);
    const counts = await Promise.all(others.map((v) => db.exam.count({ where: buildWhere(v, qstatus) })));
    viewHints = others.map((v, i) => ({ view: v, count: counts[i] })).filter((h) => h.count > 0);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const exams = await loadExams(where, (page - 1) * PAGE_SIZE, PAGE_SIZE);

  // baseParams omits view when it's the default ('active') for cleaner URLs.
  const baseParams = { vendor: vendorFilter, level: levelFilter, q, view: view === 'active' ? undefined : view, qstatus: qstatus || undefined };
  const buildHref = (p: number) =>
    `/admin-dashboard/exams${buildQS({ ...baseParams, page: p === 1 ? undefined : p })}`;

  const viewParam = view === 'active' ? undefined : view;
  const qstatusParam = qstatus || undefined;
  // Tracker chips set both the lifecycle view and the question status at once.
  const chipHref = (v: View, qs: QStatus) =>
    `/admin-dashboard/exams${buildQS({ vendor: vendorFilter, level: levelFilter, q, view: v === 'active' ? undefined : v, qstatus: qs || undefined })}`;
  const QSTATUS_LABEL: Record<Exclude<QStatus, ''>, string> = {
    clean: 'all published',
    drafts: 'has draft Qs',
    empty: 'no questions'
  };
  const activeFilters = [
    vendorFilter && {
      key: 'vendor',
      label: vendors.find((v) => v.slug === vendorFilter)?.name ?? vendorFilter,
      clearHref: `/admin-dashboard/exams${buildQS({ level: levelFilter, q, view: viewParam, qstatus: qstatusParam })}`
    },
    levelFilter && {
      key: 'level',
      label: levelFilter,
      clearHref: `/admin-dashboard/exams${buildQS({ vendor: vendorFilter, q, view: viewParam, qstatus: qstatusParam })}`
    },
    q && {
      key: 'search',
      label: q,
      clearHref: `/admin-dashboard/exams${buildQS({ vendor: vendorFilter, level: levelFilter, view: viewParam, qstatus: qstatusParam })}`
    },
    view !== 'active' && {
      key: 'view',
      label: view,
      clearHref: `/admin-dashboard/exams${buildQS({ vendor: vendorFilter, level: levelFilter, q, qstatus: qstatusParam })}`
    },
    qstatus && {
      key: 'qstatus',
      label: QSTATUS_LABEL[qstatus],
      clearHref: `/admin-dashboard/exams${buildQS({ vendor: vendorFilter, level: levelFilter, q, view: viewParam })}`
    }
  ].filter(Boolean) as { key: string; label: string; clearHref: string }[];

  const BULK_FORM_ID = 'admin-exams-bulk-form';

  const columns: Column<ExamRow>[] = [
    {
      key: 'select',
      header: '',
      headerClassName: 'w-10',
      cell: (e) => (
        <input
          type="checkbox"
          name="ids"
          value={e.id}
          form={BULK_FORM_ID}
          aria-label={`Select ${e.code}`}
          className="h-4 w-4 cursor-pointer accent-blue-600"
        />
      )
    },
    {
      key: 'vendor',
      header: 'Vendor',
      cell: (e) => <span className="text-slate-700 dark:text-slate-200">{e.vendor.name}</span>
    },
    {
      key: 'title',
      header: 'Exam Name',
      cell: (e) => {
        const baseTitle = e.title.split(' — ')[0].replace(/\s*\(Practice Exam\s+\d+\)\s*$/i, '');
        const variantMatch = e.code.match(/-P(\d+)$/i);
        return (
          <Link
            href={`/admin-dashboard/exams/${e.id}`}
            className="font-medium text-slate-900 hover:underline dark:text-slate-100"
          >
            {baseTitle}
            {variantMatch && (
              <span className="ml-1 text-[11px] font-normal text-slate-500 dark:text-slate-400">
                · P{variantMatch[1]}
              </span>
            )}
          </Link>
        );
      }
    },
    {
      key: 'publishDot',
      header: '',
      align: 'left',
      headerClassName: 'w-6',
      className: 'pl-0 pr-3',
      cell: (e) => {
        const total = e.draftCount + e.publishedCount;
        let cls = 'bg-slate-400 dark:bg-slate-600';
        let title = 'No questions yet';
        let aria = 'No questions';
        if (total > 0 && e.draftCount === 0) {
          cls = 'bg-emerald-500';
          title = `All ${e.publishedCount} questions published`;
          aria = 'All questions published';
        } else if (e.draftCount > 0) {
          cls = 'bg-rose-500';
          title = `${e.draftCount} draft, ${e.publishedCount} published`;
          aria = `${e.draftCount} draft questions remaining`;
        }
        return (
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`}
            title={title}
            aria-label={aria}
          />
        );
      }
    },
    { key: 'code', header: 'Code', cell: (e) => <span className="font-mono text-[12px]">{e.code}</span> },
    {
      key: 'label',
      header: 'Label',
      cell: (e) =>
        e.label ? (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            {e.label}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    { key: 'level', header: 'Level', cell: (e) => e.level },
    {
      key: 'status',
      header: 'Status',
      // On the "All" view archived and merely-inactive rows live side by
      // side — surface ARCHIVED explicitly so they are distinguishable
      // beyond just the Restore icon in the actions column.
      cell: (e) =>
        e.deletedAt
          ? <StatusBadge status="ARCHIVED" />
          : <StatusBadge status={e.published ? 'ACTIVE' : 'INACTIVE'} />
    },
    { key: 'qPerExam', header: 'Q / Exam', cell: (e) => e.questionCount, align: 'right' },
    { key: 'duration', header: 'Duration', cell: (e) => `${e.durationMinutes} min`, align: 'right' },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (e) => <span className="whitespace-nowrap text-[12px] text-slate-600 dark:text-slate-300">{fmtDate(e.createdAt)}</span>
    },
    {
      key: 'updatedAt',
      header: 'Edited',
      cell: (e) => <span className="whitespace-nowrap text-[12px] text-slate-600 dark:text-slate-300">{fmtDate(e.updatedAt)}</span>
    },
    {
      key: 'createdBy',
      header: 'Created by',
      cell: (e) =>
        e.createdBy ? (
          <span className="whitespace-nowrap text-[12px] text-slate-700 dark:text-slate-200">{e.createdBy.name || e.createdBy.email}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    {
      key: 'infoUrl',
      header: 'Info',
      cell: (e) =>
        e.infoUrl ? (
          <a
            href={e.infoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Open
          </a>
        ) : (
          <span className="text-slate-400">—</span>
        )
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      headerClassName: 'w-36',
      cell: (e) => {
        const canHardDelete = e._count.attempts === 0 && e._count.orders === 0;
        const isArchived = !!e.deletedAt;
        return (
          <div className="flex items-center justify-end gap-0.5">
            {!isArchived && (
              <Link href={`/admin-dashboard/exams/${e.id}/test`} title="Test exam as candidate" className="icon-btn">
                <BookOpenCheck className="h-3.5 w-3.5" />
              </Link>
            )}
            <Link href={`/admin-dashboard/exams/${e.id}`} title="Edit exam" className="icon-btn">
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            <form action={duplicateExam} className="inline-flex">
              <input type="hidden" name="id" value={e.id} />
              <button title="Duplicate exam (questions copy as DRAFT)" className="icon-btn">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </form>
            {isArchived ? (
              <form action={restoreExam} className="inline-flex">
                <input type="hidden" name="id" value={e.id} />
                <button title="Restore from archive" className="icon-btn text-emerald-600 dark:text-emerald-400">
                  <ArchiveRestore className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <form action={archiveExam} className="inline-flex">
                <input type="hidden" name="id" value={e.id} />
                <ConfirmButton
                  message={`Archive exam "${e.code}"? It will be hidden from the public catalog but data is preserved.`}
                  className="h-6 w-6 p-0"
                  variant="neutral"
                >
                  <Archive className="h-3.5 w-3.5" />
                </ConfirmButton>
              </form>
            )}
            <form action={deleteExam} className="inline-flex">
              <input type="hidden" name="id" value={e.id} />
              <ConfirmButton
                message={`Hard-delete "${e.code}"? Permanent. Allowed only when there are no attempts or orders.`}
                disabled={!canHardDelete}
                title={canHardDelete ? 'Hard delete (no attempts/orders)' : 'Cannot hard delete — use Archive'}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </ConfirmButton>
            </form>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="View Exams"
        subtitle={`${totalCount} exam${totalCount === 1 ? '' : 's'}${totalPages > 1 ? ` · page ${page} of ${totalPages}` : ''}`}
        actions={
          <Link href="/admin-dashboard/exams/new" className="btn-sm bg-blue-600 text-white hover:bg-blue-700">
            + Create Exam
          </Link>
        }
      />

      {/* Question-readiness tracker — click a chip to filter the table.
          Counts respect the active vendor/level/search filters. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Tracker:</span>
        {(
          [
            { key: 'active', label: 'Active', count: trkActive, href: chipHref('active', ''), on: view === 'active' && !qstatus, dot: 'bg-emerald-500' },
            { key: 'inactive', label: 'Inactive', count: trkInactive, href: chipHref('inactive', ''), on: view === 'inactive' && !qstatus, dot: 'bg-amber-500' },
            { key: 'archived', label: 'Archived', count: trkArchived, href: chipHref('archived', ''), on: view === 'archived' && !qstatus, dot: 'bg-slate-400' },
            { key: 'drafts', label: 'Draft questions', count: trkDrafts, href: chipHref('all', 'drafts'), on: qstatus === 'drafts', dot: 'bg-rose-500' },
            { key: 'empty', label: 'No questions', count: trkEmpty, href: chipHref('all', 'empty'), on: qstatus === 'empty', dot: 'bg-slate-300 dark:bg-slate-600' }
          ] as const
        ).map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition ${
              c.on
                ? 'border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${c.dot}`} />
            {c.label}
            <span className="font-semibold tabular-nums">{c.count}</span>
          </Link>
        ))}
      </div>

      <FilterBar
        resetHref={activeFilters.length > 0 ? '/admin-dashboard/exams' : undefined}
        activeFilters={activeFilters}
      >
        <FilterField label="Vendor">
          <select name="vendor" defaultValue={vendorFilter} className="input-sm">
            <option value="">All vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.slug}>
                {v.name}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Level">
          <select name="level" defaultValue={levelFilter} className="input-sm">
            <option value="">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Search" className="min-w-[14rem] flex-1">
          <input name="q" defaultValue={q} placeholder="Title, code, slug, vendor…" className="input-sm" />
        </FilterField>
        <FilterField label="View">
          <select name="view" defaultValue={view} className="input-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </FilterField>
        <FilterField label="Questions">
          <select name="qstatus" defaultValue={qstatus} className="input-sm">
            <option value="">Any</option>
            <option value="clean">All published</option>
            <option value="drafts">Has drafts</option>
            <option value="empty">No questions</option>
          </select>
        </FilterField>
      </FilterBar>

      {/* Bulk form visible on Active / Inactive / All views. Hidden on
          Archived-only view (which uses per-row Restore icons). */}
      {view !== 'archived' && (
        <form
          id={BULK_FORM_ID}
          action={bulkExamAction}
          data-total-matching={totalCount}
          className="sticky top-24 z-30 flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50/95 px-3 py-2 text-[12px] shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
        >
          {/* Hidden filter inputs: when SelectAllMatchingBanner promotes
              the selection to "all matching", bulkExamAction re-resolves
              the id list server-side from these (instead of per-row ids). */}
          <input type="hidden" name="filterVendor" value={vendorFilter} />
          <input type="hidden" name="filterLevel" value={levelFilter} />
          <input type="hidden" name="filterQ" value={q} />
          <input type="hidden" name="filterView" value={view} />
          <input type="hidden" name="filterQstatus" value={qstatus} />
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-slate-700 dark:text-slate-200">
            <SelectAllCheckbox formId={BULK_FORM_ID} className="h-4 w-4 accent-blue-600" />
            Select all
          </label>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 dark:text-slate-400">
            <SelectedCounter formId={BULK_FORM_ID} /> selected
          </span>
          <SelectAllMatchingBanner
            formId={BULK_FORM_ID}
            pageCount={exams.length}
            totalCount={totalCount}
          />
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">With selected:</span>
          <button
            type="submit"
            name="op"
            value="publish"
            className="btn-sm bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Activate
          </button>
          <button
            type="submit"
            name="op"
            value="unpublish"
            className="btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Deactivate
          </button>
          <button
            type="submit"
            name="op"
            value="archive"
            className="btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Archive
          </button>
        </form>
      )}

      <DataTable
        columns={columns}
        rows={exams}
        rowKey={(e) => e.id}
        empty={
          viewHints.length > 0 ? (
            <div className="space-y-2">
              <div>
                No exams match in <span className="font-semibold capitalize">{view}</span>.
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[12px]">
                <span className="text-slate-500">Found in:</span>
                {viewHints.map((h) => (
                  <Link
                    key={h.view}
                    href={`/admin-dashboard/exams${buildQS({ ...baseParams, view: h.view === 'all' ? undefined : h.view })}`}
                    className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-900/60"
                  >
                    <span className="capitalize">{h.view}</span>
                    <span className="text-blue-700 dark:text-blue-300">({h.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              No exams match this filter.{' '}
              <Link href="/admin-dashboard/exams" className="text-blue-600 hover:underline dark:text-blue-400">
                Clear
              </Link>
            </>
          )
        }
      />

      <Pager page={page} pages={totalPages} buildHref={buildHref} />
    </div>
  );
}
