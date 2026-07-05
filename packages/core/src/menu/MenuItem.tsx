import { useContext, type ReactNode } from "react";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import { PopoverContext } from "../popover/PopoverContext.js";
import styles from "./menu.module.css";

export interface MenuItemProps {
  text: ReactNode;
  icon?: ReactNode;
  /** Right-aligned shortcut hint, e.g. "⌘O". Display only. */
  kbd?: string;
  intent?: Intent;
  disabled?: boolean;
  onSelect?: () => void;
}

export function MenuItem({ text, icon, kbd, intent = "none", disabled, onSelect }: MenuItemProps) {
  const popover = useContext(PopoverContext);
  return (
    <li role="none" className={styles.li}>
      <button
        type="button"
        role="menuitem"
        disabled={disabled}
        className={cx(styles.item, intent === "danger" && styles.danger)}
        onClick={() => {
          onSelect?.();
          popover?.close();
        }}
      >
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        {text}
        {kbd ? <span className={styles.kbd}>{kbd}</span> : null}
      </button>
    </li>
  );
}
