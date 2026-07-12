/** Активные критерии фильтрации списка проектов (управляемое состояние). */
export interface ProjectFilterState {
  /** Поисковый запрос по названию/описанию (регистронезависимо). */
  readonly query: string;
  /** Выбранные технологии — режим «ИЛИ» внутри фасета. */
  readonly techs: readonly string[];
  /** Выбранные контрибьюторы (по имени) — режим «ИЛИ» внутри фасета. */
  readonly contributors: readonly string[];
}
