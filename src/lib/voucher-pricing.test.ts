import test from 'node:test';
import assert from 'node:assert/strict';
import { decidePrice, sourceUrlProblem } from './voucher-pricing';

const row = (priceCents: number, extra: Partial<Parameters<typeof decidePrice>[0]> = {}) => ({
  priceCents, lastCheck: null, manualEditAt: null, ...extra
});
const check = (listPriceCents: number, at = '2026-11-10T00:00:00.000Z') => ({ at, status: 'unchanged', listPriceCents, sourceUrl: null, by: null });

test('already list +10% rounded down → unchanged', () => {
  assert.deepEqual(decidePrice(row(48200), 43900), { status: 'unchanged', expectedCents: 48200 });
  assert.equal(decidePrice(row(7700), 7050).status, 'unchanged');
});

test('vendor raised the price → updated at list +10% rounded down', () => {
  const d = decidePrice(row(48200, { lastCheck: check(43900) }), 46000);
  assert.deepEqual(d, { status: 'updated', expectedCents: 50600 });
});

test('change over 25% is held', () => {
  const d = decidePrice(row(11000), 20000);
  assert.equal(d.status, 'held');
});

test('admin typed the price after the last check → held', () => {
  const d = decidePrice(row(9900, { lastCheck: check(10000), manualEditAt: '2026-11-12T00:00:00.000Z' }), 10500);
  assert.equal(d.status, 'held');
  assert.match((d as { reason: string }).reason, /by hand on 2026-11-12/);
});

test('admin edit before the last check does not block', () => {
  const d = decidePrice(row(11000, { lastCheck: check(10000), manualEditAt: '2026-11-01T00:00:00.000Z' }), 10500);
  assert.deepEqual(d, { status: 'updated', expectedCents: 11500 });
});

test('list unchanged but selling price differs → held', () => {
  const d = decidePrice(row(10000, { lastCheck: check(10000) }), 10000);
  assert.equal(d.status, 'held');
});

test('source URL must be an https vendor page', () => {
  assert.equal(sourceUrlProblem('https://www.comptia.org/en-us/certifications/security/'), null);
  assert.ok(sourceUrlProblem('http://comptia.org'));
  assert.ok(sourceUrlProblem('https://127.0.0.1/x'));
  assert.ok(sourceUrlProblem('https://exams.tertiaryinfotech.com/exam-vouchers'));
  assert.ok(sourceUrlProblem('not a url'));
});
