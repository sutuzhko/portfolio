import { useTranslation } from 'react-i18next';

import type { Education } from '@/entities/education';
import type { Experience } from '@/entities/experience';
import type { Language } from '@/entities/language';
import type { Skill } from '@/entities/skill';
import { useReveal } from '@/shared/lib';
import { ErrorState, Heading, Icon, PageIntro } from '@sutuzhko/ui-kit';
import { ExperienceTimeline } from '@/widgets/experience-timeline';
import { ResumeDetails } from '@/widgets/resume-details';

import styles from './experience-page.module.css';

const noop = () => undefined;

export interface ExperiencePageViewProps {
  readonly experience?: readonly Experience[];
  readonly education?: readonly Education[];
  readonly languages?: readonly Language[];
  readonly skills?: readonly Skill[];
  /** Интро-абзац экрана (серверное поле профиля). */
  readonly intro?: string | null;
  readonly isLoading?: boolean;
  readonly isError?: boolean;
  readonly onBack?: () => void;
  readonly onRetry?: () => void;
}

/**
 * Презентационный слой экрана опыта: шапка-«крошка», таймлайн опыта и блок
 * образование/языки/навыки. Данные и `isLoading`/`isError` приходят пропсами —
 * запросы и навигацию делает контейнер `ExperiencePage`.
 */
export function ExperiencePageView({
  experience,
  education,
  languages,
  skills,
  intro,
  isLoading,
  isError,
  onBack = noop,
  onRetry = noop,
}: ExperiencePageViewProps) {
  const { t } = useTranslation();
  const revealRef = useReveal();

  if (isError) {
    return (
      <main id="main" className={styles.page}>
        <ErrorState
          message={t('experience.error')}
          retryLabel={t('experience.retry')}
          onRetry={onRetry}
        />
      </main>
    );
  }

  return (
    <main id="main" className={styles.page} ref={revealRef}>
      <button type="button" className={styles.back} onClick={onBack}>
        <Icon name="arrow-right" size={14} className={styles.backIcon} />
        {t('experience.back')}
      </button>

      <div className={styles.breadcrumb}>{t('experience.breadcrumb')}</div>
      <Heading level="h1" className={styles.title}>
        {t('experience.title')}
      </Heading>
      {/* Интро — серверное поле профиля. Скелетон — только когда данных нет
          (intro === undefined). Профиль обычно уже в кэше (его тянет футер),
          поэтому текст показываем сразу, не мигая скелетоном из-за загрузки опыта. */}
      <PageIntro intro={intro} />

      <ExperienceTimeline jobs={experience} isLoading={isLoading} />

      <div className={styles.details}>
        <ResumeDetails
          education={education}
          languages={languages}
          skills={skills}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}
