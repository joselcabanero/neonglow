import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs.js";

const meta: Meta<typeof Tabs> = { title: "Core/Tabs", component: Tabs };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <Tabs
      tabs={[
        { id: "overview", title: "Overview", panel: <p>Across two vehicles, we have deployed €4.15M into 35 portfolio companies.</p> },
        { id: "holdings", title: "Holdings", panel: <p>35 companies · blended 1.47×.</p> },
        { id: "cash", title: "Cashflows", panel: <p>€152K → €797K.</p> },
        { id: "docs", title: "Documents", disabled: true },
      ]}
    />
  ),
};
