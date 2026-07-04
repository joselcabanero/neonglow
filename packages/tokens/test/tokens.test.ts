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
