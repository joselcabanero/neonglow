import styles from "./menu.module.css";

export function MenuDivider() {
  return (
    <li role="none">
      <hr role="separator" className={styles.divider} />
    </li>
  );
}
