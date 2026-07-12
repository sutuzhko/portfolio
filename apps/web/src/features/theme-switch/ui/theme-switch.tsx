import { useTranslation } from 'react-i18next';

import { Button, Icon } from '@sutuzhko/ui-kit';

import { useTheme } from '../model/theme-context';

/**
 * Кнопка переключения светлой/тёмной темы. Иконка показывает текущую тему,
 * подпись — целевую. Собрана из UI Kit (`Button variant="icon"` + `Icon`).
 */
export function ThemeSwitch() {
  const { mode, toggle } = useTheme();
  const { t } = useTranslation();

  const label = mode === 'dark' ? t('common.switchToLight') : t('common.switchToDark');

  return (
    <Button variant="icon" onClick={toggle} aria-label={label} title={label}>
      <Icon name={mode === 'dark' ? 'moon' : 'sun'} size={17} />
    </Button>
  );
}
