import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * Сенсоры сортируемых списков dnd-kit: мышь/тач — только после сдвига на 6px, чтобы
 * клики по кнопкам внутри элемента (×, карандаш, тоггл) не превращались в перетаскивание;
 * плюс клавиатура (пробел — взять, стрелки — двигать).
 */
export function useSortableSensors(): ReturnType<typeof useSensors> {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}
