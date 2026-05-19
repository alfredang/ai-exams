/**
 * Normalize a GPT-generated light logo to match logo-dark.webp exactly:
 *   1. Trim surrounding white padding
 *   2. Pad to a 3:1 canvas (centered) so aspect matches the dark version
 *   3. Resize to 2172x724
 *   4. Write as public/logo-light.webp
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = process.argv[2];
if (!SRC) {
  console.error('Usage: node normalize-light-logo.cjs <path-to-png>');
  process.exit(1);
}
const DST = path.join(__dirname, '..', '..', 'public', 'logo-light.webp');
const TARGET_W = 2172;
const TARGET_H = 724;

(async () => {
  // Step 1: trim near-white background
  const trimmed = await sharp(SRC).trim({ background: '#ffffff', threshold: 5 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  console.log(`After trim: ${meta.width}x${meta.height} (aspect ${(meta.width/meta.height).toFixed(3)})`);

  // Step 2: pad to 3:1 aspect, centered on white
  const targetAspect = TARGET_W / TARGET_H; // 3.0
  const currentAspect = meta.width / meta.height;
  let padW = 0, padH = 0;
  if (currentAspect < targetAspect) {
    // too tall → add horizontal padding
    const newW = Math.round(meta.height * targetAspect);
    padW = newW - meta.width;
  } else if (currentAspect > targetAspect) {
    // too wide → add vertical padding
    const newH = Math.round(meta.width / targetAspect);
    padH = newH - meta.height;
  }
  const left = Math.floor(padW / 2);
  const right = padW - left;
  const top = Math.floor(padH / 2);
  const bottom = padH - top;
  console.log(`Padding: top=${top} bottom=${bottom} left=${left} right=${right}`);

  const padded = await sharp(trimmed)
    .extend({ top, bottom, left, right, background: '#ffffff' })
    .toBuffer();

  // Step 3: resize to exact 2172x724
  await sharp(padded)
    .resize(TARGET_W, TARGET_H, { fit: 'fill' })
    .webp({ quality: 92 })
    .toFile(DST);

  const finalMeta = await sharp(DST).metadata();
  const size = fs.statSync(DST).size;
  console.log(`Wrote ${DST}: ${finalMeta.width}x${finalMeta.height} (${(size/1024).toFixed(1)} KB)`);
})();
