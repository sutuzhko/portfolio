-- Видимость публичных страниц-роутов (вкл/выкл из кабинета). По умолчанию включены.
ALTER TABLE "Settings" ADD COLUMN "showProjects" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN "showExperience" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN "showContact" BOOLEAN NOT NULL DEFAULT true;
