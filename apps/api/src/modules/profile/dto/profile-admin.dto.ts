import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus } from '@prisma/client';

import { LocalizedTextDto } from '../../../common/i18n/localized.dto';
import { AdminContactLinkDto } from './contact-link.dto';
import { ProfileHighlightAdminDto } from './profile-highlight.dto';

// Профиль для CMS: локализованные поля отдаются обеими локалями, контакты — все (включая скрытые).
export class ProfileAdminDto {
  @ApiProperty({ type: () => LocalizedTextDto })
  name: LocalizedTextDto;

  @ApiProperty({ type: () => LocalizedTextDto })
  roleTitle: LocalizedTextDto;

  @ApiProperty({ type: () => LocalizedTextDto, description: 'питч героя (2–3 предложения)' })
  headline: LocalizedTextDto;

  @ApiProperty({ type: () => LocalizedTextDto })
  location: LocalizedTextDto;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: String, nullable: true })
  avatarPhotoUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatarColor: string | null;

  @ApiProperty({
    type: () => LocalizedTextDto,
    nullable: true,
    description: 'PDF-резюме по локали',
  })
  cvUrl: LocalizedTextDto | null;

  @ApiProperty({ type: [String], description: 'слова печатающей строки героя' })
  heroStack: string[];

  @ApiProperty({ type: () => ProfileHighlightAdminDto, isArray: true })
  highlights: ProfileHighlightAdminDto[];

  @ApiProperty({ enum: AvailabilityStatus, enumName: 'AvailabilityStatus' })
  availability: AvailabilityStatus;

  @ApiProperty({ type: () => LocalizedTextDto })
  bioMarkdown: LocalizedTextDto;

  @ApiProperty()
  isBioHidden: boolean;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  bioUpdatedAt: string | null;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  projectsIntro: LocalizedTextDto | null;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  experienceIntro: LocalizedTextDto | null;

  @ApiProperty({ type: () => LocalizedTextDto, nullable: true })
  contactIntro: LocalizedTextDto | null;

  @ApiProperty({ type: () => AdminContactLinkDto, isArray: true })
  contacts: AdminContactLinkDto[];
}
