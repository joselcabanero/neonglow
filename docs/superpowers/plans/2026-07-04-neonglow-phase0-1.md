# neonglow Phase 0 + 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the neonglow monorepo foundation (`@neonglow/tokens`, `@neonglow/icons`, Storybook docs, a11y/VR harness) and the first tranche of `@neonglow/core` components, all dual-theme + dual-density.

**Architecture:** pnpm + Turborepo monorepo. Tokens are authored in TypeScript and generated to CSS custom properties (three tiers; components read ONLY Tier-2 semantic vars). Components are React + TypeScript styled with CSS Modules, built with Vite lib mode (zero-runtime CSS). Storybook is the living reference; vitest + Testing Library + vitest-axe for unit/a11y tests; a Playwright screenshot harness for visual regression.

**Tech Stack:** pnpm, Turborepo, TypeScript (strict), React 18+ (peer), Vite (lib mode), CSS Modules, tsup (icons/tokens JS), vitest + jsdom + @testing-library/react + vitest-axe, Storybook 8 (react-vite), Playwright + pixelmatch (VR).

**Spec:** `docs/superpowers/specs/2026-07-04-neonglow-web-app-design-system-design.md`
**Visual reference (approved):** `ui_kits/neonglow-app/index.html` — token values in this plan are copied from it verbatim.

## Global Constraints

- Package names: `@neonglow/tokens`, `@neonglow/icons`, `@neonglow/core`. ESM-only output + `.d.ts` types. `"react": ">=18"` as peerDependency. Publishing to a registry is OUT OF SCOPE (spec §10 leaves registry undecided) — everything is validated via workspace installs and builds.
- Components read **only Tier-2 semantic CSS vars** (`--surface`, `--text-1`, `--accent`, `--intent-*`, `--focus-ring`, `--radius-*`, `--control-h`, …). Never raw hex in component CSS. Never theme conditionals in TSX — theming is `[data-theme]` swapping var values.
- Shape: data surfaces use `var(--radius-0)`; action affordances use `var(--radius-action)`.
- Focus: `outline:2px solid var(--focus-ring); outline-offset:2px` via `:focus-visible` only.
- Motion: 100–150ms ease-out max; every transition removed under `@media (prefers-reduced-motion: reduce)` (handled globally in theme.css).
- The neon glow is expressed ONLY through `var(--glow)` (resolves to `none` on light, a `currentColor` halo on dark). Data surfaces never glow.
- Icons: functional affordances only, 24 viewBox, `stroke-width:1.5`, `fill:none`, `stroke:currentColor`. No emoji anywhere, including docs copy.
- Type: `var(--font-sans)` / `var(--font-mono)` only — never a hardcoded family name in component CSS ("Ubuntu or similar" is a token decision).
- Copy in stories/docs follows brand voice: no "excited/amazing/leverage"; numbers formatted `€4.15M`, `1.47×`, `+42%`.
- Every component ships: unit tests, an axe test, and a story rendering in both themes and both densities (via the docs toolbar).
- Commit after every task (steps marked Commit).

## File Structure (end state)

```
neonglow/
├─ pnpm-workspace.yaml
├─ package.json                    # root: private, scripts, turbo
├─ turbo.json
├─ tsconfig.base.json
├─ packages/
│  ├─ tokens/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  ├─ fonts/                    # woff2 copied from repo /fonts + fonts.css
│  │  ├─ src/
│  │  │  ├─ primitives.ts          # Tier 1
│  │  │  ├─ themes.ts              # Tier 2 (light + dark)
│  │  │  ├─ density.ts             # Tier 3 density
│  │  │  ├─ cssname.ts             # camelCase → --kebab-case
│  │  │  ├─ generate.ts            # writes dist/theme.css
│  │  │  └─ index.ts
│  │  └─ test/tokens.test.ts
│  ├─ icons/
│  │  ├─ package.json  tsconfig.json  tsup.config.ts
│  │  ├─ src/
│  │  │  ├─ createIcon.tsx
│  │  │  └─ index.tsx              # 30 explicit icon exports
│  │  └─ test/icons.test.tsx
│  └─ core/
│     ├─ package.json  tsconfig.json  vite.config.ts  vitest.setup.ts
│     └─ src/
│        ├─ index.ts
│        ├─ cx.ts  types.ts
│        ├─ button/    Button.tsx ButtonGroup.tsx button.module.css Button.test.tsx Button.stories.tsx
│        ├─ spinner/   Spinner.tsx spinner.module.css Spinner.test.tsx Spinner.stories.tsx
│        ├─ divider/   Divider.tsx divider.module.css Divider.test.tsx
│        ├─ tag/       Tag.tsx tag.module.css Tag.test.tsx Tag.stories.tsx
│        ├─ card/      Card.tsx card.module.css Card.test.tsx Card.stories.tsx
│        ├─ callout/   Callout.tsx callout.module.css Callout.test.tsx Callout.stories.tsx
│        ├─ form/      FormGroup.tsx TextInput.tsx TextArea.tsx NumericInput.tsx form.module.css Form.test.tsx Form.stories.tsx
│        ├─ selection/ Checkbox.tsx Radio.tsx Switch.tsx selection.module.css Selection.test.tsx Selection.stories.tsx
│        └─ tooltip/   Tooltip.tsx tooltip.module.css Tooltip.test.tsx Tooltip.stories.tsx
├─ apps/docs/
│  ├─ package.json
│  ├─ .storybook/main.ts  .storybook/preview.ts
│  └─ stories/Tokens.stories.tsx
└─ scripts/vrt.mjs                 # Playwright VR harness
```

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `pnpm-workspace.yaml`, `package.json`, `turbo.json`, `tsconfig.base.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: workspace layout `packages/*`, `apps/*`; root scripts `build`, `test`; `tsconfig.base.json` for all packages to extend.

- [ ] **Step 1: Write workspace + root config**

`pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
  - "apps/*"
```

`package.json`:
```json
{
  "name": "neonglow-monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "storybook": "pnpm --filter @neonglow/docs storybook",
    "vrt": "node scripts/vrt.mjs"
  },
  "devDependencies": {},
  "packageManager": "pnpm@9.15.0"
}
```

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "storybook-static/**"]
    },
    "test": { "dependsOn": ["build"] }
  }
}
```

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Append to `.gitignore`:
```
node_modules/
dist/
storybook-static/
.turbo/
vrt/current/
vrt/diff/
```

- [ ] **Step 2: Install turbo and verify**

Run: `pnpm add -Dw turbo typescript && pnpm install`
Expected: lockfile created, no errors.
Run: `pnpm turbo run build`
Expected: "No tasks were executed" (no packages yet) — exit 0.

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "chore: scaffold pnpm + turborepo monorepo"
```

---

### Task 2: @neonglow/tokens — token source (TDD)

**Files:**
- Create: `packages/tokens/package.json`, `packages/tokens/tsconfig.json`, `packages/tokens/src/{primitives,themes,density,cssname,index}.ts`
- Test: `packages/tokens/test/tokens.test.ts`

**Interfaces:**
- Produces: `primitives: Record<string,string>`, `themes: { light: SemanticTokens; dark: SemanticTokens }` (both themes share the exact same key set — enforced by test), `densities: { default: DensityTokens; compact: DensityTokens }`, `cssVarName(key: string): string` (`"surfaceSunken2"` → `"--surface-sunken-2"`).

- [ ] **Step 1: Package scaffold**

`packages/tokens/package.json`:
```json
{
  "name": "@neonglow/tokens",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./theme.css": "./dist/theme.css",
    "./fonts.css": "./fonts/fonts.css"
  },
  "files": ["dist", "fonts"],
  "scripts": {
    "build": "tsc -p tsconfig.json && node dist/generate.js",
    "test": "vitest run"
  },
  "devDependencies": { "typescript": "^5.5.0", "vitest": "^3.0.0" }
}
```

`packages/tokens/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 2: Write the failing tests**

`packages/tokens/test/tokens.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { themes, densities, primitives } from "../src/index.js";
import { cssVarName } from "../src/cssname.js";

describe("cssVarName", () => {
  it("kebab-cases camelCase and digits", () => {
    expect(cssVarName("surface")).toBe("--surface");
    expect(cssVarName("surfaceSunken2")).toBe("--surface-sunken-2");
    expect(cssVarName("text1")).toBe("--text-1");
    expect(cssVarName("intentSuccessBg")).toBe("--intent-success-bg");
  });
});

describe("themes", () => {
  it("light and dark expose the identical key set", () => {
    expect(Object.keys(themes.light).sort()).toEqual(Object.keys(themes.dark).sort());
  });
  it("every value is a non-empty string", () => {
    for (const t of [themes.light, themes.dark])
      for (const [k, v] of Object.entries(t)) expect(v, k).toMatch(/\S/);
  });
  it("accent-text is contrast-honest: ink on light, green on dark", () => {
    expect(themes.light.accentText).toBe("#0a0a0a");
    expect(themes.dark.accentText).toBe(primitives.green);
  });
  it("glow is none on light, currentColor halo on dark", () => {
    expect(themes.light.glow).toBe("none");
    expect(themes.dark.glow).toContain("currentColor");
  });
});

describe("densities", () => {
  it("heights are half-baseline (12px) multiples", () => {
    for (const d of Object.values(densities))
      for (const v of [d.controlH, d.rowH])
        expect(parseInt(v) % 12, v).toBe(0);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter @neonglow/tokens exec vitest run`
Expected: FAIL — cannot resolve `../src/index.js`.

- [ ] **Step 4: Implement the token source**

`packages/tokens/src/cssname.ts`:
```ts
/** camelCase token key -> CSS custom property name. surfaceSunken2 -> --surface-sunken-2 */
export function cssVarName(key: string): string {
  return "--" + key.replace(/([A-Z]|\d+)/g, (m) => "-" + m.toLowerCase());
}
```

`packages/tokens/src/primitives.ts` (Tier 1 — values verbatim from the approved preview):
```ts
export const primitives = {
  fontSans: "'Ubuntu', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontMono: "'Ubuntu Mono', ui-monospace, 'SF Mono', Menlo, monospace",
  green: "#7BF076",
  greenHover: "#6de066",
  greenPress: "#5fd158",
  radius0: "0px",
  radiusAction: "4px",
  baseline: "24px",
  baselineHalf: "12px",
  g: "24px",
  sp4: "4px", sp8: "8px", sp14: "14px", sp20: "20px", sp28: "28px",
  sp40: "40px", sp56: "56px", sp80: "80px", sp100: "100px",
  fsDisplay: "56px", fsH1: "34px", fsH2: "24px", fsH3: "18px",
  fsBody: "15px", fsUi: "14px", fsCap: "12px", fsMicro: "11px",
} as const;
```

`packages/tokens/src/themes.ts` (Tier 2 — values verbatim from the approved preview):
```ts
import { primitives as p } from "./primitives.js";

const light = {
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  surfaceSunken: "#eeeef0",
  surfaceSunken2: "#e0e0e4",
  text1: "#0a0a0a", text2: "#2a2a2a", text3: "#555555",
  borderHairline: "rgba(10,10,10,.12)",
  borderStrong: "#0a0a0a",
  accent: p.green, accentHover: p.greenHover, accentPress: p.greenPress,
  onAccent: "#0a0a0a",
  accentText: "#0a0a0a",
  intentSuccess: "#0FA82A", intentSuccessBg: "#CDF9C9",
  intentWarning: "#E07000", intentWarningBg: "#FFE9B0",
  intentDanger: "#ED0E44", intentDangerBg: "#FFD7DF",
  intentInfo: "#007BE8", intentInfoBg: "#D2EBFF",
  focusRing: "#0a0a0a",
  elevationOverlay: "0 10px 34px rgba(10,10,10,.18), 0 2px 8px rgba(10,10,10,.10)",
  scrim: "rgba(10,10,10,.42)",
  glow: "none",
};

const dark: typeof light = {
  surface: "#0a0a0a",
  surfaceRaised: "#18181b",
  surfaceSunken: "#141416",
  surfaceSunken2: "#1f1f23",
  text1: "#f2f2f4", text2: "#d8d8dc", text3: "#9a9a9e",
  borderHairline: "rgba(255,255,255,.15)",
  borderStrong: "rgba(255,255,255,.82)",
  accent: p.green, accentHover: p.greenHover, accentPress: p.greenPress,
  onAccent: "#0a0a0a",
  accentText: p.green,
  intentSuccess: p.green, intentSuccessBg: "#0E3B14",
  intentWarning: "#FFD21E", intentWarningBg: "#3B2E00",
  intentDanger: "#FF3B5C", intentDangerBg: "#42081A",
  intentInfo: "#2FD4FF", intentInfoBg: "#003347",
  focusRing: p.green,
  elevationOverlay: "0 12px 36px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06)",
  scrim: "rgba(0,0,0,.62)",
  glow: "0 0 14px -4px currentColor",
};

export type SemanticTokens = typeof light;
export const themes = { light, dark };
```

`packages/tokens/src/density.ts`:
```ts
const defaults = { controlH: "36px", rowH: "48px", padX: "12px", padY: "8px" };
const compact  = { controlH: "24px", rowH: "36px", padX: "8px",  padY: "4px" };
export type DensityTokens = typeof defaults;
export const densities = { default: defaults, compact };
```

`packages/tokens/src/index.ts`:
```ts
export { primitives } from "./primitives.js";
export { themes, type SemanticTokens } from "./themes.js";
export { densities, type DensityTokens } from "./density.js";
export { cssVarName } from "./cssname.js";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm install && pnpm --filter @neonglow/tokens exec vitest run`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**
```bash
git add packages/tokens pnpm-lock.yaml && git commit -m "feat(tokens): TS token source — primitives, dual themes, density"
```

---

### Task 3: @neonglow/tokens — CSS generator + fonts

**Files:**
- Create: `packages/tokens/src/generate.ts`, `packages/tokens/fonts/fonts.css`
- Copy: repo `fonts/*.woff2` → `packages/tokens/fonts/`
- Test: append to `packages/tokens/test/tokens.test.ts`

**Interfaces:**
- Consumes: `themes`, `densities`, `primitives`, `cssVarName` from Task 2.
- Produces: `renderThemeCss(): string` and build artifact `packages/tokens/dist/theme.css` containing `:root`, `[data-theme="light"]`, `[data-theme="dark"]`, `[data-density="default"]`, `[data-density="compact"]`, a `:focus-visible` rule, and a `prefers-reduced-motion` block. Consumers import `@neonglow/tokens/theme.css` + `@neonglow/tokens/fonts.css`.

- [ ] **Step 1: Write the failing test**

Append to `packages/tokens/test/tokens.test.ts`:
```ts
import { renderThemeCss } from "../src/generate.js";

describe("renderThemeCss", () => {
  const css = renderThemeCss();
  it("emits all four scopes", () => {
    expect(css).toContain(':root,[data-theme="light"]');
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('[data-density="default"]');
    expect(css).toContain('[data-density="compact"]');
  });
  it("emits kebab-cased vars with verbatim values", () => {
    expect(css).toContain("--surface-sunken-2:#e0e0e4");
    expect(css).toContain("--intent-danger:#FF3B5C");
    expect(css).toContain("--control-h:36px");
  });
  it("ships the base a11y layer", () => {
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @neonglow/tokens exec vitest run`
Expected: FAIL — `generate.js` not found.

- [ ] **Step 3: Implement the generator**

`packages/tokens/src/generate.ts`:
```ts
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { primitives } from "./primitives.js";
import { themes } from "./themes.js";
import { densities } from "./density.js";
import { cssVarName } from "./cssname.js";

const decls = (o: Record<string, string>) =>
  Object.entries(o).map(([k, v]) => `  ${cssVarName(k)}:${v};`).join("\n");

export function renderThemeCss(): string {
  return `/* @neonglow/tokens — generated. Do not edit. */
:root{
${decls(primitives)}
}
:root,[data-theme="light"]{
${decls(themes.light)}
}
[data-theme="dark"]{
${decls(themes.dark)}
}
[data-density="default"]{
${decls(densities.default)}
}
[data-density="compact"]{
${decls(densities.compact)}
}
/* base a11y layer */
:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px;}
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{transition:none !important;animation:none !important;scroll-behavior:auto !important;}
}
`;
}

// CLI entry: `node dist/generate.js` writes dist/theme.css next to itself
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = join(dirname(fileURLToPath(import.meta.url)), "theme.css");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, renderThemeCss());
  console.log("wrote", out);
}
```

- [ ] **Step 4: Copy fonts + write fonts.css**

Run: `mkdir -p packages/tokens/fonts && cp fonts/*.woff2 packages/tokens/fonts/`

`packages/tokens/fonts/fonts.css`:
```css
/* Brand family: Ubuntu (or similar) — the family is a token, not a pin. */
@font-face{font-family:'Ubuntu';font-weight:300;font-display:swap;src:url('./Ubuntu-Light.woff2') format('woff2');}
@font-face{font-family:'Ubuntu';font-weight:400;font-display:swap;src:url('./Ubuntu-Regular.woff2') format('woff2');}
@font-face{font-family:'Ubuntu';font-weight:500;font-display:swap;src:url('./Ubuntu-Medium.woff2') format('woff2');}
@font-face{font-family:'Ubuntu';font-weight:700;font-display:swap;src:url('./Ubuntu-Bold.woff2') format('woff2');}
@font-face{font-family:'Ubuntu Mono';font-weight:400;font-display:swap;src:url('./UbuntuMono-Regular.woff2') format('woff2');}
@font-face{font-family:'Ubuntu Mono';font-weight:700;font-display:swap;src:url('./UbuntuMono-Bold.woff2') format('woff2');}
```

- [ ] **Step 5: Run tests + build**

Run: `pnpm --filter @neonglow/tokens exec vitest run`
Expected: PASS (9 tests).
Run: `pnpm --filter @neonglow/tokens build && grep -c "data-theme" packages/tokens/dist/theme.css`
Expected: build succeeds; grep prints `2`.

- [ ] **Step 6: Commit**
```bash
git add packages/tokens && git commit -m "feat(tokens): theme.css generator + packaged brand fonts"
```

---

### Task 4: @neonglow/icons — functional icon set (TDD)

**Files:**
- Create: `packages/icons/package.json`, `packages/icons/tsconfig.json`, `packages/icons/tsup.config.ts`, `packages/icons/src/createIcon.tsx`, `packages/icons/src/index.tsx`
- Test: `packages/icons/test/icons.test.tsx`

**Interfaces:**
- Produces: `IconProps { size?: 16 | 20; title?: string } & SVGProps<SVGSVGElement>`; named exports (all follow `Icon<PascalName>`): `IconChevronDown, IconChevronRight, IconChevronUp, IconChevronLeft, IconCaretDown, IconCaretUp, IconCheck, IconX, IconDash, IconPlus, IconMinus, IconSearch, IconCommand, IconFilter, IconSort, IconMoreHorizontal, IconMoreVertical, IconArrowRight, IconArrowLeft, IconArrowUp, IconArrowDown, IconCalendar, IconClock, IconInfo, IconWarning, IconError, IconSuccess, IconDragHandle, IconExternalLink, IconEye, IconEyeOff`. Later tasks import `IconX`, `IconCheck`, `IconDash`, `IconInfo`, `IconWarning`, `IconError`, `IconSuccess`.

- [ ] **Step 1: Package scaffold**

`packages/icons/package.json`:
```json
{
  "name": "@neonglow/icons",
  "version": "0.1.0",
  "type": "module",
  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": { "build": "tsup", "test": "vitest run" },
  "peerDependencies": { "react": ">=18" },
  "devDependencies": {
    "@testing-library/react": "^16.0.0", "@types/react": "^18.3.0",
    "jsdom": "^25.0.0", "react": "^18.3.0", "react-dom": "^18.3.0",
    "tsup": "^8.0.0", "typescript": "^5.5.0", "vitest": "^3.0.0"
  }
}
```

`packages/icons/tsconfig.json`:
```json
{ "extends": "../../tsconfig.base.json", "include": ["src", "test"] }
```

`packages/icons/tsup.config.ts`:
```ts
import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.tsx"], format: ["esm"], dts: true, external: ["react"],
});
```

- [ ] **Step 2: Write the failing tests**

`packages/icons/test/icons.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import * as Icons from "../src/index.js";
import { IconCheck } from "../src/index.js";

describe("icon contract", () => {
  it("exports 31 icons, all Icon-prefixed", () => {
    const names = Object.keys(Icons).filter((k) => k.startsWith("Icon"));
    expect(names.length).toBe(31);
  });
  it("renders a 1.5-stroke, no-fill, currentColor svg", () => {
    const { container } = render(<IconCheck />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    expect(svg.getAttribute("fill")).toBe("none");
    expect(svg.getAttribute("stroke-width")).toBe("1.5");
    expect(svg.getAttribute("width")).toBe("16");
  });
  it("supports size 20 and an accessible title", () => {
    const { container } = render(<IconCheck size={20} title="Selected" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("20");
    expect(svg.querySelector("title")!.textContent).toBe("Selected");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
  });
  it("is aria-hidden when untitled (decorative-in-context affordance)", () => {
    const { container } = render(<IconCheck />);
    expect(container.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm install && pnpm --filter @neonglow/icons exec vitest run`
Expected: FAIL — `src/index.js` unresolved.

- [ ] **Step 4: Implement createIcon + the 31 icons**

`packages/icons/src/createIcon.tsx`:
```tsx
import type { ReactNode, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Icon grid: 16 (default) or 20 */
  size?: 16 | 20;
  /** Accessible name. Omit when the icon is a purely visual affordance. */
  title?: string;
}

export function createIcon(name: string, children: ReactNode) {
  function Icon({ size = 16, title, ...rest }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24" width={size} height={size}
        stroke="currentColor" fill="none" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden={title ? undefined : true}
        role={title ? "img" : undefined}
        data-icon={name}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {children}
      </svg>
    );
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}
```

`packages/icons/src/index.tsx` (path data verbatim from the approved preview symbols; `fill="currentColor" stroke="none"` dots are intentional):
```tsx
import { createIcon, type IconProps } from "./createIcon.js";
export type { IconProps };

export const IconChevronDown = createIcon("chevron-down", <polyline points="6 9 12 15 18 9" />);
export const IconChevronRight = createIcon("chevron-right", <polyline points="9 6 15 12 9 18" />);
export const IconChevronUp = createIcon("chevron-up", <polyline points="6 15 12 9 18 15" />);
export const IconChevronLeft = createIcon("chevron-left", <polyline points="15 6 9 12 15 18" />);
export const IconCaretDown = createIcon("caret-down", <path d="M7 10l5 5 5-5" />);
export const IconCaretUp = createIcon("caret-up", <path d="M7 14l5-5 5 5" />);
export const IconCheck = createIcon("check", <polyline points="4 12 10 18 20 6" />);
export const IconX = createIcon("x", <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>);
export const IconDash = createIcon("dash", <line x1="6" y1="12" x2="18" y2="12" />);
export const IconPlus = createIcon("plus", <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>);
export const IconMinus = createIcon("minus", <line x1="5" y1="12" x2="19" y2="12" />);
export const IconSearch = createIcon("search", <><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></>);
export const IconCommand = createIcon("command", <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z" />);
export const IconFilter = createIcon("filter", <polygon points="4 5 20 5 14 12.5 14 19 10 21 10 12.5" />);
export const IconSort = createIcon("sort", <><line x1="4" y1="7" x2="16" y2="7" /><line x1="4" y1="12" x2="13" y2="12" /><line x1="4" y1="17" x2="10" y2="17" /><polyline points="17 14 20 17 23 14" /></>);
export const IconMoreHorizontal = createIcon("more-horizontal", <><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></>);
export const IconMoreVertical = createIcon("more-vertical", <><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" /></>);
export const IconArrowRight = createIcon("arrow-right", <><line x1="4" y1="12" x2="20" y2="12" /><polyline points="14 6 20 12 14 18" /></>);
export const IconArrowLeft = createIcon("arrow-left", <><line x1="20" y1="12" x2="4" y2="12" /><polyline points="10 6 4 12 10 18" /></>);
export const IconArrowUp = createIcon("arrow-up", <><line x1="12" y1="20" x2="12" y2="4" /><polyline points="6 10 12 4 18 10" /></>);
export const IconArrowDown = createIcon("arrow-down", <><line x1="12" y1="4" x2="12" y2="20" /><polyline points="6 14 12 20 18 14" /></>);
export const IconCalendar = createIcon("calendar", <><rect x="4" y="5" width="16" height="16" rx="1" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="8" y1="3" x2="8" y2="6" /><line x1="16" y1="3" x2="16" y2="6" /></>);
export const IconClock = createIcon("clock", <><circle cx="12" cy="12" r="8" /><polyline points="12 8 12 12 15 14" /></>);
export const IconInfo = createIcon("info", <><circle cx="12" cy="12" r="8" /><line x1="12" y1="11" x2="12" y2="16" /><circle cx="12" cy="8" r=".6" fill="currentColor" stroke="none" /></>);
export const IconWarning = createIcon("warning", <><path d="M12 4l8.5 15h-17z" /><line x1="12" y1="10" x2="12" y2="14" /><circle cx="12" cy="16.5" r=".6" fill="currentColor" stroke="none" /></>);
export const IconError = createIcon("error", <><circle cx="12" cy="12" r="8" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></>);
export const IconSuccess = createIcon("success", <><circle cx="12" cy="12" r="8" /><polyline points="8 12 11 15 16 9" /></>);
export const IconDragHandle = createIcon("drag-handle", <><circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none" /></>);
export const IconExternalLink = createIcon("external-link", <><path d="M14 5h5v5" /><line x1="19" y1="5" x2="11" y2="13" /><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" /></>);
export const IconEye = createIcon("eye", <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>);
export const IconEyeOff = createIcon("eye-off", <><path d="M2 12s3.5-7 10-7c2.1 0 3.9.7 5.4 1.7M22 12s-3.5 7-10 7c-2.1 0-3.9-.7-5.4-1.7" /><line x1="4" y1="20" x2="20" y2="4" /></>);
```

- [ ] **Step 5: Run tests + build**

Run: `pnpm --filter @neonglow/icons exec vitest run`
Expected: PASS (4 tests).
Run: `pnpm --filter @neonglow/icons build`
Expected: `dist/index.js` + `dist/index.d.ts` emitted.

- [ ] **Step 6: Commit**
```bash
git add packages/icons pnpm-lock.yaml && git commit -m "feat(icons): 31 functional icons, currentColor, 1.5 stroke"
```

---

### Task 5: apps/docs — Storybook with theme + density toolbars

**Files:**
- Create: `apps/docs/package.json`, `apps/docs/.storybook/main.ts`, `apps/docs/.storybook/preview.ts`, `apps/docs/stories/Tokens.stories.tsx`

**Interfaces:**
- Consumes: `@neonglow/tokens` (theme.css, fonts.css, `themes`, `cssVarName`).
- Produces: docs app with global toolbar items `theme` (light/dark) and `density` (default/compact) that set `data-theme` / `data-density` on `<html>`. Stories glob includes `packages/*/src/**/*.stories.tsx` — later component tasks rely on this.

- [ ] **Step 1: Package + Storybook config**

`apps/docs/package.json`:
```json
{
  "name": "@neonglow/docs",
  "private": true,
  "type": "module",
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build": "storybook build",
    "test": "echo skip"
  },
  "dependencies": {
    "@neonglow/icons": "workspace:*",
    "@neonglow/tokens": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@storybook/addon-a11y": "^8.6.0",
    "@storybook/addon-essentials": "^8.6.0",
    "@storybook/react-vite": "^8.6.0",
    "@types/react": "^18.3.0",
    "storybook": "^8.6.0",
    "typescript": "^5.5.0",
    "vite": "^6.0.0"
  }
}
```

`apps/docs/.storybook/main.ts`:
```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: { name: "@storybook/react-vite", options: {} },
  stories: [
    "../stories/**/*.stories.@(ts|tsx)",
    "../../../packages/*/src/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
};
export default config;
```

`apps/docs/.storybook/preview.ts`:
```ts
import type { Preview } from "@storybook/react";
import "@neonglow/tokens/fonts.css";
import "@neonglow/tokens/theme.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: { title: "Theme", items: ["light", "dark"], dynamicTitle: true },
    },
    density: {
      description: "Density",
      toolbar: { title: "Density", items: ["default", "compact"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "dark", density: "default" },
  decorators: [
    (Story, ctx) => {
      const root = document.documentElement;
      root.setAttribute("data-theme", ctx.globals.theme);
      root.setAttribute("data-density", ctx.globals.density);
      document.body.style.background = "var(--surface)";
      document.body.style.color = "var(--text-1)";
      document.body.style.fontFamily = "var(--font-sans)";
      return Story();
    },
  ],
  parameters: { layout: "padded" },
};
export default preview;
```

- [ ] **Step 2: Token swatch story (proves the pipeline end-to-end)**

`apps/docs/stories/Tokens.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { themes, cssVarName } from "@neonglow/tokens";

function Swatches() {
  const keys = Object.keys(themes.light).filter((k) => !["elevationOverlay", "scrim", "glow"].includes(k));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
      {keys.map((k) => (
        <div key={k} style={{ border: "1px solid var(--border-hairline)", padding: 11 }}>
          <div style={{ height: 48, background: `var(${cssVarName(k)})`, border: "1px solid var(--border-hairline)" }} />
          <div style={{ fontSize: 11, marginTop: 12, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
            {cssVarName(k)}
          </div>
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof Swatches> = { title: "Foundations/Tokens", component: Swatches };
export default meta;
export const SemanticTokens: StoryObj<typeof Swatches> = {};
```

- [ ] **Step 3: Verify Storybook builds**

Run: `pnpm install && pnpm --filter @neonglow/tokens build && pnpm --filter @neonglow/docs build`
Expected: `apps/docs/storybook-static/` produced, exit 0.

- [ ] **Step 4: Commit**
```bash
git add apps/docs pnpm-lock.yaml && git commit -m "feat(docs): storybook with theme/density toolbars + token swatches"
```

---

### Task 6: Visual-regression harness

**Files:**
- Create: `scripts/vrt.mjs`
- Modify: root `package.json` (devDependencies)

**Interfaces:**
- Consumes: `apps/docs/storybook-static` (built Storybook), its `index.json` story index.
- Produces: `pnpm vrt` — screenshots every story in light AND dark to `vrt/current/<id>--<theme>.png`; compares against `vrt/baseline/` with pixelmatch (>0.1% diff fails, diff images in `vrt/diff/`); first run seeds the baseline. `vrt/baseline/` is committed.

- [ ] **Step 1: Install deps**

Run: `pnpm add -Dw playwright pixelmatch pngjs sirv && pnpm exec playwright install chromium`
Expected: chromium downloaded.

- [ ] **Step 2: Write the harness**

`scripts/vrt.mjs`:
```js
import { createServer } from "node:http";
import { mkdirSync, existsSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from "node:fs";
import sirv from "sirv";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const STATIC = "apps/docs/storybook-static";
const THEMES = ["light", "dark"];
const THRESHOLD = 0.001; // 0.1% differing pixels

if (!existsSync(`${STATIC}/index.json`)) {
  console.error(`Missing ${STATIC}. Run: pnpm --filter @neonglow/docs build`);
  process.exit(1);
}

const server = createServer(sirv(STATIC, { single: false })).listen(0);
const port = server.address().port;
const index = JSON.parse(readFileSync(`${STATIC}/index.json`, "utf8"));
const stories = Object.values(index.entries).filter((e) => e.type === "story");

for (const d of ["vrt/current", "vrt/diff", "vrt/baseline"]) mkdirSync(d, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
let failures = 0, seeded = 0;

for (const story of stories) {
  for (const theme of THEMES) {
    const name = `${story.id}--${theme}.png`;
    await page.goto(`http://localhost:${port}/iframe.html?id=${story.id}&globals=theme:${theme}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(150);
    await page.screenshot({ path: `vrt/current/${name}` });
    const basePath = `vrt/baseline/${name}`;
    if (!existsSync(basePath)) { copyFileSync(`vrt/current/${name}`, basePath); seeded++; continue; }
    const a = PNG.sync.read(readFileSync(basePath));
    const b = PNG.sync.read(readFileSync(`vrt/current/${name}`));
    if (a.width !== b.width || a.height !== b.height) { failures++; console.error("SIZE DIFF", name); continue; }
    const diff = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.15 });
    if (n / (a.width * a.height) > THRESHOLD) {
      failures++;
      writeFileSync(`vrt/diff/${name}`, PNG.sync.write(diff));
      console.error(`DIFF ${name}: ${n}px`);
    }
  }
}

await browser.close();
server.close();
console.log(`VRT: ${stories.length} stories x ${THEMES.length} themes, ${seeded} baselines seeded, ${failures} failures`);
process.exit(failures ? 1 : 0);
```

- [ ] **Step 3: Run to seed baselines**

Run: `pnpm --filter @neonglow/docs build && pnpm vrt`
Expected: `VRT: 1 stories x 2 themes, 2 baselines seeded, 0 failures`, exit 0.
Run again: `pnpm vrt`
Expected: `0 baselines seeded, 0 failures` (stable).

- [ ] **Step 4: Commit**
```bash
git add scripts/vrt.mjs vrt/baseline package.json pnpm-lock.yaml && git commit -m "feat(vrt): playwright dual-theme visual regression harness"
```

---

### Task 7: @neonglow/core — package scaffold + cx + types (TDD)

**Files:**
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/vite.config.ts`, `packages/core/vitest.setup.ts`, `packages/core/src/index.ts`, `packages/core/src/cx.ts`, `packages/core/src/types.ts`
- Test: `packages/core/src/cx.test.ts`

**Interfaces:**
- Produces: `cx(...parts: Array<string | false | null | undefined>): string`; `type Intent = "none" | "success" | "warning" | "danger" | "info"`; vitest environment with jsdom + `expect.extend(axe)`; Vite lib build emitting `dist/index.js`, `dist/index.d.ts`, `dist/neonglow-core.css`. Package export map: `"."` and `"./styles.css"`. Every later task adds exports to `src/index.ts`.

- [ ] **Step 1: Package scaffold**

`packages/core/package.json`:
```json
{
  "name": "@neonglow/core",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/neonglow-core.css"
  },
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "scripts": { "build": "vite build", "test": "vitest run" },
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "dependencies": { "@neonglow/icons": "workspace:*" },
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

`packages/core/tsconfig.json`:
```json
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "dist" }, "include": ["src", "vitest.setup.ts"] }
```

`packages/core/vite.config.ts`:
```ts
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ include: ["src"], exclude: ["**/*.test.*", "**/*.stories.*"] })],
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: "index", cssFileName: "neonglow-core" },
    cssCodeSplit: false,
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "@neonglow/icons"] },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
```

`packages/core/vitest.setup.ts`:
```ts
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";
expect.extend(matchers);
```

`packages/core/src/types.ts`:
```ts
export type Intent = "none" | "success" | "warning" | "danger" | "info";
```

`packages/core/src/index.ts`:
```ts
export { cx } from "./cx.js";
export type { Intent } from "./types.js";
```

- [ ] **Step 2: Write the failing test**

`packages/core/src/cx.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cx } from "./cx.js";

describe("cx", () => {
  it("joins truthy parts with spaces", () => {
    expect(cx("a", false, "b", undefined, null, "c")).toBe("a b c");
  });
  it("returns empty string for no truthy parts", () => {
    expect(cx(false, undefined)).toBe("");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm install && pnpm --filter @neonglow/core exec vitest run`
Expected: FAIL — `./cx.js` unresolved.

- [ ] **Step 4: Implement cx**

`packages/core/src/cx.ts`:
```ts
/** Minimal class joiner — keeps @neonglow/core dependency-free. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
```

- [ ] **Step 5: Run tests + build**

Run: `pnpm --filter @neonglow/core exec vitest run`
Expected: PASS (2 tests).
Run: `pnpm --filter @neonglow/core build`
Expected: `dist/index.js`, `dist/index.d.ts` emitted (no CSS yet — fine).

- [ ] **Step 6: Commit**
```bash
git add packages/core pnpm-lock.yaml && git commit -m "feat(core): package scaffold, cx util, Intent type, test infra"
```

---

### Task 8: Button + ButtonGroup

**Files:**
- Create: `packages/core/src/button/{Button.tsx,ButtonGroup.tsx,button.module.css,Button.test.tsx,Button.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`.
- Produces: `Button` — `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "secondary" | "ghost" | "danger" }` (default `secondary`, always `type="button"` unless overridden, forwards ref); `ButtonGroup` — `HTMLAttributes<HTMLDivElement>`, `role="group"`.

- [ ] **Step 1: Write the failing tests**

`packages/core/src/button/Button.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";

describe("Button", () => {
  it("renders an accessible button and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Commit capital</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Commit capital" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it("defaults type=button and variant=secondary", () => {
    render(<Button>Save</Button>);
    const b = screen.getByRole("button");
    expect(b).toHaveProperty("type", "button");
    expect(b.className).toContain("secondary");
  });
  it("applies the variant class", () => {
    render(<Button variant="primary">Go</Button>);
    expect(screen.getByRole("button").className).toContain("primary");
  });
  it("disabled blocks clicks", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
  it("has no axe violations", async () => {
    const { container } = render(
      <ButtonGroup><Button variant="primary">Save</Button><Button>Cancel</Button></ButtonGroup>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @neonglow/core exec vitest run src/button`
Expected: FAIL — `./Button.js` unresolved.

- [ ] **Step 3: Implement**

`packages/core/src/button/button.module.css`:
```css
/* Action affordance: soft radius, density-driven height, glow token on dark. */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: var(--control-h); padding: 0 var(--pad-x);
  border-radius: var(--radius-action);
  font-family: var(--font-sans); font-size: var(--fs-ui); font-weight: 500;
  letter-spacing: .01em; white-space: nowrap; cursor: pointer;
  border: 1px solid var(--border-hairline);
  background: var(--surface); color: var(--text-1);
  transition: background .12s ease, border-color .12s ease, color .12s ease;
}
.btn:hover { background: var(--surface-sunken); }
.btn:active { background: var(--surface-sunken-2); }
.btn:disabled { opacity: .4; cursor: not-allowed; }

.primary { background: var(--accent); color: var(--on-accent); border-color: transparent; box-shadow: var(--glow); }
.primary:hover { background: var(--accent-hover); }
.primary:active { background: var(--accent-press); }

.ghost { background: transparent; border-color: transparent; color: var(--text-2); }
.ghost:hover { background: var(--surface-sunken); color: var(--text-1); }

.danger { color: var(--intent-danger); border-color: color-mix(in srgb, var(--intent-danger) 45%, transparent); }
.danger:hover { background: var(--intent-danger-bg); }

.secondary {} /* base styles are the secondary variant */

.group { display: inline-flex; gap: 8px; }
```

`packages/core/src/button/Button.tsx`:
```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. `primary` is the single accent action on a view. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", className, type = "button", ...rest },
  ref
) {
  return (
    <button ref={ref} type={type} className={cx(styles.btn, styles[variant], className)} {...rest} />
  );
});
```

`packages/core/src/button/ButtonGroup.tsx`:
```tsx
import type { HTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./button.module.css";

export function ButtonGroup({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div role="group" className={cx(styles.group, className)} {...rest} />;
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Button, type ButtonProps } from "./button/Button.js";
export { ButtonGroup } from "./button/ButtonGroup.js";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @neonglow/core exec vitest run src/button`
Expected: PASS (5 tests).

- [ ] **Step 5: Story**

`packages/core/src/button/Button.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";

const meta: Meta<typeof Button> = { title: "Core/Button", component: Button };
export default meta;

export const Variants: StoryObj = {
  render: () => (
    <ButtonGroup>
      <Button variant="primary">Commit capital</Button>
      <Button>Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Write off</Button>
      <Button disabled>Disabled</Button>
    </ButtonGroup>
  ),
};
```

Run: `pnpm --filter @neonglow/docs build`
Expected: build succeeds, story compiled.

- [ ] **Step 6: Commit**
```bash
git add packages/core && git commit -m "feat(core): Button + ButtonGroup"
```

---

### Task 9: Spinner + Divider

**Files:**
- Create: `packages/core/src/spinner/{Spinner.tsx,spinner.module.css,Spinner.test.tsx,Spinner.stories.tsx}`, `packages/core/src/divider/{Divider.tsx,divider.module.css,Divider.test.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`.
- Produces: `Spinner` — `SpinnerProps { size?: number; label?: string }` (default size 20, default label `"Loading"`, `role="status"`); `Divider` — `HTMLAttributes<HTMLHRElement>` rendering `<hr>` hairline.

- [ ] **Step 1: Write the failing tests**

`packages/core/src/spinner/Spinner.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Spinner } from "./Spinner.js";

describe("Spinner", () => {
  it("is a labelled status region", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
  });
  it("accepts a custom label and size", () => {
    render(<Spinner label="Recalculating MOIC" size={32} />);
    const el = screen.getByRole("status", { name: "Recalculating MOIC" });
    expect(el.querySelector("svg")!.getAttribute("width")).toBe("32");
  });
  it("has no axe violations", async () => {
    const { container } = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

`packages/core/src/divider/Divider.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Divider } from "./Divider.js";

describe("Divider", () => {
  it("renders a separator", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @neonglow/core exec vitest run src/spinner src/divider`
Expected: FAIL — modules unresolved.

- [ ] **Step 3: Implement**

`packages/core/src/spinner/spinner.module.css`:
```css
.spinner { display: inline-flex; color: var(--text-3); }
.svg { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
/* theme.css globally disables animation under prefers-reduced-motion */
```

`packages/core/src/spinner/Spinner.tsx`:
```tsx
import styles from "./spinner.module.css";

export interface SpinnerProps {
  /** Pixel size of the spinner. */
  size?: number;
  /** Accessible label announced to screen readers. */
  label?: string;
}

export function Spinner({ size = 20, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={styles.spinner}>
      <svg className={styles.svg} width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 1-6.36 2.64" />
      </svg>
    </span>
  );
}
```

`packages/core/src/divider/divider.module.css`:
```css
.divider { border: 0; height: 1px; background: var(--border-hairline); margin: var(--baseline-half) 0; }
```

`packages/core/src/divider/Divider.tsx`:
```tsx
import type { HTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./divider.module.css";

export function Divider({ className, ...rest }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cx(styles.divider, className)} {...rest} />;
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Spinner, type SpinnerProps } from "./spinner/Spinner.js";
export { Divider } from "./divider/Divider.js";
```

`packages/core/src/spinner/Spinner.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner.js";

const meta: Meta<typeof Spinner> = { title: "Core/Spinner", component: Spinner };
export default meta;
export const Default: StoryObj<typeof Spinner> = {};
export const Large: StoryObj<typeof Spinner> = { args: { size: 32 } };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @neonglow/core exec vitest run src/spinner src/divider`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add packages/core && git commit -m "feat(core): Spinner + Divider"
```

---

### Task 10: Tag

**Files:**
- Create: `packages/core/src/tag/{Tag.tsx,tag.module.css,Tag.test.tsx,Tag.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `Intent`, `IconX` from `@neonglow/icons`.
- Produces: `Tag` — `TagProps extends HTMLAttributes<HTMLSpanElement> { intent?: Intent; accent?: boolean; onRemove?: () => void }`. `onRemove` renders a labelled remove button (`aria-label="Remove <text>"` where `<text>` is the tag's string children when available, else `"Remove"`).

- [ ] **Step 1: Write the failing tests**

`packages/core/src/tag/Tag.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tag } from "./Tag.js";

describe("Tag", () => {
  it("renders children with the intent class", () => {
    render(<Tag intent="success">2.09×</Tag>);
    expect(screen.getByText("2.09×").className).toContain("success");
  });
  it("renders a labelled remove button when onRemove given", async () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Agritech</Tag>);
    await userEvent.click(screen.getByRole("button", { name: "Remove Agritech" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tag intent="danger" onRemove={() => {}}>Written off</Tag>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @neonglow/core exec vitest run src/tag`
Expected: FAIL — module unresolved.

- [ ] **Step 3: Implement**

`packages/core/src/tag/tag.module.css`:
```css
.tag {
  display: inline-flex; align-items: center; gap: 6px;
  height: 22px; padding: 0 9px; border-radius: var(--radius-action);
  font-family: var(--font-sans); font-size: var(--fs-micro); font-weight: 500; letter-spacing: .03em;
  background: var(--surface-sunken); color: var(--text-2);
}
.success { background: var(--intent-success-bg); color: var(--intent-success); box-shadow: var(--glow); }
.warning { background: var(--intent-warning-bg); color: var(--intent-warning); box-shadow: var(--glow); }
.danger  { background: var(--intent-danger-bg);  color: var(--intent-danger);  box-shadow: var(--glow); }
.info    { background: var(--intent-info-bg);    color: var(--intent-info);    box-shadow: var(--glow); }
.accent  { background: var(--accent); color: var(--on-accent); }
.remove {
  appearance: none; border: 0; background: transparent; color: inherit;
  display: inline-flex; padding: 2px; margin-right: -4px; cursor: pointer;
  border-radius: var(--radius-action);
}
.remove:hover { background: color-mix(in srgb, currentColor 14%, transparent); }
```

`packages/core/src/tag/Tag.tsx`:
```tsx
import type { HTMLAttributes } from "react";
import { IconX } from "@neonglow/icons";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./tag.module.css";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  intent?: Intent;
  /** Brand-accent tag (green). Reserved for earned moments, e.g. "Exited". */
  accent?: boolean;
  onRemove?: () => void;
}

export function Tag({ intent = "none", accent, onRemove, className, children, ...rest }: TagProps) {
  const label = typeof children === "string" ? `Remove ${children}` : "Remove";
  return (
    <span
      className={cx(styles.tag, intent !== "none" && styles[intent], accent && styles.accent, className)}
      {...rest}
    >
      {children}
      {onRemove ? (
        <button type="button" className={styles.remove} aria-label={label} onClick={onRemove}>
          <IconX size={16} />
        </button>
      ) : null}
    </span>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Tag, type TagProps } from "./tag/Tag.js";
```

`packages/core/src/tag/Tag.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./Tag.js";

const meta: Meta<typeof Tag> = { title: "Core/Tag", component: Tag };
export default meta;

export const Intents: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tag accent>Exited</Tag>
      <Tag intent="success">2.09×</Tag>
      <Tag intent="info">Active</Tag>
      <Tag intent="warning">At cost</Tag>
      <Tag intent="danger">Written off</Tag>
      <Tag onRemove={() => {}}>Agritech</Tag>
    </div>
  ),
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @neonglow/core exec vitest run src/tag`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**
```bash
git add packages/core && git commit -m "feat(core): Tag with intents, accent and remove affordance"
```

---

### Task 11: Card + Callout

**Files:**
- Create: `packages/core/src/card/{Card.tsx,card.module.css,Card.test.tsx,Card.stories.tsx}`, `packages/core/src/callout/{Callout.tsx,callout.module.css,Callout.test.tsx,Callout.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `Intent`, icons `IconInfo/IconWarning/IconError/IconSuccess`.
- Produces: `Card` — `CardProps extends HTMLAttributes<HTMLDivElement> { title?: string; actions?: ReactNode; sunken?: boolean }` (data surface, radius-0, no shadow ever); `Callout` — `CalloutProps extends HTMLAttributes<HTMLDivElement> { intent?: Intent; title?: string }` (auto icon per intent, glowing icon on dark via `--glow`).

- [ ] **Step 1: Write the failing tests**

`packages/core/src/card/Card.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Card } from "./Card.js";

describe("Card", () => {
  it("renders title as a heading and children as content", () => {
    render(<Card title="Fund structure">28 holdings</Card>);
    expect(screen.getByRole("heading", { name: "Fund structure" })).toBeTruthy();
    expect(screen.getByText("28 holdings")).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Card title="Portfolio">Content</Card>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

`packages/core/src/callout/Callout.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Callout } from "./Callout.js";

describe("Callout", () => {
  it("renders title, body and the intent icon", () => {
    const { container } = render(
      <Callout intent="warning" title="Held at cost">No fresh round in 18 months.</Callout>
    );
    expect(screen.getByText("Held at cost")).toBeTruthy();
    expect(container.querySelector('[data-icon="warning"]')).toBeTruthy();
  });
  it("has no axe violations", async () => {
    const { container } = render(<Callout intent="danger" title="Write-off recorded">One position closed.</Callout>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @neonglow/core exec vitest run src/card src/callout`
Expected: FAIL — modules unresolved.

- [ ] **Step 3: Implement**

`packages/core/src/card/card.module.css`:
```css
/* Data surface: radius 0, hairline border, NO shadow, NO glow. */
.card { background: var(--surface); border: 1px solid var(--border-hairline);
  border-radius: var(--radius-0); padding: calc(var(--baseline) - 1px); }
.sunken { background: var(--surface-sunken); }
.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--baseline-half); }
.title { margin: 0; font-family: var(--font-sans); font-size: var(--fs-h3); font-weight: 500; letter-spacing: -.01em; color: var(--text-1); }
```

`packages/core/src/card/Card.tsx`:
```tsx
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../cx.js";
import styles from "./card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  /** Right-aligned header slot (buttons, tags). */
  actions?: ReactNode;
  sunken?: boolean;
}

export function Card({ title, actions, sunken, className, children, ...rest }: CardProps) {
  return (
    <div className={cx(styles.card, sunken && styles.sunken, className)} {...rest}>
      {title || actions ? (
        <div className={styles.head}>
          {title ? <h3 className={styles.title}>{title}</h3> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </div>
  );
}
```

`packages/core/src/callout/callout.module.css`:
```css
.callout { display: flex; gap: 12px; align-items: flex-start;
  border-left: 3px solid var(--text-3); background: var(--surface-sunken);
  padding: var(--baseline-half) var(--baseline); border-radius: var(--radius-0); }
.icon { flex: none; margin-top: 2px; filter: drop-shadow(var(--glow)); }
.title { margin: 0 0 2px; font-size: var(--fs-ui); font-weight: 500; color: var(--text-1); }
.body { font-size: var(--fs-ui); font-weight: 300; color: var(--text-2); line-height: var(--baseline); }
.success { border-color: var(--intent-success); } .success .icon { color: var(--intent-success); }
.warning { border-color: var(--intent-warning); } .warning .icon { color: var(--intent-warning); }
.danger  { border-color: var(--intent-danger); }  .danger .icon  { color: var(--intent-danger); }
.info    { border-color: var(--intent-info); }    .info .icon    { color: var(--intent-info); }
```

`packages/core/src/callout/Callout.tsx`:
```tsx
import type { HTMLAttributes } from "react";
import { IconError, IconInfo, IconSuccess, IconWarning } from "@neonglow/icons";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./callout.module.css";

const ICONS = { success: IconSuccess, warning: IconWarning, danger: IconError, info: IconInfo } as const;

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  intent?: Intent;
  title?: string;
}

export function Callout({ intent = "none", title, className, children, ...rest }: CalloutProps) {
  const Icon = intent !== "none" ? ICONS[intent] : null;
  return (
    <div className={cx(styles.callout, intent !== "none" && styles[intent], className)} {...rest}>
      {Icon ? <span className={styles.icon}><Icon size={20} /></span> : null}
      <div>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Card, type CardProps } from "./card/Card.js";
export { Callout, type CalloutProps } from "./callout/Callout.js";
```

`packages/core/src/card/Card.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card.js";
import { Tag } from "../tag/Tag.js";

const meta: Meta<typeof Card> = { title: "Core/Card", component: Card };
export default meta;
export const WithHeader: StoryObj = {
  render: () => (
    <Card title="Fund structure" actions={<Tag>Tree</Tag>}>
      Across two vehicles, we have deployed €4.15M into 35 portfolio companies.
    </Card>
  ),
};
```

`packages/core/src/callout/Callout.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Callout } from "./Callout.js";

const meta: Meta<typeof Callout> = { title: "Core/Callout", component: Callout };
export default meta;
export const Intents: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <Callout intent="success" title="Position marked up">Hedgehop crossed 1.2×.</Callout>
      <Callout intent="info" title="Quarter close pending">Q4 2026 valuations lock on 15 Jan.</Callout>
      <Callout intent="warning" title="Held at cost">No fresh round in 18 months.</Callout>
      <Callout intent="danger" title="Write-off recorded">One COVID-era position closed.</Callout>
    </div>
  ),
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @neonglow/core exec vitest run src/card src/callout`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add packages/core && git commit -m "feat(core): Card (data surface) + Callout (intents)"
```

---

### Task 12: FormGroup + TextInput + TextArea + NumericInput

**Files:**
- Create: `packages/core/src/form/{FormGroup.tsx,TextInput.tsx,TextArea.tsx,NumericInput.tsx,form.module.css,Form.test.tsx,Form.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `Intent`.
- Produces: `FormGroup` — `FormGroupProps { label: string; labelFor?: string; helperText?: string; intent?: Intent; children: ReactNode }`; `TextInput` — `TextInputProps extends InputHTMLAttributes<HTMLInputElement> { intent?: Intent; mono?: boolean }` (forwards ref); `TextArea` — same pattern over `TextareaHTMLAttributes<HTMLTextAreaElement>`; `NumericInput` — `TextInputProps` preconfigured with `inputMode="decimal"` and `mono` default true (tabular money values, e.g. `€250,000`).

- [ ] **Step 1: Write the failing tests**

`packages/core/src/form/Form.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { FormGroup } from "./FormGroup.js";
import { TextInput } from "./TextInput.js";
import { TextArea } from "./TextArea.js";
import { NumericInput } from "./NumericInput.js";

describe("form controls", () => {
  it("FormGroup associates label with control", async () => {
    render(
      <FormGroup label="Fund" labelFor="fund">
        <TextInput id="fund" defaultValue="Foodtech Fund I" />
      </FormGroup>
    );
    const input = screen.getByLabelText("Fund");
    await userEvent.clear(input);
    await userEvent.type(input, "Genesys SPV");
    expect((input as HTMLInputElement).value).toBe("Genesys SPV");
  });
  it("intent=danger marks the input invalid", () => {
    render(<TextInput intent="danger" aria-label="Ticket" />);
    const input = screen.getByLabelText("Ticket");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("danger");
  });
  it("TextArea renders a multiline control", () => {
    render(<TextArea aria-label="Memo" rows={3} />);
    expect(screen.getByLabelText("Memo").tagName).toBe("TEXTAREA");
  });
  it("NumericInput defaults to decimal inputMode and mono", () => {
    render(<NumericInput aria-label="Ticket" defaultValue="€250,000" />);
    const input = screen.getByLabelText("Ticket");
    expect(input.getAttribute("inputmode")).toBe("decimal");
    expect(input.className).toContain("mono");
  });
  it("has no axe violations", async () => {
    const { container } = render(
      <FormGroup label="Fair value" labelFor="fv" helperText="Updates blended MOIC.">
        <NumericInput id="fv" defaultValue="€410,000" />
      </FormGroup>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @neonglow/core exec vitest run src/form`
Expected: FAIL — modules unresolved.

- [ ] **Step 3: Implement**

`packages/core/src/form/form.module.css`:
```css
.group { display: flex; flex-direction: column; gap: 6px; }
.label { font-family: var(--font-sans); font-size: var(--fs-micro); letter-spacing: .1em;
  text-transform: uppercase; font-weight: 500; color: var(--text-3); }
.helper { font-size: var(--fs-cap); color: var(--text-3); line-height: var(--baseline-half); }
.helperDanger { color: var(--intent-danger); }

.input { height: var(--control-h); padding: 0 var(--pad-x);
  border-radius: var(--radius-action); border: 1px solid var(--border-hairline);
  background: var(--surface); color: var(--text-1);
  font-family: var(--font-sans); font-size: var(--fs-ui); width: 100%;
  transition: border-color .12s ease, background .12s ease; }
.input::placeholder { color: var(--text-3); }
.input:hover { border-color: var(--text-3); }
.input:disabled { opacity: .4; cursor: not-allowed; }
.area { height: auto; padding: var(--pad-y) var(--pad-x); line-height: var(--baseline);
  resize: vertical; }
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.danger { border-color: var(--intent-danger); }
.warning { border-color: var(--intent-warning); }
.success { border-color: var(--intent-success); }
.info { border-color: var(--intent-info); }
```

`packages/core/src/form/FormGroup.tsx`:
```tsx
import type { ReactNode } from "react";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./form.module.css";

export interface FormGroupProps {
  label: string;
  /** id of the control inside — wires <label for>. */
  labelFor?: string;
  helperText?: string;
  intent?: Intent;
  children: ReactNode;
}

export function FormGroup({ label, labelFor, helperText, intent = "none", children }: FormGroupProps) {
  return (
    <div className={styles.group}>
      <label className={styles.label} htmlFor={labelFor}>{label}</label>
      {children}
      {helperText ? (
        <p className={cx(styles.helper, intent === "danger" && styles.helperDanger)}>{helperText}</p>
      ) : null}
    </div>
  );
}
```

`packages/core/src/form/TextInput.tsx`:
```tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./form.module.css";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  intent?: Intent;
  /** Tabular monospace — for money flows and numerics. */
  mono?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { intent = "none", mono, className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={intent === "danger" ? true : undefined}
      className={cx(styles.input, mono && styles.mono, intent !== "none" && styles[intent], className)}
      {...rest}
    />
  );
});
```

`packages/core/src/form/TextArea.tsx`:
```tsx
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cx } from "../cx.js";
import type { Intent } from "../types.js";
import styles from "./form.module.css";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  intent?: Intent;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { intent = "none", className, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={intent === "danger" ? true : undefined}
      className={cx(styles.input, styles.area, intent !== "none" && styles[intent], className)}
      {...rest}
    />
  );
});
```

`packages/core/src/form/NumericInput.tsx`:
```tsx
import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "./TextInput.js";

/** Text input preconfigured for numeric/money entry: decimal inputMode, tabular mono. */
export const NumericInput = forwardRef<HTMLInputElement, TextInputProps>(function NumericInput(
  { mono = true, inputMode = "decimal", ...rest },
  ref
) {
  return <TextInput ref={ref} mono={mono} inputMode={inputMode} {...rest} />;
});
```

Append to `packages/core/src/index.ts`:
```ts
export { FormGroup, type FormGroupProps } from "./form/FormGroup.js";
export { TextInput, type TextInputProps } from "./form/TextInput.js";
export { TextArea, type TextAreaProps } from "./form/TextArea.js";
export { NumericInput } from "./form/NumericInput.js";
```

`packages/core/src/form/Form.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { FormGroup } from "./FormGroup.js";
import { TextInput } from "./TextInput.js";
import { NumericInput } from "./NumericInput.js";

const meta: Meta = { title: "Core/Form" };
export default meta;

export const Fields: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 560 }}>
      <FormGroup label="Fund" labelFor="fund">
        <TextInput id="fund" defaultValue="Foodtech Fund I" />
      </FormGroup>
      <FormGroup label="Ticket" labelFor="ticket" helperText="Euro sign prefix, capital magnitude suffix.">
        <NumericInput id="ticket" defaultValue="€250,000" />
      </FormGroup>
      <FormGroup label="Company" labelFor="co" helperText="Required." intent="danger">
        <TextInput id="co" intent="danger" placeholder="Missing" />
      </FormGroup>
    </div>
  ),
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @neonglow/core exec vitest run src/form`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**
```bash
git add packages/core && git commit -m "feat(core): FormGroup, TextInput, TextArea, NumericInput"
```

---

### Task 13: Checkbox + Radio + Switch

**Files:**
- Create: `packages/core/src/selection/{Checkbox.tsx,Radio.tsx,Switch.tsx,selection.module.css,Selection.test.tsx,Selection.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`, `IconCheck`, `IconDash` from `@neonglow/icons`.
- Produces: `Checkbox` — `CheckboxProps extends InputHTMLAttributes<HTMLInputElement> { label: string; indeterminate?: boolean }` (real `<input type="checkbox">` visually replaced, forwards ref); `Radio` — `RadioProps extends InputHTMLAttributes<HTMLInputElement> { label: string }`; `Switch` — `SwitchProps extends InputHTMLAttributes<HTMLInputElement> { label: string }` (checkbox with `role="switch"`).

- [ ] **Step 1: Write the failing tests**

`packages/core/src/selection/Selection.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Checkbox } from "./Checkbox.js";
import { Radio } from "./Radio.js";
import { Switch } from "./Switch.js";

describe("selection controls", () => {
  it("Checkbox toggles via label click and keyboard", async () => {
    render(<Checkbox label="Lead" />);
    const box = screen.getByRole("checkbox", { name: "Lead" });
    await userEvent.click(screen.getByText("Lead"));
    expect((box as HTMLInputElement).checked).toBe(true);
    box.focus();
    await userEvent.keyboard(" ");
    expect((box as HTMLInputElement).checked).toBe(false);
  });
  it("Checkbox supports indeterminate", () => {
    render(<Checkbox label="All" indeterminate />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);
  });
  it("Radios in a group are exclusive", async () => {
    render(<><Radio name="v" label="SPV" defaultChecked /><Radio name="v" label="Fund" /></>);
    await userEvent.click(screen.getByRole("radio", { name: "Fund" }));
    expect((screen.getByRole("radio", { name: "SPV" }) as HTMLInputElement).checked).toBe(false);
  });
  it("Switch exposes role=switch", async () => {
    render(<Switch label="Reserved" defaultChecked />);
    const sw = screen.getByRole("switch", { name: "Reserved" });
    expect((sw as HTMLInputElement).checked).toBe(true);
  });
  it("has no axe violations", async () => {
    const { container } = render(
      <><Checkbox label="Lead" /><Radio name="g" label="SPV" /><Switch label="Reserved" /></>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @neonglow/core exec vitest run src/selection`
Expected: FAIL — modules unresolved.

- [ ] **Step 3: Implement**

`packages/core/src/selection/selection.module.css`:
```css
.check { display: inline-flex; align-items: center; gap: 9px; cursor: pointer;
  font-family: var(--font-sans); font-size: var(--fs-ui); color: var(--text-2); }
.input { position: absolute; opacity: 0; width: 0; height: 0; }
.box { width: 18px; height: 18px; flex: none; border: 1.5px solid var(--text-3); border-radius: 3px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--on-accent); transition: background .12s ease, border-color .12s ease; }
.mark { opacity: 0; }
.input:checked + .box, .input:indeterminate + .box { background: var(--accent); border-color: var(--accent); }
.input:checked + .box .mark, .input:indeterminate + .box .mark { opacity: 1; }
.input:focus-visible + .box { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.input:disabled + .box { opacity: .4; }

.round { border-radius: 50%; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent);
  transform: scale(0); transition: transform .12s ease; }
.input:checked + .round .dot { transform: scale(1); }

.track { width: 36px; height: 20px; flex: none; border-radius: 20px;
  background: var(--surface-sunken-2); border: 1px solid var(--border-hairline);
  position: relative; transition: background .14s ease; }
.track::after { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
  border-radius: 50%; background: var(--text-2); transition: left .14s ease, background .14s ease; }
.input:checked + .track { background: var(--accent); border-color: transparent; }
.input:checked + .track::after { left: 18px; background: var(--on-accent); }
.input:focus-visible + .track { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
```

`packages/core/src/selection/Checkbox.tsx`:
```tsx
import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from "react";
import { IconCheck, IconDash } from "@neonglow/icons";
import styles from "./selection.module.css";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate = false, ...rest },
  outerRef
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className={styles.check}>
      <input
        type="checkbox" className={styles.input}
        ref={(el) => {
          innerRef.current = el;
          if (typeof outerRef === "function") outerRef(el);
          else if (outerRef) outerRef.current = el;
        }}
        {...rest}
      />
      <span className={styles.box} aria-hidden="true">
        <span className={styles.mark}>{indeterminate ? <IconDash size={16} /> : <IconCheck size={16} />}</span>
      </span>
      {label}
    </label>
  );
});
```

`packages/core/src/selection/Radio.tsx`:
```tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../cx.js";
import styles from "./selection.module.css";

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ label, ...rest }, ref) {
  return (
    <label className={styles.check}>
      <input ref={ref} type="radio" className={styles.input} {...rest} />
      <span className={cx(styles.box, styles.round)} aria-hidden="true"><span className={styles.dot} /></span>
      {label}
    </label>
  );
});
```

`packages/core/src/selection/Switch.tsx`:
```tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./selection.module.css";

export interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ label, ...rest }, ref) {
  return (
    <label className={styles.check}>
      <input ref={ref} type="checkbox" role="switch" className={styles.input} {...rest} />
      <span className={styles.track} aria-hidden="true" />
      {label}
    </label>
  );
});
```

Append to `packages/core/src/index.ts`:
```ts
export { Checkbox, type CheckboxProps } from "./selection/Checkbox.js";
export { Radio, type RadioProps } from "./selection/Radio.js";
export { Switch, type SwitchProps } from "./selection/Switch.js";
```

`packages/core/src/selection/Selection.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox.js";
import { Radio } from "./Radio.js";
import { Switch } from "./Switch.js";

const meta: Meta = { title: "Core/Selection" };
export default meta;

export const Controls: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <Checkbox label="Lead" defaultChecked />
      <Checkbox label="Follow-on" />
      <Checkbox label="All holdings" indeterminate />
      <Radio name="vehicle" label="SPV" defaultChecked />
      <Radio name="vehicle" label="Fund" />
      <Switch label="Reserved" defaultChecked />
    </div>
  ),
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @neonglow/core exec vitest run src/selection`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**
```bash
git add packages/core && git commit -m "feat(core): Checkbox, Radio, Switch"
```

---

### Task 14: Tooltip

**Files:**
- Create: `packages/core/src/tooltip/{Tooltip.tsx,tooltip.module.css,Tooltip.test.tsx,Tooltip.stories.tsx}`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `cx`.
- Produces: `Tooltip` — `TooltipProps { content: string; children: ReactElement }`. CSS-positioned (above, centered), shows on hover AND focus-within, wires `aria-describedby` to a `role="tooltip"` element via `useId`. (Popper-style collision handling is Phase 2's Popover — YAGNI here.)

- [ ] **Step 1: Write the failing tests**

`packages/core/src/tooltip/Tooltip.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Tooltip } from "./Tooltip.js";
import { Button } from "../button/Button.js";

describe("Tooltip", () => {
  it("describes its trigger via aria-describedby", () => {
    render(<Tooltip content="Blended across two vehicles"><Button>1.47×</Button></Tooltip>);
    const trigger = screen.getByRole("button", { name: "1.47×" });
    const tip = screen.getByRole("tooltip", { hidden: true });
    expect(trigger.getAttribute("aria-describedby")).toBe(tip.id);
    expect(tip.textContent).toBe("Blended across two vehicles");
  });
  it("has no axe violations", async () => {
    const { container } = render(<Tooltip content="Help"><Button>Metric</Button></Tooltip>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @neonglow/core exec vitest run src/tooltip`
Expected: FAIL — module unresolved.

- [ ] **Step 3: Implement**

`packages/core/src/tooltip/tooltip.module.css`:
```css
.wrap { position: relative; display: inline-flex; }
.tip { position: absolute; bottom: calc(100% + 8px); left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: var(--border-strong); color: var(--surface);
  font-family: var(--font-sans); font-size: var(--fs-micro); line-height: var(--baseline-half);
  padding: 5px 9px; border-radius: var(--radius-action); white-space: nowrap;
  opacity: 0; pointer-events: none;
  transition: opacity .12s ease-out, transform .12s ease-out; }
.wrap:hover .tip, .wrap:focus-within .tip { opacity: 1; transform: translateX(-50%) translateY(0); }
```

`packages/core/src/tooltip/Tooltip.tsx`:
```tsx
import { cloneElement, useId, type ReactElement } from "react";
import styles from "./tooltip.module.css";

export interface TooltipProps {
  /** Short plain-text help. One clause; middot-separated facts welcome. */
  content: string;
  children: ReactElement;
}

export function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  return (
    <span className={styles.wrap}>
      {cloneElement(children, { "aria-describedby": id })}
      <span role="tooltip" id={id} className={styles.tip}>{content}</span>
    </span>
  );
}
```

Append to `packages/core/src/index.ts`:
```ts
export { Tooltip, type TooltipProps } from "./tooltip/Tooltip.js";
```

`packages/core/src/tooltip/Tooltip.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof Tooltip> = { title: "Core/Tooltip", component: Tooltip };
export default meta;
export const OnButton: StoryObj = {
  render: () => (
    <div style={{ padding: 48 }}>
      <Tooltip content="Spain SPV 2.09× · Fund I 1.27×">
        <Button>Blended 1.47×</Button>
      </Tooltip>
    </div>
  ),
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @neonglow/core exec vitest run src/tooltip`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**
```bash
git add packages/core && git commit -m "feat(core): Tooltip (CSS-positioned, described-by wiring)"
```

---

### Task 15: Integration — full build, kitchen sink, VR baseline refresh

**Files:**
- Create: `apps/docs/stories/KitchenSink.stories.tsx`
- Modify: `vrt/baseline/` (new baselines)

**Interfaces:**
- Consumes: everything exported from `@neonglow/core`, `@neonglow/icons`, `@neonglow/tokens`.

- [ ] **Step 1: Kitchen-sink story (whole tranche on one screen, brand copy)**

`apps/docs/stories/KitchenSink.stories.tsx`:
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button, ButtonGroup, Callout, Card, Checkbox, Divider, FormGroup,
  NumericInput, Radio, Spinner, Switch, Tag, TextInput, Tooltip,
} from "@neonglow/core";

const meta: Meta = { title: "Core/Kitchen sink" };
export default meta;

export const AllComponents: StoryObj = {
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
      <Card title="Portfolio — Foodtech Fund I" actions={<Tag accent>Exited</Tag>}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Tag intent="success">2.09×</Tag>
          <Tag intent="info">Active</Tag>
          <Tag intent="warning">At cost</Tag>
          <Tag intent="danger" onRemove={() => {}}>Written off</Tag>
        </div>
        <Divider />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 12 }}>
          <FormGroup label="Fund" labelFor="ks-fund">
            <TextInput id="ks-fund" defaultValue="Foodtech Fund I" />
          </FormGroup>
          <FormGroup label="Ticket" labelFor="ks-ticket">
            <NumericInput id="ks-ticket" defaultValue="€250,000" />
          </FormGroup>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center", margin: "12px 0", flexWrap: "wrap" }}>
          <Checkbox label="Lead" defaultChecked />
          <Radio name="ks-v" label="SPV" defaultChecked />
          <Radio name="ks-v" label="Fund" />
          <Switch label="Reserved" defaultChecked />
          <Spinner label="Recalculating" />
        </div>
        <ButtonGroup>
          <Tooltip content="Sets the Q4 2026 fair value">
            <Button variant="primary">Save valuation</Button>
          </Tooltip>
          <Button variant="ghost">Cancel</Button>
        </ButtonGroup>
      </Card>
      <Callout intent="success" title="Position marked up">
        Hedgehop crossed 1.2× — moved to the performance tint automatically.
      </Callout>
    </div>
  ),
};
```

- [ ] **Step 2: Full monorepo build + all tests**

Run: `pnpm build && pnpm test`
Expected: all packages build; tokens 9, icons 4, core 30 tests pass.
Verify the core CSS bundle only uses tokens:
Run: `grep -cE "#[0-9a-fA-F]{3,8}" packages/core/dist/neonglow-core.css || echo 0`
Expected: `0` (no raw hex — Global Constraint holds).

- [ ] **Step 3: Refresh VR baselines**

Run: `pnpm --filter @neonglow/docs build && pnpm vrt`
Expected: new stories seed baselines, 0 failures. Run `pnpm vrt` again → stable, 0 failures.

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: kitchen sink story, full build green, VR baselines"
```

- [ ] **Step 5: Push**
```bash
git push origin main
```

---

## Self-review notes

- **Spec coverage (Phase 0 + 1, spec §9):** monorepo → T1; tokens+themes+density+contrast rule → T2–T3; icons → T4; Storybook dual toggles → T5; a11y harness → vitest-axe in every component task + addon-a11y in T5; VR harness → T6; build pipeline → per-package `build` + turbo. Phase 1 components: Button/Group T8, Spinner T9, Divider T9, Tag T10, Card T11, Callout T11, FormGroup/inputs T12, Checkbox/Radio/Switch T13, Tooltip T14. Integration T15.
- **Deliberate scope holds (YAGNI, per spec):** Tooltip is CSS-positioned (real Popover is Phase 2); NumericInput has no steppers (Phase 2+); no Storybook interaction tests (unit tests cover behavior); publishing/registry deferred (spec §10).
- **Type consistency:** `Intent` defined once (T7), consumed by Tag/Callout/Form; `cx` signature identical everywhere; icon names in T10/T11/T13 (`IconX`, `IconCheck`, `IconDash`, `IconInfo`, `IconWarning`, `IconError`, `IconSuccess`) all exist in T4's export list.
