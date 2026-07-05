import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../cx.js";
import { useControllableState } from "../utils/useControllableState.js";
import styles from "./tabs.module.css";

export interface TabDef {
  id: string;
  title: ReactNode;
  disabled?: boolean;
  panel?: ReactNode;
}

export interface TabsProps {
  tabs: TabDef[];
  selectedId?: string;
  defaultSelectedId?: string;
  onChange?: (id: string) => void;
}

export function Tabs({ tabs, selectedId, defaultSelectedId, onChange }: TabsProps) {
  const uid = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useControllableState({
    value: selectedId,
    defaultValue: defaultSelectedId ?? tabs.find((t) => !t.disabled)?.id ?? "",
    onChange,
  });

  const enabled = tabs.filter((t) => !t.disabled);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = enabled.findIndex((t) => t.id === sel);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % enabled.length;
    else if (e.key === "ArrowLeft") next = i <= 0 ? enabled.length - 1 : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = enabled.length - 1;
    if (next >= 0) {
      e.preventDefault();
      const id = enabled[next].id;
      setSel(id);
      listRef.current
        ?.querySelector<HTMLButtonElement>(`[id="${uid}-tab-${id}"]`)
        ?.focus();
    }
  };

  return (
    <div>
      <div role="tablist" ref={listRef} className={styles.list} onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={t.id === sel}
            aria-controls={t.panel != null ? `${uid}-panel-${t.id}` : undefined}
            disabled={t.disabled}
            tabIndex={t.id === sel ? 0 : -1}
            className={cx(styles.tab, t.id === sel && styles.active)}
            onClick={() => setSel(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>
      {tabs.filter((t) => t.panel != null).map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={t.id !== sel}
          className={styles.panel}
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
