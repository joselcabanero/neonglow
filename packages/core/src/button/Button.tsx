import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. `primary` is the single accent action on a view. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", className, type = "button", ...rest },
  ref
) {
  return (
    <button ref={ref} type={type} className={cx(styles.btn, styles[variant], className)} {...rest} />
  );
});
