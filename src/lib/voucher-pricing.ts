import type { PrismaClient } from '@prisma/client';
import { voucherPriceWithGst } from './currency';
import { EXAM_BLUEPRINTS } from './exam-blueprints';
import { displayExamCode, voucherHref, voucherOnSale, voucherTitleFor } from './products';

/**
 * Weekly Exam Voucher price check (exam-voucher-pricer agent, /api/v1/exam-vouchers).
 * The agent reads each vendor's official list price; the server works out the
 * selling price with voucherPriceWithGst() (+10% for GST, rounded down) and
 * decides whether to apply it. Every check is logged as AdminLog
 * `voucher.price_check`; an applied price also logs `voucher.update`
 * (via: 'api'), so the deploy seed stops writing its older spec price.
 */
export const PRICE_CHECK_ACTION = 'voucher.price_check';
/** A change larger than this (vs. the current selling price) is held for an admin, never applied. */
export const MAX_AUTO_CHANGE = 0.25;
export const MIN_LIST_CENTS = 1_000; // US$10
export const MAX_LIST_CENTS = 300_000; // US$3,000

export type LastCheck = {
  at: string;
  status: string;
  listPriceCents: number | null;
  sourceUrl: string | null;
  by: string | null;
};

export type VoucherRow = {
  bundleId: string;
  slug: string;
  voucherSlug: string | null;
  code: string;
  certification: string;
  vendor: string;
  priceCents: number;
  onSale: boolean;
  voucherUrl: string;
  officialPages: string[];
  lastCheck: LastCheck | null;
  /** Latest price an admin typed in the dashboard (not this agent), if any. */
  manualEditAt: string | null;
};

type Meta = Record<string, unknown>;
const meta = (m: unknown): Meta => (m && typeof m === 'object' && !Array.isArray(m) ? (m as Meta) : {});

export async function listVoucherRows(db: PrismaClient): Promise<VoucherRow[]> {
  const bundles = await db.bundle.findMany({
    where: { priceVoucher: { not: null } },
    orderBy: { title: 'asc' },
    select: {
      id: true, slug: true, title: true, price: true, published: true, voucherSlug: true, voucherTitle: true, priceVoucher: true, voucherPublished: true,
      items: {
        where: { tier: 'PRACTICE' }, orderBy: { position: 'asc' }, take: 1,
        select: { exam: { select: { code: true, infoUrl: true, vendor: { select: { name: true, slug: true } } } } }
      }
    }
  });
  const ids = bundles.map((b) => b.id);
  const logs = await db.adminLog.findMany({
    where: { targetType: 'Bundle', targetId: { in: ids }, action: { in: [PRICE_CHECK_ACTION, 'voucher.update'] } },
    orderBy: { createdAt: 'desc' },
    select: { action: true, targetId: true, metadata: true, createdAt: true }
  });
  const lastCheck = new Map<string, LastCheck>();
  const manualEdit = new Map<string, Date>();
  for (const l of logs) {
    const id = l.targetId!;
    const m = meta(l.metadata);
    if (l.action === PRICE_CHECK_ACTION && !lastCheck.has(id)) {
      lastCheck.set(id, {
        at: l.createdAt.toISOString(),
        status: String(m.status ?? ''),
        listPriceCents: typeof m.listPriceCents === 'number' ? m.listPriceCents : null,
        sourceUrl: typeof m.sourceUrl === 'string' ? m.sourceUrl : null,
        by: typeof m.by === 'string' ? m.by : null
      });
    }
    if (l.action === 'voucher.update' && m.via !== 'api' && !manualEdit.has(id)) manualEdit.set(id, l.createdAt);
  }

  return bundles.map((b) => {
    const exam = b.items[0]?.exam;
    const bp = EXAM_BLUEPRINTS[b.slug];
    const pages = [bp?.examPageUrl, exam?.infoUrl].filter((u): u is string => !!u && /^https:\/\//.test(u));
    return {
      bundleId: b.id,
      slug: b.slug,
      voucherSlug: b.voucherSlug,
      code: displayExamCode(exam?.code),
      certification: voucherTitleFor(b).replace(/ Exam Voucher$/, ''),
      vendor: exam?.vendor.name ?? '',
      priceCents: b.priceVoucher!,
      onSale: voucherOnSale(b),
      voucherUrl: exam ? voucherHref(exam.vendor.slug, b) : '',
      officialPages: [...new Set(pages)],
      lastCheck: lastCheck.get(b.id) ?? null,
      manualEditAt: manualEdit.get(b.id)?.toISOString() ?? null
    };
  });
}

/** Product slug, voucher slug, bundle id or (when unique) exam code. */
export function findVoucherRow(rows: VoucherRow[], ref: string): VoucherRow | VoucherRow[] | null {
  const n = ref.trim();
  const exact = rows.find((r) => r.slug === n || r.voucherSlug === n || r.bundleId === n);
  if (exact) return exact;
  const byCode = rows.filter((r) => r.code.toUpperCase() === n.toUpperCase());
  if (byCode.length === 1) return byCode[0];
  return byCode.length ? byCode : null;
}

export type Decision =
  | { status: 'unchanged'; expectedCents: number }
  | { status: 'updated'; expectedCents: number }
  | { status: 'held'; expectedCents: number; reason: string };

/**
 * What to do with an official list price. Pure — unit tested.
 * - selling price already = list +10% (rounded down) → unchanged
 * - an admin typed the price by hand since the last check (or before the first) → held
 * - list price unchanged since the last check but the selling price differs → held (someone set it on purpose)
 * - change over MAX_AUTO_CHANGE → held (vendor page misread, promo price, wrong currency…)
 * - otherwise → updated
 */
export function decidePrice(row: Pick<VoucherRow, 'priceCents' | 'lastCheck' | 'manualEditAt'>, listCents: number): Decision {
  const expectedCents = voucherPriceWithGst(listCents);
  if (expectedCents === row.priceCents) return { status: 'unchanged', expectedCents };
  const lastAt = row.lastCheck?.at ?? null;
  if (row.manualEditAt && (!lastAt || row.manualEditAt > lastAt)) {
    return { status: 'held', expectedCents, reason: `an admin set this price by hand on ${row.manualEditAt.slice(0, 10)}` };
  }
  if (row.lastCheck?.listPriceCents === listCents) {
    return { status: 'held', expectedCents, reason: 'vendor list price unchanged since the last check, but the selling price was changed' };
  }
  const change = Math.abs(expectedCents - row.priceCents) / row.priceCents;
  if (change > MAX_AUTO_CHANGE) {
    return { status: 'held', expectedCents, reason: `change of ${Math.round(change * 100)}% is over the ${MAX_AUTO_CHANGE * 100}% auto-update limit` };
  }
  return { status: 'updated', expectedCents };
}

/** Only an https page on a public host counts as an official source. */
export function sourceUrlProblem(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return 'sourceUrl is not a URL';
  }
  if (u.protocol !== 'https:') return 'sourceUrl must be https';
  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || /^[\d.]+$/.test(host) || host.includes(':')) return 'sourceUrl must be a public vendor page';
  if (host.endsWith('tertiaryinfotech.com') || host.endsWith('tertiarycourses.com.sg')) return 'sourceUrl must be the vendor’s page, not ours';
  return null;
}
