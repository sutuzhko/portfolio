import { ApiProperty } from '@nestjs/swagger';

export class MediaAssetDto {
  @ApiProperty()
  url: string;

  @ApiProperty({ type: String, nullable: true })
  alt: string | null;

  @ApiProperty({ type: Number, nullable: true })
  width: number | null;

  @ApiProperty({ type: Number, nullable: true })
  height: number | null;
}
