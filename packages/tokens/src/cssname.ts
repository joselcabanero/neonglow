/** camelCase token key -> CSS custom property name. surfaceSunken2 -> --surface-sunken-2 */
export function cssVarName(key: string): string {
  return "--" + key.replace(/([A-Z]|\d+)/g, (m) => "-" + m.toLowerCase());
}
