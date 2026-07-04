import type { ReactNode } from "react";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./form.module.css";

export interface FormGroupProps {
  label: string;
  /** id of the control inside — wires <label for>. */
  labelFor?: string;
  helperText?: string;
  intent?: Intent;
  children: ReactNode;
}

export function FormGroup({ label, labelFor, helperText, intent = "none", children }: FormGroupProps) {
  return (
    <div className={styles.group}>
      <label className={styles.label} htmlFor={labelFor}>{label}</label>
      {children}
      {helperText ? (
        <p className={cx(styles.helper, intent === "danger" && styles.helperDanger)}>{helperText}</p>
      ) : null}
    </div>
  );
}
