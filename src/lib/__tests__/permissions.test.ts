import { describe, expect, it } from 'vitest';
import { can } from '../permissions';

describe('permissions', () => {
  it('limits sensitive user data export to full admins', () => {
    expect(can('ADMIN', 'user.export')).toBe(true);
    expect(can('READ_ONLY', 'user.export')).toBe(false);
    expect(can('SUPPORT', 'user.export')).toBe(false);
    expect(can('FINANCE', 'user.export')).toBe(false);
    expect(can('CONTENT', 'user.export')).toBe(false);
  });

  it('allows read-only token viewing without token mutation', () => {
    expect(can('READ_ONLY', 'api-token.read')).toBe(true);
    expect(can('READ_ONLY', 'api-token.write')).toBe(false);
  });
});
