import { useCallback, useEffect, useRef } from "react";
import { IconError, IconInfo, IconSuccess, IconWarning, IconX } from "@neonglow/icons";
import { cx } from "../cx.js";
import { Portal } from "../utils/Portal.js";
import { toaster, useToasts, type ToastEntry } from "./toast-store.js";
import styles from "./toast.module.css";

const ICONS = { success: IconSuccess, warning: IconWarning, danger: IconError, info: IconInfo } as const;
const PLACEMENT_CLASS = { top: "top", "top-right": "topRight", "bottom-right": "bottomRight" } as const;

export interface ToasterProps {
  placement?: keyof typeof PLACEMENT_CLASS;
}

function ToastView({ entry }: { entry: ToastEntry }) {
  const { message, intent = "none", timeout = 5000, action } = entry.options;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = useCallback(() => {
    if (timeout > 0) timer.current = setTimeout(() => toaster.dismiss(entry.key), timeout);
  }, [timeout, entry.key]);
  const stop = () => clearTimeout(timer.current);
  useEffect(() => {
    start();
    return stop;
  }, [start]);
  const Icon = intent !== "none" ? ICONS[intent] : null;
  return (
    <div
      role={intent === "danger" ? "alert" : "status"}
      className={cx(styles.toast, intent !== "none" && styles[intent])}
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
    >
      {Icon ? <span className={styles.icon}><Icon size={16} /></span> : null}
      <div className={styles.msg}>{message}</div>
      {action ? (
        <button type="button" className={styles.action} onClick={() => { action.onClick(); toaster.dismiss(entry.key); }}>
          {action.text}
        </button>
      ) : null}
      <button type="button" className={styles.close} aria-label="Dismiss" onClick={() => toaster.dismiss(entry.key)}>
        <IconX size={16} />
      </button>
    </div>
  );
}

export function Toaster({ placement = "top-right" }: ToasterProps) {
  const toasts = useToasts();
  return (
    <Portal>
      <div className={cx(styles.host, styles[PLACEMENT_CLASS[placement]])}>
        {toasts.map((t) => (
          <ToastView key={t.key} entry={t} />
        ))}
      </div>
    </Portal>
  );
}
