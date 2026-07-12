import { defineConfig, devices } from '@playwright/test';

/**
 * E2E прогоняются против прод-сборки в preview с включёнными MSW-моками
 * (VITE_ENABLE_MOCKS=true), пока публичные экраны не подключены к реальному API.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    // Детерминированная локаль: иначе Chromium отдаёт `navigator.language = en-US`,
    // языковой детектор уводит приложение в EN и подписи «уезжают».
    // Тот же приём, что в Storybook и unit-тестах.
    locale: 'ru-RU',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], locale: 'ru-RU' } }],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    env: { VITE_ENABLE_MOCKS: 'true' },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
