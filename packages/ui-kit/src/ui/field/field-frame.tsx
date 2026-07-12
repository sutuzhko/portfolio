import type { ReactNode } from 'react';

import { cn } from '../../lib';

import styles from './field-frame.module.css';

/**
 * Стиль подписи: `mono` — терминальная (ПРОПИСНЫЕ, моно; для входа/консольных форм),
 * `plain` — обычная (sans, смешанный регистр; для CMS-форм кабинета по макету).
 */
export type FieldLabelVariant = 'mono' | 'plain';

export interface FieldFrameProps {
  /** id связанного контрола (для label[for]). */
  readonly id: string;
  readonly label?: ReactNode;
  readonly hint?: ReactNode;
  readonly error?: ReactNode;
  /** Стиль подписи; по умолчанию терминальный `mono`. */
  readonly labelVariant?: FieldLabelVariant;
  /** Помечает поле обязательным — красная звёздочка после подписи. */
  readonly required?: boolean;
  /** id текста сообщения (для aria-describedby контрола). */
  readonly messageId?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Обвязка поля формы: подпись сверху, контрол, сообщение (ошибка приоритетнее хинта).
 * Используется Input/Textarea/Select, чтобы не дублировать разметку и a11y.
 */
export function FieldFrame({
  id,
  label,
  hint,
  error,
  labelVariant = 'mono',
  required,
  messageId,
  className,
  children,
}: FieldFrameProps) {
  const message = error ?? hint;

  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn(styles.label, labelVariant === 'plain' && styles.labelPlain)}
        >
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {message ? (
        <p id={messageId} className={cn(styles.message, error ? styles.error : undefined)}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
