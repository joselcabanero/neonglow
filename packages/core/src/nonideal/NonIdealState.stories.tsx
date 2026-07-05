import type { Meta, StoryObj } from "@storybook/react";
import { IconSearch } from "@neonglow/icons";
import { NonIdealState } from "./NonIdealState.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof NonIdealState> = { title: "Core/NonIdealState", component: NonIdealState };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <NonIdealState
      icon={<IconSearch size={20} />}
      title="No holdings match"
      description="Adjust the sector filter to see more companies."
      action={<Button>Clear filters</Button>}
    />
  ),
};
