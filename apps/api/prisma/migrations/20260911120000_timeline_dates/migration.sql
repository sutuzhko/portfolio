-- Период образования — настоящие даты вместо свободной строки: таймлайн сортируется
-- по дате начала, а подпись периода форматируется по локали. Ручной `order` у опыта и
-- образования больше не нужен — порядок задают даты.
--
-- Одна транзакция: если перенос данных упадёт, схема останется нетронутой (Prisma сама
-- миграцию в транзакцию не оборачивает).
BEGIN;

ALTER TABLE "Education" ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "endDate" TIMESTAMP(3);

-- Разовый перенос существующих строк: «09/2022 — 07/2024» → точные месяцы; голый год
-- («2014 — 2018») → сентябрь для начала и июнь для окончания (границы учебного года).
-- Нераспознанный период оставит startDate пустым, и SET NOT NULL ниже уронит миграцию:
-- явная ошибка лучше выдуманной даты.
UPDATE "Education" AS e
SET "startDate" = make_date(p.m[2]::int, COALESCE(p.m[1]::int, 9), 1),
    "endDate" = CASE
      WHEN p.m[4] IS NULL THEN NULL
      ELSE make_date(p.m[4]::int, COALESCE(p.m[3]::int, 6), 1)
    END
FROM (
  SELECT "id",
         regexp_match("period", '^\s*(?:(\d{1,2})/)?(\d{4})\s*(?:[—–-]\s*(?:(\d{1,2})/)?(\d{4}))?\s*$') AS m
  FROM "Education"
) AS p
WHERE p."id" = e."id" AND p.m IS NOT NULL;

ALTER TABLE "Education" ALTER COLUMN "startDate" SET NOT NULL;

ALTER TABLE "Education" DROP COLUMN "period",
DROP COLUMN "order";

ALTER TABLE "Experience" DROP COLUMN "order";

COMMIT;
