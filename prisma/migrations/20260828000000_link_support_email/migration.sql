-- Keep existing CMS customization intact while turning the built-in support
-- phrases into an explicit, clickable company email address.
UPDATE "Page"
SET "bodyHtml" = REPLACE(
  "bodyHtml",
  'by emailing support.',
  'by emailing <a href="mailto:sales@tertiarycourses.com.sg" style="color:#2563eb;text-decoration:underline">sales@tertiarycourses.com.sg</a>.'
)
WHERE "slug" = 'privacy-policy'
  AND "bodyHtml" LIKE '%by emailing support.%';

UPDATE "Page"
SET "bodyHtml" = REPLACE(
  REPLACE(
    "bodyHtml",
    'Email support with your order id.',
    'Email <a href="mailto:sales@tertiarycourses.com.sg" style="color:#2563eb;text-decoration:underline">sales@tertiarycourses.com.sg</a> with your order id.'
  ),
  'contact support directly.',
  'contact <a href="mailto:sales@tertiarycourses.com.sg" style="color:#2563eb;text-decoration:underline">sales@tertiarycourses.com.sg</a> directly.'
)
WHERE "slug" = 'refund-policy'
  AND (
    "bodyHtml" LIKE '%Email support with your order id.%'
    OR "bodyHtml" LIKE '%contact support directly.%'
  );
