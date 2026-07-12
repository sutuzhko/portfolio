import { ApiProperty } from '@nestjs/swagger';
import { PublishStatus } from '@prisma/client';

// Ссылка на статью (используется для бэклинков).
export class ArticleLinkDto {
  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;
}

// Полная статья базы знаний: тело, путь до неё и бэклинки.
export class ArticleDetailDto {
  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  bodyMarkdown: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ enum: PublishStatus, enumName: 'PublishStatus' })
  status: PublishStatus;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;

  // Хлебные крошки — названия папок от корня к статье.
  @ApiProperty({ type: [String] })
  breadcrumb: string[];

  @ApiProperty({ type: () => [ArticleLinkDto] })
  backlinks: ArticleLinkDto[];
}
