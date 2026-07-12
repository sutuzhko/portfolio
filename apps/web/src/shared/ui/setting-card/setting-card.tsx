import type { ReactNode } from 'react';

import { Icon, type IconName } from '@sutuzhko/ui-kit';

import styles from './setting-card.module.css';

export interface SettingCardProps {
  readonly title: string;
  /** Пояснение под заголовком (опционально). */
  readonly description?: string;
  /** Ведущая иконка (опционально). */
  readonly icon?: IconName;
  /** Управляющий элемент справа (Toggle, Segmented и т.п.). */
  readonly children: ReactNode;
}

/**
 * Карточка настройки: заголовок (+ опц. описание/иконка) и управляющий элемент в
 * ограниченной рамке. Единый вид всех настроек админки (тумблеры, сегменты) —
 * вместо разрозненных строк, где контрол улетал к краю широкого контейнера.
 * Презентационный; контрол передаётся `children`.
 */
export function SettingCard({ title, description, icon, children }: SettingCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.text}>
        {icon ? <Icon name={icon} size={17} className={styles.icon} /> : null}
        <div className={styles.body}>
          <span className={styles.title}>{title}</span>
          {description ? <span className={styles.description}>{description}</span> : null}
        </div>
      </div>
      <div className={styles.control}>{children}</div>
    </div>
  );
}
