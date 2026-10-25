import {
  A4,
  COLORS,
  drawHeaderBar,
  drawLabel,
  drawText,
  drawWrapped,
  drawWatermark,
  moneyLine,
  newA4Doc
} from '@/lib/pdf/layout';
import type { Invoice } from '@prisma/client';
import { formatTaxRate } from './tax';

export type InvoiceLine = {
  description: string;
  qty: number;
  unitAmount: number; // cents (subtotal portion, excluding tax)
};

export type RenderInvoiceInput = {
  invoice: Invoice;
  lines: InvoiceLine[];
  orderNumber?: string | null;
  /** For a credit note: the tax invoice it adjusts, and why. */
  original?: { number: string; issueDate: Date } | null;
  reason?: string | null;
};

// Invoice dates are Singapore dates, not UTC (a 1am SGT payment is still that day).
const sgDate = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

export async function renderInvoicePdf({ invoice, lines, orderNumber, original, reason }: RenderInvoiceInput): Promise<Buffer> {
  const { doc, page, fonts } = await newA4Doc();

  const isCredit = invoice.status === 'CREDIT_NOTE';
  const isVoid = invoice.status === 'VOID';
  // Invoices are only issued once an order is PAID (lib/invoice/issue.ts),
  // so an ISSUED invoice is always a paid one.
  const isPaid = invoice.status === 'ISSUED';
  const title = isCredit ? 'Credit Note' : 'Tax Invoice';

  drawHeaderBar(page, fonts, `Tertiary Exams — ${title}`);
  if (isVoid) drawWatermark(page, fonts, 'VOID', { color: COLORS.redSoft });
  if (isPaid) drawWatermark(page, fonts, 'PAID', { color: COLORS.greenSoft });

  // Right-aligned invoice meta box
  let y = A4.height - 70;
  drawLabel(page, fonts, isCredit ? 'CREDIT NOTE NO.' : 'INVOICE NO.', A4.width - 200, y);
  drawText(page, fonts, invoice.number, A4.width - 200, y - 14, { size: 13, bold: true });
  y -= 36;
  drawLabel(page, fonts, 'ISSUE DATE', A4.width - 200, y);
  drawText(page, fonts, sgDate(invoice.issueDate), A4.width - 200, y - 14, { size: 11 });
  y -= 36;
  drawLabel(page, fonts, 'STATUS', A4.width - 200, y);
  drawText(page, fonts, isPaid ? 'PAID' : invoice.status.replace('_', ' '), A4.width - 200, y - 14, {
    size: 11,
    bold: true,
    color: isCredit ? COLORS.amber : isVoid ? COLORS.red : COLORS.green
  });
  if (orderNumber) {
    y -= 36;
    drawLabel(page, fonts, 'ORDER NO.', A4.width - 200, y);
    drawText(page, fonts, orderNumber, A4.width - 200, y - 14, { size: 11 });
  }
  if (isCredit && original) {
    y -= 36;
    drawLabel(page, fonts, 'ORIGINAL INVOICE', A4.width - 200, y);
    drawText(page, fonts, `${original.number} (${sgDate(original.issueDate)})`, A4.width - 200, y - 14, {
      size: 11
    });
  }

  // From (company)
  y = A4.height - 70;
  drawLabel(page, fonts, 'FROM', 36, y);
  drawText(page, fonts, invoice.companyName, 36, y - 14, { size: 12, bold: true });
  let cy = drawWrapped(page, fonts, invoice.companyAddress, 36, y - 28, 260, { size: 10, color: COLORS.muted });
  if (invoice.companyUEN) {
    drawText(page, fonts, `UEN: ${invoice.companyUEN}`, 36, cy, { size: 10, color: COLORS.muted });
    cy -= 14;
  }
  if (invoice.companyGstReg) {
    drawText(page, fonts, `GST reg: ${invoice.companyGstReg}`, 36, cy, { size: 10, color: COLORS.muted });
    cy -= 14;
  }

  // Bill To (customer)
  y = cy - 16;
  drawLabel(page, fonts, 'BILL TO', 36, y);
  drawText(page, fonts, invoice.billingName, 36, y - 14, { size: 12, bold: true });
  drawText(page, fonts, invoice.billingEmail, 36, y - 28, { size: 10, color: COLORS.muted });
  let by = y - 42;
  if (invoice.billingAddress) {
    by = drawWrapped(page, fonts, invoice.billingAddress, 36, by, 260, { size: 10, color: COLORS.muted });
  }

  // Items table
  const tableTop = Math.min(by, A4.height - 280) - 16;
  drawTableHeader(page, fonts, tableTop);
  let rowY = tableTop - 22;
  for (const ln of lines) {
    const lineTotal = ln.qty * ln.unitAmount;
    drawText(page, fonts, ln.description, 36, rowY, { size: 11 });
    drawText(page, fonts, String(ln.qty), 360, rowY, { size: 11, color: COLORS.muted });
    drawText(page, fonts, moneyLine(ln.unitAmount, invoice.currency), 410, rowY, { size: 11 });
    drawText(page, fonts, moneyLine(lineTotal, invoice.currency), 500, rowY, { size: 11, bold: true });
    rowY -= 22;
  }

  // Totals
  rowY -= 8;
  page.drawLine({
    start: { x: 360, y: rowY + 14 },
    end: { x: A4.width - 36, y: rowY + 14 },
    color: COLORS.borderSoft,
    thickness: 1
  });

  function totalRow(label: string, value: string, bold = false) {
    drawText(page, fonts, label, 380, rowY, { size: 11, color: COLORS.muted });
    drawText(page, fonts, value, 500, rowY, { size: 11, bold });
    rowY -= 18;
  }

  const taxed = invoice.taxAmount !== 0;
  totalRow(taxed ? `Subtotal (excl. ${invoice.taxLabel})` : 'Subtotal', moneyLine(invoice.subtotal, invoice.currency));
  if (taxed) {
    totalRow(`${invoice.taxLabel} ${formatTaxRate(invoice.taxRate)} (included)`, moneyLine(invoice.taxAmount, invoice.currency));
  }
  rowY -= 4;
  page.drawLine({
    start: { x: 360, y: rowY + 14 },
    end: { x: A4.width - 36, y: rowY + 14 },
    color: COLORS.borderSoft,
    thickness: 1
  });
  totalRow(taxed ? `Total (incl. ${invoice.taxLabel})` : 'Total', moneyLine(invoice.total, invoice.currency), true);
  if (invoice.fxRateBpsToSgd && invoice.currency.toUpperCase() !== 'SGD') {
    // IRAS: a foreign-currency tax invoice must show the GST and total in SGD.
    const fx = invoice.fxRateBpsToSgd;
    const sgd = (cents: number) => moneyLine(Math.round((cents * fx) / 10000), 'SGD');
    drawText(page, fonts, `In SGD at ${fx / 10000}: ${invoice.taxLabel} ${sgd(invoice.taxAmount)}, total ${sgd(invoice.total)}`, 300, rowY, {
      size: 9,
      color: COLORS.muted
    });
    rowY -= 14;
  }

  // Footer
  const footerY = 60;
  if (invoice.status === 'CREDIT_NOTE') {
    drawText(
      page,
      fonts,
      `${reason ? `Reason: ${reason}. ` : ''}This credit note offsets ${original ? `invoice ${original.number}` : 'a prior invoice'}. Keep both for your records.`,
      36,
      footerY,
      { size: 9, color: COLORS.muted }
    );
  } else if (invoice.status === 'VOID') {
    drawText(page, fonts, `Voided${invoice.voidReason ? `: ${invoice.voidReason}` : ''}`, 36, footerY, {
      size: 9,
      color: COLORS.red
    });
  } else {
    drawText(
      page,
      fonts,
      `Paid in full on ${sgDate(invoice.issueDate)}. Thank you for your purchase.`,
      36,
      footerY,
      { size: 9, color: COLORS.muted }
    );
  }
  drawText(
    page,
    fonts,
    `${invoice.companyName} · ${invoice.number}`,
    36,
    footerY - 14,
    { size: 8, color: COLORS.muted }
  );

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

function drawTableHeader(page: any, fonts: any, y: number) {
  page.drawRectangle({ x: 36, y: y - 4, width: A4.width - 72, height: 18, color: COLORS.blueSoft });
  drawLabel(page, fonts, 'DESCRIPTION', 36 + 4, y + 3, { size: 9, color: COLORS.slate });
  drawLabel(page, fonts, 'QTY', 360, y + 3, { size: 9, color: COLORS.slate });
  drawLabel(page, fonts, 'UNIT', 410, y + 3, { size: 9, color: COLORS.slate });
  drawLabel(page, fonts, 'AMOUNT', 500, y + 3, { size: 9, color: COLORS.slate });
}
