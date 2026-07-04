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
