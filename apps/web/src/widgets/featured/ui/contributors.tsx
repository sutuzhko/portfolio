import { useTranslation } from 'react-i18next';

import type { ProjectContributor } from '@/entities/project';
import { cn } from '@/shared/lib';
import { Avatar } from '@sutuzhko/ui-kit';

import styles from './featured.module.css';

const MAX_AVATARS = 3;

/** Стопка аватаров контрибьюторов проекта: показываем до трёх, остаток — «+N». */
export function Contributors({ people }: { readonly people: readonly ProjectContributor[] }) {
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
          size={24}
          className={styles.avatar}
        />
      ))}
      {extra > 0 ? (
        <span className={cn(styles.avatar, styles.avatarExtra)}>
          {t('home.featured.extra', { count: extra })}
        </span>
      ) : null}
    </span>
  );
}
