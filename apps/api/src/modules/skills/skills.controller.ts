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
import { CreateSkillDto, SkillAdminDto, UpdateSkillDto } from './dto/skill-admin.dto';
import { SkillDto } from './dto/skill.dto';
import { SkillsService } from './skills.service';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiLocaleQuery()
  @ApiOkResponse({ type: SkillDto, isArray: true })
  list(@CurrentLocale() locale: Locale): Promise<SkillDto[]> {
    return this.skillsService.list(locale);
  }

  @Get('admin')
  @AdminAuth()
  @ApiOkResponse({ type: SkillAdminDto, isArray: true })
  listAdmin(): Promise<SkillAdminDto[]> {
    return this.skillsService.listAdmin();
  }

  @Post()
  @AdminAuth()
  @ApiCreatedResponse({ type: SkillAdminDto })
  create(@Body() dto: CreateSkillDto): Promise<SkillAdminDto> {
    return this.skillsService.create(dto);
  }

  @Patch(':id')
  @AdminAuth()
  @ApiOkResponse({ type: SkillAdminDto })
  @ApiNotFoundResponse({ description: 'Навык не найден' })
  update(@Param('id') id: string, @Body() dto: UpdateSkillDto): Promise<SkillAdminDto> {
    return this.skillsService.update(id, dto);
  }

  @Delete(':id')
  @AdminAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Навык не найден' })
  remove(@Param('id') id: string): Promise<void> {
    return this.skillsService.remove(id);
  }
}
