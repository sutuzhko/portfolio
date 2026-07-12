export { statsApi, useGetGithubStatsQuery, useGetCodewarsStatsQuery } from './api/stats-api';
export type { GithubStats, CodewarsStats } from './model/types';

// Моки живут в отдельной точке входа './mocks' — чтобы msw не попадал в прод-бандл.
