export type ClassValue = string | false | null | undefined;

/** Склеивает классы, отбрасывая пустые/ложные значения. Без зависимостей. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
