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
