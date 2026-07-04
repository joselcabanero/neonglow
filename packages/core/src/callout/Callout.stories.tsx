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
