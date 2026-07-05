# neonglow Phase 2 — Overlays & Navigation

**Date:** 2026-07-05
**Status:** Design approved — ready for implementation planning
**Parent spec:** `2026-07-04-neonglow-web-app-design-system-design.md` (governs all visual rules: tokens, dual theme, density, elevation, glow, motion, icons). This spec covers only what Phase 2 adds.

---

## 1. Scope

Deliver the interaction/overlay layer of `@neonglow/core`, per the parent spec's Phase 2 row:

**Overlay machinery:** Portal (internal), Popover, Menu/MenuItem/MenuDivider, Dialog, Drawer, Toast + imperative toaster.
**Navigation:** Tabs, Breadcrumbs, Navbar (+ Group/Heading/Divider), Tree, NonIdealState.
**Support:** `useControllableState` util; `IconChevronDouble` added to `@neonglow/icons` (closes the Phase 0 icon-set gap).

**Out of scope (deferred):** submenus (Phase 3 with Select), omnibar (Phase 3), toast queue persistence, virtualized tree (Phase 5 grid work), context menu.

## 2. Architectural decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Positioning | **`@floating-ui/react-dom`** (positioning only, ~4kb) | Collision-aware flip/shift is not worth hand-rolling; we keep our own interaction/ARIA logic. Becomes core's second dependency after icons. |
| Dialog/Drawer base | **Native `<dialog>.showModal()`** | Top-layer stacking, `::backdrop`, Esc, focus containment for free. All modern browsers. Drawer reuses the same base, docked to an edge. |
| Toast API | **Imperative singleton** | Mount `<Toaster/>` once; `toaster.show(...)` callable from anywhere including non-React code (API callbacks, stores). |
| Controlled/uncontrolled | **`useControllableState`** shared hook | One pattern for Popover/Tabs/Tree/Dialog open & selection state. |

## 3. Component contracts

All components: CSS Modules reading only Tier-2 semantic vars; density-aware via existing tokens; axe test + dual-theme story each; TDD.

### Portal (internal, not exported)
`<Portal>{children}</Portal>` → `createPortal` into `document.body`. Used by Popover and Toaster. Dialog/Drawer do not need it (native top layer).

### Popover
```ts
interface PopoverProps {
  content: ReactNode;               // panel content
  children: ReactElement;           // trigger (cloned: ref, aria-expanded, aria-haspopup, onClick toggle)
  placement?: Placement;            // floating-ui placement, default "bottom-start"
  isOpen?: boolean;                 // controlled
  defaultIsOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  matchTargetWidth?: boolean;       // for future Select
}
```
Behavior: click toggles; outside-click and Esc close; flip/shift middleware with 8px offset; panel rendered in Portal with `--elevation-overlay`, `--surface-raised` bg, `--radius-action`, 120ms fade/translate (reduced-motion instant). Focus is NOT trapped (non-modal); Esc returns focus to trigger.

### Menu / MenuItem / MenuDivider
```ts
interface MenuProps extends HTMLAttributes<HTMLUListElement> {}           // role="menu"
interface MenuItemProps {
  text: ReactNode;
  icon?: ReactNode;                 // leading icon slot
  kbd?: string;                     // right-aligned shortcut hint (mono)
  intent?: Intent;                  // danger items
  disabled?: boolean;
  onSelect?: () => void;            // Enter/Space/click
}
```
Keyboard: ArrowUp/Down move (roving tabindex), Home/End jump, Enter/Space select, disabled items skipped. Menu inside a Popover = dropdown; selecting closes the popover (via context flag). Item height from `--control-h`; hover `--surface-sunken`; active item accent treatment per approved preview.

### Dialog
```ts
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;              // Esc, backdrop click, close button
  title?: string;
  actions?: ReactNode;              // footer, right-aligned
  children: ReactNode;
}
```
Native `<dialog>` + `showModal()`/`close()` synced to `isOpen`. `::backdrop` = `var(--scrim)`. Structure per preview: header (title + IconX close) / body / footer on `--surface-sunken`. Width `min(460px, calc(100vw - 40px))`. `--radius-action`, `--elevation-overlay`.

### Drawer
`DialogProps & { side?: "right" | "left" | "bottom"; size?: string }` (size = width or height, default `380px` / `40vh`). Same native-dialog base; docked flush to the edge, radius 0 on the docked edge; 140ms translate entrance, instant under reduced-motion.

### Toast / Toaster
```ts
interface ToastOptions {
  message: ReactNode;
  intent?: Intent;                  // icon + glow per intent, like Callout
  timeout?: number;                 // ms, default 5000; 0 = sticky
  action?: { text: string; onClick: () => void };
}
interface ToasterInstance {
  show(options: ToastOptions): string;   // returns key
  dismiss(key: string): void;
  clear(): void;
}
// module export:
export const toaster: ToasterInstance;   // buffers until <Toaster/> mounts
export function Toaster(props: { placement?: "top" | "top-right" | "bottom-right" }): JSX.Element;
```
`role="status"` (aria-live polite); danger toasts `role="alert"`. Auto-dismiss pauses on hover/focus. Max 5 visible, FIFO overflow. Toast surface = raised overlay (elevation rules), intent icon glows via `--glow`.

### Tabs
```ts
interface TabsProps {
  tabs: Array<{ id: string; title: ReactNode; disabled?: boolean; panel?: ReactNode }>;
  selectedId?: string;              // controlled
  defaultSelectedId?: string;
  onChange?: (id: string) => void;
}
```
`tablist/tab/tabpanel` roles, roving tabindex, ArrowLeft/Right + Home/End, automatic activation. Accent underline indicator (2px) per preview; 2px hairline baseline under the list.

### Breadcrumbs
```ts
interface BreadcrumbsProps {
  items: Array<{ text: string; href?: string; onClick?: () => void }>;
}
```
`<nav aria-label="Breadcrumbs">` + `<ol>`; IconChevronRight separators (aria-hidden); last item `aria-current="page"`, `--text-1` medium; others `--text-3`.

### Navbar (+ NavbarGroup, NavbarHeading, NavbarDivider)
Layout primitive, data surface: radius 0, `--surface` bg, hairline bottom border, height 48px default / 40px compact (via density selector on its own component token). `NavbarGroup align="left"|"right"`; `NavbarDivider` = vertical hairline.

### Tree
```ts
interface TreeNode<T = unknown> {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  secondaryLabel?: ReactNode;       // right-aligned mono slot (e.g. 14.58×)
  childNodes?: TreeNode<T>[];
  isExpanded?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  nodeData?: T;
}
interface TreeProps<T = unknown> {
  contents: TreeNode<T>[];
  onNodeClick?: (node: TreeNode<T>, path: number[]) => void;
  onNodeExpand?: (node: TreeNode<T>, path: number[]) => void;
  onNodeCollapse?: (node: TreeNode<T>, path: number[]) => void;
}
```
Fully controlled (Blueprint model): expansion/selection live in the caller's data; callbacks report node + path. `role="tree"/"treeitem"/"group"`, `aria-expanded/selected/level`; keyboard: Up/Down move, Right expand/first-child, Left collapse/parent, Enter click. Chevron rotates 90° (120ms). Row height `--row-h`; selected row accent-tint + inset accent bar like the preview's table selection.

### NonIdealState
```ts
interface NonIdealStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}
```
Centered column, icon at `--text-3`, quiet. For empty tables/panels; copy follows brand voice ("An empty screen is an invitation to act").

### useControllableState (internal util)
`useControllableState<T>({ value, defaultValue, onChange }): [T, (v: T) => void]` — standard controlled/uncontrolled resolution, used by Popover and Tabs. (Dialog/Drawer are fully controlled by design; Tree is fully controlled via caller data.)

## 4. Icons addition
`IconChevronDouble` (expand-all affordance, 24 viewBox, two nested chevrons) added to `@neonglow/icons` → 32 icons. Same contract tests.

## 5. Quality gates (same as Phase 0+1)
- TDD per component; axe test each; keyboard-interaction tests for Menu/Tabs/Tree (user-event).
- Note: jsdom supports `<dialog>` `showModal/close` (jsdom ≥24); if a gap appears, tests fall back to asserting `open` attribute + event wiring, flagged in the report.
- Dual-theme stories for every component; Dialog/Drawer/Toast stories render OPEN so VRT captures them; VRT reseeded at integration.
- Token-existence guard test automatically covers all new CSS.
- Hex-grep on compiled CSS stays 0. Elevation/scrim/glow only via tokens.
- floating-ui externalized in the Vite build (consumers install it as a dependency of core — regular dependency, not peer).

## 6. Open items
- Toast placement default: `top-right` (data-app convention). Change later via prop.
- Navbar height token: introduce `--navbar-h` (Tier 3) in tokens package: 48px default / 40px compact.
