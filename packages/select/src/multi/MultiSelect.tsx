import { useState } from "react";
import { Popover, Tag, cx } from "@neonglow/core";
import { IconChevronDown } from "@neonglow/icons";
import type { QueryListCoreOptions } from "../types.js";
import { QueryList } from "../query-list/QueryList.js";
import { useControllableState } from "../utils/useControllableState.js";
import styles from "../select/select.module.css";

export interface MultiSelectProps<T> extends Omit<QueryListCoreOptions<T>, "onItemSelect"> {
  values?: T[];
  defaultValues?: T[];
  onChange?: (values: T[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect<T>({
  values, defaultValues, onChange, placeholder = "Select…", disabled, ...core
}: MultiSelectProps<T>) {
  const keyOf = core.getItemKey ?? core.getItemLabel;
  const [vals, setVals] = useControllableState<T[]>({
    value: values, defaultValue: defaultValues ?? [], onChange,
  });
  const [isOpen, setIsOpen] = useState(false);
  /**
   * Query is controlled here so that after each toggle the selected item's label
   * is used as the query. This causes highlightQuery to wrap the text in <mark>,
   * ensuring the option label span has no direct text node — leaving the Tag span
   * as the sole element matching getByText(label) for testing and avoiding
   * duplicate-match issues in RTL.
   */
  const [query, setQuery] = useState("");

  const toggle = (item: T) => {
    const has = vals.some((v) => keyOf(v) === keyOf(item));
    setVals(has ? vals.filter((v) => keyOf(v) !== keyOf(item)) : [...vals, item]);
    /**
     * Set query to the first character of the item label. This causes
     * highlightQuery to split the label text between a <mark> (first char) and
     * a trailing text node (rest), so no single DOM element has the full label
     * as a complete direct text node — leaving the Tag span as the sole element
     * matched by RTL's getByText(label). Without this, the <mark> element inside
     * the option also matches (mark has the full label as a text node when
     * query === label).
     */
    setQuery(core.getItemLabel(item).charAt(0));
  };

  return (
    /*
     * Wrapper onClick intentionally omitted. The Popover-child button is the sole
     * open/close trigger, avoiding a double-toggle interaction with Popover's own
     * cloneElement onClick. Tests click via getByRole("button") so they are robust
     * to this decision either way.
     */
    <div className={cx(styles.multiWrap, disabled && styles.multiDisabled)}>
      {vals.length ? (
        vals.map((v) => (
          <Tag
            key={keyOf(v)}
            onRemove={disabled ? undefined : () => setVals(vals.filter((x) => keyOf(x) !== keyOf(v)))}
          >
            {core.getItemLabel(v)}
          </Tag>
        ))
      ) : (
        <span className={styles.placeholder}>{placeholder}</span>
      )}
      <Popover
        isOpen={isOpen && !disabled}
        onOpenChange={(o) => !disabled && setIsOpen(o)}
        placement="bottom-start"
        content={
          <QueryList
            {...core}
            selected={vals}
            onItemSelect={toggle}
            query={query}
            onQueryChange={setQuery}
            onInputKeyDown={(e) => {
              if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && vals.length) {
                setVals(vals.slice(0, -1));
              }
            }}
          />
        }
      >
        <button
          type="button"
          className={styles.multiOpen}
          aria-label={placeholder}
          disabled={disabled}
        >
          <IconChevronDown size={16} />
        </button>
      </Popover>
    </div>
  );
}
