/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовый URL REST API. По умолчанию '/api' (тот же origin, проксируется в проде). */
  readonly VITE_API_BASE_URL?: string;
  /** 'true' — принудительно включить MSW-моки, 'false' — выключить даже в dev. */
  readonly VITE_ENABLE_MOCKS?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
