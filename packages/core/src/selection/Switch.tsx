import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./selection.module.css";

export interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ label, ...rest }, ref) {
  return (
    <label className={styles.check}>
      <input ref={ref} type="checkbox" role="switch" className={styles.input} {...rest} />
      <span className={styles.track} aria-hidden="true" />
      {label}
    </label>
  );
});
