import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lookupApiToken } from '@/lib/api-tokens';
import { readBearerToken } from '@/lib/mobile-auth';
import { clientIp } from '@/lib/client-ip';
import { isRateLimited, rateLimit } from '@/lib/ratelimit';
import { displayExamCode } from '@/lib/products';

/**
 * Bearer-token surface for agents and partner integrations (/api/v1/*).
 * Tokens are minted at /admin-dashboard/api-tokens and must carry the
 * route's scope (or `*`). A token only works while the admin who created it
 * is still an active ADMIN, and its mutations are audited as that admin.
 */
export const SCOPE_ASSIGN_PRACTICE_EXAMS = 'assign:practice-exams';

const FAIL_LIMIT = 20;
const FAIL_WINDOW_MS = 15 * 60_000;

export function apiError(error: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function requireApiToken(req: Request, scope: string) {
  const ipKey = `api-v1:fail:${clientIp(req.headers)}`;
  if (isRateLimited(ipKey, FAIL_LIMIT)) return { response: apiError('Too many failed requests', 429) };

  const raw = readBearerToken(req) || req.headers.get('x-api-key') || '';
  const token = raw ? await lookupApiToken(raw.trim()) : null;
  if (!token) {
    rateLimit(ipKey, FAIL_LIMIT, FAIL_WINDOW_MS);
    return { response: apiError('Invalid or missing API token', 401) };
  }
  if (!token.scopes.includes(scope) && !token.scopes.includes('*')) {
    return { response: apiError(`Token lacks the "${scope}" scope`, 403) };
  }
  const admin = await db.user.findUnique({ where: { id: token.createdById }, select: { id: true, role: true, active: true } });
  if (admin?.role !== 'ADMIN' || !admin.active) {
    return { response: apiError('Token issuer is no longer an active admin', 403) };
  }
  return { token, adminId: admin.id };
}

export type PracticeExamRef = {
  examId: string;
  slug: string;
  code: string;
  title: string;
  vendor: string;
  onSale: boolean;
};

/** Every certification's Practice Exam: the Bundle's PRACTICE item, resolved to its pool exam. */
export async function listPracticeExams(): Promise<PracticeExamRef[]> {
  const bundles = await db.bundle.findMany({
    orderBy: { title: 'asc' },
    select: {
      slug: true,
      title: true,
      published: true,
      items: {
        where: { tier: 'PRACTICE' },
        orderBy: { position: 'asc' },
        take: 1,
        select: { exam: { select: { id: true, code: true, deletedAt: true, vendor: { select: { name: true } }, poolExam: { select: { id: true, code: true, deletedAt: true } } } } }
      }
    }
  });
  const out: PracticeExamRef[] = [];
  const seen = new Set<string>();
  for (const b of bundles) {
    const item = b.items[0]?.exam;
    if (!item) continue;
    const pool = item.poolExam ?? item;
    if (pool.deletedAt || seen.has(pool.id)) continue;
    seen.add(pool.id);
    out.push({
      examId: pool.id,
      slug: b.slug,
      code: displayExamCode(pool.code),
      title: b.title,
      vendor: item.vendor.name,
      onSale: b.published
    });
  }
  return out;
}

/**
 * Resolve an agent-supplied reference — product slug, exam code ("CCAO-F")
 * or exam id — to one Practice Exam. Codes can repeat across vendors, so an
 * ambiguous match returns every candidate instead of guessing.
 */
export async function resolvePracticeExam(ref: string) {
  const needle = ref.trim();
  const upper = needle.toUpperCase();
  const all = await listPracticeExams();
  const exact = all.filter((p) => p.slug === needle || p.examId === needle);
  const matches = exact.length ? exact : all.filter((p) => p.code.toUpperCase() === upper);
  if (matches.length === 1) return { exam: matches[0] };
  if (matches.length > 1) return { response: apiError(`"${ref}" matches several practice exams; pass the slug`, 409, { candidates: matches }) };
  return { response: apiError(`No practice exam matches "${ref}"`, 404) };
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, name: true, active: true }
  });
}
