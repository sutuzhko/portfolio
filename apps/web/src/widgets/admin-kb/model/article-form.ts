import type { TFunction } from 'i18next';
import { z } from 'zod';

import type { ArticleAdmin, CreateArticle, LocalizedText, UpdateArticle } from '@/entities/kb';
import type { AppLanguage } from '@/shared/config';

/** Значения формы статьи. Редактируется активная локаль; `folderId === ''` — корень. */
export interface ArticleFormValues {
  title: string;
  slug: string;
  body: string;
  folderId: string;
}

/** Схема валидации статьи (сообщения локализованы через `t`). Тип выводится — как в других формах кабинета. */
export function createArticleSchema(t: TFunction) {
  return z.object({
    title: z.string().trim().min(1, t('admin.kb.titleRequired')),
    slug: z
      .string()
      .trim()
      .min(1, t('admin.kb.slugRequired'))
      .regex(/^[a-z0-9-]+$/, t('admin.kb.slugRequired')),
    body: z.string().trim().min(1, t('admin.kb.bodyRequired')),
    folderId: z.string(),
  });
}

const pick = (text: LocalizedText, locale: AppLanguage): string =>
  locale === 'en' ? (text.en ?? text.ru) : text.ru;

export function articleToForm(article: ArticleAdmin, locale: AppLanguage): ArticleFormValues {
  return {
    title: pick(article.title, locale),
    slug: article.slug,
    body: pick(article.bodyMarkdown, locale),
    folderId: article.folderId ?? '',
  };
}

export function emptyArticleForm(folderId: string): ArticleFormValues {
  return { title: '', slug: '', body: '', folderId };
}

// Собираем двуязычный объект: активная локаль = value, вторая — из исходного текста
// (правка) либо зеркалится в ru как фолбэк (создание), чтобы ru не оставался пустым.
// Общий для формы статьи и инлайн-переименования узлов дерева.
export function mergeLocalizedText(
  value: string,
  locale: AppLanguage,
  base?: LocalizedText,
): LocalizedText {
  if (locale === 'en') return { ru: base?.ru ?? value, en: value };
  return { ru: value, en: base?.en };
}

export function formToCreate(values: ArticleFormValues, locale: AppLanguage): CreateArticle {
  return {
    slug: values.slug.trim(),
    title: mergeLocalizedText(values.title.trim(), locale),
    bodyMarkdown: mergeLocalizedText(values.body, locale),
    folderId: values.folderId === '' ? undefined : values.folderId,
  };
}

export function formToUpdate(
  values: ArticleFormValues,
  locale: AppLanguage,
  base: ArticleAdmin,
): UpdateArticle {
  return {
    slug: values.slug.trim(),
    title: mergeLocalizedText(values.title.trim(), locale, base.title),
    bodyMarkdown: mergeLocalizedText(values.body, locale, base.bodyMarkdown),
    folderId: values.folderId === '' ? undefined : values.folderId,
  };
}
