INSERT INTO "Page" (
  "id",
  "slug",
  "title",
  "bodyHtml",
  "excerpt",
  "published",
  "showInFooter",
  "footerGroup",
  "position",
  "updatedAt",
  "createdAt"
)
VALUES (
  'support-page-20260828',
  'support',
  'Contact & Support',
  '<p style="margin:0 0 12px;line-height:1.7">Our support team helps with practice-exam access, billing, voucher delivery, refunds, and question-content concerns.</p><h2 style="margin:24px 0 8px;font-size:1.25rem;font-weight:600">Contact support</h2><p style="margin:0 0 12px;line-height:1.7">Email <a href="mailto:sales@tertiarycourses.com.sg" style="color:#2563eb;text-decoration:underline">sales@tertiarycourses.com.sg</a>. We typically reply within one business day.</p><h2 style="margin:24px 0 8px;font-size:1.25rem;font-weight:600">Include these details</h2><p style="margin:0 0 12px;line-height:1.7">Please include your account email, order number (if applicable), exam code, and a short description of the issue. Do not email passwords, payment-card details, or voucher codes.</p><h2 style="margin:24px 0 8px;font-size:1.25rem;font-weight:600">Voucher delivery</h2><p style="margin:0 0 12px;line-height:1.7">Practice access unlocks immediately after payment. Official exam voucher codes are normally delivered by email within 3-5 business days.</p><h2 style="margin:24px 0 8px;font-size:1.25rem;font-weight:600">Refunds</h2><p style="margin:0 0 12px;line-height:1.7">See our <a href="/p/refund-policy" style="color:#2563eb;text-decoration:underline">Refund Policy</a> for eligibility and processing times. The voucher portion becomes non-refundable once its code has been issued.</p><h2 style="margin:24px 0 8px;font-size:1.25rem;font-weight:600">Company</h2><p style="margin:0 0 12px;line-height:1.7">Tertiary Infotech Academy Pte Ltd<br>12 Woodland Square #07-85/86/87 Woods Square Tower 1, Singapore 737715<br>Tel: +65 6100 0613</p>',
  'Get help with exam access, billing, vouchers, refunds, or question content.',
  TRUE,
  TRUE,
  'company',
  25,
  NOW(),
  NOW()
)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "Page"
SET "bodyHtml" = REPLACE(
  "bodyHtml",
  'mailto:angch@tertiaryinfotech.com">angch@tertiaryinfotech.com',
  'mailto:sales@tertiarycourses.com.sg">sales@tertiarycourses.com.sg'
)
WHERE "slug" = 'contact'
  AND "bodyHtml" LIKE '%mailto:angch@tertiaryinfotech.com%';
