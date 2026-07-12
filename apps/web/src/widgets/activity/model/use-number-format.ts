import { useAppLanguage } from '@/shared/config';

/** Форматирует число по текущей локали (разделители тысяч: `33 322` / `33,322`). */
export function useNumberFormat(): (value: number) => string {
  const language = useAppLanguage();
  return (value) => value.toLocaleString(language);
}
