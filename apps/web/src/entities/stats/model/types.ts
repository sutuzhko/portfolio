import type { components } from '@portfolio/contract';

/** Статистика GitHub-профиля (прокси `/api/stats/github`). */
export type GithubStats = components['schemas']['GithubStatsDto'];

/** Статистика Codewars-профиля (прокси `/api/stats/codewars`). */
export type CodewarsStats = components['schemas']['CodewarsStatsDto'];
