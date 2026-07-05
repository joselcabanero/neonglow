import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "./Dialog.js";
import { Button } from "../button/Button.js";
import { FormGroup } from "../form/FormGroup.js";
import { NumericInput } from "../form/NumericInput.js";

const meta: Meta<typeof Dialog> = { title: "Core/Dialog", component: Dialog };
export default meta;
export const Open: StoryObj = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Record valuation</Button>
        <Dialog
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Record valuation"
          actions={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>Save valuation</Button>
            </>
          }
        >
          <p style={{ marginTop: 0 }}>Set the Q4 2026 fair value for Innomy. This updates blended MOIC across the fund.</p>
          <FormGroup label="Fair value" labelFor="dlg-fv">
            <NumericInput id="dlg-fv" defaultValue="€410,000" />
          </FormGroup>
        </Dialog>
      </>
    );
  },
};
