# neonglow Phase 3 Implementation Plan — Select family

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `@neonglow/select` — useQueryList engine, OptionList, QueryList, Select, MultiSelect, Suggest, Omnibar — dual-theme, TDD, on the ARIA combobox/listbox pattern.

**Architecture:** New workspace package depending on `@neonglow/core` (Popover, Tag, TextInput, cx) and `@neonglow/icons`. One filtering/keyboard engine (`useQueryList`) consumed by four widgets. Virtual focus via `aria-activedescendant`.

**Tech Stack:** unchanged (Vite lib, CSS Modules, vitest+axe).

**Spec:** `docs/superpowers/specs/2026-07-09-neonglow-phase3-select-design.md`

## Global Constraints

- All prior Global Constraints bind (semantic tokens only, radius rules, glow discipline, ≤150ms motion, focus via global :focus-visible, brand story copy, TDD with RED evidence IN THE REPORT, axe per component).
- ARIA: `role="combobox"` on query inputs with `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`; `role="listbox"`/`role="option"` for lists. NEVER role=menu here. Option ids instance-scoped via useId.
- `@neonglow/select` externals in Vite build: react, react-dom, react/jsx-runtime, `@neonglow/core`, `@neonglow/icons`. Both @neonglow deps are regular `dependencies` (workspace:*).
- `useControllableState` is COPIED from core internals into select (core's utils stay private by design — do not export from core).
- Active option treatment: `color-mix(in srgb, var(--accent) 16%, var(--surface))` + `box-shadow: inset 3px 0 0 var(--accent)` (structural, allowed). Option height `var(--control-h)`.
- Work on branch `feat/phase-3`. iCloud spawns ` 2.ext` duplicates — before every commit check `git status --short`, delete stray ` N.` artifacts, stage only intended files.
- Test command pattern: `corepack pnpm --filter @neonglow/select exec vitest run [path]`.

## File Structure (end state)

```
packages/select/
├─ package.json  tsconfig.json  vite.config.ts  vitest.setup.ts
└─ src/
   ├─ index.ts
   ├─ types.ts
   ├─ tokens-exist.test.ts            # same guard as core, walks this package's css
   ├─ utils/useControllableState.ts   # copied from core internals (+ its tests)
   ├─ query-list/
   │  ├─ useQueryList.ts  highlightQuery.tsx  OptionList.tsx  QueryList.tsx
   │  ├─ option-list.module.css  QueryList.test.tsx  QueryList.stories.tsx
   ├─ select/    Select.tsx select.module.css Select.test.tsx Select.stories.tsx
   ├─ multi/     MultiSelect.tsx MultiSelect.test.tsx MultiSelect.stories.tsx   (shares select.module.css)
   ├─ suggest/   Suggest.tsx Suggest.test.tsx Suggest.stories.tsx
   └─ omnibar/   Omnibar.tsx omnibar.module.css Omnibar.test.tsx Omnibar.stories.tsx
```

Test count targets: T1 ends at 4 (3 hook + 1 guard) → T2: 12 → T3: 17 → T4: 22 → T5: 26 → T6: 31.

---

### Task 1: Package scaffold + copied util + guard test

**Files:**
- Create: `packages/select/package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.setup.ts`, `src/index.ts`, `src/types.ts`, `src/utils/useControllableState.ts`, `src/utils/useControllableState.test.tsx`, `src/tokens-exist.test.ts`

**Interfaces:**
- Produces: package `@neonglow/select` building ESM+dts+css; `useControllableState<T>` (same signature as core's internal); `ItemPredicate<T>` + `QueryListCoreOptions<T>` types (spec §3 verbatim).

- [ ] **Step 1: Scaffold files**

`packages/select/package.json`:
```json
{
  "name": "@neonglow/select",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/neonglow-select.css"
  },
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "scripts": { "build": "vite build", "test": "vitest run" },
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "dependencies": { "@neonglow/core": "workspace:*", "@neonglow/icons": "workspace:*" },
  "devDependencies": {
    "@neonglow/tokens": "workspace:*",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0", "@types/react-dom": "^18.3.0",
    "jsdom": "^25.0.0", "react": "^18.3.0", "react-dom": "^18.3.0",
    "typescript": "^5.5.0", "vite": "^6.0.0", "vite-plugin-dts": "^4.0.0",
    "vitest": "^3.0.0", "vitest-axe": "^0.1.0"
  }
}
```

`packages/select/tsconfig.json`:
```json
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "dist" }, "include": ["src", "vitest.setup.ts"] }
```

`packages/select/vite.config.ts`:
```ts
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ include: ["src"], exclude: ["**/*.test.*", "**/*.stories.*"] })],
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: "index", cssFileName: "neonglow-select" },
    cssCodeSplit: false,
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "@neonglow/core", "@neonglow/icons"] },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
```

`packages/select/vitest.setup.ts`:
```ts
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";
expect.extend(matchers);

// jsdom lacks ResizeObserver; core's Popover (floating-ui autoUpdate) needs it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;
```

`packages/select/src/types.ts`:
```ts
export type ItemPredicate<T> = (query: string, item: T) => boolean;

export interface QueryListCoreOptions<T> {
  items: T[];
  /** Rendering, default filtering and tag text. */
  getItemLabel: (item: T) => string;
  /** Stable identity; defaults to getItemLabel. */
  getItemKey?: (item: T) => string;
  itemPredicate?: ItemPredicate<T>;
  itemDisabled?: (item: T) => boolean;
  onItemSelect: (item: T) => void;
}
```

`packages/select/src/utils/useControllableState.ts` — copy VERBATIM from `packages/core/src/utils/useControllableState.ts`, changing only the header comment to:
```ts
/**
 * Standard controlled/uncontrolled state resolution.
 * Deliberate copy of @neonglow/core's internal util — core keeps its utils private.
 */
```

`packages/select/src/utils/useControllableState.test.tsx` — copy the three `useControllableState` tests VERBATIM from `packages/core/src/utils/utils.test.tsx` (the `Harness` component and the `describe("useControllableState")` block only — not the Portal test), importing from `./useControllableState.js`.

`packages/select/src/tokens-exist.test.ts` — copy VERBATIM from `packages/core/src/tokens-exist.test.ts` but with an empty `COMPONENT_SCOPED` set (no entries yet) and the same walker (it resolves `src` from `process.cwd()` which is the select package root under vitest).

`packages/select/src/index.ts`:
```ts
export type { ItemPredicate, QueryListCoreOptions } from "./types.js";
```

- [ ] **Step 2: Install + verify**

Run: `corepack pnpm install`
Run: `corepack pnpm --filter @neonglow/select exec vitest run` — Expected: PASS (4 tests: 3 hook + 1 guard over zero css files).
Run: `corepack pnpm --filter @neonglow/select build` — Expected: dist/index.js + dist/index.d.ts.

- [ ] **Step 3: Commit**
```bash
git add packages/select pnpm-lock.yaml && git commit -m "feat(select): package scaffold, copied controllable-state util, token guard"
```

---

### Task 2: Engine — useQueryList + highlightQuery + OptionList + QueryList (TDD)

**Files:**
- Create: `packages/select/src/query-list/{useQueryList.ts,highlightQuery.tsx,OptionList.tsx,QueryList.tsx,option-list.module.css,QueryList.test.tsx,QueryList.stories.tsx}`
- Modify: `packages/select/src/index.ts`

**Interfaces:**
- Consumes: `useControllableState` (local copy), `cx` from `@neonglow/core`, `IconCheck` from `@neonglow/icons`, types from T1.
- Produces (all exported): `useQueryList<T>(opts)` returning `{ query, setQuery, filtered, activeIndex, setActiveIndex, handleInputKeyDown, listboxId, activeDescendantId, getOptionId }`; `OptionList<T>` (presentational listbox; props per spec §3 + optional `query` for highlighting); `QueryList<T>` (input + OptionList; extra optional prop `onInputKeyDown` composed BEFORE the engine handler — MultiSelect's backspace hook); `highlightQuery(label, query): ReactNode`.

- [ ] **Step 1: Write the failing tests**

`packages/select/src/query-list/QueryList.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { QueryList } from "./QueryList.js";
import { highlightQuery } from "./highlightQuery.js";

interface Holding { name: string; sector: string; disabled?: boolean }
const HOLDINGS: Holding[] = [
  { name: "Hedgehop", sector: "Agritech" },
  { name: "Nucaps", sector: "Foodtech" },
  { name: "Innomy", sector: "Foodtech", disabled: true },
  { name: "Cocuus", sector: "Foodtech" },
];
const base = {
  items: HOLDINGS,
  getItemLabel: (h: Holding) => h.name,
  itemDisabled: (h: Holding) => !!h.disabled,
};

describe("QueryList", () => {
  it("filters by label (case-insensitive) as the query changes", async () => {
    render(<QueryList {...base} onItemSelect={() => {}} />);
    await userEvent.type(screen.getByRole("combobox"), "cu");
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Nucaps", "Cocuus"]);
  });
  it("supports a custom itemPredicate", async () => {
    render(
      <QueryList {...base} itemPredicate={(q, h) => h.sector.toLowerCase().includes(q.toLowerCase())} onItemSelect={() => {}} />
    );
    await userEvent.type(screen.getByRole("combobox"), "agri");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Hedgehop"]);
  });
  it("arrow keys move the active descendant, skipping disabled and wrapping", async () => {
    render(<QueryList {...base} onItemSelect={() => {}} />);
    const input = screen.getByRole("combobox");
    const idOf = (name: string) =>
      screen.getByRole("option", { name }).id;
    expect(input.getAttribute("aria-activedescendant")).toBe(idOf("Hedgehop"));
    await userEvent.type(input, "{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).toBe(idOf("Nucaps"));
    await userEvent.type(input, "{ArrowDown}");            // skips disabled Innomy
    expect(input.getAttribute("aria-activedescendant")).toBe(idOf("Cocuus"));
    await userEvent.type(input, "{ArrowDown}");            // wraps
    expect(input.getAttribute("aria-activedescendant")).toBe(idOf("Hedgehop"));
  });
  it("Enter selects the active item", async () => {
    const onItemSelect = vi.fn();
    render(<QueryList {...base} onItemSelect={onItemSelect} />);
    await userEvent.type(screen.getByRole("combobox"), "{ArrowDown}{Enter}");
    expect(onItemSelect).toHaveBeenCalledWith(HOLDINGS[1]);
  });
  it("marks selected items with aria-selected and a checkmark", () => {
    const { container } = render(
      <QueryList {...base} selected={[HOLDINGS[0]]} onItemSelect={() => {}} />
    );
    const opt = screen.getByRole("option", { name: /Hedgehop/ });
    expect(opt.getAttribute("aria-selected")).toBe("true");
    expect(container.querySelector('[data-icon="check"]')).toBeTruthy();
  });
  it("shows noResults when nothing matches", async () => {
    render(<QueryList {...base} onItemSelect={() => {}} noResults={<span>Zero holdings.</span>} />);
    await userEvent.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("Zero holdings.")).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
  it("highlightQuery wraps the first match in a mark", () => {
    const { container } = render(<span>{highlightQuery("Hedgehop", "hog")}</span>);
    expect(container.querySelector("mark")?.textContent).toBe("hog");
    expect(container.textContent).toBe("Hedgehop");
  });
  it("has no axe violations", async () => {
    const { container } = render(<QueryList {...base} onItemSelect={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `corepack pnpm --filter @neonglow/select exec vitest run src/query-list` — Expected: FAIL (modules unresolved). Capture output for the report.

- [ ] **Step 3: Implement**

`packages/select/src/query-list/useQueryList.ts`:
```ts
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
```

`packages/select/src/query-list/highlightQuery.tsx`:
```tsx
import type { ReactNode } from "react";
import styles from "./option-list.module.css";

/** Wraps the first case-insensitive occurrence of query in a styled <mark>. */
export function highlightQuery(label: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return label;
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return label;
  return (
    <>
      {label.slice(0, i)}
      <mark className={styles.mark}>{label.slice(i, i + q.length)}</mark>
      {label.slice(i + q.length)}
    </>
  );
}
```

`packages/select/src/query-list/option-list.module.css`:
```css
.panel { display: flex; flex-direction: column; min-width: 200px; max-height: 320px; }
.input { height: var(--control-h); padding: 0 var(--pad-x); margin: 5px;
  border-radius: var(--radius-action); border: 1px solid var(--border-hairline);
  background: var(--surface); color: var(--text-1);
  font-family: var(--font-sans); font-size: var(--fs-ui); }
.input::placeholder { color: var(--text-3); }
.listbox { list-style: none; margin: 0; padding: 5px; overflow-y: auto; }
.option { display: flex; align-items: center; gap: 8px;
  height: var(--control-h); padding: 0 10px; border-radius: var(--radius-action);
  font-family: var(--font-sans); font-size: var(--fs-ui); color: var(--text-2);
  cursor: pointer; }
.active { background: color-mix(in srgb, var(--accent) 16%, var(--surface));
  box-shadow: inset 3px 0 0 var(--accent); color: var(--text-1); }
.disabled { opacity: .4; cursor: not-allowed; }
.check { width: 16px; display: inline-flex; flex: none; color: var(--accent-text); }
.label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mark { background: transparent; color: var(--accent-text); font-weight: 500; }
.noResults { padding: var(--baseline-half) 14px; font-family: var(--font-sans);
  font-size: var(--fs-ui); color: var(--text-3); }
```

`packages/select/src/query-list/OptionList.tsx`:
```tsx
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
}

export function OptionList<T>({
  filtered, activeIndex, setActiveIndex, listboxId, getOptionId,
  selected, noResults, query = "",
  getItemLabel, getItemKey, itemDisabled, onItemSelect,
}: OptionListProps<T>) {
  const keyOf = getItemKey ?? getItemLabel;
  if (!filtered.length) {
    return <div className={styles.noResults}>{noResults ?? "No results."}</div>;
  }
  return (
    <ul role="listbox" id={listboxId} className={styles.listbox}>
      {filtered.map((item, i) => {
        const disabled = itemDisabled?.(item) ?? false;
        const isSelected = selected?.some((s) => keyOf(s) === keyOf(item)) ?? false;
        return (
          <li
            key={keyOf(item)}
            id={getOptionId(i)}
            role="option"
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
      })}
    </ul>
  );
}
```

`packages/select/src/query-list/QueryList.tsx`:
```tsx
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
```

Replace `packages/select/src/index.ts`:
```ts
export type { ItemPredicate, QueryListCoreOptions } from "./types.js";
export { useQueryList, type UseQueryListOptions } from "./query-list/useQueryList.js";
export { OptionList, type OptionListProps } from "./query-list/OptionList.js";
export { QueryList, type QueryListProps } from "./query-list/QueryList.js";
export { highlightQuery } from "./query-list/highlightQuery.js";
```

- [ ] **Step 4: Verify + story**

Run: `corepack pnpm --filter @neonglow/select exec vitest run` — Expected: PASS (12 tests).

`packages/select/src/query-list/QueryList.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { QueryList } from "./QueryList.js";

const HOLDINGS = [
  { name: "Hedgehop", sector: "Agritech" },
  { name: "Nucaps", sector: "Foodtech" },
  { name: "Innomy", sector: "Foodtech" },
  { name: "Cocuus", sector: "Foodtech" },
  { name: "Poseidona", sector: "Foodtech" },
  { name: "Ekonoke", sector: "Agritech" },
];

const meta: Meta = { title: "Select/QueryList" };
export default meta;
export const Standalone: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 280, border: "1px solid var(--border-hairline)" }}>
      <QueryList
        items={HOLDINGS}
        getItemLabel={(h) => h.name}
        selected={[HOLDINGS[0]]}
        onItemSelect={() => {}}
        inputPlaceholder="Filter holdings…"
      />
    </div>
  ),
};
```

- [ ] **Step 5: Commit**
```bash
git add packages/select && git commit -m "feat(select): useQueryList engine, OptionList, QueryList, highlightQuery"
```

---

### Task 3: Select

**Files:**
- Create: `packages/select/src/select/{Select.tsx,select.module.css,Select.test.tsx,Select.stories.tsx}`
- Modify: `packages/select/src/index.ts`

**Interfaces:**
- Consumes: `Popover` (with `matchTargetWidth`) + `cx` from core, `IconChevronDown` from icons, `QueryList`, `useControllableState`.
- Produces: `Select<T>` per spec §3. `select.module.css` also carries the MultiSelect trigger classes used by T4 (`.multiWrap`, `.multiOpen`, `.placeholder`).

- [ ] **Step 1: Write the failing tests**

`packages/select/src/select/Select.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Select } from "./Select.js";

const SECTORS = ["Agritech", "Foodtech", "Logistics"];
const base = { items: SECTORS, getItemLabel: (s: string) => s };

describe("Select", () => {
  it("shows placeholder, opens, selects and closes", async () => {
    render(<Select {...base} placeholder="Pick a sector" />);
    const trigger = screen.getByRole("button", { name: /Pick a sector/ });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Foodtech" }));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("button", { name: /Foodtech/ })).toBeTruthy();
  });
  it("filters options via the panel input", async () => {
    render(<Select {...base} />);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.type(screen.getByRole("combobox"), "agri");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Agritech"]);
  });
  it("controlled: reports without changing", async () => {
    const onChange = vi.fn();
    render(<Select {...base} value="Agritech" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /Agritech/ }));
    await userEvent.click(screen.getByRole("option", { name: "Logistics" }));
    expect(onChange).toHaveBeenCalledWith("Logistics");
    expect(screen.getByRole("button", { name: /Agritech/ })).toBeTruthy();
  });
  it("disabled trigger does not open", async () => {
    render(<Select {...base} disabled placeholder="Pick" />);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("has no axe violations when open", async () => {
    const { baseElement } = render(<Select {...base} />);
    await userEvent.click(screen.getByRole("button"));
    // Portal renders outside landmarks; region rule is a known overlay false-positive.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `corepack pnpm --filter @neonglow/select exec vitest run src/select` — Expected: FAIL. Capture RED output.

- [ ] **Step 3: Implement**

`packages/select/src/select/select.module.css`:
```css
.trigger { display: inline-flex; align-items: center; justify-content: space-between; gap: 8px;
  min-width: 180px; height: var(--control-h); padding: 0 var(--pad-x);
  border-radius: var(--radius-action); border: 1px solid var(--border-hairline);
  background: var(--surface); color: var(--text-1);
  font-family: var(--font-sans); font-size: var(--fs-ui); cursor: pointer;
  transition: border-color .12s ease, background .12s ease; }
.trigger:hover { border-color: var(--text-3); }
.trigger:disabled { opacity: .4; cursor: not-allowed; }
.value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.placeholder { color: var(--text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chevron { display: inline-flex; color: var(--text-3); flex: none; }

/* MultiSelect trigger (Task 4) */
.multiWrap { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px;
  min-width: 240px; min-height: var(--control-h); padding: 4px var(--pad-x);
  border-radius: var(--radius-action); border: 1px solid var(--border-hairline);
  background: var(--surface); cursor: pointer; }
.multiWrap:hover { border-color: var(--text-3); }
.multiOpen { appearance: none; border: 0; background: transparent; color: var(--text-3);
  display: inline-flex; margin-left: auto; padding: 2px; cursor: pointer;
  border-radius: var(--radius-action); }
.multiOpen:hover { color: var(--text-1); background: var(--surface-sunken); }
.multiDisabled { opacity: .4; cursor: not-allowed; }
```

`packages/select/src/select/Select.tsx`:
```tsx
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
```

Append to `packages/select/src/index.ts`:
```ts
export { Select, type SelectProps } from "./select/Select.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `corepack pnpm --filter @neonglow/select exec vitest run` — Expected: PASS (17 tests).

`packages/select/src/select/Select.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select.js";

const meta: Meta = { title: "Select/Select" };
export default meta;
export const Sectors: StoryObj = {
  render: () => (
    <Select
      items={["Agritech", "Foodtech", "Logistics", "Deep tech"]}
      getItemLabel={(s) => s}
      defaultValue="Foodtech"
      placeholder="Sector"
    />
  ),
};
```

```bash
git add packages/select && git commit -m "feat(select): Select on Popover + QueryList"
```

---

### Task 4: MultiSelect

**Files:**
- Create: `packages/select/src/multi/{MultiSelect.tsx,MultiSelect.test.tsx,MultiSelect.stories.tsx}` (styles from `../select/select.module.css`)
- Modify: `packages/select/src/index.ts`

**Interfaces:**
- Consumes: `Popover`, `Tag`, `cx` from core; `IconChevronDown`; `QueryList` (+`onInputKeyDown`); `useControllableState`.
- Produces: `MultiSelect<T>` per spec §3. Trigger = plain div (Tags + placeholder) with a real `<button class="multiOpen">` as the Popover child/keyboard entry (avoids nested-interactive violations). Selecting toggles membership; the popover STAYS open. Backspace in an empty panel query removes the last value.

- [ ] **Step 1: Write the failing tests**

`packages/select/src/multi/MultiSelect.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { MultiSelect } from "./MultiSelect.js";

const SECTORS = ["Agritech", "Foodtech", "Logistics"];
const base = { items: SECTORS, getItemLabel: (s: string) => s };

describe("MultiSelect", () => {
  it("selecting adds a tag and keeps the popover open", async () => {
    render(<MultiSelect {...base} placeholder="Sectors" />);
    await userEvent.click(screen.getByRole("button", { name: "Sectors" }));
    await userEvent.click(screen.getByRole("option", { name: "Foodtech" }));
    expect(screen.getByRole("listbox")).toBeTruthy();            // stays open
    expect(screen.getByText("Foodtech")).toBeTruthy();           // tag rendered
  });
  it("clicking a selected option removes it (toggle)", async () => {
    const onChange = vi.fn();
    render(<MultiSelect {...base} defaultValues={["Agritech"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /select/i }));
    await userEvent.click(screen.getByRole("option", { name: /Agritech/ }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
  it("tag remove button removes the value", async () => {
    const onChange = vi.fn();
    render(<MultiSelect {...base} defaultValues={["Agritech", "Foodtech"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Agritech" }));
    expect(onChange).toHaveBeenCalledWith(["Foodtech"]);
  });
  it("Backspace in an empty query removes the last value", async () => {
    const onChange = vi.fn();
    render(<MultiSelect {...base} defaultValues={["Agritech", "Foodtech"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /select/i }));
    await userEvent.type(screen.getByRole("combobox"), "{Backspace}");
    expect(onChange).toHaveBeenCalledWith(["Agritech"]);
  });
  it("has no axe violations when open", async () => {
    const { baseElement } = render(<MultiSelect {...base} defaultValues={["Agritech"]} />);
    await userEvent.click(screen.getByRole("button", { name: /select/i }));
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `corepack pnpm --filter @neonglow/select exec vitest run src/multi` — Expected: FAIL. Capture RED output.

- [ ] **Step 3: Implement**

`packages/select/src/multi/MultiSelect.tsx`:
```tsx
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

  const toggle = (item: T) => {
    const has = vals.some((v) => keyOf(v) === keyOf(item));
    setVals(has ? vals.filter((v) => keyOf(v) !== keyOf(item)) : [...vals, item]);
    // popover deliberately stays open for multi-selection
  };

  return (
    <div
      className={cx(styles.multiWrap, disabled && styles.multiDisabled)}
      onClick={() => !disabled && setIsOpen(true)}
    >
      {vals.length ? (
        vals.map((v) => (
          <Tag key={keyOf(v)} onRemove={disabled ? undefined : () => setVals(vals.filter((x) => keyOf(x) !== keyOf(v)))}>
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
          onClick={(e) => e.stopPropagation() /* wrapper also opens; avoid double-toggle */}
        >
          <IconChevronDown size={16} />
        </button>
      </Popover>
    </div>
  );
}
```
Note: the Popover cloneElement composes its own toggle AFTER our stopPropagation onClick — verify open/close behavior in tests; if the double-open interplay fails, drop the wrapper onClick and rely on the button alone (document in report).

Append to `packages/select/src/index.ts`:
```ts
export { MultiSelect, type MultiSelectProps } from "./multi/MultiSelect.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `corepack pnpm --filter @neonglow/select exec vitest run` — Expected: PASS (22 tests).

`packages/select/src/multi/MultiSelect.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "./MultiSelect.js";

const meta: Meta = { title: "Select/MultiSelect" };
export default meta;
export const Sectors: StoryObj = {
  render: () => (
    <MultiSelect
      items={["Agritech", "Foodtech", "Logistics", "Deep tech"]}
      getItemLabel={(s) => s}
      defaultValues={["Agritech", "Foodtech"]}
      placeholder="Filter sectors"
    />
  ),
};
```

```bash
git add packages/select && git commit -m "feat(select): MultiSelect with tag trigger and toggle semantics"
```

---

### Task 5: Suggest

**Files:**
- Create: `packages/select/src/suggest/{Suggest.tsx,Suggest.test.tsx,Suggest.stories.tsx}`
- Modify: `packages/select/src/index.ts`

**Interfaces:**
- Consumes: `Popover`, `TextInput` from core; `useQueryList` + `OptionList`; `useControllableState`.
- Produces: `Suggest<T>` per spec §3 — the TextInput IS the combobox; typing opens; selection fills the input with the item label and closes; when open the input shows the live query.

- [ ] **Step 1: Write the failing tests**

`packages/select/src/suggest/Suggest.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Suggest } from "./Suggest.js";

const NAMES = ["Hedgehop", "Nucaps", "Innomy", "Cocuus"];
const base = { items: NAMES, getItemLabel: (s: string) => s };

describe("Suggest", () => {
  it("typing opens the list and filters", async () => {
    render(<Suggest {...base} placeholder="Company" />);
    await userEvent.type(screen.getByRole("combobox"), "cu");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Nucaps", "Cocuus"]);
  });
  it("Enter selects the active item, fills the input and closes", async () => {
    const onChange = vi.fn();
    render(<Suggest {...base} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "hedge{Enter}");
    expect(onChange).toHaveBeenCalledWith("Hedgehop");
    expect((input as HTMLInputElement).value).toBe("Hedgehop");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("clicking an option selects it", async () => {
    const onChange = vi.fn();
    render(<Suggest {...base} onChange={onChange} />);
    await userEvent.type(screen.getByRole("combobox"), "nu");
    await userEvent.click(screen.getByRole("option", { name: /Nucaps/ }));
    expect(onChange).toHaveBeenCalledWith("Nucaps");
  });
  it("has no axe violations while open", async () => {
    const { baseElement } = render(<Suggest {...base} />);
    await userEvent.type(screen.getByRole("combobox"), "o");
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `corepack pnpm --filter @neonglow/select exec vitest run src/suggest` — Expected: FAIL. Capture RED output.

- [ ] **Step 3: Implement**

`packages/select/src/suggest/Suggest.tsx`:
```tsx
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
}

export function Suggest<T>({
  value, defaultValue = null, onChange, placeholder = "Search…", ...core
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
```

Append to `packages/select/src/index.ts`:
```ts
export { Suggest, type SuggestProps } from "./suggest/Suggest.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `corepack pnpm --filter @neonglow/select exec vitest run` — Expected: PASS (26 tests).

`packages/select/src/suggest/Suggest.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Suggest } from "./Suggest.js";

const meta: Meta = { title: "Select/Suggest" };
export default meta;
export const Companies: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <Suggest
        items={["Hedgehop", "Nucaps", "Innomy", "Cocuus", "Poseidona", "Ekonoke"]}
        getItemLabel={(s) => s}
        placeholder="Jump to company…"
      />
    </div>
  ),
};
```

```bash
git add packages/select && git commit -m "feat(select): Suggest combobox"
```

---

### Task 6: Omnibar

**Files:**
- Create: `packages/select/src/omnibar/{Omnibar.tsx,omnibar.module.css,Omnibar.test.tsx,Omnibar.stories.tsx}`
- Modify: `packages/select/src/index.ts`

**Interfaces:**
- Consumes: `useQueryList` + `OptionList`; `useControllableState`; Dialog PATTERN from core (feature-detect showModal, unmount-by-design — read `packages/core/src/dialog/Dialog.tsx` and mirror its effect).
- Produces: `Omnibar<T>` per spec §3 — `hotkey` default "mod+k" (null disables), query resets on each open, selection calls the wrapped `onItemSelect` then closes.

- [ ] **Step 1: Write the failing tests**

`packages/select/src/omnibar/Omnibar.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Omnibar } from "./Omnibar.js";

const NAMES = ["Hedgehop", "Nucaps", "Cocuus"];
const base = { items: NAMES, getItemLabel: (s: string) => s, onItemSelect: () => {} };

describe("Omnibar", () => {
  it("opens on mod+k", async () => {
    render(<Omnibar {...base} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });
  it("selecting an item fires the handler and closes", async () => {
    const onItemSelect = vi.fn();
    render(<Omnibar {...base} onItemSelect={onItemSelect} defaultIsOpen />);
    await userEvent.click(screen.getByRole("option", { name: /Nucaps/ }));
    expect(onItemSelect).toHaveBeenCalledWith("Nucaps");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("Escape (native cancel) closes", () => {
    render(<Omnibar {...base} defaultIsOpen />);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("query resets on reopen", async () => {
    render(<Omnibar {...base} defaultIsOpen />);
    await userEvent.type(screen.getByRole("combobox"), "hedge");
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
  it("has no axe violations when open", async () => {
    const { baseElement } = render(<Omnibar {...base} defaultIsOpen />);
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `corepack pnpm --filter @neonglow/select exec vitest run src/omnibar` — Expected: FAIL. Capture RED output.

- [ ] **Step 3: Implement**

`packages/select/src/omnibar/omnibar.module.css`:
```css
.dialog { padding: 0; border: 1px solid var(--border-hairline);
  border-radius: var(--radius-action); box-shadow: var(--elevation-overlay);
  background: var(--surface-raised); color: var(--text-1);
  width: min(560px, calc(100vw - 40px));
  margin-top: 12vh; }
.dialog::backdrop { background: var(--scrim); }
.input { width: 100%; box-sizing: border-box; height: 48px; padding: 0 var(--baseline);
  border: 0; border-bottom: 1px solid var(--border-hairline); border-radius: 0;
  background: transparent; color: var(--text-1);
  font-family: var(--font-sans); font-size: var(--fs-h-3); }
.input::placeholder { color: var(--text-3); }
.input:focus { outline: none; } /* the dialog surface is the focus context */
.results { max-height: 320px; overflow-y: auto; }
```

`packages/select/src/omnibar/Omnibar.tsx`:
```tsx
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
```

Append to `packages/select/src/index.ts`:
```ts
export { Omnibar, type OmnibarProps } from "./omnibar/Omnibar.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `corepack pnpm --filter @neonglow/select exec vitest run` — Expected: PASS (31 tests).

`packages/select/src/omnibar/Omnibar.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Omnibar } from "./Omnibar.js";

const meta: Meta = { title: "Select/Omnibar" };
export default meta;
export const CommandK: StoryObj = {
  render: () => (
    <>
      <p style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>⌘K / Ctrl+K to open</p>
      <Omnibar
        defaultIsOpen
        items={["Hedgehop", "Nucaps", "Innomy", "Cocuus", "Poseidona", "Ekonoke"]}
        getItemLabel={(s) => s}
        onItemSelect={() => {}}
        placeholder="Jump to holding…"
      />
    </>
  ),
};
```

```bash
git add packages/select && git commit -m "feat(select): Omnibar command palette with mod+k hotkey"
```

---

### Task 7: Integration — docs wiring, builds, VRT reseed, push

**Files:**
- Modify: `apps/docs/package.json` (add `"@neonglow/select": "workspace:*"` to dependencies), `apps/docs/.storybook/preview.ts` (add `import "@neonglow/select/styles.css";` after the core styles import)
- Modify: `vrt/baseline/` (reseed)

**Steps:**

- [ ] **Step 1: Wire docs**

Add the dependency + CSS import above, run `corepack pnpm install`.
(The stories glob `../../../packages/*/src/**/*.stories.@(ts|tsx)` already picks up packages/select.)

- [ ] **Step 2: Builds + suites + hex grep**

Run in order: tokens build, icons build, core build, select build, docs build (all `corepack pnpm --filter <pkg> build`, exit 0 each).
Suites: tokens 9, icons 4, core 71, select 31.
Hex grep: `grep -cE "#[0-9a-fA-F]{3,8}" packages/select/dist/neonglow-select.css || echo 0` — Expected `0`.

- [ ] **Step 3: VRT reseed**

```bash
find vrt/baseline -regex ".* [0-9]+\..*" -delete; rm -f vrt/baseline/*.png
node scripts/vrt.mjs   # seeds (27 stories × 2 themes = 54)
node scripts/vrt.mjs   # Expected: 0 seeded, 0 failures
```

- [ ] **Step 4: Sweep iCloud artifacts, commit, push**

```bash
find . -path ./node_modules -prune -o -regex ".* [0-9]+\..*" -print -delete
git add -A && git status --short   # verify only intended files
git commit -m "feat: Phase 3 integration — select stories wired, VR baselines"
git push -u origin feat/phase-3
```

---

## Self-review notes

- **Spec coverage:** §1 scope → T1 (scaffold+types), T2 (engine trio + highlight), T3–T6 (four widgets), T7 (integration). Deferred items absent. Hotkey parsing in-house per §6.
- **Type consistency:** `QueryListCoreOptions` defined once (T1), spread through every widget via `Omit<..., "onItemSelect">` where selection is wrapped; OptionList props produced by `useQueryList` return shape — field names match exactly (filtered/activeIndex/setActiveIndex/listboxId/getOptionId/activeDescendantId); `onInputKeyDown` produced T2, consumed T4.
- **Known risk called out in-plan:** MultiSelect wrapper-click + Popover-button toggle interplay (T4 Step 3 note names the fallback). Suggest's Popover click-toggle on the input is accepted behavior (click toggles).
- **Placeholder scan:** none — all steps carry complete code and exact commands.
