import { cn } from '@/shared/lib';
import { Toast } from '@sutuzhko/ui-kit';

import type { ToastItem } from '../model/use-toaster-queue';

import styles from './toaster-view.module.css';

export interface ToasterViewProps {
  readonly toasts: readonly ToastItem[];
  /** Стек на паузе — полосы отсчёта замирают. */
  readonly paused: boolean;
  readonly onDismiss: (id: number) => void;
  /** Наведение/фокус в стеке — приостановить автозакрытие. */
  readonly onPause: () => void;
  /** Уход курсора/фокуса — возобновить. */
  readonly onResume: () => void;
  readonly regionLabel: string;
  readonly closeLabel: string;
}

/**
 * Презентационный стек тостов — фиксирован в углу экрана. Всё состояние приходит
 * пропами, поэтому компонент управляем и документируется в Storybook.
 *
 * Наведение или фокус внутри стека ставит автозакрытие на паузу (`onPause`),
 * чтобы читатель успел прочитать сообщение и добраться до крестика. Объявление
 * содержимого берёт на себя каждый `Toast` (role status/alert), поэтому контейнер
 * не дублирует `aria-live`.
 */
export function ToasterView({
  toasts,
  paused,
  onDismiss,
  onPause,
  onResume,
  regionLabel,
  closeLabel,
}: ToasterViewProps) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.viewport} role="region" aria-label={regionLabel}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(styles.item, toast.leaving && styles.leaving)}
          onMouseEnter={onPause}
          onMouseLeave={onResume}
          onFocus={onPause}
          onBlur={onResume}
        >
          <Toast
            type={toast.type}
            title={toast.title}
            description={toast.description}
            onClose={() => onDismiss(toast.id)}
            closeLabel={closeLabel}
            duration={toast.duration > 0 ? toast.duration : undefined}
            paused={paused}
          />
        </div>
      ))}
    </div>
  );
}
