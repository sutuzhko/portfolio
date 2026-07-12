import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '../icon';

import styles from './modal.module.css';

export interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  /** Подзаголовок под заголовком (необязательно). */
  readonly description?: string;
  readonly children: ReactNode;
  /** Кнопки внизу (обычно «Отмена» / основное действие). */
  readonly footer?: ReactNode;
  /** Подпись кнопки-крестика и клика по фону (a11y). */
  readonly closeLabel: string;
}

/**
 * Модальное окно поверх страницы: затемнённый фон, центрированная панель,
 * закрытие по Escape, клику по фону и крестику. Блокирует скролл фона и
 * портируется в `body`. Фон — кнопка (a11y: без onClick на неинтерактивном div).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // onClose в ref: эффект зависит только от `open`, не пере-подписывается каждый рендер.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay}>
      <button type="button" className={styles.backdrop} aria-label={closeLabel} onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.panel}
      >
        <header className={styles.head}>
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
