import { useState } from "react";
import { Popover, cx } from "@neonglow/core";
import { IconChevronDown } from "@neonglow/icons";
import type { QueryListCoreOptions } from "../types.js";
import { QueryList } from "../query-list/QueryList.js";
import { useControllableState } from "../utils/useControllableState.js";
import styles from "./select.module.css";

export interface SelectProps<T> extends Omit<QueryListCoreOptions<T>, "onItemSelect"> {
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (item: T) => void;
  placeholder?: string;
  filterable?: boolean;
  disabled?: boolean;
}

export function Select<T>({
  value, defaultValue = null, onChange,
  placeholder = "Select…", filterable = true, disabled,
  ...core
}: SelectProps<T>) {
  const [sel, setSel] = useControllableState<T | null>({
    value, defaultValue,
    onChange: onChange as ((v: T | null) => void) | undefined,
  });
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen && !disabled}
      onOpenChange={(o) => !disabled && setIsOpen(o)}
      matchTargetWidth
      placement="bottom-start"
      content={
        <QueryList
          {...core}
          withInput={filterable}
          selected={sel != null ? [sel] : []}
          onItemSelect={(item) => {
            setSel(item);
            setIsOpen(false);
          }}
        />
      }
    >
      <button type="button" className={styles.trigger} disabled={disabled}>
        <span className={sel != null ? styles.value : styles.placeholder}>
          {sel != null ? core.getItemLabel(sel) : placeholder}
        </span>
        <span className={styles.chevron}><IconChevronDown size={16} /></span>
      </button>
    </Popover>
  );
}
