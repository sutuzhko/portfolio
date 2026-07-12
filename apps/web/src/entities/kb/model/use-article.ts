import { skipToken } from '@reduxjs/toolkit/query';

import { useAppLanguage } from '@/shared/config';

import { useGetArticleQuery } from '../api/kb-api';

/**
 * Статья базы знаний по slug в текущей локали. Без slug (ничего не выбрано)
 * запрос не запускается (`skipToken`), поэтому читатель видит пустое состояние.
 */
export function useArticle(slug: string | undefined) {
  const language = useAppLanguage();
  return useGetArticleQuery(slug === undefined ? skipToken : { slug, language });
}
