import type { ReactNode } from 'react';

import styles from './admin-projects.module.css';

interface FormCardProps {
  /** Заголовок секции (моно-зелёный, uppercase). */
  readonly title: string;
  /** Правый мета-текст в шапке (например, «live» или «3 / 10»). */
  readonly meta?: ReactNode;
  readonly children: ReactNode;
}

/** Карточка-секция формы: моно-зелёная шапка + тело. Каркас редактора проектов. */
export function FormCard({ title, meta, children }: FormCardProps) {
  return (
    <section className={styles.formCard}>
      <div className={styles.formCardHead}>
        <span className={styles.formCardTitle}>{title}</span>
        {meta !== undefined ? <span className={styles.formCardMeta}>{meta}</span> : null}
      </div>
      <div className={styles.formCardBody}>{children}</div>
    </section>
  );
}
