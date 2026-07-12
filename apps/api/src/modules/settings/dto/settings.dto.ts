import { ApiProperty } from '@nestjs/swagger';

export class SettingsDto {
  @ApiProperty({ description: 'Логотип/название сайта в шапке' })
  siteTitle: string;

  @ApiProperty()
  defaultTheme: string;

  @ApiProperty({ description: 'Акцент оформления: green | blue | bright' })
  accentColor: string;

  @ApiProperty()
  defaultLang: string;

  @ApiProperty({ type: [String], description: 'Языки, доступные на сайте (подмножество ru/en)' })
  availableLanguages: string[];

  @ApiProperty({ description: 'Свечение за курсором в консоли' })
  consoleGlow: boolean;

  @ApiProperty({ description: 'Показывать блок показателей на главной' })
  showHighlights: boolean;

  @ApiProperty({ description: 'Показывать блок «Обо мне» на главной' })
  showAbout: boolean;

  @ApiProperty({ description: 'Показывать блок стека на главной' })
  showStack: boolean;

  @ApiProperty({ description: 'Показывать блок активности (GitHub/Codewars) на главной' })
  showActivity: boolean;

  @ApiProperty({ description: 'Показывать баннер доступности (open-to-work) на главной' })
  showNow: boolean;

  @ApiProperty({ description: 'Показывать блок избранных проектов на главной' })
  showFeatured: boolean;

  @ApiProperty({ description: 'Показывать страницу проектов (/projects)' })
  showProjects: boolean;

  @ApiProperty({ description: 'Показывать страницу опыта (/experience)' })
  showExperience: boolean;

  @ApiProperty({ description: 'Показывать страницу контактов (/contact)' })
  showContact: boolean;
}
