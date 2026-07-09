import type { Meta, StoryObj } from "@storybook/react";
import { QueryList } from "./QueryList.js";

const HOLDINGS = [
  { name: "Hedgehop", sector: "Agritech" },
  { name: "Nucaps", sector: "Foodtech" },
  { name: "Innomy", sector: "Foodtech" },
  { name: "Cocuus", sector: "Foodtech" },
  { name: "Poseidona", sector: "Foodtech" },
  { name: "Ekonoke", sector: "Agritech" },
];

const meta: Meta = { title: "Select/QueryList" };
export default meta;
export const Standalone: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 280, border: "1px solid var(--border-hairline)" }}>
      <QueryList
        items={HOLDINGS}
        getItemLabel={(h) => h.name}
        selected={[HOLDINGS[0]]}
        onItemSelect={() => {}}
        inputPlaceholder="Filter holdings…"
      />
    </div>
  ),
};
