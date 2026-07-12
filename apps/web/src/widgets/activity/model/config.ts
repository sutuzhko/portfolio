/**
 * Официальная палитра рангов Codewars (kyu → цвет): белый · жёлтый · синий ·
 * фиолетовый. Бренд-константы, не дизайн-токены, поэтому живут в конфиге виджета.
 */
const KYU_COLORS: Record<number, string> = {
  8: '#bcbfbf',
  7: '#bcbfbf',
  6: '#ecb613',
  5: '#ecb613',
  4: '#3c97e8',
  3: '#3c97e8',
  2: '#866cc7',
  1: '#866cc7',
};

const DEFAULT_KYU_COLOR = '#3c97e8';

/** Цвет ранга по kyu (1 — высший). Неизвестный ранг — синий по умолчанию. */
export function kyuColor(kyu: number): string {
  return KYU_COLORS[kyu] ?? DEFAULT_KYU_COLOR;
}
