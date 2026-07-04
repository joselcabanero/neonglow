import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox.js";
import { Radio } from "./Radio.js";
import { Switch } from "./Switch.js";

const meta: Meta = { title: "Core/Selection" };
export default meta;

export const Controls: StoryObj = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <Checkbox label="Lead" defaultChecked />
      <Checkbox label="Follow-on" />
      <Checkbox label="All holdings" indeterminate />
      <Radio name="vehicle" label="SPV" defaultChecked />
      <Radio name="vehicle" label="Fund" />
      <Switch label="Reserved" defaultChecked />
    </div>
  ),
};
