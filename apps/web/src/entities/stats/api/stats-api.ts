import { apiSlice } from '@/shared/api';

import type { CodewarsStats, GithubStats } from '../model/types';

/**
 * Эндпоинты внешней статистики (GitHub / Codewars). Ответ не локализуется
 * (числа и хэндлы), поэтому язык-аргумент и `Accept-Language` не нужны.
 */
export const statsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getGithubStats: build.query<GithubStats, void>({
      query: () => ({ url: '/stats/github' }),
    }),
    getCodewarsStats: build.query<CodewarsStats, void>({
      query: () => ({ url: '/stats/codewars' }),
    }),
  }),
});

export const { useGetGithubStatsQuery, useGetCodewarsStatsQuery } = statsApi;
