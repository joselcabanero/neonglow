import type { HTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./button.module.css";

export function ButtonGroup({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="group" className={cx(styles.group, className)} {...rest} />;
}
