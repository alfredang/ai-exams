import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * One-shot admin endpoint: create (or upsert) a fixed set of learner accounts
 * and grant them PRACTICE access to every exam in the CKAD bundle.
 *
 * Idempotent — safe to re-run. Existing users keep their password and role.
 * CKAD_LEARNER_PASSWORD is used only when a named user does not exist yet.
 *
 * Only PRACTICE entitlements are granted (no real-exam VOUCHER).
 */

const BUNDLE_SLUG = 'linuxfoundation-ckad';
const PEOPLE = [
  { name: 'Jorge Lee', email: 'jorgelee@me.com' },
  { name: 'LWJ', email: 'lwj5@hotmail.com' }
];

export async function POST() {
  const session = await auth();
  const admin = session?.user as { id?: string; role?: string } | undefined;
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const bundle = await db.bundle.findUnique({
    where: { slug: BUNDLE_SLUG },
    include: { items: { include: { exam: true } } }
  });
  if (!bundle) {
    return NextResponse.json({ error: `bundle ${BUNDLE_SLUG} not found` }, { status: 404 });
  }

  // Practice access only — de-duplicate exams in case an exam appears at
  // multiple tiers in the bundle (CKAD P1 is listed as both PRACTICE and VOUCHER).
  const examIds = [...new Set(bundle.items.map((i) => i.examId))];

  const existingUsers = await db.user.findMany({
    where: { email: { in: PEOPLE.map((person) => person.email) } },
    select: { email: true }
  });
  const existingEmails = new Set(existingUsers.map((user) => user.email));
  const missingPeople = PEOPLE.filter((person) => !existingEmails.has(person.email));
  const newUserPassword = process.env.CKAD_LEARNER_PASSWORD?.trim();
  if (missingPeople.length > 0 && !newUserPassword) {
    return NextResponse.json(
      {
        error: 'CKAD_LEARNER_PASSWORD is required to create missing users',
        missingEmails: missingPeople.map((person) => person.email)
      },
      { status: 503 }
    );
  }
  const passwordHash = missingPeople.length > 0
    ? await argon2.hash(newUserPassword!)
    : null;
  const results = [];

  for (const person of PEOPLE) {
    const user = await db.user.upsert({
      where: { email: person.email },
      update: { name: person.name, emailVerified: new Date() },
      create: {
        email: person.email,
        name: person.name,
        passwordHash: passwordHash!,
        role: Role.USER,
        emailVerified: new Date()
      }
    });

    for (const examId of examIds) {
      await db.entitlement.upsert({
        where: { userId_examId_tier: { userId: user.id, examId, tier: 'PRACTICE' } },
        update: {},
        create: { userId: user.id, examId, tier: 'PRACTICE' }
      });
    }

    await db.adminLog.create({
      data: {
        adminId: admin.id!,
        action: 'grant.ckad-users',
        targetType: 'User',
        targetId: user.id,
        metadata: { email: user.email, bundle: BUNDLE_SLUG, examIds, tier: 'PRACTICE' }
      }
    });

    results.push({ id: user.id, email: user.email, name: user.name, exams: examIds.length });
  }

  return NextResponse.json({ ok: true, bundle: bundle.title, users: results });
}
