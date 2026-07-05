import { useEffect, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import { IconX } from "@neonglow/icons";
import styles from "./dialog.module.css";

export interface DialogProps {
  isOpen: boolean;
  /** Called on Escape, backdrop click and the close button. Parent flips isOpen. */
  onClose: () => void;
  title?: string;
  /** Footer slot, right-aligned. */
  actions?: ReactNode;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, title, actions, children }: DialogProps) {
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
    <dialog ref={ref} className={styles.dialog} onCancel={onCancel} onClick={onBackdropClick}>
      <div className={styles.head}>
        {title ? <h3 className={styles.title}>{title}</h3> : <span />}
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          <IconX size={16} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {actions ? <div className={styles.foot}>{actions}</div> : null}
    </dialog>
  );
}
