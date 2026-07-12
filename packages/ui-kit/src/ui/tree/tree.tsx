import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '../../lib';
import { Icon } from '../icon';

import styles from './tree.module.css';

export interface TreeNode {
  readonly id: string;
  readonly label: ReactNode;
  readonly type: 'folder' | 'article';
  readonly count?: number;
  readonly children?: readonly TreeNode[];
}

export interface TreeProps {
  readonly nodes: readonly TreeNode[];
  readonly selectedId?: string;
  readonly onSelect: (id: string) => void;
  readonly defaultExpandedIds?: readonly string[];
  readonly 'aria-label'?: string;
  readonly className?: string;
}

interface VisibleNode {
  readonly node: TreeNode;
  readonly depth: number;
}

function flattenVisible(
  nodes: readonly TreeNode[],
  expanded: ReadonlySet<string>,
  depth = 0,
  acc: VisibleNode[] = [],
): VisibleNode[] {
  for (const node of nodes) {
    acc.push({ node, depth });
    if (node.type === 'folder' && node.children && expanded.has(node.id)) {
      flattenVisible(node.children, expanded, depth + 1, acc);
    }
  }
  return acc;
}

/**
 * Дерево папок и статей (база знаний, кабинет). Выбор управляется снаружи,
 * раскрытие — внутреннее. Доступная навигация: стрелки, Home/End, Enter/Space.
 */
export function Tree({
  nodes,
  selectedId,
  onSelect,
  defaultExpandedIds,
  className,
  'aria-label': ariaLabel,
}: TreeProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(defaultExpandedIds ?? []),
  );
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const visible = flattenVisible(nodes, expanded);
  const focusId = (id: string) => itemRefs.current.get(id)?.focus();

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, node: TreeNode, depth: number) => {
    event.stopPropagation();
    const index = visible.findIndex((item) => item.node.id === node.id);
    const isFolder = node.type === 'folder';
    const isOpen = expanded.has(node.id);

    switch (event.key) {
      case 'ArrowDown': {
        const next = visible[index + 1];
        if (next) {
          event.preventDefault();
          focusId(next.node.id);
        }
        break;
      }
      case 'ArrowUp': {
        const prev = visible[index - 1];
        if (prev) {
          event.preventDefault();
          focusId(prev.node.id);
        }
        break;
      }
      case 'ArrowRight': {
        if (isFolder) {
          event.preventDefault();
          if (!isOpen) {
            toggle(node.id);
          } else {
            const child = visible[index + 1];
            if (child && child.depth > depth) {
              focusId(child.node.id);
            }
          }
        }
        break;
      }
      case 'ArrowLeft': {
        if (isFolder && isOpen) {
          event.preventDefault();
          toggle(node.id);
        } else {
          for (let i = index - 1; i >= 0; i -= 1) {
            const candidate = visible[i];
            if (candidate && candidate.depth === depth - 1) {
              event.preventDefault();
              focusId(candidate.node.id);
              break;
            }
          }
        }
        break;
      }
      case 'Home': {
        const first = visible[0];
        if (first) {
          event.preventDefault();
          focusId(first.node.id);
        }
        break;
      }
      case 'End': {
        const last = visible[visible.length - 1];
        if (last) {
          event.preventDefault();
          focusId(last.node.id);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (isFolder) {
          toggle(node.id);
        } else {
          onSelect(node.id);
        }
        break;
      }
      default:
        break;
    }
  };

  const tabbableId =
    selectedId && visible.some((item) => item.node.id === selectedId)
      ? selectedId
      : visible[0]?.node.id;

  const renderList = (list: readonly TreeNode[], depth: number): ReactNode =>
    list.map((node) => {
      const isFolder = node.type === 'folder';
      const isOpen = expanded.has(node.id);
      const selected = node.id === selectedId;

      return (
        <li
          key={node.id}
          ref={(element) => {
            const map = itemRefs.current;
            if (element) {
              map.set(node.id, element);
            } else {
              map.delete(node.id);
            }
          }}
          role="treeitem"
          aria-level={depth + 1}
          aria-selected={selected}
          aria-expanded={isFolder ? isOpen : undefined}
          tabIndex={node.id === tabbableId ? 0 : -1}
          className={cn(styles.item, selected && styles.selected)}
          onClick={(event) => {
            event.stopPropagation();
            if (isFolder) {
              toggle(node.id);
            } else {
              onSelect(node.id);
            }
          }}
          onKeyDown={(event) => {
            handleKeyDown(event, node, depth);
          }}
        >
          <div className={styles.row} style={{ paddingLeft: depth * 18 + 10 }}>
            {isFolder ? (
              <Icon
                name="chevron-right"
                size={13}
                className={cn(styles.caret, isOpen && styles.caretOpen)}
              />
            ) : null}
            <Icon
              name={isFolder ? 'folder' : 'file'}
              size={isFolder ? 15 : 13}
              className={isFolder ? styles.folderIcon : styles.fileIcon}
            />
            <span className={styles.label}>{node.label}</span>
            {isFolder && node.count !== undefined ? (
              <span className={styles.count}>{node.count}</span>
            ) : null}
          </div>
          {isFolder && node.children && isOpen ? (
            <ul role="group" className={styles.group}>
              {renderList(node.children, depth + 1)}
            </ul>
          ) : null}
        </li>
      );
    });

  return (
    <ul role="tree" aria-label={ariaLabel} className={cn(styles.tree, className)}>
      {renderList(nodes, 0)}
    </ul>
  );
}
