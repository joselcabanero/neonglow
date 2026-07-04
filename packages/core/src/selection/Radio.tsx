import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./selection.module.css";

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ label, ...rest }, ref) {
  return (
    <label className={styles.check}>
      <input ref={ref} type="radio" className={styles.input} {...rest} />
      <span className={cx(styles.box, styles.round)} aria-hidden="true"><span className={styles.dot} /></span>
      {label}
    </label>
  );
});
