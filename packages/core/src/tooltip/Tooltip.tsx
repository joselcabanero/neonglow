import { cloneElement, useId, type ReactElement } from "react";
import styles from "./tooltip.module.css";

export interface TooltipProps {
  /** Short plain-text help. One clause; middot-separated facts welcome. */
  content: string;
  children: ReactElement;
}

export function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  return (
    <span className={styles.wrap}>
      {cloneElement(children, { "aria-describedby": id })}
      <span role="tooltip" id={id} className={styles.tip}>{content}</span>
    </span>
  );
}
