import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "./Popover.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof Popover> = { title: "Core/Popover", component: Popover };
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: 48 }}>
      <Popover defaultIsOpen content={<div style={{ padding: 16, maxWidth: 260 }}>Spain SPV 2.09× · Fund I 1.27× at 2-year maturity.</div>}>
        <Button>Blended 1.47×</Button>
      </Popover>
    </div>
  ),
};
