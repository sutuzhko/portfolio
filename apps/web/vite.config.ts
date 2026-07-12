/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Куда проксировать API и статику загрузок в dev без моков (`pnpm dev`).
// По умолчанию — локальный NestJS; переопределяется через VITE_API_PROXY_TARGET.
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker собирается только в прод-билде. В dev работает MSW-воркер
      // (dev:mock) — два service worker'а на одном origin конфликтовали бы.
      devOptions: { enabled: false },
      // В мок-сборке (e2e через `VITE_ENABLE_MOCKS=true`) активен MSW-воркер,
      // поэтому PWA-воркер отключаем — иначе два SW дерутся за один scope и MSW
      // перестаёт перехватывать запросы.
      disable: process.env.VITE_ENABLE_MOCKS === 'true',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Bogdan Sutuzhko — Full Stack Developer',
        short_name: 'sutuzhko.dev',
        description:
          'Портфолио фуллстек-разработчика: проекты, опыт, стек и интерактивный терминал.',
        lang: 'ru',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Прекэш оболочки приложения (собранные ассеты).
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // SPA: любые непойманные навигации отдаём index.html из кэша (офлайн-роутинг).
        navigateFallback: '/index.html',
        // Не перехватываем API и загрузки навигационным фолбэком.
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          {
            // Публичные данные: свежее онлайн, из кэша — офлайн.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Загруженные изображения (аватар, галерея) — редко меняются.
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'uploads-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts — стили и сами шрифты.
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5180,
    strictPort: true,
    // В dev без моков фронт ходит на реальный бэкенд. Проксируем и API, и
    // `/uploads` на NestJS, чтобы всё оставалось same-origin: HttpOnly-cookie
    // авторизации ходят без CORS. При `dev:mock` MSW перехватывает запросы
    // раньше сети, поэтому прокси там просто не задействуется.
    proxy: {
      '/api': { target: apiProxyTarget, changeOrigin: true },
      '/uploads': { target: apiProxyTarget, changeOrigin: true },
    },
  },
  // `vite preview` (прод-сборка) тоже проксирует на бэкенд — нужно для проверки
  // PWA/офлайна на реальном service worker (в dev он выключен, работает MSW).
  preview: {
    proxy: {
      '/api': { target: apiProxyTarget, changeOrigin: true },
      '/uploads': { target: apiProxyTarget, changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.{test,spec}.{ts,tsx}', 'src/**/index.ts'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/app/test/setup.ts'],
          css: true,
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
});
