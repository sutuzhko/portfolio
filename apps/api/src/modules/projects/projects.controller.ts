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
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { ApiLocaleQuery, CurrentLocale } from '../../common/i18n/current-locale.decorator';
import type { Locale } from '../../common/i18n/locale.types';
import { AdminAuth } from '../auth/admin-auth.decorator';
import { CreateProjectDto, ProjectAdminDto, UpdateProjectDto } from './dto/project-admin.dto';
import { ProjectDetailDto, ProjectListItemDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiLocaleQuery()
  @ApiQuery({ name: 'tech', required: false, description: 'Filter by technology name' })
  @ApiQuery({ name: 'contributor', required: false, description: 'Filter by contributor id' })
  @ApiQuery({ name: 'q', required: false, description: 'Free-text search in title/description' })
  @ApiOkResponse({ type: ProjectListItemDto, isArray: true })
  list(
    @CurrentLocale() locale: Locale,
    @Query('tech') tech?: string,
    @Query('contributor') contributor?: string,
    @Query('q') q?: string,
  ): Promise<ProjectListItemDto[]> {
    return this.projectsService.list({ locale, tech, contributor, q });
  }

  // admin-роуты объявлены до публичного `:slug`, иначе он перехватил бы `/projects/admin`.
  @Get('admin')
  @AdminAuth()
  @ApiOkResponse({ type: ProjectAdminDto, isArray: true })
  listAdmin(): Promise<ProjectAdminDto[]> {
    return this.projectsService.listAdmin();
  }

  @Get('admin/:id')
  @AdminAuth()
  @ApiOkResponse({ type: ProjectAdminDto })
  @ApiNotFoundResponse({ description: 'Проект не найден' })
  getAdmin(@Param('id') id: string): Promise<ProjectAdminDto> {
    return this.projectsService.getAdmin(id);
  }

  @Post()
  @AdminAuth()
  @ApiCreatedResponse({ type: ProjectAdminDto })
  @ApiBadRequestResponse({ description: 'Связь не найдена' })
  @ApiConflictResponse({ description: 'slug уже занят' })
  create(@Body() dto: CreateProjectDto): Promise<ProjectAdminDto> {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @AdminAuth()
  @ApiOkResponse({ type: ProjectAdminDto })
  @ApiNotFoundResponse({ description: 'Проект не найден' })
  @ApiBadRequestResponse({ description: 'Связь не найдена' })
  @ApiConflictResponse({ description: 'slug уже занят' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto): Promise<ProjectAdminDto> {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @AdminAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Проект не найден' })
  remove(@Param('id') id: string): Promise<void> {
    return this.projectsService.remove(id);
  }

  @Get(':slug')
  @ApiLocaleQuery()
  @ApiOkResponse({ type: ProjectDetailDto })
  @ApiNotFoundResponse({ description: 'Проект не найден' })
  getBySlug(
    @Param('slug') slug: string,
    @CurrentLocale() locale: Locale,
  ): Promise<ProjectDetailDto> {
    return this.projectsService.getBySlug(slug, locale);
  }
}
