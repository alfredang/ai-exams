import { describe, expect, it } from 'vitest';
import { genVoucherCode } from '../utils';

describe('genVoucherCode', () => {
  it('generates uppercase voucher codes with the expected prefix', () => {
    expect(genVoucherCode()).toMatch(/^VCH-[0-9A-Z]{8}$/);
  });
});
