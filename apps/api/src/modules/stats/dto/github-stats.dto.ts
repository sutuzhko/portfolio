import { ApiProperty } from '@nestjs/swagger';

export class GithubStatsDto {
  @ApiProperty({ example: '@sutuzhko' })
  handle: string;

  @ApiProperty()
  url: string;

  @ApiProperty({ description: 'Число публичных репозиториев' })
  repos: number;

  @ApiProperty()
  followers: number;

  @ApiProperty()
  following: number;

  @ApiProperty({ description: 'Год регистрации на GitHub', example: '2020' })
  since: string;

  @ApiProperty({
    type: [String],
    description: 'Ключевые языки/технологии профиля (курируется на сервере)',
    example: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node'],
  })
  topLanguages: string[];
}
