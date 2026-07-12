import { ApiProperty } from '@nestjs/swagger';

import { ContributorDto } from '../../../common/dto/contributor.dto';
import { MediaAssetDto } from '../../../common/dto/media-asset.dto';

export class ProjectLinkDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  href: string;
}

export class ProjectListItemDto {
  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: String, nullable: true })
  subtitle: string | null;

  @ApiProperty({ type: String, nullable: true })
  category: string | null;

  @ApiProperty({ type: String, nullable: true })
  period: string | null;

  @ApiProperty({ type: String, nullable: true })
  tileColor: string | null;

  @ApiProperty()
  pinned: boolean;

  @ApiProperty()
  runnable: boolean;

  @ApiProperty({ type: String, nullable: true })
  runCommand: string | null;

  @ApiProperty({ type: String, nullable: true })
  embedUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  primaryLanguage: string | null;

  @ApiProperty({ type: String, isArray: true })
  technologies: string[];

  @ApiProperty({ type: () => ContributorDto, isArray: true })
  contributors: ContributorDto[];
}

export class ProjectDetailDto extends ProjectListItemDto {
  @ApiProperty()
  bodyMarkdown: string;

  @ApiProperty({ type: String, isArray: true })
  bullets: string[];

  @ApiProperty({ type: String, nullable: true })
  role: string | null;

  @ApiProperty({ type: String, nullable: true })
  runHint: string | null;

  @ApiProperty({ type: () => ProjectLinkDto, isArray: true })
  links: ProjectLinkDto[];

  @ApiProperty({ type: () => MediaAssetDto, isArray: true })
  gallery: MediaAssetDto[];
}
