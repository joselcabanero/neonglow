import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof Tooltip> = { title: "Core/Tooltip", component: Tooltip };
export default meta;
export const OnButton: StoryObj = {
  render: () => (
    <div style={{ padding: 48 }}>
      <Tooltip content="Spain SPV 2.09× · Fund I 1.27×">
        <Button>Blended 1.47×</Button>
      </Tooltip>
    </div>
  ),
};
