export const LOCALES = ['ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

// Двуязычный текст контентных сущностей; ru — запасной язык.
export interface LocalizedText {
  ru: string;
  en?: string;
}

export interface LocalizedList {
  ru: string[];
  en?: string[];
}
