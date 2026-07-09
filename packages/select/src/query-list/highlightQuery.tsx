import type { ReactNode } from "react";
import styles from "./option-list.module.css";

/** Wraps the first case-insensitive occurrence of query in a styled <mark>. */
export function highlightQuery(label: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return label;
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return label;
  return (
    <>
      {label.slice(0, i)}
      <mark className={styles.mark}>{label.slice(i, i + q.length)}</mark>
      {label.slice(i + q.length)}
    </>
  );
}
