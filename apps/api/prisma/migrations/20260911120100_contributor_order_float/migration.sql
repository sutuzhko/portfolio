-- Порядок участников — Float, как у технологий и навыков: перетаскивание ставит участника
-- дробной позицией между соседями, не перенумеровывая остальных (минимальный дифф).
ALTER TABLE "Contributor" ALTER COLUMN "order" SET DATA TYPE DOUBLE PRECISION;
