import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import { Icon } from '@sutuzhko/ui-kit';

import styles from './admin-stack.module.css';

interface SortableChipProps {
  /** Ключ чипа = id сортировки dnd-kit. */
  readonly id: string;
  readonly name: string;
  readonly removeLabel: string;
  readonly onRemove: () => void;
}

/**
 * Перетаскиваемый чип технологии (dnd-kit sortable). Слушатели перетаскивания
 * (мышь + клавиатура) висят на ручке-грипе, а не на всём чипе, поэтому чип не
 * становится вложенной кнопкой, а × остаётся отдельной кнопкой (без nested
 * interactive). Новый порядок сохраняется в `Technology.order`.
 */
export function SortableChip({ id, name, removeLabel, onRemove }: SortableChipProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <span
      ref={setNodeRef}
      // Только translate, без scale: у чипов разная ширина, и `CSS.Transform` добавил бы
      // scaleX/scaleY (подгонка под соседа) — от этого текст масштабируется и «плывёт».
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(styles.chip, styles.chipSortable, isDragging && styles.chipDragging)}
    >
      <button
        type="button"
        className={styles.chipHandle}
        aria-label={t('admin.stack.reorder', { name })}
        {...attributes}
        {...listeners}
      >
        <Icon name="grip" size={13} />
      </button>
      {name}
      <button
        type="button"
        className={styles.chipRemove}
        onClick={onRemove}
        aria-label={removeLabel}
      >
        ×
      </button>
    </span>
  );
}
