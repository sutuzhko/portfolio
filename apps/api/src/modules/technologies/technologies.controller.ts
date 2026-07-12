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

import { AdminAuth } from '../auth/admin-auth.decorator';
import {
  CreateTechnologyDto,
  TechnologyAdminDto,
  UpdateTechnologyDto,
} from './dto/technology-admin.dto';
import { TechnologyDto } from './dto/technology.dto';
import { TechnologiesService } from './technologies.service';

@ApiTags('technologies')
@Controller('technologies')
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Get()
  @ApiOkResponse({ type: TechnologyDto, isArray: true })
  list(): Promise<TechnologyDto[]> {
    return this.technologiesService.list();
  }

  @Get('admin')
  @AdminAuth()
  @ApiOkResponse({ type: TechnologyAdminDto, isArray: true })
  listAdmin(): Promise<TechnologyAdminDto[]> {
    return this.technologiesService.listAdmin();
  }

  @Post()
  @AdminAuth()
  @ApiCreatedResponse({ type: TechnologyAdminDto })
  create(@Body() dto: CreateTechnologyDto): Promise<TechnologyAdminDto> {
    return this.technologiesService.create(dto);
  }

  @Patch(':id')
  @AdminAuth()
  @ApiOkResponse({ type: TechnologyAdminDto })
  @ApiNotFoundResponse({ description: 'Технология не найдена' })
  update(@Param('id') id: string, @Body() dto: UpdateTechnologyDto): Promise<TechnologyAdminDto> {
    return this.technologiesService.update(id, dto);
  }

  @Delete(':id')
  @AdminAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Технология не найдена' })
  remove(@Param('id') id: string): Promise<void> {
    return this.technologiesService.remove(id);
  }
}
