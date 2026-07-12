import { Chip, Skeleton } from '@sutuzhko/ui-kit';

import styles from './project-filter-bar.module.css';

// Разная ширина плейсхолдеров-чипов, чтобы скелетон выглядел живым.
const SKELETON_CHIP_WIDTHS = [88, 64, 104, 72, 56];

interface FilterRowProps {
  readonly label: string;
  readonly options: readonly string[];
  readonly selected: readonly string[];
  readonly onToggle: (value: string) => void;
}

/** Строка фасета фильтра: подпись слева и переключаемые чипы (технологии/люди). */
export function FilterRow({ label, options, selected, onToggle }: FilterRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div className={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option}
            selected={selected.includes(option)}
            onClick={() => {
              onToggle(option);
            }}
          >
            {option}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/** Скелетон строки фасета: подпись и плейсхолдеры-чипы, пока грузятся опции. */
export function FilterRowSkeleton({ label }: { readonly label: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <div className={styles.chips}>
        {SKELETON_CHIP_WIDTHS.map((width, index) => (
          <Skeleton
            key={index}
            width={`${String(width)}px`}
            height="29px"
            radius="var(--radius-button)"
          />
        ))}
      </div>
    </div>
  );
}
