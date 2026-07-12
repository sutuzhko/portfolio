import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeLanguage, type AppLanguage } from '@/shared/config';

interface UseLanguageResult {
  readonly current: AppLanguage;
  readonly change: (language: AppLanguage) => void;
}

/**
 * Низкоуровневое чтение/смена языка через i18next. Политику доступных языков и
 * язык по умолчанию накладывает `useSiteLanguages` поверх этого хука.
 */
export function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();
  const current = normalizeLanguage(i18n.resolvedLanguage);

  const change = useCallback(
    (language: AppLanguage) => {
      void i18n.changeLanguage(language);
    },
    [i18n],
  );

  return { current, change };
}
