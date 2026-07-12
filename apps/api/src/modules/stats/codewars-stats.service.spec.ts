import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CodewarsStatsService } from './codewars-stats.service';

const config = { get: () => 'sutuzhko' } as unknown as ConfigService;

const codewarsPayload = {
  username: 'sutuzhko',
  honor: 1069,
  leaderboardPosition: 33322,
  // score подобран так, чтобы прогресс от 3 kyu (1768) к 2 kyu (4829) вышел 62 %.
  ranks: { overall: { rank: -3, name: '3 kyu', score: 3666 } },
  codeChallenges: { totalCompleted: 62 },
};

const mockFetchOnce = (payload: unknown, ok = true, status = 200): void => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(payload),
  });
};

describe('CodewarsStatsService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('маппит ответ Codewars в DTO и нормализует kyu', async () => {
    mockFetchOnce(codewarsPayload);
    const service = new CodewarsStatsService(config);

    const stats = await service.get();

    expect(stats).toEqual({
      handle: 'sutuzhko',
      url: 'https://www.codewars.com/users/sutuzhko',
      kyu: 3,
      rankName: '3 kyu',
      honor: 1069,
      katas: 62,
      leaderboardPosition: 33322,
      nextKyu: 2,
      progress: 62,
    });
  });

  it('бросает 503, если данных нет совсем', async () => {
    mockFetchOnce(null, false, 500);
    const service = new CodewarsStatsService(config);

    await expect(service.get()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
