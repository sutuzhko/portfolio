import { Injectable } from '@nestjs/common';
import type { Settings } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { SettingsDto } from './dto/settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULTS: SettingsDto = {
  siteTitle: 'bogdan.sutuzhko',
  defaultTheme: 'dark',
  accentColor: 'green',
  defaultLang: 'ru',
  availableLanguages: ['ru', 'en'],
  consoleGlow: true,
  showHighlights: true,
  showAbout: true,
  showStack: true,
  showActivity: true,
  showNow: true,
  showFeatured: true,
  showProjects: true,
  showExperience: true,
  showContact: true,
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SettingsDto> {
    const settings = await this.prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) return DEFAULTS;
    return this.toDto(settings);
  }

  // Синглтон: при отсутствии строки создаём её (upsert), иначе обновляем переданные поля.
  async update(dto: UpdateSettingsDto): Promise<SettingsDto> {
    const settings = await this.prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1, ...dto },
      update: dto,
    });
    return this.toDto(settings);
  }

  private toDto(settings: Settings): SettingsDto {
    return {
      siteTitle: settings.siteTitle,
      defaultTheme: settings.defaultTheme,
      accentColor: settings.accentColor,
      defaultLang: settings.defaultLang,
      availableLanguages: settings.availableLanguages,
      consoleGlow: settings.consoleGlow,
      showHighlights: settings.showHighlights,
      showAbout: settings.showAbout,
      showStack: settings.showStack,
      showActivity: settings.showActivity,
      showNow: settings.showNow,
      showFeatured: settings.showFeatured,
      showProjects: settings.showProjects,
      showExperience: settings.showExperience,
      showContact: settings.showContact,
    };
  }
}
