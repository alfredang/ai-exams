import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUserWhere } from './admin-user-filters';

test('active and suspended filters exclude anonymized users', () => {
  assert.deepEqual(buildUserWhere({ status: 'active' }), { role: 'USER', active: true, anonymizedAt: null });
  assert.deepEqual(buildUserWhere({ status: 'suspended' }), { role: 'USER', active: false, anonymizedAt: null });
});

test('date range includes the full final UTC calendar day', () => {
  assert.deepEqual(buildUserWhere({ from: '2026-09-01', to: '2026-09-14' }).createdAt, {
    gte: new Date('2026-09-01T00:00:00.000Z'),
    lt: new Date('2026-09-15T00:00:00.000Z')
  });
});

test('invalid calendar dates do not silently constrain results', () => {
  assert.equal(buildUserWhere({ from: '2026-02-30', to: 'junk' }).createdAt, undefined);
});

test('search and tag combine with email verification status', () => {
  const where = buildUserWhere({ q: '  Teo  ', tag: 'learner', status: 'unverified' });
  assert.equal(where.emailVerified, null);
  assert.deepEqual(where.tags, { some: { tag: { slug: 'learner' } } });
  assert.deepEqual(where.OR, [
    { email: { contains: 'Teo', mode: 'insensitive' } },
    { name: { contains: 'Teo', mode: 'insensitive' } }
  ]);
});
