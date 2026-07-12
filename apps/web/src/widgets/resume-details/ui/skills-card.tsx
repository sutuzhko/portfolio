import { useTranslation } from 'react-i18next';

import type { Skill } from '@/entities/skill';
import { Skeleton } from '@sutuzhko/ui-kit';

import styles from './resume-details.module.css';

interface SkillsCardProps {
  readonly skills?: readonly Skill[];
  readonly isLoading?: boolean;
}

/** Карточка навыков: набор моно-тегов. */
export function SkillsCard({ skills, isLoading }: SkillsCardProps) {
  const { t } = useTranslation();

  if (isLoading || !skills) {
    return (
      <div className={styles.card}>
        <Skeleton height="90px" />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className={styles.label}>{t('experience.skills')}</p>
      <div className={styles.skills}>
        {skills.map((skill) => (
          <span key={skill.id} className={styles.skillTag}>
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}
