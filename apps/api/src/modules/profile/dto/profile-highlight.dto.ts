import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

import { LocalizedTextDto, LocalizedTextInput } from '../../../common/i18n/localized.dto';

// Ключевой показатель под «Обо мне»: крупное значение + локализованная подпись.
// Публичный ответ — подпись уже в нужной локали.
export class ProfileHighlightDto {
  @ApiProperty({ description: 'значение показателя, напр. "3+" или "C1"' })
  value: string;

  @ApiProperty({ description: 'подпись показателя (локализована)' })
  label: string;
}

// Тот же показатель для CMS: подпись — обеими локалями.
export class ProfileHighlightAdminDto {
  @ApiProperty()
  value: string;

  @ApiProperty({ type: () => LocalizedTextDto })
  label: LocalizedTextDto;
}

// Показатель во входных данных admin-запроса.
export class ProfileHighlightInput {
  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty({ type: () => LocalizedTextInput })
  @ValidateNested()
  @Type(() => LocalizedTextInput)
  label: LocalizedTextInput;
}
