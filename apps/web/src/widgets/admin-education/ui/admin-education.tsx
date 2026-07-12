import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useCreateEducationMutation,
  useDeleteEducationMutation,
  useGetEducationAdminQuery,
  useUpdateEducationMutation,
} from '@/entities/education';
import { useToaster } from '@/features/toaster';
import type { AppLanguage } from '@/shared/config';
import { ErrorState } from '@sutuzhko/ui-kit';

import { buildRows, rowToCreate, rowToUpdate, type EducationRow } from '../model/education-form';

import { AdminEducationSkeleton } from './admin-education-skeleton';
import { AdminEducationView } from './admin-education-view';

/**
 * Контейнер вкладки «Образование»: строит строки редактора из админ-данных и по
 * «Сохранить» считает разницу (create/update/delete) и шлёт мутации одним пакетом.
 * Мутации инвалидируют тег `Education` — публичный экран образования тоже обновляется.
 */
export interface AdminEducationProps {
  /** Локаль редактирования из маршрута. */
  readonly locale: AppLanguage;
}

export function AdminEducation({ locale }: AdminEducationProps) {
  const { t } = useTranslation();
  const { notify } = useToaster();
  const { data: items, isLoading, isError, refetch } = useGetEducationAdminQuery();
  const [createEducation] = useCreateEducationMutation();
  const [updateEducation] = useUpdateEducationMutation();
  const [deleteEducation] = useDeleteEducationMutation();
  const [isSaving, setIsSaving] = useState(false);

  const save = async (
    rows: readonly EducationRow[],
    deletedIds: readonly string[],
  ): Promise<void> => {
    setIsSaving(true);
    try {
      const ops: Promise<unknown>[] = [];
      for (const id of deletedIds) ops.push(deleteEducation(id).unwrap());
      for (const row of rows) {
        if (row.id !== null) {
          ops.push(updateEducation({ id: row.id, body: rowToUpdate(row, locale) }).unwrap());
        } else if (row.degree.trim() !== '') {
          ops.push(createEducation(rowToCreate(row, locale)).unwrap());
        }
      }
      await Promise.all(ops);
      notify({ type: 'success', title: t('admin.saved') });
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    } finally {
      setIsSaving(false);
    }
  };

  if (isError) {
    return <ErrorState message={t('admin.loadError')} onRetry={() => void refetch()} />;
  }

  if (isLoading || items === undefined) {
    return <AdminEducationSkeleton />;
  }

  // Ключ по локали + набору id: смена локали или create/delete пересобирает
  // редактор из свежих данных (у новых записей появляются реальные id).
  // Ключ по содержимому: после сохранения рефетч меняет данные → форма пересобирается
  // чистой (бар сохранения скрывается), а не только при смене набора id.
  const signature = `${locale}|${JSON.stringify(items)}`;

  return (
    <AdminEducationView
      key={signature}
      rows={buildRows(items, locale)}
      isBusy={isSaving}
      onSave={(rows, deletedIds) => void save(rows, deletedIds)}
    />
  );
}
