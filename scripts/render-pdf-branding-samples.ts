import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderInvoicePdf } from '../src/lib/invoice/render-invoice-pdf';
import { renderVoucherPdf } from '../src/lib/voucher-pdf';

async function main() {
  const outputDir = path.resolve('output/pdf');
  await mkdir(outputDir, { recursive: true });

  const invoice = await renderInvoicePdf({
    invoice: {
      number: 'INV-SAMPLE-2026-0001',
      issueDate: new Date('2026-08-28T00:00:00.000Z'),
      status: 'ISSUED',
      companyName: 'Tertiary Infotech Academy Pte Ltd',
      companyAddress: '12 Woodland Square #07-85/86/87 Woods Square Tower 1, Singapore 737715',
      companyUEN: '201200696W',
      companyGstReg: 'M2-1234567-8',
      billingName: 'Sample Learner',
      billingEmail: 'sample@example.com',
      billingAddress: '1 Sample Road, Singapore 123456',
      subtotal: 2000,
      taxAmount: 180,
      taxLabel: 'GST',
      taxRate: 900,
      total: 2180,
      currency: 'SGD',
      totalSgd: 2180,
      fxRateBpsToSgd: 10000,
      voidReason: null
    } as any,
    lines: [{ description: 'CompTIA CySA+ (CS0-004) - Practice Exam Bundle', qty: 1, unitAmount: 2000 }],
    orderNumber: 'ORD-SAMPLE-2026-0001'
  });

  const voucher = await renderVoucherPdf({
    examTitle: 'CompTIA CySA+ (CS0-004)',
    examCode: 'CS0-004',
    vendor: 'CompTIA',
    voucherCode: 'SAMPLE-NOT-VALID',
    buyerName: 'Sample Learner',
    buyerEmail: 'sample@example.com',
    expiresAt: new Date('2027-08-28T00:00:00.000Z')
  });

  await Promise.all([
    writeFile(path.join(outputDir, 'invoice-branding-sample.pdf'), invoice),
    writeFile(path.join(outputDir, 'voucher-branding-sample.pdf'), voucher)
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
