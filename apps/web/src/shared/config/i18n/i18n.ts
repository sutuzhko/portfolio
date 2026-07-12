import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { defaultNamespace, fallbackLanguage, resources, supportedLanguages } from './resources';

/** Ключ, под которым выбранный язык сохраняется в localStorage (кэш детектора). */
export const languageStorageKey = 'portfolio.lang';

/**
 * Маркер ЯВНОГО выбора языка пользователем. Детектор i18next кэширует и
 * автоопределённый язык в `languageStorageKey`, поэтому по нему нельзя отличить
 * «гость ничего не выбирал» от «выбрал». Этот ключ ставится только при ручном
 * переключении — по нему гостю показываем язык сайта по умолчанию.
 */
export const languageChoiceKey = 'portfolio.lang.chosen';

/**
 * Конфигурируем единственный экземпляр i18next.
 * Идемпотентно: повторный вызов (Storybook, тесты) не реинициализирует инстанс.
 */
export function setupI18n(): typeof i18n {
  if (i18n.isInitialized) {
    return i18n;
  }

  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      supportedLngs: [...supportedLanguages],
      fallbackLng: fallbackLanguage,
      defaultNS: defaultNamespace,
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: languageStorageKey,
        caches: ['localStorage'],
      },
      interpolation: {
        // React сам экранирует значения — двойное экранирование не нужно.
        escapeValue: false,
      },
    });

  return i18n;
}

export { i18n };
