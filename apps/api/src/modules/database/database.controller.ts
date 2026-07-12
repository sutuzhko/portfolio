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
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiLocaleQuery, CurrentLocale } from '../../common/i18n/current-locale.decorator';
import type { Locale } from '../../common/i18n/locale.types';
import { AdminAuth } from '../auth/admin-auth.decorator';
import { DatabaseService } from './database.service';
import { ArticleAdminDto, CreateArticleDto, UpdateArticleDto } from './dto/article-admin.dto';
import { ArticleDetailDto } from './dto/article-detail.dto';
import { DatabaseTreeDto } from './dto/database-tree.dto';
import { CreateFolderDto, FolderAdminDto, UpdateFolderDto } from './dto/folder-admin.dto';

// База знаний — приватная зона: доступ только владельцу (ADMIN) под логином.
@ApiTags('database')
@AdminAuth()
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('tree')
  @ApiLocaleQuery()
  @ApiOkResponse({ type: DatabaseTreeDto })
  getTree(@CurrentLocale() locale: Locale): Promise<DatabaseTreeDto> {
    return this.databaseService.getTree(locale);
  }

  // --- папки ---

  @Get('folders')
  @ApiOkResponse({ type: FolderAdminDto, isArray: true })
  listFolders(): Promise<FolderAdminDto[]> {
    return this.databaseService.listFolders();
  }

  @Post('folders')
  @ApiCreatedResponse({ type: FolderAdminDto })
  @ApiNotFoundResponse({ description: 'Родительская папка не найдена' })
  createFolder(@Body() dto: CreateFolderDto): Promise<FolderAdminDto> {
    return this.databaseService.createFolder(dto);
  }

  @Patch('folders/:id')
  @ApiOkResponse({ type: FolderAdminDto })
  @ApiNotFoundResponse({ description: 'Папка не найдена' })
  @ApiBadRequestResponse({ description: 'Недопустимое перемещение папки' })
  updateFolder(@Param('id') id: string, @Body() dto: UpdateFolderDto): Promise<FolderAdminDto> {
    return this.databaseService.updateFolder(id, dto);
  }

  @Delete('folders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Папка не найдена' })
  @ApiBadRequestResponse({ description: 'Папка не пуста' })
  removeFolder(@Param('id') id: string): Promise<void> {
    return this.databaseService.removeFolder(id);
  }

  // --- статьи (admin-роуты до публичного `:slug`) ---

  @Get('articles/admin/:id')
  @ApiOkResponse({ type: ArticleAdminDto })
  @ApiNotFoundResponse({ description: 'Статья не найдена' })
  getArticleAdmin(@Param('id') id: string): Promise<ArticleAdminDto> {
    return this.databaseService.getArticleAdmin(id);
  }

  @Post('articles')
  @ApiCreatedResponse({ type: ArticleAdminDto })
  @ApiConflictResponse({ description: 'slug уже занят' })
  @ApiNotFoundResponse({ description: 'Папка не найдена' })
  createArticle(@Body() dto: CreateArticleDto): Promise<ArticleAdminDto> {
    return this.databaseService.createArticle(dto);
  }

  @Patch('articles/:id')
  @ApiOkResponse({ type: ArticleAdminDto })
  @ApiNotFoundResponse({ description: 'Статья не найдена' })
  @ApiConflictResponse({ description: 'slug уже занят' })
  updateArticle(@Param('id') id: string, @Body() dto: UpdateArticleDto): Promise<ArticleAdminDto> {
    return this.databaseService.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Статья не найдена' })
  removeArticle(@Param('id') id: string): Promise<void> {
    return this.databaseService.removeArticle(id);
  }

  @Get('articles/:slug')
  @ApiLocaleQuery()
  @ApiOkResponse({ type: ArticleDetailDto })
  @ApiNotFoundResponse({ description: 'Статья не найдена' })
  getArticle(
    @Param('slug') slug: string,
    @CurrentLocale() locale: Locale,
  ): Promise<ArticleDetailDto> {
    return this.databaseService.getArticle(slug, locale);
  }
}
