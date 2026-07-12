import type { components } from '@portfolio/contract';

/** Дерево базы знаний: папки с вложенностью + статьи в корне. */
export type DatabaseTree = components['schemas']['DatabaseTreeDto'];

/** Узел-папка дерева (рекурсивный: содержит статьи и вложенные папки). */
export type FolderNode = components['schemas']['FolderNodeDto'];

/** Заглушка статьи в дереве (без тела). */
export type ArticleStub = components['schemas']['ArticleStubDto'];

/** Полная статья: тело, теги, хлебные крошки, бэклинки. */
export type ArticleDetail = components['schemas']['ArticleDetailDto'];

/** Ссылка на статью (бэклинк): slug + заголовок. */
export type ArticleLink = components['schemas']['ArticleLinkDto'];

/** Статус публикации статьи. */
export type PublishStatus = components['schemas']['PublishStatus'];

/** Двуязычный текст (`{ ru, en? }`) — как хранятся имя папки, заголовок и тело статьи. */
export type LocalizedText = components['schemas']['LocalizedTextDto'];

/** Папка в админ-представлении: имя обеими локалями, родитель, порядок. */
export type FolderAdmin = components['schemas']['FolderAdminDto'];

/** Статья в админ-представлении: обе локали title/body, slug, теги, статус, папка. */
export type ArticleAdmin = components['schemas']['ArticleAdminDto'];

export type CreateFolder = components['schemas']['CreateFolderDto'];
export type UpdateFolder = components['schemas']['UpdateFolderDto'];
export type CreateArticle = components['schemas']['CreateArticleDto'];
export type UpdateArticle = components['schemas']['UpdateArticleDto'];
