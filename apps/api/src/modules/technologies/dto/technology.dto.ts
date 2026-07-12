import { ApiProperty } from '@nestjs/swagger';

export class TechnologyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  category: string | null;
}
