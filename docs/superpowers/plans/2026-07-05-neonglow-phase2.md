# neonglow Phase 2 Implementation Plan — Overlays & Navigation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the overlay/interaction layer of `@neonglow/core` (Popover, Menu, Dialog, Drawer, Toast) and navigation components (Tabs, Breadcrumbs, Navbar, Tree, NonIdealState), dual-theme, TDD.

**Architecture:** Same monorepo/token architecture as Phase 0+1. New: `@floating-ui/react-dom` for popover positioning (externalized in build); native `<dialog>.showModal()` for Dialog/Drawer; imperative toaster singleton via `useSyncExternalStore`; shared `useControllableState` + `Portal` utils.

**Tech Stack:** unchanged + `@floating-ui/react-dom`.

**Spec:** `docs/superpowers/specs/2026-07-05-neonglow-phase2-overlays-nav-design.md` (this phase) under `docs/superpowers/specs/2026-07-04-neonglow-web-app-design-system-design.md` (visual rules).

## Global Constraints

- All Phase 0+1 Global Constraints still bind: only Tier-2 semantic CSS vars (no raw hex — the `tokens-exist` guard test auto-covers new CSS), radius two-tier (`--radius-action` on overlays/affordances, `--radius-0` on data surfaces incl. Navbar), glow only via `--glow` and only on meaning (toast intent icons), focus only via global `:focus-visible`, transitions ≤150ms (global reduced-motion kill switch), no emoji/decorative icons, brand-voice story copy.
- Overlay elevation ONLY on true overlays: Popover panel, Dialog, Drawer, Toast — `box-shadow: var(--elevation-overlay)` + `background: var(--surface-raised)`. Never on Navbar/Tabs/Tree/Breadcrumbs.
- `@floating-ui/react-dom` is a regular `dependency` of core and MUST be added to Vite `rollupOptions.external`.
- Native `<dialog>` for Dialog/Drawer; `::backdrop { background: var(--scrim) }`.
- Toaster is importable and callable before `<Toaster/>` mounts (module-level store).
- Test commands: `pnpm --filter @neonglow/core exec vitest run src/<dir>`. All work on branch `feat/phase-2`.
- Every component: axe test + story (stories are picked up by the docs glob automatically).
- jsdom notes: `ResizeObserver` is not implemented — Task 3 adds a stub to `vitest.setup.ts` (floating-ui's `autoUpdate` needs it). jsdom ≥24 implements `<dialog>` `showModal/close`; if the resolved jsdom lacks it, fall back to asserting the `open` attribute and event wiring, and flag in the report.

## File Structure (Phase 2 additions)

```
packages/icons/src/index.tsx                 # +IconChevronDouble (32 icons)
packages/tokens/src/density.ts               # +navbarH (48px / 36px)
packages/core/
├─ vite.config.ts                            # +@floating-ui/react-dom external
├─ vitest.setup.ts                           # +ResizeObserver stub
└─ src/
   ├─ utils/     useControllableState.ts Portal.tsx utils.test.tsx
   ├─ popover/   Popover.tsx PopoverContext.ts popover.module.css Popover.test.tsx Popover.stories.tsx
   ├─ menu/      Menu.tsx MenuItem.tsx MenuDivider.tsx menu.module.css Menu.test.tsx Menu.stories.tsx
   ├─ dialog/    Dialog.tsx dialog.module.css Dialog.test.tsx Dialog.stories.tsx
   ├─ drawer/    Drawer.tsx drawer.module.css Drawer.test.tsx Drawer.stories.tsx
   ├─ toast/     toaster.ts Toaster.tsx toast.module.css Toast.test.tsx Toast.stories.tsx
   ├─ tabs/      Tabs.tsx tabs.module.css Tabs.test.tsx Tabs.stories.tsx
   ├─ breadcrumbs/ Breadcrumbs.tsx breadcrumbs.module.css Breadcrumbs.test.tsx Breadcrumbs.stories.tsx
   ├─ navbar/    Navbar.tsx navbar.module.css Navbar.test.tsx Navbar.stories.tsx
   ├─ nonideal/  NonIdealState.tsx nonideal.module.css NonIdealState.test.tsx NonIdealState.stories.tsx
   └─ tree/      Tree.tsx tree.module.css Tree.test.tsx Tree.stories.tsx
```

Running core test totals: Phase 1 ends at 31 → T3: 35 → T4: 39 → T5: 43 → T6: 47 → T7: 50 → T8: 55 → T9: 59 → T10: 63 → T11: 65 → T12: 71.

---

### Task 1: IconChevronDouble

**Files:**
- Modify: `packages/icons/src/index.tsx`, `packages/icons/test/icons.test.tsx`

**Interfaces:**
- Produces: `IconChevronDouble` export (32nd icon). Consumed by Phase 2 Tree stories and future expand-all affordances.

- [ ] **Step 1: Update the failing count test**

In `packages/icons/test/icons.test.tsx` change the count assertion:
```tsx
    expect(names.length).toBe(32);
```
Run: `pnpm --filter @neonglow/icons exec vitest run` — Expected: FAIL (31 ≠ 32).

- [ ] **Step 2: Add the icon**

Append to `packages/icons/src/index.tsx`:
```tsx
export const IconChevronDouble = createIcon("chevron-double", <><polyline points="6 6 12 12 18 6" /><polyline points="6 13 12 19 18 13" /></>);
```

- [ ] **Step 3: Verify + build + commit**

Run: `pnpm --filter @neonglow/icons exec vitest run` — Expected: PASS (4 tests).
Run: `pnpm --filter @neonglow/icons build` — Expected: exit 0.
```bash
git add packages/icons && git commit -m "feat(icons): IconChevronDouble (32 icons)"
```

---

### Task 2: tokens — navbar height density token

**Files:**
- Modify: `packages/tokens/src/density.ts`, `packages/tokens/test/tokens.test.ts`

**Interfaces:**
- Produces: `--navbar-h` CSS var (48px default / 36px compact), generated automatically by the existing generator. Consumed by Task 11.

- [ ] **Step 1: Strengthen the failing test**

In `packages/tokens/test/tokens.test.ts`, update the densities test:
```ts
  it("heights are half-baseline (12px) multiples", () => {
    for (const d of Object.values(densities))
      for (const v of [d.controlH, d.rowH, d.navbarH])
        expect(parseInt(v) % 12, v).toBe(0);
  });
```
Run: `pnpm --filter @neonglow/tokens exec vitest run` — Expected: FAIL (navbarH undefined).

- [ ] **Step 2: Add the token**

`packages/tokens/src/density.ts`:
```ts
const defaults = { controlH: "36px", rowH: "48px", padX: "12px", padY: "8px", navbarH: "48px" };
const compact  = { controlH: "24px", rowH: "36px", padX: "8px",  padY: "4px", navbarH: "36px" };
export type DensityTokens = typeof defaults;
export const densities = { default: defaults, compact };
```

- [ ] **Step 3: Verify + build + commit**

Run: `pnpm --filter @neonglow/tokens exec vitest run` — Expected: PASS (9 tests).
Run: `pnpm --filter @neonglow/tokens build && grep -c "navbar-h" packages/tokens/dist/theme.css` — Expected: `2`.
```bash
git add packages/tokens && git commit -m "feat(tokens): navbar height density token"
```

---

### Task 3: core utils — useControllableState + Portal (+ ResizeObserver stub)

**Files:**
- Create: `packages/core/src/utils/useControllableState.ts`, `packages/core/src/utils/Portal.tsx`, `packages/core/src/utils/utils.test.tsx`
- Modify: `packages/core/vitest.setup.ts`

**Interfaces:**
- Produces (internal, NOT exported from the barrel): `useControllableState<T>(opts: { value?: T; defaultValue: T; onChange?: (v: T) => void }): [T, (v: T) => void]`; `Portal({ children }: { children: ReactNode })` rendering into `document.body`. Consumed by Popover (T4), Toast (T8), Tabs (T9).

- [ ] **Step 1: Write the failing tests**

`packages/core/src/utils/utils.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useControllableState } from "./useControllableState.js";
import { Portal } from "./Portal.js";

function Harness(props: { value?: string; onChange?: (v: string) => void }) {
  const [v, setV] = useControllableState({ value: props.value, defaultValue: "a", onChange: props.onChange });
  return <button onClick={() => setV("b")}>{v}</button>;
}

describe("useControllableState", () => {
  it("uncontrolled: starts at defaultValue and updates internally", () => {
    render(<Harness />);
    const b = screen.getByRole("button");
    expect(b.textContent).toBe("a");
    act(() => b.click());
    expect(b.textContent).toBe("b");
  });
  it("controlled: renders the prop and does not change without parent", () => {
    const onChange = vi.fn();
    render(<Harness value="ctrl" onChange={onChange} />);
    const b = screen.getByRole("button");
    act(() => b.click());
    expect(b.textContent).toBe("ctrl");
    expect(onChange).toHaveBeenCalledWith("b");
  });
  it("uncontrolled: still reports changes via onChange", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    act(() => screen.getByRole("button").click());
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("Portal", () => {
  it("renders children into document.body", () => {
    const { container } = render(<div><Portal><p data-testid="ported">out</p></Portal></div>);
    const p = screen.getByTestId("ported");
    expect(container.contains(p)).toBe(false);
    expect(document.body.contains(p)).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/utils` — Expected: FAIL (modules unresolved).

- [ ] **Step 3: Implement**

`packages/core/src/utils/useControllableState.ts`:
```ts
import { useCallback, useState } from "react";

/** Standard controlled/uncontrolled state resolution. */
export function useControllableState<T>(opts: {
  value?: T;
  defaultValue: T;
  onChange?: (v: T) => void;
}): [T, (v: T) => void] {
  const [internal, setInternal] = useState(opts.defaultValue);
  const isControlled = opts.value !== undefined;
  const value = isControlled ? (opts.value as T) : internal;
  const { onChange } = opts;
  const set = useCallback(
    (v: T) => {
      if (!isControlled) setInternal(v);
      onChange?.(v);
    },
    [isControlled, onChange]
  );
  return [value, set];
}
```

`packages/core/src/utils/Portal.tsx`:
```tsx
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Renders children into document.body. SSR-safe (renders nothing until mounted). */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
```

Append to `packages/core/vitest.setup.ts`:
```ts
// jsdom lacks ResizeObserver; floating-ui's autoUpdate requires it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;
```

- [ ] **Step 4: Verify + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/utils` — Expected: PASS (4 tests).
```bash
git add packages/core && git commit -m "feat(core): useControllableState + Portal utils, ResizeObserver test stub"
```

---

### Task 4: Popover

**Files:**
- Create: `packages/core/src/popover/{Popover.tsx,PopoverContext.ts,popover.module.css,Popover.test.tsx,Popover.stories.tsx}`
- Modify: `packages/core/src/index.ts`, `packages/core/vite.config.ts`, `packages/core/package.json` (dependency)

**Interfaces:**
- Consumes: `useControllableState`, `Portal`, `cx`.
- Produces: `Popover` (props per spec §3), and `PopoverContext: Context<{ close: () => void } | null>` (internal file, imported by MenuItem in T5 as `../popover/PopoverContext.js`).

- [ ] **Step 1: Add the dependency**

Run: `pnpm --filter @neonglow/core add @floating-ui/react-dom`
In `packages/core/vite.config.ts` extend externals:
```ts
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "@neonglow/icons", "@floating-ui/react-dom"] },
```

- [ ] **Step 2: Write the failing tests**

`packages/core/src/popover/Popover.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Popover } from "./Popover.js";
import { Button } from "../button/Button.js";

describe("Popover", () => {
  it("opens on trigger click and closes on Escape", async () => {
    render(
      <Popover content={<p>Panel body</p>}>
        <Button>Open</Button>
      </Popover>
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Panel body")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByText("Panel body")).toBeNull();
  });
  it("closes on outside click", async () => {
    render(
      <div>
        <Popover content={<p>Panel body</p>}><Button>Open</Button></Popover>
        <button>Outside</button>
      </div>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Panel body")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByText("Panel body")).toBeNull();
  });
  it("supports controlled mode", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover content={<p>Panel body</p>} isOpen={false} onOpenChange={onOpenChange}>
        <Button>Open</Button>
      </Popover>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Panel body")).toBeNull(); // parent didn't flip it
    rerender(
      <Popover content={<p>Panel body</p>} isOpen={true} onOpenChange={onOpenChange}>
        <Button>Open</Button>
      </Popover>
    );
    expect(screen.getByText("Panel body")).toBeTruthy();
  });
  it("has no axe violations when open", async () => {
    const { baseElement } = render(
      <Popover content={<p>Panel body</p>} defaultIsOpen>
        <Button>Open</Button>
      </Popover>
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/popover` — Expected: FAIL (module unresolved).

- [ ] **Step 4: Implement**

`packages/core/src/popover/PopoverContext.ts`:
```ts
import { createContext } from "react";
export const PopoverContext = createContext<{ close: () => void } | null>(null);
```

`packages/core/src/popover/popover.module.css`:
```css
/* True overlay: raised surface + elevation. */
.panel {
  background: var(--surface-raised);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-action);
  box-shadow: var(--elevation-overlay);
  z-index: 30;
  animation: enter .12s ease-out;
}
@keyframes enter {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
```

`packages/core/src/popover/Popover.tsx`:
```tsx
import {
  cloneElement, useCallback, useEffect, useId, useMemo, useRef,
  type ReactElement, type ReactNode,
} from "react";
import {
  useFloating, autoUpdate, offset, flip, shift, type Placement,
} from "@floating-ui/react-dom";
import { Portal } from "../utils/Portal.js";
import { useControllableState } from "../utils/useControllableState.js";
import { PopoverContext } from "./PopoverContext.js";
import styles from "./popover.module.css";

export interface PopoverProps {
  content: ReactNode;
  /** Trigger element. Receives ref, aria-expanded/haspopup and click-toggle. */
  children: ReactElement<Record<string, unknown>>;
  placement?: Placement;
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Panel takes the trigger's width (for Select-style dropdowns). */
  matchTargetWidth?: boolean;
}

export function Popover({
  content, children, placement = "bottom-start",
  isOpen, defaultIsOpen = false, onOpenChange, matchTargetWidth,
}: PopoverProps) {
  const [open, setOpen] = useControllableState({
    value: isOpen, defaultValue: defaultIsOpen, onChange: onOpenChange,
  });
  const panelId = useId();
  const { refs, floatingStyles } = useFloating({
    placement, open,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  const close = useCallback(() => setOpen(false), [setOpen]);

  // Outside click + Escape (Escape also restores focus to the trigger).
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (refs.floating.current?.contains(t) || refs.reference.current instanceof HTMLElement && refs.reference.current.contains(t)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      const r = refs.reference.current;
      if (r instanceof HTMLElement) r.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, refs.floating, refs.reference]);

  const ctx = useMemo(() => ({ close }), [close]);
  const trigger = cloneElement(children, {
    ref: refs.setReference,
    "aria-expanded": open,
    "aria-haspopup": "true",
    "aria-controls": open ? panelId : undefined,
    onClick: (e: unknown) => {
      (children.props.onClick as ((e: unknown) => void) | undefined)?.(e);
      setOpen(!open);
    },
  });

  return (
    <>
      {trigger}
      {open ? (
        <Portal>
          <div
            ref={refs.setFloating}
            id={panelId}
            className={styles.panel}
            style={{
              ...floatingStyles,
              ...(matchTargetWidth && refs.reference.current instanceof HTMLElement
                ? { width: refs.reference.current.getBoundingClientRect().width }
                : {}),
            }}
          >
            <PopoverContext.Provider value={ctx}>{content}</PopoverContext.Provider>
          </div>
        </Portal>
      ) : null}
    </>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Popover, type PopoverProps } from "./popover/Popover.js";
```

- [ ] **Step 5: Verify + story + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/popover` — Expected: PASS (4 tests).

`packages/core/src/popover/Popover.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "./Popover.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof Popover> = { title: "Core/Popover", component: Popover };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: 48 }}>
      <Popover defaultIsOpen content={<div style={{ padding: 16, maxWidth: 260 }}>Spain SPV 2.09× · Fund I 1.27× at 2-year maturity.</div>}>
        <Button>Blended 1.47×</Button>
      </Popover>
    </div>
  ),
};
```

```bash
git add packages/core && git commit -m "feat(core): Popover on floating-ui with outside-click/Escape handling"
```

---

### Task 5: Menu + MenuItem + MenuDivider

**Files:**
- Create: `packages/core/src/menu/{Menu.tsx,MenuItem.tsx,MenuDivider.tsx,menu.module.css,Menu.test.tsx,Menu.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `Intent`, `PopoverContext` (from `../popover/PopoverContext.js`).
- Produces: `Menu` (`HTMLAttributes<HTMLUListElement>`, `role="menu"`), `MenuItem` (`{ text, icon?, kbd?, intent?, disabled?, onSelect? }`), `MenuDivider`.

- [ ] **Step 1: Write the failing tests**

`packages/core/src/menu/Menu.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Menu } from "./Menu.js";
import { MenuItem } from "./MenuItem.js";
import { MenuDivider } from "./MenuDivider.js";
import { Popover } from "../popover/Popover.js";
import { Button } from "../button/Button.js";

function sample(onSelect = vi.fn()) {
  return (
    <Menu aria-label="Holding actions">
      <MenuItem text="View holding" onSelect={onSelect} />
      <MenuItem text="Open memo" kbd="⌘O" />
      <MenuItem text="Reorder" disabled />
      <MenuDivider />
      <MenuItem text="Mark written off" intent="danger" />
    </Menu>
  );
}

describe("Menu", () => {
  it("navigates with arrows, skipping disabled items", async () => {
    render(sample());
    const items = screen.getAllByRole("menuitem");
    items[0].focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(items[1]);
    await userEvent.keyboard("{ArrowDown}");                 // skips disabled "Reorder"
    expect(document.activeElement).toBe(items[3]);
    await userEvent.keyboard("{ArrowDown}");                 // wraps
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(items[3]);
  });
  it("selects with Enter", async () => {
    const onSelect = vi.fn();
    render(sample(onSelect));
    screen.getAllByRole("menuitem")[0].focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
  });
  it("closes an enclosing Popover on select", async () => {
    render(
      <Popover defaultIsOpen content={<Menu aria-label="m"><MenuItem text="View holding" /></Menu>}>
        <Button>Actions</Button>
      </Popover>
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "View holding" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });
  it("has no axe violations", async () => {
    const { container } = render(sample());
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/menu` — Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/core/src/menu/menu.module.css`:
```css
.menu { list-style: none; margin: 0; padding: 5px; min-width: 200px;
  background: var(--surface-raised); border-radius: var(--radius-action); }
.li { margin: 0; }
.item { display: flex; align-items: center; gap: 10px; width: 100%;
  height: var(--control-h); padding: 0 10px; border: 0; background: transparent;
  border-radius: var(--radius-action); cursor: pointer; text-align: left;
  font-family: var(--font-sans); font-size: var(--fs-ui); color: var(--text-2);
  transition: background .12s ease, color .12s ease; }
.item:hover { background: var(--surface-sunken); color: var(--text-1); }
.item:disabled { opacity: .4; cursor: not-allowed; }
.icon { display: inline-flex; color: var(--text-3); }
.kbd { margin-left: auto; font-family: var(--font-mono); font-size: var(--fs-micro); color: var(--text-3); }
.danger { color: var(--intent-danger); }
.danger .icon { color: var(--intent-danger); }
.danger:hover { background: var(--intent-danger-bg); color: var(--intent-danger); }
.divider { border: 0; height: 1px; background: var(--border-hairline); margin: 5px 0; }
```

`packages/core/src/menu/Menu.tsx`:
```tsx
import { useRef, type HTMLAttributes, type KeyboardEvent } from "react";
import { cx } from "../cx.js";
import styles from "./menu.module.css";

export type MenuProps = HTMLAttributes<HTMLUListElement>;

export function Menu({ className, onKeyDown, ...rest }: MenuProps) {
  const ref = useRef<HTMLUListElement>(null);
  const handleKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(e);
    const items = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []
    );
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (i + 1) % items.length;
    else if (e.key === "ArrowUp") next = i <= 0 ? items.length - 1 : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      items[next].focus();
    }
  };
  return <ul role="menu" ref={ref} onKeyDown={handleKeyDown} className={cx(styles.menu, className)} {...rest} />;
}
```

`packages/core/src/menu/MenuItem.tsx`:
```tsx
import { useContext, type ReactNode } from "react";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import { PopoverContext } from "../popover/PopoverContext.js";
import styles from "./menu.module.css";

export interface MenuItemProps {
  text: ReactNode;
  icon?: ReactNode;
  /** Right-aligned shortcut hint, e.g. "⌘O". Display only. */
  kbd?: string;
  intent?: Intent;
  disabled?: boolean;
  onSelect?: () => void;
}

export function MenuItem({ text, icon, kbd, intent = "none", disabled, onSelect }: MenuItemProps) {
  const popover = useContext(PopoverContext);
  return (
    <li role="none" className={styles.li}>
      <button
        type="button"
        role="menuitem"
        disabled={disabled}
        className={cx(styles.item, intent === "danger" && styles.danger)}
        onClick={() => {
          onSelect?.();
          popover?.close();
        }}
      >
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        {text}
        {kbd ? <span className={styles.kbd}>{kbd}</span> : null}
      </button>
    </li>
  );
}
```

`packages/core/src/menu/MenuDivider.tsx`:
```tsx
import styles from "./menu.module.css";

export function MenuDivider() {
  return (
    <li role="none">
      <hr role="separator" className={styles.divider} />
    </li>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Menu, type MenuProps } from "./menu/Menu.js";
export { MenuItem, type MenuItemProps } from "./menu/MenuItem.js";
export { MenuDivider } from "./menu/MenuDivider.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/menu` — Expected: PASS (4 tests).

`packages/core/src/menu/Menu.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { IconEye, IconExternalLink, IconDragHandle, IconX } from "@neonglow/icons";
import { Menu } from "./Menu.js";
import { MenuItem } from "./MenuItem.js";
import { MenuDivider } from "./MenuDivider.js";

const meta: Meta<typeof Menu> = { title: "Core/Menu", component: Menu };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <Menu aria-label="Holding actions" style={{ border: "1px solid var(--border-hairline)" }}>
        <MenuItem icon={<IconEye />} text="View holding" kbd="⏎" />
        <MenuItem icon={<IconExternalLink />} text="Open memo" kbd="⌘O" />
        <MenuItem icon={<IconDragHandle />} text="Reorder" disabled />
        <MenuDivider />
        <MenuItem icon={<IconX />} text="Mark written off" intent="danger" />
      </Menu>
    </div>
  ),
};
```

```bash
git add packages/core && git commit -m "feat(core): Menu, MenuItem, MenuDivider with keyboard navigation"
```

---

### Task 6: Dialog

**Files:**
- Create: `packages/core/src/dialog/{Dialog.tsx,dialog.module.css,Dialog.test.tsx,Dialog.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `IconX`.
- Produces: `Dialog` — `{ isOpen: boolean; onClose: () => void; title?: string; actions?: ReactNode; children: ReactNode }` on native `<dialog>`. `dialog.module.css` classes `.dialog/.head/.title/.body/.foot/.close` reused as the pattern for Drawer (T7).

- [ ] **Step 1: Write the failing tests**

`packages/core/src/dialog/Dialog.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Dialog } from "./Dialog.js";
import { Button } from "../button/Button.js";

describe("Dialog", () => {
  it("shows content when open, nothing when closed", () => {
    const { rerender } = render(<Dialog isOpen={false} onClose={() => {}} title="Record valuation">Body</Dialog>);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<Dialog isOpen onClose={() => {}} title="Record valuation">Body</Dialog>);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Record valuation" })).toBeTruthy();
  });
  it("close button calls onClose", async () => {
    const onClose = vi.fn();
    render(<Dialog isOpen onClose={onClose} title="Record valuation">Body</Dialog>);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("Escape (native cancel) calls onClose without unmanaged close", () => {
    const onClose = vi.fn();
    render(<Dialog isOpen onClose={onClose}>Body</Dialog>);
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("has no axe violations", async () => {
    const { baseElement } = render(
      <Dialog isOpen onClose={() => {}} title="Record valuation" actions={<Button variant="primary">Save valuation</Button>}>
        Set the Q4 2026 fair value.
      </Dialog>
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/dialog` — Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/core/src/dialog/dialog.module.css`:
```css
.dialog { padding: 0; border: 1px solid var(--border-hairline);
  border-radius: var(--radius-action); box-shadow: var(--elevation-overlay);
  background: var(--surface-raised); color: var(--text-1);
  width: min(460px, calc(100vw - 40px)); }
.dialog::backdrop { background: var(--scrim); }
.head { display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-bottom: 1px solid var(--border-hairline); }
.title { margin: 0; font-family: var(--font-sans); font-size: var(--fs-h-3); font-weight: 500; }
.close { appearance: none; border: 0; background: transparent; color: var(--text-2);
  display: inline-flex; padding: 4px; cursor: pointer; border-radius: var(--radius-action); }
.close:hover { background: var(--surface-sunken); }
.body { padding: 18px; font-size: var(--fs-ui); color: var(--text-2); }
.foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 18px;
  border-top: 1px solid var(--border-hairline); background: var(--surface-sunken); }
```

`packages/core/src/dialog/Dialog.tsx`:
```tsx
import { useEffect, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import { IconX } from "@neonglow/icons";
import styles from "./dialog.module.css";

export interface DialogProps {
  isOpen: boolean;
  /** Called on Escape, backdrop click and the close button. Parent flips isOpen. */
  onClose: () => void;
  title?: string;
  /** Footer slot, right-aligned. */
  actions?: ReactNode;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, title, actions, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    else if (!isOpen && d.open) d.close();
  }, [isOpen]);

  if (!isOpen) return null;

  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault(); // parent owns state; it will unmount us
    onClose();
  };
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog ref={ref} className={styles.dialog} onCancel={onCancel} onClick={onBackdropClick}>
      <div className={styles.head}>
        {title ? <h3 className={styles.title}>{title}</h3> : <span />}
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          <IconX size={16} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {actions ? <div className={styles.foot}>{actions}</div> : null}
    </dialog>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Dialog, type DialogProps } from "./dialog/Dialog.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/dialog` — Expected: PASS (4 tests).

`packages/core/src/dialog/Dialog.stories.tsx`:
```tsx
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "./Dialog.js";
import { Button } from "../button/Button.js";
import { FormGroup } from "../form/FormGroup.js";
import { NumericInput } from "../form/NumericInput.js";

const meta: Meta<typeof Dialog> = { title: "Core/Dialog", component: Dialog };
export default meta;
export const Open: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Record valuation</Button>
        <Dialog
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Record valuation"
          actions={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>Save valuation</Button>
            </>
          }
        >
          <p style={{ marginTop: 0 }}>Set the Q4 2026 fair value for Innomy. This updates blended MOIC across the fund.</p>
          <FormGroup label="Fair value" labelFor="dlg-fv">
            <NumericInput id="dlg-fv" defaultValue="€410,000" />
          </FormGroup>
        </Dialog>
      </>
    );
  },
};
```

```bash
git add packages/core && git commit -m "feat(core): Dialog on native <dialog> with scrim backdrop"
```

---

### Task 7: Drawer

**Files:**
- Create: `packages/core/src/drawer/{Drawer.tsx,drawer.module.css,Drawer.test.tsx,Drawer.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `DialogProps` shape, `cx`, `IconX`.
- Produces: `Drawer` — `DialogProps & { side?: "right" | "left" | "bottom"; size?: string }`.

- [ ] **Step 1: Write the failing tests**

`packages/core/src/drawer/Drawer.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Drawer } from "./Drawer.js";

describe("Drawer", () => {
  it("renders open with the side class and custom size", () => {
    render(<Drawer isOpen onClose={() => {}} side="left" size="300px" title="Filters">Body</Drawer>);
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("left");
    expect(dialog.style.getPropertyValue("--drawer-size")).toBe("300px");
  });
  it("close button calls onClose", async () => {
    const onClose = vi.fn();
    render(<Drawer isOpen onClose={onClose} title="Filters">Body</Drawer>);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("has no axe violations", async () => {
    const { baseElement } = render(<Drawer isOpen onClose={() => {}} title="Filters">Body</Drawer>);
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/drawer` — Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/core/src/drawer/drawer.module.css`:
```css
.drawer { padding: 0; border: 0; box-shadow: var(--elevation-overlay);
  background: var(--surface-raised); color: var(--text-1);
  position: fixed; margin: 0; max-width: none; max-height: none; }
.drawer::backdrop { background: var(--scrim); }
.right { inset: 0 0 0 auto; width: var(--drawer-size, 380px); height: 100vh;
  border-left: 1px solid var(--border-hairline); animation: fromRight .14s ease-out; }
.left { inset: 0 auto 0 0; width: var(--drawer-size, 380px); height: 100vh;
  border-right: 1px solid var(--border-hairline); animation: fromLeft .14s ease-out; }
.bottom { inset: auto 0 0 0; height: var(--drawer-size, 40vh); width: 100vw;
  border-top: 1px solid var(--border-hairline); animation: fromBottom .14s ease-out; }
@keyframes fromRight { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes fromLeft { from { transform: translateX(-24px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes fromBottom { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
.head { display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-bottom: 1px solid var(--border-hairline); }
.title { margin: 0; font-family: var(--font-sans); font-size: var(--fs-h-3); font-weight: 500; }
.close { appearance: none; border: 0; background: transparent; color: var(--text-2);
  display: inline-flex; padding: 4px; cursor: pointer; border-radius: var(--radius-action); }
.close:hover { background: var(--surface-sunken); }
.body { padding: 18px; font-size: var(--fs-ui); color: var(--text-2); overflow-y: auto; }
```

`packages/core/src/drawer/Drawer.tsx`:
```tsx
import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import { IconX } from "@neonglow/icons";
import { cx } from "../cx.js";
import styles from "./drawer.module.css";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "right" | "left" | "bottom";
  /** CSS length: width for left/right, height for bottom. */
  size?: string;
  children: ReactNode;
}

export function Drawer({ isOpen, onClose, title, side = "right", size, children }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    else if (!isOpen && d.open) d.close();
  }, [isOpen]);

  if (!isOpen) return null;

  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={cx(styles.drawer, styles[side])}
      style={size ? ({ "--drawer-size": size } as CSSProperties) : undefined}
      onCancel={onCancel}
      onClick={onBackdropClick}
    >
      <div className={styles.head}>
        {title ? <h3 className={styles.title}>{title}</h3> : <span />}
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          <IconX size={16} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Drawer, type DrawerProps } from "./drawer/Drawer.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/drawer` — Expected: PASS (3 tests).

`packages/core/src/drawer/Drawer.stories.tsx`:
```tsx
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Drawer } from "./Drawer.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof Drawer> = { title: "Core/Drawer", component: Drawer };
export default meta;
export const Right: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Holding details</Button>
        <Drawer isOpen={open} onClose={() => setOpen(false)} title="Hedgehop — holding detail">
          <p>Spain · Agritech · Indoor hop farming</p>
          <p>Entry Jul 2020 · Exit Dec 2022 · 29 months hold</p>
        </Drawer>
      </>
    );
  },
};
```

```bash
git add packages/core && git commit -m "feat(core): Drawer docked native-dialog variant"
```

---

### Task 8: Toast + imperative toaster

**Files:**
- Create: `packages/core/src/toast/{toaster.ts,Toaster.tsx,toast.module.css,Toast.test.tsx,Toast.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `Portal`, `cx`, `Intent`, intent icons + `IconX`.
- Produces: `toaster: ToasterInstance` (`show(options): string`, `dismiss(key)`, `clear()`), `Toaster({ placement? })`, types `ToastOptions`, `ToasterProps`. Store is module-level; `show` works before mount.

- [ ] **Step 1: Write the failing tests**

`packages/core/src/toast/Toast.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { toaster } from "./toaster.js";
import { Toaster } from "./Toaster.js";

beforeEach(() => {
  vi.useFakeTimers();
  toaster.clear();
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("toaster", () => {
  it("buffers shows fired before mount", () => {
    act(() => {
      toaster.show({ message: "Valuation saved", intent: "success" });
    });
    render(<Toaster />);
    expect(screen.getByRole("status").textContent).toContain("Valuation saved");
  });
  it("auto-dismisses after timeout", () => {
    render(<Toaster />);
    act(() => {
      toaster.show({ message: "Valuation saved", timeout: 3000 });
    });
    expect(screen.getByRole("status")).toBeTruthy();
    act(() => vi.advanceTimersByTime(3100));
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("danger uses role=alert; sticky when timeout 0", () => {
    render(<Toaster />);
    act(() => {
      toaster.show({ message: "Write-off recorded", intent: "danger", timeout: 0 });
    });
    expect(screen.getByRole("alert")).toBeTruthy();
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByRole("alert")).toBeTruthy();
  });
  it("dismiss(key) removes; caps at 5 visible", () => {
    render(<Toaster />);
    let firstKey = "";
    act(() => {
      firstKey = toaster.show({ message: "t1", timeout: 0 });
      for (let i = 2; i <= 6; i++) toaster.show({ message: `t${i}`, timeout: 0 });
    });
    expect(screen.getAllByRole("status").length).toBe(5); // t1 dropped (FIFO)
    expect(screen.queryByText("t1")).toBeNull();
    act(() => toaster.dismiss(firstKey)); // no-op, already dropped
    act(() => {
      toaster.clear();
    });
    expect(screen.queryAllByRole("status").length).toBe(0);
  });
  it("has no axe violations", async () => {
    render(<Toaster />);
    act(() => {
      toaster.show({ message: "Valuation saved", intent: "success", timeout: 0 });
    });
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/toast` — Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/core/src/toast/toaster.ts`:
```ts
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { Intent } from "../types.js";

export interface ToastOptions {
  message: ReactNode;
  intent?: Intent;
  /** ms until auto-dismiss. 0 = sticky. Default 5000. */
  timeout?: number;
  action?: { text: string; onClick: () => void };
}

export interface ToasterInstance {
  show(options: ToastOptions): string;
  dismiss(key: string): void;
  clear(): void;
}

export interface ToastEntry {
  key: string;
  options: ToastOptions;
}

const MAX_VISIBLE = 5;
let toasts: ToastEntry[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const toaster: ToasterInstance = {
  show(options) {
    const key = `ng-toast-${++counter}`;
    toasts = [...toasts, { key, options }].slice(-MAX_VISIBLE);
    emit();
    return key;
  },
  dismiss(key) {
    toasts = toasts.filter((t) => t.key !== key);
    emit();
  },
  clear() {
    toasts = [];
    emit();
  },
};

export function useToasts(): ToastEntry[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => toasts
  );
}
```

`packages/core/src/toast/toast.module.css`:
```css
.host { position: fixed; z-index: 40; display: flex; flex-direction: column; gap: 10px;
  padding: 16px; pointer-events: none; }
.top { top: 0; left: 50%; transform: translateX(-50%); align-items: center; }
.topRight { top: 0; right: 0; align-items: flex-end; }
.bottomRight { bottom: 0; right: 0; align-items: flex-end; }
.toast { pointer-events: auto; display: flex; align-items: flex-start; gap: 10px;
  min-width: 260px; max-width: 380px; padding: 12px 12px 12px 14px;
  background: var(--surface-raised); color: var(--text-1);
  border: 1px solid var(--border-hairline); border-radius: var(--radius-action);
  box-shadow: var(--elevation-overlay);
  font-family: var(--font-sans); font-size: var(--fs-ui);
  animation: toastIn .12s ease-out; }
@keyframes toastIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.icon { display: inline-flex; margin-top: 2px; filter: drop-shadow(var(--glow)); }
.success .icon { color: var(--intent-success); }
.warning .icon { color: var(--intent-warning); }
.danger .icon { color: var(--intent-danger); }
.info .icon { color: var(--intent-info); }
.msg { color: var(--text-2); line-height: var(--baseline); flex: 1; }
.action { appearance: none; border: 0; background: transparent; cursor: pointer;
  color: var(--accent-text); font-family: var(--font-sans); font-size: var(--fs-ui); font-weight: 500;
  padding: 0 4px; border-radius: var(--radius-action); }
.close { appearance: none; border: 0; background: transparent; color: var(--text-3);
  display: inline-flex; padding: 2px; cursor: pointer; border-radius: var(--radius-action); }
.close:hover { color: var(--text-1); background: var(--surface-sunken); }
```

`packages/core/src/toast/Toaster.tsx`:
```tsx
import { useCallback, useEffect, useRef } from "react";
import { IconError, IconInfo, IconSuccess, IconWarning, IconX } from "@neonglow/icons";
import { cx } from "../cx.js";
import { Portal } from "../utils/Portal.js";
import { toaster, useToasts, type ToastEntry } from "./toaster.js";
import styles from "./toast.module.css";

const ICONS = { success: IconSuccess, warning: IconWarning, danger: IconError, info: IconInfo } as const;
const PLACEMENT_CLASS = { top: "top", "top-right": "topRight", "bottom-right": "bottomRight" } as const;

export interface ToasterProps {
  placement?: keyof typeof PLACEMENT_CLASS;
}

function ToastView({ entry }: { entry: ToastEntry }) {
  const { message, intent = "none", timeout = 5000, action } = entry.options;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = useCallback(() => {
    if (timeout > 0) timer.current = setTimeout(() => toaster.dismiss(entry.key), timeout);
  }, [timeout, entry.key]);
  const stop = () => clearTimeout(timer.current);
  useEffect(() => {
    start();
    return stop;
  }, [start]);
  const Icon = intent !== "none" ? ICONS[intent] : null;
  return (
    <div
      role={intent === "danger" ? "alert" : "status"}
      className={cx(styles.toast, intent !== "none" && styles[intent])}
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
    >
      {Icon ? <span className={styles.icon}><Icon size={16} /></span> : null}
      <div className={styles.msg}>{message}</div>
      {action ? (
        <button type="button" className={styles.action} onClick={() => { action.onClick(); toaster.dismiss(entry.key); }}>
          {action.text}
        </button>
      ) : null}
      <button type="button" className={styles.close} aria-label="Dismiss" onClick={() => toaster.dismiss(entry.key)}>
        <IconX size={16} />
      </button>
    </div>
  );
}

export function Toaster({ placement = "top-right" }: ToasterProps) {
  const toasts = useToasts();
  return (
    <Portal>
      <div className={cx(styles.host, styles[PLACEMENT_CLASS[placement]])}>
        {toasts.map((t) => (
          <ToastView key={t.key} entry={t} />
        ))}
      </div>
    </Portal>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { toaster, type ToastOptions, type ToasterInstance } from "./toast/toaster.js";
export { Toaster, type ToasterProps } from "./toast/Toaster.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/toast` — Expected: PASS (5 tests).

`packages/core/src/toast/Toast.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { toaster } from "./toaster.js";
import { Toaster } from "./Toaster.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof Toaster> = { title: "Core/Toast", component: Toaster };
export default meta;
export const Interactive: StoryObj = {
  render: () => (
    <>
      <Toaster />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button onClick={() => toaster.show({ message: "Valuation saved. Blended MOIC is now 1.47×.", intent: "success", timeout: 0 })}>Success</Button>
        <Button onClick={() => toaster.show({ message: "Two positions have no fresh round in 18 months.", intent: "warning", timeout: 0 })}>Warning</Button>
        <Button onClick={() => toaster.show({ message: "Write-off recorded.", intent: "danger", timeout: 0 })}>Danger</Button>
      </div>
    </>
  ),
};
```

```bash
git add packages/core && git commit -m "feat(core): Toast + imperative toaster singleton"
```

---

### Task 9: Tabs

**Files:**
- Create: `packages/core/src/tabs/{Tabs.tsx,tabs.module.css,Tabs.test.tsx,Tabs.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `useControllableState`, `cx`.
- Produces: `Tabs` — `{ tabs: Array<{ id, title, disabled?, panel? }>; selectedId?; defaultSelectedId?; onChange? }`.

- [ ] **Step 1: Write the failing tests**

`packages/core/src/tabs/Tabs.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tabs } from "./Tabs.js";

const TABS = [
  { id: "overview", title: "Overview", panel: <p>Overview panel</p> },
  { id: "holdings", title: "Holdings", panel: <p>Holdings panel</p> },
  { id: "docs", title: "Documents", disabled: true, panel: <p>Docs panel</p> },
  { id: "cash", title: "Cashflows", panel: <p>Cash panel</p> },
];

describe("Tabs", () => {
  it("selects first tab by default and switches on click", async () => {
    render(<Tabs tabs={TABS} />);
    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Overview panel")).toBeTruthy();
    await userEvent.click(screen.getByRole("tab", { name: "Holdings" }));
    expect(screen.getByText("Holdings panel")).toBeTruthy();
    expect(screen.queryByText("Overview panel")).toBeNull();
  });
  it("arrow keys move selection and skip disabled tabs", async () => {
    render(<Tabs tabs={TABS} />);
    const first = screen.getByRole("tab", { name: "Overview" });
    first.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}"); // Holdings, then skip Documents -> Cashflows
    expect(screen.getByRole("tab", { name: "Cashflows" }).getAttribute("aria-selected")).toBe("true");
    await userEvent.keyboard("{ArrowRight}"); // wraps to Overview
    expect(first.getAttribute("aria-selected")).toBe("true");
  });
  it("controlled mode reports without switching", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={TABS} selectedId="overview" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Holdings" }));
    expect(onChange).toHaveBeenCalledWith("holdings");
    expect(screen.getByText("Overview panel")).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tabs tabs={TABS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/tabs` — Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/core/src/tabs/tabs.module.css`:
```css
.list { display: flex; gap: 2px; border-bottom: 2px solid var(--border-hairline); }
.tab { appearance: none; border: 0; background: transparent; color: var(--text-3);
  font-family: var(--font-sans); font-size: var(--fs-ui); font-weight: 500;
  line-height: var(--baseline); padding: var(--baseline-half) 14px;
  cursor: pointer; position: relative; transition: color .12s ease; }
.tab:hover { color: var(--text-1); }
.tab:disabled { opacity: .4; cursor: not-allowed; }
.active { color: var(--text-1); }
.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -2px;
  height: 2px; background: var(--accent); }
.panel { padding-top: var(--baseline-half); font-size: var(--fs-ui); color: var(--text-2); }
```

`packages/core/src/tabs/Tabs.tsx`:
```tsx
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

  const active = tabs.find((t) => t.id === sel);
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
            aria-controls={`${uid}-panel-${t.id}`}
            disabled={t.disabled}
            tabIndex={t.id === sel ? 0 : -1}
            className={cx(styles.tab, t.id === sel && styles.active)}
            onClick={() => setSel(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>
      {active?.panel != null ? (
        <div role="tabpanel" id={`${uid}-panel-${active.id}`} aria-labelledby={`${uid}-tab-${active.id}`} className={styles.panel}>
          {active.panel}
        </div>
      ) : null}
    </div>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Tabs, type TabsProps, type TabDef } from "./tabs/Tabs.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/tabs` — Expected: PASS (4 tests).

`packages/core/src/tabs/Tabs.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs.js";

const meta: Meta<typeof Tabs> = { title: "Core/Tabs", component: Tabs };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <Tabs
      tabs={[
        { id: "overview", title: "Overview", panel: <p>Across two vehicles, we have deployed €4.15M into 35 portfolio companies.</p> },
        { id: "holdings", title: "Holdings", panel: <p>35 companies · blended 1.47×.</p> },
        { id: "cash", title: "Cashflows", panel: <p>€152K → €797K.</p> },
        { id: "docs", title: "Documents", disabled: true },
      ]}
    />
  ),
};
```

```bash
git add packages/core && git commit -m "feat(core): Tabs with roving tabindex and accent indicator"
```

---

### Task 10: Breadcrumbs + NonIdealState

**Files:**
- Create: `packages/core/src/breadcrumbs/{Breadcrumbs.tsx,breadcrumbs.module.css,Breadcrumbs.test.tsx,Breadcrumbs.stories.tsx}`, `packages/core/src/nonideal/{NonIdealState.tsx,nonideal.module.css,NonIdealState.test.tsx,NonIdealState.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `IconChevronRight` from `@neonglow/icons`.
- Produces: `Breadcrumbs` — `{ items: Array<{ text: string; href?: string; onClick?: () => void }> }`; `NonIdealState` — `{ icon?, title, description?, action? }`.

- [ ] **Step 1: Write the failing tests**

`packages/core/src/breadcrumbs/Breadcrumbs.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Breadcrumbs } from "./Breadcrumbs.js";

const ITEMS = [
  { text: "Funds", href: "#funds" },
  { text: "Foodtech I", href: "#f1" },
  { text: "Portfolio" },
];

describe("Breadcrumbs", () => {
  it("marks the last item as the current page", () => {
    render(<Breadcrumbs items={ITEMS} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumbs" })).toBeTruthy();
    const current = screen.getByText("Portfolio");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Funds" })).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Breadcrumbs items={ITEMS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

`packages/core/src/nonideal/NonIdealState.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { IconSearch } from "@neonglow/icons";
import { NonIdealState } from "./NonIdealState.js";
import { Button } from "../button/Button.js";

describe("NonIdealState", () => {
  it("renders title, description and action", () => {
    render(
      <NonIdealState
        icon={<IconSearch size={20} />}
        title="No holdings match"
        description="Adjust the sector filter to see more companies."
        action={<Button>Clear filters</Button>}
      />
    );
    expect(screen.getByRole("heading", { name: "No holdings match" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<NonIdealState title="No holdings match" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/breadcrumbs src/nonideal` — Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/core/src/breadcrumbs/breadcrumbs.module.css`:
```css
.nav {}
.list { list-style: none; display: flex; align-items: center; gap: 8px; margin: 0; padding: 0;
  font-family: var(--font-sans); font-size: var(--fs-ui); color: var(--text-3); }
.item { display: flex; align-items: center; gap: 8px; }
.link { color: var(--text-3); text-decoration: none; background: transparent; border: 0;
  padding: 0; font: inherit; cursor: pointer; }
.link:hover { color: var(--text-1); }
.sep { display: inline-flex; color: var(--text-3); opacity: .6; }
.current { color: var(--text-1); font-weight: 500; }
```

`packages/core/src/breadcrumbs/Breadcrumbs.tsx`:
```tsx
import { IconChevronRight } from "@neonglow/icons";
import styles from "./breadcrumbs.module.css";

export interface BreadcrumbItem {
  text: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumbs" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.text}-${i}`} className={styles.item}>
              {isLast ? (
                <span className={styles.current} aria-current="page">{item.text}</span>
              ) : item.href ? (
                <a className={styles.link} href={item.href} onClick={item.onClick}>{item.text}</a>
              ) : (
                <button type="button" className={styles.link} onClick={item.onClick}>{item.text}</button>
              )}
              {!isLast ? <span className={styles.sep} aria-hidden="true"><IconChevronRight size={16} /></span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

`packages/core/src/nonideal/nonideal.module.css`:
```css
.root { display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; gap: var(--baseline-half); padding: calc(var(--baseline) * 2); }
.icon { display: inline-flex; color: var(--text-3); }
.title { margin: 0; font-family: var(--font-sans); font-size: var(--fs-h-3); font-weight: 500; color: var(--text-1); }
.desc { margin: 0; font-size: var(--fs-ui); color: var(--text-3); max-width: 44ch; line-height: var(--baseline); }
.action { margin-top: var(--baseline-half); }
```

`packages/core/src/nonideal/NonIdealState.tsx`:
```tsx
import type { ReactNode } from "react";
import styles from "./nonideal.module.css";

export interface NonIdealStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /** An empty screen is an invitation to act. */
  action?: ReactNode;
}

export function NonIdealState({ icon, title, description, action }: NonIdealStateProps) {
  return (
    <div className={styles.root}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.desc}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from "./breadcrumbs/Breadcrumbs.js";
export { NonIdealState, type NonIdealStateProps } from "./nonideal/NonIdealState.js";
```

- [ ] **Step 4: Verify + stories + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/breadcrumbs src/nonideal` — Expected: PASS (4 tests).

`packages/core/src/breadcrumbs/Breadcrumbs.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "./Breadcrumbs.js";

const meta: Meta<typeof Breadcrumbs> = { title: "Core/Breadcrumbs", component: Breadcrumbs };
export default meta;
export const Default: StoryObj = {
  render: () => <Breadcrumbs items={[{ text: "Funds", href: "#" }, { text: "Foodtech I", href: "#" }, { text: "Portfolio" }]} />,
};
```

`packages/core/src/nonideal/NonIdealState.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { IconSearch } from "@neonglow/icons";
import { NonIdealState } from "./NonIdealState.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof NonIdealState> = { title: "Core/NonIdealState", component: NonIdealState };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <NonIdealState
      icon={<IconSearch size={20} />}
      title="No holdings match"
      description="Adjust the sector filter to see more companies."
      action={<Button>Clear filters</Button>}
    />
  ),
};
```

```bash
git add packages/core && git commit -m "feat(core): Breadcrumbs + NonIdealState"
```

---

### Task 11: Navbar (+ Group, Heading, Divider)

**Files:**
- Create: `packages/core/src/navbar/{Navbar.tsx,navbar.module.css,Navbar.test.tsx,Navbar.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `--navbar-h` token (T2).
- Produces: `Navbar`, `NavbarGroup ({ align?: "left" | "right" })`, `NavbarHeading`, `NavbarDivider` — all `HTMLAttributes<HTMLElement>`-based.

- [ ] **Step 1: Write the failing tests**

`packages/core/src/navbar/Navbar.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Navbar, NavbarGroup, NavbarHeading, NavbarDivider } from "./Navbar.js";
import { Button } from "../button/Button.js";

describe("Navbar", () => {
  it("renders a banner with heading and groups", () => {
    render(
      <Navbar>
        <NavbarGroup>
          <NavbarHeading>neonglow</NavbarHeading>
          <NavbarDivider />
          <Button variant="ghost">Portfolio</Button>
        </NavbarGroup>
        <NavbarGroup align="right"><Button variant="primary">Commit capital</Button></NavbarGroup>
      </Navbar>
    );
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByText("neonglow")).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(
      <Navbar><NavbarGroup><NavbarHeading>neonglow</NavbarHeading></NavbarGroup></Navbar>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/navbar` — Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/core/src/navbar/navbar.module.css`:
```css
/* Data surface: radius 0, no shadow. */
.navbar { display: flex; align-items: center; justify-content: space-between;
  height: var(--navbar-h); padding: 0 var(--baseline);
  background: var(--surface); color: var(--text-1);
  border-bottom: 1px solid var(--border-hairline); border-radius: var(--radius-0); }
.group { display: flex; align-items: center; gap: 10px; height: 100%; }
.heading { font-family: var(--font-sans); font-size: var(--fs-h-3); font-weight: 700;
  letter-spacing: -.02em; margin: 0 6px 0 0; }
.divider { width: 1px; height: 40%; background: var(--border-hairline); }
```

`packages/core/src/navbar/Navbar.tsx`:
```tsx
import type { HTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./navbar.module.css";

export function Navbar({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <header className={cx(styles.navbar, className)} {...rest} />;
}

export interface NavbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  align?: "left" | "right";
}

export function NavbarGroup({ align = "left", className, ...rest }: NavbarGroupProps) {
  return <div data-align={align} className={cx(styles.group, className)} {...rest} />;
}

export function NavbarHeading({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.heading, className)} {...rest} />;
}

export function NavbarDivider(props: HTMLAttributes<HTMLSpanElement>) {
  return <span aria-hidden="true" className={styles.divider} {...props} />;
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Navbar, NavbarGroup, NavbarHeading, NavbarDivider, type NavbarGroupProps } from "./navbar/Navbar.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/navbar` — Expected: PASS (2 tests).

`packages/core/src/navbar/Navbar.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Navbar, NavbarGroup, NavbarHeading, NavbarDivider } from "./Navbar.js";
import { Button } from "../button/Button.js";
import { Tag } from "../tag/Tag.js";

const meta: Meta<typeof Navbar> = { title: "Core/Navbar", component: Navbar };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <Navbar>
      <NavbarGroup>
        <NavbarHeading>neonglow</NavbarHeading>
        <NavbarDivider />
        <Button variant="ghost">Portfolio</Button>
        <Button variant="ghost">Cashflows</Button>
      </NavbarGroup>
      <NavbarGroup align="right">
        <Tag intent="success">1.47×</Tag>
        <Button variant="primary">Commit capital</Button>
      </NavbarGroup>
    </Navbar>
  ),
};
```

```bash
git add packages/core && git commit -m "feat(core): Navbar with group/heading/divider slots"
```

---

### Task 12: Tree

**Files:**
- Create: `packages/core/src/tree/{Tree.tsx,tree.module.css,Tree.test.tsx,Tree.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `IconChevronRight`.
- Produces: `Tree<T>`, `TreeNode<T>` per spec §3 (fully controlled; callbacks report `(node, path)`).

- [ ] **Step 1: Write the failing tests**

`packages/core/src/tree/Tree.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tree, type TreeNode } from "./Tree.js";

const CONTENTS: TreeNode[] = [
  {
    id: "fund1", label: "Foodtech Fund I", isExpanded: true, secondaryLabel: "28",
    childNodes: [
      { id: "hedgehop", label: "Hedgehop", secondaryLabel: "14.58×", isSelected: true },
      { id: "nucaps", label: "Nucaps", secondaryLabel: "2.09×" },
    ],
  },
  { id: "spv", label: "Genesys SPV", secondaryLabel: "7", childNodes: [{ id: "cocuus", label: "Cocuus" }] },
];

describe("Tree", () => {
  it("renders visible nodes with tree semantics; collapsed children hidden", () => {
    render(<Tree contents={CONTENTS} />);
    expect(screen.getByRole("tree")).toBeTruthy();
    const fund = screen.getByRole("treeitem", { name: /Foodtech Fund I/ });
    expect(fund.getAttribute("aria-expanded")).toBe("true");
    expect(fund.getAttribute("aria-level")).toBe("1");
    expect(screen.getByRole("treeitem", { name: /Hedgehop/ }).getAttribute("aria-level")).toBe("2");
    expect(screen.getByRole("treeitem", { name: /Hedgehop/ }).getAttribute("aria-selected")).toBe("true");
    expect(screen.queryByRole("treeitem", { name: /Cocuus/ })).toBeNull();
  });
  it("chevron click on a collapsed node calls onNodeExpand with node and path", async () => {
    const onNodeExpand = vi.fn();
    render(<Tree contents={CONTENTS} onNodeExpand={onNodeExpand} />);
    const spv = screen.getByRole("treeitem", { name: /Genesys SPV/ });
    await userEvent.click(spv.querySelector("[data-tree-chevron]")!);
    expect(onNodeExpand).toHaveBeenCalledOnce();
    expect(onNodeExpand.mock.calls[0][0].id).toBe("spv");
    expect(onNodeExpand.mock.calls[0][1]).toEqual([1]);
  });
  it("chevron click on an expanded node calls onNodeCollapse", async () => {
    const onNodeCollapse = vi.fn();
    render(<Tree contents={CONTENTS} onNodeCollapse={onNodeCollapse} />);
    const fund = screen.getByRole("treeitem", { name: /Foodtech Fund I/ });
    await userEvent.click(fund.querySelector("[data-tree-chevron]")!);
    expect(onNodeCollapse.mock.calls[0][0].id).toBe("fund1");
  });
  it("row click calls onNodeClick with path", async () => {
    const onNodeClick = vi.fn();
    render(<Tree contents={CONTENTS} onNodeClick={onNodeClick} />);
    await userEvent.click(screen.getByText("Nucaps"));
    expect(onNodeClick.mock.calls[0][0].id).toBe("nucaps");
    expect(onNodeClick.mock.calls[0][1]).toEqual([0, 1]);
  });
  it("keyboard: Down moves, Right expands collapsed, Left collapses expanded", async () => {
    const onNodeExpand = vi.fn();
    const onNodeCollapse = vi.fn();
    render(<Tree contents={CONTENTS} onNodeExpand={onNodeExpand} onNodeCollapse={onNodeCollapse} />);
    const items = screen.getAllByRole("treeitem");
    items[0].focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(items[1]);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard("{ArrowLeft}");                 // expanded -> collapse
    expect(onNodeCollapse).toHaveBeenCalledOnce();
    const spv = screen.getByRole("treeitem", { name: /Genesys SPV/ });
    spv.focus();
    await userEvent.keyboard("{ArrowRight}");                // collapsed -> expand
    expect(onNodeExpand).toHaveBeenCalledOnce();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tree contents={CONTENTS} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @neonglow/core exec vitest run src/tree` — Expected: FAIL.

- [ ] **Step 3: Implement**

`packages/core/src/tree/tree.module.css`:
```css
.tree { list-style: none; margin: 0; padding: 0; font-family: var(--font-sans); font-size: var(--fs-ui); }
.group { list-style: none; margin: 0; padding: 0 0 0 22px;
  border-left: 1px solid var(--border-hairline); }
.item { outline-offset: -2px; }
.row { display: flex; align-items: center; gap: 8px; height: var(--row-h);
  padding: 0 8px; border-radius: var(--radius-0); cursor: pointer; color: var(--text-2);
  transition: background .1s ease; }
.row:hover { background: var(--surface-sunken); color: var(--text-1); }
.selected > .row { background: color-mix(in srgb, var(--accent) 16%, var(--surface));
  box-shadow: inset 3px 0 0 var(--accent); color: var(--text-1); }
.chevron { display: inline-flex; width: 16px; height: 16px; align-items: center;
  justify-content: center; color: var(--text-3); flex: none;
  transition: transform .12s ease; }
.chevron[data-expanded="true"] { transform: rotate(90deg); }
.chevronSpacer { width: 16px; flex: none; }
.icon { display: inline-flex; color: var(--text-3); flex: none; }
.label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.secondary { font-family: var(--font-mono); font-size: var(--fs-micro);
  color: var(--text-3); font-variant-numeric: tabular-nums; }
.disabled > .row { opacity: .4; cursor: not-allowed; }
```

`packages/core/src/tree/Tree.tsx`:
```tsx
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { IconChevronRight } from "@neonglow/icons";
import { cx } from "../cx.js";
import styles from "./tree.module.css";

export interface TreeNode<T = unknown> {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Right-aligned mono slot, e.g. a MOIC or count. */
  secondaryLabel?: ReactNode;
  childNodes?: TreeNode<T>[];
  isExpanded?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  nodeData?: T;
}

export interface TreeProps<T = unknown> {
  contents: TreeNode<T>[];
  onNodeClick?: (node: TreeNode<T>, path: number[]) => void;
  onNodeExpand?: (node: TreeNode<T>, path: number[]) => void;
  onNodeCollapse?: (node: TreeNode<T>, path: number[]) => void;
}

function Row<T>({ node, path, level, props }: {
  node: TreeNode<T>; path: number[]; level: number; props: TreeProps<T>;
}) {
  const hasChildren = !!node.childNodes?.length;
  const expanded = hasChildren ? !!node.isExpanded : undefined;

  const toggle = () => {
    if (!hasChildren || node.disabled) return;
    (expanded ? props.onNodeCollapse : props.onNodeExpand)?.(node, path);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter") {
      e.preventDefault();
      props.onNodeClick?.(node, path);
    } else if (e.key === "ArrowRight" && hasChildren && !expanded) {
      e.preventDefault();
      props.onNodeExpand?.(node, path);
    } else if (e.key === "ArrowLeft" && hasChildren && expanded) {
      e.preventDefault();
      props.onNodeCollapse?.(node, path);
    }
  };

  return (
    <li
      role="treeitem"
      aria-expanded={expanded}
      aria-selected={!!node.isSelected}
      aria-level={level}
      aria-disabled={node.disabled || undefined}
      tabIndex={0}
      className={cx(styles.item, node.isSelected && styles.selected, node.disabled && styles.disabled)}
      onKeyDown={onKeyDown}
    >
      <div
        className={styles.row}
        onClick={() => {
          if (!node.disabled) props.onNodeClick?.(node, path);
        }}
      >
        {hasChildren ? (
          <span
            data-tree-chevron
            data-expanded={expanded}
            className={styles.chevron}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            <IconChevronRight size={16} />
          </span>
        ) : (
          <span className={styles.chevronSpacer} />
        )}
        {node.icon ? <span className={styles.icon}>{node.icon}</span> : null}
        <span className={styles.label}>{node.label}</span>
        {node.secondaryLabel != null ? <span className={styles.secondary}>{node.secondaryLabel}</span> : null}
      </div>
      {hasChildren && expanded ? (
        <ul role="group" className={styles.group}>
          {node.childNodes!.map((child, i) => (
            <Row key={child.id} node={child} path={[...path, i]} level={level + 1} props={props} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function Tree<T = unknown>(props: TreeProps<T>) {
  const ref = useRef<HTMLUListElement>(null);
  // Up/Down move focus across all visible treeitems (collapsed children are unmounted).
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(ref.current?.querySelectorAll<HTMLLIElement>('[role="treeitem"]') ?? []);
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLLIElement);
    const next = e.key === "ArrowDown" ? Math.min(i + 1, items.length - 1) : Math.max(i - 1, 0);
    e.preventDefault();
    items[next].focus();
  };
  return (
    <ul role="tree" ref={ref} className={styles.tree} onKeyDown={onKeyDown}>
      {props.contents.map((node, i) => (
        <Row key={node.id} node={node} path={[i]} level={1} props={props} />
      ))}
    </ul>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Tree, type TreeProps, type TreeNode } from "./tree/Tree.js";
```

- [ ] **Step 4: Verify + story + commit**

Run: `pnpm --filter @neonglow/core exec vitest run src/tree` — Expected: PASS (6 tests).

`packages/core/src/tree/Tree.stories.tsx`:
```tsx
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IconFolder, IconDoc } from "@neonglow/icons";
import { Tree, type TreeNode } from "./Tree.js";

const meta: Meta<typeof Tree> = { title: "Core/Tree", component: Tree };
export default meta;

const INITIAL: TreeNode[] = [
  {
    id: "fund1", label: "Foodtech Acceleration Fund I", icon: <IconFolder />, secondaryLabel: "28", isExpanded: true,
    childNodes: [
      { id: "hedgehop", label: "Hedgehop", icon: <IconDoc />, secondaryLabel: "14.58×", isSelected: true },
      { id: "nucaps", label: "Nucaps", icon: <IconDoc />, secondaryLabel: "2.09×" },
      { id: "innomy", label: "Innomy", icon: <IconDoc />, secondaryLabel: "1.64×" },
    ],
  },
  {
    id: "spv", label: "Spain Foodtech Genesys SPV", icon: <IconFolder />, secondaryLabel: "7",
    childNodes: [{ id: "cocuus", label: "Cocuus", icon: <IconDoc />, secondaryLabel: "2.55×" }],
  },
];

function setExpanded(nodes: TreeNode[], path: number[], value: boolean): TreeNode[] {
  const [head, ...rest] = path;
  return nodes.map((n, i) =>
    i !== head ? n : rest.length
      ? { ...n, childNodes: setExpanded(n.childNodes ?? [], rest, value) }
      : { ...n, isExpanded: value }
  );
}

export const FundStructure: StoryObj = {
  render: function Render() {
    const [contents, setContents] = useState(INITIAL);
    return (
      <div style={{ maxWidth: 380 }}>
        <Tree
          contents={contents}
          onNodeExpand={(_n, path) => setContents((c) => setExpanded(c, path, true))}
          onNodeCollapse={(_n, path) => setContents((c) => setExpanded(c, path, false))}
        />
      </div>
    );
  },
};
```

Note: `IconFolder`/`IconDoc` exist from Phase 0 (icon set) — verify names in `packages/icons/src/index.tsx`; if the exports are named differently (e.g. not present), use `IconCalendar`/`IconClock` in the story instead and note it.

```bash
git add packages/core && git commit -m "feat(core): Tree with controlled expansion and full keyboard nav"
```

---

### Task 13: Integration — full build, app-shell story, VR reseed, push

**Files:**
- Create: `apps/docs/stories/AppShell.stories.tsx`
- Modify: `vrt/baseline/` (reseed)

**Interfaces:**
- Consumes: everything Phase 2 exports.

- [ ] **Step 1: App-shell story (Navbar + Tabs + Tree + Breadcrumbs + NonIdealState together)**

`apps/docs/stories/AppShell.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumbs, Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading,
  NonIdealState, Tabs, Tag, Tree,
} from "@neonglow/core";
import { IconSearch } from "@neonglow/icons";

const meta: Meta = { title: "Core/App shell" };
export default meta;

export const PortfolioWorkbench: StoryObj = {
  render: () => (
    <div style={{ border: "1px solid var(--border-hairline)" }}>
      <Navbar>
        <NavbarGroup>
          <NavbarHeading>neonglow</NavbarHeading>
          <NavbarDivider />
          <Button variant="ghost">Portfolio</Button>
          <Button variant="ghost">Cashflows</Button>
        </NavbarGroup>
        <NavbarGroup align="right">
          <Tag intent="success">1.47×</Tag>
          <Button variant="primary">Commit capital</Button>
        </NavbarGroup>
      </Navbar>
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        <Tree
          contents={[
            {
              id: "f1", label: "Foodtech Fund I", secondaryLabel: "28", isExpanded: true,
              childNodes: [
                { id: "h", label: "Hedgehop", secondaryLabel: "14.58×", isSelected: true },
                { id: "n", label: "Nucaps", secondaryLabel: "2.09×" },
              ],
            },
          ]}
        />
        <div>
          <Breadcrumbs items={[{ text: "Funds", href: "#" }, { text: "Foodtech I", href: "#" }, { text: "Hedgehop" }]} />
          <div style={{ marginTop: 12 }}>
            <Tabs
              tabs={[
                { id: "o", title: "Overview", panel: <p>Entry Jul 2020 · Exit Dec 2022 · 29 months hold · 14.58×.</p> },
                {
                  id: "d", title: "Documents",
                  panel: (
                    <NonIdealState
                      icon={<IconSearch size={20} />}
                      title="No documents yet"
                      description="Upload the investment memo to complete this holding."
                      action={<Button>Upload memo</Button>}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
```

- [ ] **Step 2: Full build + all tests**

Run (per package if turbo/pnpm PATH issue recurs):
`pnpm --filter @neonglow/tokens build && pnpm --filter @neonglow/icons build && pnpm --filter @neonglow/core build && pnpm --filter @neonglow/docs build`
`pnpm --filter @neonglow/tokens exec vitest run` → 9 · `pnpm --filter @neonglow/icons exec vitest run` → 4 · `pnpm --filter @neonglow/core exec vitest run` → 71.
Hex grep: `grep -cE "#[0-9a-fA-F]{3,8}" packages/core/dist/neonglow-core.css || echo 0` → Expected `0`.

- [ ] **Step 3: VR reseed**

```bash
rm -f vrt/baseline/*.png
pnpm vrt   # seeds all stories x 2 themes
pnpm vrt   # Expected: 0 seeded, 0 failures
```
If the Toast story flakes (its toasts are interaction-triggered so should render empty — fine) or Dialog/Drawer animations race, add `await page.emulateMedia({ reducedMotion: "reduce" })` after `newPage` in `scripts/vrt.mjs` and note it.

- [ ] **Step 4: Commit + push**

```bash
git add -A && git commit -m "feat: Phase 2 integration — app shell story, VR baselines"
git push -u origin feat/phase-2
```

---

## Self-review notes

- **Spec coverage (Phase 2 spec §1–§4):** IconChevronDouble → T1; navbar token → T2; utils → T3; Popover → T4; Menu → T5; Dialog → T6; Drawer → T7; Toast → T8; Tabs → T9; Breadcrumbs + NonIdealState → T10; Navbar → T11; Tree → T12; integration → T13. Deferred items (submenus, omnibar, virtualized tree, context menu) intentionally absent.
- **Type consistency:** `PopoverContext` produced in T4, consumed in T5 via `../popover/PopoverContext.js`; `useControllableState`/`Portal` produced T3, consumed T4/T8/T9; `--navbar-h` produced T2, consumed T11; `IconChevronDouble` produced T1 (Tree uses `IconChevronRight`, already present); dialog CSS pattern duplicated (not shared) between T6/T7 deliberately — the docked drawer diverges enough that sharing would couple them.
- **Placeholder scan:** none; all steps carry complete code; the two environment-contingent notes (jsdom `<dialog>`, VRT reduced-motion) name their exact fallback.
