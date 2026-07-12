import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CodewarsStatsDto } from './dto/codewars-stats.dto';
import { GithubStatsDto } from './dto/github-stats.dto';
import { CodewarsStatsService } from './codewars-stats.service';
import { GithubStatsService } from './github-stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(
    private readonly githubStatsService: GithubStatsService,
    private readonly codewarsStatsService: CodewarsStatsService,
  ) {}

  @Get('github')
  @ApiOkResponse({ type: GithubStatsDto })
  github(): Promise<GithubStatsDto> {
    return this.githubStatsService.get();
  }

  @Get('codewars')
  @ApiOkResponse({ type: CodewarsStatsDto })
  codewars(): Promise<CodewarsStatsDto> {
    return this.codewarsStatsService.get();
  }
}
