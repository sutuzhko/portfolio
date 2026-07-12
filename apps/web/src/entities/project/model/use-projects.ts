import { useAppLanguage } from '@/shared/config';

import { useGetProjectsQuery } from '../api/project-api';

/**
 * Список проектов в текущей локали приложения. Инкапсулирует привязку к языку:
 * кэш RTK Query сегментирован по языку, смена локали перезапрашивает список.
 */
export function useProjects() {
  const language = useAppLanguage();
  return useGetProjectsQuery(language);
}
