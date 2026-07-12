import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { setupI18n } from '@/shared/config';

// Инициализируем единственный инстанс i18next один раз на загрузку модуля.
const i18n = setupI18n();

/** Прокидывает сконфигурированный i18next в дерево компонентов. */
export function WithI18n({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
