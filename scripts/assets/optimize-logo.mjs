/**
 * Compress whatever logo image is dropped into public/ down to a small,
 * sharp WebP at public/logo.webp. Target output: < 200 KB.
 *
 *   node scripts/assets/optimize-logo.mjs
 *
 * Looks for the first file it finds at:
 *   public/logo.png  →  public/logo.jpg  →  public/logo.jpeg  →
 *   public/logo.webp →  public/examnova.png  →  public/brand.png
 * Resizes to fit inside 512x512 (4x Retina for a 128px display), encodes
 * WebP at quality 90 with effort 6. Re-encodes lower if the output is
 * still over 200 KB.
 */
import sharp from 'sharp';
import { statSync, existsSync, unlinkSync } from 'node:fs';

const candidates = [
  'public/logo.png',
  'public/logo.jpg',
  'public/logo.jpeg',
  'public/logo.webp',
  'public/examnova.png',
  'public/brand.png'
];

const source = candidates.find(f => existsSync(f));
if (!source) {
  console.error('No source logo file found. Save the logo image to one of:');
  candidates.forEach(c => console.error(`  ${c}`));
  process.exit(1);
}

const out = 'public/logo.webp';
const TARGET_BYTES = 200 * 1024;

// Target output: fixed 3:1 aspect ratio so both light/dark variants
// render at IDENTICAL proportions in the nav slot.
const TARGET_W = 1200;
const TARGET_H = 400;

async function encode(quality) {
  // Sample the top-left corner color to use as letterbox/pillarbox fill —
  // this avoids weird transparent edges when the source has a baked-in
  // colored background.
  const corner = await sharp(source)
    .extract({ left: 0, top: 0, width: 4, height: 4 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bg = { r: corner.data[0], g: corner.data[1], b: corner.data[2], alpha: 1 };

  return sharp(source)
    // Trim near-uniform borders so the actual logo content fills as much
    // of the final canvas as possible.
    .trim({ threshold: 30 })
    // Resize the trimmed content to fit inside the target canvas, then
    // pad with the sampled corner color (so the letterbox blends with
    // the original background).
    .resize({
      width: TARGET_W,
      height: TARGET_H,
      fit: 'contain',
      background: bg
    })
    .webp({ quality, effort: 6 })
    .toBuffer();
}

const before = statSync(source).size;
let quality = 90;
let buf = await encode(quality);

// Iterate down if we overshoot 200 KB. Logos are usually tiny so this
// rarely needs to fire, but it's a safety net for very large source PNGs.
while (buf.length > TARGET_BYTES && quality > 50) {
  quality -= 10;
  buf = await encode(quality);
}

await sharp(buf).toFile(out);

// If the source was the same file, leave it alone; otherwise (e.g. source
// was a different filename like examnova.png) remove the original to keep
// public/ clean.
if (source !== out && source !== 'public/logo.png') {
  unlinkSync(source);
}

console.log(`source: ${source} (${(before / 1024).toFixed(0)} KB)`);
console.log(`output: ${out} (${(buf.length / 1024).toFixed(0)} KB at q${quality})`);
if (buf.length > TARGET_BYTES) {
  console.warn(`⚠ still over 200 KB — consider trimming or downsizing the source`);
}
