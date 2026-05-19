/**
 * One-shot helper: derive public/logo-light.webp from public/logo-dark.webp.
 *
 * Strategy:
 *   1. Sample the dark navy bg color from the four corners (average them).
 *   2. For each pixel, compute color distance to that bg color.
 *      - distance < BG_THRESHOLD → it's bg, replace with pure white
 *      - distance >= BG_THRESHOLD AND pixel is near-white → it's "Exam" text,
 *        flip luminance (white → dark slate)
 *      - otherwise → leave alone (icon gradient + blue "Nova")
 *
 * This guarantees the light version is a perfect geometric match to the dark
 * source — no AI regeneration drift.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.join(__dirname, '..', '..', 'public', 'logo-dark.webp');
const DST = path.join(__dirname, '..', '..', 'public', 'logo-light.webp');

// How close to bg color counts as bg (Euclidean in RGB, 0–441)
const BG_THRESHOLD = 60;
// Near-white text pixels — any pixel above this avg luminance gets inverted
const TEXT_LUMA_MIN = 200;
// Saturation cap for "is text not icon" check (icon highlights can also be bright)
const TEXT_SAT_MAX = 0.20;
// Target dark text color (slate-900)
const TEXT_R = 15, TEXT_G = 23, TEXT_B = 42;

function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const out = Buffer.from(data);

  // Sample bg color from the four corners (average a small block at each corner)
  const sample = (x0, y0) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y < y0 + 8; y++) {
      for (let x = x0; x < x0 + 8; x++) {
        const i = (y * W + x) * 4;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      }
    }
    return [r / n, g / n, b / n];
  };
  const corners = [sample(0, 0), sample(W - 8, 0), sample(0, H - 8), sample(W - 8, H - 8)];
  const bgR = corners.reduce((s, c) => s + c[0], 0) / 4;
  const bgG = corners.reduce((s, c) => s + c[1], 0) / 4;
  const bgB = corners.reduce((s, c) => s + c[2], 0) / 4;
  console.log(`Detected bg color: rgb(${bgR.toFixed(0)}, ${bgG.toFixed(0)}, ${bgB.toFixed(0)})`);

  let bgPx = 0, textPx = 0, keepPx = 0;
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i], g = out[i + 1], b = out[i + 2];

    // Is this a bg pixel?
    if (colorDist(r, g, b, bgR, bgG, bgB) < BG_THRESHOLD) {
      out[i] = 255; out[i + 1] = 255; out[i + 2] = 255;
      bgPx++;
      continue;
    }

    // Is this near-white, low-saturation text?
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const luma = (r + g + b) / 3;
    const sat = max === 0 ? 0 : (max - min) / max;
    if (luma > TEXT_LUMA_MIN && sat < TEXT_SAT_MAX) {
      // Blend toward TEXT color based on how bright the source was — preserves
      // anti-aliased edges (lighter source → lighter blend, but inverted).
      const t = (luma - TEXT_LUMA_MIN) / (255 - TEXT_LUMA_MIN); // 0..1
      out[i]     = Math.round(TEXT_R + (255 - TEXT_R) * (1 - t));
      out[i + 1] = Math.round(TEXT_G + (255 - TEXT_G) * (1 - t));
      out[i + 2] = Math.round(TEXT_B + (255 - TEXT_B) * (1 - t));
      // Actually we want darker for whiter source — flip the t:
      out[i]     = Math.round(TEXT_R * t + (r) * (1 - t));
      out[i + 1] = Math.round(TEXT_G * t + (g) * (1 - t));
      out[i + 2] = Math.round(TEXT_B * t + (b) * (1 - t));
      textPx++;
      continue;
    }

    keepPx++;
  }
  const total = bgPx + textPx + keepPx;
  console.log(`bg pixels:    ${bgPx} (${(100*bgPx/total).toFixed(1)}%)`);
  console.log(`text pixels:  ${textPx} (${(100*textPx/total).toFixed(1)}%)`);
  console.log(`kept pixels:  ${keepPx} (${(100*keepPx/total).toFixed(1)}%)`);

  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .webp({ quality: 92 })
    .toFile(DST);

  const stat = fs.statSync(DST);
  console.log(`Wrote ${DST}  (${W}x${H}, ${(stat.size / 1024).toFixed(1)} KB)`);
})();
