import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';

import { cn } from '../../lib';
import { FieldFrame, type FieldLabelVariant } from '../field';

import styles from './textarea.module.css';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  readonly label?: ReactNode;
  readonly hint?: ReactNode;
  readonly error?: ReactNode;
  readonly invalid?: boolean;
  /** Стиль подписи; по умолчанию терминальный `mono`. */
  readonly labelVariant?: FieldLabelVariant;
  /** Шрифт значения: `mono` (терминальный, по умолчанию) или `sans` (контент CMS). */
  readonly font?: 'mono' | 'sans';
  readonly id?: string;
}

/** Многострочное поле ввода с подписью, хинтом и состоянием ошибки. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, invalid, labelVariant, font, required, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-msg`;
  const isInvalid = invalid ?? Boolean(error);

  return (
    <FieldFrame
      id={controlId}
      label={label}
      hint={hint}
      error={error}
      labelVariant={labelVariant}
      required={required}
      messageId={messageId}
    >
      <textarea
        ref={ref}
        id={controlId}
        required={required}
        className={cn(styles.textarea, font === 'sans' && styles.sans, className)}
        aria-invalid={isInvalid || undefined}
        aria-describedby={(error ?? hint) ? messageId : undefined}
        {...rest}
      />
    </FieldFrame>
  );
});
