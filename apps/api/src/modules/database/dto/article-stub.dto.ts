import { ApiProperty } from '@nestjs/swagger';
import { PublishStatus } from '@prisma/client';

// Краткое представление статьи в дереве библиотеки (без тела).
export class ArticleStubDto {
  // id нужен админ-дереву кабинета для правки/удаления/перемещения; дерево приватно
  // (весь контроллер под AdminAuth), поэтому публично id не утекает.
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ enum: PublishStatus, enumName: 'PublishStatus' })
  status: PublishStatus;

  @ApiProperty()
  order: number;
}
