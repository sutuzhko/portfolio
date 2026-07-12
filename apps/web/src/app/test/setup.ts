import '@testing-library/jest-dom/vitest';
import 'vitest-axe/extend-expect';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

import { resetMockContributors } from '@/entities/contributor/mocks';
import { resetMockEducation } from '@/entities/education/mocks';
import { resetMockExperience } from '@/entities/experience/mocks';
import { resetMockLanguages } from '@/entities/language/mocks';
import { resetMockProjects } from '@/entities/project/mocks';
import { resetMockProfileAdmin } from '@/entities/profile/mocks';
import { resetMockSession } from '@/entities/session/mocks';
import { resetMockSettings } from '@/entities/settings/mocks';
import { resetMockSkills } from '@/entities/skill/mocks';
import { resetMockTechnologies } from '@/entities/technology/mocks';
import { i18n, languageStorageKey } from '@/shared/config';

import { server } from '../mocks/server';

expect.extend(axeMatchers);

// jsdom не реализует ResizeObserver — no-op заглушка для замеров раскладки (теги featured).
class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver = ResizeObserverStub;

// jsdom не реализует matchMedia — считаем окружение «десктопом с клавиатурой».
window.matchMedia = (query: string): MediaQueryList =>
  ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

// Детерминированная платформа для ярлыка консоли (⌘K).
Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });

// jsdom не реализует object URL — заглушки для кадрирования аватара (превью файла).
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:mock';
  URL.revokeObjectURL = () => {};
}

// Детерминированный основной язык (ru): в jsdom navigator=en, поэтому подписи из
// t() съезжали бы на английский. Сеем локаль до инициализации i18n-детектора.
localStorage.setItem(languageStorageKey, 'ru');

// Поднимаем MSW один раз на прогон; необработанные запросы — ошибка теста.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  resetMockSession();
  resetMockProfileAdmin();
  resetMockSettings();
  resetMockTechnologies();
  resetMockSkills();
  resetMockLanguages();
  resetMockEducation();
  resetMockExperience();
  resetMockProjects();
  resetMockContributors();
  cleanup();
  // Тесты, переключающие локаль, не должны протекать в соседние — возвращаем ru.
  // Только если i18n уже инициализирован (часть UI-тестов рендерит без провайдера).
  if (i18n.isInitialized && i18n.resolvedLanguage !== 'ru') {
    void i18n.changeLanguage('ru');
  }
  // Скролл-шпион мог выставить хэш — очищаем, чтобы не протекало между тестами.
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname);
  }
});

afterAll(() => {
  server.close();
});
