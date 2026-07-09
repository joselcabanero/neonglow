import { useState } from "react";
import { Popover, TextInput } from "@neonglow/core";
import type { QueryListCoreOptions } from "../types.js";
import { useQueryList } from "../query-list/useQueryList.js";
import { OptionList } from "../query-list/OptionList.js";
import { useControllableState } from "../utils/useControllableState.js";

export interface SuggestProps<T> extends Omit<QueryListCoreOptions<T>, "onItemSelect"> {
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (item: T) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function Suggest<T>({
  value, defaultValue = null, onChange, placeholder = "Search…", ariaLabel, ...core
}: SuggestProps<T>) {
  const [sel, setSel] = useControllableState<T | null>({
    value, defaultValue,
    onChange: onChange as ((v: T | null) => void) | undefined,
  });
  const [isOpen, setIsOpen] = useState(false);
  const select = (item: T) => {
    setSel(item);
    setIsOpen(false);
  };
  const ql = useQueryList({ ...core, onItemSelect: select });
  const shown = isOpen ? ql.query : sel != null ? core.getItemLabel(sel) : "";

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      matchTargetWidth
      placement="bottom-start"
      content={
        <OptionList
          {...core}
          onItemSelect={select}
          filtered={ql.filtered}
          activeIndex={ql.activeIndex}
          setActiveIndex={ql.setActiveIndex}
          listboxId={ql.listboxId}
          getOptionId={ql.getOptionId}
          query={ql.query}
          selected={sel != null ? [sel] : []}
        />
      }
    >
      <TextInput
        role="combobox"
        aria-label={ariaLabel || placeholder}
        title={ariaLabel || placeholder}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={isOpen ? ql.listboxId : undefined}
        aria-activedescendant={isOpen ? ql.activeDescendantId : undefined}
        placeholder={placeholder}
        value={shown}
        onChange={(e) => {
          ql.setQuery(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={(e) => {
          if (isOpen) ql.handleInputKeyDown(e);
          else if (e.key === "ArrowDown") setIsOpen(true);
        }}
      />
    </Popover>
  );
}
