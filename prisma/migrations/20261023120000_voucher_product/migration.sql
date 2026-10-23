-- Exam Voucher becomes its own storefront product (own slug, title,
-- description, on-sale switch) linked to the certification's Practice Exam.
ALTER TABLE "Bundle" ADD COLUMN "voucherSlug" TEXT;
ALTER TABLE "Bundle" ADD COLUMN "voucherTitle" TEXT;
ALTER TABLE "Bundle" ADD COLUMN "voucherDescription" TEXT;
ALTER TABLE "Bundle" ADD COLUMN "voucherPublished" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX "Bundle_voucherSlug_key" ON "Bundle"("voucherSlug");

UPDATE "Bundle" SET "voucherSlug" = "slug" || '-exam-voucher' WHERE "voucherSlug" IS NULL;
-- A voucher was only sold while its product was published; keep that.
UPDATE "Bundle" SET "voucherPublished" = "published";
-- The Practice Exam is always USD 20 (free legacy products stay free).
UPDATE "Bundle" SET "price" = 2000 WHERE "price" > 0 AND "price" <> 2000;
