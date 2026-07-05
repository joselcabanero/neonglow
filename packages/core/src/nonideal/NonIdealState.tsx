import type { ReactNode } from "react";
import styles from "./nonideal.module.css";

export interface NonIdealStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /** An empty screen is an invitation to act. */
  action?: ReactNode;
}

export function NonIdealState({ icon, title, description, action }: NonIdealStateProps) {
  return (
    <div className={styles.root}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.desc}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
