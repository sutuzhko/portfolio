/**
 * Считает число изменённых полей в `formState.dirtyFields` React Hook Form:
 * рекурсивно суммирует «листья» со значением `true` (вложенные объекты и массивы
 * зеркалят структуру формы). Нужно для счётчика правок в баре сохранения — как
 * «N в диффе» на «Локализации».
 */
export function countDirtyFields(dirty: unknown): number {
  if (dirty === true) return 1;
  if (Array.isArray(dirty)) {
    return dirty.reduce<number>((sum, item) => sum + countDirtyFields(item), 0);
  }
  if (dirty !== null && typeof dirty === 'object') {
    return Object.values(dirty).reduce<number>((sum, value) => sum + countDirtyFields(value), 0);
  }
  return 0;
}
