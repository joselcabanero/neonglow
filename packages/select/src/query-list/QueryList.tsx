import type { KeyboardEventHandler, ReactNode } from "react";
import type { QueryListCoreOptions } from "../types.js";
import { useQueryList } from "./useQueryList.js";
import { OptionList } from "./OptionList.js";
import styles from "./option-list.module.css";

export interface QueryListProps<T> extends QueryListCoreOptions<T> {
  selected?: T[];
  noResults?: ReactNode;
  withInput?: boolean;
  inputPlaceholder?: string;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (q: string) => void;
  /** Composed BEFORE the engine's key handling (e.g. MultiSelect backspace). */
  onInputKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export function QueryList<T>(props: QueryListProps<T>) {
  const { withInput = true, inputPlaceholder = "Filter…", onInputKeyDown } = props;
  const ql = useQueryList(props);
  return (
    <div className={styles.panel}>
      {withInput ? (
        <input
          className={styles.input}
          role="combobox"
          aria-expanded="true"
          aria-controls={ql.listboxId}
          aria-activedescendant={ql.activeDescendantId}
          aria-autocomplete="list"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- filter input inside a just-opened popover
          autoFocus
          placeholder={inputPlaceholder}
          value={ql.query}
          onChange={(e) => ql.setQuery(e.target.value)}
          onKeyDown={(e) => {
            onInputKeyDown?.(e);
            if (!e.defaultPrevented) ql.handleInputKeyDown(e);
          }}
        />
      ) : null}
      <OptionList
        {...props}
        filtered={ql.filtered}
        activeIndex={ql.activeIndex}
        setActiveIndex={ql.setActiveIndex}
        listboxId={ql.listboxId}
        getOptionId={ql.getOptionId}
        query={ql.query}
      />
    </div>
  );
}
