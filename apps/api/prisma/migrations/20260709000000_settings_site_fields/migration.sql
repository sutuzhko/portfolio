-- Настройки приложения по макету: убираем неиспользуемые accent/consoleMode
-- (нет в макете, никем не потребляются) и добавляем поля сайта.

-- DropColumn
ALTER TABLE "Settings" DROP COLUMN "accent";
ALTER TABLE "Settings" DROP COLUMN "consoleMode";

-- AddColumn
ALTER TABLE "Settings" ADD COLUMN "siteTitle" TEXT NOT NULL DEFAULT 'bogdan.sutuzhko';
ALTER TABLE "Settings" ADD COLUMN "interviewPassword" TEXT NOT NULL DEFAULT 'interview2026';
ALTER TABLE "Settings" ADD COLUMN "consoleGlow" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Settings" ADD COLUMN "showActivity" BOOLEAN NOT NULL DEFAULT true;
