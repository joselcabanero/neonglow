import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./form.module.css";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  intent?: Intent;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { intent = "none", className, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={intent === "danger" ? true : undefined}
      className={cx(styles.input, styles.area, intent !== "none" && styles[intent], className)}
      {...rest}
    />
  );
});
