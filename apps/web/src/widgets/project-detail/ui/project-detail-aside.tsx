import { useTranslation } from 'react-i18next';

import type { ProjectContributor, ProjectLink } from '@/entities/project';
import { Avatar } from '@sutuzhko/ui-kit';

import styles from './project-detail.module.css';

interface ProjectDetailAsideProps {
  readonly role: string | null;
  readonly period: string | null;
  readonly technologies: readonly string[];
  readonly contributors: readonly ProjectContributor[];
  readonly links: readonly ProjectLink[];
}

/** Боковая карточка детали: роль, период, стек, команда и внешние ссылки проекта. */
export function ProjectDetailAside({
  role,
  period,
  technologies,
  contributors,
  links,
}: ProjectDetailAsideProps) {
  const { t } = useTranslation();

  return (
    <aside className={styles.aside}>
      <div className={styles.metaCard}>
        {role ? (
          <>
            <div className={styles.metaLabel}>{t('project.role')}</div>
            <div className={styles.metaValue}>{role}</div>
          </>
        ) : null}
        {period ? (
          <>
            <div className={styles.metaLabel}>{t('project.period')}</div>
            <div className={styles.metaMono}>{period}</div>
          </>
        ) : null}
        {technologies.length > 0 ? (
          <>
            <div className={styles.metaLabel}>{t('project.stack')}</div>
            <div className={styles.stack}>
              {technologies.map((tech) => (
                <span key={tech} className={styles.stackTag}>
                  {tech}
                </span>
              ))}
            </div>
          </>
        ) : null}
        {contributors.length > 0 ? (
          <>
            <div className={styles.metaLabel}>{t('project.team')}</div>
            <ul className={styles.team}>
              {contributors.map((person) => (
                <li key={person.name} className={styles.member}>
                  <Avatar name={person.name} src={person.image} color={person.color} size={28} />
                  <span className={styles.memberName}>{person.name}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {links.length > 0 ? (
        <div className={styles.links}>
          {links.map((link) => (
            <a
              key={link.href}
              className={styles.link}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{link.label}</span>
              <span className={styles.linkArrow} aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
