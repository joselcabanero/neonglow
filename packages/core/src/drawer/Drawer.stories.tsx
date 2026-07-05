import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Drawer } from "./Drawer.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof Drawer> = { title: "Core/Drawer", component: Drawer };
export default meta;
export const Right: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Holding details</Button>
        <Drawer isOpen={open} onClose={() => setOpen(false)} title="Hedgehop — holding detail">
          <p>Spain · Agritech · Indoor hop farming</p>
          <p>Entry Jul 2020 · Exit Dec 2022 · 29 months hold</p>
        </Drawer>
      </>
    );
  },
};
