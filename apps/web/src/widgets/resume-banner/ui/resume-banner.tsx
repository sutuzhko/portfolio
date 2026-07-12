import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { Button, Icon, Skeleton } from '@sutuzhko/ui-kit';

import styles from './resume-banner.module.css';

const noop = () => undefined;

export interface ResumeBannerProps {
  /**
   * Ссылка на PDF-резюме из профиля. `undefined` — грузится (скелетон),
   * `null` — резюме нет (баннер скрыт), строка — показываем баннер.
   */
  readonly cvUrl?: string | null;
  readonly isLoading?: boolean;
  /** Скачать резюме — действие владеет контейнер страницы. */
  readonly onDownload?: () => void;
  readonly className?: string;
}

/**
 * Баннер скачивания резюме (макет: CONTACT → «Резюме (PDF)»). Отдельный блок под
 * карточками контактов: заголовок, описание и кнопка «Скачать резюме». Наличие
 * файла определяет `cvUrl` (приходит с бэкенда), пока грузится — скелетон.
 */
export function ResumeBanner({
  cvUrl,
  isLoading,
  onDownload = noop,
  className,
}: ResumeBannerProps) {
  const { t } = useTranslation();

  if (isLoading || cvUrl === undefined) {
    return <ResumeBannerSkeleton className={className} />;
  }

  if (cvUrl === null) return null;

  return (
    <section className={cn(styles.banner, className)} aria-label={t('contact.resume.title')}>
      <div className={styles.body}>
        <p className={styles.title}>{t('contact.resume.title')}</p>
        <p className={styles.desc}>{t('contact.resume.desc')}</p>
      </div>
      <Button variant="primary" className={styles.action} onClick={onDownload}>
        <Icon name="download" size={16} /> {t('contact.resume.download')}
      </Button>
    </section>
  );
}

function ResumeBannerSkeleton({ className }: { readonly className?: string }) {
  return (
    <section className={cn(styles.banner, className)} aria-busy="true" aria-live="polite">
      {/* Строки-заглушки повторяют заголовок + описание, чтобы баннер не прыгал. */}
      <div className={styles.skeletonBody}>
        <Skeleton width="150px" height="20px" />
        <Skeleton width="min(320px, 70%)" height="15px" />
      </div>
      <Skeleton width="176px" height="44px" radius="var(--radius-button)" />
    </section>
  );
}
