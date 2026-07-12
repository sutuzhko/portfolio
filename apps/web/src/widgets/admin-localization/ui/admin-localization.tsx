import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetEducationAdminQuery, useUpdateEducationMutation } from '@/entities/education';
import { useGetExperienceAdminQuery, useUpdateExperienceMutation } from '@/entities/experience';
import { useGetProfileAdminQuery, useUpdateProfileMutation } from '@/entities/profile';
import { useGetProjectsAdminQuery, useUpdateProjectMutation } from '@/entities/project';
import { useToaster } from '@/features/toaster';
import { ErrorState } from '@sutuzhko/ui-kit';

import {
  changedRows,
  computeStats,
  effective,
  filterRows,
  groupRows,
  type LocEdits,
  type LocFilter,
} from '../model/loc-rows';
import { applySaves, buildLocRows, buildSaves, type LocMutations } from '../model/loc-sources';

import { AdminLocalizationSkeleton } from './admin-localization-skeleton';
import { AdminLocalizationView, type LocEditing } from './admin-localization-view';
import type { LocLocale } from './loc-cell';

/**
 * Контейнер вкладки «Локализация»: тянет admin-данные всех локализуемых сущностей,
 * собирает плоские строки сверки, копит правки обеих локалей в локальном диффе и по
 * «Сохранить» раскидывает их PATCH-ами по эндпоинтам источников (инвалидация тегов
 * обновляет строки серверными значениями). UI-строки приложения тут не участвуют.
 */
export function AdminLocalization() {
  const { t } = useTranslation();
  const { notify } = useToaster();

  const profileQuery = useGetProfileAdminQuery();
  const projectsQuery = useGetProjectsAdminQuery();
  const experienceQuery = useGetExperienceAdminQuery();
  const educationQuery = useGetEducationAdminQuery();

  const [updateProfile] = useUpdateProfileMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [updateExperience] = useUpdateExperienceMutation();
  const [updateEducation] = useUpdateEducationMutation();

  const [edits, setEdits] = useState<LocEdits>({});
  const [editing, setEditing] = useState<LocEditing | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LocFilter>('all');
  const [isSaving, setIsSaving] = useState(false);

  const sectionLabels = useMemo(
    () => ({
      profile: t('admin.locale.sections.profile'),
      projectPrefix: t('admin.locale.sections.project'),
      experiencePrefix: t('admin.locale.sections.experience'),
      education: t('admin.locale.sections.education'),
    }),
    [t],
  );

  const rows = useMemo(
    () =>
      buildLocRows(
        {
          profile: profileQuery.data,
          projects: projectsQuery.data,
          experiences: experienceQuery.data,
          educations: educationQuery.data,
        },
        sectionLabels,
      ),
    [
      profileQuery.data,
      projectsQuery.data,
      experienceQuery.data,
      educationQuery.data,
      sectionLabels,
    ],
  );

  const rowsById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);

  const isError =
    profileQuery.isError ||
    projectsQuery.isError ||
    experienceQuery.isError ||
    educationQuery.isError;
  const isLoading =
    profileQuery.isLoading ||
    projectsQuery.isLoading ||
    experienceQuery.isLoading ||
    educationQuery.isLoading;

  if (isError) {
    return (
      <ErrorState
        message={t('admin.loadError')}
        onRetry={() => {
          void profileQuery.refetch();
          void projectsQuery.refetch();
          void experienceQuery.refetch();
          void educationQuery.refetch();
        }}
      />
    );
  }

  if (isLoading) {
    return <AdminLocalizationSkeleton />;
  }

  const stats = computeStats(rows, edits);
  const groups = groupRows(filterRows(rows, edits, filter, query));
  const changedCount = changedRows(rows, edits).length;

  const commitCell = (rowId: string, locale: LocLocale, value: string): void => {
    const row = rowsById.get(rowId);
    if (row === undefined) return;
    setEdits((prev) => {
      const current = effective(row, prev);
      const next = { ...current, [locale]: value };
      // Правка вернула серверное значение — убираем строку из диффа.
      if (next.ru === row.ru && next.en === row.en) {
        return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== rowId));
      }
      return { ...prev, [rowId]: next };
    });
    setEditing(null);
  };

  const saveAll = async (): Promise<void> => {
    const saves = buildSaves(rows, edits);
    if (saves.length === 0) return;
    const mutations: LocMutations = {
      updateProfile: (body) => updateProfile(body).unwrap(),
      updateProject: (id, body) => updateProject({ id, body }).unwrap(),
      updateExperience: (id, body) => updateExperience({ id, body }).unwrap(),
      updateEducation: (id, body) => updateEducation({ id, body }).unwrap(),
    };
    setIsSaving(true);
    try {
      await applySaves(saves, mutations);
      setEdits({});
      notify({ type: 'success', title: t('admin.saved') });
    } catch {
      notify({ type: 'error', title: t('admin.saveError') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLocalizationView
      stats={stats}
      groups={groups}
      edits={edits}
      editing={editing}
      query={query}
      filter={filter}
      changedCount={changedCount}
      isSaving={isSaving}
      onQueryChange={setQuery}
      onFilterChange={setFilter}
      onEditCell={(rowId, locale) => setEditing({ rowId, locale })}
      onCommitCell={commitCell}
      onCancelCell={() => setEditing(null)}
      onSaveAll={() => void saveAll()}
      onDiscardAll={() => setEdits({})}
    />
  );
}
