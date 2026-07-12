-- Подзаголовок проекта (LocalizedText JSON), опциональный — показывается на
-- плитке/детали. Nullable, backfill не нужен.
ALTER TABLE "Project" ADD COLUMN "subtitle" JSONB;
