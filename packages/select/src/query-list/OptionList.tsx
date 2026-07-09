import type { ReactNode } from "react";
import { cx } from "@neonglow/core";
import { IconCheck } from "@neonglow/icons";
import type { QueryListCoreOptions } from "../types.js";
import { highlightQuery } from "./highlightQuery.js";
import styles from "./option-list.module.css";

export interface OptionListProps<T> extends QueryListCoreOptions<T> {
  filtered: T[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  listboxId: string;
  getOptionId: (i: number) => string;
  selected?: T[];
  noResults?: ReactNode;
  /** Current query — used to highlight matches. */
  query?: string;
  /** Accessible name for the listbox element. */
  "aria-label"?: string;
}

export function OptionList<T>({
  filtered, activeIndex, setActiveIndex, listboxId, getOptionId,
  selected, noResults, query = "",
  getItemLabel, getItemKey, itemDisabled, onItemSelect,
  "aria-label": ariaLabel,
}: OptionListProps<T>) {
  const keyOf = getItemKey ?? getItemLabel;
  return (
    <ul role="listbox" id={listboxId} aria-label={ariaLabel} className={styles.listbox}>
      {filtered.length === 0 ? (
        <li role="presentation" className={styles.noResults}>{noResults ?? "No results."}</li>
      ) : (
        filtered.map((item, i) => {
          const disabled = itemDisabled?.(item) ?? false;
          const isSelected = selected?.some((s) => keyOf(s) === keyOf(item)) ?? false;
          return (
            <li
              key={keyOf(item)}
              id={getOptionId(i)}
              role="option"
              aria-label={getItemLabel(item)}
              aria-selected={isSelected}
              aria-disabled={disabled || undefined}
              className={cx(styles.option, i === activeIndex && styles.active, disabled && styles.disabled)}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => {
                if (!disabled) onItemSelect(item);
              }}
            >
              <span className={styles.check}>{isSelected ? <IconCheck size={16} /> : null}</span>
              <span className={styles.label}>{highlightQuery(getItemLabel(item), query)}</span>
            </li>
          );
        })
      )}
    </ul>
  );
}
