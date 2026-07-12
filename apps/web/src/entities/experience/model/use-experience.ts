import { useAppLanguage } from '@/shared/config';

import { useGetExperienceQuery } from '../api/experience-api';

/** Опыт работы в текущей локали приложения (кэш сегментирован по языку). */
export function useExperience() {
  const language = useAppLanguage();
  return useGetExperienceQuery(language);
}
