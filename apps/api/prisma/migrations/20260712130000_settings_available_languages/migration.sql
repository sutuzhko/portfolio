-- Языки, доступные на сайте (подмножество поддерживаемых). По умолчанию оба.
ALTER TABLE "Settings" ADD COLUMN "availableLanguages" TEXT[] NOT NULL DEFAULT ARRAY['ru', 'en']::TEXT[];
