import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../lib';
import { FieldFrame, type FieldLabelVariant } from '../field';

import styles from './input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  readonly label?: ReactNode;
  readonly hint?: ReactNode;
  /** Текст ошибки. Если задан — поле помечается невалидным. */
  readonly error?: ReactNode;
  readonly invalid?: boolean;
  /** Стиль подписи; по умолчанию терминальный `mono`. */
  readonly labelVariant?: FieldLabelVariant;
  /** Шрифт значения: `mono` (терминальный, по умолчанию) или `sans` (контент CMS). */
  readonly font?: 'mono' | 'sans';
  readonly id?: string;
}

/** Текстовое поле ввода с подписью, хинтом и состоянием ошибки. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
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
      <input
        ref={ref}
        id={controlId}
        required={required}
        className={cn(styles.input, font === 'sans' && styles.sans, className)}
        aria-invalid={isInvalid || undefined}
        aria-describedby={(error ?? hint) ? messageId : undefined}
        {...rest}
      />
    </FieldFrame>
  );
});
