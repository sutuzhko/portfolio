import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Heading, Icon, Tabs, type TabItem } from '@sutuzhko/ui-kit';

import styles from './admin-page.module.css';

export interface AdminPageViewProps {
  readonly tabs: readonly TabItem[];
  readonly activeTab: string;
  /** Доступное имя активной панели (название вкладки). */
  readonly activeLabel: string;
  readonly onTabChange: (id: string) => void;
  readonly onBack: () => void;
  /** Контент активной вкладки. */
  readonly children: ReactNode;
}

/**
 * Оболочка личного кабинета: шапка, полоса вкладок и панель активной вкладки.
 * Презентационная — активная вкладка и её контент приходят пропами.
 */
export function AdminPageView({
  tabs,
  activeTab,
  activeLabel,
  onTabChange,
  onBack,
  children,
}: AdminPageViewProps) {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <button type="button" className={styles.back} onClick={onBack}>
        <Icon name="arrow-right" size={14} className={styles.backIcon} />
        {t('admin.back')}
      </button>

      <p className={styles.breadcrumb}>{t('admin.breadcrumb')}</p>
      <Heading level="h1" as="h1" className={styles.title}>
        {t('admin.title')}
      </Heading>
      <p className={styles.description}>{t('admin.description')}</p>

      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={onTabChange}
        aria-label={t('admin.title')}
        className={styles.tabs}
      />

      <div role="tabpanel" aria-label={activeLabel} className={styles.panel}>
        {children}
      </div>
    </main>
  );
}
