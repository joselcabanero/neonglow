import { useRef, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { IconChevronRight } from "@neonglow/icons";
import { cx } from "../cx.js";
import styles from "./tree.module.css";

export interface TreeNode<T = unknown> {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Right-aligned mono slot, e.g. a MOIC or count. */
  secondaryLabel?: ReactNode;
  childNodes?: TreeNode<T>[];
  isExpanded?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  nodeData?: T;
}

export interface TreeProps<T = unknown> {
  contents: TreeNode<T>[];
  onNodeClick?: (node: TreeNode<T>, path: number[]) => void;
  onNodeExpand?: (node: TreeNode<T>, path: number[]) => void;
  onNodeCollapse?: (node: TreeNode<T>, path: number[]) => void;
}

function Row<T>({ node, path, level, props, instanceId, tabbableId, onRowFocus }: {
  node: TreeNode<T>; path: number[]; level: number; props: TreeProps<T>;
  instanceId: string;
  tabbableId: string | undefined;
  onRowFocus: (id: string) => void;
}) {
  const hasChildren = !!node.childNodes?.length;
  const expanded = hasChildren ? !!node.isExpanded : undefined;
  const labelId = `${instanceId}-label-${node.id}`;

  const toggle = () => {
    if (!hasChildren || node.disabled) return;
    (expanded ? props.onNodeCollapse : props.onNodeExpand)?.(node, path);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter") {
      e.preventDefault();
      props.onNodeClick?.(node, path);
    } else if (e.key === "ArrowRight" && hasChildren && !expanded) {
      e.preventDefault();
      props.onNodeExpand?.(node, path);
    } else if (e.key === "ArrowLeft" && hasChildren && expanded) {
      e.preventDefault();
      props.onNodeCollapse?.(node, path);
    }
  };

  return (
    <li
      role="treeitem"
      aria-labelledby={labelId}
      aria-expanded={expanded}
      aria-selected={!!node.isSelected}
      aria-level={level}
      aria-disabled={node.disabled || undefined}
      tabIndex={tabbableId === node.id ? 0 : -1}
      className={cx(styles.item, node.isSelected && styles.selected, node.disabled && styles.disabled)}
      onKeyDown={onKeyDown}
      onFocus={(e) => { if (e.target === e.currentTarget) onRowFocus(node.id); }}
    >
      <div
        className={styles.row}
        onClick={() => {
          if (!node.disabled) props.onNodeClick?.(node, path);
        }}
      >
        {hasChildren ? (
          <span
            data-tree-chevron
            data-expanded={expanded}
            className={styles.chevron}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            <IconChevronRight size={16} />
          </span>
        ) : (
          <span className={styles.chevronSpacer} />
        )}
        {node.icon ? <span className={styles.icon}>{node.icon}</span> : null}
        <span id={labelId} className={styles.label}>{node.label}</span>
        {node.secondaryLabel != null ? <span className={styles.secondary}>{node.secondaryLabel}</span> : null}
      </div>
      {hasChildren && expanded ? (
        <ul role="group" className={styles.group}>
          {node.childNodes?.map((child, i) => (
            <Row key={child.id} node={child} path={[...path, i]} level={level + 1} props={props} instanceId={instanceId} tabbableId={tabbableId} onRowFocus={onRowFocus} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function Tree<T = unknown>(props: TreeProps<T>) {
  const ref = useRef<HTMLUListElement>(null);
  const instanceId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const tabbableId = activeId ?? props.contents[0]?.id;
  // Up/Down move focus across all visible treeitems (collapsed children are unmounted).
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(ref.current?.querySelectorAll<HTMLLIElement>('[role="treeitem"]') ?? []);
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLLIElement);
    const next = e.key === "ArrowDown" ? Math.min(i + 1, items.length - 1) : Math.max(i - 1, 0);
    e.preventDefault();
    items[next].focus();
  };
  return (
    <ul role="tree" ref={ref} className={styles.tree} onKeyDown={onKeyDown}>
      {props.contents.map((node, i) => (
        <Row key={node.id} node={node} path={[i]} level={1} props={props} instanceId={instanceId} tabbableId={tabbableId} onRowFocus={setActiveId} />
      ))}
    </ul>
  );
}
