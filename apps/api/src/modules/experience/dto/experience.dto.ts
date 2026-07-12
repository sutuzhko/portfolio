import { ApiProperty } from '@nestjs/swagger';

export class ExperienceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  company: string;

  @ApiProperty({ type: String, nullable: true })
  location: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Уточнение под должностью (проект и т.п.)',
  })
  sub: string | null;

  @ApiProperty({ type: String, isArray: true })
  bullets: string[];

  @ApiProperty({ format: 'date-time' })
  startDate: string;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  endDate: string | null;

  @ApiProperty({ description: 'Текущее место работы' })
  current: boolean;

  @ApiProperty({ type: String, nullable: true })
  dotColor: string | null;

  @ApiProperty({ type: String, isArray: true })
  technologies: string[];
}
