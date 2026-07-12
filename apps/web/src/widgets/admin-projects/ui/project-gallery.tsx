import { useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProjectMediaAdmin } from '@/entities/project';
import type { AppLanguage } from '@/shared/config';
import { Icon } from '@sutuzhko/ui-kit';

import { MAX_GALLERY_ITEMS, partitionGalleryFiles } from '../model/gallery';
import { pickText } from '../model/project-form';
import styles from './admin-projects.module.css';

/** Что пропущено при выборе файлов (для предупреждающих тостов у контейнера). */
export interface GalleryRejection {
  /** Сколько файлов пропущено из-за превышения лимита размера. */
  readonly tooLarge: number;
  /** Сколько файлов не влезло в оставшиеся слоты (лимит 10). */
  readonly overflow: number;
}

interface ProjectGalleryProps {
  readonly gallery: readonly ProjectMediaAdmin[];
  readonly locale: AppLanguage;
  readonly disabled: boolean;
  /** Загрузить пачку прошедших проверку файлов (до 10 суммарно на проект). */
  readonly onUpload: (files: readonly File[]) => void;
  /** Часть файлов не прошла проверку (размер/лимит) — контейнер покажет тост. */
  readonly onReject: (rejection: GalleryRejection) => void;
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
  onReject,
  onDelete,
  onCopyUrl,
}: ProjectGalleryProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const isFull = gallery.length >= MAX_GALLERY_ITEMS;

  const onPick = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const { accepted, tooLarge, overflow } = partitionGalleryFiles(files, gallery.length);
    if (accepted.length > 0) onUpload(accepted);
    if (tooLarge.length > 0 || overflow.length > 0) {
      onReject({ tooLarge: tooLarge.length, overflow: overflow.length });
    }
  };

  return (
    <div className={styles.galleryGrid}>
      {gallery.map((shot) => (
        <div key={shot.id} className={styles.galleryItem}>
          <img className={styles.galleryImage} src={shot.url} alt={pickText(shot.alt, locale)} />
          <div className={styles.galleryActions}>
            <button
              type="button"
              className={styles.galleryAction}
              disabled={disabled}
              aria-label={t('admin.projects.galleryCopy')}
              title={t('admin.projects.galleryCopy')}
              onClick={() => onCopyUrl(shot.url)}
            >
              <Icon name="link" size={13} />
            </button>
            <button
              type="button"
              className={styles.galleryAction}
              disabled={disabled}
              aria-label={t('admin.projects.galleryRemove')}
              title={t('admin.projects.galleryRemove')}
              onClick={() => onDelete(shot.id)}
            >
              <Icon name="close" size={13} />
            </button>
          </div>
        </div>
      ))}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.visuallyHidden}
        onChange={onPick}
      />
      <button
        type="button"
        className={styles.galleryUploadTile}
        disabled={disabled || isFull}
        onClick={() => inputRef.current?.click()}
      >
        <Icon name="plus" size={16} />
        {t(isFull ? 'admin.projects.galleryFull' : 'admin.projects.galleryUpload')}
      </button>
    </div>
  );
}
