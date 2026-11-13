/** Real-Postgres integration check in a fresh, temporary local schema only. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { importCcarFoundationsPptx, ccarPptxQuestionId } from '../src/lib/seed/import-ccar-foundations-pptx';
import { EXAM_BLUEPRINTS } from '../src/lib/exam-blueprints';
import { CCAR_PPTX_TAG } from '../src/lib/seed/ccar-foundations-pptx-questions';
try { process.loadEnvFile('.env'); } catch { /* explicit env also works */ }
async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Integration check requires local Postgres.');
  const schema = `ccar_import_test_${process.pid}_${Date.now()}`;
  url.searchParams.set('schema', schema);
  const db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
  try {
    execFileSync('node_modules/.bin/prisma', ['db', 'push', '--skip-generate'], {
      env: { ...process.env, DATABASE_URL: url.toString() }, stdio: 'pipe'
    });
    const vendor = await db.vendor.create({ data: { slug: 'anthropic', name: 'Anthropic' } });
    const domains = EXAM_BLUEPRINTS['anthropic-cca-foundations'].domains;
    assert.ok(domains);
    const exam = await db.exam.create({ data: {
      vendorId: vendor.id, slug: 'anthropic-cca-foundations', code: 'WRONG', title: 'CCAR-F test fixture',
      description: 'Isolated importer test fixture', level: 'Foundational', durationMinutes: 120,
      passingScore: 72, questionCount: 60, published: true,
      domains
    } });
    await assert.rejects(importCcarFoundationsPptx(db), /verified active/);
    assert.equal(await db.question.count(), 0);
    await db.exam.update({ where: { id: exam.id }, data: { code: 'CCAR-F' } });
    const beforeExam = await db.exam.findUniqueOrThrow({ where: { id: exam.id } });
    const old = await db.question.create({ data: {
      examId: exam.id, domain: 'Context Management & Reliability', stem: 'Existing question must survive.',
      options: [{ id: 'a', text: 'An existing answer' }], correct: ['a'], explanation: 'Existing explanation.',
      status: 'DRAFT', generatedBy: 'csv-import'
    } });
    const first = await importCcarFoundationsPptx(db);
    assert.equal(first.created, 57);
    assert.equal(first.publishedImported, 57);
    assert.equal(first.totalQuestions, 58);
    assert.deepEqual(await db.question.findUnique({ where: { id: old.id } }), old);
    assert.deepEqual(await db.exam.findUnique({ where: { id: exam.id } }), beforeExam);
    const id = ccarPptxQuestionId(1);
    const amended = await db.question.update({ where: { id }, data: { stem: 'Administrator-edited content', status: 'ARCHIVED' } });
    const second = await importCcarFoundationsPptx(db);
    assert.equal(second.created, 0);
    assert.equal(second.imported, 57);
    assert.equal(second.publishedImported, 56);
    assert.deepEqual(await db.question.findUnique({ where: { id } }), amended);
    assert.deepEqual(await db.question.findUnique({ where: { id: old.id } }), old);
    const sourceRows = await db.question.findMany({ where: { generatedBy: CCAR_PPTX_TAG } });
    assert.equal(sourceRows.length, 57);
    assert.ok(sourceRows.every(q => Array.isArray(q.references) && q.references.length > 0));
    await db.question.update({ where: { id }, data: { generatedBy: 'another-owner' } });
    await assert.rejects(importCcarFoundationsPptx(db), /ID collision/);
    assert.equal(await db.question.count(), 58);
    console.log('PASS: real Postgres import, all 57 references, idempotence, existing-row/settings preservation, admin edits/unpublishing, identity and collision guards.');
  } finally {
    // Identifier is generated above from process ID and numeric timestamp only.
    await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await db.$disconnect();
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
