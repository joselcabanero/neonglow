import type { HTMLAttributes } from "react";
import { IconX } from "@neonglow/icons";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./tag.module.css";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  intent?: Intent;
  /** Brand-accent tag (green). Reserved for earned moments, e.g. "Exited". */
  accent?: boolean;
  onRemove?: () => void;
}

export function Tag({ intent = "none", accent, onRemove, className, children, ...rest }: TagProps) {
  const label = typeof children === "string" ? `Remove ${children}` : "Remove";
  return (
    <span
      className={cx(styles.tag, intent !== "none" && styles[intent], accent && styles.accent, className)}
      {...rest}
    >
      {children}
      {onRemove ? (
        <button type="button" className={styles.remove} aria-label={label} onClick={onRemove}>
          <IconX size={16} />
        </button>
      ) : null}
    </span>
  );
}
