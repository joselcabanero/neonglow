import type { HTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./divider.module.css";

export function Divider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cx(styles.divider, className)} {...rest} />;
}
