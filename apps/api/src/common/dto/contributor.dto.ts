import { ApiProperty } from '@nestjs/swagger';

export class ContributorDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: String, nullable: true })
  image: string | null;

  @ApiProperty({ type: String, nullable: true })
  color: string | null;
}
