import { useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useProfile } from '@/entities/profile';
import { useProjects } from '@/entities/project';
import { useGetSettingsQuery } from '@/entities/settings';
import { ProfileMenu, ProfileMenuTrigger } from '@/features/profile-menu';
import { themeStorageKey, useTheme } from '@/features/theme-switch';
import { Console, useConsole } from '@/widgets/console';
import { Footer } from '@/widgets/footer';
import { Navbar } from '@/widgets/navbar';
import { Runner, useRunner } from '@/widgets/runner';

import styles from './root-layout.module.css';

/**
 * Управляет позицией прокрутки при навигации:
 * — переход по хэшу (`/#about`) скроллит к секции;
 * — обычный переход между страницами возвращает наверх;
 * — первый рендер (перезагрузка страницы) не трогаем — позицию восстановит браузер.
 *
 * Скролл-шпион обновляет хэш через `replaceState` (в обход React Router),
 * поэтому эти обновления сюда не долетают и прокрутку не сбивают.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const isInitial = useRef(true);

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: isInitial.current ? 'auto' : 'smooth' });
        isInitial.current = false;
        return;
      }
    }

    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return null;
}

/**
 * Корневой лейаут приложения: липкий навбар сверху, контент маршрута по центру,
 * подвал снизу. Каждая страница рендерит свой `<main>`.
 */
export function RootLayout() {
  // Открытие консоли (⌘K) — из глобального состояния; сам оверлей ниже.
  const { open } = useConsole();
  // Запуск проекта в раннере — связку виджетов (консоль ↔ раннер) сводит app-слой.
  const { open: openRunner } = useRunner();
  // Имя владельца в подвале — из профиля (данные с бэкенда).
  const { data: profile } = useProfile();
  // Список проектов нужен, чтобы команда консоли `run <cmd>` нашла запускаемый проект.
  const { data: projects } = useProjects();
  // Логотип в шапке настраивается в кабинете (`siteTitle`); до загрузки — дефолт навбара.
  const { data: settings } = useGetSettingsQuery();

  // Акцент оформления сайта (green | blue | bright) — общий для всех посетителей,
  // ставится на <html data-accent>; тему (data-theme) отдельно ведёт ThemeProvider.
  const accentColor = settings?.accentColor;
  useEffect(() => {
    if (accentColor) document.documentElement.dataset.accent = accentColor;
  }, [accentColor]);

  // Тема по умолчанию (settings.defaultTheme) — только для НОВОГО гостя: применяем,
  // если нет явного выбора в localStorage И нет системного prefers-color-scheme
  // (иначе приоритет у выбора → системной темы, их уже применил бутстрап-скрипт).
  const { mode, applyDefaultMode } = useTheme();
  const defaultTheme = settings?.defaultTheme;
  useEffect(() => {
    if (defaultTheme !== 'dark' && defaultTheme !== 'light') return;
    const hasChoice = ((): boolean => {
      try {
        const stored = localStorage.getItem(themeStorageKey);
        return stored === 'dark' || stored === 'light';
      } catch {
        return false;
      }
    })();
    if (hasChoice) return;
    const hasSystemPreference =
      window.matchMedia('(prefers-color-scheme: dark)').matches ||
      window.matchMedia('(prefers-color-scheme: light)').matches;
    if (hasSystemPreference) return;
    if (defaultTheme !== mode) applyDefaultMode(defaultTheme);
  }, [defaultTheme, mode, applyDefaultMode]);

  // Ищет запускаемый проект по его команде (`run 2048`) и открывает раннер.
  // Возвращает название запущенного проекта или null, если совпадения нет.
  const runProject = useCallback(
    (command: string): string | null => {
      const match = projects?.find(
        (project) =>
          project.runnable && project.embedUrl !== null && project.runCommand === command,
      );
      if (match === undefined || match.embedUrl === null) return null;
      openRunner({ title: match.title, embedUrl: match.embedUrl });
      return match.title;
    },
    [projects, openRunner],
  );

  return (
    <div className={styles.shell}>
      <ScrollManager />
      <Navbar
        onOpenConsole={open}
        brand={settings?.siteTitle}
        profileMenu={<ProfileMenu />}
        profileTrigger={<ProfileMenuTrigger />}
      />
      <div className={styles.content}>
        <Outlet />
      </div>
      <Footer owner={profile?.name} />
      <Console onRunProject={runProject} />
      <Runner />
    </div>
  );
}
