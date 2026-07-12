import { useTranslation } from 'react-i18next';

import { Button, Icon } from '@sutuzhko/ui-kit';

import styles from './hero.module.css';

interface HeroActionsProps {
  readonly onDownloadCv: () => void;
  readonly onProjects: () => void;
  readonly onContact: () => void;
  /** Показывать CTA «Проекты» (скрыт, если страница проектов выключена). */
  readonly showProjects?: boolean;
  /** Показывать CTA «Связаться» (скрыт, если страница контактов выключена). */
  readonly showContact?: boolean;
}

/** CTA-кнопки героя: скачать CV, перейти к проектам, к контактам. Это действия
 * (не данные), поэтому доступны сразу, без скелетона. Ссылки на выключенные
 * страницы не показываем. */
export function HeroActions({
  onDownloadCv,
  onProjects,
  onContact,
  showProjects = true,
  showContact = true,
}: HeroActionsProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.actions}>
      <Button variant="primary" size="sm" className={styles.cta} onClick={onDownloadCv}>
        <Icon name="download" size={14} /> {t('home.hero.actions.cv')}
      </Button>
      {showProjects ? (
        <Button variant="ghost" size="sm" className={styles.cta} onClick={onProjects}>
          {t('home.hero.actions.projects')} <Icon name="arrow-right" size={14} />
        </Button>
      ) : null}
      {showContact ? (
        <Button variant="text" size="sm" className={styles.cta} onClick={onContact}>
          {t('home.hero.actions.contact')}
        </Button>
      ) : null}
    </div>
  );
}
