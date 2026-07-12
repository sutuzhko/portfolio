import { createContext, useContext } from 'react';

/** Запускаемый проект: что показать в заголовке окна и что встроить в iframe. */
export interface RunnerProject {
  readonly title: string;
  /** URL проекта для встраивания (`Project.embedUrl`). */
  readonly embedUrl: string;
}

export interface RunnerContextValue {
  /** Запущенный проект или `null`, если раннер закрыт. */
  readonly project: RunnerProject | null;
  /** Открыть раннер с проектом (клик «▶ Запустить» или команда консоли `run`). */
  readonly open: (project: RunnerProject) => void;
  readonly close: () => void;
}

export const RunnerContext = createContext<RunnerContextValue | null>(null);

/**
 * Доступ к состоянию раннера (что запущено / запустить / закрыть). Бросает вне
 * RunnerProvider — это ошибка композиции.
 */
export function useRunner(): RunnerContextValue {
  const value = useContext(RunnerContext);
  if (value === null) {
    throw new Error('useRunner должен использоваться внутри RunnerProvider');
  }
  return value;
}
