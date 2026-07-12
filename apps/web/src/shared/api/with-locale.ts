import type { AppLanguage } from '@/shared/config';

import type { AxiosBaseQueryArgs } from './axios-base-query';

/**
 * Добавляет к аргументам запроса заголовок `Accept-Language` — единая точка
 * локализации HTTP. Бэкенд по нему выбирает язык ответа, а язык-аргумент
 * эндпоинта заодно сегментирует кэш RTK Query, поэтому смена локали
 * автоматически перезапрашивает данные.
 */
export function withLocale(
  language: AppLanguage,
  args: Omit<AxiosBaseQueryArgs, 'headers'>,
): AxiosBaseQueryArgs {
  return { ...args, headers: { 'Accept-Language': language } };
}
