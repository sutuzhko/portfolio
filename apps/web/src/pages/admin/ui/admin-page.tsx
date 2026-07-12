import { useEffect, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import {
  adminDetailPath,
  adminTabPath,
  normalizeLanguage,
  routePaths,
  useAppLanguage,
  type AppLanguage,
} from '@/shared/config';
import type { TabItem } from '@sutuzhko/ui-kit';
import { AdminEducation } from '@/widgets/admin-education';
import { AdminExperience } from '@/widgets/admin-experience';
import { AdminKb } from '@/widgets/admin-kb';
import { AdminLocalization } from '@/widgets/admin-localization';
import { AdminProfile } from '@/widgets/admin-profile';
import { AdminProjects } from '@/widgets/admin-projects';
import { AdminSettings } from '@/widgets/admin-settings';
import { AdminStack } from '@/widgets/admin-stack';

import { ADMIN_TABS, type AdminTabId } from '../model/tabs';

import { AdminPageView } from './admin-page-view';

/** Контент активной вкладки. Локаль редактирования — из маршрута; детальные вкладки
 * получают текущий `detail` (id/`new`) и колбэк навигации по детальным маршрутам. */
function renderTab(
  tab: AdminTabId,
  locale: AppLanguage,
  detail: string | undefined,
  onNavigateDetail: (detail: string | null) => void,
): ReactNode {
  switch (tab) {
    case 'profile':
      return <AdminProfile locale={locale} />;
    case 'projects':
      return <AdminProjects locale={locale} detail={detail} onNavigateDetail={onNavigateDetail} />;
    case 'experience':
      return (
        <AdminExperience locale={locale} detail={detail} onNavigateDetail={onNavigateDetail} />
      );
    case 'stack':
      return <AdminStack locale={locale} />;
    case 'education':
      return <AdminEducation locale={locale} />;
    case 'kb':
      return <AdminKb locale={locale} />;
    case 'locale':
      return <AdminLocalization />;
    case 'settings':
      return <AdminSettings />;
  }
}

/**
 * Контейнер личного кабинета: активная вкладка и локаль редактирования — из
 * маршрута (`/admin/:tab/:locale`). Локаль следует за языком приложения: сменили
 * язык — редиректим на тот же экран в новой локали (чистый ремонт данных).
 * Маршрут за гардом `RequireAuth`.
 */
export function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const appLanguage = useAppLanguage();
  const { tab, locale, detail } = useParams();

  const activeTab: AdminTabId = ADMIN_TABS.find((item) => item.id === tab)?.id ?? 'profile';
  const editLocale = normalizeLanguage(locale);

  // Локаль в URL всегда равна языку приложения: при смене языка (или кривой локали
  // в URL) редиректим на ту же вкладку/деталь в актуальной локали.
  useEffect(() => {
    if (locale !== appLanguage) {
      const target =
        detail === undefined
          ? adminTabPath(activeTab, appLanguage)
          : adminDetailPath(activeTab, appLanguage, detail);
      void navigate(target, { replace: true });
    }
  }, [locale, appLanguage, activeTab, detail, navigate]);

  const tabs = useMemo<TabItem[]>(
    () => ADMIN_TABS.map((item) => ({ id: item.id, label: t(item.labelKey), icon: item.icon })),
    [t],
  );

  const content = renderTab(
    activeTab,
    editLocale,
    detail,
    (next) =>
      void navigate(
        next === null
          ? adminTabPath(activeTab, editLocale)
          : adminDetailPath(activeTab, editLocale, next),
      ),
  );

  return (
    <AdminPageView
      tabs={tabs}
      activeTab={activeTab}
      activeLabel={t(`admin.tabs.${activeTab}`)}
      onTabChange={(id) => void navigate(adminTabPath(id, editLocale))}
      onBack={() => void navigate(routePaths.home)}
    >
      {content}
    </AdminPageView>
  );
}
