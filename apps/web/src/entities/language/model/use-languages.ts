import { useAppLanguage } from '@/shared/config';

import { useGetLanguagesQuery } from '../api/language-api';

/** Языки в текущей локали приложения (кэш сегментирован по языку). */
export function useLanguages() {
  const language = useAppLanguage();
  return useGetLanguagesQuery(language);
}
