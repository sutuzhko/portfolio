import { ApiProperty } from '@nestjs/swagger';

import { ArticleStubDto } from './article-stub.dto';

// Узел дерева библиотеки: папка со вложенными статьями и подпапками.
export class FolderNodeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ type: () => [ArticleStubDto] })
  articles: ArticleStubDto[];

  @ApiProperty({ type: () => [FolderNodeDto] })
  children: FolderNodeDto[];
}
