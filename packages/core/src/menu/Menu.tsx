import { useRef, type HTMLAttributes, type KeyboardEvent } from "react";
import { cx } from "../cx.js";
import styles from "./menu.module.css";

export type MenuProps = HTMLAttributes<HTMLUListElement>;

export function Menu({ className, onKeyDown, ...rest }: MenuProps) {
  const ref = useRef<HTMLUListElement>(null);
  const handleKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(e);
    const items = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []
    );
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (i + 1) % items.length;
    else if (e.key === "ArrowUp") next = i <= 0 ? items.length - 1 : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      items[next].focus();
    }
  };
  return <ul role="menu" ref={ref} onKeyDown={handleKeyDown} className={cx(styles.menu, className)} {...rest} />;
}
