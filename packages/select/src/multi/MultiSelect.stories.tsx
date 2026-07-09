import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "./MultiSelect.js";

const meta: Meta = { title: "Select/MultiSelect" };
export default meta;
export const Sectors: StoryObj = {
  render: () => (
    <MultiSelect
      items={["Agritech", "Foodtech", "Logistics", "Deep tech"]}
      getItemLabel={(s) => s}
      defaultValues={["Agritech", "Foodtech"]}
      placeholder="Filter sectors"
    />
  ),
};
