import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { Intent } from "../types.js";

export interface ToastOptions {
  message: ReactNode;
  intent?: Intent;
  /** ms until auto-dismiss. 0 = sticky. Default 5000. */
  timeout?: number;
  action?: { text: string; onClick: () => void };
}

export interface ToasterInstance {
  show(options: ToastOptions): string;
  dismiss(key: string): void;
  clear(): void;
}

export interface ToastEntry {
  key: string;
  options: ToastOptions;
}

const MAX_VISIBLE = 5;
let toasts: ToastEntry[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const toaster: ToasterInstance = {
  show(options) {
    const key = `ng-toast-${++counter}`;
    toasts = [...toasts, { key, options }].slice(-MAX_VISIBLE);
    emit();
    return key;
  },
  dismiss(key) {
    toasts = toasts.filter((t) => t.key !== key);
    emit();
  },
  clear() {
    toasts = [];
    emit();
  },
};

export function useToasts(): ToastEntry[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => toasts
  );
}
