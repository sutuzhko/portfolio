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
import {
  CreateEducationDto,
  EducationAdminDto,
  UpdateEducationDto,
} from './dto/education-admin.dto';
import { EducationDto } from './dto/education.dto';
import { EducationService } from './education.service';

@ApiTags('education')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @ApiLocaleQuery()
  @ApiOkResponse({ type: EducationDto, isArray: true })
  list(@CurrentLocale() locale: Locale): Promise<EducationDto[]> {
    return this.educationService.list(locale);
  }

  @Get('admin')
  @AdminAuth()
  @ApiOkResponse({ type: EducationAdminDto, isArray: true })
  listAdmin(): Promise<EducationAdminDto[]> {
    return this.educationService.listAdmin();
  }

  @Post()
  @AdminAuth()
  @ApiCreatedResponse({ type: EducationAdminDto })
  create(@Body() dto: CreateEducationDto): Promise<EducationAdminDto> {
    return this.educationService.create(dto);
  }

  @Patch(':id')
  @AdminAuth()
  @ApiOkResponse({ type: EducationAdminDto })
  @ApiNotFoundResponse({ description: 'Образование не найдено' })
  update(@Param('id') id: string, @Body() dto: UpdateEducationDto): Promise<EducationAdminDto> {
    return this.educationService.update(id, dto);
  }

  @Delete(':id')
  @AdminAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Образование не найдено' })
  remove(@Param('id') id: string): Promise<void> {
    return this.educationService.remove(id);
  }
}
