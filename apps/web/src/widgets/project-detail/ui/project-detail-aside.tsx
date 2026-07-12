import { useTranslation } from 'react-i18next';

import type { ProjectContributor, ProjectLink } from '@/entities/project';
import { Avatar, Button } from '@sutuzhko/ui-kit';

import styles from './project-detail.module.css';

interface ProjectDetailAsideProps {
  readonly role: string | null;
  readonly period: string | null;
  readonly technologies: readonly string[];
  readonly contributors: readonly ProjectContributor[];
  readonly links: readonly ProjectLink[];
  /** Обработчик запуска проекта — кнопка «▶ Запустить» рисуется только когда он есть. */
  readonly onRun?: () => void;
  readonly runHint: string | null;
}

/**
 * Боковая карточка детали: кнопка запуска (для runnable-проектов), роль, период,
 * стек, команда и внешние ссылки. Колонка залипающая (`position: sticky`), поэтому
 * кнопка «▶ Запустить» остаётся на виду при прокрутке длинного описания.
 */
export function ProjectDetailAside({
  role,
  period,
  technologies,
  contributors,
  links,
  onRun,
  runHint,
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
              {contributors.map((person) => {
                // Аватар + имя одинаковы для ссылки и обычной строки — не дублируем.
                const body = (
                  <>
                    <Avatar name={person.name} src={person.image} color={person.color} size={28} />
                    <span className={styles.memberName}>{person.name}</span>
                  </>
                );
                return (
                  <li key={person.name} className={styles.member}>
                    {person.link ? (
                      <a
                        className={styles.memberLink}
                        href={person.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {body}
                      </a>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
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

      {/* Запуск — внизу: кнопка есть не у всех проектов, снизу она не сдвигает карточку. */}
      {onRun ? (
        <div className={styles.runBar}>
          <Button variant="primary" onClick={onRun}>
            <span aria-hidden="true">▶</span> {t('project.run')}
          </Button>
          {runHint ? <span className={styles.runHint}>{runHint}</span> : null}
        </div>
      ) : null}
    </aside>
  );
}
