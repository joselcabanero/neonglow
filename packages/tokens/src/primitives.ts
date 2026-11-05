export const primitives = {
  fontSans: "'Ubuntu', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontMono: "'Ubuntu Mono', ui-monospace, 'SF Mono', Menlo, monospace",
  green: "#7BF076",
  greenHover: "#6de066",
  greenPress: "#5fd158",
  // Neon glow palette — five chart series, fixed order, never cycled.
  // Bright set for ink surfaces; deep set for paper (all ≥3:1 on white).
  neonGreen: "#7BF076", neonCyan: "#2FD4FF", neonViolet: "#B794FF",
  neonAmber: "#FFC94A", neonEmber: "#FF8A3D",
  deepGreen: "#1F9A1F", deepCyan: "#0077C8", deepViolet: "#7C4DFF",
  deepAmber: "#C27C00", deepEmber: "#D9640F",
  // Green-tinted dark surfaces
  night: "#0D1A12", moss: "#16301F",
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
