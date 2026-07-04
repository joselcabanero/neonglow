import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from "react";
import { IconCheck, IconDash } from "@neonglow/icons";
import styles from "./selection.module.css";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate = false, ...rest },
  outerRef
) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className={styles.check}>
      <input
        type="checkbox" className={styles.input}
        ref={(el) => {
          innerRef.current = el;
          if (typeof outerRef === "function") outerRef(el);
          else if (outerRef) outerRef.current = el;
        }}
        {...rest}
      />
      <span className={styles.box} aria-hidden="true">
        <span className={styles.mark}>{indeterminate ? <IconDash size={16} /> : <IconCheck size={16} />}</span>
      </span>
      {label}
    </label>
  );
});
