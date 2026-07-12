import { CONSOLE_USER } from '../model/config';

import styles from './console.module.css';

/** Приглашение терминала `visitor@portfolio:~$`. Общий префикс строк ввода. */
export function Prompt() {
  return (
    <>
      <span className={styles.user}>{CONSOLE_USER}</span>
      <span className={styles.path}>:~$</span>{' '}
    </>
  );
}
