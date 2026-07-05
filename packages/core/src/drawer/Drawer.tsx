import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import { IconX } from "@neonglow/icons";
import { cx } from "../cx.js";
import styles from "./drawer.module.css";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "right" | "left" | "bottom";
  /** CSS length: width for left/right, height for bottom. */
  size?: string;
  children: ReactNode;
}

export function Drawer({ isOpen, onClose, title, side = "right", size, children }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Open-only sync: when isOpen flips false the component returns null and the
  // <dialog> unmounts, which removes it from the top layer. We never call
  // close() — closing is unmount-by-design (parent owns state via onClose).
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) {
      if (typeof d.showModal === "function") {
        d.showModal();
      } else {
        d.setAttribute("open", ""); // jsdom (<26) lacks showModal
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault(); // parent owns state; it will unmount us
    onClose();
  };
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={cx(styles.drawer, styles[side])}
      style={size ? ({ "--drawer-size": size } as CSSProperties) : undefined}
      onCancel={onCancel}
      onClick={onBackdropClick}
    >
      <div className={styles.head}>
        {title ? <h3 className={styles.title}>{title}</h3> : <span />}
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          <IconX size={16} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
