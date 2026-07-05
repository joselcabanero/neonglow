import { IconChevronRight } from "@neonglow/icons";
import styles from "./breadcrumbs.module.css";

export interface BreadcrumbItem {
  text: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumbs" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.text}-${i}`} className={styles.item}>
              {isLast ? (
                <span className={styles.current} aria-current="page">{item.text}</span>
              ) : item.href ? (
                <a className={styles.link} href={item.href} onClick={item.onClick}>{item.text}</a>
              ) : (
                <button type="button" className={styles.link} onClick={item.onClick}>{item.text}</button>
              )}
              {!isLast ? <span className={styles.sep} aria-hidden="true"><IconChevronRight size={16} /></span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
