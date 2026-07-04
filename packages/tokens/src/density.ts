const defaults = { controlH: "36px", rowH: "48px", padX: "12px", padY: "8px" };
const compact  = { controlH: "24px", rowH: "36px", padX: "8px",  padY: "4px" };
export type DensityTokens = typeof defaults;
export const densities = { default: defaults, compact };
