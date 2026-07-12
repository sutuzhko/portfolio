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
  AdminContactLinkDto,
  CreateContactLinkDto,
  UpdateContactLinkDto,
} from './dto/contact-link.dto';
import { ProfileAdminDto } from './dto/profile-admin.dto';
import { ProfileDto } from './dto/profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiLocaleQuery()
  @ApiOkResponse({ type: ProfileDto })
  get(@CurrentLocale() locale: Locale): Promise<ProfileDto> {
    return this.profileService.get(locale);
  }

  @Get('admin')
  @AdminAuth()
  @ApiOkResponse({ type: ProfileAdminDto })
  @ApiNotFoundResponse({ description: 'Профиль не настроен' })
  getAdmin(): Promise<ProfileAdminDto> {
    return this.profileService.getAdmin();
  }

  @Patch()
  @AdminAuth()
  @ApiOkResponse({ type: ProfileAdminDto })
  update(@Body() dto: UpdateProfileDto): Promise<ProfileAdminDto> {
    return this.profileService.update(dto);
  }

  @Post('contacts')
  @AdminAuth()
  @ApiCreatedResponse({ type: AdminContactLinkDto })
  addContact(@Body() dto: CreateContactLinkDto): Promise<AdminContactLinkDto> {
    return this.profileService.addContact(dto);
  }

  @Patch('contacts/:id')
  @AdminAuth()
  @ApiOkResponse({ type: AdminContactLinkDto })
  @ApiNotFoundResponse({ description: 'Контакт не найден' })
  updateContact(
    @Param('id') id: string,
    @Body() dto: UpdateContactLinkDto,
  ): Promise<AdminContactLinkDto> {
    return this.profileService.updateContact(id, dto);
  }

  @Delete('contacts/:id')
  @AdminAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Контакт не найден' })
  removeContact(@Param('id') id: string): Promise<void> {
    return this.profileService.removeContact(id);
  }
}
