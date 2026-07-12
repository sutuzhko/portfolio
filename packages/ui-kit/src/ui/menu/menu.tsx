import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { cn } from '../../lib';
import { Icon, type IconName } from '../icon';

import styles from './menu.module.css';

interface MenuContextValue {
  readonly close: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

interface RenderTriggerArgs {
  readonly open: boolean;
  readonly toggle: () => void;
  /** Атрибуты, которые нужно навесить на кнопку-триггер (a11y-связка с панелью). */
  readonly triggerProps: {
    readonly 'aria-haspopup': 'menu';
    readonly 'aria-expanded': boolean;
    // Ссылку на панель держим только когда она в DOM (открыта), иначе битый id.
    readonly 'aria-controls'?: string;
  };
}

export interface MenuProps {
  /** Рендерит кнопку-триггер: навесьте `triggerProps` и вызовите `toggle`. */
  readonly renderTrigger: (args: RenderTriggerArgs) => ReactNode;
  /** Пункты меню (`MenuItem`). */
  readonly children: ReactNode;
  /** Выравнивание панели относительно триггера. */
  readonly align?: 'start' | 'end';
  readonly ariaLabel?: string;
  readonly className?: string;
}

/**
 * Выпадающее меню-оверлей. Управляет своим открытием, закрывается по Escape и
 * клику вне, возвращает фокус на триггер. Клавиши ↑/↓/Home/End двигают фокус по
 * пунктам. Презентационный: действия пунктов задаёт потребитель.
 */
export function Menu({
  renderTrigger,
  children,
  align = 'start',
  ariaLabel,
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => {
    setOpen(false);
  }, []);
  const toggle = useCallback(() => {
    setOpen((value) => !value);
  }, []);

  const focusTrigger = () =>
    wrapperRef.current?.querySelector<HTMLButtonElement>('button')?.focus();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (wrapperRef.current && target instanceof Node && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        focusTrigger();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    }
  }, [open]);

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = panelRef.current
      ? Array.from(panelRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'))
      : [];
    if (items.length === 0) {
      return;
    }

    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const currentIndex = active ? items.indexOf(active) : -1;
    const lastIndex = items.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
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

    event.preventDefault();
    items[nextIndex]?.focus();
  };

  return (
    <div ref={wrapperRef} className={cn(styles.menu, className)}>
      {renderTrigger({
        open,
        toggle,
        triggerProps: {
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': open ? panelId : undefined,
        },
      })}
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={ariaLabel}
          tabIndex={-1}
          className={cn(styles.panel, align === 'end' && styles.alignEnd)}
          onKeyDown={handlePanelKeyDown}
        >
          <MenuContext.Provider value={{ close }}>{children}</MenuContext.Provider>
        </div>
      ) : null}
    </div>
  );
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon?: IconName;
  /** Основное действие — зелёная акцентная кнопка (по центру). */
  readonly primary?: boolean;
  /** Вторичное действие — обведённая кнопка по центру (напр. «Личный кабинет»). */
  readonly bordered?: boolean;
  /** Опасное действие (выход, удаление) — красный акцент. */
  readonly danger?: boolean;
}

/** Пункт меню. По клику вызывает обработчик и закрывает меню. */
export function MenuItem({
  icon,
  primary = false,
  bordered = false,
  danger = false,
  className,
  onClick,
  children,
  ...rest
}: MenuItemProps) {
  const context = useContext(MenuContext);

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={cn(
        styles.item,
        primary && styles.primary,
        bordered && styles.bordered,
        danger && styles.danger,
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        context?.close();
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={15} className={styles.itemIcon} /> : null}
      {children}
    </button>
  );
}
