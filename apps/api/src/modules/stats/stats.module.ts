import { Module } from '@nestjs/common';

import { CodewarsStatsService } from './codewars-stats.service';
import { GithubStatsService } from './github-stats.service';
import { StatsController } from './stats.controller';

@Module({
  controllers: [StatsController],
  providers: [GithubStatsService, CodewarsStatsService],
})
export class StatsModule {}
