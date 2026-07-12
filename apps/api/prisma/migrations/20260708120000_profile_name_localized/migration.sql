-- name: String -> Json (LocalizedText). Существующую строку-имя оборачиваем в
-- { "ru": <name> }, чтобы не потерять данные при смене типа колонки.
ALTER TABLE "Profile"
  ALTER COLUMN "name" TYPE JSONB
  USING jsonb_build_object('ru', "name");
