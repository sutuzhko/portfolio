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
  ContributorAdminDto,
  CreateContributorDto,
  UpdateContributorDto,
} from './dto/contributor-admin.dto';
import { ContributorsService } from './contributors.service';

// Участники проектов — общая сущность, управляется только из приватной зоны (ADMIN).
@ApiTags('contributors')
@AdminAuth()
@Controller('contributors')
export class ContributorsController {
  constructor(private readonly contributorsService: ContributorsService) {}

  @Get('admin')
  @ApiOkResponse({ type: ContributorAdminDto, isArray: true })
  listAdmin(): Promise<ContributorAdminDto[]> {
    return this.contributorsService.listAdmin();
  }

  @Post()
  @ApiCreatedResponse({ type: ContributorAdminDto })
  create(@Body() dto: CreateContributorDto): Promise<ContributorAdminDto> {
    return this.contributorsService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ContributorAdminDto })
  @ApiNotFoundResponse({ description: 'Участник не найден' })
  update(@Param('id') id: string, @Body() dto: UpdateContributorDto): Promise<ContributorAdminDto> {
    return this.contributorsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Участник не найден' })
  remove(@Param('id') id: string): Promise<void> {
    return this.contributorsService.remove(id);
  }
}
