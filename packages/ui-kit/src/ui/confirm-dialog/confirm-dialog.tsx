import type { ReactNode } from 'react';

import { Icon } from '../icon';
import { Modal } from '../modal';

import styles from './confirm-dialog.module.css';

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  /** Пояснение под заголовком (что именно и почему необратимо). */
  readonly message: ReactNode;
  /** Подпись подтверждающей (опасной) кнопки. */
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  /** Идёт операция — кнопки заблокированы. */
  readonly busy?: boolean;
}

/**
 * Диалог подтверждения опасного действия (удаление): поверх `Modal` — иконка-корзина
 * в красной плашке, заголовок, пояснение и пара «Отмена» / опасное действие. Домен-
 * агностичен: все подписи приходят пропами (shared-слой без i18n).
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      closeLabel={cancelLabel}
      footer={
        <>
          <button type="button" className={styles.cancel} onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className={styles.confirm} onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className={styles.body}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name="trash" size={20} />
        </span>
        <p className={styles.message}>{message}</p>
      </div>
    </Modal>
  );
}
