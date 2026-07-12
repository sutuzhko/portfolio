import { env } from '@/shared/config';

/**
 * Поднимает MSW, если моки включены. Воркер импортируется динамически,
 * чтобы msw и фикстуры не попадали в продакшн-бандл.
 */
export async function enableMocking(): Promise<void> {
  if (!env.enableMocks) {
    return;
  }

  // Статический предохранитель для сборщика: в чистом продакшн-билде (не DEV и
  // без VITE_ENABLE_MOCKS='true') это условие сворачивается в константу `true`,
  // код ниже становится недостижимым и Rollup вырезает динамический import →
  // msw и фикстуры не остаются мёртвым чанком в dist. В dev и preview-билдах с
  // флагом условие ложно, и моки грузятся как прежде.
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true' && !import.meta.env.DEV) {
    return;
  }

  try {
    const { worker } = await import('./browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  } catch (error) {
    // Service Worker может быть недоступен (нет поддержки/без https) — не валим
    // загрузку приложения: оно отрисуется и покажет обычные состояния ошибок.
    console.error('MSW не запустился, продолжаем без моков:', error);
  }
}
