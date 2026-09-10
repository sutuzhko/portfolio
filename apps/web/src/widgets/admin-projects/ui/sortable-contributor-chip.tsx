import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@sutuzhko/ui-kit';

import { cn } from '@/shared/lib';

import styles from './admin-projects.module.css';

/** Заливка чипа участника: градиент из его цвета аватара (иначе — нейтральная). */
function chipFill(color: string | null): CSSProperties | undefined {
  if (!color) return undefined;
  return {
    background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, #000))`,
    color: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.18)',
  };
}

interface SortableContributorChipProps {
  /** id участника = id сортировки dnd-kit. */
  readonly id: string;
  readonly label: string;
  readonly color: string | null;
  /** Выбран для текущего проекта. */
  readonly selected: boolean;
  /** Открыта форма правки именно этого участника. */
  readonly editing: boolean;
  readonly disabled: boolean;
  readonly onToggle: () => void;
  readonly onEdit: () => void;
}

/**
 * Чип участника в каталоге проекта: ручка перетаскивания (dnd-kit sortable), тоггл
 * выбора для проекта и карандаш правки. Слушатели перетаскивания висят только на
 * ручке — тоггл и карандаш остаются обычными кнопками (без вложенных интерактивов).
 * Порядок каталога глобальный: в нём же участники идут на публичных плитках и в детали.
 */
export function SortableContributorChip({
  id,
  label,
  color,
  selected,
  editing,
  disabled,
  onToggle,
  onEdit,
}: SortableContributorChipProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  return (
    <span
      ref={setNodeRef}
      // Только translate, без scale: у чипов разная ширина, и `CSS.Transform` добавил бы
      // scaleX/scaleY (подгонка под соседа) — от этого текст масштабируется и «плывёт».
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(styles.chipWrap, isDragging && styles.chipDragging)}
    >
      <button
        type="button"
        className={styles.chipHandle}
        aria-label={t('admin.projects.contributorReorder', { name: label })}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <Icon name="grip" size={13} />
      </button>
      <button
        type="button"
        className={cn(styles.collabChip, !selected && styles.collabChipOff)}
        style={selected ? chipFill(color) : undefined}
        aria-pressed={selected}
        onClick={onToggle}
        title={t('admin.projects.contributorToggle', { name: label })}
      >
        {label}
      </button>
      <button
        type="button"
        className={cn(styles.chipEdit, editing && styles.chipEditActive)}
        disabled={disabled}
        aria-label={t('admin.projects.contributorEditName', { name: label })}
        onClick={onEdit}
      >
        <Icon name="edit" size={13} />
      </button>
    </span>
  );
}
