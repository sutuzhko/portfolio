import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { ContributorAdmin } from '@/entities/contributor';
import type { CreateProject, ProjectAdmin, UpdateProject } from '@/entities/project';
import type { TechnologyAdmin } from '@/entities/technology';
import { cn, countDirtyFields } from '@/shared/lib';
import type { AppLanguage } from '@/shared/config';
import { Markdown, MarkdownEditor, SaveBar, ToggleField } from '@/shared/ui';
import { ProjectTile } from '@/entities/project';
import { Button, Icon, Input, Segmented, Textarea } from '@sutuzhko/ui-kit';

import {
  createProjectSchema,
  emptyForm,
  projectToForm,
  formToCreate,
  formToUpdate,
  TILE_COLORS,
  type ProjectFormValues,
} from '../model/project-form';
import { MAX_GALLERY_ITEMS } from '../model/gallery';
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
import {
  countTechnologyChanges,
  initTechStaged,
  stageCreateTech,
  stagedToTechCatalog,
  visibleTechStaged,
  type StagedTechnology,
} from '../model/technology-staging';

import { BulletsEditor } from './bullets-editor';
import { ContributorManager } from './contributor-manager';
import { FormCard } from './form-card';
import { LinksEditor } from './links-editor';
import { TechnologyManager } from './technology-manager';
import { ProjectGallery, type GalleryRejection } from './project-gallery';
import styles from './admin-projects.module.css';

export interface ProjectFormProps {
  /** Редактируемый проект или `null` — создание. */
  readonly record: ProjectAdmin | null;
  readonly technologies: readonly TechnologyAdmin[];
  readonly contributors: readonly ContributorAdmin[];
  readonly locale: AppLanguage;
  readonly isBusy: boolean;
  /**
   * Сохранение проекта. `staged`/`techStaged` — накопленный CRUD участников и
   * технологий, применяется до самого проекта (чтобы ремапнуть временные id).
   */
  readonly onCreate: (
    body: CreateProject,
    staged: readonly StagedContributor[],
    techStaged: readonly StagedTechnology[],
  ) => void;
  readonly onUpdate: (
    id: string,
    body: UpdateProject,
    staged: readonly StagedContributor[],
    techStaged: readonly StagedTechnology[],
  ) => void;
  /** Загрузить пачку скриншотов в галерею проекта (только у сохранённого проекта). */
  readonly onUploadGallery: (projectId: string, files: readonly File[]) => void;
  /** Часть выбранных файлов не прошла проверку размера/лимита. */
  readonly onRejectGallery: (rejection: GalleryRejection) => void;
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
  onRejectGallery,
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

  // Черновики каталогов участников и технологий: инициализируются каталогом, дальше
  // правятся локально (create/edit/delete) и уходят на бэк только при «Сохранить».
  const [staged, setStaged] = useState<readonly StagedContributor[]>(() =>
    initStaged(contributors),
  );
  const [techStaged, setTechStaged] = useState<readonly StagedTechnology[]>(() =>
    initTechStaged(technologies),
  );
  const stagedChanges = countContributorChanges(staged) + countTechnologyChanges(techStaged);

  const isRunnable = watch('runnable');

  // Плитка перерисовывается на каждый штрих в форме — `watch()` без аргументов
  // подписывает форму целиком, поэтому предпросмотр всегда отражает черновик.
  // Участники и технологии берутся из черновиков — новые/переименованные видны сразу.
  const draft = watch();
  const tile = formToTile(draft, stagedToTechCatalog(techStaged), stagedToCatalog(staged), locale, {
    title: t('admin.projects.newTitle'),
    description: t('admin.projects.previewDescription'),
  });

  const submit = (values: ProjectFormValues): void => {
    if (record) onUpdate(record.id, formToUpdate(values, locale), staged, techStaged);
    else onCreate(formToCreate(values, locale), staged, techStaged);
  };

  const published = draft.status === 'PUBLISHED';
  const endpoint = record ? `PATCH /api/projects/${draft.slug}` : 'POST /api/projects';

  return (
    <form className={styles.form} onSubmit={(event) => void handleSubmit(submit)(event)} noValidate>
      {/* Шапка редактора: имя проекта + эндпоинт (как в макете), справа — закрыть. */}
      <header className={styles.editorBar}>
        <div className={styles.editorBarText}>
          <h2 className={styles.editorTitle}>
            {record ? (
              <>
                {t('admin.projects.editingLabel')}{' '}
                <span className={styles.editorName}>{draft.title}</span>
              </>
            ) : (
              t('admin.projects.newTitle')
            )}
          </h2>
          <div className={styles.editorEndpoint}>{endpoint}</div>
        </div>
        <Button variant="icon" onClick={onCancel} aria-label={t('admin.close')}>
          <Icon name="close" size={16} />
        </Button>
      </header>

      <div className={styles.formGrid}>
        {/* ЛЕВАЯ КОЛОНКА — контент */}
        <div className={styles.formCol}>
          <FormCard title={t('admin.projects.cardMain')}>
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
                label={t('admin.projects.subtitle')}
                labelVariant="plain"
                font="sans"
                placeholder={t('admin.projects.subtitlePlaceholder')}
                {...register('subtitle')}
              />
              <div className={styles.roleYear}>
                <Input
                  label={t('admin.projects.role')}
                  labelVariant="plain"
                  font="sans"
                  {...register('role')}
                />
                <Input
                  label={t('admin.projects.year')}
                  labelVariant="plain"
                  {...register('period')}
                />
              </div>
            </div>
            <Textarea
              label={t('admin.projects.summary')}
              labelVariant="plain"
              font="sans"
              required={locale === 'ru'}
              rows={2}
              error={errors.description?.message}
              {...register('description')}
            />
          </FormCard>

          <FormCard title={t('admin.projects.cardContent')}>
            <div className={styles.field}>
              <label
                htmlFor="project-body"
                className={cn(styles.inlineLabel, locale === 'ru' && styles.required)}
              >
                {t('admin.projects.body')}
              </label>
              <div className={styles.mdFrame}>
                <Controller
                  control={control}
                  name="bodyMarkdown"
                  render={({ field }) => (
                    <MarkdownEditor
                      id="project-body"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      renderPreview={(source) => <Markdown>{source}</Markdown>}
                      sourceLabel={t('admin.projects.bodyEditorLabel')}
                      splitLabel={t('markdownEditor.split')}
                      previewLabel={t('markdownEditor.preview')}
                      error={errors.bodyMarkdown?.message}
                    />
                  )}
                />
              </div>
            </div>

            <Controller
              control={control}
              name="bullets"
              render={({ field }) => (
                <BulletsEditor value={field.value} onChange={field.onChange} />
              )}
            />

            <Controller
              control={control}
              name="links"
              render={({ field }) => <LinksEditor value={field.value} onChange={field.onChange} />}
            />
          </FormCard>

          <FormCard title={t('admin.projects.cardTechTeam')}>
            <Controller
              control={control}
              name="technologyIds"
              render={({ field }) => (
                <TechnologyManager
                  disabled={isBusy}
                  staged={visibleTechStaged(techStaged)}
                  selectedIds={field.value}
                  error={errors.technologyIds?.message}
                  onToggle={(id) =>
                    field.onChange(
                      field.value.includes(id)
                        ? field.value.filter((current) => current !== id)
                        : [...field.value, id],
                    )
                  }
                  onStageCreate={(techDraft) => {
                    const next = stageCreateTech(techStaged, techDraft);
                    setTechStaged(next);
                    // Автовыбор только что созданной (по временному id).
                    const added = next[next.length - 1];
                    if (added) field.onChange([...field.value, added.id]);
                  }}
                />
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
          </FormCard>
        </div>

        {/* ПРАВАЯ КОЛОНКА — липкий сайдбар */}
        <aside className={styles.formSidebar}>
          <FormCard title={t('admin.projects.cardPublish')}>
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

            <div className={styles.toggleStack}>
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
              <div className={styles.runnableFields}>
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
                <Input
                  label={t('admin.projects.runHint')}
                  labelVariant="plain"
                  font="sans"
                  placeholder={t('admin.projects.runHintPlaceholder')}
                  {...register('runHint')}
                />
              </div>
            ) : null}

            <div className={styles.statusLine}>
              <span className={cn(styles.statusDot, published && styles.statusDotOn)} />
              {published
                ? t('admin.projects.statusPublishedLine')
                : t('admin.projects.statusDraftLine')}
            </div>
          </FormCard>

          <FormCard title={t('admin.projects.cardPreview')} meta={t('admin.projects.previewLive')}>
            <Controller
              control={control}
              name="tileColor"
              render={({ field }) => (
                <>
                  <div
                    className={styles.palette}
                    role="radiogroup"
                    aria-label={t('admin.projects.tileColor')}
                  >
                    {/* «Без цвета» — сброс к нейтральной плитке (на сохранении → null). */}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!field.value}
                      aria-label={t('admin.projects.tileColorNone')}
                      title={t('admin.projects.tileColorNone')}
                      className={cn(styles.swatch, styles.swatchNone)}
                      onClick={() => field.onChange('')}
                    />
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
                  <div className={styles.tilePreviewBox}>
                    <ProjectTile project={tile} />
                  </div>
                </>
              )}
            />
            <Input
              label={t('admin.projects.category')}
              labelVariant="plain"
              font="sans"
              placeholder={t('admin.projects.categoryPlaceholder')}
              {...register('category')}
            />
          </FormCard>

          {/* Скриншоты — только у сохранённого проекта: загрузке нужен его id. */}
          {record !== null ? (
            <FormCard
              title={t('admin.projects.gallery')}
              meta={t('admin.projects.galleryCount', {
                current: record.gallery.length,
                max: MAX_GALLERY_ITEMS,
              })}
            >
              <ProjectGallery
                gallery={record.gallery}
                locale={locale}
                disabled={isBusy}
                onUpload={(files) => onUploadGallery(record.id, files)}
                onReject={onRejectGallery}
                onDelete={onDeleteGallery}
                onCopyUrl={onCopyGalleryUrl}
              />
            </FormCard>
          ) : null}
        </aside>
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
