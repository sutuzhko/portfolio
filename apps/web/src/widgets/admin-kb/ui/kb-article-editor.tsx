import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { KbMarkdown } from '@/entities/kb';
import { cn, countDirtyFields } from '@/shared/lib';
import { SaveBar } from '@/shared/ui';
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
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<ArticleFormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const [view, setView] = useState<'split' | 'preview'>('split');
  const body = watch('body');

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
          <div className={styles.segment} role="group" aria-label="split / preview">
            <button
              type="button"
              className={cn(styles.segmentBtn, view === 'split' && styles.segmentActive)}
              onClick={() => setView('split')}
            >
              {t('admin.kb.split')}
            </button>
            <button
              type="button"
              className={cn(styles.segmentBtn, view === 'preview' && styles.segmentActive)}
              onClick={() => setView('preview')}
            >
              {t('admin.kb.preview')}
            </button>
          </div>
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

      <div className={cn(styles.editorWork, view === 'preview' && styles.editorPreviewOnly)}>
        {view === 'split' ? (
          <div className={styles.editorSource}>
            <div className={styles.editorPaneLabel}>{t('admin.kb.bodyLabel')}</div>
            <textarea
              className={styles.editorTextarea}
              aria-label={t('admin.kb.bodyLabel')}
              {...register('body')}
            />
          </div>
        ) : null}
        <div className={styles.editorPreview}>
          <div className={styles.editorPaneLabel}>{t('admin.kb.preview')}</div>
          <div className={styles.editorPreviewBody}>
            <KbMarkdown source={body} />
          </div>
        </div>
      </div>
      {errors.body ? <div className={styles.editorBodyError}>{errors.body.message}</div> : null}

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
