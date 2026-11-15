import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { checkPublicUrl, extractFromPdf, youtubeVideoId } from './extract';

test('YouTube links resolve to a video id; other hosts do not', () => {
  assert.equal(youtubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10'), 'dQw4w9WgXcQ');
  assert.equal(youtubeVideoId('https://youtu.be/dQw4w9WgXcQ?si=x'), 'dQw4w9WgXcQ');
  assert.equal(youtubeVideoId('https://m.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(youtubeVideoId('https://evil.example/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(youtubeVideoId('https://www.youtube.com/watch?v=short'), null);
});

test('only public web links are accepted', () => {
  for (const bad of ['http://127.0.0.1/x', 'http://localhost:3000', 'http://[::1]/', 'file:///etc/passwd', 'http://intranet/', 'http://db.internal/']) {
    assert.equal(typeof checkPublicUrl(bad), 'string', bad);
  }
  assert.equal(typeof checkPublicUrl('https://learn.microsoft.com/en-us/'), 'object');
});

test('PDF text is extracted without the AI fallback', async () => {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let p = 0; p < 2; p++) {
    const page = doc.addPage();
    for (let i = 0; i < 30; i++) page.drawText(`Page ${p + 1} line ${i}: Amazon S3 is designed for eleven nines of durability.`, { x: 40, y: 760 - i * 22, size: 10, font });
  }
  const out = await extractFromPdf(Buffer.from(await doc.save()), 'sample.pdf');
  assert.equal(out.via, 'pdf-text');
  assert.equal(out.title, 'sample');
  assert.match(out.text, /eleven nines of durability/);
});
