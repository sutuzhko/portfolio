import { useAppLanguage } from '@/shared/config';

import { useGetSkillsQuery } from '../api/skill-api';

/** Навыки в текущей локали приложения (кэш сегментирован по языку). */
export function useSkills() {
  const language = useAppLanguage();
  return useGetSkillsQuery(language);
}
