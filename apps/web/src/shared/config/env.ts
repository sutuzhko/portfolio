/**
 * Единая типизированная точка доступа к переменным окружения.
 * Компоненты и слои читают конфиг только отсюда, а не из `import.meta.env` напрямую.
 */

interface AppEnv {
  /** Базовый URL REST API. */
  readonly apiBaseUrl: string;
  /** Нужно ли поднимать MSW-моки контракта. */
  readonly enableMocks: boolean;
  /** Признак dev-режима сборки. */
  readonly isDev: boolean;
}

const mocksFlag = import.meta.env.VITE_ENABLE_MOCKS;

export const env: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  // По умолчанию моки живут в dev (бэкенд может быть не поднят), но флаг всегда перекрывает.
  enableMocks: mocksFlag === 'true' || (mocksFlag !== 'false' && import.meta.env.DEV),
  isDev: import.meta.env.DEV,
};
