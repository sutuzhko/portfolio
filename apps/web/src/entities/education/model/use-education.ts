import { useAppLanguage } from '@/shared/config';

import { useGetEducationQuery } from '../api/education-api';

/** Образование в текущей локали приложения (кэш сегментирован по языку). */
export function useEducation() {
  const language = useAppLanguage();
  return useGetEducationQuery(language);
}
