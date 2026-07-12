import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Prisma } from '@prisma/client';
import { IsArray, IsOptional, IsString } from 'class-validator';

// Двуязычный текст в admin-ответах: показываем обе локали сразу, чтобы форма
// CMS могла редактировать ru и en одновременно.
export class LocalizedTextDto {
  @ApiProperty()
  ru: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  en?: string | null;
}

export class LocalizedListDto {
  @ApiProperty({ type: [String] })
  ru: string[];

  @ApiPropertyOptional({ type: [String], nullable: true })
  en?: string[] | null;
}

// Двуязычный текст во входных данных admin-запросов: ru обязателен, en — опционален.
export class LocalizedTextInput {
  @ApiProperty()
  @IsString()
  ru: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  en?: string;
}

export class LocalizedListInput {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ru: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  en?: string[];
}

// Патч локализованного текста: обе локали опциональны. Админка правит за раз
// только активный язык, поэтому в PATCH может прийти лишь одна локаль — вторую
// достраиваем из уже сохранённого значения (см. mergeText).
export class LocalizedTextPatch {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ru?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  en?: string;
}

// Патч локализованного списка: та же семантика, что у LocalizedTextPatch, но для
// массивов (напр. bullets проекта). Присланная локаль накладывается на сохранённую.
export class LocalizedListPatch {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ru?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  en?: string[];
}

// --- чтение из Prisma Json в admin-DTO (обе локали) ---

export function readText(value: unknown): LocalizedTextDto {
  if (typeof value === 'string') return { ru: value, en: null };
  if (value !== null && typeof value === 'object') {
    const text = value as { ru?: unknown; en?: unknown };
    return {
      ru: typeof text.ru === 'string' ? text.ru : '',
      en: typeof text.en === 'string' ? text.en : null,
    };
  }
  return { ru: '', en: null };
}

export function readTextNullable(value: unknown): LocalizedTextDto | null {
  if (value === null || value === undefined) return null;
  return readText(value);
}

export function readList(value: unknown): LocalizedListDto {
  const asStrings = (input: unknown): string[] =>
    Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string') : [];
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const list = value as { ru?: unknown; en?: unknown };
    return { ru: asStrings(list.ru), en: list.en === undefined ? null : asStrings(list.en) };
  }
  return { ru: asStrings(value), en: null };
}

export function readListNullable(value: unknown): LocalizedListDto | null {
  if (value === null || value === undefined) return null;
  return readList(value);
}

// --- запись из admin-входа в Prisma Json (опускаем пустой en) ---

export function writeText(input: LocalizedTextInput): Prisma.InputJsonValue {
  return input.en === undefined ? { ru: input.ru } : { ru: input.ru, en: input.en };
}

// Накладывает патч одной/обеих локалей поверх уже сохранённого значения.
// Локаль, которой нет в патче (undefined), остаётся прежней — patch только ru
// не затирает en и наоборот. Пустая строка — это осознанная очистка локали,
// поэтому её сохраняем (в отличие от undefined «не трогали»).
export function mergeText(existing: unknown, patch: LocalizedTextPatch): Prisma.InputJsonValue {
  const current = readText(existing);
  const ru = patch.ru ?? current.ru;
  const en = patch.en ?? current.en ?? undefined;
  return en === undefined ? { ru } : { ru, en };
}

// То же, что mergeText, но для локализованного списка: патч одной локали не
// затирает список другой (пустой массив — осознанная очистка локали).
export function mergeList(existing: unknown, patch: LocalizedListPatch): Prisma.InputJsonValue {
  const current = readList(existing);
  const ru = patch.ru ?? current.ru;
  const en = patch.en ?? current.en ?? undefined;
  return en === undefined ? { ru } : { ru, en };
}

export function writeList(input: LocalizedListInput): Prisma.InputJsonValue {
  return input.en === undefined ? { ru: input.ru } : { ru: input.ru, en: input.en };
}
