import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatus } from '@prisma/client';

import { ProfileHighlightDto } from './profile-highlight.dto';

export class ProfileContactDto {
  @ApiProperty({ description: 'telegram | codewars | linkedin | github | email | ...' })
  icon: string;

  @ApiProperty()
  url: string;
}

export class ProfileDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  roleTitle: string;

  @ApiProperty({ description: 'питч героя (2–3 предложения)' })
  headline: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: String, nullable: true })
  avatarPhotoUrl: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatarColor: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'ссылка на PDF-резюме' })
  cvUrl: string | null;

  @ApiProperty({ type: [String], description: 'слова печатающей строки героя' })
  heroStack: string[];

  @ApiProperty({
    type: () => ProfileHighlightDto,
    isArray: true,
    description: 'показатели над «Обо мне»',
  })
  highlights: ProfileHighlightDto[];

  @ApiProperty({ enum: AvailabilityStatus, enumName: 'AvailabilityStatus' })
  availability: AvailabilityStatus;

  @ApiProperty({ type: String, nullable: true, description: 'null, если владелец скрыл био' })
  bioMarkdown: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'интро экрана проектов' })
  projectsIntro: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'интро экрана опыта' })
  experienceIntro: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'интро экрана контактов' })
  contactIntro: string | null;

  @ApiProperty({ type: () => ProfileContactDto, isArray: true })
  contacts: ProfileContactDto[];
}
