import { ApiProperty } from '@nestjs/swagger';
import { EducationType } from '@prisma/client';

export class EducationDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: EducationType, enumName: 'EducationType' })
  type: EducationType;

  @ApiProperty()
  degree: string;

  @ApiProperty({ type: String, nullable: true })
  place: string | null;

  @ApiProperty({ format: 'date-time' })
  startDate: string;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  endDate: string | null;
}
