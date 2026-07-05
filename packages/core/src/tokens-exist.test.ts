/**
 * Guard: every CSS custom property referenced via var(--x) in *.module.css
 * files must be defined by @neonglow/tokens.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { primitives, themes, densities, cssVarName } from "@neonglow/tokens";

// Component-scoped custom properties: set by the component itself (inline style
// or local rule), not design tokens. Each entry must name the defining component.
const COMPONENT_SCOPED = new Set([
  "--drawer-size", // Drawer: set via inline style from the `size` prop
]);

// ── helpers ──────────────────────────────────────────────────────────────────

function walkCss(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkCss(full));
    } else if (full.endsWith(".module.css")) {
      results.push(full);
    }
  }
  return results;
}

function extractVarRefs(css: string): string[] {
  const refs: string[] = [];
  const re = /var\(\s*(--[a-z0-9-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    refs.push(m[1]);
  }
  return refs;
}

function buildDefinedSet(): Set<string> {
  const defined = new Set<string>();
  for (const key of Object.keys(primitives)) defined.add(cssVarName(key));
  for (const key of Object.keys(themes.light)) defined.add(cssVarName(key));
  for (const key of Object.keys(themes.dark)) defined.add(cssVarName(key));
  for (const key of Object.keys(densities.default)) defined.add(cssVarName(key));
  for (const key of Object.keys(densities.compact)) defined.add(cssVarName(key));
  return defined;
}

// ── test ─────────────────────────────────────────────────────────────────────

describe("CSS module token references", () => {
  it("every var(--x) in *.module.css is a defined @neonglow/tokens token", () => {
    // process.cwd() is the package root; src/ lives next to it
    const srcDir = resolve(process.cwd(), "src");
    const cssFiles = walkCss(srcDir);

    const defined = buildDefinedSet();
    const missing: { file: string; token: string }[] = [];

    for (const file of cssFiles) {
      const css = readFileSync(file, "utf-8");
      for (const token of extractVarRefs(css)) {
        if (!defined.has(token) && !COMPONENT_SCOPED.has(token)) {
          missing.push({ file: file.replace(srcDir + "/", ""), token });
        }
      }
    }

    expect(
      missing,
      `Undefined tokens found:\n${missing
        .map((m) => `  ${m.token}  (in ${m.file})`)
        .join("\n")}`
    ).toHaveLength(0);
  });
});
