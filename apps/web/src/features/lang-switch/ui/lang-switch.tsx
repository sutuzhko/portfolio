import { useTranslation } from 'react-i18next';

import { Button } from '@sutuzhko/ui-kit';

import { useSiteLanguages } from '../model/use-site-languages';

import styles from './lang-switch.module.css';

/**
 * Переключатель языка: показывает текущий код локали и циклит по доступным языкам
 * сайта (набор задаёт владелец в кабинете). Если доступен только один язык —
 * переключать нечего, поэтому кнопку не показываем.
 * Собран из UI Kit (`Button variant="icon"` с моноширинной подписью кода).
 */
export function LangSwitch() {
  const { current, available, cycleNext } = useSiteLanguages();
  const { t } = useTranslation();

  if (available.length <= 1) return null;

  const code = current.toUpperCase();
  // Доступное имя включает видимый код (RU/EN) — иначе label-content-name-mismatch
  // (WCAG 2.5.3): у кнопки с текстом имя должно содержать этот текст.
  const label = `${t('common.switchLanguage')}: ${code}`;

  return (
    <Button
      variant="icon"
      onClick={cycleNext}
      aria-label={label}
      title={label}
      className={styles.lang}
    >
      {code}
    </Button>
  );
}
