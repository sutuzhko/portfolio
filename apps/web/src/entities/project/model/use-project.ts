import { useAppLanguage } from '@/shared/config';

import { useGetProjectQuery } from '../api/project-api';

/**
 * Проект по slug в текущей локали приложения. Кэш RTK Query сегментирован по
 * (slug + язык), смена локали перезапрашивает деталь.
 */
export function useProject(slug: string) {
  const language = useAppLanguage();
  return useGetProjectQuery({ slug, language });
}
