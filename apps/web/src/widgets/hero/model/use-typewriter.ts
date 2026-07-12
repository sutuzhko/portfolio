import { useEffect, useRef, useState } from 'react';

interface TypewriterOptions {
  /** Длительность одного тика, мс. */
  readonly tickMs?: number;
  /** Сколько тиков держать паузу на полностью набранном слове. */
  readonly holdFull?: number;
  /** Сколько тиков держать паузу на пустой строке перед следующим словом. */
  readonly holdEmpty?: number;
}

/**
 * Печатающая анимация: печатает слово посимвольно, держит паузу, стирает и
 * переходит к следующему. Один тик = один шаг (значения из макета: 90мс/тик,
 * пауза 15 тиков на полном слове и 4 — на пустой строке). Уважает reduce-motion:
 * при нём показывает первое слово статично.
 */
export function useTypewriter(
  words: readonly string[],
  { tickMs = 90, holdFull = 15, holdEmpty = 4 }: TypewriterOptions = {},
): string {
  const [text, setText] = useState('');
  const state = useRef({ wordIndex: 0, charCount: 0, deleting: false, hold: 0 });

  useEffect(() => {
    if (words.length === 0) {
      return;
    }

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setText(words[0] ?? '');
      return;
    }

    const id = setInterval(() => {
      const s = state.current;
      if (s.hold > 0) {
        s.hold -= 1;
        return;
      }

      const word = words[s.wordIndex] ?? '';
      if (s.deleting) {
        s.charCount -= 1;
        if (s.charCount <= 0) {
          s.charCount = 0;
          s.deleting = false;
          s.wordIndex = (s.wordIndex + 1) % words.length;
          s.hold = holdEmpty;
        }
      } else {
        s.charCount += 1;
        if (s.charCount >= word.length) {
          s.charCount = word.length;
          s.deleting = true;
          s.hold = holdFull;
        }
      }

      setText(word.slice(0, s.charCount));
    }, tickMs);

    return () => {
      clearInterval(id);
    };
  }, [words, tickMs, holdFull, holdEmpty]);

  return text;
}
