import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./form.module.css";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  intent?: Intent;
  /** Tabular monospace — for money flows and numerics. */
  mono?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { intent = "none", mono, className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={intent === "danger" ? true : undefined}
      className={cx(styles.input, mono && styles.mono, intent !== "none" && styles[intent], className)}
      {...rest}
    />
  );
});
