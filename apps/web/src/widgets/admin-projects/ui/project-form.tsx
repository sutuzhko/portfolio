import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { ContributorAdmin } from '@/entities/contributor';
import type { CreateProject, ProjectAdmin, UpdateProject } from '@/entities/project';
import type { TechnologyAdmin } from '@/entities/technology';
import { cn, countDirtyFields } from '@/shared/lib';
import type { AppLanguage } from '@/shared/config';
import { SaveBar, ToggleField } from '@/shared/ui';
import { ProjectTile } from '@/entities/project';
import { Button, Chip, Icon, Input, Segmented, Textarea } from '@sutuzhko/ui-kit';

import {
  createProjectSchema,
  emptyForm,
  projectToForm,
  formToCreate,
  formToUpdate,
  TILE_COLORS,
  type ProjectFormValues,
} from '../model/project-form';
import { formToTile } from '../model/project-preview';
import {
  countContributorChanges,
  initStaged,
  stageCreate,
  stageDelete,
  stageUpdate,
  stagedToCatalog,
  visibleStaged,
  type StagedContributor,
} from '../model/contributor-staging';

import { ContributorManager } from './contributor-manager';
import { ProjectGallery } from './project-gallery';
import styles from './admin-projects.module.css';

export interface ProjectFormProps {
  /** Редактируемый проект или `null` — создание. */
  readonly record: ProjectAdmin | null;
  readonly technologies: readonly TechnologyAdmin[];
  readonly contributors: readonly ContributorAdmin[];
  readonly locale: AppLanguage;
  readonly isBusy: boolean;
  /** Сохранение проекта. `staged` — накопленный CRUD участников, применяется до проекта. */
  readonly onCreate: (body: CreateProject, staged: readonly StagedContributor[]) => void;
  readonly onUpdate: (
    id: string,
    body: UpdateProject,
    staged: readonly StagedContributor[],
  ) => void;
  /** Загрузить скриншот в галерею проекта (только у сохранённого проекта). */
  readonly onUploadGallery: (projectId: string, file: File) => void;
  /** Удалить скриншот из галереи. */
  readonly onDeleteGallery: (mediaId: string) => void;
  /** Скопировать URL скриншота (для вставки в Markdown-описание). */
  readonly onCopyGalleryUrl: (url: string) => void;
  readonly onCancel: () => void;
}

/**
 * Форма проекта (создание/правка) на отдельном детальном маршруте. Локализованные
 * поля правятся в активной локали; период/категория — общие. Технологии и
 * коллабораторы — мультиселект чипами; цвет плитки — палитра с превью-градиентом.
 * Весь CRUD каталога участников копится в `staged` и применяется одним пакетом
 * при сохранении проекта (до самого проекта, чтобы ремапнуть временные id).
 */
export function ProjectForm({
  record,
  technologies,
  contributors,
  locale,
  isBusy,
  onCreate,
  onUpdate,
  onUploadGallery,
  onDeleteGallery,
  onCopyGalleryUrl,
  onCancel,
}: ProjectFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createProjectSchema(t, locale), [t, locale]);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: record ? projectToForm(record, locale) : emptyForm(),
  });

  // Черновик каталога участников: инициализируется каталогом, дальше правится
  // локально (create/edit/delete) и уходит на бэк только при «Сохранить».
  const [staged, setStaged] = useState<readonly StagedContributor[]>(() =>
    initStaged(contributors),
  );
  const stagedChanges = countContributorChanges(staged);

  const isRunnable = watch('runnable');

  // Плитка перерисовывается на каждый штрих в форме — `watch()` без аргументов
  // подписывает форму целиком, поэтому предпросмотр всегда отражает черновик.
  // Участники берутся из черновика — новые/переименованные видны в предпросмотре.
  const draft = watch();
  const tile = formToTile(draft, technologies, stagedToCatalog(staged), locale, {
    title: t('admin.projects.newTitle'),
    description: t('admin.projects.previewDescription'),
  });

  const submit = (values: ProjectFormValues): void => {
    if (record) onUpdate(record.id, formToUpdate(values, locale), staged);
    else onCreate(formToCreate(values, locale), staged);
  };

  return (
    <form className={styles.card} onSubmit={(event) => void handleSubmit(submit)(event)} noValidate>
      <header className={styles.head}>
        <h2 className={styles.title}>
          {record ? t('admin.projects.editTitle') : t('admin.projects.newTitle')}
        </h2>
        <Button variant="icon" onClick={onCancel} aria-label={t('admin.close')}>
          <Icon name="close" size={16} />
        </Button>
      </header>

      <div className={styles.body}>
        <div className={styles.grid2}>
          <Input
            label={t('admin.projects.name')}
            labelVariant="plain"
            font="sans"
            required={locale === 'ru'}
            error={errors.title?.message}
            {...register('title')}
          />
          <Input
            label={t('admin.projects.slug')}
            labelVariant="plain"
            required
            error={errors.slug?.message}
            {...register('slug')}
          />
          <Input
            label={t('admin.projects.role')}
            labelVariant="plain"
            font="sans"
            {...register('role')}
          />
          <Input label={t('admin.projects.year')} labelVariant="plain" {...register('period')} />
        </div>

        <Input
          label={t('admin.projects.subtitle')}
          labelVariant="plain"
          font="sans"
          placeholder={t('admin.projects.subtitlePlaceholder')}
          {...register('subtitle')}
        />
        <Textarea
          label={t('admin.projects.summary')}
          labelVariant="plain"
          font="sans"
          required={locale === 'ru'}
          rows={2}
          error={errors.description?.message}
          {...register('description')}
        />
        <Input
          label={t('admin.projects.category')}
          labelVariant="plain"
          font="sans"
          placeholder={t('admin.projects.categoryPlaceholder')}
          {...register('category')}
        />
        <Textarea
          label={t('admin.projects.body')}
          labelVariant="plain"
          font="sans"
          required={locale === 'ru'}
          rows={4}
          error={errors.bodyMarkdown?.message}
          {...register('bodyMarkdown')}
        />
        <Textarea
          label={t('admin.projects.bullets')}
          labelVariant="plain"
          font="sans"
          hint={t('admin.projects.bulletsHint')}
          rows={3}
          {...register('bullets')}
        />
        <Textarea
          label={t('admin.projects.links')}
          labelVariant="plain"
          hint={t('admin.projects.linksHint')}
          rows={2}
          {...register('links')}
        />

        <Controller
          control={control}
          name="technologyIds"
          render={({ field }) => (
            <fieldset className={styles.field}>
              <legend className={cn(styles.inlineLabel, styles.required)}>
                {t('admin.projects.technologies')}
              </legend>
              <div className={styles.chips}>
                {technologies.map((tech) => {
                  const selected = field.value.includes(tech.id);
                  return (
                    <Chip
                      key={tech.id}
                      selected={selected}
                      onClick={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((id) => id !== tech.id)
                            : [...field.value, tech.id],
                        )
                      }
                    >
                      {tech.name}
                    </Chip>
                  );
                })}
              </div>
              {errors.technologyIds ? (
                <p className={styles.error}>{errors.technologyIds.message}</p>
              ) : null}
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="contributorIds"
          render={({ field }) => (
            <ContributorManager
              locale={locale}
              disabled={isBusy}
              staged={visibleStaged(staged)}
              selectedIds={field.value}
              onToggle={(id) =>
                field.onChange(
                  field.value.includes(id)
                    ? field.value.filter((current) => current !== id)
                    : [...field.value, id],
                )
              }
              onStageCreate={(contributorDraft) => {
                const next = stageCreate(staged, contributorDraft, locale);
                setStaged(next);
                // Автовыбор только что созданного (по временному id).
                const added = next[next.length - 1];
                if (added) field.onChange([...field.value, added.id]);
              }}
              onStageUpdate={(id, contributorDraft) =>
                setStaged((current) => stageUpdate(current, id, contributorDraft, locale))
              }
              onStageDelete={(id) => {
                setStaged((current) => stageDelete(current, id));
                field.onChange(field.value.filter((current) => current !== id));
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="tileColor"
          render={({ field }) => (
            <div className={styles.field}>
              <span className={styles.inlineLabel}>{t('admin.projects.tileColor')}</span>
              <div className={styles.tileRow}>
                <div
                  className={styles.palette}
                  role="radiogroup"
                  aria-label={t('admin.projects.tileColor')}
                >
                  {TILE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={field.value === color}
                      aria-label={color}
                      className={styles.swatch}
                      style={{ background: color }}
                      onClick={() => field.onChange(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Живой предпросмотр: та же плитка, что и в публичном списке. */}
              <div className={styles.tilePreview}>
                <span className={styles.previewCaption}>{t('admin.projects.preview')}</span>
                <ProjectTile project={tile} />
              </div>
            </div>
          )}
        />

        {/* Галерея — только у сохранённого проекта: загрузке нужен его id. */}
        {record !== null ? (
          <ProjectGallery
            gallery={record.gallery}
            locale={locale}
            disabled={isBusy}
            onUpload={(file) => onUploadGallery(record.id, file)}
            onDelete={onDeleteGallery}
            onCopyUrl={onCopyGalleryUrl}
          />
        ) : null}

        <div className={styles.field}>
          <span className={styles.inlineLabel}>{t('admin.projects.status')}</span>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Segmented
                value={field.value}
                onChange={field.onChange}
                aria-label={t('admin.projects.status')}
                options={[
                  { value: 'DRAFT', label: t('admin.projects.statusDraft') },
                  { value: 'PUBLISHED', label: t('admin.projects.statusPublished') },
                ]}
              />
            )}
          />
        </div>

        <div className={styles.toggleGrid}>
          <Controller
            control={control}
            name="hidden"
            render={({ field }) => (
              <ToggleField
                icon="eye-off"
                title={t('admin.projects.hidden')}
                description={t('admin.projects.hiddenHint')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="pinned"
            render={({ field }) => (
              <ToggleField
                icon="star"
                title={t('admin.projects.pinned')}
                description={t('admin.projects.pinnedHint')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="runnable"
            render={({ field }) => (
              <ToggleField
                icon="play"
                title={t('admin.projects.runnable')}
                description={t('admin.projects.runnableHint')}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {isRunnable ? (
          <div className={styles.grid2}>
            <Input
              label={t('admin.projects.embedUrl')}
              labelVariant="plain"
              {...register('embedUrl')}
            />
            <Input
              label={t('admin.projects.runCommand')}
              labelVariant="plain"
              {...register('runCommand')}
            />
          </div>
        ) : null}
      </div>

      <SaveBar
        visible={isDirty || stagedChanges > 0}
        isSaving={isBusy}
        saveType="submit"
        canSave={isDirty || stagedChanges > 0}
        count={countDirtyFields(dirtyFields) + stagedChanges}
        onCancel={onCancel}
      />
    </form>
  );
}
