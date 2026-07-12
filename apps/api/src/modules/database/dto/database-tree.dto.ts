import { ApiProperty } from '@nestjs/swagger';

import { ArticleStubDto } from './article-stub.dto';
import { FolderNodeDto } from './folder-node.dto';

// Дерево базы знаний: корневые папки + статьи без папки.
export class DatabaseTreeDto {
  @ApiProperty({ type: () => [FolderNodeDto] })
  folders: FolderNodeDto[];

  @ApiProperty({ type: () => [ArticleStubDto] })
  rootArticles: ArticleStubDto[];
}
