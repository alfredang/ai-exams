import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, type RGB } from 'pdf-lib';

export const A4 = { width: 595.28, height: 841.89 } as const;

export const COLORS = {
  blue: rgb(0.145, 0.388, 0.922),
  blueSoft: rgb(0.949, 0.969, 1),
  slate: rgb(0.106, 0.157, 0.231),
  muted: rgb(0.475, 0.522, 0.604),
  white: rgb(1, 1, 1),
  red: rgb(0.78, 0.18, 0.18),
  redSoft: rgb(1, 0.93, 0.93),
  amber: rgb(0.85, 0.55, 0.04),
  borderSoft: rgb(0.84, 0.86, 0.9)
} as const;

export type Fonts = { regular: PDFFont; bold: PDFFont };

export async function newA4Doc(): Promise<{ doc: PDFDocument; page: PDFPage; fonts: Fonts }> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([A4.width, A4.height]);
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold)
  };
  return { doc, page, fonts };
}

export function drawHeaderBar(
  page: PDFPage,
  fonts: Fonts,
  title: string,
  opts?: { color?: RGB }
) {
  const color = opts?.color ?? COLORS.blue;
  page.drawRectangle({ x: 0, y: A4.height - 42, width: A4.width, height: 42, color });
  page.drawText(title, {
    x: 36,
    y: A4.height - 27,
    size: 16,
    font: fonts.bold,
    color: COLORS.white
  });
}

export function drawLabel(
  page: PDFPage,
  fonts: Fonts,
  text: string,
  x: number,
  y: number,
  opts?: { size?: number; color?: RGB }
) {
  page.drawText(text, {
    x,
    y,
    size: opts?.size ?? 9,
    font: fonts.bold,
    color: opts?.color ?? COLORS.muted
  });
}

export function drawText(
  page: PDFPage,
  fonts: Fonts,
  text: string,
  x: number,
  y: number,
  opts?: { size?: number; color?: RGB; bold?: boolean }
) {
  page.drawText(text, {
    x,
    y,
    size: opts?.size ?? 10,
    font: opts?.bold ? fonts.bold : fonts.regular,
    color: opts?.color ?? COLORS.slate
  });
}

/** Draws a line of text, wrapping naive on width. Returns the next y cursor. */
export function drawWrapped(
  page: PDFPage,
  fonts: Fonts,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  opts?: { size?: number; color?: RGB; bold?: boolean; lineHeight?: number }
): number {
  const size = opts?.size ?? 10;
  const font = opts?.bold ? fonts.bold : fonts.regular;
  const color = opts?.color ?? COLORS.slate;
  const lineHeight = opts?.lineHeight ?? size * 1.4;
  const words = text.split(/\s+/);
  let line = '';
  let cy = y;
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth) {
      page.drawText(line, { x, y: cy, size, font, color });
      cy -= lineHeight;
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cy, size, font, color });
    cy -= lineHeight;
  }
  return cy;
}

export function drawWatermark(page: PDFPage, fonts: Fonts, text: string, opts?: { color?: RGB }) {
  // Diagonal big text across the page; pdf-lib supports rotation.
  page.drawText(text, {
    x: 100,
    y: A4.height / 2,
    size: 96,
    font: fonts.bold,
    color: opts?.color ?? COLORS.redSoft,
    rotate: { type: 'degrees', angle: 30 } as any,
    opacity: 0.35
  });
}

export function moneyLine(
  cents: number,
  currency: string
): string {
  const dollars = cents / 100;
  if (currency.toUpperCase() === 'SGD') {
    const amount = new Intl.NumberFormat('en-SG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(dollars);
    return `SGD $${amount}`;
  }
  const isMinor =
    currency === 'JPY' || currency === 'KRW' || currency === 'VND' || currency === 'IDR';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: isMinor ? 0 : 2,
    maximumFractionDigits: isMinor ? 0 : 2
  }).format(dollars);
}
