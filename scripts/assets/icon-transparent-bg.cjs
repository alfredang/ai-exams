/**
 * Make the favicon background transparent.
 *
 * The source icon is neon line-art glowing against a near-black navy bg.
 * A hard chroma-key would clip the glow, so instead we derive ALPHA from
 * luminance: dark navy → fully transparent, bright neon → fully opaque,
 * the glow falloff in between → partial alpha. This keeps the glow looking
 * natural on any background (light or dark browser chrome).
 *
 * Regenerates src/app/icon.png (512) and src/app/apple-icon.png (180).
 */
const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'src', 'app', 'icon.png');
const ICON = SRC;
const APPLE = path.join(__dirname, '..', '..', 'src', 'app', 'apple-icon.png');

// Luminance below LO → alpha 0; above HI → alpha 255; linear ramp between.
const LO = 18;   // anything darker than this is pure background
const HI = 70;   // anything brighter than this is solid artwork

(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i], g = out[i + 1], b = out[i + 2];
    // Perceptual-ish luminance
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    let a;
    if (luma <= LO) a = 0;
    else if (luma >= HI) a = 255;
    else a = Math.round(((luma - LO) / (HI - LO)) * 255);
    out[i + 3] = a;
    // Slightly lift the RGB of glow pixels so faint edges keep their hue
    // instead of muddying toward black when composited.
    if (a > 0 && a < 255) {
      const boost = 255 / Math.max(luma, 1);
      out[i]     = Math.min(255, Math.round(r * Math.min(boost, 2.2)));
      out[i + 1] = Math.min(255, Math.round(g * Math.min(boost, 2.2)));
      out[i + 2] = Math.min(255, Math.round(b * Math.min(boost, 2.2)));
    }
  }

  const baseline = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png();
  const buf = await baseline.toBuffer();

  await sharp(buf).resize(512, 512, { fit: 'cover' }).png().toFile(ICON + '.tmp');
  await sharp(buf).resize(180, 180, { fit: 'cover' }).png().toFile(APPLE + '.tmp');

  const fs = require('fs');
  fs.renameSync(ICON + '.tmp', ICON);
  fs.renameSync(APPLE + '.tmp', APPLE);
  console.log('Rewrote icon.png (512, transparent) + apple-icon.png (180, transparent)');
})();
