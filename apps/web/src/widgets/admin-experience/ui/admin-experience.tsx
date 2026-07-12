import { useTranslation } from 'react-i18next';

import {
  useCreateExperienceMutation,
  useDeleteExperienceMutation,
  useGetExperienceAdminQuery,
  useUpdateExperienceMutation,
  type CreateExperience,
  type UpdateExperience,
} from '@/entities/experience';
import { useGetTechnologiesAdminQuery } from '@/entities/technology';
import { useToaster } from '@/features/toaster';
import type { AppLanguage } from '@/shared/config';
import { ErrorState } from '@sutuzhko/ui-kit';

import { AdminExperienceSkeleton } from './admin-experience-skeleton';
import { AdminExperienceView } from './admin-experience-view';
import { ExperienceForm } from './experience-form';

export interface AdminExperienceProps {
  /** Локаль редактирования из маршрута. */
  readonly locale: AppLanguage;
  /** Детальный сегмент маршрута: `undefined`=список, `new`=создание, иначе id записи. */
  readonly detail: string | undefined;
  /** Навигация по детальным маршрутам (`null` — назад к списку). */
  readonly onNavigateDetail: (detail: string | null) => void;
}

/**
 * Контейнер вкладки «Опыт работы»: по детальному сегменту маршрута показывает
 * список или форму записи. Создание/редактирование живут на отдельных маршрутах
 * (`/admin/experience/:locale/new` и `/:id`), поэтому смена локали ремонтирует
 * форму с данными нужного языка. Мутации инвалидируют тег `Experience`.
 */
export function AdminExperience({ locale, detail, onNavigateDetail }: AdminExperienceProps) {
  const { t } = useTranslation();
  const { notify } = useToaster();
  const { data: items, isLoading, isError, refetch } = useGetExperienceAdminQuery();
  const { data: technologies } = useGetTechnologiesAdminQuery();
  const [createExperience, createState] = useCreateExperienceMutation();
  const [updateExperience, updateState] = useUpdateExperienceMutation();
  const [deleteExperience, deleteState] = useDeleteExperienceMutation();

  const isBusy = createState.isLoading || updateState.isLoading || deleteState.isLoading;

  const notifyDelete = async (id: string): Promise<void> => {
    try {
      await deleteExperience(id).unwrap();
      notify({ type: 'success', title: t('admin.experience.deleted') });
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    }
  };

  const submitCreate = async (body: CreateExperience): Promise<void> => {
    try {
      await createExperience(body).unwrap();
      notify({ type: 'success', title: t('admin.experience.created') });
      onNavigateDetail(null);
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    }
  };

  const submitUpdate = async (id: string, body: UpdateExperience): Promise<void> => {
    try {
      await updateExperience({ id, body }).unwrap();
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
    return <AdminExperienceSkeleton />;
  }

  // Детальный редактор: `new` — создание, существующий id — правка. Несуществующий
  // id (устаревшая ссылка) откатывается к списку.
  const record =
    detail !== undefined && detail !== 'new'
      ? (items.find((item) => item.id === detail) ?? null)
      : null;
  const showForm = detail === 'new' || (detail !== undefined && record !== null);

  if (showForm) {
    return (
      <ExperienceForm
        key={`${detail ?? 'new'}-${locale}`}
        record={record}
        technologies={technologies ?? []}
        locale={locale}
        isBusy={isBusy}
        onCreate={(body) => void submitCreate(body)}
        onUpdate={(id, body) => void submitUpdate(id, body)}
        onCancel={() => onNavigateDetail(null)}
      />
    );
  }

  return (
    <AdminExperienceView
      items={items}
      locale={locale}
      isBusy={isBusy}
      onAdd={() => onNavigateDetail('new')}
      onEdit={(id) => onNavigateDetail(id)}
      onDelete={(id) => void notifyDelete(id)}
    />
  );
}
