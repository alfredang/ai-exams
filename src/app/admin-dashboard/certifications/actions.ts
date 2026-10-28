'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { parseDomains } from '@/lib/question-pool';

// Server actions for the certification sections on the Practice Exam page
// (/admin-dashboard/bundles/[id]): the exam's certification details, domain
// weights and SEO meta, all stored on the question bank's Exam row.

async function adminId(): Promise<string> {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') throw new Error('forbidden');
  return user.id as string;
}

// Where a save lands: the Practice Exam page selling this question bank, or the
// fallback certification page while no Practice Exam is linked to it yet.
async function certHref(examId: string): Promise<string> {
  const item = await db.bundleItem.findFirst({
    where: { examId, tier: 'PRACTICE' },
    orderBy: { bundle: { published: 'desc' } },
    select: { bundleId: true }
  });
  return item ? `/admin-dashboard/bundles/${item.bundleId}` : `/admin-dashboard/certifications/${examId}`;
}

function refresh(examId: string) {
  revalidatePath(`/admin-dashboard/certifications/${examId}`);
  revalidatePath(`/admin-dashboard/exams/${examId}`);
  revalidatePath('/admin-dashboard/exams');
  revalidatePath('/admin-dashboard/bundles', 'layout');
}

export async function updateCertificationDetails(fd: FormData) {
  const admin = await adminId();
  const id = String(fd.get('id') || '');
  const back = await certHref(id);
  const before = await db.exam.findUnique({ where: { id } });
  if (!before) return;
  const title = String(fd.get('title') || '').trim();
  const code = String(fd.get('code') || '').trim();
  const slug = String(fd.get('slug') || '').trim().toLowerCase();
  if (!title || !code || !slug) redirect(`${back}?cert=required#certification`);
  const clash = await db.exam.findFirst({ where: { slug, NOT: { id } }, select: { id: true } });
  if (clash) redirect(`${back}?cert=slug#certification`);
  const description = String(fd.get('description') || '').trim();
  const data = {
    title,
    code,
    slug,
    description,
    level: String(fd.get('level') || before.level),
    durationMinutes: Math.max(1, Number(fd.get('durationMinutes')) || before.durationMinutes),
    passingScore: Math.min(100, Math.max(0, Number(fd.get('passingScore')) || before.passingScore)),
    questionCount: Math.max(1, Number(fd.get('questionCount')) || before.questionCount),
    infoUrl: String(fd.get('infoUrl') || '').trim() || null,
    published: fd.get('published') === 'on'
  };
  await db.exam.update({ where: { id }, data });
  await db.adminLog.create({
    data: {
      adminId: admin,
      action: 'exam.update',
      targetType: 'Exam',
      targetId: id,
      metadata: {
        before: {
          title: before.title, code: before.code, slug: before.slug, level: before.level, durationMinutes: before.durationMinutes,
          passingScore: before.passingScore, questionCount: before.questionCount, infoUrl: before.infoUrl, published: before.published
        },
        after: { ...data, description: undefined }
      }
    }
  });
  // The Practice Exam selling this bank carries the same title and
  // description (the deploy-time pool fold copies them onto the exam), so
  // save them there too. The `bundle.update` log keeps the seed from
  // overwriting an admin's copy.
  if (title !== before.title || description !== (before.description ?? '')) {
    const products = await db.bundleItem.findMany({ where: { examId: id, tier: 'PRACTICE' }, select: { bundleId: true } });
    for (const { bundleId } of products) {
      await db.bundle.update({ where: { id: bundleId }, data: { title, description } });
      await db.adminLog.create({
        data: { adminId: admin, action: 'bundle.update', targetType: 'Bundle', targetId: bundleId, metadata: { title, via: 'certification' } }
      });
    }
  }
  refresh(id);
  redirect(`${back}?cert=saved#certification`);
}

/** "Find official page" beside the Exam Info URL field. */
export async function autoFillFromWeb(fd: FormData) {
  const admin = await adminId();
  const id = String(fd.get('id') || '');
  const exam = await db.exam.findUnique({ where: { id }, include: { vendor: true } });
  if (!exam) return;
  const { lookupExamInfo } = await import('@/lib/exam-info-lookup');
  try {
    const res = await lookupExamInfo({
      vendor: exam.vendor.name,
      title: exam.title,
      code: exam.code,
      infoUrl: exam.infoUrl ?? undefined
    });
    await db.exam.update({ where: { id }, data: { infoUrl: res.infoUrl } });
    await db.adminLog.create({
      data: { adminId: admin, action: 'exam.auto_fill_info', targetType: 'Exam', targetId: id, metadata: { infoUrl: res.infoUrl, notes: res.notes ?? '' } }
    });
  } catch (err: any) {
    await db.adminLog.create({
      data: { adminId: admin, action: 'exam.auto_fill_info_failed', targetType: 'Exam', targetId: id, metadata: { error: String(err?.message || err) } }
    });
  }
  refresh(id);
}

// Domain weights drive every attempt's draw from the pool. Saving stamps
// domainsVerifiedAt, so a deploy only overwrites this with a newer official
// check from src/lib/exam-blueprints.ts.
export async function updateDomainWeights(fd: FormData) {
  const admin = await adminId();
  const id = String(fd.get('id') || '');
  const back = await certHref(id);
  const exam = await db.exam.findUnique({ where: { id }, select: { domains: true } });
  if (!exam) return;
  const before = parseDomains(exam.domains);
  const domains = before.map((d, i) => ({
    name: d.name,
    weight: Math.max(0, Math.round(Number(fd.get(`weight${i}`)) || 0))
  }));
  const sourceRaw = String(fd.get('domainsSourceUrl') || '').trim();
  await db.exam.update({
    where: { id },
    data: { domains, domainsSourceUrl: sourceRaw || null, domainsVerifiedAt: new Date() }
  });
  await db.adminLog.create({
    data: { adminId: admin, action: 'exam.domain_weights', targetType: 'Exam', targetId: id, metadata: { before, after: domains, sourceUrl: sourceRaw } }
  });
  refresh(id);
  redirect(`${back}?cert=weights#domains`);
}

export async function runSeoAssist(fd: FormData) {
  const admin = await adminId();
  const id = String(fd.get('id') || '');
  const exam = await db.exam.findUnique({ where: { id }, include: { vendor: true } });
  if (!exam) return;
  try {
    const { generateSeoForExam } = await import('@/lib/seo-assist');
    const seo = await generateSeoForExam({
      vendor: exam.vendor.name,
      code: exam.code,
      title: exam.title,
      description: exam.description,
      domains: (exam.domains as any[]) || []
    });
    await db.exam.update({
      where: { id },
      data: { metaTitle: seo.title, metaDescription: seo.description, metaKeywords: seo.keywords }
    });
    await db.adminLog.create({
      data: { adminId: admin, action: 'exam.seo.assist', targetType: 'Exam', targetId: id, metadata: { ...seo } }
    });
  } catch (err: any) {
    await db.adminLog.create({
      data: { adminId: admin, action: 'exam.seo.assist.failed', targetType: 'Exam', targetId: id, metadata: { error: String(err?.message ?? err) } }
    });
  }
  refresh(id);
}

export async function saveSeoMeta(fd: FormData) {
  const admin = await adminId();
  const id = String(fd.get('id') || '');
  if (!id) return;
  const data = {
    metaTitle: String(fd.get('metaTitle') || '').trim() || null,
    metaDescription: String(fd.get('metaDescription') || '').trim() || null,
    metaKeywords: String(fd.get('metaKeywords') || '').trim() || null,
    ogImage: String(fd.get('ogImage') || '').trim() || null
  };
  await db.exam.update({ where: { id }, data });
  await db.adminLog.create({
    data: { adminId: admin, action: 'exam.seo.update', targetType: 'Exam', targetId: id, metadata: data }
  });
  refresh(id);
  redirect(`${await certHref(id)}?seo=saved#seo`);
}
