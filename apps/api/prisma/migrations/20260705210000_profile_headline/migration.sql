-- AlterTable: питч героя как локализованный текст. Добавляем nullable, заполняем
-- существующий синглтон-профиль, затем делаем NOT NULL.
ALTER TABLE "Profile" ADD COLUMN "headline" JSONB;

UPDATE "Profile"
SET "headline" = '{"ru":"Строю аккуратный фронтенд и корпоративные UI-kit с нуля. Уверенно работаю и в React-, и в Vue-экосистемах. Ищу команду, где смогу раскрыть весь потенциал.","en":"I build clean frontends and corporate UI-kits from scratch. Confident in both React and Vue ecosystems. Looking for a team where I can reach my full potential."}'::jsonb
WHERE "headline" IS NULL;

ALTER TABLE "Profile" ALTER COLUMN "headline" SET NOT NULL;
