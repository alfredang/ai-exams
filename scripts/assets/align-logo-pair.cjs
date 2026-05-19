/**
 * Align logo-light.webp and logo-dark.webp so their *visible artwork* occupies
 * the same proportion of the canvas. Otherwise they look mismatched in size
 * even though the canvas dimensions agree.
 *
 * Algorithm:
 *   1. Detect strict content bounds in each (icon + wordmark only, ignoring
 *      background bleed / glow).
 *   2. Pick the more conservative bounds (max of both content widths/heights
 *      relative to canvas).
 *   3. Re-pad each trimmed logo onto a 2172x724 canvas, centered, with the
 *      content sized to fill the same proportion.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TARGET_W = 2172;
const TARGET_H = 724;
// Fraction of canvas height that the artwork should fill (≈80% leaves nice
// breathing room around the icon and text on both themes).
const CONTENT_HEIGHT_RATIO = 0.85;

const LIGHT = path.join(__dirname, '..', '..', 'public', 'logo-light.webp');
const DARK = path.join(__dirname, '..', '..', 'public', 'logo-dark.webp');

async function strictBounds(file, isContent) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (isContent(data[i], data[i+1], data[i+2])) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, canvasW: W, canvasH: H };
}

(async () => {
  // Dark: real content = bright OR strongly saturated (skip dim glow + bg)
  const darkBounds = await strictBounds(DARK, (r, g, b) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const luma = (r + g + b) / 3;
    const sat = max === 0 ? 0 : (max - min) / max;
    return luma > 90 || (sat > 0.55 && max > 80);
  });
  // Light: real content = anything not near-white
  const lightBounds = await strictBounds(LIGHT, (r, g, b) => {
    return r < 245 || g < 245 || b < 245;
  });

  console.log(`Dark  content: ${darkBounds.w}x${darkBounds.h} at (${darkBounds.x},${darkBounds.y})`);
  console.log(`Light content: ${lightBounds.w}x${lightBounds.h} at (${lightBounds.x},${lightBounds.y})`);

  // Crop each to its content bounds
  const darkCrop = await sharp(DARK)
    .extract({ left: darkBounds.x, top: darkBounds.y, width: darkBounds.w, height: darkBounds.h })
    .toBuffer();
  const lightCrop = await sharp(LIGHT)
    .extract({ left: lightBounds.x, top: lightBounds.y, width: lightBounds.w, height: lightBounds.h })
    .toBuffer();

  // Resize each so HEIGHT = TARGET_H * CONTENT_HEIGHT_RATIO, preserving aspect
  const targetContentH = Math.round(TARGET_H * CONTENT_HEIGHT_RATIO);
  async function resizeAndPad(buf, bgHex) {
    const meta = await sharp(buf).metadata();
    const newW = Math.round(meta.width * (targetContentH / meta.height));
    const resized = await sharp(buf).resize(newW, targetContentH, { fit: 'fill' }).toBuffer();
    // Pad to TARGET_W x TARGET_H centered
    const padX = Math.max(0, TARGET_W - newW);
    const padY = TARGET_H - targetContentH;
    const left = Math.floor(padX / 2);
    const right = padX - left;
    const top = Math.floor(padY / 2);
    const bottom = padY - top;
    // If content is wider than target, scale down instead
    if (newW > TARGET_W) {
      const scale = TARGET_W / newW;
      const sH = Math.round(targetContentH * scale);
      const downscaled = await sharp(buf).resize(TARGET_W, sH, { fit: 'fill' }).toBuffer();
      const padY2 = TARGET_H - sH;
      return sharp(downscaled)
        .extend({ top: Math.floor(padY2/2), bottom: padY2 - Math.floor(padY2/2), left: 0, right: 0, background: bgHex })
        .toBuffer();
    }
    return sharp(resized).extend({ top, bottom, left, right, background: bgHex }).toBuffer();
  }

  // Detect bg color from corner pixel of each
  const dCorner = await sharp(DARK).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
  const lCorner = await sharp(LIGHT).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
  const toHex = (b) => '#' + [...b].slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('');
  const darkBg = toHex(dCorner);
  const lightBg = toHex(lCorner);
  console.log(`Detected bg: dark=${darkBg}  light=${lightBg}`);

  const darkOut = await resizeAndPad(darkCrop, darkBg);
  const lightOut = await resizeAndPad(lightCrop, lightBg);

  await sharp(darkOut).webp({ quality: 92 }).toFile(DARK);
  await sharp(lightOut).webp({ quality: 92 }).toFile(LIGHT);

  for (const f of [LIGHT, DARK]) {
    const m = await sharp(f).metadata();
    console.log(`Wrote ${f}: ${m.width}x${m.height} (${(fs.statSync(f).size/1024).toFixed(1)} KB)`);
  }
})();
