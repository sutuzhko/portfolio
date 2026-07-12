import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { Icon } from '@sutuzhko/ui-kit';

import styles from './admin-stack.module.css';

interface SortableCategoryProps {
  /** Ключ категории = id сортировки dnd-kit. */
  readonly id: string;
  /** Имя блока — для aria-label ручки. */
  readonly name: string;
  /**
   * Содержимое колонки. Аргумент `dragHandle` — готовая кнопка-грип; вид
   * вставляет её в заголовок блока (в режиме переименования — опускает).
   */
  readonly children: (dragHandle: ReactNode) => ReactNode;
}

/**
 * Перетаскиваемый блок-категория технологий (dnd-kit sortable). Ручка-грип несёт
 * слушатели (мышь + клавиатура), поэтому переименование/удаление/добавление внутри
 * блока остаются обычными кнопками. Новый порядок блоков → плоский `Technology.order`
 * (категории по порядку × чипы внутри), который считает контейнер на сохранении.
 */
export function SortableCategory({ id, name, children }: SortableCategoryProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const dragHandle = (
    <button
      type="button"
      className={styles.categoryDrag}
      aria-label={t('admin.stack.reorderBlock', { name })}
      {...attributes}
      {...listeners}
    >
      <Icon name="grip" size={13} />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      // Только translate, без scale (см. SortableChip): иначе содержимое блока «плывёт».
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(styles.techColumn, isDragging && styles.columnDragging)}
    >
      {children(dragHandle)}
    </div>
  );
}
