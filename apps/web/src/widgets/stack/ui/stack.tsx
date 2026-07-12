import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Technology } from '@/entities/technology';
import { cn } from '@/shared/lib';
import { Card, SectionLabel, Skeleton, Tag } from '@sutuzhko/ui-kit';

import { groupTechnologies } from '../model/config';

import styles from './stack.module.css';

const SKELETON_GROUPS = [0, 1, 2];
const SKELETON_TAG_WIDTHS = [64, 52, 78, 48];

export interface StackProps {
  /** Технологии стека (с категориями). Пока не пришли — рендерим скелетон. */
  readonly technologies?: readonly Technology[];
  readonly isLoading?: boolean;
  /** Якорь секции для навигации и скролл-шпиона. */
  readonly id?: string;
  readonly className?: string;
}

/**
 * Секция стека главной (макет: STACK) — заголовок `// стек` и карточки-слои
 * с технологиями. Технологии приходят с бэкенда (`entities/technology`, с
 * категориями) и группируются по слою; пока грузятся — скелетон.
 */
export function Stack({ technologies, isLoading, id, className }: StackProps) {
  const { t } = useTranslation();
  const groups = useMemo(() => groupTechnologies(technologies ?? []), [technologies]);

  return (
    <section id={id} className={cn(styles.section, className)}>
      <SectionLabel>{t('home.sections.stack')}</SectionLabel>
      {isLoading || !technologies ? (
        <div className={styles.grid} aria-busy="true" aria-live="polite">
          {SKELETON_GROUPS.map((index) => (
            <Card key={index} className={styles.card}>
              <Skeleton width="90px" height="16px" />
              <div className={styles.tags}>
                {SKELETON_TAG_WIDTHS.map((width, tag) => (
                  <Skeleton
                    key={tag}
                    width={`${String(width)}px`}
                    height="26px"
                    radius="var(--radius-stadium)"
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {groups.map((group) => (
            <Card key={group.group} className={styles.card}>
              <div className={styles.groupTitle}>{group.group}</div>
              <div className={styles.tags}>
                {group.items.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
