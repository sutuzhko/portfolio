/** Квадрат кадрирования в пикселях исходного изображения. */
export interface CropRect {
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/** Состояние кадрирования: масштаб и смещение картинки во вьюпорте. */
export interface CropState {
  readonly zoom: number;
  readonly panX: number;
  readonly panY: number;
}

/** Масштаб «cover»: при zoom=1 картинка целиком закрывает квадратный вьюпорт. */
export function coverScale(naturalW: number, naturalH: number, viewport: number): number {
  const min = Math.min(naturalW, naturalH);
  return min > 0 ? viewport / min : 1;
}

/** Ограничивает смещение так, чтобы картинка всегда покрывала вьюпорт (без зазоров). */
export function clampPan(pan: number, displaySize: number, viewport: number): number {
  const minPan = viewport - displaySize; // ≤ 0, картинка не меньше вьюпорта
  if (pan > 0) return 0;
  if (pan < minPan) return minPan;
  return pan;
}

/**
 * Прямоугольник кадрирования (квадрат) в пикселях исходного изображения — из
 * текущего масштаба и смещения. Вьюпорт квадратный, поэтому размер стороны один.
 */
export function computeCrop(
  natural: { width: number; height: number },
  viewport: number,
  state: CropState,
): CropRect {
  const scale = coverScale(natural.width, natural.height, viewport) * state.zoom;
  if (scale <= 0) return { x: 0, y: 0, size: 0 };
  const size = Math.round(viewport / scale);
  const clamp = (value: number, max: number): number =>
    Math.max(0, Math.min(value, Math.max(0, max - size)));
  return {
    x: clamp(Math.round(-state.panX / scale), natural.width),
    y: clamp(Math.round(-state.panY / scale), natural.height),
    size,
  };
}
