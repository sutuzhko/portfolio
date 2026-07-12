-- Видимость секций главной (вкл/выкл из кабинета). Все по умолчанию включены,
-- чтобы существующие данные не меняли поведение.
ALTER TABLE "Settings" ADD COLUMN "showHighlights" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN "showAbout" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN "showStack" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN "showNow" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN "showFeatured" BOOLEAN NOT NULL DEFAULT true;
