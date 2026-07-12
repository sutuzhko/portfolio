import { useTranslation } from 'react-i18next';

import { fallbackLanguage, supportedLanguages, type AppLanguage } from './resources';

/**
 * Приводит произвольный код языка (например, из детектора — `en-US`) к одному
 * из поддерживаемых. Всё, что не распознано, падает на язык-фолбэк.
 */
export function normalizeLanguage(language: string | undefined): AppLanguage {
  return supportedLanguages.find((lng) => lng === language) ?? fallbackLanguage;
}

/**
 * Текущий язык приложения как строгий `AppLanguage`. Единый источник правды
 * для локали контента: и подписи UI, и запросы к API берут язык отсюда.
 */
export function useAppLanguage(): AppLanguage {
  const { i18n } = useTranslation();
  return normalizeLanguage(i18n.resolvedLanguage);
}
