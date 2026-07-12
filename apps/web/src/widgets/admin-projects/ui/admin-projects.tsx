import { useTranslation } from 'react-i18next';

import {
  useCreateContributorMutation,
  useDeleteContributorMutation,
  useGetContributorsAdminQuery,
  useUpdateContributorMutation,
} from '@/entities/contributor';
import {
  useCreateProjectMutation,
  useDeleteGalleryImageMutation,
  useDeleteProjectMutation,
  useGetProjectsAdminQuery,
  useUpdateProjectMutation,
  useUploadGalleryImageMutation,
  type CreateProject,
  type UpdateProject,
} from '@/entities/project';
import {
  useCreateTechnologyMutation,
  useDeleteTechnologyMutation,
  useGetTechnologiesAdminQuery,
  useUpdateTechnologyMutation,
} from '@/entities/technology';
import { useToaster } from '@/features/toaster';
import type { AppLanguage } from '@/shared/config';
import { ErrorState } from '@sutuzhko/ui-kit';

import {
  planContributorStaging,
  stagedToCreateBody,
  stagedToUpdateBody,
  type StagedContributor,
} from '../model/contributor-staging';
import { MAX_GALLERY_ITEMS } from '../model/gallery';
import {
  planTechnologyStaging,
  stagedToTechCreateBody,
  stagedToTechUpdateBody,
  type StagedTechnology,
} from '../model/technology-staging';

import { AdminProjectsSkeleton } from './admin-projects-skeleton';
import { AdminProjectsView } from './admin-projects-view';
import { ProjectForm } from './project-form';
import type { GalleryRejection } from './project-gallery';

export interface AdminProjectsProps {
  /** Локаль редактирования из маршрута. */
  readonly locale: AppLanguage;
  /** Детальный сегмент: `undefined`=список, `new`=создание, иначе id проекта. */
  readonly detail: string | undefined;
  /** Навигация по детальным маршрутам (`null` — назад к списку). */
  readonly onNavigateDetail: (detail: string | null) => void;
}

/**
 * Контейнер вкладки «Проекты»: по детальному сегменту маршрута показывает список
 * или форму. Форма живёт на отдельном маршруте (`/admin/projects/:locale/new`|`/:id`),
 * поэтому смена локали ремонтирует её на данных нужного языка. Мутации
 * инвалидируют тег `Project` — публичные экраны проектов тоже обновляются.
 */
export function AdminProjects({ locale, detail, onNavigateDetail }: AdminProjectsProps) {
  const { t } = useTranslation();
  const { notify } = useToaster();
  const { data: items, isLoading, isError, refetch } = useGetProjectsAdminQuery();
  const { data: technologies } = useGetTechnologiesAdminQuery();
  const { data: contributors } = useGetContributorsAdminQuery();
  const [createContributor, createContributorState] = useCreateContributorMutation();
  const [updateContributor, updateContributorState] = useUpdateContributorMutation();
  const [deleteContributor, deleteContributorState] = useDeleteContributorMutation();
  const [createTechnology, createTechnologyState] = useCreateTechnologyMutation();
  const [updateTechnology, updateTechnologyState] = useUpdateTechnologyMutation();
  const [deleteTechnology, deleteTechnologyState] = useDeleteTechnologyMutation();
  const [createProject, createState] = useCreateProjectMutation();
  const [updateProject, updateState] = useUpdateProjectMutation();
  const [deleteProject, deleteState] = useDeleteProjectMutation();
  const [uploadGallery, uploadState] = useUploadGalleryImageMutation();
  const [deleteGallery, deleteGalleryState] = useDeleteGalleryImageMutation();

  const isBusy =
    createState.isLoading ||
    updateState.isLoading ||
    deleteState.isLoading ||
    uploadState.isLoading ||
    deleteGalleryState.isLoading ||
    createContributorState.isLoading ||
    updateContributorState.isLoading ||
    deleteContributorState.isLoading ||
    createTechnologyState.isLoading ||
    updateTechnologyState.isLoading ||
    deleteTechnologyState.isLoading;

  const notifyDelete = async (id: string): Promise<void> => {
    try {
      await deleteProject(id).unwrap();
      notify({ type: 'success', title: t('admin.projects.deleted') });
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    }
  };

  // Применяет накопленный черновик участников одним пакетом ДО сохранения
  // проекта: создания дают реальные id (карта временный→реальный, чтобы
  // ремапнуть выбор проекта), затем правки и удаления. Возвращает карту id или
  // `null` при ошибке — тогда проект не сохраняем.
  const applyContributorStaging = async (
    staged: readonly StagedContributor[],
  ): Promise<Record<string, string> | null> => {
    const plan = planContributorStaging(staged);
    const idMap: Record<string, string> = {};
    try {
      for (const entry of plan.creates) {
        const created = await createContributor(stagedToCreateBody(entry)).unwrap();
        idMap[entry.id] = created.id;
      }
      for (const entry of plan.updates) {
        await updateContributor({ id: entry.id, body: stagedToUpdateBody(entry) }).unwrap();
      }
      for (const entry of plan.deletes) {
        await deleteContributor(entry.id).unwrap();
      }
      return idMap;
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
      return null;
    }
  };

  // Тот же паттерн, что и для участников, но для каталога технологий: применяем
  // накопленный CRUD до сохранения проекта и возвращаем карту временный→реальный id.
  const applyTechnologyStaging = async (
    techStaged: readonly StagedTechnology[],
  ): Promise<Record<string, string> | null> => {
    const plan = planTechnologyStaging(techStaged);
    const idMap: Record<string, string> = {};
    try {
      for (const entry of plan.creates) {
        const created = await createTechnology(stagedToTechCreateBody(entry)).unwrap();
        idMap[entry.id] = created.id;
      }
      for (const entry of plan.updates) {
        await updateTechnology({ id: entry.id, body: stagedToTechUpdateBody(entry) }).unwrap();
      }
      for (const entry of plan.deletes) {
        await deleteTechnology(entry.id).unwrap();
      }
      return idMap;
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
      return null;
    }
  };

  // Пачка скриншотов: грузим по одному (эндпоинт принимает один файл), считаем
  // успехи/неудачи и показываем один итоговый тост. Бэк режет по лимиту 10 → часть
  // может не пройти.
  const addScreenshots = async (projectId: string, files: readonly File[]): Promise<void> => {
    let ok = 0;
    for (const file of files) {
      try {
        await uploadGallery({ projectId, file }).unwrap();
        ok += 1;
      } catch {
        // продолжаем — считаем неуспехи по разнице
      }
    }
    if (ok > 0) {
      notify({ type: 'success', title: t('admin.projects.galleryUploadedCount', { n: ok }) });
    }
    if (ok < files.length) {
      notify({
        type: 'error',
        title: t('admin.projects.galleryUploadFailed', { n: files.length - ok }),
      });
    }
  };

  // Файлы, отсеянные ещё до загрузки (размер / лимит) — предупреждаем.
  const rejectScreenshots = ({ tooLarge, overflow }: GalleryRejection): void => {
    if (tooLarge > 0) {
      notify({ type: 'warning', title: t('admin.projects.galleryTooLarge', { n: tooLarge }) });
    }
    if (overflow > 0) {
      notify({
        type: 'warning',
        title: t('admin.projects.galleryOverflow', { n: overflow, max: MAX_GALLERY_ITEMS }),
      });
    }
  };

  const removeScreenshot = async (mediaId: string): Promise<void> => {
    try {
      await deleteGallery(mediaId).unwrap();
      notify({ type: 'success', title: t('admin.projects.galleryDeleted') });
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    }
  };

  // Абсолютный URL скриншота в буфер — чтобы вставить в Markdown: `![](url)`.
  const copyScreenshotUrl = async (url: string): Promise<void> => {
    const absolute = new URL(url, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(absolute);
      notify({ type: 'success', title: t('admin.projects.galleryCopied') });
    } catch {
      notify({ type: 'error', title: t('admin.projects.galleryCopyFailed') });
    }
  };

  // Заменяет временные id на реальные (после применения черновика каталога).
  const remapIds = (ids: readonly string[] | undefined, idMap: Record<string, string>): string[] =>
    (ids ?? []).map((id) => idMap[id] ?? id);

  const submitCreate = async (
    body: CreateProject,
    staged: readonly StagedContributor[],
    techStaged: readonly StagedTechnology[],
  ): Promise<void> => {
    const contributorMap = await applyContributorStaging(staged);
    if (contributorMap === null) return;
    const technologyMap = await applyTechnologyStaging(techStaged);
    if (technologyMap === null) return;
    try {
      await createProject({
        ...body,
        contributorIds: remapIds(body.contributorIds, contributorMap),
        technologyIds: remapIds(body.technologyIds, technologyMap),
      }).unwrap();
      notify({ type: 'success', title: t('admin.projects.created') });
      onNavigateDetail(null);
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    }
  };

  const submitUpdate = async (
    id: string,
    body: UpdateProject,
    staged: readonly StagedContributor[],
    techStaged: readonly StagedTechnology[],
  ): Promise<void> => {
    const contributorMap = await applyContributorStaging(staged);
    if (contributorMap === null) return;
    const technologyMap = await applyTechnologyStaging(techStaged);
    if (technologyMap === null) return;
    try {
      await updateProject({
        id,
        body: {
          ...body,
          contributorIds: remapIds(body.contributorIds, contributorMap),
          technologyIds: remapIds(body.technologyIds, technologyMap),
        },
      }).unwrap();
      notify({ type: 'success', title: t('admin.saved') });
      onNavigateDetail(null);
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    }
  };

  if (isError) {
    return <ErrorState message={t('admin.loadError')} onRetry={() => void refetch()} />;
  }

  if (isLoading || items === undefined) {
    return <AdminProjectsSkeleton />;
  }

  const record =
    detail !== undefined && detail !== 'new'
      ? (items.find((item) => item.id === detail) ?? null)
      : null;
  const showForm = detail === 'new' || (detail !== undefined && record !== null);

  if (showForm) {
    return (
      <ProjectForm
        key={`${detail ?? 'new'}-${locale}`}
        record={record}
        technologies={technologies ?? []}
        contributors={contributors ?? []}
        locale={locale}
        isBusy={isBusy}
        onCreate={(body, staged, techStaged) => void submitCreate(body, staged, techStaged)}
        onUpdate={(id, body, staged, techStaged) => void submitUpdate(id, body, staged, techStaged)}
        onUploadGallery={(projectId, files) => void addScreenshots(projectId, files)}
        onRejectGallery={rejectScreenshots}
        onDeleteGallery={(mediaId) => void removeScreenshot(mediaId)}
        onCopyGalleryUrl={(url) => void copyScreenshotUrl(url)}
        onCancel={() => onNavigateDetail(null)}
      />
    );
  }

  return (
    <AdminProjectsView
      items={items}
      technologies={technologies ?? []}
      contributors={contributors ?? []}
      locale={locale}
      isBusy={isBusy}
      onAdd={() => onNavigateDetail('new')}
      onEdit={(id) => onNavigateDetail(id)}
      onDelete={(id) => void notifyDelete(id)}
    />
  );
}
