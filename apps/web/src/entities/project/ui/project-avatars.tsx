import { useTranslation } from 'react-i18next';

import type { ProjectContributor } from '../model/types';
import { cn } from '@/shared/lib';
import { Avatar } from '@sutuzhko/ui-kit';

import styles from './project-tile.module.css';

const MAX_AVATARS = 2;

interface ProjectAvatarsProps {
  readonly people: readonly ProjectContributor[];
}

/** Стопка аватаров контрибьюторов на карточке: до двух + счётчик «+N» остатка. */
export function ProjectAvatars({ people }: ProjectAvatarsProps) {
  const { t } = useTranslation();
  const shown = people.slice(0, MAX_AVATARS);
  const extra = people.length - shown.length;

  return (
    <span className={styles.avatars}>
      {shown.map((person) => (
        <Avatar
          key={person.name}
          name={person.name}
          src={person.image}
          color={person.color}
          size={26}
          className={styles.avatar}
        />
      ))}
      {extra > 0 ? (
        <span className={cn(styles.avatar, styles.avatarExtra)}>
          {t('projects.card.extra', { count: extra })}
        </span>
      ) : null}
    </span>
  );
}
