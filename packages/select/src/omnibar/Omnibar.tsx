import { useEffect, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import type { QueryListCoreOptions } from "../types.js";
import { useQueryList } from "../query-list/useQueryList.js";
import { OptionList } from "../query-list/OptionList.js";
import { useControllableState } from "../utils/useControllableState.js";
import styles from "./omnibar.module.css";

export interface OmnibarProps<T> extends QueryListCoreOptions<T> {
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** "mod+k" (default) — mod = Cmd or Ctrl. null disables the global hotkey. */
  hotkey?: string | null;
  placeholder?: string;
  noResults?: ReactNode;
}

export function Omnibar<T>({
  isOpen: isOpenProp, defaultIsOpen = false, onOpenChange,
  hotkey = "mod+k", placeholder = "Search…", noResults,
  ...core
}: OmnibarProps<T>) {
  const [isOpen, setIsOpen] = useControllableState({
    value: isOpenProp, defaultValue: defaultIsOpen, onChange: onOpenChange,
  });
  const ql = useQueryList({
    ...core,
    onItemSelect: (item) => {
      core.onItemSelect(item);
      setIsOpen(false);
    },
  });
  const { setQuery, setActiveIndex } = ql;

  // Global hotkey while mounted.
  useEffect(() => {
    if (!hotkey) return;
    const [modPart, keyPart] = hotkey.split("+");
    const needsMod = modPart === "mod";
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === keyPart && (!needsMod || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey, setIsOpen]);

  // Fresh query every open.
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen, setQuery, setActiveIndex]);

  const ref = useRef<HTMLDialogElement>(null);
  // Open-only sync; closing is unmount-by-design (mirrors core Dialog).
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) {
      if (typeof d.showModal === "function") d.showModal();
      else d.setAttribute("open", ""); // jsdom (<26) lacks showModal
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) setIsOpen(false);
  };

  return (
    <dialog ref={ref} className={styles.dialog} aria-label={placeholder} onCancel={onCancel} onClick={onBackdropClick}>
      <input
        className={styles.input}
        role="combobox"
        aria-expanded="true"
        aria-controls={ql.listboxId}
        aria-activedescendant={ql.activeDescendantId}
        aria-autocomplete="list"
        // eslint-disable-next-line jsx-a11y/no-autofocus -- primary affordance of a just-opened command bar
        autoFocus
        placeholder={placeholder}
        value={ql.query}
        onChange={(e) => ql.setQuery(e.target.value)}
        onKeyDown={ql.handleInputKeyDown}
      />
      <div className={styles.results}>
        <OptionList
          {...core}
          onItemSelect={(item) => {
            core.onItemSelect(item);
            setIsOpen(false);
          }}
          filtered={ql.filtered}
          activeIndex={ql.activeIndex}
          setActiveIndex={ql.setActiveIndex}
          listboxId={ql.listboxId}
          getOptionId={ql.getOptionId}
          query={ql.query}
          noResults={noResults}
        />
      </div>
    </dialog>
  );
}
