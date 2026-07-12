-- cvUrl: String? -> Json? (LocalizedText). Существующую строку-URL оборачиваем в
-- { "ru": <url> }, чтобы не потерять данные при смене типа колонки.
ALTER TABLE "Profile"
  ALTER COLUMN "cvUrl" TYPE JSONB
  USING (CASE WHEN "cvUrl" IS NULL THEN NULL ELSE jsonb_build_object('ru', "cvUrl") END);
