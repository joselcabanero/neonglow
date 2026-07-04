import styles from "./spinner.module.css";

export interface SpinnerProps {
  /** Pixel size of the spinner. */
  size?: number;
  /** Accessible label announced to screen readers. */
  label?: string;
}

export function Spinner({ size = 20, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={styles.spinner}>
      <svg className={styles.svg} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 1-6.36 2.64" />
      </svg>
    </span>
  );
}
