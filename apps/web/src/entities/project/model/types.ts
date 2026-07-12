import type { components } from '@portfolio/contract';

/** Элемент списка проектов (локализованный ответ `GET /api/projects`). */
export type ProjectListItem = components['schemas']['ProjectListItemDto'];

/** Контрибьютор проекта. */
export type ProjectContributor = components['schemas']['ContributorDto'];

/** Проект целиком (локализованный ответ `GET /api/projects/{slug}`). */
export type ProjectDetail = components['schemas']['ProjectDetailDto'];

/** Внешняя ссылка проекта (репозиторий, сайт, демо). */
export type ProjectLink = components['schemas']['ProjectLinkDto'];

/** Изображение галереи проекта (публичный вид). */
export type ProjectMedia = components['schemas']['MediaAssetDto'];

/** Изображение галереи в админ-виде (с id — для удаления/сортировки). */
export type ProjectMediaAdmin = components['schemas']['MediaAssetAdminDto'];

/** Тело загрузки скриншота в галерею проекта (multipart на бэке). */
export interface UploadGalleryImage {
  readonly projectId: string;
  readonly file: File;
  readonly altRu?: string;
  readonly altEn?: string;
}

/** Проект в админ-виде: обе локали + связи по id + флаги. */
export type ProjectAdmin = components['schemas']['ProjectAdminDto'];

/** Тело создания проекта. */
export type CreateProject = components['schemas']['CreateProjectDto'];

/** Тело обновления проекта (частичное, мёрж локали на бэке). */
export type UpdateProject = components['schemas']['UpdateProjectDto'];

/** Ссылка проекта во вводе (label локализован, href общий). */
export type ProjectLinkInput = components['schemas']['ProjectLinkInput'];
