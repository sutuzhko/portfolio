import { ApiProperty } from '@nestjs/swagger';

export class CodewarsStatsDto {
  @ApiProperty({ example: 'sutuzhko' })
  handle: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ description: 'Ранг в kyu (1 — высший)', example: 3 })
  kyu: number;

  @ApiProperty({ description: 'Название ранга', example: '3 kyu' })
  rankName: string;

  @ApiProperty({ description: 'Очки чести (honor)' })
  honor: number;

  @ApiProperty({ description: 'Число решённых ката' })
  katas: number;

  @ApiProperty({ description: 'Позиция в общем лидерборде' })
  leaderboardPosition: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Следующий ранг (kyu) или null для 1 kyu',
    example: 2,
  })
  nextKyu: number | null;

  @ApiProperty({ description: 'Прогресс до следующего ранга, %', example: 62 })
  progress: number;
}
