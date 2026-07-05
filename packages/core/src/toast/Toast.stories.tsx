import type { Meta, StoryObj } from "@storybook/react";
import { toaster } from "./toaster.js";
import { Toaster } from "./Toaster.js";
import { Button } from "../button/Button.js";

const meta: Meta<typeof Toaster> = { title: "Core/Toast", component: Toaster };
export default meta;
export const Interactive: StoryObj = {
  render: () => (
    <>
      <Toaster />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button onClick={() => toaster.show({ message: "Valuation saved. Blended MOIC is now 1.47×.", intent: "success", timeout: 0 })}>Success</Button>
        <Button onClick={() => toaster.show({ message: "Two positions have no fresh round in 18 months.", intent: "warning", timeout: 0 })}>Warning</Button>
        <Button onClick={() => toaster.show({ message: "Write-off recorded.", intent: "danger", timeout: 0 })}>Danger</Button>
      </div>
    </>
  ),
};
