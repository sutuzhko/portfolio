import type { AxeMatchers } from 'vitest-axe/matchers';

// vitest-axe augments the legacy `Vi` namespace; Vitest 4 reads matchers from
// `vitest`'s own Assertion interface, so we bridge them here.
declare module 'vitest' {
  // Список параметров типа обязан совпадать с базовым Assertion<T = any> из vitest.
  // eslint-disable-next-line -- файл вне src и линтером не проверяется, оставлено для ясности
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
