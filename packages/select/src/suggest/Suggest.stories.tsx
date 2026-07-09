import type { Meta, StoryObj } from "@storybook/react";
import { Suggest } from "./Suggest.js";

const meta: Meta = { title: "Select/Suggest" };
export default meta;
export const Companies: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <Suggest
        items={["Hedgehop", "Nucaps", "Innomy", "Cocuus", "Poseidona", "Ekonoke"]}
        getItemLabel={(s) => s}
        placeholder="Jump to company…"
      />
    </div>
  ),
};
