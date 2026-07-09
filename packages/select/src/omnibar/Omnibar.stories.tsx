import type { Meta, StoryObj } from "@storybook/react";
import { Omnibar } from "./Omnibar.js";

const meta: Meta = { title: "Select/Omnibar" };
export default meta;
export const CommandK: StoryObj = {
  render: () => (
    <>
      <p style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>⌘K / Ctrl+K to open</p>
      <Omnibar
        defaultIsOpen
        items={["Hedgehop", "Nucaps", "Innomy", "Cocuus", "Poseidona", "Ekonoke"]}
        getItemLabel={(s) => s}
        onItemSelect={() => {}}
        placeholder="Jump to holding…"
      />
    </>
  ),
};
