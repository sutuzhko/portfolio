import { describe, expect, it } from 'vitest';

import { clampPan, computeCrop, coverScale } from './crop-math';

describe('crop-math', () => {
  it('coverScale масштабирует по меньшей стороне', () => {
    expect(coverScale(1000, 500, 250)).toBe(0.5); // min=500 → 250/500
    expect(coverScale(400, 800, 200)).toBe(0.5); // min=400 → 200/400
    expect(coverScale(0, 0, 200)).toBe(1); // защита от деления на ноль
  });

  it('clampPan держит картинку покрывающей вьюпорт', () => {
    // display=400, viewport=200 → допустимый диапазон [-200, 0]
    expect(clampPan(50, 400, 200)).toBe(0); // положительное → 0
    expect(clampPan(-300, 400, 200)).toBe(-200); // за нижнюю границу
    expect(clampPan(-120, 400, 200)).toBe(-120); // внутри диапазона
  });

  it('computeCrop: без смещения и zoom=1 берёт центральный квадрат', () => {
    // 1000x500, viewport 250 → scale 0.5, size 500. По центру (панорама центрирует
    // ландшафт по X): panX = (250 - 500)/2 = -125 → x = 125/0.5 = 250.
    const crop = computeCrop({ width: 1000, height: 500 }, 250, {
      zoom: 1,
      panX: -125,
      panY: 0,
    });
    expect(crop).toEqual({ x: 250, y: 0, size: 500 });
  });

  it('computeCrop: zoom увеличивает масштаб и уменьшает сторону кадра', () => {
    const crop = computeCrop({ width: 1000, height: 500 }, 250, {
      zoom: 2,
      panX: 0,
      panY: 0,
    });
    // scale = 0.5*2 = 1 → size = 250
    expect(crop.size).toBe(250);
  });

  it('computeCrop: смещение остаётся в границах изображения', () => {
    const crop = computeCrop({ width: 500, height: 500 }, 250, {
      zoom: 2,
      panX: -9999,
      panY: -9999,
    });
    // scale = 0.5*2 = 1 → size=250, максимум x/y = 500-250 = 250 (не вылезаем за картинку)
    expect(crop.size).toBe(250);
    expect(crop.x).toBe(250);
    expect(crop.y).toBe(250);
  });
});
