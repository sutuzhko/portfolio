import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CodewarsStatsDto } from './dto/codewars-stats.dto';
import { TtlCache } from './ttl-cache';

// Поля ответа Codewars API /api/v1/users/{user}, которые нам нужны.
interface CodewarsUserResponse {
  username: string;
  honor: number;
  leaderboardPosition: number;
  ranks: { overall: { rank: number; name: string; score: number } };
  codeChallenges: { totalCompleted: number };
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 минут
const REQUEST_TIMEOUT_MS = 5000;
const DEFAULT_USERNAME = 'sutuzhko';

// Пороги общего score для каждого ранга kyu (официальная прогрессия Codewars).
// По ним считаем прогресс до следующего ранга для полоски в карточке активности.
const KYU_SCORE_THRESHOLDS: Record<number, number> = {
  8: 0,
  7: 20,
  6: 76,
  5: 229,
  4: 643,
  3: 1768,
  2: 4829,
  1: 13147,
};

// Прогресс (0–100 %) от текущего ранга к следующему и номер следующего kyu.
// Для 1 kyu (высший до dan) следующего нет — nextKyu = null, прогресс 100 %.
function rankProgress(kyu: number, score: number): { nextKyu: number | null; progress: number } {
  const nextKyu = kyu > 1 ? kyu - 1 : null;
  if (nextKyu === null) return { nextKyu: null, progress: 100 };

  const floor = KYU_SCORE_THRESHOLDS[kyu] ?? 0;
  const ceil = KYU_SCORE_THRESHOLDS[nextKyu] ?? floor;
  const span = ceil - floor;
  const ratio = span > 0 ? ((score - floor) / span) * 100 : 0;
  return { nextKyu, progress: Math.max(0, Math.min(100, Math.round(ratio))) };
}

@Injectable()
export class CodewarsStatsService {
  private readonly logger = new Logger(CodewarsStatsService.name);
  private readonly cache = new TtlCache<CodewarsStatsDto>(CACHE_TTL_MS);
  private readonly username: string;

  constructor(config: ConfigService) {
    this.username = config.get<string>('CODEWARS_USERNAME') ?? DEFAULT_USERNAME;
  }

  async get(): Promise<CodewarsStatsDto> {
    const fresh = this.cache.getFresh();
    if (fresh) return fresh;

    try {
      const stats = await this.fetchStats();
      this.cache.set(stats);
      return stats;
    } catch (error) {
      const stale = this.cache.getStale();
      if (stale) {
        this.logger.warn(`Codewars API недоступен, отдаём устаревший кэш: ${String(error)}`);
        return stale;
      }
      throw new ServiceUnavailableException('Codewars statistics are temporarily unavailable');
    }
  }

  private async fetchStats(): Promise<CodewarsStatsDto> {
    const response = await fetch(`https://www.codewars.com/api/v1/users/${this.username}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Codewars API ответил ${response.status}`);
    }

    const data = (await response.json()) as CodewarsUserResponse;
    // Codewars отдаёт ранг отрицательным числом (−3 = 3 kyu); приводим к положительному.
    const kyu = Math.abs(data.ranks.overall.rank);
    const { nextKyu, progress } = rankProgress(kyu, data.ranks.overall.score);

    return {
      handle: data.username,
      url: `https://www.codewars.com/users/${data.username}`,
      kyu,
      rankName: data.ranks.overall.name,
      honor: data.honor,
      katas: data.codeChallenges.totalCompleted,
      leaderboardPosition: data.leaderboardPosition,
      nextKyu,
      progress,
    };
  }
}
