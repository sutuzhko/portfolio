import { useTranslation } from 'react-i18next';

import type { Profile } from '@/entities/profile';
import { Skeleton } from '@sutuzhko/ui-kit';

import { WELCOME_BANNER } from '../model/config';

import { Prompt } from './console-prompt';
import styles from './console.module.css';

export interface ConsoleWelcomeProps {
  readonly profile?: Profile;
  readonly clock: string;
}

/** Строка приветствия: приглашение с командой + её вывод (или скелетон). */
function WelcomeLine({ command, output }: { readonly command: string; readonly output?: string }) {
  return (
    <div className={styles.welcomeLine}>
      <div className={styles.line}>
        <Prompt />
        <span className={styles.cmd}>{command}</span>
      </div>
      <div className={styles.output}>{output ?? <Skeleton width="220px" height="1em" />}</div>
    </div>
  );
}

/**
 * Приветственный экран консоли: ASCII-баннер и «сеанс» из трёх команд, чьи
 * ответы — данные профиля (имя/роль, стек, локация). Пока профиль грузится,
 * ответы показывают скелетон — как и везде для бэкенд-данных.
 */
export function ConsoleWelcome({ profile, clock }: ConsoleWelcomeProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.welcome} aria-busy={profile === undefined}>
      <pre className={styles.banner}>{WELCOME_BANNER}</pre>
      <WelcomeLine command="whoami" output={profile && `${profile.name} · ${profile.roleTitle}`} />
      <WelcomeLine command="cat stack.txt" output={profile?.heroStack.join(' · ')} />
      <WelcomeLine command="location" output={profile && `${profile.location} · ${clock}`} />
      <div className={styles.welcomeHint}>{t('console.welcome.hint')}</div>
    </div>
  );
}
