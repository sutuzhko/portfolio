import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LangSwitch } from '@/features/lang-switch';
import { ThemeSwitch } from '@/features/theme-switch';
import { cn } from '@/shared/lib';
import { routePaths } from '@/shared/config';
import { Button, Icon, Menu } from '@sutuzhko/ui-kit';

import { BRAND_NAME, CONSOLE_GLYPH } from '../model/config';

import styles from './navbar.module.css';

export interface NavbarProps {
  /** Открыть консоль (⌘+K). Логику владеет слой выше. */
  readonly onOpenConsole: () => void;
  /**
   * Текст бренд-марки (логотип в шапке). Приходит из настроек сайта (`siteTitle`),
   * поэтому его можно менять в кабинете. Пока настройки грузятся — дефолт `BRAND_NAME`.
   */
  readonly brand?: string;
  /**
   * Пункты меню профиля (`MenuItem`). Если заданы — клик по профилю открывает
   * оверлей-меню; иначе профиль работает как простая кнопка (`onProfileClick`).
   * Содержимое зависит от авторизации и приходит из приватной зоны (FE-3).
   */
  readonly profileMenu?: ReactNode;
  /**
   * Содержимое кнопки-триггера профиля (аватар залогиненного пользователя). Без
   * него — обобщённая иконка пользователя. Зависит от авторизации/профиля,
   * поэтому приходит из приватной зоны, а навбар остаётся презентационным.
   */
  readonly profileTrigger?: ReactNode;
  /** Клик по профилю, когда меню не задано. */
  readonly onProfileClick?: () => void;
  readonly className?: string;
}

/**
 * Глобальная верхняя панель (макет: `design/redesign` → NAVBAR).
 * Слева — кнопка консоли `>_`, по центру — бренд-ссылка на главную,
 * справа — переключатели темы/языка и профиль. Все элементы управления —
 * `Button variant="icon"` из UI Kit.
 *
 * Раскладка — грид `1fr auto 1fr`: колонки резервируют место, поэтому боковые
 * группы не наезжают на бренд. Полоса тянется во всю ширину, содержимое
 * ограничено контейнером и центрируется на широких экранах. На ≤480px бренд
 * скрывается — места между группами кнопок ему не хватает.
 */
export function Navbar({
  onOpenConsole,
  brand = BRAND_NAME,
  profileMenu,
  profileTrigger,
  onProfileClick,
  className,
}: NavbarProps) {
  const { t } = useTranslation();

  return (
    <header className={cn(styles.navbar, className)}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Button
            variant="icon"
            onClick={onOpenConsole}
            aria-label={t('nav.openConsole')}
            className={styles.console}
          >
            {CONSOLE_GLYPH}
          </Button>
        </div>

        {/* Доступное имя содержит видимый текст (бренд), а декоративные скобки
            скрыты от a11y — иначе label-content-name-mismatch (WCAG 2.5.3). */}
        <Link
          to={routePaths.home}
          aria-label={`${brand} — ${t('nav.home')}`}
          className={styles.brand}
        >
          <span className={styles.brandDim} aria-hidden>
            &lt;
          </span>
          {brand}
          <span className={styles.brandDim} aria-hidden>
            {' '}
            /&gt;
          </span>
        </Link>

        <div className={styles.right}>
          <ThemeSwitch />
          <LangSwitch />
          {profileMenu ? (
            <Menu
              align="end"
              ariaLabel={t('nav.profileMenu')}
              renderTrigger={({ toggle, triggerProps }) => (
                <Button
                  variant="icon"
                  onClick={toggle}
                  aria-label={t('nav.profileMenu')}
                  // Аватар залогиненного заполняет кнопку — клипуем его к её форме.
                  className={styles.profileTrigger}
                  {...triggerProps}
                >
                  {profileTrigger ?? <Icon name="user" size={18} />}
                </Button>
              )}
            >
              {profileMenu}
            </Menu>
          ) : (
            <Button variant="icon" onClick={onProfileClick} aria-label={t('nav.profileMenu')}>
              <Icon name="user" size={18} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
