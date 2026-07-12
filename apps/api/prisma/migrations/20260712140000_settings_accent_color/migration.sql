-- Акцент оформления сайта (green | blue | bright). По умолчанию — фирменный зелёный.
ALTER TABLE "Settings" ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT 'green';
