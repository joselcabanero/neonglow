import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../cx.js";
import styles from "./card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  /** Right-aligned header slot (buttons, tags). */
  actions?: ReactNode;
  sunken?: boolean;
}

export function Card({ title, actions, sunken, className, children, ...rest }: CardProps) {
  return (
    <div className={cx(styles.card, sunken && styles.sunken, className)} {...rest}>
      {title || actions ? (
        <div className={styles.head}>
          {title ? <h3 className={styles.title}>{title}</h3> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </div>
  );
}
