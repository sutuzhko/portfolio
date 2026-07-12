-- Порядок технологий и навыков — Float: перестановка меняет позицию ОДНОЙ записи
-- (дробное значение между соседями), а не перенумеровывает все (минимальный дифф).
ALTER TABLE "Technology" ALTER COLUMN "order" SET DATA TYPE DOUBLE PRECISION;
ALTER TABLE "Skill" ALTER COLUMN "order" SET DATA TYPE DOUBLE PRECISION;
