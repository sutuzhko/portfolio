import { Trans } from 'react-i18next';

import { cn, consoleShortcut, useHasKeyboard } from '@/shared/lib';
import { Skeleton, Text } from '@sutuzhko/ui-kit';

import styles from './footer.module.css';

export interface FooterProps {
  /** Имя владельца для копирайта — данные профиля с бэкенда. */
  readonly owner?: string;
  readonly className?: string;
}

/**
 * Глобальный подвал (макет: `design/redesign` → FOOTER). Слева — копирайт с
 * именем владельца (из профиля), справа — подсказка про консоль. Подсказку с
 * клавиатурным ярлыком показываем только при наличии клавиатуры: на тач-устройствах
 * шорткатов нет — консоль открывается тапом по `>_` в шапке.
 */
export function Footer({ owner, className }: FooterProps) {
  const year = new Date().getFullYear();
  const hasKeyboard = useHasKeyboard();

  return (
    <footer className={cn(styles.footer, className)}>
      <div className={styles.inner}>
        <Text as="span" family="mono" size="caption" tone="dim">
          © {year}{' '}
          {owner ?? <Skeleton className={styles.ownerSkeleton} width="130px" height="1em" />}
        </Text>

        {hasKeyboard ? (
          <Text as="span" family="mono" size="caption" tone="muted">
            <Trans
              i18nKey="footer.consoleHint"
              values={{ shortcut: consoleShortcut() }}
              components={{ accent: <span className={styles.accent} /> }}
            />
          </Text>
        ) : null}
      </div>
    </footer>
  );
}
