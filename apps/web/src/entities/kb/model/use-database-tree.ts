import { useAppLanguage } from '@/shared/config';

import { useGetDatabaseTreeQuery } from '../api/kb-api';

/**
 * Дерево базы знаний в текущей локали. Инкапсулирует привязку к языку: кэш
 * сегментирован по локали, смена языка автоматически перезапрашивает данные.
 */
export function useDatabaseTree() {
  const language = useAppLanguage();
  return useGetDatabaseTreeQuery(language);
}
