import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ContributorAdmin } from '@/entities/contributor';
import type { ProjectAdmin } from '@/entities/project';
import type { TechnologyAdmin } from '@/entities/technology';
import type { AppLanguage } from '@/shared/config';
import { Button, ConfirmDialog, Icon } from '@sutuzhko/ui-kit';

import { pickText } from '../model/project-form';

import styles from './admin-projects.module.css';

const MAX_TAGS = 3;

export interface AdminProjectsViewProps {
  readonly items: readonly ProjectAdmin[];
  /** Технологии — чтобы показать имена по technologyIds в строке. */
  readonly technologies: readonly TechnologyAdmin[];
  /** Каталог участников — чтобы показать имена по contributorIds в строке. */
  readonly contributors: readonly ContributorAdmin[];
  readonly locale: AppLanguage;
  readonly isBusy: boolean;
  readonly onAdd: () => void;
  readonly onEdit: (id: string) => void;
  readonly onDelete: (id: string) => void;
}

function tileGradient(color: string | null): string {
  const base = color ?? '#30363d';
  return `linear-gradient(135deg, ${base}, color-mix(in srgb, ${base} 55%, #000))`;
}

/**
 * Список проектов: плитка-градиент, название, значок «избранное», бейдж «скрыт»,
 * теги, статус. Добавление/правка ведут на детальные маршруты, удаление — с
 * подтверждением. Презентационная.
 */
export function AdminProjectsView({
  items,
  technologies,
  contributors,
  locale,
  isBusy,
  onAdd,
  onEdit,
  onDelete,
}: AdminProjectsViewProps) {
  const { t } = useTranslation();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const techName = (id: string): string => technologies.find((tech) => tech.id === id)?.name ?? id;
  const contributorName = (id: string): string => {
    const found = contributors.find((contributor) => contributor.id === id);
    return found ? pickText(found.name, locale) : id;
  };
  const pendingProject = items.find((item) => item.id === confirmId);
  const pendingName = pendingProject ? pickText(pendingProject.title, locale) : '';

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>
            {t('admin.tabs.projects')} <span className={styles.count}>· {items.length}</span>
          </h2>
          <span className={styles.endpoint}>GET · POST · PATCH · DELETE /api/projects</span>
        </div>
        <Button variant="primary" onClick={onAdd} disabled={isBusy}>
          <Icon name="plus" size={14} />
          {t('admin.projects.add')}
        </Button>
      </header>

      <ul className={styles.list}>
        {items.length === 0 ? <li className={styles.empty}>{t('admin.projects.empty')}</li> : null}

        {items.map((item) => {
          const tags = item.technologyIds.slice(0, MAX_TAGS).map(techName);
          const more = item.technologyIds.length - tags.length;
          const contributorNames = item.contributorIds.map(contributorName);
          return (
            <li key={item.id} className={styles.row}>
              <span
                className={styles.tile}
                style={{ background: tileGradient(item.tileColor) }}
                aria-hidden="true"
              />
              <div className={styles.rowText}>
                <div className={styles.rowTitle}>
                  <span className={styles.name}>{pickText(item.title, locale)}</span>
                  {item.pinned ? <Icon name="star" size={13} className={styles.star} /> : null}
                  {item.hidden ? (
                    <span className={styles.hiddenBadge}>
                      <Icon name="eye-off" size={10} />
                      {t('admin.projects.hiddenShort')}
                    </span>
                  ) : null}
                </div>
                <div className={styles.tags}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                  {more > 0 ? <span className={styles.tagMore}>+{more}</span> : null}
                </div>
                {contributorNames.length > 0 ? (
                  <span className={styles.contributors}>
                    <Icon name="user" size={11} />
                    {contributorNames.join(', ')}
                  </span>
                ) : null}
              </div>
              <span className={styles.statusTag} data-status={item.status}>
                {'● '}
                {t(
                  item.status === 'PUBLISHED'
                    ? 'admin.projects.statusPublished'
                    : 'admin.projects.statusDraft',
                )}
              </span>
              <div className={styles.actions}>
                <Button
                  variant="icon"
                  onClick={() => onEdit(item.id)}
                  aria-label={t('admin.projects.edit')}
                >
                  <Icon name="edit" size={15} />
                </Button>
                <Button
                  variant="icon"
                  onClick={() => setConfirmId(item.id)}
                  aria-label={t('admin.projects.delete')}
                >
                  <Icon name="trash" size={15} />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={confirmId !== null}
        title={t('admin.projects.confirmTitle')}
        message={t('admin.projects.confirmDelete', { name: pendingName })}
        confirmLabel={t('admin.projects.delete')}
        cancelLabel={t('admin.projects.cancel')}
        busy={isBusy}
        onConfirm={() => {
          if (confirmId !== null) onDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </section>
  );
}
