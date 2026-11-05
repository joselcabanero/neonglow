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
  series1: p.deepGreen as string, series2: p.deepCyan as string, series3: p.deepViolet as string,
  series4: p.deepAmber as string, series5: p.deepEmber as string,
};

const dark: typeof light = {
  surface: "#0a0a0a",
  surfaceRaised: p.night,
  surfaceSunken: "#0b130e",
  surfaceSunken2: p.moss,
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
  series1: p.neonGreen, series2: p.neonCyan, series3: p.neonViolet,
  series4: p.neonAmber, series5: p.neonEmber,
};

export type SemanticTokens = typeof light;
export const themes = { light, dark };
