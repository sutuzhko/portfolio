import type { KeyboardEvent, ReactNode } from 'react';

import { cn } from '../../lib';

import styles from './segmented.module.css';

export interface SegmentedOption<V extends string> {
  readonly label: ReactNode;
  readonly value: V;
}

export interface SegmentedProps<V extends string> {
  readonly options: readonly SegmentedOption<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
  readonly 'aria-label'?: string;
  readonly className?: string;
}

/**
 * Сегментированный контрол (RU/EN, Dark/Light, edit/preview).
 * Семантика radiogroup: стрелки переключают сегменты, активный — в табуляции.
 */
export function Segmented<V extends string>({
  options,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: SegmentedProps<V>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = options.findIndex((option) => option.value === value);
    if (currentIndex === -1) {
      return;
    }

    const lastIndex = options.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    }

    if (nextIndex === null) {
      return;
    }

    const nextOption = options[nextIndex];
    if (nextOption) {
      event.preventDefault();
      onChange(nextOption.value);
    }
  };

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn(styles.group, className)}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={cn(styles.option, selected && styles.selected)}
            onClick={() => {
              onChange(option.value);
            }}
            onKeyDown={handleKeyDown}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
