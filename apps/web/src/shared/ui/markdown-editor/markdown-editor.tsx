import { useState, type ReactNode } from 'react';

import { cn } from '@/shared/lib';

import styles from './markdown-editor.module.css';

export interface MarkdownEditorProps {
  /** Текущий Markdown-исходник. */
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  /** Как рисовать превью исходника: проекты — общий `Markdown`, БЗ — `KbMarkdown`. */
  readonly renderPreview: (source: string) => ReactNode;
  /** Подпись панели исходника (визуальная). */
  readonly sourceLabel: string;
  readonly splitLabel: string;
  readonly previewLabel: string;
  /** Доступное имя textarea, если снаружи нет связанного `<label htmlFor>`. */
  readonly ariaLabel?: string;
  /** id textarea — чтобы связать внешний `<label htmlFor>`. */
  readonly id?: string;
  readonly error?: string;
}

/**
 * Редактор Markdown с переключателем split / preview: слева исходник, справа
 * живое превью. Рендерер превью передаётся пропом, поэтому компонент не знает о
 * домене — БЗ подставляет `KbMarkdown` (вики-ссылки), формы — общий `Markdown`.
 */
export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  renderPreview,
  sourceLabel,
  splitLabel,
  previewLabel,
  ariaLabel,
  id,
  error,
}: MarkdownEditorProps) {
  const [view, setView] = useState<'split' | 'preview'>('split');

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.segment} role="group" aria-label={`${splitLabel} / ${previewLabel}`}>
          <button
            type="button"
            className={cn(styles.segmentBtn, view === 'split' && styles.segmentActive)}
            onClick={() => setView('split')}
          >
            {splitLabel}
          </button>
          <button
            type="button"
            className={cn(styles.segmentBtn, view === 'preview' && styles.segmentActive)}
            onClick={() => setView('preview')}
          >
            {previewLabel}
          </button>
        </div>
      </div>

      <div className={cn(styles.work, view === 'preview' && styles.previewOnly)}>
        {view === 'split' ? (
          <div className={styles.source}>
            <div className={styles.paneLabel} aria-hidden="true">
              {sourceLabel}
            </div>
            <textarea
              id={id}
              className={styles.textarea}
              aria-label={ariaLabel}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onBlur={onBlur}
            />
          </div>
        ) : null}
        <div className={styles.preview}>
          <div className={styles.paneLabel} aria-hidden="true">
            {previewLabel}
          </div>
          <div className={styles.previewBody}>{renderPreview(value)}</div>
        </div>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
