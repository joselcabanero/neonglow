import { useCallback, useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { useControllableState } from "../utils/useControllableState.js";
import type { ItemPredicate, QueryListCoreOptions } from "../types.js";

export interface UseQueryListOptions<T> extends QueryListCoreOptions<T> {
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (q: string) => void;
}

export function useQueryList<T>(opts: UseQueryListOptions<T>) {
  const { items, getItemLabel, itemPredicate, itemDisabled, onItemSelect } = opts;
  const uid = useId();
  const [query, setQuery] = useControllableState({
    value: opts.query, defaultValue: opts.defaultQuery ?? "", onChange: opts.onQueryChange,
  });

  const predicate: ItemPredicate<T> =
    itemPredicate ?? ((q, item) => getItemLabel(item).toLowerCase().includes(q.toLowerCase()));
  const filtered = useMemo(
    () => (query.trim() ? items.filter((i) => predicate(query, i)) : items),
    // predicate identity is derived from props each render; items+query drive the result
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, query, itemPredicate, getItemLabel]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  const move = useCallback(
    (dir: 1 | -1) => {
      if (!filtered.length) return;
      setActiveIndex((i) => {
        let n = i;
        for (let step = 0; step < filtered.length; step++) {
          n = (n + dir + filtered.length) % filtered.length;
          if (!itemDisabled?.(filtered[n])) return n;
        }
        return i;
      });
    },
    [filtered, itemDisabled]
  );

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Home" && filtered.length) { e.preventDefault(); setActiveIndex(0); }
      else if (e.key === "End" && filtered.length) { e.preventDefault(); setActiveIndex(filtered.length - 1); }
      else if (e.key === "Enter") {
        const item = filtered[activeIndex];
        if (item && !itemDisabled?.(item)) { e.preventDefault(); onItemSelect(item); }
      }
    },
    [move, filtered, activeIndex, itemDisabled, onItemSelect]
  );

  const getOptionId = useCallback((i: number) => `${uid}-opt-${i}`, [uid]);

  return {
    query, setQuery, filtered, activeIndex, setActiveIndex, handleInputKeyDown,
    listboxId: `${uid}-listbox`,
    getOptionId,
    activeDescendantId: filtered.length ? getOptionId(activeIndex) : undefined,
  };
}
