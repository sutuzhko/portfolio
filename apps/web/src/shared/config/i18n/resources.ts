import en from './locales/en/translation.json';
import ru from './locales/ru/translation.json';

/** Список поддерживаемых языков платформы. Русский — основной (фолбэк). */
export const supportedLanguages = ['ru', 'en'] as const;

export type AppLanguage = (typeof supportedLanguages)[number];

/** Язык-источник: недостающие ключи остальных локалей фолбэчатся на него. */
export const fallbackLanguage: AppLanguage = 'ru';

export const defaultNamespace = 'translation' as const;

/** Ресурсы i18next. Русская локаль задаёт форму типов ключей. */
export const resources = {
  ru: { translation: ru },
  en: { translation: en },
} as const;

// Тип ресурсов одной локали. Пока не подключаем к CustomTypeOptions: в текущей
// связке i18next@26 + TS вывод «голых» ключей t() ломается (ключи схлопываются в never),
// а префикс пространства имён в каждом вызове засорял бы код. Строгую типизацию ключей
// вернём отдельным шагом. Тип экспортируем — пригодится для будущей проверки полноты локалей.
export type AppResources = (typeof resources)['ru'];
