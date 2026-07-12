import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config';

import type { CodewarsStats, GithubStats } from '../model/types';

/** Фикстура GitHub-статистики — форма контрактного GithubStatsDto. */
export const mockGithubStats: GithubStats = {
  handle: '@sutuzhko',
  url: 'https://github.com/sutuzhko',
  repos: 18,
  followers: 13,
  following: 27,
  since: '2020',
  topLanguages: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node'],
};

/** Фикстура Codewars-статистики — форма контрактного CodewarsStatsDto. */
export const mockCodewarsStats: CodewarsStats = {
  handle: 'sutuzhko',
  url: 'https://www.codewars.com/users/sutuzhko',
  kyu: 3,
  rankName: '3 kyu',
  honor: 1069,
  katas: 62,
  leaderboardPosition: 33322,
  nextKyu: 2,
  progress: 62,
};

/** MSW-обработчики эндпоинтов внешней статистики. */
export const statsHandlers = [
  http.get(`${env.apiBaseUrl}/stats/github`, () => HttpResponse.json(mockGithubStats)),
  http.get(`${env.apiBaseUrl}/stats/codewars`, () => HttpResponse.json(mockCodewarsStats)),
];
