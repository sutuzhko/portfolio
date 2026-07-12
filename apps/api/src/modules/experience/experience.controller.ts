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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiLocaleQuery, CurrentLocale } from '../../common/i18n/current-locale.decorator';
import type { Locale } from '../../common/i18n/locale.types';
import { AdminAuth } from '../auth/admin-auth.decorator';
import {
  CreateExperienceDto,
  ExperienceAdminDto,
  UpdateExperienceDto,
} from './dto/experience-admin.dto';
import { ExperienceDto } from './dto/experience.dto';
import { ExperienceService } from './experience.service';

@ApiTags('experience')
@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  @ApiLocaleQuery()
  @ApiOkResponse({ type: ExperienceDto, isArray: true })
  list(@CurrentLocale() locale: Locale): Promise<ExperienceDto[]> {
    return this.experienceService.list(locale);
  }

  @Get('admin')
  @AdminAuth()
  @ApiOkResponse({ type: ExperienceAdminDto, isArray: true })
  listAdmin(): Promise<ExperienceAdminDto[]> {
    return this.experienceService.listAdmin();
  }

  @Post()
  @AdminAuth()
  @ApiCreatedResponse({ type: ExperienceAdminDto })
  @ApiBadRequestResponse({ description: 'Связь не найдена' })
  create(@Body() dto: CreateExperienceDto): Promise<ExperienceAdminDto> {
    return this.experienceService.create(dto);
  }

  @Patch(':id')
  @AdminAuth()
  @ApiOkResponse({ type: ExperienceAdminDto })
  @ApiNotFoundResponse({ description: 'Опыт не найден' })
  @ApiBadRequestResponse({ description: 'Связь не найдена' })
  update(@Param('id') id: string, @Body() dto: UpdateExperienceDto): Promise<ExperienceAdminDto> {
    return this.experienceService.update(id, dto);
  }

  @Delete(':id')
  @AdminAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Опыт не найден' })
  remove(@Param('id') id: string): Promise<void> {
    return this.experienceService.remove(id);
  }
}
