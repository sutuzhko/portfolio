import type { CSSProperties, ReactNode } from 'react';

import { cn } from '../../lib';
import { Icon, type IconName } from '../icon';

import styles from './toast.module.css';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastTypeConfig {
  readonly icon: IconName;
  readonly tag: string;
  readonly className: string;
  readonly role: 'status' | 'alert';
  readonly live: 'polite' | 'assertive';
}

// Технические теги уровня (INFO/OK/WARN/ERROR) — не локализуемые константы, как уровни лога.
const typeConfig: Record<ToastType, ToastTypeConfig> = {
  info: { icon: 'info', tag: 'INFO', className: styles.info, role: 'status', live: 'polite' },
  success: {
    icon: 'success',
    tag: 'OK',
    className: styles.success,
    role: 'status',
    live: 'polite',
  },
  warning: {
    icon: 'warning',
    tag: 'WARN',
    className: styles.warning,
    role: 'alert',
    live: 'assertive',
  },
  error: { icon: 'error', tag: 'ERROR', className: styles.error, role: 'alert', live: 'assertive' },
};

export interface ToastProps {
  readonly type?: ToastType;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly onClose?: () => void;
  /** Доступная подпись кнопки закрытия (локализуется потребителем). */
  readonly closeLabel?: string;
  /** Статичная полоса остатка 0–100 (напр. прогресс загрузки). */
  readonly progress?: number;
  /**
   * Длительность автозакрытия, мс — рисует анимированную полосу обратного отсчёта.
   * Имеет приоритет над `progress`. Сам таймер закрытия ведёт Toaster (слой выше).
   */
  readonly duration?: number;
  /** Пауза анимации полосы (наведение мышью на стек тостов). */
  readonly paused?: boolean;
  readonly className?: string;
}

/** Уведомление-тост. Логика автозакрытия живёт в Toaster (слой выше). */
export function Toast({
  type = 'info',
  title,
  description,
  onClose,
  closeLabel,
  progress,
  duration,
  paused = false,
  className,
}: ToastProps) {
  const config = typeConfig[type];
  const showCountdown = typeof duration === 'number' && duration > 0;
  const showProgress = !showCountdown && typeof progress === 'number';
  // Длительность и пауза — данные конкретного тоста, поэтому inline (не токен);
  // остальные свойства анимации заданы в CSS-классе `.countdown`.
  const countdownStyle: CSSProperties = {
    animationDuration: `${String(duration)}ms`,
    animationPlayState: paused ? 'paused' : 'running',
  };

  return (
    <div
      role={config.role}
      aria-live={config.live}
      className={cn(styles.toast, config.className, className)}
    >
      <span className={styles.iconChip}>
        <Icon name={config.icon} size={15} />
      </span>
      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.tag}>{config.tag}</span>
          <span className={styles.title}>{title}</span>
        </div>
        {description ? <div className={styles.text}>{description}</div> : null}
      </div>
      {onClose ? (
        <button type="button" aria-label={closeLabel} className={styles.close} onClick={onClose}>
          <Icon name="close" size={13} />
        </button>
      ) : null}
      {showCountdown ? (
        <span
          aria-hidden="true"
          className={cn(styles.progress, styles.countdown)}
          style={countdownStyle}
        />
      ) : showProgress ? (
        <span
          aria-hidden="true"
          className={styles.progress}
          style={{ width: `${String(progress)}%` }}
        />
      ) : null}
    </div>
  );
}
