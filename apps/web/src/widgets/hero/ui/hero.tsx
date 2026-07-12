import type { Profile } from '@/entities/profile';
import { cn } from '@/shared/lib';

import { HeroActions } from './hero-actions';
import { HeroContent, HeroContentSkeleton } from './hero-content';
import { TerminalCard } from './terminal-card';
import styles from './hero.module.css';

const noop = () => undefined;

export interface HeroProps {
  readonly profile?: Profile;
  readonly isLoading?: boolean;
  /** Открыть консоль по клику на плашку терминала. */
  readonly onOpenConsole?: () => void;
  /** Скачать резюме (CV). */
  readonly onDownloadCv?: () => void;
  /** Перейти к проектам. */
  readonly onProjects?: () => void;
  /** Перейти к контактам. */
  readonly onContact?: () => void;
  /** Показывать CTA «Проекты»/«Связаться» (скрыты, если страница выключена). */
  readonly showProjects?: boolean;
  readonly showContact?: boolean;
  readonly className?: string;
}

/**
 * Герой-секция главной (макет: HERO BAND). Левая колонка — идентичность,
 * печатающая строка стека, питч и CTA-кнопки; правая — `TerminalCard`.
 *
 * Идентичность, строка стека и питч — контент профиля (`entities/profile`),
 * поэтому под скелетоном при загрузке. CTA — действия (не данные) и терминал —
 * статичный флейвор, поэтому доступны сразу.
 */
export function Hero({
  profile,
  isLoading = false,
  onOpenConsole = noop,
  onDownloadCv = noop,
  onProjects = noop,
  onContact = noop,
  showProjects = true,
  showContact = true,
  className,
}: HeroProps) {
  const showSkeleton = isLoading || !profile;

  return (
    <section className={cn(styles.band, className)} aria-busy={showSkeleton}>
      <div className={styles.left}>
        {showSkeleton ? <HeroContentSkeleton /> : <HeroContent profile={profile} />}
        <HeroActions
          onDownloadCv={onDownloadCv}
          onProjects={onProjects}
          onContact={onContact}
          showProjects={showProjects}
          showContact={showContact}
        />
      </div>
      <TerminalCard onOpenConsole={onOpenConsole} className={styles.terminal} />
    </section>
  );
}
