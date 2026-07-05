import {
  cloneElement, useCallback, useEffect, useId, useMemo,
  type ReactElement, type ReactNode,
} from "react";
import {
  useFloating, autoUpdate, offset, flip, shift, type Placement,
} from "@floating-ui/react-dom";
import { Portal } from "../utils/Portal.js";
import { useControllableState } from "../utils/useControllableState.js";
import { PopoverContext } from "./PopoverContext.js";
import styles from "./popover.module.css";

export interface PopoverProps {
  content: ReactNode;
  /** Trigger element. Receives ref, aria-expanded/haspopup and click-toggle. */
  children: ReactElement<Record<string, unknown>>;
  placement?: Placement;
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Panel takes the trigger's width (for Select-style dropdowns). */
  matchTargetWidth?: boolean;
}

export function Popover({
  content, children, placement = "bottom-start",
  isOpen, defaultIsOpen = false, onOpenChange, matchTargetWidth,
}: PopoverProps) {
  const [open, setOpen] = useControllableState({
    value: isOpen, defaultValue: defaultIsOpen, onChange: onOpenChange,
  });
  const panelId = useId();
  const { refs, floatingStyles } = useFloating({
    placement, open,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  const close = useCallback(() => setOpen(false), [setOpen]);

  // Outside click + Escape (Escape also restores focus to the trigger).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (refs.floating.current?.contains(t) || refs.reference.current instanceof HTMLElement && refs.reference.current.contains(t)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      const r = refs.reference.current;
      if (r instanceof HTMLElement) r.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, refs.floating, refs.reference]);

  const ctx = useMemo(() => ({ close }), [close]);
  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: refs.setReference,
    "aria-expanded": open,
    "aria-haspopup": "true",
    "aria-controls": open ? panelId : undefined,
    onClick: (e: unknown) => {
      (children.props.onClick as ((e: unknown) => void) | undefined)?.(e);
      setOpen(!open);
    },
  });

  return (
    <>
      {trigger}
      {open ? (
        <Portal>
          <div
            ref={refs.setFloating}
            id={panelId}
            className={styles.panel}
            style={{
              ...floatingStyles,
              ...(matchTargetWidth && refs.reference.current instanceof HTMLElement
                ? { width: refs.reference.current.getBoundingClientRect().width }
                : {}),
            }}
          >
            <PopoverContext.Provider value={ctx}>{content}</PopoverContext.Provider>
          </div>
        </Portal>
      ) : null}
    </>
  );
}
