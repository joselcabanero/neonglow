import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";

const meta: Meta<typeof Button> = { title: "Core/Button", component: Button };
export default meta;

export const Variants: StoryObj = {
  render: () => (
    <ButtonGroup>
      <Button variant="primary">Commit capital</Button>
      <Button>Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Write off</Button>
      <Button disabled>Disabled</Button>
    </ButtonGroup>
  ),
};
