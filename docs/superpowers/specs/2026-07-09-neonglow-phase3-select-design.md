# neonglow Phase 3 — Select family (`@neonglow/select`)

**Date:** 2026-07-09
**Status:** Design approved — ready for implementation planning
**Parent spec:** `2026-07-04-neonglow-web-app-design-system-design.md` (visual rules). Builds on Phase 2's Popover (`matchTargetWidth`), Dialog pattern, Tag, TextInput, NonIdealState.

---

## 1. Scope

New package **`@neonglow/select`**: `useQueryList` (engine hook), `OptionList` (presentational listbox), `QueryList` (input + list panel), `Select<T>`, `MultiSelect<T>`, `Suggest<T>`, `Omnibar<T>`.

**Out of scope (deferred):** async/remote item loading, "create item from query", virtualized option lists (Phase 5), grouped/sectioned options.

## 2. Architecture

**One engine, four skins.** All widgets share `useQueryList<T>` — filtering, active-item keyboard management, ARIA id wiring. Presentation splits so the query input can live in different places:

| Widget | Query input location | Surface |
|---|---|---|
| Select | inside the popover panel (optional, `filterable`) | Popover (`matchTargetWidth`) |
| MultiSelect | inside the popover panel (deliberate simplification — trigger shows Tags) | Popover (`matchTargetWidth`) |
| Suggest | IS the trigger (TextInput) | Popover under the input |
| Omnibar | large input at top of a bare modal surface | native `<dialog>` (Dialog pattern: feature-detect showModal, unmount-by-design) |

**ARIA:** combobox pattern, not menus. Query input = `role="combobox"` + `aria-expanded` + `aria-controls` + `aria-activedescendant` (virtual focus — DOM focus stays in the input). List = `role="listbox"`, options = `role="option"` + `aria-selected`/`aria-disabled`. Option ids are instance-scoped via `useId` (Phase 2 lesson).

**Dependencies:** `@neonglow/core` (workspace + regular dependency), `@neonglow/icons`; peer react ≥18. No direct floating-ui dependency (Popover comes from core). Build/test setup mirrors core (Vite lib, CSS Modules, vitest+axe, ResizeObserver stub, its own tokens-exist guard test).

## 3. Contracts

```ts
// types
export type ItemPredicate<T> = (query: string, item: T) => boolean;

export interface QueryListCoreOptions<T> {
  items: T[];
  getItemLabel: (item: T) => string;          // rendering, default filtering, tag text
  getItemKey?: (item: T) => string;           // default: getItemLabel
  itemPredicate?: ItemPredicate<T>;           // default: case-insensitive label includes(query)
  itemDisabled?: (item: T) => boolean;
  onItemSelect: (item: T) => void;
}

// engine hook
useQueryList<T>(opts: QueryListCoreOptions<T> & {
  query?: string; defaultQuery?: string; onQueryChange?: (q: string) => void;
}): {
  query: string; setQuery: (q: string) => void;
  filtered: T[];
  activeIndex: number; setActiveIndex: (i: number) => void;   // clamped to filtered
  handleInputKeyDown: KeyboardEventHandler;                    // Up/Down/Home/End/Enter
  listboxId: string;
  activeDescendantId: string | undefined;
  getOptionId: (index: number) => string;
}

// presentational listbox (no input)
OptionList<T>: QueryListCoreOptions<T> + {
  filtered: T[]; activeIndex: number; setActiveIndex: (i: number) => void;
  listboxId: string; getOptionId: (i: number) => string;
  selected?: T[];                              // checkmarked + aria-selected
  noResults?: ReactNode;                       // shown when filtered is empty
}

// input + listbox panel (in-popover filtering)
QueryList<T>: QueryListCoreOptions<T> + {
  selected?: T[]; noResults?: ReactNode;
  withInput?: boolean;                         // default true
  inputPlaceholder?: string;                   // default "Filter…"
  query/defaultQuery/onQueryChange;            // controllable
}

Select<T>: QueryListCoreOptions<T> minus onItemSelect + {
  value?: T | null; defaultValue?: T | null; onChange?: (item: T) => void;
  placeholder?: string;                        // default "Select…"
  filterable?: boolean;                        // default true
  disabled?: boolean;
}
// trigger: <button> with label-or-placeholder + IconChevronDown; selection closes popover

MultiSelect<T>: like Select but values?: T[]; defaultValues?: T[]; onChange?: (values: T[]) => void;
// trigger shows removable Tags (core Tag onRemove); selecting toggles membership; popover stays open on select

Suggest<T>: QueryListCoreOptions<T> minus onItemSelect + {
  value?: T | null; defaultValue?: T | null; onChange?: (item: T) => void;
  placeholder?: string;
}
// TextInput trigger: typing opens popover, shows query; selection fills label, closes

Omnibar<T>: QueryListCoreOptions<T> + {
  isOpen?: boolean; defaultIsOpen?: boolean; onOpenChange?: (open: boolean) => void;
  hotkey?: string | null;                      // default "mod+k"; null disables
  placeholder?: string;                        // default "Search…"
  noResults?: ReactNode;
}
// selection closes; Esc closes; hotkey listener registered while mounted
```

**Query highlight:** `highlightQuery(label, query): ReactNode` util wraps the first case-insensitive match in `<mark>` styled `--accent-text` on transparent (no raw hex). Used by the default option rendering.

## 4. Visual rules (inherited)

Only Tier-2 tokens. Option rows: height `var(--control-h)`, active row = `color-mix(in srgb, var(--accent) 16%, var(--surface))` + inset 3px accent bar (Tree/table selection treatment); selected checkmark `IconCheck` in `--accent-text`. Popover surface inherits core Popover elevation. Omnibar surface: top-aligned (12vh from top), `width min(560px, calc(100vw - 40px))`, elevation-overlay, radius-action, `::backdrop` scrim. Density-aware throughout. Stories use portfolio content (filter 35 holdings by sector; ⌘K jump-to-company).

## 5. Quality gates (as Phases 0–2)

TDD; axe per component; keyboard tests (filter → arrows → Enter); dual-theme stories; Omnibar story renders open for VRT; VRT reseed at integration; hex-grep on the built select CSS = 0; package tokens-exist guard; barrel exports complete; no internal leaks (`useQueryList` IS exported — it's the extension point; `OptionList` exported too).

## 6. Open items

- Hotkey parsing: minimal in-house (`mod+k` → metaKey||ctrlKey + "k"); no hotkey library.
- `Suggest` clears query on selection and shows the selection's label as input value (Blueprint behavior).
