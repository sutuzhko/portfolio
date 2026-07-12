import { useAppLanguage } from '@/shared/config';

import { useGetProfileQuery } from '../api/profile-api';

/**
 * Профиль в текущей локали приложения. Инкапсулирует привязку к языку, чтобы
 * страницы не тянули её сами: кэш RTK Query сегментирован по языку, а смена
 * локали автоматически перезапрашивает данные.
 */
export function useProfile() {
  const language = useAppLanguage();
  return useGetProfileQuery(language);
}
