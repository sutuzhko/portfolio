import { useTranslation } from 'react-i18next';

import { COMMANDS } from '../model/commands';

import styles from './console.module.css';

/**
 * Таблица справки (`help`): список команд из единого реестра. Левая колонка —
 * синтаксис (код), правая — локализованное описание. Реестр — единственный
 * источник, поэтому новая команда появляется в справке автоматически.
 */
export function ConsoleHelp() {
  const { t } = useTranslation();

  return (
    <div className={styles.help}>
      <div className={styles.helpTitle}>{t('console.help.title')}</div>
      <dl className={styles.helpList}>
        {COMMANDS.map((command) => (
          <div key={command.name} className={styles.helpRow}>
            <dt className={styles.helpUsage}>{command.usage}</dt>
            <dd className={styles.helpDesc}>{t(command.descriptionKey)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
