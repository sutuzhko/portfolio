import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { KbMarkdown } from '@/entities/kb';
import { cn, countDirtyFields } from '@/shared/lib';
import { MarkdownEditor, SaveBar } from '@/shared/ui';
import { Button, Icon } from '@sutuzhko/ui-kit';

import { type ArticleFormValues, createArticleSchema } from '../model/article-form';
import type { FolderOption } from '../model/kb-nodes';

import styles from './admin-kb.module.css';

export interface KbArticleEditorProps {
  readonly mode: 'new' | 'edit';
  readonly initial: ArticleFormValues;
  readonly folders: readonly FolderOption[];
  readonly isSaving: boolean;
  /** Ошибка сервера по slug (например, 409 — уже занят). */
  readonly serverSlugError?: string;
  readonly onSave: (values: ArticleFormValues) => void;
  readonly onCancel: () => void;
}

/** Правая панель БЗ в режиме редактора: метаполя + Markdown-исходник с живым превью. */
export function KbArticleEditor({
  mode,
  initial,
  folders,
  isSaving,
  serverSlugError,
  onSave,
  onCancel,
}: KbArticleEditorProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createArticleSchema(t), [t]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<ArticleFormValues>({ resolver: zodResolver(schema), defaultValues: initial });

  return (
    <form
      className={styles.editor}
      onSubmit={(event) => void handleSubmit(onSave)(event)}
      noValidate
    >
      <header className={styles.editorHead}>
        <p className={styles.editorTitle}>
          {t(mode === 'new' ? 'admin.kb.editorNew' : 'admin.kb.editorEdit')}
        </p>
        <div className={styles.editorHeadActions}>
          <Button variant="icon" onClick={onCancel} aria-label={t('admin.close')}>
            <Icon name="close" size={16} />
          </Button>
        </div>
      </header>

      <div className={styles.editorMeta}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t('admin.kb.titleLabel')} <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} {...register('title')} />
          {errors.title ? <span className={styles.fieldError}>{errors.title.message}</span> : null}
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t('admin.kb.slugLabel')} <span className={styles.req}>*</span>
          </span>
          <input className={cn(styles.input, styles.mono)} {...register('slug')} />
          {errors.slug ? (
            <span className={styles.fieldError}>{errors.slug.message}</span>
          ) : serverSlugError !== undefined ? (
            <span className={styles.fieldError}>{serverSlugError}</span>
          ) : null}
        </label>
        <label className={cn(styles.field, styles.fieldFull)}>
          <span className={styles.fieldLabel}>{t('admin.kb.folderLabel')}</span>
          <select className={styles.input} {...register('folderId')}>
            <option value="">{t('admin.kb.parentRoot')}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {' '.repeat(folder.depth * 2)}
                {folder.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Controller
        control={control}
        name="body"
        render={({ field }) => (
          <MarkdownEditor
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            renderPreview={(source) => <KbMarkdown source={source} />}
            sourceLabel={t('admin.kb.bodyLabel')}
            ariaLabel={t('admin.kb.bodyLabel')}
            splitLabel={t('markdownEditor.split')}
            previewLabel={t('markdownEditor.preview')}
            error={errors.body?.message}
          />
        )}
      />

      <SaveBar
        visible={isDirty}
        isSaving={isSaving}
        saveType="submit"
        canSave={isDirty}
        count={countDirtyFields(dirtyFields)}
        onCancel={onCancel}
      />
    </form>
  );
}
