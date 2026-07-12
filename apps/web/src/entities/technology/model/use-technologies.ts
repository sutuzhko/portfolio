import { useAppLanguage } from '@/shared/config';

import { useGetTechnologiesQuery } from '../api/technology-api';

/** Технологии стека в текущей локали приложения (кэш сегментирован по языку). */
export function useTechnologies() {
  const language = useAppLanguage();
  return useGetTechnologiesQuery(language);
}
