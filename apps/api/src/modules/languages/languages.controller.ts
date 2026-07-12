import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiLocaleQuery, CurrentLocale } from '../../common/i18n/current-locale.decorator';
import type { Locale } from '../../common/i18n/locale.types';
import { AdminAuth } from '../auth/admin-auth.decorator';
import { CreateLanguageDto, LanguageAdminDto, UpdateLanguageDto } from './dto/language-admin.dto';
import { LanguageDto } from './dto/language.dto';
import { LanguagesService } from './languages.service';

@ApiTags('languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiLocaleQuery()
  @ApiOkResponse({ type: LanguageDto, isArray: true })
  list(@CurrentLocale() locale: Locale): Promise<LanguageDto[]> {
    return this.languagesService.list(locale);
  }

  @Get('admin')
  @AdminAuth()
  @ApiOkResponse({ type: LanguageAdminDto, isArray: true })
  listAdmin(): Promise<LanguageAdminDto[]> {
    return this.languagesService.listAdmin();
  }

  @Post()
  @AdminAuth()
  @ApiCreatedResponse({ type: LanguageAdminDto })
  create(@Body() dto: CreateLanguageDto): Promise<LanguageAdminDto> {
    return this.languagesService.create(dto);
  }

  @Patch(':id')
  @AdminAuth()
  @ApiOkResponse({ type: LanguageAdminDto })
  @ApiNotFoundResponse({ description: 'Язык не найден' })
  update(@Param('id') id: string, @Body() dto: UpdateLanguageDto): Promise<LanguageAdminDto> {
    return this.languagesService.update(id, dto);
  }

  @Delete(':id')
  @AdminAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Язык не найден' })
  remove(@Param('id') id: string): Promise<void> {
    return this.languagesService.remove(id);
  }
}
