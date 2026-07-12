// Простой in-memory TTL-кэш для ответов внешних API.
// Внешние сервисы ненадёжны и ограничены по числу запросов, поэтому держим
// последний успешный ответ: свежий отдаём сразу, устаревший — как запасной
// вариант, если источник временно недоступен.
export class TtlCache<T> {
  private entry: { value: T; expiresAt: number } | null = null;

  constructor(private readonly ttlMs: number) {}

  // Значение, если оно ещё не протухло.
  getFresh(): T | null {
    if (!this.entry) return null;
    return Date.now() <= this.entry.expiresAt ? this.entry.value : null;
  }

  // Последнее значение независимо от срока — фолбэк при сбое внешнего API.
  getStale(): T | null {
    return this.entry?.value ?? null;
  }

  set(value: T): void {
    this.entry = { value, expiresAt: Date.now() + this.ttlMs };
  }
}
