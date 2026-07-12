import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GithubStatsDto } from './dto/github-stats.dto';
import { TtlCache } from './ttl-cache';

// Поля ответа GitHub REST API /users/{login}, которые нам нужны.
interface GithubUserResponse {
  login: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 минут — GitHub лимитирует анонимные запросы (60/час)
const REQUEST_TIMEOUT_MS = 5000;
const DEFAULT_USERNAME = 'sutuzhko';

// Ключевые языки профиля курируются на сервере: живая агрегация по всем репозиториям
// (N+1 запросов к GitHub) слишком дорога под анонимным rate-limit. При необходимости
// вынесем в env/CMS. Список — из макета активности.
const TOP_LANGUAGES = ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node'];

@Injectable()
export class GithubStatsService {
  private readonly logger = new Logger(GithubStatsService.name);
  private readonly cache = new TtlCache<GithubStatsDto>(CACHE_TTL_MS);
  private readonly username: string;

  constructor(config: ConfigService) {
    this.username = config.get<string>('GITHUB_USERNAME') ?? DEFAULT_USERNAME;
  }

  async get(): Promise<GithubStatsDto> {
    const fresh = this.cache.getFresh();
    if (fresh) return fresh;

    try {
      const stats = await this.fetchStats();
      this.cache.set(stats);
      return stats;
    } catch (error) {
      const stale = this.cache.getStale();
      if (stale) {
        this.logger.warn(`GitHub API недоступен, отдаём устаревший кэш: ${String(error)}`);
        return stale;
      }
      throw new ServiceUnavailableException('GitHub statistics are temporarily unavailable');
    }
  }

  private async fetchStats(): Promise<GithubStatsDto> {
    const response = await fetch(`https://api.github.com/users/${this.username}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`GitHub API ответил ${response.status}`);
    }

    const data = (await response.json()) as GithubUserResponse;
    return {
      handle: `@${data.login}`,
      url: data.html_url,
      repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      since: new Date(data.created_at).getFullYear().toString(),
      topLanguages: TOP_LANGUAGES,
    };
  }
}
