import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AdminAuth } from '../auth/admin-auth.decorator';
import { SettingsDto } from './dto/settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOkResponse({ type: SettingsDto })
  get(): Promise<SettingsDto> {
    return this.settingsService.get();
  }

  @Patch()
  @AdminAuth()
  @ApiOkResponse({ type: SettingsDto })
  update(@Body() dto: UpdateSettingsDto): Promise<SettingsDto> {
    return this.settingsService.update(dto);
  }
}
