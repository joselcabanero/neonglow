import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select.js";

const meta: Meta = { title: "Select/Select" };
export default meta;
export const Sectors: StoryObj = {
  render: () => (
    <Select
      items={["Agritech", "Foodtech", "Logistics", "Deep tech"]}
      getItemLabel={(s) => s}
      defaultValue="Foodtech"
      placeholder="Sector"
    />
  ),
};
