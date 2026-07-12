import type { KeyboardEvent, ReactNode } from 'react';

import { cn } from '../../lib';
import { Icon, type IconName } from '../icon';

import styles from './tabs.module.css';

export interface TabItem {
  readonly id: string;
  readonly label: ReactNode;
  readonly icon?: IconName;
}

export interface TabsProps {
  readonly tabs: readonly TabItem[];
  readonly value: string;
  readonly onChange: (id: string) => void;
  readonly 'aria-label'?: string;
  readonly className?: string;
}

/**
 * Полоса вкладок (role=tablist). Управляется снаружи; стрелки/Home/End
 * перемещают активную вкладку, в табуляции участвует только выбранная.
 */
export function Tabs({ tabs, value, onChange, className, 'aria-label': ariaLabel }: TabsProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === value);
    if (currentIndex === -1) {
      return;
    }

    const lastIndex = tabs.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (nextTab) {
      event.preventDefault();
      onChange(nextTab.id);
    }
  };

  return (
    <div role="tablist" aria-label={ariaLabel} className={cn(styles.tablist, className)}>
      {tabs.map((tab) => {
        const selected = tab.id === value;

        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={cn(styles.tab, selected && styles.selected)}
            onClick={() => {
              onChange(tab.id);
            }}
            onKeyDown={handleKeyDown}
          >
            {tab.icon ? <Icon name={tab.icon} size={15} /> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
