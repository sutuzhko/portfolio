import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';

import { cn } from '../../lib';
import { FieldFrame } from '../field';
import { Icon } from '../icon';

import styles from './select.module.css';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  readonly label?: ReactNode;
  readonly hint?: ReactNode;
  readonly error?: ReactNode;
  readonly invalid?: boolean;
  readonly id?: string;
}

/** Стилизованный нативный select с подписью и состоянием ошибки. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, invalid, className, id, children, ...rest },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const messageId = `${controlId}-msg`;
  const isInvalid = invalid ?? Boolean(error);

  return (
    <FieldFrame id={controlId} label={label} hint={hint} error={error} messageId={messageId}>
      <div className={styles.wrapper}>
        <select
          ref={ref}
          id={controlId}
          className={cn(styles.select, className)}
          aria-invalid={isInvalid || undefined}
          aria-describedby={(error ?? hint) ? messageId : undefined}
          {...rest}
        >
          {children}
        </select>
        <Icon name="chevron-down" size={16} className={styles.chevron} />
      </div>
    </FieldFrame>
  );
});
