import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "./Breadcrumbs.js";

const meta: Meta<typeof Breadcrumbs> = { title: "Core/Breadcrumbs", component: Breadcrumbs };
export default meta;
export const Default: StoryObj = {
  render: () => <Breadcrumbs items={[{ text: "Funds", href: "#" }, { text: "Foodtech I", href: "#" }, { text: "Portfolio" }]} />,
};
