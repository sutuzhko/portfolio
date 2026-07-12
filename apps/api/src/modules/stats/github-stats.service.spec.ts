import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GithubStatsService } from './github-stats.service';

// Конфиг с фиксированным логином — внешние вызовы мокаем, сеть не трогаем.
const config = { get: () => 'octocat' } as unknown as ConfigService;

const githubPayload = {
  login: 'octocat',
  html_url: 'https://github.com/octocat',
  public_repos: 18,
  followers: 13,
  following: 27,
  created_at: '2020-01-15T00:00:00Z',
};

const mockFetchOnce = (payload: unknown, ok = true, status = 200): void => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(payload),
  });
};

describe('GithubStatsService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('маппит ответ GitHub в DTO', async () => {
    mockFetchOnce(githubPayload);
    const service = new GithubStatsService(config);

    const stats = await service.get();

    expect(stats).toEqual({
      handle: '@octocat',
      url: 'https://github.com/octocat',
      repos: 18,
      followers: 13,
      following: 27,
      since: '2020',
      topLanguages: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node'],
    });
  });

  it('кэширует успешный ответ и не ходит в сеть повторно', async () => {
    mockFetchOnce(githubPayload);
    const service = new GithubStatsService(config);

    await service.get();
    await service.get();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('отдаёт устаревший кэш, если внешний API упал', async () => {
    const service = new GithubStatsService(config);
    mockFetchOnce(githubPayload);
    const first = await service.get();

    // Истечение TTL имитируем продвижением часов.
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 60 * 60 * 1000);
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network down'));

    await expect(service.get()).resolves.toEqual(first);
  });

  it('бросает 503, если данных нет совсем', async () => {
    mockFetchOnce(null, false, 503);
    const service = new GithubStatsService(config);

    await expect(service.get()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
