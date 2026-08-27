import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function renderVoucherPdf(opts: {
  examTitle: string;
  examCode: string;
  vendor: string;
  voucherCode: string;
  buyerName?: string | null;
  buyerEmail: string;
  expiresAt?: Date | null;
}): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const blue = rgb(0.145, 0.388, 0.922);
  const slate = rgb(0.106, 0.157, 0.231);
  const muted = rgb(0.475, 0.522, 0.604);

  // Header bar
  page.drawRectangle({ x: 0, y: 800, width: 595.28, height: 41.89, color: blue });
  page.drawText('Tertiary Exams — Exam Voucher', { x: 36, y: 815, size: 16, font: fontBold, color: rgb(1, 1, 1) });

  let y = 760;
  page.drawText(opts.examTitle, { x: 36, y, size: 22, font: fontBold, color: slate });
  y -= 24;
  page.drawText(`${opts.vendor} · ${opts.examCode}`, { x: 36, y, size: 12, font, color: muted });
  y -= 40;

  // Voucher box
  page.drawRectangle({ x: 36, y: y - 90, width: 523, height: 90, borderColor: blue, borderWidth: 1.5, color: rgb(0.949, 0.969, 1) });
  page.drawText('Voucher code', { x: 56, y: y - 30, size: 11, font, color: muted });
  page.drawText(opts.voucherCode, { x: 56, y: y - 64, size: 26, font: fontBold, color: blue });
  y -= 110;

  page.drawText(`Issued to: ${opts.buyerName || opts.buyerEmail}`, { x: 36, y, size: 11, font, color: slate }); y -= 16;
  page.drawText(`Email: ${opts.buyerEmail}`, { x: 36, y, size: 11, font, color: slate }); y -= 16;
  if (opts.expiresAt) { page.drawText(`Expires: ${opts.expiresAt.toISOString().slice(0, 10)}`, { x: 36, y, size: 11, font, color: slate }); y -= 16; }
  y -= 12;

  page.drawText('How to redeem', { x: 36, y, size: 13, font: fontBold, color: slate }); y -= 18;
  const lines = [
    `1. Visit the official ${opts.vendor} certification scheduling portal.`,
    '2. Sign in or create an account with the email above.',
    '3. Select the exam and apply this voucher code at checkout.',
    '4. Schedule your test date.'
  ];
  for (const line of lines) { page.drawText(line, { x: 36, y, size: 11, font, color: muted }); y -= 16; }

  y -= 16;
  page.drawText('This voucher is original practice-platform content for learning purposes. Tertiary Exams is not affiliated', { x: 36, y, size: 9, font, color: muted }); y -= 12;
  page.drawText(`with ${opts.vendor}. Voucher value redeemable per ${opts.vendor}'s official terms.`, { x: 36, y, size: 9, font, color: muted });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
