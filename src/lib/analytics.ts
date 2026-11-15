import { db } from '@/lib/db';
import { orderUsdCents, usdSnapshotsOf } from '@/lib/order-usd';

export type Range = { from: Date; to: Date };

/** Common time-window helpers anchored at the current instant. */
export const Ranges = {
  today(): Range {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    return { from, to: new Date() };
  },
  lastNDays(n: number): Range {
    const to = new Date();
    const from = new Date(to.getTime() - n * 24 * 60 * 60 * 1000);
    return { from, to };
  },
  mtd(): Range {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth(), 1);
    return { from, to };
  },
  ytd(): Range {
    const to = new Date();
    const from = new Date(to.getFullYear(), 0, 1);
    return { from, to };
  }
};

/**
 * Sum + count of PAID orders in a window, in USD. Orders are summed one by one
 * through orderUsdCents() so a historic SGD order is never added to USD cents
 * as if it were the same currency (and no FX conversion is applied).
 */
export async function paidOrdersIn(range: Range) {
  const [orders, refunds] = await Promise.all([
    db.order.findMany({
      where: { status: 'PAID', capturedAt: { gte: range.from, lte: range.to } },
      select: { id: true, amount: true, currency: true, discount: true, providerPayload: true }
    }),
    db.refund.findMany({
      where: { status: 'SUCCEEDED', createdAt: { gte: range.from, lte: range.to } },
      select: { amount: true, order: { select: { id: true, amount: true, currency: true, providerPayload: true } } }
    })
  ]);
  const snaps = usdSnapshotsOf([...orders, ...refunds.map((r) => r.order)]);
  const ordersCount = orders.length;
  const refundCount = refunds.length;
  const grossCents = orders.reduce((s, o) => s + orderUsdCents(o.amount, o, snaps), 0);
  const discountCents = orders.reduce((s, o) => s + orderUsdCents(o.discount, o, snaps), 0);
  const refundedCents = refunds.reduce((s, r) => s + orderUsdCents(r.amount, r.order, snaps), 0);
  const netCents = grossCents - refundedCents;
  const aovCents = ordersCount ? Math.round(grossCents / ordersCount) : 0;
  return {
    ordersCount,
    grossCents,
    refundedCents,
    netCents,
    discountCents,
    refundCount,
    aovCents
  };
}

/** New user signups in a window. */
export async function signupsIn(range: Range): Promise<number> {
  return db.user.count({
    where: { role: 'USER', createdAt: { gte: range.from, lte: range.to } }
  });
}

/** Active learners = unique userIds with an attempt in the window. */
export async function activeLearnersIn(range: Range): Promise<number> {
  const rows = await db.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(DISTINCT "userId") AS n
    FROM "Attempt"
    WHERE "userId" IS NOT NULL AND "startedAt" >= ${range.from} AND "startedAt" <= ${range.to}`;
  return Number(rows[0]?.n ?? 0);
}

/** Tax collected from Invoice rows (ISSUED status only) in a window. */
export async function taxCollectedIn(range: Range) {
  const rows = await db.invoice.findMany({
    where: { issueDate: { gte: range.from, lte: range.to }, status: 'ISSUED' },
    select: {
      currency: true,
      taxAmount: true,
      total: true,
      totalSgd: true,
      fxRateBpsToSgd: true,
      taxRate: true,
      taxLabel: true
    }
  });
  const byCurrency: Record<string, { tax: number; total: number; count: number; rate: number; label: string }> = {};
  let taxSgdTotal = 0;
  let totalSgd = 0;
  for (const r of rows) {
    const entry = byCurrency[r.currency] || { tax: 0, total: 0, count: 0, rate: r.taxRate, label: r.taxLabel };
    entry.tax += r.taxAmount;
    entry.total += r.total;
    entry.count += 1;
    byCurrency[r.currency] = entry;
    if (r.totalSgd != null) totalSgd += r.totalSgd;
    if (r.totalSgd != null && r.fxRateBpsToSgd) {
      taxSgdTotal += Math.round((r.taxAmount * r.fxRateBpsToSgd) / 10000);
    } else if (r.currency === 'SGD') {
      taxSgdTotal += r.taxAmount;
    }
  }
  // USD view for the admin KPIs: every amount the site lists is USD and no
  // SGD conversion is applied (lib/order-usd.ts), so amounts are summed as-is.
  const taxUsdTotal = rows.reduce((s, r) => s + r.taxAmount, 0);
  const totalUsd = rows.reduce((s, r) => s + r.total, 0);
  return { byCurrency, taxSgdTotal, totalSgd, taxUsdTotal, totalUsd, invoiceCount: rows.length };
}

/** Revenue breakdown grouped by a chosen dimension. */
export type RevenueBy = 'exam' | 'vendor' | 'tier' | 'day' | 'month';
export async function revenueBy(dim: RevenueBy, range: Range) {
  const orders = await db.order.findMany({
    where: { status: 'PAID', capturedAt: { gte: range.from, lte: range.to } },
    select: {
      id: true,
      amount: true,
      discount: true,
      currency: true,
      providerPayload: true,
      capturedAt: true,
      tier: true,
      exam: {
        select: { id: true, code: true, title: true, vendor: { select: { id: true, name: true } } }
      },
      bundle: { select: { id: true, title: true } }
    }
  });
  const snaps = usdSnapshotsOf(orders);
  const buckets = new Map<string, { label: string; amount: number; count: number; currency: string }>();
  for (const o of orders) {
    let key: string;
    let label: string;
    if (dim === 'exam') {
      key = o.exam?.id ?? o.bundle?.id ?? '—';
      label = o.exam
        ? `${o.exam.vendor.name} · ${o.exam.code}`
        : o.bundle
          ? o.bundle.title
          : 'Unknown';
    } else if (dim === 'vendor') {
      key = o.exam?.vendor.id ?? 'bundle-or-unknown';
      label = o.exam?.vendor.name ?? (o.bundle ? 'Practice Exam / Exam Voucher' : 'Unknown');
    } else if (dim === 'tier') {
      key = o.tier ?? (o.bundle ? 'BUNDLE_PRODUCT' : 'NONE');
      label = key;
    } else if (dim === 'day') {
      const d = o.capturedAt ?? new Date();
      key = d.toISOString().slice(0, 10);
      label = key;
    } else {
      const d = o.capturedAt ?? new Date();
      key = d.toISOString().slice(0, 7);
      label = key;
    }
    const cur = buckets.get(key) ?? { label, amount: 0, count: 0, currency: 'USD' };
    cur.amount += orderUsdCents(o.amount, o, snaps);
    cur.count += 1;
    buckets.set(key, cur);
  }
  return Array.from(buckets.entries())
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.amount - a.amount);
}

/** Per-question stats from submitted attempts. */
export async function questionStats(examId: string) {
  const attempts = await db.attempt.findMany({
    where: { examId, submittedAt: { not: null } },
    select: { questionIds: true, responses: true }
  });
  const totals = new Map<string, { shown: number; correct: number }>();
  const questions = await db.question.findMany({
    where: { examId, status: 'PUBLISHED' },
    select: { id: true, stem: true, correct: true }
  });
  const correctMap = new Map(questions.map((q) => [q.id, q.correct as string[]]));
  for (const a of attempts) {
    for (const qid of a.questionIds) {
      const resp = (a.responses as any)?.[qid];
      if (!resp) continue;
      const expected = correctMap.get(qid) ?? [];
      const given = resp.answer as string[] | undefined;
      const ok =
        Array.isArray(given) && given.length === expected.length && given.every((g) => expected.includes(g));
      const t = totals.get(qid) ?? { shown: 0, correct: 0 };
      t.shown++;
      if (ok) t.correct++;
      totals.set(qid, t);
    }
  }
  return questions.map((q) => {
    const t = totals.get(q.id) ?? { shown: 0, correct: 0 };
    return { id: q.id, stem: q.stem, shown: t.shown, correct: t.correct, accuracy: t.shown ? t.correct / t.shown : null };
  });
}

/** Cohort retention: signup-month × payment-month. */
export async function cohortRetention(months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const users = await db.user.findMany({
    where: { role: 'USER', createdAt: { gte: since } },
    select: { id: true, createdAt: true }
  });
  const orders = await db.order.findMany({
    where: { status: 'PAID', capturedAt: { gte: since }, userId: { in: users.map((u) => u.id) } },
    select: { userId: true, capturedAt: true }
  });
  const cohortByUser = new Map(users.map((u) => [u.id, u.createdAt.toISOString().slice(0, 7)]));
  const cells = new Map<string, Set<string>>();
  for (const o of orders) {
    const cohort = cohortByUser.get(o.userId);
    if (!cohort || !o.capturedAt) continue;
    const pay = o.capturedAt.toISOString().slice(0, 7);
    const k = `${cohort}|${pay}`;
    const s = cells.get(k) ?? new Set<string>();
    s.add(o.userId);
    cells.set(k, s);
  }
  const cohortSizes = new Map<string, number>();
  for (const u of users) {
    const c = u.createdAt.toISOString().slice(0, 7);
    cohortSizes.set(c, (cohortSizes.get(c) ?? 0) + 1);
  }
  const result: { cohort: string; size: number; cells: { month: string; count: number }[] }[] = [];
  for (const [cohort, size] of cohortSizes.entries()) {
    const row: { month: string; count: number }[] = [];
    for (let m = 0; m <= months; m++) {
      const d = new Date(cohort + '-01');
      d.setMonth(d.getMonth() + m);
      const month = d.toISOString().slice(0, 7);
      row.push({ month, count: cells.get(`${cohort}|${month}`)?.size ?? 0 });
    }
    result.push({ cohort, size, cells: row });
  }
  result.sort((a, b) => a.cohort.localeCompare(b.cohort));
  return result;
}

/** Per-exam analytics: published questions, attempts, average score, pass rate. */
export async function examAnalytics() {
  const exams = await db.exam.findMany({
    where: { deletedAt: null },
    include: {
      vendor: { select: { name: true } },
      _count: {
        select: {
          questions: { where: { status: 'PUBLISHED' } },
          attempts: true,
          orders: { where: { status: 'PAID' } }
        }
      }
    },
    orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }]
  });
  const [attemptStats, passStats] = await Promise.all([
    db.attempt.groupBy({
      by: ['examId'],
      where: { submittedAt: { not: null } },
      _avg: { score: true },
      _count: true
    }),
    db.attempt.groupBy({
      by: ['examId'],
      where: { submittedAt: { not: null }, passed: true },
      _count: true
    })
  ]);
  const avgByExam = new Map(
    attemptStats.map((s) => [s.examId, { avg: s._avg.score ?? null, count: s._count as unknown as number }])
  );
  const passByExam = new Map(passStats.map((s) => [s.examId, s._count as unknown as number]));
  return exams.map((e) => {
    const completed = avgByExam.get(e.id)?.count ?? 0;
    const passed = passByExam.get(e.id) ?? 0;
    return {
      id: e.id,
      vendor: e.vendor.name,
      code: e.code,
      title: e.title,
      published: e.published,
      publishedQuestions: e._count.questions,
      totalAttempts: e._count.attempts,
      paidOrders: e._count.orders,
      avgScore: avgByExam.get(e.id)?.avg ?? null,
      completedAttempts: completed,
      passRate: completed > 0 ? passed / completed : null
    };
  });
}
