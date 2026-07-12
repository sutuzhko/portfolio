import { ApiProperty } from '@nestjs/swagger';

export class LanguageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ description: 'Уровень по CEFR: A1…C2 или native' })
  level: string;

  @ApiProperty({ minimum: 0, maximum: 100, description: 'Уровень владения в процентах' })
  pct: number;
}
