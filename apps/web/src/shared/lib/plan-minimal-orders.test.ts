import { describe, expect, it } from 'vitest';

import { planMinimalOrders, type OrderedItem } from './plan-minimal-orders';

const saved = (key: string, order: number): OrderedItem => ({ key, id: key, order });

describe('planMinimalOrders', () => {
  it('без перестановок сохраняет исходные позиции', () => {
    const plan = planMinimalOrders([saved('a', 0), saved('b', 1), saved('c', 2)]);
    expect([...plan.entries()]).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
  });

  it('перенос в середину даёт дробную позицию только перенесённому', () => {
    // a(0) b(1) c(2) d(3) → d между a и b.
    const seq = [saved('a', 0), saved('d', 3), saved('b', 1), saved('c', 2)];
    const plan = planMinimalOrders(seq);
    expect(plan.get('d')).toBe(0.5);
    expect(seq.filter((item) => plan.get(item.key) !== item.order)).toHaveLength(1);
  });

  it('перенос в начало ставит элемент ниже первого якоря', () => {
    const plan = planMinimalOrders([saved('c', 2), saved('a', 0), saved('b', 1)]);
    expect(plan.get('c')).toBe(-1);
    expect(plan.get('a')).toBe(0);
    expect(plan.get('b')).toBe(1);
  });

  it('новая запись встаёт между соседями, не сдвигая их', () => {
    const plan = planMinimalOrders([
      saved('a', 0),
      { key: 'n', id: null, order: 0 },
      saved('b', 1),
    ]);
    expect(plan.get('n')).toBe(0.5);
    expect(plan.get('b')).toBe(1);
  });

  it('только новые записи нумеруются с нуля', () => {
    const plan = planMinimalOrders([
      { key: 'x', id: null, order: 0 },
      { key: 'y', id: null, order: 0 },
    ]);
    expect(plan.get('x')).toBe(0);
    expect(plan.get('y')).toBe(1);
  });
});
