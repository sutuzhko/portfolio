import { cn } from '../../lib';

import styles from './error-state.module.css';

export interface ErrorStateProps {
  /** Сообщение об ошибке (локализованное). */
  readonly message: string;
  /** Подпись кнопки повтора. Кнопка показывается только вместе с `onRetry`. */
  readonly retryLabel?: string;
  readonly onRetry?: () => void;
  readonly className?: string;
}

/**
 * Состояние ошибки загрузки в стиле терминала: карточка с красной меткой
 * `// error`, сообщением и моно-кнопкой повтора. Единый вид ошибок на всех
 * экранах, привязанных к API.
 */
export function ErrorState({ message, retryLabel, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn(styles.root, className)} role="alert">
      <span className={styles.marker}>{'// error'}</span>
      <p className={styles.message}>{message}</p>
      {onRetry ? (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
