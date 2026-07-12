import { useTranslation } from 'react-i18next';

import { Skeleton } from '@sutuzhko/ui-kit';

import { useTypewriter } from '../model/use-typewriter';

import styles from './hero.module.css';

/** Печатающая строка стека: префикс из i18n и слово, которое набирает `useTypewriter`. */
export function TypingLine({ words }: { readonly words: readonly string[] }) {
  const { t } = useTranslation();
  const word = useTypewriter(words);

  return (
    <div className={styles.typing}>
      <span className={styles.typingPrefix}>{t('home.hero.typing')}</span>{' '}
      {/* Слово и курсор — единый неразрывный блок: курсор не «отрывается» на
          новую строку, а длинное слово переносится целиком. */}
      <span className={styles.typingValue}>
        <span className={styles.typingWord}>{word}</span>
        <span className={styles.cursor} aria-hidden="true" />
      </span>
    </div>
  );
}

/** Скелетон строки стека: высота = line-box строки (h3 17px × 1.5 ≈ 26px). */
export function TypingSkeleton() {
  return (
    <div className={styles.typing}>
      <Skeleton width="240px" height="26px" />
    </div>
  );
}
