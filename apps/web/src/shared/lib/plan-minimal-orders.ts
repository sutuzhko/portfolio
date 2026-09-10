/** Запись последовательности для расчёта порядка: ключ, id (null — новая), позиция с бэка. */
export interface OrderedItem {
  readonly key: string;
  readonly id: string | null;
  readonly order: number;
}

/**
 * Целевой `order` каждого элемента в желаемой последовательности при МИНИМУМЕ правок.
 *
 * Ключевая идея: сохраняем как «якоря» максимальный набор существующих элементов, чей
 * `order` уже идёт по возрастанию (наибольшая возрастающая подпоследовательность, LIS) —
 * их не трогаем. Остальным (новым и реально сдвинутым) выдаём ДРОБНУЮ позицию между
 * соседними якорями (или за пределами диапазона у краёв). Благодаря дробям перестановка
 * одного элемента (в т.ч. в начало) меняет `order` ровно у него, а не перенумеровывает
 * всех — поэтому `order` на бэке = Float. Вызывающий шлёт PATCH только тем, у кого
 * новый `order` отличается от текущего.
 */
export function planMinimalOrders(seq: readonly OrderedItem[]): Map<string, number> {
  const existing: number[] = [];
  for (let i = 0; i < seq.length; i += 1) {
    if (seq[i].id !== null) existing.push(i);
  }

  // LIS по `order` среди существующих (строго возрастающая), с восстановлением набора.
  const anchors = new Set<number>();
  if (existing.length > 0) {
    const length = existing.map(() => 1);
    const parent = existing.map(() => -1);
    let best = 0;
    for (let a = 0; a < existing.length; a += 1) {
      for (let b = 0; b < a; b += 1) {
        if (seq[existing[b]].order < seq[existing[a]].order && length[b] + 1 > length[a]) {
          length[a] = length[b] + 1;
          parent[a] = b;
        }
      }
      if (length[a] > length[best]) best = a;
    }
    for (let k = best; k !== -1; k = parent[k]) anchors.add(existing[k]);
  }

  const plan = new Map<string, number>();
  let i = 0;
  while (i < seq.length) {
    if (anchors.has(i)) {
      plan.set(seq[i].key, seq[i].order);
      i += 1;
      continue;
    }
    // Прогон не-якорей [i, j); соседи слева/справа — якоря (или край).
    let j = i;
    while (j < seq.length && !anchors.has(j)) j += 1;
    const lo = i > 0 ? seq[i - 1].order : null;
    const hi = j < seq.length ? seq[j].order : null;
    const run = j - i;
    for (let r = 0; r < run; r += 1) {
      let value: number;
      if (lo === null && hi === null) value = r;
      else if (lo === null)
        value = hi - (run - r); // ниже hi, по возрастанию
      else if (hi === null)
        value = lo + (r + 1); // выше lo
      else value = lo + ((hi - lo) * (r + 1)) / (run + 1); // дробная середина
      plan.set(seq[i + r].key, value);
    }
    i = j;
  }
  return plan;
}
