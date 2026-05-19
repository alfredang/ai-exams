/**
 * The transparent favicon has too much empty margin, so it looks tiny in a
 * browser tab next to icons that fill their box (e.g. GitHub). This trims
 * the transparent border down to the actual artwork, then re-pads with only
 * a small uniform margin so the icon fills ~92% of the square.
 *
 * Regenerates src/app/icon.png (512) + src/app/apple-icon.png (180).
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICON = path.join(__dirname, '..', '..', 'src', 'app', 'icon.png');
const APPLE = path.join(__dirname, '..', '..', 'src', 'app', 'apple-icon.png');

// Fraction of the final canvas the artwork should occupy (0.92 = 4% margin each side)
const FILL = 0.92;
const ALPHA_FLOOR = 12; // ignore near-invisible glow when finding content bounds

(async () => {
  const { data, info } = await sharp(ICON).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;

  // Find bounding box of pixels with meaningful alpha
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = data[(y * W + x) * 4 + 3];
      if (a > ALPHA_FLOOR) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  console.log(`Artwork bounds: ${cw}x${ch} at (${minX},${minY}) within ${W}x${H}`);

  const cropped = await sharp(ICON)
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .toBuffer();

  async function emit(file, size) {
    const target = Math.round(size * FILL);
    // Fit the (possibly non-square) artwork into a target x target box,
    // preserving aspect, then center on a fully transparent size x size canvas.
    const resized = await sharp(cropped)
      .resize(target, target, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    const meta = await sharp(resized).metadata();
    const left = Math.round((size - meta.width) / 2);
    const top = Math.round((size - meta.height) / 2);
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
      .composite([{ input: resized, left, top }])
      .png()
      .toFile(file + '.tmp');
    fs.renameSync(file + '.tmp', file);
  }

  await emit(ICON, 512);
  await emit(APPLE, 180);
  console.log(`Rewrote icon.png (512) + apple-icon.png (180) — artwork now fills ${Math.round(FILL*100)}% of canvas`);
})();
