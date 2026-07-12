import { useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProjectMediaAdmin } from '@/entities/project';
import type { AppLanguage } from '@/shared/config';
import { Button, Icon } from '@sutuzhko/ui-kit';

import { pickText } from '../model/project-form';
import styles from './admin-projects.module.css';

interface ProjectGalleryProps {
  readonly gallery: readonly ProjectMediaAdmin[];
  readonly locale: AppLanguage;
  readonly disabled: boolean;
  readonly onUpload: (file: File) => void;
  readonly onDelete: (mediaId: string) => void;
  /** Скопировать URL изображения (для вставки в Markdown-описание проекта). */
  readonly onCopyUrl: (url: string) => void;
}

/**
 * Галерея скриншотов проекта: сетка загруженных изображений с удалением + загрузка
 * нового файла. Доступна только у уже сохранённого проекта — загрузке нужен его id.
 * Видео/GIF пока не поддержаны (бэкенд `MediaType` = только изображения).
 */
export function ProjectGallery({
  gallery,
  locale,
  disabled,
  onUpload,
  onDelete,
  onCopyUrl,
}: ProjectGalleryProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
  };

  return (
    <div className={styles.field}>
      <span className={styles.inlineLabel}>{t('admin.projects.gallery')}</span>

      {gallery.length > 0 ? (
        <ul className={styles.galleryGrid}>
          {gallery.map((shot) => (
            <li key={shot.id} className={styles.galleryItem}>
              <img
                className={styles.galleryImage}
                src={shot.url}
                alt={pickText(shot.alt, locale)}
              />
              <div className={styles.galleryActions}>
                <button
                  type="button"
                  className={styles.galleryAction}
                  disabled={disabled}
                  aria-label={t('admin.projects.galleryCopy')}
                  title={t('admin.projects.galleryCopy')}
                  onClick={() => onCopyUrl(shot.url)}
                >
                  <Icon name="link" size={14} />
                </button>
                <button
                  type="button"
                  className={styles.galleryAction}
                  disabled={disabled}
                  aria-label={t('admin.projects.galleryRemove')}
                  title={t('admin.projects.galleryRemove')}
                  onClick={() => onDelete(shot.id)}
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.galleryEmpty}>{t('admin.projects.galleryEmpty')}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.visuallyHidden}
        onChange={onPick}
      />
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {t('admin.projects.galleryUpload')}
      </Button>
    </div>
  );
}
