import { Injectable, NotFoundException } from '@nestjs/common';
import type { ContactLink, Prisma, Profile } from '@prisma/client';

import { localize, localizeNullable } from '../../common/i18n/localize';
import type { Locale } from '../../common/i18n/locale.types';
import { mergeText, readText, readTextNullable, writeText } from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdminContactLinkDto,
  CreateContactLinkDto,
  UpdateContactLinkDto,
} from './dto/contact-link.dto';
import { ProfileAdminDto } from './dto/profile-admin.dto';
import { ProfileDto } from './dto/profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

type ProfileWithLinks = Profile & { contactLinks: ContactLink[] };

const PROFILE_ID = 1;

// Показатель как он хранится в JSON: значение + подпись LocalizedText.
type StoredHighlight = { value: string; label: unknown };

// Отсеивает мусор из хранимого массива показателей, оставляя валидные записи.
function parseHighlights(value: unknown): StoredHighlight[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item === null || typeof item !== 'object') return [];
    const record = item as { value?: unknown; label?: unknown };
    return typeof record.value === 'string' ? [{ value: record.value, label: record.label }] : [];
  });
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(locale: Locale): Promise<ProfileDto> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: PROFILE_ID },
      include: {
        contactLinks: {
          where: { hidden: false },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile is not configured yet');
    }

    return {
      name: localize(profile.name, locale),
      roleTitle: localize(profile.roleTitle, locale),
      headline: localize(profile.headline, locale),
      location: localize(profile.location, locale),
      email: profile.email,
      avatarPhotoUrl: profile.avatarPhotoUrl,
      avatarColor: profile.avatarColor,
      cvUrl: localizeNullable(profile.cvUrl, locale),
      heroStack: profile.heroStack,
      highlights: parseHighlights(profile.highlights).map((highlight) => ({
        value: highlight.value,
        label: localize(highlight.label, locale),
      })),
      availability: profile.availability,
      bioMarkdown: profile.isBioHidden ? null : localizeNullable(profile.bioMarkdown, locale),
      projectsIntro: localizeNullable(profile.projectsIntro, locale),
      experienceIntro: localizeNullable(profile.experienceIntro, locale),
      contactIntro: localizeNullable(profile.contactIntro, locale),
      contacts: profile.contactLinks.map((link) => ({
        icon: link.icon,
        url: link.url,
      })),
    };
  }

  // --- admin ---

  async getAdmin(): Promise<ProfileAdminDto> {
    const profile = await this.loadAdmin();
    return this.toAdminDto(profile);
  }

  async update(dto: UpdateProfileDto): Promise<ProfileAdminDto> {
    // Текущее значение нужно, чтобы патч одной локали не затирал вторую:
    // локализованные поля мёржим с уже сохранённым JSON (см. mergeText).
    const current = await this.loadAdmin();

    const data: Prisma.ProfileUpdateInput = {};
    if (dto.name !== undefined) data.name = mergeText(current.name, dto.name);
    if (dto.roleTitle !== undefined) data.roleTitle = mergeText(current.roleTitle, dto.roleTitle);
    if (dto.headline !== undefined) data.headline = mergeText(current.headline, dto.headline);
    if (dto.location !== undefined) data.location = mergeText(current.location, dto.location);
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.avatarPhotoUrl !== undefined) data.avatarPhotoUrl = dto.avatarPhotoUrl;
    if (dto.avatarColor !== undefined) data.avatarColor = dto.avatarColor;
    if (dto.cvUrl !== undefined) data.cvUrl = mergeText(current.cvUrl, dto.cvUrl);
    if (dto.heroStack !== undefined) data.heroStack = dto.heroStack;
    if (dto.highlights !== undefined) {
      data.highlights = dto.highlights.map((highlight) => ({
        value: highlight.value,
        label: writeText(highlight.label),
      }));
    }
    if (dto.availability !== undefined) data.availability = dto.availability;
    if (dto.isBioHidden !== undefined) data.isBioHidden = dto.isBioHidden;
    if (dto.bioMarkdown !== undefined) {
      data.bioMarkdown = mergeText(current.bioMarkdown, dto.bioMarkdown);
      data.bioUpdatedAt = new Date();
    }
    if (dto.projectsIntro !== undefined) {
      data.projectsIntro = mergeText(current.projectsIntro, dto.projectsIntro);
    }
    if (dto.experienceIntro !== undefined) {
      data.experienceIntro = mergeText(current.experienceIntro, dto.experienceIntro);
    }
    if (dto.contactIntro !== undefined) {
      data.contactIntro = mergeText(current.contactIntro, dto.contactIntro);
    }

    const profile = await this.prisma.profile.update({
      where: { id: PROFILE_ID },
      data,
      include: { contactLinks: { orderBy: { order: 'asc' } } },
    });
    return this.toAdminDto(profile);
  }

  async addContact(dto: CreateContactLinkDto): Promise<AdminContactLinkDto> {
    const link = await this.prisma.contactLink.create({
      data: {
        icon: dto.icon,
        url: dto.url,
        hidden: dto.hidden ?? false,
        order: dto.order ?? 0,
        profileId: PROFILE_ID,
      },
    });
    return this.toContactDto(link);
  }

  async updateContact(id: string, dto: UpdateContactLinkDto): Promise<AdminContactLinkDto> {
    await this.ensureContact(id);
    const data: Prisma.ContactLinkUpdateInput = {};
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.hidden !== undefined) data.hidden = dto.hidden;
    if (dto.order !== undefined) data.order = dto.order;

    const link = await this.prisma.contactLink.update({ where: { id }, data });
    return this.toContactDto(link);
  }

  async removeContact(id: string): Promise<void> {
    await this.ensureContact(id);
    await this.prisma.contactLink.delete({ where: { id } });
  }

  private async loadAdmin(): Promise<ProfileWithLinks> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: PROFILE_ID },
      include: { contactLinks: { orderBy: { order: 'asc' } } },
    });
    if (!profile) {
      throw new NotFoundException('Профиль ещё не настроен');
    }
    return profile;
  }

  private async ensureContact(id: string): Promise<void> {
    const link = await this.prisma.contactLink.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundException(`Контакт "${id}" не найден`);
    }
  }

  private toContactDto(link: ContactLink): AdminContactLinkDto {
    return {
      id: link.id,
      icon: link.icon,
      url: link.url,
      hidden: link.hidden,
      order: link.order,
    };
  }

  private toAdminDto(profile: ProfileWithLinks): ProfileAdminDto {
    return {
      name: readText(profile.name),
      roleTitle: readText(profile.roleTitle),
      headline: readText(profile.headline),
      location: readText(profile.location),
      email: profile.email,
      avatarPhotoUrl: profile.avatarPhotoUrl,
      avatarColor: profile.avatarColor,
      cvUrl: readTextNullable(profile.cvUrl),
      heroStack: profile.heroStack,
      highlights: parseHighlights(profile.highlights).map((highlight) => ({
        value: highlight.value,
        label: readText(highlight.label),
      })),
      availability: profile.availability,
      bioMarkdown: readText(profile.bioMarkdown),
      isBioHidden: profile.isBioHidden,
      bioUpdatedAt: profile.bioUpdatedAt ? profile.bioUpdatedAt.toISOString() : null,
      projectsIntro: readTextNullable(profile.projectsIntro),
      experienceIntro: readTextNullable(profile.experienceIntro),
      contactIntro: readTextNullable(profile.contactIntro),
      contacts: profile.contactLinks.map((link) => this.toContactDto(link)),
    };
  }
}
