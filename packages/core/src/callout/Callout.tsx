import type { HTMLAttributes } from "react";
import { IconError, IconInfo, IconSuccess, IconWarning } from "@neonglow/icons";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./callout.module.css";

const ICONS = { success: IconSuccess, warning: IconWarning, danger: IconError, info: IconInfo } as const;

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  intent?: Intent;
  title?: string;
}

export function Callout({ intent = "none", title, className, children, ...rest }: CalloutProps) {
  const Icon = intent !== "none" ? ICONS[intent] : null;
  return (
    <div className={cx(styles.callout, intent !== "none" && styles[intent], className)} {...rest}>
      {Icon ? <span className={styles.icon}><Icon size={20} /></span> : null}
      <div>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
