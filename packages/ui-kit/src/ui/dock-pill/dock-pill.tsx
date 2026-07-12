import { WindowChrome } from '../window-chrome';

import styles from './dock-pill.module.css';

export interface DockPillProps {
  /** Подпись окна в трее (моно-заголовок, например `bash — ~` или `2048 — game`). */
  readonly label: string;
  readonly onClose: () => void;
  /** Развернуть обратно в обычное окно (жёлтый свет и клик по подписи). */
  readonly onRestore: () => void;
  /** Развернуть сразу на всю ширину (зелёный свет). По умолчанию — как обычное. */
  readonly onMaximize?: () => void;
  readonly closeLabel?: string;
  readonly restoreLabel?: string;
  readonly maximizeLabel?: string;
}

/**
 * Свёрнутое окно в трее: компактная пилюля со «светофором» и моно-подписью.
 * Красный — закрыть, жёлтый — развернуть, зелёный — развернуть на всю ширину.
 * Клик по подписи тоже разворачивает. Презентационна и переиспользуема — трей
 * консоли и раннера собран из неё.
 */
export function DockPill({
  label,
  onClose,
  onRestore,
  onMaximize,
  closeLabel,
  restoreLabel,
  maximizeLabel,
}: DockPillProps) {
  return (
    <div className={styles.pill}>
      <WindowChrome
        onClose={onClose}
        onMinimize={onRestore}
        onMaximize={onMaximize ?? onRestore}
        closeLabel={closeLabel}
        minimizeLabel={restoreLabel}
        maximizeLabel={maximizeLabel ?? restoreLabel}
      />
      <button type="button" className={styles.label} onClick={onRestore}>
        {label}
      </button>
    </div>
  );
}
