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
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) {
      // Try to use showModal, but fall back to setting open attribute for jsdom
      try {
        d.showModal();
      } catch {
        d.setAttribute("open", "");
      }
    } else if (!isOpen && d.open) {
      d.close();
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
