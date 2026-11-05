import { describe, it, expect } from "vitest";
import { themes, densities, primitives } from "../src/index.js";
import { cssVarName } from "../src/cssname.js";
import { renderThemeCss } from "../src/generate.js";

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

describe("neon glow series", () => {
  const lum = (h: string) => {
    const n = parseInt(h.slice(1), 16);
    const f = (c: number) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
  };
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const keys = ["series1", "series2", "series3", "series4", "series5"] as const;
  it("light series reach 3:1 on white", () => {
    for (const k of keys) expect(ratio(themes.light[k], "#ffffff"), k).toBeGreaterThanOrEqual(3);
  });
  it("dark series reach 7:1 on ink", () => {
    for (const k of keys) expect(ratio(themes.dark[k], "#0a0a0a"), k).toBeGreaterThanOrEqual(7);
  });
});

describe("densities", () => {
  it("heights are half-baseline (12px) multiples", () => {
    for (const d of Object.values(densities))
      for (const v of [d.controlH, d.rowH, d.navbarH])
        expect(parseInt(v) % 12, v).toBe(0);
  });
});

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
