import { useCallback, useEffect, useMemo } from 'react';

import { useGetSettingsQuery } from '@/entities/settings';
import {
  languageChoiceKey,
  normalizeLanguage,
  supportedLanguages,
  type AppLanguage,
} from '@/shared/config';

import { useLanguage } from './use-language';

interface UseSiteLanguagesResult {
  readonly current: AppLanguage;
  /** Языки, доступные на сайте (из настроек ∩ поддерживаемые платформой). */
  readonly available: readonly AppLanguage[];
  /** Явный выбор языка пользователем (запоминается как выбор). */
  readonly choose: (language: AppLanguage) => void;
  /** Переключить на следующий доступный язык (по кругу). */
  readonly cycleNext: () => void;
}

/**
 * Язык сайта с учётом настроек: набор доступных языков и язык по умолчанию задаёт
 * владелец в кабинете (не константа). Здесь же — политика приведения активного
 * языка: язык вне доступных уводим на дефолтный; гостю без явного выбора
 * показываем язык по умолчанию. Пока настройки не загрузились — ничего не меняем.
 */
export function useSiteLanguages(): UseSiteLanguagesResult {
  const { current, change } = useLanguage();
  const { data } = useGetSettingsQuery();

  const available = useMemo<readonly AppLanguage[]>(() => {
    const configured = data?.availableLanguages;
    if (!configured) return supportedLanguages;
    // Контент существует только для поддерживаемых платформой языков — пересекаем,
    // сохраняя их порядок. Пустое пересечение = не даём остаться без языка.
    const list = supportedLanguages.filter((language) => configured.includes(language));
    return list.length > 0 ? list : supportedLanguages;
  }, [data?.availableLanguages]);

  const defaultLanguage = normalizeLanguage(data?.defaultLang);

  useEffect(() => {
    if (!data) return;
    const chosen = localStorage.getItem(languageChoiceKey) !== null;
    const desired = chosen ? current : defaultLanguage;
    const target = available.includes(desired)
      ? desired
      : available.includes(defaultLanguage)
        ? defaultLanguage
        : available[0];
    if (target && target !== current) change(target);
  }, [data, available, current, defaultLanguage, change]);

  const choose = useCallback(
    (language: AppLanguage) => {
      localStorage.setItem(languageChoiceKey, language);
      change(language);
    },
    [change],
  );

  const cycleNext = useCallback(() => {
    const index = available.indexOf(current);
    const next = available[(index + 1) % available.length];
    if (next) choose(next);
  }, [available, current, choose]);

  return { current, available, choose, cycleNext };
}
